// Ball trail: a tapering ribbon through the ball's recent positions (the last ~0.35 s), turned to face the
// camera each frame, fading out toward the tail. Colour shows what kind of ball or hit it is.
import * as THREE from 'three';

export const TRAIL_COLOURS = {
  delivery: ['#ffffff', 0.5],
  PERFECT: ['#ffd21f', 0.95], GOOD: ['#ffffff', 0.8], EARLY: ['#cfd6e4', 0.6], LATE: ['#cfd6e4', 0.6], EDGED: ['#ff9a3c', 0.75],
};

export class BallTrail {
  constructor(scene, { max = 40, keep = 0.35, width = 0.075 } = {}) {
    this.max = max;
    this.keep = keep;
    this.width = width;
    this.pts = []; // newest first: {p, t}
    this.colour = new THREE.Color('#ffffff');
    this.alpha = 0.5;
    this.pos = new Float32Array(max * 2 * 3);
    this.col = new Float32Array(max * 2 * 4);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    const idx = [];
    for (let i = 0; i < max - 1; i++) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
    g.setIndex(idx);
    this.mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 5;
    scene.add(this.mesh);
    this.tmp = { d: new THREE.Vector3(), v: new THREE.Vector3(), s: new THREE.Vector3() };
  }

  /** Trail style: a key of TRAIL_COLOURS. */
  style(kind) {
    const [c, a] = TRAIL_COLOURS[kind] ?? TRAIL_COLOURS.delivery;
    this.colour.set(c);
    this.alpha = a;
  }

  /** Add the ball's position at time t (s). Points older than `keep` drop off. */
  push(p, t) {
    const last = this.pts[0];
    if (last && last.p.distanceToSquared(p) < 1e-6) return;
    this.pts.unshift({ p: p.clone(), t });
    while (this.pts.length > this.max || (this.pts.length && t - this.pts.at(-1).t > this.keep)) this.pts.pop();
  }

  /** No new points (ball held, stopped or gone): let the tail run out. */
  fade(t) {
    while (this.pts.length && t - this.pts.at(-1).t > this.keep * 0.5) this.pts.pop();
    if (this.pts.length) this.pts.pop();
  }

  reset() {
    this.pts.length = 0;
  }

  /** Rebuild the ribbon for this camera (call once a frame, before rendering). */
  update(camera) {
    const n = this.pts.length;
    if (n < 2) {
      this.mesh.geometry.setDrawRange(0, 0);
      return;
    }
    const { d, v, s } = this.tmp;
    const c = this.colour;
    for (let i = 0; i < n; i++) {
      const p = this.pts[i].p;
      const a = this.pts[Math.max(0, i - 1)].p, b = this.pts[Math.min(n - 1, i + 1)].p;
      d.subVectors(a, b);
      if (d.lengthSq() < 1e-9) d.set(0, 1, 0);
      v.subVectors(camera.position, p);
      s.crossVectors(d, v).normalize();
      const k = i / (n - 1); // 0 at the ball, 1 at the tail
      s.multiplyScalar(this.width * (1 - k * 0.85));
      this.pos.set([p.x + s.x, p.y + s.y, p.z + s.z, p.x - s.x, p.y - s.y, p.z - s.z], i * 6);
      const al = this.alpha * Math.pow(1 - k, 1.6);
      this.col.set([c.r, c.g, c.b, al, c.r, c.g, c.b, al], i * 8);
    }
    const g = this.mesh.geometry;
    g.attributes.position.needsUpdate = true;
    g.attributes.color.needsUpdate = true;
    g.setDrawRange(0, (n - 1) * 6);
  }
}
