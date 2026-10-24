/**
 * SPINSHOT — shot / serve solver and intercept finder.
 * All trajectories are integrated with the same core as the live Ball (drag + Magnus + spin decay).
 */
import { Vector3 } from 'three';
import { HALF_L, HALF_W, sideSign, type BallState, type PathPoint, type ShotRequest, type Side } from '../core/contracts';
import { EV_BOUNCE, EV_EDGE, EV_FLOOR, EV_NET, EV_OUT, NET_HALF_W, NET_TOP, R, TABLE_TOP, flyToPlane, makeBody, type SimBody } from './core';
import { trace } from './ball';

export interface Intercept { t: number; pos: Vector3; vel: Vector3; }

/** Ball centre height range (above the table surface) in which a ball is comfortably hittable. */
export const HIT_MIN = 0.02;
export const HIT_MAX = 0.55;
/** Preferred strike zone relative to the end line (|z| − HALF_L): −0.35 … +1.6; over-table reach to −0.8. */
export const STRIKE_Z_MIN = -0.35;
export const STRIKE_Z_REACH = -0.8;
export const STRIKE_Z_MAX = 1.6;
/** Desired clearance of the ball's bottom over the net tape. */
const NET_MARGIN = 0.015;

const LAND_Y = TABLE_TOP + R;

function gauss(rng: () => number): number {
  let u = rng();
  if (u < 1e-12) u = 1e-12;
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

// ───────────────────────────── aim solver ─────────────────────────────
interface Aim {
  th: number; phi: number; speed: number;
  converged: boolean; tooShort: boolean;
  /** Ball bottom clearance over the net tape (m); +Inf if it passes outside the net / does not cross. */
  clearance: number;
  err: number;
  vx: number; vy: number; vz: number;
}

const tmpBody: SimBody = makeBody();

function fly(from: Vector3, vx: number, vy: number, vz: number, spin: Vector3) {
  const b = tmpBody;
  b.px = from.x; b.py = from.y; b.pz = from.z;
  b.vx = vx; b.vy = vy; b.vz = vz;
  b.wx = spin.x; b.wy = spin.y; b.wz = spin.z;
  b.netTouch = false; b.cordPass = false; b.done = false;
  return flyToPlane(b, LAND_Y, 3);
}

/** Vacuum low-arc elevation guess. */
function guessElevation(D: number, dy: number, v: number): number {
  const g = 9.81;
  const v2 = v * v;
  const disc = v2 * v2 - g * (g * D * D + 2 * dy * v2);
  if (disc < 0) return Math.PI / 4;
  return Math.atan2(v2 - Math.sqrt(disc), g * D);
}

/**
 * Solve elevation θ and azimuth φ at fixed speed so the first descending crossing of the landing plane
 * is at (tx, tz). Bracketing secant on θ, proportional correction on φ.
 */
function solveAim(from: Vector3, tx: number, tz: number, speed: number, spin: Vector3, th0: number, phi0: number, tol = 0.003): Aim {
  const dxT = tx - from.x, dzT = tz - from.z;
  const D = Math.max(0.05, Math.hypot(dxT, dzT));
  const ux = dxT / D, uz = dzT / D; // along
  let th = th0, phi = phi0;
  let thLo = NaN, eLo = 0, thHi = NaN, eHi = 0;
  let prevTh = NaN, prevE = 0;
  let tooShort = false;
  const out: Aim = { th, phi, speed, converged: false, tooShort: false, clearance: -Infinity, err: Infinity, vx: 0, vy: 0, vz: 0 };
  let bestErr = Infinity;
  for (let it = 0; it < 16; it++) {
    const ch = Math.cos(th);
    const vx = speed * Math.sin(phi) * ch, vy = speed * Math.sin(th), vz = speed * Math.cos(phi) * ch;
    const f = fly(from, vx, vy, vz, spin);
    let along: number, across: number;
    if (f.landed) {
      const ex = f.x - tx, ez = f.z - tz;
      along = ex * ux + ez * uz;
      across = ex * Math.cos(phi) - ez * Math.sin(phi);
    } else {
      along = 2; across = 0;
    }
    const err = Math.hypot(along, across);
    if (err < bestErr) {
      bestErr = err;
      out.th = th; out.phi = phi; out.vx = vx; out.vy = vy; out.vz = vz; out.err = err;
      if (!f.landed) out.clearance = -Infinity;
      else if (Number.isNaN(f.netY)) out.clearance = (from.z < 0) === (tz < 0) ? Infinity : -Infinity;
      else if (Math.abs(f.netX) > NET_HALF_W + R) out.clearance = Infinity;
      else out.clearance = f.netY - (NET_TOP + R);
    }
    if (err < tol) { out.converged = true; break; }
    if (f.landed) {
      const dl = Math.max(0.3, Math.hypot(f.x - from.x, f.z - from.z));
      phi -= clamp(across / dl, -0.3, 0.3);
    }
    // θ update
    if (along < 0) { thLo = th; eLo = along; } else { thHi = th; eHi = along; }
    let next: number;
    if (!Number.isNaN(thLo) && !Number.isNaN(thHi)) {
      next = thLo - (eLo * (thHi - thLo)) / (eHi - eLo);
      const lo = Math.min(thLo, thHi), hi = Math.max(thLo, thHi);
      if (!(next > lo && next < hi)) next = (thLo + thHi) / 2;
      // Illinois-style safeguard: if the new point is very close to an end, nudge toward the middle
      const w = hi - lo;
      if (next - lo < w * 0.02 || hi - next < w * 0.02) next = 0.8 * next + 0.2 * ((lo + hi) / 2);
    } else if (!Number.isNaN(prevTh) && Math.abs(th - prevTh) > 1e-6) {
      const slope = (along - prevE) / (th - prevTh);
      if (along < 0 && th > prevTh && slope <= 0) { tooShort = true; break; } // past the max-range angle
      next = slope > 1e-3 ? th - along / slope : th + (along < 0 ? 0.1 : -0.1);
      next = clamp(next, th - 0.25, th + 0.25);
    } else {
      next = th + (along < 0 ? 0.06 : -0.06);
    }
    if (along < 0 && th >= 1.2) { tooShort = true; break; }
    prevTh = th; prevE = along;
    th = clamp(next, -1.3, 1.2);
  }
  out.tooShort = tooShort && !out.converged;
  return out;
}

function aimToVel(a: Aim): Vector3 {
  return new Vector3(a.vx, a.vy, a.vz);
}

/** Core of solveShot without error: returns the best Aim. */
function solveExact(from: Vector3, tx: number, tz: number, speed0: number, spin: Vector3): Aim {
  let speed = clamp(speed0, 2, 35);
  const D = Math.hypot(tx - from.x, tz - from.z);
  let th = guessElevation(D, LAND_Y - from.y, speed);
  let phi = Math.atan2(tx - from.x, tz - from.z);
  let best: Aim | null = null;
  const score = (a: Aim) => (a.converged ? 0 : 10 + a.err) - Math.min(a.clearance, NET_MARGIN) * 20;
  for (let k = 0; k < 12; k++) {
    const a = solveAim(from, tx, tz, speed, spin, th, phi);
    th = a.th; phi = a.phi;
    if (!best || score(a) < score(best)) best = a;
    if (a.tooShort) {
      speed = Math.min(speed * 1.18, 35);
      th = Math.min(th, 0.6);
      continue;
    }
    if (a.converged && a.clearance >= NET_MARGIN) return a;
    if (!a.converged) {
      // likely a bad start; retry from a fresh guess at slightly lower speed
      th = guessElevation(D, LAND_Y - from.y, speed * 0.9);
    }
    if (speed <= 2.01) break;
    speed = Math.max(2, speed * (a.clearance < -0.06 ? 0.8 : 0.9));
  }
  return best!;
}

/** Launch velocity so a ball hit from `from` with req.spin lands at req.target (± error). */
export function solveShot(from: Vector3, req: ShotRequest, rng: () => number = Math.random): { vel: Vector3; spin: Vector3 } {
  const err = clamp(req.error, 0, 1);
  let tx = req.target.x, tz = req.target.z;
  let speed = req.speed;
  if (err > 0) {
    const sgn = tz < 0 ? -1 : 1;
    tx += gauss(rng) * 0.3 * err;
    const depth = Math.abs(tz) + gauss(rng) * 0.35 * err;
    tz = sgn * clamp(depth, 0.05, HALF_L + 0.9);
    tx = clamp(tx, -HALF_W - 0.7, HALF_W + 0.7);
    speed *= 1 + gauss(rng) * 0.08 * err;
  }
  const spin = req.spin.clone();
  const a = solveExact(from, tx, tz, speed, spin);
  return { vel: aimToVel(a), spin };
}

// ───────────────────────────── serve ─────────────────────────────
interface ServeOutcome { ok: boolean; depthErr: number; lx: number; lz: number; }

function simulateServe(from: Vector3, vel: Vector3, spin: Vector3, server: Side, recvDepth: number): ServeOutcome {
  const s = sideSign(server);
  const st: BallState = { pos: from, vel, spin };
  let bounces = 0;
  let net = false;
  let firstOk = false;
  let res: ServeOutcome = { ok: false, depthErr: -0.8, lx: 0, lz: 0 };
  let lastAbove = true;
  let crossed: { x: number; z: number } | null = null;
  trace(st, 2.5, 1,
    (_t, b) => {
      // track off-table descending crossing of the landing plane after the first bounce
      if (bounces >= 1 && !crossed) {
        if (b.py < LAND_Y && b.vy < 0 && lastAbove && Math.sign(b.pz) === -s) crossed = { x: b.px, z: b.pz };
        lastAbove = b.py >= LAND_Y;
      }
    },
    (e) => {
      if (e.type === EV_NET) { net = true; return false; }
      if (e.type === EV_BOUNCE || e.type === EV_EDGE) {
        bounces++;
        const onServer = Math.sign(e.z) === s || e.z === 0;
        if (bounces === 1) { firstOk = onServer; return !onServer; }
        if (onServer) { res = { ok: false, depthErr: -0.8, lx: e.x, lz: e.z }; return true; }
        res = { ok: firstOk && !net, depthErr: Math.abs(e.z) - recvDepth, lx: e.x, lz: e.z };
        return true;
      }
      if (e.type === EV_FLOOR || e.type === EV_OUT) {
        if (crossed) res = { ok: false, depthErr: Math.max(0.05, Math.abs(crossed.z) - recvDepth), lx: crossed.x, lz: crossed.z };
        else if (bounces >= 1 && Math.sign(e.z) === -s && !net) res = { ok: false, depthErr: 0.3, lx: e.x, lz: e.z };
        return true;
      }
      return false;
    });
  if (net && res.depthErr > -0.8) res = { ...res, ok: false, depthErr: Math.min(res.depthErr, -0.3) };
  return res;
}

/** Serve: first bounce on the server's half, clears the net, lands near req.target on receiver's half. */
export function solveServe(from: Vector3, server: Side, req: ShotRequest, rng: () => number = Math.random): { vel: Vector3; spin: Vector3 } {
  const s = sideSign(server);
  const err = clamp(req.error, 0, 1) * 0.6;
  let tx = req.target.x;
  let depth = Math.abs(req.target.z);
  let speed0 = req.speed;
  if (err > 0) {
    tx += gauss(rng) * 0.3 * err;
    depth += gauss(rng) * 0.3 * err;
    speed0 *= 1 + gauss(rng) * 0.06 * err;
  }
  depth = clamp(depth, 0.2, HALF_L + 0.4);
  tx = clamp(tx, -HALF_W - 0.3, HALF_W + 0.3);
  const spin = req.spin.clone();
  const long = depth > 0.9;
  const cands = long ? [1.0, 0.9, 1.1, 0.8, 0.65, 0.5] : [0.5, 0.42, 0.6, 0.35, 0.7, 0.85];
  let best: { vel: Vector3; score: number } | null = null;
  const fromDepth = Math.abs(from.z);
  const SPEEDS: number[] = [];
  for (let v = 1.6; v < 12.5; v *= 1.08) SPEEDS.push(v);
  for (const bz of cands) {
    if (bz >= fromDepth - 0.05) continue;
    const Bz = s * bz;
    // first bounce on the straight line toward the target
    const u = (fromDepth - bz) / (fromDepth + depth);
    let Bx = clamp(from.x + (tx - from.x) * u, -HALF_W + 0.08, HALF_W - 0.08);
    const evalS = (speed: number) => {
      const D = Math.hypot(Bx - from.x, Bz - from.z);
      const a = solveAim(from, Bx, Bz, speed, spin, guessElevation(D, LAND_Y - from.y, speed), Math.atan2(Bx - from.x, Bz - from.z));
      if (!a.converged) return null;
      const vel = aimToVel(a);
      const o = simulateServe(from, vel, spin, server, depth);
      const latErr = tx - o.lx;
      const score = Math.abs(o.depthErr) + (o.ok ? Math.abs(latErr) : 5);
      if (!best || score < best.score) best = { vel, score };
      return { o, vel, latErr, speed };
    };
    // Coarse scan over speed, then bisection on the depth error inside the legal region.
    let prev: ReturnType<typeof evalS> = null;
    let bracket: [number, number] | null = null;
    let bracketDist = Infinity;
    for (const sp of SPEEDS) {
      const r = evalS(sp);
      if (r && prev && r.o.ok && prev.o.ok && prev.o.depthErr <= 0 && r.o.depthErr >= 0) {
        const dist = Math.abs(Math.log(sp / speed0));
        if (dist < bracketDist) { bracket = [prev.speed, sp]; bracketDist = dist; }
      }
      prev = r;
    }
    if (bracket) {
      let [lo, hi] = bracket;
      for (let i = 0; i < 16; i++) {
        const mid = (lo + hi) / 2;
        const r = evalS(mid);
        if (!r) break;
        if (r.o.ok && Math.abs(r.latErr) < 0.03 && Math.abs(r.o.depthErr) < 0.025) return { vel: r.vel, spin };
        if (r.o.ok) Bx = clamp(Bx + r.latErr * 0.45, -HALF_W + 0.05, HALF_W - 0.05);
        if (!r.o.ok && r.o.depthErr < 0) lo = mid;
        else if (r.o.depthErr < 0) lo = mid;
        else hi = mid;
        if (hi - lo < 0.02) { lo = Math.max(1.2, lo - 0.3); hi = hi + 0.3; } // re-open after a lateral shift
      }
    }
    if (best && (best as { score: number }).score < 0.08) break;
  }
  if (best) return { vel: (best as { vel: Vector3 }).vel, spin };
  // fallback: plain shot to the receiver's half
  return solveShot(from, { target: new Vector3(tx, TABLE_TOP, -s * depth), speed: speed0, spin, error: 0 }, rng);
}

// ───────────────────────────── intercepts ─────────────────────────────
/** All hittable samples (after exactly one bounce on side's half). */
export function hittableWindow(state: BallState, side: Side, duration = 2.5, alreadyBounced = false): PathPoint[] {
  const s = sideSign(side);
  const out: PathPoint[] = [];
  // When the ball has already bounced on `side`'s half, the next bounce there ends the window.
  let mine = alreadyBounced ? 1 : 0;
  let total = alreadyBounced ? 1 : 0;
  let lastMine = alreadyBounced;
  trace(state, duration, 2,
    (t, b) => {
      if (mine !== 1 || !lastMine) return;
      const dz = s * b.pz - HALF_L;
      const h = b.py - TABLE_TOP;
      if (h >= HIT_MIN && h <= HIT_MAX && dz >= STRIKE_Z_REACH && dz <= STRIKE_Z_MAX && Math.abs(b.px) <= HALF_W + 1.2 && s * b.pz > 0) {
        out.push({ t, pos: new Vector3(b.px, b.py, b.pz), vel: new Vector3(b.vx, b.vy, b.vz), bounces: total });
      }
    },
    (e) => {
      if (e.type === EV_BOUNCE || e.type === EV_EDGE) {
        total++;
        const onMine = Math.sign(e.z) === s || (e.z === 0 && s > 0);
        lastMine = onMine;
        if (onMine) mine++;
        return mine >= 2 || (!onMine && mine >= 1);
      }
      return e.type === EV_FLOOR || e.type === EV_OUT;
    });
  return out;
}

/** Natural strike point for `side`: top-of-bounce / early-descending, behind or near the end line. */
export function findIntercept(state: BallState, side: Side, alreadyBounced = false): Intercept | null {
  const win = hittableWindow(state, side, 2.5, alreadyBounced);
  if (!win.length) return null;
  const s = sideSign(side);
  const pref = win.filter((p) => s * p.pos.z - HALF_L >= STRIKE_Z_MIN);
  const pool = pref.length ? pref : win;
  let pick = pool.find((p) => p.vel.y <= -0.3) ?? pool.find((p) => p.vel.y <= 0) ?? pool[pool.length - 1];
  return { t: pick.t, pos: pick.pos.clone(), vel: pick.vel.clone() };
}
