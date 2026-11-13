/**
 * Exemoo phone ↔ screen protocol, shared by the phone pad, the screen shell, the game SDK and the
 * tests. Dependency-free ES module (runs in browsers and Node).
 *
 * Wire format is the table-tennis / golf one, so ported games keep working:
 *
 * SEN2 sensor packet (56 bytes, little-endian), sent ~60 Hz on the unreliable 'sensor' channel
 * (or as a binary WebSocket frame in relay mode):
 *   off  type   field
 *    0   u32    magic 0x53454e32 ('SEN2')
 *    4   u32    seq (wraps)
 *    8   u32    t   phone clock, ms (wraps)
 *   12   f32×4  qx, qy, qz, qw   orientation (W3C alpha/beta/gamma, intrinsic Z-X'-Y'')
 *   28   f32×3  ax, ay, az       linear acceleration m/s², device frame
 *   40   f32×3  gyro alpha, beta, gamma   rotation rate deg/s
 *   52   u32    buttons bitmask (bit i = BUTTON_ORDER[i] held)
 * SEN1 (40 bytes, legacy sword-relay controller) decodes too, with zero gyro/buttons.
 *
 * Control messages (JSON) on the reliable 'control' channel (or {type:'relay', payload}):
 *   phone → screen  {t:'hello', ua, motion}  {t:'button', b}  {t:'move', dx, dy}  {t:'center'}
 *                   {t:'calibrate', phase}  {t:'motion', on}  {t:'ping', ts}  {t:'pong', ts, pt}
 *                   (pt = phone clock at reply, same base as SEN2 `t`: the screen syncs to it)
 *   screen → phone  {t:'layout', layout, title?}  {t:'stream', on}  {t:'haptic', pattern}  {t:'sound', name, q}
 *                   {t:'theme', color}  {t:'ping'|'pong', ts}
 */

export const SEN1_MAGIC = 0x53454e31;
export const SEN2_MAGIC = 0x53454e32;
export const SEN1_SIZE = 40;
export const SEN2_SIZE = 56;

/** Bit order of the SEN2 `buttons` field (first nine match table-tennis / golf). */
export const BUTTON_ORDER = ['action', 'pause', 'recenter', 'up', 'down', 'left', 'right', 'back', 'power', 'home'];

/** Older names used by the first landing-page pad. */
const ALIASES = { a: 'action', b: 'back', select: 'action' };
export const normalizeButton = (b) => ALIASES[b] || b;

/**
 * Pad layouts the screen can ask for with {t:'layout', layout}. Every layout has a Home button
 * that returns to the Exemoo menu.
 *   menu    air pointer + d-pad + Action/Back          (the landing page)
 *   swing   big hold-to-swing button, motion streamed   (golf, table tennis, tennis, cricket)
 *   slice   whole screen is the blade, motion streamed  (fruit slice)
 *   remote  d-pad + Action + Pause, no motion           (camera games: pose match, farm dash)
 *   kart    tilt / button steering wheel + DRIFT BRAKE ITEM GAS, sends {t:'in'} (farm kart; js/pad-kart.js)
 */
export const LAYOUTS = ['menu', 'swing', 'slice', 'remote', 'kart'];

export function buttonBit(b) {
  const i = BUTTON_ORDER.indexOf(normalizeButton(b));
  return i < 0 ? 0 : 1 << i;
}

export function buttonsFromMask(mask) {
  const out = [];
  for (let i = 0; i < BUTTON_ORDER.length; i++) if (mask & (1 << i)) out.push(BUTTON_ORDER[i]);
  return out;
}

/** W3C DeviceOrientation (degrees) → quaternion. R = Rz(alpha)·Rx(beta)·Ry(gamma). */
export function quatFromEuler(alpha, beta, gamma) {
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

/** Recover alpha/beta/gamma from a legacy SEN1 (Z-Y'-X'') quaternion and rebuild it correctly. */
export function repairLegacyQuat({ x, y, z, w }) {
  const m11 = 1 - 2 * (y * y + z * z);
  const m12 = 2 * (x * y - w * z);
  const m21 = 2 * (x * y + w * z);
  const m22 = 1 - 2 * (x * x + z * z);
  const m31 = 2 * (x * z - w * y);
  const m32 = 2 * (y * z + w * x);
  const m33 = 1 - 2 * (x * x + y * y);
  const ry = Math.asin(Math.max(-1, Math.min(1, -m31)));
  let rx, rz;
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
export function encodeSen2(p, out) {
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

const finite = (n) => (Number.isFinite(n) ? n : 0);

/** Decode a SEN1 or SEN2 packet; null for anything else. Non-finite floats become 0. */
export function decodePacket(data, { repairLegacy = true } = {}) {
  let v;
  if (data instanceof ArrayBuffer) v = new DataView(data);
  else if (ArrayBuffer.isView(data)) v = new DataView(data.buffer, data.byteOffset, data.byteLength);
  else return null;
  if (v.byteLength < SEN1_SIZE) return null;
  const magic = v.getUint32(0, true);
  const isV2 = magic === SEN2_MAGIC;
  if (!isV2 && magic !== SEN1_MAGIC) return null;
  if (isV2 && v.byteLength < SEN2_SIZE) return null;

  let q = { x: finite(v.getFloat32(12, true)), y: finite(v.getFloat32(16, true)), z: finite(v.getFloat32(20, true)), w: finite(v.getFloat32(24, true)) };
  const n = Math.hypot(q.x, q.y, q.z, q.w);
  q = n < 1e-6 ? { x: 0, y: 0, z: 0, w: 1 } : { x: q.x / n, y: q.y / n, z: q.z / n, w: q.w / n };
  if (!isV2 && repairLegacy) q = repairLegacyQuat(q);

  return {
    seq: v.getUint32(4, true),
    t: v.getUint32(8, true),
    q,
    acc: { x: finite(v.getFloat32(28, true)), y: finite(v.getFloat32(32, true)), z: finite(v.getFloat32(36, true)) },
    gyro: isV2
      ? { alpha: finite(v.getFloat32(40, true)), beta: finite(v.getFloat32(44, true)), gamma: finite(v.getFloat32(48, true)) }
      : { alpha: 0, beta: 0, gamma: 0 },
    buttons: isV2 ? v.getUint32(52, true) : 0,
  };
}

/** Signed distance between two u32 sequence numbers (b − a), handling wrap. */
export const seqDelta = (a, b) => (b - a) | 0;

/** Tiny event emitter used by the links and the SDK. */
export class Emitter {
  #l = new Map();
  on(ev, cb) {
    if (!this.#l.has(ev)) this.#l.set(ev, new Set());
    this.#l.get(ev).add(cb);
    return () => this.#l.get(ev)?.delete(cb);
  }
  emit(ev, ...args) {
    for (const cb of this.#l.get(ev) || []) {
      try {
        cb(...args);
      } catch (e) {
        console.error(`[exemoo] ${ev} listener failed`, e);
      }
    }
  }
}

export const STUN = [{ urls: 'stun:stun.l.google.com:19302' }];

/** Pairing endpoint (HTTP polling, see poll-socket.js and server/pairing.js). */
export function defaultSignalUrl() {
  if (typeof location === 'undefined') return 'http://localhost:8080/api/signal';
  return `${location.origin}/api/signal`;
}
