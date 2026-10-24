import type { PointerSource, PointerState, SensorSample } from '../contracts';
import type { PhoneLink } from '../net/PhoneLink';
import { OneEuroFilter } from './OneEuro';
import { bladeYawPitch, wrapAngle } from './orientation';

export interface MotionPointerOptions {
  /** Half-width of the yaw range mapped to NDC x ∈ [-1, 1], degrees. Default 35. */
  yawRangeDeg?: number;
  /** Pointer gain multiplier (Settings.sensitivity). Default 1. */
  sensitivity?: number;
  /** Viewport aspect (width / height) used for pitch scaling. Default: window aspect. */
  aspect?: () => number;
  /** Recenter automatically when the phone presses CALIBRATE. Default true. */
  handleCalibrateButton?: boolean;
  /** Max time to extrapolate past the last packet, ms. Default 24. */
  maxPredictMs?: number;
  /** One-Euro filter params (NDC units). */
  minCutoff?: number;
  beta?: number;
}

/** Samples older than this make the pointer inactive. */
const ACTIVE_WINDOW_MS = 500;
/** After a gap this long the next samples re-run auto-calibration. */
const RECALIBRATE_GAP_MS = 5000;
/** Samples to wait before auto-calibrating (sensor fusion settles). */
const AUTO_CAL_SAMPLES = 4;
/** |NDC| beyond which the centre is dragged along (soft edge, cancels drift). */
const EDGE_LIMIT = 1.3;

/**
 * Phone-as-sword pointer. Maps the direction of the phone's top edge (the
 * blade) to NDC: yaw → x, pitch → y. Roll about the blade is ignored, so the
 * screen may face the player, the side, or anywhere in between.
 */
export class MotionPointer implements PointerSource {
  readonly state: PointerState = { x: 0, y: 0, active: false, source: 'phone' };
  /** Filtered pointer speed, NDC units per second. */
  speed = 0;
  /** True once a centre has been set (manually or automatically). */
  calibrated = false;
  /** False while the phone's on-screen blade button is released (the blade is sheathed). */
  held = true;

  private readonly link: PhoneLink;
  private readonly yawRange: number;
  private readonly aspect: () => number;
  private readonly maxPredictMs: number;
  private _sensitivity: number;
  private readonly fx: OneEuroFilter;
  private readonly fy: OneEuroFilter;

  private yaw0 = 0;
  private pitch0 = 0;
  private rawYaw = 0;
  private rawPitch = 0;
  private haveRaw = false;
  private samplesSinceCal = 0;
  private needsAutoCal = true;
  private lastSample: SensorSample | null = null;
  private lastPhoneT = 0;
  private lastReceivedAt = 0;
  private interval = 1000 / 60;
  private readonly unsubs: (() => void)[] = [];

  constructor(link: PhoneLink, opts: MotionPointerOptions = {}) {
    this.link = link;
    this.yawRange = ((opts.yawRangeDeg ?? 35) * Math.PI) / 180;
    this._sensitivity = clampSensitivity(opts.sensitivity ?? 1);
    this.aspect = opts.aspect ?? (() => (window.innerWidth || 16) / (window.innerHeight || 9));
    this.maxPredictMs = opts.maxPredictMs ?? 24;
    this.fx = new OneEuroFilter(opts.minCutoff ?? 1.5, opts.beta ?? 1.5, 1.0);
    this.fy = new OneEuroFilter(opts.minCutoff ?? 1.5, opts.beta ?? 1.5, 1.0);
    this.unsubs.push(link.onSample((s) => this.onSample(s)));
    if (opts.handleCalibrateButton ?? true) {
      this.unsubs.push(link.onButton((b) => { if (b === 'calibrate') this.calibrate(); }));
    }
  }

  get sensitivity(): number {
    return this._sensitivity;
  }

  /** Settings.sensitivity (0.5..2): higher = less wrist motion per screen. */
  set sensitivity(v: number) {
    this._sensitivity = clampSensitivity(v);
  }

  /** Use the phone's current direction as the screen centre. */
  calibrate(): void {
    if (!this.haveRaw) {
      this.needsAutoCal = true;
      return;
    }
    this.yaw0 = this.rawYaw;
    this.pitch0 = this.rawPitch;
    this.calibrated = true;
    this.needsAutoCal = false;
    this.fx.reset(0);
    this.fy.reset(0);
    this.state.x = 0;
    this.state.y = 0;
    this.speed = 0;
  }

  get active(): boolean {
    return this.state.active;
  }

  update(_dt: number): void {
    const now = performance.now();
    const fresh = this.lastSample !== null && now - this.lastReceivedAt < ACTIVE_WINDOW_MS;
    this.state.active = fresh && this.calibrated && this.held;
    if (!fresh) {
      this.speed = 0;
      return;
    }
    // Extrapolate along the filtered velocity to hide network jitter and
    // part of the filter lag.
    const ahead = Math.min(Math.max(now - this.lastReceivedAt, 0), this.maxPredictMs, this.interval * 1.5) / 1000;
    const vx = this.fx.velocity;
    const vy = this.fy.velocity;
    this.state.x = this.fx.value + vx * ahead;
    this.state.y = this.fy.value + vy * ahead;
    this.speed = Math.hypot(vx, vy);
  }

  dispose(): void {
    for (const u of this.unsubs.splice(0)) u();
  }

  private onSample(s: SensorSample): void {
    const prev = this.lastSample;
    const gapMs = prev ? s.receivedAt - this.lastReceivedAt : Infinity;
    if (gapMs > RECALIBRATE_GAP_MS) {
      this.needsAutoCal = true;
      this.samplesSinceCal = 0;
    }

    this.held = s.held ?? true;
    const { yaw, pitch } = bladeYawPitch(s.quat);
    if (!Number.isFinite(yaw) || !Number.isFinite(pitch)) return;
    this.rawYaw = yaw;
    this.rawPitch = pitch;
    this.haveRaw = true;

    // Sample spacing: prefer the phone clock (immune to network jitter).
    let dt = prev ? ((s.t - this.lastPhoneT) >>> 0) / 1000 : 0;
    if (!(dt > 0.002 && dt < 0.25)) dt = prev ? Math.min(Math.max(gapMs, 4), 250) / 1000 : 0;
    if (dt > 0) this.interval = this.interval * 0.9 + dt * 1000 * 0.1;
    this.lastSample = s;
    this.lastPhoneT = s.t;
    this.lastReceivedAt = s.receivedAt;

    if (this.needsAutoCal) {
      if (++this.samplesSinceCal >= AUTO_CAL_SAMPLES) this.calibrate();
      return;
    }

    const half = this.yawRange / this._sensitivity;
    let x = -wrapAngle(yaw - this.yaw0) / half;
    let y = ((pitch - this.pitch0) / half) * Math.max(0.5, this.aspect());
    // Soft edges: pointing further than the limit drags the centre along,
    // which also cancels slow gyro drift.
    if (Math.abs(x) > EDGE_LIMIT) {
      const excess = (Math.abs(x) - EDGE_LIMIT) * Math.sign(x);
      this.yaw0 = wrapAngle(this.yaw0 - excess * half);
      x -= excess;
    }
    if (Math.abs(y) > EDGE_LIMIT) {
      const excess = (Math.abs(y) - EDGE_LIMIT) * Math.sign(y);
      this.pitch0 += (excess * half) / Math.max(0.5, this.aspect());
      y -= excess;
    }
    if (dt > 0.2) {
      // Long gap: don't smear across it.
      this.fx.reset(x);
      this.fy.reset(y);
    } else {
      this.fx.filter(x, dt);
      this.fy.filter(y, dt);
    }
  }
}

function clampSensitivity(v: number): number {
  return Number.isFinite(v) ? Math.min(3, Math.max(0.25, v)) : 1;
}
