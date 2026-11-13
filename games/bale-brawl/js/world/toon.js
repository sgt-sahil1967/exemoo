// Bale Brawl - shared toon helpers: gradient map, cached materials, vertex-colour merging, outlines,
// and small procedural canvas textures. Everything procedural.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const INK = '#1b1b3a';

export const gradientMap = (() => {
  const tones = [70, 150, 215, 255];
  const data = new Uint8Array(tones.length * 4);
  tones.forEach((v, i) => data.set([v, v, v, 255], i * 4));
  const t = new THREE.DataTexture(data, tones.length, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  return t;
})();

const cache = new Map();
/** Cached toon material. opts: { vc, map, side, emissive, transparent, opacity } */
export function toon(color = '#ffffff', opts = {}) {
  const key = `${color}|${opts.vc ? 1 : 0}|${opts.map ? opts.map.uuid : ''}|${opts.side || 0}|${opts.emissive || ''}|${opts.opacity ?? ''}`;
  if (!opts.fresh && cache.has(key)) return cache.get(key);
  const m = new THREE.MeshToonMaterial({
    color: opts.vc ? 0xffffff : new THREE.Color(color), gradientMap, vertexColors: !!opts.vc,
    map: opts.map || null, side: opts.side ?? THREE.FrontSide,
  });
  if (opts.emissive) { m.emissive = new THREE.Color(opts.emissive); m.emissiveIntensity = opts.emissiveIntensity ?? 0.35; }
  if (opts.opacity != null) { m.transparent = true; m.opacity = opts.opacity; }
  if (!opts.fresh) cache.set(key, m);
  return m;
}

export const inkMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });

/** Inverted-hull outline as a child of `mesh` (works for blobby convex shapes). */
export function outline(mesh, k = 0.045) {
  const o = new THREE.Mesh(mesh.geometry, inkMat);
  const s = mesh.geometry.boundingSphere || (mesh.geometry.computeBoundingSphere(), mesh.geometry.boundingSphere);
  const r = Math.max(0.05, s.radius);
  o.scale.setScalar(1 + k / r);
  o.position.copy(s.center).multiplyScalar(-k / r);
  o.castShadow = false; o.receiveShadow = false;
  o.raycast = () => {};
  mesh.add(o);
  return o;
}

/** Paint a geometry with a flat vertex colour (returns a non-indexed-compatible copy). */
export function paint(geo, color) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  const c = new THREE.Color(color);
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'color', 'uv'].includes(k)) g.deleteAttribute(k);
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
  return g;
}

/** Place a geometry: position, rotation (euler xyz), scale. Returns the same geometry. */
export function place(geo, [x = 0, y = 0, z = 0] = [], [rx = 0, ry = 0, rz = 0] = [], s = 1) {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
    Array.isArray(s) ? new THREE.Vector3(...s) : new THREE.Vector3(s, s, s));
  geo.applyMatrix4(m);
  return geo;
}

/** Merge [geometry, colour] pairs into one vertex-coloured geometry. */
export function merged(parts) {
  const geos = parts.map(([g, c]) => paint(g, c));
  const out = mergeGeometries(geos, false);
  geos.forEach((g) => g.dispose());
  out.computeBoundingSphere();
  return out;
}

/** Mesh helper with shadows. */
export function mesh(geo, mat, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast; m.receiveShadow = receive;
  return m;
}

export function canvasTex(w, h, draw, { repeat = null, srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}

export function rng(seed = 1) {
  let a = (seed * 2654435761) >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Straw texture: streaky yellow with two red twine bands across (u runs along the bale). */
export function strawTexture({ bands = true, seed = 3 } = {}) {
  return canvasTex(256, 128, (g, w, h) => {
    const r = rng(seed);
    g.fillStyle = '#f2c45a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      const y = r() * h, x = r() * w, len = 10 + r() * 40;
      const tone = r();
      g.strokeStyle = tone < 0.33 ? '#d9a43c' : tone < 0.66 ? '#ffe08a' : '#e8b54a';
      g.globalAlpha = 0.55 + r() * 0.4;
      g.lineWidth = 1 + r() * 1.5;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y + (r() - 0.5) * 5); g.stroke();
    }
    g.globalAlpha = 1;
    if (bands) {
      for (const bx of [w * 0.28, w * 0.72]) {
        g.fillStyle = '#b8402f'; g.fillRect(bx - 3, 0, 6, h);
        g.fillStyle = '#e8705a'; g.fillRect(bx - 2, 0, 2, h);
      }
    }
  });
}

/** Spiral end of a round bale (top disc). */
export function spiralTexture() {
  return canvasTex(256, 256, (g, w) => {
    const r = rng(11);
    g.fillStyle = '#eebc52'; g.fillRect(0, 0, w, w);
    g.translate(w / 2, w / 2);
    for (let a = 0; a < Math.PI * 2 * 9; a += 0.02) {
      const rr = (a / (Math.PI * 2 * 9)) * w * 0.5;
      g.fillStyle = r() < 0.5 ? '#d29a36' : '#ffe08a';
      g.globalAlpha = 0.6;
      g.fillRect(Math.cos(a) * rr, Math.sin(a) * rr, 2.2, 2.2);
    }
    g.globalAlpha = 1;
  });
}

/** Wood planks texture (v runs along the plank). */
export function woodTexture(seed = 5) {
  return canvasTex(64, 256, (g, w, h) => {
    const r = rng(seed);
    g.fillStyle = '#b8763e'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      g.strokeStyle = r() < 0.5 ? '#9a5f2e' : '#cf8c4f';
      g.globalAlpha = 0.6; g.lineWidth = 1 + r() * 2;
      const x = r() * w;
      g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 6, h * 0.3, x - 6, h * 0.6, x + 2, h); g.stroke();
    }
    g.globalAlpha = 1;
    g.fillStyle = '#6e4220';
    g.beginPath(); g.arc(w * 0.5, h * 0.12, 3, 0, 7); g.arc(w * 0.5, h * 0.88, 3, 0, 7); g.fill();
  });
}

/** Colander: silver with rows of dark holes. */
export function colanderTexture() {
  return canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#d7dde6'; g.fillRect(0, 0, w, h);
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, 'rgba(255,255,255,0.5)'); grd.addColorStop(1, 'rgba(120,130,150,0.35)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a3f55';
    for (let row = 0; row < 5; row++) {
      const y = h * (0.12 + row * 0.15), n = 16;
      for (let k = 0; k < n; k++) { g.beginPath(); g.arc((k + (row % 2) * 0.5) * (w / n), y, 3.2, 0, 7); g.fill(); }
    }
  });
}
