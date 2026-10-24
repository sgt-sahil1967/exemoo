/**
 * A quick, self-contained par-4 used to develop & test the scene without src/course.
 * Dogleg-left fairway, fairway + greenside bunkers, a pond, a cart path and trees.
 */
import { Vector3 } from 'three';
import type { Hole, Surface, Tree } from '../core/contracts';
import { YARD } from '../core/contracts';
import { mulberry32, smoothstep } from './util';

const CL2 = [
  [0, 0],
  [2, -120],
  [-10, -215],
  [-44, -318],
] as const;
const PIN = { x: -44, z: -318 };
const GC = { x: -45, z: -315 };
const BOUNDS = { minX: -120, maxX: 75, minZ: -370, maxZ: 28 };
const POND = { x: -52, z: -150, rx: 20, rz: 32 };
const BUNKERS = [
  { x: 16, z: -200, rx: 9, rz: 5, rot: 0.3 },
  { x: -30, z: -228, rx: 7, rz: 5.5, rot: -0.6 },
  { x: -28, z: -312, rx: 4, rz: 7.5, rot: 0.2 },
  { x: -60, z: -326, rx: 6, rz: 3.5, rot: 0.5 },
  { x: -44, z: -337, rx: 7, rz: 2.8, rot: -0.1 },
];

function base(x: number, z: number) {
  return (
    1.6 * Math.sin(x * 0.031 + 0.7) * Math.cos(z * 0.021) +
    1.2 * Math.sin(z * 0.013 + 2) +
    0.6 * Math.sin((x - z) * 0.045) +
    0.25 * Math.sin(x * 0.11 + z * 0.07)
  );
}

/** Distance from p to the centreline polyline + arc-length position along it. */
function centreDist(x: number, z: number) {
  let best = 1e9;
  let bestS = 0;
  let acc = 0;
  for (let i = 0; i < CL2.length - 1; i++) {
    const [ax, az] = CL2[i];
    const [bx, bz] = CL2[i + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const len2 = dx * dx + dz * dz;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2));
    const px = ax + dx * t - x;
    const pz = az + dz * t - z;
    const d = Math.sqrt(px * px + pz * pz);
    const len = Math.sqrt(len2);
    if (d < best) {
      best = d;
      bestS = acc + t * len;
    }
    acc += len;
  }
  return { d: best, s: bestS };
}

function ellipseD(x: number, z: number, e: { x: number; z: number; rx: number; rz: number; rot?: number }) {
  const c = Math.cos(e.rot ?? 0);
  const s = Math.sin(e.rot ?? 0);
  const lx = (x - e.x) * c - (z - e.z) * s;
  const lz = (x - e.x) * s + (z - e.z) * c;
  // a little wobble so shapes look organic
  const a = Math.atan2(lz, lx);
  const wob = 1 + 0.08 * Math.sin(a * 3 + e.x) + 0.05 * Math.cos(a * 5 + e.z);
  return Math.sqrt((lx / e.rx) ** 2 + (lz / e.rz) ** 2) / wob;
}

function greenD(x: number, z: number) {
  const a = Math.atan2(z - GC.z, x - GC.x);
  const r = 14 + 2.5 * Math.sin(2 * a + 1) + 1.4 * Math.cos(3 * a);
  return { n: Math.hypot(x - GC.x, z - GC.z) / r, r };
}

const POND_BASE = base(POND.x, POND.z);
const WATER = POND_BASE - 0.3;
const TEE_H = base(0, 0) + 1.0;
const GREEN_H = base(GC.x, GC.z) + 0.8;

function heightAt(x: number, z: number): number {
  const cd = centreDist(x, z);
  let h = base(x, z) + Math.min(cd.d, 70) ** 2 * 0.0011;
  // tee box plateau
  const tw = 1 - smoothstep(0, 5, Math.max(Math.abs(x) - 5, Math.abs(z) - 7));
  h += (TEE_H - h) * tw;
  // green plateau with gentle tilt + a ridge
  const g = greenD(x, z);
  const gw = 1 - smoothstep(1.0, 1.9, g.n);
  const gh = GREEN_H + 0.045 * (x - GC.x) - 0.03 * (z - GC.z) + 0.18 * Math.sin((x - GC.x) * 0.35 + (z - GC.z) * 0.12);
  h += (gh - h) * gw;
  // bunkers
  for (const b of BUNKERS) {
    const d = ellipseD(x, z, b);
    h -= 0.55 * (1 - smoothstep(0.55, 1.08, d));
  }
  // pond
  const pd = ellipseD(x, z, { ...POND, rot: 0.25 });
  const bowl = 1 - smoothstep(0.65, 1.3, pd);
  h += (WATER - 1.6 - h) * bowl;
  if (pd > 1) h = Math.max(h, WATER + 0.25 * Math.min(1, (pd - 1) * 4));
  return h;
}

function surfaceAt(x: number, z: number): Surface {
  if (x < BOUNDS.minX || x > BOUNDS.maxX || z < BOUNDS.minZ || z > BOUNDS.maxZ) return 'ob';
  if (ellipseD(x, z, { ...POND, rot: 0.25 }) <= 1.05 && heightAt(x, z) < WATER) return 'water';
  const g = greenD(x, z);
  if (g.n <= 1) return 'green';
  for (const b of BUNKERS) if (ellipseD(x, z, b) <= 1) return 'sand';
  if (g.n <= 1 + 1.6 / g.r) return 'fringe';
  if (Math.abs(x) <= 5 && Math.abs(z) <= 7) return 'tee';
  const cd = centreDist(x, z);
  const halfW = 15 + 4 * Math.sin(cd.s * 0.03) + 3 * smoothstep(150, 230, cd.s);
  if (cd.s > 50 && cd.d <= halfW) return 'fairway';
  const px = 34 + 5 * Math.sin(z * 0.02);
  if (z < 4 && z > -300 && Math.abs(x - px) < 1.3) return 'path';
  if (cd.d <= halfW + 16 || (cd.s <= 50 && cd.d < 22)) return 'rough';
  return 'deepRough';
}

function normalAt(x: number, z: number, out = new Vector3()) {
  const e = 0.4;
  const hx = heightAt(x + e, z) - heightAt(x - e, z);
  const hz = heightAt(x, z + e) - heightAt(x, z - e);
  return out.set(-hx, 2 * e, -hz).normalize();
}

function makeTrees(): Tree[] {
  const rnd = mulberry32(7);
  const trees: Tree[] = [];
  for (let i = 0; i < 400 && trees.length < 95; i++) {
    const x = BOUNDS.minX + rnd() * (BOUNDS.maxX - BOUNDS.minX);
    const z = BOUNDS.minZ + rnd() * (BOUNDS.maxZ - BOUNDS.minZ);
    const cd = centreDist(x, z);
    if (cd.d < 30 || cd.d > 90) continue;
    const s = surfaceAt(x, z);
    if (s !== 'rough' && s !== 'deepRough') continue;
    if (greenD(x, z).n < 2.2 || ellipseD(x, z, POND) < 1.3) continue;
    if (Math.abs(x - 34) < 7 && z > -300) continue;
    if (trees.some((t) => Math.hypot(t.pos.x - x, t.pos.z - z) < 7)) continue;
    const r = rnd();
    const kind: Tree['kind'] = ellipseD(x, z, POND) < 2.2 ? 'palm' : r < 0.62 ? 'round' : 'pine';
    const height = kind === 'pine' ? 9 + rnd() * 5 : kind === 'palm' ? 8 + rnd() * 3 : 7 + rnd() * 4;
    const radius = kind === 'pine' ? 2.4 + rnd() : kind === 'palm' ? 2.5 : 3 + rnd() * 1.6;
    trees.push({ pos: new Vector3(x, heightAt(x, z), z), radius, height, kind });
  }
  return trees;
}

export function createDevHole(): Hole {
  const centerline = CL2.map(([x, z]) => new Vector3(x, heightAt(x, z), z));
  let len = 0;
  for (let i = 1; i < centerline.length; i++) len += Math.hypot(centerline[i].x - centerline[i - 1].x, centerline[i].z - centerline[i - 1].z);
  const pin = new Vector3(PIN.x, heightAt(PIN.x, PIN.z), PIN.z);
  return {
    def: { number: 1, name: 'Dev Dogleg', par: 4, tier: 'beginner' },
    tee: new Vector3(0, heightAt(0, 0), 0),
    pin,
    greenCenter: new Vector3(GC.x, heightAt(GC.x, GC.z), GC.z),
    greenRadius: 15,
    bounds: { ...BOUNDS },
    centerline,
    trees: makeTrees(),
    waterLevel: WATER,
    yards: Math.round(len / YARD),
    heightAt,
    normalAt,
    surfaceAt,
    waterDrop(entry: Vector3) {
      const dx = entry.x - pin.x;
      const dz = entry.z - pin.z;
      const l = Math.hypot(dx, dz) || 1;
      const p = entry.clone();
      for (let i = 0; i < 200; i++) {
        p.x += (dx / l) * 1;
        p.z += (dz / l) * 1;
        const s = surfaceAt(p.x, p.z);
        if (s !== 'water' && s !== 'sand') break;
      }
      p.x += (dx / l) * 2;
      p.z += (dz / l) * 2;
      p.y = heightAt(p.x, p.z);
      return p;
    },
    aimTarget(from: Vector3, maxCarryM: number) {
      if (from.distanceTo(pin) <= maxCarryM * 1.05) return pin.clone();
      let best: Vector3 = pin;
      const dPinFrom = Math.hypot(pin.x - from.x, pin.z - from.z);
      for (const c of centerline) {
        const d = Math.hypot(c.x - from.x, c.z - from.z);
        const dp = Math.hypot(pin.x - c.x, pin.z - c.z);
        if (d <= maxCarryM && dp < dPinFrom) best = c;
      }
      if (best === pin) {
        const dir = new Vector3(pin.x - from.x, 0, pin.z - from.z).normalize();
        const p = from.clone().addScaledVector(dir, maxCarryM);
        p.y = heightAt(p.x, p.z);
        return p;
      }
      return best.clone();
    },
  };
}
