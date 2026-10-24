// Phone motion features for the cricket swing log (games/cricket/js/imu.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { quatFromEuler } from '../../public/js/protocol.js';
import { swingFeatures, pointing } from '../../games/cricket/js/imu.js';

const T = 100000;
const frames = (beta0, beta1, acc = [0, 0, 0], alpha = 0) =>
  Array.from({ length: 40 }, (_, i) => {
    const k = i / 39;
    return { at: T - 100 + i * 15, q: quatFromEuler(alpha, beta0 + (beta1 - beta0) * k, 0), acc: { x: acc[0], y: acc[1], z: acc[2] }, gyro: { alpha: 0, beta: 100, gamma: 0 } };
  });

test('a phone tipping up through the swing shows a positive pitch change; one tipping down, negative', () => {
  const up = swingFeatures(frames(20, 70), T, T + 200);
  const down = swingFeatures(frames(70, 20), T, T + 200);
  assert.ok(up.dPitch > 10 && down.dPitch < -10, `${up.dPitch} / ${down.dPitch}`);
  assert.equal(up.gyroPeak, 100);
});

test('acceleration is split into up and flat in earth axes, whatever way the phone is tilted', () => {
  // Flat phone: device z is up, so +z acceleration is upward.
  const flat = swingFeatures(frames(0, 0, [0, 0, 8]), T, T + 200);
  assert.ok(Math.abs(flat.accUp - 8) < 0.05 && flat.accFlat < 0.05);
  // Phone upright (beta 90): device y is up, device z is horizontal, so the same +z push is flat.
  const upright = swingFeatures(frames(90, 90, [0, 0, 8]), T, T + 200);
  assert.ok(upright.accFlat > 7.9 && upright.accUp < 0.05, `${upright.accUp} / ${upright.accFlat}`);
});

test('no phone, or too few packets, gives no features; compass headings are picked by time', () => {
  assert.equal(swingFeatures([], T, T + 200), null);
  const f = swingFeatures(frames(0, 0), T, T + 200, [{ at: T + 20, ios: 123.4 }, { at: T + 210, abs: [270, 0, 0] }]);
  assert.equal(f.heading0, 123.4);
  assert.equal(f.heading1, 90, 'absolute alpha 270 is heading 90 (east)');
  assert.equal(pointing(quatFromEuler(0, 0, 0)), null, 'flat on a table points up');
});
