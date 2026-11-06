// The four circuits. Each map = layout + terrain + theme + bridges/ramps + hazards + scenery.
import * as THREE from 'three';
import { PAL, INK, mat, gloss, ball, prefab, rboxGeo, coneGeo, cylGeo, ballGeo } from './geo.js';
import { FENCE, HALF_W, animateCow } from './track.js';
import { rand, bannerTex } from './textures.js';
import { Inst, segM, M } from './features.js';
import { SHAPE } from './particles.js';
import {
  makeTree, makePine, makeCactus, makeBush, makeRock, makeHayBale, makePumpkin, makeSnowman, makeBarn, makeSilo,
  makeFarmhouse, makeLogCabin, makeWindmill, makeWaterTower, makeMesa, makeTractor, makeScarecrow, makeFlower,
  makeSnowMound, makeLeafPile, makeCow, makeSheep, makePig,
} from './models.js';
import * as P from './props.js';

// ------------------------------------------------------------------ scenery helpers
// wandering animals that stay inside the loop
function grazers(tr, make, n) {
  const list = [];
  const samp = tr.infield();
  for (let k = 0; k < n; k++) {
    let s = null;
    for (let t = 0; t < 40 && !s; t++) { const [x, z] = samp(); if (tr.clearOf(x, z, 3)) s = [x, z]; }
    if (!s) continue;
    const a = make();
    P.slimRig(a.group, [a.body, a.head, a.tail, ...a.legs]);
    a.group.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    tr.group.add(a.group);
    list.push({ a, hx: s[0], hz: s[1], x: s[0], z: s[1], h: rand() * 6, mode: 'graze', t: rand() * 5, ph: rand() * 6 });
  }
  tr.anim.push((dt, t) => {
    for (const c of list) {
      c.t -= dt;
      if (c.t < 0) { if (c.mode === 'graze') { c.mode = 'walk'; c.t = 2 + rand() * 3; c.h += (rand() - .5) * 2.5; } else { c.mode = 'graze'; c.t = 3 + rand() * 6; } }
      if (c.mode === 'walk') {
        const nx = c.x + Math.sin(c.h) * dt * 1.5, nz = c.z + Math.cos(c.h) * dt * 1.5;
        if (Math.hypot(nx - c.hx, nz - c.hz) < 14 && tr.carves.at(nx, nz) < .2 && tr.distToRoad(nx, nz, 12) > FENCE + 4) { c.x = nx; c.z = nz; } else c.h += Math.PI * dt;
      }
      c.a.group.position.set(c.x, tr.groundAt(c.x, c.z), c.z);
      c.a.group.rotation.y = c.h;
      animateCow(c.a, t + c.ph, c.mode === 'walk', false, c.mode === 'graze');
    }
  });
}

function spin(tr, obj, name, speed, axis = 'z') {
  if (!obj) return;
  const part = obj.getObjectByName(name);
  tr.anim.push(dt => { part.rotation[axis] += dt * speed; });
}

/** point d metres off the road at fraction f, on the outside (side=1) or infield (side=-1) */
function off(tr, f, d, side = 1) {
  const i = tr.idxOf(f), lat = tr.insideLoop(...tr.side(f, 30)) ? -1 : 1; // +lat points outside?
  const s = lat * side;
  const [x, z, h] = tr.side(f, s * d);
  return { x, z, h, s, i };
}
/** yaw so that local +z faces the road from a point at lateral side s */
const faceRoad = (h, s) => Math.atan2(s * Math.cos(h), -s * Math.sin(h));

// grandstand full of cheering animal fans (fans are instanced and bob up and down)
function crowd(tr, f, side, col, len = 26) {
  const o = off(tr, f, FENCE + 7.5, side), yaw = faceRoad(o.h, o.s);
  tr.put(P.makeGrandstand(len, 4, col), o.x, o.z, yaw, { r: len / 2 + 3 });
  const parts = prefab(P.makeFan('#fffffe', side > 0 ? 0 : 1));
  const spots = [];
  const cs = Math.cos(yaw), sn = Math.sin(yaw), gy = tr.groundAt(o.x, o.z);
  for (let r = 0; r < 4; r++) for (let lx = -len / 2 + 1.2; lx < len / 2 - 1; lx += 1.55) {
    if (rand() < .15) continue;
    const lz = -r * 1.6 + .1;
    spots.push({ x: o.x + lx * cs + lz * sn, y: gy + 1.15 + r * 1.1, z: o.z - lx * sn + lz * cs, ph: rand() * 6, sp: 5 + rand() * 4 });
  }
  const cols = [PAL.white, '#ffb3c1', PAL.yellow, '#f6f0ff', '#d39a57', '#9aa6b8', '#ff8a00', '#e8e4da'];
  const ims = parts.map(({ geo, material }) => {
    const im = new THREE.InstancedMesh(geo, material, spots.length);
    if (material.color.getHexString() === 'fffffe') spots.forEach((s, k) => im.setColorAt(k, new THREE.Color(cols[k % cols.length])));
    im.castShadow = true; im.receiveShadow = true; tr.group.add(im); return im;
  });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)), v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  let acc = 0;
  const draw = t => {
    spots.forEach((s, k) => {
      const hop = Math.max(0, Math.sin(t * s.sp + s.ph)) * .45;
      m4.compose(v.set(s.x, s.y + hop, s.z), q, one);
      for (const im of ims) im.setMatrixAt(k, m4);
    });
    for (const im of ims) { im.instanceMatrix.needsUpdate = true; }
  };
  draw(0); for (const im of ims) im.computeBoundingSphere();
  tr.anim.push((dt, t) => { acc += dt; if (acc > 1 / 30) { acc = 0; draw(t); } });
}

// banner arch over the road
function arch(tr, f, text, col) {
  const i = tr.straightNear(f, .01), p = tr.at(i, 0), h = tr.headingAt(i);
  const g = new THREE.Group(), post = gloss(col), W = FENCE + 2;
  for (const s of [-1, 1]) {
    const b = new THREE.Mesh(rboxGeo(1.1, 9, 1.1, .3, 3), post); b.position.set(s * W, 4.5, 0); g.add(b);
    const k = new THREE.Mesh(ballGeo(.8, 14), gloss(PAL.yellow)); k.position.set(s * W, 9.3, 0); g.add(k);
  }
  const bar = new THREE.Mesh(rboxGeo(2 * W + 1.5, 2.2, .45, .2, 3), post); bar.position.y = 7.9; g.add(bar);
  const tex = bannerTex(text, col); tr.own.push(tex);
  const bm = new THREE.MeshStandardMaterial({ map: tex, roughness: .5 });
  for (const z of [.24, -.24]) { const f2 = new THREE.Mesh(new THREE.PlaneGeometry(2 * W, 1.9), bm); f2.position.set(0, 7.9, z); if (z < 0) f2.rotation.y = Math.PI; g.add(f2); }
  tr.put(g, p.x, p.z, h, { y: p.y - tr.groundAt(p.x, p.z) });
}

// strings of party flags on poles along the road side
function bunting(tr, B, f0, f1, side, cols = [PAL.red, PAL.yellow, PAL.blue, PAL.green]) {
  const pole = mat('#fbfbf6'), str = mat(INK), step = Math.round(14 / tr.seg);
  const flagG = coneGeo(.5, 1.1, 3), poleG = cylGeo(.12, .15, 1, 6), strG = rboxGeo(.05, .05, 1, .02, 1);
  let prev = null, k = 0;
  for (let i = tr.idxOf(f0); ; i = tr.wrap(i + step)) {
    const p = tr.at(i, side * (FENCE + 2.2)), top = new THREE.Vector3(p.x, p.y + 6, p.z);
    B.add(poleG, pole, M(p.x, p.y + 3, p.z, 0, 1, 6, 1));
    if (prev) {
      const n = 8;
      let a = prev;
      for (let j = 1; j <= n; j++) {
        const u = j / n, b = new THREE.Vector3().lerpVectors(prev, top, u); b.y -= Math.sin(Math.PI * u) * 1.3;
        B.add(strG, str, segM(a, b));
        if (j < n) B.add(flagG, gloss(cols[k++ % cols.length]), M(b.x, b.y - .6, b.z, Math.atan2(top.x - prev.x, top.z - prev.z) + Math.PI / 2, 1, 1, .25, Math.PI));
        a = b;
      }
    }
    prev = top;
    const d = tr.wrap(tr.idxOf(f1) - i); if (d < step || d > tr.N * .9) break;
  }
}

function board(tr, f, side, text, bg, fg = INK) {
  const o = off(tr, f, FENCE + 9, side);
  tr.place(P.makeBillboard(text, bg, fg), o.x, o.z, 6, { rot: Math.PI });
}

/** rows of a prefab in a rectangle near (cx, cz) */
function grid(tr, obj, cx, cz, rows, cols, gap, yaw = 0, jitter = .3) {
  const parts = prefab(obj), cs = Math.cos(yaw), sn = Math.sin(yaw);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const lx = (c - (cols - 1) / 2) * gap + (rand() - .5) * jitter * gap, lz = (r - (rows - 1) / 2) * gap + (rand() - .5) * jitter * gap;
    const x = cx + lx * cs + lz * sn, z = cz - lx * sn + lz * cs;
    if (!tr.clearOf(x, z, gap * .4) || tr.carves.at(x, z) > .1) continue;
    tr.placed.push({ x, z, r: gap * .45 });
    tr.addBatch(obj, new THREE.Matrix4().makeRotationY(rand() * 6.28).setPosition(x, tr.groundAt(x, z) - .1, z));
  }
}

/** something that floats in a big lazy circle (balloons, birds) */
function circler(tr, obj, cx, cz, r, y, speed, wings) {
  if (!wings) obj = P.rigid(obj);
  tr.group.add(obj);
  const ph = rand() * 6;
  tr.anim.push((dt, t) => {
    const a = t * speed + ph;
    obj.position.set(cx + Math.cos(a) * r, y + Math.sin(t * .4 + ph) * 2, cz + Math.sin(a) * r);
    obj.rotation.y = -a + (speed > 0 ? 0 : Math.PI);
    if (wings) wings.forEach((w, s) => w.rotation.z = (s ? 1 : -1) * Math.sin(t * 3 + ph) * .3);
  });
}

function smoke(tr, x, y, z, col = 0xd8d8e0) {
  let acc = 0;
  tr.anim.push(dt => {
    const fx = tr.game?.fx; if (!fx) return;
    acc += dt; if (acc < .35) return; acc = 0;
    const i = fx.norm.emit(x, y, z, .6, 2.2, .3, col, 1.4, 3.4, 3, SHAPE.puff, -.4, .3, .8); fx.norm.spin[i] = .5;
  });
}

/** a point along a river's line, d metres from the bridge, on the outer or inner side */
function riverAt(tr, rv, d, outer = true) {
  const tgt = outer ? rv.outer : rv.inner, sp = rv.span, cx = tr.px[sp.ic], cz = tr.pz[sp.ic];
  let best = rv.line[0], bd = Infinity;
  for (const p of rv.line) {
    const toEnd = Math.hypot(p[0] - tgt[0], p[1] - tgt[1]), fromC = Math.hypot(p[0] - cx, p[1] - cz), endD = Math.hypot(tgt[0] - cx, tgt[1] - cz);
    if (toEnd > endD) continue;
    const e = Math.abs(fromC - d); if (e < bd) { bd = e; best = p; }
  }
  return best;
}

function liftLine(tr, ax, az, bx, bz, n = 6) {
  const tops = [];
  for (let k = 0; k <= n; k++) {
    const x = ax + (bx - ax) * k / n, z = az + (bz - az) * k / n, h = 12 + k * 1.5;
    if (tr.distToRoad(x, z) < FENCE + 6) return;
    tops.push([x, tr.groundAt(x, z) + h, z]);
  }
  const yaw = Math.atan2(bx - ax, bz - az) + Math.PI / 2;
  tops.forEach(([x, y, z], k) => tr.put(P.makeLiftTower(12 + k * 1.5), x, z, yaw, { r: 3 }));
  const cable = mat(INK), B = new Inst(), cx = Math.cos(yaw) * 3, cz = -Math.sin(yaw) * 3;
  for (const s of [-1, 1]) for (let k = 0; k < tops.length - 1; k++) {
    const a = new THREE.Vector3(tops[k][0] + s * cx, tops[k][1] + .3, tops[k][2] + s * cz), b = new THREE.Vector3(tops[k + 1][0] + s * cx, tops[k + 1][1] + .3, tops[k + 1][2] + s * cz);
    B.add(rboxGeo(.08, .08, 1, .02, 1), cable, segM(a, b));
  }
  B.flush(tr.group, { shadow: false });
  const chairs = [], N = 14, cols = [PAL.red, PAL.blue, PAL.yellow, PAL.green];
  for (let k = 0; k < N; k++) { const c = P.rigid(P.makeLiftChair(cols[k % 4])); tr.group.add(c); chairs.push(c); }
  const along = u => { // u in 0..1 along the polyline
    const f = u * (tops.length - 1), j = Math.min(tops.length - 2, Math.floor(f)), w = f - j, a = tops[j], b = tops[j + 1];
    return [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w, a[2] + (b[2] - a[2]) * w];
  };
  tr.anim.push((dt, t) => chairs.forEach((c, k) => {
    let u = (t * .018 + k / N) % 1, s = 1; if (u > .5) { u = 1 - u; s = -1; }
    const [x, y, z] = along(u * 2);
    c.position.set(x + s * cx, y + .3, z + s * cz); c.rotation.y = yaw - Math.PI / 2;
  }));
}

// ------------------------------------------------------------------ maps
export const MAPS = [
  // ------------------------------------------------------------------ 1
  {
    id: 'clover', name: 'Clover Creek Farm', blurb: 'Stone bridge, tractors, chickens and big jumps',
    seed: 4242,
    ctrl: [[0, 0], [70, -8], [140, 0], [185, 40], [192, 100], [162, 142], [112, 148], [82, 122], [50, 140], [28, 186], [-30, 202], [-92, 182], [-132, 132], [-120, 76], [-162, 30], [-146, -30], [-92, -46], [-42, -26]],
    terrain: { amp: 1, freq: 1, ph: .5 },
    theme: {
      sky: ['#2f9bff', '#8fd6ff', '#e6f7ff'], fog: '#cdeeff', hemi: ['#dff3ff', '#3f9a25'], sun: '#fff1d0', sunI: 2.4,
      ground: ['#62d23c', '#55c232'], tint: ['#ffffff', '#e8ffd8'], verge: '#8fd35e', fence: PAL.white, curb: [PAL.red, PAL.white],
      road: { base: '#d39a57', dark: '#a8703a', light: '#e8b878' }, arch: PAL.red, ui: '#2fc65a', bank: '#d9c08a',
    },
    bridges: [{ at: .065, len: 66, style: 'stone', hump: 2.4, river: { w: 9, depth: 5, bank: 7, in: 110, out: 150, lakeIn: 17, lakeOut: 20 } }],
    ramps: [{ at: .225 }, { at: .605, lat: -5, w: 10, boost: true, h: 1.4 }, { at: .935 }],
    hazards: [
      { kind: 'cross', type: 'tractor', at: .155 },
      { kind: 'chickens', at: .48, n: 8, range: 34 },
      { kind: 'cross', type: 'hay', at: .825 },
    ],
    boosts: [[.27, -3], [.58, -5], [.9, 0]],
    items: [.12, .445, .74],
    patches: { type: 'mud', list: [[.19, 4, 4.2], [.36, -4.5, 4.8], [.5, 2, 3.8], [.665, -3.5, 5], [.79, 5, 4]] },
    obstacles: { type: 'hay', list: [[.33, 5.5], [.335, -1], [.705, -6], [.71, 2.5]] },
    crossers: { type: 'cow', at: .55, count: 3, sign: 'COW\nCROSSING' },
    scenery(tr) {
      const B = new Inst();
      const rv = tr.rivers[0];
      // mill on the creek
      if (rv) {
        const [mx, mz] = riverAt(tr, rv, 55, true);
        const mill = tr.place(P.compact(P.makeWatermill(), 'wheel'), mx + 14, mz + 4, 9, { keep: true });
        if (mill) tr.anim.push(dt => { mill.getObjectByName('wheel').rotation.x -= dt * .9; });
        const [ix, iz] = riverAt(tr, rv, 45, false);
        tr.place(P.makePicnicTable(), ix + 12, iz, 3);
        tr.place(P.makePicnicTable(), ix - 12, iz + 6, 3);
      }
      tr.place(makeBarn(), 240, 75, 16);
      tr.place(makeSilo(), 236, 28, 6);
      tr.place(makeSilo(PAL.blue), 255, 20, 6);
      tr.place(makeTractor(), 214, 160, 5);
      tr.place(makeFarmhouse(), -60, 250, 12);
      tr.place(P.makeWell(), -30, 240, 3);
      tr.place(P.makeCoop(), 20, 235, 4);
      for (let k = 0; k < 4; k++) tr.place(P.makeBeehive(), -95 + k * 4, 235, 1.5);
      spin(tr, tr.place(P.compact(makeWindmill(), 'fan'), 40, 65, 5, { keep: true }), 'fan', 1.2);
      spin(tr, tr.place(P.compact(P.makeWindpump(), 'fan'), -180, -80, 4, { keep: true }), 'fan', 2.5);
      tr.pond(-58, 112, 16);
      tr.place(makeScarecrow(), 70, -66, 2);
      tr.place(P.makeWagon(PAL.red, 'hay'), 200, 120, 5);
      tr.place(P.makeHayStack(), 260, 120, 5);
      tr.place(P.makeHayStack(), -200, 10, 5);
      // farm market by the start
      for (const [k, t, cl] of [[0, 'FRESH EGGS', [PAL.white, '#ffe9b0', PAL.yellow]], [1, 'APPLES', [PAL.red, PAL.green, PAL.red]], [2, 'MILK', [PAL.white, PAL.blue, PAL.white]]]) {
        const o = off(tr, .955 - k * .012, FENCE + 12, 1);
        tr.place(P.makeStall(k % 2 ? PAL.green : PAL.red, PAL.white, cl, t), o.x, o.z, 5, { rot: Math.PI });
      }
      crowd(tr, .975, 1, PAL.red); crowd(tr, .985, -1, PAL.blue);
      // orchard and sunflowers
      { const o = off(tr, .3, 70, 1); grid(tr, P.makeAppleTree(), o.x, o.z, 4, 6, 9, o.h); }
      { const o = off(tr, .7, 60, -1); grid(tr, P.makeAppleTree('#ffd21f'), o.x, o.z, 3, 5, 9, o.h); }
      { const o = off(tr, .43, 45, 1); grid(tr, P.makeSunflower(), o.x, o.z, 6, 10, 2.6, o.h); }
      { const o = off(tr, .87, 40, 1); grid(tr, P.makeSunflower(), o.x, o.z, 5, 8, 2.6, o.h); }
      // signs, arches and flags
      arch(tr, .5, 'CLOVER CUP', PAL.green);
      bunting(tr, B, .92, .99, 1); bunting(tr, B, .92, .99, -1, [PAL.white, PAL.green, PAL.yellow]);
      bunting(tr, B, .2, .235, -1);
      board(tr, .2, 1, 'JUMP!', PAL.yellow, PAL.red);
      board(tr, .58, -1, 'BOOST\nRAMP', PAL.orange, INK);
      board(tr, .12, -1, 'FRESH\nMILK', PAL.white, PAL.blue);
      board(tr, .38, 1, 'MOO!', '#ff5aa8', '#fff');
      board(tr, .68, 1, 'CLOVER\nCREEK', PAL.green, '#fff');
      for (let k = 0; k < 6; k++) { const o = off(tr, .25 + k * .1, FENCE + 22, k % 2 ? 1 : -1); tr.place(P.makeWoodFence(14), o.x, o.z, 8); }
      tr.scatter(P.makeCrate(PAL.red), 10, tr.ring(40, 200), { r: 1.5 });
      tr.scatter(P.makeBarrel(), 8, tr.ring(40, 200), { r: 1.5 });
      tr.scatter(makeHayBale(), 22, tr.ring(30, 260), { r: 2 });
      tr.scatter(makeTree(), 90, tr.ring(40, 340), { r: 4 });
      tr.scatter(makeTree([PAL.leaf2, '#7bd84a']), 60, tr.ring(60, 340), { r: 4 });
      tr.scatter(makeBush(), 70, tr.ring(30, 300), { r: 2 });
      for (const c of ['#ff5a7a', '#ffe14d', '#ffffff', '#b56bff']) tr.scatter(makeFlower(c), 260, tr.ring(10, 320), { r: .3, reserve: false, scale: [1, 1.8], shadow: false, minRoad: FENCE + 1.5 });
      grazers(tr, () => makeCow(.95 + rand() * .2), 12);
      grazers(tr, () => makeSheep(.8), 5);
      circler(tr, P.makeBalloon(PAL.red, PAL.yellow), tr.cx + 40, tr.cz, 160, 62, .03);
      circler(tr, P.makeBalloon(PAL.blue, PAL.white), tr.cx - 80, tr.cz + 40, 120, 75, -.025);
      for (let k = 0; k < 5; k++) { const b = P.makeBird(PAL.white); circler(tr, b.group, tr.cx + 30, tr.cz + 20, 30 + k * 4, 40 + k, .25, b.wings); }
      B.flush(tr.group, { shadow: false });
      tr.hills(['#74d84f', '#63c843']);
      tr.clouds();
    },
  },
  // ------------------------------------------------------------------ 2
  {
    id: 'pumpkin', name: 'Pumpkin Hollow', blurb: 'Covered bridge, autumn fair, moles and a swinging pumpkin',
    seed: 777, scale: 1.2,
    ctrl: [[0, 0], [60, 10], [120, 0], [165, -30], [180, -85], [150, -125], [95, -120], [70, -80], [30, -70], [-10, -100], [-60, -112], [-105, -80], [-112, -30], [-80, 5], [-40, 10]],
    terrain: { amp: 1.35, freq: 1.2, ph: 1.7 },
    theme: {
      sky: ['#5b4bb8', '#ff9a6a', '#ffd9a8'], fog: '#f2b48c', fogNear: 140, fogFar: 560, hemi: ['#ffd9b0', '#6a5a2a'], hemiI: 1.15,
      sun: '#ffb070', sunI: 2.7, sunDir: [-.7, .45, .55], sunDisc: '#ffd28a',
      ground: ['#a8b84a', '#98aa3e'], tint: ['#fff2d6', '#ffd9a0'], verge: '#c2a85a', fence: '#8a5a2b', curb: [PAL.orange, '#fff1d6'],
      road: { base: '#b9763f', dark: '#86512a', light: '#d29a63' }, arch: PAL.orange, ui: '#ff8a00', shore: '#c9a76a', bank: '#a8875a',
    },
    bridges: [{ at: .07, len: 60, style: 'covered', hump: 1.6, sign: 'HOLLOW CREEK', river: { w: 8, depth: 4.5, bank: 6, in: 90, out: 130, lakeIn: 14, lakeOut: 16 } }],
    ramps: [{ at: .265 }, { at: .715, lat: 5, w: 10, boost: true, h: 1.4 }, { at: .925 }],
    hazards: [
      { kind: 'mole', spots: [[.32, -4], [.33, 3.5], [.34, -1], [.35, 5]] },
      { kind: 'pendulum', at: .505, amp: 1.05, period: 3.4 },
      { kind: 'cross', type: 'pumpkin', at: .575 },
    ],
    boosts: [[.2, 2], [.48, -3], [.69, 5]],
    items: [.1, .4, .78],
    patches: { type: 'leaves', list: [[.16, -4, 4.5], [.3, 4, 5], [.55, 0, 4.2], [.64, -5, 4.6], [.88, 4, 4.5]] },
    obstacles: { type: 'pumpkin', list: [[.38, 0], [.62, 5.5], [.625, -5.5], [.82, 2]] },
    crossers: { type: 'pig', at: .23, count: 3, speed: 3, sign: 'PIG\nCROSSING' },
    scenery(tr) {
      const B = new Inst();
      tr.place(makeBarn({ wall: '#c8372d', roof: '#4a2e16' }), 110, -60, 16);
      tr.place(makeSilo('#ff8a00'), 135, -55, 6);
      tr.place(makeFarmhouse('#7a3a1a', '#fff1d6'), -150, -80, 12);
      for (let i = 0; i < 6; i++) tr.place(makeScarecrow(), -40 + i * 18, 70 + (i % 2) * 14, 2);
      tr.place(makeTractor('#ff3b30'), 210, -40, 5);
      tr.pond(-40, -55, 13);
      // the autumn fair
      { const o = off(tr, .45, 70, 1);
        const fw = tr.place(P.compact(P.makeFerrisWheel(14), 'wheel'), o.x, o.z, 12, { keep: true });
        if (fw) tr.anim.push(dt => { fw.getObjectByName('wheel').rotation.z += dt * .18; });
        const o2 = off(tr, .4, 55, 1);
        const car = tr.place(P.compact(P.makeCarousel(), 'top'), o2.x, o2.z, 9, { keep: true });
        if (car) tr.anim.push(dt => { car.getObjectByName('top').rotation.y += dt * .6; });
        const tents = [[PAL.red, PAL.white], [PAL.purple, PAL.yellow], [PAL.blue, PAL.white], [PAL.green, PAL.yellow]];
        tents.forEach(([a, b], k) => { const p = off(tr, .36 + k * .045, 42 + (k % 2) * 30, 1); tr.place(P.makeTent(a, b, 5 + k % 2, 4), p.x, p.z, 7); });
        [['CIDER', [PAL.red, '#ffd21f']], ['PIES', [PAL.orange, '#c4612f']], ['CANDY APPLES', [PAL.red, PAL.red]]].forEach(([t, g], k) => {
          const p = off(tr, .43 + k * .02, FENCE + 12, 1); tr.place(P.makeStall(PAL.orange, '#fff1d6', g, t), p.x, p.z, 5, { rot: Math.PI });
        });
        for (let k = 0; k < 8; k++) { const p = off(tr, .36 + k * .02, FENCE + 4, 1); tr.place(P.makeLantern(k % 2 ? PAL.orange : PAL.yellow), p.x, p.z, 1); }
      }
      { const o = off(tr, .78, 55, -1); tr.place(P.makeStage('GIANT PUMPKIN', PAL.orange), o.x, o.z, 10, { rot: Math.PI }); }
      // corn maze and pumpkin patch rows
      { const o = off(tr, .15, 55, 1); grid(tr, P.makeCornStalk(), o.x, o.z, 9, 16, 2.4, o.h, .15); }
      { const o = off(tr, .6, 50, 1); grid(tr, makePumpkin(1.3), o.x, o.z, 5, 9, 4, o.h, .4); }
      for (let k = 0; k < 4; k++) { const o = off(tr, .25 + k * .17, 30, k % 2 ? 1 : -1); tr.place(P.makeWagon(k % 2 ? PAL.red : '#2f7cff', k % 2 ? 'pumpkin' : 'hay'), o.x, o.z, 5); }
      crowd(tr, .975, 1, PAL.orange); crowd(tr, .985, -1, '#7a3a1a');
      arch(tr, .44, 'PUMPKIN FAIR', PAL.orange);
      bunting(tr, B, .92, .99, 1, [PAL.orange, '#7a3a1a', PAL.yellow]); bunting(tr, B, .92, .99, -1, [PAL.orange, PAL.purple, PAL.yellow]);
      bunting(tr, B, .36, .45, -1, [PAL.orange, PAL.purple, PAL.yellow, PAL.green]);
      board(tr, .25, -1, 'HAY\nRIDES', '#fff1d6', '#7a3a1a');
      board(tr, .6, -1, 'PUMPKIN\nPATCH', PAL.orange, INK);
      board(tr, .85, 1, 'HOT\nCIDER', PAL.red, '#fff1d6');
      board(tr, .7, -1, 'JUMP!', PAL.yellow, PAL.red);
      tr.scatter(makePumpkin(1), 180, tr.ring(25, 300), { r: 1.2, scale: [.6, 1.5] });
      tr.scatter(makePumpkin(2.4), 14, tr.infield(), { r: 3, scale: [.9, 1.2] });
      tr.scatter(P.makeHayStack(), 8, tr.ring(40, 250), { r: 5 });
      tr.scatter(makeTree(['#ff8a00', '#ffb02e']), 70, tr.ring(40, 340), { r: 4 });
      tr.scatter(makeTree(['#e8483b', '#ff6b4a']), 50, tr.ring(40, 340), { r: 4 });
      tr.scatter(makeTree(['#ffd21f', '#f2b31a']), 40, tr.ring(40, 340), { r: 4 });
      tr.scatter(P.makeAppleTree(PAL.red), 20, tr.ring(40, 300), { r: 4 });
      tr.scatter(makeLeafPile(), 120, tr.ring(15, 300), { r: 1.5, shadow: false, reserve: false, minRoad: FENCE + 2 });
      tr.scatter(makeHayBale(), 26, tr.ring(30, 260), { r: 2 });
      grazers(tr, () => makePig(.9 + rand() * .3), 10);
      circler(tr, P.makeBalloon(PAL.orange, '#7a3a1a'), tr.cx, tr.cz - 30, 150, 60, .025);
      circler(tr, P.makeBalloon(PAL.purple, PAL.yellow), tr.cx - 50, tr.cz + 50, 110, 72, -.03);
      for (let k = 0; k < 6; k++) { const b = P.makeBird('#3a2f3a'); circler(tr, b.group, tr.cx - 40, tr.cz - 20, 26 + k * 4, 35 + k, .3, b.wings); }
      B.flush(tr.group, { shadow: false });
      tr.hills(['#c4812f', '#b5662a', '#8f9a3a']);
      tr.clouds('#ffe4d0', 14);
    },
  },
  // ------------------------------------------------------------------ 3
  {
    id: 'frosty', name: 'Frosty Ranch', blurb: 'Ice bridge, geysers, sliding ice and ranch gates',
    seed: 1312, scale: 1.2,
    ctrl: [[0, 0], [80, 0], [140, 25], [160, 80], [130, 130], [72, 142], [40, 110], [0, 120], [-40, 152], [-100, 142], [-132, 92], [-112, 50], [-62, 40], [-42, 4]],
    terrain: { amp: 1.8, freq: .9, ph: 2.4 },
    theme: {
      sky: ['#3d93f0', '#a8dcff', '#f2fbff'], fog: '#e6f4ff', fogNear: 150, fogFar: 600, hemi: ['#ffffff', '#a9c4e0'], hemiI: 1.25,
      sun: '#ffffff', sunI: 2.1, sunDir: [.4, .75, -.5],
      ground: ['#f7fbff', '#e9f1fb'], tint: ['#ffffff', '#e4eefa'], verge: '#dfe9f5', fence: '#7a5232', curb: [PAL.blue, PAL.white],
      road: { base: '#93a3bb', dark: '#6b7c96', light: '#c3cfdf', pebble: ['#ffffff', '#c9d4e2'] }, roadRough: .7, arch: PAL.blue, ui: '#2f7cff', shore: '#ffffff', bank: '#8fa9cc',
    },
    bridges: [{ at: .06, len: 60, style: 'ice', hump: 2, river: { type: 'ice', w: 8, depth: 4.5, bank: 6, in: 90, out: 120, lakeIn: 15, lakeOut: 18 } }],
    ramps: [{ at: .19 }, { at: .335 }, { at: .655, lat: -5, w: 10, boost: true, h: 1.4 }],
    hazards: [
      { kind: 'geyser', spots: [[.40, -4], [.41, 4], [.425, 0]] },
      { kind: 'ice', at: .59, n: 2, gap: 18, period: 4.4 },
      { kind: 'gate', at: .745, side: 1, sign: 'RANCH\nGATES' },
      { kind: 'gate', at: .785, side: -1, ph: 3.4 },
      { kind: 'cross', type: 'snowball', at: .895 },
    ],
    boosts: [[.15, 0], [.47, 3], [.63, -5]],
    items: [.08, .38, .68],
    patches: { type: 'ice', list: [[.22, 0, 6], [.31, -4, 5], [.56, 3, 5.5], [.62, 2, 5], [.86, 3, 5]] },
    obstacles: { type: 'snowman', list: [[.27, 4.5], [.45, -5], [.72, 0], [.93, -5.5]] },
    crossers: { type: 'sheep', at: .52, count: 3, sign: 'SHEEP\nCROSSING' },
    scenery(tr) {
      const B = new Inst();
      const rv = tr.rivers[0];
      if (rv) {
        const [ox, oz] = rv.outer, [px, pz] = riverAt(tr, rv, 70, true);
        const dx = px - ox, dz = pz - oz, d = Math.hypot(dx, dz) || 1;
        tr.put(P.makeFrozenFall(28), ox - dx / d * 14, oz - dz / d * 14, Math.atan2(dx, dz), { r: 18 });
      }
      { const o = off(tr, .3, 60, 1); tr.place(P.makeSkiLodge(), o.x, o.z, 16, { rot: Math.PI }); smoke(tr, o.x, tr.groundAt(o.x, o.z) + 19, o.z); }
      { const a = off(tr, .5, 50, 1), b = off(tr, .5, 190, 1); liftLine(tr, a.x, a.z, b.x, b.z, 5); }
      tr.place(makeLogCabin(), 30, 70, 12);
      tr.place(makeBarn({ wall: '#c8372d', snow: true }), 210, 70, 16);
      tr.place(makeLogCabin(), -150, 190, 12);
      for (const [x, z] of [[-60, 210], [170, -40], [-170, 40]]) { const c = tr.place(P.makeCabinSmall(), x, z, 8); if (c) smoke(tr, c.position.x - 2.4, tr.groundAt(c.position.x, c.position.z) + 8, c.position.z - 1); }
      spin(tr, tr.place(P.compact(makeWindmill(), 'fan'), -40, 80, 5, { keep: true }), 'fan', .9);
      const rink = tr.pond(80, 70, 15, { ice: true });
      if (rink) tr.put(P.makeIceRinkFence(17.5), rink[0], rink[1], 0);
      for (const [x, z] of [[-20, 40], [110, 20], [-90, 110]]) tr.place(P.makeIgloo(), x, z, 6);
      { const o = off(tr, .12, 34, 1); tr.place(P.makeSled(PAL.red), o.x, o.z, 2); tr.place(P.makeSled(PAL.blue), o.x + 4, o.z, 2); }
      crowd(tr, .975, 1, PAL.blue); crowd(tr, .985, -1, PAL.red);
      arch(tr, .5, 'FROSTY RANCH', PAL.blue);
      bunting(tr, B, .92, .99, 1, [PAL.blue, PAL.white, PAL.red]); bunting(tr, B, .92, .99, -1, [PAL.blue, PAL.white, PAL.teal]);
      board(tr, .26, -1, 'HOT\nCOCOA', '#7a3a1a', '#fff1d6');
      board(tr, .62, 1, 'SKI\nLODGE', PAL.red, '#fff');
      board(tr, .17, 1, 'JUMP!', PAL.yellow, PAL.blue);
      board(tr, .87, -1, 'BRRR!', PAL.white, PAL.blue);
      tr.scatter(makeSnowman(), 16, tr.ring(30, 260), { r: 2.5 });
      tr.scatter(makePine(true), 160, tr.ring(30, 340), { r: 3.5, scale: [.8, 1.6] });
      tr.scatter(makePine(false, '#2a7a46'), 60, tr.ring(60, 340), { r: 3.5, scale: [.8, 1.4] });
      tr.scatter(makeSnowMound(), 90, tr.ring(15, 320), { r: 2, shadow: false, reserve: false, minRoad: FENCE + 2 });
      tr.scatter(makeRock('#9aa6b8'), 30, tr.ring(30, 300), { r: 2 });
      tr.scatter(P.makeWoodFence(12, '#7a5232'), 10, tr.ring(40, 220), { r: 7 });
      grazers(tr, () => makeSheep(.8 + rand() * .3), 14);
      for (let k = 0; k < 5; k++) { const b = P.makeBird('#2a3a5a'); circler(tr, b.group, tr.cx + 20, tr.cz - 30, 28 + k * 5, 38 + k, .28, b.wings); }
      B.flush(tr.group, { shadow: false });
      tr.hills(['#ffffff', '#e4eefa', '#cfe0f2']);
      tr.clouds('#ffffff', 22);
    },
  },
  // ------------------------------------------------------------------ 4
  {
    id: 'canyon', name: 'Cactus Canyon', blurb: 'Trestle over the chasm, trains, mine carts and dust devils',
    seed: 9001,
    ctrl: [[0, 0], [100, 0], [170, 20], [200, 70], [180, 120], [120, 130], [90, 170], [30, 190], [-40, 170], [-62, 122], [-20, 90], [-40, 50], [-100, 62], [-150, 30], [-140, -20], [-80, -25]],
    terrain: { amp: .8, freq: .8, ph: 3.1 },
    theme: {
      sky: ['#2f86e8', '#9fd4ff', '#fff1d6'], fog: '#f7dfb8', fogNear: 180, fogFar: 680, hemi: ['#fff2d8', '#b0703a'], hemiI: 1.2,
      sun: '#fff0c8', sunI: 2.8, sunDir: [.3, .85, .4],
      ground: ['#efc27e', '#e6b46c'], tint: ['#ffffff', '#ffe2c2'], verge: '#e0a86a', fence: '#8a5a2b', curb: [PAL.red, PAL.white],
      road: { base: '#c97a45', dark: '#9c5630', light: '#e09a62' }, arch: '#ff8a00', ui: '#ff8a00', shore: '#7fcf5a',
      strata: ['#d9773f', '#c4612f', '#e8915a', '#b3502a'],
    },
    bridges: [{ at: .455, len: 74, style: 'trestle', hump: .8, river: { type: 'chasm', w: 9, depth: 24, bank: 4, in: 60, out: 70, wiggle: 3 } }],
    ramps: [{ at: .06 }, { at: .22, lat: 5, w: 10, boost: true, h: 1.4 }, { at: .93 }],
    hazards: [
      { kind: 'cross', type: 'train', at: .145 },
      { kind: 'cactus', spots: [[.31, -4], [.325, 4.5], [.34, -.5]] },
      { kind: 'devil', at: .54, range: 40 },
      { kind: 'cross', type: 'minecart', at: .765 },
    ],
    boosts: [[.1, 0], [.2, 5], [.67, -2]],
    items: [.17, .47, .8],
    patches: { type: 'sand', list: [[.25, -3, 5], [.33, 4, 5], [.52, -1, 4.5], [.73, 4, 5.5], [.9, -4, 5]] },
    obstacles: { type: 'rock', list: [[.585, 5], [.59, -5], [.85, 1]] },
    crossers: { type: 'tumbleweed', at: .375, count: 3, speed: 3.2, sign: 'WINDY\nAHEAD' },
    scenery(tr) {
      const B = new Inst();
      tr.place(makeFarmhouse('#c8372d', '#fff1d6'), 260, 60, 12);
      tr.place(makeWaterTower(), 235, 100, 5);
      tr.place(makeBarn({ wall: '#b3502a', roof: '#5e3a1a' }), -200, 110, 16);
      spin(tr, tr.place(P.compact(makeWindmill(), 'fan'), 20, 130, 5, { keep: true }), 'fan', 1.6);
      spin(tr, tr.place(P.compact(P.makeWindpump(), 'fan'), -100, 140, 4, { keep: true }), 'fan', 3);
      tr.pond(60, 60, 12);
      // old western town by the start straight
      { const names = [['SALOON', '#c8372d'], ['GENERAL STORE', '#2f7cff'], ['SHERIFF', '#7a3a1a'], ['HOTEL', '#2fc65a']];
        names.forEach(([t, c], k) => { const o = off(tr, .02 + k * .022, FENCE + 16, 1); tr.place(P.makeSaloon(t, c), o.x, o.z, 9, { rot: Math.PI }); });
        for (let k = 0; k < 4; k++) { const o = off(tr, .03 + k * .02, FENCE + 6, 1); tr.place(P.makeBarrel(k % 2 ? PAL.wood : '#b3502a'), o.x, o.z, 1.2); }
        const w = off(tr, .11, FENCE + 10, 1); tr.place(P.makeWagon('#8a5a2b', 'barrel'), w.x, w.z, 4);
      }
      { const o = off(tr, .7, 75, 1); tr.place(P.makeMineEntrance(), o.x, o.z, 18, { rot: Math.PI }); }
      { const o = off(tr, .3, 80, 1); tr.place(P.makeRockArch(26, 20), o.x, o.z, 16); }
      // parked steam train at a little station
      { const o = off(tr, .64, 55, -1); const yaw = o.h, s = Math.sin(yaw), c = Math.cos(yaw);
        if (tr.clearOf(o.x, o.z, 16)) {
          tr.placed.push({ x: o.x, z: o.z, r: 16 });
          tr.put(P.makeRails(44), o.x, o.z, yaw);
          tr.put(P.makeLocomotive('#2fc65a'), o.x + s * 12, o.z + c * 12, yaw);
          tr.put(P.makeWagonCar(PAL.yellow, 'box'), o.x - s * 1.5, o.z - c * 1.5, yaw);
          tr.put(P.makeWagonCar(PAL.red, 'coal'), o.x - s * 11, o.z - c * 11, yaw);
          smoke(tr, o.x + s * 15.6, tr.groundAt(o.x, o.z) + 7, o.z + c * 15.6, 0xbfbfc8);
        }
      }
      const mesas = [[-260, -140], [-120, -200], [80, -170], [300, -60], [330, 160], [180, 330], [-60, 330], [-300, 200], [-330, 40]];
      for (const [x, z] of mesas) tr.place(makeMesa(30 + rand() * 40, 28 + rand() * 18), x, z, 34, { face: false, y: -1 });
      // chasm rim rocks
      const rv = tr.rivers[0];
      if (rv) for (const [x, z] of rv.line) for (const sd of [-1, 1]) if (rand() < .5) {
        const k = rv.line.indexOf(rv.line.find(p => p[0] === x)), q = rv.line[Math.min(rv.line.length - 1, k + 1)], p0 = rv.line[Math.max(0, k - 1)];
        let dx = q[0] - p0[0], dz = q[1] - p0[1]; const dd = Math.hypot(dx, dz) || 1; dx /= dd; dz /= dd;
        const rx = x - dz * sd * (rv.w + 6 + rand() * 4), rz = z + dx * sd * (rv.w + 6 + rand() * 4);
        if (tr.distToRoad(rx, rz) > FENCE + 4) tr.put(makeRock(rand() < .5 ? '#c4612f' : '#d9773f', 1 + rand()), rx, rz, rand() * 6);
      }
      crowd(tr, .975, 1, PAL.orange); crowd(tr, .985, -1, PAL.red);
      arch(tr, .585, 'GOLD RUSH', '#ff8a00');
      bunting(tr, B, .92, .99, 1, [PAL.red, PAL.white, PAL.blue]); bunting(tr, B, .92, .99, -1, [PAL.orange, PAL.yellow, PAL.red]);
      board(tr, .4, -1, 'MIND\nTHE GAP', PAL.yellow, INK);
      board(tr, .2, -1, 'BOOST\nRAMP', PAL.orange, INK);
      board(tr, .62, 1, 'GOLD\nMINE', '#5e3a1a', PAL.yellow);
      board(tr, .88, 1, 'CACTUS\nCANYON', '#ff8a00', '#fff');
      tr.scatter(makeCactus(), 130, tr.ring(25, 330), { r: 2, scale: [.7, 1.4] });
      tr.scatter(P.makeBarrelCactus(), 60, tr.ring(20, 320), { r: 1.2, scale: [.8, 1.4] });
      tr.scatter(P.makePricklyPear(), 50, tr.ring(20, 320), { r: 1.5 });
      tr.scatter(P.makeCowSkull(), 14, tr.ring(25, 280), { r: 1, shadow: false });
      tr.scatter(makeRock('#c98a5a'), 70, tr.ring(25, 330), { r: 2.5, scale: [.6, 2] });
      tr.scatter(makeRock('#e0a070', 1.6), 30, tr.ring(80, 330), { r: 4 });
      tr.scatter(makeBush('#8fb34a'), 50, tr.ring(25, 300), { r: 2 });
      grazers(tr, () => makeCow(.9 + rand() * .2), 8);
      for (let k = 0; k < 4; k++) { const v = P.makeVulture(); v.group.scale.setScalar(1.3); circler(tr, v.group, tr.cx + 40 - k * 20, tr.cz + k * 15, 35 + k * 8, 45 + k * 4, .2 + k * .03, v.wings); }
      B.flush(tr.group, { shadow: false });
      tr.hills(['#e8915a', '#d9773f', '#f0b27a']);
      tr.clouds('#ffffff', 8);
    },
  },
];
