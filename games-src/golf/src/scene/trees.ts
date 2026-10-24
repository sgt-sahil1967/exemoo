/** Stylised instanced trees (round lollipops, stacked-cone pines, palms), bushes, rocks, flowers. */
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  DoubleSide,
  FrontSide,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Material,
  Matrix4,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PlaneGeometry,
  Quaternion,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Hole, Quality, Tree } from '../core/contracts';
import { radialTexture } from './textures';
import { mulberry32 } from './util';
import type { Box } from './terrain';

/** Darken toward the bottom so canopies read as round volumes. */
function shadeByY(g: BufferGeometry, y0: number, y1: number, lo = 0.62, hi = 1.08) {
  const p = g.getAttribute('position');
  const c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const t = Math.min(1, Math.max(0, (p.getY(i) - y0) / (y1 - y0)));
    const v = lo + (hi - lo) * t;
    c[i * 3] = v;
    c[i * 3 + 1] = v;
    c[i * 3 + 2] = v;
  }
  g.setAttribute('color', new BufferAttribute(c, 3));
  return g;
}

function prep(parts: BufferGeometry[]) {
  parts.forEach((p) => {
    p.deleteAttribute('uv');
    if (p.index) {
      const n = p.toNonIndexed();
      p.copy(n);
      n.dispose();
    }
  });
  const m = mergeGeometries(parts)!;
  parts.forEach((p) => p.dispose());
  return m;
}

/** Unit-height geometries. Canopy horizontal unit radius noted in CANOPY_R. */
function roundCanopy() {
  const s = (r: number, x: number, y: number, z: number) => new IcosahedronGeometry(r, 2).translate(x, y, z);
  return shadeByY(prep([s(0.3, 0, 0.64, 0), s(0.21, 0.16, 0.56, 0.08), s(0.22, -0.15, 0.58, -0.05), s(0.2, 0.02, 0.84, -0.03), s(0.18, -0.04, 0.55, 0.17)]), 0.3, 1.0);
}
function pineCanopy() {
  const c = (r: number, h: number, y: number) => new ConeGeometry(r, h, 9, 1).translate(0, y, 0);
  return shadeByY(prep([c(0.45, 0.42, 0.36), c(0.36, 0.38, 0.6), c(0.25, 0.34, 0.82)]), 0.15, 1.0, 0.55, 1.1);
}
function palmFronds() {
  // drooping leaf ribbons radiating from the crown (crown at origin, unit length 1)
  const parts: BufferGeometry[] = [];
  const n = 8;
  for (let f = 0; f < n; f++) {
    const segs = 6;
    const pos: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const x = t;
      const y = 0.25 * Math.sin(t * Math.PI * 0.9) - 0.55 * t * t;
      const w = 0.16 * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.08));
      pos.push(x, y, -w, x, y + 0.03, w);
      if (i < segs) {
        const a = i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
    g.setIndex(idx);
    g.rotateY((f / n) * Math.PI * 2 + (f % 2) * 0.2);
    parts.push(g);
  }
  const m = mergeGeometries(parts.map((p) => p.toNonIndexed()))!;
  parts.forEach((p) => p.dispose());
  m.computeVertexNormals();
  return shadeByY(m, -0.5, 0.2, 0.7, 1.05);
}
function palmTrunk() {
  // gently curved, ringed trunk; unit height, lean of 0.9 m at the top (absolute x)
  const parts: BufferGeometry[] = [];
  const n = 7;
  for (let i = 0; i < n; i++) {
    const t0 = i / n;
    const g = new CylinderGeometry(0.17 - t0 * 0.05, 0.22 - t0 * 0.05, 1 / n + 0.01, 7, 1);
    g.translate(0, t0 + 0.5 / n, 0);
    parts.push(g);
  }
  return shadeByY(prep(parts), 0, 1, 0.75, 1.05);
}
const PALM_LEAN = 0.9;

const TRUNK_COL = '#8b5b3a';
const ROUND_COLS = ['#3f9f39', '#4eb041', '#5bbd47', '#3a9236', '#67c24c'];
const PINE_COLS = ['#2e7f3e', '#378c45', '#2a733a'];
const PALM_COLS = ['#5fb84b', '#6cc451'];

export interface TreesBuild {
  group: Group;
  dispose(): void;
}

interface Placed {
  x: number;
  y: number;
  z: number;
  radius: number;
  height: number;
  kind: Tree['kind'];
}

export function buildTrees(hole: Hole, heightAt: (x: number, z: number) => number, ext: Box, quality: Quality): TreesBuild {
  const group = new Group();
  group.name = 'trees';
  const disposables: { dispose(): void }[] = [];
  const rnd = mulberry32(hole.def.number * 97 + 13);
  const density = quality === 'low' ? 0.35 : quality === 'medium' ? 0.65 : 1;
  const b = hole.bounds;

  // hole trees + a decorative forest in the skirt
  const placed: Placed[] = hole.trees.map((t) => ({ x: t.pos.x, y: heightAt(t.pos.x, t.pos.z), z: t.pos.z, radius: t.radius, height: t.height, kind: t.kind }));
  const forestN = Math.round(420 * density);
  for (let i = 0; i < forestN * 3 && placed.length < hole.trees.length + forestN; i++) {
    const x = ext.minX + rnd() * (ext.maxX - ext.minX);
    const z = ext.minZ + rnd() * (ext.maxZ - ext.minZ);
    const inside = x > b.minX - 3 && x < b.maxX + 3 && z > b.minZ - 3 && z < b.maxZ + 3;
    if (inside) continue;
    // keep the region behind the tee more open so the address camera has a clear view
    const dt = Math.hypot(x - hole.tee.x, z - hole.tee.z);
    if (dt < 45) continue;
    const kind: Tree['kind'] = rnd() < 0.62 ? 'round' : 'pine';
    const height = kind === 'pine' ? 10 + rnd() * 7 : 8 + rnd() * 6;
    placed.push({ x, y: heightAt(x, z), z, radius: kind === 'pine' ? 2.8 + rnd() : 3.4 + rnd() * 2, height, kind });
  }

  const m = new Matrix4();
  const q = new Quaternion();
  const up = new Vector3(0, 1, 0);
  const sc = new Vector3();
  const p = new Vector3();
  const col = new Color();

  const make = (geo: BufferGeometry, mat: Material, count: number, shadow = true) => {
    const im = new InstancedMesh(geo, mat, Math.max(1, count));
    im.count = count;
    im.castShadow = shadow;
    im.receiveShadow = true;
    group.add(im);
    disposables.push(geo, mat);
    return im;
  };
  const trunkMat = () => new MeshLambertMaterial({ color: TRUNK_COL, vertexColors: true });
  const leafMat = (side = false) => new MeshLambertMaterial({ color: '#ffffff', vertexColors: true, side: side ? DoubleSide : FrontSide });

  const byKind = (k: Tree['kind']) => placed.filter((t) => t.kind === k);
  // round
  {
    const list = byKind('round');
    const trunkGeo = shadeByY(new CylinderGeometry(0.17, 0.27, 0.5, 7).translate(0, 0.25, 0), 0, 0.5, 0.7, 1);
    const trunks = make(trunkGeo, trunkMat(), list.length);
    const canopy = make(roundCanopy(), leafMat(), list.length);
    list.forEach((t, i) => {
      const yaw = rnd() * Math.PI * 2;
      q.setFromAxisAngle(up, yaw);
      m.compose(p.set(t.x, t.y - 0.2, t.z), q, sc.set(1, t.height, 1));
      trunks.setMatrixAt(i, m);
      const r = t.radius / 0.36;
      m.compose(p, q, sc.set(r, t.height, r));
      canopy.setMatrixAt(i, m);
      canopy.setColorAt(i, col.set(ROUND_COLS[Math.floor(rnd() * ROUND_COLS.length)]));
    });
  }
  // pine
  {
    const list = byKind('pine');
    const trunkGeo = shadeByY(new CylinderGeometry(0.14, 0.24, 0.25, 7).translate(0, 0.125, 0), 0, 0.25, 0.7, 1);
    const trunks = make(trunkGeo, trunkMat(), list.length);
    const canopy = make(pineCanopy(), leafMat(), list.length);
    list.forEach((t, i) => {
      q.setFromAxisAngle(up, rnd() * Math.PI * 2);
      m.compose(p.set(t.x, t.y - 0.2, t.z), q, sc.set(1, t.height, 1));
      trunks.setMatrixAt(i, m);
      const r = t.radius / 0.45;
      m.compose(p, q, sc.set(r, t.height, r));
      canopy.setMatrixAt(i, m);
      canopy.setColorAt(i, col.set(PINE_COLS[Math.floor(rnd() * PINE_COLS.length)]));
    });
  }
  // palm
  {
    const list = byKind('palm');
    const trunkGeo = palmTrunk();
    // bend the trunk: shift x by lean * t²
    const pa = trunkGeo.getAttribute('position');
    for (let i = 0; i < pa.count; i++) {
      const t = pa.getY(i);
      pa.setX(i, pa.getX(i) + PALM_LEAN * t * t);
    }
    trunkGeo.computeVertexNormals();
    const trunks = make(trunkGeo, new MeshLambertMaterial({ color: '#a77b52', vertexColors: true }), list.length);
    const crowns = make(palmFronds(), leafMat(true), list.length);
    const nuts = make(new IcosahedronGeometry(0.22, 0).translate(0, -0.15, 0), new MeshLambertMaterial({ color: '#6b4a2b' }), list.length);
    list.forEach((t, i) => {
      const yaw = rnd() * Math.PI * 2;
      q.setFromAxisAngle(up, yaw);
      m.compose(p.set(t.x, t.y - 0.2, t.z), q, sc.set(1, t.height, 1));
      trunks.setMatrixAt(i, m);
      const top = new Vector3(PALM_LEAN, t.height - 0.2, 0).applyQuaternion(q).add(p);
      const r = t.radius * 1.2;
      q.setFromAxisAngle(up, yaw + rnd());
      m.compose(top, q, sc.set(r, r * 0.9, r));
      crowns.setMatrixAt(i, m);
      crowns.setColorAt(i, col.set(PALM_COLS[i % 2]));
      m.compose(top, q, sc.set(1, 1, 1));
      nuts.setMatrixAt(i, m);
    });
  }

  // blob shadows under every tree (soft contact darkening, visible everywhere)
  {
    const geo = new PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    const mat = new MeshBasicMaterial({
      map: radialTexture(0.2),
      color: '#0d3a10',
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const blobs = make(geo, mat, placed.length, false);
    blobs.receiveShadow = false;
    const n = new Vector3();
    placed.forEach((t, i) => {
      const e = 1;
      n.set(heightAt(t.x - e, t.z) - heightAt(t.x + e, t.z), 2 * e, heightAt(t.x, t.z - e) - heightAt(t.x, t.z + e)).normalize();
      q.setFromUnitVectors(up, n);
      const s = t.radius * 2.6;
      m.compose(p.set(t.x, t.y + 0.06, t.z), q, sc.set(s, 1, s));
      blobs.setMatrixAt(i, m);
    });
    blobs.renderOrder = 0;
  }

  // bushes, rocks and flowers in the rough
  {
    const okSurf = (x: number, z: number) => {
      const inB = x > b.minX && x < b.maxX && z > b.minZ && z < b.maxZ;
      if (!inB) return true;
      const s = hole.surfaceAt(x, z);
      return s === 'deepRough' || s === 'ob';
    };
    const bushGeo = shadeByY(
      prep([
        new IcosahedronGeometry(0.55, 1).translate(0, 0.35, 0),
        new IcosahedronGeometry(0.42, 1).translate(0.45, 0.28, 0.1),
        new IcosahedronGeometry(0.4, 1).translate(-0.42, 0.26, -0.08),
      ]),
      0,
      0.9,
    );
    const bushN = Math.round(260 * density);
    const bushes = make(bushGeo, leafMat(), bushN);
    let bi = 0;
    for (let i = 0; i < bushN * 4 && bi < bushN; i++) {
      const tr = placed[Math.floor(rnd() * placed.length)];
      if (!tr) break;
      const a = rnd() * Math.PI * 2;
      const d = tr.radius * (0.9 + rnd() * 1.4);
      const x = tr.x + Math.cos(a) * d;
      const z = tr.z + Math.sin(a) * d;
      if (!okSurf(x, z)) continue;
      const s = 0.8 + rnd() * 1.1;
      q.setFromAxisAngle(up, rnd() * 6.28);
      m.compose(p.set(x, heightAt(x, z) - 0.1, z), q, sc.set(s, s * (0.7 + rnd() * 0.4), s));
      bushes.setMatrixAt(bi, m);
      bushes.setColorAt(bi, col.set(ROUND_COLS[Math.floor(rnd() * ROUND_COLS.length)]).multiplyScalar(0.9));
      bi++;
    }
    bushes.count = bi;

    const rockGeo = new DodecahedronGeometry(0.5, 0);
    const rockMat = new MeshLambertMaterial({ color: '#a7a9a3', flatShading: true });
    const rockN = Math.round(70 * density);
    const rocks = make(rockGeo, rockMat, rockN);
    let ri = 0;
    for (let i = 0; i < rockN * 6 && ri < rockN; i++) {
      const x = ext.minX + rnd() * (ext.maxX - ext.minX);
      const z = ext.minZ + rnd() * (ext.maxZ - ext.minZ);
      if (!okSurf(x, z)) continue;
      const s = 0.4 + rnd() * 1.2;
      q.setFromAxisAngle(new Vector3(rnd(), 1, rnd()).normalize(), rnd() * 6.28);
      m.compose(p.set(x, heightAt(x, z) - s * 0.15, z), q, sc.set(s * (1 + rnd() * 0.5), s * 0.7, s));
      rocks.setMatrixAt(ri, m);
      rocks.setColorAt(ri, col.setHSL(0.1, 0.05, 0.6 + rnd() * 0.15));
      ri++;
    }
    rocks.count = ri;

    const flowerGeo = new IcosahedronGeometry(0.11, 0);
    const flowerMat = new MeshLambertMaterial({ color: '#ffffff', emissive: '#333333' });
    const FLOWER_COLS = ['#ffffff', '#ffe14d', '#ff8fb8', '#ffb347', '#d9a6ff'];
    const patchN = Math.round(40 * density);
    const flowers = make(flowerGeo, flowerMat, patchN * 9, false);
    let fi = 0;
    for (let i = 0; i < patchN * 5 && fi < patchN * 9 - 9; i++) {
      const x0 = b.minX + rnd() * (b.maxX - b.minX);
      const z0 = b.minZ + rnd() * (b.maxZ - b.minZ);
      if (!okSurf(x0, z0)) continue;
      const c = FLOWER_COLS[Math.floor(rnd() * FLOWER_COLS.length)];
      for (let k = 0; k < 9; k++) {
        const x = x0 + (rnd() - 0.5) * 2.4;
        const z = z0 + (rnd() - 0.5) * 2.4;
        m.compose(p.set(x, heightAt(x, z) + 0.08, z), q.identity(), sc.set(1, 0.6, 1));
        flowers.setMatrixAt(fi, m);
        flowers.setColorAt(fi, col.set(c));
        fi++;
      }
    }
    flowers.count = fi;
  }

  group.traverse((o) => {
    if (o instanceof InstancedMesh) {
      o.instanceMatrix.needsUpdate = true;
      if (o.instanceColor) o.instanceColor.needsUpdate = true;
      o.computeBoundingSphere();
    }
  });
  return {
    group,
    dispose() {
      disposables.forEach((d) => d.dispose());
    },
  };
}
