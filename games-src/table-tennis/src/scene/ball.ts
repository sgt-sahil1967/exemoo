/**
 * Ball view: spinning textured sphere, contact-shadow blob, ribbon motion trail tinted by spin.
 */
import {
  BufferAttribute,
  BufferGeometry,
  Camera,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three';
import { BALL, HALF_L, HALF_W, PALETTE, TABLE } from '../core/contracts';
import { makeBallTexture, makeBlobTexture } from './textures';
import { clamp } from './util';

const TRAIL_N = 26;
const TRAIL_TIME = 0.16; // seconds of history
const VISUAL_SCALE = 1.25;

export class BallView {
  readonly group = new Group();
  private mesh: Mesh;
  private shadow: Mesh;
  private trail: Mesh;
  private trailPos: Float32Array;
  private trailCol: Float32Array;
  private hist: { p: Vector3; t: number }[] = [];
  private pos = new Vector3();
  private spin = new Vector3();
  private vel = new Vector3();
  private visible = false;
  private time = 0;
  private lastSet = new Vector3();
  private hasLast = false;
  private spinTint = 0;
  private warm = new Color(PALETTE.gold).lerp(new Color(PALETTE.accent), 0.45);
  private cool = new Color('#7fd8ff');
  private neutral = new Color('#ffffff');
  private slow = 0; // slow-mo look 0..1: longer, brighter trail

  constructor() {
    const tex = makeBallTexture();
    this.mesh = new Mesh(
      new SphereGeometry(BALL.radius * VISUAL_SCALE, 20, 14),
      new MeshStandardMaterial({ map: tex, roughness: 0.35, emissive: new Color('#fff3dc'), emissiveIntensity: 0.18 }),
    );
    this.mesh.castShadow = true;
    this.group.add(this.mesh);

    this.shadow = new Mesh(
      new PlaneGeometry(1, 1),
      new MeshBasicMaterial({ color: '#0b1020', alphaMap: makeBlobTexture(64), transparent: true, depthWrite: false, opacity: 0.5 }),
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.renderOrder = 2;
    this.group.add(this.shadow);

    const g = new BufferGeometry();
    this.trailPos = new Float32Array(TRAIL_N * 2 * 3);
    this.trailCol = new Float32Array(TRAIL_N * 2 * 4);
    g.setAttribute('position', new BufferAttribute(this.trailPos, 3).setUsage(DynamicDrawUsage));
    g.setAttribute('color', new BufferAttribute(this.trailCol, 4).setUsage(DynamicDrawUsage));
    const idx: number[] = [];
    for (let i = 0; i < TRAIL_N - 1; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    g.setIndex(idx);
    this.trail = new Mesh(
      g,
      new MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: DoubleSide, toneMapped: false }),
    );
    this.trail.frustumCulled = false;
    this.trail.renderOrder = 3;
    this.group.add(this.trail);
  }

  set(pos: Vector3, spin: Vector3, visible: boolean): void {
    if (visible && this.hasLast && pos.distanceTo(this.lastSet) > 1.2) this.hist.length = 0; // teleport
    if (!visible) this.hist.length = 0;
    this.pos.copy(pos);
    this.spin.copy(spin);
    this.visible = visible;
    this.lastSet.copy(pos);
    this.hasLast = visible;
  }

  update(dt: number, camera: Camera): void {
    this.time += dt;
    const vis = this.visible;
    this.mesh.visible = vis;
    this.shadow.visible = vis;
    this.trail.visible = vis;
    if (!vis) return;
    this.mesh.position.copy(this.pos);

    // velocity estimate from history
    const h = this.hist;
    const last = h[h.length - 1];
    if (!last || last.p.distanceToSquared(this.pos) > 1e-10 || this.time - last.t > 0.03) {
      h.push({ p: this.pos.clone(), t: this.time });
    }
    while (h.length > 2 && this.time - h[0].t > TRAIL_TIME * (1 + this.slow * 1.8)) h.shift();
    if (h.length >= 2) {
      const a = h[Math.max(0, h.length - 3)];
      const b = h[h.length - 1];
      const ddt = b.t - a.t;
      if (ddt > 1e-4) this.vel.subVectors(b.p, a.p).multiplyScalar(1 / ddt);
    }

    // visual spin (aliasing-safe)
    const w = this.spin.length();
    if (w > 1e-3 && dt > 0) {
      const rate = Math.min(w * 0.06, 28);
      const q = new Quaternion().setFromAxisAngle(this.spin.clone().multiplyScalar(1 / w), rate * dt);
      this.mesh.quaternion.premultiply(q);
    }

    // contact shadow
    const overTable = Math.abs(this.pos.x) < HALF_W && Math.abs(this.pos.z) < HALF_L && this.pos.y > TABLE.height - 0.01;
    const groundY = overTable ? TABLE.height + 0.0015 : 0.003;
    const hgt = Math.max(0, this.pos.y - groundY);
    const s = 0.05 + hgt * 0.09;
    this.shadow.position.set(this.pos.x, groundY, this.pos.z);
    this.shadow.scale.set(s, s, 1);
    (this.shadow.material as MeshBasicMaterial).opacity = clamp(0.55 - hgt * 0.45, 0.06, 0.55);

    // spin tint: topspin = spin component along (up × v̂)
    const sp = Math.hypot(this.vel.x, this.vel.y, this.vel.z);
    let top = 0;
    if (sp > 0.5) {
      const ax = new Vector3(0, 1, 0).cross(this.vel).normalize();
      top = this.spin.dot(ax) / 350;
    }
    this.spinTint += (clamp(top, -1, 1) - this.spinTint) * Math.min(1, dt * 10);

    this.ribbon(camera);
  }

  /** Slow-mo look 0..1: trail history up to ~2.8x longer and brighter. */
  setSlowMo(k: number): void {
    this.slow = clamp(k, 0, 1);
  }

  /** Re-orient the trail ribbon towards another camera (second split viewport). */
  faceCamera(camera: Camera): void {
    if (this.visible) this.ribbon(camera);
  }

  private ribbon(camera: Camera): void {
    const h = this.hist;
    const sp = Math.hypot(this.vel.x, this.vel.y, this.vel.z);
    const camPos = camera.position;
    const n = h.length;
    const col = new Color();
    const tint = this.spinTint >= 0 ? this.warm : this.cool;
    const speedA = clamp((sp - 2) / 8, 0, 1);
    const boost = 1 + this.slow * 0.6;
    const tmp = new Vector3();
    const side = new Vector3();
    const view = new Vector3();
    for (let i = 0; i < TRAIL_N; i++) {
      // sample along history, newest at i = 0
      const f = i / (TRAIL_N - 1);
      let p: Vector3;
      if (n >= 2) {
        const fi = (1 - f) * (n - 1);
        const i0 = Math.floor(fi);
        const i1 = Math.min(n - 1, i0 + 1);
        p = tmp.lerpVectors(h[i0].p, h[i1].p, fi - i0);
      } else p = tmp.copy(this.pos);
      if (i === 0) p = tmp.copy(this.pos);
      // tangent
      const j0 = Math.max(0, Math.floor((1 - f) * (n - 1)) - 1);
      const j1 = Math.min(n - 1, j0 + 2);
      const tan = n >= 2 ? new Vector3().subVectors(h[j1].p, h[j0].p) : new Vector3(0, 0, 1);
      if (tan.lengthSq() < 1e-10) tan.set(0, 0, 1);
      view.subVectors(camPos, p);
      side.crossVectors(tan, view).normalize();
      const width = BALL.radius * VISUAL_SCALE * 0.95 * (1 - f) ** 0.7;
      const o = i * 6;
      this.trailPos[o] = p.x + side.x * width;
      this.trailPos[o + 1] = p.y + side.y * width;
      this.trailPos[o + 2] = p.z + side.z * width;
      this.trailPos[o + 3] = p.x - side.x * width;
      this.trailPos[o + 4] = p.y - side.y * width;
      this.trailPos[o + 5] = p.z - side.z * width;
      col.copy(this.neutral).lerp(tint, Math.min(1, Math.abs(this.spinTint) * 1.2) * (0.35 + 0.65 * f));
      const a = Math.min(1, (1 - f) ** 1.6 * 0.75 * speedA * boost);
      for (let k = 0; k < 2; k++) {
        const c = i * 8 + k * 4;
        this.trailCol[c] = col.r;
        this.trailCol[c + 1] = col.g;
        this.trailCol[c + 2] = col.b;
        this.trailCol[c + 3] = a;
      }
    }
    const g = this.trail.geometry;
    g.attributes.position.needsUpdate = true;
    g.attributes.color.needsUpdate = true;
  }
}
