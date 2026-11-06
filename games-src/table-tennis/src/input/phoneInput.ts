/**
 * PhoneInput — turns the phone's IMU stream into a calibrated paddle.
 *
 * Per sensor packet (not per frame, so no samples are lost):
 *   1. drop stale / duplicate packets (seq), derive dt from the phone clock
 *   2. adaptive (one-euro style) smoothing of the device quaternion: heavy at rest, ~raw while swinging
 *   3. world-frame paddle delta R = Yo · C · q · q0⁻¹ · C⁻¹ (see paddleMath.ts)
 *   4. swing intensity from gyro magnitude (or quaternion angular velocity) + linear accel → SwingDetector
 *   5. SEN2 button bitmask edges → onButton (de-duplicated against control-channel button messages)
 * Per frame (update):
 *   PaddleState (aim, face, backhand, swing), auto-calibration, slow yaw-drift bleed.
 */
import { Quaternion, Vector3 } from 'three';
import type {
  ControllerButton,
  Handedness,
  PaddleInput,
  PaddleState,
  PhoneToGame,
  SensorPacket,
  SwingEvent,
  LinkStatus,
} from '../core/contracts';
import type { PhoneLink } from '../net/phoneLink';
import { BUTTON_ORDER, seqDelta } from '../net/packets';
import { SwingDetector } from './swing';
import { DEG, EARTH_TO_WORLD, angularVelocity, clamp, paddleAngles, yawOf, yawQuat } from './paddleMath';

/** The subset of PhoneLink that PhoneInput needs (lets tests use a fake). */
export type PhoneLinkLike = Pick<PhoneLink, 'on' | 'send' | 'status'>;

const AIM_RANGE = 50 * DEG; // ±50° yaw → ±1
const AIM_Y_RANGE = 45 * DEG; // ±45° face elevation → ±1
const BACKHAND_ON = 35 * DEG;
const BACKHAND_OFF = 22 * DEG;
const OMEGA_FULL = 18; // rad/s for a full-power swing
const ACCEL_FULL = 32; // m/s² for a full-power swing
const YAW_BLEED_TAU = 25; // s
const CAL_HOLD_S = 1.0;
const STILL_OMEGA = 0.7; // rad/s
const STILL_ACCEL = 1.6; // m/s²
const PACKET_TIMEOUT_MS = 1000;
const DEDUPE_MS = 350;

function freshState(): PaddleState {
  return { connected: false, orientation: new Quaternion(), aimX: 0, aimY: 0, face: 0, backhand: false, swing: 0 };
}

function copyState(s: PaddleState): PaddleState {
  return { ...s, orientation: s.orientation.clone() };
}

export class PhoneInput implements PaddleInput {
  readonly kind = 'phone' as const;
  readonly state: PaddleState = freshState();
  private _calibration = 0;
  get calibration(): number {
    return this._calibration;
  }

  private handedness: Handedness;
  /** Slightly lower trigger than the detector default: any deliberate flick should count as a hit. */
  private readonly detector = new SwingDetector({ on: 0.21, off: 0.12 });
  private swingCbs = new Set<(e: SwingEvent) => void>();
  private buttonCbs = new Set<(b: ControllerButton) => void>();
  private unsubs: Array<() => void> = [];

  // pose
  private hasPose = false;
  private calibrated = false;
  private readonly qRaw = new Quaternion(); // filtered device quaternion (device → earth)
  /** Device-frame grip offset B (identity = ideal upright pose). R = Yo · C · q · B. */
  private readonly offset = new Quaternion();
  private readonly RmeasPrev = new Quaternion();
  private readonly Rmeas = new Quaternion();
  private readonly yo = new Quaternion();
  private readonly R = new Quaternion();
  private readonly Rprev = new Quaternion();
  private readonly omega = new Vector3(); // world angular velocity rad/s
  private readonly accWorld = new Vector3();
  private readonly gravity = new Vector3();
  private readonly linVel = new Vector3(); // leaky-integrated world accel (direction cue)
  private gravityInit = false;
  private lastSeq = -1;
  private lastT = 0;
  private lastPacketAt = -1e9;
  private speedRad = 0;
  private accelMag = 0;
  private swingLevel = 0;
  private lastIntensity = 0;
  private stillFor = 0;
  private isBackhand = false;
  private peakSnapshot: { paddle: PaddleState; dir: { x: number; y: number; z: number } } | null = null;
  private prevMask = 0;
  private pending: Array<{ b: ControllerButton; src: 'mask' | 'msg'; at: number }> = [];
  private now: () => number;

  constructor(
    private link: PhoneLinkLike,
    opts: { handedness: Handedness; sensitivity: number; now?: () => number },
  ) {
    this.handedness = opts.handedness;
    this.detector.sensitivity = clamp(opts.sensitivity, 0.25, 4);
    this.now = opts.now ?? (() => performance.now());
    this.unsubs.push(
      link.on('packet', (p) => this.onPacket(p)),
      link.on('message', (m) => this.onMessage(m)),
      link.on('status', (s) => this.onStatus(s)),
    );
  }

  setHandedness(h: Handedness): void {
    this.handedness = h;
  }

  setSensitivity(s: number): void {
    this.detector.sensitivity = clamp(s, 0.25, 4);
  }

  setSwingEnabled(on: boolean): void {
    this.detector.enabled = on;
    if (!on) this.detector.reset();
  }

  /** Restart the "hold still in neutral pose" auto-calibration (e.g. when the calibrate screen opens). */
  beginCalibration(): void {
    this.calibrated = false;
    this._calibration = 0;
    this.stillFor = 0;
  }

  onSwing(cb: (e: SwingEvent) => void): () => void {
    this.swingCbs.add(cb);
    return () => this.swingCbs.delete(cb);
  }

  onButton(cb: (b: ControllerButton) => void): () => void {
    this.buttonCbs.add(cb);
    return () => this.buttonCbs.delete(cb);
  }

  recenter(): void {
    if (!this.hasPose) {
      this.calibrated = true;
      this._calibration = 1;
      return;
    }
    // Heading: yaw-only correction of the current pose; grip: whatever tilt remains → R = identity.
    const W = new Quaternion().copy(EARTH_TO_WORLD).multiply(this.qRaw);
    yawQuat(-yawOf(W), this.yo);
    this.offset.copy(W.premultiply(this.yo)).invert();
    this.computeR(this.R);
    this.Rprev.copy(this.R);
    this.RmeasPrev.copy(this.R);
    this.calibrated = true;
    this._calibration = 1;
    this.stillFor = 0;
  }

  vibrate(pattern: number | number[]): void {
    this.link.send({ t: 'haptic', pattern });
  }

  dispose(): void {
    for (const u of this.unsubs) u();
    this.unsubs = [];
    this.swingCbs.clear();
    this.buttonCbs.clear();
  }

  // ───────────────────────────────── link events ─────────────────────────────────
  private onStatus(s: LinkStatus): void {
    if (s !== 'connected') {
      this.detector.reset();
      this.prevMask = 0;
    }
  }

  private onMessage(m: PhoneToGame): void {
    if (m.t === 'hello') {
      if (m.hand === 'left' || m.hand === 'right') this.handedness = m.hand;
      // New phone session: its heading reference may have changed — recalibrate.
      this.lastSeq = -1;
      this.hasPose = false;
      this.gravityInit = false;
      this.beginCalibration();
    } else if (m.t === 'button') {
      this.fireButton(m.b, 'msg');
    }
  }

  private fireButton(b: ControllerButton, src: 'mask' | 'msg'): void {
    const now = this.now();
    this.pending = this.pending.filter((p) => now - p.at < DEDUPE_MS);
    const i = this.pending.findIndex((p) => p.b === b && p.src !== src);
    if (i >= 0) {
      this.pending.splice(i, 1); // the other transport already delivered this press
      return;
    }
    this.pending.push({ b, src, at: now });
    if (b === 'recenter') this.recenter();
    for (const cb of this.buttonCbs) cb(b);
  }

  /** Paddle world-frame delta: Yo · C · q · B. */
  private computeR(out: Quaternion): Quaternion {
    return out.copy(EARTH_TO_WORLD).multiply(this.qRaw).multiply(this.offset).premultiply(this.yo);
  }

  /** Feed one packet. Public for tests/replay; normally driven by the link. */
  private cam: SensorPacket['cam'] = null;
  private camAt = -Infinity;

  onPacket(p: SensorPacket): void {
    const now = this.now();
    if (p.cam) {
      this.cam = p.cam;
      this.camAt = now;
    }
    // ordering
    if (this.lastSeq >= 0) {
      const d = seqDelta(this.lastSeq, p.seq);
      if (d <= 0 && d > -2000) return; // stale or duplicate (a big negative jump = phone restarted)
    }
    let dt = this.lastSeq >= 0 ? ((p.t - this.lastT) >>> 0) / 1000 : 0;
    if (!(dt > 0) || dt > 0.25) dt = this.lastSeq >= 0 ? 0.016 : 0;
    this.lastSeq = p.seq;
    this.lastT = p.t;
    this.lastPacketAt = now;

    const meas = new Quaternion(p.q.x, p.q.y, p.q.z, p.q.w);
    if (meas.lengthSq() < 1e-6) return;
    meas.normalize();

    // gyro magnitude (axis-convention independent)
    const g = p.gyro;
    const gyroMag = Math.hypot(g.alpha, g.beta, g.gamma) * DEG;

    if (!this.hasPose) {
      this.qRaw.copy(meas);
      this.hasPose = true;
      if (!this.calibrated) {
        // Default neutral: ideal upright pose; only align heading.
        this.offset.identity();
        this.yo.identity();
        this.computeR(this.R);
        yawQuat(-yawOf(this.R), this.yo);
      }
      this.computeR(this.R);
      this.Rprev.copy(this.R);
      this.RmeasPrev.copy(this.R);
    } else {
      // adaptive smoothing: cutoff rises with angular speed (≈ raw during swings)
      if (this.qRaw.dot(meas) < 0) meas.set(-meas.x, -meas.y, -meas.z, -meas.w);
      const angle = 2 * Math.acos(Math.min(1, Math.abs(this.qRaw.dot(meas))));
      const speed = Math.max(gyroMag, dt > 0 ? angle / dt : 0);
      const fc = 2.5 + 2.0 * speed; // Hz
      const tau = 1 / (2 * Math.PI * fc);
      const a = dt > 0 ? dt / (dt + tau) : 1;
      this.qRaw.slerp(meas, a);
      this.Rprev.copy(this.R);
      this.computeR(this.R);
    }

    // angular velocity in world frame (from the unfiltered measurement for responsiveness)
    this.Rmeas.copy(EARTH_TO_WORLD).multiply(meas).multiply(this.offset).premultiply(this.yo);
    if (dt > 0) angularVelocity(this.RmeasPrev, this.Rmeas, dt, this.omega);
    else this.omega.set(0, 0, 0);
    this.RmeasPrev.copy(this.Rmeas);
    const quatSpeed = this.omega.length();
    this.speedRad = gyroMag > 0.01 ? gyroMag : quatSpeed;

    // linear acceleration: high-pass against a slow gravity estimate (works whether or not the
    // phone sent gravity-free acceleration), then rotate to world
    const acc = new Vector3(p.acc.x, p.acc.y, p.acc.z);
    if (!this.gravityInit) {
      this.gravity.copy(acc);
      this.gravityInit = true;
    } else if (dt > 0) {
      this.gravity.lerp(acc, Math.min(1, dt / 0.6));
    }
    const lin = acc.sub(this.gravity);
    this.accelMag = lin.length();
    // device → world rotation is C·q (axes independent of the neutral offset is fine for direction)
    this.accWorld.copy(lin).applyQuaternion(new Quaternion().copy(EARTH_TO_WORLD).multiply(this.qRaw)).applyQuaternion(this.yo);
    if (dt > 0) {
      this.linVel.multiplyScalar(Math.exp(-dt / 0.15)).addScaledVector(this.accWorld, dt);
    }

    // swing
    const intensity = Math.max(this.speedRad / OMEGA_FULL, (this.accelMag / ACCEL_FULL) * 0.85);
    this.lastIntensity = intensity;
    const instant = clamp(intensity * this.detector.sensitivity, 0, 1);
    this.swingLevel = Math.max(this.swingLevel, instant);
    {
      const res = this.detector.push(now, intensity);
      if (res.newMax) this.peakSnapshot = { paddle: this.snapshot(), dir: this.swingDir() };
      if (res.fired && this.peakSnapshot) {
        const ev: SwingEvent = {
          time: res.fired.time,
          power: res.fired.power,
          dir: this.peakSnapshot.dir,
          paddle: { ...this.peakSnapshot.paddle, swing: Math.max(this.peakSnapshot.paddle.swing, res.fired.power) },
        };
        this.peakSnapshot = null;
        for (const cb of this.swingCbs) cb(ev);
      }
    }

    // buttons (SEN2 bitmask rising edges)
    const mask = p.buttons >>> 0;
    const rising = mask & ~this.prevMask;
    this.prevMask = mask;
    if (rising) {
      for (let i = 0; i < BUTTON_ORDER.length; i++) if (rising & (1 << i)) this.fireButton(BUTTON_ORDER[i], 'mask');
    }
  }

  /** Swing direction in the player's view frame (x right, y up, z toward the opponent). */
  private swingDir(): { x: number; y: number; z: number } {
    // Paddle travels on an arc around the body: v ≈ ω × lever, lever from pivot (torso/elbow) to paddle.
    const hand = this.handedness === 'right' ? 1 : -1;
    const side = this.isBackhand ? -hand : hand;
    const lever = new Vector3(0.8 * side, 0.05, -0.45).normalize();
    const v = new Vector3().crossVectors(this.omega, lever);
    if (v.lengthSq() > 1e-6) v.normalize();
    const lv = this.linVel.clone();
    const conf = Math.min(1, lv.length() / 0.6);
    if (lv.lengthSq() > 1e-6) v.addScaledVector(lv.normalize(), 0.6 * conf);
    if (v.lengthSq() < 1e-6) v.set(0, 0, -1);
    v.normalize();
    return { x: v.x, y: v.y, z: -v.z };
  }

  private snapshot(): PaddleState {
    this.fillState(this.state);
    return copyState(this.state);
  }

  private fillState(s: PaddleState): void {
    const ang = paddleAngles(this.R);
    s.orientation.copy(this.R);
    s.aimX = clamp(ang.aim / AIM_RANGE, -1, 1);
    // Camera assist: the hand's position beside the shoulder is absolute, so it anchors left/right aim.
    if (this.cam && this.now() - this.camAt < 400) {
      const side = clamp((this.cam.x - this.cam.sx) / (this.cam.scale * 1.4), -1, 1);
      s.aimX = clamp(s.aimX * 0.4 + side * 0.6, -1, 1);
    }
    s.face = clamp(ang.face, -1.3, 1.3);
    s.aimY = clamp(ang.face / AIM_Y_RANGE, -1, 1);
    // backhand: blade tip leaning toward the off-hand side, or the paddle turned over
    const hand = this.handedness === 'right' ? 1 : -1;
    const toward = ang.lean * hand; // + = tip leaning across the body
    if (this.isBackhand) this.isBackhand = toward > BACKHAND_OFF || ang.flipped;
    else this.isBackhand = toward > BACKHAND_ON || ang.flipped;
    s.backhand = this.isBackhand;
    s.swing = clamp(this.swingLevel, 0, 1);
    s.connected = this.link.status === 'connected' && this.now() - this.lastPacketAt < PACKET_TIMEOUT_MS;
  }

  update(dt: number): void {
    dt = clamp(dt, 0, 0.1);
    // swing meter: instant attack (in onPacket), ~120 ms decay
    this.swingLevel *= Math.exp(-dt / 0.12);
    if (this.now() - this.lastPacketAt > PACKET_TIMEOUT_MS) this.swingLevel = 0;

    if (this.hasPose) {
      const still = this.speedRad < STILL_OMEGA && this.accelMag < STILL_ACCEL;
      // auto-calibration: phone upright (device y within ~37° of vertical) and still for ~1 s
      if (!this.calibrated) {
        const upright = new Vector3(0, 1, 0).applyQuaternion(new Quaternion().copy(EARTH_TO_WORLD).multiply(this.qRaw)).y > 0.8;
        if (still && upright) {
          this.stillFor += dt;
          this._calibration = clamp(this.stillFor / CAL_HOLD_S, 0, 1);
          if (this.stillFor >= CAL_HOLD_S) this.recenter();
        } else {
          this.stillFor = Math.max(0, this.stillFor - dt * 3);
          this._calibration = clamp(this.stillFor / CAL_HOLD_S, 0, 1);
        }
      } else if (!this.detector.swinging && this.speedRad < 3) {
        // slow yaw-drift bleed toward the calibrated heading (intentional aim is short-lived)
        const ang = paddleAngles(this.R);
        if (Math.abs(ang.face) < 60 * DEG) {
          const k = 1 - Math.exp(-dt / YAW_BLEED_TAU);
          const corr = yawQuat(-yawOf(this.R) * k);
          this.yo.premultiply(corr);
          this.R.premultiply(corr);
          this.RmeasPrev.premultiply(corr);
        }
      }
    }
    this.fillState(this.state);
  }

  /** Diagnostics: last raw swing intensity (≈1 = full power at sensitivity 1). */
  get intensity(): number {
    return this.lastIntensity;
  }
}
