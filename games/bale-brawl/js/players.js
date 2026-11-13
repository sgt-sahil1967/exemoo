// Players: where each fighter's SwordIntent comes from (PLAN.md 3.5).
//  - Player 1 inside the Exemoo shell: the phone the shell already paired (SDK packets).
//  - Everyone else (P2, and P1 outside the shell): their own ScreenLink PIN room, started by startPairing.
//  - No phone, or a silent one: the keyboard/mouse sword (keys.js).
import { ScreenLink } from '/js/screen-link.js';
import { normalizeButton } from '/js/protocol.js';
import { createKeySword } from './keys.js';

const PHONE_FRESH_MS = 1500;
const TITLES = ['Bale Brawl · Player 1 bopper', 'Bale Brawl · Player 2 bopper'];
const qr = (url) => (url ? `/api/qr?text=${encodeURIComponent(url)}` : '');

/**
 * @param {object} o
 * @param {object} o.exemoo   connectExemoo() result (or a stub)
 * @param {(i:number,b:string)=>void} o.onButton   phone button events, already normalised
 * @param {()=>void} o.onChange   connection / pin / usingPhone changed
 * @param {()=>object} o.createPhoneSword   factory for sword-input's PhoneSword
 * @param {HTMLCanvasElement} [o.canvas]   enables the mouse for player 1
 * @param {string[]} [o.colors]   pad theme colour per player
 */
export function createPlayers({ exemoo, onButton = () => {}, onChange = () => {}, createPhoneSword, canvas = null, colors = ['#ff3b30', '#2f7cff'] }) {
  const inShell = !!exemoo?.inShell;
  const info = fetch('/api/info').then((r) => r.json()).catch(() => null);
  const disposers = [];

  function make(n) {
    const phone = createPhoneSword();
    const keys = createKeySword({ keys: n, mouse: n === 0, canvas });
    const p = {
      n,
      connected: false,
      pin: '',
      url: '',
      lastPacket: 0,
      link: null,
      phone,
      keys,
      get qrSrc() { return this.connected ? '' : qr(this.url); },
      get usingPhone() { return this.connected && performance.now() - this.lastPacket < PHONE_FRESH_MS; },
      haptic: () => {},
      control: null,
    };
    p.control = {
      read(dt) {
        // Always step both so a sword that was idle does not hold stale one-shots.
        const k = keys.read(dt);
        if (p.usingPhone) return phone.read(dt);
        return k;
      },
      recenter() {
        phone.recenter();
        keys.recenter();
      },
    };
    return p;
  }
  const list = [make(0), make(1)];

  function onPacket(p, packet) {
    const was = p.usingPhone;
    p.lastPacket = performance.now();
    p.phone.push(packet);
    if (!was) onChange();
  }

  // ---- player 1 in the shell: the SDK phone ----
  if (inShell) {
    const p = list[0];
    p.haptic = (pattern) => exemoo.haptic(pattern);
    p.connected = !!exemoo.phone?.connected;
    disposers.push(
      exemoo.on('status', (s) => {
        const was = p.connected;
        p.connected = !!s.connected;
        if (p.connected && !was) exemoo.send?.({ t: 'theme', color: colors[0] });
        onChange();
      }),
      exemoo.on('packet', (packet) => onPacket(p, packet)),
      exemoo.on('button', (b) => onButton(0, normalizeButton(b))),
    );
  }

  /** Own PIN room for a player (created on first startPairing, then kept so the phone stays paired). */
  function ensureLink(p) {
    if (p.link) return p.link;
    const link = new ScreenLink({ storageKey: `bale-brawl.room.p${p.n + 1}` });
    p.link = link;
    p.haptic = (pattern) => link.connected && link.send({ t: 'haptic', pattern });
    link.on('room', (pin) => {
      p.pin = pin;
      info.then((i) => {
        const base = i?.padUrl || `${location.origin}/pad`;
        p.url = `${base}?pin=${pin}&layout=swing&title=${encodeURIComponent(TITLES[p.n])}`;
        onChange();
      });
    });
    link.on('status', (s) => {
      const ok = s === 'connected';
      if (ok && !p.connected) {
        link.send({ t: 'layout', layout: 'swing', title: TITLES[p.n], buttons: [], stream: true });
        link.send({ t: 'stream', on: true });
        link.send({ t: 'theme', color: colors[p.n] });
      }
      p.connected = ok;
      onChange();
    });
    link.on('packet', (packet) => onPacket(p, packet));
    link.on('message', (m) => {
      if (m && m.t === 'button') onButton(p.n, normalizeButton(m.b));
    });
    info.then((i) => {
      if (Array.isArray(i?.iceServers)) link.iceServers = i.iceServers;
      link.start();
    });
    return link;
  }

  const onHide = () => list.forEach((p) => p.link?.stop?.());
  addEventListener('pagehide', onHide);

  return {
    inShell,
    list,
    /** Start a PIN room for player n (0 or 1). P1 inside the shell already has a phone, so this is a no-op. */
    startPairing(n) {
      const p = list[n];
      if (n === 0 && inShell) return;
      ensureLink(p);
      onChange();
    },
    /** Stop an unused room. A phone that is already connected stays connected. */
    stopPairing(n) {
      const p = list[n];
      if (!p.link || p.connected) return;
      p.link.stop?.();
      p.link = null;
      p.pin = '';
      p.url = '';
      onChange();
    },
    recenter(n) {
      list[n]?.control.recenter();
    },
    /** Keyboard and mouse only react while true (turn off in menus so Enter and Space stay menu keys). */
    setKeysEnabled(on) {
      for (const p of list) p.keys.enabled = on;
    },
    dispose() {
      removeEventListener('pagehide', onHide);
      disposers.forEach((d) => d?.());
      for (const p of list) {
        p.link?.stop?.();
        p.keys.dispose();
      }
    },
  };
}
