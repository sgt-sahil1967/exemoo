/**
 * Mii-like golfer built from primitives, posed procedurally every frame:
 * - the club & hands move in an inclined swing plane through the ball (contract shaftAngle),
 * - shoulders/hips turn with the swing, arms & legs are solved with two-bone IK.
 * Local frame: the golfer faces −Z (toward the ball); the target is toward −X (his left side).
 */
import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  CylinderGeometry,
  Group,
  Material,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three';
import type { ClubId, ClubPose, GolferAnim, GolferLook } from '../core/contracts';
import { clubById } from '../core/contracts';
import { clamp, damp, easeIn, easeOut, lerp, smoothstep } from './util';

const PELVIS_Y = 0.8;
const SPINE = 0.44;
const SHOULDER_HALF = 0.185;
const UPPER = 0.3;
const LOWER = 0.29;
const THIGH = 0.355;
const SHIN = 0.335;
const HEAD_R = 0.2;

const Y = new Vector3(0, 1, 0);

/** Per-club stance/plane parameters. */
function clubSpec(id: ClubId) {
  const c = clubById(id);
  const len = c.kind === 'putter' ? 0.84 : c.kind === 'wood' ? (id === '1W' ? 1.02 : 0.99) : c.kind === 'wedge' ? 0.86 : 0.97 - (parseInt(id) - 4) * 0.015;
  const putt = c.kind === 'putter';
  return {
    kind: c.kind,
    len,
    tilt: putt ? 0.55 : c.kind === 'wood' ? 0.5 : 0.56,
    rArm: putt ? 0.43 : 0.56,
    stance: putt ? 0.15 : c.kind === 'wood' ? 0.26 : 0.22,
    ballX: id === '1W' ? -0.14 : c.kind === 'wood' ? -0.09 : putt ? -0.04 : 0,
    knee: putt ? 0.12 : 0.2,
  };
}
type Spec = ReturnType<typeof clubSpec>;

interface Pose {
  y: number;
  shiftX: number;
  hipTurn: number;
  tilt: number;
  turn: number;
  side: number;
  headYaw: number;
  headPitch: number;
  handL: Vector3;
  handR: Vector3;
  clubDir: Vector3;
  clubSide: Vector3;
  knee: number;
  heelR: number;
  breathe: number;
}
const newPose = (): Pose => ({
  y: 0,
  shiftX: 0,
  hipTurn: 0,
  tilt: 0,
  turn: 0,
  side: 0,
  headYaw: 0,
  headPitch: 0,
  handL: new Vector3(0, 0.9, -0.3),
  handR: new Vector3(0, 0.85, -0.3),
  clubDir: new Vector3(0, -1, 0),
  clubSide: new Vector3(1, 0, 0),
  knee: 0.15,
  heelR: 0,
  breathe: 0,
});

function lerpPose(a: Pose, b: Pose, t: number) {
  a.y = lerp(a.y, b.y, t);
  a.shiftX = lerp(a.shiftX, b.shiftX, t);
  a.hipTurn = lerp(a.hipTurn, b.hipTurn, t);
  a.tilt = lerp(a.tilt, b.tilt, t);
  a.turn = lerp(a.turn, b.turn, t);
  a.side = lerp(a.side, b.side, t);
  a.headYaw = lerp(a.headYaw, b.headYaw, t);
  a.headPitch = lerp(a.headPitch, b.headPitch, t);
  a.handL.lerp(b.handL, t);
  a.handR.lerp(b.handR, t);
  a.clubDir.lerp(b.clubDir, t).normalize();
  a.clubSide.lerp(b.clubSide, t).normalize();
  a.knee = lerp(a.knee, b.knee, t);
  a.heelR = lerp(a.heelR, b.heelR, t);
  a.breathe = b.breathe;
}

/** Two-bone IK: elbow/knee position for root a reaching target t with a pole hint. */
function solveIK(a: Vector3, t: Vector3, l1: number, l2: number, pole: Vector3, out: Vector3) {
  const dir = new Vector3().subVectors(t, a);
  let d = dir.length();
  dir.divideScalar(d || 1);
  d = clamp(d, Math.abs(l1 - l2) + 0.01, (l1 + l2) * 0.999);
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const pd = pole.clone().addScaledVector(dir, -pole.dot(dir));
  if (pd.lengthSq() < 1e-6) pd.set(0, 0, -1);
  pd.normalize();
  return out.copy(a).addScaledVector(dir, l1 * cosA).addScaledVector(pd, l1 * Math.sqrt(1 - cosA * cosA));
}

/** Orient a Y-aligned limb mesh between p0 and p1. */
function placeLimb(m: Object3D, p0: Vector3, p1: Vector3, baseLen: number) {
  const d = new Vector3().subVectors(p1, p0);
  const len = d.length();
  m.position.copy(p0).add(p1).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(Y, d.divideScalar(len || 1));
  m.scale.set(1, len / baseLen, 1);
}

export class Golfer {
  readonly root = new Group();
  private body = new Group();
  private pelvis = new Group();
  private spine = new Group();
  private head = new Group();
  private hat = new Group();
  private hair!: Mesh;
  private limbs: Record<'uaL' | 'uaR' | 'faL' | 'faR' | 'thL' | 'thR' | 'shL' | 'shR', Mesh>;
  private hands: { L: Mesh; R: Mesh };
  private feet: { L: Group; R: Group };
  private club = new Group();
  private clubBuiltFor: ClubId | null = null;
  private mats: Record<'shirt' | 'skin' | 'hair' | 'pants' | 'shoe' | 'sole' | 'glove' | 'eye' | 'white' | 'hat', MeshStandardMaterial>;
  private geos: BufferGeometry[] = [];
  private clubDisposables: (BufferGeometry | Material)[] = [];
  private lookKey = '';

  private spec: Spec = clubSpec('7I');
  private anim: GolferAnim = 'idle';
  private animT = 0;
  private cur = newPose();
  private tgt = newPose();
  /** Smoothed live shaft angle (contract units). */
  private theta = 0;
  private face = 0;
  private swingFrom = 0;
  private puttTo = 0;
  private t = 0;
  /** Ball in root-local space, swing centre and plane axes. */
  private ballL = new Vector3();
  private S = new Vector3();
  private u = new Vector3();
  private v = new Vector3();
  private uh = new Vector3();
  private vh = new Vector3();
  private clubLen = 1;
  private heightAt: (x: number, z: number) => number = () => 0;

  constructor() {
    const std = (c: string, r = 0.65) => new MeshStandardMaterial({ color: c, roughness: r, metalness: 0 });
    this.mats = {
      shirt: std('#ff5a5f'),
      skin: std('#f6cfa8', 0.6),
      hair: std('#4a3222', 0.8),
      pants: std('#3d4a63'),
      shoe: std('#ffffff', 0.5),
      sole: std('#2a2f36'),
      glove: std('#ffffff', 0.7),
      eye: std('#1d1f24', 0.3),
      white: std('#ffffff', 0.4),
      hat: std('#ff5a5f'),
    };
    const g = <T extends BufferGeometry>(x: T) => {
      this.geos.push(x);
      return x;
    };
    const mesh = (geo: BufferGeometry, mat: Material) => {
      const m = new Mesh(geo, mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    };
    this.root.name = 'golfer';
    this.root.add(this.body);

    // pelvis
    const hips = mesh(g(new SphereGeometry(0.165, 20, 14)), this.mats.pants);
    hips.scale.set(1.08, 0.8, 0.85);
    this.pelvis.add(hips);
    this.body.add(this.pelvis);

    // torso
    const torso = mesh(g(new CapsuleGeometry(0.175, 0.2, 8, 20)), this.mats.shirt);
    torso.position.y = 0.25;
    torso.scale.set(1.05, 1, 0.8);
    this.spine.add(torso);
    const collar = mesh(g(new TorusGeometry(0.075, 0.022, 8, 18)), this.mats.shirt);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.46;
    this.spine.add(collar);
    const belt = mesh(g(new TorusGeometry(0.155, 0.02, 8, 24)), this.mats.sole);
    belt.rotation.x = Math.PI / 2;
    belt.position.y = 0.06;
    belt.scale.set(1.05, 0.82, 1);
    this.spine.add(belt);
    const neck = mesh(g(new CylinderGeometry(0.05, 0.055, 0.1, 10)), this.mats.skin);
    neck.position.y = 0.49;
    this.spine.add(neck);

    // head
    this.head.position.y = 0.53;
    const skull = mesh(g(new SphereGeometry(HEAD_R, 32, 24)), this.mats.skin);
    skull.position.y = HEAD_R * 0.92;
    skull.scale.set(1, 1.06, 0.98);
    this.head.add(skull);
    const hy = HEAD_R * 0.92;
    for (const s of [-1, 1]) {
      const eye = mesh(g(new SphereGeometry(0.031, 12, 10)), this.mats.eye);
      eye.scale.set(0.78, 1.4, 0.5);
      eye.position.set(s * 0.068, hy + 0.025, -HEAD_R * 0.94);
      this.head.add(eye);
      const glint = new Mesh(g(new SphereGeometry(0.008, 6, 6)), this.mats.white);
      glint.position.set(s * 0.068 + 0.007, hy + 0.04, -HEAD_R * 0.975);
      this.head.add(glint);
      const brow = mesh(g(new BoxGeometry(0.055, 0.012, 0.02)), this.mats.hair);
      brow.position.set(s * 0.07, hy + 0.085, -HEAD_R * 0.92);
      brow.rotation.z = s * -0.12;
      this.head.add(brow);
      const ear = mesh(g(new SphereGeometry(0.04, 10, 8)), this.mats.skin);
      ear.scale.set(0.5, 1, 0.8);
      ear.position.set(s * HEAD_R * 0.98, hy, 0.0);
      this.head.add(ear);
    }
    const nose = mesh(g(new SphereGeometry(0.03, 12, 10)), this.mats.skin);
    nose.scale.set(1, 0.85, 1);
    nose.position.set(0, hy - 0.02, -HEAD_R * 1.0);
    this.head.add(nose);
    const mouth = new Mesh(g(new TorusGeometry(0.04, 0.0075, 6, 16, Math.PI)), this.mats.eye);
    mouth.rotation.z = Math.PI;
    mouth.position.set(0, hy - 0.06, -HEAD_R * 0.93);
    mouth.rotation.x = 0.25;
    this.head.add(mouth);
    this.hair = mesh(g(new SphereGeometry(HEAD_R * 1.06, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.56)), this.mats.hair);
    this.hair.position.y = hy + 0.005;
    this.hair.rotation.x = 0.42;
    this.hair.scale.set(1, 1.04, 1);
    this.head.add(this.hair);
    this.head.add(this.hat);
    this.spine.add(this.head);
    this.body.add(this.spine);

    // limbs
    const limb = (r: number, len: number, mat: Material) => {
      const m = mesh(g(new CapsuleGeometry(r, len, 6, 12)), mat);
      this.body.add(m);
      return m;
    };
    this.limbs = {
      uaL: limb(0.058, UPPER, this.mats.shirt),
      uaR: limb(0.058, UPPER, this.mats.shirt),
      faL: limb(0.046, LOWER, this.mats.skin),
      faR: limb(0.046, LOWER, this.mats.skin),
      thL: limb(0.085, THIGH, this.mats.pants),
      thR: limb(0.085, THIGH, this.mats.pants),
      shL: limb(0.07, SHIN, this.mats.pants),
      shR: limb(0.07, SHIN, this.mats.pants),
    };
    this.hands = { L: mesh(g(new SphereGeometry(0.058, 14, 10)), this.mats.glove), R: mesh(g(new SphereGeometry(0.056, 14, 10)), this.mats.skin) };
    this.body.add(this.hands.L, this.hands.R);
    const foot = () => {
      const f = new Group();
      const shoe = mesh(g(new CapsuleGeometry(0.065, 0.15, 6, 12)), this.mats.shoe);
      shoe.rotation.x = Math.PI / 2;
      shoe.scale.set(1.15, 1, 0.85);
      shoe.position.set(0, 0.055, 0.05);
      const sole = mesh(g(new BoxGeometry(0.13, 0.025, 0.27)), this.mats.sole);
      sole.position.set(0, 0.012, 0.05);
      f.add(shoe, sole);
      this.body.add(f);
      return f;
    };
    this.feet = { L: foot(), R: foot() };
    this.body.add(this.club);
  }

  setHeightFn(fn: (x: number, z: number) => number) {
    this.heightAt = fn;
  }

  /** pos = BALL position, yaw = AIM yaw. */
  place(ball: Vector3, aimYaw: number, look: GolferLook, club: ClubId) {
    this.setLook(look);
    if (club !== this.clubBuiltFor) this.buildClub(club);
    this.spec = clubSpec(club);
    const sp = this.spec;
    // swing centre (between the shoulders) and the address hand point hanging below it
    const Sy = PELVIS_Y - sp.knee * 0.12 + SPINE * Math.cos(sp.tilt);
    const Sz = -SPINE * Math.sin(sp.tilt);
    this.S.set(0, Sy, Sz);
    this.uh.set(0, -1, sp.kind === 'putter' ? -0.12 : -0.42).normalize();
    const H0 = this.S.clone().addScaledVector(this.uh, sp.rArm);
    // club lie: the hands' height decides how upright the shaft is
    const drop = H0.y - 0.01;
    const Le = sp.len - 0.05;
    const a = Math.acos(clamp(drop / Le, 0.3, 0.985));
    const local = new Vector3(sp.ballX, 0.01, H0.z - Math.sqrt(Math.max(0, Le * Le * Math.sin(a) ** 2 - sp.ballX ** 2)));
    const facing = aimYaw - Math.PI / 2;
    this.root.rotation.set(0, facing, 0);
    const off = local.clone().applyAxisAngle(Y, facing);
    const rx = ball.x - off.x;
    const rz = ball.z - off.z;
    this.root.position.set(rx, this.heightAt(rx, rz), rz);
    this.root.updateMatrixWorld(true);
    // actual ball (ground contact point) in local space handles slopes
    this.ballL.copy(ball).sub(this.root.position).applyAxisAngle(Y, -facing);
    this.ballL.y += 0.01;
    this.u.subVectors(this.ballL, H0).normalize();
    this.v.set(1, 0, 0).addScaledVector(this.u, -this.u.x).normalize();
    this.vh.set(1, 0, 0).addScaledVector(this.uh, -this.uh.x).normalize();
    this.clubLen = H0.distanceTo(this.ballL) + 0.05;
  }

  private setLook(look: GolferLook) {
    const key = `${look.color}|${look.skin}|${look.hair}|${look.hat}`;
    if (key === this.lookKey) return;
    this.lookKey = key;
    this.mats.shirt.color.set(look.color);
    this.mats.skin.color.set(look.skin);
    this.mats.skin.emissive.set(look.skin).multiplyScalar(0.12);
    this.mats.hair.color.set(look.hair);
    this.mats.hat.color.set(look.color).multiplyScalar(0.92);
    // hat
    this.hat.children.forEach((c) => {
      if (c instanceof Mesh) c.geometry.dispose();
    });
    this.hat.clear();
    const hy = HEAD_R * 0.92;
    this.hair.visible = true;
    if (look.hat === 'cap') {
      const dome = new Mesh(new SphereGeometry(HEAD_R * 1.1, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), this.mats.hat);
      dome.position.y = hy + 0.02;
      dome.rotation.x = 0.16;
      dome.castShadow = true;
      const brim = new Mesh(new CylinderGeometry(0.15, 0.15, 0.018, 24, 1, false, Math.PI / 2, Math.PI), this.mats.hat);
      brim.scale.set(1, 1, 1.25);
      brim.position.set(0, hy + 0.06, -HEAD_R * 0.86);
      brim.rotation.x = 0.12;
      brim.castShadow = true;
      const button = new Mesh(new SphereGeometry(0.022, 8, 6), this.mats.white);
      button.position.set(0, hy + HEAD_R * 1.08, 0.035);
      this.hat.add(dome, brim, button);
      this.hair.scale.set(1.0, 0.85, 1.0);
    } else if (look.hat === 'visor') {
      const band = new Mesh(new TorusGeometry(HEAD_R * 1.03, 0.025, 8, 32), this.mats.white);
      band.rotation.x = Math.PI / 2 - 0.15;
      band.position.y = hy + 0.075;
      const brim = new Mesh(new CylinderGeometry(0.16, 0.16, 0.016, 24, 1, false, Math.PI / 2, Math.PI), this.mats.white);
      brim.scale.set(1, 1, 1.2);
      brim.position.set(0, hy + 0.06, -HEAD_R * 0.9);
      brim.rotation.x = 0.15;
      band.castShadow = brim.castShadow = true;
      this.hat.add(band, brim);
      this.hair.scale.set(1, 1.04, 1);
    } else {
      this.hair.scale.set(1, 1.04, 1);
    }
  }

  private buildClub(id: ClubId) {
    this.clubDisposables.forEach((d) => d.dispose());
    this.clubDisposables = [];
    this.club.clear();
    this.clubBuiltFor = id;
    const sp = clubSpec(id);
    const steel = new MeshStandardMaterial({ color: '#d9dde3', roughness: 0.25, metalness: 0.85 });
    const grip = new MeshStandardMaterial({ color: '#23272e', roughness: 0.8 });
    const dark = new MeshStandardMaterial({ color: '#1e2633', roughness: 0.35, metalness: 0.4 });
    const accent = new MeshStandardMaterial({ color: '#e8452c', roughness: 0.4 });
    this.clubDisposables.push(steel, grip, dark, accent);
    const add = (geo: BufferGeometry, mat: Material, x = 0, y = 0, z = 0) => {
      const m = new Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      this.club.add(m);
      this.clubDisposables.push(geo);
      return m;
    };
    // shaft: grip at origin, head toward −Y; toe toward −Z, face normal −X
    add(new CylinderGeometry(0.011, 0.007, sp.len, 8).translate(0, -sp.len / 2, 0), steel);
    add(new CylinderGeometry(0.016, 0.013, 0.26, 10).translate(0, -0.11, 0), grip);
    const L = sp.len;
    if (sp.kind === 'wood') {
      const head = add(new SphereGeometry(id === '1W' ? 0.065 : 0.052, 20, 14), dark, 0, -L - 0.005, -0.045);
      head.scale.set(0.72, 0.62, 1.2);
      const crown = add(new SphereGeometry(0.012, 8, 6), accent, 0, -L + 0.03, -0.03);
      crown.scale.set(1, 0.4, 1);
    } else if (sp.kind === 'putter') {
      add(new BoxGeometry(0.035, 0.03, 0.12), steel, 0.004, -L, -0.05);
      add(new BoxGeometry(0.012, 0.031, 0.04), accent, 0.015, -L + 0.002, -0.05);
    } else {
      const blade = add(new BoxGeometry(0.018, 0.055, 0.085), steel, 0, -L + 0.008, -0.04);
      blade.rotation.z = -0.15;
      add(new CylinderGeometry(0.012, 0.009, 0.05, 8), steel, 0, -L + 0.03, -0.004);
    }
  }

  setAnim(anim: GolferAnim, pose?: ClubPose) {
    if (pose) {
      this.face = pose.face;
      if (anim === 'address' || anim === 'putt') this.liveTarget = pose.shaftAngle;
    }
    const autoPutt = anim === 'putt' && !pose;
    if (anim === this.anim && !autoPutt && !(pose && this.puttAuto)) return;
    if (autoPutt && this.anim === 'putt' && this.puttAuto) return;
    const prev = this.anim;
    this.anim = anim;
    this.animT = 0;
    this.puttAuto = autoPutt;
    if (!pose && (anim === 'address' || anim === 'putt')) this.liveTarget = 0;
    if (anim === 'swing') this.swingFrom = this.theta;
    if (autoPutt) {
      this.swingFrom = this.theta;
      this.puttTo = -Math.max(0.25, Math.abs(this.theta) * 1.1);
      if (prev !== 'putt') this.swingFrom = 0;
    }
  }
  private liveTarget = 0;
  private puttAuto = false;

  get animation() {
    return this.anim;
  }

  /** Compute the swing-plane pose for a club angle θ (contract units). */
  private planePose(out: Pose, theta: number, putt: boolean) {
    const sp = this.spec;
    let vis: number;
    let hinge: number;
    if (putt) {
      vis = theta;
      hinge = 0;
    } else if (theta >= 0) {
      vis = theta * (1 + 0.38 * smoothstep(1.2, 3.1, theta));
      hinge = 1.45 * smoothstep(0.35, 2.7, vis);
    } else {
      vis = theta * (1 + 0.32 * smoothstep(1.0, 3.1, -theta));
      hinge = -1.1 * smoothstep(0.6, 2.6, -vis);
    }
    const phi = vis - hinge;
    const { S, u, v, uh, vh } = this;
    const rArm = sp.rArm;
    const hands = new Vector3().copy(S).addScaledVector(uh, Math.cos(phi) * rArm).addScaledVector(vh, Math.sin(phi) * rArm);
    const cd = new Vector3().copy(u).multiplyScalar(Math.cos(vis)).addScaledVector(v, Math.sin(vis));
    const w = new Vector3().copy(u).multiplyScalar(-Math.sin(vis)).addScaledVector(v, Math.cos(vis));
    if (this.face) w.applyAxisAngle(cd, this.face * 0.35);
    out.handL.copy(hands);
    out.handR.copy(hands).addScaledVector(cd, 0.085);
    out.clubDir.copy(cd);
    out.clubSide.copy(w);
    out.tilt = sp.tilt;
    out.knee = sp.knee;
    out.y = 0;
    out.side = 0;
    out.breathe = 0;
    if (putt) {
      out.turn = -vis * 0.55;
      out.hipTurn = 0;
      out.headYaw = -out.turn;
      out.headPitch = 0.8;
      out.heelR = 0;
      out.shiftX = 0;
      return out;
    }
    const back = vis > 0 ? smoothstep(0, 4.3, vis) : 0;
    const fwd = vis < 0 ? smoothstep(0, 4.3, -vis) : 0;
    out.turn = -1.45 * back + 1.75 * fwd;
    out.hipTurn = -0.6 * back + 1.15 * fwd;
    out.tilt = sp.tilt - 0.1 * back - 0.38 * fwd;
    out.side = -0.12 * fwd;
    out.headYaw = -out.turn * (1 - fwd * 1.05) * 0.92;
    out.headPitch = lerp(0.7, 0.1, fwd);
    out.heelR = fwd;
    out.shiftX = 0.04 * back - 0.1 * fwd;
    out.knee = sp.knee + 0.05 * fwd;
    return out;
  }

  private idlePose(out: Pose, t: number) {
    out.y = 0;
    out.shiftX = 0;
    out.tilt = 0.1;
    out.turn = 0.15 * Math.sin(t * 0.35);
    out.hipTurn = 0.05;
    out.side = 0;
    out.headYaw = 0.5 * Math.sin(t * 0.45) * smoothstep(-0.2, 0.6, Math.sin(t * 0.17));
    out.headPitch = 0.08 + 0.05 * Math.sin(t * 0.3);
    out.handL.set(-0.04, 0.83, -0.3);
    out.handR.set(0.06, 0.81, -0.29);
    out.clubDir.set(0.08, -1, -0.5).normalize();
    out.clubSide.set(1, 0, 0);
    out.knee = 0.08;
    out.heelR = 0;
    out.breathe = Math.sin(t * 1.8);
  }

  private celebratePose(out: Pose, t: number) {
    const jump = Math.max(0, Math.sin(t * 7.5));
    out.y = jump * 0.32 * (t < 3 ? 1 : 0.4);
    out.shiftX = 0;
    out.tilt = -0.12;
    out.turn = 0.2 * Math.sin(t * 3);
    out.hipTurn = 0;
    out.side = 0.1 * Math.sin(t * 3.7);
    out.headYaw = 0;
    out.headPitch = -0.25;
    const wave = Math.sin(t * 7.5) * 0.06;
    out.handL.set(-0.34, 1.83 + wave, -0.08);
    out.handR.set(0.34, 1.83 - wave, -0.08);
    out.clubDir.set(-0.5, 0.86, 0.05).normalize();
    out.clubSide.set(0, 0, 1);
    out.knee = 0.25 * (1 - jump);
    out.heelR = 0;
    out.breathe = 0;
  }

  private sadPose(out: Pose, t: number) {
    out.y = -0.02;
    out.shiftX = 0;
    out.tilt = 0.32;
    out.turn = 0;
    out.hipTurn = 0;
    out.side = 0.05;
    const shake = t < 1.6 ? Math.sin(t * 9) * 0.45 * (1 - t / 1.6) : 0;
    out.headYaw = shake;
    out.headPitch = 0.6;
    out.handL.set(-0.06, 0.66, -0.25);
    out.handR.set(0.1, 0.64, -0.24);
    out.clubDir.set(0.15, -1, -0.25).normalize();
    out.clubSide.set(1, 0, 0);
    out.knee = 0.12;
    out.heelR = 0;
    out.breathe = 0;
  }

  update(dt: number) {
    this.t += dt;
    this.animT += dt;
    const putt = this.spec.kind === 'putter';
    let rate = 9;
    switch (this.anim) {
      case 'address':
      case 'putt': {
        if (this.puttAuto) {
          const k = clamp(this.animT / 0.45, 0, 1);
          this.theta = lerp(this.swingFrom, this.puttTo, k < 0.5 ? easeIn(k * 2) * 0.5 : 0.5 + easeOut(k * 2 - 1) * 0.5);
        } else {
          this.theta = damp(this.theta, this.liveTarget, 22, dt);
        }
        this.planePose(this.tgt, this.theta, putt || this.anim === 'putt');
        rate = this.animT < 0.4 ? 10 : 40;
        break;
      }
      case 'swing': {
        // quick downswing from wherever the club is, then follow-through to the finish
        const from = Math.max(this.swingFrom, 0);
        const tD = from > 0.4 ? 0.06 + 0.05 * Math.min(from, 3) : 0;
        const tF = 0.42;
        if (this.animT < tD) this.theta = lerp(from, 0, easeIn(this.animT / tD));
        else this.theta = lerp(0, -3.3, easeOut(clamp((this.animT - tD) / tF, 0, 1)));
        this.planePose(this.tgt, this.theta, putt);
        lerpPose(this.cur, this.tgt, 1);
        rate = -1;
        if (this.animT > tD + tF + 1.2) this.anim = 'follow';
        break;
      }
      case 'follow':
        this.theta = -3.3;
        this.planePose(this.tgt, this.theta, putt);
        this.tgt.breathe = Math.sin(this.t * 1.8) * 0.6;
        rate = 6;
        break;
      case 'celebrate':
        this.celebratePose(this.tgt, this.animT);
        rate = 10;
        break;
      case 'disappointed':
        this.sadPose(this.tgt, this.animT);
        rate = 7;
        break;
      default:
        this.theta = 0;
        this.idlePose(this.tgt, this.t);
        rate = 5;
    }
    if (rate > 0) lerpPose(this.cur, this.tgt, 1 - Math.exp(-rate * dt));
    this.apply(this.cur);
  }

  private apply(p: Pose) {
    const pel = new Vector3(p.shiftX, PELVIS_Y - p.knee * 0.12 + p.y, 0);
    this.pelvis.position.copy(pel);
    this.pelvis.rotation.set(0, p.hipTurn, 0);
    this.spine.position.copy(pel);
    this.spine.rotation.set(-p.tilt, p.turn, p.side, 'XYZ');
    this.spine.scale.set(1 + p.breathe * 0.012, 1, 1 + p.breathe * 0.02);
    this.head.rotation.set(-p.headPitch + p.tilt * 0.5, p.headYaw, 0, 'YXZ');
    this.pelvis.updateMatrix();
    this.spine.updateMatrix();

    // arms: shoulders from the spine transform, IK to the hands
    const shL = new Vector3(-SHOULDER_HALF, SPINE, 0).applyMatrix4(this.spine.matrix);
    const shR = new Vector3(SHOULDER_HALF, SPINE, 0).applyMatrix4(this.spine.matrix);
    const elbow = new Vector3();
    const down = new Vector3(0, -1, 0.35);
    solveIK(shL, p.handL, UPPER, LOWER, new Vector3(-0.6, -1, 0.3), elbow);
    placeLimb(this.limbs.uaL, shL, elbow, UPPER);
    placeLimb(this.limbs.faL, elbow, p.handL, LOWER);
    const elbowR = solveIK(shR, p.handR, UPPER, LOWER, down.set(0.5, -1, 0.4), new Vector3());
    placeLimb(this.limbs.uaR, shR, elbowR, UPPER);
    placeLimb(this.limbs.faR, elbowR, p.handR, LOWER);
    this.hands.L.position.copy(p.handL);
    this.hands.R.position.copy(p.handR);

    // legs: feet planted (snapped to the ground), knees forward
    const stance = this.spec.stance;
    const inv = new Matrix4().copy(this.root.matrixWorld).invert();
    for (const s of [-1, 1] as const) {
      const key = s < 0 ? 'L' : 'R';
      const footLocal = new Vector3(s * stance, 0, -0.07);
      const fw = footLocal.clone().applyMatrix4(this.root.matrixWorld);
      const gy = this.heightAt(fw.x, fw.z);
      fw.y = gy;
      footLocal.copy(fw).applyMatrix4(inv);
      if (Math.abs(footLocal.y) > 0.25) footLocal.y = 0;
      const foot = this.feet[key];
      const heel = s > 0 ? p.heelR : 0;
      foot.position.copy(footLocal);
      foot.rotation.set(-heel * 0.9, s < 0 ? 0.25 + p.hipTurn * 0.2 : -0.2 + p.hipTurn * 0.6 * heel, 0, 'YXZ');
      const ankle = new Vector3(0, 0.11, 0.1).applyEuler(foot.rotation).add(foot.position);
      const hip = new Vector3(s * 0.095, -0.04, 0).applyMatrix4(this.pelvis.matrix);
      const knee = solveIK(hip, ankle, THIGH, SHIN, new Vector3(s * 0.15 - (s > 0 ? heel * 0.6 : 0), 0, -1), new Vector3());
      placeLimb(s < 0 ? this.limbs.thL : this.limbs.thR, hip, knee, THIGH);
      placeLimb(s < 0 ? this.limbs.shL : this.limbs.shR, knee, ankle, SHIN);
    }

    // club: grip at the lead hand, basis from shaft dir + face side
    const sDir = p.clubDir;
    const xc = p.clubSide.clone().addScaledVector(sDir, -p.clubSide.dot(sDir)).normalize();
    const yc = sDir.clone().negate();
    const zc = new Vector3().crossVectors(xc, yc);
    this.club.quaternion.setFromRotationMatrix(new Matrix4().makeBasis(xc, yc, zc));
    this.club.position.copy(p.handL).addScaledVector(sDir, -0.05);
    this.club.scale.set(1, clamp(this.clubLen / this.spec.len, 0.85, 1.15), 1);
  }

  /** World position of the club head (for effects). */
  clubHead(out: Vector3) {
    return out.set(0, -this.spec.len, 0).applyQuaternion(this.club.quaternion).add(this.club.position).applyMatrix4(this.root.matrixWorld);
  }

  dispose() {
    this.geos.forEach((g) => g.dispose());
    Object.values(this.mats).forEach((m) => m.dispose());
    this.clubDisposables.forEach((d) => d.dispose());
    this.hat.children.forEach((c) => c instanceof Mesh && c.geometry.dispose());
  }
}

