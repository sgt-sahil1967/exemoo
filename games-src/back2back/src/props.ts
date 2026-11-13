// Driving-mechanic props built as real world objects: a plank jump ramp and a glowing boost pad.
// Footprints match the sim: ramp 5 m wide x 6 m long, 0.9 m rise (low end +Z); pad 4.4 x 6 m, flat.
import * as THREE from 'three';
import { B, C, PAL, clamp, glowMat, toon } from './models-util';

const RAMP_W = 5, RAMP_L = 6, RAMP_H = 0.9;
const RAMP_A = Math.atan2(RAMP_H, RAMP_L);
const hz = (z: number) => (RAMP_H * (RAMP_L / 2 - z)) / RAMP_L; // ramp surface height at z

let wedgeGeo: THREE.BufferGeometry | null = null;
let signTex: THREE.CanvasTexture | null = null;
let hazardTex: THREE.CanvasTexture | null = null;
let torusGeo: THREE.TorusGeometry | null = null;
let boltGeo: THREE.CylinderGeometry | null = null;

function wedge(): THREE.BufferGeometry {
  if (wedgeGeo) return wedgeGeo;
  const w = RAMP_W / 2, l = RAMP_L / 2;
  const v = [[-w, 0, l], [w, 0, l], [-w, 0, -l], [w, 0, -l], [-w, RAMP_H, -l], [w, RAMP_H, -l]];
  const f = [[0, 1, 5], [0, 5, 4], [2, 4, 5], [2, 5, 3], [0, 4, 2], [1, 3, 5], [0, 2, 3], [0, 3, 1]];
  const pos: number[] = [];
  for (const t of f) for (const i of t) pos.push(...v[i]);
  wedgeGeo = new THREE.BufferGeometry();
  wedgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  wedgeGeo.computeVertexNormals();
  return wedgeGeo;
}

function canvasTex(w: number, h: number, draw: (x: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d') as CanvasRenderingContext2D);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Cylinder between two points (thin rope / beam). */
function rod(p: THREE.Object3D, mat: THREE.Material, a: THREE.Vector3, b: THREE.Vector3, r: number): THREE.Mesh {
  const d = b.clone().sub(a);
  const m = C(p, mat, r, r, d.length(), (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, 0, 6);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}

/** Bunting string with pennants merged into one mesh (vertex colours). */
function bunting(p: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, sag: number, n: number, rope: THREE.Material): void {
  const cols = [PAL.red, PAL.yellow, PAL.blue, PAL.green, PAL.orange].map((c) => new THREE.Color(c));
  const pos: number[] = [], col: number[] = [];
  const pt = (t: number) => a.clone().lerp(b, t).setY(a.y + (b.y - a.y) * t - Math.sin(Math.PI * t) * sag);
  let prev = pt(0);
  for (let i = 1; i <= n * 2; i++) {
    const cur = pt(i / (n * 2));
    rod(p, rope, prev, cur, 0.018);
    prev = cur;
  }
  for (let i = 0; i < n; i++) {
    const t0 = (i + 0.25) / n, t1 = (i + 0.75) / n, tm = (t0 + t1) / 2;
    const p0 = pt(t0), p1 = pt(t1), pm = pt(tm);
    const c = cols[i % cols.length];
    // double-sided: emit both windings
    const tip = pm.clone().add(new THREE.Vector3(0, -0.38, 0));
    for (const q of [[p0, p1, tip], [p1, p0, tip]]) for (const v of q) { pos.push(v.x, v.y, v.z); col.push(c.r, c.g, c.b); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  p.add(m);
}

export function makeRamp(): THREE.Group {
  const g = new THREE.Group();
  const wood = toon(PAL.wood), woodD = toon('#8a5428'), woodL = toon('#d49a5c'), steel = toon(PAL.steel);
  const orange = toon(PAL.orange), cream = toon(PAL.cream), rope = toon('#e8d29a'), hay = toon('#f2c94c'), hayD = toon('#c99a22');

  // solid core (so the sides read as a real mass) under the planks
  const core = new THREE.Mesh(wedge(), woodD);
  core.scale.set(0.98, 0.97, 1);
  core.castShadow = core.receiveShadow = true;
  g.add(core);

  // plank deck: rotated into the slope plane
  const slope = new THREE.Group();
  slope.position.y = RAMP_H / 2;
  slope.rotation.x = RAMP_A;
  g.add(slope);
  const len = Math.hypot(RAMP_L, RAMP_H);
  const n = 10, pl = len / n;
  for (let i = 0; i < n; i++) {
    const z = -len / 2 + pl * (i + 0.5);
    const m = B(slope, i % 2 ? wood : woodL, RAMP_W, 0.1, pl - 0.04, 0, -0.04, z);
    m.receiveShadow = true;
  }
  // painted stripes (orange / cream chevron-ish bands) just above the planks
  for (const [i, c] of [[1, orange], [3, cream], [5, orange], [7, cream]] as const) {
    const z = -len / 2 + pl * (i + 0.5);
    B(slope, c, RAMP_W - 0.5, 0.02, pl * 0.5, 0, 0.012, z).castShadow = false;
  }
  // side rails (log beams) along the slope
  for (const sx of [-1, 1]) {
    const lg = C(slope, wood, 0.17, 0.17, len + 0.1, sx * (RAMP_W / 2 + 0.05), 0.05, 0, 0.03, 8);
    lg.rotation.x = Math.PI / 2;
    C(slope, woodL, 0.12, 0.12, 0.02, sx * (RAMP_W / 2 + 0.05), 0.05, -len / 2 - 0.05, 0, 8).rotation.x = Math.PI / 2;
  }
  // front lip (log across the low end)
  const lip = C(g, wood, 0.14, 0.14, RAMP_W + 0.3, 0, 0.06, RAMP_L / 2 + 0.05, 0.03, 8);
  lip.rotation.z = Math.PI / 2;

  // bolts (instanced)
  if (!boltGeo) boltGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.04, 6);
  const bolts = new THREE.InstancedMesh(boltGeo, toon('#7a4a2a'), n * 2);
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(RAMP_A, 0, 0));
  let bi = 0;
  for (let i = 0; i < n; i++) for (const sx of [-1, 1]) {
    const lz = -len / 2 + pl * (i + 0.5);
    const v = new THREE.Vector3(sx * (RAMP_W / 2 - 0.2), 0.02, lz).applyEuler(new THREE.Euler(RAMP_A, 0, 0)).add(new THREE.Vector3(0, RAMP_H / 2, 0));
    mtx.compose(v, q, new THREE.Vector3(1, 1, 1));
    bolts.setMatrixAt(bi++, mtx);
  }
  g.add(bolts);

  // log supports along both sides + rope between them
  const posts: THREE.Vector3[][] = [[], []];
  [-1, 1].forEach((sx, si) => {
    for (const z of [-2.7, 0, 2.7]) {
      const top = hz(z) + 0.55;
      const p = C(g, wood, 0.15, 0.17, top, sx * (RAMP_W / 2 + 0.45), top / 2, z, 0.03, 8);
      C(g, woodL, 0.14, 0.14, 0.03, 0, top / 2 + 0.0, 0, 0, 8).position.y = top / 2;
      p.castShadow = true;
      posts[si].push(new THREE.Vector3(sx * (RAMP_W / 2 + 0.45), top, z));
      B(g, steel, 0.12, 0.04, 0.12, sx * (RAMP_W / 2 + 0.45), top + 0.02, z);
    }
    for (let i = 0; i < 2; i++) {
      const a = posts[si][i].clone(), b = posts[si][i + 1].clone();
      // rope sags a little between posts
      const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, -0.12, 0));
      rod(g, rope, a.clone().add(new THREE.Vector3(0, -0.05, 0)), mid, 0.03);
      rod(g, rope, mid, b.clone().add(new THREE.Vector3(0, -0.05, 0)), 0.03);
    }
    // bunting across the top of each side post line
    bunting(g, posts[si][0].clone().add(new THREE.Vector3(0, 0.25, 0)), posts[si][2].clone().add(new THREE.Vector3(0, 0.25, 0)), 0.22, 9, rope);
    // diagonal brace log under each rail
    rod(g, woodD, new THREE.Vector3(sx * (RAMP_W / 2 + 0.7), 0.02, 0.4), new THREE.Vector3(sx * (RAMP_W / 2 + 0.1), hz(-0.4) * 0.8, -0.6), 0.08);
  });

  // hay bales + tyre stacks flanking the low end
  for (const sx of [-1, 1]) {
    const hb = B(g, hay, 0.9, 0.55, 0.7, sx * (RAMP_W / 2 + 0.75), 0.28, RAMP_L / 2 + 0.8, 0.03);
    hb.rotation.y = sx * 0.2;
    B(hb, hayD, 1.02, 0.08, 1.04, 0, 0.1, 0);
    B(hb, hayD, 1.02, 0.08, 1.04, 0, -0.1, 0);
    const hb2 = B(g, hay, 0.8, 0.5, 0.65, sx * (RAMP_W / 2 + 0.8), 0.8, RAMP_L / 2 + 0.75, 0.03);
    hb2.rotation.y = -sx * 0.3;
    // tyre stack by the high end
    if (!torusGeo) torusGeo = new THREE.TorusGeometry(0.42, 0.17, 6, 12);
    for (let k = 0; k < 3; k++) {
      const t = new THREE.Mesh(torusGeo, toon('#2b2b4d'));
      t.rotation.x = Math.PI / 2;
      t.position.set(sx * (RAMP_W / 2 + 1.0), 0.17 + k * 0.32, -RAMP_L / 2 + 0.3 + (k % 2) * 0.05);
      t.castShadow = true;
      g.add(t);
    }
    B(g, toon(PAL.yellow), 0.5, 0.04, 0.5, sx * (RAMP_W / 2 + 1.0), 1.1, -RAMP_L / 2 + 0.3).castShadow = false;
  }

  // JUMP sign board on two posts at the high end (faces +Z, the approaching car)
  if (!signTex) {
    signTex = canvasTex(256, 128, (x) => {
      x.fillStyle = '#ffd21f';
      x.fillRect(0, 0, 256, 128);
      x.strokeStyle = '#1b1b3a';
      x.lineWidth = 12;
      x.strokeRect(6, 6, 244, 116);
      x.fillStyle = '#1b1b3a';
      x.font = '900 82px "Arial Black", Impact, sans-serif';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText('JUMP', 128, 70);
      x.fillStyle = '#ff3b30';
      for (const px of [26, 230]) { x.beginPath(); x.arc(px, 22, 6, 0, 7); x.fill(); }
    });
  }
  const sy = RAMP_H + 1.5;
  for (const sx of [-1, 1]) C(g, wood, 0.1, 0.11, sy, sx * 1.1, sy / 2, -RAMP_L / 2 + 0.2, 0.03, 8);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 0.1), [toon(PAL.ink), toon(PAL.ink), toon(PAL.ink), toon(PAL.ink), new THREE.MeshBasicMaterial({ map: signTex }), toon(PAL.ink)]);
  sign.position.set(0, sy + 0.1, -RAMP_L / 2 + 0.3);
  sign.castShadow = true;
  g.add(sign);
  return g;
}

// ───────────── boost pad ─────────────
const PAD_W = 4.4, PAD_L = 6;
const CHEV = 4;

export function makePad(): THREE.Group {
  const g = new THREE.Group();
  const steel = toon(PAL.steel), dark = toon('#23234a'), ink = toon(PAL.ink);
  if (!hazardTex) {
    hazardTex = canvasTex(64, 64, (x) => {
      x.fillStyle = '#ffd21f';
      x.fillRect(0, 0, 64, 64);
      x.fillStyle = '#1b1b3a';
      for (let i = -1; i < 4; i++) { x.beginPath(); x.moveTo(i * 24, 64); x.lineTo(i * 24 + 16, 64); x.lineTo(i * 24 + 48, 0); x.lineTo(i * 24 + 32, 0); x.fill(); }
    });
    hazardTex.wrapS = hazardTex.wrapT = THREE.RepeatWrapping;
    hazardTex.repeat.set(1, 4);
  }
  // raised plate: frame, recessed bed
  B(g, steel, PAD_W, 0.1, PAD_L, 0, 0.05, 0, 0.03).receiveShadow = true;
  B(g, dark, PAD_W - 0.5, 0.03, PAD_L - 0.5, 0, 0.105, 0);
  // slim wedge lips so the car rolls on/off visually (plate is only 0.1 m)
  // rivets
  for (const sx of [-1, 1]) for (let i = 0; i < 5; i++) C(g, ink, 0.06, 0.06, 0.03, sx * (PAD_W / 2 - 0.13), 0.11, -PAD_L / 2 + 0.4 + i * ((PAD_L - 0.8) / 4), 0, 6);

  // glowing chevrons pointing -Z (direction of travel), individually pulsed
  const mats: THREE.MeshBasicMaterial[] = [];
  const cA = new THREE.Color('#ffd21f'), cB = new THREE.Color('#fff7b0'), cOff = new THREE.Color('#7a5a00');
  const arm = 1.9, th = 0.38, ang = 0.62;
  for (let i = 0; i < CHEV; i++) {
    const m = new THREE.MeshBasicMaterial({ color: cA });
    mats.push(m);
    const z = PAD_L / 2 - 1.0 - i * 1.4;
    const ch = new THREE.Group();
    ch.position.set(0, 0.125, z);
    for (const s of [-1, 1]) {
      const a = B(ch, m, arm, 0.03, th, s * Math.sin(ang) * arm * 0.5, 0, Math.cos(ang) * arm * 0.5);
      a.castShadow = false;
      a.rotation.y = s * ang;
    }
    g.add(ch);
  }
  // soft glow plane
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(PAD_W - 0.4, PAD_L - 0.4), glowMat('#ffd21f', 0.18));
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.135;
  g.add(glow);

  // flanking hazard posts + lamps
  const post = new THREE.MeshToonMaterial({ map: hazardTex });
  const lamps: THREE.MeshBasicMaterial[] = [];
  for (const sx of [-1, 1]) for (const z of [-PAD_L / 2 + 0.2, PAD_L / 2 - 0.2]) {
    const x = sx * (PAD_W / 2 + 0.35);
    C(g, post, 0.17, 0.2, 1.0, x, 0.5, z, 0.03, 8);
    B(g, ink, 0.4, 0.1, 0.4, x, 0.05, z);
    const lm = new THREE.MeshBasicMaterial({ color: '#ff6a2b' });
    lamps.push(lm);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), lm);
    lamp.position.set(x, 1.15, z);
    g.add(lamp);
  }
  // side pylons with glowing rings at mid-pad
  const ringMat = new THREE.MeshBasicMaterial({ color: '#38e1ff' });
  const rings: THREE.Mesh[] = [];
  for (const sx of [-1, 1]) {
    const x = sx * (PAD_W / 2 + 0.55);
    B(g, steel, 0.36, 2.2, 0.36, x, 1.1, 0, 0.04);
    B(g, ink, 0.44, 0.14, 0.44, x, 0.07, 0);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.07, 6, 18), ringMat);
    ring.position.set(x, 1.7, 0);
    ring.rotation.y = Math.PI / 2;
    g.add(ring);
    rings.push(ring);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), ringMat);
    cap.position.set(x, 2.3, 0);
    g.add(cap);
  }

  g.userData.update = (t: number): void => {
    for (let i = 0; i < CHEV; i++) {
      // wave running toward -Z (from the car's side to the jump-off side)
      const k = clamp(0.5 + 0.5 * Math.sin(t * 6 - (CHEV - 1 - i) * 1.25), 0, 1);
      mats[i].color.copy(cOff).lerp(cA, 0.35 + 0.65 * k).lerp(cB, k * k * 0.6);
    }
    (glow.material as THREE.MeshBasicMaterial).opacity = 0.12 + 0.1 * (0.5 + 0.5 * Math.sin(t * 6));
    const b = 0.5 + 0.5 * Math.sin(t * 9);
    for (const l of lamps) l.color.setRGB(1, 0.3 + 0.35 * b, 0.1);
    for (let i = 0; i < rings.length; i++) rings[i].scale.setScalar(1 + 0.08 * Math.sin(t * 7 + i * Math.PI));
  };
  return g;
}

/** Drive any prop animation (boost pad chevrons / lamps). Safe to call on any object. */
export function updateProps(g: THREE.Object3D, t: number): void {
  const u = g.userData.update as ((t: number) => void) | undefined;
  if (u) u(t);
}
