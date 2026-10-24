import { describe, expect, it } from 'vitest';
import {
  BUTTON_ORDER,
  SEN1_MAGIC,
  SEN2_SIZE,
  buttonBit,
  buttonsFromMask,
  decodePacket,
  encodeSen2,
  legacyQuatFromEuler,
  quatFromEuler,
  seqDelta,
} from './packets';
import { Euler, Quaternion } from 'three';

const sameRot = (a: { x: number; y: number; z: number; w: number }, b: { x: number; y: number; z: number; w: number }) =>
  Math.abs(a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w);

describe('SEN2 codec', () => {
  it('round-trips every field', () => {
    const q = quatFromEuler(30, 80, -20);
    const buf = encodeSen2({
      seq: 4294967295,
      t: 123456,
      q,
      acc: { x: 1.5, y: -2.25, z: 9.5 },
      gyro: { alpha: 100, beta: -200, gamma: 300 },
      buttons: buttonBit('swing') | buttonBit('minus'),
    });
    expect(buf.byteLength).toBe(SEN2_SIZE);
    const p = decodePacket(buf)!;
    expect(p.seq).toBe(4294967295);
    expect(p.t).toBe(123456);
    expect(sameRot(p.q, q)).toBeCloseTo(1, 5);
    expect(p.acc).toEqual({ x: 1.5, y: -2.25, z: 9.5 });
    expect(p.gyro).toEqual({ alpha: 100, beta: -200, gamma: 300 });
    expect(buttonsFromMask(p.buttons)).toEqual(['swing', 'minus']);
  });

  it('decodes from a Uint8Array view with an offset', () => {
    const inner = encodeSen2({ seq: 7, t: 8, q: { x: 0, y: 0, z: 0, w: 1 }, acc: { x: 0, y: 0, z: 0 }, gyro: { alpha: 0, beta: 0, gamma: 0 }, buttons: 3 });
    const big = new Uint8Array(SEN2_SIZE + 5);
    big.set(new Uint8Array(inner), 5);
    const p = decodePacket(new Uint8Array(big.buffer, 5, SEN2_SIZE))!;
    expect(p.seq).toBe(7);
    expect(p.buttons).toBe(3);
  });

  it('rejects junk, wrong magic and truncated packets', () => {
    expect(decodePacket(new ArrayBuffer(10))).toBeNull();
    expect(decodePacket(new ArrayBuffer(56))).toBeNull();
    const b = encodeSen2({ seq: 1, t: 1, q: { x: 0, y: 0, z: 0, w: 1 }, acc: { x: 0, y: 0, z: 0 }, gyro: { alpha: 0, beta: 0, gamma: 0 }, buttons: 0 });
    expect(decodePacket(b.slice(0, 48))).toBeNull();
  });

  it('sanitises NaN and zero quaternions', () => {
    const b = encodeSen2({ seq: 1, t: 1, q: { x: 0, y: 0, z: 0, w: 0 }, acc: { x: NaN, y: 1, z: Infinity }, gyro: { alpha: 0, beta: 0, gamma: 0 }, buttons: 0 });
    const p = decodePacket(b)!;
    expect(p.q).toEqual({ x: 0, y: 0, z: 0, w: 1 });
    expect(p.acc).toEqual({ x: 0, y: 1, z: 0 });
  });
});

describe('golf button order', () => {
  it('uses the documented bit order', () => {
    const order = ['swing', 'a', 'b', 'up', 'down', 'left', 'right', 'minus', 'plus', 'map', 'pause', 'recenter'] as const;
    expect([...BUTTON_ORDER]).toEqual([...order]);
    order.forEach((b, i) => expect(buttonBit(b)).toBe(1 << i));
    expect(buttonsFromMask(buttonBit('recenter') | buttonBit('swing') | buttonBit('map'))).toEqual(['swing', 'map', 'recenter']);
  });
});

describe('SEN1 (legacy)', () => {
  const sen1 = (alpha: number, beta: number, gamma: number) => {
    const q = legacyQuatFromEuler(alpha, beta, gamma);
    const buf = new ArrayBuffer(40);
    const v = new DataView(buf);
    v.setUint32(0, SEN1_MAGIC, true);
    v.setUint32(4, 42, true);
    v.setUint32(8, 1000, true);
    [q.x, q.y, q.z, q.w, 0.5, -0.5, 2].forEach((f, i) => v.setFloat32(12 + i * 4, f, true));
    return buf;
  };

  it('decodes with zero gyro and no buttons', () => {
    const p = decodePacket(sen1(0, 0, 0))!;
    expect(p.seq).toBe(42);
    expect(p.t).toBe(1000);
    expect(p.gyro).toEqual({ alpha: 0, beta: 0, gamma: 0 });
    expect(p.buttons).toBe(0);
    expect(p.acc.x).toBeCloseTo(0.5);
  });

  it('repairs the legacy Euler order into the W3C Z-X-Y quaternion', () => {
    for (const [a, b, g] of [
      [30, 70, -20],
      [200, -120, 45],
      [10, 90, 5],
      [350, 10, -80],
    ]) {
      const p = decodePacket(sen1(a, b, g))!;
      expect(sameRot(p.q, quatFromEuler(a, b, g))).toBeCloseTo(1, 4);
    }
  });
});

describe('quatFromEuler', () => {
  it('matches three.js ZXY Euler composition', () => {
    const d = Math.PI / 180;
    for (const [a, b, g] of [
      [0, 90, 0],
      [45, 30, -60],
      [300, -170, 85],
    ]) {
      const q = quatFromEuler(a, b, g);
      const ref = new Quaternion().setFromEuler(new Euler(b * d, g * d, a * d, 'ZXY'));
      expect(sameRot(q, ref)).toBeCloseTo(1, 6);
    }
  });
});

describe('seqDelta', () => {
  it('handles wrap-around', () => {
    expect(seqDelta(4294967295, 0)).toBe(1);
    expect(seqDelta(5, 3)).toBe(-2);
  });
});
