// Bumper Carts - the barn-dance floor: sky, lights, polished plank disc with a painted star, 16 picket fence
// panels (whole / cracked / falling, instanced) on posts, mud moat, barn, string lights, hay-bale stands with
// a small instanced animal crowd, and a results podium. All procedural.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { toon, mesh, place, merged, canvasTex, strawTexture, woodTexture, rng, INK } from './world/toon.js';
import { ARENA, FENCE } from './constants.js';

const PI = Math.PI, TAU = PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

const R = FENCE.radius;
const FLOOR_R = ARENA.radius + 0.35;
const MUD_Y = ARENA.mudY;
const MOAT_OUT = ARENA.moatOuter;
const ARC = TAU / FENCE.panels;
const PANEL_W = 2 * R * Math.sin(ARC / 2) - 0.26;
const PANEL_H = 0.95;

function skyDome() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#3f9df5') }, mid: { value: new THREE.Color('#9fd6ff') }, bottom: { value: new THREE.Color('#ffe9c4') } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP;
      void main(){ float h = vP.y; vec3 c = h > 0.15 ? mix(mid, top, smoothstep(0.15, 0.7, h)) : mix(bottom, mid, smoothstep(-0.02, 0.15, h));
      gl_FragColor = vec4(c, 1.0); }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), mat);
  m.renderOrder = -10;
  m.frustumCulled = false;
  return m;
}

function mudMaterial() {
  const ripples = [];
  for (let k = 0; k < 8; k++) ripples.push(new THREE.Vector4(0, 0, -100, 0));
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }, ripples: { value: ripples }, innerR: { value: FLOOR_R }, outerR: { value: MOAT_OUT },
      light: { value: new THREE.Color('#8a5a33') }, dark: { value: new THREE.Color('#5e3a1d') }, foam: { value: new THREE.Color('#b0814f') },
    },
    vertexShader: `varying vec2 vXZ; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vXZ = w.xz;
      gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float time; uniform vec4 ripples[8]; uniform float innerR; uniform float outerR;
      uniform vec3 light; uniform vec3 dark; uniform vec3 foam; varying vec2 vXZ;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
      void main(){
        float r = length(vXZ);
        float n = noise(vXZ * 0.7 + vec2(time * 0.05, time * 0.03)) + 0.5 * noise(vXZ * 1.9 - vec2(time * 0.04, 0.0));
        vec3 c = mix(dark, light, step(0.75, n) * 0.6 + step(1.1, n) * 0.4);
        // slow gloopy bubbles
        vec2 cell = floor(vXZ * 0.8); vec2 f = fract(vXZ * 0.8) - 0.5;
        float ph = fract(time * 0.25 + hash(cell));
        float bub = 1.0 - smoothstep(0.05, 0.09, abs(length(f) - ph * 0.35));
        c = mix(c, foam, bub * (1.0 - ph) * step(0.7, hash(cell + 3.1)) * 0.8);
        // wet edge against the floor skirt and the bank
        float lap = 0.5 + 0.5 * sin(time * 1.4 + atan(vXZ.y, vXZ.x) * 11.0);
        c = mix(c, foam, (1.0 - smoothstep(0.0, 0.18 + 0.08 * lap, r - innerR)) * 0.7);
        c = mix(c, dark * 0.8, smoothstep(outerR - 0.6, outerR, r));
        for (int k = 0; k < 8; k++) {
          vec4 R = ripples[k];
          float age = time - R.z;
          if (age < 0.0 || age > 2.5) continue;
          float d = length(vXZ - R.xy);
          for (int j = 0; j < 3; j++) {
            float rad = (age - float(j) * 0.3) * (1.2 + R.w * 0.6);
            if (rad <= 0.0) continue;
            float band = 1.0 - smoothstep(0.06, 0.2, abs(d - rad));
            c = mix(c, foam, band * (1.0 - age / 2.5) * 0.9);
          }
        }
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

/** Plank floor with a painted star and a chequer rim band (square canvas -> cylinder top cap UVs). */
function floorTexture() {
  return canvasTex(1024, 1024, (g, w) => {
    const r = rng(21);
    const n = 22, ph = w / n;
    for (let k = 0; k < n; k++) {
      const tones = ['#d99a5b', '#cf8c4f', '#e2a868', '#c98547'];
      g.fillStyle = tones[k % 4]; g.fillRect(0, k * ph, w, ph);
      for (let s = 0; s < 14; s++) {
        g.strokeStyle = r() < 0.5 ? 'rgba(120,70,30,0.25)' : 'rgba(255,230,190,0.25)';
        g.lineWidth = 1 + r() * 1.5;
        const y = k * ph + r() * ph;
        g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 3, w * 0.6, y - 3, w, y + 1); g.stroke();
      }
      g.fillStyle = '#7a4a24'; g.fillRect(0, k * ph, w, 2);
      // butt joints, staggered
      const off = (k % 3) * w * 0.27;
      for (let x = off; x < w; x += w * 0.42) { g.fillRect(x, k * ph, 2, ph); g.beginPath(); g.arc(x + 8, k * ph + ph / 2, 2.2, 0, 7); g.arc(x - 8, k * ph + ph / 2, 2.2, 0, 7); g.fill(); }
    }
    // polish sheen
    const sh = g.createRadialGradient(w * 0.4, w * 0.35, 10, w * 0.5, w * 0.5, w * 0.55);
    sh.addColorStop(0, 'rgba(255,255,255,0.18)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = sh; g.fillRect(0, 0, w, w);
    const cx = w / 2, cy = w / 2;
    // chequer rim band
    const segs = 64;
    for (let k = 0; k < segs; k++) {
      g.fillStyle = k % 2 ? '#ffffff' : '#ff3b30';
      g.beginPath(); g.arc(cx, cy, w * 0.49, (k / segs) * TAU, ((k + 1) / segs) * TAU); g.arc(cx, cy, w * 0.455, ((k + 1) / segs) * TAU, (k / segs) * TAU, true); g.fill();
    }
    // inner ring
    g.strokeStyle = '#ffffff'; g.lineWidth = 8;
    g.beginPath(); g.arc(cx, cy, w * 0.2, 0, TAU); g.stroke();
    // painted star
    const star = (rad, col) => {
      g.fillStyle = col; g.beginPath();
      for (let k = 0; k < 10; k++) {
        const rr = k % 2 ? rad * 0.45 : rad, a = (k / 10) * TAU - PI / 2;
        if (k) g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); else g.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      g.closePath(); g.fill();
    };
    star(w * 0.17, '#1b1b3a');
    star(w * 0.155, '#ff3b30');
    star(w * 0.12, '#ffd21f');
    g.globalAlpha = 0.2; g.fillStyle = '#7a4a24';
    for (let k = 0; k < 400; k++) g.fillRect(r() * w, r() * w, 2, 2);
    g.globalAlpha = 1;
  });
}

/** One picket panel: origin at the bottom centre, spans x, faces +z (inward once placed). */
function panelGeo(cracked, seed) {
  const rr = rng(seed);
  const parts = [];
  const n = 7, pw = 0.17, gap = (PANEL_W - n * pw) / (n - 1);
  for (let k = 0; k < n; k++) {
    const x = -PANEL_W / 2 + pw / 2 + k * (pw + gap);
    if (cracked && k === 4) {
      // snapped picket: a short jagged stub
      parts.push([place(new THREE.BoxGeometry(pw, 0.32, 0.05), [x, 0.16, 0]), '#fbf7ef']);
      parts.push([place(new THREE.ConeGeometry(0.1, 0.14, 3), [x, 0.36, 0], [0, 0, 0.5]), '#e8dfcd']);
      continue;
    }
    const tilt = cracked && (k === 2 || k === 5) ? (rr() - 0.5) * 0.6 : 0;
    const h = PANEL_H - 0.12 - (cracked && k === 2 ? 0.12 : 0);
    parts.push([place(new THREE.BoxGeometry(pw, h, 0.05), [x + Math.sin(tilt) * h * 0.5, h / 2, 0], [0, 0, -tilt]), '#fbf7ef']);
    parts.push([place(new THREE.ConeGeometry(pw * 0.72, 0.16, 4), [x + Math.sin(tilt) * h, h + 0.07, 0], [0, PI / 4, -tilt], [1, 1, 0.35]), '#fbf7ef']);
  }
  // rails on the outside
  if (cracked) {
    parts.push([place(new THREE.BoxGeometry(PANEL_W * 0.52, 0.1, 0.05), [-PANEL_W * 0.24, 0.72, -0.05], [0, 0, -0.08]), '#e3dccd']);
    parts.push([place(new THREE.BoxGeometry(PANEL_W * 0.44, 0.1, 0.05), [PANEL_W * 0.28, 0.66, -0.05], [0, 0, 0.12]), '#e3dccd']);
  } else parts.push([place(new THREE.BoxGeometry(PANEL_W, 0.1, 0.05), [0, 0.72, -0.05]), '#e3dccd']);
  parts.push([place(new THREE.BoxGeometry(PANEL_W, 0.1, 0.05), [0, 0.3, -0.05]), '#e3dccd']);
  // red kick board along the bottom (padded look)
  parts.push([place(new RoundedBoxGeometry(PANEL_W, 0.2, 0.12, 2, 0.04), [0, 0.1, 0.03]), '#ff3b30']);
  if (cracked) {
    for (let k = 0; k < 4; k++) parts.push([place(new THREE.BoxGeometry(0.22, 0.025, 0.02), [-0.4 + k * 0.17, 0.1 + (k % 2 ? 0.03 : -0.03), 0.1], [0, 0, (k % 2 ? 0.6 : -0.6)]), INK]);
  }
  return merged(parts);
}

/** A crowd animal (merged), facing +Z. kinds: cow pig sheep goat chick horse */
function crowdGeo(kind, r) {
  const C = {
    cow: ['#ffffff', '#ffb3c1', INK], pig: ['#ffb0c4', '#ff8fab', '#a8566c'], sheep: ['#fbf7ef', '#3c3b4f', '#3c3b4f'],
    goat: ['#efe2c8', '#d9c49d', '#8f7a64'], chick: ['#ffd21f', '#ff9f1c', '#ff9f1c'], horse: ['#a0612f', '#e8b48a', '#3a2215'],
  }[kind];
  const [fur, mz, acc] = C;
  const scarf = ['#ff3b30', '#2f7cff', '#2fc65a', '#ffd21f', '#7b4dff', '#ff8a1f'][Math.floor(r() * 6)];
  const parts = [
    [place(new THREE.SphereGeometry(0.34, 12, 8), [0, 0.42, 0], [0, 0, 0], [1, 1.15, 0.9]), fur],
    [place(new THREE.SphereGeometry(0.26, 12, 8), [0, 0.98, 0.04]), kind === 'sheep' ? acc : fur],
    [place(new THREE.TorusGeometry(0.2, 0.06, 6, 14), [0, 0.76, 0], [PI / 2, 0, 0]), scarf],
    [place(new THREE.SphereGeometry(0.055, 8, 6), [0.1, 1.03, 0.23]), '#ffffff'],
    [place(new THREE.SphereGeometry(0.055, 8, 6), [-0.1, 1.03, 0.23]), '#ffffff'],
    [place(new THREE.SphereGeometry(0.03, 6, 4), [0.1, 1.03, 0.275]), INK],
    [place(new THREE.SphereGeometry(0.03, 6, 4), [-0.1, 1.03, 0.275]), INK],
  ];
  if (kind === 'chick') parts.push([place(new THREE.ConeGeometry(0.06, 0.14, 8), [0, 0.94, 0.3], [PI / 2, 0, 0]), mz]);
  else parts.push([place(new THREE.SphereGeometry(0.15, 10, 8), [0, 0.9, 0.2], [0, 0, 0], [1, 0.75, 0.8]), mz]);
  if (kind === 'sheep') for (let k = 0; k < 6; k++) parts.push([place(new THREE.IcosahedronGeometry(0.12, 0), [Math.cos(k) * 0.2, 1.18, Math.sin(k) * 0.12 - 0.04]), fur]);
  if (kind !== 'chick') for (const s of [-1, 1]) parts.push([place(new THREE.SphereGeometry(0.07, 8, 6), [s * 0.25, 1.12, 0], [0, 0, s * 0.9], [0.6, 1.3, 0.4]), kind === 'sheep' ? acc : fur]);
  if (kind === 'goat' || kind === 'cow') for (const s of [-1, 1]) parts.push([place(new THREE.ConeGeometry(0.03, 0.12, 6), [s * 0.12, 1.24, -0.02], [0, 0, -s * 0.4]), kind === 'cow' ? '#fff3c9' : acc]);
  if (kind === 'horse') parts.push([place(new THREE.BoxGeometry(0.06, 0.3, 0.16), [0, 1.15, -0.12]), acc]);
  for (const s of [-1, 1]) parts.push([place(new THREE.CapsuleGeometry(0.06, 0.22, 4, 8), [s * 0.36, 0.72, 0.08], [0, 0, s * 2.5]), fur]);
  return merged(parts);
}

function numberTexture(n, col) {
  return canvasTex(256, 256, (g, w) => {
    g.fillStyle = col; g.fillRect(0, 0, w, w);
    g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, 0, w, 40);
    g.fillStyle = '#ffffff'; g.strokeStyle = INK; g.lineWidth = 14;
    g.font = '900 170px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.strokeText(String(n), w / 2, w / 2 + 14); g.fillText(String(n), w / 2, w / 2 + 14);
  });
}

function signTexture() {
  return canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = '#fff3c9'; g.fillRect(0, 0, w, h);
    g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
    g.font = '900 64px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#ff3b30'; g.fillText('BUMPER CARTS', w / 2, h / 2 + 4);
  });
}

export function createWorld() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#9fd6ff');
  scene.fog = new THREE.Fog('#f6e6c8', 60, 230);
  scene.add(skyDome());

  // ── lights ──
  const hemi = new THREE.HemisphereLight('#e6f3ff', '#8a6a3f', 1.3);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff0d6', 2.4);
  sun.position.set(-10, 22, 9);
  sun.target.position.set(0, 0, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -10; sc.right = 10; sc.top = 10; sc.bottom = -10; sc.near = 4; sc.far = 60;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);

  // ── floor disc with a wooden skirt into the mud ──
  const woodSide = woodTexture(8);
  woodSide.wrapS = woodSide.wrapT = THREE.RepeatWrapping;
  woodSide.repeat.set(40, 1);
  const floor = mesh(new THREE.CylinderGeometry(FLOOR_R, FLOOR_R, 1.6, 96, 1, false),
    [toon('#ffffff', { map: woodSide }), toon('#ffffff', { map: floorTexture() }), toon('#5a3a1d')], { cast: false, receive: true });
  floor.position.y = -0.8;
  scene.add(floor);
  const lip = mesh(new THREE.TorusGeometry(FLOOR_R, 0.06, 6, 96), toon('#7a4a24'), { cast: false });
  lip.rotation.x = PI / 2; lip.position.y = -0.02;
  scene.add(lip);

  // ── mud moat, bank, grass ──
  const mudMat = mudMaterial();
  const mud = new THREE.Mesh(new THREE.RingGeometry(FLOOR_R - 0.05, MOAT_OUT + 0.05, 96, 2), mudMat);
  mud.rotation.x = -PI / 2; mud.position.y = MUD_Y;
  scene.add(mud);
  const bankWall = mesh(new THREE.CylinderGeometry(MOAT_OUT, MOAT_OUT, -MUD_Y + 0.4, 72, 1, true), toon('#9c6b3d', { side: THREE.BackSide }), { cast: false });
  bankWall.position.y = (MUD_Y - 0.4) / 2;
  scene.add(bankWall);
  const path = mesh(new THREE.RingGeometry(MOAT_OUT, MOAT_OUT + 3.2, 72, 1), toon('#e8c98a'), { cast: false });
  path.rotation.x = -PI / 2; path.position.y = 0.001;
  scene.add(path);
  const grass = mesh(new THREE.RingGeometry(MOAT_OUT + 3.2, 260, 72, 1), toon('#63d13f'), { cast: false });
  grass.rotation.x = -PI / 2;
  scene.add(grass);

  // ── fence: panels (whole + cracked instanced) and posts ──
  const fenceMat = toon('#ffffff', { vc: true });
  const whole = new THREE.InstancedMesh(panelGeo(false, 1), fenceMat, FENCE.panels);
  const cracked = new THREE.InstancedMesh(panelGeo(true, 5), fenceMat, FENCE.panels);
  for (const im of [whole, cracked]) { im.castShadow = true; im.receiveShadow = true; im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(im); }
  const postGeo = merged([
    [place(new RoundedBoxGeometry(0.24, 1.12, 0.24, 2, 0.04), [0, 0.56, 0]), '#fbf7ef'],
    [place(new THREE.SphereGeometry(0.14, 12, 8), [0, 1.2, 0]), '#ff3b30'],
    [place(new THREE.BoxGeometry(0.3, 0.16, 0.3), [0, 0.08, 0]), '#2f7cff'],
  ]);
  const posts = new THREE.InstancedMesh(postGeo, fenceMat, FENCE.panels);
  posts.castShadow = true;
  {
    const d = new THREE.Object3D();
    for (let k = 0; k < FENCE.panels; k++) {
      const a = k * ARC;
      d.position.set(Math.cos(a) * R, 0, Math.sin(a) * R);
      d.rotation.set(0, -a, 0);
      d.updateMatrix();
      posts.setMatrixAt(k, d.matrix);
    }
  }
  scene.add(posts);
  const panels = [];
  for (let k = 0; k < FENCE.panels; k++) panels.push({ k, hp: FENCE.hp, fallT: -1, delay: 0, wob: 0, wobV: 0, splashed: false });

  // ── scenery: barn, trees, hills, light poles + wires (one merged static mesh) ──
  const RR = rng(17);
  const S = [];
  {
    const g = [];
    g.push([new THREE.BoxGeometry(10, 5.5, 7), '#d8342a']);
    g.push([place(new THREE.BoxGeometry(10.2, 0.3, 7.2), [0, -2.7, 0]), '#ffffff']);
    const gable = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-5, 0), new THREE.Vector2(5, 0), new THREE.Vector2(0, 3.4)]), { depth: 7, bevelEnabled: false });
    g.push([place(gable, [0, 2.75, -3.5]), '#d8342a']);
    for (const sx of [-1, 1]) g.push([place(new THREE.BoxGeometry(6.4, 0.3, 7.6), [sx * 2.55, 2.75 + 1.75, 0], [0, 0, -sx * 0.6]), '#7a3a34']);
    g.push([place(new THREE.BoxGeometry(3.4, 3.6, 0.12), [0, -0.95, 3.52]), '#3a1f14']);
    for (const sx of [-1, 1]) {
      g.push([place(new THREE.BoxGeometry(1.7, 3.6, 0.14), [sx * 2.6, -0.95, 3.6], [0, sx * 0.9, 0]), '#b92a22']);
    }
    g.push([place(new THREE.BoxGeometry(3.8, 0.22, 0.16), [0, 0.95, 3.58]), '#ffffff']);
    g.push([place(new THREE.BoxGeometry(0.22, 3.8, 0.16), [-1.8, -0.95, 3.58]), '#ffffff']);
    g.push([place(new THREE.BoxGeometry(0.22, 3.8, 0.16), [1.8, -0.95, 3.58]), '#ffffff']);
    g.push([place(new THREE.BoxGeometry(1.6, 1.3, 0.12), [0, 4.2, 3.52]), '#ffffff']);
    g.push([place(new THREE.BoxGeometry(1.3, 1.0, 0.14), [0, 4.2, 3.58]), '#6e2a22']);
    // hay spilling out of the loft
    for (let k = 0; k < 6; k++) g.push([place(new THREE.IcosahedronGeometry(0.35, 0), [(k - 2.5) * 0.22, 3.65, 3.7]), '#f2c45a']);
    g.push([place(new THREE.CylinderGeometry(1.5, 1.5, 8, 18), [7.4, 1.25, -1]), '#cfd6e2']);
    g.push([place(new THREE.SphereGeometry(1.52, 18, 8, 0, TAU, 0, PI / 2), [7.4, 5.25, -1]), '#2f7cff']);
    for (const [geo] of g) { geo.translate(0, 2.75, 0); geo.translate(0, 0, -22); }
    S.push(...g);
  }
  const tree = (x, z, s) => {
    const h = 1.6 * s;
    S.push([place(new THREE.CylinderGeometry(0.22 * s, 0.32 * s, h, 7), [x, h / 2, z]), '#8a5a2e']);
    const greens = ['#2fa84f', '#3fc25e', '#269447'];
    for (let k = 0; k < 3; k++) S.push([place(new THREE.IcosahedronGeometry((1.3 - k * 0.25) * s, 1), [x + (RR() - 0.5) * 0.6 * s, h + (0.6 + k * 0.9) * s, z + (RR() - 0.5) * 0.6 * s]), greens[k]]);
  };
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * TAU + RR() * 0.2, r = 27 + RR() * 22;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(x) < 11 && z < -14) continue;   // keep the barn clear
    tree(x, z, 1 + RR() * 0.9);
  }
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * TAU + RR() * 0.3, r = 110 + RR() * 40;
    S.push([place(new THREE.SphereGeometry(30 + RR() * 25, 16, 8), [Math.cos(a) * r, -14, Math.sin(a) * r], [0, 0, 0], [1.6, 0.8, 1.2]), k % 2 ? '#7fd85a' : '#69c94a']);
  }
  // string-light poles on the back half, wires between them
  const POLE_R = 12.6, POLE_H = 4.6;
  const poleAngles = [];
  for (let k = 0; k <= 6; k++) poleAngles.push(PI + (k / 6) * PI);
  const polePts = poleAngles.map((a) => new THREE.Vector3(Math.cos(a) * POLE_R, POLE_H, Math.sin(a) * POLE_R));
  for (const p of polePts) {
    S.push([place(new THREE.CylinderGeometry(0.08, 0.11, POLE_H, 6), [p.x, POLE_H / 2, p.z]), '#8a5a2e']);
    S.push([place(new THREE.SphereGeometry(0.14, 8, 6), [p.x, POLE_H + 0.05, p.z]), '#ffd21f']);
  }
  const bulbSpots = [];
  const cols = ['#ffd21f', '#ff3b30', '#2fc65a', '#2f7cff', '#ffffff', '#ff8a1f'];
  const string = (A, B, n, sag) => {
    let prev = A.clone();
    for (let k = 1; k <= n; k++) {
      const u = k / n;
      const p = A.clone().lerp(B, u);
      p.y -= Math.sin(u * PI) * sag;
      const mid = prev.clone().add(p).multiplyScalar(0.5), len = prev.distanceTo(p);
      const wire = new THREE.CylinderGeometry(0.015, 0.015, len, 3);
      wire.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.clone().sub(prev).normalize()));
      wire.translate(mid.x, mid.y, mid.z);
      S.push([wire, '#2b2b3a']);
      if (k < n) bulbSpots.push({ p: p.clone(), c: cols[bulbSpots.length % cols.length] });
      prev = p;
    }
  };
  for (let k = 0; k < polePts.length - 1; k++) string(polePts[k], polePts[k + 1], 11, 0.7);
  // two long strings toward the barn eaves
  string(polePts[2], new THREE.Vector3(-4.5, 7.2, -18.6), 12, 1.0);
  string(polePts[4], new THREE.Vector3(4.5, 7.2, -18.6), 12, 1.0);
  const scenery = mesh(merged(S), toon('#ffffff', { vc: true }), { cast: false, receive: true });
  scene.add(scenery);
  const sign = mesh(new THREE.PlaneGeometry(5, 1.25), toon('#ffffff', { map: signTexture() }), { cast: false });
  sign.position.set(0, 7.2, -18.35);
  scene.add(sign);

  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), bulbSpots.length);
  {
    const m4 = new THREE.Matrix4(), c = new THREE.Color();
    bulbSpots.forEach((b, k) => { m4.makeTranslation(b.p.x, b.p.y - 0.12, b.p.z); bulbs.setMatrixAt(k, m4); bulbs.setColorAt(k, c.set(b.c)); });
  }
  scene.add(bulbs);

  // ── clouds ──
  const cloudParts = [];
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * TAU + RR(), r = 90 + RR() * 70, y = 38 + RR() * 30;
    const cx = Math.cos(a) * r, cz = Math.sin(a) * r;
    for (let j = 0; j < 5; j++) cloudParts.push([place(new THREE.IcosahedronGeometry(5 + RR() * 4, 1), [cx + (j - 2) * 6, y + (j % 2) * 2.5, cz + (RR() - 0.5) * 4], [0, 0, 0], [1.2, 0.7, 1]), '#ffffff']);
  }
  const clouds = mesh(merged(cloudParts), new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }), { cast: false, receive: false });
  scene.add(clouds);

  // ── hay-bale stands (left, right, back-left, back-right) and the crowd ──
  const strawMap = strawTexture();
  const STANDS = [PI, 0, PI * 1.3, PI * 1.7].map((a) => ({ a, r: 14.6 }));
  const baleSpots = [];
  for (const st of STANDS) {
    for (let tier = 0; tier < 2; tier++) {
      const n = 5 - tier, r = st.r + tier * 1.0;
      for (let k = 0; k < n; k++) {
        const a = st.a + (k - (n - 1) / 2) * (1.2 / r);
        baleSpots.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, y: 0.33 + tier * 0.66, ry: -a + PI / 2 });
      }
    }
  }
  const bales = new THREE.InstancedMesh(new RoundedBoxGeometry(1.15, 0.64, 0.8, 2, 0.08), toon('#ffffff', { map: strawMap }), baleSpots.length);
  {
    const d = new THREE.Object3D();
    baleSpots.forEach((b, k) => { d.position.set(b.x, b.y, b.z); d.rotation.set(0, b.ry, 0); d.updateMatrix(); bales.setMatrixAt(k, d.matrix); });
  }
  bales.castShadow = true; bales.receiveShadow = true;
  scene.add(bales);
  const kinds = ['cow', 'pig', 'sheep', 'goat', 'chick', 'horse'];
  const crowdMat = toon('#ffffff', { vc: true });
  const crowdBy = kinds.map(() => []);
  let ci = 0;
  for (const st of STANDS) {
    for (let tier = 0; tier < 2; tier++) {
      const n = tier ? 3 : 4, r = st.r + tier * 1.0;
      for (let k = 0; k < n; k++) {
        const a = st.a + (k - (n - 1) / 2) * (1.15 / r) + (RR() - 0.5) * 0.02;
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        crowdBy[ci % kinds.length].push({ x, z, y: 0.66 + tier * 0.66, ry: Math.atan2(-x, -z), s: 0.9 + RR() * 0.2, ph: RR() * 6, jy: 0, vy: 0 });
        ci++;
      }
    }
  }
  const crowd = kinds.map((kd, k) => {
    const im = new THREE.InstancedMesh(crowdGeo(kd, RR), crowdMat, Math.max(1, crowdBy[k].length));
    im.count = crowdBy[k].length;
    im.castShadow = true;
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(im);
    return { im, list: crowdBy[k] };
  });
  let excite = 0;

  // ── results podium ──
  const podium = new THREE.Group();
  podium.visible = false;
  scene.add(podium);
  const PODIUM = [{ x: 0, h: 0.9, c: '#ffd21f' }, { x: -1.6, h: 0.6, c: '#cfd6e2' }, { x: 1.6, h: 0.4, c: '#e0985a' }];
  PODIUM.forEach((p, k) => {
    const side = toon(p.c);
    const front = toon('#ffffff', { map: numberTexture(k + 1, p.c) });
    const m = mesh(new THREE.BoxGeometry(1.5, p.h, 1.5), [side, side, side, side, front, side]);
    m.position.set(p.x, p.h / 2, 0);
    podium.add(m);
  });
  function podiumSpot(rank, out = new THREE.Vector3()) {
    if (rank < 3) return out.set(PODIUM[rank].x, PODIUM[rank].h, 0);
    return out.set(3.1, 0, 0.6);
  }

  // ── state / API ──
  let time = 0, rippleIdx = 0;
  const m4 = new THREE.Matrix4(), dummy = new THREE.Object3D(), hide = new THREE.Matrix4().makeScale(0, 0, 0);
  const listeners = { panelSplash: [] };

  function ripple(x, z, amp = 1) {
    mudMat.uniforms.ripples.value[rippleIdx].set(x, z, time, amp);
    rippleIdx = (rippleIdx + 1) % 8;
  }
  function cheer(k = 1) {
    excite = Math.min(1.5, excite + k);
    for (const g of crowd) for (const c of g.list) if (c.jy <= 0.001 && Math.random() < 0.35 + 0.5 * k) c.vy = 1.8 + Math.random() * 1.8 * k;
  }
  function panelCentre(k, out = new THREE.Vector3()) {
    const a = (k + 0.5) * ARC;
    return out.set(Math.cos(a) * R, 0.5, Math.sin(a) * R);
  }

  /** Sync panels with the sim fence hp (crack, fall, restore). storm = stagger the falls in a wave. */
  function setFence(hp, storm = false) {
    for (const p of panels) {
      const h = hp[p.k];
      if (h === p.hp) continue;
      if (h > p.hp) { p.fallT = -1; p.splashed = false; p.wob = 0; }
      else if (h === 0) { p.fallT = 0; p.delay = storm ? (p.k * 0.07 + Math.random() * 0.15) : 0; }
      else { p.wobV += 5; }
      p.hp = h;
    }
  }
  function panelHit(k, s = 1) { const p = panels[k]; if (p) p.wobV += 2.5 * s; }

  function updatePanels(dt) {
    const tmp = new THREE.Vector3();
    for (const p of panels) {
      const a = (p.k + 0.5) * ARC;
      const ry = -a - PI / 2;
      // springy wobble
      p.wobV += (-p.wob * 140 - p.wobV * 9) * dt;
      p.wob += p.wobV * dt;
      let tilt = (p.hp === 1 ? -0.14 : 0) - p.wob * 0.05;
      let out = 0, y = 0, sink = 0;
      if (p.fallT >= 0) {
        p.fallT += dt;
        const t = Math.max(0, p.fallT - p.delay);
        const t1 = 0.45;
        if (t < t1) tilt = -(PI / 2) * (t / t1) * (t / t1);
        else {
          tilt = -PI / 2 - Math.min(0.25, (t - t1) * 0.8);
          const u = Math.min(1, (t - t1) / 0.3);
          y = (MUD_Y + 0.02) * u * u;
          out = 0.45 * u;
          if (u >= 1 && !p.splashed) {
            p.splashed = true;
            panelCentre(p.k, tmp);
            const mx = Math.cos(a) * (R + 0.9), mz = Math.sin(a) * (R + 0.9);
            ripple(mx, mz, 0.6);
            for (const f of listeners.panelSplash) f(mx, mz, p.k);
          }
          sink = Math.max(0, t - t1 - 1.2) * 0.25;
        }
      }
      const vis = p.fallT < 0 || sink < 0.5;
      dummy.position.set(Math.cos(a) * (R + out), y - sink, Math.sin(a) * (R + out));
      dummy.rotation.set(tilt, ry, 0, 'YXZ');
      dummy.updateMatrix();
      const useCracked = p.hp === 1 || (p.hp === 0 && p.wasCracked);
      if (p.hp === 1) p.wasCracked = true;
      if (p.hp === 2) p.wasCracked = false;
      whole.setMatrixAt(p.k, vis && !useCracked ? dummy.matrix : hide);
      cracked.setMatrixAt(p.k, vis && useCracked ? dummy.matrix : hide);
    }
    whole.instanceMatrix.needsUpdate = true;
    cracked.instanceMatrix.needsUpdate = true;
  }

  function update(dt) {
    time += dt;
    mudMat.uniforms.time.value = time;
    clouds.rotation.y += dt * 0.004;
    updatePanels(dt);
    // bulbs twinkle
    if (((time * 4) | 0) !== (((time - dt) * 4) | 0)) {
      const c = new THREE.Color();
      for (let k = 0; k < bulbSpots.length; k++) {
        const on = 0.75 + 0.25 * Math.sin(time * 3 + k * 1.7);
        bulbs.setColorAt(k, c.set(bulbSpots[k].c).multiplyScalar(on));
      }
      bulbs.instanceColor.needsUpdate = true;
    }
    // crowd bounce and sway
    excite = Math.max(0, excite - dt * 0.6);
    for (const g of crowd) {
      g.list.forEach((c, k) => {
        c.vy -= 12 * dt;
        c.jy += c.vy * dt;
        if (c.jy < 0) { c.jy = 0; c.vy = excite > 0.2 && Math.random() < dt * 4 * excite ? 1.5 + Math.random() * 1.5 : 0; }
        dummy.position.set(c.x, c.y + c.jy, c.z);
        dummy.rotation.set(0, c.ry + Math.sin(time * 1.5 + c.ph) * 0.15, Math.sin(time * 2.3 + c.ph) * (0.04 + excite * 0.1), 'YXZ');
        dummy.scale.setScalar(c.s);
        dummy.updateMatrix();
        g.im.setMatrixAt(k, dummy.matrix);
      });
      g.im.instanceMatrix.needsUpdate = true;
    }
    dummy.scale.setScalar(1);
  }

  function setPodium(on) { podium.visible = !!on; }

  updatePanels(0);
  return {
    scene, sun, hemi, update, ripple, cheer, setFence, panelHit, panelCentre, setPodium, podiumSpot,
    on(ev, f) { (listeners[ev] || (listeners[ev] = [])).push(f); },
    get time() { return time; },
    dispose() {
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
      });
    },
  };
}

export { FLOOR_R, MUD_Y };
