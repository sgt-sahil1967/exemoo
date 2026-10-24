import * as THREE from 'three';
import { clamp, lerp, smooth } from '../constants';
import { makeRacket } from './racket';

export type Stroke = 'fh' | 'bh' | 'serve';

export interface Outfit {
  shirt: string;
  shorts: string;
  skin: string;
  hair: string;
  shoes: string;
  band: string;
  racket: string;
}

/** Joint rotations used by keyframe poses. */
interface Pose {
  spineY: number;
  spineX: number;
  rS: [number, number, number];
  rE: number;
  lS: [number, number, number];
  lE: number;
}

const P = (spineY: number, spineX: number, rS: [number, number, number], rE: number, lS: [number, number, number], lE: number): Pose => ({
  spineY,
  spineX,
  rS,
  rE,
  lS,
  lE,
});

const READY = P(0, 0.12, [0.55, 0, 0.18], 1.0, [0.6, 0, -0.25], 1.1);

// Keyframes: [phase, pose]. Phase 0.5 is ball contact.
const POSES: Record<Stroke, [number, Pose][]> = {
  fh: [
    [0, READY],
    [0.3, P(-1.05, 0.15, [0.25, 0, 1.15], 0.55, [1.35, 0, -0.2], 0.2)],
    [0.5, P(-0.1, 0.1, [1.25, 0, 0.75], 0.2, [0.7, 0, -0.7], 0.4)],
    [0.72, P(0.7, 0.12, [2.2, 0, -0.05], 1.2, [0.35, 0, -0.45], 1.2)],
    [1, P(0.85, 0.12, [2.4, 0, -0.35], 1.7, [0.3, 0, -0.3], 1.4)],
  ],
  bh: [
    [0, READY],
    [0.3, P(1.15, 0.15, [0.95, 0, -0.55], 0.85, [0.9, 0, 0.35], 1.3)],
    [0.5, P(0.2, 0.1, [1.3, 0, 0.15], 0.1, [0.45, 0, -0.65], 0.4)],
    [0.72, P(-0.45, 0.1, [2.0, 0, 0.85], 0.15, [0.25, 0, -0.95], 0.4)],
    [1, P(-0.6, 0.1, [2.35, 0, 1.1], 0.3, [0.2, 0, -1.0], 0.4)],
  ],
  serve: [
    [0, P(0, 0.05, [0.35, 0, 0.2], 0.6, [0.55, 0, -0.15], 0.6)],
    [0.25, P(-0.55, -0.22, [-0.25, 0, 1.25], 1.95, [3.0, 0, -0.1], 0.05)],
    [0.42, P(-0.3, -0.3, [0.4, 0, 1.0], 2.3, [2.4, 0, -0.2], 0.2)],
    [0.5, P(0, 0.1, [3.0, 0, 0.2], 0.05, [1.0, 0, -0.3], 0.5)],
    [0.75, P(0.45, 0.35, [1.2, 0, -0.75], 0.4, [0.4, 0, -0.3], 0.8)],
    [1, P(0.5, 0.3, [0.8, 0, -0.9], 0.5, [0.3, 0, -0.3], 0.9)],
  ],
};

function blendPose(a: Pose, b: Pose, t: number): Pose {
  const l3 = (x: [number, number, number], y: [number, number, number]): [number, number, number] => [
    lerp(x[0], y[0], t),
    lerp(x[1], y[1], t),
    lerp(x[2], y[2], t),
  ];
  return {
    spineY: lerp(a.spineY, b.spineY, t),
    spineX: lerp(a.spineX, b.spineX, t),
    rS: l3(a.rS, b.rS),
    rE: lerp(a.rE, b.rE, t),
    lS: l3(a.lS, b.lS),
    lE: lerp(a.lE, b.lE, t),
  };
}

function samplePose(stroke: Stroke, phase: number): Pose {
  const keys = POSES[stroke];
  for (let i = 0; i < keys.length - 1; i++) {
    const [p0, a] = keys[i];
    const [p1, b] = keys[i + 1];
    if (phase <= p1) return blendPose(a, b, smooth(clamp((phase - p0) / (p1 - p0), 0, 1)));
  }
  return keys[keys.length - 1][1];
}

interface Swing {
  stroke: Stroke;
  start: number;
  contact: number;
}

const FOLLOW = 0.42;

/** Stylised procedural tennis player. Model space faces −z. */
export class Athlete {
  root = new THREE.Group();
  vel = new THREE.Vector3();
  target: THREE.Vector3 | null = null;
  maxSpeed = 6.5;
  accel = 28;
  /** +1 if the player faces −z (near player), −1 if facing +z. */
  readonly facing: 1 | -1;
  holdingBall = false;
  /** Debug: freeze the upper body at a stroke phase. */
  debugPose: { stroke: Stroke; phase: number } | null = null;

  private hips = new THREE.Group();
  private spine = new THREE.Group();
  private head = new THREE.Group();
  private shR = new THREE.Group();
  private shL = new THREE.Group();
  private elR = new THREE.Group();
  private elL = new THREE.Group();
  private handR = new THREE.Group();
  private handL = new THREE.Group();
  private hipR = new THREE.Group();
  private hipL = new THREE.Group();
  private kneeR = new THREE.Group();
  private kneeL = new THREE.Group();
  private swing: Swing | null = null;
  private lastStroke: Stroke = 'fh';
  private recover = 1;
  private runPhase = 0;
  private yaw = 0;
  private time = 0;

  constructor(outfit: Outfit, facing: 1 | -1) {
    this.facing = facing;
    const mat = (color: string, rough = 0.62) => new THREE.MeshStandardMaterial({ color, roughness: rough });
    const shirt = mat(outfit.shirt, 0.7);
    const shorts = mat(outfit.shorts, 0.75);
    const skin = mat(outfit.skin, 0.55);
    const hair = mat(outfit.hair, 0.8);
    const shoes = mat(outfit.shoes, 0.5);
    const sock = mat('#f4f4f4', 0.8);
    const band = mat(outfit.band, 0.6);

    const cap = (r: number, len: number, m: THREE.Material, y: number) => {
      const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 14), m);
      mesh.position.y = y;
      return mesh;
    };

    this.root.add(this.hips);
    this.hips.position.y = 0.92;

    // Pelvis / shorts.
    const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.24, 16), shorts);
    pelvis.scale.z = 0.75;
    pelvis.position.y = -0.04;
    this.hips.add(pelvis);

    this.hips.add(this.spine);
    this.spine.position.y = 0.06;
    const torso = cap(0.17, 0.3, shirt, 0.24);
    torso.scale.set(1.18, 1, 0.78);
    this.spine.add(torso);
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 12), shirt);
    chest.scale.set(1.15, 0.6, 0.8);
    chest.position.y = 0.42;
    this.spine.add(chest);
    const neck = cap(0.05, 0.06, skin, 0.55);
    this.spine.add(neck);

    this.spine.add(this.head);
    this.head.position.y = 0.67;
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 16), skin);
    headMesh.scale.set(0.92, 1.05, 1);
    this.head.add(headMesh);
    const hairMesh = new THREE.Mesh(new THREE.SphereGeometry(0.117, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hair);
    hairMesh.position.set(0, 0.012, 0.008);
    hairMesh.rotation.x = 0.25;
    this.head.add(hairMesh);
    const headband = new THREE.Mesh(new THREE.TorusGeometry(0.106, 0.016, 8, 24), band);
    headband.rotation.x = Math.PI / 2 + 0.2;
    headband.position.y = 0.035;
    this.head.add(headband);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), skin);
    nose.position.set(0, -0.01, -0.105);
    this.head.add(nose);

    // Arms.
    const buildArm = (sh: THREE.Group, el: THREE.Group, hand: THREE.Group, x: number) => {
      sh.position.set(x, 0.47, 0);
      this.spine.add(sh);
      const sleeve = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), shirt);
      sleeve.scale.set(1, 1.3, 1);
      sleeve.position.y = -0.05;
      sh.add(sleeve);
      sh.add(cap(0.05, 0.2, skin, -0.15));
      el.position.y = -0.3;
      sh.add(el);
      el.add(cap(0.044, 0.18, skin, -0.12));
      const wb = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 12), band);
      wb.position.y = -0.2;
      el.add(wb);
      hand.position.y = -0.27;
      el.add(hand);
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 10), skin);
      h.scale.set(0.8, 1.1, 1);
      hand.add(h);
    };
    buildArm(this.shR, this.elR, this.handR, 0.215);
    buildArm(this.shL, this.elL, this.handL, -0.215);
    for (const s of [this.shR, this.shL, this.elR, this.elL]) s.rotation.order = 'ZXY';

    const racket = makeRacket(outfit.racket);
    racket.rotation.set(-0.25, 0, 0);
    this.handR.add(racket);

    // Legs.
    const buildLeg = (hip: THREE.Group, knee: THREE.Group, x: number) => {
      hip.position.set(x, -0.08, 0);
      this.hips.add(hip);
      const thigh = cap(0.078, 0.28, skin, -0.2);
      hip.add(thigh);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.088, 0.16, 12), shorts);
      leg.position.y = -0.06;
      hip.add(leg);
      knee.position.y = -0.42;
      hip.add(knee);
      knee.add(cap(0.06, 0.28, skin, -0.19));
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.052, 0.14, 12), sock);
      s.position.y = -0.33;
      knee.add(s);
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.27), shoes);
      shoe.position.set(0, -0.43, -0.045);
      knee.add(shoe);
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.025, 0.275), mat('#e8e8e8'));
      sole.position.set(0, -0.47, -0.045);
      knee.add(sole);
    };
    buildLeg(this.hipR, this.kneeR, 0.1);
    buildLeg(this.hipL, this.kneeL, -0.1);

    this.root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    if (facing === -1) this.yaw = Math.PI;
    this.root.rotation.y = this.yaw;
  }

  get pos() {
    return this.root.position;
  }

  /** Lateral unit direction of the player's racket side in world x (+1 or −1). */
  get rightX() {
    return this.facing;
  }

  /** Where this player wants the ball relative to their feet for a given stroke. */
  contactOffset(stroke: Stroke, out = new THREE.Vector3()) {
    const side = stroke === 'bh' ? -0.72 : 0.78;
    return out.set(side * this.rightX, 0, -0.45 * this.facing);
  }

  /** World position of the left hand (holds the ball before a serve). */
  leftHandWorld(out = new THREE.Vector3()) {
    this.root.updateMatrixWorld(true);
    return this.handL.getWorldPosition(out);
  }

  racketWorld(out = new THREE.Vector3()) {
    this.root.updateMatrixWorld(true);
    return this.handR.getWorldPosition(out);
  }

  startSwing(stroke: Stroke, now: number, contact: number) {
    this.swing = { stroke, start: now, contact: Math.max(contact, now + 0.08) };
    this.lastStroke = stroke;
  }

  get swinging() {
    return this.swing !== null;
  }

  update(dt: number, now: number) {
    this.time = now;
    // Locomotion.
    const pos = this.root.position;
    const desired = new THREE.Vector3();
    if (this.target) {
      desired.subVectors(this.target, pos).setY(0);
      const dist = desired.length();
      if (dist > 0.03) {
        const sp = Math.min(this.maxSpeed, Math.sqrt(2 * this.accel * 0.8 * dist));
        desired.multiplyScalar(sp / dist);
      } else desired.set(0, 0, 0);
    }
    const dv = desired.sub(this.vel);
    const maxDv = this.accel * dt;
    if (dv.length() > maxDv) dv.setLength(maxDv);
    this.vel.add(dv);
    pos.addScaledVector(this.vel, dt);
    const speed = this.vel.length();

    // Face the net, turning slightly while running.
    const baseYaw = this.facing === 1 ? 0 : Math.PI;
    const lean = clamp((this.vel.x * this.facing) / this.maxSpeed, -1, 1);
    const targetYaw = baseYaw - lean * 0.25;
    this.yaw += (targetYaw - this.yaw) * Math.min(1, dt * 8);
    this.root.rotation.y = this.yaw;

    // Upper body pose from swing.
    let pose = READY;
    if (this.holdingBall) pose = POSES.serve[0][1];
    if (this.swing) {
      const s = this.swing;
      let phase: number;
      if (now < s.contact) phase = 0.5 * clamp((now - s.start) / (s.contact - s.start), 0, 1);
      else phase = 0.5 + 0.5 * clamp((now - s.contact) / FOLLOW, 0, 1);
      pose = samplePose(s.stroke, phase);
      if (phase >= 1) {
        this.swing = null;
        this.recover = 0;
      }
    } else if (this.recover < 1) {
      this.recover = Math.min(1, this.recover + dt * 3.2);
      const end = POSES[this.lastStroke][POSES[this.lastStroke].length - 1][1];
      pose = blendPose(end, pose, smooth(this.recover));
    }
    if (this.debugPose) pose = samplePose(this.debugPose.stroke, this.debugPose.phase);
    this.applyPose(pose);

    // Legs: ready stance + run cycle.
    const run = clamp(speed / 4, 0, 1);
    this.runPhase += dt * (6 + speed * 1.6);
    const bounce = Math.sin(this.time * 7) * 0.012 * (1 - run);
    const crouch = 0.1 + (this.swing ? 0.05 : 0);
    this.hips.position.y = 0.92 - crouch + bounce + Math.abs(Math.sin(this.runPhase)) * 0.04 * run;
    const sw = Math.sin(this.runPhase) * 0.75 * run;
    this.hipR.rotation.x = 0.35 + sw;
    this.hipL.rotation.x = 0.35 - sw;
    this.kneeR.rotation.x = -0.6 - Math.max(0, Math.sin(this.runPhase + 1.2)) * 0.9 * run;
    this.kneeL.rotation.x = -0.6 - Math.max(0, Math.sin(this.runPhase + 1.2 + Math.PI)) * 0.9 * run;
    this.hipR.rotation.z = 0.08;
    this.hipL.rotation.z = -0.08;
    this.hips.rotation.y = -this.spine.rotation.y * 0.35;
    this.hips.rotation.z = lean * 0.12;
  }

  private applyPose(p: Pose) {
    this.spine.rotation.y = p.spineY;
    this.spine.rotation.x = p.spineX;
    this.head.rotation.y = -p.spineY * 0.6;
    this.shR.rotation.set(p.rS[0], p.rS[1], p.rS[2]);
    this.elR.rotation.x = p.rE;
    this.shL.rotation.set(p.lS[0], p.lS[1], p.lS[2]);
    this.elL.rotation.x = p.lE;
  }
}
