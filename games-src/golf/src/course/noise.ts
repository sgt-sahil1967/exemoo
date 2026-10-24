/**
 * Deterministic helpers for course generation: seeded PRNG, 2D value noise, smoothstep and
 * "blobs" (wobbly rotated ellipses with an approximate signed distance in metres) used for
 * greens, bunkers, water bodies and islands. Everything here is pure — no Math.random.
 */

/** Small fast seeded PRNG (mulberry32). Returns floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(ix: number, iz: number, seed: number): number {
  let h = (Math.imul(ix, 374761393) + Math.imul(iz, 668265263) + Math.imul(seed, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return ((h >>> 0) / 4294967295) * 2 - 1;
}

/** Smooth (C1) 2D value noise in [-1, 1] with unit lattice spacing. */
export function valueNoise(x: number, z: number, seed: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz, seed);
  const b = hash2(ix + 1, iz, seed);
  const c = hash2(ix, iz + 1, seed);
  const d = hash2(ix + 1, iz + 1, seed);
  const ab = a + (b - a) * ux;
  const cd = c + (d - c) * ux;
  return ab + (cd - ab) * uz;
}

export function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

// ─────────────────────────────────────── Blobs ───────────────────────────────────────

export interface BlobDef {
  x: number;
  z: number;
  /** Semi-axes (m) before rotation. */
  rx: number;
  rz: number;
  /** Rotation about +Y (radians). */
  rot?: number;
  /** Edge wobble amplitude (fraction of radius, ~0…0.2). */
  wob?: number;
  /** Bunker depth (m). */
  depth?: number;
}

/** A wobbly rotated ellipse with an approximate signed distance (metres, negative inside). */
export class Blob {
  readonly x: number;
  readonly z: number;
  readonly rx: number;
  readonly rz: number;
  readonly depth: number;
  /** Radius beyond which sd() returns a cheap (≥ 15 m) far estimate. */
  readonly reach: number;
  private readonly c: number;
  private readonly s: number;
  private readonly wob: number;
  private readonly p1: number;
  private readonly p2: number;
  private readonly meanR: number;
  private readonly maxR: number;

  constructor(d: BlobDef, rng: () => number) {
    this.x = d.x;
    this.z = d.z;
    this.rx = d.rx;
    this.rz = d.rz;
    const rot = d.rot ?? 0;
    this.c = Math.cos(rot);
    this.s = Math.sin(rot);
    this.wob = d.wob ?? 0;
    this.p1 = rng() * Math.PI * 2;
    this.p2 = rng() * Math.PI * 2;
    this.depth = d.depth ?? 0.45;
    this.meanR = (d.rx + d.rz) / 2;
    this.maxR = Math.max(d.rx, d.rz) * (1 + this.wob);
    this.reach = this.maxR + 15;
  }

  sd(x: number, z: number): number {
    const dx = x - this.x;
    const dz = z - this.z;
    const d2 = dx * dx + dz * dz;
    if (d2 > this.reach * this.reach) return Math.sqrt(d2) - this.maxR;
    const u = (dx * this.c - dz * this.s) / this.rx;
    const v = (dx * this.s + dz * this.c) / this.rz;
    const r = Math.sqrt(u * u + v * v);
    let k = 1;
    if (this.wob > 0 && r > 1e-6) {
      const phi = Math.atan2(v, u);
      k = 1 + this.wob * (0.6 * Math.cos(3 * phi + this.p1) + 0.4 * Math.cos(5 * phi + this.p2));
    }
    return (r / k - 1) * this.meanR;
  }
}
