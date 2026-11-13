// Bumper Carts rules: pure round bookkeeping, no DOM, no three. See ../PLAN.md sections 3 and 5.4.
// One round: a clock (default 90 s). At `stormAt` seconds left the state becomes 'storm' (once; the caller
// drops the fence). At 0 the seat with most KOs wins; a tie at the top goes to sudden death, where the
// next KO by one of the tied seats wins. Own goals (driving out alone) cost 1 point, never below 0.

export class Round {
  #seats;
  #seconds;
  #stormAt;
  #state = 'ready';
  #timeLeft;
  #scores = [0, 0, 0, 0];
  #falls = [0, 0, 0, 0];
  #tied = [];
  #winner = null;
  #stormed = false;

  constructor({ seats = [0, 1, 2, 3], seconds = 90, stormAt = 25 } = {}) {
    this.#seats = [...new Set(seats.filter((s) => Number.isInteger(s) && s >= 0 && s < 4))].sort((a, b) => a - b);
    this.#seconds = seconds > 0 ? seconds : 90;
    this.#stormAt = Math.max(0, stormAt);
    this.#timeLeft = this.#seconds;
  }

  /** 'ready' | 'play' | 'storm' | 'sudden' | 'over' */
  get state() { return this.#state; }
  /** Seconds left on the clock; 0 in sudden death and when over. */
  get timeLeft() { return this.#timeLeft; }
  get scores() { return [...this.#scores]; }
  /** Times each seat has fallen (any cause). Used as the tie-break. */
  get falls() { return [...this.#falls]; }
  get seats() { return [...this.#seats]; }
  get stormed() { return this.#stormed; }
  /** Seats still fighting for the win in sudden death (empty otherwise). */
  get tied() { return [...this.#tied]; }
  /** Seat that won a sudden death, else the top of the ranking once over. */
  get winner() { return this.#state === 'over' ? this.ranking[0] ?? null : null; }
  /** True while KOs count (play, storm or sudden). */
  get running() { return this.#state === 'play' || this.#state === 'storm' || this.#state === 'sudden'; }

  /** Seats in play, best first: most KOs, then fewest falls, then lowest seat number. */
  get ranking() {
    return [...this.#seats].sort((a, b) => this.#scores[b] - this.#scores[a] || this.#falls[a] - this.#falls[b] || a - b);
  }

  start() {
    this.#state = 'play';
    this.#timeLeft = this.#seconds;
    this.#scores = [0, 0, 0, 0];
    this.#falls = [0, 0, 0, 0];
    this.#tied = [];
    this.#winner = null;
    this.#stormed = false;
  }

  /** Advance the clock. Returns 'storm' (once), 'sudden' or 'over' on the tick that causes it, else null. */
  tick(dt) {
    if ((this.#state !== 'play' && this.#state !== 'storm') || !(dt > 0)) return null;
    this.#timeLeft = Math.max(0, this.#timeLeft - dt);
    if (!this.#stormed && this.#timeLeft <= this.#stormAt) {
      this.#stormed = true;
      this.#state = 'storm';
      return 'storm';
    }
    if (this.#timeLeft <= 0) {
      const top = Math.max(...this.#seats.map((s) => this.#scores[s]));
      const leaders = this.#seats.filter((s) => this.#scores[s] === top);
      if (leaders.length > 1) {
        this.#tied = leaders;
        this.#state = 'sudden';
        return 'sudden';
      }
      this.#state = 'over';
      return 'over';
    }
    return null;
  }

  /**
   * Seat `i` fell. `by` is the seat that gets the credit, or -1 (or i, or a seat not in play) for none.
   * Returns { scorer, delta, over, ignored? }. scorer is the seat that gained a point, or -1 for an own
   * goal (delta -1 for the faller, 0 if already at 0). over is true when a sudden death was decided.
   */
  fall(i, by = -1) {
    if (!this.running || !this.#seats.includes(i)) return { scorer: -1, delta: 0, over: false, ignored: true };
    this.#falls[i]++;
    let scorer = -1;
    let delta = 0;
    if (by !== i && this.#seats.includes(by)) {
      scorer = by;
      delta = 1;
      this.#scores[by]++;
    } else if (this.#scores[i] > 0) {
      delta = -1;
      this.#scores[i]--;
    }
    let over = false;
    if (this.#state === 'sudden' && scorer >= 0 && this.#tied.includes(scorer)) {
      this.#state = 'over';
      this.#winner = scorer;
      over = true;
    }
    return { scorer, delta, over };
  }
}
