/**
 * Plane slicer for closed fruit meshes.
 *
 * sliceGeometry() splits a (indexed or non-indexed) BufferGeometry with
 * position/normal/uv by the plane n·p = 0. Triangles crossing the plane are
 * split with interpolated attributes; cut points are shared per topological
 * edge (using weld ids, so UV seams don't break loops), chained into closed
 * loops and capped.
 *
 * Caps: if a loop is star-shaped about its area centroid (the common case for
 * fruit) it is filled with concentric rings and given POLAR uvs
 * (u = angle / 2π, v = normalised radius, 1 at the rim). The flesh textures
 * are polar-resampled so rind / pith rings hug the actual outline of the cut,
 * whatever its shape. Non-star loops (e.g. a crescent from a lengthwise banana
 * cut) are ear-clipped (fan fallback) and sampled at mid-flesh.
 *
 * Output: two non-indexed vertex streams (side 0 = n·p < 0, side 1 = n·p ≥ 0).
 * Surface vertices come first, cap vertices after. The cap of side 0 faces +n,
 * the cap of side 1 faces −n.
 */

export interface SlicedPart {
  pos: Float32Array;
  nor: Float32Array;
  uv: Float32Array;
  /** vertices belonging to the original surface (first `surfCount`) */
  surfCount: number;
  /** cap vertices (after the surface ones) */
  capCount: number;
}

class VBuf {
  pos = new Float32Array(3 * 4096);
  nor = new Float32Array(3 * 4096);
  uv = new Float32Array(2 * 4096);
  n = 0;
  reserve(extra: number): void {
    const need = this.n + extra;
    if (need * 3 <= this.pos.length) return;
    let cap = this.pos.length / 3;
    while (cap < need) cap *= 2;
    const p = new Float32Array(cap * 3); p.set(this.pos); this.pos = p;
    const q = new Float32Array(cap * 3); q.set(this.nor); this.nor = q;
    const r = new Float32Array(cap * 2); r.set(this.uv); this.uv = r;
  }
  push(px: number, py: number, pz: number, nx: number, ny: number, nz: number, u: number, v: number): void {
    const i = this.n++;
    const i3 = i * 3, i2 = i * 2;
    this.pos[i3] = px; this.pos[i3 + 1] = py; this.pos[i3 + 2] = pz;
    this.nor[i3] = nx; this.nor[i3 + 1] = ny; this.nor[i3 + 2] = nz;
    this.uv[i2] = u; this.uv[i2 + 1] = v;
  }
  take(surfCount: number): SlicedPart | null {
    if (this.n === 0) return null;
    return {
      pos: this.pos.slice(0, this.n * 3),
      nor: this.nor.slice(0, this.n * 3),
      uv: this.uv.slice(0, this.n * 2),
      surfCount,
      capCount: this.n - surfCount,
    };
  }
}

const bufs: [VBuf, VBuf] = [new VBuf(), new VBuf()];
let dist = new Float64Array(4096);
let side = new Uint8Array(4096);
const edgeMap = new Map<number, number>();
// cap boundary points (3D) + adjacency
let capPts = new Float64Array(3 * 1024);
let adj = new Int32Array(2 * 1024);
let capN = 0;
let visited = new Uint8Array(1024);
// loop scratch (2D)
let lx = new Float64Array(1024);
let ly = new Float64Array(1024);
let lu = new Float64Array(1025);
let loopIdx = new Int32Array(1024);

const RINGS = [1, 0.965, 0.9, 0.78, 0.62, 0.44, 0.26, 0.1];
const FALLBACK_U = 0.37;
const FALLBACK_V = 0.55;

function ensureCap(n: number): void {
  if (n <= adj.length / 2) return;
  let cap = adj.length / 2;
  while (cap < n) cap *= 2;
  const p = new Float64Array(cap * 3); p.set(capPts); capPts = p;
  const a = new Int32Array(cap * 2).fill(-1); a.set(adj); adj = a;
  visited = new Uint8Array(cap);
  lx = new Float64Array(cap);
  ly = new Float64Array(cap);
  lu = new Float64Array(cap + 1);
  loopIdx = new Int32Array(cap);
}

let P: Float32Array, NOR: Float32Array, UV: Float32Array, W: Uint32Array, WC = 0;

function edgePoint(a: number, b: number): number {
  const wa = W[a], wb = W[b];
  const key = wa < wb ? wa * WC + wb : wb * WC + wa;
  const hit = edgeMap.get(key);
  if (hit !== undefined) return hit;
  // canonical order for bit-identical results from either triangle
  let lo = a, hi = b;
  if (wb < wa || (wb === wa && b < a)) { lo = b; hi = a; }
  const t = dist[lo] / (dist[lo] - dist[hi]);
  const id = capN++;
  ensureCap(capN);
  const l3 = lo * 3, h3 = hi * 3, c3 = id * 3;
  capPts[c3] = P[l3] + (P[h3] - P[l3]) * t;
  capPts[c3 + 1] = P[l3 + 1] + (P[h3 + 1] - P[l3 + 1]) * t;
  capPts[c3 + 2] = P[l3 + 2] + (P[h3 + 2] - P[l3 + 2]) * t;
  adj[id * 2] = -1;
  adj[id * 2 + 1] = -1;
  edgeMap.set(key, id);
  return id;
}

function link(i: number, j: number): void {
  if (i === j) return;
  const ai = i * 2, aj = j * 2;
  if (adj[ai] === -1) adj[ai] = j; else if (adj[ai + 1] === -1 && adj[ai] !== j) adj[ai + 1] = j;
  if (adj[aj] === -1) adj[aj] = i; else if (adj[aj + 1] === -1 && adj[aj] !== i) adj[aj + 1] = i;
}

/** Emit split vertex: position from shared cut point, other attrs interpolated L→O. */
function pushCut(buf: VBuf, ci: number, L: number, O: number, t: number): void {
  const c3 = ci * 3, l3 = L * 3, o3 = O * 3, l2 = L * 2, o2 = O * 2;
  let nx = NOR[l3] + (NOR[o3] - NOR[l3]) * t;
  let ny = NOR[l3 + 1] + (NOR[o3 + 1] - NOR[l3 + 1]) * t;
  let nz = NOR[l3 + 2] + (NOR[o3 + 2] - NOR[l3 + 2]) * t;
  const il = 1 / (Math.hypot(nx, ny, nz) || 1);
  nx *= il; ny *= il; nz *= il;
  buf.push(
    capPts[c3], capPts[c3 + 1], capPts[c3 + 2], nx, ny, nz,
    UV[l2] + (UV[o2] - UV[l2]) * t, UV[l2 + 1] + (UV[o2 + 1] - UV[l2 + 1]) * t,
  );
}

function pushVert(buf: VBuf, i: number): void {
  const i3 = i * 3, i2 = i * 2;
  buf.push(P[i3], P[i3 + 1], P[i3 + 2], NOR[i3], NOR[i3 + 1], NOR[i3 + 2], UV[i2], UV[i2 + 1]);
}

// cap basis
let e1x = 0, e1y = 0, e1z = 0, e2x = 0, e2y = 0, e2z = 0, cnx = 0, cny = 0, cnz = 0;

function capTri(
  x0: number, y0: number, u0: number, v0: number,
  x1: number, y1: number, u1: number, v1: number,
  x2: number, y2: number, u2: number, v2: number,
): void {
  // 2D CCW in (e1,e2) => faces +n (side 0); reversed for side 1
  const p0x = x0 * e1x + y0 * e2x, p0y = x0 * e1y + y0 * e2y, p0z = x0 * e1z + y0 * e2z;
  const p1x = x1 * e1x + y1 * e2x, p1y = x1 * e1y + y1 * e2y, p1z = x1 * e1z + y1 * e2z;
  const p2x = x2 * e1x + y2 * e2x, p2y = x2 * e1y + y2 * e2y, p2z = x2 * e1z + y2 * e2z;
  const b0 = bufs[0], b1 = bufs[1];
  b0.push(p0x, p0y, p0z, cnx, cny, cnz, u0, v0);
  b0.push(p1x, p1y, p1z, cnx, cny, cnz, u1, v1);
  b0.push(p2x, p2y, p2z, cnx, cny, cnz, u2, v2);
  b1.push(p0x, p0y, p0z, -cnx, -cny, -cnz, u0, v0);
  b1.push(p2x, p2y, p2z, -cnx, -cny, -cnz, u2, v2);
  b1.push(p1x, p1y, p1z, -cnx, -cny, -cnz, u1, v1);
}

const earIdx: number[] = [];

function earClip(m: number): void {
  earIdx.length = 0;
  for (let i = 0; i < m; i++) earIdx.push(i);
  const F = FALLBACK_U, G = FALLBACK_V;
  let guard = m * m + 10;
  while (earIdx.length > 3 && guard-- > 0) {
    const len = earIdx.length;
    let clipped = false;
    for (let k = 0; k < len; k++) {
      const ia = earIdx[(k + len - 1) % len], ib = earIdx[k], ic = earIdx[(k + 1) % len];
      const ax = lx[ia], ay = ly[ia], bx = lx[ib], by = ly[ib], cx = lx[ic], cy = ly[ic];
      const cr = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
      if (cr <= 1e-14) continue;
      let inside = false;
      for (let q = 0; q < len; q++) {
        const ip = earIdx[q];
        if (ip === ia || ip === ib || ip === ic) continue;
        const px = lx[ip], py = ly[ip];
        const d1 = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
        const d2 = (cx - bx) * (py - by) - (cy - by) * (px - bx);
        const d3 = (ax - cx) * (py - cy) - (ay - cy) * (px - cx);
        if (d1 >= 0 && d2 >= 0 && d3 >= 0) { inside = true; break; }
      }
      if (inside) continue;
      capTri(ax, ay, F, G, bx, by, F, G, cx, cy, F, G);
      earIdx.splice(k, 1);
      clipped = true;
      break;
    }
    if (!clipped) {
      // Degenerate / numerically awkward: drop a (near-)collinear vertex if any,
      // otherwise fan the remainder from its centroid.
      let dropped = false;
      for (let k = 0; k < len; k++) {
        const ia = earIdx[(k + len - 1) % len], ib = earIdx[k], ic = earIdx[(k + 1) % len];
        const cr = (lx[ib] - lx[ia]) * (ly[ic] - ly[ia]) - (ly[ib] - ly[ia]) * (lx[ic] - lx[ia]);
        if (Math.abs(cr) <= 1e-14) { earIdx.splice(k, 1); dropped = true; break; }
      }
      if (dropped) continue;
      let sx = 0, sy = 0;
      for (const i of earIdx) { sx += lx[i]; sy += ly[i]; }
      sx /= len; sy /= len;
      for (let k = 0; k < len; k++) {
        const ia = earIdx[k], ib = earIdx[(k + 1) % len];
        capTri(sx, sy, F, G, lx[ia], ly[ia], F, G, lx[ib], ly[ib], F, G);
      }
      return;
    }
  }
  if (earIdx.length === 3) {
    const [a, b, c] = earIdx;
    capTri(lx[a], ly[a], F, G, lx[b], ly[b], F, G, lx[c], ly[c], F, G);
  }
}

function capLoop(count: number, uOff: number): void {
  // project + dedupe consecutive near-identical points
  let m = 0;
  let maxR = 0;
  for (let k = 0; k < count; k++) {
    const c3 = loopIdx[k] * 3;
    const x = capPts[c3] * e1x + capPts[c3 + 1] * e1y + capPts[c3 + 2] * e1z;
    const y = capPts[c3] * e2x + capPts[c3 + 1] * e2y + capPts[c3 + 2] * e2z;
    maxR = Math.max(maxR, Math.abs(x), Math.abs(y));
    lx[m] = x; ly[m] = y; m++;
  }
  const eps2 = Math.pow(maxR * 1e-4, 2);
  let w = 0;
  for (let k = 0; k < m; k++) {
    if (w > 0) {
      const dx = lx[k] - lx[w - 1], dy = ly[k] - ly[w - 1];
      if (dx * dx + dy * dy < eps2) continue;
    }
    lx[w] = lx[k]; ly[w] = ly[k]; w++;
  }
  while (w > 1) {
    const dx = lx[0] - lx[w - 1], dy = ly[0] - ly[w - 1];
    if (dx * dx + dy * dy < eps2) w--; else break;
  }
  m = w;
  if (m < 3) return;

  // signed area + area centroid
  let A = 0, cx = 0, cy = 0;
  for (let i = 0; i < m; i++) {
    const j = i + 1 === m ? 0 : i + 1;
    const cr = lx[i] * ly[j] - lx[j] * ly[i];
    A += cr;
    cx += (lx[i] + lx[j]) * cr;
    cy += (ly[i] + ly[j]) * cr;
  }
  if (Math.abs(A) < 1e-12) return;
  cx /= 3 * A;
  cy /= 3 * A;
  A *= 0.5;
  if (A < 0) {
    // reverse to CCW
    for (let i = 0, j = m - 1; i < j; i++, j--) {
      let t = lx[i]; lx[i] = lx[j]; lx[j] = t;
      t = ly[i]; ly[i] = ly[j]; ly[j] = t;
    }
  }

  // star-shaped test about centroid
  let star = true;
  for (let i = 0; i < m; i++) {
    const j = i + 1 === m ? 0 : i + 1;
    const ax = lx[i] - cx, ay = ly[i] - cy, bx = lx[j] - cx, by = ly[j] - cy;
    const cr = ax * by - ay * bx;
    if (cr < -1e-3 * Math.hypot(ax, ay) * Math.hypot(bx, by)) { star = false; break; }
  }
  if (!star) {
    earClip(m);
    return;
  }

  // unwrapped polar angles → u
  let prev = Math.atan2(ly[0] - cy, lx[0] - cx);
  let cum = 0;
  lu[0] = uOff;
  for (let i = 1; i <= m; i++) {
    const k = i === m ? 0 : i;
    const a = Math.atan2(ly[k] - cy, lx[k] - cx);
    let d = a - prev;
    if (d > Math.PI) d -= Math.PI * 2;
    else if (d < -Math.PI) d += Math.PI * 2;
    cum += d;
    prev = a;
    lu[i] = uOff + cum / (Math.PI * 2);
  }
  // normalise so the loop spans exactly 1 in u (seamless wrap)
  const span = cum / (Math.PI * 2);
  if (Math.abs(span - 1) > 1e-6 && span > 0.5) {
    for (let i = 1; i <= m; i++) lu[i] = uOff + (lu[i] - uOff) / span;
  }

  const K = RINGS.length;
  for (let i = 0; i < m; i++) {
    const j = i + 1 === m ? 0 : i + 1;
    const dxi = lx[i] - cx, dyi = ly[i] - cy, dxj = lx[j] - cx, dyj = ly[j] - cy;
    const ui = lu[i], uj = lu[i + 1];
    for (let k = 0; k < K - 1; k++) {
      const so = RINGS[k], si = RINGS[k + 1];
      const oix = cx + dxi * so, oiy = cy + dyi * so;
      const ojx = cx + dxj * so, ojy = cy + dyj * so;
      const iix = cx + dxi * si, iiy = cy + dyi * si;
      const ijx = cx + dxj * si, ijy = cy + dyj * si;
      capTri(oix, oiy, ui, so, ojx, ojy, uj, so, ijx, ijy, uj, si);
      capTri(oix, oiy, ui, so, ijx, ijy, uj, si, iix, iiy, ui, si);
    }
    const sl = RINGS[K - 1];
    capTri(cx + dxi * sl, cy + dyi * sl, ui, sl, cx + dxj * sl, cy + dyj * sl, uj, sl, cx, cy, (ui + uj) * 0.5, 0);
  }
}

/**
 * Split `geom` by the plane through the origin with normal (nx,ny,nz) (unit).
 * Returns [side0 (n·p<0), side1 (n·p≥0)] parts (null if empty).
 * `uOff` rotates the polar cap texture (random per slice for variety).
 */
export function sliceGeometry(
  geom: { attributes: Record<string, { array: ArrayLike<number> }>; index: { array: ArrayLike<number> } | null; userData: Record<string, unknown> },
  nx: number, ny: number, nz: number,
  withCap: boolean,
  uOff = 0,
): [SlicedPart | null, SlicedPart | null] {
  P = geom.attributes.position.array as Float32Array;
  NOR = geom.attributes.normal.array as Float32Array;
  UV = geom.attributes.uv.array as Float32Array;
  W = geom.userData.weld as Uint32Array;
  WC = geom.userData.weldCount as number;
  const nv = P.length / 3;
  if (dist.length < nv) { dist = new Float64Array(nv * 2); side = new Uint8Array(nv * 2); }
  for (let i = 0; i < nv; i++) {
    const d = P[i * 3] * nx + P[i * 3 + 1] * ny + P[i * 3 + 2] * nz;
    dist[i] = d;
    side[i] = d >= 0 ? 1 : 0;
  }
  const index = geom.index ? geom.index.array : null;
  const triCount = index ? index.length / 3 : nv / 3;
  bufs[0].n = 0;
  bufs[1].n = 0;
  bufs[0].reserve(triCount * 6 + 64);
  bufs[1].reserve(triCount * 6 + 64);
  edgeMap.clear();
  capN = 0;

  for (let t = 0; t < triCount; t++) {
    const a = index ? index[t * 3] : t * 3;
    const b = index ? index[t * 3 + 1] : t * 3 + 1;
    const c = index ? index[t * 3 + 2] : t * 3 + 2;
    const sa = side[a], sb = side[b], sc = side[c];
    if (sa === sb && sb === sc) {
      const buf = bufs[sa];
      pushVert(buf, a); pushVert(buf, b); pushVert(buf, c);
      continue;
    }
    let L: number, B: number, C: number;
    if (sa === sb) { L = c; B = a; C = b; }
    else if (sa === sc) { L = b; B = c; C = a; }
    else { L = a; B = b; C = c; }
    const sL = side[L];
    const lone = bufs[sL], other = bufs[1 - sL];
    const iLB = edgePoint(L, B), iLC = edgePoint(L, C);
    const tLB = dist[L] / (dist[L] - dist[B]);
    const tLC = dist[L] / (dist[L] - dist[C]);
    pushVert(lone, L);
    pushCut(lone, iLB, L, B, tLB);
    pushCut(lone, iLC, L, C, tLC);
    pushCut(other, iLB, L, B, tLB);
    pushVert(other, B);
    pushVert(other, C);
    pushCut(other, iLB, L, B, tLB);
    pushVert(other, C);
    pushCut(other, iLC, L, C, tLC);
    if (withCap) link(iLB, iLC);
  }

  const surf0 = bufs[0].n, surf1 = bufs[1].n;

  if (withCap && capN >= 3) {
    // basis with e1 × e2 = n
    cnx = nx; cny = ny; cnz = nz;
    let rx = 1, ry = 0, rz = 0;
    if (Math.abs(nx) > 0.9) { rx = 0; ry = 1; }
    e1x = ny * rz - nz * ry; e1y = nz * rx - nx * rz; e1z = nx * ry - ny * rx;
    const l1 = Math.hypot(e1x, e1y, e1z);
    e1x /= l1; e1y /= l1; e1z /= l1;
    e2x = ny * e1z - nz * e1y; e2y = nz * e1x - nx * e1z; e2z = nx * e1y - ny * e1x;

    visited.fill(0, 0, capN);
    for (let s = 0; s < capN; s++) {
      if (visited[s] || adj[s * 2] === -1) continue;
      let count = 0;
      let prevV = -1, cur = s;
      while (cur !== -1 && !visited[cur]) {
        visited[cur] = 1;
        loopIdx[count++] = cur;
        const a0 = adj[cur * 2], a1 = adj[cur * 2 + 1];
        const next = a0 !== prevV ? a0 : a1;
        prevV = cur;
        cur = next;
      }
      if (count >= 3) {
        bufs[0].reserve(count * RINGS.length * 6 + 64);
        bufs[1].reserve(count * RINGS.length * 6 + 64);
        capLoop(count, uOff);
      }
    }
  }

  return [bufs[0].take(surf0), bufs[1].take(surf1)];
}
