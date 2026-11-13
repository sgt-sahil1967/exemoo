// Pooled particles + tracer/shockwave/flash meshes, skid marks, debris and confetti.
// Everything is pre-allocated: no per-frame allocation. Caps: 520 additive + 420 normal points,
// 80 debris chunks, 140 confetti, 200 skid segments, a handful of flash/ring/sprite meshes.
import * as THREE from 'three';

export interface Fx {
  explosion(pos: THREE.Vector3, size: number, color?: number): void;
  muzzle(pos: THREE.Vector3, dir: THREE.Vector3): void;
  tracer(from: THREE.Vector3, to: THREE.Vector3, color?: number): void;
  impact(pos: THREE.Vector3, color?: number): void;
  smoke(pos: THREE.Vector3, size?: number): void;
  dust(pos: THREE.Vector3, vel: THREE.Vector3): void;
  pickupBurst(pos: THREE.Vector3, color: number): void;
  nitro(pos: THREE.Vector3, dir: THREE.Vector3): void;
  /** Call every frame while drifting/skidding with the world positions of the two rear tyre contact points; intensity 0 ends the strip. */
  skid(left: THREE.Vector3, right: THREE.Vector3, intensity: number): void;
  /** Grey-white tyre smoke puff. `dir` = drift direction (puffs trail away from it), `amount` 0..1+. */
  tireSmoke(pos: THREE.Vector3, dir: THREE.Vector3, amount: number): void;
  /** Big ground ring + dust ring (boss kills). `size` ~ 3..8. */
  shockwave(pos: THREE.Vector3, size: number): void;
  /** Chunky low-poly bits with gravity + bounce. */
  debris(pos: THREE.Vector3, color: number, n: number): void;
  /** Boss / zone celebration. */
  confetti(pos: THREE.Vector3): void;
  /** Drift sparks: call per frame (probabilistically) with the contact position and car velocity. */
  sparkTrail(pos: THREE.Vector3, vel: THREE.Vector3): void;
  /** Floating hit-confirm cross at a world position. */
  hitMarker3D(pos: THREE.Vector3): void;
  update(dt: number): void;
  /** Pixels per metre at 1 m distance (canvas height / (2 tan(fov/2))). Default 700. */
  setViewScale(px: number): void;
}

const VS = /* glsl */ `
attribute float size; attribute vec4 col;
uniform float uScale; varying vec4 vC;
void main(){ vC = col; vec4 mv = modelViewMatrix * vec4(position,1.0);
  gl_PointSize = size * uScale / max(0.1, -mv.z); gl_Position = projectionMatrix * mv; }`;
const FS = /* glsl */ `
varying vec4 vC; uniform float uSoft;
void main(){ vec2 p = gl_PointCoord - 0.5; float r = length(p) * 2.0;
  float a = 1.0 - smoothstep(uSoft, 1.0, r); if (a * vC.a < 0.01) discard;
  gl_FragColor = vec4(vC.rgb, vC.a * a); }`;

class Pool {
  readonly points: THREE.Points;
  private n: number;
  private pos: Float32Array; private vel: Float32Array; private col: Float32Array; private siz: Float32Array;
  private life: Float32Array; private max: Float32Array; private s0: Float32Array; private s1: Float32Array;
  private grav: Float32Array; private drag: Float32Array; private c0: Float32Array; private c1: Float32Array;
  private next = 0;
  private geo = new THREE.BufferGeometry();
  private mat: THREE.ShaderMaterial;

  constructor(n: number, additive: boolean, soft: number, scene: THREE.Scene) {
    this.n = n;
    this.pos = new Float32Array(n * 3); this.vel = new Float32Array(n * 3); this.col = new Float32Array(n * 4);
    this.siz = new Float32Array(n); this.life = new Float32Array(n); this.max = new Float32Array(n).fill(1);
    this.s0 = new Float32Array(n); this.s1 = new Float32Array(n); this.grav = new Float32Array(n); this.drag = new Float32Array(n);
    this.c0 = new Float32Array(n * 3); this.c1 = new Float32Array(n * 3);
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('col', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('size', new THREE.BufferAttribute(this.siz, 1).setUsage(THREE.DynamicDrawUsage));
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: { uScale: { value: 700 }, uSoft: { value: soft } },
    });
    this.points = new THREE.Points(this.geo, this.mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = additive ? 11 : 10;
    scene.add(this.points);
  }
  setScale(v: number) { this.mat.uniforms.uScale.value = v; }
  /** Emit one particle. Colours are 0xRRGGBB, fading c0 -> c1; size s0 -> s1 metres. */
  emit(x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, s0: number, s1: number, c0: number, c1: number, grav = 0, drag = 0) {
    const i = this.next;
    this.next = (this.next + 1) % this.n;
    const p = i * 3;
    this.pos[p] = x; this.pos[p + 1] = y; this.pos[p + 2] = z;
    this.vel[p] = vx; this.vel[p + 1] = vy; this.vel[p + 2] = vz;
    this.life[i] = life; this.max[i] = life; this.s0[i] = s0; this.s1[i] = s1; this.grav[i] = grav; this.drag[i] = drag;
    this.c0[p] = ((c0 >> 16) & 255) / 255; this.c0[p + 1] = ((c0 >> 8) & 255) / 255; this.c0[p + 2] = (c0 & 255) / 255;
    this.c1[p] = ((c1 >> 16) & 255) / 255; this.c1[p + 1] = ((c1 >> 8) & 255) / 255; this.c1[p + 2] = (c1 & 255) / 255;
  }
  update(dt: number) {
    for (let i = 0; i < this.n; i++) {
      const l = this.life[i];
      const c = i * 4, p = i * 3;
      if (l <= 0) { if (this.col[c + 3] !== 0) { this.col[c + 3] = 0; this.siz[i] = 0; } continue; }
      const nl = l - dt;
      this.life[i] = nl;
      if (nl <= 0) { this.col[c + 3] = 0; this.siz[i] = 0; continue; }
      const k = 1 - nl / this.max[i];
      const dr = Math.max(0, 1 - this.drag[i] * dt);
      this.vel[p] *= dr; this.vel[p + 1] = this.vel[p + 1] * dr - this.grav[i] * dt; this.vel[p + 2] *= dr;
      this.pos[p] += this.vel[p] * dt; this.pos[p + 1] += this.vel[p + 1] * dt; this.pos[p + 2] += this.vel[p + 2] * dt;
      this.siz[i] = this.s0[i] + (this.s1[i] - this.s0[i]) * k;
      this.col[c] = this.c0[p] + (this.c1[p] - this.c0[p]) * k;
      this.col[c + 1] = this.c0[p + 1] + (this.c1[p + 1] - this.c0[p + 1]) * k;
      this.col[c + 2] = this.c0[p + 2] + (this.c1[p + 2] - this.c0[p + 2]) * k;
      this.col[c + 3] = k < 0.12 ? k / 0.12 : 1 - (k - 0.12) / 0.88;
    }
    (this.geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.geo.attributes.col as THREE.BufferAttribute).needsUpdate = true;
    (this.geo.attributes.size as THREE.BufferAttribute).needsUpdate = true;
  }
}

/** Instanced rigid bits (debris chunks / confetti). One draw call each. */
class Bits {
  readonly mesh: THREE.InstancedMesh;
  private n: number;
  private p: Float32Array; private v: Float32Array; private r: Float32Array; private w: Float32Array;
  private life: Float32Array; private max: Float32Array; private sc: Float32Array;
  private next = 0;
  private qa = new THREE.Quaternion(); private ea = new THREE.Euler(); private ma = new THREE.Matrix4();
  private pa = new THREE.Vector3(); private sa = new THREE.Vector3(); private ca = new THREE.Color();
  private zero = new THREE.Matrix4().makeScale(0, 0, 0);
  constructor(geo: THREE.BufferGeometry, mat: THREE.Material, n: number, scene: THREE.Scene, private grav: number, private bounce: number, private flutter: boolean) {
    this.n = n;
    this.p = new Float32Array(n * 3); this.v = new Float32Array(n * 3); this.r = new Float32Array(n * 3); this.w = new Float32Array(n * 3);
    this.life = new Float32Array(n); this.max = new Float32Array(n).fill(1); this.sc = new Float32Array(n);
    this.mesh = new THREE.InstancedMesh(geo, mat, n);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.castShadow = false; this.mesh.receiveShadow = false;
    this.mesh.renderOrder = 9;
    for (let i = 0; i < n; i++) { this.mesh.setMatrixAt(i, this.zero); this.mesh.setColorAt(i, this.ca.setRGB(1, 1, 1)); }
    scene.add(this.mesh);
  }
  emit(x: number, y: number, z: number, vx: number, vy: number, vz: number, scale: number, color: number, life: number) {
    const i = this.next; this.next = (this.next + 1) % this.n;
    const q = i * 3;
    this.p[q] = x; this.p[q + 1] = y; this.p[q + 2] = z;
    this.v[q] = vx; this.v[q + 1] = vy; this.v[q + 2] = vz;
    this.r[q] = Math.random() * 6; this.r[q + 1] = Math.random() * 6; this.r[q + 2] = Math.random() * 6;
    this.w[q] = (Math.random() - 0.5) * 16; this.w[q + 1] = (Math.random() - 0.5) * 16; this.w[q + 2] = (Math.random() - 0.5) * 16;
    this.life[i] = life; this.max[i] = life; this.sc[i] = scale;
    this.mesh.setColorAt(i, this.ca.setHex(color));
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
  update(dt: number) {
    let any = false;
    for (let i = 0; i < this.n; i++) {
      const l = this.life[i];
      if (l <= 0) continue;
      const q = i * 3;
      const nl = l - dt;
      this.life[i] = nl;
      if (nl <= 0) { this.mesh.setMatrixAt(i, this.zero); any = true; continue; }
      if (this.flutter) {
        this.v[q + 1] = Math.max(this.v[q + 1] - this.grav * dt, -2.2);
        this.v[q] += Math.sin(nl * 7 + i) * 3 * dt;
        this.v[q + 2] += Math.cos(nl * 6 + i * 1.7) * 3 * dt;
      } else this.v[q + 1] -= this.grav * dt;
      this.p[q] += this.v[q] * dt; this.p[q + 1] += this.v[q + 1] * dt; this.p[q + 2] += this.v[q + 2] * dt;
      if (this.p[q + 1] < 0.12 && this.v[q + 1] < 0) {
        this.p[q + 1] = 0.12;
        this.v[q + 1] = -this.v[q + 1] * this.bounce;
        this.v[q] *= 0.7; this.v[q + 2] *= 0.7;
        this.w[q] *= 0.6; this.w[q + 1] *= 0.6; this.w[q + 2] *= 0.6;
        if (this.flutter) { this.v[q] *= 0.2; this.v[q + 2] *= 0.2; }
      }
      this.r[q] += this.w[q] * dt; this.r[q + 1] += this.w[q + 1] * dt; this.r[q + 2] += this.w[q + 2] * dt;
      const s = this.sc[i] * Math.min(1, nl / 0.35);
      this.qa.setFromEuler(this.ea.set(this.r[q], this.r[q + 1], this.r[q + 2]));
      this.ma.compose(this.pa.set(this.p[q], this.p[q + 1], this.p[q + 2]), this.qa, this.sa.set(s, this.flutter ? s : s, s));
      this.mesh.setMatrixAt(i, this.ma);
      any = true;
    }
    if (any) this.mesh.instanceMatrix.needsUpdate = true;
  }
}

interface Timed { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; t: number; dur: number; a: number; b: number }
interface TimedSprite { sp: THREE.Sprite; mat: THREE.SpriteMaterial; t: number; dur: number; a: number; b: number }

function radialTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const g = cv.getContext('2d');
  if (g) {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.25, 'rgba(255,255,255,0.65)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function crossTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const g = cv.getContext('2d');
  if (g) {
    g.lineCap = 'round';
    g.strokeStyle = '#1b1b3a'; g.lineWidth = 16;
    g.beginPath(); g.moveTo(14, 14); g.lineTo(50, 50); g.moveTo(50, 14); g.lineTo(14, 50); g.stroke();
    g.strokeStyle = '#ffffff'; g.lineWidth = 8;
    g.beginPath(); g.moveTo(14, 14); g.lineTo(50, 50); g.moveTo(50, 14); g.lineTo(14, 50); g.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const SKID_SEGS = 200;
const SKID_LIFE = 9;

export function createFx(scene: THREE.Scene): Fx {
  const add = new Pool(520, true, 0.25, scene);
  const norm = new Pool(420, false, 0.05, scene);
  const R = Math.random;

  // tracers
  const tracerGeo = new THREE.CylinderGeometry(1, 1, 1, 5);
  tracerGeo.rotateX(Math.PI / 2);
  const tracers: Timed[] = [];
  for (let i = 0; i < 24; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: 0xffe680, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    const mesh = new THREE.Mesh(tracerGeo, mat);
    mesh.visible = false; mesh.frustumCulled = false; mesh.renderOrder = 12;
    scene.add(mesh);
    tracers.push({ mesh, mat, t: 0, dur: 0.1, a: 0, b: 0 });
  }
  let tracerI = 0;

  // shockwave rings
  const ringGeo = new THREE.RingGeometry(0.82, 1, 36);
  ringGeo.rotateX(-Math.PI / 2);
  const rings: Timed[] = [];
  for (let i = 0; i < 12; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false });
    const mesh = new THREE.Mesh(ringGeo, mat);
    mesh.visible = false; mesh.frustumCulled = false; mesh.renderOrder = 12;
    scene.add(mesh);
    rings.push({ mesh, mat, t: 0, dur: 0.5, a: 1, b: 6 });
  }
  let ringI = 0;

  // flash blobs
  const flashGeo = new THREE.SphereGeometry(1, 8, 6);
  const flashes: Timed[] = [];
  for (let i = 0; i < 14; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: 0xfff0a0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    const mesh = new THREE.Mesh(flashGeo, mat);
    mesh.visible = false; mesh.frustumCulled = false; mesh.renderOrder = 12;
    scene.add(mesh);
    flashes.push({ mesh, mat, t: 0, dur: 0.08, a: 0.35, b: 0.6 });
  }
  let flashI = 0;

  // muzzle cones (tip along +Z, base at origin; lookAt aims +Z)
  const coneGeo = new THREE.ConeGeometry(0.5, 1, 8, 1, true);
  coneGeo.rotateX(Math.PI / 2);
  coneGeo.translate(0, 0, 0.5);
  const cones: Timed[] = [];
  for (let i = 0; i < 8; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: 0xffd060, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false });
    const mesh = new THREE.Mesh(coneGeo, mat);
    mesh.visible = false; mesh.frustumCulled = false; mesh.renderOrder = 12;
    scene.add(mesh);
    cones.push({ mesh, mat, t: 0, dur: 0.06, a: 1, b: 1 });
  }
  let coneI = 0;

  // glow sprites (explosion light flash) + hit markers
  const glowTex = radialTexture();
  const glows: TimedSprite[] = [];
  for (let i = 0; i < 6; i++) {
    const mat = new THREE.SpriteMaterial({ map: glowTex, color: 0xffc060, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    const sp = new THREE.Sprite(mat);
    sp.visible = false; sp.frustumCulled = false; sp.renderOrder = 13;
    scene.add(sp);
    glows.push({ sp, mat, t: 0, dur: 0.3, a: 1, b: 4 });
  }
  let glowI = 0;
  const crossTex = crossTexture();
  const marks: TimedSprite[] = [];
  for (let i = 0; i < 8; i++) {
    const mat = new THREE.SpriteMaterial({ map: crossTex, transparent: true, depthWrite: false, depthTest: false, fog: false });
    const sp = new THREE.Sprite(mat);
    sp.visible = false; sp.frustumCulled = false; sp.renderOrder = 14;
    scene.add(sp);
    marks.push({ sp, mat, t: 0, dur: 0.4, a: 0.4, b: 1 });
  }
  let markI = 0;

  // rigid bits
  const debrisBits = new Bits(new THREE.IcosahedronGeometry(0.5, 0), new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }), 80, scene, 22, 0.45, false);
  const confBits = new Bits(new THREE.PlaneGeometry(0.28, 0.16), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, fog: false }), 140, scene, 4, 0.1, true);
  const CONF = [0xff3b30, 0xffd21f, 0x2f7cff, 0x2fc65a, 0xff8a00, 0x9b4dff, 0xffffff, 0xff5c8a];

  // skid marks (ring buffer of quads)
  const skPos = new Float32Array(SKID_SEGS * 4 * 3);
  const skA = new Float32Array(SKID_SEGS * 4);
  const skBirth = new Float32Array(SKID_SEGS).fill(-1e9);
  const skInt = new Float32Array(SKID_SEGS);
  const skGeo = new THREE.BufferGeometry();
  skGeo.setAttribute('position', new THREE.BufferAttribute(skPos, 3).setUsage(THREE.DynamicDrawUsage));
  skGeo.setAttribute('aA', new THREE.BufferAttribute(skA, 1).setUsage(THREE.DynamicDrawUsage));
  const skIdx = new Uint16Array(SKID_SEGS * 6);
  for (let i = 0; i < SKID_SEGS; i++) skIdx.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 1, i * 4 + 3, i * 4 + 2], i * 6);
  skGeo.setIndex(new THREE.BufferAttribute(skIdx, 1));
  const skMesh = new THREE.Mesh(skGeo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6, fog: false,
    vertexShader: 'attribute float aA; varying float vA; void main(){ vA = aA; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'varying float vA; void main(){ gl_FragColor = vec4(0.05,0.05,0.1, vA*0.75); }',
  }));
  skMesh.frustumCulled = false; skMesh.renderOrder = 3;
  scene.add(skMesh);
  let skNext = 0, skHas = false, skLastT = -9, skDirty = false, clock = 0;
  const skPL = new THREE.Vector3(), skPR = new THREE.Vector3();
  const SK_Y = 0.085, SK_W = 0.17;
  const skSeg = (px: number, pz: number, cx: number, cz: number, inten: number) => {
    const dx = cx - px, dz = cz - pz;
    const len = Math.hypot(dx, dz);
    if (len < 0.02) return;
    const nx = (-dz / len) * SK_W, nz = (dx / len) * SK_W;
    const o = skNext * 12;
    skPos[o] = px - nx; skPos[o + 1] = SK_Y; skPos[o + 2] = pz - nz;
    skPos[o + 3] = px + nx; skPos[o + 4] = SK_Y; skPos[o + 5] = pz + nz;
    skPos[o + 6] = cx - nx; skPos[o + 7] = SK_Y; skPos[o + 8] = cz - nz;
    skPos[o + 9] = cx + nx; skPos[o + 10] = SK_Y; skPos[o + 11] = cz + nz;
    skBirth[skNext] = clock; skInt[skNext] = inten;
    skNext = (skNext + 1) % SKID_SEGS;
    skDirty = true;
    (skGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  };

  const tmpV = new THREE.Vector3();
  const startTimed = (t: Timed, dur: number, a: number, b: number) => { t.t = dur; t.dur = dur; t.a = a; t.b = b; t.mesh.visible = true; };
  const flashBlob = (pos: THREE.Vector3, r0: number, r1: number, color: number, dur: number) => {
    const f = flashes[flashI++ % flashes.length];
    f.mesh.position.copy(pos); f.mat.color.setHex(color);
    startTimed(f, dur, r0, r1);
  };
  const ring = (pos: THREE.Vector3, r0: number, r1: number, color: number, dur: number) => {
    const r = rings[ringI++ % rings.length];
    r.mesh.position.copy(pos); r.mesh.position.y = Math.max(pos.y, 0.05);
    r.mat.color.setHex(color);
    startTimed(r, dur, r0, r1);
  };
  const glowSprite = (pos: THREE.Vector3, r0: number, r1: number, color: number, dur: number) => {
    const g = glows[glowI++ % glows.length];
    g.sp.position.copy(pos); g.mat.color.setHex(color);
    g.t = dur; g.dur = dur; g.a = r0; g.b = r1; g.sp.visible = true;
  };
  const lerpHex = (a: number, b: number, t: number) => {
    const r = ((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t, g = ((a >> 8) & 255) * (1 - t) + ((b >> 8) & 255) * t, bl = (a & 255) * (1 - t) + (b & 255) * t;
    return ((r | 0) << 16) | ((g | 0) << 8) | (bl | 0);
  };
  const debris = (pos: THREE.Vector3, color: number, n: number) => {
    const c = Math.min(30, n | 0);
    for (let i = 0; i < c; i++) {
      const a = R() * Math.PI * 2, sp = 3 + R() * 7;
      const shade = i % 3 === 0 ? 0x1b1b3a : i % 3 === 1 ? lerpHex(color, 0xffffff, 0.25) : color;
      debrisBits.emit(pos.x, pos.y + 0.2, pos.z, Math.cos(a) * sp, 4 + R() * 9, Math.sin(a) * sp, 0.12 + R() * 0.2, shade, 1.2 + R() * 0.9);
    }
  };

  return {
    setViewScale(px) { add.setScale(px); norm.setScale(px); },
    explosion(pos, size, color = 0xff8a00) {
      const s = Math.max(0.3, size);
      flashBlob(pos, s * 0.5, s * 1.7, 0xfff2b0, 0.22);
      glowSprite(pos, s * 2.5, s * 7, lerpHex(color, 0xffffff, 0.35), 0.35);
      ring(pos, s * 0.4, s * 3.4, lerpHex(color, 0xffffff, 0.4), 0.5);
      // layered fireball: white-hot core, coloured body
      const nCore = Math.min(10, 4 + (s * 2) | 0);
      for (let i = 0; i < nCore; i++) {
        const a = R() * Math.PI * 2, u = R() * 2 - 1, h = Math.sqrt(1 - u * u), sp = (1 + R() * 3) * s * 0.6;
        add.emit(pos.x, pos.y, pos.z, Math.cos(a) * h * sp, Math.abs(u) * sp * 0.7 + 0.6, Math.sin(a) * h * sp, 0.22 + R() * 0.18, s * (0.7 + R() * 0.5), s * 0.15, 0xffffff, 0xffd060, 0, 4);
      }
      const nFire = Math.min(24, 9 + (s * 4) | 0);
      for (let i = 0; i < nFire; i++) {
        const a = R() * Math.PI * 2, u = R() * 2 - 1, h = Math.sqrt(1 - u * u), sp = (2 + R() * 5) * s * 0.7;
        add.emit(pos.x, pos.y, pos.z, Math.cos(a) * h * sp, Math.abs(u) * sp * 0.8 + 1, Math.sin(a) * h * sp, 0.35 + R() * 0.35, s * (0.9 + R() * 0.7), s * 0.25, color, 0x7a1400, 0, 3);
      }
      for (let i = 0; i < 12 + ((s * 3) | 0); i++) {
        const a = R() * Math.PI * 2, sp = (6 + R() * 12) * Math.min(2, s * 0.7);
        add.emit(pos.x, pos.y, pos.z, Math.cos(a) * sp, 2 + R() * 9, Math.sin(a) * sp, 0.4 + R() * 0.5, 0.18, 0.04, 0xffe680, 0xff5a00, 22, 0.5);
      }
      // smoke column that lingers
      const nSmoke = Math.min(14, 5 + (s * 2) | 0);
      for (let i = 0; i < nSmoke; i++) {
        const a = R() * Math.PI * 2, sp = R() * 1.6 * s * 0.5;
        norm.emit(pos.x + Math.cos(a) * 0.3, pos.y + 0.3, pos.z + Math.sin(a) * 0.3, Math.cos(a) * sp, 2.4 + R() * 3.2, Math.sin(a) * sp, 1.5 + R() * 1.2, s * 0.6, s * (1.6 + R() * 0.8), 0x2a2838, 0x8a859a, -0.8, 0.9);
      }
      debris(pos, color, Math.min(14, 4 + (s * 2) | 0));
    },
    muzzle(pos, dir) {
      flashBlob(pos, 0.2, 0.36, 0xffe680, 0.06);
      const c = cones[coneI++ % cones.length];
      c.mesh.position.copy(pos);
      c.mesh.lookAt(tmpV.copy(pos).add(dir));
      const w = 0.28 + R() * 0.1, l = 0.9 + R() * 0.4;
      c.mesh.scale.set(w, w, l);
      c.mat.color.setHex(R() < 0.5 ? 0xffd060 : 0xfff0b0);
      startTimed(c, 0.06, 1, 1);
      for (let i = 0; i < 4; i++) {
        const sp = 6 + R() * 10;
        add.emit(pos.x, pos.y, pos.z, dir.x * sp + (R() - 0.5) * 4, dir.y * sp + (R() - 0.5) * 4, dir.z * sp + (R() - 0.5) * 4, 0.12 + R() * 0.1, 0.16, 0.03, 0xffffff, 0xffa020, 0, 2);
      }
      norm.emit(pos.x, pos.y, pos.z, dir.x * 2, dir.y * 2 + 0.6, dir.z * 2, 0.5, 0.15, 0.55, 0xb0aab8, 0xe0dce8, -0.3, 1.5);
      // ejected shell casing: kicks sideways + up, bounces on the road
      debrisBits.emit(pos.x, pos.y, pos.z, -dir.z * 3 + (R() - 0.5), 3 + R() * 2, dir.x * 3 + (R() - 0.5), 0.06, 0xffc83a, 0.9);
    },
    tracer(from, to, color = 0xffe680) {
      const t = tracers[tracerI++ % tracers.length];
      const len = tmpV.copy(to).sub(from).length();
      if (len < 0.01) return;
      t.mesh.position.copy(from).add(to).multiplyScalar(0.5);
      t.mesh.lookAt(to);
      t.mesh.scale.set(0.045, 0.045, len);
      t.mat.color.setHex(color);
      startTimed(t, 0.09, 1, 0.3);
    },
    impact(pos, color = 0xffd060) {
      flashBlob(pos, 0.14, 0.34, 0xffffff, 0.06);
      for (let i = 0; i < 9; i++) {
        const a = R() * Math.PI * 2, sp = 2 + R() * 7;
        add.emit(pos.x, pos.y, pos.z, Math.cos(a) * sp, 1 + R() * 5, Math.sin(a) * sp, 0.2 + R() * 0.25, 0.12, 0.03, color, 0xff6a00, 18, 0.5);
      }
      // two long streak sparks
      for (let i = 0; i < 2; i++) {
        const a = R() * Math.PI * 2;
        add.emit(pos.x, pos.y, pos.z, Math.cos(a) * 9, 2 + R() * 3, Math.sin(a) * 9, 0.15, 0.2, 0.02, 0xffffff, 0xffa020, 10, 1);
      }
      norm.emit(pos.x, pos.y, pos.z, 0, 0.9, 0, 0.45, 0.22, 0.65, 0xb8b4c4, 0xe4e0ec, -0.2, 1);
      norm.emit(pos.x + (R() - 0.5) * 0.2, pos.y, pos.z + (R() - 0.5) * 0.2, (R() - 0.5), 0.6, (R() - 0.5), 0.35, 0.15, 0.4, 0x8d8a9c, 0xd0ccdc, 0, 1);
    },
    smoke(pos, size = 1) {
      norm.emit(pos.x + (R() - 0.5) * 0.3, pos.y, pos.z + (R() - 0.5) * 0.3, (R() - 0.5) * 0.8, 1.6 + R() * 1.0, (R() - 0.5) * 0.8, 0.8 + R() * 0.5, 0.35 * size, 1.5 * size, 0x2c2a3a, 0x77738a, -0.3, 0.8);
    },
    dust(pos, vel) {
      norm.emit(pos.x, pos.y, pos.z, vel.x + (R() - 0.5) * 1.2, vel.y + R() * 0.9, vel.z + (R() - 0.5) * 1.2, 0.5 + R() * 0.35, 0.3, 1.1, 0xd6c49a, 0xe9ddc0, -0.2, 2);
    },
    pickupBurst(pos, color) {
      ring(pos, 0.3, 2.4, color, 0.45);
      flashBlob(pos, 0.3, 0.9, 0xffffff, 0.15);
      glowSprite(pos, 1, 3.2, color, 0.3);
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * Math.PI * 2 + R() * 0.2, sp = 3 + R() * 3.5;
        add.emit(pos.x, pos.y, pos.z, Math.cos(a) * sp, 2 + R() * 4, Math.sin(a) * sp, 0.6 + R() * 0.3, 0.22, 0.06, i % 3 === 0 ? 0xffffff : color, color, 9, 0.8);
      }
    },
    nitro(pos, dir) {
      const sp = 7 + R() * 5;
      add.emit(pos.x, pos.y, pos.z, dir.x * sp + (R() - 0.5), dir.y * sp + (R() - 0.5) * 0.6, dir.z * sp + (R() - 0.5), 0.22 + R() * 0.12, 0.55, 0.1, 0xffe08a, 0xff3a00, 0, 1.5);
    },
    skid(left, right, intensity) {
      if (intensity < 0.03) { skHas = false; return; }
      if (skHas && clock - skLastT < 0.2 && skPL.distanceToSquared(left) < 16 && skPR.distanceToSquared(right) < 16) {
        skSeg(skPL.x, skPL.z, left.x, left.z, intensity);
        skSeg(skPR.x, skPR.z, right.x, right.z, intensity);
      }
      skPL.copy(left); skPR.copy(right); skHas = true; skLastT = clock;
    },
    tireSmoke(pos, dir, amount) {
      const a = Math.min(1.6, amount);
      if (a <= 0) return;
      norm.emit(pos.x + (R() - 0.5) * 0.4, pos.y + 0.1, pos.z + (R() - 0.5) * 0.4, -dir.x * 0.5 + (R() - 0.5) * 1.2, 0.8 + R() * 0.8, -dir.z * 0.5 + (R() - 0.5) * 1.2, 0.55 + R() * 0.45, 0.35 + a * 0.2, 1.3 + a * 0.8, 0xe8e6f0, 0xffffff, -0.1, 1.6);
    },
    shockwave(pos, size) {
      const s = Math.max(2, size);
      const g = tmpV.set(pos.x, 0.05, pos.z);
      ring(g, s * 0.3, s * 4.2, 0xffffff, 0.7);
      ring(g, s * 0.2, s * 2.8, 0xffb040, 0.5);
      glowSprite(pos, s * 1.5, s * 6, 0xffe0a0, 0.4);
      const n = 26;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + R() * 0.2, sp = s * (2.2 + R() * 1.2);
        norm.emit(g.x, 0.25, g.z, Math.cos(a) * sp, 0.4 + R() * 0.8, Math.sin(a) * sp, 0.8 + R() * 0.5, s * 0.22, s * 0.6, 0xd6c49a, 0xf0e6cc, 0, 2.6);
      }
      for (let i = 0; i < 14; i++) {
        const a = R() * Math.PI * 2, sp = s * (3 + R() * 2);
        add.emit(g.x, 0.3, g.z, Math.cos(a) * sp, 1 + R() * 2, Math.sin(a) * sp, 0.4, 0.3, 0.05, 0xffffff, 0xffa020, 6, 2);
      }
    },
    debris,
    confetti(pos) {
      for (let i = 0; i < 70; i++) {
        const a = R() * Math.PI * 2, sp = 2 + R() * 7;
        confBits.emit(pos.x, pos.y + 0.5, pos.z, Math.cos(a) * sp, 8 + R() * 9, Math.sin(a) * sp, 0.7 + R() * 0.7, CONF[i % CONF.length], 2.8 + R() * 1.6);
      }
      ring(tmpV.set(pos.x, 0.05, pos.z), 0.5, 5, 0xffd21f, 0.6);
    },
    sparkTrail(pos, vel) {
      for (let i = 0; i < 2; i++) {
        add.emit(pos.x + (R() - 0.5) * 0.4, pos.y + 0.1, pos.z + (R() - 0.5) * 0.4, vel.x * 0.3 + (R() - 0.5) * 3, 1.5 + R() * 3, vel.z * 0.3 + (R() - 0.5) * 3, 0.25 + R() * 0.25, 0.13, 0.02, 0xfff0a0, 0xff5a00, 16, 0.6);
      }
    },
    hitMarker3D(pos) {
      const m = marks[markI++ % marks.length];
      m.sp.position.copy(pos);
      m.t = 0.4; m.dur = 0.4; m.a = 0.4; m.b = 1; m.sp.visible = true;
    },
    update(dt) {
      clock += dt;
      add.update(dt);
      norm.update(dt);
      debrisBits.update(dt);
      confBits.update(dt);
      if (skDirty) {
        let live = false;
        for (let i = 0; i < SKID_SEGS; i++) {
          const age = clock - skBirth[i];
          const a = age > SKID_LIFE ? 0 : skInt[i] * Math.min(1, age * 8) * (1 - age / SKID_LIFE);
          if (a > 0.002) live = true;
          skA[i * 4] = skA[i * 4 + 1] = skA[i * 4 + 2] = skA[i * 4 + 3] = a;
        }
        (skGeo.attributes.aA as THREE.BufferAttribute).needsUpdate = true;
        if (!live) skDirty = false;
      }
      for (let i = 0; i < tracers.length; i++) {
        const o = tracers[i];
        if (!o.mesh.visible) continue;
        o.t -= dt;
        if (o.t <= 0) { o.mesh.visible = false; continue; }
        o.mat.opacity = o.t / o.dur;
      }
      for (let i = 0; i < rings.length; i++) {
        const o = rings[i];
        if (!o.mesh.visible) continue;
        o.t -= dt;
        if (o.t <= 0) { o.mesh.visible = false; continue; }
        const k = 1 - o.t / o.dur, e = 1 - (1 - k) * (1 - k);
        o.mesh.scale.setScalar(o.a + (o.b - o.a) * e);
        o.mat.opacity = (1 - k) * 0.9;
      }
      for (let i = 0; i < flashes.length; i++) {
        const o = flashes[i];
        if (!o.mesh.visible) continue;
        o.t -= dt;
        if (o.t <= 0) { o.mesh.visible = false; continue; }
        const k = 1 - o.t / o.dur;
        o.mesh.scale.setScalar(o.a + (o.b - o.a) * k);
        o.mat.opacity = 1 - k;
      }
      for (let i = 0; i < cones.length; i++) {
        const o = cones[i];
        if (!o.mesh.visible) continue;
        o.t -= dt;
        if (o.t <= 0) { o.mesh.visible = false; continue; }
        o.mat.opacity = o.t / o.dur;
      }
      for (let i = 0; i < glows.length; i++) {
        const o = glows[i];
        if (!o.sp.visible) continue;
        o.t -= dt;
        if (o.t <= 0) { o.sp.visible = false; continue; }
        const k = 1 - o.t / o.dur;
        o.sp.scale.setScalar(o.a + (o.b - o.a) * Math.sqrt(k));
        o.mat.opacity = (1 - k) * (1 - k);
      }
      for (let i = 0; i < marks.length; i++) {
        const o = marks[i];
        if (!o.sp.visible) continue;
        o.t -= dt;
        if (o.t <= 0) { o.sp.visible = false; continue; }
        const k = 1 - o.t / o.dur;
        o.sp.scale.setScalar(o.a + (o.b - o.a) * Math.min(1, k * 4));
        o.sp.position.y += dt * 1.2;
        o.mat.opacity = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4;
      }
    },
  };
}
