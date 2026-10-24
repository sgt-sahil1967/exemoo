import { describe, expect, test } from 'vitest';
import { Vector3 } from 'three';
import type { BallEvent, ClubId, Hole, ShotInput, Surface, Tree } from '../core/contracts';
import { CLUBS, PUTT_RANGE_M, YARD } from '../core/contracts';
import { buildHole } from '../course';
import { GolfBall, puttSpeedFor } from './ball';

interface FakeOpts {
  height?: (x: number, z: number) => number;
  surface?: Surface;
  pin?: Vector3;
  trees?: Tree[];
}
function fakeHole(o: FakeOpts = {}): Hole {
  const h = o.height ?? (() => 0);
  const pin = o.pin ?? new Vector3(0, 0, -3000);
  pin.y = h(pin.x, pin.z);
  return {
    def: { number: 0, name: 'test', par: 4, tier: 'beginner' },
    tee: new Vector3(),
    pin,
    greenCenter: pin.clone(),
    greenRadius: 15,
    bounds: { minX: -3000, maxX: 3000, minZ: -3000, maxZ: 3000 },
    centerline: [],
    trees: o.trees ?? [],
    waterLevel: null,
    yards: 0,
    heightAt: h,
    normalAt(x, z, out) {
      const e = 0.25;
      const hx = (h(x + e, z) - h(x - e, z)) / (2 * e);
      const hz = (h(x, z + e) - h(x, z - e)) / (2 * e);
      return (out ?? new Vector3()).set(-hx, 1, -hz).normalize();
    },
    surfaceAt: () => o.surface ?? 'fairway',
    waterDrop: (e) => e.clone(),
    aimTarget: (f) => f.clone(),
  };
}

const shot = (club: ClubId, extra: Partial<ShotInput> = {}): ShotInput => ({
  club,
  power: 1,
  aimYaw: 0,
  curve: 0,
  quality: 1,
  lie: 'tee',
  ...extra,
});

function run(ball: GolfBall, dt = 1 / 60, maxT = 60): BallEvent[] {
  const ev: BallEvent[] = [];
  for (let t = 0; t < maxT; t += dt) {
    ev.push(...ball.step(dt));
    if (ball.state.phase !== 'flight' && ball.state.phase !== 'rolling') break;
  }
  return ev;
}

function hit(hole: Hole, s: ShotInput, from = new Vector3(), dt = 1 / 60) {
  const b = new GolfBall();
  b.setHole(hole);
  b.place(from);
  b.strike(s, () => 0.5);
  const ev = run(b, dt);
  const land = ev.find((e) => e.type === 'land') as Extract<BallEvent, { type: 'land' }> | undefined;
  const apex = ev.find((e) => e.type === 'apex') as Extract<BallEvent, { type: 'apex' }> | undefined;
  return { b, ev, land, apex, end: b.state.pos.clone() };
}

describe('GolfBall full shots', () => {
  test('every club carries its nominal distance (±3 yd)', () => {
    const flat = fakeHole();
    for (const c of CLUBS) {
      if (c.id === 'PT') continue;
      const { land } = hit(flat, shot(c.id, { lie: 'fairway' }));
      expect(land, c.id).toBeDefined();
      expect(Math.abs(land!.carryM / YARD - c.carryYards), c.id).toBeLessThanOrEqual(3);
    }
  });

  test('trajectory shape: driver apex ≈ 30 m, wedges land soft', () => {
    const flat = fakeHole();
    const d = hit(flat, shot('1W'));
    expect(d.apex!.height).toBeGreaterThan(25);
    expect(d.apex!.height).toBeLessThan(36);
    const roll = Math.hypot(d.end.x, d.end.z) - d.land!.carryM;
    expect(roll).toBeGreaterThan(8);
    expect(roll).toBeLessThan(35);
    const w = hit(fakeHole({ surface: 'green' }), shot('PW'));
    expect(Math.abs(Math.hypot(w.end.x, w.end.z) - w.land!.carryM)).toBeLessThan(4);
  });

  test('events are chronological and the ball comes to rest', () => {
    const { ev, b } = hit(fakeHole(), shot('7I'));
    const types = ev.map((e) => e.type);
    expect(types[0]).toBe('launch');
    expect(types.indexOf('apex')).toBeLessThan(types.indexOf('land'));
    expect(types.filter((t) => t === 'apex').length).toBe(1);
    expect(types[types.length - 1]).toBe('rest');
    expect(b.state.phase).toBe('rest');
  });

  test('power scales distance monotonically; overswing adds a little', () => {
    const flat = fakeHole();
    let prev = 0;
    for (const p of [0.2, 0.4, 0.6, 0.8, 1, 1.15]) {
      const c = hit(flat, shot('5I', { power: p })).land!.carryM;
      expect(c).toBeGreaterThan(prev);
      prev = c;
    }
    const half = hit(flat, shot('5I', { power: 0.5 })).land!.carryM;
    expect(half / (175 * YARD)).toBeGreaterThan(0.4);
    expect(half / (175 * YARD)).toBeLessThan(0.6);
    expect(prev / (175 * YARD)).toBeLessThan(1.1);
  });

  test('slice curves right (+X), hook curves left (−X)', () => {
    const flat = fakeHole();
    const slice = hit(flat, shot('1W', { curve: 1 })).land!;
    const hook = hit(flat, shot('1W', { curve: -1 })).land!;
    expect(slice.pos.x / YARD).toBeGreaterThan(20);
    expect(slice.pos.x / YARD).toBeLessThan(40);
    expect(hook.pos.x / YARD).toBeLessThan(-20);
    const wedge = hit(flat, shot('SW', { curve: 1 })).land!;
    expect(wedge.pos.x).toBeGreaterThan(0);
    expect(wedge.pos.x).toBeLessThan(slice.pos.x / 2);
  });

  test('wind pushes the ball', () => {
    const b = new GolfBall();
    b.setHole(fakeHole());
    b.setWind({ yaw: -Math.PI / 2, speed: 10 }); // blowing toward +X
    b.place(new Vector3());
    b.strike(shot('1W'), () => 0.5);
    const land = run(b).find((e) => e.type === 'land')!;
    expect(land.pos.x / YARD).toBeGreaterThan(12);
    expect(land.pos.x / YARD).toBeLessThan(30);
    const p = b.predictLanding(new Vector3(), '1W', 0);
    expect(p.distanceTo(land.pos)).toBeLessThan(1);
  });

  test('topped shot flies lower and shorter', () => {
    const flat = fakeHole();
    const good = hit(flat, shot('5I'));
    const top = hit(flat, shot('5I', { quality: 0.1 }));
    expect(top.land!.carryM).toBeLessThan(good.land!.carryM * 0.7);
    expect(top.apex!.height).toBeLessThan(good.apex!.height / 2);
  });

  test('large dt is stable (same carry as 60 Hz)', () => {
    const flat = fakeHole();
    const a = hit(flat, shot('3W'), new Vector3(), 1 / 60).land!.carryM;
    const b = hit(flat, shot('3W'), new Vector3(), 0.1).land!.carryM;
    expect(Math.abs(a - b)).toBeLessThan(1);
  });

  test('sand plugs the ball', () => {
    const { land, end } = hit(fakeHole({ surface: 'sand' }), shot('7I'));
    expect(Math.hypot(end.x, end.z) - land!.carryM).toBeLessThan(3);
  });

  test('trees deflect and slow the ball', () => {
    const tree: Tree = { pos: new Vector3(0, 0, -25), radius: 4, height: 16, kind: 'round' };
    const { ev, end } = hit(fakeHole({ trees: [tree] }), shot('9I', { power: 1 }));
    expect(ev.some((e) => e.type === 'tree')).toBe(true);
    expect(Math.hypot(end.x, end.z)).toBeLessThan(100);
  });

  test('predictLanding matches the real landing', () => {
    const b = new GolfBall();
    const flat = fakeHole();
    b.setHole(flat);
    const p = b.predictLanding(new Vector3(), '8I', 0.3, 0.8);
    const { land } = hit(flat, shot('8I', { power: 0.8, aimYaw: 0.3 }));
    expect(p.distanceTo(land!.pos)).toBeLessThan(0.5);
  });
});

describe('GolfBall putting', () => {
  test('power 1 rolls PUTT_RANGE_M.medium on a flat green', () => {
    for (const p of [1, 0.5, 0.2]) {
      const { end } = hit(fakeHole({ surface: 'green' }), shot('PT', { power: p, lie: 'green' }));
      expect(Math.abs(-end.z - p * PUTT_RANGE_M.medium)).toBeLessThan(0.25);
    }
    expect(puttSpeedFor(0)).toBe(0);
  });

  test('a well-hit 3 m putt drops; a rocket does not', () => {
    const pin = new Vector3(0, 0, -3);
    const ok = hit(fakeHole({ surface: 'green', pin }), shot('PT', { power: 3.5 / 14, lie: 'green' }));
    expect(ok.b.state.phase).toBe('holed');
    expect(ok.ev.some((e) => e.type === 'holed')).toBe(true);
    const fast = hit(fakeHole({ surface: 'green', pin: new Vector3(0, 0, -3) }), shot('PT', { power: 1, lie: 'green' }));
    expect(fast.b.state.phase).toBe('rest');
  });

  test('putts break downhill', () => {
    const tilted = fakeHole({ surface: 'green', height: (x) => 0.02 * x }); // downhill toward −X
    const { end } = hit(tilted, shot('PT', { power: 0.6, lie: 'green' }));
    expect(end.x).toBeLessThan(-0.3);
    const b = new GolfBall();
    b.setHole(tilted);
    const path = b.predictPutt(new Vector3(), 0, 0.6);
    expect(path.length).toBeGreaterThan(5);
    expect(path[path.length - 1].distanceTo(end)).toBeLessThan(0.3);
  });

  test('putting from the fringe goes shorter', () => {
    const { end } = hit(fakeHole({ surface: 'fringe' }), shot('PT', { power: 0.5, lie: 'fringe' }));
    expect(-end.z).toBeLessThan(7 * 0.8);
  });
});

describe('GolfBall on the real course', () => {
  test('water hazard is detected on hole 2', () => {
    const hole = buildHole(2);
    const b = new GolfBall();
    b.setHole(hole);
    let power = 0;
    for (let p = 0.5; p <= 1; p += 0.02) {
      const l = b.predictLanding(hole.tee, 'SW', 0, p);
      if (hole.surfaceAt(l.x, l.z) === 'water') {
        power = p;
        break;
      }
    }
    expect(power).toBeGreaterThan(0);
    b.place(hole.tee);
    b.strike(shot('SW', { power }), () => 0.5);
    const ev = run(b);
    expect(ev.some((e) => e.type === 'water')).toBe(true);
    expect(b.state.phase).toBe('water');
    const drop = hole.waterDrop(b.state.pos, hole.tee);
    expect(hole.surfaceAt(drop.x, drop.z)).not.toBe('water');
  });

  test('a drive on hole 1 ends at rest in play', () => {
    const hole = buildHole(1);
    const b = new GolfBall();
    b.setHole(hole);
    b.place(hole.tee);
    const aim = hole.aimTarget(hole.tee, 245 * YARD);
    b.strike(shot('1W', { aimYaw: Math.atan2(-(aim.x - hole.tee.x), -(aim.z - hole.tee.z)) }), () => 0.5);
    run(b);
    expect(b.state.phase).toBe('rest');
    expect(['fairway', 'rough']).toContain(hole.surfaceAt(b.state.pos.x, b.state.pos.z));
  });
});
