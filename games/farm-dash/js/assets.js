// Procedural asset factory: every texture, material and mesh is generated at runtime.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export const TRAIN_H = 3.0;       // walkable roof height
export const TRAIN_W = 2.3;
export const CAR_LEN = 7.6;
export const CAR_GAP = 0.5;
export const RAMP_LEN = 6;

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const SPRAY = ['#ff3b8d', '#29e0ff', '#b6ff2e', '#ffd400', '#ff7a00', '#9b5cff', '#ffffff', '#ff4040'];
const TAGS = ['RUN', 'ZAP', 'YO!', 'WOW', 'GO!', 'FLY', 'DASH', 'BOOM', 'HEY', 'RAD', 'ZOOM', 'POW'];

function canvasTex(w, h, draw, { repeat = false } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function noise(g, w, h, count, colors, size = [1, 3]) {
  for (let i = 0; i < count; i++) {
    g.fillStyle = pick(colors);
    const s = rand(size[0], size[1]);
    g.fillRect(Math.random() * w, Math.random() * h, s, s);
  }
}

function graffiti(g, x, y, w, h) {
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (let i = 0; i < 3; i++) {
    g.lineWidth = rand(3, 8);
    g.strokeStyle = pick(SPRAY);
    g.beginPath();
    let px = x + rand(0, w * 0.2);
    g.moveTo(px, y + rand(h * 0.3, h * 0.7));
    for (let k = 0; k < 6; k++) {
      const nx = px + rand(w * 0.05, w * 0.16);
      g.quadraticCurveTo(px + rand(-20, 40), y + rand(0, h), nx, y + rand(0, h));
      px = nx;
    }
    g.stroke();
  }
  const word = pick(TAGS);
  const size = Math.floor(h * 0.55);
  g.font = `900 ${size}px Impact, "Arial Black", sans-serif`;
  const tx = x + rand(w * 0.05, w * 0.4), ty = y + h * 0.5 + size * 0.35;
  g.save();
  g.translate(tx, ty);
  g.rotate(rand(-0.15, 0.15));
  g.lineWidth = size * 0.22;
  g.strokeStyle = '#111';
  g.strokeText(word, 0, 0);
  const grad = g.createLinearGradient(0, -size, 0, 0);
  grad.addColorStop(0, pick(SPRAY));
  grad.addColorStop(1, pick(SPRAY));
  g.fillStyle = grad;
  g.fillText(word, 0, 0);
  g.lineWidth = 2;
  g.strokeStyle = '#fff';
  g.strokeText(word, 0, 0);
  g.restore();
}

// ---------- textures ----------

function trainSideTex(base) {
  return canvasTex(512, 172, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, 0, w, 10);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, h - 26, w, 26);
    g.fillStyle = '#eee'; g.fillRect(0, h - 38, w, 6);
    // windows
    for (let i = 0; i < 5; i++) {
      const x = 22 + i * 98;
      g.fillStyle = '#1d2a3a'; g.fillRect(x, 24, 70, 46);
      g.fillStyle = 'rgba(160,210,255,0.35)';
      g.beginPath(); g.moveTo(x + 6, 66); g.lineTo(x + 40, 28); g.lineTo(x + 54, 28); g.lineTo(x + 20, 66); g.fill();
      g.strokeStyle = '#ccc'; g.lineWidth = 3; g.strokeRect(x, 24, 70, 46);
    }
    // door
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(232, 20, 52, h - 46);
    g.strokeStyle = '#ddd'; g.lineWidth = 2; g.strokeRect(232, 20, 52, h - 46); g.beginPath(); g.moveTo(258, 20); g.lineTo(258, h - 26); g.stroke();
    noise(g, w, h, 500, ['rgba(0,0,0,0.08)', 'rgba(255,255,255,0.05)']);
    graffiti(g, rand(10, 120), 76, 260, 64);
    if (Math.random() < 0.6) graffiti(g, rand(290, 340), 80, 170, 56);
  });
}

function trainFrontTex(base) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffd400';
    for (let i = -4; i < 10; i++) { g.beginPath(); g.moveTo(i * 36, h); g.lineTo(i * 36 + 18, h); g.lineTo(i * 36 + 58, h - 44); g.lineTo(i * 36 + 40, h - 44); g.fill(); }
    g.fillStyle = '#222'; g.fillRect(0, h - 48, w, 4);
    g.fillStyle = '#1a2533'; g.fillRect(26, 26, w - 52, 92);
    g.fillStyle = 'rgba(170,220,255,0.3)'; g.beginPath(); g.moveTo(40, 110); g.lineTo(120, 30); g.lineTo(150, 30); g.lineTo(70, 110); g.fill();
    g.strokeStyle = '#ddd'; g.lineWidth = 6; g.strokeRect(26, 26, w - 52, 92);
    g.fillStyle = '#111'; g.fillRect(88, 132, 80, 32);
    g.fillStyle = '#ffb000'; g.font = 'bold 26px monospace'; g.textAlign = 'center'; g.fillText(String(Math.floor(rand(10, 99))), 128, 157);
    for (const x of [44, 212]) {
      const rg = g.createRadialGradient(x, 172, 2, x, 172, 22);
      rg.addColorStop(0, '#fffbe0'); rg.addColorStop(0.5, '#ffe680'); rg.addColorStop(1, 'rgba(255,200,0,0)');
      g.fillStyle = rg; g.beginPath(); g.arc(x, 172, 22, 0, Math.PI * 2); g.fill();
    }
  });
}

function gravelTex() {
  // track bed: gravel + wooden sleepers for three lanes. Spans x -6.5..6.5, 4 units per tile.
  return canvasTex(512, 160, (g, w, h) => {
    g.fillStyle = '#6d6259'; g.fillRect(0, 0, w, h);
    noise(g, w, h, 9000, ['#5a5048', '#80766c', '#4b433c', '#948a7f', '#3e3832'], [1.5, 4]);
    const ppu = w / 13;
    for (const lx of [-2.5, 0, 2.5]) {
      const cx = (lx + 6.5) * ppu;
      for (const sy of [20, 100]) {
        g.fillStyle = '#4a3423'; g.fillRect(cx - 1.25 * ppu, sy, 2.5 * ppu, 30);
        g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(cx - 1.25 * ppu, sy, 2.5 * ppu, 5);
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(cx - 1.25 * ppu, sy + 25, 2.5 * ppu, 5);
        for (let k = 0; k < 4; k++) { g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(cx - 1.2 * ppu + Math.random() * 2.3 * ppu, sy + 6 + Math.random() * 18, rand(10, 30), 2); }
      }
    }
  }, { repeat: true });
}

function wallTex() {
  return canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = '#9a9184'; g.fillRect(0, 0, w, h);
    noise(g, w, h, 2500, ['#8a8174', '#aaa194', '#7d7569']);
    g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2;
    for (let x = 0; x < w; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 0, w, 6);
    graffiti(g, rand(0, 60), 18, 220, 90);
    graffiti(g, rand(260, 300), 22, 200, 84);
  });
}

function windowsTex(base, lit) {
  return canvasTex(128, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    noise(g, w, h, 400, ['rgba(0,0,0,0.1)', 'rgba(255,255,255,0.06)']);
    for (let y = 8; y < h; y += 32) for (let x = 8; x < w; x += 30) {
      g.fillStyle = Math.random() < lit ? '#ffe9a8' : '#2d3d52';
      g.fillRect(x, y, 18, 22);
      g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(x, y, 18, 3);
    }
  }, { repeat: true });
}

function stripeTex(c1, c2, n = 8, diagonal = false) {
  return canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = c1; g.fillRect(0, 0, w, h);
    g.fillStyle = c2;
    const s = w / n;
    for (let i = -2; i < n + 2; i += 2) {
      g.beginPath();
      if (diagonal) { g.moveTo(i * s, h); g.lineTo((i + 1) * s, h); g.lineTo((i + 2) * s, 0); g.lineTo((i + 1) * s, 0); }
      else { g.rect(i * s, 0, s, h); }
      g.fill();
    }
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 4; g.strokeRect(0, 0, w, h);
  });
}

function coinFaceTex() {
  return canvasTex(128, 128, (g, w) => {
    const rg = g.createRadialGradient(54, 50, 8, 64, 64, 64);
    rg.addColorStop(0, '#fff6a8'); rg.addColorStop(0.6, '#ffc61a'); rg.addColorStop(1, '#c98a00');
    g.fillStyle = rg; g.fillRect(0, 0, w, w);
    g.strokeStyle = '#b07400'; g.lineWidth = 8; g.beginPath(); g.arc(64, 64, 52, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#e6a100'; g.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 16 : 36, a = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); }
    g.fill(); g.strokeStyle = '#fff3a0'; g.lineWidth = 3; g.stroke();
  });
}

function labelTex(text, bg, fg) {
  return canvasTex(128, 128, (g, w) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, w);
    g.fillStyle = fg; g.font = '900 64px "Arial Black", Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 10; g.strokeStyle = '#000'; g.strokeText(text, 64, 68); g.fillText(text, 64, 68);
  });
}

function glowTex() {
  return canvasTex(64, 64, (g, w) => {
    const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.3, 'rgba(255,255,255,0.5)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rg; g.fillRect(0, 0, w, w);
  });
}

function wheelTex() {
  // spokes make wheel spin visible
  return canvasTex(64, 64, (g, w) => {
    g.fillStyle = '#9da1a8'; g.fillRect(0, 0, w, w);
    g.strokeStyle = '#3a3d42'; g.lineWidth = 6;
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; g.beginPath(); g.moveTo(32 - Math.cos(a) * 30, 32 - Math.sin(a) * 30); g.lineTo(32 + Math.cos(a) * 30, 32 + Math.sin(a) * 30); g.stroke(); }
    g.fillStyle = '#ff5a3a'; g.beginPath(); g.arc(32, 32, 7, 0, Math.PI * 2); g.fill();
  });
}

function arrowTex() {
  return canvasTex(64, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(80,255,170,0.95)';
    for (const y of [10, 74]) { g.beginPath(); g.moveTo(8, y + 40); g.lineTo(32, y + 12); g.lineTo(56, y + 40); g.lineTo(56, y + 52); g.lineTo(32, y + 26); g.lineTo(8, y + 52); g.fill(); }
  }, { repeat: true });
}

function skyTex() {
  return canvasTex(16, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#2b8cff'); gr.addColorStop(0.55, '#8fd0ff'); gr.addColorStop(0.8, '#ffe2b8'); gr.addColorStop(1, '#ffd29a');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}

// ---------- asset bundle ----------

export function createAssets() {
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.7, ...o });
  const trainColors = ['#2f6fd6', '#d63a2f', '#e0a020', '#2f9e5a', '#8a4fd6', '#e46a1c', '#1aa3b8'];
  const trainSkins = trainColors.map((c) => {
    const side = std({ map: trainSideTex(c), roughness: 0.45, metalness: 0.3 });
    return {
      side,
      sideAlt: std({ map: trainSideTex(c), roughness: 0.45, metalness: 0.3 }),
      front: std({ map: trainFrontTex(c), roughness: 0.4, metalness: 0.3, emissive: '#332200', emissiveIntensity: 0.4 }),
      end: std({ color: c, roughness: 0.5, metalness: 0.3 }),
      roof: std({ color: new THREE.Color(c).lerp(new THREE.Color('#cccccc'), 0.55), roughness: 0.6, metalness: 0.4 }),
    };
  });

  const mat = {
    dark: std({ color: '#26272b', roughness: 0.8 }),
    steel: std({ color: '#c9ccd2', metalness: 0.9, roughness: 0.25 }),
    rail: std({ color: '#b8b2aa', metalness: 0.85, roughness: 0.3 }),
    post: std({ color: '#d8d8d8', metalness: 0.5, roughness: 0.4 }),
    hurdle: std({ map: stripeTex('#f4f4f4', '#e0262b', 8) }),
    overhead: std({ map: stripeTex('#ffd400', '#1a1a1a', 8, true) }),
    ramp: std({ map: stripeTex('#7d8288', '#5e636a', 16), metalness: 0.6, roughness: 0.45 }),
    coinFace: std({ map: coinFaceTex(), metalness: 0.6, roughness: 0.3, emissive: '#5a3c00', emissiveIntensity: 0.5 }),
    coinEdge: std({ color: '#e0a300', metalness: 0.8, roughness: 0.3, emissive: '#4a3000', emissiveIntensity: 0.5 }),
    gravel: std({ map: gravelTex(), roughness: 1 }),
    ground: std({ color: '#5b6b4a', roughness: 1 }),
    concrete: std({ color: '#8f8a82', roughness: 0.95 }),
    bulb: new THREE.MeshBasicMaterial({ color: '#fff3c4' }),
    headlight: new THREE.MeshBasicMaterial({ color: '#fffbd0', fog: false }),
    halo: new THREE.SpriteMaterial({ map: glowTex(), color: '#fff2a8', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
    wheel: std({ color: '#9da1a8', metalness: 0.8, roughness: 0.35, map: wheelTex() }),
    tailOn: new THREE.MeshBasicMaterial({ color: '#ff2a2a' }),
    tailOff: new THREE.MeshBasicMaterial({ color: '#5a1010' }),
    amberOn: new THREE.MeshBasicMaterial({ color: '#ffb300' }),
    amberOff: new THREE.MeshBasicMaterial({ color: '#6b4a10' }),
    amberHalo: new THREE.SpriteMaterial({ map: glowTex(), color: '#ffb300', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
    beacon: new THREE.MeshBasicMaterial({ color: '#ffa31a' }),
    beam: new THREE.MeshBasicMaterial({ color: '#ffb43a', transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    redBeacon: new THREE.MeshBasicMaterial({ color: '#ff3020' }),
    redBeam: new THREE.MeshBasicMaterial({ color: '#ff3a2a', transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    arrows: new THREE.MeshBasicMaterial({ map: arrowTex(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }),
    walls: [0, 1, 2, 3, 4].map(() => std({ map: wallTex() })),
    buildings: ['#c26b4f', '#a7a29a', '#6f7f99', '#d4b483', '#8a5a44', '#5e7f6e'].map((c) => windowsTex(c, 0.25)),
    bubble: (color) => new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.28, emissive: color, emissiveIntensity: 0.6, roughness: 0.1, depthWrite: false }),
  };
  mat.gravel.map.repeat.set(1, 1);
  mat.overhead.map.wrapS = THREE.RepeatWrapping;

  const geo = {
    car: new THREE.BoxGeometry(TRAIN_W, TRAIN_H - 0.45, CAR_LEN),
    carRoof: new THREE.BoxGeometry(TRAIN_W * 0.7, 0.12, CAR_LEN * 0.9),
    bogie: new THREE.BoxGeometry(1.8, 0.45, 1.8),
    wheel: new THREE.CylinderGeometry(0.28, 0.28, 0.2, 14).rotateZ(Math.PI / 2),
    coupler: new THREE.BoxGeometry(0.5, 0.3, CAR_GAP + 0.2),
    headlight: new THREE.CircleGeometry(0.26, 16),
    marker: new THREE.CircleGeometry(0.12, 12),
    lampDome: new THREE.SphereGeometry(0.09, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    beaconBase: new THREE.CylinderGeometry(0.12, 0.14, 0.1, 12),
    beaconBulb: new THREE.SphereGeometry(0.1, 12, 10),
    beam: (() => {   // two opposed light cones lying flat, spun around y
      const c = new THREE.ConeGeometry(0.5, 2.4, 12, 1, true);
      c.translate(0, -1.2, 0); c.rotateZ(Math.PI / 2);
      const c2 = c.clone().rotateY(Math.PI);
      const merged = new THREE.BufferGeometry();
      const pos = new Float32Array([...c.attributes.position.array, ...c2.attributes.position.array]);
      merged.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const idx = [...c.index.array]; const off = c.attributes.position.count;
      for (const i of c2.index.array) idx.push(i + off);
      merged.setIndex(idx);
      return merged;
    })(),
    arrowStrip: new THREE.PlaneGeometry(0.9, Math.hypot(RAMP_LEN, TRAIN_H)),
    coin: new THREE.CylinderGeometry(0.38, 0.38, 0.09, 24).rotateX(Math.PI / 2),
    hurdlePost: new THREE.BoxGeometry(0.14, 1.05, 0.14),
    hurdleBoard: new THREE.BoxGeometry(2.3, 0.42, 0.1),
    overheadPost: new THREE.BoxGeometry(0.18, 3.4, 0.18),
    overheadPanel: new THREE.BoxGeometry(2.4, 1.5, 0.16),
    ramp: (() => {
      const s = new THREE.Shape();
      s.moveTo(0, 0); s.lineTo(RAMP_LEN, 0); s.lineTo(0, TRAIN_H); s.closePath();
      const g = new THREE.ExtrudeGeometry(s, { depth: 2.2, bevelEnabled: false });
      g.rotateY(-Math.PI / 2); g.translate(1.1, 0, 0);
      return g;
    })(),
  };

  const shadowed = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };

  function makeTrain(cars, { moving = false } = {}) {
    const skin = pick(trainSkins);
    const group = new THREE.Group();
    const wheels = [], bodies = [];
    for (let i = 0; i < cars; i++) {
      const z0 = -i * (CAR_LEN + CAR_GAP);
      const mats = [skin.side, skin.sideAlt, skin.roof, mat.dark, i === 0 ? skin.front : skin.end, skin.end];
      const car = shadowed(new THREE.Mesh(geo.car, mats));
      car.position.set(0, 0.45 + (TRAIN_H - 0.45) / 2, z0 - CAR_LEN / 2);
      group.add(car);
      bodies.push(car);
      const roof = new THREE.Mesh(geo.carRoof, skin.roof);
      roof.position.set(0, TRAIN_H + 0.02, z0 - CAR_LEN / 2);
      group.add(roof);
      for (const bz of [z0 - 1.4, z0 - CAR_LEN + 1.4]) {
        const b = new THREE.Mesh(geo.bogie, mat.dark); b.position.set(0, 0.28, bz); group.add(b);
        for (const wx of [-0.75, 0.75]) for (const wz of [-0.5, 0.5]) {
          const w = new THREE.Mesh(geo.wheel, mat.wheel); w.position.set(wx, 0.28, bz + wz); group.add(w);
          wheels.push(w);
        }
      }
      if (i > 0) { const c = new THREE.Mesh(geo.coupler, mat.dark); c.position.set(0, 0.8, z0 + CAR_GAP / 2); group.add(c); }
    }
    const length = cars * CAR_LEN + (cars - 1) * CAR_GAP;

    // red tail markers on the last car blink slowly on every train
    const tails = [-0.8, 0.8].map((x) => {
      const t = new THREE.Mesh(geo.marker, mat.tailOn);
      t.position.set(x, 0.9, -length - 0.01);
      t.rotation.y = Math.PI;
      group.add(t);
      return t;
    });
    const phase = Math.random() * 10;

    if (!moving) {
      group.userData.tick = (dt, time) => {
        const on = Math.sin(time * 2.5 + phase) > 0;
        for (const t of tails) t.material = on ? mat.tailOn : mat.tailOff;
      };
      return { group, length };
    }

    // oncoming train: halo headlights, roof beacon, spinning wheels, rocking body
    const halos = [-0.75, 0.75].map((x) => {
      const glow = new THREE.Mesh(geo.headlight, mat.headlight);
      glow.position.set(x, 1.1, 0.05);
      group.add(glow);
      const halo = new THREE.Sprite(mat.halo);
      halo.position.set(x, 1.1, 0.4);
      halo.scale.setScalar(2.2);
      group.add(halo);
      return halo;
    });
    const beacon = new THREE.Group();
    beacon.position.set(0, TRAIN_H + 0.12, -0.8);
    beacon.add(new THREE.Mesh(geo.beaconBase, mat.dark));
    const bulb = new THREE.Mesh(geo.beaconBulb, mat.beacon); bulb.position.y = 0.16; beacon.add(bulb);
    const beam = new THREE.Mesh(geo.beam, mat.beam); beam.position.set(0, 0.16, 0); beacon.add(beam);
    group.add(beacon);
    group.userData.tick = (dt, time) => {
      for (const w of wheels) w.rotation.x -= dt * 22;
      for (const b of bodies) { b.rotation.z = Math.sin(time * 9 + phase) * 0.012; b.position.y = 0.45 + (TRAIN_H - 0.45) / 2 + Math.abs(Math.sin(time * 14)) * 0.02; }
      beam.rotation.y += dt * 7;
      const flash = Math.floor(time * 6) % 2;
      halos[0].scale.setScalar(flash ? 2.6 : 1.6);
      halos[1].scale.setScalar(flash ? 1.6 : 2.6);
      for (const t of tails) t.material = mat.tailOn;
    };
    return { group, length };
  }

  function makeRamp() {
    const g = new THREE.Group();
    g.add(shadowed(new THREE.Mesh(geo.ramp, mat.ramp)));
    const slope = Math.atan2(TRAIN_H, RAMP_LEN), len = Math.hypot(RAMP_LEN, TRAIN_H);
    for (const x of [-1.15, 1.15]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, len), mat.post);
      rail.position.set(x, TRAIN_H / 2 + 0.35, RAMP_LEN / 2);
      rail.rotation.x = slope;
      g.add(rail);
    }
    // glowing arrow strip that scrolls up the ramp (texture offset animated in World)
    const arrows = new THREE.Mesh(geo.arrowStrip, mat.arrows);
    arrows.position.set(0, TRAIN_H / 2 + 0.03, RAMP_LEN / 2);
    arrows.rotation.x = -Math.PI / 2 + slope;
    g.add(arrows);
    return g;
  }

  function makeHurdle() {
    const g = new THREE.Group();
    for (const x of [-1.05, 1.05]) { const p = shadowed(new THREE.Mesh(geo.hurdlePost, mat.post)); p.position.set(x, 0.52, 0); g.add(p); }
    for (const y of [0.78, 0.3]) { const b = shadowed(new THREE.Mesh(geo.hurdleBoard, mat.hurdle)); b.position.set(0, y, 0); g.add(b); }
    // amber warning lamps on the posts, blinking alternately
    const lamps = [-1.05, 1.05].map((x) => {
      const l = new THREE.Mesh(geo.lampDome, mat.amberOn); l.position.set(x, 1.08, 0); g.add(l);
      const h = new THREE.Sprite(mat.amberHalo); h.position.set(x, 1.1, 0.05); h.scale.setScalar(0.8); g.add(h);
      return { l, h };
    });
    const phase = Math.random() * 10;
    g.userData.tick = (dt, time) => {
      const a = Math.floor(time * 4 + phase) % 2 === 0;
      lamps[0].l.material = a ? mat.amberOn : mat.amberOff; lamps[0].h.visible = a;
      lamps[1].l.material = a ? mat.amberOff : mat.amberOn; lamps[1].h.visible = !a;
    };
    return g;
  }

  function makeOverhead() {
    const g = new THREE.Group();
    for (const x of [-1.15, 1.15]) { const p = shadowed(new THREE.Mesh(geo.overheadPost, mat.post)); p.position.set(x, 1.7, 0); g.add(p); }
    const panel = shadowed(new THREE.Mesh(geo.overheadPanel, mat.overhead)); panel.position.set(0, 2.1, 0); g.add(panel);
    // rotating warning beacon on top
    const beacon = new THREE.Group(); beacon.position.set(0, 2.95, 0); g.add(beacon);
    beacon.add(new THREE.Mesh(geo.beaconBase, mat.dark));
    const bulb = new THREE.Mesh(geo.beaconBulb, mat.redBeacon); bulb.position.y = 0.16; beacon.add(bulb);
    const beam = new THREE.Mesh(geo.beam, mat.redBeam); beam.position.y = 0.16; beacon.add(beam);
    const phase = Math.random() * 10;
    g.userData.tick = (dt, time) => {
      beam.rotation.y = time * 6 + phase;
      bulb.scale.setScalar(1 + Math.max(0, Math.sin(time * 12 + phase)) * 0.25);
    };
    return g;
  }

  function makeCoin() {
    const m = new THREE.Mesh(geo.coin, [mat.coinEdge, mat.coinFace, mat.coinFace]);
    m.castShadow = true;
    return m;
  }

  const powerupDefs = {
    magnet: { color: '#ff3b3b', build() {
      const g = new THREE.Group();
      const u = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.11, 10, 20, Math.PI), std({ color: '#e22', metalness: 0.4, roughness: 0.3 }));
      u.rotation.z = Math.PI; g.add(u);
      for (const x of [-0.3, 0.3]) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.24), mat.steel); t.position.set(x, 0.08, 0); g.add(t); }
      return g;
    } },
    double: { color: '#a24bff', build() {
      return new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), std({ map: labelTex('2X', '#a24bff', '#ffe14d'), emissive: '#301050', emissiveIntensity: 0.6 }));
    } },
    sneakers: { color: '#21d07a', build() {
      const g = new THREE.Group(), m = std({ color: '#21d07a' }), w = std({ color: '#ffffff' });
      const a = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.4), m); a.position.set(0, 0.1, 0.06); g.add(a);
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.36), m); b.position.set(0, -0.02, -0.3); g.add(b);
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.8), w); s.position.set(0, -0.12, -0.1); g.add(s);
      const wing = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.4, 4), w); wing.rotation.z = Math.PI / 2.4; wing.position.set(0.24, 0.2, 0.1); g.add(wing);
      g.rotation.y = Math.PI / 2;
      return g;
    } },
  };

  function makePowerup(type) {
    const def = powerupDefs[type];
    const g = new THREE.Group();
    const icon = def.build(); g.add(icon);
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.6, 20, 14), mat.bubble(def.color));
    g.add(bubble);
    g.userData.icon = icon;
    g.userData.bubble = bubble;
    return g;
  }

  return { mat, geo, sky: skyTex(), makeTrain, makeRamp, makeHurdle, makeOverhead, makeCoin, makePowerup, rand, pick };
}
