/**
 * Orientation helpers for quaternions produced by the sword-relay controller's
 * `quaternionFromOrientation(alpha, beta, gamma)`.
 *
 * NOTE: that function's formula is the Z·Y·X (yaw-pitch-roll) composition
 * q = Rz(alpha)·Ry(gamma)·Rx(beta), not the W3C intrinsic Z-X'-Y'' order. To
 * be exact with both the original and our controller (which keeps the same
 * function byte-for-byte), we decompose the quaternion back into the
 * deviceorientation angles and rebuild the true W3C pointing direction.
 *
 * World frame (W3C): x = east, y = north, z = up. Device frame: +Y is the top
 * edge of the phone (the "blade"), +Z out of the screen.
 */

const RAD = Math.PI / 180;

export interface DeviceAngles {
  /** degrees, W3C deviceorientation alpha (about world Z) */
  alpha: number;
  /** degrees, beta (about device X) */
  beta: number;
  /** degrees, gamma (about device Y) */
  gamma: number;
}

/** Inverse of sword-relay's quaternionFromOrientation. */
export function anglesFromSwordQuat(q: readonly [number, number, number, number]): DeviceAngles {
  let [x, y, z, w] = q;
  const n = Math.hypot(x, y, z, w) || 1;
  x /= n; y /= n; z /= n; w /= n;
  const alpha = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
  const sinG = Math.max(-1, Math.min(1, 2 * (w * y - z * x)));
  const gamma = Math.asin(sinG);
  const beta = Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y));
  return { alpha: alpha / RAD, beta: beta / RAD, gamma: gamma / RAD };
}

/**
 * World-space direction of the device +Y axis for W3C angles:
 * Rz(alpha)·Rx(beta)·Ry(gamma)·(0,1,0) = Rz(alpha)·(0, cos beta, sin beta).
 * gamma (roll about the blade) does not affect it.
 */
export function bladeDirection(a: DeviceAngles, out: [number, number, number] = [0, 0, 0]): [number, number, number] {
  const al = a.alpha * RAD;
  const be = a.beta * RAD;
  const cb = Math.cos(be);
  out[0] = -Math.sin(al) * cb;
  out[1] = Math.cos(al) * cb;
  out[2] = Math.sin(be);
  return out;
}

/**
 * Yaw / pitch (radians) of the blade direction. Yaw grows counter-clockwise
 * seen from above (like alpha), pitch is elevation above the horizon.
 */
export function bladeYawPitch(q: readonly [number, number, number, number]): { yaw: number; pitch: number } {
  const d = bladeDirection(anglesFromSwordQuat(q));
  return {
    yaw: Math.atan2(-d[0], d[1]),
    pitch: Math.asin(Math.max(-1, Math.min(1, d[2]))),
  };
}

/** Wrap an angle (radians) into (-PI, PI]. */
export function wrapAngle(a: number): number {
  a = (a + Math.PI) % (2 * Math.PI);
  if (a < 0) a += 2 * Math.PI;
  return a - Math.PI;
}

/** sword-relay's quaternionFromOrientation, verbatim (for tests / simulators). */
export function swordQuatFromOrientation(alpha: number, beta: number, gamma: number): [number, number, number, number] {
  const z = (alpha * RAD) / 2;
  const x = (beta * RAD) / 2;
  const y = (gamma * RAD) / 2;
  const cz = Math.cos(z), sz = Math.sin(z);
  const cx = Math.cos(x), sx = Math.sin(x);
  const cy = Math.cos(y), sy = Math.sin(y);
  return [
    sx * cy * cz - cx * sy * sz,
    cx * sy * cz + sx * cy * sz,
    cx * cy * sz - sx * sy * cz,
    cx * cy * cz + sx * sy * sz,
  ];
}
