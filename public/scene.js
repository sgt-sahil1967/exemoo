// Moo Moo Farm style 3D background, shared by every Exemoo page.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
// gradient sky dome
{
  const c = document.createElement('canvas'); c.width = 2; c.height = 256;
  const g = c.getContext('2d'); const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, '#2f9bff'); grd.addColorStop(0.55, '#8fd6ff'); grd.addColorStop(1, '#e6f7ff');
  g.fillStyle = grd; g.fillRect(0, 0, 2, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(250, 32, 16), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false })));
}
scene.fog = new THREE.Fog('#cdeeff', 60, 170);
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 600);

scene.add(new THREE.HemisphereLight('#dff3ff', '#3f9a25', 1.3));
const sun = new THREE.DirectionalLight('#fff1d0', 2.4);
sun.position.set(30, 45, 25); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.radius = 4;
Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 50, bottom: -50, far: 150 });
scene.add(sun);

const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0, ...o });
const M = {
  dirt: mat('#d39a57'), wood: mat('#8a5a2b'), woodD: mat('#5e3a1a'), red: mat('#e23a2e'), white: mat('#fbfbf6'),
  black: mat('#262633'), pink: mat('#ffb3c1'), roof: mat('#6b3f22'), mole: mat('#7a4a28'), hill: mat('#74d84f'),
  hill2: mat('#63c843'), leaf: mat('#3fae2e'), leaf2: mat('#56c63a'), yellow: mat('#ffd21f'), hay: mat('#f1c24b'),
  horn: mat('#f3e3b5'), glass: mat('#bfe8ff', { roughness: 0.2 }), curbR: mat('#ff3b30'), curbW: mat('#ffffff'),
  flowerR: mat('#ff5a7a'), flowerY: mat('#ffe14d'), flowerW: mat('#ffffff'), stone: mat('#b9b2a5'),
};
const shadow = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };
const rbox = (w, h, d, m, r = 0.15) => shadow(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)), m));
const ball = (r, m, s = 20) => shadow(new THREE.Mesh(new THREE.SphereGeometry(r, s, Math.round(s * 0.75)), m));
const cyl = (rt, rb, h, m, s = 20) => shadow(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, s), m));
const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };

// ---------- ground: checkered grass ----------
const grassTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#62d23c'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#55c232'; g.fillRect(0, 0, 128, 128); g.fillRect(128, 128, 128, 128);
  for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < 0.5 ? '#ffffff10' : '#00000010'; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 4); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(50, 50);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
})();
const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ map: grassTex, roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

// ---------- dirt track with red/white curbs ----------
const curve = new THREE.CatmullRomCurve3([[-90, 0, 10], [-45, 0, 4], [-20, 0, 12], [2, 0, 6], [24, 0, -4], [50, 0, 0], [90, 0, -8]].map((p) => new THREE.Vector3(...p)));
function ribbon(off0, off1, y, material, segs = 240) {
  const pos = [], idx = [];
  for (let i = 0; i <= segs; i++) {
    const u = i / segs, p = curve.getPointAt(u), t = curve.getTangentAt(u), n = new THREE.Vector3(-t.z, 0, t.x);
    pos.push(...p.clone().addScaledVector(n, off0).toArray(), ...p.clone().addScaledVector(n, off1).toArray());
    if (i < segs) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, material); m.position.y = y; m.receiveShadow = true; scene.add(m); return m;
}
ribbon(-4.2, 4.2, 0.03, M.dirt);
// curb blocks: one per segment, sized to the spacing so neighbours never overlap (no z-fighting)
{
  const len = curve.getLength(), n = Math.floor(len / 1.6), seg = len / n;
  const geo = new RoundedBoxGeometry(seg * 0.92, 0.25, 0.7, 2, 0.08);
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n, p = curve.getPointAt(u), t = curve.getTangentAt(u), nrm = new THREE.Vector3(-t.z, 0, t.x);
    for (const side of [-1, 1]) {
      const b = new THREE.Mesh(geo, i % 2 ? M.curbR : M.curbW); b.receiveShadow = true;
      b.position.copy(p).addScaledVector(nrm, side * 4.5); b.position.y = 0.13;
      b.rotation.y = Math.atan2(-t.z, t.x);
      scene.add(b);
    }
  }
}

// ---------- rolling hills ----------
[[-60, -70, 32, M.hill], [-5, -85, 42, M.hill2], [55, -75, 34, M.hill], [110, -55, 28, M.hill2], [-115, -50, 30, M.hill2], [20, -60, 18, M.hill]].forEach(([x, z, r, m]) => {
  const h = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), m);
  h.position.set(x, -r * 0.3, z); h.scale.y = 0.55; h.receiveShadow = true; scene.add(h);
});

// ---------- red barn ----------
function barn() {
  const g = new THREE.Group();
  g.add(at(rbox(10, 7, 8, M.red, 0.2), 0, 3.5, 0));
  // gambrel roof from extruded shape
  const s = new THREE.Shape(); s.moveTo(-5.6, 0); s.lineTo(-4.4, 2.6); s.lineTo(0, 4.4); s.lineTo(4.4, 2.6); s.lineTo(5.6, 0); s.lineTo(-5.6, 0);
  const roof = shadow(new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 9, bevelEnabled: true, bevelSize: 0.15, bevelThickness: 0.15, bevelSegments: 2 }), M.roof));
  roof.position.set(0, 7, -4.5); g.add(roof);
  const gable = shadow(new THREE.Mesh(new THREE.ShapeGeometry(s), M.red)); gable.scale.set(0.94, 0.94, 1); gable.position.set(0, 7, 4.05); g.add(gable);
  g.add(at(rbox(4, 5, 0.3, M.white, 0.1), 0, 2.5, 4.05));
  for (const r of [0.9, -0.9]) { const x = rbox(0.35, 5.8, 0.2, M.red, 0.05); x.position.set(0, 2.5, 4.25); x.rotation.z = r; g.add(x); }
  g.add(at(rbox(3.6, 0.35, 0.2, M.white, 0.05), 0, 5, 4.25));
  const win = rbox(1.6, 1.6, 0.25, M.white, 0.08); win.position.set(0, 8.8, 4.15); g.add(win);
  g.add(at(rbox(1.2, 1.2, 0.3, M.glass, 0.05), 0, 8.8, 4.2));
  for (const x of [-3.8, 3.8]) { g.add(at(rbox(1.4, 1.4, 0.25, M.white, 0.08), x, 4.8, 4.05)); g.add(at(rbox(1.0, 1.0, 0.3, M.glass, 0.04), x, 4.8, 4.1)); }
  // weathervane
  const vane = new THREE.Group(); vane.add(cyl(0.08, 0.08, 2, M.black, 6)); const arrow = rbox(1.8, 0.15, 0.15, M.black, 0.03); arrow.position.y = 0.8; vane.add(arrow);
  vane.position.set(0, 12.4, 0); g.add(vane);
  return g;
}
const b1 = barn(); b1.position.set(-24, 0, -20); b1.rotation.y = 0.35; scene.add(b1);

// silo
const silo = new THREE.Group();
silo.add(at(cyl(2.4, 2.4, 13, M.white, 32), 0, 6.5, 0));
for (let y = 1.5; y < 13; y += 2.2) silo.add(at(cyl(2.48, 2.48, 0.25, M.stone, 32), 0, y, 0));
const dome = ball(2.45, M.red, 32); dome.scale.y = 0.8; silo.add(at(dome, 0, 13, 0));
silo.position.set(-14, 0, -24); scene.add(silo);

// farmhouse
const house = new THREE.Group();
house.add(at(rbox(8, 5, 6, M.white, 0.2), 0, 2.5, 0));
const hroof = shadow(new THREE.Mesh(new THREE.ConeGeometry(6.4, 3.6, 4), M.red)); hroof.rotation.y = Math.PI / 4; hroof.scale.set(1, 1, 0.8); house.add(at(hroof, 0, 6.8, 0));
house.add(at(rbox(1.6, 2.8, 0.2, M.woodD, 0.08), 0, 1.4, 3.05));
for (const x of [-2.6, 2.6]) { house.add(at(rbox(1.5, 1.5, 0.2, M.glass, 0.08), x, 3, 3.02)); }
house.add(at(rbox(0.9, 2.6, 0.9, M.red, 0.1), 2.4, 7.4, 0));
house.position.set(34, 0, -26); house.rotation.y = -0.4; scene.add(house);

// windmill
const mill = new THREE.Group();
mill.add(at(cyl(1.2, 2.2, 10, M.white, 16), 0, 5, 0));
const mcap = shadow(new THREE.Mesh(new THREE.ConeGeometry(1.8, 2.4, 16), M.red)); mill.add(at(mcap, 0, 11.2, 0));
const blades = new THREE.Group();
for (let i = 0; i < 4; i++) { const bl = rbox(0.7, 5.4, 0.15, M.wood, 0.06); bl.position.y = 2.8; const arm = new THREE.Group(); arm.add(bl); arm.rotation.z = (i * Math.PI) / 2; blades.add(arm); }
blades.add(ball(0.5, M.red)); blades.position.set(0, 9.5, 1.9); mill.add(blades);
mill.position.set(52, 0, -18); mill.rotation.y = -0.5; scene.add(mill);

// ---------- fences ----------
function fence(x0, z0, len, rot) {
  const g = new THREE.Group();
  for (let i = 0; i <= len; i += 2.5) { g.add(at(rbox(0.4, 2, 0.4, M.white, 0.1), i, 1, 0)); }
  for (const y of [0.7, 1.5]) g.add(at(rbox(len, 0.28, 0.18, M.white, 0.08), len / 2, y, 0));
  g.position.set(x0, 0, z0); g.rotation.y = rot; scene.add(g);
}
fence(-55, -3, 36, 0.12); fence(4, -5, 34, 0.32); fence(-40, 19, 30, -0.12); fence(8, 15, 32, 0.25);

// ---------- cows (chunky Mario Kart Moo Moo Farm style) ----------
const cows = [];
M.bell = mat('#ffcc22', { metalness: 0.6, roughness: 0.35 });
M.snout = mat('#ffa8b8'); M.hoof = mat('#4a3426'); M.eye = mat('#ffffff', { roughness: 0.3 });
const spot = (r, sx, sy, sz) => { const s = ball(r, M.black, 14); s.scale.set(sx, sy, sz); return s; };
function cow(x, z, ry, s = 1) {
  const c = new THREE.Group();
  const body = new THREE.Group(); body.position.y = 1.9; c.add(body);
  const torso = ball(1, M.white, 28); torso.scale.set(1.55, 1.05, 1.0); body.add(torso);
  // spots sit just inside the torso surface so only a patch pokes out
  [[0.4, 0.55, 0.62, 0.55], [-0.8, 0.2, 0.7, 0.5], [-0.2, 0.75, -0.45, 0.5], [0.7, 0.1, -0.78, 0.45], [-1.15, 0.45, -0.3, 0.42]]
    .forEach(([a, b, d, r]) => { const sp = spot(r, 1, 0.7, 0.55); sp.position.set(a, b, d); sp.lookAt(sp.position.clone().multiplyScalar(2)); body.add(sp); });
  // udder + tail
  body.add(at(ball(0.35, M.snout, 14), -0.2, -0.95, 0));
  const tail = new THREE.Group(); tail.add(at(cyl(0.06, 0.06, 1.1, M.white, 6), 0, -0.55, 0)); tail.add(at(ball(0.18, M.black, 10), 0, -1.1, 0));
  tail.position.set(-1.5, 0.4, 0); tail.rotation.z = -0.4; body.add(tail);
  // legs with dark hooves
  for (const [lx, lz] of [[-0.9, -0.5], [-0.9, 0.5], [0.85, -0.5], [0.85, 0.5]]) {
    c.add(at(cyl(0.26, 0.24, 1.2, M.white, 12), lx, 0.7, lz)); c.add(at(cyl(0.27, 0.29, 0.28, M.hoof, 12), lx, 0.14, lz));
  }
  // big head
  const head = new THREE.Group(); head.position.set(1.75, 2.75, 0); c.add(head);
  const skull = ball(0.85, M.white, 24); skull.scale.set(1, 0.95, 1.05); head.add(skull);
  const muzzle = ball(0.62, M.snout, 24); muzzle.scale.set(0.85, 0.7, 1.1); muzzle.position.set(0.62, -0.35, 0); head.add(muzzle);
  for (const zz of [-0.25, 0.25]) { const n = ball(0.1, M.black, 10); n.scale.set(0.6, 1, 1); n.position.set(1.12, -0.32, zz); head.add(n); }
  head.add(at(spot(0.38, 0.6, 1, 1), 0.2, 0.55, 0.45));
  for (const zz of [-1, 1]) {
    const eye = ball(0.26, M.eye, 16); eye.scale.set(0.7, 1.1, 0.9); eye.position.set(0.6, 0.25, zz * 0.38); head.add(eye);
    const pupil = ball(0.13, M.black, 12); pupil.position.set(0.8, 0.22, zz * 0.36); head.add(pupil);
    const glint = ball(0.04, M.eye, 6); glint.position.set(0.9, 0.28, zz * 0.33); head.add(glint);
    const horn = shadow(new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.6, 10), M.horn)); horn.position.set(-0.05, 0.85, zz * 0.5); horn.rotation.x = zz * -0.5; head.add(horn);
    const ear = ball(0.25, M.white, 12); ear.scale.set(0.5, 0.35, 1.1); ear.position.set(-0.15, 0.45, zz * 0.95); ear.rotation.x = zz * 0.5; head.add(ear);
    const earIn = ball(0.17, M.snout, 10); earIn.scale.set(0.3, 0.3, 1); earIn.position.set(-0.06, 0.45, zz * 1.0); earIn.rotation.x = zz * 0.5; head.add(earIn);
  }
  // collar + cowbell
  const collar = shadow(new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.09, 8, 24), M.red)); collar.position.set(1.3, 2.05, 0); collar.rotation.y = Math.PI / 2; collar.rotation.x = 0.35; c.add(collar);
  const bell = cyl(0.14, 0.26, 0.4, M.bell, 14); bell.position.set(1.62, 1.45, 0); c.add(bell);
  c.userData = { head, tail, body };
  c.position.set(x, 0, z); c.rotation.y = ry; c.scale.setScalar(s); scene.add(c); cows.push(c);
}
cow(-8, -8, 0.6, 1.1); cow(5, -11, -2.4); cow(18, 12, 2.2, 1.15); cow(-28, 14, -0.8); cow(-15, 23, 1.2, 1.2); cow(28, -12, -1.4); cow(-2, 19, 0.3, 1.3);

// ---------- Monty Moles ----------
const moles = [];
[[-12, 8], [0, 9.5], [16, 3], [26, -6], [-34, 6]].forEach(([x, z], i) => {
  const hole = new THREE.Mesh(new THREE.CircleGeometry(1, 20), M.black); hole.rotation.x = -Math.PI / 2; at(hole, x, 0.05, z); scene.add(hole);
  const mound = shadow(new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.32, 10, 24), M.dirt)); mound.rotation.x = Math.PI / 2; at(mound, x, 0.12, z); scene.add(mound);
  const m = new THREE.Group();
  const b = ball(0.75, M.mole); b.scale.y = 1.25; m.add(b);
  m.add(at(ball(0.3, M.pink, 12), 0, 0.05, 0.68));
  for (const ex of [-0.28, 0.28]) { m.add(at(ball(0.16, M.white, 10), ex, 0.45, 0.58)); m.add(at(ball(0.08, M.black, 8), ex, 0.45, 0.72)); }
  for (const ex of [-0.65, 0.65]) m.add(at(ball(0.22, M.mole, 10), ex, -0.2, 0.3));
  at(m, x, -1.2, z); m.rotation.y = -0.2; scene.add(m); moles.push({ m, phase: i * 1.7 });
});

// ---------- hay bales, flowers, trees, bushes ----------
for (const [x, z, r] of [[-18, -8, 0.3], [-20.5, -9, 0.1], [-19, -10, 1.2], [40, -14, 0.6], [38, -12, 0.1]]) {
  const h = cyl(1.1, 1.1, 1.8, M.hay, 20); h.rotation.set(Math.PI / 2, 0, r); at(h, x, 1.1, z); scene.add(h);
}
const fl = [M.flowerR, M.flowerY, M.flowerW];
for (let i = 0; i < 140; i++) {
  const x = (Math.random() - 0.5) * 140, z = -30 + Math.random() * 60;
  if (Math.abs(z - curve.getPointAt(Math.min(1, Math.max(0, (x + 90) / 180))).z) < 7) continue;
  const f = ball(0.22, fl[i % 3], 8); at(f, x, 0.25, z); f.castShadow = false; scene.add(f);
}
function tree(x, z, s = 1) {
  const g = new THREE.Group();
  g.add(at(cyl(0.45, 0.7, 3.4, M.wood, 10), 0, 1.7, 0));
  [[0, 4.8, 0, 2.6, M.leaf], [1.2, 4.2, 0.6, 1.8, M.leaf2], [-1.1, 4.4, -0.4, 1.9, M.leaf2], [0.2, 6.2, 0.1, 1.8, M.leaf2]].forEach(([a, b, c, r, m]) => g.add(at(ball(r, m, 18), a, b, c)));
  g.position.set(x, 0, z); g.scale.setScalar(s); scene.add(g);
}
[[-44, -14, 1.1], [26, -20, 1], [44, 10, 1.2], [-58, 16, 1.1], [64, -8, 1], [-70, -10, 1.3], [8, -26, 0.9]].forEach((t) => tree(...t));
[[-30, -4], [12, -16], [36, 2], [-50, 8]].forEach(([x, z]) => { for (let i = 0; i < 3; i++) scene.add(at(ball(1.1 - i * 0.2, M.leaf2, 14), x + i * 1.3, 0.7, z)); });

// ---------- floating item boxes ----------
const items = [];
const qTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 128, 128); ['#ff4d4d', '#ffd21f', '#3ddc6a', '#2f9bff', '#b56bff'].forEach((col, i) => grd.addColorStop(i / 4, col));
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#fff'; g.lineWidth = 8; g.strokeRect(6, 6, 116, 116);
  g.fillStyle = '#fff'; g.font = 'bold 92px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const qMat = new THREE.MeshStandardMaterial({ map: qTex, transparent: true, opacity: 0.92, roughness: 0.3, emissive: '#ffffff', emissiveIntensity: 0.15, emissiveMap: qTex });
for (const [x, z] of [[-6, 5], [-4, 6], [-2, 7]]) { const q = rbox(1.6, 1.6, 1.6, qMat, 0.2); at(q, x, 2.2, z); scene.add(q); items.push(q); }

// ---------- clouds ----------
const clouds = [];
const cloudMat = mat('#ffffff', { roughness: 1, emissive: '#ffffff', emissiveIntensity: 0.25 });
for (let i = 0; i < 9; i++) {
  const g = new THREE.Group();
  [[0, 0, 3], [2.8, -0.4, 2.3], [-2.8, -0.5, 2.2], [1.1, 1.3, 2.1], [-1.2, 1, 1.8]].forEach(([x, y, r]) => { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), cloudMat); s.position.set(x, y, 0); g.add(s); });
  g.position.set(-110 + i * 26, 26 + (i % 3) * 6, -60 - (i % 2) * 20); g.scale.setScalar(1 + (i % 3) * 0.3); scene.add(g); clouds.push(g);
}

// ---------- loop ----------
let mx = 0, my = 0;
addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  // Hidden behind a game: don't spend the GPU on it.
  if (document.body.classList.contains('playing')) return;
  const t = clock.getElapsedTime();
  const sy = Math.min(scrollY / innerHeight, 1.5);
  camera.position.set(Math.sin(t * 0.05) * 6 + mx * 4, 15 - sy * 4 - my * 2, 38);
  camera.lookAt(0, 2.5 - sy * 2, -6);
  cows.forEach((c, i) => {
    c.userData.head.rotation.z = Math.sin(t * 0.8 + i) * 0.12 - 0.08;
    c.userData.head.rotation.y = Math.sin(t * 0.5 + i * 2) * 0.25;
    c.userData.tail.rotation.x = Math.sin(t * 3 + i) * 0.4;
    c.userData.body.scale.y = 1 + Math.sin(t * 2 + i) * 0.02;
  });
  moles.forEach(({ m, phase }) => { const k = Math.sin(t * 1.3 + phase); m.position.y = k > 0.4 ? Math.min(1, (k - 0.4) * 4) * 1.0 - 0.1 : -1.2; });
  items.forEach((q, i) => { q.rotation.set(t * 0.6 + i, t * 0.9 + i, 0); q.position.y = 2.2 + Math.sin(t * 2 + i) * 0.3; });
  blades.rotation.z = t * 0.8;
  clouds.forEach((c, i) => { c.position.x += 0.012 + (i % 3) * 0.003; if (c.position.x > 130) c.position.x = -130; });
  renderer.render(scene, camera);
});
