// Cricket ground: renderer, lighting, turf, pitch, stadium with a 3D crowd, foliage and the farm beyond.
import * as THREE from 'three';
import { mergeGeometries as mergeRaw } from 'three/addons/utils/BufferGeometryUtils.js';
/** Merge geometries whether or not they are indexed (keeps position/normal/uv). */
const mergeGeometries = (list) => mergeRaw(list.map((g) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k); return n; }));
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { svgTexture, BOARDS, boardSvg, crowdRowSvg, fasciaSvg, roofSvg, sightscreenSvg, scoreboard } from './svg.js';

export const BOUNDARY = 64;
export const FIELD_Z = -10; // centre of the ground = middle of the pitch
const rand = mulberry(7);

function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const mat = (color, rough = 0.6, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, envMapIntensity: 0.7, ...extra });
const shadowAll = (o, cast = true, receive = true) => o.traverse((m) => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = receive; } });

/** opts.night: a floodlit night game (dark sky, stars, four floodlight spotlights, glowing lamps and boards). */
export function createWorld(canvas, { night = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 900);

  // ── sky + light ──
  // Day: late-afternoon sun from behind the batting end (left of the TV camera), long shadows down the pitch.
  // Night: four floodlight towers light the field; the stands glow under the lights.
  const sunDir = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - 36), THREE.MathUtils.degToRad(-38));
  const skyTex = (() => {
    const c = document.createElement('canvas'); c.width = 4; c.height = 512;
    const g = c.getContext('2d'), grd = g.createLinearGradient(0, 0, 0, 512);
    const stops = night
      ? [[0, '#02050f'], [0.3, '#07112a'], [0.46, '#1a2b52'], [0.5, '#3b4f7c'], [0.53, '#1a2a22'], [1, '#0b130c']]
      : [[0, '#2370d6'], [0.3, '#4f9fec'], [0.47, '#a9d8fb'], [0.5, '#e6f5ff'], [0.53, '#cfe3c8'], [1, '#6f9d55']];
    for (const [k, col] of stops) grd.addColorStop(k, col);
    g.fillStyle = grd; g.fillRect(0, 0, 4, 512);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(600, 48, 24), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })));
  if (night) {
    // Stars: small points on the upper sky, brighter toward the zenith.
    const n = 900, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const th = rand() * Math.PI * 2, ph = Math.acos(0.15 + rand() * 0.85);
      pos.set([Math.sin(ph) * Math.cos(th) * 560, Math.cos(ph) * 560, Math.sin(ph) * Math.sin(th) * 560], i * 3);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: '#cfdcff', size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85 })));
  }
  scene.fog = night ? new THREE.Fog('#0a1430', 180, 620) : new THREE.Fog('#d9efff', 170, 560);
  // Image-based light from an outdoor scene (sky dome, the sun or the floodlight banks, the grass below).
  const pmrem = new THREE.PMREMGenerator(renderer);
  {
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide })));
    const bright = (col, k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k) });
    if (night) {
      for (const p of FLOODLIGHTS) {
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(5, 12, 8), bright('#f2f5ff', 14));
        lamp.position.set(p.x, 47, p.z - FIELD_Z).multiplyScalar(0.9);
        env.add(lamp);
      }
    } else {
      const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(7, 16, 8), bright('#fff2d8', 18));
      sunDisc.position.copy(sunDir).multiplyScalar(90);
      env.add(sunDisc);
    }
    const grass = new THREE.Mesh(new THREE.CircleGeometry(95, 32), new THREE.MeshBasicMaterial({ color: night ? '#2c5a22' : '#5f9a3e' }));
    grass.rotation.x = -Math.PI / 2; grass.position.y = -2;
    env.add(grass);
    scene.environment = pmrem.fromScene(env, 0.02).texture;
  }
  const coarse = matchMedia('(pointer: coarse)').matches;
  let sun;
  if (night) {
    scene.add(new THREE.HemisphereLight('#6a7fb8', '#13240f', 0.22));
    // Floodlights: one spotlight per tower, aimed just short of the pitch so the whole square is lit.
    FLOODLIGHTS.forEach((p, i) => {
      const spot = new THREE.SpotLight('#f3f6ff', 1.25, 0, 0.62, 0.75, 0); // four overlap on the square
      spot.position.set(p.x, 47, p.z);
      spot.target.position.set(p.x * 0.08, 0, FIELD_Z + (p.z - FIELD_Z) * 0.08);
      spot.castShadow = !coarse || i < 2; // four faint shadows per player, like a floodlit game
      spot.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
      spot.shadow.bias = -0.0003;
      spot.shadow.normalBias = 0.03;
      Object.assign(spot.shadow.camera, { near: 40, far: 220 });
      scene.add(spot, spot.target);
      if (i === 0) sun = spot;
    });
    renderer.toneMappingExposure = 1.0;
  } else {
    scene.add(new THREE.HemisphereLight('#cfe8ff', '#5a8f3c', 0.35));
    sun = new THREE.DirectionalLight('#ffe7c6', 3.4);
    sun.target.position.set(0, 0, -10);
    sun.position.copy(sun.target.position).addScaledVector(sunDir, 120);
    sun.castShadow = true;
    const big = Math.min(renderer.capabilities.maxTextureSize, coarse ? 2048 : 4096);
    sun.shadow.mapSize.set(big, big);
    sun.shadow.bias = -0.0002;
    sun.shadow.normalBias = 0.025;
    Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 40, far: 220 });
    scene.add(sun, sun.target);
    // Cool rim light from the far end: separates players from the grass.
    const rim = new THREE.DirectionalLight('#d6ebff', 1.1);
    rim.position.set(25, 22, -95);
    scene.add(rim);
    renderer.toneMappingExposure = 1.0;
  }

  buildTurf(scene, renderer);
  buildPitch(scene, renderer);
  const { crowd, board, boardMats, fasciaMats } = buildStadium(scene, night);
  buildFoliage(scene);
  buildFarm(scene);
  if (!night) buildClouds(scene);

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();
  return { renderer, scene, camera, sun, crowd, board, boardMats, fasciaMats, night, resize };
}

// ─────────────────────────────── turf ───────────────────────────────
function buildTurf(scene, renderer) {
  const c = document.createElement('canvas'); c.width = c.height = 1024;
  const g = c.getContext('2d');
  // Moo Moo checker, mown in wide light/dark bands with fine blade noise.
  const N = 16, s = 1024 / N;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { g.fillStyle = (i + j) % 2 ? '#5fcf3b' : '#54bf31'; g.fillRect(i * s, j * s, s, s); }
  for (let i = 0; i < 26000; i++) {
    const x = rand() * 1024, y = rand() * 1024;
    g.fillStyle = rand() < 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,40,0,0.08)';
    g.fillRect(x, y, 1.2, 3 + rand() * 3);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(9, 9);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const field = new THREE.Mesh(new THREE.CircleGeometry(BOUNDARY + 1.2, 160), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, envMapIntensity: 0.3 }));
  field.rotation.x = -Math.PI / 2; field.position.z = FIELD_Z; field.receiveShadow = true;
  scene.add(field);
  // Boundary rope (thick, braided look) and the 30-yard circle dashes.
  const rope = new THREE.Mesh(new THREE.TorusGeometry(BOUNDARY, 0.22, 12, 240), mat('#ffffff', 0.4));
  rope.rotation.x = Math.PI / 2; rope.position.set(0, 0.2, FIELD_Z); shadowAll(rope); scene.add(rope);
  const dash = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.2, 0.18), mat('#ffffff', 0.8), 60);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    q.setFromEuler(e.set(-Math.PI / 2, 0, -a + Math.PI / 2));
    m.compose(new THREE.Vector3(Math.cos(a) * 27, 0.025, FIELD_Z + Math.sin(a) * 27), q, new THREE.Vector3(1, 1, 1));
    dash.setMatrixAt(i, m);
  }
  scene.add(dash);
}

function buildPitch(scene, renderer) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 1792;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 256, 0);
  grd.addColorStop(0, '#d9b377'); grd.addColorStop(0.5, '#e8c78d'); grd.addColorStop(1, '#d9b377');
  g.fillStyle = grd; g.fillRect(0, 0, 256, 1792);
  for (let i = 0; i < 9000; i++) { g.fillStyle = rand() < 0.5 ? 'rgba(120,80,30,0.08)' : 'rgba(255,255,255,0.07)'; g.fillRect(rand() * 256, rand() * 1792, 2, 2); }
  // worn patches where bowlers land and batters stand
  for (const y of [260, 1530]) for (let i = 0; i < 400; i++) { g.fillStyle = 'rgba(150,100,45,0.06)'; g.beginPath(); g.arc(128 + (rand() - 0.5) * 120, y + (rand() - 0.5) * 220, 6 + rand() * 10, 0, 7); g.fill(); }
  g.strokeStyle = '#ffffff'; g.lineWidth = 6;
  const L = (x1, y1, x2, y2) => { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); };
  // pitch is 22 m long → 1792 px (81.5 px/m), creases 1.22 m in front of the stumps
  for (const [stumpY, dir] of [[96, 1], [1696, -1]]) {
    L(0, stumpY + dir * 99, 256, stumpY + dir * 99); // popping crease
    L(30, stumpY, 226, stumpY); // bowling crease
    L(48, stumpY - 80, 48, stumpY + dir * 160); L(208, stumpY - 80, 208, stumpY + dir * 160); // return creases
  }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 22.4), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }));
  pitch.rotation.x = -Math.PI / 2; pitch.position.set(0, 0.012, -10); pitch.receiveShadow = true;
  scene.add(pitch);
  // Lighter mown square around the pitch.
  const sq = new THREE.Mesh(new THREE.PlaneGeometry(14, 30), new THREE.MeshStandardMaterial({ color: '#7fdc52', roughness: 1, transparent: true, opacity: 0.35 }));
  sq.rotation.x = -Math.PI / 2; sq.position.set(0, 0.006, -10); sq.receiveShadow = true;
  scene.add(sq);
}

// ─────────────────────────────── stumps ───────────────────────────────
export function makeStumps(scene, z) {
  const wood = new THREE.MeshPhysicalMaterial({ color: '#f4e6c2', roughness: 0.35, clearcoat: 0.6 });
  const bailM = mat('#d09a5a', 0.4);
  const parts = [];
  for (const x of [-0.115, 0, 0.115]) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.71, 20), wood);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.019, 0.08, 20), wood); tip.position.y = -0.39; tip.rotation.x = Math.PI; s.add(tip);
    s.position.set(x, 0.355, z); s.castShadow = true; scene.add(s); parts.push(s);
  }
  for (const x of [-0.058, 0.058]) {
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.011, 0.09, 6, 12), bailM);
    b.rotation.z = Math.PI / 2; b.position.set(x, 0.722, z); b.castShadow = true; scene.add(b); parts.push(b);
  }
  return { parts, home: parts.map((p) => ({ p: p.position.clone(), r: p.rotation.clone() })) };
}

// ─────────────────────────────── stadium + crowd ───────────────────────────────
const R0 = 78, TIERS = 9, STEP_D = 1.5, STEP_H = 1.05;
const STANDS = [
  { a: -Math.PI / 2, span: 1.3, name: 'MOO MOO STAND', color: '#2f7cff', seat: '#2f7cff' }, // behind the bowler
  { a: 0.02, span: 1.2, name: 'EXEMOO PAVILION', color: '#ff3b30', seat: '#ff5a4a' }, // right
  { a: Math.PI - 0.02, span: 1.2, name: 'FARMYARD END', color: '#2fc65a', seat: '#2fc65a' }, // left
  { a: Math.PI / 2, span: 1.0, name: 'BARN STAND', color: '#ffd21f', seat: '#ffd21f' }, // behind the camera
];
const arcGeo = (r, h, a0, span, open = true) => new THREE.CylinderGeometry(r, r, h, 96, 1, open, Math.PI / 2 - a0 - span / 2, span);

/** The four floodlight towers (ground positions), shared by the towers and the night lights. */
const FLOODLIGHTS = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].map((a) => ({ a, x: Math.cos(a) * 96, z: FIELD_Z + Math.sin(a) * 96 }));

/** Soft round glow texture (white centre fading out), for lamp halos. */
function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.18, 'rgba(255,250,235,0.75)'); grd.addColorStop(0.5, 'rgba(255,240,210,0.18)'); grd.addColorStop(1, 'rgba(255,240,210,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function buildStadium(scene, night = false) {
  // Paved apron between the rope and the stands (no grass here), with a running track.
  const paver = svgTexture(`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="#d8d2c4"/>${Array.from({ length: 16 }, (_, i) => `<rect x="${(i % 4) * 64 + 2}" y="${Math.floor(i / 4) * 64 + 2}" width="60" height="60" rx="6" fill="${i % 3 ? '#e4ded1' : '#dcd5c6'}"/>`).join('')}</svg>`, 512, 512, { repeat: [60, 60] });
  const apron = new THREE.Mesh(new THREE.RingGeometry(BOUNDARY + 1.2, R0 + 2, 192, 1), new THREE.MeshStandardMaterial({ map: paver, roughness: 0.9 }));
  apron.rotation.x = -Math.PI / 2; apron.position.set(0, 0.01, FIELD_Z); apron.receiveShadow = true; scene.add(apron);
  const track = new THREE.Mesh(new THREE.RingGeometry(BOUNDARY + 5.5, BOUNDARY + 10.5, 192, 1), mat('#c85a3e', 0.85));
  track.rotation.x = -Math.PI / 2; track.position.set(0, 0.02, FIELD_Z); track.receiveShadow = true; scene.add(track);
  for (const r of [BOUNDARY + 5.6, BOUNDARY + 7.3, BOUNDARY + 8.9, BOUNDARY + 10.4]) {
    const l = new THREE.Mesh(new THREE.RingGeometry(r - 0.05, r + 0.05, 192, 1), mat('#ffffff', 0.6));
    l.rotation.x = -Math.PI / 2; l.position.set(0, 0.025, FIELD_Z); scene.add(l);
  }

  const concrete = mat('#e6ebf1', 0.85);
  const crowdMats = [], fasciaMats = [];
  STANDS.forEach((sd, si) => {
    // Painted crowd: ~8 fans per tile (0.6 m each), two tile variants, idle + cheering artwork.
    // Inside faces of the arc are mirrored, hence the negative repeat.
    const rep = [-Math.round((R0 * sd.span) / 4.8), 1];
    const riserMats = [0, 1].map((v) => {
      const idle = svgTexture(crowdRowSvg(sd.seat, si * 2 + v, false), 1024, 320, { repeat: rep });
      const cheer = svgTexture(crowdRowSvg(sd.seat, si * 2 + v, true), 1024, 320, { repeat: rep });
      // At night the crowd glows a little, as if lit by the floodlights' spill.
      const m = new THREE.MeshStandardMaterial({ map: idle, roughness: 0.75, side: THREE.BackSide, ...(night ? { emissive: '#ffffff', emissiveMap: idle, emissiveIntensity: 0.32 } : {}) });
      crowdMats.push({ m, idle, cheer, night });
      return m;
    });
    for (let t = 0; t < TIERS; t++) {
      const r = R0 + t * STEP_D, h = 1.4 + t * STEP_H;
      // Tread (top) + riser (front face, seat-row artwork) as curved bands.
      const tread = new THREE.Mesh(new THREE.RingGeometry(r - STEP_D / 2, r + STEP_D / 2, 96, 1, Math.PI * 2 - (sd.a + sd.span / 2), sd.span), concrete);
      tread.rotation.x = -Math.PI / 2; tread.position.set(0, h, FIELD_Z); tread.receiveShadow = true; scene.add(tread);
      const riser = new THREE.Mesh(arcGeo(r - STEP_D / 2, STEP_H, sd.a, sd.span), riserMats[t % 2]);
      riser.position.set(0, h - STEP_H / 2, FIELD_Z); riser.receiveShadow = true; scene.add(riser);
    }
    // Front wall with the stand's fascia artwork.
    const fasciaTex = svgTexture(fasciaSvg(sd.name, sd.color), 4096, 256, { repeat: [-Math.max(1, Math.round(sd.span * 2.4)), 1] });
    const fasciaMat = new THREE.MeshStandardMaterial({ map: fasciaTex, roughness: 0.5, side: THREE.BackSide, emissive: '#ffffff', emissiveMap: fasciaTex, emissiveIntensity: night ? 0.75 : 0.05 });
    fasciaMats.push(fasciaMat);
    const fascia = new THREE.Mesh(arcGeo(R0 - STEP_D / 2, 1.4, sd.a, sd.span), fasciaMat);
    fascia.position.set(0, 0.7, FIELD_Z); fascia.castShadow = true; scene.add(fascia);
    // Back wall, roof canopy (truss artwork underneath) with a coloured edge, and its columns.
    const rBack = R0 + TIERS * STEP_D, hTop = 1.4 + TIERS * STEP_H;
    const back = new THREE.Mesh(arcGeo(rBack, hTop + 6, sd.a, sd.span), mat('#cfd7e2', 0.85, { side: THREE.DoubleSide }));
    back.position.set(0, (hTop + 6) / 2, FIELD_Z); scene.add(back);
    const roofTex = svgTexture(roofSvg(), 1024, 512, { repeat: [Math.round(sd.span * 18), 1] });
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(rBack, R0 + 1, 2.6, 96, 1, true, Math.PI / 2 - sd.a - sd.span / 2, sd.span), new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.5, side: THREE.DoubleSide }));
    roof.position.set(0, hTop + 6.2, FIELD_Z); roof.castShadow = true; scene.add(roof);
    const edge = new THREE.Mesh(arcGeo(R0 + 1, 0.9, sd.a, sd.span), mat(sd.color, 0.4, { side: THREE.DoubleSide }));
    edge.position.set(0, hTop + 4.6, FIELD_Z); scene.add(edge);
    for (let k = 0; k <= 8; k++) {
      const a = sd.a - sd.span / 2 + (k / 8) * sd.span;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, hTop + 7.4, 16), mat('#a9b4c3', 0.35, { metalness: 0.6 }));
      col.position.set(Math.cos(a) * (rBack - 0.4), (hTop + 7.4) / 2, FIELD_Z + Math.sin(a) * (rBack - 0.4)); col.castShadow = true; scene.add(col);
    }
  });

  // Floodlights: pole, a lamp bank tilted down at the field, and (brighter at night) a halo round the lamps.
  const glow = glowTexture();
  for (const p of FLOODLIGHTS) {
    const g = new THREE.Group();
    const steel = mat('#b9c3cf', 0.35, { metalness: 0.7 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.1, 46, 20), steel); pole.position.y = 23; g.add(pole);
    for (const y of [12, 24, 36]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9 - y * 0.008, 0.08, 6, 20), steel); ring.rotation.x = Math.PI / 2; ring.position.y = y; g.add(ring); }
    const bank = new THREE.Group(); bank.position.y = 47; bank.rotation.x = 0.42; g.add(bank); // tilted down at the field
    bank.add(new THREE.Mesh(new RoundedBoxGeometry(11, 6.2, 1.1, 4, 0.35), mat('#3c4655', 0.45, { metalness: 0.5 })));
    const lamps = new THREE.InstancedMesh(new THREE.CircleGeometry(0.5, 24), new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#f6f8ff', emissiveIntensity: night ? 9 : 1.4, toneMapped: !night }), 40);
    const m = new THREE.Matrix4();
    for (let i = 0; i < 40; i++) { m.makeTranslation(-4.5 + (i % 8) * 1.28, -2.4 + Math.floor(i / 8) * 1.2, 0.58); lamps.setMatrixAt(i, m); }
    bank.add(lamps);
    if (night) {
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#fff6e6', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      halo.scale.set(34, 26, 1); halo.position.set(0, 0, 1.2); bank.add(halo);
    }
    g.position.set(p.x, 0, p.z);
    g.lookAt(0, 0, FIELD_Z);
    shadowAll(g, true, false);
    for (const o of [lamps]) o.castShadow = false;
    scene.add(g);
  }

  // Sightscreen behind the bowler's arm, and the big screen next to it.
  const ss = new THREE.Mesh(new RoundedBoxGeometry(16, 7, 0.5, 4, 0.2), [0, 1, 2, 3].map(() => mat('#e9eef5', 0.7)).concat([new THREE.MeshStandardMaterial({ map: svgTexture(sightscreenSvg(), 1024, 512), roughness: 0.8 }), mat('#e9eef5', 0.7)]));
  ss.position.set(0, 3.6, FIELD_Z - BOUNDARY - 3); shadowAll(ss); scene.add(ss);
  const board = scoreboard();
  const screen = new THREE.Group();
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(22, 11), new THREE.MeshStandardMaterial({ map: board.tex, emissive: '#ffffff', emissiveMap: board.tex, emissiveIntensity: 0.9, roughness: 0.4 }));
  panel.position.y = 18; screen.add(panel);
  const housing = new THREE.Mesh(new RoundedBoxGeometry(23, 12, 1.2, 4, 0.4), mat('#2a2f45', 0.5)); housing.position.set(0, 18, -0.7); screen.add(housing);
  for (const x of [-7, 7]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 13, 16), mat('#a9b4c3', 0.35, { metalness: 0.6 })); leg.position.set(x, 6.5, -0.8); screen.add(leg); }
  screen.position.set(-34, 8, FIELD_Z - 96);
  screen.lookAt(0, 20, FIELD_Z);
  shadowAll(screen, true, false);
  scene.add(screen);

  // Sponsor boards: the house designs twice round; the second set of slots takes generated sponsors later.
  const boardMats = [...BOARDS, ...BOARDS].map((b) => { const tex = svgTexture(boardSvg(b), 2048, 256); return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.12 }); });
  const back = mat('#1b1b3a', 0.6);
  const n = 56, r = BOUNDARY + 3.4;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const w = (2 * Math.PI * r) / n - 0.15;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, 1.05, 0.2), [back, back, back, back, boardMats[i % boardMats.length], back]);
    b.position.set(Math.cos(a) * r, 0.55, FIELD_Z + Math.sin(a) * r);
    b.lookAt(0, 0.55, FIELD_Z);
    b.rotateX(-0.12);
    b.castShadow = true;
    scene.add(b);
  }
  // Cheering = flipping the risers to the arms-up artwork a few times a second. No per-fan work.
  let cheer = 0;
  const crowd = {
    update(t, dt) {
      cheer = Math.max(0, cheer - dt * 0.35);
      const up = cheer > 0.05 && Math.sin(t * 14) > -0.2;
      for (const c of crowdMats) { const want = up ? c.cheer : c.idle; if (c.m.map !== want) { c.m.map = want; if (c.night) c.m.emissiveMap = want; } }
    },
    cheer(amount) { cheer = Math.max(cheer, amount); },
  };
  // LED boards shine at night.
  if (night) for (const m of boardMats) m.emissiveIntensity = 0.85;
  return { crowd, board, boardMats, fasciaMats };
}


// ─────────────────────────────── foliage ───────────────────────────────
function leafyGeometry(radius, detail = 2) {
  const g = new THREE.IcosahedronGeometry(radius, detail);
  const pos = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); v.multiplyScalar(1 + (Math.sin(v.x * 3.1) * Math.cos(v.z * 2.7) + Math.sin(v.y * 4.3)) * 0.07); pos.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals();
  return g;
}
function buildFoliage(scene) {
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), e = new THREE.Euler();
  // Broadleaf trees: trunk + three clustered canopies, merged.
  const trunk = new THREE.CylinderGeometry(0.35, 0.55, 4, 10).translate(0, 2, 0);
  const canopy = mergeGeometries([leafyGeometry(2.6).translate(0, 5.4, 0), leafyGeometry(2).translate(1.6, 4.6, 0.6), leafyGeometry(2.1).translate(-1.4, 4.8, -0.5), leafyGeometry(1.7).translate(0.2, 7, 0.3)]);
  // Pines: stacked cones.
  const pine = mergeGeometries([0, 1, 2, 3].map((i) => new THREE.ConeGeometry(2.6 - i * 0.55, 3, 14).translate(0, 3 + i * 1.7, 0)));
  const spots = [];
  for (let i = 0; i < 140; i++) {
    const a = rand() * Math.PI * 2, r = 112 + rand() * 120;
    const x = Math.cos(a) * r, z = FIELD_Z + Math.sin(a) * r;
    if (z > 40 && Math.abs(x) < 60) continue; // keep the view clean behind the camera
    spots.push({ x, z, s: 0.8 + rand() * 0.9, kind: rand() < 0.35 ? 'pine' : 'leaf', ry: rand() * 6.28 });
  }
  const leaf = spots.filter((t) => t.kind === 'leaf'), pines = spots.filter((t) => t.kind === 'pine');
  const tIM = new THREE.InstancedMesh(trunk, mat('#7a4b25', 0.9), spots.length);
  const cIM = new THREE.InstancedMesh(canopy, mat('#3fae2e', 0.8), leaf.length);
  const pIM = new THREE.InstancedMesh(pine, mat('#2c8f3a', 0.8), pines.length);
  const col = new THREE.Color();
  spots.forEach((t, i) => { m.compose(p.set(t.x, 0, t.z), q.setFromEuler(e.set(0, t.ry, 0)), s.setScalar(t.s)); tIM.setMatrixAt(i, m); });
  leaf.forEach((t, i) => { m.compose(p.set(t.x, 0, t.z), q.setFromEuler(e.set(0, t.ry, 0)), s.setScalar(t.s)); cIM.setMatrixAt(i, m); cIM.setColorAt(i, col.set('#3fae2e').offsetHSL((rand() - 0.5) * 0.04, 0, (rand() - 0.5) * 0.12)); });
  pines.forEach((t, i) => { m.compose(p.set(t.x, 0, t.z), q.setFromEuler(e.set(0, t.ry, 0)), s.setScalar(t.s)); pIM.setMatrixAt(i, m); });
  for (const im of [tIM, cIM, pIM]) { im.castShadow = true; im.receiveShadow = true; scene.add(im); }

}

// ─────────────────────────────── farm beyond the ground ───────────────────────────────
function buildFarm(scene) {
  const hill = mat('#74d84f', 0.95);
  for (const [x, z, r] of [[-120, -150, 70], [10, -175, 90], [140, -140, 70], [-190, -30, 60], [190, -40, 64], [-160, 90, 60], [160, 90, 60]]) {
    const h = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2), hill);
    h.scale.y = 0.42; h.position.set(x, -r * 0.12, z); h.receiveShadow = true; scene.add(h);
  }
  // Red barn + silo on the far hill, visible between the stands.
  const barn = new THREE.Group();
  const red = mat('#e23a2e', 0.6), white = mat('#fbfbf6', 0.6);
  const body = new THREE.Mesh(new RoundedBoxGeometry(16, 10, 12, 4, 0.4), red); body.position.y = 5; barn.add(body);
  const shape = new THREE.Shape(); shape.moveTo(-8.6, 0); shape.lineTo(-6.6, 3.8); shape.lineTo(0, 6.2); shape.lineTo(6.6, 3.8); shape.lineTo(8.6, 0); shape.lineTo(-8.6, 0);
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 13, bevelEnabled: true, bevelSize: 0.3, bevelThickness: 0.3 }), mat('#6b3f22', 0.7));
  roof.position.set(0, 10, -6.5); barn.add(roof);
  const door = new THREE.Mesh(new RoundedBoxGeometry(6, 7, 0.4, 2, 0.1), white); door.position.set(0, 3.5, 6.05); barn.add(door);
  const silo = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 18, 32), white); silo.position.set(11, 9, 0); barn.add(silo);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(3.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), red); dome.position.set(11, 18, 0); barn.add(dome);
  barn.position.set(-112, 0, -128); barn.rotation.y = 0.6; shadowAll(barn); scene.add(barn);
  // Windmill
  const mill = new THREE.Group();
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 3, 16, 20), white); tower.position.y = 8; mill.add(tower);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(2.6, 3.5, 20), red); cap.position.y = 17.6; mill.add(cap);
  const blades = new THREE.Group(); blades.position.set(0, 15.5, 2.8);
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new RoundedBoxGeometry(1.2, 8, 0.25, 2, 0.1), mat('#8a5a2b', 0.8)); b.position.y = 4; const arm = new THREE.Group(); arm.add(b); arm.rotation.z = (i * Math.PI) / 2; blades.add(arm); }
  mill.add(blades);
  mill.position.set(128, 0, -112); mill.rotation.y = -0.7; shadowAll(mill); scene.add(mill);
  scene.userData.windmill = blades;
}

function buildClouds(scene) {
  const cm = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.35, roughness: 1 });
  const puff = mergeGeometries([[0, 0, 0, 9], [10, -1.5, 0, 7], [-10, -2, 0, 7.5], [4, 4, 0, 6.5], [-5, 3, 0, 6]].map(([x, y, z, r]) => new THREE.IcosahedronGeometry(r, 2).translate(x, y, z)));
  for (let i = 0; i < 12; i++) {
    const c = new THREE.Mesh(puff, cm);
    const a = -Math.PI / 2 + (rand() - 0.5) * 2.6;
    c.position.set(Math.cos(a) * 330, 70 + rand() * 60, Math.sin(a) * 330);
    c.scale.setScalar(1 + rand());
    scene.add(c);
  }
}
