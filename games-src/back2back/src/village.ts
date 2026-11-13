// Bandit village set pieces (boss fight scenery + targets). All pieces face -Z with their base at y=0.
import * as THREE from 'three';
import type { EnemyRig } from './models';
import { B, C, ICO, PAL, S, clamp, glowMat, makeWheel, place, rng, setEmissive, toon } from './models-util';
import type { Mats } from './models-util';

export type VillageKind = 'vTower' | 'vHut' | 'vGate' | 'vChief';
type UpdateState = { hpFrac: number; speed: number; telegraph: number };

// ---------- shared bits ----------
function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function skullTex(bg: string): THREE.CanvasTexture {
  return canvasTex(128, 128, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, 128, 128);
    g.strokeStyle = PAL.ink; g.lineWidth = 6; g.strokeRect(3, 3, 122, 122);
    g.fillStyle = PAL.cream; g.strokeStyle = PAL.ink; g.lineWidth = 5;
    g.beginPath(); g.arc(64, 54, 30, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillRect(48, 76, 32, 22); g.strokeRect(48, 76, 32, 22);
    g.fillStyle = PAL.ink;
    g.beginPath(); g.arc(52, 54, 8, 0, Math.PI * 2); g.arc(76, 54, 8, 0, Math.PI * 2); g.fill();
    g.fillRect(60, 66, 8, 8);
    for (let i = 0; i < 3; i++) g.fillRect(55 + i * 9, 84, 3, 12);
    g.lineWidth = 7; g.beginPath(); g.moveTo(22, 108); g.lineTo(106, 112); g.moveTo(22, 112); g.lineTo(106, 108); g.stroke();
  });
}

function flatPlane(w: number, h: number, tex: THREE.Texture, parent: THREE.Object3D, x: number, y: number, z: number, ry = 0): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
  m.rotation.y = ry;
  return place(parent, m, x, y, z);
}

/** Rising grey puffs; call tick() each frame with an intensity 0..1 (0 hides them). */
function smokeStack(parent: THREE.Object3D, x: number, y: number, z: number, n: number, color = '#8a8a9c') {
  const puffs: THREE.Mesh[] = [];
  const g = new THREE.Group();
  place(parent, g, x, y, z);
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), glowMat(color, 0.6, false));
    g.add(m); puffs.push(m);
  }
  return {
    tick(t: number, k: number, rise = 2.4) {
      g.visible = k > 0.02;
      if (!g.visible) return;
      for (let i = 0; i < n; i++) {
        const u = (t * 0.55 + i / n) % 1;
        puffs[i].position.set(Math.sin(u * 5 + i) * 0.25 * u * 2, u * rise, Math.cos(u * 4 + i * 2) * 0.2 * u);
        puffs[i].scale.setScalar((0.18 + u * 0.5) * (0.5 + k * 0.5));
        (puffs[i].material as THREE.MeshBasicMaterial).opacity = (1 - u) * 0.6 * k;
      }
    },
  };
}

/** Bandit sheep: fluffy cream body, dark mask, hat. Faces -Z. */
function banditSheep(parent: THREE.Object3D, L: Mats, x: number, y: number, z: number, s = 1): THREE.Group {
  const g = new THREE.Group();
  place(parent, g, x, y, z);
  g.scale.setScalar(s);
  const wool = toon(PAL.cream, L), ink = toon(PAL.ink, L), skin = toon('#e9c7a0', L), hat = toon(PAL.purple, L);
  S(g, wool, 0.5, 0.45, 0.5, 0, 0.5, 0, 0.03);
  S(g, wool, 0.3, 0.3, 0.3, -0.3, 0.7, 0.1); S(g, wool, 0.3, 0.3, 0.3, 0.3, 0.7, 0.1);
  S(g, skin, 0.28, 0.3, 0.3, 0, 1.0, -0.2, 0.025);
  B(g, ink, 0.52, 0.12, 0.06, 0, 1.04, -0.46);          // bandit mask
  B(g, toon(PAL.white, L), 0.07, 0.07, 0.04, -0.1, 1.05, -0.5); B(g, toon(PAL.white, L), 0.07, 0.07, 0.04, 0.1, 1.05, -0.5);
  S(g, skin, 0.1, 0.06, 0.16, -0.32, 1.02, -0.18); S(g, skin, 0.1, 0.06, 0.16, 0.32, 1.02, -0.18); // ears
  C(g, hat, 0.12, 0.3, 0.3, 0, 1.38, -0.2, 0.02, 8);
  C(g, hat, 0.4, 0.4, 0.05, 0, 1.24, -0.2, 0.02, 10);
  return g;
}

interface Base {
  group: THREE.Group; body: THREE.Group; L: Mats; muzzle: THREE.Object3D; glow: THREE.Mesh;
  size: { w: number; h: number; l: number };
  anim: (dt: number, t: number, s: UpdateState, tele: number, low: number) => void;
}

function finish(d: Base, flashEmissive = 0.9): EnemyRig {
  let flashT = 0;
  const phase = Math.random() * 10;
  return {
    group: d.group, muzzle: d.muzzle, size: d.size,
    flash() { flashT = 0.14; },
    update(dt, t, s) {
      const tele = clamp(s.telegraph, 0, 1);
      flashT = Math.max(0, flashT - dt);
      const f = flashT / 0.14;
      const low = clamp((0.5 - s.hpFrac) / 0.5, 0, 1);
      const pulse = low * (0.5 + 0.5 * Math.sin(t * 14 + phase)) * 0.22;
      setEmissive(d.L, clamp(f * flashEmissive + tele * 0.3 + pulse, 0, 1), clamp(f * flashEmissive + tele * 0.1 + pulse * 0.2, 0, 1), clamp(f * flashEmissive, 0, 1));
      d.glow.visible = tele > 0.02;
      if (d.glow.visible) {
        d.glow.scale.setScalar(0.2 + tele * 0.5 + Math.sin(t * 40) * 0.05 * tele);
        (d.glow.material as THREE.MeshBasicMaterial).opacity = 0.5 + tele * 0.5;
      }
      d.anim(dt, t, s, tele, low);
    },
  };
}

function muzzleGlow(parent: THREE.Object3D, x: number, y: number, z: number, color: string): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), glowMat(color, 1));
  m.visible = false;
  return place(parent, m, x, y, z);
}

function waveFlag(parent: THREE.Object3D, L: Mats, x: number, y: number, z: number, color: string, w = 1.1, h = 0.65): THREE.Group {
  const pivot = new THREE.Group();
  place(parent, pivot, x, y, z);
  const cloth = B(pivot, toon(color, L), w, h, 0.04, w / 2, 0, 0);
  B(cloth, toon(PAL.ink, L), 0.2, 0.2, 1.6, -0.25, 0, 0); // little skull blob
  return pivot;
}

// ---------- vTower ----------
function buildTower(): EnemyRig {
  const L: Mats = [];
  const group = new THREE.Group();
  const body = place(group, new THREE.Group());
  const wood = toon(PAL.wood, L), dkWood = toon('#8a5428', L), red = toon(PAL.red, L), ink = toon(PAL.ink, L), steel = toon(PAL.steel, L);

  // legs (slightly splayed), cross braces
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = B(body, wood, 0.28, 4.6, 0.28, sx * 1.05, 2.2, sz * 1.05, 0.03);
    leg.rotation.set(-sz * 0.05, 0, sx * 0.05);
  }
  for (const y of [1.2, 2.8]) {
    for (const sz of [-1, 1]) B(body, dkWood, 2.2, 0.16, 0.14, 0, y, sz * 1.04);
    for (const sx of [-1, 1]) B(body, dkWood, 0.14, 0.16, 2.2, sx * 1.04, y, 0);
  }
  const xb1 = B(body, dkWood, 0.12, 3.0, 0.1, 0, 2.0, -1.06); xb1.rotation.z = 0.78;
  const xb2 = B(body, dkWood, 0.12, 3.0, 0.1, 0, 2.0, -1.06); xb2.rotation.z = -0.78;
  // platform + rails
  B(body, wood, 3.0, 0.22, 3.0, 0, 4.5, 0, 0.04);
  const planks: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) planks.push(B(body, dkWood, 2.6, 0.1, 0.42, 0, 4.66, -1.05 + i * 0.52));
  const rails: THREE.Mesh[] = [];
  for (const y of [5.0, 5.5]) {
    rails.push(B(body, wood, 3.0, 0.1, 0.1, 0, y, -1.45));
    rails.push(B(body, wood, 3.0, 0.1, 0.1, 0, y, 1.45));
    rails.push(B(body, wood, 0.1, 0.1, 3.0, -1.45, y, 0));
    rails.push(B(body, wood, 0.1, 0.1, 3.0, 1.45, y, 0));
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(body, wood, 0.2, 2.6, 0.2, sx * 1.4, 5.7, sz * 1.4, 0.03);
  // roof
  const roof = C(body, red, 0.08, 2.6, 1.3, 0, 7.0 - 0.15, 0, 0.04, 4);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 6.35;
  // sniper + gun
  banditSheep(body, L, 0, 4.6, 0.3, 1.05);
  const gun = new THREE.Group();
  place(body, gun, 0.45, 5.45, -0.5);
  B(gun, ink, 0.22, 0.26, 1.0, 0, 0, -0.1, 0.02);
  const barrel = C(gun, steel, 0.09, 0.1, 1.9, 0, 0, -1.4, 0.02, 10);
  barrel.rotation.x = Math.PI / 2;
  const scopeLens = B(gun, toon(PAL.cyan, L), 0.1, 0.1, 0.1, 0, 0.2, -0.2);
  const muzzle = place(gun, new THREE.Object3D(), 0, 0, -2.4);
  const glow = muzzleGlow(gun, 0, 0, -2.45, PAL.red);
  const barrelHot = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.125, 0.5, 10), glowMat(PAL.orange, 0, true));
  barrelHot.rotation.x = Math.PI / 2;
  place(gun, barrelHot, 0, 0, -1.9);
  // flag
  C(body, wood, 0.05, 0.06, 1.4, 1.3, 7.3, 1.3, 0.02, 6);
  const flag = waveFlag(body, L, 1.3, 7.55, 1.3, PAL.purple);
  // damaged look
  const scorch = [B(body, toon('#1b1b2a', L), 1.1, 0.5, 0.06, -0.5, 3.4, -1.22), B(body, toon('#1b1b2a', L), 0.7, 1.0, 0.06, 0.7, 5.2, -1.0)];
  const smoke = smokeStack(body, 0.9, 5.2, 0.4, 6, '#55556a');
  const fire = smokeStack(body, -0.9, 4.8, 1.0, 4, '#ff8a00');

  return finish({
    group, body, L, muzzle, glow, size: { w: 3, h: 7, l: 3 },
    anim(_dt, t, s, tele, low) {
      const wob = 0.012 + low * 0.05;
      body.rotation.z = Math.sin(t * 2.2) * wob + low * 0.03;
      body.rotation.x = Math.sin(t * 1.7 + 1) * wob * 0.7;
      gun.rotation.y = Math.sin(t * 0.9) * 0.08 * (1 - tele);
      gun.position.z = -0.5 + tele * 0.12;
      (barrelHot.material as THREE.MeshBasicMaterial).opacity = tele * (0.6 + 0.4 * Math.sin(t * 30));
      scopeLens.rotation.y = t * 3;
      flag.rotation.y = Math.sin(t * 6) * 0.35;
      flag.rotation.z = Math.sin(t * 4.3) * 0.1;
      scorch[0].visible = s.hpFrac < 0.75; scorch[1].visible = s.hpFrac < 0.45;
      planks[1].visible = s.hpFrac > 0.6; planks[3].visible = s.hpFrac > 0.35;
      rails[1].visible = s.hpFrac > 0.8; rails[6].visible = s.hpFrac > 0.5;
      smoke.tick(t, s.hpFrac < 0.7 ? 0.4 + low * 0.6 : 0, 2.6);
      fire.tick(t, s.hpFrac < 0.3 ? 1 : 0, 1.6);
    },
  });
}

// ---------- vHut ----------
function buildHut(): EnemyRig {
  const L: Mats = [];
  const group = new THREE.Group();
  const body = place(group, new THREE.Group());
  const wood = toon(PAL.wood, L), dkWood = toon('#8a5428', L), roofM = toon('#7a3b2e', L), ink = toon(PAL.ink, L), stone = toon(PAL.steel, L);

  B(body, toon('#6b6b86', L), 5.2, 0.35, 5.2, 0, 0.17, 0, 0.04);       // stone footing
  B(body, wood, 4.6, 2.4, 4.6, 0, 1.55, 0, 0.05);
  for (let i = -2; i <= 2; i++) B(body, dkWood, 0.1, 2.4, 0.06, i * 0.9, 1.55, -2.32);   // front planks
  B(body, dkWood, 4.7, 0.18, 4.7, 0, 2.78, 0);
  // roof: two slanted slabs
  for (const s of [-1, 1]) {
    const slab = B(body, roofM, 2.9, 0.22, 5.4, s * 1.2, 3.45, 0, 0.05);
    slab.rotation.z = s * -0.62;
  }
  B(body, ink, 0.3, 0.3, 5.5, 0, 4.0, 0);
  // door (hinged on left edge) + dark interior
  B(body, ink, 1.5, 1.8, 0.1, 0.0, 1.25, -2.28);
  const door = new THREE.Group();
  place(body, door, -0.75, 1.25, -2.4);
  B(door, dkWood, 1.5, 1.8, 0.12, 0.75, 0, 0, 0.03);
  B(door, toon(PAL.yellow, L), 0.12, 0.12, 0.08, 1.3, 0, -0.08);
  const raiderEyes = [B(body, glowMat(PAL.red, 0, false) as unknown as THREE.Material, 0.1, 0.1, 0.05, -0.25, 1.5, -2.22), B(body, glowMat(PAL.red, 0, false) as unknown as THREE.Material, 0.1, 0.1, 0.05, 0.25, 1.5, -2.22)];
  // windows
  for (const sx of [-1, 1]) {
    B(body, ink, 0.1, 0.7, 0.7, sx * 2.32, 1.9, 0);
    B(body, dkWood, 0.14, 0.12, 0.9, sx * 2.34, 1.9, 0);
  }
  // chimney + smoke
  B(body, stone, 0.7, 1.6, 0.7, 1.4, 4.1, 1.2, 0.04);
  B(body, ink, 0.8, 0.12, 0.8, 1.4, 4.95, 1.2);
  const smoke = smokeStack(body, 1.4, 5.05, 1.2, 6);
  // skull banner on a pole at the corner
  C(body, wood, 0.06, 0.07, 3.2, -2.4, 3.0, -2.4, 0.02, 6);
  const bannerPivot = new THREE.Group();
  place(body, bannerPivot, -2.4, 4.4, -2.4);
  flatPlane(0.9, 1.3, skullTex(PAL.purple), bannerPivot, 0.0, -0.65, 0);
  B(bannerPivot, ink, 1.0, 0.07, 0.07, 0, 0.02, 0);
  // barrels
  C(body, wood, 0.4, 0.42, 0.9, 2.9, 0.45, -1.8, 0.03, 10); C(body, wood, 0.4, 0.42, 0.9, 3.4, 0.45, -0.9, 0.03, 10);
  C(body, ink, 0.41, 0.43, 0.08, 2.9, 0.6, -1.8, 0, 10);
  // muzzle: above door, glows when raiders about to pour out
  const muzzle = place(body, new THREE.Object3D(), 0, 1.4, -2.6);
  const glow = muzzleGlow(body, 0, 2.2, -2.6, PAL.orange);
  const scorch = [B(body, toon('#1b1b2a', L), 1.2, 0.8, 0.06, 1.4, 2.0, -2.33), B(body, toon('#1b1b2a', L), 0.06, 0.9, 1.4, -2.33, 2.5, 1.0)];
  let open = 0;

  return finish({
    group, body, L, muzzle, glow, size: { w: 5, h: 4, l: 5 },
    anim(dt, t, s, tele, low) {
      const target = tele > 0.55 ? 1 : 0;
      open += (target - open) * clamp(dt * 10, 0, 1);
      door.rotation.y = -open * 1.7 + (tele > 0.3 ? Math.sin(t * 30) * 0.03 : 0);
      for (const e of raiderEyes) (e.material as THREE.MeshBasicMaterial).opacity = open > 0.4 ? 1 : 0;
      body.rotation.z = Math.sin(t * 9) * 0.006 * (0.4 + tele) + low * Math.sin(t * 20) * 0.01;
      bannerPivot.rotation.z = Math.sin(t * 4) * 0.1; bannerPivot.rotation.x = Math.sin(t * 3.1) * 0.08;
      scorch[0].visible = s.hpFrac < 0.7; scorch[1].visible = s.hpFrac < 0.4;
      smoke.tick(t, 0.5 + tele * 0.5 + low * 0.5, 2.8 + tele);
    },
  });
}

// ---------- vGate ----------
function buildGate(): EnemyRig {
  const L: Mats = [];
  const group = new THREE.Group();
  const body = place(group, new THREE.Group());
  const wood = toon(PAL.wood, L), dkWood = toon('#8a5428', L), ink = toon(PAL.ink, L), red = toon(PAL.red, L), yellow = toon(PAL.yellow, L);

  // end towers
  for (const sx of [-1, 1]) {
    B(body, wood, 1.6, 4.2, 1.6, sx * 6.2, 2.1, 0, 0.05);
    B(body, dkWood, 1.9, 0.25, 1.9, sx * 6.2, 4.2, 0);
    C(body, red, 0.05, 1.2, 1.0, sx * 6.2, 4.7, 0, 0.04, 4).rotation.y = Math.PI / 4;
  }
  // palisade logs with spiked tips
  const logs: THREE.Mesh[] = [];
  const logH: number[] = [];
  const spikes: THREE.Mesh[] = [];
  const n = 13;
  const rnd = rng(7);
  for (let i = 0; i < n; i++) {
    const x = -5.3 + (i / (n - 1)) * 10.6;
    const h = 2.7 + rnd() * 0.9;
    const log = C(body, i % 2 ? wood : dkWood, 0.34, 0.38, h, x, h / 2, 0, 0.035, 8);
    const spike = C(body, toon(PAL.steel, L), 0.0001 + 0.02, 0.34, 0.8, x, h + 0.35, 0, 0.03, 8);
    logs.push(log); spikes.push(spike); logH.push(h);
  }
  // cross beams (planks that vanish with damage)
  const planks: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const y = 0.7 + (i % 3) * 0.8;
    const side = i < 3 ? 1 : -1;
    planks.push(B(body, dkWood, 5.3, 0.3, 0.14, side * -2.75, y, -0.4 * 1));
  }
  // forward spiked logs (hedgehogs) angled outwards
  for (const sx of [-4.2, -1.4, 1.4, 4.2]) {
    const sp = C(body, toon(PAL.steel, L), 0.02, 0.2, 1.8, sx, 0.8, -0.95, 0.03, 6);
    sp.rotation.x = -Math.PI / 2 + 0.5;
    sp.position.z = -1.0;
  }
  // skull sign
  B(body, wood, 3.4, 1.4, 0.18, 0, 4.1, -0.2, 0.05);
  flatPlane(1.15, 1.15, skullTex(PAL.red), body, -0.95, 4.1, -0.32);
  const signTex = canvasTex(256, 96, (g) => {
    g.fillStyle = PAL.yellow; g.fillRect(0, 0, 256, 96);
    g.fillStyle = PAL.ink; g.font = 'bold 44px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('KEEP OUT', 128, 36); g.font = 'bold 30px sans-serif'; g.fillText('BAA-NDITS', 128, 72);
  });
  flatPlane(2.0, 0.75, signTex, body, 0.55, 4.1, -0.32);
  for (const sx of [-1, 1]) C(body, ink, 0.04, 0.04, 0.9, sx * 1.4, 4.9, -0.2, 0, 4);
  // lanterns
  const lamps: THREE.Mesh[] = [];
  for (const sx of [-1, 1]) {
    C(body, ink, 0.03, 0.03, 0.6, sx * 6.2, 4.0, -1.0, 0, 4);
    B(body, ink, 0.4, 0.5, 0.4, sx * 6.2, 3.45, -1.0);
    lamps.push(ICO(body, new THREE.MeshBasicMaterial({ color: PAL.yellow }), 0.2, sx * 6.2, 3.45, -1.0));
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), glowMat(PAL.orange, 0.25));
    place(body, halo, sx * 6.2, 3.45, -1.0);
    lamps.push(halo);
  }
  const muzzle = place(body, new THREE.Object3D(), 0, 3.2, -1.1);
  const glow = muzzleGlow(body, 0, 3.2, -1.1, PAL.red);
  B(body, yellow, 1.0, 0.1, 0.1, 0, 0.12, -1.0);
  let broken = -1;

  return finish({
    group, body, L, muzzle, glow, size: { w: 14, h: 4, l: 2 },
    anim(_dt, t, s, tele, low) {
      const gone = Math.floor((1 - clamp(s.hpFrac, 0, 1)) * 6.99);
      if (gone !== broken) {
        broken = gone;
        for (let i = 0; i < planks.length; i++) planks[i].visible = i >= gone;
        for (let i = 0; i < n; i++) {
          const dead = (i * 5) % n < gone * 1.6;     // scatter missing logs
          logs[i].scale.y = dead ? 0.35 : logH[i];
          logs[i].position.y = logs[i].scale.y / 2;
          spikes[i].visible = !dead;
        }
      }
      for (let i = 0; i < lamps.length; i++) {
        const flick = 0.85 + 0.15 * Math.sin(t * 11 + i * 2.3) + tele * 0.4;
        lamps[i].scale.setScalar(flick * (i % 2 ? 1.0 : 1.0));
      }
      body.rotation.z = low * Math.sin(t * 17) * 0.004;
    },
  });
}

// ---------- vChief ----------
function buildChief(): EnemyRig {
  const L: Mats = [];
  const group = new THREE.Group();
  const body = place(group, new THREE.Group());
  const wood = toon(PAL.wood, L), dkWood = toon('#8a5428', L), ink = toon(PAL.ink, L), red = toon(PAL.red, L), steel = toon(PAL.steel, L), dark = toon(PAL.dark, L), purple = toon(PAL.purple, L), yellow = toon(PAL.yellow, L);
  const wheels: ReturnType<typeof makeWheel>[] = [];

  // wagon bed
  B(body, ink, 5.2, 0.4, 6.6, 0, 1.15, 0.2);
  B(body, wood, 5.6, 0.55, 6.4, 0, 1.5, 0.2, 0.05);
  B(body, dkWood, 5.7, 0.14, 6.5, 0, 1.82, 0.2);
  // side armour plates
  for (const sx of [-1, 1]) {
    B(body, steel, 0.18, 1.1, 5.6, sx * 2.8, 2.5, 0.3, 0.04);
    for (let i = 0; i < 4; i++) {
      const sp = C(body, steel, 0.02, 0.2, 0.7, sx * 3.05, 2.9, -1.8 + i * 1.5, 0.02, 6);
      sp.rotation.z = -sx * Math.PI / 2;
    }
  }
  B(body, steel, 5.6, 1.1, 0.18, 0, 2.5, 3.4, 0.04);
  // front prow (ram plate)
  B(body, steel, 5.0, 1.6, 0.4, 0, 2.3, -2.95, 0.05);
  B(body, red, 5.0, 0.2, 0.42, 0, 3.15, -2.95);
  const prowSkull = flatPlane(1.2, 1.2, skullTex(PAL.red), body, 0, 2.3, -3.17);
  void prowSkull;
  // wheels
  for (const [sx, z] of [[-1, -2.0], [1, -2.0], [-1, 2.2], [1, 2.2]] as const) {
    const w = makeWheel(0.9, 0.7, L, PAL.yellow);
    place(body, w.root, sx * 3.05, 0.9, z);
    wheels.push(w);
  }
  // chief: big armoured goat/ram
  const chief = new THREE.Group();
  place(body, chief, 0, 1.9, 0.9);
  const fur = toon('#e8d8b8', L), horn = toon('#f2e6c8', L), skin = toon('#cfa27a', L);
  S(chief, fur, 1.5, 1.2, 1.4, 0, 1.2, 0.4, 0.05);
  S(chief, fur, 0.95, 0.9, 0.95, 0, 2.5, -0.1, 0.04);              // head
  S(chief, skin, 0.5, 0.4, 0.55, 0, 2.3, -0.9, 0.03);               // snout
  B(chief, ink, 1.5, 0.28, 0.08, 0, 2.7, -0.98);                     // mask
  const eyeM = new THREE.MeshBasicMaterial({ color: PAL.yellow });
  const eyes = [ICO(chief, eyeM, 0.1, -0.3, 2.72, -1.03), ICO(chief, eyeM, 0.1, 0.3, 2.72, -1.03)];
  // spiral horns (torus arcs)
  const hornGeo = new THREE.TorusGeometry(0.6, 0.17, 6, 12, Math.PI * 1.4);
  for (const sx of [-1, 1]) {
    const h = new THREE.Mesh(hornGeo, horn);
    h.castShadow = true;
    h.position.set(sx * 0.7, 2.75, -0.1);
    h.rotation.set(0, sx > 0 ? 0 : Math.PI, sx > 0 ? 0.3 : -0.3);
    h.scale.x = 1;
    chief.add(h);
  }
  // helmet + crest
  C(chief, steel, 0.8, 0.95, 0.5, 0, 3.2, -0.1, 0.04, 10);
  B(chief, red, 0.2, 0.55, 1.2, 0, 3.7, -0.1);
  // arms (to drum / cannon)
  const armL = B(chief, fur, 0.4, 1.0, 0.4, -1.3, 1.5, -0.3, 0.03);
  const armR = B(chief, fur, 0.4, 1.0, 0.4, 1.3, 1.5, -0.3, 0.03);
  armL.rotation.z = 0.4; armR.rotation.z = -0.4;
  // cannon
  const cannon = new THREE.Group();
  place(body, cannon, 0, 3.3, -1.7);
  const barrel = C(cannon, dark, 0.38, 0.5, 3.4, 0, 0, -0.9, 0.05, 12);
  barrel.rotation.x = Math.PI / 2;
  const ring = C(cannon, steel, 0.55, 0.55, 0.3, 0, 0, -2.0, 0.03, 12);
  ring.rotation.x = Math.PI / 2;
  S(cannon, dark, 0.65, 0.65, 0.65, 0, 0, 0.75, 0.04);
  const muzzle = place(cannon, new THREE.Object3D(), 0, 0, -2.7);
  const glow = muzzleGlow(cannon, 0, 0, -2.75, PAL.orange);
  const bore = new THREE.Mesh(new THREE.CircleGeometry(0.34, 12), glowMat(PAL.red, 0, true));
  bore.rotation.y = Math.PI;
  place(cannon, bore, 0, 0, -2.62);
  // drum + sticks
  const drum = C(body, purple, 0.7, 0.7, 0.8, -1.9, 2.3, 2.3, 0.04, 12);
  C(body, yellow, 0.72, 0.72, 0.1, -1.9, 2.72, 2.3, 0, 12);
  const stickA = B(body, ink, 0.08, 0.08, 0.9, -1.7, 3.2, 2.1);
  const stickB = B(body, ink, 0.08, 0.08, 0.9, -2.1, 3.2, 2.4);
  // banner
  C(body, wood, 0.07, 0.09, 4.6, 2.4, 4.0, 3.1, 0.02, 6);
  const banner = new THREE.Group();
  place(body, banner, 2.4, 6.0, 3.1);
  B(banner, ink, 0.08, 0.08, 2.2, 0, 0.3, 1.1);
  flatPlane(1.9, 1.7, skullTex(PAL.purple), banner, 0, -0.6, 1.1, Math.PI / 2);
  // rage red glow
  const rageMat = glowMat(PAL.red, 0, true);
  const rageAura = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), rageMat);
  rageAura.scale.set(3.4, 2.8, 3.4);
  place(chief, rageAura, 0, 1.6, 0.2);
  const smoke = smokeStack(body, -2.4, 3.2, 0.5, 5, '#4a4a60');
  let spinA = 0, animT = 0;

  return finish({
    group, body, L, muzzle, glow, size: { w: 6, h: 5, l: 7 },
    anim(dt, t, s, tele, low) {
      const rage = clamp((0.7 - s.hpFrac) / 0.6, 0, 1);
      const k = 1 + rage * 1.2;
      animT += dt * k;
      spinA += (s.speed * dt) / 0.9;
      for (const w of wheels) w.spin.rotation.x = -spinA;
      const sp = clamp(s.speed / 30, 0.2, 1.3);
      body.position.y = Math.abs(Math.sin(animT * 12)) * 0.06 * sp;
      body.rotation.z = Math.sin(animT * 3) * 0.015 + Math.sin(animT * 9) * 0.007 * sp;
      body.rotation.x = tele * 0.025 + Math.sin(animT * 5) * 0.008;
      chief.position.y = 1.9 + Math.abs(Math.sin(animT * 7)) * 0.08 * (1 + rage);
      chief.rotation.z = Math.sin(animT * 4) * 0.04 * k;
      const beat = Math.max(0, Math.sin(animT * 9));
      stickA.rotation.x = -beat * 0.6; stickB.rotation.x = -(1 - beat) * 0.4;
      drum.scale.y = 1 - beat * 0.06;
      armL.rotation.x = -beat * 0.5;
      cannon.rotation.x = -tele * 0.05 + Math.sin(animT * 2) * 0.02;
      cannon.position.z = -1.7 + tele * 0.2;
      (bore.material as THREE.MeshBasicMaterial).opacity = tele;
      banner.rotation.y = Math.sin(t * 5 * k) * 0.25;
      rageMat.opacity = rage * (0.14 + 0.1 * Math.sin(t * 12)) + tele * 0.08;
      for (const e of eyes) e.material = rage > 0.3 || tele > 0.3 ? (e.userData.red ??= new THREE.MeshBasicMaterial({ color: PAL.red })) : eyeM;
      smoke.tick(t, s.hpFrac < 0.5 ? 0.4 + low * 0.6 : 0, 2.4);
    },
  });
}

export function makeVillagePiece(kind: VillageKind): EnemyRig {
  switch (kind) {
    case 'vTower': return buildTower();
    case 'vHut': return buildHut();
    case 'vGate': return buildGate();
    case 'vChief': return buildChief();
  }
}

// ---------- decor ----------
/** Decorative strip: z in [-60,0], |x| in [11,24] kept off the road, plus a stone arch at z=-2 spanning the road
 *  (pillars at |x|=11.6). Not rotated: sign faces +Z so a player driving toward -Z reads it. */
export function makeVillageDecor(): THREE.Group {
  const g = new THREE.Group();
  const rnd = rng(42);
  const wood = toon(PAL.wood), dk = toon('#8a5428'), stone = toon('#8d8da8'), stoneDk = toon('#6b6b86'), ink = toon(PAL.ink), roofM = toon('#7a3b2e');

  // --- stone arch ---
  const az = -2;
  for (const sx of [-1, 1]) {
    B(g, stone, 2.4, 8.5, 2.4, sx * 12.8, 4.25, az, 0.06);
    B(g, stoneDk, 2.9, 0.6, 2.9, sx * 12.8, 0.3, az);
    B(g, stoneDk, 2.9, 0.5, 2.9, sx * 12.8, 8.6, az);
    C(g, toon(PAL.red), 0.05, 1.4, 1.4, sx * 12.8, 9.5, az, 0.04, 4).rotation.y = Math.PI / 4;
  }
  B(g, stone, 28, 1.8, 2.2, 0, 8.6, az, 0.06);
  B(g, stoneDk, 28.4, 0.4, 2.5, 0, 9.65, az);
  for (let i = -6; i <= 6; i++) B(g, stoneDk, 1.5, 0.7, 2.2, i * 2.2, 10.1, az);   // battlements
  const signTex = canvasTex(512, 128, (c) => {
    c.fillStyle = '#2b2b4d'; c.fillRect(0, 0, 512, 128);
    c.strokeStyle = PAL.yellow; c.lineWidth = 8; c.strokeRect(6, 6, 500, 116);
    c.fillStyle = PAL.yellow; c.font = 'bold 60px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('BANDIT VILLAGE', 256, 68);
  });
  flatPlane(11, 2.75, signTex, g, 0, 8.6, az + 1.2);
  const skull = skullTex(PAL.purple);
  for (const sx of [-1, 1]) flatPlane(1.7, 1.7, skull, g, sx * 12.8, 5.2, az + 1.25);

  // --- fences (instanced posts + rails) along both sides ---
  const posts: THREE.Matrix4[] = [];
  const rails: THREE.Matrix4[] = [];
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  for (const side of [-1, 1]) {
    const x = side * 14.5;
    for (let z = -58; z <= -6; z += 2.6) {
      p.set(x, 0.8, z); sc.set(0.3, 1.6 + rnd() * 0.3, 0.3);
      posts.push(m.clone().compose(p, q.identity(), sc));
    }
    for (const y of [0.55, 1.2]) {
      p.set(x, y, -32); sc.set(0.12, 0.14, 52);
      rails.push(m.clone().compose(p, q.identity(), sc));
    }
  }
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const mk = (mat: THREE.Material, mats: THREE.Matrix4[]) => {
    const im = new THREE.InstancedMesh(boxGeo, mat, mats.length);
    mats.forEach((mm, i) => im.setMatrixAt(i, mm));
    im.castShadow = true;
    g.add(im);
  };
  mk(wood, posts); mk(dk, rails);

  // --- small huts ---
  const hutColors = ['#b8763e', '#9a6232', '#c98a4e'];
  const spots: [number, number][] = [[-17, -14], [18, -20], [-19, -30], [17, -38], [-17, -48], [19, -54]];
  spots.forEach(([x, z], i) => {
    const h = new THREE.Group();
    place(g, h, x, 0, z);
    h.rotation.y = (x < 0 ? 0.4 : -0.4) + (rnd() - 0.5) * 0.3;
    const w = 3.4 + rnd() * 1.2;
    B(h, toon(hutColors[i % 3]), w, 2.2, w, 0, 1.1, 0, 0.05);
    B(h, ink, 0.9, 1.4, 0.1, 0, 0.7, w / 2);
    for (const s of [-1, 1]) {
      const slab = B(h, roofM, w * 0.65, 0.2, w + 0.8, s * w * 0.22, 2.75, 0, 0.04);
      slab.rotation.z = s * -0.6;
    }
    // little banner
    C(h, wood, 0.04, 0.05, 2.2, w / 2 - 0.2, 3.3, w / 2 - 0.2, 0, 5);
    B(h, i % 2 ? toon(PAL.purple) : toon(PAL.red), 0.9, 0.6, 0.05, w / 2 + 0.25, 4.1, w / 2 - 0.2);
  });

  // --- torches (instanced pole + flame) ---
  const torchPos: [number, number][] = [];
  for (let z = -10; z > -58; z -= 9) for (const s of [-1, 1]) torchPos.push([s * 12.2, z]);
  const poleGeo = new THREE.CylinderGeometry(0.07, 0.1, 2.4, 6);
  const flameGeo = new THREE.IcosahedronGeometry(0.28, 0);
  const poles = new THREE.InstancedMesh(poleGeo, ink, torchPos.length);
  const flames = new THREE.InstancedMesh(flameGeo, new THREE.MeshBasicMaterial({ color: PAL.orange }), torchPos.length);
  const flames2 = new THREE.InstancedMesh(flameGeo, new THREE.MeshBasicMaterial({ color: PAL.yellow }), torchPos.length);
  torchPos.forEach(([x, z], i) => {
    poles.setMatrixAt(i, m.makeTranslation(x, 1.2, z));
    flames.setMatrixAt(i, m.makeTranslation(x, 2.65, z));
    flames2.setMatrixAt(i, m.makeTranslation(x, 2.75, z));
  });
  g.add(poles, flames, flames2);

  // --- banners on tall poles ---
  const bannerTex = skullTex(PAL.red);
  const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex, side: THREE.DoubleSide });
  const bannerGeo = new THREE.PlaneGeometry(1.4, 2.0);
  for (let i = 0; i < 6; i++) {
    const x = (i % 2 ? 1 : -1) * 12.6, z = -8 - i * 9;
    C(g, dk, 0.07, 0.1, 6, x, 3, z, 0.02, 6);
    const b = new THREE.Mesh(bannerGeo, bannerMat);
    place(g, b, x + (x > 0 ? -0.75 : 0.75), 4.9, z);
    b.rotation.y = Math.PI / 2 + (rnd() - 0.5) * 0.3;
  }
  // --- haystacks / crates for flavour ---
  const hay = toon(PAL.yellow);
  for (let i = 0; i < 7; i++) {
    const x = (i % 2 ? 1 : -1) * (16 + rnd() * 6), z = -8 - rnd() * 48;
    S(g, hay, 1.1, 0.9, 1.1, x, 0.5, z, 0.04);
  }
  return g;
}
