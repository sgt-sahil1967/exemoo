// Moo Bowl hand-cam: a small mirrored webcam panel (bottom right) with the tracked bowling arm, the hand
// trail, the swing state and a short flash label on a throw. Plain ES module, DOM only.
//
//   const hc = createHandcam();
//   hc.update(pose, camThrow, hand);   // every pose (camThrow = the CamThrow from throwdetect.js)
//   hc.draw();                          // every animation frame
//   hc.setVisible(bool);  hc.flash('STRIKE LINE', '#ffd21f');
//
// The video is the shell's <video id="camVideo"> read through window.parent (same origin). When it cannot
// be reached the panel shows the skeleton alone on a dark background.

const INK = '#1b1b3a', YELLOW = '#ffd21f', RED = '#ff3b30', GREEN = '#2fc65a', BLUE = '#2f7cff';
const MIN_VIS = 0.35, STALE_MS = 500, FLASH_MS = 1100;

const CSS = `
.bhc-root{position:fixed;right:16px;bottom:16px;width:230px;z-index:6;pointer-events:none;background:${INK};
  border:4px solid ${INK};border-radius:16px;box-shadow:0 5px 0 ${INK};overflow:hidden;font-family:'Baloo 2',system-ui,sans-serif}
.bhc-root.bhc-hidden{display:none}
.bhc-head{display:flex;align-items:center;gap:6px;height:22px;padding:0 9px;background:#fff;color:${INK};
  font:800 11px/22px 'Baloo 2',system-ui,sans-serif;letter-spacing:.08em;border-bottom:3px solid ${INK}}
.bhc-dot{width:9px;height:9px;border-radius:50%;background:#c9c9d6;border:2px solid ${INK};box-sizing:border-box}
.bhc-on .bhc-dot{background:${GREEN};box-shadow:0 0 6px ${GREEN}}
.bhc-state{margin-left:auto;padding:0 7px;border-radius:8px;background:${INK};color:#fff;font-size:10px;line-height:15px}
.bhc-body{position:relative;width:100%;aspect-ratio:4/3;background:#14142b}
.bhc-cv{position:absolute;inset:0;width:100%;height:100%;display:block}
.bhc-msg{position:absolute;left:0;right:0;bottom:8px;text-align:center;font:400 21px 'Lilita One','Baloo 2',sans-serif;color:${YELLOW};
  -webkit-text-stroke:4px ${INK};paint-order:stroke fill;text-shadow:0 3px 0 ${INK};opacity:0;white-space:nowrap}
@media (max-width:800px),(max-height:560px){.bhc-root{width:150px;right:10px;bottom:10px}.bhc-msg{font-size:15px;-webkit-text-stroke:3px ${INK}}}
`;

const STATES = {
  lost: ['STEP INTO VIEW', '#8a8aa8'], wait: ['HAND DOWN', BLUE], ready: ['READY', GREEN], back: ['BACK', YELLOW], swing: ['SWING', RED],
};

export function createHandcam({ parent = document.body } = {}) {
  if (!document.getElementById('bhc-style')) {
    const st = document.createElement('style');
    st.id = 'bhc-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }
  const el = document.createElement('div');
  el.className = 'bhc-root bhc-hidden';
  el.innerHTML = '<div class="bhc-head"><i class="bhc-dot"></i><span>HAND CAM</span><span class="bhc-state"></span></div>' +
    '<div class="bhc-body"><canvas class="bhc-cv"></canvas><div class="bhc-msg"></div></div>';
  parent.appendChild(el);
  const body = el.querySelector('.bhc-body'), cv = el.querySelector('.bhc-cv'), msg = el.querySelector('.bhc-msg'), stateEl = el.querySelector('.bhc-state');
  const ctx = cv.getContext('2d');

  let pose = null, cam = null, hand = 'right', poseRx = -Infinity;
  let visible = false, flashAt = -Infinity, cw = 0, ch = 0, dpr = 1, wasOn = null, lastState = '';

  function getVideo() {
    try {
      const v = window.parent && window.parent !== window && window.parent.document.getElementById('camVideo');
      return v && v.readyState >= 2 && v.videoWidth > 0 ? v : null;
    } catch {
      return null; // cross-origin or no shell
    }
  }

  function resize() {
    const r = body.getBoundingClientRect();
    const d = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (w === cw && h === ch && d === dpr) return;
    cw = w; ch = h; dpr = d;
    cv.width = Math.round(w * d);
    cv.height = Math.round(h * d);
  }

  const line = (pts, w, col, alpha = 1) => {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  const dot = (p, r, fill) => {
    ctx.fillStyle = fill; ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  };

  function draw() {
    if (!visible) return;
    resize();
    const now = performance.now();
    const fresh = !!pose && now - poseRx <= STALE_MS;
    const tracked = fresh && !!cam && cam.live.tracked;
    if (tracked !== wasOn) { el.classList.toggle('bhc-on', tracked); wasOn = tracked; }
    const st = tracked ? cam.live.state : 'lost';
    if (st !== lastState) {
      lastState = st;
      const [label, col] = STATES[st] || STATES.lost;
      stateEl.textContent = label;
      stateEl.style.background = col;
      stateEl.style.color = col === YELLOW ? INK : '#fff';
    }

    const W = cw, H = ch;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#14142b';
    ctx.fillRect(0, 0, W, H);

    const vid = getVideo();
    let va = (pose && pose.aspect) || 4 / 3;
    let box;
    if (vid) {
      va = vid.videoWidth / vid.videoHeight;
      const s = Math.max(W / va, H);
      box = { ox: (W - s * va) / 2, oy: (H - s) / 2, dw: s * va, dh: s };
      try {
        ctx.save();
        ctx.translate(box.ox + box.dw, box.oy);
        ctx.scale(-1, 1);
        ctx.drawImage(vid, 0, 0, box.dw, box.dh);
        ctx.restore();
      } catch { /* not drawable this frame */ }
      ctx.fillStyle = 'rgba(20,20,43,.2)';
      ctx.fillRect(0, 0, W, H);
    } else {
      const s = Math.min(W / va, H);
      box = { ox: (W - s * va) / 2, oy: (H - s) / 2, dw: s * va, dh: s };
    }
    const map = (nx, ny) => ({ x: box.ox + nx * box.dw, y: box.oy + ny * box.dh });
    const k = Math.max(0.6, W / 230);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    const img = fresh && pose.img;
    if (img) {
      const J = (n) => (img[n] && (img[n][2] ?? 1) >= MIN_VIS ? map(img[n][0], img[n][1]) : null);
      const j = { ls: J('ls'), rs: J('rs'), le: J('le'), re: J('re'), lw: J('lw'), rw: J('rw'), lh: J('lh'), rh: J('rh') };
      const torso = [j.ls, j.rs, j.rh, j.lh, j.ls];
      for (let i = 0; i < 4; i++) if (torso[i] && torso[i + 1]) line([torso[i], torso[i + 1]], 2 * k, '#fff', 0.5);
      // Other arm thin, bowling arm bold.
      const B = hand === 'left' ? ['ls', 'le', 'lw'] : ['rs', 're', 'rw'], O = hand === 'left' ? ['rs', 're', 'rw'] : ['ls', 'le', 'lw'];
      for (let i = 0; i < 2; i++) if (j[O[i]] && j[O[i + 1]]) line([j[O[i]], j[O[i + 1]]], 3 * k, '#fff', 0.45);
      for (let i = 0; i < 2; i++) {
        if (j[B[i]] && j[B[i + 1]]) {
          line([j[B[i]], j[B[i + 1]]], 9 * k, INK, 0.8);
          line([j[B[i]], j[B[i + 1]]], 5.5 * k, '#fff', 0.95);
        }
      }
      for (const n of [B[0], B[1]]) if (j[n]) dot(j[n], 3.5 * k, '#fff');
    }

    // Hand trail and the hand itself (the "ball").
    const trail = tracked && cam.trail;
    if (trail && trail.length > 1) {
      const t1 = trail[trail.length - 1].at, swinging = st === 'swing' || st === 'back';
      for (let i = 1; i < trail.length; i++) {
        const a = Math.max(0.1, 1 - (t1 - trail[i].at) / 700);
        const p0 = map(trail[i - 1].x, trail[i - 1].y), p1 = map(trail[i].x, trail[i].y);
        if (swinging) line([p0, p1], 7 * k, INK, a);
        line([p0, p1], (swinging ? 4 : 2.5) * k, st === 'swing' ? RED : YELLOW, Math.min(1, a + 0.15));
      }
      const h = trail[trail.length - 1], p = map(h.x, h.y);
      ctx.save();
      ctx.shadowColor = YELLOW; ctx.shadowBlur = 12;
      dot(p, 9 * k, st === 'wait' ? '#c9c9d6' : st === 'swing' ? RED : YELLOW);
      ctx.restore();
    }

    if (!tracked) {
      ctx.fillStyle = 'rgba(20,20,43,.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = `400 ${Math.round(17 * Math.max(0.7, k))}px 'Lilita One', 'Baloo 2', sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.fillStyle = '#fff';
      ctx.strokeText('Step into view', W / 2, H / 2);
      ctx.fillText('Step into view', W / 2, H / 2);
    }

    const fa = 1 - (now - flashAt) / FLASH_MS;
    const op = fa > 0 ? String(Math.min(1, fa * 1.6).toFixed(2)) : '0';
    if (msg.style.opacity !== op) msg.style.opacity = op;
  }

  return {
    el,
    update(p, c, h) { pose = p || null; cam = c || null; if (h) hand = h; poseRx = performance.now(); },
    draw,
    setVisible(on) { visible = !!on; el.classList.toggle('bhc-hidden', !visible); },
    flash(text, colour = YELLOW) { flashAt = performance.now(); msg.textContent = String(text); msg.style.color = colour; msg.style.opacity = '1'; },
  };
}
