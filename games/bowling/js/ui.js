// Moo Bowl UI: title, HUD, score sheets, callouts, pause and results. DOM only.
// Load ui.css via <link>, plus the Google Fonts 'Lilita One' and 'Baloo 2'.
import { PLAYERS } from './constants.js';

const SVGNS = 'http://www.w3.org/2000/svg';

function h(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text != null) el.textContent = text;
  return el;
}
function s(tag, attrs = {}, parent) {
  const el = document.createElementNS(SVGNS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(el);
  return el;
}
function svgFrom(markup, cls) {
  const t = document.createElement('div');
  t.innerHTML = markup.trim();
  const el = t.firstChild;
  if (cls) el.setAttribute('class', cls);
  return el;
}
function isLightColor(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 170;
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const ICON_AIM = `<svg viewBox="0 0 56 56" fill="none" stroke="#1b1b3a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 6 L8 50 M36 6 L48 50" fill="#e9c58a"/><path d="M28 8 V16 M28 22 V30" stroke-dasharray="1 0" opacity=".35"/>
  <circle cx="28" cy="38" r="8" fill="#2f7cff"/><circle cx="25.5" cy="36" r="1.2" fill="#1b1b3a"/><circle cx="30" cy="35.5" r="1.2" fill="#1b1b3a"/><circle cx="28" cy="40.5" r="1.2" fill="#1b1b3a"/>
  <path d="M7 24 H15 M10 20 L6 24 L10 28" /><path d="M49 24 H41 M46 20 L50 24 L46 28" /></svg>`;
const ICON_SWING = `<svg viewBox="0 0 56 56" fill="none" stroke="#1b1b3a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10 14 C 6 34, 20 50, 46 44" stroke="#ff3b30" stroke-dasharray="1 0"/><path d="M40 38 L47 44 L39 49" stroke="#ff3b30"/>
  <circle cx="10" cy="12" r="6.5" fill="#2f7cff"/><circle cx="8.5" cy="10.5" r="1.1" fill="#1b1b3a" stroke="none"/><circle cx="12" cy="10" r="1.1" fill="#1b1b3a" stroke="none"/>
  <path d="M22 8 L30 8" opacity=".0"/></svg>`;
const ICON_TWIST = `<svg viewBox="0 0 56 56" fill="none" stroke="#1b1b3a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <rect x="21" y="12" width="14" height="30" rx="4" fill="#fff"/><circle cx="28" cy="37" r="1.6" fill="#1b1b3a" stroke="none"/>
  <path d="M12 22 C 8 30, 12 42, 24 48" stroke="#2fc65a"/><path d="M19 49 L25 48 L22 42" stroke="#2fc65a"/>
  <path d="M44 34 C 48 26, 44 14, 32 8" stroke="#2fc65a"/><path d="M37 7 L31 8 L34 14" stroke="#2fc65a"/></svg>`;

const PIN_PATH = 'M12 1.5 c3 0 4.6 2.3 3.7 5.2 c-.9 2.6 3 4.4 3 9.6 c0 4.2-2.3 6.7-6.7 6.7 s-6.7-2.5-6.7-6.7 c0-5.2 3.9-7 3-9.6 C7.4 3.8 9 1.5 12 1.5z';
const LOGO_MARK = `<svg viewBox="0 0 92 78" fill="none" stroke="#1b1b3a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
  <g transform="translate(40 -2) scale(2.3)"><path d="${PIN_PATH}" fill="#fff"/><path d="M8.2 6.6 C10.4 7.6 13.6 7.6 15.8 6.6 M8 9.2 C10.4 10.2 13.6 10.2 16 9.2" stroke="#ff3b30" stroke-width="1.7" fill="none"/></g>
  <circle cx="30" cy="52" r="24" fill="#2f7cff"/><path d="M14 40 C 20 30, 32 28, 40 32" stroke="#fff" stroke-width="3.2" opacity=".55"/>
  <circle cx="22" cy="46" r="3.2" fill="#1b1b3a" stroke="none"/><circle cx="31" cy="42.5" r="3.2" fill="#1b1b3a" stroke="none"/><circle cx="29" cy="53" r="3.2" fill="#1b1b3a" stroke="none"/>
</svg>`;
const CROWN = `<svg viewBox="0 0 20 16" fill="#ffd21f" stroke="#1b1b3a" stroke-width="2" stroke-linejoin="round"><path d="M2 13 L1.5 4 L6 8 L10 2 L14 8 L18.5 4 L18 13 Z"/></svg>`;

export function createUI({ root = document.body } = {}) {
  const handlers = new Map();
  function emit(name, payload) {
    const list = handlers.get(name);
    if (list) for (const cb of list.slice()) cb(payload);
  }

  const ui = h('div', 'mb-ui');
  ui.setAttribute('role', 'presentation');
  root.appendChild(ui);

  const state = {
    players: 1,
    hand: 'right',
    camera: false,
    phone: false,
    source: 'mouse',
    muted: false,
    names: PLAYERS.map((p) => p.name),
    colors: PLAYERS.map((p) => p.color),
    titleOpen: false,
    pauseOpen: false,
    resultsOpen: false,
    lastGame: null,
    lastPlayer: 0,
  };

  // ---------------------------------------------------------------- title
  const titleMenu = h('div', 'mb-menu');
  titleMenu.hidden = true;
  const titleCard = h('div', 'mb-card mb-title-card');
  titleCard.setAttribute('role', 'dialog');
  titleCard.setAttribute('aria-label', 'Moo Bowl');
  titleMenu.appendChild(titleCard);

  const logo = h('div', 'mb-logo');
  logo.appendChild(svgFrom(LOGO_MARK, 'mb-logo-mark'));
  const logoText = h('div', 'mb-logo-text');
  logoText.innerHTML = 'MOO <span>BOWL</span>';
  logo.appendChild(logoText);
  titleCard.appendChild(logo);

  const setup = h('div', 'mb-setup');
  const playerGroup = h('div', 'mb-opt-group');
  playerGroup.appendChild(h('div', 'mb-label', 'Players'));
  const playerOpts = h('div', 'mb-opts');
  playerOpts.setAttribute('role', 'radiogroup');
  const playerBtns = [];
  for (let n = 1; n <= 4; n++) {
    const b = h('button', 'mb-opt' + (n === 3 ? ' yl' : ''), String(n));
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-label', n + (n === 1 ? ' player' : ' players'));
    b.style.setProperty('--c', PLAYERS[n - 1].color);
    b.style.setProperty('--cd', PLAYERS[n - 1].dark);
    if (isLightColor(PLAYERS[n - 1].color)) b.style.setProperty('--fg', '#1b1b3a');
    b.addEventListener('click', () => {
      state.players = n;
      syncSetup();
      setFocus(b);
    });
    playerBtns.push(b);
    playerOpts.appendChild(b);
  }
  playerGroup.appendChild(playerOpts);
  const handGroup = h('div', 'mb-opt-group');
  handGroup.appendChild(h('div', 'mb-label', 'Bowling hand'));
  const handOpts = h('div', 'mb-opts');
  handOpts.setAttribute('role', 'radiogroup');
  const handBtns = {};
  for (const hand of ['right', 'left']) {
    const b = h('button', 'mb-opt word', hand === 'right' ? 'Right' : 'Left');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.addEventListener('click', () => {
      state.hand = hand;
      syncSetup();
      setFocus(b);
    });
    handBtns[hand] = b;
    handOpts.appendChild(b);
  }
  handGroup.appendChild(handOpts);
  setup.append(playerGroup, handGroup);
  titleCard.appendChild(setup);

  const how = h('div', 'mb-how');
  const cards = [
    [ICON_AIM, 'Stand and aim', 'Move your bowling hand left or right to line up'],
    [ICON_SWING, 'Swing', 'Bring your arm back, then swing forward to bowl'],
    [ICON_TWIST, 'Twist for curve', 'Turn your wrist as you let go'],
  ];
  for (const [icon, head, body] of cards) {
    const c = h('div');
    c.appendChild(svgFrom(icon));
    c.appendChild(h('b', '', head));
    c.appendChild(h('span', '', body));
    how.appendChild(c);
  }
  titleCard.appendChild(how);
  titleCard.appendChild(h('div', 'mb-fallback', 'No phone or camera? Use the mouse: press, pull back, flick. Or the keyboard: arrows and Space.'));

  const statusRow = h('div', 'mb-statusrow');
  const camChip = h('span', 'mb-chip');
  camChip.append(h('i'), document.createTextNode('Camera'));
  const phoneChip = h('span', 'mb-chip');
  phoneChip.append(h('i'), document.createTextNode('Phone'));
  const camBtn = h('button', 'mb-btn small yellow', 'Camera: Off');
  camBtn.type = 'button';
  camBtn.addEventListener('click', () => {
    emit('camera');
    setFocus(camBtn);
  });
  statusRow.append(camChip, phoneChip, camBtn);
  titleCard.appendChild(statusRow);

  const startBtn = h('button', 'mb-btn green big', 'Start');
  startBtn.type = 'button';
  startBtn.dataset.primary = '1';
  startBtn.addEventListener('click', () => emit('start', { players: state.players, hand: state.hand }));
  titleCard.appendChild(startBtn);
  ui.appendChild(titleMenu);

  function syncSetup() {
    playerBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i + 1 === state.players)));
    playerBtns.forEach((b, i) => b.setAttribute('aria-checked', String(i + 1 === state.players)));
    for (const k in handBtns) {
      handBtns[k].setAttribute('aria-pressed', String(state.hand === k));
      handBtns[k].setAttribute('aria-checked', String(state.hand === k));
    }
  }
  syncSetup();

  // ---------------------------------------------------------------- HUD
  const hud = h('div', 'mb-hud');
  hud.style.cssText = 'position:absolute;inset:0;pointer-events:none';
  ui.appendChild(hud);

  const sheetsEl = h('div', 'mb-sheets');
  sheetsEl.hidden = true;
  hud.appendChild(sheetsEl);

  const turnEl = h('div', 'mb-turn');
  turnEl.hidden = true;
  const whoEl = h('div', 'who');
  const whereEl = h('div', 'where');
  const frameChip = h('span', 'mb-chip');
  const ballChip = h('span', 'mb-chip');
  whereEl.append(frameChip, ballChip);
  turnEl.append(whoEl, whereEl);
  hud.appendChild(turnEl);

  const right = h('div', 'mb-right');
  hud.appendChild(right);
  const deck = h('div', 'mb-deck');
  const deckSvg = s('svg', { viewBox: '0 0 104 90' });
  const deckPins = [];
  for (let row = 0, id = 1; row < 4; row++) {
    for (let i = 0; i <= row; i++, id++) {
      const c = s('circle', { class: 'p', r: 9, cx: 52 + (i - row / 2) * 25, cy: 76 - row * 20.5 }, deckSvg);
      deckPins[id - 1] = c;
    }
  }
  deck.appendChild(deckSvg);
  deck.appendChild(h('div', 'cap', 'PINS'));
  deck.hidden = true;
  right.appendChild(deck);

  const statEl = h('div', 'mb-stat');
  statEl.hidden = true;
  right.appendChild(statEl);

  const meterEl = h('div', 'mb-meter');
  meterEl.hidden = true;
  const mPow = h('div', 'r');
  mPow.appendChild(h('span', '', 'POWER'));
  const mPowBar = h('div', 'bar');
  const mPowFill = h('i', 'fill');
  mPowBar.appendChild(mPowFill);
  mPow.appendChild(mPowBar);
  const mAim = h('div', 'r');
  mAim.appendChild(h('span', '', 'AIM'));
  const mAimBar = h('div', 'bar track');
  const mAimTick = h('i', 'tick');
  mAimBar.appendChild(mAimTick);
  mAim.appendChild(mAimBar);
  const mCur = h('div', 'r');
  mCur.appendChild(h('span', '', 'CURVE'));
  const mCurBar = h('div', 'bar track curve');
  const mCurTick = h('i', 'tick');
  mCurBar.appendChild(mCurTick);
  mCur.appendChild(mCurBar);
  meterEl.append(mPow, mAim, mCur);
  hud.appendChild(meterEl);

  const hintEl = h('div', 'mb-hint');
  hintEl.hidden = true;
  hud.appendChild(hintEl);

  const statusEl = h('div', 'mb-status');
  const sCam = h('span', 'mb-chip');
  sCam.append(h('i'), document.createTextNode('Camera'));
  const sPhone = h('span', 'mb-chip');
  sPhone.append(h('i'), document.createTextNode('Phone'));
  const sSrc = h('span', 'mb-chip');
  sSrc.append(h('i'), document.createTextNode('Mouse'));
  statusEl.append(sCam, sPhone, sSrc);
  statusEl.hidden = true;
  hud.appendChild(statusEl);

  const calloutLayer = h('div', 'mb-callouts');
  calloutLayer.setAttribute('aria-live', 'polite');
  calloutLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none';
  ui.appendChild(calloutLayer);

  // ---------------------------------------------------------------- pause
  const pauseMenu = h('div', 'mb-menu dim');
  pauseMenu.hidden = true;
  const pauseCard = h('div', 'mb-card mb-pause-card');
  pauseCard.setAttribute('role', 'dialog');
  pauseCard.setAttribute('aria-label', 'Paused');
  pauseCard.appendChild(h('div', 'mb-h', 'Paused'));
  const bResume = h('button', 'mb-btn green', 'Resume');
  const bRestart = h('button', 'mb-btn yellow', 'Restart');
  const bMute = h('button', 'mb-btn blue', 'Mute');
  const bExit = h('button', 'mb-btn', 'Exit to menu');
  for (const b of [bResume, bRestart, bMute, bExit]) b.type = 'button';
  bResume.dataset.primary = '1';
  bResume.addEventListener('click', () => emit('resume'));
  bRestart.addEventListener('click', () => emit('restart'));
  bMute.addEventListener('click', () => {
    state.muted = !state.muted;
    syncMute();
    emit('mute');
    setFocus(bMute);
  });
  bExit.addEventListener('click', () => emit('exit'));
  pauseCard.append(bResume, bRestart, bMute, bExit);
  pauseMenu.appendChild(pauseCard);
  ui.appendChild(pauseMenu);
  function syncMute() {
    bMute.textContent = state.muted ? 'Unmute' : 'Mute';
  }

  // ---------------------------------------------------------------- results
  const resultsMenu = h('div', 'mb-menu dim');
  resultsMenu.hidden = true;
  const resultsCard = h('div', 'mb-card mb-results-card');
  resultsCard.setAttribute('role', 'dialog');
  resultsCard.setAttribute('aria-label', 'Results');
  resultsMenu.appendChild(resultsCard);
  ui.appendChild(resultsMenu);

  // ---------------------------------------------------------------- sheets
  function sizeClass(n) {
    return n <= 1 ? 'sz-lg' : n === 2 ? 'sz-lg' : 'sz-sm';
  }

  /** Build one player's classic score row. */
  function sheetRow(sheet, p, opts) {
    const { cur = false, frame = -1, ball = -1, name, color, crown = false } = opts;
    const row = h('div', 'mb-row' + (cur ? ' cur' : ' dimmed'));
    row.style.setProperty('--pc', color);
    const nm = h('div', 'mb-name' + (isLightColor(color) ? ' ink' : ''));
    if (crown) nm.appendChild(svgFrom(CROWN));
    nm.appendChild(document.createTextNode(name));
    nm.title = name;
    row.appendChild(nm);
    const frames = h('div', 'mb-frames');
    for (let i = 0; i < 10; i++) {
      const f = sheet.frames[i];
      const isCur = cur && i === frame;
      const fe = h('div', 'mb-frame' + (i === 9 ? ' t' : '') + (isCur ? ' cur' : ''));
      const rolls = h('div', 'rolls ' + (i === 9 ? 'n3' : 'n2'));
      const cells = i === 9 ? 3 : 2;
      const shown = [];
      if (i < 9 && f.symbols[0] === 'X') {
        shown.push(null, { sym: 'X', split: false });
      } else {
        for (let k = 0; k < cells; k++) shown.push(f.symbols[k] != null ? { sym: f.symbols[k], split: !!f.split[k] } : null);
      }
      for (let k = 0; k < cells; k++) {
        const info = shown[k];
        const c = h('div', 'mb-roll' + (info && info.sym === 'X' ? ' x' : '') + (info && info.sym === '/' ? ' sp' : '') + (info && info.split ? ' split' : ''));
        if (info) c.appendChild(h('b', '', info.sym));
        if (isCur && k === (i < 9 ? Math.min(ball, 1) : ball) && f.rolls.length === ball) c.classList.add('next');
        rolls.appendChild(c);
      }
      fe.appendChild(rolls);
      fe.appendChild(h('div', 'cum', f.cumulative == null ? '' : String(f.cumulative)));
      frames.appendChild(fe);
    }
    row.appendChild(frames);
    row.appendChild(h('div', 'mb-total', String(sheet.total)));
    return row;
  }
  function headRow() {
    const head = h('div', 'mb-head');
    for (let i = 0; i < 10; i++) head.appendChild(h('div', 'mb-frame' + (i === 9 ? ' t' : ''), String(i + 1)));
    head.appendChild(h('div', 'mb-total'));
    return head;
  }
  function playerInfo(i, list) {
    const p = list && list[i];
    return {
      name: (p && p.name) || state.names[i] || 'Player ' + (i + 1),
      color: (p && p.color) || state.colors[i] || '#2f7cff',
    };
  }
  function countPlayers(game) {
    return game.totals().length;
  }

  // ---------------------------------------------------------------- menu focus / nav
  let focused = null;
  function activeMenu() {
    if (state.resultsOpen) return resultsMenu;
    if (state.pauseOpen) return pauseMenu;
    if (state.titleOpen) return titleMenu;
    return null;
  }
  function menuButtons(menu) {
    return Array.from(menu.querySelectorAll('button')).filter((b) => !b.disabled && b.offsetParent !== null);
  }
  function setFocus(btn) {
    if (focused && focused !== btn) focused.classList.remove('mb-focus');
    focused = btn || null;
    if (focused) {
      focused.classList.add('mb-focus');
      try {
        focused.focus({ preventScroll: true });
      } catch (e) {
        /* ignore */
      }
    }
  }
  function focusDefault() {
    const menu = activeMenu();
    if (!menu) {
      if (focused) focused.classList.remove('mb-focus');
      focused = null;
      return;
    }
    const btns = menuButtons(menu);
    const primary = btns.find((b) => b.dataset.primary) || btns[0];
    setFocus(primary || null);
  }
  function clearFocusIfHidden() {
    if (focused && (focused.offsetParent === null || !activeMenu() || !activeMenu().contains(focused))) focusDefault();
  }
  // keep the ring in sync when the user clicks around with a mouse
  ui.addEventListener('focusin', (e) => {
    if (e.target instanceof HTMLButtonElement && e.target !== focused) setFocus(e.target);
  });

  function nav(button) {
    const menu = activeMenu();
    if (!menu) return false;
    if (button === 'back') {
      if (state.pauseOpen && !state.resultsOpen) emit('resume');
      return true;
    }
    const btns = menuButtons(menu);
    if (!btns.length) return true;
    if (!focused || !btns.includes(focused)) focusDefault();
    if (button === 'action') {
      (focused || btns[0]).click();
      return true;
    }
    const dirs = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const d = dirs[button];
    if (!d) return true;
    const fr = focused.getBoundingClientRect();
    const fx = fr.left + fr.width / 2;
    const fy = fr.top + fr.height / 2;
    let best = null;
    let bestScore = Infinity;
    for (const b of btns) {
      if (b === focused) continue;
      const r = b.getBoundingClientRect();
      const dx = r.left + r.width / 2 - fx;
      const dy = r.top + r.height / 2 - fy;
      const along = dx * d[0] + dy * d[1];
      const across = Math.abs(dx * d[1] + dy * -d[0]);
      if (along <= 2) continue;
      // Prefer targets in the cone of the direction, strongly penalise sideways offset.
      const score = along + across * 2.5;
      if (score < bestScore) {
        bestScore = score;
        best = b;
      }
    }
    if (best) setFocus(best);
    return true;
  }

  // ---------------------------------------------------------------- HUD mode
  function syncHud() {
    const inGame = !state.titleOpen && !state.resultsOpen;
    hud.style.display = inGame ? '' : 'none';
  }

  // ---------------------------------------------------------------- callouts
  let callTimer = 0;
  let callTimer2 = 0;
  let callEl = null;
  function starburst(cls) {
    const pts = [];
    const n = 20;
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2;
      const r = i % 2 ? 34 : 50;
      pts.push((50 + Math.cos(a) * r).toFixed(1) + ',' + (50 + Math.sin(a) * r).toFixed(1));
    }
    const sv = s('svg', { viewBox: '0 0 100 100', class: 'burst ' + cls, preserveAspectRatio: 'none' });
    s('polygon', { points: pts.join(' ') }, sv);
    return sv;
  }
  const DEFAULT_TEXT = { strike: 'STRIKE!', spare: 'SPARE!', turkey: 'TURKEY!', split: 'SPLIT!', gutter: 'GUTTER', foul: 'FOUL', info: '' };

  function callout(text, kind = 'info') {
    clearTimeout(callTimer);
    clearTimeout(callTimer2);
    if (callEl) callEl.remove();
    const k = DEFAULT_TEXT[kind] !== undefined ? kind : 'info';
    const el = h('div', 'mb-callout k-' + k);
    if (k === 'strike') {
      el.appendChild(starburst('b1'));
      el.appendChild(starburst('b2'));
    }
    el.appendChild(h('span', 't', text || DEFAULT_TEXT[k] || ''));
    calloutLayer.appendChild(el);
    callEl = el;
    callTimer = setTimeout(() => {
      el.classList.add('out');
      callTimer2 = setTimeout(() => {
        el.remove();
        if (callEl === el) callEl = null;
      }, 320);
    }, 1600);
  }

  // ---------------------------------------------------------------- stats
  function throwStats(info) {
    if (!info) {
      statEl.hidden = true;
      statEl.textContent = '';
      return;
    }
    statEl.textContent = '';
    const speed = Number(info.speedMph);
    const curve = clamp(Number(info.curve) || 0, -1, 1);
    const spd = h('div');
    spd.appendChild(h('small', '', 'Speed'));
    const sb = h('b', '', Number.isFinite(speed) ? speed.toFixed(1) : '--');
    sb.appendChild(h('em', '', 'mph'));
    spd.appendChild(sb);
    statEl.appendChild(spd);

    const hook = h('div');
    hook.appendChild(h('small', '', 'Hook'));
    const sv = s('svg', { viewBox: '0 0 52 34' });
    const endX = 26 + curve * 20;
    const ctrlX = 26;
    s('path', { d: 'M26 31 Q ' + ctrlX + ' 18 ' + endX.toFixed(1) + ' 6', fill: 'none', stroke: '#1b1b3a', 'stroke-width': 4, 'stroke-linecap': 'round' }, sv);
    const ang = (Math.atan2(6 - 18, endX - ctrlX) * 180) / Math.PI;
    s('path', { d: 'M-6 6 L6 0 L-6 -6 Z', fill: '#ff3b30', stroke: '#1b1b3a', 'stroke-width': 2.5, 'stroke-linejoin': 'round', transform: 'translate(' + endX.toFixed(1) + ' 6) rotate(' + ang.toFixed(1) + ')' }, sv);
    hook.appendChild(sv);
    const mag = Math.round(Math.abs(curve) * 100);
    hook.appendChild(h('div', 'hookv', mag < 5 ? 'Straight' : (curve < 0 ? 'Left ' : 'Right ') + mag + '%'));
    statEl.appendChild(hook);

    if (info.board != null && Number.isFinite(Number(info.board))) {
      const bd = h('div');
      bd.appendChild(h('small', '', 'Board'));
      bd.appendChild(h('b', '', String(Math.round(Number(info.board)))));
      statEl.appendChild(bd);
    }
    statEl.hidden = false;
    // restart the entrance animation
    statEl.style.animation = 'none';
    void statEl.offsetWidth;
    statEl.style.animation = '';
  }

  // ---------------------------------------------------------------- the API
  const api = {
    on(event, cb) {
      if (!handlers.has(event)) handlers.set(event, []);
      handlers.get(event).push(cb);
      return () => {
        const list = handlers.get(event);
        const i = list ? list.indexOf(cb) : -1;
        if (i >= 0) list.splice(i, 1);
      };
    },

    showTitle() {
      state.titleOpen = true;
      titleMenu.hidden = false;
      // restart the pop animation
      titleCard.style.animation = 'none';
      void titleCard.offsetWidth;
      titleCard.style.animation = '';
      syncHud();
      focusDefault();
    },
    hideTitle() {
      state.titleOpen = false;
      titleMenu.hidden = true;
      syncHud();
      focusDefault();
    },

    setStatus(st = {}) {
      if ('camera' in st) state.camera = !!st.camera;
      if ('phone' in st) state.phone = !!st.phone;
      if ('source' in st && st.source) state.source = st.source;
      if ('muted' in st) state.muted = !!st.muted;
      camChip.classList.toggle('ok', state.camera);
      phoneChip.classList.toggle('ok', state.phone);
      camBtn.textContent = 'Camera: ' + (state.camera ? 'On' : 'Off');
      sCam.classList.toggle('ok', state.camera);
      sPhone.classList.toggle('ok', state.phone);
      const src = state.source;
      const label = src === 'camera+phone' ? 'Camera + phone' : src === 'camera' ? 'Camera only' : src === 'phone' ? 'Phone only' : 'Mouse / keys';
      sSrc.lastChild.textContent = label;
      sSrc.classList.toggle('ok', src !== 'mouse');
      statusEl.hidden = false;
      syncMute();
    },

    setTurn({ player = 0, frame = 0, ball = 0, name, color } = {}) {
      // frame and ball are 0-based (as in BowlingGame.current); shown 1-based.
      const nm = name || state.names[player] || 'Player ' + (player + 1);
      const col = color || state.colors[player] || '#2f7cff';
      state.names[player] = nm;
      state.colors[player] = col;
      turnEl.style.setProperty('--pc', col);
      whoEl.textContent = nm;
      whoEl.classList.toggle('ink', isLightColor(col));
      frameChip.textContent = 'Frame ' + (frame + 1);
      ballChip.textContent = 'Ball ' + (ball + 1);
      const changed = turnEl.dataset.p !== String(player);
      turnEl.dataset.p = String(player);
      turnEl.hidden = false;
      if (changed) {
        turnEl.classList.remove('bump');
        void turnEl.offsetWidth;
        turnEl.classList.add('bump');
      }
    },

    setSheets(game, currentPlayer = 0) {
      state.lastGame = game;
      state.lastPlayer = currentPlayer;
      const n = countPlayers(game);
      sheetsEl.textContent = '';
      sheetsEl.className = 'mb-sheets ' + sizeClass(n);
      const cur = game.over ? null : game.current;
      if (n <= 2) sheetsEl.appendChild(headRow());
      for (let p = 0; p < n; p++) {
        const info = playerInfo(p);
        const isCur = !!cur && p === currentPlayer;
        sheetsEl.appendChild(
          sheetRow(game.sheet(p), p, {
            cur: isCur,
            frame: isCur ? cur.frame : -1,
            ball: isCur ? cur.ball : -1,
            name: info.name,
            color: info.color,
          }),
        );
      }
      sheetsEl.hidden = false;
    },

    setPinDeck(standingIds) {
      const set = new Set(standingIds || []);
      deckPins.forEach((c, i) => c.classList.toggle('down', !set.has(i + 1)));
      deck.hidden = false;
    },

    callout,
    throwStats,

    hint(text) {
      if (!text) {
        hintEl.hidden = true;
        return;
      }
      if (hintEl.textContent !== text) hintEl.textContent = text;
      if (hintEl.hidden) {
        hintEl.hidden = false;
        hintEl.style.animation = 'none';
        void hintEl.offsetWidth;
        hintEl.style.animation = '';
      }
    },

    meter(m = {}) {
      const vis = !!m.visible;
      if (meterEl.hidden === vis) meterEl.hidden = !vis;
      if (!vis) return;
      mPowFill.style.width = (clamp(Number(m.power) || 0, 0, 1) * 100).toFixed(1) + '%';
      mAimTick.style.left = ((clamp(Number(m.aim) || 0, -1, 1) + 1) * 50).toFixed(1) + '%';
      mCurTick.style.left = ((clamp(Number(m.curve) || 0, -1, 1) + 1) * 50).toFixed(1) + '%';
    },

    showPause(visible) {
      state.pauseOpen = !!visible;
      pauseMenu.hidden = !visible;
      if (visible) {
        syncMute();
        pauseCard.style.animation = 'none';
        void pauseCard.offsetWidth;
        pauseCard.style.animation = '';
      }
      focusDefault();
    },

    showResults(game, players) {
      const n = countPlayers(game);
      const list = Array.isArray(players) && players.length ? players : null;
      const infos = [];
      for (let i = 0; i < n; i++) infos.push(playerInfo(i, list));
      const totals = game.totals();
      const winners = game.winners();
      resultsCard.textContent = '';

      const banner = h('div', 'mb-banner');
      if (n === 1) {
        banner.style.setProperty('--pc', infos[0].color);
        if (isLightColor(infos[0].color)) banner.classList.add('ink');
        banner.textContent = 'Final score';
      } else if (winners.length === 1) {
        const w = infos[winners[0]];
        banner.style.setProperty('--pc', w.color);
        if (isLightColor(w.color)) banner.classList.add('ink');
        banner.appendChild(svgFrom(CROWN));
        banner.appendChild(document.createTextNode(w.name + ' wins!'));
      } else {
        banner.appendChild(document.createTextNode('Tie: ' + winners.map((i) => infos[i].name).join(' and ')));
        banner.style.setProperty('--pc', '#2f7cff');
      }
      resultsCard.appendChild(banner);
      if (n === 1) resultsCard.appendChild(h('div', 'mb-final', 'Score ' + totals[0]));

      const list2 = h('div', 'mb-sheetlist ' + (n >= 4 ? 'sz-sm' : n === 3 ? 'sz-md' : 'sz-lg'));
      list2.appendChild(headRow());
      for (let p = 0; p < n; p++) {
        const sh = game.sheet(p);
        const block = h('div', 'mb-sheetblock');
        block.appendChild(
          sheetRow(sh, p, {
            cur: n > 1 && winners.includes(p),
            name: infos[p].name,
            color: infos[p].color,
            crown: n > 1 && winners.length === 1 && winners[0] === p,
          }),
        );
        let strikes = 0, spares = 0, open = 0;
        for (const f of sh.frames) {
          if (f.symbols.includes('X')) strikes += f.symbols.filter((x) => x === 'X').length;
          if (f.symbols.includes('/')) spares += f.symbols.filter((x) => x === '/').length;
          if (f.rolls.length === 2 && !f.symbols.includes('/') && !f.symbols.includes('X')) open++;
        }
        const stats = h('div', 'mb-stats');
        for (const [label, v] of [['Strikes', strikes], ['Spares', spares], ['Open frames', open]]) {
          const c = h('span', 'mb-chip');
          c.append(document.createTextNode(label + ' '), h('b', '', String(v)));
          stats.appendChild(c);
        }
        block.appendChild(stats);
        list2.appendChild(block);
      }
      resultsCard.appendChild(list2);

      const actions = h('div', 'mb-results-actions');
      const again = h('button', 'mb-btn green', 'Play again');
      const menu = h('button', 'mb-btn blue', 'Menu');
      again.type = menu.type = 'button';
      again.dataset.primary = '1';
      again.addEventListener('click', () => emit('restart'));
      menu.addEventListener('click', () => emit('continue'));
      actions.append(again, menu);
      resultsCard.appendChild(actions);

      state.resultsOpen = true;
      resultsMenu.hidden = false;
      resultsCard.style.animation = 'none';
      void resultsCard.offsetWidth;
      resultsCard.style.animation = '';
      syncHud();
      focusDefault();
    },
    hideResults() {
      state.resultsOpen = false;
      resultsMenu.hidden = true;
      syncHud();
      focusDefault();
    },

    nav,

    destroy() {
      window.removeEventListener('keydown', onKey);
      clearTimeout(callTimer);
      clearTimeout(callTimer2);
      ui.remove();
    },
  };

  // ---------------------------------------------------------------- keyboard (Escape / P only)
  function onKey(e) {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key !== 'Escape' && e.key !== 'p' && e.key !== 'P') return;
    if (state.resultsOpen || state.titleOpen) return;
    if (state.pauseOpen) emit('resume');
    else emit('pause');
  }
  window.addEventListener('keydown', onKey);

  syncHud();
  api.setStatus({});
  void clearFocusIfHidden;
  return api;
}
