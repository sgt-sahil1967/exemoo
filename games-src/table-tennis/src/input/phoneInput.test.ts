import { describe, expect, it } from 'vitest';
import type { LinkStatus, PhoneLinkEvents, SensorPacket, SwingEvent, ControllerButton } from '../core/contracts';
import { quatFromEuler, buttonBit } from '../net/packets';
import { PhoneInput, type PhoneLinkLike } from './phoneInput';
import { Euler, Quaternion, Vector3 } from 'three';

class FakeLink {
  status: LinkStatus = 'connected';
  sent: unknown[] = [];
  l: { [K in keyof PhoneLinkEvents]: PhoneLinkEvents[K][] } = { status: [], packet: [], message: [] };
  on<K extends keyof PhoneLinkEvents>(ev: K, cb: PhoneLinkEvents[K]) {
    this.l[ev].push(cb);
    return () => {};
  }
  send(m: unknown) {
    this.sent.push(m);
  }
  packet(p: SensorPacket) {
    for (const cb of this.l.packet) cb(p);
  }
  message(m: Parameters<PhoneLinkEvents['message']>[0]) {
    for (const cb of this.l.message) cb(m);
  }
}

function setup(hand: 'right' | 'left' = 'right') {
  const link = new FakeLink();
  let clock = 0;
  const input = new PhoneInput(link as unknown as PhoneLinkLike, { handedness: hand, sensitivity: 1, now: () => clock });
  let seq = 0;
  const feed = (alpha: number, beta: number, gamma: number, extra: Partial<SensorPacket> = {}, dtMs = 10) => {
    clock += dtMs;
    seq++;
    link.packet({
      seq,
      t: clock,
      q: quatFromEuler(alpha, beta, gamma),
      acc: { x: 0, y: 0, z: 0 },
      gyro: { alpha: 0, beta: 0, gamma: 0 },
      buttons: 0,
      ...extra,
    });
  };
  const hold = (alpha: number, beta: number, gamma: number, ms: number) => {
    for (let t = 0; t < ms; t += 10) {
      feed(alpha, beta, gamma);
      input.update(0.01);
    }
  };
  return { link, input, feed, hold, seqRef: () => seq, clock: () => clock };
}

describe('PhoneInput orientation', () => {
  it('auto-calibrates after ~1 s held upright and still', () => {
    const { input, hold } = setup();
    hold(40, 90, 0, 500);
    expect(input.calibration).toBeGreaterThan(0.3);
    expect(input.calibration).toBeLessThan(1);
    hold(40, 90, 0, 700);
    expect(input.calibration).toBe(1);
    expect(input.state.aimX).toBeCloseTo(0, 2);
    expect(input.state.face).toBeCloseTo(0, 2);
    expect(input.state.orientation.angleTo(input.state.orientation.clone().identity())).toBeLessThan(0.01);
  });

  it('does not calibrate while the phone lies flat', () => {
    const { input, hold } = setup();
    hold(0, 0, 0, 1500);
    expect(input.calibration).toBe(0);
  });

  it('maps yaw to aimX and tilt to face, with heading independence', () => {
    for (const heading of [0, 137]) {
      const { input, hold } = setup();
      hold(heading, 90, 0, 1200);
      hold(heading - 25, 90, 0, 50); // turn face to the player's right
      expect(input.state.aimX).toBeGreaterThan(0.4);
      expect(input.state.aimX).toBeLessThan(0.6);
      hold(heading, 110, 0, 50); // top tipped back toward the player → open face
      expect(input.state.face).toBeGreaterThan(0.25);
      expect(input.state.aimY).toBeGreaterThan(0.3);
      hold(heading, 70, 0, 50); // closed
      expect(input.state.face).toBeLessThan(-0.25);
    }
  });

  it('detects backhand from roll, respecting handedness', () => {
    // Upright phone rolled in its own plane (about the screen normal): +roll = tip to the player's left.
    const rolled = (deg: number) => {
      const d = Math.PI / 180;
      const q = new Quaternion().setFromEuler(new Euler(90 * d, 0, 0)).multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), deg * d));
      return { x: q.x, y: q.y, z: q.z, w: q.w };
    };
    const run = (hand: 'right' | 'left', deg: number) => {
      const s = setup(hand);
      s.hold(30, 90, 0, 1200);
      for (let i = 0; i < 5; i++) {
        s.feed(0, 0, 0, { q: rolled(deg) });
        s.input.update(0.01);
      }
      return s.input.state.backhand;
    };
    expect(run('right', 0)).toBe(false);
    expect(run('right', 50)).toBe(true);
    expect(run('right', -50)).toBe(false);
    expect(run('left', -50)).toBe(true);
    expect(run('left', 50)).toBe(false);
  });

  it('drops stale / duplicate packets', () => {
    const { input, link, hold, seqRef, clock } = setup();
    hold(0, 90, 0, 1200);
    const aim = input.state.aimX;
    link.packet({ seq: seqRef() - 3, t: clock() - 30, q: quatFromEuler(-40, 90, 0), acc: { x: 0, y: 0, z: 0 }, gyro: { alpha: 0, beta: 0, gamma: 0 }, buttons: 0 });
    input.update(0.01);
    expect(input.state.aimX).toBeCloseTo(aim, 3);
  });
});

describe('PhoneInput swings', () => {
  it('emits one forward swing per stroke with power', () => {
    const { input, feed, hold } = setup();
    hold(0, 90, 0, 1200);
    const swings: SwingEvent[] = [];
    input.onSwing((e) => swings.push(e));
    // forehand: fast CCW rotation about the vertical (alpha increasing), ~15 rad/s peak
    let alpha = 0;
    for (let i = 0; i < 20; i++) {
      const x = (i - 10) / 4;
      const rate = 900 * Math.exp(-x * x); // deg/s
      alpha += rate * 0.01;
      feed(alpha, 90, 0, { gyro: { alpha: rate, beta: 0, gamma: 0 } });
      input.update(0.01);
    }
    hold(alpha, 90, 0, 300);
    expect(swings).toHaveLength(1);
    expect(swings[0].power).toBeGreaterThan(0.6);
    expect(swings[0].dir.z).toBeGreaterThan(0.5); // toward the opponent
    expect(swings[0].paddle.connected).toBe(true);
  });

  it('falls back to quaternion angular velocity without a gyro (SEN1)', () => {
    const { input, feed, hold } = setup();
    hold(0, 90, 0, 1200);
    let n = 0;
    input.onSwing(() => n++);
    let alpha = 0;
    for (let i = 0; i < 20; i++) {
      const x = (i - 10) / 4;
      alpha += 800 * Math.exp(-x * x) * 0.01;
      feed(alpha, 90, 0);
    }
    hold(alpha, 90, 0, 300);
    expect(n).toBe(1);
  });

  it('respects setSwingEnabled(false)', () => {
    const { input, feed, hold } = setup();
    hold(0, 90, 0, 1200);
    input.setSwingEnabled(false);
    let n = 0;
    input.onSwing(() => n++);
    for (let i = 0; i < 20; i++) feed(i * 8, 90, 0, { gyro: { alpha: 800, beta: 0, gamma: 0 } });
    expect(n).toBe(0);
  });
});

describe('PhoneInput buttons', () => {
  it('fires once per press even when both bitmask and control message arrive', () => {
    const { input, feed, link } = setup();
    const got: ControllerButton[] = [];
    input.onButton((b) => got.push(b));
    feed(0, 90, 0, { buttons: buttonBit('action') });
    link.message({ t: 'button', b: 'action' });
    feed(0, 90, 0, { buttons: 0 });
    link.message({ t: 'button', b: 'down' });
    feed(0, 90, 0, { buttons: buttonBit('down') });
    feed(0, 90, 0, { buttons: 0 });
    // second, genuine press of down
    link.message({ t: 'button', b: 'down' });
    feed(0, 90, 0, { buttons: buttonBit('down') });
    expect(got).toEqual(['action', 'down', 'down']);
  });

  it('forwards power from both the control message and the bitmask, de-duplicated', () => {
    const { input, feed, link } = setup();
    const got: ControllerButton[] = [];
    input.onButton((b) => got.push(b));
    feed(0, 90, 0, { buttons: buttonBit('power') });
    link.message({ t: 'button', b: 'power' });
    feed(0, 90, 0, { buttons: 0 });
    link.message({ t: 'button', b: 'power' });
    expect(got).toEqual(['power', 'power']);
  });

  it('vibrate sends a haptic message', () => {
    const { input, link } = setup();
    input.vibrate([20, 40]);
    expect(link.sent).toEqual([{ t: 'haptic', pattern: [20, 40] }]);
  });
});

describe('PhoneInput recovery after swings', () => {
  it('fires one swing per burst and settles back to neutral, even with slow frames', () => {
    const { input, feed, hold } = setup();
    hold(20, 90, 0, 1300);
    expect(input.calibration).toBe(1);
    const swings: SwingEvent[] = [];
    input.onSwing((e) => swings.push(e));
    for (let burst = 0; burst < 3; burst++) {
      // 150 ms forward rotation of the blade, packets every 16 ms, update() only every ~100 ms.
      for (let t = 0; t <= 150; t += 16) {
        const k = Math.sin((t / 150) * Math.PI);
        feed(20, 90 - 35 * k, 0, { gyro: { alpha: 0, beta: -900 * k, gamma: 0 }, acc: { x: 0, y: 0, z: -18 * k } }, 16);
        if (t % 96 === 0) input.update(0.1);
      }
      for (let t = 0; t < 600; t += 16) {
        feed(20, 90, 0, {}, 16);
        if (t % 96 === 0) input.update(0.1);
      }
      expect(Math.abs(input.state.aimX)).toBeLessThan(0.1);
      expect(Math.abs(input.state.aimY)).toBeLessThan(0.1);
      expect(input.state.swing).toBeLessThan(0.3);
    }
    expect(swings.length).toBe(3);
  });
});
