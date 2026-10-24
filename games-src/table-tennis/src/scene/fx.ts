/**
 * Pooled, cheap effects: bounce ripples, hit sparks + flash, floor dust, point-won light pulse,
 * confetti, challenge target rings, trajectory guide dots.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NormalBlending,
  Object3D,
  PlaneGeometry,
  PointLight,
  Points,
  RingGeometry,
  CircleGeometry,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  Vector3,
  type Blending,
} from 'three';
import type { Side } from '../core/contracts';
import { HALF_L, PALETTE, TABLE } from '../core/contracts';
import { makeBlobTexture } from './textures';
import { clamp } from './util';

/** Shared uniform: pixels per world unit at distance 1 (set by Stage on resize). */
export const pointScale = { value: 600 };

const VERT = /* glsl */ `
attribute float size;
attribute vec4 rgba;
varying vec4 vC;
uniform float uScale;
void main() {
  vC = rgba;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = max(1.0, size * uScale / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = /* glsl */ `
varying vec4 vC;
uniform float uSoft;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  float a = 1.0 - smoothstep(1.0 - uSoft, 1.0, d);
  if (vC.a * a < 0.004) discard;
  gl_FragColor = vec4(vC.rgb, vC.a * a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/** A fixed-capacity point particle system with per-particle colour/alpha/size. */
export class ParticlePool {
  readonly points: Points;
  private pos: Float32Array;
  private col: Float32Array;
  private size: Float32Array;
  private vel: Float32Array;
  private life: Float32Array;
  private maxLife: Float32Array;
  private size0: Float32Array;
  private base: Float32Array;
  private next = 0;
  constructor(readonly cap: number, blending: Blending, soft: number, private gravity = -3, private drag = 2.5) {
    const g = new BufferGeometry();
    this.pos = new Float32Array(cap * 3);
    this.col = new Float32Array(cap * 4);
    this.size = new Float32Array(cap);
    this.vel = new Float32Array(cap * 3);
    this.life = new Float32Array(cap);
    this.maxLife = new Float32Array(cap);
    this.size0 = new Float32Array(cap);
    this.base = new Float32Array(cap * 4);
    g.setAttribute('position', new BufferAttribute(this.pos, 3).setUsage(DynamicDrawUsage));
    g.setAttribute('rgba', new BufferAttribute(this.col, 4).setUsage(DynamicDrawUsage));
    g.setAttribute('size', new BufferAttribute(this.size, 1).setUsage(DynamicDrawUsage));
    const m = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: { uScale: pointScale, uSoft: { value: soft } },
      transparent: true,
      depthWrite: false,
      blending,
    });
    this.points = new Points(g, m);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
  }
  emit(p: Vector3, v: Vector3, color: Color, alpha: number, size: number, life: number): void {
    const i = this.next;
    this.next = (this.next + 1) % this.cap;
    this.pos.set([p.x, p.y, p.z], i * 3);
    this.vel.set([v.x, v.y, v.z], i * 3);
    this.base.set([color.r, color.g, color.b, alpha], i * 4);
    this.life[i] = life;
    this.maxLife[i] = life;
    this.size0[i] = size;
  }
  clear(): void {
    this.life.fill(0);
    this.next = 0;
  }
  update(dt: number, grow = 0): void {
    const k = Math.exp(-this.drag * dt);
    for (let i = 0; i < this.cap; i++) {
      if (this.life[i] <= 0) {
        this.col[i * 4 + 3] = 0;
        this.size[i] = 0;
        continue;
      }
      this.life[i] -= dt;
      const f = clamp(this.life[i] / this.maxLife[i], 0, 1);
      this.vel[i * 3] *= k;
      this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * k + this.gravity * dt;
      this.vel[i * 3 + 2] *= k;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      this.col[i * 4] = this.base[i * 4];
      this.col[i * 4 + 1] = this.base[i * 4 + 1];
      this.col[i * 4 + 2] = this.base[i * 4 + 2];
      this.col[i * 4 + 3] = this.base[i * 4 + 3] * f;
      this.size[i] = this.size0[i] * (grow > 0 ? 1 + (1 - f) * grow : 0.4 + 0.6 * f);
    }
    const g = this.points.geometry;
    g.attributes.position.needsUpdate = true;
    g.attributes.rgba.needsUpdate = true;
    g.attributes.size.needsUpdate = true;
  }
}

interface Ripple { mesh: Mesh; t: number; dur: number; max: number }
interface Flash { s: Sprite; t: number; dur: number; scale: number }
interface Target { id: string; g: Group; ring: Mesh; disc: Mesh; t: number; popT: number; color: Color; radius: number }

const SIDE_COL: Record<Side, string> = { player: PALETTE.accent, opponent: PALETTE.accent2 };

export class FxSystem {
  readonly group = new Group();
  private ripples: Ripple[] = [];
  private flashes: Flash[] = [];
  private sparks = new ParticlePool(260, AdditiveBlending, 0.9, -4, 3);
  private dust = new ParticlePool(120, NormalBlending, 1.0, 0.25, 3.5);
  private hitLight: PointLight;
  private sideLights: Record<Side, PointLight>;
  private sideT: Record<Side, number> = { player: 9, opponent: 9 };
  private hitT = 9;
  private hitI = 0;
  private confetti: InstancedMesh;
  private conf: { p: Vector3; v: Vector3; r: Vector3; w: Vector3; life: number }[] = [];
  private confActive = 0;
  private targets = new Map<string, Target>();
  private traj: ParticlePool;
  private trajPoints: Vector3[] | null = null;
  private time = 0;
  onShake: (amount: number) => void = () => {};
  onPulse: (side: Side, color: string) => void = () => {};

  constructor(confettiCount = 260) {
    this.group.add(this.sparks.points, this.dust.points);
    const ringGeo = new RingGeometry(0.82, 1, 40);
    ringGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 10; i++) {
      const m = new Mesh(ringGeo, new MeshBasicMaterial({ color: '#ffffff', transparent: true, depthWrite: false, opacity: 0, side: DoubleSide }));
      m.visible = false;
      m.renderOrder = 4;
      this.group.add(m);
      this.ripples.push({ mesh: m, t: 1, dur: 1, max: 0.1 });
    }
    const glow = makeBlobTexture(64, 0.15);
    for (let i = 0; i < 5; i++) {
      const s = new Sprite(new SpriteMaterial({ map: glow, color: '#fff2d0', blending: AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
      s.visible = false;
      s.renderOrder = 6;
      this.group.add(s);
      this.flashes.push({ s, t: 1, dur: 1, scale: 0.2 });
    }
    this.hitLight = new PointLight('#fff1d6', 0, 3, 2);
    this.group.add(this.hitLight);
    this.sideLights = {
      player: new PointLight(PALETTE.accent, 0, 9, 1.4),
      opponent: new PointLight(PALETTE.accent2, 0, 9, 1.4),
    };
    this.sideLights.player.position.set(0, 2.3, HALF_L + 1.2);
    this.sideLights.opponent.position.set(0, 2.3, -HALF_L - 1.2);
    this.group.add(this.sideLights.player, this.sideLights.opponent);

    // confetti
    const cg = new PlaneGeometry(0.035, 0.022);
    this.confetti = new InstancedMesh(cg, new MeshStandardMaterial({ side: DoubleSide, roughness: 0.6, emissive: '#222222' }), confettiCount);
    const palette = [PALETTE.accent, PALETTE.accent2, PALETTE.gold, '#ffffff', PALETTE.good, '#8a7dff'];
    const c = new Color();
    for (let i = 0; i < confettiCount; i++) {
      this.confetti.setColorAt(i, c.set(palette[i % palette.length]));
      this.conf.push({ p: new Vector3(), v: new Vector3(), r: new Vector3(), w: new Vector3(), life: 0 });
    }
    this.confetti.visible = false;
    this.confetti.frustumCulled = false;
    this.group.add(this.confetti);

    this.traj = new ParticlePool(90, NormalBlending, 0.35, 0, 0);
    this.group.add(this.traj.points);
  }

  bounce(pos: Vector3, side: Side): void {
    const y = pos.y < 0.3 ? 0.004 : TABLE.height + 0.002;
    this.ripple(new Vector3(pos.x, y, pos.z), '#ffffff', 0.13, 0.5, 0.9);
    this.ripple(new Vector3(pos.x, y, pos.z), SIDE_COL[side === 'player' ? 'opponent' : 'player'], 0.075, 0.38, 0.55);
    const c = new Color('#ffffff');
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2;
      this.sparks.emit(pos, new Vector3(Math.cos(a) * 0.6, 0.5 + Math.random() * 0.5, Math.sin(a) * 0.6), c, 0.6, 0.02, 0.28);
    }
  }

  hit(pos: Vector3, power: number, side: Side): void {
    power = clamp(power, 0, 1);
    const big = power >= 0.8;
    const n = Math.round(8 + power * 22 + (big ? 20 : 0));
    const warm = new Color(PALETTE.gold);
    const sc = new Color(SIDE_COL[side]);
    const white = new Color('#fff6e0');
    const dirZ = side === 'player' ? -1 : 1;
    for (let i = 0; i < n; i++) {
      const v = new Vector3(Math.random() - 0.5, Math.random() - 0.3, Math.random() - 0.5).normalize().multiplyScalar(0.6 + Math.random() * (1.2 + power * 2.6));
      v.z += dirZ * power * 1.5;
      const col = i % 3 === 0 ? sc : i % 3 === 1 ? warm : white;
      this.sparks.emit(pos, v, col, 0.95, 0.022 + Math.random() * 0.02 + (big ? 0.014 : 0), 0.22 + Math.random() * 0.25 + power * 0.15);
    }
    const f = this.flashes.find((x) => x.t >= x.dur) ?? this.flashes[0];
    f.t = 0;
    f.dur = big ? 0.22 : 0.14;
    f.scale = 0.12 + power * 0.25 + (big ? 0.2 : 0);
    f.s.position.copy(pos);
    f.s.visible = true;
    (f.s.material as SpriteMaterial).color.set(big ? '#ffe2a8' : '#fff4dc');
    this.hitLight.position.copy(pos);
    this.hitLight.color.set(big ? PALETTE.gold : '#fff1d6');
    this.hitI = 1 + power * 3 + (big ? 4 : 0);
    this.hitT = 0;
    if (big) {
      this.ripple(pos.clone(), PALETTE.gold, 0.22, 0.3, 0.7, true);
      this.onShake(0.25 + (power - 0.8) * 2);
    }
  }

  net(_pos: Vector3): void {
    /* net wobble handled by TableView; small puff here */
    const c = new Color('#ffffff');
    for (let i = 0; i < 6; i++) {
      this.dust.emit(_pos, new Vector3((Math.random() - 0.5) * 0.4, Math.random() * 0.3, (Math.random() - 0.5) * 0.4), c, 0.35, 0.03, 0.4);
    }
  }

  floor(pos: Vector3): void {
    const c = new Color('#d8cbb5');
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 0.25 + Math.random() * 0.4;
      this.dust.emit(new Vector3(pos.x, 0.03, pos.z), new Vector3(Math.cos(a) * s, 0.15 + Math.random() * 0.25, Math.sin(a) * s), c, 0.4, 0.06 + Math.random() * 0.05, 0.6 + Math.random() * 0.4);
    }
    this.ripple(new Vector3(pos.x, 0.004, pos.z), '#ffffff', 0.18, 0.5, 0.35);
  }

  pointWon(side: Side): void {
    this.sideT[side] = 0;
    this.onPulse(side, SIDE_COL[side]);
  }

  confettiBurst(): void {
    this.confActive = 4.5;
    this.confetti.visible = true;
    for (let i = 0; i < this.conf.length; i++) {
      const c = this.conf[i];
      const s = i % 2 === 0 ? 1 : -1;
      c.p.set((Math.random() - 0.5) * 1.6, 0.9 + Math.random() * 0.3, s * (HALF_L + 0.4) * Math.random());
      c.v.set((Math.random() - 0.5) * 3, 3.5 + Math.random() * 3, (Math.random() - 0.5) * 3);
      c.r.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      c.w.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14);
      c.life = 2.8 + Math.random() * 1.6;
    }
  }

  setTrajectory(points: Vector3[] | null): void {
    this.trajPoints = points && points.length > 1 ? points : null;
  }

  setTargets(list: { id: string; pos: Vector3; radius: number; color?: string }[]): void {
    const keep = new Set(list.map((t) => t.id));
    for (const [id, t] of this.targets) {
      if (!keep.has(id) && t.popT < 0) {
        this.disposeTarget(t);
        this.targets.delete(id);
      }
    }
    for (const d of list) {
      let t = this.targets.get(d.id);
      if (!t) {
        const g = new Group();
        const col = new Color(d.color ?? PALETTE.gold);
        const ring = new Mesh(new RingGeometry(0.86, 1, 48).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: col, transparent: true, depthWrite: false }));
        const disc = new Mesh(new CircleGeometry(0.86, 48).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: col, transparent: true, opacity: 0.22, depthWrite: false }));
        const dot = new Mesh(new CircleGeometry(0.16, 24).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.9, depthWrite: false }));
        const inner = new Mesh(new RingGeometry(0.42, 0.5, 40).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, depthWrite: false }));
        dot.position.y = inner.position.y = 0.0005;
        g.add(disc, ring, inner, dot);
        g.renderOrder = 3;
        g.traverse((o) => (o.renderOrder = 3));
        this.group.add(g);
        t = { id: d.id, g, ring, disc, t: 0, popT: -1, color: col, radius: d.radius };
        this.targets.set(d.id, t);
      }
      t.radius = d.radius;
      t.g.position.set(d.pos.x, TABLE.height + 0.0025, d.pos.z);
      if (d.color) t.color.set(d.color);
    }
  }

  hitTarget(id: string): void {
    const t = this.targets.get(id);
    if (!t || t.popT >= 0) return;
    t.popT = 0;
    const p = t.g.position.clone();
    p.y += 0.02;
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      this.sparks.emit(p, new Vector3(Math.cos(a) * 1.6, 1 + Math.random(), Math.sin(a) * 1.6), t.color, 1, 0.02, 0.5);
    }
    this.ripple(p, '#ffffff', t.radius * 2.2, 0.45, 0.9);
  }

  private disposeTarget(t: Target): void {
    t.g.removeFromParent();
    t.g.traverse((o) => {
      const m = o as Mesh;
      if (m.isMesh) {
        m.geometry.dispose();
        (m.material as MeshBasicMaterial).dispose();
      }
    });
  }

  private ripple(pos: Vector3, color: string, max: number, dur: number, alpha: number, face = false): void {
    const r = this.ripples.find((x) => x.t >= x.dur) ?? this.ripples[0];
    r.t = 0;
    r.dur = dur;
    r.max = max;
    r.mesh.position.copy(pos);
    r.mesh.visible = true;
    r.mesh.rotation.set(face ? Math.PI / 2 : 0, 0, 0);
    const m = r.mesh.material as MeshBasicMaterial;
    m.color.set(color);
    m.userData.alpha = alpha;
  }

  update(dt: number): void {
    this.time += dt;
    for (const r of this.ripples) {
      if (r.t >= r.dur) continue;
      r.t += dt;
      const f = clamp(r.t / r.dur, 0, 1);
      const e = 1 - (1 - f) ** 3;
      const s = 0.01 + r.max * e;
      r.mesh.scale.set(s, s, s);
      (r.mesh.material as MeshBasicMaterial).opacity = (1 - f) ** 1.5 * ((r.mesh.material as MeshBasicMaterial).userData.alpha ?? 1);
      if (f >= 1) r.mesh.visible = false;
    }
    for (const fl of this.flashes) {
      if (fl.t >= fl.dur) continue;
      fl.t += dt;
      const f = clamp(fl.t / fl.dur, 0, 1);
      const s = fl.scale * (0.6 + f * 0.8);
      fl.s.scale.set(s, s, s);
      (fl.s.material as SpriteMaterial).opacity = (1 - f) ** 2;
      if (f >= 1) fl.s.visible = false;
    }
    this.hitT += dt;
    this.hitLight.intensity = this.hitT < 0.25 ? this.hitI * (1 - this.hitT / 0.25) ** 2 : 0;
    for (const s of ['player', 'opponent'] as Side[]) {
      this.sideT[s] += dt;
      const t = this.sideT[s];
      this.sideLights[s].intensity = t < 1.4 ? 9 * Math.sin(Math.min(1, t / 0.15) * Math.PI * 0.5) * (1 - t / 1.4) ** 1.5 : 0;
    }
    this.sparks.update(dt);
    this.dust.update(dt, 1.5);

    // confetti
    if (this.confActive > 0) {
      this.confActive -= dt;
      const m = new Matrix4();
      const o = new Object3D();
      for (let i = 0; i < this.conf.length; i++) {
        const c = this.conf[i];
        c.life -= dt;
        if (c.life > 0) {
          c.v.y -= 6 * dt;
          c.v.multiplyScalar(Math.exp(-2.2 * dt));
          c.v.x += Math.sin(this.time * 3 + i) * 0.6 * dt;
          if (c.v.y < -1.1) c.v.y = -1.1;
          c.p.addScaledVector(c.v, dt);
          if (c.p.y < 0.01) {
            c.p.y = 0.01;
            c.v.set(0, 0, 0);
          }
          c.r.addScaledVector(c.w, dt);
          o.position.copy(c.p);
          o.rotation.set(c.r.x, c.r.y, c.r.z);
          o.scale.setScalar(Math.min(1, c.life * 2));
        } else o.scale.setScalar(0);
        o.updateMatrix();
        m.copy(o.matrix);
        this.confetti.setMatrixAt(i, m);
      }
      this.confetti.instanceMatrix.needsUpdate = true;
      if (this.confActive <= 0) this.confetti.visible = false;
    }

    // targets
    for (const [id, t] of this.targets) {
      t.t += dt;
      const breathe = 1 + Math.sin(t.t * 3) * 0.04;
      if (t.popT >= 0) {
        t.popT += dt;
        const f = clamp(t.popT / 0.45, 0, 1);
        const s = t.radius * (1 + f * 0.8);
        t.g.scale.set(s, 1, s);
        t.g.traverse((o) => {
          const m = o as Mesh;
          if (m.isMesh) (m.material as MeshBasicMaterial).opacity = (1 - f) * (m === t.disc ? 0.3 : 0.9);
        });
        if (f >= 1) {
          this.disposeTarget(t);
          this.targets.delete(id);
        }
      } else {
        const appear = clamp(t.t / 0.3, 0, 1);
        const s = t.radius * breathe * (0.5 + 0.5 * appear);
        t.g.scale.set(s, 1, s);
        (t.ring.material as MeshBasicMaterial).color.copy(t.color);
        (t.disc.material as MeshBasicMaterial).color.copy(t.color);
        (t.disc.material as MeshBasicMaterial).opacity = 0.18 + 0.08 * Math.sin(t.t * 3);
      }
    }

    // trajectory dots — march along the path
    const pts = this.trajPoints;
    const cap = this.traj.cap;
    if (pts) {
      const lens: number[] = [0];
      for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + pts[i].distanceTo(pts[i - 1]));
      const total = lens[lens.length - 1];
      const spacing = 0.06;
      const offset = (this.time * 0.25) % spacing;
      const white = new Color('#ffffff');
      this.traj.clear();
      let k = 0;
      let seg = 1;
      for (let d = offset; d < total && k < cap; d += spacing, k++) {
        while (seg < pts.length - 1 && lens[seg] < d) seg++;
        const a = pts[seg - 1];
        const b = pts[seg];
        const l = lens[seg] - lens[seg - 1];
        const f = l > 1e-6 ? (d - lens[seg - 1]) / l : 0;
        const p = new Vector3().lerpVectors(a, b, f);
        const fade = (1 - d / total) ** 1.2;
        this.traj.emit(p, new Vector3(), white, 0.85 * fade, 0.016, 0.0001);
      }
      this.traj.update(0);
    } else {
      this.traj.clear();
      this.traj.update(0);
    }
  }
}
