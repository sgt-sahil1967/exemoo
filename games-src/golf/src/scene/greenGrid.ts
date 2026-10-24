/** Wii-style putting grid: draped line grid tinted by height + dots flowing downhill. */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  Points,
  ShaderMaterial,
  Vector3,
} from 'three';
import type { Hole } from '../core/contracts';
import { dotTexture } from './textures';
import { mulberry32 } from './util';

const CELL = 1.0;
const RES = 0.5;
const N_DOTS = 260;

export class GreenGrid {
  readonly group = new Group();
  private hole: Hole | null = null;
  private mesh: Mesh | null = null;
  private dots: Points | null = null;
  private dotData: { x: number; z: number; life: number; max: number }[] = [];
  private on = false;
  private fade = 0;
  private rnd = mulberry32(5);
  private gridMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
    uniforms: { uCell: { value: CELL }, uAlpha: { value: 0 }, uTime: { value: 0 } },
    vertexShader: `attribute float mask; attribute float hn; varying float vM; varying float vH; varying vec2 vP;
      void main(){ vM = mask; vH = hn; vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform float uCell; uniform float uAlpha; varying float vM; varying float vH; varying vec2 vP;
      void main(){
        vec2 g = abs(fract(vP / uCell - 0.5) - 0.5) / fwidth(vP / uCell);
        float line = 1.0 - min(min(g.x, g.y), 1.0);
        vec3 low = vec3(0.25, 0.55, 1.0);
        vec3 high = vec3(1.0, 0.95, 0.55);
        vec3 tint = mix(low, high, clamp(vH, 0.0, 1.0));
        float a = (line * 0.75 + 0.16) * smoothstep(0.35, 0.8, vM) * uAlpha;
        if (a < 0.01) discard;
        gl_FragColor = vec4(mix(tint, vec3(1.0), line * 0.6), a);
        #include <colorspace_fragment>
      }`,
  });
  private dotMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { uMap: { value: dotTexture() }, uAlpha: { value: 0 }, uSize: { value: 7 } },
    vertexShader: `attribute float a; varying float vA; uniform float uSize;
      void main(){ vA = a; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = uSize * clamp(12.0 / -mv.z, 0.5, 1.6); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D uMap; uniform float uAlpha; varying float vA;
      void main(){ vec4 c = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(vec3(1.0, 0.98, 0.7) * c.rgb, c.a * vA * uAlpha); }`,
  });

  setPixelRatio(dpr: number) {
    this.dotMat.uniforms.uSize.value = 7 * dpr;
  }

  setHole(hole: Hole | null) {
    this.clear();
    this.hole = hole;
    this.on = false;
    this.fade = 0;
  }

  private clear() {
    for (const o of [this.mesh, this.dots]) {
      if (o) {
        this.group.remove(o);
        o.geometry.dispose();
      }
    }
    this.mesh = null;
    this.dots = null;
  }

  private build() {
    const h = this.hole!;
    const c = h.greenCenter;
    const R = h.greenRadius * 1.5 + 3;
    const n = Math.ceil((2 * R) / RES);
    const pos = new Float32Array((n + 1) * (n + 1) * 3);
    const mask = new Float32Array((n + 1) * (n + 1));
    const hn = new Float32Array((n + 1) * (n + 1));
    const idx: number[] = [];
    let lo = Infinity;
    let hi = -Infinity;
    for (let j = 0; j <= n; j++) {
      for (let i = 0; i <= n; i++) {
        const x = c.x - R + i * RES;
        const z = c.z - R + j * RES;
        const k = j * (n + 1) + i;
        const y = h.heightAt(x, z);
        pos[k * 3] = x;
        pos[k * 3 + 1] = y + 0.025;
        pos[k * 3 + 2] = z;
        const s = h.surfaceAt(x, z);
        mask[k] = s === 'green' || s === 'fringe' ? 1 : 0;
        if (mask[k]) {
          lo = Math.min(lo, y);
          hi = Math.max(hi, y);
        }
        if (i < n && j < n) idx.push(k, k + n + 1, k + 1, k + 1, k + n + 1, k + n + 2);
      }
    }
    for (let k = 0; k < hn.length; k++) hn[k] = (pos[k * 3 + 1] - lo) / Math.max(0.2, hi - lo);
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('mask', new BufferAttribute(mask, 1));
    g.setAttribute('hn', new BufferAttribute(hn, 1));
    g.setIndex(idx);
    this.mesh = new Mesh(g, this.gridMat);
    this.mesh.renderOrder = 3;
    this.group.add(this.mesh);

    const dg = new BufferGeometry();
    dg.setAttribute('position', new BufferAttribute(new Float32Array(N_DOTS * 3), 3));
    dg.setAttribute('a', new BufferAttribute(new Float32Array(N_DOTS), 1));
    this.dots = new Points(dg, this.dotMat);
    this.dots.frustumCulled = false;
    this.dots.renderOrder = 4;
    this.group.add(this.dots);
    this.dotData = [];
    for (let i = 0; i < N_DOTS; i++) {
      const d = { x: 0, z: 0, life: 0, max: 1 };
      this.spawn(d);
      d.life = this.rnd() * d.max;
      this.dotData.push(d);
    }
  }

  private spawn(d: { x: number; z: number; life: number; max: number }) {
    const h = this.hole!;
    for (let i = 0; i < 12; i++) {
      const a = this.rnd() * Math.PI * 2;
      const r = Math.sqrt(this.rnd()) * h.greenRadius * 1.3;
      d.x = h.greenCenter.x + Math.cos(a) * r;
      d.z = h.greenCenter.z + Math.sin(a) * r;
      if (h.surfaceAt(d.x, d.z) === 'green') break;
    }
    d.life = 0;
    d.max = 1.6 + this.rnd() * 1.6;
  }

  set(on: boolean) {
    this.on = on;
    if (on && !this.mesh && this.hole) this.build();
  }

  update(dt: number, t: number) {
    this.fade = Math.max(0, Math.min(1, this.fade + (this.on ? dt * 3 : -dt * 4)));
    this.group.visible = this.fade > 0;
    if (!this.group.visible || !this.mesh || !this.dots || !this.hole) return;
    this.gridMat.uniforms.uAlpha.value = this.fade;
    this.gridMat.uniforms.uTime.value = t;
    this.dotMat.uniforms.uAlpha.value = this.fade;
    const h = this.hole;
    const pos = this.dots.geometry.getAttribute('position') as BufferAttribute;
    const al = this.dots.geometry.getAttribute('a') as BufferAttribute;
    const n = new Vector3();
    this.dotData.forEach((d, i) => {
      h.normalAt(d.x, d.z, n);
      const slope = Math.hypot(n.x, n.z);
      const sp = 0.25 + slope * 40;
      if (slope > 1e-4) {
        d.x += (n.x / slope) * sp * dt;
        d.z += (n.z / slope) * sp * dt;
      }
      d.life += dt;
      const s = h.surfaceAt(d.x, d.z);
      if (d.life > d.max || (s !== 'green' && s !== 'fringe')) this.spawn(d);
      const f = d.life / d.max;
      pos.setXYZ(i, d.x, h.heightAt(d.x, d.z) + 0.05, d.z);
      al.setX(i, Math.min(1, f * 4) * Math.min(1, (1 - f) * 3) * Math.min(1, 0.4 + slope * 25));
    });
    pos.needsUpdate = true;
    al.needsUpdate = true;
  }

  dispose() {
    this.clear();
    this.gridMat.dispose();
    this.dotMat.dispose();
  }
}
