/**
 * Camera rig: per-mode framing with damped, blended transitions + decaying shake.
 */
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import type { CameraMode, Side } from '../core/contracts';
import { HALF_L } from '../core/contracts';
import { clamp } from './util';

const BASE_FOV: Record<CameraMode, number> = { play: 52, serve: 50, point: 46, celebrate: 46, menu: 44 };

export class CameraRig {
  mode: CameraMode = 'menu';
  private modeT = 0;
  private prevRate = 3;
  private pos = new Vector3(0, 2.4, 5);
  private target = new Vector3(0, 0.8, 0);
  private fov = 50;
  private shakeAmp = 0;
  private time = 0;
  private celebrateSide: Side = 'player';
  private menuAngle = 0.6;
  private first = true;
  private dPos = new Vector3();
  private dTgt = new Vector3();
  private pushStart = new Vector3();
  private foc = { ball: new Vector3(), player: new Vector3() };
  /** Slow-mo FOV push-in amount 0..1 (set by Stage). */
  slowMo = 0;

  /** `side` 'opponent' mirrors the framing (x→−x, z→−z) to look from behind the −Z end. */
  constructor(readonly camera: PerspectiveCamera, readonly side: Side = 'player') {}

  setMode(m: CameraMode, opts?: { side?: Side }): void {
    if (opts?.side) this.celebrateSide = opts.side;
    if (m === this.mode) return;
    this.mode = m;
    this.modeT = 0;
    if (m === 'point') this.pushStart.copy(this.pos);
  }

  shake(amount: number): void {
    this.shakeAmp = Math.min(1.5, this.shakeAmp + amount);
  }

  /** Snap to the current mode's framing (no blend), e.g. on first frame. */
  snap(): void {
    this.first = true;
  }

  update(dt: number, focusIn: { ball: Vector3; player: Vector3 }): void {
    dt = Math.min(dt, 0.1);
    // opponent rig: compute in the player's frame from mirrored inputs, mirror the result back
    const mir = this.side === 'opponent';
    const focus = this.foc;
    focus.ball.copy(focusIn.ball);
    focus.player.copy(focusIn.player);
    if (mir) {
      focus.ball.x = -focus.ball.x;
      focus.player.x = -focus.player.x;
    }
    this.time += dt;
    this.modeT += dt;
    const aspect = this.camera.aspect || 1.6;
    const narrow = clamp((1.6 - aspect) / 1.0, 0, 1.1); // 0 wide … ~1 portrait
    const t = this.modeT;
    const P = this.dPos;
    const T = this.dTgt;
    let rate = 3;
    switch (this.mode) {
      case 'play': {
        const bx = clamp(focus.ball.x, -1.2, 1.2);
        const px = clamp(focus.player.x, -1.6, 1.6);
        P.set(clamp(px * 0.35 + bx * 0.2, -0.65, 0.65), 2.45 + narrow * 1.0, 3.35 + narrow * 0.75);
        T.set(bx * 0.25 + px * 0.1, 0.7 - narrow * 0.12, -0.6 + narrow * 0.25);
        rate = 3.2;
        break;
      }
      case 'serve': {
        const px = clamp(focus.player.x, -1.2, 1.2);
        P.set(px * 0.5 - 0.3, 2.3 + narrow * 1.0, 3.25 + narrow * 0.75);
        T.set(px * 0.25 - 0.1, 0.82, -0.55 + narrow * 0.2);
        rate = 2.6;
        break;
      }
      case 'point': {
        const k = 1 - Math.exp(-t * 0.35);
        P.set(Math.sin(t * 0.25) * 0.5, 1.55 + narrow * 0.5 - k * 0.15, 2.7 + narrow * 1.1 - k * 0.6);
        T.set(Math.sin(t * 0.2) * 0.15, 0.82, -0.1);
        rate = 1.6;
        break;
      }
      case 'celebrate': {
        const s = this.celebrateSide === 'player' ? 1 : -1;
        const cz = s * (HALF_L + 0.6);
        const R = 3.1 + narrow * 1.0;
        const a = Math.sin(t * 0.32) * 1.05;
        // start in front of the winner (over the table), sweep left/right
        P.set(Math.sin(a) * R, 1.75 + Math.sin(t * 0.5) * 0.08, cz - s * Math.cos(a) * R);
        T.set(0, 1.1, cz);
        rate = 1.8;
        break;
      }
      case 'menu': {
        this.menuAngle += dt * 0.07;
        const a = this.menuAngle;
        const R = 4.6 + narrow * 1.6;
        P.set(Math.sin(a) * R, 2.25 + Math.sin(this.time * 0.13) * 0.3, Math.cos(a) * R);
        T.set(0, 0.72, 0);
        rate = 1.5;
        break;
      }
    }
    if (mir && this.mode !== 'menu') {
      P.x = -P.x;
      P.z = -P.z;
      T.x = -T.x;
      T.z = -T.z;
    }
    // blend: slower right after a mode change
    const blendIn = clamp(t / 1.4, 0, 1);
    const r = MathUtils.lerp(Math.min(this.prevRate, 1.6), rate, blendIn);
    if (blendIn >= 1) this.prevRate = rate;
    const k = this.first ? 1 : 1 - Math.exp(-r * dt);
    this.pos.lerp(P, k);
    this.target.lerp(T, k);

    // fov: keep the table width in view on narrow/portrait screens
    let fov = BASE_FOV[this.mode];
    if (aspect < 1.6) {
      const hf = 2 * Math.atan(Math.tan(MathUtils.degToRad(fov) / 2) * 1.6);
      fov = Math.min(74, MathUtils.radToDeg(2 * Math.atan(Math.tan(hf / 2) / aspect)));
    }
    this.fov = this.first ? fov : MathUtils.lerp(this.fov, fov, 1 - Math.exp(-3 * dt));
    this.first = false;

    // shake
    this.shakeAmp *= Math.exp(-7 * dt);
    const s = this.shakeAmp * 0.035;
    const cam = this.camera;
    cam.position.copy(this.pos);
    if (s > 1e-4) {
      cam.position.x += (Math.sin(this.time * 71.3) + Math.sin(this.time * 37.1)) * 0.5 * s;
      cam.position.y += (Math.sin(this.time * 59.7) + Math.sin(this.time * 23.9)) * 0.5 * s;
    }
    cam.lookAt(this.target);
    const fovOut = this.fov - this.slowMo * 6; // slow-mo push-in
    if (Math.abs(cam.fov - fovOut) > 0.01) {
      cam.fov = fovOut;
      cam.updateProjectionMatrix();
    }
  }
}
