import test from 'node:test';
import assert from 'node:assert/strict';
import { StrokeDetector, KeyStroker } from '../js/rowing.js';
import { Boat } from '../js/boat.js';
import { quatFromEuler } from '../../../public/js/protocol.js';

// ---------- helpers ----------
let seed = 12345;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const qconj = (q) => ({ x: -q.x, y: -q.y, z: -q.z, w: q.w });
function qrot(q, [x, y, z]) {
  const tx = 2 * (q.y * z - q.z * y), ty = 2 * (q.z * x - q.x * z), tz = 2 * (q.x * y - q.y * x);
  return [x + q.w * tx + (q.y * tz - q.z * ty), y + q.w * ty + (q.z * tx - q.x * tz), z + q.w * tz + (q.x * ty - q.y * tx)];
}

/** Feed `fn(t) -> world acc [x,y,z]` (+ optional gyro world) to a detector for `dur` s at 60 Hz. */
function run(det, fn, { dur = 3, euler = [0, 90, 0], gravity = false, buttons = 0, gyroFn = null, noise = 0.05, t0 = 0 } = {}) {
  const q = quatFromEuler(...euler);
  const inv = qconj(q);
  let strokes = 0;
  det.onStroke(() => strokes++);
  const dt = 1 / 60;
  for (let i = 0; i < dur * 60; i++) {
    const t = i * dt;
    const aw = fn(t).slice();
    if (gravity) aw[2] += 9.81;
    const ad = qrot(inv, aw);
    const gd = gyroFn ? qrot(inv, gyroFn(t)) : [0, 0, 0];
    det.push({
      seq: i, t: t0 + Math.round(t * 1000), q,
      acc: { x: ad[0] + (rnd() - 0.5) * noise, y: ad[1] + (rnd() - 0.5) * noise, z: ad[2] + (rnd() - 0.5) * noise },
      gyro: { alpha: gd[2], beta: gd[0], gamma: gd[1] },
      buttons,
    });
    det.update(dt);
  }
  return { strokes };
}
const circle = (f, A, u, v) => (t) => {
  const c = Math.cos(2 * Math.PI * f * t), s = Math.sin(2 * Math.PI * f * t);
  return [A * (c * u[0] + s * v[0]), A * (c * u[1] + s * v[1]), A * (c * u[2] + s * v[2])];
};
const VERT_ALONG_BOAT = [[0, 0, 1], [0, 1, 0]]; // plane spanned by (z, y)

test('1 Hz circle (no gravity, upright phone)', () => {
  const d = new StrokeDetector();
  const r = run(d, circle(1, 5, ...VERT_ALONG_BOAT), { dur: 4 });
  assert.ok(d.power > 0.25 && d.power < 0.9, `power ${d.power}`);
  assert.ok(d.rate > 0.8 && d.rate < 1.25, `rate ${d.rate}`);
  assert.ok(r.strokes >= 2 && r.strokes <= 4, `strokes ${r.strokes}`);
});

test('1 Hz circle with gravity included, various orientations', () => {
  for (const euler of [[0, 90, 0], [40, 70, 10], [200, 20, -30], [90, 120, 45], [310, 95, 80]]) {
    const d = new StrokeDetector();
    const r = run(d, circle(1, 5, ...VERT_ALONG_BOAT), { dur: 4, euler, gravity: true });
    assert.ok(d.power > 0.25, `euler ${euler} power ${d.power}`);
    assert.ok(d.rate > 0.8 && d.rate < 1.25, `euler ${euler} rate ${d.rate}`);
    assert.ok(r.strokes >= 2, `euler ${euler} strokes ${r.strokes}`);
  }
});

test('2 Hz circle is stronger than 1 Hz; other plane and reversed direction', () => {
  const d1 = new StrokeDetector(); run(d1, circle(1, 5, ...VERT_ALONG_BOAT), { dur: 4 });
  const d2 = new StrokeDetector();
  const r = run(d2, circle(2, 10, [1, 0, 0], [0, 0, 1]), { dur: 4, gravity: true, euler: [30, 60, 20] });
  assert.ok(d2.power > 0.7, `power ${d2.power}`);
  assert.ok(d2.power > d1.power);
  assert.ok(d2.rate > 1.7 && d2.rate < 2.3, `rate ${d2.rate}`);
  assert.ok(r.strokes >= 5, `strokes ${r.strokes}`);
  const d3 = new StrokeDetector();
  run(d3, circle(1.5, 7, [0, 1, 0], [0.6, 0, 0.8]), { dur: 4 }); // swapped axes -> opposite direction
  assert.ok(d3.power > 0.4, `power ${d3.power}`);
});

test('phase advances ~1 cycle per stroke and power decays after stopping', () => {
  const d = new StrokeDetector();
  run(d, circle(1, 6, ...VERT_ALONG_BOAT), { dur: 3 });
  const p0 = d.power;
  assert.ok(p0 > 0.3);
  run(d, () => [0, 0, 0], { dur: 2.5, t0: 3000 });
  assert.ok(d.power < 0.02, `power after stop ${d.power}`);
  assert.ok(d.rate < 0.05);
  assert.ok(d.phase < 0.05 || d.phase > 0.95, `phase back to rest ${d.phase}`);
});

test('random shaking gives (almost) no power', () => {
  for (let k = 0; k < 5; k++) {
    const d = new StrokeDetector();
    let lp = [0, 0, 0];
    const r = run(d, () => {
      lp = lp.map((v) => v * 0.5 + (rnd() - 0.5) * 30);
      return lp;
    }, { dur: 4, gravity: k % 2 === 0 });
    assert.ok(d.power < 0.1, `power ${d.power}`);
    assert.ok(r.strokes <= 1, `strokes ${r.strokes}`);
  }
});

test('stillness (with gravity) gives zero', () => {
  const d = new StrokeDetector();
  const r = run(d, () => [0, 0, 0], { dur: 3, gravity: true, euler: [10, 80, 5] });
  assert.equal(d.power, 0);
  assert.equal(r.strokes, 0);
});

test('back-and-forth line motion gives low power', () => {
  for (const f of [1, 2]) {
    const d = new StrokeDetector();
    const r = run(d, (t) => { const a = 9 * Math.sin(2 * Math.PI * f * t); return [0, 0.6 * a, 0.8 * a]; }, { dur: 4, gravity: true });
    assert.ok(d.power < 0.1, `f=${f} power ${d.power}`);
    assert.ok(r.strokes <= 1);
  }
});

test('gyro-only fallback (weak acc)', () => {
  const d = new StrokeDetector();
  const A = 300 * Math.PI / 180;
  run(d, () => [0, 0, 0], {
    dur: 4,
    gyroFn: (t) => [300 * Math.cos(2 * Math.PI * 1.5 * t), 300 * Math.sin(2 * Math.PI * 1.5 * t), 0],
  });
  assert.ok(d.power > 0.25, `power ${d.power}`);
  assert.ok(A > 0);
});

test('Action button sets reverse', () => {
  const d = new StrokeDetector();
  run(d, circle(1.5, 6, ...VERT_ALONG_BOAT), { dur: 2, buttons: 1 });
  assert.equal(d.reverse, true);
  run(d, circle(1.5, 6, ...VERT_ALONG_BOAT), { dur: 0.2, buttons: 0, t0: 2000 });
  assert.equal(d.reverse, false);
  d.recenter();
  assert.equal(d.power, 0);
  assert.ok(d.debug && typeof d.debug === 'object');
});

test('KeyStroker: hold, tap, back', () => {
  const k = new KeyStroker({ forward: 'KeyW', back: 'KeyS' });
  const dt = 1 / 60;
  let strokes = 0; k.onStroke(() => strokes++);
  k._press(1);
  for (let i = 0; i < 180; i++) k.update(dt);
  assert.ok(k.power > 0.6 && k.power < 0.8, `hold power ${k.power}`);
  assert.ok(strokes >= 2);
  k._release(1);
  for (let i = 0; i < 180; i++) k.update(dt);
  assert.equal(k.power, 0);
  // rhythmic tapping at 5 taps/s
  for (let n = 0; n < 12; n++) {
    k._press(1);
    for (let i = 0; i < 6; i++) k.update(dt);
    k._release(1);
    for (let i = 0; i < 6; i++) k.update(dt);
  }
  assert.ok(k.power > 0.9, `tap power ${k.power}`);
  k._release(1);
  for (let i = 0; i < 180; i++) k.update(dt);
  k._press(-1);
  for (let i = 0; i < 120; i++) k.update(dt);
  assert.equal(k.reverse, true);
  assert.ok(k.power > 0.4);
  k.destroy();
});

// ---------- boat ----------
function fakeTrack({ halfWidth = 12, current = 1.5, obstacles = [] } = {}) {
  return {
    length: 2000, finishS: 1900,
    start: { x: 0, z: 0, heading: 0, s: 0 },
    obstacles,
    sample: (s) => ({ x: 0, z: -s, tx: 0, tz: -1, halfWidth, current }),
    update() {},
    locate: (x, z) => ({ s: Math.max(0, -z), lateral: x, halfWidth, tx: 0, tz: -1, current }),
  };
}
const P = (power, phase = 0, reverse = false) => ({ power, phase, reverse });
function sim(boat, secs, pads) {
  for (let i = 0; i < secs * 60; i++) boat.step(1 / 60, typeof pads === 'function' ? pads(i / 60) : pads);
}

test('boat: both paddling hard goes straight at ~22 m/s', () => {
  const b = new Boat(fakeTrack());
  sim(b, 25, [P(1), P(1)]);
  assert.ok(b.speed > 20.5 && b.speed < 23.5, `speed ${b.speed}`);
  assert.ok(Math.abs(b.heading) < 0.01 && Math.abs(b.lateral) < 0.2, `heading ${b.heading} lat ${b.lateral}`);
  assert.ok(b.sync > 0.9);
  assert.ok(b.s > 100);
});

test('boat: out-of-phase paddles get no sync bonus', () => {
  const a = new Boat(fakeTrack()), c = new Boat(fakeTrack());
  sim(a, 12, [P(1, 0), P(1, 0)]);
  sim(c, 12, [P(1, 0), P(1, 0.5)]);
  assert.ok(c.sync < 0.05);
  assert.ok(a.speed > c.speed);
});

test('boat: left paddle only turns right (heading decreases), right turns left', () => {
  const b = new Boat(fakeTrack());
  sim(b, 2, [P(1), P(0)]);
  assert.ok(b.heading < -0.2, `heading ${b.heading}`);
  assert.ok(b.yawRate < 0);
  const c = new Boat(fakeTrack());
  sim(c, 2, [P(0), P(1)]);
  assert.ok(c.heading > 0.2);
});

test('boat: reverse brakes / goes backwards slower', () => {
  const b = new Boat(fakeTrack());
  sim(b, 12, [P(1), P(1)]);
  const v0 = b.speed;
  sim(b, 2, [P(1, 0, true), P(1, 0, true)]);
  assert.ok(b.speed < v0 - 3);
});

test('boat: drifting moves downstream ~3 m/s and straightens', () => {
  const b = new Boat(fakeTrack());
  b.heading = 1.0; b.yawRate = 0;
  sim(b, 10, [P(0), P(0)]);
  assert.ok(b.z < -15, `z ${b.z}`);
  assert.ok(b.speed > 1.5 && b.speed < 3.5, `speed ${b.speed}`);
  assert.ok(Math.abs(b.heading) < 0.15, `heading ${b.heading}`);
  assert.ok(b.s > 15 && !b.finished);
});

test('boat: banks keep it inside and fire onHit', () => {
  const tr = fakeTrack({ halfWidth: 10 });
  const b = new Boat(tr);
  const hits = [];
  b.onHit((h) => hits.push(h));
  let maxLat = 0;
  for (let i = 0; i < 60 * 40; i++) {
    b.step(1 / 60, [P(0.3), P(1)]);
    maxLat = Math.max(maxLat, Math.abs(b.lateral));
  }
  assert.ok(maxLat <= tr.sample(0).halfWidth, `maxLat ${maxLat}`);
  assert.ok(hits.length >= 1 && hits[0].kind === 'bank');
  assert.ok(hits.length < 40, `hits ${hits.length}`);
  assert.ok(hits[0].strength >= 0 && hits[0].strength <= 1);
});

test('boat: obstacle hit bounces, slows, no tunnelling, cooldown', () => {
  const tr = fakeTrack({ obstacles: [{ type: 'rock', x: 0.3, z: -60, r: 2, rot: 0, scale: 1, seed: 1 }] });
  const b = new Boat(tr);
  const hits = [];
  b.onHit((h) => hits.push(h));
  let vmax = 0, minD = 99;
  for (let i = 0; i < 60 * 14; i++) {
    b.step(1 / 60, [P(1), P(1)]);
    vmax = Math.max(vmax, b.speed);
    minD = Math.min(minD, Math.hypot(b.x - 0.3, b.z + 60));
  }
  assert.ok(hits.length >= 1 && hits.length <= 12, `hits ${hits.length}`);
  assert.equal(hits[0].kind, 'rock');
  assert.ok(hits[0].strength > 0.2);
  assert.ok(minD > 1.0, `minD ${minD}`);
  assert.ok(vmax > 5);
});

test('boat: finished flag and reset', () => {
  const b = new Boat(fakeTrack());
  b.z = -1950; b.step(1 / 60, [P(0), P(0)]);
  assert.equal(b.finished, true);
  b.reset();
  assert.equal(b.finished, false);
  assert.equal(b.z, 0);
});

const OB = (o) => ({ type: 'rock', rot: 0, scale: 1, seed: 1, ...o });

test('boat: keyboard hold (power 0.7) gives ~15 m/s; 0->15 in a few s at full', () => {
  const b = new Boat(fakeTrack());
  sim(b, 30, [P(0.7), P(0.7)]);
  assert.ok(b.speed > 13.5 && b.speed < 16.5, `speed ${b.speed}`);
  const c = new Boat(fakeTrack());
  let t15 = null;
  for (let i = 0; i < 600 && t15 == null; i++) { c.step(1 / 60, [P(1), P(1)]); if (c.speed >= 15) t15 = i / 60; }
  assert.ok(t15 > 1.5 && t15 < 4, `t15 ${t15}`);
});

test('boat: single-side turn at top speed is not twitchy', () => {
  const b = new Boat(fakeTrack({ halfWidth: 200 }));
  sim(b, 20, [P(1), P(1)]);
  sim(b, 1, [P(1), P(0.6)]);
  assert.ok(Math.abs(b.yawRate) < 0.6, `yawRate ${b.yawRate}`);
});

test('boat: no tunnelling at 22 m/s through small circle or thin segment', () => {
  for (const o of [OB({ x: 0, z: -400, r: 0.5 }),
                   OB({ shape: 'segment', x: -3, z: -400, x1: -3, z1: -400, x2: 3, z2: -400, r: 0.1 })]) {
    const b = new Boat(fakeTrack({ obstacles: [o] }));
    const hits = []; b.onHit((h) => hits.push(h));
    let vmax = 0;
    for (let i = 0; i < 60 * 40 && b.z > -420; i++) { b.step(1 / 60, [P(1), P(1)]); vmax = Math.max(vmax, b.speed); }
    assert.ok(vmax > 19, `vmax ${vmax}`);
    assert.ok(hits.length >= 1, 'hit registered');
    assert.ok(b.z > -400.5 || Math.abs(b.x) > 1, `z ${b.z} x ${b.x}`);
  }
});

test('boat: segment obstacle bounces', () => {
  const o = OB({ type: 'lockgate', shape: 'segment', x: 0, z: -80, x1: -6, z1: -80, x2: 6, z2: -80, r: 0.4 });
  const b = new Boat(fakeTrack({ obstacles: [o] }));
  const hits = []; b.onHit((h) => hits.push(h));
  let maxV = 0;
  for (let i = 0; i < 60 * 12; i++) { b.step(1 / 60, [P(1), P(1)]); maxV = Math.max(maxV, b.speed); }
  assert.ok(hits.length >= 1 && hits[0].hazard === false && hits[0].type === 'lockgate', JSON.stringify(hits[0]));
  assert.ok(hits[0].strength > 0.2);
  assert.ok(maxV > 8);
});

test('boat: non-solid obstacle has no response', () => {
  const o = OB({ type: 'whirlpool', x: 0, z: -40, r: 3, solid: false });
  const b = new Boat(fakeTrack({ obstacles: [o] }));
  const hits = []; b.onHit((h) => hits.push(h));
  sim(b, 8, [P(1), P(1)]);
  assert.equal(hits.length, 0);
  assert.ok(b.z < -60);
});

test('boat: hazard emits once and does not bounce', () => {
  const o = OB({ type: 'spikes', x: 0, z: -40, r: 2, hazard: true });
  const b = new Boat(fakeTrack({ obstacles: [o] }));
  const hits = []; b.onHit((h) => hits.push(h));
  sim(b, 8, [P(1), P(1)]);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].hazard, true);
  assert.equal(hits[0].kind, 'spikes');
  assert.equal(hits[0].type, 'spikes');
  assert.ok(b.z < -60, `z ${b.z}`);
});

test('boat: moving solid obstacle pushes the boat', () => {
  const o = OB({ type: 'swinglog', x: 0, z: -20, r: 1.5, moving: true, vx: 0, vz: 6 });
  const tr = fakeTrack({ obstacles: [o] });
  tr.update = (t) => { o.z = -20 + 6 * t; };
  const b = new Boat(tr);
  const hits = []; b.onHit((h) => hits.push(h));
  let t = 0;
  for (let i = 0; i < 60 * 6; i++) { t += 1 / 60; tr.update(t); b.step(1 / 60, [P(0), P(0)]); }
  assert.ok(hits.length >= 1, 'hit');
  assert.ok(b.z > -20, `boat pushed back z ${b.z}`);
  assert.ok(b.z > o.z - 5, 'not passed through');
});

test('boat: reset(at) respawns with drift and invulnerability', () => {
  const o = OB({ type: 'spikes', x: 5, z: -300, r: 2, hazard: true });
  const b = new Boat(fakeTrack({ obstacles: [o] }));
  sim(b, 5, [P(1), P(1)]);
  b.reset({ x: 5, z: -300, heading: 0.2, s: 300 });
  assert.equal(b.x, 5); assert.equal(b.z, -300);
  assert.ok(Math.abs(b.heading - 0.2) < 1e-9);
  assert.ok(b.speed > 1 && b.speed < 3, `speed ${b.speed}`);
  assert.equal(b.invulnerable, 1.5);
  const hits = []; b.onHit((h) => hits.push(h));
  sim(b, 0.5, [P(0), P(0)]);
  assert.equal(hits.length, 0);
  assert.ok(b.invulnerable > 0.9 && b.invulnerable < 1.1, `inv ${b.invulnerable}`);
  sim(b, 1.2, [P(0), P(0)]);
  assert.equal(b.invulnerable, 0);
  b.reset();
  assert.equal(b.invulnerable, 0);
});
