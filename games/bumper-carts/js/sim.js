// Bumper Carts - pure floor simulation (PLAN.md section 3). No three, no DOM, seeded RNG only.
// 2-D circles on the floor plane (x, z), fixed 1/120 s step. +x = screen right, +z = toward the camera.
// Intent y = +1 means up the screen = world -z.
//
// step(dt, intents) runs whole fixed steps (accumulator) and returns the events of PLAN 5.3:
//   charge {i, full}  dash {i, charge}  bump {a, b, power, by}  clash {a, b}  fence {panel, hp, i}
//   fall {i, by}  respawn {i}
// plus visual-only extras the engine uses: honk {i}, wall {panel, i, speed}, splash {i, x, z}.
import { ARENA, CART, CHARGE, BUMP, FENCE, MATCH } from './constants.js';

export const STEP = 1 / 120;
const PI = Math.PI, TAU = PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const wrapPi = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export const PANEL_ARC = TAU / FENCE.panels;
/** Seat start angles: P1 left, P2 right, P3 far (up the screen), P4 near. */
export const SEAT_ANGLES = Object.freeze([PI, 0, -PI / 2, PI / 2]);

/** mulberry32 */
export function rng(seed = 1) {
  let a = (seed >>> 0) || 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Index of the fence panel covering the direction of (x, z). Panel k spans angles [k, k+1) * PANEL_ARC. */
export function panelAt(x, z) {
  let a = Math.atan2(z, x);
  if (a < 0) a += TAU;
  return Math.min(FENCE.panels - 1, Math.floor(a / PANEL_ARC));
}
export const panelAngle = (k) => (k + 0.5) * PANEL_ARC;
/** Post k sits between panel k-1 and panel k. */
export const postPos = (k) => ({ x: Math.cos(k * PANEL_ARC) * FENCE.radius, z: Math.sin(k * PANEL_ARC) * FENCE.radius });
export function spawnPoint(k, n = ARENA.spawnPoints) {
  const a = (k / n) * TAU + PI / n;
  return { x: Math.cos(a) * ARENA.spawnRing, z: Math.sin(a) * ARENA.spawnRing };
}

const IDLE = Object.freeze({ live: false, x: 0, y: 0, charge: false });

function makeCart(i) {
  return {
    i, present: false,
    x: 0, z: 0, vx: 0, vz: 0, facing: 0,
    charge: 0, charging: false, dashT: 0, dashCharge: 0, cooldownT: 0, stunT: 0, safeT: 0,
    lastHitBy: -1, lastHitAt: -99,
    state: 'drive', fallT: 0, outT: 0,
    ix: 0, iz: 0,             // last world intent (for visuals / AI)
  };
}

export function stateOf(c) {
  if (c.state === 'fall' || c.state === 'out') return c.state;
  if (c.stunT > 0) return 'stun';
  if (c.dashT > 0) return 'dash';
  if (c.charging) return 'charge';
  return 'drive';
}

export class Sim {
  constructor({ seed = 1 } = {}) {
    this.carts = [0, 1, 2, 3].map(makeCart);
    this.fence = new Array(FENCE.panels).fill(FENCE.hp);
    this.active = false;
    this.kos = [0, 0, 0, 0];   // credited KOs this round (AI hint only; rules.js owns the score)
    this.acc = 0;
    this.time = 0;
    this.seed = seed;
    this.rand = rng(seed);
    this.reset(seed);
  }

  /** Carts to their seat spots, fence whole. Presence and active flag are kept. */
  reset(seed) {
    if (seed != null) { this.seed = seed >>> 0; this.rand = rng(this.seed); }
    this.time = 0;
    this.acc = 0;
    this.kos = [0, 0, 0, 0];
    this.fence.fill(FENCE.hp);
    for (const c of this.carts) this.place(c, SEAT_ANGLES[c.i], ARENA.spawnRing);
  }

  place(c, angle, r) {
    const present = c.present;
    Object.assign(c, makeCart(c.i));
    c.present = present;
    c.x = Math.cos(angle) * r;
    c.z = Math.sin(angle) * r;
    c.facing = Math.atan2(-c.z, -c.x);
  }

  setPresent(i, on) {
    const c = this.carts[i];
    if (!c) return;
    const was = c.present;
    c.present = !!on;
    if (c.present && !was) this.place(c, SEAT_ANGLES[i], ARENA.spawnRing);
  }

  setActive(on) { this.active = !!on; }

  /** BARN STORM: every standing panel falls. Returns the panel indices that dropped. */
  dropFence() {
    const dropped = [];
    for (let k = 0; k < this.fence.length; k++) if (this.fence[k] > 0) { this.fence[k] = 0; dropped.push(k); }
    return dropped;
  }

  /** Run fixed steps for `dt` seconds of time. intents[i]: CartIntent or null. Returns events. */
  step(dt, intents = []) {
    const ev = [];
    this.acc += Math.max(0, +dt || 0);
    let n = 0;
    while (this.acc >= STEP - 1e-9 && n < 30) {
      this.acc -= STEP;
      this.tick(intents, ev);
      n++;
    }
    if (n >= 30) this.acc = 0;
    return ev;
  }

  live(c) { return c.present && c.state !== 'fall' && c.state !== 'out'; }

  tick(intents, ev) {
    const h = STEP;
    this.time += h;
    const C = this.carts;
    for (const c of C) {
      if (!c.present) continue;
      if (c.state === 'fall') { this.tickFall(c, h, ev); continue; }
      if (c.state === 'out') { this.tickOut(c, h, ev); continue; }
      this.tickDrive(c, intents[c.i] || IDLE, h, ev);
    }
    // cart vs cart
    for (let a = 0; a < 4; a++) {
      if (!this.live(C[a])) continue;
      for (let b = a + 1; b < 4; b++) if (this.live(C[b])) this.collide(C[a], C[b], ev);
    }
    // fence, posts, falls
    for (const c of C) if (this.live(c)) this.fenceCheck(c, ev);
    for (const c of C) if (c.present && c.state !== 'fall' && c.state !== 'out') c.state = stateOf(c);
  }

  tickDrive(c, it, h, ev) {
    const act = this.active && !!it.live;
    let ix = act ? +it.x || 0 : 0, iy = act ? +it.y || 0 : 0;
    const im = Math.hypot(ix, iy);
    if (im > 1) { ix /= im; iy /= im; }
    const wx = ix, wz = -iy;
    c.ix = wx; c.iz = wz;
    const hold = act && !!it.charge;

    // timers
    if (c.safeT > 0) c.safeT = Math.max(0, c.safeT - h);
    if (c.stunT > 0) c.stunT = Math.max(0, c.stunT - h);
    if (c.dashT > 0) {
      c.dashT -= h;
      if (c.dashT <= 0) { c.dashT = 0; c.cooldownT = CHARGE.cooldown; }
    } else if (c.cooldownT > 0) c.cooldownT = Math.max(0, c.cooldownT - h);

    // charge / dash
    if (c.stunT > 0) {
      if (c.charging) { c.charging = false; c.charge = 0; }
    } else if (c.charging) {
      if (hold) {
        const was = c.charge;
        c.charge = Math.min(1, c.charge + h / CHARGE.time);
        if (was < 1 && c.charge >= 1) ev.push({ type: 'charge', i: c.i, full: true });
      } else {
        const ch = c.charge;
        c.charging = false; c.charge = 0;
        if (!act) { /* input lost or round stopped: cancel quietly */ }
        else if (ch < CHARGE.min) ev.push({ type: 'honk', i: c.i });
        else {
          let ax, az;
          if (im >= CART.aimDead) { const m = Math.hypot(wx, wz); ax = wx / m; az = wz / m; }
          else { ax = Math.cos(c.facing); az = Math.sin(c.facing); }
          const sp = lerp(CHARGE.dashMin, CHARGE.dashMax, ch);
          c.vx = ax * sp; c.vz = az * sp;
          c.facing = Math.atan2(az, ax);
          c.dashT = CHARGE.dashTime;
          c.dashCharge = ch;
          ev.push({ type: 'dash', i: c.i, charge: ch });
        }
      }
    } else if (hold && c.dashT <= 0 && c.cooldownT <= 0) {
      c.charging = true; c.charge = 0;
      ev.push({ type: 'charge', i: c.i, full: false });
    }

    // drive
    let accel = CART.accel, drag = CART.drag;
    if (c.stunT > 0) accel = 0;
    else if (c.dashT > 0) { accel = 0; drag *= CHARGE.dashDragMul; }
    else if (c.charging) { accel *= CHARGE.accelMul; drag *= CHARGE.dragMul; }
    c.vx += wx * accel * h; c.vz += wz * accel * h;
    const k = Math.max(0, 1 - drag * h);
    c.vx *= k; c.vz *= k;
    c.x += c.vx * h; c.z += c.vz * h;

    // facing
    let target = null;
    if (c.charging) { if (im >= CART.aimDead) target = Math.atan2(wz, wx); }
    else if (c.dashT <= 0 && Math.hypot(c.vx, c.vz) > CART.turnMinSpeed) target = Math.atan2(c.vz, c.vx);
    if (target != null) {
      const d = wrapPi(target - c.facing), mx = CART.turnRate * h;
      c.facing = wrapPi(c.facing + clamp(d, -mx, mx));
    }
  }

  collide(A, B, ev) {
    const r2 = CART.radius * 2;
    let dx = B.x - A.x, dz = B.z - A.z;
    let d = Math.hypot(dx, dz);
    if (d >= r2) return;
    let nx, nz;
    if (d < 1e-6) { nx = 1; nz = 0; d = 0; } else { nx = dx / d; nz = dz / d; }
    // separate
    const ov = (r2 - d) / 2;
    A.x -= nx * ov; A.z -= nz * ov;
    B.x += nx * ov; B.z += nz * ov;

    const closing = (A.vx - B.vx) * nx + (A.vz - B.vz) * nz;
    if (closing <= 0) return;
    const ava = { x: A.vx, z: A.vz }, bvb = { x: B.vx, z: B.vz };
    const aDash = A.dashT > 0, bDash = B.dashT > 0;
    const aChg = A.charging, bChg = B.charging;
    const aStun = A.stunT > 0, bStun = B.stunT > 0;
    const power = clamp(closing / BUMP.powerDiv, 0, 1);

    // bounce (equal mass)
    const j = (1 + BUMP.rest) / 2 * closing;
    A.vx -= j * nx; A.vz -= j * nz;
    B.vx += j * nx; B.vz += j * nz;

    if (aDash && bDash && closing > BUMP.clashClosing) {
      for (const c of [A, B]) {
        c.stunT = Math.max(c.stunT, BUMP.clashStun);
        c.dashT = 0; c.cooldownT = CHARGE.cooldown;
        c.charging = false; c.charge = 0;
      }
      A.lastHitBy = B.i; A.lastHitAt = this.time;
      B.lastHitBy = A.i; B.lastHitAt = this.time;
      ev.push({ type: 'clash', a: A.i, b: B.i });
      ev.push({ type: 'bump', a: A.i, b: B.i, power, by: -1 });
      return;
    }

    // ram bonus: s = rammer's pre-hit speed toward the victim
    const sa = Math.max(0, ava.x * nx + ava.z * nz);
    const sb = Math.max(0, -(bvb.x * nx + bvb.z * nz));
    const safe = A.safeT > 0 || B.safeT > 0;
    if (!safe) {
      const kb = BUMP.knock * sa * (aDash ? BUMP.dashMul : 1) * (bChg ? BUMP.chargeMul : 1) * (bStun ? BUMP.stunMul : 1);
      B.vx += nx * kb; B.vz += nz * kb;
      const ka = BUMP.knock * sb * (bDash ? BUMP.dashMul : 1) * (aChg ? BUMP.chargeMul : 1) * (aStun ? BUMP.stunMul : 1);
      A.vx -= nx * ka; A.vz -= nz * ka;
    }
    // a dashing rammer ploughs on
    if (aDash && sa > 0) { A.vx = ava.x * BUMP.dashKeep; A.vz = ava.z * BUMP.dashKeep; }
    if (bDash && sb > 0) { B.vx = bvb.x * BUMP.dashKeep; B.vz = bvb.z * BUMP.dashKeep; }

    const by = sa > sb + BUMP.evenMargin ? A.i : sb > sa + BUMP.evenMargin ? B.i : -1;
    if (power >= BUMP.eventMin) {
      const victims = by === A.i ? [B] : by === B.i ? [A] : [A, B];
      for (const v of victims) {
        const o = v === A ? B : A;
        if (v.safeT <= 0) {
          v.stunT = Math.max(v.stunT, BUMP.stunMin + BUMP.stunPower * power);
          v.charging = false; v.charge = 0;
          if (v.dashT > 0) { v.dashT = 0; v.cooldownT = CHARGE.cooldown; }
        }
        if (power > BUMP.creditPower) { v.lastHitBy = o.i; v.lastHitAt = this.time; }
      }
      ev.push({ type: 'bump', a: A.i, b: B.i, power, by });
    }
  }

  fenceCheck(c, ev) {
    const R = FENCE.radius, r = CART.radius;
    let d = Math.hypot(c.x, c.z);
    if (d < R - r - FENCE.postRadius - 0.05) return;
    // posts (static circles, never break)
    const pr = r + FENCE.postRadius;
    for (let k = 0; k < FENCE.panels; k++) {
      const p = postPos(k);
      const dx = c.x - p.x, dz = c.z - p.z, dd = Math.hypot(dx, dz);
      if (dd >= pr || dd < 1e-6) continue;
      const nx = dx / dd, nz = dz / dd;
      c.x = p.x + nx * pr; c.z = p.z + nz * pr;
      const vn = c.vx * nx + c.vz * nz;
      if (vn < 0) { c.vx -= (1 + FENCE.rest) * vn * nx; c.vz -= (1 + FENCE.rest) * vn * nz; }
    }
    d = Math.hypot(c.x, c.z);
    if (d < 1e-6) return;
    const nx = c.x / d, nz = c.z / d;
    const k = panelAt(c.x, c.z);
    const standing = this.fence[k] > 0;
    const wall = standing || c.safeT > 0;    // a blinking cart cannot be knocked out
    if (wall && d <= R && d + r > R) {
      const vn = c.vx * nx + c.vz * nz;
      let through = false;
      if (vn > 0) {
        if (standing && c.safeT <= 0 && vn > FENCE.breakSpeed) {
          this.fence[k]--;
          ev.push({ type: 'fence', panel: k, hp: this.fence[k], i: c.i });
          through = this.fence[k] === 0;
        } else if (vn > FENCE.wallEvent) ev.push({ type: 'wall', panel: k, i: c.i, speed: vn });
        if (!through) { c.vx -= (1 + FENCE.rest) * vn * nx; c.vz -= (1 + FENCE.rest) * vn * nz; }
      }
      if (!through) { c.x = nx * (R - r); c.z = nz * (R - r); }
    } else if (wall && d > R && c.safeT > 0) {
      c.x = nx * (R - r); c.z = nz * (R - r);
    }
    d = Math.hypot(c.x, c.z);
    if (d > ARENA.fallLine && c.safeT <= 0) this.startFall(c, ev);
  }

  startFall(c, ev) {
    c.state = 'fall';
    c.fallT = 0;
    c.charging = false; c.charge = 0; c.dashT = 0; c.stunT = 0; c.cooldownT = 0;
    const credit = c.lastHitBy >= 0 && c.lastHitBy !== c.i && this.time - c.lastHitAt <= BUMP.creditWindow;
    const by = credit ? c.lastHitBy : -1;
    if (by >= 0) this.kos[by]++;
    ev.push({ type: 'fall', i: c.i, by });
  }

  tickFall(c, h, ev) {
    const d = Math.hypot(c.x, c.z) || 1;
    const nx = c.x / d, nz = c.z / d;
    const vr = c.vx * nx + c.vz * nz;
    if (vr < MATCH.fallMinOut) { c.vx += nx * (MATCH.fallMinOut - vr); c.vz += nz * (MATCH.fallMinOut - vr); }
    const k = Math.max(0, 1 - 1.2 * h);
    c.vx *= k; c.vz *= k;
    c.x += c.vx * h; c.z += c.vz * h;
    const maxR = ARENA.moatOuter - 0.8, dd = Math.hypot(c.x, c.z);
    if (dd > maxR) { c.x *= maxR / dd; c.z *= maxR / dd; }
    c.fallT += h;
    if (c.fallT >= MATCH.fallTime) {
      c.state = 'out';
      c.outT = MATCH.respawn;
      c.vx = 0; c.vz = 0;
      ev.push({ type: 'splash', i: c.i, x: c.x, z: c.z });
    }
  }

  tickOut(c, h, ev) {
    c.outT -= h;
    if (c.outT > 0) return;
    // the spawn point farthest from every other cart on the floor
    let best = -1, bestD = -1;
    const off = Math.floor(this.rand() * ARENA.spawnPoints);
    for (let n = 0; n < ARENA.spawnPoints; n++) {
      const k = (n + off) % ARENA.spawnPoints;
      const p = spawnPoint(k);
      let m = 99;
      for (const o of this.carts) if (o !== c && this.live(o)) m = Math.min(m, Math.hypot(o.x - p.x, o.z - p.z));
      if (m > bestD + 1e-6) { bestD = m; best = k; }
    }
    const p = spawnPoint(best);
    const present = c.present;
    Object.assign(c, makeCart(c.i));
    c.present = present;
    c.x = p.x; c.z = p.z;
    c.facing = Math.atan2(-c.z, -c.x);
    c.safeT = MATCH.safeTime;
    c.state = 'drive';
    ev.push({ type: 'respawn', i: c.i });
  }

  edgeOf(c) { return clamp(Math.hypot(c.x, c.z) / ARENA.radius, 0, 1); }

  snapshot() {
    return {
      carts: this.carts.filter((c) => c.present).map((c) => ({
        i: c.i, x: c.x, z: c.z, state: c.state, charge: c.charge, safe: c.safeT > 0, edge: this.edgeOf(c),
      })),
      fence: this.fence.slice(),
    };
  }
}
