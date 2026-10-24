import { describe, expect, it } from 'vitest';
import { Matrix4, Quaternion, Vector3 } from 'three';
import type { PhoneLinkEvents, SensorPacket, Settings, SwingEvent } from '../core/contracts';
import { DEFAULT_SETTINGS } from '../core/contracts';
import { buttonBit } from '../net/packets';
import { PhoneSwingInput } from './phoneSwing';
import { DEG, RAD2DEG } from './clubMath';
import { SwingDetector, speedToPower, AIM_TUNING, PUTT_TUNING } from './swingDetector';

// ───────────────────────────── synthetic phone ─────────────────────────────
/** Address pose: player faces north (+Y), target west (−X) for a right-hander.
 *  Device y (top) points down, screen (z) faces the player (south), x points west. */
const Q0 = new Quaternion().setFromRotationMatrix(
  new Matrix4().makeBasis(new Vector3(-1, 0, 0), new Vector3(0, 0, -1), new Vector3(0, -1, 0)),
);
const TARGET_LINE = new Vector3(-1, 0, 0);
/** Target line with the component along the shaft removed: a pure path change, no face twist. */
function pathAxis(q: Quaternion): Vector3 {
  const s = new Vector3(0, 1, 0).applyQuaternion(q);
  return TARGET_LINE.clone().addScaledVector(s, -TARGET_LINE.dot(s));
}

function fakeLink() {
  const ls: { [K in keyof PhoneLinkEvents]: Set<PhoneLinkEvents[K]> } = {
    status: new Set(),
    packet: new Set(),
    message: new Set(),
  };
  return {
    status: 'connected' as const,
    sent: [] as unknown[],
    on<K extends keyof PhoneLinkEvents>(ev: K, cb: PhoneLinkEvents[K]) {
      (ls[ev] as Set<PhoneLinkEvents[K]>).add(cb);
      return () => (ls[ev] as Set<PhoneLinkEvents[K]>).delete(cb);
    },
    send(m: unknown) {
      this.sent.push(m);
    },
  };
}

interface Seg {
  ms: number;
  /** in-plane rate, deg/s (+ = backswing), as a function of progress u ∈ [0,1) */
  rate?: (u: number) => number;
  /** twist about the phone's long axis, deg/s (+ = rotation about device +y) */
  twist?: number;
  /** out-of-plane rotation about the target line, deg/s (+ = out-to-in for a right-hander) */
  path?: number;
  armed?: boolean;
}

interface SimOpts {
  hand?: 'right' | 'left';
  settings?: Partial<Settings>;
  mode?: 'aim' | 'putt' | 'menu' | 'watch';
  noiseDeg?: number;
  gyroNoise?: number;
  gyroScale?: number;
  noGyro?: boolean;
  seed?: number;
}

function simulate(segs: Seg[], o: SimOpts = {}) {
  let t = 1000;
  const link = fakeLink();
  const hand = o.hand ?? 'right';
  const input = new PhoneSwingInput(link, {
    now: () => t,
    settings: { ...DEFAULT_SETTINGS, handedness: hand, ...o.settings },
  });
  input.setMode(o.mode ?? 'aim');
  const events: SwingEvent[] = [];
  input.onSwing((e) => events.push(e));
  // plane normal: rotation about +N moves the shaft toward the backswing side
  const N = hand === 'right' ? new Vector3(0, -1, 0) : new Vector3(0, 1, 0);
  const q = Q0.clone();
  let seq = 0;
  let seed = o.seed ?? 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647 - 0.5;
  };
  const dt = 0.01;
  const wE = new Vector3();
  const tmp = new Quaternion();
  for (const s of segs) {
    const n = Math.round(s.ms / 10);
    for (let i = 0; i < n; i++) {
      const u = i / n;
      wE.set(0, 0, 0)
        .addScaledVector(N, (s.rate ? s.rate(u) : 0) * DEG)
        .addScaledVector(new Vector3(0, 1, 0).applyQuaternion(q), (s.twist ?? 0) * DEG)
        .addScaledVector(pathAxis(q), (s.path ?? 0) * DEG * (hand === 'right' ? 1 : -1));
      const ang = wE.length() * dt;
      if (ang > 0) q.premultiply(tmp.setFromAxisAngle(wE.clone().normalize(), ang)).normalize();
      t += 10;
      const body = wE.clone().applyQuaternion(q.clone().invert()).multiplyScalar(RAD2DEG);
      const gn = o.gyroNoise ?? 0;
      const gs = o.gyroScale ?? 1;
      let qr = q.clone();
      if (o.noiseDeg) {
        const ax = new Vector3(rnd(), rnd(), rnd()).normalize();
        qr = qr.multiply(new Quaternion().setFromAxisAngle(ax, rnd() * 2 * o.noiseDeg * DEG));
      }
      const p: SensorPacket = {
        seq: ++seq,
        t,
        q: { x: qr.x, y: qr.y, z: qr.z, w: qr.w },
        acc: { x: 0, y: 0, z: 0 },
        gyro: o.noGyro
          ? { alpha: 0, beta: 0, gamma: 0 }
          : {
              alpha: (body.z + rnd() * 2 * gn) * gs,
              beta: (body.x + rnd() * 2 * gn) * gs,
              gamma: (body.y + rnd() * 2 * gn) * gs,
            },
        buttons: s.armed ? buttonBit('swing') : 0,
      };
      input.onPacket(p);
      input.update(0.01);
    }
  }
  return { input, events, link };
}

/** Rate profile helpers (deg/s). */
const sinRate = (totalDeg: number, ms: number) => (u: number) => ((totalDeg * Math.PI) / (2 * (ms / 1000))) * Math.sin(Math.PI * u);
const still = (ms: number, armed = false): Seg => ({ ms, armed });

function fullSwing(peak: number, opts: { armed?: boolean; twist?: number; path?: number; top?: number } = {}): Seg[] {
  const armed = opts.armed ?? true;
  const top = opts.top ?? 170;
  return [
    still(800, armed),
    { ms: 900, rate: sinRate(top, 900), armed },
    { ms: 100, armed, twist: opts.twist ? (opts.twist / 0.1) : 0 },
    { ms: 200, rate: (u) => -peak * u, armed },
    { ms: 400, rate: () => -peak, armed, path: opts.path },
    { ms: 300, rate: (u) => -peak * (1 - u), armed },
    still(400, armed),
  ];
}

describe('PhoneSwingInput — full swing', () => {
  it('auto-calibrates when held still pointing down', () => {
    const { input } = simulate([still(700)]);
    expect(input.calibrated).toBe(true);
    expect(input.pose.backswing).toBeCloseTo(0, 2);
  });

  it('pose follows the backswing', () => {
    const { input } = simulate([still(800), { ms: 900, rate: sinRate(90, 900) }, still(200)]);
    expect(input.pose.shaftAngle).toBeCloseTo(Math.PI / 2, 1);
    expect(input.pose.backswing).toBeCloseTo(0.5 / 0.85, 1);
  });

  it('full armed swing → power ≈ 1, not practice, straight', () => {
    const { events } = simulate(fullSwing(900));
    expect(events).toHaveLength(1);
    const e = events[0];
    expect(e.power).toBeGreaterThan(0.9);
    expect(e.power).toBeLessThan(1.1);
    expect(e.practice).toBe(false);
    expect(Math.abs(e.curve)).toBeLessThan(0.05);
    expect(e.backswing).toBeGreaterThan(1);
    expect(e.quality).toBeGreaterThan(0.7);
  });

  it('unarmed swing is a practice swing (holdToSwing)', () => {
    const { events } = simulate(fullSwing(900, { armed: false }));
    expect(events).toHaveLength(1);
    expect(events[0].practice).toBe(true);
  });

  it('every full swing counts when holdToSwing is off', () => {
    const { events } = simulate(fullSwing(900, { armed: false }), { settings: { holdToSwing: false } });
    expect(events[0].practice).toBe(false);
  });

  it('slow swing → low power', () => {
    const { events } = simulate(fullSwing(300));
    expect(events).toHaveLength(1);
    expect(events[0].power).toBeGreaterThan(0.15);
    expect(events[0].power).toBeLessThan(0.35);
  });

  it('sensitivity scales power', () => {
    const { events } = simulate(fullSwing(500), { settings: { sensitivity: 1.6 } });
    expect(events[0].power).toBeCloseTo(speedToPower(800 * DEG, AIM_TUNING), 1);
  });

  it('short backswing caps power', () => {
    const { events } = simulate(fullSwing(1000, { top: 50 }));
    expect(events).toHaveLength(1);
    expect(events[0].power).toBeLessThan(0.7);
  });

  it('open face → positive curve (slice), closed → negative', () => {
    const open = simulate(fullSwing(900, { twist: 18 })).events[0];
    const closed = simulate(fullSwing(900, { twist: -18 })).events[0];
    expect(open.curve).toBeGreaterThan(0.2);
    expect(closed.curve).toBeLessThan(-0.2);
  });

  it('out-to-in path adds slice', () => {
    const e = simulate(fullSwing(900, { path: 200 })).events[0];
    expect(e.curve).toBeGreaterThan(0.1);
    const inOut = simulate(fullSwing(900, { path: -200 })).events[0];
    expect(inOut.curve).toBeLessThan(-0.1);
  });

  it('left-handed swings are mirrored', () => {
    const { events } = simulate(fullSwing(900), { hand: 'left' });
    expect(events).toHaveLength(1);
    expect(events[0].power).toBeGreaterThan(0.9);
    // for a left-hander "open" is a twist the other way about the phone's long axis
    const open = simulate(fullSwing(900, { twist: -18 }), { hand: 'left' }).events[0];
    expect(open.curve).toBeGreaterThan(0.2);
  });

  it('works without a gyro (quaternion differencing, SEN1)', () => {
    const { events } = simulate(fullSwing(900), { noGyro: true });
    expect(events).toHaveLength(1);
    expect(events[0].power).toBeGreaterThan(0.7);
  });

  it('copes with a gyro reporting rad/s', () => {
    const { events } = simulate([...fullSwing(900), ...fullSwing(900).slice(1)], { gyroScale: DEG });
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[events.length - 1].power).toBeGreaterThan(0.85);
  });

  it('still or noisy phone → no swing', () => {
    expect(simulate([still(5000)]).events).toHaveLength(0);
    expect(simulate([still(6000, true)], { noiseDeg: 2, gyroNoise: 25 }).events).toHaveLength(0);
  });

  it('ignores swings in menu/watch mode', () => {
    expect(simulate(fullSwing(900), { mode: 'menu' }).events).toHaveLength(0);
    expect(simulate(fullSwing(900), { mode: 'watch' }).events).toHaveLength(0);
  });

  it('disconnect mid-swing drops the swing', () => {
    const r = simulate(fullSwing(900).slice(0, 3));
    (r.link as { status: string }).status = 'disconnected';
    r.input.update(0.016);
    expect(r.input.pose.connected).toBe(false);
    expect(r.input.phase).toBe('idle');
  });

  it('debounces: a second swing inside 1 s is ignored, later ones count', () => {
    const segs = fullSwing(900);
    const quick: Seg[] = [...segs.slice(0, 6), { ms: 100, rate: sinRate(170, 100) }, { ms: 300, rate: () => -900 }];
    expect(simulate(quick).events).toHaveLength(1);
    const two = simulate([...segs, ...segs.slice(1)]);
    expect(two.events).toHaveLength(2);
  });

  it('button mask edges fire once, deduped with control messages', () => {
    const { input } = simulate([still(10)]);
    const got: string[] = [];
    input.onButton((b) => got.push(b));
    const pkt = (seq: number, buttons: number): SensorPacket => ({
      seq,
      t: 5000 + seq * 10,
      q: { x: Q0.x, y: Q0.y, z: Q0.z, w: Q0.w },
      acc: { x: 0, y: 0, z: 0 },
      gyro: { alpha: 0, beta: 0, gamma: 0 },
      buttons,
    });
    (input as unknown as { onMessage(m: unknown): void }).onMessage({ t: 'button', b: 'plus' });
    input.onPacket(pkt(100, buttonBit('plus')));
    input.onPacket(pkt(101, buttonBit('plus')));
    input.onPacket(pkt(102, 0));
    expect(got).toEqual(['plus']);
  });
});

describe('PhoneSwingInput — putting', () => {
  const putt = (peak: number, armed = true, twist = 0): Seg[] => [
    still(800, armed),
    { ms: 600, rate: sinRate(8, 600), armed },
    { ms: 100, armed, twist: twist / 0.1 },
    { ms: 60, rate: (u) => -peak * u, armed },
    { ms: 300, rate: () => -peak, armed },
    { ms: 200, rate: (u) => -peak * (1 - u), armed },
    still(300, armed),
  ];

  it('detects a gentle pendulum putt', () => {
    const { events } = simulate(putt(130), { mode: 'putt' });
    expect(events).toHaveLength(1);
    expect(events[0].power).toBeGreaterThan(0.4);
    expect(events[0].power).toBeLessThan(0.75);
    expect(events[0].practice).toBe(false);
  });

  it('putt power grows with stroke speed', () => {
    const soft = simulate(putt(60), { mode: 'putt' }).events[0];
    const firm = simulate(putt(220), { mode: 'putt' }).events[0];
    expect(soft.power).toBeLessThan(0.3);
    expect(firm.power).toBeGreaterThan(1);
  });

  it('putt face has a smaller influence', () => {
    const e = simulate(putt(130, true, 15), { mode: 'putt' }).events[0];
    expect(e.curve).toBeGreaterThan(0);
    expect(e.curve).toBeLessThan(0.3);
  });

  it('noisy phone at address does not putt', () => {
    expect(simulate([still(6000, true)], { mode: 'putt', noiseDeg: 1, gyroNoise: 10 }).events).toHaveLength(0);
  });
});

describe('speedToPower', () => {
  it('maps the documented anchor points', () => {
    expect(speedToPower(250 * DEG, AIM_TUNING)).toBeCloseTo(0.2, 5);
    expect(speedToPower(900 * DEG, AIM_TUNING)).toBeCloseTo(1, 5);
    expect(speedToPower(3000 * DEG, AIM_TUNING)).toBe(1.15);
    expect(speedToPower(40 * DEG, PUTT_TUNING)).toBeCloseTo(0.05, 5);
    expect(speedToPower(220 * DEG, PUTT_TUNING)).toBeCloseTo(1.1, 5);
  });

  it('topping: lunging forward with no backswing gives a weak, poor shot', () => {
    const d = new SwingDetector();
    d.push({ t: 0, theta: 0, omega: 0, face: 0, path: 0, armed: true });
    d.push({ t: 10, theta: 0.02, omega: -1, face: 0, path: 0, armed: true });
    const e = d.push({ t: 20, theta: -0.1, omega: -10, face: 0, path: 0, armed: true });
    expect(e).not.toBeNull();
    expect(e!.power).toBeLessThanOrEqual(0.3);
    expect(e!.quality).toBeLessThan(0.3);
  });
});
