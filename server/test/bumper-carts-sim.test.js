// Bumper Carts floor simulation (games/bumper-carts/js/sim.js) and CPU drivers (ai.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sim, STEP, panelAt, panelAngle, postPos, PANEL_ARC } from '../../games/bumper-carts/js/sim.js';
import { createAI } from '../../games/bumper-carts/js/ai.js';
import { ARENA, CART, CHARGE, BUMP, FENCE, MATCH } from '../../games/bumper-carts/js/constants.js';

const near = (a, b, eps = 1e-6, msg = '') => assert.ok(Math.abs(a - b) <= eps, `${msg} expected ${b}, got ${a}`);
const I = (x = 0, y = 0, charge = false) => ({ live: true, x, y, charge });
const idle4 = () => [I(), I(), I(), I()];

/** A sim with the given seats present, active, carts parked far apart and still. */
function make(seats = [0], seed = 1) {
  const s = new Sim({ seed });
  for (const i of seats) s.setPresent(i, true);
  s.setActive(true);
  return s;
}
function put(s, i, x, z, vx = 0, vz = 0) {
  const c = s.carts[i];
  Object.assign(c, { x, z, vx, vz });
  return c;
}
/** Run `secs` at 1/120 with intents from fn(t). Returns all events. */
function run(s, secs, fn = idle4) {
  const ev = [];
  const n = Math.round(secs / STEP);
  for (let k = 0; k < n; k++) ev.push(...s.step(STEP, fn(k * STEP)));
  return ev;
}
const of = (ev, type) => ev.filter((e) => e.type === type);
/** Unit direction of the middle of panel k (away from the posts). */
const dirOf = (k) => ({ x: Math.cos(panelAngle(k)), z: Math.sin(panelAngle(k)) });

test('geometry helpers: panels, posts', () => {
  assert.equal(panelAt(1, 0.001), 0);
  assert.equal(panelAt(Math.cos(panelAngle(5)), Math.sin(panelAngle(5))), 5);
  assert.equal(panelAt(1, -0.001), FENCE.panels - 1);
  const p = postPos(4);
  near(Math.hypot(p.x, p.z), FENCE.radius, 1e-9);
  near(Math.atan2(p.z, p.x), 4 * PANEL_ARC, 1e-9);
});

test('drive: accel then drag gives top speed accel/drag; intent y+ is up the screen (-z)', () => {
  const s = make([0]);
  put(s, 0, 0, 0);
  run(s, 0.5, () => [I(0, 1)]);
  const c = s.carts[0];
  assert.ok(c.vz < -3, `moving up the screen, vz ${c.vz}`);
  near(c.vx, 0, 1e-9);
  put(s, 0, -6, 0, 0, 0);
  run(s, 1.6, () => [I(1, 0)]);
  near(c.vx, CART.accel / CART.drag, 0.25, 'top speed');
  assert.equal(c.state, 'drive');
  // facing turns toward the velocity
  near(Math.cos(c.facing), 1, 1e-3);
  // let go: it slides, then stops
  const x0 = c.x;
  run(s, 3, () => [I()]);
  assert.ok(c.x - x0 > 1, 'slides on');
  assert.ok(Math.hypot(c.vx, c.vz) < 0.01, 'stops');
});

test('charge: slows the cart, rises to full in CHARGE.time, events charge(false) then charge(true)', () => {
  const s = make([0]);
  put(s, 0, -6, 0);
  run(s, 1.6, () => [I(1, 0)]);
  const c = s.carts[0];
  const ev = run(s, CHARGE.time + 0.1, () => [I(1, 0, true)]);
  const ch = of(ev, 'charge');
  assert.deepEqual(ch.map((e) => e.full), [false, true]);
  near(c.charge, 1, 1e-9);
  assert.equal(c.state, 'charge');
  // charging top speed = accel*accelMul / (drag*dragMul)
  run(s, 2, () => [I(1, 0, true)]);
  near(c.vx, (CART.accel * CHARGE.accelMul) / (CART.drag * CHARGE.dragMul), 0.1, 'charging speed');
});

test('a tiny charge is a honk: no dash', () => {
  const s = make([0]);
  put(s, 0, 0, 0);
  run(s, CHARGE.min * CHARGE.time * 0.5, () => [I(1, 0, true)]);
  const ev = run(s, 0.2, () => [I(0, 0, false)]);
  assert.equal(of(ev, 'dash').length, 0);
  assert.equal(of(ev, 'honk').length, 1);
  assert.ok(Math.hypot(s.carts[0].vx, s.carts[0].vz) < 2);
});

test('dash speed scales from dashMin to dashMax with charge; aims along tilt, else facing', () => {
  for (const [hold, expect] of [[CHARGE.min + 0.01, null], [0.5, null], [1.2, CHARGE.dashMax]]) {
    const s = make([0]);
    put(s, 0, 0, 0);
    run(s, hold, () => [I(0, 0, true)]);
    const ch = s.carts[0].charge;
    const ev = run(s, STEP, () => [I(0, -1, false)]);   // release, tilted toward the player (+z)
    const d = of(ev, 'dash')[0];
    assert.ok(d, `dash at hold ${hold}`);
    near(d.charge, ch, 1e-9);
    const c = s.carts[0];
    const sp = Math.hypot(c.vx, c.vz);
    const want = expect ?? CHARGE.dashMin + (CHARGE.dashMax - CHARGE.dashMin) * ch;
    near(sp, want, want * 0.03, `dash speed for charge ${ch.toFixed(2)}`);
    assert.ok(c.vz > 0 && Math.abs(c.vx) < 1e-6, 'along the tilt (+z)');
    assert.equal(c.state, 'dash');
    // dash lasts dashTime, then cooldown blocks a new charge
    run(s, CHARGE.dashTime + STEP, () => [I()]);
    assert.equal(c.state, 'drive');
    const ev2 = run(s, CHARGE.cooldown * 0.5, () => [I(0, 0, true)]);
    assert.equal(of(ev2, 'charge').length, 0, 'cooldown');
    const ev3 = run(s, CHARGE.cooldown, () => [I(0, 0, true)]);
    assert.equal(of(ev3, 'charge').length, 1, 'after cooldown');
  }
  // dead-zone tilt: dash along the facing
  const s = make([0]);
  put(s, 0, 0, 0);
  s.carts[0].facing = Math.PI;   // facing -x
  run(s, 0.6, () => [I(0, 0, true)]);
  run(s, STEP, () => [I(0.02, 0, false)]);
  assert.ok(s.carts[0].vx < -5, 'dashes along the facing');
});

/** Head-on contact: cart 0 at x=-d moving +x at `va`, cart 1 still at origin. */
function hit({ va = 5, dash = false, victimCharging = false, victimStun = 0, safe = false } = {}) {
  const s = make([0, 1]);
  put(s, 0, -1.2, 0, va, 0);
  put(s, 1, 0, 0, 0, 0);
  if (dash) { s.carts[0].dashT = 0.3; }
  if (victimCharging) { s.carts[1].charging = true; s.carts[1].charge = 0.5; }
  if (victimStun) s.carts[1].stunT = victimStun;
  if (safe) s.carts[1].safeT = 1;
  const ev = [];
  for (let k = 0; k < 30 && !of(ev, 'bump').length; k++) ev.push(...s.step(STEP, [I(0, 0, victimCharging), I(0, 0, victimCharging)]));
  return { s, ev, A: s.carts[0], B: s.carts[1] };
}

test('bump: bounce + ram bonus; dashing rammer x1.6 and keeps 35 %; charging victim x1.25; stunned x1.3', () => {
  const base = hit({ va: 5 });
  const b = of(base.ev, 'bump')[0];
  assert.ok(b, 'bump event');
  assert.equal(b.by, 0, 'rammer');
  assert.equal(b.a, 0); assert.equal(b.b, 1);
  const vb = base.B.vx;
  // closing is the speed just before contact (after a few steps of drag)
  const closing = b.power * BUMP.powerDiv;
  near(vb, (1 + BUMP.rest) / 2 * closing + BUMP.knock * closing, 0.05, 'victim speed = bounce + knock');
  near(base.A.vx, closing - (1 + BUMP.rest) / 2 * closing, 0.05, 'rammer bounce');

  const dashed = hit({ va: 12, dash: true });
  const db = of(dashed.ev, 'bump')[0];
  const cl = db.power * BUMP.powerDiv;
  near(dashed.B.vx, (1 + BUMP.rest) / 2 * cl + BUMP.knock * cl * BUMP.dashMul, 0.05, 'dash x1.6');
  near(dashed.A.vx, cl * BUMP.dashKeep, 0.05, 'dash rammer keeps 35 %');

  const chg = hit({ va: 5, victimCharging: true });
  const cb = of(chg.ev, 'bump')[0];
  const cc = cb.power * BUMP.powerDiv;
  near(chg.B.vx, (1 + BUMP.rest) / 2 * cc + BUMP.knock * cc * BUMP.chargeMul, 0.05, 'charging victim x1.25');

  const stn = hit({ va: 5, victimStun: 0.5 });
  const sb = of(stn.ev, 'bump')[0];
  const sc = sb.power * BUMP.powerDiv;
  near(stn.B.vx, (1 + BUMP.rest) / 2 * sc + BUMP.knock * sc * BUMP.stunMul, 0.05, 'stunned victim x1.3');

  // a dash sends the victim clearly further than a drive-speed bump
  assert.ok(dashed.B.vx > base.B.vx * 1.5);
});

test('bump: stun = 0.15 + 0.5 * power on the victim, no drive while stunned; credit only above power 0.25', () => {
  const { ev, B, A } = hit({ va: 6 });
  const p = of(ev, 'bump')[0].power;
  near(B.stunT, BUMP.stunMin + BUMP.stunPower * p, STEP * 2, 'stun length');
  assert.equal(B.state, 'stun');
  assert.equal(A.stunT, 0, 'rammer not stunned');
  assert.equal(B.lastHitBy, 0);
  const soft = hit({ va: 3 });   // power ~0.2
  const sp = of(soft.ev, 'bump')[0].power;
  assert.ok(sp < BUMP.creditPower && sp >= BUMP.eventMin, `soft power ${sp}`);
  assert.equal(soft.B.lastHitBy, -1, 'no credit for a soft nudge');
  // stunned cart ignores drive
  const s = make([0]);
  put(s, 0, 0, 0);
  s.carts[0].stunT = 0.5;
  run(s, 0.3, () => [I(1, 0, true)]);
  near(s.carts[0].vx, 0, 1e-9);
  assert.equal(s.carts[0].charging, false, 'no charge while stunned');
});

test('safe (blinking) carts take and deal no ram bonus', () => {
  const { s, ev, B } = hit({ va: 5, safe: true });
  const b = of(ev, 'bump')[0];
  const cl = b.power * BUMP.powerDiv;
  near(B.vx, (1 + BUMP.rest) / 2 * cl, 0.05, 'bounce only');
  assert.equal(B.stunT, 0);
  void s;
});

test('even bumps: by = -1, both stunned', () => {
  const s = make([0, 1]);
  put(s, 0, -0.6, 0, 4, 0);
  put(s, 1, 0.6, 0, -4, 0);
  const ev = run(s, 0.05);
  const b = of(ev, 'bump')[0];
  assert.equal(b.by, -1);
  assert.ok(s.carts[0].stunT > 0 && s.carts[1].stunT > 0);
  assert.equal(s.carts[0].lastHitBy, 1);
  assert.equal(s.carts[1].lastHitBy, 0);
});

test('clash: two head-on dashes, equal bounce, both stunned 0.4 s, no bonus', () => {
  const s = make([0, 1]);
  put(s, 0, -0.6, 0, 10, 0);
  put(s, 1, 0.6, 0, -10, 0);
  s.carts[0].dashT = 0.3; s.carts[1].dashT = 0.3;
  const ev = run(s, 0.05);
  assert.equal(of(ev, 'clash').length, 1);
  const [A, B] = s.carts;
  near(A.vx, -B.vx, 1e-9, 'equal and opposite');
  assert.ok(Math.abs(A.vx) < 10, 'no ram bonus');
  near(A.stunT, BUMP.clashStun, 0.05);
  near(B.stunT, BUMP.clashStun, 0.05);
  assert.equal(A.dashT, 0);
  // slow dashes (closing <= 12) are not a clash
  const s2 = make([0, 1]);
  put(s2, 0, -0.6, 0, 5, 0);
  put(s2, 1, 0.6, 0, -5, 0);
  s2.carts[0].dashT = 0.3; s2.carts[1].dashT = 0.3;
  assert.equal(of(run(s2, 0.05), 'clash').length, 0);
});

test('fence: hard hit cracks (hp 2 -> 1), second breaks and lets the cart through; soft hits bounce', () => {
  const s = make([0]);
  const k = 0, a = panelAngle(k);
  const shoot = (speed) => {
    put(s, 0, Math.cos(a) * 5.5, Math.sin(a) * 5.5, Math.cos(a) * speed, Math.sin(a) * speed);
    s.carts[0].dashT = 0.3;   // low drag so the speed holds
    return run(s, 0.4);
  };
  let ev = shoot(FENCE.breakSpeed - 2);
  assert.equal(of(ev, 'fence').length, 0, 'soft hit');
  assert.equal(s.fence[k], 2);
  const c = s.carts[0];
  assert.ok(c.vx * Math.cos(a) + c.vz * Math.sin(a) < 0, 'bounced back');
  ev = shoot(FENCE.breakSpeed + 4);
  assert.deepEqual(of(ev, 'fence').map((e) => [e.panel, e.hp, e.i]), [[k, 1, 0]]);
  assert.ok(Math.hypot(c.x, c.z) <= FENCE.radius, 'cracked panel still bounces');
  ev = shoot(FENCE.breakSpeed + 4);
  assert.deepEqual(of(ev, 'fence').map((e) => [e.panel, e.hp]), [[k, 0]]);
  assert.equal(of(ev, 'fall').length, 1, 'through the gap and over');
  assert.equal(of(ev, 'fall')[0].by, -1, 'nobody to credit: own goal');
});

test('posts never break', () => {
  const s = make([0]);
  const p = postPos(3), a = 3 * PANEL_ARC;
  s.fence.fill(0);
  for (let n = 0; n < 4; n++) {
    put(s, 0, p.x - Math.cos(a) * 2, p.z - Math.sin(a) * 2, Math.cos(a) * 14, Math.sin(a) * 14);
    s.carts[0].dashT = 0.3;
    s.carts[0].state = 'dash';
    const ev = run(s, 0.25);
    assert.equal(of(ev, 'fall').length, 0, 'bounced off the post');
    const c = s.carts[0];
    assert.ok(Math.hypot(c.x - p.x, c.z - p.z) >= CART.radius + FENCE.postRadius - 1e-6);
  }
});

test('fall, out, respawn at the farthest spawn point with safe time', () => {
  const s = make([0, 1, 2]);
  s.fence.fill(0);
  put(s, 1, -3, 0); put(s, 2, -2, 2);
  const d0 = dirOf(0);
  put(s, 0, d0.x * 6.5, d0.z * 6.5, d0.x * 4, d0.z * 4);
  const ev = run(s, 0.4, () => [I(d0.x, -d0.z), I(), I()]);
  const f = of(ev, 'fall');
  assert.equal(f.length, 1);
  assert.equal(s.carts[0].state, 'fall');
  // input is ignored while falling: it keeps going out, then splashes
  const r0 = Math.hypot(s.carts[0].x, s.carts[0].z);
  const ev2 = run(s, MATCH.fallTime, () => [I(-d0.x, d0.z), I(), I()]);
  assert.ok(Math.hypot(s.carts[0].x, s.carts[0].z) > r0 + 0.5, 'still going out');
  assert.equal(of(ev2, 'splash').length, 1);
  assert.equal(s.carts[0].state, 'out');
  const ev3 = [];
  let outFor = 0;
  while (!of(ev3, 'respawn').length && outFor < MATCH.respawn + 1) { ev3.push(...s.step(STEP, idle4())); outFor += STEP; }
  assert.deepEqual(of(ev3, 'respawn').map((e) => e.i), [0]);
  assert.ok(outFor <= MATCH.respawn + 1e-6, 'out for at most RESPAWN after the splash');
  const c = s.carts[0];
  assert.equal(c.state, 'drive');
  near(Math.hypot(c.x, c.z), ARENA.spawnRing, 1e-9, 'on the spawn ring');
  assert.ok(c.x > 1, 'far from the others (they sit on the -x side)');
  assert.ok(c.safeT > MATCH.safeTime - 0.1);
  assert.equal(s.snapshot().carts.find((k) => k.i === 0).safe, true);
  // safe: the rim is a wall even with no fence
  put(s, 0, d0.x * 6, d0.z * 6, d0.x * 10, d0.z * 10);
  run(s, 0.3);
  assert.equal(s.carts[0].state !== 'fall', true, 'cannot be knocked out while blinking');
  run(s, MATCH.safeTime);
  assert.equal(s.carts[0].safeT, 0);
});

test('KO credit: last bumper within the credit window, else own goal (-1)', () => {
  const credited = () => {
    const s = make([0, 1]);
    s.fence.fill(0);
    const d = dirOf(0);
    put(s, 1, d.x * 5.5, d.z * 5.5); put(s, 0, d.x * 4, d.z * 4, d.x * 9, d.z * 9);
    s.carts[0].dashT = 0.3;
    return s;
  };
  let s = credited();
  let ev = run(s, 1.2);
  assert.ok(of(ev, 'bump').some((e) => e.by === 0));
  let f = of(ev, 'fall').filter((e) => e.i === 1);
  assert.equal(f.length, 1);
  assert.equal(f[0].by, 0, 'credited to the rammer');
  assert.equal(s.kos[0], 1);

  // hit long ago: no credit
  s = make([0, 1]);
  s.fence.fill(0);
  put(s, 1, 0, 0);
  s.carts[1].lastHitBy = 0; s.carts[1].lastHitAt = -BUMP.creditWindow - 0.5;
  { const d = dirOf(0); put(s, 1, d.x * 6.9, d.z * 6.9, d.x * 3, d.z * 3); }
  ev = run(s, 0.3, () => [I(), I(dirOf(0).x, -dirOf(0).z)]);
  f = of(ev, 'fall');
  assert.equal(f[0].by, -1, 'outside the window');

  // within the window still counts even if the victim drove the last bit
  s = make([0, 1]);
  s.fence.fill(0);
  s.time = 10;
  s.carts[1].lastHitBy = 0; s.carts[1].lastHitAt = 10 - BUMP.creditWindow + 0.5;
  { const d = dirOf(0); put(s, 1, d.x * 6.9, d.z * 6.9, d.x * 3, d.z * 3); }
  ev = run(s, 0.3, () => [I(), I(dirOf(0).x, -dirOf(0).z)]);
  assert.equal(of(ev, 'fall')[0].by, 0);
});

test('storm: dropFence drops every standing panel, carts can drive off anywhere', () => {
  const s = make([0]);
  s.fence[3] = 1; s.fence[4] = 0;
  const dropped = s.dropFence();
  assert.equal(dropped.length, FENCE.panels - 1);
  assert.ok(!dropped.includes(4));
  assert.deepEqual(s.fence, new Array(FENCE.panels).fill(0));
  const d = dirOf(3);   // toward the camera side
  put(s, 0, d.x * 5.5, d.z * 5.5, 0, 0);
  const ev = run(s, 2, () => [I(d.x, -d.z)]);   // drive off the floor
  assert.equal(of(ev, 'fall').length, 1);
  assert.equal(of(ev, 'fence').length, 0, 'no fence events from the storm');
  assert.equal(s.snapshot().fence.every((h) => h === 0), true);
});

test('inactive sim ignores intents; reset restores spawn spots and the fence', () => {
  const s = make([0, 1, 2, 3]);
  s.setActive(false);
  run(s, 1, () => [I(1, 0, true), I(1, 0), I(1, 0), I(1, 0)]);
  for (const c of s.carts) near(Math.hypot(c.vx, c.vz), 0, 1e-9);
  s.fence[2] = 0;
  put(s, 0, 1, 1, 3, 3);
  s.reset(7);
  assert.equal(s.fence[2], FENCE.hp);
  const snap = s.snapshot();
  assert.equal(snap.carts.length, 4);
  assert.deepEqual(snap.carts.map((c) => c.state), ['drive', 'drive', 'drive', 'drive']);
  for (const c of snap.carts) near(Math.hypot(c.x, c.z), ARENA.spawnRing, 1e-9);
  assert.ok(snap.carts[0].x < 0 && snap.carts[1].x > 0 && snap.carts[2].z < 0 && snap.carts[3].z > 0, 'P1 left, P2 right, P3 far, P4 near');
  // empty seats are not in the snapshot
  s.setPresent(2, false);
  assert.deepEqual(s.snapshot().carts.map((c) => c.i), [0, 1, 3]);
});

test('determinism: same seed and inputs give identical runs (CPU drivers included)', () => {
  const play = (seed) => {
    const s = make([0, 1, 2, 3], seed);
    const ais = ['easy', 'normal', 'hard', 'hard'].map((level, i) => createAI({ level, index: i, sim: s, seed: seed * 3 }));
    const log = [];
    for (let t = 0; t < 30; t += 1 / 60) {
      if (Math.abs(t - 20) < 1e-3) s.dropFence();
      for (const e of s.step(1 / 60, ais.map((a) => a.read(1 / 60)))) log.push(JSON.stringify(e));
    }
    return { log: log.join('|'), snap: JSON.stringify(s.snapshot()) };
  };
  const a = play(42), b = play(42), c = play(43);
  assert.equal(a.log, b.log);
  assert.equal(a.snap, b.snap);
  assert.ok(a.log.length > 100, 'things happened');
  assert.notEqual(a.snap, c.snap, 'a different seed plays differently');
});

test('CPU drivers bump, charge and score over a round; they back off the rim', () => {
  const s = make([0, 1, 2, 3], 9);
  const ais = [0, 1, 2, 3].map((i) => createAI({ level: i < 2 ? 'hard' : 'normal', index: i, sim: s, seed: 11 }));
  const ev = [];
  for (let t = 0; t < 60; t += 1 / 60) ev.push(...s.step(1 / 60, ais.map((a) => a.read(1 / 60))));
  assert.ok(of(ev, 'bump').length > 20, 'they bump');
  assert.ok(of(ev, 'dash').length > 5, 'they dash');
  assert.ok(of(ev, 'fall').length >= 1, 'someone falls');
  // alone with all panels gone, a hard CPU does not drive off
  const s2 = make([0], 3);
  s2.fence.fill(0);
  const ai = createAI({ level: 'hard', index: 0, sim: s2, seed: 1 });
  put(s2, 0, 5.5, 0, 3, 0);
  const ev2 = [];
  for (let t = 0; t < 10; t += 1 / 60) ev2.push(...s2.step(1 / 60, [ai.read(1 / 60)]));
  assert.equal(of(ev2, 'fall').length, 0);
});
