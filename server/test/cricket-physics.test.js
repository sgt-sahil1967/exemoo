// Cricket ball physics and shot model (games/cricket/js/physics.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grade, contactQuality, shotVelocity, predictPath, outOfField, stepBall } from '../../games/cricket/js/physics.js';

const AT = { x: 0, y: 0.6, z: -0.3 };
const fly = (intent, err) => {
  const s = shotVelocity(intent, err, () => 0.5);
  const { path, boundary } = predictPath(AT, s.v);
  const end = path.at(-1);
  return { s, boundary, dist: Math.hypot(end.x, end.z), carry: (() => { const l = path.find((p) => !p.airborne); return l ? Math.hypot(l.x, l.z) : Infinity; })() };
};
const DRIVE = { direction: 0, lift: 0.1, power: 1 }, LOFT = { direction: 0, lift: 0.8, power: 1 };

test('timing grades and contact quality', () => {
  assert.equal(grade(0.02), 'PERFECT');
  assert.equal(grade(-0.07), 'GOOD');
  assert.equal(grade(-0.15), 'EARLY');
  assert.equal(grade(0.15), 'LATE');
  assert.equal(grade(0.22), 'EDGED');
  assert.equal(grade(0.3), 'MISS');
  assert.equal(shotVelocity(DRIVE, 0.3), null);
  assert.equal(contactQuality(0), 1);
  assert.ok(contactQuality(0.1) < 0.7 && contactQuality(0.1) > contactQuality(0.15));
});

test('only a perfect hit goes all the way: perfect > good > early for drives and lofts', () => {
  const p = fly(DRIVE, 0), g = fly(DRIVE, 0.07), e = fly(DRIVE, -0.14);
  assert.ok(p.boundary, 'perfect full-power drive reaches the rope');
  assert.ok(!g.boundary && g.dist < p.dist && e.dist < g.dist * 0.6, `good ${g.dist.toFixed(0)} m, early ${e.dist.toFixed(0)} m`);
  const pl = fly(LOFT, 0), el = fly(LOFT, -0.14);
  assert.ok(pl.boundary?.airborne, 'perfect full-power loft is a six');
  assert.ok(el.carry < 40 && el.s.elev > pl.s.elev, 'a mistimed loft goes up more than out (catch)');
});

test('power scales distance; a soft swing is a short block', () => {
  assert.ok(fly({ ...DRIVE, power: 0.5 }, 0).dist < fly(DRIVE, 0).dist);
  const b = fly({ direction: 0, lift: 0, power: 0.2 }, 0);
  assert.equal(b.s.kind, 'block');
  assert.ok(b.dist < 12, `block went ${b.dist.toFixed(1)} m`);
});

test('early drags to leg, late steers to off; edges fly behind the wicket', () => {
  assert.ok(shotVelocity(DRIVE, -0.12, () => 0.5).aim < -0.2);
  assert.ok(shotVelocity(DRIVE, 0.12, () => 0.5).aim > 0.2);
  assert.ok(Math.abs(shotVelocity(DRIVE, 0, () => 0.5).aim) < 0.01, 'perfect goes where the hands sent it');
  const late = shotVelocity(DRIVE, 0.22, () => 0.5), early = shotVelocity(DRIVE, -0.22, () => 0.5);
  assert.equal(late.kind, 'edge');
  assert.ok(late.aim > 1.4 && early.aim < -1.4, 'behind square, off side when late and leg side when early');
  const cover = shotVelocity({ ...DRIVE, direction: 0.8 }, 0.22, () => 0.5);
  assert.ok(cover.aim > late.aim, 'an edge off a cover drive goes finer than one off a straight drive');
});

test('direction follows the intent: a perfect cover drive goes to the off side', () => {
  const s = shotVelocity({ direction: 0.85, lift: 0.1, power: 1 }, 0, () => 0.5);
  assert.ok(s.v.x > 0 && s.v.z < 0);
});

test('a rolling ball slows to a stop and the boundary is a circle round the ground centre', () => {
  const b = { x: 0, y: 0.036, z: 0, vx: 0, vy: 0, vz: -10, landed: true, rolling: true };
  for (let i = 0; i < 600; i++) stepBall(b, 1 / 60);
  assert.equal(Math.hypot(b.vx, b.vz), 0);
  assert.ok(b.z < -10 && b.z > -40);
  assert.equal(outOfField(0, -73), false);
  assert.equal(outOfField(0, -75), true);
  assert.equal(outOfField(64, -10), true);
});
