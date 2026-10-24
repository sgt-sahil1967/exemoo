/**
 * SPINSHOT — shared ball integration core (internal to src/physics).
 *
 * Everything that moves a ball — the live `Ball`, `predictPath`, the shot solver and the intercept
 * finder — goes through `integrate()` / `advance()` here, so predictions match the live sim exactly.
 *
 * Model
 *  - Fixed sub-step SUBSTEP = 1/720 s (divides 60/72/90/120/144/240 Hz frames evenly).
 *  - Midpoint (RK2) integration of gravity + quadratic drag + Magnus lift; exponential spin decay.
 *  - Far from obstacles a sub-step is one RK2 step. Near the table / net / posts / floor the sub-step is
 *    split into micro-steps of ≤ 4 mm travel and sphere-vs-box contacts are resolved with time
 *    back-tracking (rewind to the moment of contact, apply the impulse, re-advance), so thin objects
 *    (the net is 3 mm thick) can never be tunnelled through.
 *  - Contact impulse model: normal restitution + Coulomb friction on the contact-point slip velocity,
 *    limited to the roll-without-slip impulse, with angular-momentum transfer for a thin spherical
 *    shell (I = 2/3·m·r²). This couples spin and surface velocity: topspin kicks forward and low,
 *    backspin checks, sidespin (game-tuned) kicks sideways.
 *
 * Plain-number state, no allocations in the hot path.
 */
import { BALL, GRAVITY, HALF_L, HALF_W, TABLE } from '../core/contracts';

export const SUBSTEP = 1 / 720;
export const R = BALL.radius;

// ─── Aerodynamics ───
const AIR_DENSITY = 1.2;
const CD = 0.5;
const AREA = Math.PI * R * R;
/** Drag: a = −K_DRAG·|v|·v  (≈ 0.279 1/m). */
export const K_DRAG = (0.5 * AIR_DENSITY * CD * AREA) / BALL.mass;
/** Magnus: a = K_MAGNUS·(ω × v). Game-tuned (≈ C_L = 0.45·rω/v); 600 rad/s at 10 m/s ≈ 1.8 g. */
export const K_MAGNUS = 0.003;
/** Lift saturation (C_L ≤ 0.6). */
const MAGNUS_CAP = (0.5 * AIR_DENSITY * AREA * 0.6) / BALL.mass;
/** Spin decay rate in flight, 1/s. */
export const SPIN_DECAY = 0.25;
const DECAY_SUBSTEP = Math.exp(-SPIN_DECAY * SUBSTEP);

// ─── Geometry ───
export const TABLE_TOP = TABLE.height;
export const NET_TOP = TABLE.height + TABLE.netHeight;
export const NET_HALF_W = HALF_W + TABLE.netOverhang;
const NET_HALF_T = 0.0015;
const POST_HALF = 0.012;
const TABLE_BOTTOM = TABLE.height - TABLE.thickness;

// ─── Contact parameters ───
const TABLE_MU = 0.25;
const EDGE_E = 0.65;
const FLOOR_E = 0.62;
const FLOOR_MU = 0.4;
const POST_E = 0.5;
const MESH_E = 0.12;
/** Sideways kick from sidespin on a table bounce, m/s per rad/s. */
const SIDE_KICK = 0.0012;
/** Table restitution: ≈0.89 at typical impact, a bit lower for hard impacts. */
export function tableRestitution(vn: number): number {
  return Math.min(0.93, Math.max(0.8, 0.93 - 0.012 * vn));
}

/** Out-of-play volume. */
const OUT_X = 8;
const OUT_Z = 12;
const OUT_Y = 15;

// ─── Event codes ───
export const EV_BOUNCE = 0;
export const EV_EDGE = 1;
export const EV_NET = 2;
export const EV_FLOOR = 3;
export const EV_OUT = 4;
export type EvCode = 0 | 1 | 2 | 3 | 4;
/** x,y,z = contact point (table/floor: on the surface; net: ball centre). */
export type EventSink = (type: EvCode, x: number, y: number, z: number, speed: number) => void;

export interface SimBody {
  px: number; py: number; pz: number;
  vx: number; vy: number; vz: number;
  wx: number; wy: number; wz: number;
  /** In contact with net/posts during the previous micro-step (debounces 'net' events). */
  netTouch: boolean;
  /** Rolling over the net tape after a cord touch (net collisions suspended until clear). */
  cordPass: boolean;
  /** Ball has stopped (resting on floor) or left the play volume. */
  done: boolean;
}

export function makeBody(): SimBody {
  return { px: 0, py: 0, pz: 0, vx: 0, vy: 0, vz: 0, wx: 0, wy: 0, wz: 0, netTouch: false, cordPass: false, done: false };
}

export function copyBody(dst: SimBody, src: SimBody): SimBody {
  dst.px = src.px; dst.py = src.py; dst.pz = src.pz;
  dst.vx = src.vx; dst.vy = src.vy; dst.vz = src.vz;
  dst.wx = src.wx; dst.wy = src.wy; dst.wz = src.wz;
  dst.netTouch = src.netTouch; dst.cordPass = src.cordPass; dst.done = src.done;
  return dst;
}

// ─── Flight ───
let AX = 0, AY = 0, AZ = 0;
function accel(vx: number, vy: number, vz: number, wx: number, wy: number, wz: number): void {
  const v2 = vx * vx + vy * vy + vz * vz;
  const sp = Math.sqrt(v2);
  const kd = K_DRAG * sp;
  const mx = wy * vz - wz * vy;
  const my = wz * vx - wx * vz;
  const mz = wx * vy - wy * vx;
  let km = K_MAGNUS;
  const m2 = mx * mx + my * my + mz * mz;
  if (m2 > 0) {
    const mag = km * Math.sqrt(m2);
    const cap = MAGNUS_CAP * v2;
    if (mag > cap) km *= cap / mag;
  }
  AX = -kd * vx + km * mx;
  AY = -GRAVITY - kd * vy + km * my;
  AZ = -kd * vz + km * mz;
}

/** One RK2 (midpoint) flight step of length h. Spin decays exponentially. */
export function integrate(b: SimBody, h: number, decay = h === SUBSTEP ? DECAY_SUBSTEP : Math.exp(-SPIN_DECAY * h)): void {
  accel(b.vx, b.vy, b.vz, b.wx, b.wy, b.wz);
  const hh = h * 0.5;
  const mvx = b.vx + AX * hh, mvy = b.vy + AY * hh, mvz = b.vz + AZ * hh;
  accel(mvx, mvy, mvz, b.wx, b.wy, b.wz);
  b.px += mvx * h; b.py += mvy * h; b.pz += mvz * h;
  b.vx += AX * h; b.vy += AY * h; b.vz += AZ * h;
  b.wx *= decay; b.wy *= decay; b.wz *= decay;
}

// ─── Contacts ───
let CX = 0, CY = 0, CZ = 0;
/** Distance from point to an axis-aligned box; closest point left in CX/CY/CZ. */
function boxDist(px: number, py: number, pz: number, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number): number {
  CX = px < x0 ? x0 : px > x1 ? x1 : px;
  CY = py < y0 ? y0 : py > y1 ? y1 : py;
  CZ = pz < z0 ? z0 : pz > z1 ? z1 : pz;
  const dx = px - CX, dy = py - CY, dz = pz - CZ;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
const tableDist = (b: SimBody) => boxDist(b.px, b.py, b.pz, -HALF_W, HALF_W, TABLE_BOTTOM, TABLE_TOP, -HALF_L, HALF_L);
const netDist = (b: SimBody) => boxDist(b.px, b.py, b.pz, -NET_HALF_W, NET_HALF_W, TABLE_TOP, NET_TOP, -NET_HALF_T, NET_HALF_T);
const postDist = (b: SimBody, s: 1 | -1) =>
  s > 0
    ? boxDist(b.px, b.py, b.pz, NET_HALF_W, NET_HALF_W + 2 * POST_HALF, TABLE_TOP - 0.03, NET_TOP + 0.01, -POST_HALF, POST_HALF)
    : boxDist(b.px, b.py, b.pz, -NET_HALF_W - 2 * POST_HALF, -NET_HALF_W, TABLE_TOP - 0.03, NET_TOP + 0.01, -POST_HALF, POST_HALF);

/**
 * Impulse response at a contact with outward normal n (unit). e = normal restitution, mu = friction.
 * kick = sidespin kick coefficient (table only).
 */
function respond(b: SimBody, nx: number, ny: number, nz: number, e: number, mu: number, kick: number): void {
  const vn = b.vx * nx + b.vy * ny + b.vz * nz;
  if (vn >= 0) return;
  // contact arm rc = −R·n; contact point velocity u = v + ω × rc
  const rcx = -R * nx, rcy = -R * ny, rcz = -R * nz;
  const ux = b.vx + (b.wy * rcz - b.wz * rcy);
  const uy = b.vy + (b.wz * rcx - b.wx * rcz);
  const uz = b.vz + (b.wx * rcy - b.wy * rcx);
  const un = ux * nx + uy * ny + uz * nz;
  const tx = ux - un * nx, ty = uy - un * ny, tz = uz - un * nz;
  const slip = Math.sqrt(tx * tx + ty * ty + tz * tz);
  // tangential travel direction (before the impulse) for the sidespin kick
  const vtx = b.vx - vn * nx, vty = b.vy - vn * ny, vtz = b.vz - vn * nz;
  const vt = Math.sqrt(vtx * vtx + vty * vty + vtz * vtz);

  const jn = -(1 + e) * vn; // per unit mass
  b.vx += jn * nx; b.vy += jn * ny; b.vz += jn * nz;
  if (slip > 1e-9) {
    // Roll-without-slip impulse for a thin shell is slip/2.5; Coulomb-limited by mu·jn.
    const jt = Math.min(slip / 2.5, mu * jn);
    const jx = (-tx / slip) * jt, jy = (-ty / slip) * jt, jz = (-tz / slip) * jt;
    b.vx += jx; b.vy += jy; b.vz += jz;
    const k = 1.5 / (R * R); // 1/(I/m) for a thin shell
    b.wx += (rcy * jz - rcz * jy) * k;
    b.wy += (rcz * jx - rcx * jz) * k;
    b.wz += (rcx * jy - rcy * jx) * k;
  }
  if (kick > 0 && vt > 0.05) {
    // Sidespin (spin about the normal) kicks sideways, same way it curves in the air.
    const wn = b.wx * nx + b.wy * ny + b.wz * nz;
    const ix = vtx / vt, iy = vty / vt, iz = vtz / vt;
    const sx = ny * iz - nz * iy, sy = nz * ix - nx * iz, sz = nx * iy - ny * ix; // n × v̂t
    const k = kick * wn;
    b.vx += sx * k; b.vy += sy * k; b.vz += sz * k;
    const keep = -0.15 * wn;
    b.wx += keep * nx; b.wy += keep * ny; b.wz += keep * nz;
  }
}

/** Rewind to contact (pen along normal), apply response, re-advance. Returns impact speed. */
function resolve(
  b: SimBody, d: number, hm: number,
  e: (vn: number) => number, mu: number, kick: number,
): { nx: number; ny: number; nz: number; vn: number; hit: boolean } {
  let nx: number, ny: number, nz: number;
  if (d > 1e-9) {
    nx = (b.px - CX) / d; ny = (b.py - CY) / d; nz = (b.pz - CZ) / d;
  } else {
    nx = 0; ny = 1; nz = 0; // centre inside box (should not happen) → push up
  }
  const vn = b.vx * nx + b.vy * ny + b.vz * nz;
  const pen = R - d;
  if (vn >= 0) {
    // separating but overlapping: positional correction only
    b.px += nx * pen; b.py += ny * pen; b.pz += nz * pen;
    RES.nx = nx; RES.ny = ny; RES.nz = nz; RES.vn = vn; RES.hit = false;
    return RES;
  }
  const tb = Math.min(hm, pen / -vn);
  b.px -= b.vx * tb; b.py -= b.vy * tb; b.pz -= b.vz * tb;
  respond(b, nx, ny, nz, e(-vn), mu, kick);
  b.px += b.vx * tb; b.py += b.vy * tb; b.pz += b.vz * tb;
  // guard against residual overlap
  RES.nx = nx; RES.ny = ny; RES.nz = nz; RES.vn = vn; RES.hit = true;
  return RES;
}
const RES = { nx: 0, ny: 0, nz: 0, vn: 0, hit: false };

const speedOf = (b: SimBody) => Math.sqrt(b.vx * b.vx + b.vy * b.vy + b.vz * b.vz);

function tableE(vn: number, b: SimBody): number {
  // Slightly lower (skidding) for topspin, slightly higher for backspin ("checks up").
  const vh = Math.hypot(b.vx, b.vz);
  let top = 0;
  if (vh > 0.1) top = (((b.wx * b.vz - b.wz * b.vx) / vh) * R) / vh; // ω·(ŷ×v̂)·R/v (topspin > 0)
  top = Math.max(-1, Math.min(1, top));
  return tableRestitution(vn) * (1 - 0.03 * top);
}

function collide(b: SimBody, hm: number, sink: EventSink | null): void {
  // Table
  let d = tableDist(b);
  if (d < R) {
    const above = b.py > TABLE_TOP;
    const onTop = above && Math.abs(b.px) <= HALF_W && Math.abs(b.pz) <= HALF_L;
    if (onTop) {
      if (b.vy < -0.06) {
        const speed = speedOf(b);
        const tb = Math.min(hm, (R - d) / -b.vy);
        const cx = b.px - b.vx * tb, cz = b.pz - b.vz * tb;
        const bb = b;
        // Game-tuned grip: heavily spun balls bite harder (topspin kicks on, backspin checks).
        const spinRatio = (R * Math.hypot(b.wx, b.wz)) / Math.max(Math.hypot(b.vx, b.vz), 1);
        resolve(b, d, hm, (v) => tableE(v, bb), TABLE_MU * (1 + 0.8 * Math.min(1.5, spinRatio)), SIDE_KICK);
        if (sink) sink(EV_BOUNCE, cx, TABLE_TOP, cz, speed);
      } else {
        // resting / rolling on the table
        b.py = TABLE_TOP + R;
        if (b.vy < 0) b.vy = 0;
        rollFriction(b, hm, 0.4);
      }
    } else {
      const speed = speedOf(b);
      const cx = CX, cy = CY, cz = CZ;
      const r = resolve(b, d, hm, () => EDGE_E, 0.3, 0);
      // A top-edge clip (contact on the top perimeter while above the surface) counts as a bounce.
      if (r.hit && r.ny > 0.1 && cy >= TABLE_TOP - 1e-6 && sink) sink(EV_EDGE, cx, cy, cz, speed);
    }
  }
  // Net + posts
  let touching = false;
  d = netDist(b);
  if (d < R) {
    touching = true;
    const speed = speedOf(b);
    if (!b.netTouch && sink) sink(EV_NET, b.px, b.py, b.pz, speed);
    if (b.cordPass) {
      // already rolling over the tape: let it go
    } else if (b.py > NET_TOP - 0.004) {
      // Net cord (game-tuned): the higher the ball meets the tape, the more it keeps going over.
      const q = (b.py - (NET_TOP - 0.004)) / (R + 0.004); // 0 … 1
      const dir = Math.sign(b.vz) || 1;
      if (q > 0.3 && b.pz * dir < 0) {
        const keep = 0.15 + 0.5 * q;
        b.vz *= keep;
        b.vx *= 0.7;
        b.vy = Math.max(b.vy, 0) * 0.3 + 0.9 * q;
        b.wx *= 0.5; b.wy *= 0.6; b.wz *= 0.5;
        b.cordPass = true;
      } else if (b.pz * dir < 0 || Math.abs(b.pz) <= NET_HALF_T) {
        // falls back toward the hitter
        b.vz *= -0.18;
        b.vx *= 0.6;
        b.vy = b.vy * 0.4 + 0.3 * q;
        b.wx *= 0.5; b.wy *= 0.6; b.wz *= 0.5;
        b.pz = -dir * Math.max(Math.abs(b.pz), Math.sqrt(Math.max(0, R * R - (b.py - NET_TOP) ** 2)) + NET_HALF_T);
      }
    } else {
      resolve(b, d, hm, () => MESH_E, 0, 0);
      // the mesh soaks up energy
      b.vx *= 0.35; b.vy *= 0.35; b.vz *= 0.6;
      b.wx *= 0.4; b.wy *= 0.4; b.wz *= 0.4;
    }
  } else b.cordPass = false;
  for (const s of [1, -1] as const) {
    d = postDist(b, s);
    if (d < R) {
      const speed = speedOf(b);
      if (!b.netTouch && !touching && sink) sink(EV_NET, b.px, b.py, b.pz, speed);
      resolve(b, d, hm, () => POST_E, 0.2, 0);
      touching = true;
    }
  }
  b.netTouch = touching;
  // Floor
  if (b.py < R) {
    if (b.vy < -0.3) {
      const speed = speedOf(b);
      const tb = Math.min(hm, (R - b.py) / -b.vy);
      const cx = b.px - b.vx * tb, cz = b.pz - b.vz * tb;
      CX = b.px; CY = 0; CZ = b.pz;
      resolve(b, b.py, hm, () => FLOOR_E, FLOOR_MU, 0);
      if (sink) sink(EV_FLOOR, cx, 0, cz, speed);
    } else {
      b.py = R;
      if (b.vy < 0) b.vy = 0;
      rollFriction(b, hm, 0.8);
      if (Math.hypot(b.vx, b.vz) < 0.03) {
        b.vx = 0; b.vz = 0; b.vy = 0;
        b.done = true;
      }
    }
  }
}

function rollFriction(b: SimBody, h: number, decel: number): void {
  const v = Math.hypot(b.vx, b.vz);
  if (v < 1e-6) return;
  const k = Math.max(0, 1 - (decel * h) / v);
  b.vx *= k; b.vz *= k;
  // roll: spin follows surface velocity
  b.wx = b.vz / R; b.wz = -b.vx / R;
}

/** Is the ball within `m` of any obstacle (table, net, posts, floor)? */
function near(b: SimBody, m: number): boolean {
  if (b.py - R < m) return true;
  const lim = R + m;
  if (tableDist(b) < lim) return true;
  if (Math.abs(b.pz) < lim + POST_HALF && b.py < NET_TOP + lim + 0.01) {
    if (netDist(b) < lim || postDist(b, 1) < lim || postDist(b, -1) < lim) return true;
  }
  return false;
}

const MICRO = 0.004;

/** Advance one SUBSTEP with collisions. Events go to sink in chronological order. */
export function advance(b: SimBody, sink: EventSink | null): void {
  if (b.done) return;
  const sp = speedOf(b);
  const disp = sp * SUBSTEP;
  if (near(b, disp + 0.01)) {
    const n = Math.min(64, Math.max(1, Math.ceil(disp / MICRO)));
    const hm = SUBSTEP / n;
    const decay = Math.exp(-SPIN_DECAY * hm);
    for (let i = 0; i < n && !b.done; i++) {
      integrate(b, hm, decay);
      collide(b, hm, sink);
    }
  } else {
    integrate(b, SUBSTEP, DECAY_SUBSTEP);
    b.netTouch = false;
  }
  if (!b.done && (Math.abs(b.px) > OUT_X || Math.abs(b.pz) > OUT_Z || b.py > OUT_Y)) {
    b.done = true;
    if (sink) sink(EV_OUT, b.px, b.py, b.pz, sp);
  }
}

// ─── Pure flight to a plane (solver) ───
export interface FlightResult {
  landed: boolean;
  /** Landing point on plane y = planeY (descending crossing). */
  x: number; z: number; t: number;
  /** Ball-centre height when crossing z = 0 (NaN if it did not cross before landing). */
  netY: number;
  netX: number;
}
export const FLIGHT: FlightResult = { landed: false, x: 0, z: 0, t: 0, netY: NaN, netX: NaN };

/**
 * Collision-free flight with the same integrator, until the ball crosses plane y = planeY going down
 * (after having been above it). Linear interpolation inside the final step.
 */
export function flyToPlane(b: SimBody, planeY: number, maxT: number): FlightResult {
  const f = FLIGHT;
  f.landed = false; f.netY = NaN; f.netX = NaN; f.t = 0;
  let wasAbove = b.py >= planeY;
  const steps = Math.ceil(maxT / SUBSTEP);
  for (let i = 0; i < steps; i++) {
    const px = b.px, py = b.py, pz = b.pz;
    integrate(b, SUBSTEP, DECAY_SUBSTEP);
    if (Number.isNaN(f.netY) && (pz < 0) !== (b.pz < 0) && pz !== 0) {
      const u = pz / (pz - b.pz);
      f.netY = py + (b.py - py) * u;
      f.netX = px + (b.px - px) * u;
    }
    if (b.py < planeY && b.vy < 0 && wasAbove) {
      const u = (py - planeY) / (py - b.py);
      f.x = px + (b.px - px) * u;
      f.z = pz + (b.pz - pz) * u;
      f.t = (i + u) * SUBSTEP;
      f.landed = true;
      return f;
    }
    if (b.py >= planeY) wasAbove = true;
  }
  f.t = maxT;
  f.x = b.px; f.z = b.pz;
  return f;
}
