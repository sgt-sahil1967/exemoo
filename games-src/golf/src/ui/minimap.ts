/** Top-down hole minimap: terrain is rasterised ONCE per hole into an offscreen canvas, then each
 *  update only blits it (rotated so the tee is at the bottom) and draws ball / pin / aim. */
import type { Hole } from '../core/contracts';
import { SURFACES, type Surface } from '../core/contracts';
import { h } from './dom';

interface Pt {
  x: number;
  z: number;
}

interface Prepared {
  hole: Hole;
  img: HTMLCanvasElement;
  /** Rotation that puts tee→pin pointing up (canvas radians). */
  rot: number;
  /** World centre of the fitted view. */
  cx: number;
  cz: number;
  /** Rotated half extents of the fitted view (metres). */
  hw: number;
  hh: number;
}

const rgbCache = new Map<string, [number, number, number]>();
function rgb(hex: string): [number, number, number] {
  let v = rgbCache.get(hex);
  if (!v) {
    const n = parseInt(hex.slice(1), 16);
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    rgbCache.set(hex, v);
  }
  return v;
}

/** Rasterise a hole's surfaces + trees. */
function prepare(hole: Hole): Prepared {
  const b = hole.bounds;
  const w = b.maxX - b.minX;
  const d = b.maxZ - b.minZ;
  const step = Math.min(4, Math.max(2, Math.sqrt(w * d) / 170));
  const cols = Math.max(2, Math.ceil(w / step));
  const rows = Math.max(2, Math.ceil(d / step));
  const base = document.createElement('canvas');
  base.width = cols;
  base.height = rows;
  const bctx = base.getContext('2d')!;
  const data = bctx.createImageData(cols, rows);
  let minH = Infinity;
  let maxH = -Infinity;
  const heights = new Float32Array(cols * rows);
  const surf: Surface[] = new Array(cols * rows);
  for (let j = 0; j < rows; j++) {
    const z = b.minZ + (j + 0.5) * step;
    for (let i = 0; i < cols; i++) {
      const x = b.minX + (i + 0.5) * step;
      const k = j * cols + i;
      let s: Surface = 'ob';
      let y = 0;
      try {
        s = hole.surfaceAt(x, z);
        y = hole.heightAt(x, z);
      } catch {
        /* keep defaults */
      }
      surf[k] = s;
      heights[k] = y;
      if (y < minH) minH = y;
      if (y > maxH) maxH = y;
    }
  }
  const range = Math.max(1, maxH - minH);
  for (let k = 0; k < cols * rows; k++) {
    const [r, g, bl] = rgb(SURFACES[surf[k]].color);
    // Gentle relief shading + a mowing stripe on fairway/green.
    const t = (heights[k] - minH) / range - 0.5;
    const stripe = surf[k] === 'fairway' || surf[k] === 'green' ? (Math.floor(k / cols / 3) % 2 ? 6 : -4) : 0;
    const f = 1 + t * 0.18;
    data.data[k * 4] = Math.min(255, r * f + stripe);
    data.data[k * 4 + 1] = Math.min(255, g * f + stripe);
    data.data[k * 4 + 2] = Math.min(255, bl * f + stripe);
    data.data[k * 4 + 3] = 255;
  }
  bctx.putImageData(data, 0, 0);

  // Hi-res composition with smooth edges + trees.
  const ppm = Math.min(4, 1600 / Math.max(w, d));
  const img = document.createElement('canvas');
  img.width = Math.ceil(w * ppm);
  img.height = Math.ceil(d * ppm);
  const ictx = img.getContext('2d')!;
  ictx.imageSmoothingEnabled = true;
  ictx.imageSmoothingQuality = 'high';
  ictx.drawImage(base, 0, 0, img.width, img.height);
  for (const t of hole.trees) {
    const x = (t.pos.x - b.minX) * ppm;
    const y = (t.pos.z - b.minZ) * ppm;
    const r = Math.max(2.5, t.radius * ppm * 0.9);
    ictx.fillStyle = 'rgba(10,40,10,0.28)';
    ictx.beginPath();
    ictx.arc(x + r * 0.25, y + r * 0.3, r, 0, Math.PI * 2);
    ictx.fill();
    ictx.fillStyle = t.kind === 'pine' ? '#1f5a2a' : t.kind === 'palm' ? '#3c8a2e' : '#2b6b24';
    ictx.beginPath();
    ictx.arc(x, y, r, 0, Math.PI * 2);
    ictx.fill();
    ictx.fillStyle = 'rgba(255,255,255,0.14)';
    ictx.beginPath();
    ictx.arc(x - r * 0.3, y - r * 0.3, r * 0.45, 0, Math.PI * 2);
    ictx.fill();
  }

  // View: rotate so tee→pin points up, fit tee + centreline + pin.
  const rot = -Math.atan2(hole.pin.x - hole.tee.x, -(hole.pin.z - hole.tee.z));
  const pts: Pt[] = [hole.tee, hole.pin, ...hole.centerline];
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of pts) {
    const rx = p.x * c - p.z * s;
    const ry = p.x * s + p.z * c;
    x0 = Math.min(x0, rx); x1 = Math.max(x1, rx);
    y0 = Math.min(y0, ry); y1 = Math.max(y1, ry);
  }
  const margin = 22;
  const hw = Math.max((x1 - x0) / 2 + margin, 40);
  const hh = (y1 - y0) / 2 + margin;
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  // Back-rotate the centre into world space.
  const cx = mx * c + my * s;
  const cz = -mx * s + my * c;
  return { hole, img, rot, cx, cz, hw, hh };
}

export class Minimap {
  readonly el: HTMLElement;
  private canvas: HTMLCanvasElement;
  private prep: Prepared | null = null;
  private ball: Pt | null = null;
  private aim: Pt | null = null;
  private key = '';
  private ro: ResizeObserver | null = null;

  constructor() {
    this.canvas = h('canvas', { class: 'bd-minimap__canvas' });
    this.el = h('div', { class: 'bd-minimap bd-card is-hidden' }, this.canvas, h('div', { class: 'bd-minimap__n' }));
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => {
        this.key = '';
        this.draw();
      });
      this.ro.observe(this.canvas);
    }
  }

  set(hole: Hole | null, ball?: Pt, aim?: Pt) {
    if (!hole) {
      this.el.classList.add('is-hidden');
      this.prep = null;
      return;
    }
    this.el.classList.remove('is-hidden');
    if (!this.prep || this.prep.hole !== hole) {
      this.prep = prepare(hole);
      this.key = '';
      this.el.querySelector('.bd-minimap__n')!.textContent = String(hole.def.number);
    }
    this.ball = ball ? { x: ball.x, z: ball.z } : null;
    this.aim = aim ? { x: aim.x, z: aim.z } : null;
    this.draw();
  }

  private draw() {
    const p = this.prep;
    if (!p) return;
    const cw = this.canvas.clientWidth;
    const ch = this.canvas.clientHeight;
    if (!cw || !ch) return;
    const f = (v: number) => v.toFixed(1);
    const key = `${cw}x${ch}|${this.ball ? f(this.ball.x) + ',' + f(this.ball.z) : '-'}|${this.aim ? f(this.aim.x) + ',' + f(this.aim.z) : '-'}`;
    if (key === this.key) return;
    this.key = key;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (this.canvas.width !== Math.round(cw * dpr)) this.canvas.width = Math.round(cw * dpr);
    if (this.canvas.height !== Math.round(ch * dpr)) this.canvas.height = Math.round(ch * dpr);
    const ctx = this.canvas.getContext('2d')!;
    const scale = Math.min(cw / (p.hw * 2), ch / (p.hh * 2));
    const b = p.hole.bounds;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = SURFACES.ob.color;
    ctx.fillRect(0, 0, cw, ch);
    ctx.save();
    ctx.translate(cw / 2, ch / 2);
    ctx.scale(scale, scale);
    ctx.rotate(p.rot);
    ctx.translate(-p.cx, -p.cz);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(p.img, b.minX, b.minZ, b.maxX - b.minX, b.maxZ - b.minZ);
    ctx.restore();

    const c = Math.cos(p.rot);
    const s = Math.sin(p.rot);
    const toS = (q: Pt) => {
      const dx = q.x - p.cx;
      const dz = q.z - p.cz;
      return { x: cw / 2 + (dx * c - dz * s) * scale, y: ch / 2 + (dx * s + dz * c) * scale };
    };
    const u = cw / 110; // unit for marker sizes
    // Tee marker.
    const tee = toS(p.hole.tee);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillRect(tee.x - 2.2 * u, tee.y - 1 * u, 4.4 * u, 2 * u);
    // Aim line + landing ring.
    const ball = this.ball ? toS(this.ball) : null;
    if (ball && this.aim) {
      const a = toS(this.aim);
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.lineWidth = 1.4 * u;
      ctx.setLineDash([2.6 * u, 2.6 * u]);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ball.x, ball.y);
      ctx.lineTo(a.x, a.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(32,164,243,0.35)';
      ctx.strokeStyle = '#20a4f3';
      ctx.lineWidth = 1.2 * u;
      ctx.beginPath();
      ctx.arc(a.x, a.y, 4 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    // Pin flag.
    const pin = toS(p.hole.pin);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(pin.x, pin.y, 2 * u, 1.1 * u, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1 * u;
    ctx.beginPath();
    ctx.moveTo(pin.x, pin.y);
    ctx.lineTo(pin.x, pin.y - 10 * u);
    ctx.stroke();
    ctx.fillStyle = '#ff3b30';
    ctx.beginPath();
    ctx.moveTo(pin.x, pin.y - 10 * u);
    ctx.lineTo(pin.x + 7 * u, pin.y - 7.6 * u);
    ctx.lineTo(pin.x, pin.y - 5.2 * u);
    ctx.closePath();
    ctx.fill();
    // Ball.
    if (ball) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.arc(ball.x + 0.6 * u, ball.y + 0.8 * u, 3.2 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#22303c';
      ctx.lineWidth = 1 * u;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 3 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
}
