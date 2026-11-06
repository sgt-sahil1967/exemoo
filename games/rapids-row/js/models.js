// Rapids Row - procedural cartoon models (v2: smooth, rounded, PBR-ish). Units: metres, Y up, models face -Z, base at y = 0.
import * as THREE from 'three';
import { mergeVertices, mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const V3 = THREE.Vector3;
const PAL = {
  red: '#ff3b30', yellow: '#ffd21f', blue: '#2f7cff', green: '#2fc65a', grass: '#5fd03a',
  sand: '#f3d58a', wood: '#b8763e', foam: '#ffffff', skin: '#ffd0a0',
};

/* ---------------------------------------------------------------- helpers */
function rng(seed = 0) {
  let a = (Math.floor(seed * 1000) + 0x9e3779b9) >>> 0;
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

/** 3D value noise + fbm (deterministic, position based -> no cracks). */
function vn3(x, y, z, s = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const fx = x - xi, fy = y - yi, fz = z - zi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
  const h = (a, b, c) => hash3(xi + a, yi + b, zi + c, s);
  return lerp(
    lerp(lerp(h(0, 0, 0), h(1, 0, 0), u), lerp(h(0, 1, 0), h(1, 1, 0), u), v),
    lerp(lerp(h(0, 0, 1), h(1, 0, 1), u), lerp(h(0, 1, 1), h(1, 1, 1), u), v), w);
}
function fbm3(x, y, z, s = 0, oct = 3) {
  let a = 0, amp = 1, t = 0, f = 1;
  for (let o = 0; o < oct; o++) { a += vn3(x * f, y * f, z * f, s + o * 3.1) * amp; t += amp; amp *= 0.5; f *= 2.03; }
  return a / t;
}

/** periodic 2D noise for tileable canvas textures */
function pn(x, y, Px, Py, s) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const h = (a, b) => hash3(((a % Px) + Px) % Px, ((b % Py) + Py) % Py, 0, s);
  return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v);
}
function fbmP(u, v, fx, fy, oct, s) {
  let a = 0, amp = 1, t = 0;
  for (let o = 0; o < oct; o++) { const m = 2 ** o; a += pn(u * fx * m, v * fy * m, fx * m, fy * m, s + o * 5) * amp; t += amp; amp *= 0.5; }
  return a / t;
}
function texFromFn(w, h, fn, srgb = false) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 4, p = fn(x / w, y / h);
    img.data[o] = p[0]; img.data[o + 1] = p[1]; img.data[o + 2] = p[2]; img.data[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 4;
  return t;
}
const TEX = {};
const lazy = (k, f) => (TEX[k] ||= f());
/** grey mottled detail (multiplied with colour): leaves, bark, ground */
const texMottle = () => lazy('mottle', () => texFromFn(128, 128, (u, v) => {
  const n = fbmP(u, v, 6, 6, 4, 3), g = Math.round(255 * lerp(0.62, 1.0, smooth(0.25, 0.75, n)));
  return [g, g, g];
}));
/** rock grey with cracks + speckle (triplanar) */
const texRock = () => lazy('rock', () => texFromFn(256, 256, (u, v) => {
  const n = fbmP(u, v, 5, 5, 5, 9), r = 1 - Math.abs(2 * fbmP(u, v, 4, 4, 3, 17) - 1);
  const crack = smooth(0.92, 0.99, r) * 0.2;
  const sp = hash3(Math.floor(u * 256), Math.floor(v * 256), 1, 2) > 0.93 ? 0.08 : 0;
  const g = Math.round(255 * clamp(lerp(0.66, 1.0, n) - crack - sp, 0, 1));
  return [g, g, g];
}));
const texWood = () => lazy('wood', () => texFromFn(256, 256, (u, v) => {
  const P = 6, pi = Math.floor(v * P), pf = v * P - pi;
  const hue = hash3(pi, 3, 1, 4);
  const grain = fbmP(u, v, 3, 70, 4, 7 + pi);
  const wave = Math.sin((v * 180 + fbmP(u, v, 2, 6, 2, 1) * 14) * 1.0) * 0.5 + 0.5;
  let k = 0.82 + 0.22 * hue + (grain - 0.5) * 0.35 + wave * 0.05;
  if (pf < 0.035 || pf > 0.97) k *= 0.62;
  return [Math.round(clamp(k * 232, 0, 255)), Math.round(clamp(k * 158, 0, 255)), Math.round(clamp(k * 92, 0, 255))];
}, true));
/** grey plank/grain luminance map (tinted by vertex colours so painted areas keep their hue) */
const texWoodGrey = () => lazy('woodgrey', () => texFromFn(256, 256, (u, v) => {
  const P = 6, pi = Math.floor(v * P), pf = v * P - pi;
  const grain = fbmP(u, v, 3, 70, 4, 7 + pi);
  let k = 0.86 + 0.12 * hash3(pi, 3, 1, 4) + (grain - 0.5) * 0.3;
  if (pf < 0.035 || pf > 0.97) k *= 0.6;
  const g = Math.round(clamp(k, 0, 1) * 255);
  return [g, g, g];
}));
const texBark = () => lazy('bark', () => texFromFn(128, 256, (u, v) => {
  const n = fbmP(u, v, 18, 2, 4, 5), r = 1 - Math.abs(2 * fbmP(u, v, 14, 3, 2, 8) - 1);
  const k = lerp(0.55, 1.0, smooth(0.2, 0.8, n)) - smooth(0.85, 1, r) * 0.25;
  return [Math.round(k * 165), Math.round(k * 104), Math.round(k * 56)];
}, true));
const texRings = () => lazy('rings', () => texFromFn(128, 128, (u, v) => {
  const dx = u - 0.5, dy = v - 0.5, r = Math.hypot(dx, dy) * 2;
  const w = 0.5 + 0.5 * Math.sin(r * 44 + fbmP(u, v, 4, 4, 2, 2) * 5);
  const k = lerp(0.8, 1.0, w) * (r > 0.93 ? 0.6 : 1);
  return [Math.round(k * 246), Math.round(k * 212), Math.round(k * 150)];
}, true));

/* ------------------------------------------------------------ materials */
const matCache = new Map();
/** Standard / Physical material, cached. o: rough, metal, map, bump, vc, side, emissive, clear */
function std(color, o = {}) {
  const key = [color, o.rough ?? 0.7, o.metal ?? 0, o.map ? o.map.uuid : 0, o.bump ? 1 : 0, o.vc ? 1 : 0, o.side || 0, o.emissive || 0, o.clear || 0, o.tag || ''].join('|');
  let m = matCache.get(key);
  if (!m) {
    const p = {
      color: (o.vc || o.map) ? 0xffffff : new THREE.Color(color), roughness: o.rough ?? 0.7, metalness: o.metal ?? 0,
      vertexColors: !!o.vc, side: o.side || THREE.FrontSide,
    };
    if (o.map) p.map = o.map;
    if (o.bump) { p.bumpMap = o.bump; p.bumpScale = o.bumpScale ?? 1.5; }
    if (o.emissive) { p.emissive = new THREE.Color(o.emissive); p.emissiveIntensity = o.emissiveIntensity ?? 1; }
    if (o.clear) { p.clearcoat = o.clear; p.clearcoatRoughness = 0.25; }
    m = o.clear ? new THREE.MeshPhysicalMaterial(p) : new THREE.MeshStandardMaterial(p);
    matCache.set(key, m);
  }
  return m;
}
const vcMat = (o = {}) => std('vc', { vc: true, ...o });
const foliageMat = () => std('leaf', { vc: true, map: texMottle(), bump: texMottle(), bumpScale: 1.2, rough: 0.82, tag: 'foliage' });

const geoCache = new Map();
function cached(key, fn) { let g = geoCache.get(key); if (!g) { g = fn(); geoCache.set(key, g); } return g; }

/** add mesh to parent (shadow flags on) */
function put(parent, geo, mat, x = 0, y = 0, z = 0, cast = true) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = cast;
  parent.add(m);
  return m;
}
function shadowAll(obj, cast = true, receive = false) {
  obj.traverse((m) => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = receive; } });
  return obj;
}

/**
 * Bake coloured primitives into ONE indexed vertex-coloured mesh (cheap draw calls, instancable).
 * opts: p[x,y,z] r[rx,ry,rz] s[sx,sy,sz] q(Quaternion) uv[su,sv] tint(x,y,z,nx,ny,nz,colour)
 */
class Bake {
  constructor() { this.parts = []; }
  add(geo, color, o = {}) {
    let g = geo.clone();
    for (const n of Object.keys(g.attributes)) if (n !== 'position' && n !== 'normal' && n !== 'uv') g.deleteAttribute(n);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    if (!g.index) g = mergeVertices(g, 1e-5);
    const uv = g.attributes.uv, [su, sv] = o.uv || [1, 1];
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
    const p = o.p || [0, 0, 0], r = o.r || [0, 0, 0], s = o.s || [1, 1, 1];
    const q = o.q || new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0], r[1], r[2]));
    g.applyMatrix4(new THREE.Matrix4().compose(new V3(p[0], p[1], p[2]), q, new V3(s[0], s[1], s[2])));
    const c0 = new THREE.Color(color), c = new THREE.Color(), pos = g.attributes.position, nor = g.attributes.normal, n = pos.count;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      c.copy(c0);
      if (o.tint) o.tint(pos.getX(i), pos.getY(i), pos.getZ(i), nor.getX(i), nor.getY(i), nor.getZ(i), c);
      arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    this.parts.push(g);
    return this;
  }
  geometry() { return mergeGeometries(this.parts); }
  mesh(mat = vcMat({ rough: 0.65 })) { const m = new THREE.Mesh(this.geometry(), mat); m.castShadow = true; return m; }
}
const S = (v) => [v, v, v];

/** Lumpy smooth icosphere (unit radius). Smooth normals, position-hash noise -> no cracks. */
function smoothBlob(detail, amp, seed, freq = 1.3, scl = [1, 1, 1]) {
  return cached(`blob|${detail}|${amp}|${seed}|${freq}|${scl}`, () => {
    let g = new THREE.IcosahedronGeometry(1, detail);
    g.deleteAttribute('normal'); g.deleteAttribute('uv');
    g = mergeVertices(g, 1e-4);
    const p = g.attributes.position, uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const k = 1 + amp * (fbm3(x * freq + seed * 7.1, y * freq + seed * 3.3, z * freq - seed * 5.7, seed, 3) - 0.5) * 2;
      uv[i * 2] = x * 0.5 + 0.5 + y * 0.2; uv[i * 2 + 1] = z * 0.5 + 0.5 + y * 0.4;
      p.setXYZ(i, x * k * scl[0], y * k * scl[1], z * k * scl[2]);
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.computeVertexNormals();
    return g;
  });
}
const unitSphere = () => cached('sph', () => new THREE.SphereGeometry(1, 20, 14));
const unitSphereLo = () => cached('sphLo', () => new THREE.SphereGeometry(1, 12, 8));
const unitSphereMin = () => cached('sphMin', () => new THREE.SphereGeometry(1, 8, 6));
const unitSphereHi = () => cached('sphHi', () => new THREE.SphereGeometry(1, 28, 20));
const unitCyl = () => cached('cyl', () => new THREE.CylinderGeometry(1, 1, 1, 16));
const unitCone = () => cached('cone', () => new THREE.ConeGeometry(1, 1, 16));
const unitIco = () => cached('ico1', () => new THREE.IcosahedronGeometry(1, 1));

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
const FONT = "'Lilita One','Baloo 2','Arial Black',Impact,sans-serif";
function strokedText(ctx, text, x, y, size, fill = '#fff') {
  ctx.font = `${size}px ${FONT}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.2; ctx.strokeStyle = '#1b1b3a';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill; ctx.fillText(text, x, y);
}
function checker(ctx, x, y, w, h, n, a = '#fff', b = '#1b1b3a') {
  const s = h;
  const cols = Math.ceil(w / s);
  for (let i = 0; i < cols; i++) for (let j = 0; j < n; j++) {
    ctx.fillStyle = (i + j) % 2 ? a : b;
    ctx.fillRect(x + i * s, y + j * (h / n), s, h / n);
  }
}
/** soft radial blob texture (alpha) for fake shadow / foam decals */
function softTex(inner, outer, ring = false) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  if (ring) { gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.62, 'rgba(255,255,255,0)'); gr.addColorStop(0.8, inner); gr.addColorStop(1, outer); }
  else { gr.addColorStop(0, inner); gr.addColorStop(0.55, inner.replace(/[\d.]+\)$/, '0.6)')); gr.addColorStop(1, outer); }
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* ---------------------------------------------------------------- boat */
const HULL_L = 5.2, HULL_N = 48, HULL_M = 20;
/** hull cross-section point. inner=true -> inside surface */
function hullP(i, j, inner) {
  const N = HULL_N, M = HULL_M, L = HULL_L;
  const u = (i / N) * 2 - 1, au = Math.abs(u);
  const w = 0.6 * Math.pow(Math.max(0, 1 - u * u), 0.5);
  const yt = 0.45 + 0.55 * Math.pow(au, 3.2), yb = -0.14 + 0.62 * Math.pow(au, 2.4);
  const th = Math.PI * j / M, d = yt - yb;
  let x = w * Math.cos(th), y = yt - d * Math.pow(Math.sin(th), 0.8);
  if (inner) { x *= 0.9; y = (y - yt) * 0.86 + yt - 0.03; }
  return [x, y, u * L / 2];
}
function buildHull(inner, colors) {
  const N = HULL_N, M = HULL_M;
  const vc = (N + 1) * (M + 1), pos = new Float32Array(vc * 3), uv = new Float32Array(vc * 2), col = new Float32Array(vc * 3);
  const cR = new THREE.Color(colors[1]), cL = new THREE.Color(colors[0]);
  const wO = new THREE.Color('#e7a862'), wI = new THREE.Color('#c58547'), cr = new THREE.Color('#fff0cf');
  const idx = [];
  for (let i = 0; i <= N; i++) for (let j = 0; j <= M; j++) {
    const k = i * (M + 1) + j, p = hullP(i, j, inner);
    pos.set(p, k * 3);
    uv[k * 2] = (i / N) * 2.6; uv[k * 2 + 1] = j / M * 1.1;
    let c = inner ? [wI.r, wI.g, wI.b] : [wO.r, wO.g, wO.b];
    if (!inner) { const jj = Math.min(j, M - j); if (jj >= 2 && jj <= 8) c = j < M / 2 ? [cR.r, cR.g, cR.b] : [cL.r, cL.g, cL.b]; else if (jj < 2) c = [cr.r, cr.g, cr.b]; }
    col.set(c, k * 3);
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const a = i * (M + 1) + j, b = a + (M + 1), c = b + 1, d = a + 1;
    idx.push(a, b, c, a, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
function tubeThrough(pts, closed, r, tub, rad) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed, 'centripetal'), tub, r, rad, closed);
}

function limbGeo() { return cached('limb', () => new THREE.CylinderGeometry(0.075, 0.065, 1, 14).translate(0, 0.5, 0)); }
const Y_AXIS = new V3(0, 1, 0);
const _d = new V3();
function placeLimb(mesh, from, to, len) {
  _d.subVectors(to, from);
  const l = len ?? _d.length();
  if (l < 1e-5) return;
  _d.divideScalar(_d.length());
  mesh.position.copy(from);
  mesh.quaternion.setFromUnitVectors(Y_AXIS, _d);
  mesh.scale.set(1, l, 1);
}

/** leaf-shaped paddle blade (extruded, bevelled), origin at tip, +Y toward grip */
function bladeGeo() {
  return cached('blade2', () => {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.bezierCurveTo(0.13, 0.0, 0.17, 0.2, 0.15, 0.4);
    sh.bezierCurveTo(0.14, 0.5, 0.06, 0.58, 0.03, 0.62);
    sh.lineTo(-0.03, 0.62);
    sh.bezierCurveTo(-0.06, 0.58, -0.14, 0.5, -0.15, 0.4);
    sh.bezierCurveTo(-0.17, 0.2, -0.13, 0.0, 0, 0);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.014, bevelSize: 0.014, bevelSegments: 2, curveSegments: 8 });
    g.translate(0, 0.014, -0.01);
    // gentle spoon curvature
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + p.getX(i) * p.getX(i) * 0.9);
    g.computeVertexNormals();
    return g;
  });
}

export function makeBoat({ colors = ['#ff3b30', '#2f7cff'] } = {}) {
  const group = new THREE.Group();
  const hullRoot = new THREE.Group();
  group.add(hullRoot);
  const woodMap = texWood();
  const woodMat = std('woodmat', { map: woodMap, rough: 0.55, tag: 'wood' });

  // fake contact shadow + waterline foam ring (cheap, always visible on the water)
  const shTex = cached('tex-shadow', () => softTex('rgba(0,25,60,0.55)', 'rgba(0,25,60,0)'));
  const foTex = cached('tex-foam', () => softTex('rgba(255,255,255,0.85)', 'rgba(255,255,255,0)', true));
  const decalMat = (map, op) => new THREE.MeshBasicMaterial({ map, transparent: true, opacity: op, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), decalMat(shTex, 0.6));
  shadow.scale.set(2.6, 1, 6.6); shadow.position.y = 0.14; shadow.renderOrder = 2;
  const foamMat = decalMat(foTex, 0.7);
  const foamRing = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), foamMat);
  foamRing.scale.set(1.9, 1, 6.0); foamRing.position.y = 0.15; foamRing.renderOrder = 3;
  group.add(shadow, foamRing);

  // hull: smooth lofted outer + inner shell, painted gunwale stripe (vertex colours) over wood grain
  const hullG = buildHull(false, colors);
  const hull = new THREE.Mesh(hullG, std('hull', { vc: true, map: texWoodGrey(), bump: texWoodGrey(), bumpScale: 0.8, rough: 0.4, clear: 0.5, tag: 'hull' }));
  hull.castShadow = true; hullRoot.add(hull);
  const liner = new THREE.Mesh(buildHull(true, colors), std('liner', { vc: true, map: texWoodGrey(), rough: 0.75, side: THREE.BackSide, tag: 'liner' }));
  liner.receiveShadow = true; hullRoot.add(liner);
  // gunwale rail
  const rimPts = [];
  for (let i = 0; i <= HULL_N; i++) { const a = hullP(i, 0), b = hullP(i, 0, true); rimPts.push(new V3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.012, a[2])); }
  for (let i = HULL_N - 1; i >= 1; i--) { const a = hullP(i, HULL_M), b = hullP(i, HULL_M, true); rimPts.push(new V3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.012, a[2])); }
  put(hullRoot, tubeThrough(rimPts, true, 0.062, 110, 8), std('rail', { map: woodMap, rough: 0.35, clear: 0.3, tag: 'rail' }));
  // ribs
  const ribMat = std('rib', { map: woodMap, rough: 0.7, tag: 'rib' });
  for (let i = 6; i <= HULL_N - 6; i += 6) {
    const pts = [];
    for (let j = 1; j <= HULL_M - 1; j += 2) { const p = hullP(i, j, true); pts.push(new V3(p[0] * 0.97, p[1] + 0.025, p[2])); }
    put(hullRoot, tubeThrough(pts, false, 0.028, 14, 5), ribMat, 0, 0, 0, false);
  }
  // keel strip + floor boards
  put(hullRoot, new RoundedBoxGeometry(0.34, 0.03, 3.9, 2, 0.012), ribMat, 0, -0.04, 0, false);
  // bow / stern ornaments
  for (const [z, c] of [[-HULL_L / 2, PAL.yellow], [HULL_L / 2, PAL.yellow]]) {
    const o = put(hullRoot, unitSphere(), std(c, { rough: 0.35, clear: 0.6 }), 0, 0.99, z * 0.995); o.scale.set(0.1, 0.1, 0.1);
  }
  // thwarts
  const SEAT = [-0.85, 0.95];
  const seatG = new RoundedBoxGeometry(1.14, 0.07, 0.34, 2, 0.03);
  for (const z of SEAT) {
    put(hullRoot, seatG, woodMat, 0, 0.27, z);
    for (const sx of [-0.52, 0.52]) put(hullRoot, new RoundedBoxGeometry(0.06, 0.2, 0.3, 2, 0.02), woodMat, sx, 0.18, z, false);
  }

  const rowers = [];
  const skin = std(PAL.skin, { rough: 0.55, tag: 'skin' });
  for (let side = 0; side < 2; side++) {
    const sgn = side === 0 ? -1 : 1;
    const color = colors[side];
    const seatZ = SEAT[side];
    const root = new THREE.Group();
    root.position.set(0, 0.34, seatZ);
    hullRoot.add(root);
    const torso = new THREE.Group();
    root.add(torso);
    // life vest
    const tb = new Bake();
    tb.add(cached('torso2', () => new THREE.CapsuleGeometry(0.27, 0.3, 8, 24)), color, { p: [0, 0.3, 0], s: [1, 1, 0.85], tint: (x, y, z, nx, ny, nz, c) => { c.multiplyScalar(0.82 + 0.25 * smooth(-0.1, 0.8, y)); } });
    tb.add(new THREE.TorusGeometry(0.17, 0.065, 8, 24), PAL.yellow, { p: [0, 0.74, 0.0], r: [Math.PI / 2 - 0.15, 0, 0], s: [1, 1.1, 1.3] });       // collar
    tb.add(unitCyl(), PAL.skin, { p: [0, 0.8, 0], s: [0.075, 0.16, 0.075] });  // neck
    tb.add(new THREE.TorusGeometry(0.27, 0.03, 6, 28), PAL.yellow, { p: [0, 0.05, 0], r: [Math.PI / 2, 0, 0], s: [1, 0.85, 1] });  // belt
    for (const sx of [-0.13, 0.13]) tb.add(new RoundedBoxGeometry(0.075, 0.56, 0.035, 1, 0.012), '#ffffff', { p: [sx, 0.38, -0.225], r: [0.0, 0, sx > 0 ? -0.13 : 0.13] });  // straps
    tb.add(new RoundedBoxGeometry(0.34, 0.06, 0.035, 1, 0.012), '#ffffff', { p: [0, 0.3, -0.235] });
    tb.add(new RoundedBoxGeometry(0.07, 0.08, 0.04, 1, 0.012), PAL.yellow, { p: [0, 0.3, -0.25] }); // buckle
    for (const sx of [-1, 1]) tb.add(unitSphereMin(), color, { p: [sx * 0.3, 0.6, 0], s: S(0.115) });  // shoulders
    const torsoMesh = tb.mesh(vcMat({ rough: 0.6 }));
    torso.add(torsoMesh);

    // head
    const head = new THREE.Group();
    head.position.set(0, 1.0, 0);
    torso.add(head);
    const hb = new Bake();
    hb.add(new THREE.SphereGeometry(1, 26, 18), PAL.skin, { s: [0.26, 0.27, 0.26] });
    for (const ex of [-1, 1]) {
      hb.add(unitSphereMin(), PAL.skin, { p: [ex * 0.255, -0.01, 0.0], s: [0.035, 0.07, 0.055] });                  // ears
      hb.add(unitSphereMin(), '#ffb48a', { p: [ex * 0.262, -0.01, 0.0], s: [0.02, 0.045, 0.035] });
      hb.add(unitSphereLo(), '#ffffff', { p: [ex * 0.095, 0.0, -0.222], s: [0.055, 0.07, 0.04] });               // eye white
      hb.add(unitSphereLo(), '#1b1b3a', { p: [ex * 0.095, -0.004, -0.253], s: [0.04, 0.052, 0.022] });              // pupil
      hb.add(unitSphereMin(), '#ffffff', { p: [ex * 0.095 + 0.013, 0.018, -0.272], s: S(0.012) });                 // glint
      hb.add(unitSphereMin(), '#ff8aa0', { p: [ex * 0.165, -0.085, -0.19], s: [0.05, 0.034, 0.02] });             // cheek
      hb.add(new THREE.CapsuleGeometry(0.012, 0.06, 4, 8), '#5a3a22', { p: [ex * 0.1, 0.085, -0.235], r: [0, 0, Math.PI / 2 + ex * 0.15] });   // brow
    }
    hb.add(unitSphereMin(), '#ffb48a', { p: [0, -0.045, -0.262], s: S(0.045) });                                    // nose
    hb.add(new THREE.TorusGeometry(0.06, 0.011, 6, 18, Math.PI), '#7a2a2a', { p: [0, -0.105, -0.235], r: [0, 0, Math.PI] });  // smile
    head.add(hb.mesh(vcMat({ rough: 0.5 })));
    const helmGeo = cached('helm2', () => new THREE.SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI * 0.56));
    const helmB = new Bake();
    helmB.add(helmGeo, color, { p: [0, 0.015, 0], s: S(0.295) });
    helmB.add(new THREE.TorusGeometry(0.288, 0.02, 6, 28), color, { p: [0, -0.03, 0], r: [Math.PI / 2, 0, 0] });
    helmB.add(new RoundedBoxGeometry(0.36, 0.035, 0.2, 2, 0.015), color, { p: [0, 0.02, -0.285], r: [-0.18, 0, 0] });   // peak
    for (const a of [Math.PI / 2, Math.PI * 1.5]) helmB.add(new THREE.SphereGeometry(1, 3, 12, a - 0.1, 0.2, 0, Math.PI * 0.53), '#ffffff', { p: [0, 0.015, 0], s: S(0.299) });
    helmB.add(new THREE.SphereGeometry(1, 8, 6), '#ffffff', { p: [0, 0.31, 0], s: [0.03, 0.025, 0.03] });
    const helmet = helmB.mesh(vcMat({ rough: 0.3, clear: 0.7, tag: 'helm' }));
    head.add(helmet);
    // legs
    const legB = new Bake();
    for (const lx of [-0.15, 0.15]) {
      legB.add(cached('leg2', () => new THREE.CapsuleGeometry(0.1, 0.5, 5, 12)), '#2f3e8f', { p: [lx, 0.02, -0.5], r: [Math.PI / 2, 0, 0] });
      legB.add(unitSphereLo(), '#1b1b3a', { p: [lx, -0.02, -0.93], s: [0.11, 0.09, 0.17] });
    }
    root.add(legB.mesh(vcMat({ rough: 0.65 })));
    // arms
    const arms = [];
    const sleeve = std(color, { rough: 0.6, tag: 'sleeve' });
    for (let a = 0; a < 2; a++) {
      const s1 = put(hullRoot, limbGeo(), sleeve, 0, 0, 0, false), s2 = put(hullRoot, limbGeo(), skin, 0, 0, 0, false);
      const hand = put(hullRoot, unitSphereLo(), skin, 0, 0, 0, false); hand.scale.setScalar(0.1);
      const thumb = new THREE.Mesh(unitSphereLo(), skin); thumb.position.set(0.55, 0.35, -0.5); thumb.scale.setScalar(0.5); hand.add(thumb);
      const elbow = put(hullRoot, unitSphereLo(), sleeve, 0, 0, 0, false); elbow.scale.setScalar(0.085);
      arms.push({ s1, s2, hand, elbow });
    }
    // paddle (origin = blade tip, +Y toward grip)
    const paddle = new THREE.Group();
    const shaftMat = std('shaft', { map: woodMap, rough: 0.4, tag: 'shaft' });
    put(paddle, new THREE.CylinderGeometry(0.03, 0.034, 1.3, 14), shaftMat, 0, 1.2, 0, false);
    put(paddle, new THREE.CapsuleGeometry(0.035, 0.26, 6, 12).rotateZ(Math.PI / 2), shaftMat, 0, 1.86, 0, false);   // T grip
    put(paddle, new THREE.CylinderGeometry(0.036, 0.046, 0.12, 14), shaftMat, 0, 0.58, 0, false);
    const blade = put(paddle, bladeGeo(), std(color, { rough: 0.35, clear: 0.6, tag: 'blade' }), 0, 0, 0, false);
    put(blade, new RoundedBoxGeometry(0.1, 0.3, 0.012, 2, 0.005), std('#ffffff', { rough: 0.4 }), 0, 0.3, 0.045, false);  // stripe
    hullRoot.add(paddle);
    rowers.push({ sgn, seatZ, root, torso, head, arms, paddle, tip: new V3(sgn, 0, seatZ), phase: 0, power: 0, reverse: false, bobPhase: side * 1.7 });
  }
  const tmpTip = new V3(), tmpDir = new V3(), tmpSh = new V3(), tmpHand = new V3(), tmpPole = new V3(), tmpMid = new V3(), tmpPerp = new V3(), tmpEl = new V3(), tmpN = new V3();
  const qDir = new THREE.Quaternion(), qRoll = new THREE.Quaternion();

  function solveArm(arm, shoulder, hand, outwardSgn) {
    const l = 0.5;
    tmpN.subVectors(hand, shoulder);
    const d = tmpN.length();
    tmpN.divideScalar(Math.max(d, 1e-5));
    tmpMid.copy(shoulder).addScaledVector(tmpN, d / 2);
    if (d >= 2 * l) tmpEl.copy(tmpMid);
    else {
      const h = Math.sqrt(l * l - (d / 2) * (d / 2));
      tmpPole.set(outwardSgn * 0.7, -0.8, 0.25);
      tmpPerp.copy(tmpPole).addScaledVector(tmpN, -tmpPole.dot(tmpN)).normalize();
      tmpEl.copy(tmpMid).addScaledVector(tmpPerp, h);
    }
    placeLimb(arm.s1, shoulder, tmpEl);
    placeLimb(arm.s2, tmpEl, hand);
    arm.elbow.position.copy(tmpEl);
    arm.hand.position.copy(hand);
  }

  function setPaddle(side, phase, power = 0, reverse = false) {
    const r = rowers[side ? 1 : 0];
    r.phase = phase; r.power = power; r.reverse = reverse;
    const sgn = r.sgn;
    let p = ((phase % 1) + 1) % 1;
    if (reverse) p = 1 - p;
    const k = smooth(0.02, 0.3, power);
    const amp = 0.55 + 0.45 * power;
    let f, w, arc = 0;
    if (p < 0.08) { f = 0; w = smooth(0, 1, p / 0.08); }
    else if (p < 0.55) { const u = (p - 0.08) / 0.47; f = u * (0.85 + 0.15 * u); w = 1; }
    else if (p < 0.65) { f = 1; w = 1 - smooth(0, 1, (p - 0.55) / 0.1); }
    else { const u = (p - 0.65) / 0.35; f = 1 - smooth(0, 1, u); w = 0; arc = Math.sin(Math.PI * u) * 0.28; }
    const waterY = -0.38 - 0.2 * power, airY = 0.42;
    const sx = sgn * (lerp(1.18, 0.98, w) - 0.06 * f * w);
    const sy = lerp(airY, waterY, w) + arc;
    const sz = r.seatZ - 0.15 + (f - 0.5) * 2 * 1.0 * amp;
    const idleY = -0.12 + Math.sin(performance.now() * 0.002 + r.bobPhase) * 0.02;
    tmpTip.set(lerp(sgn * 1.05, sx, k), lerp(idleY, sy, k), lerp(r.seatZ - 0.15, sz, k));
    r.tip.copy(tmpTip);
    const lean = lerp(-0.12, lerp(-0.5 * amp, 0.14, f), k);
    r.torso.rotation.x = lean;
    r.torso.rotation.z = -sgn * 0.1 * w * k;
    r.torso.rotation.y = sgn * 0.12 * (1 - f) * k;
    r.torso.updateMatrix();
    const hip = r.root.position;
    const anchor = tmpSh.set(sgn * 0.45, 1.05, r.seatZ - 0.05);
    tmpDir.subVectors(anchor, tmpTip);
    tmpDir.y = Math.max(tmpDir.y, 0.6);
    tmpDir.normalize();
    qDir.setFromUnitVectors(Y_AXIS, tmpDir);
    const roll = (1 - w) * k * (Math.PI / 2) * sgn;
    qRoll.setFromAxisAngle(Y_AXIS, roll);
    r.paddle.quaternion.copy(qDir).multiply(qRoll);
    r.paddle.position.copy(tmpTip);
    for (let a = 0; a < 2; a++) {
      const shx = (a === 0 ? -1 : 1) * 0.3;
      tmpSh.set(shx, 0.6, 0).applyQuaternion(r.torso.quaternion).add(hip);
      const lower = (a === 0 ? -1 : 1) === sgn;
      tmpHand.copy(tmpTip).addScaledVector(tmpDir, lower ? 0.95 : 1.55);
      solveArm(r.arms[a], tmpSh, tmpHand, a === 0 ? -1 : 1);
    }
  }

  function setLean(x) {
    hullRoot.rotation.z = -clamp(x, -1, 1) * 0.13;
  }

  let time = 0;
  function update(dt) {
    time += dt;
    for (const r of rowers) {
      r.head.position.y = 1.0 + Math.sin(time * 2.2 + r.bobPhase) * 0.02;
      r.head.rotation.z = Math.sin(time * 1.3 + r.bobPhase) * 0.06;
      r.head.rotation.x = Math.sin(time * 1.7 + r.bobPhase * 2) * 0.04 - r.torso.rotation.x * 0.6;
    }
    hullRoot.position.y = Math.sin(time * 1.6) * 0.012;
    foamMat.opacity = 0.55 + 0.15 * Math.sin(time * 3.1);
    foamRing.scale.x = 1.9 + 0.06 * Math.sin(time * 2.3);
  }

  const _t = new V3();
  function paddleTip(side) {
    hullRoot.updateWorldMatrix(true, false);
    return _t.copy(rowers[side ? 1 : 0].tip).applyMatrix4(hullRoot.matrixWorld).clone();
  }

  setPaddle(0, 0, 0, false); setPaddle(1, 0, 0, false);
  return { group, setPaddle, setLean, update, paddleTip };
}

/* ---------------------------------------------------------------- obstacles */
function rockMaterial() {
  return lazy('rockmat', () => {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, metalness: 0 });
    const tex = texRock();
    m.onBeforeCompile = (sh) => {
      sh.uniforms.tTri = { value: tex };
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vOP; varying vec3 vON;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvOP = position; vON = normal;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform sampler2D tTri; varying vec3 vOP; varying vec3 vON;')
        .replace('#include <map_fragment>', `#include <map_fragment>
          vec3 bw = pow(abs(normalize(vON)), vec3(4.0)); bw /= (bw.x + bw.y + bw.z);
          float tx = texture2D(tTri, vOP.yz * 1.1).r * bw.x + texture2D(tTri, vOP.xz * 1.1).r * bw.y + texture2D(tTri, vOP.xy * 1.1).r * bw.z;
          diffuseColor.rgb *= tx;`);
    };
    return m;
  });
}

export function makeRock(seed = 0, size = 1) {
  const r = rng(seed);
  const baseCol = new THREE.Color(r() > 0.5 ? '#8d93ad' : '#a1927f'), mossy = r() > 0.45;
  const sx = 1 + r() * 0.3, sz = 0.9 + r() * 0.3, sh = Math.floor(seed * 1000);
  const g = cached(`rock|${seed}`, () => {
    let gg = new THREE.IcosahedronGeometry(1, 6);
    gg.deleteAttribute('normal'); gg.deleteAttribute('uv');
    gg = mergeVertices(gg, 1e-4);
    const p = gg.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const big = fbm3(x * 1.1 + sh, y * 1.1, z * 1.1 - sh, 1, 3) - 0.5;
      const ridge = 1 - Math.abs(2 * vn3(x * 2.6, y * 2.6 + sh, z * 2.6, 5) - 1);
      const fine = fbm3(x * 6, y * 6, z * 6 + sh, 7, 2) - 0.5;
      const k = 1 + big * 0.7 + ridge * 0.14 + fine * 0.07;
      p.setXYZ(i, x * k * sx, Math.max(y * k * 0.78, -0.42), z * k * sz);
    }
    gg.computeVertexNormals();
    const n = gg.attributes.normal, col = new Float32Array(p.count * 3), top = baseCol.clone().lerp(new THREE.Color('#d3d8ea'), 0.4);
    const moss = new THREE.Color('#5fd03a'), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i), ny = n.getY(i);
      c.copy(baseCol).lerp(top, smooth(-0.2, 0.8, y));
      c.multiplyScalar(0.8 + 0.3 * fbm3(p.getX(i) * 3, y * 3, p.getZ(i) * 3, 11, 2));
      if (mossy) c.lerp(moss, smooth(0.6, 0.78, ny + (fbm3(p.getX(i) * 2.4, 0, p.getZ(i) * 2.4, 4, 3) - 0.5) * 0.5) * 0.92);
      col.set([c.r, c.g, c.b], i * 3);
    }
    gg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return gg;
  });
  const grp = new THREE.Group();
  const m = new THREE.Mesh(g, rockMaterial());
  m.castShadow = true; m.receiveShadow = true;
  grp.add(m);
  grp.scale.setScalar(size);
  grp.position.y = 0.12 * size;
  grp.rotation.y = r() * Math.PI * 2;
  const wrap = new THREE.Group(); wrap.add(grp);
  return wrap;
}

export function makeLog(length = 5) {
  const grp = new THREE.Group();
  const rad = 0.5;
  const geo = cached(`log${length}`, () => {
    const g = new THREE.CylinderGeometry(rad, rad, length, 28, Math.max(8, Math.round(length * 3)));
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), rr = Math.hypot(x, z);
      if (rr < 1e-4) continue;
      const a = Math.atan2(z, x);
      const k = 1 + (fbm3(Math.cos(a) * 2.2, y * 0.9, Math.sin(a) * 2.2, 3, 3) - 0.5) * 0.16 + (Math.abs(y) > length / 2 - 0.02 ? 0 : 0);
      const bulge = 1 - 0.06 * Math.pow(Math.abs(y) / (length / 2), 6) * 0; // keep ends exact
      p.setXYZ(i, x * k * bulge, y, z * k * bulge);
    }
    g.computeVertexNormals();
    g.rotateZ(Math.PI / 2);
    return g;
  });
  const bark = std('bark', { map: texBark(), bump: texBark(), bumpScale: 2.5, rough: 0.9, tag: 'logbark' });
  const cap = std('cap', { map: texRings(), rough: 0.8, tag: 'logcap' });
  const m = new THREE.Mesh(geo, [bark, cap, cap]);
  m.position.y = 0.12; m.castShadow = true; m.receiveShadow = true;
  grp.add(m);
  // branch stubs
  const r = rng(length * 7);
  const stub = new THREE.CylinderGeometry(0.09, 0.15, 0.34, 12).translate(0, 0.17, 0);
  for (let i = 0; i < 2; i++) {
    const st = put(grp, stub, bark, (r() - 0.5) * length * 0.6, 0.5, (r() - 0.5) * 0.2);
    st.rotation.z = (r() - 0.5) * 0.7; st.rotation.x = (r() - 0.5) * 0.5;
    put(st, new THREE.CircleGeometry(0.09, 12).rotateX(-Math.PI / 2), cap, 0, 0.341, 0, false);
  }
  return grp;
}

export function makeBuoy(color = '#ff3b30') {
  const grp = new THREE.Group();
  const c0 = new THREE.Color(color), white = new THREE.Color('#ffffff');
  const geo = cached(`buoy|${color}`, () => {
    const pts = [[0, 0], [0.3, 0.0], [0.4, 0.1], [0.43, 0.3], [0.4, 0.55], [0.33, 0.72], [0.24, 0.84], [0.17, 0.92], [0.12, 0.98], [0, 1.0]].map(([x, y]) => new THREE.Vector2(x, y));
    const g = new THREE.LatheGeometry(pts, 32);
    const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i), band = Math.floor(y * 4.2 + 0.3) % 2;
      c.copy(band ? white : c0).multiplyScalar(0.85 + 0.15 * y);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  });
  const body = new THREE.Mesh(geo, std('buoyvc', { vc: true, rough: 0.35, clear: 0.5 }));
  body.position.y = -0.05; body.castShadow = true;
  grp.add(body);
  put(grp, new THREE.TorusGeometry(0.42, 0.05, 10, 32).rotateX(Math.PI / 2), std('#ffffff', { rough: 0.4 }), 0, 0.2, 0);
  put(grp, new THREE.CylinderGeometry(0.03, 0.04, 0.5, 10), std('#1b1b3a'), 0, 1.2, 0);
  const lamp = put(grp, unitSphereHi(), std(PAL.yellow, { emissive: 0xffa000, emissiveIntensity: 0.9, rough: 0.2 }), 0, 1.5, 0); lamp.scale.setScalar(0.17);
  return grp;
}

/* ---------------------------------------------------------------- vegetation */
const _tc = new THREE.Color();
const ao = (y0, y1, lo = 0.72, hi = 1.12) => (x, y, z, nx, ny, nz, c) => { c.multiplyScalar(lerp(lo, hi, smooth(y0, y1, y))); };
const jitterCol = (seed, amt = 0.14) => (x, y, z, nx, ny, nz, c) => { c.multiplyScalar(1 + (fbm3(x * 2.2, y * 2.2, z * 2.2, seed, 2) - 0.5) * amt * 2); };
const chain = (...fs) => (x, y, z, nx, ny, nz, c) => { for (const f of fs) f(x, y, z, nx, ny, nz, c); };
const lowerVC = (x, y, z, nx, ny, nz, c) => { c.multiplyScalar(0.85 + 0.15 * ny); };
function trunkGeo(rt, rb, h, bend = 0, rs = 12, hs = 8) {
  const g = new THREE.CylinderGeometry(rt, rb, h, rs, hs, true);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const t = (p.getY(i) + h / 2) / h; p.setX(i, p.getX(i) + bend * t * t); }
  g.computeVertexNormals();
  return g;
}
const barkTint = (seed, dark = 0.7) => (x, y, z, nx, ny, nz, c) => {
  const a = Math.atan2(z, x); c.multiplyScalar(lerp(dark, 1.1, fbm3(Math.cos(a) * 1.6 + seed, y * 0.8, Math.sin(a) * 1.6, 5, 2)));
};

export function makeTree(kind = 'round', seed = 0) {
  const r = rng(seed + 11);
  const b = new Bake();
  const s = 0.9 + r() * 0.5;
  if (kind === 'pine') {
    const gc = ['#27a348', '#33b856', '#45cc67'];
    b.add(trunkGeo(0.12, 0.3, 4.6, 0.1, 10, 6), '#7a4a26', { p: [0, 2.3, 0], uv: [3, 3], tint: barkTint(seed) });
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + r() * 0.5; b.add(new THREE.ConeGeometry(0.12, 0.7, 6, 1), '#6b4020', { p: [Math.cos(a) * 0.36, 0.12, Math.sin(a) * 0.36], q: new THREE.Quaternion().setFromUnitVectors(Y_AXIS, new V3(Math.cos(a), -0.25, Math.sin(a)).normalize()), uv: [2, 2] }); }
    const prof = [[0, 1.0], [0.12, 0.86], [0.3, 0.63], [0.55, 0.37], [0.82, 0.13], [1.0, 0.0], [0.9, -0.08], [0.55, -0.05], [0, 0.0]].map(([x, y]) => new THREE.Vector2(x, y));
    const layer = cached('pineLayer', () => {
      const g = new THREE.LatheGeometry(prof, 18);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), rr = Math.hypot(x, z), a = Math.atan2(z, x); const k = 1 + 0.07 * Math.cos(a * 7) * rr * rr; p.setX(i, x * k); p.setZ(i, z * k); }
      return g;
    });
    for (let i = 0; i < 5; i++) {
      const R = 1.7 - i * 0.3, h = 1.65 - i * 0.07, y0 = 0.95 + i * 0.85;
      b.add(layer, gc[i % 3], { p: [0, y0, 0], r: [0, r() * 6, 0], s: [R, h, R], uv: [2, 2], tint: chain(ao(y0 - 0.05, y0 + h, 0.8, 1.12), jitterCol(seed + i, 0.08)) });
    }
  } else if (kind === 'birch') {
    b.add(trunkGeo(0.085, 0.16, 3.7, 0.18, 10, 10), '#f4efe4', {
      p: [0, 1.85, 0], uv: [3, 3],
      tint: (x, y, z, nx, ny, nz, c) => { const a = Math.atan2(z, x); const m = vn3(Math.cos(a) * 1.5 + 3, y * 5.5, Math.sin(a) * 1.5, 2); if (m > 0.68) c.lerp(new THREE.Color('#2e2e3c'), smooth(0.68, 0.74, m)); else c.multiplyScalar(0.92 + 0.1 * vn3(x * 5, y * 3, z * 5, 1)); },
    });
    for (let i = 0; i < 4; i++) { const a = r() * 6.28; b.add(trunkGeo(0.03, 0.05, 0.9, 0, 6, 1), '#f0ebe0', { p: [Math.cos(a) * 0.3 + 0.1, 2.6 + i * 0.3, Math.sin(a) * 0.3], r: [Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9] }); }
    const cs = ['#8be05a', '#9be86a', '#7ad84a', '#a4ee74'];
    for (let i = 0; i < 6; i++) {
      const a = r() * 6.28, d = 0.35 + r() * 0.35, y = 3.5 + r() * 1.3, rad = 0.65 + r() * 0.25;
      b.add(smoothBlob(3, 0.2, seed + i, 1.5), cs[i % 4], { p: [Math.cos(a) * d + 0.15, y, Math.sin(a) * d], s: [rad, rad * 0.9, rad], uv: [3, 3], tint: chain(ao(2.8, 5.2, 0.78, 1.12), jitterCol(seed + 30 + i, 0.07)) });
    }
  } else {
    b.add(trunkGeo(0.17, 0.3, 2.3, 0.0, 12, 6), '#8a5a2e', { p: [0, 1.1, 0], uv: [3, 3], tint: barkTint(seed) });
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + r() * 0.6; b.add(new THREE.ConeGeometry(0.14, 0.8, 7, 1), '#7c4f28', { p: [Math.cos(a) * 0.36, 0.14, Math.sin(a) * 0.36], q: new THREE.Quaternion().setFromUnitVectors(Y_AXIS, new V3(Math.cos(a), -0.3, Math.sin(a)).normalize()), uv: [2, 2] }); }
    b.add(trunkGeo(0.07, 0.11, 1.1, 0.2, 7, 2), '#8a5a2e', { p: [0.1, 2.5, 0], r: [0, 0, -0.6] });
    const cs = ['#3fc84a', '#4fd857', '#33b440', '#5fe05a'];
    const big = (p, rad, i, scl) => b.add(smoothBlob(i === 0 ? 4 : 3, 0.2, seed + i, 1.3, scl), cs[i % 4], { p, s: S(rad), uv: [3, 3], tint: chain(ao(1.9, 5.0, 0.6, 1.16), jitterCol(seed + i, 0.07)) });
    big([0, 3.2, 0], 1.55, 0, [1, 0.92, 1]);
    for (let i = 0; i < 5; i++) { const a = i * 1.26 + r() * 0.4, d = 1.0 + r() * 0.2; big([Math.cos(a) * d, 2.6 + r() * 0.9, Math.sin(a) * d], 0.85 + r() * 0.2, i + 1, [1, 0.9, 1]); }
    big([0, 4.1, 0], 0.9, 7, [1, 0.9, 1]);
  }
  const mesh = b.mesh(foliageMat());
  const g = new THREE.Group();
  g.add(mesh);
  g.scale.setScalar(s);
  g.rotation.y = r() * 6.28;
  return g;
}

export function makeBush(seed = 0) {
  const r = rng(seed + 5);
  const b = new Bake();
  const cs = ['#3fc84a', '#4fd857', '#35b848', '#5de060'];
  const n = 4 + Math.floor(r() * 2);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 6.28 + r(), d = i === 0 ? 0 : 0.5 + r() * 0.2, rad = 0.55 + r() * 0.3;
    b.add(smoothBlob(3, 0.18, seed + i, 1.6), cs[i % 4], { p: [Math.cos(a) * d, rad * 0.6, Math.sin(a) * d], s: [rad, rad * 0.8, rad], uv: [3, 3], tint: chain(ao(0, 1.1, 0.62, 1.12), jitterCol(seed + i, 0.08)) });
  }
  if (r() > 0.45) {
    const flower = r() > 0.5 ? '#ff6a8a' : '#ffd21f';
    for (let i = 0; i < 6; i++) {
      const a = r() * 6.28, h = 0.4 + r() * 0.5, d = 0.6 + r() * 0.25;
      b.add(new THREE.IcosahedronGeometry(1, 1), flower, { p: [Math.cos(a) * d, h, Math.sin(a) * d], s: S(0.085) });
      b.add(new THREE.IcosahedronGeometry(1, 0), '#fff3a0', { p: [Math.cos(a) * d, h + 0.05, Math.sin(a) * d], s: S(0.04) });
    }
  }
  const g = new THREE.Group();
  g.add(b.mesh(foliageMat()));
  g.rotation.y = r() * 6.28;
  return g;
}

export function makeReeds(seed = 0) {
  const r = rng(seed + 21);
  const b = new Bake();
  const blade = cached('blade_r2', () => {
    const g = new THREE.CylinderGeometry(0.004, 0.04, 1, 5, 5, true);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const t = p.getY(i) + 0.5; p.setX(i, p.getX(i) + t * t * 0.18); p.setZ(i, p.getZ(i) * (1 - 0.0)); }
    g.computeVertexNormals();
    return g;
  });
  const gs = ['#4fbd2e', '#6fd24a', '#3da526'];
  const n = 12;
  const tintBlade = (x, y, z, nx, ny, nz, c) => { c.multiplyScalar(0.7 + 0.4 * clamp(y / 1.4, 0, 1)); };
  for (let i = 0; i < n; i++) {
    const a = r() * 6.28, d = r() * 0.45, h = 1.0 + r() * 0.9, tilt = (r() - 0.5) * 0.5;
    b.add(blade, gs[i % 3], { p: [Math.cos(a) * d, h / 2, Math.sin(a) * d], r: [(r() - 0.5) * 0.4, r() * 6, tilt], s: [1, h, 1], tint: tintBlade });
    if (i % 4 === 0) b.add(new THREE.CapsuleGeometry(0.05, 0.14, 4, 8), '#7a4a26', { p: [Math.cos(a) * d + tilt * -h * 0.5 + 0.1, h + 0.02, Math.sin(a) * d], r: [0, 0, tilt] });
  }
  const g = new THREE.Group();
  g.add(b.mesh(vcMat({ rough: 0.75, side: THREE.DoubleSide, tag: 'reed' })));
  return g;
}

/* ---------------------------------------------------------------- cow */
export function makeCow(seed = 0) {
  const r = rng(seed + 31);
  const group = new THREE.Group();
  const patchColor = new THREE.Color(r() > 0.35 ? '#2b2b3b' : '#a0612f');
  const WHITE = new THREE.Color('#fffdf6');
  const pk = (x, y, z, nx, ny, nz, c) => { // smooth blotches
    const n = fbm3(x * 1.7 + seed * 3.7, y * 1.7, z * 1.7 - seed, 9, 3);
    c.lerp(patchColor, smooth(0.52, 0.545, n));
  };
  const cowMat = vcMat({ rough: 0.7, clear: 0.15, tag: 'cow' });

  const bodyRoot = new THREE.Group();
  group.add(bodyRoot);
  const bb = new Bake();
  bb.add(cached('cowbody2', () => new THREE.CapsuleGeometry(0.46, 0.8, 10, 28).rotateX(Math.PI / 2)), WHITE, { p: [0, 0.92, 0.05], s: [1, 0.95, 1], tint: pk });
  const legG = new THREE.CylinderGeometry(0.125, 0.1, 1, 10);
  for (const lx of [-0.26, 0.26]) for (const lz of [-0.5, 0.6]) {
    bb.add(legG, WHITE, { p: [lx, 0.32, lz], s: [1, 0.62, 1], tint: (x, y, z, nx, ny, nz, c) => { c.multiplyScalar(0.93 + 0.07 * y); } });
    bb.add(unitCyl(), '#2b2b3b', { p: [lx, 0.07, lz], s: [0.1, 0.14, 0.1] });
    bb.add(unitSphereLo(), '#2b2b3b', { p: [lx, 0.14, lz], s: [0.1, 0.03, 0.1] });
  }
  bb.add(unitSphere(), '#ffb3c1', { p: [0, 0.52, 0.62], s: [0.2, 0.15, 0.22] });
  for (const tx of [-0.07, 0.07]) bb.add(unitSphereLo(), '#ff94a8', { p: [tx, 0.4, 0.66], s: S(0.04) });
  bodyRoot.add(bb.mesh(cowMat));

  const head = new THREE.Group();
  head.position.set(0, 1.12, -0.95);
  group.add(head);
  const hb = new Bake();
  hb.add(unitSphereHi(), WHITE, { p: [0, 0.1, -0.05], s: [0.34, 0.32, 0.36], tint: (x, y, z, nx, ny, nz, c) => { if (x > 0.05 && y > 0.18) c.lerp(patchColor, smooth(0.05, 0.12, x) * 0.95); } });
  hb.add(unitSphere(), '#ffb3c1', { p: [0, -0.02, -0.34], s: [0.24, 0.17, 0.17] });
  for (const nx of [-0.08, 0.08]) hb.add(unitSphereLo(), '#7a2e3e', { p: [nx, -0.02, -0.5], s: [0.03, 0.04, 0.02] });
  for (const ex of [-0.19, 0.19]) {
    hb.add(unitSphere(), '#ffffff', { p: [ex, 0.16, -0.25], s: [0.085, 0.1, 0.055] });
    hb.add(unitSphereLo(), '#2b2b3b', { p: [ex * 1.04, 0.16, -0.285], s: [0.05, 0.065, 0.03] });
    hb.add(unitSphereLo(), '#ffffff', { p: [ex * 1.04 + 0.015, 0.185, -0.309], s: S(0.014) });
    hb.add(unitSphere(), '#ffffff', { p: [ex * 1.9, 0.2, 0.0], s: [0.2, 0.09, 0.12] });
    hb.add(unitSphereLo(), '#ffb3c1', { p: [ex * 1.9, 0.2, -0.03], s: [0.15, 0.06, 0.08] });
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -ex * 1.6));
    hb.add(new THREE.ConeGeometry(1, 1, 12), '#fff0c4', { p: [ex * 0.8, 0.46, 0.0], q, s: [0.07, 0.22, 0.07] });
  }
  hb.add(unitSphereLo(), '#d9a066', { p: [0, 0.4, -0.05], s: [0.1, 0.07, 0.1] });
  head.add(hb.mesh(cowMat));

  const tail = new THREE.Group();
  tail.position.set(0, 1.25, 0.95);
  group.add(tail);
  const tb = new Bake();
  tb.add(new THREE.CylinderGeometry(1, 1, 1, 8), WHITE, { p: [0, -0.3, 0.05], r: [-0.2, 0, 0], s: [0.035, 0.6, 0.035] });
  tb.add(unitSphereLo(), '#2b2b3b', { p: [0, -0.64, 0.12], s: [0.08, 0.14, 0.08] });
  tail.add(tb.mesh(cowMat));

  group.userData.cheer = (t) => {
    const hop = Math.abs(Math.sin(t * 7 + seed)) * 0.22;
    group.position.y = hop;
    bodyRoot.rotation.z = Math.sin(t * 7 + seed) * 0.04;
    head.rotation.x = 0.55 + Math.sin(t * 7 + seed) * 0.15;
    head.rotation.z = Math.sin(t * 3.5 + seed) * 0.15;
    head.position.y = 1.12 + 0.05;
    tail.rotation.z = Math.sin(t * 14) * 0.7;
  };
  group.userData.rest = () => {
    group.position.y = 0; bodyRoot.rotation.z = 0; head.rotation.set(0, 0, 0); head.position.y = 1.12; tail.rotation.z = 0;
  };
  return group;
}

export function makeCoin() {
  const geo = cached('coin2', () => {
    const R = 0.4, t = 0.05, f = 0.012;
    const prof = [[0, t - f], [R - 0.1, t - f], [R - 0.085, t], [R - 0.035, t], [R - 0.008, t * 0.65], [R, 0.0], [R - 0.008, -t * 0.65], [R - 0.035, -t], [R - 0.085, -t], [R - 0.1, -(t - f)], [0, -(t - f)]].map(([x, y]) => new THREE.Vector2(x, y));
    const disc = new THREE.LatheGeometry(prof, 40).rotateX(Math.PI / 2);
    const star = new THREE.Shape();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5 + Math.PI, rr = i % 2 ? 0.095 : 0.21; star[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr); }
    star.closePath();
    const sg = new THREE.ExtrudeGeometry(star, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.012, bevelSegments: 2 });
    const sf = sg.clone().translate(0, 0, t - f - 0.004), sb = sg.clone().rotateY(Math.PI).translate(0, 0, -(t - f - 0.004));
    const b = new Bake();
    b.add(disc, '#ffb000', { tint: (x, y, z, nx, ny, nz, c) => { const rr = Math.hypot(x, y); if (rr > 0.28) c.lerp(new THREE.Color('#ffd84a'), 0.7); } });
    b.add(sf, '#fff1a0'); b.add(sb, '#fff1a0');
    return b.geometry();
  });
  const m = new THREE.Mesh(geo, std('coinvc', { vc: true, rough: 0.28, metal: 0.45, emissive: 0x7a4a00, emissiveIntensity: 0.55, clear: 0.4 }));
  m.castShadow = false;
  return m; // centered at origin, face toward +/-Z; caller rotates about Y
}

/* ---------------------------------------------------------------- arch & gates */
function pennants(width, y, sag, count, size = 0.55) {
  const b = new Bake();
  const cs = ['#ff3b30', '#ffd21f', '#2f7cff', '#2fc65a'];
  const px = (t) => (t - 0.5) * width, py = (t) => y - sag * 4 * t * (1 - t);
  for (let i = 0; i < count; i++) {
    const t0 = (i + 0.15) / count, t1 = (i + 0.85) / count, mid = (t0 + t1) / 2;
    const g = new THREE.BufferGeometry();
    const wv = 0.06 * Math.sin(i * 1.7);
    g.setAttribute('position', new THREE.Float32BufferAttribute([px(t0), py(t0), 0, px(t1), py(t1), 0, px(mid), py(mid) - size, wv, px(t0), py(t0), 0, px(mid), py(mid) - size, wv, px(t1), py(t1), 0], 3));
    g.computeVertexNormals();
    b.add(g, cs[i % 4]);
  }
  const m = b.mesh(vcMat({ rough: 0.7, side: THREE.DoubleSide, tag: 'bunting' }));
  m.castShadow = false;
  return m;
}

function ropeBetween(x0, x1, y, sag, r = 0.04, color = '#1b1b3a') {
  const pts = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new V3(lerp(x0, x1, t), y - sag * 4 * t * (1 - t), 0)); }
  return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, r, 8), std(color, { rough: 0.6 }));
}

export function makeArch(text = 'START', width = 24) {
  const isFinish = /finish/i.test(text);
  const g = new THREE.Group();
  const H = 8.2;
  const postTex = canvasTex(64, 64, (c) => {
    if (isFinish) { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? '#fff' : '#1b1b3a'; c.fillRect(i * 32, j * 32, 32, 32); } }
    else { c.fillStyle = '#fff'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#2fc65a'; c.fillRect(0, 0, 64, 32); }
  });
  postTex.wrapS = postTex.wrapT = THREE.RepeatWrapping;
  postTex.repeat.set(isFinish ? 4 : 1, isFinish ? 12 : 8);
  const postMat = new THREE.MeshStandardMaterial({ map: postTex, roughness: 0.45, metalness: 0 });
  const postProf = [[0, -0.75], [1.1, -0.75], [1.1, -0.3], [0.62, -0.05], [0.5, 0.2], [0.5, H - 1.2], [0.58, H - 0.95], [0.5, H - 0.7], [0, H - 0.7]].map(([x, y]) => new THREE.Vector2(x, y));
  const postGeo = new THREE.LatheGeometry(postProf, 28);
  for (const sx of [-1, 1]) {
    put(g, postGeo, postMat, sx * width / 2, 0, 0);
    const cap = put(g, unitSphereHi(), std(isFinish ? '#1b1b3a' : PAL.yellow, { rough: 0.3, clear: 0.6 }), sx * width / 2, H - 0.05, 0);
    cap.scale.setScalar(0.75);
    put(g, new THREE.CylinderGeometry(0.95, 1.1, 0.9, 24), std(PAL.wood, { map: texWood(), rough: 0.6, tag: 'archfoot' }), sx * width / 2, 0.1, 0);
  }
  const beamTex = postTex.clone(); beamTex.needsUpdate = true;
  beamTex.repeat.set(isFinish ? 12 : 3, 1);
  const beamMat = isFinish ? new THREE.MeshStandardMaterial({ map: beamTex, roughness: 0.5 }) : std(PAL.wood, { map: texWood(), rough: 0.55, tag: 'archbeam' });
  const beam = put(g, new RoundedBoxGeometry(width + 1.2, 0.8, 0.8, 4, 0.18), beamMat, 0, 5.6, 0);
  void beam;
  const sw = Math.min(width * 0.62, 15), sh = 3.2;
  const tex = canvasTex(1024, Math.round(1024 * sh / sw), (c, w, h) => {
    c.fillStyle = isFinish ? '#ff3b30' : '#2fc65a';
    c.fillRect(0, 0, w, h);
    c.fillStyle = isFinish ? '#c81f17' : '#1f9e43';
    c.fillRect(0, h * 0.55, w, h * 0.45);
    if (isFinish) { checker(c, 0, 0, w, h * 0.16, 2); checker(c, 0, h * 0.84, w, h * 0.16, 2); }
    else { c.fillStyle = '#fff'; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(30 + i * ((w - 60) / 11), h * 0.1, 10, 0, 7); c.fill(); c.beginPath(); c.arc(30 + i * ((w - 60) / 11), h * 0.9, 10, 0, 7); c.fill(); } }
    c.lineWidth = 14; c.strokeStyle = '#1b1b3a'; c.strokeRect(7, 7, w - 14, h - 14);
    strokedText(c, text, w / 2, h * 0.53, h * 0.55, '#fff');
  });
  // emissive-ish sign so it stays readable regardless of light direction
  const signMat = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.55, roughness: 0.5 });
  const edge = std('#1b1b3a', { rough: 0.5 });
  const sign = new THREE.Mesh(new RoundedBoxGeometry(sw, sh, 0.3, 3, 0.08), [edge, edge, edge, edge, signMat, signMat]);
  sign.position.set(0, 7.5, 0); sign.castShadow = true;
  g.add(sign);
  for (const sx of [-1, 1]) put(g, new RoundedBoxGeometry(0.3, 1.7, 0.3, 2, 0.08), std(PAL.wood, { map: texWood(), rough: 0.55, tag: 'archstrut' }), sx * sw * 0.38, 6.2, 0);
  g.add(pennants(width, 5.15, 0.6, Math.max(8, Math.round(width / 1.5)), 0.7));
  g.userData.clearHeight = 5.1;
  return g;
}

export function makeGateFlags(halfWidth = 10, label = 'CP 1', color = '#ffd21f') {
  const g = new THREE.Group();
  const POLE = 6.0, ROPE_Y = 5.7;
  const poleGeo = new THREE.CylinderGeometry(0.06, 0.08, POLE, 12);
  const poleMat = std('#fff3d6', { rough: 0.4 });
  // waving cloth flag (tapered, sine-bent)
  const flagGeo = (sx) => {
    const cols = 10, rows = 4, pos = [], idx = [];
    for (let i = 0; i <= cols; i++) for (let j = 0; j <= rows; j++) {
      const u = i / cols, v = j / rows, h = (1 - u * 0.85) * 1.0;
      pos.push(-sx * u * 1.6, -v * h - u * 0.25, Math.sin(u * 6.5) * 0.08 * u);
    }
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const a = i * (rows + 1) + j, b = a + rows + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const gg = new THREE.BufferGeometry();
    gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.setIndex(idx); gg.computeVertexNormals();
    return gg;
  };
  const flagMat = std(color, { rough: 0.6, side: THREE.DoubleSide, emissive: color, emissiveIntensity: 0.15, tag: 'flag' });
  for (const sx of [-1, 1]) {
    const buoy = makeBuoy(color);
    buoy.scale.setScalar(1.5);
    buoy.position.set(sx * halfWidth, 0, 0);
    g.add(buoy);
    put(g, poleGeo, poleMat, sx * halfWidth, POLE / 2 + 0.5, 0);
    put(g, unitSphere(), std('#ffffff', { rough: 0.3 }), sx * halfWidth, POLE + 0.55, 0).scale.setScalar(0.1);
    put(g, flagGeo(sx), flagMat, sx * halfWidth, POLE + 0.45, 0, false);
  }
  g.add(ropeBetween(-halfWidth, halfWidth, ROPE_Y + 0.3, 0.5, 0.05));
  g.add(pennants(halfWidth * 2, ROPE_Y + 0.25, 0.5, Math.max(6, Math.round(halfWidth * 1.4)), 0.5));
  const bw = Math.min(halfWidth * 1.2, 7), bh = 1.5;
  const tex = canvasTex(512, Math.round(512 * bh / bw), (c, w, h) => {
    c.fillStyle = '#fff'; c.fillRect(0, 0, w, h);
    c.fillStyle = color; c.fillRect(0, 0, w, h * 0.14); c.fillRect(0, h * 0.86, w, h * 0.14);
    c.lineWidth = 10; c.strokeStyle = '#1b1b3a'; c.strokeRect(5, 5, w - 10, h - 10);
    strokedText(c, label, w / 2, h * 0.52, h * 0.58, '#ff3b30');
  });
  const mat = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.5, roughness: 0.55, side: THREE.DoubleSide });
  const board = new THREE.Mesh(new RoundedBoxGeometry(bw, bh, 0.08, 3, 0.03), mat);
  board.position.set(0, ROPE_Y - 0.4 - bh / 2 - 0.3, 0);
  g.add(board);
  for (const sx of [-1, 1]) put(g, new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), std('#1b1b3a'), sx * bw * 0.4, ROPE_Y - 0.35, 0, false);
  g.userData.clearHeight = ROPE_Y - 0.4 - bh - 0.3;
  return g;
}

/* ---------------------------------------------------------------- splashes */
export function makeSplashes(scene) {
  const COUNT = 320;
  const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }), COUNT);
  mesh.frustumCulled = false;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const cWhite = new THREE.Color('#ffffff'), cBlue = new THREE.Color('#aee8ff');
  const pos = new Float32Array(COUNT * 3), vel = new Float32Array(COUNT * 3), life = new Float32Array(COUNT), max = new Float32Array(COUNT), size = new Float32Array(COUNT);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < COUNT; i++) { mesh.setColorAt(i, i % 3 ? cWhite : cBlue); dummy.scale.setScalar(0); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix); }
  mesh.instanceColor.needsUpdate = true;
  scene.add(mesh);
  let head = 0;
  function emit(x, y, z, strength = 0.5) {
    const s = clamp(strength, 0, 1);
    const n = 4 + Math.floor(s * 16);
    for (let k = 0; k < n; k++) {
      const i = head; head = (head + 1) % COUNT;
      const a = Math.random() * Math.PI * 2, sp = (0.6 + Math.random() * 1.8) * (0.5 + s);
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      vel[i * 3] = Math.cos(a) * sp; vel[i * 3 + 1] = 1.8 + Math.random() * (2.5 + 4 * s); vel[i * 3 + 2] = Math.sin(a) * sp;
      max[i] = life[i] = 0.5 + Math.random() * 0.5;
      size[i] = (0.05 + Math.random() * 0.08) * (0.8 + s * 0.8);
    }
  }
  function update(dt) {
    for (let i = 0; i < COUNT; i++) {
      if (life[i] <= 0) continue;
      life[i] -= dt;
      vel[i * 3 + 1] -= 11 * dt;
      pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      if (pos[i * 3 + 1] < 0 && vel[i * 3 + 1] < 0) life[i] = 0;
      const sc = life[i] > 0 ? size[i] * Math.min(1, life[i] / max[i] * 2.2) : 0;
      dummy.position.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
      dummy.scale.set(sc, sc * 1.25, sc);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
  return { emit, update, mesh };
}

/* ---------------------------------------------------------------- sky */
export function makeSky(scene) {
  const HORIZON = new THREE.Color('#dff3ff');
  const sunDir = new V3(-0.35, 0.5, -0.8).normalize();
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
    uniforms: {
      uTop: { value: new THREE.Color('#2f8cff') }, uMid: { value: new THREE.Color('#7cc8ff') }, uHor: { value: HORIZON },
      uSun: { value: sunDir }, uSunCol: { value: new THREE.Color('#fff6c0') },
    },
    vertexShader: `varying vec3 vDir;
      void main(){ vDir = position; vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position * 500.0, 1.0); gl_Position = p; gl_Position.z = p.w * 0.99999; }`,
    fragmentShader: `uniform vec3 uTop, uMid, uHor, uSun, uSunCol; varying vec3 vDir;
      void main(){
        vec3 d = normalize(vDir);
        float h = max(d.y, 0.0);
        vec3 col = mix(uHor, uMid, smoothstep(0.0, 0.25, h));
        col = mix(col, uTop, smoothstep(0.2, 0.9, h));
        float s = dot(d, uSun);
        col += uSunCol * pow(max(s, 0.0), 12.0) * 0.35;
        col = mix(col, uSunCol, smoothstep(0.985, 0.99, s) * 0.5);
        col = mix(col, vec3(1.0, 0.98, 0.85), smoothstep(0.9965, 0.9975, s));
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), mat);
  dome.renderOrder = -1000;
  dome.frustumCulled = false;
  scene.add(dome);

  // clouds
  const clouds = new THREE.Group();
  const cr = rng(77);
  const cmat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  const cmat2 = new THREE.MeshBasicMaterial({ color: 0xcfe6fb, fog: false });
  const puffs = [];
  for (let i = 0; i < 14; i++) {
    const c = new THREE.Group();
    const n = 4 + Math.floor(cr() * 3);
    for (let k = 0; k < n; k++) {
      const s = 14 + cr() * 14;
      const m = new THREE.Mesh(unitIco(), cmat);
      m.scale.set(s * 1.2, s * 0.8, s);
      m.position.set((k - n / 2) * 18 + cr() * 6, cr() * 6, (cr() - 0.5) * 10);
      c.add(m);
    }
    const base = new THREE.Mesh(unitIco(), cmat2);
    base.scale.set(n * 12, 5, 16); base.position.set(0, -7, 0); c.add(base);
    const a = (i / 14) * Math.PI * 2 + cr() * 0.4, d = 260 + cr() * 220;
    c.position.set(Math.cos(a) * d, 110 + cr() * 80, Math.sin(a) * d);
    c.rotation.y = -a + Math.PI / 2;
    c.userData.bob = cr() * 6;
    clouds.add(c); puffs.push(c);
  }
  clouds.renderOrder = -900;
  scene.add(clouds);
  let camRef = null;
  dome.onBeforeRender = (renderer, sc, camera) => {
    camRef = camera;
    clouds.position.x = camera.position.x; clouds.position.z = camera.position.z;
    clouds.updateMatrixWorld(true);
  };

  // lights + fog
  const hemi = new THREE.HemisphereLight(0xcdeaff, 0x7ac05a, 1.15);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1d0, 2.0);
  sun.position.set(-40, 80, 30);
  sun.castShadow = false;
  scene.add(sun, sun.target);
  scene.fog = new THREE.Fog(HORIZON.getHex(), 120, 520);
  if (scene.background == null || scene.background.isColor) scene.background = HORIZON.clone();

  function update(t, camera) {
    clouds.rotation.y = t * 0.004;
    for (const c of puffs) c.position.y += Math.sin(t * 0.2 + c.userData.bob) * 0.01;
    const cam = camera || camRef;
    if (cam) { sun.position.set(cam.position.x - 40, 80, cam.position.z + 30); sun.target.position.set(cam.position.x, 0, cam.position.z); }
  }
  return { update, hemi, sun, dome, clouds, horizonColor: HORIZON };
}
