import * as THREE from 'three';

const MAX_SAMPLES = 64;
const MAX_PATH = 192;
const LIFE = 0.16;
/** Max half-width of the ribbon in half-screen-heights. */
const BASE_HALF_WIDTH = 0.034;

const TRAIL_VS = /* glsl */ `
  attribute vec2 aUv;
  attribute float aFade;
  varying vec2 vUv;
  varying float vFade;
  void main() {
    vUv = aUv;
    vFade = aFade;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const TRAIL_FS = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;
  varying float vFade;
  void main() {
    float d = abs(vUv.y * 2.0 - 1.0);
    float along = vUv.x;
    float core = smoothstep(0.38, 0.0, d);
    core *= core;
    float glow = pow(max(1.0 - d, 0.0), 1.8);
    float headBoost = 0.6 + 0.4 * along;
    vec3 col = uColor * glow * 1.25 * headBoost + vec3(1.0, 0.98, 0.95) * core * 1.5 * smoothstep(0.0, 0.35, along);
    gl_FragColor = vec4(col * vFade * uIntensity, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const DOT_VS = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const DOT_FS = /* glsl */ `
  uniform vec3 uColor;
  uniform float uActive;
  uniform float uPulse;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float halo = exp(-d * d * 5.0) * (0.55 + 0.25 * uActive);
    float core = smoothstep(0.2 + 0.08 * uActive, 0.0, d);
    float ring = smoothstep(0.07, 0.0, abs(d - (0.5 + 0.04 * uPulse))) * (1.0 - uActive) * 0.85;
    vec3 col = uColor * (halo + ring) + vec3(1.0) * core * (0.9 + 0.6 * uActive);
    float edge = 1.0 - smoothstep(0.85, 1.0, d);
    gl_FragColor = vec4(col * edge, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/**
 * The sword trail: a tapered, glowing additive ribbon drawn on a plane just
 * in front of the camera (screen-locked, always on top), plus a soft cursor
 * dot that is always visible so phone users see where they point.
 *
 * Call push() with the pointer every frame (or more often), then update(dt).
 */
export class BladeTrail {
  readonly mesh: THREE.Mesh;
  readonly cursor: THREE.Mesh;
  /** Set false to hide the cursor dot (e.g. while a menu owns the pointer). */
  showCursor = true;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private geo: THREE.BufferGeometry;
  private mat: THREE.ShaderMaterial;
  private dotMat: THREE.ShaderMaterial;
  private posAttr: THREE.BufferAttribute;
  private uvAttr: THREE.BufferAttribute;
  private fadeAttr: THREE.BufferAttribute;
  // sample ring buffer (aspect-corrected screen units: x*aspect, y)
  private sx = new Float32Array(MAX_SAMPLES);
  private sy = new Float32Array(MAX_SAMPLES);
  private st = new Float64Array(MAX_SAMPLES);
  private sStroke = new Int32Array(MAX_SAMPLES);
  private head = -1;
  private count = 0;
  private stroke = 0;
  private wasActive = false;
  // path scratch
  private px = new Float32Array(MAX_PATH);
  private py = new Float32Array(MAX_PATH);
  private pt = new Float64Array(MAX_PATH);
  private ps = new Float32Array(MAX_PATH);
  private now = 0;
  private pushedSinceUpdate = false;
  private cursorX = 0;
  private cursorY = 0;
  private cursorActive = false;
  private activeBlend = 0;
  private hasPointer = false;
  private aspect = 1;
  private time = 0;
  private color = new THREE.Color();

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;
    this.geo = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(new Float32Array(MAX_PATH * 2 * 3), 3);
    this.uvAttr = new THREE.BufferAttribute(new Float32Array(MAX_PATH * 2 * 2), 2);
    this.fadeAttr = new THREE.BufferAttribute(new Float32Array(MAX_PATH * 2), 1);
    this.posAttr.setUsage(THREE.DynamicDrawUsage);
    this.uvAttr.setUsage(THREE.DynamicDrawUsage);
    this.fadeAttr.setUsage(THREE.DynamicDrawUsage);
    this.geo.setAttribute('position', this.posAttr);
    this.geo.setAttribute('aUv', this.uvAttr);
    this.geo.setAttribute('aFade', this.fadeAttr);
    const idx: number[] = [];
    for (let i = 0; i < MAX_PATH - 1; i++) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      idx.push(a, b, c, b, d, c);
    }
    this.geo.setIndex(idx);
    this.geo.setDrawRange(0, 0);

    this.mat = new THREE.ShaderMaterial({
      vertexShader: TRAIL_VS,
      fragmentShader: TRAIL_FS,
      uniforms: { uColor: { value: this.color }, uIntensity: { value: 1.25 } },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(this.geo, this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 1000;
    this.mesh.matrixAutoUpdate = false;
    this.mesh.name = 'BladeTrail';
    scene.add(this.mesh);

    this.dotMat = new THREE.ShaderMaterial({
      vertexShader: DOT_VS,
      fragmentShader: DOT_FS,
      uniforms: { uColor: { value: this.color }, uActive: { value: 0 }, uPulse: { value: 0 } },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.cursor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.dotMat);
    this.cursor.frustumCulled = false;
    this.cursor.renderOrder = 1001;
    this.cursor.visible = false;
    scene.add(this.cursor);
    this.setColor('#8ef6ff');
  }

  setColor(css: string): void {
    this.color.set(css);
  }

  /** Feed the pointer (NDC). time in seconds on any monotonic clock. */
  push(ndcX: number, ndcY: number, active: boolean, time: number): void {
    this.aspect = this.camera.aspect || 1;
    this.now = time;
    this.pushedSinceUpdate = true;
    this.cursorX = ndcX;
    this.cursorY = ndcY;
    this.cursorActive = active;
    this.hasPointer = true;
    if (!active) {
      this.wasActive = false;
      return;
    }
    if (!this.wasActive) {
      this.stroke++;
      this.wasActive = true;
    }
    const x = ndcX * this.aspect;
    const y = ndcY;
    if (this.count > 0 && this.sStroke[this.head] === this.stroke) {
      const dx = x - this.sx[this.head];
      const dy = y - this.sy[this.head];
      if (dx * dx + dy * dy < 0.0025 * 0.0025) return; // not moved enough; keep the older timestamp
    }
    this.head = (this.head + 1) % MAX_SAMPLES;
    this.sx[this.head] = x;
    this.sy[this.head] = y;
    this.st[this.head] = time;
    this.sStroke[this.head] = this.stroke;
    this.count = Math.min(this.count + 1, MAX_SAMPLES);
  }

  /** Current smoothed blade speed in screen-heights per second (useful for swoosh SFX). */
  speed = 0;

  update(dt: number): void {
    this.time += dt;
    if (!this.pushedSinceUpdate) this.now += dt;
    this.pushedSinceUpdate = false;
    const cam = this.camera;
    cam.updateMatrixWorld();
    const e = cam.matrixWorld.elements;
    const dist = Math.max(1, cam.near * 4);
    const halfH = dist * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) / (cam.zoom || 1);
    // camera basis
    const rx = e[0], ry = e[1], rz = e[2];
    const ux = e[4], uy = e[5], uz = e[6];
    const fx = -e[8], fy = -e[9], fz = -e[10];
    const ox = e[12] + fx * dist, oy = e[13] + fy * dist, oz = e[14] + fz * dist;

    // ---- gather the live samples of the newest stroke (oldest -> newest)
    let n = 0;
    let first = -1;
    if (this.count > 0) {
      const strokeId = this.sStroke[this.head];
      let k = 0;
      for (; k < this.count; k++) {
        const i = (this.head - k + MAX_SAMPLES) % MAX_SAMPLES;
        if (this.sStroke[i] !== strokeId || this.now - this.st[i] > LIFE) break;
      }
      n = k;
      first = (this.head - n + 1 + MAX_SAMPLES) % MAX_SAMPLES;
    }

    // speed estimate from the newest samples
    let inst = 0;
    if (n >= 2) {
      const a = this.head;
      const b = (this.head - Math.min(n - 1, 3) + MAX_SAMPLES) % MAX_SAMPLES;
      const ddt = Math.max(1e-3, this.st[a] - this.st[b]);
      inst = Math.hypot(this.sx[a] - this.sx[b], this.sy[a] - this.sy[b]) / 2 / ddt;
      if (this.now - this.st[a] > 0.05) inst = 0;
    }
    this.speed += (inst - this.speed) * (1 - Math.exp(-dt * 18));

    let m = 0;
    if (n >= 2) {
      // budget subdivisions
      let totalLen = 0;
      for (let k = 0; k < n - 1; k++) {
        const i0 = (first + k) % MAX_SAMPLES, i1 = (first + k + 1) % MAX_SAMPLES;
        totalLen += Math.hypot(this.sx[i1] - this.sx[i0], this.sy[i1] - this.sy[i0]);
      }
      const step = Math.max(0.012, totalLen / (MAX_PATH - 2));
      for (let k = 0; k < n - 1 && m < MAX_PATH - 1; k++) {
        const i0 = (first + Math.max(k - 1, 0)) % MAX_SAMPLES;
        const i1 = (first + k) % MAX_SAMPLES;
        const i2 = (first + k + 1) % MAX_SAMPLES;
        const i3 = (first + Math.min(k + 2, n - 1)) % MAX_SAMPLES;
        const x0 = this.sx[i0], y0 = this.sy[i0], x1 = this.sx[i1], y1 = this.sy[i1];
        const x2 = this.sx[i2], y2 = this.sy[i2], x3 = this.sx[i3], y3 = this.sy[i3];
        const segLen = Math.hypot(x2 - x1, y2 - y1);
        const segSpeed = segLen / 2 / Math.max(1e-3, this.st[i2] - this.st[i1]);
        const sub = Math.min(10, Math.max(1, Math.ceil(segLen / step)));
        for (let s = 0; s < sub && m < MAX_PATH - 1; s++) {
          const t = s / sub;
          const t2 = t * t, t3 = t2 * t;
          this.px[m] = 0.5 * (2 * x1 + (-x0 + x2) * t + (2 * x0 - 5 * x1 + 4 * x2 - x3) * t2 + (-x0 + 3 * x1 - 3 * x2 + x3) * t3);
          this.py[m] = 0.5 * (2 * y1 + (-y0 + y2) * t + (2 * y0 - 5 * y1 + 4 * y2 - y3) * t2 + (-y0 + 3 * y1 - 3 * y2 + y3) * t3);
          this.pt[m] = this.st[i1] + (this.st[i2] - this.st[i1]) * t;
          this.ps[m] = segSpeed;
          m++;
        }
      }
      const last = this.head;
      this.px[m] = this.sx[last];
      this.py[m] = this.sy[last];
      this.pt[m] = this.st[last];
      this.ps[m] = m > 0 ? this.ps[m - 1] : 0;
      m++;
      // smooth the speed profile a little
      for (let k = 1; k < m; k++) this.ps[k] = this.ps[k - 1] * 0.6 + this.ps[k] * 0.4;
    }

    const pos = this.posAttr.array as Float32Array;
    const uv = this.uvAttr.array as Float32Array;
    const fade = this.fadeAttr.array as Float32Array;
    if (m >= 2) {
      for (let k = 0; k < m; k++) {
        const kp = Math.max(0, k - 1), kn = Math.min(m - 1, k + 1);
        let tx = this.px[kn] - this.px[kp];
        let ty = this.py[kn] - this.py[kp];
        const tl = Math.hypot(tx, ty) || 1;
        tx /= tl; ty /= tl;
        const nx = -ty, ny = tx;
        const u = k / (m - 1);
        const age = Math.min(1, Math.max(0, (this.now - this.pt[k]) / LIFE));
        const life = 1 - age;
        const spd = Math.min(1.3, 0.35 + this.ps[k] * 0.16);
        const taper = Math.pow(u, 0.65);
        // rounded nose at the head
        const nose = u > 0.96 ? Math.sqrt(Math.max(0, 1 - ((u - 0.96) / 0.04) ** 2)) * 0.5 + 0.5 : 1;
        const w = BASE_HALF_WIDTH * spd * taper * Math.pow(life, 0.6) * nose;
        const a = Math.pow(life, 1.1) * Math.min(1, u * 6);
        for (let side = 0; side < 2; side++) {
          const sgn = side === 0 ? -1 : 1;
          const vx = (this.px[k] + nx * w * sgn) * halfH;
          const vy = (this.py[k] + ny * w * sgn) * halfH;
          const o = (k * 2 + side) * 3;
          pos[o] = ox + rx * vx + ux * vy;
          pos[o + 1] = oy + ry * vx + uy * vy;
          pos[o + 2] = oz + rz * vx + uz * vy;
          const ou = (k * 2 + side) * 2;
          uv[ou] = u;
          uv[ou + 1] = side;
          fade[k * 2 + side] = a;
        }
      }
      this.posAttr.needsUpdate = true;
      this.uvAttr.needsUpdate = true;
      this.fadeAttr.needsUpdate = true;
      this.geo.setDrawRange(0, (m - 1) * 6);
      this.mesh.visible = true;
    } else {
      this.geo.setDrawRange(0, 0);
      this.mesh.visible = false;
    }

    // ---- cursor dot
    this.activeBlend += ((this.cursorActive ? 1 : 0) - this.activeBlend) * (1 - Math.exp(-dt * 14));
    this.cursor.visible = this.showCursor && this.hasPointer;
    if (this.cursor.visible) {
      const vx = this.cursorX * this.aspect * halfH;
      const vy = this.cursorY * halfH;
      this.cursor.position.set(ox + rx * vx + ux * vy, oy + ry * vx + uy * vy, oz + rz * vx + uz * vy);
      this.cursor.quaternion.copy(cam.quaternion);
      const size = halfH * (0.07 + 0.03 * this.activeBlend + Math.min(0.03, this.speed * 0.004));
      this.cursor.scale.set(size * 2, size * 2, 1);
      this.dotMat.uniforms.uActive.value = this.activeBlend;
      this.dotMat.uniforms.uPulse.value = Math.sin(this.time * 4);
    }
  }

  clear(): void {
    this.count = 0;
    this.head = -1;
    this.stroke++;
    this.wasActive = false;
    this.speed = 0;
    this.geo.setDrawRange(0, 0);
    this.mesh.visible = false;
  }

  dispose(): void {
    this.scene.remove(this.mesh, this.cursor);
    this.geo.dispose();
    this.mat.dispose();
    this.cursor.geometry.dispose();
    this.dotMat.dispose();
  }
}
