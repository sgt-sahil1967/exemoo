// Rapids Row sky: procedural dome (gradient + sun + noise clouds), cumulus sprites, mountain rings,
// lights, fog and a PMREM environment. One dome draw + 2 mountain draws + a few sprites.
import * as THREE from 'three';

export const PRESETS = {
  day: {
    top: '#1f78e8', mid: '#5fb4ff', horizon: '#cfeaff', ground: '#8fb98a',
    sunCol: '#fff3cf', sunAz: 0.55, sunEl: 0.95, sunInt: 3.0, sunLight: '#fff0d2',
    hemiSky: '#bfe0ff', hemiGround: '#6ea05a', hemiInt: 1.1,
    fogNear: 150, fogFar: 720, cover: 0.46, cloudLit: '#ffffff', cloudShade: '#a9c4e6', cloudSprites: 9,
    mtnFar: '#8fb0d8', mtnNear: '#6f9bb8', mtnH: 1.0, exposure: 0.95,
  },
  sunset: {
    top: '#3b3a8c', mid: '#d6628a', horizon: '#ffb36b', ground: '#7a5a52',
    sunCol: '#ffd9a0', sunAz: 0.5, sunEl: 0.16, sunInt: 3.4, sunLight: '#ffb070',
    hemiSky: '#ffa98a', hemiGround: '#5a4a52', hemiInt: 0.9,
    fogNear: 140, fogFar: 650, cover: 0.5, cloudLit: '#ffd0a0', cloudShade: '#7a4a7e', cloudSprites: 8,
    mtnFar: '#a0587a', mtnNear: '#5c3a5e', mtnH: 1.3, exposure: 1.0,
  },
  jungle: {
    top: '#2f9a96', mid: '#78cdb0', horizon: '#d6ecb8', ground: '#4f7d48',
    sunCol: '#fff0b0', sunAz: -0.6, sunEl: 0.62, sunInt: 2.6, sunLight: '#ffe8a8',
    hemiSky: '#a8e0c8', hemiGround: '#3f7a40', hemiInt: 1.15,
    fogNear: 110, fogFar: 560, cover: 0.58, cloudLit: '#f4ffe0', cloudShade: '#8fbf9f', cloudSprites: 7,
    mtnFar: '#7fb59a', mtnNear: '#3f7d5e', mtnH: 1.6, exposure: 0.95,
  },
};

const NOISE = /* glsl */`
float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float a=0.5, s=0.0; for(int i=0;i<5;i++){ s+=a*vnoise(p); p=p*2.03+vec2(11.7,3.1); a*=0.5; } return s; }
`;

function makeCloudTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  let seed = 7; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // flat-ish bottom, puffy top: stylised cumulus from soft discs
  const puff = (x, y, rad, col) => {
    const gr = g.createRadialGradient(x, y, rad * 0.35, x, y, rad);
    gr.addColorStop(0, col); gr.addColorStop(0.7, col); gr.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill();
  };
  for (let i = 0; i < 9; i++) { const x = 40 + i * 22 + r() * 8; const h = Math.sin((i / 8) * Math.PI); puff(x, 84 - h * 14 - r() * 6, 22 + h * 14 + r() * 6, 'rgba(255,255,255,1)'); }
  // underside shade
  g.globalCompositeOperation = 'source-atop';
  const sh = g.createLinearGradient(0, 40, 0, 110); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(150,165,205,0.35)');
  g.fillStyle = sh; g.fillRect(0, 0, 256, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function mountainGeometry(seed, base, amp, segs, floor) {
  const pos = [], uv = [], idx = [];
  let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const ph = [rnd() * 6, rnd() * 6, rnd() * 6, rnd() * 6];
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    // sines with integer frequencies keep the ring seamless
    let h = Math.sin(a * 3 + ph[0]) * 0.5 + Math.sin(a * 7 + ph[1]) * 0.3 + Math.sin(a * 13 + ph[2]) * 0.18 + Math.sin(a * 29 + ph[3]) * 0.08;
    h = Math.max(0, h * 0.5 + 0.55);
    const top = base + amp * h * h * 1.6;
    const x = Math.cos(a), z = Math.sin(a);
    pos.push(x, floor, z, x, top, z); uv.push(i / segs, 0, i / segs, 1);
    if (i < segs) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); return g;
}

export function makeSky(scene, preset = 'day', renderer = null) {
  const sunDir = new THREE.Vector3();
  const horizonColor = new THREE.Color();
  const fogColor = horizonColor; // same object: fog tracks horizon
  const C = (h) => new THREE.Color(h);

  // ---- dome ----
  const domeMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
    uniforms: {
      uTop: { value: new THREE.Color() }, uMid: { value: new THREE.Color() }, uHor: { value: horizonColor },
      uGround: { value: new THREE.Color() }, uSun: { value: sunDir }, uSunCol: { value: new THREE.Color() },
      uCloudLit: { value: new THREE.Color() }, uCloudShade: { value: new THREE.Color() },
      uCover: { value: 0.5 }, uTime: { value: 0 }, uCam: { value: new THREE.Vector2() },
    },
    vertexShader: `varying vec3 vDir;
      void main(){ vDir = position; vec4 p = projectionMatrix * mat4(mat3(viewMatrix)) * vec4(position, 1.0);
        gl_Position = p.xyww; }`,
    fragmentShader: `uniform vec3 uTop,uMid,uHor,uGround,uSun,uSunCol,uCloudLit,uCloudShade; uniform float uCover,uTime; uniform vec2 uCam;
      varying vec3 vDir;
      ${NOISE}
      void main(){
        vec3 d = normalize(vDir);
        float h = d.y;
        float up = max(h, 0.0);
        vec3 col = mix(uHor, uMid, smoothstep(0.0, 0.32, pow(up, 0.7)));
        col = mix(col, uTop, smoothstep(0.25, 0.95, up));
        // below horizon: blend to ground tint (only visible in PMREM / camera tilt down)
        col = mix(col, mix(uHor, uGround, smoothstep(0.0, 0.5, -h)), smoothstep(0.0, -0.02, h));
        float s = max(dot(d, uSun), 0.0);
        // sky brightening toward sun
        col += uSunCol * (pow(s, 6.0) * 0.18 + pow(s, 40.0) * 0.35);
        // clouds: projected onto a plane overhead
        if (h > 0.0) {
          vec2 p = d.xz / (h + 0.12);
          p = p * 0.55 + vec2(uTime * 0.012, uTime * 0.004);
          float f = fbm(p * 1.3);
          float cov = 1.0 - uCover;
          float dens = smoothstep(cov, cov + 0.12, f);
          // light: sample toward sun, thinner => brighter edges
          vec2 sl = normalize(uSun.xz + 1e-4) * 0.12;
          float f2 = fbm((p + sl) * 1.3);
          float lit = clamp(0.62 + (f - f2) * 5.0, 0.0, 1.0);
          vec3 cc = mix(uCloudShade, uCloudLit, lit);
          cc += uSunCol * pow(s, 8.0) * 0.25 * (1.0 - dens * 0.3);
          float fade = smoothstep(0.0, 0.16, h);
          col = mix(col, cc, dens * fade * 0.95);
        }
        // sun disc + glow
        float disc = smoothstep(0.9988, 0.9994, s);
        col += uSunCol * pow(s, 400.0) * 1.2;
        col = mix(col, vec3(1.0, 0.98, 0.9) * 3.0, disc);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), domeMat);
  dome.frustumCulled = false; dome.renderOrder = -1000;
  dome.onBeforeRender = (r) => { if (envDirty) buildEnv(r); };

  // ---- mountains (two rings) ----
  const mkMtn = (seed, radius, base, amp, order) => {
    const m = new THREE.ShaderMaterial({
      side: THREE.DoubleSide, fog: false, depthWrite: false,
      uniforms: { uCol: { value: new THREE.Color() }, uHor: { value: horizonColor }, uFog: { value: 0.3 } },
      vertexShader: `varying float vY; void main(){ vY = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uCol,uHor; uniform float uFog; varying float vY;
        void main(){ vec3 c = mix(uHor, uCol, smoothstep(0.0, 0.85, vY)); c = mix(c, uHor, uFog);
          gl_FragColor = vec4(c,1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment> }`,
    });
    const mesh = new THREE.Mesh(mountainGeometry(seed, base, amp, 192, -40), m);
    mesh.scale.set(radius, 1, radius); mesh.frustumCulled = false; mesh.renderOrder = order;
    mesh.userData.baseScale = 1; return mesh;
  };
  const mtnFar = mkMtn(11, 1050, 25, 150, -999);
  const mtnNear = mkMtn(23, 900, 8, 70, -998);

  // ---- cumulus sprites ----
  const cloudTex = makeCloudTexture();
  const sprites = new THREE.Group();
  const spriteList = [];
  {
    let s = 99; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 10; i++) {
      const mat = new THREE.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, fog: false, opacity: 0.95 });
      const sp = new THREE.Sprite(mat);
      const a = (i / 10) * Math.PI * 2 + rnd() * 0.5, d = 650 + rnd() * 250;
      const w = 220 + rnd() * 200;
      sp.scale.set(w, w * 0.5, 1);
      sp.position.set(Math.cos(a) * d, 170 + rnd() * 160, Math.sin(a) * d);
      sp.userData = { a, d, y: sp.position.y, sp: 0.002 + rnd() * 0.003 };
      sp.renderOrder = -990; sprites.add(sp); spriteList.push(sp);
    }
  }

  // ---- lights ----
  const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.castShadow = false;
  const root = new THREE.Group(); root.add(dome, mtnFar, mtnNear, sprites);
  scene.add(root, hemi, sun, sun.target);

  // ---- environment ----
  let pmrem = null, envRT = null, envDirty = true, rendererRef = renderer;
  const envScene = new THREE.Scene();
  const envDome = new THREE.Mesh(dome.geometry, domeMat); envDome.frustumCulled = false; envScene.add(envDome);
  function buildEnv(r) {
    envDirty = false;
    if (!pmrem) pmrem = new THREE.PMREMGenerator(r);
    const old = envRT;
    domeMat.uniforms.uCover.value; // clouds included in env (cheap, static)
    envRT = pmrem.fromScene(envScene, 0, 0.1, 10);
    scene.environment = envRT.texture;
    if (old) old.dispose();
  }

  let cur = null;
  function setPreset(name) {
    const p = PRESETS[name] || PRESETS.day; cur = p; api.preset = PRESETS[name] ? name : 'day';
    const u = domeMat.uniforms;
    u.uTop.value.set(p.top); u.uMid.value.set(p.mid); u.uGround.value.set(p.ground); u.uSunCol.value.set(p.sunCol);
    u.uCloudLit.value.set(p.cloudLit); u.uCloudShade.value.set(p.cloudShade); u.uCover.value = p.cover;
    horizonColor.set(p.horizon);
    sunDir.set(Math.sin(p.sunAz) * Math.cos(p.sunEl) * -1, Math.sin(p.sunEl), -Math.cos(p.sunAz) * Math.cos(p.sunEl)).normalize();
    hemi.color.set(p.hemiSky); hemi.groundColor.set(p.hemiGround); hemi.intensity = p.hemiInt;
    sun.color.set(p.sunLight); sun.intensity = p.sunInt;
    mtnFar.material.uniforms.uCol.value.set(p.mtnFar); mtnFar.material.uniforms.uFog.value = 0.35;
    mtnNear.material.uniforms.uCol.value.set(p.mtnNear); mtnNear.material.uniforms.uFog.value = 0.12;
    mtnFar.scale.y = mtnNear.scale.y = p.mtnH;
    spriteList.forEach((sp, i) => {
      sp.visible = i < p.cloudSprites;
      sp.material.color.set(p.cloudLit).lerp(C('#ffffff'), 0.4);
    });
    if (!scene.fog) scene.fog = new THREE.Fog(horizonColor, p.fogNear, p.fogFar);
    scene.fog.color = horizonColor; scene.fog.near = p.fogNear; scene.fog.far = p.fogFar;
    scene.background = null;
    api.exposure = p.exposure;
    envDirty = true;
  }

  const tmp = new THREE.Vector3();
  function update(t, camera) {
    domeMat.uniforms.uTime.value = t;
    if (!camera) return;
    camera.getWorldPosition(tmp);
    root.position.set(tmp.x, 0, tmp.z);
    dome.position.set(0, tmp.y, 0); dome.scale.setScalar(1);
    mtnFar.position.y = mtnNear.position.y = -tmp.y * 0.0; // rings stay at world height (ground-level horizon)
    sprites.position.y = 0;
    for (const sp of spriteList) {
      const u = sp.userData, a = u.a + t * u.sp;
      sp.position.set(Math.cos(a) * u.d, u.y, Math.sin(a) * u.d);
    }
    // sun light follows the camera look target region (shadow-friendly)
    const fx = -Math.sin(camera.rotation.y), fz = -Math.cos(camera.rotation.y);
    const cx = tmp.x + fx * 20, cz = tmp.z + fz * 20;
    sun.target.position.set(cx, 0, cz);
    sun.position.set(cx + sunDir.x * 120, sunDir.y * 120, cz + sunDir.z * 120);
    sun.target.updateMatrixWorld();
    if (envDirty && rendererRef) buildEnv(rendererRef);
  }

  const api = { update, setPreset, preset, sunDir, horizonColor, fogColor, sun, hemi, dome, exposure: 1, presets: Object.keys(PRESETS) };
  // the dome radius must stay inside the camera far plane; 1 unit with depth forced to far (xyww) is clip-safe.
  setPreset(preset);
  return api;
}
