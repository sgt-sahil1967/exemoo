import * as THREE from 'three';

export const CAMERA_POS = new THREE.Vector3(0, 3.4, 7.4);
export const CAMERA_TARGET = new THREE.Vector3(0, 2.1, -1.0);
export const CAMERA_FOV = 45;

const _pos = new THREE.Vector3();
const _tgt = new THREE.Vector3();
const _dir = new THREE.Vector3();

/**
 * Drives the game camera: base pose from the contract, trauma-based shake,
 * spring kicks, a subtle idle sway and a small dolly zoom.
 */
export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  /** Global multiplier (wire to Settings.screenShake: 0 or 1). */
  shakeScale = 1;
  /** Idle sway amount (0 disables). */
  sway = 1;
  private trauma = 0;
  private time = 0;
  private kickPos = new THREE.Vector3();
  private kickVel = new THREE.Vector3();
  private zoomTarget = 0;
  private zoom = 0;
  private seeds = [Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100];

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    camera.fov = CAMERA_FOV;
    camera.position.copy(CAMERA_POS);
    camera.lookAt(CAMERA_TARGET);
    camera.updateProjectionMatrix();
  }

  /** Add shake trauma (0..1; 0.3 light hit, 1 bomb). */
  shake(intensity: number): void {
    this.trauma = Math.min(1, this.trauma + intensity * this.shakeScale);
  }

  /** Positional impulse in world units/sec (e.g. slice direction * 0.6). */
  kick(dir: THREE.Vector3): void {
    this.kickVel.addScaledVector(dir, this.shakeScale);
  }

  /** 0..1 dolly-in amount (frenzy / slow-mo). Smoothly approached. */
  setZoom(t: number): void { this.zoomTarget = Math.max(0, Math.min(1, t)); }

  update(dt: number): void {
    this.time += dt;
    const t = this.time;
    this.trauma = Math.max(0, this.trauma - dt * 1.4);
    // critically damped-ish spring for kicks
    const k = 120, c = 16;
    this.kickVel.addScaledVector(this.kickPos, -k * dt);
    this.kickVel.multiplyScalar(Math.exp(-c * dt));
    this.kickPos.addScaledVector(this.kickVel, dt);
    this.zoom += (this.zoomTarget - this.zoom) * (1 - Math.exp(-dt * 3));

    _dir.subVectors(CAMERA_TARGET, CAMERA_POS).normalize();
    _pos.copy(CAMERA_POS).addScaledVector(_dir, this.zoom * 0.9);
    _tgt.copy(CAMERA_TARGET);
    // idle sway
    const sw = this.sway;
    _pos.x += Math.sin(t * 0.31) * 0.06 * sw;
    _pos.y += Math.sin(t * 0.23 + 1.3) * 0.035 * sw;
    _tgt.x += Math.sin(t * 0.17 + 0.4) * 0.03 * sw;
    _pos.add(this.kickPos);
    // shake: trauma^2, smooth pseudo-noise
    const s = this.trauma * this.trauma;
    const [a, b, cc, d] = this.seeds;
    if (s > 0) {
      const n = (f: number, p: number) => Math.sin(t * f + p) * 0.6 + Math.sin(t * f * 2.13 + p * 1.7) * 0.4;
      _pos.x += n(31, a) * 0.16 * s;
      _pos.y += n(27, b) * 0.13 * s;
      _tgt.x += n(23, cc) * 0.12 * s;
      _tgt.y += n(29, d) * 0.12 * s;
    }
    this.camera.position.copy(_pos);
    this.camera.lookAt(_tgt);
    if (s > 0) this.camera.rotateZ(Math.sin(t * 19 + d) * 0.03 * s);
  }

  /** Instantly reset shake/kick/zoom. */
  reset(): void {
    this.trauma = 0;
    this.kickPos.set(0, 0, 0);
    this.kickVel.set(0, 0, 0);
    this.zoom = this.zoomTarget = 0;
  }

  dispose(): void { /* nothing pooled */ }
}
