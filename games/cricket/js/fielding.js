// Fielding planner for Exemoo Cricket (no three.js, so Node tests can import it).
//
// At contact the ball's path is predicted (physics.js). For every fielder (and the keeper) the planner finds
// the earliest point on that path they can reach in time — reaction time, then running — and how: a catch
// (ball in the air at a catchable height), a stop (on the ground), or a dive for either (more reach, less
// sure). The fielder who gets there first takes it. A ball that beats everyone to the rope is a four or six;
// one that stops short is collected by whoever reaches it first. Catches can be dropped and hard-hit stops
// fumbled. Runs are what the batters can safely complete before the throw reaches the keeper.
//
// Field coordinates as in physics.js: batter at the origin, straight down the ground is −z.

export const FIELDING = {
  run: 7.4, // sprint speed (m/s)
  accel: 5, // from standing (m/s²)
  react: 0.3, // fielders' reaction time (s)
  keeperReact: 0.12,
  groundReach: 1.0, // reach for a ground ball, standing / running
  catchReach: 1.25, // reach for a catch
  diveReach: 2.3, // reach with a dive
  catchMinY: 0.15, catchMaxY: 2.5, // catchable ball heights (m)
  pickup: 0.45, divePickup: 0.95, fumbleDelay: 1.1, dropDelay: 1.2, // seconds lost
  release: 0.25, throwSpeed: 30, // throw: wind-up (s), speed (m/s)
  runTime: 3.4, startRun: 0.6, safety: 0.35, // batters: one run (s), start after contact (s), margin (s)
  keeperEnd: { x: 0, z: 1.2 },
};

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
/** Ground a fielder covers in `tau` seconds of running from standing: accelerate, then sprint. */
export function runDistance(tau, P = FIELDING) {
  if (tau <= 0) return 0;
  const tTop = P.run / P.accel;
  return tau < tTop ? 0.5 * P.accel * tau * tau : 0.5 * P.run * tTop + P.run * (tau - tTop);
}

/** Earliest way `pl` can get to the ball on `path` before `tLimit`: {t, s, how, dive} or null. */
export function reachBall(pl, path, tLimit, P = FIELDING) {
  const react = pl.react ?? P.react;
  for (const s of path) {
    if (s.t >= tLimit) break;
    const run = runDistance(s.t - react, P);
    const d = dist(pl, s);
    if (s.airborne && s.y >= P.catchMinY) {
      if (s.y > P.catchMaxY) continue;
      if (d - P.catchReach <= run) return { t: s.t, s, how: 'catch', dive: false };
      if (d - P.diveReach <= run && s.t > react + 0.2) return { t: s.t, s, how: 'catch', dive: true };
    } else {
      if (d - P.groundReach <= run) return { t: s.t, s, how: 'stop', dive: false };
      if (d - P.diveReach <= run && s.speed < 24 && s.t > react + 0.2) return { t: s.t, s, how: 'stop', dive: true };
    }
  }
  return null;
}

/**
 * Plan the fielding for a struck ball. `pred` = predictPath() result, `players` = [{id, x, z, react?, keeper?}].
 * Returns {by, t, at, action, dive, runs, backAt, speed} where action is
 * 'catch' | 'drop' | 'stop' | 'fumble' | 'collect' | 'four' | 'six'.
 */
export function planFielding(pred, players, rand = Math.random, P = FIELDING) {
  const { path, boundary } = pred;
  const tLimit = boundary ? boundary.t : Infinity;
  let best = null;
  for (const pl of players) {
    const r = reachBall(pl, path, tLimit, P);
    if (r && (!best || r.t < best.t)) best = { ...r, pl };
  }
  if (!best && boundary) return { by: null, t: boundary.t, action: boundary.airborne ? 'six' : 'four', runs: boundary.airborne ? 6 : 4 };
  let action, delay = 0, t, at, by, dive = false, speed = 0;
  if (best) {
    ({ t, dive } = best);
    by = best.pl.id;
    at = { x: best.s.x, y: best.s.y, z: best.s.z };
    speed = best.s.speed;
    if (best.how === 'catch') {
      const sure = best.pl.keeper ? 0.9 : dive ? 0.5 : 0.94;
      const p = sure - Math.max(0, speed - 22) * 0.02;
      if (rand() < p) return { by, t, at, action: 'catch', dive, runs: 0, speed };
      action = 'drop';
      delay = P.dropDelay;
    } else {
      const fumble = dive ? 0.3 : speed > 22 ? 0.15 : 0.04;
      action = rand() < 1 - fumble ? 'stop' : 'fumble'; // like catches: a low roll succeeds
      delay = (dive ? P.divePickup : P.pickup) + (action === 'fumble' ? P.fumbleDelay : 0);
    }
  } else {
    // Stopped short of everyone: the first to arrive collects it.
    const end = path.at(-1);
    let bestT = Infinity;
    for (const pl of players) {
      const d = Math.max(0, dist(pl, end) - P.groundReach), tTop = P.run / P.accel, dTop = 0.5 * P.run * tTop;
      const tt = Math.max(end.t, (pl.react ?? P.react) + (d < dTop ? Math.sqrt((2 * d) / P.accel) : tTop + (d - dTop) / P.run));
      if (tt < bestT) (bestT = tt), (by = pl.id);
    }
    t = bestT;
    at = { x: end.x, y: end.y, z: end.z };
    action = 'collect';
    delay = P.pickup;
  }
  const backAt = t + delay + P.release + dist(at, P.keeperEnd) / P.throwSpeed;
  const runs = Math.max(0, Math.min(3, Math.floor((backAt - P.startRun - P.safety) / P.runTime)));
  return { by, t, at, action, dive, runs, backAt, speed };
}

/**
 * Captain: after two of the last three hits went the same way, move the nearest other fielder there
 * (deep if they went far). `fielders` = [{x, z}], `shots` = [{aim, dist}]. Returns {index, aim, r} or null.
 */
export function captainMove(fielders, shots) {
  const recent = shots.slice(-3);
  const last = recent.at(-1);
  if (!last) return null;
  const same = recent.filter((s) => Math.abs(Math.atan2(Math.sin(s.aim - last.aim), Math.cos(s.aim - last.aim))) < 0.34);
  if (same.length < 2) return null;
  const aim = same.reduce((s, x) => s + x.aim, 0) / same.length;
  const r = same.some((s) => s.dist > 40) ? 55 : 28;
  const spot = { x: Math.sin(aim) * r, z: -Math.cos(aim) * r };
  if (fielders.some((f) => dist(f, spot) < 6)) return null; // already covered
  let index = -1, bestD = Infinity;
  fielders.forEach((f, i) => {
    const d = dist(f, spot);
    if (d < bestD) (bestD = d), (index = i);
  });
  return index < 0 ? null : { index, aim, r };
}
