/**
 * Club availability and the caddie's default pick for a lie and distance.
 */
import type { ClubId, PuttRange, Surface } from '../core/contracts';
import { CLUBS, PUTT_RANGE_M, SURFACES, YARD } from '../core/contracts';

/** Effective full-power carry from a lie, metres (wedges keep more distance out of sand). */
export function carryFrom(club: ClubId, lie: Surface): number {
  const c = CLUBS.find((k) => k.id === club)!;
  let mult = SURFACES[lie].lieDistance || 1;
  if (lie === 'sand' && (c.kind === 'wedge' || club === '9I')) mult = 0.85;
  return c.carryYards * YARD * mult;
}

/** Clubs allowed from a lie: driver only from the tee; putter only near or on the green. */
export function clubsFor(lie: Surface, distToPinM: number): ClubId[] {
  return CLUBS.filter((c) => {
    if (c.id === '1W') return lie === 'tee';
    if (c.id === 'PT') return lie === 'green' || lie === 'fringe' || distToPinM < 25;
    if (lie === 'green') return false;
    return true;
  }).map((c) => c.id);
}

/** Smallest club that reaches `distM` from the lie (with ~4% margin), else the longest allowed. */
export function defaultClub(lie: Surface, distM: number, distToPinM: number): ClubId {
  const allowed = clubsFor(lie, distToPinM);
  if (lie === 'green' || (lie === 'fringe' && distToPinM < 12)) return 'PT';
  const full = allowed.filter((id) => id !== 'PT');
  // Bag order is longest first, so walk backwards to find the shortest club that gets there.
  for (let i = full.length - 1; i >= 0; i--) {
    if (carryFrom(full[i], lie) >= distM * 1.04) return full[i];
  }
  return full[0] ?? 'PT';
}

export function defaultPuttRange(distM: number): PuttRange {
  if (distM <= PUTT_RANGE_M.short * 0.85) return 'short';
  if (distM <= PUTT_RANGE_M.medium * 0.85) return 'medium';
  return 'long';
}

export function nextPuttRange(r: PuttRange, dir: 1 | -1): PuttRange {
  const order: PuttRange[] = ['short', 'medium', 'long'];
  return order[Math.max(0, Math.min(2, order.indexOf(r) + dir))];
}
