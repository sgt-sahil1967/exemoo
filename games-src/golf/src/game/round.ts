/**
 * Stroke-play bookkeeping for a hot-seat round (1–4 players). Pure logic, no rendering.
 *
 * Turn order follows golf etiquette: on the tee the player with the honour (best score on the
 * previous hole, ties keep the previous order) goes first; after that the player farthest from
 * the pin plays next. A player picks up once they reach par + MAX_OVER_PAR strokes.
 */
import { Vector3 } from 'three';
import type { GameSetup, HoleDef, PlayerSetup, ScorecardData, Surface } from '../core/contracts';
import { MAX_OVER_PAR } from '../core/contracts';

export interface PlayerState {
  setup: PlayerSetup;
  /** Final strokes per hole (null = not played yet). */
  strokes: (number | null)[];
  /** Strokes taken on the current hole, penalties included. */
  taken: number;
  /** Ball position on the current hole; null = still on the tee. */
  ball: Vector3 | null;
  lie: Surface;
  /** Where the last stroke was played from (for stroke-and-distance after OB). */
  lastFrom: Vector3 | null;
  lastLie: Surface;
  done: boolean;
  pickedUp: boolean;
}

export type HoleOutcome = 'holed' | 'pickedUp';

export class Round {
  readonly players: PlayerState[];
  holeIndex = 0;
  /** Player order on the tee for the current hole. */
  private honour: number[];

  constructor(readonly setup: GameSetup, readonly holes: HoleDef[]) {
    this.players = setup.players.map((p) => ({
      setup: p,
      strokes: holes.map(() => null),
      taken: 0,
      ball: null,
      lie: 'tee',
      lastFrom: null,
      lastLie: 'tee',
      done: false,
      pickedUp: false,
    }));
    this.honour = this.players.map((_, i) => i);
  }

  get hole(): HoleDef {
    return this.holes[this.holeIndex];
  }

  get finished(): boolean {
    return this.holeIndex >= this.holes.length;
  }

  /** Reset per-hole state; call when starting each hole. */
  beginHole(): void {
    for (const p of this.players) {
      p.taken = 0;
      p.ball = null;
      p.lie = 'tee';
      p.lastFrom = null;
      p.lastLie = 'tee';
      p.done = false;
      p.pickedUp = false;
    }
  }

  /** Index of the player who plays next, or null when everybody is done with the hole. */
  next(pin: Vector3): number | null {
    const open = this.players.map((p, i) => ({ p, i })).filter(({ p }) => !p.done);
    if (!open.length) return null;
    const onTee = open.filter(({ p }) => p.ball === null);
    if (onTee.length) {
      for (const i of this.honour) if (onTee.some((o) => o.i === i)) return i;
    }
    let best = open[0];
    let bestD = -1;
    for (const o of open) {
      const b = o.p.ball!;
      const d = Math.hypot(b.x - pin.x, b.z - pin.z);
      if (d > bestD) {
        bestD = d;
        best = o;
      }
    }
    return best.i;
  }

  /** Count a stroke played from `from`. */
  stroke(i: number, from: Vector3, lie: Surface): void {
    const p = this.players[i];
    p.taken++;
    p.lastFrom = from.clone();
    p.lastLie = lie;
  }

  penalty(i: number, n = 1): void {
    this.players[i].taken += n;
  }

  /** Ball came to rest at `pos`. */
  placeBall(i: number, pos: Vector3, lie: Surface): void {
    const p = this.players[i];
    p.ball = pos.clone();
    p.lie = lie;
  }

  /** True once the player has used up the stroke allowance without holing out. */
  mustPickUp(i: number): boolean {
    const p = this.players[i];
    return !p.done && p.taken >= this.hole.par + MAX_OVER_PAR;
  }

  finishPlayer(i: number, outcome: HoleOutcome): number {
    const p = this.players[i];
    p.done = true;
    p.pickedUp = outcome === 'pickedUp';
    const strokes = outcome === 'pickedUp' ? this.hole.par + MAX_OVER_PAR : p.taken;
    p.strokes[this.holeIndex] = strokes;
    return strokes;
  }

  /** Move to the next hole, recomputing the honour. Returns false when the round is over. */
  advance(): boolean {
    const h = this.holeIndex;
    this.honour = [...this.honour].sort((a, b) => (this.players[a].strokes[h] ?? 99) - (this.players[b].strokes[h] ?? 99));
    this.holeIndex++;
    return !this.finished;
  }

  total(i: number): number {
    return this.players[i].strokes.reduce<number>((s, v) => s + (v ?? 0), 0);
  }

  /** Score relative to par over holes completed (including the in-progress hole's strokes so far
   *  only once holed). */
  toPar(i: number): number {
    const p = this.players[i];
    let d = 0;
    p.strokes.forEach((s, h) => {
      if (s !== null) d += s - this.holes[h].par;
    });
    return d;
  }

  /** Player indices ranked by score (best first). */
  ranking(): number[] {
    return this.players.map((_, i) => i).sort((a, b) => this.toPar(a) - this.toPar(b) || a - b);
  }

  scorecard(courseName: string, yards: number[], final: boolean): ScorecardData {
    return {
      courseName,
      holes: this.holes.map((h, i) => ({ number: h.number, par: h.par, yards: Math.round(yards[i] ?? 0) })),
      players: this.players.map((p) => ({ name: p.setup.name, color: p.setup.look.color, strokes: [...p.strokes] })),
      current: Math.min(this.holeIndex, this.holes.length - 1),
      final,
    };
  }
}

/** "E", "+3", "−2" */
export function formatToPar(d: number): string {
  return d === 0 ? 'E' : d > 0 ? `+${d}` : `−${-d}`;
}
