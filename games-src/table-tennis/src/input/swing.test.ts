import { describe, expect, it } from 'vitest';
import { SwingDetector } from './swing';

/** Bell-shaped swing profile sampled every dt ms. */
function swing(det: SwingDetector, t0: number, peak: number, dur = 200, dt = 10) {
  const fired = [];
  for (let t = 0; t <= dur; t += dt) {
    const x = (t - dur / 2) / (dur / 4);
    const r = det.push(t0 + t, peak * Math.exp(-x * x));
    if (r.fired) fired.push(r.fired);
  }
  return fired;
}

function idle(det: SwingDetector, t0: number, dur: number, dt = 10) {
  for (let t = 0; t < dur; t += dt) det.push(t0 + t, 0.02);
}

describe('SwingDetector', () => {
  it('fires exactly once per stroke, at the peak', () => {
    const d = new SwingDetector();
    idle(d, 0, 100);
    const f = swing(d, 100, 0.8);
    expect(f).toHaveLength(1);
    expect(f[0].time).toBe(200); // peak at mid-stroke
    expect(f[0].power).toBeGreaterThan(0.6);
    expect(f[0].power).toBeLessThanOrEqual(1);
  });

  it('ignores motion below threshold', () => {
    const d = new SwingDetector();
    expect(swing(d, 0, 0.2)).toHaveLength(0);
  });

  it('power grows with swing strength', () => {
    const a = swing(new SwingDetector(), 0, 0.4)[0];
    const b = swing(new SwingDetector(), 0, 0.7)[0];
    const c = swing(new SwingDetector(), 0, 1.5)[0];
    expect(a.power).toBeLessThan(b.power);
    expect(b.power).toBeLessThan(c.power);
    expect(c.power).toBe(1);
  });

  it('sensitivity scales thresholds', () => {
    const lo = new SwingDetector();
    lo.sensitivity = 0.5;
    expect(swing(lo, 0, 0.4)).toHaveLength(0);
    const hi = new SwingDetector();
    hi.sensitivity = 2;
    expect(swing(hi, 0, 0.2)).toHaveLength(1);
  });

  it('enforces the refractory period but allows a clean second stroke', () => {
    const d = new SwingDetector();
    // a jittery double-peak within 120 ms counts once
    const samples = [0.1, 0.5, 0.9, 0.6, 0.8, 0.95, 0.5, 0.1, 0.05];
    let n = 0;
    samples.forEach((m, i) => (d.push(i * 15, m).fired ? n++ : 0));
    expect(n).toBe(1);
    idle(d, 200, 200);
    expect(swing(d, 400, 0.8)).toHaveLength(1);
  });

  it('bounds latency on a long plateau', () => {
    const d = new SwingDetector();
    let firedAt = -1;
    for (let t = 0; t < 600; t += 10) {
      const r = d.push(t, t < 20 ? 0 : 0.8 + t * 0.0001);
      if (r.fired && firedAt < 0) firedAt = t;
    }
    expect(firedAt).toBeGreaterThan(0);
    expect(firedAt).toBeLessThanOrEqual(20 + 170);
  });

  it('does not fire while disabled', () => {
    const d = new SwingDetector();
    d.enabled = false;
    expect(swing(d, 0, 0.9)).toHaveLength(0);
  });
});
