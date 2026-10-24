// Camera batting (games/cricket/js/batcam.js): synthetic 2D pose streams through the arm tracker and swing detector.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ArmTracker, SwingDetector, strokeIntent, SWING_LEAD } from '../../games/cricket/js/batcam.js';

const D2R = Math.PI / 180;
const near = (a, b, tolDeg, msg) => assert.ok(Math.abs(a - b) <= tolDeg * D2R, `${msg ?? ''} expected ${(b / D2R).toFixed(1)}°, got ${(a / D2R).toFixed(1)}°`);

function rng(seed = 1) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5);
}

const ASPECT = 4 / 3;
const BW = 0.2; // shoulder width, frame-height units
const SH = { l: [0.5 - BW / 2 / ASPECT, 0.35], r: [0.5 + BW / 2 / ASPECT, 0.35] };
const UPPER = 0.75 * BW, FORE = 0.7 * BW;

/** Two-link arm: elbow placed so both limb lengths hold (bends outward). Points in frame units (x not aspect-scaled). */
function elbowFor(s, w, bendSign) {
  const S = [s[0] * ASPECT, s[1]], W = [w[0] * ASPECT, w[1]];
  const dx = W[0] - S[0], dy = W[1] - S[1];
  const d = Math.min(Math.hypot(dx, dy), UPPER + FORE - 1e-4);
  const a = (UPPER * UPPER - FORE * FORE + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, UPPER * UPPER - a * a));
  const ux = dx / (Math.hypot(dx, dy) || 1), uy = dy / (Math.hypot(dx, dy) || 1);
  return [(S[0] + a * ux - bendSign * h * uy) / ASPECT, S[1] + a * uy + bendSign * h * ux];
}

/**
 * 30 fps poses: hands at rest at `from` (body widths from the shoulder-line centre, x right / up positive),
 * moving to `to` over `ms` starting at swing time T. Options: jitter, wrists hidden for some frames.
 */
function stream(det, { from, to, ms = 160, T = 1e12, jitter = 0.003, hideWrists = [], seed = 1, pre = 600, post = 400 }) {
  const r = rng(seed);
  const events = [];
  for (let ts = T - pre; ts <= T + ms + post; ts += 33) {
    const k = Math.min(1, Math.max(0, (ts - T) / ms));
    const e = k * k * (3 - 2 * k);
    const hx = from[0] + (to[0] - from[0]) * e, hy = from[1] + (to[1] - from[1]) * e;
    const hand = [0.5 + (hx * BW) / ASPECT, 0.35 - hy * BW];
    const j = () => r() * 2 * jitter;
    const hidden = hideWrists.some(([a, b]) => ts - T >= a && ts - T <= b);
    const lw = [hand[0] - 0.01 + j(), hand[1] + j(), hidden ? 0.1 : 0.95], rw = [hand[0] + 0.01 + j(), hand[1] + j(), hidden ? 0.1 : 0.95];
    const le = elbowFor(SH.l, lw, -1), re = elbowFor(SH.r, rw, 1);
    const img = {
      ls: [SH.l[0] + j(), SH.l[1] + j(), 0.99], rs: [SH.r[0] + j(), SH.r[1] + j(), 0.99],
      le: [le[0] + j(), le[1] + j(), 0.9], re: [re[0] + j(), re[1] + j(), 0.9],
      lw, rw,
      lh: [SH.l[0] + 0.01, 0.75, 0.9], rh: [SH.r[0] - 0.01, 0.75, 0.9],
    };
    const ev = det.update({ img, aspect: ASPECT, at: ts });
    if (ev) events.push([ev, ts]);
  }
  return events;
}
const play = (opts) => {
  const det = new SwingDetector();
  const events = stream(det, opts);
  return { det, events, swing: det.swing };
};

test('stroke intent: forward, diagonal, sideways and lofted strokes', () => {
  near(strokeIntent(0, 2).direction, 0, 0.1);
  near(strokeIntent(1.5, 1.5).direction, 45 * D2R, 1);
  assert.ok(strokeIntent(-2.5, 0.4).direction < -80 * D2R, 'mostly sideways goes square');
  assert.ok(strokeIntent(0, 2).lift > 0.9, 'straight up is lofted');
  assert.equal(strokeIntent(0, -2).lift, 0, 'downward strokes stay on the ground');
  assert.ok(strokeIntent(1.5, 1.5).lift > 0.35, 'a 45° rise is lofted');
  assert.ok(strokeIntent(2, 0.5).lift < 0.35, 'a flat cut that rises a little stays on the ground');
  assert.ok(strokeIntent(-2, 0.7).lift < 0.35, 'so does a pull');
  near(strokeIntent(0, -2).direction, 0, 0.1, 'a downward chop is straight');
});

test('a lofted straight hit: hands from the waist to above the head', () => {
  const { events, swing } = play({ from: [0, -1.5], to: [0.1, 1.3] });
  assert.equal(events.filter(([e]) => e === 'start').length, 1);
  near(swing.direction, 0, 8, 'straight');
  assert.ok(swing.lift > 0.7, `lofted, got ${swing.lift}`);
  assert.ok(swing.power > 0.6, `a big fast swing is powerful, got ${swing.power}`);
});

test('cover drive to the off side (screen right) and pull to the leg side', () => {
  const cover = play({ from: [-0.4, -1.4], to: [1.4, 0.2], seed: 2 }).swing;
  assert.ok(cover.direction > 25 * D2R && cover.direction < 70 * D2R, `cover, got ${(cover.direction / D2R).toFixed(0)}°`);
  const pull = play({ from: [1.2, -0.6], to: [-1.6, -0.3], seed: 3 }).swing;
  assert.ok(pull.direction < -70 * D2R, `pull, got ${(pull.direction / D2R).toFixed(0)}°`);
  assert.ok(pull.lift < 0.3, 'pull along the ground');
});

test('a slow short push is a gentle shot, a fidget is not a shot', () => {
  const push = play({ from: [0, -1.4], to: [0.1, -0.7], ms: 220, seed: 4 });
  assert.equal(push.events.filter(([e]) => e === 'start').length, 1, 'push detected');
  assert.ok(push.swing.power < 0.35, `push power ${push.swing.power}`);
  const fidget = play({ from: [0, -1.4], to: [0.15, -1.3], ms: 400, seed: 5 });
  assert.equal(fidget.events.length, 0, 'fidget ignored');
});

test('contact time is the onset plus a fixed lead, whatever the swing speed', () => {
  const T = 1e12;
  const fast = play({ from: [0, -1.5], to: [0, 1.4], ms: 120, T }).swing;
  const slow = play({ from: [0, -1.5], to: [0, 0.5], ms: 300, T, seed: 6 }).swing;
  assert.ok(Math.abs(fast.onsetAt - T) <= 70, `onset found where the hands left rest (${fast.onsetAt - T} ms)`);
  assert.equal(fast.contactAt - fast.onsetAt, SWING_LEAD * 1000);
  assert.equal(slow.contactAt - slow.onsetAt, SWING_LEAD * 1000);
});

test('a full, brisk swing reaches full power; a short one does not', () => {
  assert.ok(play({ from: [0, -1.5], to: [0.2, 1.0], ms: 160 }).swing.power > 0.95);
  assert.ok(play({ from: [0, -1.4], to: [0.1, -0.75], ms: 220, seed: 4 }).swing.power < 0.4);
});

test('wrists blurring out mid-swing are coasted from the arm, keeping the direction', () => {
  const seen = play({ from: [-0.4, -1.4], to: [1.4, 0.2], seed: 7 }).swing;
  const blurred = play({ from: [-0.4, -1.4], to: [1.4, 0.2], seed: 7, hideWrists: [[30, 100]] }).swing;
  assert.ok(blurred, 'swing still detected');
  near(blurred.direction, seen.direction, 15, 'direction with blurred wrists');
});

test('only one swing per stroke, and the next swing after rest is detected again', () => {
  const det = new SwingDetector();
  const a = stream(det, { from: [0, -1.5], to: [0.5, 1.2], T: 1e12 });
  const b = stream(det, { from: [0.5, 1.2], to: [-1.5, -0.4], T: 1e12 + 2000, seed: 8 });
  assert.equal(a.filter(([e]) => e === 'start').length, 1);
  assert.equal(b.filter(([e]) => e === 'start').length, 1);
  assert.ok(det.swing.direction < 0, 'second swing went to leg');
});

test('arm tracker coasts a hidden wrist along the forearm spin (≤ 0.2 s), then gives up', () => {
  const t = new ArmTracker();
  const S = [0.4, 0.35], E = [0.4 + (0.15 * Math.cos(1.2)) / ASPECT, 0.35 + 0.15 * Math.sin(1.2)];
  const wristAt = (i) => { const ang = -0.5 + i * 0.12; return [E[0] + (0.14 * Math.cos(ang)) / ASPECT, E[1] + 0.14 * Math.sin(ang)]; };
  const frame = (i, hidden) => {
    const W = wristAt(i);
    return t.update({ ls: [...S, 1], rs: [S[0] + 0.15, S[1], 1], le: [...E, 1], lw: [W[0], W[1], hidden ? 0.05 : 1], lh: [S[0], 0.75, 1], rh: [S[0] + 0.15, 0.75, 1] }, 1000 + i * 33, ASPECT);
  };
  for (let i = 0; i < 8; i++) frame(i, false);
  for (let i = 8; i <= 10; i++) {
    const r = frame(i, true), W = wristAt(i);
    assert.equal(r.real, false);
    assert.ok(Math.hypot(r.hands.x - W[0] * ASPECT, r.hands.y - W[1]) < 0.005, `coasted wrist close at frame ${i}`);
  }
  for (let i = 11; i <= 20; i++) frame(i, true); // > 200 ms hidden
  assert.equal(frame(21, true), null, 'stops coasting after 0.2 s');
});

test('a quick backlift that turns into a cover drive restarts the swing at the turning point', () => {
  const det = new SwingDetector();
  // Backlift: hands go up and back to the leg side quickly, then come down and through to the off side.
  const T = 1e12;
  const ev1 = stream(det, { from: [0, -1.4], to: [-0.8, 0.4], ms: 250, T: T - 330, seed: 9, post: 0 }).map(([e]) => e);
  const ev2 = stream(det, { from: [-0.8, 0.4], to: [1.6, -0.6], ms: 160, T, seed: 10, pre: 47 }).map(([e]) => e);
  const all = [...ev1, ...ev2];
  assert.ok(all.includes('start'));
  const sw = det.swing;
  assert.ok(sw.direction > 40 * D2R, `the real stroke goes to the off side, got ${(sw.direction / D2R).toFixed(0)}°`);
  assert.ok(Math.abs(sw.onsetAt - T) <= 120, `onset at the turning point (${sw.onsetAt - T} ms)`);
});

test('a one-frame teleport (tracking glitch) is not a swing', () => {
  const det = new SwingDetector();
  const ev = stream(det, { from: [0, -1.4], to: [2.5, 1.5], ms: 1, seed: 11 });
  assert.equal(ev.filter(([e]) => e === 'start').length, 0);
});

test('a slow backlift before the stroke does not move the swing start earlier', () => {
  const det = new SwingDetector();
  const T = 1e12;
  // Slow drift back (below the swing threshold, above rest), then the fast stroke the other way.
  stream(det, { from: [0, -1.0], to: [-0.4, 0.6], ms: 620, T: T - 700, seed: 12, post: 0 });
  stream(det, { from: [-0.4, 0.6], to: [1.4, -1.0], ms: 150, T, seed: 13, pre: 47 });
  assert.ok(det.swing, 'stroke detected');
  assert.ok(Math.abs(det.swing.onsetAt - T) <= 70, `onset at the stroke, not the backlift (${Math.round(det.swing.onsetAt - T)} ms)`);
});
