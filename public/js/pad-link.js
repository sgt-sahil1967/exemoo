/**
 * Phone side of the link, used by /pad. Mirrors table-tennis/src/controller/main.ts:
 *
 *  - Joins the PIN room on /signal. When the screen is present, offers WebRTC with two data
 *    channels: 'sensor' (unordered, no retransmits, SEN2 binary) and 'control' (reliable JSON).
 *  - If the data channel doesn't open within rtcTimeoutMs (or WebRTC fails / is missing), falls
 *    back to the server relay: binary WS frames + {type:'relay', payload}.
 *
 * Staying connected (the phone is the flakiest device in the room):
 *  - Heartbeat on the signalling socket (net-watch Liveness): a socket that dies without a FIN
 *    (Wi-Fi ↔ cellular switch, sleep) is detected within ~wsDeadMs and reopened.
 *  - Reconnects with jittered exponential backoff; a server restart (close code 1012) reconnects
 *    almost at once.
 *  - The pairing (PIN + the server's controller resume key) is kept in sessionStorage, so a reloaded
 *    pad rejoins the same screen without re-entering the PIN. While a pairing is being resumed, a
 *    missing room (screen reloading, server restarting) is retried for resumeWindowMs instead of
 *    giving up.
 *  - If the WebRTC data channel goes silent (no screen message for screenStallMs) the phone falls
 *    back to the relay at once, tells the screen ({t:'transport', via:'relay'}), and later tries to
 *    upgrade back to a direct link.
 *  - Page lifecycle: a tab that comes back from the background, a network change, or a bfcache
 *    restore probes / reopens the socket right away.
 *
 * Events: 'status' (status, detail) · 'message' (screen JSON)
 * status: connecting | waiting | negotiating | connected | lost | gone
 */
import { Emitter, STUN, defaultSignalUrl } from './protocol.js';
import { Liveness, backoffDelay, session, watchPage } from './net-watch.js';

const DEFAULTS = {
  rtcTimeoutMs: 5000,
  /** App-level ping to the screen (latency, and proof the screen path works). */
  pingMs: 2000,
  /** Signalling socket heartbeat. */
  wsPingMs: 5000,
  wsDeadMs: 12000,
  /** No message from the screen over WebRTC for this long → relay. */
  screenStallMs: 6000,
  /** After a fallback to the relay, retry a direct link after this long (doubles, 3 tries). */
  upgradeAfterMs: 10000,
  /** Keep looking for a vanished room this long when resuming a pairing. */
  resumeWindowMs: 10 * 60_000,
  retryBaseMs: 500,
  retryMaxMs: 8000,
  /** sessionStorage key of the saved pairing ({pin, resume, at}). */
  storageKey: 'exemoo.pad',
  /** A saved pairing older than this is not resumed automatically. */
  savedTtlMs: 30 * 60_000,
};

export class PadLink extends Emitter {
  status = 'connecting';
  /** 'webrtc' | 'relay' | 'none' */
  transport = 'none';
  latencyMs = 0;
  everConnected = false;
  /** Reconnect attempts since the link was last up (for the UI). */
  attempts = 0;

  #o;
  #signalUrl;
  #pin = '';
  #resume = '';
  #resuming = false;
  #lookingSince = 0;
  #ws = null;
  #token = '';
  #retry = 0;
  #reconnectTimer = null;
  #pingTimer = null;
  #live;
  #unwatch = null;
  #pc = null;
  #sensor = null;
  #control = null;
  #pending = [];
  #remoteSet = false;
  #rtcTimer = null;
  #rtcWorked = false;
  #upgradeTimer = null;
  #upgradeTries = 0;
  #lastScreenRx = 0;
  #peerPresent = false;
  #lastPersist = 0;

  constructor({ signalUrl, iceServers = STUN, useWebRTC = true, ...opts } = {}) {
    super();
    this.#o = { ...DEFAULTS, ...opts };
    this.#signalUrl = signalUrl ?? defaultSignalUrl();
    this.iceServers = iceServers;
    this.useWebRTC = useWebRTC;
    this.#live = new Liveness({
      pingMs: this.#o.wsPingMs,
      deadMs: this.#o.wsDeadMs,
      ping: () => this.#signal({ type: 'ping' }),
      onDead: () => this.#socketDown(this.#ws, 'Connection stalled. Reconnecting...', true),
    });
  }

  get pin() {
    return this.#pin;
  }

  get connected() {
    return this.status === 'connected';
  }

  /** True when this tab was recently paired with `pin` (a reload): it may reconnect without a tap. */
  canResume(pin) {
    const saved = session.get(this.#o.storageKey);
    return !!saved && saved.pin === String(pin) && Date.now() - (saved.at || 0) < this.#o.savedTtlMs;
  }

  /** Join `pin` (or the current PIN). Idempotent while already joining/joined that PIN. */
  connect(pin) {
    const p = String(pin ?? this.#pin).replace(/\D/g, '');
    if (p === this.#pin && this.#ws && this.status !== 'gone') return;
    if (p !== this.#pin || this.status === 'gone') {
      this.#pin = p;
      const saved = session.get(this.#o.storageKey);
      const fresh = this.canResume(p);
      this.#resume = fresh ? String(saved.resume || '') : '';
      this.#resuming = fresh;
    }
    this.#lookingSince = 0;
    this.#retry = 0;
    this.#unwatch ??= watchPage({
      onVisible: () => this.#wake(3000),
      onOnline: () => this.#wake(2500),
      onRestore: () => this.#reopenNow(),
      onHide: () => this.#persist(),
    });
    this.#open();
  }

  close() {
    this.#setStatus('gone', 'Closed');
    clearTimeout(this.#reconnectTimer);
    this.#reconnectTimer = null;
    this.#stopPing();
    this.#unwatch?.();
    this.#unwatch = null;
    this.#closePeer();
    this.#dropSocket();
  }

  /** Forget the saved pairing (e.g. the user typed a different PIN). */
  forget() {
    session.remove(this.#o.storageKey);
    this.#resume = '';
    this.#resuming = false;
  }

  /** Reliable JSON to the screen. */
  send(msg) {
    if (this.transport === 'webrtc' && this.#control?.readyState === 'open') {
      try {
        this.#control.send(JSON.stringify(msg));
        return true;
      } catch {
        /* fall through */
      }
    }
    if (this.transport === 'relay' && this.#ws?.readyState === 1) {
      this.#ws.send(JSON.stringify({ type: 'relay', token: this.#token, payload: msg }));
      return true;
    }
    return false;
  }

  /** Real-time binary (SEN2). Dropped rather than queued when the channel is backed up. */
  sendSensor(buf) {
    if (this.transport === 'webrtc' && this.#sensor?.readyState === 'open') {
      if (this.#sensor.bufferedAmount < 16 * 1024) this.#sensor.send(buf);
      return true;
    }
    if (this.transport === 'relay' && this.#ws?.readyState === 1) {
      if (this.#ws.bufferedAmount < 32 * 1024) this.#ws.send(buf);
      return true;
    }
    return false;
  }

  // ─────────────────────────────── internals ───────────────────────────────
  #setStatus(s, detail, transport) {
    const before = this.status === 'connected' ? this.transport : 'none';
    this.status = s;
    this.transport = s === 'connected' ? transport ?? this.transport : 'none';
    const now = this.status === 'connected' ? this.transport : 'none';
    if (s === 'connected') {
      this.attempts = 0;
      this.#lookingSince = 0;
    }
    if (now !== 'none' && now !== before) {
      this.everConnected = true;
      this.#resuming = true;
      this.#lastScreenRx = Date.now();
      this.#persist();
      if (!this.#pingTimer) this.#pingTimer = setInterval(() => this.#pingTick(), this.#o.pingMs);
    }
    this.emit('status', s, detail);
  }

  #stopPing() {
    clearInterval(this.#pingTimer);
    this.#pingTimer = null;
    clearTimeout(this.#upgradeTimer);
    this.#upgradeTimer = null;
  }

  #persist() {
    if (!this.#pin || !this.everConnected) return;
    this.#lastPersist = Date.now();
    session.set(this.#o.storageKey, { pin: this.#pin, resume: this.#resume, at: this.#lastPersist });
  }

  #signal(msg) {
    if (this.#ws?.readyState !== 1) return false;
    this.#ws.send(JSON.stringify({ ...msg, token: this.#token }));
    return true;
  }

  #dropSocket() {
    const old = this.#ws;
    this.#ws = null;
    this.#token = '';
    this.#peerPresent = false;
    this.#live.stop();
    if (old) {
      old.onclose = old.onmessage = old.onerror = old.onopen = null;
      try {
        old.close();
      } catch {
        /* ignore */
      }
    }
  }

  #open() {
    clearTimeout(this.#reconnectTimer);
    this.#reconnectTimer = null;
    this.#dropSocket();
    this.#closePeer();
    if (this.status !== 'lost') this.#setStatus('connecting');
    let sock;
    try {
      sock = new WebSocket(this.#signalUrl);
    } catch {
      return this.#socketDown(null, 'Cannot reach the server. Retrying...');
    }
    sock.binaryType = 'arraybuffer';
    this.#ws = sock;
    sock.onopen = () => {
      sock.send(JSON.stringify({ type: 'join_room', room: this.#pin, resume: this.#resume || undefined }));
      this.#live.start();
    };
    sock.onmessage = (ev) => {
      this.#live.seen();
      if (typeof ev.data !== 'string') return;
      let m;
      try {
        m = JSON.parse(ev.data);
      } catch {
        return;
      }
      this.#onSignal(m);
    };
    sock.onclose = (ev) => {
      // 1012 = the server is restarting (deploy): come back quickly.
      this.#socketDown(sock, 'Connection lost. Reconnecting...', ev?.code === 1012);
    };
  }

  /** The signalling socket is gone (closed, or declared dead by the heartbeat). */
  #socketDown(sock, text, fast = false) {
    if (sock && this.#ws !== sock) return;
    this.#dropSocket();
    if (this.status === 'gone') return;
    // The screen drops the direct link when it hears we left, so renegotiate from scratch.
    this.#closePeer();
    this.#setStatus('lost', text);
    if (fast) this.#retry = 0;
    this.#scheduleReconnect(fast ? 150 + Math.random() * 600 : undefined);
  }

  #scheduleReconnect(delay) {
    if (this.#reconnectTimer || this.status === 'gone') return;
    const d = delay ?? backoffDelay(this.#retry++, this.#o.retryBaseMs, this.#o.retryMaxMs);
    this.attempts++;
    this.#reconnectTimer = setTimeout(() => {
      this.#reconnectTimer = null;
      this.#open();
    }, d);
  }

  /** Page came back / network changed: verify the socket now instead of waiting for a timeout. */
  #wake(ms) {
    if (this.status === 'gone' || !this.#pin) return;
    if (this.#reconnectTimer) return this.#reopenNow();
    if (this.#ws?.readyState === 1) this.#live.probe(ms);
    else if (!this.#ws) this.#reopenNow();
  }

  #reopenNow() {
    if (this.status === 'gone' || !this.#pin) return;
    this.#retry = 0;
    this.#open();
  }

  #gone(text, forget = false) {
    if (forget) this.forget();
    this.#closePeer();
    this.#stopPing();
    clearTimeout(this.#reconnectTimer);
    this.#reconnectTimer = null;
    this.#setStatus('gone', text);
    this.#dropSocket();
  }

  /** Room missing or rate limited while resuming: keep looking for a while. */
  #keepLooking(text, delay) {
    const now = Date.now();
    if (!this.#lookingSince) this.#lookingSince = now;
    if (now - this.#lookingSince > this.#o.resumeWindowMs) return false;
    this.#dropSocket();
    this.#setStatus('lost', text);
    this.#scheduleReconnect(delay);
    return true;
  }

  #onSignal(m) {
    switch (m.type) {
      case 'joined':
        this.#token = String(m.token || '');
        if (typeof m.resume === 'string') this.#resume = m.resume;
        this.#retry = 0;
        this.#lookingSince = 0;
        this.#persist();
        if (!m.peer) this.#setStatus('waiting', this.everConnected ? 'Screen disconnected. Waiting for it to come back...' : 'Waiting for the screen...');
        break;
      case 'peer_connected':
        if (m.role === 'game') {
          this.#peerPresent = true;
          this.#startRtc().catch(() => this.#useRelay());
        }
        break;
      case 'peer_disconnected':
        if (m.role === 'game') {
          this.#peerPresent = false;
          this.#closePeer();
          this.#setStatus('waiting', 'Screen disconnected. Waiting for it to come back...');
        }
        break;
      case 'answer':
        if (this.#pc && typeof m.sdp === 'string') {
          const pc = this.#pc;
          pc.setRemoteDescription({ type: 'answer', sdp: m.sdp })
            .then(async () => {
              this.#remoteSet = true;
              for (const c of this.#pending.splice(0)) await pc.addIceCandidate(c).catch(() => {});
            })
            .catch(() => this.#useRelay());
        }
        break;
      case 'candidate':
        if (typeof m.name === 'string' && m.name) {
          const c = { candidate: m.name, sdpMid: m.media ?? null, sdpMLineIndex: m.index ?? null };
          if (this.#pc && this.#remoteSet) this.#pc.addIceCandidate(c).catch(() => {});
          else this.#pending.push(c);
        }
        break;
      case 'relay':
        if (m.payload && typeof m.payload === 'object') this.#onScreen(m.payload);
        break;
      case 'replaced':
        // Another device (or tab) joined with this PIN. Don't auto-rejoin, or the two would fight.
        this.#gone('This controller was opened on another device.', true);
        break;
      case 'room_closed':
      case 'room_expired':
        this.#gone('The screen closed this room. Scan the new QR code.', true);
        break;
      case 'error':
        if (m.code === 'room_not_found') {
          // Screen reloading, laptop asleep, server restarting: the room comes back with the same PIN.
          if (this.#resuming && this.#keepLooking('Looking for the screen...')) break;
          this.#gone('That PIN is not active. Scan the QR code on the screen again.', true);
        } else if (m.code === 'rate_limited') {
          if (this.#resuming && this.#keepLooking('Server busy. Retrying...', 30_000 + Math.random() * 5000)) break;
          this.#gone(String(m.message));
        }
        break;
      default:
        break;
    }
  }

  #onScreen(m) {
    this.#lastScreenRx = Date.now();
    // pt = this phone's clock (same base as the SEN2 `t` field), for the screen's clock sync.
    if (m.t === 'ping') return this.send({ t: 'pong', ts: m.ts, pt: performance.now() });
    if (m.t === 'pong') {
      const rtt = performance.now() - m.ts;
      if (rtt >= 0 && rtt < 5000) this.latencyMs = this.latencyMs ? this.latencyMs * 0.8 + (rtt / 2) * 0.2 : rtt / 2;
      return;
    }
    this.emit('message', m);
  }

  #pingTick() {
    if (this.status !== 'connected') return;
    this.send({ t: 'ping', ts: performance.now() });
    const now = Date.now();
    if (now - this.#lastPersist > 30_000) this.#persist();
    // A silent direct link (path changed, NAT rebinding): switch to the relay instead of hanging.
    if (this.transport === 'webrtc' && now - this.#lastScreenRx > this.#o.screenStallMs) {
      this.#closePeer();
      if (this.#ws?.readyState === 1 && this.#peerPresent) {
        this.#setStatus('connected', undefined, 'relay');
        this.send({ t: 'transport', via: 'relay' });
        this.#scheduleUpgrade();
      } else this.#socketDown(this.#ws, 'Connection lost. Reconnecting...', true);
    }
  }

  /** Back on the relay after a direct link worked: try the direct link again later. */
  #scheduleUpgrade() {
    clearTimeout(this.#upgradeTimer);
    if (!this.#rtcWorked || this.#upgradeTries >= 3) return;
    const delay = this.#o.upgradeAfterMs * 2 ** this.#upgradeTries++;
    this.#upgradeTimer = setTimeout(() => {
      this.#upgradeTimer = null;
      if (this.status === 'connected' && this.transport === 'relay' && this.#peerPresent) this.#startRtc().catch(() => {});
    }, delay);
  }

  #useRelay() {
    if (this.status === 'gone' || this.#ws?.readyState !== 1) return;
    if (this.status === 'connected') return; // already on the relay, or direct
    this.#setStatus('connected', undefined, 'relay');
  }

  #closePeer() {
    clearTimeout(this.#rtcTimer);
    this.#rtcTimer = null;
    const pc = this.#pc;
    this.#pc = this.#sensor = this.#control = null;
    this.#remoteSet = false;
    this.#pending = [];
    if (pc) {
      pc.onicecandidate = pc.oniceconnectionstatechange = null;
      try {
        pc.close();
      } catch {
        /* ignore */
      }
    }
  }

  async #startRtc() {
    // Upgrading from a working relay keeps using it until the direct link is up.
    const upgrading = this.status === 'connected' && this.transport === 'relay';
    this.#closePeer();
    if (!this.useWebRTC || typeof RTCPeerConnection === 'undefined') return this.#useRelay();
    if (!upgrading) this.#setStatus('negotiating', 'Connecting to the screen...');
    const pc = new RTCPeerConnection({ iceServers: this.iceServers });
    this.#pc = pc;
    const sensor = pc.createDataChannel('sensor', { ordered: false, maxRetransmits: 0 });
    const control = pc.createDataChannel('control', { ordered: true });
    sensor.binaryType = 'arraybuffer';
    this.#sensor = sensor;
    this.#control = control;
    control.onopen = () => {
      if (this.#pc !== pc) return;
      clearTimeout(this.#rtcTimer);
      this.#rtcTimer = null;
      this.#rtcWorked = true;
      this.#upgradeTries = 0;
      this.#lastScreenRx = Date.now();
      this.#setStatus('connected', undefined, 'webrtc');
    };
    control.onclose = () => {
      if (this.#pc !== pc || this.transport !== 'webrtc') return;
      this.#closePeer();
      if (this.#ws?.readyState === 1 && this.#peerPresent) {
        this.#setStatus('connected', undefined, 'relay');
        this.send({ t: 'transport', via: 'relay' });
        this.#scheduleUpgrade();
      } else this.#setStatus('lost', 'Connection lost. Reconnecting...');
    };
    control.onmessage = (ev) => {
      if (typeof ev.data !== 'string') return;
      try {
        this.#onScreen(JSON.parse(ev.data));
      } catch {
        /* ignore */
      }
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) this.#signal({ type: 'candidate', media: e.candidate.sdpMid, index: e.candidate.sdpMLineIndex, name: e.candidate.candidate });
    };
    pc.oniceconnectionstatechange = () => {
      if (this.#pc !== pc) return;
      const s = pc.iceConnectionState;
      if (s === 'failed') {
        if (this.transport === 'webrtc') control.onclose();
        else if (upgrading) this.#closePeer();
        else this.#useRelay();
      }
    };
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.#signal({ type: 'offer', sdp: offer.sdp });
    this.#rtcTimer = setTimeout(() => {
      this.#rtcTimer = null;
      if (this.#pc !== pc || control.readyState === 'open') return;
      if (upgrading) {
        this.#closePeer();
        this.#scheduleUpgrade();
      } else this.#useRelay();
    }, this.#o.rtcTimeoutMs);
  }
}
