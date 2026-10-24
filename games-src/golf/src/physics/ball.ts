/**
 * Golf ball simulation (implements BallSim from src/core/contracts.ts).
 *
 * Conventions
 *  - `state.pos` is the ball's CONTACT POINT: at rest, pos.y === hole.heightAt(pos.x, pos.z).
 *    The renderer should draw the sphere centre at pos.y + BALL.radius.
 *  - Phases: 'flight' from strike until first ground contact; 'rolling' afterwards (including
 *    small bounces/hops); then 'rest' | 'holed' | 'water' | 'ob'.
 *  - Fixed internal sub-step ≤ 2 ms; step(dt) is stable for any dt (clamped to 0.25 s).
 *
 * Full shots: the launch speed for a target carry is found by inverting a per-club table of
 * carry-vs-speed (computed lazily on flat ground, no wind), so with power 1, curve 0, quality 1,
 * lie fairway each club carries exactly CLUBS[i].carryYards. Target carry =
 *   carryYards × powerScale(power) × lieMul × qualityMul
 * where powerScale is linear up to 1 and adds up to +8 % at power 1.15 (overswing); lieMul is
 * SURFACES[lie].lieDistance (sand with PW/SW: 0.85). quality < 0.4 is a topped/thin strike:
 * lower launch, less spin, much less carry. `curve` tilts the spin axis (±1 ≈ 30 yd bend with the
 * driver, ~10 yd with wedges).
 *
 * PUTTS (club 'PT'): the ball rolls from the start (no flight). `ShotInput.power × 14 m`
 * (PUTT_RANGE_M.medium) is the distance the ball would roll on a FLAT GREEN — the game scales
 * power by its selected range (power = wantedMetres / 14). See puttSpeedFor(). Off the green
 * (fringe / fairway) the higher rolling resistance makes the same stroke go shorter. `curve`
 * pushes/pulls the start line by up to ±2.3°; quality < 1 loses up to 10 % speed.
 */
import { Vector3 } from 'three';
import type { BallEvent, BallSim, BallState, ClubId, Hole, ShotInput, Surface, Tree, Wind } from '../core/contracts';
import { BALL, CUP_RADIUS, GRAVITY, PUTT_RANGE_M, SURFACES, YARD, clubById } from '../core/contracts';

// ─────────────────────────────────────── Tuning ──────────────────────────────────────
const DT = 0.002;
const KAIR = (0.5 * 1.2 * Math.PI * BALL.radius * BALL.radius) / BALL.mass; // ½ρA/m
const SPIN_TAU = 22; // s, spin decay time constant in flight
const WIND_GAIN = 0.7; // fraction of nominal wind acting on the ball (gusts/height averaged)
const ROLL_QUAD = 0.04; // extra rolling deceleration ∝ v² (grass drag on fast-rolling balls)
const REST_SPEED = 0.05;
const MAX_TIME = 40;
const CAP_SPEED = 1.65; // cup capture speed at dead centre (m/s)
const FLAG_HEIGHT = 2.3;
const FLAG_RADIUS = 0.012;

/** Launch angle (deg) per club at a pure strike. */
const LAUNCH_DEG: Record<ClubId, number> = {
  '1W': 14, '3W': 12.5, '5W': 13.5, '4I': 15, '5I': 16.5, '6I': 18, '7I': 20, '8I': 22.5,
  '9I': 25.5, PW: 31, SW: 37, PT: 0,
};
/** Max spin-axis tilt (rad) at |curve| = 1. */
const TILT_MAX: Record<ClubId, number> = {
  '1W': 0.36, '3W': 0.3, '5W': 0.27, '4I': 0.25, '5I': 0.24, '6I': 0.24, '7I': 0.24, '8I': 0.24,
  '9I': 0.24, PW: 0.24, SW: 0.26, PT: 0,
};
/** How strongly backspin bites on the first landing, per surface. */
const SPIN_GRIP: Partial<Record<Surface, number>> = { green: 0.22, fringe: 0.16, fairway: 0.12, tee: 0.12 };

const cd = (S: number) => 0.235 + 0.18 * S;
const cl = (S: number) => 0.4 * (1 - Math.exp(-S / 0.2));

/** Initial roll speed so a putt rolls `distanceM` on a flat green. */
export function puttSpeedFor(distanceM: number): number {
  const a = SURFACES.green.rollDecel;
  const d = Math.max(0, distanceM);
  return Math.sqrt(((Math.exp(2 * ROLL_QUAD * d) - 1) * a) / ROLL_QUAD);
}

// ───────────────────────────────── Calibration tables ────────────────────────────────
interface Table {
  speeds: number[];
  carries: number[];
}
const tables = new Map<ClubId, Table>();
const SPEED_MIN = 2;
const SPEED_MAX = 100;
const SPEED_STEPS = 66;

const _p = new Vector3();
const _v = new Vector3();
const _w = new Vector3();
const _a = new Vector3();
const _t = new Vector3();
const ZERO = new Vector3();

/** Flight acceleration into `out`. */
function flightAccel(v: Vector3, w: Vector3, wind: Vector3, out: Vector3): Vector3 {
  const rx = v.x - wind.x;
  const ry = v.y - wind.y;
  const rz = v.z - wind.z;
  const sp = Math.sqrt(rx * rx + ry * ry + rz * rz);
  out.set(0, -GRAVITY, 0);
  if (sp < 1e-6) return out;
  const om = w.length();
  const S = (om * BALL.radius) / sp;
  const kd = KAIR * cd(S) * sp;
  out.x -= kd * rx;
  out.y -= kd * ry;
  out.z -= kd * rz;
  if (om > 1e-6) {
    // ω̂ × v_rel, scaled to |v|² · Cl · KAIR
    const cx = w.y * rz - w.z * ry;
    const cy = w.z * rx - w.x * rz;
    const cz = w.x * ry - w.y * rx;
    const cm = Math.sqrt(cx * cx + cy * cy + cz * cz);
    if (cm > 1e-9) {
      const k = (KAIR * cl(S) * sp * sp) / cm;
      out.x += k * cx;
      out.y += k * cy;
      out.z += k * cz;
    }
  }
  return out;
}

interface LaunchParams {
  speed: number;
  launchRad: number;
  spinRad: number; // rad/s
  yaw: number;
  tilt: number;
}

function launchVectors(p: LaunchParams, vel: Vector3, spin: Vector3) {
  const fx = -Math.sin(p.yaw);
  const fz = -Math.cos(p.yaw);
  const ch = Math.cos(p.launchRad);
  vel.set(fx * ch * p.speed, Math.sin(p.launchRad) * p.speed, fz * ch * p.speed);
  // right = (cos yaw, 0, −sin yaw); slice (tilt > 0) → force toward +right
  const rx = Math.cos(p.yaw);
  const rz = -Math.sin(p.yaw);
  const c = Math.cos(p.tilt);
  const s = Math.sin(p.tilt);
  spin.set(rx * c * p.spinRad, -s * p.spinRad, rz * c * p.spinRad);
}

function spinFor(clubId: ClubId, speed: number): number {
  const c = clubById(clubId);
  return ((c.spinRpm * (speed / c.ballSpeed)) * 2 * Math.PI) / 60;
}

/** Flat-ground, windless flight; returns carry (m) and apex height (m). */
export function simulateFlat(clubId: ClubId, speed: number, launchDeg = LAUNCH_DEG[clubId], tilt = 0, wind = ZERO) {
  launchVectors({ speed, launchRad: (launchDeg * Math.PI) / 180, spinRad: spinFor(clubId, speed), yaw: 0, tilt }, _v, _w);
  _p.set(0, 0, 0);
  let apex = 0;
  for (let t = 0; t < 20; t += DT) {
    flightAccel(_v, _w, wind, _a);
    _v.addScaledVector(_a, DT);
    const py = _p.y;
    _p.addScaledVector(_v, DT);
    _w.multiplyScalar(1 - DT / SPIN_TAU);
    apex = Math.max(apex, _p.y);
    if (_p.y <= 0 && _v.y < 0) {
      const f = py / Math.max(1e-9, py - _p.y);
      const x = _p.x - _v.x * DT * (1 - f);
      const z = _p.z - _v.z * DT * (1 - f);
      return { carry: Math.hypot(x, z), apex, x, z, vel: _v.clone(), time: t };
    }
  }
  return { carry: Math.hypot(_p.x, _p.z), apex, x: _p.x, z: _p.z, vel: _v.clone(), time: 20 };
}

function tableFor(clubId: ClubId): Table {
  let t = tables.get(clubId);
  if (!t) {
    t = { speeds: [], carries: [] };
    for (let i = 0; i <= SPEED_STEPS; i++) {
      const s = SPEED_MIN + ((SPEED_MAX - SPEED_MIN) * i) / SPEED_STEPS;
      t.speeds.push(s);
      t.carries.push(simulateFlat(clubId, s).carry);
    }
    tables.set(clubId, t);
  }
  return t;
}

/** Launch speed (m/s) that carries `carryM` on flat ground with no wind. */
export function speedForCarry(clubId: ClubId, carryM: number): number {
  const t = tableFor(clubId);
  const c = t.carries;
  if (carryM <= c[0]) return (t.speeds[0] * Math.max(0, carryM)) / Math.max(1e-6, c[0]);
  for (let i = 1; i < c.length; i++) {
    if (carryM <= c[i]) {
      const f = (carryM - c[i - 1]) / Math.max(1e-6, c[i] - c[i - 1]);
      return t.speeds[i - 1] + f * (t.speeds[i] - t.speeds[i - 1]);
    }
  }
  return t.speeds[t.speeds.length - 1];
}

/** Launch angle (deg) for a pure strike with a club. */
export const launchAngleDeg = (id: ClubId) => LAUNCH_DEG[id];

function gauss(rng: () => number): number {
  const u = Math.max(1e-12, rng());
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function lieMultiplier(club: ClubId, lie: Surface): number {
  if (lie === 'sand' && (club === 'SW' || club === 'PW')) return 0.85;
  const m = SURFACES[lie].lieDistance;
  return m > 0 ? m : 1;
}

function powerScale(power: number): number {
  const p = Math.max(0, Math.min(1.15, power));
  return p <= 1 ? p : 1 + ((p - 1) / 0.15) * 0.08;
}

// ─────────────────────────────────────── Engine ──────────────────────────────────────

/** Mutable simulation core shared by the live ball and the predictors. */
class Core {
  pos = new Vector3();
  vel = new Vector3();
  spin = new Vector3();
  phase: BallState['phase'] = 'rest';
  hole: Hole | null = null;
  wind = new Vector3();
  rng: () => number = Math.random;
  events: BallEvent[] | null = null;
  /** Stop after the first ground contact (landing predictor). */
  stopOnLand = false;
  ignoreTrees = false;

  time = 0;
  strike = new Vector3();
  airborne = false;
  landed = false;
  apexDone = false;
  overCup = false;
  inTree: Tree | null = null;
  treeCooldown = 0;
  pinCooldown = 0;
  landPos = new Vector3();
  trees: Map<number, Tree[]> = new Map();
  private n = new Vector3();

  setHole(h: Hole) {
    this.hole = h;
    this.trees = new Map();
    for (const t of h.trees) {
      const k = cellKey(Math.floor(t.pos.x / 16), Math.floor(t.pos.z / 16));
      let arr = this.trees.get(k);
      if (!arr) this.trees.set(k, (arr = []));
      arr.push(t);
    }
  }

  ground(x: number, z: number) {
    return this.hole ? this.hole.heightAt(x, z) : 0;
  }
  surface(x: number, z: number): Surface {
    return this.hole ? this.hole.surfaceAt(x, z) : 'fairway';
  }
  inBounds(x: number, z: number) {
    if (!this.hole) return true;
    const b = this.hole.bounds;
    return x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ;
  }
  emit(e: BallEvent) {
    if (this.events) this.events.push(e);
  }

  reset(pos: Vector3) {
    this.pos.copy(pos);
    if (this.hole) this.pos.y = this.ground(pos.x, pos.z);
    this.vel.set(0, 0, 0);
    this.spin.set(0, 0, 0);
    this.phase = 'rest';
    this.time = 0;
    this.airborne = false;
    this.landed = false;
    this.apexDone = false;
    this.overCup = false;
    this.inTree = null;
    this.treeCooldown = 0;
    this.pinCooldown = 0;
  }

  launchFlight(p: LaunchParams) {
    this.strike.copy(this.pos);
    launchVectors(p, this.vel, this.spin);
    this.phase = 'flight';
    this.airborne = true;
    this.landed = false;
    this.apexDone = false;
    this.time = 0;
    this.pos.y += 0.001;
    this.emit({ type: 'launch', pos: this.pos.clone(), speed: p.speed });
  }

  launchPutt(yaw: number, speed: number) {
    this.strike.copy(this.pos);
    this.vel.set(-Math.sin(yaw) * speed, 0, -Math.cos(yaw) * speed);
    this.spin.set(0, 0, 0);
    this.phase = 'rolling';
    this.airborne = false;
    this.landed = true;
    this.apexDone = true;
    this.time = 0;
    this.overCup = this.hole ? Math.hypot(this.pos.x - this.hole.pin.x, this.pos.z - this.hole.pin.z) < CUP_RADIUS : false;
    this.emit({ type: 'launch', pos: this.pos.clone(), speed });
  }

  get active() {
    return this.phase === 'flight' || this.phase === 'rolling';
  }

  advance(dt: number) {
    if (!this.active) return;
    dt = Math.min(Math.max(dt, 0), 0.25);
    const n = Math.max(1, Math.ceil(dt / DT - 1e-9));
    const h = dt / n;
    for (let i = 0; i < n && this.active; i++) this.substep(h);
  }

  substep(h: number) {
    this.time += h;
    this.treeCooldown -= h;
    this.pinCooldown -= h;
    if (this.time > MAX_TIME) {
      this.vel.set(0, 0, 0);
      this.pos.y = this.ground(this.pos.x, this.pos.z);
      this.settle();
      return;
    }
    if (this.airborne) this.airStep(h);
    else this.rollStep(h);
  }

  // ────────────────────────────── airborne ──────────────────────────────
  private airStep(h: number) {
    flightAccel(this.vel, this.spin, this.wind, _a);
    this.vel.addScaledVector(_a, h);
    this.pos.addScaledVector(this.vel, h);
    this.spin.multiplyScalar(1 - h / SPIN_TAU);

    if (!this.apexDone && !this.landed && this.vel.y < 0) {
      this.apexDone = true;
      this.emit({ type: 'apex', pos: this.pos.clone(), height: this.pos.y - this.strike.y });
    }
    if (!this.ignoreTrees) this.treeCollide();
    if (!this.stopOnLand) this.flagCollide();

    const hole = this.hole;
    if (hole && hole.waterLevel !== null && this.pos.y < hole.waterLevel && this.surface(this.pos.x, this.pos.z) === 'water') {
      if (this.stopOnLand) {
        this.phase = 'rest';
        return;
      }
      if (!this.landed) this.emitLand('water');
      this.toWater();
      return;
    }
    const g = this.ground(this.pos.x, this.pos.z);
    if (this.pos.y <= g) this.impact(g);
    else if (!this.inBounds(this.pos.x, this.pos.z) && this.pos.y < g + 0.5 && hole) {
      this.pos.y = g;
      this.toOb();
    }
  }

  private emitLand(surf: Surface) {
    this.landed = true;
    this.landPos.copy(this.pos);
    this.emit({
      type: 'land',
      pos: this.pos.clone(),
      surface: surf,
      speed: this.vel.length(),
      carryM: Math.hypot(this.pos.x - this.strike.x, this.pos.z - this.strike.z),
    });
  }

  private impact(g: number) {
    this.pos.y = g;
    const x = this.pos.x;
    const z = this.pos.z;
    const surf = this.surface(x, z);
    if (this.stopOnLand) {
      this.phase = 'rest';
      return;
    }
    const first = !this.landed;
    if (first) this.emitLand(surf);
    if (!this.inBounds(x, z) || surf === 'ob') {
      this.toOb();
      return;
    }
    if (surf === 'water') {
      this.toWater();
      return;
    }
    const hole = this.hole;
    if (hole) {
      const dp = Math.hypot(x - hole.pin.x, z - hole.pin.z);
      const hs = Math.hypot(this.vel.x, this.vel.z);
      if (dp < CUP_RADIUS && hs < 6) {
        this.toHoled();
        return;
      }
    }
    const n = hole ? hole.normalAt(x, z, this.n) : this.n.set(0, 1, 0);
    const props = SURFACES[surf];
    const speed = this.vel.length();
    const vn = this.vel.dot(n);
    _t.copy(this.vel).addScaledVector(n, -vn); // tangential
    const vt = _t.length();
    const steep = speed > 1e-6 ? Math.abs(vn) / speed : 1;
    const e = props.bounce * (0.35 + 0.65 * Math.exp(-Math.abs(vn) / 10));
    let kt = Math.pow(props.impactFriction, 0.4 + 4 * steep * steep);
    let tNew = vt * kt;
    if (first && vt > 1e-6) {
      // backspin check: r·(n × ω)·t̂
      const tx = _t.x / vt;
      const ty = _t.y / vt;
      const tz = _t.z / vt;
      const cx = n.y * this.spin.z - n.z * this.spin.y;
      const cy = n.z * this.spin.x - n.x * this.spin.z;
      const cz = n.x * this.spin.y - n.y * this.spin.x;
      const back = BALL.radius * (cx * tx + cy * ty + cz * tz);
      const check = Math.min(3, Math.max(0, back * (SPIN_GRIP[surf] ?? 0.04)));
      tNew -= check;
    }
    if (vt > 1e-6) _t.multiplyScalar(tNew / vt);
    const vnNew = -vn * e;
    this.spin.multiplyScalar(0.35);
    this.vel.copy(_t).addScaledVector(n, vnNew);
    if (!first) this.emit({ type: 'bounce', pos: this.pos.clone(), surface: surf, speed });
    this.phase = 'rolling';
    if (vnNew < 0.9 || surf === 'sand') {
      // start rolling: horizontal velocity only
      this.airborne = false;
      this.vel.y = 0;
      this.pos.y = g;
      if (surf === 'sand') this.vel.multiplyScalar(0.3);
    } else {
      this.pos.y = g + 0.002;
    }
  }

  private treeCollide() {
    if (!this.trees.size) return;
    const p = this.pos;
    if (this.inTree) {
      if (!insideTree(this.inTree, p)) this.inTree = null;
      else return;
    }
    const cx = Math.floor(p.x / 16);
    const cz = Math.floor(p.z / 16);
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const arr = this.trees.get(cellKey(cx + i, cz + j));
        if (!arr) continue;
        for (const t of arr) {
          const dx = p.x - t.pos.x;
          const dz = p.z - t.pos.z;
          const dxz = Math.hypot(dx, dz);
          if (dxz > t.radius + 0.5) continue;
          // trunk
          const trunkTop = t.pos.y + t.height * (t.kind === 'pine' ? 0.25 : t.kind === 'palm' ? 0.9 : 0.45);
          if (dxz < 0.25 + BALL.radius && p.y < trunkTop && p.y >= t.pos.y && this.treeCooldown <= 0) {
            const nx = dxz > 1e-6 ? dx / dxz : 1;
            const nz = dxz > 1e-6 ? dz / dxz : 0;
            const vr = this.vel.x * nx + this.vel.z * nz;
            if (vr < 0) {
              this.vel.x -= 2 * vr * nx;
              this.vel.z -= 2 * vr * nz;
            }
            this.vel.multiplyScalar(0.4);
            this.spin.multiplyScalar(0.2);
            this.treeCooldown = 0.15;
            this.emit({ type: 'tree', pos: p.clone(), speed: this.vel.length() });
            return;
          }
          if (insideTree(t, p)) {
            this.inTree = t;
            const sp = this.vel.length();
            const keep = 0.3 + 0.15 * this.rng();
            const ang = Math.atan2(this.vel.x, this.vel.z) + (this.rng() - 0.5) * 1.6;
            const hs = Math.hypot(this.vel.x, this.vel.z) * keep;
            this.vel.set(Math.sin(ang) * hs, -Math.abs(this.vel.y) * 0.3 - 1, Math.cos(ang) * hs);
            this.spin.multiplyScalar(0.2);
            this.emit({ type: 'tree', pos: p.clone(), speed: sp });
            return;
          }
        }
      }
    }
  }

  private flagCollide() {
    const hole = this.hole;
    if (!hole || this.pinCooldown > 0) return;
    const dx = this.pos.x - hole.pin.x;
    const dz = this.pos.z - hole.pin.z;
    const d = Math.hypot(dx, dz);
    const hy = this.pos.y - hole.pin.y;
    if (d < FLAG_RADIUS + BALL.radius && hy > 0.02 && hy < FLAG_HEIGHT) {
      const nx = d > 1e-6 ? dx / d : 1;
      const nz = d > 1e-6 ? dz / d : 0;
      const vr = this.vel.x * nx + this.vel.z * nz;
      if (vr < 0) {
        this.vel.x -= 2 * vr * nx;
        this.vel.z -= 2 * vr * nz;
      }
      this.vel.x *= 0.25;
      this.vel.z *= 0.25;
      this.vel.y *= 0.5;
      this.spin.multiplyScalar(0.2);
      this.pinCooldown = 0.3;
      this.emit({ type: 'pin', pos: this.pos.clone() });
    }
  }

  // ────────────────────────────── rolling ──────────────────────────────
  private rollStep(h: number) {
    const hole = this.hole;
    const x = this.pos.x;
    const z = this.pos.z;
    const surf = this.surface(x, z);
    const n = hole ? hole.normalAt(x, z, this.n) : this.n.set(0, 1, 0);
    const ax = GRAVITY * n.y * n.x;
    const az = GRAVITY * n.y * n.z;
    const slopeA = Math.hypot(ax, az);
    const decel0 = SURFACES[surf].rollDecel;
    let vx = this.vel.x;
    let vz = this.vel.z;
    let sp = Math.hypot(vx, vz);
    if (sp > 0) {
      const dv = (decel0 + ROLL_QUAD * sp * sp) * h;
      if (dv >= sp) {
        vx = 0;
        vz = 0;
      } else {
        const k = (sp - dv) / sp;
        vx *= k;
        vz *= k;
      }
    }
    sp = Math.hypot(vx, vz);
    if (sp < REST_SPEED && slopeA < decel0 * 0.95) {
      this.vel.set(0, 0, 0);
      this.pos.y = this.ground(x, z);
      if (!this.checkCup(true)) this.settle();
      return;
    }
    vx += ax * h;
    vz += az * h;
    const py = this.pos.y;
    this.pos.x += vx * h;
    this.pos.z += vz * h;
    this.pos.y = this.ground(this.pos.x, this.pos.z);
    this.vel.set(vx, (this.pos.y - py) / h, vz);
    this.spin.multiplyScalar(0.98);

    if (!this.inBounds(this.pos.x, this.pos.z)) {
      this.toOb();
      return;
    }
    if (hole && hole.waterLevel !== null && this.pos.y < hole.waterLevel + 0.02) {
      if (this.surface(this.pos.x, this.pos.z) === 'water') {
        this.toWater();
        return;
      }
    }
    if (!this.ignoreTrees) this.trunkRoll();
    this.checkCup(false);
  }

  private trunkRoll() {
    const p = this.pos;
    const arr = this.trees.get(cellKey(Math.floor(p.x / 16), Math.floor(p.z / 16)));
    if (!arr) return;
    for (const t of arr) {
      const dx = p.x - t.pos.x;
      const dz = p.z - t.pos.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.25 + BALL.radius && d > 1e-6) {
        const nx = dx / d;
        const nz = dz / d;
        const vr = this.vel.x * nx + this.vel.z * nz;
        if (vr < 0) {
          this.vel.x = (this.vel.x - 2 * vr * nx) * 0.4;
          this.vel.z = (this.vel.z - 2 * vr * nz) * 0.4;
          if (this.treeCooldown <= 0) this.emit({ type: 'tree', pos: p.clone(), speed: this.vel.length() });
          this.treeCooldown = 0.2;
        }
      }
    }
  }

  /** Cup capture logic. Returns true if holed. */
  private checkCup(atRest: boolean): boolean {
    const hole = this.hole;
    if (!hole) return false;
    const dx = hole.pin.x - this.pos.x;
    const dz = hole.pin.z - this.pos.z;
    const d = Math.hypot(dx, dz);
    if (d >= CUP_RADIUS) {
      if (d > CUP_RADIUS + 0.01) this.overCup = false;
      return false;
    }
    if (atRest) {
      this.toHoled();
      return true;
    }
    if (this.overCup) return false;
    this.overCup = true;
    const vx = this.vel.x;
    const vz = this.vel.z;
    const sp = Math.hypot(vx, vz);
    if (sp < 1e-6) {
      this.toHoled();
      return true;
    }
    const b = Math.abs(vx * dz - vz * dx) / sp; // impact parameter
    const frac = Math.min(1, b / CUP_RADIUS);
    const vcap = CAP_SPEED * Math.sqrt(Math.max(0, 1 - frac * frac)) + 0.3;
    if (sp <= vcap) {
      this.toHoled();
      return true;
    }
    if (sp < vcap + 1.0 && frac > 0.25) {
      // lip out: swing around the rim, away from the centre
      const side = vx * dz - vz * dx > 0 ? -1 : 1;
      const ang = side * (0.5 + 0.7 * (1 - frac)) * (0.8 + 0.4 * this.rng());
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      const k = 0.55;
      this.vel.x = (vx * c - vz * s) * k;
      this.vel.z = (vx * s + vz * c) * k;
      this.emit({ type: 'lip', pos: this.pos.clone() });
      return false;
    }
    this.vel.x *= 0.92;
    this.vel.z *= 0.92;
    return false;
  }

  private settle() {
    const x = this.pos.x;
    const z = this.pos.z;
    const surf = this.surface(x, z);
    if (!this.inBounds(x, z) || surf === 'ob') {
      this.toOb();
      return;
    }
    if (surf === 'water') {
      this.toWater();
      return;
    }
    this.phase = 'rest';
    this.vel.set(0, 0, 0);
    this.spin.set(0, 0, 0);
    this.emit({ type: 'rest', pos: this.pos.clone(), surface: surf });
  }

  private toWater() {
    this.phase = 'water';
    this.vel.set(0, 0, 0);
    this.spin.set(0, 0, 0);
    this.emit({ type: 'water', pos: this.pos.clone() });
  }

  private toOb() {
    this.phase = 'ob';
    this.vel.set(0, 0, 0);
    this.spin.set(0, 0, 0);
    this.emit({ type: 'ob', pos: this.pos.clone() });
  }

  /** Watchdog exit: end a shot that would otherwise never finish (creeping round the cup, stuck on the pin). */
  forceStop() {
    if (this.phase !== 'flight' && this.phase !== 'rolling') return;
    const pin = this.hole?.pin;
    if (pin && Math.hypot(this.pos.x - pin.x, this.pos.z - pin.z) < CUP_RADIUS * 1.6) return this.toHoled();
    if (this.hole) this.pos.y = this.ground(this.pos.x, this.pos.z);
    this.settle();
  }

  private toHoled() {
    const hole = this.hole!;
    this.phase = 'holed';
    this.pos.set(hole.pin.x, hole.pin.y - 0.08, hole.pin.z);
    this.vel.set(0, 0, 0);
    this.spin.set(0, 0, 0);
    this.emit({ type: 'holed', pos: this.pos.clone() });
  }
}

function cellKey(i: number, j: number) {
  return (i + 4096) * 8192 + (j + 4096);
}

function insideTree(t: Tree, p: Vector3): boolean {
  const dx = p.x - t.pos.x;
  const dz = p.z - t.pos.z;
  const y = p.y - t.pos.y;
  if (t.kind === 'pine') {
    const base = t.height * 0.25;
    if (y < base || y > t.height) return false;
    const r = (t.radius * (t.height - y)) / (t.height - base);
    return dx * dx + dz * dz < r * r;
  }
  const r = t.kind === 'palm' ? t.radius * 0.8 : t.radius;
  const cy = t.kind === 'palm' ? t.height - r * 0.4 : t.height - t.radius;
  const dy = y - cy;
  return dx * dx + dy * dy + dz * dz < r * r;
}

// ─────────────────────────────────────── GolfBall ────────────────────────────────────

export class GolfBall implements BallSim {
  private readonly core = new Core();
  private readonly scratch = new Core();
  readonly state: BallState;

  constructor() {
    const c = this.core;
    // Live view onto the core (pos/vel/spin are the same Vector3 instances).
    this.state = {
      pos: c.pos,
      vel: c.vel,
      spin: c.spin,
      get phase() {
        return c.phase;
      },
      set phase(p: BallState['phase']) {
        c.phase = p;
      },
    };
  }

  setHole(hole: Hole): void {
    this.core.setHole(hole);
    this.scratch.setHole(hole);
  }

  setWind(w: Wind): void {
    const s = w.speed * WIND_GAIN;
    this.core.wind.set(-Math.sin(w.yaw) * s, 0, -Math.cos(w.yaw) * s);
    this.scratch.wind.copy(this.core.wind);
  }

  place(pos: Vector3): void {
    this.core.reset(pos);
  }

  private lieAt(core: Core, p: Vector3): Surface {
    return core.hole ? core.hole.surfaceAt(p.x, p.z) : 'fairway';
  }

  private fullShotParams(club: ClubId, power: number, quality: number, curve: number, lie: Surface, yaw: number): LaunchParams {
    const c = clubById(club);
    const q = Math.max(0, Math.min(1, quality));
    const qMul = q >= 0.4 ? 0.92 + (0.08 * (q - 0.4)) / 0.6 : 0.5 + (0.42 * q) / 0.4;
    const target = c.carryYards * YARD * powerScale(power) * lieMultiplier(club, lie) * qMul;
    const speed = speedForCarry(club, target);
    let launch = LAUNCH_DEG[club];
    let spin = spinFor(club, speed);
    if (q < 0.4) {
      launch *= 0.3 + (0.7 * q) / 0.4;
      spin *= 0.5;
    }
    if (lie === 'sand' || lie === 'rough' || lie === 'deepRough') spin *= 0.7; // flier-ish, less grip
    const cv = Math.max(-1, Math.min(1, curve));
    return { speed, launchRad: (launch * Math.PI) / 180, spinRad: spin, yaw, tilt: cv * TILT_MAX[club] };
  }

  strike(shot: ShotInput, rng: () => number = Math.random): void {
    const c = this.core;
    c.events = [];
    c.rng = rng;
    c.stopOnLand = false;
    c.ignoreTrees = false;
    c.inTree = null;
    c.overCup = false;
    const lie = shot.lie;
    if (shot.club === 'PT') {
      const q = Math.max(0, Math.min(1, shot.quality));
      const speed = puttSpeedFor(Math.max(0, shot.power) * PUTT_RANGE_M.medium) * (0.9 + 0.1 * q);
      const yaw = shot.aimYaw - Math.max(-1, Math.min(1, shot.curve)) * 0.04;
      c.launchPutt(yaw, speed);
      return;
    }
    const err = SURFACES[lie].lieError;
    const yaw = shot.aimYaw + (err > 0 ? gauss(rng) * err : 0);
    c.launchFlight(this.fullShotParams(shot.club, shot.power, shot.quality, shot.curve, lie, yaw));
  }

  private movingT = 0;
  private slowT = 0;

  step(dt: number): BallEvent[] {
    const c = this.core;
    const out: BallEvent[] = c.events && c.events.length ? c.events : [];
    c.events = out;
    c.advance(dt);
    // A shot always ends: >25 s in motion, or rolling slower than 6 cm/s for over a second.
    if (c.phase === 'flight' || c.phase === 'rolling') {
      this.movingT += dt;
      this.slowT = c.phase === 'rolling' && c.vel.length() < 0.06 ? this.slowT + dt : 0;
      if (this.movingT > 25 || this.slowT > 1.2) c.forceStop();
    } else this.movingT = this.slowT = 0;
    c.events = [];
    return out;
  }

  predictLanding(from: Vector3, club: ClubId, aimYaw: number, power = 1): Vector3 {
    const s = this.scratch;
    s.events = null;
    s.rng = () => 0.5;
    s.reset(from);
    s.pos.copy(from);
    if (club === 'PT') {
      const pts = this.predictPutt(from, aimYaw, power, 2);
      return pts[pts.length - 1];
    }
    s.stopOnLand = true;
    s.ignoreTrees = true;
    s.launchFlight(this.fullShotParams(club, power, 1, 0, this.lieAt(s, from), aimYaw));
    for (let i = 0; i < 300 && s.active; i++) s.advance(0.05);
    const p = s.pos.clone();
    if (s.hole) p.y = s.hole.heightAt(p.x, p.z);
    return p;
  }

  predictPutt(from: Vector3, aimYaw: number, power: number, maxPoints = 64): Vector3[] {
    const s = this.scratch;
    s.events = null;
    s.rng = () => 0.5;
    s.stopOnLand = false;
    s.ignoreTrees = true;
    s.reset(from);
    s.launchPutt(aimYaw, puttSpeedFor(Math.max(0, power) * PUTT_RANGE_M.medium));
    const pts: Vector3[] = [s.pos.clone()];
    // Simulate, recording a point every 0.1 s, then thin to maxPoints.
    const raw: Vector3[] = [];
    for (let i = 0; i < 400 && s.active; i++) {
      s.advance(0.1);
      raw.push(s.pos.clone());
    }
    const n = Math.max(1, maxPoints - 1);
    if (raw.length <= n) pts.push(...raw);
    else for (let k = 1; k <= n; k++) pts.push(raw[Math.round((k * (raw.length - 1)) / n)]);
    return pts;
  }
}

/** Reference full-power numbers per club (for UI/debug). */
export function clubFlightInfo(id: ClubId) {
  const c = clubById(id);
  if (id === 'PT') return { speed: puttSpeedFor(PUTT_RANGE_M.medium), launchDeg: 0, carryM: 0, apexM: 0 };
  const speed = speedForCarry(id, c.carryYards * YARD);
  const r = simulateFlat(id, speed);
  return { speed, launchDeg: LAUNCH_DEG[id], carryM: r.carry, apexM: r.apex };
}

