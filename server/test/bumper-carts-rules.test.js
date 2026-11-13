// Bumper Carts rules (games/bumper-carts/js/rules.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Round } from '../../games/bumper-carts/js/rules.js';

const started = (o = {}) => {
  const r = new Round(o);
  r.start();
  return r;
};

test('defaults: ready, 90 s, zero scores', () => {
  const r = new Round({});
  assert.equal(r.state, 'ready');
  assert.equal(r.timeLeft, 90);
  assert.deepEqual(r.scores, [0, 0, 0, 0]);
  assert.equal(r.tick(1), null, 'no clock before start');
  assert.equal(r.timeLeft, 90);
  r.start();
  assert.equal(r.state, 'play');
});

test('clock counts down and ignores zero or negative dt', () => {
  const r = started({ seconds: 60 });
  assert.equal(r.tick(2.5), null);
  assert.equal(r.timeLeft, 57.5);
  assert.equal(r.tick(0), null);
  assert.equal(r.tick(-1), null);
  assert.equal(r.timeLeft, 57.5);
});

test('storm triggers exactly once at the threshold', () => {
  const r = started({ seconds: 30, stormAt: 25 });
  assert.equal(r.tick(4.9), null);
  assert.equal(r.state, 'play');
  assert.equal(r.tick(0.2), 'storm');
  assert.equal(r.state, 'storm');
  assert.equal(r.tick(1), null);
  assert.equal(r.tick(1), null);
  assert.equal(r.state, 'storm');
  assert.equal(r.stormed, true);
});

test('KOs score for the rammer', () => {
  const r = started({ seats: [0, 1, 2, 3] });
  assert.deepEqual(r.fall(1, 0), { scorer: 0, delta: 1, over: false });
  r.fall(2, 0);
  r.fall(0, 3);
  assert.deepEqual(r.scores, [2, 0, 0, 1]);
  assert.deepEqual(r.falls, [1, 1, 1, 0]);
});

test('own goal costs 1 but never goes below 0', () => {
  const r = started({});
  assert.deepEqual(r.fall(2, -1), { scorer: -1, delta: 0, over: false });
  assert.equal(r.scores[2], 0);
  r.fall(0, 2);
  r.fall(0, 2);
  assert.equal(r.scores[2], 2);
  assert.deepEqual(r.fall(2, -1), { scorer: -1, delta: -1, over: false });
  assert.equal(r.scores[2], 1);
  r.fall(2, 2); // pushed by itself counts as an own goal
  assert.equal(r.scores[2], 0);
});

test('falls are ignored before start, after over and for seats not in play', () => {
  const r = new Round({ seats: [0, 1] });
  assert.equal(r.fall(0, 1).ignored, true);
  r.start();
  assert.equal(r.fall(3, 0).ignored, true);
  assert.deepEqual(r.fall(0, 3), { scorer: -1, delta: 0, over: false }, 'credit to a seat not in play is dropped');
  r.fall(1, 0);
  assert.equal(r.tick(100), 'storm');
  assert.equal(r.tick(100), 'over');
  assert.equal(r.fall(1, 0).ignored, true);
  assert.deepEqual(r.scores, [1, 0, 0, 0]);
});

test('ranking: score, then fewer own falls, then seat', () => {
  const r = started({});
  r.fall(1, 0);
  r.fall(2, 3);
  r.fall(0, 1);
  // scores 0:1 1:1 2:0 3:1; falls 0:1 1:1 2:1 3:0
  assert.deepEqual(r.scores, [1, 1, 0, 1]);
  assert.deepEqual(r.ranking, [3, 0, 1, 2]);
});

test('clear winner at the bell ends the round', () => {
  const r = started({ seconds: 10, stormAt: 5 });
  r.fall(1, 2);
  assert.equal(r.tick(5), 'storm');
  assert.equal(r.tick(5), 'over');
  assert.equal(r.state, 'over');
  assert.equal(r.timeLeft, 0);
  assert.equal(r.winner, 2);
  assert.equal(r.ranking[0], 2);
});

test('tie at the top goes to sudden death among the tied only', () => {
  const r = started({ seconds: 10, stormAt: 5 });
  r.fall(2, 0);
  r.fall(3, 1);
  r.fall(3, 2);
  r.fall(0, 3);
  // scores 0:1 1:1 2:1 3:1 -> everyone tied; make seat 3 lose a point so 0,1,2 tie
  r.fall(3, -1);
  assert.deepEqual(r.scores, [1, 1, 1, 0]);
  assert.equal(r.tick(5), 'storm');
  assert.equal(r.tick(5), 'sudden');
  assert.equal(r.state, 'sudden');
  assert.deepEqual(r.tied, [0, 1, 2]);
  assert.equal(r.timeLeft, 0);
  assert.equal(r.tick(1), null, 'no more clock in sudden death');
  // a KO by the non-tied seat does not decide it
  assert.deepEqual(r.fall(0, 3), { scorer: 3, delta: 1, over: false });
  assert.equal(r.state, 'sudden');
  // next KO by a tied seat wins
  assert.deepEqual(r.fall(3, 1), { scorer: 1, delta: 1, over: true });
  assert.equal(r.state, 'over');
  assert.equal(r.winner, 1);
  assert.equal(r.ranking[0], 1);
});

test('own goal in sudden death does not end it', () => {
  const r = started({ seconds: 4, stormAt: 2, seats: [0, 1] });
  r.tick(2);
  assert.equal(r.tick(2), 'sudden');
  assert.deepEqual(r.fall(0, -1), { scorer: -1, delta: 0, over: false });
  assert.equal(r.state, 'sudden');
  assert.equal(r.fall(0, 1).over, true);
  assert.equal(r.winner, 1);
});

test('stormAt at or above the round length storms on the first tick', () => {
  const r = started({ seconds: 20, stormAt: 25 });
  assert.equal(r.tick(0.1), 'storm');
  assert.equal(r.tick(1), null);
});

test('start() resets a finished round', () => {
  const r = started({ seconds: 5, stormAt: 2 });
  r.fall(1, 0);
  r.tick(5);
  r.tick(5);
  assert.equal(r.state, 'over');
  r.start();
  assert.equal(r.state, 'play');
  assert.equal(r.timeLeft, 5);
  assert.deepEqual(r.scores, [0, 0, 0, 0]);
  assert.equal(r.stormed, false);
});
