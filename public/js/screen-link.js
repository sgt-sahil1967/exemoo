/**
 * Screen side of the phone link (the Exemoo shell owns one for the whole session).
 * Port of table-tennis/src/net/phoneLink.ts.
 *
 *  - Creates a six-digit PIN room on /signal and keeps it across reloads (sessionStorage resume key)
 *    and signalling reconnects.
 *  - Answers the phone's WebRTC offer; receives 'sensor' (unreliable, SEN2 binary) and 'control'
 *    (reliable JSON) data channels.
 *  - Relay fallback: sensor packets as binary WS frames, control as {type:'relay', payload}.
 *  - Ping/pong latency over the control path, plus phone clock sync: the phone's pong carries its own
 *    clock (`pt`), and the lowest-RTT sample of the last 16 gives `phoneClockOffsetMs`
 *    (phone − screen), so a SEN2 packet's `t` maps to screen time with `phoneTimeToLocal`.
 *
 *  - Staying connected: heartbeat on the signalling socket (net-watch Liveness) so a socket that
 *    dies without a FIN is reopened in ~12 s, jittered backoff, fast reconnect on close code 1012
 *    (server restart: the room is re-created with the same PIN), and a check on tab visible /
 *    online / bfcache restore. A phone that gives up on a silent direct link sends
 *    {t:'transport', via:'relay'}; the screen then drops its WebRTC side too.
 *
 * Events: 'status' (status, detail) · 'packet' (decoded SEN2) · 'message' (phone JSON) · 'room' (pin)
 * status: idle | connecting | waiting | pairing | connected | disconnected | error
 */
import { Emitter, STUN, decodePacket, defaultSignalUrl } from './protocol.js';
import { Liveness, backoffDelay, watchPage } from './net-watch.js';

const PING_MS = 1000;
const STALL_MS = 3500;
/** Signalling heartbeat: ping every wsPingMs, socket declared dead wsDeadMs after an unanswered ping. */
const WS_PING_MS = 5000;
const WS_DEAD_MS = 12000;

export class ScreenLink extends Emitter {
  pin = '';
  status = 'idle';
  /** 'webrtc' | 'relay' | 'none' */
  transport = 'none';
  latencyMs = 0;
  packetRate = 0;
  /** Phone clock − screen clock (ms), from the lowest-RTT ping; valid once `clockRttMs` ≥ 0. */
  phoneClockOffsetMs = 0;
  clockRttMs = -1;

  #signalUrl;
  #storageKey;
  #ws = null;
  #token = '';
  #resume = '';
  #stopped = true;
  #peerPresent = false;
  #pc = null;
  #control = null;
  #pending = [];
  #remoteSet = false;
  #relaySeen = false;
  #lastRx = 0;
  #detail;
  #retry = 0;
  #reconnectTimer = null;
  #tickTimer = null;
  #live;
  #unwatch = null;
  #lastPing = 0;
  #pingBurst = 0;
  #clockSamples = [];
  #rateCount = 0;
  #rateT0 = 0;

  constructor({ signalUrl, storageKey = 'exemoo.room', iceServers = STUN, wsPingMs = WS_PING_MS, wsDeadMs = WS_DEAD_MS, retryBaseMs = 500, retryMaxMs = 8000 } = {}) {
    super();
    this.#signalUrl = signalUrl ?? defaultSignalUrl();
    this.#storageKey = storageKey;
    this.iceServers = iceServers;
    this.retryBaseMs = retryBaseMs;
    this.retryMaxMs = retryMaxMs;
    this.#live = new Liveness({
      pingMs: wsPingMs,
      deadMs: wsDeadMs,
      ping: () => this.#signal({ type: 'ping' }),
      onDead: () => this.#wsDown(this.#ws, 'Connection stalled. Reconnecting...'),
    });
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      if (saved && typeof saved.pin === 'string' && typeof saved.resume === 'string') {
        this.pin = saved.pin;
        this.#resume = saved.resume;
      }
    } catch {
      /* no storage */
    }
  }

  get connected() {
    return this.status === 'connected';
  }

  start() {
    if (!this.#stopped) return;
    this.#stopped = false;
    this.#retry = 0;
    this.#connect();
    this.#tickTimer = setInterval(() => this.#tick(), 250);
    this.#unwatch = watchPage({
      onVisible: () => this.#wake(3000),
      onOnline: () => this.#wake(2500),
      onRestore: () => this.#reconnectNow(),
    });
  }

  stop() {
    this.#stopped = true;
    clearTimeout(this.#reconnectTimer);
    clearInterval(this.#tickTimer);
    this.#reconnectTimer = this.#tickTimer = null;
    this.#live.stop();
    this.#unwatch?.();
    this.#unwatch = null;
    this.#closePeer();
    const ws = this.#ws;
    this.#ws = null;
    if (ws) {
      ws.onclose = ws.onmessage = ws.onerror = ws.onopen = null;
      try {
        ws.close();
      } catch {
        /* ignore */
      }
    }
    this.#peerPresent = false;
    this.#setStatus('idle', undefined, 'none');
  }

  /** Send a control message to the phone (WebRTC control channel, else relay). */
  send(msg) {
    if (this.#control?.readyState === 'open') {
      try {
        this.#control.send(JSON.stringify(msg));
        return true;
      } catch {
        /* fall through to relay */
      }
    }
    if (this.#peerPresent) return this.#signal({ type: 'relay', payload: msg });
    return false;
  }

  // ─────────────────────────────── internals ───────────────────────────────
  #setStatus(s, detail, transport) {
    const t = transport ?? this.transport;
    if (s === this.status && detail === this.#detail && t === this.transport) return;
    this.status = s;
    this.#detail = detail;
    this.transport = t;
    this.emit('status', s, detail);
  }

  #signal(msg) {
    const ws = this.#ws;
    if (!ws || ws.readyState !== 1) return false;
    ws.send(JSON.stringify({ ...msg, token: this.#token }));
    return true;
  }

  #persist() {
    try {
      sessionStorage.setItem(this.#storageKey, JSON.stringify({ pin: this.pin, resume: this.#resume }));
    } catch {
      /* ignore */
    }
  }

  #connect() {
    if (this.#stopped) return;
    if (this.status !== 'disconnected') this.#setStatus('connecting');
    let ws;
    try {
      ws = new WebSocket(this.#signalUrl);
    } catch (e) {
      this.#setStatus('error', `Bad signalling URL: ${e.message}`, 'none');
      return this.#scheduleReconnect();
    }
    ws.binaryType = 'arraybuffer';
    this.#ws = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'create_room', pin: this.pin || undefined, resume: this.#resume || undefined }));
      this.#live.start();
    };
    ws.onmessage = (ev) => {
      this.#live.seen();
      if (typeof ev.data === 'string') {
        let m;
        try {
          m = JSON.parse(ev.data);
        } catch {
          return;
        }
        this.#onSignal(m);
      } else if (ev.data instanceof ArrayBuffer) {
        this.#onRelayActivity();
        this.#onBinary(ev.data);
      }
    };
    // 1012 = the server is restarting (deploy): come back quickly.
    ws.onclose = (ev) => this.#wsDown(ws, 'Lost connection to the server. Retrying...', ev?.code === 1012);
  }

  /** The signalling socket closed, or the heartbeat declared it dead (no FIN: Wi-Fi switch, sleep). */
  #wsDown(ws, text, fast = false) {
    if (!ws || this.#ws !== ws) return;
    this.#ws = null;
    this.#token = '';
    this.#live.stop();
    ws.onclose = ws.onmessage = ws.onerror = ws.onopen = null;
    try {
      ws.close();
    } catch {
      /* ignore */
    }
    if (this.#stopped) return;
    // A live WebRTC session can survive a signalling hiccup; only drop the relay path.
    if (this.#control?.readyState !== 'open') {
      this.#closePeer();
      this.#peerPresent = false;
      this.#setStatus('disconnected', text, 'none');
    }
    if (fast) this.#retry = 0;
    this.#scheduleReconnect(fast ? 150 + Math.random() * 600 : undefined);
  }

  #scheduleReconnect(delay) {
    if (this.#stopped || this.#reconnectTimer) return;
    const d = delay ?? backoffDelay(this.#retry++, this.retryBaseMs, this.retryMaxMs);
    this.#reconnectTimer = setTimeout(() => {
      this.#reconnectTimer = null;
      this.#connect();
    }, d);
  }

  /** Tab visible again / network back: check the socket now instead of waiting for the heartbeat. */
  #wake(ms) {
    if (this.#stopped) return;
    if (this.#reconnectTimer) return this.#reconnectNow();
    if (this.#ws?.readyState === 1) this.#live.probe(ms);
  }

  #reconnectNow() {
    if (this.#stopped) return;
    clearTimeout(this.#reconnectTimer);
    this.#reconnectTimer = null;
    this.#retry = 0;
    if (this.#ws) this.#wsDown(this.#ws, 'Reconnecting...', true);
    else this.#connect();
  }

  #onSignal(m) {
    switch (m.type) {
      case 'joined': {
        this.#token = String(m.token || '');
        this.#retry = 0;
        const changed = this.pin !== m.room;
        this.pin = String(m.room || '');
        if (typeof m.resume === 'string') this.#resume = m.resume;
        this.#persist();
        if (changed) this.emit('room', this.pin);
        if (m.peer !== true && this.#control?.readyState !== 'open') this.#setStatus('waiting', undefined, 'none');
        if (m.peer === true) this.#peerPresent = true;
        break;
      }
      case 'peer_connected':
        if (m.role === 'controller') {
          this.#peerPresent = true;
          if (this.#control?.readyState !== 'open') this.#setStatus('pairing', 'Phone joined. Connecting...', 'none');
        }
        break;
      case 'peer_disconnected':
        if (m.role === 'controller') this.#onPhoneGone();
        break;
      case 'offer':
        this.#onOffer(String(m.sdp || '')).catch((e) => {
          console.warn('[exemoo] WebRTC offer failed', e);
          this.#setStatus('pairing', 'WebRTC failed. Waiting for relay...', 'none');
        });
        break;
      case 'candidate':
        if (typeof m.name === 'string' && m.name) {
          const c = { candidate: m.name, sdpMid: m.media ?? null, sdpMLineIndex: m.index ?? null };
          if (this.#pc && this.#remoteSet) this.#pc.addIceCandidate(c).catch(() => {});
          else this.#pending.push(c);
        }
        break;
      case 'relay':
        this.#onRelayActivity();
        if (m.payload && typeof m.payload === 'object') this.#onControl(m.payload);
        break;
      case 'room_expired':
      case 'room_closed':
        // Server dropped the room: recreate it (same PIN if still free).
        this.#closePeer();
        this.#peerPresent = false;
        this.#ws?.close();
        break;
      case 'replaced':
        // Another tab (e.g. a duplicated one) took this room over: start a fresh room here.
        this.pin = '';
        this.#resume = '';
        try {
          sessionStorage.removeItem(this.#storageKey);
        } catch {
          /* ignore */
        }
        this.#ws?.close();
        break;
      case 'error':
        console.warn('[exemoo] server error', m.code, m.message);
        if (m.code === 'already_joined' || m.code === 'unauthorized') this.#ws?.close();
        else if (!this.pin) this.#setStatus('error', String(m.message || m.code || 'Server error'), 'none');
        break;
      default:
        break;
    }
  }

  #onPhoneGone() {
    this.#closePeer();
    this.#peerPresent = false;
    this.latencyMs = 0;
    this.#setStatus('waiting', 'Phone disconnected', 'none');
  }

  #onRelayActivity() {
    this.#relaySeen = true;
    this.#peerPresent = true;
    if (this.#control?.readyState !== 'open') this.#markConnected('relay');
  }

  /** Screen `performance.now()` time of a phone timestamp (SEN2 `t`), or null before clock sync. */
  phoneTimeToLocal(phoneMs) {
    return this.clockRttMs >= 0 ? phoneMs - this.phoneClockOffsetMs : null;
  }

  #markConnected(t) {
    this.#lastRx = performance.now();
    if (this.status !== 'connected') {
      // A fresh link (or a phone that reloaded): resync the clock with a quick burst of pings.
      this.#pingBurst = 10;
      this.#clockSamples = [];
      this.clockRttMs = -1;
    }
    if (this.status !== 'connected' || this.transport !== t) this.#setStatus('connected', undefined, t);
  }

  #closePeer() {
    const pc = this.#pc;
    this.#pc = null;
    this.#control = null;
    this.#remoteSet = false;
    this.#pending = [];
    this.#relaySeen = false;
    if (pc) {
      pc.ondatachannel = pc.onicecandidate = pc.oniceconnectionstatechange = null;
      try {
        pc.close();
      } catch {
        /* ignore */
      }
    }
  }

  async #onOffer(sdp) {
    if (typeof RTCPeerConnection === 'undefined') throw new Error('WebRTC unavailable');
    this.#closePeer();
    this.#peerPresent = true;
    const pc = new RTCPeerConnection({ iceServers: this.iceServers });
    this.#pc = pc;
    pc.onicecandidate = (e) => {
      if (e.candidate) this.#signal({ type: 'candidate', media: e.candidate.sdpMid, index: e.candidate.sdpMLineIndex, name: e.candidate.candidate });
    };
    pc.oniceconnectionstatechange = () => {
      if (this.#pc !== pc) return;
      const s = pc.iceConnectionState;
      if ((s === 'failed' || s === 'closed') && this.transport === 'webrtc') {
        this.#control = null;
        if (this.#relaySeen) this.#markConnected('relay');
        else this.#setStatus('pairing', 'Direct connection lost. Trying relay...', 'none');
      }
    };
    pc.ondatachannel = (e) => {
      if (this.#pc !== pc) return;
      const ch = e.channel;
      ch.binaryType = 'arraybuffer';
      if (ch.label === 'control') {
        this.#control = ch;
        ch.onopen = () => this.#markConnected('webrtc');
        ch.onclose = () => {
          if (this.#control !== ch) return;
          this.#control = null;
          if (this.#relaySeen && this.#peerPresent) this.#markConnected('relay');
          else if (this.#peerPresent) this.#setStatus('pairing', 'Reconnecting to phone...', 'none');
        };
        ch.onmessage = (ev) => {
          if (typeof ev.data !== 'string') return;
          try {
            this.#onControl(JSON.parse(ev.data));
          } catch {
            /* ignore junk */
          }
        };
        if (ch.readyState === 'open') this.#markConnected('webrtc');
      } else {
        // 'sensor' (SEN2) or legacy 'sensor_data' (SEN1)
        ch.onmessage = (ev) => {
          if (ev.data instanceof ArrayBuffer) this.#onBinary(ev.data);
        };
        if (ch.label === 'sensor_data') {
          ch.onopen = () => this.#markConnected('webrtc');
          if (ch.readyState === 'open') this.#markConnected('webrtc');
        }
      }
    };
    await pc.setRemoteDescription({ type: 'offer', sdp });
    this.#remoteSet = true;
    for (const c of this.#pending.splice(0)) await pc.addIceCandidate(c).catch(() => {});
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    this.#signal({ type: 'answer', sdp: answer.sdp });
  }

  #onBinary(buf) {
    const p = decodePacket(buf);
    if (!p) return;
    this.#lastRx = performance.now();
    this.#rateCount++;
    if (this.status !== 'connected') this.#markConnected(this.#control?.readyState === 'open' ? 'webrtc' : 'relay');
    this.emit('packet', p);
  }

  #onControl(m) {
    this.#lastRx = performance.now();
    if (m.t === 'pong' && typeof m.ts === 'number') {
      const rtt = performance.now() - m.ts;
      if (rtt >= 0 && rtt < 5000) this.latencyMs = this.latencyMs ? this.latencyMs * 0.8 + (rtt / 2) * 0.2 : rtt / 2;
      if (rtt >= 0 && rtt < 5000 && typeof m.pt === 'number') this.#addClockSample(rtt, m.pt - (m.ts + rtt / 2));
      return;
    }
    if (m.t === 'ping' && typeof m.ts === 'number') {
      this.send({ t: 'pong', ts: m.ts });
      return;
    }
    if (m.t === 'transport') {
      // The phone gave up on a silent direct link and moved to the relay: drop ours too, or our
      // messages would keep going into the dead data channel.
      if (m.via === 'relay' && this.#control) {
        this.#closePeer();
        this.#relaySeen = true;
      }
      this.#markConnected(this.#control?.readyState === 'open' ? 'webrtc' : 'relay');
      return;
    }
    if (this.status !== 'connected') this.#markConnected(this.#control?.readyState === 'open' ? 'webrtc' : 'relay');
    if (typeof m.t === 'string') this.emit('message', m);
  }

  /** The lowest-RTT sample has the least asymmetry error in its half-RTT assumption (NTP-style). */
  #addClockSample(rtt, offset) {
    this.#clockSamples.push({ rtt, offset });
    if (this.#clockSamples.length > 16) this.#clockSamples.shift();
    const best = this.#clockSamples.reduce((a, b) => (b.rtt < a.rtt ? b : a));
    this.clockRttMs = best.rtt;
    this.phoneClockOffsetMs = best.offset;
  }

  #tick() {
    const now = performance.now();
    if (now - this.#rateT0 >= 1000) {
      this.packetRate = Math.round((this.#rateCount * 1000) / (now - this.#rateT0 || 1000));
      this.#rateCount = 0;
      this.#rateT0 = now;
    }
    if (!this.#peerPresent) return;
    if (this.#pingBurst > 0 || now - this.#lastPing >= PING_MS) {
      if (this.#pingBurst > 0) this.#pingBurst--;
      this.#lastPing = now;
      this.send({ t: 'ping', ts: now });
    }
    if (this.status === 'connected' && now - this.#lastRx > STALL_MS) {
      this.#setStatus('pairing', 'Phone not responding...', this.transport);
    } else if (this.status === 'pairing' && this.transport !== 'none' && now - this.#lastRx < 500) {
      this.#setStatus('connected', undefined, this.transport);
    }
  }
}
