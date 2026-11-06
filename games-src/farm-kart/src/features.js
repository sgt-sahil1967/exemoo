// Road elevation features: bridges (over rivers, creeks and chasms) and jump ramps.
// Both are baked into the track's surface height function (terrainH), so karts,
// items, shadows, particles and cameras all follow them without special cases.
import * as THREE from 'three';
import { HALF_W, FENCE } from './dims.js';
import { mat, gloss, metal, rboxGeo, ballGeo, cylGeo, coneGeo, torusGeo, instanced, trs, PAL } from './geo.js';
import { rand, plankTex, cobbleTex, rampTex, stripeTex, boardTex } from './textures.js';

export const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const DS = THREE.DoubleSide;

// ------------------------------------------------------------------ terrain carving (rivers, lakes, chasms)
export class Carves {
  constructor() { this.segs = []; this.x0 = Infinity; this.x1 = -Infinity; this.z0 = Infinity; this.z1 = -Infinity; }
  /** pts: [[x, z, depthScale]], w = flat-bottom half width, bank = extra slope width */
  path(pts, w, d, bank) {
    for (let k = 0; k < pts.length - 1; k++) {
      const [ax, az, as = 1] = pts[k], [bx, bz, bs = 1] = pts[k + 1], R = w + bank;
      const s = { ax, az, bx, bz, as, bs, w, d, bank, dx: bx - ax, dz: bz - az,
        x0: Math.min(ax, bx) - R, x1: Math.max(ax, bx) + R, z0: Math.min(az, bz) - R, z1: Math.max(az, bz) + R };
      s.l2 = s.dx * s.dx + s.dz * s.dz || 1e-6;
      this.segs.push(s);
      this.x0 = Math.min(this.x0, s.x0); this.x1 = Math.max(this.x1, s.x1); this.z0 = Math.min(this.z0, s.z0); this.z1 = Math.max(this.z1, s.z1);
    }
  }
  bowl(x, z, r, d, bank) { this.path([[x, z, 1], [x + .01, z, 1]], r, d, bank); }
  at(x, z) {
    if (x < this.x0 || x > this.x1 || z < this.z0 || z > this.z1) return 0;
    let best = 0;
    for (const s of this.segs) {
      if (x < s.x0 || x > s.x1 || z < s.z0 || z > s.z1) continue;
      let t = ((x - s.ax) * s.dx + (z - s.az) * s.dz) / s.l2; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const ex = s.ax + s.dx * t - x, ez = s.az + s.dz * t - z, dist = Math.sqrt(ex * ex + ez * ez);
      if (dist >= s.w + s.bank) continue;
      const v = s.d * (s.as + (s.bs - s.as) * t) * (1 - sstep(s.w * .45, s.w + s.bank, dist));
      if (v > best) best = v;
    }
    return best;
  }
}

// ------------------------------------------------------------------ elevated road span (bridge + approaches)
export class Span {
  constructor(tr, d, base) {
    this.tr = tr; this.d = d;
    this.ic = tr.straightNear(d.at, d.search ?? .03);
    this.hl = Math.round(d.len / 2 / tr.seg);          // deck half length (indices)
    this.a = Math.round((d.approach ?? 16) / tr.seg);  // approach blend (indices)
    this.H = this.hl + this.a;
    this.hw = FENCE + 1.2;                              // deck half width
    const A = this.idx(-this.H), B = this.idx(this.H);
    this.yA = base(tr.px[A], tr.pz[A]); this.yB = base(tr.px[B], tr.pz[B]);
    this.hump = d.hump ?? 1.5; this.lift = d.lift ?? 0;
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let k = -this.H; k <= this.H; k++) { const i = this.idx(k); x0 = Math.min(x0, tr.px[i]); x1 = Math.max(x1, tr.px[i]); z0 = Math.min(z0, tr.pz[i]); z1 = Math.max(z1, tr.pz[i]); }
    const m = this.hw + 2;
    this.x0 = x0 - m; this.x1 = x1 + m; this.z0 = z0 - m; this.z1 = z1 + m;
    this.o = { kf: 0, lat: 0 };
  }
  idx(k) { return this.tr.wrap(this.ic + k); }
  /** index offset in [-H, H] of track index i, or null */
  kOf(i) { let k = i - this.ic; const N = this.tr.N; if (k > N / 2) k -= N; if (k < -N / 2) k += N; return Math.abs(k) <= this.H ? k : null; }
  local(x, z) {
    const tr = this.tr, px = tr.px, pz = tr.pz;
    let best = 0, bd = Infinity;
    for (let k = -this.H; k <= this.H; k += 4) { const i = this.idx(k), d = (x - px[i]) ** 2 + (z - pz[i]) ** 2; if (d < bd) { bd = d; best = k; } }
    const c = best;
    for (let k = c - 3; k <= c + 3; k++) { if (k < -this.H || k > this.H) continue; const i = this.idx(k), d = (x - px[i]) ** 2 + (z - pz[i]) ** 2; if (d < bd) { bd = d; best = k; } }
    const i = this.idx(best), dx = x - px[i], dz = z - pz[i];
    this.o.lat = -dx * tr.tz[i] + dz * tr.tx[i];
    this.o.kf = best + (dx * tr.tx[i] + dz * tr.tz[i]) / tr.seg;
    return this.o;
  }
  w(kf) { return sstep(0, 1, (this.H - Math.abs(kf)) / this.a); }
  D(kf) {
    const u = Math.min(1, Math.max(0, (kf + this.H) / (2 * this.H))), s = Math.sin(Math.PI * u);
    return this.yA + (this.yB - this.yA) * u + this.hump * s * s + this.lift * this.w(kf);
  }
  /** deck height at an index offset (centreline) */
  Dk(k) { return this.D(k); }
}

// ------------------------------------------------------------------ jump ramp
export class Ramp {
  constructor(tr, d) {
    this.d = d;
    this.i = tr.straightNear(d.at, d.search ?? .015);
    const i = this.i;
    this.ox = tr.px[i]; this.oz = tr.pz[i]; this.tx = tr.tx[i]; this.tz = tr.tz[i];
    this.len = d.len ?? 8; this.h = d.h ?? 1.7;
    this.lat = d.lat ?? 0; this.hw = (d.w ?? 2 * HALF_W + 1) / 2;
    this.boost = !!d.boost;
    const R = Math.hypot(this.len, this.hw + Math.abs(this.lat)) + 1;
    this.x0 = this.ox - R; this.x1 = this.ox + R; this.z0 = this.oz - R; this.z1 = this.oz + R;
  }
  height(x, z) {
    const dx = x - this.ox, dz = z - this.oz, s = dx * this.tx + dz * this.tz;
    if (s < 0 || s > this.len) return 0;
    const l = -dx * this.tz + dz * this.tx;
    if (Math.abs(l - this.lat) > this.hw) return 0;
    const u = s / this.len;
    return this.h * (.35 * u + .65 * u * u);
  }
  /** world point at along s, lateral l (ramp frame) */
  pt(s, l) { return [this.ox + this.tx * s - this.tz * l, this.oz + this.tz * s + this.tx * l]; }
}

// ------------------------------------------------------------------ helpers
class Inst {
  constructor() { this.m = new Map(); }
  add(geo, material, m) { const k = geo.uuid + material.uuid; let e = this.m.get(k); if (!e) { e = { geo, material, list: [] }; this.m.set(k, e); } e.list.push(m); }
  flush(group, opts) { for (const e of this.m.values()) group.add(instanced([{ geo: e.geo, material: e.material }], e.list, opts)); this.m.clear(); }
}
const _e = new THREE.Euler(0, 0, 0, 'YXZ'), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
/** matrix for a unit-length (z) piece stretched from a to b, with roll */
function segM(a, b, sx = 1, sy = 1, roll = 0, dy = 0) {
  const dx = b.x - a.x, dyy = b.y - a.y, dz = b.z - a.z, len = Math.hypot(dx, dyy, dz) || 1e-3;
  _e.set(-Math.asin(dyy / len), Math.atan2(dx, dz), roll, 'YXZ'); _q.setFromEuler(_e);
  _p.set((a.x + b.x) / 2, (a.y + b.y) / 2 + dy, (a.z + b.z) / 2); _s.set(sx, sy, len);
  return new THREE.Matrix4().compose(_p, _q, _s);
}
function M(x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) {
  _e.set(rx, ry, rz, 'YXZ'); _q.setFromEuler(_e); _p.set(x, y, z); _s.set(sx, sy, sz);
  return new THREE.Matrix4().compose(_p, _q, _s);
}
/** grid sheet from rows of points (each row = array of THREE.Vector3) */
function sheet(rows, material, uvScale = [1, 1]) {
  const pos = [], uv = [], idx = [], C = rows[0].length;
  let v = 0;
  rows.forEach((row, r) => {
    if (r) v += row[0].distanceTo(rows[r - 1][0]) / uvScale[1];
    let u = 0;
    row.forEach((p, c) => { if (c) u += p.distanceTo(row[c - 1]) / uvScale[0]; pos.push(p.x, p.y, p.z); uv.push(u, v); });
  });
  for (let r = 0; r < rows.length - 1; r++) for (let c = 0; c < C - 1; c++) { const a = r * C + c, b = a + C; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, material); m.castShadow = true; m.receiveShadow = true;
  return m;
}

const STYLE = {
  stone: { deck: 'cobble', side: '#a59e90', rail: '#c9c2b4', cap: '#e6e0d2', pier: '#9d968a', thick: 2.2 },
  wood: { deck: 'plank', side: '#7a4e26', rail: '#8a5a2b', cap: '#c43a2a', pier: '#6b4423', thick: 1.3 },
  covered: { deck: 'plank', side: '#6b4423', rail: '#c8372d', cap: '#fff1d6', pier: '#7d766b', thick: 1.4 },
  ice: { deck: null, side: '#9fd6f5', rail: '#dff4ff', cap: '#ffffff', pier: '#bfe8ff', thick: 1.4 },
  trestle: { deck: 'plank', side: '#6b4423', rail: '#9a6a3a', cap: '#ff3b30', pier: '#8a5a2b', thick: 1.2 },
};

// ------------------------------------------------------------------ bridge builder
export function buildSpan(tr, sp) {
  const st = STYLE[sp.d.style] || STYLE.wood, g = tr.group, T = tr.T, B = new Inst();
  const step = Math.max(1, Math.round(2.4 / tr.seg));
  const P = (k, lat, dy = 0) => { const i = sp.idx(k), x = tr.px[i] - tr.tz[i] * lat, z = tr.pz[i] + tr.tx[i] * lat; return new THREE.Vector3(x, tr.terrainH(x, z) + dy, z); };
  const PD = (k, lat, y) => { const i = sp.idx(k); return new THREE.Vector3(tr.px[i] - tr.tz[i] * lat, y, tr.pz[i] + tr.tx[i] * lat); };
  const hl = sp.hl, hw = sp.hw, L = hw - .1, th = st.thick;
  const ks = []; for (let k = -sp.H; k <= sp.H; k += step) ks.push(k); if (ks[ks.length - 1] !== sp.H) ks.push(sp.H);
  const kd = []; for (let k = -hl; k <= hl; k += step) kd.push(k); if (kd[kd.length - 1] !== hl) kd.push(hl);

  // deck surface overlay
  if (st.deck) {
    const tex = st.deck === 'plank' ? plankTex(sp.d.style === 'covered' ? '#9a6236' : '#b07a45') : cobbleTex();
    tr.own.push(tex);
    tr.roadStrip(sp.ic - hl, 2 * hl, hw - .3, -(hw - .3), new THREE.MeshStandardMaterial({ map: tex, roughness: .85, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }), .2, st.deck === 'plank' ? 3 : 4, 8);
  } else {
    tr.roadStrip(sp.ic - hl, 2 * hl, hw - .3, -(hw - .3), mat('#a9dcff', { roughness: .12, metalness: .2, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }), .2, 8, 4);
  }
  // fascia (outer side faces) and underside over the whole span
  const side = mat(st.side, { side: DS, roughness: .9 });
  for (const s of [-1, 1]) g.add(sheet(ks.map(k => { const t = P(k, s * L); return [t, PD(k, s * L, t.y - th)]; }), side, [4, 4]));
  g.add(sheet(ks.map(k => { const a = P(k, L), b = P(k, -L); return [PD(k, L, a.y - th), PD(k, -L, b.y - th)]; }), mat(st.side, { side: DS, roughness: 1, color: st.side })));
  // cap band along the fascia top (contrast stripe)
  const capG = rboxGeo(.5, .5, 1, .12, 2), capM = gloss(st.cap);
  for (let n = 0; n < ks.length - 1; n++) for (const s of [-1, 1]) B.add(capG, capM, segM(P(ks[n], s * (L + .15), -.25), P(ks[n + 1], s * (L + .15), -.25)));

  // supports where the ground falls away under the deck
  const pierM = mat(st.pier, { roughness: .9 });
  const pierStep = Math.round((sp.d.style === 'trestle' ? 7 : sp.d.style === 'stone' ? 16 : 10) / tr.seg);
  for (let k = -hl; k <= hl; k += pierStep) {
    const c = P(k, 0), gy = tr.groundAt(c.x, c.z), top = c.y - th;
    if (top - gy < 2.2) continue;
    const i = sp.idx(k), yaw = Math.atan2(tr.tx[i], tr.tz[i]), h = top - gy + 2, my = gy - 2 + h / 2;
    if (sp.d.style === 'stone') {
      B.add(rboxGeo(1, 1, 1, .1, 2), pierM, M(c.x, my, c.z, yaw, 2 * L - 1, h, 3.2));
      B.add(rboxGeo(1, 1, 1, .2, 2), mat(st.cap), M(c.x, gy + .5, c.z, yaw, 2 * L + 1, 1.2, 4.4));
    } else if (sp.d.style === 'ice') {
      for (const l of [-L + 2, 0, L - 2]) { const p = PD(k, l, my); B.add(cylGeo(1.3, 1.6, 1, 14), mat(st.pier, { roughness: .1, metalness: .15 }), M(p.x, p.y, p.z, 0, 1, h, 1)); }
    } else {
      const lats = sp.d.style === 'trestle' ? [-L + 1, -L / 3, L / 3, L - 1] : [-L + 1.5, 0, L - 1.5];
      for (const l of lats) { const p = PD(k, l, my); B.add(cylGeo(.45, .55, 1, 10), pierM, M(p.x, p.y, p.z, 0, 1, h, 1)); }
      // cross bracing in levels
      const lv = Math.max(1, Math.floor((top - gy) / 6));
      for (let j = 0; j < lv; j++) {
        const y0 = top - j * 6, y1 = Math.max(gy, y0 - 6);
        for (let q = 0; q < lats.length - 1; q++) {
          B.add(rboxGeo(.35, .35, 1, .08, 1), pierM, segM(PD(k, lats[q], y0), PD(k, lats[q + 1], y1)));
          B.add(rboxGeo(.35, .35, 1, .08, 1), pierM, segM(PD(k, lats[q], y1), PD(k, lats[q + 1], y0)));
        }
        B.add(rboxGeo(.4, .4, 1, .08, 1), pierM, segM(PD(k, lats[0], y1), PD(k, lats[lats.length - 1], y1)));
      }
    }
  }
  // abutments at both deck ends
  for (const e of [-hl, hl]) {
    const c = P(e, 0), i = sp.idx(e), yaw = Math.atan2(tr.tx[i], tr.tz[i]);
    const am = sp.d.style === 'ice' ? mat('#e8f6ff') : mat(sp.d.style === 'stone' ? STYLE.stone.pier : '#9d968a', { roughness: .95 });
    B.add(rboxGeo(1, 1, 1, .3, 2), am, M(c.x, c.y - th - 4, c.z, yaw, 2 * hw + 1.5, 8, 5));
  }
  // stone arches on the facades
  if (sp.d.style === 'stone') {
    const ar = (hl * tr.seg) / 2.2;
    for (const s of [-1, 1]) for (const k of [-hl / 2, hl / 2]) {
      const kk = Math.round(k), c = P(kk, s * (L + .3)), i = sp.idx(kk), yaw = Math.atan2(tr.tx[i], tr.tz[i]);
      B.add(torusGeo(1, .09, 6, 24, Math.PI), mat(STYLE.stone.cap), M(c.x, c.y - th - ar * .55 + .3, c.z, yaw + Math.PI / 2, ar, ar * .55, 8));
    }
  }

  // railings
  const railM = sp.d.style === 'ice' ? mat(st.rail, { roughness: .1, metalness: .2, transparent: true, opacity: .85 }) : gloss(st.rail);
  const postG = rboxGeo(.6, 1, .6, .12, 2), railG = rboxGeo(.3, .35, 1, .1, 2);
  for (const s of [-1, 1]) {
    for (let n = 0; n < kd.length; n++) {
      const p = P(kd[n], s * (FENCE + .3));
      if (sp.d.style === 'stone') {
        if (n < kd.length - 1) B.add(rboxGeo(1, 1, 1, .15, 2), mat(STYLE.stone.rail), segM(p, P(kd[n + 1], s * (FENCE + .3)), 1, 1.4, 0, .7));
        if (n % 3 === 0) B.add(rboxGeo(1.3, 1, 1.3, .2, 2), mat(STYLE.stone.cap), M(p.x, p.y + 1.1, p.z, 0, 1, 1.9, 1));
      } else {
        B.add(postG, railM, M(p.x, p.y + .8, p.z, 0, 1, 1.7, 1));
        if (sp.d.style === 'ice' && n % 2 === 0) B.add(ballGeo(.45, 10), mat('#ffffff'), M(p.x, p.y + 1.8, p.z));
        if (n < kd.length - 1) { const q = P(kd[n + 1], s * (FENCE + .3)); for (const hy of [.75, 1.45]) B.add(railG, railM, segM(p, q, 1, 1, 0, hy)); }
      }
    }
  }
  // icicles hanging from an ice bridge
  if (sp.d.style === 'ice') for (const k of kd) for (const s of [-1, 1]) {
    if (rand() < .4) continue;
    const p = P(k + (rand() - .5) * step, s * (L + .1), -th);
    const h = .8 + rand() * 1.8;
    B.add(coneGeo(.28, 1, 6), mat('#e6f7ff', { roughness: .1 }), M(p.x, p.y - h / 2, p.z, 0, 1, h, 1, Math.PI));
  }
  // covered bridge: walls with windows, roof, portals
  if (sp.d.style === 'covered') {
    const wallM = mat(STYLE.covered.rail, { roughness: .8 }), trimM = mat(STYLE.covered.cap), roofM = mat('#5e3a1a', { roughness: .9 });
    const W = FENCE + .6, wallH = 6.5, ang = .32, half = W / Math.cos(ang);
    for (let n = 0; n < kd.length - 1; n++) {
      const k0 = kd[n], k1 = kd[n + 1];
      for (const s of [-1, 1]) {
        const a = P(k0, s * W), b = P(k1, s * W);
        B.add(rboxGeo(1, 1, 1, .05, 1), wallM, segM(a, b, .4, 1.6, 0, .8));
        B.add(rboxGeo(1, 1, 1, .05, 1), wallM, segM(a, b, .4, 1.6, 0, wallH - .8));
        B.add(rboxGeo(1, 1, 1, .05, 1), trimM, segM(a, b, .5, .3, 0, 1.7));
        B.add(rboxGeo(.5, 1, .5, .1, 1), wallM, M(a.x, a.y + wallH / 2, a.z, 0, 1, wallH, 1));
      }
      // roof slabs (rolled about the road axis)
      const a = P(k0, 0), b = P(k1, 0), ya = a.y + wallH + W * Math.tan(ang) / 2, yb = b.y + wallH + W * Math.tan(ang) / 2;
      for (const s of [-1, 1]) {
        const ca = PD(k0, s * W / 2, ya), cb = PD(k1, s * W / 2, yb);
        B.add(rboxGeo(1, 1, 1, .08, 1), roofM, segM(ca, cb, half + 1.2, .5, s * ang, 0));
      }
      B.add(rboxGeo(1, 1, 1, .1, 1), trimM, segM(PD(k0, 0, a.y + wallH + W * Math.tan(ang) + .2), PD(k1, 0, b.y + wallH + W * Math.tan(ang) + .2), .8, .5));
    }
    // portals with a gable sign at each end
    for (const e of [-hl, hl]) {
      const c = P(e, 0), i = sp.idx(e), yaw = Math.atan2(tr.tx[i], tr.tz[i]);
      const gable = new THREE.Shape(); gable.moveTo(-W - .8, 0); gable.lineTo(0, W * Math.tan(ang) + .6); gable.lineTo(W + .8, 0); gable.lineTo(-W - .8, 0);
      const gm = new THREE.Mesh(new THREE.ShapeGeometry(gable), mat(STYLE.covered.rail, { side: DS }));
      gm.position.set(c.x, c.y + wallH, c.z); gm.rotation.y = yaw; gm.castShadow = true; g.add(gm);
      B.add(rboxGeo(1, 1, 1, .1, 1), wallM, M(c.x, c.y + wallH - .9, c.z, yaw, 2 * W + 1, 1.8, .8));
      const tex = boardTex(sp.d.sign || 'COVERED BRIDGE', '#fff1d6', '#5e3a1a', 512, 128); tr.own.push(tex);
      const sm = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.5), new THREE.MeshStandardMaterial({ map: tex, side: DS, roughness: .6 }));
      sm.position.set(c.x - Math.sin(yaw) * .5 * Math.sign(e), c.y + wallH + 1.8, c.z - Math.cos(yaw) * .5 * Math.sign(e)); sm.rotation.y = yaw; g.add(sm);
    }
  }
  B.flush(g);
}

// ------------------------------------------------------------------ river / chasm along a span
export function buildWater(tr, river) {
  const { pts, w, type } = river;
  if (type === 'chasm') return;
  const ice = type === 'ice';
  let material;
  if (ice) material = mat('#7fc6ef', { roughness: .05, metalness: .3, emissive: '#2f9bff', emissiveIntensity: .12 });
  else {
    const tex = tr.T.water.clone(); tex.needsUpdate = true; tex.repeat.set(1, 1); tr.own.push(tex);
    material = new THREE.MeshStandardMaterial({ map: tex, roughness: .08, metalness: .2, transparent: true, opacity: .93 });
    tr.anim.push(dt => { tex.offset.y -= dt * .25; });
  }
  const rows = [];
  for (let n = 0; n < pts.length; n++) {
    const p = pts[n], q = pts[Math.min(pts.length - 1, n + 1)], o = pts[Math.max(0, n - 1)];
    let dx = q[0] - o[0], dz = q[1] - o[1]; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
    const ww = w * .95 * (n === 0 || n === pts.length - 1 ? .6 : 1);
    const y = p[3];
    rows.push([new THREE.Vector3(p[0] - dz * ww, y, p[1] + dx * ww), new THREE.Vector3(p[0] + dz * ww, y, p[1] - dx * ww)]);
  }
  const m = sheet(rows, material, [w * 2, w * 2]); m.castShadow = false; tr.group.add(m);
  for (const lk of river.lakes || []) {
    const disc = new THREE.Mesh(new THREE.CircleGeometry(lk.r * .92, 40).rotateX(-Math.PI / 2), material);
    disc.position.set(lk.x, lk.y, lk.z); disc.receiveShadow = true; tr.group.add(disc);
  }
}

// ------------------------------------------------------------------ ramp builder
export function buildRamp(tr, r) {
  const g = tr.group, B = new Inst();
  const topTex = r.boost ? tr.T.boost : rampTex(); if (!r.boost) tr.own.push(topTex);
  const topM = new THREE.MeshStandardMaterial({ map: topTex, roughness: .5, emissive: r.boost ? '#ff8a00' : '#000000', emissiveIntensity: r.boost ? .4 : 0, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  const ns = 8, nl = 4, rows = [];
  for (let a = 0; a <= ns; a++) {
    const s = r.len * a / ns, row = [];
    for (let b = 0; b <= nl; b++) {
      const l = r.lat + r.hw - 2 * r.hw * b / nl, [x, z] = r.pt(Math.min(s, r.len - .01), l);
      row.push(new THREE.Vector3(x, tr.terrainH(x, z) + .16, z));
    }
    rows.push(row);
  }
  // uv: u across, v along (chevrons point along travel)
  const top = sheet(rows, topM, [Math.max(4, r.hw * 2 / 3), r.len / 2]); g.add(top);
  const sideTex = stripeTex(); tr.own.push(sideTex);
  const sideM = new THREE.MeshStandardMaterial({ map: sideTex, roughness: .6, side: DS });
  for (const side of [1, -1]) {
    const l = r.lat + side * r.hw, srows = [];
    for (let a = 0; a <= ns; a++) { const [x, z] = r.pt(Math.min(r.len * a / ns, r.len - .01), l); srows.push([new THREE.Vector3(x, tr.terrainH(x, z) + .06, z), new THREE.Vector3(x, tr.groundAt(x, z) - .1, z)]); }
    g.add(sheet(srows, sideM, [2, 2]));
  }
  // lip face
  const lip = [];
  for (let b = 0; b <= nl; b++) { const l = r.lat + r.hw - 2 * r.hw * b / nl, [x, z] = r.pt(r.len - .01, l); lip.push([new THREE.Vector3(x, tr.terrainH(x, z) + .06, z), new THREE.Vector3(x, tr.groundAt(x, z) - .1, z)]); }
  g.add(sheet(lip, sideM, [2, 2]));
  // flag posts at the lip corners
  const yaw = Math.atan2(r.tx, r.tz);
  for (const side of [1, -1]) {
    const [x, z] = r.pt(r.len + .4, r.lat + side * (r.hw + .6)), y = tr.groundAt(x, z);
    B.add(cylGeo(.12, .12, 1, 8), mat('#fbfbf6'), M(x, y + 2.5, z, 0, 1, 5, 1));
    B.add(coneGeo(.7, 1, 3), gloss(r.boost ? PAL.orange : PAL.red), M(x + Math.sin(yaw + Math.PI / 2) * .5 * side, y + 4.6, z + Math.cos(yaw + Math.PI / 2) * .5 * side, yaw, .5, 1.4, .3, 0, Math.PI / 2 * side));
    B.add(ballGeo(.25, 10), gloss(PAL.yellow), M(x, y + 5.1, z));
  }
  B.flush(g);
}

// ------------------------------------------------------------------ river / chasm planning
/** walk out from the span centre in both perpendicular directions, keeping clear of the rest of the road */
export function planRiver(tr, sp, rv) {
  const i = sp.ic, cx = tr.px[i], cz = tr.pz[i], nx = -tr.tz[i], nz = tr.tx[i];
  const w = rv.w ?? 10, bank = rv.bank ?? 7;
  const clear = w + bank + FENCE + 4;
  const far = (x, z) => {
    let bd = Infinity;
    for (let j = 0; j < tr.N; j += 2) { const k = sp.kOf(j); if (k !== null && Math.abs(k) < sp.H + 20) continue; const d = (x - tr.px[j]) ** 2 + (z - tr.pz[j]) ** 2; if (d < bd) bd = d; }
    return Math.sqrt(bd);
  };
  const out = [];
  const inDir = tr.insideLoop(cx + nx * 30, cz + nz * 30) ? 1 : -1;
  for (const dir of [-1, 1]) {
    const pts = [];
    const max = dir === inDir ? (rv.in ?? 120) : (rv.out ?? 160);
    const ph = rand() * 6, wig = rv.wiggle ?? 6;
    for (let s = 0; s <= max; s += 4) {
      const off = s > 20 ? Math.sin(s * .035 + ph) * wig * Math.min(1, (s - 20) / 30) : 0;
      const x = cx + nx * dir * s + tr.tx[i] * off, z = cz + nz * dir * s + tr.tz[i] * off;
      if (s > hwClear(sp) && (far(x, z) < clear || Math.hypot(x - tr.cx, z - tr.cz) > (rv.maxR ?? 380))) break;
      pts.push([x, z]);
    }
    out.push(pts);
  }
  // join both halves into one centre line from end A to end B
  const line = [...out[0].reverse(), ...out[1].slice(1)];
  return { line, w, bank, nx, nz, cx, cz, inDir, nA: out[0].length };
}
const hwClear = sp => sp.hw + 4;
export { Inst, segM, M, sheet };
