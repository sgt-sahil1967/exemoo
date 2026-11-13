// Moo Bowl rules (games/bowling/js/rules.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BowlingGame, isSplit } from '../../games/bowling/js/rules.js';

/** Throw a ball that knocks `n` pins (the lowest ids of those standing). */
function bowl(game, n) {
  const cur = game.current;
  assert.ok(cur, 'game should not be over');
  assert.ok(n <= cur.standingBefore.length, `cannot knock ${n} of ${cur.standingBefore.length}`);
  return game.roll(cur.standingBefore.slice(n));
}
function playAll(game, counts) {
  const out = [];
  for (const n of counts) out.push(bowl(game, n));
  return out;
}
const cums = (g, p = 0) => g.sheet(p).frames.map((f) => f.cumulative);

test('perfect game is 300', () => {
  const g = new BowlingGame(1);
  const res = playAll(g, Array(12).fill(10));
  assert.equal(g.over, true);
  assert.equal(g.current, null);
  assert.equal(g.totals()[0], 300);
  assert.equal(g.sheet(0).max, 300);
  assert.deepEqual(cums(g), [30, 60, 90, 120, 150, 180, 210, 240, 270, 300]);
  assert.deepEqual(g.sheet(0).frames[9].symbols, ['X', 'X', 'X']);
  assert.equal(res.at(-1).gameDone, true);
  assert.equal(res.filter((r) => r.gameDone).length, 1);
  assert.equal(g.roll([]), null);
});

test('all spares of 9/ plus a final 9 is 190', () => {
  const g = new BowlingGame(1);
  const counts = [];
  for (let i = 0; i < 10; i++) counts.push(9, 1);
  counts.push(9);
  playAll(g, counts);
  assert.equal(g.over, true);
  assert.equal(g.totals()[0], 190);
  assert.deepEqual(g.sheet(0).frames[0].symbols, ['9', '/']);
  assert.deepEqual(g.sheet(0).frames[9].symbols, ['9', '/', '9']);
});

test('all gutters is 0 and all "9 -" is 90', () => {
  const g = new BowlingGame(1);
  playAll(g, Array(20).fill(0));
  assert.equal(g.over, true);
  assert.equal(g.totals()[0], 0);
  assert.deepEqual(g.sheet(0).frames[3].symbols, ['-', '-']);
  const h = new BowlingGame(1);
  const counts = [];
  for (let i = 0; i < 10; i++) counts.push(9, 0);
  playAll(h, counts);
  assert.equal(h.over, true);
  assert.equal(h.totals()[0], 90);
  assert.equal(h.sheet(0).max, 90);
  assert.deepEqual(h.sheet(0).frames[9].symbols, ['9', '-']);
  assert.equal(cums(h)[9], 90);
});

test('realistic game A, frame by frame', () => {
  const g = new BowlingGame(1);
  const rolls = [10, 7, 3, 9, 0, 10, 0, 8, 8, 2, 0, 6, 10, 10, 10, 9, 1];
  // After each ball, the cumulative array should hold exactly what is resolvable.
  const expectAfter = [];
  playAll(g, rolls.slice(0, 1));
  assert.deepEqual(cums(g).slice(0, 2), [null, null]);
  playAll(g, rolls.slice(1, 2)); // 10, 7: strike still needs one more
  assert.deepEqual(cums(g).slice(0, 2), [null, null]);
  playAll(g, rolls.slice(2, 3)); // 10, 7, 3
  assert.deepEqual(cums(g).slice(0, 3), [20, null, null]);
  playAll(g, rolls.slice(3, 4)); // 9: spare resolved
  assert.deepEqual(cums(g).slice(0, 3), [20, 39, null]);
  playAll(g, rolls.slice(4));
  void expectAfter;
  assert.deepEqual(cums(g), [20, 39, 48, 66, 74, 84, 90, 120, 149, 169]);
  assert.equal(g.totals()[0], 169);
  assert.equal(g.over, true);
  assert.deepEqual(g.sheet(0).frames[9].symbols, ['X', '9', '/']);
});

test('realistic game B, frame by frame', () => {
  const g = new BowlingGame(1);
  playAll(g, [8, 1, 7, 3, 10, 6, 3, 9, 1, 10, 10, 8, 0, 5, 5, 10, 10, 7]);
  assert.deepEqual(cums(g), [9, 29, 48, 57, 77, 105, 123, 131, 151, 178]);
  assert.equal(g.totals()[0], 178);
  assert.equal(g.over, true);
});

test('partial sheet mid game: nulls, total and max', () => {
  const g = new BowlingGame(1);
  assert.equal(g.sheet(0).max, 300);
  assert.equal(g.sheet(0).total, 0);
  playAll(g, [9, 0]);
  assert.equal(g.sheet(0).max, 279);
  assert.equal(g.sheet(0).total, 9);
  playAll(g, [10]);
  // strike unresolved: cumulative null, total counts raw pins
  assert.deepEqual(cums(g).slice(0, 3), [9, null, null]);
  assert.equal(g.sheet(0).total, 19);
  playAll(g, [10]);
  assert.equal(g.sheet(0).total, 29);
  assert.deepEqual(cums(g).slice(0, 3), [9, null, null]);
  playAll(g, [4]);
  // frame 2 strike: 10 + 10 + 4 = 24 -> 33; frame 3 strike pending 10+4.. not yet
  assert.deepEqual(cums(g).slice(0, 4), [9, 33, null, null]);
  assert.equal(g.sheet(0).total, 33 + 10 + 4);
  // best case: spare the 4, then strikes: 9 + 24 + 20 + 20 + 5 * 30 + 30 = 253
  assert.equal(g.sheet(0).max, 253);
  playAll(g, [6]);
  assert.deepEqual(cums(g).slice(0, 4), [9, 33, 53, null]);
  assert.equal(g.sheet(0).max, 253);
});

test('max after a few known states', () => {
  const g = new BowlingGame(1);
  playAll(g, [10, 10]);
  assert.equal(g.sheet(0).max, 300);
  playAll(g, [9]);
  // F1 = 29, F2 = 10 + 9 + 1 = 20, F3 spare + strike = 20, F4..F9 = 6 * 30, F10 = 30
  assert.equal(g.sheet(0).max, 29 + 20 + 20 + 6 * 30 + 30);
});

test('max is exact when the game finished', () => {
  const g = new BowlingGame(1);
  playAll(g, [8, 1, 7, 3, 10, 6, 3, 9, 1, 10, 10, 8, 0, 5, 5, 10, 10, 7]);
  assert.equal(g.sheet(0).max, 178);
});

test('streak counting: turkey is 3', () => {
  const g = new BowlingGame(1);
  const a = bowl(g, 10);
  const b = bowl(g, 10);
  const c = bowl(g, 10);
  assert.deepEqual([a.streak, b.streak, c.streak], [1, 2, 3]);
  const d = bowl(g, 4);
  assert.equal(d.streak, 0);
  bowl(g, 6);
  const e = bowl(g, 10);
  assert.equal(e.streak, 1);
});

test('streak is per player', () => {
  const g = new BowlingGame(2);
  assert.equal(bowl(g, 10).streak, 1); // p0
  assert.equal(bowl(g, 3).streak, 0); // p1
  assert.equal(bowl(g, 7).streak, 0); // p1 second ball
});

test('split table', () => {
  const splits = [
    [7, 10],
    [4, 6],
    [5, 7],
    [3, 10],
    [2, 7],
    [4, 6, 7, 10],
    [4, 10],
    [2, 10],
    [7, 9, 10],
    [5, 10],
    [6, 7],
  ];
  const notSplits = [
    [2, 4, 5],
    [3, 6],
    [4, 7],
    [8],
    [10],
    [7],
    [1, 2],
    [1, 7, 10],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    [],
    [2, 3],
    [4, 5, 6],
    [7, 8, 9, 10],
    [6, 10],
  ];
  for (const s of splits) assert.equal(isSplit(s), true, `split ${s}`);
  for (const s of notSplits) assert.equal(isSplit(s), false, `not split ${s}`);
});

test('roll flags a split on the first ball', () => {
  const g = new BowlingGame(1);
  const r = g.roll([7, 10]);
  assert.equal(r.isSplit, true);
  assert.equal(r.mark, 'split');
  assert.equal(r.count, 8);
  assert.equal(r.symbol, '8');
  assert.equal(r.resetPins, false);
  assert.equal(r.turnDone, false);
  assert.deepEqual(g.current.standingBefore, [7, 10]);
  // second ball: never a split, spare marks '/'
  const r2 = g.roll([10]);
  assert.equal(r2.isSplit, false);
  assert.equal(r2.mark, 'open');
  assert.equal(r2.turnDone, true);
  assert.equal(r2.resetPins, true);
  assert.deepEqual(g.sheet(0).frames[0].split, [true, false]);
  assert.deepEqual(g.sheet(0).frames[0].symbols, ['8', '1']);
});

test('result fields for strike, spare, open and gutter', () => {
  const g = new BowlingGame(1);
  const s = g.roll([]);
  assert.deepEqual(
    { mark: s.mark, symbol: s.symbol, count: s.count, resetPins: s.resetPins, turnDone: s.turnDone, isSplit: s.isSplit },
    { mark: 'strike', symbol: 'X', count: 10, resetPins: true, turnDone: true, isSplit: false },
  );
  assert.equal(s.knocked.length, 10);
  const z = g.roll([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(z.mark, 'open');
  assert.equal(z.count, 0);
  assert.equal(z.symbol, '-');
  assert.equal(z.knocked.length, 0);
  assert.equal(z.resetPins, false);
  const sp = g.roll([]);
  assert.equal(sp.mark, 'spare');
  assert.equal(sp.symbol, '/');
  assert.equal(sp.count, 10);
  assert.equal(sp.turnDone, true);
});

test('invalid input: ids not standing before are ignored', () => {
  const g = new BowlingGame(1);
  g.roll([1, 2, 3]); // 7 knocked, 4..10
  assert.deepEqual(g.current.standingBefore, [1, 2, 3]);
  const r = g.roll([1, 2, 3, 4, 5, 99, 0, -1, 2.5]); // ids 4,5 were not standing: ignored
  assert.equal(r.count, 0);
  assert.deepEqual(r.knocked, []);
  assert.equal(g.sheet(0).frames[0].rolls[1], 0);
  assert.throws(() => g.roll('x'), TypeError);
  // duplicate ids do not matter
  const h = new BowlingGame(1);
  const r2 = h.roll([5, 5, 5]);
  assert.equal(r2.count, 9);
});

test('first nine frames: standingBefore and resetPins', () => {
  const g = new BowlingGame(1);
  assert.deepEqual(g.current, { player: 0, frame: 0, ball: 0, standingBefore: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] });
  bowl(g, 6);
  assert.deepEqual(g.current, { player: 0, frame: 0, ball: 1, standingBefore: [7, 8, 9, 10] });
  bowl(g, 1);
  assert.deepEqual(g.current, { player: 0, frame: 1, ball: 0, standingBefore: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] });
});

test('10th frame: X X X', () => {
  const g = new BowlingGame(1);
  playAll(g, Array(9).fill(10).concat([]));
  assert.equal(g.current.frame, 9);
  const r1 = bowl(g, 10);
  assert.deepEqual([r1.symbol, r1.resetPins, r1.turnDone], ['X', true, false]);
  assert.equal(g.current.standingBefore.length, 10);
  assert.equal(g.current.ball, 1);
  const r2 = bowl(g, 10);
  assert.deepEqual([r2.symbol, r2.resetPins, r2.turnDone], ['X', true, false]);
  assert.equal(g.current.standingBefore.length, 10);
  const r3 = bowl(g, 10);
  assert.deepEqual([r3.symbol, r3.turnDone, r3.gameDone], ['X', true, true]);
  assert.equal(g.totals()[0], 300);
});

test('10th frame: X 7 / (fill ball on remaining pins is a spare)', () => {
  const g = new BowlingGame(1);
  const g2 = new BowlingGame(1);
  playAll(g2, Array(18).fill(0));
  assert.equal(g2.current.frame, 9);
  const a = bowl(g2, 10);
  assert.equal(a.symbol, 'X');
  assert.equal(a.resetPins, true);
  const b = bowl(g2, 7);
  assert.deepEqual([b.symbol, b.resetPins, b.turnDone, b.gameDone], ['7', false, false, false]);
  assert.equal(g2.current.ball, 2);
  assert.equal(g2.current.standingBefore.length, 3);
  const c = bowl(g2, 3);
  assert.deepEqual([c.symbol, c.mark, c.turnDone, c.gameDone], ['/', 'spare', true, true]);
  assert.equal(g2.sheet(0).frames[9].cumulative, 20);
  assert.equal(g2.over, true);
});

test('10th frame: X 7 2 (open fill, game over)', () => {
  const g = new BowlingGame(1);
  playAll(g, Array(18).fill(0));
  bowl(g, 10);
  bowl(g, 7);
  const c = bowl(g, 2);
  assert.deepEqual([c.symbol, c.turnDone, c.gameDone], ['2', true, true]);
  assert.deepEqual(g.sheet(0).frames[9].symbols, ['X', '7', '2']);
  assert.equal(g.totals()[0], 19);
});

test('10th frame: 9 / X (spare gives fresh rack)', () => {
  const g = new BowlingGame(1);
  playAll(g, Array(18).fill(0));
  const a = bowl(g, 9);
  assert.deepEqual([a.symbol, a.resetPins], ['9', false]);
  assert.equal(g.current.standingBefore.length, 1);
  const b = bowl(g, 1);
  assert.deepEqual([b.symbol, b.resetPins, b.turnDone], ['/', true, false]);
  assert.equal(g.current.standingBefore.length, 10);
  const c = bowl(g, 10);
  assert.deepEqual([c.symbol, c.turnDone, c.gameDone], ['X', true, true]);
  assert.equal(g.totals()[0], 20);
});

test('10th frame: 9 / 5 (fill ball count)', () => {
  const g = new BowlingGame(1);
  playAll(g, Array(18).fill(0));
  playAll(g, [9, 1, 5]);
  assert.deepEqual(g.sheet(0).frames[9].symbols, ['9', '/', '5']);
  assert.equal(g.totals()[0], 15);
});

test('10th frame: open 8 - ends the game after two balls', () => {
  const g = new BowlingGame(1);
  playAll(g, Array(18).fill(0));
  const a = bowl(g, 8);
  assert.equal(a.turnDone, false);
  const b = bowl(g, 0);
  assert.deepEqual([b.symbol, b.turnDone, b.gameDone, b.resetPins], ['-', true, true, true]);
  assert.deepEqual(g.sheet(0).frames[9].symbols, ['8', '-']);
  assert.equal(g.sheet(0).frames[9].rolls.length, 2);
  assert.equal(g.over, true);
  assert.equal(g.totals()[0], 8);
});

test('10th frame: X X 7 (third ball on a fresh rack, not a spare)', () => {
  const g = new BowlingGame(1);
  playAll(g, Array(18).fill(0));
  bowl(g, 10);
  bowl(g, 10);
  const c = bowl(g, 7);
  assert.equal(c.symbol, '7');
  assert.equal(g.totals()[0], 27);
});

test('10th frame: X - then ten pins for the fill ball (clearing them is a spare)', () => {
  const g = new BowlingGame(1);
  playAll(g, Array(18).fill(0));
  bowl(g, 10);
  const b = bowl(g, 0); // gutter on the fresh rack: 10 still standing for the third ball
  assert.deepEqual(g.current.standingBefore.length, 10);
  assert.equal(b.symbol, '-');
  const c = bowl(g, 10); // knocks all ten on the fill ball: a spare, not a strike
  assert.equal(c.symbol, '/');
  assert.equal(g.totals()[0], 20);
});

test('10th frame: 0 then 10 is a spare', () => {
  const g = new BowlingGame(1);
  playAll(g, Array(18).fill(0));
  bowl(g, 0);
  const b = bowl(g, 10);
  assert.equal(b.symbol, '/');
  assert.equal(b.resetPins, true);
  assert.equal(b.turnDone, false);
  bowl(g, 4);
  assert.equal(g.totals()[0], 14);
});

test('split in the 10th frame after a strike on the fresh rack', () => {
  const g = new BowlingGame(1);
  playAll(g, Array(18).fill(0));
  bowl(g, 10);
  const r = g.roll([7, 10]);
  assert.equal(r.isSplit, true);
  assert.equal(r.mark, 'split');
  assert.deepEqual(g.sheet(0).frames[9].split, [false, true]);
  const c = g.roll([10]);
  assert.equal(c.isSplit, false);
});

test('bonus frame max: X in the 10th with a 3 pin leave', () => {
  const g = new BowlingGame(1);
  playAll(g, Array(18).fill(10).slice(0, 9)); // 9 strikes
  assert.equal(g.sheet(0).max, 300);
  bowl(g, 10);
  bowl(g, 7);
  // F1..F8 = 8 * 30, F9 = 10 + 10 + 7 = 27, F10 = 10 + 7 + 3 = 20
  assert.equal(g.sheet(0).max, 8 * 30 + 27 + 20);
});

test('two players: turn order and per-player sheets', () => {
  const g = new BowlingGame(2);
  const order = [];
  // p0 strike, p1 5/, p0 3 4, p1 ...
  const seq = [10, 5, 5, 3, 4, 8, 1];
  for (const n of seq) {
    const c = g.current;
    order.push(`${c.player}:${c.frame}:${c.ball}`);
    bowl(g, n);
  }
  assert.deepEqual(order, ['0:0:0', '1:0:0', '1:0:1', '0:1:0', '0:1:1', '1:1:0', '1:1:1']);
  assert.deepEqual(g.current, { player: 0, frame: 2, ball: 0, standingBefore: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] });
  // p0: X, 3, 4 -> 17, 24 ; p1: 5/ then 8: 18, then 8+1 -> 27
  assert.deepEqual(cums(g, 0).slice(0, 2), [17, 24]);
  assert.deepEqual(cums(g, 1).slice(0, 2), [18, 27]);
  assert.deepEqual(g.totals(), [24, 27]);
});

test('turnDone and gameDone flags over a full 4 player game', () => {
  const g = new BowlingGame(4);
  let balls = 0;
  let turns = 0;
  let last;
  while (!g.over) {
    last = bowl(g, 10);
    balls++;
    if (last.turnDone) turns++;
  }
  assert.equal(turns, 40);
  assert.equal(balls, 4 * 12);
  assert.equal(last.gameDone, true);
  assert.equal(last.player, 3);
  assert.deepEqual(g.totals(), [300, 300, 300, 300]);
  assert.deepEqual(g.winners(), [0, 1, 2, 3]);
});

test('4 players: the 10th frame is played completely before the next player', () => {
  const g = new BowlingGame(4);
  // Frames 1-9: everybody throws two gutters.
  for (let i = 0; i < 9 * 4 * 2; i++) bowl(g, 0);
  assert.deepEqual([g.current.player, g.current.frame, g.current.ball], [0, 9, 0]);
  bowl(g, 10); // p0 X
  assert.deepEqual([g.current.player, g.current.frame, g.current.ball], [0, 9, 1]);
  bowl(g, 10);
  bowl(g, 10);
  assert.deepEqual([g.current.player, g.current.frame, g.current.ball], [1, 9, 0]);
  bowl(g, 4);
  bowl(g, 0); // open, 2 balls
  assert.deepEqual([g.current.player, g.current.frame, g.current.ball], [2, 9, 0]);
  bowl(g, 5);
  bowl(g, 5);
  assert.deepEqual([g.current.player, g.current.frame, g.current.ball], [2, 9, 2]);
  bowl(g, 7);
  assert.deepEqual([g.current.player, g.current.frame, g.current.ball], [3, 9, 0]);
  bowl(g, 0);
  const last = bowl(g, 0);
  assert.equal(last.gameDone, true);
  assert.equal(g.over, true);
  assert.deepEqual(g.totals(), [30, 4, 17, 0]);
  assert.deepEqual(g.winners(), [0]);
});

test('winners: single winner, ties, single player', () => {
  const g = new BowlingGame(3);
  for (let i = 0; i < 3 * 10 * 2; i++) {
    const c = g.current;
    // p0 and p1 score 5 per ball... keep simple: p0 gets 1 per ball, p1 1, p2 0
    bowl(g, c.player === 2 ? 0 : 1);
  }
  assert.equal(g.over, true);
  assert.deepEqual(g.totals(), [20, 20, 0]);
  assert.deepEqual(g.winners(), [0, 1]);

  const h = new BowlingGame(2);
  for (let i = 0; i < 2 * 10 * 2; i++) bowl(h, h.current.player === 1 ? 2 : 1);
  assert.deepEqual(h.totals(), [20, 40]);
  assert.deepEqual(h.winners(), [1]);

  const s = new BowlingGame(1);
  playAll(s, Array(20).fill(0));
  assert.deepEqual(s.winners(), [0]);
});

test('constructor clamps player counts', () => {
  assert.equal(new BowlingGame(9).totals().length, 4);
  assert.equal(new BowlingGame(0).totals().length, 1);
});
