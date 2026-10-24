/** Aim helpers: dashed line draped on the ground toward a pulsing landing ring; thin dashes for putts. */
import {
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  ShaderMaterial,
  Vector3,
} from 'three';

const RING_R = 4.5;

export class AimView {
  readonly group = new Group();
  private heightAt: (x: number, z: number) => number = () => 0;
  private ring: Mesh | null = null;
  private line: Mesh | null = null;
  private t = 0;
  private ringMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
    uniforms: { uTime: { value: 0 }, uR: { value: RING_R } },
    vertexShader: `varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform float uTime; uniform float uR; varying vec2 vP;
      void main(){
        float d = length(vP);
        float ring = smoothstep(0.26, 0.0, abs(d - uR));
        float inner = smoothstep(0.12, 0.0, abs(d - uR * 0.12)) + step(d, uR * 0.06);
        float k = fract(uTime * 0.7);
        float pulse = smoothstep(0.3, 0.0, abs(d - uR * k)) * (1.0 - k);
        float fill = step(d, uR) * 0.12;
        vec3 col = mix(vec3(1.0), vec3(1.0, 0.85, 0.25), pulse);
        float a = max(max(ring * 0.95, inner * 0.9), max(pulse * 0.8, fill));
        if (a < 0.01) discard;
        gl_FragColor = vec4(col, a);
        #include <colorspace_fragment>
      }`,
  });
  private lineMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
    uniforms: { uTime: { value: 0 }, uLen: { value: 1 }, uPeriod: { value: 0.4 }, uStart: { value: 0.3 } },
    vertexShader: `attribute float along; varying float vL; void main(){ vL = along; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform float uTime; uniform float uLen; uniform float uPeriod; uniform float uStart; varying float vL;
      void main(){
        float dash = step(fract(vL / uPeriod - uTime * 1.2), 0.5);
        float a = dash * smoothstep(0.0, uStart, vL) * smoothstep(uLen, uLen - uPeriod * 1.5, vL);
        if (a < 0.01) discard;
        gl_FragColor = vec4(1.0, 1.0, 1.0, a * 0.9);
      }`,
  });

  setHeightFn(fn: (x: number, z: number) => number) {
    this.heightAt = fn;
  }

  private clear() {
    for (const o of [this.ring, this.line]) {
      if (o) {
        this.group.remove(o);
        o.geometry.dispose();
      }
    }
    this.ring = this.line = null;
  }

  set(from: Vector3 | null, landing?: Vector3, putt?: boolean) {
    this.clear();
    if (!from || !landing) return;
    if (putt) this.buildLine(from, landing, true);
    else {
      this.buildLine(from, landing, false);
      this.buildRing(landing);
    }
  }

  private buildRing(c: Vector3) {
    const R = RING_R + 0.6;
    const n = 28;
    const pos = new Float32Array((n + 1) * (n + 1) * 3);
    const idx: number[] = [];
    for (let j = 0; j <= n; j++) {
      for (let i = 0; i <= n; i++) {
        const x = -R + (2 * R * i) / n;
        const z = -R + (2 * R * j) / n;
        const k = (j * (n + 1) + i) * 3;
        pos[k] = x;
        pos[k + 1] = this.heightAt(c.x + x, c.z + z) + 0.07;
        pos[k + 2] = z;
        if (i < n && j < n) {
          const a = j * (n + 1) + i;
          idx.push(a, a + n + 1, a + 1, a + 1, a + n + 1, a + n + 2);
        }
      }
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setIndex(idx);
    this.ring = new Mesh(g, this.ringMat);
    this.ring.position.set(c.x, 0, c.z);
    this.ring.renderOrder = 4;
    this.group.add(this.ring);
  }

  private buildLine(a: Vector3, b: Vector3, putt: boolean) {
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.05) return;
    const ux = dx / len;
    const uz = dz / len;
    const end = putt ? len : Math.max(0.5, len - RING_R * 0.9);
    const n = Math.max(2, Math.ceil(end / (putt ? 0.2 : 0.6)));
    const pos = new Float32Array((n + 1) * 2 * 3);
    const along = new Float32Array((n + 1) * 2);
    const idx: number[] = [];
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * end;
      const w = putt ? 0.045 : 0.05 + 0.22 * (t / end);
      const x = a.x + ux * t;
      const z = a.z + uz * t;
      for (const s of [-1, 1]) {
        const px = x - uz * w * s;
        const pz = z + ux * w * s;
        const k = i * 2 + (s > 0 ? 1 : 0);
        pos[k * 3] = px;
        pos[k * 3 + 1] = this.heightAt(px, pz) + (putt ? 0.02 : 0.06);
        pos[k * 3 + 2] = pz;
        along[k] = t;
      }
      if (i < n) {
        const q = i * 2;
        idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2);
      }
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('along', new BufferAttribute(along, 1));
    g.setIndex(idx);
    this.lineMat.uniforms.uLen.value = end;
    this.lineMat.uniforms.uPeriod.value = putt ? 0.4 : 2.2;
    this.lineMat.uniforms.uStart.value = putt ? 0.3 : 2.5;
    this.line = new Mesh(g, this.lineMat);
    this.line.renderOrder = 4;
    this.group.add(this.line);
  }

  update(dt: number) {
    this.t += dt;
    this.ringMat.uniforms.uTime.value = this.t;
    this.lineMat.uniforms.uTime.value = this.t;
  }

  dispose() {
    this.clear();
    this.ringMat.dispose();
    this.lineMat.dispose();
  }
}
