import { ctx2d, drawSplatBlob, hexToCss, makeCanvas, mulberry32, shadeHex } from './textures';

const MAX_SPLATS = 14;
const SPRITE = 256;

interface Drip { x: number; w: number; len: number; max: number; speed: number; delay: number }
interface Splat {
  active: boolean; img: HTMLCanvasElement | null; color: number;
  x: number; y: number; size: number; rot: number; age: number; hold: number; fade: number;
  drips: Drip[];
}

function cssColor(c: string | number): number {
  if (typeof c === 'number') return c;
  const m = /#([0-9a-f]{6})/i.exec(c);
  if (m) return parseInt(m[1], 16);
  const m3 = /#([0-9a-f])([0-9a-f])([0-9a-f])\b/i.exec(c);
  if (m3) return parseInt(m3[1] + m3[1] + m3[2] + m3[2] + m3[3] + m3[3], 16);
  return 0xff6040;
}

/** Ice-crystal frost frame, rendered once to a data URL. */
function makeFrostImage(w: number, h: number): string {
  const cv = makeCanvas(w, h);
  const g = ctx2d(cv);
  const rnd = mulberry32(77);
  const grad = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.28, w / 2, h / 2, Math.max(w, h) * 0.62);
  grad.addColorStop(0, 'rgba(200,235,255,0)');
  grad.addColorStop(0.6, 'rgba(190,230,255,0.35)');
  grad.addColorStop(1, 'rgba(235,250,255,0.9)');
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  g.lineCap = 'round';
  // dendrite crystals growing inward from the edges
  const branch = (x: number, y: number, a: number, len: number, depth: number) => {
    const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
    g.strokeStyle = `rgba(240,252,255,${0.18 + depth * 0.1})`;
    g.lineWidth = 0.6 + depth * 0.7;
    g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke();
    if (depth <= 0) return;
    const nb = 3;
    for (let i = 1; i <= nb; i++) {
      const t = i / (nb + 1);
      const bx = x + (ex - x) * t, by = y + (ey - y) * t;
      branch(bx, by, a + 1.05, len * 0.42 * (1 - t * 0.5), depth - 1);
      branch(bx, by, a - 1.05, len * 0.42 * (1 - t * 0.5), depth - 1);
    }
  };
  const seeds = 46;
  for (let i = 0; i < seeds; i++) {
    const edge = i % 4;
    let x = 0, y = 0;
    if (edge === 0) { x = rnd() * w; y = 0; }
    else if (edge === 1) { x = rnd() * w; y = h; }
    else if (edge === 2) { x = 0; y = rnd() * h; }
    else { x = w; y = rnd() * h; }
    const a = Math.atan2(h / 2 - y, w / 2 - x) + (rnd() - 0.5) * 1.1;
    branch(x, y, a, Math.min(w, h) * (0.08 + rnd() * 0.14), 2);
  }
  return cv.toDataURL('image/png');
}

const STYLE_ID = 'tsfx-screen-style';
const CSS = `
.tsfx-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.tsfx-vignette{background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 52%,rgba(12,7,4,.42) 82%,rgba(8,4,2,.78) 100%)}
.tsfx-frost{opacity:0;background-size:100% 100%;mix-blend-mode:screen;transition:none}
.tsfx-frost-tint{opacity:0;background:radial-gradient(ellipse at center,rgba(120,190,255,0) 40%,rgba(120,200,255,.35) 100%)}
.tsfx-frenzy{opacity:0;box-shadow:inset 0 0 90px 30px rgba(255,138,61,.75),inset 0 0 220px 60px rgba(255,90,30,.35)}
.tsfx-danger{opacity:0;background:radial-gradient(ellipse at center,rgba(255,0,0,0) 45%,rgba(200,10,10,.55) 100%);box-shadow:inset 0 0 120px 30px rgba(255,20,20,.5)}
.tsfx-flash{opacity:0;background:#fff}
`;

/**
 * DOM overlay effects on top of the game canvas: lens juice splats (2D
 * canvas), flash, frost / frenzy / danger vignettes and a permanent soft
 * vignette. The container should be position:relative (or fixed) and cover
 * the game canvas.
 */
export class ScreenFX {
  readonly root: HTMLDivElement;
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;
  private vignette: HTMLDivElement;
  private frost: HTMLDivElement;
  private frostTint: HTMLDivElement;
  private frenzy: HTMLDivElement;
  private danger: HTMLDivElement;
  private flashEl: HTMLDivElement;
  private splats: Splat[] = [];
  private sprites = new Map<number, HTMLCanvasElement[]>();
  private rnd = mulberry32(9001);
  private w = 1;
  private h = 1;
  private dpr = 1;
  private canvasDirty = false;
  private flashT = 1;
  private flashDur = 0.2;
  private flashPeak = 1;
  private frostTarget = 0; private frostCur = 0;
  private frenzyTarget = 0; private frenzyCur = 0;
  private dangerTarget = 0; private dangerCur = 0;
  private time = 0;
  private frostReady = false;
  private ro: ResizeObserver | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    if (!document.getElementById(STYLE_ID)) {
      const st = document.createElement('style');
      st.id = STYLE_ID;
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    const mk = (cls: string) => {
      const d = document.createElement('div');
      d.className = `tsfx-layer ${cls}`;
      return d;
    };
    this.root = mk('tsfx-screen');
    this.root.style.zIndex = '5';
    this.vignette = mk('tsfx-vignette');
    this.frostTint = mk('tsfx-frost-tint');
    this.frost = mk('tsfx-frost');
    this.frenzy = mk('tsfx-frenzy');
    this.danger = mk('tsfx-danger');
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'tsfx-layer';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.g = ctx2d(this.canvas);
    this.flashEl = mk('tsfx-flash');
    this.root.append(this.vignette, this.frostTint, this.frost, this.frenzy, this.danger, this.canvas, this.flashEl);
    container.appendChild(this.root);
    for (let i = 0; i < MAX_SPLATS; i++) {
      this.splats.push({ active: false, img: null, color: 0, x: 0, y: 0, size: 0, rot: 0, age: 0, hold: 0, fade: 0, drips: [] });
    }
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(container);
    }
    this.resize();
  }

  /** Permanent soft vignette strength 0..1 (default 1). */
  setVignette(v: number): void { this.vignette.style.opacity = String(v); }

  resize(): void {
    const r = this.container.getBoundingClientRect();
    this.w = Math.max(1, r.width);
    this.h = Math.max(1, r.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.canvasDirty = true;
  }

  private spriteFor(color: number): HTMLCanvasElement {
    let list = this.sprites.get(color);
    if (!list) { list = []; this.sprites.set(color, list); }
    if (list.length < 3) {
      const c = makeCanvas(SPRITE, SPRITE);
      const g = ctx2d(c);
      const rnd = mulberry32(color + list.length * 131);
      drawSplatBlob(g, SPRITE / 2, SPRITE / 2, SPRITE * 0.24, color, rnd, { dots: 14, lobes: 13, gloss: true });
      list.push(c);
      return c;
    }
    return list[Math.floor(this.rnd() * list.length)];
  }

  /**
   * Juice splatter on the lens. ndc position, size ≈ fraction of screen height (0.15..0.5).
   */
  splat(color: string | number, ndcX: number, ndcY: number, size = 0.3): void {
    const col = cssColor(color);
    let s = this.splats.find((q) => !q.active);
    if (!s) {
      // recycle the oldest
      s = this.splats.reduce((a, b) => (a.age > b.age ? a : b));
    }
    s.active = true;
    s.color = col;
    s.img = this.spriteFor(col);
    s.x = (ndcX * 0.5 + 0.5);
    s.y = (0.5 - ndcY * 0.5);
    s.size = size;
    s.rot = this.rnd() * Math.PI * 2;
    s.age = 0;
    s.hold = 1.1 + this.rnd() * 0.6;
    s.fade = 1.4;
    s.drips.length = 0;
    const nd = 1 + Math.floor(this.rnd() * 3);
    for (let i = 0; i < nd; i++) {
      s.drips.push({
        x: (this.rnd() - 0.5) * 0.55,
        w: 0.025 + this.rnd() * 0.03,
        len: 0,
        max: 0.5 + this.rnd() * 0.9,
        speed: 0.25 + this.rnd() * 0.35,
        delay: 0.15 + this.rnd() * 0.5,
      });
    }
    this.canvasDirty = true;
  }

  /** Full-screen flash that decays over duration seconds. */
  flash(color = '#fff', duration = 0.25, strength = 1): void {
    this.flashEl.style.background = color;
    this.flashT = 0;
    this.flashDur = Math.max(0.02, duration);
    this.flashPeak = strength;
  }

  setFrost(amount: number): void {
    this.frostTarget = Math.max(0, Math.min(1, amount));
    if (amount > 0 && !this.frostReady) {
      this.frostReady = true;
      this.frost.style.backgroundImage = `url(${makeFrostImage(1024, 640)})`;
    }
  }
  setFrenzy(amount: number): void { this.frenzyTarget = Math.max(0, Math.min(1, amount)); }
  setDanger(amount: number): void { this.dangerTarget = Math.max(0, Math.min(1, amount)); }

  clearSplats(): void {
    for (const s of this.splats) s.active = false;
    this.canvasDirty = true;
  }

  update(dt: number): void {
    this.time += dt;
    const k = 1 - Math.exp(-dt * 6);
    this.frostCur += (this.frostTarget - this.frostCur) * k;
    this.frenzyCur += (this.frenzyTarget - this.frenzyCur) * k;
    this.dangerCur += (this.dangerTarget - this.dangerCur) * k;
    const op = (v: number) => (v < 0.003 ? '0' : v.toFixed(3));
    this.frost.style.opacity = op(this.frostCur);
    this.frostTint.style.opacity = op(this.frostCur);
    this.frenzy.style.opacity = op(this.frenzyCur * (0.65 + 0.35 * Math.sin(this.time * 7)));
    this.danger.style.opacity = op(this.dangerCur * (0.55 + 0.45 * Math.sin(this.time * 9)));
    if (this.flashT < 1) {
      this.flashT = Math.min(1, this.flashT + dt / this.flashDur);
      this.flashEl.style.opacity = op(this.flashPeak * (1 - this.flashT) * (1 - this.flashT));
    }
    this.drawSplats(dt);
  }

  private drawSplats(dt: number): void {
    let any = false;
    for (const s of this.splats) if (s.active) { any = true; break; }
    if (!any && !this.canvasDirty) return;
    this.canvasDirty = false;
    const g = this.g;
    const W = this.canvas.width, H = this.canvas.height;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, W, H);
    for (const s of this.splats) {
      if (!s.active || !s.img) continue;
      s.age += dt;
      const total = s.hold + s.fade;
      if (s.age >= total) { s.active = false; continue; }
      const pop = s.age < 0.09 ? 0.75 + (s.age / 0.09) * 0.3 : s.age < 0.16 ? 1.05 - ((s.age - 0.09) / 0.07) * 0.05 : 1;
      const alpha = s.age < s.hold ? 0.92 : 0.92 * (1 - (s.age - s.hold) / s.fade);
      const px = s.x * W, py = s.y * H;
      const size = s.size * H * pop;
      g.globalAlpha = alpha;
      // drips: run straight down the lens regardless of blob rotation
      g.fillStyle = hexToCss(shadeHex(s.color, -0.05), 1);
      for (const d of s.drips) {
        const t = s.age - d.delay;
        if (t <= 0) continue;
        d.len = Math.min(d.max, d.len + d.speed * dt * (1 - d.len / (d.max * 1.05)));
        const dx = px + d.x * size;
        const top = py;
        const len = d.len * size;
        const w = d.w * size;
        g.beginPath();
        g.moveTo(dx - w, top);
        g.lineTo(dx - w * 0.75, top + len);
        g.arc(dx, top + len, w * 0.9, Math.PI, 0, true);
        g.lineTo(dx + w, top);
        g.closePath();
        g.fill();
        // gloss on drip bead
        g.fillStyle = 'rgba(255,255,255,0.35)';
        g.beginPath();
        g.arc(dx - w * 0.3, top + len - w * 0.2, w * 0.3, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = hexToCss(shadeHex(s.color, -0.05), 1);
      }
      g.setTransform(Math.cos(s.rot), Math.sin(s.rot), -Math.sin(s.rot), Math.cos(s.rot), px, py);
      g.drawImage(s.img, -size, -size, size * 2, size * 2);
      g.setTransform(1, 0, 0, 1, 0, 0);
    }
    g.globalAlpha = 1;
  }

  dispose(): void {
    this.ro?.disconnect();
    this.root.remove();
    this.sprites.clear();
  }
}
