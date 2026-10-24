// Camera batting for Exemoo Cricket (no three.js, so Node tests can import it).
//
// Input: the shell camera's raw 2D pose (`pose.img`, mirrored like a mirror, y down, 0…1) at ~30 fps.
// Output: swing intents {direction, lift, power, onsetAt, contactAt}:
//   direction  radians, 0 = straight back past the bowler, + = off side (screen right), − = leg side
//   lift       0…1, how much the stroke goes up (lofted)
//   power      0…1, from how far and how fast the hands travel
//   contactAt  when the bat meets the ball (epoch ms): swing onset + a lead that shrinks for fast swings
//
// ArmTracker follows shoulder → elbow → wrist on both arms, learns the player's limb lengths and coasts a
// joint that blurs out of a fast swing from its last angle and spin (≤ 0.2 s). SwingDetector watches the
// hands (mid-wrists) in body widths per second, finds where they left rest, and reads the stroke from
// there: sideways vs. forward sets the direction (mostly-sideways strokes go squarer), upward share sets
// the lift. The intent keeps refining while the swing is under way; the game reads it at contact.
// A quick backlift may start a swing; when the hands then turn round into the real stroke, the swing
// restarts from that turning point. Frame-to-frame jumps no human can make are tracking glitches.

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));

/** A joint counts as seen at this MediaPipe visibility (wrists blur and drop first). */
const MIN_VIS = 0.35;
/** A missing joint is coasted from its last angle and spin for at most this long (ms). */
const COAST_MS = 200;

/** Hands speed (body widths / s) that starts a swing, and below which they are "at rest". */
export const SWING_ON = 3.5;
const REST = 1.6;
/** Faster than this (body widths / s) between two frames is a tracking glitch, not a hand. */
const GLITCH = 45;
/** Stroke lead: from onset to bat-on-ball, shorter for faster swings (s). */
/**
 * Bat-on-ball comes this long after the hands leave rest (s). Fixed, so the same start always meets the ball
 * at the same moment (the timing bar's SWING cue uses it); a speed-dependent lead made timing feel random.
 */
export const SWING_LEAD = 0.2;

const P = (a) => (a && (a[2] ?? 1) >= MIN_VIS ? a : null);

export class ArmTracker {
  scale = 0; // body width in frame-height units
  arms = [ArmTracker.#newArm(), ArmTracker.#newArm()];

  static #newArm() {
    return { upper: 0, fore: 0, n: 0, uAng: 0, fAng: 0, uSpin: 0, fSpin: 0, at: -Infinity, elbowSeen: -Infinity, wristSeen: -Infinity, elbow: null, wrist: null };
  }

  reset() {
    this.scale = 0;
    this.arms = [ArmTracker.#newArm(), ArmTracker.#newArm()];
  }

  /**
   * One camera frame → {hands:{x,y}, scale, real} in frame-height units (x scaled by aspect), or null.
   * `real` is false when the hands were coasted rather than seen.
   */
  update(img, at, aspect = 4 / 3) {
    if (!img) return null;
    const pt = (n) => {
      const p = P(img[n]);
      return p ? { x: p[0] * aspect, y: p[1] } : null;
    };
    const sh = [pt('ls'), pt('rs')], hip = [pt('lh'), pt('rh')];
    // Body width: shoulder width, or 0.6 × torso length when side-on (shoulders overlap in the image).
    if (sh[0] && sh[1]) {
      const sw = Math.hypot(sh[0].x - sh[1].x, sh[0].y - sh[1].y);
      let w = sw;
      if (hip[0] && hip[1]) {
        const torso = Math.hypot((sh[0].x + sh[1].x - hip[0].x - hip[1].x) / 2, (sh[0].y + sh[1].y - hip[0].y - hip[1].y) / 2);
        w = Math.max(sw, torso * 0.6);
      }
      if (w > 0.02) this.scale = this.scale ? this.scale * 0.8 + w * 0.2 : w;
    }
    if (!this.scale) return null;
    const wrists = [];
    for (let c = 0; c < 2; c++) {
      const w = this.#arm(this.arms[c], sh[c], pt(c ? 're' : 'le'), pt(c ? 'rw' : 'lw'), at);
      if (w) wrists.push(w);
    }
    if (!wrists.length) return null;
    const real = wrists.filter((w) => w.real);
    const use = real.length ? real : wrists;
    return {
      hands: { x: use.reduce((s, w) => s + w.p.x, 0) / use.length, y: use.reduce((s, w) => s + w.p.y, 0) / use.length },
      scale: this.scale,
      real: real.length > 0,
    };
  }

  #arm(a, S, E, W, at) {
    const dt = (at - a.at) / 1000;
    const fresh = dt > 0 && dt * 1000 <= COAST_MS;
    if (E) a.elbowSeen = at;
    if (W) a.wristSeen = at;
    // Learn limb lengths (in body widths) from clean frames, ignoring wild ones.
    if (S && E && W) {
      const u = Math.hypot(E.x - S.x, E.y - S.y) / this.scale, f = Math.hypot(W.x - E.x, W.y - E.y) / this.scale;
      const ok = (v, m) => a.n < 3 || (v > m * 0.6 && v < m * 1.6);
      if (ok(u, a.upper) && ok(f, a.fore)) {
        a.upper = a.n ? a.upper * 0.7 + u * 0.3 : u;
        a.fore = a.n ? a.fore * 0.7 + f * 0.3 : f;
        a.n++;
      }
    }
    const learned = a.n >= 3;
    let elbow = E, wrist = W, real = !!W;
    // Coast a missing elbow from the shoulder (upper-arm angle + spin), then a missing wrist from the elbow.
    if (!elbow && S && learned && a.elbow && fresh && at - a.elbowSeen <= COAST_MS) {
      const ang = a.uAng + clamp(a.uSpin * dt, -1.5, 1.5);
      elbow = { x: S.x + a.upper * this.scale * Math.cos(ang), y: S.y + a.upper * this.scale * Math.sin(ang) };
    }
    if (!wrist && elbow && learned && a.wrist && fresh && at - a.wristSeen <= COAST_MS) {
      const ang = a.fAng + clamp(a.fSpin * dt, -1.5, 1.5);
      wrist = { x: elbow.x + a.fore * this.scale * Math.cos(ang), y: elbow.y + a.fore * this.scale * Math.sin(ang) };
    }
    // Track angles and spins (rad/s) for the next coast.
    if (S && elbow) {
      const u = Math.atan2(elbow.y - S.y, elbow.x - S.x);
      if (E && a.elbow && fresh && dt > 0) a.uSpin = a.uSpin * 0.4 + (wrapA(u - a.uAng) / dt) * 0.6;
      a.uAng = u;
    }
    if (elbow && wrist) {
      const f = Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x);
      if (W && a.wrist && fresh && dt > 0) a.fSpin = a.fSpin * 0.4 + (wrapA(f - a.fAng) / dt) * 0.6;
      a.fAng = f;
    }
    a.at = at;
    a.elbow = elbow;
    a.wrist = wrist;
    return wrist ? { p: wrist, real } : null;
  }
}

/** Stroke vector (body widths; x right, up positive) → {direction, lift}. */
export function strokeIntent(dx, up) {
  const len = Math.hypot(dx, up);
  if (len < 1e-6) return { direction: 0, lift: 0 };
  // Mostly-sideways strokes are pushed squarer (cuts, pulls); up and down strokes both count as forward.
  const side = clamp((Math.abs(dx) / (Math.abs(dx) + Math.abs(up)) - 0.5) / 0.25, 0, 1);
  const fwd = Math.abs(up) * (1 - 0.65 * side);
  // Loft is a deliberate rise: nothing below ~30° above horizontal, full at ~65°. A sideways stroke needs
  // more of it, so a cut or pull that drifts up a little stays on the ground.
  const rise = (up * (1 - 0.4 * side)) / len;
  return {
    direction: clamp(Math.atan2(dx, fwd), -2.7, 2.7),
    lift: up > 0 ? clamp((rise - 0.5) / 0.4, 0, 1) : 0,
  };
}

export class SwingDetector {
  tracker = new ArmTracker();
  /** Recent hands samples: {at, x, y, s} (s = body width at the time). */
  track = [];
  state = 'idle';
  /** The swing under way (or last finished): intent + bookkeeping. */
  swing = null;
  #restUntil = 0;
  /** When the hands were last tracked (ms), and the fastest recent hand speed (body widths / s) and when. */
  seenAt = 0;
  peakV = 0;
  peakAt = 0;

  reset() {
    this.tracker.reset();
    this.track = [];
    this.state = 'idle';
    this.swing = null;
  }

  /**
   * Feed one camera pose ({img, aspect, at}). Returns 'start' when a swing begins (its intent is in
   * `this.swing`), 'restart' when a backlift turned into the real stroke, 'update' while it refines,
   * 'end' when the hands come to rest, else null.
   */
  update(pose) {
    if (!pose?.img || typeof pose.at !== 'number') return null;
    const r = this.tracker.update(pose.img, pose.at, pose.aspect);
    if (!r) return null;
    const at = pose.at;
    this.seenAt = at;
    this.track.push({ at, x: r.hands.x, y: r.hands.y, s: r.scale });
    while (this.track.length && at - this.track[0].at > 1200) this.track.shift();
    const n = this.track.length;
    if (n < 2) return null;
    const speed = (i) => {
      const a = this.track[i - 1], b = this.track[i];
      return Math.hypot(b.x - a.x, b.y - a.y) / b.s / (Math.max(1, b.at - a.at) / 1000);
    };
    const v = speed(n - 1);
    if (v <= GLITCH && (v >= this.peakV || at - this.peakAt > 1000)) (this.peakV = v), (this.peakAt = at);
    if (v > GLITCH) {
      this.track = [this.track[n - 1]]; // re-baseline from the new position
      return null;
    }

    if (this.state === 'idle') {
      if (at < this.#restUntil || v < SWING_ON) return null;
      // Onset: walk back to where the hands left rest (≤ 400 ms), or to where they turned round (a slow
      // backlift before the stroke is not part of it: counting it would time the shot too early).
      const step = (k) => [this.track[k].x - this.track[k - 1].x, this.track[k].y - this.track[k - 1].y];
      const [cx, cy] = step(n - 1);
      let i = n - 1;
      while (i > 1 && speed(i - 1) > REST && at - this.track[i - 1].at < 400) {
        const [px, py] = step(i - 1);
        if (px * cx + py * cy <= 0) break; // moving the other way: that was the backlift
        i--;
      }
      const start = this.track[i - 1];
      this.state = 'swing';
      this.swing = { onsetAt: start.at, start, peak: v, startedAt: at, lastAt: at, movedAt: at, restarts: 0 };
      this.#refine();
      return 'start';
    }
    if (this.state === 'swing') {
      const sw = this.swing;
      // Turned round (backlift → stroke): restart from the turning point, at most twice.
      const a = this.track[n - 2], b = this.track[n - 1];
      const sx = sw.best.x - sw.start.x, sy = sw.best.y - sw.start.y, mx = b.x - a.x, my = b.y - a.y;
      const strokeLen = Math.hypot(sx, sy) / sw.start.s;
      if (v > SWING_ON && sw.restarts < 2 && strokeLen > 0.4 && (sx * mx + sy * my) < -0.5 * Math.hypot(sx, sy) * Math.hypot(mx, my)) {
        const turn = sw.best;
        Object.assign(sw, { onsetAt: turn.at, start: turn, peak: v, startedAt: at, lastAt: at, movedAt: at, restarts: sw.restarts + 1 });
        this.#refine();
        return 'restart';
      }
      sw.peak = Math.max(sw.peak, v);
      sw.lastAt = at;
      if (v >= REST) sw.movedAt = at;
      this.#refine();
      // Ends after 0.2 s at rest (a pause at the top of the backlift is not the end) or 0.8 s overall.
      if (at - sw.movedAt >= 200 || at - sw.onsetAt > 800) {
        this.state = 'idle';
        this.#restUntil = at + 150;
        return 'end';
      }
      return 'update';
    }
    return null;
  }

  /** Recompute the intent from the stroke so far: start → furthest point reached (body widths). */
  #refine() {
    const sw = this.swing, s0 = sw.start;
    let best = null, bestD = -1;
    for (const p of this.track) {
      if (p.at < sw.onsetAt) continue;
      const d = Math.hypot(p.x - s0.x, p.y - s0.y);
      if (d > bestD) (bestD = d), (best = p);
    }
    sw.best = best;
    const dx = (best.x - s0.x) / s0.s, up = -(best.y - s0.y) / s0.s;
    const length = Math.hypot(dx, up);
    const { direction, lift } = strokeIntent(dx, up);

    Object.assign(sw, {
      dx, up, length, direction, lift,
      // Full power from a full, brisk swing (~1.8 body widths of travel at ~10 body widths/s); gentle
      // pushes (well under a body width, slow) stay below 0.3, which plays as a block.
      power: clamp(0.55 * clamp((length - 0.3) / 1.5, 0, 1) + 0.45 * clamp((sw.peak - 2) / 8, 0, 1), 0, 1),
      contactAt: sw.onsetAt + SWING_LEAD * 1000,
    });
  }
}
