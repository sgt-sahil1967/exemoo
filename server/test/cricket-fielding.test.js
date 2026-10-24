// Cricket fielding planner (games/cricket/js/fielding.js) on paths from the real ball physics.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shotVelocity, predictPath } from '../../games/cricket/js/physics.js';
import { planFielding, reachBall, captainMove, FIELDING } from '../../games/cricket/js/fielding.js';

const AT = { x: 0, y: 0.6, z: -0.3 };
const path = (intent, err = 0) => predictPath(AT, shotVelocity(intent, err, () => 0.5).v);
const spot = (id, aim, r, extra = {}) => ({ id, x: Math.sin(aim) * r, z: -Math.cos(aim) * r, ...extra });
const always = () => 0; // every catch held, nothing fumbled
const never = () => 0.999; // every catch dropped, every stop fumbled

test('a fielder in the line of a firm drive stops it; the batters get what the throw allows', () => {
  const p = planFielding(path({ direction: 0.3, lift: 0.1, power: 0.7 }), [spot('mid-off', 0.3, 28)], always);
  assert.equal(p.by, 'mid-off');
  assert.equal(p.action, 'stop');
  assert.ok(p.runs <= 1, `runs ${p.runs}`);
  const fumbled = planFielding(path({ direction: 0.3, lift: 0.1, power: 0.7 }), [spot('mid-off', 0.3, 28)], never);
  assert.equal(fumbled.action, 'fumble');
  assert.ok(fumbled.backAt > p.backAt, 'a fumble costs time');
});

test('a fielder runs across to cut off a ball hit wide of him', () => {
  const pred = path({ direction: 0.55, lift: 0.1, power: 0.6 });
  const r = reachBall(spot('cover', 0.95, 26), pred.path, Infinity);
  assert.ok(r, 'cover can get there');
  assert.ok(Math.hypot(r.s.x - Math.sin(0.95) * 26, r.s.z + Math.cos(0.95) * 26) > 3, 'he had to run to it');
});

test('a mistimed loft straight at a fielder is caught; held or dropped depends on the dice', () => {
  const pred = path({ direction: 0, lift: 0.8, power: 1 }, -0.14);
  const land = pred.path.find((s) => !s.airborne);
  const fielder = { id: 'long-on', x: land.x + 3, z: land.z };
  assert.equal(planFielding(pred, [fielder], always).action, 'catch');
  assert.equal(planFielding(pred, [fielder], never).action, 'drop');
});

test('a perfect lofted hit over everyone is a six; a perfect drive through a gap is a four', () => {
  const field = [spot('mid-off', 0.35, 28), spot('mid-on', -0.35, 28), spot('cover', 0.95, 26)];
  assert.equal(planFielding(path({ direction: 0, lift: 0.8, power: 1 }), field, always).action, 'six');
  assert.equal(planFielding(path({ direction: 0, lift: 0.1, power: 1 }), field, always).action, 'four');
});

test('a ball that stops short of everyone is collected, and more distance means more runs', () => {
  const far = [spot('deep', 2.4, 60)];
  const block = planFielding(path({ direction: 0, lift: 0, power: 0.2 }), far, always);
  assert.equal(block.action, 'collect');
  const short = planFielding(path({ direction: 0.6, lift: 0.1, power: 0.6 }, 0.12), [spot('fine', -2.4, 56)], always);
  const long = planFielding(path({ direction: 0.6, lift: 0.1, power: 1 }, 0.06), [spot('fine', -2.4, 56)], always);
  assert.ok(long.runs >= short.runs, `${short.runs} → ${long.runs}`);
});

test('the keeper takes an edge behind the wicket', () => {
  const edge = predictPath(AT, shotVelocity({ direction: 0, lift: 0, power: 0.5 }, 0.22, () => 0.1).v);
  const keeper = { id: 'K', x: 1.35, z: 2.5, react: FIELDING.keeperReact, keeper: true };
  const p = planFielding(edge, [keeper, spot('mid-off', 0.35, 28)], always);
  assert.equal(p.by, 'K');
});

test('captain: two shots the same way pull a fielder there', () => {
  const field = [{ x: 0, z: -28 }, { x: 20, z: -10 }, { x: -25, z: -5 }];
  const move = captainMove(field, [{ aim: -1.0, dist: 30 }, { aim: 0.4, dist: 20 }, { aim: -0.95, dist: 35 }]);
  assert.ok(move && Math.abs(move.aim + 0.975) < 0.01 && move.r === 28);
  assert.equal(captainMove(field, [{ aim: 1, dist: 30 }, { aim: -1, dist: 30 }]), null);
});

test('fielders accelerate from standing: a hard drive 5 m wide of a ring fielder beats him', () => {
  const pred = path({ direction: 0, lift: 0.1, power: 1 });
  const at25 = pred.path.find((s) => Math.hypot(s.x, s.z) >= 25);
  const wide = { id: 'mid-off', x: at25.x + 5.5, z: at25.z };
  const r = reachBall(wide, pred.path, Infinity);
  assert.ok(!r || r.t > at25.t + 0.3, 'he cannot cut it off near his position');
});
