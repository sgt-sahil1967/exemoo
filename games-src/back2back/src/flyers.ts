// Airborne enemies: crow-pilot biplane drone, bandit crop-duster bomber, and the bomb they drop. Face -Z.
import * as THREE from 'three';
import type { EnemyRig } from './models';
import { B, C, PAL, S, clamp, glowMat, place, setEmissive, toon, type Mats } from './models-util';

interface FlyerDef {
  group: THREE.Group; body: THREE.Group; L: Mats; muzzle: THREE.Object3D; glow: THREE.Mesh;
  size: { w: number; h: number; l: number }; bob: number;
  lamps: { mat: THREE.MeshBasicMaterial; base: THREE.Color; hot: THREE.Color }[];
  prop: THREE.Object3D; propRate: number; extra?: (t: number, tele: number, hpFrac: number) => void;
}

function finish(d: FlyerDef): EnemyRig {
  let flashT = 0, spin = 0;
  const phase = Math.random() * 10;
  const tmp = new THREE.Color();
  return {
    group: d.group, muzzle: d.muzzle, size: d.size,
    flash() { flashT = 0.14; },
    update(dt, t, s) {
      const tele = clamp(s.telegraph, 0, 1);
      spin += dt * d.propRate * (1 + tele * 0.4);
      d.prop.rotation.z = spin;
      d.body.position.y = Math.sin(t * 2.6 + phase) * d.bob;
      d.body.rotation.z = Math.sin(t * 1.7 + phase) * 0.09;
      d.body.rotation.x = Math.sin(t * 2.1 + phase) * 0.04 + tele * 0.06;
      flashT = Math.max(0, flashT - dt);
      const f = flashT / 0.14;
      const low = Math.max(0, 0.4 - s.hpFrac) / 0.4;
      const lp = low * (0.5 + 0.5 * Math.sin(t * 16)) * 0.25;
      setEmissive(d.L, clamp(f * 0.95 + tele * 0.3 + lp, 0, 1), clamp(f * 0.95 + tele * 0.1 + lp * 0.25, 0, 1), clamp(f * 0.95, 0, 1));
      d.glow.visible = tele > 0.02;
      if (d.glow.visible) {
        d.glow.scale.setScalar(0.12 + tele * 0.45 + Math.sin(t * 40) * 0.04 * tele);
        (d.glow.material as THREE.MeshBasicMaterial).opacity = 0.5 + tele * 0.5;
      }
      for (const l of d.lamps) {
        const blink = tele > 0.02 ? (0.5 + 0.5 * Math.sin(t * (14 + 20 * tele))) * tele : 0;
        l.mat.color.copy(l.base).lerp(tmp.copy(l.hot), clamp(blink + f, 0, 1));
      }
      d.extra?.(t, tele, s.hpFrac);
    },
  };
}

function lamp(p: THREE.Object3D, d: FlyerDef['lamps'], base: string, hot: string, r: number, x: number, y: number, z: number): void {
  const mat = new THREE.MeshBasicMaterial({ color: base });
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), mat);
  m.position.set(x, y, z);
  p.add(m);
  d.push({ mat, base: new THREE.Color(base), hot: new THREE.Color(hot) });
}

/** Spinning propeller: hub + blades in the XY plane, rotated about Z by the caller. */
function propeller(p: THREE.Object3D, L: Mats, len: number, z: number, y: number, blades = 2): THREE.Group {
  const pr = place(p, new THREE.Group(), 0, y, z);
  const bm = toon(PAL.wood, L), tip = toon(PAL.yellow, L);
  for (let i = 0; i < blades; i++) {
    const arm = place(pr, new THREE.Group());
    arm.rotation.z = (i / blades) * Math.PI * 2;
    B(arm, bm, 0.14, len / 2, 0.05, 0, len / 4, 0, 0.01);
    B(arm, tip, 0.15, len * 0.09, 0.06, 0, len * 0.46, 0);
  }
  S(pr, toon(PAL.ink, L), 0.12, 0.12, 0.14, 0, 0, -0.03);
  // translucent blur disc
  const disc = new THREE.Mesh(new THREE.CircleGeometry(len / 2, 18), glowMat('#ffffff', 0.12, false));
  disc.position.z = 0.0;
  pr.add(disc);
  return pr;
}

function buildDrone(): EnemyRig {
  const L: Mats = [];
  const group = new THREE.Group();
  const body = place(group, new THREE.Group(), 0, 0.8, 0);
  const blue = toon(PAL.blue, L), ink = toon(PAL.ink, L), yellow = toon(PAL.yellow, L), red = toon(PAL.red, L), cream = toon(PAL.cream, L), orange = toon(PAL.orange, L), steel = toon(PAL.steel, L);
  const lamps: FlyerDef['lamps'] = [];

  // fuselage: egg body, cowl, tail boom
  S(body, blue, 0.5, 0.42, 0.95, 0, 0, 0.1, 0.04);
  S(body, red, 0.4, 0.34, 0.3, 0, 0, -0.85, 0.03); // cowl
  C(body, blue, 0.08, 0.2, 1.0, 0, 0.02, 1.0, 0.03).rotation.x = Math.PI / 2; // tail boom
  // tail fin + stabiliser
  B(body, yellow, 0.07, 0.55, 0.45, 0, 0.35, 1.38, 0.025);
  B(body, yellow, 1.0, 0.07, 0.38, 0, 0.04, 1.38, 0.025);
  // crow pilot in open cockpit
  B(body, ink, 0.6, 0.12, 0.5, 0, 0.36, 0.0);
  S(body, ink, 0.26, 0.26, 0.27, 0, 0.62, 0.0, 0.03);
  const beak = C(body, orange, 0.0001 + 0.01, 0.1, 0.34, 0, 0.58, -0.3, 0.015, 6);
  beak.rotation.x = -Math.PI / 2;
  for (const sx of [-1, 1]) {
    S(body, cream, 0.1, 0.1, 0.06, sx * 0.1, 0.68, -0.2);
    S(body, ink, 0.04, 0.04, 0.04, sx * 0.1, 0.68, -0.25);
    S(body, yellow, 0.12, 0.12, 0.03, sx * 0.1, 0.68, -0.22).scale.z = 0.02; // goggle rim
  }
  B(body, red, 0.5, 0.06, 0.1, 0, 0.5, -0.1); // scarf band / helmet strap
  // biplane wings with struts
  const wing = (y: number, z: number, c: THREE.Material) => {
    B(body, c, 2.6, 0.08, 0.7, 0, y, z, 0.03);
    for (const sx of [-1, 1]) B(body, red, 0.05, 0.1, 0.72, sx * 1.3, y, z);
  };
  wing(0.5, -0.05, yellow);
  wing(-0.3, -0.05, blue);
  for (const sx of [-1, 1]) for (const dz of [-0.2, 0.15]) B(body, ink, 0.05, 0.86, 0.05, sx * 0.95, 0.1, -0.05 + dz);
  lamp(body, lamps, '#ff3b30', '#ffffff', 0.06, -1.3, -0.3, -0.05);
  lamp(body, lamps, '#2fc65a', '#ffffff', 0.06, 1.3, -0.3, -0.05);
  // landing gear
  for (const sx of [-1, 1]) {
    B(body, steel, 0.05, 0.4, 0.05, sx * 0.3, -0.55, -0.3);
    C(body, ink, 0.17, 0.17, 0.1, sx * 0.3, -0.75, -0.3, 0.02, 10).rotation.z = Math.PI / 2;
  }
  // nose propeller
  const prop = propeller(body, L, 1.5, -1.05, 0, 2);
  // gun under the nose
  const gun = C(body, ink, 0.07, 0.09, 0.8, 0, -0.42, -0.55, 0.02, 8);
  gun.rotation.x = Math.PI / 2;
  B(body, steel, 0.2, 0.14, 0.3, 0, -0.35, -0.3, 0.02);
  const muzzle = place(body, new THREE.Object3D(), 0, -0.42, -1.0);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), glowMat('#ff5a2a', 1));
  glow.visible = false;
  muzzle.add(glow);

  group.traverse((o) => { o.castShadow = true; });
  return finish({ group, body, L, muzzle, glow, size: { w: 2.6, h: 1.6, l: 2.6 }, bob: 0.12, lamps, prop, propRate: 55 });
}

function buildBomber(): EnemyRig {
  const L: Mats = [];
  const group = new THREE.Group();
  const body = place(group, new THREE.Group(), 0, 0.9, 0);
  const red = toon(PAL.red, L), deep = toon('#b3231c', L), ink = toon(PAL.ink, L), yellow = toon(PAL.yellow, L), cream = toon(PAL.cream, L), orange = toon(PAL.orange, L), steel = toon(PAL.steel, L), purple = toon(PAL.purple, L);
  const lamps: FlyerDef['lamps'] = [];

  // chunky crop-duster fuselage
  S(body, red, 0.8, 0.7, 1.5, 0, 0, 0.1, 0.05);
  S(body, deep, 0.62, 0.55, 0.55, 0, -0.05, -1.3, 0.04); // cowl
  C(body, red, 0.14, 0.4, 1.3, 0, 0.05, 1.55, 0.04).rotation.x = Math.PI / 2;
  // bandit stripe
  B(body, ink, 1.62, 0.18, 0.4, 0, 0.12, 0.15, 0.0);
  // cockpit bubble + bandit pilot with mask and hat
  S(body, cream, 0.38, 0.3, 0.5, 0, 0.62, 0.25, 0.03).scale.y = 0.8;
  S(body, ink, 0.2, 0.2, 0.2, 0, 0.7, 0.22, 0.02);
  B(body, ink, 0.55, 0.05, 0.55, 0, 0.9, 0.22);
  C(body, purple, 0.16, 0.2, 0.2, 0, 1.0, 0.22, 0.02, 8);
  for (const sx of [-1, 1]) S(body, yellow, 0.05, 0.05, 0.03, sx * 0.08, 0.74, 0.01);
  // main monoplane wing (4 m span) with tips + spray nozzles
  B(body, yellow, 4.0, 0.12, 1.1, 0, 0.5, -0.15, 0.04);
  B(body, orange, 4.0, 0.125, 0.18, 0, 0.5, -0.55);
  for (const sx of [-1, 1]) {
    B(body, red, 0.12, 0.14, 1.12, sx * 1.98, 0.5, -0.15);
    B(body, ink, 0.05, 0.5, 0.05, sx * 0.9, 0.2, -0.2);
    B(body, steel, 0.08, 0.08, 0.7, sx * 1.4, 0.38, -0.15);
    lamp(body, lamps, sx < 0 ? '#ff3b30' : '#2fc65a', '#ffffff', 0.07, sx * 1.98, 0.5, -0.78);
  }
  // tail: fin + stabiliser, with animated flaps (rudder / elevators)
  B(body, red, 0.1, 0.8, 0.6, 0, 0.55, 2.0, 0.03);
  B(body, yellow, 1.7, 0.1, 0.55, 0, 0.12, 2.0, 0.03);
  const rudder = place(body, new THREE.Group(), 0, 0.5, 2.3);
  B(rudder, orange, 0.08, 0.7, 0.3, 0, 0.05, 0.14, 0.02);
  const elev: THREE.Group[] = [];
  for (const sx of [-1, 1]) {
    const e = place(body, new THREE.Group(), sx * 0.85, 0.12, 2.28);
    B(e, orange, 0.8, 0.07, 0.28, sx * -0.4 + sx * 0.4, 0, 0.14);
    elev.push(e);
  }
  // landing gear
  for (const sx of [-1, 1]) {
    B(body, steel, 0.07, 0.6, 0.07, sx * 0.55, -0.6, -0.3);
    C(body, ink, 0.26, 0.26, 0.16, sx * 0.55, -0.9, -0.3, 0.03, 12).rotation.z = Math.PI / 2;
  }
  // nose propeller
  const prop = propeller(body, L, 2.1, -1.65, -0.05, 3);
  // bomb rack under belly with hanging bombs
  B(body, steel, 0.9, 0.08, 1.2, 0, -0.62, 0.3, 0.02);
  for (const sx of [-1, 1]) B(body, ink, 0.05, 0.14, 0.05, sx * 0.3, -0.55, 0.3);
  const muzzle = place(body, new THREE.Object3D(), 0, -0.85, 0.3);
  const bombs: THREE.Group[] = [];
  for (const dz of [-0.35, 0, 0.35]) {
    const b = makeBomb();
    b.scale.setScalar(0.55);
    b.position.set(0, -0.85, 0.3 + dz);
    b.rotation.y = Math.PI / 2;
    body.add(b);
    bombs.push(b);
  }
  const glow = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), glowMat('#ff5a2a', 1));
  glow.visible = false;
  glow.position.y = -0.1;
  muzzle.add(glow);
  
  group.traverse((o) => { o.castShadow = true; });
  const extra = (t: number, tele: number): void => {
    rudder.rotation.y = Math.sin(t * 1.6) * 0.4;
    for (let i = 0; i < elev.length; i++) elev[i].rotation.x = Math.sin(t * 2.2 + i) * 0.28 + tele * 0.3;
    for (const b of bombs) updateBomb(b, t);
  };
  return finish({ group, body, L, muzzle, glow, size: { w: 4, h: 2.2, l: 4 }, bob: 0.16, lamps, prop, propRate: 42, extra });
}

export function makeFlyer(kind: 'drone' | 'bomber'): EnemyRig {
  return kind === 'drone' ? buildDrone() : buildBomber();
}

// ───────────── bomb ─────────────
let sparkGeo: THREE.SphereGeometry | null = null;

/** Cartoon black bomb (~0.8 m) with a fuse and a flickering spark. Origin at centre. */
export function makeBomb(): THREE.Group {
  const g = new THREE.Group();
  const ink = toon('#16162e'), steel = toon(PAL.steel), yellow = toon(PAL.yellow);
  S(g, ink, 0.4, 0.4, 0.4, 0, 0, 0, 0.03);
  S(g, toon('#ffffff'), 0.09, 0.07, 0.05, -0.15, 0.18, -0.3).rotation.y = 0.3; // shine
  C(g, steel, 0.13, 0.16, 0.14, 0, 0.4, 0, 0.02, 8);
  C(g, yellow, 0.41, 0.41, 0.07, 0, -0.05, 0, 0, 14);
  const fuse = C(g, toon(PAL.wood), 0.025, 0.025, 0.28, 0.06, 0.58, 0, 0, 5);
  fuse.rotation.z = -0.5;
  if (!sparkGeo) sparkGeo = new THREE.SphereGeometry(1, 8, 6);
  const spark = new THREE.Mesh(sparkGeo, glowMat('#ffd21f', 1));
  spark.scale.setScalar(0.1);
  spark.position.set(0.14, 0.7, 0);
  g.add(spark);
  const halo = new THREE.Mesh(sparkGeo, glowMat('#ff8a00', 0.6));
  halo.scale.setScalar(0.18);
  halo.position.copy(spark.position);
  g.add(halo);
  g.userData.update = (t: number): void => {
    const f = 0.7 + 0.5 * Math.sin(t * 38) * Math.sin(t * 23);
    spark.scale.setScalar(0.09 * f + 0.03);
    halo.scale.setScalar(0.17 * f + 0.05);
  };
  return g;
}

/** Flicker the fuse spark. Call each frame for falling bombs. */
export function updateBomb(g: THREE.Object3D, t: number): void {
  const u = g.userData.update as ((t: number) => void) | undefined;
  if (u) u(t);
}
