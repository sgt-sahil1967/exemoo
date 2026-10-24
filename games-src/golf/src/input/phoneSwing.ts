/**
 * PhoneSwingInput — the phone IMU stream as a calibrated golf club.
 *
 * Per sensor packet (never per frame, so no samples are lost):
 *   1. drop stale/duplicate packets (seq), dt from the phone clock (falls back to 16 ms)
 *   2. angular velocity: corrected gyro (GyroCheck cross-checks units/signs against the
 *      quaternion-derived rate), or quaternion differencing over ~40 ms when the gyro is absent
 *      (SEN1 legacy packets, some browsers)
 *   3. swing-plane quantities from the RAW quaternion (θ, in-plane ω, face twist, path) →
 *      SwingDetector (see swingDetector.ts for the state machine & thresholds)
 *   4. auto-calibration: in 'aim'/'putt', phone still (< 14°/s) and pointing down (shaft within
 *      ~55° of gravity) for 0.6 s while the detector is idle → capture address (ClubFrame)
 *   5. SEN2 button bitmask edges → onButton, de-duplicated against reliable {t:'button'} messages
 * Per frame (update): low-passed display pose (heavy at rest, ~raw while swinging) + timeouts.
 */
import { Quaternion, Vector3 } from 'three';
import { CamSwing, type CamImpact } from './camSwing';
import type {
  ClubPose,
  ControllerButton,
  InputMode,
  LinkStatus,
  PhoneToGame,
  SensorPacket,
  Settings,
  SwingEvent,
  SwingInput,
} from '../core/contracts';
import { DEFAULT_SETTINGS } from '../core/contracts';
import type { PhoneLink } from '../net/phoneLink';
import { BUTTON_ORDER, buttonBit, seqDelta } from '../net/packets';
import { ClubFrame, DEG, GyroCheck, RAD2DEG, bodyRate, clamp, unwrapNear, wrapPi } from './clubMath';
import { AIM_TUNING, PUTT_TUNING, SwingDetector } from './swingDetector';

/** The subset of PhoneLink the input needs (tests use a fake). */
export type PhoneLinkLike = Pick<PhoneLink, 'on' | 'send' | 'status'>;

const STILL_RATE = 14 * DEG; // rad/s
const CAL_HOLD_MS = 600;
const CAL_MIN_DOWN = Math.cos(55 * DEG);
const FACE_FULL = 30 * DEG;
const PACKET_TIMEOUT_MS = 1000;
const DEDUPE_MS = 300;
const QWIN_MS = 40;
const ACTIVITY_RATE = 40 * DEG;
const SWING_BIT = buttonBit('swing');

export function freshPose(connected = false): ClubPose {
  return { connected, backswing: 0, face: 0, armed: false, speed: 0, shaftAngle: 0 };
}

interface Hist {
  t: number;
  q: Quaternion;
  g: Vector3;
}

export class PhoneSwingInput implements SwingInput {
  readonly kind = 'phone' as const;
  readonly pose: ClubPose = freshPose();
  /** performance.now() of the last deliberate phone input (motion or button). */
  lastActivity = -1e9;
  /** 0…1 progress of the "hold still at address" auto-calibration. */
  calibration = 0;

  private settings: Settings = { ...DEFAULT_SETTINGS };
  private phoneHand: Settings['handedness'] | null = null;
  private mode: InputMode = 'menu';
  private readonly detector = new SwingDetector();
  private readonly frame = new ClubFrame();
  private readonly gyroCheck = new GyroCheck();
  private swingCbs = new Set<(e: SwingEvent) => void>();
  private buttonCbs = new Set<(b: ControllerButton) => void>();
  private unsubs: Array<() => void> = [];
  private readonly now: () => number;

  private _calibrated = false;
  private hasPose = false;
  private readonly q = new Quaternion();
  private hist: Hist[] = [];
  private lastSeq = -1;
  private lastT = 0;
  private lastPacketAt = -1e9;
  private gyroSeenAt = -1e9;
  private stillMs = 0;
  private calThisStill = false;
  private theta = 0;
  private omegaPlane = 0;
  private face = 0;
  private prevMask = 0;
  private pending: Array<{ b: ControllerButton; src: 'mask' | 'msg'; at: number }> = [];
  private readonly omegaDev = new Vector3();
  private readonly omegaEarth = new Vector3();
  private readonly gyroDeg = new Vector3();
  private readonly qRateDeg = new Vector3();
  private readonly meanGyro = new Vector3();

  constructor(
    private readonly link: PhoneLinkLike,
    opts: { settings?: Settings; now?: () => number } = {},
  ) {
    this.now = opts.now ?? (() => performance.now());
    if (opts.settings) this.setSettings(opts.settings);
    this.unsubs.push(
      link.on('packet', (p) => this.onPacket(p)),
      link.on('message', (m) => this.onMessage(m)),
      link.on('status', (s) => this.onStatus(s)),
    );
    this.setMode('menu');
  }

  get calibrated(): boolean {
    return this._calibrated;
  }

  /** Detector phase (diagnostics / UI hints). */
  get phase() {
    return this.detector.phase;
  }

  setSettings(s: Settings): void {
    this.settings = { ...s };
    this.phoneHand = null; // the game's setting wins until the phone toggles again
    this.applyHand();
    this.detector.sensitivity = clamp(s.sensitivity, 0.25, 4);
    this.detector.holdToSwing = s.holdToSwing;
  }

  /** Handedness currently in effect (phone toggle overrides settings until setSettings). */
  get handedness(): Settings['handedness'] {
    return this.phoneHand ?? this.settings.handedness;
  }

  private applyHand(): void {
    this.frame.setHand(this.handedness);
  }

  setMode(m: InputMode): void {
    this.mode = m;
    this.detector.setTuning(m === 'putt' ? PUTT_TUNING : AIM_TUNING);
    this.detector.enabled = m === 'aim' || m === 'putt';
    this.detector.reset();
    this.stillMs = 0;
    this.calThisStill = false;
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
    if (!this.hasPose) return;
    this.calibrate();
  }

  private calibrate(): void {
    this.frame.set(this.q, this.handedness);
    this._calibrated = true;
    this.calibration = 1;
    this.theta = 0;
    this.detector.reset();
  }

  vibrate(pattern: number | number[]): void {
    if (this.settings.haptics) this.link.send({ t: 'haptic', pattern });
  }

  dispose(): void {
    for (const u of this.unsubs) u();
    this.unsubs = [];
    this.swingCbs.clear();
    this.buttonCbs.clear();
  }

  // ───────────────────────────────── link events ─────────────────────────────────
  private onStatus(s: LinkStatus): void {
    if (s !== 'connected') this.dropLive();
  }

  private dropLive(): void {
    this.detector.reset();
    this.prevMask = 0;
    this.pose.armed = false;
    this.omegaPlane = 0;
  }

  private onMessage(m: PhoneToGame): void {
    if (m.t === 'hello') {
      if (m.hand === 'left' || m.hand === 'right') {
        this.phoneHand = m.hand;
        this.applyHand();
      }
      // New phone session: its heading reference may differ — recalibrate at the next address.
      this.lastSeq = -1;
      this.hasPose = false;
      this.hist = [];
      this._calibrated = false;
      this.calibration = 0;
      this.gyroCheck.reset();
      this.dropLive();
    } else if (m.t === 'button') {
      this.fireButton(m.b, 'msg');
    }
  }

  private fireButton(b: ControllerButton, src: 'mask' | 'msg'): void {
    const now = this.now();
    this.pending = this.pending.filter((p) => now - p.at < DEDUPE_MS);
    const i = this.pending.findIndex((p) => p.b === b && p.src !== src);
    if (i >= 0) {
      this.pending.splice(i, 1); // the other path already delivered this press
      return;
    }
    this.pending.push({ b, src, at: now });
    this.lastActivity = now;
    if (b === 'recenter') this.recenter();
    for (const cb of this.buttonCbs) cb(b);
  }

  // ─────────────────────────────────── packets ───────────────────────────────────
  /** Feed one packet. Public for tests/replay; normally driven by the link. */
  // ── camera assist fusion ──
  private camSwing = new CamSwing();
  /** IMU swing waiting briefly for the camera's view of the same swing (camera frames arrive later). */
  private pendingImu: { ev: SwingEvent; at: number } | null = null;
  /** Camera impact waiting briefly for the IMU. */
  private pendingCam: { imp: CamImpact; at: number } | null = null;
  private lastFiredAt = -Infinity;

  onPacket(p: SensorPacket): void {
    const now = this.now();
    if (p.cam) {
      const imp = this.camSwing.push({ t: now, x: p.cam.x, y: p.cam.y, sx: p.cam.sx, sy: p.cam.sy, scale: p.cam.scale });
      if (imp) this.onCamImpact(imp, now);
    }
    if (this.lastSeq >= 0) {
      const d = seqDelta(this.lastSeq, p.seq);
      if (d <= 0 && d > -2000) return; // stale / duplicate (big negative jump = phone restarted)
    }
    let dt = this.lastSeq >= 0 ? ((p.t - this.lastT) >>> 0) / 1000 : 0;
    if (!(dt > 0) || dt > 0.25) dt = this.lastSeq >= 0 ? 0.016 : 0;
    this.lastSeq = p.seq;
    this.lastT = p.t;
    this.lastPacketAt = now;

    const meas = new Quaternion(p.q.x, p.q.y, p.q.z, p.q.w);
    if (meas.lengthSq() < 1e-6) return;
    meas.normalize();
    if (this.hasPose && this.q.dot(meas) < 0) meas.set(-meas.x, -meas.y, -meas.z, -meas.w);
    this.q.copy(meas);
    this.hasPose = true;

    // ── angular velocity (device frame) ──
    this.gyroDeg.set(p.gyro.beta, p.gyro.gamma, p.gyro.alpha);
    const gyroLive = this.gyroDeg.lengthSq() > 0.25;
    if (gyroLive) this.gyroSeenAt = now;
    this.hist.push({ t: p.t, q: meas.clone(), g: this.gyroDeg.clone() });
    while (this.hist.length > 2 && ((p.t - this.hist[1].t) >>> 0) >= QWIN_MS) this.hist.shift();
    const old = this.hist[0];
    const win = this.hist.length > 1 ? ((p.t - old.t) >>> 0) / 1000 : 0;
    if (win > 0 && win < 0.3) {
      bodyRate(old.q, meas, win, this.qRateDeg).multiplyScalar(RAD2DEG);
      if (gyroLive) {
        this.meanGyro.set(0, 0, 0);
        for (let i = 1; i < this.hist.length; i++) this.meanGyro.add(this.hist[i].g);
        this.meanGyro.multiplyScalar(1 / (this.hist.length - 1));
        this.gyroCheck.push(this.meanGyro, this.qRateDeg);
      }
    } else this.qRateDeg.set(0, 0, 0);
    if (now - this.gyroSeenAt < 500) this.gyroCheck.apply(this.omegaDev.copy(this.gyroDeg)).multiplyScalar(DEG);
    else this.omegaDev.copy(this.qRateDeg).multiplyScalar(DEG);
    this.omegaEarth.copy(this.omegaDev).applyQuaternion(meas);
    const rate = this.omegaDev.length();
    if (rate > ACTIVITY_RATE) this.lastActivity = now;

    // ── buttons ──
    const mask = p.buttons >>> 0;
    const rising = mask & ~this.prevMask;
    this.prevMask = mask;
    this.pose.armed = (mask & SWING_BIT) !== 0;
    if (rising) {
      for (let i = 0; i < BUTTON_ORDER.length; i++) if (rising & (1 << i)) this.fireButton(BUTTON_ORDER[i], 'mask');
    }

    // ── auto-calibration ──
    const active = this.mode === 'aim' || this.mode === 'putt';
    const still = rate < STILL_RATE && this.qRateDeg.length() * DEG < STILL_RATE * 1.5;
    if (active && still && this.detector.phase === 'idle' && ClubFrame.downness(meas) > CAL_MIN_DOWN) {
      this.stillMs += dt * 1000;
      if (!this._calibrated) this.calibration = clamp(this.stillMs / CAL_HOLD_MS, 0, 1);
      if (this.stillMs >= CAL_HOLD_MS && !this.calThisStill) {
        this.calThisStill = true;
        this.calibrate();
      }
    } else if (!still) {
      this.stillMs = 0;
      this.calThisStill = false;
      if (!this._calibrated) this.calibration = 0;
    }

    if (!this._calibrated) {
      this.theta = 0;
      this.omegaPlane = 0;
      this.face = 0;
      return;
    }

    // ── swing plane ──
    const wrapped = this.frame.rawTheta(meas);
    let theta = unwrapNear(wrapped, this.theta);
    if (Math.abs(theta) > 2 * Math.PI || (this.detector.phase === 'idle' && Math.abs(wrapped) < Math.PI / 2)) {
      theta = wrapPi(theta);
    }
    this.theta = theta;
    this.omegaPlane = this.frame.planeRate(this.omegaEarth);
    this.face = clamp(this.frame.twist(meas) / FACE_FULL, -1, 1);
    const ev = this.detector.push({
      t: now,
      theta,
      omega: this.omegaPlane,
      face: this.face,
      path: this.frame.path(this.omegaEarth, meas),
      armed: this.pose.armed,
    });
    if (ev) this.onImuSwing(ev, now);
  }

  // ─────────────────────────── camera + IMU swing fusion ───────────────────────────
  /**
   * The gyro is precise about *when* (impact timing, club face) but drifts on *how much*; the camera
   * sees the real arm swing (backswing height, hand speed, path) but ~100 ms late at ~30 fps.
   * Whichever sees impact first waits a short window for the other, then the shot is fused:
   * power mostly from the camera, timing / face from the phone. Either one alone still works.
   */
  private camLive(now: number) {
    return now - this.camSwing.lastAt < 500;
  }
  private onImuSwing(ev: SwingEvent, now: number) {
    if (now - this.lastFiredAt < 700) return;
    if (this.pendingCam && now - this.pendingCam.at < 350) { const c = this.pendingCam; this.pendingCam = null; return this.fire(this.fuse(ev, c.imp)); }
    if (!this.camLive(now)) return this.fire(ev);
    this.pendingImu = { ev, at: now }; // wait for the camera's impact frame
  }
  private onCamImpact(imp: CamImpact, now: number) {
    if (now - this.lastFiredAt < 700) return;
    if (this.pendingImu) { const p = this.pendingImu; this.pendingImu = null; return this.fire(this.fuse(p.ev, imp)); }
    this.pendingCam = { imp, at: now };
  }
  /** Called every frame: release anything that waited too long for its partner. */
  private flushPending(now: number) {
    if (this.pendingImu && now - this.pendingImu.at > 220) { const p = this.pendingImu; this.pendingImu = null; this.fire(p.ev); }
    if (this.pendingCam && now - this.pendingCam.at > 160) {
      // The gyro missed it (soft or odd swing): shoot from the camera alone, face from the phone's current pose.
      const c = this.pendingCam; this.pendingCam = null;
      const synth: SwingEvent = { time: performance.now(), power: 0, curve: clamp(this.face * 0.8, -1, 1), quality: 0.75, backswing: 0, practice: this.detector.holdToSwing && !this.pose.armed };
      this.fire(this.fuse(synth, c.imp, true));
    }
  }
  private fuse(ev: SwingEvent, imp: CamImpact, camOnly = false): SwingEvent {
    const putt = this.mode === 'putt';
    const fullRise = putt ? 0.7 : 2.0; // shoulder widths of hand rise for a full backswing / long putt
    const fullSpeed = putt ? 2.6 : 10; // shoulder widths per second through the ball
    const back = clamp(imp.rise / fullRise, 0, 1.2);
    const camPower = clamp(0.5 * back + 0.5 * (imp.speed / fullSpeed), 0, 1.15);
    return {
      ...ev,
      power: camOnly ? camPower : clamp(camPower * 0.7 + ev.power * 0.3, 0, 1.15),
      backswing: Math.max(back, camOnly ? 0 : ev.backswing * 0.4),
      curve: clamp(ev.curve * 0.65 + imp.path * 0.35, -1, 1),
    };
  }
  private fire(ev: SwingEvent) {
    this.lastFiredAt = this.now();
    for (const cb of this.swingCbs) cb(ev);
  }

  // ──────────────────────────────────── frame ────────────────────────────────────
  update(dt: number): void {
    dt = clamp(dt, 0, 0.1);
    const live = this.link.status === 'connected' && this.now() - this.lastPacketAt < PACKET_TIMEOUT_MS;
    if (this.pose.connected && !live) this.dropLive();
    this.pose.connected = live;
    const putt = this.mode === 'putt';
    const full = putt ? PUTT_TUNING.backFull : AIM_TUNING.backFull;
    const speed = live ? clamp(Math.abs(this.omegaPlane) / (putt ? 220 * DEG : 900 * DEG), 0, 1) : 0;
    const theta = live && this._calibrated ? this.theta : 0;
    const face = live && this._calibrated ? this.face : 0;
    const tau = speed > 0.12 ? 0.012 : 0.05;
    const k = dt > 0 ? 1 - Math.exp(-dt / tau) : 1;
    const p = this.pose;
    p.shaftAngle += (theta - p.shaftAngle) * k;
    p.face += (face - p.face) * k;
    p.backswing = clamp(p.shaftAngle / full, -0.2, 1.2);
    // Camera assist: how high the hands are above address is an absolute backswing measure.
    const rise = this.camSwing.liveRise(this.now());
    if (rise !== null) p.backswing = clamp(p.backswing * 0.2 + clamp(rise / (putt ? 0.7 : 2.0), 0, 1.2) * 0.8, -0.2, 1.2);
    this.flushPending(this.now());
    p.speed = Math.max(speed, p.speed * Math.exp(-dt / 0.1));
    if (!live) p.armed = false;
  }
}
