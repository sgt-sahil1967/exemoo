/**
 * /pad — the one Exemoo phone controller.
 *
 * The screen picks the layout ({t:'layout', layout, title}):
 *   menu    air pointer (gyro "air mouse") + d-pad + A/B; flick or tap to select
 *   swing   big hold-to-swing button; SEN2 motion streamed ~60 Hz
 *   slice   the whole screen is the blade; SEN2 motion streamed
 *   remote  GO / Pause / Back for camera games; no motion stream
 * Every non-menu layout has a Home button (hold) that returns to the Exemoo menu.
 */
import { PadLink } from './pad-link.js';
import { playSound, unlockSound } from './pad-sound.js';
import { LAYOUTS, buttonBit, encodeSen2, normalizeButton, quatFromEuler, SEN2_SIZE } from './protocol.js';

const $ = (id) => document.getElementById(id);
// Diagnostics: any script error or connection problem is shown on the pad itself.
function showDiag(text) {
  let d = document.getElementById('diag');
  if (!d) { d = document.createElement('div'); d.id = 'diag'; d.style.cssText = 'position:fixed;left:8px;right:8px;bottom:8px;z-index:50;background:#1b1b3aee;color:#fff;font:600 13px system-ui;padding:8px 10px;border-radius:12px;white-space:pre-wrap'; document.body.append(d); }
  d.textContent = text;
}
addEventListener('error', (e) => showDiag(`Error: ${e.message} (${(e.filename || '').split('/').pop()}:${e.lineno})`));
addEventListener('unhandledrejection', (e) => showDiag(`Error: ${e.reason?.message || e.reason}`));
const link = new PadLink();
let pin = new URLSearchParams(location.search).get('pin') || '';

// ───────────────────────────── status ─────────────────────────────
const STATUS = {
  connecting: ['Connecting', ''],
  waiting: ['Waiting for screen', ''],
  negotiating: ['Pairing', ''],
  connected: ['Connected', 'ok'],
  lost: ['Reconnecting', 'bad'],
  gone: ['Not connected', 'bad'],
};
link.on('status', (s, detail) => {
  const [label, kind] = STATUS[s] || [s, ''];
  $('stxt').innerHTML = label + (s === 'connected' ? ` <small>${link.transport === 'webrtc' ? 'direct' : 'relay'}</small>` : '');
  $('state').className = 'state' + (kind ? ' ' + kind : '');
  if (s === 'connected') link.send({ t: 'hello', ua: navigator.userAgent, motion: motionOn });
  if (s === 'gone') showPinGate(detail);
  if (s === 'gone' || s === 'lost') showDiag(`Connection: ${detail || s}`);
  else if (s === 'connected') document.getElementById('diag')?.remove();
});
link.on('message', (m) => {
  if (m.t === 'haptic') haptic(m.pattern);
  else if (m.t === 'sound') playSound(m.name, m.q);
  else if (m.t === 'layout') {
    setLayout(m.layout, m.title, m.buttons);
    if (typeof m.stream === 'boolean') streamWanted = m.stream;
  }
  else if (m.t === 'stream') streamWanted = !!m.on;
  else if (m.t === 'theme' && /^#[0-9a-f]{3,8}$/i.test(m.color)) document.documentElement.style.setProperty('--red', m.color);
});

function showPinGate(msg) {
  $('pinGate').classList.remove('hidden');
  if (msg) $('pinGate').querySelector('p').textContent = msg;
}
$('pinForm').onsubmit = (e) => {
  e.preventDefault();
  const v = $('pinIn').value.replace(/\D/g, '');
  if (v.length !== 6) return;
  pin = v;
  history.replaceState(null, '', `?pin=${pin}`);
  $('pinGate').classList.add('hidden');
  link.connect(pin);
};

function haptic(pattern = 12) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* ignore */
  }
  document.body.classList.remove('flash');
  void document.body.offsetWidth;
  document.body.classList.add('flash');
}

// ───────────────────────────── layouts ─────────────────────────────
let layout = 'menu';
let streamWanted = null; // null = layout default
const streams = () => (streamWanted ?? (layout === 'swing' || layout === 'slice'));

function setLayout(name, title, extra = []) {
  if (!LAYOUTS.includes(name)) name = 'menu';
  layout = name;
  document.body.className = `layout-${name}`;
  streamWanted = null;
  $('title').textContent = title || '';
  $('title').classList.toggle('hidden', !title || name === 'menu');
  $('homeBtn').classList.toggle('hidden', name === 'menu');
  for (const el of document.querySelectorAll('[data-only]')) el.classList.toggle('hidden', !el.dataset.only.split(' ').includes(name));
  renderExtras(name === 'menu' ? [] : extra);
  held = 0;
  haptic([10, 30, 10]);
}

/** Game-specific buttons (e.g. golf club - / + / Map). They arrive as ordinary button presses. */
function renderExtras(list) {
  const box = $('extras');
  box.replaceChildren();
  for (const x of Array.isArray(list) ? list.slice(0, 6) : []) {
    if (!x || !/^[a-z0-9-]{1,16}$/.test(x.b)) continue;
    const el = document.createElement('button');
    el.className = 'b green xb';
    el.textContent = String(x.label ?? x.b).slice(0, 8);
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      press(x.b, el);
    });
    box.append(el);
  }
  box.classList.toggle('hidden', !box.childElementCount);
}

// ───────────────────────────── buttons ─────────────────────────────
let held = 0;
function press(b, el) {
  b = normalizeButton(b);
  link.send({ t: 'button', b });
  haptic(10);
  // Make sure the bit shows up in at least one sensor packet even for very short taps.
  lastSend = 0;
  if (el && !el.hasAttribute('data-hold')) {
    el.classList.add('down');
    setTimeout(() => el.classList.remove('down'), 110);
  }
}
for (const el of document.querySelectorAll('[data-b]')) {
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const b = el.dataset.b;
    if (el.hasAttribute('data-hold')) {
      held |= buttonBit(b);
      el.classList.add('down');
      el.setPointerCapture?.(e.pointerId);
    }
    press(b, el);
  });
  if (el.hasAttribute('data-hold')) {
    const up = () => {
      held &= ~buttonBit(el.dataset.b);
      el.classList.remove('down');
      lastSend = 0;
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  }
}

// Home: hold for 0.6 s so a swing can't exit the game by accident.
{
  const btn = $('homeBtn');
  let t = null;
  const cancel = () => {
    clearTimeout(t);
    t = null;
    btn.classList.remove('holding');
  };
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    btn.classList.add('holding');
    t = setTimeout(() => {
      cancel();
      press('home');
      haptic([20, 40, 20]);
    }, 600);
  });
  btn.addEventListener('pointerup', cancel);
  btn.addEventListener('pointerleave', cancel);
  btn.addEventListener('pointercancel', cancel);
}

// ───────────────────────────── sensors ─────────────────────────────
let motionOn = true;
let orient = { alpha: 0, beta: 0, gamma: 0 };
let acc = { x: 0, y: 0, z: 0 };
let gyro = { alpha: 0, beta: 0, gamma: 0 };
let seq = 0;
let lastSend = 0;
const pkt = { seq: 0, t: 0, q: { x: 0, y: 0, z: 0, w: 1 }, acc, gyro, buttons: 0 };
const pktBuf = new ArrayBuffer(SEN2_SIZE);

function maybeSend(now, minGap = 0) {
  if (!link.connected || !streams()) return;
  const gap = Math.max(minGap, link.transport === 'relay' ? 15 : 8);
  if (now - lastSend < gap) return;
  lastSend = now;
  pkt.seq = seq = (seq + 1) >>> 0;
  pkt.t = Math.round(now) >>> 0;
  pkt.q = quatFromEuler(orient.alpha, orient.beta, orient.gamma);
  pkt.acc = acc;
  pkt.gyro = gyro;
  pkt.buttons = held;
  link.sendSensor(encodeSen2(pkt, pktBuf));
}

// Magnetometer-based heading, for games that log or use it ({t:'compass'} at ≤10 Hz while the motion stream is on).
// iOS gives a tilt-compensated heading (webkitCompassHeading, degrees clockwise from north); Android gives the
// absolute orientation (deviceorientationabsolute, alpha 0 = north). Indoors, metal and speakers can bend both.
let compass = { ios: null, iosAcc: null, abs: null };
let lastCompass = 0, linearAcc = false;
function sendCompass(now) {
  if (!link.connected || !streams() || now - lastCompass < 100) return;
  if (compass.ios == null && !compass.abs) return;
  lastCompass = now;
  link.send({ t: 'compass', ios: compass.ios, iosAcc: compass.iosAcc, abs: compass.abs, lin: linearAcc });
}
function onOrientation(e) {
  if (e.alpha == null && e.beta == null && e.gamma == null) return;
  orient = { alpha: e.alpha ?? 0, beta: e.beta ?? 0, gamma: e.gamma ?? 0 };
  if (typeof e.webkitCompassHeading === 'number') {
    compass.ios = Math.round(e.webkitCompassHeading * 10) / 10;
    compass.iosAcc = e.webkitCompassAccuracy ?? null;
  }
  sendCompass(performance.now());
}
function onOrientationAbsolute(e) {
  if (e.alpha == null) return;
  compass.abs = [e.alpha, e.beta ?? 0, e.gamma ?? 0].map((n) => Math.round(n * 10) / 10);
  sendCompass(performance.now());
}

// Menu pointer: rotation rate drives the screen cursor like a Wii remote (yaw → x, pitch → y).
// A sharp acceleration spike (a flick) counts as Action.
let dx = 0, dy = 0, lastFlick = 0, ringX = 0, ringY = 0;
const CAL_KEY = 'exemoo.cal';
const cal = Object.assign(
  { bias: [0, 0], sens: 0.9, flick: 22, invX: false, invY: false, done: false },
  (() => {
    try {
      return JSON.parse(localStorage.getItem(CAL_KEY) || '{}');
    } catch {
      return {};
    }
  })(),
);
const saveCal = () => {
  try {
    localStorage.setItem(CAL_KEY, JSON.stringify(cal));
  } catch {
    /* ignore */
  }
};
let sampling = null; // {a:[], b:[]} while measuring gyro bias

function onMotion(e) {
  linearAcc = !!(e.acceleration && e.acceleration.x != null);
  const a = linearAcc ? e.acceleration : e.accelerationIncludingGravity;
  if (a) acc = { x: a.x ?? 0, y: a.y ?? 0, z: a.z ?? 0 };
  const r = e.rotationRate;
  if (r) gyro = { alpha: r.alpha ?? 0, beta: r.beta ?? 0, gamma: r.gamma ?? 0 };
  maybeSend(performance.now());

  if (!r || !motionOn) return;
  if (sampling) {
    sampling.a.push(r.alpha || 0);
    sampling.b.push(r.beta || 0);
    return;
  }
  if (layout !== 'menu') return;
  const dt = (e.interval > 1 ? e.interval / 1000 : e.interval) || 1 / 60;
  const yaw = (r.alpha || 0) - cal.bias[0];
  const pitch = (r.beta || 0) - cal.bias[1];
  const k = dt * cal.sens * 10;
  // Held like a remote, beta (rotation about the phone's short axis) sweeps left/right and alpha up/down.
  if (Math.abs(pitch) > 2) dx -= pitch * k * (cal.invX ? -1 : 1);
  if (Math.abs(yaw) > 2) dy -= yaw * k * (cal.invY ? -1 : 1);
  const la = e.acceleration;
  if (la && performance.now() - lastFlick > 600 && Math.hypot(la.x || 0, la.y || 0, la.z || 0) > cal.flick) {
    lastFlick = performance.now();
    press('action');
    $('pad').classList.remove('flash');
    void $('pad').offsetWidth;
    $('pad').classList.add('flash');
  }
}

// Touch trackpad: drag on the pad to move the cursor, tap to select.
let touch = null;
$('pad').addEventListener('pointerdown', (e) => {
  if (e.target.closest('button')) return;
  touch = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 };
});
$('pad').addEventListener('pointermove', (e) => {
  if (!touch) return;
  const mx = e.clientX - touch.x, my = e.clientY - touch.y;
  dx += mx * 2.2;
  dy += my * 2.2;
  touch.moved += Math.abs(mx) + Math.abs(my);
  touch.x = e.clientX;
  touch.y = e.clientY;
});
addEventListener('pointerup', () => {
  if (touch && touch.moved < 8 && performance.now() - touch.t < 300) press('action');
  touch = null;
});

// Pointer deltas at ~60 Hz (menu only); sensor packets keep flowing even if devicemotion is sparse.
setInterval(() => {
  maybeSend(performance.now(), 14);
  if (layout !== 'menu' || (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05)) return void (dx = dy = 0);
  link.send({ t: 'move', dx: Math.round(dx * 10) / 10, dy: Math.round(dy * 10) / 10 });
  ringX = Math.max(-1, Math.min(1, ringX * 0.9 + dx / 120));
  ringY = Math.max(-1, Math.min(1, ringY * 0.9 + dy / 120));
  dx = dy = 0;
}, 16);
(function anim() {
  ringX *= 0.9;
  ringY *= 0.9;
  $('ring').style.transform = `translate(calc(-50% + ${ringX * 70}px), calc(-50% + ${ringY * 50}px))`;
  requestAnimationFrame(anim);
})();

function setMotion(on, label) {
  motionOn = on;
  $('motionBtn').textContent = 'Motion: ' + (on ? 'ON' : 'OFF');
  $('motionBtn').classList.toggle('green', on);
  $('pad').classList.toggle('motion', on);
  $('padLabel').textContent = label || (on ? 'Point and tilt your phone to move. Flick or tap A to pick.' : 'Drag here to move. Tap to pick.');
}
$('motionBtn').onclick = () => {
  setMotion(!motionOn);
  link.send({ t: 'motion', on: motionOn });
};
$('centerBtn').onclick = () => {
  link.send({ t: 'center' });
  haptic(20);
};

// ───────────────────────────── start ─────────────────────────────
let wakeLock = null;
async function requestWakeLock() {
  try {
    if (navigator.wakeLock && document.visibilityState === 'visible') wakeLock = await navigator.wakeLock.request('screen');
  } catch {
    /* unsupported / denied */
  }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    if (!wakeLock) requestWakeLock();
  } else wakeLock = null;
});

async function start() {
  $('startGate').classList.add('hidden');
  unlockSound(); // inside the tap, so game sounds (the bat crack) can play on the phone
  // Pair first: nothing below (permission prompts, settings fetch) may delay or block connecting.
  if (/^\d{6}$/.test(pin)) link.connect(pin);
  else showPinGate();
  // ICE servers (TURN) from the server, with a timeout so a slow request can't hang anything.
  fetchJson('/api/info', 2500).then((info) => { if (Array.isArray(info?.iceServers)) link.iceServers = info.iceServers; });
  try {
    if (!window.isSecureContext) throw new Error('insecure');
    // iOS asks for each sensor separately, and only from a tap.
    const asks = [];
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') asks.push(DeviceMotionEvent.requestPermission());
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') asks.push(DeviceOrientationEvent.requestPermission());
    // A prompt that never answers must not leave the pad half-started.
    const results = await Promise.race([Promise.all(asks), new Promise((res) => setTimeout(() => res(['timeout']), 15000))]);
    if (results.some((r) => r !== 'granted')) throw new Error('denied');
    addEventListener('devicemotion', onMotion, true);
    addEventListener('deviceorientation', onOrientation, true);
    addEventListener('deviceorientationabsolute', onOrientationAbsolute, true);
    setMotion(true);
  } catch (e) {
    setMotion(false, e.message === 'insecure' ? 'Motion needs HTTPS. Drag here to move, tap to pick.' : 'Motion blocked. Drag here to move, tap to pick.');
  }
  requestWakeLock();
  if (motionOn && !cal.done) openCal();
}
function fetchJson(url, ms) {
  const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = setTimeout(() => ctl?.abort(), ms);
  return fetch(url, { signal: ctl?.signal, cache: 'no-store' }).then((r) => r.json()).catch(() => null).finally(() => clearTimeout(timer));
}
$('startBtn').onclick = start;
// A game that pairs a second phone directly (e.g. 2-player table tennis) links to /pad?pin=…&layout=swing&title=…
{
  const q = new URLSearchParams(location.search);
  setLayout(q.get('layout') || 'menu', q.get('title') || '');
}

// ───────────────────────────── calibration ─────────────────────────────
const tuneLabels = () => {
  $('sensV').textContent = (+cal.sens).toFixed(1) + 'x';
  $('flickV').textContent = cal.flick < 18 ? 'Light' : cal.flick > 30 ? 'Hard' : 'Medium';
};
const showTune = () => {
  $('calTitle').textContent = 'Fine-tune';
  $('calStill').classList.add('hidden');
  $('calTune').classList.remove('hidden');
  $('sens').value = cal.sens;
  $('flick').value = cal.flick;
  $('invX').checked = cal.invX;
  $('invY').checked = cal.invY;
  tuneLabels();
};
function openCal() {
  $('calTitle').textContent = 'Calibrate';
  $('calStill').classList.remove('hidden');
  $('calTune').classList.add('hidden');
  $('calMsg').textContent = motionOn ? 'Rest your phone on a table, or hold it very still.' : 'Turn Motion on first to calibrate the sensors.';
  $('calBar').style.width = '0';
  $('calGo').disabled = false;
  $('calGo').textContent = 'START';
  $('calGate').classList.remove('hidden');
  link.send({ t: 'calibrate', phase: 'start' });
}
$('calBtn').onclick = openCal;
$('calGo').onclick = () => {
  if (!motionOn) return showTune();
  $('calGo').disabled = true;
  $('calGo').textContent = 'HOLD STILL...';
  $('calMsg').textContent = 'Measuring... keep it still.';
  sampling = { a: [], b: [] };
  const t0 = performance.now();
  const tick = () => {
    const p = Math.min(1, (performance.now() - t0) / 2500);
    $('calBar').style.width = p * 100 + '%';
    if (p < 1) return requestAnimationFrame(tick);
    const sm = sampling;
    sampling = null;
    const avg = (v) => v.reduce((x, y) => x + y, 0) / (v.length || 1);
    const spread = Math.max(...sm.a.map((v) => Math.abs(v - avg(sm.a))), ...sm.b.map((v) => Math.abs(v - avg(sm.b))), 0);
    if (!sm.a.length) $('calMsg').textContent = 'No motion data. Check sensor permission, then retry.';
    else if (spread > 15) $('calMsg').textContent = 'Too much movement. Try again, holding it still.';
    else {
      cal.bias = [avg(sm.a), avg(sm.b)];
      cal.done = true;
      saveCal();
      haptic([30, 40, 30]);
      return showTune();
    }
    $('calGo').disabled = false;
    $('calGo').textContent = 'RETRY';
  };
  tick();
};
$('sens').oninput = () => {
  cal.sens = +$('sens').value;
  tuneLabels();
};
$('flick').oninput = () => {
  cal.flick = +$('flick').value;
  tuneLabels();
};
$('invX').onchange = () => (cal.invX = $('invX').checked);
$('invY').onchange = () => (cal.invY = $('invY').checked);
$('calRedo').onclick = openCal;
$('calDone').onclick = () => {
  cal.done = true;
  saveCal();
  $('calGate').classList.add('hidden');
  link.send({ t: 'calibrate', phase: 'done' });
  link.send({ t: 'center' });
};
