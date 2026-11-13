import type { GameToPhone, LinkInfo, PhoneButton, SensorSample } from '../contracts';
import { base64ToBuffer, decodeSen1 } from './sen1';
import { openSignal } from '../../../../public/js/poll-socket.js';

export interface PhoneLinkOptions {
  /** Signaling websocket URL. Default ws(s)://<location.host>/signal or VITE_SIGNAL_URL. */
  signalUrl?: string;
  /** ICE servers for WebRTC. Default: Google STUN. */
  iceServers?: RTCIceServer[];
  /** Persist room PIN in sessionStorage so a page reload keeps the same PIN. Default true. */
  persistRoom?: boolean;
}

type Unsubscribe = () => void;

interface SignalMessage {
  type: string;
  [key: string]: unknown;
}

const STORAGE_KEY = 'tableslice.link.v1';
const BUTTONS: ReadonlySet<string> = new Set(['calibrate', 'pause', 'select']);
const PING_MS = 20_000;
const MAX_BACKOFF_MS = 10_000;

function defaultSignalUrl(): string {
  const env = import.meta.env?.VITE_SIGNAL_URL as string | undefined;
  if (env) return env;
  return `${location.origin}/api/signal`;
}

/**
 * Game side of the phone link. Creates a signaling room (PIN), answers the
 * phone's WebRTC offer, decodes SEN1 sensor packets and JSON button messages,
 * and falls back to the websocket relay when the phone switches to it.
 * Reconnects (keeping the PIN when the hub supports resume_room) on drops.
 */
export class PhoneLink {
  /** Most recent decoded sample, or null. */
  latestSample: SensorSample | null = null;
  /** Smoothed incoming sample rate in Hz. */
  packetRate = 0;

  private readonly signalUrl: string;
  private readonly iceServers: RTCIceServer[];
  private readonly persist: boolean;

  private _info: LinkInfo = { status: 'idle' };
  private infoListeners = new Set<(info: LinkInfo) => void>();
  private sampleListeners = new Set<(s: SensorSample) => void>();
  private buttonListeners = new Set<(b: PhoneButton) => void>();

  private ws: WebSocket | null = null;
  private token = '';
  private pin = '';
  private controllerBase: string | null = null;
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private remoteSet = false;
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private peerPresent = false;
  private transport: 'webrtc' | 'relay' | undefined;

  private started = false;
  private stopped = false;
  private backoff = 500;
  private reconnectTimer: number | undefined;
  private pingTimer: number | undefined;
  private rateTimer: number | undefined;
  private rateCount = 0;
  private rateSince = 0;
  private lastSeq = -1;
  private startResolvers: (() => void)[] = [];

  constructor(opts: PhoneLinkOptions = {}) {
    this.signalUrl = opts.signalUrl ?? defaultSignalUrl();
    this.iceServers = opts.iceServers ?? [{ urls: 'stun:stun.l.google.com:19302' }];
    this.persist = opts.persistRoom ?? true;
  }

  // ------------------------------------------------------------ public API

  get info(): LinkInfo {
    return this._info;
  }

  /**
   * Connect to signaling and create (or resume) a room. Resolves once a PIN
   * is available, or after the first failure (retries continue in the
   * background; watch onInfo).
   */
  start(): Promise<void> {
    if (this.started) {
      return this._info.pin || this._info.status === 'error'
        ? Promise.resolve()
        : new Promise((r) => this.startResolvers.push(r));
    }
    this.started = true;
    this.stopped = false;
    const done = new Promise<void>((r) => this.startResolvers.push(r));
    void this.loadControllerBase();
    this.rateSince = performance.now();
    this.rateTimer = window.setInterval(() => this.updateRate(), 500);
    this.connectSignaling();
    return done;
  }

  /** Close everything. The link can be started again afterwards. */
  stop(): void {
    this.stopped = true;
    this.started = false;
    window.clearTimeout(this.reconnectTimer);
    window.clearInterval(this.pingTimer);
    window.clearInterval(this.rateTimer);
    this.closePeer();
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.setInfo({ status: 'idle' });
  }

  /** Subscribe to link status changes; called immediately with the current info. */
  onInfo(cb: (info: LinkInfo) => void): Unsubscribe {
    this.infoListeners.add(cb);
    cb(this._info);
    return () => this.infoListeners.delete(cb);
  }

  onSample(cb: (s: SensorSample) => void): Unsubscribe {
    this.sampleListeners.add(cb);
    return () => this.sampleListeners.delete(cb);
  }

  onButton(cb: (b: PhoneButton) => void): Unsubscribe {
    this.buttonListeners.add(cb);
    return () => this.buttonListeners.delete(cb);
  }

  /** Send a message to the phone (datachannel if open, else websocket relay). */
  send(msg: GameToPhone): void {
    const text = JSON.stringify(msg);
    if (this.dc?.readyState === 'open') {
      try {
        this.dc.send(text);
        return;
      } catch {
        /* fall through to relay */
      }
    }
    if (this.peerPresent) this.signal({ type: 'relay', data: text });
  }

  // ------------------------------------------------------------- signaling

  private connectSignaling(): void {
    if (this.stopped) return;
    if (this._info.status !== 'connected') this.setInfo({ status: 'signaling', message: 'Contacting pairing service…' });
    let ws: WebSocket;
    try {
      ws = openSignal(this.signalUrl);
    } catch (err) {
      this.fail(`Bad signaling URL: ${(err as Error).message}`);
      return;
    }
    ws.binaryType = 'arraybuffer';
    this.ws = ws;
    ws.onopen = () => {
      this.backoff = 500;
      const saved = this.loadSaved();
      if (saved) ws.send(JSON.stringify({ type: 'resume_room', room: saved.pin, token: saved.token }));
      else ws.send(JSON.stringify({ type: 'create_room' }));
      window.clearInterval(this.pingTimer);
      this.pingTimer = window.setInterval(() => this.signal({ type: 'ping' }), PING_MS);
    };
    ws.onmessage = (ev: MessageEvent) => {
      if (typeof ev.data === 'string') {
        let msg: SignalMessage;
        try {
          msg = JSON.parse(ev.data) as SignalMessage;
        } catch {
          return;
        }
        this.handleSignal(msg);
      } else {
        // Binary relay frame: SEN1 from the phone over the websocket.
        this.useRelay();
        this.handleData(ev.data as ArrayBuffer | Blob);
      }
    };
    ws.onerror = () => {
      /* onclose follows */
    };
    ws.onclose = () => {
      if (this.ws !== ws) return;
      this.ws = null;
      this.token = '';
      window.clearInterval(this.pingTimer);
      if (this.stopped) return;
      if (this.transport === 'relay') this.transport = undefined;
      const dcAlive = this.dc?.readyState === 'open';
      if (!dcAlive) {
        this.peerPresent = false;
        this.setInfo({ status: 'error', message: 'Pairing service unreachable — retrying…' });
      }
      this.resolveStart();
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    window.clearTimeout(this.reconnectTimer);
    const delay = this.backoff * (0.8 + Math.random() * 0.4);
    this.backoff = Math.min(this.backoff * 2, MAX_BACKOFF_MS);
    this.reconnectTimer = window.setTimeout(() => this.connectSignaling(), delay);
  }

  private signal(msg: SignalMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify({ ...msg, token: this.token }));
  }

  private handleSignal(msg: SignalMessage): void {
    switch (msg.type) {
      case 'joined': {
        this.token = String(msg.token ?? '');
        const pin = String(msg.room ?? '');
        if (pin !== this.pin) {
          // New room: any previous phone is gone.
          this.closePeer();
          this.peerPresent = false;
        }
        this.pin = pin;
        this.save();
        if (this.dc?.readyState === 'open') this.setInfo({ status: 'connected' });
        else this.setInfo({ status: 'waiting', message: 'Scan the code or enter the PIN on your phone' });
        this.resolveStart();
        break;
      }
      case 'peer_connected':
        this.peerPresent = true;
        this.lastSeq = -1;
        if (this.dc?.readyState !== 'open') this.setInfo({ status: 'connecting', message: 'Phone found — connecting…' });
        break;
      case 'peer_disconnected':
        this.peerPresent = false;
        this.closePeer();
        this.setInfo({ status: 'disconnected', message: 'Phone disconnected — waiting for it to rejoin' });
        break;
      case 'replaced':
        // Another tab took over this room; start fresh.
        this.clearSaved();
        this.pin = '';
        break;
      case 'room_expired':
      case 'room_closed':
        this.clearSaved();
        this.closePeer();
        this.peerPresent = false;
        this.pin = '';
        this.setInfo({ status: 'signaling', message: 'Room expired — creating a new one…' });
        this.ws?.send(JSON.stringify({ type: 'create_room' }));
        break;
      case 'offer':
        void this.handleOffer(String(msg.sdp ?? ''));
        break;
      case 'candidate':
        this.handleCandidate(msg);
        break;
      case 'relay':
        this.useRelay();
        this.handleRelayData(msg.data);
        break;
      case 'error':
        this.handleError(String(msg.code ?? ''), String(msg.message ?? 'Signaling error'));
        break;
      default:
        break;
    }
  }

  private handleError(code: string, message: string): void {
    if (!this.token) {
      // Failed resume (or old relay without resume_room) -> create a new room.
      if (code === 'room_not_found' || code === 'unauthorized' || code === 'unknown_message' || code === 'invalid_role') {
        this.clearSaved();
        this.ws?.send(JSON.stringify({ type: 'create_room' }));
        return;
      }
    }
    if (code === 'peer_not_connected' || code === 'unknown_message') return;
    console.warn('[PhoneLink]', code, message);
  }

  // ---------------------------------------------------------------- WebRTC

  private async handleOffer(sdp: string): Promise<void> {
    this.closePeer();
    this.peerPresent = true;
    this.setInfo({ status: 'connecting', message: 'Connecting to phone…' });
    const pc = new RTCPeerConnection({ iceServers: this.iceServers });
    this.pc = pc;
    this.remoteSet = false;
    pc.onicecandidate = (ev) => {
      if (ev.candidate && this.pc === pc) {
        this.signal({
          type: 'candidate',
          media: ev.candidate.sdpMid,
          index: ev.candidate.sdpMLineIndex,
          name: ev.candidate.candidate,
        });
      }
    };
    pc.ondatachannel = (ev) => this.attachChannel(ev.channel, pc);
    pc.onconnectionstatechange = () => {
      if (this.pc !== pc) return;
      if (pc.connectionState === 'failed' && this.transport !== 'relay') {
        this.setInfo({ status: 'connecting', message: 'Direct link failed — waiting for relay…' });
      }
    };
    try {
      await pc.setRemoteDescription({ type: 'offer', sdp });
      if (this.pc !== pc) return;
      this.remoteSet = true;
      for (const c of this.pendingCandidates.splice(0)) await pc.addIceCandidate(c).catch(() => {});
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      if (this.pc !== pc) return;
      this.signal({ type: 'answer', sdp: answer.sdp ?? '' });
    } catch (err) {
      console.warn('[PhoneLink] offer handling failed', err);
    }
  }

  private handleCandidate(msg: SignalMessage): void {
    if (typeof msg.name !== 'string' || !msg.name) return;
    const cand: RTCIceCandidateInit = {
      candidate: msg.name,
      sdpMid: (msg.media as string | null | undefined) ?? null,
      sdpMLineIndex: (msg.index as number | null | undefined) ?? null,
    };
    if (this.pc && this.remoteSet) this.pc.addIceCandidate(cand).catch(() => {});
    else this.pendingCandidates.push(cand);
  }

  private attachChannel(ch: RTCDataChannel, pc: RTCPeerConnection): void {
    if (this.pc !== pc) return;
    ch.binaryType = 'arraybuffer';
    this.dc = ch;
    const onOpen = () => {
      if (this.dc !== ch) return;
      this.transport = 'webrtc';
      this.setInfo({ status: 'connected', message: undefined });
    };
    ch.onopen = onOpen;
    if (ch.readyState === 'open') onOpen();
    ch.onmessage = (ev: MessageEvent) => this.handleData(ev.data as ArrayBuffer | Blob | string);
    ch.onclose = () => {
      if (this.dc !== ch) return;
      this.dc = null;
      if (this.transport === 'webrtc') {
        this.transport = undefined;
        if (this.peerPresent) this.setInfo({ status: 'connecting', message: 'Reconnecting to phone…' });
        else this.setInfo({ status: 'disconnected', message: 'Phone disconnected' });
      }
    };
  }

  private closePeer(): void {
    if (this.dc) {
      this.dc.onclose = null;
      this.dc.onmessage = null;
      try { this.dc.close(); } catch { /* ignore */ }
    }
    if (this.pc) {
      this.pc.onicecandidate = null;
      this.pc.ondatachannel = null;
      this.pc.onconnectionstatechange = null;
      try { this.pc.close(); } catch { /* ignore */ }
    }
    this.dc = null;
    this.pc = null;
    this.remoteSet = false;
    this.pendingCandidates = [];
    this.transport = undefined;
    this.lastSeq = -1;
  }

  private useRelay(): void {
    if (this.dc?.readyState === 'open') return; // data also arriving over webrtc
    if (this.transport !== 'relay') {
      this.transport = 'relay';
      this.peerPresent = true;
      this.setInfo({ status: 'connected', message: undefined });
    }
  }

  // ------------------------------------------------------------------ data

  private handleData(data: ArrayBuffer | Blob | string): void {
    if (typeof data === 'string') {
      this.handleText(data);
    } else if (data instanceof ArrayBuffer) {
      this.handleBinary(data);
    } else if (typeof Blob !== 'undefined' && data instanceof Blob) {
      void data.arrayBuffer().then((b) => this.handleBinary(b));
    }
  }

  private handleRelayData(data: unknown): void {
    if (typeof data === 'string') {
      if (data.startsWith('b64:')) {
        try {
          this.handleBinary(base64ToBuffer(data.slice(4)));
        } catch { /* ignore */ }
      } else {
        this.handleText(data);
      }
    } else if (data && typeof data === 'object') {
      this.handleObject(data as Record<string, unknown>);
    }
  }

  private handleText(text: string): void {
    let obj: unknown;
    try {
      obj = JSON.parse(text);
    } catch {
      return;
    }
    if (obj && typeof obj === 'object') this.handleObject(obj as Record<string, unknown>);
  }

  private handleObject(obj: Record<string, unknown>): void {
    if (obj.t === 'btn' && typeof obj.b === 'string' && BUTTONS.has(obj.b)) {
      const b = obj.b as PhoneButton;
      for (const cb of this.buttonListeners) cb(b);
    } else if (obj.t === 'sample' && Array.isArray(obj.q) && obj.q.length === 4) {
      // JSON sample (relay fallback): {t:'sample', seq, ts, q:[x,y,z,w], a:[x,y,z]}
      const q = obj.q.map(Number) as [number, number, number, number];
      const a = (Array.isArray(obj.a) ? obj.a.map(Number) : [0, 0, 0]) as [number, number, number];
      if (!q.every(Number.isFinite)) return;
      this.emitSample({
        seq: Number(obj.seq) >>> 0,
        t: Number(obj.ts) >>> 0,
        quat: q,
        accel: [a[0] || 0, a[1] || 0, a[2] || 0],
        receivedAt: performance.now(),
      });
    }
  }

  private handleBinary(buf: ArrayBuffer): void {
    const s = decodeSen1(buf);
    if (s) this.emitSample(s);
  }

  private emitSample(s: SensorSample): void {
    // Drop stale out-of-order packets (unordered datachannel). Allow resets.
    if (this.lastSeq >= 0) {
      const diff = (s.seq - this.lastSeq) | 0;
      if (diff <= 0 && diff > -1000) return;
    }
    this.lastSeq = s.seq;
    this.latestSample = s;
    this.rateCount++;
    if (this._info.status !== 'connected' && (this.transport || this.dc?.readyState === 'open')) {
      this.setInfo({ status: 'connected', message: undefined });
    }
    for (const cb of this.sampleListeners) cb(s);
  }

  private updateRate(): void {
    const now = performance.now();
    const dt = (now - this.rateSince) / 1000;
    if (dt <= 0) return;
    const inst = this.rateCount / dt;
    this.rateCount = 0;
    this.rateSince = now;
    this.packetRate = this.packetRate === 0 ? inst : this.packetRate * 0.6 + inst * 0.4;
    if (this.packetRate < 0.05) this.packetRate = 0;
  }

  // ------------------------------------------------------------ info / misc

  private setInfo(patch: Partial<LinkInfo>): void {
    const next: LinkInfo = { ...this._info, ...patch };
    next.pin = this.pin || undefined;
    next.joinUrl = this.pin ? this.joinUrlFor(this.pin) : undefined;
    next.transport = next.status === 'connected' ? this.transport ?? (this.dc ? 'webrtc' : undefined) : undefined;
    if (next.message === undefined) delete next.message;
    const prev = this._info;
    if (
      prev.status === next.status &&
      prev.pin === next.pin &&
      prev.joinUrl === next.joinUrl &&
      prev.transport === next.transport &&
      prev.message === next.message
    ) {
      return;
    }
    this._info = next;
    for (const cb of this.infoListeners) cb(next);
  }

  private fail(message: string): void {
    this.setInfo({ status: 'error', message });
    this.resolveStart();
  }

  private resolveStart(): void {
    for (const r of this.startResolvers.splice(0)) r();
  }

  private joinUrlFor(pin: string): string {
    const base = this.controllerBase ?? `${location.origin}/controller/`;
    const sep = base.includes('?') ? '&' : '?';
    const url = `${base}${sep}pin=${pin}`;
    // Tell the controller where signaling lives when it is not its own host.
    if (import.meta.env?.VITE_SIGNAL_URL) return `${url}&signal=${encodeURIComponent(this.signalUrl)}`;
    return url;
  }

  private async loadControllerBase(): Promise<void> {
    const env = import.meta.env?.VITE_CONTROLLER_URL as string | undefined;
    if (env) {
      this.controllerBase = env;
      this.setInfo({});
      return;
    }
    try {
      const res = await fetch('/api/info', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { lanUrls?: unknown };
      const first = Array.isArray(data.lanUrls) ? data.lanUrls.find((u) => typeof u === 'string') : undefined;
      if (typeof first === 'string') {
        this.controllerBase = first;
        this.setInfo({});
      }
    } catch {
      /* static hosting: keep location.origin fallback */
    }
  }

  private loadSaved(): { pin: string; token: string } | null {
    if (!this.persist) return this.pin && this.token ? { pin: this.pin, token: this.token } : null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const v = JSON.parse(raw) as { pin?: unknown; token?: unknown; url?: unknown };
      if (typeof v.pin === 'string' && typeof v.token === 'string' && v.url === this.signalUrl) {
        return { pin: v.pin, token: v.token };
      }
    } catch {
      /* storage unavailable */
    }
    return null;
  }

  private save(): void {
    if (!this.persist) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ pin: this.pin, token: this.token, url: this.signalUrl }));
    } catch {
      /* ignore */
    }
  }

  private clearSaved(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}
