/**
 * SPINSHOT — live ball simulation + pure path prediction.
 * Both use the shared core (`./core`) so predictions are bit-identical to the live ball.
 */
import { Vector3 } from 'three';
import { sideOfZ, type BallEvent, type BallSim, type BallState, type PathPoint } from '../core/contracts';
import {
  EV_BOUNCE, EV_EDGE, EV_FLOOR, EV_NET, EV_OUT, SUBSTEP, advance, makeBody,
  type EvCode, type EventSink, type SimBody,
} from './core';

export { SUBSTEP } from './core';

export function bodyFromState(s: BallState, b: SimBody = makeBody()): SimBody {
  b.px = s.pos.x; b.py = s.pos.y; b.pz = s.pos.z;
  b.vx = s.vel.x; b.vy = s.vel.y; b.vz = s.vel.z;
  b.wx = s.spin.x; b.wy = s.spin.y; b.wz = s.spin.z;
  b.netTouch = false; b.cordPass = false; b.done = false;
  return b;
}

export function toBallEvent(type: EvCode, x: number, y: number, z: number, speed: number): BallEvent {
  const pos = new Vector3(x, y, z);
  switch (type) {
    case EV_BOUNCE: return { type: 'bounce', side: sideOfZ(z), pos, speed };
    case EV_EDGE: return { type: 'edge', side: sideOfZ(z), pos };
    case EV_NET: return { type: 'net', pos, speed };
    case EV_FLOOR: return { type: 'floor', pos, speed };
    default: return { type: 'out', pos };
  }
}

export class Ball implements BallSim {
  readonly state: BallState = { pos: new Vector3(0, 1, 0), vel: new Vector3(), spin: new Vector3() };
  private body: SimBody = makeBody();
  private acc = 0;
  private events: BallEvent[] = [];
  private sink: EventSink = (t, x, y, z, s) => { this.events.push(toBallEvent(t, x, y, z, s)); };

  constructor() {
    bodyFromState(this.state, this.body);
  }

  set(pos: Vector3, vel: Vector3, spin: Vector3): void {
    this.state.pos.copy(pos);
    this.state.vel.copy(vel);
    this.state.spin.copy(spin);
    bodyFromState(this.state, this.body);
    this.acc = 0;
  }

  /** True once the ball has come to rest on the floor or left the play volume. */
  get settled(): boolean {
    return this.body.done;
  }

  step(dt: number): BallEvent[] {
    this.events = [];
    this.acc += Math.min(Math.max(dt, 0), 0.1);
    const b = this.body;
    while (this.acc >= SUBSTEP - 1e-9) {
      this.acc -= SUBSTEP;
      advance(b, this.sink);
    }
    if (this.acc < 0) this.acc = 0;
    const s = this.state;
    s.pos.set(b.px, b.py, b.pz);
    s.vel.set(b.vx, b.vy, b.vz);
    s.spin.set(b.wx, b.wy, b.wz);
    return this.events;
  }
}

export interface TraceEvent { type: EvCode; x: number; y: number; z: number; speed: number; t: number; }

/**
 * Internal tracer: steps a copy of the state, calling onSample every `every` sub-steps (and at t=0),
 * and onEvent for each event. Either callback may return true to stop.
 */
export function trace(
  state: BallState, duration: number, every: number,
  onSample: (t: number, b: SimBody) => boolean | void,
  onEvent: (e: TraceEvent) => boolean | void,
): void {
  const b = bodyFromState(state);
  let stop = false;
  let t = 0;
  const sink: EventSink = (type, x, y, z, speed) => {
    if (stop) return;
    if (onEvent({ type, x, y, z, speed, t: t + SUBSTEP })) stop = true;
  };
  if (onSample(0, b)) return;
  const n = Math.ceil(duration / SUBSTEP);
  for (let i = 1; i <= n; i++) {
    advance(b, sink);
    t = i * SUBSTEP;
    if (stop || b.done) { onSample(t, b); return; }
    if (i % every === 0 && onSample(t, b)) return;
  }
}

/** Pure prediction (does not mutate input). Stops early at floor contact. dt = sample spacing. */
export function predictPath(state: BallState, duration: number, dt = 1 / 120): PathPoint[] {
  const every = Math.max(1, Math.round(dt / SUBSTEP));
  const out: PathPoint[] = [];
  let bounces = 0;
  let pendingBounces = 0;
  trace(
    state, duration, every,
    (t, b) => {
      bounces = pendingBounces;
      out.push({ t, pos: new Vector3(b.px, b.py, b.pz), vel: new Vector3(b.vx, b.vy, b.vz), bounces });
    },
    (e) => {
      if (e.type === EV_BOUNCE || e.type === EV_EDGE) pendingBounces++;
      return e.type === EV_FLOOR || e.type === EV_OUT;
    },
  );
  return out;
}
