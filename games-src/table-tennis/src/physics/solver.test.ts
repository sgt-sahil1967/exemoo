import { describe, expect, test } from 'vitest';
import { Vector3 } from 'three';
import { HALF_L, HALF_W, TABLE, sideSign, type BallEvent, type Side } from '../core/contracts';
import { Ball } from './ball';
import { findIntercept, hittableWindow, solveServe, solveShot } from './solver';

const TOP = TABLE.height;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function events(from: Vector3, vel: Vector3, spin: Vector3, maxT = 3): BallEvent[] {
  const b = new Ball();
  b.set(from, vel, spin);
  const out: BallEvent[] = [];
  for (let t = 0; t < maxT; t += 1 / 120) {
    out.push(...b.step(1 / 120));
    if (out.some((e) => e.type === 'floor' || e.type === 'out')) break;
  }
  return out;
}

/** Spin vector for a shot travelling toward −Z (player hitting): top > 0 = topspin. */
const spinFor = (top: number, side = 0) => new Vector3(-top, side, 0);

describe('solveShot', () => {
  test('lands within 3 cm of the target across a grid (error = 0) and clears the net', () => {
    let n = 0, worst = 0, netHits = 0;
    const t0 = performance.now();
    for (const fx of [-0.7, 0, 0.6])
      for (const fz of [HALF_L - 0.3, HALF_L + 0.3, HALF_L + 1.2])
        for (const fh of [0.08, 0.25, 0.5])
          for (const speed of [5, 9, 14, 20])
            for (const top of [-400, 0, 300, 700])
              for (const [tx, tz] of [[-0.6, -0.4], [0.5, -1.2], [0, -0.9]]) {
                const from = new Vector3(fx, TOP + fh, fz);
                const target = new Vector3(tx, TOP, tz);
                const { vel, spin } = solveShot(from, { target, speed, spin: spinFor(top, 60), error: 0 });
                const evs = events(from, vel, spin);
                const first = evs.find((e) => e.type === 'bounce' || e.type === 'edge' || e.type === 'floor');
                if (evs.some((e) => e.type === 'net')) netHits++;
                const d = first ? Math.hypot(first.pos.x - tx, first.pos.z - tz) : 99;
                n++;
                worst = Math.max(worst, d);
                if (fh >= 0.25) expect(d).toBeLessThan(0.03);
              }
    const ms = (performance.now() - t0) / n;
    // low balls (8 cm over the table) from far back may be forced into a lob, still accurate:
    expect(worst).toBeLessThan(0.05);
    expect(netHits / n).toBeLessThan(0.02);
    expect(ms).toBeLessThan(4); // generous for CI; typically ≈0.5 ms
  });

  test('speed is respected when reachable, relaxed when the target is too short for it', () => {
    const from = new Vector3(0, TOP + 0.3, HALF_L + 0.5);
    const deep = solveShot(from, { target: new Vector3(0, TOP, -1.2), speed: 14, spin: spinFor(300), error: 0 });
    expect(deep.vel.length()).toBeCloseTo(14, 3);
    const short = solveShot(from, { target: new Vector3(0, TOP, -0.3), speed: 20, spin: spinFor(0), error: 0 });
    expect(short.vel.length()).toBeLessThan(15);
  });

  test('topspin needs a higher launch than backspin for the same target', () => {
    const from = new Vector3(0, TOP + 0.3, HALF_L + 0.5);
    const req = (top: number) => solveShot(from, { target: new Vector3(0, TOP, -1.1), speed: 12, spin: spinFor(top), error: 0 }).vel;
    expect(req(600).y).toBeGreaterThan(req(-400).y);
  });

  test('error perturbs landing spread proportionally', () => {
    const rng = mulberry32(42);
    const from = new Vector3(0, TOP + 0.3, HALF_L + 0.4);
    const spread = (error: number) => {
      let s = 0;
      for (let i = 0; i < 40; i++) {
        const { vel, spin } = solveShot(from, { target: new Vector3(0, TOP, -0.9), speed: 11, spin: spinFor(200), error }, rng);
        const first = events(from, vel, spin).find((e) => e.type === 'bounce' || e.type === 'edge' || e.type === 'floor');
        s += first ? Math.hypot(first.pos.x, first.pos.z + 0.9) : 2;
      }
      return s / 40;
    };
    const lo = spread(0.1), hi = spread(0.8);
    expect(lo).toBeLessThan(0.08);
    expect(hi).toBeGreaterThan(lo * 3);
  });

  test('works for the opponent side (shots toward +Z)', () => {
    const from = new Vector3(0.3, TOP + 0.25, -HALF_L - 0.5);
    const { vel, spin } = solveShot(from, { target: new Vector3(-0.4, TOP, 1.0), speed: 13, spin: new Vector3(400, 0, 0), error: 0 });
    const first = events(from, vel, spin).find((e) => e.type === 'bounce');
    expect(first && first.type === 'bounce' && first.side).toBe('player');
    expect(Math.hypot(first!.pos.x + 0.4, first!.pos.z - 1.0)).toBeLessThan(0.03);
  });
});

describe('solveServe', () => {
  const sides: Side[] = ['player', 'opponent'];
  test('serves bounce first on the server half, then on the receiver half near the target', () => {
    let close = 0, n = 0;
    for (const server of sides) {
      const s = sideSign(server);
      for (const depth of [0.45, 0.7, 1.15])
        for (const top of [-300, 0, 300])
          for (const tx of [-0.5, 0.4]) {
            const from = new Vector3(-0.2 * s, TOP + 0.27, s * (HALF_L + 0.2));
            const target = new Vector3(tx, TOP, -s * depth);
            // spin relative to travel direction (toward −s·Z)
            const spin = new Vector3(s * -top, 120, 0);
            const { vel, spin: sp } = solveServe(from, server, { target, speed: 5, spin, error: 0 });
            const b = events(from, vel, sp).filter((e) => e.type === 'bounce' || e.type === 'edge' || e.type === 'net');
            const bounces = b.filter((e) => e.type !== 'net');
            expect(bounces.length).toBeGreaterThanOrEqual(2);
            const [b1, b2] = bounces as Extract<BallEvent, { type: 'bounce' }>[];
            expect(b1.side).toBe(server);
            expect(b2.side).not.toBe(server);
            expect(b.findIndex((e) => e.type === 'net')).toBe(-1);
            n++;
            if (Math.hypot(b2.pos.x - tx, Math.abs(b2.pos.z) - depth) < 0.12) close++;
          }
    }
    expect(close / n).toBeGreaterThan(0.75);
  });
});

describe('findIntercept / hittableWindow', () => {
  const shot = (side: Side, target: Vector3, speed: number, top: number) => {
    const s = sideSign(side);
    const from = new Vector3(0.2, TOP + 0.3, -s * (HALF_L + 0.4));
    const spin = new Vector3(s * top, 0, 0);
    const r = solveShot(from, { target, speed, spin, error: 0 });
    return { pos: from, vel: r.vel, spin: r.spin };
  };

  test('chooses a point after exactly one bounce on the receiver half, in the comfortable zone', () => {
    for (const side of ['player', 'opponent'] as Side[]) {
      const s = sideSign(side);
      const st = shot(side, new Vector3(0.3, TOP, s * 1.0), 11, 300);
      const ic = findIntercept(st, side)!;
      expect(ic).not.toBeNull();
      const h = ic.pos.y - TOP;
      expect(h).toBeGreaterThan(0.02);
      expect(h).toBeLessThan(0.55);
      const dz = s * ic.pos.z - HALF_L;
      expect(dz).toBeGreaterThan(-0.35);
      expect(dz).toBeLessThan(1.6);
      expect(ic.vel.y).toBeLessThanOrEqual(0); // at/after the top of the bounce
      expect(Math.sign(ic.vel.z)).toBe(s);
      const win = hittableWindow(st, side);
      expect(win.length).toBeGreaterThan(5);
      expect(win.every((p) => p.bounces === 1)).toBe(true);
      expect(win.some((p) => p.t === ic.t)).toBe(true);
    }
  });

  test('returns null for balls that go long, into the net, or land on the wrong half', () => {
    const from = new Vector3(0, TOP + 0.3, -HALF_L - 0.4);
    expect(findIntercept({ pos: from, vel: new Vector3(0, 3.5, 18), spin: new Vector3() }, 'player')).toBeNull(); // long
    expect(findIntercept({ pos: new Vector3(0, TOP + 0.08, -0.5), vel: new Vector3(0, 0, 8), spin: new Vector3() }, 'player')).toBeNull(); // into the net
    const st = shot('player', new Vector3(0, TOP, 0.9), 10, 0);
    expect(findIntercept(st, 'opponent')).toBeNull();
  });

  test('short balls are reachable over the table', () => {
    const st = shot('player', new Vector3(0, TOP, 0.35), 5, -300);
    const ic = findIntercept(st, 'player');
    expect(ic).not.toBeNull();
    expect(ic!.pos.z).toBeGreaterThan(HALF_L - 0.8);
    expect(Math.abs(ic!.pos.x)).toBeLessThan(HALF_W);
  });
});
