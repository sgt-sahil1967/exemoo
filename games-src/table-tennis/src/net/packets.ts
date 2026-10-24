/**
 * SPINSHOT sensor wire format (shared by the phone controller and the game).
 *
 * All values little-endian.
 *
 * SEN2 (56 bytes) — sent by src/controller/main.ts
 *   off  type  field
 *    0   u32   magic 0x53454e32 ('SEN2')
 *    4   u32   seq (wraps)
 *    8   u32   t   phone clock, ms (wraps)
 *   12   f32×4 qx, qy, qz, qw   device orientation (W3C alpha/beta/gamma, intrinsic Z-X'-Y'')
 *   28   f32×3 ax, ay, az       linear acceleration m/s² (device frame; may include gravity on
 *                               devices without `event.acceleration`)
 *   40   f32×3 gyroAlpha, gyroBeta, gyroGamma   rotationRate deg/s (alpha=z, beta=x, gamma=y)
 *   52   u32   buttons bitmask (bit i = BUTTON_ORDER[i] held; bit 8 = 'power' slow-mo)
 *
 * SEN1 (40 bytes) — legacy sword-relay controller: same as SEN2 up to byte 40, no gyro/buttons.
 * Note: the legacy controller built its quaternion with the wrong Euler order (Z-Y'-X''); by
 * default decodePacket() repairs it so SEN1 and SEN2 quaternions mean the same thing.
 *
 * This module must stay dependency-free (it is bundled into the phone page).
 */
import type { ControllerButton, SensorPacket } from '../core/contracts';

export const SEN1_MAGIC = 0x53454e31;
export const SEN2_MAGIC = 0x53454e32;
export const SEN1_SIZE = 40;
export const SEN2_SIZE = 56;

/** Bit order of the SEN2 `buttons` field. */
export const BUTTON_ORDER: readonly ControllerButton[] = [
  'action',
  'pause',
  'recenter',
  'up',
  'down',
  'left',
  'right',
  'back',
  'power',
];

export function buttonBit(b: ControllerButton): number {
  const i = BUTTON_ORDER.indexOf(b);
  return i < 0 ? 0 : 1 << i;
}

export function buttonsFromMask(mask: number): ControllerButton[] {
  const out: ControllerButton[] = [];
  for (let i = 0; i < BUTTON_ORDER.length; i++) if (mask & (1 << i)) out.push(BUTTON_ORDER[i]);
  return out;
}

export interface Quat {
  x: number;
  y: number;
  z: number;
  w: number;
}

/** W3C DeviceOrientation (degrees) → quaternion. R = Rz(alpha)·Rx(beta)·Ry(gamma). */
export function quatFromEuler(alpha: number, beta: number, gamma: number): Quat {
  const d = Math.PI / 360; // deg → rad, halved
  const z = (alpha || 0) * d;
  const x = (beta || 0) * d;
  const y = (gamma || 0) * d;
  const cz = Math.cos(z), sz = Math.sin(z);
  const cx = Math.cos(x), sx = Math.sin(x);
  const cy = Math.cos(y), sy = Math.sin(y);
  return {
    x: sx * cy * cz - cx * sy * sz,
    y: cx * sy * cz + sx * cy * sz,
    z: cx * cy * sz + sx * sy * cz,
    w: cx * cy * cz - sx * sy * sz,
  };
}

/** The legacy SEN1 controller's (incorrect, Z-Y'-X'') quaternion construction. Exported for tests. */
export function legacyQuatFromEuler(alpha: number, beta: number, gamma: number): Quat {
  const d = Math.PI / 360;
  const z = (alpha || 0) * d;
  const x = (beta || 0) * d;
  const y = (gamma || 0) * d;
  const cz = Math.cos(z), sz = Math.sin(z);
  const cx = Math.cos(x), sx = Math.sin(x);
  const cy = Math.cos(y), sy = Math.sin(y);
  return {
    x: sx * cy * cz - cx * sy * sz,
    y: cx * sy * cz + sx * cy * sz,
    z: cx * cy * sz - sx * sy * cz,
    w: cx * cy * cz + sx * sy * sz,
  };
}

/** Recover alpha/beta/gamma from a legacy (Z-Y'-X'') quaternion and rebuild it correctly. */
export function repairLegacyQuat(q: Quat): Quat {
  const { x, y, z, w } = q;
  const m11 = 1 - 2 * (y * y + z * z);
  const m12 = 2 * (x * y - w * z);
  const m21 = 2 * (x * y + w * z);
  const m22 = 1 - 2 * (x * x + z * z);
  const m31 = 2 * (x * z - w * y);
  const m32 = 2 * (y * z + w * x);
  const m33 = 1 - 2 * (x * x + y * y);
  const ry = Math.asin(Math.max(-1, Math.min(1, -m31)));
  let rx: number, rz: number;
  if (Math.abs(m31) < 0.9999999) {
    rx = Math.atan2(m32, m33);
    rz = Math.atan2(m21, m11);
  } else {
    rx = 0;
    rz = Math.atan2(-m12, m22);
  }
  const r2d = 180 / Math.PI;
  return quatFromEuler(rz * r2d, rx * r2d, ry * r2d);
}

/** Encode a SEN2 packet. Reuses `out` when given (must be ≥ 56 bytes). */
export function encodeSen2(p: SensorPacket, out?: ArrayBuffer): ArrayBuffer {
  const buf = out ?? new ArrayBuffer(SEN2_SIZE);
  const v = new DataView(buf);
  v.setUint32(0, SEN2_MAGIC, true);
  v.setUint32(4, p.seq >>> 0, true);
  v.setUint32(8, p.t >>> 0, true);
  v.setFloat32(12, p.q.x, true);
  v.setFloat32(16, p.q.y, true);
  v.setFloat32(20, p.q.z, true);
  v.setFloat32(24, p.q.w, true);
  v.setFloat32(28, p.acc.x, true);
  v.setFloat32(32, p.acc.y, true);
  v.setFloat32(36, p.acc.z, true);
  v.setFloat32(40, p.gyro.alpha, true);
  v.setFloat32(44, p.gyro.beta, true);
  v.setFloat32(48, p.gyro.gamma, true);
  v.setUint32(52, p.buttons >>> 0, true);
  return buf;
}

const finite = (n: number) => (Number.isFinite(n) ? n : 0);

/**
 * Decode a SEN1 or SEN2 packet. Returns null for anything else (wrong magic / too short / junk).
 * Non-finite floats are zeroed; a degenerate quaternion becomes identity.
 */
export function decodePacket(
  data: ArrayBuffer | ArrayBufferView,
  opts: { repairLegacy?: boolean } = {},
): SensorPacket | null {
  let v: DataView;
  if (data instanceof ArrayBuffer) v = new DataView(data);
  else if (ArrayBuffer.isView(data)) v = new DataView(data.buffer, data.byteOffset, data.byteLength);
  else return null;
  if (v.byteLength < SEN1_SIZE) return null;
  const magic = v.getUint32(0, true);
  const isV2 = magic === SEN2_MAGIC;
  if (!isV2 && magic !== SEN1_MAGIC) return null;
  if (isV2 && v.byteLength < SEN2_SIZE) return null;

  let q: Quat = {
    x: finite(v.getFloat32(12, true)),
    y: finite(v.getFloat32(16, true)),
    z: finite(v.getFloat32(20, true)),
    w: finite(v.getFloat32(24, true)),
  };
  const n = Math.hypot(q.x, q.y, q.z, q.w);
  if (n < 1e-6) q = { x: 0, y: 0, z: 0, w: 1 };
  else q = { x: q.x / n, y: q.y / n, z: q.z / n, w: q.w / n };
  if (!isV2 && opts.repairLegacy !== false) q = repairLegacyQuat(q);

  return {
    seq: v.getUint32(4, true),
    t: v.getUint32(8, true),
    q,
    acc: {
      x: finite(v.getFloat32(28, true)),
      y: finite(v.getFloat32(32, true)),
      z: finite(v.getFloat32(36, true)),
    },
    gyro: isV2
      ? {
          alpha: finite(v.getFloat32(40, true)),
          beta: finite(v.getFloat32(44, true)),
          gamma: finite(v.getFloat32(48, true)),
        }
      : { alpha: 0, beta: 0, gamma: 0 },
    buttons: isV2 ? v.getUint32(52, true) : 0,
  };
}

/** Signed distance between two u32 sequence numbers (b − a), handling wrap. */
export function seqDelta(a: number, b: number): number {
  return ((b - a) | 0);
}
