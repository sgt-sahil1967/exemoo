// Bale Brawl - pure duel simulation. No three, no DOM, no randomness (deterministic for tests).
// Fighters live on the duel axis X: fighter 0 starts at -ARENA.startX facing +X, fighter 1 at +startX facing -X.
// Frontal-plane angles are in each fighter's OWN frame: 0 = toward its right, PI/2 = up.
import { ARENA, FIGHT, SWING, GUARD } from './constants.js';

const PI = Math.PI;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const SUBSTEP = 1 / 120;
// fall arc: a little hop, then down to the water (y = -2.4) when the splash fires
const FALL_T = FIGHT.doubleRingout + FIGHT.fallTime;
const FALL_G = (1.2 * FALL_T - ARENA.waterY) / (FALL_T * FALL_T);

/** Wrap an angle into [0, PI): the direction-less line of an angle. */
export const lineOf = (a) => ((a % PI) + PI) % PI;

/** Swing line as seen by the defender (mirror of the attacker's frontal plane). */
export const defenderLine = (dir) => lineOf(PI - dir);

/** Angle between two lines, 0 .. PI/2. */
export function lineGap(a, b) {
  const d = Math.abs(lineOf(a) - lineOf(b));
  return Math.min(d, PI - d);
}

/** Crossing angle (0 .. PI/2) between an attacker's swing `dir` and the defender's `bladeAngle`. */
export const crossAngle = (dir, bladeAngle) => lineGap(defenderLine(dir), bladeAngle);

/** True if a guard at `bladeAngle` stops a swing travelling along `dir`. */
export const isBlocked = (dir, bladeAngle) => crossAngle(dir, bladeAngle) >= GUARD.blockMin - 1e-9;

/** Blade angle that crosses a swing best (perpendicular to its line as the defender sees it). */
export const bestGuardFor = (dir) => lineOf(defenderLine(dir) + PI / 2);

/** Knockback distance in metres. */
export function knockFor(power, { staggered = false, wrongGuard = false, scale = 1 } = {}) {
  let k = FIGHT.knockBase + FIGHT.knockPower * clamp(power, 0, 1);
  if (staggered) k *= FIGHT.staggerMul;
  if (wrongGuard) k *= FIGHT.wrongGuardMul;
  return k * scale;
}

export const NEUTRAL = Object.freeze({ live: false, yaw: 0.15, pitch: 0.45, bladeAngle: PI / 2, guard: false, swing: null });

function makeFighter(i) {
  return {
    i, face: i === 0 ? 1 : -1, x: 0, y: 0, vx: 0,
    live: false, yaw: NEUTRAL.yaw, pitch: NEUTRAL.pitch, bladeAngle: NEUTRAL.bladeAngle,
    guardHeld: false, guardT: -1, lowerT: 0,
    stun: 0, stagger: 0, staggerMax: 0,
    swing: null, swingBuf: null, swingBufT: 0, lastSwingEnd: -9,
    out: false, outT: 0, outDir: 0, splashed: false,
    edgeCooldown: 0, teetering: false, walking: 0,
    // last things that happened to this fighter (for animation): { type, t, ... }
    react: null,
  };
}

export class Combat {
  constructor() {
    this.f = [makeFighter(0), makeFighter(1)];
    this.knockScale = 1;
    this.reset();
  }

  get fighters() { return this.f; }

  reset() {
    this.time = 0;
    this.active = false;
    this.ending = false;      // a ring-out happened, waiting for the double-ring-out window
    this.over = false;        // ring-out event emitted
    this.ringoutAt = 0;
    this.result = null;       // { loser, winner }
    this.splashDone = false;
    this.scale = 1; this.scaleFrom = 1; this.scaleTo = 1; this.scaleT = 0; this.scaleDur = 0;
    this.knockScale = 1;
    this.pendingStrikes = [];
    for (const F of this.f) {
      const i = F.i;
      Object.assign(F, makeFighter(i));
      F.x = i === 0 ? -ARENA.startX : ARENA.startX;
    }
  }

  setActive(on) { this.active = !!on && !this.over && !this.ending; }

  setKnockScale(k) { this.knockScale = Math.max(0, +k || 0); }

  /** Shrink (or grow) the arena to `scale` of ARENA.radius over `seconds`. */
  setArenaScale(scale, seconds = 0) {
    this.scaleFrom = this.scale;
    this.scaleTo = clamp(scale, 0.1, 1);
    this.scaleT = 0;
    this.scaleDur = Math.max(0, seconds);
    if (this.scaleDur === 0) this.scale = this.scaleTo;
  }

  get arenaRadius() { return ARENA.radius * this.scale; }

  gap() { return this.f[1].x - this.f[0].x; }

  /** 0 = safe (start area) .. 1 = on the rim. */
  edgeOf(i, x = this.f[i].x) {
    const R = this.arenaRadius, inner = Math.min(FIGHT.engageGap / 2, R * 0.5);
    return clamp((Math.abs(x) - inner) / Math.max(0.3, R - inner), 0, 1);
  }

  guardCounts(F) { return F.guardHeld && F.guardT >= GUARD.raiseTime; }

  canAct(F) { return !F.out && F.stun <= 0 && F.stagger <= 0; }

  snapshot() {
    return {
      arenaRadius: this.arenaRadius,
      fighters: this.f.map((F) => ({
        x: F.x, edge: this.edgeOf(F.i), guard: this.guardCounts(F), stagger: Math.max(0, F.stagger),
        bladeAngle: F.bladeAngle, live: F.live,
      })),
    };
  }

  /**
   * Advance the duel. `intents` = [SwordIntent|null, SwordIntent|null]. Swings in intents are consumed here.
   * Returns the events of this step: [{ type, ...payload }].
   */
  step(dt, intents = [null, null]) {
    const ev = [];
    dt = clamp(+dt || 0, 0, 0.1);
    // intents (pose, guard, swing requests) are applied once per frame, then the physics substeps
    for (let k = 0; k < 2; k++) this.applyIntent(this.f[k], this.active ? intents[k] : null, ev);
    let left = dt;
    while (left > 1e-9) {
      const h = Math.min(SUBSTEP, left);
      left -= h;
      this.substep(h, ev);
    }
    return ev;
  }

  applyIntent(F, it, ev) {
    if (F.out) return;
    const I = it || NEUTRAL;
    F.live = !!(it && it.live);
    if (it && it.live) {
      F.yaw = clamp(+I.yaw || 0, -1.4, 1.4);
      F.pitch = clamp(+I.pitch || 0, -1.2, 1.4);
      F.bladeAngle = lineOf(+I.bladeAngle || 0);
    } else if (!it) {
      F.yaw = NEUTRAL.yaw; F.pitch = NEUTRAL.pitch; F.bladeAngle = NEUTRAL.bladeAngle;
    }
    // guard
    const wantGuard = !!I.guard && this.canAct(F) && !F.swing;
    if (wantGuard && !F.guardHeld) { F.guardHeld = true; F.guardT = 0; }
    else if (!wantGuard && F.guardHeld) { F.guardHeld = false; F.guardT = -1; F.lowerT = GUARD.lowerTime; }
    // swing request (buffered briefly so a swing pressed during recovery still comes out)
    if (I.swing && !F.guardHeld) { F.swingBuf = { ...I.swing }; F.swingBufT = 0.2; }
    else if (I.swing && F.guardHeld) F.swingBuf = null;
    this.tryStartSwing(F, ev);
  }

  tryStartSwing(F, ev) {
    if (!F.swingBuf || !this.active || this.ending) return;
    if (!this.canAct(F) || F.swing || F.guardHeld || F.lowerT > 0) return;
    const s = F.swingBuf;
    F.swingBuf = null;
    const windup = s.windup != null ? clamp(+s.windup, 0, 1.5) : SWING.humanDelay;
    F.swing = {
      dir: Math.atan2(Math.sin(+s.dir || 0), Math.cos(+s.dir || 0)), power: clamp(+s.power || 0, 0, 1),
      windup, t: 0, phase: 'windup', result: null,
    };
    ev.push({ type: 'swing', i: F.i, dir: F.swing.dir, power: F.swing.power });
  }

  substep(h, ev) {
    this.time += h;
    // arena shrink
    if (this.scale !== this.scaleTo) {
      this.scaleT += h;
      const k = this.scaleDur > 0 ? clamp(this.scaleT / this.scaleDur, 0, 1) : 1;
      this.scale = this.scaleFrom + (this.scaleTo - this.scaleFrom) * k;
    }
    const [A, B] = this.f;
    for (const F of this.f) {
      if (F.stun > 0) F.stun = Math.max(0, F.stun - h);
      if (F.stagger > 0) F.stagger = Math.max(0, F.stagger - h);
      if (F.lowerT > 0) F.lowerT = Math.max(0, F.lowerT - h);
      if (F.guardHeld) F.guardT += h;
      if (F.swingBufT > 0) { F.swingBufT -= h; if (F.swingBufT <= 0) F.swingBuf = null; }
      if (F.edgeCooldown > 0) F.edgeCooldown -= h;
      if (F.swing) {
        F.swing.t += h;
        if (F.swing.phase === 'strike' && F.swing.t >= F.swing.windup + SWING.strikeTime) {
          F.swing = null;
          F.lastSwingEnd = this.time;
        }
      }
      this.tryStartSwing(F, ev);
    }
    // strikes landing this substep (both checked before resolving, so simultaneous strikes clash)
    const landing = this.f.filter((F) => F.swing && F.swing.phase === 'windup' && F.swing.t >= F.swing.windup);
    if (landing.length) this.resolveStrikes(landing, ev);

    // auto footwork: walk toward the rival until the gap is engageGap (never retreat)
    const gap = B.x - A.x;
    const want = gap - FIGHT.engageGap;
    for (const F of this.f) {
      F.walking = 0;
      const rival = this.f[1 - F.i];
      if (!this.active || this.ending || F.out || rival.out || !this.canAct(F) || want <= 0) continue;
      // the fighter nearer the rim mostly holds its ground (a shoved fighter stays shoved);
      // the one nearer the middle presses in
      const rimSide = Math.abs(F.x) > Math.abs(rival.x) + 0.05;
      const rivalMoves = this.canAct(rival) && !rival.out;
      const share = !rivalMoves ? 1 : rimSide ? FIGHT.rimWalk / (1 + FIGHT.rimWalk)
        : Math.abs(Math.abs(F.x) - Math.abs(rival.x)) <= 0.05 ? 0.5 : 1 / (1 + FIGHT.rimWalk);
      const speed = FIGHT.walkSpeed * (F.guardHeld ? 0.5 : 1) * (rimSide ? FIGHT.rimWalk : 1);
      const step = Math.min(speed * h, want * share);
      F.x += F.face * step;
      F.walking = step / h;
    }

    // knock slide: velocity decays with time constant knockDecay (exact integration, total = v0 * tau)
    const tau = FIGHT.knockDecay, e = Math.exp(-h / tau);
    for (const F of this.f) {
      if (F.out) continue;
      if (F.vx !== 0) {
        F.x += F.vx * tau * (1 - e);
        F.vx *= e;
        if (Math.abs(F.vx) < 1e-4) F.vx = 0;
      }
    }
    // bodies never pass through each other
    if (!A.out && !B.out && B.x - A.x < FIGHT.minGap) {
      const mid = (A.x + B.x) / 2;
      A.x = mid - FIGHT.minGap / 2; B.x = mid + FIGHT.minGap / 2;
    }

    // teeter + ring-out
    const R = this.arenaRadius;
    for (const F of this.f) {
      if (F.out) {
        F.outT += h;
        // fall: keeps drifting outward, arcs down into the pond
        const t = F.outT;
        if (!F.splashed) F.x += F.outDir * Math.max(0.6, 1.6 - t) * h;
        F.y = Math.max(ARENA.waterY - 0.6, 1.2 * t - FALL_G * t * t);
        continue;
      }
      const ax = Math.abs(F.x);
      const teeter = ax > R - ARENA.teeter;
      if (teeter && !F.teetering && F.edgeCooldown <= 0) {
        ev.push({ type: 'edge', i: F.i });
        F.edgeCooldown = 1;
      }
      F.teetering = teeter;
      if (ax > R) {
        F.out = true; F.outT = 0; F.outDir = Math.sign(F.x) || 1; F.vx = 0;
        F.swing = null; F.swingBuf = null; F.guardHeld = false; F.guardT = -1;
        if (!this.ending && !this.over) { this.ending = true; this.ringoutAt = this.time; }
      }
    }
    if (this.ending && !this.over && this.time - this.ringoutAt >= FIGHT.doubleRingout - 1e-9) {
      this.over = true; this.ending = false; this.active = false;
      const loser = A.out && B.out ? -1 : A.out ? 0 : 1;
      this.result = { loser, winner: loser === -1 ? -1 : 1 - loser };
      this.ringoutAt = this.time - FIGHT.doubleRingout;
      ev.push({ type: 'ringout', loser, winner: this.result.winner });
    }
    if (this.over && !this.splashDone) {
      const firstOut = Math.max(A.out ? A.outT : 0, B.out ? B.outT : 0);
      if (firstOut >= FALL_T - 1e-9) {
        this.splashDone = true;
        for (const F of this.f) if (F.out) F.splashed = true;
        ev.push({ type: 'splash', loser: this.result.loser });
      }
    }
  }

  resolveStrikes(landing, ev) {
    const gap = Math.abs(this.f[1].x - this.f[0].x);
    // clash: both strikes meet (the other one lands within clashWindow of this one)
    if (landing.length === 1) {
      const F = landing[0], O = this.f[1 - F.i];
      if (O.swing && O.swing.phase === 'windup' && O.swing.windup - O.swing.t <= FIGHT.clashWindow && gap < FIGHT.reach) {
        landing = [F, O];
      }
    }
    if (landing.length === 2 && gap < FIGHT.reach) {
      for (const F of landing) {
        F.swing.phase = 'strike'; F.swing.t = Math.max(F.swing.t, F.swing.windup); F.swing.result = 'clash';
        F.vx += -F.face * FIGHT.clashPush / FIGHT.knockDecay;
        F.react = { type: 'clash', t: this.time };
      }
      ev.push({ type: 'clash' });
      return;
    }
    for (const F of landing) {
      if (!F.swing) continue;   // cancelled by the other strike this substep
      F.swing.phase = 'strike';
      const V = this.f[1 - F.i];
      if (gap >= FIGHT.reach || V.out) { F.swing.result = 'whiff'; continue; }
      const s = F.swing;
      if (this.guardCounts(V) && isBlocked(s.dir, V.bladeAngle)) {
        const perfect = V.guardT < GUARD.perfectWindow;
        s.result = 'block';
        F.stagger = perfect ? GUARD.staggerPerfect : GUARD.staggerOnBlock;
        F.staggerMax = F.stagger;
        F.swingBuf = null;
        V.vx += V.face * -1 * GUARD.blockerSlide / FIGHT.knockDecay;
        F.react = { type: 'blocked', t: this.time, perfect };
        V.react = { type: 'block', t: this.time, perfect };
        ev.push({ type: 'block', attacker: F.i, blocker: V.i, perfect });
        continue;
      }
      const knock = knockFor(s.power, {
        staggered: V.stagger > 0, wrongGuard: this.guardCounts(V), scale: this.knockScale,
      });
      s.result = 'hit';
      // victim is shoved away from the attacker
      V.vx += -V.face * knock / FIGHT.knockDecay;
      V.stun = FIGHT.hitStun;
      V.stagger = 0;
      V.swing = null; V.swingBuf = null;
      if (V.guardHeld) { V.guardHeld = false; V.guardT = -1; V.lowerT = GUARD.lowerTime; }
      V.react = { type: 'hit', t: this.time, power: s.power, dir: s.dir, knock };
      const edge = this.edgeOf(V.i, V.x - V.face * knock);
      ev.push({ type: 'hit', attacker: F.i, victim: V.i, power: s.power, knock, edge });
    }
  }
}
