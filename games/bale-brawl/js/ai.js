// Bale Brawl - CPU rival. Produces a SwordIntent from the combat state, like a human holding a phone.
// Blocks are geometric (same rule as a human). Skill = how well and how fast it reads the rival's blade,
// how often it guards, how it times attacks. Seeded RNG so tests are deterministic.
import { AI, FIGHT } from './constants.js';
import { lineOf, defenderLine, bestGuardFor, isBlocked } from './combat.js';

const PI = Math.PI;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

export function seededRng(seed = 1) {
  let a = (seed * 2654435761) >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Swing line (attacker frame) a rival's blade pose suggests: blade high = chop, blade to a side = slash. */
export function predictSwingLine(pose) {
  if (pose.pitch > 0.75) return PI / 2;                 // cocked overhead: a chop comes down
  if (Math.abs(pose.yaw) > 0.6) return 0;               // pulled to a side: a slash sweeps across
  return lineOf(pose.bladeAngle);                       // otherwise the blade line is where it will travel
}

/** Blade angle for the defender that crosses a swing travelling along `line` (attacker frame). */
const crossGuard = (line) => bestGuardFor(line);

/** Eight swing directions, weighted toward plain slashes and chops. */
const DIRS = [0, PI, -PI / 2, PI / 2, -PI / 4, -3 * PI / 4, PI / 4, 3 * PI / 4];
const DIR_W = [3, 3, 3, 1, 1.5, 1.5, 0.6, 0.6];

/**
 * createAI({ level, index, combat, seed }) -> Control
 *   combat: the Combat instance (reads fighters, gap, edge)
 */
export function createAI({ level = 'normal', index = 1, combat, seed = 7 } = {}) {
  const P = AI[level] || AI.normal;
  const rnd = seededRng(seed + index * 101);
  const between = (a, b) => a + (b - a) * rnd();
  const pickDir = () => {
    let total = 0;
    for (const w of DIR_W) total += w;
    let r = rnd() * total;
    for (let k = 0; k < DIRS.length; k++) { r -= DIR_W[k]; if (r <= 0) return DIRS[k]; }
    return 0;
  };

  const S = {
    t: 0,
    attackIn: between(P.gapMin, P.gapMax) * 0.6 + 0.4,
    guard: false, guardAngle: PI / 2, guardFor: 0, guardCool: 0,
    readHist: [],          // { t, line } rival's predicted swing line over time
    readLine: null, readGuard: PI / 2,
    seenSwing: null,       // rival swing object we already reacted to
    lastRivalStagger: 0, counterDone: false,
    comboPending: -1,
    windupPose: null,      // { dir, until } pose cocked before a strike
    pendingSwing: null,
    lastResult: null,
    yaw: 0.15, pitch: 0.45, bladeAngle: PI / 2,
    reactUntil: 0, wasBusy: false,
    rivalLines: [],        // lines of the rival's recent swings (habit reading)
    lastRivalSwing: null,
  };

  function me() { return combat.fighters[index]; }
  function rival() { return combat.fighters[1 - index]; }

  /** Pose that shows where a strike along `dir` starts (tip on the far side of the travel). */
  function cockedPose(dir) {
    const bx = -Math.cos(dir), by = -Math.sin(dir);
    return { yaw: clamp(bx * 1.0, -1.2, 1.2), pitch: clamp(0.35 + by * 0.9, -0.6, 1.3), bladeAngle: lineOf(dir) };
  }

  function strike(dir, power, windup) {
    S.pendingSwing = { dir, power, windup };
    S.windupPose = { ...cockedPose(dir), until: S.t + windup + 0.2 };
    S.guard = false;
  }

  function chooseAttackDir(R) {
    // slip past a raised guard by swinging along it
    if (R.guardHeld && rnd() < P.slip) {
      const b = R.bladeAngle;
      const d = lineOf(PI - b);      // our swing line whose mirror equals the rival's blade line
      return rnd() < 0.5 ? d : d - PI;
    }
    return pickDir();
  }

  function read(dt = 0) {
    dt = Math.max(0, +dt || 0);
    S.t += dt;
    const M = me(), R = rival();
    const gap = Math.abs(R.x - M.x);
    const inReach = gap < FIGHT.reach + 0.25;
    const busy = M.out || M.stun > 0 || M.stagger > 0;

    // ── perception: rival pose, delayed by readDelay; repeated swings are read as a habit ──
    if (R.swing && R.swing !== S.lastRivalSwing) {
      S.lastRivalSwing = R.swing;
      S.rivalLines.push(lineOf(R.swing.dir));
      if (S.rivalLines.length > 3) S.rivalLines.shift();
    }
    const L = S.rivalLines;
    const habit = L.length >= 2 && Math.abs(lineOf(L[L.length - 1] - L[L.length - 2] + PI / 2) - PI / 2) < 0.3
      ? L[L.length - 1] : null;
    const line = habit != null && !(R.pitch > 0.75 || Math.abs(R.yaw) > 0.6) ? habit : predictSwingLine(R);
    S.readHist.push({ t: S.t, line });
    while (S.readHist.length > 2 && S.t - S.readHist[1].t > P.readDelay) S.readHist.shift();
    const seen = S.readHist[0];
    if (S.t - seen.t >= P.readDelay * 0.98 || S.readLine == null) {
      if (S.readLine == null || Math.abs(lineOf(seen.line - S.readLine + PI / 2) - PI / 2) > 0.35) {
        S.readLine = seen.line;
        const ok = rnd() < P.readAcc;
        S.readGuard = ok ? lineOf(crossGuard(seen.line) + (rnd() - 0.5) * 0.4)
          : lineOf(defenderLine(seen.line) + (rnd() - 0.5) * 0.7);
      }
    }

    // a visible wind-up (telegraphed strike): react if we see it in time
    if (R.swing && R.swing.phase === 'windup' && R.swing !== S.seenSwing && R.swing.t >= P.readDelay) {
      S.seenSwing = R.swing;
      if (!busy && inReach && rnd() < P.guardUp + 0.15) {
        const ok = rnd() < P.readAcc;
        S.guard = true;
        S.guardAngle = ok ? lineOf(bestGuardFor(R.swing.dir) + (rnd() - 0.5) * 0.3) : lineOf(defenderLine(R.swing.dir) + (rnd() - 0.5) * 0.6);
        S.guardFor = Math.max(S.guardFor, 0.55);
        S.reactUntil = S.t + (R.swing.windup - R.swing.t) + 0.15;
        S.pendingSwing = null; S.windupPose = null;
      }
    }

    // ── our own results (combo after a hit, cool off after a block) ──
    if (R.react && R.react.type === 'hit' && R.react !== S.lastResult) {
      S.lastResult = R.react;
      if (P.combo > 0 && rnd() < P.combo) S.comboPending = S.t + 0.22;
    }

    // ── guard uptime while in reach ──
    if (S.wasBusy && !busy) {
      // just recovered from a hit or a stagger: a sharp CPU covers up straight away
      S.guard = inReach && rnd() < Math.min(0.95, P.guardUp + 0.1);
      S.guardFor = S.guard ? between(0.5, 0.9) : between(0.2, 0.4);
    }
    S.wasBusy = busy;
    if (!busy && !S.pendingSwing && !M.swing) {
      S.guardFor -= dt;
      if (S.guardFor <= 0) {
        if (inReach && R.out === false) {
          // alternate guard / open windows so the guard is up about P.guardUp of the time
          const up = rnd() < P.guardUp;
          S.guard = up;
          S.guardFor = up ? between(0.4, 0.9) : between(0.3, 0.7) * (1 - P.guardUp + 0.3);
        } else { S.guard = false; S.guardFor = 0.3; }
      }
    }
    if (S.guard && !(S.t < S.reactUntil)) S.guardAngle = S.readGuard;

    // ── attacks ──
    let swing = null;
    if (!busy && combat.active) {
      S.attackIn -= dt;
      const edgePress = R.teetering || combat.edgeOf(R.i) > 0.6;
      const pressMul = edgePress && AI.pressEdge[level] ? AI.pressEdge[level] : 1;
      // punish a staggered rival
      if (R.stagger > 0.25 && !S.counterDone && inReach && !M.swing) {
        S.counterDone = true;
        if (rnd() < P.counter) {
          strike(pickDir(), between(Math.max(P.powMin, 0.6), P.powMax), Math.min(P.windup, R.stagger - 0.1));
          S.attackIn = between(P.gapMin, P.gapMax) * pressMul;
        }
      }
      if (R.stagger <= 0) S.counterDone = false;
      if (S.comboPending > 0 && S.t >= S.comboPending && !M.swing) {
        S.comboPending = -1;
        if (gap < FIGHT.reach + 0.3) strike(pickDir(), between(P.powMin, P.powMax), P.windup * 0.8);
      }
      if (S.attackIn <= 0 && !S.pendingSwing && !M.swing) {
        if (gap < FIGHT.reach - 0.05) {
          strike(chooseAttackDir(R), between(P.powMin, P.powMax), P.windup);
          S.attackIn = between(P.gapMin, P.gapMax) * pressMul;
        } else S.attackIn = 0.15;
      }
      // the strike leaves once the guard is down long enough
      if (S.pendingSwing && !M.guardHeld && M.lowerT <= 0) {
        swing = S.pendingSwing;
        S.pendingSwing = null;
        S.guard = false;
      }
    } else if (busy) {
      S.pendingSwing = null;
      S.comboPending = -1;
    }

    // ── pose ──
    const guarding = S.guard && !S.pendingSwing && !M.swing && !busy;
    let ty, tp, ta;
    if (guarding) {
      ta = S.guardAngle;
      ty = Math.cos(ta) * 0.25; tp = 0.25 + Math.sin(ta) * 0.35;
    } else if (S.windupPose && S.t < S.windupPose.until) {
      ty = S.windupPose.yaw; tp = S.windupPose.pitch; ta = S.windupPose.bladeAngle;
    } else {
      S.windupPose = null;
      ty = 0.18 + Math.sin(S.t * 1.3 + index) * 0.12;
      tp = 0.45 + Math.sin(S.t * 0.9) * 0.1;
      ta = lineOf(PI / 2 + Math.sin(S.t * 0.7) * 0.25);
    }
    const k = 1 - Math.exp(-dt / 0.08);
    S.yaw += (ty - S.yaw) * k;
    S.pitch += (tp - S.pitch) * k;
    if (guarding) S.bladeAngle = ta;
    else {
      let d = ta - S.bladeAngle;
      d = lineOf(d + PI / 2) - PI / 2;
      S.bladeAngle = lineOf(S.bladeAngle + d * k);
    }
    return { live: true, yaw: S.yaw, pitch: S.pitch, bladeAngle: S.bladeAngle, guard: guarding, swing };
  }

  return {
    level,
    read,
    recenter() {},
    /** test helper: would the current guard stop a swing along dir? */
    wouldBlock(dir) { return S.guard && isBlocked(dir, S.guardAngle); },
    get state() { return S; },
  };
}

