import type { SensorSample } from '../contracts';

/** 'SEN1' little-endian magic used by the sword-relay controller. */
export const SEN1_MAGIC = 0x53454e31;
export const SEN1_BYTES = 40;

/** Decode a 40-byte SEN1 packet. Returns null if it is not one. */
export function decodeSen1(buf: ArrayBuffer | ArrayBufferView, receivedAt = performance.now()): SensorSample | null {
  const view =
    buf instanceof ArrayBuffer
      ? new DataView(buf)
      : new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (view.byteLength < SEN1_BYTES || view.getUint32(0, true) !== SEN1_MAGIC) return null;
  const f = (o: number) => view.getFloat32(o, true);
  const quat: [number, number, number, number] = [f(12), f(16), f(20), f(24)];
  const accel: [number, number, number] = [f(28), f(32), f(36)];
  if (!quat.every(Number.isFinite)) return null;
  for (let i = 0; i < 3; i++) if (!Number.isFinite(accel[i])) accel[i] = 0;
  return { seq: view.getUint32(4, true), t: view.getUint32(8, true), quat, accel, receivedAt };
}

/** Encode a sample as SEN1 (used by tests / demo simulators). */
export function encodeSen1(s: Pick<SensorSample, 'seq' | 't' | 'quat' | 'accel'>): ArrayBuffer {
  const buf = new ArrayBuffer(SEN1_BYTES);
  const v = new DataView(buf);
  v.setUint32(0, SEN1_MAGIC, true);
  v.setUint32(4, s.seq >>> 0, true);
  v.setUint32(8, s.t >>> 0, true);
  s.quat.forEach((q, i) => v.setFloat32(12 + i * 4, q, true));
  s.accel.forEach((a, i) => v.setFloat32(28 + i * 4, a, true));
  return buf;
}

/** base64 -> ArrayBuffer (relay fallback may carry SEN1 as "b64:<data>"). */
export function base64ToBuffer(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}
