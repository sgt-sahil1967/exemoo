import * as THREE from 'three';
import { makePuff, makeSoftDot } from './textures';

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _p = new THREE.Vector3();
const _v = new THREE.Vector3();
const _c = new THREE.Color();
const _up = new THREE.Vector3(0, 1, 0);

/** Pooled additive streak particles (sparks). Fades by colour since blending is additive. */
class SparkPool {
  readonly mesh: THREE.InstancedMesh;
  private geo: THREE.BufferGeometry;
  private mat: THREE.MeshBasicMaterial;
  private max: number;
  private px: Float32Array; private pv: Float32Array;
  private life: Float32Array; private maxLife: Float32Array; private size: Float32Array;
  private r: Float32Array; private g: Float32Array; private b: Float32Array;
  private live = 0;
  gravity = 6;
  drag = 1.8;

  constructor(max: number) {
    this.max = max;
    this.px = new Float32Array(max * 3); this.pv = new Float32Array(max * 3);
    this.life = new Float32Array(max); this.maxLife = new Float32Array(max); this.size = new Float32Array(max);
    this.r = new Float32Array(max); this.g = new Float32Array(max); this.b = new Float32Array(max);
    this.geo = new THREE.OctahedronGeometry(1, 0);
    this.mat = new THREE.MeshBasicMaterial({
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false,
    });
    this.mesh = new THREE.InstancedMesh(this.geo, this.mat, max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.setColorAt(0, _c.set(0xffffff));
    this.mesh.instanceColor!.setUsage(THREE.DynamicDrawUsage);
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 6;
  }

  spawn(x: number, y: number, z: number, vx: number, vy: number, vz: number, size: number, life: number, color: number, intensity = 1.6): void {
    if (this.live >= this.max) return;
    const i = this.live++;
    const k = i * 3;
    this.px[k] = x; this.px[k + 1] = y; this.px[k + 2] = z;
    this.pv[k] = vx; this.pv[k + 1] = vy; this.pv[k + 2] = vz;
    this.life[i] = 0; this.maxLife[i] = life; this.size[i] = size;
    _c.setHex(color);
    this.r[i] = _c.r * intensity; this.g[i] = _c.g * intensity; this.b[i] = _c.b * intensity;
  }

  update(dt: number): void {
    const px = this.px, pv = this.pv;
    const dr = Math.exp(-this.drag * dt);
    let i = 0;
    while (i < this.live) {
      const k = i * 3;
      this.life[i] += dt;
      if (this.life[i] >= this.maxLife[i]) {
        const j = --this.live;
        if (i !== j) {
          const kj = j * 3;
          px[k] = px[kj]; px[k + 1] = px[kj + 1]; px[k + 2] = px[kj + 2];
          pv[k] = pv[kj]; pv[k + 1] = pv[kj + 1]; pv[k + 2] = pv[kj + 2];
          this.life[i] = this.life[j]; this.maxLife[i] = this.maxLife[j]; this.size[i] = this.size[j];
          this.r[i] = this.r[j]; this.g[i] = this.g[j]; this.b[i] = this.b[j];
        }
        continue;
      }
      pv[k] *= dr; pv[k + 2] *= dr;
      pv[k + 1] = pv[k + 1] * dr - this.gravity * dt;
      px[k] += pv[k] * dt; px[k + 1] += pv[k + 1] * dt; px[k + 2] += pv[k + 2] * dt;
      _v.set(pv[k], pv[k + 1], pv[k + 2]);
      const sp = _v.length();
      if (sp > 1e-4) _q.setFromUnitVectors(_up, _v.multiplyScalar(1 / sp)); else _q.identity();
      const t = this.life[i] / this.maxLife[i];
      const f = (1 - t) * (1 - t);
      const sz = this.size[i] * (0.4 + 0.6 * (1 - t));
      _s.set(sz, sz * (1.5 + Math.min(sp * 0.45, 7)), sz);
      _p.set(px[k], px[k + 1], px[k + 2]);
      _m.compose(_p, _q, _s);
      this.mesh.setMatrixAt(i, _m);
      // cool from white-yellow toward deep orange as it dies
      _c.setRGB(this.r[i] * f, this.g[i] * f * (1 - t * 0.5), this.b[i] * f * (1 - t));
      this.mesh.setColorAt(i, _c);
      i++;
    }
    this.mesh.count = this.live;
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.instanceColor!.needsUpdate = true;
  }

  clear(): void { this.live = 0; this.mesh.count = 0; }
  dispose(): void { this.mesh.dispose(); this.geo.dispose(); this.mat.dispose(); }
}

interface Smoke { sprite: THREE.Sprite; mat: THREE.SpriteMaterial; vx: number; vy: number; vz: number; age: number; life: number; size: number; spin: number; active: boolean }
interface Blast { flash: THREE.Mesh; flashMat: THREE.MeshBasicMaterial; glow: THREE.Sprite; glowMat: THREE.SpriteMaterial; ring: THREE.Mesh; ringMat: THREE.MeshBasicMaterial; age: number; active: boolean }

const MAX_BLASTS = 3;
const MAX_SMOKE = 48;

/** Bomb blast: flash sphere, glow, light pulse, shockwave ring, smoke puffs and sparks. */
export class ExplosionFX {
  readonly group = new THREE.Group();
  private sparks = new SparkPool(600);
  private smoke: Smoke[] = [];
  private blasts: Blast[] = [];
  private light: THREE.PointLight;
  private lightT = 1;
  private scene: THREE.Scene;
  private sphereGeo: THREE.SphereGeometry;
  private ringGeo: THREE.RingGeometry;
  private puffTex: THREE.CanvasTexture;
  private dotTex: THREE.CanvasTexture;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group.name = 'ExplosionFX';
    scene.add(this.group);
    this.group.add(this.sparks.mesh);
    this.sparks.gravity = 5;
    this.sparks.drag = 2.2;
    // always present so toggling intensity never recompiles shaders
    this.light = new THREE.PointLight(0xffa860, 0, 14, 1.6);
    this.group.add(this.light);

    this.sphereGeo = new THREE.SphereGeometry(1, 24, 16);
    this.ringGeo = new THREE.RingGeometry(0.82, 1, 64);
    this.puffTex = new THREE.CanvasTexture(makePuff(128, 11));
    this.dotTex = new THREE.CanvasTexture(makeSoftDot(128));
    for (let i = 0; i < MAX_BLASTS; i++) {
      const flashMat = new THREE.MeshBasicMaterial({ color: 0xfff1d0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
      const flash = new THREE.Mesh(this.sphereGeo, flashMat);
      const glowMat = new THREE.SpriteMaterial({ map: this.dotTex, color: 0xff9a40, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
      const glow = new THREE.Sprite(glowMat);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
      const ring = new THREE.Mesh(this.ringGeo, ringMat);
      flash.visible = glow.visible = ring.visible = false;
      flash.renderOrder = glow.renderOrder = ring.renderOrder = 7;
      this.group.add(flash, glow, ring);
      this.blasts.push({ flash, flashMat, glow, glowMat, ring, ringMat, age: 0, active: false });
    }
    for (let i = 0; i < MAX_SMOKE; i++) {
      const mat = new THREE.SpriteMaterial({ map: this.puffTex, color: 0x3a2e28, transparent: true, depthWrite: false, opacity: 0 });
      const sprite = new THREE.Sprite(mat);
      sprite.visible = false;
      sprite.renderOrder = 4;
      this.group.add(sprite);
      this.smoke.push({ sprite, mat, vx: 0, vy: 0, vz: 0, age: 0, life: 1, size: 1, spin: 0, active: false });
    }
  }

  explode(pos: THREE.Vector3): void {
    let b = this.blasts.find((q) => !q.active);
    if (!b) b = this.blasts[0];
    b.active = true;
    b.age = 0;
    b.flash.position.copy(pos);
    b.glow.position.copy(pos);
    b.ring.position.copy(pos);
    b.ring.rotation.set(0, 0, Math.random() * Math.PI);
    b.flash.visible = b.glow.visible = b.ring.visible = true;
    this.light.position.copy(pos);
    this.light.position.z += 0.6;
    this.lightT = 0;

    for (let i = 0; i < 140; i++) {
      // uniform sphere directions, biased up a little
      const u = Math.random() * 2 - 1;
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      const sp = 4 + Math.random() * 9;
      const hot = Math.random() < 0.5;
      this.sparks.spawn(pos.x, pos.y, pos.z,
        Math.cos(a) * r * sp, u * sp + 1.5, Math.sin(a) * r * sp * 0.7 + 1,
        0.012 + Math.random() * 0.02, 0.45 + Math.random() * 0.7, hot ? 0xfff0b0 : 0xff9a3a, hot ? 3 : 2.2);
    }
    let n = 0;
    for (const s of this.smoke) {
      if (s.active) continue;
      if (n++ >= 16) break;
      const a = Math.random() * Math.PI * 2;
      const sp = 0.6 + Math.random() * 2.2;
      s.active = true;
      s.age = 0;
      s.life = 1.1 + Math.random() * 0.9;
      s.size = 0.9 + Math.random() * 1.1;
      s.vx = Math.cos(a) * sp; s.vy = Math.sin(a) * sp * 0.8 + 0.6; s.vz = Math.random() * 0.8;
      s.spin = (Math.random() - 0.5) * 1.5;
      s.mat.rotation = Math.random() * 6.28;
      const shade = 0.16 + Math.random() * 0.12;
      s.mat.color.setRGB(shade * 1.1, shade * 0.9, shade * 0.8);
      s.sprite.position.set(pos.x + Math.cos(a) * 0.2, pos.y + Math.sin(a) * 0.2, pos.z);
      s.sprite.visible = true;
    }
  }

  update(dt: number): void {
    this.sparks.update(dt);
    for (const b of this.blasts) {
      if (!b.active) continue;
      b.age += dt;
      const tf = b.age / 0.28;
      if (tf < 1) {
        const s = 0.3 + (1 - Math.pow(1 - tf, 3)) * 1.6;
        b.flash.scale.setScalar(s);
        b.flashMat.color.setRGB(3 * (1 - tf), 2.6 * (1 - tf), 2 * (1 - tf));
        b.flash.visible = true;
      } else b.flash.visible = false;
      const tg = b.age / 0.6;
      if (tg < 1) {
        b.glow.scale.setScalar(2 + tg * 6);
        b.glowMat.opacity = (1 - tg) * (1 - tg) * 1.4;
      } else b.glow.visible = false;
      const tr = b.age / 0.5;
      if (tr < 1) {
        const e = 1 - Math.pow(1 - tr, 2.5);
        b.ring.scale.setScalar(0.4 + e * 4.2);
        b.ringMat.opacity = (1 - tr) * 1.2;
      } else b.ring.visible = false;
      if (b.age > 0.6) b.active = false;
    }
    if (this.lightT < 1) {
      this.lightT = Math.min(1, this.lightT + dt / 0.5);
      this.light.intensity = 60 * (1 - this.lightT) * (1 - this.lightT);
    } else this.light.intensity = 0;
    const d = Math.exp(-1.8 * dt);
    for (const s of this.smoke) {
      if (!s.active) continue;
      s.age += dt;
      const t = s.age / s.life;
      if (t >= 1) { s.active = false; s.sprite.visible = false; continue; }
      s.vx *= d; s.vy = s.vy * d + 0.6 * dt; s.vz *= d;
      s.sprite.position.x += s.vx * dt; s.sprite.position.y += s.vy * dt; s.sprite.position.z += s.vz * dt;
      s.mat.rotation += s.spin * dt;
      const sc = s.size * (0.5 + (1 - Math.pow(1 - t, 2)) * 1.3);
      s.sprite.scale.set(sc, sc, sc);
      s.mat.opacity = 0.85 * Math.min(1, t * 10) * (1 - t);
    }
  }

  clear(): void {
    this.sparks.clear();
    for (const b of this.blasts) { b.active = false; b.flash.visible = b.glow.visible = b.ring.visible = false; }
    for (const s of this.smoke) { s.active = false; s.sprite.visible = false; }
    this.light.intensity = 0;
    this.lightT = 1;
  }

  dispose(): void {
    this.scene.remove(this.group);
    this.sparks.dispose();
    for (const b of this.blasts) { b.flashMat.dispose(); b.glowMat.dispose(); b.ringMat.dispose(); }
    for (const s of this.smoke) s.mat.dispose();
    this.sphereGeo.dispose(); this.ringGeo.dispose(); this.puffTex.dispose(); this.dotTex.dispose();
  }
}

/** Bomb fuse sparks. Call emit() every frame (or every few frames) at the fuse tip. */
export class SparkFX {
  readonly group = new THREE.Group();
  private pool = new SparkPool(400);
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group.name = 'SparkFX';
    this.pool.gravity = 3.5;
    this.pool.drag = 3;
    this.group.add(this.pool.mesh);
    scene.add(this.group);
  }

  emit(pos: THREE.Vector3, count = 2): void {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 0.8 + Math.random() * 2.4;
      this.pool.spawn(pos.x, pos.y, pos.z,
        Math.cos(a) * sp * 0.8, 0.8 + Math.random() * 2.2, Math.sin(a) * sp * 0.8,
        0.008 + Math.random() * 0.01, 0.18 + Math.random() * 0.3,
        Math.random() < 0.6 ? 0xffe9a0 : 0xff8a3d, 2.6);
    }
  }

  update(dt: number): void { this.pool.update(dt); }
  clear(): void { this.pool.clear(); }
  dispose(): void { this.scene.remove(this.group); this.pool.dispose(); }
}
