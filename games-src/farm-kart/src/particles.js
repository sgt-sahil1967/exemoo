// Pooled point-sprite particles (sparks, dust, boost flames, bursts).
import * as THREE from 'three';

export class Particles {
  constructor(scene, dotTex, cap = 3000) {
    this.cap = cap;
    this.pos = new Float32Array(cap * 3);
    this.col = new Float32Array(cap * 3);
    this.size = new Float32Array(cap);
    this.vel = new Float32Array(cap * 3);
    this.life = new Float32Array(cap);
    this.max = new Float32Array(cap);
    this.base = new Float32Array(cap);
    this.next = 0;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('size', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    for (let i = 0; i < cap; i++) this.pos[i * 3 + 1] = -9999;
    const mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: dotTex }, scale: { value: 400 } },
      vertexShader: `attribute float size; attribute vec3 color; varying vec3 vC; varying float vA;
        uniform float scale;
        void main(){ vC = color; vec4 mv = modelViewMatrix * vec4(position,1.);
          vA = smoothstep(3.0, 7.0, -mv.z);
          gl_PointSize = min(size * scale / -mv.z, scale * .06); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform sampler2D map; varying vec3 vC; varying float vA;
        void main(){ vec4 t = texture2D(map, gl_PointCoord); float a = t.a * vA; if (a < .05) discard; gl_FragColor = vec4(vC, a); }`,
      transparent: true, depthWrite: false,
    });
    this.points = new THREE.Points(g, mat);
    this.points.frustumCulled = false;
    scene.add(this.points);
    this.c = new THREE.Color();
  }

  emit(x, y, z, vx, vy, vz, color, size, life) {
    const i = this.next; this.next = (this.next + 1) % this.cap;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
    this.c.setHex(color);
    this.col[i * 3] = this.c.r; this.col[i * 3 + 1] = this.c.g; this.col[i * 3 + 2] = this.c.b;
    this.life[i] = this.max[i] = life; this.base[i] = size; this.size[i] = size;
  }

  burst(x, y, z, n, color, speed) {
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, e = Math.random() * 1.2;
      this.emit(x, y, z, Math.cos(a) * speed * Math.cos(e), Math.sin(e) * speed, Math.sin(a) * speed * Math.cos(e), color, .5 + Math.random() * .5, .5 + Math.random() * .4);
    }
  }

  update(dt) {
    for (let i = 0; i < this.cap; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt;
      if (this.life[i] <= 0) { this.pos[i * 3 + 1] = -9999; this.size[i] = 0; continue; }
      this.vel[i * 3 + 1] -= 9 * dt;
      this.pos[i * 3] += this.vel[i * 3] * dt; this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt; this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      this.size[i] = this.base[i] * (this.life[i] / this.max[i]) ** .5;
    }
    const a = this.points.geometry.attributes;
    a.position.needsUpdate = a.color.needsUpdate = a.size.needsUpdate = true;
  }

  clear() { this.life.fill(0); for (let i = 0; i < this.cap; i++) { this.pos[i * 3 + 1] = -9999; this.size[i] = 0; } }
}

// ---------------------------------------------------------------------------
// Rich FX sprites: a 4x2 shape atlas, rotation/squash per sprite, per-sprite
// alpha, additive or normal blending. SpriteBatch = fixed slots you write each
// frame; FxParticles = pooled simulated particles (ring buffer, no allocation).
// Shapes: 0 glow, 1 puff, 2 star, 3 confetti square, 4 leaf, 5 snowflake,
//         6 fluff seed, 7 shard.
export const SHAPE = { glow: 0, puff: 1, star: 2, square: 3, leaf: 4, snow: 5, fluff: 6, shard: 7 };

let atlasTex = null;
export function fxAtlas() {
  if (atlasTex) return atlasTex;
  const C = 64, cv = document.createElement('canvas');
  cv.width = C * 4; cv.height = C * 2;
  const g = cv.getContext('2d');
  const cell = (i, fn) => { g.save(); g.translate((i % 4) * C + C / 2, Math.floor(i / 4) * C + C / 2); fn(); g.restore(); };
  const R = C / 2 - 3;
  // 0 glow
  cell(0, () => {
    const grd = g.createRadialGradient(0, 0, 0, 0, 0, R);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(.25, 'rgba(255,255,255,.75)');
    grd.addColorStop(.6, 'rgba(255,255,255,.22)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill();
  });
  // 1 cartoon puff: shaded ball with soft rim
  cell(1, () => {
    const grd = g.createRadialGradient(-R * .3, -R * .35, 0, 0, 0, R);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(.6, 'rgba(232,232,240,.95)');
    grd.addColorStop(.85, 'rgba(205,205,220,.75)'); grd.addColorStop(1, 'rgba(200,200,215,0)');
    g.fillStyle = grd; g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill();
  });
  // 2 star with ink outline
  cell(2, () => {
    g.beginPath();
    for (let k = 0; k < 10; k++) { const r = k % 2 ? R * .45 : R * .92, a = -Math.PI / 2 + k * Math.PI / 5; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    g.closePath(); g.fillStyle = '#ffffff'; g.fill();
    g.lineJoin = 'round'; g.lineWidth = 4; g.strokeStyle = '#1b1b3a'; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(-R * .18, -R * .22, R * .12, 0, 7); g.fill();
  });
  // 3 confetti square
  cell(3, () => { g.fillStyle = '#ffffff'; g.fillRect(-R * .62, -R * .62, R * 1.24, R * 1.24); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(-R * .62, R * .2, R * 1.24, R * .42); });
  // 4 leaf
  cell(4, () => {
    g.beginPath(); g.moveTo(0, -R * .95);
    g.bezierCurveTo(R * .75, -R * .5, R * .7, R * .45, 0, R * .8);
    g.bezierCurveTo(-R * .7, R * .45, -R * .75, -R * .5, 0, -R * .95);
    g.fillStyle = '#ffffff'; g.fill();
    g.strokeStyle = 'rgba(80,40,10,.45)'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(0, -R * .8); g.lineTo(0, R * .95); g.stroke();
    for (const s of [-1, 1]) for (const y of [-.35, .05, .4]) { g.beginPath(); g.moveTo(0, y * R); g.lineTo(s * R * .38, (y - .25) * R); g.stroke(); }
  });
  // 5 snowflake: crisp round flake with soft halo
  cell(5, () => {
    const grd = g.createRadialGradient(0, 0, 0, 0, 0, R);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(.45, 'rgba(255,255,255,1)');
    grd.addColorStop(.55, 'rgba(255,255,255,.35)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill();
  });
  // 6 dandelion fluff
  cell(6, () => {
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.6;
    for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * R * .9, Math.sin(a) * R * .9); g.stroke(); }
    const grd = g.createRadialGradient(0, 0, 0, 0, 0, R);
    grd.addColorStop(0, 'rgba(255,255,255,.9)'); grd.addColorStop(.25, 'rgba(255,255,255,.45)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill();
  });
  // 7 shard
  cell(7, () => {
    g.beginPath(); g.moveTo(0, -R * .9); g.lineTo(R * .6, R * .55); g.lineTo(-R * .45, R * .7); g.closePath();
    g.fillStyle = '#ffffff'; g.fill();
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.moveTo(0, -R * .9); g.lineTo(R * .6, R * .55); g.lineTo(R * .05, R * .3); g.closePath(); g.fill();
  });
  atlasTex = new THREE.CanvasTexture(cv);
  atlasTex.generateMipmaps = false;
  atlasTex.minFilter = THREE.LinearFilter;
  atlasTex.magFilter = THREE.LinearFilter;
  return atlasTex;
}

export const FX_VERT = `attribute float size; attribute vec4 color; attribute vec3 misc;
  uniform float scale; varying vec4 vC; varying vec3 vM;
  void main(){ vC = color; vM = misc; vec4 mv = modelViewMatrix * vec4(position, 1.);
    vC.a *= smoothstep(.8, 2.6, -mv.z);
    gl_PointSize = min(size * scale / max(-mv.z, .01), scale * .35); gl_Position = projectionMatrix * mv; }`;
export const FX_FRAG = `uniform sampler2D map; varying vec4 vC; varying vec3 vM;
  void main(){ vec2 c = gl_PointCoord - .5; float s = sin(vM.x), k = cos(vM.x);
    c = mat2(k, -s, s, k) * c; c.x /= max(vM.y, .08);
    if (abs(c.x) > .5 || abs(c.y) > .5) discard;
    float sh = floor(vM.z + .5); vec2 cell = vec2(mod(sh, 4.), floor(sh / 4.));
    vec2 uv = vec2((cell.x + c.x + .5) * .25, 1. - (cell.y + c.y + .5) * .5);
    vec4 t = texture2D(map, uv); float a = t.a * vC.a; if (a < .015) discard;
    gl_FragColor = vec4(vC.rgb * t.rgb, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;

export class SpriteBatch {
  constructor(scene, cap, { additive = false, order = 0 } = {}) {
    this.cap = cap;
    this.pos = new Float32Array(cap * 3);
    this.col = new Float32Array(cap * 4);
    this.size = new Float32Array(cap);
    this.misc = new Float32Array(cap * 3);
    for (let i = 0; i < cap; i++) { this.pos[i * 3 + 1] = -9999; this.misc[i * 3 + 1] = 1; }
    const g = new THREE.BufferGeometry();
    const dyn = (a, n) => new THREE.BufferAttribute(a, n).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', dyn(this.pos, 3));
    g.setAttribute('color', dyn(this.col, 4));
    g.setAttribute('size', dyn(this.size, 1));
    g.setAttribute('misc', dyn(this.misc, 3));
    this.mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: fxAtlas() }, scale: { value: 400 } },
      vertexShader: FX_VERT, fragmentShader: FX_FRAG,
      transparent: true, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      toneMapped: !additive,
    });
    this.points = new THREE.Points(g, this.mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = order;
    scene.add(this.points);
    this.c = new THREE.Color();
  }
  setColor(i, color, a = 1) {
    if (typeof color === 'number') this.c.setHex(color); else this.c.copy(color);
    const j = i * 4; this.col[j] = this.c.r; this.col[j + 1] = this.c.g; this.col[j + 2] = this.c.b; this.col[j + 3] = a;
  }
  set(i, x, y, z, color, a, size, ang = 0, squash = 1, shape = 0) {
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.setColor(i, color, a);
    this.size[i] = size;
    this.misc[i * 3] = ang; this.misc[i * 3 + 1] = squash; this.misc[i * 3 + 2] = shape;
  }
  hide(i) { this.pos[i * 3 + 1] = -9999; this.size[i] = 0; }
  hideAll() { for (let i = 0; i < this.cap; i++) this.hide(i); }
  set scale(v) { this.mat.uniforms.scale.value = v; }
  flush() {
    const a = this.points.geometry.attributes;
    a.position.needsUpdate = a.color.needsUpdate = a.size.needsUpdate = a.misc.needsUpdate = true;
  }
  dispose() { this.points.parent?.remove(this.points); this.points.geometry.dispose(); this.mat.dispose(); }
}

export class FxParticles extends SpriteBatch {
  constructor(scene, cap, opts) {
    super(scene, cap, opts);
    this.vel = new Float32Array(cap * 3);
    this.life = new Float32Array(cap);
    this.max = new Float32Array(cap);
    this.s0 = new Float32Array(cap);
    this.s1 = new Float32Array(cap);
    this.a0 = new Float32Array(cap);
    this.grav = new Float32Array(cap);
    this.drag = new Float32Array(cap);
    this.spin = new Float32Array(cap);
    this.flut = new Float32Array(cap);
    this.next = 0;
    this.live = 0;
  }
  // Returns the slot index so callers can tweak spin/flutter/etc.
  emit(x, y, z, vx, vy, vz, color, s0, s1, life, shape = 0, grav = 0, drag = 0, alpha = 1) {
    const i = this.next; this.next = (this.next + 1) % this.cap;
    const p = i * 3;
    this.pos[p] = x; this.pos[p + 1] = y; this.pos[p + 2] = z;
    this.vel[p] = vx; this.vel[p + 1] = vy; this.vel[p + 2] = vz;
    this.setColor(i, color, alpha);
    this.life[i] = this.max[i] = life;
    this.s0[i] = s0; this.s1[i] = s1; this.size[i] = s0; this.a0[i] = alpha;
    this.grav[i] = grav; this.drag[i] = drag; this.spin[i] = 0; this.flut[i] = 0;
    this.misc[p] = Math.random() * 6.283; this.misc[p + 1] = 1; this.misc[p + 2] = shape;
    this.live = this.cap;
    return i;
  }
  update(dt) {
    if (!this.live) return;
    let alive = 0;
    for (let i = 0; i < this.cap; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt;
      const p = i * 3;
      if (this.life[i] <= 0) { this.pos[p + 1] = -9999; this.size[i] = 0; continue; }
      alive++;
      const d = this.drag[i];
      if (d) { const k = Math.max(0, 1 - d * dt); this.vel[p] *= k; this.vel[p + 1] *= k; this.vel[p + 2] *= k; }
      this.vel[p + 1] -= this.grav[i] * dt;
      this.pos[p] += this.vel[p] * dt; this.pos[p + 1] += this.vel[p + 1] * dt; this.pos[p + 2] += this.vel[p + 2] * dt;
      const f = this.life[i] / this.max[i];
      this.size[i] = this.s1[i] + (this.s0[i] - this.s1[i]) * f;
      this.col[i * 4 + 3] = this.a0[i] * Math.min(1, f * 3, (1 - f) * 25 + .2);
      this.misc[p] += this.spin[i] * dt;
      if (this.flut[i]) this.misc[p + 1] = Math.abs(Math.cos((this.max[i] - this.life[i]) * this.flut[i] + i));
    }
    this.flush();
    this.live = alive;
  }
  clear() { this.life.fill(0); this.hideAll(); this.flush(); this.live = 0; }
}
