import * as THREE from 'three';
import type { SoundHandle, ThrowableKind } from '../contracts';

export interface FruitEnt {
  kind: ThrowableKind;
  obj: THREE.Group;
  /** world-space radius */
  radius: number;
  vel: THREE.Vector3;
  /** angular velocity (axis × rad/s), world space */
  spin: THREE.Vector3;
  sliced: boolean;
  /** seconds until it becomes active (staggered launches) */
  delay: number;
  age: number;
  /** pomegranate: number of hits taken */
  hits: number;
  /** pomegranate: seconds left in the hit-frenzy hover */
  hover: number;
  /** last slice time (pomegranate re-hit cooldown) */
  lastHit: number;
  fuse?: SoundHandle;
  fuseTip?: THREE.Object3D;
  /** came from the side (frenzy) — never counts as a miss */
  noMiss: boolean;
}

export interface HalfEnt {
  obj: THREE.Object3D;
  vel: THREE.Vector3;
  spin: THREE.Vector3;
  /** effective resting radius above the table */
  r: number;
  restTime: number;
  life: number;
  thudCooldown: number;
  fading: number;
  baseScale: number;
}

const _q = new THREE.Quaternion();
const _axis = new THREE.Vector3();

/** Integrate an angular velocity vector into an object's orientation. */
export function integrateSpin(obj: THREE.Object3D, spin: THREE.Vector3, dt: number) {
  const rate = spin.length();
  if (rate < 1e-5) return;
  _axis.copy(spin).divideScalar(rate);
  _q.setFromAxisAngle(_axis, rate * dt);
  obj.quaternion.premultiply(_q);
}

export function randomSpin(out: THREE.Vector3, min: number, max: number) {
  out.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
  return out.multiplyScalar(min + Math.random() * (max - min));
}
