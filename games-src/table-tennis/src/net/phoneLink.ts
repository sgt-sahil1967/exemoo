/**
 * Game side of the phone link.
 *
 *  - Connects to the signalling server (`/signal`), creates a room (six-digit PIN).
 *  - Answers the phone's WebRTC offer; receives `sensor` (unreliable, SEN1/SEN2 binary) and
 *    `control` (reliable JSON) datachannels. Legacy `sensor_data` channel also accepted.
 *  - Relay fallback: sensor packets as binary WS frames, control as `{type:'relay', payload}`.
 *  - Ping/pong latency over the control path. Keeps the same PIN across phone reconnects, game
 *    reloads (sessionStorage resume key) and signalling reconnects.
 */
import type {
  GameToPhone,
  LinkStatus,
  LinkTransport,
  PhoneLinkEvents,
  PhoneToGame,
  SensorPacket,
} from '../core/contracts';
import { decodePacket } from './packets';
import { openSignal, setPoll, screenPollMs } from '../../../../public/js/poll-socket.js';

const STUN: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];
const STORAGE_KEY = 'spinshot.room';
const PING_MS = 1000;
const WS_KEEPALIVE_MS = 15000;
const STALL_MS = 3500;

/** Internal control messages not part of the public contract. */
type LinkControl = { t: 'ping'; ts: number } | { t: 'pong'; ts: number };

interface ServerInfo {
  lanIps: string[];
  httpPort: number;
  httpsPort: number;
}

type Listeners = { [K in keyof PhoneLinkEvents]: Set<PhoneLinkEvents[K]> };

function defaultSignalUrl(): string {
  if (typeof location === 'undefined') return 'http://localhost:8080/api/signal';
  return `${location.origin}/api/signal`;
}

export class PhoneLink {
  pin = '';
  status: LinkStatus = 'idle';
  transport: LinkTransport = 'none';
  latencyMs = 0;
  /** Packets per second over the last second (diagnostics). */
  packetRate = 0;

  private readonly signalUrl: string;
  private listeners: Listeners = { status: new Set(), packet: new Set(), message: new Set() };
  private ws: WebSocket | null = null;
  private token = '';
  private resume = '';
  private savedPin = '';
  private stopped = true;
  private peerPresent = false;
  private pc: RTCPeerConnection | null = null;
  private control: RTCDataChannel | null = null;
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private remoteSet = false;
  private relaySeen = false;
  private lastRx = 0;
  private detail: string | undefined;
  private retry = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private keepaliveTimer: ReturnType<typeof setInterval> | null = null;
  private lastPing = 0;
  private rateCount = 0;
  private rateT0 = 0;
  private startWaiters: Array<{ res: () => void; rej: (e: Error) => void }> = [];
  private info: Promise<ServerInfo | null> | null = null;

  private readonly storageKey: string;

  constructor(opts: { signalUrl?: string; storageKey?: string } = {}) {
    this.storageKey = opts.storageKey ?? STORAGE_KEY;
    this.signalUrl = opts.signalUrl ?? defaultSignalUrl();
    try {
      const saved = JSON.parse(sessionStorage.getItem(this.storageKey) || 'null');
      if (saved && typeof saved.pin === 'string' && typeof saved.resume === 'string') {
        this.savedPin = saved.pin;
        this.resume = saved.resume;
      }
    } catch {
      /* no storage */
    }
  }

  on<K extends keyof PhoneLinkEvents>(ev: K, cb: PhoneLinkEvents[K]): () => void {
    (this.listeners[ev] as Set<PhoneLinkEvents[K]>).add(cb);
    return () => {
      (this.listeners[ev] as Set<PhoneLinkEvents[K]>).delete(cb);
    };
  }

  private emit<K extends keyof PhoneLinkEvents>(ev: K, ...args: Parameters<PhoneLinkEvents[K]>): void {
    for (const cb of this.listeners[ev] as Set<(...a: Parameters<PhoneLinkEvents[K]>) => void>) {
      try {
        cb(...args);
      } catch (e) {
        console.error('[PhoneLink] listener error', e);
      }
    }
  }

  private setStatus(s: LinkStatus, detail?: string, transport?: LinkTransport): void {
    const t = transport ?? this.transport;
    if (s === this.status && detail === this.detail && t === this.transport) return;
    this.status = s;
    this.detail = detail;
    this.transport = t;
    setPoll(this.ws, screenPollMs(s, t));
    this.emit('status', s, detail);
  }

  start(): Promise<void> {
    const p = new Promise<void>((res, rej) => {
      if (this.pin && this.ws && this.ws.readyState === WebSocket.OPEN) res();
      else this.startWaiters.push({ res, rej });
    });
    if (this.stopped) {
      this.stopped = false;
      this.retry = 0;
      this.connect();
      this.tickTimer = setInterval(() => this.tick(), 250);
      setTimeout(() => this.settleStart(new Error('Could not reach the SPINSHOT server')), 8000);
    }
    return p;
  }

  private settleStart(err?: Error): void {
    const w = this.startWaiters.splice(0);
    for (const x of w) err ? x.rej(err) : x.res();
  }

  stop(): void {
    this.stopped = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.tickTimer) clearInterval(this.tickTimer);
    if (this.keepaliveTimer) clearInterval(this.keepaliveTimer);
    this.reconnectTimer = this.tickTimer = this.keepaliveTimer = null;
    this.closePeer();
    const ws = this.ws;
    this.ws = null;
    if (ws) {
      ws.onclose = ws.onmessage = ws.onerror = ws.onopen = null;
      try {
        ws.close();
      } catch {
        /* ignore */
      }
    }
    this.peerPresent = false;
    this.latencyMs = 0;
    this.setStatus('idle', undefined, 'none');
    this.settleStart(new Error('stopped'));
  }

  // ───────────────────────────── controller URL ─────────────────────────────
  private serverInfo(): Promise<ServerInfo | null> {
    if (!this.info) {
      this.info = fetch('/api/info', { cache: 'no-store' })
        .then((r) => (r.ok ? (r.json() as Promise<ServerInfo>) : null))
        .catch(() => null);
    }
    return this.info;
  }

  async controllerUrl(): Promise<string> {
    const q = this.pin ? `?pin=${this.pin}` : '';
    const info = await this.serverInfo();
    if (info && info.httpsPort) {
      const host =
        info.lanIps && info.lanIps.length
          ? info.lanIps[0]
          : typeof location !== 'undefined'
            ? location.hostname
            : 'localhost';
      return `https://${host.includes(':') ? `[${host}]` : host}:${info.httpsPort}/controller.html${q}`;
    }
    const origin = typeof location !== 'undefined' ? location.origin : 'http://localhost:8080';
    return `${origin}/controller.html${q}`;
  }

  // ───────────────────────────────── sending ────────────────────────────────
  send(msg: GameToPhone): void {
    this.sendControl(msg);
  }

  private sendControl(msg: GameToPhone | LinkControl): boolean {
    if (this.control && this.control.readyState === 'open') {
      try {
        this.control.send(JSON.stringify(msg));
        return true;
      } catch {
        /* fall through to relay */
      }
    }
    if (this.peerPresent) return this.sendSignal({ type: 'relay', payload: msg });
    return false;
  }

  private sendSignal(msg: Record<string, unknown>): boolean {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify({ ...msg, token: this.token }));
    return true;
  }

  // ─────────────────────────────── signalling ───────────────────────────────
  private connect(): void {
    if (this.stopped) return;
    if (this.status !== 'disconnected') this.setStatus('connecting');
    let ws: WebSocket;
    try {
      ws = openSignal(this.signalUrl);
    } catch (e) {
      this.setStatus('error', `Bad signalling URL: ${(e as Error).message}`, 'none');
      this.scheduleReconnect();
      return;
    }
    ws.binaryType = 'arraybuffer';
    this.ws = ws;
    setPoll(ws, screenPollMs(this.status, this.transport));
    ws.onopen = () => {
      this.retry = 0;
      const pin = this.pin || this.savedPin;
      ws.send(JSON.stringify({ type: 'create_room', pin: pin || undefined, resume: this.resume || undefined }));
      if (this.keepaliveTimer) clearInterval(this.keepaliveTimer);
      this.keepaliveTimer = setInterval(() => this.sendSignal({ type: 'ping' }), WS_KEEPALIVE_MS);
    };
    ws.onmessage = (ev) => {
      if (typeof ev.data === 'string') {
        let m: Record<string, unknown>;
        try {
          m = JSON.parse(ev.data);
        } catch {
          return;
        }
        this.onSignal(m);
      } else if (ev.data instanceof ArrayBuffer) {
        this.onRelayActivity();
        this.onBinary(ev.data);
      }
    };
    ws.onerror = () => {
      /* onclose follows */
    };
    ws.onclose = () => {
      if (this.ws !== ws) return;
      this.ws = null;
      this.token = '';
      if (this.keepaliveTimer) clearInterval(this.keepaliveTimer);
      this.keepaliveTimer = null;
      if (this.stopped) return;
      // A live WebRTC session can survive a signalling hiccup; only drop the relay path.
      const rtcAlive = !!this.control && this.control.readyState === 'open';
      if (!rtcAlive) {
        this.closePeer();
        this.peerPresent = false;
        this.setStatus('disconnected', 'Lost connection to the server — retrying…', 'none');
      }
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (this.stopped || this.reconnectTimer) return;
    const delay = Math.min(5000, 500 * 2 ** this.retry++);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private persist(): void {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify({ pin: this.pin, resume: this.resume }));
    } catch {
      /* ignore */
    }
  }

  private onSignal(m: Record<string, unknown>): void {
    switch (m.type) {
      case 'joined': {
        this.token = String(m.token || '');
        this.pin = String(m.room || '');
        if (typeof m.resume === 'string') this.resume = m.resume;
        this.persist();
        if (m.peer !== true && !(this.control && this.control.readyState === 'open')) {
          this.setStatus('waiting', undefined, 'none');
        }
        this.settleStart();
        break;
      }
      case 'peer_connected':
        if (m.role === 'controller') {
          this.peerPresent = true;
          if (!(this.control && this.control.readyState === 'open')) {
            this.setStatus('pairing', 'Phone joined — connecting…', 'none');
          }
        }
        break;
      case 'peer_disconnected':
        if (m.role === 'controller') this.onPhoneGone();
        break;
      case 'offer':
        this.onOffer(String(m.sdp || '')).catch((e) => {
          console.warn('[PhoneLink] offer failed', e);
          this.setStatus('pairing', 'WebRTC failed — waiting for relay…', 'none');
        });
        break;
      case 'candidate':
        if (typeof m.name === 'string' && m.name) {
          const c: RTCIceCandidateInit = {
            candidate: m.name,
            sdpMid: (m.media as string | null) ?? null,
            sdpMLineIndex: (m.index as number | null) ?? null,
          };
          if (this.pc && this.remoteSet) this.pc.addIceCandidate(c).catch(() => {});
          else this.pendingCandidates.push(c);
        }
        break;
      case 'relay':
        this.onRelayActivity();
        if (m.payload && typeof m.payload === 'object') this.onControl(m.payload as Record<string, unknown>);
        break;
      case 'room_expired':
        // Server dropped the room; recreate (same PIN if still free).
        this.closePeer();
        this.peerPresent = false;
        this.token = '';
        this.ws?.send(JSON.stringify({ type: 'create_room', pin: this.pin || undefined, resume: this.resume }));
        break;
      case 'error':
        console.warn('[PhoneLink] server error', m.code, m.message);
        if (m.code === 'already_joined' || m.code === 'unauthorized') {
          // Session got out of sync — reconnect cleanly.
          this.ws?.close();
        } else if (!this.pin) {
          this.setStatus('error', String(m.message || m.code || 'Server error'), 'none');
        }
        break;
      default:
        break;
    }
  }

  private onPhoneGone(): void {
    this.closePeer();
    this.peerPresent = false;
    this.latencyMs = 0;
    this.setStatus('waiting', 'Phone disconnected — scan again or reopen the controller', 'none');
  }

  private onRelayActivity(): void {
    this.relaySeen = true;
    this.peerPresent = true;
    if (!(this.control && this.control.readyState === 'open')) this.markConnected('relay');
  }

  private markConnected(t: LinkTransport): void {
    this.lastRx = performance.now();
    if (this.status !== 'connected' || this.transport !== t) this.setStatus('connected', undefined, t);
  }

  // ───────────────────────────────── WebRTC ─────────────────────────────────
  private closePeer(): void {
    const pc = this.pc;
    this.pc = null;
    this.control = null;
    this.remoteSet = false;
    this.pendingCandidates = [];
    this.relaySeen = false;
    if (pc) {
      pc.ondatachannel = pc.onicecandidate = pc.oniceconnectionstatechange = null;
      try {
        pc.close();
      } catch {
        /* ignore */
      }
    }
  }

  private async onOffer(sdp: string): Promise<void> {
    if (typeof RTCPeerConnection === 'undefined') throw new Error('WebRTC unavailable');
    this.closePeer();
    this.peerPresent = true;
    const pc = new RTCPeerConnection({ iceServers: STUN });
    this.pc = pc;
    pc.onicecandidate = (e) => {
      if (e.candidate)
        this.sendSignal({
          type: 'candidate',
          media: e.candidate.sdpMid,
          index: e.candidate.sdpMLineIndex,
          name: e.candidate.candidate,
        });
    };
    pc.oniceconnectionstatechange = () => {
      if (this.pc !== pc) return;
      const s = pc.iceConnectionState;
      if ((s === 'failed' || s === 'closed') && this.transport === 'webrtc') {
        this.control = null;
        if (this.relaySeen) this.markConnected('relay');
        else this.setStatus('pairing', 'Direct connection lost — trying relay…', 'none');
      }
    };
    pc.ondatachannel = (e) => {
      if (this.pc !== pc) return;
      const ch = e.channel;
      ch.binaryType = 'arraybuffer';
      if (ch.label === 'control') {
        this.control = ch;
        ch.onopen = () => this.markConnected('webrtc');
        ch.onclose = () => {
          if (this.control !== ch) return;
          this.control = null;
          if (this.relaySeen && this.peerPresent) this.markConnected('relay');
          else if (this.peerPresent) this.setStatus('pairing', 'Reconnecting to phone…', 'none');
        };
        ch.onmessage = (ev) => {
          if (typeof ev.data !== 'string') return;
          try {
            this.onControl(JSON.parse(ev.data));
          } catch {
            /* ignore junk */
          }
        };
        if (ch.readyState === 'open') this.markConnected('webrtc');
      } else {
        // 'sensor' (SEN2) or legacy 'sensor_data' (SEN1)
        ch.onmessage = (ev) => {
          if (ev.data instanceof ArrayBuffer) this.onBinary(ev.data);
        };
        if (ch.label === 'sensor_data') {
          // Legacy controller has no control channel: sensor channel open == connected.
          ch.onopen = () => this.markConnected('webrtc');
          if (ch.readyState === 'open') this.markConnected('webrtc');
        }
      }
    };
    await pc.setRemoteDescription({ type: 'offer', sdp });
    this.remoteSet = true;
    for (const c of this.pendingCandidates.splice(0)) await pc.addIceCandidate(c).catch(() => {});
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    this.sendSignal({ type: 'answer', sdp: answer.sdp });
  }

  // ──────────────────────────────── receiving ───────────────────────────────
  private onBinary(buf: ArrayBuffer): void {
    const p: SensorPacket | null = decodePacket(buf);
    if (!p) return;
    this.lastRx = performance.now();
    this.rateCount++;
    if (this.status !== 'connected') {
      const t: LinkTransport = this.control?.readyState === 'open' || this.pc?.connectionState === 'connected' ? 'webrtc' : 'relay';
      this.markConnected(t);
    }
    this.emit('packet', p);
  }

  private onControl(m: Record<string, unknown>): void {
    this.lastRx = performance.now();
    if (m.t === 'pong' && typeof m.ts === 'number') {
      const rtt = performance.now() - m.ts;
      if (rtt >= 0 && rtt < 5000) {
        this.latencyMs = this.latencyMs ? this.latencyMs * 0.8 + (rtt / 2) * 0.2 : rtt / 2;
      }
      return;
    }
    if (m.t === 'ping' && typeof m.ts === 'number') {
      this.sendControl({ t: 'pong', ts: m.ts });
      return;
    }
    if (m.t === 'hello' || m.t === 'button') {
      if (this.status !== 'connected') this.markConnected(this.control?.readyState === 'open' ? 'webrtc' : 'relay');
      this.emit('message', m as unknown as PhoneToGame);
    }
  }

  private tick(): void {
    const now = performance.now();
    if (now - this.rateT0 >= 1000) {
      this.packetRate = Math.round((this.rateCount * 1000) / (now - this.rateT0 || 1000));
      this.rateCount = 0;
      this.rateT0 = now;
    }
    if (!this.peerPresent) return;
    if (now - this.lastPing >= PING_MS) {
      this.lastPing = now;
      this.sendControl({ t: 'ping', ts: now });
    }
    if (this.status === 'connected' && now - this.lastRx > STALL_MS) {
      this.setStatus('pairing', 'Phone not responding…', this.transport);
    } else if (this.status === 'pairing' && this.transport !== 'none' && now - this.lastRx < 500) {
      this.setStatus('connected', undefined, this.transport);
    }
  }
}
