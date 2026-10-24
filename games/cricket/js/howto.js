// "How to bat" overlay for Exemoo Cricket. A condensed, visual version of HOW_TO_BAT.md.
//
//   const howto = createHowTo({ parent: document.body });
//   howto.show(); howto.hide(); howto.toggle(); howto.open; howto.el
//
// Conventions shown here come from batcam.js / physics.js: the camera image is mirrored like a mirror, so
// screen RIGHT (your right hand) = off side, screen LEFT = leg side. Up and down both count as forward.

const CSS = `
.ht-overlay{position:fixed;inset:0;z-index:6;display:none;background:#1b1b3a99;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px;font-family:'Baloo 2',system-ui,sans-serif;color:#1b1b3a}
.ht-overlay.ht-open{display:block}
.ht-card{background:#fff;border:5px solid #1b1b3a;border-radius:28px;box-shadow:0 10px 0 #1b1b3a,0 22px 30px #0004;padding:22px 22px 26px;max-width:980px;margin:12px auto 24px;text-align:center}
.ht-title{font-family:'Lilita One',sans-serif;font-weight:400;letter-spacing:.02em;font-size:clamp(38px,7vw,64px);line-height:1;color:#ffd21f;-webkit-text-stroke:6px #1b1b3a;paint-order:stroke fill;text-shadow:0 6px 0 #1b1b3a;margin:0 0 6px}
.ht-sub{font-weight:700;font-size:16px;margin:0 auto 14px;max-width:640px}
.ht-h{font-family:'Lilita One',sans-serif;font-weight:400;font-size:24px;margin:20px 0 8px;letter-spacing:.02em}
.ht-controls{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;text-align:left}
.ht-ctl{border:3px solid #1b1b3a;border-radius:14px;padding:8px 12px 10px;box-shadow:0 4px 0 #1b1b3a;font-weight:700;font-size:14px;line-height:1.3}
.ht-ctl b{display:block;font-family:'Lilita One',sans-serif;font-weight:400;font-size:19px}
.ht-ctl small{display:block;font-weight:800;font-size:12px;opacity:.7;margin-top:4px}
.ht-ctl.ht-c1{background:#dfeaff}.ht-ctl.ht-c2{background:#eaffd9}.ht-ctl.ht-c3{background:#fff1b8}
.ht-mirror{display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;margin-top:12px;font-weight:800;font-size:14px}
.ht-chip{border:3px solid #1b1b3a;border-radius:999px;padding:1px 12px;background:#fff;box-shadow:0 3px 0 #1b1b3a;white-space:nowrap}
.ht-chip.ht-off{background:#2fc65a;color:#fff}.ht-chip.ht-leg{background:#2f7cff;color:#fff}
.ht-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;text-align:left}
.ht-shot{background:#f7f9ff;border:3px solid #1b1b3a;border-radius:16px;box-shadow:0 4px 0 #1b1b3a;padding:6px 8px 10px;display:flex;flex-direction:column}
.ht-shot svg{width:100%;height:auto;display:block}
.ht-shot h3{font-family:'Lilita One',sans-serif;font-weight:400;font-size:20px;margin:2px 4px 0}
.ht-shot p{font-weight:700;font-size:13px;line-height:1.3;margin:2px 4px 0}
.ht-shot p.ht-oops{opacity:.75;font-weight:600}
.ht-timing{display:flex;gap:16px;align-items:center;text-align:left;background:#eaffd9;border:3px solid #1b1b3a;border-radius:16px;box-shadow:0 4px 0 #1b1b3a;padding:10px 14px}
.ht-timing svg{flex:0 0 76px;width:76px;height:auto}
.ht-timing p{margin:0 0 6px;font-weight:700;font-size:14px;line-height:1.35}
.ht-grades{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.ht-grades span{border:3px solid #1b1b3a;border-radius:10px;padding:0 8px;font-weight:800;font-size:12px;background:#fff}
.ht-g1{background:#2fc65a!important;color:#fff}.ht-g2{background:#ffd21f!important}.ht-g3{background:#ff9d3c!important}.ht-g4{background:#ff3b30!important;color:#fff}
.ht-tips{text-align:left;font-weight:700;font-size:14px;margin:12px 0 0;padding:0 0 0 20px;line-height:1.4}
.ht-actions{margin-top:18px}
.ht-overlay .btn{margin:0}
@media (max-width:700px){.ht-controls{grid-template-columns:1fr}.ht-card{padding:16px 14px 22px;border-radius:22px}.ht-timing{flex-direction:column;text-align:center}.ht-timing p{text-align:left}}
`;

const INK = '#1b1b3a', RED = '#ff3b30', YEL = '#ffd21f', GRN = '#2fc65a', BLU = '#2f7cff';

// Each shot: hand path in the figure's own 120x130 box (screen terms: x right = your right), field direction
// in radians (0 straight, + off = screen right), and whether it is in the air.
const SHOTS = [
  { name: 'Straight drive', from: [60, 40], to: [60, 98], aim: 0, how: 'Hands straight DOWN, chest to belt. Firm.', oops: 'Drifting sideways bends it.' },
  { name: 'Cover drive', from: [40, 40], to: [86, 98], aim: 0.8, how: 'Down and to YOUR RIGHT: left shoulder to right hip.', oops: 'Flatter = cut. Upwards = lofted.' },
  { name: 'Square cut', from: [30, 68], to: [108, 80], aim: 1.5, how: 'Flat sweep to YOUR RIGHT, waist height. Fast, wide.', oops: 'Rise past ~45° and it flies. Late = edge to point or third man.' },
  { name: 'On drive', from: [80, 40], to: [34, 98], aim: -0.8, how: 'Down and to YOUR LEFT: right shoulder to left hip.', oops: 'Flatter = pull. Early = squarer.' },
  { name: 'Pull', from: [106, 60], to: [14, 70], aim: -1.5, how: 'Flat sweep to YOUR LEFT across the chest. Fast, wide.', oops: 'Rising steeply (45°+) lofts it. Too early = edge.' },
  { name: 'Flick', from: [100, 66], to: [22, 78], aim: -2.1, how: 'A short quick pull, played ~0.1 s EARLY: the early drag takes it fine.', oops: '0.18 s early = inside edge.' },
  { name: 'Lofted drive / six', from: [52, 100], to: [74, 18], aim: 0.3, air: true, how: 'Hands UP: hip to above the shoulder (steeper than 45° above flat). Big, fast, PERFECT timing.', oops: 'Mistimed lofts go up, not out: caught.' },
  { name: 'Block', from: [60, 52], to: [60, 70], aim: 0, short: true, how: 'Short, gentle push under 1 body width. Power below 0.3 = block.', oops: 'Too slow (under 3.5 widths/s) and nothing registers.' },
];

function figure(s) {
  const [x1, y1] = s.from, [x2, y2] = s.to;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  // Stop the line a little short so the arrow head lands on the finish point.
  const ex = x2 - (dx / len) * 6, ey = y2 - (dy / len) * 6;
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const path = s.air
    ? `M${x1},${y1} Q${x1 - 22},${(y1 + y2) / 2} ${ex},${ey}`
    : `M${x1},${y1} L${ex},${ey}`;
  return `
    <g>
      <circle cx="60" cy="19" r="12" fill="#ffd9b0" stroke="${INK}" stroke-width="3"/>
      <rect x="40" y="33" width="40" height="52" rx="12" fill="${BLU}" stroke="${INK}" stroke-width="3"/>
      <path d="M50,85 V122 M70,85 V122" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <path d="${path}" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round" ${s.short ? '' : ''}/>
      <path d="${path}" fill="none" stroke="${YEL}" stroke-width="4.5" stroke-linecap="round" ${s.air ? 'stroke-dasharray="1 7"' : ''}/>
      <polygon points="-8,-8 8,0 -8,8" transform="translate(${x2},${y2}) rotate(${s.air ? ang - 10 : ang})" fill="${RED}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="${x1}" cy="${y1}" r="6" fill="${GRN}" stroke="${INK}" stroke-width="3"/>
    </g>`;
}

function field(s) {
  // Mini ground, batter at the bottom centre; ball arrow goes out at the shot's angle (screen right = off).
  const cx = 45, cy = 98, R = 54;
  const px = cx + Math.sin(s.aim) * R * 0.9, py = cy - Math.cos(s.aim) * R * 0.9;
  const hx = cx + Math.sin(s.aim) * R * 0.45, hy = cy - Math.cos(s.aim) * R * 0.45 - (s.air ? 14 : 0);
  const ang = (Math.atan2(py - hy, px - hx) * 180) / Math.PI;
  const line = s.air ? `M${cx},${cy} Q${hx},${hy} ${px},${py}` : `M${cx},${cy} L${px},${py}`;
  return `
    <g>
      <path d="M${cx - R},${cy} A${R},${R} 0 0 1 ${cx + R},${cy} Z" fill="#5fd03a" stroke="${INK}" stroke-width="3"/>
      <path d="M${cx},${cy} L${cx},${cy - R}" stroke="#ffffff88" stroke-width="2" stroke-dasharray="3 4"/>
      <rect x="${cx - 3}" y="${cy - 16}" width="6" height="16" fill="#e8d7a0" stroke="${INK}" stroke-width="1.5"/>
      <path d="${line}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <path d="${line}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" ${s.air ? 'stroke-dasharray="1 6"' : ''}/>
      <polygon points="-7,-6 7,0 -7,6" transform="translate(${px},${py}) rotate(${ang})" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <text x="${cx + R - 2}" y="${cy + 14}" text-anchor="end" font-family="'Lilita One',sans-serif" font-size="11" fill="${GRN}" stroke="${INK}" stroke-width="2.5" paint-order="stroke">OFF</text>
      <text x="${cx - R + 2}" y="${cy + 14}" text-anchor="start" font-family="'Lilita One',sans-serif" font-size="11" fill="${BLU}" stroke="${INK}" stroke-width="2.5" paint-order="stroke">LEG</text>
    </g>`;
}

function shotCard(s) {
  return `<div class="ht-shot">
    <svg viewBox="0 0 220 132" role="img" aria-label="${s.name}: hands path and ball direction">
      ${figure(s)}
      <g transform="translate(124,6) scale(0.92)">${field(s)}</g>
    </svg>
    <h3>${s.name}</h3>
    <p>${s.how}</p>
    <p class="ht-oops">${s.oops}</p>
  </div>`;
}

function timingBar() {
  // Vertical track: the ball slides down toward the green PERFECT band.
  return `<svg viewBox="0 0 76 150" aria-hidden="true">
    <rect x="22" y="4" width="32" height="142" rx="14" fill="#fff" stroke="${INK}" stroke-width="4"/>
    <rect x="22" y="104" width="32" height="26" rx="6" fill="${GRN}" stroke="${INK}" stroke-width="3"/>
    <circle cx="38" cy="40" r="9" fill="${RED}" stroke="${INK}" stroke-width="3"/>
    <path d="M38,56 V88" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 8"/>
    <polygon points="30,86 46,86 38,98" fill="${INK}"/>
    <text x="38" y="122" text-anchor="middle" font-family="'Lilita One',sans-serif" font-size="10" fill="#fff" stroke="${INK}" stroke-width="2" paint-order="stroke">PERFECT</text>
  </svg>`;
}

const HTML = `
<div class="ht-card" role="dialog" aria-modal="true" aria-labelledby="htTitle">
  <h1 class="ht-title" id="htTitle">HOW TO BAT</h1>
  <p class="ht-sub">Face the camera, both arms in view, about 2 m back. Hold an imaginary bat. Only your <b>hands</b> are tracked.</p>
  <div class="ht-controls">
    <div class="ht-ctl ht-c1"><b>1. WHERE = direction</b>The line your hands travel. Right = off side, left = leg side. Up or down both go forward; up lofts.<small>Rest hands at chest height so you can go down.</small></div>
    <div class="ht-ctl ht-c2"><b>2. HOW FAR + FAST = power</b>A full, brisk sweep (about 1.8 body widths, 10 per second) is full power. Small or slow is a block.<small>Needs 3.5 body widths per second to count.</small></div>
    <div class="ht-ctl ht-c3"><b>3. WHEN = timing</b>Contact is always 0.2 s after your hands start. Start as the ball passes the SWING! line on the right-hand bar.<small>Only the first part of the swing counts.</small></div>
  </div>
  <div class="ht-mirror">The screen is a mirror:
    <span class="ht-chip ht-leg">your LEFT = screen left = LEG side</span>
    <span class="ht-chip ht-off">your RIGHT = screen right = OFF side</span>
  </div>

  <h2 class="ht-h">The shots</h2>
  <div class="ht-grid">${SHOTS.map(shotCard).join('')}</div>
  <p class="ht-sub" style="margin-top:10px"><b>Yellow</b> arrow: the path of your hands, from the <b style="color:${GRN}">green</b> dot. <b>White</b> arrow: where the ball goes. Dotted = in the air.</p>

  <h2 class="ht-h">Timing</h2>
  <div class="ht-timing">
    ${timingBar()}
    <div>
      <p>Watch the bar on the right of the screen: the ball slides toward the <b>green PERFECT window</b>. Start your swing about a quarter second before it reaches the green.</p>
      <p><b>Early</b> drags the ball to the leg side, <b>late</b> steers it to the off side. Far out and it edges behind the wicket, to the side your hands were heading.</p>
      <div class="ht-grades"><span class="ht-g1">PERFECT 0.045 s</span><span class="ht-g2">GOOD 0.095 s</span><span class="ht-g3">EARLY / LATE 0.18 s</span><span class="ht-g4">EDGED 0.25 s</span><span>MISS beyond</span></div>
    </div>
  </div>
  <ul class="ht-tips">
    <li>Keep the same swing speed every ball: a harder swing makes contact sooner.</li>
    <li>Only well-timed shots go far. Aim for the gaps, not the fielders.</li>
    <li>Hold still between balls; a swing ends when your hands rest for 0.2 s.</li>
  </ul>
  <div class="ht-actions"><button class="btn green" id="howtoClose" type="button">GOT IT</button></div>
</div>`;

let cssDone = false;

export function createHowTo({ parent = document.body } = {}) {
  if (!cssDone) {
    const st = document.createElement('style');
    st.dataset.howto = '';
    st.textContent = CSS;
    document.head.appendChild(st);
    cssDone = true;
  }
  const el = document.createElement('div');
  el.className = 'ht-overlay';
  el.id = 'howto';
  el.innerHTML = HTML;
  parent.appendChild(el);
  let open = false;

  const onKey = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      api.hide();
    }
  };
  const api = {
    show() {
      if (open) return;
      open = true;
      el.classList.add('ht-open');
      el.scrollTop = 0;
      addEventListener('keydown', onKey);
      el.querySelector('#howtoClose')?.focus({ preventScroll: true });
    },
    hide() {
      if (!open) return;
      open = false;
      el.classList.remove('ht-open');
      removeEventListener('keydown', onKey);
    },
    toggle() {
      open ? api.hide() : api.show();
    },
    get open() {
      return open;
    },
    el,
  };
  el.querySelector('#howtoClose').addEventListener('click', () => api.hide());
  el.addEventListener('pointerdown', (e) => {
    if (e.target === el) api.hide();
  });
  return api;
}
