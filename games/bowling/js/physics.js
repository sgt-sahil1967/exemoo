// Moo Bowl physics: ball-on-lane skid / hook / roll model, gutters, pit and Rapier pin action.
// No three.js, no DOM. Rapier (@dimforge/rapier3d-compat) is injected: createPhysics({ RAPIER }).
//
// Design notes
// - The ball is a Rapier dynamic sphere. The lane under the ball is frictionless in Rapier; the sliding
//   friction of the lane (oil then dry boards) is applied by laneFriction() below, on the slip velocity of
//   the contact point. predictPath() integrates the very same function, so the aim guide is the live path.
// - Every resetPins() builds a fresh Rapier world, so a throw is a pure function of (standing pins, throw):
//   the same inputs give the same pin fall, whatever was simulated before.
// - Pins: compound of convex hulls that follow PIN_PROFILE, explicit mass / centre of mass / inertia, created
//   asleep on a flat base so an idle rack never creeps.
import { LANE, BALL, PIN, PIN_SPOTS, PIN_PROFILE, THROW } from './constants.js';

const G = 9.81;
const R = BALL.radius;
export const FIXED_DT = 1 / 240;
const MAX_FRAME_DT = 0.05;

// ---------------------------------------------------------------------------------------------------------
// Lane model (shared by the live ball and predictPath)
// ---------------------------------------------------------------------------------------------------------
export const LANE_MODEL = {
  muOil: 0.008, // sliding friction on the oiled front part
  muDry: 0.2, // sliding friction on the dry back end and the pin deck
  blend: 1.6, // metres over which the oil tapers off (centred on LANE.oilEndZ)
  rollFraction: 0.52, // forward rotation at release as a fraction of pure rolling (the rest is skid)
  sideSpin: 20, // rad/s of side rotation at |curve| = 1 and typical speed (about 190 rpm)
  spinSpeedExp: 1, // harder throws carry more revs: side rotation scales with (speed / typical)^exp
};

/** Sliding friction coefficient of the lane at distance z (z <= 0 down the lane). */
export function laneMu(z) {
  const t = (LANE.oilEndZ + LANE_MODEL.blend / 2 - z) / LANE_MODEL.blend; // 0 on oil .. 1 on dry
  const s = t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
  return LANE_MODEL.muOil + (LANE_MODEL.muDry - LANE_MODEL.muOil) * s;
}

/**
 * One friction step for a ball of radius R touching the lane. `s` has vx, vz (linear) and wx, wz (angular);
 * they are changed in place. Coulomb friction on the contact-point slip, capped so it never overshoots
 * pure rolling (I = 2/5 m r^2, so removing all slip takes dv = -2/7 slip).
 */
export function laneFriction(s, mu, dt) {
  const sx = s.vx + R * s.wz;
  const sz = s.vz - R * s.wx;
  const slip = Math.hypot(sx, sz);
  if (slip < 1e-9) return 0;
  const f = Math.min(2 / 7, (mu * G * dt) / slip);
  const dvx = -sx * f, dvz = -sz * f;
  s.vx += dvx;
  s.vz += dvz;
  s.wx -= (2.5 / R) * dvz;
  s.wz += (2.5 / R) * dvx;
  return slip;
}

function clampThrow(t) {
  const c = (v, lo, hi, d) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
  return {
    x: c(t?.x, -LANE.halfWidth + 0.01, LANE.halfWidth - 0.01, 0),
    angle: c(t?.angle, -0.5, 0.5, 0),
    speed: c(t?.speed, 0.5, 14, THROW.typicalSpeed),
    curve: c(t?.curve, -1, 1, 0),
  };
}

/** Linear and angular velocity of the ball at release. */
export function releaseState(t) {
  const { x, angle, speed, curve } = clampThrow(t);
  const dx = Math.sin(angle), dz = -Math.cos(angle);
  const vx = speed * dx, vz = speed * dz;
  const k = LANE_MODEL.rollFraction / R, w = curve * LANE_MODEL.sideSpin * Math.pow(speed / THROW.typicalSpeed, LANE_MODEL.spinSpeedExp);
  // forward roll = k * (up x v); side rotation = about the direction of travel
  return { x, z: 0, vx, vz, wx: k * vz + w * dx, wy: 0, wz: -k * vx + w * dz };
}

/**
 * Roll a ball down an empty lane with the lane model only. Returns the sampled track and where it ended:
 * { points: [{x, z, t}], gutter: boolean, x, z, t, speed, entryAngle (rad, + = moving toward +X), rolling }.
 * Stops at z = endZ (default: the head pin) or when the ball centre passes the lane edge.
 */
export function rollOut(t, endZ = -LANE.length, dt = FIXED_DT) {
  const s = releaseState(t);
  const points = [{ x: s.x, z: s.z, t: 0 }];
  let time = 0, gutter = false, slip = 0;
  for (let i = 0; i < 20000; i++) {
    slip = laneFriction(s, laneMu(s.z), dt);
    const px = s.x, pz = s.z;
    s.x += s.vx * dt;
    s.z += s.vz * dt;
    time += dt;
    if (Math.abs(s.x) > LANE.halfWidth) {
      const edge = Math.sign(s.x) * LANE.halfWidth, f = (edge - px) / (s.x - px || 1);
      s.x = edge; s.z = pz + (s.z - pz) * f;
      gutter = true;
    } else if (s.z <= endZ) {
      const f = (endZ - pz) / (s.z - pz || 1);
      s.x = px + (s.x - px) * f; s.z = endZ;
    }
    points.push({ x: s.x, z: s.z, t: time });
    if (gutter || s.z <= endZ || s.vz > -0.05) break;
  }
  return {
    points, gutter, x: s.x, z: s.z, t: time, speed: Math.hypot(s.vx, s.vz),
    entryAngle: Math.atan2(s.vx, -s.vz), rolling: slip < 0.02,
  };
}

function predictPath(t, n = 48) {
  const { points } = rollOut(t);
  const last = points[points.length - 1];
  n = Math.max(2, n | 0);
  const out = [];
  let j = 0;
  for (let i = 0; i < n; i++) {
    const z = (last.z * i) / (n - 1);
    while (j < points.length - 2 && points[j + 1].z > z) j++;
    const a = points[j], b = points[j + 1] || a;
    const f = b.z === a.z ? 0 : Math.min(1, Math.max(0, (z - a.z) / (b.z - a.z)));
    out.push({ x: a.x + (b.x - a.x) * f, z });
  }
  out[n - 1] = { x: last.x, z: last.z };
  return out;
}

// ---------------------------------------------------------------------------------------------------------
// Pin geometry and mass properties
// ---------------------------------------------------------------------------------------------------------
const PIN_SIDES = 14;
// Convex pieces as index ranges into PIN_PROFILE (each range is convex or very nearly so).
const PIN_PIECES = [[0, 4], [4, 7], [7, 9], [9, 11], [11, 16]];

function pinHullPoints(i0, i1) {
  const pts = [];
  // polygon radius between inscribed and circumscribed so the rolling radius matches the lathe mesh
  const k = 1 + (1 / Math.cos(Math.PI / PIN_SIDES) - 1) * 0.5;
  for (let i = i0; i <= i1; i++) {
    const [h, r] = PIN_PROFILE[i];
    if (r < 1e-6) { pts.push(0, h, 0); continue; }
    for (let s = 0; s < PIN_SIDES; s++) {
      const a = (s / PIN_SIDES) * Math.PI * 2;
      pts.push(Math.cos(a) * r * k, h, Math.sin(a) * r * k);
    }
  }
  return new Float32Array(pts);
}

/** Inertia of the pin as a uniform solid of revolution of PIN_PROFILE, scaled to PIN.mass, about PIN.comHeight. */
function pinInertia() {
  let vol = 0, axial = 0, trans = 0;
  const c = PIN.comHeight;
  for (let i = 0; i < PIN_PROFILE.length - 1; i++) {
    const [h0, r0] = PIN_PROFILE[i], [h1, r1] = PIN_PROFILE[i + 1];
    const N = 24;
    for (let j = 0; j < N; j++) {
      const f = (j + 0.5) / N, h = h0 + (h1 - h0) * f, r = r0 + (r1 - r0) * f;
      const dv = Math.PI * r * r * ((h1 - h0) / N);
      vol += dv;
      axial += 0.5 * r * r * dv;
      trans += (0.25 * r * r + (h - c) * (h - c)) * dv;
    }
  }
  const rho = PIN.mass / vol;
  return { axial: axial * rho, trans: trans * rho };
}
const PIN_I = pinInertia();

// ---------------------------------------------------------------------------------------------------------
// Tuning of the rigid-body world
// ---------------------------------------------------------------------------------------------------------
export const TUNING = {
  lengthUnit: 0.1,
  pinRestitution: 0.7, // pin-pin 0.7; with the ball (0.6) the average is 0.65
  pinFriction: 0.32,
  ballRestitution: 0.6,
  ballFriction: 0.22,
  deckRestitution: 0.32, // pin on wood (Min rule)
  deckFriction: 0.38, // (Min rule -> pin friction)
  wallRestitution: 0.45,
  wallFriction: 0.35,
  pinLinDamp: 0.08,
  pinAngDamp: 0.25,
};
const DOWN_COS = Math.cos((25 * Math.PI) / 180);
const DECK_FRONT_Z = LANE.kickbackStartZ;
const REST_LIN = 0.04, REST_ANG = 0.2, REST_TIME = 0.5;
const ROCK_COS = Math.cos((3 * Math.PI) / 180);
const DEAD_LIN = 0.12, DEAD_ANG = 2.0; // dead wood this slow cannot tip a standing pin any more
const DEAD_CALM_AFTER = 1.8; // s after the ball reaches the deck: slow dead wood stops rolling about
const MIN_SETTLE = 1.0; // s after the ball reaches the deck before a throw can count as settled
const CALM_AFTER = 3.2; // s after the ball reaches the deck: pins still moving get extra damping
const FORCE_AFTER = 5.0; // s after the ball reaches the deck: undecided pins are decided
const HARD_LIMIT = 16; // s after release, whatever happened
const GUTTER_X = LANE.halfWidth + LANE.gutterWidth / 2;
const GUTTER_Y = R - LANE.gutterDepth;
const GUTTER_MIN_SPEED = 2.2;

const GRP = { BALL: 1, PIN: 2, BALLFLOOR: 4, PINFLOOR: 8, STATIC: 16 };
const groups = (member, filter) => ((member << 16) | filter) >>> 0;

const IMPULSE_REF = { ballPin: 14, pinPin: 5, pinWall: 5, pinFloor: 3.5 };
const EVENT_COOLDOWN = { ballPin: 0.09, pinPin: 0.07, pinWall: 0.1, pinFloor: 0.12 };
const EVENT_MIN = 0.035;
const MAX_EVENTS = 256;

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export async function createPhysics({ RAPIER }) {
  if (!RAPIER) throw new Error('createPhysics: RAPIER is required');
  await RAPIER.init();
  const Rule = RAPIER.CoefficientCombineRule;

  const ball = { present: false, x: 0, y: R, z: 0, qx: 0, qy: 0, qz: 0, qw: 1, vx: 0, vy: 0, vz: 0, speed: 0, state: 'none' };
  const pins = PIN_SPOTS.map((s) => ({ id: s.id, present: false, x: s.x, y: 0, z: s.z, qx: 0, qy: 0, qz: 0, qw: 1, down: false }));

  let world = null, queue = null;
  let ballBody = null, ballCollider = null;
  const pinBodies = new Array(10).fill(null);
  const pinMeta = PIN_SPOTS.map(() => ({ rest: 0, rock: 0, wasDown: false, calm: false, pit: false, touched: false }));
  let colliderInfo = new Map(); // collider handle -> { kind: 'ball'|'pin'|'floor'|'wall', id }
  let events = [];
  let lastEvent = new Map();
  let acc = 0, time = 0;
  // per-throw state
  let thrown = false, throwTime = 0, deckTime = -1, pitTime = -1, ballStill = 0, ballDone = false;
  let hitPins = false, scripted = false, restTimer = 0, forced = false, settledFlag = false;
  const fric = { vx: 0, vz: 0, wx: 0, wz: 0 };
  const impulses = new Map();

  function emit(type, strength, x, y, z, id) {
    if (events.length >= MAX_EVENTS) return;
    const e = { type, strength: clamp01(strength), x, y, z };
    if (id !== undefined) e.id = id;
    events.push(e);
  }

  function fixed(desc, kind, member, filter) {
    desc.setCollisionGroups(groups(member, filter));
    const c = world.createCollider(desc);
    colliderInfo.set(c.handle, { kind, id: 0 });
    return c;
  }

  function buildStatics() {
    const hw = LANE.halfWidth, zFront = LANE.approach, zBack = LANE.pitBackZ, wallX = LANE.kickbackX;
    const laneLen = zFront - LANE.deckEndZ, laneMid = (zFront + LANE.deckEndZ) / 2;
    // lane + pin deck for the ball: frictionless here, laneFriction() does the work
    fixed(RAPIER.ColliderDesc.cuboid(hw, 0.25, laneLen / 2).setTranslation(0, -0.25, laneMid)
      .setFriction(0).setFrictionCombineRule(Rule.Min).setRestitution(0).setRestitutionCombineRule(Rule.Min),
    'ballfloor', GRP.BALLFLOOR, GRP.BALL);
    // the same slab for pins
    fixed(RAPIER.ColliderDesc.cuboid(hw, 0.25, laneLen / 2).setTranslation(0, -0.25, laneMid)
      .setFriction(TUNING.deckFriction).setFrictionCombineRule(Rule.Min)
      .setRestitution(TUNING.deckRestitution).setRestitutionCombineRule(Rule.Min),
    'floor', GRP.PINFLOOR, GRP.PIN);
    // gutters (flat channel floor) on both sides, the whole length
    const gw = (wallX + 0.3 - hw) / 2;
    for (const sx of [-1, 1]) {
      fixed(RAPIER.ColliderDesc.cuboid(gw, 0.25, laneLen / 2).setTranslation(sx * (hw + gw), -LANE.gutterDepth - 0.25, laneMid)
        .setFriction(0.3).setFrictionCombineRule(Rule.Min).setRestitution(0.2).setRestitutionCombineRule(Rule.Min),
      'floor', GRP.STATIC, GRP.PIN | GRP.BALL);
      // kickback / side wall
      fixed(RAPIER.ColliderDesc.cuboid(0.15, 1.0, (zFront - zBack) / 2 + 0.3).setTranslation(sx * (wallX + 0.15), 0.6, (zFront + zBack) / 2)
        .setFriction(TUNING.wallFriction).setRestitution(TUNING.wallRestitution),
      'wall', GRP.STATIC, GRP.PIN | GRP.BALL);
    }
    // pit floor and the soft rear cushion
    const pitLen = LANE.deckEndZ - zBack;
    fixed(RAPIER.ColliderDesc.cuboid(wallX + 0.3, 0.25, pitLen / 2 + 0.3).setTranslation(0, LANE.pitFloorY - 0.25, (LANE.deckEndZ + zBack) / 2 - 0.3)
      .setFriction(0.9).setRestitution(0).setRestitutionCombineRule(Rule.Min),
    'floor', GRP.STATIC, GRP.PIN | GRP.BALL);
    fixed(RAPIER.ColliderDesc.cuboid(wallX + 0.3, 1.0, 0.25).setTranslation(0, 0.6, zBack - 0.25)
      .setFriction(0.9).setRestitution(0).setRestitutionCombineRule(Rule.Min),
    'wall', GRP.STATIC, GRP.PIN | GRP.BALL);
    // ceiling (pinsetter housing) and a wall behind the bowler keep everything inside
    fixed(RAPIER.ColliderDesc.cuboid(wallX + 0.3, 0.2, (zFront - zBack) / 2 + 0.3).setTranslation(0, 1.5, (zFront + zBack) / 2)
      .setRestitution(0.1), 'wall', GRP.STATIC, GRP.PIN | GRP.BALL);
    fixed(RAPIER.ColliderDesc.cuboid(wallX + 0.3, 1.0, 0.25).setTranslation(0, 0.6, zFront + 0.25)
      .setRestitution(0.1), 'wall', GRP.STATIC, GRP.PIN | GRP.BALL);
  }

  function buildPin(index) {
    const spot = PIN_SPOTS[index];
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(spot.x, 0, spot.z)
        .setAdditionalMassProperties(PIN.mass, { x: 0, y: PIN.comHeight, z: 0 },
          { x: PIN_I.trans, y: PIN_I.axial, z: PIN_I.trans }, { x: 0, y: 0, z: 0, w: 1 })
        .setLinearDamping(TUNING.pinLinDamp).setAngularDamping(TUNING.pinAngDamp)
        .setCcdEnabled(true),
    );
    for (const [i0, i1] of PIN_PIECES) {
      const desc = RAPIER.ColliderDesc.convexHull(pinHullPoints(i0, i1));
      if (!desc) throw new Error('pin hull failed');
      desc.setDensity(0).setFriction(TUNING.pinFriction).setRestitution(TUNING.pinRestitution)
        .setCollisionGroups(groups(GRP.PIN, GRP.PIN | GRP.BALL | GRP.PINFLOOR | GRP.STATIC))
        .setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS).setContactForceEventThreshold(60);
      const c = world.createCollider(desc, body);
      colliderInfo.set(c.handle, { kind: 'pin', id: spot.id });
    }
    return body;
  }

  function resetPins(standing = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    if (world) { world.free(); queue.free(); }
    world = new RAPIER.World({ x: 0, y: -G, z: 0 });
    world.timestep = FIXED_DT;
    // Pins stand on a 5 cm base: with the default 1 m length unit the solver tolerates 1 mm of penetration,
    // which is 2 degrees of free rocking. Scale the tolerances (and sleep thresholds) to pin size.
    world.lengthUnit = TUNING.lengthUnit;
    queue = new RAPIER.EventQueue(true);
    colliderInfo = new Map();
    lastEvent = new Map();
    events = [];
    ballBody = null; ballCollider = null;
    buildStatics();
    const want = new Set(standing || []);
    for (let i = 0; i < 10; i++) {
      const p = pins[i], spot = PIN_SPOTS[i], m = pinMeta[i];
      p.present = want.has(p.id);
      p.x = spot.x; p.y = 0; p.z = spot.z; p.qx = 0; p.qy = 0; p.qz = 0; p.qw = 1; p.down = false;
      m.rest = 0; m.rock = 0; m.wasDown = false; m.calm = false; m.pit = false; m.touched = false;
      pinBodies[i] = p.present ? buildPin(i) : null;
    }
    // One step lets Rapier build mass properties and contacts, then the rack is put to sleep: an idle
    // rack is exactly on its spots and cannot creep. (Bodies created asleep wake up tilted in Rapier.)
    world.step(queue);
    queue.clear();
    for (const body of pinBodies) {
      if (!body) continue;
      body.setLinvel({ x: 0, y: 0, z: 0 }, false);
      body.setAngvel({ x: 0, y: 0, z: 0 }, false);
      body.sleep();
    }
    ball.present = false; ball.state = 'none';
    ball.x = 0; ball.y = R; ball.z = 0; ball.qx = ball.qy = ball.qz = 0; ball.qw = 1;
    ball.vx = ball.vy = ball.vz = ball.speed = 0;
    acc = 0;
    thrown = false; deckTime = -1; pitTime = -1; ballStill = 0; ballDone = false; hitPins = false;
    scripted = false; restTimer = 0; forced = false; settledFlag = false;
  }

  function throwBall(t) {
    if (ballBody) { world.removeRigidBody(ballBody); ballBody = null; }
    const s = releaseState(t);
    ballBody = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic().setTranslation(s.x, R, 0)
        .setLinvel(s.vx, 0, s.vz).setAngvel({ x: s.wx, y: 0, z: s.wz })
        .setCcdEnabled(true).setCanSleep(false),
    );
    ballCollider = world.createCollider(
      RAPIER.ColliderDesc.ball(R).setMass(BALL.mass)
        .setFriction(TUNING.ballFriction).setRestitution(TUNING.ballRestitution)
        .setCollisionGroups(groups(GRP.BALL, GRP.PIN | GRP.BALLFLOOR | GRP.STATIC))
        .setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS).setContactForceEventThreshold(150),
      ballBody,
    );
    colliderInfo.set(ballCollider.handle, { kind: 'ball', id: 0 });
    ball.present = true; ball.state = 'lane';
    thrown = true; throwTime = time; deckTime = -1; pitTime = -1; ballStill = 0; ballDone = false;
    hitPins = false; scripted = false; restTimer = 0; forced = false; settledFlag = false;
    readBall();
  }

  function readBall() {
    if (!ballBody) return;
    const p = ballBody.translation(), q = ballBody.rotation(), v = ballBody.linvel();
    ball.x = p.x; ball.y = p.y; ball.z = p.z;
    ball.qx = q.x; ball.qy = q.y; ball.qz = q.z; ball.qw = q.w;
    ball.vx = v.x; ball.vy = v.y; ball.vz = v.z;
    ball.speed = Math.hypot(v.x, v.y, v.z);
  }

  function enterGutter(p, v) {
    ball.state = 'gutter';
    scripted = true;
    // The gutter carries the ball: it only pushes dead wood lying in the channel, and it cannot touch a
    // pin at all if it dropped in before reaching them.
    ballCollider.setCollisionGroups(groups(GRP.BALL, hitPins ? GRP.PIN : 0));
    ballBody.setGravityScale(0, true);
    emit('ballGutter', 0.35 + Math.hypot(v.x, v.z) / 12, p.x, 0, p.z);
  }

  function enterPit(p, v) {
    ball.state = 'pit';
    pitTime = time;
    if (scripted) {
      scripted = false;
      ballCollider.setCollisionGroups(groups(GRP.BALL, GRP.PIN | GRP.BALLFLOOR | GRP.STATIC));
      ballBody.setGravityScale(1, true);
    }
    ballBody.setLinearDamping(3.2);
    ballBody.setAngularDamping(3.0);
    emit('ballPit', 0.25 + Math.hypot(v.x, v.y, v.z) / 9, p.x, LANE.pitFloorY + R, p.z);
  }

  /** Runs before each world step: lane friction, gutter capture and the scripted gutter ride. */
  function driveBall(dt) {
    const p = ballBody.translation(), v = ballBody.linvel();
    if (ball.state === 'lane') {
      if (p.z < LANE.deckEndZ) { enterPit(p, v); return; }
      if (Math.abs(p.x) > LANE.halfWidth) enterGutter(p, v);
    }
    if (ball.state === 'lane') {
      if (p.y < R + 0.004) {
        const w = ballBody.angvel();
        fric.vx = v.x; fric.vz = v.z; fric.wx = w.x; fric.wz = w.z;
        laneFriction(fric, laneMu(p.z), dt);
        ballBody.setLinvel({ x: fric.vx, y: v.y, z: fric.vz }, true);
        ballBody.setAngvel({ x: fric.wx, y: w.y, z: fric.wz }, true);
      }
    } else if (ball.state === 'gutter') {
      if (p.z < LANE.deckEndZ) { enterPit(p, v); return; }
      const side = p.x < 0 ? -1 : 1, cx = side * GUTTER_X;
      // sideways: an underdamped spring to the bottom of the channel (the ball rocks a little, then tracks)
      let vx = v.x + (-150 * (p.x - cx) - 9 * v.x) * dt;
      const lim = LANE.gutterWidth / 2 - 0.004;
      if ((p.x - cx) * side < -lim && vx * side < 0) vx = -vx * 0.3; // lane-side lip
      if ((p.x - cx) * side > lim && vx * side > 0) vx = -vx * 0.3;
      // vertical: drop onto the channel floor
      let vy = v.y - G * dt;
      if (p.y + vy * dt < GUTTER_Y) vy = Math.abs(vy) > 0.5 ? -vy * 0.25 : (GUTTER_Y - p.y) / dt;
      // along the gutter: a little drag, but it always makes the pit
      let vz = v.z;
      if (vz > -GUTTER_MIN_SPEED) vz = Math.max(-GUTTER_MIN_SPEED, vz - 4 * dt);
      else vz += 0.25 * dt;
      ballBody.setLinvel({ x: vx, y: vy, z: vz }, true);
      ballBody.setAngvel({ x: vz / R, y: 0, z: -vx / R }, true);
    }
  }

  function gatherContacts(dt) {
    impulses.clear();
    queue.drainContactForceEvents((ev) => {
      const a = colliderInfo.get(ev.collider1()), b = colliderInfo.get(ev.collider2());
      if (!a || !b) return;
      let type, id, other = 0;
      if (a.kind === 'ball' || b.kind === 'ball') {
        const o = a.kind === 'ball' ? b : a;
        if (o.kind !== 'pin') return;
        type = 'ballPin'; id = o.id;
      } else if (a.kind === 'pin' && b.kind === 'pin') {
        type = 'pinPin'; id = Math.min(a.id, b.id); other = Math.max(a.id, b.id);
      } else {
        const pin = a.kind === 'pin' ? a : b, o = a.kind === 'pin' ? b : a;
        type = o.kind === 'wall' ? 'pinWall' : 'pinFloor'; id = pin.id;
      }
      const key = type + ':' + id + ':' + other;
      const rec = impulses.get(key);
      const j = ev.totalForceMagnitude() * dt;
      if (rec) rec.j += j; else impulses.set(key, { type, id, other, j });
    });
    for (const [key, rec] of impulses) {
      if (rec.type === 'ballPin') { hitPins = true; pinMeta[rec.id - 1].touched = true; }
      else if (rec.type === 'pinPin') { pinMeta[rec.id - 1].touched = true; pinMeta[rec.other - 1].touched = true; }
      const strength = rec.j / IMPULSE_REF[rec.type];
      if (strength < EVENT_MIN) continue;
      const last = lastEvent.get(key);
      if (last !== undefined && time - last < EVENT_COOLDOWN[rec.type]) continue;
      lastEvent.set(key, time);
      const body = pinBodies[rec.id - 1];
      if (!body) continue;
      const c = body.worldCom();
      let x = c.x, y = c.y, z = c.z;
      if (rec.type === 'ballPin' && ballBody) {
        const bp = ballBody.translation();
        const dx = x - bp.x, dy = y - bp.y, dz = z - bp.z, d = Math.hypot(dx, dy, dz) || 1;
        x = bp.x + (dx / d) * R; y = bp.y + (dy / d) * R; z = bp.z + (dz / d) * R;
      } else if (rec.type === 'pinPin' && pinBodies[rec.other - 1]) {
        const o = pinBodies[rec.other - 1].worldCom();
        x = (x + o.x) / 2; y = (y + o.y) / 2; z = (z + o.z) / 2;
      } else if (rec.type === 'pinWall') {
        if (Math.abs(x) > LANE.kickbackX - 0.2) x = Math.sign(x) * LANE.kickbackX;
        else if (z < LANE.pitBackZ + 0.3) z = LANE.pitBackZ;
      } else if (rec.type === 'pinFloor') {
        y = z < LANE.deckEndZ ? LANE.pitFloorY : Math.abs(x) > LANE.halfWidth ? -LANE.gutterDepth : 0;
      }
      emit(rec.type, strength, x, y, z, rec.id);
    }
  }

  function onDeck(p) {
    return Math.abs(p.x) <= LANE.halfWidth && p.z >= LANE.deckEndZ && p.z <= DECK_FRONT_Z && p.y > -0.02;
  }

  /** Reads every pin back from Rapier, updates `down`, pit damping and rest timers. Returns true if all are at rest. */
  function readPins(dt, track) {
    let allRest = true;
    for (let i = 0; i < 10; i++) {
      const body = pinBodies[i];
      if (!body) continue;
      const p = pins[i], m = pinMeta[i];
      if (body.isSleeping()) { m.rest += dt; continue; }
      const t = body.translation(), q = body.rotation();
      p.x = t.x; p.y = t.y; p.z = t.z; p.qx = q.x; p.qy = q.y; p.qz = q.z; p.qw = q.w;
      const up = 1 - 2 * (q.x * q.x + q.z * q.z);
      const deck = onDeck(t);
      p.down = up < DOWN_COS || !deck;
      if (!track) continue;
      const v = body.linvel(), w = body.angvel();
      const lin = Math.hypot(v.x, v.y, v.z), ang = Math.hypot(w.x, w.y, w.z);
      if (p.down && !m.wasDown) {
        m.wasDown = true;
        emit('pinDown', 0.3 + lin / 8, t.x, Math.max(0, t.y) + PIN.comHeight * up, t.z, p.id);
      }
      if (!m.pit && t.z < LANE.deckEndZ - 0.03) {
        // the pit is carpet and curtain: whatever gets there dies quickly
        m.pit = true;
        body.setLinearDamping(3.0);
        body.setAngularDamping(4.0);
      }
      if (p.down ? lin < DEAD_LIN && ang < DEAD_ANG : lin < REST_LIN && ang < REST_ANG) m.rest += dt; else m.rest = 0;
      if (p.down && !m.calm && !m.pit && deckTime >= 0 && time - deckTime > DEAD_CALM_AFTER && lin < 1.2 && t.y < 0.12) {
        m.calm = true;
        body.setLinearDamping(1.2);
        body.setAngularDamping(2.5);
      }
      // A pin left rocking on its base rim by a degree or two would precess for seconds (Euler's disk).
      // Once it is clearly staying up, level it; the correction is too small to see.
      if (!p.down && up > ROCK_COS && lin < 0.1 && ang < 0.7) {
        m.rock += dt;
        if (m.rock >= 0.35 && m.rest < REST_TIME) { levelPin(body, p); m.rest = REST_TIME; }
      } else m.rock = 0;
      // pins that are already in the pit cannot change the result; do not wait for them
      if (m.rest < REST_TIME && !m.pit) allRest = false;
    }
    return allRest;
  }

  /** Stand a pin exactly upright where it is (keeps its turn about the vertical) and put it to sleep. */
  function levelPin(body, p) {
    const t = body.translation(), q = body.rotation();
    const yaw = Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.x * q.x));
    const qy = Math.sin(yaw / 2), qw = Math.cos(yaw / 2);
    body.setTranslation({ x: t.x, y: 0, z: t.z }, false);
    body.setRotation({ x: 0, y: qy, z: 0, w: qw }, false);
    body.setLinvel({ x: 0, y: 0, z: 0 }, false);
    body.setAngvel({ x: 0, y: 0, z: 0 }, false);
    body.sleep();
    p.x = t.x; p.y = 0; p.z = t.z; p.qx = 0; p.qy = qy; p.qz = 0; p.qw = qw;
  }

  function calmPins() {
    for (let i = 0; i < 10; i++) {
      const body = pinBodies[i], m = pinMeta[i];
      if (!body || m.calm || m.pit || body.isSleeping() || m.rest >= REST_TIME) continue;
      m.calm = true;
      body.setLinearDamping(1.6);
      body.setAngularDamping(3.5);
    }
  }

  function forceDecision() {
    forced = true;
    for (let i = 0; i < 10; i++) {
      const body = pinBodies[i], m = pinMeta[i], p = pins[i];
      if (!body || body.isSleeping()) continue;
      if (p.down) {
        // dead wood: let it finish dropping, heavily damped
        body.setLinearDamping(5);
        body.setAngularDamping(8);
        continue;
      }
      if (m.rest >= REST_TIME) continue;
      // still rocking but not over: it stays up, right where it is
      levelPin(body, p);
      p.down = false;
    }
    if (ballBody && ball.state !== 'pit') {
      ballBody.setLinearDamping(4);
      ballBody.setAngularDamping(4);
    }
  }

  function substep() {
    const dt = FIXED_DT;
    if (ballBody) driveBall(dt);
    world.step(queue);
    time += dt;
    gatherContacts(dt);
    if (ballBody) {
      const p = ballBody.translation(), v = ballBody.linvel();
      const sp = Math.hypot(v.x, v.y, v.z);
      if (ball.state === 'lane') {
        ballStill = sp < 0.06 ? ballStill + dt : 0;
        if (ballStill >= 0.5) ballDone = true;
      }
      if (ball.state === 'pit') ballDone = true;
      if (deckTime < 0 && (p.z < DECK_FRONT_Z || ballDone)) deckTime = time;
    }
    const allRest = readPins(dt, thrown);
    if (!thrown || settledFlag) return;
    const sinceDeck = deckTime < 0 ? -1 : time - deckTime;
    if (!forced) {
      if (sinceDeck >= CALM_AFTER) calmPins();
      if (sinceDeck >= FORCE_AFTER || time - throwTime >= HARD_LIMIT) { forceDecision(); ballDone = true; restTimer = 0; }
    }
    if (forced) {
      restTimer += dt;
      if (restTimer >= 0.25) settledFlag = true;
      return;
    }
    restTimer = ballDone && allRest ? restTimer + dt : 0;
    // every pin already carries its own 0.5 s rest timer; a short extra hold lets the ball clear the deck
    if (ballDone && allRest && restTimer >= 0.1 && sinceDeck >= MIN_SETTLE) settledFlag = true;
  }

  function step(dt) {
    if (!world || !(dt > 0)) return;
    acc += Math.min(dt, MAX_FRAME_DT);
    let n = 0;
    while (acc >= FIXED_DT - 1e-9 && n < 16) { substep(); acc -= FIXED_DT; n++; }
    if (acc < 0) acc = 0;
    readBall();
  }

  function standing() {
    const out = [];
    for (const p of pins) if (p.present && !p.down) out.push(p.id);
    return out;
  }

  function drainEvents() {
    const out = events;
    events = [];
    return out;
  }

  function dispose() {
    if (world) { world.free(); queue.free(); world = null; queue = null; }
    ballBody = null;
    for (let i = 0; i < 10; i++) { pinBodies[i] = null; pins[i].present = false; }
    ball.present = false; ball.state = 'none';
  }

  resetPins();

  return {
    resetPins, throwBall, step, ball, pins, drainEvents, standing, predictPath, dispose,
    get settled() { return settledFlag; },
    /** Seconds simulated since createPhysics (debugging / tests). */
    get time() { return time; },
  };
}
