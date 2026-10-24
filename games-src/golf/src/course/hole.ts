/**
 * Runtime hole builder: turns an authored HoleSpec (centreline, fairway profile, green, bunkers,
 * water, tree rules, elevation) into a `Hole` (see src/core/contracts.ts).
 *
 * Terrain = IDW elevation profile + seeded value-noise hills, then features are stamped on:
 * tee platform, green plane (1–3 % slope, optional tier), bunker bowls with a lip, water basins
 * with banks. Heights are precomputed on a 1 m grid (bilinear); within ~16 m of the green the
 * analytic function is used directly so putting surfaces are perfectly smooth. Surfaces are
 * analytic (cheap): water > sand > green > fringe > tee > fairway > rough > deepRough > ob.
 */
import { Vector3 } from 'three';
import type { Hole, HoleDef, Surface, Tree } from '../core/contracts';
import { YARD } from '../core/contracts';
import { Blob, type BlobDef, clamp, lerp, mulberry32, smoothstep, valueNoise } from './noise';

export type TreeKind = Tree['kind'];

export interface GreenSpec {
  /** Mean radius (m). */
  r: number;
  /** Elongation: rx = r·(1+elong), rz = r·(1−elong) before rotation. */
  elong?: number;
  rot?: number;
  wob?: number;
  /** Plane gradient dh/dx, dh/dz (0.01 … 0.03). */
  slope: [number, number];
  /** Optional tier: a smooth step of height `h` across the line `offset` m from the centre along
   *  direction `angle` (radians in the xz plane, 0 = +X). */
  tier?: { angle: number; offset: number; h: number };
  /** Pin offset from the green centre (m). */
  pin: [number, number];
}

export interface TreeSpec {
  kinds: Partial<Record<TreeKind, number>>;
  count: number;
  /** Min distance beyond the fairway edge (m). */
  gap: number;
  /** Width of the band (beyond gap) where line trees are placed (m). */
  band: number;
  /** Extra clusters: [x, z, radius, count]. */
  clusters?: [number, number, number, number][];
}

export interface HoleSpec extends HoleDef {
  seed: number;
  /** Control points (x, z); first is the tee, last is the green centre. */
  path: [number, number][];
  /** Fairway half-width profile [s metres along centreline, half-width]; 0 = no fairway. */
  fairway: [number, number][];
  /** Elevation profile [s metres, height]. */
  elev: [number, number][];
  /** Hill amplitude (m). */
  hills: number;
  /** Rough band width beyond the fairway (m, default 16). */
  rough?: number;
  green: GreenSpec;
  bunkers: BlobDef[];
  water?: BlobDef[];
  islands?: BlobDef[];
  trees: TreeSpec;
}

const FIELD_RES = 3; // distance-field grid (m)
const H_RES = 1; // height grid (m)
const OB_DIST = 64; // beyond this distance from the centreline → ob
const TEE_HALF_W = 3.5;
const TEE_FRONT = 3.5;
const TEE_BACK = 6.5;
const BANK = 5; // water bank width (m)
const ANALYTIC_GREEN = 16; // sd from green edge inside which heightAt is analytic

function profile(p: [number, number][], s: number): number {
  if (s <= p[0][0]) return p[0][1];
  for (let i = 1; i < p.length; i++) {
    if (s <= p[i][0]) {
      const [s0, v0] = p[i - 1];
      const [s1, v1] = p[i];
      return v0 + ((v1 - v0) * (s - s0)) / Math.max(1e-6, s1 - s0);
    }
  }
  return p[p.length - 1][1];
}

/** Catmull-Rom sampled polyline through the control points (spacing ≈ `step`). */
function spline(pts: [number, number][], step: number): [number, number][] {
  const out: [number, number][] = [];
  const n = pts.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const k = Math.max(2, Math.ceil(len / step));
    for (let j = 0; j < k; j++) {
      const t = j / k;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push([pts[n - 1][0], pts[n - 1][1]]);
  return out;
}

export class BuiltHole implements Hole {
  readonly def: HoleDef;
  readonly tee: Vector3;
  readonly pin: Vector3;
  readonly greenCenter: Vector3;
  readonly greenRadius: number;
  readonly bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  readonly centerline: readonly Vector3[];
  readonly trees: readonly Tree[];
  readonly waterLevel: number | null;
  readonly yards: number;
  /** Centreline length in metres. */
  readonly length: number;

  private readonly spec: HoleSpec;
  private readonly seed: number;
  // fine centreline
  private readonly lx: Float64Array;
  private readonly lz: Float64Array;
  private readonly ls: Float64Array;
  private readonly elbowS: number[];
  // distance field
  private readonly fNx: number;
  private readonly fNz: number;
  private readonly fD: Float32Array;
  private readonly fS: Float32Array;
  // height grid
  private readonly hNx: number;
  private readonly hNz: number;
  private readonly hG: Float32Array;
  // features
  private readonly green: Blob;
  private readonly bunkers: Blob[];
  private readonly water: Blob[];
  private readonly islands: Blob[];
  private readonly elevPts: { x: number; z: number; h: number }[];
  private readonly teeYaw: number;
  private readonly teeC: number;
  private readonly teeS: number;
  private teeTop = 0;
  private greenH = 0;
  private wl = -1e9;
  private readonly tierNx: number = 0;
  private readonly tierNz: number = 0;

  constructor(spec: HoleSpec) {
    this.spec = spec;
    this.seed = spec.seed;
    this.def = { number: spec.number, name: spec.name, par: spec.par, tier: spec.tier };
    const rng = mulberry32(spec.seed);

    const gc = spec.path[spec.path.length - 1];
    const pinXZ: [number, number] = [gc[0] + spec.green.pin[0], gc[1] + spec.green.pin[1]];
    const ctrl = spec.path.slice(0, -1).concat([pinXZ]);

    // Fine centreline (2 m)
    const fine = spline(ctrl, 2);
    const n = fine.length;
    this.lx = new Float64Array(n);
    this.lz = new Float64Array(n);
    this.ls = new Float64Array(n);
    let acc = 0;
    for (let i = 0; i < n; i++) {
      if (i > 0) acc += Math.hypot(fine[i][0] - fine[i - 1][0], fine[i][1] - fine[i - 1][1]);
      this.lx[i] = fine[i][0];
      this.lz[i] = fine[i][1];
      this.ls[i] = acc;
    }
    this.length = acc;
    this.yards = Math.round(acc / YARD);

    // Elbows (interior control points with a turn > 12°)
    this.elbowS = [];
    for (let i = 1; i < ctrl.length - 1; i++) {
      const a = Math.atan2(ctrl[i][0] - ctrl[i - 1][0], ctrl[i][1] - ctrl[i - 1][1]);
      const b = Math.atan2(ctrl[i + 1][0] - ctrl[i][0], ctrl[i + 1][1] - ctrl[i][1]);
      let d = Math.abs(b - a);
      if (d > Math.PI) d = 2 * Math.PI - d;
      if (d > (12 * Math.PI) / 180) this.elbowS.push(this.projectS(ctrl[i][0], ctrl[i][1]));
    }

    // Bounds
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (let i = 0; i < n; i++) {
      minX = Math.min(minX, this.lx[i]);
      maxX = Math.max(maxX, this.lx[i]);
      minZ = Math.min(minZ, this.lz[i]);
      maxZ = Math.max(maxZ, this.lz[i]);
    }
    this.bounds = {
      minX: Math.floor(minX - 72),
      maxX: Math.ceil(maxX + 72),
      minZ: Math.floor(minZ - 55),
      maxZ: Math.ceil(maxZ + 35),
    };

    // Features
    const g = spec.green;
    const el = g.elong ?? 0.08;
    this.green = new Blob({ x: gc[0], z: gc[1], rx: g.r * (1 + el), rz: g.r * (1 - el), rot: g.rot ?? 0, wob: g.wob ?? 0.08 }, rng);
    this.greenRadius = g.r;
    this.bunkers = spec.bunkers.map((b) => new Blob(b, rng));
    this.water = (spec.water ?? []).map((b) => new Blob(b, rng));
    this.islands = (spec.islands ?? []).map((b) => new Blob(b, rng));
    if (g.tier) {
      this.tierNx = Math.cos(g.tier.angle);
      this.tierNz = Math.sin(g.tier.angle);
    }
    this.teeYaw = Math.atan2(-(ctrl[1][0] - ctrl[0][0]), -(ctrl[1][1] - ctrl[0][1]));
    this.teeC = Math.cos(this.teeYaw);
    this.teeS = Math.sin(this.teeYaw);
    this.elevPts = spec.elev.map(([s, h]) => {
      const p = this.pointAtS(s);
      return { x: p[0], z: p[1], h };
    });

    // Distance field
    const B = this.bounds;
    this.fNx = Math.ceil((B.maxX - B.minX) / FIELD_RES) + 1;
    this.fNz = Math.ceil((B.maxZ - B.minZ) / FIELD_RES) + 1;
    this.fD = new Float32Array(this.fNx * this.fNz);
    this.fS = new Float32Array(this.fNx * this.fNz);
    this.buildField();

    // Reference heights
    this.teeTop = this.baseHeight(ctrl[0][0], ctrl[0][1], 0) + 0.35;
    this.greenH = this.baseHeight(gc[0], gc[1], 0) + 0.3;

    // Water level: just below the lowest dry ground around the water
    if (this.water.length) {
      let minH = Infinity;
      for (const w of this.water) {
        const R = w.reach;
        for (let x = w.x - R; x <= w.x + R; x += 3) {
          for (let z = w.z - R; z <= w.z + R; z += 3) {
            const sd = this.waterSd(x, z);
            if (sd >= 0 && sd <= 12) minH = Math.min(minH, this.featureHeight(x, z));
          }
        }
      }
      this.wl = (Number.isFinite(minH) ? minH : 0) - 0.3;
      this.waterLevel = this.wl;
    } else {
      this.waterLevel = null;
    }

    // Height grid
    this.hNx = Math.ceil((B.maxX - B.minX) / H_RES) + 1;
    this.hNz = Math.ceil((B.maxZ - B.minZ) / H_RES) + 1;
    this.hG = new Float32Array(this.hNx * this.hNz);
    for (let j = 0; j < this.hNz; j++) {
      const z = B.minZ + j * H_RES;
      for (let i = 0; i < this.hNx; i++) {
        this.hG[j * this.hNx + i] = this.heightRaw(B.minX + i * H_RES, z);
      }
    }

    this.greenCenter = new Vector3(gc[0], this.heightAt(gc[0], gc[1]), gc[1]);
    this.pin = new Vector3(pinXZ[0], this.heightAt(pinXZ[0], pinXZ[1]), pinXZ[1]);
    this.tee = new Vector3(ctrl[0][0], this.heightAt(ctrl[0][0], ctrl[0][1]), ctrl[0][1]);

    // Public centreline every ~10 m
    const cl: Vector3[] = [];
    const steps = Math.max(2, Math.round(this.length / 10));
    for (let k = 0; k <= steps; k++) {
      const p = this.pointAtS((this.length * k) / steps);
      cl.push(new Vector3(p[0], this.heightAt(p[0], p[1]), p[1]));
    }
    this.centerline = cl;

    this.trees = this.placeTrees(mulberry32(spec.seed * 7 + 3));
  }

  // ───────────────────────────── centreline helpers ─────────────────────────────

  /** Point (x, z) on the fine centreline at arc length s (clamped). */
  pointAtS(s: number): [number, number] {
    const ls = this.ls;
    const n = ls.length;
    if (s <= 0) return [this.lx[0], this.lz[0]];
    if (s >= ls[n - 1]) return [this.lx[n - 1], this.lz[n - 1]];
    let lo = 0;
    let hi = n - 1;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (ls[m] <= s) lo = m;
      else hi = m;
    }
    const t = (s - ls[lo]) / Math.max(1e-9, ls[hi] - ls[lo]);
    return [lerp(this.lx[lo], this.lx[hi], t), lerp(this.lz[lo], this.lz[hi], t)];
  }

  /** Exact nearest arc length on the centreline. */
  projectS(x: number, z: number): number {
    let best = Infinity;
    let bs = 0;
    for (let i = 0; i < this.lx.length - 1; i++) {
      const ax = this.lx[i];
      const az = this.lz[i];
      const dx = this.lx[i + 1] - ax;
      const dz = this.lz[i + 1] - az;
      const l2 = dx * dx + dz * dz;
      const t = l2 > 0 ? clamp(((x - ax) * dx + (z - az) * dz) / l2, 0, 1) : 0;
      const ex = ax + dx * t - x;
      const ez = az + dz * t - z;
      const d2 = ex * ex + ez * ez;
      if (d2 < best) {
        best = d2;
        bs = this.ls[i] + t * (this.ls[i + 1] - this.ls[i]);
      }
    }
    return bs;
  }

  private buildField() {
    // Coarse polyline (~6 m) for the field
    const idx: number[] = [0];
    for (let i = 1; i < this.lx.length; i++) {
      if (this.ls[i] - this.ls[idx[idx.length - 1]] >= 6 || i === this.lx.length - 1) idx.push(i);
    }
    const m = idx.length;
    const ax = new Float64Array(m);
    const az = new Float64Array(m);
    const as = new Float64Array(m);
    for (let k = 0; k < m; k++) {
      ax[k] = this.lx[idx[k]];
      az[k] = this.lz[idx[k]];
      as[k] = this.ls[idx[k]];
    }
    const B = this.bounds;
    for (let j = 0; j < this.fNz; j++) {
      const z = B.minZ + j * FIELD_RES;
      for (let i = 0; i < this.fNx; i++) {
        const x = B.minX + i * FIELD_RES;
        let best = Infinity;
        let bs = 0;
        for (let k = 0; k < m - 1; k++) {
          const dx = ax[k + 1] - ax[k];
          const dz = az[k + 1] - az[k];
          const px = x - ax[k];
          const pz = z - az[k];
          const l2 = dx * dx + dz * dz;
          let t = (px * dx + pz * dz) / l2;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const ex = px - dx * t;
          const ez = pz - dz * t;
          const d2 = ex * ex + ez * ez;
          if (d2 < best) {
            best = d2;
            bs = as[k] + t * (as[k + 1] - as[k]);
          }
        }
        this.fD[j * this.fNx + i] = Math.sqrt(best);
        this.fS[j * this.fNx + i] = bs;
      }
    }
  }

  private fieldSample(arr: Float32Array, x: number, z: number): number {
    const B = this.bounds;
    const fx = clamp((x - B.minX) / FIELD_RES, 0, this.fNx - 1.0001);
    const fz = clamp((z - B.minZ) / FIELD_RES, 0, this.fNz - 1.0001);
    const i = Math.floor(fx);
    const j = Math.floor(fz);
    const tx = fx - i;
    const tz = fz - j;
    const k = j * this.fNx + i;
    const a = arr[k] + (arr[k + 1] - arr[k]) * tx;
    const b = arr[k + this.fNx] + (arr[k + this.fNx + 1] - arr[k + this.fNx]) * tx;
    return a + (b - a) * tz;
  }

  /** Approximate distance from the centreline (m). */
  distAt(x: number, z: number): number {
    return this.fieldSample(this.fD, x, z);
  }

  /** Approximate arc length of the nearest centreline point (m). */
  sAt(x: number, z: number): number {
    return this.fieldSample(this.fS, x, z);
  }

  private fairwayHalf(x: number, z: number, s: number): number {
    const hw = profile(this.spec.fairway, s);
    if (hw <= 0) return 0;
    return Math.max(0, hw + 1.6 * valueNoise(x / 18, z / 18, this.seed + 11));
  }

  // ───────────────────────────────── terrain ─────────────────────────────────

  private elevation(x: number, z: number): number {
    let sw = 0;
    let sh = 0;
    for (const p of this.elevPts) {
      const dx = x - p.x;
      const dz = z - p.z;
      const q = dx * dx + dz * dz + 1600;
      const w = 1 / (q * q);
      sw += w;
      sh += w * p.h;
    }
    return sw > 0 ? sh / sw : 0;
  }

  private baseHeight(x: number, z: number, d: number): number {
    const amp = this.spec.hills * (0.5 + 0.5 * smoothstep(18, 45, d));
    return (
      this.elevation(x, z) +
      amp * (0.7 * valueNoise(x / 55, z / 55, this.seed) + 0.3 * valueNoise(x / 22 + 17, z / 22 - 9, this.seed + 1)) +
      0.12 * valueNoise(x / 7, z / 7, this.seed + 2)
    );
  }

  private teeBoxSd(x: number, z: number): number {
    const dx = x - this.lx[0];
    const dz = z - this.lz[0];
    // local: u = right, v = backward
    const u = dx * this.teeC - dz * this.teeS;
    const v = dx * this.teeS + dz * this.teeC;
    const ox = Math.abs(u) - TEE_HALF_W;
    const oz = v < 0 ? -v - TEE_FRONT : v - TEE_BACK;
    if (ox <= 0 && oz <= 0) return Math.max(ox, oz);
    return Math.hypot(Math.max(ox, 0), Math.max(oz, 0));
  }

  private greenPlane(x: number, z: number): number {
    const g = this.spec.green;
    const dx = x - this.green.x;
    const dz = z - this.green.z;
    let h = this.greenH + g.slope[0] * dx + g.slope[1] * dz;
    if (g.tier) {
      const t = dx * this.tierNx + dz * this.tierNz - g.tier.offset;
      h += g.tier.h * smoothstep(-2.2, 2.2, t);
    }
    return h;
  }

  private waterSd(x: number, z: number): number {
    let sw = Infinity;
    for (const w of this.water) sw = Math.min(sw, w.sd(x, z));
    if (!this.islands.length) return sw;
    let si = Infinity;
    for (const w of this.islands) si = Math.min(si, w.sd(x, z));
    return Math.max(sw, -si);
  }

  /** Terrain + tee + green + bunkers (no water). */
  private featureHeight(x: number, z: number): number {
    const d = this.distAt(x, z);
    let h = this.baseHeight(x, z, d);
    const tb = this.teeBoxSd(x, z);
    if (tb < 5) h = lerp(h, this.teeTop, 1 - smoothstep(0, 5, tb));
    const sg = this.green.sd(x, z);
    if (sg < 12) h = lerp(h, this.greenPlane(x, z), 1 - smoothstep(3.5, 12, sg));
    for (const b of this.bunkers) {
      const sd = b.sd(x, z);
      if (sd < 0) h -= b.depth * smoothstep(0, 2.2, -sd);
      else if (sd < 2) h += 0.15 * Math.sin((Math.PI * sd) / 2);
    }
    return h;
  }

  private heightRaw(x: number, z: number): number {
    let h = this.featureHeight(x, z);
    if (this.water.length) {
      const sd = this.waterSd(x, z);
      if (sd < 0) {
        h = this.wl - 0.35 - 1.6 * smoothstep(0, 8, -sd);
      } else {
        if (sd < BANK) h = lerp(this.wl + 0.12, h, smoothstep(0, BANK, sd));
        if (h < this.wl + 0.12) h = this.wl + 0.12;
      }
    }
    return h;
  }

  heightAt(x: number, z: number): number {
    const B = this.bounds;
    if (x < B.minX) x = B.minX;
    else if (x > B.maxX) x = B.maxX;
    if (z < B.minZ) z = B.minZ;
    else if (z > B.maxZ) z = B.maxZ;
    const gx = x - this.green.x;
    const gz = z - this.green.z;
    const gr = this.green.reach + ANALYTIC_GREEN;
    if (gx * gx + gz * gz < gr * gr && this.green.sd(x, z) < ANALYTIC_GREEN) return this.heightRaw(x, z);
    const fx = Math.min((x - B.minX) / H_RES, this.hNx - 1.0001);
    const fz = Math.min((z - B.minZ) / H_RES, this.hNz - 1.0001);
    const i = Math.floor(fx);
    const j = Math.floor(fz);
    const tx = fx - i;
    const tz = fz - j;
    const k = j * this.hNx + i;
    const g = this.hG;
    const a = g[k] + (g[k + 1] - g[k]) * tx;
    const b = g[k + this.hNx] + (g[k + this.hNx + 1] - g[k + this.hNx]) * tx;
    return a + (b - a) * tz;
  }

  normalAt(x: number, z: number, out?: Vector3): Vector3 {
    const e = 0.25;
    const hx = (this.heightAt(x + e, z) - this.heightAt(x - e, z)) / (2 * e);
    const hz = (this.heightAt(x, z + e) - this.heightAt(x, z - e)) / (2 * e);
    const o = out ?? new Vector3();
    return o.set(-hx, 1, -hz).normalize();
  }

  inBounds(x: number, z: number): boolean {
    const B = this.bounds;
    return x >= B.minX && x <= B.maxX && z >= B.minZ && z <= B.maxZ;
  }

  surfaceAt(x: number, z: number): Surface {
    if (!this.inBounds(x, z)) return 'ob';
    if (this.water.length && this.waterSd(x, z) < 0) return 'water';
    for (const b of this.bunkers) if (b.sd(x, z) < 0) return 'sand';
    const sg = this.green.sd(x, z);
    if (sg < 0) return 'green';
    if (sg < 1.5) return 'fringe';
    if (this.teeBoxSd(x, z) <= 0) return 'tee';
    const d = this.distAt(x, z);
    if (d > OB_DIST) return 'ob';
    const s = this.sAt(x, z);
    const hw = this.fairwayHalf(x, z, s);
    if (d < hw) return 'fairway';
    if (d < Math.max(hw, 12) + (this.spec.rough ?? 16)) return 'rough';
    return 'deepRough';
  }

  // ───────────────────────────────── helpers ─────────────────────────────────

  waterDrop(entry: Vector3, lastShotFrom: Vector3): Vector3 {
    let dx = entry.x - this.pin.x;
    let dz = entry.z - this.pin.z;
    const l = Math.hypot(dx, dz);
    if (l < 1e-6) {
      dx = lastShotFrom.x - this.pin.x;
      dz = lastShotFrom.z - this.pin.z;
    }
    const L = Math.hypot(dx, dz) || 1;
    dx /= L;
    dz /= L;
    const ok = (s: Surface) => s !== 'water' && s !== 'sand' && s !== 'ob';
    for (let t = 0; t < 400; t += 0.5) {
      const x = entry.x + dx * t;
      const z = entry.z + dz * t;
      if (!this.inBounds(x, z)) break;
      if (ok(this.surfaceAt(x, z))) {
        const x2 = x + dx * 2;
        const z2 = z + dz * 2;
        if (ok(this.surfaceAt(x2, z2))) return new Vector3(x2, this.heightAt(x2, z2), z2);
      }
    }
    const p = lastShotFrom.clone();
    p.y = this.heightAt(p.x, p.z);
    return p;
  }

  aimTarget(from: Vector3, maxCarryM: number): Vector3 {
    const dp = Math.hypot(this.pin.x - from.x, this.pin.z - from.z);
    if (dp <= maxCarryM * 1.04) return this.pin.clone();
    const s0 = this.projectS(from.x, from.z);
    let sEnd = this.length;
    for (const e of this.elbowS) {
      if (e > s0 + 20) {
        sEnd = e;
        break;
      }
    }
    // Farthest centreline point within reach (up to the next elbow)
    let best = -1;
    for (let s = s0 + 5; s <= sEnd + 1e-6; s += 2) {
      const p = this.pointAtS(s);
      if (Math.hypot(p[0] - from.x, p[1] - from.z) <= maxCarryM) best = s;
      else if (best >= 0) break;
    }
    if (best < 0) best = Math.min(sEnd, s0 + maxCarryM);
    // Back off hazards
    for (let s = best; s > s0 + 10; s -= 2) {
      const p = this.pointAtS(s);
      const surf = this.surfaceAt(p[0], p[1]);
      if (surf !== 'water' && surf !== 'sand' && surf !== 'ob') {
        best = s;
        break;
      }
    }
    const p = this.pointAtS(best);
    return new Vector3(p[0], this.heightAt(p[0], p[1]), p[1]);
  }

  // ───────────────────────────────── trees ─────────────────────────────────

  private placeTrees(rng: () => number): Tree[] {
    const ts = this.spec.trees;
    const kinds = Object.entries(ts.kinds) as [TreeKind, number][];
    const totalW = kinds.reduce((a, [, w]) => a + w, 0);
    const pickKind = (): TreeKind => {
      let r = rng() * totalW;
      for (const [k, w] of kinds) {
        r -= w;
        if (r <= 0) return k;
      }
      return kinds[0][0];
    };
    const trees: Tree[] = [];
    const B = this.bounds;
    const gx = this.green.x;
    const gz = this.green.z;
    const tx = this.lx[0];
    const tz = this.lz[0];
    const valid = (x: number, z: number, minD: number) => {
      if (x < B.minX + 3 || x > B.maxX - 3 || z < B.minZ + 3 || z > B.maxZ - 3) return false;
      if (Math.hypot(x - gx, z - gz) < this.greenRadius * 1.25 + 9) return false;
      if (Math.hypot(x - tx, z - tz) < 16) return false;
      const d = this.distAt(x, z);
      if (d < minD) return false;
      const s = this.sAt(x, z);
      if (d < this.fairwayHalf(x, z, s) + 4) return false;
      const surf = this.surfaceAt(x, z);
      if (surf !== 'rough' && surf !== 'deepRough' && surf !== 'ob') return false;
      if (this.water.length && this.waterSd(x, z) < 4) return false;
      for (const b of this.bunkers) if (b.sd(x, z) < 3) return false;
      for (const t of trees) {
        const ddx = t.pos.x - x;
        const ddz = t.pos.z - z;
        if (ddx * ddx + ddz * ddz < 20) return false;
      }
      return true;
    };
    const add = (x: number, z: number) => {
      const kind = pickKind();
      let height: number;
      let radius: number;
      if (kind === 'pine') {
        height = 10 + rng() * 6;
        radius = 2 + rng() * 1.5;
      } else if (kind === 'palm') {
        height = 8 + rng() * 5;
        radius = 2 + rng() * 1.5;
      } else {
        height = 6 + rng() * 6;
        radius = 3 + rng() * 2;
      }
      trees.push({ pos: new Vector3(x, this.heightAt(x, z), z), radius, height, kind });
    };

    for (const [cx, cz, cr, cn] of ts.clusters ?? []) {
      let placed = 0;
      for (let a = 0; a < cn * 10 && placed < cn; a++) {
        const ang = rng() * Math.PI * 2;
        const r = Math.sqrt(rng()) * cr;
        const x = cx + Math.cos(ang) * r;
        const z = cz + Math.sin(ang) * r;
        if (valid(x, z, 10)) {
          add(x, z);
          placed++;
        }
      }
    }
    const L = this.length;
    let attempts = 0;
    while (trees.length < ts.count && attempts < ts.count * 25) {
      attempts++;
      const s = -25 + rng() * (L + 55);
      const sc = clamp(s, 0, L);
      const p = this.pointAtS(sc);
      const q = this.pointAtS(clamp(sc + 2, 0, L));
      const pb = this.pointAtS(clamp(sc - 2, 0, L));
      let dx = q[0] - pb[0];
      let dz = q[1] - pb[1];
      const dl = Math.hypot(dx, dz) || 1;
      dx /= dl;
      dz /= dl;
      const side = rng() < 0.5 ? -1 : 1;
      const hw = Math.max(profile(this.spec.fairway, sc), 12);
      const off = hw + ts.gap + rng() * ts.band;
      const along = s - sc;
      const x = p[0] + dx * along - dz * side * off + (rng() - 0.5) * 4;
      const z = p[1] + dz * along + dx * side * off + (rng() - 0.5) * 4;
      if (valid(x, z, 12)) add(x, z);
    }
    return trees;
  }
}
