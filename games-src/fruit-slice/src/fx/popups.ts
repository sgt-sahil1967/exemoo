import * as THREE from 'three';

const STYLE_ID = 'tsfx-popup-style';
const FONT = `'Arial Rounded MT Bold','Nunito','Varela Round',system-ui,-apple-system,'Segoe UI',sans-serif`;
const CSS = `
.tsfx-popups{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:6;font-family:${FONT};}
.tsfx-pop{position:absolute;left:0;top:0;will-change:transform,opacity;white-space:nowrap;text-align:center;
  font-weight:900;line-height:.92;letter-spacing:.01em;color:#fff;opacity:0;
  -webkit-text-stroke:0;paint-order:stroke fill;
  text-shadow:0 3px 0 #3a1d0c,0 -1px 0 #3a1d0c,2px 0 0 #3a1d0c,-2px 0 0 #3a1d0c,2px 3px 0 #3a1d0c,-2px 3px 0 #3a1d0c,0 6px 10px rgba(0,0,0,.45);}
.tsfx-score{font-size:clamp(20px,3.1vh,40px);}
.tsfx-combo{display:flex;flex-direction:column;align-items:center;gap:.05em;}
.tsfx-combo .n{font-size:clamp(26px,4.4vh,58px);color:#fff4dc;}
.tsfx-combo .c{font-size:clamp(36px,6.4vh,84px);color:#ffb347;background:linear-gradient(#ffe08a,#ff8a3d 70%,#ff6a1f);
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
  -webkit-text-stroke:clamp(5px,0.8vh,10px) #3a1d0c;filter:drop-shadow(0 5px 0 #3a1d0c) drop-shadow(0 8px 10px rgba(0,0,0,.4));text-shadow:none;}
.tsfx-combo .p{font-size:clamp(26px,4.2vh,56px);color:#fff;margin-top:.08em;}
.tsfx-crit{font-size:clamp(30px,5.4vh,72px);color:#ffe9a8;}
.tsfx-crit::before{content:'';position:absolute;left:50%;top:50%;width:2.4em;height:2.4em;margin:-1.2em 0 0 -1.2em;z-index:-1;
  background:radial-gradient(circle,rgba(255,220,120,.85) 0,rgba(255,138,61,.5) 30%,rgba(255,138,61,0) 68%);border-radius:50%;}
.tsfx-text{font-size:clamp(28px,5vh,64px);color:#f6ead2;}
.tsfx-text.big{font-size:clamp(48px,10vh,140px);}
.tsfx-text.warn{color:#ff5a3d;}
.tsfx-text.cool{color:#9fe7ff;}
.tsfx-text.gold{color:#ffd166;}
`;

type Kind = 'score' | 'combo' | 'crit' | 'text';

interface Pop {
  el: HTMLDivElement; active: boolean; kind: Kind;
  world: THREE.Vector3; useWorld: boolean; nx: number; ny: number;
  age: number; life: number; rise: number; rot: number;
}

const _v = new THREE.Vector3();
const MAX = 40;

/**
 * Floating score texts / combo callouts in a DOM layer above the canvas.
 * World-anchored popups are re-projected each update so they follow camera shake.
 */
export class Popups {
  readonly root: HTMLDivElement;
  private camera: THREE.Camera;
  private pool: Pop[] = [];
  private w = 1;
  private h = 1;
  private ro: ResizeObserver | null = null;
  private container: HTMLElement;

  constructor(container: HTMLElement, camera: THREE.Camera) {
    this.container = container;
    this.camera = camera;
    if (!document.getElementById(STYLE_ID)) {
      const st = document.createElement('style');
      st.id = STYLE_ID;
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    this.root = document.createElement('div');
    this.root.className = 'tsfx-popups';
    container.appendChild(this.root);
    for (let i = 0; i < MAX; i++) {
      const el = document.createElement('div');
      el.className = 'tsfx-pop';
      el.style.display = 'none';
      this.root.appendChild(el);
      this.pool.push({ el, active: false, kind: 'score', world: new THREE.Vector3(), useWorld: true, nx: 0, ny: 0, age: 0, life: 1, rise: 0, rot: 0 });
    }
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(container);
    }
    this.resize();
  }

  resize(): void {
    const r = this.container.getBoundingClientRect();
    this.w = Math.max(1, r.width);
    this.h = Math.max(1, r.height);
  }

  private take(kind: Kind, cls: string): Pop {
    let p = this.pool.find((q) => !q.active);
    if (!p) p = this.pool.reduce((a, b) => (a.age / a.life > b.age / b.life ? a : b));
    p.active = true;
    p.kind = kind;
    p.age = 0;
    p.rot = 0;
    p.el.className = `tsfx-pop ${cls}`;
    p.el.style.display = '';
    p.el.style.opacity = '0';
    // keep newest on top
    this.root.appendChild(p.el);
    return p;
  }

  /** Small "+1" style score text at a world position. */
  score(worldPos: THREE.Vector3, text: string, color = '#fff4dc'): void {
    const p = this.take('score', 'tsfx-score');
    p.el.textContent = text;
    p.el.style.color = color;
    p.world.copy(worldPos);
    p.useWorld = true;
    p.life = 0.85;
    p.rise = 0.09;
    p.rot = (Math.random() - 0.5) * 10;
  }

  /** Big chunky "3 FRUIT / COMBO / +3" callout. */
  combo(worldPos: THREE.Vector3, count: number, points: number): void {
    const p = this.take('combo', 'tsfx-combo');
    p.el.innerHTML = `<span class="n">${count} FRUIT</span><span class="c">COMBO</span><span class="p">+${points}</span>`;
    p.el.style.color = '';
    p.world.copy(worldPos);
    p.useWorld = true;
    p.life = 1.5;
    p.rise = 0.05;
    p.rot = (Math.random() - 0.5) * 8;
  }

  critical(worldPos: THREE.Vector3): void {
    const p = this.take('crit', 'tsfx-crit');
    p.el.textContent = 'CRITICAL!';
    p.el.style.color = '';
    p.world.copy(worldPos);
    p.useWorld = true;
    p.life = 1.1;
    p.rise = 0.07;
    p.rot = -6 + Math.random() * 4;
  }

  /** Screen-anchored text. cls: extra classes, e.g. 'big', 'warn', 'cool', 'gold'. */
  text(ndcX: number, ndcY: number, text: string, cls = ''): void {
    const p = this.take('text', `tsfx-text ${cls}`);
    p.el.textContent = text;
    p.el.style.color = '';
    p.nx = ndcX;
    p.ny = ndcY;
    p.useWorld = false;
    p.life = cls.includes('big') ? 1.6 : 1.2;
    p.rise = 0.04;
  }

  clear(): void {
    for (const p of this.pool) { p.active = false; p.el.style.display = 'none'; }
  }

  update(dt: number): void {
    for (const p of this.pool) {
      if (!p.active) continue;
      p.age += dt;
      const t = p.age / p.life;
      if (t >= 1) { p.active = false; p.el.style.display = 'none'; continue; }
      let nx = p.nx, ny = p.ny;
      if (p.useWorld) {
        _v.copy(p.world).project(this.camera);
        nx = _v.x; ny = _v.y;
      }
      let x = (nx * 0.5 + 0.5) * this.w;
      let y = (0.5 - ny * 0.5) * this.h - p.rise * this.h * easeOut(t);
      // pop-in scale with overshoot, then settle; fade out at the end
      const s = p.kind === 'score'
        ? popScale(p.age, 0.14, 1.25)
        : popScale(p.age, p.kind === 'combo' ? 0.22 : 0.18, 1.35);
      const fadeStart = p.kind === 'score' ? 0.55 : 0.72;
      const o = t < fadeStart ? Math.min(1, p.age * 25) : 1 - (t - fadeStart) / (1 - fadeStart);
      const mx = p.kind === 'score' ? 40 : 170;
      const my = p.kind === 'score' ? 30 : 90;
      x = Math.min(this.w - mx, Math.max(mx, x));
      y = Math.min(this.h - my, Math.max(my, y));
      p.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) rotate(${p.rot.toFixed(1)}deg) scale(${s.toFixed(3)})`;
      p.el.style.opacity = o.toFixed(3);
    }
  }

  dispose(): void {
    this.ro?.disconnect();
    this.root.remove();
  }
}

function easeOut(t: number): number { return 1 - (1 - t) * (1 - t); }

/** Elastic-ish pop: 0 -> peak -> 1 over `dur` seconds. */
function popScale(age: number, dur: number, peak: number): number {
  if (age >= dur * 2) return 1;
  if (age < dur) { const t = age / dur; return 0.2 + (peak - 0.2) * (1 - (1 - t) * (1 - t)); }
  const t = (age - dur) / dur;
  return peak + (1 - peak) * (t * (2 - t));
}
