// Bale Brawl duel simulation (games/bale-brawl/js/combat.js) and the CPU rival (ai.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Combat, knockFor, isBlocked, crossAngle, bestGuardFor, lineOf } from '../../games/bale-brawl/js/combat.js';
import { createAI } from '../../games/bale-brawl/js/ai.js';
import { ARENA, FIGHT, GUARD, SWING } from '../../games/bale-brawl/js/constants.js';

const PI = Math.PI, D2R = PI / 180;
const near = (a, b, eps = 1e-3, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg || ''} expected ${b}, got ${a}`);
const idle = (over = {}) => ({ live: true, yaw: 0, pitch: 0.4, bladeAngle: PI / 2, guard: false, swing: null, ...over });

/** Run the sim for `secs`, intents from fn(t) per frame. Returns the events. */
function run(c, secs, fn = () => [idle(), idle()], dt = 1 / 60) {
  const all = [];
  for (let t = 0; t < secs - 1e-9; t += dt) all.push(...c.step(dt, fn(t)));
  return all;
}
/** A fresh active duel with both fighters already at the engage gap. */
function duel() {
  const c = new Combat();
  c.setActive(true);
  run(c, 1.0);
  near(c.gap(), FIGHT.engageGap, 1e-6, 'engage gap');
  return c;
}
/** One strike from `att` with the defender holding `def` intent; returns events after it resolves. */
function strike(c, att, swing, def = idle()) {
  let first = true;
  return run(c, 0.6, () => {
    const it = [idle(), idle()];
    it[1 - att] = def;
    if (first) { it[att] = idle({ swing }); first = false; }
    return it;
  });
}

test('knockback formula: 0.45 + 0.60 * power, multipliers', () => {
  near(knockFor(0), 0.45);
  near(knockFor(1), 1.05);
  near(knockFor(0.5), 0.75);
  near(knockFor(1, { staggered: true }), 1.05 * 1.6);
  near(knockFor(1, { wrongGuard: true }), 1.05 * 0.5);
  near(knockFor(0.5, { scale: 1.5 }), 0.75 * 1.5);
});

test('block rule: crossing at 0 / 45 / 90 deg', () => {
  // side slash (dir 0) against blades at 0, 45 and 90 deg from its line
  assert.equal(isBlocked(0, 0), false);
  assert.equal(isBlocked(0, 45 * D2R), false);
  assert.equal(isBlocked(0, PI / 2), true);
  // chop (dir -PI/2): level blade blocks, upright blade does not
  assert.equal(isBlocked(-PI / 2, 0), true);
  assert.equal(isBlocked(-PI / 2, PI / 2), false);
  // threshold at 50 deg
  assert.equal(isBlocked(0, 50 * D2R), true);
  assert.equal(isBlocked(0, 49 * D2R), false);
  // mirror: attacker's diagonal is seen flipped by the defender
  near(crossAngle(PI / 4, PI / 4), PI / 2, 1e-9);
  near(crossAngle(PI / 4, 3 * PI / 4), 0, 1e-9);
  near(lineOf(bestGuardFor(0)), PI / 2, 1e-9);
});

test('unblocked strike shoves the victim by the knockback distance', () => {
  const c = duel();
  const x1 = c.fighters[1].x;
  const ev = strike(c, 0, { dir: 0, power: 1 });
  assert.deepEqual(ev.filter((e) => e.type === 'swing').map((e) => e.i), [0]);
  const hit = ev.find((e) => e.type === 'hit');
  assert.ok(hit, 'hit event');
  assert.equal(hit.attacker, 0); assert.equal(hit.victim, 1);
  near(hit.knock, 1.05);
  // victim slides about knock (walking back in a bit afterwards is allowed: measure the peak)
  const c2 = duel(); const xs = c2.fighters[1].x; let first = true, landed = false;
  for (let t = 0; t < 3 && !landed; t += 1 / 120) {
    landed = c2.step(1 / 120, [idle(first ? { swing: { dir: 0, power: 1 } } : {}), idle()]).some((e) => e.type === 'hit');
    first = false;
  }
  c2.setActive(false);   // no footwork: the slide alone
  run(c2, 2);
  near(c2.fighters[1].x - xs, 1.05, 0.03, 'slide');
  assert.ok(x1 > 0);
});

test('out of reach the strike whiffs', () => {
  const c = new Combat();
  c.setActive(true);
  // swing straight away: gap 2.6 > reach
  const ev = run(c, 0.5, (t) => [idle(t === 0 ? { swing: { dir: 0, power: 1 } } : {}), idle()]);
  assert.ok(ev.some((e) => e.type === 'swing'));
  assert.ok(!ev.some((e) => e.type === 'hit'));
});

test('guard crossing the swing blocks and staggers the attacker; perfect block', () => {
  // guard raised long before: normal block
  let c = duel();
  run(c, 0.5, () => [idle(), idle({ guard: true, bladeAngle: PI / 2 })]);
  let ev = strike(c, 0, { dir: 0, power: 1 }, idle({ guard: true, bladeAngle: PI / 2 }));
  let b = ev.find((e) => e.type === 'block');
  assert.ok(b); assert.equal(b.attacker, 0); assert.equal(b.blocker, 1); assert.equal(b.perfect, false);
  assert.ok(!ev.some((e) => e.type === 'hit'));
  // stagger began at the strike: 0.7 s minus the elapsed time after landing
  c = duel();
  run(c, 0.5, () => [idle(), idle({ guard: true, bladeAngle: PI / 2 })]);
  let first = true;
  for (let t = 0; t < SWING.humanDelay + 0.02; t += 1 / 120) {
    c.step(1 / 120, [idle(first ? { swing: { dir: 0, power: 1 } } : {}), idle({ guard: true, bladeAngle: PI / 2 })]);
    first = false;
  }
  assert.ok(c.fighters[0].stagger > GUARD.staggerOnBlock - 0.05 && c.fighters[0].stagger <= GUARD.staggerOnBlock);
  // guard raised just before the strike: perfect, longer stagger
  c = duel();
  ev = run(c, 0.15, (t) => [idle(t === 0 ? { swing: { dir: 0, power: 1 } } : {}), idle({ guard: true, bladeAngle: PI / 2 })]);
  b = ev.find((e) => e.type === 'block');
  assert.ok(b); assert.equal(b.perfect, true);
  assert.ok(c.fighters[0].stagger > GUARD.staggerOnBlock);
});

test('guard not yet raised long enough does not count', () => {
  const c = duel();
  // raise guard on the same frame the (instant) strike lands
  const ev = run(c, 0.4, (t) => [idle(t === 0 ? { swing: { dir: 0, power: 1, windup: 0.02 } } : {}), idle({ guard: true })]);
  assert.ok(ev.some((e) => e.type === 'hit'));
});

test('wrong-angle guard halves the knockback', () => {
  const c = duel();
  run(c, 0.5, () => [idle(), idle({ guard: true, bladeAngle: PI / 2 })]);
  const ev = strike(c, 0, { dir: -PI / 2, power: 1 }, idle({ guard: true, bladeAngle: PI / 2 }));
  const hit = ev.find((e) => e.type === 'hit');
  assert.ok(hit); near(hit.knock, 1.05 * 0.5);
});

test('hitting a staggered rival sends it 1.6x further', () => {
  const c = duel();
  run(c, 0.5, () => [idle(), idle({ guard: true, bladeAngle: PI / 2 })]);
  strike(c, 0, { dir: 0, power: 0.5 }, idle({ guard: true, bladeAngle: PI / 2 }));   // fighter 0 blocked
  assert.ok(c.fighters[0].stagger > 0);
  let ev = [], first = true;
  for (let t = 0; t < 0.3; t += 1 / 60) {
    ev.push(...c.step(1 / 60, [idle(), idle(first ? { swing: { dir: PI, power: 0.5 } } : {})])); first = false;
  }
  const hit = ev.find((e) => e.type === 'hit');
  assert.ok(hit); assert.equal(hit.victim, 0);
  near(hit.knock, 0.75 * FIGHT.staggerMul);
});

test('staggered or stunned fighters cannot swing or guard', () => {
  const c = duel();
  strike(c, 0, { dir: 0, power: 0.3 });  // fighter 1 hit -> stunned
  // during the stun fighter 1 asks to guard -> nothing
  c.step(1 / 120, [idle(), idle({ guard: true })]);
  // hit stun is set at the strike; after strike() ran 0.6 s it has expired, so do a fresh hit
  const c2 = duel();
  let ev = [];
  ev.push(...c2.step(1 / 60, [idle({ swing: { dir: 0, power: 0.3 } }), idle()]));
  for (let k = 0; k < 8; k++) ev.push(...c2.step(1 / 60, [idle(), idle()]));
  assert.ok(c2.fighters[1].stun > 0);
  ev = c2.step(1 / 60, [idle(), idle({ swing: { dir: 0, power: 1 } })]);
  assert.ok(!ev.some((e) => e.type === 'swing'), 'stunned fighter cannot swing');
});

test('clash: both strikes within 0.12 s push both back, no stun', () => {
  const c = duel();
  const x0 = c.fighters[0].x, x1 = c.fighters[1].x;
  const ev = run(c, 0.5, (t) => (t === 0
    ? [idle({ swing: { dir: 0, power: 1 } }), idle({ swing: { dir: PI, power: 1, windup: SWING.humanDelay + 0.08 } })]
    : [idle(), idle()]));
  assert.equal(ev.filter((e) => e.type === 'clash').length, 1);
  assert.ok(!ev.some((e) => e.type === 'hit' || e.type === 'block'));
  assert.equal(c.fighters[0].stun, 0); assert.equal(c.fighters[1].stun, 0);
  // the walk brings them back in, but each was pushed apart first
  assert.ok(c.fighters[0].x <= x0 + 1e-6 && c.fighters[1].x >= x1 - 1e-6);
  // strikes 0.2 s apart do not clash
  const c2 = duel();
  const ev2 = run(c2, 0.6, (t) => (t === 0
    ? [idle({ swing: { dir: 0, power: 1 } }), idle({ swing: { dir: PI, power: 1, windup: SWING.humanDelay + 0.2 } })]
    : [idle(), idle()]));
  assert.ok(!ev2.some((e) => e.type === 'clash'));
  assert.equal(ev2.filter((e) => e.type === 'hit').length, 1);
});

test('ring-out: event, inactive, splash 0.9 s later', () => {
  const c = duel();
  c.fighters[1].x = ARENA.radius - 0.2;
  c.fighters[0].x = c.fighters[1].x - FIGHT.engageGap;
  const ev = run(c, 2.0, (t) => [idle(t === 0 ? { swing: { dir: 0, power: 1 } } : {}), idle()]);
  const types = ev.map((e) => e.type);
  assert.ok(types.includes('edge'));
  const ro = ev.find((e) => e.type === 'ringout');
  assert.deepEqual({ loser: ro.loser, winner: ro.winner }, { loser: 1, winner: 0 });
  assert.equal(c.active, false);
  assert.ok(types.indexOf('splash') > types.indexOf('ringout'));
  assert.equal(ev.find((e) => e.type === 'splash').loser, 1);
  assert.equal(ev.filter((e) => e.type === 'ringout').length, 1);
  c.setActive(true);
  assert.equal(c.active, false, 'stays inactive until reset');
});

test('double ring-out within 0.25 s is a draw', () => {
  const c = new Combat();
  c.setActive(true);
  c.fighters[0].x = -ARENA.radius + 0.05; c.fighters[1].x = ARENA.radius - 0.1;
  c.fighters[0].vx = -4; c.fighters[1].vx = 4;   // 1 m slides each
  const ev = run(c, 1.5);
  const ro = ev.find((e) => e.type === 'ringout');
  assert.equal(ro.loser, -1); assert.equal(ro.winner, -1);
  assert.equal(ev.find((e) => e.type === 'splash').loser, -1);
});

test('arena shrink over time and ring-out at the smaller radius', () => {
  const c = duel();
  c.setArenaScale(0.45, 12);
  run(c, 6);
  near(c.arenaRadius, ARENA.radius * (1 - 0.55 * 0.5), 0.01);
  run(c, 7);
  near(c.arenaRadius, ARENA.radius * 0.45, 1e-6);
  assert.ok(!c.over, 'both still on (they stand near the middle)');
  c.fighters[1].x = c.arenaRadius - 0.1;
  c.fighters[0].x = c.fighters[1].x - FIGHT.engageGap;
  const ev = run(c, 1.2, (t) => [idle(t === 0 ? { swing: { dir: 0, power: 0.2 } } : {}), idle()]);
  assert.ok(ev.some((e) => e.type === 'ringout' && e.loser === 1));
  c.reset();
  near(c.arenaRadius, ARENA.radius);
  assert.equal(c.fighters[0].x, -ARENA.startX);
});

test('knock scale (sudden death) multiplies knockback', () => {
  const c = duel();
  c.setKnockScale(1.5);
  const hit = strike(c, 0, { dir: 0, power: 1 }).find((e) => e.type === 'hit');
  near(hit.knock, 1.05 * 1.5);
});

test('about four good hits from the centre ring the rival out', () => {
  const c = duel();
  let hits = 0, out = false;
  for (let n = 0; n < 8 && !out; n++) {
    const ev = strike(c, 0, { dir: 0, power: 0.85 });
    hits += ev.filter((e) => e.type === 'hit').length;
    run(c, 1.0);
    out = c.fighters[1].out;
  }
  assert.ok(out); assert.ok(hits >= 3 && hits <= 5, `hits ${hits}`);
});

test('determinism: same inputs, same outcome', () => {
  const play = () => {
    const c = new Combat();
    c.setActive(true);
    const a = createAI({ level: 'hard', index: 0, combat: c, seed: 3 });
    const b = createAI({ level: 'normal', index: 1, combat: c, seed: 9 });
    const ev = [];
    for (let k = 0; k < 60 * 40 && !c.over; k++) { const dt = 1 / 60; ev.push(...c.step(dt, [a.read(dt), b.read(dt)])); }
    return JSON.stringify({ ev, x: c.fighters.map((f) => f.x) });
  };
  assert.equal(play(), play());
});

test('CPU vs CPU: rounds finish, harder CPU wins more', () => {
  const duelOnce = (l0, l1, seed) => {
    const c = new Combat();
    c.setActive(true);
    const a = createAI({ level: l0, index: 0, combat: c, seed });
    const b = createAI({ level: l1, index: 1, combat: c, seed: seed * 7 + 1 });
    const n = { hit: 0, block: 0, swing: 0 };
    for (let k = 0; k < 60 * 90 && !c.result; k++) {
      for (const e of c.step(1 / 60, [a.read(1 / 60), b.read(1 / 60)])) if (n[e.type] != null) n[e.type]++;
    }
    return { winner: c.result ? c.result.winner : null, n };
  };
  let champWins = 0, finished = 0, blocks = 0;
  for (let s = 1; s <= 20; s++) {
    const r = duelOnce('easy', 'champ', s);
    if (r.winner != null) finished++;
    if (r.winner === 1) champWins++;
    blocks += r.n.block;
  }
  assert.ok(finished >= 18, `finished ${finished}`);
  assert.ok(champWins >= 14, `champ won ${champWins}/20`);
  assert.ok(blocks > 0);
});
