import * as THREE from 'three';
import { TABLE } from './environment';
import type { StainLayer } from './stains';
import { makePuff, shadeHex } from './textures';

const MAX_DROPS = 1500;
const MAX_PUFFS = 24;
const MAX_STREAKS = 12;
const GRAVITY = 9.8;

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _p = new THREE.Vector3();
const _v = new THREE.Vector3();
const _n = new THREE.Vector3();
const _d = new THREE.Vector3();
const _c = new THREE.Color();
const _up = new THREE.Vector3(0, 1, 0);
const _fwd = new THREE.Vector3(0, 0, 1);

interface Puff { sprite: THREE.Sprite; mat: THREE.SpriteMaterial; age: number; life: number; size: number; vy: number; active: boolean }
interface Streak { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; age: number; life: number; len: number; active: boolean }

/**
 * Fruit juice: pooled instanced droplets spraying along/perpendicular to the
 * cut, a mist puff and a bright slash streak. Droplets landing on the table
 * leave stains through the StainLayer.
 */
export class JuiceFX {
  readonly group = new THREE.Group();
  private mesh: THREE.InstancedMesh;
  private geo: THREE.BufferGeometry;
  private mat: THREE.MeshStandardMaterial;
  // SoA particle state
  private px = new Float32Array(MAX_DROPS * 3);
  private pv = new Float32Array(MAX_DROPS * 3);
  private life = new Float32Array(MAX_DROPS);
  private maxLife = new Float32Array(MAX_DROPS);
  private size = new Float32Array(MAX_DROPS);
  private col = new Uint32Array(MAX_DROPS);
  private stainOnLand = new Uint8Array(MAX_DROPS);
  private live = 0;
  private puffs: Puff[] = [];
  private streaks: Streak[] = [];
  private puffTex: THREE.CanvasTexture;
  private streakGeo: THREE.PlaneGeometry;
  private streakTex: THREE.CanvasTexture;
  private scene: THREE.Scene;
  private stains: StainLayer;
  /** Multiplier on spawned droplet counts (set lower on low quality). */
  density = 1;

  constructor(scene: THREE.Scene, stains: StainLayer) {
    this.scene = scene;
    this.stains = stains;
    this.group.name = 'JuiceFX';
    scene.add(this.group);

    this.geo = new THREE.IcosahedronGeometry(1, 1);
    this.mat = new THREE.MeshStandardMaterial({ roughness: 0.18, metalness: 0, emissive: 0x000000 });
    // juice glows a touch so it reads against the dark backdrop
    this.mat.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * 0.35;',
      );
    };
    this.mesh = new THREE.InstancedMesh(this.geo, this.mat, MAX_DROPS);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.setColorAt(0, _c.set(0xffffff));
    this.mesh.instanceColor!.setUsage(THREE.DynamicDrawUsage);
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    this.mesh.castShadow = false;
    this.group.add(this.mesh);

    this.puffTex = new THREE.CanvasTexture(makePuff(128, 3));
    for (let i = 0; i < MAX_PUFFS; i++) {
      const mat = new THREE.SpriteMaterial({ map: this.puffTex, transparent: true, depthWrite: false, opacity: 0 });
      const sprite = new THREE.Sprite(mat);
      sprite.visible = false;
      this.group.add(sprite);
      this.puffs.push({ sprite, mat, age: 0, life: 1, size: 1, vy: 0, active: false });
    }

    // slash streak: thin bright lens-shaped plane
    const sc = document.createElement('canvas');
    sc.width = 256; sc.height = 32;
    const g = sc.getContext('2d')!;
    const grad = g.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.5, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.beginPath();
    g.ellipse(128, 16, 128, 9, 0, 0, Math.PI * 2);
    g.fill();
    const g2 = g.createRadialGradient(128, 16, 0, 128, 16, 128);
    g2.addColorStop(0, 'rgba(255,255,255,0.5)');
    g2.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = g2;
    g.fillRect(0, 0, 256, 32);
    this.streakTex = new THREE.CanvasTexture(sc);
    this.streakGeo = new THREE.PlaneGeometry(1, 0.06);
    for (let i = 0; i < MAX_STREAKS; i++) {
      const mat = new THREE.MeshBasicMaterial({
        map: this.streakTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0,
      });
      const mesh = new THREE.Mesh(this.streakGeo, mat);
      mesh.visible = false;
      mesh.renderOrder = 5;
      this.group.add(mesh);
      this.streaks.push({ mesh, mat, age: 0, life: 0.18, len: 1, active: false });
    }
  }

  /** Number of live droplets (for perf HUDs). */
  get count(): number { return this.live; }

  private spawn(x: number, y: number, z: number, vx: number, vy: number, vz: number, sz: number, color: number, life: number, stain: boolean): void {
    if (this.live >= MAX_DROPS) return;
    const i = this.live++;
    const k = i * 3;
    this.px[k] = x; this.px[k + 1] = y; this.px[k + 2] = z;
    this.pv[k] = vx; this.pv[k + 1] = vy; this.pv[k + 2] = vz;
    this.size[i] = sz;
    this.life[i] = 0;
    this.maxLife[i] = life;
    this.col[i] = color;
    this.stainOnLand[i] = stain ? 1 : 0;
    this.mesh.setColorAt(i, _c.setHex(color));
  }

  /**
   * Juice burst. sliceDir = world unit vector along blade movement.
   * scale ~ fruit size factor (1 = average fruit).
   */
  burst(pos: THREE.Vector3, sliceDir: THREE.Vector3, color: number, scale = 1): void {
    _d.copy(sliceDir);
    if (_d.lengthSq() < 1e-6) _d.set(1, 0, 0);
    _d.normalize();
    // n: perpendicular to blade within the screen-ish plane
    _n.crossVectors(_d, _fwd);
    if (_n.lengthSq() < 1e-6) _n.crossVectors(_d, _up);
    _n.normalize();

    const light = shadeHex(color, 0.25);
    const dark = shadeHex(color, -0.2);
    const n = Math.round((70 + Math.random() * 25) * scale * this.density);
    for (let i = 0; i < n; i++) {
      const r = Math.random();
      const side = Math.random() < 0.5 ? -1 : 1;
      // three populations: fast spray along the cut, side fans, slow drips
      let along: number, perp: number, rndAmt: number;
      if (r < 0.45) { along = 2 + Math.random() * 4.5; perp = (Math.random() - 0.5) * 1.2; rndAmt = 0.9; }
      else if (r < 0.85) { along = (Math.random() - 0.3) * 1.8; perp = side * (1.2 + Math.random() * 2.8); rndAmt = 0.9; }
      else { along = (Math.random() - 0.5) * 1.0; perp = (Math.random() - 0.5) * 1.0; rndAmt = 0.6; }
      const big = Math.random() < 0.12;
      const sz = (big ? 0.035 + Math.random() * 0.03 : 0.012 + Math.random() * 0.022) * Math.sqrt(scale);
      _v.set(
        _d.x * along + _n.x * perp + (Math.random() - 0.5) * rndAmt * 2,
        _d.y * along + _n.y * perp + (Math.random() - 0.5) * rndAmt * 2 + 1.4,
        _d.z * along + _n.z * perp + (Math.random() * 0.9 + 0.4) * 1.6 + (Math.random() - 0.5),
      );
      const off = (Math.random() - 0.5) * 0.25 * scale;
      const c = Math.random() < 0.25 ? light : Math.random() < 0.2 ? dark : color;
      this.spawn(
        pos.x + _d.x * off + (Math.random() - 0.5) * 0.08,
        pos.y + _d.y * off + (Math.random() - 0.5) * 0.08,
        pos.z + (Math.random() - 0.5) * 0.08,
        _v.x, _v.y, _v.z, sz, c, 1.6 + Math.random() * 1.2, big || Math.random() < 0.3,
      );
    }
    this.mesh.instanceColor!.needsUpdate = true;

    // mist puffs
    for (let k = 0; k < 2; k++) {
      const p = this.puffs.find((q) => !q.active);
      if (!p) break;
      p.active = true;
      p.age = 0;
      p.life = 0.45 + Math.random() * 0.2 + k * 0.1;
      p.size = (0.75 + k * 0.45) * scale;
      p.vy = 0.3;
      p.mat.color.setHex(shadeHex(color, 0.15));
      p.mat.rotation = Math.random() * Math.PI * 2;
      p.sprite.position.set(pos.x, pos.y, pos.z + 0.05);
      p.sprite.visible = true;
    }
    // slash streak
    const s = this.streaks.find((q) => !q.active);
    if (s) {
      s.active = true;
      s.age = 0;
      s.life = 0.2;
      s.len = 1.6 * scale;
      s.mat.color.setHex(shadeHex(color, 0.55));
      s.mesh.position.set(pos.x, pos.y, pos.z + 0.3);
      s.mesh.rotation.set(0, 0, Math.atan2(_d.y, _d.x));
      s.mesh.visible = true;
    }
  }

  update(dt: number): void {
    if (dt <= 0) return;
    const drag = Math.exp(-0.6 * dt);
    const px = this.px, pv = this.pv;
    let colorsDirty = false;
    let i = 0;
    while (i < this.live) {
      const k = i * 3;
      this.life[i] += dt;
      pv[k] *= drag; pv[k + 2] *= drag;
      pv[k + 1] = pv[k + 1] * drag - GRAVITY * dt;
      px[k] += pv[k] * dt; px[k + 1] += pv[k + 1] * dt; px[k + 2] += pv[k + 2] * dt;
      let dead = this.life[i] >= this.maxLife[i] || px[k + 1] < -4;
      const x = px[k], z = px[k + 2];
      if (!dead && px[k + 1] <= TABLE.topY + this.size[i] * 0.5 && pv[k + 1] < 0 &&
          x > TABLE.minX && x < TABLE.maxX && z > TABLE.minZ && z < TABLE.maxZ && px[k + 1] > TABLE.topY - 0.25) {
        if (this.stainOnLand[i]) this.stains.addStain(x, z, this.col[i], this.size[i] * 3.2 + 0.03);
        dead = true;
      }
      if (dead) {
        // swap-remove with the last live particle
        const j = --this.live;
        if (i !== j) {
          const kj = j * 3;
          px[k] = px[kj]; px[k + 1] = px[kj + 1]; px[k + 2] = px[kj + 2];
          pv[k] = pv[kj]; pv[k + 1] = pv[kj + 1]; pv[k + 2] = pv[kj + 2];
          this.life[i] = this.life[j];
          this.maxLife[i] = this.maxLife[j];
          this.size[i] = this.size[j];
          this.col[i] = this.col[j];
          this.stainOnLand[i] = this.stainOnLand[j];
          this.mesh.setColorAt(i, _c.setHex(this.col[i]));
          colorsDirty = true;
        }
        continue;
      }
      // stretch along velocity for a motion-blur feel
      _v.set(pv[k], pv[k + 1], pv[k + 2]);
      const speed = _v.length();
      if (speed > 1e-4) _q.setFromUnitVectors(_up, _v.multiplyScalar(1 / speed));
      else _q.identity();
      const t = this.life[i] / this.maxLife[i];
      const shrink = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
      const sz = this.size[i] * shrink;
      _s.set(sz, sz * (1 + Math.min(speed * 0.18, 2.2)), sz);
      _p.set(px[k], px[k + 1], px[k + 2]);
      _m.compose(_p, _q, _s);
      this.mesh.setMatrixAt(i, _m);
      i++;
    }
    this.mesh.count = this.live;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (colorsDirty) this.mesh.instanceColor!.needsUpdate = true;

    for (const p of this.puffs) {
      if (!p.active) continue;
      p.age += dt;
      const t = p.age / p.life;
      if (t >= 1) { p.active = false; p.sprite.visible = false; continue; }
      const e = 1 - Math.pow(1 - t, 3);
      const s = p.size * (0.35 + e * 0.9);
      p.sprite.scale.set(s, s, s);
      p.sprite.position.y += p.vy * dt;
      p.mat.opacity = 0.55 * (1 - t) * Math.min(1, t * 8);
    }
    for (const s of this.streaks) {
      if (!s.active) continue;
      s.age += dt;
      const t = s.age / s.life;
      if (t >= 1) { s.active = false; s.mesh.visible = false; continue; }
      const e = 1 - Math.pow(1 - t, 2);
      s.mesh.scale.set(s.len * (0.6 + e * 0.6), 1 + (1 - t) * 1.5, 1);
      s.mat.opacity = (1 - t) * 1.2;
    }
  }

  clear(): void {
    this.live = 0;
    this.mesh.count = 0;
    for (const p of this.puffs) { p.active = false; p.sprite.visible = false; }
    for (const s of this.streaks) { s.active = false; s.mesh.visible = false; }
  }

  dispose(): void {
    this.scene.remove(this.group);
    this.mesh.dispose();
    this.geo.dispose();
    this.mat.dispose();
    this.puffTex.dispose();
    for (const p of this.puffs) p.mat.dispose();
    for (const s of this.streaks) s.mat.dispose();
    this.streakGeo.dispose();
    this.streakTex.dispose();
  }
}
