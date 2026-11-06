import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import { HALF_L, HALF_W, TABLE } from '../core/contracts';
import { Ball } from '../physics/ball';
import { solveShot } from '../physics/solver';
import { HIT, aimZone, gradeSwing, inWindow, planShot, ringFill, timingWindow, type Grade } from './hitTiming';

describe('hit timing', () => {
  const w = timingWindow(0.6);
  it('grades around the sweet spot', () => {
    expect(gradeSwing(HIT.sweet, w).grade).toBe('perfect');
    expect(gradeSwing(HIT.sweet + w.perfect + 0.02, w).grade).toBe('good');
    expect(gradeSwing(w.openAt, w).grade).toBe('early');
    expect(gradeSwing(w.lateLimit, w).grade).toBe('late');
    expect(gradeSwing(w.lateLimit, w).quality).toBeGreaterThanOrEqual(0.3);
  });
  it('window is generous and grows with assist', () => {
    const lo = timingWindow(0), hi = timingWindow(1);
    expect(lo.openAt - lo.lateLimit).toBeGreaterThan(0.7);
    expect(hi.openAt - hi.lateLimit).toBeGreaterThan(lo.openAt - lo.lateLimit);
    expect(inWindow(0.5, w)).toBe(true);
    expect(inWindow(2, w)).toBe(false);
  });
  it('ring closes just before contact', () => {
    expect(ringFill(w.openAt, w)).toBeCloseTo(0);
    expect(ringFill(HIT.ringLead, w)).toBeCloseTo(1);
  });
  it('aim zones', () => {
    expect(aimZone(0, 0)).toBe(0);
    expect(aimZone(-0.8, 0)).toBe(-1);
    expect(aimZone(0, 0.9)).toBe(1);
  });
});

/** Every grade of a normal swing should land the ball on the far half (forgiveness). */
describe('forgiving returns land on the table', () => {
  const contacts = [
    new Vector3(0, TABLE.height + 0.25, HALF_L + 0.25),
    new Vector3(0.5, TABLE.height + 0.12, HALF_L + 0.4),
    new Vector3(-0.6, TABLE.height + 0.35, HALF_L + 0.1),
    new Vector3(0.2, TABLE.height + 0.05, HALF_L + 0.5),
  ];
  const grades: Grade[] = ['perfect', 'good', 'early', 'late'];
  it('lands ≥ 92% of shots', () => {
    let n = 0, ok = 0;
    let seed = 7;
    const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (const from of contacts)
      for (const grade of grades)
        for (const power of [0.1, 0.4, 0.7, 1])
          for (const zone of [-1, 0, 1] as const)
            for (const lift of [-0.6, 0, 0.6]) {
              const q = grade === 'perfect' ? 1 : grade === 'good' ? 0.8 : 0.45;
              const plan = planShot({ power, grade, quality: q, zone, lift, face: 0, aboveNet: from.y - TABLE.height - TABLE.netHeight, halfWidth: HALF_W });
              const target = new Vector3(plan.x, TABLE.height, -(0.2 + plan.depth * (HALF_L - 0.25)));
              const { vel, spin } = solveShot(from, { target, speed: plan.speed, spin: new Vector3(-plan.topspin, 0, 0), error: plan.error }, rng);
              const ball = new Ball();
              ball.set(from, vel, spin);
              let landed = false;
              for (let i = 0; i < 300 && !landed; i++) {
                for (const ev of ball.step(1 / 120)) {
                  if (ev.type === 'bounce') { landed = ev.side === 'opponent'; i = 1e9; break; }
                  if (ev.type === 'floor' || ev.type === 'out') { i = 1e9; break; }
                }
              }
              n++;
              if (landed) ok++;
            }
    expect(ok / n).toBeGreaterThan(0.92);
  });
});
