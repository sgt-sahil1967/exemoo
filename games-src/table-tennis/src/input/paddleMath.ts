/**
 * Orientation helpers shared by PhoneInput and MouseInput.
 *
 * Frames
 *  - Device (W3C): x = screen right, y = screen top, z = out of the screen.
 *  - Earth  (W3C): X = east, Y = north, Z = up.  q_device maps device → earth.
 *  - World  (game): X = right, Y = up, Z = toward the player (player looks along −Z).
 *
 * Neutral pose: phone upright in portrait (top up), screen facing the player, back of the
 * phone (= the paddle's hitting face) toward the opponent. In that pose device axes == world axes,
 * so the paddle's world-frame delta rotation is  R = Yo · C · q · B
 * where C maps earth → world (−90° about X), Yo is a yaw-only heading correction about world Y and
 * B is a device-frame grip offset captured at recenter (identity = the ideal upright pose).
 */
import { Quaternion, Vector3 } from 'three';

export const DEG = Math.PI / 180;

/** Earth (Z-up) → world (Y-up, north = −Z). */
export const EARTH_TO_WORLD = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
export const WORLD_TO_EARTH = EARTH_TO_WORLD.clone().invert();

const _v = new Vector3();
const _q = new Quaternion();

/** World-frame yaw of a paddle rotation: heading of its hitting-face normal (0 = toward −Z, + = toward −X/left). */
export function yawOf(R: Quaternion): number {
  const f = _v.set(0, 0, -1).applyQuaternion(R);
  // If the face points mostly up/down the heading of the blade tip's perpendicular is more stable.
  if (Math.abs(f.y) > 0.92) {
    const r = new Vector3(1, 0, 0).applyQuaternion(R);
    return Math.atan2(-r.z, r.x);
  }
  return Math.atan2(-f.x, -f.z);
}

export function yawQuat(angle: number, out = new Quaternion()): Quaternion {
  return out.setFromAxisAngle(_v.set(0, 1, 0), angle);
}

export interface PaddleAngles {
  /** Heading of the hitting face, rad, + = right. */
  aim: number;
  /** Elevation of the hitting face normal, rad, + = open (toward the sky). */
  face: number;
  /** Lean of the blade tip sideways, rad, + = tip to the player's left. */
  lean: number;
  /** True when the screen side (rather than the back) faces the opponent. */
  flipped: boolean;
}

/** Decompose a world-frame paddle delta rotation into gameplay angles (singularity-tolerant). */
export function paddleAngles(R: Quaternion): PaddleAngles {
  const f = new Vector3(0, 0, -1).applyQuaternion(R); // back of phone
  const u = new Vector3(0, 1, 0).applyQuaternion(R); // blade tip
  const flipped = f.z > 0.35; // back faces the player → the screen is the hitting face
  const h = flipped ? f.negate() : f;
  const horiz = Math.hypot(h.x, h.z);
  const aim = horiz > 0.2 ? Math.atan2(h.x, -h.z) : -yawOf(R);
  const face = Math.asin(Math.max(-1, Math.min(1, h.y)));
  const lean = Math.atan2(-u.x, Math.max(1e-3, Math.hypot(u.y, u.z)));
  return { aim, face, lean, flipped };
}

/** Synthesize a paddle rotation from yaw (+ = turn right), pitch (+ = open face) and roll (+ = tip left). */
export function composePaddle(aimRad: number, faceRad: number, rollRad: number, out = new Quaternion()): Quaternion {
  // Ry(−aim) · Rx(face) · Rz(roll): yaw to the right is a negative rotation about +Y.
  out.setFromAxisAngle(_v.set(0, 1, 0), -aimRad);
  _q.setFromAxisAngle(_v.set(1, 0, 0), faceRad);
  out.multiply(_q);
  _q.setFromAxisAngle(_v.set(0, 0, 1), rollRad);
  return out.multiply(_q);
}

/** Angular velocity (rad/s, world frame) that rotates `a` into `b` over dt (both world-frame). */
export function angularVelocity(a: Quaternion, b: Quaternion, dt: number, out = new Vector3()): Vector3 {
  // Δ = b · a⁻¹  (world-frame increment)
  const d = _q.copy(a).invert().premultiply(b);
  if (d.w < 0) d.set(-d.x, -d.y, -d.z, -d.w);
  const s = Math.sqrt(Math.max(0, 1 - d.w * d.w));
  const angle = 2 * Math.atan2(s, d.w);
  if (s < 1e-9 || dt <= 0) return out.set(0, 0, 0);
  const k = angle / (s * dt);
  return out.set(d.x * k, d.y * k, d.z * k);
}

export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
