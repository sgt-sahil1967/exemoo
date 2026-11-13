// Exemoo adapter for Farm Kart: replaces src/phones.js (see vite.config.js) with the same `Phones` API,
// backed by Exemoo pairing instead of Farm Kart's own WebSocket hub and LAN phone server.
//
//  • Seat 1 (in the Exemoo shell) is the phone the shell already paired, via the SDK.
//  • Every other seat (all four when /play/farm-kart/ is opened directly) gets its own PIN room
//    (ScreenLink over /signal). Its QR opens /pad?pin=…&layout=kart, so a scan drops straight into that seat.
//  • In a race the phone shows the /pad "kart" layout (tilt wheel or ◀ ▶ buttons, DRIFT / BRAKE / ITEM / GAS),
//    which sends the same {t:'in', s, g, b, d, i} messages as Farm Kart's own pad. Pos / lap / item go
//    back as {t:'kartHud'}, hits and finishes as vibration.
//  • In menus the phone shows the "remote" layout: the d-pad moves a focus ring over the TV's buttons
//    (spatial navigation), GO clicks, Back goes back, and Racer < / > change that player's racer.
//
// The game code (src/, mirrored from ../farm-kart) is unchanged: it calls the methods below and the
// game callbacks onPhoneHello / onPhoneLeft / setChar / phoneCommand exactly as with the hub.
import QRCode from 'qrcode';
import { PLAYER_COLORS, STEER_MODES } from '../src/phones.js';
import { CHARACTERS } from '../src/models.js';
import { connectExemoo } from '../../../public/sdk/exemoo.js';
import { ScreenLink } from '../../../public/js/screen-link.js';
import { normalizeButton } from '../../../public/js/protocol.js';
import { createNav } from './nav.js';

// Everything else upstream exports (PLAYER_COLORS, STEER_MODES, …) passes through; the local Phones wins.
export * from '../src/phones.js';
const IDLE = { steer: 0, gas: false, brake: false, drift: false, item: false };
const QR_BASE = 'exemoo:'; // phones.info.urls[0]: joinUrl() builds `exemoo:?room=…&seat=N`, drawQR() maps it to a PIN room
const $ = (id) => document.getElementById(id);

export class Phones {
  constructor(game) {
    this.game = game;
    this.list = new Map();
    this.order = 0;
    this.online = true;
    this.info = { urls: [QR_BASE] };
    // Gyro cursor over the menus (title, setup, pause, results): everywhere except while racing.
    const menuUp = () => !!(this.game.cfg && this.game.track) && (!this.game.inRace() || !!this.game.paused);
    this.sdk = connectExemoo({ layout: 'remote', title: 'Farm Kart', menuCursor: menuUp });
    this.inShell = this.sdk.inShell;
    this.padBase = `${location.origin}/pad`;
    this.nav = createNav();
    /** One PIN room (ScreenLink) per seat that isn't the shell's phone: seat → link */
    this.rooms = new Map();
    this.fixPage();
    window.__farmKartPhones = this; // for debugging / tests

    const ready = fetch('/api/info', { cache: 'no-store' }).then((r) => r.json()).catch(() => null);
    ready.then((i) => {
      if (i?.padUrl) this.padBase = i.padUrl;
      this.changed();
    });
    if (this.inShell) this.attachShellPhone();
    for (let s = this.inShell ? 1 : 0; s < 4; s++) this.attachRoom(s, ready);
  }

  changed() {
    // Pairing events can arrive while the Game constructor is still running: retry once it's done.
    if (this.game.cfg && this.game.track) this.game.onPhonesChanged();
    else setTimeout(() => this.changed(), 100);
  }

  // ───────────────────────────── transports ─────────────────────────────
  attachShellPhone() {
    const p = this.get('exemoo');
    p.seat = 0;
    p.out = (m) => this.sdk.send(m);
    p.haptic = (pattern) => this.sdk.haptic(pattern);
    p.setLayout = (layout, title, buttons) => this.sdk.setLayout(layout, title, buttons);
    this.sdk.on('status', (s) => this.setConnected(p, s.connected));
    this.sdk.on('button', (b) => this.onButton(p, b));
    this.sdk.on('message', (m) => this.onMessage(p, m));
  }

  attachRoom(seat, ready) {
    const link = new ScreenLink({ storageKey: `farmkart.exemoo.room${seat + 1}` });
    this.rooms.set(seat, link);
    const p = this.get(`room${seat + 1}`);
    p.seat = seat;
    p.out = (m) => link.connected && link.send(m);
    p.haptic = (pattern) => link.connected && link.send({ t: 'haptic', pattern });
    p.setLayout = (layout, title, buttons) => link.connected && link.send({ t: 'layout', layout, title, buttons });
    // A resumed room keeps its PIN without a 'room' event, so the QR reads link.pin and redraws on status too.
    link.on('room', () => this.changed());
    link.on('status', (s) => {
      this.setConnected(p, s === 'connected');
      this.changed();
    });
    link.on('message', (m) => (m.t === 'button' ? this.onButton(p, normalizeButton(m.b)) : this.onMessage(p, m)));
    ready.then((i) => {
      if (Array.isArray(i?.iceServers)) link.iceServers = i.iceServers;
      link.start();
    });
  }

  setConnected(p, on) {
    if (on === p.connected) return;
    p.connected = on;
    p.sent = '';
    if (!this.game.cfg || !this.game.track) return setTimeout(() => this.setConnected(p, on), 100);
    if (on) {
      p.out({ t: 'theme', color: PLAYER_COLORS[p.seat] });
      this.hello(p);
    } else {
      p.inp = { ...IDLE };
      this.game.onPhoneLeft(p);
    }
  }

  /** Same as the Farm Kart pad's hello: the seat comes from which QR / PIN the phone used. */
  hello(p) {
    this.game.onPhoneHello(p, { room: this.game.room, seat: p.seat + 1, name: `Phone ${p.seat + 1}` });
  }

  // ───────────────────────────── phone → game ─────────────────────────────
  onMessage(p, m) {
    if (m.t === 'mode' && STEER_MODES && m.m in STEER_MODES && p.mode !== m.m) {
      p.mode = m.m; // shown on the TV's player card (tilt / buttons / touch wheel)
      return this.changed();
    }
    if (m.t !== 'in' || !p.ready) return;
    p.inp = { steer: Math.max(-1, Math.min(1, +m.s || 0)), gas: !!m.g, brake: !!m.b, drift: !!m.d, item: !!m.i };
    p.lastIn = performance.now();
  }

  onButton(p, b) {
    const g = this.game;
    if (!g.cfg || !g.track) return;
    if (!p.ready && p.connected && b === 'action') return this.hello(p); // removed from the TV: GO rejoins
    if (b === 'pause') {
      if (g.inRace()) return void (p.slot >= 0 && g.phoneCommand('pause', p));
      return this.nav.back();
    }
    if (g.inRace() && !g.paused) return; // kart layout: driving input arrives as {t:'in'}
    if ((b === 'racer-prev' || b === 'racer-next') && p.slot >= 0) {
      const n = CHARACTERS.length;
      return g.setChar(p.slot, (g.cfg.pl[p.slot].char + (b === 'racer-next' ? 1 : n - 1)) % n);
    }
    if (b === 'back') return this.nav.back();
    if (b === 'action' || b === 'up' || b === 'down' || b === 'left' || b === 'right') this.nav.press(b);
  }

  // ───────────────────────────── game → phone ─────────────────────────────
  send(id, m) {
    const p = this.list.get(id);
    if (!p?.connected) return;
    if (m.t === 'you') this.syncLayout(p, m);
    else if (m.t === 'hud') p.out({ ...m, t: 'kartHud' });
    else if (m.t === 'buzz') p.haptic(m.p || 40);
    else if (m.t === 'kicked') this.syncLayout(p, { slot: -1, state: 'menu' });
    // 'assets' / 'denied': the TV shows racers and tracks, so phones don't need them.
  }

  /** Kart layout while racing, remote (menu navigation) otherwise. Only sent when it changes. */
  syncLayout(p, you) {
    const seated = you.slot >= 0;
    const racing = seated && you.state === 'race';
    const title = seated ? `Farm Kart · P${you.slot + 1}` : 'Farm Kart · watching';
    const buttons = seated && you.state === 'menu' ? [{ b: 'racer-prev', label: 'Racer <' }, { b: 'racer-next', label: 'Racer >' }] : [];
    const layout = racing ? 'kart' : 'remote';
    const key = `${layout}|${title}|${buttons.length}|${you.color}`;
    if (p.sent === key) return;
    p.sent = key;
    p.setLayout(layout, title, buttons);
    if (you.color) p.out({ t: 'theme', color: you.color });
  }

  // ───────────────────────────── API used by main.js ─────────────────────────────
  /** Upstream persists seats for its own hub reconnects; Exemoo rooms resume by PIN, so nothing to do. */
  saveSeats() {}
  /** Upstream: take the phones back from another tab. Exemoo rooms are per tab, so nothing to do. */
  reclaim() {}
  get(id) {
    if (!this.list.has(id)) this.list.set(id, { id, connected: false, ready: false, slot: -1, inp: { ...IDLE }, lastIn: 0, order: this.order++, name: null, seat: 0, sent: '', out() {}, haptic() {}, setLayout() {} });
    return this.list.get(id);
  }
  bySlot(slot) {
    for (const p of this.list.values()) if (p.slot === slot && p.connected) return p;
    return null;
  }
  slotHolder(slot) {
    for (const p of this.list.values()) if (p.slot === slot) return p;
    return null;
  }
  input(slot) {
    const p = this.bySlot(slot);
    if (!p || performance.now() - p.lastIn > 1500) return IDLE;
    return p.inp;
  }
  buzz(slot, pattern) {
    this.bySlot(slot)?.haptic(pattern);
  }
  kick(p) {
    p.slot = -1;
    p.ready = false;
    p.inp = { ...IDLE };
    this.syncLayout(p, { slot: -1, state: 'menu' });
  }

  /** `url` is joinUrl(seat) (`exemoo:?…&seat=N`) or joinUrl(null) for the next free seat. */
  async drawQR(canvas, url, width = 170) {
    const seat = this.seatFor(url);
    const pin = seat == null ? '' : this.rooms.get(seat)?.pin;
    const pad = pin ? `${this.padBase}?pin=${pin}&layout=kart&title=${encodeURIComponent(`Farm Kart · P${seat + 1}`)}` : '';
    if (canvas.id === 'qr') this.panelText(seat, pin);
    const label = canvas.nextElementSibling;
    if (label && pin && canvas.parentElement?.classList.contains('seat-qr')) label.textContent = `Scan to play as Player ${seat + 1} · PIN ${pin}`;
    if (!pad) {
      delete canvas.dataset.url;
      return void canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    }
    if (canvas.dataset.url === pad) return;
    canvas.dataset.url = pad;
    await QRCode.toCanvas(canvas, pad, { margin: 1, width, color: { dark: '#1b1b3a', light: '#ffffff' } });
  }
  seatFor(url) {
    if (!url) return null;
    const m = /seat=(\d)/.exec(url);
    if (m) return +m[1] - 1;
    // Main QR: the first seat whose room has no phone yet.
    for (const [s] of this.rooms) if (!this.list.get(`room${s + 1}`)?.connected) return s;
    return null;
  }

  // ───────────────────────────── page tweaks ─────────────────────────────
  panelText(seat, pin) {
    const host = this.padBase.replace(/^https?:\/\//, '');
    $('join-url').textContent = pin ? `${host}  ·  PIN ${pin}` : seat == null ? 'every seat has a phone' : 'opening a PIN…';
    const h = $('phone-panel')?.querySelector('h3');
    if (h?.lastChild?.nodeType === 3) h.lastChild.textContent = seat == null ? ' Phones' : ` Add Player ${seat + 1}`;
  }

  /** Swap Farm Kart's LAN-server pairing copy for Exemoo's, and add the exit button. */
  fixPage() {
    const style = document.createElement('style');
    style.textContent = `
      .room-row,#btn-newcode{display:none!important}
      .fk-focus{outline:6px solid #ffd21f!important;outline-offset:4px;box-shadow:0 0 0 12px #1b1b3a55!important;z-index:2;position:relative}
      .exemoo-exit{position:fixed;left:16px;top:16px;z-index:30}`;
    document.head.append(style);
    const info = $('phone-panel')?.querySelector('.phone-info');
    if (info) {
      const ps = info.querySelectorAll('p');
      if (ps[0]) ps[0].textContent = 'Scan with a phone to add a player, or open this and type the PIN:';
      if (ps[1]) ps[1].textContent = this.inShell
        ? 'Player 1 is the phone you paired with Exemoo. Each player card has its own QR. On the phone: arrows move, GO picks, Racer < > changes racer.'
        : 'Each player card has its own QR to take that seat. On the phone: arrows move, GO picks, Racer < > changes racer.';
    }
    const tag = $('title')?.querySelector('.hint-pill');
    if (tag?.lastChild?.nodeType === 3) tag.lastChild.textContent = ' Tilt or tap your phone to steer · up to 4 players';
    if (this.inShell) {
      const exit = document.createElement('button');
      exit.className = 'btn blue exemoo-exit';
      exit.textContent = 'Exemoo Menu';
      exit.onclick = () => this.sdk.exit();
      $('title')?.append(exit);
    }
  }
}
