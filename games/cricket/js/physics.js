// Ball physics and the shot model for Exemoo Cricket (no three.js, so Node tests and the fielding
// planner use exactly the same maths as the game).
//
// Field: batter at the origin, straight down the ground is −z, the off side is +x (screen right).
// The boundary is a circle of radius BOUNDARY around (0, FIELD_Z).
//
// Shot model: the camera intent {direction, lift, power} plus the timing error (s, − early, + late)
// give the ball's exit velocity. Contact quality falls off fast with timing, and both the exit speed and
// (for lofted shots) the launch angle depend on it, so only well-timed hits go far: early shots are
// dragged to the leg side and lose distance, late ones are steered to the off side, and a badly mistimed
// lofted shot goes up more than out (a catch). Edges fly fine, behind the wicket.

export const G = 9.81;
export const BALL_R = 0.036;
export const BOUNDARY = 64;
export const FIELD_Z = -10;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const D2R = Math.PI / 180;

/** Timing grades (|error| in seconds); past EDGED the bat misses. */
export const GRADES = [['PERFECT', 0.045], ['GOOD', 0.095], ['MISTIMED', 0.18], ['EDGED', 0.25]];
export function grade(err) {
  const e = Math.abs(err);
  for (const [g, lim] of GRADES) if (e <= lim) return g === 'MISTIMED' ? (err < 0 ? 'EARLY' : 'LATE') : g;
  return 'MISS';
}
/** Contact quality 0…1: 1 within 30 ms, 0 at 200 ms. */
export const contactQuality = (err) => clamp(1 - Math.max(0, Math.abs(err) - 0.03) / 0.17, 0, 1);

export const SHOT = {
  /** Exit speed (m/s) = (base + perPower·power) · (floor + (1 − floor)·quality²). */
  base: 15, perPower: 21, floor: 0.4,
  /** Launch angles (deg): ground shots, lofted shots (+ lift), extra for a mistimed loft. */
  groundElev: 3, groundLift: 5, loftElev: 16, loftLift: 22, skyElev: 22,
  loftAt: 0.35,
  /** Early drags to leg, late steers to off (rad per second of error, capped). */
  turn: 2.5, turnCap: 0.45,
};

/**
 * Exit velocity for a shot. `intent` = {direction, lift, power}; `err` = timing error (s); `rand` = [0,1).
 * Returns {v:{x,y,z}, speed, aim, elev, grade, quality, kind: 'block'|'drive'|'loft'|'edge'}, or null on a miss.
 */
export function shotVelocity(intent, err, rand = Math.random) {
  const g = grade(err);
  if (g === 'MISS') return null;
  const q = contactQuality(err);
  const power = clamp(intent.power ?? 0.6, 0, 1), lift = clamp(intent.lift ?? 0, 0, 1);
  let aim, speed, elev, kind;
  if (g === 'EDGED') {
    // Off the edge: deflected behind square, to the off side when late and the leg side when early. Where
    // the hands were heading still matters: a cover drive's edge goes finer than a straight drive's.
    const side = err > 0 ? 1 : -1;
    aim = clamp((intent.direction ?? 0) * 0.6 + side * (1.3 + rand() * 0.6), -2.9, 2.9);
    speed = 9 + 9 * power;
    elev = 8 + rand() * 22;
    kind = 'edge';
  } else {
    const turn = clamp(err * SHOT.turn, -SHOT.turnCap, SHOT.turnCap);
    aim = clamp((intent.direction ?? 0) + turn + (rand() - 0.5) * (0.06 + 0.3 * (1 - q)), -2.9, 2.9);
    if (power < 0.3) {
      kind = 'block';
      speed = 4 + 14 * power * (0.5 + 0.5 * q);
      elev = 2;
    } else {
      speed = (SHOT.base + SHOT.perPower * power) * (SHOT.floor + (1 - SHOT.floor) * q * q);
      if (lift >= SHOT.loftAt) {
        kind = 'loft';
        elev = SHOT.loftElev + SHOT.loftLift * lift + SHOT.skyElev * (1 - q);
      } else {
        kind = 'drive';
        elev = SHOT.groundElev + SHOT.groundLift * lift;
      }
    }
  }
  const e = elev * D2R;
  return {
    v: { x: Math.sin(aim) * Math.cos(e) * speed, y: Math.sin(e) * speed, z: -Math.cos(aim) * Math.cos(e) * speed },
    speed, aim, elev, grade: g, quality: q, kind,
  };
}

/** Rolling deceleration (m/s²) on the outfield at horizontal speed h. */
const ROLL_FRICTION = (h) => 1.6 + 0.07 * h;

/** Is (x, z) over the boundary rope? */
export const outOfField = (x, z) => Math.hypot(x, z - FIELD_Z) >= BOUNDARY;

/**
 * One physics step for a struck ball b = {x,y,z,vx,vy,vz, landed, bounces}: gravity, light air drag,
 * bounces that lose height and pace on grass, then rolling friction.
 */
export function stepBall(b, dt) {
  if (b.rolling) {
    const h = Math.hypot(b.vx, b.vz);
    const nh = Math.max(0, h - ROLL_FRICTION(h) * dt); // grass friction, a little stronger at speed
    b.vx = h > 0 ? (b.vx * nh) / h : 0;
    b.vz = h > 0 ? (b.vz * nh) / h : 0;
    b.x += b.vx * dt; b.z += b.vz * dt;
    return b;
  }
  b.vy -= G * dt;
  const sp = Math.hypot(b.vx, b.vy, b.vz);
  const drag = Math.max(0, 1 - 0.0022 * sp * dt); // ~quadratic drag, small
  b.vx *= drag; b.vy *= drag; b.vz *= drag;
  b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
  if (b.y <= BALL_R && b.vy < 0) {
    b.y = BALL_R;
    b.landed = true;
    b.bounces = (b.bounces || 0) + 1;
    const keep = b.bounces === 1 ? 0.62 : 0.8;
    b.vx *= keep; b.vz *= keep;
    if (-b.vy * 0.35 > 0.8) b.vy = -b.vy * 0.35;
    else (b.vy = 0), (b.rolling = true); // small bounces die into a roll
  }
  return b;
}

/**
 * Predicted path of a struck ball from position p with velocity v, sampled every dt:
 * [{t, x, y, z, airborne, speed}], ending when it stops, crosses the boundary or after maxT.
 * Also returns `boundary` = {t, airborne} if it reaches the rope.
 */
export function predictPath(p, v, { dt = 1 / 60, maxT = 9 } = {}) {
  const b = { x: p.x, y: p.y, z: p.z, vx: v.x, vy: v.y, vz: v.z, landed: false, bounces: 0 };
  const path = [];
  let boundary = null;
  for (let t = 0; t <= maxT; t += dt) {
    const airborne = !b.landed;
    path.push({ t, x: b.x, y: b.y, z: b.z, airborne, speed: Math.hypot(b.vx, b.vz) });
    if (outOfField(b.x, b.z)) {
      boundary = { t, airborne };
      break;
    }
    if (b.rolling && Math.hypot(b.vx, b.vz) < 0.05) break;
    stepBall(b, dt);
  }
  return { path, boundary };
}
