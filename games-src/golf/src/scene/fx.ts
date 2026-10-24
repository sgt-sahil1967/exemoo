/** Particle effects: chunky instanced bits (turf, sand, droplets, leaves, confetti), soft puffs, rings. */
import {
  BoxGeometry,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  Euler,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PlaneGeometry,
  Quaternion,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three';
import type { FxKind, Quality } from '../core/contracts';
import { radialTexture, ringTexture } from './textures';

interface Bit {
  pos: Vector3;
  vel: Vector3;
  rot: Euler;
  spin: Vector3;
  size: number;
  life: number;
  max: number;
  drag: number;
  grav: number;
  flutter: number;
  flat: boolean;
  ground: boolean;
  color: string;
}

interface Puff {
  s: Sprite;
  vel: Vector3;
  life: number;
  max: number;
  size0: number;
  size1: number;
  alpha: number;
}

interface Ring {
  m: Mesh;
  life: number;
  max: number;
  r0: number;
  r1: number;
  alpha: number;
}

const MAX_BITS = 700;

export class Fx {
  readonly group = new Group();
  private chunks: InstancedMesh;
  private flakes: InstancedMesh;
  private chunkBits: Bit[] = [];
  private flakeBits: Bit[] = [];
  private puffs: Puff[] = [];
  private rings: Ring[] = [];
  private density = 1;
  private heightAt: (x: number, z: number) => number = () => 0;
  private tmpM = new Matrix4();
  private tmpQ = new Quaternion();
  private tmpS = new Vector3();
  private col = new Color();
  private ringGeo = new PlaneGeometry(1, 1).rotateX(-Math.PI / 2);

  constructor() {
    this.chunks = new InstancedMesh(new BoxGeometry(1, 1, 1), new MeshLambertMaterial({ color: '#ffffff' }), MAX_BITS);
    this.flakes = new InstancedMesh(new PlaneGeometry(1, 1), new MeshLambertMaterial({ color: '#ffffff', side: DoubleSide }), MAX_BITS);
    for (const im of [this.chunks, this.flakes]) {
      im.instanceMatrix.setUsage(DynamicDrawUsage);
      im.count = 0;
      im.frustumCulled = false;
      im.castShadow = false;
      im.setColorAt(0, new Color('#ffffff'));
      this.group.add(im);
    }
  }

  setHeightFn(fn: (x: number, z: number) => number) {
    this.heightAt = fn;
  }

  setQuality(q: Quality) {
    this.density = q === 'low' ? 0.4 : q === 'medium' ? 0.7 : 1;
  }

  private bit(list: Bit[], im: InstancedMesh, p: Vector3, v: Vector3, color: string, size: number, life: number, o: Partial<Bit> = {}) {
    if (list.length >= MAX_BITS) list.shift();
    const b: Bit = {
      pos: p.clone(),
      vel: v.clone(),
      rot: new Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
      spin: new Vector3((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14),
      size,
      life: 0,
      max: life,
      drag: 0.4,
      grav: 9.8,
      flutter: 0,
      flat: im === this.flakes,
      ground: true,
      color,
      ...o,
    };
    list.push(b);
  }

  private puff(p: Vector3, color: string, size0: number, size1: number, life: number, vel: Vector3, alpha = 0.7) {
    const mat = new SpriteMaterial({ map: radialTexture(0.1), color, transparent: true, depthWrite: false, opacity: alpha });
    const s = new Sprite(mat);
    s.position.copy(p);
    s.scale.setScalar(size0);
    this.group.add(s);
    this.puffs.push({ s, vel: vel.clone(), life: 0, max: life, size0, size1, alpha });
  }

  private ring(p: Vector3, r0: number, r1: number, life: number, color = '#ffffff', alpha = 0.9) {
    const m = new Mesh(this.ringGeo, new MeshBasicMaterial({ map: ringTexture(), color, transparent: true, depthWrite: false, opacity: alpha, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    m.position.copy(p);
    m.renderOrder = 7;
    this.group.add(m);
    this.rings.push({ m, life: 0, max: life, r0, r1, alpha });
  }

  private n(k: number) {
    return Math.max(1, Math.round(k * this.density));
  }

  spawn(kind: FxKind, at: Vector3) {
    const p = at.clone();
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const v = new Vector3();
    const ground = this.heightAt(p.x, p.z);
    switch (kind) {
      case 'divot': {
        const greens = ['#5cb23f', '#6cc44c', '#4c9a33'];
        for (let i = 0; i < this.n(26); i++) {
          v.set(rnd(-1.2, 1.2), rnd(2, 5), rnd(-1.2, 1.2));
          this.bit(this.chunkBits, this.chunks, p.clone().add(new Vector3(rnd(-0.1, 0.1), 0.05, rnd(-0.1, 0.1))), v, greens[i % 3], rnd(0.03, 0.07), rnd(0.8, 1.4));
        }
        for (let i = 0; i < this.n(6); i++) {
          v.set(rnd(-0.8, 0.8), rnd(2.5, 4), rnd(-0.8, 0.8));
          this.bit(this.chunkBits, this.chunks, p, v, '#7a5432', rnd(0.04, 0.08), rnd(0.8, 1.3));
        }
        this.puff(p.clone().setY(ground + 0.15), '#c9b48a', 0.3, 1.2, 0.8, new Vector3(0, 0.4, 0), 0.45);
        break;
      }
      case 'sand': {
        for (let i = 0; i < this.n(70); i++) {
          const a = Math.random() * Math.PI * 2;
          const s = rnd(0.5, 3);
          v.set(Math.cos(a) * s, rnd(2, 6), Math.sin(a) * s);
          this.bit(this.chunkBits, this.chunks, p, v, Math.random() < 0.5 ? '#f2dc9b' : '#e3c985', rnd(0.02, 0.05), rnd(0.7, 1.3), { drag: 1.2 });
        }
        for (let i = 0; i < this.n(4); i++)
          this.puff(p.clone().add(new Vector3(rnd(-0.4, 0.4), 0.3, rnd(-0.4, 0.4))), '#f5e3b0', 0.5, 2.4, 1.2, new Vector3(rnd(-0.3, 0.3), 0.8, rnd(-0.3, 0.3)), 0.6);
        break;
      }
      case 'splash': {
        const wy = p.y;
        for (let i = 0; i < this.n(60); i++) {
          const a = Math.random() * Math.PI * 2;
          const s = rnd(0.5, 2.5);
          v.set(Math.cos(a) * s, rnd(3, 8), Math.sin(a) * s);
          this.bit(this.chunkBits, this.chunks, p, v, Math.random() < 0.6 ? '#ffffff' : '#bfe9ff', rnd(0.03, 0.07), rnd(0.6, 1.2), { ground: false });
        }
        this.puff(p.clone().setY(wy + 0.4), '#ffffff', 0.4, 2.2, 0.7, new Vector3(0, 1.5, 0), 0.75);
        this.ring(p.clone().setY(wy + 0.02), 0.2, 3.5, 1.4);
        this.ring(p.clone().setY(wy + 0.02), 0.1, 6, 2.2, '#ffffff', 0.6);
        break;
      }
      case 'leaves': {
        const greens = ['#4caf3f', '#3f9f39', '#79c94f', '#d8c14a'];
        for (let i = 0; i < this.n(30); i++) {
          v.set(rnd(-2, 2), rnd(-0.5, 2), rnd(-2, 2));
          this.bit(this.flakeBits, this.flakes, p.clone().add(new Vector3(rnd(-1, 1), rnd(-0.5, 1), rnd(-1, 1))), v, greens[i % 4], rnd(0.1, 0.18), rnd(2.5, 4), { drag: 2.6, grav: 3, flutter: 2.5 });
        }
        break;
      }
      case 'confetti': {
        const cols = ['#ff3b30', '#ffcc00', '#34c759', '#20a4f3', '#af52de', '#ff9500', '#ffffff'];
        for (let i = 0; i < this.n(220); i++) {
          const a = Math.random() * Math.PI * 2;
          const s = rnd(1, 5);
          v.set(Math.cos(a) * s, rnd(6, 13), Math.sin(a) * s);
          this.bit(this.flakeBits, this.flakes, p.clone().add(new Vector3(0, 0.5, 0)), v, cols[i % cols.length], rnd(0.07, 0.12), rnd(3.5, 5.5), { drag: 1.8, grav: 5, flutter: 3 });
        }
        this.puff(p.clone().setY(p.y + 0.6), '#fff6c8', 0.5, 3, 0.6, new Vector3(0, 1, 0), 0.8);
        break;
      }
      case 'cupDrop': {
        this.ring(p.clone().setY(ground + 0.03), 0.05, 0.8, 0.9, '#fff3a0', 1);
        this.ring(p.clone().setY(ground + 0.03), 0.05, 1.6, 1.3, '#ffffff', 0.7);
        for (let i = 0; i < this.n(18); i++) {
          const a = (i / 18) * Math.PI * 2;
          v.set(Math.cos(a) * 1.2, rnd(1.5, 3), Math.sin(a) * 1.2);
          this.bit(this.flakeBits, this.flakes, p.clone().setY(ground + 0.05), v, i % 2 ? '#ffe14d' : '#ffffff', 0.05, 0.9, { drag: 2, grav: 4 });
        }
        break;
      }
      case 'dust': {
        for (let i = 0; i < this.n(3); i++)
          this.puff(p.clone().add(new Vector3(rnd(-0.2, 0.2), 0.12, rnd(-0.2, 0.2))), '#e9dcc0', 0.25, 1.3, 0.9, new Vector3(rnd(-0.3, 0.3), 0.4, rnd(-0.3, 0.3)), 0.5);
        for (let i = 0; i < this.n(8); i++) {
          v.set(rnd(-1, 1), rnd(1, 2.2), rnd(-1, 1));
          this.bit(this.chunkBits, this.chunks, p, v, '#5cb23f', 0.03, 0.6);
        }
        break;
      }
      case 'sparkle': {
        for (let i = 0; i < this.n(16); i++) {
          v.set(rnd(-1.5, 1.5), rnd(0.5, 3), rnd(-1.5, 1.5));
          this.bit(this.flakeBits, this.flakes, p, v, i % 2 ? '#fff6a0' : '#ffffff', 0.07, 0.8, { drag: 2.5, grav: 1 });
        }
        this.puff(p.clone(), '#ffffff', 0.2, 1.4, 0.5, new Vector3(), 0.9);
        break;
      }
    }
  }

  update(dt: number) {
    this.stepBits(this.chunkBits, this.chunks, dt);
    this.stepBits(this.flakeBits, this.flakes, dt);
    for (let i = this.puffs.length - 1; i >= 0; i--) {
      const p = this.puffs[i];
      p.life += dt;
      const f = p.life / p.max;
      if (f >= 1) {
        this.group.remove(p.s);
        p.s.material.dispose();
        this.puffs.splice(i, 1);
        continue;
      }
      p.s.position.addScaledVector(p.vel, dt);
      p.vel.multiplyScalar(Math.exp(-2 * dt));
      p.s.scale.setScalar(p.size0 + (p.size1 - p.size0) * (1 - (1 - f) * (1 - f)));
      p.s.material.opacity = p.alpha * (1 - f);
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life += dt;
      const f = r.life / r.max;
      const mat = r.m.material as MeshBasicMaterial;
      if (f >= 1) {
        this.group.remove(r.m);
        mat.dispose();
        this.rings.splice(i, 1);
        continue;
      }
      const s = (r.r0 + (r.r1 - r.r0) * (1 - (1 - f) * (1 - f))) * 2;
      r.m.scale.set(s, 1, s);
      mat.opacity = r.alpha * (1 - f);
    }
  }

  private stepBits(list: Bit[], im: InstancedMesh, dt: number) {
    let n = 0;
    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i];
      b.life += dt;
      if (b.life >= b.max) {
        list.splice(i, 1);
        continue;
      }
      b.vel.y -= b.grav * dt;
      b.vel.multiplyScalar(Math.exp(-b.drag * dt));
      if (b.flutter) {
        b.vel.x += Math.sin(b.life * 7 + b.size * 100) * b.flutter * dt;
        b.vel.z += Math.cos(b.life * 6 + b.size * 50) * b.flutter * dt;
      }
      b.pos.addScaledVector(b.vel, dt);
      if (b.ground) {
        const gy = this.heightAt(b.pos.x, b.pos.z) + b.size * 0.3;
        if (b.pos.y < gy) {
          b.pos.y = gy;
          b.vel.set(b.vel.x * 0.3, Math.abs(b.vel.y) * 0.15, b.vel.z * 0.3);
          b.spin.multiplyScalar(0.5);
        }
      }
      b.rot.x += b.spin.x * dt;
      b.rot.y += b.spin.y * dt;
      b.rot.z += b.spin.z * dt;
    }
    for (const b of list) {
      if (n >= MAX_BITS) break;
      const f = b.life / b.max;
      const s = b.size * (f > 0.75 ? (1 - f) / 0.25 : 1);
      this.tmpQ.setFromEuler(b.rot);
      this.tmpM.compose(b.pos, this.tmpQ, this.tmpS.set(s, b.flat ? s * 0.65 : s, s));
      im.setMatrixAt(n, this.tmpM);
      im.setColorAt(n, this.col.set(b.color));
      n++;
    }
    im.count = n;
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
  }

  clear() {
    this.chunkBits = [];
    this.flakeBits = [];
  }

  dispose() {
    this.chunks.geometry.dispose();
    (this.chunks.material as MeshLambertMaterial).dispose();
    this.flakes.geometry.dispose();
    (this.flakes.material as MeshLambertMaterial).dispose();
    this.ringGeo.dispose();
  }
}
