import { describe, expect, test } from 'vitest';
import { COURSE, buildHole, courseSummary, holesFor } from '.';
import { BuiltHole } from './hole';
import { HOLE_SPECS } from './holes';
import { YARD } from '../core/contracts';

describe('course', () => {
  test('9 holes, tiers and hole sets', () => {
    expect(COURSE.holes.length).toBe(9);
    expect(holesFor('beginner').map((h) => h.number)).toEqual([1, 2, 3]);
    expect(holesFor('intermediate').every((h) => h.tier === 'intermediate')).toBe(true);
    expect(holesFor('expert').map((h) => h.number)).toEqual([7, 8, 9]);
    expect(holesFor('front9').length).toBe(9);
    const par = COURSE.holes.reduce((a, h) => a + h.par, 0);
    expect(par).toBeGreaterThanOrEqual(35);
    expect(par).toBeLessThanOrEqual(36);
  });

  test('lengths fit their pars', () => {
    for (const s of courseSummary()) {
      const [lo, hi] = s.par === 3 ? [140, 190] : s.par === 4 ? [320, 430] : [470, 540];
      expect(s.yards, s.name).toBeGreaterThanOrEqual(lo);
      expect(s.yards, s.name).toBeLessThanOrEqual(hi);
    }
  });

  test('buildHole is cached and fast', () => {
    for (const spec of HOLE_SPECS) {
      const t0 = performance.now();
      new BuiltHole(spec);
      expect(performance.now() - t0, spec.name).toBeLessThan(120);
    }
    expect(buildHole(3)).toBe(buildHole(COURSE.holes[2]));
  });

  for (const def of COURSE.holes) {
    test(`hole ${def.number} ${def.name} is well-formed`, () => {
      const h = buildHole(def);
      const B = h.bounds;
      expect(h.surfaceAt(h.tee.x, h.tee.z)).toBe('tee');
      expect(h.surfaceAt(h.pin.x, h.pin.z)).toBe('green');
      expect(Math.abs(h.tee.y - h.heightAt(h.tee.x, h.tee.z))).toBeLessThan(1e-6);
      // pin on a flat-ish spot
      const n = h.normalAt(h.pin.x, h.pin.z);
      expect(Math.hypot(n.x, n.z)).toBeLessThan(0.04);
      // reachable: centreline ends at the pin, approach close to the pin is dry
      const last = h.centerline[h.centerline.length - 1];
      expect(Math.hypot(last.x - h.pin.x, last.z - h.pin.z)).toBeLessThan(0.5);
      for (const p of h.centerline) {
        expect(p.x).toBeGreaterThan(B.minX);
        expect(p.x).toBeLessThan(B.maxX);
        expect(p.z).toBeGreaterThan(B.minZ);
        expect(p.z).toBeLessThan(B.maxZ);
        const surf = h.surfaceAt(p.x, p.z);
        expect(surf).not.toBe('ob');
        if (p.distanceTo(h.pin) < 6) expect(['green', 'fringe']).toContain(surf);
      }
      expect(Math.abs(h.yards - (h.centerline.length > 1 ? h.yards : 0))).toBe(0);
      // trees
      expect(h.trees.length).toBeGreaterThanOrEqual(60);
      expect(h.trees.length).toBeLessThanOrEqual(200);
      for (const t of h.trees) {
        for (const p of h.centerline) expect(Math.hypot(t.pos.x - p.x, t.pos.z - p.z)).toBeGreaterThan(3);
        expect(Math.hypot(t.pos.x - h.tee.x, t.pos.z - h.tee.z)).toBeGreaterThan(10);
        expect(Math.hypot(t.pos.x - h.pin.x, t.pos.z - h.pin.z)).toBeGreaterThan(h.greenRadius);
        expect(t.height).toBeGreaterThanOrEqual(6);
        expect(t.height).toBeLessThanOrEqual(16);
        expect(t.radius).toBeGreaterThanOrEqual(2);
        expect(t.radius).toBeLessThanOrEqual(5);
      }
      // heights finite; water consistent with waterLevel
      for (let x = B.minX; x <= B.maxX; x += 7) {
        for (let z = B.minZ; z <= B.maxZ; z += 7) {
          const y = h.heightAt(x, z);
          expect(Number.isFinite(y)).toBe(true);
          const s = h.surfaceAt(x, z);
          if (s === 'water') expect(y).toBeLessThan(h.waterLevel!);
        }
      }
      // aimTarget gives a sensible point
      const aim = h.aimTarget(h.tee, 230 * YARD);
      expect(Math.hypot(aim.x - h.tee.x, aim.z - h.tee.z)).toBeLessThanOrEqual(230 * YARD + 1);
      expect(['water', 'sand', 'ob']).not.toContain(h.surfaceAt(aim.x, aim.z));
    });
  }

  test('greens are smooth with gentle slopes', () => {
    for (const def of COURSE.holes) {
      const h = buildHole(def);
      let max = 0;
      for (let a = 0; a < Math.PI * 2; a += 0.4) {
        for (let r = 0; r < h.greenRadius * 0.8; r += 1.5) {
          const n = h.normalAt(h.greenCenter.x + Math.cos(a) * r, h.greenCenter.z + Math.sin(a) * r);
          max = Math.max(max, Math.hypot(n.x, n.z));
        }
      }
      expect(max, def.name).toBeLessThan(0.12);
    }
  });

  test('deterministic', () => {
    const a = new BuiltHole(HOLE_SPECS[4]);
    const b = new BuiltHole(HOLE_SPECS[4]);
    expect(a.trees.map((t) => t.pos.x)).toEqual(b.trees.map((t) => t.pos.x));
    expect(a.heightAt(12.3, -100.7)).toBe(b.heightAt(12.3, -100.7));
  });
});
