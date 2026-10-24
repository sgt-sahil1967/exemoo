/**
 * Training challenges (single player):
 *   putt      — five putts of increasing length; score = putts holed.
 *   approach  — five approach shots from 60–150 yd; score = average distance to the pin (yd).
 *   drive     — five drives; score = longest drive that finishes in the fairway (yd).
 */
import { Vector3 } from 'three';
import type { GameMode, Hole, ResultsData, Surface } from '../core/contracts';
import { YARD, toYards } from '../core/contracts';

export const TRAINING_BALLS = 5;

export interface Attempt {
  from: Vector3;
  lie: Surface;
}

export type TrainingMode = Extract<GameMode, 'training-putt' | 'training-approach' | 'training-drive'>;

/** Which course hole each challenge is played on. */
export const TRAINING_HOLE: Record<TrainingMode, number> = {
  'training-putt': 2,
  'training-approach': 4,
  'training-drive': 9,
};

export const TRAINING_TITLE: Record<TrainingMode, string> = {
  'training-putt': 'Putting Challenge',
  'training-approach': 'Approach Challenge',
  'training-drive': 'Long Drive Challenge',
};

/** Mulberry32 — deterministic per session so the five setups don't repeat within a run. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Training {
  ball = 0;
  /** Per-ball result: putt 1/0 holed; approach yards to pin; drive yards (0 = missed fairway). */
  results: number[] = [];
  private rand: () => number;

  constructor(readonly mode: TrainingMode, seed = Date.now()) {
    this.rand = rng(seed);
  }

  get done(): boolean {
    return this.ball >= TRAINING_BALLS;
  }

  /** Lower is better for approach, higher for the others. */
  get lowerIsBetter(): boolean {
    return this.mode === 'training-approach';
  }

  /** Where the next ball is played from. */
  setup(hole: Hole): Attempt {
    if (this.mode === 'training-drive') return { from: hole.tee.clone(), lie: 'tee' };
    if (this.mode === 'training-putt') {
      const dist = [1.5, 3, 5, 7.5, 10][this.ball] ?? 6;
      return this.findSpot(hole, dist, (s) => s === 'green', 'green');
    }
    const yd = 60 + this.rand() * 90;
    return this.findSpot(hole, yd * YARD, (s) => s === 'fairway', 'fairway');
  }

  /** Search around the pin (biased toward the tee side) for a spot of the right surface. */
  private findSpot(hole: Hole, dist: number, ok: (s: Surface) => boolean, lie: Surface): Attempt {
    const pin = hole.pin;
    const back = Math.atan2(hole.tee.x - pin.x, hole.tee.z - pin.z);
    for (let tries = 0; tries < 200; tries++) {
      const spread = this.mode === 'training-putt' ? Math.PI : 0.5 + tries * 0.01;
      const a = back + (this.rand() - 0.5) * spread;
      const d = dist * (1 + (tries > 60 ? (this.rand() - 0.5) * 0.3 : 0));
      const x = pin.x + Math.sin(a) * d;
      const z = pin.z + Math.cos(a) * d;
      if (ok(hole.surfaceAt(x, z))) return { from: new Vector3(x, hole.heightAt(x, z), z), lie };
    }
    return { from: hole.tee.clone(), lie: 'tee' };
  }

  /** Record the outcome of the current ball and advance. Returns a short label for the banner. */
  record(hole: Hole, a: Attempt, outcome: { holed: boolean; pos: Vector3; surface: Surface; hazard: boolean }): string {
    let v = 0;
    let label = '';
    if (this.mode === 'training-putt') {
      v = outcome.holed ? 1 : 0;
      label = outcome.holed ? 'In the hole!' : 'Missed';
    } else if (this.mode === 'training-approach') {
      v = outcome.holed ? 0 : outcome.hazard ? 60 : toYards(Math.hypot(outcome.pos.x - hole.pin.x, outcome.pos.z - hole.pin.z));
      label = outcome.holed ? 'Holed it!' : outcome.hazard ? 'Hazard · 60 yd' : `${v.toFixed(1)} yd from the pin`;
    } else {
      const inPlay = !outcome.hazard && (outcome.surface === 'fairway' || outcome.surface === 'fringe' || outcome.surface === 'green');
      v = inPlay ? toYards(Math.hypot(outcome.pos.x - a.from.x, outcome.pos.z - a.from.z)) : 0;
      label = inPlay ? `${Math.round(v)} yd` : 'Missed the fairway';
    }
    this.results.push(v);
    this.ball++;
    return label;
  }

  /** Final score: holed count / average yards / best yards. */
  score(): number {
    if (this.mode === 'training-putt') return this.results.reduce((s, v) => s + v, 0);
    if (this.mode === 'training-approach') return this.results.reduce((s, v) => s + v, 0) / Math.max(1, this.results.length);
    return Math.max(0, ...this.results);
  }

  formatScore(v = this.score()): string {
    if (this.mode === 'training-putt') return `${v} / ${TRAINING_BALLS} holed`;
    if (this.mode === 'training-approach') return `${v.toFixed(1)} yd avg`;
    return `${Math.round(v)} yd`;
  }

  /** "Ball 3/5 · 2 holed" */
  line(best?: number): string {
    const n = Math.min(this.ball + 1, TRAINING_BALLS);
    let s = `Ball ${n}/${TRAINING_BALLS}`;
    if (this.results.length) s += ` · ${this.formatScore()}`;
    if (best !== undefined) s += ` · Best ${this.formatScore(best)}`;
    return s;
  }

  isBetter(v: number, best: number | undefined): boolean {
    if (best === undefined) return true;
    return this.lowerIsBetter ? v < best : v > best;
  }

  resultsData(name: string, color: string, best: number | undefined): ResultsData {
    const v = this.score();
    const rows = this.results.map((r, i) => ({
      name: `Ball ${i + 1}`,
      color,
      value:
        this.mode === 'training-putt' ? (r ? 'Holed' : 'Missed') : this.mode === 'training-approach' ? `${r.toFixed(1)} yd` : r ? `${Math.round(r)} yd` : '—',
    }));
    const notes: string[] = [];
    if (this.isBetter(v, best)) notes.push('New personal best!');
    else if (best !== undefined) notes.push(`Personal best: ${this.formatScore(best)}`);
    return {
      title: TRAINING_TITLE[this.mode],
      rows: [{ name, color, value: this.formatScore(v), sub: 'Final score', best: true }, ...rows],
      notes,
    };
  }
}
