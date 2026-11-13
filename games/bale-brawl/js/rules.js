// Bale Brawl rules: pure match bookkeeping, no DOM, no three. See ../PLAN.md section 3.5.
// A match is a best-of series of rounds. A round ends by ring-out; if nobody falls in 45 s it goes to
// sudden death (no clock, the arena shrinks) until someone does. A double ring-out is a draw: the same
// round is replayed and nobody scores.

export class Match {
  #bestOf;
  #roundSeconds;
  #state = 'ready';
  #round = 1;
  #wins = [0, 0];
  #timeLeft;
  #winner = null;
  #lastDraw = false;

  constructor({ bestOf = 3, roundSeconds = 45 } = {}) {
    this.#bestOf = bestOf === 5 ? 5 : bestOf > 5 ? 5 : bestOf < 3 ? 1 : bestOf % 2 ? bestOf : bestOf + 1;
    this.#roundSeconds = roundSeconds > 0 ? roundSeconds : 45;
    this.#timeLeft = this.#roundSeconds;
  }

  /** 'ready' | 'fight' | 'sudden' | 'roundOver' | 'matchOver' */
  get state() { return this.#state; }
  /** 1-based round number. A drawn round is replayed under the same number. */
  get round() { return this.#round; }
  get wins() { return [this.#wins[0], this.#wins[1]]; }
  /** Round wins needed to take the match. */
  get need() { return Math.floor(this.#bestOf / 2) + 1; }
  get bestOf() { return this.#bestOf; }
  /** Seconds left on the round clock; 0 in sudden death. */
  get timeLeft() { return this.#state === 'sudden' ? 0 : this.#timeLeft; }
  get winner() { return this.#winner; }
  /** True while a round is being fought (clock running or sudden death). */
  get fighting() { return this.#state === 'fight' || this.#state === 'sudden'; }

  /** Begin the next round (or replay a drawn one). Does nothing once the match is over. */
  startRound() {
    if (this.#state === 'matchOver') return this.#state;
    if (this.#state === 'roundOver' && !this.#lastDraw) this.#round++;
    this.#lastDraw = false;
    this.#timeLeft = this.#roundSeconds;
    this.#state = 'fight';
    return this.#state;
  }

  /** Advance the clock. Returns 'sudden' exactly once, when the clock hits 0. */
  tick(dt) {
    if (this.#state !== 'fight' || !(dt > 0)) return null;
    this.#timeLeft -= dt;
    if (this.#timeLeft <= 0) {
      this.#timeLeft = 0;
      this.#state = 'sudden';
      return 'sudden';
    }
    return null;
  }

  /**
   * A fighter fell in the pond. loser 0 or 1, or -1 when both went in (a draw: replay, no point).
   * Ignored (ignored: true) when no round is being fought, so a stray late event cannot score twice.
   */
  ringOut(loser) {
    if (!this.fighting) return { draw: false, roundWinner: null, matchWinner: this.#winner, ignored: true };
    if (loser !== 0 && loser !== 1) {
      this.#lastDraw = true;
      this.#state = 'roundOver';
      return { draw: true, roundWinner: null, matchWinner: null };
    }
    const roundWinner = loser === 0 ? 1 : 0;
    this.#wins[roundWinner]++;
    this.#lastDraw = false;
    if (this.#wins[roundWinner] >= this.need) {
      this.#winner = roundWinner;
      this.#state = 'matchOver';
    } else {
      this.#state = 'roundOver';
    }
    return { draw: false, roundWinner, matchWinner: this.#winner };
  }
}
