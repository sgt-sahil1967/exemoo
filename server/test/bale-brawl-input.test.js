// Bale Brawl phone sword (games/bale-brawl/js/sword-input.js): synthetic phone packets.
// World frame W3C: X east, Y north, Z up. The blade is the device +Y axis.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPhoneSword } from '../../games/bale-brawl/js/sword-input.js';
import { SWING } from '../../games/bale-brawl/js/constants.js';

const PI = Math.PI, D2R = PI / 180;
const angDiff = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
const near = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg || ''} expected ${b.toFixed(3)}, got ${a.toFixed(3)}`);
const ss = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));

// ── quaternions ──
const qMul = (a, b) => ({
  w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
  y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
  z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
});
const qAxis = ([x, y, z], a) => { const n = Math.hypot(x, y, z), s = Math.sin(a / 2) / n; return { x: x * s, y: y * s, z: z * s, w: Math.cos(a / 2) }; };
/** Shortest-arc rotation taking device +Y to unit vector v. */
function qToBlade(v) {
  const cx = 1 * v.z - 0, cy = 0, cz = 0 - 1 * v.x;      // (0,1,0) x v
  const d = v.y;
  const q = { x: cx, y: cy, z: cz, w: 1 + d };
  const n = Math.hypot(q.x, q.y, q.z, q.w);
  return n < 1e-9 ? { x: 0, y: 0, z: 1, w: 0 } : { x: q.x / n, y: q.y / n, z: q.z / n, w: q.w / n };
}
const SCREEN = 0.6;   // the screen lies at this compass heading (rad, + = east of north)
/** Blade pose in the player frame (bx right, by up, bz toward the screen) -> device quaternion, with a twist. */
function qPose(bx, by, twist = 0.3) {
  const bz = Math.sqrt(Math.max(0, 1 - bx * bx - by * by));
  const s = Math.sin(SCREEN), c = Math.cos(SCREEN);
  // player right r = (c, -s, 0), forward f = (s, c, 0)
  const v = { x: bx * c + bz * s, y: -bx * s + bz * c, z: by };
  return qMul(qToBlade(v), qAxis([0, 1, 0], twist));   // twist about the blade must not matter
}
const fromYawPitch = (yaw, pitch) => [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch)];

function pkt(t, q, { alpha = 0, beta = 0, gamma = 0, buttons = 0 } = {}) {
  return { seq: t, t, q, gyro: { alpha, beta, gamma }, buttons, ax: 0, ay: 0, az: 0 };
}

/** Hold a pose for `ms` at 100 Hz. Returns the next time. */
function hold(sw, t, bx, by, ms = 100, extra = {}) {
  for (let k = 0; k < ms / 10; k++, t += 10) sw.push(pkt(t, qPose(bx, by), extra));
  return t;
}

/** A swing in the frontal plane along `dir`, peak rate `peak` deg/s, 140 ms long. Returns { t, swing }. */
function swingPackets(sw, t, dir, peak = 600, extra = {}) {
  const c0 = [0, 0.15], u = [Math.cos(dir), Math.sin(dir)], L = 0.9;
  const at = (k) => [c0[0] + u[0] * L * (k - 0.5), c0[1] + u[1] * L * (k - 0.5)];
  t = hold(sw, t, ...at(0), 120, extra);
  const N = 14;
  for (let n = 1; n <= N; n++, t += 10) {
    const k = n / N;
    const rate = peak * Math.sin(PI * k);
    const p = at(ss(k));
    sw.push(pkt(t, qPose(p[0], p[1]), { alpha: rate * 0.8, beta: rate * 0.6, gamma: 300, ...extra }));
  }
  t = hold(sw, t, ...at(1), 80, extra);
  return t;
}

test('recenter: first live packet points at the screen; turning right is + yaw', () => {
  const sw = createPhoneSword();
  let t = hold(sw, 1000, 0, 0, 100);
  let it = sw.read(0.016);
  assert.equal(it.live, true);
  near(it.yaw, 0, 0.01, 'yaw'); near(it.pitch, 0, 0.01, 'pitch');
  near(sw.debug.yaw0, SCREEN, 1e-6, 'yaw0');
  t = hold(sw, t, ...fromYawPitch(0.5, 0.3), 200);
  it = sw.read(0.016);
  near(it.yaw, 0.5, 0.02, 'yaw right'); near(it.pitch, 0.3, 0.02, 'pitch up');
  // recenter here: this heading becomes forward
  sw.recenter();
  t = hold(sw, t, ...fromYawPitch(0.5, 0.3), 200);
  it = sw.read(0.016);
  near(it.yaw, 0, 0.02, 'yaw after recenter');
  near(it.pitch, 0.3, 0.02, 'pitch is absolute');
  // no packets for 1.5 s -> not live
  it = sw.read(1.6);
  assert.equal(it.live, false);
});

test('bladeAngle from the frontal-plane projection, kept when pointing at the screen', () => {
  const sw = createPhoneSword();
  hold(sw, 0, 0, 0, 50);
  const cases = [[fromYawPitch(1.3, 0), 0], [fromYawPitch(-1.3, 0), 0], [fromYawPitch(0, 1.3), PI / 2],
    [[0.6, 0.6], PI / 4], [[-0.6, 0.6], 3 * PI / 4], [[0.6, -0.6], 3 * PI / 4]];
  let t = 1000;
  for (const [[bx, by], want] of cases) {
    t = hold(sw, t, bx, by, 60);
    const a = sw.read(0.01).bladeAngle;
    assert.ok(a >= 0 && a < PI);
    near(Math.min(Math.abs(a - want), PI - Math.abs(a - want)), 0, 0.03, `blade ${bx},${by}`);
  }
  // now point (almost) straight at the screen: hypot < 0.35 keeps the last angle
  const before = sw.read(0.01).bladeAngle;
  t = hold(sw, t, 0.1, 0.1, 60);
  near(sw.read(0.01).bladeAngle, before, 1e-9, 'kept');
});

test('eight swing directions', () => {
  for (let k = 0; k < 8; k++) {
    const dir = -PI + k * PI / 4 + (k === 0 ? 1e-3 : 0);
    const sw = createPhoneSword();
    swingPackets(sw, 1000, dir);
    const it = sw.read(0.016);
    assert.ok(it.swing, `swing fired for dir ${dir}`);
    assert.ok(angDiff(it.swing.dir, dir) < 15 * D2R, `dir ${dir.toFixed(2)} got ${it.swing.dir.toFixed(2)}`);
    assert.equal(sw.read(0.016).swing, null, 'one-shot');
  }
});

test('power scales from startRate to fullRate', () => {
  const powerFor = (peak) => {
    const sw = createPhoneSword();
    swingPackets(sw, 1000, 0, peak);
    const s = sw.read(0.016).swing;
    return s ? s.power : null;
  };
  assert.equal(powerFor(150), null, 'below startRate: no swing');
  const mid = powerFor((SWING.startRate + SWING.fullRate) / 2);
  near(mid, 0.5, 0.06, 'half power');
  near(powerFor(1200), 1, 1e-9, 'clamped');
  assert.ok(powerFor(300) < powerFor(500));
});

test('cooldown: a second swing inside the refractory window is dropped', () => {
  const sw = createPhoneSword();
  let t = swingPackets(sw, 1000, 0);
  assert.ok(sw.read(0.016).swing);
  // swingPackets holds 200 ms around it; quick second swing starts within cooldown? use a short gap
  const sw2 = createPhoneSword();
  let n = 0;
  t = 1000;
  t = hold(sw2, t, 0, 0, 100);
  for (let r = 0; r < 2; r++) {
    for (let k = 1; k <= 8; k++, t += 10) sw2.push(pkt(t, qPose(0.1 * k, 0), { alpha: 500 * Math.sin(PI * k / 8) }));
    if (sw2.read(0.01).swing) n++;
  }
  assert.equal(n, 1);
});

test('no swing while guard is held (button bit 0 or setGuard)', () => {
  let sw = createPhoneSword();
  swingPackets(sw, 1000, 0, 600, { buttons: 1 });
  let it = sw.read(0.016);
  assert.equal(it.swing, null);
  assert.equal(it.guard, true);
  sw = createPhoneSword();
  sw.setGuard(true);
  swingPackets(sw, 1000, 0, 600);
  it = sw.read(0.016);
  assert.equal(it.swing, null); assert.equal(it.guard, true);
  sw.setGuard(false);
  assert.equal(sw.read(0).guard, false);
});

test('gyro-only fallback (no orientation sensor)', () => {
  const ZERO = { x: 0, y: 0, z: 0, w: 0 };
  let sw = createPhoneSword();
  let t = 0;
  for (let k = 0; k < 10; k++, t += 10) sw.push(pkt(t, ZERO));
  // turn: beta positive -> yaw goes negative (left), alpha positive -> pitch up
  for (let k = 0; k < 30; k++, t += 10) sw.push(pkt(t, ZERO, { beta: 60 }));
  let it = sw.read(0.016);
  assert.equal(it.live, true);
  assert.equal(sw.debug.qLive, false);
  assert.ok(it.yaw < -0.2, `yaw ${it.yaw}`);
  for (let k = 0; k < 30; k++, t += 10) sw.push(pkt(t, ZERO, { alpha: 60 }));
  it = sw.read(0.016);
  assert.ok(it.pitch > 0.2, `pitch ${it.pitch}`);
  // slow spring back toward centre
  for (let k = 0; k < 400; k++, t += 10) sw.push(pkt(t, ZERO));
  it = sw.read(0.016);
  assert.ok(Math.abs(it.yaw) < 0.05 && Math.abs(it.pitch) < 0.05);
  // a chop: alpha strongly negative (pitch down) -> dir about -PI/2
  sw = createPhoneSword(); t = 0;
  for (let k = 0; k < 20; k++, t += 10) sw.push(pkt(t, ZERO));
  for (let k = 1; k <= 12; k++, t += 10) sw.push(pkt(t, ZERO, { alpha: -600 * Math.sin(PI * k / 12) }));
  for (let k = 0; k < 5; k++, t += 10) sw.push(pkt(t, ZERO));
  it = sw.read(0.016);
  assert.ok(it.swing); assert.ok(angDiff(it.swing.dir, -PI / 2) < 15 * D2R, `chop ${it.swing.dir}`);
  // a slash to the right: beta negative -> yaw increases -> dir about 0
  for (let k = 0; k < 50; k++, t += 10) sw.push(pkt(t, ZERO));
  for (let k = 1; k <= 12; k++, t += 10) sw.push(pkt(t, ZERO, { beta: -600 * Math.sin(PI * k / 12) }));
  for (let k = 0; k < 5; k++, t += 10) sw.push(pkt(t, ZERO));
  it = sw.read(0.016);
  assert.ok(it.swing); assert.ok(angDiff(it.swing.dir, 0) < 15 * D2R, `slash ${it.swing.dir}`);
});
