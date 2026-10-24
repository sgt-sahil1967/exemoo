import * as THREE from 'three';
import { BONES, copySkeleton, emptySkeleton, Joint, JOINTS, L, Skeleton } from './skeleton';

const BODY = new THREE.Color('#f4f7ff');
const BAD = new THREE.Color('#ff2a55');
const GOOD = new THREE.Color('#5dffa0');

const BASE_EMISSIVE = new THREE.Color('#2a6bff');

/** Pearly clearcoat body: reads well under the coloured stage lights. */
function bodyMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: BODY, roughness: 0.28, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.12,
    sheen: 0.6, sheenColor: new THREE.Color('#9fe9ff'), emissive: BASE_EMISSIVE, emissiveIntensity: 0.35,
  });
}

/** How much each joint flops during the hit wobble (extremities flop most). */
const FLOP: Partial<Record<Joint, number>> = {
  pelvis: 0.25, neck: 0.6, head: 1, lShoulder: 0.6, rShoulder: 0.6, lElbow: 0.85, rElbow: 0.85,
  lWrist: 1.2, rWrist: 1.2, lHip: 0.25, rHip: 0.25, lKnee: 0.5, rKnee: 0.5,
  lAnkle: 0.55, rAnkle: 0.55, lToe: 0.6, rToe: 0.6,
};

interface Spring { o: THREE.Vector3; v: THREE.Vector3 }

/** Fixed-size 3D stick figure that only changes pose. */
export class Figure {
  readonly group = new THREE.Group();
  private bones: THREE.Mesh[] = [];
  private joints = new Map<Joint, THREE.Mesh>();
  private head: THREE.Group;
  private shadow: THREE.Mesh;
  private springs = new Map<Joint, Spring>();
  private display = emptySkeleton();
  private boneMats: THREE.MeshPhysicalMaterial[] = [];
  private headMat: THREE.MeshPhysicalMaterial;
  private jointMat: THREE.MeshStandardMaterial;
  private wobbleT = 0;
  private tint = 0;

  constructor() {
    const cyl = new THREE.CylinderGeometry(1, 1, 1, 12);
    BONES.forEach(([, , r]) => {
      const mat = bodyMaterial();
      const m = new THREE.Mesh(cyl, mat);
      m.scale.set(r, 1, r);
      m.castShadow = true;
      this.bones.push(m);
      this.boneMats.push(mat);
      this.group.add(m);
    });
    // Glowing joints: emissive above the bloom threshold.
    const jointMat = new THREE.MeshStandardMaterial({ color: '#ff3d8b', roughness: 0.25, emissive: '#ff2a7a', emissiveIntensity: 1.6 });
    this.jointMat = jointMat;
    const ball = new THREE.SphereGeometry(1, 16, 12);
    for (const j of JOINTS) {
      if (j === 'head') continue;
      const big = j === 'pelvis' || j === 'neck';
      const m = new THREE.Mesh(ball, jointMat);
      m.scale.setScalar(big ? 0.085 : j.endsWith('Toe') ? 0.04 : 0.06);
      m.castShadow = true;
      this.joints.set(j, m);
      this.group.add(m);
    }

    // Head with a hachimaki headband (we see the figure from behind, so the knot shows).
    this.head = new THREE.Group();
    this.headMat = bodyMaterial();
    const skull = new THREE.Mesh(new THREE.SphereGeometry(L.headR, 24, 18), this.headMat);
    skull.castShadow = true;
    const bandMat = new THREE.MeshStandardMaterial({ color: '#ff2a55', roughness: 0.5, emissive: '#ff1040', emissiveIntensity: 0.6 });
    const band = new THREE.Mesh(new THREE.TorusGeometry(L.headR * 1.0, 0.022, 8, 32), bandMat);
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.03;
    const tailGeo = new THREE.BoxGeometry(0.035, 0.012, 0.16);
    const tails = [-0.35, 0.35].map((a) => {
      const t = new THREE.Mesh(tailGeo, bandMat);
      t.position.set(Math.sin(a) * 0.05, 0.0, L.headR + 0.07);
      t.rotation.set(-0.5, a, 0);
      return t;
    });
    this.head.add(skull, band, ...tails);
    this.group.add(this.head);

    const sh = new THREE.Mesh(
      new THREE.CircleGeometry(0.42, 32),
      new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.35, depthWrite: false }),
    );
    sh.rotation.x = -Math.PI / 2;
    sh.position.y = 0.012;
    this.shadow = sh;
    this.group.add(sh);

    for (const j of JOINTS) this.springs.set(j, { o: new THREE.Vector3(), v: new THREE.Vector3() });
  }

  /** Brief ragdoll-like wobble after being splatted. */
  hit() {
    this.wobbleT = 1.2;
    this.tint = 1;
    const side = Math.random() < 0.5 ? -1 : 1;
    for (const j of JOINTS) {
      const s = this.springs.get(j)!;
      const k = FLOP[j] ?? 0.5;
      s.v.set(side * (0.6 + Math.random()) * k, (Math.random() - 0.2) * 1.2 * k, 3.2 * k);
    }
  }

  /**
   * @param skel  pose to show
   * @param fit   optional per-bone fit (1 = inside hole) to colour limbs while a wall is close
   */
  update(skel: Skeleton, dt: number, fit?: { bones: Float32Array; head: number; weight: number }) {
    // Springs: o'' = -k o - c o'
    for (const j of JOINTS) {
      const s = this.springs.get(j)!;
      s.v.addScaledVector(s.o, -70 * dt).multiplyScalar(Math.exp(-5 * dt));
      s.o.addScaledVector(s.v, dt);
    }
    this.wobbleT = Math.max(0, this.wobbleT - dt);
    this.tint = Math.max(0, this.tint - dt * 1.4);
    this.jointMat.emissiveIntensity = 1.6 + this.tint * 3;
    copySkeleton(skel, this.display);
    for (const j of JOINTS) this.display[j].add(this.springs.get(j)!.o);

    const up = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3();
    BONES.forEach(([a, b], i) => {
      const pa = this.display[a], pb = this.display[b];
      const m = this.bones[i];
      dir.subVectors(pb, pa);
      const len = dir.length();
      m.position.addVectors(pa, pb).multiplyScalar(0.5);
      m.scale.y = Math.max(len, 1e-3);
      if (len > 1e-5) m.quaternion.setFromUnitVectors(up, dir.divideScalar(len));
      this.colour(this.boneMats[i], fit ? fit.bones[i] : 1, fit?.weight ?? 0);
    });
    for (const [j, m] of this.joints) m.position.copy(this.display[j]);
    this.head.position.copy(this.display.head);
    const spine = dir.subVectors(this.display.head, this.display.neck).normalize();
    this.head.quaternion.setFromUnitVectors(up, spine);
    this.colour(this.headMat, fit ? fit.head : 1, fit?.weight ?? 0);

    const h = Math.max(0, Math.min(this.display.lAnkle.y, this.display.rAnkle.y) - L.ankleH);
    this.shadow.position.x = this.display.pelvis.x;
    this.shadow.scale.setScalar(1 / (1 + h * 2.5));
    (this.shadow.material as THREE.MeshBasicMaterial).opacity = 0.35 / (1 + h * 3);
  }

  private colour(mat: THREE.MeshPhysicalMaterial, inside: number, weight: number) {
    const c = mat.color.copy(BODY);
    const e = mat.emissive.copy(BASE_EMISSIVE);
    let glow = 0.35;
    if (weight > 0) {
      const target = inside > 0.5 ? GOOD : BAD;
      const k = weight * (inside > 0.5 ? 0.35 : 0.9);
      c.lerp(target, k);
      e.lerp(target, k);
      glow += k * 0.9;
    }
    if (this.tint > 0) {
      c.lerp(BAD, this.tint * 0.8);
      e.lerp(BAD, this.tint);
      glow += this.tint;
    }
    mat.emissiveIntensity = glow;
  }
}
