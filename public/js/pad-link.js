/**
 * Phone side of the link, used by /pad. Mirrors table-tennis/src/controller/main.ts:
 *
 *  - Joins the PIN room on /signal. When the screen is present, offers WebRTC with two data
 *    channels: 'sensor' (unordered, no retransmits, SEN2 binary) and 'control' (reliable JSON).
 *  - If the data channel doesn't open within RTC_TIMEOUT_MS (or WebRTC fails / is missing), falls
 *    back to the server relay: binary WS frames + {type:'relay', payload}.
 *  - Reconnects the signalling socket with backoff; a live WebRTC session survives a signalling drop.
 *
 * Events: 'status' (status, detail) · 'message' (screen JSON)
 * status: connecting | waiting | negotiating | connected | lost | gone
 */
import { Emitter, STUN, defaultSignalUrl } from './protocol.js';

const RTC_TIMEOUT_MS = 5000;
const PING_MS = 2000;

export class PadLink extends Emitter {
  status = 'connecting';
  /** 'webrtc' | 'relay' | 'none' */
  transport = 'none';
  latencyMs = 0;
  everConnected = false;

  #signalUrl;
  #pin = '';
  #ws = null;
  #token = '';
  #retry = 0;
  #reconnectTimer = null;
  #keepalive = null;
  #pingTimer = null;
  #pc = null;
  #sensor = null;
  #control = null;
  #pending = [];
  #remoteSet = false;
  #rtcTimer = null;
  #notFound = 0;

  constructor({ signalUrl, iceServers = STUN, useWebRTC = true } = {}) {
    super();
    this.#signalUrl = signalUrl ?? defaultSignalUrl();
    this.iceServers = iceServers;
    this.useWebRTC = useWebRTC;
  }

  get pin() {
    return this.#pin;
  }

  get connected() {
    return this.status === 'connected';
  }

  connect(pin) {
    if (pin) this.#pin = pin;
    this.#notFound = 0;
    this.#open();
  }

  close() {
    this.#setStatus('gone', 'Closed');
    clearTimeout(this.#reconnectTimer);
    clearInterval(this.#pingTimer);
    this.#pingTimer = null;
    this.#closePeer();
    this.#dropSocket();
  }

  /** Reliable JSON to the screen. */
  send(msg) {
    if (this.transport === 'webrtc' && this.#control?.readyState === 'open') {
      this.#control.send(JSON.stringify(msg));
      return true;
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
    if (now !== 'none' && now !== before) {
      this.everConnected = true;
      if (!this.#pingTimer) this.#pingTimer = setInterval(() => this.send({ t: 'ping', ts: performance.now() }), PING_MS);
    }
    this.emit('status', s, detail);
  }

  #signal(msg) {
    if (this.#ws?.readyState === 1) this.#ws.send(JSON.stringify({ ...msg, token: this.#token }));
  }

  #dropSocket() {
    const old = this.#ws;
    this.#ws = null;
    clearInterval(this.#keepalive);
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
    this.#setStatus('connecting');
    const sock = new WebSocket(this.#signalUrl);
    sock.binaryType = 'arraybuffer';
    this.#ws = sock;
    sock.onopen = () => {
      this.#retry = 0;
      sock.send(JSON.stringify({ type: 'join_room', room: this.#pin }));
      clearInterval(this.#keepalive);
      this.#keepalive = setInterval(() => this.#signal({ type: 'ping' }), 15000);
    };
    sock.onmessage = (ev) => {
      if (typeof ev.data !== 'string') return;
      let m;
      try {
        m = JSON.parse(ev.data);
      } catch {
        return;
      }
      this.#onSignal(m);
    };
    sock.onclose = () => {
      if (this.#ws !== sock) return;
      this.#ws = null;
      clearInterval(this.#keepalive);
      if (this.status === 'gone') return;
      // WebRTC may survive a signalling drop; only the relay path dies with the socket.
      if (!(this.transport === 'webrtc' && this.#control?.readyState === 'open')) {
        this.#closePeer();
        this.#setStatus('lost', 'Connection lost. Reconnecting...');
      }
      this.#scheduleReconnect();
    };
  }

  #scheduleReconnect() {
    if (this.#reconnectTimer || this.status === 'gone') return;
    const delay = Math.min(5000, 600 * 2 ** this.#retry++);
    this.#reconnectTimer = setTimeout(() => {
      this.#reconnectTimer = null;
      this.#open();
    }, delay);
  }

  #gone(text) {
    this.#closePeer();
    this.#setStatus('gone', text);
    this.#dropSocket();
  }

  #onSignal(m) {
    switch (m.type) {
      case 'joined':
        this.#token = String(m.token || '');
        this.#notFound = 0;
        if (!m.peer) this.#setStatus('waiting', this.everConnected ? 'Screen disconnected. Waiting for it to come back...' : 'Waiting for the screen...');
        break;
      case 'peer_connected':
        if (m.role === 'game') this.#startRtc().catch(() => this.#useRelay());
        break;
      case 'peer_disconnected':
        if (m.role === 'game') {
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
        this.#gone('This controller was opened on another device.');
        break;
      case 'room_closed':
      case 'room_expired':
        this.#gone('The screen closed this room. Scan the new QR code.');
        break;
      case 'error':
        if (m.code === 'room_not_found') {
          // Right after a screen reload the room may be briefly missing: retry a couple of times.
          if (this.everConnected && ++this.#notFound < 4) {
            this.#setStatus('lost', 'Looking for the screen...');
            this.#dropSocket();
            this.#scheduleReconnect();
          } else this.#gone('That PIN is not active. Scan the QR code on the screen again.');
        } else if (m.code === 'rate_limited') this.#gone(String(m.message));
        break;
      default:
        break;
    }
  }

  #onScreen(m) {
    // pt = this phone's clock (same base as the SEN2 `t` field), for the screen's clock sync.
    if (m.t === 'ping') return this.send({ t: 'pong', ts: m.ts, pt: performance.now() });
    if (m.t === 'pong') {
      const rtt = performance.now() - m.ts;
      if (rtt >= 0 && rtt < 5000) this.latencyMs = this.latencyMs ? this.latencyMs * 0.8 + (rtt / 2) * 0.2 : rtt / 2;
      return;
    }
    this.emit('message', m);
  }

  #useRelay() {
    if (this.status === 'gone' || this.#ws?.readyState !== 1) return;
    if (this.status === 'connected' && this.transport === 'webrtc') return;
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
    this.#closePeer();
    this.#setStatus('negotiating', 'Connecting to the screen...');
    if (!this.useWebRTC || typeof RTCPeerConnection === 'undefined') return this.#useRelay();
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
      this.#setStatus('connected', undefined, 'webrtc');
    };
    control.onclose = () => {
      if (this.#pc === pc && this.transport === 'webrtc') this.#useRelay();
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
      if (s === 'failed' || (s === 'disconnected' && this.transport !== 'webrtc')) this.#useRelay();
    };
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.#signal({ type: 'offer', sdp: offer.sdp });
    this.#rtcTimer = setTimeout(() => {
      this.#rtcTimer = null;
      if (this.#pc === pc && control.readyState !== 'open') this.#useRelay();
    }, RTC_TIMEOUT_MS);
  }
}
