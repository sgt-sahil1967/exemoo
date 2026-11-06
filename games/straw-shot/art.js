// Shared cartoon drawing helpers for the Exemoo party minigames (Canvas 2D).
// "Moo Moo Farm" look: flat bright fills, chunky ink outlines, soft glossy highlights.
// Copied unchanged from the party kit in games/shake-freeze.

export const INK = '#1b1b3a';
export const RED = '#ff3b30';
export const YELLOW = '#ffd21f';
export const BLUE = '#2f7cff';
export const GREEN = '#2fc65a';

export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => t * t * (3 - 2 * t);
export const rand = (a = 0, b = 1) => a + Math.random() * (b - a);

/** Rounded rectangle path. */
export function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Fill the current path, then stroke it with the ink outline. */
export function inked(ctx, fill, lw = 4) {
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (lw > 0) {
    ctx.lineWidth = lw;
    ctx.strokeStyle = INK;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

export function circle(ctx, x, y, r, fill, lw = 4) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.1, r), 0, TAU);
  inked(ctx, fill, lw);
}

export function ellipse(ctx, x, y, rx, ry, rot, fill, lw = 4) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU);
  inked(ctx, fill, lw);
}

/** A thick ink-outlined stroke (limbs, handles). */
export function limb(ctx, x1, y1, x2, y2, color, w) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK;
  ctx.lineWidth = w + 7;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.stroke();
}

/** Soft white glossy highlight (top-left sheen). */
export function gloss(ctx, x, y, rx, ry, a = 0.45) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), -0.5, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** Ground shadow ellipse. */
export function shadow(ctx, x, y, rx, ry = rx * 0.22, a = 0.22) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** Big outlined display text (Lilita One, white fill, ink stroke, hard drop). */
export function label(ctx, text, x, y, size, { fill = '#fff', align = 'center', base = 'middle', stroke = INK, drop = true, font = 'Lilita One' } = {}) {
  ctx.save();
  ctx.font = `${size}px '${font}', 'Baloo 2', system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  ctx.lineJoin = 'round';
  if (drop) {
    ctx.fillStyle = stroke;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = Math.max(3, size * 0.2);
    ctx.strokeText(text, x, y + size * 0.09);
    ctx.fillText(text, x, y + size * 0.09);
  }
  ctx.strokeStyle = stroke;
  ctx.lineWidth = Math.max(3, size * 0.2);
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** Four-point sparkle. */
export function sparkle(ctx, x, y, s, fill = '#fff') {
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.lineTo(x + s * 0.3, y - s * 0.3);
  ctx.lineTo(x + s, y);
  ctx.lineTo(x + s * 0.3, y + s * 0.3);
  ctx.lineTo(x, y + s);
  ctx.lineTo(x - s * 0.3, y + s * 0.3);
  ctx.lineTo(x - s, y);
  ctx.lineTo(x - s * 0.3, y - s * 0.3);
  ctx.closePath();
  inked(ctx, fill, Math.max(1.5, s * 0.12));
}

/** Puffy cloud. */
export function cloud(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#d6eeff';
  ctx.beginPath();
  ctx.ellipse(0, 5, 36, 14, 0, 0, TAU);
  ctx.arc(-12, -3, 14, 0, TAU);
  ctx.arc(13, -5, 17, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(0, 0, 36, 14, 0, 0, TAU);
  ctx.arc(-12, -8, 14, 0, TAU);
  ctx.arc(13, -10, 17, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** Sky gradient + checker grass, the shared Exemoo backdrop. */
export function farmBackdrop(ctx, w, h, horizon, { top = '#5ec2ff', bottom = '#bfe8ff', t = 0, grassA = '#62d23c', grassB = '#55c232' } = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, horizon);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, horizon + 2);
  // sun
  const sx = w * 0.86, sy = horizon * 0.28;
  const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, horizon * 0.45);
  sg.addColorStop(0, 'rgba(255,248,196,1)');
  sg.addColorStop(0.4, 'rgba(255,224,102,.5)');
  sg.addColorStop(1, 'rgba(255,224,102,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, w, horizon);
  for (let i = 0; i < 4; i++) {
    const cx = ((i * 0.31 + t * 0.006 * (1 + i * 0.2)) % 1.2) * w * 1.1 - w * 0.08;
    cloud(ctx, cx, horizon * (0.18 + 0.14 * (i % 2)), (0.9 + (i % 3) * 0.3) * Math.max(0.7, w / 1400));
  }
  // far hills
  ctx.fillStyle = '#8fe86a';
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  for (let x = 0; x <= w; x += w / 12) ctx.lineTo(x, horizon - 18 - Math.sin(x * 0.006 + 1) * 14 - Math.sin(x * 0.017) * 6);
  ctx.lineTo(w, horizon);
  ctx.closePath();
  ctx.fill();
  // checker grass
  const cs = Math.max(28, Math.round(w / 28));
  ctx.fillStyle = grassA;
  ctx.fillRect(0, horizon, w, h - horizon);
  ctx.fillStyle = grassB;
  for (let y = horizon, row = 0; y < h; y += cs, row++) {
    for (let x = (row % 2) * cs; x < w; x += cs * 2) ctx.fillRect(x, y, cs, cs);
  }
  const gs = ctx.createLinearGradient(0, horizon, 0, h);
  gs.addColorStop(0, 'rgba(255,255,255,0)');
  gs.addColorStop(1, 'rgba(27,94,18,.3)');
  ctx.fillStyle = gs;
  ctx.fillRect(0, horizon, w, h - horizon);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(w, horizon);
  ctx.stroke();
}

// ───────────────────────────── characters ─────────────────────────────
const ANIMALS = {
  cow: { body: '#ffffff', belly: '#ffd9e0', head: '#ffffff', ear: '#ffffff', inner: '#ffa8b8', limb: '#ffffff', hoof: '#3a3350' },
  pig: { body: '#ffb3c4', belly: '#ffd1dc', head: '#ffb3c4', ear: '#ff9db3', inner: '#ff7f9c', limb: '#ffb3c4', hoof: '#c45a78' },
  sheep: { body: '#fbfbff', belly: '#eef0ff', head: '#4a4560', ear: '#4a4560', inner: '#ff9db3', limb: '#4a4560', hoof: '#2a2540' },
  chick: { body: '#ffe45c', belly: '#fff3a8', head: '#ffe45c', ear: '#ffe45c', inner: '#ffb000', limb: '#ff9a1f', hoof: '#ff9a1f' },
};
export const ANIMAL_NAMES = { cow: 'Cow', pig: 'Pig', sheep: 'Sheep', chick: 'Chick' };

/**
 * Draw a cartoon farm animal standing with its feet at (x, y), `s` = overall height in px.
 * o = { color (scarf), mood: 'happy'|'sad'|'shock'|'effort'|'cheer', blink: 0..1, hands: [{x,y},{x,y}] world px,
 *       squash: 0..0.3, lean: radians, bob: px, flip: bool }
 * Returns { head, shoulders: [l, r], hands: [l, r] } in canvas px so games can attach props.
 */
export function drawAnimal(ctx, kind, x, y, s, o = {}) {
  const a = ANIMALS[kind] || ANIMALS.cow;
  const u = s / 100; // unit: 100 units tall
  const lw = Math.max(2.5, 4.2 * u);
  const squash = o.squash || 0;
  const lean = o.lean || 0;
  const bob = o.bob || 0;
  const mood = o.mood || 'happy';
  ctx.save();
  ctx.translate(x, y);
  shadow(ctx, 0, 0, 30 * u, 7 * u);
  ctx.translate(0, -bob);
  ctx.rotate(lean);
  ctx.scale(1 + squash * 0.5, 1 - squash);
  // legs
  for (const sx of [-1, 1]) {
    rr(ctx, sx * 13 * u - 7 * u, -22 * u, 14 * u, 22 * u, 6 * u);
    inked(ctx, a.limb, lw);
    rr(ctx, sx * 13 * u - 8 * u, -7 * u, 16 * u, 8 * u, 4 * u);
    inked(ctx, a.hoof, lw * 0.8);
  }
  // body
  const bodyY = -42 * u;
  if (kind === 'sheep') {
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * TAU;
      ctx.moveTo(Math.cos(ang) * 27 * u + 9 * u, bodyY + Math.sin(ang) * 24 * u);
      ctx.arc(Math.cos(ang) * 27 * u, bodyY + Math.sin(ang) * 24 * u, 9 * u, 0, TAU);
    }
    inked(ctx, a.body, lw);
    ellipse(ctx, 0, bodyY, 28 * u, 25 * u, 0, a.body, 0);
  } else {
    ellipse(ctx, 0, bodyY, 28 * u, 26 * u, 0, a.body, lw);
    ellipse(ctx, 0, bodyY + 6 * u, 17 * u, 15 * u, 0, a.belly, 0);
    if (kind === 'cow') {
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(-15 * u, bodyY - 8 * u, 8 * u, 6 * u, 0.4, 0, TAU);
      ctx.ellipse(17 * u, bodyY + 6 * u, 6 * u, 8 * u, -0.3, 0, TAU);
      ctx.fill();
    }
  }
  gloss(ctx, -12 * u, bodyY - 12 * u, 8 * u, 5 * u, 0.4);
  // arms (computed in local space from hands in world space)
  const shoulders = [{ x: -22 * u, y: bodyY - 8 * u }, { x: 22 * u, y: bodyY - 8 * u }];
  const inv = (p) => {
    // world -> local (undo translate, bob, rotate, scale)
    let px = p.x - x, py = p.y - y + bob;
    const c = Math.cos(-lean), sn = Math.sin(-lean);
    const rx = px * c - py * sn, ry = px * sn + py * c;
    return { x: rx / (1 + squash * 0.5), y: ry / (1 - squash) };
  };
  const hands = (o.hands || [null, null]).map((h, i) => (h ? inv(h) : { x: shoulders[i].x * 1.45, y: bodyY + 14 * u }));
  for (let i = 0; i < 2; i++) {
    const sh = shoulders[i], hd = hands[i];
    limb(ctx, sh.x, sh.y, hd.x, hd.y, kind === 'chick' ? a.body : a.limb, 9 * u);
    circle(ctx, hd.x, hd.y, 6.5 * u, kind === 'chick' ? a.body : a.hoof === '#3a3350' ? '#ffffff' : a.limb, lw * 0.8);
  }
  // scarf in the player colour
  if (o.color) {
    rr(ctx, -20 * u, bodyY - 26 * u, 40 * u, 10 * u, 5 * u);
    inked(ctx, o.color, lw * 0.9);
    ctx.beginPath();
    ctx.moveTo(8 * u, bodyY - 18 * u);
    ctx.lineTo(18 * u, bodyY - 2 * u);
    ctx.lineTo(9 * u, bodyY - 4 * u);
    ctx.closePath();
    inked(ctx, o.color, lw * 0.8);
  }
  // head
  const hy = bodyY - 44 * u;
  drawHead(ctx, kind, a, 0, hy, u, lw, mood, o.blink || 0);
  ctx.restore();
  // map local points back to world for the caller
  const fwd = (p) => {
    const sx = p.x * (1 + squash * 0.5), sy = p.y * (1 - squash);
    const c = Math.cos(lean), sn = Math.sin(lean);
    return { x: x + sx * c - sy * sn, y: y - bob + sx * sn + sy * c };
  };
  return { head: fwd({ x: 0, y: hy }), shoulders: shoulders.map(fwd), hands: hands.map(fwd), top: fwd({ x: 0, y: hy - 30 * u }) };
}

function drawHead(ctx, kind, a, x, y, u, lw, mood, blink) {
  // ears
  if (kind === 'cow') {
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(sx * 18 * u, y - 22 * u);
      ctx.lineTo(sx * 13 * u, y - 36 * u);
      ctx.lineTo(sx * 8 * u, y - 23 * u);
      ctx.closePath();
      inked(ctx, '#f3e3b5', lw * 0.8);
      ellipse(ctx, sx * 30 * u, y - 10 * u, 11 * u, 6 * u, sx * 0.35, a.ear, lw * 0.8);
      ellipse(ctx, sx * 30 * u, y - 10 * u, 6 * u, 3 * u, sx * 0.35, a.inner, 0);
    }
  } else if (kind === 'pig') {
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(sx * 10 * u, y - 20 * u);
      ctx.lineTo(sx * 26 * u, y - 32 * u);
      ctx.lineTo(sx * 24 * u, y - 12 * u);
      ctx.closePath();
      inked(ctx, a.ear, lw * 0.8);
    }
  } else if (kind === 'sheep') {
    for (const sx of [-1, 1]) ellipse(ctx, sx * 26 * u, y - 4 * u, 10 * u, 5 * u, sx * 0.4, a.ear, lw * 0.8);
  }
  // head shape
  if (kind === 'sheep') {
    ellipse(ctx, x, y, 19 * u, 23 * u, 0, a.head, lw);
    // wool tuft
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const px = x + (i - 2) * 8 * u, py = y - 20 * u - (i % 2) * 4 * u;
      ctx.moveTo(px + 8 * u, py);
      ctx.arc(px, py, 8 * u, 0, TAU);
    }
    inked(ctx, '#fbfbff', lw * 0.8);
  } else if (kind === 'chick') {
    circle(ctx, x, y, 24 * u, a.head, lw);
    // tuft
    ctx.beginPath();
    ctx.moveTo(x - 3 * u, y - 22 * u);
    ctx.quadraticCurveTo(x - 6 * u, y - 36 * u, x + 2 * u, y - 34 * u);
    ctx.quadraticCurveTo(x + 2 * u, y - 28 * u, x + 4 * u, y - 23 * u);
    inked(ctx, a.head, lw * 0.8);
  } else {
    ellipse(ctx, x, y, 25 * u, 23 * u, 0, a.head, lw);
    if (kind === 'cow') {
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(x - 12 * u, y - 12 * u, 7 * u, 5 * u, -0.5, 0, TAU);
      ctx.fill();
    }
  }
  gloss(ctx, x - 9 * u, y - 11 * u, 6 * u, 4 * u, 0.5);
  // eyes
  const ey = y - 3 * u;
  const eo = kind === 'sheep' ? 8 * u : 10 * u;
  for (const sx of [-1, 1]) {
    const ex = x + sx * eo;
    if (mood === 'effort') {
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw * 0.8;
      ctx.beginPath();
      ctx.moveTo(ex - sx * 4 * u, ey - 4 * u);
      ctx.lineTo(ex + sx * 3 * u, ey);
      ctx.lineTo(ex - sx * 4 * u, ey + 4 * u);
      ctx.stroke();
    } else if (blink > 0.5 || mood === 'cheer') {
      ctx.strokeStyle = kind === 'sheep' ? '#fff' : INK;
      ctx.lineWidth = lw * 0.8;
      ctx.beginPath();
      if (mood === 'cheer') ctx.arc(ex, ey + 2 * u, 4.5 * u, Math.PI * 1.1, Math.PI * 1.9);
      else {
        ctx.moveTo(ex - 4 * u, ey);
        ctx.lineTo(ex + 4 * u, ey);
      }
      ctx.stroke();
    } else {
      const big = mood === 'shock' ? 1.25 : 1;
      ellipse(ctx, ex, ey, 5.5 * u * big, 7 * u * big, 0, '#fff', lw * 0.6);
      circle(ctx, ex + sx * 0.8 * u, ey + 1 * u, 3.4 * u, INK, 0);
      circle(ctx, ex + sx * 0.8 * u + 1.2 * u, ey - 0.6 * u, 1.2 * u, '#fff', 0);
    }
  }
  if (mood === 'sad') {
    ctx.strokeStyle = kind === 'sheep' ? '#fff' : INK;
    ctx.lineWidth = lw * 0.7;
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + sx * (eo + 6 * u), ey - 11 * u);
      ctx.lineTo(x + sx * (eo - 4 * u), ey - 8 * u);
      ctx.stroke();
    }
    ellipse(ctx, x + 15 * u, ey + 9 * u, 2.5 * u, 4 * u, 0, '#7fd3ff', lw * 0.4);
  }
  // muzzle / snout / beak + mouth
  const my = y + 11 * u;
  if (kind === 'cow') {
    ellipse(ctx, x, my, 17 * u, 10 * u, 0, a.inner, lw);
    circle(ctx, x - 6 * u, my - 1 * u, 2.2 * u, INK, 0);
    circle(ctx, x + 6 * u, my - 1 * u, 2.2 * u, INK, 0);
  } else if (kind === 'pig') {
    ellipse(ctx, x, my - 2 * u, 11 * u, 8 * u, 0, a.inner, lw);
    ellipse(ctx, x - 4 * u, my - 2 * u, 1.8 * u, 3 * u, 0, INK, 0);
    ellipse(ctx, x + 4 * u, my - 2 * u, 1.8 * u, 3 * u, 0, INK, 0);
  } else if (kind === 'chick') {
    ctx.beginPath();
    ctx.moveTo(x - 7 * u, my - 5 * u);
    ctx.lineTo(x + 7 * u, my - 5 * u);
    ctx.lineTo(x, my + (mood === 'shock' || mood === 'cheer' ? 9 : 4) * u);
    ctx.closePath();
    inked(ctx, '#ff9a1f', lw * 0.8);
  }
  if (kind !== 'chick') {
    const mx = x, mY = kind === 'cow' ? my + 13 * u : my + 9 * u;
    ctx.strokeStyle = kind === 'sheep' ? '#fff' : INK;
    ctx.lineWidth = lw * 0.75;
    ctx.beginPath();
    if (mood === 'shock') {
      ctx.ellipse(mx, mY, 3.5 * u, 4.5 * u, 0, 0, TAU);
      ctx.fillStyle = INK;
      ctx.fill();
      ctx.stroke();
    } else if (mood === 'sad') {
      ctx.arc(mx, mY + 4 * u, 5 * u, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    } else if (mood === 'effort') {
      ctx.moveTo(mx - 6 * u, mY);
      ctx.lineTo(mx + 6 * u, mY);
      ctx.stroke();
    } else {
      ctx.arc(mx, mY - 3 * u, mood === 'cheer' ? 7 * u : 5 * u, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
  }
  // cheeks
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = '#ff6f8a';
  for (const sx of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(x + sx * 17 * u, y + 5 * u, 4 * u, 2.6 * u, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** Small portrait of an animal into its own canvas (lobby / results cards). */
export function portrait(canvas, kind, color, mood = 'happy') {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth || 96, h = canvas.clientHeight || 96;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  drawAnimal(ctx, kind, w / 2, h * 1.55, h * 1.2, { color, mood });
}

// ───────────────────────────── particles ─────────────────────────────
/** Simple pooled particles: confetti, droplets, crumbs, puffs. */
export class Particles {
  constructor() {
    this.list = [];
  }
  burst(x, y, n, { colors = [RED, YELLOW, BLUE, GREEN, '#fff'], speed = 300, up = 200, size = 7, life = 1.2, gravity = 700, shape = 'confetti', spread = TAU, dir = -Math.PI / 2 } = {}) {
    for (let i = 0; i < n; i++) {
      if (this.list.length > 700) this.list.shift();
      const ang = dir + (Math.random() - 0.5) * spread;
      const sp = speed * (0.35 + Math.random() * 0.65);
      this.list.push({
        x, y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - up * Math.random(),
        r: size * (0.6 + Math.random() * 0.7),
        rot: Math.random() * TAU,
        vr: (Math.random() - 0.5) * 14,
        c: colors[(Math.random() * colors.length) | 0],
        life, t: 0, g: gravity, shape,
      });
    }
  }
  update(dt) {
    for (const p of this.list) {
      p.t += dt;
      p.vy += p.g * dt;
      p.vx *= 1 - 0.8 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
    this.list = this.list.filter((p) => p.t < p.life);
  }
  draw(ctx) {
    for (const p of this.list) {
      const k = 1 - p.t / p.life;
      ctx.save();
      ctx.globalAlpha = Math.min(1, k * 2);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.shape === 'confetti') {
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r, -p.r * 0.45, p.r * 2, p.r * 0.9);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-p.r, -p.r * 0.45, p.r * 2, p.r * 0.9);
      } else if (p.shape === 'puff') {
        ctx.globalAlpha *= 0.7;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(0, 0, p.r * (1.6 - k * 0.6), 0, TAU);
        ctx.fill();
      } else {
        circle(ctx, 0, 0, p.r * (0.5 + 0.5 * k), p.c, 2);
      }
      ctx.restore();
    }
  }
}
