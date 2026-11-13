// Back2Back 3D world: streamed road + themed scenery for the five zones ("Moo Moo Farm" look).
// Everything is procedural. Chunks of CL metres are recycled around the car; scenery lives in global
// InstancedMeshes (one per prop type, a fixed slice per chunk) so the whole world is ~60 draw calls.
// All placement is a pure function of (chunk index, slot) so recycled chunks look identical.
import * as THREE from 'three';
import { ZONES, ZONE_LEN, center, heading, zoneIndex, type Zone } from './track';

export interface World {
  update(D: number, t: number, dt: number, speed: number): void;
  onZone(cb: (zone: Zone, index: number) => void): void;
  setNight?(amount: number): void;
}

// ---------------------------------------------------------------------------------------------
// constants + tiny helpers
// ---------------------------------------------------------------------------------------------
const CL = 60; // chunk length (m)
const ROWS = 10; // ground rows per chunk
const RS = CL / ROWS; // 6 m
const NC = 8; // chunk pool
const BEHIND = 45;
const AHEAD = 268;
const SLOTS = 14; // scatter slots per side per chunk
const FENCE_X = 14.8;
const GATE_X = 12.4;

type V3 = [number, number, number];
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Deterministic hash → [0,1). */
function rnd(a: number, b: number, c = 0): number {
  let h = Math.imul(a | 0, 0x27d4eb2d) ^ Math.imul(b | 0, 0x165667b1) ^ Math.imul((c + 1) | 0, 0x9e3779b1);
  h ^= h >>> 15;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const kindAt = (d: number): Zone['kind'] => ZONES[mod(zoneIndex(d), ZONES.length)].kind;
const zoneOf = (i: number): Zone => ZONES[mod(i, ZONES.length)];

// ---------------------------------------------------------------------------------------------
// geometry builders (merged, vertex-coloured, flat shaded)
// ---------------------------------------------------------------------------------------------
interface Part {
  g: THREE.BufferGeometry;
  c: number;
  p?: V3;
  r?: V3;
  s?: V3;
}
const box = (w: number, h: number, d: number, c: number, p?: V3, r?: V3): Part => ({ g: new THREE.BoxGeometry(w, h, d), c, p, r });
const cyl = (rt: number, rb: number, h: number, seg: number, c: number, p?: V3, r?: V3, s?: V3): Part => ({ g: new THREE.CylinderGeometry(rt, rb, h, seg), c, p, r, s });
const cone = (r: number, h: number, seg: number, c: number, p?: V3, rot?: V3, s?: V3): Part => ({ g: new THREE.ConeGeometry(r, h, seg), c, p, r: rot, s });
const ico = (r: number, det: number, c: number, p?: V3, s?: V3): Part => ({ g: new THREE.IcosahedronGeometry(r, det), c, p, s });
const sph = (r: number, ws: number, hs: number, c: number, p?: V3, s?: V3): Part => ({ g: new THREE.SphereGeometry(r, ws, hs), c, p, s });

/** Triangular prism: base on y=0, ridge along z, centred in x/z. */
function prism(w: number, h: number, l: number, c: number, p?: V3): Part {
  const A = [-w / 2, 0, -l / 2], B = [w / 2, 0, -l / 2], C = [0, h, -l / 2];
  const D = [-w / 2, 0, l / 2], E = [w / 2, 0, l / 2], F = [0, h, l / 2];
  const tris = [A, C, B, D, E, F, A, D, F, A, F, C, B, C, F, B, F, E, A, B, E, A, E, D];
  const arr: number[] = [];
  for (const v of tris) arr.push(v[0], v[1], v[2]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
  return { g, c, p };
}

const _c = new THREE.Color();
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3();
const _m2 = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _m3 = new THREE.Matrix4(), _m4 = new THREE.Matrix4(), _m5 = new THREE.Matrix4();
const UP = new THREE.Vector3(0, 1, 0);

function merge(parts: Part[], shade = 0.32): THREE.BufferGeometry {
  const pos: number[] = [];
  const col: number[] = [];
  for (const part of parts) {
    const g = part.g.index ? part.g.toNonIndexed() : part.g.clone();
    const [px, py, pz] = part.p ?? [0, 0, 0];
    const [rx, ry, rz] = part.r ?? [0, 0, 0];
    const [sx, sy, sz] = part.s ?? [1, 1, 1];
    _m.compose(_v.set(px, py, pz), _q.setFromEuler(_e.set(rx, ry, rz)), _s.set(sx, sy, sz));
    g.applyMatrix4(_m);
    const a = g.getAttribute('position');
    _c.setHex(part.c);
    for (let i = 0; i < a.count; i++) {
      pos.push(a.getX(i), a.getY(i), a.getZ(i));
      col.push(_c.r, _c.g, _c.b);
    }
    g.dispose();
    part.g.dispose();
  }
  let mn = Infinity, mx = -Infinity;
  for (let i = 1; i < pos.length; i += 3) {
    mn = Math.min(mn, pos[i]);
    mx = Math.max(mx, pos[i]);
  }
  const range = Math.max(0.001, mx - mn);
  for (let i = 0; i < col.length / 3; i++) {
    const k = 1 - shade + shade * ((pos[i * 3 + 1] - mn) / range); // cheap cartoon ambient occlusion
    col[i * 3] *= k;
    col[i * 3 + 1] *= k;
    col[i * 3 + 2] *= k;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  return geo;
}

// ---- prop models --------------------------------------------------------------------------
const WOOD = 0xb8763e;
const INK = 0x1b1b3a;

function roundTree(): THREE.BufferGeometry {
  return merge([
    cyl(0.32, 0.46, 2.6, 6, WOOD, [0, 1.3, 0]),
    ico(1.95, 1, 0x2fc65a, [0, 3.7, 0], [1, 0.92, 1]),
    ico(1.45, 1, 0x3dd566, [1.15, 3.0, 0.3]),
    ico(1.35, 1, 0x28b552, [-1.05, 3.15, -0.4]),
    ico(1.2, 1, 0x4be072, [0.1, 4.95, 0.1]),
  ]);
}
function pineTree(): THREE.BufferGeometry {
  return merge([
    cyl(0.3, 0.42, 1.8, 6, 0x8a5a30, [0, 0.9, 0]),
    cone(2.3, 2.8, 7, 0x1f9a4d, [0, 2.9, 0]),
    cone(1.85, 2.5, 7, 0x24a856, [0, 4.3, 0]),
    cone(1.4, 2.3, 7, 0x2bb862, [0, 5.6, 0]),
    cone(0.8, 1.6, 7, 0x3acb70, [0, 6.8, 0]),
  ]);
}
function bush(): THREE.BufferGeometry {
  return merge([
    ico(0.95, 1, 0x35c85c, [0, 0.7, 0], [1.1, 0.8, 1]),
    ico(0.7, 1, 0x2fb853, [0.9, 0.55, 0.2]),
    ico(0.65, 1, 0x3fd467, [-0.8, 0.5, -0.25]),
    ico(0.12, 0, 0xff3b30, [0.3, 1.15, -0.7]),
    ico(0.12, 0, 0xff3b30, [-0.4, 1.05, 0.7]),
  ]);
}
function flowers(): THREE.BufferGeometry {
  const parts: Part[] = [cyl(1.5, 1.6, 0.12, 8, 0x4cd05e, [0, 0.06, 0])];
  const cols = [0xffd21f, 0xff3b30, 0xffffff, 0x9b4dff, 0xff8ab0, 0xffd21f, 0xffffff];
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4 + 0.5, r = 0.25 + (i % 3) * 0.38;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    parts.push(cyl(0.03, 0.035, 0.55, 4, 0x2f9a4a, [x, 0.38, z]));
    parts.push(ico(0.2, 0, cols[i], [x, 0.7, z]));
    parts.push(ico(0.09, 0, 0xffe45a, [x, 0.78, z]));
  }
  return merge(parts, 0.15);
}
function fence(): THREE.BufferGeometry {
  return merge([
    box(0.26, 1.15, 0.26, 0xd29a5c, [0, 0.57, -1.9]),
    box(0.26, 1.15, 0.26, 0xd29a5c, [0, 0.57, 1.9]),
    box(0.26, 1.15, 0.26, 0xd29a5c, [0, 0.57, 0]),
    box(0.14, 0.16, 4.1, WOOD, [0, 0.45, 0]),
    box(0.14, 0.16, 4.1, WOOD, [0, 0.85, 0]),
  ], 0.2);
}
function cow(): THREE.BufferGeometry {
  return merge([
    box(1.15, 0.95, 1.95, 0xffffff, [0, 1.05, 0]),
    box(1.18, 0.5, 0.7, INK, [0, 1.25, 0.25]),
    box(0.6, 0.55, 0.7, 0xffffff, [0, 0.7, -1.2]), // head down, grazing
    box(0.44, 0.26, 0.3, 0xffa8b8, [0, 0.52, -1.52]),
    box(0.12, 0.3, 0.12, 0xf0e6c8, [0.24, 1.0, -1.2], [0, 0, 0.5]),
    box(0.12, 0.3, 0.12, 0xf0e6c8, [-0.24, 1.0, -1.2], [0, 0, -0.5]),
    box(0.22, 0.6, 0.22, 0xf2f2f2, [0.4, 0.3, -0.7]),
    box(0.22, 0.6, 0.22, 0xf2f2f2, [-0.4, 0.3, -0.7]),
    box(0.22, 0.6, 0.22, 0xf2f2f2, [0.4, 0.3, 0.7]),
    box(0.22, 0.6, 0.22, 0xf2f2f2, [-0.4, 0.3, 0.7]),
    box(0.1, 0.8, 0.1, INK, [0, 0.95, 1.05], [0.25, 0, 0]),
  ], 0.25);
}
function rock(): THREE.BufferGeometry {
  return merge([
    ico(1.25, 0, 0x9aa0ad, [0, 0.6, 0], [1.2, 0.75, 1]),
    ico(0.7, 0, 0xaab0bd, [1.0, 0.35, 0.5]),
    ico(0.5, 0, 0x868c9a, [-0.9, 0.28, -0.6]),
  ]);
}
function barn(): THREE.BufferGeometry {
  const parts: Part[] = [
    box(6.4, 4.2, 8.6, 0xe03a2e, [0, 2.1, 0]),
    prism(7.6, 2.9, 9.2, 0x5a6a8a, [0, 4.2, 0]),
    box(7.7, 0.18, 9.3, 0xffffff, [0, 4.22, 0]),
    box(2.6, 3.0, 0.2, 0xb02a20, [0, 1.5, -4.35]),
    box(2.9, 0.22, 0.26, 0xffffff, [0, 3.05, -4.38]),
    box(0.22, 3.1, 0.26, 0xffffff, [-1.4, 1.55, -4.38]),
    box(0.22, 3.1, 0.26, 0xffffff, [1.4, 1.55, -4.38]),
    box(0.2, 3.5, 0.28, 0xffffff, [0, 1.5, -4.4], [0, 0, 0.72]),
    box(0.2, 3.5, 0.28, 0xffffff, [0, 1.5, -4.4], [0, 0, -0.72]),
    box(1.3, 1.3, 0.2, INK, [0, 5.2, -4.4]),
    box(1.5, 0.16, 0.28, 0xffffff, [0, 5.2, -4.42]),
  ];
  return merge(parts, 0.28);
}
function silo(): THREE.BufferGeometry {
  const parts: Part[] = [cyl(1.7, 1.8, 9, 10, 0xd3dff0, [0, 4.5, 0])];
  for (let i = 1; i < 4; i++) parts.push(cyl(1.77, 1.8, 0.28, 10, 0x9fb0c8, [0, i * 2.2, 0]));
  parts.push({ g: new THREE.SphereGeometry(1.75, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), c: 0xff3b30, p: [0, 9, 0] });
  parts.push(cyl(0.12, 0.12, 0.9, 5, INK, [0, 10.9, 0]));
  return merge(parts, 0.25);
}
function hay(): THREE.BufferGeometry {
  const bale = (x: number, y: number, z: number): Part[] => [
    cyl(0.92, 0.92, 1.5, 10, 0xf3c63a, [x, y, z], [0, 0, Math.PI / 2]),
    cyl(0.95, 0.95, 0.12, 10, 0xd9a520, [x - 0.4, y, z], [0, 0, Math.PI / 2]),
    cyl(0.95, 0.95, 0.12, 10, 0xd9a520, [x + 0.4, y, z], [0, 0, Math.PI / 2]),
  ];
  return merge([...bale(0, 0.92, -1.0), ...bale(0, 0.92, 1.0), ...bale(0, 2.5, 0)], 0.2);
}
function windmill(): THREE.BufferGeometry {
  return merge([
    cyl(1.7, 1.95, 2.2, 8, 0xd9432f, [0, 1.1, 0]),
    cyl(1.0, 1.7, 7.0, 8, 0xffffff, [0, 5.7, 0]),
    cyl(1.05, 1.05, 0.25, 8, 0xd9432f, [0, 7.0, 0]),
    cone(1.7, 1.9, 8, 0xd9432f, [0, 10.1, 0]),
    box(0.9, 1.3, 0.12, INK, [0, 1.3, -1.9]),
    box(0.7, 0.7, 0.12, 0xffd21f, [0, 5.0, -1.4]),
    sph(0.42, 8, 6, 0x5a3a2a, [0, 9.0, -1.2]),
  ], 0.22);
}
function sails(): THREE.BufferGeometry {
  const parts: Part[] = [];
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const s = Math.sin(a), c = Math.cos(a);
    parts.push(box(0.16, 4.8, 0.16, WOOD, [-s * 2.4, c * 2.4, 0], [0, 0, a]));
    // sail cloth offset sideways of the arm
    const ox = c * 0.75, oy = s * 0.75;
    parts.push(box(1.35, 3.2, 0.08, 0xffffff, [-s * 3.0 + ox, c * 3.0 + oy, 0.05], [0, 0, a]));
    parts.push(box(1.35, 0.5, 0.1, 0xff3b30, [-s * 4.4 + ox, c * 4.4 + oy, 0.05], [0, 0, a]));
  }
  parts.push(sph(0.34, 6, 5, 0xffd21f, [0, 0, 0.15]));
  return merge(parts, 0.1);
}
function coop(): THREE.BufferGeometry {
  return merge([
    box(2.3, 1.5, 1.7, 0xff5a46, [0, 1.0, 0], undefined),
    prism(2.7, 0.8, 2.0, 0xffffff, [0, 1.75, 0]),
    box(0.22, 0.4, 0.22, WOOD, [0.8, 0.2, -0.7]),
    box(0.22, 0.4, 0.22, WOOD, [-0.8, 0.2, -0.7]),
    box(0.22, 0.4, 0.22, WOOD, [0.8, 0.2, 0.7]),
    box(0.22, 0.4, 0.22, WOOD, [-0.8, 0.2, 0.7]),
    box(0.7, 0.7, 0.1, INK, [0, 1.0, -0.88]),
    box(0.9, 0.12, 1.2, WOOD, [0, 0.35, -1.5], [0.35, 0, 0]),
    sph(0.34, 7, 5, 0xffd21f, [0.5, 0.4, -2.0]),
    cone(0.12, 0.3, 4, 0xff8a00, [0.5, 0.36, -2.35], [-Math.PI / 2, 0, 0]),
    ico(0.1, 0, 0xff3b30, [0.5, 0.78, -2.0]),
  ], 0.2);
}
function reeds(): THREE.BufferGeometry {
  const parts: Part[] = [];
  for (let i = 0; i < 9; i++) {
    const a = i * 2.1, r = 0.15 + (i % 4) * 0.2;
    const h = 1.8 + ((i * 37) % 10) * 0.1;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    parts.push(cone(0.07, h, 4, i % 2 ? 0x6bb04a : 0x58a33e, [x, h / 2, z], [Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1]));
    if (i % 3 === 0) parts.push(cyl(0.1, 0.1, 0.42, 5, 0x7a4a2a, [x, h * 0.95, z]));
  }
  return merge(parts, 0.2);
}
function log(): THREE.BufferGeometry {
  return merge([
    cyl(0.46, 0.46, 3.3, 7, 0x9b6532, [0, 0.46, 0], [Math.PI / 2, 0, 0]),
    cyl(0.4, 0.4, 0.06, 7, 0xe0a870, [0, 0.46, 1.66], [Math.PI / 2, 0, 0]),
    cyl(0.4, 0.4, 0.06, 7, 0xe0a870, [0, 0.46, -1.66], [Math.PI / 2, 0, 0]),
    ico(0.18, 0, 0x4cc060, [0.2, 0.95, 0.4], [1, 0.5, 1]),
  ], 0.2);
}
function stones(): THREE.BufferGeometry {
  return merge([
    cyl(0.6, 0.7, 0.35, 7, 0x9ca3b3, [0, 0.12, 0]),
    cyl(0.5, 0.58, 0.3, 6, 0xb2b8c6, [1.5, 0.1, 0.9]),
    cyl(0.55, 0.62, 0.32, 7, 0x8d95a6, [-1.3, 0.11, 1.4]),
    cyl(0.45, 0.5, 0.28, 6, 0xa7aebd, [0.3, 0.1, 2.5]),
  ], 0.2);
}
function lilies(): THREE.BufferGeometry {
  const parts: Part[] = [];
  const pts: V3[] = [[0, 0, 0], [1.4, 0, 0.7], [-1.1, 0, 1.1], [0.4, 0, -1.3]];
  pts.forEach((p, i) => {
    parts.push(cyl(0.55, 0.55, 0.05, 8, i % 2 ? 0x39c46a : 0x2fb35c, [p[0], 0.1, p[2]]));
    if (i % 2 === 0) parts.push(ico(0.14, 0, 0xff8ab0, [p[0], 0.2, p[2]]));
  });
  return merge(parts, 0.1);
}
function bridge(): THREE.BufferGeometry {
  const parts: Part[] = [];
  for (let i = 0; i < 16; i++) parts.push(box(21, 0.1, 1.0, i % 2 ? 0xb8763e : 0xc4824a, [0, 0.06, -7.5 + i]));
  for (let sd = -1; sd <= 1; sd += 2) {
    const x = sd * 10.4;
    for (let i = 0; i < 9; i++) parts.push(box(0.36, 1.4, 0.36, 0xd29a5c, [x, 0.7, -8 + i * 2]));
    for (let i = 0; i < 8; i++) {
      parts.push(box(0.08, 0.07, 2.1, 0xc4824a, [x, 0.88, -7 + i * 2], [0.26, 0, 0]));
      parts.push(box(0.08, 0.07, 2.1, 0xc4824a, [x, 0.88, -7 + i * 2], [-0.26, 0, 0]));
    }
    for (const z of [-4, 0, 4]) {
      parts.push(cyl(0.07, 0.09, 2.2, 5, 0x6b4a2a, [x * 1.01, 1.1, z]));
      parts.push(sph(0.2, 7, 5, 0xffe08a, [x * 1.01, 2.3, z]));
    }
    parts.push(box(0.22, 0.2, 16.6, 0xe6b070, [x, 1.15, 0]));
    parts.push(box(0.2, 0.18, 16.6, WOOD, [x, 0.6, 0]));
    parts.push(box(0.5, 0.2, 0.5, 0xffd21f, [x, 1.5, -8]));
    parts.push(box(0.5, 0.2, 0.5, 0xffd21f, [x, 1.5, 8]));
    parts.push(box(0.5, 2.0, 16.6, 0x6b4a2a, [x * 0.985, -0.6, 0]));
  }
  return merge(parts, 0.12);
}
function mesa(): THREE.BufferGeometry {
  return merge([
    cyl(10.5, 13, 12, 8, 0xc9532a, [0, 6, 0]),
    cyl(9.4, 10.5, 3.2, 8, 0xe8803a, [0, 13.6, 0]),
    cyl(8.6, 9.4, 5, 8, 0xd9602a, [0, 17.7, 0]),
    cyl(7.8, 8.6, 2.2, 8, 0xf0a050, [0, 21.3, 0]),
    cyl(5.2, 6.4, 3.6, 7, 0xe8803a, [1.5, 24.2, 0.5]),
  ], 0.3);
}
function cactus(): THREE.BufferGeometry {
  return merge([
    cyl(0.4, 0.46, 3.6, 7, 0x2f9a4a, [0, 1.8, 0]),
    sph(0.4, 7, 5, 0x38ad56, [0, 3.6, 0]),
    cyl(0.26, 0.26, 1.2, 6, 0x2f9a4a, [0.8, 1.9, 0], [0, 0, Math.PI / 2]),
    cyl(0.26, 0.28, 1.4, 6, 0x38ad56, [1.35, 2.6, 0]),
    sph(0.27, 6, 4, 0x45bd62, [1.35, 3.3, 0]),
    cyl(0.22, 0.22, 0.9, 6, 0x2f9a4a, [-0.65, 1.3, 0], [0, 0, Math.PI / 2]),
    cyl(0.22, 0.24, 1.0, 6, 0x38ad56, [-1.1, 1.8, 0]),
    sph(0.23, 6, 4, 0x45bd62, [-1.1, 2.33, 0]),
    ico(0.1, 0, 0xff5c8a, [0.1, 3.95, 0.1]),
  ], 0.25);
}
function canRock(): THREE.BufferGeometry {
  return merge([
    ico(1.5, 0, 0xc4623a, [0, 0.8, 0], [1.2, 0.8, 1]),
    ico(0.9, 0, 0xd9743f, [1.3, 0.5, 0.6]),
    ico(0.7, 0, 0xa84e2c, [-1.2, 0.4, -0.5]),
  ]);
}
function mine(): THREE.BufferGeometry {
  return merge([
    ico(4.0, 0, 0xb85030, [0, 1.9, 1.8], [1.6, 0.95, 1.1]),
    box(3.6, 3.3, 0.3, 0x2a1f2d, [0, 1.65, -0.15]),
    box(0.45, 3.8, 0.45, WOOD, [-1.9, 1.9, -0.5]),
    box(0.45, 3.8, 0.45, WOOD, [1.9, 1.9, -0.5]),
    box(4.8, 0.55, 0.55, 0xd29a5c, [0, 3.85, -0.5]),
    box(0.3, 0.3, 4.2, 0x7a7a8a, [-0.6, 0.15, -2.4]),
    box(0.3, 0.3, 4.2, 0x7a7a8a, [0.6, 0.15, -2.4]),
    box(0.9, 0.9, 0.12, 0xffd21f, [0, 4.5, -0.55]),
  ], 0.25);
}
function cart(): THREE.BufferGeometry {
  const parts: Part[] = [
    box(1.7, 0.8, 1.2, 0x6a7a8c, [0, 0.85, 0]),
    ico(0.55, 0, 0xffd21f, [0, 1.4, 0], [1.3, 0.7, 1]),
  ];
  for (const x of [-0.7, 0.7]) for (const z of [-0.45, 0.45]) parts.push(cyl(0.3, 0.3, 0.12, 8, INK, [x, 0.3, z], [Math.PI / 2, 0, 0]));
  return merge(parts, 0.2);
}
function tnt(): THREE.BufferGeometry {
  return merge([
    box(1.1, 1.1, 1.1, 0xff3b30, [0, 0.55, 0]),
    box(1.14, 0.18, 1.14, INK, [0, 0.3, 0]),
    box(1.14, 0.18, 1.14, INK, [0, 0.8, 0]),
    box(0.8, 0.8, 0.8, 0xff5a46, [0.9, 0.4, 0.5], [0, 0.4, 0]),
  ], 0.2);
}
function hill(): THREE.BufferGeometry {
  return merge([{ g: new THREE.SphereGeometry(1, 9, 4, 0, Math.PI * 2, 0, Math.PI / 2), c: 0xffffff }], 0.3);
}
function lantern(): THREE.BufferGeometry {
  return merge([
    cyl(0.1, 0.14, 3.4, 6, 0x3a2a4a, [0, 1.7, 0]),
    box(0.5, 0.12, 0.5, 0x3a2a4a, [0, 3.45, 0]),
    cone(0.42, 0.45, 4, 0x3a2a4a, [0, 3.95, 0], [0, Math.PI / 4, 0]),
    cyl(0.25, 0.3, 0.2, 6, 0x3a2a4a, [0, 0.1, 0]),
  ], 0.1);
}
function scarecrow(): THREE.BufferGeometry {
  return merge([
    cyl(0.07, 0.09, 3.0, 5, WOOD, [0, 1.5, 0]),
    box(2.0, 0.12, 0.12, WOOD, [0, 2.3, 0]),
    box(0.9, 1.0, 0.5, 0xff5a46, [0, 2.0, 0]),
    box(0.9, 0.18, 0.52, 0xffd21f, [0, 2.1, 0]),
    box(0.25, 0.8, 0.25, 0x3a5fd0, [-0.5, 2.05, 0], [0, 0, 0.3]),
    box(0.25, 0.8, 0.25, 0x3a5fd0, [0.5, 2.05, 0], [0, 0, -0.3]),
    sph(0.36, 8, 6, 0xf3c63a, [0, 2.85, 0]),
    cyl(0.62, 0.62, 0.07, 8, 0x6a4a2a, [0, 3.1, 0]),
    cyl(0.3, 0.38, 0.4, 8, 0x6a4a2a, [0, 3.3, 0]),
    box(0.4, 0.06, 0.04, INK, [0, 2.78, -0.34]),
    ico(0.14, 0, 0xf3c63a, [-1.0, 2.2, 0]),
    ico(0.14, 0, 0xf3c63a, [1.0, 2.2, 0]),
  ], 0.2);
}
function haypile(): THREE.BufferGeometry {
  return merge([
    cone(1.7, 2.6, 9, 0xf3c63a, [0, 1.3, 0]),
    cyl(1.72, 1.8, 0.35, 9, 0xd9a520, [0, 0.18, 0]),
    cyl(1.15, 1.2, 0.18, 9, 0xd9a520, [0, 1.2, 0]),
    cone(0.9, 1.0, 8, 0xffe07a, [0, 2.8, 0]),
    box(0.06, 1.4, 0.06, WOOD, [0.1, 3.4, 0]),
  ], 0.22);
}
function signpost(): THREE.BufferGeometry {
  return merge([
    cyl(0.1, 0.12, 2.6, 6, WOOD, [0, 1.3, 0]),
    box(1.5, 0.5, 0.1, 0xffd21f, [0.25, 2.3, -0.05], [0, 0, 0.06]),
    box(1.3, 0.12, 0.12, INK, [0.2, 2.3, -0.12], [0, 0, 0.06]),
    box(1.2, 0.42, 0.1, 0xff5a46, [-0.15, 1.7, -0.05], [0, 0, -0.08]),
    box(0.12, 0.12, 0.12, 0xffffff, [-0.15, 1.7, -0.12]),
  ], 0.2);
}
function marker(): THREE.BufferGeometry {
  return merge([
    cyl(0.1, 0.12, 1.0, 5, 0xffffff, [0, 0.5, 0]),
    cyl(0.105, 0.105, 0.2, 5, 0xff3b30, [0, 0.82, 0]),
    box(0.16, 0.1, 0.04, 0xffd21f, [0, 0.62, -0.1]),
  ], 0.1);
}
function spire(): THREE.BufferGeometry {
  return merge([
    cyl(2.6, 3.4, 5, 7, 0xc9532a, [0, 2.5, 0]),
    cyl(2.1, 2.6, 4, 7, 0xe8803a, [0, 7, 0]),
    cyl(1.6, 2.1, 4, 7, 0xd9602a, [0.2, 11, 0.1]),
    cyl(1.9, 1.6, 1.2, 7, 0xf0a050, [0.3, 13.6, 0.1]),
    cyl(0.9, 1.3, 2.2, 6, 0xe8803a, [0.3, 15.3, 0.1]),
  ], 0.3);
}
function arch(): THREE.BufferGeometry {
  const t = new THREE.TorusGeometry(6, 2.1, 6, 12, Math.PI);
  return merge([
    cyl(2.4, 3.1, 8, 7, 0xc9532a, [-6, 4, 0]),
    cyl(2.4, 3.1, 8, 7, 0xd9602a, [6, 4, 0]),
    { g: t, c: 0xe8803a, p: [0, 8, 0], s: [1, 1, 1.3] },
    cyl(1.4, 1.8, 2, 6, 0xf0a050, [-1.5, 15.5, 0]),
  ], 0.3);
}
function lamp(): THREE.BufferGeometry {
  return merge([sph(0.3, 8, 6, 0xffd27a, [0, 3.7, 0])], 0);
}
function cloudGeo(): THREE.BufferGeometry {
  return merge([
    ico(1.3, 1, 0xffffff, [0, 0.7, 0], [1.4, 0.9, 1]),
    ico(1.1, 1, 0xffffff, [1.8, 0.45, 0.2], [1.2, 0.8, 1]),
    ico(1.0, 1, 0xffffff, [-1.8, 0.4, -0.2], [1.2, 0.8, 1]),
    ico(0.9, 1, 0xffffff, [0.6, 1.4, 0.1]),
    ico(0.8, 1, 0xffffff, [3.0, 0.2, 0], [1.1, 0.7, 1]),
    ico(0.75, 1, 0xffffff, [-3.0, 0.15, 0], [1.1, 0.7, 1]),
  ], 0.18);
}
function birdWing(): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.35, 1.3, 0, 0.2, 0, 0, 0.35, 0, 0, -0.35, 0, 0, 0.35, 1.3, 0, 0.2], 3));
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------------------------------------
// materials
// ---------------------------------------------------------------------------------------------
const timeU = { value: 0 };
const groundU = {
  uGA: { value: new THREE.Color(0x5fd03a) },
  uGB: { value: new THREE.Color(0x52c530) },
  uGround: { value: new THREE.Color(0x6fdc4a) },
};

function swayMaterial(strength: number, key: string): THREE.MeshLambertMaterial {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = timeU;
    sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      #ifdef USE_INSTANCING
        float ph = instanceMatrix[3].x*0.23 + instanceMatrix[3].z*0.19;
      #else
        float ph = 0.0;
      #endif
      float sw = position.y*position.y*${strength.toFixed(4)};
      transformed.x += sin(uTime*1.7+ph)*sw;
      transformed.z += cos(uTime*1.3+ph*1.4)*sw*0.7;`,
    );
  };
  m.customProgramCacheKey = () => 'b2b-sway-' + key;
  return m;
}

function groundMaterial(): THREE.MeshLambertMaterial {
  const m = new THREE.MeshLambertMaterial({ color: 0xffffff });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, groundU);
    sh.vertexShader = 'attribute float aTone;\nvarying float vTone;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvTone = aTone;');
    sh.fragmentShader = 'varying float vTone;\nuniform vec3 uGA;\nuniform vec3 uGB;\nuniform vec3 uGround;\n' + sh.fragmentShader.replace(
      '#include <color_fragment>',
      `#include <color_fragment>
      diffuseColor.rgb = mix(mix(uGA, uGB, clamp(vTone, 0.0, 1.0)), uGround, clamp(-vTone, 0.0, 1.0));`,
    );
  };
  m.customProgramCacheKey = () => 'b2b-ground';
  return m;
}

// ---------------------------------------------------------------------------------------------
// placement tables
// ---------------------------------------------------------------------------------------------
type Entry = [string, number, number, number]; // type, weight, xMin, xMax
const TABLE: Record<Zone['kind'], Entry[]> = {
  meadow: [['roundTree', 3.0, 17, 60], ['pine', 1.6, 18, 70], ['bush', 2.0, 14.5, 40], ['flowers', 3.0, 13.5, 35], ['cow', 1.0, 18, 50], ['rock', 0.7, 15, 50], ['scarecrow', 0.25, 16, 30], ['haypile', 0.35, 16, 36], ['signpost', 0.2, 13.4, 14.4]],
  barnyard: [['barn', 0.3, 24, 45], ['silo', 0.25, 27, 50], ['windmill', 0.22, 28, 55], ['hay', 1.0, 15.5, 35], ['coop', 0.5, 16, 30], ['roundTree', 1.0, 18, 60], ['bush', 1.0, 14.5, 40], ['flowers', 0.6, 13.5, 35], ['cow', 0.7, 18, 50], ['rock', 0.3, 15, 50], ['scarecrow', 0.5, 16, 30], ['haypile', 0.9, 16, 36], ['signpost', 0.2, 13.4, 14.4]],
  creek: [['roundTree', 1.5, 17, 60], ['pine', 1.0, 18, 70], ['reeds', 3.0, 12.8, 30], ['log', 1.0, 13.5, 30], ['rock', 1.0, 15, 50], ['bush', 1.0, 14.5, 40], ['flowers', 0.6, 13.5, 35], ['signpost', 0.2, 13.4, 14.4]],
  canyon: [['mesa', 0.6, 48, 140], ['cactus', 2.2, 13.5, 60], ['canRock', 2.0, 14, 60], ['mine', 0.12, 24, 40], ['cart', 0.18, 15, 30], ['tnt', 0.35, 14.5, 30], ['rock', 0.4, 15, 50], ['spire', 0.9, 20, 70], ['arch', 0.1, 32, 60], ['signpost', 0.2, 13.4, 14.4]],
  sunset: [['roundTree', 1.5, 17, 60], ['pine', 1.3, 18, 70], ['bush', 1.2, 14.5, 40], ['flowers', 1.0, 13.5, 35], ['rock', 0.4, 15, 50], ['cow', 0.4, 18, 50], ['scarecrow', 0.2, 16, 30], ['haypile', 0.3, 16, 36], ['signpost', 0.2, 13.4, 14.4]],
};
const SCALE: Record<string, [number, number]> = {
  roundTree: [0.8, 1.35], pine: [0.8, 1.4], bush: [0.8, 1.5], flowers: [0.8, 1.4], cow: [0.9, 1.1], rock: [0.7, 1.8],
  barn: [1, 1.15], silo: [0.95, 1.2], windmill: [1, 1.2], hay: [0.9, 1.1], coop: [0.9, 1.1],
  reeds: [0.9, 1.5], log: [0.9, 1.2], mesa: [0.9, 1.7], cactus: [0.8, 1.6], canRock: [0.8, 2.4], mine: [1, 1.2], cart: [1, 1], tnt: [0.9, 1.2],
  scarecrow: [0.9, 1.2], haypile: [0.9, 1.3], signpost: [1, 1], spire: [0.9, 1.6], arch: [1.1, 1.6],
};
const RADIUS: Record<string, number> = {
  roundTree: 2.6, pine: 2.4, bush: 1.4, flowers: 1.6, cow: 1.6, rock: 1.8, barn: 5.5, silo: 2.4, windmill: 3.0, hay: 2.4, coop: 2.0,
  reeds: 1.0, log: 1.8, mesa: 14, cactus: 1.8, canRock: 2.0, mine: 5.5, cart: 1.4, tnt: 1.2, scarecrow: 1.2, haypile: 2.0, signpost: 1.0, spire: 3.2, arch: 12,
};
// oriented toward the road
const FACES_ROAD = new Set(['barn', 'windmill', 'coop', 'mine', 'cart', 'arch', 'signpost']);

// per-zone look beyond the Zone fields: lighting + sky extras
interface Extra { sunEl: number; sunSize: number; sunInt: number; hemiSky: number; hemiGround: number; hemiInt: number; hill: number; cloud: number }
const EXTRAS: Extra[] = [
  { sunEl: 0.5, sunSize: 0.05, sunInt: 3.0, hemiSky: 0xbfe3ff, hemiGround: 0x7fcf5a, hemiInt: 1.2, hill: 0x66cf45, cloud: 0xffffff },
  { sunEl: 0.45, sunSize: 0.05, sunInt: 3.0, hemiSky: 0xc8e8ff, hemiGround: 0x86d45f, hemiInt: 1.2, hill: 0x7bd957, cloud: 0xffffff },
  { sunEl: 0.55, sunSize: 0.05, sunInt: 3.0, hemiSky: 0xb8e0ff, hemiGround: 0x4fc27a, hemiInt: 1.2, hill: 0x48b87a, cloud: 0xf4ffff },
  { sunEl: 0.34, sunSize: 0.065, sunInt: 3.2, hemiSky: 0xffe0b8, hemiGround: 0xe0985a, hemiInt: 1.1, hill: 0xd88a4a, cloud: 0xfff0d8 },
  { sunEl: 0.12, sunSize: 0.14, sunInt: 3.4, hemiSky: 0xffa98a, hemiGround: 0x8a6ab0, hemiInt: 1.05, hill: 0x7b5fb5, cloud: 0xffb0a8 },
];

// ---------------------------------------------------------------------------------------------
// instanced prop registry
// ---------------------------------------------------------------------------------------------
interface PropType {
  mesh: THREE.InstancedMesh;
  cap: number; // per chunk
  tint: boolean;
}

interface Chunk {
  k: number;
  ground: THREE.Mesh;
  road: THREE.Mesh;
  decor: THREE.Mesh;
  water: THREE.Mesh;
  gPos: Float32Array;
  gTone: Float32Array;
  rPos: Float32Array;
  rCol: Float32Array;
  dPos: Float32Array;
  wPos: Float32Array;
  hasWm: boolean;
  wm: THREE.Matrix4;
}

const SHADOW_CASTERS = new Set(['roundTree', 'pine', 'bush', 'fence', 'cow', 'rock', 'barn', 'silo', 'hay', 'coop', 'log', 'bridge', 'cactus', 'canRock', 'mine', 'cart', 'tnt', 'scarecrow', 'haypile', 'signpost', 'marker', 'spire', 'arch', 'lantern', 'windmill', 'sails']);
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

// ---------------------------------------------------------------------------------------------
// gate arch + start line
// ---------------------------------------------------------------------------------------------
function gateFrame(): THREE.BufferGeometry {
  const parts: Part[] = [];
  for (const sd of [-1, 1]) {
    const x = sd * GATE_X;
    parts.push(box(2.1, 1.0, 2.1, INK, [x, 0.5, 0]));
    parts.push(box(1.3, 9.6, 1.3, 0xffffff, [x, 5.0, 0]));
    for (let i = 0; i < 4; i++) parts.push(box(1.42, 1.2, 1.42, INK, [x, 1.6 + i * 2.4, 0]));
    parts.push(box(1.7, 0.5, 1.7, INK, [x, 9.85, 0]));
    parts.push(sph(0.5, 8, 6, 0xffe45a, [x, 10.6, 0]));
  }
  parts.push(box(27, 4.6, 1.3, 0xffffff, [0, 9.7, 0]));
  parts.push(box(27.6, 0.3, 1.6, INK, [0, 12.1, 0]));
  parts.push(box(27.6, 0.3, 1.6, INK, [0, 7.4, 0]));
  for (let i = 0; i < 26; i++) {
    if (i % 2 === 0) parts.push(box(1.0, 0.45, 1.64, INK, [-12.5 + i, 7.15, 0]));
    else parts.push(box(1.0, 0.45, 1.64, 0xffffff, [-12.5 + i, 7.15, 0]));
  }
  return merge(parts, 0.1);
}

function paintGate(cv: HTMLCanvasElement, tex: THREE.CanvasTexture, name: string, sub: string, accent: number): void {
  const g = cv.getContext('2d');
  if (!g) return;
  const W = cv.width, H = cv.height;
  const css = '#' + accent.toString(16).padStart(6, '0');
  g.clearRect(0, 0, W, H);
  g.fillStyle = '#1b1b3a';
  g.fillRect(0, 0, W, H);
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, css);
  grad.addColorStop(1, '#fff6d8');
  g.fillStyle = grad;
  g.fillRect(14, 14, W - 28, H - 28);
  g.fillStyle = 'rgba(255,255,255,0.35)';
  g.fillRect(14, 14, W - 28, 34);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.lineJoin = 'round';
  g.font = '900 38px "Arial Black", Impact, sans-serif';
  g.lineWidth = 8;
  g.strokeStyle = '#1b1b3a';
  g.fillStyle = '#ffffff';
  g.strokeText(sub.toUpperCase(), W / 2, 40);
  g.fillText(sub.toUpperCase(), W / 2, 40);
  let size = 128;
  const label = name.toUpperCase();
  do {
    g.font = `900 ${size}px "Arial Black", Impact, sans-serif`;
    size -= 6;
  } while (g.measureText(label).width > W - 100 && size > 40);
  g.lineWidth = 18;
  g.strokeStyle = '#1b1b3a';
  g.strokeText(label, W / 2, H / 2 + 34);
  g.fillStyle = '#ffffff';
  g.fillText(label, W / 2, H / 2 + 34);
  tex.needsUpdate = true;
}

interface Gate {
  group: THREE.Group;
  mat: THREE.MeshLambertMaterial;
  cv: HTMLCanvasElement;
  tex: THREE.CanvasTexture;
  g: number;
}

function startLineMesh(): THREE.Mesh {
  const cv = document.createElement('canvas');
  cv.width = 340;
  cv.height = 40;
  const g = cv.getContext('2d');
  if (g) {
    for (let r = 0; r < 2; r++) for (let c = 0; c < 17; c++) {
      g.fillStyle = (r + c) % 2 ? '#1b1b3a' : '#ffffff';
      g.fillRect(c * 20, r * 20, 20, 20);
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  const mat = new THREE.MeshLambertMaterial({ map: tex, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(20.4, 2.4), mat);
  m.rotation.x = -Math.PI / 2;
  const holder = new THREE.Mesh();
  holder.add(m);
  m.position.y = 0.075;
  return holder;
}

function waterTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 128;
  cv.height = 128;
  const g = cv.getContext('2d');
  if (g) {
    g.fillStyle = '#d8f0ff';
    g.fillRect(0, 0, 128, 128);
    g.strokeStyle = 'rgba(255,255,255,0.9)';
    g.lineWidth = 3;
    g.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const x = 12 + ((i * 53) % 100), y = (i * 29) % 128;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + 8, y + 10, x, y + 20);
      g.stroke();
    }
    g.strokeStyle = 'rgba(120,190,240,0.7)';
    for (let i = 0; i < 7; i++) {
      const x = 20 + ((i * 41) % 90), y = (i * 47 + 20) % 128;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x - 6, y + 9, x, y + 18);
      g.stroke();
    }
    // foam on both banks (u = along the road)
    for (const edge of [0, 1]) {
      const gr = g.createLinearGradient(edge ? 128 : 0, 0, edge ? 108 : 20, 0);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr;
      g.fillRect(edge ? 108 : 0, 0, 20, 128);
    }
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

// ---------------------------------------------------------------------------------------------
// sky dome
// ---------------------------------------------------------------------------------------------
const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const SKY_FRAG = /* glsl */ `
varying vec3 vDir;
uniform vec3 uZen; uniform vec3 uHor; uniform vec3 uSunDir; uniform vec3 uSunCol;
uniform float uSunSize; uniform float uNight; uniform float uTime;
float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float hn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  float a = hash(i), b = hash(i+vec2(1.0,0.0)), c = hash(i+vec2(0.0,1.0)), d = hash(i+vec2(1.0,1.0));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }
void main(){
  vec3 d = normalize(vDir);
  float h = d.y;
  float t = clamp(h, 0.0, 1.0);
  vec3 col = mix(uHor, uZen, pow(t, 0.6));
  col += uHor * 0.10 * exp(-max(h, 0.0) * 9.0) * (1.0 - uNight * 0.8);
  col = mix(col, uHor, smoothstep(0.0, -0.25, h));
  if (h > 0.01) {
    vec2 cp = d.xz / (h + 0.18) * 0.9 + vec2(uTime * 0.012, 0.0);
    float n = hn(cp * 1.3) * 0.55 + hn(cp * 2.9) * 0.3 + hn(cp * 6.1) * 0.15;
    float cl = smoothstep(0.52, 0.78, n) * smoothstep(0.01, 0.2, h);
    float cl2 = smoothstep(0.58, 0.85, hn(cp * 0.8 + 7.0) * 0.7 + hn(cp * 3.7) * 0.3) * smoothstep(0.03, 0.4, h);
    vec3 ccol = mix(uHor, vec3(1.0), 0.75);
    col = mix(col, ccol, cl * 0.5 * (1.0 - uNight * 0.85));
    col = mix(col, mix(ccol, uZen, 0.2), cl2 * 0.3 * (1.0 - uNight * 0.85));
  }
  float sd = dot(d, normalize(uSunDir));
  float ang = acos(clamp(sd, -1.0, 1.0));
  float disc = 1.0 - smoothstep(uSunSize*0.86, uSunSize, ang);
  float halo = exp(-ang*ang/(uSunSize*uSunSize*30.0))*0.55 + exp(-ang*4.0)*0.18;
  col += uSunCol * halo * (1.0 - uNight*0.7);
  col = mix(col, vec3(1.0, 0.98, 0.9), disc * (1.0 - uNight*0.2));
  // stars
  if (uNight > 0.01 && h > 0.0) {
    vec2 sp = floor(d.xz / (0.02 + h*0.03) * 3.0 + d.y*40.0);
    float s = step(0.992, hash(sp));
    col += vec3(s) * uNight * smoothstep(0.0, 0.3, h) * (0.6 + 0.4*sin(uTime*3.0 + hash(sp)*30.0));
  }
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const FF_VERT = /* glsl */ `
uniform float uScale; uniform float uTime;
attribute float aPh;
varying float vA;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.55 + 0.45*sin(uTime*2.6 + aPh*20.0);
  vA = tw;
  gl_PointSize = max(2.0, 0.34 * uScale / max(1.0, -mv.z)) * (0.8 + 0.4*tw);
}`;
const FF_FRAG = /* glsl */ `
uniform float uAmt; varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5; float r = length(c);
  float a = smoothstep(0.5, 0.0, r);
  gl_FragColor = vec4(vec3(1.0, 0.86, 0.35) * (0.7 + vA*0.6), a*a*uAmt*vA);
  #include <colorspace_fragment>
}`;

const AM_VERT = /* glsl */ `
uniform float uScale; uniform float uTime;
attribute float aPh; varying float vA;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vA = 0.55 + 0.45 * sin(uTime * 2.0 + aPh * 30.0);
  gl_PointSize = max(2.0, (0.1 + aPh * 0.1) * uScale / max(1.0, -mv.z));
}`;
const AM_FRAG = /* glsl */ `
uniform vec3 uCol; uniform float uAmt; varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5; float r = length(c) * 2.0;
  float a = (1.0 - smoothstep(0.55, 1.0, r)) * uAmt * vA;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uCol, a);
}`;
const SHAFT_VERT = /* glsl */ `
varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const SHAFT_FRAG = /* glsl */ `
varying vec2 vUv; uniform vec3 uCol; uniform float uAmt;
void main(){
  float a = pow(1.0 - vUv.y, 1.4) * smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x) * smoothstep(0.0, 0.08, vUv.y) * uAmt;
  gl_FragColor = vec4(uCol * a, a);
}`;

function glowTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const g = cv.getContext('2d');
  if (g) {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.18, 'rgba(255,255,255,0.55)');
    gr.addColorStop(0.5, 'rgba(255,255,255,0.12)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------------------------------------------------------------------------------------------
// createWorld
// ---------------------------------------------------------------------------------------------
export function createWorld(scene: THREE.Scene, renderer: THREE.WebGLRenderer): World {
  const root = new THREE.Group();
  root.name = 'back2back-world';
  scene.add(root);

  // ---- state -------------------------------------------------------------------------------
  const zoneCbs: Array<(z: Zone, i: number) => void> = [];
  let lastZone = -1;
  let night = 0;
  let lastD = 0;
  let curSpeed = 0;

  // ---- fog + lights ------------------------------------------------------------------------
  const fog = new THREE.Fog(0xcdf0ff, 70, 285);
  scene.fog = fog;
  const hemi = new THREE.HemisphereLight(0xbfe3ff, 0x7fcf5a, 1.2);
  const sun = new THREE.DirectionalLight(0xfff3c4, 3.0);
  root.add(hemi, sun, sun.target);
  // soft shadows in a small box that follows the car
  const SH = 26;
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -SH; sc.right = SH; sc.top = SH; sc.bottom = -SH; sc.near = 40; sc.far = 180;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.06;
  sun.shadow.radius = 2.5;
  sc.updateProjectionMatrix();
  const shR = new THREE.Vector3(), shU = new THREE.Vector3(), shF = new THREE.Vector3();

  // ---- sky dome ----------------------------------------------------------------------------
  const skyU = {
    uZen: { value: new THREE.Color(0x4fb8ff) },
    uHor: { value: new THREE.Color(0xcdf0ff) },
    uSunDir: { value: new THREE.Vector3(0.4, 0.5, -0.9) },
    uSunCol: { value: new THREE.Color(0xfff3c4) },
    uSunSize: { value: 0.05 },
    uNight: { value: 0 },
    uTime: timeU,
  };
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(150, 24, 14),
    new THREE.ShaderMaterial({ uniforms: skyU, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthTest: false, depthWrite: false, fog: false }),
  );
  dome.frustumCulled = false;
  dome.renderOrder = -10;
  root.add(dome);

  // ---- materials ---------------------------------------------------------------------------
  const matStatic = new THREE.MeshLambertMaterial({ vertexColors: true });
  const matSway = swayMaterial(0.0045, 'big');
  const matSwaySmall = swayMaterial(0.016, 'small');
  const matHill = new THREE.MeshLambertMaterial({ vertexColors: true, color: 0x66cf45 });
  const matLamp = new THREE.MeshBasicMaterial({ vertexColors: true });
  const matGround = groundMaterial();
  const matRoad = new THREE.MeshLambertMaterial({ vertexColors: true, color: 0x555a70, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  const matDecor = new THREE.MeshLambertMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  const waterTex = waterTexture();
  const matWater = new THREE.MeshLambertMaterial({ map: waterTex, color: 0x3aa8f0, emissive: 0x0c3a66, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  matWater.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = timeU;
    sh.fragmentShader = 'uniform float uTime;\n' + sh.fragmentShader.replace(
      '#include <map_fragment>',
      `#include <map_fragment>
      vec2 sq = floor(vMapUv * vec2(26.0, 40.0));
      float shn = fract(sin(dot(sq + floor(uTime * 2.5), vec2(12.9898, 78.233))) * 43758.5453);
      float spk = step(0.972, shn) * (0.5 + 0.5 * sin(uTime * 9.0 + shn * 40.0));
      float edgeD = min(vMapUv.x, 1.0 - vMapUv.x) + 0.025 * sin(vMapUv.y * 34.0 + uTime * 2.2) + 0.012 * sin(vMapUv.y * 71.0 - uTime * 3.0);
      float fm = smoothstep(0.075, 0.03, edgeD);
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), fm * 0.85) + vec3(spk * 0.9);`,
    );
  };
  matWater.customProgramCacheKey = () => 'b2b-water';
  const matCloud = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0x9aa8c0, emissiveIntensity: 0.9 });
  const matCloud2 = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0x9aa8c0, emissiveIntensity: 0.9, transparent: true, opacity: 0.55, depthWrite: false });
  const matStreak = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const matDark = new THREE.MeshLambertMaterial({ vertexColors: true, color: 0x2b2b4a, side: THREE.DoubleSide });
  const matTumble = new THREE.MeshLambertMaterial({ vertexColors: true });

  // ---- prop types --------------------------------------------------------------------------
  const types: Record<string, PropType> = {};
  const addType = (name: string, geo: THREE.BufferGeometry, mat: THREE.Material, cap: number, tint = false) => {
    const mesh = new THREE.InstancedMesh(geo, mat, cap * NC);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    for (let i = 0; i < cap * NC; i++) mesh.setMatrixAt(i, ZERO);
    if (tint) {
      _c.setRGB(1, 1, 1);
      for (let i = 0; i < cap * NC; i++) mesh.setColorAt(i, _c);
    }
    mesh.name = name;
    mesh.castShadow = SHADOW_CASTERS.has(name);
    root.add(mesh);
    types[name] = { mesh, cap, tint };
  };
  addType('roundTree', roundTree(), matSway, 10, true);
  addType('pine', pineTree(), matSway, 8, true);
  addType('bush', bush(), matSwaySmall, 9, true);
  addType('flowers', flowers(), matSwaySmall, 9, true);
  addType('fence', fence(), matStatic, 34);
  addType('cow', cow(), matStatic, 3);
  addType('rock', rock(), matStatic, 7);
  addType('barn', barn(), matStatic, 1);
  addType('silo', silo(), matStatic, 1);
  addType('windmill', windmill(), matStatic, 1);
  addType('hay', hay(), matStatic, 4);
  addType('coop', coop(), matStatic, 3);
  addType('reeds', reeds(), matSwaySmall, 12);
  addType('log', log(), matStatic, 4);
  addType('stones', stones(), matStatic, 6);
  addType('lilies', lilies(), matStatic, 5);
  addType('bridge', bridge(), matStatic, 1);
  addType('mesa', mesa(), matStatic, 4);
  addType('cactus', cactus(), matStatic, 9);
  addType('canRock', canRock(), matStatic, 7);
  addType('mine', mine(), matStatic, 1);
  addType('cart', cart(), matStatic, 2);
  addType('tnt', tnt(), matStatic, 4);
  addType('hill', hill(), matHill, 8);
  addType('lantern', lantern(), matStatic, 10);
  addType('lamp', lamp(), matLamp, 10);
  addType('scarecrow', scarecrow(), matStatic, 2);
  addType('haypile', haypile(), matStatic, 3);
  addType('signpost', signpost(), matStatic, 2);
  addType('marker', marker(), matStatic, 2);
  addType('spire', spire(), matStatic, 4);
  addType('arch', arch(), matStatic, 1);
  addType('sails', sails(), matStatic, 1);
  const sailsMesh = types.sails.mesh;

  // ---- chunks ------------------------------------------------------------------------------
  const chunks: Chunk[] = [];
  const COLS = 9; // cells per side per row
  const GX_L = [-240, -150, -110, -85, -65, -49, -37, -25, -13, -10];
  const GX_R = [10, 13, 25, 37, 49, 65, 85, 110, 150, 240];
  const gVerts = ROWS * 2 * COLS * 6;

  const decorQuads = 10 + 20 + 40;
  const decorIdx = new Uint16Array(decorQuads * 6);
  for (let i = 0; i < decorQuads; i++) decorIdx.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 1, i * 4 + 3, i * 4 + 2], i * 6);
  const decorCol = new Float32Array(decorQuads * 4 * 3);
  for (let i = 0; i < decorQuads; i++) {
    let hex = 0xffffff;
    if (i >= 30) hex = (i - 30) % 2 ? 0xffffff : 0xff3b30;
    _c.setHex(hex);
    for (let v = 0; v < 4; v++) decorCol.set([_c.r, _c.g, _c.b], (i * 4 + v) * 3);
  }
  const roadIdx = new Uint16Array(ROWS * 6);
  for (let i = 0; i < ROWS; i++) roadIdx.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 1, i * 4 + 3, i * 4 + 2], i * 6);
  const waterIdx = new Uint16Array([0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6]);

  const upNormals = (n: number) => {
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) a[i * 3 + 1] = 1;
    return a;
  };

  for (let i = 0; i < NC; i++) {
    const gPos = new Float32Array(gVerts * 3);
    const gTone = new Float32Array(gVerts);
    const gg = new THREE.BufferGeometry();
    gg.setAttribute('position', new THREE.BufferAttribute(gPos, 3).setUsage(THREE.DynamicDrawUsage));
    gg.setAttribute('normal', new THREE.BufferAttribute(upNormals(gVerts), 3));
    gg.setAttribute('aTone', new THREE.BufferAttribute(gTone, 1).setUsage(THREE.DynamicDrawUsage));
    const ground = new THREE.Mesh(gg, matGround);

    const rPos = new Float32Array(ROWS * 4 * 3);
    const rCol = new Float32Array(ROWS * 4 * 3);
    const rg = new THREE.BufferGeometry();
    rg.setAttribute('position', new THREE.BufferAttribute(rPos, 3).setUsage(THREE.DynamicDrawUsage));
    rg.setAttribute('normal', new THREE.BufferAttribute(upNormals(ROWS * 4), 3));
    rg.setAttribute('color', new THREE.BufferAttribute(rCol, 3).setUsage(THREE.DynamicDrawUsage));
    rg.setIndex(new THREE.BufferAttribute(roadIdx, 1));
    const road = new THREE.Mesh(rg, matRoad);

    const dPos = new Float32Array(decorQuads * 4 * 3);
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.BufferAttribute(dPos, 3).setUsage(THREE.DynamicDrawUsage));
    dg.setAttribute('normal', new THREE.BufferAttribute(upNormals(decorQuads * 4), 3));
    dg.setAttribute('color', new THREE.BufferAttribute(decorCol, 3));
    dg.setIndex(new THREE.BufferAttribute(decorIdx, 1));
    const decor = new THREE.Mesh(dg, matDecor);

    const wPos = new Float32Array(8 * 3);
    const wUv = new Float32Array(8 * 2);
    const wg = new THREE.BufferGeometry();
    wg.setAttribute('position', new THREE.BufferAttribute(wPos, 3).setUsage(THREE.DynamicDrawUsage));
    wg.setAttribute('normal', new THREE.BufferAttribute(upNormals(8), 3));
    wg.setAttribute('uv', new THREE.BufferAttribute(wUv, 2).setUsage(THREE.DynamicDrawUsage));
    wg.setIndex(new THREE.BufferAttribute(waterIdx, 1));
    const water = new THREE.Mesh(wg, matWater);
    water.visible = false;

    ground.receiveShadow = true; road.receiveShadow = true; decor.receiveShadow = true;
    for (const m of [ground, road, decor, water]) {
      m.frustumCulled = false;
      root.add(m);
    }
    chunks.push({ k: -999999, ground, road, decor, water, gPos, gTone, rPos, rCol, dPos, wPos, hasWm: false, wm: new THREE.Matrix4() });
  }

  const writeQuad = (arr: Float32Array, qi: number, xl: number, xr: number, dA: number, dB: number, y: number) => {
    const ca = center(dA), cb = center(dB);
    const o = qi * 12;
    arr[o] = ca + xl; arr[o + 1] = y; arr[o + 2] = -dA;
    arr[o + 3] = ca + xr; arr[o + 4] = y; arr[o + 5] = -dA;
    arr[o + 6] = cb + xl; arr[o + 7] = y; arr[o + 8] = -dB;
    arr[o + 9] = cb + xr; arr[o + 10] = y; arr[o + 11] = -dB;
  };

  const cxRow = new Float64Array(ROWS + 1);

  function buildTerrain(ch: Chunk, k: number): void {
    const d0 = k * CL;
    for (let r = 0; r <= ROWS; r++) cxRow[r] = center(d0 + r * RS);
    // ground cells
    const pos = ch.gPos, tone = ch.gTone;
    let pi = 0, ti = 0;
    for (let r = 0; r < ROWS; r++) {
      const rowG = k * ROWS + r;
      const za = -(d0 + r * RS), zb = -(d0 + (r + 1) * RS);
      const ca = cxRow[r], cb = cxRow[r + 1];
      for (let side = 0; side < 2; side++) {
        const xs = side ? GX_R : GX_L;
        for (let c = 0; c < COLS; c++) {
          const xa = xs[c], xb = xs[c + 1];
          const nc = side ? c : COLS - 1 - c; // 0 = beside the road
          const chk = (rowG + nc) & 1;
          let tA = chk, tB = chk;
          if (nc === 0) {
            const outer = (rowG + 1) & 1;
            if (side) { tA = -1; tB = outer; } else { tA = outer; tB = -1; }
          }
          // A B C  /  B D C
          const px = [ca + xa, ca + xb, cb + xa, ca + xb, cb + xb, cb + xa];
          const pz = [za, za, zb, za, zb, zb];
          const tt = [tA, tB, tA, tB, tB, tA];
          for (let v = 0; v < 6; v++) {
            pos[pi++] = px[v];
            pos[pi++] = 0;
            pos[pi++] = pz[v];
            tone[ti++] = tt[v];
          }
        }
      }
    }
    (ch.ground.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    (ch.ground.geometry.getAttribute('aTone') as THREE.BufferAttribute).needsUpdate = true;
    // road
    for (let r = 0; r < ROWS; r++) {
      writeQuad(ch.rPos, r, -10, 10, d0 + r * RS, d0 + (r + 1) * RS, 0.03);
      const f = (k * ROWS + r) & 1 ? 1 : 0.94;
      for (let v = 0; v < 4; v++) ch.rCol.set([f, f, f], (r * 4 + v) * 3);
    }
    (ch.road.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    (ch.road.geometry.getAttribute('color') as THREE.BufferAttribute).needsUpdate = true;
    // decor: centre dashes, edge lines, kerbs
    let q = 0;
    for (let i = 0; i < 10; i++) writeQuad(ch.dPos, q++, -0.22, 0.22, d0 + i * RS, d0 + i * RS + 3, 0.05);
    for (let i = 0; i < 10; i++) {
      writeQuad(ch.dPos, q++, -9.55, -9.25, d0 + i * RS, d0 + (i + 1) * RS, 0.05);
      writeQuad(ch.dPos, q++, 9.25, 9.55, d0 + i * RS, d0 + (i + 1) * RS, 0.05);
    }
    // kerbs: even indices left... colours were pre-baked alternating per quad index, so lay out
    // left kerb in 0..19, right kerb in 20..39 (each alternates red/white along the road)
    for (let i = 0; i < 20; i++) writeQuad(ch.dPos, q++, -11.3, -10, d0 + i * 3, d0 + i * 3 + 3, 0.07);
    for (let i = 0; i < 20; i++) writeQuad(ch.dPos, q++, 10, 11.3, d0 + i * 3, d0 + i * 3 + 3, 0.07);
    (ch.decor.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
  }

  // ---- scenery population ------------------------------------------------------------------
  const counts: Record<string, number> = {};
  const bigX: number[] = [];
  const bigD: number[] = [];
  const bigR: number[] = [];
  const tintCol = new THREE.Color();

  function put(name: string, slot: number, dd: number, x: number, yaw: number, sx: number, sy: number, y = 0, tintKind?: Zone['kind']): void {
    const t = types[name];
    const n = counts[name] ?? 0;
    if (n >= t.cap) return;
    counts[name] = n + 1;
    const idx = slot * t.cap + n;
    _p.set(center(dd) + x, y, -dd);
    _q.setFromAxisAngle(UP, yaw);
    _m.compose(_p, _q, _s.set(sx, sy, sx));
    t.mesh.setMatrixAt(idx, _m);
    if (t.tint) {
      const v = 0.82 + 0.3 * rnd(Math.round(dd * 10), Math.round(x * 10), 77);
      if (tintKind === 'sunset') tintCol.setRGB(v * 1.0, v * 0.9, v * 1.05);
      else if (tintKind === 'canyon') tintCol.setRGB(v * 1.1, v * 0.95, v * 0.7);
      else tintCol.setRGB(v, v, v);
      t.mesh.setColorAt(idx, tintCol);
    }
    if (name === 'windmill') {
      const ch = chunks[slot];
      ch.hasWm = true;
      ch.wm.copy(_m);
    }
  }

  const waterV = new THREE.Vector3();
  function buildScenery(ch: Chunk, slot: number, k: number): void {
    const d0 = k * CL;
    for (const key in counts) counts[key] = 0;
    ch.hasWm = false;
    bigX.length = 0; bigD.length = 0; bigR.length = 0;

    // creek: water band + wooden bridge
    let dB = -1;
    const mid = d0 + 18 + rnd(k, 700, 1) * 24;
    if (kindAt(mid - 10) === 'creek' && kindAt(mid + 10) === 'creek' && rnd(k, 701, 2) < 0.55) {
      const gd = Math.round(mid / ZONE_LEN) * ZONE_LEN;
      if (Math.abs(mid - gd) > 24) dB = mid;
    }
    if (dB >= 0) {
      const th = heading(dB);
      const cs = Math.cos(th), sn = Math.sin(th);
      const c0 = center(dB);
      const hl = 8;
      let o = 0;
      const uv = (ch.water.geometry.getAttribute('uv') as THREE.BufferAttribute);
      let vi = 0;
      for (const sd of [-1, 1]) {
        const xa = sd * 10.2, xb = sd * 175;
        for (const [lx, lz] of [[xa, -hl], [xb, -hl], [xa, hl], [xb, hl]]) {
          // local (lx, lz) with +z toward the camera; world point = base + yaw rotation
          waterV.set(c0 + lx * cs + lz * sn, 0.06, -dB - lx * sn + lz * cs);
          ch.wPos[o++] = waterV.x; ch.wPos[o++] = waterV.y; ch.wPos[o++] = waterV.z;
          uv.setXY(vi++, (lz + hl) / (2 * hl), lx / 8);
        }
      }
      uv.needsUpdate = true;
      (ch.water.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
      ch.water.visible = true;
      put('bridge', slot, dB, 0, th, 1, 1);
      // reeds on the banks, stones + lilies in the water
      for (let i = 0; i < 8; i++) {
        const sd = i % 2 ? 1 : -1;
        const along = (8.7 + rnd(k, 710 + i, 3) * 1.2) * (rnd(k, 720 + i, 4) < 0.5 ? -1 : 1);
        put('reeds', slot, dB + along, sd * (11.2 + rnd(k, 730 + i, 5) * 22), rnd(k, 740 + i, 6) * 6.28, 1, 1);
      }
      for (let i = 0; i < 5; i++) {
        const sd = i % 2 ? 1 : -1;
        put('stones', slot, dB + (rnd(k, 750 + i, 7) - 0.5) * 9, sd * (13 + rnd(k, 760 + i, 8) * 18), rnd(k, 770 + i, 9) * 6.28, 1, 1, 0.05);
        put('lilies', slot, dB + (rnd(k, 780 + i, 7) - 0.5) * 10, -sd * (12.5 + rnd(k, 790 + i, 8) * 25), rnd(k, 800 + i, 9) * 6.28, 1, 1, 0.06);
      }
    } else {
      ch.water.visible = false;
    }

    // fences along the verge
    for (let sd = 0; sd < 2; sd++) {
      const side = sd ? 1 : -1;
      const kd = kindAt(d0 + 30);
      const prob = kd === 'meadow' ? 0.55 : kd === 'barnyard' ? 0.7 : 0;
      if (rnd(k, 900 + sd, 1) < prob) {
        for (let j = 0; j < 15; j++) {
          const dd = d0 + j * 4 + 2;
          const kk = kindAt(dd);
          if (kk !== 'meadow' && kk !== 'barnyard') continue;
          if (dB >= 0 && Math.abs(dd - dB) < 10) continue;
          if (rnd(k, 910 + sd * 20 + j, 2) < 0.05) continue;
          put('fence', slot, dd, side * FENCE_X, heading(dd), 1, 1);
        }
      }
    }

    // lanterns (sunset)
    for (let j = 0; j < 5; j++) {
      const dd = d0 + j * 12 + 6;
      if (kindAt(dd) !== 'sunset') continue;
      for (const side of [-1, 1]) {
        put('lantern', slot, dd, side * 13.2, 0, 1, 1);
        put('lamp', slot, dd, side * 13.2, 0, 1, 1);
      }
    }

    // roadside distance markers
    for (let j = 0; j < 2; j++) put('marker', slot, d0 + 10 + j * 30, ((k + j) & 1 ? 1 : -1) * 12.3, 0, 1, 1);

    // far hills
    for (let sd = 0; sd < 2; sd++) {
      const side = sd ? 1 : -1;
      for (let j = 0; j < 3; j++) {
        const dd = d0 + ((j + rnd(k, 1000 + sd * 4 + j, 1)) / 3) * CL;
        const kd = kindAt(dd);
        if (kd === 'canyon') continue;
        const w = (kd === 'sunset' ? 40 : 26) + rnd(k, 1010 + sd * 4 + j, 2) * 40;
        const h = (kd === 'sunset' ? 18 : kd === 'creek' ? 12 : 8) + rnd(k, 1020 + sd * 4 + j, 3) * (kd === 'sunset' ? 26 : 16);
        const x = side * (80 + rnd(k, 1030 + sd * 4 + j, 4) * 130);
        put('hill', slot, dd, x, rnd(k, 1040 + sd * 4 + j, 5) * 6.28, w, h, -h * 0.04);
        // put() scales y with sx, so correct the matrix for the hill: write explicitly
        const t = types.hill;
        const idx = slot * t.cap + (counts.hill - 1);
        _p.set(center(dd) + x, -h * 0.04, -dd);
        _q.setFromAxisAngle(UP, rnd(k, 1040 + sd * 4 + j, 5) * 6.28);
        _m.compose(_p, _q, _s.set(w, h, w));
        t.mesh.setMatrixAt(idx, _m);
      }
    }

    // scatter
    for (let sd = 0; sd < 2; sd++) {
      const side = sd ? 1 : -1;
      for (let i = 0; i < SLOTS; i++) {
        const sk = i * 2 + sd;
        const dd = d0 + ((i + rnd(k, sk, 1)) / SLOTS) * CL;
        if (rnd(k, sk, 2) < 0.1) continue;
        if (dB >= 0 && Math.abs(dd - dB) < 10) continue;
        const kind = kindAt(dd);
        const tbl = TABLE[kind];
        let tot = 0;
        for (const e of tbl) tot += e[1];
        let pick = rnd(k, sk, 3) * tot;
        let ent = tbl[0];
        for (const e of tbl) { pick -= e[1]; if (pick <= 0) { ent = e; break; } }
        const name = ent[0];
        if ((counts[name] ?? 0) >= types[name].cap) continue;
        const x = side * (ent[2] + rnd(k, sk, 4) * (ent[3] - ent[2]));
        const sc = SCALE[name] ?? [1, 1];
        const s = lerp(sc[0], sc[1], rnd(k, sk, 5));
        const r = (RADIUS[name] ?? 1.5) * s;
        if (r > 2.4) {
          let clash = false;
          for (let b = 0; b < bigX.length; b++) {
            const dx = bigX[b] - (center(dd) + x), dz = bigD[b] - dd;
            if (dx * dx + dz * dz < (bigR[b] + r) * (bigR[b] + r)) { clash = true; break; }
          }
          if (clash) continue;
          bigX.push(center(dd) + x); bigD.push(dd); bigR.push(r);
        }
        let yaw = rnd(k, sk, 6) * Math.PI * 2;
        if (FACES_ROAD.has(name)) yaw = heading(dd) + (side < 0 ? -Math.PI / 2 : Math.PI / 2) + (rnd(k, sk, 7) - 0.5) * 0.25;
        put(name, slot, dd, x, yaw, s, s, 0, kind);
      }
    }

    // flush: zero the unused tail of each slice and mark buffers dirty
    for (const name in types) {
      const t = types[name];
      const used = counts[name] ?? 0;
      for (let n = used; n < t.cap; n++) t.mesh.setMatrixAt(slot * t.cap + n, ZERO);
      t.mesh.instanceMatrix.needsUpdate = true;
      if (t.mesh.instanceColor) t.mesh.instanceColor.needsUpdate = true;
    }
    if (!ch.hasWm) sailsMesh.setMatrixAt(slot, ZERO);
  }

  function rebuild(slot: number, k: number): void {
    const ch = chunks[slot];
    ch.k = k;
    buildTerrain(ch, k);
    buildScenery(ch, slot, k);
  }

  // ---- gates + start line ------------------------------------------------------------------
  const gateGeo = gateFrame();
  const bannerGeo = new THREE.PlaneGeometry(16, 4);
  const gates: Gate[] = [];
  for (let i = 0; i < 3; i++) {
    const cv = document.createElement('canvas');
    cv.width = 1024;
    cv.height = 256;
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true, color: 0xffd21f });
    const group = new THREE.Group();
    const frame = new THREE.Mesh(gateGeo, mat);
    const bm = new THREE.MeshBasicMaterial({ map: tex });
    const f = new THREE.Mesh(bannerGeo, bm);
    f.position.set(0, 9.7, 0.72);
    const b = new THREE.Mesh(bannerGeo, bm);
    b.position.set(0, 9.7, -0.72);
    b.rotation.y = Math.PI;
    group.add(frame, f, b);
    group.visible = false;
    root.add(group);
    gates.push({ group, mat, cv, tex, g: -1 });
  }
  const startLine = startLineMesh();
  startLine.position.set(center(0), 0, 0);
  startLine.rotation.y = heading(0);
  root.add(startLine);

  // ---- clouds, birds, tumbleweeds, fireflies -----------------------------------------------
  const NCLOUD = 9;
  const clouds = new THREE.InstancedMesh(cloudGeo(), matCloud, NCLOUD);
  clouds.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  clouds.frustumCulled = false;
  root.add(clouds);

  const NCLOUD2 = 7;
  const clouds2 = new THREE.InstancedMesh(cloudGeo(), matCloud2, NCLOUD2);
  clouds2.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  clouds2.frustumCulled = false;
  clouds2.renderOrder = -8;
  root.add(clouds2);

  const NWALK = 7;
  const walkers = new THREE.InstancedMesh(cow(), matStatic, NWALK);
  walkers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  walkers.frustumCulled = false;
  walkers.castShadow = true;
  root.add(walkers);

  // sun glow sprite + light shafts
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xfff3c4, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, fog: false, opacity: 0.6 }));
  sunGlow.renderOrder = -9;
  sunGlow.frustumCulled = false;
  root.add(sunGlow);
  const shaftGeo = new THREE.PlaneGeometry(1, 1);
  shaftGeo.translate(0, 0.5, 0);
  interface Shaft { mesh: THREE.Mesh; u: { uCol: { value: THREE.Color }; uAmt: { value: number } } }
  const shafts: Shaft[] = [];
  for (let i = 0; i < 4; i++) {
    const u = { uCol: { value: new THREE.Color(0xfff3c4) }, uAmt: { value: 0 } };
    const mesh = new THREE.Mesh(shaftGeo, new THREE.ShaderMaterial({ uniforms: u, vertexShader: SHAFT_VERT, fragmentShader: SHAFT_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
    mesh.frustumCulled = false;
    mesh.renderOrder = 6;
    root.add(mesh);
    shafts.push({ mesh, u });
  }

  // speed streaks beside the road
  const NSTREAK = 24;
  const streakGeo = new THREE.PlaneGeometry(1, 1);
  streakGeo.rotateX(-Math.PI / 2);
  const streaks = new THREE.InstancedMesh(streakGeo, matStreak, NSTREAK);
  streaks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  streaks.frustumCulled = false;
  root.add(streaks);

  // zone ambient particles (pollen / chaff / mist / dust / petals), wrapped around the car
  const NAMB = 140;
  const ambBase = new Float32Array(NAMB * 4);
  for (let i = 0; i < NAMB; i++) { ambBase[i * 4] = rnd(i, 1, 66); ambBase[i * 4 + 1] = rnd(i, 2, 66); ambBase[i * 4 + 2] = rnd(i, 3, 66); ambBase[i * 4 + 3] = rnd(i, 4, 66); }
  const ambPos = new Float32Array(NAMB * 3);
  const ambPh = new Float32Array(NAMB);
  for (let i = 0; i < NAMB; i++) ambPh[i] = ambBase[i * 4 + 3];
  const ambGeo = new THREE.BufferGeometry();
  ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3).setUsage(THREE.DynamicDrawUsage));
  ambGeo.setAttribute('aPh', new THREE.BufferAttribute(ambPh, 1));
  const ambU = { uScale: { value: 600 }, uTime: timeU, uCol: { value: new THREE.Color(0xfff3a0) }, uAmt: { value: 0.8 } };
  const ambient = new THREE.Points(ambGeo, new THREE.ShaderMaterial({ uniforms: ambU, vertexShader: AM_VERT, fragmentShader: AM_FRAG, transparent: true, depthWrite: false, fog: false }));
  ambient.frustumCulled = false;
  root.add(ambient);
  const AMB_COL: Record<Zone['kind'], number> = { meadow: 0xfff6a8, barnyard: 0xf0cf70, creek: 0xd8f6ff, canyon: 0xe8a066, sunset: 0xff9ac4 };
  const AMB_FALL: Record<Zone['kind'], number> = { meadow: 0.15, barnyard: 0.3, creek: -0.2, canyon: 0.6, sunset: 0.7 };
  const ambTarget = new THREE.Color();
  let ambFall = 0.2;

  const NBIRD = 5;
  const birdBody = new THREE.InstancedMesh(new THREE.SphereGeometry(0.28, 6, 5), matDark, NBIRD);
  const birdWingL = new THREE.InstancedMesh(birdWing(), matDark, NBIRD);
  const birdWingR = new THREE.InstancedMesh(birdWing(), matDark, NBIRD);
  for (const m of [birdBody, birdWingL, birdWingR]) {
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.frustumCulled = false;
    root.add(m);
  }
  birdBody.scale.set(1, 1, 1);

  const NTUMBLE = 4;
  const tumble = new THREE.InstancedMesh(merge([ico(0.85, 1, 0xb8863e, [0, 0.85, 0]), ico(0.55, 0, 0xd2a458, [0.2, 0.85, 0.1])], 0.1), matTumble, NTUMBLE);
  tumble.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  tumble.frustumCulled = false;
  root.add(tumble);

  const NFLY = 90;
  const flyBase = new Float32Array(NFLY * 4);
  for (let i = 0; i < NFLY; i++) {
    flyBase[i * 4] = rnd(i, 1, 55) < 0.5 ? -1 : 1; // side
    flyBase[i * 4 + 1] = 12 + rnd(i, 2, 55) * 26; // lateral
    flyBase[i * 4 + 2] = rnd(i, 3, 55); // along
    flyBase[i * 4 + 3] = rnd(i, 4, 55); // phase/height
  }
  const flyPos = new Float32Array(NFLY * 3);
  const flyPh = new Float32Array(NFLY);
  for (let i = 0; i < NFLY; i++) flyPh[i] = flyBase[i * 4 + 3];
  const flyGeo = new THREE.BufferGeometry();
  flyGeo.setAttribute('position', new THREE.BufferAttribute(flyPos, 3).setUsage(THREE.DynamicDrawUsage));
  flyGeo.setAttribute('aPh', new THREE.BufferAttribute(flyPh, 1));
  const flyU = { uScale: { value: 600 }, uTime: timeU, uAmt: { value: 0 } };
  const flies = new THREE.Points(flyGeo, new THREE.ShaderMaterial({ uniforms: flyU, vertexShader: FF_VERT, fragmentShader: FF_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  flies.frustumCulled = false;
  flies.visible = false;
  root.add(flies);

  // ---- palette -----------------------------------------------------------------------------
  const cA = new THREE.Color(), cB = new THREE.Color();
  const pal = {
    zen: new THREE.Color(), hor: new THREE.Color(), fog: new THREE.Color(), gA: new THREE.Color(), gB: new THREE.Color(),
    ground: new THREE.Color(), road: new THREE.Color(), sun: new THREE.Color(), hemiSky: new THREE.Color(), hemiGround: new THREE.Color(),
    hill: new THREE.Color(), cloud: new THREE.Color(),
  };
  const NIGHT_ZEN = new THREE.Color(0x0a0e2a), NIGHT_HOR = new THREE.Color(0x1d2552), NIGHT_SUN = new THREE.Color(0x6a7cc8);
  const WHITE = new THREE.Color(0xffffff);
  const mixHex = (out: THREE.Color, a: number, b: number, k: number) => out.copy(cA.setHex(a)).lerp(cB.setHex(b), k);
  let sunsetW = 0;
  const sunVis = new THREE.Vector3();
  const lightDir = new THREE.Vector3();

  function applyPalette(D: number): void {
    const bnd = Math.round(D / ZONE_LEN);
    const k = bnd <= 0 ? 1 : smooth((D - bnd * ZONE_LEN + 75) / 150);
    const ia = Math.max(0, bnd - 1), ib = Math.max(0, bnd);
    const za = zoneOf(ia), zb = zoneOf(ib);
    const ea = EXTRAS[mod(ia, ZONES.length)], eb = EXTRAS[mod(ib, ZONES.length)];
    mixHex(pal.zen, za.sky[0], zb.sky[0], k);
    mixHex(pal.fog, za.fog, zb.fog, k);
    pal.hor.copy(pal.fog);
    mixHex(pal.gA, za.grass[0], zb.grass[0], k);
    mixHex(pal.gB, za.grass[1], zb.grass[1], k);
    mixHex(pal.ground, za.ground, zb.ground, k);
    mixHex(pal.road, za.road, zb.road, k);
    mixHex(pal.sun, za.sun, zb.sun, k);
    mixHex(pal.hemiSky, ea.hemiSky, eb.hemiSky, k);
    mixHex(pal.hemiGround, ea.hemiGround, eb.hemiGround, k);
    mixHex(pal.hill, ea.hill, eb.hill, k);
    mixHex(pal.cloud, ea.cloud, eb.cloud, k);
    const sunEl = lerp(ea.sunEl, eb.sunEl, k);
    const sunSize = lerp(ea.sunSize, eb.sunSize, k);
    let sunInt = lerp(ea.sunInt, eb.sunInt, k);
    let hemiInt = lerp(ea.hemiInt, eb.hemiInt, k);
    sunsetW = (za.kind === 'sunset' ? 1 - k : 0) + (zb.kind === 'sunset' ? k : 0);

    // night
    if (night > 0.001) {
      pal.zen.lerp(NIGHT_ZEN, night);
      pal.hor.lerp(NIGHT_HOR, night);
      pal.fog.lerp(NIGHT_HOR, night);
      pal.sun.lerp(NIGHT_SUN, night);
      pal.hemiSky.lerp(NIGHT_ZEN, night * 0.7);
      pal.hemiGround.lerp(NIGHT_ZEN, night * 0.6);
      pal.gA.multiplyScalar(1 - night * 0.55);
      pal.gB.multiplyScalar(1 - night * 0.55);
      pal.ground.multiplyScalar(1 - night * 0.55);
      pal.road.multiplyScalar(1 - night * 0.4);
      pal.hill.multiplyScalar(1 - night * 0.55);
      pal.cloud.lerp(NIGHT_HOR, night * 0.8);
      sunInt *= 1 - night * 0.8;
      hemiInt *= 1 - night * 0.45;
    }

    skyU.uZen.value.copy(pal.zen);
    skyU.uHor.value.copy(pal.hor);
    skyU.uSunCol.value.copy(pal.sun);
    skyU.uSunSize.value = sunSize;
    skyU.uNight.value = night;
    const h = Math.sqrt(Math.max(0, 1 - sunEl * sunEl));
    sunVis.set(0.4 * h, sunEl, -0.92 * h);
    skyU.uSunDir.value.copy(sunVis);
    sunGlow.position.copy(sunVis).multiplyScalar(140);
    sunGlow.scale.setScalar(70 + sunSize * 600);
    (sunGlow.material as THREE.SpriteMaterial).color.copy(pal.sun);
    (sunGlow.material as THREE.SpriteMaterial).opacity = 0.55 * (1 - night * 0.7);

    fog.color.copy(pal.fog);
    fog.near = lerp(70, 40, night);
    fog.far = lerp(285, 210, night);
    renderer.setClearColor(pal.fog);

    hemi.color.copy(pal.hemiSky);
    hemi.groundColor.copy(pal.hemiGround);
    hemi.intensity = hemiInt;
    sun.color.copy(pal.sun);
    sun.intensity = sunInt;
    // light from behind-left-above so the faces the camera sees stay bright (sun disc is ahead)
    const le = Math.max(sunEl, 0.42);
    const lh = Math.sqrt(1 - le * le);
    lightDir.set(-0.45 * lh, le, 0.75 * lh);

    groundU.uGA.value.copy(pal.gA);
    groundU.uGB.value.copy(pal.gB);
    groundU.uGround.value.copy(pal.ground);
    matRoad.color.copy(pal.road);
    matHill.color.copy(pal.hill);
    matCloud.color.copy(WHITE).lerp(pal.cloud, 1);
    matCloud.emissive.copy(pal.cloud).multiplyScalar(0.55);
    matWater.color.setHex(0x3aa8f0).lerp(pal.fog, 0.12).multiplyScalar(1 - night * 0.55);
    matWater.emissive.setHex(0x0c3a66).multiplyScalar(1 - night * 0.6);
    matLamp.color.setHex(0xffffff).multiplyScalar(1 + night * 0.6);
  }

  // ---- per-frame animation -----------------------------------------------------------------
  const dummy = new THREE.Object3D();

  function animateSceneryFrame(D: number, t: number): void {
    // windmill sails
    let any = false;
    for (let s = 0; s < NC; s++) {
      const ch = chunks[s];
      if (!ch.hasWm) continue;
      _m2.makeTranslation(0, 9.0, -1.6);
      _m.copy(ch.wm).multiply(_m2);
      _m2.makeRotationZ(t * 1.1 + s);
      _m.multiply(_m2);
      sailsMesh.setMatrixAt(s, _m);
      any = true;
    }
    if (any) sailsMesh.instanceMatrix.needsUpdate = true;

    // clouds: world-stable via modulo along d, drifting sideways
    const near = D - 80;
    for (let j = 0; j < NCLOUD; j++) {
      const base = j * 41 + rnd(j, 1, 31) * 30;
      const dd = near + mod(base - near, 360);
      const lx0 = (rnd(j, 2, 31) - 0.5) * 360;
      const lx = mod(lx0 + t * 1.3 + 180, 360) - 180;
      const fade = smooth((190 - Math.abs(lx)) / 45);
      const sc = (14 + rnd(j, 3, 31) * 14) * fade;
      dummy.position.set(center(dd) + lx, 75 + rnd(j, 4, 31) * 40, -dd);
      dummy.rotation.set(0, rnd(j, 5, 31) * 0.6, 0);
      dummy.scale.set(sc, sc * 0.9, sc);
      dummy.updateMatrix();
      clouds.setMatrixAt(j, dummy.matrix);
    }
    clouds.instanceMatrix.needsUpdate = true;

    // birds
    const n0 = Math.ceil((D - 20 - 14 * t) / 80);
    for (let j = 0; j < NBIRD; j++) {
      const n = n0 + j;
      const dd = n * 80 + 14 * t;
      const lx = (rnd(n, 1, 41) - 0.5) * 90 + Math.sin(t * 0.5 + n) * 6;
      const y = 15 + rnd(n, 2, 41) * 14 + Math.sin(t * 1.2 + n * 2) * 0.8;
      const flap = Math.sin(t * 9 + n * 1.7) * 0.7;
      const yaw = heading(dd) + Math.cos(t * 0.5 + n) * 0.25;
      dummy.position.set(center(dd) + lx, y, -dd);
      dummy.rotation.set(0, yaw, 0);
      dummy.scale.set(1.3, 1.3, 1.3);
      dummy.updateMatrix();
      birdBody.setMatrixAt(j, dummy.matrix);
      _m.copy(dummy.matrix);
      _m3.makeRotationZ(flap).multiply(_m4.makeScale(-1, 1, 1));
      birdWingL.setMatrixAt(j, _m5.copy(_m).multiply(_m3));
      _m2.makeRotationZ(-flap);
      birdWingR.setMatrixAt(j, _m.multiply(_m2));
    }
    birdBody.instanceMatrix.needsUpdate = true;
    birdWingL.instanceMatrix.needsUpdate = true;
    birdWingR.instanceMatrix.needsUpdate = true;

    // tumbleweeds (canyon only)
    const w0 = Math.ceil((D - 30 + 4 * t) / 90);
    for (let j = 0; j < NTUMBLE; j++) {
      const n = w0 + j;
      const dd = n * 90 - 4 * t;
      const on = kindAt(dd) === 'canyon' ? 1 : 0;
      const side = rnd(n, 1, 51) < 0.5 ? -1 : 1;
      const x = side * (13.5 + rnd(n, 2, 51) * 14);
      const bounce = Math.abs(Math.sin(t * 5 + n * 3)) * 0.5;
      dummy.position.set(center(dd) + x, bounce, -dd);
      dummy.rotation.set(dd / 0.9, 0, 0);
      dummy.scale.setScalar(on * (0.7 + rnd(n, 3, 51) * 0.5));
      dummy.updateMatrix();
      tumble.setMatrixAt(j, dummy.matrix);
    }
    tumble.instanceMatrix.needsUpdate = true;

    // fireflies
    const amt = Math.max(sunsetW, night * 0.9);
    if (amt > 0.02) {
      flies.visible = true;
      flyU.uAmt.value = amt;
      const L = 240, o = D - 40;
      for (let i = 0; i < NFLY; i++) {
        const dd = o + mod(flyBase[i * 4 + 2] * L - o, L);
        const ph = flyBase[i * 4 + 3];
        flyPos[i * 3] = center(dd) + flyBase[i * 4] * flyBase[i * 4 + 1] + Math.sin(t * 0.7 + ph * 40) * 1.6;
        flyPos[i * 3 + 1] = 0.8 + ph * 5 + Math.sin(t * 1.1 + ph * 25) * 0.7;
        flyPos[i * 3 + 2] = -dd + Math.cos(t * 0.6 + ph * 33) * 1.4;
      }
      (flyGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
      flyU.uScale.value = renderer.domElement.height * 0.9;
    } else {
      flies.visible = false;
    }

    waterTex.offset.y = -t * 0.12;

    // high cloud layer
    for (let j = 0; j < NCLOUD2; j++) {
      const dd = near + mod(j * 71 + rnd(j, 1, 32) * 40 - near, 500);
      const lx0 = (rnd(j, 2, 32) - 0.5) * 520;
      const lx = mod(lx0 + t * 0.7 + 260, 520) - 260;
      const fade = smooth((260 - Math.abs(lx)) / 70);
      const sc = (34 + rnd(j, 3, 32) * 30) * fade;
      dummy.position.set(center(dd) + lx, 120 + rnd(j, 4, 32) * 25, -dd);
      dummy.rotation.set(0, rnd(j, 5, 32) * 1.2, 0);
      dummy.scale.set(sc * 1.4, sc * 0.35, sc);
      dummy.updateMatrix();
      clouds2.setMatrixAt(j, dummy.matrix);
    }
    clouds2.instanceMatrix.needsUpdate = true;

    // farm animals ambling along the verge (meadow / barnyard / sunset)
    const wn0 = Math.ceil((D - 40 - 0.9 * t) / 110);
    for (let j = 0; j < NWALK; j++) {
      const n = wn0 + j;
      const dd = n * 110 + 0.9 * t + rnd(n, 9, 61) * 30;
      const kk = kindAt(dd);
      const on = kk === 'meadow' || kk === 'barnyard' || kk === 'sunset' ? 1 : 0;
      const side = rnd(n, 1, 61) < 0.5 ? -1 : 1;
      const x = side * (17 + rnd(n, 2, 61) * 16);
      const ph = rnd(n, 3, 61) * 6.28;
      dummy.position.set(center(dd) + x, Math.abs(Math.sin(t * 5 + ph)) * 0.07, -dd);
      dummy.rotation.set(0, heading(dd), Math.sin(t * 5 + ph) * 0.04);
      dummy.scale.setScalar(on * (0.85 + rnd(n, 4, 61) * 0.25));
      dummy.updateMatrix();
      walkers.setMatrixAt(j, dummy.matrix);
    }
    walkers.instanceMatrix.needsUpdate = true;

    // speed streaks
    const sp01 = clamp01((curSpeed - 25) / 45);
    matStreak.opacity = sp01 * 0.5;
    streaks.visible = sp01 > 0.02;
    if (streaks.visible) {
      const so = D - 10;
      for (let j = 0; j < NSTREAK; j++) {
        const dd = so + mod(rnd(j, 1, 71) * 90 - so, 90);
        const side = j & 1 ? 1 : -1;
        const x = side * (11.9 + rnd(j, 2, 71) * 4.5);
        dummy.position.set(center(dd) + x, 0.13, -dd);
        dummy.rotation.set(0, heading(dd), 0);
        dummy.scale.set(0.09 + rnd(j, 3, 71) * 0.08, 1, 0.6 + curSpeed * 0.1 * (0.4 + rnd(j, 4, 71)));
        dummy.updateMatrix();
        streaks.setMatrixAt(j, dummy.matrix);
      }
      streaks.instanceMatrix.needsUpdate = true;
    }

    // zone ambient particles
    const ak = kindAt(D + 40);
    ambTarget.setHex(AMB_COL[ak]);
    ambU.uCol.value.lerp(ambTarget, 0.04);
    ambFall += (AMB_FALL[ak] - ambFall) * 0.04;
    ambU.uAmt.value = ak === 'creek' ? 0.45 : 0.85;
    ambU.uScale.value = renderer.domElement.height * 0.9;
    const ao = D - 15, AL = 110;
    for (let i = 0; i < NAMB; i++) {
      const dd = ao + mod(ambBase[i * 4] * AL - ao, AL);
      const ph = ambBase[i * 4 + 3];
      ambPos[i * 3] = center(dd) + (ambBase[i * 4 + 1] - 0.5) * 56 + Math.sin(t * 0.8 + ph * 40) * 1.5 + t * 0.2 * (ph - 0.5);
      ambPos[i * 3 + 1] = mod(ambBase[i * 4 + 2] * 12 - t * ambFall * (0.5 + ph), 12) + 0.3;
      ambPos[i * 3 + 2] = -dd + Math.cos(t * 0.7 + ph * 33) * 1.2;
    }
    (ambGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;

    // light shafts (world-stable along the road)
    const shAmt = (sunsetW * 0.1 + 0.07) * (1 - night);
    const sk = Math.atan(-lightDir.x / lightDir.y);
    const sh0 = D - 20;
    for (let i = 0; i < shafts.length; i++) {
      const s = shafts[i];
      const dd = sh0 + mod(i * 55 + rnd(i, 1, 81) * 30 - sh0, 220);
      const side = i & 1 ? 1 : -1;
      const x = side * (22 + rnd(i, 2, 81) * 30);
      const dist = dd - D;
      s.mesh.position.set(center(dd) + x, 0, -dd);
      s.mesh.rotation.set(0, 0, sk);
      s.mesh.scale.set(7 + rnd(i, 3, 81) * 6, 55, 1);
      s.u.uAmt.value = shAmt * smooth((200 - dist) / 60) * smooth((dist + 10) / 30);
      s.u.uCol.value.copy(pal.sun);
    }
  }

  function updateGates(D: number): void {
    const zi = Math.max(0, zoneIndex(D));
    for (const g of [zi, zi + 1]) {
      const gate = gates[g % 3];
      const dg = g * ZONE_LEN;
      if (gate.g !== g) {
        gate.g = g;
        const z = zoneOf(g);
        gate.mat.color.setHex(z.accent);
        paintGate(gate.cv, gate.tex, z.name, g === 0 ? "Let's moo!" : `Zone ${g + 1}`, z.accent);
        gate.group.position.set(center(dg), 0, -dg);
        gate.group.rotation.y = heading(dg);
      }
    }
    for (const gate of gates) {
      const dg = gate.g * ZONE_LEN;
      gate.group.visible = gate.g >= 0 && dg > D - 80 && dg < D + AHEAD + 40;
    }
    startLine.visible = D < 120;
  }

  // ---- public API --------------------------------------------------------------------------
  const world: World = {
    update(D, t, dt, speed) {
      void dt;
      curSpeed = speed;
      lastD = D;
      timeU.value = t;

      const zi = zoneIndex(D);
      if (zi !== lastZone) {
        const first = lastZone < 0;
        lastZone = zi;
        if (!first) for (const cb of zoneCbs) cb(zoneOf(zi), zi);
      }

      applyPalette(D);

      // stream chunks
      const kMin = Math.floor((D - BEHIND) / CL), kMax = Math.floor((D + AHEAD) / CL);
      for (let k = kMin; k <= kMax; k++) {
        const slot = mod(k, NC);
        if (chunks[slot].k !== k) rebuild(slot, k);
      }

      // sky dome + sun light follow the car
      const cx = center(D);
      dome.position.set(cx, 0, -D);
      sunGlow.position.set(cx + sunVis.x * 140, sunVis.y * 140, -D + sunVis.z * 140);
      // shadow focus just ahead of the car, snapped to shadow-texel steps in light space (no shimmer)
      const fd = D + 3.5;
      shF.set(center(fd), 0, -fd);
      shR.set(lightDir.z, 0, -lightDir.x).normalize(); // light-space right
      shU.crossVectors(lightDir, shR).normalize();
      const ts = (SH * 2) / 2048;
      const a = shF.dot(shR), b = shF.dot(shU);
      shF.addScaledVector(shR, Math.round(a / ts) * ts - a).addScaledVector(shU, Math.round(b / ts) * ts - b);
      sun.target.position.copy(shF);
      sun.position.set(shF.x + lightDir.x * 100, shF.y + lightDir.y * 100, shF.z + lightDir.z * 100);

      updateGates(D);
      animateSceneryFrame(D, t);
    },
    onZone(cb) {
      zoneCbs.push(cb);
    },
    setNight(amount) {
      night = clamp01(amount);
      applyPalette(lastD);
    },
  };

  // prime the first frame so the scene is never empty
  world.update(0, 0, 0, 0);
  return world;
}
