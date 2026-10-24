import { clamp } from '../constants';
import type { InputSource, SwingIntent } from './swing';

/** One SEN2 packet as the Exemoo SDK delivers it. */
export interface PhonePacket {
  t: number;
  q: { x: number; y: number; z: number; w: number };
  gyro: { alpha: number; beta: number; gamma: number };
  buttons: number;
  /** Camera assist (Exemoo shell): wrist + shoulder in 0…1 image coords, mirrored. */
  cam?: { x: number; y: number; sx: number; sy: number; scale: number } | null;
}

type Quat = PhonePacket['q'];
const conj = (q: Quat): Quat => ({ x: -q.x, y: -q.y, z: -q.z, w: q.w });
const mul = (a: Quat, b: Quat): Quat => ({
  w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
  y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
  z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
});
/** Rotate the device's screen normal (0,0,1) by q. */
const screenNormal = ({ x, y, z, w }: Quat) => ({
  x: 2 * (x * z + w * y),
  y: 2 * (y * z - w * x),
  z: 1 - 2 * (x * x + y * y),
});

/** Gyro speed (deg/s) a swing has to reach, and how long before the next one can start. */
export const SWING_THRESHOLD = 260;
export const SWING_COOLDOWN_MS = 450;

/**
 * Swing detector: a swing is a burst of rotation above SWING_THRESHOLD; it fires at the burst's
 * peak (when the speed starts to fall) so timing matches the moment the racket would meet the ball.
 * Pure state machine, fed one gyro sample at a time.
 */
export class SwingDetector {
  private peak = 0;
  private peakBeta = 0;
  private peakOther = 0;
  private rising = false;
  private lastFire = -Infinity;

  /** Returns a swing (pace 0…1, chop = downward pitch-dominated swing) at the peak, else null. */
  push(gyro: PhonePacket['gyro'], nowMs: number): { flick: number; chop: boolean } | null {
    const speed = Math.hypot(gyro.alpha, gyro.beta, gyro.gamma);
    if (nowMs - this.lastFire < SWING_COOLDOWN_MS) return null;
    if (speed >= SWING_THRESHOLD && speed >= this.peak) {
      this.peak = speed;
      this.peakBeta = gyro.beta;
      this.peakOther = Math.hypot(gyro.alpha, gyro.gamma);
      this.rising = true;
      return null;
    }
    if (this.rising && speed < this.peak * 0.85) {
      const out = { flick: clamp((this.peak - SWING_THRESHOLD) / 900, 0, 1), chop: this.peakBeta > 0 && Math.abs(this.peakBeta) > this.peakOther * 1.2 };
      this.rising = false;
      this.peak = 0;
      this.lastFire = nowMs;
      return out;
    }
    if (!this.rising) this.peak = 0;
    return null;
  }
}

/** Exemoo button bits (see exemoo/public/js/protocol.js). */
const BIT = { action: 1 << 0, left: 1 << 5, right: 1 << 6 };

/**
 * Phone racket. Aim comes from where the phone's face points relative to the recentred pose
 * (turn left/right = across the court, tilt the face up = deeper); a swing fires on the gyro peak.
 * The big pad button also swings, and the d-pad nudges the player sideways.
 */
export class PhoneRacketInput implements InputSource {
  enabled = false;
  connected = false;
  private cbs: ((i: SwingIntent) => void)[] = [];
  private ref: Quat | null = null;
  private q: Quat = { x: 0, y: 0, z: 0, w: 1 };
  private buttons = 0;
  private lastPacketAt = 0;
  private detector = new SwingDetector();
  private cam: PhonePacket['cam'] = null;
  private camAt = 0;

  onPacket(p: PhonePacket) {
    this.lastPacketAt = performance.now();
    this.q = p.q;
    if (p.cam) {
      this.cam = p.cam;
      this.camAt = this.lastPacketAt;
    }
    if (!this.ref) this.ref = p.q;
    const pressed = p.buttons & ~this.buttons;
    this.buttons = p.buttons;
    if (pressed & BIT.action) this.fire(0.3, false);
    const swing = this.detector.push(p.gyro, this.lastPacketAt);
    if (swing) this.fire(swing.flick, swing.chop);
  }

  /** Use the current pose as "pointing at the middle of the far court". */
  recenter() {
    this.ref = this.q;
  }

  /** True while packets are arriving. */
  get live() {
    return this.connected && performance.now() - this.lastPacketAt < 1500;
  }

  private fire(flick: number, slice: boolean) {
    if (!this.enabled) return;
    const a = this.aim();
    const intent: SwingIntent = { aimX: a.x, aimY: a.y, flick, slice };
    for (const cb of this.cbs) cb(intent);
  }

  onSwing(cb: (i: SwingIntent) => void) {
    this.cbs.push(cb);
  }

  private get camLive() {
    return !!this.cam && performance.now() - this.camAt < 400;
  }

  moveAxis() {
    const pad = (this.buttons & BIT.right ? 1 : 0) - (this.buttons & BIT.left ? 1 : 0);
    if (pad || !this.camLive) return pad;
    // Camera: step left/right in front of the screen to move across the baseline.
    const off = this.cam!.sx - 0.5;
    return Math.abs(off) < 0.06 ? 0 : clamp((off - Math.sign(off) * 0.06) / 0.14, -1, 1);
  }

  aim() {
    if (!this.ref) return { x: 0, y: 0.3 };
    const n = screenNormal(mul(conj(this.ref), this.q));
    const yaw = Math.atan2(n.x, n.z); // rad, + = face turned right
    const pitch = Math.atan2(-n.y, Math.hypot(n.x, n.z)); // rad, + = face tilted up
    let x = clamp(yaw / 0.6, -1, 1);
    // Camera: where the hand is relative to the shoulder is an absolute cue that never drifts.
    if (this.camLive) x = clamp(x * 0.5 + ((this.cam!.x - this.cam!.sx) / (this.cam!.scale * 1.5)) * 0.5, -1, 1);
    return { x, y: clamp(0.3 + pitch / 0.5, -1, 1) };
  }

  dispose() {
    this.cbs = [];
  }
}

/** Mouse/keyboard and phone together: swings from either count; aim and movement prefer the phone. */
export class CombinedInput implements InputSource {
  private _enabled = false;
  constructor(
    private mouse: InputSource,
    private phone: PhoneRacketInput,
  ) {}
  get enabled() {
    return this._enabled;
  }
  set enabled(v: boolean) {
    this._enabled = v;
    this.mouse.enabled = v;
    this.phone.enabled = v;
  }
  onSwing(cb: (i: SwingIntent) => void) {
    this.mouse.onSwing(cb);
    this.phone.onSwing(cb);
  }
  moveAxis() {
    return this.phone.moveAxis() || this.mouse.moveAxis();
  }
  aim() {
    return this.phone.live ? this.phone.aim() : this.mouse.aim();
  }
  dispose() {
    this.mouse.dispose();
    this.phone.dispose();
  }
}
