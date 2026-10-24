/** Procedural canvas textures + tiny seeded RNG shared by the fx module. */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export function ctx2d(c: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return ctx;
}

/** Radial soft glow (white), used for sprites and points. */
export function makeSoftDot(size = 64, hardness = 0): HTMLCanvasElement {
  const c = makeCanvas(size, size);
  const g = ctx2d(c);
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(Math.min(0.9, 0.2 + hardness * 0.6), 'rgba(255,255,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

/** Puffy smoke/mist sprite: several overlapping soft circles. */
export function makePuff(size = 128, seed = 7): HTMLCanvasElement {
  const c = makeCanvas(size, size);
  const g = ctx2d(c);
  const rnd = mulberry32(seed);
  const r = size / 2;
  for (let i = 0; i < 9; i++) {
    const a = rnd() * Math.PI * 2;
    const d = rnd() * r * 0.35;
    const x = r + Math.cos(a) * d;
    const y = r + Math.sin(a) * d;
    const rr = r * (0.35 + rnd() * 0.3);
    const grad = g.createRadialGradient(x, y, 0, x, y, rr);
    grad.addColorStop(0, 'rgba(255,255,255,0.45)');
    grad.addColorStop(0.6, 'rgba(255,255,255,0.18)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  return c;
}

export function hexToCss(hex: number, alpha = 1): string {
  const r = (hex >> 16) & 255;
  const g = (hex >> 8) & 255;
  const b = hex & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Mix a hex colour toward white (t>0) or black (t<0). */
export function shadeHex(hex: number, t: number): number {
  let r = (hex >> 16) & 255;
  let g = (hex >> 8) & 255;
  let b = hex & 255;
  if (t >= 0) {
    r += (255 - r) * t; g += (255 - g) * t; b += (255 - b) * t;
  } else {
    r *= 1 + t; g *= 1 + t; b *= 1 + t;
  }
  return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
}

/**
 * Irregular liquid blob with splatter dots, drawn in `color` on a transparent
 * canvas. Used both for table stains and lens splats.
 */
export function drawSplatBlob(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: number,
  rnd: () => number,
  opts: { dots?: number; lobes?: number; gloss?: boolean; rim?: boolean } = {},
): void {
  const lobes = opts.lobes ?? 11;
  const dots = opts.dots ?? 10;
  // main body: smooth closed curve through jittered radii
  const pts: number[] = [];
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2 + rnd() * 0.25;
    const rr = radius * (0.68 + rnd() * 0.42);
    pts.push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  const body = new Path2D();
  const n = lobes;
  const mx = (pts[0] + pts[(n - 1) * 2]) / 2;
  const my = (pts[1] + pts[(n - 1) * 2 + 1]) / 2;
  body.moveTo(mx, my);
  for (let i = 0; i < n; i++) {
    const x = pts[i * 2];
    const y = pts[i * 2 + 1];
    const nx = pts[((i + 1) % n) * 2];
    const ny = pts[((i + 1) % n) * 2 + 1];
    body.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2);
  }
  body.closePath();
  g.fillStyle = hexToCss(color, 1);
  g.fill(body);
  // a few elongated tendrils
  const tendrils = 3 + Math.floor(rnd() * 4);
  for (let i = 0; i < tendrils; i++) {
    const a = rnd() * Math.PI * 2;
    const len = radius * (0.9 + rnd() * 0.7);
    const w = radius * (0.08 + rnd() * 0.12);
    const ex = cx + Math.cos(a) * len;
    const ey = cy + Math.sin(a) * len;
    g.beginPath();
    g.moveTo(cx + Math.cos(a + 0.3) * radius * 0.5, cy + Math.sin(a + 0.3) * radius * 0.5);
    g.quadraticCurveTo(ex - Math.cos(a) * w, ey - Math.sin(a) * w, ex, ey);
    g.quadraticCurveTo(ex + Math.cos(a) * w, ey + Math.sin(a) * w,
      cx + Math.cos(a - 0.3) * radius * 0.5, cy + Math.sin(a - 0.3) * radius * 0.5);
    g.fill();
    g.beginPath();
    g.arc(ex, ey, w * 1.3, 0, Math.PI * 2);
    g.fill();
  }
  // satellite splatter dots
  for (let i = 0; i < dots; i++) {
    const a = rnd() * Math.PI * 2;
    const d = radius * (1.05 + rnd() * 0.9);
    const rr = radius * (0.03 + rnd() * rnd() * 0.16);
    g.beginPath();
    g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, rr, 0, Math.PI * 2);
    g.fill();
  }
  if (opts.rim) {
    // darker rim where the juice pooled when drying
    g.save();
    g.clip(body);
    g.lineWidth = radius * 0.12;
    g.strokeStyle = hexToCss(shadeHex(color, -0.45), 0.55);
    g.stroke(body);
    g.restore();
  }
  if (opts.gloss) {
    g.save();
    g.clip(body);
    const hx = cx - radius * 0.3;
    const hy = cy - radius * 0.35;
    const grad = g.createRadialGradient(hx, hy, 0, hx, hy, radius * 0.6);
    grad.addColorStop(0, 'rgba(255,255,255,0.55)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    g.lineWidth = radius * 0.1;
    g.strokeStyle = hexToCss(shadeHex(color, -0.35), 0.6);
    g.stroke(body);
    g.restore();
  }
}
