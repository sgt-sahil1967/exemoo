// Extra procedural props: moving hazards and hand-built landmarks for the four maps.
// Same toy look as models.js: rounded boxes, glossy colours, big cartoon eyes.
import * as THREE from 'three';
import { mat, gloss, metal, rbox, ball, cyl, cone, mesh, eye, torusGeo, prefab, PAL, INK } from './geo.js';
import { boardTex, stripeTex } from './textures.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const W = () => mat(PAL.white);
const DS = THREE.DoubleSide;
const wood = () => mat(PAL.wood), woodD = () => mat(PAL.woodD);
const shadows = g => { g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g; };
const texCache = new Map();
function signMat(text, bg, fg, w = 512, h = 256) {
  const k = text + bg + fg + w + h;
  if (!texCache.has(k)) texCache.set(k, new THREE.MeshStandardMaterial({ map: boardTex(text, bg, fg, w, h), roughness: .55 }));
  return texCache.get(k);
}
let stripeMats = new Map();
function stripes(a, b) { const k = a + b; if (!stripeMats.has(k)) { const t = stripeTex(a, b, 3); t.repeat.set(2, 1); stripeMats.set(k, new THREE.MeshStandardMaterial({ map: t, roughness: .6 })); } return stripeMats.get(k); }

// ================================================================== hazards
export function makeChicken(s = 1) {
  const g = new THREE.Group(), body = new THREE.Group(); body.position.y = .95; g.add(body);
  ball(.55, W(), body, 0, 0, 0, 18).scale.set(.9, .85, 1.1);
  const tail = ball(.3, W(), body, 0, .3, -.5, 10); tail.scale.set(.6, 1, .6);
  const wings = [];
  for (const sd of [-1, 1]) { const w = new THREE.Group(); w.position.set(sd * .45, .1, 0); body.add(w); ball(.3, W(), w, sd * .1, 0, 0, 10).scale.set(.4, .8, 1.2); wings.push(w); }
  const head = new THREE.Group(); head.position.set(0, .55, .45); body.add(head);
  ball(.32, W(), head, 0, 0, 0, 16);
  for (let i = 0; i < 3; i++) ball(.1, gloss('#ff2d2d'), head, 0, .3 + (i === 1 ? .05 : 0), -.1 + i * .1, 8);
  const bk = cone(.1, .25, gloss(PAL.yellow), head, 0, -.02, .35, 8); bk.rotation.x = Math.PI / 2;
  ball(.08, gloss('#ff2d2d'), head, 0, -.18, .28, 8).scale.y = 1.4;
  for (const sd of [-1, 1]) eye(head, sd * .14, .08, .24, .09);
  const legs = [];
  for (const sd of [-1, 1]) { const l = new THREE.Group(); l.position.set(sd * .18, .6, 0); g.add(l); cyl(.05, .05, .55, gloss(PAL.orange), l, 0, -.3, 0, 6); legs.push(l); }
  g.scale.setScalar(s);
  return { group: shadows(g), body, wings, head, legs };
}

export function makeMole() {
  const g = new THREE.Group(), fur = mat('#5a4a5e', { roughness: .9 });
  ball(.9, fur, g, 0, .5, 0, 20).scale.set(1, 1.2, .95);
  ball(.28, gloss(PAL.snout), g, 0, .55, .85, 12);
  for (const sd of [-1, 1]) {
    eye(g, sd * .3, .95, .7, .16);
    const paw = ball(.3, gloss(PAL.snout), g, sd * .65, .05, .55, 10); paw.scale.set(1, .4, .8);
  }
  // hard hat with lamp
  const hat = ball(.75, gloss(PAL.yellow), g, 0, 1.35, 0, 18); hat.scale.y = .6;
  cyl(.86, .86, .1, gloss(PAL.yellow), g, 0, 1.25, 0, 18);
  cyl(.16, .16, .15, mat('#fff7c0', { emissive: '#ffe066', emissiveIntensity: 1 }), g, 0, 1.55, .6, 10).rotation.x = Math.PI / 2;
  return shadows(g);
}
export function makeMoleHill() {
  const g = new THREE.Group(), dirt = mat('#7a4e26', { roughness: 1 });
  ball(1.6, dirt, g, 0, -.2, 0, 16).scale.y = .45;
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ball(.3, mat('#5e3a1a'), g, Math.cos(a) * 1.5, .05, Math.sin(a) * 1.5, 8).scale.y = .6; }
  ball(.55, mat('#2a1a10'), g, 0, .38, 0, 12).scale.y = .2;
  return shadows(g);
}

export function makeGeyserVent() {
  const g = new THREE.Group();
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; ball(.6 + (i % 3) * .1, mat('#8a96a8', { roughness: .9 }), g, Math.cos(a) * 1.9, .1, Math.sin(a) * 1.9, 10).scale.y = .55; }
  const pool = cyl(1.7, 1.7, .1, mat('#59c3ff', { roughness: .05, metalness: .3, emissive: '#2f9bff', emissiveIntensity: .25 }), g, 0, .12, 0, 24);
  pool.name = 'pool';
  return shadows(g);
}
export function makeSteamColumn() {
  const g = new THREE.Group(), m = mat('#ffffff', { transparent: true, opacity: .82, roughness: 1, emissive: '#ffffff', emissiveIntensity: .25 });
  cyl(.9, 1.4, 6, m, g, 0, 3, 0, 16);
  for (let i = 0; i < 5; i++) ball(1.2 + i * .15, m, g, Math.sin(i * 2) * .5, 5.5 + i * .9, Math.cos(i * 2) * .5, 12);
  g.traverse(o => { if (o.isMesh) o.castShadow = false; });
  return g;
}

export function makeJackLantern(r = 2.2) {
  const g = new THREE.Group(), m = gloss('#ff8a00');
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ball(r * .78, m, g, Math.cos(a) * r * .5, 0, Math.sin(a) * r * .5, 16).scale.set(.75, 1, .75); }
  ball(r, m, g, 0, 0, 0, 20).scale.y = .9;
  const glow = mat('#ffe14d', { emissive: '#ffb000', emissiveIntensity: 1.4 });
  for (const sd of [-1, 1]) for (const fz of [1, -1]) {
    const e = cone(r * .22, r * .3, glow, g, sd * r * .35, r * .2, fz * r * .93, 3); e.rotation.x = fz * Math.PI / 2; e.scale.z = .3;
  }
  for (const fz of [1, -1]) {
    const mo = rbox(r * .9, r * .18, r * .2, glow, .05, g, 0, -r * .3, fz * r * .9);
    for (const x of [-.25, .25]) rbox(r * .14, r * .14, r * .25, m, .03, g, x * r, -r * .22, fz * r * .93);
    mo.scale.z = .5;
  }
  cyl(.25, .35, .8, mat('#4f7a2a'), g, 0, r * .95, 0, 8);
  return shadows(g);
}

export function makeGantry(span, h, col = PAL.wood) {
  const g = new THREE.Group(), m = mat(col, { roughness: .8 });
  for (const sd of [-1, 1]) {
    rbox(1.2, h, 1.2, m, .2, g, sd * span / 2, h / 2, 0);
    for (const dz of [-1, 1]) { const b = rbox(.5, 4.5, .5, m, .1, g, sd * span / 2, 1.6, dz * 1.4); b.rotation.x = dz * .5; }
  }
  rbox(span + 2, 1.2, 1.4, m, .25, g, 0, h, 0);
  return shadows(g);
}

export function makeRanchGate(len = 9) {
  const g = new THREE.Group(), red = gloss(PAL.red), wht = gloss(PAL.white);
  for (const y of [.6, 1.3, 2.0]) rbox(len, .3, .22, y === 1.3 ? wht : red, .08, g, len / 2, y, 0);
  for (const x of [.2, len / 2, len - .2]) rbox(.3, 2.2, .3, red, .08, g, x, 1.2, 0);
  const d = rbox(Math.hypot(len / 2, 1.4), .25, .2, wht, .06, g, len / 4, 1.3, 0); d.rotation.z = Math.atan2(1.4, len / 2);
  const d2 = rbox(Math.hypot(len / 2, 1.4), .25, .2, wht, .06, g, len * .75, 1.3, 0); d2.rotation.z = -Math.atan2(1.4, len / 2);
  ball(.3, gloss(PAL.yellow), g, len - .2, 2.4, 0, 10);
  return shadows(g);
}
export function makeGatePost() {
  const g = new THREE.Group();
  rbox(.8, 3.4, .8, mat(PAL.woodD), .15, g, 0, 1.7, 0);
  ball(.5, mat('#ffffff'), g, 0, 3.5, 0, 12).scale.y = .6;
  return shadows(g);
}

export function makeIceBlock(s = 3.4) {
  const g = new THREE.Group();
  rbox(s, s * .85, s, mat('#bfe8ff', { roughness: .05, metalness: .1, transparent: true, opacity: .82 }), .35, g, 0, s * .425, 0);
  rbox(s * .6, s * .5, s * .6, mat('#ffffff', { roughness: .1, transparent: true, opacity: .5 }), .2, g, -s * .1, s * .5, -s * .1);
  rbox(s * 1.02, .3, s * 1.02, mat('#ffffff', { roughness: .9 }), .15, g, 0, s * .86, 0);
  for (const sd of [-1, 1]) eye(g, sd * s * .18, s * .5, s * .5, .3);
  return shadows(g);
}

export function makeDustDevil() {
  const g = new THREE.Group();
  const m1 = mat('#e8c28a', { transparent: true, opacity: .55, roughness: 1, side: DS }), m2 = mat('#f6dca8', { transparent: true, opacity: .4, roughness: 1, side: DS });
  const spin = new THREE.Group(); spin.name = 'spin'; g.add(spin);
  for (let i = 0; i < 6; i++) {
    const r = .7 + i * .45, t = mesh(torusGeo(r, .22 + i * .05, 6, 20), i % 2 ? m1 : m2, Math.sin(i) * .3, .8 + i * 1.2, Math.cos(i) * .3, spin);
    t.rotation.x = Math.PI / 2 + Math.sin(i * 1.7) * .25; t.castShadow = false;
  }
  const c = cone(3, 7.5, m2, spin, 0, 3.8, 0, 16); c.rotation.x = Math.PI; c.castShadow = false;
  return g;
}

export function makeMineCart() {
  const g = new THREE.Group(), body = metal('#7a5a3a'), band = metal('#3a3a44');
  rbox(2.4, 1.5, 3.2, body, .2, g, 0, 1.4, 0);
  for (const y of [.8, 2.0]) rbox(2.5, .18, 3.3, band, .05, g, 0, y, 0);
  for (let i = 0; i < 7; i++) ball(.45, gloss(i % 2 ? '#ffd21f' : '#c9a24a'), g, (Math.random() - .5) * 1.4, 2.1 + Math.random() * .3, (Math.random() - .5) * 2.2, 10);
  for (const x of [-1.05, 1.05]) for (const z of [-1, 1]) { const w = cyl(.42, .42, .25, mat('#2a2a3a'), g, x, .45, z, 14); w.rotation.z = Math.PI / 2; }
  return shadows(g);
}

export function makeLocomotive(col = PAL.red) {
  const g = new THREE.Group(), paint = gloss(col), blk = gloss('#2a2a3a'), gold = metal('#ffcc22');
  const boiler = cyl(1.5, 1.5, 7, blk, g, 0, 2.9, 1.5, 24); boiler.rotation.x = Math.PI / 2;
  for (const z of [-.5, 1.5, 3.5]) { const b = cyl(1.56, 1.56, .25, gold, g, 0, 2.9, z, 24); b.rotation.x = Math.PI / 2; }
  const front = cyl(1.3, 1.3, .3, paint, g, 0, 2.9, 5.1, 24); front.rotation.x = Math.PI / 2;
  ball(.4, mat('#fff7c0', { emissive: '#ffe066', emissiveIntensity: 1.2 }), g, 0, 3.4, 5.2, 12);
  cyl(.5, .8, 2.2, blk, g, 0, 5, 3.6, 14); cyl(1, .5, .8, blk, g, 0, 6.3, 3.6, 14);
  ball(.7, gold, g, 0, 4.4, 1.4, 14);
  rbox(3.6, 4, 3.6, paint, .3, g, 0, 3.3, -3.4);
  rbox(4.2, .5, 4.4, blk, .2, g, 0, 5.5, -3.4);
  for (const sd of [-1, 1]) rbox(.1, 1.3, 1.5, mat(PAL.glass, { roughness: .15 }), .05, g, sd * 1.82, 4, -3.4);
  rbox(3.2, .8, 10, blk, .2, g, 0, 1, 0);
  const cc = cone(1.6, 1.6, paint, g, 0, .9, 5.7, 4); cc.rotation.x = Math.PI / 2; cc.rotation.y = Math.PI / 4; cc.scale.set(1, .6, 1);
  for (const z of [-3.4, -1.3, .8, 2.9]) for (const sd of [-1, 1]) { const w = cyl(z > 0 ? .95 : .75, z > 0 ? .95 : .75, .35, paint, g, sd * 1.5, z > 0 ? .95 : .75, z, 18); w.rotation.z = Math.PI / 2; }
  return shadows(g);
}
export function makeWagonCar(col = '#2f7cff', load = 'coal') {
  const g = new THREE.Group(), paint = gloss(col), blk = gloss('#2a2a3a');
  rbox(3.4, 2.4, 8.5, paint, .3, g, 0, 2.6, 0);
  rbox(3.6, .3, 8.7, blk, .1, g, 0, 1.3, 0);
  if (load === 'coal') for (let i = 0; i < 10; i++) ball(.8, mat('#2a2a33', { roughness: .9 }), g, (i % 2 - .5) * 1.4, 3.8, (i / 10 - .45) * 7.5, 8);
  else rbox(3.6, .4, 8.7, gloss(PAL.yellow), .1, g, 0, 4, 0);
  for (const z of [-2.8, 2.8]) for (const sd of [-1, 1]) { const w = cyl(.7, .7, .35, blk, g, sd * 1.4, .75, z, 16); w.rotation.z = Math.PI / 2; }
  return shadows(g);
}

export function makeCrossingSignal() {
  const g = new THREE.Group();
  cyl(.15, .2, 6, W(), g, 0, 3, 0, 10);
  for (const r of [.7, -.7]) { const b = rbox(3.4, .45, .1, W(), .05, g, 0, 5.4, .2); b.rotation.z = r; const s = rbox(3, .2, .12, gloss(PAL.red), .04, g, 0, 5.4, .22); s.rotation.z = r; }
  rbox(2.6, .4, .3, mat(INK), .1, g, 0, 3.9, .1);
  const lights = [];
  for (const sd of [-1, 1]) {
    cyl(.5, .5, .3, mat(INK), g, sd * 1.1, 3.9, .25, 16).rotation.x = Math.PI / 2;
    const l = cyl(.36, .36, .2, mat('#5a1010'), g, sd * 1.1, 3.9, .38, 16); l.rotation.x = Math.PI / 2; lights.push(l);
  }
  return { group: shadows(g), lights };
}
export function makeBarrierArm(len) {
  const g = new THREE.Group(), arm = new THREE.Group(); arm.position.y = 1.4; g.add(arm);
  rbox(.8, 1.8, .8, mat(INK), .15, g, 0, .9, 0);
  const t = stripeTex(PAL.red, '#ffffff', 6); t.repeat.set(len / 3, 1);
  const bar = rbox(len, .4, .25, new THREE.MeshStandardMaterial({ map: t, roughness: .5 }), .1, arm, len / 2, 0, 0);
  ball(.25, mat('#ff3b30', { emissive: '#ff2010', emissiveIntensity: .8 }), arm, len - .3, .3, 0, 10);
  return { group: shadows(g), arm };
}

export function makeBumperCactus() {
  const g = new THREE.Group();
  cyl(1.3, 1, 1.2, gloss('#d9773f'), g, 0, .6, 0, 18); cyl(1.4, 1.4, .25, gloss('#e8915a'), g, 0, 1.2, 0, 18);
  const top = new THREE.Group(); top.name = 'top'; top.position.y = 1.2; g.add(top);
  for (let i = 0; i < 4; i++) mesh(torusGeo(.55, .12, 6, 16), metal('#c9ccd6'), 0, .25 + i * .3, 0, top).rotation.x = Math.PI / 2;
  const m = mat('#3fae5a', { roughness: .55 });
  cyl(.75, .8, 3, m, top, 0, 2.8, 0, 16); ball(.75, m, top, 0, 4.3, 0, 16);
  for (const [sd, y, h] of [[-1, 2.6, 1.3], [1, 3.2, 1.1]]) { const a = cyl(.4, .4, 1, m, top, sd * .95, y, 0, 10); a.rotation.z = Math.PI / 2; cyl(.4, .4, h, m, top, sd * 1.4, y + h / 2, 0, 10); ball(.4, m, top, sd * 1.4, y + h, 0, 10); }
  for (const sd of [-1, 1]) eye(top, sd * .3, 3.6, .65, .2);
  ball(.35, gloss('#ff5aa8'), top, 0, 5.05, 0, 12);
  for (let i = 0; i < 18; i++) { const a = i * 2.4, y = 1.8 + (i % 6) * .45; cone(.06, .35, W(), top, Math.cos(a) * .8, y, Math.sin(a) * .8, 4).rotation.set(0, 0, Math.PI / 2 - a); }
  return shadows(g);
}

export function makeSnowball(r = 2) {
  const g = new THREE.Group(), w = mat('#ffffff', { roughness: .85 });
  ball(r, w, g, 0, 0, 0, 20);
  for (let i = 0; i < 9; i++) { const a = i * 2.1, b = i * 1.3; ball(r * .35, w, g, Math.cos(a) * Math.cos(b) * r * .85, Math.sin(b) * r * .85, Math.sin(a) * Math.cos(b) * r * .85, 10); }
  for (let i = 0; i < 4; i++) ball(r * .12, mat(PAL.woodD), g, Math.cos(i * 1.6) * r * .98, Math.sin(i * 2.2) * r * .2, Math.sin(i * 1.6) * r * .98, 6);
  return shadows(g);
}

export function addBeacon(g, y = 5.6) {
  const b = ball(.35, mat('#ffb000', { emissive: '#ff9000', emissiveIntensity: .2 }), g, 0, y, 1.2, 12);
  b.name = 'beacon';
  return b;
}

// ================================================================== signs, crowds, decorations
export function makeBillboard(text, bg = PAL.yellow, fg = INK, w = 10, h = 5) {
  const g = new THREE.Group();
  for (const sd of [-1, 1]) rbox(.4, h + 2.5, .4, wood(), .1, g, sd * w * .35, (h + 2.5) / 2, -.3);
  rbox(w + .6, h + .6, .3, gloss(INK), .15, g, 0, 2.5 + h / 2, 0);
  const b = mesh(new THREE.PlaneGeometry(w, h), signMat(text, bg, fg), 0, 2.5 + h / 2, .17, g); b.castShadow = false;
  const back = mesh(new THREE.PlaneGeometry(w, h), signMat(text, bg, fg), 0, 2.5 + h / 2, -.17, g); back.rotation.y = Math.PI; back.castShadow = false;
  return g;
}

export function makeGrandstand(len = 24, rows = 4, col = PAL.red) {
  const g = new THREE.Group(), seat = gloss(col), frame = mat('#d6d0c4');
  for (let r = 0; r < rows; r++) rbox(len, .5, 1.6, r % 2 ? gloss(PAL.white) : seat, .15, g, 0, .9 + r * 1.1, -r * 1.6);
  for (let r = 0; r < rows; r++) rbox(len, 1.1 + r * 1.1, .3, frame, .05, g, 0, (1.1 + r * 1.1) / 2, -r * 1.6 + .8);
  for (const x of [-len / 2, -len / 6, len / 6, len / 2]) { rbox(.4, 9, .4, frame, .1, g, x, 4.5, -rows * 1.6 + .4); rbox(.3, 7.2, .3, frame, .1, g, x, 3.6, 1); }
  const roofT = stripeTex(col, '#ffffff', 2); roofT.repeat.set(len / 4, 1);
  const roof = rbox(len + 1.5, .4, rows * 1.6 + 2.5, new THREE.MeshStandardMaterial({ map: roofT, roughness: .6 }), .15, g, 0, 8.6, -rows * .8 + .6);
  roof.rotation.x = -.12;
  return shadows(g);
}
/** a small round animal fan for crowds (instanced via prefab) */
export function makeFan(col, kind = 0) {
  const g = new THREE.Group(), m = mat(col);
  ball(.55, m, g, 0, .55, 0, 12).scale.set(1, 1.1, .9);
  ball(.45, m, g, 0, 1.35, .05, 12);
  for (const sd of [-1, 1]) {
    eye(g, sd * .16, 1.42, .38, .1);
    if (kind === 0) { const e = cone(.14, .3, m, g, sd * .3, 1.75, 0, 6); e.rotation.z = -sd * .3; }
    else if (kind === 1) ball(.14, m, g, sd * .42, 1.5, 0, 8).scale.set(1.4, .6, .6);
    else { const e = cyl(.07, .1, .55, m, g, sd * .18, 1.85, 0, 6); e.rotation.z = -sd * .15; }
    const arm = cyl(.08, .08, .6, m, g, sd * .55, 1.0, .1, 6); arm.rotation.z = sd * 2.4;
  }
  ball(.13, gloss(PAL.snout), g, 0, 1.25, .45, 8);
  return g;
}

export function makeTent(a = PAL.red, b = PAL.white, r = 6, h = 4) {
  const g = new THREE.Group(), n = 12;
  for (let i = 0; i < n; i++) {
    const m = gloss(i % 2 ? a : b);
    const wall = mesh(new THREE.CylinderGeometry(r, r, h, 2, 1, true, i / n * Math.PI * 2, Math.PI * 2 / n), mat(i % 2 ? a : b, { side: DS }), 0, h / 2, 0, g);
    const roof = mesh(new THREE.ConeGeometry(r + .6, h * 1.1, 2, 1, true, i / n * Math.PI * 2, Math.PI * 2 / n), m, 0, h + h * .55, 0, g);
    roof.material = mat(i % 2 ? a : b, { side: DS, roughness: .45 });
    wall.castShadow = roof.castShadow = true;
  }
  rbox(2.4, h * .8, .3, mat(INK), .1, g, 0, h * .4, r - .05);
  cyl(.1, .1, 2.6, W(), g, 0, h * 2.1 + 1, 0, 6);
  const f = cone(.5, 1.2, gloss(PAL.yellow), g, .55, h * 2.1 + 1.8, 0, 3); f.rotation.z = -Math.PI / 2; f.scale.z = .2;
  return shadows(g);
}

export function makeStall(a = PAL.red, b = PAL.white, goods = [PAL.red, PAL.orange, PAL.green], text = null) {
  const g = new THREE.Group();
  rbox(6, 1.4, 2.2, wood(), .15, g, 0, .7, 0);
  rbox(6.4, .25, 2.6, mat(PAL.wood), .08, g, 0, 1.5, 0);
  for (const x of [-2.9, 2.9]) for (const z of [-1, 1]) rbox(.25, 4, .25, woodD(), .06, g, x, 2, z);
  for (let i = 0; i < 8; i++) { const s = rbox(.8, .2, 3.2, gloss(i % 2 ? a : b), .05, g, -2.8 + i * .8, 4.15, .3); s.rotation.x = .3; }
  for (let i = 0; i < 9; i++) ball(.3, gloss(goods[i % goods.length]), g, -2.2 + (i % 5) * 1.1, 1.85, (i > 4 ? -.4 : .4), 10);
  for (let i = 0; i < 2; i++) { rbox(1.1, .7, 1.1, wood(), .08, g, -3.6 + i * 7.2, .35, .9); for (let j = 0; j < 3; j++) ball(.24, gloss(goods[(i + j) % goods.length]), g, -3.6 + i * 7.2 + (j - 1) * .32, .8, .9, 8); }
  if (text) { const s = mesh(new THREE.PlaneGeometry(4.5, 1.1), signMat(text, '#fff1d6', '#5e3a1a', 512, 128), 0, 4.9, 1.75, g); s.castShadow = false; }
  return shadows(g);
}

export function makeCrate(goods = PAL.red) {
  const g = new THREE.Group();
  rbox(1.4, .9, 1.1, wood(), .1, g, 0, .45, 0);
  for (let i = 0; i < 4; i++) ball(.3, gloss(goods), g, (i % 2 - .5) * .6, 1, (Math.floor(i / 2) - .5) * .45, 10);
  return g;
}
export function makeBarrel(col = PAL.wood) {
  const g = new THREE.Group();
  cyl(.7, .7, 1.6, mat(col), g, 0, .8, 0, 16); ball(.72, mat(col), g, 0, .8, 0, 16).scale.y = .85;
  for (const y of [.3, 1.3]) cyl(.75, .75, .14, metal('#555a66'), g, 0, y, 0, 16);
  return g;
}
export function makeWagon(col = PAL.red, load = 'hay') {
  const g = new THREE.Group();
  rbox(3, 1, 5.5, gloss(col), .15, g, 0, 1.6, 0);
  for (const z of [-1.8, 1.8]) for (const sd of [-1, 1]) {
    const w = cyl(.9, .9, .25, wood(), g, sd * 1.7, .9, z, 16); w.rotation.z = Math.PI / 2;
    const h = cyl(.25, .25, .3, mat(INK), g, sd * 1.75, .9, z, 10); h.rotation.z = Math.PI / 2;
  }
  const t = cyl(.1, .1, 3, woodD(), g, 0, 1, 4, 6); t.rotation.x = 1.2;
  if (load === 'hay') for (let i = 0; i < 4; i++) rbox(1.3, 1, 2.3, mat(PAL.hay), .25, g, (i % 2 - .5) * 1.4, 2.6, (Math.floor(i / 2) - .5) * 2.4);
  else if (load === 'pumpkin') for (let i = 0; i < 6; i++) ball(.65, gloss(PAL.orange), g, (i % 2 - .5) * 1.3, 2.6, (Math.floor(i / 2) - 1) * 1.5, 12).scale.y = .8;
  else if (load === 'barrel') for (let i = 0; i < 3; i++) { const b = cyl(.6, .6, 1.4, wood(), g, 0, 2.8, (i - 1) * 1.6, 12); }
  return shadows(g);
}
export function makeWell() {
  const g = new THREE.Group(), st = mat(PAL.stone);
  cyl(1.6, 1.7, 1.4, st, g, 0, .7, 0, 18); cyl(1.25, 1.25, 1.42, mat('#2a2a3a'), g, 0, .72, 0, 18);
  for (const sd of [-1, 1]) rbox(.3, 3, .3, wood(), .08, g, sd * 1.4, 2.2, 0);
  const r = cone(2.4, 1.4, mat(PAL.red), g, 0, 4.2, 0, 4); r.rotation.y = Math.PI / 4;
  const ax = cyl(.12, .12, 2.8, woodD(), g, 0, 2.8, 0, 6); ax.rotation.z = Math.PI / 2;
  cyl(.4, .35, .5, wood(), g, 0, 2.1, 0, 10);
  return g;
}
export function makeBeehive() {
  const g = new THREE.Group();
  rbox(1.2, .5, 1.2, woodD(), .08, g, 0, .25, 0);
  for (let i = 0; i < 4; i++) cyl(.65 - i * .1, .7 - i * .1, .4, gloss(PAL.yellow), g, 0, .7 + i * .38, 0, 14);
  ball(.3, gloss(PAL.yellow), g, 0, 2.1, 0, 10);
  ball(.15, mat(INK), g, 0, .7, .66, 8);
  return g;
}
export function makeCoop() {
  const g = new THREE.Group();
  rbox(4, 2.4, 3, gloss('#ffd21f'), .15, g, 0, 2.2, 0);
  for (const x of [-1.7, 1.7]) for (const z of [-1.3, 1.3]) rbox(.25, 1.2, .25, woodD(), .05, g, x, .6, z);
  const r = cone(3.4, 1.8, gloss(PAL.red), g, 0, 4.3, 0, 4); r.rotation.y = Math.PI / 4; r.scale.z = .8;
  rbox(.9, 1, .2, mat(INK), .1, g, 0, 1.9, 1.52);
  const ramp = rbox(.8, .1, 2, wood(), .03, g, 0, .7, 2.2); ramp.rotation.x = .55;
  return g;
}
export function makeSunflower() {
  const g = new THREE.Group();
  cyl(.08, .1, 3, mat(PAL.leaf), g, 0, 1.5, 0, 6);
  const head = new THREE.Group(); head.position.set(0, 3.1, .15); head.rotation.x = -.35; g.add(head);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; ball(.32, gloss(PAL.yellow), head, Math.cos(a) * .55, Math.sin(a) * .55, 0, 8).scale.set(1, 1, .3); }
  ball(.4, mat('#6b4423'), head, 0, 0, .05, 10).scale.z = .4;
  for (const sd of [-1, 1]) ball(.3, mat(PAL.leaf2), g, sd * .3, 1.4, 0, 8).scale.set(1.2, .3, .7);
  return g;
}
export function makeAppleTree(fruit = PAL.red) {
  const g = new THREE.Group();
  cyl(.35, .5, 2.4, mat(PAL.wood), g, 0, 1.2, 0, 8);
  ball(2.1, mat(PAL.leaf2), g, 0, 3.6, 0, 16).scale.y = .85;
  ball(1.4, mat(PAL.leaf), g, .9, 3, .6, 12); ball(1.3, mat(PAL.leaf), g, -.9, 3.2, -.4, 12);
  for (let i = 0; i < 9; i++) { const a = i * 2.3, y = 2.8 + (i % 3) * .7; ball(.22, gloss(fruit), g, Math.cos(a) * 1.85, y, Math.sin(a) * 1.85, 8); }
  return g;
}
export function makeCornStalk() {
  const g = new THREE.Group(), lf = mat('#9fbf3a');
  cyl(.08, .12, 3.4, lf, g, 0, 1.7, 0, 5);
  for (let i = 0; i < 4; i++) { const l = cone(.12, 1.5, lf, g, Math.cos(i * 2.2) * .4, 1.2 + i * .55, Math.sin(i * 2.2) * .4, 4); l.rotation.set(Math.sin(i * 2.2) * 1.1, 0, -Math.cos(i * 2.2) * 1.1); }
  const cob = cyl(.15, .12, .6, gloss(PAL.yellow), g, .18, 2.2, 0, 6); cob.rotation.z = -.3;
  cone(.15, .7, mat('#e8c26a'), g, 0, 3.6, 0, 5);
  return g;
}
export function makeLantern(col = PAL.orange) {
  const g = new THREE.Group();
  cyl(.1, .14, 4.6, mat(INK), g, 0, 2.3, 0, 6);
  const arm = rbox(1.4, .12, .12, mat(INK), .04, g, .6, 4.5, 0);
  ball(.38, mat(col, { emissive: col, emissiveIntensity: .9 }), g, 1.2, 4, 0, 10).scale.y = 1.2;
  return g;
}
export function makePicnicTable() {
  const g = new THREE.Group();
  rbox(3.2, .2, 1.4, gloss(PAL.red), .06, g, 0, 1.2, 0);
  for (const z of [-1.2, 1.2]) rbox(3.2, .15, .5, wood(), .05, g, 0, .7, z);
  for (const x of [-1.2, 1.2]) for (const sd of [-1, 1]) { const l = rbox(.15, 1.6, .15, woodD(), .04, g, x, .6, sd * .5); l.rotation.x = sd * .55; }
  return g;
}
export function makeHayStack() {
  const g = new THREE.Group(), m = mat(PAL.hay, { roughness: 1 });
  for (let i = 0; i < 3; i++) rbox(2.6, 1.3, 1.4, m, .3, g, (i - 1) * 2.7, .65, 0);
  for (let i = 0; i < 2; i++) rbox(2.6, 1.3, 1.4, m, .3, g, (i - .5) * 2.7, 1.95, 0);
  rbox(2.6, 1.3, 1.4, m, .3, g, 0, 3.25, 0);
  return g;
}
export function makeWoodFence(len = 12, col = PAL.white) {
  const g = new THREE.Group(), m = mat(col);
  for (let x = 0; x <= len; x += 3) rbox(.3, 1.6, .3, m, .08, g, x - len / 2, .8, 0);
  for (const y of [.55, 1.2]) rbox(len, .22, .14, m, .06, g, 0, y, 0);
  return g;
}

// ================================================================== landmarks
export function makeWatermill() {
  const g = new THREE.Group();
  rbox(9, 7, 8, mat('#e9e2d2'), .2, g, 0, 3.5, 0);
  for (let i = 0; i < 4; i++) rbox(9.2, .3, 8.2, mat(PAL.stone), .08, g, 0, .8 + i * 1.8, 0);
  const roof = cone(8, 4, gloss(PAL.red), g, 0, 9, 0, 4); roof.rotation.y = Math.PI / 4; roof.scale.z = .9;
  rbox(1.8, 3, .3, mat(PAL.woodD), .08, g, 0, 1.5, 4.05);
  for (const x of [-2.6, 2.6]) rbox(1.5, 1.5, .25, mat('#ffe9a8', { emissive: '#ffb84a', emissiveIntensity: .4 }), .08, g, x, 4.5, 4.05);
  const wheel = new THREE.Group(); wheel.name = 'wheel'; wheel.position.set(5.6, 3.2, 0); g.add(wheel);
  const rim = mesh(torusGeo(3.6, .3, 8, 30), wood(), 0, 0, 0, wheel); rim.rotation.y = Math.PI / 2;
  const rim2 = mesh(torusGeo(3.6, .3, 8, 30), wood(), .9, 0, 0, wheel); rim2.rotation.y = Math.PI / 2;
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    const p = rbox(1.3, .2, 1.2, mat(PAL.woodD), .05, wheel, .45, Math.sin(a) * 3.6, Math.cos(a) * 3.6); p.rotation.x = -a;
    if (i % 3 === 0) { const s = rbox(.2, 7, .2, wood(), .05, wheel, .45, 0, 0); s.rotation.x = a; }
  }
  const ax = cyl(.4, .4, 2.2, metal('#555a66'), wheel, .2, 0, 0, 10); ax.rotation.z = Math.PI / 2;
  return shadows(g);
}

export function makeFerrisWheel(r = 13) {
  const g = new THREE.Group(), frame = gloss(PAL.white);
  for (const sd of [-1, 1]) for (const dz of [-1, 1]) { const l = rbox(.6, r + 3, .6, frame, .15, g, dz * r * .35, (r + 3) / 2, sd * 2.2); l.rotation.z = -dz * .36; }
  rbox(6, 1, 6, gloss(PAL.blue), .3, g, 0, .5, 0);
  const wheel = new THREE.Group(); wheel.name = 'wheel'; wheel.position.y = r + 2.2; g.add(wheel);
  for (const z of [-1.4, 1.4]) mesh(torusGeo(r, .3, 8, 48), gloss(PAL.red), 0, 0, z, wheel);
  const cols = [PAL.yellow, PAL.blue, PAL.green, PAL.pink, PAL.orange, PAL.purple];
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2, x = Math.cos(a) * r, y = Math.sin(a) * r;
    const s = rbox(.25, r, .25, frame, .06, wheel, x / 2, y / 2, 0); s.rotation.z = a - Math.PI / 2;
    ball(1.2, gloss(cols[i % cols.length]), wheel, x, y - 1, 0, 14).scale.set(1, .8, 1);
    ball(.25, mat('#fff7c0', { emissive: '#ffe066', emissiveIntensity: 1 }), wheel, x, y, 1.5, 6);
  }
  ball(1, gloss(PAL.yellow), wheel, 0, 0, 0, 14);
  return shadows(g);
}

export function makeCarousel() {
  const g = new THREE.Group();
  cyl(7, 7.3, .8, gloss(PAL.purple), g, 0, .4, 0, 32);
  const top = new THREE.Group(); top.name = 'top'; g.add(top);
  cyl(.6, .6, 7, metal('#ffcc22'), top, 0, 4, 0, 12);
  for (let i = 0; i < 16; i++) {
    const c = mesh(new THREE.ConeGeometry(8, 3, 2, 1, true, i / 16 * Math.PI * 2, Math.PI / 8), mat(i % 2 ? PAL.red : PAL.white, { side: DS, roughness: .45 }), 0, 8.5, 0, top);
    c.castShadow = true;
  }
  ball(.6, gloss(PAL.yellow), top, 0, 10.3, 0, 12);
  const cols = [PAL.white, '#ffb3c1', PAL.yellow, '#bfe8ff'];
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2, x = Math.cos(a) * 5, z = Math.sin(a) * 5;
    cyl(.1, .1, 6, metal('#ffcc22'), top, x, 4, z, 6);
    const h = new THREE.Group(); h.position.set(x, 2.4 + (i % 2) * .6, z); h.rotation.y = -a; top.add(h);
    ball(.8, gloss(cols[i % 4]), h, 0, 0, 0, 12).scale.set(.7, .7, 1.3);
    ball(.5, gloss(cols[i % 4]), h, 0, .6, .9, 10);
    eye(h, .2, .75, 1.3, .12); eye(h, -.2, .75, 1.3, .12);
  }
  return shadows(g);
}

export function makeBalloon(a = PAL.red, b = PAL.yellow) {
  const g = new THREE.Group();
  for (let i = 0; i < 10; i++) mesh(new THREE.SphereGeometry(6, 4, 12, i / 10 * Math.PI * 2, Math.PI / 5), gloss(i % 2 ? a : b), 0, 10, 0, g).scale.y = 1.15;
  const c = cone(3.3, 4, gloss(a), g, 0, 4.3, 0, 12); c.rotation.x = Math.PI;
  rbox(2, 1.4, 2, wood(), .2, g, 0, .7, 0);
  for (const [x, z] of [[-.9, -.9], [.9, -.9], [-.9, .9], [.9, .9]]) { const r = cyl(.04, .04, 4, mat(INK), g, x * 1.3, 3, z * 1.3, 4); r.rotation.set(z * .25, 0, -x * .25); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

export function makeSkiLodge() {
  const g = new THREE.Group(), log = mat('#8a5a2b', { roughness: .9 }), snow = mat('#ffffff', { roughness: .9 });
  rbox(18, 6, 12, log, .3, g, 0, 3, 0);
  const s = new THREE.Shape(); s.moveTo(-10.5, 0); s.lineTo(0, 10); s.lineTo(10.5, 0); s.lineTo(-10.5, 0);
  mesh(new THREE.ExtrudeGeometry(s, { depth: 13.5, bevelEnabled: true, bevelSize: .2, bevelThickness: .2 }), snow, 0, 6, -6.75, g);
  const gab = mesh(new THREE.ShapeGeometry(s), log, 0, 6, 6.05, g); gab.scale.set(.9, .9, 1);
  const glow = mat('#ffe9a8', { emissive: '#ffb84a', emissiveIntensity: .8 });
  for (const x of [-5.5, 0, 5.5]) rbox(3, 3, .3, glow, .1, g, x, 3.2, 6.05);
  rbox(4, 4.5, .3, glow, .1, g, 0, 9.2, 6.07);
  rbox(18.6, .4, 3, wood(), .1, g, 0, 1.2, 7.4);
  for (let x = -9; x <= 9; x += 2) rbox(.25, 1.4, .25, wood(), .05, g, x, 2.1, 8.8);
  rbox(18.4, .25, .25, wood(), .05, g, 0, 2.8, 8.8);
  rbox(2, 7, 2, mat(PAL.stone), .2, g, 6.5, 11, -3);
  const sign = mesh(new THREE.PlaneGeometry(8, 2), signMat('SKI LODGE', '#c8372d', '#fff1d6', 512, 128), 0, 6.5, 6.25, g); sign.castShadow = false;
  return shadows(g);
}
export function makeLiftTower(h = 12) {
  const g = new THREE.Group(), m = metal('#8a96a8');
  cyl(.5, .7, h, m, g, 0, h / 2, 0, 10);
  rbox(7, .6, .6, gloss(PAL.yellow), .15, g, 0, h, 0);
  for (const sd of [-1, 1]) cyl(.4, .4, .3, mat(INK), g, sd * 3, h + .3, 0, 10).rotation.x = Math.PI / 2;
  return shadows(g);
}
export function makeLiftChair(col = PAL.red) {
  const g = new THREE.Group();
  cyl(.06, .06, 3, metal('#555a66'), g, 0, -1.5, 0, 4);
  rbox(2.4, .3, 1, gloss(col), .1, g, 0, -3.2, 0);
  rbox(2.4, 1.2, .25, gloss(col), .1, g, 0, -2.6, -.45);
  return shadows(g);
}
export function makeIgloo() {
  const g = new THREE.Group(), ice = mat('#f4fbff', { roughness: .5 });
  mesh(new THREE.SphereGeometry(4, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), ice, 0, 0, 0, g);
  for (let i = 1; i < 4; i++) { const r = mesh(torusGeo(4 * Math.cos(i * .38), .07, 4, 30), mat('#cfe6f7'), 0, 4 * Math.sin(i * .38), 0, g); r.rotation.x = Math.PI / 2; }
  const t = cyl(1.6, 1.6, 3, ice, g, 0, 1.2, 4, 14); t.rotation.x = Math.PI / 2;
  cyl(1.1, 1.1, .2, mat('#2a3a5a'), g, 0, 1.2, 5.45, 14).rotation.x = Math.PI / 2;
  return shadows(g);
}
export function makeFrozenFall(h = 26) {
  const g = new THREE.Group(), rock = mat('#8a96a8', { roughness: .95, flatShading: true }), snow = mat('#ffffff', { roughness: .9 });
  for (const [x, z, r, y] of [[-12, -4, 11, .5], [12, -4, 11, .5], [-7, -9, 12, .8], [7, -9, 12, .8], [0, -12, 13, 1.1], [-16, 2, 7, .35], [16, 2, 7, .35]]) {
    const m = mesh(new THREE.IcosahedronGeometry(r, 1), rock, x, r * y * .7, z, g); m.scale.y = h / r * y * .55;
    const c = mesh(new THREE.IcosahedronGeometry(r * .7, 1), snow, x, r * y * .7 + h * y * .52, z, g); c.scale.y = .35;
  }
  const ice = mat('#bfe8ff', { roughness: .05, metalness: .15, transparent: true, opacity: .9 }), ice2 = mat('#e6f7ff', { roughness: .05 });
  for (let i = 0; i < 14; i++) {
    const x = (i - 6.5) * .9, hh = h * (.65 + Math.sin(i * 1.7) * .2);
    cyl(.7 + (i % 3) * .2, .9 + (i % 2) * .3, hh, i % 2 ? ice : ice2, g, x, hh / 2, -1.5 + Math.sin(i) * .6, 10);
    const ic = cone(.6, 2.5, ice2, g, x + .3, hh * .5, .2, 6); ic.rotation.x = Math.PI;
  }
  cyl(8, 9, .6, ice, g, 0, .1, 4, 28);
  return shadows(g);
}
export function makeSled(col = PAL.red) {
  const g = new THREE.Group();
  rbox(1.4, .25, 3, gloss(col), .1, g, 0, .6, 0);
  for (const sd of [-1, 1]) { rbox(.12, .12, 3.4, metal('#c9ccd6'), .04, g, sd * .6, .12, .1); const c = mesh(torusGeo(.35, .06, 4, 10, Math.PI), metal('#c9ccd6'), sd * .6, .45, 1.8, g); c.rotation.y = Math.PI / 2; }
  for (const sd of [-1, 1]) rbox(.12, .5, .12, metal('#c9ccd6'), .03, g, sd * .6, .35, -.8);
  return g;
}
export function makeCabinSmall(roof = '#ffffff') {
  const g = new THREE.Group(), log = mat('#9a6a3a', { roughness: .9 });
  rbox(7, 4, 6, log, .3, g, 0, 2, 0);
  const r = cone(6, 3, mat(roof), g, 0, 5.4, 0, 4); r.rotation.y = Math.PI / 4; r.scale.z = .85;
  rbox(1.4, 2.4, .2, mat(PAL.woodD), .06, g, 0, 1.2, 3.05);
  rbox(1.4, 1.2, .2, mat('#ffe9a8', { emissive: '#ffb84a', emissiveIntensity: .6 }), .06, g, 2.2, 2.4, 3.05);
  rbox(1, 3, 1, mat(PAL.stone), .1, g, -2.4, 6, -1);
  return shadows(g);
}

export function makeMineEntrance() {
  const g = new THREE.Group(), rock = mat('#c4612f', { roughness: .95, flatShading: true }), beam = mat('#6b4423');
  for (const [x, z, r, sy] of [[0, -6, 14, .75], [-11, -3, 9, .9], [11, -3, 9, .85], [-5, -12, 10, 1.1], [6, -12, 10, 1]]) { const m = mesh(new THREE.IcosahedronGeometry(r, 1), rock, x, r * .25, z, g); m.scale.y = sy; }
  rbox(8, 7, 3, mat('#1a1214'), .3, g, 0, 3.5, 3);
  for (const sd of [-1, 1]) rbox(1, 8, 1, beam, .15, g, sd * 4.3, 4, 4.6);
  rbox(10.5, 1.2, 1.2, beam, .2, g, 0, 8.3, 4.6);
  const s = mesh(new THREE.PlaneGeometry(7, 1.6), signMat('GOLD MINE', '#ffd21f', '#5e3a1a', 512, 128), 0, 10, 5.2, g); s.castShadow = false;
  for (const sd of [-1, 1]) rbox(.25, .2, 14, metal('#7a7f8c'), .05, g, sd * .8, .3, 10);
  for (let z = 4; z < 17; z += 1.4) rbox(2.4, .2, .5, beam, .05, g, 0, .15, z);
  ball(.5, mat('#fff7c0', { emissive: '#ffcc33', emissiveIntensity: 1.2 }), g, 3.6, 6.6, 5.2, 8);
  return shadows(g);
}
export function makeSaloon(text = 'SALOON', col = '#c8372d') {
  const g = new THREE.Group();
  rbox(12, 7, 9, mat('#c9955a', { roughness: .9 }), .2, g, 0, 3.5, 0);
  rbox(12.4, 3, .5, mat(col), .1, g, 0, 8.5, 4.3);
  const s = mesh(new THREE.PlaneGeometry(9, 2), signMat(text, '#fff1d6', '#5e3a1a', 512, 128), 0, 8.5, 4.6, g); s.castShadow = false;
  rbox(12.4, .3, 3, wood(), .08, g, 0, .3, 5.6);
  rbox(12.4, .3, 3.2, mat(col), .08, g, 0, 4.4, 5.8);
  for (const x of [-5.8, -2, 2, 5.8]) rbox(.3, 4.1, .3, wood(), .06, g, x, 2.35, 7);
  for (const x of [-.6, .6]) rbox(1.1, 1.6, .15, mat(PAL.woodD), .05, g, x, 1.9, 4.6);
  for (const x of [-4, 4]) rbox(2, 1.6, .2, mat(PAL.glass, { roughness: .15 }), .05, g, x, 2.6, 4.55);
  return shadows(g);
}
export function makeRockArch(span = 24, h = 18) {
  const g = new THREE.Group(), r1 = mat('#d9773f', { roughness: .95 }), r2 = mat('#c4612f', { roughness: .95 });
  for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) cyl(3.4 - i * .3, 3.8 - i * .3, h / 4, i % 2 ? r1 : r2, g, sd * span / 2, h / 8 + i * h / 4, 0, 12);
  const arc = mesh(new THREE.TorusGeometry(span / 2, 2.6, 10, 30, Math.PI), r1, 0, h - 2, 0, g);
  arc.scale.y = .45;
  return shadows(g);
}
export function makeCowSkull() {
  const g = new THREE.Group(), b = mat('#f6f0e2');
  ball(.6, b, g, 0, .4, 0, 12).scale.set(1, .8, 1.3);
  for (const sd of [-1, 1]) { const h = cone(.15, 1.2, b, g, sd * .8, .7, -.2, 8); h.rotation.z = -sd * 1.2; ball(.13, mat(INK), g, sd * .25, .55, .55, 6); }
  return g;
}
export function makeBarrelCactus() {
  const g = new THREE.Group(), m = mat('#4fbf63', { roughness: .6 });
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ball(.55, m, g, Math.cos(a) * .4, .7, Math.sin(a) * .4, 10).scale.y = 1.3; }
  for (let i = 0; i < 5; i++) ball(.18, gloss(i % 2 ? '#ff5aa8' : PAL.yellow), g, Math.cos(i * 1.3) * .3, 1.45, Math.sin(i * 1.3) * .3, 8);
  return g;
}
export function makePricklyPear() {
  const g = new THREE.Group(), m = mat('#5cc06a', { roughness: .6 });
  const pad = (x, y, z, r, s) => { const p = ball(.8, m, g, x, y, z, 12); p.scale.set(s, s * 1.2, .3); p.rotation.y = r; };
  pad(0, .9, 0, 0, 1.1); pad(.7, 2, 0, .3, .85); pad(-.7, 1.9, .1, -.4, .8); pad(.2, 2.9, 0, .1, .6);
  for (const [x, y] of [[.7, 2.9], [-.7, 2.7], [.3, 3.5]]) ball(.15, gloss('#ff3b6a'), g, x, y, 0, 8);
  return g;
}
export function makeVulture() {
  const g = new THREE.Group(), m = mat('#3a2f3a');
  ball(.7, m, g, 0, 0, 0, 10).scale.set(.8, .7, 1.4);
  ball(.35, mat('#ffb3c1'), g, 0, .3, 1.1, 10);
  cone(.12, .4, gloss(PAL.yellow), g, 0, .25, 1.55, 6).rotation.x = Math.PI / 2;
  const wings = [];
  for (const sd of [-1, 1]) { const w = new THREE.Group(); g.add(w); rbox(3.4, .12, 1.1, m, .05, w, sd * 1.9, 0, 0); wings.push(w); }
  return { group: g, wings };
}
export function makeBird(col = PAL.white) {
  const g = new THREE.Group(), m = mat(col);
  ball(.35, m, g, 0, 0, 0, 8).scale.set(.8, .7, 1.3);
  const wings = [];
  for (const sd of [-1, 1]) { const w = new THREE.Group(); g.add(w); rbox(1.4, .06, .5, m, .02, w, sd * .75, 0, 0); wings.push(w); }
  return { group: g, wings };
}

export function makeRails(len) {
  const g = new THREE.Group();
  for (const sd of [-1, 1]) rbox(.25, .22, len, metal('#7a7f8c'), .05, g, sd * .9, .3, 0);
  for (let z = -len / 2 + .5; z < len / 2; z += 1.3) rbox(2.8, .2, .55, mat('#6b4423'), .05, g, 0, .12, z);
  return g;
}
export function makeWindpump() {
  const g = new THREE.Group(), m = metal('#9aa0ab');
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = cyl(.1, .12, 12, m, g, x * .9, 6, z * .9, 6); l.rotation.set(-z * .07, 0, x * .07); }
  const fan = new THREE.Group(); fan.name = 'fan'; fan.position.set(0, 12.5, .6); g.add(fan);
  for (let i = 0; i < 16; i++) { const b = rbox(.5, 2.4, .05, gloss(i % 2 ? PAL.red : PAL.white), .02, fan, 0, 0, 0); b.position.set(Math.cos(i / 16 * Math.PI * 2) * 1.5, Math.sin(i / 16 * Math.PI * 2) * 1.5, 0); b.rotation.z = i / 16 * Math.PI * 2 - Math.PI / 2; }
  ball(.4, gloss(PAL.red), fan, 0, 0, 0, 10);
  rbox(.1, 1.4, 3, gloss(PAL.red), .03, g, 0, 12.5, -1.8);
  return shadows(g);
}
export function makeIceRinkFence(r = 14) {
  const g = new THREE.Group();
  const n = Math.round(r * 1.2);
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const p = rbox(.3, 1.2, .3, gloss(i % 2 ? PAL.red : PAL.white), .08, g, Math.cos(a) * r, .6, Math.sin(a) * r); }
  const t = mesh(torusGeo(r, .12, 4, 60), gloss(PAL.red), 0, 1.1, 0, g); t.rotation.x = Math.PI / 2;
  return g;
}
export function makeStage(text = 'GIANT PUMPKIN', col = PAL.orange) {
  const g = new THREE.Group();
  rbox(14, 1.2, 9, wood(), .2, g, 0, .6, 0);
  for (const x of [-6.5, 6.5]) rbox(.6, 8, .6, gloss(col), .15, g, x, 4.5, -4);
  rbox(14, 1.6, .5, gloss(col), .15, g, 0, 8.5, -4);
  const s = mesh(new THREE.PlaneGeometry(11, 1.4), signMat(text, '#fff1d6', '#5e3a1a', 512, 64), 0, 8.5, -3.72, g); s.castShadow = false;
  const p = new THREE.Group(); p.position.set(0, 1.2, 0); g.add(p);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; ball(2.6, gloss('#ff8a00'), p, Math.cos(a) * 1.8, 3, Math.sin(a) * 1.8, 16).scale.set(.75, 1, .75); }
  ball(3.3, gloss('#ff8a00'), p, 0, 3, 0, 18).scale.y = .9;
  cyl(.4, .6, 1.4, mat('#4f7a2a'), p, 0, 6.2, 0, 8);
  const rib = rbox(1.6, 3.2, .2, gloss(PAL.blue), .05, p, 3.5, 2.6, 2.2); rib.rotation.y = .7;
  return shadows(g);
}

// ================================================================== draw-call helpers
const meshesOf = (parts, g) => { for (const { material, geo } of parts) { const m = new THREE.Mesh(geo, material); m.castShadow = true; m.receiveShadow = true; g.add(m); } return g; };
/** merge a rigid model into one mesh per material (keeps the model's own transform) */
export function rigid(obj) { const w = new THREE.Group(); w.add(obj); return meshesOf(prefab(w), new THREE.Group()); }
/** merge a model in place, keeping the named children as separate (merged) pivots for animation */
export function compact(obj, ...names) {
  const keep = names.map(n => obj.getObjectByName(n)).filter(Boolean);
  for (const c of keep) c.parent.remove(c);
  const parts = prefab(obj);
  obj.clear();
  meshesOf(parts, obj);
  for (const c of keep) {
    const piv = new THREE.Group(); piv.name = c.name; piv.position.copy(c.position); piv.rotation.copy(c.rotation); piv.scale.copy(c.scale);
    meshesOf(prefab(c), piv); obj.add(piv);
  }
  return obj;
}

/** merge an animated rig's rigid pieces in place: every group in `parts` keeps its own transform but its
 *  meshes (excluding other listed parts) collapse to one mesh per material */
export function slimRig(root, parts) {
  const all = [...parts.filter(Boolean), root];
  root.updateMatrixWorld(true);
  for (const g of all) {
    const inv = g.matrixWorld.clone().invert(), byMat = new Map(), list = [];
    const walk = o => { for (const c of o.children) { if (all.includes(c)) continue; if (c.isMesh) list.push(c); walk(c); } };
    walk(g);
    if (list.length < 2) continue;
    for (const m of list) {
      let geo = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(k)) geo.deleteAttribute(k);
      if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
      geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld));
      if (!byMat.has(m.material)) byMat.set(m.material, []);
      byMat.get(m.material).push(geo);
      m.parent.remove(m);
    }
    for (const [material, geos] of byMat) { const mm = new THREE.Mesh(mergeGeometries(geos), material); mm.castShadow = true; mm.receiveShadow = true; g.add(mm); }
  }
  return root;
}
