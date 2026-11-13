// Shared helpers for the procedural cartoon models: toon materials, cached unit geometry, ink outlines.
import * as THREE from 'three';

export const PAL = {
  ink: '#1b1b3a', red: '#ff3b30', yellow: '#ffd21f', blue: '#2f7cff', green: '#2fc65a', orange: '#ff8a00',
  purple: '#9b4dff', wood: '#b8763e', cream: '#fff6e0', pink: '#ffb3c1', steel: '#9aa3b8', dark: '#2b2b4d',
  white: '#ffffff', cyan: '#38e1ff',
};

let _grad: THREE.DataTexture | null = null;
function gradient(): THREE.DataTexture {
  if (_grad) return _grad;
  const d = new Uint8Array([105, 165, 220, 255]);
  const t = new THREE.DataTexture(d, 4, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  return (_grad = t);
}

export type Mats = THREE.MeshToonMaterial[];
const shared = new Map<string, THREE.MeshToonMaterial>();

/** Toon material. With a list it is a private copy (so it can flash); without, a shared cached one. */
export function toon(c: THREE.ColorRepresentation, L?: Mats): THREE.MeshToonMaterial {
  if (L) {
    const m = new THREE.MeshToonMaterial({ color: c, gradientMap: gradient() });
    L.push(m);
    return m;
  }
  const key = new THREE.Color(c).getHexString();
  let m = shared.get(key);
  if (!m) {
    m = new THREE.MeshToonMaterial({ color: c, gradientMap: gradient() });
    shared.set(key, m);
  }
  return m;
}

export function glowMat(color: THREE.ColorRepresentation, opacity = 1, additive = true): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
}

export function setEmissive(L: Mats, r: number, g: number, b: number): void {
  for (let i = 0; i < L.length; i++) L[i].emissive.setRGB(r, g, b);
}

const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  sph: new THREE.SphereGeometry(1, 14, 10),
  ico: new THREE.IcosahedronGeometry(1, 0),
};
const cyls = new Map<string, THREE.CylinderGeometry>();
function cylGeo(ratio: number, seg: number): THREE.CylinderGeometry {
  const k = ratio.toFixed(3) + '/' + seg;
  let g = cyls.get(k);
  if (!g) { g = new THREE.CylinderGeometry(ratio, 1, 1, seg); cyls.set(k, g); }
  return g;
}
const inkBack = new THREE.MeshBasicMaterial({ color: PAL.ink, side: THREE.BackSide });

export function place<T extends THREE.Object3D>(p: THREE.Object3D | null, o: T, x = 0, y = 0, z = 0): T {
  o.position.set(x, y, z);
  if (p) p.add(o);
  return o;
}

/** Inverted-hull ink outline with constant absolute thickness t (metres). */
export function edge(m: THREE.Mesh, t: number): THREE.Mesh {
  const s = m.scale;
  const o = new THREE.Mesh(m.geometry, inkBack);
  o.scale.set(1 + (2 * t) / Math.abs(s.x || 1), 1 + (2 * t) / Math.abs(s.y || 1), 1 + (2 * t) / Math.abs(s.z || 1));
  m.add(o);
  return m;
}

export function B(p: THREE.Object3D | null, mat: THREE.Material, w: number, h: number, l: number, x = 0, y = 0, z = 0, ol = 0): THREE.Mesh {
  const m = new THREE.Mesh(G.box, mat);
  m.scale.set(w, h, l);
  m.castShadow = true;
  if (ol) edge(m, ol);
  return place(p, m, x, y, z);
}
export function S(p: THREE.Object3D | null, mat: THREE.Material, rx: number, ry: number, rz: number, x = 0, y = 0, z = 0, ol = 0): THREE.Mesh {
  const m = new THREE.Mesh(G.sph, mat);
  m.scale.set(rx, ry, rz);
  m.castShadow = true;
  if (ol) edge(m, ol);
  return place(p, m, x, y, z);
}
export function ICO(p: THREE.Object3D | null, mat: THREE.Material, r: number, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(G.ico, mat);
  m.scale.setScalar(r);
  m.castShadow = true;
  return place(p, m, x, y, z);
}
/** Cylinder / frustum along Y (rt top radius, rb bottom radius > 0, h height). */
export function C(p: THREE.Object3D | null, mat: THREE.Material, rt: number, rb: number, h: number, x = 0, y = 0, z = 0, ol = 0, seg = 14): THREE.Mesh {
  const m = new THREE.Mesh(cylGeo(rt / rb, seg), mat);
  m.scale.set(rb, h, rb);
  m.castShadow = true;
  if (ol) edge(m, ol);
  return place(p, m, x, y, z);
}

export function rng(seed: number): () => number {
  let a = (Math.floor(seed * 1000) + 0x9e3779b9) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Frame-rate independent smoothing factor. */
export const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);

export interface Wheel { root: THREE.Group; spin: THREE.Group; r: number }
/** Chunky cartoon wheel: tread blocks + star hub so the spin is readable. Axle along X. */
export function makeWheel(r: number, w: number, L: Mats, hub: string): Wheel {
  const root = new THREE.Group();
  const spin = new THREE.Group();
  root.add(spin);
  const tireM = toon(PAL.dark, L);
  const tire = C(spin, tireM, r * 0.9, r * 0.9, w, 0, 0, 0, 0.03, 16);
  tire.rotation.z = Math.PI / 2;
  const blockM = toon('#15152e', L);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const b = B(null, blockM, w * 1.02, r * 0.2, r * 0.36);
    b.position.set(0, Math.cos(a) * r * 0.92, Math.sin(a) * r * 0.92);
    b.rotation.x = -a;
    spin.add(b);
  }
  const hubM = toon(hub, L);
  const cap = C(spin, hubM, r * 0.5, r * 0.5, w * 1.06, 0, 0, 0, 0.02);
  cap.rotation.z = Math.PI / 2;
  const spokeM = toon(PAL.white, L);
  for (let i = 0; i < 3; i++) {
    const s = B(spin, spokeM, w * 1.12, r * 0.14, r * 0.8);
    s.rotation.x = (i / 3) * Math.PI;
  }
  return { root, spin, r };
}
