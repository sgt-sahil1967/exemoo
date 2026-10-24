import { describe, expect, test } from 'vitest';
import { Vector3 } from 'three';
import { HALF_L, HALF_W, TABLE, type BallEvent } from '../core/contracts';
import { Ball, SUBSTEP, predictPath } from './ball';

const TOP = TABLE.height;
const NET_TOP = TOP + TABLE.netHeight;

/** Run until the first event matching `type`, returning the event and velocity/spin just after it. */
function runUntil(b: Ball, type: BallEvent['type'], maxT = 3) {
  for (let t = 0; t < maxT; t += SUBSTEP) {
    const evs = b.step(SUBSTEP);
    const e = evs.find((x) => x.type === type);
    if (e) return { ev: e, events: evs, vel: b.state.vel.clone(), spin: b.state.spin.clone() };
  }
  return null;
}

function bounceOf(spinX: number) {
  const b = new Ball();
  // travelling −Z, landing on the opponent half
  b.set(new Vector3(0, TOP + 0.25, -0.3), new Vector3(0, -1.5, -5), new Vector3(spinX, 0, 0));
  let before = b.state.vel.clone();
  for (let t = 0; t < 2; t += SUBSTEP) {
    before = b.state.vel.clone();
    const evs = b.step(SUBSTEP);
    if (evs.some((e) => e.type === 'bounce')) return { before, after: b.state.vel.clone(), spin: b.state.spin.clone(), ev: evs[0] };
  }
  throw new Error('no bounce');
}

describe('Ball flight', () => {
  test('falls under gravity with drag (terminal velocity ≈ 8.5–9.5 m/s)', () => {
    const b = new Ball();
    b.set(new Vector3(3, 14, 0), new Vector3(0, -15, 0), new Vector3());
    for (let i = 0; i < 720 * 0.8; i++) b.step(SUBSTEP);
    expect(-b.state.vel.y).toBeGreaterThan(8.5);
    expect(-b.state.vel.y).toBeLessThan(10.5);
  });

  test('topspin dips, backspin floats (Magnus)', () => {
    const fly = (wx: number) => {
      const b = new Ball();
      b.set(new Vector3(3, 2, 0), new Vector3(0, 0, -10), new Vector3(wx, 0, 0));
      for (let i = 0; i < 0.3 / SUBSTEP; i++) b.step(SUBSTEP);
      return b.state.pos.y;
    };
    const flat = fly(0), top = fly(-600), back = fly(600);
    expect(top).toBeLessThan(flat - 0.1);
    expect(back).toBeGreaterThan(flat + 0.1);
  });

  test('sidespin curves sideways', () => {
    const b = new Ball();
    b.set(new Vector3(3, 2, 0), new Vector3(0, 0, -10), new Vector3(0, 500, 0));
    for (let i = 0; i < 0.3 / SUBSTEP; i++) b.step(SUBSTEP);
    // ω × v = (0,500,0) × (0,0,−10) = (−5000, 0, 0) → curves −X
    expect(b.state.pos.x).toBeLessThan(3 - 0.05);
  });

  test('spin decays slowly in flight', () => {
    const b = new Ball();
    b.set(new Vector3(3, 20, 0), new Vector3(0, 0, 0), new Vector3(0, 500, 0));
    for (let i = 0; i < 720; i++) b.step(SUBSTEP);
    expect(b.state.spin.y).toBeLessThan(500);
    expect(b.state.spin.y).toBeGreaterThan(350);
  });

  test('deterministic and frame-rate independent', () => {
    const run = (dt: number) => {
      const b = new Ball();
      b.set(new Vector3(0.2, TOP + 0.3, 1.6), new Vector3(0.3, 1, -9), new Vector3(-300, 50, 0));
      const evs: string[] = [];
      for (let t = 0; t < 1.2 - 1e-9; t += dt) for (const e of b.step(dt)) evs.push(`${e.type}:${e.pos.x.toFixed(6)},${e.pos.z.toFixed(6)}`);
      return { pos: b.state.pos.clone(), evs };
    };
    const a = run(1 / 60), c = run(1 / 120), d = run(1 / 60);
    expect(a.pos.distanceTo(d.pos)).toBe(0);
    expect(a.evs).toEqual(c.evs);
    expect(a.pos.distanceTo(c.pos)).toBeLessThan(1e-9);
  });
});

describe('Table bounce', () => {
  test('restitution ≈ 0.89 for a flat ball', () => {
    const { before, after, ev } = bounceOf(0);
    expect(ev.type).toBe('bounce');
    const e = after.y / -before.y;
    expect(e).toBeGreaterThan(0.84);
    expect(e).toBeLessThan(0.93);
    expect(ev.pos.y).toBeCloseTo(TOP, 5);
    if (ev.type === 'bounce') expect(ev.side).toBe('opponent');
  });

  test('topspin shoots forward and low, backspin checks', () => {
    const flat = bounceOf(0), top = bounceOf(-600), back = bounceOf(600);
    // change of forward speed (−z) across the bounce
    const gain = (r: { before: Vector3; after: Vector3 }) => -r.after.z - -r.before.z;
    expect(gain(top)).toBeGreaterThan(0.3);
    expect(gain(flat)).toBeLessThan(0);
    expect(gain(back)).toBeLessThan(gain(flat) - 0.3);
    // rebound angle: topspin lower, backspin steeper
    const ang = (v: Vector3) => Math.atan2(v.y, -v.z);
    expect(ang(top.after)).toBeLessThan(ang(flat.after));
    expect(ang(back.after)).toBeGreaterThan(ang(flat.after));
    // spin is reduced towards rolling by friction
    expect(Math.abs(back.spin.x)).toBeLessThan(600);
  });

  test('sidespin kicks sideways on the bounce', () => {
    const b = new Ball();
    b.set(new Vector3(0, TOP + 0.03, -0.6), new Vector3(0, -2, -5), new Vector3(0, 600, 0));
    const before = b.state.vel.clone();
    let after: Vector3 | null = null;
    for (let t = 0; t < 0.2 && !after; t += SUBSTEP) if (b.step(SUBSTEP).some((e) => e.type === 'bounce')) after = b.state.vel.clone();
    expect(after).not.toBeNull();
    expect(after!.x - before.x).toBeLessThan(-0.3);
  });

  test('a flat ball approaches the rolling limit, never over-spins', () => {
    const { after, spin } = bounceOf(0);
    // rolling for −Z travel means spin.x = v.z / R (negative): spin must not exceed rolling
    expect(spin.x).toBeLessThan(0);
    expect(Math.abs(spin.x) * 0.02).toBeLessThanOrEqual(Math.abs(after.z) + 1e-6);
  });

  test('edge clip emits an edge event on the correct side', () => {
    const b = new Ball();
    // ball dropping onto the far end line corner region from slightly outside
    b.set(new Vector3(0, TOP + 0.2, -HALF_L - 0.012), new Vector3(0, -2, 0), new Vector3());
    const r = runUntil(b, 'edge', 0.5);
    expect(r).not.toBeNull();
    if (r && r.ev.type === 'edge') expect(r.ev.side).toBe('opponent');
    expect(r!.vel.z).toBeLessThan(0); // deflected outward
  });

  test('a ball hitting the side of the table (below the top) is not a bounce', () => {
    const b = new Ball();
    b.set(new Vector3(HALF_W + 0.5, TOP - 0.012, -0.5), new Vector3(-5, 0.6, 0), new Vector3());
    const evs: string[] = [];
    for (let t = 0; t < 1; t += SUBSTEP) for (const e of b.step(SUBSTEP)) evs.push(e.type);
    expect(evs).not.toContain('bounce');
    expect(evs).not.toContain('edge');
    expect(evs[0]).toBe('floor');
  });
});

describe('Net, posts and floor', () => {
  test('a low ball into the net stops and drops on the hitter side', () => {
    const b = new Ball();
    b.set(new Vector3(0, TOP + 0.08, 0.6), new Vector3(0, 0, -8), new Vector3());
    const evs: BallEvent[] = [];
    for (let t = 0; t < 2; t += SUBSTEP) evs.push(...b.step(SUBSTEP));
    expect(evs[0].type).toBe('net');
    expect(evs.filter((e) => e.type === 'net').length).toBe(1);
    const firstBounce = evs.find((e) => e.type === 'bounce');
    if (firstBounce && firstBounce.type === 'bounce') expect(firstBounce.side).toBe('player');
    expect(b.state.pos.z).toBeGreaterThan(-0.05);
  });

  test('net cord: a ball skimming the tape is deflected and slowed, may dribble over or fall back', () => {
    const outcomes = new Set<string>();
    for (let dy = 0; dy <= 0.06; dy += 0.0025) {
      const b = new Ball();
      b.set(new Vector3(0, NET_TOP + dy, 0.5), new Vector3(0, 0, -5.5), new Vector3());
      const evs: BallEvent[] = [];
      for (let t = 0; t < 2; t += SUBSTEP) evs.push(...b.step(SUBSTEP));
      const net = evs.find((e) => e.type === 'net');
      const bounce = evs.find((e) => e.type === 'bounce');
      if (net && bounce && bounce.type === 'bounce') outcomes.add(bounce.side);
    }
    expect(outcomes.has('opponent')).toBe(true); // dribbled over
    expect(outcomes.has('player')).toBe(true); // fell back
  });

  test('a ball travelling over the table clears an absent net (no false net hits)', () => {
    const b = new Ball();
    b.set(new Vector3(0, NET_TOP + 0.05, 1.2), new Vector3(0, 1.2, -9), new Vector3());
    const evs: BallEvent[] = [];
    for (let t = 0; t < 0.4; t += SUBSTEP) evs.push(...b.step(SUBSTEP));
    expect(evs.some((e) => e.type === 'net')).toBe(false);
  });

  test('posts are solid', () => {
    const b = new Ball();
    const px = HALF_W + TABLE.netOverhang + 0.012;
    b.set(new Vector3(px, NET_TOP - 0.05, 0.5), new Vector3(0, 0, -6), new Vector3());
    const r = runUntil(b, 'net', 0.3);
    expect(r).not.toBeNull();
    expect(r!.vel.z).toBeGreaterThan(0);
  });

  test('floor bounces repeat with lower restitution and the ball comes to rest', () => {
    const b = new Ball();
    b.set(new Vector3(0, 1.2, 2.5), new Vector3(0, 0, 2), new Vector3());
    const floors: BallEvent[] = [];
    for (let t = 0; t < 8; t += 1 / 60) floors.push(...b.step(1 / 60).filter((e) => e.type === 'floor'));
    expect(floors.length).toBeGreaterThan(2);
    const sp = floors.map((f) => (f.type === 'floor' ? f.speed : 0));
    expect(sp[1]).toBeLessThan(sp[0]);
    expect(b.settled).toBe(true);
    expect(b.state.pos.y).toBeCloseTo(0.02, 3);
  });

  test('out event when the ball leaves the play volume', () => {
    const b = new Ball();
    b.set(new Vector3(0, 3, 0), new Vector3(0, 30, -30), new Vector3());
    const r = runUntil(b, 'out', 3);
    expect(r).not.toBeNull();
  });
});

describe('predictPath', () => {
  test('matches the live ball exactly and does not mutate input', () => {
    const state = { pos: new Vector3(0.2, TOP + 0.3, 1.6), vel: new Vector3(-0.4, 2.0, -8), spin: new Vector3(-400, 80, 0) };
    const copy = { pos: state.pos.clone(), vel: state.vel.clone(), spin: state.spin.clone() };
    const path = predictPath(state, 3, 1 / 60);
    expect(state.pos.equals(copy.pos) && state.vel.equals(copy.vel) && state.spin.equals(copy.spin)).toBe(true);
    const b = new Ball();
    b.set(state.pos, state.vel, state.spin);
    let t = 0;
    for (const p of path.slice(1, 40)) {
      while (t < p.t - 1e-9) { b.step(SUBSTEP); t += SUBSTEP; }
      expect(b.state.pos.distanceTo(p.pos)).toBeLessThan(1e-9);
    }
    // bounces counted, stops at floor
    expect(path.some((p) => p.bounces === 1)).toBe(true);
    const last = path[path.length - 1];
    expect(last.pos.y).toBeLessThan(0.05);
    expect(last.t).toBeLessThan(3);
  });
});
