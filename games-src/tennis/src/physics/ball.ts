import { Vector3 } from 'three';
import { BALL_R, COURT, clamp, netHeightAt } from '../constants';

export const GRAVITY = 9.81;
export const PHYS_DT = 1 / 240;
const K_DRAG = 0.0195; // 0.5·ρ·Cd·A / m
const K_MAGNUS = 0.11;
const RESTITUTION = 0.76;

export interface BallEvent {
  type: 'bounce' | 'net';
  pos: Vector3;
  speed: number;
}

export class BallState {
  p = new Vector3();
  v = new Vector3();
  /** +1 heavy topspin, negative = slice/backspin. */
  spin = 0;
  touchedNet = false;
  rolling = false;

  copy(o: BallState) {
    this.p.copy(o.p);
    this.v.copy(o.v);
    this.spin = o.spin;
    this.touchedNet = o.touchedNet;
    this.rolling = o.rolling;
    return this;
  }
}

const _a = new Vector3();
const _axis = new Vector3();
const _prev = new Vector3();
const _m = new Vector3();

/** One fixed physics step. Deterministic so the same code drives play and prediction. */
export function stepBall(b: BallState, dt: number, events?: BallEvent[]) {
  if (b.rolling) {
    b.v.y = 0;
    b.v.multiplyScalar(Math.max(0, 1 - 1.4 * dt));
    b.p.addScaledVector(b.v, dt);
    b.p.y = BALL_R;
    return;
  }
  _prev.copy(b.p);
  const speed = b.v.length();
  _a.set(0, -GRAVITY, 0).addScaledVector(b.v, -K_DRAG * speed);
  const hl = Math.hypot(b.v.x, b.v.z);
  if (hl > 0.1 && b.spin !== 0) {
    // Spin axis = up × horizontal direction; topspin pushes the ball down.
    _axis.set(b.v.z / hl, 0, -b.v.x / hl);
    _m.crossVectors(_axis, b.v).multiplyScalar(K_MAGNUS * b.spin);
    _a.add(_m);
  }
  b.v.addScaledVector(_a, dt);
  b.p.addScaledVector(b.v, dt);

  // Net plane at z = 0.
  if (_prev.z > 0 !== b.p.z > 0) {
    const t = _prev.z / (_prev.z - b.p.z);
    const x = _prev.x + (b.p.x - _prev.x) * t;
    const y = _prev.y + (b.p.y - _prev.y) * t;
    const h = netHeightAt(x);
    if (Math.abs(x) <= COURT.postX && y - BALL_R < h) {
      if (y > h - 0.02 && !b.touchedNet) {
        // Clipped the tape: dribbles over.
        b.v.multiplyScalar(0.42);
        b.v.y = Math.abs(b.v.y) * 0.3 + 1.3;
        b.p.y = h + BALL_R + 0.01;
      } else {
        const side = _prev.z > 0 ? 1 : -1;
        b.p.set(x, Math.max(y, BALL_R), side * (BALL_R + 0.02));
        b.v.set(b.v.x * 0.25, Math.min(b.v.y, 0) * 0.3, -b.v.z * 0.12);
      }
      b.touchedNet = true;
      events?.push({ type: 'net', pos: new Vector3(x, y, 0), speed });
    }
  }

  if (b.p.y < BALL_R && b.v.y < 0) {
    b.p.y = BALL_R;
    const vin = -b.v.y;
    events?.push({ type: 'bounce', pos: b.p.clone(), speed: vin });
    const vy = vin * RESTITUTION * (1 + 0.07 * b.spin);
    const fh = clamp(0.72 + 0.08 * b.spin, 0.55, 0.9);
    b.v.x *= fh;
    b.v.z *= fh;
    b.v.y = vy;
    b.spin *= 0.4;
    if (vy < 0.35) {
      b.rolling = true;
      b.v.y = 0;
    }
  }
}

export interface PredSample {
  t: number;
  p: Vector3;
  v: Vector3;
  /** Bounces since the last hit, including ones before prediction began. */
  bounces: number;
}

export interface Prediction {
  samples: PredSample[];
  netAt: number | null;
}

const _sim = new BallState();

/** Simulate ahead from `b`, sampling every other physics step. */
export function predict(b: BallState, duration: number, initialBounces: number): Prediction {
  _sim.copy(b);
  const samples: PredSample[] = [];
  const events: BallEvent[] = [];
  let bounces = initialBounces;
  let netAt: number | null = null;
  const steps = Math.ceil(duration / PHYS_DT);
  for (let i = 1; i <= steps; i++) {
    events.length = 0;
    stepBall(_sim, PHYS_DT, events);
    for (const e of events) {
      if (e.type === 'bounce') bounces++;
      else if (netAt === null) netAt = i * PHYS_DT;
    }
    if (i % 2 === 0 || events.length) {
      samples.push({ t: i * PHYS_DT, p: _sim.p.clone(), v: _sim.v.clone(), bounces });
    }
    if (bounces >= initialBounces + 3 || _sim.rolling) break;
  }
  return { samples, netAt };
}

/** Flight from `from` with velocity v until it lands; returns horizontal distance and net clearance. */
function flight(from: Vector3, v: Vector3, spin: number): { dist: number; netClear: number | null } {
  _sim.p.copy(from);
  _sim.v.copy(v);
  _sim.spin = spin;
  _sim.rolling = false;
  _sim.touchedNet = false;
  let netClear: number | null = null;
  const dt = 1 / 120;
  for (let i = 0; i < 720; i++) {
    const pz = _sim.p.z;
    const px = _sim.p.x;
    const py = _sim.p.y;
    // Integrate without collisions (copy of stepBall's force model).
    const speed = _sim.v.length();
    _a.set(0, -GRAVITY, 0).addScaledVector(_sim.v, -K_DRAG * speed);
    const hl = Math.hypot(_sim.v.x, _sim.v.z);
    if (hl > 0.1 && spin !== 0) {
      _axis.set(_sim.v.z / hl, 0, -_sim.v.x / hl);
      _m.crossVectors(_axis, _sim.v).multiplyScalar(K_MAGNUS * spin);
      _a.add(_m);
    }
    _sim.v.addScaledVector(_a, dt);
    _sim.p.addScaledVector(_sim.v, dt);
    if (netClear === null && pz > 0 !== _sim.p.z > 0) {
      const t = pz / (pz - _sim.p.z);
      const x = px + (_sim.p.x - px) * t;
      const y = py + (_sim.p.y - py) * t;
      netClear = y - BALL_R - netHeightAt(x);
    }
    if (_sim.p.y <= BALL_R && _sim.v.y < 0) break;
  }
  return { dist: Math.hypot(_sim.p.x - from.x, _sim.p.z - from.z), netClear };
}

/**
 * Find a launch velocity that lands on `target` with the requested horizontal speed,
 * slowing the shot down until it clears the net by `clearance` metres.
 */
export function solveShot(from: Vector3, target: Vector3, hSpeed: number, spin: number, clearance: number): Vector3 {
  const dx = target.x - from.x;
  const dz = target.z - from.z;
  const dist = Math.hypot(dx, dz);
  const ux = dx / dist;
  const uz = dz / dist;
  let h = hSpeed;
  const v = new Vector3();
  for (let k = 0; k < 18; k++) {
    let lo = -h * 0.8;
    let hi = h;
    let res = { dist: 0, netClear: null as number | null };
    for (let i = 0; i < 22; i++) {
      const vy = (lo + hi) / 2;
      v.set(ux * h, vy, uz * h);
      res = flight(from, v, spin);
      if (res.dist < dist) lo = vy;
      else hi = vy;
    }
    if (res.netClear === null || res.netClear >= clearance) return v;
    h *= 0.92;
  }
  return v;
}

export interface Box {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

/** Is a bounce position inside the box? Lines are in (ball touching the line counts). */
export function inBox(p: Vector3, b: Box): boolean {
  return p.x >= b.x0 - BALL_R && p.x <= b.x1 + BALL_R && p.z >= b.z0 - BALL_R && p.z <= b.z1 + BALL_R;
}

/** Singles court half belonging to `side` (0 = near/+z, 1 = far/−z). */
export function courtHalf(side: 0 | 1): Box {
  const w = COURT.singlesHalfW;
  return side === 0 ? { x0: -w, x1: w, z0: 0, z1: COURT.halfLen } : { x0: -w, x1: w, z0: -COURT.halfLen, z1: 0 };
}

/** Service box a serve from `server` on the given side must land in. */
export function serviceBox(server: 0 | 1, side: 'deuce' | 'ad'): Box {
  const w = COURT.singlesHalfW;
  const s = COURT.serviceLine;
  if (server === 0) {
    // Near server faces −z; deuce court is to their right (+x), so they serve cross-court to −x.
    return side === 'deuce' ? { x0: -w, x1: 0, z0: -s, z1: 0 } : { x0: 0, x1: w, z0: -s, z1: 0 };
  }
  // Far server faces +z; their right is −x, so deuce serves land on +x.
  return side === 'deuce' ? { x0: 0, x1: w, z0: 0, z1: s } : { x0: -w, x1: 0, z0: 0, z1: s };
}
