// Moo Bowl throw detection: all the maths, no DOM, no three.js (Node tests import this file).
//
// Who does what (the core rule of the game):
//   CAMERA  where the hand is  -> start position `x`, launch `angle`, and WHEN the ball is thrown
//   PHONE   how the arm moves  -> `speed` (peak swing rate) and `curve` (wrist twist around release)
//
// Camera geometry. The player faces the camera, so an underarm swing moves the hand toward / away from the
// lens. From the front that shows as the wrist RISING in the image on both sides of the swing (behind the
// body on the backswing, in front on the forward swing) while the arm foreshortens. So per frame we use
//   ext  = (wrist.y - shoulder.y) / shoulder width      1.4 or so when the arm hangs, less when it swings up
//   lat  = (wrist.x - shoulder.x) / shoulder width      player's right positive (the image is mirrored)
//   side = front / back, from the MediaPipe world landmarks (wrist z against the shoulder z); when z is
//          not confident, from the order of events (a rise that follows a backswing is the forward swing)
// The swing angle is acos(ext / armLength). The RELEASE is the moment the hand, coming up in front from a
// low position, passes about 37 degrees (hip-to-waist height) fast enough, with the whole arm rising (the
// elbow comes up too: lifting the phone to look at it bends the elbow and leaves it down) and without a big
// sideways move (a wave or a side raise).
//
// Phone geometry. Device frame (W3C): x = screen right, y = screen top, z = out of the screen. `q` maps
// device -> earth (earth z = up, drift-free because gravity fixes it; heading may drift and is never used).
//   speed  from |rotation rate|: the magnitude does not care how browsers label alpha / beta / gamma.
//   curve  rotation about the FOREARM axis. Which device axis that is depends on the grip, so it is
//          measured from the swing itself: at the peak of a swing the acceleration is centripetal, along
//          the arm toward the shoulder. Browsers disagree on the sign of acceleration (iOS is inverted),
//          so the sign is fixed with gravity: rotated into the earth frame the axis must point UP.
//          The twist is then integrated from the orientation quaternion (unambiguous axes) over a short
//          window around release; rotationRate (spec order beta = x, gamma = y, alpha = z) is only the
//          fallback when the orientation stream is frozen.
//   Counter-clockwise seen from above (palm turning from forward to "handshake" for a right-hander) is a
//   hook to the LEFT = negative curve. A left-hander's natural release turns clockwise = positive curve,
//   so the mirroring for left-handers is physical and needs no sign flip.

import { THROW } from './constants.js';

// ───────────────────────────── tuning ─────────────────────────────
export const TUNING = {
  // Camera
  minVis: 0.35, // a joint counts as seen at this MediaPipe visibility
  coastMs: 200, // a hidden wrist is coasted on its last velocity for this long
  glitch: 30, // faster than this between two frames (shoulder widths / s) is a tracking glitch
  lowFrac: 0.9, // ext >= lowFrac * armLen: the hand is "low" (within about 26 deg of hanging)
  raiseFrac: 0.86, // ext below this: the hand is raised (front or back)
  releaseFrac: 0.8, // forward swing crossing this (about 37 deg) is the release
  lowToReleaseMs: 380, // the hand must have been low this recently
  minUpSpeed: 2.5, // shoulder widths / s upward at the release
  fastUp: 4.5, // without a usable depth sign, a rise this fast from rest is taken as a forward swing
  travelMs: 300, // sideways travel is measured over this long before the release (the forward swing)
  maxSideTravel: 0.6, // more sideways travel than this through the swing is a wave, not a throw
  elbowDrop: 0.93, // at release the elbow must be below this share of its hanging height under the shoulder
  zConfident: 0.09, // metres of wrist-vs-shoulder depth needed to trust front / back
  backFull: 60, // degrees of backswing that reads as swing = -1
  addressStillMs: 280, // hand calm this long (after arm()) before a throw can fire
  addressSpeed: 1.2, // "calm" = slower than this (shoulder widths / s, relative to the body)
  // Aim
  hangOffset: 0.6, // where the bowling hand hangs, shoulder widths outside the body centre
  aimGain: THROW.maxX / 0.9, // metres of lane per shoulder width of hand travel (full lane = 0.9 either way)
  angleDead: 0.07, // shoulder widths of sideways travel through the swing that still reads as straight
  angleFull: 0.38, // sideways travel that gives THROW.maxAngle
  // Phone
  imuMinRate: 170, // deg/s: below this the phone did not swing (camera candidate rejected)
  imuIdleRate: 25, // deg/s: below this for a second the phone is not in the hand at all
  armLength: 0.65, // m, shoulder to palm (speed = rate x arm length before mapping)
  speedCurve: [[120, 3.5], [300, 5.0], [480, 7.6], [700, 10.5]], // peak swing rate deg/s -> ball m/s
  twistDead: 20, // degrees of wrist turn that still reads as a straight ball
  twistFull: 75, // degrees for full curve
  twistBefore: 150, twistAfter: 60, // ms around the release that count as "the release twist"
  fuseBefore: 350, fuseAfter: 80, // ms around the camera release searched for the phone's swing peak
  fuseWaitMs: 150, // wait at most this long for phone packets that cover the release
  // Phone only (hold Action)
  lobeOn: 60, holdPeak: 220, holdPrevPeak: 70, holdReleasePeak: 130, holdDrop: 0.65,
  // Camera only
  bendDead: 0.035, bendFull: 0.16, // sideways bow of the hand path (shoulder widths) -> curve
  cooldownMs: 800,
};

// ───────────────────────────── small maths ─────────────────────────────
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const DEG = 180 / Math.PI;
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a) => Math.hypot(a[0], a[1], a[2]);
const unit = (a) => {
  const n = norm(a);
  return n > 1e-9 ? [a[0] / n, a[1] / n, a[2] / n] : [0, 0, 0];
};

/** Rotate v by the unit quaternion q. */
export function rotate(q, [x, y, z]) {
  const { x: qx, y: qy, z: qz, w } = q;
  const tx = 2 * (qy * z - qz * y), ty = 2 * (qz * x - qx * z), tz = 2 * (qx * y - qy * x);
  return [x + w * tx + (qy * tz - qz * ty), y + w * ty + (qz * tx - qx * tz), z + w * tz + (qx * ty - qy * tx)];
}

/** Body-frame (device-frame) rotation vector (rad) that takes orientation qa to qb. */
export function rotVec(qa, qb) {
  // d = conj(qa) * qb
  const ax = -qa.x, ay = -qa.y, az = -qa.z, aw = qa.w;
  let w = aw * qb.w - ax * qb.x - ay * qb.y - az * qb.z;
  let x = aw * qb.x + ax * qb.w + ay * qb.z - az * qb.y;
  let y = aw * qb.y - ax * qb.z + ay * qb.w + az * qb.x;
  let z = aw * qb.z + ax * qb.y - ay * qb.x + az * qb.w;
  if (w < 0) (w = -w), (x = -x), (y = -y), (z = -z);
  const s = Math.hypot(x, y, z);
  if (s < 1e-9) return [0, 0, 0];
  const k = (2 * Math.atan2(s, w)) / s;
  return [x * k, y * k, z * k];
}

/** Piecewise-linear map through [[x, y], ...] (sorted by x), clamped at both ends. */
export function pwl(table, x) {
  if (x <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) {
    if (x <= table[i][0]) {
      const [x0, y0] = table[i - 1], [x1, y1] = table[i];
      return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
    }
  }
  return table[table.length - 1][1];
}

/** Dead zone then a smooth rise to 1 at `full` (odd function). */
export function shaped(v, dead, full) {
  const k = clamp((Math.abs(v) - dead) / (full - dead), 0, 1);
  return Math.sign(v) * k * k * (3 - 2 * k) * (0.35 + 0.65 * k); // gentle start, full at k = 1
}

/** One-euro filter (Casiez et al.): steady when still, quick when moving. Time in seconds. */
export class OneEuro {
  constructor(minCutoff = 1.2, beta = 0.4, dCutoff = 1) {
    Object.assign(this, { minCutoff, beta, dCutoff, x: null, dx: 0, t: 0 });
  }
  reset() {
    this.x = null;
  }
  filter(v, t) {
    if (this.x === null || t <= this.t) {
      if (this.x === null) (this.x = v), (this.dx = 0);
      this.t = Math.max(this.t, t);
      return this.x;
    }
    const dt = Math.min(0.2, t - this.t);
    this.t = t;
    const a = (c) => 1 / (1 + 1 / (2 * Math.PI * c * dt));
    const d = (v - this.x) / dt;
    this.dx += a(this.dCutoff) * (d - this.dx);
    this.x += a(this.minCutoff + this.beta * Math.abs(this.dx)) * (v - this.x);
    return this.x;
  }
}

/** Peak swing rate (deg/s) -> ball speed (m/s), clamped to the THROW limits. */
export const speedFromRate = (degPerS) => clamp(pwl(TUNING.speedCurve, degPerS), THROW.minSpeed, THROW.maxSpeed);
/** Wrist twist (deg, counter-clockwise from above positive) -> curve (-1..1; CCW = hook left = negative). */
export const curveFromTwist = (deg) => clamp(-shaped(deg, TUNING.twistDead, TUNING.twistFull), -1, 1) || 0;
/** Sideways hand travel through the forward swing (shoulder widths, right positive) -> launch angle (rad). */
export const angleFromTravel = (sw) => clamp(shaped(sw, TUNING.angleDead, TUNING.angleFull) * THROW.maxAngle, -THROW.maxAngle, THROW.maxAngle) || 0;
/** Hand position across the image (shoulder widths right of the image centre) -> ball x at the foul line. */
export const aimXFromHand = (handAbs, handSign) => clamp((handAbs - handSign * TUNING.hangOffset) * TUNING.aimGain, -THROW.maxX, THROW.maxX);

// ───────────────────────────── phone: packet buffer + swing analysis ─────────────────────────────
/** Keeps the last ~2.5 s of packets as samples {at, g, rate, a, q, w, dt, held}. */
export class ImuBuffer {
  samples = [];
  lastAt = -Infinity;

  reset() {
    this.samples = [];
    this.lastAt = -Infinity;
  }

  /** p: SDK packet {at, q, acc, gyro:{alpha,beta,gamma}, buttons}. Returns the stored sample (or null). */
  push(p) {
    if (!p || typeof p.at !== 'number' || !p.q) return null;
    const prev = this.samples[this.samples.length - 1];
    if (prev && p.at <= prev.at) return null; // out of order / duplicate
    const gy = p.gyro || {};
    // Spec order: beta about x, gamma about y, alpha about z. Only used as a vector for lobe directions
    // and as the twist fallback; speed uses the magnitude, which is the same under any labelling.
    const g = [gy.beta || 0, gy.gamma || 0, gy.alpha || 0];
    const dt = prev ? Math.min(0.1, (p.at - prev.at) / 1000) : 0;
    const w = prev ? rotVec(prev.q, p.q) : [0, 0, 0];
    let rate = norm(g);
    if (rate < 0.5 && dt > 0) rate = (norm(w) / dt) * DEG; // no gyro (legacy packets): orientation rate
    const s = { at: p.at, g, rate, a: [p.acc?.x || 0, p.acc?.y || 0, p.acc?.z || 0], q: p.q, w, dt, held: !!((p.buttons || 0) & 1) };
    this.samples.push(s);
    this.lastAt = p.at;
    while (this.samples.length && p.at - this.samples[0].at > 2500) this.samples.shift();
    return s;
  }

  /** Largest rotation rate (deg/s) in [t0, t1]. */
  maxRate(t0, t1) {
    let m = 0;
    for (const s of this.samples) if (s.at >= t0 && s.at <= t1 && s.rate > m) m = s.rate;
    return m;
  }
}

/**
 * Analyse the swing whose peak lies in [t0, t1].
 * -> { peakRate (deg/s, 3-sample mean), peakAt, twist (deg, CCW from above +), axis (device frame, unit,
 *      hand -> shoulder), axisFrom: 'acc' | 'long-axis', accPeak (m/s^2), n } or null with too few samples.
 */
export function analyseSwing(samples, t0, t1, T = TUNING) {
  const idx = [];
  for (let i = 0; i < samples.length; i++) if (samples[i].at >= t0 && samples[i].at <= t1) idx.push(i);
  if (idx.length < 4) return null;
  const sm = (i) => {
    let s = 0, n = 0;
    for (let k = i - 1; k <= i + 1; k++) if (samples[k]) (s += samples[k].rate), n++;
    return s / n;
  };
  let peakRate = 0, peakAt = samples[idx[0]].at, accPeak = 0;
  for (const i of idx) {
    const r = sm(i);
    if (r > peakRate) (peakRate = r), (peakAt = samples[i].at);
    accPeak = Math.max(accPeak, norm(samples[i].a));
  }

  // Forearm axis in the device frame: rate^2-weighted mean acceleration around the peak (centripetal).
  let acc = [0, 0, 0], wsum = 0;
  for (const s of samples) {
    if (s.at < peakAt - 150 || s.at > peakAt + 80) continue;
    const w = s.rate * s.rate;
    acc = [acc[0] + s.a[0] * w, acc[1] + s.a[1] * w, acc[2] + s.a[2] * w];
    wsum += w;
  }
  let axis, axisFrom = 'acc';
  if (wsum > 0 && norm(acc) / wsum >= 4) axis = unit(acc);
  else (axis = [0, 1, 0]), (axisFrom = 'long-axis'); // phone lying along the hand: its long axis is the forearm

  // Take out whatever part of the axis lies along the swing's own rotation axis (measured before the
  // release window, where there is little twist), so the big swing rotation cannot leak into the twist.
  let sv = [0, 0, 0];
  for (const s of samples) if (s.at > peakAt - 280 && s.at <= peakAt - 100) sv = [sv[0] + s.w[0], sv[1] + s.w[1], sv[2] + s.w[2]];
  if (norm(sv) > 0.2) {
    const u = unit(sv), d = dot(axis, u);
    const o = [axis[0] - d * u[0], axis[1] - d * u[1], axis[2] - d * u[2]];
    if (norm(o) > 0.5) axis = unit(o);
  }

  // Sign: in the earth frame the axis must point up (hand -> shoulder), whatever the acceleration sign.
  let up = 0;
  for (const s of samples) if (s.at >= peakAt - 150 && s.at <= peakAt + 80) up += s.rate * s.rate * rotate(s.q, axis)[2];
  if (up < 0) axis = [-axis[0], -axis[1], -axis[2]];

  // Swing rate proper: the part of the rotation that is NOT about the forearm (a hard wrist snap must not
  // read as a faster ball). The twist share comes from the orientation stream over three samples.
  let swingPeak = 0, swingAt = peakAt;
  for (const i of idx) {
    const W = [0, 0, 0];
    for (let k = i - 1; k <= i + 1; k++) if (samples[k]) for (let c = 0; c < 3; c++) W[c] += samples[k].w[c];
    const n = norm(W), f = n > 1e-4 ? clamp(Math.abs(dot(W, axis)) / n, 0, 1) : 0;
    const r = sm(i) * Math.sqrt(1 - f * f);
    if (r > swingPeak) (swingPeak = r), (swingAt = samples[i].at);
  }
  if (swingPeak > 0) (peakRate = swingPeak), (peakAt = swingAt);

  // Twist about the axis around release, from the orientation stream; gyro if that stream is frozen.
  let tq = 0, tg = 0, moved = 0;
  for (const s of samples) {
    if (s.at <= peakAt - T.twistBefore || s.at > peakAt + T.twistAfter) continue;
    tq += dot(s.w, axis);
    tg += dot(s.g, axis) * s.dt;
    moved += norm(s.w);
  }
  const frozen = moved < 0.05 && peakRate > 100;
  return { peakRate, peakAt, twist: frozen ? tg : tq * DEG, axis, axisFrom, accPeak, twistFrom: frozen ? 'gyro' : 'orientation', n: idx.length };
}

// ───────────────────────────── phone only: hold Action and swing ─────────────────────────────
/**
 * Hold Action, swing, let go (or just swing through): fires at the swing peak.
 *  - Action released after a swing lobe (peak >= holdReleasePeak within 500 ms)        -> throw
 *  - a strong lobe (>= holdPeak) that follows a lobe the other way (the backswing) and has dropped to
 *    holdDrop of its peak                                                              -> throw (no need to let go)
 * `live.swing` follows the phone's tilt away from where it was when Action went down (-1 back .. +1 forward).
 */
export class PhoneThrow {
  holding = false;
  live = { swing: 0, holding: false };
  #lobe = null;
  #prev = null;
  #v = [0, 0, 0];
  #up0 = null;
  #tiltMax = 0;
  #fwd = false;
  #fired = false;

  reset() {
    this.holding = false;
    this.live.swing = 0;
    this.live.holding = false;
    this.#lobe = this.#prev = this.#up0 = null;
    this.#fired = false;
  }

  /** Feed one ImuBuffer sample. -> { peakAt, peak, by: 'peak' | 'release' } or null. */
  update(s, T = TUNING) {
    if (!s) return null;
    if (s.held && !this.holding) {
      this.reset();
      this.holding = this.live.holding = true;
      this.#v = [0, 0, 0];
      this.#up0 = rotate({ x: -s.q.x, y: -s.q.y, z: -s.q.z, w: s.q.w }, [0, 0, 1]);
      this.#tiltMax = 0;
      this.#fwd = false;
    }
    if (!this.holding) return null;
    // Rotation vector rate: gyro, or the orientation-derived one when the gyro is silent.
    const raw = norm(s.g) > 0.5 || !s.dt ? s.g : [(s.w[0] / s.dt) * DEG, (s.w[1] / s.dt) * DEG, (s.w[2] / s.dt) * DEG];
    this.#v = [this.#v[0] * 0.4 + raw[0] * 0.6, this.#v[1] * 0.4 + raw[1] * 0.6, this.#v[2] * 0.4 + raw[2] * 0.6];
    const v = this.#v, rate = norm(v);

    // Live tilt for the held ball.
    const upNow = rotate({ x: -s.q.x, y: -s.q.y, z: -s.q.z, w: s.q.w }, [0, 0, 1]);
    const tilt = Math.acos(clamp(dot(upNow, this.#up0), -1, 1)) * DEG;
    this.#tiltMax = Math.max(this.#tiltMax, tilt);
    if (!this.#fwd && this.#tiltMax > 20 && tilt < this.#tiltMax * 0.4) this.#fwd = true;
    this.live.swing = this.#fwd ? clamp(tilt / 40, 0, 1) : -clamp(tilt / T.backFull, 0, 1);

    if (rate > T.lobeOn) {
      const L = this.#lobe;
      if (L && dot(v, unit(L.dir)) < -0.3 * rate) {
        this.#prev = L;
        this.#lobe = null;
      }
      if (!this.#lobe) this.#lobe = { dir: [0, 0, 0], peak: 0, peakAt: s.at };
      const l = this.#lobe;
      l.dir = [l.dir[0] + v[0], l.dir[1] + v[1], l.dir[2] + v[2]];
      if (rate > l.peak) (l.peak = rate), (l.peakAt = s.at);
    }
    const l = this.#lobe;
    if (this.#fired) {
      if (!s.held) this.reset();
      return null;
    }
    if (!s.held) {
      const ok = l && l.peak >= T.holdReleasePeak && s.at - l.peakAt < 500;
      const out = ok ? { peakAt: l.peakAt, peak: l.peak, by: 'release' } : null;
      this.reset();
      return out;
    }
    if (l && this.#prev && this.#prev.peak >= T.holdPrevPeak && l.peak >= T.holdPeak && rate < T.holdDrop * l.peak) {
      this.#fired = true; // stays quiet until Action is let go
      this.live.swing = 1;
      return { peakAt: l.peakAt, peak: l.peak, by: 'peak' };
    }
    return null;
  }
}

// ───────────────────────────── camera: arm tracking + release ─────────────────────────────
const KEYS = { right: { s: 'rs', e: 're', w: 'rw', o: 'ls', ws: 'rs', ww: 'rw' }, left: { s: 'ls', e: 'le', w: 'lw', o: 'rs', ws: 'ls', ww: 'lw' } };

export class CamThrow {
  hand = 'right';
  /** What the game shows live. x in metres, angle in rad, swing -1..1. */
  live = { tracked: false, x: 0, angle: 0, swing: 0, state: 'lost', seenAt: -Infinity };
  /** Recent wrist positions in image coordinates (0..1, mirrored) for the hand-cam trail: {at, x, y}. */
  trail = [];
  armLen = 1.4; // shoulder -> wrist, shoulder widths (learned)
  scale = 0; // shoulder width, frame-height units
  side = 'front';
  #hist = [];
  #last = null; // last wrist sample {at, x, y (frame units), real}
  #vel = [0, 0];
  #wristSeen = -Infinity;
  #lowAt = -Infinity;
  #bottom = null;
  #usedLow = -Infinity; // the low episode that already produced a candidate
  #lowStart = -Infinity;
  #leftLow = false;
  #elbowLow = 0;
  #lastRaised = { side: 'front', at: -Infinity };
  #raisedCalmSince = 0;
  #zf = 0;
  #zOk = false;
  #needAddress = true;
  #calmSince = 0;
  #xf = new OneEuro(1.0, 0.6);
  #stillX = 0;
  #hasX = false;

  setHand(h) {
    if (h === this.hand) return;
    this.hand = h === 'left' ? 'left' : 'right';
    this.reset();
  }

  reset() {
    this.#hist = [];
    this.#last = null;
    this.trail = [];
    this.#lowAt = this.#usedLow = this.#lowStart = -Infinity;
    this.#bottom = null;
    this.#elbowLow = 0;
    this.#leftLow = false;
    this.#needAddress = true;
    this.#calmSince = 0;
    this.#xf.reset();
    this.#hasX = false;
    this.live.tracked = false;
    this.live.state = 'lost';
    this.live.swing = 0;
    this.live.angle = 0;
  }

  /** Where the hand was when the forward swing got going (the oldest sample within travelMs). */
  #swingRef(at, T) {
    for (const h of this.#hist) if (at - h.at <= T.travelMs) return h;
    return this.#hist[this.#hist.length - 1];
  }

  /** After a throw (or arm()): the hand has to come back to a calm, address-like pose first. */
  requireAddress() {
    this.#needAddress = true;
    this.#calmSince = 0;
    this.#usedLow = this.#lowStart;
  }

  get ready() {
    return !this.#needAddress;
  }

  /**
   * Feed one camera pose. Returns a release candidate
   *   { at, x, angle, travel, camRate (deg/s), upSpeed, bend, curve, zUsed }
   * or null. The caller decides (with the phone) whether it becomes a throw.
   */
  update(pose, T = TUNING) {
    if (!pose || typeof pose.at !== 'number') return null;
    const at = pose.at, img = pose.img, live = this.live;
    const lose = () => {
      if (at - live.seenAt > 600) {
        live.tracked = false;
        live.state = 'lost';
        live.swing = 0;
        this.#last = null;
        this.#hist = [];
      }
      return null;
    };
    if (!img) return lose();
    const k = KEYS[this.hand], asp = pose.aspect || 4 / 3, hs = this.hand === 'right' ? 1 : -1;
    const pt = (n) => (img[n] && (img[n][2] ?? 1) >= T.minVis ? { x: img[n][0] * asp, y: img[n][1] } : null);
    const S = pt(k.s), O = pt(k.o), E = pt(k.e);
    let W = pt(k.w);
    if (S && O) {
      let w = Math.hypot(S.x - O.x, S.y - O.y);
      const lh = pt('lh'), rh = pt('rh');
      if (lh && rh) w = Math.max(w, Math.hypot((S.x + O.x - lh.x - rh.x) / 2, (S.y + O.y - lh.y - rh.y) / 2) * 0.6);
      if (w > 0.02) this.scale = this.scale ? this.scale * 0.8 + w * 0.2 : w;
    }
    if (!S || !this.scale) return lose();
    const sc = this.scale, prev = this.#last;
    let real = !!W;
    if (W) this.#wristSeen = at;
    else if (prev && at - this.#wristSeen <= T.coastMs && at > prev.at) {
      const dt = (at - prev.at) / 1000;
      W = { x: prev.x + this.#vel[0] * dt, y: prev.y + this.#vel[1] * dt };
    } else return lose();

    // Glitch: no hand moves this fast. Re-baseline from the new position.
    if (prev && real && at > prev.at) {
      const dt = (at - prev.at) / 1000;
      const v = Math.hypot(W.x - prev.x, W.y - prev.y) / sc / dt;
      if (v > T.glitch) {
        this.#last = { at, x: W.x, y: W.y };
        this.#vel = [0, 0];
        this.#hist = [];
        return null;
      }
      if (prev.real !== false) this.#vel = [(W.x - prev.x) / dt, (W.y - prev.y) / dt];
    }
    if (prev && at <= prev.at) return null;
    this.#last = { at, x: W.x, y: W.y, real };

    const ext = (W.y - S.y) / sc, lat = (W.x - S.x) / sc, len = Math.hypot(ext, lat);
    if (real) {
      if (len > this.armLen) this.armLen += (len - this.armLen) * 0.3;
      else if (len > this.armLen * 0.92) this.armLen = this.armLen * 0.9 + len * 0.1;
      this.armLen = clamp(this.armLen, 1.1, 1.8);
    }
    const eExt = E ? (E.y - S.y) / sc : null;
    const cur = { at, ext, lat, eExt, real, len };
    const H = this.#hist;
    H.push(cur);
    while (H.length && at - H[0].at > 1500) H.shift();
    // A wrong (too long) arm from a bad frame fades toward what was really seen lately.
    if (H.length > 20) {
      let mx = 0;
      for (const h of H) if (h.real && h.len > mx) mx = h.len;
      if (mx > 0 && mx < this.armLen * 0.92) this.armLen = Math.max(1.1, this.armLen - (this.armLen - mx) * 0.01);
    }
    const L = this.armLen;
    this.trail.push({ at, x: W.x / asp, y: W.y });
    while (this.trail.length && at - this.trail[0].at > 700) this.trail.shift();
    live.tracked = true;
    live.seenAt = at;

    // Velocities over about two frames.
    let ref = H.length > 1 ? H[H.length - 2] : null;
    if (H.length > 2 && at - H[H.length - 3].at <= 120) ref = H[H.length - 3];
    const dt = ref ? Math.max(0.01, (at - ref.at) / 1000) : 0;
    const vUp = ref ? -(ext - ref.ext) / dt : 0;
    const relSpeed = ref ? Math.hypot(ext - ref.ext, lat - ref.lat) / dt : 0;

    // Front / back from the world landmarks (-z is toward the camera = in front of the player).
    const wl = pose.world, ww = wl && wl[k.ww], ws = wl && wl[k.ws];
    if (ww && ws && (ww[3] ?? 1) >= 0.3) {
      const z = -(ww[2] - ws[2]);
      this.#zf = this.#zOk ? this.#zf * 0.5 + z * 0.5 : z;
      this.#zOk = true;
    } else this.#zOk = false;
    const zSide = this.#zOk && Math.abs(this.#zf) > T.zConfident ? (this.#zf > 0 ? 'front' : 'back') : null;

    const low = ext >= T.lowFrac * L, raised = ext < T.raiseFrac * L;
    const wasRaised = H.length > 1 && H[H.length - 2].ext < T.raiseFrac * L;
    if (low) {
      if (this.#leftLow || at - this.#lowAt > 250) this.#lowStart = at; // a new low episode
      this.#leftLow = false;
      this.#lowAt = at;
      this.#bottom = cur;
      if (real && eExt !== null && relSpeed < 2) this.#elbowLow = this.#elbowLow ? this.#elbowLow * 0.9 + eExt * 0.1 : eExt;
    }
    if (raised) {
      this.#leftLow = true;
      if (zSide) this.side = zSide;
      else if (!wasRaised) {
        // No depth: a rise right after a backswing is the forward swing; a very fast one too; else it is a backswing.
        const afterBack = this.#lastRaised.side === 'back' && at - this.#lastRaised.at < 1500;
        this.side = afterBack || vUp >= T.fastUp ? 'front' : 'back';
      }
      if (relSpeed < 1) {
        if (!this.#raisedCalmSince) this.#raisedCalmSince = at;
        if (!zSide && at - this.#raisedCalmSince > 400) this.side = 'front'; // resting with the hand up: held in front
      } else this.#raisedCalmSince = 0;
      this.#lastRaised = { side: this.side, at };
    } else {
      this.#raisedCalmSince = 0;
      if (low && at - this.#lastRaised.at > 1500) this.#lastRaised = { side: 'front', at: -Infinity };
    }

    // Address gate.
    if (relSpeed < T.addressSpeed && ext > 0.45 * L) {
      if (!this.#calmSince) this.#calmSince = at;
      if (this.#needAddress && at - this.#calmSince >= T.addressStillMs) {
        this.#needAddress = false;
        if (low) this.#lowStart = at; // a fresh episode: the swing may start straight from this address
      }
    } else this.#calmSince = 0;

    // Aim x: follows the hand across the image while it is calm relative to the body (so stepping
    // sideways moves the ball, a swing does not).
    const handAbs = (W.x - 0.5 * asp) / sc;
    if (!this.#hasX || (relSpeed < 1.5 && !(raised && this.side === 'back') && real)) {
      this.#stillX = this.#xf.filter(aimXFromHand(handAbs, hs), at / 1000);
      this.#hasX = true;
    }
    live.x = this.#stillX;

    // Swing phase for the held ball.
    const theta = Math.acos(clamp(ext / L, -1, 1)) * DEG;
    const relTheta = Math.acos(T.releaseFrac) * DEG;
    const back = raised ? this.side === 'back' : zSide === 'back';
    live.swing = back ? -clamp(theta / T.backFull, 0, 1) : clamp(theta / relTheta, 0, 1) * (raised ? 1 : 0.6);
    const bottom = this.#bottom;
    const inFwd = raised && this.side === 'front' && bottom && at - this.#lowAt <= 500 && vUp > 1;
    live.angle = inFwd ? angleFromTravel(lat - this.#swingRef(at, T).lat) : 0;
    live.state = this.#needAddress ? 'wait' : raised ? (this.side === 'back' ? 'back' : inFwd ? 'swing' : 'ready') : 'ready';

    // ── Release ──
    const rel = T.releaseFrac * L;
    if (this.#needAddress || !bottom || ext >= rel) return null;
    if (this.#lowStart <= this.#usedLow) return null; // this low -> rise episode was already judged
    if (at - this.#lowAt > T.lowToReleaseMs) return null;
    this.#usedLow = this.#lowStart; // one verdict per rise
    if (this.side !== 'front' || vUp < T.minUpSpeed) return null;
    const travel = lat - this.#swingRef(at, T).lat;
    if (Math.abs(travel) > T.maxSideTravel) return null;
    // The whole arm swings from the shoulder, so the elbow comes up too. A forearm lift (looking at the
    // phone, scratching a nose) leaves the elbow where it hangs.
    if (eExt !== null && this.#elbowLow && eExt > T.elbowDrop * this.#elbowLow) return null;
    // Crossing time, interpolated between the last two samples.
    const p = H[H.length - 2];
    let relAt = at;
    if (p && p.ext > rel && p.ext > ext) relAt = p.at + ((p.ext - rel) / (p.ext - ext)) * (at - p.at);
    // Swing rate straight from the geometry: change of arm angle over the last two frames.
    const th = (e) => Math.acos(clamp(e / L, -1, 1));
    const camRate = ref ? ((th(ext) - th(ref.ext)) / dt) * DEG : 0;
    // Sideways bow of the path between the bottom and the release.
    let bend = 0;
    const path = H.filter((h) => h.at >= bottom.at);
    if (path.length >= 3) {
      const mid = path[Math.floor(path.length / 2)];
      const f = (mid.at - bottom.at) / Math.max(1, at - bottom.at);
      bend = mid.lat - (bottom.lat + (lat - bottom.lat) * f);
    }
    return {
      at: relAt, x: this.#stillX, angle: angleFromTravel(travel), travel, camRate: Math.max(0, camRate), upSpeed: vUp,
      bend, curve: clamp(-shaped(bend, T.bendDead, T.bendFull), -1, 1) || 0, zUsed: !!zSide,
    };
  }
}

// ───────────────────────────── fusion ─────────────────────────────
/**
 * Camera + phone -> throws. Feed poses, packets and a clock tick; each call returns a throw or null:
 *   { x (m, or null when the camera gave no position: the caller supplies its own), angle, speed, curve,
 *     source: 'camera+phone' | 'camera' | 'phone', detail }
 * All times are epoch ms on the shared clock (pose.at / packet.at); `now` defaults to the event's own time.
 */
export class ThrowDetector {
  cam = new CamThrow();
  imu = new ImuBuffer();
  phone = new PhoneThrow();
  armed = false;
  /** Why the last camera candidate was dropped (for the hand-cam / debugging), or ''. */
  lastReject = '';
  #pending = null;
  #cooldown = -Infinity;

  constructor({ hand = 'right' } = {}) {
    this.cam.setHand(hand);
  }

  setHand(h) {
    this.cam.setHand(h);
  }

  arm() {
    this.armed = true;
    this.#pending = null;
    this.cam.requireAddress();
    this.phone.reset();
  }

  disarm() {
    this.armed = false;
    this.#pending = null;
  }

  camTracked(now) {
    return this.cam.live.tracked && now - this.cam.live.seenAt < 1500;
  }

  phoneAlive(now) {
    return now - this.imu.lastAt < 1500;
  }

  onPose(pose, now = pose?.at) {
    const c = this.cam.update(pose);
    if (c && this.armed && now >= this.#cooldown && !this.#pending && !this.phone.holding) {
      this.#pending = { kind: 'cam', c, at: c.at, created: now };
    }
    return this.tick(now);
  }

  onPacket(p, now = p?.at) {
    const s = this.imu.push(p);
    if (!s) return null;
    const h = this.phone.update(s);
    if (h && this.armed && now >= this.#cooldown && !this.#pending) {
      this.#pending = { kind: 'phone', h, at: h.peakAt, created: now };
    }
    return this.tick(now);
  }

  /** Resolve a pending release once the phone packets around it have arrived (or the wait ran out). */
  tick(now, T = TUNING) {
    const P = this.#pending;
    if (!P || !this.armed) return null;
    const alive = now - this.imu.lastAt < 500 || this.imu.lastAt >= P.at;
    const covered = this.imu.lastAt >= P.at + (P.kind === 'cam' ? T.fuseAfter : T.twistAfter);
    if (alive && !covered && now - P.created < T.fuseWaitMs) return null;
    this.#pending = null;

    if (P.kind === 'phone') {
      const a = analyseSwing(this.imu.samples, P.at - 60, P.at + 60);
      const peak = a ? a.peakRate : P.h.peak, twist = a ? a.twist : 0;
      const tracked = this.camTracked(now);
      return this.#fire(now, {
        x: tracked ? this.cam.live.x : null, angle: 0, speed: speedFromRate(peak), curve: curveFromTwist(twist), source: 'phone',
        detail: { camSpeed: 0, imuPeak: peak, twist, releaseAt: P.at, by: P.h.by, axisFrom: a?.axisFrom ?? null, accPeak: a?.accPeak ?? 0 },
      });
    }

    const c = P.c;
    const base = { camSpeed: c.camRate, upSpeed: c.upSpeed, travel: c.travel, bend: c.bend, zUsed: c.zUsed };
    const camOnly = () => this.#fire(now, {
      x: c.x, angle: c.angle, speed: speedFromRate(c.camRate), curve: c.curve, source: 'camera',
      detail: { ...base, imuPeak: 0, twist: 0, releaseAt: c.at },
    });
    if (!alive) return camOnly();
    const a = analyseSwing(this.imu.samples, c.at - T.fuseBefore, c.at + T.fuseAfter + 40);
    if (!a || a.peakRate < T.imuMinRate) {
      // A phone lying on the table must not block camera play; a phone that moved a little vetoes the throw.
      if (this.imu.maxRate(c.at - 1000, now) < T.imuIdleRate) return camOnly();
      this.lastReject = 'phone did not swing';
      return null;
    }
    return this.#fire(now, {
      x: c.x, angle: c.angle, speed: speedFromRate(a.peakRate), curve: curveFromTwist(a.twist), source: 'camera+phone',
      detail: { ...base, imuPeak: a.peakRate, twist: a.twist, releaseAt: a.peakAt, camAt: c.at, axisFrom: a.axisFrom, twistFrom: a.twistFrom, accPeak: a.accPeak },
    });
  }

  #fire(now, t) {
    this.armed = false;
    this.lastReject = '';
    this.#cooldown = now + TUNING.cooldownMs;
    this.cam.requireAddress();
    t.angle = clamp(t.angle, -THROW.maxAngle, THROW.maxAngle);
    t.speed = clamp(t.speed, THROW.minSpeed, THROW.maxSpeed);
    t.curve = clamp(t.curve, -1, 1);
    if (t.x !== null) t.x = clamp(t.x, -THROW.maxX, THROW.maxX);
    return t;
  }
}

// ───────────────────────────── mouse flick + keyboard meter ─────────────────────────────
/**
 * A mouse / touch flick: press, pull back (down), flick forward (up), let go.
 * points: [{t (ms), x, y}] in units of the canvas height (y down). -> { angle, speed, curve, up, upSpeed } or null.
 */
export function flickThrow(points) {
  if (!points || points.length < 3) return null;
  // The forward stroke starts at the lowest point of the gesture.
  let i0 = 0;
  for (let i = 1; i < points.length; i++) if (points[i].y >= points[i0].y) i0 = i;
  const fwd = points.slice(i0);
  if (fwd.length < 2) return null;
  const a = fwd[0], b = fwd[fwd.length - 1];
  const up = a.y - b.y;
  if (up < 0.06) return null;
  // Peak upward speed over about 50 ms windows (heights / s).
  let upSpeed = 0;
  for (let i = 1; i < fwd.length; i++) {
    let j = i - 1;
    while (j > 0 && fwd[i].t - fwd[j].t < 50) j--;
    const dt = (fwd[i].t - fwd[j].t) / 1000;
    if (dt > 0.008) upSpeed = Math.max(upSpeed, (fwd[j].y - fwd[i].y) / dt);
  }
  if (upSpeed < 0.25) return null;
  // The pause before letting go must not count: the stroke has to end moving.
  if (b.t - fwd[Math.max(0, fwd.length - 2)].t > 250) return null;
  const dx = b.x - a.x;
  const mid = fwd[Math.floor(fwd.length / 2)];
  const f = (a.y - mid.y) / up;
  const bend = (mid.x - (a.x + dx * f)) / Math.hypot(dx, up); // + = bows to the right, so it ends curling left
  return {
    angle: clamp(shaped(dx / up, 0.06, 0.45) * THROW.maxAngle, -THROW.maxAngle, THROW.maxAngle) || 0,
    speed: clamp(pwl([[0.3, THROW.minSpeed], [0.8, 5], [1.8, THROW.typicalSpeed], [3.6, THROW.maxSpeed]], upSpeed), THROW.minSpeed, THROW.maxSpeed),
    curve: clamp(-shaped(bend, 0.04, 0.22), -1, 1) || 0,
    up, upSpeed,
  };
}

/** Keyboard power meter: 0 -> 1 -> 0 triangle with the given period (s). */
export const meterPower = (elapsedS, period = 1.5) => {
  const k = (elapsedS / period) % 1;
  return k < 0.5 ? k * 2 : 2 - k * 2;
};
export const meterSpeed = (power) => THROW.minSpeed + (THROW.maxSpeed - THROW.minSpeed) * clamp(power, 0, 1);
