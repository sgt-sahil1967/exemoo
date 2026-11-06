// Renders the actual 3D racer heads and item models into small transparent
// images (used instead of emoji in menus, HUD, results and on the phones),
// and draws top-down track thumbnails for the track picker.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CHARACTERS, makeHead, makeItemMesh, BODY_COLORS } from './models.js';
import { mat, ball, mesh, torusGeo } from './geo.js';

function snapshot(renderer, scene, cam, size) {
  renderer.render(scene, cam);
  const c = document.createElement('canvas'); c.width = c.height = size;
  c.getContext('2d').drawImage(renderer.domElement, 0, 0, size, size);
  return { canvas: c, url: c.toDataURL('image/png') };
}

export function buildPortraits() {
  const S = 160;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(S, S, false);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .5;
  scene.add(new THREE.HemisphereLight('#ffffff', '#88aa66', 1.4));
  const key = new THREE.DirectionalLight('#fff4e0', 2.6); key.position.set(2, 3, 4); scene.add(key);
  const cam = new THREE.PerspectiveCamera(30, 1, .1, 50);

  const out = { chars: {}, items: {} };
  for (const ch of CHARACTERS) {
    const g = new THREE.Group();
    const head = makeHead(ch.id); head.position.y = .55; g.add(head);
    ball(.5, mat(BODY_COLORS[ch.id]), g, 0, -.35, -.05, 24).scale.set(1.1, .8, .9);
    const scarf = mesh(torusGeo(.34, .11, 10, 24), mat(ch.kart, { roughness: .35 }), 0, .02, 0, g); scarf.rotation.x = Math.PI / 2;
    g.rotation.y = -.35;
    scene.add(g);
    cam.position.set(0, .45, 4.1); cam.lookAt(0, .38, 0);
    out.chars[ch.id] = snapshot(renderer, scene, cam, S);
    scene.remove(g);
  }
  for (const type of ['carrot', 'carrot3', 'egg', 'mud', 'bee', 'clover']) {
    const g = new THREE.Group();
    const add = (dx, dz) => { const m = makeItemMesh(type === 'carrot3' ? 'carrot' : type); m.position.set(dx, 0, dz); g.add(m); };
    if (type === 'carrot3') { add(-.45, 0); add(.45, 0); add(0, .45); } else add(0, 0);
    if (type === 'carrot' || type === 'carrot3') g.rotation.set(.5, .8, 0);
    if (type === 'mud') g.rotation.x = .6;
    if (type === 'bee') g.rotation.y = .7;
    scene.add(g);
    const box = new THREE.Box3().setFromObject(g), c = box.getCenter(new THREE.Vector3()), r = box.getSize(new THREE.Vector3()).length() / 2;
    cam.position.set(c.x, c.y + r * .3, c.z + r / Math.tan(15 * Math.PI / 180) * 1.02); cam.lookAt(c);
    out.items[type] = snapshot(renderer, scene, cam, S);
    scene.remove(g);
  }
  pm.dispose();
  renderer.dispose();
  renderer.forceContextLoss?.();
  return out;
}

/** top-down thumbnail of a map's layout in its theme colours */
export function mapThumb(def, w = 240, h = 150) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  const th = def.theme;
  g.fillStyle = th.ground[0]; g.fillRect(0, 0, w, h);
  const cs = 15;
  g.fillStyle = th.ground[1];
  for (let x = 0; x < w / cs; x++) for (let y = 0; y < h / cs; y++) if ((x + y) % 2) g.fillRect(x * cs, y * cs, cs, cs);
  const s = def.scale || 1;
  const curve = new THREE.CatmullRomCurve3(def.ctrl.map(([x, z]) => new THREE.Vector3(x * s, 0, z * s)), true, 'centripetal');
  const pts = curve.getSpacedPoints(200);
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const p of pts) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); }
  const sc = Math.min((w - 36) / (x1 - x0), (h - 36) / (z1 - z0));
  const P = p => [w / 2 + (p.x - (x0 + x1) / 2) * sc, h / 2 + (p.z - (z0 + z1) / 2) * sc];
  g.lineJoin = g.lineCap = 'round';
  for (const [lw, col] of [[15, '#1b1b3a'], [9, th.road.base], [2, '#ffffff66']]) {
    g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
    pts.forEach((p, i) => { const [x, y] = P(p); i ? g.lineTo(x, y) : g.moveTo(x, y); });
    g.stroke();
  }
  const [sx, sy] = P(pts[0]);
  g.fillStyle = '#fff'; g.strokeStyle = '#1b1b3a'; g.lineWidth = 3;
  g.beginPath(); g.arc(sx, sy, 6, 0, 7); g.fill(); g.stroke();
  return { canvas: c, url: c.toDataURL('image/png') };
}
