/**
 * /pad "kart" layout (Farm Kart): the phone is a steering wheel.
 *
 *   Tilt     hold the phone sideways and turn it like a wheel (gravity angle in the screen plane,
 *            same maths as farm-kart/public/pad/pad.js: ±max° is full lock, dead zone, re-centre)
 *   Buttons  ◀ ▶ buttons instead of tilting (also used automatically when there is no motion sensor)
 *   Pads     DRIFT · BRAKE · ITEM · GAS (multi-touch, hold), auto-gas on by default, Pause
 *   HUD      position, lap and item from the screen ({t:'kartHud', pos, lap, laps, item, itemName, count, rolling})
 *
 * Sends {t:'in', s, g, b, d, i} (steer -1…1, gas, brake, drift, item) every 30 ms while it changes and
 * every ~240 ms as a keep-alive: the same message Farm Kart's own phone pad sends. Pause is an ordinary
 * {t:'button', b:'pause'}. Vibration uses the pad's usual {t:'haptic'}.
 * Mounted by pad.js: initKart({ link, haptic }); it shows itself while <body> has class layout-kart.
 */
const IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const KEY = 'exemoo.kart';
const DEF = { mode: 'tilt', max: 38, dead: 2.5, autoGas: true, flip: false, lefty: false };

const CSS = `
body.layout-kart .row, body.layout-kart #extras { display:none!important }
body.layout-kart [data-view=kart] { display:grid }
.kart { flex:1; min-height:0; gap:10px }
.kart .khud { grid-area:hud; display:flex; gap:8px; align-items:stretch; min-width:0 }
.kart .kchip { background:#fff; border:4px solid var(--ink); border-radius:16px; box-shadow:0 4px 0 var(--ink); padding:2px 10px; font-family:'Lilita One'; font-size:20px; display:grid; place-items:center; line-height:1.05; white-space:nowrap }
.kart .kpos { font-size:28px; color:var(--red); min-width:68px }
.kart .kitem { flex:1; display:flex; gap:8px; align-items:center; justify-content:center; min-width:0; overflow:hidden; text-overflow:ellipsis }
.kart .kitem i { font-style:normal; background:var(--yellow); border:3px solid var(--ink); border-radius:10px; padding:0 8px; font-size:18px }
.kart .kitem.has { background:#fff6c8 }
.kart .kitem.roll { animation:kroll .18s infinite alternate }
@keyframes kroll { to { background:#ffe36b } }
.kart .kpause { font-size:18px; border-radius:14px; padding:4px 14px; flex:none }
.kart .kmid { grid-area:mid; display:grid; grid-template-rows:1fr auto; gap:8px; min-height:0 }
.kart .kwheel { position:relative; border:5px solid var(--ink); border-radius:24px; background:radial-gradient(circle,#fff,#e9f6ff 70%); box-shadow:0 6px 0 var(--ink); display:grid; place-items:center; min-height:90px; overflow:hidden }
.kart .kwheel svg { height:min(72%,200px); width:auto; max-width:80%; transition:transform .03s linear }
.kart .kbar { position:absolute; left:12px; right:12px; bottom:8px; height:12px; border:3px solid var(--ink); border-radius:8px; background:#fff; overflow:hidden }
.kart .kbar i { position:absolute; top:0; bottom:0; left:50%; width:0; background:var(--red) }
.kart .kbar::after { content:''; position:absolute; left:50%; top:0; bottom:0; width:3px; margin-left:-1.5px; background:var(--ink) }
.kart .kmsg { position:absolute; top:6px; left:0; right:0; text-align:center; font-weight:800; font-size:13px; opacity:.75 }
.kart .kopts { display:flex; gap:6px; justify-content:center; flex-wrap:wrap }
.kart .kopt { font-size:14px; border-radius:12px; padding:2px 9px; --c:#8a8aa0; --d:#5a5a70 }
.kart .kopt.on { --c:var(--green); --d:var(--green-d) }
.kart .kpads { display:contents }
.kart .kpad { border-radius:22px; font-size:clamp(20px,6vmin,34px); display:grid; place-items:center; padding:0; min-height:0; touch-action:none }
.kart .kpad.held { transform:translateY(5px); box-shadow:0 1px 0 var(--d),0 1px 0 4px var(--ink); filter:brightness(1.08) }
.kart .kpad.auto:not(.held) { animation:kauto 1.2s infinite }
@keyframes kauto { 50% { filter:brightness(1.18) } }
.kart .kpad.steer { --c:#9b4dff; --d:#6a24c7; font-size:clamp(28px,9vmin,48px) }
.kart [data-k=L]{grid-area:L} .kart [data-k=R]{grid-area:R} .kart [data-k=d]{grid-area:d}
.kart [data-k=b]{grid-area:b} .kart [data-k=i]{grid-area:i} .kart [data-k=g]{grid-area:g}
`;

const WHEEL = `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="none" stroke="#1b1b3a" stroke-width="13"/><circle cx="50" cy="50" r="44" fill="none" stroke="var(--red)" stroke-width="7"/><path d="M50 50 L12 44 M50 50 L88 44 M50 50 L50 92" stroke="#1b1b3a" stroke-width="12" stroke-linecap="round"/><path d="M50 50 L12 44 M50 50 L88 44 M50 50 L50 92" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="50" r="13" fill="#ffd21f" stroke="#1b1b3a" stroke-width="5"/><rect x="45" y="3" width="10" height="9" rx="3" fill="#ffd21f" stroke="#1b1b3a" stroke-width="3"/></svg>`;

const HTML = `
<div class="khud">
  <div class="kchip kpos" id="kPos">-</div>
  <div class="kchip" id="kLap">LAP -</div>
  <div class="kchip kitem" id="kItem">-</div>
  <button class="b yellow kpause" id="kPause">Pause</button>
</div>
<div class="kmid">
  <div class="kwheel" id="kWheel"><div class="kmsg" id="kMsg"></div>${WHEEL}<div class="kbar"><i id="kBar"></i></div></div>
  <div class="kopts">
    <button class="b kopt" id="kMode">Tilt</button>
    <button class="b kopt" id="kCenter">Centre</button>
    <button class="b kopt" id="kAuto">Auto-gas</button>
    <button class="b kopt" id="kFlip">Flip</button>
    <button class="b kopt" id="kLefty">Swap</button>
  </div>
</div>
<div class="kpads" id="kPads">
  <button class="b kpad steer" data-k="L" aria-label="Steer left">&#9664;</button>
  <button class="b kpad steer" data-k="R" aria-label="Steer right">&#9654;</button>
  <button class="b kpad" data-k="d">DRIFT</button>
  <button class="b yellow kpad" data-k="b">BRAKE</button>
  <button class="b red kpad" data-k="i" id="kItemBtn">ITEM</button>
  <button class="b green kpad gas" data-k="g">GAS</button>
</div>`;

export function initKart({ link, haptic = () => {} }) {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  const view = document.createElement('div');
  view.className = 'view kart';
  view.dataset.view = 'kart';
  view.innerHTML = HTML;
  (document.getElementById('extras') || document.body.lastElementChild).before(view);
  const $ = (id) => view.querySelector('#' + id);

  let set = { ...DEF };
  try {
    Object.assign(set, JSON.parse(localStorage.getItem(KEY) || '{}'));
  } catch {
    /* defaults */
  }
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(set));
    } catch {
      /* private mode */
    }
    paintOpts();
  };
  const active = () => document.body.classList.contains('layout-kart');

  // ── pads (multi-touch: each pad tracks its own pointers) ──
  const held = { g: false, b: false, d: false, i: false, L: false, R: false };
  for (const el of view.querySelectorAll('.kpad')) {
    const k = el.dataset.k, ids = new Set();
    const sync = () => {
      held[k] = ids.size > 0;
      el.classList.toggle('held', held[k]);
    };
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      ids.add(e.pointerId);
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      sync();
      haptic(8);
      tick();
    });
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) el.addEventListener(ev, (e) => {
      ids.delete(e.pointerId);
      sync();
      tick();
    });
  }
  view.addEventListener('contextmenu', (e) => e.preventDefault());
  $('kPause').addEventListener('click', () => {
    link.send({ t: 'button', b: 'pause' });
    haptic(15);
  });

  // ── options ──
  function paintOpts() {
    $('kMode').textContent = set.mode === 'tilt' ? 'Tilt' : 'Buttons';
    $('kMode').classList.add('on');
    $('kAuto').classList.toggle('on', set.autoGas);
    $('kFlip').classList.toggle('on', set.flip);
    $('kLefty').classList.toggle('on', set.lefty);
    $('kCenter').classList.toggle('hidden', set.mode !== 'tilt');
    $('kFlip').classList.toggle('hidden', set.mode !== 'tilt');
  }
  const opt = (id, fn) => $(id).addEventListener('click', () => {
    fn();
    save();
    haptic(15);
  });
  opt('kMode', () => (set.mode = set.mode === 'tilt' ? 'buttons' : 'tilt'));
  opt('kAuto', () => (set.autoGas = !set.autoGas));
  opt('kFlip', () => (set.flip = !set.flip));
  opt('kLefty', () => (set.lefty = !set.lefty));
  opt('kCenter', () => (center = rawAngle));
  paintOpts();

  // ── tilt steering: copied from farm-kart/public/pad/pad.js ──
  // Gravity is read in device axes (Android convention: the vector points "up"; iOS reports the opposite
  // sign). Its angle within the screen plane tells how far the phone is rotated like a wheel,
  // independent of how far it's tipped back.
  let gx = 0, gy = 0, side = 1, rawAngle = 0, center = 0, lastMotion = 0;
  addEventListener('devicemotion', (e) => {
    const a = e.accelerationIncludingGravity;
    if (!a || a.x == null) return;
    const k = IOS ? -1 : 1;
    gx += (a.x * k - gx) * 0.45;
    gy += (a.y * k - gy) * 0.45;
    lastMotion = performance.now();
    const land = innerWidth > innerHeight;
    let ang;
    if (land || Math.abs(gx) > Math.abs(gy) * 1.6) {
      if (gx > 3) side = 1;
      else if (gx < -3) side = -1;
      ang = side > 0 ? Math.atan2(gy, gx) : Math.atan2(-gy, -gx);
    } else ang = Math.atan2(-gx, gy);
    rawAngle = (ang * 180) / Math.PI;
  });

  // Drag on the wheel steers too (fallback / override), like the Farm Kart pad.
  let touchSteer = null;
  const zone = $('kWheel');
  zone.addEventListener('pointerdown', (e) => {
    touchSteer = { id: e.pointerId, x0: e.clientX, v: 0 };
    try {
      zone.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  });
  zone.addEventListener('pointermove', (e) => {
    if (touchSteer?.id === e.pointerId) touchSteer.v = Math.max(-1, Math.min(1, (e.clientX - touchSteer.x0) / (zone.clientWidth * 0.3)));
  });
  for (const ev of ['pointerup', 'pointercancel']) zone.addEventListener(ev, (e) => {
    if (touchSteer?.id === e.pointerId) touchSteer = null;
  });

  // ── input ──
  const inp = { s: 0, g: false, b: false, d: false, i: false };
  let btnSteer = 0, lastT = performance.now();
  const hasGyro = () => performance.now() - lastMotion < 600;
  const useButtons = () => set.mode === 'buttons' || !hasGyro();
  function compute() {
    const now = performance.now(), dt = Math.min(0.1, (now - lastT) / 1000);
    lastT = now;
    // Buttons ramp to full lock in ~0.1 s and straighten as fast, so taps give small corrections.
    const want = (held.R ? 1 : 0) - (held.L ? 1 : 0);
    btnSteer += Math.max(-dt * 10, Math.min(dt * 10, want - btnSteer));
    let s = 0;
    if (touchSteer) s = touchSteer.v;
    else if (useButtons()) s = btnSteer;
    else {
      let d = rawAngle - center;
      d = ((d + 540) % 360) - 180;
      d *= set.flip ? -1 : 1;
      s = Math.abs(d) < set.dead ? 0 : Math.sign(d) * Math.min(1, (Math.abs(d) - set.dead) / (set.max - set.dead));
    }
    inp.s = s;
    inp.g = (set.autoGas && !held.b) || held.g;
    inp.b = held.b;
    inp.d = held.d;
    inp.i = held.i;
  }

  let lastSent = '', n = 0, wasActive = false, sentMode = '';
  function tick() {
    const on = active();
    if (!on) {
      if (wasActive && link.connected) link.send({ t: 'in', s: 0, g: 0, b: 0, d: 0, i: 0 });
      wasActive = false;
      return;
    }
    wasActive = true;
    compute();
    if (!link.connected) return;
    // Steering mode for the TV's player card ({t:'mode'} as in Farm Kart's own pad).
    const mode = touchSteer ? 'touch' : useButtons() ? 'buttons' : 'tilt';
    if (mode !== sentMode || n % 64 === 0) link.send({ t: 'mode', m: (sentMode = mode) });
    const m = { t: 'in', s: Math.round(inp.s * 1000) / 1000, g: +inp.g, b: +inp.b, d: +inp.d, i: +inp.i };
    const str = JSON.stringify(m);
    if (str !== lastSent || n++ % 8 === 0) {
      link.send(m);
      lastSent = str;
    }
  }
  setInterval(tick, 30);

  // ── drawing ──
  const wheel = zone.querySelector('svg'), bar = $('kBar');
  (function paint() {
    requestAnimationFrame(paint);
    if (!active()) return;
    wheel.style.transform = `rotate(${inp.s * 90}deg)`;
    bar.style.left = (inp.s < 0 ? 50 + inp.s * 50 : 50) + '%';
    bar.style.width = Math.abs(inp.s) * 50 + '%';
    arrange();
    view.querySelector('.kpad.gas').classList.toggle('auto', set.autoGas && !held.b);
    $('kMsg').textContent = touchSteer ? 'touch steering' : set.mode === 'buttons' ? 'steer with the arrow buttons' : hasGyro() ? 'turn your phone like a wheel' : 'no tilt sensor: arrow buttons';
  })();

  // Grid areas for the current orientation / steering mode / hand. Thumbs: steering on one side, pads on the other.
  let arranged = '';
  function arrange() {
    const land = innerWidth > innerHeight, btn = useButtons(), lefty = set.lefty;
    const key = `${land}${btn}${lefty}`;
    if (key === arranged) return;
    arranged = key;
    let rows = land
      ? btn ? [['hud', 'hud', 'hud', 'hud', 'hud'], ['L', 'R', 'mid', 'd', 'i'], ['L', 'R', 'mid', 'b', 'g']] : [['hud', 'hud', 'hud'], ['d', 'mid', 'i'], ['b', 'mid', 'g']]
      : btn ? [['hud', 'hud', 'hud', 'hud'], ['mid', 'mid', 'mid', 'mid'], ['L', 'R', 'd', 'i'], ['L', 'R', 'b', 'g']] : [['hud', 'hud'], ['mid', 'mid'], ['d', 'i'], ['b', 'g']];
    if (lefty) rows = rows.map((r) => [...r].reverse().map((a) => (a === 'L' ? 'R' : a === 'R' ? 'L' : a)));
    view.style.gridTemplateAreas = rows.map((r) => `"${r.join(' ')}"`).join(' ');
    view.style.gridTemplateColumns = land ? (btn ? '1fr 1fr 1.4fr 1fr 1fr' : '1fr 1.3fr 1fr') : `repeat(${rows[0].length},1fr)`;
    view.style.gridTemplateRows = land ? 'auto 1fr 1fr' : 'auto minmax(120px,1fr) minmax(90px,.8fr) minmax(90px,.8fr)';
    for (const el of view.querySelectorAll('.steer')) el.classList.toggle('hidden', !btn);
  }

  // ── HUD from the screen ──
  const ORD = (v) => v + (v % 100 > 10 && v % 100 < 14 ? 'th' : ['st', 'nd', 'rd'][(v % 10) - 1] || 'th');
  link.on('message', (m) => {
    if (m.t !== 'kartHud') return;
    $('kPos').textContent = m.pos ? ORD(m.pos) : '-';
    $('kLap').textContent = m.laps ? `LAP ${Math.max(1, Math.min(m.lap, m.laps))}/${m.laps}` : 'LAP -';
    const item = $('kItem');
    item.classList.toggle('roll', !!m.rolling);
    item.classList.toggle('has', !!m.item && !m.rolling);
    const name = m.rolling ? '...' : m.item ? String(m.itemName || m.item).slice(0, 18) : '-';
    item.replaceChildren(document.createTextNode(name));
    if (m.item && !m.rolling && m.count > 1) {
      const c = document.createElement('i');
      c.textContent = 'x' + (m.count | 0);
      item.append(c);
    }
    $('kItemBtn').textContent = m.item && !m.rolling ? 'USE' : 'ITEM';
  });
}
