/**
 * SPINSHOT — computer opponent.
 *
 * Human-feeling AI: reaction delay, accelerated footwork with a max speed, recovery to a ready
 * position, shot selection from the incoming ball, open-court targeting, pressure-dependent errors,
 * and a full paddle animation (backswing → forward swing that meets the ball at contact → follow-through).
 * Works on either side (all geometry goes through sideSign), assumes a right-handed player.
 */
import { Matrix4, Quaternion, Vector3 } from 'three';
import {
  HALF_L, HALF_W, TABLE, sideSign,
  type AvatarPose, type BallState, type Difficulty, type PathPoint, type ShotRequest, type Side, type StrokeKind,
} from '../core/contracts';
import { hittableWindow } from '../physics/solver';

export interface AIPlan {
  t: number;              // seconds from now until contact
  strikePos: Vector3;     // where the paddle meets the ball
  request: ShotRequest;   // what the AI tries to do
  kind: StrokeKind;
  willMiss: boolean;      // AI decided it can't reach / whiffs (paddle still goes there but no hit)
}

export interface DifficultyProfile {
  /** Seconds before the AI starts moving after the opponent's strike. */
  reaction: number;
  /** Footwork max speed (m/s) and acceleration (m/s²). */
  moveSpeed: number;
  accel: number;
  /** Extra arm / lunge reach beyond the nominal paddle offset (m). */
  reach: number;
  /** Base solver error (0…1) for a neutral shot. */
  error: number;
  /** Probability of a pure whiff on a reachable ball (before pressure / difficulty multipliers). */
  whiff: number;
  /** Multipliers on stroke speed and spin. */
  speedScale: number;
  spinScale: number;
  /** 0…1 how often it attacks (smash / loop / flick instead of safe shots). */
  aggression: number;
  /** 0…1 how often it deliberately aims at the open court. */
  openCourt: number;
  /** Safety margin from the table edges when aiming (m). */
  margin: number;
  /** 0…1 shot speed/spin/placement variety. */
  variety: number;
  /** Extra error multiplier under pressure (close score late in a game). */
  pressure: number;
  /** Ready position distance behind the end line. */
  readyDepth: number;
}

export const DIFFICULTY: Record<Difficulty, DifficultyProfile> = {
  rookie: { reaction: 0.3, moveSpeed: 2.4, accel: 7, reach: 0.3, error: 0.55, whiff: 0.05, speedScale: 0.72, spinScale: 0.5, aggression: 0.15, openCourt: 0.2, margin: 0.3, variety: 0.3, pressure: 0.45, readyDepth: 0.45 },
  club: { reaction: 0.2, moveSpeed: 3.4, accel: 10, reach: 0.42, error: 0.34, whiff: 0.025, speedScale: 0.83, spinScale: 0.7, aggression: 0.35, openCourt: 0.45, margin: 0.22, variety: 0.5, pressure: 0.3, readyDepth: 0.5 },
  pro: { reaction: 0.14, moveSpeed: 4.0, accel: 14, reach: 0.48, error: 0.24, whiff: 0.01, speedScale: 0.93, spinScale: 0.88, aggression: 0.55, openCourt: 0.7, margin: 0.16, variety: 0.75, pressure: 0.2, readyDepth: 0.6 },
  legend: { reaction: 0.08, moveSpeed: 5.2, accel: 20, reach: 0.62, error: 0.12, whiff: 0.002, speedScale: 1.0, spinScale: 1.0, aggression: 0.75, openCourt: 0.9, margin: 0.12, variety: 1.0, pressure: 0.1, readyDepth: 0.65 },
};

interface StrokeAnim {
  back: number; swing: number; follow: number;
  /** Offsets in the AI's local frame: [right, up, forward]. */
  backOff: [number, number, number];
  followOff: [number, number, number];
  /** Face tilt: >0 open (backspin), <0 closed (topspin). */
  face: number;
}

const STROKES: Record<StrokeKind, StrokeAnim> = {
  loop: { back: 0.25, swing: 0.16, follow: 0.25, backOff: [0.12, -0.25, -0.35], followOff: [-0.3, 0.35, 0.3], face: -0.55 },
  drive: { back: 0.2, swing: 0.14, follow: 0.2, backOff: [0.1, -0.06, -0.3], followOff: [-0.3, 0.15, 0.3], face: -0.3 },
  smash: { back: 0.25, swing: 0.12, follow: 0.25, backOff: [0.15, 0.35, -0.3], followOff: [-0.3, -0.3, 0.35], face: -0.35 },
  block: { back: 0.1, swing: 0.08, follow: 0.12, backOff: [0.02, 0, -0.08], followOff: [-0.03, 0.02, 0.12], face: -0.15 },
  push: { back: 0.15, swing: 0.14, follow: 0.16, backOff: [0.03, 0.08, -0.15], followOff: [-0.05, -0.04, 0.25], face: 0.75 },
  chop: { back: 0.22, swing: 0.16, follow: 0.2, backOff: [0.05, 0.35, -0.05], followOff: [-0.1, -0.3, 0.2], face: 0.95 },
  flick: { back: 0.12, swing: 0.1, follow: 0.15, backOff: [0.04, -0.05, -0.08], followOff: [-0.1, 0.2, 0.15], face: -0.2 },
  lob: { back: 0.25, swing: 0.2, follow: 0.3, backOff: [0.1, -0.35, -0.2], followOff: [-0.15, 0.5, 0.2], face: 0.2 },
  serve: { back: 0.3, swing: 0.15, follow: 0.2, backOff: [0.15, 0.05, -0.25], followOff: [-0.2, -0.05, 0.2], face: 0.4 },
};

const TOP = TABLE.height;
const NET_TOP = TABLE.height + TABLE.netHeight;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Time to cover distance d from rest to rest with max accel a and max speed v. */
function moveTime(d: number, v: number, a: number): number {
  if (d <= 0) return 0;
  return d < (v * v) / a ? 2 * Math.sqrt(d / a) : d / v + v / a;
}

interface ActivePlan extends AIPlan {
  tContact: number;
  moveStart: number;
  swingStart: number;
  bodyTarget: Vector3;
  forehand: boolean;
  anim: StrokeAnim;
  /** Paddle aim direction (horizontal unit, toward the target). */
  aimX: number; aimZ: number;
  startPos: Vector3 | null;
  startRot: Quaternion | null;
  backPos: Vector3;
  followPos: Vector3;
  strokeRot: Quaternion;
}

export class AIPlayer {
  readonly body: Vector3;
  readonly paddle: AvatarPose;
  private d: DifficultyProfile;
  private sign: 1 | -1;
  private clock = 0;
  private vel = new Vector3();
  private idleTarget: Vector3;
  private active: ActivePlan | null = null;
  private readyRot = new Quaternion();

  constructor(readonly side: Side, private difficulty: Difficulty, private rng: () => number = Math.random) {
    this.d = DIFFICULTY[difficulty];
    this.sign = sideSign(side);
    this.body = this.readyPosition();
    this.idleTarget = this.body.clone();
    this.readyRot.copy(this.makeRot(true, 0, 0, -this.sign));
    this.paddle = { body: this.body, paddlePos: this.readyPaddlePos(new Vector3()), paddleRot: this.readyRot.clone() };
  }

  /** +X world direction of the AI's right hand side (right-handed, facing the net). */
  private get right(): number { return this.sign; }
  /** Forward (toward the net) z component. */
  private get fwd(): number { return -this.sign; }

  get level(): Difficulty { return this.difficulty; }
  /** Current plan (null when idle). */
  get plan(): AIPlan | null { return this.active; }
  /** Seconds until planned contact (Infinity when idle). */
  get timeToContact(): number { return this.active ? this.active.tContact - this.clock : Infinity; }
  /** True while playing a backhand stroke. */
  get backhand(): boolean { return this.active ? !this.active.forehand : false; }
  /** 0…1 swing progress for presentation (peaks at contact). */
  get swing(): number {
    const p = this.active;
    if (!p || this.clock < p.swingStart) return 0;
    const tau = this.clock - p.tContact;
    if (tau < -p.anim.swing) return 0.2;
    if (tau <= 0) return 0.2 + 0.8 * ((tau + p.anim.swing) / p.anim.swing);
    return Math.max(0, 1 - tau / p.anim.follow);
  }

  setDifficulty(d: Difficulty): void {
    this.difficulty = d;
    this.d = DIFFICULTY[d];
  }

  readyPosition(): Vector3 {
    return new Vector3(-0.08 * this.right, 0, this.sign * (HALF_L + this.d.readyDepth));
  }

  clearPlan(): void {
    this.active = null;
    this.idleTarget = this.readyPosition();
  }

  // ───────────────────────────── planning ─────────────────────────────
  planReturn(ball: BallState, ctx: { opponentBody: Vector3; rally: number; myScore: number; theirScore: number }): AIPlan | null {
    const win = hittableWindow(ball, this.side);
    if (!win.length) {
      this.clearPlan();
      return null;
    }
    const d = this.d;
    const s = this.sign;
    // High ball? Attacking players wait for it up high and smash.
    let maxH = 0;
    for (const p of win) maxH = Math.max(maxH, p.pos.y - TOP);
    const smashH = maxH > 0.38 && this.rng() < 0.35 + d.aggression * 0.65 ? Math.min(maxH - 0.03, 0.48) : 0;
    const prefH = smashH || 0.22;
    // Evaluate candidate strike samples: comfort vs footwork needed.
    let best: { p: PathPoint; score: number; forehand: boolean; bodyT: Vector3; feasible: boolean; over: number } | null = null;
    for (let i = 0; i < win.length; i += 2) {
      const p = win[i];
      const forehand = (p.pos.x - this.body.x) * this.right > -0.05;
      const lat = forehand ? 0.42 : -0.12;
      const fw = forehand ? 0.3 : 0.36;
      const bodyT = new Vector3(p.pos.x - lat * this.right, 0, p.pos.z - fw * this.fwd);
      // stay behind the end line; reach over the table with the arm instead
      const minDepth = HALF_L + 0.18;
      let overReach = 0;
      if (s * bodyT.z < minDepth) {
        overReach = minDepth - s * bodyT.z;
        bodyT.z = s * minDepth;
      }
      const dist = Math.hypot(bodyT.x - this.body.x, bodyT.z - this.body.z);
      const tAvail = p.t - d.reaction;
      const slack = d.reach * 0.6;
      const tNeed = Math.max(moveTime(Math.abs(bodyT.x - this.body.x) - slack * 0.8, d.moveSpeed, d.accel), moveTime(Math.abs(bodyT.z - this.body.z) - slack * 0.6, d.moveSpeed, d.accel));
      const feasible = tAvail > 0.05 && tNeed <= tAvail && overReach <= d.reach + 0.25;
      const h = p.pos.y - TOP;
      const dz = s * p.pos.z - HALF_L;
      let score =
        -1.2 * Math.abs(h - prefH) -
        0.1 * Math.abs(p.vel.y + 0.5) -
        0.25 * Math.max(0, dz - 0.8) -
        0.35 * Math.max(0, -0.1 - dz) -
        0.12 * dist;
      if (!feasible) score -= 100 + (tNeed - tAvail) * 10 + overReach * 10;
      if (!best || score > best.score) best = { p, score, forehand, bodyT, feasible, over: overReach };
    }
    const pick = best!;
    const p = pick.p;
    const dist = Math.hypot(pick.bodyT.x - this.body.x, pick.bodyT.z - this.body.z);

    // Pressure: close scores late in a game.
    const hi = Math.max(ctx.myScore, ctx.theirScore);
    let pressure = 1;
    if (hi >= 8 && Math.abs(ctx.myScore - ctx.theirScore) <= 2) pressure += d.pressure;
    if (ctx.theirScore >= 10 && ctx.theirScore > ctx.myScore) pressure += d.pressure * 0.5;

    // Incoming difficulty: speed, spin, stretch.
    const inSpeed = p.vel.length();
    const spinMag = ball.spin.length();
    const stretch = clamp(dist / 1.5, 0, 1);
    const hardness = Math.max(0, (inSpeed - 7) / 12) + spinMag / 1600 + stretch * 0.6 + pick.over * 0.8;

    let willMiss = !pick.feasible;
    if (!willMiss && this.rng() < d.whiff * pressure * (1 + 2 * hardness)) willMiss = true;

    const { kind, request } = this.chooseShot(ball, p, ctx.opponentBody, pressure, hardness, ctx.rally, smashH > 0);
    this.setPlan(p.t, p.pos.clone(), request, kind, willMiss, pick.bodyT, pick.forehand);
    return this.publicPlan();
  }

  planServe(ctx: { myScore: number; theirScore: number }): { request: ShotRequest; kind: StrokeKind; tossTime: number; strikePos: Vector3 } {
    const d = this.d;
    const s = this.sign;
    const r = this.rng;
    const stance = new Vector3(-0.3 * this.right, 0, s * (HALF_L + 0.42));
    // Strike just behind the end line, slightly to the right of the body, at ~table + 0.27.
    const strikePos = new Vector3(stance.x + 0.25 * this.right, TOP + 0.27, s * (HALF_L + 0.2));
    const pressure = Math.max(ctx.myScore, ctx.theirScore) >= 9 ? 1 + d.pressure : 1;
    const roll = r();
    const longP = 0.35 + 0.3 * d.aggression;
    let depth: number, speed: number, top: number;
    if (roll < longP) {
      depth = HALF_L - d.margin * 0.8 - r() * 0.15;
      speed = 6 + 2.5 * d.speedScale * r();
      top = (150 + 250 * r()) * d.spinScale;
    } else {
      depth = 0.38 + r() * 0.25;
      speed = 3.5 + r();
      top = -(250 + 250 * r()) * d.spinScale;
    }
    const xSpan = HALF_W - d.margin;
    const tx = (r() * 2 - 1) * xSpan * (0.5 + 0.5 * d.variety);
    const target = new Vector3(tx, TOP, -s * depth);
    const side = (r() * 2 - 1) * 200 * d.variety * d.spinScale;
    const spin = this.spinVector(strikePos, target, top, side);
    const request: ShotRequest = { target, speed, spin, error: clamp(d.error * 0.6 * pressure, 0, 1) };
    const tossTime = 0.7 + r() * 0.25;
    this.idleTarget = stance;
    const bodyT = stance.clone();
    this.setPlan(tossTime, strikePos.clone(), request, 'serve', false, bodyT, true);
    if (this.active) this.active.moveStart = this.clock; // already in position: no reaction delay
    return { request, kind: 'serve', tossTime, strikePos };
  }

  /** Spin vector (world) for a ball travelling from `from` to `to`: top > 0 topspin, side about +Y. */
  private spinVector(from: Vector3, to: Vector3, top: number, side: number): Vector3 {
    const dx = to.x - from.x, dz = to.z - from.z;
    const l = Math.hypot(dx, dz) || 1;
    // topspin axis = ŷ × d̂ = (d.z, 0, −d.x)
    return new Vector3((dz / l) * top, side, (-dx / l) * top);
  }

  private chooseShot(ball: BallState, p: PathPoint, opp: Vector3, pressure: number, hardness: number, rally: number, wantSmash: boolean): { kind: StrokeKind; request: ShotRequest } {
    const d = this.d;
    const r = this.rng;
    const s = this.sign;
    const vh = Math.hypot(p.vel.x, p.vel.z) || 1;
    // incoming topspin relative to travel: ω·(ŷ × v̂)
    const inTop = (ball.spin.x * p.vel.z - ball.spin.z * p.vel.x) / vh;
    const above = p.pos.y - NET_TOP;
    const dz = s * p.pos.z - HALF_L;
    const short = dz < -0.05;
    const inSpeed = p.vel.length();
    const agg = clamp(d.aggression + Math.min(rally, 10) * 0.01, 0, 1);

    let kind: StrokeKind;
    if (above > 0.2 && (wantSmash || r() < 0.35 + agg * 0.65)) kind = 'smash';
    else if (dz > 1.25) kind = inTop < -150 || p.pos.y - TOP < 0.12 ? 'chop' : r() < 0.5 ? 'lob' : 'drive';
    else if (short && above < 0.12) kind = r() < (inTop < -80 ? agg * 0.7 : 0.3 + agg * 0.5) ? 'flick' : 'push';
    else if (inTop < -150) kind = r() < 0.25 + agg * 0.7 ? 'loop' : r() < 0.6 ? 'push' : 'chop';
    else if (inTop > 250 || inSpeed > 13) {
      const x = r();
      kind = x < 0.55 - agg * 0.3 ? 'block' : x < 0.85 ? 'drive' : 'loop';
    } else kind = r() < agg ? 'loop' : above < 0.02 && r() < 0.3 ? 'push' : 'drive';

    // ── Placement ──
    const m = d.margin * (kind === 'smash' ? 1.2 : 1) + r() * 0.05;
    const xSpan = HALF_W - m;
    let tx: number;
    if (r() < d.openCourt) {
      // away from the opponent's body, to the wider side
      const open = opp.x > 0 ? -1 : 1;
      tx = open * xSpan * (0.75 + 0.25 * r());
    } else {
      tx = (r() * 2 - 1) * xSpan * (0.4 + 0.6 * d.variety);
    }
    let depth: number;
    if (kind === 'push' && r() < 0.4 + 0.3 * d.variety) depth = 0.35 + r() * 0.3;
    else if (kind === 'flick' || kind === 'block') depth = HALF_L - m - r() * 0.35;
    else depth = HALF_L - m - r() * 0.25 * (1.2 - d.variety);
    const target = new Vector3(tx, TOP, -s * depth);

    // ── Speed / spin ──
    const rnd = (a: number, b: number) => lerp(a, b, r());
    let speed: number, top: number;
    switch (kind) {
      case 'smash': speed = rnd(18, 23); top = rnd(80, 200); break;
      case 'loop': speed = rnd(11.5, 15.5); top = rnd(420, 720); break;
      case 'drive': speed = rnd(11.5, 15.5); top = rnd(180, 380); break;
      case 'block': speed = rnd(9, 12); top = rnd(60, 180); break;
      case 'push': speed = rnd(5.5, 7.5); top = -rnd(250, 450); break;
      case 'chop': speed = rnd(7, 9); top = -rnd(400, 650); break;
      case 'flick': speed = rnd(10, 13); top = rnd(250, 400); break;
      case 'lob': speed = rnd(8, 10); top = rnd(350, 500); break;
      default: speed = 8; top = 0;
    }
    speed *= kind === 'push' || kind === 'chop' ? 1 : lerp(1, d.speedScale, 0.9);
    top *= d.spinScale;
    const sideSpin = (r() * 2 - 1) * 120 * d.variety * d.spinScale;
    const spin = this.spinVector(p.pos, target, top, sideSpin);

    const kindErr: Record<StrokeKind, number> = { smash: 1.6, loop: 1.15, flick: 1.3, drive: 1.0, block: 0.9, push: 0.8, chop: 0.9, lob: 1.0, serve: 0.6 };
    const error = clamp(d.error * kindErr[kind] * (1 + hardness) * pressure, 0, 1);
    return { kind, request: { target, speed, spin, error } };
  }

  private setPlan(t: number, strikePos: Vector3, request: ShotRequest, kind: StrokeKind, willMiss: boolean, bodyTarget: Vector3, forehand: boolean) {
    const anim = STROKES[kind];
    const tContact = this.clock + t;
    // compress the stroke if the ball arrives sooner than a full swing
    const full = anim.back + anim.swing;
    const avail = Math.max(0.08, t - this.d.reaction * 0.5);
    const k = Math.min(1, avail / full);
    const a: StrokeAnim = { ...anim, back: anim.back * k, swing: anim.swing * k };
    const ax = request.target.x - strikePos.x, az = request.target.z - strikePos.z;
    const al = Math.hypot(ax, az) || 1;
    const hand = forehand ? 1 : -1;
    const off = (o: [number, number, number]) =>
      new Vector3(strikePos.x + o[0] * hand * this.right, strikePos.y + o[1], strikePos.z + o[2] * this.fwd);
    const backPos = off(a.backOff);
    backPos.y = Math.max(TOP + 0.03, backPos.y);
    this.active = {
      t, strikePos, request, kind, willMiss,
      tContact,
      moveStart: this.clock + this.d.reaction,
      swingStart: tContact - a.back - a.swing,
      bodyTarget,
      forehand,
      anim: a,
      aimX: ax / al, aimZ: az / al,
      startPos: null, startRot: null,
      backPos,
      followPos: off(a.followOff),
      strokeRot: this.makeRot(forehand, a.face, ax / al, az / al),
    };
  }

  private publicPlan(): AIPlan | null {
    const p = this.active;
    if (!p) return null;
    return { t: p.t, strikePos: p.strikePos.clone(), request: p.request, kind: p.kind, willMiss: p.willMiss };
  }

  // ───────────────────────────── animation ─────────────────────────────
  private readyPaddlePos(out: Vector3): Vector3 {
    return out.set(this.body.x + 0.2 * this.right, TOP + 0.14, this.body.z + 0.38 * this.fwd);
  }

  /** Paddle rotation: blade normal (local +Z) toward the aim direction tilted by `face`; handle (local −Y) toward the hand. */
  private makeRot(forehand: boolean, face: number, aimX: number, aimZ: number): Quaternion {
    const n = new Vector3(aimX * Math.cos(face), Math.sin(face), aimZ * Math.cos(face)).normalize();
    const right = new Vector3(this.right, 0, 0);
    const back = new Vector3(0, 0, -this.fwd);
    const handle = forehand
      ? new Vector3().addScaledVector(back, 0.5).addScaledVector(right, 0.3).add(new Vector3(0, -0.6, 0))
      : new Vector3().addScaledVector(back, 0.4).addScaledVector(right, 0.6).add(new Vector3(0, -0.3, 0));
    // local Y = −handle, orthogonal to n
    const y = handle.multiplyScalar(-1);
    y.addScaledVector(n, -y.dot(n));
    if (y.lengthSq() < 1e-6) y.set(0, 1, 0).addScaledVector(n, -n.y);
    y.normalize();
    const x = new Vector3().crossVectors(y, n).normalize();
    return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(x, y, n));
  }

  update(dt: number): void {
    if (dt <= 0) return;
    this.clock += dt;
    const p = this.active;
    const d = this.d;

    // ── footwork ──
    let target = this.idleTarget;
    if (p) {
      if (this.clock >= p.moveStart && this.clock <= p.tContact + 0.05) target = p.bodyTarget;
      if (this.clock > p.tContact + p.anim.follow + 0.05) {
        this.active = null;
        this.idleTarget = this.readyPosition();
      }
    }
    for (const axis of ['x', 'z'] as const) {
      const delta = target[axis] - this.body[axis];
      const vDes = Math.sign(delta) * Math.min(d.moveSpeed, Math.sqrt(2 * d.accel * Math.abs(delta)));
      const dv = vDes - this.vel[axis];
      const maxDv = d.accel * dt;
      this.vel[axis] += clamp(dv, -maxDv, maxDv);
      this.body[axis] += this.vel[axis] * dt;
    }
    const minZ = HALF_L + 0.12;
    if (this.sign * this.body.z < minZ) {
      this.body.z = this.sign * minZ;
      this.vel.z = 0;
    }
    this.body.y = 0;

    // ── paddle ──
    const pose = this.paddle;
    const cur = this.active;
    if (cur && this.clock >= cur.swingStart) {
      if (!cur.startPos) {
        cur.startPos = pose.paddlePos.clone();
        cur.startRot = pose.paddleRot.clone();
      }
      const tau = this.clock - cur.tContact;
      const a = cur.anim;
      if (tau < -a.swing) {
        const u = smooth(clamp((this.clock - cur.swingStart) / Math.max(a.back, 1e-3), 0, 1));
        pose.paddlePos.lerpVectors(cur.startPos, cur.backPos, u);
        pose.paddleRot.slerpQuaternions(cur.startRot!, cur.strokeRot, u);
      } else if (tau <= 0) {
        const u = clamp((tau + a.swing) / Math.max(a.swing, 1e-3), 0, 1);
        const e = u * u * (2 - u); // accelerating-ish, exact at u = 1
        pose.paddlePos.lerpVectors(cur.backPos, cur.strikePos, e);
        pose.paddleRot.copy(cur.strokeRot);
      } else if (tau <= a.follow) {
        const u = clamp(tau / a.follow, 0, 1);
        pose.paddlePos.lerpVectors(cur.strikePos, cur.followPos, 1 - (1 - u) * (1 - u));
        pose.paddleRot.copy(cur.strokeRot);
      } else this.relaxPaddle(dt);
    } else this.relaxPaddle(dt);
  }

  private tmp = new Vector3();
  private relaxPaddle(dt: number) {
    const k = 1 - Math.exp(-9 * dt);
    this.paddle.paddlePos.lerp(this.readyPaddlePos(this.tmp), k);
    this.paddle.paddleRot.slerp(this.readyRot, k);
  }
}
