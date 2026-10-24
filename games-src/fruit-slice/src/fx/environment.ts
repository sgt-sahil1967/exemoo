import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { Quality } from './renderer';
import { ctx2d, makeCanvas, mulberry32 } from './textures';

/** Table bounds from the contract. */
export const TABLE = { minX: -4.2, maxX: 4.2, minZ: -2.2, maxZ: 1.6, topY: 0 } as const;

const BG = 0x1b1410;

// ------------------------------------------------------------ textures ---

function makeWoodTextures(w: number, h: number): { color: HTMLCanvasElement; bump: HTMLCanvasElement } {
  const color = makeCanvas(w, h);
  const bump = makeCanvas(w, h);
  const c = ctx2d(color);
  const b = ctx2d(bump);
  const rnd = mulberry32(1337);
  const planks = 12;
  const pw = w / planks;
  b.fillStyle = '#808080';
  b.fillRect(0, 0, w, h);

  for (let p = 0; p < planks; p++) {
    const x0 = p * pw;
    // per-plank tone variation around oak #c8894f
    const hue = 28 + (rnd() - 0.5) * 6;
    const sat = 48 + (rnd() - 0.5) * 12;
    const lit = 52 + (rnd() - 0.5) * 9;
    const lg = c.createLinearGradient(0, 0, 0, h);
    lg.addColorStop(0, `hsl(${hue},${sat}%,${lit - 3}%)`);
    lg.addColorStop(0.5, `hsl(${hue + 1},${sat + 3}%,${lit + 2}%)`);
    lg.addColorStop(1, `hsl(${hue},${sat}%,${lit - 4}%)`);
    c.fillStyle = lg;
    c.fillRect(x0, 0, pw + 1, h);

    // grain lines along the plank length
    const lines = Math.round(pw / 3.2);
    const phase = rnd() * 100;
    const freq = 0.004 + rnd() * 0.004;
    const amp = pw * (0.03 + rnd() * 0.05);
    for (let i = 0; i < lines; i++) {
      const gx = x0 + (i / lines) * pw + rnd() * 2;
      const dark = rnd() < 0.72;
      const a = dark ? 0.05 + rnd() * 0.16 : 0.04 + rnd() * 0.07;
      c.strokeStyle = dark ? `rgba(92,44,14,${a})` : `rgba(255,222,170,${a})`;
      c.lineWidth = 0.6 + rnd() * rnd() * 3.2;
      b.strokeStyle = dark ? `rgba(60,60,60,${a * 1.4})` : `rgba(170,170,170,${a})`;
      b.lineWidth = c.lineWidth;
      c.beginPath();
      b.beginPath();
      const localPhase = phase + i * 0.17;
      for (let y = -8; y <= h + 8; y += 8) {
        const off = Math.sin(y * freq + localPhase) * amp + Math.sin(y * freq * 3.1 + localPhase * 2) * amp * 0.25;
        const xx = Math.min(x0 + pw - 1, Math.max(x0 + 1, gx + off));
        if (y === -8) { c.moveTo(xx, y); b.moveTo(xx, y); } else { c.lineTo(xx, y); b.lineTo(xx, y); }
      }
      c.stroke();
      b.stroke();
    }
    // occasional knot
    if (rnd() < 0.45) {
      const kx = x0 + pw * (0.3 + rnd() * 0.4);
      const ky = rnd() * h;
      for (let r = 6; r > 0; r--) {
        c.strokeStyle = `rgba(90,42,12,${0.08 + (6 - r) * 0.03})`;
        c.lineWidth = 1.4;
        c.beginPath();
        c.ellipse(kx, ky, r * pw * 0.028, r * pw * 0.09, 0, 0, Math.PI * 2);
        c.stroke();
      }
      c.fillStyle = 'rgba(70,32,10,0.45)';
      c.beginPath();
      c.ellipse(kx, ky, pw * 0.03, pw * 0.08, 0, 0, Math.PI * 2);
      c.fill();
    }
    // butt joint across the plank
    if (rnd() < 0.7) {
      const jy = h * (0.15 + rnd() * 0.7);
      c.fillStyle = 'rgba(48,22,8,0.75)';
      c.fillRect(x0, jy, pw, 2);
      c.fillStyle = 'rgba(255,215,160,0.12)';
      c.fillRect(x0, jy + 2, pw, 1);
      b.fillStyle = '#202020';
      b.fillRect(x0, jy - 1, pw, 3);
    }
    // seam between planks
    c.fillStyle = 'rgba(40,18,6,0.9)';
    c.fillRect(x0 - 1, 0, 3, h);
    c.fillStyle = 'rgba(255,214,160,0.16)';
    c.fillRect(x0 + 2, 0, 2, h);
    b.fillStyle = '#101010';
    b.fillRect(x0 - 2, 0, 5, h);
  }
  // gentle vignette in the varnish so the centre reads as the "stage"
  c.globalCompositeOperation = 'multiply';
  const vg = c.createRadialGradient(w / 2, h * 0.42, h * 0.15, w / 2, h * 0.5, w * 0.62);
  vg.addColorStop(0, 'rgb(255,250,242)');
  vg.addColorStop(1, 'rgb(170,140,120)');
  c.fillStyle = vg;
  c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = 'source-over';
  return { color, bump };
}

/** Back wall: backlit shoji screen panels in a dark room. World: 30 wide, y -5..11. */
function makeWallTexture(w: number, h: number): HTMLCanvasElement {
  const cv = makeCanvas(w, h);
  const g = ctx2d(cv);
  const X = (x: number) => ((x + 15) / 30) * w;
  const Y = (y: number) => ((11 - y) / 16) * h;
  // base dark warm gradient
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#0e0a08');
  bg.addColorStop(0.45, '#2a1c13');
  bg.addColorStop(0.75, '#1b1410');
  bg.addColorStop(1, '#080605');
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);

  if ('filter' in g) g.filter = 'blur(1.2px)';
  const top = 6.2;
  const bot = -0.6;
  const panelW = 3;
  for (let i = -3; i < 3; i++) {
    const x0 = i * panelW;
    const x1 = x0 + panelW;
    // paper glow, brightest around centre / slightly below middle
    const cx = (X(x0) + X(x1)) / 2;
    const glow = g.createRadialGradient(X(0), Y(2.2), 0, X(0), Y(2.2), X(11) - X(0));
    glow.addColorStop(0, '#f4c98a');
    glow.addColorStop(0.45, '#c88a4c');
    glow.addColorStop(1, '#4a2d18');
    g.fillStyle = glow;
    g.fillRect(X(x0), Y(top), X(x1) - X(x0), Y(bot) - Y(top));
    // vertical paper warmth variation
    const pv = g.createLinearGradient(0, Y(top), 0, Y(bot));
    pv.addColorStop(0, 'rgba(20,10,4,0.55)');
    pv.addColorStop(0.35, 'rgba(20,10,4,0)');
    pv.addColorStop(1, 'rgba(20,10,4,0.35)');
    g.fillStyle = pv;
    g.fillRect(X(x0), Y(top), X(x1) - X(x0), Y(bot) - Y(top));
    // kumiko lattice
    g.strokeStyle = 'rgba(38,22,12,0.82)';
    g.lineWidth = Math.max(1, w / 900);
    const cols = 3;
    const rows = 6;
    for (let k = 1; k < cols; k++) {
      const lx = X(x0 + (k / cols) * panelW);
      g.beginPath(); g.moveTo(lx, Y(top)); g.lineTo(lx, Y(bot)); g.stroke();
    }
    for (let k = 1; k < rows; k++) {
      const ly = Y(bot + (k / rows) * (top - bot));
      g.beginPath(); g.moveTo(X(x0), ly); g.lineTo(X(x1), ly); g.stroke();
    }
    // frame
    g.strokeStyle = '#1e130c';
    g.lineWidth = Math.max(2, w / 260);
    g.strokeRect(X(x0), Y(top), X(x1) - X(x0), Y(bot) - Y(top));
    void cx;
  }
  // header beam + base rail
  g.fillStyle = '#140d09';
  g.fillRect(0, Y(top + 0.9), w, Y(top) - Y(top + 0.9));
  g.fillRect(0, Y(bot), w, Y(bot - 0.8) - Y(bot));
  // side posts
  g.fillRect(X(-9.6), Y(top + 1), X(-9) - X(-9.6), Y(bot - 1) - Y(top + 1));
  g.fillRect(X(9), Y(top + 1), X(9.6) - X(9), Y(bot - 1) - Y(top + 1));
  if ('filter' in g) g.filter = 'none';
  // overall falloff toward the sides
  const side = g.createLinearGradient(0, 0, w, 0);
  side.addColorStop(0, 'rgba(8,5,3,0.9)');
  side.addColorStop(0.22, 'rgba(8,5,3,0.15)');
  side.addColorStop(0.5, 'rgba(8,5,3,0)');
  side.addColorStop(0.78, 'rgba(8,5,3,0.15)');
  side.addColorStop(1, 'rgba(8,5,3,0.9)');
  g.fillStyle = side;
  g.fillRect(0, 0, w, h);
  return cv;
}

/** Bamboo silhouette on a transparent canvas. */
function makeBambooTexture(w: number, h: number, seed: number): HTMLCanvasElement {
  const cv = makeCanvas(w, h);
  const g = ctx2d(cv);
  const rnd = mulberry32(seed);
  if ('filter' in g) g.filter = 'blur(1.5px)';
  const stalks = 4;
  for (let s = 0; s < stalks; s++) {
    const x = w * (0.12 + (s / stalks) * 0.8 + (rnd() - 0.5) * 0.08);
    const sw = w * (0.035 + rnd() * 0.03);
    const lean = (rnd() - 0.5) * w * 0.12;
    const shade = 14 + Math.floor(rnd() * 10);
    g.fillStyle = `rgb(${shade},${shade + 4},${shade - 4})`;
    g.beginPath();
    g.moveTo(x - sw / 2, h);
    g.quadraticCurveTo(x - sw / 2 + lean * 0.3, h * 0.5, x + lean - sw / 2.5, 0);
    g.lineTo(x + lean + sw / 2.5, 0);
    g.quadraticCurveTo(x + sw / 2 + lean * 0.3, h * 0.5, x + sw / 2, h);
    g.fill();
    // nodes
    g.fillStyle = `rgba(0,0,0,0.6)`;
    for (let ny = h * (0.1 + rnd() * 0.1); ny < h; ny += h * (0.12 + rnd() * 0.05)) {
      const t = 1 - ny / h;
      const nx = x + lean * t * t * 0.9 + lean * t * 0.1;
      g.fillRect(nx - sw * 0.62, ny, sw * 1.24, Math.max(2, h * 0.006));
    }
    // leaves near the top
    g.fillStyle = `rgb(${shade + 2},${shade + 8},${shade - 2})`;
    const leaves = 8 + Math.floor(rnd() * 8);
    for (let l = 0; l < leaves; l++) {
      const ly = h * (0.02 + rnd() * 0.45);
      const t = 1 - ly / h;
      const lx = x + lean * t * t;
      const dir = rnd() < 0.5 ? -1 : 1;
      const len = w * (0.18 + rnd() * 0.2);
      const ang = dir * (0.2 + rnd() * 0.6) + (dir < 0 ? Math.PI : 0);
      const ex = lx + Math.cos(ang) * len;
      const ey = ly + Math.sin(Math.abs(ang)) * len * 0.35 + len * 0.15;
      const lw = len * 0.13;
      g.beginPath();
      g.moveTo(lx, ly);
      g.quadraticCurveTo((lx + ex) / 2, (ly + ey) / 2 - lw, ex, ey);
      g.quadraticCurveTo((lx + ex) / 2, (ly + ey) / 2 + lw, lx, ly);
      g.fill();
    }
  }
  return cv;
}

// ---------------------------------------------------------------- motes ---

const MOTE_VS = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float s = aSeed;
    p.y = mod(p.y + uTime * (0.04 + 0.05 * s), 6.5) - 0.3;
    p.x += sin(uTime * (0.15 + 0.2 * s) + s * 31.0) * 0.35;
    p.z += cos(uTime * (0.12 + 0.15 * s) + s * 17.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.6 + s) * (300.0 / -mv.z);
    float tw = 0.55 + 0.45 * sin(uTime * (1.0 + 2.0 * s) + s * 50.0);
    float edge = smoothstep(-0.3, 0.6, p.y) * (1.0 - smoothstep(5.0, 6.2, p.y));
    vAlpha = tw * edge;
  }
`;
const MOTE_FS = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float a = smoothstep(0.5, 0.0, length(d));
    gl_FragColor = vec4(uColor * a * vAlpha * uOpacity, 1.0);
    #include <colorspace_fragment>
  }
`;

// --------------------------------------------------------- Environment ---

/**
 * Dojo table, shoji backdrop, bamboo silhouettes, lights, fog and dust motes.
 * Owns everything static in the scene.
 */
export class Environment {
  readonly tableTopY = 0;
  readonly group = new THREE.Group();
  readonly keyLight: THREE.DirectionalLight;
  private quality: Quality;
  private motes: THREE.Points;
  private moteMat: THREE.ShaderMaterial;
  private disposables: { dispose(): void }[] = [];
  private scene: THREE.Scene;
  private woodTex: THREE.CanvasTexture;

  constructor(scene: THREE.Scene, quality: Quality = 'high') {
    this.scene = scene;
    this.quality = quality;
    scene.background = new THREE.Color(BG);
    scene.fog = new THREE.Fog(BG, 11, 24);
    this.group.name = 'Environment';
    scene.add(this.group);

    // ---- table
    const hi = quality === 'high';
    const wood = makeWoodTextures(hi ? 2048 : 1024, hi ? 1024 : 512);
    const woodTex = new THREE.CanvasTexture(wood.color);
    woodTex.colorSpace = THREE.SRGBColorSpace;
    woodTex.anisotropy = 8;
    this.woodTex = woodTex;
    const bumpTex = new THREE.CanvasTexture(wood.bump);
    bumpTex.anisotropy = 8;
    const topMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      bumpMap: bumpTex,
      bumpScale: 1.4,
      roughness: 0.5,
      metalness: 0,
      color: 0xffffff,
    });
    const sideMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.62,
      color: 0x9a7a62,
    });
    const width = TABLE.maxX - TABLE.minX;
    const depth = TABLE.maxZ - TABLE.minZ;
    const thick = 0.34;
    const tableGeo = new RoundedBoxGeometry(width, thick, depth, 4, 0.09);
    // BoxGeometry groups: +x, -x, +y, -y, +z, -z
    const table = new THREE.Mesh(tableGeo, [sideMat, sideMat, topMat, sideMat, sideMat, sideMat]);
    table.position.set((TABLE.minX + TABLE.maxX) / 2, TABLE.topY - thick / 2, (TABLE.minZ + TABLE.maxZ) / 2);
    table.receiveShadow = true;
    table.castShadow = true;
    table.name = 'Table';
    this.group.add(table);
    // dark inset apron below the top for a chunky, layered silhouette
    const apronMat = new THREE.MeshStandardMaterial({ color: 0x3a2416, roughness: 0.8 });
    const apronGeo = new RoundedBoxGeometry(width - 0.5, 0.5, depth - 0.5, 2, 0.05);
    const apron = new THREE.Mesh(apronGeo, apronMat);
    apron.position.set(table.position.x, TABLE.topY - thick - 0.25, table.position.z);
    apron.receiveShadow = true;
    this.group.add(apron);
    this.disposables.push(woodTex, bumpTex, topMat, sideMat, tableGeo, apronMat, apronGeo);

    // ---- back wall (shoji)
    const wallCv = makeWallTexture(hi ? 1024 : 512, hi ? 544 : 272);
    const wallTex = new THREE.CanvasTexture(wallCv);
    wallTex.colorSpace = THREE.SRGBColorSpace;
    const wallMat = new THREE.MeshBasicMaterial({ map: wallTex, color: 0x9a8a80, fog: true });
    const wallGeo = new THREE.PlaneGeometry(30, 16);
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 3, -8);
    this.group.add(wall);
    this.disposables.push(wallTex, wallMat, wallGeo);

    // ---- bamboo silhouettes (parallax layer in front of the wall)
    const bambooGeo = new THREE.PlaneGeometry(4.6, 10);
    this.disposables.push(bambooGeo);
    for (const side of [-1, 1]) {
      const cv = makeBambooTexture(256, 560, side < 0 ? 11 : 29);
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: true, color: 0xffffff });
      const m = new THREE.Mesh(bambooGeo, mat);
      m.position.set(side * 8.2, 3.4, -6.6);
      m.scale.x = side;
      m.renderOrder = -1;
      this.group.add(m);
      this.disposables.push(tex, mat);
    }

    // ---- floor (mostly hidden under the table, catches stray light)
    const floorGeo = new THREE.PlaneGeometry(40, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x120c08, roughness: 1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -3.2, -2);
    this.group.add(floor);
    this.disposables.push(floorGeo, floorMat);

    // ---- lights
    const hemi = new THREE.HemisphereLight(0xffe0bd, 0x2a1a10, 0.75);
    this.group.add(hemi);

    // key: warm, high and slightly behind so fruit over the far edge throw shadows onto the table
    const key = new THREE.DirectionalLight(0xffd3a2, 2.7);
    key.position.set(-2.6, 11, -4.2);
    key.target.position.set(0.3, 0, -1.0);
    key.castShadow = true;
    const sc = key.shadow.camera;
    sc.left = -6.5; sc.right = 6.5; sc.top = 5.5; sc.bottom = -5.5;
    sc.near = 2; sc.far = 22;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.025;
    key.shadow.radius = 4;
    this.keyLight = key;
    this.group.add(key, key.target);
    this.applyShadowQuality();

    // warm frontal fill so the camera-facing side of fruit reads saturated
    const fill = new THREE.DirectionalLight(0xffe4c4, 1.15);
    fill.position.set(2.5, 4.5, 8);
    this.group.add(fill);

    // cool rim from behind-right
    const rim = new THREE.DirectionalLight(0x9cc2ff, 1.6);
    rim.position.set(5, 3.5, -9);
    rim.target.position.set(0, 2.5, -2.8);
    this.group.add(rim, rim.target);

    // ---- dust motes
    const count = 160;
    const pos = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const rnd = mulberry32(99);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rnd() - 0.5) * 12;
      pos[i * 3 + 1] = rnd() * 6.5;
      pos[i * 3 + 2] = -5 + rnd() * 5.5;
      seeds[i] = rnd();
    }
    const mg = new THREE.BufferGeometry();
    mg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    mg.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    this.moteMat = new THREE.ShaderMaterial({
      vertexShader: MOTE_VS,
      fragmentShader: MOTE_FS,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 0.07 },
        uColor: { value: new THREE.Color(0xffc98a) },
        uOpacity: { value: 0.5 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.motes = new THREE.Points(mg, this.moteMat);
    this.motes.frustumCulled = false;
    this.group.add(this.motes);
    this.disposables.push(mg, this.moteMat);
    this.setQuality(quality);
  }

  private applyShadowQuality(): void {
    const size = this.quality === 'high' ? 2048 : 1024;
    const sh = this.keyLight.shadow;
    if (sh.mapSize.x !== size) {
      sh.mapSize.set(size, size);
      if (sh.map) { sh.map.dispose(); sh.map = null; }
    }
    sh.radius = this.quality === 'high' ? 4 : 2;
  }

  setQuality(q: Quality): void {
    this.quality = q;
    this.applyShadowQuality();
    this.motes.geometry.setDrawRange(0, q === 'high' ? 160 : 60);
  }

  update(_dt: number, time: number): void {
    this.moteMat.uniforms.uTime.value = time;
  }

  dispose(): void {
    this.scene.remove(this.group);
    for (const d of this.disposables) d.dispose();
    this.disposables.length = 0;
    void this.woodTex;
  }
}
