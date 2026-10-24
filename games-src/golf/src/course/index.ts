/**
 * src/course — "Birdie Resort", a 9-hole Wii-Sports-style course.
 *
 *   COURSE            static course description (HoleDefs)
 *   holesFor(set)     hole selection for a HoleSet
 *   buildHole(def|n)  runtime Hole (cached; builds in a few tens of ms)
 *   courseSummary()   [{ number, par, yards, name }] for the scorecard
 */
import type { CourseDef, Hole, HoleDef, HoleSet } from '../core/contracts';
import { BuiltHole } from './hole';
import { HOLE_SPECS } from './holes';

export { BuiltHole } from './hole';
export type { HoleSpec, GreenSpec, TreeSpec } from './hole';

export const COURSE: CourseDef = {
  id: 'birdie-resort',
  name: 'Birdie Resort',
  holes: HOLE_SPECS.map((s) => ({ number: s.number, name: s.name, par: s.par, tier: s.tier })),
};

export function holesFor(set: HoleSet): HoleDef[] {
  switch (set) {
    case 'beginner':
      return COURSE.holes.slice(0, 3);
    case 'intermediate':
      return COURSE.holes.slice(3, 6);
    case 'expert':
      return COURSE.holes.slice(6, 9);
    default:
      return COURSE.holes.slice();
  }
}

const cache = new Map<number, BuiltHole>();

export function buildHole(def: HoleDef | number): Hole {
  const n = typeof def === 'number' ? def : def.number;
  let h = cache.get(n);
  if (!h) {
    const spec = HOLE_SPECS.find((s) => s.number === n);
    if (!spec) throw new Error(`No hole #${n} on ${COURSE.name}`);
    h = new BuiltHole(spec);
    cache.set(n, h);
  }
  return h;
}

export function courseSummary(): { number: number; par: number; yards: number; name: string }[] {
  return HOLE_SPECS.map((s) => {
    const h = buildHole(s.number);
    return { number: s.number, par: s.par, yards: h.yards, name: s.name };
  });
}
