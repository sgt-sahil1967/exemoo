// Bale Brawl rules (games/bale-brawl/js/rules.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Match } from '../../games/bale-brawl/js/rules.js';

test('defaults: best of 3 needs 2 wins, 45 s clock', () => {
  const m = new Match({});
  assert.equal(m.state, 'ready');
  assert.equal(m.need, 2);
  assert.equal(m.round, 1);
  assert.deepEqual(m.wins, [0, 0]);
  assert.equal(m.timeLeft, 45);
  assert.equal(m.winner, null);
});

test('best of 5 needs 3 wins; odd rounding for silly input', () => {
  assert.equal(new Match({ bestOf: 5 }).need, 3);
  assert.equal(new Match({ bestOf: 3 }).need, 2);
  assert.equal(new Match({ bestOf: 4 }).need, 3);
});

test('startRound enters fight and the clock counts down', () => {
  const m = new Match({ roundSeconds: 10 });
  assert.equal(m.startRound(), 'fight');
  assert.equal(m.state, 'fight');
  assert.equal(m.tick(2.5), null);
  assert.equal(m.timeLeft, 7.5);
  assert.equal(m.tick(0), null);
  assert.equal(m.timeLeft, 7.5);
});

test('clock hits zero: sudden is returned once, timeLeft stays 0', () => {
  const m = new Match({ roundSeconds: 3 });
  m.startRound();
  assert.equal(m.tick(2), null);
  assert.equal(m.tick(1.5), 'sudden');
  assert.equal(m.state, 'sudden');
  assert.equal(m.timeLeft, 0);
  assert.equal(m.tick(5), null);
  assert.equal(m.state, 'sudden');
});

test('tick does nothing outside a fight', () => {
  const m = new Match({ roundSeconds: 3 });
  assert.equal(m.tick(10), null);
  assert.equal(m.state, 'ready');
  m.startRound();
  m.ringOut(0);
  assert.equal(m.tick(10), null);
  assert.equal(m.state, 'roundOver');
});

test('ring-out scores for the rival and moves to the next round', () => {
  const m = new Match({ bestOf: 3 });
  m.startRound();
  const r = m.ringOut(1);
  assert.deepEqual(r, { draw: false, roundWinner: 0, matchWinner: null });
  assert.equal(m.state, 'roundOver');
  assert.deepEqual(m.wins, [1, 0]);
  assert.equal(m.round, 1);
  m.startRound();
  assert.equal(m.round, 2);
  assert.equal(m.timeLeft, 45);
  assert.equal(m.state, 'fight');
});

test('best of 3: second win ends the match, winner is set', () => {
  const m = new Match({ bestOf: 3 });
  m.startRound();
  m.ringOut(0);
  m.startRound();
  const r = m.ringOut(0);
  assert.deepEqual(r, { draw: false, roundWinner: 1, matchWinner: 1 });
  assert.equal(m.state, 'matchOver');
  assert.equal(m.winner, 1);
  assert.deepEqual(m.wins, [0, 2]);
  assert.equal(m.startRound(), 'matchOver');
  assert.equal(m.state, 'matchOver');
});

test('best of 5 goes to a decider', () => {
  const m = new Match({ bestOf: 5 });
  for (const loser of [0, 1, 0, 1]) {
    m.startRound();
    const r = m.ringOut(loser);
    assert.equal(r.matchWinner, null);
  }
  assert.deepEqual(m.wins, [2, 2]);
  m.startRound();
  assert.equal(m.round, 5);
  const r = m.ringOut(1);
  assert.equal(r.matchWinner, 0);
  assert.equal(m.winner, 0);
});

test('double ring-out is a draw: no point, same round replayed', () => {
  const m = new Match({ bestOf: 3 });
  m.startRound();
  m.ringOut(0);
  m.startRound();
  assert.equal(m.round, 2);
  const r = m.ringOut(-1);
  assert.deepEqual(r, { draw: true, roundWinner: null, matchWinner: null });
  assert.deepEqual(m.wins, [0, 1]);
  assert.equal(m.state, 'roundOver');
  m.startRound();
  assert.equal(m.round, 2);
  assert.equal(m.state, 'fight');
  assert.equal(m.timeLeft, 45);
});

test('ring-out works in sudden death too', () => {
  const m = new Match({ roundSeconds: 1 });
  m.startRound();
  assert.equal(m.tick(2), 'sudden');
  const r = m.ringOut(0);
  assert.equal(r.roundWinner, 1);
  assert.equal(m.wins[1], 1);
});

test('a late or repeated ring-out cannot score twice', () => {
  const m = new Match({ bestOf: 5 });
  m.startRound();
  m.ringOut(1);
  const again = m.ringOut(1);
  assert.equal(again.ignored, true);
  assert.deepEqual(m.wins, [1, 0]);
  const early = new Match({}).ringOut(0);
  assert.equal(early.ignored, true);
});

test('wins getter returns a copy', () => {
  const m = new Match({});
  m.wins[0] = 9;
  assert.deepEqual(m.wins, [0, 0]);
});
