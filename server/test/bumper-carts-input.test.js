// Bumper Carts phone tilt (games/bumper-carts/js/tilt-input.js): synthetic phone packets.
// Device frame W3C: x = right edge, y = top edge, z = out of the screen. Flat on a table = identity.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPhoneTilt, rawTilt, shapeTilt } from '../../games/bumper-carts/js/tilt-input.js';
import { TILT } from '../../games/bumper-carts/js/constants.js';

const D2R = Math.PI / 180;
const near = (a, b, eps, msg = '') => assert.ok(Math.abs(a - b) <= eps, `${msg} expected ${b}, got ${a}`);
const qMul = (a, b) => ({
  w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
  y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
  z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
});
const qAxis = ([x, y, z], a) => { const s = Math.sin(a / 2); return { x: x * s, y: y * s, z: z * s, w: Math.cos(a / 2) }; };
/** Phone flat, then heading `yaw` (about world up), then rolled (right edge down by `roll` deg) and pitched
 *  (top edge down by `pitch` deg), rotations in the phone's own frame. A non-zero default heading keeps q away
 *  from the exact identity, which the pad sends before it has an orientation sensor (= gyro-only mode). */
function pose(roll = 0, pitch = 0, yaw = 35) {
  let q = qAxis([0, 0, 1], yaw * D2R);
  q = qMul(q, qAxis([0, 1, 0], roll * D2R));     // +about device y: right edge (x) goes down
  q = qMul(q, qAxis([1, 0, 0], -pitch * D2R));   // -about device x: top edge (y) goes down
  return q;
}
let T = 1000;
const pkt = (q, { buttons = 0, gyro = { alpha: 0, beta: 0, gamma: 0 }, dt = 16 } = {}) => ({ seq: 0, t: (T += dt), q, acc: { x: 0, y: 0, z: 0 }, gyro, buttons });
/** Feed `n` packets of one pose, reading 16 ms each time. */
function feed(inp, q, n = 30, opts = {}, action) {
  let out;
  for (let k = 0; k < n; k++) { inp.push(pkt(q, opts), action); out = inp.read(0.016); }
  return out;
}

test('raw tilt signs: right edge down = +x, top edge down (tipped away) = +y, heading does not matter', () => {
  const r = rawTilt(pose(20, 0));
  near(r.x, Math.sin(20 * D2R), 1e-9, 'roll'); near(r.y, 0, 1e-9);
  const p = rawTilt(pose(0, 20));
  near(p.y, Math.sin(20 * D2R), 1e-9, 'pitch'); near(p.x, 0, 1e-9);
  for (const yaw of [0, 70, 180, -120]) {
    const v = rawTilt(pose(15, -10, yaw));
    const w = rawTilt(pose(15, -10, 35));
    near(v.x, w.x, 1e-9, `yaw ${yaw} x`); near(v.y, w.y, 1e-9, `yaw ${yaw} y`);
  }
  // same sign as the Wobble Tower roll formula
  const q = pose(25, 0);
  const roll = Math.atan2(2 * (q.w * q.y - q.z * q.x), 1 - 2 * (q.x * q.x + q.y * q.y));
  assert.ok(roll > 0 && rawTilt(q).x > 0);
});

test('intent axes: tilt right / left / away / toward drives right / left / up / down the screen', () => {
  const cases = [[[20, 0], [1, 0]], [[-20, 0], [-1, 0]], [[0, 20], [0, 1]], [[0, -20], [0, -1]]];
  for (const [[roll, pitch], [ex, ey]] of cases) {
    const inp = createPhoneTilt();
    feed(inp, pose(0, 0), 3);                  // first packet auto-recenters flat
    const o = feed(inp, pose(roll, pitch), 40);
    assert.equal(o.live, true);
    if (ex) assert.ok(Math.sign(o.x) === ex && Math.abs(o.y) < 1e-6, `roll ${roll} pitch ${pitch}: ${o.x}, ${o.y}`);
    if (ey) assert.ok(Math.sign(o.y) === ey && Math.abs(o.x) < 1e-6, `roll ${roll} pitch ${pitch}: ${o.x}, ${o.y}`);
  }
});

test('dead zone and full scale', () => {
  const deadDeg = Math.asin(TILT.dead) / D2R, fullDeg = Math.asin(TILT.full) / D2R;
  const inp = createPhoneTilt();
  feed(inp, pose(0, 0), 3);
  let o = feed(inp, pose(deadDeg * 0.8, 0), 40);
  near(o.x, 0, 1e-9, 'inside the dead zone');
  o = feed(inp, pose(fullDeg + 5, 0), 60);
  near(o.x, 1, 1e-3, 'full scale');
  o = feed(inp, pose(40, 40), 60);
  near(Math.hypot(o.x, o.y), 1, 1e-3, 'never above 1');
  const mid = Math.asin((TILT.dead + TILT.full) / 2) / D2R;
  o = feed(inp, pose(mid, 0), 60);
  near(o.x, 0.5, 0.01, 'half way');
  // pure helper
  near(shapeTilt(TILT.full, 0).x, 1, 1e-9);
  near(shapeTilt(TILT.dead, 0).x, 0, 1e-9);
});

test('smoothing: ~40 ms one-pole, not instant', () => {
  const inp = createPhoneTilt();
  feed(inp, pose(0, 0), 3);
  inp.push(pkt(pose(40, 0)));
  const o1 = inp.read(0.016);
  assert.ok(o1.x > 0.2 && o1.x < 0.5, `first packet ${o1.x}`);
  const o = feed(inp, pose(40, 0), 15);
  near(o.x, 1, 0.01);
});

test('recenter: the current angle becomes neutral; ignored when the phone is far from flat', () => {
  const inp = createPhoneTilt();
  let o = feed(inp, pose(10, 8), 3);          // first packet auto-recenters at a slight angle
  o = feed(inp, pose(10, 8), 30);
  near(o.x, 0, 1e-6); near(o.y, 0, 1e-6);
  o = feed(inp, pose(0, 0), 40);              // flat is now a tilt left / toward
  assert.ok(o.x < 0 && o.y < 0);
  inp.recenter();
  o = feed(inp, pose(0, 0), 40);
  near(o.x, 0, 1e-6); near(o.y, 0, 1e-6);
  // phone held upright: recenter ignored, previous neutral kept
  inp.recenter();
  feed(inp, pose(0, 60), 3);
  o = feed(inp, pose(0, 0), 40);
  near(o.x, 0, 1e-6); near(o.y, 0, 1e-6);
  assert.ok(Math.hypot(inp.debug.raw0.x, inp.debug.raw0.y) < 1e-9);
});

test('action button: from the argument, else packet bit 0', () => {
  const inp = createPhoneTilt();
  let o = feed(inp, pose(), 3, { buttons: 1 });
  assert.equal(o.charge, true);
  o = feed(inp, pose(), 3, { buttons: 0 });
  assert.equal(o.charge, false);
  o = feed(inp, pose(), 3, { buttons: 0 }, true);
  assert.equal(o.charge, true);
  o = feed(inp, pose(), 3, { buttons: 1 }, false);
  assert.equal(o.charge, false);
});

test('gyro-only fallback: q all zero, integrates beta / gamma, springs back to flat', () => {
  const inp = createPhoneTilt();
  const zero = { x: 0, y: 0, z: 0, w: 0 };
  feed(inp, zero, 2);
  // roll right edge down at 60 deg/s for 0.4 s
  let o = feed(inp, zero, 25, { gyro: { alpha: 0, beta: 0, gamma: 60 } });
  assert.ok(o.x > 0.5 && Math.abs(o.y) < 1e-6, `roll right ${o.x}`);
  assert.equal(inp.debug.qLive, false);
  // stop rotating: springs back toward zero
  o = feed(inp, zero, 400);
  near(o.x, 0, 0.05, 'back to flat');
  // tip the top edge away (beta negative) = up the screen
  o = feed(inp, zero, 25, { gyro: { alpha: 0, beta: -60, gamma: 0 } });
  assert.ok(o.y > 0.5 && Math.abs(o.x) < 0.05, `tip away ${o.y}`);
  // alpha (spin about the screen normal) does not steer
  const inp2 = createPhoneTilt();
  o = feed(inp2, zero, 40, { gyro: { alpha: 120, beta: 0, gamma: 0 } });
  near(o.x, 0, 1e-9); near(o.y, 0, 1e-9);
  // small noise under the floor is ignored
  o = feed(inp2, zero, 60, { gyro: { alpha: 0, beta: 1.5, gamma: -1.5 } });
  near(o.x, 0, 1e-9); near(o.y, 0, 1e-9);
});

test('live: false before any packet and 1.5 s after the last one', () => {
  const inp = createPhoneTilt();
  assert.deepEqual(inp.read(0.016), { live: false, x: 0, y: 0, charge: false });
  feed(inp, pose(30, 0), 30, { buttons: 1 });
  let o = inp.read(TILT.noPacketMs / 1000 - 0.1);
  assert.equal(o.live, true);
  o = inp.read(0.2);
  assert.equal(o.live, false);
  assert.equal(o.x, 0); assert.equal(o.charge, false);
  inp.push(pkt(pose(30, 0)));
  assert.equal(inp.read(0.016).live, true, 'back on the next packet');
});
