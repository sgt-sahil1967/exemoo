/**
 * Exemoo shell: the landing page that owns the phone link for the whole session.
 *
 *  - Pairs the phone once (ScreenLink + QR popup). Going in and out of games never drops it.
 *  - Menu: air cursor, d-pad focus, keyboard and mouse.
 *  - Games open full-screen in an iframe at /play/<id>/ (#/play/<id> in the URL, so Back works).
 *    The shell forwards phone input to the game with postMessage and relays the game's requests
 *    (pad layout, haptics, motion stream, exit) back. Game side: /sdk/exemoo.js.
 *
 * Shell → game  {exemoo:1, type:'status', connected, transport, latency}
 *               {exemoo:1, type:'packet', p}      decoded SEN2 (see js/protocol.js) + `at` (sample time,
 *                                                 epoch ms, clock-synced when `synced`)
 *               {exemoo:1, type:'button', b}      phone button press
 *               {exemoo:1, type:'message', m}     any other phone message (calibrate, center…)
 * Game → shell  {exemoo:1, type:'ready', layout?, title?, stream?}
 *               {exemoo:1, type:'layout', layout, title?}   {exemoo:1, type:'stream', on}
 *               {exemoo:1, type:'haptic', pattern}          {exemoo:1, type:'send', m}
 *               {exemoo:1, type:'exit'}
 */
import { ScreenLink } from './screen-link.js';
import { LAYOUTS, normalizeButton } from './protocol.js';
import { CameraTracker, HeadingFusion } from './camera.js';

const $ = (id) => document.getElementById(id);
const games = [...document.querySelectorAll('.game')];
let focus = 0;
let toastT;

/** Pad layout a game gets until it says otherwise (via the SDK). */
const DEFAULT_LAYOUT = {
  'fruit-slice': 'slice',
  'table-tennis': 'swing',
  tennis: 'swing',
  golf: 'swing',
  cricket: 'swing',
  'pose-match': 'remote',
  'farm-dash': 'remote',
  'pad-test': 'swing',
  'rapids-row': 'swing',
  'shake-freeze': 'swing',
  'wobble-tower': 'swing',
  'flapjack-flip': 'swing',
};

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 1800);
}

// ───────────────────────────── menu ─────────────────────────────
function setFocus(i) {
  focus = (i + games.length) % games.length;
  games.forEach((g, n) => g.classList.toggle('focus', n === focus));
  games[focus].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
const cols = () => getComputedStyle($('games')).gridTemplateColumns.split(' ').length;
function step(d) {
  const n = focus + d;
  if (n >= 0 && n < games.length) setFocus(n);
}

let installed = [];
const infoReady = fetch('/api/info')
  .then((r) => r.json())
  .then((info) => {
    installed = info.games || [];
    if (Array.isArray(info.iceServers)) link.iceServers = info.iceServers;
    padBase = info.padUrl || null;
    return info;
  })
  .catch(() => null);

async function launch(g) {
  await infoReady;
  const id = g.dataset.id;
  if (installed.includes(id)) return openGame(id, g.dataset.g);
  toast(g.dataset.g + (g.classList.contains('soon-card') ? ' is still being made!' : ' is coming soon!'));
}

games.forEach((g, i) => {
  g.addEventListener('click', () => {
    setFocus(i);
    launch(g);
  });
  // 3D tilt on hover
  g.addEventListener('pointermove', (e) => {
    const r = g.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    g.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-6px)`;
  });
  g.addEventListener('pointerleave', () => (g.style.transform = ''));
});

addEventListener('keydown', (e) => {
  if (playing) return;
  if ($('modal').classList.contains('open')) {
    if (e.key === 'Escape') closeModal();
    return;
  }
  if (e.target.tagName === 'INPUT') return;
  const k = e.key;
  if (k === 'ArrowRight') step(1);
  else if (k === 'ArrowLeft') step(-1);
  else if (k === 'ArrowDown') step(cols());
  else if (k === 'ArrowUp') step(-cols());
  else if (k === 'Enter') launch(games[focus]);
  else return;
  e.preventDefault();
});

// ───────────────────────────── modals (placeholders) ─────────────────────────────
const content = {
  login: `<h2 class="display">Log in</h2><input placeholder="Email" type="email"><input placeholder="Password" type="password">
    <div class="row"><button class="btn" data-ph>Log in</button><button class="btn blue" data-ph>Sign up</button></div>`,
  contact: `<h2 class="display">Contact us</h2><p>Placeholder — contact details coming soon.</p><div class="row"><button class="btn blue" data-close>Close</button></div>`,
  terms: `<h2 class="display">Terms &amp; Conditions</h2><p>Placeholder — terms and conditions coming soon.</p><div class="row"><button class="btn yellow" data-close>Close</button></div>`,
};
function openModal(k) {
  $('modalCard').innerHTML = content[k];
  $('modal').classList.add('open');
}
function closeModal() {
  $('modal').classList.remove('open');
}
$('modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal' || e.target.hasAttribute('data-close')) closeModal();
  if (e.target.hasAttribute('data-ph')) {
    closeModal();
    toast('Accounts coming soon!');
  }
});
$('loginBtn').onclick = () => openModal('login');
document.querySelectorAll('[data-modal]').forEach((b) => (b.onclick = () => openModal(b.dataset.modal)));

// ───────────────────────────── QR popup ─────────────────────────────
const pop = $('qrPop'), tab = $('phoneTab');
function showPop(v) {
  pop.classList.toggle('hide', !v);
  tab.style.display = v || playing ? 'none' : '';
}
$('qrClose').onclick = () => showPop(false);
$('useKb').onclick = () => {
  showPop(false);
  toast('Keyboard & mouse it is!');
};
tab.onclick = () => showPop(true);

// ───────────────────────────── phone link ─────────────────────────────
const link = new ScreenLink();
let padBase = null;

function status(txt, ok) {
  $('stxt').textContent = txt;
  $('status').classList.toggle('ok', !!ok);
  pop.classList.toggle('connected', !!ok);
  $('stagePhone').classList.toggle('ok', !!ok);
  $('stagePhoneTxt').textContent = ok ? 'Phone connected' : 'Pair phone';
}
async function showQr(pin) {
  // The server says where phones should go: the public HTTPS URL in production, the LAN address locally.
  await infoReady;
  const url = `${padBase || location.origin + '/pad'}?pin=${pin}`;
  $('pin').textContent = pin;
  $('padUrl').textContent = url.replace(/^https?:\/\//, '').replace(/\?.*/, '') + ' (PIN below)';
  $('qr').innerHTML = `<img alt="QR code to pair your phone" src="/api/qr?text=${encodeURIComponent(url)}">`;
}

let wasConnected = false;
link.on('room', (pin) => {
  showQr(pin);
  postToGame({ type: 'status', ...phoneState() });
});
link.on('status', (s, detail) => {
  const ok = s === 'connected';
  const text = { connecting: 'Connecting...', waiting: detail || 'Waiting for your phone...', pairing: detail || 'Pairing...', connected: `Phone connected (${link.transport === 'webrtc' ? 'direct' : 'relay'})`, disconnected: 'Reconnecting...', error: detail || 'Error' }[s] || s;
  status(text, ok);
  if (ok && !wasConnected) {
    toast('Phone paired!');
    setTimeout(() => showPop(false), 1500);
    // Tell the phone which layout to show (it may have joined mid-game).
    link.send(padLayoutMsg());
  }
  wasConnected = ok;
  postToGame({ type: 'status', ...phoneState() });
});
// ───────────────────────────── camera assist ─────────────────────────────
// The webcam gives the absolute wrist position; the phone gives swing speed and angles. Every packet's
// heading is drift-corrected against the camera before a game sees it, and carries `cam` (wrist position).
const camera = new CameraTracker($('camVideo'));
const fusion = new HeadingFusion();
/** Games that run their own camera tracking: the shell's camera pauses while they play. */
const OWN_CAMERA = new Set(['pose-match', 'farm-dash']);
/** Games that never use camera assist: the shell's camera stays off while they play. */
const NO_CAMERA = new Set(['fruit-slice', 'rapids-row', 'farm-kart', 'shake-freeze', 'wobble-tower', 'flapjack-flip']);
const cameraOff = (id) => OWN_CAMERA.has(id) || NO_CAMERA.has(id);
const ownCameraGame = () => !!playing && cameraOff(playing.id);
let camWanted = false;
try {
  camWanted = localStorage.getItem('exemoo.camera') === '1';
} catch {
  /* ignore */
}
camera.on('status', (t) => {
  $('camTxt').textContent = t;
  document.body.classList.toggle('cam-on', camera.running);
  for (const b of document.querySelectorAll('[data-cam-toggle]')) b.classList.toggle('on', camera.running);
});
camera.on('pose', (pose) => postToGame({ type: 'pose', pose }));
camera.on('status', () => postToGame({ type: 'camera', on: camera.running }));
async function setCamera(on) {
  camWanted = on;
  try {
    localStorage.setItem('exemoo.camera', on ? '1' : '0');
  } catch {
    /* ignore */
  }
  if (on) {
    if (ownCameraGame()) return toast(NO_CAMERA.has(playing.id) ? 'Camera assist is off in this game' : 'This game uses the camera itself');
    if (await camera.start()) toast('Camera assist on: it tracks your hand so aiming stays true');
  } else camera.stop();
}
for (const b of document.querySelectorAll('[data-cam-toggle]')) b.addEventListener('click', () => setCamera(!camera.running));

link.on('packet', (p) => {
  // at: when the phone sampled this packet, as epoch ms (shared with camera poses and the game).
  const local = link.phoneTimeToLocal(p.t) ?? performance.now() - link.latencyMs;
  const stamped = { ...p, at: performance.timeOrigin + local, synced: link.clockRttMs >= 0 };
  postToGame({ type: 'packet', p: camera.running ? fusion.apply(stamped, camera.last) : stamped });
});
link.on('message', (m) => (playing ? onPhoneInGame(m) : onPhoneInMenu(m)));

// pin + padUrl let a game show the same QR as the shell on its own pairing screen.
const phoneState = () => ({
  connected: link.connected,
  transport: link.transport,
  latency: Math.round(link.latencyMs),
  pin: link.pin,
  padUrl: link.pin ? `${padBase || location.origin + '/pad'}?pin=${link.pin}` : '',
});

// ───────────────────────────── air cursor (menu) ─────────────────────────────
const air = $('air');
let ax = innerWidth / 2, ay = innerHeight / 2, hot = null, idleT, edgeV = 0;
const placeAir = () => (air.style.transform = `translate(${ax}px,${ay}px)`);
function wakeAir() {
  air.classList.add('on');
  clearTimeout(idleT);
  idleT = setTimeout(() => air.classList.remove('on'), 5000);
}
function hitTest() {
  const el = document.elementFromPoint(ax, ay)?.closest('.game, button, a');
  if (el === hot) return;
  hot?.classList.remove('air-hover');
  hot = el;
  air.classList.toggle('hot', !!el);
  if (!el) return;
  const gi = games.indexOf(el);
  if (gi >= 0) {
    focus = gi;
    games.forEach((g, n) => g.classList.toggle('focus', n === gi));
  } else el.classList.add('air-hover');
  link.send({ t: 'haptic', pattern: 8 });
}
function moveAir(dx, dy) {
  ax = Math.max(4, Math.min(innerWidth - 4, ax + dx));
  ay = Math.max(4, Math.min(innerHeight - 4, ay + dy));
  placeAir();
  wakeAir();
  hitTest();
  edgeV = ay < 70 ? -(70 - ay) / 4 : ay > innerHeight - 70 ? (ay - (innerHeight - 70)) / 4 : 0;
}
(function edgeScroll() {
  if (edgeV && air.classList.contains('on') && !playing) {
    scrollBy(0, edgeV);
    hitTest();
  }
  requestAnimationFrame(edgeScroll);
})();
function airSelect() {
  air.classList.add('click');
  setTimeout(() => air.classList.remove('click'), 150);
  if (hot && air.classList.contains('on')) hot.click();
  else launch(games[focus]);
}
function back() {
  if ($('modal').classList.contains('open')) closeModal();
  else if (!pop.classList.contains('hide')) showPop(false);
}
placeAir();

function onPhoneInMenu(m) {
  if (m.t === 'move') return moveAir(+m.dx || 0, +m.dy || 0);
  if (m.t === 'calibrate') return toast(m.phase === 'start' ? 'Calibrating your phone...' : 'Calibration done!');
  if (m.t === 'center') {
    ax = innerWidth / 2;
    ay = innerHeight / 2;
    placeAir();
    wakeAir();
    hitTest();
    return;
  }
  if (m.t !== 'button') return;
  const b = normalizeButton(m.b);
  if (b === 'action') return airSelect();
  if (b === 'back' || b === 'home') return back();
  air.classList.remove('on');
  hot?.classList.remove('air-hover');
  hot = null;
  if (b === 'right') step(1);
  else if (b === 'left') step(-1);
  else if (b === 'down') step(cols());
  else if (b === 'up') step(-cols());
}

// ───────────────────────────── game stage ─────────────────────────────
/** @type {null | {id:string, title:string, layout:string, frame:HTMLIFrameElement}} */
let playing = null;

function postToGame(msg) {
  playing?.frame.contentWindow?.postMessage({ exemoo: 1, ...msg }, location.origin);
}

function setPadLayout(layout, title, buttons) {
  if (!playing) return;
  playing.layout = LAYOUTS.includes(layout) && layout !== 'menu' ? layout : playing.layout;
  if (title) playing.title = String(title).slice(0, 40);
  if (Array.isArray(buttons)) playing.buttons = buttons.slice(0, 6);
  link.send(padLayoutMsg());
}
const padLayoutMsg = () =>
  playing ? { t: 'layout', layout: playing.layout, title: playing.title, buttons: playing.buttons || [], stream: playing.stream } : { t: 'layout', layout: 'menu' };

function openGame(id, title) {
  if (playing?.id === id) return;
  if (playing) closeGame({ keepHash: true });
  const frame = document.createElement('iframe');
  frame.src = `/play/${id}/`;
  frame.title = title || id;
  frame.allow = 'camera; microphone; fullscreen; autoplay; gamepad; accelerometer; gyroscope';
  frame.addEventListener('load', () => frame.focus());
  $('stageFrame').replaceChildren(frame);
  playing = { id, title: title || id, layout: DEFAULT_LAYOUT[id] || 'remote', frame };
  document.body.classList.add('playing');
  air.classList.remove('on');
  showPop(false);
  if (location.hash !== `#/play/${id}`) history.pushState(null, '', `#/play/${id}`);
  setPadLayout(playing.layout, playing.title);
  peekStageBar();
  if (cameraOff(id) && camera.running) camera.stop();
  else if (!cameraOff(id) && camWanted && !camera.running) camera.start();
  fusion.reset();
}

function closeGame({ keepHash = false } = {}) {
  if (!playing) return;
  playing.frame.remove();
  playing = null;
  document.body.classList.remove('playing');
  if (!keepHash && location.hash.startsWith('#/play/')) history.pushState(null, '', location.pathname + location.search);
  link.send({ t: 'layout', layout: 'menu' });
  showPop(false);
  if (camWanted && !camera.running && !ownCameraGame()) camera.start();
  games[focus]?.focus({ preventScroll: true });
}

function onPhoneInGame(m) {
  if (m.t === 'button') {
    const b = normalizeButton(m.b);
    if (b === 'home') return closeGame();
    if (b === 'recenter') fusion.reset();
    return postToGame({ type: 'button', b });
  }
  if (m.t === 'move') return; // menu pointer only
  postToGame({ type: 'message', m });
}

addEventListener('message', (e) => {
  if (!playing || e.source !== playing.frame.contentWindow || e.origin !== location.origin) return;
  const d = e.data;
  if (!d || d.exemoo !== 1 || typeof d.type !== 'string') return;
  switch (d.type) {
    case 'ready':
      if (d.layout || d.title || d.buttons) setPadLayout(d.layout, d.title, d.buttons);
      if (typeof d.stream === 'boolean') {
        playing.stream = d.stream;
        link.send({ t: 'stream', on: d.stream });
      }
      postToGame({ type: 'status', ...phoneState() });
      break;
    case 'layout':
      setPadLayout(d.layout, d.title, d.buttons);
      break;
    case 'stream':
      playing.stream = !!d.on;
      link.send({ t: 'stream', on: !!d.on });
      break;
    case 'haptic':
      link.send({ t: 'haptic', pattern: d.pattern ?? 20 });
      break;
    case 'send':
      if (d.m && typeof d.m === 'object' && typeof d.m.t === 'string') link.send(d.m);
      break;
    case 'exit':
      closeGame();
      break;
    case 'camera':
      // A game asks for camera assist (e.g. cricket tracks the wrist).
      setCamera(!!d.on);
      break;
  }
});

// The bar (Menu + phone chip) slides in when the mouse moves, then hides so it doesn't cover the game.
let barT;
function peekStageBar() {
  $('stageBar').classList.add('show');
  clearTimeout(barT);
  barT = setTimeout(() => $('stageBar').classList.remove('show'), 3000);
}
$('stage').addEventListener('pointermove', peekStageBar);
$('stageMenu').onclick = () => closeGame();
$('stagePhone').onclick = () => showPop(true);

function route() {
  const m = location.hash.match(/^#\/play\/([a-z0-9-]+)$/);
  if (!m) return closeGame({ keepHash: true });
  infoReady.then(() => {
    const card = games.find((g) => g.dataset.id === m[1]);
    if (installed.includes(m[1])) openGame(m[1], card?.dataset.g || (m[1] === 'pad-test' ? 'Controller Test' : m[1]));
    else {
      history.replaceState(null, '', location.pathname + location.search);
      toast(`${card?.dataset.g || m[1]} is coming soon!`);
    }
  });
}
addEventListener('popstate', route);

// ───────────────────────────── boot ─────────────────────────────
setFocus(0);
scrollTo(0, 0);
if (link.pin) showQr(link.pin);
link.start();
// Camera permission was given before: turn it back on (browsers remember the grant).
if (camWanted) setTimeout(() => !ownCameraGame() && camera.start(), 1500);
if (location.hash.startsWith('#/play/')) route();
else setTimeout(() => !link.connected && showPop(true), 600);
