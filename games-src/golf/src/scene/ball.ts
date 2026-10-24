/** Golf ball, its contact shadow, flight trail ribbon and a screen-stable finder arrow. */
import {
  BufferAttribute,
  BufferGeometry,
  Camera,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three';
import { BALL } from '../core/contracts';
import { arrowTexture, radialTexture } from './textures';
import { clamp } from './util';

const VIS_SCALE = 1.6;
const TRAIL_N = 90;

export class BallView {
  readonly group = new Group();
  private ball: Mesh;
  private shadow: Mesh;
  private marker: Sprite;
  private trail: Mesh;
  private trailGeo: BufferGeometry;
  private trailMat: ShaderMaterial;
  private pts: Vector3[] = [];
  private trailAlpha = 0;
  private flying = false;
  private visible = true;
  readonly pos = new Vector3();
  private t = 0;
  private heightAt: (x: number, z: number) => number = () => 0;

  constructor() {
    const r = BALL.radius * VIS_SCALE;
    this.ball = new Mesh(new SphereGeometry(r, 20, 14), new MeshStandardMaterial({ color: '#ffffff', roughness: 0.32, emissive: '#3a3a3a' }));
    this.ball.castShadow = true;
    this.shadow = new Mesh(
      new PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new MeshBasicMaterial({ map: radialTexture(0.15), color: '#000000', transparent: true, opacity: 0.45, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }),
    );
    this.marker = new Sprite(new SpriteMaterial({ map: arrowTexture(), depthTest: false, depthWrite: false, sizeAttenuation: false, transparent: true }));
    this.marker.center.set(0.5, 0);
    this.marker.scale.set(0.032, 0.04, 1);
    this.marker.renderOrder = 999;

    this.trailGeo = new BufferGeometry();
    this.trailGeo.setAttribute('position', new BufferAttribute(new Float32Array(TRAIL_N * 2 * 3), 3));
    this.trailGeo.setAttribute('aAlpha', new BufferAttribute(new Float32Array(TRAIL_N * 2), 1));
    const idx: number[] = [];
    for (let i = 0; i < TRAIL_N - 1; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    this.trailGeo.setIndex(idx);
    this.trailMat = new ShaderMaterial({
      side: DoubleSide,
      transparent: true,
      depthWrite: false,
      uniforms: { uAlpha: { value: 1 } },
      vertexShader: `attribute float aAlpha; varying float vA;
        void main(){ vA = aAlpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform float uAlpha; varying float vA;
        void main(){ gl_FragColor = vec4(1.0, 1.0, 1.0, vA * uAlpha * 0.85); }`,
    });
    this.trail = new Mesh(this.trailGeo, this.trailMat);
    this.trail.frustumCulled = false;
    this.trail.renderOrder = 5;
    this.group.add(this.ball, this.shadow, this.marker, this.trail);
  }

  setHeightFn(fn: (x: number, z: number) => number) {
    this.heightAt = fn;
  }

  set(pos: Vector3, visible = true) {
    this.pos.copy(pos);
    this.visible = visible;
    if (this.flying) {
      const last = this.pts[this.pts.length - 1];
      if (!last || last.distanceToSquared(pos) > 0.09) {
        this.pts.push(pos.clone());
        if (this.pts.length > TRAIL_N) this.pts.shift();
      }
    }
  }

  setFlying(on: boolean) {
    if (on && !this.flying) {
      this.pts = [this.pos.clone()];
      this.trailAlpha = 1;
    }
    this.flying = on;
  }

  update(dt: number, camera: Camera) {
    this.t += dt;
    const r = BALL.radius * VIS_SCALE;
    this.ball.visible = this.visible;
    const camDist = camera.position.distanceTo(this.pos);
    // keep a minimum apparent size so the ball never vanishes into a sub-pixel dot
    const grow = Math.max(1, (camDist * 0.0022) / r);
    this.ball.scale.setScalar(grow);
    this.ball.position.copy(this.pos);
    this.ball.position.y += r * grow; // pos is the ground-contact point
    const gy = this.heightAt(this.pos.x, this.pos.z);
    const h = Math.max(0, this.pos.y - gy);
    this.shadow.visible = this.visible;
    this.shadow.position.set(this.pos.x, gy + 0.01, this.pos.z);
    const s = r * 3.2 * (1 + h * 0.03);
    this.shadow.scale.set(s, 1, s);
    (this.shadow.material as MeshBasicMaterial).opacity = 0.45 * clamp(1 - h / 40, 0.15, 1);

    const camPos = camera.position;
    const dist = camPos.distanceTo(this.pos);
    this.marker.visible = this.visible && dist > 22;
    if (this.marker.visible) {
      this.marker.position.copy(this.pos);
      this.marker.position.y += dist * (0.012 + 0.004 * Math.sin(this.t * 5));
      (this.marker.material as SpriteMaterial).opacity = clamp((dist - 22) / 10, 0, 1);
    }

    if (!this.flying) this.trailAlpha = Math.max(0, this.trailAlpha - dt * 0.6);
    this.trailMat.uniforms.uAlpha.value = this.trailAlpha;
    this.trail.visible = this.trailAlpha > 0 && this.pts.length > 1;
    if (this.trail.visible) this.buildTrail(camPos);
  }

  private buildTrail(camPos: Vector3) {
    const pos = this.trailGeo.getAttribute('position') as BufferAttribute;
    const al = this.trailGeo.getAttribute('aAlpha') as BufferAttribute;
    const n = this.pts.length;
    const side = new Vector3();
    const tan = new Vector3();
    const toCam = new Vector3();
    for (let i = 0; i < TRAIL_N; i++) {
      const k = Math.min(i, n - 1);
      const p = this.pts[k];
      const q = this.pts[Math.min(k + 1, n - 1)];
      const o = this.pts[Math.max(k - 1, 0)];
      tan.subVectors(q, o);
      if (tan.lengthSq() < 1e-8) tan.set(0, 0, 1);
      toCam.subVectors(camPos, p);
      const d = toCam.length();
      side.crossVectors(tan, toCam).normalize();
      const f = n > 1 ? k / (n - 1) : 1;
      const w = Math.max(0.07, d * 0.0055) * (0.25 + 0.75 * f);
      pos.setXYZ(i * 2, p.x + side.x * w, p.y + side.y * w, p.z + side.z * w);
      pos.setXYZ(i * 2 + 1, p.x - side.x * w, p.y - side.y * w, p.z - side.z * w);
      const a = i < n ? f * f : 0;
      al.setX(i * 2, a);
      al.setX(i * 2 + 1, a);
    }
    pos.needsUpdate = true;
    al.needsUpdate = true;
  }

  dispose() {
    this.ball.geometry.dispose();
    (this.ball.material as MeshStandardMaterial).dispose();
    this.shadow.geometry.dispose();
    (this.shadow.material as MeshBasicMaterial).dispose();
    (this.marker.material as SpriteMaterial).dispose();
    this.trailGeo.dispose();
    this.trailMat.dispose();
  }
}
