// Bale Brawl - the farm pond arena: sky, lights, toon water, shrinkable hay-bale stack, lily pads, reeds,
// ducks, barn, windmill, fence, trees, bunting and a cheering crowd on the bank. All procedural.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { toon, mesh, place, merged, strawTexture, spiralTexture, woodTexture, rng, INK } from './world/toon.js';
import { ARENA } from './constants.js';

const PI = Math.PI;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const ease = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));

export const POND_R = 11.2;
export const BANK_Y = -1.85;
const WATER_Y = ARENA.waterY;
const LAYER_H = 0.8;
/** Bale rings: [inner, outer] radius. Ring 0 is the big round centre bale. */
export const RINGS = [[0, 1.9], [1.9, 2.7], [2.7, 3.45], [3.45, ARENA.radius]];

function skyDome() {
  const geo = new THREE.SphereGeometry(400, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#3aa8ff') }, mid: { value: new THREE.Color('#8fd3ff') }, bottom: { value: new THREE.Color('#e6f7ff') } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP;
      void main(){ float h = vP.y; vec3 c = h > 0.18 ? mix(mid, top, smoothstep(0.18, 0.7, h)) : mix(bottom, mid, smoothstep(-0.02, 0.18, h));
      gl_FragColor = vec4(c, 1.0); }`,
  });
  const m = new THREE.Mesh(geo, mat);
  m.renderOrder = -10;
  m.frustumCulled = false;
  return m;
}

function waterMaterial() {
  const ripples = [];
  for (let k = 0; k < 8; k++) ripples.push(new THREE.Vector4(0, 0, -100, 0));
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }, ripples: { value: ripples }, platformR: { value: ARENA.radius },
      shallow: { value: new THREE.Color('#2bb5e8') }, deep: { value: new THREE.Color('#1679b8') },
      foam: { value: new THREE.Color('#ffffff') }, pondR: { value: POND_R },
    },
    vertexShader: `varying vec2 vXZ; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vXZ = w.xz;
      gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float time; uniform vec4 ripples[8]; uniform float platformR; uniform float pondR;
      uniform vec3 shallow; uniform vec3 deep; uniform vec3 foam; varying vec2 vXZ;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
      void main(){
        float r = length(vXZ);
        float depth = smoothstep(platformR + 0.3, platformR + 3.5, r) * (1.0 - smoothstep(pondR - 3.0, pondR - 0.2, r));
        vec3 c = mix(shallow, deep, depth * 0.85);
        // stylised wave glints: toon bands of drifting noise
        float n = noise(vXZ * 0.9 + vec2(time * 0.15, time * 0.07)) + 0.5 * noise(vXZ * 2.1 - vec2(time * 0.2, -time * 0.1));
        c = mix(c, c * 1.12 + 0.05, step(1.12, n));
        float glint = step(1.32, n);
        c = mix(c, foam, glint * 0.55);
        // foam lapping at the bale stack and at the bank
        float lap = 0.5 + 0.5 * sin(time * 2.0 + atan(vXZ.y, vXZ.x) * 9.0);
        float pf = 1.0 - smoothstep(0.0, 0.22 + 0.1 * lap, r - platformR);
        float bf = smoothstep(pondR - 0.45 - 0.12 * lap, pondR - 0.1, r);
        c = mix(c, foam, max(pf * step(platformR - 0.05, r), bf) * 0.9);
        // splash rings
        for (int k = 0; k < 8; k++) {
          vec4 R = ripples[k];
          float age = time - R.z;
          if (age < 0.0 || age > 3.0) continue;
          float d = length(vXZ - R.xy);
          for (int j = 0; j < 3; j++) {
            float rad = (age - float(j) * 0.35) * (1.6 + R.w * 0.8);
            if (rad <= 0.0) continue;
            float band = 1.0 - smoothstep(0.05, 0.16, abs(d - rad));
            c = mix(c, foam, band * (1.0 - age / 3.0) * 0.9);
          }
        }
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

/** Instanced ring of rectangular bales, `layers` high, outer ring gets bands across. */
function baleRing(inner, outer, layers, strawMap) {
  const rMid = (inner + outer) / 2, depth = outer - inner;
  const n = Math.max(6, Math.round((2 * PI * rMid) / 1.15));
  const chord = (2 * PI * rMid) / n;
  const geo = new RoundedBoxGeometry(chord * 0.985, LAYER_H * 0.97, depth * 0.97, 3, 0.09);
  const mat = toon('#ffffff', { map: strawMap });
  const im = new THREE.InstancedMesh(geo, mat, n * layers);
  im.castShadow = true; im.receiveShadow = true;
  const base = [];
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1);
  let i = 0;
  for (let L = 0; L < layers; L++) {
    const off = L % 2 ? 0.5 : 0;
    for (let k = 0; k < n; k++) {
      const a = ((k + off) / n) * PI * 2;
      const p = new THREE.Vector3(Math.cos(a) * rMid, -LAYER_H / 2 - L * LAYER_H, Math.sin(a) * rMid);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a + PI / 2);
      m4.compose(p, q, s);
      im.setMatrixAt(i, m4);
      base.push({ p, a, L, q: q.clone() });
      i++;
    }
  }
  im.instanceMatrix.needsUpdate = true;
  return { im, base, n, inner, outer, rMid };
}

/** A toon duck (one merged mesh). */
function duckGeo(color = '#ffffff', small = false) {
  const s = small ? 0.6 : 1;
  return merged([
    [place(new THREE.SphereGeometry(0.22 * s, 12, 8), [0, 0.12 * s, 0], [0, 0, 0], [1, 0.7, 1.35]), color],
    [place(new THREE.ConeGeometry(0.09 * s, 0.2 * s, 8), [0, 0.2 * s, -0.3 * s], [-1.1, 0, 0]), color],
    [place(new THREE.SphereGeometry(0.13 * s, 12, 8), [0, 0.36 * s, 0.2 * s]), color],
    [place(new THREE.ConeGeometry(0.05 * s, 0.14 * s, 8), [0, 0.34 * s, 0.36 * s], [PI / 2, 0, 0], [1.2, 1, 0.6]), '#ff9f1c'],
    [place(new THREE.SphereGeometry(0.022 * s, 6, 4), [0.07 * s, 0.4 * s, 0.3 * s]), INK],
    [place(new THREE.SphereGeometry(0.022 * s, 6, 4), [-0.07 * s, 0.4 * s, 0.3 * s]), INK],
    [place(new THREE.SphereGeometry(0.12 * s, 10, 6), [0.17 * s, 0.16 * s, -0.02], [0, 0, 0], [0.4, 0.6, 1.1]), color],
    [place(new THREE.SphereGeometry(0.12 * s, 10, 6), [-0.17 * s, 0.16 * s, -0.02], [0, 0, 0], [0.4, 0.6, 1.1]), color],
  ]);
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
    [place(new THREE.SphereGeometry(0.34, 14, 10), [0, 0.42, 0], [0, 0, 0], [1, 1.15, 0.9]), fur],
    [place(new THREE.SphereGeometry(0.26, 14, 10), [0, 0.98, 0.04]), kind === 'sheep' ? acc : fur],
    [place(new THREE.TorusGeometry(0.2, 0.06, 8, 18), [0, 0.76, 0], [PI / 2, 0, 0]), scarf],
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
  // waving arms
  for (const s of [-1, 1]) parts.push([place(new THREE.CapsuleGeometry(0.06, 0.22, 4, 8), [s * 0.36, 0.72, 0.08], [0, 0, s * 2.5]), fur]);
  return merged(parts);
}

export function createWorld() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#9fdcff');
  scene.fog = new THREE.Fog('#d8f1ff', 60, 220);
  scene.add(skyDome());

  // ── lights ──
  const hemi = new THREE.HemisphereLight('#d6efff', '#6aa84f', 1.35);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff3dc', 2.4);
  sun.position.set(-9, 20, 12);
  sun.target.position.set(0, -0.5, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 4; sc.far = 50;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 4;
  scene.add(sun, sun.target);

  // ── ground, bank and water ──
  const grass = mesh(new THREE.RingGeometry(POND_R + 0.6, 260, 72, 1), toon('#63d13f'), { cast: false });
  grass.rotation.x = -PI / 2;
  grass.position.y = BANK_Y;
  scene.add(grass);
  const bankTop = mesh(new THREE.RingGeometry(POND_R - 0.05, POND_R + 0.62, 72, 1), toon('#f3d58a'), { cast: false });
  bankTop.rotation.x = -PI / 2;
  bankTop.position.y = BANK_Y + 0.005;
  scene.add(bankTop);
  const bankWall = mesh(new THREE.CylinderGeometry(POND_R, POND_R - 0.5, 1.0, 72, 1, true), toon('#d9b56a', { side: THREE.BackSide }), { cast: false });
  bankWall.position.y = BANK_Y - 0.5;
  scene.add(bankWall);
  const waterMat = waterMaterial();
  const water = new THREE.Mesh(new THREE.CircleGeometry(POND_R + 0.02, 96), waterMat);
  water.rotation.x = -PI / 2;
  water.position.y = WATER_Y;
  water.receiveShadow = false;
  scene.add(water);

  // ── hay bale stack ──
  const strawMap = strawTexture();
  const strawPlain = strawTexture({ bands: false, seed: 9 });
  strawPlain.wrapS = strawPlain.wrapT = THREE.RepeatWrapping;
  strawPlain.repeat.set(6, 1);
  const stack = new THREE.Group();
  scene.add(stack);
  const center = new THREE.Group();
  stack.add(center);
  const spiral = spiralTexture();
  const cTop = mesh(new THREE.CylinderGeometry(RINGS[0][1], RINGS[0][1], LAYER_H, 48, 1, false), [
    toon('#ffffff', { map: strawPlain }), toon('#ffffff', { map: spiral }), toon('#ffffff', { map: spiral })]);
  cTop.position.y = -LAYER_H / 2;
  center.add(cTop);
  const twine = mesh(new THREE.TorusGeometry(RINGS[0][1] + 0.01, 0.03, 6, 64), toon('#c2271d'), { cast: false });
  twine.rotation.x = PI / 2;
  for (const y of [-0.22, -0.58]) { const t2 = twine.clone(); t2.position.y = y; center.add(t2); }
  const core = mesh(new THREE.CylinderGeometry(RINGS[0][1] * 0.98, RINGS[0][1], LAYER_H * 3.2, 40, 1, true), toon('#ffffff', { map: strawPlain }));
  core.position.y = -LAYER_H - LAYER_H * 1.6;
  center.add(core);
  const rings = [];
  for (let k = 1; k < RINGS.length; k++) {
    const R = baleRing(RINGS[k][0], RINGS[k][1], 4, strawMap);
    stack.add(R.im);
    rings.push({ ...R, k, drop: -1, splashed: new Set() });
  }
  // wooden plank rim around the outer ring
  const plankGroup = new THREE.Group();
  stack.add(plankGroup);
  {
    const n = 60, r = ARENA.radius + 0.04;
    const geo = new THREE.BoxGeometry((2 * PI * r) / n * 0.9, 0.5, 0.06);
    const im = new THREE.InstancedMesh(geo, toon('#ffffff', { map: woodTexture() }), n);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    for (let k = 0; k < n; k++) {
      const a = (k / n) * PI * 2;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a + PI / 2);
      m4.compose(new THREE.Vector3(Math.cos(a) * r, -0.2 + (k % 2) * 0.03, Math.sin(a) * r), q, new THREE.Vector3(1, 1, 1));
      im.setMatrixAt(k, m4);
    }
    im.castShadow = true; im.receiveShadow = true;
    plankGroup.add(im);
    const band = mesh(new THREE.TorusGeometry(r + 0.035, 0.03, 6, 96), toon('#6e4220'), { cast: false });
    band.rotation.x = PI / 2; band.position.y = -0.08;
    plankGroup.add(band);
  }
  // rim line: shows where the edge is (shrinks in sudden death)
  const edgeMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7, depthWrite: false });
  const edgeRing = new THREE.Mesh(new THREE.RingGeometry(0.985, 1, 128), edgeMat);
  edgeRing.rotation.x = -PI / 2;
  edgeRing.position.y = 0.012;
  edgeRing.renderOrder = 2;
  scene.add(edgeRing);
  // support posts under water
  const postGeo = new THREE.CylinderGeometry(0.12, 0.14, 2.2, 8);
  const posts = new THREE.InstancedMesh(postGeo, toon('#8a5a2e'), 10);
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * PI * 2;
    posts.setMatrixAt(k, new THREE.Matrix4().makeTranslation(Math.cos(a) * 4.35, WATER_Y - 0.6, Math.sin(a) * 4.35));
  }
  stack.add(posts);

  // ── lily pads, flowers, reeds ──
  const R = rng(17);
  const pad = new THREE.CircleGeometry(0.42, 16, 0.3, PI * 2 - 0.6);
  pad.rotateX(-PI / 2);
  const pads = new THREE.InstancedMesh(pad, toon('#3fbf4a'), 26);
  const padSpots = [];
  for (let k = 0; k < 26; k++) {
    const a = R() * PI * 2, r = 5.4 + R() * 5.0, s = 0.6 + R() * 0.8;
    padSpots.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, s, rot: R() * PI * 2, ph: R() * 6 });
  }
  pads.receiveShadow = true;
  scene.add(pads);
  const flowerGeo = merged([
    ...[0, 1, 2, 3, 4, 5].map((k) => [place(new THREE.SphereGeometry(0.09, 8, 6), [Math.cos(k * 1.047) * 0.09, 0.06, Math.sin(k * 1.047) * 0.09], [0, 0, 0], [1, 0.5, 0.6]), '#ff8fc8']),
    [place(new THREE.SphereGeometry(0.06, 8, 6), [0, 0.09, 0]), '#ffd21f'],
  ]);
  const flowers = new THREE.InstancedMesh(flowerGeo, toon('#ffffff', { vc: true }), 7);
  scene.add(flowers);
  // reeds + cattails as one static merged mesh
  const reedParts = [];
  for (let c = 0; c < 14; c++) {
    const a = R() * PI * 2, r = POND_R - 0.5 - R() * 0.6;
    const cx = Math.cos(a) * r, cz = Math.sin(a) * r;
    for (let k = 0; k < 7; k++) {
      const h = 0.8 + R() * 1.0, ox = cx + (R() - 0.5) * 0.8, oz = cz + (R() - 0.5) * 0.8;
      const tilt = [(R() - 0.5) * 0.3, 0, (R() - 0.5) * 0.3];
      reedParts.push([place(new THREE.ConeGeometry(0.04, h, 4), [ox, WATER_Y + h / 2, oz], tilt), R() < 0.5 ? '#2f9e44' : '#43b85a']);
      if (k < 2) reedParts.push([place(new THREE.CapsuleGeometry(0.05, 0.18, 2, 6), [ox, WATER_Y + h * 0.9, oz], tilt), '#7a4a26']);
    }
  }
  const reeds = mesh(merged(reedParts), toon('#ffffff', { vc: true }), { cast: false });
  scene.add(reeds);

  // ── scenery: barn, silo, fence, trees, hills, hay piles, bunting (one merged mesh) ──
  const S = [];
  const barn = (x, z, ry) => {
    const g = [];
    g.push([new THREE.BoxGeometry(7, 4.2, 6), '#d8342a']);
    g.push([place(new THREE.BoxGeometry(7.2, 0.25, 6.2), [0, -2.05, 0]), '#ffffff']);
    // roof
    const tri = new THREE.Shape([new THREE.Vector2(-3.9, 0), new THREE.Vector2(3.9, 0), new THREE.Vector2(0, 2.9)]);
    const gable = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-3.5, 0), new THREE.Vector2(3.5, 0), new THREE.Vector2(0, 2.5)]), { depth: 6, bevelEnabled: false });
    g.push([place(gable, [0, 2.1, -3]), '#d8342a']);
    void tri;
    for (const sx of [-1, 1]) {
      g.push([place(new THREE.BoxGeometry(4.75, 0.28, 6.7), [sx * 1.78, 2.1 + 1.36, 0], [0, 0, -sx * 0.62]), '#7a3a34']);
    }

    g.push([place(new THREE.BoxGeometry(2.4, 2.6, 0.12), [0, -0.8, 3.02]), '#b92a22']);
    g.push([place(new THREE.BoxGeometry(2.6, 0.18, 0.16), [0, 0.5, 3.06]), '#ffffff']);
    g.push([place(new THREE.BoxGeometry(0.18, 2.7, 0.16), [-1.2, -0.8, 3.06]), '#ffffff']);
    g.push([place(new THREE.BoxGeometry(0.18, 2.7, 0.16), [1.2, -0.8, 3.06]), '#ffffff']);
    g.push([place(new THREE.BoxGeometry(0.16, 3.4, 0.14), [0, -0.8, 3.08], [0, 0, 0.74]), '#ffffff']);
    g.push([place(new THREE.BoxGeometry(0.16, 3.4, 0.14), [0, -0.8, 3.08], [0, 0, -0.74]), '#ffffff']);
    g.push([place(new THREE.BoxGeometry(1.2, 1.0, 0.12), [0, 1.6, 3.02]), '#ffffff']);
    g.push([place(new THREE.BoxGeometry(1.0, 0.8, 0.14), [0, 1.6, 3.06]), '#6e2a22']);
    const silo = [place(new THREE.CylinderGeometry(1.3, 1.3, 6.5, 18), [5.2, 1.15, -1]), '#cfd6e2'];
    const siloTop = [place(new THREE.SphereGeometry(1.32, 18, 8, 0, PI * 2, 0, PI / 2), [5.2, 4.4, -1]), '#2f7cff'];
    g.push(silo, siloTop);
    for (const [geo] of g) { geo.translate(0, 2.1, 0); geo.rotateY(ry); geo.translate(x, BANK_Y, z); }
    S.push(...g);
  };
  barn(30, -12, -PI / 2 - 0.35);
  const tree = (x, z, s) => {
    const h = 1.6 * s;
    S.push([place(new THREE.CylinderGeometry(0.22 * s, 0.32 * s, h, 7), [x, BANK_Y + h / 2, z]), '#8a5a2e']);
    const greens = ['#2fa84f', '#3fc25e', '#269447'];
    for (let k = 0; k < 3; k++) {
      S.push([place(new THREE.IcosahedronGeometry((1.3 - k * 0.25) * s, 1), [x + (R() - 0.5) * 0.6 * s, BANK_Y + h + (0.6 + k * 0.9) * s, z + (R() - 0.5) * 0.6 * s]), greens[k]]);
    }
  };
  for (let k = 0; k < 22; k++) {
    const a = (k / 22) * PI * 2 + R() * 0.2, r = 26 + R() * 22;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.hypot(x - 30, z + 12) < 9) continue;
    tree(x, z, 1 + R() * 0.9);
  }
  // fence ring
  const fenceR = 17.5;
  for (let k = 0; k < 64; k++) {
    const a = (k / 64) * PI * 2, x = Math.cos(a) * fenceR, z = Math.sin(a) * fenceR;
    S.push([place(new THREE.BoxGeometry(0.16, 1.2, 0.16), [x, BANK_Y + 0.6, z], [0, -a, 0]), '#ffffff']);
    const a2 = ((k + 0.5) / 64) * PI * 2, len = (2 * PI * fenceR) / 64;
    for (const y of [0.45, 0.9]) S.push([place(new THREE.BoxGeometry(0.08, 0.12, len), [Math.cos(a2) * fenceR, BANK_Y + y, Math.sin(a2) * fenceR], [0, -a2, 0]), '#f4efe6']);
  }
  // hills on the horizon
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * PI * 2 + R() * 0.3, r = 110 + R() * 40;
    S.push([place(new THREE.SphereGeometry(30 + R() * 25, 16, 8), [Math.cos(a) * r, BANK_Y - 14, Math.sin(a) * r], [0, 0, 0], [1.6, 0.8, 1.2]), k % 2 ? '#7fd85a' : '#69c94a']);
  }
  // hay piles + spare bales around the bank
  for (let k = 0; k < 7; k++) {
    const a = R() * PI * 2, r = 14 + R() * 2.5, x = Math.cos(a) * r, z = Math.sin(a) * r;
    S.push([place(new THREE.CylinderGeometry(0.6, 0.6, 0.9, 16), [x, BANK_Y + 0.6, z], [PI / 2, a, 0]), '#eebc52']);
  }
  // bunting poles + flags
  const flagCols = ['#ff3b30', '#ffd21f', '#2f7cff', '#2fc65a', '#ffffff'];
  const poles = [-1.9, -1.2, -0.5, 0.2, 0.9, 1.6, 2.3, 3.0, 3.7, 4.4, 5.1, 5.8];
  const polePos = poles.map((a) => [Math.cos(a) * 13.6, Math.sin(a) * 13.6]);
  for (const [x, z] of polePos) S.push([place(new THREE.CylinderGeometry(0.07, 0.09, 4.2, 6), [x, BANK_Y + 2.1, z]), '#b8763e']);
  for (let p = 0; p < polePos.length - 1; p++) {
    const [x0, z0] = polePos[p], [x1, z1] = polePos[p + 1];
    const n = 9;
    for (let k = 1; k < n; k++) {
      const u = k / n, sag = Math.sin(u * PI) * 0.7;
      const x = x0 + (x1 - x0) * u, z = z0 + (z1 - z0) * u, y = BANK_Y + 4.0 - sag;
      const ang = Math.atan2(z1 - z0, x1 - x0);
      const tri = new THREE.ConeGeometry(0.2, 0.42, 3);
      place(tri, [x, y - 0.22, z], [PI, -ang, 0], [1, 1, 0.15]);
      S.push([tri, flagCols[(k + p) % flagCols.length]]);
    }
  }
  const scenery = mesh(merged(S), toon('#ffffff', { vc: true }), { cast: false, receive: true });
  scene.add(scenery);

  // windmill (blades spin)
  const mill = new THREE.Group();
  mill.position.set(-14, BANK_Y, -34);
  mill.rotation.y = 0.5;
  scene.add(mill);
  mill.add(mesh(merged([
    [place(new THREE.CylinderGeometry(0.9, 1.8, 9, 8), [0, 4.5, 0]), '#f4efe6'],
    [place(new THREE.ConeGeometry(1.4, 2.0, 8), [0, 10, 0]), '#d8342a'],
    [place(new THREE.BoxGeometry(0.9, 1.6, 0.2), [0, 0.8, 1.55]), '#8a5a2e'],
  ]), toon('#ffffff', { vc: true }), { cast: false }));
  const blades = new THREE.Group();
  blades.position.set(0, 8.4, 1.3);
  mill.add(blades);
  const bladeGeo = merged([0, 1, 2, 3].flatMap((k) => [
    [place(new THREE.BoxGeometry(0.25, 4.2, 0.08), [0, 2.2, 0], [0, 0, 0]).rotateZ((k * PI) / 2), '#b8763e'],
    [place(new THREE.BoxGeometry(0.9, 3.2, 0.05), [0.55, 2.5, 0.05]).rotateZ((k * PI) / 2), '#ffffff'],
  ]).concat([[new THREE.SphereGeometry(0.35, 10, 8), '#d8342a']]));
  blades.add(mesh(bladeGeo, toon('#ffffff', { vc: true }), { cast: false }));

  // clouds
  const cloudParts = [];
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * PI * 2 + R(), r = 90 + R() * 70, y = 38 + R() * 30;
    const cx = Math.cos(a) * r, cz = Math.sin(a) * r;
    for (let j = 0; j < 5; j++) {
      cloudParts.push([place(new THREE.IcosahedronGeometry(5 + R() * 4, 1), [cx + (j - 2) * 6, y + (j % 2) * 2.5, cz + (R() - 0.5) * 4], [0, 0, 0], [1.2, 0.7, 1]), '#ffffff']);
    }
  }
  const clouds = mesh(merged(cloudParts), new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }), { cast: false, receive: false });
  scene.add(clouds);

  // ── ducks ──
  const duckMat = toon('#ffffff', { vc: true });
  const ducks = [];
  const dGeoBig = duckGeo('#ffffff'), dGeoSmall = duckGeo('#ffd21f', true);
  for (let k = 0; k < 7; k++) {
    const m = mesh(k < 2 ? dGeoBig : dGeoSmall, duckMat, { cast: false });
    const orbit = 6.2 + (k % 3) * 1.4;
    const d = { m, orbit, a: (k / 7) * PI * 2 + (k > 1 ? 0.25 * k : 0), speed: (k % 2 ? 1 : -1) * (0.08 + R() * 0.05),
      flee: new THREE.Vector2(), fleeT: 0, bob: R() * 6, pos: new THREE.Vector2() };
    d.pos.set(Math.cos(d.a) * orbit, Math.sin(d.a) * orbit);
    scene.add(m);
    ducks.push(d);
  }

  // ── crowd on the bank ──
  const crowd = [];
  const kinds = ['cow', 'pig', 'sheep', 'goat', 'chick', 'horse'];
  const crowdMat = toon('#ffffff', { vc: true });
  const crowdAngles = [];
  for (let k = 0; k < 13; k++) crowdAngles.push(-2.2 + k * 0.24 + (R() - 0.5) * 0.08);
  for (let k = 0; k < crowdAngles.length; k++) {
    const a = crowdAngles[k], r = POND_R + 1.2 + (k % 2) * 0.9;
    const m = mesh(crowdGeo(kinds[k % kinds.length], R), crowdMat, { cast: true, receive: false });
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    m.position.set(x, BANK_Y, z);
    m.rotation.y = Math.atan2(-x, -z);
    m.scale.setScalar(1.1 + R() * 0.25);
    scene.add(m);
    crowd.push({ m, ph: R() * 6, jump: 0, vy: 0, y: 0, base: m.rotation.y });
  }
  let excite = 0;

  // ── state / API ──
  let time = 0;
  let rippleIdx = 0;
  let arenaR = ARENA.radius;
  let suddenPulse = false;
  const listeners = { baleSplash: [] };
  const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), vv = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  const tiltQ = new THREE.Quaternion(), axisV = new THREE.Vector3();

  function ripple(x, z, amp = 1) {
    waterMat.uniforms.ripples.value[rippleIdx].set(x, z, time, amp);
    rippleIdx = (rippleIdx + 1) % 8;
  }
  function scatterDucks(x, z) {
    for (const d of ducks) {
      const dx = d.pos.x - x, dz = d.pos.y - z, dist = Math.hypot(dx, dz);
      if (dist < 9) {
        d.flee.set(dx, dz).normalize().multiplyScalar(4.5 * (1 - dist / 12) + 1.5);
        d.fleeT = 1.6;
      }
    }
  }
  function cheer(k = 1) { excite = Math.min(1.5, excite + k); for (const c of crowd) if (c.y <= 0.001 && Math.random() < 0.4 + 0.5 * k) c.vy = 2 + Math.random() * 2 * k; }

  function updateRings(dt) {
    for (const ring of rings) {
      const shouldDrop = arenaR < ring.inner + (ring.outer - ring.inner) * 0.55;
      if (shouldDrop && ring.drop < 0) ring.drop = 0;
      if (!shouldDrop && ring.drop >= 0) {
        // restored (new round): put every bale back
        ring.drop = -1; ring.splashed.clear();
        let i = 0;
        for (const b of ring.base) { m4.compose(b.p, b.q, one); ring.im.setMatrixAt(i++, m4); }
        ring.im.instanceMatrix.needsUpdate = true;
        if (ring.k === RINGS.length - 1) { plankGroup.position.set(0, 0, 0); plankGroup.rotation.set(0, 0, 0); plankGroup.visible = true; }
        continue;
      }
      if (ring.drop < 0 || ring.drop > 6) continue;
      ring.drop += dt;
      let i = 0;
      for (const b of ring.base) {
        // a wave runs round the ring; each bale tips outward then drops and floats
        const delay = ((b.a / (PI * 2)) * 0.9 + b.L * 0.05);
        const t = Math.max(0, ring.drop - delay);
        const tip = Math.min(1.25, t * t * 5);
        const fall = Math.max(0, t - 0.25);
        let y = b.p.y - 4.9 * fall * fall;
        const out = 0.9 * Math.min(1, fall * 1.4);
        const floatY = WATER_Y - 0.15 - b.L * 0.9;
        let bob = 0;
        if (y < floatY) {
          y = floatY;
          bob = b.L === 0 ? Math.sin(time * 2 + b.a * 5) * 0.05 : -Math.min(3, (fall - 0.6) * 2);
          if (b.L === 0 && !ring.splashed.has(b)) {
            ring.splashed.add(b);
            const x = Math.cos(b.a) * (ring.rMid + out), z = Math.sin(b.a) * (ring.rMid + out);
            ripple(x, z, 0.6);
            for (const f of listeners.baleSplash) f(x, z);
          }
        }
        vv.set(Math.cos(b.a) * (ring.rMid + out), y + bob, Math.sin(b.a) * (ring.rMid + out));
        axisV.set(-Math.sin(b.a), 0, Math.cos(b.a));
        tiltQ.setFromAxisAngle(axisV, -tip * (b.L === 0 ? 1 : 0.3));
        qq.copy(tiltQ).multiply(b.q);
        m4.compose(vv, qq, one);
        ring.im.setMatrixAt(i++, m4);
      }
      ring.im.instanceMatrix.needsUpdate = true;
      if (ring.k === RINGS.length - 1) {
        const t = Math.max(0, ring.drop - 0.2);
        plankGroup.position.y = -4.9 * t * t;
        if (plankGroup.position.y < -4) plankGroup.visible = false;
      }
    }
    // the visible stack radius (for the water foam)
    let visR = RINGS[0][1];
    for (const ring of rings) if (ring.drop < 0) visR = ring.outer;
    waterMat.uniforms.platformR.value = visR;
  }

  function update(dt) {
    time += dt;
    waterMat.uniforms.time.value = time;
    blades.rotation.z -= dt * 0.8;
    clouds.rotation.y += dt * 0.004;
    updateRings(dt);
    // edge ring
    edgeRing.scale.setScalar(Math.max(0.5, arenaR));
    edgeMat.color.set(suddenPulse ? '#ff3b30' : '#ffffff');
    edgeMat.opacity = suddenPulse ? 0.55 + 0.35 * Math.sin(time * 9) : 0.55;
    // lily pads bob
    for (let k = 0; k < padSpots.length; k++) {
      const p = padSpots[k];
      vv.set(p.x, WATER_Y + 0.02 + Math.sin(time * 1.3 + p.ph) * 0.015, p.z);
      qq.setFromAxisAngle(axisV.set(0, 1, 0), p.rot + Math.sin(time * 0.4 + p.ph) * 0.1);
      m4.compose(vv, qq, axisV.set(p.s, 1, p.s));
      pads.setMatrixAt(k, m4);
      if (k < 7) { vv.y += 0.01; m4.compose(vv, qq, axisV.set(1, 1, 1)); flowers.setMatrixAt(k, m4); }
    }
    pads.instanceMatrix.needsUpdate = true;
    flowers.instanceMatrix.needsUpdate = true;
    // ducks
    for (const d of ducks) {
      let vx, vz;
      if (d.fleeT > 0) {
        d.fleeT -= dt;
        vx = d.flee.x; vz = d.flee.y;
        d.flee.multiplyScalar(Math.exp(-dt * 1.5));
      } else {
        d.a += d.speed * dt;
        const tx = Math.cos(d.a) * d.orbit, tz = Math.sin(d.a) * d.orbit;
        vx = (tx - d.pos.x) * 0.8; vz = (tz - d.pos.y) * 0.8;
      }
      d.pos.x += vx * dt; d.pos.y += vz * dt;
      const r = Math.hypot(d.pos.x, d.pos.y);
      const minR = Math.max(arenaR, RINGS[0][1]) + 1.0;
      if (r > POND_R - 0.8) d.pos.multiplyScalar((POND_R - 0.8) / r);
      if (r < minR) d.pos.multiplyScalar(minR / Math.max(0.01, r));
      d.bob += dt * (d.fleeT > 0 ? 14 : 3);
      d.m.position.set(d.pos.x, WATER_Y - 0.06 + Math.abs(Math.sin(d.bob)) * (d.fleeT > 0 ? 0.12 : 0.02), d.pos.y);
      if (Math.hypot(vx, vz) > 0.05) {
        const target = Math.atan2(vx, vz);
        let diff = target - d.m.rotation.y;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        d.m.rotation.y += diff * Math.min(1, dt * 6);
      }
      d.m.rotation.z = d.fleeT > 0 ? Math.sin(d.bob) * 0.2 : 0;
    }
    // crowd: idle sway, jumps when excited
    excite = Math.max(0, excite - dt * 0.6);
    for (const c of crowd) {
      c.vy -= 12 * dt;
      c.y += c.vy * dt;
      if (c.y < 0) { c.y = 0; c.vy = excite > 0.2 && Math.random() < dt * 4 * excite ? 1.5 + Math.random() * 1.5 : 0; }
      c.m.position.y = BANK_Y + c.y;
      c.m.rotation.y = c.base + Math.sin(time * 1.5 + c.ph) * 0.15;
      c.m.rotation.z = Math.sin(time * 2.3 + c.ph) * (0.04 + excite * 0.1);
    }
  }

  function setArenaRadius(r, pulse = false) { arenaR = r; suddenPulse = pulse; }

  /** A spot on the bank for a soggy loser to sulk (side = sign of x where it fell). */
  function bankSpot(side, out = new THREE.Vector3()) {
    const a = side >= 0 ? -0.35 : PI + 0.35;
    return out.set(Math.cos(a) * (POND_R + 0.7), BANK_Y, Math.sin(a) * (POND_R + 0.7));
  }

  return {
    scene, sun, hemi, water, update, ripple, scatterDucks, cheer, setArenaRadius, bankSpot,
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
