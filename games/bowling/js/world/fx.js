// Effects: pooled spark / dust points, instanced confetti, the aim guide ribbon and blob shadows.
import * as THREE from 'three';
import { LANE } from '../constants.js';
import { dotTexture, clamp, damp } from './util.js';

export function createFx({ scene, noReflLayer }) {
  // ── sparks and dust ──
  const N = 320;
  const pPos = new Float32Array(N * 3), pCol = new Float32Array(N * 3), pSize = new Float32Array(N), pAlpha = new Float32Array(N);
  const pVel = new Float32Array(N * 3), pLife = new Float32Array(N), pMax = new Float32Array(N), pGrav = new Float32Array(N);
  let pNext = 0;
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pg.setAttribute('aColor', new THREE.BufferAttribute(pCol, 3));
  pg.setAttribute('aSize', new THREE.BufferAttribute(pSize, 1));
  pg.setAttribute('aAlpha', new THREE.BufferAttribute(pAlpha, 1));
  const pMat = new THREE.ShaderMaterial({
    uniforms: { uScale: { value: 800 } },
    vertexShader: `attribute vec3 aColor; attribute float aSize; attribute float aAlpha; uniform float uScale; varying vec4 vC;
      void main(){ vC = vec4(aColor, aAlpha); vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = aSize * uScale / max(0.1,-mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec4 vC; void main(){ float d = length(gl_PointCoord-0.5)*2.0; float a = smoothstep(1.0,0.2,d)*vC.a; if(a<0.004) discard; gl_FragColor = vec4(vC.rgb*a, a);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
    transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
  });
  const points = new THREE.Points(pg, pMat);
  points.frustumCulled = false; points.layers.set(noReflLayer);
  scene.add(points);
  const spawn = (x, y, z, vx, vy, vz, r, g, b, size, life, grav) => {
    const i = pNext; pNext = (pNext + 1) % N;
    pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z;
    pVel[i * 3] = vx; pVel[i * 3 + 1] = vy; pVel[i * 3 + 2] = vz;
    pCol[i * 3] = r; pCol[i * 3 + 1] = g; pCol[i * 3 + 2] = b;
    pSize[i] = size; pLife[i] = pMax[i] = life; pGrav[i] = grav;
  };
  function burst(x, y, z, strength) {
    const s = clamp(strength, 0, 1), n = Math.round(6 + s * 26);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = (0.4 + Math.random() * 2.6) * (0.4 + s);
      if (i % 3 === 0) spawn(x, Math.max(0.02, y), z, Math.cos(a) * sp * 0.3, 0.2 + Math.random() * 0.5, Math.sin(a) * sp * 0.3 - 0.4, 0.9, 0.78, 0.6, 0.1 + Math.random() * 0.12, 0.5 + Math.random() * 0.5, 0.3); // dust
      else spawn(x, Math.max(0.02, y), z, Math.cos(a) * sp, 0.6 + Math.random() * 2.4 * (0.5 + s), Math.sin(a) * sp - 1.0 * s, 3.0, 2.0 + Math.random(), 0.7, 0.014 + Math.random() * 0.02, 0.25 + Math.random() * 0.4, 7); // sparks
    }
  }

  // ── confetti ──
  const CN = 460, cGeo = new THREE.PlaneGeometry(0.05, 0.028);
  const confetti = new THREE.InstancedMesh(cGeo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), CN);
  confetti.frustumCulled = false; confetti.count = 0;
  const palette = ['#ff3b30', '#ffd21f', '#2f7cff', '#2fc65a', '#ffffff', '#ff5fa2'].map((c) => new THREE.Color(c).multiplyScalar(1.5));
  for (let i = 0; i < CN; i++) confetti.setColorAt(i, palette[i % palette.length]);
  scene.add(confetti);
  const cs = Array.from({ length: CN }, () => ({ life: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), r: new THREE.Euler(), w: new THREE.Vector3() }));
  let cHead = 0;
  function confettiBurst(count, power = 1) {
    for (let k = 0; k < count; k++) {
      const c = cs[cHead]; cHead = (cHead + 1) % CN;
      const side = k % 3;
      if (side < 2) { // cannons beside the lane
        const s = side ? 1 : -1;
        c.p.set(s * 0.95, 0.15, -15.9 - Math.random() * 0.4);
        c.v.set(-s * (0.5 + Math.random() * 2.2), 3.2 + Math.random() * 3.2 * power, -0.6 - Math.random() * 3.2);
      } else { // shower from above the deck
        c.p.set((Math.random() - 0.5) * 2.2, 2.0 + Math.random() * 0.8, -15.6 - Math.random() * 3.2);
        c.v.set((Math.random() - 0.5) * 1.2, -Math.random() * 0.8, (Math.random() - 0.5) * 1.0);
      }
      c.r.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      c.w.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16);
      c.life = 3 + Math.random() * 2.2;
    }
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1);

  // ── aim guide ──
  const AN = 40, aPos = new Float32Array((AN + 1) * 6), aUv = new Float32Array((AN + 1) * 4), aIdx = [];
  for (let i = 0; i < AN; i++) { const a = i * 2; aIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const ag = new THREE.BufferGeometry();
  ag.setAttribute('position', new THREE.BufferAttribute(aPos, 3)); ag.setAttribute('uv', new THREE.BufferAttribute(aUv, 2)); ag.setIndex(aIdx);
  const aimMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color('#ffe9a8') }, uOpacity: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float uTime; uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv;
      void main(){ float d = vUv.y; float x = abs(vUv.x-0.5)*2.0;
        float ch = fract((d + x*0.16)*2.4 - uTime*1.5);
        float band = smoothstep(0.0,0.1,ch)*smoothstep(0.6,0.42,ch);
        float edge = smoothstep(1.0,0.7,x);
        float fade = smoothstep(9.5,3.5,d)*smoothstep(0.0,0.25,d);
        float a = (0.12 + 0.8*band)*edge*fade*uOpacity;
        gl_FragColor = vec4(uColor*(0.9+0.9*band), a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
  });
  const aim = new THREE.Mesh(ag, aimMat);
  aim.frustumCulled = false; aim.layers.set(noReflLayer); aim.visible = false; aim.renderOrder = 3;
  scene.add(aim);
  const marker = new THREE.Mesh(new THREE.RingGeometry(0.085, 0.108, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffe9a8', transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
  marker.layers.set(noReflLayer); marker.position.y = 0.004; marker.renderOrder = 3; marker.visible = false;
  scene.add(marker);
  let aimTarget = 0, aimOpacity = 0;
  const tmp = [];
  function setAim({ visible = false, x = 0, angle = 0, path = null } = {}) {
    aimTarget = visible ? 1 : 0;
    if (!visible) return;
    // resample the path by arc length to AN + 1 points over at most 10 m
    tmp.length = 0;
    if (path && path.length > 1) for (const p of path) tmp.push(p.x, p.z);
    else for (let i = 0; i <= 12; i++) tmp.push(x + Math.tan(angle) * i, -i);
    const n = tmp.length / 2;
    let total = 0; const cum = [0];
    for (let i = 1; i < n; i++) { total += Math.hypot(tmp[i * 2] - tmp[i * 2 - 2], tmp[i * 2 + 1] - tmp[i * 2 - 1]); cum.push(total); }
    const L = Math.min(total, 10), HWID = 0.055;
    let j = 1;
    for (let i = 0; i <= AN; i++) {
      const d = L * i / AN;
      while (j < n - 1 && cum[j] < d) j++;
      const t = clamp((d - cum[j - 1]) / Math.max(1e-6, cum[j] - cum[j - 1]), 0, 1);
      const ax = tmp[j * 2 - 2], az = tmp[j * 2 - 1], bx = tmp[j * 2], bz = tmp[j * 2 + 1];
      const px = ax + (bx - ax) * t, pz = az + (bz - az) * t;
      let tx = bx - ax, tz = bz - az; const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
      const nx = -tz, nz = tx; // points toward +X when travelling toward -Z
      const lim = LANE.halfWidth - 0.005;
      aPos.set([clamp(px - nx * HWID, -lim, lim), 0.003, pz - nz * HWID, clamp(px + nx * HWID, -lim, lim), 0.003, pz + nz * HWID], i * 6);
      aUv.set([0, d, 1, d], i * 4);
    }
    ag.attributes.position.needsUpdate = true; ag.attributes.uv.needsUpdate = true;
    marker.position.x = tmp[0]; marker.position.z = tmp[1];
  }

  // ── blob shadows ──
  const blobTex = dotTexture(128, 'rgba(0,0,0,1)', 'rgba(0,0,0,0)', 0.45);
  function blob() {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, opacity: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    m.layers.set(noReflLayer); m.visible = false; m.renderOrder = 1;
    scene.add(m);
    return m;
  }

  let time = 0;
  function update(dt, viewportH, fovDeg) {
    time += dt;
    pMat.uniforms.uScale.value = viewportH / (2 * Math.tan(fovDeg * Math.PI / 360));
    for (let i = 0; i < N; i++) {
      if (pLife[i] <= 0) { pAlpha[i] = 0; continue; }
      pLife[i] -= dt;
      pVel[i * 3 + 1] -= pGrav[i] * dt;
      const dr = Math.exp(-1.6 * dt);
      pVel[i * 3] *= dr; pVel[i * 3 + 2] *= dr;
      pPos[i * 3] += pVel[i * 3] * dt; pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt; pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt;
      if (pPos[i * 3 + 1] < 0.01 && pPos[i * 3 + 2] > LANE.deckEndZ) { pPos[i * 3 + 1] = 0.01; pVel[i * 3 + 1] *= -0.35; }
      const k = Math.max(0, pLife[i] / pMax[i]);
      pAlpha[i] = (pGrav[i] < 1 ? 0.22 : 1) * k;
    }
    pg.attributes.position.needsUpdate = true; pg.attributes.aAlpha.needsUpdate = true;
    pg.attributes.aColor.needsUpdate = true; pg.attributes.aSize.needsUpdate = true;
    let alive = 0;
    for (let i = 0; i < CN; i++) {
      const c = cs[i];
      if (c.life <= 0) continue;
      c.life -= dt;
      c.v.y -= 4.2 * dt;
      const dr = Math.exp(-1.9 * dt); c.v.multiplyScalar(dr);
      c.v.x += Math.sin(time * 5 + i) * 0.6 * dt;
      c.p.addScaledVector(c.v, dt);
      if (c.p.y < 0.006 && c.p.z > LANE.deckEndZ) { c.p.y = 0.006; c.v.set(0, 0, 0); c.w.multiplyScalar(0.8); c.r.x = Math.PI / 2; c.r.y = 0; }
      else { c.r.x += c.w.x * dt; c.r.y += c.w.y * dt; c.r.z += c.w.z * dt; }
      const s = Math.min(1, c.life * 2);
      q.setFromEuler(c.r); sc.setScalar(s); m4.compose(c.p, q, sc);
      // keep the per-instance colour slot: write into the same index
      confetti.setMatrixAt(i, m4); alive = i + 1;
    }
    // hide dead ones inside the drawn range
    sc.setScalar(0); m4.compose(cs[0].p, q, sc);
    for (let i = 0; i < alive; i++) if (cs[i].life <= 0) confetti.setMatrixAt(i, m4);
    confetti.count = alive;
    if (alive) confetti.instanceMatrix.needsUpdate = true;
    aimOpacity = damp(aimOpacity, aimTarget, 10, dt);
    aim.visible = marker.visible = aimOpacity > 0.01;
    aimMat.uniforms.uTime.value = time; aimMat.uniforms.uOpacity.value = aimOpacity;
    marker.material.opacity = aimOpacity * (0.65 + 0.25 * Math.sin(time * 5));
    marker.scale.setScalar(1 + 0.06 * Math.sin(time * 5));
  }
  const setAimColor = (c) => { aimMat.uniforms.uColor.value.set(c).lerp(new THREE.Color('#fff3cf'), 0.55); marker.material.color.copy(aimMat.uniforms.uColor.value); };
  return { burst, confettiBurst, setAim, setAimColor, blob, update };
}
