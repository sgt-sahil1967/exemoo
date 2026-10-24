import { Vector3 } from 'three';

// The player figure is a fixed-size skeleton. Pose sources (camera or keyboard) only
// supply bone *directions*; lengths never change, so every player fits the same walls.
// World units are metres: figure faces -Z (toward the walls), +X is screen right.

export const L = {
  spine: 0.52,
  neckHead: 0.25,
  shoulderHalf: 0.19,
  hipHalf: 0.12,
  upperArm: 0.29,
  forearm: 0.27,
  thigh: 0.45,
  shin: 0.43,
  foot: 0.14,
  ankleH: 0.07,
  headR: 0.13,
};
export const STAND_PELVIS = L.thigh + L.shin + L.ankleH;

export const JOINTS = [
  'head', 'neck', 'pelvis',
  'lShoulder', 'rShoulder', 'lElbow', 'rElbow', 'lWrist', 'rWrist',
  'lHip', 'rHip', 'lKnee', 'rKnee', 'lAnkle', 'rAnkle', 'lToe', 'rToe',
] as const;
export type Joint = (typeof JOINTS)[number];
export type Skeleton = Record<Joint, Vector3>;

/** Bones drawn as cylinders and sampled for wall fitting: [from, to, radius]. */
export const BONES: [Joint, Joint, number][] = [
  ['pelvis', 'neck', 0.075],
  ['neck', 'head', 0.04],
  ['neck', 'lShoulder', 0.05], ['neck', 'rShoulder', 0.05],
  ['lShoulder', 'lElbow', 0.045], ['lElbow', 'lWrist', 0.04],
  ['rShoulder', 'rElbow', 0.045], ['rElbow', 'rWrist', 0.04],
  ['pelvis', 'lHip', 0.055], ['pelvis', 'rHip', 0.055],
  ['lHip', 'lKnee', 0.055], ['lKnee', 'lAnkle', 0.05], ['lAnkle', 'lToe', 0.04],
  ['rHip', 'rKnee', 0.055], ['rKnee', 'rAnkle', 0.05], ['rAnkle', 'rToe', 0.04],
];

export interface PoseDirs {
  spine: Vector3;
  head: Vector3;
  /** Points from the chest centre toward the figure's LEFT shoulder (screen left, -X). */
  shoulderAxis: Vector3;
  hipAxis: Vector3;
  lUpperArm: Vector3; lForearm: Vector3;
  rUpperArm: Vector3; rForearm: Vector3;
  lThigh: Vector3; lShin: Vector3; lFoot: Vector3;
  rThigh: Vector3; rShin: Vector3; rFoot: Vector3;
}

const v = (x: number, y: number, z: number) => new Vector3(x, y, z).normalize();
const DEG = Math.PI / 180;

/** Direction in the wall plane: 0° = straight down, 90° = straight out to that side, 180° = up. */
export function limb(side: -1 | 1, deg: number, z = 0): Vector3 {
  return v(side * Math.sin(deg * DEG), -Math.cos(deg * DEG), z);
}

export function standingDirs(): PoseDirs {
  return {
    spine: v(0, 1, 0),
    head: v(0, 1, 0),
    shoulderAxis: v(-1, 0, 0),
    hipAxis: v(-1, 0, 0),
    lUpperArm: limb(-1, 10), lForearm: limb(-1, 6),
    rUpperArm: limb(1, 10), rForearm: limb(1, 6),
    lThigh: limb(-1, 3), lShin: limb(-1, 2), lFoot: v(0, -0.15, -1),
    rThigh: limb(1, 3), rShin: limb(1, 2), rFoot: v(0, -0.15, -1),
  };
}

export function emptySkeleton(): Skeleton {
  const s = {} as Skeleton;
  for (const j of JOINTS) s[j] = new Vector3();
  return s;
}

export function copySkeleton(src: Skeleton, dst: Skeleton = emptySkeleton()): Skeleton {
  for (const j of JOINTS) dst[j].copy(src[j]);
  return dst;
}

function place(s: Skeleton, pelvisY: number, d: PoseDirs) {
  const add = (out: Vector3, from: Vector3, dir: Vector3, len: number) => out.copy(from).addScaledVector(dir, len);
  s.pelvis.set(0, pelvisY, 0);
  add(s.neck, s.pelvis, d.spine, L.spine);
  add(s.head, s.neck, d.head, L.neckHead);
  add(s.lShoulder, s.neck, d.shoulderAxis, L.shoulderHalf);
  add(s.rShoulder, s.neck, d.shoulderAxis, -L.shoulderHalf);
  add(s.lElbow, s.lShoulder, d.lUpperArm, L.upperArm);
  add(s.lWrist, s.lElbow, d.lForearm, L.forearm);
  add(s.rElbow, s.rShoulder, d.rUpperArm, L.upperArm);
  add(s.rWrist, s.rElbow, d.rForearm, L.forearm);
  add(s.lHip, s.pelvis, d.hipAxis, L.hipHalf);
  add(s.rHip, s.pelvis, d.hipAxis, -L.hipHalf);
  add(s.lKnee, s.lHip, d.lThigh, L.thigh);
  add(s.lAnkle, s.lKnee, d.lShin, L.shin);
  add(s.lToe, s.lAnkle, d.lFoot, L.foot);
  add(s.rKnee, s.rHip, d.rThigh, L.thigh);
  add(s.rAnkle, s.rKnee, d.rShin, L.shin);
  add(s.rToe, s.rAnkle, d.rFoot, L.foot);
}

const tmpA = new Vector3();
const tmpB = new Vector3();

/** Two-bone IK: plant the ankle on the ground, knee bending forward (-Z). */
function plantLeg(hip: Vector3, knee: Vector3, ankle: Vector3, toe: Vector3) {
  const footOff = tmpB.copy(toe).sub(ankle);
  const target = tmpA.set(ankle.x, L.ankleH, ankle.z);
  const toTarget = target.clone().sub(hip);
  const dist = Math.min(toTarget.length(), L.thigh + L.shin - 1e-3);
  toTarget.normalize();
  // Law of cosines for the hip angle.
  const cosA = (L.thigh * L.thigh + dist * dist - L.shin * L.shin) / (2 * L.thigh * dist);
  const a = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const bendAxis = new Vector3().crossVectors(toTarget, new Vector3(0, 0, -1));
  if (bendAxis.lengthSq() < 1e-6) bendAxis.set(1, 0, 0);
  bendAxis.normalize();
  // Rotate toward -Z so the knee pokes forward.
  const kneeDir = toTarget.clone().applyAxisAngle(bendAxis, a);
  if (kneeDir.z > 0) kneeDir.copy(toTarget).applyAxisAngle(bendAxis, -a);
  knee.copy(hip).addScaledVector(kneeDir, L.thigh);
  ankle.copy(hip).addScaledVector(toTarget, dist);
  toe.copy(ankle).add(footOff);
}

/**
 * Build the figure from bone directions plus a vertical "lift" (metres, from the
 * camera's hip height; + = jumping, - = crouching). Feet stay planted unless jumping.
 */
export function solveSkeleton(d: PoseDirs, lift: number, out: Skeleton = emptySkeleton()): Skeleton {
  place(out, STAND_PELVIS, d);
  const lowest = Math.min(out.lAnkle.y, out.rAnkle.y);
  const grounded = STAND_PELVIS + (L.ankleH - lowest);
  let pelvisY = grounded;
  if (lift > 0.08) pelvisY = grounded + (lift - 0.08) * 2;
  else if (lift < -0.06) pelvisY = Math.min(grounded, STAND_PELVIS + lift * 1.1);
  pelvisY = Math.max(0.35, pelvisY);
  place(out, pelvisY, d);
  if (out.lAnkle.y < L.ankleH) plantLeg(out.lHip, out.lKnee, out.lAnkle, out.lToe);
  if (out.rAnkle.y < L.ankleH) plantLeg(out.rHip, out.rKnee, out.rAnkle, out.rToe);
  return out;
}

/** 2D sample points across the body (wall plane), used for fit tests. */
export interface Sample { x: number; y: number; bone: number }

export function sampleBody(s: Skeleton, out: Sample[] = []): Sample[] {
  out.length = 0;
  BONES.forEach(([a, b], bi) => {
    const pa = s[a], pb = s[b];
    const len = Math.hypot(pb.x - pa.x, pb.y - pa.y);
    const n = Math.max(2, Math.ceil(len / 0.06));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      out.push({ x: pa.x + (pb.x - pa.x) * t, y: pa.y + (pb.y - pa.y) * t, bone: bi });
    }
  });
  // Head outline (bone index -1 = head).
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    out.push({ x: s.head.x + Math.cos(a) * L.headR * 0.9, y: s.head.y + Math.sin(a) * L.headR * 0.9, bone: -1 });
  }
  return out;
}
