/**
 * Accessible hitting — the pure rules (unit tested in hitTiming.test.ts).
 *
 * The game moves your player and paddle to the ball automatically. Your only job is to swing
 * (or tap the phone's big button) while the timing ring around the ball closes. Any swing inside
 * the window returns the ball: the closer to the ring closing, the better ("PERFECT" → "GOOD" →
 * "EARLY"/"LATE", which are weaker and less accurate but still go over the net).
 *
 * Times are "eta" = seconds until the ball reaches the ideal contact point when the swing arrived
 * (+ = early, − = late). A swing that arrives early is held and played at the ideal moment.
 *
 * TUNING: everything you'd want to tweak lives in HIT below.
 */

export const HIT = {
  /** Window opens this long before ideal contact (assist 0 → 1). The ring starts closing here. */
  openAt: [0.6, 0.95] as const,
  /** A swing up to this much before the window opens is still accepted (held until contact). */
  buffer: 0.18,
  /**
   * The ring closes at eta = ringLead, not 0: motion sensors report a swing at its peak and the
   * network adds a few frames, so a swing started "when the ring closes" arrives at ~eta 0.
   */
  ringLead: 0.1,
  /** Centre of the sweet spot (eta). Slightly early on purpose — same latency reasoning. */
  sweet: 0.04,
  /** Half-widths around `sweet` for PERFECT and GOOD (assist 0 → 1). */
  perfect: [0.08, 0.14] as const,
  good: [0.17, 0.27] as const,
  /** Latest swing that still returns the ball (assist 0 → 1). */
  lateLimit: [-0.16, -0.28] as const,
  /** Approach slow-mo while the window is open: time scale (assist 0 → 1). */
  approachScale: [1, 0.72] as const,
  /** Shot speed (m/s) for swing power 0 → 1, plus bonuses. */
  speed: { min: 5.6, max: 11.5, perfectBonus: 1.4, smashMin: 11, smashMax: 16 },
  /** Solver error by grade (0 = perfect aim). Kept small: early/late shots are weaker, not wild. */
  error: { perfect: 0.03, good: 0.06, early: 0.12, late: 0.14 } as const,
  /**
   * Per CPU level (single player only): the player's shot speed is capped so easy CPUs can keep the
   * rally going, and mistimed (early/late) shots get riskier against strong CPUs.
   */
  vsCpu: {
    rookie: { maxSpeed: 8.5, errorScale: 0.6 },
    club: { maxSpeed: 10.5, errorScale: 1 },
    pro: { maxSpeed: 14, errorScale: 2 },
    legend: { maxSpeed: 99, errorScale: 3 },
  },
  /** |aim| below this is the middle pad. */
  aimDeadzone: 0.32,
  /** Landing pads: lateral offset of the left/right pads (× half table width) and depth range (0 net … 1 end line). */
  padX: 0.55,
  depth: { min: 0.35, max: 0.82 },
} as const;

export type Grade = 'perfect' | 'good' | 'early' | 'late';
export type Zone = -1 | 0 | 1;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const by = (r: readonly [number, number], assist: number) => lerp(r[0], r[1], clamp(assist, 0, 1));

export interface TimingWindow {
  openAt: number;
  lateLimit: number;
  perfect: number;
  good: number;
  approachScale: number;
}

export function timingWindow(assist: number): TimingWindow {
  return {
    openAt: by(HIT.openAt, assist),
    lateLimit: by(HIT.lateLimit, assist),
    perfect: by(HIT.perfect, assist),
    good: by(HIT.good, assist),
    approachScale: by(HIT.approachScale, assist),
  };
}

/** Is a swing at this eta accepted at all? */
export function inWindow(eta: number, w: TimingWindow): boolean {
  return eta <= w.openAt + HIT.buffer && eta >= w.lateLimit;
}

/** Grade + quality (0.3 … 1) of a swing that arrived `eta` seconds before ideal contact. */
export function gradeSwing(eta: number, w: TimingWindow): { grade: Grade; quality: number } {
  const d = eta - HIT.sweet;
  const a = Math.abs(d);
  if (a <= w.perfect) return { grade: 'perfect', quality: 1 };
  if (a <= w.good) return { grade: 'good', quality: 0.85 - 0.1 * ((a - w.perfect) / Math.max(1e-6, w.good - w.perfect)) };
  const edge = d > 0 ? w.openAt + HIT.buffer - HIT.sweet : HIT.sweet - w.lateLimit;
  const k = clamp((a - w.good) / Math.max(1e-6, edge - w.good), 0, 1);
  return { grade: d > 0 ? 'early' : 'late', quality: lerp(0.65, 0.3, k) };
}

/** Ring fill 0 (open) … 1 (closed) for the current eta. */
export function ringFill(eta: number, w: TimingWindow): number {
  return clamp(1 - (eta - HIT.ringLead) / Math.max(1e-6, w.openAt - HIT.ringLead), 0, 1);
}

/** Cue colour state for the current eta. */
export function cueState(eta: number, w: TimingWindow): 'wait' | 'swing' | 'late' {
  if (eta < w.lateLimit) return 'late';
  if (Math.abs(eta - HIT.sweet) <= w.good) return 'swing';
  return eta < HIT.sweet ? 'late' : 'wait';
}

/** Left / middle / right from where the phone points (aimX) and which way the swing travelled (dirX). */
export function aimZone(aimX: number, dirX = 0): Zone {
  const v = clamp(aimX, -1, 1) * 0.75 + clamp(dirX, -1, 1) * 0.6;
  return v > HIT.aimDeadzone ? 1 : v < -HIT.aimDeadzone ? -1 : 0;
}

export type HumanStroke = 'drive' | 'loop' | 'push' | 'smash';

export interface ShotPlan {
  kind: HumanStroke;
  /** Ball speed after contact, m/s. */
  speed: number;
  /** Topspin rad/s (+ = topspin, − = backspin), about the hitter's local −X axis. */
  topspin: number;
  /** Landing point in the hitter's local frame: x (−left … +right, m), depth 0 (net) … 1 (end line). */
  x: number;
  depth: number;
  error: number;
}

/**
 * Shot from the swing. Defaults to a safe flat drive to the chosen pad; advanced players can add
 * spin: swing upward (brush up) for a topspin loop, chop downward / open the face for a backspin push.
 * A high ball hit hard becomes a smash.
 */
export function planShot(o: {
  power: number;
  grade: Grade;
  quality: number;
  zone: Zone;
  /** Swing direction up/down (−1 … 1). */
  lift: number;
  /** Paddle face tilt (rad; > 0 open). */
  face: number;
  /** Ball height above the net top at contact (m). */
  aboveNet: number;
  halfWidth: number;
}): ShotPlan {
  const p = clamp(o.power, 0, 1);
  let kind: HumanStroke = 'drive';
  if (o.aboveNet > 0.3 && p > 0.65 && o.grade !== 'late') kind = 'smash';
  else if (o.lift > 0.45 && p > 0.4) kind = 'loop';
  else if (o.lift < -0.45 || o.face > 0.5) kind = 'push';

  const s = HIT.speed;
  let speed = lerp(s.min, s.max, p) * (0.78 + 0.22 * o.quality) + (o.grade === 'perfect' ? s.perfectBonus * p : 0);
  if (kind === 'smash') speed = lerp(s.smashMin, s.smashMax, p) * (0.8 + 0.2 * o.quality);
  if (kind === 'push') speed = Math.min(speed, 7);
  if (kind === 'loop') speed *= 1.05;

  const topBy: Record<HumanStroke, number> = { drive: 150 + 150 * p, loop: 480 + 320 * p, push: -(260 + 160 * p), smash: 100 };
  const topspin = topBy[kind] * (0.8 + 0.2 * o.quality);

  // Early hits drift slightly toward the middle and land shorter; late ones go slightly wide and long.
  let x = o.zone * o.halfWidth * HIT.padX;
  if (o.grade === 'early') x *= 0.7;
  if (o.grade === 'late') x = x * 1.1 + (o.zone === 0 ? 0 : 0.04 * o.zone);
  let depth = lerp(HIT.depth.min + 0.1, HIT.depth.max, p);
  if (o.grade === 'early') depth -= 0.08;
  if (kind === 'push') depth = HIT.depth.min + 0.05;
  depth = clamp(depth, HIT.depth.min, HIT.depth.max);
  x = clamp(x, -o.halfWidth * 0.7, o.halfWidth * 0.7);

  const error = HIT.error[o.grade] * (kind === 'smash' ? 1.5 : 1);
  return { kind, speed, topspin, x, depth, error };
}
