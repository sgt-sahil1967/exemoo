// Moo Bowl physics (games/bowling/js/physics.js): lane model, gutters, pin action, settle logic, events.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '../../games/bowling/vendor/rapier3d-compat.js';
import { createPhysics, rollOut, laneMu, FIXED_DT } from '../../games/bowling/js/physics.js';
import { LANE, BALL, PIN, PIN_SPOTS, THROW } from '../../games/bowling/js/constants.js';

const phys = await createPhysics({ RAPIER });
const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const EVENT_TYPES = new Set(['ballPin', 'pinPin', 'pinWall', 'pinFloor', 'ballGutter', 'ballPit', 'pinDown']);
const V = THROW.typicalSpeed;

/** Seeded generator so every run of the suite throws exactly the same balls. */
function rng(seed) { return () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296; }

/** Full throw at 60 fps until settled. */
function bowl(t, standing = ALL, frame = 1 / 60) {
  phys.resetPins(standing);
  phys.throwBall(t);
  const events = [];
  let time = 0, deckAt = -1, gutterSeen = false, maxFrameMs = 0, ms = 0, frames = 0;
  while (!phys.settled && time < 40) {
    const a = performance.now();
    phys.step(frame);
    const d = performance.now() - a;
    ms += d; frames++; maxFrameMs = Math.max(maxFrameMs, d);
    time += frame;
    if (deckAt < 0 && phys.ball.z < LANE.kickbackStartZ) deckAt = time;
    if (phys.ball.state === 'gutter') gutterSeen = true;
    for (const e of phys.drainEvents()) events.push(e);
  }
  const left = phys.standing();
  return { left, count: standing.length - left.length, time, deckAt, events, gutterSeen, state: phys.ball.state, avgMs: ms / frames };
}

/** Launch angle that brings the ball to x = target at the head pin (empty-lane model). */
function aimAt(target, x, speed, curve) {
  let lo = -0.2, hi = 0.2;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2, r = rollOut({ x, angle: mid, speed, curve });
    if ((r.gutter ? Math.sign(r.x) * 9 : r.x) < target) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

function stats(throws) {
  const res = throws.map((t) => bowl(t));
  for (const r of res) {
    assert.ok(phys.settled, 'throw settled');
    if (r.deckAt >= 0) assert.ok(r.time - r.deckAt <= 6, `settled ${(r.time - r.deckAt).toFixed(2)} s after reaching the deck`);
  }
  return {
    res,
    strikes: res.filter((r) => r.count === 10).length / res.length,
    avg: res.reduce((a, r) => a + r.count, 0) / res.length,
  };
}

/** Hook shots at a pocket: side +1 = 1-3 pocket (ball curving toward -X), -1 = 1-2 pocket. */
function pocketThrows(side, n, seed) {
  const r = rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const speed = 6.6 + r() * 2.2, curve = -side * (0.5 + r() * 0.5), x = side * (0.18 + r() * 0.2);
    const target = side * (0.03 + r() * 0.065);
    out.push({ x, angle: aimAt(target, x, speed, curve), speed, curve });
  }
  return out;
}

test('lane model: straight ball is straight, curve hooks late, speed matters', () => {
  const s = rollOut({ x: 0.1, angle: 0, speed: V, curve: 0 });
  assert.ok(Math.abs(s.x - 0.1) < 1e-9 && !s.gutter, 'curve 0 goes dead straight');
  const loss = 1 - s.speed / V;
  assert.ok(loss > 0.1 && loss < 0.15, `speed loss ${(loss * 100).toFixed(1)}%`);
  assert.ok(laneMu(-3) < laneMu(-16) / 5, 'oil is much slicker than the dry back end');

  const r = rollOut({ x: -0.3, angle: 0, speed: V, curve: 1 });
  const hook = r.x + 0.3;
  assert.ok(hook > 0.4 && hook < 0.55, `hook at 7.6 m/s: ${hook.toFixed(3)} m`);
  const atTwoThirds = r.points.find((p) => p.z <= (-LANE.length * 2) / 3).x + 0.3;
  assert.ok(atTwoThirds < hook * 0.3, `most of the hook is in the last third (${atTwoThirds.toFixed(3)} of ${hook.toFixed(3)})`);
  assert.ok(r.entryAngle > (3 * Math.PI) / 180 && r.entryAngle < (7 * Math.PI) / 180, 'entry angle 3 to 7 degrees');

  const l = rollOut({ x: 0.3, angle: 0, speed: V, curve: -1 });
  assert.ok(Math.abs(l.x + r.x) < 1e-9, 'negative curve mirrors to -X');
  const half = rollOut({ x: -0.3, angle: 0, speed: V, curve: 0.5 }).x + 0.3;
  assert.ok(half > hook * 0.35 && half < hook * 0.7, 'half curve hooks about half as much');
  const slow = rollOut({ x: -0.4, angle: 0, speed: 5, curve: 1 }).x + 0.4;
  const fast = rollOut({ x: -0.3, angle: 0, speed: 10, curve: 1 }).x + 0.3;
  assert.ok(slow > hook + 0.1 && fast < hook - 0.1, `slow ${slow.toFixed(2)} > ${hook.toFixed(2)} > fast ${fast.toFixed(2)}`);

  const a = rollOut({ x: 0, angle: 0.02, speed: V, curve: 0 });
  assert.ok(Math.abs(a.x - Math.tan(0.02) * LANE.length) < 0.01, 'positive angle goes toward +X in a straight line');
});

test('predictPath matches the live ball', () => {
  for (const t of [{ x: 0.25, angle: -0.01, speed: V, curve: -0.9 }, { x: -0.1, angle: 0.012, speed: 5.5, curve: 0.5 }, { x: 0, angle: 0, speed: 10.5, curve: 0 }]) {
    const path = phys.predictPath(t, 48);
    assert.equal(path.length, 48);
    assert.ok(path[0].z === 0 && Math.abs(path[0].x - t.x) < 1e-9);
    assert.ok(Math.abs(path.at(-1).z + LANE.length) < 1e-6, 'path ends at the head pin');
    phys.resetPins([]);
    phys.throwBall(t);
    let i = 1, worst = 0, px = phys.ball.x, pz = phys.ball.z;
    while (i < path.length && phys.ball.z > -LANE.length - 0.2) {
      phys.step(FIXED_DT);
      while (i < path.length && phys.ball.z <= path[i].z) {
        const f = (path[i].z - pz) / (phys.ball.z - pz);
        worst = Math.max(worst, Math.abs(px + (phys.ball.x - px) * f - path[i].x));
        i++;
      }
      px = phys.ball.x; pz = phys.ball.z;
    }
    assert.equal(i, path.length);
    assert.ok(worst < 0.01, `live ball within 1 cm of the prediction (worst ${(worst * 1000).toFixed(1)} mm)`);
    assert.ok(Math.abs(phys.ball.y - BALL.radius) < 0.003, 'ball stays on the lane surface');
  }
  const g = phys.predictPath({ x: 0.45, angle: 0.08, speed: V, curve: 0 }, 20);
  assert.ok(Math.abs(g.at(-1).x - LANE.halfWidth) < 1e-6 && g.at(-1).z > -LANE.length, 'a gutter path ends at the lane edge');
});

test('a full rack is perfectly still for 30 s, and nothing is settled before a throw', () => {
  phys.resetPins();
  for (let i = 0; i < 30 * 60; i++) phys.step(1 / 60);
  assert.equal(phys.settled, false);
  assert.equal(phys.ball.present, false);
  assert.equal(phys.ball.state, 'none');
  assert.deepEqual(phys.standing(), ALL);
  assert.equal(phys.drainEvents().length, 0);
  phys.pins.forEach((p, i) => {
    assert.ok(p.present && !p.down);
    assert.ok(Math.hypot(p.x - PIN_SPOTS[i].x, p.y, p.z - PIN_SPOTS[i].z) < 1e-6, `pin ${p.id} on its spot`);
    assert.ok(Math.abs(p.qw) > 0.9999999);
  });
});

test('gutter ball: captured, one event, touches nothing, reaches the pit and settles quickly', () => {
  for (const t of [{ x: 0.4, angle: 0.09, speed: V, curve: 0 }, { x: -0.3, angle: 0, speed: 5, curve: -1 }, { x: 0.46, angle: 0.02, speed: 10.5, curve: 1 }]) {
    phys.resetPins();
    phys.throwBall(t);
    const side = Math.sign(t.angle || t.curve);
    let time = 0, inGutter = 0, pitAt = -1;
    const events = [];
    while (!phys.settled && time < 30) {
      phys.step(1 / 60); time += 1 / 60;
      events.push(...phys.drainEvents());
      if (phys.ball.state === 'gutter') {
        inGutter++;
        assert.ok(phys.ball.x * side > LANE.halfWidth - 1e-3, 'stays in the gutter');
        assert.ok(phys.ball.y < BALL.radius + 1e-3 && phys.ball.y > BALL.radius - LANE.gutterDepth - 0.005);
        assert.ok(phys.ball.vz < 0, 'keeps rolling toward the pit');
      }
      if (pitAt < 0 && phys.ball.state === 'pit') pitAt = time;
    }
    assert.ok(inGutter > 10 && pitAt > 0, 'went gutter then pit');
    assert.ok(phys.settled && time - pitAt < 1.5, `settled ${(time - pitAt).toFixed(2)} s after the pit`);
    assert.deepEqual(phys.standing(), ALL);
    assert.equal(events.filter((e) => e.type === 'ballGutter').length, 1);
    assert.equal(events.filter((e) => e.type === 'ballPit').length, 1);
    assert.equal(events.filter((e) => e.type === 'ballPin' || e.type === 'pinDown').length, 0);
    assert.ok(phys.ball.z > LANE.pitBackZ && phys.ball.z < LANE.deckEndZ && phys.ball.y < 0.05, 'ball rests in the pit');
  }
});

test('pocket hits strike most of the time, on both sides', () => {
  const right = stats(pocketThrows(1, 40, 11)), left = stats(pocketThrows(-1, 40, 23));
  for (const [name, s] of [['1-3', right], ['1-2', left]]) {
    // generous but not automatic: the pocket carries about nine times in ten
    assert.ok(s.strikes >= 0.6 && s.strikes <= 0.97, `${name} pocket strike rate ${(s.strikes * 100).toFixed(0)}%`);
    assert.ok(s.avg > 9.2, `${name} pocket average ${s.avg.toFixed(2)}`);
    console.log(`${name} pocket: ${(s.strikes * 100).toFixed(0)}% strikes, average ${s.avg.toFixed(2)}`);
    assert.ok(s.res.every((r) => r.count >= 7), 'a pocket hit never takes fewer than 7');
  }
});

test('dead-centre straight balls strike far less often and leave pins', () => {
  const r = rng(5), throws = [];
  for (let i = 0; i < 40; i++) throws.push({ x: (r() - 0.5) * 0.03, angle: 0, speed: 6.3 + r() * 3, curve: 0 });
  const s = stats(throws);
  assert.ok(s.strikes <= 0.35, `nose-hit strike rate ${(s.strikes * 100).toFixed(0)}%`);
  assert.ok(s.avg > 6 && s.avg < 9.3, `nose-hit average ${s.avg.toFixed(2)}`);
  assert.ok(s.res.every((x) => !x.left.includes(1) && !x.left.includes(5)), 'head pin and 5 pin always go');
  const splits = s.res.filter((x) => x.left.length >= 2 && Math.max(...x.left.map((id) => PIN_SPOTS[id - 1].x)) - Math.min(...x.left.map((id) => PIN_SPOTS[id - 1].x)) > 0.5);
  assert.ok(splits.length >= 4, `wide leaves happen (${splits.length} of 40)`);
});

test('a ball that only clips the corner pin takes 1 or 2', () => {
  for (const side of [1, -1]) for (const speed of [5.5, V, 10]) for (const off of [0.49, 0.515]) {
    const r = bowl({ x: side * off, angle: 0, speed, curve: 0 });
    assert.ok(r.count >= 1 && r.count <= 2, `x=${side * off} v=${speed}: ${r.count} pins`);
    assert.ok(!r.left.includes(side > 0 ? 10 : 7));
    assert.ok(r.left.includes(1) && r.left.includes(side > 0 ? 7 : 10));
  }
});

test('random on-lane throws score like real bowling', () => {
  const r = rng(2024), throws = [];
  while (throws.length < 70) {
    const t = { x: (r() - 0.5) * 0.9, angle: (r() - 0.5) * 0.04, speed: 5 + r() * 5, curve: (r() - 0.5) * 2 };
    const o = rollOut(t);
    if (!o.gutter && Math.abs(o.x) < 0.5) throws.push(t);
  }
  const s = stats(throws);
  assert.ok(s.avg > 4.5 && s.avg < 8.2, `average ${s.avg.toFixed(2)}`);
  assert.ok(s.strikes > 0.03 && s.strikes < 0.4, `strike rate ${(s.strikes * 100).toFixed(0)}%`);
  assert.ok(s.res.every((x) => x.count >= 1), 'an on-lane ball always hits something');
});

test('events are rate limited with sane strengths; down flags and standing() agree', () => {
  const t = { x: 0.3, angle: aimAt(0.06, 0.3, V, -0.8), speed: V, curve: -0.8 };
  const r = bowl(t);
  assert.ok(r.count >= 8);
  for (const e of r.events) {
    assert.ok(EVENT_TYPES.has(e.type), e.type);
    assert.ok(e.strength >= 0 && e.strength <= 1 && [e.x, e.y, e.z].every(Number.isFinite));
    if (e.type.startsWith('pin') || e.type === 'ballPin') assert.ok(e.id >= 1 && e.id <= 10);
  }
  const of = (type) => r.events.filter((e) => e.type === type);
  assert.ok(of('ballPin').length >= 2 && of('ballPin').length <= 30, `ballPin x${of('ballPin').length}`);
  assert.ok(of('pinPin').length >= 3 && of('pinPin').length <= 150, `pinPin x${of('pinPin').length}`);
  assert.ok(r.events.length < 400, `${r.events.length} events`);
  assert.ok(Math.max(...of('ballPin').map((e) => e.strength)) > 0.5, 'a full hit is a strong event');
  assert.ok(of('pinFloor').length > 0 && of('ballPit').length === 1 && of('ballGutter').length === 0);
  const downIds = of('pinDown').map((e) => e.id);
  assert.equal(new Set(downIds).size, downIds.length, 'pinDown fires once per pin');
  for (const p of phys.pins) {
    assert.equal(phys.standing().includes(p.id), p.present && !p.down);
    if (p.down) assert.ok(downIds.includes(p.id));
  }
  assert.equal(r.state, 'pit');
  assert.ok(r.time - r.deckAt >= 1 && r.time - r.deckAt <= 6);
  assert.equal(phys.drainEvents().length, 0);
});

test('resetPins(subset): only those pins exist, upright on their spots, and the ball is gone', () => {
  bowl({ x: 0, angle: 0, speed: V, curve: 0 });
  phys.resetPins([7, 10]);
  assert.equal(phys.ball.present, false);
  assert.equal(phys.settled, false);
  assert.deepEqual(phys.standing(), [7, 10]);
  for (const p of phys.pins) {
    assert.equal(p.present, p.id === 7 || p.id === 10);
    if (p.present) assert.ok(!p.down && p.y === 0 && p.x === PIN_SPOTS[p.id - 1].x && p.z === PIN_SPOTS[p.id - 1].z && p.qw === 1);
  }
  phys.throwBall({ x: PIN_SPOTS[9].x - 0.03, angle: 0, speed: V, curve: 0 });
  let time = 0;
  while (!phys.settled && time < 20) { phys.step(1 / 60); time += 1 / 60; }
  assert.deepEqual(phys.standing(), [7], 'the 7-10 split stays a split');
  assert.ok(phys.pins[9].down && phys.pins[9].present);
  phys.resetPins([]);
  assert.deepEqual(phys.standing(), []);
  phys.resetPins();
  assert.deepEqual(phys.standing(), ALL);
});

test('deterministic: same rack and throw give the same result, at any frame rate', () => {
  const t = { x: 0.21, angle: -0.012, speed: 8.1, curve: -0.6 };
  const snap = () => phys.pins.map((p) => [p.x, p.y, p.z, p.qx, p.qy, p.qz, p.qw, p.down]);
  const a = bowl(t), sa = snap();
  bowl({ x: -0.3, angle: 0.01, speed: 6, curve: 0.4 });
  const b = bowl(t), sb = snap();
  assert.deepEqual(a.left, b.left);
  assert.deepEqual(sa, sb, 'identical pin transforms');
  assert.equal(a.events.length, b.events.length);
  const c = bowl(t, ALL, 1 / 144), d = bowl(t, ALL, 1 / 30);
  assert.deepEqual(c.left, a.left);
  assert.deepEqual(d.left, a.left);
});

test('no tunnelling at full speed, and a crawling ball still resolves', () => {
  for (const x of [0, 0.15, -0.3, 0.457]) {
    const r = bowl({ x, angle: 0, speed: THROW.maxSpeed, curve: 0 });
    assert.ok(r.events.some((e) => e.type === 'ballPin'), `10.5 m/s ball at x=${x} hits a pin`);
    assert.ok(r.count >= 1);
    assert.ok(phys.ball.z > LANE.pitBackZ && Math.abs(phys.ball.x) < LANE.kickbackX, 'ball is held by the pit');
    for (const p of phys.pins) assert.ok(p.z > LANE.pitBackZ - 0.01 && Math.abs(p.x) < LANE.kickbackX + 0.01 && p.y > LANE.pitFloorY - 0.01, `pin ${p.id} stays inside`);
  }
  // far below any real throw: the ball never gets to the pins in time, the throw is still decided
  const slow = bowl({ x: 0, angle: 0, speed: 0.5, curve: 0 });
  assert.ok(phys.settled && slow.time < 18, `crawling ball settled after ${slow.time.toFixed(1)} s`);
  assert.deepEqual(slow.left, ALL);
});

test('fast enough: a full pin crash at 60 fps costs well under 2 ms per frame', () => {
  const t = { x: 0.3, angle: aimAt(0.06, 0.3, V, -0.8), speed: V, curve: -0.8 };
  bowl(t);
  const r = bowl(t);
  assert.ok(r.avgMs < 2, `average ${r.avgMs.toFixed(3)} ms per frame`);
  // crash only: from the first pin contact for 1.5 s
  phys.resetPins(); phys.throwBall(t);
  while (phys.ball.z > -LANE.length + 0.3) phys.step(1 / 60);
  const a = performance.now();
  for (let i = 0; i < 90; i++) phys.step(1 / 60);
  const crash = (performance.now() - a) / 90;
  assert.ok(crash < 2, `crash average ${crash.toFixed(3)} ms per frame`);
  assert.ok(PIN.mass === 1.53);
});

test('dispose', () => {
  phys.dispose();
  assert.equal(phys.ball.present, false);
  assert.deepEqual(phys.standing(), []);
  phys.step(1 / 60);
});
