/**
 * Procedural geometry builders for the fruit models.
 *
 * Sliceable "body" meshes are closed, (position-)manifold surfaces built by
 * `buildSurface`: a (u, v) grid with single pole vertices at v = 0 and v = 1
 * and a duplicated UV seam column. Topological vertex identities ("weld ids")
 * are recorded in `geometry.userData.weld` so the slicer can chain cut edges
 * across UV seams.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type SurfFn = (u: number, v: number, out: THREE.Vector3) => void;

const TAU = Math.PI * 2;

/**
 * Closed parametric surface. u ∈ [0,1] wraps around, v ∈ [0,1] runs from the
 * bottom pole to the top pole. Normals are smoothed across the seam.
 */
export function buildSurface(segU: number, segV: number, fn: SurfFn): THREE.BufferGeometry {
  const cols = segU + 1;
  const nv = 2 + (segV - 1) * cols;
  const pos = new Float32Array(nv * 3);
  const uv = new Float32Array(nv * 2);
  const weld = new Uint32Array(nv);
  const p = new THREE.Vector3();

  // bottom pole
  fn(0.5, 0, p);
  pos.set([p.x, p.y, p.z], 0);
  uv.set([0.5, 0], 0);
  weld[0] = 0;
  let w = 1;
  for (let j = 1; j < segV; j++) {
    const v = j / segV;
    const base = 1 + (j - 1) * cols;
    for (let i = 0; i < cols; i++) {
      const idx = base + i;
      if (i === segU) {
        // seam duplicate: copy exact position of column 0
        pos[idx * 3] = pos[base * 3];
        pos[idx * 3 + 1] = pos[base * 3 + 1];
        pos[idx * 3 + 2] = pos[base * 3 + 2];
        weld[idx] = weld[base];
      } else {
        fn(i / segU, v, p);
        pos[idx * 3] = p.x;
        pos[idx * 3 + 1] = p.y;
        pos[idx * 3 + 2] = p.z;
        weld[idx] = w++;
      }
      uv[idx * 2] = i / segU;
      uv[idx * 2 + 1] = v;
    }
  }
  const top = nv - 1;
  fn(0.5, 1, p);
  pos.set([p.x, p.y, p.z], top * 3);
  uv.set([0.5, 1], top * 2);
  weld[top] = w++;

  const tris: number[] = [];
  const r1 = 1;
  for (let i = 0; i < segU; i++) tris.push(0, r1 + i + 1, r1 + i);
  for (let j = 1; j < segV - 1; j++) {
    const a0 = 1 + (j - 1) * cols;
    const b0 = a0 + cols;
    for (let i = 0; i < segU; i++) {
      const a = a0 + i, b = a0 + i + 1, c = b0 + i + 1, d = b0 + i;
      tris.push(a, b, c, a, c, d);
    }
  }
  const rl = 1 + (segV - 2) * cols;
  for (let i = 0; i < segU; i++) tris.push(rl + i, rl + i + 1, top);

  // Ensure outward winding (positive signed volume).
  let vol = 0;
  for (let t = 0; t < tris.length; t += 3) {
    const a = tris[t] * 3, b = tris[t + 1] * 3, c = tris[t + 2] * 3;
    vol +=
      pos[a] * (pos[b + 1] * pos[c + 2] - pos[b + 2] * pos[c + 1]) -
      pos[a + 1] * (pos[b] * pos[c + 2] - pos[b + 2] * pos[c]) +
      pos[a + 2] * (pos[b] * pos[c + 1] - pos[b + 1] * pos[c]);
  }
  if (vol < 0) {
    for (let t = 0; t < tris.length; t += 3) {
      const tmp = tris[t + 1];
      tris[t + 1] = tris[t + 2];
      tris[t + 2] = tmp;
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(tris);
  g.userData.weld = weld;
  g.userData.weldCount = w;
  computeWeldedNormals(g);
  return g;
}

/** Smooth normals accumulated per weld id (so seams stay invisible). */
export function computeWeldedNormals(g: THREE.BufferGeometry): void {
  const pos = g.attributes.position.array as Float32Array;
  const nv = pos.length / 3;
  let weld = g.userData.weld as Uint32Array | undefined;
  if (!weld) {
    computeWeldHash(g);
    weld = g.userData.weld as Uint32Array;
  }
  const wc = g.userData.weldCount as number;
  const acc = new Float32Array(wc * 3);
  const index = g.index ? (g.index.array as ArrayLike<number>) : null;
  const triCount = index ? index.length / 3 : nv / 3;
  for (let t = 0; t < triCount; t++) {
    const ia = index ? index[t * 3] : t * 3;
    const ib = index ? index[t * 3 + 1] : t * 3 + 1;
    const ic = index ? index[t * 3 + 2] : t * 3 + 2;
    const ax = pos[ia * 3], ay = pos[ia * 3 + 1], az = pos[ia * 3 + 2];
    const e1x = pos[ib * 3] - ax, e1y = pos[ib * 3 + 1] - ay, e1z = pos[ib * 3 + 2] - az;
    const e2x = pos[ic * 3] - ax, e2y = pos[ic * 3 + 1] - ay, e2z = pos[ic * 3 + 2] - az;
    const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
    for (const i of [ia, ib, ic]) {
      const k = weld[i] * 3;
      acc[k] += nx;
      acc[k + 1] += ny;
      acc[k + 2] += nz;
    }
  }
  const nor = new Float32Array(nv * 3);
  for (let i = 0; i < nv; i++) {
    const k = weld[i] * 3;
    const l = Math.hypot(acc[k], acc[k + 1], acc[k + 2]) || 1;
    nor[i * 3] = acc[k] / l;
    nor[i * 3 + 1] = acc[k + 1] / l;
    nor[i * 3 + 2] = acc[k + 2] / l;
  }
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
}

/** Generic position-hash weld for geometries not built by buildSurface. */
export function computeWeldHash(g: THREE.BufferGeometry): void {
  const pos = g.attributes.position.array as Float32Array;
  const nv = pos.length / 3;
  const weld = new Uint32Array(nv);
  const map = new Map<string, number>();
  let w = 0;
  for (let i = 0; i < nv; i++) {
    const key = `${Math.round(pos[i * 3] * 1e5)},${Math.round(pos[i * 3 + 1] * 1e5)},${Math.round(pos[i * 3 + 2] * 1e5)}`;
    let id = map.get(key);
    if (id === undefined) {
      id = w++;
      map.set(key, id);
    }
    weld[i] = id;
  }
  g.userData.weld = weld;
  g.userData.weldCount = w;
}

/**
 * Closed tube along a spine. radius(v, theta) must be > 0 for 0 < v < 1; the
 * ends close to single pole vertices at spine(0) and spine(1).
 */
export function buildTube(
  segU: number,
  segV: number,
  spine: (v: number, out: THREE.Vector3) => void,
  radius: (v: number, theta: number) => number,
  ref = new THREE.Vector3(0, 0, 1),
): THREE.BufferGeometry {
  const c = new THREE.Vector3();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const T = new THREE.Vector3();
  const N = new THREE.Vector3();
  const B = new THREE.Vector3();
  return buildSurface(segU, segV, (u, v, out) => {
    spine(v, c);
    if (v <= 0 || v >= 1) {
      out.copy(c);
      return;
    }
    const h = 1e-3;
    spine(Math.max(0, v - h), a);
    spine(Math.min(1, v + h), b);
    T.subVectors(b, a).normalize();
    N.crossVectors(T, ref);
    if (N.lengthSq() < 1e-8) N.set(1, 0, 0);
    N.normalize();
    B.crossVectors(T, N).normalize();
    const th = u * TAU;
    const r = radius(v, th);
    out.copy(c).addScaledVector(N, Math.cos(th) * r).addScaledVector(B, Math.sin(th) * r);
  });
}

/**
 * Flat-ish leaf / blade in local space: base at origin, pointing along +X,
 * width along Z, gently cupped (+Y) and bent. uv.y runs base → tip.
 */
export function buildLeaf(opts: {
  length: number;
  width: number;
  segL?: number;
  segW?: number;
  /** upward bend at the tip (fraction of length, + = up) */
  bend?: number;
  /** cupping of the sides */
  cup?: number;
  /** blade profile exponent: 1 = pointy lanceolate, <1 = rounder */
  shape?: 'leaf' | 'blade' | 'sepal';
  twist?: number;
}): THREE.BufferGeometry {
  const { length, width, segL = 6, segW = 2, bend = 0.15, cup = 0.15, shape = 'leaf', twist = 0 } = opts;
  const cols = segW * 2 + 1;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let j = 0; j <= segL; j++) {
    const t = j / segL;
    let wf: number;
    if (shape === 'leaf') wf = Math.pow(Math.sin(Math.PI * Math.min(1, t * 0.96 + 0.02)), 0.75) * (1 - 0.35 * t);
    else if (shape === 'blade') wf = (1 - t) * (0.85 + 0.15 * Math.sin(Math.PI * t));
    else wf = Math.pow(1 - t, 0.9) * (0.6 + 0.4 * Math.sin(Math.PI * Math.min(1, t + 0.3)));
    const halfW = (width / 2) * Math.max(wf, t >= 1 ? 0 : 0.02);
    const x = t * length;
    const yb = bend * length * t * t;
    for (let i = 0; i < cols; i++) {
      const s = (i / (cols - 1)) * 2 - 1;
      const zz = s * halfW;
      const yc = cup * width * s * s * (1 - t * 0.3);
      const tw = twist * t;
      const y = yb + yc * Math.cos(tw) + zz * Math.sin(tw) * 0.5;
      pos.push(x, y, zz * Math.cos(tw));
      uv.push((s + 1) / 2, t);
    }
  }
  for (let j = 0; j < segL; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const a = j * cols + i, b = a + 1, c = a + cols + 1, d = a + cols;
      idx.push(a, c, b, a, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Orient a local geometry so its +X goes along `dir`, +Y along `up` (orthogonalised), placed at `at`. */
export function placeGeometry(
  g: THREE.BufferGeometry,
  at: THREE.Vector3,
  dir: THREE.Vector3,
  up: THREE.Vector3,
): THREE.BufferGeometry {
  const x = dir.clone().normalize();
  const z = new THREE.Vector3().crossVectors(x, up).normalize();
  const y = new THREE.Vector3().crossVectors(z, x).normalize();
  const m = new THREE.Matrix4().makeBasis(x, y, z).setPosition(at);
  g.applyMatrix4(m);
  return g;
}

/** Merge attachment geometries (converted to non-indexed, position/normal/uv only). */
export function mergeParts(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const prepared = parts.map((p) => {
    const g = p.index ? p.toNonIndexed() : p;
    for (const name of Object.keys(g.attributes)) {
      if (name !== 'position' && name !== 'normal' && name !== 'uv') g.deleteAttribute(name);
    }
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.attributes.uv) {
      g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array((g.attributes.position.count) * 2), 2));
    }
    return g;
  });
  const merged = mergeGeometries(prepared, false);
  if (!merged) throw new Error('mergeParts failed');
  return merged;
}

/** Signed-angle helper: distance of theta from a target angle, wrapped to [-π, π]. */
export function angDist(theta: number, target: number): number {
  let d = (theta - target) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

export function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
