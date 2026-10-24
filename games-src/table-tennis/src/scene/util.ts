import { Color, Matrix4, Mesh, MeshStandardMaterial, Object3D, Quaternion, Vector3, type BufferGeometry, type InstancedMesh, type Material } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export function mat(color: string | number, opts: { rough?: number; metal?: number; flat?: boolean; emissive?: string | number; emissiveIntensity?: number } = {}): MeshStandardMaterial {
  const m = new MeshStandardMaterial({
    color,
    roughness: opts.rough ?? 0.75,
    metalness: opts.metal ?? 0,
    flatShading: opts.flat ?? false,
    emissiveIntensity: opts.emissiveIntensity ?? 1,
  });
  if (opts.emissive !== undefined) m.emissive = new Color(opts.emissive);
  return m;
}

export function shadowed<T extends Object3D>(o: T, cast = true, receive = true): T {
  o.traverse((c) => {
    if ((c as Mesh).isMesh) {
      c.castShadow = cast;
      c.receiveShadow = receive;
    }
  });
  return o;
}

/** Dispose geometries, materials and textures of a subtree. */
export function disposeTree(root: Object3D): void {
  const mats = new Set<Material>();
  root.traverse((o) => {
    const m = o as Mesh;
    if (m.geometry) m.geometry.dispose();
    if (m.material) {
      const arr = Array.isArray(m.material) ? m.material : [m.material];
      for (const x of arr) mats.add(x);
    }
  });
  for (const m of mats) {
    for (const v of Object.values(m)) {
      if (v && typeof v === 'object' && (v as { isTexture?: boolean }).isTexture) (v as { dispose(): void }).dispose();
    }
    m.dispose();
  }
}

const _up = new Vector3(0, 1, 0);
const _d = new Vector3();
/** Position + orient a Y-aligned unit-length limb mesh between a and b (local coords of its parent). */
export function placeBetween(o: Object3D, a: Vector3, b: Vector3, q?: Quaternion): void {
  _d.subVectors(b, a);
  const len = _d.length();
  o.position.addVectors(a, b).multiplyScalar(0.5);
  if (len > 1e-6) o.quaternion.setFromUnitVectors(_up, _d.multiplyScalar(1 / len));
  if (q) o.quaternion.premultiply(q);
}

export const damp = (a: number, b: number, rate: number, dt: number): number => b + (a - b) * Math.exp(-rate * dt);
export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
export const smooth = (t: number): number => t * t * (3 - 2 * t);

/**
 * Merge static single-material meshes under `root` that share a material into one mesh each
 * (world transforms baked relative to root). Cuts draw calls for static scenery.
 */
export function mergeStatic(root: Object3D): void {
  root.updateMatrixWorld(true);
  const inv = new Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map<string, { mat: Material; cast: boolean; recv: boolean; order: number; geos: BufferGeometry[]; meshes: Mesh[] }>();
  root.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh || (m as unknown as InstancedMesh).isInstancedMesh || Array.isArray(m.material) || m.userData.noMerge) return;
    const mt = m.material as Material;
    if (mt.transparent) return;
    const g = m.geometry;
    const key = `${mt.uuid}|${m.castShadow}|${m.receiveShadow}|${Object.keys(g.attributes).sort().join(',')}|${g.index ? 1 : 0}`;
    let b = buckets.get(key);
    if (!b) {
      b = { mat: mt, cast: m.castShadow, recv: m.receiveShadow, order: m.renderOrder, geos: [], meshes: [] };
      buckets.set(key, b);
    }
    const ng = g.clone();
    ng.applyMatrix4(new Matrix4().multiplyMatrices(inv, m.matrixWorld));
    ng.clearGroups();
    b.geos.push(ng);
    b.meshes.push(m);
  });
  for (const b of buckets.values()) {
    if (b.meshes.length < 2) {
      for (const g of b.geos) g.dispose();
      continue;
    }
    const merged = mergeGeometries(b.geos, false);
    for (const g of b.geos) g.dispose();
    if (!merged) continue;
    for (const m of b.meshes) {
      m.geometry.dispose();
      m.removeFromParent();
    }
    const mm = new Mesh(merged, b.mat);
    mm.castShadow = b.cast;
    mm.receiveShadow = b.recv;
    mm.renderOrder = b.order;
    root.add(mm);
  }
}
