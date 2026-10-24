// Hand-tracking overlay for Exemoo Cricket: a small mirrored webcam panel with the tracked arms, hands,
// hand trail and swing arrow drawn on top. Plain ES module, no dependencies, no network.
//
//   const hc = createHandOverlay({ parent: document.body });
//   hc.update(pose, swingDetector);  // every pose (~30 fps)
//   hc.draw();                       // every animation frame
//   hc.setVisible(false);            // hide / show
//   hc.flash('PERFECT', '#ffd21f');  // brief label, fades in ~1 s

const INK = '#1b1b3a', YELLOW = '#ffd21f';
const MIN_VIS = 0.35;
const STALE_MS = 500;
const TRAIL_MS = 600;
const FLASH_MS = 1000;

const CSS = `
.hc-root{position:fixed;right:16px;bottom:96px;width:260px;z-index:2;pointer-events:none;background:${INK};
  border:4px solid ${INK};border-radius:14px;box-shadow:0 5px 0 ${INK};overflow:hidden;font-family:'Baloo 2',system-ui,sans-serif}
.hc-root.hc-hidden{display:none}
.hc-head{display:flex;align-items:center;gap:6px;height:20px;padding:0 8px;background:#fff;color:${INK};
  font:800 11px/20px 'Baloo 2',system-ui,sans-serif;letter-spacing:.08em;border-bottom:3px solid ${INK}}
.hc-dot{width:9px;height:9px;border-radius:50%;background:#c9c9d6;border:2px solid ${INK};box-sizing:border-box}
.hc-on .hc-dot{background:#2ecc71;box-shadow:0 0 6px #2ecc71}
.hc-body{position:relative;width:100%;aspect-ratio:4/3;background:#14142b}
.hc-cv{position:absolute;inset:0;width:100%;height:100%;display:block}
.hc-msg{position:absolute;left:0;right:0;bottom:8px;text-align:center;font:400 22px 'Lilita One','Baloo 2',sans-serif;color:${YELLOW};
  -webkit-text-stroke:4px ${INK};paint-order:stroke fill;text-shadow:0 3px 0 ${INK};opacity:0;transition:opacity .25s;white-space:nowrap}
@media (max-width:700px){.hc-root{width:150px;right:10px}.hc-head{height:16px;font-size:9px;line-height:16px}.hc-msg{font-size:15px;-webkit-text-stroke:3px ${INK}}}
`;

export function createHandOverlay({ parent = document.body } = {}) {
  if (!document.getElementById('hc-style')) {
    const st = document.createElement('style');
    st.id = 'hc-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }
  const el = document.createElement('div');
  el.className = 'hc-root';
  el.innerHTML = '<div class="hc-head"><i class="hc-dot"></i><span>CAMERA</span></div>' +
    '<div class="hc-body"><canvas class="hc-cv"></canvas><div class="hc-msg"></div></div>';
  parent.appendChild(el);
  const body = el.querySelector('.hc-body');
  const cv = el.querySelector('.hc-cv');
  const msg = el.querySelector('.hc-msg');
  const ctx = cv.getContext('2d');

  let pose = null, det = null, poseRx = -Infinity; // poseRx: performance.now() when last pose arrived
  let visible = true;
  let flashText = '', flashColour = YELLOW, flashAt = -Infinity;
  let cw = 0, ch = 0, dpr = 1, wasOn = null;

  function getVideo() {
    try {
      const v = window.parent && window.parent.document.getElementById('camVideo');
      return v && v.readyState >= 2 && v.videoWidth > 0 ? v : null;
    } catch { return null; }
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
  const dot = (p, r, fill, stroke = INK) => {
    ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  };
  const ring = (p, r, lw, glow) => {
    ctx.save();
    ctx.shadowColor = YELLOW; ctx.shadowBlur = glow;
    ctx.strokeStyle = YELLOW; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  };

  function draw() {
    if (!visible) return;
    resize();
    const now = performance.now();
    const fresh = !!pose && now - poseRx <= STALE_MS;
    const on = fresh && !!pose.visible;
    if (on !== wasOn) { el.classList.toggle('hc-on', on); wasOn = on; }

    const W = cw, H = ch;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#14142b';
    ctx.fillRect(0, 0, W, H);

    // Mirrored, cover-fitted video.
    const vid = getVideo();
    let va = (pose && pose.aspect) || 4 / 3;
    let box = { ox: 0, oy: 0, dw: W, dh: H };
    if (vid) {
      va = vid.videoWidth / vid.videoHeight;
      const s = Math.max(W / va, H);
      const dw = s * va, dh = s;
      box = { ox: (W - dw) / 2, oy: (H - dh) / 2, dw, dh };
      try {
        ctx.save();
        ctx.translate(box.ox + dw, box.oy);
        ctx.scale(-1, 1);
        ctx.drawImage(vid, 0, 0, dw, dh);
        ctx.restore();
      } catch { /* video not drawable this frame */ }
      ctx.fillStyle = 'rgba(20,20,43,.18)';
      ctx.fillRect(0, 0, W, H);
    } else {
      // No video: fit the frame area inside the panel so the figure keeps its proportions.
      const s = Math.min(W / va, H);
      box = { ox: (W - s * va) / 2, oy: (H - s) / 2, dw: s * va, dh: s };
    }
    const map = (nx, ny) => ({ x: box.ox + nx * box.dw, y: box.oy + ny * box.dh });
    const k = Math.max(0.6, W / 260); // line-width scale
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    const img = fresh && pose.img;
    if (img) {
      const J = (n) => {
        const a = img[n];
        return a && (a[2] ?? 1) >= MIN_VIS ? map(a[0], a[1]) : null;
      };
      const j = { ls: J('ls'), rs: J('rs'), le: J('le'), re: J('re'), lw: J('lw'), rw: J('rw'), lh: J('lh'), rh: J('rh') };

      // Torso outline.
      const torso = [j.ls, j.rs, j.rh, j.lh, j.ls];
      for (let i = 0; i < 4; i++) {
        if (torso[i] && torso[i + 1]) {
          line([torso[i], torso[i + 1]], 3 * k, INK, 0.5);
          line([torso[i], torso[i + 1]], 1.6 * k, '#fff', 0.55);
        }
      }
      // Arms.
      for (const [s, e, w] of [['ls', 'le', 'lw'], ['rs', 're', 'rw']]) {
        const pts = [j[s], j[e], j[w]];
        for (let i = 0; i < 2; i++) {
          if (pts[i] && pts[i + 1]) {
            line([pts[i], pts[i + 1]], 9 * k, INK, 0.7);
            line([pts[i], pts[i + 1]], 5.5 * k, '#fff', 0.85);
          }
        }
      }
      for (const n of ['ls', 'rs', 'le', 're']) if (j[n]) dot(j[n], 3.5 * k, '#fff');
      for (const n of ['lh', 'rh']) if (j[n]) dot(j[n], 2.5 * k, '#e8e8f4');

      // Hands.
      const wr = [j.lw, j.rw].filter(Boolean);
      for (const w of wr) { ring(w, 8 * k, 3 * k, 10); }
      if (wr.length === 2) {
        const m = { x: (wr[0].x + wr[1].x) / 2, y: (wr[0].y + wr[1].y) / 2 };
        ring(m, 13 * k, 3.5 * k, 16);
        dot(m, 2.5 * k, YELLOW);
      }
    }

    // Trail + swing arrow.
    const track = fresh && det && det.track;
    const swinging = !!det && det.state === 'swing';
    if (track && track.length > 1) {
      const t1 = track[track.length - 1].at;
      const useAsp = pose.aspect || va;
      const P = track.filter((s) => t1 - s.at <= TRAIL_MS).map((s) => ({ p: map(s.x / useAsp, s.y), a: 1 - (t1 - s.at) / TRAIL_MS }));
      for (let i = 1; i < P.length; i++) {
        const a = Math.max(0.12, (P[i].a + P[i - 1].a) / 2);
        if (swinging) {
          line([P[i - 1].p, P[i].p], 7 * k, INK, a);
          line([P[i - 1].p, P[i].p], 4 * k, YELLOW, Math.min(1, a + 0.2));
        } else {
          line([P[i - 1].p, P[i].p], 3 * k, '#fff', a * 0.6);
        }
      }
    }
    if (swinging && det.swing && det.swing.start && det.swing.best && pose && fresh) {
      const asp = pose.aspect || va;
      const sw = det.swing;
      const a = map(sw.start.x / asp, sw.start.y), b = map(sw.best.x / asp, sw.best.y);
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      if (len > 3) {
        const ang = Math.atan2(b.y - a.y, b.x - a.x), hs = 9 * k;
        line([a, b], 7 * k, INK);
        line([a, b], 3.5 * k, YELLOW);
        const head = [
          { x: b.x - hs * Math.cos(ang - 0.5), y: b.y - hs * Math.sin(ang - 0.5) }, b,
          { x: b.x - hs * Math.cos(ang + 0.5), y: b.y - hs * Math.sin(ang + 0.5) },
        ];
        line(head, 7 * k, INK);
        line(head, 3.5 * k, YELLOW);
      }
      // Label.
      const dir = sw.direction || 0;
      const name = Math.abs(dir) < 0.35 ? 'STRAIGHT' : dir > 0 ? 'OFF' : 'LEG';
      const arrow = name === 'STRAIGHT' ? '↑' : dir > 0 ? '→' : '←';
      const txt = `${arrow} ${name}${(sw.lift || 0) > 0.5 ? ' LOFT' : ''}  power ${Math.round(clamp01(sw.power) * 100)}%`;
      ctx.font = `800 ${Math.round(11 * Math.max(0.85, k))}px 'Baloo 2', system-ui, sans-serif`;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const tw = ctx.measureText(txt).width + 12, th = 18 * Math.max(0.85, k);
      const lx = Math.min(Math.max(4, (a.x + b.x) / 2 - tw / 2), W - tw - 4);
      const ly = Math.min(Math.max(4, Math.min(a.y, b.y) - th - 6), H - th - 4);
      ctx.fillStyle = '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.roundRect(lx, ly, tw, th, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = INK;
      ctx.fillText(txt, lx + 6, ly + th / 2 + 0.5);
    }

    // No pose.
    if (!fresh || !pose.visible) {
      ctx.fillStyle = 'rgba(20,20,43,.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = `400 ${Math.round(18 * Math.max(0.7, k))}px 'Lilita One', 'Baloo 2', sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.fillStyle = '#fff';
      ctx.strokeText('Step into view', W / 2, H / 2);
      ctx.fillText('Step into view', W / 2, H / 2);
    }

    // Flash label fades over ~1 s.
    const fa = 1 - (now - flashAt) / FLASH_MS;
    if (fa > 0) {
      msg.textContent = flashText; msg.style.color = flashColour; msg.style.opacity = String(Math.min(1, fa * 1.5));
    } else if (msg.style.opacity !== '0') {
      msg.style.opacity = '0';
    }
  }

  const clamp01 = (v) => Math.max(0, Math.min(1, v || 0));

  return {
    el,
    update(p, d) { pose = p || null; det = d || null; poseRx = performance.now(); },
    draw,
    setVisible(on) { visible = !!on; el.classList.toggle('hc-hidden', !visible); },
    flash(text, colour = YELLOW) { flashText = String(text); flashColour = colour; flashAt = performance.now(); msg.style.transition = 'none'; msg.textContent = flashText; msg.style.color = colour; msg.style.opacity = '1'; },
  };
}
