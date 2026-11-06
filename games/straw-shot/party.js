// Exemoo party kit: up to four players, each with a phone (or keyboard keys, or a CPU stand-in),
// plus the shared flow every party minigame uses:
//   title + how to play -> lobby (pair phones, join on keys, CPU rivals) -> 3-2-1 countdown -> round
//   -> FINISH -> results / winner -> play again, change players, or exit to Exemoo.
//
// Phones: player 1 is the phone the Exemoo shell already paired (SDK). Players 2-4 pair their own phone
// through a separate PIN room (ScreenLink), the same way Rapids Row and Farm Kart add extra phones.
// Opened outside the shell, every player gets a PIN room. All phones use the `swing` pad layout, which
// streams motion (~60 Hz) and has the big Action button, Pause, Recenter and a d-pad for menus.
//
// Straw Shot copy: extended from the kit in games/shake-freeze with up/down keys per player (aiming),
// the held Action state passed to game.packet(), and archery icons.
import { connectExemoo } from '/sdk/exemoo.js';
import { ScreenLink } from '/js/screen-link.js';
import { normalizeButton } from '/js/protocol.js';
import { createAudio } from './sfx.js';
import { ANIMAL_NAMES, portrait } from './art.js';

export const SLOTS = [
  { color: '#ff3b30', name: 'Red', animal: 'cow', keys: { up: 'KeyW', left: 'KeyA', down: 'KeyS', right: 'KeyD', action: 'Space' }, keyNames: ['W A S D', 'Space'] },
  { color: '#2f7cff', name: 'Blue', animal: 'pig', keys: { up: 'KeyI', left: 'KeyJ', down: 'KeyK', right: 'KeyL', action: 'KeyU' }, keyNames: ['I J K L', 'U'] },
  { color: '#2fc65a', name: 'Green', animal: 'sheep', keys: { up: 'ArrowUp', left: 'ArrowLeft', down: 'ArrowDown', right: 'ArrowRight', action: 'Enter' }, keyNames: ['Arrows', 'Enter'] },
  { color: '#ffd21f', name: 'Yellow', animal: 'chick', keys: { up: 'KeyT', left: 'KeyF', down: 'KeyG', right: 'KeyH', action: 'KeyR' }, keyNames: ['T F G H', 'R'] },
];

const ICONS = {
  aim: `<svg viewBox="0 0 80 80"><circle cx="54" cy="26" r="16" fill="#fff" stroke="#1b1b3a" stroke-width="4"/><circle cx="54" cy="26" r="6" fill="#ff3b30" stroke="#1b1b3a" stroke-width="3"/><path d="M54 4 v8 M54 40 v8 M32 26 h8 M68 26 h8" stroke="#1b1b3a" stroke-width="4" stroke-linecap="round"/><g transform="rotate(40 26 54)"><rect x="14" y="34" width="24" height="44" rx="7" fill="#2f7cff" stroke="#1b1b3a" stroke-width="4"/><rect x="19" y="40" width="14" height="26" rx="3" fill="#bfe8ff" stroke="#1b1b3a" stroke-width="3"/></g></svg>`,
  bow: `<svg viewBox="0 0 80 80"><path d="M22 8 Q62 40 22 72" fill="none" stroke="#1b1b3a" stroke-width="10" stroke-linecap="round"/><path d="M22 8 Q62 40 22 72" fill="none" stroke="#d48a3a" stroke-width="5" stroke-linecap="round"/><path d="M22 8 L8 40 L22 72" fill="none" stroke="#1b1b3a" stroke-width="3"/><path d="M8 40 H72" stroke="#1b1b3a" stroke-width="5" stroke-linecap="round"/><path d="M64 33 L74 40 L64 47" fill="#ffd21f" stroke="#1b1b3a" stroke-width="3" stroke-linejoin="round"/><path d="M8 40 l-4 -7 M8 40 l-4 7 M14 40 l-4 -7 M14 40 l-4 7" stroke="#ff3b30" stroke-width="4" stroke-linecap="round"/></svg>`,
  target: `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="#f2c45a" stroke="#1b1b3a" stroke-width="4"/><circle cx="40" cy="40" r="25" fill="#fff" stroke="#1b1b3a" stroke-width="3"/><circle cx="40" cy="40" r="18" fill="#2f7cff" stroke="#1b1b3a" stroke-width="3"/><circle cx="40" cy="40" r="11" fill="#ff3b30" stroke="#1b1b3a" stroke-width="3"/><circle cx="40" cy="40" r="5" fill="#ffd21f" stroke="#1b1b3a" stroke-width="3"/><path d="M58 18 L44 36" stroke="#1b1b3a" stroke-width="4" stroke-linecap="round"/><path d="M58 18 l8 -2 M58 18 l2 -8" stroke="#2fc65a" stroke-width="4" stroke-linecap="round"/></svg>`,
  wind: `<svg viewBox="0 0 80 80"><path d="M14 8 V74" stroke="#1b1b3a" stroke-width="5" stroke-linecap="round"/><path d="M16 12 L66 20 L64 34 L16 36 Z" fill="#ff3b30" stroke="#1b1b3a" stroke-width="4" stroke-linejoin="round"/><path d="M40 16 L40 35" stroke="#fff" stroke-width="5"/><path d="M30 52 h30 a6 6 0 1 0 -6 -6 M24 62 h22 a5 5 0 1 1 -5 5" fill="none" stroke="#1b1b3a" stroke-width="4" stroke-linecap="round"/></svg>`,
  shake: `<svg viewBox="0 0 80 80"><g stroke="#1b1b3a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M14 22 l-6 6 l6 6 M14 46 l-6 6 l6 6 M66 22 l6 6 l-6 6 M66 46 l6 6 l-6 6"/></g>
    <g transform="rotate(-12 40 40)"><rect x="26" y="12" width="28" height="56" rx="7" fill="#ffd21f" stroke="#1b1b3a" stroke-width="4"/><rect x="31" y="19" width="18" height="34" rx="3" fill="#bfe8ff" stroke="#1b1b3a" stroke-width="3"/><circle cx="40" cy="60" r="3" fill="#1b1b3a"/></g></svg>`,
  still: `<svg viewBox="0 0 80 80"><rect x="26" y="12" width="28" height="56" rx="7" fill="#7fd3ff" stroke="#1b1b3a" stroke-width="4"/><rect x="31" y="19" width="18" height="34" rx="3" fill="#fff" stroke="#1b1b3a" stroke-width="3"/><rect x="34" y="27" width="4" height="18" rx="2" fill="#ff3b30"/><rect x="42" y="27" width="4" height="18" rx="2" fill="#ff3b30"/><g stroke="#1b1b3a" stroke-width="4" stroke-linecap="round"><path d="M10 16 l8 8 M70 16 l-8 8 M10 64 l8 -8 M70 64 l-8 -8"/></g></svg>`,
  tilt: `<svg viewBox="0 0 80 80"><path d="M14 30 Q40 6 66 30" fill="none" stroke="#1b1b3a" stroke-width="4" stroke-linecap="round"/><path d="M60 22 l7 9 l-11 2" fill="none" stroke="#1b1b3a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><g transform="rotate(18 40 52)"><rect x="12" y="42" width="56" height="22" rx="7" fill="#2fc65a" stroke="#1b1b3a" stroke-width="4"/><rect x="20" y="47" width="36" height="12" rx="3" fill="#bfe8ff" stroke="#1b1b3a" stroke-width="3"/></g></svg>`,
  button: `<svg viewBox="0 0 80 80"><rect x="22" y="8" width="36" height="64" rx="8" fill="#2f7cff" stroke="#1b1b3a" stroke-width="4"/><rect x="27" y="15" width="26" height="46" rx="4" fill="#bfe8ff" stroke="#1b1b3a" stroke-width="3"/><circle cx="40" cy="38" r="11" fill="#ff3b30" stroke="#1b1b3a" stroke-width="4"/><circle cx="37" cy="35" r="3" fill="#fff" opacity=".7"/><g stroke="#1b1b3a" stroke-width="4" stroke-linecap="round"><path d="M8 30 h8 M8 46 h8 M64 30 h8 M64 46 h8"/></g></svg>`,
  flick: `<svg viewBox="0 0 80 80"><path d="M18 64 Q14 26 52 14" fill="none" stroke="#1b1b3a" stroke-width="4" stroke-linecap="round"/><path d="M44 8 l10 6 l-7 9" fill="none" stroke="#1b1b3a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><g transform="rotate(-35 46 50)"><rect x="34" y="26" width="24" height="48" rx="7" fill="#ff3b30" stroke="#1b1b3a" stroke-width="4"/><rect x="39" y="32" width="14" height="30" rx="3" fill="#bfe8ff" stroke="#1b1b3a" stroke-width="3"/></g></svg>`,
  trophy: `<svg viewBox="0 0 80 80"><path d="M24 14 h32 v14 a16 16 0 0 1 -32 0z" fill="#ffd21f" stroke="#1b1b3a" stroke-width="4" stroke-linejoin="round"/><path d="M24 18 h-9 a9 9 0 0 0 11 13 M56 18 h9 a9 9 0 0 1 -11 13" fill="none" stroke="#1b1b3a" stroke-width="4"/><rect x="35" y="43" width="10" height="12" fill="#ffd21f" stroke="#1b1b3a" stroke-width="4"/><rect x="24" y="55" width="32" height="11" rx="3" fill="#2f7cff" stroke="#1b1b3a" stroke-width="4"/><path d="M31 20 v8" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/></svg>`,
  timer: `<svg viewBox="0 0 80 80"><circle cx="40" cy="44" r="26" fill="#fff" stroke="#1b1b3a" stroke-width="4"/><rect x="34" y="8" width="12" height="9" rx="2" fill="#ff3b30" stroke="#1b1b3a" stroke-width="4"/><path d="M40 44 V28 M40 44 l10 8" stroke="#1b1b3a" stroke-width="5" stroke-linecap="round"/><path d="M40 18 a26 26 0 0 1 26 26 H40z" fill="#ffd21f" opacity=".7"/></svg>`,
  eye: `<svg viewBox="0 0 80 80"><path d="M6 40 Q40 6 74 40 Q40 74 6 40z" fill="#fff" stroke="#1b1b3a" stroke-width="4" stroke-linejoin="round"/><circle cx="40" cy="40" r="14" fill="#ff3b30" stroke="#1b1b3a" stroke-width="4"/><circle cx="40" cy="40" r="6" fill="#1b1b3a"/><circle cx="35" cy="34" r="3" fill="#fff"/></svg>`,
  basket: `<svg viewBox="0 0 80 80"><ellipse cx="32" cy="30" rx="9" ry="12" fill="#fff6e0" stroke="#1b1b3a" stroke-width="4"/><ellipse cx="48" cy="28" rx="9" ry="12" fill="#fff6e0" stroke="#1b1b3a" stroke-width="4"/><path d="M12 38 h56 l-7 30 h-42z" fill="#d48a3a" stroke="#1b1b3a" stroke-width="4" stroke-linejoin="round"/><path d="M18 48 h44 M20 58 h40" stroke="#a8642a" stroke-width="4"/></svg>`,
  pancake: `<svg viewBox="0 0 80 80"><ellipse cx="40" cy="52" rx="30" ry="10" fill="#e8a53c" stroke="#1b1b3a" stroke-width="4"/><ellipse cx="40" cy="44" rx="30" ry="10" fill="#ffc95c" stroke="#1b1b3a" stroke-width="4"/><path d="M40 34 q-2 -10 6 -14" fill="none" stroke="#1b1b3a" stroke-width="4" stroke-linecap="round"/><rect x="30" y="36" width="16" height="8" rx="3" fill="#fff6c4" stroke="#1b1b3a" stroke-width="3"/><path d="M8 20 q6 -8 12 0 M60 16 q6 -8 12 0" fill="none" stroke="#1b1b3a" stroke-width="3" stroke-linecap="round"/></svg>`,
};
export const icon = (name) => ICONS[name] || ICONS.button;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/**
 * game = {
 *   id, title, tagline, accent, howTo: [{ icon, title, text }], keysHelp, roundSeconds?, music: {...sfx cfg},
 *   start(players, { demo }), update(dt, party), draw(ctx, w, h, party),
 *   packet?(p, packet), action?(p), press?(p, which), recenter?(p), onGo?(), onFinish?(), hudText?(party),
 *   results() -> [{ p, score, text }]
 * }
 */
export function startParty(game) {
  const audio = createAudio(game.music || {});
  const exemoo = connectExemoo({ layout: 'swing', title: game.title, stream: true });
  const inShell = exemoo.inShell;
  const info = fetch('/api/info').then((r) => r.json()).catch(() => null);

  // ───────────── DOM ─────────────
  const ui = document.getElementById('ui');
  ui.innerHTML = `
    <div id="hud" class="hud" hidden><span id="hudTxt"></span></div>
    <div id="count" class="count"></div>
    <div id="banner" class="banner"></div>
    <div id="toast" class="toast"></div>
    <section class="screen" id="sTitle" hidden></section>
    <section class="screen" id="sLobby" hidden></section>
    <section class="screen" id="sPause" hidden></section>
    <section class="screen" id="sResults" hidden></section>`;
  const $ = (id) => document.getElementById(id);
  document.documentElement.style.setProperty('--accent', game.accent || '#ff3b30');

  // ───────────── players ─────────────
  let cpuFill = true;
  try {
    cpuFill = localStorage.getItem(`${game.id}.cpu`) !== '0';
  } catch {
    /* ignore */
  }
  const players = SLOTS.map((s, n) => ({
    n,
    ...s,
    label: `${s.name} ${ANIMAL_NAMES[s.animal]}`,
    viaKeys: n === 0,
    kind: null, // 'human' | 'cpu' | null, fixed for a round
    phone: { connected: false, pin: '', url: '', link: null, lastPacket: 0, act: false },
    down: new Set(),
    wins: 0,
    haptic: () => {},
    get usingPhone() {
      return this.phone.connected && performance.now() - this.phone.lastPacket < 1500;
    },
    get cpu() {
      return this.kind === 'cpu';
    },
    held(which) {
      return this.down.has(this.keys[which]);
    },
  }));
  const isHuman = (p) => p.n === 0 || p.phone.connected || p.viaKeys;
  const roster = () => players.filter((p) => isHuman(p) || cpuFill);
  let active = [];

  // ───────────── state ─────────────
  /** 'title' | 'lobby' | 'countdown' | 'play' | 'over' | 'paused' | 'results' */
  let state = 'title';
  let pausedFrom = 'play';
  let roundT = 0, countT = 0, overT = 0, lastCount = 0, lastWarn = 0;
  let globalT = 0;
  let shakeAmt = 0;

  const party = {
    get state() {
      return state;
    },
    get roundT() {
      return roundT;
    },
    get timeLeft() {
      return game.roundSeconds ? Math.max(0, game.roundSeconds - roundT) : Infinity;
    },
    get t() {
      return globalT;
    },
    get players() {
      return active;
    },
    all: players,
    audio,
    exemoo,
    finish,
    toast,
    banner,
    shake(a) {
      shakeAmt = Math.max(shakeAmt, a);
    },
    /** Columns for the active players, centred, at most `max` px wide each. */
    lanes(w, n = active.length, max = 560) {
      const lw = Math.min(w / Math.max(1, n), max);
      const x0 = (w - lw * n) / 2;
      return Array.from({ length: n }, (_, i) => ({ x0: x0 + i * lw, x1: x0 + (i + 1) * lw, cx: x0 + (i + 0.5) * lw, w: lw }));
    },
  };

  function setRoster(demo) {
    active = roster();
    for (const p of players) p.kind = active.includes(p) ? (isHuman(p) ? 'human' : 'cpu') : null;
    game.start(active, { demo });
  }

  // ───────────── phones ─────────────
  function onPacket(p, pkt, actionHeld) {
    p.phone.lastPacket = performance.now();
    if (actionHeld && !p.phone.act && (state === 'play' || state === 'countdown') && p.kind === 'human') game.action?.(p, 'phone');
    p.phone.act = actionHeld;
    game.packet?.(p, pkt, actionHeld);
  }

  const phoneTitle = (p) => `${game.title} · P${p.n + 1}`;
  if (inShell) {
    const p1 = players[0];
    p1.haptic = (pattern) => exemoo.haptic(pattern);
    p1.phone.connected = !!exemoo.phone?.connected;
    exemoo.on('status', (s) => {
      const was = p1.phone.connected;
      p1.phone.connected = !!s.connected;
      if (s.connected && !was) {
        exemoo.setLayout('swing', phoneTitle(p1));
        exemoo.send({ t: 'theme', color: p1.color });
        toast(`${p1.label} phone ready`, p1.color);
      }
      rosterChanged();
    });
    exemoo.on('packet', (pkt) => onPacket(p1, pkt, exemoo.held(pkt, 'action')));
    exemoo.on('button', (b) => onButton(p1, b));
  } else {
    attachLink(players[0]);
  }
  for (let n = 1; n < players.length; n++) attachLink(players[n]);

  function attachLink(p) {
    const link = new ScreenLink({ storageKey: `${game.id}.room.p${p.n + 1}` });
    p.phone.link = link;
    p.haptic = (pattern) => link.connected && link.send({ t: 'haptic', pattern });
    link.on('room', (pin) => {
      p.phone.pin = pin;
      info.then((i) => {
        const base = i?.padUrl || `${location.origin}/pad`;
        p.phone.url = `${base}?pin=${pin}&layout=swing&title=${encodeURIComponent(phoneTitle(p))}`;
        rosterChanged();
      });
    });
    link.on('status', (s) => {
      const ok = s === 'connected';
      if (ok && !p.phone.connected) {
        link.send({ t: 'layout', layout: 'swing', title: phoneTitle(p), buttons: [], stream: true });
        link.send({ t: 'stream', on: true });
        link.send({ t: 'theme', color: p.color });
        toast(`${p.label} phone ready`, p.color);
        audio.play('join');
      } else if (!ok && p.phone.connected && (state === 'play' || state === 'countdown')) {
        toast(`${p.label} phone lost, keys ${p.keyNames.join(' + ')} take over`, p.color);
      }
      p.phone.connected = ok;
      rosterChanged();
    });
    link.on('packet', (pkt) => onPacket(p, pkt, (pkt.buttons & 1) !== 0));
    link.on('message', (m) => {
      if (m && m.t === 'button') onButton(p, normalizeButton(m.b));
    });
    info.then((i) => {
      if (Array.isArray(i?.iceServers)) link.iceServers = i.iceServers;
      link.start();
    });
  }
  addEventListener('pagehide', () => {
    for (const p of players) p.phone.link?.stop?.();
  });

  function rosterChanged() {
    if (state === 'title' || state === 'lobby') setRoster(true);
    if (state === 'lobby') renderSlots();
  }

  // ───────────── input routing ─────────────
  function onButton(p, b) {
    audio.unlock();
    if (b === 'recenter') {
      game.recenter?.(p);
      toast(`${p.label} recentered`, p.color);
      return;
    }
    if (state === 'play' || state === 'countdown' || state === 'over') {
      if ((b === 'pause' || b === 'back') && state !== 'over') pause();
      return; // Action is read from the packet's button mask
    }
    if (state === 'paused' && b === 'pause') return resume();
    if (state === 'lobby' && b === 'back') return showTitle();
    if (state === 'results' && b === 'back') return showTitle();
    if (exemoo.nav(b)) audio.play('click');
  }

  addEventListener('keydown', (e) => {
    audio.unlock();
    if (e.code === 'Escape' || e.code === 'KeyP') {
      if (state === 'play' || state === 'countdown') pause();
      else if (state === 'paused') resume();
      else if (state === 'lobby') showTitle();
      return;
    }
    for (const p of players) {
      for (const [which, code] of Object.entries(p.keys)) {
        if (code !== e.code) continue;
        if (state !== 'title' && state !== 'results' && state !== 'paused') e.preventDefault();
        if (e.repeat) return;
        p.down.add(code);
        playerKey(p, which);
        return;
      }
    }
  });
  addEventListener('keyup', (e) => {
    for (const p of players) p.down.delete(e.code);
  });
  addEventListener('blur', () => {
    for (const p of players) p.down.clear();
  });

  function playerKey(p, which) {
    if (state === 'lobby' && which === 'action' && p.n > 0) {
      p.viaKeys = !p.viaKeys;
      audio.play(p.viaKeys ? 'join' : 'click');
      if (p.viaKeys) toast(`${p.label} joins on the keyboard`, p.color);
      rosterChanged();
      return;
    }
    if ((state === 'play' || state === 'countdown') && p.kind === 'human') {
      if (which === 'action') game.action?.(p, 'keys');
      game.press?.(p, which);
    }
  }

  // ───────────── screens ─────────────
  const screens = ['sTitle', 'sLobby', 'sPause', 'sResults'];
  function only(id) {
    for (const s of screens) $(s).hidden = s !== id;
    const first = id && $(id).querySelector('button.primary, button');
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 30);
  }

  function exit() {
    audio.setMusic('off');
    if (inShell) exemoo.exit();
    else location.assign('/');
  }

  function showTitle() {
    state = 'title';
    $('hud').hidden = true;
    audio.setMusic('menu');
    setRoster(true);
    $('sTitle').innerHTML = `
      <div class="card title-card">
        <h1 class="logo">${esc(game.title)}</h1>
        <p class="tagline">${esc(game.tagline)}</p>
        <div class="howto">${game.howTo
          .map((h, i) => `<div class="step"><span class="num">${i + 1}</span><span class="ic">${icon(h.icon)}</span><b>${esc(h.title)}</b><span>${esc(h.text)}</span></div>`)
          .join('')}</div>
        <p class="keys-help">${esc(game.keysHelp)}</p>
        <div class="row">
          <button class="btn primary big" data-act="play">Play</button>
          <button class="btn yellow" data-act="sound">Sound: ${audio.muted ? 'Off' : 'On'}</button>
          <button class="btn red" data-act="exit">Exit to Exemoo</button>
        </div>
      </div>`;
    only('sTitle');
  }

  function showLobby() {
    state = 'lobby';
    $('hud').hidden = true;
    audio.setMusic('menu');
    setRoster(true);
    $('sLobby').innerHTML = `
      <div class="card lobby-card">
        <h2 class="display">Who's playing?</h2>
        <p class="sub">Phones: scan your slot's code (or open the link and type the PIN). Keyboard: press your action key to join.</p>
        <div class="slots" id="slots"></div>
        <div class="row">
          <button class="btn primary big" data-act="start">Start!</button>
          <button class="btn yellow" data-act="cpu" id="cpuBtn">CPU rivals: ${cpuFill ? 'On' : 'Off'}</button>
          <button class="btn" data-act="title">Back</button>
        </div>
      </div>`;
    renderSlots();
    only('sLobby');
  }

  function renderSlots() {
    const el = $('slots');
    if (!el) return;
    el.innerHTML = players
      .map((p) => {
        const human = isHuman(p);
        let status, extra = '';
        if (p.phone.connected) status = `<span class="pill ok">Phone ready</span>`;
        else if (p.n === 0 && inShell) status = `<span class="pill">Keys ready</span>`;
        else if (human) status = `<span class="pill ok">Keys</span>`;
        else status = `<span class="pill ${cpuFill ? 'cpu' : 'off'}">${cpuFill ? 'CPU' : 'Empty'}</span>`;
        if (p.n === 0 && inShell) {
          extra = `<p class="hint">${p.phone.connected ? 'Your Exemoo phone' : 'Pair a phone on the Exemoo menu, or play on keys'}</p>`;
        } else if (!p.phone.connected) {
          extra = p.phone.url
            ? `<img class="qr" alt="QR code for ${esc(p.label)}" src="/api/qr?text=${encodeURIComponent(p.phone.url)}"><div class="pin">${esc(p.phone.pin)}</div>`
            : `<div class="qr wait">Getting a PIN</div>`;
          if (p.n > 0) extra += `<p class="hint">${p.viaKeys ? 'Press' : 'or press'} <kbd>${esc(p.keyNames[1])}</kbd> ${p.viaKeys ? 'to leave' : 'to join on keys'}</p>`;
        } else extra = `<p class="hint">Phone P${p.n + 1}</p>`;
        return `<div class="slot ${human ? 'in' : cpuFill ? 'cpu' : 'out'}" style="--c:${p.color}">
          <div class="band">P${p.n + 1}</div>
          <canvas class="portrait" data-n="${p.n}"></canvas>
          <b>${esc(p.label)}</b>${status}${extra}
          <p class="keys">Aim <kbd>${esc(p.keyNames[0])}</kbd> Shoot <kbd>${esc(p.keyNames[1])}</kbd></p>
        </div>`;
      })
      .join('');
    requestAnimationFrame(() => {
      for (const c of el.querySelectorAll('canvas.portrait')) {
        const p = players[+c.dataset.n];
        portrait(c, p.animal, p.color, isHuman(p) ? 'happy' : 'sad');
      }
    });
    const cb = $('cpuBtn');
    if (cb) cb.textContent = `CPU rivals: ${cpuFill ? 'On' : 'Off'}`;
  }

  function startRound() {
    audio.unlock();
    setRoster(false);
    if (!active.length) return toast('Nobody is playing yet');
    for (const p of players) p.down.clear();
    only(null);
    $('hud').hidden = false;
    state = 'countdown';
    countT = 3;
    lastCount = 4;
    roundT = 0;
    lastWarn = 99;
    audio.setMusic('play');
    for (const p of active) if (p.kind === 'human') p.haptic(20);
  }

  function pause() {
    if (state !== 'play' && state !== 'countdown') return;
    pausedFrom = state;
    state = 'paused';
    $('count').classList.remove('show');
    audio.setMusic('menu');
    $('sPause').innerHTML = `
      <div class="card small-card">
        <h2 class="display">Paused</h2>
        <div class="col">
          <button class="btn primary big" data-act="resume">Resume</button>
          <button class="btn yellow" data-act="restart">Restart round</button>
          <button class="btn" data-act="title">Quit to title</button>
          <button class="btn red" data-act="exit">Exit to Exemoo</button>
        </div>
      </div>`;
    only('sPause');
  }
  function resume() {
    if (state !== 'paused') return;
    only(null);
    state = pausedFrom;
    if (state === 'countdown') lastCount = 4;
    audio.setMusic('play');
  }

  function finish() {
    if (state !== 'play') return;
    state = 'over';
    overT = 2.4;
    banner('FINISH!', '#fff');
    audio.play('whistle');
    audio.play('finish');
    game.onFinish?.(party);
    for (const p of active) if (p.kind === 'human') p.haptic([60, 40, 60]);
  }

  function showResults() {
    state = 'results';
    $('hud').hidden = true;
    audio.setMusic('menu');
    const res = game.results().slice().sort((a, b) => b.score - a.score);
    let rank = 0, prev = null;
    res.forEach((r, i) => {
      if (prev === null || r.score !== prev) rank = i + 1;
      r.rank = rank;
      prev = r.score;
    });
    const winners = res.filter((r) => r.rank === 1);
    for (const r of winners) r.p.wins++;
    const head = winners.length === 1 ? `${winners[0].p.label} wins!` : winners.length === res.length && res.length > 1 ? "It's a draw!" : "It's a tie!";
    const ord = ['1st', '2nd', '3rd', '4th'];
    $('sResults').innerHTML = `
      <div class="card results-card">
        <span class="ic trophy">${icon('trophy')}</span>
        <h2 class="display win" style="--c:${winners.length === 1 ? winners[0].p.color : 'var(--accent)'}">${esc(head)}</h2>
        <div class="podium">${res
          .map(
            (r) => `<div class="prow r${r.rank}" style="--c:${r.p.color}">
              <span class="rank">${ord[r.rank - 1]}</span>
              <canvas class="portrait" data-n="${r.p.n}" data-m="${r.rank === 1 ? 'cheer' : 'sad'}"></canvas>
              <span class="who"><b>${esc(r.p.label)}</b><small>${r.p.kind === 'cpu' ? 'CPU' : r.p.usingPhone ? 'Phone' : 'Keyboard'} · ${r.p.wins} win${r.p.wins === 1 ? '' : 's'}</small></span>
              <span class="score">${esc(r.text)}</span>
            </div>`
          )
          .join('')}</div>
        <div class="row">
          <button class="btn primary big" data-act="again">Play again</button>
          <button class="btn yellow" data-act="lobby">Change players</button>
          <button class="btn red" data-act="exit">Exit to Exemoo</button>
        </div>
      </div>`;
    only('sResults');
    requestAnimationFrame(() => {
      for (const c of $('sResults').querySelectorAll('canvas.portrait')) {
        const p = players[+c.dataset.n];
        portrait(c, p.animal, p.color, c.dataset.m);
      }
    });
    audio.play('win');
    audio.play('cheer');
    for (const r of res) if (r.p.kind === 'human') r.p.haptic(r.rank === 1 ? [80, 40, 80, 40, 220] : 60);
  }

  ui.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-act]');
    if (!b) return;
    audio.unlock();
    audio.play('click');
    const act = b.dataset.act;
    if (act === 'play' || act === 'lobby') showLobby();
    else if (act === 'title') showTitle();
    else if (act === 'exit') exit();
    else if (act === 'start' || act === 'again' || act === 'restart') startRound();
    else if (act === 'resume') resume();
    else if (act === 'sound') {
      audio.setMuted(!audio.muted);
      b.textContent = `Sound: ${audio.muted ? 'Off' : 'On'}`;
    } else if (act === 'cpu') {
      cpuFill = !cpuFill;
      try {
        localStorage.setItem(`${game.id}.cpu`, cpuFill ? '1' : '0');
      } catch {
        /* ignore */
      }
      rosterChanged();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && (state === 'play' || state === 'countdown')) pause();
  });

  // ───────────── overlays ─────────────
  let toastTimer = 0;
  function toast(text, color) {
    const t = $('toast');
    t.textContent = text;
    t.style.setProperty('--c', color || '#fff');
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
  }
  let bannerTimer = 0;
  function banner(text, color = '#fff', ms = 1600) {
    const b = $('banner');
    b.textContent = text;
    b.style.setProperty('--c', color);
    b.classList.remove('show');
    void b.offsetWidth;
    b.classList.add('show');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => b.classList.remove('show'), ms);
  }
  function showCount(text) {
    const c = $('count');
    c.textContent = text;
    c.classList.remove('show');
    void c.offsetWidth;
    c.classList.add('show');
  }

  // ───────────── loop ─────────────
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth;
    H = innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
  }
  addEventListener('resize', resize);
  resize();

  function tick(dt) {
    globalT += dt;
    if (state === 'paused') return;
    if (state === 'countdown') {
      countT -= dt;
      const n = Math.ceil(countT);
      if (n !== lastCount && n > 0) {
        lastCount = n;
        showCount(String(n));
        audio.play('beep');
      }
      if (countT <= 0) {
        state = 'play';
        showCount('GO!');
        audio.play('go');
        for (const p of active) if (p.kind === 'human') p.haptic(80);
        game.onGo?.(party);
      }
    } else if (state === 'play') {
      roundT += dt;
      if (game.roundSeconds) {
        const left = game.roundSeconds - roundT;
        if (left <= 5 && Math.ceil(left) !== lastWarn && left > 0) {
          lastWarn = Math.ceil(left);
          audio.tone(1200, 0.08, { type: 'square', vol: 0.1 });
        }
        if (left <= 0) finish();
      }
    } else if (state === 'over') {
      overT -= dt;
    }
    game.update(dt, party);
    if (state === 'over' && overT <= 0) showResults();
    const hudTxt = $('hudTxt');
    if (state === 'countdown' || state === 'play' || state === 'over') {
      let txt = '';
      if (game.hudText) txt = game.hudText(party);
      else if (game.roundSeconds) {
        const left = Math.ceil(party.timeLeft);
        txt = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
      }
      if (hudTxt.textContent !== txt) hudTxt.textContent = txt;
      $('hud').classList.toggle('hot', game.roundSeconds && party.timeLeft <= 5 && state === 'play');
    }
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    tick(dt);
    shakeAmt = Math.max(0, shakeAmt - dt * 2.5);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const s = shakeAmt * shakeAmt * 18;
    if (s > 0.1) ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    game.draw(ctx, W, H, party);
    requestAnimationFrame(frame);
  }

  document.fonts?.ready?.then(() => {
    if (state === 'lobby') renderSlots();
  });
  showTitle();
  requestAnimationFrame(frame);
  return party;
}
