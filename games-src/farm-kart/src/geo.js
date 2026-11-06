// Shared geometry/material helpers for the toy-like look: smooth shading,
// rounded boxes, cached materials, and "prefab" merging for cheap instancing.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const INK = '#1b1b3a';
export const PAL = {
  red: '#ff3b30', redD: '#b3160f', yellow: '#ffd21f', yellowD: '#c79a00', blue: '#2f7cff', green: '#2fc65a',
  purple: '#9b4dff', orange: '#ff8a00', teal: '#16a3d9', pink: '#ff5aa8', white: '#fbfbf6', black: '#262633',
  snout: '#ffa8b8', horn: '#f3e3b5', hoof: '#4a3426', wood: '#8a5a2b', woodD: '#5e3a1a', hay: '#f1c24b',
  leaf: '#3fae2e', leaf2: '#56c63a', stone: '#b9b2a5', glass: '#bfe8ff', dirt: '#d39a57',
};

const mats = new Map();
export function mat(color, o = {}) {
  const key = color + JSON.stringify(o);
  let m = mats.get(key);
  if (!m) { m = new THREE.MeshStandardMaterial({ color, roughness: .8, metalness: 0, ...o }); mats.set(key, m); }
  return m;
}
export const gloss = c => mat(c, { roughness: .32, metalness: .08 });
export const metal = c => mat(c, { roughness: .28, metalness: .75 });

const geos = new Map();
const cached = (key, make) => { let g = geos.get(key); if (!g) { g = make(); g.userData.shared = true; geos.set(key, g); } return g; };

export const rboxGeo = (w, h, d, r = .15, s = 3) => cached(`rb${w},${h},${d},${r},${s}`, () => new RoundedBoxGeometry(w, h, d, s, Math.min(r, w / 2 - .001, h / 2 - .001, d / 2 - .001)));
export const ballGeo = (r, s = 20) => cached(`b${r},${s}`, () => new THREE.SphereGeometry(r, s, Math.max(6, Math.round(s * .75))));
export const cylGeo = (rt, rb, h, s = 20) => cached(`c${rt},${rb},${h},${s}`, () => new THREE.CylinderGeometry(rt, rb, h, s));
export const coneGeo = (r, h, s = 16) => cached(`k${r},${h},${s}`, () => new THREE.ConeGeometry(r, h, s));
export const torusGeo = (r, t, rs = 8, ts = 24, arc = Math.PI * 2) => cached(`t${r},${t},${rs},${ts},${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc));

export function mesh(geo, material, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}
export const rbox = (w, h, d, m, r, p, x, y, z) => mesh(rboxGeo(w, h, d, r ?? .15), m, x, y, z, p);
export const ball = (r, m, p, x, y, z, s) => mesh(ballGeo(r, s), m, x, y, z, p);
export const cyl = (rt, rb, h, m, p, x, y, z, s) => mesh(cylGeo(rt, rb, h, s), m, x, y, z, p);
export const cone = (r, h, m, p, x, y, z, s) => mesh(coneGeo(r, h, s), m, x, y, z, p);

/** cartoon eye: white ellipsoid, pupil, glint; faces +z */
export function eye(parent, x, y, z, size = .16, look = 0) {
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  ball(size, mat('#ffffff', { roughness: .25 }), g, 0, 0, 0, 16).scale.set(.8, 1.15, .7);
  ball(size * .55, mat(INK, { roughness: .3 }), g, look * size * .2, -size * .05, size * .5, 12);
  ball(size * .18, mat('#ffffff', { roughness: .2 }), g, look * size * .2 + size * .15, size * .2, size * .72, 6);
  return g;
}

/** Merge a built group into one geometry per material (for instancing / fewer draw calls). */
export function prefab(root) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const byMat = new Map();
  const tmp = new THREE.Matrix4();
  root.traverse(o => {
    if (!o.isMesh) return;
    let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    if (!g.attributes.normal) g.computeVertexNormals();
    g.applyMatrix4(tmp.multiplyMatrices(inv, o.matrixWorld));
    if (!byMat.has(o.material)) byMat.set(o.material, []);
    byMat.get(o.material).push(g);
  });
  return [...byMat].map(([material, list]) => ({ material, geo: mergeGeometries(list) }));
}

/** InstancedMesh group from prefab parts and a list of Matrix4 */
export function instanced(parts, matrices, { shadow = true, receive = true } = {}) {
  const g = new THREE.Group();
  if (!matrices.length) return g;
  for (const { material, geo } of parts) {
    const im = new THREE.InstancedMesh(geo, material, matrices.length);
    matrices.forEach((m, i) => im.setMatrixAt(i, m));
    im.castShadow = shadow; im.receiveShadow = receive;
    im.computeBoundingSphere();
    g.add(im);
  }
  return g;
}

const _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _e = new THREE.Euler();
export function trs(x, y, z, ry = 0, s = 1, rx = 0, rz = 0) {
  _e.set(rx, ry, rz); _q.setFromEuler(_e);
  if (typeof s === 'number') _s.set(s, s, s); else _s.set(s[0], s[1], s[2]);
  _p.set(x, y, z);
  return new THREE.Matrix4().compose(_p, _q, _s);
}
