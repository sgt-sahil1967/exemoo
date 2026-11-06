// Visual effects layer: boost flames, drift sparks + skid marks, cartoon dust,
// hit stars, item-box shards, clover rainbow shell, finish confetti/fireworks,
// per-map weather that follows every camera, camera shake and HUD overlays.
// Everything is pooled / preallocated; nothing allocates per frame in steady state.
import * as THREE from 'three';
import { FxParticles, SpriteBatch, SHAPE, FX_FRAG } from './particles.js';
import { terrainH } from './track.js';

const C = {
  red: 0xff3b30, yellow: 0xffd21f, blue: 0x2f7cff, green: 0x2fc65a, orange: 0xff8a00,
  ink: 0x1b1b3a, white: 0xffffff, pink: 0xff5fa2, purple: 0xa45bff, cyan: 0x5fd8ff,
};
const PARTY = [C.red, C.yellow, C.blue, C.green, C.orange, C.pink, C.purple];
const DUST = {
  grass: [0xb8c97a, 0xd9d39c, 0xa7bf6a],
  mud: [0x6b4423, 0x8a5a2e, 0x5a3a1c],
  sand: [0xf0d090, 0xe8bf7a, 0xf6e0b0],
  leaves: [0xffb04a, 0xe0a060, 0xf2c48a],
  ice: [0xffffff, 0xe2f4ff, 0xcfeaff],
};
const LEAF_COLS = [C.orange, C.red, 0xffc23a, 0xc4561c];
const ROAD_DUST = [0xeeeae2, 0xdcd8d0];
const SPARK = [0xfff1c0, 0x46b4ff, 0xff8a1a];
const FLAME_COLS = [[0xff7a1a, 0xffd23a, 0xffe9a0], [0x46b4ff, 0x9fe6ff, 0xffffff], [0xff4a1a, 0xff9a1a, 0xffe27a]];
const SKID_N = 1400, SKID_LIFE = 6;
const STARS_PER = 5, RING_KARTS = 16;
const TAU = Math.PI * 2;
const R = Math.random;
const rr = (a, b) => a + (b - a) * R();
const pick = a => a[(R() * a.length) | 0];

// Surface height offsets so skid marks sit on top of whatever mesh is there.
const SKID_Y = { road: .17, boost: .33, grass: .1, mud: .24, sand: .24, leaves: .24, ice: .24 };

const WEATHER = {
  clover: {
    n: 560, box: [90, 32, 90], wind: [1.1, .3, .5], sway: 1.0, spin: .6, tumble: 0, alpha: .9,
    parts: [{ f: .7, shape: SHAPE.fluff, cols: [0xffffff, 0xfffbe8], size: [.3, .5] },
            { f: .3, shape: SHAPE.snow, cols: [0xffe45a, 0xfff2a0], size: [.09, .15] }],
  },
  pumpkin: {
    n: 440, box: [90, 34, 90], wind: [3.0, -1.7, 1.4], sway: 1.8, spin: 2.4, tumble: 1, alpha: 1,
    parts: [{ f: 1, shape: SHAPE.leaf, cols: [C.orange, C.red, 0xffc23a, 0xc4561c, 0xe0a020], size: [.45, .75] }],
  },
  frosty: {
    n: 2400, box: [80, 36, 80], wind: [.9, -3.4, .4], sway: .7, spin: .3, tumble: 0, alpha: .95,
    parts: [{ f: .88, shape: SHAPE.snow, cols: [0xffffff, 0xf2f8ff], size: [.16, .3] },
            { f: .12, shape: SHAPE.snow, cols: [0xffffff], size: [.36, .48] }],
  },
  canyon: {
    n: 1200, box: [90, 26, 90], wind: [11, .25, 3.2], sway: .5, spin: 1.0, tumble: 0, alpha: .55,
    parts: [{ f: .85, shape: SHAPE.snow, cols: [0xf3d8a8, 0xe6b77c, 0xffe9c4], size: [.07, .16] },
            { f: .15, shape: SHAPE.puff, cols: [0xf0cf98, 0xe8c08a], size: [.5, .9] }],
  },
};

const WEATHER_VERT = `attribute float rnd; attribute vec3 color; attribute float size; attribute float shape;
  uniform float time, scale, sway, spin, tumble, alpha; uniform vec3 box, offA, offB;
  varying vec4 vC; varying vec3 vM;
  void main(){
    vec3 p = position * box + (rnd < .5 ? offA : offB);
    float ph = rnd * 61.7;
    p.x += sin(time * (.6 + rnd * .9) + ph) * sway;
    p.z += cos(time * (.5 + rnd * .7) + ph * 1.3) * sway;
    p.y += sin(time * (.8 + rnd) + ph * .7) * sway * .35;
    vec3 o = cameraPosition - box * vec3(.5, .4, .5);
    p = mod(p - o, box) + o;
    vec4 mv = viewMatrix * vec4(p, 1.);
    float d = length(p.xz - cameraPosition.xz) / (box.x * .5);
    float hy = (p.y - o.y) / box.y;
    float a = alpha * (1. - smoothstep(.6, 1., d)) * smoothstep(0., .1, hy) * smoothstep(1., .85, hy) * smoothstep(.6, 2.2, -mv.z);
    vC = vec4(color, a);
    float sq = tumble > .5 ? .2 + .8 * abs(cos(time * (1.2 + rnd * 2.) + ph)) : 1.;
    vM = vec3(time * spin * (rnd - .5) * 2. + ph, sq, shape);
    gl_PointSize = a < .01 ? 0. : min(size * scale / max(-mv.z, .01), scale * .09);
    gl_Position = projectionMatrix * mv;
  }`;

function flameMat(color) {
  return new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color(color) } },
    vertexShader: `varying float vT; varying vec3 vN; varying vec3 vV;
      void main(){ vT = clamp(-position.z, 0., 1.); vec4 mv = modelViewMatrix * vec4(position, 1.);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 color; varying float vT; varying vec3 vN; varying vec3 vV;
      void main(){ float f = abs(dot(normalize(vN), normalize(vV)));
        float a = pow(1. - vT, 1.4) * (.3 + .7 * f);
        gl_FragColor = vec4(color * (1. + (1. - vT) * .7), a);
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
  });
}

export class Effects {
  constructor(game) {
    this.game = game;
    const scene = game.scene;
    this.t = 0;
    this.c = new THREE.Color();
    this.wx = 0; this.wy = 0; this.wz = 0;
    this.states = new WeakMap();

    // particle pools
    this.norm = new FxParticles(scene, 2600, { additive: false, order: 2 });
    this.add = new FxParticles(scene, 2600, { additive: true, order: 3 });
    this.ring = new SpriteBatch(scene, RING_KARTS * STARS_PER, { additive: false, order: 4 });
    this.ringUsed = new Uint8Array(RING_KARTS);

    // boost flames (shared geometry + per-level materials)
    const fg = new THREE.ConeGeometry(1, 1, 14, 1, true);
    fg.translate(0, .5, 0); fg.rotateX(-Math.PI / 2);
    this.flameGeo = fg;
    this.flameMats = FLAME_COLS.map(c => [flameMat(c[0]), flameMat(c[1])]);
    const dot = game.T?.dot;
    const glowMat = col => new THREE.SpriteMaterial({ map: dot, color: col, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false });
    this.glowMats = FLAME_COLS.map(c => glowMat(c[2]));
    this.sparkGlow = SPARK.map(c => glowMat(c));

    // clover rainbow shell
    this.shellGeo = new THREE.SphereGeometry(1, 28, 18);
    this.shellMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, opacity: { value: 1 } },
      vertexShader: `varying vec3 vN; varying vec3 vV; varying float vY;
        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vY = position.y;
          gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float time, opacity; varying vec3 vN; varying vec3 vV; varying float vY;
        void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 1.7);
          float h = fract(time * .55 + vY * .4 + f * .35);
          vec3 c = clamp(abs(mod(h * 6. + vec3(0., 4., 2.), 6.) - 3.) - 1., 0., 1.);
          c = mix(c, vec3(1.), .2);
          gl_FragColor = vec4(c, (f * .95 + .06) * opacity);
          #include <colorspace_fragment>
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    });

    // skid marks: one dynamic mesh, ring buffer of quads
    this.skidPos = new Float32Array(SKID_N * 6 * 3);
    this.skidBirth = new Float32Array(SKID_N * 6).fill(-1e6);
    this.skidEdge = new Float32Array(SKID_N * 6);
    for (let s = 0; s < SKID_N; s++) {
      const e = this.skidEdge, o = s * 6;
      e[o] = 0; e[o + 1] = 1; e[o + 2] = 1; e[o + 3] = 0; e[o + 4] = 1; e[o + 5] = 0;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(this.skidPos, 3).setUsage(THREE.DynamicDrawUsage));
    sg.setAttribute('birth', new THREE.BufferAttribute(this.skidBirth, 1).setUsage(THREE.DynamicDrawUsage));
    sg.setAttribute('edge', new THREE.BufferAttribute(this.skidEdge, 1));
    this.skidMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, color: { value: new THREE.Color(0x1d1a24) } },
      vertexShader: `attribute float birth; attribute float edge; uniform float time; varying float vA; varying float vE;
        void main(){ vA = clamp(1. - (time - birth) / ${SKID_LIFE.toFixed(1)}, 0., 1.); vE = edge;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
      fragmentShader: `uniform vec3 color; varying float vA; varying float vE;
        void main(){ float a = .5 * vA * smoothstep(0., .3, vE) * smoothstep(1., .7, vE); if (a < .01) discard;
          gl_FragColor = vec4(color, a);
          #include <colorspace_fragment>
        }`,
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    });
    this.skid = new THREE.Mesh(sg, this.skidMat);
    this.skid.frustumCulled = false;
    this.skid.renderOrder = 1;
    scene.add(this.skid);
    this.skidNext = 0; this.skidDirty = false;

    // fireworks pool
    this.fw = [];
    for (let i = 0; i < 24; i++) this.fw.push({ on: false, delay: 0, rise: 0, x: 0, y: 0, z: 0, vy: 0, col: 0, col2: 0 });

    // per-player camera shake and screen flash
    this.shake = new Float32Array(4);
    this.flash = new Float32Array(4);
    this.flashCol = ['255,60,48', '255,60,48', '255,60,48', '255,60,48'];
    this.v = new THREE.Vector3();

    this.weather = null;
    this.wOffA = new THREE.Vector3(); this.wOffB = new THREE.Vector3();
  }

  // ------------------------------------------------------------------ weather
  setTrack(track) {
    if (this.weather) {
      this.game.scene.remove(this.weather);
      this.weather.geometry.dispose(); this.weather.material.dispose();
      this.weather = null;
    }
    const cfg = WEATHER[track?.def?.id];
    if (!cfg) return;
    const n = cfg.n;
    const pos = new Float32Array(n * 3), rnd = new Float32Array(n), col = new Float32Array(n * 3), size = new Float32Array(n), shape = new Float32Array(n);
    const c = this.c;
    for (let i = 0; i < n; i++) {
      pos[i * 3] = R(); pos[i * 3 + 1] = R(); pos[i * 3 + 2] = R();
      rnd[i] = R();
      let r = R(), part = cfg.parts[0];
      for (const p of cfg.parts) { if (r < p.f) { part = p; break; } r -= p.f; }
      c.setHex(pick(part.cols));
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      size[i] = rr(part.size[0], part.size[1]);
      shape[i] = part.shape;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('rnd', new THREE.BufferAttribute(rnd, 1));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('size', new THREE.BufferAttribute(size, 1));
    g.setAttribute('shape', new THREE.BufferAttribute(shape, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: this.norm.mat.uniforms.map.value }, scale: { value: 400 }, time: { value: 0 },
        sway: { value: cfg.sway }, spin: { value: cfg.spin }, tumble: { value: cfg.tumble }, alpha: { value: cfg.alpha },
        box: { value: new THREE.Vector3(...cfg.box) }, offA: { value: this.wOffA }, offB: { value: this.wOffB },
      },
      vertexShader: WEATHER_VERT, fragmentShader: FX_FRAG,
      transparent: true, depthWrite: false,
    });
    this.weather = new THREE.Points(g, mat);
    this.weather.frustumCulled = false;
    this.weather.renderOrder = 6;
    this.weatherCfg = cfg;
    this.weatherT = 0;
    this.game.scene.add(this.weather);
  }

  _updateWeather(dt) {
    if (!this.weather) return;
    const cfg = this.weatherCfg, u = this.weather.material.uniforms, b = cfg.box, w = cfg.wind;
    this.weatherT += dt;
    const t = this.weatherT;
    u.time.value = t % 600;
    this.wOffA.set((w[0] * t) % b[0], (w[1] * t) % b[1], (w[2] * t) % b[2]);
    const t2 = t * 1.45;
    this.wOffB.set((w[0] * t2) % b[0], (w[1] * t2) % b[1], (w[2] * t2) % b[2]);
  }

  // ---------------------------------------------------------------- lifecycle
  clear() {
    this._conf = null;
    this.norm.clear(); this.add.clear();
    this.ring.hideAll(); this.ring.flush();
    this.skidBirth.fill(-1e6);
    this.skid.geometry.attributes.birth.needsUpdate = true;
    for (const f of this.fw) f.on = false;
    this.shake.fill(0); this.flash.fill(0);
    for (const k of this.game.karts || []) {
      const s = this.states.get(k);
      if (!s) continue;
      this._hideFlames(s);
      for (const g of s.wglow) g.visible = false;
      s.shell.visible = false;
      s.skid[0].has = s.skid[1].has = false;
      s.prevBoost = 0; s.prevSpeed = 0; s.lvl = 0;
    }
  }

  _st(k) {
    let s = this.states.get(k);
    if (s) return s;
    s = {
      prevSpeed: k.speed, prevBoost: k.boostT, lvl: 0, kick: 0, lastKick: -9, dustAcc: 0, smokeAcc: 0, starAge: 0,
      skid: [{ has: false, c: false, x: 0, z: 0, x0: 0, z0: 0, x1: 0, z1: 0 }, { has: false, c: false, x: 0, z: 0, x0: 0, z0: 0, x1: 0, z1: 0 }],
      flames: [], wglow: [], shell: null,
    };
    const body = k.model.body;
    for (const sx of [-.36, .36]) {
      const outer = new THREE.Mesh(this.flameGeo, this.flameMats[0][0]);
      const inner = new THREE.Mesh(this.flameGeo, this.flameMats[0][1]);
      outer.position.set(sx, .9, -2.08); inner.position.set(sx, .9, -2.1);
      outer.rotation.x = inner.rotation.x = .14;
      outer.renderOrder = 5; inner.renderOrder = 6;
      const glow = new THREE.Sprite(this.glowMats[0]);
      glow.position.set(sx, .9, -2.2); glow.renderOrder = 7;
      outer.visible = inner.visible = glow.visible = false;
      body.add(outer, inner, glow);
      s.flames.push({ outer, inner, glow });
    }
    for (const sx of [-1.15, 1.15]) {
      const g = new THREE.Sprite(this.sparkGlow[1]);
      g.position.set(sx, .2, -1.12); g.visible = false; g.renderOrder = 7;
      body.add(g); s.wglow.push(g);
    }
    const shell = new THREE.Mesh(this.shellGeo, this.shellMat);
    shell.position.set(0, 1.3, -.1); shell.visible = false; shell.renderOrder = 8;
    shell.userData.op = 1;
    const mat = this.shellMat;
    shell.onBeforeRender = () => { mat.uniforms.opacity.value = shell.userData.op; mat.uniformsNeedUpdate = true; };
    k.model.root.add(shell);
    s.shell = shell;
    this.states.set(k, s);
    return s;
  }

  _hideFlames(s) { for (const f of s.flames) f.outer.visible = f.inner.visible = f.glow.visible = false; }

  // kart-local (model yaw) to world; result in this.wx/wy/wz
  _w(k, lx, ly, lz) {
    const a = k.model.root.rotation.y, c = Math.cos(a), s = Math.sin(a);
    this.wx = k.x + lx * c + lz * s; this.wy = k.y + ly; this.wz = k.z - lx * s + lz * c;
  }

  _shake(p, a) { if (p >= 0 && p < 4) this.shake[p] = Math.min(1, Math.max(this.shake[p], a)); }

  // --------------------------------------------------------------- per step
  update(dt) {
    const g = this.game;
    this.t += dt;
    if (!g.track || !g.karts) return;
    const ks = g.karts;
    this.ringUsed.fill(0);
    for (let i = 0; i < ks.length; i++) this._kart(ks[i], i, dt);
    for (let i = 0; i < RING_KARTS; i++) if (!this.ringUsed[i]) for (let j = 0; j < STARS_PER; j++) this.ring.hide(i * STARS_PER + j);
    this.ring.flush();
    this._fireworks(dt);
    const cf = this._conf;
    if (cf && cf.t > 0) {
      cf.t -= dt; cf.acc += dt;
      const k = cf.k, ax = k.x + Math.sin(k.heading) * 10, az = k.z + Math.cos(k.heading) * 10;
      for (; cf.acc > .05; cf.acc -= .05) for (let i = 0; i < 6; i++) {
        const j = this.norm.emit(ax + rr(-9, 9), k.y + rr(7, 11), az + rr(-9, 9), rr(-1, 1), rr(-1, 0), rr(-1, 1), pick(PARTY), rr(.32, .42), .3, rr(2.5, 3.5), SHAPE.square, 9, 2.8);
        this.norm.spin[j] = rr(-6, 6); this.norm.flut[j] = rr(5, 12);
      }
    }
    this.norm.update(dt);
    this.add.update(dt);
    this.skidMat.uniforms.time.value = this.t;
    if (this.skidDirty) {
      const a = this.skid.geometry.attributes;
      a.position.needsUpdate = a.birth.needsUpdate = true;
      this.skidDirty = false;
    }
    this.shellMat.uniforms.time.value = this.t;
    this._updateWeather(dt);
    const sd = Math.exp(-5.5 * dt);
    for (let p = 0; p < 4; p++) { this.shake[p] *= sd; this.flash[p] = Math.max(0, this.flash[p] - dt * 2.4); }
  }

  _kart(k, idx, dt) {
    const s = this._st(k), N = this.norm, A = this.add;
    const a = k.model.root.rotation.y, mfx = Math.sin(a), mfz = Math.cos(a);
    const kvx = Math.sin(k.heading) * k.speed, kvz = Math.cos(k.heading) * k.speed;
    const sp = Math.abs(k.speed);

    // ---- boost flames ----
    if (k.boostT > 0) {
      if (s.prevBoost <= 0 && this.t - s.lastKick > .1) this._boostKick(k, s, 0);
      const L = s.lvl, mats = this.flameMats[L];
      const fade = Math.min(1, k.boostT / .2), kick = 1 + s.kick * 1.4;
      const base = (L === 2 ? 2.0 : L === 1 ? 1.5 : 1.25) * fade * kick;
      for (const f of s.flames) {
        if (f.outer.material !== mats[0]) { f.outer.material = mats[0]; f.inner.material = mats[1]; f.glow.material = this.glowMats[L]; }
        const len = base * rr(.72, 1.15), rad = (L === 2 ? .27 : .21) * fade * rr(.85, 1.12);
        f.outer.scale.set(rad, rad, len);
        f.inner.scale.set(rad * .55, rad * .55, len * .6);
        const gs = (L === 2 ? 1.7 : 1.25) * fade * rr(.8, 1.15) * Math.sqrt(kick);
        f.glow.scale.set(gs, gs, 1);
        f.outer.visible = f.inner.visible = f.glow.visible = true;
      }
      const cols = FLAME_COLS[L], n = L === 2 ? 3 : 2;
      for (let i = 0; i < n; i++) {
        this._w(k, i & 1 ? .36 : -.36, .92, -2.25);
        const v = rr(6, 11);
        A.emit(this.wx, this.wy, this.wz, kvx * .55 - mfx * v + rr(-1, 1), rr(.3, 1.6), kvz * .55 - mfz * v + rr(-1, 1),
          cols[(R() * 3) | 0], rr(.35, .6) * (L === 2 ? 1.25 : 1), 0, rr(.16, .28), SHAPE.glow, 0, 2);
      }
      s.kick = Math.max(0, s.kick - dt * 3.5);
    } else if (s.prevBoost > 0) { this._hideFlames(s); s.lvl = 0; s.kick = 0; }

    // ---- drift sparks + skid marks ----
    const lv = k.charge >= 2.2 ? 2 : k.charge >= 1 ? 1 : 0;
    if (k.drifting && !k.airborne) {
      for (let w = 0; w < 2; w++) {
        const sx = w ? 1.12 : -1.12;
        this._w(k, sx, .15, -1.15);
        const ns = lv ? 2 : (R() < .55 ? 1 : 0);
        for (let i = 0; i < ns; i++) {
          const v = rr(2, 5.5);
          A.emit(this.wx, this.wy, this.wz, kvx * .55 - mfx * v + rr(-2.5, 2.5), rr(2, 5.5), kvz * .55 - mfz * v + rr(-2.5, 2.5),
            SPARK[lv], rr(.2, .34) * (lv ? 1.25 : 1), .04, rr(.22, .4), SHAPE.glow, 16, .5);
        }
        this._skid(s.skid[w], k, sx);
      }
      for (const gl of s.wglow) {
        gl.visible = lv > 0;
        if (lv) { gl.material = this.sparkGlow[lv]; const gs = (lv === 2 ? 1.6 : 1.15) * rr(.8, 1.2); gl.scale.set(gs, gs, 1); }
      }
      if ((k.surf === 'road' || k.surf === 'boost') && sp > 12) {
        s.smokeAcc += dt * 9;
        while (s.smokeAcc >= 1) {
          s.smokeAcc--;
          this._w(k, R() < .5 ? -1.1 : 1.1, .2, -1.3);
          const i = N.emit(this.wx, this.wy, this.wz, kvx * .3 + rr(-1, 1), rr(.6, 1.6), kvz * .3 + rr(-1, 1),
            pick(ROAD_DUST), rr(.4, .6), rr(1.4, 2), rr(.45, .7), SHAPE.puff, -.6, 2.5, .55);
          N.spin[i] = rr(-1, 1);
        }
      }
    } else {
      s.skid[0].has = s.skid[1].has = false;
      for (const gl of s.wglow) gl.visible = false;
    }

    // ---- off-road dust ----
    const dc = DUST[k.surf];
    if (dc && !k.airborne && sp > 7) {
      s.dustAcc += dt * (7 + sp * .4) * (k.drifting ? 1.5 : 1);
      while (s.dustAcc >= 1) {
        s.dustAcc--;
        this._w(k, (R() < .5 ? -1.1 : 1.1) + rr(-.2, .2), .25, -1.3);
        const x = this.wx, y = this.wy, z = this.wz;
        const i = N.emit(x, y, z, kvx * .25 + rr(-1.5, 1.5), rr(.8, 2.2), kvz * .25 + rr(-1.5, 1.5),
          pick(dc), rr(.5, .8), rr(1.6, 2.5), rr(.5, .8), SHAPE.puff, -.8, 2.2, .85);
        N.spin[i] = rr(-1, 1);
        const r = R();
        if (k.surf === 'leaves' && r < .5) {
          const j = N.emit(x, y + .2, z, kvx * .2 + rr(-2, 2), rr(3.5, 6), kvz * .2 + rr(-2, 2), pick(LEAF_COLS), rr(.4, .55), .35, rr(1, 1.4), SHAPE.leaf, 7, 1.4);
          N.spin[j] = rr(-8, 8); N.flut[j] = rr(5, 9);
        } else if (k.surf === 'mud' && r < .45) {
          N.emit(x, y + .2, z, kvx * .3 + rr(-2, 2), rr(3, 6), kvz * .3 + rr(-2, 2), pick(dc), rr(.25, .4), .2, rr(.5, .7), SHAPE.puff, 20, .3);
        } else if (k.surf === 'ice' && r < .5) {
          A.emit(x + rr(-.5, .5), y + rr(0, .6), z + rr(-.5, .5), rr(-1, 1), rr(.5, 2), rr(-1, 1), 0xdff4ff, rr(.2, .35), 0, rr(.3, .5), SHAPE.glow, 2, 1);
        } else if (k.surf === 'grass' && r < .25) {
          const j = N.emit(x, y + .1, z, kvx * .2 + rr(-2, 2), rr(3, 5), kvz * .2 + rr(-2, 2), 0x4fbf3a, .3, .2, rr(.6, .8), SHAPE.leaf, 12, 1);
          N.spin[j] = rr(-10, 10);
        }
      }
    } else s.dustAcc = 0;

    // ---- lucky clover ----
    if (k.starT > 0) {
      s.starAge += dt;
      const op = Math.min(1, s.starAge * 4, k.starT / .6);
      const pop = (.55 + .45 * Math.min(1, s.starAge * 5)) * (.94 + .06 * Math.sin(this.t * 14));
      s.shell.visible = true; s.shell.userData.op = op;
      s.shell.scale.set(1.6 * pop, 1.5 * pop, 2.0 * pop);
      for (let i = 0; i < 2; i++) {
        this.c.setHSL((this.t * .7 + R() * .3) % 1, 1, .6);
        A.emit(k.x + rr(-1.7, 1.7), k.y + rr(.3, 2.7), k.z + rr(-1.7, 1.7), kvx * .7, rr(1, 3), kvz * .7, this.c, rr(.35, .6), 0, rr(.35, .6), SHAPE.glow, -1, 1);
      }
    } else if (s.shell.visible || s.starAge) { s.shell.visible = false; s.starAge = 0; }

    // ---- dizzy star ring ----
    if (idx < RING_KARTS && k.spinT > 0) {
      this.ringUsed[idx] = 1;
      const sc = Math.min(1, k.spinT / .3), base = idx * STARS_PER;
      for (let j = 0; j < STARS_PER; j++) {
        const an = this.t * 5.5 + j * TAU / STARS_PER;
        this.ring.set(base + j, k.x + Math.cos(an) * .95, k.y + 2.85 + Math.sin(this.t * 8 + j * 2) * .12, k.z + Math.sin(an) * .95,
          j & 1 ? C.yellow : 0xfff07a, 1, .55 * sc, -this.t * 4 + j, 1, SHAPE.star);
      }
    }

    // ---- hard bumps (walls, hay bales) ----
    const drop = s.prevSpeed - k.speed;
    if (s.prevSpeed > 12 && drop > 6 && k.spinT <= 0) {
      if (k.isHuman) this._shake(k.player, Math.min(.55, drop * .028));
      this._w(k, 0, .8, 2.2);
      for (let i = 0; i < 6; i++) {
        const j = N.emit(this.wx, this.wy, this.wz, rr(-3, 3), rr(1, 3), rr(-3, 3), pick(ROAD_DUST), rr(.4, .6), rr(1.3, 1.8), rr(.35, .5), SHAPE.puff, -.5, 3, .9);
        N.spin[j] = rr(-2, 2);
      }
      for (let i = 0; i < 4; i++) {
        const j = N.emit(this.wx, this.wy + .5, this.wz, rr(-4, 4), rr(3, 6), rr(-4, 4), C.yellow, .5, .25, rr(.4, .6), SHAPE.star, 14, .5);
        N.spin[j] = rr(-8, 8);
      }
    }

    s.prevSpeed = k.speed;
    s.prevBoost = k.boostT;
  }

  _skid(sk, k, lx) {
    this._w(k, lx, 0, -1.12);
    const x = this.wx, z = this.wz;
    if (!sk.has) { sk.x = x; sk.z = z; sk.has = true; sk.c = false; return; }
    const dx = x - sk.x, dz = z - sk.z, d2 = dx * dx + dz * dz;
    if (d2 < .36) return;
    if (d2 > 36) { sk.x = x; sk.z = z; sk.c = false; return; }
    const d = Math.sqrt(d2), px = -dz / d * .24, pz = dx / d * .24;
    const ax0 = sk.c ? sk.x0 : sk.x - px, az0 = sk.c ? sk.z0 : sk.z - pz;
    const ax1 = sk.c ? sk.x1 : sk.x + px, az1 = sk.c ? sk.z1 : sk.z + pz;
    const bx0 = x - px, bz0 = z - pz, bx1 = x + px, bz1 = z + pz;
    const off = SKID_Y[k.surf] ?? .17;
    const ya = terrainH(sk.x, sk.z) + off, yb = terrainH(x, z) + off;
    const s = this.skidNext; this.skidNext = (s + 1) % SKID_N;
    const P = this.skidPos, o = s * 18;
    // A0 A1 B1 / A0 B1 B0  (edge 0 1 1 0 1 0)
    P[o] = ax0; P[o + 1] = ya; P[o + 2] = az0;
    P[o + 3] = ax1; P[o + 4] = ya; P[o + 5] = az1;
    P[o + 6] = bx1; P[o + 7] = yb; P[o + 8] = bz1;
    P[o + 9] = ax0; P[o + 10] = ya; P[o + 11] = az0;
    P[o + 12] = bx1; P[o + 13] = yb; P[o + 14] = bz1;
    P[o + 15] = bx0; P[o + 16] = yb; P[o + 17] = bz0;
    const B = this.skidBirth, t = this.t;
    for (let i = 0; i < 6; i++) B[s * 6 + i] = t;
    this.skidDirty = true;
    sk.x = x; sk.z = z; sk.x0 = bx0; sk.z0 = bz0; sk.x1 = bx1; sk.z1 = bz1; sk.c = true;
  }

  // ------------------------------------------------------------ fireworks
  _fireworks(dt) {
    const A = this.add;
    for (const f of this.fw) {
      if (!f.on) continue;
      if (f.delay > 0) { f.delay -= dt; continue; }
      if (f.rise > 0) {
        f.rise -= dt; f.vy -= 8 * dt; f.y += f.vy * dt;
        A.emit(f.x + rr(-.1, .1), f.y, f.z + rr(-.1, .1), rr(-.5, .5), -2, rr(-.5, .5), 0xffd27a, .5, 0, rr(.25, .4), SHAPE.glow, 3, 1);
        continue;
      }
      f.on = false;
      A.emit(f.x, f.y, f.z, 0, 0, 0, 0xffffff, 9, 0, .25, SHAPE.glow);
      const n = 90;
      for (let i = 0; i < n; i++) {
        const u = rr(-1, 1), th = R() * TAU, q = Math.sqrt(1 - u * u), v = rr(10, 13) * (i < 60 ? 1 : .55);
        A.emit(f.x, f.y, f.z, Math.cos(th) * q * v, u * v, Math.sin(th) * q * v,
          i < 60 ? f.col : (i & 1 ? f.col2 : 0xffffff), rr(.8, 1.1), .1, rr(1.1, 1.6), SHAPE.glow, 4.5, 1.5);
      }
    }
  }

  // ----------------------------------------------------------- rendering
  beforeRender(cam) {
    const sc = this.game.particles?.points.material.uniforms.scale.value ?? 400;
    this.norm.scale = sc; this.add.scale = sc; this.ring.scale = sc;
    if (this.weather) this.weather.material.uniforms.scale.value = sc;
  }

  drawHUD(ctx, view, kart) {
    if (!kart) return;
    const p = kart.player;
    const boost = kart.boostT > 0;
    const sf = boost ? 1 : Math.max(0, Math.min(1, (kart.speed - 36) / 12)) * .55;
    const fl = p >= 0 && p < 4 ? this.flash[p] : 0;
    const clover = kart.starT > 0;
    if (sf < .03 && fl <= 0 && !clover) return;
    const { x, y, w, h } = view;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const cx = x + w / 2, cy = y + h * .47, Rr = Math.hypot(w, h) * .5;

    if (sf >= .03) {
      const n = (10 + 22 * sf) | 0;
      ctx.fillStyle = boost ? `rgba(255,236,190,${.28 + .2 * sf})` : `rgba(255,255,255,${.3 * sf})`;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const an = R() * TAU, c = Math.cos(an), s = Math.sin(an);
        const r0 = Rr * rr(.52, .78), r1 = r0 + Rr * rr(.18, .42) * (.5 + .5 * sf);
        const wd = rr(1.2, 3.5) * (boost ? 1.4 : 1) * Math.max(1, Math.min(w, h) / 500);
        ctx.moveTo(cx + c * r0, cy + s * r0);
        ctx.lineTo(cx + c * r1 - s * wd, cy + s * r1 + c * wd);
        ctx.lineTo(cx + c * r1 + s * wd, cy + s * r1 - c * wd);
        ctx.closePath();
      }
      ctx.fill();
    }

    if (clover) {
      const fade = Math.min(1, kart.starT / .6);
      const lw = Math.max(5, Math.min(w, h) * .016);
      let grad;
      if (ctx.createConicGradient) {
        grad = ctx.createConicGradient(this.t * 2.2, cx, cy);
        for (let i = 0; i <= 6; i++) grad.addColorStop(i / 6, `hsl(${i * 60},100%,60%)`);
      } else grad = `hsl(${(this.t * 120) % 360},100%,60%)`;
      ctx.strokeStyle = grad;
      ctx.lineWidth = lw;
      const alphas = [.26, .12, .05, .02];
      for (let i = 0; i < 4; i++) {
        ctx.globalAlpha = alphas[i] * fade;
        const inset = lw * (i + .5);
        ctx.strokeRect(x + inset, y + inset, w - inset * 2, h - inset * 2);
      }
      ctx.globalAlpha = 1;
    }

    if (fl > 0) {
      const a = Math.min(1, fl * 1.6);
      const grd = ctx.createRadialGradient(cx, y + h / 2, Rr * .35, cx, y + h / 2, Rr);
      grd.addColorStop(0, `rgba(${this.flashCol[p]},0)`);
      grd.addColorStop(1, `rgba(${this.flashCol[p]},${.65 * a})`);
      ctx.fillStyle = grd;
      ctx.fillRect(x, y, w, h);
      if (fl > .38) { ctx.fillStyle = `rgba(255,255,255,${(fl - .38) * 2.2})`; ctx.fillRect(x, y, w, h); }
    }
    ctx.restore();
  }

  shakeOffset(player) {
    const a = this.shake[player];
    if (!(a > .01)) return null;
    const t = performance.now() * .001;
    return this.v.set(
      (Math.sin(t * 53.1 + player) * .7 + Math.sin(t * 31.7) * .3) * a * .7,
      (Math.sin(t * 47.3 + 1.7) * .7 + Math.sin(t * 23.9) * .3) * a * .55,
      (Math.cos(t * 59.9 + player * 2) * .7 + Math.cos(t * 27.1) * .3) * a * .7);
  }

  // ------------------------------------------------------------- events
  _boostKick(k, s, level) {
    s.lvl = level; s.kick = 1; s.lastKick = this.t;
    const A = this.add, N = this.norm, cols = FLAME_COLS[level];
    const a = k.model.root.rotation.y, mfx = Math.sin(a), mfz = Math.cos(a), rx = -Math.cos(a), rz = Math.sin(a);
    const kvx = Math.sin(k.heading) * k.speed, kvz = Math.cos(k.heading) * k.speed;
    const n = level === 2 ? 26 : level === 1 ? 18 : 14;
    for (let i = 0; i < n; i++) {
      this._w(k, i & 1 ? .36 : -.36, .92, -2.2);
      const an = R() * TAU, ca = Math.cos(an) * rr(3, 6), sa = Math.sin(an) * rr(3, 6), back = rr(6, 14);
      A.emit(this.wx, this.wy, this.wz, kvx * .5 - mfx * back + rx * ca, sa + 1, kvz * .5 - mfz * back + rz * ca,
        cols[(R() * 3) | 0], rr(.4, .7) * (level === 2 ? 1.3 : 1), 0, rr(.25, .45), SHAPE.glow, 2, 2.5);
    }
    this._w(k, 0, .9, -2.4);
    A.emit(this.wx, this.wy, this.wz, kvx * .6, 0, kvz * .6, cols[2], level === 2 ? 4.5 : 3.2, 0, .22, SHAPE.glow);
    for (let i = 0; i < (level === 2 ? 8 : 5); i++) {
      const j = N.emit(this.wx + rx * rr(-1, 1), this.wy - .3, this.wz + rz * rr(-1, 1), kvx * .2 - mfx * rr(2, 5) + rx * rr(-3, 3), rr(.5, 2), kvz * .2 - mfz * rr(2, 5) + rz * rr(-3, 3),
        0xffffff, rr(.5, .8), rr(1.8, 2.6), rr(.4, .6), SHAPE.puff, -.5, 3, .7);
      N.spin[j] = rr(-2, 2);
    }
    if (k.isHuman && level === 2) this._shake(k.player, .12);
  }

  onBoost(kart, level = 0) {
    const s = this._st(kart);
    if (level < s.lvl && kart.boostT > 0 && s.prevBoost > 0) level = s.lvl; // keep the stronger look running
    this._boostKick(kart, s, level);
  }

  onHit(kart, kind) {
    const N = this.norm, A = this.add, x = kart.x, y = kart.y + 1.4, z = kart.z;
    for (let i = 0; i < 9; i++) {
      const an = i / 9 * TAU + rr(-.2, .2), v = rr(5, 8);
      const j = N.emit(x, y + .6, z, Math.cos(an) * v, rr(4, 8), Math.sin(an) * v, i & 1 ? C.yellow : 0xfff07a, .8, .35, rr(.6, .9), SHAPE.star, 14, .8);
      N.spin[j] = rr(-8, 8);
    }
    A.emit(x, y, z, 0, 0, 0, 0xfff2b0, 5, 0, .2, SHAPE.glow);
    this._splat(x, y, z, kind, 1);
    if (kart.isHuman) {
      const p = kart.player;
      this._shake(p, .6);
      if (p >= 0 && p < 4) {
        this.flash[p] = .5;
        this.flashCol[p] = kind === 'egg' ? '255,214,70' : kind === 'mud' ? '110,68,30' : kind === 'bee' ? '255,190,20' : '255,60,48';
      }
    }
  }

  _splat(x, y, z, kind, m) {
    const N = this.norm, A = this.add;
    const blob = (col, n, sz) => {
      for (let i = 0; i < n * m; i++) {
        const an = R() * TAU, v = rr(4, 9);
        const j = N.emit(x, y, z, Math.cos(an) * v, rr(3, 8), Math.sin(an) * v, col, sz * rr(.8, 1.2), sz * .5, rr(.55, .85), SHAPE.puff, 16, .6);
        N.spin[j] = rr(-3, 3);
      }
    };
    if (kind === 'egg') { blob(0xfff8ec, 12, .8); blob(0xffc21a, 9, .65); }
    else if (kind === 'mud') { blob(0x6b4423, 10, .8); blob(0x8a5a2e, 8, .6); blob(0x4a2e14, 6, .5); }
    else if (kind === 'bee') {
      blob(C.yellow, 6, .55); blob(C.ink, 5, .4);
      for (let i = 0; i < 12 * m; i++) A.emit(x, y, z, rr(-6, 6), rr(1, 6), rr(-6, 6), 0xffe066, rr(.3, .5), 0, rr(.3, .5), SHAPE.glow, 6, 1.5);
    } else { // cow / other bump
      blob(0xffffff, 8, .7); blob(C.ink, 5, .45); blob(0xb8c97a, 5, .7);
    }
  }

  // Projectile pops on the track (eggs smashing, bees fizzling).
  onSplat(x, y, z, kind) { this._splat(x, y + 1, z, kind, .7); }

  onItemBox(x, y, z) {
    const N = this.norm, A = this.add;
    for (let i = 0; i < 30; i++) {
      const u = rr(-.2, 1), th = R() * TAU, q = Math.sqrt(1 - u * u), v = rr(5, 11);
      this.c.setHSL(i / 30, 1, .55);
      const j = N.emit(x, y, z, Math.cos(th) * q * v, u * v + 3, Math.sin(th) * q * v, this.c, rr(.45, .75), .25, rr(.7, 1.1), R() < .6 ? SHAPE.shard : SHAPE.square, 16, .6);
      N.spin[j] = rr(-12, 12);
      if (R() < .4) N.flut[j] = rr(8, 14);
    }
    A.emit(x, y, z, 0, 0, 0, 0xffffff, 5.5, 0, .22, SHAPE.glow);
    for (let i = 0; i < 14; i++) {
      this.c.setHSL(R(), 1, .65);
      A.emit(x, y, z, rr(-7, 7), rr(-2, 7), rr(-7, 7), this.c, rr(.4, .7), 0, rr(.4, .7), SHAPE.glow, 3, 2.5);
    }
  }

  onFinish(kart) {
    const N = this.norm, x = kart.x, y = kart.y, z = kart.z;
    // the kart keeps driving after the line: keep showering confetti around it for a while
    this._conf = { k: kart, t: 2.5, acc: 0 };
    const confetti = (px, py, pz, vx, vy, vz) => {
      const j = N.emit(px, py, pz, vx, vy, vz, pick(PARTY), rr(.32, .42), .3, rr(3.5, 5), SHAPE.square, 9, 2.8);
      N.spin[j] = rr(-6, 6); N.flut[j] = rr(5, 12);
    };
    for (let i = 0; i < 170; i++) confetti(x + rr(-8, 8), y + rr(6, 12), z + rr(-8, 8), rr(-1, 1), rr(-1, 0), rr(-1, 1));
    for (let i = 0; i < 80; i++) { const an = R() * TAU, v = rr(2, 6); confetti(x, y + 1.6, z, Math.cos(an) * v, rr(10, 17), Math.sin(an) * v); }
    let n = 0;
    for (const f of this.fw) {
      if (f.on) continue;
      const an = R() * TAU, r = rr(14, 26);
      f.on = true; f.delay = .25 + n * .5 + rr(0, .3); f.rise = rr(.75, 1);
      f.x = x + Math.cos(an) * r; f.z = z + Math.sin(an) * r; f.y = y + 2; f.vy = rr(18, 23);
      f.col = pick(PARTY); f.col2 = pick(PARTY);
      if (++n >= 7) break;
    }
  }

  onLand(kart) {
    const v = kart.landVy || 0;
    const N = this.norm, n = v > 9 ? 14 : 8;
    const cols = DUST[kart.surf] || ROAD_DUST;
    const kvx = Math.sin(kart.heading) * kart.speed, kvz = Math.cos(kart.heading) * kart.speed;
    for (let i = 0; i < n; i++) {
      const an = i / n * TAU + rr(-.2, .2), c = Math.cos(an), s = Math.sin(an), sp = rr(2, 4) * (v > 9 ? 1.4 : 1);
      const j = N.emit(kart.x + c * 1.3, kart.y + .25, kart.z + s * 1.3, c * sp + kvx * .4, rr(.3, 1), s * sp + kvz * .4,
        pick(cols), rr(.45, .6), rr(1.3, 1.9) * (v > 9 ? 1.3 : 1), rr(.4, .55), SHAPE.puff, -.5, 3.5, .8);
      N.spin[j] = rr(-2, 2);
    }
    if (v > 11 && kart.isHuman) this._shake(kart.player, .15 + .3 * Math.min(1, (v - 11) / 10));
  }

  onDriftLevel(kart, level) {
    const A = this.add;
    const kvx = Math.sin(kart.heading) * kart.speed, kvz = Math.cos(kart.heading) * kart.speed;
    for (let w = 0; w < 2; w++) {
      this._w(kart, w ? 1.12 : -1.12, .2, -1.15);
      A.emit(this.wx, this.wy, this.wz, kvx * .8, 0, kvz * .8, SPARK[level], level === 2 ? 3.4 : 2.6, 0, .2, SHAPE.glow);
      for (let i = 0; i < 12; i++) {
        A.emit(this.wx, this.wy, this.wz, kvx * .6 + rr(-6, 6), rr(2, 8), kvz * .6 + rr(-6, 6), i & 1 ? SPARK[level] : 0xffffff, rr(.25, .4), 0, rr(.3, .5), SHAPE.glow, 14, 1);
      }
    }
  }
}
