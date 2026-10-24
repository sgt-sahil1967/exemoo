import { describe, expect, it } from 'vitest';
import type { SwingEvent } from '../core/contracts';
import { DEFAULT_SETTINGS } from '../core/contracts';
import { MouseSwingInput } from './mouseSwing';

function setup(hand: 'right' | 'left' = 'right') {
  let t = 1000;
  const m = new MouseSwingInput(null, {
    now: () => t,
    height: 1000,
    keyboardTarget: null,
    settings: { ...DEFAULT_SETTINGS, handedness: hand },
  });
  const events: SwingEvent[] = [];
  const buttons: string[] = [];
  m.onSwing((e) => events.push(e));
  m.onButton((b) => buttons.push(b));
  /** Move linearly to (x, y) over ms in 10 ms steps. */
  let cx = 500;
  let cy = 300;
  const moveTo = (x: number, y: number, ms: number) => {
    const n = Math.max(1, Math.round(ms / 10));
    const x0 = cx, y0 = cy;
    for (let i = 1; i <= n; i++) {
      t += 10;
      cx = x0 + ((x - x0) * i) / n;
      cy = y0 + ((y - y0) * i) / n;
      m.pointerMove(cx, cy);
      m.update(0.01);
    }
  };
  return { m, events, buttons, moveTo, down: (b = 0) => m.pointerDown(cx, cy, b), up: (b = 0) => m.pointerUp(b) };
}

describe('MouseSwingInput', () => {
  it('drag down = backswing, fast flick up = full-power swing', () => {
    const s = setup();
    s.m.setMode('aim');
    s.down();
    expect(s.m.pose.armed).toBe(true);
    s.moveTo(500, 650, 500);
    expect(s.m.pose.backswing).toBeGreaterThan(0.9);
    s.moveTo(500, 250, 100);
    expect(s.events).toHaveLength(1);
    expect(s.events[0].power).toBeGreaterThan(0.9);
    expect(s.events[0].power).toBeLessThanOrEqual(1.15);
    expect(s.events[0].practice).toBe(false);
    expect(s.events[0].curve).toBe(0);
  });

  it('slow flick → low power; release without flick cancels', () => {
    const s = setup();
    s.m.setMode('aim');
    s.down();
    s.moveTo(500, 650, 500);
    s.moveTo(500, 250, 800);
    expect(s.events).toHaveLength(1);
    expect(s.events[0].power).toBeLessThan(0.4);

    const c = setup();
    c.m.setMode('aim');
    c.down();
    c.moveTo(500, 650, 500);
    c.up();
    c.moveTo(500, 200, 100);
    expect(c.events).toHaveLength(0);
  });

  it('flick to the right slices, left hooks (mirrored for left-handers)', () => {
    const r = setup();
    r.m.setMode('aim');
    r.down();
    r.moveTo(500, 650, 500);
    r.moveTo(650, 250, 100);
    expect(r.events[0].curve).toBeGreaterThan(0.2);

    const l = setup('left');
    l.m.setMode('aim');
    l.down();
    l.moveTo(500, 650, 500);
    l.moveTo(650, 250, 100);
    expect(l.events[0].curve).toBeLessThan(-0.2);
  });

  it('right-button drag is a practice swing', () => {
    const s = setup();
    s.m.setMode('aim');
    s.down(2);
    s.moveTo(500, 650, 500);
    s.moveTo(500, 250, 100);
    expect(s.events[0].practice).toBe(true);
  });

  it('putt mode uses shorter distances', () => {
    const s = setup();
    s.m.setMode('putt');
    s.down();
    s.moveTo(500, 400, 400); // 100 px ≈ 0.55 of a putt backswing
    s.moveTo(500, 280, 200);
    expect(s.events).toHaveLength(1);
    expect(s.events[0].power).toBeGreaterThan(0.2);
    expect(s.events[0].power).toBeLessThan(0.7);
  });

  it('no swings in menu; keyboard maps to buttons, Space arms', () => {
    const s = setup();
    s.m.setMode('menu');
    s.down();
    s.moveTo(500, 650, 300);
    s.moveTo(500, 250, 100);
    expect(s.events).toHaveLength(0);
    s.m.key('ArrowLeft', true);
    s.m.key('ArrowLeft', true, true);
    s.m.key('KeyE', true);
    s.m.key('KeyE', true, true);
    s.m.key('Enter', true);
    s.m.key('Escape', true);
    expect(s.buttons).toEqual(['left', 'left', 'plus', 'a', 'pause']);
    s.m.setMode('aim');
    s.m.key('Space', true);
    expect(s.m.pose.armed).toBe(true);
    s.m.key('Space', false);
    expect(s.m.pose.armed).toBe(false);
  });
});
