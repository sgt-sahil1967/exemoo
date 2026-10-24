/**
 * Club geometry for the phone-as-a-golf-club controller.
 *
 * Frames
 *  - Device (W3C): x = screen right, y = screen top, z = out of the screen (toward the viewer).
 *  - Earth  (W3C): X = east, Y = north, Z = up. The packet quaternion q maps device → earth.
 *    (Heading may be arbitrary/drifting on iOS — we only rely on gravity plus a heading captured
 *    at every address calibration.)
 *
 * The grip (see the controller's calibrate screen): the phone is held vertically in both hands
 * like a club grip, TOP OF THE PHONE POINTING DOWN AT THE BALL, SCREEN FACING THE PLAYER, thumbs on
 * the screen. Therefore at address
 *    shaft s = device +y  (≈ down),   device +z ≈ toward the player,   device +x ≈ the target for a
 *    right-hander (x = y × z = down × toward-player = target side).
 *
 * Swing frame captured at address (ClubFrame):
 *    D = earth down, L = device x flattened to horizontal (target line, right-hander's target),
 *    B = backswing direction = −hand·L (away from the target), N = D × B (rotation about +N moves
 *    the shaft from D toward B, i.e. +N = backswing direction of rotation), F = L × up (from the
 *    player toward the ball).
 *    shaftAngle θ = atan2(s·B, s·D) − θ0 (0 at address, +π/2 horizontal behind, ≈ π at the top,
 *    negative into the follow-through). Unwrapped by the caller so it can pass ±π continuously.
 *    face = twist of the phone about its own long axis relative to address, sign so + = open for
 *    both hands.
 */
import { Quaternion, Vector3 } from 'three';
import type { Handedness } from '../core/contracts';

export const DEG = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;
export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
export const UP = new Vector3(0, 0, 1);
export const DOWN = new Vector3(0, 0, -1);

/** Wrap to (−π, π]. */
export function wrapPi(a: number): number {
  a = (a + Math.PI) % (2 * Math.PI);
  if (a < 0) a += 2 * Math.PI;
  return a - Math.PI;
}

/** Choose the representative of `wrapped` (+k·2π) nearest to `prev` (continuous unwrapping). */
export function unwrapNear(wrapped: number, prev: number): number {
  return prev + wrapPi(wrapped - prev);
}

/** Device axis expressed in the earth frame. */
export function deviceAxis(q: Quaternion, axis: 'x' | 'y' | 'z', out = new Vector3()): Vector3 {
  out.set(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
  return out.applyQuaternion(q);
}

/** Twist angle of a (device-frame) relative rotation about the device y axis, (−π, π]. */
export function twistY(qRel: Quaternion): number {
  let { y, w } = qRel;
  if (w < 0) {
    y = -y;
    w = -w;
  }
  return wrapPi(2 * Math.atan2(y, w));
}

const _qa = new Quaternion();
/** Body-frame (device-frame) angular velocity, rad/s, that rotates qa into qb over dt. */
export function bodyRate(qa: Quaternion, qb: Quaternion, dt: number, out = new Vector3()): Vector3 {
  const d = _qa.copy(qa).invert().multiply(qb);
  if (d.w < 0) d.set(-d.x, -d.y, -d.z, -d.w);
  const s = Math.sqrt(Math.max(0, 1 - d.w * d.w));
  if (s < 1e-9 || dt <= 0) return out.set(0, 0, 0);
  const k = (2 * Math.atan2(s, d.w)) / (s * dt);
  return out.set(d.x * k, d.y * k, d.z * k);
}

/** The swing plane + reference captured at address. */
export class ClubFrame {
  readonly D = DOWN.clone();
  readonly L = new Vector3(-1, 0, 0);
  readonly B = new Vector3(1, 0, 0);
  readonly N = new Vector3(0, -1, 0);
  readonly F = new Vector3(0, 1, 0);
  /** Inverse of the address orientation (for the face twist). */
  readonly q0inv = new Quaternion();
  theta0 = 0;
  hand = 1;

  private readonly _v = new Vector3();
  private readonly _w = new Vector3();
  private readonly _q = new Quaternion();

  /** Capture `q` as address. */
  set(q: Quaternion, handedness: Handedness): void {
    this.hand = handedness === 'left' ? -1 : 1;
    const x = deviceAxis(q, 'x', this._v);
    x.z = 0;
    if (x.length() < 0.3) {
      // Phone rolled so far that x is near vertical: derive the target line from the screen normal.
      const z = deviceAxis(q, 'z', this._w);
      z.z = 0;
      x.crossVectors(z, UP);
      if (x.length() < 1e-3) x.set(-1, 0, 0);
    }
    this.L.copy(x.normalize());
    this.B.copy(this.L).multiplyScalar(-this.hand);
    this.N.crossVectors(this.D, this.B).normalize();
    this.F.crossVectors(this.L, UP).normalize();
    this.q0inv.copy(q).invert();
    this.theta0 = 0;
    this.theta0 = this.rawTheta(q);
  }

  /** Re-derive B/N for a new handedness without moving the address reference. */
  setHand(handedness: Handedness, q?: Quaternion): void {
    const h = handedness === 'left' ? -1 : 1;
    if (h === this.hand) return;
    this.hand = h;
    this.B.copy(this.L).multiplyScalar(-h);
    this.N.crossVectors(this.D, this.B).normalize();
    if (q) {
      this.theta0 = 0;
      this.theta0 = this.rawTheta(q);
    } else this.theta0 = -this.theta0;
  }

  /** Wrapped shaft angle (−π, π] relative to address. */
  rawTheta(q: Quaternion): number {
    const s = deviceAxis(q, 'y', this._v);
    return wrapPi(Math.atan2(s.dot(this.B), s.dot(this.D)) - this.theta0);
  }

  /** Face twist relative to address, radians, + = open (slice side) for either hand. */
  twist(q: Quaternion): number {
    return this.hand * twistY(this._q.copy(this.q0inv).multiply(q));
  }

  /** In-plane angular speed (rad/s, + = toward the backswing) from an earth-frame ω. */
  planeRate(omegaEarth: Vector3): number {
    return omegaEarth.dot(this.N);
  }

  /** Swing path angle (rad, + = out-to-in / slice path) from earth ω and the current shaft. */
  path(omegaEarth: Vector3, q: Quaternion): number {
    const s = deviceAxis(q, 'y', this._v);
    const v = this._w.crossVectors(omegaEarth, s);
    const along = Math.abs(v.dot(this.B));
    const across = -v.dot(this.F); // toward the player = out-to-in for both hands
    if (along + Math.abs(across) < 1e-3) return 0;
    return Math.atan2(across, along);
  }

  /** How much the shaft points down (cosine to gravity). */
  static downness(q: Quaternion): number {
    return -deviceAxis(q, 'y', new Vector3()).z;
  }
}

/**
 * Gyro sanity check: browsers disagree on rotationRate units (deg/s vs rad/s on some old Android
 * builds) and occasionally on axis signs. We compare each gyro axis against the angular velocity
 * derived from the (fused, trustworthy) orientation quaternion over ~50 ms windows and snap a
 * per-axis correction to {±1, ±57.3}. Until there is enough evidence the correction is +1.
 * Device-frame ordering everywhere: x = beta, y = gamma, z = alpha.
 */
export class GyroCheck {
  readonly scale = new Vector3(1, 1, 1);
  private readonly sxy = [0, 0, 0];
  private readonly sww = [0, 0, 0];
  private readonly n = [0, 0, 0];

  /** gyro and quaternion rate, both device frame, deg/s. */
  push(gyroDeg: Vector3, quatDeg: Vector3): void {
    const g = [gyroDeg.x, gyroDeg.y, gyroDeg.z];
    const w = [quatDeg.x, quatDeg.y, quatDeg.z];
    for (let i = 0; i < 3; i++) {
      if (Math.abs(w[i]) < 90) continue;
      this.sxy[i] = this.sxy[i] * 0.995 + g[i] * w[i];
      this.sww[i] = this.sww[i] * 0.995 + w[i] * w[i];
      this.n[i]++;
      if (this.n[i] < 12) continue;
      const r = this.sxy[i] / this.sww[i];
      const a = Math.abs(r);
      let c = 0;
      if (a > 0.45 && a < 2.2) c = Math.sign(r);
      else if (a > 0.008 && a < 0.04) c = Math.sign(r) * RAD2DEG;
      if (c !== 0) this.scale.setComponent(i, c);
    }
  }

  /** Apply the correction in place. */
  apply(gyroDeg: Vector3): Vector3 {
    return gyroDeg.multiply(this.scale);
  }

  reset(): void {
    this.scale.set(1, 1, 1);
    this.sxy.fill(0);
    this.sww.fill(0);
    this.n.fill(0);
  }
}
