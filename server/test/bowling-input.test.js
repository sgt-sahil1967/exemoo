// Moo Bowl input (games/bowling/js/throwdetect.js): synthetic camera pose + phone packet streams of a
// bowler's arm through the throw detector. The arm is a rigid pendulum from the shoulder:
//   theta  swing angle, 0 = hanging, + = forward (toward the camera), - = behind
//   psi    wrist twist about the forearm, + = counter-clockwise seen from above
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ThrowDetector, CamThrow, ImuBuffer, analyseSwing, flickThrow, speedFromRate, curveFromTwist, angleFromTravel,
  aimXFromHand, meterPower, meterSpeed, OneEuro, rotVec, TUNING,
} from '../../games/bowling/js/throwdetect.js';
import { THROW } from '../../games/bowling/js/constants.js';

const D2R = Math.PI / 180;
const ss = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
function rng(seed = 1) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5);
}

// ── quaternions (earth: X = bowler's right, Y = forward, Z = up) ──
const qAxis = ([x, y, z], a) => {
  const n = Math.hypot(x, y, z), s = Math.sin(a / 2) / n;
  return { x: x * s, y: y * s, z: z * s, w: Math.cos(a / 2) };
};
const qMul = (a, b) => ({
  w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
  y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
  z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
});
const qRot = (q, v) => {
  const p = qMul(qMul(q, { x: v[0], y: v[1], z: v[2], w: 0 }), { x: -q.x, y: -q.y, z: -q.z, w: q.w });
  return [p.x, p.y, p.z];
};
const qConj = (q) => ({ x: -q.x, y: -q.y, z: -q.z, w: q.w });
/** Phone along the forearm: device y up the arm, screen (z) facing forward. */
const GRIP = qMul(qAxis([0, 0, 1], Math.PI), qAxis([1, 0, 0], Math.PI / 2));
/** Some other way of holding it. */
const ODD_GRIP = qMul(GRIP, qAxis([1, 2, 0.5], 1.1));

// ── the motion ──
const T0 = 1.7e12;
/**
 * A full swing: address, backswing to -back deg, forward through to +100 deg with the given peak rate.
 * Returns {theta(ms), psi(ms), tPeak, tEnd}. Twist `twist` deg is applied around the swing peak.
 */
function swing({ peak = 480, back = 50, start = 800, backMs = 500, twist = 0, to = 100 } = {}) {
  const fwdMs = ((1.5 * (to + back)) / peak) * 1000;
  const t1 = start + backMs, t2 = t1 + fwdMs;
  const theta = (t) => (t < t1 ? -back * ss((t - start) / backMs) : -back + (to + back) * ss((t - t1) / fwdMs));
  const tPeak = t1 + fwdMs / 2;
  const psi = (t) => twist * ss((t - (tPeak - 90)) / 130);
  return { theta, psi, tPeak, tEnd: t2 + 500, fwdStart: t1 };
}

const ASPECT = 4 / 3, BW = 0.2, ARM = 1.4, UPPER = 0.73, ARM_M = 0.6;

/**
 * Build the event stream for a motion.
 *   m.theta / m.psi (deg), m.lat(t) extra sideways wrist offset (shoulder widths, + = player's right),
 *   m.body(t) body offset across the image (shoulder widths), m.curl(t) deg of elbow flex (forearm lift)
 * Options: hand, camera / phone on, grip, accSign (-1 = iOS), held(t) Action button, hide(t) wrist hidden,
 * glitchAt, world (false = no 3D landmarks), jitter.
 */
function events(m, { hand = 'right', camera = true, phone = true, grip = GRIP, accSign = 1, held = () => false, hide = () => false,
  glitchAt = -1e9, world = true, jitter = 0.002, seed = 3, until = m.tEnd, camLag = 80, noGyro = false } = {}) {
  const r = rng(seed), hs = hand === 'right' ? 1 : -1;
  const th = (t) => (m.theta ? m.theta(t) : 0) * D2R, psi = (t) => (m.psi ? m.psi(t) : 0) * D2R;
  const lat = (t) => (m.lat ? m.lat(t) : 0), body = (t) => (m.body ? m.body(t) : 0), curl = (t) => (m.curl ? m.curl(t) : 0) * D2R;
  const out = [];
  if (camera) {
    for (let t = 0; t <= until; t += 33) {
      const j = () => r() * 2 * jitter;
      const a = th(t), c = curl(t);
      const mid = [0.5 + (body(t) * BW) / ASPECT, 0.35];
      const sh = (s) => [mid[0] + (s * 0.5 * BW) / ASPECT, mid[1]];
      const S = sh(hs);
      // Elbow, then the forearm (curled forward by c about the elbow).
      const eDown = UPPER * Math.cos(a), fore = ARM - UPPER;
      const wDown = eDown + fore * Math.cos(a + c), wFwd = (UPPER * Math.sin(a) + fore * Math.sin(a + c)) * (ARM_M / ARM);
      const wx = hs * 0.1 + lat(t);
      const E = [S[0] + (wx * 0.5 * BW) / ASPECT + j(), S[1] + eDown * BW + j(), 0.9];
      let W = [S[0] + (wx * BW) / ASPECT + j(), S[1] + wDown * BW + j(), hide(t) ? 0.1 : 0.95];
      if (Math.abs(t - glitchAt) < 17) W = [0.05, 0.05, 0.95];
      const ls = sh(-1), rs = sh(1);
      const img = {
        ls: [ls[0] + j(), ls[1] + j(), 0.99], rs: [rs[0] + j(), rs[1] + j(), 0.99],
        lh: [ls[0] + 0.01, 0.64, 0.9], rh: [rs[0] - 0.01, 0.64, 0.9],
        le: [ls[0], 0.35 + UPPER * BW, 0.9], re: [rs[0], 0.35 + UPPER * BW, 0.9],
        lw: [ls[0] - 0.01, 0.35 + ARM * BW, 0.9], rw: [rs[0] + 0.01, 0.35 + ARM * BW, 0.9],
      };
      img[hs > 0 ? 're' : 'le'] = E;
      img[hs > 0 ? 'rw' : 'lw'] = W;
      let w3 = null;
      if (world) {
        // Not mirrored: the player's right is world -x. -z is toward the camera.
        w3 = { ls: [0.2, -0.45, 0, 0.99], rs: [-0.2, -0.45, 0, 0.99], lw: [0.24, 0.1, 0, 0.9], rw: [-0.24, 0.1, 0, 0.9], lh: [0.1, 0, 0, 0.9], rh: [-0.1, 0, 0, 0.9], la: [0.1, 0.8, 0, 0.9], ra: [-0.1, 0.8, 0, 0.9] };
        w3[hs > 0 ? 'rw' : 'lw'] = [-hs * 0.24, -0.45 + wDown * 0.4, -wFwd + r() * 0.03, 0.9];
      }
      out.push({ due: T0 + t + camLag, pose: { img, world: w3, aspect: ASPECT, at: T0 + t, visible: true } });
    }
  }
  if (phone) {
    const q = (t) => qMul(qMul(qAxis([1, 0, 0], th(t) + curl(t)), qAxis([0, 0, 1], psi(t))), grip);
    const pos = (t) => {
      const a = th(t);
      return [body(t) * 0.4, ARM_M * Math.sin(a), -ARM_M * Math.cos(a)];
    };
    const h = 2;
    for (let t = 0; t <= until; t += 16.667) {
      const qt = q(t);
      const w = rotVec(q(t - h), q(t + h)).map((v) => (v / (2 * h / 1000)) / D2R); // deg/s, device frame
      const p0 = pos(t - h), p1 = pos(t), p2 = pos(t + h);
      const aE = [0, 1, 2].map((i) => (p0[i] - 2 * p1[i] + p2[i]) / (h / 1000) ** 2);
      const aD = qRot(qConj(qt), aE).map((v) => v * accSign + r() * 0.3);
      out.push({
        due: T0 + t + 20,
        packet: {
          at: T0 + t, q: qt, acc: { x: aD[0], y: aD[1], z: aD[2] },
          gyro: noGyro ? { alpha: 0, beta: 0, gamma: 0 } : { beta: w[0] + r(), gamma: w[1] + r(), alpha: w[2] + r() },
          buttons: held(t) ? 1 : 0,
        },
      });
    }
  }
  return out.sort((a, b) => a.due - b.due);
}

/** Run events through a detector (armed after `armAt` ms). Returns the throws with their fire times. */
function run(evs, { hand = 'right', det = new ThrowDetector({ hand }), armAt = 0 } = {}) {
  const throws = [];
  let armed = false;
  for (const e of evs) {
    if (!armed && e.due - T0 >= armAt) (armed = true), det.arm();
    const t = e.pose ? det.onPose(e.pose, e.due) : det.onPacket(e.packet, e.due);
    if (t) throws.push({ ...t, firedAt: e.due - T0 });
  }
  return { throws, det };
}
const one = (m, o) => {
  const { throws } = run(events(m, o), o);
  assert.equal(throws.length, 1, `expected exactly one throw, got ${throws.length}`);
  return throws[0];
};
const none = (m, o, msg) => assert.equal(run(events(m, o), o).throws.length, 0, msg);
const about = (v, want, tol, msg) => assert.ok(Math.abs(v - want) <= tol, `${msg ?? 'value'}: expected ${want} +/- ${tol}, got ${v.toFixed(3)}`);

// ───────────────────────────── maths ─────────────────────────────
test('mappings: speed, curve, angle and aim are monotonic, clamped and have dead zones', () => {
  about(speedFromRate(300), 5, 0.01);
  about(speedFromRate(480), THROW.typicalSpeed, 0.01);
  assert.equal(speedFromRate(2000), THROW.maxSpeed);
  assert.equal(speedFromRate(0), THROW.minSpeed);
  for (let r = 100; r < 800; r += 20) assert.ok(speedFromRate(r + 20) >= speedFromRate(r));
  assert.equal(curveFromTwist(10), 0, 'small twists are straight');
  assert.equal(curveFromTwist(-15), 0);
  assert.ok(curveFromTwist(60) < -0.5, 'counter-clockwise hooks left');
  assert.ok(curveFromTwist(-60) > 0.5);
  assert.equal(curveFromTwist(200), -1);
  assert.equal(angleFromTravel(0.04), 0, 'a straight swing is straight');
  assert.ok(angleFromTravel(0.3) > 0.04 && angleFromTravel(-0.3) < -0.04);
  about(angleFromTravel(2), THROW.maxAngle, 1e-9);
  about(aimXFromHand(0.6, 1), 0, 1e-9, 'right hand hanging = lane centre');
  about(aimXFromHand(-0.6, -1), 0, 1e-9, 'left hand hanging = lane centre');
  assert.equal(aimXFromHand(5, 1), THROW.maxX);
  about(meterPower(0.375, 1.5), 0.5, 1e-9);
  about(meterPower(1.125, 1.5), 0.5, 1e-9);
  about(meterSpeed(1), THROW.maxSpeed, 1e-9);
});

test('one-euro filter settles on a steady value and follows a move', () => {
  const f = new OneEuro();
  const r = rng(5);
  let v = 0;
  for (let i = 0; i < 60; i++) v = f.filter(1 + r() * 0.02, i / 30);
  about(v, 1, 0.01);
  for (let i = 60; i < 90; i++) v = f.filter(2, i / 30);
  about(v, 2, 0.05);
});

// ───────────────────────────── camera + phone ─────────────────────────────
test('a clean swing (camera + phone) throws exactly once with sane values', () => {
  const m = swing({ peak: 480 });
  const t = one(m);
  assert.equal(t.source, 'camera+phone');
  about(t.speed, THROW.typicalSpeed, 0.8, 'speed');
  assert.equal(t.curve, 0, 'no twist, straight ball');
  assert.equal(t.angle, 0, 'no sideways travel, straight line');
  about(t.x, 0, 0.04, 'hand hanging by the side = lane centre');
  about(t.detail.imuPeak, 480, 40, 'phone peak rate');
  about(t.detail.releaseAt - T0, m.tPeak, 60, 'release refined to the phone peak');
  assert.ok(t.firedAt - m.tPeak < 260, `fires soon after the release (${(t.firedAt - m.tPeak).toFixed(0)} ms)`);
  assert.ok(t.firedAt > m.fwdStart, 'not on the backswing');
});

test('wrist twist sets the curve: straight is 0, counter-clockwise hooks left, clockwise right', () => {
  assert.equal(one(swing({ twist: 8 })).curve, 0, 'a small twist still bowls straight');
  const ccw = one(swing({ twist: 60 })), cw = one(swing({ twist: -60 }));
  assert.ok(ccw.curve < -0.5, `CCW twist hooks left, got ${ccw.curve}`);
  assert.ok(cw.curve > 0.5, `CW twist hooks right, got ${cw.curve}`);
  about(ccw.detail.twist, 60, 14, 'measured twist');
  about(ccw.speed, one(swing()).speed, 0.8, 'a wrist snap does not change the speed');
  assert.ok(one(swing({ twist: 35 })).curve > ccw.curve, 'less twist, less hook');
});

test('twist is grip independent and survives an inverted accelerometer (iOS) and a silent gyro', () => {
  for (const o of [{ grip: ODD_GRIP }, { accSign: -1 }, { grip: ODD_GRIP, accSign: -1 }, { noGyro: true }]) {
    const a = one(swing({ twist: 60 }), o), b = one(swing({ twist: -60 }), o), c = one(swing({ twist: 0 }), o);
    assert.ok(a.curve < -0.5, `${JSON.stringify(Object.keys(o))}: CCW hooks left, got ${a.curve}`);
    assert.ok(b.curve > 0.5, `${JSON.stringify(Object.keys(o))}: CW hooks right, got ${b.curve}`);
    assert.equal(c.curve, 0);
    assert.equal(a.detail.axisFrom, 'acc');
  }
});

test('swing speed: gentle about 5 m/s, normal about 7.6, hard 10+, monotonic', () => {
  const v = [240, 300, 380, 480, 580, 700, 820].map((peak) => one(swing({ peak })).speed);
  for (let i = 1; i < v.length; i++) assert.ok(v[i] >= v[i - 1], `monotonic: ${v.map((x) => x.toFixed(1))}`);
  about(v[1], 5, 0.7, 'gentle');
  about(v[3], 7.6, 0.8, 'normal');
  assert.ok(v[5] >= 9.7, `hard swing ${v[5]}`);
  assert.ok(v[6] <= THROW.maxSpeed);
});

test('sideways travel of the hand through the forward swing sets the angle', () => {
  const drift = (d) => {
    const m = swing();
    m.lat = (t) => d * ss((t - m.fwdStart) / (m.tPeak + 120 - m.fwdStart));
    return one(m);
  };
  const r = drift(0.45), l = drift(-0.45), s = drift(0.03);
  assert.ok(r.angle > 0.03, `hand travels right, ball goes right: ${r.angle}`);
  assert.ok(l.angle < -0.03, `hand travels left: ${l.angle}`);
  assert.equal(s.angle, 0);
  assert.ok(Math.abs(r.angle) <= THROW.maxAngle);
});

test('the hand position at address sets x: reaching or stepping sideways moves the ball', () => {
  const reach = swing();
  reach.lat = () => 0.45;
  about(one(reach).x, 0.45 * TUNING.aimGain, 0.05, 'hand out to the right');
  const step = swing();
  step.body = () => -0.6;
  about(one(step).x, -0.6 * TUNING.aimGain, 0.05, 'standing further left');
  const far = swing();
  far.body = () => 3;
  assert.equal(one(far).x, THROW.maxX, 'clamped to the lane');
});

test('left hand: mirrored arm, same lane centre, natural (clockwise) release hooks right', () => {
  const o = { hand: 'left' };
  const t = one(swing({ twist: -60 }), o);
  assert.equal(t.source, 'camera+phone');
  about(t.x, 0, 0.04, 'left hand hanging = lane centre');
  assert.ok(t.curve > 0.5, `left-hander's hook goes right: ${t.curve}`);
  const out = swing();
  out.lat = () => -0.4; // further out to the player's left
  assert.ok(one(out, o).x < -0.15);
  // The right-hand detector must not throw on a left-arm swing.
  assert.equal(run(events(swing(), o), { hand: 'right' }).throws.length, 0);
});

test('idle, walking sideways, waving overhead and lifting the phone do not throw', () => {
  const calm = { theta: () => 0, tEnd: 4000 };
  none(calm, { jitter: 0.004 }, 'standing still');
  const walk = { theta: (t) => 14 * Math.sin(t / 160), body: (t) => 1.5 * Math.sin(t / 700), tEnd: 5000 };
  none(walk, {}, 'walking sideways');
  none(walk, { world: false }, 'walking sideways, no depth');
  // Wave: arm raised out to the side and overhead, then waving.
  const wave = {
    // side raise: the wrist goes up and far out (not toward the camera), then waves above the shoulder
    theta: () => 0, tEnd: 4000,
    lat: (t) => 1.2 * ss((t - 800) / 300) + (t > 1100 ? 0.4 * Math.sin((t - 1100) / 90) : 0),
  };
  const waveEvents = (o) => events(wave, o).map((e) => {
    if (!e.pose) return e;
    const t = e.pose.at - T0, up = ss((t - 800) / 350);
    const w = e.pose.img.rw.slice();
    w[1] = 0.35 + ARM * BW * (1 - 1.9 * up); // ends well above the shoulder
    return { ...e, pose: { ...e.pose, img: { ...e.pose.img, rw: w } } };
  });
  assert.equal(run(waveEvents({ phone: false })).throws.length, 0, 'waving (camera only)');
  assert.equal(run(waveEvents({})).throws.length, 0, 'waving (camera + phone)');
  // Lifting the phone to look at it: forearm curls up in front, the elbow stays down.
  const lift = { theta: () => 0, curl: (t) => 125 * ss((t - 900) / 500), tEnd: 3500 };
  none(lift, {}, 'lifting the phone');
  none(lift, { phone: false }, 'lifting the phone (camera only)');
  none(lift, { world: false }, 'lifting the phone, no depth');
  // A slow stretch forward is not a swing either.
  none({ theta: (t) => 80 * ss((t - 900) / 1500), tEnd: 4000 }, {}, 'slow raise');
});

test('a backswing alone never throws, with or without depth', () => {
  const back = { theta: (t) => -60 * ss((t - 800) / 250) * (1 - ss((t - 1300) / 400)), tEnd: 3000 };
  none(back, {}, 'fast backswing and return');
  none(back, { world: false, phone: false }, 'backswing, 2D only');
});

test('tracking trouble: a hidden wrist near release still throws once, a glitch frame does not throw', () => {
  const m = swing();
  const t = one(m, { hide: (x) => x > m.tPeak - 20 && x < m.tPeak + 60 });
  about(t.speed, THROW.typicalSpeed, 1);
  none({ theta: () => 0, tEnd: 3000 }, { glitchAt: 1500 }, 'glitch frame');
  one(swing(), { glitchAt: 500 });
});

test('no depth landmarks: the order of the swing (back, then forward) still finds the release', () => {
  const t = one(swing({ back: 55 }), { world: false });
  assert.equal(t.source, 'camera+phone');
  assert.equal(t.detail.zUsed, false);
});

// ───────────────────────────── fallbacks ─────────────────────────────
test('camera only: throws from the hand alone, faster swing = faster ball', () => {
  const slow = one(swing({ peak: 300 }), { phone: false }), fast = one(swing({ peak: 650 }), { phone: false });
  assert.equal(slow.source, 'camera');
  assert.ok(fast.speed > slow.speed + 1.5, `${slow.speed} -> ${fast.speed}`);
  about(slow.speed, 5, 1.6, 'gentle');
  assert.ok(fast.speed > 8);
  assert.equal(slow.curve, 0);
});

test('camera only: a phone lying on the table does not block or change the throw', () => {
  const m = swing({ peak: 480 });
  const still = events({ theta: () => 0, tEnd: m.tEnd }, { camera: false });
  const evs = [...events(m, { phone: false }), ...still].sort((a, b) => a.due - b.due);
  const { throws } = run(evs);
  assert.equal(throws.length, 1);
  assert.equal(throws[0].source, 'camera');
});

test('phone only: hold Action and swing; fires at the swing peak, or when Action is let go', () => {
  const m = swing({ peak: 480, twist: 60 });
  const through = one(m, { camera: false, held: (t) => t > 600 });
  assert.equal(through.source, 'phone');
  assert.equal(through.x, null, 'no camera: the caller supplies x');
  about(through.speed, THROW.typicalSpeed, 0.9);
  assert.ok(through.curve < -0.5);
  assert.equal(through.detail.by, 'peak');
  about(through.detail.releaseAt - T0, m.tPeak, 50);
  // Pressed only for the forward swing, let go just after the bottom.
  const m2 = swing({ peak: 300 });
  const let_go = one(m2, { camera: false, held: (t) => t > m2.fwdStart + 30 && t < m2.tPeak + 60 });
  assert.equal(let_go.detail.by, 'release');
  about(let_go.speed, 5, 0.8);
  assert.equal(let_go.curve, 0);
  // No Action, no throw; Action held without a swing, no throw.
  none(swing(), { camera: false }, 'swing without Action');
  none({ theta: () => 0, tEnd: 3000 }, { camera: false, held: (t) => t > 500 && t < 2000 }, 'Action without a swing');
});

test('phone speed is monotonic in phone-only play', () => {
  const v = [260, 400, 560, 760].map((peak) => one(swing({ peak }), { camera: false, held: (t) => t > 600 }).speed);
  for (let i = 1; i < v.length; i++) assert.ok(v[i] > v[i - 1], `${v}`);
});

// ───────────────────────────── arming ─────────────────────────────
test('disarmed: nothing fires; re-arming during the follow-through does not double fire', () => {
  const m = swing();
  const det = new ThrowDetector();
  let n = 0;
  for (const e of events(m)) if (e.pose ? det.onPose(e.pose, e.due) : det.onPacket(e.packet, e.due)) n++;
  assert.equal(n, 0, 'never armed');

  // Arm, throw, re-arm at once (hand still flying up), then come back down and hold: only one throw.
  const d2 = new ThrowDetector();
  const follow = { ...m, theta: (t) => (t < m.tEnd - 300 ? m.theta(t) : 100 * (1 - ss((t - (m.tEnd - 300)) / 500))), tEnd: m.tEnd + 1500 };
  d2.arm();
  let fired = 0;
  for (const e of events(follow)) {
    if (e.pose ? d2.onPose(e.pose, e.due) : d2.onPacket(e.packet, e.due)) {
      fired++;
      d2.arm();
    }
  }
  assert.equal(fired, 1);
  assert.ok(d2.cam.ready, 'ready again once the hand is back at address');

  // A second real swing after that does fire.
  const again = swing();
  let second = 0;
  for (const e of events(again)) {
    e.due += 10000;
    if (e.pose) e.pose.at += 10000; else e.packet.at += 10000;
    if (e.pose ? d2.onPose(e.pose, e.due) : d2.onPacket(e.packet, e.due)) second++;
  }
  assert.equal(second, 1);
});

test('live aim follows the arm: swing goes negative on the backswing and positive coming through', () => {
  const m = swing({ back: 55 });
  const cam = new CamThrow();
  let min = 0, max = 0, atBack = 0;
  for (const e of events(m, { phone: false })) {
    cam.update(e.pose);
    const t = e.pose.at - T0;
    min = Math.min(min, cam.live.swing);
    max = Math.max(max, cam.live.swing);
    if (Math.abs(t - m.fwdStart) < 20) atBack = cam.live.swing;
    if (t < 700) assert.ok(Math.abs(cam.live.swing) < 0.5, 'near 0 at address');
  }
  assert.ok(atBack < -0.6, `top of the backswing reads ${atBack}`);
  assert.ok(max > 0.95 && min < -0.6);
  assert.ok(cam.live.tracked);
  about(cam.armLen, ARM, 0.12, 'learned arm length');
});

test('phone analysis: finds the forearm axis from the swing itself', () => {
  for (const grip of [GRIP, ODD_GRIP]) {
    const m = swing({ twist: 50 });
    const buf = new ImuBuffer();
    for (const e of events(m, { camera: false, grip })) buf.push(e.packet);
    const a = analyseSwing(buf.samples, T0 + m.tPeak - 300, T0 + m.tPeak + 120);
    const want = qRot(qConj(grip), [0, 0, 1]); // "up the arm" at address, in the device frame
    const d = a.axis[0] * want[0] + a.axis[1] * want[1] + a.axis[2] * want[2];
    assert.ok(d > 0.97, `axis within about 14 deg, cos = ${d.toFixed(3)}`);
    about(a.twist, 50, 12);
    about(a.peakAt - T0, m.tPeak, 40);
  }
});

// ───────────────────────────── mouse ─────────────────────────────
test('mouse flick: pull back, flick up; speed from the flick, angle from its direction, curve from its bend', () => {
  const flick = ({ ms = 160, dx = 0, bow = 0, up = 0.35 } = {}) => {
    const pts = [];
    for (let t = 0; t <= 200; t += 16) pts.push({ t, x: 0.5, y: 0.6 + 0.15 * ss(t / 200) }); // pull back (down)
    for (let t = 16; t <= ms; t += 8) {
      const k = t / ms;
      pts.push({ t: 200 + t, x: 0.5 + dx * k + bow * Math.sin(Math.PI * k), y: 0.75 - up * k });
    }
    return flickThrow(pts);
  };
  const slow = flick({ ms: 400 }), fast = flick({ ms: 110 });
  assert.ok(slow && fast);
  assert.ok(fast.speed > slow.speed + 2, `${slow.speed} -> ${fast.speed}`);
  assert.equal(slow.angle, 0);
  assert.equal(slow.curve, 0);
  assert.ok(flick({ dx: 0.12 }).angle > 0.02);
  assert.ok(flick({ dx: -0.12 }).angle < -0.02);
  assert.ok(flick({ bow: 0.06 }).curve < -0.3, 'bows right then curls left = hook left');
  assert.ok(flick({ bow: -0.06 }).curve > 0.3);
  assert.equal(flickThrow([{ t: 0, x: 0.5, y: 0.5 }, { t: 50, x: 0.5, y: 0.6 }, { t: 100, x: 0.5, y: 0.7 }]), null, 'a drag down is not a throw');
  assert.equal(flick({ up: 0.03 }), null, 'a tiny nudge is not a throw');
});

// ───────────────────────────── input.js wiring (stubbed browser) ─────────────────────────────
test('createInput: contract API, status events, keyboard meter, mouse flick, phone and camera throws, disarm', async () => {
  const handlers = {};
  const add = (map) => (ev, cb) => ((map[ev] ||= []).push(cb));
  const winEv = {}, elEv = {};
  let clock = 1000;
  const node = () => ({ className: '', style: {}, classList: { toggle() {} }, appendChild() {}, querySelector: () => node(), getContext: () => null, getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }), set innerHTML(v) {}, set textContent(v) {} });
  globalThis.window = { addEventListener: add(winEv), devicePixelRatio: 1 };
  globalThis.window.parent = globalThis.window;
  globalThis.document = { getElementById: () => null, createElement: node, head: node(), body: node() };
  const realPerf = globalThis.performance;
  Object.defineProperty(globalThis, 'performance', { value: { timeOrigin: T0, now: () => clock }, configurable: true });
  try {
    const { createInput } = await import('../../games/bowling/js/input.js');
    const exemoo = { on: add(handlers), phone: { connected: false }, held: () => false, inShell: true };
    const canvas = { addEventListener: add(elEv), getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }) };
    const input = createInput({ exemoo, canvas });
    const throws = [], status = [];
    input.on('throw', (t) => throws.push(t));
    input.on('status', (s) => status.push(s));
    assert.deepEqual(status.at(-1), { camera: false, phone: false, source: 'mouse' });
    for (const k of ['setHand', 'arm', 'disarm', 'update']) assert.equal(typeof input[k], 'function');
    assert.equal(typeof input.handcam.setVisible, 'function');
    assert.equal(typeof input.handcam.flash, 'function');
    const key = (type, code) => winEv[type].forEach((cb) => cb({ code, preventDefault() {}, target: {} }));
    const step = (ms) => { for (let i = 0; i < ms; i += 16) { clock += 16; input.update(0.016); } };

    // Disarmed: keys do nothing.
    key('keydown', 'Space'); step(100); key('keydown', 'Space');
    assert.equal(throws.length, 0);

    // Keyboard: aim right, curve left, meter, throw.
    input.arm();
    key('keydown', 'ArrowRight'); step(400); key('keyup', 'ArrowRight');
    key('keydown', 'KeyA'); step(300); key('keyup', 'KeyA');
    assert.ok(input.aim.x > 0.1 && input.meter.curve < -0.2 && input.meter.visible);
    key('keydown', 'Space'); step(375);
    about(input.meter.power, 0.5, 0.06, 'meter');
    key('keydown', 'Space');
    assert.equal(throws.length, 1);
    assert.equal(throws[0].source, 'mouse');
    about(throws[0].speed, (THROW.minSpeed + THROW.maxSpeed) / 2, 0.5);
    assert.ok(throws[0].x > 0.1 && throws[0].curve < -0.2);
    key('keydown', 'Space'); key('keydown', 'Space');
    assert.equal(throws.length, 1, 'a throw disarms');
    key('keydown', 'Escape');

    // Mouse: press, pull back, flick up and to the right.
    input.arm();
    const ptr = (type, x, y, map = winEv) => map[type].forEach((cb) => cb({ clientX: x, clientY: y, button: 0, pointerId: 1 }));
    ptr('pointermove', 300, 400); step(32);
    assert.ok(input.aim.x < -0.1, 'mouse aims');
    ptr('pointerdown', 300, 400, elEv);
    for (let i = 1; i <= 10; i++) { clock += 16; ptr('pointermove', 300, 400 + i * 8); }
    input.update(0.016);
    assert.ok(input.aim.swing < 0, 'pulling back shows a backswing');
    for (let i = 1; i <= 10; i++) { clock += 12; ptr('pointermove', 300 + i * 3, 480 - i * 24); }
    clock += 10; ptr('pointerup', 330, 240);
    assert.equal(throws.length, 2);
    assert.ok(throws[1].x < -0.1 && throws[1].angle > 0 && throws[1].speed > 6, JSON.stringify(throws[1]));

    // Phone only: packets arrive, d-pad nudges, hold Action and swing.
    input.arm();
    handlers.status.forEach((cb) => cb({ connected: true }));
    const m = swing({ peak: 480 });
    const base = clock;
    handlers.button.forEach((cb) => cb('recenter'));
    handlers.button.forEach((cb) => cb('left'));
    for (const e of events(m, { camera: false, held: (t) => t > 600 })) {
      e.packet.at += base;
      clock = base + (e.due - T0);
      handlers.packet.forEach((cb) => cb(e.packet));
      if (throws.length < 3) input.update(0.016);
    }
    assert.equal(status.at(-1).source, 'phone');
    assert.equal(throws.length, 3);
    assert.equal(throws[2].source, 'phone');
    about(throws[2].x, -THROW.maxX / 9, 1e-6, 'd-pad nudge');
    about(throws[2].speed, THROW.typicalSpeed, 0.9);

    // Camera + phone.
    input.arm();
    const b2 = (clock += 3000);
    for (const e of events(swing({ peak: 600, twist: 60 }))) {
      clock = b2 + (e.due - T0);
      if (e.pose) { e.pose.at += b2; handlers.pose.forEach((cb) => cb(e.pose)); } else { e.packet.at += b2; handlers.packet.forEach((cb) => cb(e.packet)); }
      input.update(0.016);
    }
    assert.equal(throws.length, 4);
    assert.equal(throws[3].source, 'camera+phone');
    assert.ok(throws[3].curve < -0.3 && throws[3].speed > 8.5, JSON.stringify(throws[3]));
    assert.ok(status.some((s) => s.source === 'camera+phone' && s.camera && s.phone));
    assert.equal(input.aim.tracked, true);
    for (const t of throws) {
      assert.ok(Math.abs(t.x) <= THROW.maxX && Math.abs(t.angle) <= THROW.maxAngle && t.speed >= THROW.minSpeed && t.speed <= THROW.maxSpeed && Math.abs(t.curve) <= 1);
      for (const k of ['camSpeed', 'imuPeak', 'twist']) assert.equal(typeof t.detail[k], 'number');
    }
    handlers.camera.forEach((cb) => cb(false));
    assert.equal(status.at(-1).camera, false);
  } finally {
    Object.defineProperty(globalThis, 'performance', { value: realPerf, configurable: true });
    delete globalThis.window;
    delete globalThis.document;
  }
});
