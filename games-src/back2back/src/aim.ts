// Phone aim: turns the phone's orientation into a crosshair position on the TV.
// Same maths as Straw Shot (games/straw-shot/game.js): hold the phone like a remote with its top edge
// at the screen; Recenter sets the centre. Without an orientation sensor it integrates the gyro rate,
// like the Exemoo menu pointer.

export interface Quat {
  x: number;
  y: number;
  z: number;
  w: number;
}
interface V3 {
  x: number;
  y: number;
  z: number;
}

const R2D = 180 / Math.PI;
/** Degrees of phone turn from centre to the left / right screen edge, and tilt to the top / bottom edge. */
const AIM_YAW = 26;
const AIM_PITCH = 16;
/** Crosshair centre (fraction of the screen) when the phone is at rest. */
const CENTRE_X = 0.5;
const CENTRE_Y = 0.56;

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const wrapDeg = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;

/** v' = q v q* */
export function rotate(v: V3, q: Quat): V3 {
  const tx = 2 * (q.y * v.z - q.z * v.y);
  const ty = 2 * (q.z * v.x - q.x * v.z);
  const tz = 2 * (q.x * v.y - q.y * v.x);
  return {
    x: v.x + q.w * tx + (q.y * tz - q.z * ty),
    y: v.y + q.w * ty + (q.z * tx - q.x * tz),
    z: v.z + q.w * tz + (q.x * ty - q.y * tx),
  };
}

interface Ref {
  axis: V3;
  yaw: number;
  pitch: number;
}

/** Pick the phone axis that points at the screen: the top edge, or the back if the top points at the ceiling. */
function makeRef(q: Quat): Ref {
  let axis: V3 = { x: 0, y: 1, z: 0 };
  let v = rotate(axis, q);
  if (Math.abs(v.z) > 0.82) {
    axis = { x: 0, y: 0, z: -1 };
    v = rotate(axis, q);
  }
  return { axis, yaw: Math.atan2(v.x, v.y) * R2D, pitch: Math.asin(clamp(v.z, -1, 1)) * R2D };
}

export interface AimPacket {
  t: number;
  q?: Quat;
  gyro?: { alpha: number; beta: number; gamma: number };
}

export class Aimer {
  /** Crosshair position as fractions of the screen (0..1). */
  rx = CENTRE_X;
  ry = CENTRE_Y;
  private ref: Ref | null = null;
  private qLive = false;
  private gyroYaw = 0;
  private gyroPitch = 0;
  private lastT = 0;

  push(pkt: AimPacket): void {
    const q = pkt.q ?? { x: 0, y: 0, z: 0, w: 1 };
    if (!this.qLive && Math.abs(q.x) + Math.abs(q.y) + Math.abs(q.z) > 1e-4) {
      this.qLive = true;
      this.ref = null;
    }
    const dt = this.lastT ? clamp((((pkt.t - this.lastT) >>> 0) || 16) / 1000, 0, 0.1) : 0;
    this.lastT = pkt.t;
    let yaw: number;
    let pitch: number;
    if (this.qLive) {
      if (!this.ref) this.ref = makeRef(q);
      const v = rotate(this.ref.axis, q);
      yaw = wrapDeg(Math.atan2(v.x, v.y) * R2D - this.ref.yaw);
      pitch = Math.asin(clamp(v.z, -1, 1)) * R2D - this.ref.pitch;
    } else {
      const gy = pkt.gyro ?? { alpha: 0, beta: 0, gamma: 0 };
      if (Math.abs(gy.beta) > 2) this.gyroYaw -= gy.beta * dt;
      if (Math.abs(gy.alpha) > 2) this.gyroPitch += gy.alpha * dt;
      this.gyroYaw = clamp(this.gyroYaw, -AIM_YAW * 1.1, AIM_YAW * 1.1);
      this.gyroPitch = clamp(this.gyroPitch, -AIM_PITCH * 1.1, AIM_PITCH * 1.1);
      yaw = this.gyroYaw;
      pitch = this.gyroPitch;
    }
    this.rx = clamp(CENTRE_X + yaw / (2 * AIM_YAW), 0.02, 0.98);
    this.ry = clamp(CENTRE_Y - pitch / (2 * AIM_PITCH), 0.04, 0.9);
  }

  recenter(): void {
    this.ref = null;
    this.gyroYaw = 0;
    this.gyroPitch = 0;
    this.rx = CENTRE_X;
    this.ry = CENTRE_Y;
  }
}
