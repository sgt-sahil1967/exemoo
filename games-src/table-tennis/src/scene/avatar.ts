/**
 * Stylised low-poly character: capsule torso, sphere head, rounded limbs, shoes.
 * Two-bone IK for arms (paddle hand → paddle grip) and legs (planted feet that step).
 *
 * The avatar's limbs are placed in world space (children of `group`, which stays at identity).
 * `root` carries the body position + facing (model forward = local +Z).
 */
import {
  CapsuleGeometry,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  type Material,
} from 'three';
import type { AvatarPose, Handedness, Side } from '../core/contracts';
import { HALF_L, PALETTE } from '../core/contracts';
import { GRIP_Y, makePaddle } from './paddle';
import { clamp, damp, placeBetween, smooth } from './util';

const UPPER = 0.27;
const FORE = 0.26;
const THIGH = 0.4;
const SHIN = 0.4;
const ANKLE = 0.075;
const SHOULDER_Y = 0.43; // above pelvis
const SHOULDER_X = 0.215;

export type Mood = 'idle' | 'cheer' | 'sad';

interface Foot {
  pos: Vector3;
  from: Vector3;
  to: Vector3;
  t: number;
  stepping: boolean;
  mesh: Object3D;
}

const _a = new Vector3();
const _c = new Vector3();
const _n = new Vector3();
const _p = new Vector3();
const _q = new Quaternion();
const _q2 = new Quaternion();
const _yaw = new Quaternion();
const Y = new Vector3(0, 1, 0);

/** Two-bone IK in world space. Writes elbow + end positions. */
function solveIK(s: Vector3, target: Vector3, a: number, b: number, pole: Vector3, outMid: Vector3, outEnd: Vector3): void {
  _n.subVectors(target, s);
  let d = _n.length();
  const maxD = (a + b) * 0.999;
  const minD = Math.abs(a - b) + 0.02;
  if (d < 1e-5) {
    _n.set(0, -1, 0);
    d = minD;
  } else _n.multiplyScalar(1 / d);
  d = clamp(d, minD, maxD);
  const cosA = clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1);
  const sinA = Math.sqrt(1 - cosA * cosA);
  _p.copy(pole).addScaledVector(_n, -pole.dot(_n));
  if (_p.lengthSq() < 1e-8) _p.set(0, -1, 0).addScaledVector(_n, -_n.y);
  _p.normalize();
  outMid.copy(s).addScaledVector(_n, a * cosA).addScaledVector(_p, a * sinA);
  outEnd.copy(s).addScaledVector(_n, d);
}

export class Avatar {
  readonly group = new Group();
  readonly root = new Group();
  readonly paddle: Group;
  private pelvis = new Group();
  private spine = new Group();
  private head = new Group();
  private jerseyMat: MeshStandardMaterial;
  private bandMat: MeshStandardMaterial;
  private mats: MeshStandardMaterial[] = [];
  private bodyMeshes: Mesh[] = [];
  private ghostMeshes: Mesh[] = [];

  private upperArm: [Mesh, Mesh];
  private foreArm: [Mesh, Mesh];
  private hand: [Mesh, Mesh];
  private thigh: [Mesh, Mesh];
  private shin: [Mesh, Mesh];
  private feet: [Foot, Foot];

  // inputs
  private body = new Vector3();
  private prevBody = new Vector3();
  private vel = new Vector3();
  private padPos = new Vector3();
  private padRot = new Quaternion();
  private backhand = 0;
  private backhandTarget = 0;
  private handed: Handedness = 'right';
  private swing = 0;
  private mood: Mood = 'idle';
  private moodT = 0;
  private moodW = 0;
  private time = Math.random() * 10;
  private yaw: number;
  private twist = 0;
  private leanX = 0.1;
  private leanZ = 0;
  private first = true;

  constructor(readonly side: Side, jersey: string) {
    this.yaw = side === 'player' ? Math.PI : 0;
    const skin = side === 'player' ? '#f0c3a0' : '#c58c66';
    const hair = side === 'player' ? '#3b2a20' : '#1d1b22';
    this.jerseyMat = this.m(jersey, 0.7);
    const shorts = this.m('#283252', 0.8);
    const skinM = this.m(skin, 0.75);
    const hairM = this.m(hair, 0.85);
    const shoeM = this.m('#f7f5f0', 0.6);
    this.bandMat = this.m(side === 'player' ? '#ffffff' : PALETTE.gold, 0.6);
    const soleM = this.m(PALETTE.ink, 0.8);
    this.group.add(this.root);
    this.root.add(this.pelvis);
    this.pelvis.add(this.spine);

    // pelvis / shorts
    const hips = this.part(new CapsuleGeometry(0.15, 0.04, 4, 14), shorts, this.pelvis);
    hips.position.y = 0.03;
    hips.scale.set(1.05, 0.9, 0.78);
    // torso
    const torso = this.part(new CapsuleGeometry(0.175, 0.24, 6, 16), this.jerseyMat, this.spine);
    torso.position.y = 0.26;
    torso.scale.set(1.08, 1, 0.78);
    // jersey stripe (collar)
    const collar = this.part(new TorusGeometry(0.075, 0.018, 6, 16), this.bandMat, this.spine);
    collar.position.y = 0.505;
    collar.rotation.x = Math.PI / 2;
    // neck + head
    const neck = this.part(new CylinderGeometry(0.05, 0.055, 0.08, 10), skinM, this.spine);
    neck.position.y = 0.53;
    this.spine.add(this.head);
    this.head.position.y = 0.56;
    const headM = this.part(new SphereGeometry(0.125, 18, 14), skinM, this.head);
    headM.position.y = 0.12;
    headM.scale.set(1, 1.06, 1);
    const hairCap = this.part(new SphereGeometry(0.132, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), hairM, this.head);
    hairCap.position.set(0, 0.13, -0.012);
    hairCap.rotation.x = -0.32;
    const band = this.part(new TorusGeometry(0.128, 0.016, 6, 22), this.bandMat, this.head);
    band.position.set(0, 0.155, 0.0);
    band.rotation.x = Math.PI / 2 - 0.3;
    // minimal face: two eyes
    for (const s of [-1, 1]) {
      const eye = this.part(new SphereGeometry(0.013, 8, 6), soleM, this.head);
      eye.position.set(s * 0.042, 0.125, 0.115);
      eye.scale.set(1, 1.4, 0.6);
    }
    const nose = this.part(new SphereGeometry(0.018, 8, 6), skinM, this.head);
    nose.position.set(0, 0.095, 0.125);

    // limbs (world space)
    const ua = new CapsuleGeometry(0.052, UPPER, 4, 12);
    const fa = new CapsuleGeometry(0.043, FORE, 4, 12);
    const hd = new SphereGeometry(0.05, 12, 10);
    const th = new CapsuleGeometry(0.07, THIGH, 4, 12);
    const sh = new CapsuleGeometry(0.056, SHIN, 4, 12);
    this.upperArm = [this.part(ua, this.jerseyMat, this.group), this.part(ua, this.jerseyMat, this.group)];
    this.foreArm = [this.part(fa, skinM, this.group), this.part(fa, skinM, this.group)];
    this.hand = [this.part(hd, skinM, this.group), this.part(hd, skinM, this.group)];
    this.thigh = [this.part(th, shorts, this.group), this.part(th, shorts, this.group)];
    this.shin = [this.part(sh, skinM, this.group), this.part(sh, skinM, this.group)];
    const mkFoot = (): Foot => {
      const f = new Group();
      const shoe = this.part(new CapsuleGeometry(0.058, 0.13, 4, 12), shoeM, f);
      shoe.rotation.x = Math.PI / 2;
      shoe.position.set(0, 0.055, 0.04);
      shoe.scale.set(1, 1, 0.8);
      const sole = this.part(new CapsuleGeometry(0.062, 0.135, 2, 12), soleM, f);
      sole.rotation.x = Math.PI / 2;
      sole.position.set(0, 0.022, 0.04);
      sole.scale.set(1.02, 1, 0.38);
      const lace = this.part(new SphereGeometry(0.03, 8, 6), this.jerseyMat, f);
      lace.position.set(0, 0.095, 0.075);
      lace.scale.set(1, 0.5, 1.4);
      this.group.add(f);
      return { pos: new Vector3(), from: new Vector3(), to: new Vector3(), t: 1, stepping: false, mesh: f };
    };
    this.feet = [mkFoot(), mkFoot()];

    this.paddle = makePaddle();
    this.group.add(this.paddle);

    // default pose
    const z = (HALF_L + 0.55) * (side === 'player' ? 1 : -1);
    this.body.set(0, 0, z);
    this.prevBody.copy(this.body);
    this.padPos.set(0.3 * (side === 'player' ? 1 : -1), 0.95, z - 0.35 * (side === 'player' ? 1 : -1));
    this.padRot.setFromAxisAngle(Y, side === 'player' ? 0 : Math.PI);
  }

  private m(color: string, rough: number): MeshStandardMaterial {
    const mm = new MeshStandardMaterial({ color, roughness: rough });
    this.mats.push(mm);
    return mm;
  }

  private part(geo: CapsuleGeometry | SphereGeometry | CylinderGeometry | TorusGeometry, m: Material, parent: Object3D): Mesh {
    const mesh = new Mesh(geo, m);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    this.bodyMeshes.push(mesh);
    return mesh;
  }

  setColor(c: string): void {
    this.jerseyMat.color.set(c);
  }

  /** Semi-transparent "ghost" rendering: depth pre-pass so only the front-most surface blends. */
  setGhost(opacity: number | null): void {
    for (const g of this.ghostMeshes) g.removeFromParent();
    this.ghostMeshes = [];
    const on = opacity !== null && opacity < 1;
    for (const mm of this.mats) {
      mm.transparent = on;
      mm.opacity = on ? opacity! : 1;
      mm.depthWrite = !on;
      mm.needsUpdate = true;
    }
    for (const m of this.bodyMeshes) m.renderOrder = on ? 11 : 0;
    if (!on) return;
    const depthMat = new MeshStandardMaterial({ colorWrite: false, transparent: true });
    for (const m of this.bodyMeshes) {
      const d = new Mesh(m.geometry, depthMat);
      d.renderOrder = 10;
      d.castShadow = false;
      d.receiveShadow = false;
      m.add(d);
      this.ghostMeshes.push(d);
    }
  }

  /** Animate ghost opacity (only meaningful after setGhost()). */
  setOpacity(o: number): void {
    if (!this.ghostMeshes.length) return;
    for (const mm of this.mats) mm.opacity = o;
  }

  setPose(pose: AvatarPose, opts?: { backhand?: boolean; handedness?: Handedness; swing?: number }): void {
    this.body.copy(pose.body);
    this.body.y = 0;
    this.padPos.copy(pose.paddlePos);
    this.padRot.copy(pose.paddleRot);
    if (opts?.backhand !== undefined) this.backhandTarget = opts.backhand ? 1 : 0;
    if (opts?.handedness) this.handed = opts.handedness;
    if (opts?.swing !== undefined) this.swing = opts.swing;
  }

  react(mood: Mood): void {
    this.mood = mood;
    this.moodT = 0;
  }

  update(dt: number): void {
    dt = Math.min(dt, 0.05);
    this.time += dt;
    const t = this.time;
    if (this.first) {
      this.prevBody.copy(this.body);
    }
    // body velocity
    if (dt > 0) {
      _a.subVectors(this.body, this.prevBody).multiplyScalar(1 / dt);
      if (_a.lengthSq() > 100) _a.set(0, 0, 0); // teleport
      this.vel.lerp(_a, 1 - Math.exp(-12 * dt));
    }
    this.prevBody.copy(this.body);
    const speed = Math.hypot(this.vel.x, this.vel.z);

    // mood
    this.moodT += dt;
    if (this.mood !== 'idle' && this.moodT > 2.6) this.mood = 'idle';
    this.moodW = damp(this.moodW, this.mood === 'idle' ? 0 : 1, 6, dt);
    const cheer = this.mood === 'cheer' ? this.moodW : 0;
    const sad = this.mood === 'sad' ? this.moodW : 0;

    // root
    const jump = this.mood === 'cheer' ? Math.max(0, Math.sin(this.moodT * 7.5)) * 0.16 * Math.exp(-this.moodT * 0.6) * cheer : 0;
    this.root.position.copy(this.body);
    this.root.position.y = jump;
    this.root.rotation.y = this.yaw;
    const breathe = Math.sin(t * 2.1) * 0.006;
    const crouch = 0.8 - Math.min(speed, 2) * 0.012 - sad * 0.03 + cheer * 0.06;
    this.pelvis.position.y = crouch + breathe;
    this.root.updateMatrixWorld(true);

    const hs = this.handed === 'right' ? -1 : 1; // paddle shoulder local x sign (model faces +Z; right = −X)
    this.backhand = damp(this.backhand, this.backhandTarget, 10, dt);

    // effective paddle pose: blend game pose with mood pose
    const effPos = _c.copy(this.padPos);
    const effRot = _q.copy(this.padRot);
    if (this.moodW > 0.001 && this.mood !== 'idle') {
      const mp = new Vector3();
      const mq = new Quaternion();
      if (this.mood === 'cheer') {
        const pump = Math.sin(this.moodT * 7.5) * 0.06;
        mp.set(hs * 0.28, 1.95 + pump, 0.05);
        mq.setFromAxisAngle(Y, 0);
      } else {
        mp.set(hs * 0.3, 0.48, 0.08);
        _q2.setFromAxisAngle(new Vector3(1, 0, 0), Math.PI);
        mq.copy(_q2);
      }
      this.root.localToWorld(mp);
      _yaw.setFromAxisAngle(Y, this.yaw);
      mq.premultiply(_yaw);
      effPos.lerp(mp, this.moodW);
      effRot.slerp(mq, this.moodW);
    }
    this.paddle.position.copy(effPos);
    this.paddle.quaternion.copy(effRot);
    this.paddle.updateMatrixWorld(true);
    const grip = this.paddle.localToWorld(new Vector3(0, GRIP_Y, 0));
    const gripLocal = this.root.worldToLocal(grip.clone());

    // torso lean / twist toward the paddle
    const shoulderRest = new Vector3(hs * SHOULDER_X, this.pelvis.position.y + SHOULDER_Y, 0);
    const reach = gripLocal.distanceTo(shoulderRest);
    const excess = Math.max(0, reach - (UPPER + FORE) * 0.9);
    let leanX = 0.14 + excess * 1.4 + clamp((this.pelvis.position.y + 0.25 - gripLocal.y) * 0.5, 0, 0.3);
    leanX = leanX * (1 - this.moodW) + (sad * 0.35 - cheer * 0.1);
    let leanZ = 0;
    if (excess > 0) leanZ = clamp(-Math.sign(gripLocal.x) * excess * 1.6 * Math.min(1, Math.abs(gripLocal.x) / (reach + 1e-3)), -0.35, 0.35);
    leanZ *= 1 - this.moodW;
    let twist = hs * clamp(0.32 - gripLocal.z, -0.6, 0.7) * 0.75 + hs * this.backhand * -0.35;
    twist *= 1 - this.moodW;
    this.leanX = damp(this.leanX, clamp(leanX, -0.2, 0.55), 14, dt);
    this.leanZ = damp(this.leanZ, leanZ, 14, dt);
    this.twist = damp(this.twist, twist, 16, dt);
    this.spine.rotation.set(this.leanX, this.twist, this.leanZ, 'YXZ');
    this.spine.scale.y = 1 + Math.sin(t * 2.1) * 0.01;
    // head: look toward the table centre-ish, droop when sad
    this.head.rotation.x = -this.leanX * 0.6 + sad * 0.65 - cheer * 0.3;
    this.head.rotation.y = -this.twist * 0.7;
    this.root.updateMatrixWorld(true);

    // arms
    for (let i = 0; i < 2; i++) {
      const isPaddle = i === 0;
      const sx = isPaddle ? hs : -hs;
      const sh = this.spine.localToWorld(_a.set(sx * SHOULDER_X, SHOULDER_Y - 0.02, 0));
      let target: Vector3;
      const pole = new Vector3();
      if (isPaddle) {
        target = grip;
        // elbow: down/out/back for forehand, forward/out for backhand
        pole.set(sx * 0.7, -1, -0.35).lerp(new Vector3(sx * 0.9, -0.3, 0.6), this.backhand);
        if (cheer > 0.5) pole.set(sx, 0, 0.3);
      } else {
        const sway = Math.sin(t * 2.1 + 1) * 0.02;
        const counter = -this.twist * 0.25 + this.swing * 0.1;
        const free = new Vector3(sx * 0.33, this.pelvis.position.y + 0.3 + sway, 0.3 + counter);
        const cheerP = new Vector3(sx * 0.3, this.pelvis.position.y + 1.05 + Math.sin(this.moodT * 7.5) * 0.06, 0.05);
        const sadP = new Vector3(sx * 0.22, this.pelvis.position.y - 0.12, 0.05);
        if (cheer > 0) free.lerp(cheerP, cheer);
        if (sad > 0) free.lerp(sadP, sad);
        target = this.root.localToWorld(free);
        pole.set(sx * 0.6, -0.6, -0.7);
        if (cheer > 0.5) pole.set(sx, 0, 0.2);
      }
      // pole to world (rotation only)
      _yaw.setFromAxisAngle(Y, this.yaw);
      pole.applyQuaternion(_yaw);
      const elbow = new Vector3();
      const wrist = new Vector3();
      solveIK(sh.clone(), target, UPPER, FORE, pole, elbow, wrist);
      placeBetween(this.upperArm[i], sh, elbow);
      placeBetween(this.foreArm[i], elbow, wrist);
      this.hand[i].position.copy(wrist);
    }

    // legs + feet
    _yaw.setFromAxisAngle(Y, this.yaw);
    const fwd = new Vector3(0, 0, 1).applyQuaternion(_yaw);
    for (let i = 0; i < 2; i++) {
      const f = this.feet[i];
      const sx = i === 0 ? hs : -hs;
      const ideal = this.root.localToWorld(new Vector3(sx * 0.2, 0, i === 0 ? -0.07 : 0.09));
      ideal.y = 0;
      if (this.first) {
        f.pos.copy(ideal);
        f.t = 1;
        f.stepping = false;
      }
      const other = this.feet[1 - i];
      const dist = Math.hypot(f.pos.x - ideal.x, f.pos.z - ideal.z);
      if (!f.stepping && (dist > 0.15 && !other.stepping || dist > 0.45)) {
        f.stepping = true;
        f.t = 0;
        f.from.copy(f.pos);
        f.to.copy(ideal).addScaledVector(this.vel, 0.1);
        f.to.y = 0;
      }
      if (f.stepping) {
        const dur = clamp(0.2 - speed * 0.03, 0.11, 0.2);
        f.t = Math.min(1, f.t + dt / dur);
        f.to.copy(ideal).addScaledVector(this.vel, 0.1);
        f.to.y = 0;
        f.pos.lerpVectors(f.from, f.to, smooth(f.t));
        f.pos.y = Math.sin(Math.PI * f.t) * 0.07;
        if (f.t >= 1) f.stepping = false;
      }
      const fy = f.pos.y + (this.mood === 'cheer' ? jump : 0);
      f.mesh.position.set(f.pos.x, fy, f.pos.z);
      f.mesh.rotation.set(0, this.yaw + sx * -0.18, 0);
      const hip = this.pelvis.localToWorld(new Vector3(sx * 0.1, -0.03, 0));
      const ankle = new Vector3(f.pos.x, fy + ANKLE, f.pos.z).addScaledVector(fwd, -0.01);
      const kneeP = fwd.clone().addScaledVector(new Vector3(-fwd.z, 0, fwd.x), sx * -0.25);
      const knee = new Vector3();
      const end = new Vector3();
      solveIK(hip, ankle, THIGH, SHIN, kneeP, knee, end);
      placeBetween(this.thigh[i], hip, knee);
      placeBetween(this.shin[i], knee, end);
    }
    this.first = false;
  }

  /** Approx head world position (for camera framing etc.). */
  headWorld(out: Vector3): Vector3 {
    return this.head.localToWorld(out.set(0, 0.12, 0));
  }

  setJerseyAccent(c: string): void {
    this.bandMat.color.copy(new Color(c));
  }
}
