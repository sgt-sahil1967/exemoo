// Procedural toy-style models: smooth shading, rounded boxes, big cartoon eyes.
import * as THREE from 'three';
import { mat, gloss, metal, rbox, ball, cyl, cone, mesh, eye, torusGeo, rboxGeo, PAL, INK } from './geo.js';

export const CHARACTERS = [
  { id: 'chicken', name: 'Clucky',   kart: PAL.red,    speed: .96, accel: 1.14, handling: 1.08, weight: .8 },
  { id: 'pig',     name: 'Hamlet',   kart: PAL.blue,   speed: 1.0, accel: 1.0,  handling: 1.0,  weight: 1.05 },
  { id: 'cow',     name: 'Daisy',    kart: PAL.green,  speed: 1.05, accel: .9,  handling: .93,  weight: 1.35 },
  { id: 'fox',     name: 'Rusty',    kart: PAL.purple, speed: 1.02, accel: 1.02, handling: 1.04, weight: .95 },
  { id: 'sheep',   name: 'Wooly',    kart: PAL.orange, speed: .99, accel: 1.06, handling: 1.0,  weight: 1.1 },
  { id: 'duck',    name: 'Quackers', kart: PAL.teal,   speed: .97, accel: 1.1,  handling: 1.12, weight: .85 },
  { id: 'goat',    name: 'Billy',    kart: '#3a4a78',  speed: 1.04, accel: .95, handling: .97,  weight: 1.2 },
  { id: 'bunny',   name: 'Clover',   kart: PAL.pink,   speed: .95, accel: 1.16, handling: 1.12, weight: .75 },
];

let T = null;
export function setModelTextures(t) { T = t; }

const W = () => mat(PAL.white);
const BLK = () => mat(PAL.black);

// ---------------------------------------------------------------- heads
// origin = head centre, facing +z, radius ~0.55
export function makeHead(id) {
  const h = new THREE.Group();
  const twoEyes = (y = .12, x = .2, z = .42, s = .15) => { eye(h, -x, y, z, s); eye(h, x, y, z, s); };
  switch (id) {
    case 'chicken': {
      ball(.52, W(), h, 0, 0, 0, 28);
      [[-.14, .5, .02, .15], [0, .58, -.06, .17], [.14, .5, -.14, .14]].forEach(([x, y, z, r]) => ball(r, gloss('#ff2d2d'), h, 0, y, z + x * 0, 14).position.z = -.05 + x);
      const beak = cone(.13, .36, mat(PAL.yellow), h, 0, -.06, .56, 14); beak.rotation.x = Math.PI / 2;
      ball(.1, gloss('#ff2d2d'), h, 0, -.3, .4, 12).scale.set(.8, 1.4, .8);
      twoEyes(.14, .2, .38);
      break;
    }
    case 'pig': {
      ball(.54, mat('#ffb3c1'), h, 0, 0, 0, 28);
      const sn = cyl(.21, .23, .2, mat('#ff94aa'), h, 0, -.1, .52, 20); sn.rotation.x = Math.PI / 2;
      for (const s of [-1, 1]) {
        ball(.045, mat('#8a3a4b'), h, s * .08, -.1, .63, 8);
        const e = cone(.17, .3, mat('#ff94aa'), h, s * .32, .46, -.02, 3); e.rotation.z = -s * .45; e.rotation.y = .5;
      }
      twoEyes(.16, .21, .4);
      break;
    }
    case 'cow': {
      ball(.52, W(), h, 0, .02, 0, 28).scale.set(1, .95, 1.02);
      const mz = ball(.36, mat(PAL.snout), h, 0, -.22, .36, 24); mz.scale.set(1.05, .75, .85);
      for (const s of [-1, 1]) {
        ball(.06, BLK(), h, s * .12, -.2, .64, 10).scale.set(1, .7, .5);
        const horn = cone(.08, .32, mat(PAL.horn), h, s * .3, .5, -.06, 12); horn.rotation.z = -s * .45;
        const ear = ball(.17, W(), h, s * .55, .22, -.05, 12); ear.scale.set(1.2, .45, .7);
        ball(.11, mat(PAL.snout), h, s * .6, .22, -.0, 10).scale.set(1, .3, .55);
      }
      ball(.2, BLK(), h, .22, .34, .2, 14).scale.set(1, .7, .6);
      twoEyes(.14, .19, .4);
      break;
    }
    case 'fox': {
      ball(.52, mat('#ff7a1a'), h, 0, 0, 0, 28);
      const mz = cone(.26, .5, mat('#fff3e6'), h, 0, -.12, .52, 18); mz.rotation.x = Math.PI / 2;
      ball(.07, BLK(), h, 0, -.12, .78, 10);
      for (const s of [-1, 1]) {
        ball(.22, mat('#fff3e6'), h, s * .26, -.2, .3, 14).scale.set(1, .7, .7);
        const e = cone(.18, .42, mat('#ff7a1a'), h, s * .3, .52, -.05, 12); e.rotation.z = -s * .3;
        const ei = cone(.1, .26, mat(INK), h, s * .3, .5, .02, 10); ei.rotation.z = -s * .3;
      }
      twoEyes(.16, .2, .4);
      break;
    }
    case 'sheep': {
      ball(.42, mat('#4a4458'), h, 0, -.05, .12, 24).scale.set(.9, 1.05, 1);
      for (let i = 0; i < 10; i++) {
        const a = i / 10 * Math.PI * 2;
        ball(.22, W(), h, Math.cos(a) * .38, .28 + Math.sin(a * 2) * .06, Math.sin(a) * .25 - .12, 14);
      }
      ball(.26, W(), h, 0, .48, .05, 16);
      for (const s of [-1, 1]) { const e = ball(.13, mat('#4a4458'), h, s * .46, .02, .08, 12); e.scale.set(1.5, .5, .7); }
      twoEyes(.08, .16, .45, .13);
      break;
    }
    case 'duck': {
      ball(.5, mat(PAL.yellow), h, 0, 0, 0, 28);
      const bill = ball(.26, mat(PAL.orange), h, 0, -.1, .48, 18); bill.scale.set(1.25, .35, 1);
      ball(.09, mat(PAL.yellow), h, 0, .52, -.02, 10).scale.set(.6, 1.6, .6);
      twoEyes(.14, .2, .38);
      break;
    }
    case 'goat': {
      ball(.5, mat('#e8e4da'), h, 0, 0, 0, 28);
      const mz = ball(.24, mat('#d8d1c2'), h, 0, -.2, .36, 16); mz.scale.set(1, .8, 1.1);
      const beard = cone(.1, .32, mat('#f5f1e8'), h, 0, -.5, .36, 10); beard.rotation.x = Math.PI;
      for (const s of [-1, 1]) {
        const horn = mesh(torusGeo(.18, .055, 8, 16, Math.PI * 1.1), mat('#8a6a48'), s * .2, .42, -.12, h);
        horn.rotation.set(0, Math.PI / 2, .4 * s);
        const ear = ball(.15, mat('#e8e4da'), h, s * .5, .08, -.02, 12); ear.scale.set(1.5, .45, .7);
        ball(.05, BLK(), h, s * .07, -.2, .58, 8);
      }
      twoEyes(.14, .2, .38);
      break;
    }
    case 'bunny': {
      ball(.5, mat('#f6f0ff'), h, 0, 0, 0, 28);
      for (const s of [-1, 1]) {
        const ear = ball(.14, mat('#f6f0ff'), h, s * .17, .72, -.08, 14); ear.scale.set(1, 3, .7); ear.rotation.z = -s * .12;
        const inr = ball(.08, mat('#ffb3cf'), h, s * .17, .72, -.02, 12); inr.scale.set(1, 3.6, .5); inr.rotation.z = -s * .12;
        ball(.14, mat('#ffe3ef'), h, s * .14, -.18, .4, 12).scale.set(1, .8, .7);
      }
      ball(.07, mat(PAL.pink), h, 0, -.07, .5, 10);
      rbox(.12, .1, .04, W(), .02, h, 0, -.3, .47);
      twoEyes(.14, .2, .38);
      break;
    }
  }
  return h;
}

export const BODY_COLORS = { chicken: PAL.white, pig: '#ffb3c1', cow: PAL.white, fox: '#ff7a1a', sheep: PAL.white, duck: PAL.yellow, goat: '#e8e4da', bunny: '#f6f0ff' };

// ---------------------------------------------------------------- karts
function tyreGeo(r, w) {
  const c = .12, pts = [];
  pts.push(new THREE.Vector2(r * .55, -w / 2));
  for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + i / 6 * Math.PI / 2; pts.push(new THREE.Vector2(r - c + Math.cos(a) * c, -w / 2 + c + Math.sin(a) * c)); }
  for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI / 2; pts.push(new THREE.Vector2(r - c + Math.cos(a) * c, w / 2 - c + Math.sin(a) * c)); }
  pts.push(new THREE.Vector2(r * .55, w / 2));
  return new THREE.LatheGeometry(pts, 22);
}
const tyreCache = {};

export function makeKart(ch, tint = 0) {
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);
  const col = new THREE.Color(ch.kart).offsetHSL(tint, 0, 0);
  const paint = mat('#' + col.getHexString(), { roughness: .3, metalness: .15 });
  const paintD = mat('#' + col.clone().multiplyScalar(.7).getHexString(), { roughness: .4, metalness: .1 });
  const dark = mat('#2a2a3a', { roughness: .7 });
  const chrome = metal('#e4e8ef');

  rbox(1.95, .26, 3.1, dark, .1, body, 0, .42, 0);
  rbox(1.7, .62, 2.3, paint, .28, body, 0, .74, -.2);
  const nose = rbox(1.45, .42, 1.15, paint, .2, body, 0, .64, 1.32); nose.rotation.x = .12;
  rbox(2.05, .28, .34, dark, .12, body, 0, .48, 1.98);
  for (const s of [-1, 1]) {
    rbox(.42, .42, 1.75, paintD, .18, body, s * .98, .6, -.1);
    rbox(.1, .12, 1.2, mat(PAL.white), .05, body, s * 1.2, .66, -.1); // stripe
  }
  // white roundel on the nose
  const rd = cyl(.28, .28, .04, mat(PAL.white), body, 0, .88, 1.22, 24); rd.rotation.x = .12;
  rbox(1.05, .95, .3, dark, .14, body, 0, 1.15, -.85);
  rbox(1.2, .52, .8, metal('#6b6f7a'), .14, body, 0, .82, -1.38);
  for (const s of [-1, 1]) { const ex = cyl(.11, .13, .55, chrome, body, s * .36, .96, -1.86, 14); ex.rotation.x = Math.PI / 2 - .35; }
  const sw = new THREE.Group(); sw.position.set(0, 1.2, .48); sw.rotation.x = -.95; body.add(sw);
  mesh(torusGeo(.25, .05, 8, 20), dark, 0, 0, 0, sw);
  rbox(.46, .05, .05, dark, .02, sw);

  const wheels = [], steerPivots = [];
  const tyreMat = mat('#22222c', { roughness: .85 });
  const hub = gloss(PAL.yellow);
  for (const [x, z, r, w, front] of [[-1.06, 1.12, .4, .4, 1], [1.06, 1.12, .4, .4, 1], [-1.1, -1.05, .5, .52, 0], [1.1, -1.05, .5, .52, 0]]) {
    const pivot = new THREE.Group(); pivot.position.set(x, r, z); body.add(pivot);
    const wheel = new THREE.Group(); pivot.add(wheel);
    const key = r + ',' + w;
    tyreCache[key] ||= tyreGeo(r, w);
    const t = mesh(tyreCache[key], tyreMat, 0, 0, 0, wheel); t.rotation.z = Math.PI / 2;
    const hb = cyl(r * .55, r * .55, w * .9, hub, wheel, 0, 0, 0, 16); hb.rotation.z = Math.PI / 2;
    const cap = cyl(r * .2, r * .2, w + .02, chrome, wheel, 0, 0, 0, 10); cap.rotation.z = Math.PI / 2;
    wheels.push(wheel);
    if (front) steerPivots.push(pivot);
  }

  // driver
  const driver = new THREE.Group(); driver.position.set(0, 1.05, -.35); body.add(driver);
  const bc = mat(BODY_COLORS[ch.id]);
  ball(.48, bc, driver, 0, .26, 0, 22).scale.set(1, 1.1, .9);
  const scarf = mesh(torusGeo(.32, .11, 10, 20), paint, 0, .64, 0, driver); scarf.rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) {
    const arm = cyl(.1, .1, .6, bc, driver, s * .3, .46, .42, 10); arm.rotation.x = Math.PI / 2 - .4;
    ball(.12, bc, driver, s * .26, .4, .7, 12);
  }
  const head = makeHead(ch.id); head.position.set(0, 1.08, .06); driver.add(head);

  const pole = cyl(.03, .03, 1.4, dark, body, .55, 1.6, -1.1, 6);
  const flag = rbox(.04, .38, .52, paint, .02, body, .55, 2.15, -1.36);
  root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
  return { root, body, wheels, steerPivots, driver, head, steeringWheel: sw, flag, pole };
}

// ---------------------------------------------------------------- animals that cross the road
export function makeCow(scale = 1) {
  const c = new THREE.Group();
  const body = new THREE.Group(); body.position.y = 1.9; c.add(body);
  ball(1, W(), body, 0, 0, 0, 28).scale.set(1.0, 1.05, 1.55);
  [[.55, .55, .4, .55], [.2, .7, -.8, .5], [-.45, .75, -.2, .5], [-.78, .1, .7, .45], [.45, .45, -1.15, .42]].forEach(([x, y, z, r]) => {
    const s = ball(r, BLK(), body, x, y, z, 14); s.scale.set(.55, .7, 1); s.lookAt(s.position.clone().multiplyScalar(2));
  });
  ball(.35, mat(PAL.snout), body, 0, -.95, -.2, 14);
  const tail = new THREE.Group(); tail.position.set(0, .4, -1.5); tail.rotation.x = .4; body.add(tail);
  cyl(.06, .06, 1.1, W(), tail, 0, -.55, 0, 6); ball(.18, BLK(), tail, 0, -1.1, 0, 10);
  const legs = [];
  for (const [lx, lz] of [[-.5, .85], [.5, .85], [-.5, -.9], [.5, -.9]]) {
    const leg = new THREE.Group(); leg.position.set(lx, 1.3, lz); c.add(leg);
    cyl(.26, .24, 1.2, W(), leg, 0, -.6, 0, 12); cyl(.27, .29, .28, mat(PAL.hoof), leg, 0, -1.16, 0, 12);
    legs.push(leg);
  }
  const head = new THREE.Group(); head.position.set(0, 2.75, 1.75); c.add(head);
  ball(.85, W(), head, 0, 0, 0, 24).scale.set(1.05, .95, 1);
  const mz = ball(.62, mat(PAL.snout), head, 0, -.35, .62, 24); mz.scale.set(1.1, .7, .85);
  for (const s of [-1, 1]) {
    ball(.1, BLK(), head, s * .25, -.32, 1.12, 10).scale.set(1, 1, .6);
    eye(head, s * .38, .25, .55, .26);
    const horn = cone(.14, .6, mat(PAL.horn), head, s * .5, .85, -.05, 10); horn.rotation.z = -s * .5;
    const ear = ball(.25, W(), head, s * .95, .45, -.15, 12); ear.scale.set(1.1, .35, .5);
    ball(.17, mat(PAL.snout), head, s * 1.0, .45, -.06, 10).scale.set(1, .3, .3);
  }
  ball(.38, BLK(), head, .45, .55, .2, 14).scale.set(1, 1, .6);
  const collar = mesh(torusGeo(.62, .09, 8, 24), gloss(PAL.red), 0, 2.05, 1.3, c); collar.rotation.x = Math.PI / 2 - .35;
  cyl(.14, .26, .4, metal('#ffcc22'), c, 0, 1.45, 1.62, 14);
  c.scale.setScalar(scale * .62);
  return { group: c, legs, head, tail, body };
}

export function makeSheep(scale = 1) {
  const c = new THREE.Group();
  const body = new THREE.Group(); body.position.y = 1.5; c.add(body);
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2, b = (i % 4) / 4 * Math.PI;
    ball(.55, W(), body, Math.cos(a) * .55, Math.sin(b) * .35, Math.sin(a) * .85, 14);
  }
  ball(.9, W(), body, 0, .1, 0, 20).scale.set(1, .9, 1.3);
  const legs = [];
  for (const [lx, lz] of [[-.4, .6], [.4, .6], [-.4, -.6], [.4, -.6]]) {
    const leg = new THREE.Group(); leg.position.set(lx, 1.0, lz); c.add(leg);
    cyl(.13, .12, 1.0, mat('#4a4458'), leg, 0, -.5, 0, 10); legs.push(leg);
  }
  const head = new THREE.Group(); head.position.set(0, 2.0, 1.25); c.add(head);
  ball(.45, mat('#4a4458'), head, 0, 0, .1, 20).scale.set(.9, 1, 1.1);
  for (let i = 0; i < 5; i++) ball(.2, W(), head, (i - 2) * .14, .38, -.05, 10);
  for (const s of [-1, 1]) { eye(head, s * .17, .08, .45, .12); ball(.14, mat('#4a4458'), head, s * .45, .05, 0, 10).scale.set(1.6, .5, .7); }
  const tail = new THREE.Group(); tail.position.set(0, 1.6, -1.15); c.add(tail); ball(.25, W(), tail);
  c.scale.setScalar(scale);
  return { group: c, legs, head, tail, body };
}

export function makePig(scale = 1) {
  const c = new THREE.Group();
  const pink = mat('#ffb3c1');
  const body = new THREE.Group(); body.position.y = 1.2; c.add(body);
  ball(1, pink, body, 0, 0, 0, 24).scale.set(.95, .85, 1.35);
  const legs = [];
  for (const [lx, lz] of [[-.45, .7], [.45, .7], [-.45, -.7], [.45, -.7]]) {
    const leg = new THREE.Group(); leg.position.set(lx, .8, lz); c.add(leg);
    cyl(.18, .16, .75, pink, leg, 0, -.4, 0, 10); cyl(.17, .17, .1, mat(PAL.hoof), leg, 0, -.78, 0, 10); legs.push(leg);
  }
  const head = new THREE.Group(); head.position.set(0, 1.55, 1.25); c.add(head);
  ball(.62, pink, head, 0, 0, 0, 22);
  const sn = cyl(.26, .28, .24, mat('#ff94aa'), head, 0, -.1, .6, 18); sn.rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) {
    ball(.05, mat('#8a3a4b'), head, s * .09, -.1, .73, 8);
    eye(head, s * .24, .16, .48, .15);
    const e = cone(.2, .34, mat('#ff94aa'), head, s * .38, .5, 0, 3); e.rotation.z = -s * .4;
  }
  const tail = new THREE.Group(); tail.position.set(0, 1.4, -1.35); c.add(tail);
  mesh(torusGeo(.12, .04, 6, 12, Math.PI * 1.6), mat('#ff94aa'), 0, 0, 0, tail);
  c.scale.setScalar(scale);
  return { group: c, legs, head, tail, body };
}

export function makeTumbleweed(scale = 1) {
  const c = new THREE.Group();
  const roll = new THREE.Group(); roll.position.y = 1.3; c.add(roll);
  const m = mat('#b88a4a', { roughness: 1 });
  for (let i = 0; i < 14; i++) {
    const t = mesh(torusGeo(1.1 - (i % 3) * .15, .05, 4, 18), m, 0, 0, 0, roll);
    t.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
  }
  c.scale.setScalar(scale);
  return { group: c, legs: [], head: null, tail: null, body: roll, roll };
}

// ---------------------------------------------------------------- items
export function makeItemMesh(type) {
  const g = new THREE.Group();
  switch (type) {
    case 'egg': ball(.55, mat('#fff8ec', { roughness: .35 }), g, 0, .6, 0, 24).scale.set(.85, 1.1, .85); break;
    case 'mud': {
      cyl(1.2, 1.4, .35, mat('#6b4423', { roughness: .4 }), g, 0, .18, 0, 24);
      cyl(1.0, 1.15, .12, mat('#8a5a2e', { roughness: .3 }), g, 0, .4, 0, 24);
      for (let i = 0; i < 6; i++) ball(.24, mat('#4a2e16', { roughness: .3 }), g, Math.cos(i * 1.1) * .62, .45, Math.sin(i * 1.1) * .62, 12);
      break;
    }
    case 'bee': {
      const inner = new THREE.Group(); inner.position.y = 1.2; g.add(inner);
      const bm = new THREE.MeshStandardMaterial({ map: T.bee, roughness: .45 });
      const b = mesh(new THREE.SphereGeometry(.55, 24, 16), bm, 0, 0, 0, inner); b.scale.set(.85, .85, 1.25); b.rotation.z = Math.PI / 2;
      for (const s of [-1, 1]) {
        const w = ball(.45, mat('#dff6ff', { transparent: true, opacity: .75, roughness: .2 }), inner, s * .5, .45, 0, 14); w.scale.set(1, .15, .6); w.name = 'wing';
        eye(inner, s * .2, .15, .55, .14);
      }
      const st = cone(.12, .4, mat(INK), inner, 0, 0, -.8, 10); st.rotation.x = -Math.PI / 2;
      break;
    }
    case 'carrot': case 'carrot3': {
      const c = cone(.32, 1.4, gloss(PAL.orange), g, 0, .3, 0, 18); c.rotation.x = Math.PI / 2;
      for (let i = 0; i < 3; i++) { const l = cone(.12, .65, mat(PAL.leaf2), g, (i - 1) * .13, .3, -.9, 10); l.rotation.x = -Math.PI / 2 + (i - 1) * .35; }
      break;
    }
    case 'clover': {
      for (let i = 0; i < 4; i++) {
        const leaf = new THREE.Group(); leaf.rotation.z = i * Math.PI / 2 + Math.PI / 4; g.add(leaf);
        for (const s of [-1, 1]) ball(.32, gloss('#2fc65a'), leaf, s * .17, .38, 0, 16).scale.set(1, 1, .35);
      }
      const st = cyl(.05, .06, .8, mat('#1f8a3a'), g, 0, -.55, 0, 8); st.rotation.z = .2;
      g.position.y = 1;
      break;
    }
  }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

// ---------------------------------------------------------------- scenery pieces (built at origin)
export function makeTree(pal = [PAL.leaf, PAL.leaf2], trunk = PAL.wood) {
  const g = new THREE.Group();
  cyl(.45, .7, 3.4, mat(trunk), g, 0, 1.7, 0, 10);
  [[0, 4.8, 0, 2.6, 0], [1.2, 4.2, .6, 1.8, 1], [-1.1, 4.4, -.4, 1.9, 1], [.2, 6.2, .1, 1.8, 1], [-.3, 4.3, 1.1, 1.6, 0]]
    .forEach(([x, y, z, r, k]) => ball(r, mat(pal[k % pal.length]), g, x, y, z, 18));
  return g;
}
export function makePine(snow = false, col = '#2f8f4a') {
  const g = new THREE.Group();
  cyl(.35, .5, 2.4, mat(PAL.woodD), g, 0, 1.2, 0, 8);
  [[3, 3.4, 2.4], [2.4, 3, 4.2], [1.7, 2.6, 5.8]].forEach(([r, h, y]) => {
    cone(r, h, mat(col), g, 0, y, 0, 16);
    if (snow) cone(r * .62, h * .5, mat('#ffffff'), g, 0, y + h * .27, 0, 16);
  });
  return g;
}
export function makeCactus() {
  const g = new THREE.Group(), m = mat('#3fae5a', { roughness: .6 });
  cyl(.6, .65, 6, m, g, 0, 3, 0, 14); ball(.6, m, g, 0, 6, 0, 14);
  for (const [s, y, h] of [[-1, 2.6, 2.2], [1, 3.4, 1.8]]) {
    const arm = cyl(.38, .38, 1.1, m, g, s * .9, y, 0, 12); arm.rotation.z = Math.PI / 2;
    cyl(.38, .38, h, m, g, s * 1.4, y + h / 2, 0, 12); ball(.38, m, g, s * 1.4, y + h, 0, 12);
  }
  ball(.25, gloss('#ff5aa8'), g, 0, 6.5, 0, 10);
  return g;
}
export function makeBush(col = PAL.leaf2) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) ball(1.1 - i * .2, mat(col), g, i * 1.2 - 1.2, .7, (i % 2) * .4, 14);
  return g;
}
export function makeRock(col = '#b9b2a5', s = 1) {
  const g = new THREE.Group();
  const geo = new THREE.IcosahedronGeometry(1.4 * s, 1);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const k = .8 + Math.random() * .35; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * .75, p.getZ(i) * k); }
  geo.computeVertexNormals();
  mesh(geo, mat(col, { flatShading: true, roughness: .95 }), 0, .7 * s, 0, g);
  return g;
}
export function makeHayBale() {
  const g = new THREE.Group();
  const m = cyl(1.2, 1.2, 2, new THREE.MeshStandardMaterial({ map: T.hay, roughness: 1 }), g, 0, 1.2, 0, 22); m.rotation.z = Math.PI / 2;
  for (const x of [-.55, .55]) { const b = mesh(torusGeo(1.22, .05, 6, 28), mat('#c43a2a'), x, 1.2, 0, g); b.rotation.y = Math.PI / 2; }
  return g;
}
export function makePumpkin(s = 1) {
  const g = new THREE.Group(), m = gloss('#ff8a00');
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ball(.62, m, g, Math.cos(a) * .42, .75, Math.sin(a) * .42, 16).scale.set(.75, 1, .75); }
  ball(.8, m, g, 0, .75, 0, 18).scale.y = .9;
  const st = cyl(.08, .12, .45, mat('#4f7a2a'), g, .05, 1.6, 0, 8); st.rotation.z = -.3;
  g.scale.setScalar(s);
  return g;
}
export function makeSnowman() {
  const g = new THREE.Group(), w = mat('#ffffff', { roughness: .9 });
  ball(1.3, w, g, 0, 1.2, 0, 22); ball(.95, w, g, 0, 3.0, 0, 20); ball(.7, w, g, 0, 4.4, 0, 20);
  const n = cone(.12, .7, gloss(PAL.orange), g, 0, 4.4, .95, 10); n.rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) ball(.09, mat(INK), g, s * .25, 4.6, .6, 8);
  for (const y of [2.7, 3.1, 3.5]) ball(.1, mat(INK), g, 0, y, .93, 8);
  const sc = mesh(torusGeo(.62, .16, 8, 20), mat(PAL.red), 0, 3.75, 0, g); sc.rotation.x = Math.PI / 2;
  cyl(.75, .75, .08, mat(INK), g, 0, 4.98, 0, 18); cyl(.48, .48, .7, mat(INK), g, 0, 5.35, 0, 18);
  for (const s of [-1, 1]) { const arm = cyl(.05, .07, 1.6, mat(PAL.woodD), g, s * 1.3, 3.3, 0, 6); arm.rotation.z = s * 1.0; }
  return g;
}

function gambrel(w) {
  const s = new THREE.Shape(); s.moveTo(-w * .56, 0); s.lineTo(-w * .44, w * .26); s.lineTo(0, w * .44); s.lineTo(w * .44, w * .26); s.lineTo(w * .56, 0); s.lineTo(-w * .56, 0);
  return s;
}
export function makeBarn({ wall = PAL.red, roof = '#6b3f22', snow = false } = {}) {
  const g = new THREE.Group();
  const red = mat(wall), white = mat(PAL.white), glass = mat(PAL.glass, { roughness: .15 });
  rbox(10, 7, 8, red, .2, g, 0, 3.5, 0);
  const s = gambrel(10);
  const r = mesh(new THREE.ExtrudeGeometry(s, { depth: 9, bevelEnabled: true, bevelSize: .15, bevelThickness: .15, bevelSegments: 2 }), mat(snow ? '#ffffff' : roof), 0, 7, -4.5, g);
  const gable = mesh(new THREE.ShapeGeometry(s), red, 0, 7, 4.05, g); gable.scale.set(.94, .94, 1);
  const back = mesh(new THREE.ShapeGeometry(s), red, 0, 7, -4.05, g); back.scale.set(.94, .94, 1); back.rotation.y = Math.PI;
  rbox(4, 5, .3, white, .1, g, 0, 2.5, 4.05);
  for (const rz of [.9, -.9]) { const x = rbox(.35, 5.8, .2, red, .05, g, 0, 2.5, 4.25); x.rotation.z = rz; }
  rbox(3.6, .35, .2, white, .05, g, 0, 5, 4.25);
  rbox(1.6, 1.6, .25, white, .08, g, 0, 8.8, 4.15); rbox(1.2, 1.2, .3, glass, .05, g, 0, 8.8, 4.2);
  for (const x of [-3.8, 3.8]) { rbox(1.4, 1.4, .25, white, .08, g, x, 4.8, 4.05); rbox(1, 1, .3, glass, .04, g, x, 4.8, 4.1); }
  for (const x of [-5, 5]) for (const z of [-4, 4]) rbox(.4, 7, .4, white, .1, g, x, 3.5, z);
  g.scale.setScalar(1.6);
  return g;
}
export function makeSilo(cap = PAL.red) {
  const g = new THREE.Group();
  cyl(2.4, 2.4, 13, mat(PAL.white), g, 0, 6.5, 0, 32);
  for (let y = 1.5; y < 13; y += 2.2) cyl(2.48, 2.48, .25, mat(PAL.stone), g, 0, y, 0, 32);
  ball(2.45, gloss(cap), g, 0, 13, 0, 32).scale.y = .8;
  g.scale.setScalar(1.6);
  return g;
}
export function makeFarmhouse(roofCol = PAL.red, wall = PAL.white) {
  const g = new THREE.Group();
  rbox(8, 5, 6, mat(wall), .2, g, 0, 2.5, 0);
  const r = cone(6.4, 3.6, mat(roofCol), g, 0, 6.8, 0, 4); r.rotation.y = Math.PI / 4; r.scale.set(1, 1, .8);
  rbox(1.6, 2.8, .2, mat(PAL.woodD), .08, g, 0, 1.4, 3.05);
  for (const x of [-2.6, 2.6]) rbox(1.5, 1.5, .2, mat(PAL.glass, { roughness: .15 }), .08, g, x, 3, 3.02);
  rbox(.9, 2.6, .9, mat(roofCol), .1, g, 2.4, 7.4, 0);
  g.scale.setScalar(1.6);
  return g;
}
export function makeLogCabin() {
  const g = new THREE.Group(), log = mat('#8a5a2b', { roughness: .9 });
  for (let i = 0; i < 9; i++) for (const [x, z, len, ry] of [[0, 4, 12, 0], [0, -4, 12, 0], [6, 0, 8.6, Math.PI / 2], [-6, 0, 8.6, Math.PI / 2]]) {
    const l = cyl(.35, .35, len, log, g, x, .35 + i * .66, z, 10); l.rotation.z = Math.PI / 2; l.rotation.y = ry;
  }
  const roof = new THREE.Shape(); roof.moveTo(-7, 0); roof.lineTo(0, 4.2); roof.lineTo(7, 0); roof.lineTo(-7, 0);
  mesh(new THREE.ExtrudeGeometry(roof, { depth: 10, bevelEnabled: true, bevelSize: .2, bevelThickness: .2 }), mat('#ffffff'), 0, 6.2, -5, g);
  rbox(1.8, 3, .3, mat(PAL.woodD), .08, g, 0, 1.5, 4.3);
  for (const x of [-3.5, 3.5]) rbox(1.6, 1.4, .3, mat('#ffe9a8', { emissive: '#ffb84a', emissiveIntensity: .6 }), .08, g, x, 3, 4.3);
  rbox(1.2, 4, 1.2, mat(PAL.stone), .1, g, 4, 8, 0);
  g.scale.setScalar(1.4);
  return g;
}
export function makeWindmill() {
  const g = new THREE.Group();
  cyl(1.2, 2.2, 10, mat(PAL.white), g, 0, 5, 0, 16);
  cone(1.8, 2.4, mat(PAL.red), g, 0, 11.2, 0, 16);
  const fan = new THREE.Group(); fan.name = 'fan'; fan.position.set(0, 9.5, 1.9); g.add(fan);
  for (let i = 0; i < 4; i++) { const arm = new THREE.Group(); arm.rotation.z = i * Math.PI / 2; fan.add(arm); rbox(.7, 5.4, .15, mat(PAL.wood), .06, arm, 0, 2.8, 0); }
  ball(.5, mat(PAL.red), fan);
  g.scale.setScalar(1.7);
  return g;
}
export function makeWaterTower() {
  const g = new THREE.Group(), wood = mat('#9a6a3a');
  for (const [x, z] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) cyl(.2, .25, 9, wood, g, x * .9, 4.5, z * .9, 8);
  cyl(3, 3, 4, mat('#a8743f'), g, 0, 11, 0, 24);
  for (const y of [9.6, 11, 12.4]) cyl(3.05, 3.05, .2, metal('#555a66'), g, 0, y, 0, 24);
  cone(3.4, 2.2, mat('#6b3f22'), g, 0, 14.1, 0, 24);
  return g;
}
export function makeMesa(h = 30, r = 22, cols = ['#d9773f', '#c4612f', '#e8915a']) {
  const g = new THREE.Group();
  const n = 5;
  for (let i = 0; i < n; i++) {
    const rr = r * (1 - i * .06), hh = h / n;
    cyl(rr * .97, rr, hh, mat(cols[i % cols.length], { roughness: .95 }), g, 0, hh * (i + .5), 0, 18);
  }
  return g;
}
export function makeTractor(col = PAL.green) {
  const g = new THREE.Group(), body = gloss(col), dark = mat('#2a2a3a');
  rbox(2, 1.4, 3.6, body, .3, g, 0, 1.6, .6);
  rbox(1.6, 1, 1.6, body, .25, g, 0, 2.6, 1.2);
  rbox(2.4, .25, 1.8, gloss(PAL.yellow), .1, g, 0, 4.1, -.8);
  for (const [x, z] of [[-1, -.1], [1, -.1], [-1, -1.5], [1, -1.5]]) cyl(.07, .07, 2.4, dark, g, x, 2.9, z, 6);
  for (const s of [-1, 1]) {
    const big = cyl(1.5, 1.5, .8, dark, g, s * 1.5, 1.5, -1, 22); big.rotation.z = Math.PI / 2;
    const hb = cyl(.8, .8, .85, gloss(PAL.yellow), g, s * 1.5, 1.5, -1, 16); hb.rotation.z = Math.PI / 2;
    const sm = cyl(.75, .75, .5, dark, g, s * 1.2, .75, 2, 18); sm.rotation.z = Math.PI / 2;
  }
  cyl(.12, .12, 1.6, metal('#999'), g, .6, 3.2, 1.9, 8);
  g.scale.setScalar(1.3);
  return g;
}
export function makeScarecrow() {
  const g = new THREE.Group();
  cyl(.12, .12, 5, mat(PAL.wood), g, 0, 2.5, 0, 8);
  const arms = cyl(.1, .1, 3.2, mat(PAL.wood), g, 0, 3.6, 0, 8); arms.rotation.z = Math.PI / 2;
  rbox(1.3, 1.6, .7, mat('#d23a2e'), .2, g, 0, 3.3, 0);
  rbox(1.4, .8, .75, mat('#3a5aa0'), .2, g, 0, 2.4, 0);
  ball(.55, new THREE.MeshStandardMaterial({ map: T.hay, roughness: 1 }), g, 0, 4.6, 0, 16);
  cyl(1.1, 1.1, .08, mat('#c99a33'), g, 0, 5, 0, 18); cyl(.4, .55, .7, mat('#c99a33'), g, 0, 5.35, 0, 14);
  for (const s of [-1, 1]) ball(.08, mat(INK), g, s * .2, 4.7, .5, 8);
  return g;
}
export function makeFlower(col) {
  const g = new THREE.Group();
  cyl(.04, .04, .5, mat(PAL.leaf), g, 0, .25, 0, 5);
  ball(.2, mat(col), g, 0, .55, 0, 8);
  return g;
}
export function makeSnowMound() { const g = new THREE.Group(); ball(1.6, mat('#ffffff', { roughness: .9 }), g, 0, -.4, 0, 16).scale.y = .55; return g; }
export function makeLeafPile(cols = ['#ff8a00', '#e8483b', '#ffd21f']) {
  const g = new THREE.Group();
  for (let i = 0; i < 7; i++) ball(.5, mat(cols[i % cols.length]), g, (Math.random() - .5) * 1.4, .15, (Math.random() - .5) * 1.4, 8).scale.set(1, .35, 1);
  return g;
}
export function makeFencePost(col = PAL.white) { const g = new THREE.Group(); rbox(.4, 2, .4, mat(col), .1, g, 0, 1, 0); return g; }
export { rboxGeo };
