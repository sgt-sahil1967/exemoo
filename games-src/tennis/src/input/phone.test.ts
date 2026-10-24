import { describe, expect, it } from 'vitest';
import { SwingDetector, SWING_COOLDOWN_MS, PhoneRacketInput } from './phone';

const g = (alpha: number, beta: number, gamma: number) => ({ alpha, beta, gamma });

describe('SwingDetector', () => {
  it('fires once at the peak of a fast rotation', () => {
    const d = new SwingDetector();
    const speeds = [0, 100, 300, 600, 900, 700, 300, 50, 0];
    const hits = speeds.map((s, i) => d.push(g(s, 0, 0), i * 16)).filter(Boolean);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.flick).toBeGreaterThan(0.5);
    expect(hits[0]!.chop).toBe(false);
  });

  it('ignores slow wrist movement', () => {
    const d = new SwingDetector();
    for (let i = 0; i < 60; i++) expect(d.push(g(150 * Math.sin(i / 5), 80, 0), i * 16)).toBeNull();
  });

  it('marks a downward pitch-dominated swing as a chop (slice)', () => {
    const d = new SwingDetector();
    const hits = [400, 800, 500].map((s, i) => d.push(g(50, s, 30), i * 16)).filter(Boolean);
    expect(hits[0]!.chop).toBe(true);
  });

  it('waits for the cooldown before the next swing', () => {
    const d = new SwingDetector();
    let n = 0;
    const burst = (t0: number) => [500, 900, 400].forEach((s, i) => d.push(g(s, 0, 0), t0 + i * 16) && n++);
    burst(0);
    burst(100);
    expect(n).toBe(1);
    burst(SWING_COOLDOWN_MS + 200);
    expect(n).toBe(2);
  });
});

describe('PhoneRacketInput', () => {
  const pkt = (q: { x: number; y: number; z: number; w: number }, buttons = 0) => ({ t: 0, q, gyro: g(0, 0, 0), buttons });

  it('aims from the face direction relative to the recentred pose', () => {
    const input = new PhoneRacketInput();
    input.onPacket(pkt({ x: 0, y: 0, z: 0, w: 1 }));
    expect(input.aim().x).toBeCloseTo(0);
    // Rotate 20° about the device's vertical (y) axis.
    const h = (20 * Math.PI) / 360;
    input.onPacket(pkt({ x: 0, y: Math.sin(h), z: 0, w: Math.cos(h) }));
    expect(Math.abs(input.aim().x)).toBeGreaterThan(0.4);
    input.recenter();
    expect(input.aim().x).toBeCloseTo(0);
  });

  it('the pad button swings only while enabled', () => {
    const input = new PhoneRacketInput();
    let swings = 0;
    input.onSwing(() => swings++);
    input.onPacket(pkt({ x: 0, y: 0, z: 0, w: 1 }, 1));
    expect(swings).toBe(0);
    input.enabled = true;
    input.onPacket(pkt({ x: 0, y: 0, z: 0, w: 1 }, 0));
    input.onPacket(pkt({ x: 0, y: 0, z: 0, w: 1 }, 1));
    expect(swings).toBe(1);
  });
});
