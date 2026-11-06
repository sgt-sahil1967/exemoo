// Rapids Row - MAP 2 "Jungle Temple Run": a golden-hour jungle river through ancient ruins.
// Same API as track.js, plus track.update(t) that advances moving obstacles (deterministic f(t)).
import * as THREE from 'three';
import * as M2 from './models2.js';

// ---------------------------------------------------------------- utils (copied from track.js)
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash2(ix, iz, seed) {
  let h = (Math.imul(ix | 0, 374761393) + Math.imul(iz | 0, 668265263) + Math.imul(seed | 0, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function vnoise(x, z, seed = 0) {
  const ix = Math.floor(x), iz = Math.floor(z);
  let fx = x - ix, fz = z - iz;
  fx = fx * fx * (3 - 2 * fx); fz = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz, seed), b = hash2(ix + 1, iz, seed), c = hash2(ix, iz + 1, seed), d = hash2(ix + 1, iz + 1, seed);
  return (a + (b - a) * fx) + ((c + (d - c) * fx) - (a + (b - a) * fx)) * fz;
}
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function keyInterp(keys, s) {
  if (s <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (s <= keys[i][0]) {
      const k0 = keys[i - 1], k1 = keys[i];
      const t = (s - k0[0]) / (k1[0] - k0[0]);
      return lerp(k0[1], k1[1], t * t * (3 - 2 * t));
    }
  }
  return keys[keys.length - 1][1];
}
function lerpTable(tab, x) {
  if (x <= tab[0][0]) return tab[0][1];
  for (let i = 1; i < tab.length; i++) {
    if (x <= tab[i][0]) { const a = tab[i - 1], b = tab[i]; return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); }
  }
  return tab[tab.length - 1][1];
}

// ---------------------------------------------------------------- authored river
const TARGET_LEN = 2520;
const HEAD_KEYS = [
  [0, 0], [250, 0], [330, 18], [430, -16], [540, 14], [640, -6], [740, 0], [860, -12], [960, 12], [1060, 0],
  [1150, -22], [1250, 26], [1340, -16], [1420, 0], [1520, 10], [1620, -10], [1720, 0], [1820, 18], [1920, -20],
  [2020, 10], [2120, -8], [2220, 0], [2400, 0], [2520, 0],
];
const HW_KEYS = [
  [0, 22], [200, 22], [300, 18], [480, 19.5], [560, 19], [660, 22], [800, 22], [880, 18], [1000, 16], [1060, 14.5],
  [1110, 12.5], [1180, 12], [1300, 12], [1380, 13.5], [1440, 16], [1700, 16], [1760, 12.5], [1900, 11.5], [2040, 12.5],
  [2110, 17], [2250, 20], [2520, 22],
];
const CUR_KEYS = [
  [0, 1.8], [250, 1.8], [560, 2.4], [860, 2.0], [1050, 2.4], [1100, 4.5], [1380, 5.0], [1440, 2.5], [1700, 2.5],
  [1760, 5.0], [2050, 5.5], [2100, 2.5], [2520, 3.0],
];
const ZONE_DEFS = [
  [0, 250, 'Jungle Gate', false],
  [250, 560, 'Vine Bends', false],
  [560, 860, 'Ruined Causeway', false],
  [860, 1100, 'Croc Marsh', false],
  [1100, 1400, 'Temple Rapids', true],
  [1400, 1700, 'Hall of Gates', false],
  [1700, 2060, 'Waterfall Gorge', true],
  [2060, 1e9, 'Golden Run', false],
];
const GATE_S = [300, 600, 870, 1080, 1395, 1692, 2062, 2236];
const GATE_COLORS = ['#ffd21f', '#2f7cff', '#2fc65a', '#ff3b30', '#ffd21f', '#2f7cff', '#2fc65a', '#ff3b30'];
const START_ARCH_S = 24;
const BANK_MARGIN = 1.4;

function crSegment(P0, P1, P2, P3, t, out) {
  const d = (a, b) => Math.pow(Math.hypot(b[0] - a[0], b[1] - a[1]) + 1e-6, 0.5);
  const t0 = 0, t1 = t0 + d(P0, P1), t2 = t1 + d(P1, P2), t3 = t2 + d(P2, P3);
  const tt = lerp(t1, t2, t);
  const mix = (A, B, ta, tb) => [((tb - tt) * A[0] + (tt - ta) * B[0]) / (tb - ta), ((tb - tt) * A[1] + (tt - ta) * B[1]) / (tb - ta)];
  const A1 = mix(P0, P1, t0, t1), A2 = mix(P1, P2, t1, t2), A3 = mix(P2, P3, t2, t3);
  const B1 = mix(A1, A2, t0, t2), B2 = mix(A2, A3, t1, t3);
  const C = mix(B1, B2, t1, t2);
  out[0] = C[0]; out[1] = C[1];
}

// safe racing line (used to lay out coins): [s, lateral]
const LINE = [
  [60, 0], [200, 3], [300, -3], [340, 3], [360, 4], [400, -6], [445, -5], [480, 0], [560, 0], [620, 0], [690, -4], [720, 0], [760, 0],
  [782, 3], [805, -2], [830, -4], [845, -5], [870, 0], [900, 0], [930, 7], [955, 0], [975, -8], [995, 0], [1010, 7], [1050, 6], [1080, 0],
  [1110, 0], [1160, -5], [1195, 2], [1235, 5], [1265, 0], [1295, 4], [1335, -4], [1365, -5], [1395, 0], [1700, 0], [1710, 0], [1770, 4],
  [1805, 6], [1850, -5], [1895, -4], [1940, -4], [1965, 2], [2000, 5], [2025, 5], [2062, 0], [2100, 0], [2140, -6], [2175, 5], [2210, 5],
  [2250, 10], [2300, -11], [2340, 0], [2520, 0],
];

// ================================================================= createTrack
export function createTrack() {
  const CP_STEP = 20;
  const ctrl = [];
  {
    let x = 0, z = 0;
    const ds = 0.5;
    for (let s = 0; s <= TARGET_LEN + 1e-6; s += ds) {
      if (Math.abs(s % CP_STEP) < 1e-6) ctrl.push([x, z]);
      const h = keyInterp(HEAD_KEYS, s + ds * 0.5) * Math.PI / 180;
      x += -Math.sin(h) * ds; z += -Math.cos(h) * ds;
    }
  }
  const n = ctrl.length;
  const ext = [[2 * ctrl[0][0] - ctrl[1][0], 2 * ctrl[0][1] - ctrl[1][1]], ...ctrl,
    [2 * ctrl[n - 1][0] - ctrl[n - 2][0], 2 * ctrl[n - 1][1] - ctrl[n - 2][1]]];
  const SUB = 16, dense = [], tmp = [0, 0];
  for (let i = 1; i < ext.length - 2; i++) for (let k = 0; k < SUB; k++) { crSegment(ext[i - 1], ext[i], ext[i + 1], ext[i + 2], k / SUB, tmp); dense.push([tmp[0], tmp[1]]); }
  dense.push(ctrl[n - 1].slice());
  const cum = [0];
  for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  const length = Math.floor(cum[cum.length - 1]);
  const N = length + 1;
  const PX = new Float64Array(N), PZ = new Float64Array(N);
  {
    let j = 1;
    for (let i = 0; i < N; i++) {
      while (j < cum.length - 1 && cum[j] < i) j++;
      const t = (i - cum[j - 1]) / Math.max(1e-9, cum[j] - cum[j - 1]);
      PX[i] = lerp(dense[j - 1][0], dense[j][0], t);
      PZ[i] = lerp(dense[j - 1][1], dense[j][1], t);
    }
  }
  const TX = new Float64Array(N), TZ = new Float64Array(N), HWt = new Float64Array(N), CURt = new Float64Array(N), HD = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const a = Math.max(0, i - 1), b = Math.min(N - 1, i + 1);
    const dx = PX[b] - PX[a], dz = PZ[b] - PZ[a], l = Math.hypot(dx, dz) || 1;
    TX[i] = dx / l; TZ[i] = dz / l;
    HD[i] = Math.atan2(-TX[i], -TZ[i]);
    HWt[i] = keyInterp(HW_KEYS, i);
    CURt[i] = keyInterp(CUR_KEYS, i);
  }
  const KAP = new Float64Array(N);
  for (let i = 0; i < N; i++) { const a = Math.max(0, i - 6), b = Math.min(N - 1, i + 6); KAP[i] = (HD[b] - HD[a]) / Math.max(1, b - a); }

  const track = { length };
  const idx = (s) => { const c = clamp(s, 0, length); const i = Math.min(length - 1, Math.floor(c)); return [i, c - i]; };
  track.sample = function (s) {
    const [i, f] = idx(s);
    let tx = lerp(TX[i], TX[i + 1], f), tz = lerp(TZ[i], TZ[i + 1], f);
    const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
    return { x: lerp(PX[i], PX[i + 1], f), z: lerp(PZ[i], PZ[i + 1], f), tx, tz, halfWidth: lerp(HWt[i], HWt[i + 1], f), current: lerp(CURt[i], CURt[i + 1], f) };
  };
  function refine(x, z, i) {
    let bestS = i, bestD = Infinity;
    for (let j = Math.max(0, i - 1); j <= Math.min(length - 1, i); j++) {
      const ex = PX[j + 1] - PX[j], ez = PZ[j + 1] - PZ[j];
      const t = clamp(((x - PX[j]) * ex + (z - PZ[j]) * ez) / (ex * ex + ez * ez), 0, 1);
      const d = Math.hypot(x - (PX[j] + ex * t), z - (PZ[j] + ez * t));
      if (d < bestD) { bestD = d; bestS = j + t; }
    }
    return bestS;
  }
  function scan(x, z, i0, i1, step) {
    let best = i0, bd = Infinity;
    for (let i = i0; i <= i1; i += step) { const d = (PX[i] - x) * (PX[i] - x) + (PZ[i] - z) * (PZ[i] - z); if (d < bd) { bd = d; best = i; } }
    return [best, bd];
  }
  track.locate = function (x, z, hintS) {
    let s, done = false;
    if (hintS !== undefined && hintS !== null && isFinite(hintS)) {
      const h = clamp(Math.round(hintS), 0, length);
      const i0 = Math.max(0, h - 25), i1 = Math.min(length, h + 45);
      const [b, bd] = scan(x, z, i0, i1, 1);
      const atEdge = (b === i0 && i0 > 0) || (b === i1 && i1 < length);
      if (!atEdge && bd < 80 * 80) { s = refine(x, z, b); done = true; }
    }
    if (!done) {
      const [c] = scan(x, z, 0, length, 5);
      const [b] = scan(x, z, Math.max(0, c - 6), Math.min(length, c + 6), 1);
      s = refine(x, z, b);
    }
    const p = track.sample(s);
    return { s, lateral: (x - p.x) * -p.tz + (z - p.z) * p.tx, halfWidth: p.halfWidth, tx: p.tx, tz: p.tz, current: p.current };
  };
  const at = (s, l) => { const p = track.sample(s); return { x: p.x + -p.tz * l, z: p.z + p.tx * l, p }; };
  const headingAt = (s) => { const p = track.sample(s); return Math.atan2(-p.tx, -p.tz); };
  const hwAt = (s) => track.sample(s).halfWidth;
  /** straight local frame at s: world(lat, ds) with ds measured downstream */
  const frameAt = (s) => {
    const p = track.sample(s);
    return { s, p, heading: Math.atan2(-p.tx, -p.tz), world: (lat, ds) => ({ x: p.x + -p.tz * lat + p.tx * ds, z: p.z + p.tx * lat + p.tz * ds }) };
  };

  {
    const p = track.sample(8);
    track.start = { x: p.x, z: p.z, heading: Math.atan2(-p.tx, -p.tz), s: 8 };
  }
  track.finishS = length - 40;
  track.zones = ZONE_DEFS.map(([s0, s1, name, rapids]) => ({ s0, s1: Math.min(s1, length), name, rapids }));
  track.gates = GATE_S.map((s, i) => {
    const p = track.sample(s);
    return { s, x: p.x, z: p.z, heading: Math.atan2(-p.tx, -p.tz), halfWidth: p.halfWidth, label: 'CP ' + (i + 1) };
  });

  // ---------------------------------------------------------------- obstacles
  const rng = mulberry32(20261029);
  const rr = (a, b) => lerp(a, b, rng());
  const obstacles = [];
  const decor = { bridges: [], arches: [], locks: [], rigs: [], hazardS: [] };
  const base = (type, s, lat, o) => Object.assign({
    type, shape: 'circle', x: 0, z: 0, r: 1, rot: 0, scale: 1, seed: 0, solid: true, hazard: false, moving: false, vx: 0, vz: 0, s, lat,
  }, o);
  const push = (o) => { obstacles.push(o); return o; };
  const addRock = (s, lat, size) => { const w = at(s, lat); return push(base('rock', s, lat, { x: w.x, z: w.z, r: size * 0.9, scale: size, seed: (rng() * 1e6) | 0, rot: rng() * 6.28 })); };
  const addPillar = (s, lat, h, broken) => { const w = at(s, lat); return push(base('pillar', s, lat, { x: w.x, z: w.z, r: 1.2, scale: h, seed: (rng() * 1e6) | 0, broken: !!broken })); };
  const addStatue = (s, lat) => { const w = at(s, lat); return push(base('statue', s, lat, { x: w.x, z: w.z, r: 1.9, seed: (rng() * 1e6) | 0 })); };
  const segObs = (type, s, lat0, ds0, lat1, ds1, r, o) => { // segment from (s+ds0, lat0) to (s+ds1, lat1) in the local frame
    const f = frameAt(s), a = f.world(lat0, ds0), b = f.world(lat1, ds1);
    return base(type, s, (lat0 + lat1) / 2, Object.assign({
      shape: 'segment', x1: a.x, z1: a.z, x2: b.x, z2: b.z, x: (a.x + b.x) / 2, z: (a.z + b.z) / 2, r,
    }, o));
  };
  const addColumn = (s, lat0, lat1, ds) => {
    const o = push(segObs('column', s, lat0, -ds / 2, lat1, ds / 2, 1.0));
    o.len = Math.hypot(lat1 - lat0, ds) + 1.4; o.rot = Math.atan2(-(o.z2 - o.z1), o.x2 - o.x1);
    return o;
  };
  const addWhirl = (s, lat, r = 4.0) => { const w = at(s, lat); decor.hazardS.push(s); return push(base('whirlpool', s, lat, { x: w.x, z: w.z, r, solid: false, hazard: true })); };
  const addSpikes = (s, lat0, lat1) => {
    const o = push(segObs('spikes', s, lat0, 0, lat1, 0, 0.9, { hazard: true }));
    o.len = Math.abs(lat1 - lat0) + 1.2; decor.hazardS.push(s); return o;
  };
  const addFalls = (s0, s1, lat0, lat1) => {
    const rad = (lat1 - lat0) / 2, sm = (s0 + s1) / 2, lc = (lat0 + lat1) / 2, h = (s1 - s0) / 2 - rad;
    const o = push(segObs('waterfall', sm, lc, -h, lc, h, rad, { hazard: true, solid: false }));
    o.lenS = s1 - s0; o.width = lat1 - lat0; decor.hazardS.push(s0); decor.hazardS.push(sm); return o;
  };

  // --- moving obstacles
  const movers = [];
  const mover = (obs, calc) => {
    const mid = (p) => (p.x1 !== undefined ? [(p.x1 + p.x2) / 2, (p.z1 + p.z2) / 2] : [p.x, p.z]);
    const apply = (t) => {
      const P = calc(t), Q = calc(t - 0.05);
      obs.forEach((o, i) => {
        const p = P[i], q = Q[i], m = mid(p), mq = mid(q);
        Object.assign(o, p); o.x = m[0]; o.z = m[1];
        let vx = (m[0] - mq[0]) / 0.05, vz = (m[1] - mq[1]) / 0.05;
        if (Math.hypot(vx, vz) > 40) { vx = 0; vz = 0; }
        o.vx = vx; o.vz = vz;
      });
    };
    apply(0);
    movers.push(apply);
  };
  const TAU = Math.PI * 2;
  const SWING_ROPE = 8.6, SWING_AMP = 0.52, LOG_LEN = 9;
  function addSwing(s, c, kind, T, ph) {
    const f = frameAt(s);
    const o = push(base('swinglog', s, c, { shape: 'segment', moving: true, r: 0.8, kind, ang: 0, rope: SWING_ROPE, logLen: LOG_LEN, x1: 0, z1: 0, x2: 0, z2: 0 }));
    o.env = { s, lat: c, ds: SWING_ROPE * Math.sin(SWING_AMP) + 1, dl: kind === 'A' ? LOG_LEN / 2 + 1 : SWING_ROPE * Math.sin(SWING_AMP) + 1 };
    mover([o], (t) => {
      const a = SWING_AMP * Math.sin(TAU * t / T + ph);
      const off = SWING_ROPE * Math.sin(a);
      const p = kind === 'A'
        ? { a: f.world(c - LOG_LEN / 2, off), b: f.world(c + LOG_LEN / 2, off) }
        : { a: f.world(c + off, -LOG_LEN / 2), b: f.world(c + off, LOG_LEN / 2) };
      return [{ x1: p.a.x, z1: p.a.z, x2: p.b.x, z2: p.b.z, ang: kind === 'A' ? a : a }];
    });
    decor.rigs.push({ s, c, kind, ob: o });
    return o;
  }
  function addCroc(s, c, A, T, ph) {
    const f = frameAt(s);
    const o = push(base('croc', s, c, { moving: true, hazard: true, r: 2.1, snap: 0, yaw: 0 }));
    o.env = { s, lat: c, ds: 2.6, dl: A + 2.6 };
    decor.hazardS.push(s);
    mover([o], (t) => {
      const lat = c + A * Math.sin(TAU * t / T + ph);
      const w = f.world(lat, Math.sin(t * 1.3 + ph) * 0.6);
      const k = (t + ph * 2) % 3.6;
      const snap = k > 2.4 && k < 3.2 ? Math.sin(((k - 2.4) / 0.8) * Math.PI) : 0;
      return [{ x: w.x, z: w.z, snap, lat }];
    });
    return o;
  }
  function addWheel(s, c, R, W) {
    const f = frameAt(s);
    const a1 = push(base('wheel', s, c, { shape: 'segment', moving: true, r: 0.8, ang: 0, R, x1: 0, z1: 0, x2: 0, z2: 0 }));
    const a2 = push(base('wheel', s, c, { shape: 'segment', moving: true, r: 0.8, ang: 0, R, x1: 0, z1: 0, x2: 0, z2: 0, skipMesh: true }));
    a1.env = a2.env = { s, lat: c, ds: R + 1, dl: R + 1 };
    mover([a1, a2], (t) => {
      const a = W * t;
      const seg = (ang) => { const p = f.world(c + R * Math.cos(ang), R * Math.sin(ang)), q = f.world(c - R * Math.cos(ang), -R * Math.sin(ang)); return { x1: p.x, z1: p.z, x2: q.x, z2: q.z }; };
      return [Object.assign(seg(a), { ang: a }), Object.assign(seg(a + Math.PI / 2), { ang: a + Math.PI / 2 })];
    });
    return a1;
  }
  const DOOR_R = 0.9;
  function addLock(s, P, off) {
    const f = frameAt(s), hw = hwAt(s), D = hw + 1.5;
    const eClosed = 0.8, eOpen = -(hw + 1.1);
    const dl = push(base('lockgate', s, 0, { shape: 'segment', moving: true, timed: true, r: DOOR_R, x1: 0, z1: 0, x2: 0, z2: 0, side: -1, D, cl: 0, state: 0 }));
    const dr = push(base('lockgate', s, 0, { shape: 'segment', moving: true, timed: true, r: DOOR_R, x1: 0, z1: 0, x2: 0, z2: 0, side: 1, D, cl: 0, state: 0, skipMesh: true }));
    dl.env = dr.env = { s, lat: 0, ds: 5, dl: hw + 2 };
    const k = P / 9;
    const phase = (t) => {
      const u = (((t + off) % P) + P) % P / k; // normalised to a 9 s cycle
      let open = 1, state = 0;
      if (u < 3.6) { open = 1; state = 0; }
      else if (u < 4.6) { open = 1; state = 1; }
      else if (u < 5.6) { open = 1 - smooth(4.6, 5.6, u); state = 1; }
      else if (u < 7.6) { open = 0; state = 2; }
      else { open = smooth(7.6, 8.6, u); state = 2; }
      return { open, state };
    };
    mover([dl, dr], (t) => {
      const { open, state } = phase(t);
      const eL = lerp(eClosed, eOpen, open), eR = -eL;
      const a = f.world(eL - D, 0), b = f.world(eL, 0), c2 = f.world(eR, 0), d2 = f.world(eR + D, 0);
      return [
        { x1: a.x, z1: a.z, x2: b.x, z2: b.z, cl: eL - D / 2, state, open },
        { x1: c2.x, z1: c2.z, x2: d2.x, z2: d2.z, cl: eR + D / 2, state, open },
      ];
    });
    decor.locks.push({ s, hw, dl, dr });
    return dl;
  }
  const BARREL_R = 0.95;
  function addBarrelLane(s0, span, speed, lats, amp) {
    lats.forEach((lat0, k) => {
      const off = (span / lats.length) * k;
      const ph = k * 1.7;
      const o = push(base('barrel', s0, lat0, { moving: true, r: BARREL_R, scale: 1, k: 1, spin: 0 }));
      o.env = { s: s0 + span / 2, lat: lat0, ds: span / 2, dl: amp + 1 };
      mover([o], (t) => {
        const u = (((t * speed + off) % span) + span) % span;
        const w = at(s0 + u, lat0 + amp * Math.sin(0.8 * t + ph));
        const kk = Math.min(1, u / 7, (span - u) / 7);
        return [{ x: w.x, z: w.z, s: s0 + u, k: kk, r: BARREL_R * Math.max(0.01, kk), solid: kk > 0.45, spin: t * 0.9 + ph }];
      });
    });
  }

  // ===== Jungle Gate (calm intro)
  addRock(150, -14, 1.8); addRock(205, 13, 2.0);
  // ===== Vine Bends: swinging logs on ropes
  addSwing(360, -8, 'A', 4.4, 0);
  addSwing(405, 5, 'B', 4.0, 1.3);
  addSwing(445, 8, 'A', 4.6, 2.5);
  addRock(520, -6, 2.2); addRock(545, 7, 2.0);
  // ===== Ruined Causeway
  addStatue(606, 7); addStatue(630, -8);
  addColumn(655, -16, -6, 4); addColumn(692, 4, 15, 3);
  { // stone arch bridge, two pillars in the water
    const f = frameAt(740);
    const piers = [-7, 7];
    piers.forEach((lat) => { const o = push(base('pier', 740, lat, { x: f.world(lat, 0).x, z: f.world(lat, 0).z, r: 1.9 })); void o; });
    decor.bridges.push({ kind: 'stone', s: 740, piers });
  }
  addPillar(782, -3, 7, false); addPillar(802, 8, 7, true); addPillar(818, -9, 7, false);
  addRock(843, 0, 2.2);
  // ===== Croc Marsh
  addCroc(930, -4, 4.5, 5.2, 0);
  addCroc(975, 4, 4.5, 4.6, 2);
  addBarrelLane(895, 150, 5.0, [-9, -3, 3, 9, -6, 6], 2.2);
  addCroc(1010, -3, 4, 4.2, 1);
  addSpikes(1050, -13, -2);
  // ===== Temple Rapids
  addWhirl(1160, 3.5);
  addRock(1195, -5, 1.8);
  addWheel(1235, -3, 4.2, 0.9);
  addWhirl(1295, -3.5);
  addPillar(1335, 3, 6, true);
  addSpikes(1366, 2, 10.6);
  // ===== Hall of Gates
  addLock(1480, 9, 0);
  { // low wooden bridge
    const f = frameAt(1540);
    [-5, 5].forEach((lat) => push(base('pile', 1540, lat, { x: f.world(lat, 0).x, z: f.world(lat, 0).z, r: 1.3 })));
    decor.bridges.push({ kind: 'wood', s: 1540, piles: [-5, 5] });
  }
  addLock(1630, 8, 2.5);
  // ===== Waterfall Gorge
  addWhirl(1770, -3.5);
  addSwing(1805, -3, 'B', 3.8, 0.7);
  addWheel(1850, 3.5, 4.0, -1.0);
  addFalls(1895, 1940, 3.5, 10.9);
  addRock(1965, -6, 2.0);
  addSpikes(2000, -10.9, -1);
  addCroc(2025, -4, 2.5, 4.0, 0.5);
  // ===== Golden Run
  addBarrelLane(2092, 160, 5.5, [-10, -4, 2, 8, 13, -13], 2.4);
  addSwing(2140, 6, 'A', 4.4, 0.4);
  addSwing(2175, -5, 'B', 4.0, 2.0);
  addSwing(2210, -7, 'A', 4.8, 1.0);
  addCroc(2250, 0, 4, 4.8, 0);
  addCroc(2300, 5, 4, 4.0, 2);
  [[2352, -9, 2.1], [2372, 8, 2.3], [2405, -8, 2.0], [2430, 7, 2.2], [2455, -3, 2.0]].forEach(([s, l, z]) => addRock(s, l, z));
  // bridges (rope) + archways (scenery only)
  decor.bridges.push({ kind: 'rope', s: 480 }, { kind: 'rope', s: 2272, deckY: 7.0 });
  [620, 1120, 1425, 1585, 1745, 2085, 2395, 2432].forEach((s) => decor.arches.push({ s }));
  obstacles.sort((a, b) => a.s - b.s);
  track.obstacles = obstacles;

  track.update = function (t) { for (const m of movers) m(t); };
  track.update(0);

  // ---------------------------------------------------------------- coins along the safe racing line
  const coins = [];
  const segDist = (px, pz, o) => {
    const ex = o.x2 - o.x1, ez = o.z2 - o.z1, l2 = ex * ex + ez * ez || 1;
    const t = clamp(((px - o.x1) * ex + (pz - o.z1) * ez) / l2, 0, 1);
    return Math.hypot(px - (o.x1 + ex * t), pz - (o.z1 + ez * t));
  };
  const addCoin = (s, lat) => {
    if (s < 40 || s > length - 36) return;
    if (Math.abs(lat) > hwAt(s) - 2.4) return;
    const w = at(s, lat);
    for (const o of obstacles) {
      if (o.env) { if (Math.abs(s - o.env.s) < o.env.ds + 1.5 && Math.abs(lat - o.env.lat) < o.env.dl + 1.6) return; }
      else if (o.shape === 'segment') { if (segDist(w.x, w.z, o) < o.r + 1.4) return; }
      else if (Math.hypot(o.x - w.x, o.z - w.z) < o.r + 1.4) return;
    }
    for (const g of GATE_S) if (Math.abs(g - s) < 3) return;
    coins.push({ type: 'coin', x: w.x, z: w.z, y: 0.9, s });
  };
  const lineLat = (s) => keyInterp(LINE, s);
  for (let s = 64, k = 0; s < length - 50; s += 9.5, k++) addCoin(s, lineLat(s) + 1.3 * Math.sin(k * 0.9));
  // extra arcs: through the stone bridge openings and the finish row
  for (let i = 0; i < 7; i++) { const l = (i - 3) * 1.8; addCoin(748 - 3 * (1 - (l / 5.4) ** 2), l); }
  for (const lat of [-14, 14]) for (let i = 0; i < 5; i++) addCoin(735 + i * 5, lat);
  for (let i = 0; i < 8; i++) addCoin(2440 + 0.2 * i, (i - 3.5) * 2.2);
  for (let i = 0; i < 7; i++) addCoin(2480, (i - 3) * 2.6);
  for (let s = 1480 - 30; s < 1480 - 10; s += 5) addCoin(s, 0);
  for (let s = 1630 - 30; s < 1630 - 10; s += 5) addCoin(s, 0);
  coins.sort((a, b) => a.s - b.s);
  track.pickups = coins;

  track._internal = { at, headingAt, hwAt, KAP, frameAt, decor, GATE_COLORS, START_ARCH_S };
  return track;
}

// ================================================================= buildScenery
const COL = (hex) => new THREE.Color(hex);
const C_FLOOR = COL('#2f9a3a'), C_FLOOR2 = COL('#1f7a34'), C_MUD = COL('#b58e58'), C_WET = COL('#6e5a3a'), C_FAR = COL('#2a8a3a');
const C_ROCK1 = COL('#8a8f7a'), C_ROCK2 = COL('#aaa285'), C_STRATA = COL('#7a6a4a'), C_CAP = COL('#2f8a3a'), C_MOSS = COL('#4a9a38');

export function buildScenery(scene, track, models, water) {
  const rng = mulberry32(912001);
  const rr = (a, b) => lerp(a, b, rng());
  const L = track.length;
  const { KAP, frameAt, decor, GATE_COLORS: GC, at, headingAt, hwAt } = track._internal;
  const canyons = track.zones.filter((z) => z.rapids);
  const canyonW = (s) => { let m = 0; for (const c of canyons) m = Math.max(m, smooth(c.s0 - 30, c.s0 + 12, s) * (1 - smooth(c.s1 - 12, c.s1 + 30, s))); return m; };

  function centre(s) {
    if (s < 0) { const p = track.sample(0); return { x: p.x + p.tx * s, z: p.z + p.tz * s, tx: p.tx, tz: p.tz, hw: p.halfWidth }; }
    if (s > L) { const p = track.sample(L); return { x: p.x + p.tx * (s - L), z: p.z + p.tz * (s - L), tx: p.tx, tz: p.tz, hw: p.halfWidth }; }
    const p = track.sample(s); return { x: p.x, z: p.z, tx: p.tx, tz: p.tz, hw: p.halfWidth };
  }
  const GP = [[0, -1.2], [1.4, 0.3], [4, 1.5], [10, 1.9], [25, 2.4], [45, 3.0], [72, -0.2]];
  const CF = [[1.2, 0.5], [3, 0.8], [6, 0.97], [11, 1], [20, 0.9], [34, 0.72], [52, 0.42], [72, -0.03]];
  function heightAt(wx, wz, d, c) {
    const amp = smooth(6, 22, d) * (1 - smooth(48, 72, d)) * 2.2;
    let g = lerpTable(GP, d) + (vnoise(wx * 0.035, wz * 0.035, 3) - 0.5) * 2 * amp +
      (vnoise(wx * 0.3, wz * 0.3, 5) - 0.5) * 0.5 * smooth(3, 12, d) * (1 - smooth(48, 72, d));
    if (c <= 0.001) return g;
    const H = 8 + 12 * smooth(0.15, 0.85, vnoise(wx * 0.022, wz * 0.022, 7));
    let cy;
    if (d < 1.2) cy = lerp(-1.2, 0.5 * H, d / 1.2); else cy = lerpTable(CF, d) * H;
    cy += (vnoise(wx * 0.25, wz * 0.25, 9) - 0.5) * 3.2 * smooth(0.5, 4, d) * (1 - smooth(30, 60, d));
    return g + (cy - g) * c;
  }
  const DMAX = 72, D_COLS = [0, 1.2, 3, 6, 11, 20, 34, 52, 72];
  function ground(s, side, d) {
    const c0 = centre(s);
    const dh = KAP[clamp(Math.round(s), 0, L)];
    let f = 1;
    if (side === (dh > 0 ? -1 : 1)) { const k = Math.abs(dh); if (k > 1e-5) f = clamp((Math.max(6, 0.8 / k - c0.hw)) / DMAX, 0.3, 1); }
    const off = c0.hw + d * f;
    const x = c0.x + -c0.tz * side * off, z = c0.z + c0.tx * side * off;
    const c = canyonW(s);
    return { x, z, y: heightAt(x, z, d, c), c };
  }
  const _rk = new THREE.Color();
  function groundColor(out, d, y, c, wx, wz) {
    const n = vnoise(wx * 0.08, wz * 0.08, 11);
    const mudT = 1 - smooth(1.2, 5.5, d);
    out.copy(C_FLOOR).lerp(C_FLOOR2, n * 0.9 + (y > 2 ? 0.15 : 0));
    out.lerp(C_FAR, smooth(40, 72, d));
    if (y < 0) out.copy(C_WET); else out.lerp(C_MUD, mudT * (0.8 + 0.2 * n));
    if (c > 0.001) {
      _rk.copy(C_ROCK1).lerp(C_ROCK2, vnoise(wx * 0.15, wz * 0.15, 13));
      const band = 0.5 + 0.5 * Math.sin(y * 1.3 + n * 4);
      _rk.lerp(C_STRATA, band * 0.55 * smooth(0, 3, d));
      _rk.lerp(C_MOSS, smooth(1, 6, d) * 0.5 * n + smooth(0, 3, y) * 0.2);
      _rk.lerp(C_CAP, smooth(24, 60, d) * 0.6);
      if (y < 0) _rk.copy(C_WET).multiplyScalar(0.8);
      out.lerp(_rk, c);
    }
  }

  // ---- terrain strips
  const terrainGroup = new THREE.Group(); scene.add(terrainGroup);
  const terrainMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  {
    const ROW = 3, S0 = -60, S1 = L + 80, CHUNK_ROWS = 80;
    const rows = []; for (let s = S0; s <= S1 + 1e-6; s += ROW) rows.push(s);
    const col = new THREE.Color();
    for (let r0 = 0; r0 < rows.length - 1; r0 += CHUNK_ROWS) {
      const r1 = Math.min(rows.length - 1, r0 + CHUNK_ROWS);
      const pos = [], cols = [];
      for (const side of [-1, 1]) {
        const grid = [];
        for (let r = r0; r <= r1; r++) {
          const line = [];
          for (const d of D_COLS) { const g = ground(rows[r], side, d); groundColor(col, d, g.y, g.c, g.x, g.z); line.push({ g, c: col.clone() }); }
          grid.push(line);
        }
        const tri = (a, b, c) => {
          const ny = (b.g.z - a.g.z) * (c.g.x - a.g.x) - (b.g.x - a.g.x) * (c.g.z - a.g.z);
          const [p, q, w] = ny >= 0 ? [a, b, c] : [a, c, b];
          const fc = new THREE.Color((p.c.r + q.c.r + w.c.r) / 3, (p.c.g + q.c.g + w.c.g) / 3, (p.c.b + q.c.b + w.c.b) / 3);
          for (const v of [p, q, w]) { pos.push(v.g.x, v.g.y, v.g.z); cols.push(fc.r, fc.g, fc.b); }
        };
        for (let r = 0; r < grid.length - 1; r++) for (let k = 0; k < D_COLS.length - 1; k++) {
          const a = grid[r][k], b = grid[r][k + 1], c = grid[r + 1][k], e = grid[r + 1][k + 1];
          tri(a, b, c); tri(b, e, c);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
      geo.computeVertexNormals(); geo.computeBoundingSphere();
      terrainGroup.add(new THREE.Mesh(geo, terrainMat));
    }
  }
  {
    let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
    for (let s = 0; s <= L; s += 20) { const p = track.sample(s); minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); }
    const geo = new THREE.PlaneGeometry(4000, 4000); geo.rotateX(-Math.PI / 2);
    const far = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: C_FAR }));
    far.position.set((minX + maxX) / 2, -0.3, (minZ + maxZ) / 2); scene.add(far);
    const wm = new THREE.MeshBasicMaterial({ color: 0x2aa6a0 });
    for (const [sA, sB] of [[-60, 0], [L, L + 80]]) {
      const a = centre(sA), b = centre(sB);
      const hw = centre(sA < 0 ? 0 : L).hw + 3;
      const len = Math.hypot(b.x - a.x, b.z - a.z);
      const g = new THREE.PlaneGeometry(hw * 2, len); g.rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(g, wm);
      m.position.set((a.x + b.x) / 2, -0.04, (a.z + b.z) / 2); m.rotation.y = Math.atan2(-a.tx, -a.tz);
      scene.add(m);
    }
  }
  if (water && water.mesh) scene.add(water.mesh);

  // ---- scatter via chunked InstancedMeshes
  const CH = 200;
  const scatterMeshes = [];
  const protoCache = new Map();
  function protoParts(key, make) {
    if (protoCache.has(key)) return protoCache.get(key);
    let parts = [];
    try {
      const obj = make(); obj.updateMatrixWorld(true);
      obj.traverse((m) => { if (m.isMesh) parts.push({ geo: m.geometry, mat: m.material, mtx: m.matrixWorld.clone() }); });
    } catch (e) { console.warn('[track2] prototype failed', key, e); parts = []; }
    protoCache.set(key, parts);
    return parts;
  }
  const placements = new Map();
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _e = new THREE.Euler();
  function place(key, make, s, g, scale, rotY) {
    const ch = Math.floor((s + 100) / CH), k = key + '|' + ch;
    let e = placements.get(k);
    if (!e) { e = { key, make, chunk: ch, mats: [] }; placements.set(k, e); }
    _q.setFromEuler(_e.set(0, rotY, 0)); _p.set(g.x, g.y - 0.05, g.z); _s.set(scale, scale, scale);
    e.mats.push(new THREE.Matrix4().compose(_p, _q, _s));
  }
  // jungle: palms hug the water, big leafy trees behind, ferns everywhere
  for (let a = 0; a < 1000; a++) {
    const s = rr(-30, L + 50), side = rng() < 0.5 ? -1 : 1, d = rr(2.5, 40);
    if (canyonW(s) > 0.2) continue;
    place('palm' + (a % 3), () => M2.makePalm(a % 3), s, ground(s, side, d), rr(0.85, 1.35), rng() * 6.28);
  }
  for (let a = 0; a < 1300; a++) {
    const s = rr(-30, L + 50), side = rng() < 0.5 ? -1 : 1, d = rr(6, 68);
    if (canyonW(s) > 0.2) continue;
    place('jtree' + (a % 3), () => M2.makeJungleTree(a % 3), s, ground(s, side, d), rr(0.9, 1.6), rng() * 6.28);
  }
  for (let a = 0; a < 140; a++) { // cliff tops
    const c = canyons[a % canyons.length];
    const s = rr(c.s0 - 20, c.s1 + 20), side = rng() < 0.5 ? -1 : 1, d = rr(14, 44);
    if (canyonW(s) < 0.8) continue;
    place('jtree' + (a % 3), () => M2.makeJungleTree(a % 3), s, ground(s, side, d), rr(1.0, 1.7), rng() * 6.28);
  }
  for (let a = 0; a < 1000; a++) {
    const s = rr(-30, L + 50), side = rng() < 0.5 ? -1 : 1, d = rr(1.5, 40);
    if (canyonW(s) > 0.3 && d < 3) continue;
    place('fern' + (a % 3), () => M2.makeFern(a % 3), s, ground(s, side, d), rr(0.9, 1.8), rng() * 6.28);
  }
  for (let a = 0; a < 380; a++) {
    const s = rr(-20, L + 30), side = rng() < 0.5 ? -1 : 1, d = rr(0, 1.2);
    if (canyonW(s) > 0.4) continue;
    place('reeds' + (a % 2), () => models.makeReeds(a % 2 + 1), s, ground(s, side, d), rr(0.9, 1.5), rng() * 6.28);
  }
  for (const e of placements.values()) {
    for (const part of protoParts(e.key, e.make)) {
      const im = new THREE.InstancedMesh(part.geo, part.mat, e.mats.length);
      for (let i = 0; i < e.mats.length; i++) im.setMatrixAt(i, _m.copy(e.mats[i]).multiply(part.mtx));
      im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere();
      scene.add(im); scatterMeshes.push({ mesh: im, chunk: e.chunk });
    }
  }

  // ---- dynamic things (culled by s window)
  const dyn = [];
  const addDyn = (obj, s) => { scene.add(obj); dyn.push({ obj, s }); return obj; };
  const syncs = [];       // per-frame updaters for visible dynamic items
  const bobbers = [];
  const centreOf = (s) => centre(s);
  const placeAcross = (obj, s, lat = 0) => { const f = frameAt(s); const w = f.world(lat, 0); obj.position.set(w.x, 0, w.z); obj.rotation.y = f.heading; return obj; };
  const faceRiver = (obj, g, s) => { const c0 = centre(s); obj.rotation.y = Math.atan2(-(c0.x - g.x), -(c0.z - g.z)); };

  // start / finish / checkpoints
  const archW = (s) => 2 * (centre(s).hw + 2.2);
  addDyn(placeAcross(M2.makeTempleArch('START', archW(24)), 24), 24);
  addDyn(placeAcross(M2.makeTempleArch('FINISH', archW(track.finishS)), track.finishS), track.finishS);
  track.gates.forEach((g, i) => {
    const o = models.makeGateFlags(g.halfWidth, g.label, GC[i % GC.length]);
    o.position.set(g.x, 0, g.z); o.rotation.y = g.heading;
    addDyn(o, g.s);
  });
  decor.arches.forEach((a) => addDyn(placeAcross(M2.makeTempleArchway(archW(a.s)), a.s), a.s));

  // bridges
  decor.bridges.forEach((br) => {
    const hw = hwAt(br.s);
    let o;
    if (br.kind === 'rope') o = M2.makeRopeBridge(2 * (hw + 3.2), br.deckY || 6.6);
    else if (br.kind === 'stone') o = M2.makeStoneBridge(2 * (hw + 4), br.piers, 8.6);
    else o = M2.makeWoodBridge(2 * (hw + 3.5), 4.9, br.piles);
    addDyn(placeAcross(o, br.s), br.s);
  });

  // obstacles
  const tmpMesh = [];
  track.obstacles.forEach((ob, i) => {
    let o = null;
    switch (ob.type) {
      case 'rock': o = models.makeRock(ob.seed, ob.scale); o.position.set(ob.x, -0.15, ob.z); o.rotation.y = ob.rot; break;
      case 'pillar': o = M2.makeTemplePillar(ob.scale, ob.seed, ob.broken); o.position.set(ob.x, -0.3, ob.z); o.rotation.y = ob.seed % 6; break;
      case 'statue': o = M2.makeStatueHead(ob.seed); o.position.set(ob.x, -0.4, ob.z); o.rotation.y = headingAt(ob.s); break;
      case 'column': o = M2.makeFallenColumn(ob.len, i); o.position.set(ob.x, -0.2, ob.z); o.rotation.y = ob.rot; bobbers.push({ o, base: -0.2, ph: i, a: 0.02 }); break;
      case 'whirlpool': { o = M2.makeWhirlpool(ob.r); o.position.set(ob.x, 0, ob.z); syncs.push({ ob, obj: o, f: (t) => o.userData.spin(t) }); break; }
      case 'spikes': { o = M2.makeSpikes(ob.len); const f = frameAt(ob.s); o.position.set(ob.x, -0.15, ob.z); o.rotation.y = f.heading; bobbers.push({ o, base: -0.15, ph: i, a: 0.03 }); break; }
      case 'waterfall': { o = M2.makeWaterfallEdge(ob.lenS, ob.width); const f = frameAt(ob.s); o.position.set(ob.x, 0, ob.z); o.rotation.y = f.heading; syncs.push({ ob, obj: o, f: (t) => o.userData.update(t) }); break; }
      case 'swinglog': {
        const f = frameAt(ob.s), hw = f.p.halfWidth;
        o = M2.makeSwingRig({ width: 2 * (hw + 2.4), kind: ob.kind, logLen: ob.logLen, rope: ob.rope, px: ob.lat });
        placeAcross(o, ob.s); o.userData.setAngle(0);
        syncs.push({ ob, obj: o, f: () => o.userData.setAngle(ob.ang) });
        break;
      }
      case 'wheel': if (!ob.skipMesh) {
        o = M2.makeStoneWheel(ob.R); placeAcross(o, ob.s, ob.lat);
        syncs.push({ ob, obj: o, f: () => o.userData.setAngle(ob.ang) });
      } break;
      case 'croc': {
        o = M2.makeCroc(); o.position.set(ob.x, 0, ob.z);
        let yaw = headingAt(ob.s);
        syncs.push({ ob, obj: o, f: (t) => {
          o.position.set(ob.x, -0.05 + Math.sin(t * 2 + i) * 0.04, ob.z);
          if (Math.hypot(ob.vx, ob.vz) > 0.3) yaw = Math.atan2(-ob.vx, -ob.vz);
          o.rotation.y = yaw; o.userData.setSnap(ob.snap);
        } });
        break;
      }
      case 'barrel': {
        o = M2.makeBarrel();
        syncs.push({ ob, obj: o, f: (t) => {
          o.position.set(ob.x, -0.28 + Math.sin(t * 2.2 + i) * 0.07, ob.z);
          o.rotation.set(Math.sin(t * 1.3 + i) * 0.12, ob.spin, Math.cos(t * 1.1 + i) * 0.1);
          o.scale.setScalar(Math.max(0.01, ob.k));
        } });
        break;
      }
      case 'lockgate': if (!ob.skipMesh) {
        const hw = hwAt(ob.s);
        o = M2.makeLockGate(hw); placeAcross(o, ob.s);
        const partner = track.obstacles.find((q) => q.type === 'lockgate' && q.s === ob.s && q.skipMesh);
        syncs.push({ ob, obj: o, f: () => o.userData.setDoors(ob.cl, partner.cl, ob.state) });
      } break;
      default: break; // piers / piles are part of their bridge models
    }
    if (o) { if (ob.type === 'barrel') scene.add(o); else addDyn(o, ob.s); }
  });
  void tmpMesh;

  // hazard telegraphing: skull totems on both banks before each hazard cluster
  {
    const ss = [...decor.hazardS].sort((a, b) => a - b);
    const clusters = [];
    for (const s of ss) { const c = clusters[clusters.length - 1]; if (c && s - c.e < 50) c.e = s; else clusters.push({ b: s, e: s }); }
    const totem = (s, side, d) => {
      const g0 = ground(s, side, d);
      const o = M2.makeSkullTotem(); o.position.set(g0.x, g0.y - 0.2, g0.z);
      faceRiver(o, g0, s); o.rotation.y += Math.PI; // skull faces the oncoming boat's view of the bank side
      o.rotation.y = headingAt(s) + Math.PI;
      o.scale.setScalar(1.25);
      addDyn(o, s);
    };
    for (const c of clusters) {
      for (const back of [28, 62]) for (const side of [-1, 1]) totem(Math.max(30, c.b - back), side, 1.6);
      totem((c.b + c.e) / 2, -1, 1.5); totem((c.b + c.e) / 2, 1, 1.5);
    }
  }

  // torches, stairs, ruins, monkeys
  const torches = [];
  function addTorch(s, side, d) {
    const g0 = ground(s, side, d);
    const o = M2.makeTorch(); o.position.set(g0.x, g0.y, g0.z); o.rotation.y = rng() * 6;
    addDyn(o, s); torches.push(o);
  }
  for (let s = 100; s < L - 40; s += 46) { if (canyonW(s) > 0.3) continue; addTorch(s, rng() < 0.5 ? -1 : 1, rr(1.4, 2.4)); }
  track.gates.forEach((g) => { addTorch(g.s + 3, -1, 1.6); addTorch(g.s + 3, 1, 1.6); });
  for (let s = 140, k = 0; s < L - 100; s += rr(95, 140), k++) { // stairs down to the water
    if (canyonW(s) > 0.2) continue;
    const side = k % 2 ? -1 : 1, g0 = ground(s, side, 3.4);
    const st = M2.makeStairs(4, 4.6); st.position.set(g0.x, g0.y + 0.25, g0.z); faceRiver(st, g0, s);
    addDyn(st, s);
    addTorch(s + 2.4, side, 3.0); addTorch(s - 2.4, side, 3.0);
  }
  for (let s = 90, k = 0; s < L - 120; s += rr(55, 85), k++) { // ruins
    if (canyonW(s) > 0.3) continue;
    const side = rng() < 0.5 ? -1 : 1, d = rr(11, 24), kind = k % 3;
    const g0 = ground(s, side, d);
    const o = M2.makeTempleRuin(k, kind);
    o.position.set(g0.x, g0.y - (kind === 0 ? 0.5 : 0.3), g0.z); faceRiver(o, g0, s);
    addDyn(o, s);
  }
  const monkeys = [];
  for (let s = 120, k = 0; s < L - 100; s += rr(95, 150), k++) {
    if (canyonW(s) > 0.2) continue;
    const side = k % 2 ? -1 : 1, g0 = ground(s, side, rr(2.5, 6));
    const m = M2.makeMonkey(k); m.position.set(g0.x, g0.y, g0.z); faceRiver(m, g0, s);
    addDyn(m, s); monkeys.push({ obj: m, near: false });
  }

  // coins
  const pickupMeshes = [];
  const coinProto = models.makeCoin();
  const coinItems = track.pickups.map((pk, i) => {
    const o = i === 0 ? coinProto : coinProto.clone(true);
    o.position.set(pk.x, pk.y, pk.z); scene.add(o); pickupMeshes.push(o);
    return { obj: o, s: pk.s, y: pk.y, collected: false, ph: i * 0.7 };
  });
  const pops = [];

  // ---- update
  let lastS = 0;
  const _v = new THREE.Vector3();
  function update(dt, t, camera) {
    if (water && water.update) water.update(t, camera);
    camera.getWorldPosition(_v);
    const loc = track.locate(_v.x, _v.z, lastS);
    lastS = loc.s;
    const lo = lastS - 90, hi = lastS + 340;
    for (const it of dyn) { const v = it.s >= lo && it.s <= hi; if (it.obj.visible !== v) it.obj.visible = v; }
    for (const sy of syncs) {
      if (sy.ob.type === 'barrel') { const v = sy.ob.s >= lo && sy.ob.s <= hi; if (sy.obj.visible !== v) sy.obj.visible = v; }
      if (sy.obj.visible) sy.f(t);
    }
    for (const b of bobbers) if (b.o.visible) b.o.position.y = b.base + Math.sin(t * 1.8 + b.ph) * b.a;
    for (const tc of torches) if (tc.visible && tc.children[1]) { const f = tc.children[1]; f.scale.y = 1 + Math.sin(t * 13 + tc.position.x) * 0.14; f.scale.x = f.scale.z = 1 + Math.sin(t * 17 + tc.position.z) * 0.07; }
    for (const m of scatterMeshes) {
      const c0 = m.chunk * CH - 100, c1 = c0 + CH;
      const v = c1 >= lo - 20 && c0 <= hi + 20;
      if (m.mesh.visible !== v) m.mesh.visible = v;
    }
    for (let i = 0; i < coinItems.length; i++) {
      const c = coinItems[i];
      if (c.collected) continue;
      const v = c.s >= lo && c.s <= hi;
      if (c.obj.visible !== v) c.obj.visible = v;
      if (v) { c.obj.rotation.y = t * 3 + c.ph; c.obj.position.y = c.y + Math.sin(t * 3 + c.ph) * 0.14; }
    }
    for (let i = pops.length - 1; i >= 0; i--) {
      const p = pops[i]; p.t += dt;
      const k = p.t / 0.28;
      if (k >= 1) { p.obj.visible = false; p.obj.scale.setScalar(1); pops.splice(i, 1); continue; }
      p.obj.scale.setScalar(k < 0.4 ? 1 + k * 1.5 : 1.6 * (1 - (k - 0.4) / 0.6));
      p.obj.position.y += dt * 3; p.obj.rotation.y += dt * 14;
    }
    for (const c of monkeys) {
      if (!c.obj.visible) continue;
      const dd = Math.hypot(c.obj.position.x - _v.x, c.obj.position.z - _v.z);
      const near = dd < 55;
      if (near) c.obj.userData.cheer(t); else if (c.near) c.obj.userData.cheer(0);
      c.near = near;
    }
  }
  function collectPickup(i) {
    const c = coinItems[i];
    if (!c || c.collected) return;
    c.collected = true; c.obj.visible = true; pops.push({ obj: c.obj, t: 0 });
  }
  void centreOf; void at;
  return { update, collectPickup, pickupMeshes };
}
