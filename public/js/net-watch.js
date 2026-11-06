/**
 * Connection health helpers shared by the phone link (pad-link.js) and the screen link
 * (screen-link.js). Dependency-free; runs in browsers and Node (tests).
 *
 *  - Liveness: an application-level heartbeat on the signalling WebSocket. A socket can die
 *    without a FIN (Wi-Fi switch, NAT timeout, phone sleeping); the browser would only notice
 *    minutes later. We send {type:'ping'} and, if nothing at all comes back within `deadMs` of an
 *    unanswered ping, declare the socket dead. Measuring from the unanswered ping (not from the last
 *    message) keeps it correct when a background tab's timers are throttled to once a minute.
 *  - backoffDelay: exponential backoff with jitter, so a server restart does not get a thundering
 *    herd of reconnects at the same millisecond.
 *  - watchPage: page lifecycle hooks (tab visible again, network back online, iOS bfcache restore).
 */

export class Liveness {
  #timer = null;
  #pendingAt = 0;
  #deadline = 0;
  #lastPing = 0;

  /**
   * @param {{pingMs:number, deadMs:number, ping:() => boolean|void, onDead:() => void}} o
   */
  constructor({ pingMs = 5000, deadMs = 12000, ping, onDead }) {
    this.pingMs = pingMs;
    this.deadMs = deadMs;
    this.ping = ping;
    this.onDead = onDead;
  }

  start() {
    this.stop();
    this.#pendingAt = 0;
    this.#lastPing = Date.now();
    this.#timer = setInterval(() => this.#tick(), Math.max(50, Math.min(1000, Math.floor(this.pingMs / 2))));
  }

  stop() {
    clearInterval(this.#timer);
    this.#timer = null;
    this.#pendingAt = 0;
  }

  /** Call for every message received on the socket: the link is alive. */
  seen() {
    this.#pendingAt = 0;
  }

  /** Check right now (tab came back, network changed): ping and expect an answer within `ms`. */
  probe(ms = 3000) {
    if (!this.#timer) return;
    this.#send();
    this.#deadline = Math.min(this.deadMs, ms);
  }

  #send() {
    const now = Date.now();
    this.#lastPing = now;
    try {
      if (this.ping() === false) return;
    } catch {
      return;
    }
    this.#pendingAt = now;
    this.#deadline = this.deadMs;
  }

  #tick() {
    const now = Date.now();
    if (this.#pendingAt && now - this.#pendingAt > this.#deadline) {
      this.stop();
      this.onDead();
      return;
    }
    if (!this.#pendingAt && now - this.#lastPing >= this.pingMs) this.#send();
  }
}

/** Exponential backoff with ±25 % jitter. */
export function backoffDelay(attempt, baseMs = 500, maxMs = 8000) {
  const d = Math.min(maxMs, baseMs * 2 ** Math.max(0, attempt));
  return Math.round(d * (0.75 + Math.random() * 0.5));
}

/**
 * Page lifecycle hooks. No-ops outside a browser.
 *   onVisible  tab/app is visible again (iOS resumes a backgrounded Safari here)
 *   onOnline   the browser reports the network is back (Wi-Fi ↔ cellular switch)
 *   onRestore  page restored from the back/forward cache: its sockets were closed
 *   onHide     page hidden or being unloaded ({persisted} = going into bfcache)
 * Returns an unsubscribe function.
 */
export function watchPage({ onVisible, onOnline, onRestore, onHide } = {}) {
  if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return () => {};
  const vis = () => {
    if (document.visibilityState === 'visible') onVisible?.();
    else onHide?.({ persisted: true });
  };
  const online = () => onOnline?.();
  const show = (e) => {
    if (e.persisted) onRestore?.();
  };
  const hide = (e) => onHide?.({ persisted: !!e.persisted });
  document.addEventListener('visibilitychange', vis);
  window.addEventListener('online', online);
  window.addEventListener('pageshow', show);
  window.addEventListener('pagehide', hide);
  return () => {
    document.removeEventListener('visibilitychange', vis);
    window.removeEventListener('online', online);
    window.removeEventListener('pageshow', show);
    window.removeEventListener('pagehide', hide);
  };
}

/** Small wrapper over sessionStorage that never throws (private mode, Node). */
export const session = {
  get(key) {
    try {
      return JSON.parse(globalThis.sessionStorage?.getItem(key) || 'null');
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      globalThis.sessionStorage?.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
  remove(key) {
    try {
      globalThis.sessionStorage?.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};
