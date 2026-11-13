// Players: where each cart's CartIntent comes from (PLAN.md 5.4).
//  - Seat 1 inside the Exemoo shell: the phone the shell already paired (SDK packets).
//  - Every other seat (and all four outside the shell): its own ScreenLink PIN room, started by startPairing.
//  - No phone, or a silent one: that seat's keys (keys.js). A seat is "joined" when its phone connects or its
//    charge key is pressed while joining is open (the lobby).
import { ScreenLink } from '/js/screen-link.js';
import { normalizeButton, buttonBit } from '/js/protocol.js';
import { createKeyCart, KEY_SETS } from './keys.js';

const PHONE_FRESH_MS = 1500;
const ACTION = buttonBit('action');
const COLORS = ['#ff3b30', '#2f7cff', '#2fc65a', '#ffd21f'];
const qr = (url) => (url ? `/api/qr?text=${encodeURIComponent(url)}` : '');

/**
 * @param {object} o
 * @param {object} o.exemoo   connectExemoo() result (or a stub)
 * @param {(i:number,b:string)=>void} o.onButton   phone button events, already normalised
 * @param {()=>void} o.onChange   connection / pin / usingPhone / joined changed
 * @param {()=>object} o.createPhoneTilt   factory from tilt-input.js (main.js passes it so a missing file can fall back to the stub)
 * @param {string[]} [o.colors]   pad theme colour per seat
 */
export function createPlayers({ exemoo, onButton = () => {}, onChange = () => {}, createPhoneTilt, colors = COLORS }) {
  const inShell = !!exemoo?.inShell;
  const info = fetch('/api/info').then((r) => r.json()).catch(() => null);
  const disposers = [];

  function make(n) {
    const phone = createPhoneTilt();
    const p = {
      n,
      connected: false,
      pin: '',
      url: '',
      lastPacket: 0,
      link: null,
      joinOpen: false,
      keyJoined: false,
      phone,
      keys: null,
      get qrSrc() { return this.connected ? '' : qr(this.url); },
      get usingPhone() { return this.connected && performance.now() - this.lastPacket < PHONE_FRESH_MS; },
      get joined() { return this.connected || this.keyJoined || (n === 0 && inShell); },
      haptic: () => {},
      control: null,
    };
    p.keys = createKeyCart({
      keys: KEY_SETS[n],
      onPress: () => {
        if (!p.joinOpen || p.joined) return false;
        p.keyJoined = true;
        onChange();
        return true;
      },
    });
    p.control = {
      read(dt) {
        // Always step both so the idle one does not hold stale state.
        const k = p.keys.read(dt);
        const ph = phone.read(dt);
        return p.usingPhone ? ph : k;
      },
      recenter() {
        phone.recenter();
        p.keys.recenter();
      },
    };
    return p;
  }
  const list = [make(0), make(1), make(2), make(3)];

  function onPacket(p, packet) {
    const was = p.usingPhone;
    p.lastPacket = performance.now();
    p.phone.push(packet, !!((packet?.buttons || 0) & ACTION));
    if (!was) onChange();
  }

  // ---- seat 1 in the shell: the SDK phone ----
  if (inShell) {
    const p = list[0];
    p.haptic = (pattern) => exemoo.haptic(pattern);
    p.connected = !!exemoo.phone?.connected;
    if (p.connected) exemoo.send?.({ t: 'theme', color: colors[0] });
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

  /** Own PIN room for a seat (created on first startPairing, then kept so the phone stays paired). */
  function ensureLink(p) {
    if (p.link) return p.link;
    const title = `Bumper Carts · Player ${p.n + 1}`;
    const link = new ScreenLink({ storageKey: `bumper-carts.room.p${p.n + 1}` });
    p.link = link;
    p.haptic = (pattern) => link.connected && link.send({ t: 'haptic', pattern });
    link.on('room', (pin) => {
      p.pin = pin;
      info.then((i) => {
        const base = i?.padUrl || `${location.origin}/pad`;
        p.url = `${base}?pin=${pin}&layout=swing&title=${encodeURIComponent(title)}`;
        onChange();
      });
    });
    link.on('status', (s) => {
      const ok = s === 'connected';
      if (ok && !p.connected) {
        link.send({ t: 'layout', layout: 'swing', title, buttons: [], stream: true });
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
    /** Open seat n for joining (lobby): starts its PIN room (not for the shell phone) and arms its join key. */
    startPairing(n) {
      const p = list[n];
      p.joinOpen = true;
      if (!(n === 0 && inShell)) ensureLink(p);
      onChange();
    },
    /** Close joining. An unused room is stopped, a connected phone stays; key-joins are cleared. */
    stopPairing(n) {
      const p = list[n];
      p.joinOpen = false;
      p.keyJoined = false;
      if (p.link && !p.connected) {
        p.link.stop?.();
        p.link = null;
        p.pin = '';
        p.url = '';
      }
      onChange();
    },
    /** Arm or disarm the charge-key join for every seat (the lobby turns it on, a round turns it off). */
    setJoining(on) {
      for (const p of list) p.joinOpen = !!on;
    },
    recenter(n) {
      list[n]?.control.recenter();
    },
    /** Keys only drive while true (off in menus so Enter and Space stay menu keys). */
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
