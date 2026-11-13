// Moo Bowl rules: ten-pin scoring and turn order. Pure logic, no DOM, no dependencies.

const ALL_PINS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Pin adjacency on the triangle (pins that touch each other).
export const PIN_ADJACENCY = {
  1: [2, 3],
  2: [1, 3, 4, 5],
  3: [1, 2, 5, 6],
  4: [2, 5, 7, 8],
  5: [2, 3, 4, 6, 8, 9],
  6: [3, 5, 9, 10],
  7: [4, 8],
  8: [4, 5, 7, 9],
  9: [5, 6, 8, 10],
  10: [6, 9],
};

/**
 * Split test for the pins left standing after a ball thrown at a full fresh rack:
 * the head pin is down, two or more pins stand, and the standing pins form more than one
 * connected group in the adjacency graph.
 */
export function isSplit(standing) {
  const set = new Set(standing);
  if (set.has(1) || set.size < 2) return false;
  const seen = new Set();
  let groups = 0;
  for (const start of set) {
    if (seen.has(start)) continue;
    groups++;
    const stack = [start];
    seen.add(start);
    while (stack.length) {
      const p = stack.pop();
      for (const n of PIN_ADJACENCY[p]) {
        if (set.has(n) && !seen.has(n)) {
          seen.add(n);
          stack.push(n);
        }
      }
    }
  }
  return groups > 1;
}

function sum(a) {
  let s = 0;
  for (const v of a) s += v;
  return s;
}

function tenthComplete(r) {
  return r.length >= 3 || (r.length === 2 && r[0] < 10 && r[0] + r[1] < 10);
}

/**
 * Score a sheet given the pin counts of every ball per frame (array of 10 arrays).
 * Returns the cumulative array (null where a frame cannot be fully scored yet; once one
 * frame is null every later one is null too).
 */
function cumulativeOf(frameRolls) {
  const flat = [];
  for (const r of frameRolls) for (const v of r) flat.push(v);
  const out = [];
  let idx = 0;
  let running = 0;
  let ok = true;
  for (let f = 0; f < 10; f++) {
    const r = frameRolls[f];
    let value = null;
    if (f < 9) {
      if (r.length >= 1 && r[0] === 10) {
        if (flat.length > idx + 2) value = 10 + flat[idx + 1] + flat[idx + 2];
        idx += 1;
      } else if (r.length >= 2) {
        const s = r[0] + r[1];
        if (s < 10) value = s;
        else if (flat.length > idx + 2) value = 10 + flat[idx + 2];
        idx += 2;
      } else {
        idx += r.length;
      }
    } else if (tenthComplete(r)) {
      value = sum(r);
    }
    if (value === null) ok = false;
    if (ok) {
      running += value;
      out.push(running);
    } else {
      out.push(null);
    }
  }
  return out;
}

/** Complete the sheet with the best possible balls (all strikes / spares) and score it. */
function bestPossible(frameRolls) {
  const hyp = frameRolls.map((r) => r.slice());
  for (let f = 0; f < 9; f++) {
    const r = hyp[f];
    if (r.length === 0) r.push(10);
    else if (r.length === 1 && r[0] < 10) r.push(10 - r[0]);
  }
  const r = hyp[9];
  while (!tenthComplete(r)) {
    const n = r.length;
    if (n === 0) r.push(10);
    else if (n === 1) r.push(r[0] === 10 ? 10 : 10 - r[0]);
    else r.push(r[0] === 10 ? (r[1] === 10 ? 10 : 10 - r[1]) : 10);
  }
  const cum = cumulativeOf(hyp);
  return cum[9];
}

export class BowlingGame {
  constructor(numPlayers = 1) {
    const n = Math.max(1, Math.min(4, Math.floor(Number(numPlayers)) || 1));
    this.numPlayers = n;
    this._players = [];
    for (let p = 0; p < n; p++) {
      this._players.push({
        frames: Array.from({ length: 10 }, () => ({ rolls: [], symbols: [], split: [] })),
        streak: 0,
      });
    }
    this._over = false;
    this._cur = { player: 0, frame: 0, ball: 0, standing: ALL_PINS.slice(), fresh: true };
  }

  get current() {
    if (this._over) return null;
    const c = this._cur;
    return { player: c.player, frame: c.frame, ball: c.ball, standingBefore: c.standing.slice() };
  }

  get over() {
    return this._over;
  }

  /**
   * Record one ball. `standingAfter` = ids of pins still standing. Ids that were not standing
   * before the ball are ignored. Returns null if the game is already over.
   */
  roll(standingAfter) {
    if (this._over) return null;
    if (!Array.isArray(standingAfter)) throw new TypeError('roll() needs an array of standing pin ids');
    const c = this._cur;
    const before = c.standing;
    const afterSet = new Set(standingAfter);
    const knocked = before.filter((id) => !afterSet.has(id));
    const remaining = before.filter((id) => afterSet.has(id));
    const count = knocked.length;
    const fresh = c.fresh;
    const pl = this._players[c.player];
    const fr = pl.frames[c.frame];
    const f = c.frame;
    const ball = c.ball;

    let symbol;
    if (count === 10 && fresh) symbol = 'X';
    else if (count > 0 && count === before.length) symbol = '/';
    else if (count === 0) symbol = '-';
    else symbol = String(count);

    const split = fresh && symbol !== 'X' && isSplit(remaining);
    const mark = symbol === 'X' ? 'strike' : symbol === '/' ? 'spare' : split ? 'split' : 'open';

    fr.rolls.push(count);
    fr.symbols.push(symbol);
    fr.split.push(split);
    pl.streak = symbol === 'X' ? pl.streak + 1 : 0;

    // Decide what happens next.
    let turnDone = false;
    let resetPins = false;
    if (f < 9) {
      if (symbol === 'X' || ball === 1) {
        turnDone = true;
        resetPins = true;
      }
    } else {
      const r = fr.rolls;
      if (tenthComplete(r)) {
        turnDone = true;
        resetPins = true;
      } else if (symbol === 'X' || symbol === '/') {
        // Strike or spare earns a fresh rack for the next ball.
        resetPins = true;
      }
    }

    const result = {
      player: c.player,
      frame: f,
      ball,
      knocked,
      count,
      mark,
      symbol,
      isSplit: split,
      streak: pl.streak,
      resetPins,
      turnDone,
      gameDone: false,
      standingAfter: remaining.slice(),
    };

    if (!turnDone) {
      c.ball = ball + 1;
      c.fresh = resetPins;
      c.standing = resetPins ? ALL_PINS.slice() : remaining;
    } else {
      // Advance to the next player's frame.
      let np = c.player + 1;
      let nf = f;
      if (np >= this.numPlayers) {
        np = 0;
        nf = f + 1;
      }
      if (nf > 9) {
        this._over = true;
        result.gameDone = true;
      } else {
        this._cur = { player: np, frame: nf, ball: 0, standing: ALL_PINS.slice(), fresh: true };
      }
    }
    return result;
  }

  /**
   * Score sheet for a player.
   * `cumulative` of a frame is null until that frame (and all before it) can be fully scored.
   * `total` is the "score so far": the cumulative score of the last fully scored frame plus the raw
   * pins of every later, still-unresolved ball (bonuses not yet earned are not counted).
   * `max` is the best possible final score from the current state (300 at the start).
   */
  sheet(player) {
    const pl = this._players[player];
    if (!pl) return null;
    const rolls = pl.frames.map((fr) => fr.rolls);
    const cum = cumulativeOf(rolls);
    let lastScored = -1;
    for (let i = 0; i < 10; i++) if (cum[i] !== null) lastScored = i;
    let total = lastScored >= 0 ? cum[lastScored] : 0;
    for (let i = lastScored + 1; i < 10; i++) total += sum(rolls[i]);
    return {
      frames: pl.frames.map((fr, i) => ({
        rolls: fr.rolls.slice(),
        symbols: fr.symbols.slice(),
        split: fr.split.slice(),
        cumulative: cum[i],
      })),
      total,
      max: bestPossible(rolls),
    };
  }

  totals() {
    return this._players.map((_, i) => this.sheet(i).total);
  }

  /** Player indices holding the top score (all of them on a tie). Meaningful once the game is over. */
  winners() {
    const t = this.totals();
    const top = Math.max(...t);
    const out = [];
    t.forEach((v, i) => {
      if (v === top) out.push(i);
    });
    return out;
  }
}
