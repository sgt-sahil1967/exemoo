import { describe, expect, test } from 'vitest';
import { Vector3 } from 'three';
import { HALF_L, TABLE, sideSign, type Side } from '../core/contracts';
import { solveShot } from '../physics/solver';
import { AIPlayer, DIFFICULTY } from './ai';

const TOP = TABLE.height;
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function incoming(to: Side, tx = 0.3, depth = 1.0, speed = 10, top = 300) {
  const s = sideSign(to);
  const from = new Vector3(-0.2, TOP + 0.3, -s * (HALF_L + 0.4));
  const r = solveShot(from, { target: new Vector3(tx, TOP, s * depth), speed, spin: new Vector3(s * top, 0, 0), error: 0 });
  return { pos: from, vel: r.vel, spin: r.spin };
}

describe('AIPlayer', () => {
  for (const side of ['player', 'opponent'] as Side[]) {
    test(`${side}: plans a legal return and the paddle meets the ball at contact`, () => {
      const ai = new AIPlayer(side, 'pro', seeded(3));
      const s = sideSign(side);
      expect(Math.sign(ai.body.z)).toBe(s);
      const plan = ai.planReturn(incoming(side), { opponentBody: new Vector3(0.5, 0, -s * 2), rally: 2, myScore: 0, theirScore: 0 })!;
      expect(plan).not.toBeNull();
      expect(plan.t).toBeGreaterThan(0.2);
      expect(Math.sign(plan.strikePos.z)).toBe(s);
      expect(Math.sign(plan.request.target.z)).toBe(-s); // aims at the other half
      expect(plan.willMiss).toBe(false);
      const dt = 1 / 240;
      let t = 0;
      const startBody = ai.body.clone();
      while (t + dt <= plan.t + 1e-9) { ai.update(dt); t += dt; }
      ai.update(plan.t - t);
      expect(ai.paddle.paddlePos.distanceTo(plan.strikePos)).toBeLessThan(0.01);
      // the body moved toward the ball, the blade faces roughly toward the opponent
      expect(ai.body.distanceTo(startBody)).toBeGreaterThan(0.01);
      const n = new Vector3(0, 0, 1).applyQuaternion(ai.paddle.paddleRot);
      expect(n.z * -s).toBeGreaterThan(0.4);
      // follow-through then recovery to the ready position
      for (let i = 0; i < 480; i++) ai.update(dt);
      expect(ai.plan).toBeNull();
      expect(ai.body.distanceTo(ai.readyPosition())).toBeLessThan(0.15);
    });
  }

  test('shot selection reacts to the incoming ball', () => {
    const kinds = (st: ReturnType<typeof incoming>, n = 30) => {
      const ai = new AIPlayer('player', 'legend', seeded(9));
      const out: Record<string, number> = {};
      for (let i = 0; i < n; i++) {
        ai.clearPlan();
        const p = ai.planReturn(st, { opponentBody: new Vector3(0, 0, -2), rally: 3, myScore: 0, theirScore: 0 });
        if (p) out[p.kind] = (out[p.kind] ?? 0) + 1;
      }
      return out;
    };
    const high = kinds(incoming('player', 0, 1.15, 6, -100));
    // a high, slow ball gets smashed by a legend
    const lob = { pos: new Vector3(0, TOP + 0.3, -HALF_L - 0.4), vel: new Vector3(0, 4, 4.2), spin: new Vector3(300, 0, 0) };
    const lobKinds = kinds(lob);
    expect((lobKinds.smash ?? 0) + (high.smash ?? 0)).toBeGreaterThan(5);
    const backspinShort = kinds(incoming('player', 0, 0.4, 5, -350));
    expect((backspinShort.push ?? 0) + (backspinShort.flick ?? 0)).toBeGreaterThan(15);
  });

  test('aims away from the opponent body (open court)', () => {
    const ai = new AIPlayer('opponent', 'legend', seeded(5));
    let open = 0;
    for (let i = 0; i < 40; i++) {
      ai.clearPlan();
      const p = ai.planReturn(incoming('opponent'), { opponentBody: new Vector3(0.6, 0, 2.2), rally: 3, myScore: 0, theirScore: 0 });
      if (p && p.request.target.x < 0) open++;
    }
    expect(open).toBeGreaterThan(28);
  });

  test('cannot reach a very wide fast ball at rookie level', () => {
    const ai = new AIPlayer('player', 'rookie', seeded(1));
    const s = incoming('player', -0.7, 1.2, 20, 200);
    const p = ai.planReturn({ ...s, pos: new Vector3(0.7, TOP + 0.3, -HALF_L - 0.2) }, { opponentBody: new Vector3(), rally: 3, myScore: 0, theirScore: 0 });
    expect(p === null || p.willMiss).toBe(true);
  });

  test('serve plan: strike behind the end line, target on the receiver half', () => {
    for (const side of ['player', 'opponent'] as Side[]) {
      const ai = new AIPlayer(side, 'club', seeded(2));
      const s = sideSign(side);
      const sv = ai.planServe({ myScore: 3, theirScore: 4 });
      expect(sv.kind).toBe('serve');
      expect(s * sv.strikePos.z).toBeGreaterThan(HALF_L);
      expect(Math.sign(sv.request.target.z)).toBe(-s);
      expect(sv.tossTime).toBeGreaterThan(0.5);
    }
  });

  test('difficulty table is monotonic', () => {
    const order = ['rookie', 'club', 'pro', 'legend'] as const;
    for (let i = 1; i < order.length; i++) {
      const a = DIFFICULTY[order[i - 1]], b = DIFFICULTY[order[i]];
      expect(b.reaction).toBeLessThan(a.reaction);
      expect(b.moveSpeed).toBeGreaterThan(a.moveSpeed);
      expect(b.error).toBeLessThan(a.error);
    }
  });
});
