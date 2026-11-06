// Host side of the phone controllers: talks to the /ws hub, keeps per-phone
// input state, and pushes lobby/HUD/haptic updates back to each phone.
import QRCode from 'qrcode';

export const PLAYER_COLORS = ['#ff3b30', '#2f7cff', '#2fc65a', '#ffd21f'];
const IDLE = { steer: 0, gas: false, brake: false, drift: false, item: false };

const SEATS_KEY = 'farmkart.phoneSeats', SEATS_TTL = 30 * 60e3;
export const STEER_MODES = { tilt: 'Tilt', buttons: 'Buttons', touch: 'Touch wheel' };

export class Phones {
  constructor(game) {
    this.game = game;
    this.list = new Map(); // id -> { id, connected, ready, slot, inp, lastIn, order, name, mode }
    this.order = 0;
    this.info = null;
    this.online = false;
    this.replaced = false; // another game tab took over the hub
    this.restoreSeats();
    this.backoff = 0;
    this.connect();
    this.fetchInfo();
    // heartbeat: TCP can stall silently on Wi-Fi / laptop sleep, so ping the hub and
    // reconnect if nothing comes back. Judged against the ping time (not the tick) so
    // background-tab timer throttling can't fake a timeout.
    setInterval(() => this.heartbeat(), 2500);
    const kick = () => { if (!document.hidden && !this.replaced) this.heartbeat(true); };
    addEventListener('online', kick);
    document.addEventListener('visibilitychange', kick);
    addEventListener('pagehide', () => this.saveSeats());
  }

  async fetchInfo() {
    try { this.info = await (await fetch('/api/info', { cache: 'no-store' })).json(); }
    catch { this.info = { urls: [] }; }
    this.game.onPhonesChanged();
  }

  // ---- seat persistence: a reloaded game page gives every phone its old seat back
  saveSeats() {
    const seats = {};
    for (const p of this.list.values()) if (p.slot >= 0 || p.spectate) seats[p.id] = { slot: p.slot, name: p.name, spectate: !!p.spectate, mode: p.mode || null, order: p.order };
    try { localStorage.setItem(SEATS_KEY, JSON.stringify({ at: Date.now(), room: this.game.room ?? null, seats })); } catch {}
  }
  restoreSeats() {
    let d; try { d = JSON.parse(localStorage.getItem(SEATS_KEY) || 'null'); } catch {}
    if (!d || !d.seats || Date.now() - d.at > SEATS_TTL) return;
    const list = Object.entries(d.seats).sort((a, b) => (a[1].order ?? 0) - (b[1].order ?? 0));
    for (const [id, v] of list) {
      const p = this.get(id);
      p.slot = Number.isInteger(v.slot) && v.slot < 4 ? v.slot : -1; p.name = v.name || null; p.spectate = !!v.spectate; p.mode = v.mode || null;
      p.restored = true; // not ready until it says hello again
    }
  }

  connect() {
    clearTimeout(this.retryT);
    if (this.ws) { const o = this.ws; this.ws = null; o.onopen = o.onclose = o.onmessage = o.onerror = null; try { o.close(); } catch {} this.dropped(); }
    const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws?role=host`);
    this.ws = ws; this.pingAt = 0; this.lastRx = performance.now(); this.openedAt = 0;
    const openTimer = setTimeout(() => { if (this.ws === ws && ws.readyState !== 1) this.connect(); }, 6000);
    ws.onopen = () => { clearTimeout(openTimer); this.online = true; this.replaced = false; this.backoff = 0; this.lastRx = performance.now(); this.game.onPhonesChanged(); };
    ws.onclose = e => {
      clearTimeout(openTimer);
      if (this.ws !== ws) return;
      this.ws = null;
      this.dropped();
      if (e.code === 4000) { this.replaced = true; this.game.onHostReplaced?.(); return; } // don't fight another tab
      this.scheduleRetry();
    };
    ws.onerror = () => {};
    ws.onmessage = e => {
      if (this.ws !== ws) return;
      this.lastRx = performance.now();
      let m; try { m = JSON.parse(e.data); } catch { return; }
      if (m.t === 'pong') return;
      this.handle(m);
    };
  }
  dropped() {
    const was = this.online;
    this.online = false;
    // keep ready/slot so phones re-helloing after a hub blip aren't announced as new
    for (const p of this.list.values()) { p.connected = false; p.inp = { ...IDLE }; }
    if (was) this.game.onPhonesChanged();
  }
  scheduleRetry() {
    clearTimeout(this.retryT);
    const d = Math.min(5000, 400 * 2 ** this.backoff++) * (.75 + Math.random() * .5);
    this.retryT = setTimeout(() => this.connect(), d);
  }
  reclaim() { this.replaced = false; this.backoff = 0; this.connect(); }
  heartbeat(force) {
    if (this.replaced) return;
    const ws = this.ws, now = performance.now();
    if (!ws) { if (force) { this.backoff = 0; this.connect(); } return; }
    if (ws.readyState !== 1) return;
    if (this.pingAt && this.lastRx < this.pingAt && now - this.pingAt > 5000) { this.connect(); return; } // dead socket
    if (force || !this.pingAt || this.lastRx >= this.pingAt) { this.pingAt = now; try { ws.send('{"t":"ping"}'); } catch {} }
  }

  send(to, m) { if (this.ws?.readyState === 1) try { this.ws.send(JSON.stringify({ ...m, to })); } catch {} }

  get(id) {
    if (!this.list.has(id)) this.list.set(id, { id, connected: false, ready: false, slot: -1, inp: { ...IDLE }, lastIn: 0, order: this.order++, name: null, mode: null });
    return this.list.get(id);
  }

  handle(m) {
    const g = this.game;
    if (m.t === 'join') { const p = this.get(m.id); p.connected = true; g.onPhonesChanged(); return; }
    const p = this.get(m.id);
    switch (m.t) {
      case 'leave': p.connected = false; p.ready = false; p.inp = { ...IDLE }; g.onPhoneLeft(p); break;
      case 'hello': p.connected = true; if (m.steer in STEER_MODES) p.mode = m.steer; g.onPhoneHello(p, m); p.restored = false; this.saveSeats(); break;
      case 'mode': if (m.m in STEER_MODES && p.mode !== m.m) { p.mode = m.m; this.saveSeats(); g.onPhonesChanged(); } break;
      case 'name': if (p.ready) g.onPhoneName(p, m.name); break;
      case 'seat': if (p.ready && Number.isInteger(m.seat)) g.onPhoneSeat(p, m.seat); break;
      case 'unseat': if (p.ready) g.onPhoneUnseat(p); break;
      case 'in':
        if (!p.ready) break;
        p.inp = { steer: Math.max(-1, Math.min(1, +m.s || 0)), gas: !!m.g, brake: !!m.b, drift: !!m.d, item: !!m.i };
        p.lastIn = performance.now();
        break;
      case 'char': if (p.slot >= 0 && Number.isInteger(m.c)) g.setChar(p.slot, m.c); break;
      case 'map': if (p.slot >= 0 && Number.isInteger(m.m)) g.setMap(m.m); break;
      case 'start': case 'again': case 'menu': case 'pause': g.phoneCommand(m.t, p); break;
    }
  }

  bySlot(slot) {
    for (const p of this.list.values()) if (p.slot === slot && p.connected) return p;
    return null;
  }
  slotHolder(slot) { for (const p of this.list.values()) if (p.slot === slot) return p; return null; }

  input(slot) {
    const p = this.bySlot(slot);
    // drop stale input if the phone went quiet (sleep, Wi-Fi hiccup)
    if (!p || !p.ready || performance.now() - p.lastIn > 1000) return IDLE;
    return p.inp;
  }

  buzz(slot, pattern) { const p = this.bySlot(slot); if (p) this.send(p.id, { t: 'buzz', p: pattern }); }

  kick(p) {
    this.send(p.id, { t: 'kicked' });
    p.slot = -1; p.ready = false; p.inp = { ...IDLE };
    this.saveSeats();
  }

  async drawQR(canvas, url, width = 170) {
    if (!url) { canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); return; }
    if (canvas.dataset.url === url) return;
    canvas.dataset.url = url;
    await QRCode.toCanvas(canvas, url, { margin: 1, width, color: { dark: '#1b1b3a', light: '#ffffff' } });
  }
}
