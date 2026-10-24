import * as THREE from 'three';
import { TABLE } from './environment';
import { ctx2d, drawSplatBlob, makeCanvas, mulberry32 } from './textures';

const MAX_STAINS = 500;
const LIFE = 20;
const VARIANTS = 4;
const SPRITE = 128;

interface Stain {
  u: number; v: number; size: number; rot: number; age: number; key: string; alpha: number; active: boolean;
}

/**
 * Juice stains on the table top: a CanvasTexture decal plane hovering just
 * above y=0. Stains are pre-rendered sprites (cached per colour/variant) that
 * are composited into the canvas with per-stain alpha, re-drawn at <= 15 Hz.
 */
export class StainLayer {
  readonly mesh: THREE.Mesh;
  private canvas: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;
  private tex: THREE.CanvasTexture;
  private stains: Stain[] = [];
  private head = 0;
  private sprites = new Map<string, HTMLCanvasElement>();
  private dirty = false;
  private sinceDraw = 0;
  private fadeTimer = 0;
  private rnd = mulberry32(4242);
  private scene: THREE.Scene;
  private pxPerM: number;

  constructor(scene: THREE.Scene, resolution = 1024) {
    this.scene = scene;
    const w = TABLE.maxX - TABLE.minX;
    const d = TABLE.maxZ - TABLE.minZ;
    this.canvas = makeCanvas(resolution, Math.round((resolution * d) / w));
    this.pxPerM = resolution / w;
    this.g = ctx2d(this.canvas);
    this.tex = new THREE.CanvasTexture(this.canvas);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.tex.anisotropy = 4;
    const mat = new THREE.MeshStandardMaterial({
      map: this.tex,
      transparent: true,
      depthWrite: false,
      roughness: 0.25,
      metalness: 0,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const geo = new THREE.PlaneGeometry(w, d);
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.set((TABLE.minX + TABLE.maxX) / 2, TABLE.topY + 0.004, (TABLE.minZ + TABLE.maxZ) / 2);
    this.mesh.receiveShadow = true;
    this.mesh.renderOrder = 1;
    this.mesh.name = 'Stains';
    scene.add(this.mesh);
    for (let i = 0; i < MAX_STAINS; i++) {
      this.stains.push({ u: 0, v: 0, size: 0, rot: 0, age: 0, key: '', alpha: 0, active: false });
    }
  }

  private sprite(color: number, variant: number, dot: boolean): string {
    const key = `${color}|${dot ? 'd' : variant}`;
    if (!this.sprites.has(key)) {
      const c = makeCanvas(SPRITE, SPRITE);
      const g = ctx2d(c);
      const rnd = mulberry32(color ^ (variant * 7919) ^ (dot ? 1234 : 0));
      if (dot) {
        g.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
        g.beginPath();
        g.ellipse(SPRITE / 2, SPRITE / 2, SPRITE * 0.32, SPRITE * 0.26, 0, 0, Math.PI * 2);
        g.fill();
        g.beginPath();
        g.arc(SPRITE * 0.8, SPRITE * 0.45, SPRITE * 0.07, 0, Math.PI * 2);
        g.fill();
      } else {
        drawSplatBlob(g, SPRITE / 2, SPRITE / 2, SPRITE * 0.26, color, rnd, { dots: 9, rim: true });
      }
      this.sprites.set(key, c);
    }
    return key;
  }

  /** Add a stain at world (x, z). size = approximate diameter in meters. */
  addStain(x: number, z: number, color: number, size: number): void {
    if (x < TABLE.minX || x > TABLE.maxX || z < TABLE.minZ || z > TABLE.maxZ) return;
    const s = this.stains[this.head];
    this.head = (this.head + 1) % MAX_STAINS;
    const dot = size < 0.09;
    s.key = this.sprite(color, Math.floor(this.rnd() * VARIANTS), dot);
    s.u = (x - TABLE.minX) * this.pxPerM;
    s.v = (z - TABLE.minZ) * this.pxPerM;
    s.size = size * this.pxPerM * (dot ? 1.6 : 1.9);
    s.rot = this.rnd() * Math.PI * 2;
    s.age = 0;
    s.alpha = dot ? 0.75 : 0.62;
    s.active = true;
    this.dirty = true;
  }

  clear(): void {
    for (const s of this.stains) s.active = false;
    this.dirty = true;
  }

  update(dt: number): void {
    let any = false;
    for (const s of this.stains) {
      if (!s.active) continue;
      s.age += dt;
      if (s.age >= LIFE) { s.active = false; this.dirty = true; } else any = true;
    }
    this.sinceDraw += dt;
    this.fadeTimer += dt;
    if (any && this.fadeTimer > 0.25) { this.fadeTimer = 0; this.dirty = true; }
    if (this.dirty && this.sinceDraw >= 1 / 15) this.redraw();
  }

  private redraw(): void {
    this.dirty = false;
    this.sinceDraw = 0;
    const g = this.g;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // draw oldest first so fresh juice sits on top
    for (let k = 0; k < MAX_STAINS; k++) {
      const s = this.stains[(this.head + k) % MAX_STAINS];
      if (!s.active) continue;
      const img = this.sprites.get(s.key);
      if (!img) continue;
      const t = s.age / LIFE;
      // quick soak-in spread, then a long slow fade (ease-in)
      const grow = Math.min(1, 0.75 + s.age * 2.5);
      const fade = 1 - t * t * (3 - 2 * t);
      g.globalAlpha = s.alpha * fade;
      const sz = s.size * grow;
      g.setTransform(Math.cos(s.rot), Math.sin(s.rot), -Math.sin(s.rot), Math.cos(s.rot), s.u, s.v);
      g.drawImage(img, -sz / 2, -sz / 2, sz, sz);
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    this.tex.needsUpdate = true;
  }

  dispose(): void {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
    this.tex.dispose();
    this.sprites.clear();
  }
}
