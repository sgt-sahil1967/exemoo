import * as THREE from 'three';

const MAX = 600;

/** Confetti / foam chunks / water droplets, all from one instanced mesh. */
export class Particles {
  readonly mesh: THREE.InstancedMesh;
  private pos = new Float32Array(MAX * 3);
  private vel = new Float32Array(MAX * 3);
  private rot = new Float32Array(MAX * 3);
  private life = new Float32Array(MAX);
  private size = new Float32Array(MAX);
  private next = 0;
  private m = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private e = new THREE.Euler();
  private v = new THREE.Vector3();
  private s = new THREE.Vector3();

  constructor() {
    this.mesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 0.25),
      new THREE.MeshBasicMaterial({ color: '#ffffff' }),
      MAX,
    );
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 3), 3);
    this.mesh.frustumCulled = false;
    this.m.makeScale(0, 0, 0);
    for (let i = 0; i < MAX; i++) this.mesh.setMatrixAt(i, this.m);
  }

  burst(origin: THREE.Vector3, count: number, colors: string[], speed: number, up: number, size = 0.06) {
    const c = new THREE.Color();
    for (let k = 0; k < count; k++) {
      const i = this.next;
      this.next = (this.next + 1) % MAX;
      this.pos.set([origin.x + (Math.random() - 0.5) * 0.6, origin.y + (Math.random() - 0.5) * 0.8, origin.z], i * 3);
      const a = Math.random() * Math.PI * 2;
      this.vel.set([Math.cos(a) * speed * Math.random(), up * (0.5 + Math.random()), Math.sin(a) * speed * Math.random() + 1.2], i * 3);
      this.rot.set([Math.random() * 6, Math.random() * 6, Math.random() * 6], i * 3);
      this.life[i] = 1.2 + Math.random() * 0.8;
      this.size[i] = size * (0.6 + Math.random() * 0.8);
      // HDR colours (>1) so the bloom pass makes confetti sparkle.
      this.mesh.setColorAt(i, c.set(colors[k % colors.length]).multiplyScalar(1.4 + Math.random() * 1.2));
    }
    this.mesh.instanceColor!.needsUpdate = true;
  }

  update(dt: number) {
    for (let i = 0; i < MAX; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt;
      const j = i * 3;
      this.vel[j + 1] -= 9 * dt;
      for (let k = 0; k < 3; k++) {
        this.vel[j + k] *= Math.exp(-0.8 * dt);
        this.pos[j + k] += this.vel[j + k] * dt;
      }
      const sz = this.life[i] > 0 ? this.size[i] * Math.min(1, this.life[i] * 2) : 0;
      this.e.set(this.rot[j] + this.life[i] * 7, this.rot[j + 1] + this.life[i] * 5, this.rot[j + 2]);
      this.m.compose(this.v.set(this.pos[j], this.pos[j + 1], this.pos[j + 2]), this.q.setFromEuler(this.e), this.s.setScalar(sz));
      this.mesh.setMatrixAt(i, this.m);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
