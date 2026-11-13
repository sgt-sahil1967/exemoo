// Bale Brawl - procedural toon farm-animal fighter with a foam bopper.
// Model space: faces +Z, its right is -X, feet at y = 0. The root is turned to face the rival.
// Pose and animation are driven every frame by the combat fighter state (see update()).
import * as THREE from 'three';
import { toon, outline, mesh, place, merged, canvasTex, colanderTexture, INK } from './world/toon.js';
import { SWING, FIGHT, ARENA } from './constants.js';

const PI = Math.PI;
const V3 = THREE.Vector3;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));

/** Per-animal look. fur, belly, muzzle, hoof, plus feature flags. */
const ANIMALS = {
  cow: { fur: '#ffffff', spots: '#26263f', muzzle: '#ffb3c1', hoof: '#3a2a2a', horn: '#fff3c9', ear: '#ffffff', earIn: '#ffb3c1', tail: '#ffffff' },
  pig: { fur: '#ffb0c4', muzzle: '#ff8fab', hoof: '#a8566c', ear: '#ffb0c4', earIn: '#ff8fab', tail: '#ff9cb6' },
  sheep: { fur: '#fbf7ef', face: '#3c3b4f', muzzle: '#56546a', hoof: '#26263f', ear: '#3c3b4f', earIn: '#6d6a85', tail: '#fbf7ef' },
  goat: { fur: '#efe2c8', muzzle: '#d9c49d', hoof: '#4a3a2f', horn: '#8f7a64', ear: '#efe2c8', earIn: '#ffc2c2', beard: '#d9c9a8', tail: '#efe2c8' },
  bull: { fur: '#8a4b2a', muzzle: '#e8b48a', hoof: '#2b1c16', horn: '#fff3c9', ear: '#8a4b2a', earIn: '#d98f6f', ring: '#ffd21f', tail: '#5a2f1a' },
  rooster: { fur: '#ffffff', muzzle: '#ffd21f', hoof: '#ffb020', comb: '#ff3b30', wattle: '#ff3b30', ear: '#ffffff', earIn: '#ffffff', tail: '#2fc65a' },
};

let colanderMap = null;
const spotCache = new Map();
function spotTexture(base, spot) {
  const key = base + spot;
  if (!spotCache.has(key)) {
    spotCache.set(key, canvasTex(256, 128, (g, w, h) => {
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      g.fillStyle = spot;
      const blobs = [[40, 40, 26], [150, 30, 20], [210, 80, 28], [95, 95, 22], [180, 110, 14], [20, 100, 16]];
      for (const [x, y, r] of blobs) {
        g.beginPath();
        for (let a = 0; a < PI * 2; a += 0.4) {
          const rr = r * (0.8 + 0.3 * Math.sin(a * 3 + x));
          g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8);
        }
        g.fill();
      }
    }));
  }
  return spotCache.get(key);
}

/** Pool-noodle segment: ridged foam tube along +Y from 0 to len. */
function noodleGeo(len, r) {
  const g = new THREE.CylinderGeometry(r, r, len, 16, 3, false);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x);
    const k = 1 + 0.09 * Math.cos(a * 8);
    p.setX(i, x * k); p.setZ(i, z * k);
  }
  g.computeVertexNormals();
  g.translate(0, len / 2, 0);
  return g;
}

const _v = new V3(), _v2 = new V3(), _q = new THREE.Quaternion();
const UP = new V3(0, 1, 0);
const POLE_R = new V3(-1, -0.6, -0.2).normalize(), POLE_L = new V3(1, -0.6, -0.3).normalize();

/** Two-bone IK. Returns the elbow; may pull `hand` in when out of reach. */
function solveIK(S, H, a, b, pole, outE) {
  const dir = _v.copy(H).sub(S);
  let d = dir.length();
  if (d < 1e-5) { dir.set(0, -1, 0); d = 1e-5; }
  dir.divideScalar(d);
  const dc = clamp(d, Math.abs(a - b) + 1e-3, a + b - 1e-3);
  if (dc !== d) H.copy(S).addScaledVector(dir, dc);
  const x = (a * a - b * b + dc * dc) / (2 * dc);
  const h = Math.sqrt(Math.max(0, a * a - x * x));
  const p = _v2.copy(pole).addScaledVector(dir, -pole.dot(dir));
  if (p.lengthSq() < 1e-6) p.set(0, -1, 0);
  p.normalize();
  return outE.copy(S).addScaledVector(dir, x).addScaledVector(p, h);
}

/** Place a unit-height cylinder (centred) between two points. */
function limb(m, A, B) {
  const d = _v.copy(B).sub(A);
  const len = d.length();
  m.position.copy(A).addScaledVector(d, 0.5);
  if (len > 1e-6) m.quaternion.setFromUnitVectors(UP, d.divideScalar(len));
  m.scale.set(1, Math.max(1e-3, len), 1);
}

export function createFighter({ animal = 'cow', color = '#ff3b30', name = '' } = {}) {
  const A = ANIMALS[animal] || ANIMALS.cow;
  const root = new THREE.Group();
  root.name = `fighter-${name || animal}`;
  const mats = [];
  const fresh = (c, o = {}) => { const m = toon(c, { ...o, fresh: true }); mats.push(m); return m; };
  const furMat = animal === 'cow' ? fresh('#ffffff', { map: spotTexture(A.fur, A.spots) }) : fresh(A.fur);
  const faceMat = A.face ? fresh(A.face) : furMat;
  const suitMat = fresh(color);
  const suitLight = fresh(new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.35).getStyle());
  const hoofMat = toon(A.hoof);
  const muzzleMat = toon(A.muzzle);
  const whiteMat = toon('#ffffff');
  const inkM = toon(INK);
  const flashMats = [furMat, suitMat, suitLight];
  if (faceMat !== furMat) { mats.push(faceMat); flashMats.push(faceMat); }

  // ── legs (on the root so feet stay planted) ──
  const legGeo = merged([
    [place(new THREE.CylinderGeometry(0.1, 0.11, 0.34, 10), [0, -0.17, 0]), color],
    [place(new THREE.SphereGeometry(0.115, 12, 8), [0, -0.36, 0.02], [0, 0, 0], [1, 0.6, 1.25]), A.hoof],
  ]);
  const legMat = toon('#ffffff', { vc: true });
  const legs = [-1, 1].map((s) => {
    const g = new THREE.Group();
    g.position.set(s * 0.16, 0.42, 0);
    const m = mesh(legGeo, legMat);
    g.add(m);
    root.add(g);
    return g;
  });

  // ── body (pivot at the hips) ──
  const body = new THREE.Group();
  body.position.y = 0.42;
  root.add(body);
  const torso = mesh(new THREE.SphereGeometry(1, 24, 16), furMat);
  torso.scale.set(0.38, 0.42, 0.34);
  torso.position.y = 0.34;
  body.add(torso);
  outline(torso, 0.028);
  // padded overalls: lower dome + bib + straps + padding roll
  const pants = mesh(new THREE.SphereGeometry(1, 24, 12, 0, PI * 2, PI * 0.45, PI * 0.55), suitMat);
  pants.scale.set(0.4, 0.44, 0.36);
  pants.position.y = 0.34;
  body.add(pants);
  const bib = mesh(place(new THREE.CylinderGeometry(0.2, 0.22, 0.24, 16, 1, false, -0.9, 1.8), [0, 0, 0]), suitMat);
  bib.position.set(0, 0.48, 0.14);
  bib.scale.set(1, 1, 0.95);
  body.add(bib);
  const roll = mesh(new THREE.TorusGeometry(0.36, 0.07, 10, 28), suitLight);
  roll.rotation.x = PI / 2;
  roll.position.y = 0.3;
  roll.scale.set(1.05, 0.95, 1);
  body.add(roll);
  for (const s of [-1, 1]) {
    const strap = mesh(new THREE.BoxGeometry(0.07, 0.42, 0.04), suitMat);
    strap.position.set(s * 0.15, 0.6, 0.05);
    strap.rotation.x = -0.35;
    body.add(strap);
    const btn = mesh(new THREE.SphereGeometry(0.035, 10, 8), toon('#ffd21f'), { cast: false });
    btn.position.set(s * 0.13, 0.56, 0.28);
    body.add(btn);
  }
  // tail
  const tail = new THREE.Group();
  tail.position.set(0, 0.25, -0.33);
  body.add(tail);
  if (animal === 'pig') {
    const t = mesh(new THREE.TorusGeometry(0.06, 0.02, 8, 16, PI * 1.6), toon(A.tail));
    t.rotation.y = PI / 2;
    tail.add(t);
  } else if (animal === 'rooster') {
    ['#2fc65a', '#1f8f43', '#2f7cff', '#2fc65a'].forEach((c, k) => {
      const f = mesh(place(new THREE.SphereGeometry(0.1, 10, 8), [0, 0.18, 0], [0, 0, 0], [0.35, 1.2, 0.2]), toon(c));
      f.rotation.set(-0.7 - k * 0.15, 0, (k - 1.5) * 0.35);
      f.position.y = 0.05;
      tail.add(f);
    });
  } else if (animal === 'sheep') {
    tail.add(mesh(new THREE.SphereGeometry(0.08, 10, 8), furMat));
  } else {
    const t = mesh(place(new THREE.CylinderGeometry(0.015, 0.02, 0.3, 6), [0, -0.15, 0]), toon(A.tail === '#ffffff' ? '#f2f2f2' : A.tail));
    t.rotation.x = 0.5;
    const tuft = mesh(new THREE.SphereGeometry(0.045, 8, 6), toon(animal === 'cow' ? INK : A.tail));
    tuft.position.y = -0.3;
    t.add(tuft);
    tail.add(t);
  }
  // sheep wool puffs around the torso
  if (animal === 'sheep') {
    const puffs = [];
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * PI * 2, y = 0.42 + (k % 2) * 0.14;
      puffs.push([place(new THREE.IcosahedronGeometry(0.13, 1), [Math.cos(a) * 0.33, y, Math.sin(a) * 0.29]), A.fur]);
    }
    const wool = mesh(merged(puffs), toon('#ffffff', { vc: true }));
    body.add(wool);
  }

  // ── head ──
  const head = new THREE.Group();
  head.position.set(0, 0.86, 0.04);
  body.add(head);
  const skull = mesh(new THREE.SphereGeometry(1, 24, 16), animal === 'sheep' ? faceMat : furMat);
  skull.scale.set(0.27, 0.25, 0.25);
  head.add(skull);
  outline(skull, 0.022);
  const eyes = [];
  for (const s of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(s * 0.1, 0.05, 0.215);
    eye.rotation.y = s * 0.35;
    const w = mesh(new THREE.SphereGeometry(0.07, 14, 10), whiteMat, { cast: false });
    w.scale.set(1, 1.2, 0.6);
    const pupil = mesh(new THREE.SphereGeometry(0.034, 10, 8), inkM, { cast: false });
    pupil.position.set(0, 0, 0.035);
    const glint = mesh(new THREE.SphereGeometry(0.01, 6, 4), whiteMat, { cast: false });
    glint.position.set(-0.01, 0.012, 0.03);
    pupil.add(glint);
    eye.add(w, pupil);
    const brow = mesh(new THREE.BoxGeometry(0.08, 0.018, 0.02), inkM, { cast: false });
    brow.position.set(0, 0.085, 0.03);
    brow.rotation.z = s * 0.25;
    eye.add(brow);
    head.add(eye);
    eyes.push({ g: eye, pupil, brow, s });
  }
  // muzzle / snout / beak
  if (animal === 'pig') {
    const sn = mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.1, 18), muzzleMat);
    sn.rotation.x = PI / 2;
    sn.position.set(0, -0.04, 0.25);
    head.add(sn);
    for (const s of [-1, 1]) {
      const n = mesh(new THREE.SphereGeometry(0.022, 8, 6), toon('#a8566c'), { cast: false });
      n.position.set(s * 0.04, -0.04, 0.3);
      head.add(n);
    }
  } else if (animal === 'rooster') {
    const beak = mesh(new THREE.ConeGeometry(0.06, 0.16, 10), muzzleMat);
    beak.rotation.x = PI / 2;
    beak.position.set(0, -0.03, 0.29);
    head.add(beak);
    const wat = mesh(new THREE.SphereGeometry(0.05, 10, 8), toon(A.wattle));
    wat.scale.set(0.8, 1.3, 0.7);
    wat.position.set(0, -0.14, 0.2);
    head.add(wat);
  } else {
    const mz = mesh(new THREE.SphereGeometry(1, 18, 12), muzzleMat);
    mz.scale.set(animal === 'goat' ? 0.13 : 0.17, 0.11, 0.12);
    mz.position.set(0, -0.08, 0.2);
    head.add(mz);
    for (const s of [-1, 1]) {
      const n = mesh(new THREE.SphereGeometry(0.02, 8, 6), inkM, { cast: false });
      n.scale.set(1, 1.4, 0.6);
      n.position.set(s * 0.055, -0.06, 0.315);
      head.add(n);
    }
    if (animal === 'bull') {
      const ring = mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 16), toon(A.ring), { cast: false });
      ring.position.set(0, -0.12, 0.31);
      head.add(ring);
    }
    if (animal === 'goat') {
      const beard = mesh(new THREE.ConeGeometry(0.05, 0.16, 8), toon(A.beard));
      beard.rotation.x = PI;
      beard.position.set(0, -0.23, 0.17);
      head.add(beard);
    }
  }
  // ears (poke out under the colander)
  const ears = [];
  if (animal !== 'rooster') {
    for (const s of [-1, 1]) {
      const ear = new THREE.Group();
      ear.position.set(s * 0.24, 0.06, -0.02);
      const flop = animal === 'pig' || animal === 'sheep' || animal === 'goat';
      ear.rotation.z = s * (flop ? 1.9 : 1.35);
      const e = mesh(place(new THREE.SphereGeometry(0.07, 12, 8), [0, 0.08, 0], [0, 0, 0], [0.75, 1.3, 0.35]), toon(A.ear));
      const ei = mesh(place(new THREE.SphereGeometry(0.05, 10, 6), [0, 0.08, 0.018], [0, 0, 0], [0.6, 1.1, 0.25]), toon(A.earIn), { cast: false });
      ear.add(e, ei);
      head.add(ear);
      ears.push(ear);
    }
  }
  // horns
  if (A.horn) {
    for (const s of [-1, 1]) {
      const big = animal === 'bull';
      const h = mesh(new THREE.ConeGeometry(big ? 0.055 : 0.035, big ? 0.3 : 0.16, 10), toon(A.horn));
      h.position.set(s * (big ? 0.34 : 0.12), big ? 0.04 : 0.22, big ? 0.04 : 0);
      h.rotation.z = -s * (big ? 1.15 : 0.35);
      if (animal === 'goat') h.rotation.x = -0.6;
      head.add(h);
    }
  }
  // colander helmet with handles (rooster comb pokes through)
  colanderMap = colanderMap || colanderTexture();
  const helmet = new THREE.Group();
  helmet.position.set(0, 0.07, -0.01);
  helmet.rotation.x = -0.12;
  head.add(helmet);
  const dome = mesh(new THREE.SphereGeometry(0.29, 24, 10, 0, PI * 2, 0, PI * 0.5), toon('#ffffff', { map: colanderMap }));
  dome.scale.set(1, 0.85, 1);
  helmet.add(dome);
  outline(dome, 0.015);
  const rim = mesh(new THREE.TorusGeometry(0.29, 0.018, 8, 32), toon('#b9c1cf'));
  rim.rotation.x = PI / 2;
  helmet.add(rim);
  for (const s of [-1, 1]) {
    const hd = mesh(new THREE.TorusGeometry(0.05, 0.014, 6, 14, PI), toon('#9aa3b5'));
    hd.position.set(s * 0.3, 0.02, 0);
    hd.rotation.set(0, PI / 2, 0);
    helmet.add(hd);
  }
  if (animal === 'rooster') {
    for (let k = 0; k < 3; k++) {
      const c = mesh(new THREE.SphereGeometry(0.06 - k * 0.008, 10, 8), toon(A.comb));
      c.position.set(0, 0.27 + (k === 1 ? 0.03 : 0), -0.07 + k * 0.07);
      helmet.add(c);
    }
  }
  if (animal === 'sheep') {
    // wool fringe under the helmet
    const fr = [];
    for (let k = 0; k < 9; k++) { const a = -0.3 + (k / 8) * (PI + 0.6); fr.push([place(new THREE.IcosahedronGeometry(0.07, 1), [Math.cos(a) * 0.24, 0.0, Math.sin(a) * 0.2 + 0.03]), A.fur]); }
    helmet.add(mesh(merged(fr), toon('#ffffff', { vc: true })));
  }

  // ── arms (root space, solved every frame) ──
  const armMat = animal === 'sheep' ? faceMat : furMat;
  const limbGeo = new THREE.CylinderGeometry(0.065, 0.06, 1, 10);
  const jointGeo = new THREE.SphereGeometry(0.07, 10, 8);
  const handGeo = new THREE.SphereGeometry(0.085, 12, 10);
  const mkArm = () => {
    const up = mesh(limbGeo, armMat), lo = mesh(limbGeo, armMat);
    const sh = mesh(new THREE.SphereGeometry(0.09, 12, 10), suitMat);   // padded shoulder
    const el = mesh(jointGeo, armMat), hand = mesh(handGeo, hoofMat);
    root.add(up, lo, sh, el, hand);
    return { up, lo, sh, el, hand, S: new V3(), E: new V3(), H: new V3() };
  };
  const armR = mkArm(), armL = mkArm();

  // ── bopper: three nested foam segments that bend with a lagging spring ──
  const bopper = new THREE.Group();
  root.add(bopper);
  const handle = mesh(merged([
    [place(new THREE.CylinderGeometry(0.035, 0.035, 0.26, 10), [0, -0.02, 0]), '#5b3a22'],
    [place(new THREE.SphereGeometry(0.05, 10, 8), [0, -0.16, 0]), '#ffd21f'],
    [place(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 16), [0, 0.11, 0]), '#ffffff'],
  ]), toon('#ffffff', { vc: true }));
  bopper.add(handle);
  const foamMat = fresh(color);
  flashMats.push(foamMat);
  const stripeMat = toon('#ffffff');
  const SEG = 0.32, R = 0.078;
  const segs = [];
  let parent = bopper, y0 = 0.12;
  for (let k = 0; k < 3; k++) {
    const s = new THREE.Group();
    s.position.y = k === 0 ? y0 : SEG;
    parent.add(s);
    const m = mesh(noodleGeo(SEG, R * (1 - k * 0.02)), foamMat);
    s.add(m);
    if (k === 2) {
      const band = mesh(place(new THREE.CylinderGeometry(R * 1.12, R * 1.12, 0.07, 16), [0, 0.1, 0]), stripeMat);
      const cap = mesh(place(new THREE.SphereGeometry(R * 0.98, 16, 8, 0, PI * 2, 0, PI / 2), [0, SEG, 0]), foamMat);
      s.add(band, cap);
    }
    if (k === 0) {
      const band = mesh(place(new THREE.CylinderGeometry(R * 1.12, R * 1.12, 0.05, 16), [0, 0.06, 0]), stripeMat);
      s.add(band);
    }
    segs.push(s);
    parent = s;
  }
  const BOPPER_LEN = 0.12 + SEG * 3;

  // dizzy stars (shown while staggered)
  const starShape = new THREE.Shape();
  for (let k = 0; k < 10; k++) {
    const r = k % 2 ? 0.035 : 0.08, a = (k / 10) * PI * 2 + PI / 2;
    if (k === 0) starShape.moveTo(Math.cos(a) * r, Math.sin(a) * r); else starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.02, bevelEnabled: false });
  const dizzy = new THREE.Group();
  dizzy.position.set(0, 0.42, 0);
  head.add(dizzy);
  for (let k = 0; k < 3; k++) {
    const st = mesh(starGeo, toon('#ffd21f', { emissive: '#ffb000' }), { cast: false });
    st.position.set(Math.cos((k / 3) * PI * 2) * 0.3, 0, Math.sin((k / 3) * PI * 2) * 0.3);
    dizzy.add(st);
  }
  dizzy.visible = false;

  // ── animation state ──
  const st = {
    t: Math.random() * 10, mode: 'fight', modeT: 0,
    dir: new V3(0, 0.4, 0.9).normalize(),   // blade direction (root space)
    lag: new V3(0, 0.4, 0.9).normalize(), lagVel: new V3(),
    lastSwing: null, swingRef: null, recover: 0, recoverFrom: new V3(),
    flash: 0, walkPhase: 0, hitT: 9, hitDir: 0, blockT: 9, squash: 0,
    lean: 0, sway: 0, crouch: 0, bob: 0,
    guardBlend: 0, lastReact: null, outSpin: 0,
    sulkSpot: new V3(), danceSeed: Math.random() * 10,
    face: 1, x: 0, y: 0, prevDir: new V3(0, 0.4, 0.9).normalize(),
  };

  /** Blade direction (model space: +Z forward, -X right) from a frontal-plane tip (bx right, by up) and forward bz. */
  function fromFrontal(bx, by, bz, out = new V3()) {
    return out.set(-bx, by, bz).normalize();
  }
  function poseDir(F, out) {
    const yaw = F.yaw, pitch = F.pitch;
    return fromFrontal(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.max(0.25, Math.cos(yaw) * Math.cos(pitch)), out);
  }
  function guardDir(F, out) {
    let ba = F.bladeAngle;
    let bx = Math.cos(ba), by = Math.sin(ba);
    if (by < -0.01) { bx = -bx; by = -by; }
    if (Math.abs(by) < 0.2 && Math.sin(F.yaw) * bx < 0) bx = -bx;   // level guard points the way the blade leans
    return fromFrontal(bx * 0.95, by * 0.95, 0.42, out);
  }

  const tmpA = new V3(), tmpB = new V3(), tmpC = new V3();
  const chestLocal = new V3(0, 0.62, 0.05);

  function setFlash(k) {
    for (const m of flashMats) {
      m.emissive.setRGB(k, k * 0.95, k * 0.85);
      m.emissiveIntensity = 1;
    }
  }

  /**
   * Drive the fighter from combat state F (Combat fighter) for one frame.
   */
  function update(dt, F, ctx = {}) {
    st.t += dt;
    st.modeT += dt;
    const t = st.t;
    st.face = F.face;
    const mode = st.mode;

    // ── reactions (one-shot) ──
    if (F.react && F.react !== st.lastReact) {
      st.lastReact = F.react;
      if (F.react.type === 'hit') { st.hitT = 0; st.flash = 1; st.squash = 0.35; st.lagVel.addScaledVector(st.dir, -3); }
      if (F.react.type === 'block' || F.react.type === 'blocked' || F.react.type === 'clash') {
        st.blockT = 0; st.squash = 0.2;
        st.lagVel.add(tmpA.set((Math.random() - 0.5) * 6, 4, -3));
      }
    }
    st.hitT += dt; st.blockT += dt;
    st.flash = Math.max(0, st.flash - dt * 5);
    st.squash = damp(st.squash, 0, 7, dt);
    setFlash(st.flash * 0.55);

    // ── root placement ──
    let px = F.x, py = F.y || 0, pz = 0, yawRoot = F.face > 0 ? PI / 2 : -PI / 2;
    let rollRoot = 0, pitchRoot = 0;
    if (mode === 'sulk') {
      px = st.sulkSpot.x; py = st.sulkSpot.y; pz = st.sulkSpot.z;
      yawRoot = Math.atan2(-px, -pz);   // face the arena
    } else if (F.out) {
      const k = F.outT;
      st.outSpin += dt * (F.splashed ? 0 : 7);
      if (F.splashed) {
        // bobbing in the pond, only the head and arms above water
        py = ARENA.waterY - 0.62 + Math.sin(t * 3) * 0.05;
        rollRoot = Math.sin(t * 2.3) * 0.12;
      } else {
        rollRoot = -F.face * Math.min(1.6, k * 2.6) * 0.8;
        pitchRoot = Math.sin(st.outSpin) * 0.3;
      }
    }
    root.position.set(px, py, pz);
    root.rotation.set(0, 0, 0);
    root.rotateY(yawRoot);
    root.rotateZ(rollRoot);
    root.rotateX(pitchRoot);

    // ── body pose ──
    const stunK = clamp(F.stun / FIGHT.hitStun, 0, 1);
    const stagK = F.staggerMax > 0 ? clamp(F.stagger / F.staggerMax, 0, 1) : 0;
    const guarding = !!F.guardHeld && !F.out && mode === 'fight';
    st.guardBlend = damp(st.guardBlend, guarding ? 1 : 0, 22, dt);
    const walking = F.walking > 0.05;
    if (walking) st.walkPhase += dt * 9;
    const slide = clamp(Math.abs(F.vx) / 3, 0, 1);
    let lean = 0, sway = 0, crouch = 0, bob = 0, twist = 0;
    if (mode === 'dance') {
      const k = st.modeT;
      root.position.y += Math.abs(Math.sin(k * 6)) * 0.22;   // the whole fighter hops
      twist = Math.sin(k * 3) * 0.5;
      sway = Math.sin(k * 6) * 0.12;
    } else if (mode === 'sulk') {
      lean = 0.45; crouch = 0.12; sway = Math.sin(t * 1.2) * 0.04;
    } else if (F.out) {
      lean = -0.4;
    } else {
      bob = Math.abs(Math.sin(t * 5.2)) * 0.025 * (1 - st.guardBlend * 0.6) * (F.live || !ctx.active ? 1 : 0.7);
      crouch = 0.05 + st.guardBlend * 0.07;
      lean = 0.08 + st.guardBlend * 0.06 - stunK * 0.4 - slide * 0.25;
      if (F.swing) {
        const s = F.swing;
        const k = s.phase === 'windup' ? ease(s.t / Math.max(0.01, s.windup)) : 1 - ease((s.t - s.windup) / SWING.strikeTime);
        twist = -Math.cos(s.dir) * 0.35 * (s.phase === 'windup' ? k : -k * 0.6);
        lean += s.phase === 'strike' ? 0.15 : -0.05 * k;
      }
      if (stagK > 0) {
        sway = Math.sin(t * 13) * 0.2 * stagK;
        lean -= 0.12 * stagK;
      }
      if (F.teetering) {
        sway += Math.sin(t * 7) * 0.12;
        lean += Math.sin(t * 5.3) * 0.25 - 0.1;
      }
      if (st.hitT < 0.3) sway += Math.sin(st.hitT * 40) * 0.12 * (1 - st.hitT / 0.3);
    }
    st.lean = damp(st.lean, lean, 14, dt);
    st.sway = damp(st.sway, sway, 18, dt);
    st.crouch = damp(st.crouch, crouch, 12, dt);
    body.position.y = 0.42 - st.crouch + bob;
    body.rotation.set(st.lean, twist, st.sway);
    const sq = st.squash;
    body.scale.set(1 + sq * 0.5, 1 - sq * 0.5, 1 + sq * 0.5);

    // legs
    const legSwing = walking ? Math.sin(st.walkPhase) * 0.5 : 0;
    const teeterLeg = F.teetering && !F.out ? Math.sin(t * 9) * 0.25 : 0;
    legs[0].rotation.x = damp(legs[0].rotation.x, legSwing + teeterLeg + (F.out ? 0.8 : 0) + (mode === 'dance' ? Math.sin(st.modeT * 6) * 0.4 : 0), 20, dt);
    legs[1].rotation.x = damp(legs[1].rotation.x, -legSwing - teeterLeg + (F.out ? -0.5 : 0) + (mode === 'dance' ? -Math.sin(st.modeT * 6) * 0.4 : 0), 20, dt);
    legs[0].position.y = legs[1].position.y = 0.42 - st.crouch * 0.4 + (mode === 'sulk' ? -0.2 : 0);
    legs[0].scale.y = legs[1].scale.y = mode === 'sulk' ? 0.4 : 1;
    tail.rotation.y = Math.sin(t * 4) * 0.4;
    tail.rotation.x = Math.sin(t * 3) * 0.15;

    // head / face
    head.rotation.set(
      mode === 'sulk' ? 0.5 : -st.lean * 0.5 + (st.hitT < 0.35 ? -0.25 * (1 - st.hitT / 0.35) : 0),
      mode === 'dance' ? Math.sin(st.modeT * 4) * 0.3 : 0,
      -st.sway * 0.8 + (stagK > 0 ? Math.sin(t * 9) * 0.15 * stagK : 0));
    const squint = st.hitT < 0.3 || mode === 'dance' ? 0.25 : 1;
    const blink = (t % 3.7) < 0.1 ? 0.15 : 1;
    for (const e of eyes) {
      e.g.scale.y = damp(e.g.scale.y, Math.min(squint, blink), 30, dt);
      if (stagK > 0) e.pupil.position.set(Math.cos(t * 12 * e.s) * 0.02, Math.sin(t * 12) * 0.02, 0.035);
      else e.pupil.position.set(0, mode === 'sulk' ? -0.02 : 0, 0.035);
      e.brow.rotation.z = e.s * (mode === 'sulk' ? -0.35 : guarding || F.swing ? 0.45 : 0.2);
      e.brow.position.y = mode === 'sulk' ? 0.1 : 0.085;
    }
    for (const ear of ears) ear.rotation.x = Math.sin(t * 3 + ear.position.x) * 0.1 + (st.hitT < 0.3 ? 0.6 : 0);
    dizzy.visible = stagK > 0.05 && !F.out;
    if (dizzy.visible) { dizzy.rotation.y = t * 6; dizzy.position.y = 0.42 + Math.sin(t * 5) * 0.03; }

    // ── blade direction ──
    const want = tmpA;
    let swingDrive = false;
    if (mode === 'dance') {
      fromFrontal(Math.sin(st.modeT * 6) * 0.6, 0.9, 0.2, want);
    } else if (mode === 'sulk') {
      fromFrontal(0.3, -0.9, 0.3, want);
    } else if (F.out) {
      fromFrontal(Math.sin(t * 15) * 0.8, 0.6 + Math.cos(t * 15) * 0.3, 0.3, want);
    } else if (F.swing) {
      const s = F.swing;
      if (st.swingRef !== s) { st.swingRef = s; st.lastSwing = s; st.windFrom = st.dir.clone(); }
      const ux = Math.cos(s.dir), uy = Math.sin(s.dir);
      swingDrive = true;
      if (s.phase === 'windup') {
        const k = ease(s.t / Math.max(0.02, s.windup));
        fromFrontal(-ux * 0.92, -uy * 0.92 + 0.1, 0.3, tmpB);
        want.copy(st.windFrom).lerp(tmpB, k).normalize();
      } else {
        let k = clamp((s.t - s.windup) / SWING.strikeTime, 0, 1);
        if (s.result === 'block' || s.result === 'clash') {
          // bounce off: reaches the middle, then springs back the way it came
          k = k < 0.4 ? ease(k / 0.4) * 0.5 : 0.5 - ease((k - 0.4) / 0.6) * 0.35;
        } else k = ease(k);
        const a = PI * k;
        fromFrontal(-ux * Math.cos(a) * 0.95, -uy * Math.cos(a) * 0.95 + 0.05, 0.25 + Math.sin(a) * 0.85, want);
      }
      st.recover = 0.18;
      st.recoverFrom.copy(want);
    } else {
      if (st.guardBlend > 0.01) {
        poseDir(F, tmpB);
        guardDir(F, tmpC);
        want.copy(tmpB).lerp(tmpC, st.guardBlend).normalize();
      } else poseDir(F, want);
      if (!F.live && !ctx.active) {
        // idle: rests on the shoulder, lazy wag
        fromFrontal(0.5 + Math.sin(t * 1.3) * 0.06, 0.8, -0.2, want);
      }
      if (stagK > 0) want.add(tmpB.set(Math.sin(t * 11) * 0.5 * stagK, -0.4 * stagK, 0)).normalize();
      if (stunK > 0) want.add(tmpB.set(0, 0.5 * stunK, -0.4 * stunK)).normalize();
      if (F.teetering) want.add(tmpB.set(Math.sin(t * 8) * 0.6, 0.5, 0)).normalize();
      if (st.recover > 0) {
        st.recover -= dt;
        want.lerp(st.recoverFrom, clamp(st.recover / 0.18, 0, 1)).normalize();
      }
    }
    if (swingDrive || mode !== 'fight') st.dir.copy(want);
    else {
      // follow the intent nearly 1:1 (tiny smoothing against jitter)
      const k = 1 - Math.exp(-dt * 40);
      st.dir.lerp(want, k).normalize();
    }

    // ── bopper wobble: tip lags behind the hand with a spring ──
    const kS = 140, cS = 11;
    st.lagVel.addScaledVector(tmpB.copy(st.dir).sub(st.lag), kS * dt);
    st.lagVel.multiplyScalar(Math.exp(-cS * dt));
    st.lag.addScaledVector(st.lagVel, dt).normalize();
    const axis = tmpB.copy(st.dir).cross(st.lag);
    const sinA = clamp(axis.length(), 0, 0.7);

    // ── arms ──
    body.updateMatrix();
    const shR = armR.S.set(-0.34, 0.62, 0.02).applyMatrix4(body.matrix);
    const shL = armL.S.set(0.34, 0.62, 0.02).applyMatrix4(body.matrix);
    const chest = tmpC.copy(chestLocal).applyMatrix4(body.matrix);
    // grip: in front of the chest, a little to the right, pushed along the blade
    const grip = armR.H.copy(chest).add(_v2.set(-0.16, -0.08, 0.3)).addScaledVector(st.dir, 0.18);
    if (mode === 'dance') grip.set(-0.3, 1.45 + Math.sin(st.modeT * 6) * 0.05, 0.15);
    if (mode === 'sulk') grip.set(-0.3, 0.55, 0.3);
    solveIK(shR, grip, 0.3, 0.3, POLE_R, armR.E);
    // left hand: on the handle while guarding, windmill while teetering, on the hip otherwise
    const handleEnd = tmpA.copy(grip).addScaledVector(st.dir, -0.14);
    let lh;
    if (mode === 'dance') lh = new V3(0.32, 1.3 + Math.sin(st.modeT * 6 + 1) * 0.1, 0.1);
    else if (mode === 'sulk') lh = new V3(0.2, 0.5, 0.35);
    else if (F.out) lh = new V3(0.5 + Math.cos(t * 16) * 0.2, 0.9 + Math.sin(t * 16) * 0.3, 0.1);
    else if (F.teetering) lh = new V3(0.62, 0.95, 0).add(new V3(0, Math.sin(t * 14) * 0.35, Math.cos(t * 14) * 0.35));
    else if (st.guardBlend > 0.4) lh = handleEnd.clone();
    else lh = new V3(0.42, body.position.y + 0.2, 0.06);
    armL.H.copy(lh);
    solveIK(shL, armL.H, 0.3, 0.3, POLE_L, armL.E);
    for (const a of [armR, armL]) {
      limb(a.up, a.S, a.E); limb(a.lo, a.E, a.H);
      a.sh.position.copy(a.S); a.el.position.copy(a.E); a.hand.position.copy(a.H);
    }

    // ── bopper placement ──
    bopper.position.copy(armR.H);
    bopper.quaternion.setFromUnitVectors(UP, st.dir);
    if (sinA > 1e-4) {
      // bend axis in bopper space
      _q.copy(bopper.quaternion).invert();
      const ax = axis.normalize().applyQuaternion(_q);
      const ang = Math.asin(sinA) / 3;
      for (const s of segs) s.quaternion.setFromAxisAngle(ax, ang);
    } else for (const s of segs) s.quaternion.identity();
    const bsq = st.blockT < 0.25 || st.hitT < 0.25 ? 0.15 * Math.sin(Math.min(st.blockT, st.hitT) * 50) : 0;
    segs[0].scale.set(1 + bsq, 1 - bsq * 0.6, 1 + bsq);
    if (F.out && F.splashed && mode !== 'sulk') {
      // dropped the bopper: it floats beside
      bopper.position.set(0.5, 0.62 + Math.sin(t * 2) * 0.03, 0.4);
      bopper.quaternion.setFromAxisAngle(_v.set(1, 0, 0), PI / 2);
    }
  }

  /** Tip of the bopper in world space. */
  function tipWorld(out = new V3()) { return segs[2].localToWorld(out.set(0, SEG, 0)); }
  function chestWorld(out = new V3()) { return body.localToWorld(out.copy(chestLocal)); }
  function headWorld(out = new V3()) { return head.localToWorld(out.set(0, 0.1, 0)); }

  function setMode(m, opts = {}) {
    if (m !== st.mode) st.modeT = 0;
    st.mode = m;
    if (opts.spot) st.sulkSpot.copy(opts.spot);
  }

  function dispose() {
    root.traverse((o) => { if (o.isMesh && o.geometry && !o.geometry.userData.shared) o.geometry.dispose(); });
    for (const m of mats) m.dispose();
    root.removeFromParent();
  }

  return { root, animal, color, update, setMode, get mode() { return st.mode; }, tipWorld, chestWorld, headWorld, dispose, BOPPER_LEN };
}
