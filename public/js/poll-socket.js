/**
 * PollSocket: the subset of the WebSocket API the Exemoo links use (readyState, send, close,
 * onopen/onmessage/onclose), carried over short HTTP requests to /api/signal (server/pairing.js).
 * Serverless hosts (Vercel) can't keep a socket open, and the server is only needed for the WebRTC
 * handshake, so this is enough:
 *
 *  - Messages sent within a few ms go out in one POST; the reply carries everything waiting for us.
 *  - Between sends it polls every `pollMs`. The links tune this: fast while pairing, slow once the
 *    phone talks to the screen directly (the server is then idle), so a playing pair costs a few
 *    requests a minute.
 *  - {type:'ping'} (the links' heartbeat) is answered locally while recent requests succeed; a
 *    failed request closes the socket (code 1006) and the link reconnects with its usual backoff.
 *  - close() and page unload tell the server we left ({type:'leave'}), so the peer hears
 *    peer_disconnected.
 *  - Binary frames and {type:'relay'} are dropped: there is no server relay.
 */
const BATCH_MS = 15;
const PING_OK_MS = 45_000;

export class PollSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = 0;
  binaryType = 'arraybuffer';
  bufferedAmount = 0;
  onopen = null;
  onmessage = null;
  onclose = null;
  onerror = null;

  #url;
  #fetch;
  #pollMs = 1500;
  #out = [];
  #flushTimer = null;
  #pollTimer = null;
  #busy = false;
  #sess = null;
  #lastOk = 0;
  #onHide = null;

  constructor(url, { fetchImpl, pollMs } = {}) {
    this.url = url;
    this.#url = url;
    this.#fetch = fetchImpl ?? ((...a) => fetch(...a));
    if (pollMs !== undefined) this.#pollMs = pollMs;
    setTimeout(() => {
      if (this.readyState !== 0) return;
      this.readyState = 1;
      this.onopen?.({ type: 'open' });
    }, 0);
    if (typeof addEventListener === 'function') {
      // The page is going away (or into the back/forward cache): say goodbye, then reopen on restore.
      this.#onHide = () => this.#shutdown(1012, true);
      addEventListener('pagehide', this.#onHide);
    }
  }

  /** Poll interval while idle, ms (0 = only when sending). */
  get pollMs() {
    return this.#pollMs;
  }
  set pollMs(ms) {
    const sooner = ms > 0 && (this.#pollMs <= 0 || ms < this.#pollMs);
    this.#pollMs = ms;
    if (sooner || ms <= 0) this.#schedulePoll(ms);
  }

  send(data) {
    if (this.readyState !== 1) throw new Error('PollSocket is not open');
    if (typeof data !== 'string') return; // no binary relay
    let m;
    try {
      m = JSON.parse(data);
    } catch {
      return;
    }
    if (!m || typeof m.type !== 'string' || m.type === 'relay') return;
    if (m.type === 'ping') {
      // Heartbeat: the link is healthy while our requests succeed.
      if (!this.#sess || Date.now() - this.#lastOk < PING_OK_MS) setTimeout(() => this.#deliver({ type: 'pong', timestamp_ms: Date.now() }), 0);
      return;
    }
    const { token: _t, ...rest } = m;
    this.#out.push(rest);
    if (!this.#flushTimer) this.#flushTimer = setTimeout(() => this.#flush(), BATCH_MS);
  }

  close(code = 1000) {
    this.#shutdown(code, true);
  }

  // ─────────────────────────────── internals ───────────────────────────────
  #shutdown(code, leave) {
    if (this.readyState >= 2) return;
    this.readyState = 3;
    clearTimeout(this.#flushTimer);
    clearTimeout(this.#pollTimer);
    this.#flushTimer = this.#pollTimer = null;
    if (this.#onHide) removeEventListener('pagehide', this.#onHide);
    if (leave && this.#sess) this.#beacon({ ...this.#sess, msgs: [{ type: 'leave' }] });
    this.#sess = null;
    setTimeout(() => this.onclose?.({ type: 'close', code, wasClean: code === 1000 }), 0);
  }

  #beacon(body) {
    const json = JSON.stringify(body);
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon?.(this.#url, new Blob([json], { type: 'text/plain' }))) return;
    } catch {
      /* fall back to fetch */
    }
    this.#fetch(this.#url, { method: 'POST', body: json, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(() => {});
  }

  #schedulePoll(ms = this.#pollMs) {
    clearTimeout(this.#pollTimer);
    this.#pollTimer = null;
    if (this.readyState !== 1 || !this.#sess || ms <= 0) return;
    this.#pollTimer = setTimeout(() => {
      this.#pollTimer = null;
      this.#flush();
    }, ms);
  }

  async #flush() {
    clearTimeout(this.#flushTimer);
    this.#flushTimer = null;
    if (this.readyState !== 1) return;
    if (this.#busy) return; // the reply handler flushes again
    this.#busy = true;
    clearTimeout(this.#pollTimer);
    this.#pollTimer = null;
    const msgs = this.#out.splice(0);
    let reply;
    try {
      const res = await this.#fetch(this.#url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(this.#sess || {}), msgs }),
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      reply = await res.json();
    } catch (e) {
      this.#busy = false;
      if (this.readyState === 1) {
        this.onerror?.({ type: 'error', error: e });
        this.#shutdown(1006, false);
      }
      return;
    }
    this.#busy = false;
    if (this.readyState !== 1) return;
    this.#lastOk = Date.now();
    for (const m of Array.isArray(reply?.msgs) ? reply.msgs : []) {
      if (m?.type === 'joined' && typeof m.token === 'string') this.#sess = { pin: String(m.room), role: m.role, token: m.token };
      if (m?.type === 'replaced' || m?.type === 'room_expired' || m?.type === 'room_closed') this.#sess = null;
      this.#deliver(m);
      if (this.readyState !== 1) return;
    }
    if (this.#out.length) this.#flush();
    else this.#schedulePoll();
  }

  #deliver(m) {
    if (this.readyState !== 1) return;
    this.onmessage?.({ type: 'message', data: JSON.stringify(m) });
  }
}

/** Open a signalling connection: a real WebSocket for ws(s):// URLs, else a PollSocket. */
export function openSignal(url, opts) {
  if (/^wss?:/i.test(url) && typeof WebSocket !== 'undefined') return new WebSocket(url);
  return new PollSocket(url, opts);
}

/** Set a socket's poll interval when it is a PollSocket (no-op for a WebSocket). */
export function setPoll(sock, ms) {
  if (sock instanceof PollSocket) sock.pollMs = ms;
}

/** Poll interval for a screen-side link in a given state (used by the games' own TS links). */
export function screenPollMs(status, transport) {
  if (status === 'connected' && transport === 'webrtc') return 15000;
  if (status === 'pairing') return 500;
  if (status === 'waiting') return typeof document !== 'undefined' && document.visibilityState === 'hidden' ? 30000 : 3000;
  return 1000;
}
