// Generic circuit builder. A map definition (maps.js) supplies the layout,
// terrain, theme, hazards and scenery; this builds the road, ground, fences,
// start arch, lights and sky, and answers spatial queries for physics/AI.
import * as THREE from 'three';
import { mat, gloss, rbox, rboxGeo, ball, cyl, mesh, prefab, instanced, trs, PAL, INK } from './geo.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeHayBale, makePumpkin, makeSnowman, makeRock, makeCow, makeSheep, makePig, makeTumbleweed } from './models.js';
import { rand, seed, groundTex, roadTex, patchTex, bannerTex, signTex } from './textures.js';
import { HALF_W, FENCE } from './dims.js';
import { Carves, Span, Ramp, buildSpan, buildWater, buildRamp, planRiver, sstep } from './features.js';
import { buildHazards } from './hazards.js';
import { slimRig } from './props.js';
export { HALF_W, FENCE };

// live binding: the active map swaps the terrain function
export let terrainH = () => 0;

export class Track {
  constructor(scene, T, def) {
    this.scene = scene; this.T = T; this.def = def;
    this.theme = def.theme;
    this.group = new THREE.Group(); scene.add(this.group);
    this.own = []; // textures to dispose
    seed(def.seed || 4242);
    const t = def.terrain;
    const base = this.base = (x, z) => t.amp * (2.4 * Math.sin(x * 0.017 * t.freq + t.ph) * Math.cos(z * 0.02 * t.freq)
      + 1.3 * Math.sin((x - z) * 0.011 * t.freq + 1.3) + 0.6 * Math.sin(x * 0.05) * Math.sin(z * 0.045));
    this.carves = new Carves();
    this.groundAt = (x, z) => base(x, z) - this.carves.at(x, z);
    this.terrainH = (x, z) => this.surface(x, z);
    terrainH = base;
    this.anim = [];
    this.hazards = []; this.fenceGaps = []; this.batch = new Map();
    this.buildCenterline();
    this.placed = [];
    this.planElevation();
    terrainH = this.terrainH;
    this.buildLights();
    this.buildTerrain();
    this.noRamps = true; this.buildRoad(); this.noRamps = false;
    this.placeFeatures();
    this.buildFences();
    this.buildStart();
    def.scenery(this, this.theme);
    this.flushBatch();
    this.buildSky();
  }

  dispose() {
    this.scene.remove(this.group, this.sky, this.hemi, this.sun, this.sun.target);
    const seen = new Set();
    const free = o => {
      if (o.geometry && !o.geometry.userData.shared && !seen.has(o.geometry)) { seen.add(o.geometry); o.geometry.dispose(); }
      if (o.isInstancedMesh) o.dispose();
    };
    this.group.traverse(free); this.sky.traverse(free);
    for (const t of this.own) t.dispose();
  }

  // ---------------------------------------------------------------- geometry
  buildCenterline() {
    const s = this.def.scale || 1;
    const curve = new THREE.CatmullRomCurve3(this.def.ctrl.map(([x, z]) => new THREE.Vector3(x * s, 0, z * s)), true, 'centripetal');
    const N = this.N = 1400;
    const pts = curve.getSpacedPoints(N);
    this.px = new Float32Array(N); this.pz = new Float32Array(N);
    this.tx = new Float32Array(N); this.tz = new Float32Array(N);
    for (let i = 0; i < N; i++) { this.px[i] = pts[i].x; this.pz[i] = pts[i].z; }
    let L = 0;
    for (let i = 0; i < N; i++) { const j = (i + 1) % N; L += Math.hypot(this.px[j] - this.px[i], this.pz[j] - this.pz[i]); }
    this.L = L; this.seg = L / N;
    for (let i = 0; i < N; i++) {
      const a = (i - 1 + N) % N, b = (i + 1) % N;
      const dx = this.px[b] - this.px[a], dz = this.pz[b] - this.pz[a], d = Math.hypot(dx, dz);
      this.tx[i] = dx / d; this.tz[i] = dz / d;
    }
    this.curv = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const a = (i - 8 + N) % N, b = (i + 8) % N;
      let d = Math.atan2(this.tx[b], this.tz[b]) - Math.atan2(this.tx[a], this.tz[a]);
      while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      this.curv[i] = d / (16 * this.seg);
    }
    this.cx = 0; this.cz = 0;
    for (let i = 0; i < N; i++) { this.cx += this.px[i] / N; this.cz += this.pz[i] / N; }
  }

  idxOf(frac) { return ((Math.round(frac * this.N) % this.N) + this.N) % this.N; }
  wrap(i) { return ((i % this.N) + this.N) % this.N; }
  at(i, lat = 0, out = new THREE.Vector3()) {
    i = this.wrap(i);
    const x = this.px[i] - this.tz[i] * lat, z = this.pz[i] + this.tx[i] * lat;
    return out.set(x, terrainH(x, z), z);
  }
  headingAt(i) { i = this.wrap(i); return Math.atan2(this.tx[i], this.tz[i]); }

  nearest(x, z, hint = -1, out = {}) {
    const N = this.N;
    let best = 0, bd = Infinity;
    if (hint < 0) {
      for (let i = 0; i < N; i += 4) { const d = (x - this.px[i]) ** 2 + (z - this.pz[i]) ** 2; if (d < bd) { bd = d; best = i; } }
      hint = best;
    }
    bd = Infinity;
    for (let k = -48; k <= 48; k++) {
      const i = (hint + k + N) % N;
      const d = (x - this.px[i]) ** 2 + (z - this.pz[i]) ** 2;
      if (d < bd) { bd = d; best = i; }
    }
    const dx = x - this.px[best], dz = z - this.pz[best];
    out.idx = best;
    out.lat = -dx * this.tz[best] + dz * this.tx[best];
    let f = (best * this.seg + dx * this.tx[best] + dz * this.tz[best]) / this.L; f -= Math.floor(f);
    out.frac = f;
    out.dist = Math.sqrt(bd);
    return out;
  }
  distToRoad(x, z, step = 3) {
    let bd = Infinity;
    for (let i = 0; i < this.N; i += step) { const d = (x - this.px[i]) ** 2 + (z - this.pz[i]) ** 2; if (d < bd) bd = d; }
    return Math.sqrt(bd);
  }
  insideLoop(x, z) {
    let inside = false;
    for (let i = 0, j = this.N - 5; i < this.N; j = i, i += 5) {
      const xi = this.px[i], zi = this.pz[i], xj = this.px[j], zj = this.pz[j];
      if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) inside = !inside;
    }
    return inside;
  }

  // ---------------------------------------------------------------- bridges, rivers, ramps
  planElevation() {
    const def = this.def;
    this.spans = []; this.ramps = []; this.rivers = [];
    for (const b of def.bridges || []) {
      const sp = new Span(this, b, this.base); this.spans.push(sp);
      const rv = b.river; if (!rv) continue;
      const pl = planRiver(this, sp, rv), line = pl.line, n = line.length;
      const depth = rv.depth ?? 5, type = rv.type || 'river', fill = type === 'chasm' ? .1 : depth * (type === 'ice' ? .72 : .62);
      const lakes = [];
      const endA = 0, endB = n - 1, innerEnd = pl.inDir < 0 ? endA : endB, outerEnd = innerEnd === endA ? endB : endA;
      const pts = line.map(([x, z], k) => {
        let sc = 1;
        if (type === 'chasm') sc = Math.min(1, .25 + .75 * Math.min(k, n - 1 - k) / 6);
        return [x, z, sc];
      });
      for (const [end, r] of [[innerEnd, rv.lakeIn], [outerEnd, rv.lakeOut]]) {
        if (!r || type === 'chasm') continue;
        const [x, z] = line[end];
        this.carves.bowl(x, z, r, depth, rv.bank ?? 7);
        lakes.push({ x, z, r, y: this.base(x, z) - depth + fill });
        this.placed.push({ x, z, r: r + 6 });
      }
      this.carves.path(pts, pl.w, depth, pl.bank);
      for (const [x, z] of line) this.placed.push({ x, z, r: pl.w + pl.bank * .6 });
      this.rivers.push({ type, w: pl.w, depth, pts: pts.map(([x, z]) => [x, z, 0, this.base(x, z) - depth + fill]), lakes, span: sp, line, inner: line[innerEnd], outer: line[outerEnd] });
      sp.river = this.rivers[this.rivers.length - 1];
    }
    for (const r of def.ramps || []) this.ramps.push(new Ramp(this, r));
  }
  surface(x, z) {
    let h = this.groundAt(x, z);
    for (const s of this.spans) {
      if (x < s.x0 || x > s.x1 || z < s.z0 || z > s.z1) continue;
      const o = s.local(x, z);
      if (Math.abs(o.lat) > s.hw || Math.abs(o.kf) > s.H) continue;
      const w = s.w(o.kf); if (w > 0) h += (s.D(o.kf) - h) * w;
    }
    if (!this.noRamps) for (const r of this.ramps) if (x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) h += r.height(x, z);
    return h;
  }
  /** the span whose deck covers track index i (or null) */
  deckAt(i) { for (const s of this.spans) { const k = s.kOf(i); if (k !== null && Math.abs(k) <= s.hl + 1) return s; } return null; }
  /** is track index i near a bridge, ramp or hazard (for validation of other features)? */
  busyAt(i, m = 10) {
    const w = Math.round(m / this.seg), near = j => { let d = Math.abs(i - j); d = Math.min(d, this.N - d); return d; };
    for (const s of this.spans) if (near(s.ic) <= s.H + w) return 'bridge';
    for (const r of this.ramps) if (near(r.i) <= w + Math.round(45 / this.seg) && this.wrap(i - r.i) < this.N / 2) return 'ramp';
    return null;
  }

  buildLights() {
    const th = this.theme;
    this.hemi = new THREE.HemisphereLight(th.hemi[0], th.hemi[1], th.hemiI ?? 1.3);
    this.sun = new THREE.DirectionalLight(th.sun, th.sunI ?? 2.4);
    this.sunDir = new THREE.Vector3(...(th.sunDir || [.55, .8, .35])).normalize();
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -.0005; this.sun.shadow.normalBias = .4; this.sun.shadow.radius = 3;
    Object.assign(this.sun.shadow.camera, { left: -75, right: 75, top: 75, bottom: -75, near: 1, far: 400 });
    this.sun.shadow.camera.updateProjectionMatrix();
    this.scene.add(this.hemi, this.sun, this.sun.target);
    this.scene.fog = new THREE.Fog(th.fog, th.fogNear ?? 160, th.fogFar ?? 620);
  }
  /** aim the shadow frustum at a point (called per viewport) */
  focusShadow(x, y, z) {
    this.sun.target.position.set(x, y, z);
    this.sun.position.set(x + this.sunDir.x * 200, y + this.sunDir.y * 200, z + this.sunDir.z * 200);
    this.sun.target.updateMatrixWorld();
  }

  buildTerrain() {
    const th = this.theme;
    const size = 1100, segs = 256;
    const geo = new THREE.PlaneGeometry(size, size, segs, segs);
    geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    const colors = new Float32Array(p.count * 3);
    const c1 = new THREE.Color(th.tint[0]), c2 = new THREE.Color(th.tint[1]), c = new THREE.Color(), bk = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) + this.cx, z = p.getZ(i) + this.cz;
      p.setX(i, x); p.setZ(i, z);
      const r = Math.hypot(x - this.cx, z - this.cz);
      const cv = this.carves.at(x, z);
      let y = this.base(x, z) - cv + Math.min(55, Math.max(0, r - 340) ** 1.5 * .018);
      // keep the ground under bridge decks and their approaches
      for (const sp of this.spans) {
        if (x < sp.x0 - 6 || x > sp.x1 + 6 || z < sp.z0 - 6 || z > sp.z1 + 6) continue;
        const o = sp.local(x, z);
        if (Math.abs(o.kf) > sp.H || Math.abs(o.lat) > sp.hw + 6) continue;
        const w = sp.w(o.kf), tgt = y + (sp.D(o.kf) - y) * w - .5 - Math.max(0, Math.abs(o.lat) - sp.hw) * .4;
        if (y > tgt) y = tgt;
      }
      p.setY(i, y);
      c.copy(c1).lerp(c2, .5 + .5 * Math.sin(x * .02 + Math.sin(z * .017) * 2) * Math.cos(z * .023));
      if (cv > .3) {
        if (th.strata) { const b = th.strata[Math.floor(Math.max(0, cv) / 2.6) % th.strata.length]; bk.set(b); c.lerp(bk, sstep(.3, 2, cv)); }
        else { bk.set(th.bank || '#c9a76a'); c.lerp(bk, sstep(.3, 2.5, cv) * .9); }
      }
      colors.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const tex = groundTex(th.ground[0], th.ground[1]); tex.repeat.set(140, 140); this.own.push(tex);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, vertexColors: true, roughness: 1 }));
    m.receiveShadow = true;
    this.group.add(m);
    this.terrainMesh = m;
  }

  roadStrip(i0, count, lat0, lat1, material, yOff, vScale, cols = 4) {
    const pos = [], uv = [], idx = [];
    let v = 0;
    for (let k = 0; k <= count; k++) {
      const i = this.wrap(i0 + k);
      for (let c = 0; c <= cols; c++) {
        const lat = lat0 + (lat1 - lat0) * c / cols;
        const x = this.px[i] - this.tz[i] * lat, z = this.pz[i] + this.tx[i] * lat;
        pos.push(x, terrainH(x, z) + yOff, z);
        uv.push(c / cols, v);
      }
      v += this.seg / vScale;
    }
    for (let k = 0; k < count; k++) for (let c = 0; c < cols; c++) {
      const a = k * (cols + 1) + c, b = a + cols + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, material);
    m.receiveShadow = true;
    this.group.add(m);
    return m;
  }

  buildRoad() {
    const th = this.theme;
    const tex = roadTex(th.road); this.own.push(tex);
    const road = new THREE.MeshStandardMaterial({ map: tex, roughness: th.roadRough ?? .95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    this.roadStrip(0, this.N, HALF_W, -HALF_W, road, .14, 14, 6);
    const verge = new THREE.MeshStandardMaterial({ color: th.verge, roughness: 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    this.roadStrip(0, this.N, FENCE + .5, HALF_W, verge, .08, 10, 2);
    this.roadStrip(0, this.N, -HALF_W, -FENCE - .5, verge, .08, 10, 2);
    // rounded curb blocks along both edges
    const step = Math.max(1, Math.round(1.6 / this.seg)), n = Math.floor(this.N / step), len = step * this.seg;
    const geo = rboxGeo(+(len * .92).toFixed(2), .25, .9, .1, 1);
    const mA = [], mB = [];
    for (let k = 0; k < n; k++) {
      const i = k * step + (step >> 1);
      const yaw = Math.atan2(this.tx[i], this.tz[i]) + Math.PI / 2;
      for (const side of [-1, 1]) {
        const p = this.at(i, side * (HALF_W - .2));
        (k % 2 ? mA : mB).push(trs(p.x, p.y + .2, p.z, yaw));
      }
    }
    this.group.add(instanced([{ geo, material: gloss(th.curb[0]) }], mA, { shadow: false }));
    this.group.add(instanced([{ geo, material: gloss(th.curb[1]) }], mB, { shadow: false }));
  }

  conformPlane(cx, cz, w, h, rot, material, yOff = .2, segs = 8) {
    const g = new THREE.PlaneGeometry(w, h, segs, segs);
    g.rotateX(-Math.PI / 2); g.rotateY(rot);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i) + cx, z = p.getZ(i) + cz; p.setXYZ(i, x, terrainH(x, z) + yOff, z); }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, material); m.receiveShadow = true;
    this.group.add(m);
    return m;
  }

  straightNear(frac, window = .04) {
    const i0 = this.idxOf(frac), w = Math.round(window * this.N);
    let best = i0, bc = Infinity;
    for (let k = -w; k <= w; k++) { const i = this.wrap(i0 + k); let c = 0; for (let j = -20; j <= 20; j += 5) c += Math.abs(this.curv[this.wrap(i + j)]); if (c < bc) { bc = c; best = i; } }
    return best;
  }

  placeFeatures() {
    const T = this.T, def = this.def;
    // boost pads
    this.boostPads = [];
    const boostMat = new THREE.MeshStandardMaterial({ map: T.boost, emissive: '#ff8a00', emissiveIntensity: .45, roughness: .4, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
    this.boostTex = T.boost;
    for (const [f, lat] of def.boosts) {
      const i = this.straightNear(f), len = Math.round(7 / this.seg);
      this.roadStrip(i - (len >> 1), len, lat + 2.2, lat - 2.2, boostMat, .3, 7, 2);
      this.boostPads.push({ i0: this.wrap(i - (len >> 1)), len, lat });
    }
    // slow / slippery patches
    this.patches = [];
    const pt = patchTex(def.patches.type); this.own.push(pt);
    const pm = new THREE.MeshStandardMaterial({ map: pt, transparent: true, roughness: def.patches.type === 'ice' ? .1 : .5, metalness: def.patches.type === 'ice' ? .2 : 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
    for (const [f, lat, r] of def.patches.list) {
      const p = this.at(this.idxOf(f), lat);
      this.conformPlane(p.x, p.z, r * 2.3, r * 2.3, rand() * 6, pm, .3);
      this.patches.push({ x: p.x, z: p.z, r, type: def.patches.type });
    }
    // bridges, rivers, ramps and moving hazards
    for (const sp of this.spans) buildSpan(this, sp);
    for (const rv of this.rivers) buildWater(this, rv);
    for (const r of this.ramps) buildRamp(this, r);
    buildHazards(this, def.hazards);
    // item box rows
    this.itemSpots = [];
    for (const f of def.items) {
      const i = this.straightNear(f, .02);
      for (const lat of [-6.5, -2.2, 2.2, 6.5]) { const p = this.at(i, lat); this.itemSpots.push({ x: p.x, y: p.y, z: p.z }); }
    }
    // obstacles on the road
    this.colliders = [];
    const make = { hay: makeHayBale, pumpkin: () => makePumpkin(1.7), snowman: makeSnowman, rock: () => makeRock('#c98a5a', 1.3) }[def.obstacles.type];
    for (const [f, lat] of def.obstacles.list) {
      const i = this.idxOf(f), p = this.at(i, lat);
      const o = make(); o.position.copy(p); o.rotation.y = this.headingAt(i) + Math.PI / 2 + (rand() - .5) * .5;
      o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
      this.group.add(o);
      this.colliders.push({ x: p.x, z: p.z, r: 1.7 });
    }
    // animals / tumbleweeds crossing the road
    const C = def.crossers;
    this.crossIdx = this.straightNear(C.at, .03);
    this.crossers = [];
    const mk = { cow: () => makeCow(1.15), sheep: () => makeSheep(1.1), pig: () => makePig(1.1), tumbleweed: () => makeTumbleweed(1.2) }[C.type];
    for (let k = 0; k < (C.count || 3); k++) {
      const a = mk();
      slimRig(a.group, [a.body, a.head, a.tail, a.roll, ...a.legs]);
      const i = this.wrap(this.crossIdx + Math.round((k - 1) * 6 / this.seg));
      this.group.add(a.group);
      this.crossers.push({ a, i, lat: (k - 1) * 9, dir: k % 2 ? 1 : -1, wait: rand() * 2, speed: (C.speed || 2.6) * (.8 + rand() * .5), phase: rand() * 6, x: 0, z: 0, r: C.type === 'tumbleweed' ? 1.4 : 1.9, sndT: 3 + rand() * 6, roll: C.type === 'tumbleweed' });
    }
    // warning signs
    const sign = signTex(C.sign); this.own.push(sign);
    for (const d of [-1, 1]) {
      const i = this.wrap(this.crossIdx - d * Math.round(32 / this.seg));
      this.signPost(this.at(i, d * (FENCE + 1.5)), this.headingAt(i) + (d < 0 ? 0 : Math.PI), sign, 4);
    }
    // chevrons on sharp corners
    const chevMat = new THREE.MeshStandardMaterial({ map: T.chevron, roughness: .5 });
    for (let i = 0; i < this.N; i += 6) {
      const c = this.curv[i];
      if (Math.abs(c) > .028 && Math.abs(c) >= Math.abs(this.curv[this.wrap(i - 6)]) && Math.abs(c) >= Math.abs(this.curv[this.wrap(i + 6)])) {
        const side = c > 0 ? 1 : -1;
        for (const k of [-14, 0, 14]) {
          const j = this.wrap(i + k), p = this.at(j, side * (FENCE + .3));
          const board = new THREE.Group(); board.position.copy(p); board.rotation.y = this.headingAt(j) + Math.PI;
          rbox(4, 2, .25, chevMat, .08, board, 0, 1.7, 0); if (side > 0) board.rotation.y += Math.PI;
          rbox(.25, 1.4, .25, mat(PAL.woodD), .05, board, 0, .5, 0);
          board.updateMatrix(); this.addBatch(board, board.matrix.clone()); board.position.set(0, 0, 0); board.rotation.set(0, 0, 0);
        }
      }
    }
  }

  signPost(p, rot, tex, size = 3) {
    const g = new THREE.Group(); g.position.copy(p); g.rotation.y = rot;
    rbox(.3, 4, .3, mat(PAL.wood), .08, g, 0, 2, 0);
    const b = rbox(size, size, .2, new THREE.MeshStandardMaterial({ map: tex, roughness: .5 }), .1, g, 0, 4 + size / 2 - .5, 0);
    b.rotation.z = Math.PI / 4;
    g.updateMatrix(); const m4 = g.matrix.clone(); g.position.set(0, 0, 0); g.rotation.set(0, 0, 0);
    this.addBatch(g, m4);
    return g;
  }

  addShadow(x, z, size) {
    if (!this.shadowMat) this.shadowMat = new THREE.MeshBasicMaterial({ map: this.T.shadow, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6 });
    if (!this.shadowGeo) { this.shadowGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2); this.shadowGeo.userData.shared = true; }
    const m = new THREE.Mesh(this.shadowGeo, this.shadowMat);
    m.scale.set(size, 1, size);
    m.position.set(x, terrainH(x, z) + .25, z);
    this.group.add(m);
    return m;
  }

  buildFences() {
    const posts = [], rails = [];
    const step = Math.max(1, Math.round(3 / this.seg));
    const crossS = this.crossIdx * this.seg;
    for (const side of [-1, 1]) {
      let prev = null;
      for (let i = 0; i < this.N; i += step) {
        const s = i * this.seg;
        let ds = Math.abs(s - crossS); ds = Math.min(ds, this.L - ds);
        const p = this.at(i, side * FENCE);
        let ok = ds > 9 && s > 4 && s < this.L - 4 && !this.deckAt(i);
        for (const gp of this.fenceGaps) { if (gp.side && gp.side !== side) continue; let d = Math.abs(i - gp.i); d = Math.min(d, this.N - d) * this.seg; if (d < gp.half) ok = false; }
        if (ok) {
          const n = this.nearest(p.x, p.z, -1);
          let di = Math.abs(n.idx - i); di = Math.min(di, this.N - di);
          if (di > 60 && n.dist < FENCE + 2) ok = false;
        }
        if (ok) { posts.push(trs(p.x, p.y + 1, p.z, this.headingAt(i))); if (prev) rails.push([prev, p.clone()]); prev = p.clone(); }
        else prev = null;
      }
    }
    const col = mat(this.theme.fence);
    this.group.add(instanced([{ geo: rboxGeo(.4, 2, .4, .1, 1), material: col }], posts));
    const railGeo = rboxGeo(.18, .28, 1, .07, 1);
    const ms = [];
    for (const [a, b] of rails) {
      const len = a.distanceTo(b), yaw = Math.atan2(b.x - a.x, b.z - a.z), pitch = -Math.asin((b.y - a.y) / len);
      for (const hgt of [.7, 1.5]) ms.push(trs((a.x + b.x) / 2, (a.y + b.y) / 2 + hgt, (a.z + b.z) / 2, yaw, [1, 1, len], pitch));
    }
    this.group.add(instanced([{ geo: railGeo, material: col }], ms));
  }

  buildStart() {
    const ck = this.T.checker.clone(); ck.needsUpdate = true; this.own.push(ck);
    const m = new THREE.MeshStandardMaterial({ map: ck, roughness: .7, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
    const len = Math.round(2.4 / this.seg);
    this.roadStrip(this.N - len, len, HALF_W, -HALF_W, m, .26, 2.4, 2);
    const g = new THREE.Group();
    g.position.copy(this.at(0, 0)); g.rotation.y = this.headingAt(0); this.group.add(g);
    const post = gloss(this.theme.arch || PAL.red);
    for (const s of [-1, 1]) {
      rbox(1.4, 10, 1.4, post, .35, g, s * (HALF_W + 1.6), 5, 0);
      ball(1, gloss(PAL.yellow), g, s * (HALF_W + 1.6), 10.4, 0, 18);
    }
    const ban = bannerTex(this.def.name, this.theme.arch || PAL.red); this.own.push(ban);
    const bm = new THREE.MeshStandardMaterial({ map: ban, roughness: .5 });
    const b = rbox(2 * HALF_W + 4.6, 2.8, .5, post, .2, g, 0, 8.6, 0);
    for (const z of [.27, -.27]) { const f = mesh(new THREE.PlaneGeometry(2 * HALF_W + 4, 2.4), bm, 0, 8.6, z, g); if (z < 0) f.rotation.y = Math.PI; f.castShadow = false; }
    b.castShadow = true;
    const flags = [PAL.red, PAL.yellow, PAL.blue, PAL.green];
    for (let k = -8; k <= 8; k++) {
      const f = mesh(new THREE.ConeGeometry(.35, .8, 3), mat(flags[(k + 8) % 4]), k * 1.3, 6.8 - Math.cos(k / 8 * 1.2) * .6, 0, g);
      f.rotation.x = Math.PI;
    }
  }

  // ---------------------------------------------------------------- scenery toolkit for maps
  clearOf(x, z, r) { return this.distToRoad(x, z) > FENCE + 3 + r && this.placed.every(o => (o.x - x) ** 2 + (o.z - z) ** 2 > (o.r + r) ** 2); }
  spot(x, z, r) {
    for (let k = 0; k < 400; k++) {
      const a = k * 2.4, d = k * .9, xx = x + Math.cos(a) * d, zz = z + Math.sin(a) * d;
      if (this.clearOf(xx, zz, r)) { this.placed.push({ x: xx, z: zz, r }); return [xx, zz]; }
    }
    return null;
  }
  facing(x, z) { const n = this.nearest(x, z, -1); return Math.atan2(this.px[n.idx] - x, this.pz[n.idx] - z); }
  /** place a landmark near (x,z); merged into few draw calls unless keep=true */
  place(obj, x, z, r, { face = true, rot = 0, keep = false, y = -.2 } = {}) {
    const s = this.spot(x, z, r); if (!s) return null;
    const ry = (face ? this.facing(s[0], s[1]) : 0) + rot;
    if (keep) {
      obj.position.set(s[0], this.groundAt(s[0], s[1]) + y, s[1]); obj.rotation.y = ry;
      obj.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
      this.group.add(obj);
      return obj;
    }
    this.addBatch(obj, trs(s[0], this.groundAt(s[0], s[1]) + y, s[1], ry));
    return { position: new THREE.Vector3(s[0], 0, s[1]) };
  }
  /** scatter instances of a prefab; sampler() returns [x,z] candidates */
  scatter(obj, count, sampler, { r = 2, scale = [.8, 1.2], tries = 6, shadow = true, reserve = true, y = -.15, minRoad = 0 } = {}) {
    const parts = prefab(obj), ms = [];
    for (let k = 0; k < count * tries && ms.length < count; k++) {
      const [x, z] = sampler();
      if (minRoad ? this.distToRoad(x, z) < minRoad : !this.clearOf(x, z, r)) continue;
      if (minRoad && !this.placed.every(o => (o.x - x) ** 2 + (o.z - z) ** 2 > (o.r + r) ** 2)) continue;
      if (reserve) this.placed.push({ x, z, r });
      if (this.carves.at(x, z) > .2) continue;
      ms.push(trs(x, this.groundAt(x, z) + y, z, rand() * Math.PI * 2, scale[0] + rand() * (scale[1] - scale[0])));
    }
    this.group.add(instanced(parts, ms, { shadow }));
    return ms.length;
  }
  /** merge a static prop into per-material, per-area batches (few draw calls, still frustum culled) */
  addBatch(obj, matrix) {
    for (const { material, geo } of prefab(obj)) {
      const g = geo.clone(); g.applyMatrix4(matrix);
      const c = g.boundingSphere || (g.computeBoundingSphere(), g.boundingSphere);
      const key = material.uuid + ':' + Math.floor(c.center.x / 160) + ',' + Math.floor(c.center.z / 160);
      let e = this.batch.get(key); if (!e) { e = { material, list: [] }; this.batch.set(key, e); }
      e.list.push(g); geo.dispose();
    }
  }
  flushBatch() {
    for (const { material, list } of this.batch.values()) {
      const m = new THREE.Mesh(list.length > 1 ? mergeGeometries(list) : list[0], material);
      if (list.length > 1) list.forEach(g => g.dispose());
      m.castShadow = true; m.receiveShadow = true; this.group.add(m);
    }
    this.batch.clear();
  }
  /** place an object at an exact spot (no clearance search), batched unless keep */
  put(obj, x, z, ry = 0, { keep = false, y = 0, r = 0 } = {}) {
    if (r) this.placed.push({ x, z, r });
    const gy = this.groundAt(x, z) + y;
    if (keep) { obj.position.set(x, gy, z); obj.rotation.y = ry; obj.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); this.group.add(obj); return obj; }
    this.addBatch(obj, trs(x, gy, z, ry));
    return null;
  }
  /** world point beside the road at fraction f, lateral lat */
  side(f, lat) { const i = this.idxOf(f); return [this.px[i] - this.tz[i] * lat, this.pz[i] + this.tx[i] * lat, this.headingAt(i)]; }

  ring(rMin, rMax) { return () => { const a = rand() * Math.PI * 2, r = rMin + rand() * (rMax - rMin); return [this.cx + Math.cos(a) * r * 1.1, this.cz + Math.sin(a) * r]; }; }
  rect(x0, z0, x1, z1) { return () => [x0 + rand() * (x1 - x0), z0 + rand() * (z1 - z0)]; }
  infield(pad = 0) {
    return () => {
      for (let k = 0; k < 40; k++) { const x = this.cx + (rand() - .5) * 300, z = this.cz + (rand() - .5) * 300; if (this.insideLoop(x, z)) return [x, z]; }
      return [1e5, 1e5];
    };
  }
  pond(x, z, r, { ice = false } = {}) {
    const s = this.spot(x, z, r + 2); if (!s) return;
    [x, z] = s;
    const y = terrainH(x, z);
    const w = new THREE.Mesh(new THREE.CircleGeometry(r, 40).rotateX(-Math.PI / 2),
      ice ? mat('#cdeeff', { roughness: .08, metalness: .25 }) : new THREE.MeshStandardMaterial({ map: this.T.water, roughness: .08, metalness: .2, transparent: true, opacity: .93 }));
    w.position.set(x, y + .35, z); w.receiveShadow = true; this.group.add(w);
    if (!ice) { this.T.water.repeat.set(3, 3); this.waterTex = this.T.water; }
    const shore = new THREE.Mesh(new THREE.RingGeometry(r - .5, r + 2.2, 40).rotateX(-Math.PI / 2), mat(this.theme.shore || '#e8cf8f'));
    shore.position.set(x, y + .3, z); shore.receiveShadow = true; this.group.add(shore);
    return [x, z, y];
  }
  hills(cols) {
    for (let k = 0; k < 26; k++) {
      const a = k / 26 * Math.PI * 2 + rand() * .2, r = 520 + rand() * 60;
      const h = mesh(new THREE.SphereGeometry(70 + rand() * 50, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), mat(cols[k % cols.length], { roughness: 1 }),
        this.cx + Math.cos(a) * r, 0, this.cz + Math.sin(a) * r, this.group);
      h.scale.y = .45 + rand() * .3; h.castShadow = false;
    }
  }
  clouds(col = '#ffffff', n = 18) {
    this.cloudList = [];
    const cm = mat(col, { roughness: 1, emissive: col, emissiveIntensity: .3 });
    for (let k = 0; k < n; k++) {
      const c = new THREE.Group();
      [[0, 0, 3], [2.8, -.4, 2.3], [-2.8, -.5, 2.2], [1.1, 1.3, 2.1], [-1.2, 1, 1.8]].forEach(([x, y, r]) => { const s = ball(r, cm, c, x, y, 0, 18); s.castShadow = false; });
      c.scale.setScalar(3 + rand() * 2.5);
      c.position.set(this.cx + (rand() - .5) * 800, 95 + rand() * 50, this.cz + (rand() - .5) * 800);
      this.group.add(c); this.cloudList.push(c);
    }
  }

  buildSky() {
    const [top, mid, bot] = this.theme.sky;
    const c = document.createElement('canvas'); c.width = 2; c.height = 256;
    const g = c.getContext('2d'), grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, top); grd.addColorStop(.42, mid); grd.addColorStop(.52, bot); grd.addColorStop(1, bot);
    g.fillStyle = grd; g.fillRect(0, 0, 2, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; this.own.push(t);
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, depthWrite: false }));
    this.sky.position.set(this.cx, 0, this.cz);
    const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(38, 32), new THREE.MeshBasicMaterial({ color: this.theme.sunDisc || '#fff3c0', fog: false }));
    sunDisc.position.copy(this.sunDir).multiplyScalar(820);
    sunDisc.lookAt(0, 0, 0);
    this.sky.add(sunDisc);
    this.scene.add(this.sky);
  }

  // ---------------------------------------------------------------- runtime
  surfaceAt(x, z, n) {
    for (const m of this.patches) if ((x - m.x) ** 2 + (z - m.z) ** 2 < (m.r * .85) ** 2) return m.type;
    for (const b of this.boostPads) {
      let di = n.idx - b.i0; if (di < 0) di += this.N;
      if (di <= b.len && Math.abs(n.lat - b.lat) < 2.4) return 'boost';
    }
    for (const r of this.ramps) if (r.boost && x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1 && r.height(x, z) > 0) return 'boost';
    if (Math.abs(n.lat) > HALF_W * .97) return this.deckAt(n.idx) ? 'road' : 'grass';
    return 'road';
  }

  update(dt, t, audio, listeners) {
    for (const f of this.anim) f(dt, t);
    for (const h of this.hazards) h.update(dt, t);
    this.boostTex.offset.y -= dt * 1.5;
    if (this.waterTex) { this.waterTex.offset.x += dt * .02; this.waterTex.offset.y += dt * .013; }
    if (this.cloudList) for (const c of this.cloudList) { c.position.x += dt * 3; if (c.position.x > this.cx + 450) c.position.x -= 900; }
    const edge = FENCE + 3;
    for (const s of this.crossers) {
      if (s.wait > 0) { s.wait -= dt; s.walking = false; }
      else {
        s.lat += s.dir * s.speed * dt * (s.roll ? 2.2 : 1); s.walking = true;
        if (Math.abs(s.lat) > edge) {
          if (s.roll) { s.lat = -Math.sign(s.lat) * edge; s.wait = 1 + rand() * 4; }
          else { s.lat = Math.sign(s.lat) * edge; s.dir *= -1; s.wait = 1.5 + rand() * 3.5; }
        }
      }
      const p = this.at(s.i, s.lat);
      s.x = p.x; s.z = p.z;
      const g = s.a.group;
      g.position.copy(p);
      const h = this.headingAt(s.i);
      if (s.roll) {
        g.rotation.y = h;
        s.a.roll.rotation.z -= s.dir * s.speed * 2.2 * dt / 1.3 * (s.walking ? 1 : 0);
        s.a.roll.position.y = 1.3 + Math.abs(Math.sin(t * 5 + s.phase)) * .5;
        g.visible = s.wait <= 0 || Math.abs(s.lat) < edge - .1;
      } else {
        const target = h + (s.dir > 0 ? -Math.PI / 2 : Math.PI / 2);
        let d = target - g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
        g.rotation.y += d * Math.min(1, dt * 4);
        animateCow(s.a, t + s.phase, s.walking, s.hit > 0);
        s.sndT -= dt;
        if (s.sndT < 0) { s.sndT = 6 + rand() * 8; if (this.def.crossers.type === 'cow') audio?.moo(p, listeners); }
      }
      if (s.hit > 0) s.hit -= dt;
    }
  }
}

export function animateCow(a, t, walking, startled = false, grazing = false) {
  if (!a.legs.length) return;
  const sw = walking ? Math.sin(t * 7) * .5 : 0;
  a.legs[0].rotation.x = sw; a.legs[3].rotation.x = sw;
  a.legs[1].rotation.x = -sw; a.legs[2].rotation.x = -sw;
  if (a.tail) a.tail.rotation.z = Math.sin(t * 2.3) * .35;
  if (a.head) a.head.rotation.x = grazing ? .6 + Math.sin(t * 2) * .1 : startled ? -.5 : Math.sin(t * .8) * .1;
  if (a.body) { a.body.userData.y0 ??= a.body.position.y; a.body.position.y = a.body.userData.y0 + (walking ? Math.abs(Math.sin(t * 7)) * .06 : Math.sin(t * 2) * .02); }
}
