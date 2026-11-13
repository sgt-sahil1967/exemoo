// Back2Back camera director: scripted shots layered over the chase camera with critically-damped
// blending, a sim time-scale request, camera roll, and a letterbox + caption overlay.
import * as THREE from 'three';
import './cine.css';
import { trackToWorld } from './track';

export type Shot = 'intro' | 'boss' | 'bossDown' | 'zone' | 'crash';
export interface CineBase { pos: THREE.Vector3; look: THREE.Vector3; fov: number }
export interface CineCtx { dt: number; carPos: THREE.Vector3; carYaw: number; speed: number; D: number; carRel: number; bossPos?: THREE.Vector3 | null }
export interface CineOut { pos: THREE.Vector3; look: THREE.Vector3; fov: number; active: boolean; timeScale: number; roll: number }

const MIN_Y = 0.8;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => { const t = clamp01(v); return t * t * (3 - 2 * t); };
const smoother = (v: number) => { const t = clamp01(v); return t * t * t * (t * (t * 6 - 15) + 10); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface Raw { pos: THREE.Vector3; look: THREE.Vector3; fov: number; roll: number; ts: number }
interface ShotDef {
  dur: number; // seconds; Infinity = stays until skip()
  blendIn: number; // damping time of the blend-in (s)
  outro: number; // seconds before the end when the blend back to chase starts (0 = none)
  bars: boolean;
  capIn: number; capOut: number; // caption visible window (s)
  fill(t: number, u: number, base: CineBase, c: CineCtx, r: Raw, st: Held): void;
}
/** Per-play data captured when the shot starts so paths stay stable while the car moves on. */
interface Held { bossPos: THREE.Vector3; sideSign: number; startAng: number }

const t1 = new THREE.Vector3();
const t2 = new THREE.Vector3();
const fwdOf = (yaw: number, out: THREE.Vector3) => out.set(-Math.sin(yaw), 0, -Math.cos(yaw));

const SHOTS: Record<Shot, ShotDef> = {
  // Low crane sweeping round the buggy that lands exactly on the chase camera (offset -> 0 at u=1).
  intro: {
    dur: 2.8, blendIn: 0.12, outro: 0, bars: true, capIn: 0, capOut: 0,
    fill(_t, u, base, c, r, st) {
      const e = smoother(u);
      const k = 1 - e; // remaining offset from the chase cam
      // Start point: front-left of the car, low. Rotate around the car towards the chase position.
      const ang = st.startAng * k;
      const rel = t1.copy(base.pos).sub(c.carPos); // chase offset (behind + above)
      const baseR = Math.hypot(rel.x, rel.z);
      const baseAng = Math.atan2(rel.x, rel.z);
      const radius = lerp(baseR, 8.5, k);
      const a = baseAng + ang;
      r.pos.set(c.carPos.x + Math.sin(a) * radius, lerp(base.pos.y, 1.5, k * k) + Math.sin(u * Math.PI) * 1.2, c.carPos.z + Math.cos(a) * radius);
      r.look.copy(base.look).lerp(t2.copy(c.carPos).setY(1.3), clamp01(k * 1.15));
      r.fov = base.fov - 14 * k; // lens pulls out to the game fov
      r.roll = 0.06 * Math.sin(k * Math.PI);
      r.ts = 1;
    },
  },
  // Whip-pan to the boss, low heroic angle with dutch roll, slow-mo, then back to the chase cam.
  boss: {
    dur: 3.2, blendIn: 0.16, outro: 0.95, bars: true, capIn: 0.55, capOut: 2.7,
    fill(t, u, base, c, r, st) {
      const bp = st.bossPos;
      const drift = t * 0.7;
      // Hero spot: ahead-side of the boss on the car's side, ground level, looking up.
      r.pos.set(bp.x + st.sideSign * (9 - drift * 0.6), 1.1 + drift * 0.12, bp.z + 17 - drift * 1.6);
      // Whip: look swings from the chase target to the boss in the first ~0.45 s.
      const whip = smoother(t / 0.45);
      r.look.copy(base.look).lerp(t1.set(bp.x, bp.y + 3.4, bp.z), whip);
      r.fov = lerp(base.fov, 52, smooth(t / 0.5)) - 5 * smooth(u);
      r.roll = st.sideSign * 0.2 * smooth(t / 0.6);
      const down = smooth((t - 1.9) / 1.1);
      r.ts = 1 - 0.65 * smooth(t / 0.28) * (1 - down);
    },
  },
  // Slow-mo orbit of the dying boss with a push-in.
  bossDown: {
    dur: 2.6, blendIn: 0.2, outro: 0.8, bars: true, capIn: 0.2, capOut: 1.9,
    fill(t, u, _base, _c, r, st) {
      const bp = st.bossPos;
      const ang = st.startAng + u * 1.7 * st.sideSign;
      const rad = lerp(26, 13, smoother(u));
      r.pos.set(bp.x + Math.sin(ang) * rad, 3.2 + 2.2 * (1 - u), bp.z + Math.cos(ang) * rad);
      r.look.set(bp.x, bp.y + 2.4, bp.z);
      r.fov = lerp(62, 48, smooth(u));
      r.roll = st.sideSign * 0.08 * Math.sin(u * Math.PI);
      r.ts = 1 - 0.85 * smooth(t / 0.2) * (1 - smooth((t - 1.8) / 0.8));
    },
  },
  // Quick side tracking shot sliding from behind the car to ahead of it.
  zone: {
    dur: 1.8, blendIn: 0.14, outro: 0.55, bars: true, capIn: 0.15, capOut: 1.5,
    fill(t, u, _base, c, r, st) {
      const f = fwdOf(c.carYaw, t1);
      const right = t2.set(-f.z, 0, f.x).multiplyScalar(st.sideSign); // perpendicular
      const along = lerp(-9, 10, smoother(u));
      const side = lerp(11, 8, smooth(u));
      r.pos.copy(c.carPos).addScaledVector(f, along).addScaledVector(right, side);
      r.pos.y = lerp(1.6, 3.4, smooth(u));
      r.look.copy(c.carPos).addScaledVector(f, 3).setY(1.4);
      r.fov = lerp(48, 58, smooth(u));
      r.roll = st.sideSign * 0.05 * Math.sin(u * Math.PI);
      r.ts = lerp(1, 0.7, smooth(t / 0.2));
    },
  },
  // Game over: swing around the wreck, slow-mo pull-back, never returns.
  crash: {
    dur: Infinity, blendIn: 0.3, outro: 0, bars: true, capIn: 0.6, capOut: Infinity,
    fill(t, _u, base, c, r, st) {
      if (Number.isNaN(st.startAng)) st.startAng = Math.atan2(base.pos.x - c.carPos.x, base.pos.z - c.carPos.z);
      const ang = st.startAng + st.sideSign * (1.3 * smoother(t / 3) + Math.max(0, t - 3) * 0.12);
      const rad = lerp(7.5, 15, smoother(t / 3.2));
      const k = smooth(t / 0.6);
      r.pos.set(c.carPos.x + Math.sin(ang) * rad, lerp(3.4, 5.6, smoother(t / 3)), c.carPos.z + Math.cos(ang) * rad);
      r.look.copy(c.carPos).setY(1.1);
      r.fov = lerp(base.fov, 50, k);
      r.roll = st.sideSign * 0.05 * k;
      r.ts = lerp(1, 0.3, smooth(t / 0.35));
    },
  },
};

/** Critically-damped scalar spring (Unity SmoothDamp). */
function damp(cur: number, target: number, vel: { v: number }, smoothTime: number, dt: number): number {
  const om = 2 / Math.max(0.0001, smoothTime);
  const x = om * dt;
  const ex = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = cur - target;
  const temp = (vel.v + om * change) * dt;
  vel.v = (vel.v - om * temp) * ex;
  return target + (change + temp) * ex;
}

export class Cine {
  private readonly out: CineOut = { pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 62, active: false, timeScale: 1, roll: 0 };
  private readonly raw: Raw = { pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 62, roll: 0, ts: 1 };
  private readonly held: Held = { bossPos: new THREE.Vector3(), sideSign: 1, startAng: 0 };
  private shot: Shot | null = null;
  private def: ShotDef | null = null;
  private t = 0;
  private w = 0; // blend weight 0 = chase cam, 1 = shot
  private wv = { v: 0 };
  private ts = 1; // smoothed time scale
  private tsv = { v: 0 };
  private roll = 0;
  private lastCtx: CineCtx | null = null;
  private leaving = false;
  private readonly root: HTMLDivElement;
  private readonly title: HTMLDivElement;
  private readonly sub: HTMLDivElement;
  private caption = '';
  private subText = '';

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'cine-root';
    this.root.innerHTML = '<div class="cine-bar top"></div><div class="cine-bar bot"></div><div class="cine-cap"><div class="cine-title"></div><div class="cine-sub"></div></div>';
    this.title = this.root.querySelector('.cine-title') as HTMLDivElement;
    this.sub = this.root.querySelector('.cine-sub') as HTMLDivElement;
    parent.appendChild(this.root);
  }

  get active(): boolean {
    return this.shot !== null;
  }

  play(shot: Shot, opts?: { caption?: string; sub?: string }): void {
    const def = SHOTS[shot];
    this.shot = shot;
    this.def = def;
    this.t = 0;
    this.leaving = false;
    this.w = 0;
    this.ts = 1;
    this.tsv.v = 0;
    this.roll = 0;
    this.raw.ts = 1;
    this.caption = opts?.caption ?? '';
    this.subText = opts?.sub ?? '';
    this.title.textContent = this.caption;
    this.sub.textContent = this.subText;
    this.root.classList.remove('cap');
    this.root.classList.toggle('on', def.bars);
    this.wv.v = 0;
    this.held.sideSign = Math.random() < 0.5 ? -1 : 1;
    // Per-shot start angles (radians around the subject).
    if (shot === 'intro') this.held.startAng = this.held.sideSign * (2.3 + Math.random() * 0.4);
    else if (shot === 'bossDown') this.held.startAng = Math.random() * 0.8 - 0.4;
    else if (shot === 'crash') this.held.startAng = NaN; // taken from the chase camera on the first frame
    // Boss anchor: captured now; refreshed each frame if ctx supplies one (see update).
    if (this.lastCtx?.bossPos) this.held.bossPos.copy(this.lastCtx.bossPos);
  }

  /** End the current shot: blend back to the chase camera (also needed to leave 'crash'). */
  skip(): void {
    if (!this.shot) return;
    this.leaving = true;
    this.root.classList.remove('on', 'cap');
  }

  update(base: CineBase, ctx: CineCtx): CineOut {
    this.lastCtx = ctx;
    const o = this.out;
    const dt = Math.min(0.05, Math.max(0, ctx.dt));
    const def = this.def;
    if (!this.shot || !def) {
      o.pos.copy(base.pos); o.look.copy(base.look); o.fov = base.fov;
      o.active = false; o.timeScale = 1; o.roll = 0;
      return o;
    }

    this.t += dt;
    const t = this.t;
    const u = Number.isFinite(def.dur) ? clamp01(t / def.dur) : clamp01(t / 4);
    if (this.shot === 'boss' || this.shot === 'bossDown') {
      if (ctx.bossPos) this.held.bossPos.copy(ctx.bossPos);
      else if (this.held.bossPos.lengthSq() === 0) trackToWorld(ctx.D + 70, 0, 2, this.held.bossPos);
    }
    def.fill(t, u, base, ctx, this.raw, this.held);

    const outroAt = def.dur - def.outro;
    if (!this.leaving && t >= def.dur) { this.leaving = true; this.root.classList.remove('on', 'cap'); }
    const fading = this.leaving || (def.outro > 0 && t >= outroAt);
    if (fading) this.root.classList.remove('on');
    const capOn = !fading && (this.caption || this.subText) && t >= def.capIn && t < def.capOut;
    this.root.classList.toggle('cap', !!capOn);

    const target = fading ? 0 : 1;
    this.w = clamp01(damp(this.w, target, this.wv, fading ? (this.leaving && def.outro === 0 ? 0.25 : 0.3) : def.blendIn, dt));
    this.ts = damp(this.ts, this.leaving ? 1 : this.raw.ts, this.tsv, this.leaving ? 0.3 : 0.1, dt);
    this.roll = lerp(this.roll, this.leaving ? 0 : this.raw.roll, Math.min(1, dt * 6));

    if (this.leaving && this.w < 0.004) {
      this.shot = null; this.def = null; this.w = 0; this.wv.v = 0; this.ts = 1; this.roll = 0;
      o.pos.copy(base.pos); o.look.copy(base.look); o.fov = base.fov;
      o.active = false; o.timeScale = 1; o.roll = 0;
      return o;
    }

    const w = this.w;
    o.pos.copy(base.pos).lerp(this.raw.pos, w);
    o.look.copy(base.look).lerp(this.raw.look, w);
    o.pos.y = Math.max(MIN_Y, o.pos.y);
    o.fov = lerp(base.fov, this.raw.fov, w);
    o.roll = this.roll * w;
    o.timeScale = this.ts;
    o.active = true;
    return o;
  }
}

export function createCine(overlayParent?: HTMLElement): Cine {
  return new Cine(overlayParent ?? document.body);
}
