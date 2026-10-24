// Pooled, procedural visual effects: dust, sparkles, shockwaves, speed lines and power-up auras.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const rand = (a, b) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;

// ---------- canvas textures ----------
function canvasTex(size, draw) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const softTex = canvasTex(64, (g, s) => {
  const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.4, 'rgba(255,255,255,0.6)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, s, s);
});
const starTex = canvasTex(64, (g, s) => {
  const h = s / 2;
  const r = g.createRadialGradient(h, h, 0, h, h, h * 0.45);
  r.addColorStop(0, 'rgba(255,255,255,0.9)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, s, s);
  g.fillStyle = '#fff';
  g.beginPath();                                    // 4-point sparkle
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU - Math.PI / 2, rr = i % 2 ? h * 0.16 : h * 0.95;
    g.lineTo(h + Math.cos(a) * rr, h + Math.sin(a) * rr);
  }
  g.closePath(); g.fill();
});
const ringTex = canvasTex(128, (g, s) => {
  const r = g.createRadialGradient(s / 2, s / 2, s * 0.3, s / 2, s / 2, s / 2);
  r.addColorStop(0, 'rgba(255,255,255,0)');
  r.addColorStop(0.7, 'rgba(255,255,255,1)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, s, s);
});
const dashTex = canvasTex(256, (g, s) => {
  g.lineWidth = s * 0.07;
  for (let i = 0; i < 16; i++) {
    g.strokeStyle = i % 2 ? '#ffffff' : '#ff2b3d';
    g.beginPath(); g.arc(s / 2, s / 2, s * 0.42, (i / 16) * TAU, ((i + 0.8) / 16) * TAU); g.stroke();
  }
});

// ---------- point-particle pool (one THREE.Points per look) ----------
const pointVS = `
attribute float aSize; attribute float aAlpha; attribute vec3 aColor;
uniform float uScale; varying vec3 vColor; varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uScale / max(0.1, -mv.z);
  gl_Position = projectionMatrix * mv;
  vColor = aColor; vAlpha = aAlpha;
}`;
const pointFS = `
uniform sampler2D map; varying vec3 vColor; varying float vAlpha;
void main() {
  vec4 t = texture2D(map, gl_PointCoord);
  float a = t.a * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor * t.rgb, a);
}`;
const tmpC = new THREE.Color();

class Pool {
  constructor(scene, n, map, blending) {
    this.n = n; this.i = 0;
    this.pos = new Float32Array(n * 3); this.vel = new Float32Array(n * 3);
    this.col = new Float32Array(n * 3); this.size = new Float32Array(n); this.alpha = new Float32Array(n);
    this.life = new Float32Array(n); this.max = new Float32Array(n).fill(1);
    this.s0 = new Float32Array(n); this.s1 = new Float32Array(n); this.a0 = new Float32Array(n);
    this.grav = new Float32Array(n); this.drag = new Float32Array(n); this.drift = new Float32Array(n);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    this.uniforms = { map: { value: map }, uScale: { value: 500 } };
    this.points = new THREE.Points(geo, new THREE.ShaderMaterial({
      uniforms: this.uniforms, vertexShader: pointVS, fragmentShader: pointFS,
      transparent: true, depthWrite: false, blending,
    }));
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
    scene.add(this.points);
  }
  // life (s), size start/end (world units), color, alpha, gravity, drag, drift (fraction of world scroll)
  spawn(x, y, z, vx, vy, vz, life, s0, s1, color, a, grav = 0, drag = 0, drift = 1) {
    const i = this.i; this.i = (i + 1) % this.n;
    const k = i * 3;
    this.pos[k] = x; this.pos[k + 1] = y; this.pos[k + 2] = z;
    this.vel[k] = vx; this.vel[k + 1] = vy; this.vel[k + 2] = vz;
    tmpC.set(color);
    this.col[k] = tmpC.r; this.col[k + 1] = tmpC.g; this.col[k + 2] = tmpC.b;
    this.life[i] = this.max[i] = life; this.s0[i] = s0; this.s1[i] = s1; this.a0[i] = a;
    this.grav[i] = grav; this.drag[i] = drag; this.drift[i] = drift;
  }
  update(dt, scroll) {
    for (let i = 0; i < this.n; i++) {
      if (this.life[i] <= 0) { this.alpha[i] = 0; this.size[i] = 0; continue; }
      this.life[i] -= dt;
      const k = i * 3, t = 1 - Math.max(0, this.life[i]) / this.max[i], d = Math.max(0, 1 - this.drag[i] * dt);
      this.vel[k] *= d; this.vel[k + 1] = this.vel[k + 1] * d - this.grav[i] * dt; this.vel[k + 2] *= d;
      this.pos[k] += this.vel[k] * dt;
      this.pos[k + 1] = Math.max(-0.2, this.pos[k + 1] + this.vel[k + 1] * dt);
      this.pos[k + 2] += (this.vel[k + 2] + scroll * this.drift[i]) * dt;
      this.size[i] = this.s0[i] + (this.s1[i] - this.s0[i]) * t;
      this.alpha[i] = this.a0[i] * (1 - t * t) * Math.min(1, t * 12 + 0.2);
    }
    const a = this.points.geometry.attributes;
    a.position.needsUpdate = a.aColor.needsUpdate = a.aSize.needsUpdate = a.aAlpha.needsUpdate = true;
  }
  clear() { this.life.fill(0); this.update(0, 0); }
}

// ---------- shared geometry / materials ----------
const planeGeo = new THREE.PlaneGeometry(1, 1);
const shellGeo = new THREE.SphereGeometry(1, 24, 16);
const debrisGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const shellVS = `varying float vF; void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize(normalMatrix * normal);
  vF = pow(1.0 - abs(dot(n, normalize(-mv.xyz))), 2.0);
  gl_Position = projectionMatrix * mv; }`;
const shellFS = `uniform vec3 uColor; uniform float uOpacity; varying float vF;
void main() { gl_FragColor = vec4(uColor, (0.15 + vF) * uOpacity); }`;
const glowMat = (map, color = '#ffffff', blending = THREE.AdditiveBlending) =>
  new THREE.MeshBasicMaterial({ map, color, transparent: true, depthWrite: false, blending, side: THREE.DoubleSide, fog: false });
const blink = (t) => (t <= 0 ? 0 : t > 1.5 ? 1 : Math.sin(t * 26) > 0 ? 1 : 0.2);
const DEBRIS_COLORS = ['#ffc531', '#17b9a8', '#ff4d6d', '#2c2f45', '#f7f3ea', '#8a5cf6'];

export class FX {
  constructor(scene, camera) {
    this.scene = scene; this.camera = camera;
    this.dust = new Pool(scene, 180, softTex, THREE.NormalBlending);
    this.glow = new Pool(scene, 320, softTex, THREE.AdditiveBlending);
    this.stars = new Pool(scene, 220, starTex, THREE.AdditiveBlending);
    this.pools = [this.dust, this.glow, this.stars];

    // expanding rings (ground shockwaves or camera-facing glints)
    this.rings = [];
    for (let i = 0; i < 12; i++) {
      const m = new THREE.Mesh(planeGeo, glowMat(ringTex));
      m.visible = false; m.renderOrder = 6; scene.add(m);
      this.rings.push({ m, life: 0, max: 1, s0: 0, s1: 1, a0: 1, drift: 0, bb: false });
    }
    // fresnel sphere shells
    this.shells = [];
    for (let i = 0; i < 3; i++) {
      const u = { uColor: { value: new THREE.Color() }, uOpacity: { value: 0 } };
      const m = new THREE.Mesh(shellGeo, new THREE.ShaderMaterial({ uniforms: u, vertexShader: shellVS, fragmentShader: shellFS,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      m.visible = false; scene.add(m);
      this.shells.push({ m, u, life: 0, max: 1, s1: 1 });
    }
    // crash debris
    this.nDeb = 28;
    this.debris = new THREE.InstancedMesh(debrisGeo, new THREE.MeshLambertMaterial(), this.nDeb);
    this.debris.frustumCulled = false;
    this.debData = new Float32Array(this.nDeb * 10);   // px py pz vx vy vz rx ry spin life
    for (let i = 0; i < this.nDeb; i++) this.debris.setColorAt(i, tmpC.set(DEBRIS_COLORS[i % DEBRIS_COLORS.length]));
    this.dummy = new THREE.Object3D();
    scene.add(this.debris);

    // speed lines: additive line segments, the tail vertex is black so it fades out
    this.nLines = 56;
    this.lineData = new Float32Array(this.nLines * 4);    // x y z len (len 0 = inactive)
    this.linePos = new Float32Array(this.nLines * 6);
    this.lineCol = new Float32Array(this.nLines * 6);
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.BufferAttribute(this.linePos, 3).setUsage(THREE.DynamicDrawUsage));
    lg.setAttribute('color', new THREE.BufferAttribute(this.lineCol, 3).setUsage(THREE.DynamicDrawUsage));
    this.lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    this.lines.frustumCulled = false;
    scene.add(this.lines);

    // auras
    this.magRing = new THREE.Mesh(planeGeo, glowMat(dashTex, '#ffffff', THREE.NormalBlending));
    this.magRing.scale.setScalar(2.3);
    this.sneakRing = new THREE.Mesh(planeGeo, glowMat(ringTex, '#4dff7a'));
    this.sneakRing.scale.setScalar(1.5);
    for (const m of [this.magRing, this.sneakRing]) { m.rotation.x = -Math.PI / 2; m.visible = false; scene.add(m); }
    // dizzy stars
    this.dizzyMat = new THREE.SpriteMaterial({ map: starTex, color: '#fff7b0', transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, fog: false });
    this.dizzy = [0, 1, 2].map(() => { const s = new THREE.Sprite(this.dizzyMat); s.visible = false; scene.add(s); return s; });

    this.reset();
  }

  reset() {
    for (const p of this.pools) p.clear();
    for (const r of this.rings) { r.life = 0; r.m.visible = false; }
    for (const s of this.shells) { s.life = 0; s.m.visible = false; }
    this.debData.fill(0); this.debActive = true; this.updateDebris(0, 0);
    this.lineData.fill(0); this.linePos.fill(0); this.lineCol.fill(0);
    this.lines.geometry.attributes.position.needsUpdate = this.lines.geometry.attributes.color.needsUpdate = true;
    this.dustAcc = this.lineAcc = this.auraAcc = this.arcAcc = 0;
    this.lineI = 0; this.lineInt = 0; this.dizzyT = 0; this.time = 0; this.px = 0; this.py = 0; this.headY = 1.7;
    this.magRing.visible = this.sneakRing.visible = false;
    for (const s of this.dizzy) s.visible = false;
  }

  // ---------- one-shot helpers ----------
  ring(x, y, z, s0, s1, life, color, a, ground, drift = 0) {
    const r = this.rings.reduce((best, c) => (c.life < best.life ? c : best));   // oldest/free slot
    Object.assign(r, { life, max: life, s0, s1, a0: a, drift, bb: !ground });
    r.m.position.set(x, y, z);
    if (ground) r.m.rotation.set(-Math.PI / 2, 0, 0);
    r.m.material.color.set(color);
    r.m.visible = true;
  }
  shell(x, y, z, size, life, color) {
    const s = this.shells.reduce((best, c) => (c.life < best.life ? c : best));
    s.life = s.max = life; s.s1 = size;
    s.m.position.set(x, y, z); s.u.uColor.value.set(color); s.m.visible = true;
  }
  puffs(x, y, n, spread, up, back, size = 0.5) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, sp = rand(0.5, 1) * spread;
      this.dust.spawn(x + Math.cos(a) * 0.2, y + 0.1, Math.sin(a) * 0.2, Math.cos(a) * sp, rand(0.3, 1) * up,
        Math.sin(a) * sp + back, rand(0.35, 0.6), size * 0.5, size * rand(1.3, 1.8), '#a59584', 0.55, 0, 3, 1);
    }
  }
  burstStars(pool, x, y, z, n, speed, color, size, life, grav, drift) {
    for (let i = 0; i < n; i++) {
      const u = rand(-1, 1), a = Math.random() * TAU, r = Math.sqrt(1 - u * u), sp = speed * rand(0.5, 1);
      pool.spawn(x, y, z, Math.cos(a) * r * sp, u * sp + speed * 0.3, Math.sin(a) * r * sp,
        life * rand(0.7, 1.2), size, size * 0.2, color, 1, grav, 2, drift);
    }
  }

  // ---------- events ----------
  coin(pos) {
    this.burstStars(this.stars, pos.x, pos.y, pos.z, 10, 4.5, '#ffe066', 0.42, 0.5, 6, 0.6);
    this.burstStars(this.glow, pos.x, pos.y, pos.z, 5, 2, '#ffb52e', 0.5, 0.3, 0, 0.6);
    this.ring(pos.x, pos.y, pos.z, 0.2, 1.4, 0.28, '#fff2a0', 0.9, false);
  }
  powerup(pos, color = '#ffffff') {
    this.burstStars(this.stars, pos.x, pos.y, pos.z, 30, 7, color, 0.55, 0.7, 4, 0.4);
    this.burstStars(this.glow, pos.x, pos.y, pos.z, 18, 4, '#ffffff', 0.7, 0.45, 0, 0.4);
    this.shell(pos.x, pos.y, pos.z, 3.2, 0.5, color);
    this.ring(pos.x, pos.y, pos.z, 0.3, 3.5, 0.4, color, 1, false);
  }
  jump(x, y) {
    this.ring(x, y + 0.04, 0, 0.3, 1.8, 0.35, '#fff6e0', 0.6, true, 1);
    this.puffs(x, y, 6, 2, 0.8, 1);
  }
  land(x, y) {
    this.ring(x, y + 0.04, 0, 0.5, 2.8, 0.4, '#fff6e0', 0.7, true, 1);
    this.puffs(x, y, 12, 3.2, 0.6, 0, 0.6);
  }
  roll(x, y) {
    for (let i = 0; i < 12; i++) {
      const side = i % 2 ? 1 : -1;
      this.dust.spawn(x + side * rand(0.1, 0.4), y + 0.08, rand(-0.2, 0.4), side * rand(1, 3), rand(0.2, 0.7), rand(1, 3),
        rand(0.3, 0.5), 0.25, rand(0.6, 0.9), '#a59584', 0.5, 0, 3, 1);
    }
  }
  stumble(x, y) {
    const hy = y + 1.6;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      this.stars.spawn(x + Math.cos(a) * 0.3, hy + Math.sin(a) * 0.3, 0.2, Math.cos(a) * 3, Math.sin(a) * 3 + 1, rand(-0.5, 0.5),
        0.4, 0.45, 0.1, '#ffffff', 1, 4, 3, 0);
    }
    this.ring(x, hy, 0.3, 0.2, 1.3, 0.22, '#ffffff', 0.8, false);
    this.dizzyT = 1.1;
  }
  crash(x, y) {
    const cy = y + 1;
    for (let i = 0; i < this.nDeb; i++) {
      const d = this.debData, k = i * 10, a = Math.random() * TAU;
      d[k] = x; d[k + 1] = cy; d[k + 2] = -0.4;
      d[k + 3] = Math.cos(a) * rand(2, 6); d[k + 4] = rand(3, 9); d[k + 5] = Math.sin(a) * rand(1, 4) + 2;
      d[k + 6] = Math.random() * TAU; d[k + 7] = Math.random() * TAU; d[k + 8] = rand(-12, 12); d[k + 9] = rand(1.2, 1.8);
    }
    this.debActive = true;
    this.burstStars(this.stars, x, cy, -0.3, 30, 9, '#ffd23f', 0.7, 0.6, 8, 0);
    this.burstStars(this.glow, x, cy, -0.3, 20, 5, '#ff7a2e', 1, 0.45, 0, 0);
    this.ring(x, cy, -0.2, 0.5, 6, 0.4, '#ffffff', 1, false);
    this.ring(x, y + 0.05, 0, 0.5, 4, 0.5, '#ffe2b8', 0.8, true);
    this.shell(x, cy, -0.3, 2.5, 0.35, '#fff2c0');
    this.puffs(x, y, 14, 4, 1.5, 0, 0.8);
  }

  // ---------- per frame ----------
  update(dt, p) {
    this.time += dt;
    const t = this.time, scroll = p.playing ? p.speed : 0, pw = p.powers || {};
    this.px = p.x; this.py = p.y;
    const head = p.y + (p.rolling ? 0.8 : 1.7);
    const scale = (window.innerHeight * Math.min(2, window.devicePixelRatio || 1)) /
      (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2));

    // running dust
    if (p.playing && p.onGround) {
      this.dustAcc += dt * (3 + p.speed * 0.3) * (p.rolling ? 1.6 : 1);
      while (this.dustAcc > 1) {
        this.dustAcc -= 1;
        this.dust.spawn(p.x + rand(-0.3, 0.3), p.y + 0.08, rand(0.2, 0.4), rand(-0.6, 0.6), rand(0.5, 1.3), rand(0.5, 2),
          rand(0.35, 0.55), 0.2, rand(0.6, 0.9), '#a59584', 0.45, 0, 2, 1);
      }
    }

    // power-up auras
    const am = blink(pw.magnet || 0), ad = blink(pw.double || 0), as = blink(pw.sneakers || 0);
    this.magRing.visible = am > 0;
    if (am > 0) {
      this.magRing.position.set(p.x, p.y + (p.rolling ? 0.45 : 0.9), 0);
      this.magRing.rotation.set(-Math.PI / 2 + Math.sin(t * 3) * 0.12, Math.cos(t * 2.3) * 0.12, t * 4);
      this.magRing.material.opacity = 0.85 * am;
      if ((this.arcAcc += dt) > 0.18) {
        this.arcAcc = 0;
        const a0 = Math.random() * TAU, yy = p.y + rand(0.3, 1.5);
        for (let i = 0; i < 6; i++) {
          const a = a0 + i * 0.13;
          this.glow.spawn(p.x + Math.cos(a) * 1.25, yy, Math.sin(a) * 1.25, 0, 0, 0, 0.25, 0.35, 0.1, '#ff3344', am, 0, 0, 0);
        }
      }
    }
    this.sneakRing.visible = as > 0;
    if (as > 0) {
      this.sneakRing.position.set(p.x, p.y + 0.04, 0);
      this.sneakRing.material.opacity = (0.6 + Math.sin(t * 10) * 0.2) * as * (p.onGround ? 1 : 0.5);
    }
    this.auraAcc += dt;
    while (this.auraAcc > 1 / 30) {
      this.auraAcc -= 1 / 30;
      if (ad > 0 && Math.random() < 0.4) {
        const a = Math.random() * TAU;
        this.stars.spawn(p.x + Math.cos(a) * rand(0.5, 0.8), p.y + rand(0, 1.4), Math.sin(a) * 0.6, 0, rand(1, 2), 0,
          rand(0.5, 0.8), 0.3, 0.05, Math.random() < 0.5 ? '#b57bff' : '#e2c6ff', ad, -1, 0, 0);
      }
      if (as > 0 && !p.onGround) {
        for (let f = -1; f <= 1; f += 2) {
          this.glow.spawn(p.x + f * 0.18, p.y + 0.15, 0.1, 0, 0, 0, 0.35, 0.45, 0.15, '#4dff7a', 0.8 * as, 0, 0, p.playing ? 0.6 : 0);
        }
      }
    }

    for (const pool of this.pools) { pool.uniforms.uScale.value = scale; pool.update(dt, scroll); }

    // rings and shells
    for (const r of this.rings) {
      if (r.life <= 0) continue;
      r.life -= dt;
      const k = 1 - Math.max(0, r.life) / r.max;
      r.m.scale.setScalar(r.s0 + (r.s1 - r.s0) * (1 - (1 - k) * (1 - k)));
      r.m.material.opacity = r.a0 * (1 - k);
      r.m.position.z += scroll * r.drift * dt;
      if (r.bb) r.m.quaternion.copy(this.camera.quaternion);
      r.m.visible = r.life > 0;
    }
    for (const s of this.shells) {
      if (s.life <= 0) continue;
      s.life -= dt;
      const k = 1 - Math.max(0, s.life) / s.max;
      s.m.scale.setScalar(0.3 + (s.s1 - 0.3) * Math.sqrt(k));
      s.u.uOpacity.value = 1 - k;
      s.m.visible = s.life > 0;
    }

    // dizzy stars orbiting above the head
    if (this.dizzyT > 0) this.dizzyT -= dt;
    for (let i = 0; i < 3; i++) {
      const s = this.dizzy[i], a = t * 7 + (i * TAU) / 3;
      s.visible = this.dizzyT > 0;
      if (!s.visible) continue;
      s.position.set(p.x + Math.cos(a) * 0.45, head + 0.3 + Math.sin(a * 2) * 0.05, Math.sin(a) * 0.45);
      s.scale.setScalar(0.32 * Math.min(1, this.dizzyT * 4, (1.1 - this.dizzyT) * 8));
    }

    this.updateDebris(dt, scroll);
    this.updateLines(dt, p, scroll);
  }

  updateDebris(dt, scroll) {
    if (!this.debActive) return;
    let any = false;
    const d = this.debData, o = this.dummy;
    for (let i = 0; i < this.nDeb; i++) {
      const k = i * 10;
      if (d[k + 9] > 0) {
        any = true;
        d[k + 9] -= dt;
        d[k + 4] -= 22 * dt;
        d[k] += d[k + 3] * dt; d[k + 1] += d[k + 4] * dt; d[k + 2] += (d[k + 5] + scroll) * dt;
        if (d[k + 1] < 0.1) { d[k + 1] = 0.1; d[k + 4] *= -0.35; d[k + 3] *= 0.6; d[k + 5] *= 0.6; d[k + 8] *= 0.6; }
        d[k + 6] += d[k + 8] * dt; d[k + 7] += d[k + 8] * 0.7 * dt;
      }
      o.position.set(d[k], d[k + 1], d[k + 2]);
      o.rotation.set(d[k + 6], d[k + 7], 0);
      o.scale.setScalar(d[k + 9] > 0 ? Math.min(1, d[k + 9] * 3) : 0);
      o.updateMatrix();
      this.debris.setMatrixAt(i, o.matrix);
    }
    this.debris.instanceMatrix.needsUpdate = true;
    this.debActive = any;
  }

  updateLines(dt, p, scroll) {
    const target = p.playing ? 0.18 + 0.82 * THREE.MathUtils.clamp((p.speed - 24) / 10, 0, 1) : 0;
    this.lineInt += (target - this.lineInt) * Math.min(1, dt * 3);
    const I = this.lineInt, L = this.lineData, P = this.linePos, C = this.lineCol;
    this.lineAcc += dt * (4 + 60 * I * I) * (I > 0.02 ? 1 : 0);
    while (this.lineAcc > 1) {
      this.lineAcc -= 1;
      const k = this.lineI * 4; this.lineI = (this.lineI + 1) % this.nLines;
      let x, y, n = 0;
      do { x = p.x + rand(-8, 8); y = rand(0.5, 8); n++; }        // keep a clear centre around the player
      while (n < 8 && Math.abs(x - p.x) < 3.4 && y < p.y + 5);
      L[k] = x; L[k + 1] = y; L[k + 2] = rand(-45, -30); L[k + 3] = rand(3, 7);
    }
    const v = 40 + scroll * 2;
    for (let i = 0; i < this.nLines; i++) {
      const k = i * 4, j = i * 6;
      if (L[k + 3] > 0) {
        L[k + 2] += v * dt;
        if (L[k + 2] > 9) L[k + 3] = 0;
      }
      const len = L[k + 3] * (0.6 + I), b = L[k + 3] > 0 ? 0.55 * I * Math.min(1, (L[k + 2] + 45) / 12) : 0;
      P[j] = P[j + 3] = L[k]; P[j + 1] = P[j + 4] = L[k + 1];
      P[j + 2] = L[k + 2]; P[j + 5] = L[k + 2] - len;
      C[j] = C[j + 1] = C[j + 2] = b; C[j + 3] = C[j + 4] = C[j + 5] = 0;
    }
    const a = this.lines.geometry.attributes;
    a.position.needsUpdate = a.color.needsUpdate = true;
  }
}
