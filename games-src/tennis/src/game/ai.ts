import { Vector3 } from 'three';
import { COURT, clamp, gauss, lerp } from '../constants';
import type { Stroke } from '../players/athlete';
import type { PredSample, Prediction, Box } from '../physics/ball';
import type { Side } from './rules';

export interface Contact {
  /** Absolute game time of ideal contact. */
  t: number;
  p: Vector3;
  firstBounce: Vector3 | null;
  stroke: Stroke;
}

/**
 * Pick where a player on `side` should meet the ball: after its first bounce on their side,
 * as it drops through waist height — or at the deep limit if it would carry further.
 */
export function findContact(pred: Prediction, side: Side, now: number, deepLimit: number): Omit<Contact, 'stroke'> | null {
  const sgn = side === 0 ? 1 : -1;
  let first: PredSample | null = null;
  let last: PredSample | null = null;
  for (const s of pred.samples) {
    if (s.bounces === 0) continue;
    if (s.bounces >= 2) break;
    if (!first) {
      first = s;
      if (sgn * s.p.z <= 0) return null;
    }
    last = s;
    if (sgn * s.p.z >= deepLimit || (s.v.y < 0 && s.p.y <= 1.0)) {
      return { t: now + s.t, p: s.p.clone(), firstBounce: first.p.clone() };
    }
  }
  return last ? { t: now + last.t, p: last.p.clone(), firstBounce: first!.p.clone() } : null;
}

export interface AIProfile {
  name: string;
  speed: number;
  reaction: number;
  errorSigma: number;
  bigErrorChance: number;
  pace: [number, number];
  /** Chance of correctly leaving a ball that's going out. */
  judgeOut: number;
  depth: [number, number];
  width: number;
  reach: number;
}

export const ROOKIE: AIProfile = {
  name: 'ROOKIE RAY',
  speed: 4.6,
  reaction: 0.36,
  errorSigma: 0.95,
  bigErrorChance: 0.09,
  pace: [19, 25],
  judgeOut: 0.8,
  depth: [6.8, 10.2],
  width: 3.2,
  reach: 1.35,
};

export interface ShotPlan {
  target: Vector3;
  pace: number;
  spin: number;
  clearance: number;
}

/**
 * AI rally shot aimed into the near (+z) court, with rookie-level scatter.
 * `pressure` (0…2) grows with incoming pace and how far the AI had to run.
 */
export function aiShot(p: AIProfile, opponentX: number, pressure: number): ShotPlan {
  // Prefer the side away from the opponent.
  const away = opponentX > 0.6 ? -1 : opponentX < -0.6 ? 1 : Math.random() < 0.5 ? -1 : 1;
  let x = away * (0.6 + Math.random() * (p.width - 0.6));
  if (Math.random() < 0.3) x = (Math.random() * 2 - 1) * p.width;
  let z = lerp(p.depth[0], p.depth[1], Math.random());
  const sigma = (Math.random() < p.bigErrorChance * (1 + pressure) ? p.errorSigma * 2.6 : p.errorSigma) * (1 + pressure * 0.6);
  x += gauss() * sigma;
  z += gauss() * sigma * 1.1;
  return {
    target: new Vector3(x, 0, z),
    pace: lerp(p.pace[0], p.pace[1], Math.random()) * (1 - pressure * 0.12),
    spin: 0.8 + Math.random() * 0.3,
    clearance: 0.35 + Math.random() * 0.4,
  };
}

/** Gentle feed for practice/goal modes. */
export function feedShot(): ShotPlan {
  return {
    target: new Vector3((Math.random() * 2 - 1) * 2.4, 0, lerp(7.8, 10, Math.random())),
    pace: 16 + Math.random() * 3,
    spin: 0.7,
    clearance: 0.6,
  };
}

export function aiServe(box: Box, second: boolean): ShotPlan {
  const margin = second ? 0.6 : 0.3;
  const pick = Math.random();
  // Wide, body or T.
  const u = pick < 0.4 ? 0.1 : pick < 0.7 ? 0.5 : 0.9;
  let x = lerp(box.x0 + margin, box.x1 - margin, u);
  let z = lerp(box.z0, box.z1, 0.5) + (box.z1 > 0 ? 1 : -1) * (COURT.serviceLine * 0.3 - (second ? 0.6 : 0.2));
  const sigma = second ? 0.22 : 0.45;
  x += gauss() * sigma;
  z += gauss() * sigma;
  return {
    target: new Vector3(clamp(x, -6, 6), 0, z),
    pace: second ? 27 : 37 + Math.random() * 5,
    spin: second ? 0.9 : 0.25,
    clearance: second ? 0.35 : 0.1,
  };
}
