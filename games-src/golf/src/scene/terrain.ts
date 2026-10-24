/**
 * Terrain: one height-field mesh over the hole bounds + a rising skirt, coloured with a baked
 * "splat" canvas texture (surface colours, mowing stripes, bunker lips, soft edges).
 */
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  LinearMipmapLinearFilter,
  Mesh,
  MeshLambertMaterial,
  SRGBColorSpace,
} from 'three';
import type { Hole, Quality, Surface } from '../core/contracts';
import { clamp, fbm, smoothstep, valueNoise } from './util';
import { makeCanvas } from './textures';

export const SKIRT = 90;

export interface Box {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface TerrainBuild {
  mesh: Mesh;
  /** Height including the skirt outside the hole bounds. */
  heightAt(x: number, z: number): number;
  ext: Box;
  /** Bounding box of water pixels (null if none). */
  waterBox: Box | null;
  dispose(): void;
}

const SURF_IDS: Surface[] = ['tee', 'fairway', 'fringe', 'green', 'rough', 'deepRough', 'sand', 'water', 'path', 'ob'];
const ID: Record<Surface, number> = Object.fromEntries(SURF_IDS.map((s, i) => [s, i])) as Record<Surface, number>;

/** sRGB hex → 0…255 triple (canvas space, no colour management). */
const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};
const COL = {
  fairA: rgb('#86d957'),
  fairB: rgb('#70c646'),
  greenA: rgb('#9ee86a'),
  greenB: rgb('#8bdb59'),
  fringe: rgb('#6fc248'),
  teeA: rgb('#8ddc5c'),
  teeB: rgb('#79cc4d'),
  rough: rgb('#59a83b'),
  rough2: rgb('#4c9a33'),
  deep: rgb('#428b2e'),
  deep2: rgb('#3a7f29'),
  sand: rgb('#f6e3a8'),
  sand2: rgb('#ead39a'),
  bed: rgb('#4f9b78'),
  path: rgb('#ded2b6'),
  ob: rgb('#3c8329'),
};

/** Creates the extended height function (skirt rises gently outside the bounds). */
export function makeHeightFn(hole: Hole) {
  const b = hole.bounds;
  return (x: number, z: number) => {
    if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ) return hole.heightAt(x, z);
    const cx = clamp(x, b.minX, b.maxX);
    const cz = clamp(z, b.minZ, b.maxZ);
    const d = Math.hypot(x - cx, z - cz);
    return hole.heightAt(cx, cz) + smoothstep(0, SKIRT * 0.85, d) * (3 + 9 * fbm(x * 0.018, z * 0.018));
  };
}

function axisCoords(min: number, max: number, inMin: number, inMax: number, step: number, skirtStep: number) {
  const out: number[] = [];
  const nS = Math.max(2, Math.ceil((inMin - min) / skirtStep));
  for (let i = 0; i < nS; i++) out.push(min + ((inMin - min) * i) / nS);
  const nI = Math.max(2, Math.ceil((inMax - inMin) / step));
  for (let i = 0; i <= nI; i++) out.push(inMin + ((inMax - inMin) * i) / nI);
  const nE = Math.max(2, Math.ceil((max - inMax) / skirtStep));
  for (let i = 1; i <= nE; i++) out.push(inMax + ((max - inMax) * i) / nE);
  return out;
}

export function buildTerrain(hole: Hole, quality: Quality, maxTex: number): TerrainBuild {
  const b = hole.bounds;
  const ext: Box = { minX: b.minX - SKIRT, maxX: b.maxX + SKIRT, minZ: b.minZ - SKIRT, maxZ: b.maxZ + SKIRT };
  const extW = ext.maxX - ext.minX;
  const extH = ext.maxZ - ext.minZ;
  const heightAt = makeHeightFn(hole);

  // ── geometry ──
  const inArea = (b.maxX - b.minX) * (b.maxZ - b.minZ);
  const baseStep = quality === 'high' ? 1.0 : quality === 'medium' ? 1.5 : 2.5;
  const maxVerts = quality === 'high' ? 240000 : quality === 'medium' ? 120000 : 50000;
  const step = Math.max(baseStep, Math.sqrt(inArea / maxVerts));
  const xs = axisCoords(ext.minX, ext.maxX, b.minX, b.maxX, step, 7);
  const zs = axisCoords(ext.minZ, ext.maxZ, b.minZ, b.maxZ, step, 7);
  const nx = xs.length;
  const nz = zs.length;
  const pos = new Float32Array(nx * nz * 3);
  const uv = new Float32Array(nx * nz * 2);
  const col = new Float32Array(nx * nz * 3);
  for (let j = 0; j < nz; j++) {
    const z = zs[j];
    for (let i = 0; i < nx; i++) {
      const x = xs[i];
      const k = j * nx + i;
      pos[k * 3] = x;
      pos[k * 3 + 1] = heightAt(x, z);
      pos[k * 3 + 2] = z;
      uv[k * 2] = (x - ext.minX) / extW;
      uv[k * 2 + 1] = (z - ext.minZ) / extH; // canvas row 0 (top, v=1) holds maxZ
      const n = 0.93 + 0.07 * valueNoise(x * 0.09, z * 0.09);
      col[k * 3] = n;
      col[k * 3 + 1] = n;
      col[k * 3 + 2] = n;
    }
  }
  const idx = new Uint32Array((nx - 1) * (nz - 1) * 6);
  let p = 0;
  for (let j = 0; j < nz - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i;
      const c = a + nx;
      idx[p++] = a;
      idx[p++] = c;
      idx[p++] = a + 1;
      idx[p++] = a + 1;
      idx[p++] = c;
      idx[p++] = c + 1;
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(pos, 3));
  geo.setAttribute('uv', new BufferAttribute(uv, 2));
  geo.setAttribute('color', new BufferAttribute(col, 3));
  geo.setIndex(new BufferAttribute(idx, 1));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();

  // ── splat texture ──
  const mPerPx = Math.max(quality === 'low' ? 0.8 : 0.5, extW / maxTex, extH / maxTex);
  const W = Math.ceil(extW / mPerPx);
  const H = Math.ceil(extH / mPerPx);
  const ids = new Uint8Array(W * H);
  let wMinX = Infinity,
    wMaxX = -Infinity,
    wMinZ = Infinity,
    wMaxZ = -Infinity;
  for (let j = 0; j < H; j++) {
    const z = ext.minZ + (j + 0.5) * mPerPx;
    const inZ = z >= b.minZ && z <= b.maxZ;
    for (let i = 0; i < W; i++) {
      const x = ext.minX + (i + 0.5) * mPerPx;
      let id = ID.ob;
      if (inZ && x >= b.minX && x <= b.maxX) {
        id = ID[hole.surfaceAt(x, z)];
        if (id === ID.water) {
          if (x < wMinX) wMinX = x;
          if (x > wMaxX) wMaxX = x;
          if (z < wMinZ) wMinZ = z;
          if (z > wMaxZ) wMaxZ = z;
        }
      }
      ids[j * W + i] = id;
    }
  }
  const sandNear = dilate(ids, W, H, ID.sand, 3);
  const waterNear = dilate(ids, W, H, ID.water, 3);
  const fwd = { x: hole.pin.x - hole.tee.x, z: hole.pin.z - hole.tee.z };
  const fl = Math.hypot(fwd.x, fwd.z) || 1;
  fwd.x /= fl;
  fwd.z /= fl;
  // diagonal mowing directions (±40° from the play line)
  const ca = Math.cos(0.7),
    sa = Math.sin(0.7);
  const d1 = { x: fwd.x * ca - fwd.z * sa, z: fwd.x * sa + fwd.z * ca };
  const d2 = { x: fwd.x * ca + fwd.z * sa, z: -fwd.x * sa + fwd.z * ca };

  const rgbBuf = new Float32Array(W * H * 3);
  const mix = (o: number, a: readonly number[], c: readonly number[], t: number, mul: number) => {
    rgbBuf[o] = (a[0] + (c[0] - a[0]) * t) * mul;
    rgbBuf[o + 1] = (a[1] + (c[1] - a[1]) * t) * mul;
    rgbBuf[o + 2] = (a[2] + (c[2] - a[2]) * t) * mul;
  };
  const stripe = (v: number) => smoothstep(0.35, 0.65, 0.5 + 0.5 * Math.sin(v));
  for (let j = 0; j < H; j++) {
    const z = ext.minZ + (j + 0.5) * mPerPx;
    for (let i = 0; i < W; i++) {
      const x = ext.minX + (i + 0.5) * mPerPx;
      const k = j * W + i;
      const o = k * 3;
      const id = ids[k];
      const nz = valueNoise(x * 0.25, z * 0.25);
      let mul = 1;
      if (sandNear[k] && id !== ID.sand && id !== ID.water) mul = 0.84;
      if (waterNear[k] && id !== ID.water) mul = Math.min(mul, 0.9);
      switch (id) {
        case ID.fairway: {
          const s1 = stripe(((x * d1.x + z * d1.z) / 7) * Math.PI);
          const s2 = stripe(((x * d2.x + z * d2.z) / 7) * Math.PI);
          const t = Math.abs(s1 - s2) * 0.85 + nz * 0.15;
          mix(o, COL.fairA, COL.fairB, t, mul);
          break;
        }
        case ID.green: {
          const s = stripe(((x * fwd.z - z * fwd.x) / 2.4) * Math.PI);
          mix(o, COL.greenA, COL.greenB, s * 0.8 + nz * 0.2, mul);
          break;
        }
        case ID.fringe:
          mix(o, COL.fringe, COL.fairB, nz * 0.4, mul);
          break;
        case ID.tee: {
          const s = stripe(((x * fwd.x + z * fwd.z) / 1.6) * Math.PI);
          mix(o, COL.teeA, COL.teeB, s, mul);
          break;
        }
        case ID.rough: {
          const tuft = valueNoise(x * 0.9, z * 0.9);
          mix(o, COL.rough, COL.rough2, fbm(x * 0.07, z * 0.07) * 0.9 + nz * 0.3, mul * (0.95 + tuft * 0.1));
          break;
        }
        case ID.deepRough: {
          const tuft = valueNoise(x * 0.8, z * 0.8);
          mix(o, COL.deep, COL.deep2, fbm(x * 0.05, z * 0.05) * 1.2 + nz * 0.2, mul * (0.92 + tuft * 0.14));
          break;
        }
        case ID.sand: {
          const edge = sandEdge(ids, W, H, i, j);
          mix(o, COL.sand, COL.sand2, nz * 0.5 + edge * 0.5, 1);
          break;
        }
        case ID.water:
          mix(o, COL.bed, COL.bed, 0, 1);
          break;
        case ID.path:
          mix(o, COL.path, COL.sand2, nz * 0.3, 1);
          break;
        default: {
          const f = fbm(x * 0.03, z * 0.03);
          mix(o, COL.deep, COL.ob, f, 0.96 + 0.08 * nz);
        }
      }
    }
  }
  boxBlur(rgbBuf, W, H);
  const canvas = makeCanvas(W, H);
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  const d = img.data;
  // canvas row 0 = top = v 1 = maxZ
  for (let j = 0; j < H; j++) {
    const row = H - 1 - j;
    for (let i = 0; i < W; i++) {
      const s = (j * W + i) * 3;
      const t = (row * W + i) * 4;
      d[t] = rgbBuf[s];
      d[t + 1] = rgbBuf[s + 1];
      d[t + 2] = rgbBuf[s + 2];
      d[t + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.needsUpdate = true;

  const mat = new MeshLambertMaterial({ map: tex, vertexColors: true });
  const mesh = new Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.name = 'terrain';

  const waterBox =
    wMinX <= wMaxX ? { minX: wMinX - 3, maxX: wMaxX + 3, minZ: wMinZ - 3, maxZ: wMaxZ + 3 } : null;

  return {
    mesh,
    heightAt,
    ext,
    waterBox,
    dispose() {
      geo.dispose();
      mat.dispose();
      tex.dispose();
    },
  };
}

/** Mask of pixels within r px of a pixel with the given id (separable max filter). */
function dilate(ids: Uint8Array, W: number, H: number, id: number, r: number) {
  const a = new Uint8Array(W * H);
  const out = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) {
    let last = -1e9;
    for (let i = 0; i < W; i++) {
      if (ids[j * W + i] === id) last = i;
      if (i - last <= r) a[j * W + i] = 1;
    }
    last = 1e9;
    for (let i = W - 1; i >= 0; i--) {
      if (ids[j * W + i] === id) last = i;
      if (last - i <= r) a[j * W + i] = 1;
    }
  }
  for (let i = 0; i < W; i++) {
    let last = -1e9;
    for (let j = 0; j < H; j++) {
      if (a[j * W + i]) last = j;
      if (j - last <= r) out[j * W + i] = 1;
    }
    last = 1e9;
    for (let j = H - 1; j >= 0; j--) {
      if (a[j * W + i]) last = j;
      if (last - j <= r) out[j * W + i] = 1;
    }
  }
  return out;
}

/** 0…1: how close a sand pixel is to the bunker edge (for a darker rim). */
function sandEdge(ids: Uint8Array, W: number, H: number, i: number, j: number) {
  const s = ids[j * W + i];
  let e = 0;
  for (let r = 1; r <= 3; r++) {
    const l = ids[j * W + Math.max(0, i - r)];
    const rr = ids[j * W + Math.min(W - 1, i + r)];
    const u = ids[Math.max(0, j - r) * W + i];
    const dn = ids[Math.min(H - 1, j + r) * W + i];
    if (l !== s || rr !== s || u !== s || dn !== s) {
      e = 1 - (r - 1) / 3;
      break;
    }
  }
  return e;
}

/** 3×3 box blur (two separable passes) to soften surface edges. */
function boxBlur(buf: Float32Array, W: number, H: number) {
  const tmp = new Float32Array(buf.length);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const l = Math.max(0, i - 1);
      const r = Math.min(W - 1, i + 1);
      for (let c = 0; c < 3; c++) {
        tmp[(j * W + i) * 3 + c] = (buf[(j * W + l) * 3 + c] + buf[(j * W + i) * 3 + c] + buf[(j * W + r) * 3 + c]) / 3;
      }
    }
  }
  for (let j = 0; j < H; j++) {
    const u = Math.max(0, j - 1);
    const dn = Math.min(H - 1, j + 1);
    for (let i = 0; i < W; i++) {
      for (let c = 0; c < 3; c++) {
        buf[(j * W + i) * 3 + c] = (tmp[(u * W + i) * 3 + c] + tmp[(j * W + i) * 3 + c] + tmp[(dn * W + i) * 3 + c]) / 3;
      }
    }
  }
}
