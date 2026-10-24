import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import { BallState, PHYS_DT, predict, serviceBox, solveShot, stepBall, inBox, type BallEvent } from './ball';

function landing(from: Vector3, v: Vector3, spin: number) {
  const b = new BallState();
  b.p.copy(from);
  b.v.copy(v);
  b.spin = spin;
  const ev: BallEvent[] = [];
  for (let i = 0; i < 2000 && !ev.length; i++) stepBall(b, PHYS_DT, ev);
  return ev[0];
}

describe('ball physics', () => {
  it('solves a deep topspin groundstroke that clears the net', () => {
    const from = new Vector3(0.5, 1, 12);
    const target = new Vector3(-2, 0, -9.5);
    const v = solveShot(from, target, 28, 1, 0.35);
    const e = landing(from, v, 1);
    expect(e.type).toBe('bounce');
    expect(e.pos.distanceTo(new Vector3(target.x, e.pos.y, target.z))).toBeLessThan(0.4);
    console.log('groundstroke', v.length() * 3.6, 'km/h');
  });

  it('solves a flat serve into the deuce box', () => {
    const from = new Vector3(0.6, 2.75, 11.9);
    const box = serviceBox(0, 'deuce');
    const target = new Vector3(-2, 0, -5.5);
    const v = solveShot(from, target, 44, 0.3, 0.1);
    const e = landing(from, v, 0.3);
    expect(e.type).toBe('bounce');
    expect(inBox(e.pos, box)).toBe(true);
    console.log('serve', v.length() * 3.6, 'km/h');
  });

  it('predicts bounces in order', () => {
    const b = new BallState();
    b.p.set(0, 1, -11);
    b.v.copy(solveShot(b.p, new Vector3(1, 0, 9), 20, 0.8, 0.4));
    b.spin = 0.8;
    const pr = predict(b, 4, 0);
    const first = pr.samples.find((s) => s.bounces === 1)!;
    expect(first.p.z).toBeGreaterThan(8);
    expect(pr.netAt).toBeNull();
  });
});
