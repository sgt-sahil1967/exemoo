/**
 * Procedural CanvasTextures for the scene. Everything is generated in code.
 */
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, LinearFilter, type Texture } from 'three';
import { PALETTE } from '../core/contracts';

export const FONT = '"Avenir Next", "Nunito", "Segoe UI", "Helvetica Neue", system-ui, sans-serif';

export function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  return [c, ctx];
}

export function canvasTexture(c: HTMLCanvasElement, opts: { srgb?: boolean; repeat?: boolean } = {}): CanvasTexture {
  const t = new CanvasTexture(c);
  if (opts.srgb !== false) t.colorSpace = SRGBColorSpace;
  if (opts.repeat) {
    t.wrapS = RepeatWrapping;
    t.wrapT = RepeatWrapping;
  }
  t.anisotropy = 4;
  return t;
}

/** Deterministic tiny PRNG so procedural art is identical every load. */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Soft radial blob: white centre fading to transparent (use as alphaMap or map). */
export function makeBlobTexture(size = 128, hard = 0.0): CanvasTexture {
  const [c, ctx] = makeCanvas(size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(Math.max(0.01, hard), 'rgba(255,255,255,0.85)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return canvasTexture(c);
}

/** Net mesh: square cells, dark cord, transparent holes. */
export function makeNetTexture(): CanvasTexture {
  const [c, ctx] = makeCanvas(64, 64);
  ctx.clearRect(0, 0, 64, 64);
  ctx.strokeStyle = 'rgba(28,34,52,0.92)';
  ctx.lineWidth = 7;
  ctx.strokeRect(0, 0, 64, 64);
  ctx.strokeStyle = 'rgba(70,82,110,0.6)';
  ctx.lineWidth = 2;
  ctx.strokeRect(3.5, 3.5, 57, 57);
  const t = canvasTexture(c, { repeat: true });
  t.anisotropy = 8;
  return t;
}

/** Ball surface (equirectangular): cream with a seam and two bold marks so spin reads. */
export function makeBallTexture(): CanvasTexture {
  const W = 256;
  const H = 128;
  const [c, ctx] = makeCanvas(W, H);
  ctx.fillStyle = PALETTE.ball;
  ctx.fillRect(0, 0, W, H);
  // seam
  ctx.fillStyle = '#e4d8c2';
  ctx.fillRect(0, H / 2 - 2, W, 4);
  // marks — a coral logo patch and an ink dash on opposite sides
  ctx.fillStyle = PALETTE.accent;
  ctx.beginPath();
  ctx.ellipse(W * 0.25, H * 0.5, 22, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.ball;
  ctx.font = `900 26px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', W * 0.25, H * 0.5 + 1);
  ctx.fillStyle = PALETTE.ink;
  roundRect(ctx, W * 0.75 - 20, H * 0.5 - 7, 40, 14, 7);
  ctx.fill();
  ctx.fillStyle = '#d9cbb3';
  ctx.beginPath();
  ctx.ellipse(W * 0.5, H * 0.18, 10, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  const t = canvasTexture(c);
  return t;
}

/** Club hall floor: warm honey planks with a baked soft AO under the table + edge vignette. */
export function makeClubFloorTexture(sizeX: number, sizeZ: number): CanvasTexture {
  const S = 2048;
  const [c, ctx] = makeCanvas(S, S);
  const r = rng(7);
  const plankW = 0.2; // metres
  const nPlanks = Math.ceil(sizeX / plankW);
  const pxPer = S / sizeX;
  const pzPer = S / sizeZ;
  for (let i = 0; i < nPlanks; i++) {
    const x0 = i * plankW * pxPer;
    let z = -r() * 3;
    while (z < sizeZ) {
      const len = 1.6 + r() * 2.2;
      const l = 0.62 + (r() - 0.5) * 0.035;
      const h = 33 + (r() - 0.5) * 4;
      ctx.fillStyle = `hsl(${h}, 58%, ${l * 100}%)`;
      ctx.fillRect(x0, z * pzPer, plankW * pxPer, len * pzPer);
      // soft grain sheen
      const g = ctx.createLinearGradient(x0, 0, x0 + plankW * pxPer, 0);
      g.addColorStop(0, 'rgba(255,240,215,0.10)');
      g.addColorStop(0.5, 'rgba(255,240,215,0.0)');
      g.addColorStop(1, 'rgba(120,70,30,0.07)');
      ctx.fillStyle = g;
      ctx.fillRect(x0, z * pzPer, plankW * pxPer, len * pzPer);
      ctx.fillStyle = 'rgba(110,62,28,0.35)';
      ctx.fillRect(x0, z * pzPer, plankW * pxPer, 1.5);
      z += len;
    }
    ctx.fillStyle = 'rgba(110,62,28,0.30)';
    ctx.fillRect(x0, 0, 1.5, S);
  }
  // play zone: subtle lighter "mat" with rounded corners
  ctx.save();
  const zx = 6.5 * pxPer;
  const zz = 11 * pzPer;
  roundRect(ctx, S / 2 - zx / 2, S / 2 - zz / 2, zx, zz, 30);
  ctx.fillStyle = 'rgba(255,236,205,0.16)';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(255,250,240,0.55)';
  ctx.stroke();
  ctx.restore();
  // AO under table
  ctx.save();
  ctx.translate(S / 2, S / 2);
  ctx.scale(1.0 * pxPer, 1.0 * pzPer);
  const ao = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  ao.addColorStop(0, 'rgba(70,40,20,0.42)');
  ao.addColorStop(0.6, 'rgba(70,40,20,0.22)');
  ao.addColorStop(1, 'rgba(70,40,20,0)');
  ctx.fillStyle = ao;
  ctx.scale(1.25, 1.95);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // vignette toward walls
  const v = ctx.createRadialGradient(S / 2, S / 2, S * 0.25, S / 2, S / 2, S * 0.75);
  v.addColorStop(0, 'rgba(90,50,20,0)');
  v.addColorStop(1, 'rgba(90,50,20,0.35)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, S, S);
  const t = canvasTexture(c);
  t.anisotropy = 8;
  return t;
}

/** Arena floor: navy surround, red competition court with blue border, baked spotlight pool. */
export function makeArenaFloorTexture(sizeX: number, sizeZ: number, courtX: number, courtZ: number): CanvasTexture {
  const S = 2048;
  const [c, ctx] = makeCanvas(S, S);
  const px = S / sizeX;
  const pz = S / sizeZ;
  ctx.fillStyle = '#121a2e';
  ctx.fillRect(0, 0, S, S);
  // border band
  const bx = (courtX + 0.6) * px;
  const bz = (courtZ + 0.6) * pz;
  ctx.fillStyle = '#1e3f86';
  ctx.fillRect(S / 2 - bx / 2, S / 2 - bz / 2, bx, bz);
  // court
  const cx = courtX * px;
  const cz = courtZ * pz;
  ctx.fillStyle = '#86283a';
  ctx.fillRect(S / 2 - cx / 2, S / 2 - cz / 2, cx, cz);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 5;
  ctx.strokeRect(S / 2 - cx / 2 + 0.25 * px, S / 2 - cz / 2 + 0.25 * pz, cx - 0.5 * px, cz - 0.5 * pz);
  // subtle sheen stripes (rolled flooring seams)
  for (let i = 0; i < 6; i++) {
    const x = S / 2 - cx / 2 + (i * cx) / 6;
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(x, S / 2 - cz / 2, 2, cz);
  }
  // spotlight pool
  ctx.save();
  ctx.translate(S / 2, S / 2);
  ctx.scale(px, pz);
  ctx.scale(3.4, 4.6);
  const pool = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  pool.addColorStop(0, 'rgba(255,225,190,0.22)');
  pool.addColorStop(0.55, 'rgba(255,215,180,0.13)');
  pool.addColorStop(1, 'rgba(255,210,170,0)');
  ctx.fillStyle = pool;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // AO under table
  ctx.save();
  ctx.translate(S / 2, S / 2);
  ctx.scale(px * 1.2, pz * 1.9);
  const ao = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  ao.addColorStop(0, 'rgba(10,10,25,0.5)');
  ao.addColorStop(0.65, 'rgba(10,10,25,0.22)');
  ao.addColorStop(1, 'rgba(10,10,25,0)');
  ctx.fillStyle = ao;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  const t = canvasTexture(c);
  t.anisotropy = 8;
  return t;
}

/** Simple vertical gradient (wall paint etc.). */
export function makeGradientTexture(stops: [number, string][], w = 8, h = 256): CanvasTexture {
  const [c, ctx] = makeCanvas(w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [o, col] of stops) g.addColorStop(o, col);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const t = canvasTexture(c);
  t.magFilter = LinearFilter;
  return t;
}

/** Window pane: bright soft sky gradient with a hint of distant trees. */
export function makeWindowTexture(): CanvasTexture {
  const [c, ctx] = makeCanvas(256, 256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#cfe8ff');
  g.addColorStop(0.6, '#f4f9ff');
  g.addColorStop(1, '#fff6e2');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const r = rng(3);
  ctx.fillStyle = 'rgba(150,200,150,0.45)';
  for (let i = 0; i < 14; i++) {
    const x = r() * 256;
    const rr = 18 + r() * 30;
    ctx.beginPath();
    ctx.arc(x, 236 + r() * 10, rr, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvasTexture(c);
}

/** Club barrier panel with the SPINSHOT wordmark. */
export function makeBarrierTexture(bg: string, fg: string, dot: string): CanvasTexture {
  const [c, ctx] = makeCanvas(512, 128);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 128);
  drawWordmark(ctx, 256, 66, 64, fg, dot);
  return canvasTexture(c);
}

export function drawWordmark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, fg: string, dot: string): void {
  ctx.save();
  ctx.font = `900 italic ${size}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const w = ctx.measureText('SPINSHOT').width;
  ctx.fillStyle = fg;
  ctx.fillText('SPINSHOT', x + size * 0.18, y);
  ctx.fillStyle = dot;
  ctx.beginPath();
  ctx.arc(x - w / 2 - size * 0.18, y, size * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** LED ribbon: one long strip scrolled via texture offset. */
export function makeLedTexture(): CanvasTexture {
  const W = 2048;
  const H = 64;
  const [c, ctx] = makeCanvas(W, H);
  const segs: { bg: string; draw: (x: number, w: number) => void }[] = [
    {
      bg: '#0f1830',
      draw: (x, w) => drawWordmark(ctx, x + w / 2, 33, 40, '#ffffff', PALETTE.accent),
    },
    {
      bg: PALETTE.accent,
      draw: (x, w) => {
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 34px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('WORLD TOUR  ·  FINALS', x + w / 2, 34);
      },
    },
    {
      bg: '#0f1830',
      draw: (x, w) => {
        for (let i = 0; i < 9; i++) {
          ctx.fillStyle = [PALETTE.gold, PALETTE.accent2, PALETTE.accent][i % 3];
          ctx.beginPath();
          ctx.arc(x + ((i + 0.5) * w) / 9, 32, 11, 0, Math.PI * 2);
          ctx.fill();
        }
      },
    },
    {
      bg: PALETTE.accent2,
      draw: (x, w) => {
        ctx.fillStyle = '#0f1830';
        ctx.font = `900 italic 36px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PLAY WITH YOUR PHONE', x + w / 2, 34);
      },
    },
  ];
  const sw = W / segs.length;
  segs.forEach((s, i) => {
    ctx.fillStyle = s.bg;
    ctx.fillRect(i * sw, 0, sw, H);
    s.draw(i * sw, sw);
  });
  // LED pixel grid
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  for (let x = 0; x < W; x += 4) ctx.fillRect(x, 0, 1, H);
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
  const t = canvasTexture(c, { repeat: true });
  t.anisotropy = 8;
  return t;
}

/** Vertical fade for light cones (opaque bottom→transparent top in alpha). */
export function makeConeTexture(): CanvasTexture {
  const [c, ctx] = makeCanvas(4, 128);
  const g = ctx.createLinearGradient(0, 0, 0, 128);
  g.addColorStop(0, 'rgba(255,255,255,0.0)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.6)');
  g.addColorStop(1, 'rgba(255,255,255,1)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 128);
  return canvasTexture(c);
}

export function disposeTexture(t: Texture | null | undefined): void {
  if (t) t.dispose();
}
