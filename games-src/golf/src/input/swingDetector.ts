/**
 * Golf swing state machine (pure & deterministic — fed one sample per sensor packet).
 *
 * Inputs per sample: shaft angle θ in the swing plane (rad, 0 = address, + = backswing side,
 * continuous/unwrapped), in-plane angular speed ω (rad/s, + = moving toward the backswing),
 * face (−1…+1, + = open), swing path (rad, + = out-to-in) and whether SWING is held.
 *
 *   idle ──θ > start & ω > 0 (after being near address)──▶ back
 *   back ──ω < −reverse & θ < θmax − drop──▶ down          (top = θmax)
 *   back ──θ back below start/2 slowly──▶ idle             (waggle / cancelled takeaway)
 *   down ──θ crosses 0 (address)  ─or─  speed fell below stall·peak with θ < stallAngle──▶ IMPACT
 *   down ──ω > +reverse again──▶ back                     (re-gripped at the top)
 *   IMPACT ─▶ cooldown (≥ cooldownMs, then needs |θ| < addressZone before a new takeaway)
 *   idle  ──fast forward motion through address without any backswing (full swing only)──▶
 *           topped shot (low power, low quality)
 *
 * Full swing thresholds (AIM): takeaway 25°, top reversal 40°/s & 6° drop, minimum peak 150°/s.
 *   power: 250°/s → 0.2, 900°/s → 1.0 (linear, extrapolated, capped 1.15), × sensitivity; then
 *   capped by backswing length: cap = 0.3 + 0.85·(θmax / 0.85π) (a full swing needs a full
 *   backswing, exactly like Wii Sports).
 * Putt thresholds (PUTT): takeaway 5°, reversal 8°/s & 1°, minimum peak 15°/s;
 *   power: 40°/s → 0.05, 220°/s → 1.1 (no backswing cap).
 * curve = face·faceWeight + (path/20°)·pathWeight (+ overswing randomness), deadzone, clamp ±1.
 */
import type { SwingEvent } from '../core/contracts';
import { DEG, clamp } from './clubMath';

export interface SwingSample {
  /** ms */
  t: number;
  theta: number;
  omega: number;
  face: number;
  path: number;
  armed: boolean;
}

export interface SwingTuning {
  putt: boolean;
  startAngle: number;
  addressZone: number;
  reverseRate: number;
  topDrop: number;
  minPeak: number;
  speedLo: number;
  powerLo: number;
  speedHi: number;
  powerHi: number;
  maxPower: number;
  /** θ that counts as a "full" backswing (backswing = θmax / backFull). */
  backFull: number;
  backswingCap: boolean;
  faceWeight: number;
  pathWeight: number;
  deadzone: number;
  /** Forward speed through address with no backswing that counts as a topped swing (0 = off). */
  topSpeed: number;
  stallFrac: number;
  stallAngle: number;
  cooldownMs: number;
}

export const AIM_TUNING: SwingTuning = {
  putt: false,
  startAngle: 25 * DEG,
  addressZone: 20 * DEG,
  reverseRate: 40 * DEG,
  topDrop: 6 * DEG,
  minPeak: 150 * DEG,
  speedLo: 250 * DEG,
  powerLo: 0.2,
  speedHi: 900 * DEG,
  powerHi: 1.0,
  maxPower: 1.15,
  backFull: 0.85 * Math.PI,
  backswingCap: true,
  faceWeight: 0.75,
  pathWeight: 0.6,
  deadzone: 0.08,
  topSpeed: 400 * DEG,
  stallFrac: 0.35,
  stallAngle: 45 * DEG,
  cooldownMs: 1000,
};

export const PUTT_TUNING: SwingTuning = {
  putt: true,
  startAngle: 5 * DEG,
  addressZone: 4 * DEG,
  reverseRate: 8 * DEG,
  topDrop: 1 * DEG,
  minPeak: 15 * DEG,
  speedLo: 40 * DEG,
  powerLo: 0.05,
  speedHi: 220 * DEG,
  powerHi: 1.1,
  maxPower: 1.15,
  backFull: 15 * DEG,
  backswingCap: false,
  faceWeight: 0.35,
  pathWeight: 0.12,
  deadzone: 0.06,
  topSpeed: 0,
  stallFrac: 0.3,
  stallAngle: 6 * DEG,
  cooldownMs: 1000,
};

export type SwingPhase = 'idle' | 'back' | 'down' | 'cooldown';

/** Piecewise-linear speed → power map (through 0, (lo, pLo), (hi, pHi), extrapolated, capped). */
export function speedToPower(speed: number, t: SwingTuning): number {
  let p: number;
  if (speed <= t.speedLo) p = (t.powerLo * Math.max(0, speed)) / t.speedLo;
  else p = t.powerLo + ((t.powerHi - t.powerLo) * (speed - t.speedLo)) / (t.speedHi - t.speedLo);
  return clamp(p, 0, t.maxPower);
}

export class SwingDetector {
  tuning: SwingTuning = AIM_TUNING;
  enabled = true;
  sensitivity = 1;
  holdToSwing = true;
  /** Random source for overswing scatter (tests inject a fixed one). */
  rng: () => number = Math.random;

  private _phase: SwingPhase = 'idle';
  /** Has the shaft been near address since the last swing / mode change? */
  private ready = false;
  private thetaMax = 0;
  private tBack = 0;
  private tAddr = 0;
  private tTop = 0;
  private tPeak = 0;
  private peak = 0;
  private armedTop = false;
  private hesitations = 0;
  private pathAcc = 0;
  private pathW = 0;
  private tCool = 0;
  private prev: SwingSample | null = null;

  get phase(): SwingPhase {
    return this._phase;
  }

  /** θmax of the current backswing (0 when idle). */
  get topAngle(): number {
    return this._phase === 'back' || this._phase === 'down' ? this.thetaMax : 0;
  }

  setTuning(t: SwingTuning): void {
    if (t === this.tuning) return;
    this.tuning = t;
    this.reset();
  }

  reset(): void {
    this._phase = 'idle';
    this.ready = false;
    this.prev = null;
    this.peak = 0;
    this.thetaMax = 0;
  }

  push(s: SwingSample): SwingEvent | null {
    const t = this.tuning;
    const prev = this.prev;
    this.prev = s;
    if (!this.enabled) {
      this._phase = 'idle';
      this.ready = false;
      return null;
    }
    if (Math.abs(s.theta) < t.addressZone) {
      this.ready = true;
      if (this._phase === 'idle') this.tAddr = s.t;
    }

    switch (this._phase) {
      case 'cooldown':
        if (s.t - this.tCool >= t.cooldownMs) {
          this._phase = 'idle';
          this.ready = Math.abs(s.theta) < t.addressZone;
        }
        return null;

      case 'idle':
        if (!this.ready) return null;
        if (s.theta > t.startAngle && s.omega > 0) {
          this._phase = 'back';
          this.thetaMax = s.theta;
          this.tBack = this.tAddr;
          this.tTop = s.t;
          this.hesitations = 0;
          return null;
        }
        // Topped: lunging through address with no backswing.
        if (t.topSpeed > 0 && prev && prev.theta >= 0 && s.theta < 0 && -s.omega * this.sensitivity > t.topSpeed) {
          return this.emit(s, {
            power: Math.min(0.3, speedToPower(-s.omega * this.sensitivity, t)),
            quality: 0.15,
            backswing: 0,
            armed: s.armed,
            curve: this.curveOf(s.face, s.path, 0),
          });
        }
        return null;

      case 'back':
        if (s.theta > this.thetaMax) {
          this.thetaMax = s.theta;
          this.tTop = s.t;
        }
        if (s.omega < -t.reverseRate && s.theta < this.thetaMax - t.topDrop) {
          this._phase = 'down';
          this.peak = -s.omega;
          this.tPeak = s.t;
          this.armedTop = s.armed;
          this.pathAcc = 0;
          this.pathW = 0;
          return this.downStep(s, prev);
        }
        if (s.theta < t.startAngle * 0.5 && Math.abs(s.omega) < t.reverseRate) {
          this._phase = 'idle';
        } else if (s.t - this.tTop > 8000) {
          this._phase = 'idle';
          this.ready = false;
        }
        return null;

      case 'down':
        return this.downStep(s, prev);
    }
  }

  private downStep(s: SwingSample, prev: SwingSample | null): SwingEvent | null {
    const t = this.tuning;
    const speed = -s.omega;
    if (speed > this.peak) {
      this.peak = speed;
      this.tPeak = s.t;
    }
    if (speed > t.reverseRate) {
      const w = speed * speed;
      this.pathAcc += s.path * w;
      this.pathW += w;
    }
    // Went back up again (re-gripped / paused at the top and continued the backswing).
    if (s.omega > t.reverseRate * 2 && s.theta > t.startAngle) {
      this._phase = 'back';
      this.hesitations++;
      if (s.theta > this.thetaMax) this.thetaMax = s.theta;
      return null;
    }

    let impact = false;
    let face = s.face;
    if (prev && prev.theta > 0 && s.theta <= 0) {
      impact = true;
      // Interpolate the face to the exact crossing.
      const k = prev.theta / (prev.theta - s.theta || 1);
      face = prev.face + (s.face - prev.face) * k;
    } else if (s.theta < t.stallAngle && speed < this.peak * t.stallFrac && this.peak > t.minPeak) {
      impact = true; // stopped short of the ball: hit at the peak
    } else if (s.t - this.tTop > 2500) {
      this._phase = 'idle';
      this.ready = false;
      return null;
    }
    if (!impact) return null;

    if (this.peak < t.minPeak) {
      // Too slow to be a swing (club lowered back to address).
      this._phase = 'idle';
      return null;
    }

    const v = this.peak * this.sensitivity;
    const backswing = clamp(this.thetaMax / t.backFull, 0, 1.2);
    let power = speedToPower(v, t);
    if (t.backswingCap) {
      power *= 0.9 + 0.1 * Math.min(1, backswing);
      power = Math.min(power, 0.3 + 0.85 * backswing);
    }
    power = clamp(power, 0, t.maxPower);
    const path = this.pathW > 0 ? this.pathAcc / this.pathW : s.path;

    // Quality: tempo & smoothness.
    let quality = 1;
    const backMs = Math.max(1, this.tTop - this.tBack);
    const downMs = Math.max(1, s.t - this.tTop);
    const transMs = this.tPeak - this.tTop;
    if (!t.putt) {
      if (backMs < 300) quality -= 0.3 * (1 - backMs / 300);
      const ratio = backMs / downMs;
      if (ratio < 1.5) quality -= 0.15 * (1 - ratio / 1.5);
      if (transMs < 60) quality -= 0.15 * (1 - transMs / 60);
      if (backswing < 0.35) quality -= 0.35 * (1 - backswing / 0.35); // half-hearted takeaway
      if (power > 1) quality -= (power - 1) * 1.5;
      if (Math.abs(path) > 15 * DEG) quality -= 0.1;
    } else {
      if (transMs < 30) quality -= 0.1;
      if (Math.abs(path) > 10 * DEG) quality -= 0.1;
    }
    quality -= 0.15 * Math.min(2, this.hesitations);

    return this.emit(s, {
      power,
      quality: clamp(quality, 0.15, 1),
      backswing,
      armed: this.armedTop || s.armed,
      curve: this.curveOf(face, path, power),
    });
  }

  private curveOf(face: number, path: number, power: number): number {
    const t = this.tuning;
    let c = face * t.faceWeight + clamp(path / (20 * DEG), -1, 1) * t.pathWeight;
    if (power > 1) c += (this.rng() - 0.5) * 2 * 0.45 * ((power - 1) / (t.maxPower - 1));
    const a = Math.abs(c);
    c = a < t.deadzone ? 0 : (Math.sign(c) * (a - t.deadzone)) / (1 - t.deadzone);
    return clamp(c, -1, 1);
  }

  private emit(
    s: SwingSample,
    r: { power: number; quality: number; backswing: number; armed: boolean; curve: number },
  ): SwingEvent {
    this._phase = 'cooldown';
    this.tCool = s.t;
    this.ready = false;
    this.peak = 0;
    this.thetaMax = 0;
    return {
      time: s.t,
      power: r.power,
      curve: r.curve,
      quality: r.quality,
      backswing: r.backswing,
      practice: this.holdToSwing ? !r.armed : false,
    };
  }
}
