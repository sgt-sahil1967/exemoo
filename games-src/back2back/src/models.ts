// Back2Back procedural cartoon models (Moo Moo Farm style): toon shaded, ink outlined, built facing -Z, base at y = 0.
import * as THREE from 'three';
import {
  B, C, S, PAL, edge, clamp, damp, glowMat, lerp, makeWheel, place, rng, setEmissive, toon,
  type Mats, type Wheel,
} from './models-util';

const PI = Math.PI;
const tmpCore = new THREE.Color();

/* =============================================================== cows */
export interface CowParts {
  head: THREE.Group; earL: THREE.Group; earR: THREE.Group; tail: THREE.Group; legs: THREE.Group;
  eyes?: THREE.Mesh[]; pupils?: THREE.Mesh[]; brows?: THREE.Mesh[]; tongue?: THREE.Mesh; cheeks?: THREE.Mesh[];
}

/** Cartoon cow. `color` is the main fur colour (white-ish colours get ink spots, others white spots). Height ~1.7 m. */
export function makeCow(color: string): THREE.Group {
  const g = new THREE.Group();
  const lum = new THREE.Color(color).getHSL({ h: 0, s: 0, l: 0 }).l;
  const fur = toon(color), pat = toon(lum > 0.75 ? PAL.ink : PAL.white), pink = toon(PAL.pink), ink = toon(PAL.ink), horn = toon(PAL.cream);
  B(g, fur, 1.0, 0.85, 1.5, 0, 0.9, 0.05, 0.035);
  B(g, pat, 1.03, 0.42, 0.5, 0, 1.12, 0.3);
  B(g, pat, 0.5, 0.35, 0.45, 0.28, 1.0, -0.35).position.x = 0.27;
  S(g, pink, 0.2, 0.17, 0.2, 0, 0.5, 0.55);
  const legs = new THREE.Group();
  g.add(legs);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    B(legs, fur, 0.28, 0.5, 0.28, sx * 0.3, 0.27, sz * 0.52, 0.025);
    B(legs, ink, 0.3, 0.13, 0.3, sx * 0.3, 0.06, sz * 0.52);
  }
  const head = place(g, new THREE.Group(), 0, 1.32, -0.88);
  B(head, fur, 0.72, 0.66, 0.6, 0, 0, 0, 0.035);
  B(head, pat, 0.26, 0.5, 0.04, 0, 0.03, -0.31);
  B(head, pink, 0.52, 0.3, 0.3, 0, -0.17, -0.34, 0.025);
  B(head, ink, 0.07, 0.07, 0.04, 0.13, -0.14, -0.5);
  B(head, ink, 0.07, 0.07, 0.04, -0.13, -0.14, -0.5);
  const eyes: THREE.Mesh[] = [], pupils: THREE.Mesh[] = [], brows: THREE.Mesh[] = [], cheeks: THREE.Mesh[] = [];
  const white = toon(PAL.white), blush = toon('#ff8aa0');
  for (const sx of [-1, 1]) {
    eyes.push(S(head, white, 0.12, 0.13, 0.08, sx * 0.22, 0.1, -0.29, 0.015));
    pupils.push(S(head, ink, 0.06, 0.07, 0.05, sx * 0.22, 0.09, -0.35));
    S(head, white, 0.025, 0.025, 0.02, sx * 0.2, 0.12, -0.375); // eye sparkle
    brows.push(B(head, ink, 0.17, 0.035, 0.04, sx * 0.22, 0.25, -0.31));
    cheeks.push(S(head, blush, 0.07, 0.04, 0.03, sx * 0.3, -0.04, -0.31));
    const h = C(head, horn, 0, 0.09, 0.3, sx * 0.3, 0.42, -0.02, 0.02, 8);
    h.rotation.z = -sx * 0.45;
  }
  const mkEar = (sx: number) => {
    const e = place(head, new THREE.Group(), sx * 0.38, 0.2, 0.02);
    B(e, fur, 0.34, 0.12, 0.2, sx * 0.17, 0, 0, 0.02);
    B(e, pink, 0.2, 0.13, 0.12, sx * 0.2, 0, 0);
    return e;
  };
  const earL = mkEar(-1), earR = mkEar(1);
  const tail = place(g, new THREE.Group(), 0, 1.25, 0.8);
  C(tail, fur, 0.04, 0.05, 0.6, 0, -0.3, 0.03);
  S(tail, ink, 0.1, 0.14, 0.1, 0, -0.66, 0.03);
  const tongue = B(head, toon('#ff6b8a'), 0.12, 0.2, 0.04, 0, -0.38, -0.5, 0.012);
  tongue.visible = false;
  g.userData.parts = { head, earL, earR, tail, legs, eyes, pupils, brows, tongue, cheeks } as CowParts;
  return g;
}

/** Facial expression: eyes widen + brows up when hurt, determined squint + tongue out on nitro. */
export function setCowMood(cow: THREE.Object3D, hurt: boolean, nitro: boolean, t: number): void {
  const p = cow.userData.parts as CowParts;
  if (!p.eyes || !p.pupils || !p.brows || !p.tongue) return;
  const w = hurt ? 1.55 : nitro ? 0.75 : 1;
  for (let i = 0; i < 2; i++) {
    const sx = i ? 1 : -1;
    p.eyes[i].scale.set(0.12 * (hurt ? 1.3 : 1), 0.13 * w, 0.08);
    p.pupils[i].scale.setScalar(hurt ? 0.04 : 0.06).multiplyScalar(1);
    p.pupils[i].scale.y = hurt ? 0.05 : 0.07;
    p.pupils[i].scale.z = 0.05;
    p.brows[i].rotation.z = sx * (hurt ? 0.45 : nitro ? -0.5 : 0);
    p.brows[i].position.y = hurt ? 0.31 : nitro ? 0.2 : 0.25;
  }
  p.tongue.visible = nitro;
  if (nitro) {
    p.tongue.rotation.z = Math.sin(t * 24) * 0.25;
    p.tongue.scale.y = 1 + Math.sin(t * 18) * 0.15;
  }
}

/** Wiggle ears/tail/head. k = 0..1 intensity. */
export function animateCow(cow: THREE.Object3D, t: number, k = 1): void {
  const p = cow.userData.parts as CowParts;
  p.earL.rotation.z = 0.35 + Math.sin(t * 9) * 0.28 * k;
  p.earR.rotation.z = -0.35 - Math.sin(t * 9 + 1.3) * 0.28 * k;
  p.tail.rotation.z = Math.sin(t * 7 + 0.5) * 0.55 * k;
  p.head.position.y = 1.32 + Math.sin(t * 5) * 0.025 * k;
}

/* =============================================================== bandits */
function makeSheep(L: Mats, masked = true): THREE.Group {
  const g = new THREE.Group();
  const wool = toon('#f6f0e0', L), face = toon('#3a3a5c', L), ink = toon(PAL.ink, L), red = toon(PAL.red, L);
  const r = rng(7);
  S(g, wool, 0.62, 0.55, 0.7, 0, 0.8, 0.1, 0.03);
  for (let i = 0; i < 7; i++) S(g, wool, 0.3, 0.3, 0.3, (r() - 0.5) * 0.9, 0.7 + r() * 0.6, (r() - 0.5) * 0.9);
  const head = place(g, new THREE.Group(), 0, 1.3, -0.62);
  S(head, face, 0.34, 0.36, 0.32, 0, 0, 0, 0.03);
  S(head, wool, 0.3, 0.2, 0.28, 0, 0.3, 0.05);
  for (const sx of [-1, 1]) {
    B(head, face, 0.34, 0.1, 0.18, sx * 0.4, 0.05, 0.05).rotation.z = sx * -0.3;
    S(head, toon(PAL.white, L), 0.1, 0.1, 0.06, sx * 0.14, 0.06, -0.28);
    S(head, ink, 0.05, 0.06, 0.04, sx * 0.14, 0.05, -0.33);
  }
  if (masked) B(head, ink, 0.66, 0.12, 0.1, 0, 0.1, -0.26);
  B(g, red, 0.72, 0.16, 0.5, 0, 1.1, -0.45); // bandana
  return g;
}
function makeGoat(L: Mats): THREE.Group {
  const g = new THREE.Group();
  const fur = toon('#c9a77a', L), dark = toon('#6b4a2a', L), ink = toon(PAL.ink, L), horn = toon(PAL.cream, L);
  B(g, fur, 0.8, 0.8, 1.0, 0, 0.8, 0.1, 0.03);
  const head = place(g, new THREE.Group(), 0, 1.35, -0.6);
  B(head, fur, 0.6, 0.55, 0.6, 0, 0, 0, 0.03);
  B(head, dark, 0.34, 0.26, 0.3, 0, -0.14, -0.34);
  B(head, dark, 0.14, 0.34, 0.1, 0, -0.4, -0.3);
  for (const sx of [-1, 1]) {
    S(head, toon(PAL.white, L), 0.1, 0.1, 0.06, sx * 0.17, 0.1, -0.29);
    S(head, ink, 0.05, 0.05, 0.04, sx * 0.17, 0.1, -0.34);
    C(head, horn, 0.02, 0.09, 0.5, sx * 0.2, 0.5, 0.05, 0.02, 8).rotation.z = -sx * 0.3;
    B(head, fur, 0.3, 0.1, 0.16, sx * 0.4, 0.1, 0.05);
  }
  return g;
}
function makeBull(L: Mats): THREE.Group {
  const g = new THREE.Group();
  const fur = toon('#3d2a44', L), ink = toon(PAL.ink, L), horn = toon(PAL.cream, L), gold = toon(PAL.yellow, L);
  B(g, fur, 1.1, 0.95, 1.4, 0, 0.9, 0.1, 0.04);
  const head = place(g, new THREE.Group(), 0, 1.4, -0.8);
  B(head, fur, 0.85, 0.75, 0.7, 0, 0, 0, 0.04);
  B(head, toon('#6a4d6e', L), 0.6, 0.34, 0.3, 0, -0.2, -0.38);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 6, 12), gold);
  place(head, ring, 0, -0.32, -0.5);
  for (const sx of [-1, 1]) {
    S(head, toon(PAL.white, L), 0.13, 0.12, 0.07, sx * 0.26, 0.12, -0.34);
    S(head, toon(PAL.red, L), 0.06, 0.06, 0.05, sx * 0.26, 0.12, -0.4);
    B(head, ink, 0.3, 0.06, 0.06, sx * 0.26, 0.26, -0.37).rotation.z = sx * 0.4;
    C(head, horn, 0.02, 0.12, 0.7, sx * 0.5, 0.35, 0.0, 0.025, 8).rotation.z = -sx * 1.0;
    B(head, fur, 0.36, 0.12, 0.2, sx * 0.55, 0.0, 0.1);
  }
  return g;
}

/* =============================================================== player car */
export interface CarState {
  steer: number; speed: number; nitro: boolean; aimYaw: number; aimPitch: number; firing: boolean; hurt: boolean; shield: boolean;
  upgrades: { engine: number; armor: number; rapid: number; spread: number };
  /** Brake lights brighten. */
  braking?: boolean;
  /** Body slides: extra roll + yaw, no particles emitted by the rig. */
  drifting?: boolean;
  /** 0..1 hull lost: dents, smoke, loose panels, sparks. */
  damage?: number;
}
export interface CarRig {
  group: THREE.Group;
  muzzle: THREE.Object3D;
  update(dt: number, t: number, s: CarState): void;
  fireKick(): void;
}

export function makeCar(): CarRig {
  const L: Mats = [];
  const group = new THREE.Group();
  const tilt = place(group, new THREE.Group(), 0, 0.5, 0);
  const root = place(tilt, new THREE.Group(), 0, -0.5, 0);

  const red = toon(PAL.red, L), dark = toon(PAL.dark, L), ink = toon(PAL.ink, L), yellow = toon(PAL.yellow, L);
  const steel = toon(PAL.steel, L), wood = toon(PAL.wood, L), blue = toon(PAL.blue, L);
  const lampM = new THREE.MeshBasicMaterial({ color: '#fff7b0' });

  // chassis + body
  B(root, ink, 1.7, 0.3, 3.8, 0, 0.5, 0);
  B(root, red, 1.95, 0.5, 1.5, 0, 0.82, -1.3, 0.04);
  B(root, yellow, 0.4, 0.04, 1.5, 0, 1.08, -1.3);
  B(root, red, 1.95, 0.55, 1.1, 0, 0.85, -0.05, 0.04);
  B(root, yellow, 2.0, 0.28, 0.3, 0, 0.55, -2.0, 0.03); // bumper
  for (const sx of [-1, 1]) {
    S(root, lampM, 0.2, 0.2, 0.12, sx * 0.65, 0.95, -2.06);
    B(root, red, 0.35, 0.12, 1.1, sx * 1.0, 0.66, -1.35); // fenders
    B(root, red, 0.35, 0.12, 1.0, sx * 1.0, 0.66, 1.2);
  }
  // roll bar + windshield + dash
  for (const sx of [-1, 1]) {
    C(root, ink, 0.05, 0.05, 1.0, sx * 0.88, 1.35, -0.55, 0.01, 8);
    const hoop = C(root, ink, 0.05, 0.05, 1.0, sx * 0.88, 1.35, 0.35, 0.01, 8);
    hoop.rotation.x = 0.0;
  }
  B(root, ink, 1.85, 0.07, 1.0, 0, 1.87, -0.1);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.62), new THREE.MeshToonMaterial({ color: '#9fe4ff', transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
  place(root, glass, 0, 1.45, -0.62).rotation.x = -0.35;
  B(root, dark, 1.6, 0.3, 0.4, 0, 1.15, -0.72);
  B(root, dark, 1.4, 0.55, 0.3, 0, 1.2, 0.5); // seat back
  // bed
  B(root, wood, 1.8, 0.1, 1.9, 0, 0.78, 1.15);
  for (const sx of [-1, 1]) B(root, red, 0.12, 0.5, 1.9, sx * 0.93, 1.0, 1.15, 0.025);
  B(root, red, 1.98, 0.5, 0.12, 0, 1.0, 2.1, 0.025);
  B(root, yellow, 1.98, 0.08, 0.14, 0, 1.27, 2.1);
  // tail lights
  const tailM = new THREE.MeshBasicMaterial({ color: '#ff5a4a' });
  for (const sx of [-1, 1]) B(root, tailM, 0.3, 0.14, 0.05, sx * 0.7, 1.05, 2.18);
  const tailDim = new THREE.Color('#a8302a'), tailHot = new THREE.Color('#ff3a2a');
  const tailGlowM = glowMat('#ff2a1a', 0);
  const tailGlows: THREE.Mesh[] = [];
  for (const sx of [-1, 1]) {
    const gl = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 6), tailGlowM);
    place(root, gl, sx * 0.7, 1.05, 2.28);
    gl.visible = false;
    tailGlows.push(gl);
  }

  // extra body detail: grille, hood scoop, mirrors, door roundels, mud flaps, plate, antenna
  B(root, ink, 1.0, 0.2, 0.06, 0, 0.75, -2.08);
  for (let i = -2; i <= 2; i++) B(root, steel, 0.05, 0.16, 0.05, i * 0.2, 0.75, -2.12);
  B(root, dark, 0.55, 0.14, 0.6, 0, 1.12, -1.7, 0.02);
  B(root, ink, 0.4, 0.05, 0.4, 0, 1.2, -1.7);
  const white = toon(PAL.white);
  for (const sx of [-1, 1]) {
    B(root, ink, 0.04, 0.04, 0.2, sx * 1.02, 1.42, -0.62);
    B(root, red, 0.1, 0.18, 0.2, sx * 1.12, 1.46, -0.62, 0.015);
    const rd = C(root, white, 0.2, 0.2, 0.03, sx * 0.99, 0.86, -0.05, 0.012, 14);
    rd.rotation.z = PI / 2;
    const rd2 = C(root, yellow, 0.12, 0.12, 0.04, sx * 1.0, 0.86, -0.05, 0, 12);
    rd2.rotation.z = PI / 2;
    B(root, ink, 0.05, 0.36, 0.28, sx * 1.1, 0.42, 1.78);
    B(root, ink, 0.1, 0.06, 0.1, sx * 0.88, 0.62, -2.04); // bumper bolts
  }
  B(root, white, 0.5, 0.18, 0.04, 0, 0.72, 2.2, 0.01);
  B(root, ink, 0.4, 0.04, 0.045, 0, 0.74, 2.22);
  C(root, ink, 0.015, 0.02, 1.4, 0.85, 1.9, 2.0, 0, 5);
  const flag = place(root, new THREE.Group(), 0.85, 2.55, 2.0);
  B(flag, red, 0.03, 0.2, 0.35, 0, 0, 0.18);
  B(flag, yellow, 0.035, 0.07, 0.12, 0, 0, 0.18);

  // headlight beams (soft cones) + lens glow
  const beamM = glowMat('#fff3b0', 0.05);
  for (const sx of [-1, 1]) {
    const beam = new THREE.Mesh(new THREE.ConeGeometry(0.55, 5, 10, 1, true), beamM);
    beam.rotation.x = PI / 2;
    place(root, beam, sx * 0.65, 0.95, -2.06 - 2.5);
    const lens = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), glowMat('#fff3b0', 0.35));
    place(root, lens, sx * 0.65, 0.95, -2.12);
  }

  // damage kit: dents, scorch, loose panels, smoke, sparks
  const dmgDark = toon('#7a1f1a', L), dmgScorch = toon('#241818', L);
  const dents: THREE.Object3D[] = [
    B(root, dmgDark, 0.5, 0.04, 0.35, -0.4, 1.1, -1.0),
    B(root, dmgDark, 0.04, 0.3, 0.4, 0.99, 0.9, 0.4),
    B(root, dmgScorch, 0.7, 0.04, 0.5, 0.35, 1.12, -1.5),
    B(root, dmgDark, 0.04, 0.3, 0.5, -0.99, 0.92, -0.5),
  ];
  for (const d of dents) d.visible = false;
  const flapPivot = place(root, new THREE.Group(), 1.02, 1.1, -0.35);
  B(flapPivot, red, 0.05, 0.5, 0.9, 0, -0.25, 0.45, 0.02);
  flapPivot.visible = false;
  const hoodPivot = place(root, new THREE.Group(), 0, 1.09, -0.62);
  B(hoodPivot, red, 1.5, 0.06, 0.9, 0, 0.03, -0.45, 0.02);
  hoodPivot.visible = false;
  const hoodGap = B(root, ink, 1.4, 0.03, 0.8, 0, 1.08, -1.05);
  hoodGap.visible = false;
  const smokeM = new THREE.MeshBasicMaterial({ color: '#2c2a3a', transparent: true, opacity: 0.55, depthWrite: false });
  const puffM = new THREE.MeshBasicMaterial({ color: '#e8e6f0', transparent: true, opacity: 0.4, depthWrite: false });
  const sparkM = glowMat('#ffd060', 0.95);
  const puffGeo = new THREE.SphereGeometry(1, 7, 5);
  const smokePuffs: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) smokePuffs.push(place(root, new THREE.Mesh(puffGeo, smokeM), 0, 1.2, -1.2));
  const exhaustPuffs: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) exhaustPuffs.push(place(root, new THREE.Mesh(puffGeo, puffM), 0, 0.65, 2.4));
  const sparks: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) sparks.push(place(root, new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 4), sparkM), 0, 0.5, 0));
  for (const m of [...smokePuffs, ...exhaustPuffs, ...sparks]) m.visible = false;

  // base exhaust
  for (const sx of [-1, 1]) {
    const p = C(root, steel, 0.09, 0.09, 0.5, sx * 0.55, 0.62, 2.05, 0.015, 8);
    p.rotation.x = PI / 2;
  }

  // wheels
  const wheels: Wheel[] = [];
  const pivots: THREE.Group[] = [];
  const spec: [number, number, number, boolean][] = [[-1, -1.35, 0.46, true], [1, -1.35, 0.46, true], [-1, 1.25, 0.5, false], [1, 1.25, 0.5, false]];
  for (const [sx, z, r, front] of spec) {
    const w = makeWheel(r, 0.42, L, PAL.yellow);
    const piv = place(root, new THREE.Group(), sx * 1.0, r, z);
    piv.add(w.root);
    wheels.push(w);
    if (front) pivots.push(piv);
  }

  // driver
  const driver = makeCow(PAL.red);
  driver.scale.setScalar(0.62);
  driver.position.set(0, 0.76, 0.08);
  (driver.userData.parts as CowParts).legs.visible = false;
  root.add(driver);
  const dp = driver.userData.parts as CowParts;
  const cap = place(dp.head, new THREE.Group(), 0, 0.33, 0);
  S(cap, toon(PAL.red), 0.4, 0.2, 0.38, 0, 0, 0, 0.03);
  B(cap, toon(PAL.red), 0.6, 0.06, 0.4, 0, -0.1, -0.35);
  B(cap, toon(PAL.white), 0.14, 0.14, 0.04, 0, 0.05, -0.36);
  const wheelTilt = place(root, new THREE.Group(), 0, 1.3, -0.5);
  wheelTilt.rotation.x = -1.05;
  const sw = place(wheelTilt, new THREE.Group());
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.045, 8, 16), ink);
  sw.add(ring);
  B(sw, ink, 0.44, 0.05, 0.05);
  B(sw, ink, 0.05, 0.2, 0.05, 0, -0.1, 0);
  B(sw, yellow, 0.14, 0.14, 0.07);

  // turret
  const tur = place(root, new THREE.Group(), 0, 0.83, 1.0);
  C(tur, steel, 0.3, 0.38, 0.22, 0, 0.11, 0, 0.025);
  const cabinet = place(tur, new THREE.Group(), 0, 0.6, 0);
  B(cabinet, blue, 0.6, 0.45, 0.6, 0, 0, 0.02, 0.03);
  const pitch = place(cabinet, new THREE.Group(), 0, 0.05, -0.2);
  const barrelGroup = place(pitch, new THREE.Group());
  const barrels: THREE.Mesh[] = [];
  for (const bx of [-0.17, 0, 0.17]) {
    const b = C(barrelGroup, ink, 0.09, 0.1, 1.5, bx, 0, -0.75, 0.02, 10);
    b.rotation.x = PI / 2;
    const tip = C(barrelGroup, yellow, 0.12, 0.12, 0.14, bx, 0, -1.43, 0.015, 10);
    tip.rotation.x = PI / 2;
    barrels.push(b, tip);
  }
  const muzzle = place(pitch, new THREE.Object3D(), 0, 0, -1.55);
  const dish = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.45, 14, 1, true), new THREE.MeshToonMaterial({ color: PAL.green, side: THREE.DoubleSide }));
  dish.rotation.x = -PI / 2;
  place(pitch, dish, 0, 0, -1.28);
  dish.visible = false;
  const ammo = B(cabinet, yellow, 0.36, 0.3, 0.3, 0.45, -0.05, 0.1, 0.02);
  ammo.visible = false;
  const gunner = makeCow(PAL.blue);
  gunner.scale.setScalar(0.62);
  gunner.position.set(0, -0.78, 0.82);
  tur.add(gunner);
  const gp = gunner.userData.parts as CowParts;
  gp.legs.visible = false;
  const helmet = place(gp.head, new THREE.Group(), 0, 0.3, 0);
  S(helmet, toon(PAL.blue), 0.42, 0.28, 0.4, 0, 0, 0, 0.03);
  B(helmet, toon(PAL.yellow), 0.08, 0.1, 0.5, 0, 0.26, 0);
  B(helmet, toon('#9fe4ff'), 0.5, 0.1, 0.06, 0, -0.1, -0.38);

  // engine upgrades
  const engine: THREE.Group[] = [];
  const e1 = place(root, new THREE.Group());
  for (const sx of [-1, 1]) {
    const p = C(e1, steel, 0.11, 0.13, 0.7, sx * 0.97, 1.25, 1.8, 0.02, 10);
    p.rotation.z = 0;
    C(e1, ink, 0.1, 0.1, 0.05, sx * 0.97, 1.62, 1.8);
  }
  const e2 = place(root, new THREE.Group());
  B(e2, red, 1.9, 0.07, 0.55, 0, 1.75, 2.28, 0.02);
  for (const sx of [-1, 1]) B(e2, ink, 0.07, 0.5, 0.2, sx * 0.8, 1.5, 2.2);
  const e3 = place(root, new THREE.Group());
  for (const sx of [-1, 1]) {
    C(e3, steel, 0.09, 0.11, 0.55, sx * 0.77, 1.15, 1.8, 0.02, 10);
    B(e3, toon(PAL.orange), 0.1, 0.08, 0.9, sx * 0.5, 1.12, -1.3); // flame decals
  }
  B(e3, ink, 0.55, 0.22, 0.45, 0, 1.18, -1.55, 0.02);
  engine.push(e1, e2, e3);

  // armor upgrades
  const armor: THREE.Group[] = [];
  const a1 = place(root, new THREE.Group());
  const plateM = toon('#c4cbe0', L);
  for (const sx of [-1, 1]) {
    B(a1, plateM, 0.1, 0.5, 1.5, sx * 1.04, 1.0, 0.2, 0.025);
    for (const z of [-0.4, 0.8]) S(a1, ink, 0.06, 0.06, 0.06, sx * 1.1, 1.1, z);
  }
  const a2 = place(root, new THREE.Group());
  B(a2, plateM, 1.6, 0.35, 0.18, 0, 0.9, -2.15, 0.025).rotation.x = -0.25;
  B(a2, plateM, 1.0, 0.1, 1.1, 0, 1.12, -1.3, 0.02);
  const a3 = place(root, new THREE.Group());
  for (const sx of [-1, 0, 1]) C(a3, steel, 0, 0.14, 0.45, sx * 0.7, 0.58, -2.3, 0.015, 8).rotation.x = -PI / 2;
  for (const sx of [-1, 1]) B(a3, plateM, 0.12, 0.45, 1.6, sx * 0.98, 1.0, 1.25, 0.02);
  armor.push(a1, a2, a3);

  // shield bubble
  const shield = new THREE.Group();
  shield.position.set(0, 1.1, 0);
  const bubble = new THREE.Mesh(new THREE.SphereGeometry(2.7, 20, 14), new THREE.MeshBasicMaterial({ color: PAL.cyan, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide }));
  bubble.scale.set(1.0, 0.75, 1.35);
  const hex = new THREE.Mesh(new THREE.IcosahedronGeometry(2.72, 1), new THREE.MeshBasicMaterial({ color: '#c9f6ff', transparent: true, opacity: 0.35, wireframe: true, depthWrite: false }));
  hex.scale.copy(bubble.scale);
  shield.add(bubble, hex);
  shield.visible = false;
  group.add(shield);

  // nitro flames
  const flames: THREE.Group[] = [];
  const flameOuter = glowMat('#ff7a1a', 0.85), flameInner = glowMat('#fff2a0', 0.95);
  for (const sx of [-1, 1]) {
    const f = place(root, new THREE.Group(), sx * 0.55, 0.62, 2.3);
    const o = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1, 10), flameOuter);
    o.rotation.x = PI / 2; o.position.z = 0.5;
    const i = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.7, 8), flameInner);
    i.rotation.x = PI / 2; i.position.z = 0.35;
    f.add(o, i);
    f.visible = false;
    flames.push(f);
  }
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 8), glowMat('#ffb040', 0.35));
  place(root, glow, 0, 0.7, 2.5).visible = false;

  root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && (m.material as THREE.Material).type === 'MeshToonMaterial' && !(m.material as THREE.MeshToonMaterial).transparent) m.receiveShadow = true; });

  // state
  let brakeK = 0, dmgK = 0, driftK = 0;
  let steerS = 0, rollS = 0, pitchS = 0, yawS = 0, aimP = 0, kick = 0, flameK = 0, shieldK = 0, nitroLean = 0, spin = 0;
  const sh = { ex: 0 };
  const rig: CarRig = {
    group, muzzle,
    fireKick() { kick = 1; },
    update(dt, t, s) {
      const u = s.upgrades;
      steerS += (s.steer - steerS) * damp(10, dt);
      const speed = s.speed;
      spin += (speed * dt) / 0.48;
      for (const w of wheels) w.spin.rotation.x = -spin;
      for (const p of pivots) p.rotation.y = -steerS * 0.5;
      sw.rotation.z = steerS * 1.3;
      // lean/roll into turns, pitch on gas
      const sp01 = clamp(speed / 40, 0, 1.4);
      driftK += ((s.drifting ? 1 : 0) - driftK) * damp(8, dt);
      rollS += (steerS * 0.04 * (0.4 + sp01) * (1 + driftK * 0.6) - rollS) * damp(6, dt);
      root.rotation.y = -steerS * 0.3 * driftK;
      nitroLean += ((s.nitro ? 1 : 0) - nitroLean) * damp(5, dt);
      pitchS += (-0.02 - nitroLean * 0.07 - rollS * 0 - pitchS) * damp(5, dt);
      const bounce = Math.sin(t * 17) * 0.003 * sp01 + Math.sin(t * 11.3) * 0.003 * sp01;
      tilt.rotation.z = rollS;
      tilt.rotation.x = pitchS;
      tilt.position.y = 0.5 + bounce + (s.nitro ? 0.02 : 0);
      sh.ex = 0;
      if (s.hurt) { tilt.position.x = Math.sin(t * 70) * 0.04; } else tilt.position.x = 0;
      // cows
      setCowMood(driver, s.hurt, s.nitro, t);
      setCowMood(gunner, s.hurt, s.nitro, t);
      animateCow(driver, t, 0.6 + sp01 * 0.6);
      dp.head.rotation.y = -steerS * 0.35;
      animateCow(gunner, t + 1, 0.6 + (s.firing ? 1 : 0));
      gp.head.rotation.y = 0;
      // turret
      yawS += (s.aimYaw - yawS) * damp(24, dt);
      aimP += (s.aimPitch - aimP) * damp(24, dt);
      tur.rotation.y = yawS;
      pitch.rotation.x = aimP;
      kick = Math.max(0, kick - dt * 7);
      barrelGroup.position.z = kick * 0.28;
      cabinet.scale.set(1, 1 - kick * 0.05, 1 + kick * 0.05);
      gunner.position.z = 0.82 + kick * 0.05;
      // upgrades
      engine[0].visible = u.engine >= 1; engine[1].visible = u.engine >= 2; engine[2].visible = u.engine >= 3;
      armor[0].visible = u.armor >= 1; armor[1].visible = u.armor >= 2; armor[2].visible = u.armor >= 3;
      const twin = u.rapid >= 1, triple = u.rapid >= 3;
      barrels[0].visible = barrels[1].visible = twin;
      barrels[4].visible = barrels[5].visible = twin;
      barrels[2].visible = barrels[3].visible = !twin || triple;
      ammo.visible = u.rapid >= 2;
      dish.visible = u.spread >= 1;
      dish.scale.setScalar(0.7 + Math.min(3, u.spread) * 0.3);
      // nitro
      flameK += ((s.nitro ? 1 : 0) - flameK) * damp(14, dt);
      for (let i = 0; i < flames.length; i++) {
        const f = flames[i];
        f.visible = flameK > 0.05;
        const fl = flameK * (0.85 + 0.3 * Math.sin(t * 60 + i * 2) + 0.15 * Math.sin(t * 37));
        f.scale.set(1, 1, Math.max(0.01, fl * 1.6));
      }
      glow.visible = flameK > 0.05;
      glow.scale.setScalar(flameK * (1.1 + 0.2 * Math.sin(t * 45)));
      // shield
      shieldK += ((s.shield ? 1 : 0) - shieldK) * damp(10, dt);
      shield.visible = shieldK > 0.02;
      if (shield.visible) {
        const pulse = 1 + Math.sin(t * 5) * 0.03;
        shield.scale.setScalar(shieldK * pulse);
        hex.rotation.y = t * 0.6;
        (bubble.material as THREE.MeshBasicMaterial).opacity = 0.16 + 0.07 * Math.sin(t * 6);
      }
      // brake lights
      brakeK += ((s.braking ? 1 : 0) - brakeK) * damp(18, dt);
      tailM.color.copy(tailDim).lerp(tailHot, brakeK);
      tailGlowM.opacity = brakeK * 0.55;
      for (const g of tailGlows) { g.visible = brakeK > 0.05; g.scale.setScalar(0.8 + brakeK * 0.5); }
      flag.rotation.y = Math.sin(t * 14) * 0.35 * (0.3 + sp01);
      // exhaust puffs (car space: they drift back and up, scaled with throttle)
      const amt = 0.3 + sp01 * 0.4 + nitroLean * 0.4;
      for (let i = 0; i < exhaustPuffs.length; i++) {
        const m = exhaustPuffs[i];
        const ph = (t * (1.3 + sp01) + i / exhaustPuffs.length) % 1;
        const side = i & 1 ? 1 : -1;
        m.visible = !s.nitro;
        m.position.set(side * (0.55 + ph * 0.15), 0.65 + ph * 0.45, 2.35 + ph * (1.2 + sp01 * 1.6));
        m.scale.setScalar(Math.sin(ph * PI) * (0.06 + ph * 0.2) * amt * 1.6);
      }
      // damage
      const dm = clamp(s.damage ?? 0, 0, 1);
      dmgK += (dm - dmgK) * damp(6, dt);
      dents[0].visible = dmgK > 0.2; dents[1].visible = dmgK > 0.35; dents[2].visible = dmgK > 0.5; dents[3].visible = dmgK > 0.65;
      flapPivot.visible = dmgK > 0.5;
      flapPivot.rotation.z = -0.35 - Math.sin(t * 16) * 0.1 * (0.3 + sp01);
      hoodPivot.visible = dmgK > 0.78;
      hoodGap.visible = dmgK > 0.78;
      hoodPivot.rotation.x = -0.5 - Math.sin(t * 13) * 0.07 * (0.3 + sp01);
      for (let i = 0; i < smokePuffs.length; i++) {
        const m = smokePuffs[i];
        m.visible = dmgK > 0.35;
        if (!m.visible) continue;
        const ph = (t * 0.9 + i / smokePuffs.length) % 1;
        m.position.set(0.3 + Math.sin(i * 2 + t) * 0.15, 1.2 + ph * 1.8, -1.1 + ph * (1.2 + sp01 * 1.4));
        m.scale.setScalar(Math.sin(ph * PI) * (0.15 + ph * 0.5) * (0.5 + dmgK));
      }
      for (let i = 0; i < sparks.length; i++) {
        const m = sparks[i];
        const on = dmgK > 0.7 && Math.sin(t * (23 + i * 7) + i) > 0.55;
        m.visible = on;
        if (on) m.position.set((i & 1 ? 1 : -1) * (0.95 + Math.sin(t * 40 + i) * 0.1), 0.55 + Math.abs(Math.sin(t * 31 + i * 3)) * 0.3, -1.3 + Math.sin(t * 27 + i) * 0.3);
      }
      // hurt flash
      if (s.hurt) {
        const k = 0.5 + 0.5 * Math.sin(t * 45);
        setEmissive(L, 0.9 * k, 0.05 * k, 0.03 * k);
        group.visible = Math.sin(t * 60) > -0.6;
      } else {
        setEmissive(L, 0, 0, 0);
        group.visible = true;
      }
    },
  };
  return rig;
}

/* =============================================================== enemies */
export type EnemyKind = 'raider' | 'heavy' | 'boss';
export interface EnemyRig {
  group: THREE.Group;
  muzzle: THREE.Object3D;
  update(dt: number, t: number, s: { hpFrac: number; speed: number; telegraph: number }): void;
  flash(): void;
  size: { w: number; h: number; l: number };
}

interface Spinner { o: THREE.Object3D; axis: 'x' | 'y' | 'z'; rate: number; teleBoost?: number }
interface EnemyDef {
  group: THREE.Group; body: THREE.Group; L: Mats; wheels: Wheel[]; muzzle: THREE.Object3D; glow: THREE.Mesh;
  lights: { mat: THREE.MeshBasicMaterial; base: THREE.Color; hot: THREE.Color }[];
  spinners: Spinner[]; size: { w: number; h: number; l: number }; bounce: number; scorch?: THREE.Object3D[];
  anim?: (dt: number, t: number, tele: number) => void;
}

function lightMat(base: string, hot: string, defs: EnemyDef['lights']): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({ color: base });
  defs.push({ mat, base: new THREE.Color(base), hot: new THREE.Color(hot) });
  return mat;
}

function finishEnemy(d: EnemyDef): EnemyRig {
  let flashT = 0;
  const phase = Math.random() * 10;
  const tmp = new THREE.Color();
  let spinA = 0;
  return {
    group: d.group, muzzle: d.muzzle, size: d.size,
    flash() { flashT = 0.14; },
    update(dt, t, s) {
      const tele = clamp(s.telegraph, 0, 1);
      spinA += (s.speed * dt) / d.wheels[0].r;
      for (const w of d.wheels) w.spin.rotation.x = -spinA * (d.wheels[0].r / w.r);
      const sp = clamp(s.speed / 30, 0.2, 1.3);
      d.body.position.y = Math.abs(Math.sin(t * 13 + phase)) * d.bounce * sp;
      d.body.rotation.z = Math.sin(t * 3 + phase) * 0.018 + Math.sin(t * 9 + phase) * 0.008 * sp;
      d.body.rotation.x = Math.sin(t * 5.5 + phase) * 0.01 + tele * 0.02;
      flashT = Math.max(0, flashT - dt);
      const f = flashT / 0.14;
      const low = Math.max(0, 0.4 - s.hpFrac) / 0.4;
      const lowPulse = low * (0.5 + 0.5 * Math.sin(t * 16)) * 0.25;
      setEmissive(d.L, clamp(f * 0.95 + tele * 0.35 + lowPulse, 0, 1), clamp(f * 0.95 + tele * 0.12 + lowPulse * 0.25, 0, 1), clamp(f * 0.95, 0, 1));
      d.glow.visible = tele > 0.02;
      if (d.glow.visible) {
        d.glow.scale.setScalar(0.15 + tele * 0.55 + Math.sin(t * 40) * 0.05 * tele);
        (d.glow.material as THREE.MeshBasicMaterial).opacity = 0.5 + tele * 0.5;
      }
      for (const l of d.lights) {
        const blink = tele > 0.02 ? (0.5 + 0.5 * Math.sin(t * (14 + 20 * tele))) * tele : 0;
        l.mat.color.copy(l.base).lerp(tmp.copy(l.hot), clamp(blink + f, 0, 1));
      }
      for (const sp2 of d.spinners) sp2.o.rotation[sp2.axis] += dt * sp2.rate * (1 + (sp2.teleBoost ?? 0) * tele);
      if (d.scorch) for (let i = 0; i < d.scorch.length; i++) d.scorch[i].visible = s.hpFrac < 0.8 - i * 0.2;
      d.anim?.(dt, t, tele);
    },
  };
}

function muzzleGlow(parent: THREE.Object3D, color: string): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), glowMat(color, 1));
  m.visible = false;
  parent.add(m);
  return m;
}

function buildRaider(): EnemyRig {
  const L: Mats = [];
  const lights: EnemyDef['lights'] = [];
  const group = new THREE.Group();
  const body = place(group, new THREE.Group());
  const purple = toon(PAL.purple, L), deep = toon('#6a2bc4', L), red = toon(PAL.red, L), ink = toon(PAL.ink, L), steel = toon(PAL.steel, L), dark = toon(PAL.dark, L);

  B(body, ink, 1.6, 0.3, 3.4, 0, 0.55, 0.1);
  B(body, purple, 1.95, 0.5, 3.3, 0, 0.8, 0.1, 0.04);
  B(body, deep, 1.7, 0.36, 1.3, 0, 1.12, -1.0, 0.04);
  B(body, red, 0.36, 0.04, 1.32, 0, 1.31, -1.0);
  for (const sx of [-1, 1]) {
    B(body, red, 0.1, 0.12, 2.6, sx * 0.99, 0.82, 0.1);
    B(body, purple, 0.34, 0.12, 1.0, sx * 1.02, 0.7, -1.2, 0.02);
    B(body, purple, 0.34, 0.12, 1.0, sx * 1.02, 0.7, 1.3, 0.02);
    S(body, lightMat('#ff8a3a', '#ffffff', lights), 0.17, 0.17, 0.1, sx * 0.62, 1.0, -1.72);
    C(body, steel, 0.08, 0.1, 0.8, sx * 0.62, 1.55, 1.58, 0.015, 8).rotation.z = sx * 0.15;
  }
  B(body, ink, 2.05, 0.3, 0.3, 0, 0.62, -1.82, 0.025);
  for (const sx of [-1, -0.33, 0.33, 1]) C(body, steel, 0, 0.12, 0.42, sx * 0.7, 0.62, -2.05, 0.015, 8).rotation.x = -PI / 2;
  B(body, dark, 1.3, 0.6, 0.3, 0, 1.2, 0.8);
  B(body, steel, 1.2, 0.6, 0.8, 0, 1.1, 1.45, 0.03);
  for (const sx of [-1, 1]) {
    C(body, ink, 0.05, 0.05, 1.05, sx * 0.88, 1.4, 0.0, 0.01, 8);
    C(body, ink, 0.05, 0.05, 1.05, sx * 0.88, 1.4, 1.0, 0.01, 8);
  }
  B(body, ink, 1.85, 0.08, 1.2, 0, 1.88, 0.5, 0.01);
  // raider extras: skull emblem, spikes, side pipes, headlight bar, bull bar
  const bone = toon(PAL.cream, L), orangeL = toon(PAL.orange, L);
  S(body, bone, 0.2, 0.17, 0.08, 0, 1.0, -1.7, 0.015);
  B(body, ink, 0.05, 0.05, 0.03, -0.07, 1.02, -1.78);
  B(body, ink, 0.05, 0.05, 0.03, 0.07, 1.02, -1.78);
  B(body, ink, 0.06, 0.07, 0.03, 0, 0.93, -1.78);
  for (let i = 0; i < 5; i++) C(body, steel, 0, 0.1, 0.35, (i - 2) * 0.32, 1.33, 0.15, 0.012, 6);
  for (const sx of [-1, 1]) {
    const pipe = C(body, steel, 0.09, 0.1, 1.5, sx * 1.1, 0.5, 0.5, 0.015, 8);
    pipe.rotation.x = PI / 2;
    C(body, ink, 0.1, 0.1, 0.06, sx * 1.1, 0.5, -0.25, 0, 8).rotation.x = PI / 2;
    B(body, orangeL, 0.06, 0.1, 1.1, sx * 1.0, 0.95, 0.1); // flame decal
    for (let i = 0; i < 3; i++) C(body, steel, 0, 0.1, 0.3, sx * 1.1, 0.7 + i * 0.12, -1.2 + i * 0.1, 0.01, 5).rotation.z = sx * -PI / 2;
  }
  B(body, ink, 1.4, 0.07, 0.05, 0, 1.28, -1.72);
  const sheepRef = { y: 0 };
  void sheepRef;
  // bandit sheep
  const sheep = makeSheep(L);
  sheep.scale.setScalar(0.62);
  sheep.position.set(0, 0.8, 0.55);
  body.add(sheep);
  // gun
  B(body, ink, 0.42, 0.36, 0.5, 0, 1.3, -0.65, 0.025);
  const barrel = C(body, steel, 0.1, 0.12, 1.1, 0, 1.36, -1.4, 0.02, 10);
  barrel.rotation.x = PI / 2;
  const muzzle = place(body, new THREE.Object3D(), 0, 1.36, -1.98);
  const glow = muzzleGlow(muzzle, '#ff7a1a');
  // jolly flag
  const pole = C(body, ink, 0.025, 0.03, 1.2, 0.85, 1.9, 1.7, 0, 6);
  const flag = place(body, new THREE.Group(), 0.85, 2.3, 1.7);
  B(flag, ink, 0.03, 0.4, 0.7, 0, 0, 0.35);
  B(flag, toon(PAL.white, L), 0.04, 0.16, 0.16, 0, 0.04, 0.3);
  pole.castShadow = false;

  const wheels: Wheel[] = [];
  for (const [sx, z, r] of [[-1, -1.25, 0.5], [1, -1.25, 0.5], [-1, 1.3, 0.58], [1, 1.3, 0.58]] as const) {
    const w = makeWheel(r, 0.46, L, PAL.red);
    place(body, w.root, sx * 1.0, r, z);
    wheels.push(w);
  }
  return finishEnemy({
    group, body, L, wheels, muzzle, glow, lights, spinners: [], bounce: 0.045,
    size: { w: 2.4, h: 1.9, l: 3.8 },
    anim(_dt, t, tele) { flag.rotation.y = Math.sin(t * 9) * 0.3; sheep.position.y = 0.8 + Math.sin(t * 13) * 0.02; sheep.rotation.z = Math.sin(t * 17) * 0.03 * (1 + tele * 3); },
  });
}

function buildHeavy(): EnemyRig {
  const L: Mats = [];
  const lights: EnemyDef['lights'] = [];
  const group = new THREE.Group();
  const body = place(group, new THREE.Group());
  const rust = toon('#d65a1e', L), ink = toon(PAL.ink, L), steel = toon('#aab2c8', L), dark = toon(PAL.dark, L), wood = toon(PAL.wood, L), hay = toon('#ffd54a', L), red = toon(PAL.red, L);

  B(body, ink, 2.2, 0.4, 4.6, 0, 0.8, 0);
  // cab + hood
  B(body, rust, 2.5, 1.5, 1.5, 0, 1.75, -0.95, 0.045);
  B(body, rust, 2.4, 0.9, 1.1, 0, 1.2, -2.0, 0.045);
  B(body, dark, 2.1, 0.55, 0.06, 0, 2.0, -1.72);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.55, 0.06), new THREE.MeshToonMaterial({ color: '#9fe4ff', transparent: true, opacity: 0.5 }));
  place(body, glass, 0, 2.15, -1.72);
  B(body, ink, 2.0, 0.6, 0.1, 0, 1.15, -2.58); // grille
  for (let i = -2; i <= 2; i++) B(body, steel, 0.08, 0.5, 0.06, i * 0.35, 1.15, -2.64);
  B(body, steel, 2.9, 0.4, 0.5, 0, 0.7, -2.65, 0.03);
  // plow plate
  const plow = B(body, steel, 2.9, 0.9, 0.2, 0, 0.95, -2.95, 0.03);
  plow.rotation.x = -0.35;
  for (const sx of [-1, 0, 1]) C(body, steel, 0, 0.16, 0.5, sx * 1.1, 0.85, -3.2, 0.015, 8).rotation.x = -PI / 2;
  for (const sx of [-1, 1]) {
    S(body, lightMat('#fff3a0', '#ffffff', lights), 0.2, 0.2, 0.1, sx * 0.9, 1.35, -2.6);
    C(body, ink, 0.09, 0.11, 1.1, sx * 1.0, 2.9 - 0.2, -0.35, 0.02, 8);
    B(body, steel, 0.12, 0.8, 1.3, sx * 1.28, 1.7, -0.95, 0.03); // armour plates
    B(body, steel, 0.12, 0.5, 2.6, sx * 1.4, 1.0, 1.1, 0.03);
    for (const z of [-0.4, 1.9]) S(body, ink, 0.07, 0.07, 0.07, sx * 1.47, 1.2, z);
  }
  // goat driver
  const goat = makeGoat(L);
  goat.scale.setScalar(0.62);
  goat.position.set(0, 1.0, -0.9);
  body.add(goat);
  const helm = new THREE.Group();
  helm.position.set(0, 1.0, -0.25);
  S(helm, steel, 0.36, 0.2, 0.34, 0, 0.32, 0);
  B(helm, red, 0.08, 0.1, 0.5, 0, 0.5, 0);
  goat.add(helm);
  // flatbed + hay stack
  B(body, wood, 2.7, 0.22, 2.8, 0, 1.0, 1.35, 0.03);
  for (const sx of [-1, 1]) B(body, steel, 0.14, 0.9, 2.8, sx * 1.35, 1.5, 1.35, 0.025);
  B(body, steel, 2.8, 0.9, 0.14, 0, 1.5, 2.75, 0.025);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const b = C(body, hay, 0.62, 0.62, 1.1, (i - 0.5) * 1.15, 1.8, 0.65 + j * 1.35, 0.03);
    b.rotation.z = PI / 2;
    C(body, ink, 0.63, 0.63, 0.1, (i - 0.5) * 1.15, 1.8, 0.65 + j * 1.35).rotation.z = PI / 2;
  }
  // heavy extras: hazard stripes on the plow, roof searchlight, exhaust stacks, rivets, tow chain
  const hazY = toon(PAL.yellow, L);
  for (let i = -3; i <= 3; i++) {
    const hs = B(body, i % 2 ? ink : hazY, 0.28, 0.85, 0.06, i * 0.4, 0.95, -3.05);
    hs.rotation.x = -0.35; hs.rotation.z = 0.3;
  }
  for (const sx of [-1, 1]) {
    C(body, steel, 0.12, 0.14, 1.6, sx * 1.1, 3.0, 0.3, 0.02, 8);
    C(body, ink, 0.17, 0.17, 0.08, sx * 1.1, 3.82, 0.3, 0, 8);
    S(body, lightMat('#ffe9a0', '#ffffff', lights), 0.16, 0.16, 0.16, sx * 0.8, 2.6, -1.5);
    for (let i = 0; i < 3; i++) S(body, ink, 0.05, 0.05, 0.05, sx * 1.36, 0.85 + i * 0.001, -0.3 + i * 0.9);
  }
  const chain = B(body, ink, 0.05, 0.05, 0.5, 0, 0.6, 2.95);
  chain.rotation.x = 0.4;
  // cannon on hood roof
  B(body, ink, 0.8, 0.4, 0.9, 0, 2.6, -0.95, 0.03);
  const cannonG = place(body, new THREE.Group(), 0, 2.72, -0.95);
  const cannon = C(cannonG, steel, 0.22, 0.28, 1.7, 0, 0, -0.85, 0.03, 12);
  cannon.rotation.x = PI / 2;
  C(cannonG, ink, 0.32, 0.32, 0.18, 0, 0, -1.7, 0.02, 12).rotation.x = PI / 2;
  const muzzle = place(cannonG, new THREE.Object3D(), 0, 0, -1.8);
  const glow = muzzleGlow(muzzle, '#ff5a1a');
  // chimney smoke stack tops
  const wheels: Wheel[] = [];
  for (const [sx, z, r] of [[-1, -1.55, 0.72], [1, -1.55, 0.72], [-1, 1.4, 0.74], [1, 1.4, 0.74]] as const) {
    const w = makeWheel(r, 0.6, L, PAL.yellow);
    place(body, w.root, sx * 1.2, r, z);
    wheels.push(w);
  }
  return finishEnemy({
    group, body, L, wheels, muzzle, glow, lights, spinners: [], bounce: 0.035,
    size: { w: 3.0, h: 2.8, l: 4.8 },
    anim(_dt, _t, tele) { cannonG.position.z = -0.95 + tele * 0.12; goat.position.y = 1.0 + Math.sin(_t * 11) * 0.02; plow.rotation.x = -0.35 + Math.sin(_t * 20) * 0.015; },
  });
}

function buildBoss(): EnemyRig {
  const L: Mats = [];
  const lights: EnemyDef['lights'] = [];
  const group = new THREE.Group();
  const body = place(group, new THREE.Group());
  const red = toon(PAL.red, L), yellow = toon(PAL.yellow, L), ink = toon(PAL.ink, L), steel = toon('#b4bcd2', L), dark = toon(PAL.dark, L), orange = toon(PAL.orange, L);
  const spinners: Spinner[] = [];

  B(body, ink, 3.8, 0.5, 6.0, 0, 1.0, 0.3);
  B(body, red, 4.2, 1.8, 4.0, 0, 2.0, 1.2, 0.06);
  B(body, yellow, 4.26, 0.3, 4.0, 0, 2.3, 1.2);
  B(body, yellow, 3.6, 1.7, 2.4, 0, 3.55, 2.2, 0.06); // grain tank
  B(body, orange, 3.7, 0.25, 2.5, 0, 4.4, 2.2, 0.04);
  // auger
  C(body, steel, 0.28, 0.28, 3.2, 1.9, 3.8, 0.5, 0.03, 10).rotation.x = PI / 2.6;
  // cab
  B(body, dark, 2.3, 1.5, 1.8, 0, 3.15, -0.5, 0.05);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.1, 0.06), new THREE.MeshToonMaterial({ color: '#9fe4ff', transparent: true, opacity: 0.45 }));
  place(body, glass, 0, 3.25, -1.42);
  for (const sx of [-1, 1]) B(body, ink, 0.06, 1.1, 1.5, sx * 1.12, 3.25, -0.5);
  B(body, ink, 2.5, 0.16, 2.0, 0, 3.98, -0.5, 0.025);
  const bull = makeBull(L);
  bull.scale.setScalar(0.85);
  bull.position.set(0, 2.45, -0.15);
  body.add(bull);
  const hel = new THREE.Group();
  hel.position.set(0, 1.4, -0.8);
  S(hel, steel, 0.5, 0.28, 0.42, 0, 0.42, 0.02);
  for (const sx of [-1, 0, 1]) C(hel, ink, 0, 0.09, 0.3, sx * 0.25, 0.7, 0.02, 0.01, 6);
  bull.add(hel);
  // sirens
  for (const [sx, c, h] of [[-1, '#ff2a2a', '#ffffff'], [1, '#2a6bff', '#ffffff']] as const) {
    C(body, ink, 0.26, 0.3, 0.14, sx * 0.85, 4.15, 0.1);
    S(body, lightMat(c, h, lights), 0.24, 0.24, 0.24, sx * 0.85, 4.35, 0.1);
    const beam = new THREE.Group();
    beam.position.set(sx * 0.85, 4.35, 0.1);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.8, 10, 1, true), glowMat(c, 0.35));
    cone.rotation.z = PI / 2;
    cone.position.x = 0.9;
    beam.add(cone);
    body.add(beam);
    spinners.push({ o: beam, axis: 'y', rate: 6 * -sx, teleBoost: 2 });
  }
  // cannon on cab roof
  const cannonG = place(body, new THREE.Group(), 0, 4.2, -0.5);
  const cannon = C(cannonG, steel, 0.24, 0.3, 2.2, 0, 0, -1.2, 0.035, 12);
  cannon.rotation.x = PI / 2;
  C(cannonG, ink, 0.36, 0.36, 0.2, 0, 0, -2.3, 0.02, 12).rotation.x = PI / 2;
  B(cannonG, ink, 0.9, 0.5, 0.9, 0, -0.1, 0.1, 0.03);
  const muzzle = place(cannonG, new THREE.Object3D(), 0, 0, -2.5);
  const glow = muzzleGlow(muzzle, '#ff4a1a');

  // header with spinning reel + cutter bar + saw discs
  const header = place(body, new THREE.Group(), 0, 0, 0);
  B(header, yellow, 6.0, 0.8, 0.9, 0, 1.15, -2.6, 0.05);
  B(header, ink, 6.0, 0.7, 0.3, 0, 1.0, -3.0, 0.03);
  const reel = place(header, new THREE.Group(), 0, 2.05, -3.0);
  C(reel, ink, 0.3, 0.3, 5.6, 0, 0, 0, 0.02, 10).rotation.z = PI / 2;
  for (let i = 0; i < 6; i++) {
    const arm = place(reel, new THREE.Group());
    arm.rotation.x = (i / 6) * PI * 2;
    B(arm, i % 2 ? red : orange, 5.4, 0.12, 0.7, 0, 0.9, 0, 0.025);
    B(arm, steel, 5.4, 0.1, 0.1, 0, 0.55, 0);
  }
  spinners.push({ o: reel, axis: 'x', rate: 4.5, teleBoost: 0.6 });
  const teeth = place(header, new THREE.Group(), 0, 0.62, -3.3);
  for (let i = 0; i < 22; i++) C(teeth, steel, 0, 0.17, 0.5, (i - 10.5) * 0.27, 0, 0, 0.01, 6).rotation.x = -PI / 2;
  for (const sx of [-1, 1]) {
    const saw = place(header, new THREE.Group(), sx * 3.1, 1.15, -3.3);
    const disc = C(saw, steel, 0.95, 0.95, 0.14, 0, 0, 0, 0.04, 20);
    disc.rotation.z = PI / 2;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * PI * 2;
      const tooth = C(saw, ink, 0, 0.13, 0.3, 0, Math.cos(a) * 1.0, Math.sin(a) * 1.0, 0, 5);
      tooth.rotation.x = a - PI / 2 + PI;
      tooth.rotation.x = a;
      tooth.rotation.z = 0;
    }
    C(saw, red, 0.25, 0.25, 0.2, 0, 0, 0).rotation.z = PI / 2;
    spinners.push({ o: saw, axis: 'x', rate: 14 * sx, teleBoost: 0.8 });
  }
  // weak-point core pod: armour lids slide open during the telegraph to expose a glowing core
  const pod = place(body, new THREE.Group(), 0, 3.55, -2.05);
  B(pod, ink, 1.1, 0.2, 0.9, 0, -0.35, 0, 0.03);
  const coreM = new THREE.MeshBasicMaterial({ color: '#ffd24a' });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 1), coreM);
  pod.add(core);
  const coreGlow = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 9), glowMat('#ff5a1a', 0.5));
  pod.add(coreGlow);
  const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 6, 20), glowMat('#fff2a0', 0.9));
  pod.add(coreRing);
  const lidL = B(pod, steel, 0.55, 0.14, 0.9, -0.28, 0.32, 0, 0.03);
  const lidR = B(pod, steel, 0.55, 0.14, 0.9, 0.28, 0.32, 0, 0.03);
  for (const sx of [-1, 1]) B(pod, ink, 0.1, 0.5, 0.9, sx * 0.58, 0, 0, 0.02);
  core.visible = coreGlow.visible = coreRing.visible = false;
  // exhaust stack
  C(body, ink, 0.2, 0.26, 1.4, -1.5, 3.6, 0.1, 0.02, 8);
  // sheaf of grain on the tank + hazard stripes on the header
  for (let i = -4; i <= 4; i++) B(header, i % 2 ? ink : red, 0.5, 0.16, 0.06, i * 0.6, 1.45, -3.08);
  for (const sx of [-1, 1]) C(body, steel, 0.08, 0.1, 1.2, sx * 1.6, 4.7, 2.2, 0.015, 6);
  // scorch marks, revealed as health drops
  const scorch: THREE.Object3D[] = [];
  const sc = toon('#2a1a1a', L);
  for (const [x, y, z, w, h] of [[-2.12, 2.1, 0.6, 0.06, 0.9], [2.12, 2.5, 1.8, 0.06, 0.8], [0.6, 3.5, 3.44, 1.0, 0.7], [-1.0, 4.0, -1.55, 1.2, 0.1]] as const) {
    const m = z > 3 ? B(body, sc, w, h, 0.06, x, y, z) : y > 3.9 ? B(body, sc, w, 0.06, 0.6, x, y + 0.5, z) : B(body, sc, w, h, 1.0, x, y, z);
    m.visible = false;
    scorch.push(m);
  }

  const wheels: Wheel[] = [];
  for (const [sx, z, r, w] of [[-1, -0.3, 1.1, 0.9], [1, -0.3, 1.1, 0.9], [-1, 3.0, 0.75, 0.65], [1, 3.0, 0.75, 0.65]] as const) {
    const wh = makeWheel(r, w, L, PAL.yellow);
    place(body, wh.root, sx * (r > 1 ? 2.5 : 2.0), r, z);
    wheels.push(wh);
  }
  return finishEnemy({
    group, body, L, wheels, muzzle, glow, lights, spinners, scorch, bounce: 0.06,
    size: { w: 6, h: 4.5, l: 7 },
    anim(_dt, t, tele) {
      teeth.position.x = Math.sin(t * 28) * 0.12;
      cannonG.position.z = -0.5 + tele * 0.2;
      bull.position.y = 2.45 + Math.sin(t * 10) * 0.03;
      bull.rotation.z = Math.sin(t * 20) * 0.03 * (0.3 + tele);
      const open = clamp((tele - 0.05) / 0.4, 0, 1);
      lidL.position.x = -0.28 - open * 0.42;
      lidR.position.x = 0.28 + open * 0.42;
      lidL.rotation.z = open * 0.6; lidR.rotation.z = -open * 0.6;
      const on = open > 0.02;
      core.visible = coreGlow.visible = coreRing.visible = on;
      if (on) {
        const pulse = 0.5 + 0.5 * Math.sin(t * (14 + 20 * tele));
        core.scale.setScalar(0.5 + open * 0.8 + pulse * 0.15);
        core.rotation.y = t * 4; core.rotation.x = t * 3;
        coreM.color.setHex(0xffb030).lerp(tmpCore.setHex(0xffffff), pulse * tele);
        coreGlow.scale.setScalar(0.4 + open * 1.1 + pulse * 0.25);
        (coreGlow.material as THREE.MeshBasicMaterial).opacity = 0.25 + 0.4 * open;
        coreRing.scale.setScalar(0.7 + open * 0.6 + pulse * 0.15);
        coreRing.rotation.x = PI / 2 + Math.sin(t * 5) * 0.4; coreRing.rotation.z = t * 3;
      }
    },
  });
}

export function makeEnemy(kind: EnemyKind): EnemyRig {
  return kind === 'boss' ? buildBoss() : kind === 'heavy' ? buildHeavy() : buildRaider();
}

/* =============================================================== props */
export function makeBarrel(): THREE.Group {
  const g = new THREE.Group();
  const orange = toon(PAL.orange), ink = toon(PAL.ink), yellow = toon(PAL.yellow), dark = toon('#c96a00');
  C(g, orange, 0.65, 0.62, 1.3, 0, 0.65, 0, 0.035, 16);
  for (const y of [0.25, 1.05]) C(g, ink, 0.665, 0.665, 0.1, 0, y, 0, 0, 16);
  C(g, dark, 0.58, 0.58, 0.06, 0, 1.31, 0, 0, 16);
  C(g, yellow, 0.1, 0.1, 0.12, 0.25, 1.36, 0.2, 0.01, 8);
  const sp = S(g, glowMat('#fff0a0', 0.9), 0.1, 0.1, 0.1, -0.2, 1.42, -0.1);
  sp.castShadow = false;
  for (const s of [-1, 1]) {
    const lab = C(g, yellow, 0.3, 0.3, 0.05, 0, 0.65, s * 0.64, 0.015, 14);
    lab.rotation.x = PI / 2;
    const fl = C(g, ink, 0, 0.17, 0.34, 0, 0.66, s * 0.68, 0, 6);
    fl.rotation.x = s * PI / 2;
    fl.scale.set(0.17, 0.05, 0.17);
    B(g, toon(PAL.red), 0.5, 0.14, 0.04, 0, 0.9, s * 0.64);
  }
  return g;
}

const rockGeos = new Map<number, THREE.BufferGeometry>();
export function makeRock(seed: number): THREE.Group {
  const key = Math.abs(Math.floor(seed)) % 8;
  let geo = rockGeos.get(key);
  if (!geo) {
    const r = rng(key + 11);
    const base = new THREE.IcosahedronGeometry(1, 1);
    const pos = base.attributes.position;
    const seen = new Map<string, number>();
    for (let i = 0; i < pos.count; i++) {
      const k = pos.getX(i).toFixed(3) + pos.getY(i).toFixed(3) + pos.getZ(i).toFixed(3);
      let f = seen.get(k);
      if (f === undefined) { f = 0.82 + r() * 0.36; seen.set(k, f); }
      pos.setXYZ(i, pos.getX(i) * f, pos.getY(i) * f, pos.getZ(i) * f);
    }
    geo = base.toNonIndexed();
    geo.computeVertexNormals();
    rockGeos.set(key, geo);
  }
  const g = new THREE.Group();
  const tones = ['#9aa0b4', '#8a90a6', '#a8aec0'];
  const m = new THREE.Mesh(geo, toon(tones[key % 3]));
  m.scale.set(1.1, 0.78, 1.0);
  m.rotation.y = key * 0.9;
  m.castShadow = true;
  edge(m, 0.04);
  place(g, m, 0, 0.62, 0);
  const r = rng(key + 3);
  for (let i = 0; i < 2; i++) {
    const s = new THREE.Mesh(geo, toon('#7e849a'));
    s.scale.setScalar(0.28 + r() * 0.14);
    place(g, s, (r() - 0.5) * 2.4, 0.2, 0.9 + r() * 0.2);
  }
  S(g, toon('#5fb04a'), 0.55, 0.12, 0.45, -0.2, 1.3, 0.1);
  return g;
}

export function makeHayBale(): THREE.Group {
  const g = new THREE.Group();
  const hay = toon('#ffd54a'), light = toon('#ffe58a'), ink = toon(PAL.ink);
  const body = C(g, hay, 0.8, 0.8, 2.0, 0, 0.8, 0, 0.04, 18);
  body.rotation.z = PI / 2;
  for (const s of [-1, 1]) {
    const e = C(g, light, 0.74, 0.74, 0.06, s * 1.0, 0.8, 0, 0, 18);
    e.rotation.z = PI / 2;
    for (const r of [0.2, 0.45, 0.68]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.018, 4, 20), ink);
      ring.rotation.y = PI / 2;
      place(g, ring, s * 1.035, 0.8, 0);
    }
  }
  for (const x of [-0.55, 0.55]) {
    const strap = C(g, ink, 0.83, 0.83, 0.1, x, 0.8, 0, 0, 18);
    strap.rotation.z = PI / 2;
  }
  const r = rng(5);
  for (let i = 0; i < 5; i++) {
    const t = B(g, hay, 0.05, 0.28, 0.05, (r() - 0.5) * 1.8, 1.55 + r() * 0.1, (r() - 0.5) * 0.6);
    t.rotation.z = (r() - 0.5) * 0.8;
  }
  return g;
}

export function makeOilSlick(): THREE.Group {
  const g = new THREE.Group();
  const r = rng(42);
  const pts: THREE.Vector2[] = [];
  const N = 22;
  const ph = [r() * 6, r() * 6, r() * 6];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * PI * 2;
    const rad = 1.75 + 0.22 * Math.sin(a * 3 + ph[0]) + 0.14 * Math.sin(a * 5 + ph[1]) + 0.08 * Math.sin(a * 2 + ph[2]);
    pts.push(new THREE.Vector2(Math.cos(a) * rad, Math.sin(a) * rad));
  }
  const geo = new THREE.ShapeGeometry(new THREE.Shape(pts));
  geo.rotateX(-PI / 2);
  const m = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ color: '#17172e', polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  m.position.y = 0.02;
  g.add(m);
  const sheen = [['#7a5cff', -0.5, 0.4, 0.9, 0.5], ['#38e1ff', 0.5, -0.3, 0.8, 0.4], ['#ff5ca8', 0.1, 0.8, 0.5, 0.3]] as const;
  for (const [c, x, z, sx, sz] of sheen) {
    const s = new THREE.Mesh(new THREE.CircleGeometry(1, 14), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.28, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    s.rotation.x = -PI / 2;
    s.scale.set(sx, sz, 1);
    s.position.set(x, 0.03, z);
    g.add(s);
  }
  const hl = new THREE.Mesh(new THREE.CircleGeometry(1, 10), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.4, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5 }));
  hl.rotation.x = -PI / 2;
  hl.scale.set(0.45, 0.18, 1);
  hl.position.set(-0.8, 0.035, -0.6);
  g.add(hl);
  g.userData.size = 4;
  g.userData.radius = 2;
  return g;
}

/** Enemy shell: glowing red orb, trail along +Z (it flies toward -Z by default; rotate the group to aim). */
export function makeShell(): THREE.Group {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffe0d0' }));
  const mid = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), glowMat('#ff2a1a', 0.85));
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.62, 10, 8), glowMat('#ff5a2a', 0.28));
  const trail = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.8, 10, 1, true), glowMat('#ff4a1a', 0.45));
  trail.rotation.x = PI / 2;
  trail.position.z = 0.9;
  const trail2 = new THREE.Mesh(new THREE.ConeGeometry(0.18, 2.6, 8, 1, true), glowMat('#ffb050', 0.5));
  trail2.rotation.x = PI / 2;
  trail2.position.z = 1.3;
  g.add(core, mid, halo, trail, trail2);
  g.position.y = 0;
  g.userData.parts = { halo, mid, trail };
  return g;
}
/** Optional pulse for shells. */
export function updateShell(g: THREE.Object3D, t: number): void {
  const p = g.userData.parts as { halo: THREE.Mesh; mid: THREE.Mesh; trail: THREE.Mesh };
  p.halo.scale.setScalar(1 + Math.sin(t * 30) * 0.15);
  p.trail.scale.set(1, 1, 0.9 + Math.sin(t * 40) * 0.15);
}

/* =============================================================== pickups */
export type Upgrade = 'engine' | 'armor' | 'rapid' | 'spread' | 'shield' | 'repair';
const PICK_COLOR: Record<Upgrade, string> = {
  engine: PAL.orange, armor: PAL.blue, rapid: PAL.yellow, spread: PAL.purple, shield: PAL.cyan, repair: PAL.green,
};

export function makePickup(kind: Upgrade): THREE.Group {
  const g = new THREE.Group();
  const col = PICK_COLOR[kind];
  const flt = place(g, new THREE.Group(), 0, 1.0, 0);
  const crate = place(flt, new THREE.Group());
  B(crate, toon(PAL.wood), 0.95, 0.95, 0.95, 0, 0, 0, 0.045);
  const band = toon(col);
  for (const s of [-1, 1]) {
    B(crate, band, 0.1, 1.0, 1.0, s * 0.43, 0, 0);
    B(crate, band, 1.0, 0.1, 1.0, 0, s * 0.43, 0);
    B(crate, band, 1.0, 1.0, 0.1, 0, 0, s * 0.43);
  }
  const icon = place(flt, new THREE.Group(), 0, 0.95, 0);
  const white = toon(PAL.white), ink = toon(PAL.ink), c = toon(col);
  switch (kind) {
    case 'engine': {
      const gear = C(icon, c, 0.28, 0.28, 0.14, 0, 0, 0, 0.03, 12);
      gear.rotation.x = PI / 2;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * PI * 2;
        const t = B(icon, c, 0.12, 0.12, 0.14, Math.cos(a) * 0.34, Math.sin(a) * 0.34, 0, 0.02);
        t.rotation.z = a;
      }
      C(icon, ink, 0.1, 0.1, 0.16, 0, 0, 0).rotation.x = PI / 2;
      break;
    }
    case 'armor': {
      B(icon, c, 0.55, 0.42, 0.14, 0, 0.1, 0, 0.03);
      const tip = C(icon, c, 0.275, 0, 0.35, 0, -0.25, 0, 0.03, 4);
      tip.rotation.y = PI / 4; tip.scale.z = 0.25;
      B(icon, white, 0.12, 0.34, 0.16, 0, 0.1, 0.01);
      break;
    }
    case 'rapid':
      for (const x of [-0.22, 0, 0.22]) {
        C(icon, c, 0.09, 0.09, 0.4, x, 0, 0, 0.025, 8);
        C(icon, toon(PAL.orange), 0, 0.09, 0.2, x, 0.3, 0, 0.02, 8);
      }
      break;
    case 'spread':
      for (const a of [-0.6, 0, 0.6]) {
        const arm = place(icon, new THREE.Group());
        arm.rotation.z = a;
        C(arm, c, 0.0, 0.1, 0.3, 0, 0.38, 0, 0.025, 8);
        C(arm, white, 0.04, 0.04, 0.3, 0, 0.1, 0, 0, 6);
      }
      S(icon, ink, 0.1, 0.1, 0.1, 0, -0.1, 0);
      break;
    case 'shield': {
      const bub = new THREE.Mesh(new THREE.SphereGeometry(0.4, 14, 10), glowMat(col, 0.55, false));
      icon.add(bub);
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.2), toon(PAL.white));
      star.scale.y = 1.5;
      icon.add(star);
      break;
    }
    case 'repair':
      B(icon, white, 0.5, 0.18, 0.16, 0, 0, 0, 0.03);
      B(icon, white, 0.18, 0.5, 0.16, 0, 0, 0, 0.03);
      B(icon, c, 0.4, 0.1, 0.18);
      B(icon, c, 0.1, 0.4, 0.18);
      break;
  }
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.035, 6, 24), glowMat(col, 0.7));
  halo.rotation.x = PI / 2;
  place(g, halo, 0, 0.12, 0);
  g.userData.flt = flt;
  g.userData.icon = icon;
  g.userData.halo = halo;
  g.userData.kind = kind;
  g.userData.phase = Math.random() * 6;
  return g;
}

export function updatePickup(g: THREE.Group, t: number): void {
  const u = g.userData;
  const ph = (u.phase as number) ?? 0;
  const flt = u.flt as THREE.Object3D;
  flt.position.y = 1.0 + Math.sin(t * 2.6 + ph) * 0.18;
  flt.rotation.y = t * 1.8 + ph;
  flt.rotation.z = Math.sin(t * 1.7 + ph) * 0.1;
  (u.icon as THREE.Object3D).rotation.y = t * 2.4;
  const halo = u.halo as THREE.Mesh;
  halo.scale.setScalar(1 + Math.sin(t * 4 + ph) * 0.12);
  halo.rotation.z = t * 0.8;
  void lerp;
}
