// Rapids Row - track.js
// Deterministic river: authored heading/width/current keyframes -> control points -> centripetal Catmull-Rom
// -> 1 m arc-length table. Also builds all scenery (terrain, cliffs, scatter, cows, obstacles, coins, gates).
import * as THREE from 'three';

// ---------------------------------------------------------------- utils
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
function vnoise(x, z, seed = 0) { // 0..1 smooth value noise
  const ix = Math.floor(x), iz = Math.floor(z);
  let fx = x - ix, fz = z - iz;
  fx = fx * fx * (3 - 2 * fx); fz = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz, seed), b = hash2(ix + 1, iz, seed), c = hash2(ix, iz + 1, seed), d = hash2(ix + 1, iz + 1, seed);
  return (a + (b - a) * fx) + ((c + (d - c) * fx) - (a + (b - a) * fx)) * fz;
}
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function keyInterp(keys, s) { // smoothstep between keyframes [[s,v],...]
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
function lerpTable(tab, x) { // piecewise linear
  if (x <= tab[0][0]) return tab[0][1];
  for (let i = 1; i < tab.length; i++) {
    if (x <= tab[i][0]) { const a = tab[i - 1], b = tab[i]; return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); }
  }
  return tab[tab.length - 1][1];
}

function lerpCR(tab, x) { // smooth (cubic Hermite, Catmull-Rom tangents) table interpolation
  const n = tab.length;
  if (x <= tab[0][0]) return tab[0][1];
  if (x >= tab[n - 1][0]) return tab[n - 1][1];
  let i = 1; while (x > tab[i][0]) i++;
  const a = tab[i - 1], b = tab[i], h = b[0] - a[0], t = (x - a[0]) / h;
  const p0 = tab[Math.max(0, i - 2)], p3 = tab[Math.min(n - 1, i + 1)];
  const m0 = (b[1] - p0[1]) / (b[0] - p0[0]) * h, m1 = (p3[1] - a[1]) / (p3[0] - a[0]) * h;
  const t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * a[1] + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * b[1] + (t3 - t2) * m1;
}

// ---------------------------------------------------------------- authored river
const TARGET_LEN = 2260;
const HEAD_KEYS = [ // [s, heading degrees] (positive = turning left); smoothstep => gentle curvature
  [0, 0], [210, 0], [290, 24], [370, -20], [450, 20], [530, -4], [610, -4], [700, 10], [800, 0],
  [900, -14], [1000, 10], [1060, 0],
  [1135, -36], [1215, 34], [1290, -32], [1360, 0],
  [1450, 14], [1560, 0], [1650, -24], [1750, 10], [1860, 0],
  [1950, 20], [2050, -20], [2150, 6], [2260, 0],
];
const HW_KEYS = [
  [0, 20], [200, 20], [260, 17], [400, 15], [540, 19], [620, 22], [780, 21], [830, 17], [1000, 15],
  [1050, 12], [1090, 10.5], [1160, 9.5], [1230, 10.5], [1270, 9.5], [1320, 10.5], [1360, 13],
  [1450, 14], [1560, 17], [1625, 22], [1820, 22], [1880, 15], [2100, 13], [2200, 16], [2260, 18],
];
const CUR_KEYS = [
  [0, 1.6], [230, 1.6], [300, 2.0], [540, 2.0], [600, 1.5], [800, 1.8], [1000, 2.4], [1040, 3.0],
  [1080, 4.5], [1200, 5.0], [1330, 4.5], [1375, 2.6], [1560, 2.2], [1620, 1.5], [1860, 1.6],
  [1900, 3.0], [2000, 3.5], [2260, 3.0],
];
const ZONE_DEFS = [
  [0, 230, 'Sunny Start', false],
  [230, 540, 'Lazy Bends', false],
  [540, 800, 'Cow Meadow', false],
  [800, 1050, 'Rock Slalom', false],
  [1050, 1360, 'Whitewater Canyon', true],
  [1360, 1560, 'Log Jam', false],
  [1560, 1860, 'Crystal Lake', false],
  [1860, 1e9, 'Final Sprint', false],
];
const GATE_S = [340, 640, 815, 1100, 1345, 1700, 2000];
const GATE_COLORS = ['#ffd21f', '#2f7cff', '#2fc65a', '#ff3b30', '#ffd21f', '#2f7cff', '#2fc65a'];
const START_ARCH_S = 24;
const GAP_MIN = 7.4;      // required free gap between collision circles / banks (m)
const BANK_MARGIN = 1.4;  // physics keeps boat within halfWidth - 1.4

// ---------------------------------------------------------------- Catmull-Rom (centripetal)
function crSegment(P0, P1, P2, P3, t, out) {
  const d = (a, b) => Math.pow(Math.hypot(b[0] - a[0], b[1] - a[1]) + 1e-6, 0.5);
  const t0 = 0, t1 = t0 + d(P0, P1), t2 = t1 + d(P1, P2), t3 = t2 + d(P2, P3);
  const tt = lerp(t1, t2, t);
  const mix = (A, B, ta, tb) => [
    ((tb - tt) * A[0] + (tt - ta) * B[0]) / (tb - ta),
    ((tb - tt) * A[1] + (tt - ta) * B[1]) / (tb - ta),
  ];
  const A1 = mix(P0, P1, t0, t1), A2 = mix(P1, P2, t1, t2), A3 = mix(P2, P3, t2, t3);
  const B1 = mix(A1, A2, t0, t2), B2 = mix(A2, A3, t1, t3);
  const C = mix(B1, B2, t1, t2);
  out[0] = C[0]; out[1] = C[1];
}

// ================================================================= createTrack
export function createTrack() {
  // --- control points (every 20 m) by integrating authored heading
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
  // phantom ends (reflect)
  const n = ctrl.length;
  const ext = [[2 * ctrl[0][0] - ctrl[1][0], 2 * ctrl[0][1] - ctrl[1][1]], ...ctrl,
    [2 * ctrl[n - 1][0] - ctrl[n - 2][0], 2 * ctrl[n - 1][1] - ctrl[n - 2][1]]];
  // --- dense spline polyline
  const SUB = 16;
  const dense = [];
  const tmp = [0, 0];
  for (let i = 1; i < ext.length - 2; i++) {
    for (let k = 0; k < SUB; k++) {
      crSegment(ext[i - 1], ext[i], ext[i + 1], ext[i + 2], k / SUB, tmp);
      dense.push([tmp[0], tmp[1]]);
    }
  }
  dense.push(ctrl[n - 1].slice());
  // --- arc-length resample at 1 m
  const cum = [0];
  for (let i = 1; i < dense.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  }
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
  const TX = new Float64Array(N), TZ = new Float64Array(N), HWt = new Float64Array(N), CURt = new Float64Array(N);
  const HD = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const a = Math.max(0, i - 1), b = Math.min(N - 1, i + 1);
    let dx = PX[b] - PX[a], dz = PZ[b] - PZ[a];
    const l = Math.hypot(dx, dz) || 1;
    TX[i] = dx / l; TZ[i] = dz / l;
    HD[i] = Math.atan2(-TX[i], -TZ[i]);
    HWt[i] = keyInterp(HW_KEYS, i);
    CURt[i] = keyInterp(CUR_KEYS, i);
  }
  const KAP = new Float64Array(N); // signed heading change per metre, smoothed (+ = left turn)
  for (let i = 0; i < N; i++) {
    const a = Math.max(0, i - 6), b = Math.min(N - 1, i + 6);
    KAP[i] = (HD[b] - HD[a]) / Math.max(1, b - a);
  }

  const track = { length };
  const idx = (s) => { const c = clamp(s, 0, length); const i = Math.min(length - 1, Math.floor(c)); return [i, c - i]; };

  track.sample = function (s) {
    const [i, f] = idx(s);
    let tx = lerp(TX[i], TX[i + 1], f), tz = lerp(TZ[i], TZ[i + 1], f);
    const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
    return {
      x: lerp(PX[i], PX[i + 1], f), z: lerp(PZ[i], PZ[i + 1], f), tx, tz,
      halfWidth: lerp(HWt[i], HWt[i + 1], f), current: lerp(CURt[i], CURt[i + 1], f),
    };
  };

  function refine(x, z, i) { // best projection over segments around table index i -> s
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
    for (let i = i0; i <= i1; i += step) {
      const d = (PX[i] - x) * (PX[i] - x) + (PZ[i] - z) * (PZ[i] - z);
      if (d < bd) { bd = d; best = i; }
    }
    return [best, bd];
  }
  track.locate = function (x, z, hintS) {
    let s;
    let done = false;
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
    const lateral = (x - p.x) * -p.tz + (z - p.z) * p.tx;
    return { s, lateral, halfWidth: p.halfWidth, tx: p.tx, tz: p.tz, current: p.current };
  };

  const at = (s, l) => { const p = track.sample(s); return { x: p.x + -p.tz * l, z: p.z + p.tx * l, p }; };
  const headingAt = (s) => { const p = track.sample(s); return Math.atan2(-p.tx, -p.tz); };
  const hwAt = (s) => track.sample(s).halfWidth;

  // --- start / finish / zones / gates
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

  // --- obstacles (with passable-gap validation)
  const rng = mulberry32(20251029);
  const rr = (a, b) => lerp(a, b, rng());
  const obstacles = [];
  const nearGate = (s, pad) => GATE_S.some((g) => Math.abs(g - s) < pad) ||
    Math.abs(s - START_ARCH_S) < pad || Math.abs(s - track.finishS) < pad;
  function maxGap(sl) {
    const u = hwAt(sl) - BANK_MARGIN;
    const iv = [];
    for (const o of obstacles) {
      const ds = o.s - sl;
      if (Math.abs(ds) < o.r) { const w = Math.sqrt(o.r * o.r - ds * ds); iv.push([o.lat - w, o.lat + w]); }
    }
    iv.sort((a, b) => a[0] - b[0]);
    let cur = -u, best = 0;
    for (const [a, b] of iv) { if (a > cur) best = Math.max(best, a - cur); cur = Math.max(cur, b); }
    best = Math.max(best, u - cur);
    return best;
  }
  function tryAdd(type, s, lat, r, scale, seed, rot) {
    if (s < 60 || nearGate(s, 14)) return false;
    const w = at(s, lat);
    const o = { type, shape: 'circle', x: w.x, z: w.z, r, solid: true, hazard: false, moving: false, vx: 0, vz: 0,
      rot: rot ?? rng() * Math.PI * 2, scale, seed, s, lat };
    obstacles.push(o);
    for (let sl = Math.ceil(s - r - 1); sl <= Math.floor(s + r + 1); sl++) {
      if (maxGap(sl) < GAP_MIN) { obstacles.pop(); return false; }
    }
    return true;
  }
  const rockScaleToR = 0.9;
  function addRock(s, lat, size) { return tryAdd('rock', s, lat, size * rockScaleToR, size, (rng() * 1e6) | 0); }

  // Lazy Bends: a few shoreline rocks
  [285, 395, 455, 515].forEach((s, i) => { const hw = hwAt(s); addRock(s, (i % 2 ? 1 : -1) * rr(hw * 0.35, hw * 0.55), rr(1.4, 2.0)); });
  // Cow Meadow: sparse
  [575, 700, 765].forEach((s, i) => { const hw = hwAt(s); addRock(s, (i % 2 ? -1 : 1) * (hw - 6), rr(1.5, 2.1)); });
  // Rock Slalom rows
  const slalomRows = [];
  for (let k = 0, s = 840; s < 1035; k++, s += 22) {
    const hw = hwAt(s);
    const c = (hw - 9.5) * 0.75 * Math.sin(k * 1.15 + 0.4);
    slalomRows.push({ s, c });
    const rl = rr(2.0, 3.0), rrr = rr(2.0, 3.0);
    const half = GAP_MIN / 2 + 0.7;
    addRock(s, c - half - rl / rockScaleToR * rockScaleToR, rl);
    addRock(s + rr(-2, 2), c + half + rrr, rrr);
  }
  // Canyon: mid-stream boulders where wide enough
  for (let s = 1125, k = 0; s < 1320; s += 34, k++) addRock(s, (k % 2 ? 1 : -1) * rr(1.8, 3.2), rr(1.4, 1.7));
  // Log Jam rows with a moving gap
  const jamRows = [];
  for (let k = 0, s = 1390; k < 5; k++, s += 25) {
    const hw = hwAt(s);
    const c = [-3, 4.5, -1.5, 3.5, 0][k] * Math.min(1, (hw - 9) / 5);
    jamRows.push({ s, c });
    const gapHalf = GAP_MIN / 2 + 0.9;
    const L = 5.2, rl = 2.7, stepL = 4.7;
    for (let lat = c - gapHalf - rl; lat > -hw - 2; lat -= stepL) tryAdd('log', s + rr(-0.6, 0.6), lat, rl, L, (rng() * 1e6) | 0, headingAt(s) + rr(-0.22, 0.22));
    for (let lat = c + gapHalf + rl; lat < hw + 2; lat += stepL) tryAdd('log', s + rr(-0.6, 0.6), lat, rl, L, (rng() * 1e6) | 0, headingAt(s) + rr(-0.22, 0.22));
  }
  // Crystal Lake: buoy gates + a couple of islet rocks
  const buoyRows = [];
  [1585, 1610, 1635, 1660, 1685, 1795, 1820, 1845].forEach((s, k) => {
    const c = 7 * Math.sin(k * 0.9);
    buoyRows.push({ s, c });
    tryAdd('buoy', s, c - 6.2, 0.8, 1, k, 0);
    tryAdd('buoy', s, c + 6.2, 0.8, 1, k + 100, 0);
  });
  addRock(1650, 15, 2.4); addRock(1750, -14, 2.6); addRock(1735, 13, 2.2);
  // Final Sprint
  for (let s = 1905, k = 0; s < 2190; s += 38, k++) { const hw = hwAt(s); addRock(s, (k % 2 ? -1 : 1) * rr(hw * 0.25, hw * 0.5), rr(1.6, 2.3)); }
  obstacles.sort((a, b) => a.s - b.s);
  track.obstacles = obstacles;

  // --- coins
  const coins = [];
  const addCoin = (s, lat) => {
    if (s < 40 || s > length - 30) return;
    if (Math.abs(lat) > hwAt(s) - 2.2) return;
    const w = at(s, lat);
    for (const o of obstacles) if (Math.hypot(o.x - w.x, o.z - w.z) < o.r + 1.1) return;
    coins.push({ type: 'coin', x: w.x, z: w.z, y: 0.9, s });
  };
  for (let i = 0; i < 8; i++) addCoin(70 + i * 8, 0);                             // intro line
  for (let i = 0; i < 5; i++) addCoin(165 + i * 9, (i % 2 ? 1 : -1) * 6);        // intro zig-zag
  for (let s = 250; s < 535; s += 11) addCoin(s, 5 * Math.sin((s - 250) / 28));  // S-bend weave
  [585, 700, 765].forEach((b) => { for (let i = 0; i < 7; i++) { const l = (i - 3) * 2.2; addCoin(b - 3.2 * (1 - (l / 6.6) ** 2), l); } }); // meadow arches
  slalomRows.forEach((r) => { addCoin(r.s - 8, r.c); addCoin(r.s, r.c); addCoin(r.s + 8, r.c); }); // through every gap
  for (let s = 1075; s < 1340; s += 12) addCoin(s, 2.5 * Math.sin((s - 1075) / 22)); // canyon line
  jamRows.forEach((r) => { addCoin(r.s - 5, r.c); addCoin(r.s, r.c); addCoin(r.s + 5, r.c); });
  buoyRows.slice(0, 5).forEach((r) => addCoin(r.s + 12, r.c));
  for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; addCoin(1752 + Math.cos(a) * 16, Math.sin(a) * 9); } // lake loop
  buoyRows.slice(5).forEach((r) => { addCoin(r.s - 8, r.c); addCoin(r.s + 12, r.c); });
  for (let s = 1895; s < 2185; s += 11) addCoin(s, 6 * Math.sin((s - 1895) / 20)); // sprint zig-zag
  for (let i = 0; i < 7; i++) addCoin(2188, (i - 3) * 2.4);                       // finish row
  coins.sort((a, b) => a.s - b.s);
  track.pickups = coins;

  // ---------------------------------------------------------------- terrain helpers (used by scenery)
  track.update = function (_t) { /* map 1 has no moving obstacles (contract v2) */ };
  track._internal = { at, headingAt, hwAt, KAP };
  return track;
}

// ================================================================= buildScenery
const COL = (hex) => new THREE.Color(hex);
const C_SAND = COL('#f3d58a'), C_WET = COL('#c9a86a'), C_GRASS = COL('#5fd03a'), C_GRASS2 = COL('#46b82e');
const C_FAR = COL('#58c436'), C_ROCK1 = COL('#7d8392'), C_ROCK2 = COL('#a39a8e'), C_STRATA = COL('#8c6a4a'), C_CAP = COL('#5a9a3a');

export function buildScenery(scene, track, models, water) {
  const rng = mulberry32(777001);
  const rr = (a, b) => lerp(a, b, rng());
  const L = track.length;
  const { KAP } = track._internal;
  const canyon = track.zones.find((z) => z.rapids);
  const meadow = track.zones.find((z) => z.name === 'Cow Meadow');
  const canyonW = (s) => canyon ? smooth(canyon.s0 - 30, canyon.s0 + 12, s) * (1 - smooth(canyon.s1 - 12, canyon.s1 + 30, s)) : 0;

  // centre line with straight extrapolation beyond the ends
  function centre(s) {
    if (s < 0) { const p = track.sample(0); return { x: p.x + p.tx * s, z: p.z + p.tz * s, tx: p.tx, tz: p.tz, hw: p.halfWidth }; }
    if (s > L) { const p = track.sample(L); return { x: p.x + p.tx * (s - L), z: p.z + p.tz * (s - L), tx: p.tx, tz: p.tz, hw: p.halfWidth }; }
    const p = track.sample(s); return { x: p.x, z: p.z, tx: p.tx, tz: p.tz, hw: p.halfWidth };
  }
  const GP = [[0, -1.2], [0.6, -0.6], [1.4, 0.3], [4, 1.3], [10, 1.7], [25, 2.1], [45, 2.5], [72, -0.3]];
  const CF = [[1.2, 0.5], [3, 0.8], [6, 0.97], [11, 1], [20, 0.9], [34, 0.72], [52, 0.42], [72, -0.03]];
  const outer = (d) => 1 - smooth(48, 72, d);
  function heightAt(wx, wz, d, c) {
    const amp = smooth(6, 22, d) * outer(d);
    let g = lerpCR(GP, d)
      + (vnoise(wx * 0.03, wz * 0.03, 3) - 0.5) * 2 * 1.5 * amp
      + (vnoise(wx * 0.09, wz * 0.09, 4) - 0.5) * 2 * 0.45 * amp
      + (vnoise(wx * 0.2, wz * 0.2, 5) - 0.5) * 0.14 * smooth(3, 12, d) * outer(d);
    if (c <= 0.001) return g;
    const H = 8 + 12 * smooth(0.15, 0.85, vnoise(wx * 0.022, wz * 0.022, 7));
    let cy;
    if (d < 1.2) cy = lerp(-1.2, 0.5 * H, d / 1.2);
    else cy = lerpCR(CF, d) * H;
    const rk = smooth(0.5, 4, d) * (1 - smooth(30, 60, d));
    cy += ((vnoise(wx * 0.11, wz * 0.11, 9) - 0.5) * 2.6 + (vnoise(wx * 0.37, wz * 0.37, 10) - 0.5) * 1.5) * rk;
    return g + (cy - g) * c;
  }
  const DMAX = 72;
  const D_COLS = [0, 0.5, 1.1, 1.7, 2.4, 3.2, 4.2, 5.4, 6.8, 8.5, 10.5, 13, 16.5, 21, 27, 34, 42, 51, 61, 72];
  function ground(s, side, d) { // side +1 right / -1 left; d = distance from water edge (unscaled)
    const c0 = centre(s);
    const ki = clamp(Math.round(s), 0, L);
    const dh = KAP[ki];
    let f = 1;
    if (side === (dh > 0 ? -1 : 1)) {
      const k = Math.abs(dh);
      if (k > 1e-5) f = clamp((Math.max(6, 0.8 / k - c0.hw)) / DMAX, 0.3, 1);
    }
    const off = c0.hw + d * f;
    const x = c0.x + -c0.tz * side * off, z = c0.z + c0.tx * side * off;
    const c = canyonW(s);
    return { x, z, y: heightAt(x, z, d, c), c };
  }
  // highest terrain under a footprint of radius r around (s, side, d) - things sit on this so nothing clips
  function footY(s, side, d, r) {
    let m = -1e9;
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const y = ground(s + i * r, side, Math.max(0, d + j * r)).y;
      if (y > m) m = y;
    }
    return m;
  }
  const ROCK_PAL = ['#8f5f3e', '#c2a074', '#6e7384', '#d1b68a', '#5f4a3c', '#a99a8a', '#b2764a'].map(COL);
  const _rk = new THREE.Color(), _t = new THREE.Color();
  const C_PEB = COL('#a8a191'), C_GRASS3 = COL('#7fdc4c'), C_GRASS_D = COL('#2f9a2a'), C_WETD = COL('#a88a56');
  function groundColor(out, d, y, c, wx, wz) {
    const n1 = vnoise(wx * 0.045, wz * 0.045, 11);
    const n2 = vnoise(wx * 0.4, wz * 0.4, 12);
    const patch = vnoise(wx * 0.018, wz * 0.018, 15);
    out.copy(C_GRASS).lerp(C_GRASS3, smooth(0.45, 0.8, n1) * 0.7).lerp(C_GRASS2, smooth(0.5, 0.2, n1) * 0.8);
    out.lerp(C_GRASS_D, smooth(0.58, 0.8, patch) * 0.65);
    out.multiplyScalar(0.96 + n2 * 0.08);
    out.lerp(C_FAR, smooth(40, 72, d) * 0.8);
    const grassT = smooth(2.6, 6.2, d + (n1 - 0.5) * 3);
    out.lerp(C_SAND, (1 - grassT) * 0.95);
    const pm = smooth(1.1, 2.0, d) * (1 - smooth(3.6, 5.2, d)) * smooth(0.45, 0.62, n2);
    out.lerp(C_PEB, pm * 0.85);
    out.lerp(C_WET, 1 - smooth(0.3, 1.3, d + n2 * 0.4));
    if (y < 0) out.lerp(C_WETD, smooth(0, -0.9, y));
    if (c > 0.001) {
      const u = y * 0.34 + vnoise(wx * 0.04, wz * 0.04, 17) * 1.6 + vnoise(wx * 0.3, wz * 0.3, 18) * 0.25;
      const iu = Math.floor(u), fu = u - iu;
      const hA = hash2(iu, 3, 5), hB = hash2(iu + 1, 3, 5);
      _rk.copy(ROCK_PAL[Math.floor(hA * ROCK_PAL.length)]);
      _t.copy(ROCK_PAL[Math.floor(hB * ROCK_PAL.length)]);
      _rk.lerp(_t, smooth(0.9, 1, fu));
      _rk.multiplyScalar(0.9 + vnoise(wx * 0.5, wz * 0.5, 19) * 0.2);
      _rk.lerp(C_CAP, smooth(26, 60, d) * 0.6);
      if (y < 0.3) _rk.lerp(C_WETD, smooth(0.3, -0.8, y) * 0.9);
      out.lerp(_rk, smooth(0, 0.6, c));
    }
  }

  // ---- terrain strips (chunked along s), shared indexed grid + analytic smooth normals
  const terrainGroup = new THREE.Group(); scene.add(terrainGroup);
  const terrainMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  {
    const ROW = 2, S0 = -60, S1 = L + 80, CHUNK_ROWS = 64;
    const rows = []; for (let s = S0; s <= S1 + 1e-6; s += ROW) rows.push(s);
    const R = rows.length, K = D_COLS.length;
    const col = new THREE.Color();
    const sides = [-1, 1].map((side) => {
      const P = new Float32Array(R * K * 3), C = new Float32Array(R * K * 3), N = new Float32Array(R * K * 3);
      for (let r = 0; r < R; r++) for (let k = 0; k < K; k++) {
        const g = ground(rows[r], side, D_COLS[k]);
        groundColor(col, D_COLS[k], g.y, g.c, g.x, g.z);
        const o = (r * K + k) * 3;
        P[o] = g.x; P[o + 1] = g.y; P[o + 2] = g.z; C[o] = col.r; C[o + 1] = col.g; C[o + 2] = col.b;
      }
      for (let r = 0; r < R; r++) for (let k = 0; k < K; k++) {
        const ra = Math.max(0, r - 1) * K + k, rb = Math.min(R - 1, r + 1) * K + k;
        const ka = r * K + Math.max(0, k - 1), kb = r * K + Math.min(K - 1, k + 1);
        const ax = P[rb * 3] - P[ra * 3], ay = P[rb * 3 + 1] - P[ra * 3 + 1], az = P[rb * 3 + 2] - P[ra * 3 + 2];
        const bx = P[kb * 3] - P[ka * 3], by = P[kb * 3 + 1] - P[ka * 3 + 1], bz = P[kb * 3 + 2] - P[ka * 3 + 2];
        let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
        if (ny < 0) { nx = -nx; ny = -ny; nz = -nz; }
        const l = Math.hypot(nx, ny, nz) || 1;
        const o = (r * K + k) * 3; N[o] = nx / l; N[o + 1] = ny / l; N[o + 2] = nz / l;
      }
      return { P, C, N };
    });
    for (let r0 = 0; r0 < R - 1; r0 += CHUNK_ROWS) {
      const r1 = Math.min(R - 1, r0 + CHUNK_ROWS), nr = r1 - r0 + 1;
      const per = nr * K;
      const pos = new Float32Array(per * 6), cols = new Float32Array(per * 6), nor = new Float32Array(per * 6);
      const idx = [];
      sides.forEach((sd, si) => {
        const src = r0 * K * 3, len = per * 3;
        pos.set(sd.P.subarray(src, src + len), si * len);
        cols.set(sd.C.subarray(src, src + len), si * len);
        nor.set(sd.N.subarray(src, src + len), si * len);
        const base = si * per;
        for (let r = 0; r < nr - 1; r++) for (let k = 0; k < K - 1; k++) {
          const a = base + r * K + k, b = a + 1, c = a + K, e = c + 1;
          for (const [i, j, l] of [[a, b, c], [b, e, c]]) {
            const ny = (pos[j * 3 + 2] - pos[i * 3 + 2]) * (pos[l * 3] - pos[i * 3]) - (pos[j * 3] - pos[i * 3]) * (pos[l * 3 + 2] - pos[i * 3 + 2]);
            if (ny >= 0) idx.push(i, j, l); else idx.push(i, l, j);
          }
        }
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      geo.setIndex(idx);
      geo.computeBoundingSphere();
      terrainGroup.add(new THREE.Mesh(geo, terrainMat));
    }
  }
  // far ground plane
  {
    let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
    for (let s = 0; s <= L; s += 20) { const p = track.sample(s); minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); }
    const geo = new THREE.PlaneGeometry(4000, 4000); geo.rotateX(-Math.PI / 2);
    const far = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: C_FAR }));
    far.position.set((minX + maxX) / 2, -0.3, (minZ + maxZ) / 2);
    scene.add(far);
    // flat water extensions before the start and after the finish
    const wm = new THREE.MeshBasicMaterial({ color: 0x2bb5e8 });
    for (const [sA, sB] of [[-60, 0], [L, L + 80]]) {
      const a = centre(sA), b = centre(sB);
      const hw = centre(Math.max(0, Math.min(L, sA < 0 ? 0 : L))).hw + 3;
      const len = Math.hypot(b.x - a.x, b.z - a.z);
      const g = new THREE.PlaneGeometry(hw * 2, len); g.rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(g, wm);
      m.position.set((a.x + b.x) / 2, -0.04, (a.z + b.z) / 2);
      m.rotation.y = Math.atan2(-a.tx, -a.tz);
      scene.add(m);
    }
  }
  if (water && water.mesh) scene.add(water.mesh);

  // ---- scatter via chunked InstancedMeshes
  const CH = 200;
  const chunks = new Map(); // key -> {i0,i1,list:[mesh]}
  const scatterMeshes = [];
  const protoCache = new Map();
  function protoParts(key, make) {
    if (protoCache.has(key)) return protoCache.get(key);
    let parts = [];
    try {
      const obj = make();
      obj.updateMatrixWorld(true);
      obj.traverse((m) => { if (m.isMesh) parts.push({ geo: m.geometry, mat: m.material, mtx: m.matrixWorld.clone() }); });
    } catch (e) { console.warn('[track] prototype failed', key, e); parts = []; }
    protoCache.set(key, parts);
    return parts;
  }
  const placements = new Map(); // `${key}|${chunk}` -> {key, chunk, mats:[]}
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _e = new THREE.Euler();
  function place(key, make, s, g, scale, rotY, y) {
    const ch = Math.floor((s + 100) / CH);
    const k = key + '|' + ch;
    let e = placements.get(k);
    if (!e) { e = { key, make, chunk: ch, mats: [] }; placements.set(k, e); }
    _q.setFromEuler(_e.set(0, rotY, 0)); _p.set(g.x, y === undefined ? g.y : y, g.z); _s.set(scale, scale, scale);
    e.mats.push(new THREE.Matrix4().compose(_p, _q, _s));
  }
  const kinds = ['pine', 'round', 'birch'];
  const inMeadow = (s) => s > meadow.s0 && s < meadow.s1;
  // trees
  for (let a = 0; a < 2600; a++) {
    const s = rr(-30, L + 50), side = rng() < 0.5 ? -1 : 1, d = rr(4, 66);
    if (canyonW(s) > 0.2) continue;
    const g0 = ground(s, side, d);
    if (vnoise(g0.x * 0.02, g0.z * 0.02, 21) < 0.42) continue;
    if (inMeadow(s) && d < 26 && rng() < 0.88) continue;
    const kn = vnoise(g0.x * 0.01, g0.z * 0.01, 23);
    const kind = kn < 0.4 ? 'pine' : kn < 0.75 ? 'round' : 'birch';
    const v = rng() < 0.5 ? 1 : 2;
    const sc = rr(0.85, 1.5);
    place('tree-' + kind + v, () => models.makeTree(kind, v), s, g0, sc, rng() * 6.28, footY(s, side, d, 0.6 * sc) - 0.08);
  }
  // a few trees on cliff tops
  for (let a = 0; a < 140; a++) {
    const s = rr(canyon.s0 - 20, canyon.s1 + 20), side = rng() < 0.5 ? -1 : 1, d = rr(14, 40);
    if (canyonW(s) < 0.8) continue;
    const g0 = ground(s, side, d);
    const sc = rr(0.9, 1.6);
    place('tree-pine1', () => models.makeTree('pine', 1), s, g0, sc, rng() * 6.28, footY(s, side, d, 0.6 * sc) - 0.08);
  }
  // bushes
  for (let a = 0; a < 700; a++) {
    const s = rr(-30, L + 50), side = rng() < 0.5 ? -1 : 1, d = rr(2.5, 40);
    if (canyonW(s) > 0.2) continue;
    const g0 = ground(s, side, d);
    const v = rng() < 0.5 ? 1 : 2;
    const sc = rr(0.8, 1.6);
    place('bush' + v, () => models.makeBush(v), s, g0, sc, rng() * 6.28, footY(s, side, d, 0.7 * sc) - 0.1);
  }
  // reeds along banks
  for (let a = 0; a < 420; a++) {
    const s = rr(-20, L + 30), side = rng() < 0.5 ? -1 : 1, d = rr(0.0, 1.2);
    if (canyonW(s) > 0.4) continue;
    const g0 = ground(s, side, d);
    const v = rng() < 0.5 ? 1 : 2;
    const sc = rr(0.9, 1.5);
    place('reeds' + v, () => models.makeReeds(v), s, g0, sc, rng() * 6.28, Math.max(-0.35, footY(s, side, d, 0.4 * sc)) - 0.05);
  }
  for (const e of placements.values()) {
    const parts = protoParts(e.key, e.make);
    for (const part of parts) {
      const im = new THREE.InstancedMesh(part.geo, part.mat, e.mats.length);
      for (let i = 0; i < e.mats.length; i++) im.setMatrixAt(i, _m.copy(e.mats[i]).multiply(part.mtx));
      im.instanceMatrix.needsUpdate = true;
      im.computeBoundingSphere();
      scene.add(im);
      scatterMeshes.push({ mesh: im, chunk: e.chunk });
    }
  }

  // ---- dynamic things (culled by s window)
  const dyn = []; // {obj, s}
  // reach = how far ahead (m) the item stays visible; heavy multi-mesh things (cows) get a shorter reach to cap draw calls
  const addDyn = (obj, s, reach = 460) => { scene.add(obj); dyn.push({ obj, s, reach }); return obj; };
  const bobbers = [];

  // arches + gates
  const archW = (s) => 2 * (centre(s).hw + 1.5);
  const place2 = (obj, s) => {
    const c = centre(s);
    // posts stand at +-(hw+1.5): rest the arch on the lower of the two banks (never floating, never above water level needlessly)
    const yl = footY(s, -1, 1.5, 0.8), yr = footY(s, 1, 1.5, 0.8);
    obj.position.set(c.x, Math.max(0, Math.min(yl, yr) - 0.05), c.z); obj.rotation.y = Math.atan2(-c.tx, -c.tz); return obj; };
  addDyn(place2(models.makeArch('START', archW(24)), 24), 24);
  addDyn(place2(models.makeArch('FINISH', archW(track.finishS)), track.finishS), track.finishS);
  track.gates.forEach((g, i) => {
    const o = models.makeGateFlags(g.halfWidth, g.label, GATE_COLORS[i % GATE_COLORS.length]);
    o.position.set(g.x, 0, g.z); o.rotation.y = g.heading;
    addDyn(o, g.s);
  });

  // obstacles
  track.obstacles.forEach((ob, i) => {
    let o;
    if (ob.type === 'rock') { o = models.makeRock(ob.seed, ob.scale); o.position.set(ob.x, -0.15, ob.z); o.rotation.y = ob.rot; }
    else if (ob.type === 'log') { o = models.makeLog(ob.scale); o.position.set(ob.x, -0.05, ob.z); o.rotation.y = ob.rot; bobbers.push({ o, base: -0.05, ph: i, a: 0.04 }); }
    else { o = models.makeBuoy(i % 2 ? '#ffd21f' : '#ff3b30'); o.position.set(ob.x, 0, ob.z); bobbers.push({ o, base: 0, ph: i, a: 0.07 }); }
    addDyn(o, ob.s);
  });

  // coins
  const pickupMeshes = [];
  const coinProto = models.makeCoin();
  const coinItems = track.pickups.map((pk, i) => {
    const o = i === 0 ? coinProto : coinProto.clone(true);
    o.position.set(pk.x, pk.y, pk.z);
    scene.add(o);
    pickupMeshes.push(o);
    return { obj: o, s: pk.s, y: pk.y, collected: false, ph: i * 0.7 };
  });
  const pops = [];

  // cows
  const cows = [];
  // Far-LOD cow: all parts baked (rest pose) into ONE vertex-coloured mesh => 1 draw call instead of ~33.
  const proxyMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  function cowProxy(cow) {
    try {
      cow.updateMatrixWorld(true);
      const parts = [];
      cow.traverse((m) => {
        if (!m.isMesh || m.isInstancedMesh || !m.geometry.attributes.position) return;
        let g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
        for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'color') g.deleteAttribute(k);
        if (!g.attributes.normal) g.computeVertexNormals();
        g.applyMatrix4(m.matrixWorld);
        const n = g.attributes.position.count, ca = new Float32Array(n * 3);
        const mc = m.material && m.material.color ? m.material.color : null;
        const vc = m.material && m.material.vertexColors && m.geometry.attributes.color ? m.geometry.attributes.color : null;
        for (let i = 0; i < n; i++) {
          let r = mc ? mc.r : 1, gg = mc ? mc.g : 1, b = mc ? mc.b : 1;
          if (vc) { r *= vc.getX(i); gg *= vc.getY(i); b *= vc.getZ(i); }
          ca[i * 3] = r; ca[i * 3 + 1] = gg; ca[i * 3 + 2] = b;
        }
        g.setAttribute('color', new THREE.BufferAttribute(ca, 3));
        parts.push(g);
      });
      let total = 0; parts.forEach((g) => { total += g.attributes.position.count; });
      const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), col = new Float32Array(total * 3);
      let o = 0;
      for (const g of parts) {
        pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); col.set(g.attributes.color.array, o * 3);
        o += g.attributes.position.count;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      geo.computeBoundingSphere();
      return new THREE.Mesh(geo, proxyMat);
    } catch (e) { console.warn('[track] cow proxy failed', e); return null; }
  }
  function addCow(s, side, d, seed) {
    const g0 = ground(s, side, d);
    const cow = models.makeCow(seed);
    const c0 = centre(s);
    // The model's cheer() writes cow.position.y absolutely (hop from 0), so the cow lives inside a base group that
    // carries the terrain height; the hop is then always >= 0 above that base.
    const base = new THREE.Group();
    const y = footY(s, side, d, 0.9) - 0.03;
    base.position.set(g0.x, y, g0.z);
    const dx = c0.x - g0.x, dz = c0.z - g0.z;
    base.rotation.y = Math.atan2(-dx, -dz) + rr(-0.35, 0.35);
    cow.position.set(0, 0, 0); cow.rotation.set(0, 0, 0);
    const proxy = cowProxy(cow); // baked while the cow is still unparented (identity world transform)
    base.add(cow);
    if (proxy) { proxy.visible = false; base.add(proxy); }
    addDyn(base, s, 330);
    cows.push({ obj: base, cow, proxy, s, near: false });
  }
  for (let s = meadow.s0 + 12, k = 0; s < meadow.s1 - 8; s += rr(13, 19), k++) {
    addCow(s, k % 2 ? 1 : -1, rr(3.5, 9), k + 1);
    if (rng() < 0.45) addCow(s + rr(-4, 4), k % 2 ? -1 : 1, rr(4, 11), k + 50);
  }
  for (let k = 0; k < 6; k++) addCow(track.finishS - 40 + k * 14 + rr(-3, 3), k % 2 ? 1 : -1, rr(3.5, 8), 90 + k);

  // ---- update
  let lastS = 0;
  const _v = new THREE.Vector3();
  function update(dt, t, camera) {
    if (water && water.update) water.update(t, camera);
    camera.getWorldPosition(_v);
    const loc = track.locate(_v.x, _v.z, lastS);
    lastS = loc.s;
    const lo = lastS - 90, hi = lastS + 540;
    for (const it of dyn) { const v = it.s >= lo && it.s <= (lastS + it.reach); if (it.obj.visible !== v) it.obj.visible = v; }
    for (const b of bobbers) b.o.position.y = b.base + Math.sin(t * 1.8 + b.ph) * b.a;
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
    for (const c of cows) {
      if (!c.obj.visible) continue;
      const dd = Math.hypot(c.obj.position.x - _v.x, c.obj.position.z - _v.z);
      const near = dd < 75;
      if (c.proxy) { if (c.cow.visible !== near) c.cow.visible = near; if (c.proxy.visible === near) c.proxy.visible = !near; }
      const ud = c.cow.userData;
      if (near && ud.cheer) { ud.cheer(t); if (c.cow.position.y < 0) c.cow.position.y = 0; }
      else if (c.near) { if (ud.rest) ud.rest(); else { c.cow.position.y = 0; } }
      c.near = near;
    }
  }
  function collectPickup(i) {
    const c = coinItems[i];
    if (!c || c.collected) return;
    c.collected = true; c.obj.visible = true;
    pops.push({ obj: c.obj, t: 0 });
  }
  return { update, collectPickup, pickupMeshes, cows };
}
