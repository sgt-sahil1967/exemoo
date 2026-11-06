// Rapids Row - map 2 ("Jungle Temple Run") procedural models. Metres, Y up, models face -Z, base y = 0.
// Cartoon toon look, smooth shading on organics, merged vertex-coloured geometry for cheap draw calls.
import * as THREE from 'three';
import { mergeVertices, mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const V3 = THREE.Vector3;
const INK = 0x1b1b3a;
const PI = Math.PI;

/* ---------------------------------------------------------------- helpers */
function rng(seed = 0) {
  let a = (Math.floor(seed * 1000) + 0x7f4a7c15) >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const hash3 = (x, y, z, s) => { const v = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + s * 4.1414) * 43758.5453; return v - Math.floor(v); };

const gradientMap = (() => {
  const d = new Uint8Array([105, 105, 105, 255, 165, 165, 165, 255, 215, 215, 215, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
  return t;
})();
const matCache = new Map();
function toon(color, o = {}) {
  const key = [color, o.flat ? 1 : 0, o.vc ? 1 : 0, o.emissive || 0, o.side || 0].join('|');
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshToonMaterial({ color: o.vc ? 0xffffff : new THREE.Color(color), gradientMap, vertexColors: !!o.vc, side: o.side || THREE.FrontSide });
    if (o.emissive) m.emissive = new THREE.Color(o.emissive);
    matCache.set(key, m);
  }
  return m;
}
const inkMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
const geoCache = new Map();
function cached(key, fn) { let g = geoCache.get(key); if (!g) { g = fn(); geoCache.set(key, g); } return g; }
function hullGeo(geo, t) {
  return cached(`hull|${geo.uuid}|${t}`, () => {
    let g = geo.clone();
    for (const n of ['normal', 'uv', 'uv1', 'color']) g.deleteAttribute(n);
    if (g.index) g = g.toNonIndexed();
    g = mergeVertices(g, 1e-3);
    g.computeVertexNormals();
    const p = g.attributes.position, n = g.attributes.normal;
    for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + n.getX(i) * t, p.getY(i) + n.getY(i) * t, p.getZ(i) + n.getZ(i) * t);
    return g;
  });
}

/** Collects coloured primitives into one vertex-coloured mesh. */
class Bake {
  constructor() { this.parts = []; }
  addM(geo, color, mtx) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.deleteAttribute('uv');
    g.applyMatrix4(mtx);
    const n = g.attributes.position.count;
    if (color != null || !g.attributes.color) {
      const c = new THREE.Color(color || '#ffffff'), arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
      g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    }
    this.parts.push(g);
    return this;
  }
  add(geo, color, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) {
    return this.addM(geo, color, new THREE.Matrix4().compose(new V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new V3(sx, sy, sz)));
  }
  geometry() { return mergeGeometries(this.parts); }
  mesh({ flat = false, ds = false } = {}) { return new THREE.Mesh(this.geometry(), toon('vc', { vc: true, flat, side: ds ? THREE.DoubleSide : 0 })); }
}
function solid(b, ol = 0.04, opt = {}) {
  const g = new THREE.Group();
  const m = b.mesh(opt); g.add(m);
  if (ol) g.add(new THREE.Mesh(hullGeo(m.geometry, ol), inkMat));
  return g;
}
const S = {
  sph: () => cached('sph', () => new THREE.SphereGeometry(1, 20, 14)),
  sphL: () => cached('sphL', () => new THREE.SphereGeometry(1, 10, 8)),
  cyl: () => cached('cyl', () => new THREE.CylinderGeometry(1, 1, 1, 16)),
  cylL: () => cached('cylL', () => new THREE.CylinderGeometry(1, 1, 1, 8)),
  cone: () => cached('cone', () => new THREE.ConeGeometry(1, 1, 14)),
  box: () => cached('box', () => new THREE.BoxGeometry(1, 1, 1)),
};
const mtx = (x, y, z, q, s) => new THREE.Matrix4().compose(new V3(x, y, z), q || new THREE.Quaternion(), s || new V3(1, 1, 1));
const _Y = new V3(0, 1, 0);
/** cylinder/cone-like unit geo between two points */
function limb(b, geo, color, a, c, r) {
  const d = new V3().subVectors(c, a), l = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(_Y, d.clone().normalize());
  const mid = a.clone().add(c).multiplyScalar(0.5);
  b.addM(geo, color, mtx(mid.x, mid.y, mid.z, q, new V3(r, l, r)));
}
/** lumpy icosphere with vertical colour gradient */
function blobC(radius, jit, seed, cDark, cLight, sy = 1, detail = 2) {
  const g = new THREE.IcosahedronGeometry(radius, detail);
  const p = g.attributes.position, n = p.count, col = new Float32Array(n * 3);
  const a = new THREE.Color(cDark), b2 = new THREE.Color(cLight), c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = 1 + (hash3(Math.round(x * 20), Math.round(y * 20), Math.round(z * 20), seed) - 0.5) * jit;
    p.setXYZ(i, x * k, y * k * sy, z * k);
    c.copy(a).lerp(b2, smooth(-radius * 0.7, radius * 0.8, y * k) * 0.9 + hash3(x * 9, y * 9, z * 9, seed + 1) * 0.1);
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}
function frondGeo(len, wid, droop, segs, c0, c1, zig = true) {
  const pos = [], col = [];
  const A = new THREE.Color(c0), B = new THREE.Color(c1), c = new THREE.Color();
  const P = (i) => {
    const u = i / segs;
    const w = wid * Math.sin(PI * Math.pow(u, 0.65)) * (zig && i % 2 ? 0.5 : 1) + 0.002;
    return { x: u * len, y: len * (0.5 * u - droop * u * u) * 0.8, w, u };
  };
  for (let i = 0; i < segs; i++) {
    const a = P(i), b = P(i + 1);
    const v = [[a.x, a.y, -a.w], [a.x, a.y, a.w], [b.x, b.y, b.w], [a.x, a.y, -a.w], [b.x, b.y, b.w], [b.x, b.y, -b.w]];
    const us = [a.u, a.u, b.u, a.u, b.u, b.u];
    v.forEach((q, k) => { pos.push(...q); c.copy(A).lerp(B, us[k]); col.push(c.r, c.g, c.b); });
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const FONT = "'Lilita One','Baloo 2','Arial Black',Impact,sans-serif";
function strokedText(ctx, text, x, y, size, fill = '#fff') {
  ctx.font = `${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.2; ctx.strokeStyle = '#1b1b3a'; ctx.strokeText(text, x, y);
  ctx.fillStyle = fill; ctx.fillText(text, x, y);
}
/** Extruded wall slab (in the x/y plane, depth along z) with an elliptical arch opening. */
function archSlab(xa, xb, y0, y1, ha, hb, spring, rise, depth) {
  const sh = new THREE.Shape();
  sh.moveTo(xa, y0); sh.lineTo(xb, y0); sh.lineTo(xb, y1); sh.lineTo(xa, y1); sh.lineTo(xa, y0);
  const h = new THREE.Path();
  h.moveTo(ha, y0 + 1); h.lineTo(ha, spring);
  h.absellipse((ha + hb) / 2, spring, (hb - ha) / 2, rise, PI, 0, true, 0);
  h.lineTo(hb, y0 + 1); h.lineTo(ha, y0 + 1);
  sh.holes.push(h);
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 28 });
  g.translate(0, 0, -depth / 2);
  return g;
}
const STONE = '#c9bea0', STONE2 = '#a99f85', STONE3 = '#8a8068', MOSS = '#4fa23a', MOSS2 = '#3a8a30', WOOD = '#9a5f2e', WOOD2 = '#b8763e', ROPE = '#d6b070', RED = '#ff3b30', GOLD = '#ffd21f';

/* ---------------------------------------------------------------- vegetation */
export function makePalm(seed = 0) {
  const r = rng(seed + 3), b = new Bake();
  const H = 7 + r() * 3.5, lean = (r() - 0.5) * 2.6;
  const curve = new THREE.QuadraticBezierCurve3(new V3(0, 0, 0), new V3(lean * 0.12, H * 0.62, 0), new V3(lean, H, 0));
  const N = 11;
  for (let i = 0; i < N; i++) {
    const p0 = curve.getPoint(i / N), p1 = curve.getPoint((i + 1) / N);
    const r0 = lerp(0.36, 0.2, i / N), r1 = lerp(0.36, 0.2, (i + 1) / N);
    const geo = new THREE.CylinderGeometry(r1, r0, 1, 10);
    const d = new V3().subVectors(p1, p0), l = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(_Y, d.normalize());
    const m = p0.clone().add(p1).multiplyScalar(0.5);
    b.addM(geo, i % 2 ? '#a07a4c' : '#8a6438', mtx(m.x, m.y, m.z, q, new V3(1, l * 1.02, 1)));
  }
  b.add(S.cone(), '#7a5530', 0, 0.35, 0, 0, 0, 0, 0.55, 0.9, 0.55);
  const top = curve.getPoint(1);
  const fr = 12;
  for (let k = 0; k < fr; k++) {
    const ang = (k / fr) * PI * 2 + r() * 0.3, pitch = lerp(0.85, -0.35, (k % 3) / 2) + (r() - 0.5) * 0.25;
    const len = 3.6 + r() * 1.3;
    const m = new THREE.Matrix4().makeTranslation(top.x, top.y, top.z)
      .multiply(new THREE.Matrix4().makeRotationY(ang)).multiply(new THREE.Matrix4().makeRotationZ(pitch));
    b.addM(frondGeo(len, 0.62, 1.15, 9, '#1f7a32', k % 2 ? '#52c04a' : '#3fae40'), null, m);
  }
  for (let k = 0; k < 3; k++) b.add(S.sphL(), '#6a4423', top.x + Math.cos(k * 2.1) * 0.3, top.y - 0.35, top.z + Math.sin(k * 2.1) * 0.3, 0, 0, 0, 0.27);
  const g = new THREE.Group(); g.add(b.mesh({ ds: true })); g.rotation.y = r() * 6.28;
  return g;
}

export function makeJungleTree(seed = 0) {
  const r = rng(seed + 17), b = new Bake();
  const H = 6.5 + r() * 2.5, lean = (r() - 0.5) * 1.2;
  for (let i = 0; i < 4; i++) {
    const t0 = i / 4, t1 = (i + 1) / 4;
    limb(b, new THREE.CylinderGeometry(1, 1.15, 1, 10), i % 2 ? '#7a5230' : '#6a4526', new V3(lean * t0, H * t0 * 0.9, 0), new V3(lean * t1, H * t1 * 0.9, 0), lerp(0.75, 0.42, t0));
  }
  for (let k = 0; k < 5; k++) { // buttress roots
    const a = (k / 5) * PI * 2 + r();
    b.add(S.cone(), '#6a4526', Math.cos(a) * 0.85, 0.7, Math.sin(a) * 0.85, Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6, 0.45, 2.0, 0.28);
  }
  const cy = H * 0.9 + 1.2, cx = lean;
  const greens = [['#1d7a2c', '#4bbf48'], ['#238a33', '#58cc50'], ['#1a6e2a', '#3fae40']];
  b.add(blobC(3.1, 0.28, seed, '#17702a', '#4cc04a', 0.8), null, cx, cy + 0.5, 0);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * PI * 2 + r() * 0.6, d = 2.5 + r() * 0.8, gc = greens[k % 3];
    b.add(blobC(1.9 + r() * 0.7, 0.3, seed + k + 1, gc[0], gc[1], 0.8, 1), null, cx + Math.cos(a) * d, cy - 0.2 + r() * 1.2, Math.sin(a) * d);
  }
  for (let k = 0; k < 6; k++) { // hanging vines
    const a = r() * PI * 2, d = 2.6 + r() * 1.2, L = 2.5 + r() * 3.5;
    const x = cx + Math.cos(a) * d, z = Math.sin(a) * d;
    b.add(S.cylL(), '#2a6a2a', x, cy - 0.8 - L / 2, z, 0, 0, 0, 0.04, L, 0.04);
    for (let j = 0; j < 4; j++) b.add(S.sphL(), j % 2 ? '#3fae40' : '#2c8c34', x + (j % 2 ? 0.1 : -0.1), cy - 0.9 - L * (0.2 + j * 0.22), z, 0, 0, 0, 0.17, 0.12, 0.17);
  }
  const g = new THREE.Group(); g.add(b.mesh({ ds: true })); g.rotation.y = r() * 6.28;
  return g;
}

export function makeFern(seed = 0) {
  const r = rng(seed + 9), b = new Bake();
  const n = 9;
  for (let k = 0; k < n; k++) {
    const ang = (k / n) * PI * 2 + r() * 0.4, pitch = 0.95 - r() * 0.5;
    const m = new THREE.Matrix4().makeRotationY(ang).multiply(new THREE.Matrix4().makeTranslation(0.05, 0.1, 0)).multiply(new THREE.Matrix4().makeRotationZ(pitch));
    b.addM(frondGeo(1.8 + r() * 0.8, 0.3, 1.0, 8, '#1c7a30', '#5ccf50'), null, m);
  }
  const g = new THREE.Group(); g.add(b.mesh({ ds: true }));
  return g;
}

/* ---------------------------------------------------------------- static river obstacles */
export function makeTemplePillar(height = 7, seed = 0, broken = false) {
  const r = rng(seed + 31), b = new Bake();
  const h = broken ? height * (0.55 + r() * 0.2) : height;
  b.add(S.box(), STONE3, 0, 0.1, 0, 0, 0, 0, 2.8, 0.9, 2.8);
  b.add(S.cyl(), STONE2, 0, 0.75, 0, 0, 0, 0, 1.45, 0.5, 1.45);
  b.add(new THREE.CylinderGeometry(1, 1.1, 1, 22), STONE, 0, 0.9 + h / 2, 0, 0, 0, 0, 0.98, h - 0.2, 0.98);
  for (let k = 0; k < 14; k++) { // flutes
    const a = (k / 14) * PI * 2;
    b.add(S.cylL(), '#b8ad8f', Math.cos(a) * 1.03, 0.9 + h / 2, Math.sin(a) * 1.03, 0, 0, 0, 0.07, h - 0.4, 0.07);
  }
  for (let k = 0; k < 3; k++) b.add(new THREE.TorusGeometry(1.02, 0.1, 8, 24), k === 1 ? RED : STONE3, 0, 1.3 + (h - 1) * (0.2 + k * 0.32), 0, PI / 2, 0, 0);
  if (!broken) {
    b.add(S.cyl(), STONE2, 0, 0.9 + h - 0.1, 0, 0, 0, 0, 1.35, 0.4, 1.35);
    b.add(S.box(), STONE3, 0, 0.9 + h + 0.25, 0, 0, 0.4, 0, 2.5, 0.5, 2.5);
  } else {
    for (let k = 0; k < 6; k++) { const a = k * 1.05 + r(); b.add(S.cone(), STONE, Math.cos(a) * 0.6, 0.9 + h + 0.15, Math.sin(a) * 0.6, 0, 0, 0, 0.45, 0.7 + r() * 0.6, 0.45); }
  }
  b.add(S.sph(), MOSS, 0, 0.55, 0, 0, 0, 0, 1.6, 0.4, 1.6);
  b.add(S.sph(), MOSS2, 0.3, 0.9 + h * 0.3, 0.95, 0, 0, 0, 0.5, 0.7, 0.2);
  b.add(S.sph(), MOSS2, -0.5, 0.9 + h * 0.62, -0.9, 0, 0, 0, 0.45, 0.6, 0.2);
  return solid(b, 0.05, { flat: false });
}

export function makeFallenColumn(length = 9, seed = 0) {
  const r = rng(seed + 5), b = new Bake();
  const L = length;
  b.add(new THREE.CylinderGeometry(0.85, 0.95, 1, 20), STONE, 0, 0.55, 0, 0, 0, PI / 2, 1, L, 1);
  for (let k = 0; k < 4; k++) b.add(new THREE.TorusGeometry(0.88, 0.1, 8, 22), k === 1 ? RED : STONE3, -L / 2 + L * (0.12 + k * 0.25), 0.55, 0, 0, PI / 2, 0);
  b.add(S.cyl(), STONE2, L / 2 + 0.05, 0.55, 0, 0, 0, PI / 2, 0.98, 0.3, 0.98);
  for (let k = 0; k < 5; k++) b.add(S.cone(), STONE, -L / 2 - 0.1, 0.55 + Math.sin(k * 1.3) * 0.5, Math.cos(k * 1.3) * 0.5, 0, 0, PI / 2, 0.4, 0.7, 0.4);
  b.add(S.sph(), MOSS, -L * 0.1, 1.2, 0.1, 0, 0, 0, 1.6, 0.25, 0.6);
  b.add(S.sph(), MOSS2, L * 0.28, 1.15, -0.2, 0, 0, 0, 1.0, 0.22, 0.5);
  b.add(S.box(), STONE2, -L * 0.3, 0.2, 0.7, 0, 0.3, 0.1, 1.0, 0.5, 0.8);
  const g = solid(b, 0.05);
  g.position.y = 0;
  return g;
}

export function makeStatueHead(seed = 0) {
  const r = rng(seed + 41), b = new Bake();
  const SA = '#c8b98f', SB = '#a89a72';
  b.add(S.box(), STONE3, 0, 0.35, 0, 0, 0, 0, 3.0, 0.8, 3.0);
  b.add(blobC(1.0, 0.04, seed, SB, SA, 1), null, 0, 2.3, 0, 0, 0, 0, 1.45, 1.9, 1.35); // head
  b.add(S.box(), SA, 0, 3.1, 1.15, 0.25, 0, 0, 2.2, 0.45, 0.9); // brow
  b.add(S.box(), SA, 0, 2.35, 1.4, 0.15, 0, 0, 0.55, 1.15, 0.7); // nose
  for (const sx of [-1, 1]) {
    b.add(S.sph(), '#3a3326', sx * 0.7, 2.85, 1.25, 0, 0, 0, 0.32, 0.22, 0.2);
    b.add(S.sph(), GOLD, sx * 0.7, 2.85, 1.38, 0, 0, 0, 0.1);
    b.add(S.sph(), SB, sx * 1.55, 2.3, 0, 0, 0, 0, 0.3, 0.7, 0.45); // ears
  }
  b.add(S.box(), '#3a3326', 0, 1.55, 1.2, 0, 0, 0, 1.2, 0.2, 0.3); // mouth
  for (let k = 0; k < 6; k++) b.add(S.box(), SA, -0.5 + k * 0.2, 1.5, 1.32, 0, 0, 0, 0.14, 0.22, 0.1);
  b.add(new THREE.TorusGeometry(1.3, 0.2, 8, 22), RED, 0, 3.65, 0, PI / 2 - 0.15, 0, 0, 1, 1, 1.4);
  b.add(S.sph(), MOSS, 0, 3.95, -0.1, 0, 0, 0, 1.2, 0.4, 1.0);
  b.add(S.sph(), MOSS2, -0.7, 3.8, 0.3, 0, 0, 0, 0.5, 0.3, 0.4);
  b.add(S.sph(), MOSS, 0.2, 0.9, 1.4, 0, 0, 0, 1.0, 0.3, 0.3);
  const g = solid(b, 0.05);
  g.rotation.y = PI; // faces +Z (oncoming boat); caller adds its own rotation inside a wrapper
  const w = new THREE.Group(); w.add(g);
  return w;
}

/* ---------------------------------------------------------------- moving obstacles */
export function makeCroc() {
  const b = new Bake();
  const GR = '#4e9a3c', GD = '#356f2c', BEL = '#d9d38a';
  const rad = [0.62, 0.74, 0.8, 0.78, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.12];
  rad.forEach((rr, i) => {
    const z = -0.5 + i * 0.42;
    b.add(S.sph(), i % 2 ? GR : '#559f42', 0, 0.3 + rr * 0.15, z, 0, 0, 0, rr, rr * 0.62, 0.5);
    if (i < 9) b.add(S.cone(), GD, 0, 0.3 + rr * 0.15 + rr * 0.62, z, 0, 0, 0, 0.12, 0.28, 0.12);
    if (i < 6) b.add(S.sph(), BEL, 0, 0.28, z, 0, 0, 0, rr * 0.7, rr * 0.3, 0.45);
  });
  b.add(S.sph(), GR, 0, 0.5, -1.0, 0, 0, 0, 0.7, 0.45, 0.8); // head
  b.add(S.sph(), GR, 0, 0.5, -1.65, 0, 0, 0, 0.42, 0.22, 0.78); // upper snout
  b.add(S.sph(), GD, 0, 0.62, -2.35, 0, 0, 0, 0.3, 0.14, 0.2);
  for (const sx of [-1, 1]) {
    b.add(S.sph(), GR, sx * 0.42, 0.88, -1.0, 0, 0, 0, 0.26);
    b.add(S.sph(), '#ffe14a', sx * 0.42, 0.95, -1.15, 0, 0, 0, 0.17);
    b.add(S.sph(), '#1b1b3a', sx * 0.42, 0.95, -1.28, 0, 0, 0, 0.08);
    b.add(S.sph(), '#1b1b3a', sx * 0.1, 0.7, -2.5, 0, 0, 0, 0.05);
    for (let k = 0; k < 5; k++) b.add(S.cone(), '#ffffff', sx * 0.36, 0.34, -1.2 - k * 0.28, PI, 0, 0, 0.045, 0.15, 0.045);
    for (const lz of [-0.2, 1.4]) { // stubby legs
      b.add(S.cyl(), GD, sx * 0.72, 0.18, lz, 0, 0, sx * 0.9, 0.17, 0.5, 0.17);
      b.add(S.sph(), GD, sx * 0.95, 0.06, lz - 0.1, 0, 0, 0, 0.2, 0.08, 0.28);
    }
  }
  b.add(S.cone(), RED, 0, 1.03, -0.75, 0, 0, 0, 0.14, 0.3, 0.14); // danger crest
  b.add(S.cone(), RED, 0, 1.0, -0.4, 0, 0, 0, 0.14, 0.3, 0.14);
  const body = solid(b, 0.04);
  const jb = new Bake();
  jb.add(S.sph(), GR, 0, -0.04, -0.75, 0, 0, 0, 0.36, 0.14, 0.78);
  jb.add(S.sph(), '#ff6f7a', 0, 0.06, -0.7, 0, 0, 0, 0.26, 0.05, 0.6);
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) jb.add(S.cone(), '#ffffff', sx * 0.3, 0.1, -0.35 - k * 0.32, 0, 0, 0, 0.04, 0.14, 0.04);
  const jaw = solid(jb, 0.035);
  const jawPivot = new THREE.Group(); jawPivot.position.set(0, 0.35, -0.85);
  jaw.position.set(0, 0, 0.85); jawPivot.add(jaw);
  const g = new THREE.Group(); g.add(body); g.add(jawPivot);
  g.userData.setSnap = (k) => { jawPivot.rotation.x = -k * 0.62; };
  return g;
}

export function makeBarrel() {
  const pts = [];
  const prof = [[0, -0.62], [0.42, -0.62], [0.55, -0.4], [0.62, -0.1], [0.62, 0.1], [0.55, 0.4], [0.42, 0.62], [0, 0.62]];
  for (const [x, y] of prof) pts.push(new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(pts, 20);
  const g = new THREE.Group();
  const wood = new THREE.Mesh(geo, toon(WOOD2)); g.add(wood);
  g.add(new THREE.Mesh(hullGeo(geo, 0.04), inkMat));
  for (const y of [-0.4, 0.4]) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.56 + (Math.abs(y) < 0.1 ? 0.08 : 0), 0.045, 6, 22), toon('#4a4a5e')); t.rotation.x = PI / 2; t.position.y = y; g.add(t); }
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.636, 0.636, 0.2, 20, 1, true), toon(GOLD, { side: THREE.DoubleSide })); g.add(band);
  const lid = new THREE.Mesh(new THREE.CircleGeometry(0.4, 16), toon(WOOD)); lid.rotation.x = -PI / 2; lid.position.y = 0.625; g.add(lid);
  const root = new THREE.Group(); g.position.y = 0.2; root.add(g);
  return root;
}

export function makeSwingRig({ width = 40, kind = 'A', logLen = 9, rope = 8.6, px = 0, H = 9.6 } = {}) {
  const root = new THREE.Group(), b = new Bake();
  for (const sx of [-1, 1]) {
    const x = sx * width / 2;
    b.add(S.cyl(), '#6a4526', x, (H + 1.2) / 2 - 1.5, 0, 0, 0, 0, 0.62, H + 2.7, 0.62);
    b.add(S.cone(), '#6a4526', x, -0.2, 0, 0, 0, 0, 1.3, 1.6, 1.3);
    b.add(S.sph(), STONE2, x, H + 0.55, 0, 0, 0, 0, 0.95, 0.55, 0.95);
    b.add(S.sph(), MOSS, x, 0.6, 0.5, 0, 0, 0, 0.9, 0.35, 0.7);
    for (let k = 0; k < 3; k++) b.add(S.cylL(), '#2a6a2a', x + 0.6 * (k - 1), H - 0.5 - 1.2 * (k % 2), 0.5, 0, 0, 0, 0.05, 2.0 + k, 0.05);
  }
  b.add(S.cyl(), WOOD, 0, H + 0.4, 0, 0, 0, PI / 2, 0.45, width, 0.45);
  for (let k = 0; k < 6; k++) b.add(new THREE.TorusGeometry(0.46, 0.06, 6, 14), RED, -width * 0.5 + width * (k + 0.5) / 6, H + 0.4, 0, 0, PI / 2, 0);
  b.add(S.box(), '#a94a2a', px, H + 0.4, 0, 0, 0, 0, 0.9, 0.9, 0.9);
  root.add(solid(b, 0.05));
  const pend = new THREE.Group(); pend.position.set(px, H, 0); root.add(pend);
  const lb = new Bake();
  const bark = (i) => (i % 2 ? '#8a5226' : '#9a5f2e');
  if (kind === 'A') {
    lb.add(new THREE.CylinderGeometry(0.68, 0.68, 1, 18), '#9a5f2e', 0, -rope, 0, 0, 0, PI / 2, 1, logLen, 1);
    for (let k = 0; k < 5; k++) lb.add(new THREE.TorusGeometry(0.7, 0.05, 6, 18), k % 2 ? RED : '#f3e6c0', -logLen / 2 + logLen * (k + 0.5) / 5, -rope, 0, 0, PI / 2, 0);
    for (const sx of [-1, 1]) {
      lb.add(S.cyl(), '#f3d8a0', sx * (logLen / 2 + 0.02), -rope, 0, 0, 0, PI / 2, 0.55, 0.06, 0.55);
      limb(lb, S.cylL(), ROPE, new V3(sx * logLen * 0.36, 0, 0), new V3(sx * logLen * 0.36, -rope + 0.3, 0), 0.07);
    }
    for (let k = 0; k < 3; k++) lb.add(S.cone(), RED, -2 + k * 2, -rope + 0.78, 0, PI, 0, 0, 0.18, 0.5, 0.18);
  } else {
    lb.add(new THREE.CylinderGeometry(0.68, 0.68, 1, 18), '#9a5f2e', 0, -rope, 0, PI / 2, 0, 0, 1, logLen, 1);
    for (let k = 0; k < 5; k++) lb.add(new THREE.TorusGeometry(0.7, 0.05, 6, 18), k % 2 ? RED : '#f3e6c0', 0, -rope, -logLen / 2 + logLen * (k + 0.5) / 5, 0, 0, 0);
    for (const sz of [-1, 1]) {
      lb.add(S.cyl(), '#f3d8a0', 0, -rope, sz * (logLen / 2 + 0.02), PI / 2, 0, 0, 0.55, 0.06, 0.55);
      limb(lb, S.cylL(), ROPE, new V3(0, 0, 0), new V3(0, -rope + 0.1, sz * logLen * 0.38), 0.07);
    }
    for (let k = 0; k < 3; k++) lb.add(S.cone(), RED, 0, -rope + 0.78, -2 + k * 2, PI, 0, 0, 0.18, 0.5, 0.18);
  }
  void bark;
  pend.add(solid(lb, 0.04));
  root.userData.setAngle = (a) => { if (kind === 'A') pend.rotation.x = a; else pend.rotation.z = a; };
  root.userData.rope = rope;
  return root;
}

export function makeStoneWheel(R = 4.2) {
  const root = new THREE.Group();
  const sb = new Bake();
  sb.add(S.cyl(), STONE2, 0, 0.9, 0, 0, 0, 0, 1.5, 3.0, 1.5);
  sb.add(S.cyl(), STONE3, 0, -0.4, 0, 0, 0, 0, 2.0, 1.2, 2.0);
  sb.add(S.sph(), MOSS, 0.3, -0.05, 1.2, 0, 0, 0, 1.0, 0.35, 0.7);
  root.add(solid(sb, 0.05));
  const rotor = new THREE.Group(); rotor.position.y = 1.5; root.add(rotor);
  const rb = new Bake();
  rb.add(S.cyl(), GOLD, 0, 0.55, 0, 0, 0, 0, 1.2, 0.35, 1.2);
  rb.add(S.sph(), STONE, 0, 0.95, 0, 0, 0, 0, 0.95, 0.8, 0.95);
  for (let a = 0; a < 4; a++) {
    const ang = a * PI / 2;
    const c = Math.cos(ang), s = Math.sin(ang);
    const armLen = R - 1.0;
    const mx = c * (1.0 + armLen / 2), mz = -s * (1.0 + armLen / 2);
    rb.add(S.box(), a % 2 ? '#c9302a' : '#e8b020', mx, 0.2, mz, 0, ang, 0, armLen, 0.55, 0.7);
    rb.add(S.box(), STONE3, mx, 0.55, mz, 0, ang, 0, armLen * 0.9, 0.12, 0.9);
    // paddle blade at the tip (perpendicular to the arm, taller)
    rb.add(S.box(), a % 2 ? RED : GOLD, c * (R - 0.2), 0.45, -s * (R - 0.2), 0, ang, 0, 0.4, 1.7, 2.3);
    for (let k = 0; k < 3; k++) rb.add(S.cone(), '#ffffff', c * (R + 0.05), 1.2, -s * (R + 0.05) + (k - 1) * 0.8 * c, 0, 0, 0, 0.12, 0.45, 0.12);
  }
  rotor.add(solid(rb, 0.045));
  root.userData.setAngle = (a) => { rotor.rotation.y = a; };
  return root;
}

export function makeLockDoor(len) {
  const b = new Bake();
  b.add(S.box(), STONE, 0, 2.6, 0, 0, 0, 0, len, 6.0, 1.5);
  b.add(S.box(), STONE3, 0, 5.7, 0, 0, 0, 0, len + 0.2, 0.5, 1.8);
  b.add(S.box(), STONE3, 0, -0.2, 0, 0, 0, 0, len + 0.2, 0.6, 1.8);
  const n = Math.max(2, Math.round(len / 3));
  for (let k = 0; k < n; k++) {
    const x = -len / 2 + len * (k + 0.5) / n;
    b.add(S.box(), STONE2, x, 2.8, 0.78, 0, 0, 0, len / n * 0.78, 4.0, 0.12);
    b.add(S.box(), STONE2, x, 2.8, -0.78, 0, 0, 0, len / n * 0.78, 4.0, 0.12);
    b.add(S.box(), RED, x, 2.8, 0.86, 0, 0, PI / 4, 0.9, 0.9, 0.08);
    b.add(S.box(), RED, x, 2.8, -0.86, 0, 0, PI / 4, 0.9, 0.9, 0.08);
    b.add(S.box(), GOLD, x, 2.8, 0.9, 0, 0, PI / 4, 0.4, 0.4, 0.08);
    b.add(S.box(), GOLD, x, 2.8, -0.9, 0, 0, PI / 4, 0.4, 0.4, 0.08);
  }
  for (let k = 0; k < 6; k++) b.add(S.box(), k % 2 ? RED : '#ffffff', -len / 2 + len * (k + 0.5) / 6, 0.3, 0.9, 0, 0, 0, len / 6 * 0.98, 0.5, 0.06);
  return solid(b, 0.05, { flat: true });
}

export function makeLockGate(hw = 14) {
  const root = new THREE.Group();
  const D = hw + 1.5;
  const b = new Bake();
  const TX = hw + 3.6;
  for (const sx of [-1, 1]) {
    b.add(S.box(), STONE, sx * TX, 5.2, 0, 0, 0, 0, 5.2, 12, 5.0);
    b.add(S.box(), STONE3, sx * TX, 11.4, 0, 0, 0, 0, 6.0, 0.8, 5.8);
    b.add(S.box(), STONE3, sx * TX, 0.2, 0, 0, 0, 0, 5.9, 1.2, 5.8);
    for (let k = 0; k < 3; k++) b.add(S.box(), k === 1 ? RED : STONE2, sx * (TX - 2.62), 3 + k * 3.4, 0, 0, 0, 0, 0.18, 0.9, 5.2);
    b.add(S.sph(), MOSS, sx * TX, 12, 0, 0, 0, 0, 2.4, 0.5, 2.2);
    for (let k = 0; k < 3; k++) b.add(S.cylL(), '#2a6a2a', sx * (TX - 2.4) + 0.5 * k, 8 - k, 2.6, 0, 0, 0, 0.05, 4, 0.05);
  }
  b.add(S.box(), STONE2, 0, 11.7, 0, 0, 0, 0, TX * 2, 1.0, 2.0); // overhead lintel (high)
  for (let k = 0; k < 9; k++) b.add(S.box(), k % 2 ? RED : GOLD, -TX + (TX * 2) * (k + 0.5) / 9, 10.9, 1.05, 0, 0, 0, TX * 2 / 9 * 0.9, 0.7, 0.1);
  for (const sx of [-1, 1]) { // wall housings the doors slide into
    b.add(S.box(), STONE, sx * (hw + 1.2 + D / 2), 3.3, 0, 0, 0, 0, D, 6.9, 3.2);
    b.add(S.box(), STONE3, sx * (hw + 1.2 + D / 2), 6.9, 0, 0, 0, 0, D + 0.4, 0.5, 3.6);
    for (let k = 0; k < Math.round(D / 3); k++) b.add(S.box(), k % 2 ? RED : GOLD, sx * (hw + 1.2 + 1.5 + k * 3), 5.6, 1.62, 0, 0, 0, 1.6, 0.6, 0.06);
  }
  root.add(solid(b, 0.05, { flat: true }));
  const lampMat = { L: new THREE.MeshBasicMaterial({ color: 0x33ff55 }), R: new THREE.MeshBasicMaterial({ color: 0x33ff55 }) };
  const halo = [];
  for (const [k, sx] of [['L', -1], ['R', 1]]) {
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.85, 14, 10), lampMat[k]); lamp.position.set(sx * (TX - 2.9), 13.0, 0); root.add(lamp);
    const lamp2 = lamp.clone(); lamp2.position.set(sx * (TX - 2.9), 9.0, 2.6); lamp2.scale.setScalar(0.7); root.add(lamp2);
    const h = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 8), new THREE.MeshBasicMaterial({ color: 0x33ff55, transparent: true, opacity: 0.28, depthWrite: false }));
    h.position.copy(lamp.position); root.add(h); halo.push(h);
  }
  const doorGeoOwner = makeLockDoor(D);
  const dL = doorGeoOwner, dR = makeLockDoor(D);
  root.add(dL); root.add(dR);
  const cols = [new THREE.Color(0x33ff55), new THREE.Color(0xffd21f), new THREE.Color(0xff3b30)];
  root.userData.D = D;
  root.userData.setDoors = (cl, cr, state) => {
    dL.position.set(cl, 0, 0); dR.position.set(cr, 0, 0);
    const c = cols[state];
    lampMat.L.color.copy(c); lampMat.R.color.copy(c);
    for (const h of halo) h.material.color.copy(c);
  };
  root.userData.setDoors(-hw - 2, hw + 2, 0);
  return root;
}

/* ---------------------------------------------------------------- hazards */
let whirlTex = null;
export function makeWhirlpool(r = 4) {
  const g = new THREE.Group();
  if (!whirlTex) {
    whirlTex = canvasTex(512, 512, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const grad = c.createRadialGradient(cx, cy, 10, cx, cy, w / 2);
      grad.addColorStop(0, 'rgba(8,38,92,0.95)'); grad.addColorStop(0.45, 'rgba(18,90,160,0.75)'); grad.addColorStop(0.85, 'rgba(60,170,225,0.4)'); grad.addColorStop(1, 'rgba(60,170,225,0)');
      c.fillStyle = grad; c.beginPath(); c.arc(cx, cy, w / 2, 0, 7); c.fill();
      c.lineCap = 'round';
      for (let a = 0; a < 5; a++) {
        c.beginPath();
        for (let i = 0; i <= 60; i++) {
          const t = i / 60, ang = a * 1.2566 + t * 5.2, rr = 18 + t * (w / 2 - 28);
          const x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr;
          i ? c.lineTo(x, y) : c.moveTo(x, y);
        }
        c.strokeStyle = 'rgba(255,255,255,0.88)'; c.lineWidth = 16; c.stroke();
        c.strokeStyle = 'rgba(160,225,255,0.9)'; c.lineWidth = 6; c.stroke();
      }
    });
  }
  const R = r + 2.2;
  const disc = new THREE.Mesh(new THREE.CircleGeometry(R, 48), new THREE.MeshBasicMaterial({ map: whirlTex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
  disc.rotation.x = -PI / 2; disc.position.y = 0.07; disc.renderOrder = 2;
  g.add(disc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.2, 8, 56), new THREE.MeshBasicMaterial({ color: 0xff3b30 }));
  ring.rotation.x = -PI / 2; ring.position.y = 0.16; g.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(r * 0.72, 0.07, 6, 48), new THREE.MeshBasicMaterial({ color: 0xffd21f }));
  ring2.rotation.x = -PI / 2; ring2.position.y = 0.12; g.add(ring2);
  g.userData.spin = (t) => { disc.rotation.z = -t * 1.8; ring2.rotation.z = t * 0.6; ring.position.y = 0.16 + Math.sin(t * 3) * 0.04; };
  return g;
}

export function makeSpikes(length = 12) {
  const b = new Bake();
  const n = Math.max(3, Math.round(length / 0.95));
  for (let i = 0; i < n; i++) {
    const x = -length / 2 + 0.5 + (length - 1) * i / (n - 1);
    const tilt = 0.5 + (i % 3) * 0.06, h = 2.3 + (i % 2) * 0.35;
    const zr = (i % 2) * 0.35;
    b.add(S.cylL(), '#a07a4c', x, 0.55, zr + 0.3, tilt, 0, 0, 0.14, h * 0.62, 0.14);
    b.add(S.cone(), RED, x, 0.55 + h * 0.62 * Math.cos(tilt) * 0.5 + 0.55, zr + 0.3 + Math.sin(tilt) * (h * 0.31 + 0.3), tilt, 0, 0, 0.19, h * 0.5, 0.19);
    b.add(S.cone(), '#fff3c0', x, 0.55 + h * 0.62 * Math.cos(tilt) * 0.5 + 0.55, zr + 0.3 + Math.sin(tilt) * (h * 0.31 + 0.3), tilt, 0, 0, 0.1, h * 0.52, 0.1);
  }
  for (const y of [0.4, 1.0]) b.add(S.cylL(), '#6a4526', 0, y, 0, 0, 0, PI / 2, 0.1, length, 0.1);
  for (const sx of [-1, 1]) {
    b.add(S.cyl(), '#6a4526', sx * length / 2, 1.5, 0, 0, 0, 0, 0.2, 4.2, 0.2);
    b.add(S.box(), RED, sx * length / 2 - sx * 0.55, 3.3, 0, 0, 0, 0, 1.0, 0.8, 0.05);
    b.add(S.sph(), '#f2ecd8', sx * length / 2, 3.8, 0, 0, 0, 0, 0.3);
  }
  return solid(b, 0.035, { flat: true });
}

export function makeWaterfallEdge(lenS = 40, width = 8) {
  const g = new THREE.Group();
  const tex = canvasTex(256, 512, (c, w, h) => {
    c.fillStyle = '#bfeaff'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 24; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#8fd4f5'; const x = (i / 24) * w; c.fillRect(x, 0, w / 48 + (i % 3) * 3, h); }
    c.fillStyle = 'rgba(255,255,255,0.8)'; for (let j = 0; j < 8; j++) c.fillRect(0, j * 64 + 10, w, 8);
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, 2);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(width, 0.16, lenS), new THREE.MeshBasicMaterial({ map: tex }));
  slab.position.y = 0.1; g.add(slab);
  const b = new Bake();
  for (let i = 0; i < Math.round(lenS / 3); i++) { // rocky lip / teeth along the drop
    const z = -lenS / 2 + 2 + i * 3;
    b.add(S.sph(), STONE3, width / 2 + 0.4, 0.25, z, 0, 0, 0, 0.9, 0.9, 1.1);
    b.add(S.sph(), STONE2, -width / 2 - 0.4, 0.2, z + 1, 0, 0, 0, 0.8, 0.8, 1.0);
  }
  for (let i = 0; i < 6; i++) { // red warning stakes at the upstream edge
    const x = -width / 2 + width * i / 5;
    b.add(S.cyl(), '#6a4526', x, 1.2, lenS / 2 + 0.6, 0, 0, 0, 0.1, 3.0, 0.1);
    b.add(S.box(), i % 2 ? RED : '#ffffff', x, 2.5, lenS / 2 + 0.6, 0, 0, 0, 0.9, 0.7, 0.05);
  }
  g.add(solid(b, 0.03, { flat: true }));
  const mist = [];
  const mm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false });
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mm);
    m.position.set((Math.random() - 0.5) * width, 1.4, -lenS / 2 + (i / 8) * lenS * 0.6);
    m.scale.set(1.6 + (i % 3), 1.0 + (i % 2), 1.6);
    g.add(m); mist.push(m);
  }
  g.userData.update = (t) => { mist.forEach((m, i) => { m.position.y = 1.4 + Math.sin(t * 1.3 + i) * 0.45; m.rotation.y = t * 0.2 + i; }); tex.offset.y = -t * 0.9; };
  return g;
}

export function makeSkullTotem() {
  const b = new Bake();
  b.add(S.box(), '#5a3a1e', 0, 2.0, 0, 0, 0, 0, 0.55, 4.0, 0.55);
  b.add(S.box(), RED, 0, 1.0, 0, 0, 0, 0, 0.62, 0.5, 0.62);
  b.add(S.box(), '#ffffff', 0, 1.5, 0, 0, 0, 0, 0.62, 0.2, 0.62);
  b.add(S.box(), RED, 0, 2.3, 0, 0, 0, 0, 0.62, 0.5, 0.62);
  b.add(S.box(), GOLD, 0, 2.8, 0, 0, 0, 0, 0.62, 0.2, 0.62);
  b.add(S.sph(), '#f4eedb', 0, 4.55, 0, 0, 0, 0, 0.78, 0.7, 0.72);
  b.add(S.box(), '#f4eedb', 0, 3.95, -0.1, 0, 0, 0, 0.7, 0.35, 0.55);
  for (const sx of [-1, 1]) {
    b.add(S.sph(), '#1b1b3a', sx * 0.3, 4.6, -0.55, 0, 0, 0, 0.2, 0.24, 0.18);
    b.add(S.sph(), RED, sx * 0.3, 4.6, -0.68, 0, 0, 0, 0.07);
    b.add(S.cone(), RED, sx * 0.55, 5.1, 0.1, 0, 0, -sx * 0.7, 0.16, 1.1, 0.16); // horns
    b.add(S.cone(), RED, sx * 0.95, 3.6, 0.0, 0, 0, sx * 0.9, 0.55, 1.2, 0.08); // banners
  }
  b.add(S.box(), '#1b1b3a', 0, 4.45, -0.68, 0, 0, 0, 0.1, 0.26, 0.1);
  for (let k = 0; k < 4; k++) b.add(S.box(), '#1b1b3a', -0.24 + k * 0.16, 3.97, -0.4, 0, 0, 0, 0.07, 0.2, 0.06);
  b.add(S.box(), RED, 0, 5.05, 0, 0, 0, 0.8, 0.12, 1.3, 0.12);
  return solid(b, 0.04, { flat: true });
}

/* ---------------------------------------------------------------- bank dressing */
let flameMat = null;
export function makeTorch() {
  const g = new THREE.Group();
  const b = new Bake();
  b.add(S.cylL(), '#6a4526', 0, 1.2, 0, 0, 0, 0, 0.09, 2.4, 0.09);
  b.add(S.cone(), '#3a3a4a', 0, 2.55, 0, PI, 0, 0, 0.3, 0.4, 0.3);
  b.add(S.cyl(), STONE3, 0, 0.1, 0, 0, 0, 0, 0.3, 0.3, 0.3);
  g.add(b.mesh());
  const f = new Bake();
  f.add(S.cone(), '#ff7a1a', 0, 3.0, 0, 0, 0, 0, 0.26, 0.85, 0.26);
  f.add(S.cone(), '#ffd21f', 0, 2.95, 0, 0, 0, 0, 0.15, 0.6, 0.15);
  f.add(S.sph(), '#ffe9a0', 0, 2.85, 0, 0, 0, 0, 0.09);
  flameMat = flameMat || new THREE.MeshBasicMaterial({ vertexColors: true });
  g.add(new THREE.Mesh(f.geometry(), flameMat));
  return g;
}

export function makeStairs(n = 4, width = 4.5, rise = 0.32, run = 0.95) {
  const b = new Bake();
  for (let i = 0; i < n; i++) {
    const top = -i * rise, h = 2.5 + i * rise;
    b.add(S.box(), i % 2 ? STONE : '#d3c8aa', 0, top - h / 2, -i * run - run / 2, 0, 0, 0, width, h, run);
    if (i === 0) b.add(S.box(), STONE3, 0, top + 0.1, run * 0.2, 0, 0, 0, width + 0.8, 0.4, 0.5);
  }
  for (const sx of [-1, 1]) { b.add(S.box(), STONE2, sx * (width / 2 + 0.2), -n * rise / 2 + 0.3, -n * run / 2, 0, 0, 0, 0.45, n * rise + 0.8, n * run + 0.4); }
  b.add(S.sph(), MOSS, -width * 0.2, 0.1, -0.5, 0, 0, 0, 1.2, 0.2, 0.5);
  return solid(b, 0.03, { flat: true });
}

export function makeTempleRuin(seed = 0, kind = 0) {
  const r = rng(seed + 77), b = new Bake();
  if (kind === 0) { // stepped pyramid
    const tiers = 3;
    for (let t = 0; t < tiers; t++) {
      const w = 13 - t * 3.6, h = 2.7;
      b.add(S.box(), t % 2 ? STONE : '#d3c8aa', 0, t * h + h / 2 - 1.2, 0, 0, 0, 0, w, h + 1.2 * (t === 0 ? 1 : 0), w);
      b.add(S.box(), STONE3, 0, t * h + h - 1.2, 0, 0, 0, 0, w + 0.4, 0.3, w + 0.4);
      for (let k = 0; k < 5; k++) b.add(S.sph(), r() > 0.5 ? MOSS : MOSS2, (r() - 0.5) * w * 0.9, t * h + h - 0.95, (r() - 0.5) * w * 0.9, 0, 0, 0, 1.0 + r(), 0.3, 1.0 + r());
    }
    for (let i = 0; i < 9; i++) b.add(S.box(), i % 2 ? STONE : '#d9cfb2', 0, -1.0 + i * 0.9 + 0.45, -6.5 + i * 0.7 + 0.4, 0, 0, 0, 3.4, 0.9, 0.7); // front stairs
    b.add(S.box(), '#2a2418', 0, 8.55, -1.55, 0, 0, 0, 1.6, 2.2, 1.0); // doorway
    b.add(S.box(), STONE3, 0, 9.85, -1.5, 0, 0, 0, 2.6, 0.45, 1.3);
    for (const sx of [-1, 1]) {
      b.add(S.box(), STONE2, sx * 1.35, 8.55, -1.5, 0, 0, 0, 0.5, 2.4, 1.2);
      for (let k = 0; k < 2; k++) { b.add(S.cyl(), STONE, sx * 5.3, 1.5 + k * 0.5, -5.2 + k * 0, 0, 0, 0, 0.7, 3.6 + k, 0.7); }
      b.add(S.cone(), RED, sx * 3.1, 8.4, -2.0, 0, 0, 0, 0.18, 1.6, 0.18);
    }
    b.add(blobC(1.5, 0.3, seed, '#17702a', '#4cc04a', 0.7), null, 1.5, 11.2, 0.8, 0, 0, 0, 1, 1, 1);
    b.add(blobC(1.1, 0.3, seed + 3, '#17702a', '#4cc04a', 0.7), null, -2, 10.9, -0.3, 0, 0, 0, 1, 1, 1);
  } else if (kind === 1) { // broken gate with wall
    for (const sx of [-1, 1]) {
      b.add(S.box(), STONE, sx * 4.2, 3.2, 0, 0, 0, 0, 2.4, 6.4, 2.4);
      b.add(S.box(), STONE3, sx * 4.2, 6.5, 0, 0, 0, 0, 3.0, 0.7, 3.0);
      b.add(S.box(), STONE2, sx * 8.5, 1.6, 0, 0, 0, 0, 7, 3.2 + r() * 1.2, 1.4);
      b.add(S.sph(), MOSS, sx * 8, 3.4, 0, 0, 0, 0, 2.5, 0.4, 0.9);
    }
    b.add(S.box(), STONE2, -1.2, 6.9, 0, 0, 0, 0.12, 6.2, 1.0, 1.5);
    for (let k = 0; k < 4; k++) b.add(S.box(), STONE, (r() - 0.5) * 10, 0.4, 2 + r() * 2, r(), r(), r(), 1.2, 0.9, 1.1);
    b.add(S.cone(), RED, 0, 6.9, 0, 0, 0, 0, 0.15, 0.1, 0.15);
    for (let k = 0; k < 4; k++) b.add(S.cylL(), '#2a6a2a', -3.5 + k * 2.4, 5.5, 1.3, 0, 0, 0, 0.05, 3 + (k % 2), 0.05);
  } else { // wall with niches and a statue
    b.add(S.box(), STONE, 0, 2.0, 0, 0, 0, 0, 12, 4.2, 1.8);
    b.add(S.box(), STONE3, 0, 4.2, 0, 0, 0, 0, 12.4, 0.5, 2.2);
    for (let k = 0; k < 4; k++) {
      b.add(S.box(), '#2a2418', -4.2 + k * 2.8, 2.2, -0.95, 0, 0, 0, 1.4, 2.2, 0.2);
      b.add(S.sph(), '#d9cfb2', -4.2 + k * 2.8, 1.5, -0.95, 0, 0, 0, 0.45, 0.6, 0.35);
      b.add(S.sph(), GOLD, -4.2 + k * 2.8, 2.3, -1.0, 0, 0, 0, 0.18);
    }
    for (const sx of [-1, 1]) b.add(S.box(), STONE2, sx * 6.2, 3.2, 0, 0, 0, 0, 1.6, 6.4, 2.4);
    for (let k = 0; k < 5; k++) b.add(S.sph(), r() > 0.5 ? MOSS : MOSS2, (r() - 0.5) * 11, 4.5, (r() - 0.5) * 1.5, 0, 0, 0, 1.2, 0.3, 0.8);
    for (let k = 0; k < 6; k++) b.add(S.cylL(), '#2a6a2a', -5 + k * 2, 3.0, -1.0, 0, 0, 0, 0.05, 3.5, 0.05);
  }
  return solid(b, 0, { flat: true });
}

export function makeMonkey(seed = 0) {
  const g = new THREE.Group(), b = new Bake();
  const BR = '#8a5a34', TAN = '#e8c08a';
  b.add(S.sph(), BR, 0, 0.55, 0, 0, 0, 0, 0.36, 0.42, 0.32);
  b.add(S.sph(), BR, 0, 1.12, -0.05, 0, 0, 0, 0.3, 0.28, 0.28);
  b.add(S.sph(), TAN, 0, 1.08, -0.27, 0, 0, 0, 0.19, 0.16, 0.12);
  for (const sx of [-1, 1]) {
    b.add(S.sph(), TAN, sx * 0.3, 1.14, -0.02, 0, 0, 0, 0.12, 0.12, 0.05);
    b.add(S.sph(), '#1b1b3a', sx * 0.1, 1.2, -0.3, 0, 0, 0, 0.04);
    b.add(S.sph(), BR, sx * 0.24, 0.1, -0.1, 0, 0, 0, 0.13, 0.1, 0.22);
  }
  const tail = new THREE.CatmullRomCurve3([new V3(0, 0.4, 0.3), new V3(0, 0.3, 0.8), new V3(0, 0.9, 1.0), new V3(0, 1.1, 0.7)]);
  b.addM(new THREE.TubeGeometry(tail, 12, 0.07, 6), BR, new THREE.Matrix4());
  g.add(solid(b, 0.03));
  const ab = new Bake(); ab.add(S.cylL(), BR, 0, 0.35, 0, 0, 0, 0, 0.09, 0.7, 0.09); ab.add(S.sph(), TAN, 0, 0.72, 0, 0, 0, 0, 0.11);
  const arms = [];
  for (const sx of [-1, 1]) { const a = new THREE.Group(); a.position.set(sx * 0.36, 0.8, -0.05); const m = ab.mesh(); m.position.y = -0.7; a.add(m); g.add(a); arms.push(a); }
  g.userData.cheer = (t) => {
    if (!t) { arms[0].rotation.z = arms[1].rotation.z = 0; g.position.y = 0; return; }
    arms[0].rotation.z = 2.6 + Math.sin(t * 9) * 0.5; arms[1].rotation.z = -2.6 - Math.sin(t * 9 + 1) * 0.5;
    g.children[0].position.y = Math.abs(Math.sin(t * 7)) * 0.12;
  };
  g.scale.setScalar(1.2);
  return g;
}

/* ---------------------------------------------------------------- bridges (local x = lateral, deck high enough to row under) */
export function makeRopeBridge(span = 44, deckY = 6.6) {
  const b = new Bake(), half = span / 2, sag = 0.9;
  const yAt = (x) => { const u = (x + half) / span; return deckY - sag * 4 * u * (1 - u); };
  const n = Math.round(span / 0.62);
  for (let i = 0; i <= n; i++) {
    const x = -half + span * i / n;
    b.add(S.box(), i % 2 ? WOOD : WOOD2, x, yAt(x), 0, 0, 0, 0, 0.5, 0.12, 2.6);
  }
  for (const sz of [-1, 1]) {
    const pts = [], top = [];
    for (let i = 0; i <= 14; i++) { const x = -half + span * i / 14; pts.push(new V3(x, yAt(x) - 0.05, sz * 1.25)); top.push(new V3(x, yAt(x) + 1.25, sz * 1.3)); }
    b.addM(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.07, 6), ROPE, new THREE.Matrix4());
    b.addM(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(top), 40, 0.09, 6), ROPE, new THREE.Matrix4());
    for (let i = 1; i < 14; i++) { const x = -half + span * i / 14; b.add(S.cylL(), ROPE, x, yAt(x) + 0.6, sz * 1.27, 0, 0, 0, 0.04, 1.25, 0.04); }
    for (const sx of [-1, 1]) {
      const x = sx * (half + 0.3);
      b.add(S.cyl(), '#6a4526', x, deckY / 2 + 1.0, sz * 1.6, 0, 0, 0, 0.42, deckY + 4.0, 0.42);
      b.add(S.sph(), STONE2, x, deckY + 3.1, sz * 1.6, 0, 0, 0, 0.6, 0.35, 0.6);
      b.add(S.box(), STONE3, x, 0.3, sz * 1.6, 0, 0, 0, 1.6, 2.2, 1.6);
    }
  }
  for (const sx of [-1, 1]) b.add(S.box(), '#6a4526', sx * (half + 0.3), deckY + 2.4, 0, 0, 0, 0, 0.3, 0.3, 3.5);
  for (let k = 0; k < 4; k++) b.add(S.cylL(), '#2a6a2a', -half + 4 + k * 3, yAt(-half) - 1.5, 1.4, 0, 0, 0, 0.04, 2.5, 0.04);
  return solid(b, 0.04, { flat: true });
}

export function makeStoneBridge(span = 52, piers = [-7, 7], deckY = 8.6) {
  const b = new Bake(), half = span / 2, depth = 3.0, PR = 1.6;
  const xs = [-half, ...piers, half];
  const spring = 3.0, rise = 3.3;
  for (let i = 0; i < xs.length - 1; i++) {
    const xa = xs[i], xb = xs[i + 1];
    const ha = i === 0 ? xa + 3.0 : xa + PR, hb = i === xs.length - 2 ? xb - 3.0 : xb - PR;
    b.addM(archSlab(xa, xb, -4, deckY, ha, hb, spring, rise, depth), i % 2 ? STONE : '#d3c8aa', new THREE.Matrix4());
    b.add(S.box(), STONE3, (ha + hb) / 2, spring + rise + 0.05, depth / 2 + 0.05, 0, 0, 0, 1.6, 0.9, 0.3); // keystone
    b.add(S.box(), STONE3, (ha + hb) / 2, spring + rise + 0.05, -depth / 2 - 0.05, 0, 0, 0, 1.6, 0.9, 0.3);
    b.add(S.sph(), MOSS, (ha + hb) / 2 + 2, spring + rise - 0.5, depth / 2 + 0.1, 0, 0, 0, 1.4, 0.3, 0.3);
  }
  b.add(S.box(), STONE3, 0, deckY + 0.15, 0, 0, 0, 0, span + 0.6, 0.35, depth + 0.7);
  for (const sz of [-1, 1]) {
    b.add(S.box(), STONE2, 0, deckY + 0.85, sz * (depth / 2 + 0.2), 0, 0, 0, span + 0.4, 1.0, 0.45);
    for (let i = 0; i <= 10; i++) { const x = -half + span * i / 10; b.add(S.cyl(), STONE, x, deckY + 1.6, sz * (depth / 2 + 0.2), 0, 0, 0, 0.32, 1.1, 0.32); b.add(S.sph(), GOLD, x, deckY + 2.3, sz * (depth / 2 + 0.2), 0, 0, 0, 0.2); }
  }
  for (const px of piers) { // cutwaters + moss at the piers
    b.add(S.cone(), STONE2, px, 1.2, depth / 2 + 0.6, PI / 2, 0, 0, 1.2, 1.4, 1.2);
    b.add(S.cone(), STONE2, px, 1.2, -depth / 2 - 0.6, -PI / 2, 0, 0, 1.2, 1.4, 1.2);
    b.add(S.sph(), MOSS, px, 0.15, 0, 0, 0, 0, 1.9, 0.45, 1.9);
  }
  return solid(b, 0.04, { flat: true });
}

export function makeWoodBridge(span = 40, deckY = 4.9, piles = [-4.5, 4.5]) {
  const b = new Bake(), half = span / 2;
  const n = Math.round(span / 0.8);
  for (let i = 0; i < n; i++) b.add(S.box(), i % 2 ? WOOD : WOOD2, -half + span * (i + 0.5) / n, deckY, 0, 0, 0, 0, span / n * 0.92, 0.22, 3.4);
  for (const sz of [-1.2, 0, 1.2]) b.add(S.box(), '#6a4526', 0, deckY - 0.34, sz, 0, 0, 0, span, 0.3, 0.3);
  for (const x of [...piles, -half + 1.0, half - 1.0]) {
    b.add(S.cyl(), '#6a4526', x, deckY / 2 - 0.6, 1.2, 0, 0, 0, 0.5, deckY + 2.2, 0.5);
    b.add(S.cyl(), '#6a4526', x, deckY / 2 - 0.6, -1.2, 0, 0, 0, 0.5, deckY + 2.2, 0.5);
    b.add(S.box(), '#8a5a30', x, deckY - 0.7, 0, 0, 0, 0, 0.5, 0.4, 3.2);
    b.add(S.sph(), MOSS, x, 0.1, 0, 0, 0, 0, 1.0, 0.25, 1.4);
  }
  for (const sz of [-1.6, 1.6]) {
    b.add(S.box(), WOOD, 0, deckY + 1.0, sz, 0, 0, 0, span, 0.14, 0.14);
    b.add(S.box(), WOOD, 0, deckY + 0.5, sz, 0, 0, 0, span, 0.1, 0.1);
    for (let i = 0; i <= 20; i++) b.add(S.box(), '#6a4526', -half + span * i / 20, deckY + 0.55, sz, 0, 0, 0, 0.16, 1.0, 0.16);
  }
  for (let i = 0; i < 6; i++) { const x = -half + span * (i + 0.5) / 6; b.add(S.cone(), i % 2 ? RED : GOLD, x, deckY + 1.5, 1.6, 0, 0, 0, 0.35, 0.6, 0.05); }
  return solid(b, 0.04, { flat: true });
}

export function makeTempleArchway(width = 28, sign = null) {
  const b = new Bake(), half = width / 2;
  const spring = 5.4, rise = 3.2, top = spring + rise + 1.2;
  b.addM(archSlab(-half - 2.0, half + 2.0, -3, top, -half, half, spring, rise, 2.2), STONE, new THREE.Matrix4());
  b.add(S.box(), STONE3, 0, top + 0.25, 0, 0, 0, 0, width + 4.8, 0.7, 2.8);
  b.add(S.box(), STONE2, 0, top + 0.95, 0, 0, 0, 0, width * 0.5, 0.8, 2.2);
  for (const sx of [-1, 1]) {
    b.add(S.box(), STONE3, sx * (half + 1.0), 0.4, 0, 0, 0, 0, 3.0, 1.0, 3.2);
    b.add(S.cone(), RED, sx * (half + 1.0), top + 1.5, 0, 0, 0, 0, 0.5, 1.8, 0.5);
    b.add(S.sph(), MOSS, sx * (half + 1.0), top + 0.7, 0, 0, 0, 0, 1.8, 0.4, 1.2);
    for (let k = 0; k < 4; k++) b.add(S.box(), k % 2 ? RED : GOLD, sx * (half + 1.0), 1.4 + k * 1.6, 1.12, 0, 0, 0, 1.6, 0.7, 0.08);
    b.add(S.sph(), '#d9cfb2', sx * (half - 0.3), spring + 0.3, 1.2, 0, 0, 0, 0.55, 0.7, 0.45);
  }
  for (let k = 0; k < 9; k++) b.add(S.box(), k % 2 ? RED : GOLD, -half + width * (k + 0.5) / 9, spring + rise + 0.45, 1.15, 0, 0, 0, width / 9 * 0.8, 0.5, 0.08);
  const g = solid(b, 0.05, { flat: true });
  if (sign) {
    const sw = Math.min(width * 0.6, 13), sh = 3.0;
    const tex = canvasTex(1024, Math.round(1024 * sh / sw), (c, w, h) => {
      c.fillStyle = sign === 'FINISH' ? '#c9302a' : '#2a8a4a'; c.fillRect(0, 0, w, h);
      c.fillStyle = sign === 'FINISH' ? '#8e1f1a' : '#1d6a36'; c.fillRect(0, h * 0.6, w, h * 0.4);
      c.lineWidth = 16; c.strokeStyle = '#1b1b3a'; c.strokeRect(8, 8, w - 16, h - 16);
      c.fillStyle = GOLD; for (let i = 0; i < 10; i++) { c.fillRect(30 + i * (w - 60) / 9 - 14, 22, 28, 28); c.fillRect(30 + i * (w - 60) / 9 - 14, h - 50, 28, 28); }
      strokedText(c, sign, w / 2, h * 0.52, h * 0.56, '#fff');
    });
    const edge = toon('#1b1b3a');
    const mat = new THREE.MeshBasicMaterial({ map: tex });
    const board = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, 0.35), [edge, edge, edge, edge, mat, mat]);
    board.position.set(0, spring + rise + 3.4, 0); g.add(board);
    for (const sx of [-1, 1]) { const st = new THREE.Mesh(S.box(), toon(WOOD)); st.scale.set(0.3, 2.2, 0.3); st.position.set(sx * sw * 0.4, spring + rise + 2.2, 0); g.add(st); }
  }
  return g;
}
export const makeTempleArch = (text, width) => makeTempleArchway(width, text);
