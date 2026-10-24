// Vertical timing bar (right side of screen). Top = ball released, bottom = ball reaches the bat.
// DOM + CSS (class prefix `tb-`), transforms only per frame.

import { GRADES } from './physics.js';
// Timing windows straight from the shot model, so the bar always matches the game.
const W = Object.fromEntries(GRADES);
const WIN = { perfect: W.PERFECT, good: W.GOOD, mis: W.MISTIMED, edge: W.EDGED };
const TAIL = 0.3; // seconds of track shown after the ball reaches the bat (late side)
const COLORS = {
  PERFECT: '#2fc65a', GOOD: '#ffd21f', EARLY: '#ff9a1f', LATE: '#ff9a1f', MISTIMED: '#ff9a1f',
  EDGED: '#ff3b30', MISS: '#ff3b30',
};

const CSS = `
.tb-root{position:fixed;right:18px;top:50%;width:46px;height:clamp(200px,49vh,520px);transform:translateY(-50%);
  z-index:2;pointer-events:none;font-family:'Lilita One','Baloo 2',sans-serif;color:#1b1b3a;transition:opacity .25s}
.tb-root.tb-hidden{display:none}
.tb-root.tb-idle .tb-track{opacity:.55;filter:saturate(.5)}
.tb-track{position:absolute;inset:0;background:#fff;border:4px solid #1b1b3a;border-radius:16px;
  box-shadow:0 5px 0 #1b1b3a;overflow:hidden;transition:opacity .25s,filter .25s}
.tb-zone{position:absolute;left:0;right:0;top:0;height:100%;transform-origin:0 0;will-change:transform}
.tb-z-edge{background:rgba(255,59,48,.22)}
.tb-z-mis{background:#ffb35c}
.tb-z-good{background:#ffd21f}
.tb-z-perf{background:#2fc65a}
.tb-fill{position:absolute;left:50%;top:0;width:6px;height:100%;margin-left:-3px;background:rgba(27,27,58,.18);
  transform-origin:0 0;border-radius:3px}
.tb-line{position:absolute;left:0;right:0;top:0;height:3px;margin-top:-1.5px;background:#1b1b3a;will-change:transform}
.tb-ball{position:absolute;left:50%;top:0;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:50%;will-change:transform;
  background:radial-gradient(circle at 35% 30%,#ff8a80,#ff3b30 55%,#b3160f);border:3px solid #1b1b3a;box-sizing:border-box}
.tb-ball::after{content:"";position:absolute;inset:-11px;border-radius:50%;background:radial-gradient(circle,rgba(255,59,48,.75),rgba(255,59,48,0) 70%);
  opacity:var(--glow,0);z-index:-1}
.tb-swing{position:absolute;left:0;top:0;width:100%;will-change:transform}
.tb-swing-line{position:absolute;left:0;right:0;top:-2px;height:4px;background:#2f7cff;box-shadow:0 0 0 2px #1b1b3a}
.tb-swing-tag{position:absolute;right:calc(100% + 10px);top:-15px;white-space:nowrap;background:#2f7cff;color:#fff;
  border:4px solid #1b1b3a;border-radius:12px;padding:0 10px;font-size:20px;line-height:24px;box-shadow:0 4px 0 #1b1b3a;
  text-shadow:0 2px 0 #1747b5;transform-origin:100% 50%}
.tb-swing-tag::after{content:"";position:absolute;left:100%;top:50%;margin-top:-7px;border:7px solid transparent;border-left:9px solid #1b1b3a}
.tb-swing.tb-pulse .tb-swing-tag{animation:tb-pop .55s ease-out}
.tb-swing.tb-pulse .tb-swing-line{animation:tb-flash .55s ease-out}
.tb-swing.tb-near .tb-swing-tag{animation:tb-beat .5s ease-in-out infinite}
@keyframes tb-pop{0%{transform:scale(1)}30%{transform:scale(1.4) translateX(-6px);background:#ffd21f;color:#1b1b3a}100%{transform:scale(1)}}
@keyframes tb-beat{50%{transform:scale(1.12)}}
@keyframes tb-flash{0%,60%{background:#ffd21f}100%{background:#2f7cff}}
.tb-res{position:absolute;left:0;top:0;width:100%;opacity:0;will-change:transform,opacity}
.tb-tick{position:absolute;left:-8px;right:-8px;top:-3px;height:6px;background:var(--c);border:2px solid #1b1b3a;border-radius:4px}
.tb-grade{position:absolute;right:calc(100% + 14px);top:-19px;white-space:nowrap;font-size:30px;line-height:38px;
  color:var(--c);-webkit-text-stroke:2px #1b1b3a;paint-order:stroke fill;text-shadow:0 3px 0 #1b1b3a}
.tb-res.tb-show{animation:tb-res 1.6s ease-out forwards}
@keyframes tb-res{0%{opacity:0}6%{opacity:1}75%{opacity:1}100%{opacity:0}}
.tb-wait{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-90deg);font-size:22px;letter-spacing:.12em;
  color:#1b1b3a;opacity:0;white-space:nowrap}
.tb-root.tb-idle .tb-wait{opacity:.7}
.tb-cap{position:absolute;left:50%;transform:translateX(-50%);font-size:11px;letter-spacing:.06em;color:#fff;
  -webkit-text-stroke:3px #1b1b3a;paint-order:stroke fill;white-space:nowrap}
.tb-cap-top{bottom:calc(100% + 6px)}
.tb-cap-bot{top:calc(100% + 12px)}
@media (max-width:640px){
  .tb-root{width:34px;right:10px;height:clamp(160px,44vh,420px)}
  .tb-track{border-width:3px;border-radius:12px}
  .tb-ball{width:18px;height:18px;margin:-9px 0 0 -9px;border-width:2px}
  .tb-swing-tag{font-size:15px;line-height:18px;padding:0 7px;border-width:3px;right:calc(100% + 8px);top:-12px}
  .tb-grade{font-size:22px;line-height:28px;top:-14px}
  .tb-wait{font-size:16px}
  .tb-cap{font-size:9px}
}`;

export function createTimingBar({ parent = document.body, lead = 0.2 } = {}) {
  if (!document.getElementById('tb-style')) {
    const s = document.createElement('style');
    s.id = 'tb-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
  const el = document.createElement('div');
  el.className = 'tb-root tb-idle';
  el.innerHTML = `
    <div class="tb-track">
      <div class="tb-zone tb-z-edge"></div><div class="tb-zone tb-z-mis"></div>
      <div class="tb-zone tb-z-good"></div><div class="tb-zone tb-z-perf"></div>
      <div class="tb-fill"></div>
      <div class="tb-line"></div>
      <div class="tb-wait">WAIT</div>
    </div>
    <div class="tb-swing"><div class="tb-swing-line"></div><div class="tb-swing-tag">SWING!</div></div>
    <div class="tb-ball"></div>
    <div class="tb-res"><div class="tb-tick"></div><div class="tb-grade"></div></div>
    <div class="tb-cap tb-cap-top">BOWL</div><div class="tb-cap tb-cap-bot">BAT</div>`;
  parent.appendChild(el);
  const q = (c) => el.querySelector(c);
  const zEdge = q('.tb-z-edge'), zMis = q('.tb-z-mis'), zGood = q('.tb-z-good'), zPerf = q('.tb-z-perf');
  const fill = q('.tb-fill'), line = q('.tb-line'), ball = q('.tb-ball'), swing = q('.tb-swing');
  const res = q('.tb-res'), gradeEl = q('.tb-grade'), wait = q('.tb-wait');

  let H = 0, leadS = lead, flight = 0, total = 1, laidFor = -1, laidH = -1, pulsed = false, active = false;

  const measure = () => { H = q('.tb-track').clientHeight; };
  const timeY = (t) => (t / total) * H;
  const place = (node, y) => { node.style.transform = `translate3d(0,${y.toFixed(2)}px,0)`; };

  function zone(node, w) {
    // band centred on arrival, half-width w seconds, as scaleY on a full-height element
    const top = Math.max(0, timeY(flight - w)), bot = Math.min(H, timeY(flight + w));
    node.style.transform = `translate3d(0,${top.toFixed(2)}px,0) scaleY(${(Math.max(0, bot - top) / (H || 1)).toFixed(4)})`;
  }
  function layout() {
    measure();
    total = flight + TAIL;
    zone(zEdge, WIN.edge); zone(zMis, WIN.mis); zone(zGood, WIN.good); zone(zPerf, WIN.perfect);
    place(line, timeY(flight));
    place(swing, timeY(Math.max(0, flight - leadS)));
    laidFor = flight; laidH = H;
  }
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => { laidH = -1; }).observe(el);
  else addEventListener('resize', () => { laidH = -1; });

  const api = {
    el,
    update({ active: on, sinceRelease = 0, flightTime = 0 } = {}) {
      if (!on || !(flightTime > 0)) {
        if (active) { active = false; el.classList.add('tb-idle'); }
        return;
      }
      if (!active) {
        active = true; pulsed = false;
        el.classList.remove('tb-idle');
        swing.classList.remove('tb-pulse', 'tb-near');
      }
      if (flightTime !== laidFor || H === 0 || laidH !== el.firstElementChild.clientHeight) { flight = flightTime; layout(); }
      const t = Math.min(Math.max(sinceRelease, 0), total);
      const y = timeY(t);
      place(ball, y);
      fill.style.transform = `scaleY(${(y / (H || 1)).toFixed(4)})`;
      const d = Math.abs(t - flight); // glow when close to contact
      el.style.setProperty('--glow', Math.max(0, 1 - d / 0.3).toFixed(2));
      const sw = flight - leadS;
      const near = t > sw - 0.25 && t < sw;
      if (near !== swing.classList.contains('tb-near')) swing.classList.toggle('tb-near', near);
      if (!pulsed && t >= sw) {
        pulsed = true;
        swing.classList.remove('tb-near', 'tb-pulse');
        void swing.offsetWidth;
        swing.classList.add('tb-pulse');
      }
    },
    result(err, grade) {
      if (laidFor < 0) { flight = flight || 0.8; layout(); }
      const c = COLORS[grade] || '#fff';
      res.style.setProperty('--c', c);
      gradeEl.textContent = grade;
      place(res, Math.min(H, Math.max(0, timeY(flight + err))));
      res.classList.remove('tb-show');
      void res.offsetWidth;
      res.classList.add('tb-show');
    },
    reset() {
      active = false; pulsed = false;
      el.classList.add('tb-idle');
      swing.classList.remove('tb-pulse', 'tb-near');
      res.classList.remove('tb-show');
      el.style.setProperty('--glow', '0');
      place(ball, 0); fill.style.transform = 'scaleY(0)';
    },
    setVisible(on) { el.classList.toggle('tb-hidden', !on); if (on) laidH = -1; },
    setLead(s) { leadS = s; laidFor = -1; },
  };
  flight = 0.8; layout(); api.reset();
  return api;
}
