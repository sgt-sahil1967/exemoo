// Rapids Row - stylised river water ribbon following track.sample().
// Procedural normal-mapped ripples, fresnel sky reflection, sun glints, depth gradient,
// soft foam (banks, rapids, around obstacles) and flow streaks. Fog aware.
import * as THREE from 'three';

const EXT = 40;      // metres of water before start / after finish
const STEP = 2;      // metres between stations
const COLS = 16;     // vertices across
const PAD = 3;       // metres beyond halfWidth
const MAX_OBS = 16;  // obstacles that get foam rings / wakes (nearest to camera)

export function createWater(track) {
  const L = track.length;
  const stations = [];
  for (let s = -EXT; s < L + EXT + 1e-6; s += STEP) stations.push(s);
  if (stations[stations.length - 1] < L + EXT) stations.push(L + EXT);

  const p0 = track.sample(0), p1 = track.sample(L);
  const at = (s) => {
    if (s < 0) return { x: p0.x + p0.tx * s, z: p0.z + p0.tz * s, tx: p0.tx, tz: p0.tz, halfWidth: p0.halfWidth, current: p0.current };
    if (s > L) return { x: p1.x + p1.tx * (s - L), z: p1.z + p1.tz * (s - L), tx: p1.tx, tz: p1.tz, halfWidth: p1.halfWidth, current: p1.current };
    return track.sample(s);
  };

  const n = stations.length, vc = n * (COLS + 1);
  const pos = new Float32Array(vc * 3), lat = new Float32Array(vc), sAlong = new Float32Array(vc), cur = new Float32Array(vc), hw = new Float32Array(vc), tan = new Float32Array(vc * 2);
  let v = 0;
  for (const s of stations) {
    const q = at(s), W = q.halfWidth + PAD, rx = -q.tz, rz = q.tx;
    for (let j = 0; j <= COLS; j++, v++) {
      const l = -W + (2 * W * j) / COLS;
      pos[v * 3] = q.x + rx * l; pos[v * 3 + 1] = 0; pos[v * 3 + 2] = q.z + rz * l;
      lat[v] = l; sAlong[v] = s; cur[v] = q.current; hw[v] = q.halfWidth;
      tan[v * 2] = q.tx; tan[v * 2 + 1] = q.tz;
    }
  }
  const idx = new Uint32Array((n - 1) * COLS * 6);
  let k = 0;
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < COLS; j++) {
    const a = i * (COLS + 1) + j, b = a + 1, c = a + COLS + 1, d = c + 1;
    idx[k++] = a; idx[k++] = c; idx[k++] = b; idx[k++] = b; idx[k++] = c; idx[k++] = d;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aLat', new THREE.BufferAttribute(lat, 1));
  geo.setAttribute('aS', new THREE.BufferAttribute(sAlong, 1));
  geo.setAttribute('aCur', new THREE.BufferAttribute(cur, 1));
  geo.setAttribute('aHW', new THREE.BufferAttribute(hw, 1));
  geo.setAttribute('aTan', new THREE.BufferAttribute(tan, 2));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.computeBoundingSphere();
  geo.boundingSphere.radius += 5;

  const obsArr = Array.from({ length: MAX_OBS }, () => new THREE.Vector4(0, 0, 0, 0));
  const sunDir = new THREE.Vector3(-0.35, 0.5, -0.8).normalize();

  const mat = new THREE.ShaderMaterial({
    fog: true,
    side: THREE.DoubleSide,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uTime: { value: 0 },
      uWater: { value: new THREE.Color('#2bb5e8') },
      uDeep: { value: new THREE.Color('#1679b8') },
      uShallow: { value: new THREE.Color('#62e0d8') },
      uFoam: { value: new THREE.Color('#ffffff') },
      uSkyTop: { value: new THREE.Color('#2f8cff') },
      uSkyMid: { value: new THREE.Color('#7cc8ff') },
      uSkyHor: { value: new THREE.Color('#dff3ff') },
      uSunCol: { value: new THREE.Color('#fff6c0') },
      uSunDir: { value: sunDir },
      uObs: { value: obsArr },
    }]),
    vertexShader: /* glsl */`
      attribute float aLat; attribute float aS; attribute float aCur; attribute float aHW; attribute vec2 aTan;
      uniform float uTime;
      varying float vLat; varying float vS; varying float vCur; varying float vK; varying float vHW; varying vec2 vTan; varying vec3 vWorld;
      #include <fog_pars_vertex>
      void main(){
        vLat = aLat; vS = aS; vCur = aCur; vHW = aHW; vTan = aTan;
        float k = clamp((aCur - 1.5) / 3.5, 0.0, 1.0);
        vK = k;
        float amp = 0.02 + 0.11 * k;
        float edge = 1.0 - smoothstep(aHW - 3.0, aHW + 1.0, abs(aLat));
        float w = sin(aS * 0.55 - uTime * (1.4 + 1.2 * k) + aLat * 0.35) * 0.5
                + sin(aLat * 0.9 + uTime * 1.3 + aS * 0.21) * 0.5;
        vec3 p = position;
        p.y += w * amp * edge;
        vec4 wp = modelMatrix * vec4(p, 1.0);
        vWorld = wp.xyz;
        vec4 mvPosition = viewMatrix * wp;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */`
      uniform float uTime; uniform vec3 uWater; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uFoam;
      uniform vec3 uSkyTop; uniform vec3 uSkyMid; uniform vec3 uSkyHor; uniform vec3 uSunCol; uniform vec3 uSunDir;
      uniform vec4 uObs[${MAX_OBS}];
      varying float vLat; varying float vS; varying float vCur; varying float vK; varying float vHW; varying vec2 vTan; varying vec3 vWorld;
      #include <fog_pars_fragment>
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vnoise(vec2 p){
        vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      // ripple height gradient (analytic sine waves + noise octaves); uv = (lateral, along-river)
      vec2 ripples(vec2 uv, float t, float k){
        vec2 g = vec2(0.0);
        vec2 d1 = vec2(0.80, 0.60), d2 = vec2(-0.55, 0.83), d3 = vec2(0.30, -0.95), d4 = vec2(-0.90, -0.43);
        g += d1 * cos(dot(d1, uv) * 2.3 - t * 1.7) * 0.9;
        g += d2 * cos(dot(d2, uv) * 3.7 - t * 2.3 + 1.3) * 0.7;
        g += d3 * cos(dot(d3, uv) * 5.9 - t * 3.1 + 2.1) * 0.5;
        g += d4 * cos(dot(d4, uv) * 8.3 - t * 3.7 + 4.0) * 0.35;
        // noise octaves via finite differences
        float e = 0.07;
        vec2 q1 = uv * 1.9 + vec2(0.0, -t * 0.4);
        float h1 = vnoise(q1);
        g += vec2(vnoise(q1 + vec2(e, 0.0)) - h1, vnoise(q1 + vec2(0.0, e)) - h1) / e * 0.9;
        vec2 q2 = uv * 4.7 + vec2(t * 0.3, -t * 0.7);
        float h2 = vnoise(q2);
        g += vec2(vnoise(q2 + vec2(e, 0.0)) - h2, vnoise(q2 + vec2(0.0, e)) - h2) / e * 0.35;
        return g * (0.045 + 0.075 * k);
      }
      void main(){
        float k = vK, sp = vCur, aL = abs(vLat);
        float e = vHW - aL;                       // metres inside the bank (negative = under the bank)
        vec2 tn = normalize(vTan);
        vec2 rt = vec2(-tn.y, tn.x);              // river "right" in world xz (matches lateral axis)
        float flow = vS - uTime * sp;
        vec2 uv = vec2(vLat, flow);

        // --- normal from ripples (river space -> world)
        vec2 g = ripples(uv, uTime, k);
        vec3 N = normalize(vec3(rt.x * -g.x + tn.x * -g.y, 1.0, rt.y * -g.x + tn.y * -g.y));
        vec3 V = normalize(cameraPosition - vWorld);
        vec3 L = normalize(uSunDir);

        // --- depth gradient: shallow turquoise at the banks, deep blue mid-river, slow dark patches
        float pat = vnoise(vec2(vLat * 0.08, (vS - uTime * sp * 0.3) * 0.05));
        float depth = clamp(smoothstep(1.0, max(vHW * 0.9, 5.0), e) * 0.55 + pat * 0.45, 0.0, 1.0);
        vec3 col = mix(uWater, uDeep, depth);
        col = mix(col, uShallow, (1.0 - smoothstep(0.0, 5.5, e)) * 0.8 * (1.0 - 0.6 * k));
        // soft lambert-ish shading from ripple normal
        col *= 0.88 + 0.28 * clamp(dot(N, L), 0.0, 1.0);

        // --- fresnel sky reflection
        vec3 R = reflect(-V, N);
        float ry = max(R.y, 0.0);
        vec3 sky = mix(uSkyHor, uSkyMid, smoothstep(0.0, 0.25, ry));
        sky = mix(sky, uSkyTop, smoothstep(0.2, 0.9, ry));
        float fres = 0.04 + 0.96 * pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 4.0);
        sky = mix(sky, uWater * 1.15, 0.35);
        col = mix(col, sky, clamp(fres * 0.6 + 0.03, 0.0, 0.5));

        // --- sun glints
        float sd = max(dot(R, L), 0.0);
        float glint = pow(sd, 420.0) * 3.0 + pow(sd, 60.0) * 0.1;
        col += uSunCol * glint * (1.0 - 0.7 * k);

        // --- flow streaks (soft lighter lines scrolling downstream)
        float n1 = vnoise(vec2(vLat * 0.85, flow * 0.14));
        float n2 = vnoise(vec2(vLat * 1.3 + 7.0, (vS - uTime * sp * 1.3) * 0.2 + 3.0));
        float streak = smoothstep(0.6 - 0.1 * k, 0.78, n1) * 0.5 + smoothstep(0.66 - 0.1 * k, 0.82, n2) * 0.4;
        col = mix(col, mix(uWater, uFoam, 0.75), streak * (0.3 + 0.35 * k));

        // --- foam
        float foam = 0.0;
        // rapids: churned white water, stretched along the flow + crest foam on steep ripples
        float f1 = vnoise(vec2(vLat * 1.5, (vS - uTime * sp * 1.15) * 0.45));
        float f2 = vnoise(vec2(vLat * 3.3 + 11.0, (vS - uTime * sp * 1.45) * 0.9));
        float churn = f1 * 0.62 + f2 * 0.38;
        float rap = smoothstep(0.64 - 0.04 * k, 0.78 - 0.04 * k, churn + length(g) * 1.3 * k);
        foam += rap * k * 0.9;
        // bank foam: soft wobbling band + lacy second ring
        float wob = vnoise(vec2(vS * 0.45, uTime * 0.7 + aL * 0.15)) * 1.3;
        float bankA = 1.0 - smoothstep(0.1, 1.5, e + wob - 0.7);
        float lace = vnoise(vec2(e * 1.6 + uTime * 0.25, vS * 0.7 - uTime * 0.2));
        float bankB = smoothstep(0.5, 0.78, lace) * (1.0 - smoothstep(0.8, 3.8 + k * 2.0, e + wob * 0.5));
        foam = max(foam, max(bankA, bankB * 0.75));
        foam = max(foam, k * 0.25 * (1.0 - smoothstep(0.0, 5.0, e)));
        // obstacles: foam ring + downstream wake
        for (int i = 0; i < ${MAX_OBS}; i++) {
          vec4 o = uObs[i];
          if (o.w <= 0.0) continue;
          vec2 dlt = vWorld.xz - o.xy;
          float dist = length(dlt);
          if (dist > o.w * 6.0 + 4.0) continue;
          float ring = 1.0 - smoothstep(0.0, 0.9, dist - o.w * 1.0 + vnoise(dlt * 1.4 + uTime * 0.6) * 0.7 - 0.45);
          float along = dot(dlt, tn), cross = dot(dlt, rt);
          float wake = smoothstep(0.0, 1.0, along) * exp(-abs(cross) / (o.w * 0.7 + 0.35 + along * 0.1)) * exp(-along / (o.w * 3.5 + 2.0));
          wake *= 0.4 + 0.6 * vnoise(vec2(cross * 1.2, (along - uTime * sp) * 0.9));
          foam = max(foam, max(ring * 0.95, wake * 0.85));
        }
        // soft bubbly texture inside the foam
        float bub = 0.8 + 0.2 * vnoise(vec2(vLat * 6.0, (vS - uTime * sp * 0.6) * 5.0));
        col = mix(col, uFoam * bub, clamp(foam, 0.0, 1.0));

        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'water';
  mesh.renderOrder = -1;
  const obstacles = track.obstacles || [];
  const _c = new THREE.Vector3();
  let acc = 0;
  function refreshObstacles(camera) {
    camera.getWorldPosition(_c);
    const cand = [];
    for (const o of obstacles) {
      if (!Number.isFinite(o.x) || !Number.isFinite(o.z)) continue;
      const r = o.r || 1;
      if (r > 8 || o.type === 'waterfall') continue;
      const dx = o.x - _c.x, dz = o.z - _c.z, d2 = dx * dx + dz * dz;
      if (d2 < 150 * 150) cand.push([d2, o.x, o.z, r]);
    }
    cand.sort((a, b) => a[0] - b[0]);
    for (let i = 0; i < MAX_OBS; i++) {
      const c = cand[i];
      if (c) obsArr[i].set(c[1], c[2], 0, c[3]); else obsArr[i].set(0, 0, 0, 0);
    }
  }
  function update(t, camera) {
    mat.uniforms.uTime.value = t;
    if (camera) { acc++; if (obstacles.length && (acc % 3 === 1 || obstacles.some((o) => o.moving))) refreshObstacles(camera); }
  }
  /** Optional: match the sky / sun (call once after makeSky). colours are THREE.Color-compatible. */
  function setSky({ top, mid, horizon, sunDir: sd, sunColor } = {}) {
    const u = mat.uniforms;
    if (top) u.uSkyTop.value.set(top);
    if (mid) u.uSkyMid.value.set(mid);
    if (horizon) u.uSkyHor.value.set(horizon);
    if (sunColor) u.uSunCol.value.set(sunColor);
    if (sd) u.uSunDir.value.copy(sd).normalize();
  }
  return { mesh, update, material: mat, setSky };
}
