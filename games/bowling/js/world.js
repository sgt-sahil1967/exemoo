// Moo Bowl world: renderer, lighting, planar lane reflections, pins, balls, pinsetter animation,
// cameras and effects. See CONTRACT.md "js/world.js". Everything is generated in code.
import * as THREE from 'three';
import { LANE, BALL, PIN, PIN_SPOTS, PLAYERS } from './constants.js';
import { clamp, lerp, smooth, seg, damp, makeCanvas, tex, FONT } from './world/util.js';
import { buildLanes, DECK_Z } from './world/lane.js';
import { pinGeometry, pinMaterial, ballGeometry, ballMaterial, buildPinEnd, buildBarn, BARN, MONITOR, RACK_TRAVEL, SWEEP_FRONT_Z, SWEEP_BACK_Z, SWEEP_UP } from './world/props.js';
import { createFx } from './world/fx.js';

const NO_REFL = 2; // layer for things the mirror pass must not draw
const IDENT = new THREE.Quaternion();
const X_AXIS = new THREE.Vector3(1, 0, 0);

export async function createWorld({ canvas, quality: startQuality = 2 } = {}) {
  try { await Promise.race([document.fonts.load('64px "Lilita One"'), new Promise((r) => setTimeout(r, 1500))]); } catch (e) { /* fallback fonts */ }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const BASE_EXPOSURE = 1.0;
  renderer.toneMappingExposure = BASE_EXPOSURE;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0d0906');
  const camera = new THREE.PerspectiveCamera(32, 1, 0.12, 80);
  camera.layers.enable(NO_REFL);

  // ── image based light: a warm room with bright lamps and a neon wall ──
  {
    const env = new THREE.Scene(), pm = new THREE.PMREMGenerator(renderer);
    const bm = (c, k = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.BackSide });
    env.add(new THREE.Mesh(new THREE.BoxGeometry(14, 8, 30), [bm('#5a3a22', 0.5), bm('#5a3a22', 0.5), bm('#3a2416', 0.45), bm('#6b4424', 0.7), bm('#40285a', 0.5), bm('#3a2416', 0.4)]));
    const lamp = (x, y, z, w, h, c, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); };
    for (const z of [-9, -3, 3, 9]) for (const x of [-3, 3]) lamp(x, 3.8, z, 1.6, 1.6, '#ffd9a0', 9);
    lamp(0, 1.0, -14.8, 6, 1.2, '#ff5a6a', 5); lamp(-6.8, 1.5, -4, 2, 1.2, '#ffb14a', 4); lamp(6.8, 1.5, 4, 2, 1.2, '#6aa0ff', 3);
    scene.environment = pm.fromScene(env, 0.03).texture;
    pm.dispose();
  }

  // ── lights (fixed count, only the key casts shadows) ──
  const hemi = new THREE.HemisphereLight('#ffdcb0', '#3a2415', 0.75);
  const key = new THREE.DirectionalLight('#ffe6c4', 1.5);
  key.target.position.set(0, 0, -18.4);
  key.position.set(0.25, 0.75, 0.62).normalize().multiplyScalar(12).add(key.target.position);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 1024);
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.012; key.shadow.radius = 3;
  Object.assign(key.shadow.camera, { left: -4.7, right: 4.7, top: 1.9, bottom: -1.6, near: 4, far: 20 });
  const deckSpot = new THREE.SpotLight('#fff3df', 42, 10, 0.5, 0.85, 2);
  deckSpot.position.set(0, 2.5, -15.0); deckSpot.target.position.set(0, 0.1, -18.7);
  const apprSpot = new THREE.SpotLight('#ffd9a8', 70, 14, 0.95, 1, 2);
  apprSpot.position.set(0, 4.3, 2.4); apprSpot.target.position.set(0, 0, 1.0);
  const neonA = new THREE.PointLight('#ff4a6e', 9, 11, 2); neonA.position.set(0, 1.5, -16.2);
  const neonB = new THREE.PointLight('#ffb866', 26, 20, 2); neonB.position.set(0, 3.6, -9.5);
  scene.add(hemi, key, key.target, deckSpot, deckSpot.target, apprSpot, apprSpot.target, neonA, neonB);
  const LIGHT0 = { hemi: hemi.intensity, key: key.intensity, deck: deckSpot.intensity, appr: apprSpot.intensity, a: neonA.intensity, b: neonB.intensity };

  // ── planar reflection of everything above the lane surface (y = 0) ──
  const refl = {
    rt: new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, depthBuffer: true }),
    cam: new THREE.PerspectiveCamera(),
    uniforms: { tRefl: { value: null }, uReflMatrix: { value: new THREE.Matrix4() }, uReflOn: { value: 1 }, uReflTexel: { value: new THREE.Vector2() } },
    on: true,
  };
  refl.uniforms.tRefl.value = refl.rt.texture;
  function reflective(mat, strength) {
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, refl.uniforms, { uReflStrength: { value: strength } });
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nuniform mat4 uReflMatrix;\nvarying vec4 vReflUv;\nvarying vec3 vWPos;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvec4 wPosR = modelMatrix * vec4(transformed, 1.0);\nvWPos = wPosR.xyz;\nvReflUv = uReflMatrix * wPosR;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform sampler2D tRefl;\nuniform float uReflOn;\nuniform float uReflStrength;\nuniform vec2 uReflTexel;\nvarying vec4 vReflUv;\nvarying vec3 vWPos;')
        .replace('#include <opaque_fragment>', `{
          vec2 ruv = vReflUv.xy / vReflUv.w;
          float ndv = clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
          float fres = pow(1.0 - ndv, 3.0);
          vec2 tx = uReflTexel * (1.2 + 3.0 * ndv);
          vec3 rc = texture2D(tRefl, ruv).rgb * 0.28
            + (texture2D(tRefl, ruv + vec2(tx.x, 0.0)).rgb + texture2D(tRefl, ruv - vec2(tx.x, 0.0)).rgb) * 0.11
            + (texture2D(tRefl, ruv + vec2(0.0, tx.y * 2.0)).rgb + texture2D(tRefl, ruv - vec2(0.0, tx.y * 2.0)).rgb) * 0.14
            + (texture2D(tRefl, ruv + vec2(0.0, tx.y * 4.5)).rgb + texture2D(tRefl, ruv - vec2(0.0, tx.y * 4.5)).rgb) * 0.11;
          float oil = mix(0.6, 1.0, smoothstep(-13.4, -11.0, vWPos.z));
          float k = uReflStrength * uReflOn * oil * (0.14 + 0.62 * fres);
          outgoingLight = outgoingLight * (1.0 - 0.45 * k) + min(rc, vec3(6.0)) * k;
        }
        #include <opaque_fragment>`);
    };
    mat.customProgramCacheKey = () => 'moo-refl';
    return mat;
  }
  const _cp = new THREE.Vector3(), _rot = new THREE.Matrix4(), _look = new THREE.Vector3(), _plane = new THREE.Plane(), _clip = new THREE.Vector4(), _qv = new THREE.Vector4();
  function renderMirror() {
    camera.updateMatrixWorld();
    _cp.setFromMatrixPosition(camera.matrixWorld);
    if (_cp.y < 0.02) return;
    const v = refl.cam;
    _rot.extractRotation(camera.matrixWorld);
    _look.set(0, 0, -1).applyMatrix4(_rot).add(_cp);
    v.position.set(_cp.x, -_cp.y, _cp.z);
    v.up.set(0, 1, 0).applyMatrix4(_rot); v.up.y *= -1;
    v.lookAt(_look.x, -_look.y, _look.z);
    v.far = camera.far; v.near = camera.near;
    v.updateMatrixWorld();
    v.projectionMatrix.copy(camera.projectionMatrix);
    refl.uniforms.uReflMatrix.value.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(v.projectionMatrix).multiply(v.matrixWorldInverse);
    // oblique near plane at y = 0 so nothing below the lane leaks into the mirror
    _plane.set(_look.set(0, 1, 0), -0.001).applyMatrix4(v.matrixWorldInverse);
    _clip.set(_plane.normal.x, _plane.normal.y, _plane.normal.z, _plane.constant);
    const pe = v.projectionMatrix.elements;
    _qv.set((Math.sign(_clip.x) + pe[8]) / pe[0], (Math.sign(_clip.y) + pe[9]) / pe[5], -1, (1 + pe[10]) / pe[14]);
    _clip.multiplyScalar(2 / _clip.dot(_qv));
    pe[2] = _clip.x; pe[6] = _clip.y; pe[10] = _clip.z + 1 - 0.003; pe[14] = _clip.w;
    const auto = renderer.shadowMap.autoUpdate;
    renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(refl.rt);
    renderer.render(scene, v);
    renderer.setRenderTarget(null);
    renderer.shadowMap.autoUpdate = auto;
  }

  // ── build the place ──
  buildLanes({ scene, reflective, noReflLayer: NO_REFL });
  const pinGeo = pinGeometry(), pinMat = pinMaterial();
  const { rack, sweep, neons, neon } = buildPinEnd({ scene, pinGeo, pinMat });
  const barn = buildBarn({ scene, neon });
  const fx = createFx({ scene, noReflLayer: NO_REFL });

  // pins
  const pinMeshes = PIN_SPOTS.map((s) => {
    const m = new THREE.Mesh(pinGeo, pinMat);
    m.position.set(s.x, 0, s.z); m.castShadow = true; m.receiveShadow = true;
    scene.add(m);
    return m;
  });
  const pinInfo = PIN_SPOTS.map((s) => ({ id: s.id, present: true, down: false }));

  // balls
  const ballGeo = ballGeometry(), ballMats = PLAYERS.map((_, i) => ballMaterial(i));
  const ball = new THREE.Mesh(ballGeo, ballMats[0]);
  ball.castShadow = true; ball.visible = false;
  scene.add(ball);
  const ballBlob = fx.blob(), heldBlob = fx.blob();
  const ballState = { present: false, x: 0, y: BALL.radius, z: 0, state: 'none' };
  barn.returnSpots.forEach((p, i) => {
    const m = new THREE.Mesh(ballGeo, ballMats[[1, 2, 3, 3, 0, 2][i % 6]]);
    m.position.set(p[0], p[1], p[2]); m.rotation.set(i * 1.3, i * 2.1, i);
    scene.add(m);
  });

  // held ball with a cartoon glove and forearm
  const held = new THREE.Group();
  const heldBall = new THREE.Mesh(ballGeo, ballMats[0]);
  heldBall.rotation.set(0, 0, Math.PI / 2 - 0.5); // holes up toward the hand
  const gloveMat = new THREE.MeshStandardMaterial({ color: '#fff6e6', roughness: 0.55 });
  const sleeveMat = new THREE.MeshStandardMaterial({ color: PLAYERS[0].color, roughness: 0.6 });
  const arm = new THREE.Group();
  const glove = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), gloveMat); glove.scale.set(0.085, 0.05, 0.095); glove.position.y = BALL.radius + 0.012;
  const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.1, 6, 14), gloveMat); fore.position.y = BALL.radius + 0.1;
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.05, 0.1, 16), sleeveMat); cuff.position.y = BALL.radius + 0.2;
  arm.add(glove, fore, cuff);
  held.add(heldBall, arm);
  held.visible = false;
  scene.add(held);
  const heldS = { visible: false, x: 0, swing: 0, tx: 0, ts: 0, player: 0, init: false };

  // overhead monitor
  const monitorCanvas = makeCanvas(1024, 512);
  {
    const g = monitorCanvas.getContext('2d');
    g.fillStyle = '#12123a'; g.fillRect(0, 0, 1024, 512);
    g.fillStyle = '#ffd21f'; g.font = `170px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MOO BOWL', 512, 256);
  }
  const monitorTex = tex(monitorCanvas, { aniso: 8 });
  const monitorMat = new THREE.MeshBasicMaterial({ map: monitorTex, toneMapped: false }); monitorMat.color.setScalar(0.95);
  const monitor = new THREE.Mesh(new THREE.PlaneGeometry(MONITOR.w, MONITOR.h), monitorMat);
  monitor.position.set(0, MONITOR.y, MONITOR.z); monitor.rotation.x = MONITOR.tilt;
  scene.add(monitor);

  // ── quality and sizing ──
  let quality = -1, viewW = 1, viewH = 1;
  const Q = [{ pr: 1, refl: 0, shadow: false }, { pr: 1.25, refl: 0.5, shadow: true }, { pr: 2, refl: 0.5, shadow: true }];
  function resize() {
    viewW = Math.max(1, canvas.clientWidth || innerWidth); viewH = Math.max(1, canvas.clientHeight || innerHeight);
    const q = Q[quality], pr = Math.min(devicePixelRatio || 1, q.pr);
    renderer.setPixelRatio(pr);
    renderer.setSize(viewW, viewH, false);
    camera.aspect = viewW / viewH; camera.updateProjectionMatrix();
    const s = q.refl || 0.1, rw = Math.max(4, Math.floor(viewW * pr * s)), rh = Math.max(4, Math.floor(viewH * pr * s));
    refl.rt.setSize(rw, rh);
    refl.uniforms.uReflTexel.value.set(1 / rw, 1 / rh);
  }
  function setQuality(q) {
    q = clamp(q | 0, 0, 2);
    if (q === quality) return;
    quality = q;
    refl.on = Q[q].refl > 0; refl.uniforms.uReflOn.value = refl.on ? 1 : 0;
    if (key.castShadow !== Q[q].shadow) { key.castShadow = Q[q].shadow; scene.traverse((o) => { if (o.material && !Array.isArray(o.material)) o.material.needsUpdate = true; }); }
    resize();
  }
  setQuality(startQuality);
  const perf = { acc: 0, n: 0, warm: 0, last: 0 };

  // ── cameras ──
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const cam = { mode: 'title', opts: {}, blend: 1, dur: 1, t: 0, from: { p: V(0, 1.6, 4.5), t: V(0, 0.5, -10), f: 32 }, cur: { p: V(0, 1.6, 4.5), t: V(0, 0.5, -10), f: 32 }, des: { p: V(), t: V(), f: 32 }, fp: V(), ft: V(), ff: 40, fx: 0, fz: 0, addrX: 0, shake: 0 };
  function desired(dt) {
    const d = cam.des, t = cam.t;
    if (cam.mode === 'address') {
      cam.addrX = damp(cam.addrX, clamp(cam.opts.x || 0, -0.6, 0.6), 4, dt);
      d.p.set(cam.addrX * 0.45, 1.58, 4.35); d.t.set(cam.addrX * 0.2, 0.42, -9); d.f = 31;
    } else if (cam.mode === 'follow') {
      if (ballState.present && ballState.state !== 'pit') { cam.fx = ballState.x; cam.fz = ballState.z; }
      const settle = smooth(seg(-cam.fz, 8.5, 15.5));
      d.p.set(cam.fx * 0.55 * (1 - settle), lerp(0.62, 0.84, settle), Math.max(cam.fz + 2.3, -14.9));
      d.t.set(cam.fx * (1 - settle), lerp(0.2, 0.2, settle), lerp(cam.fz - 5, -18.75, settle));
      d.f = lerp(44, 35, settle);
      cam.fp.x = damp(cam.fp.x, d.p.x, 7, dt); cam.fp.y = damp(cam.fp.y, d.p.y, 5, dt); cam.fp.z = damp(cam.fp.z, d.p.z, 9, dt);
      cam.ft.x = damp(cam.ft.x, d.t.x, 7, dt); cam.ft.y = damp(cam.ft.y, d.t.y, 5, dt); cam.ft.z = damp(cam.ft.z, d.t.z, 7, dt);
      d.p.copy(cam.fp); d.t.copy(cam.ft);
    } else if (cam.mode === 'pins') {
      d.p.set(0.55 + Math.sin(t * 0.4) * 0.12, 0.8, -15.3); d.t.set(0, 0.2, -18.7); d.f = 33;
    } else if (cam.mode === 'results') {
      d.p.set(2.9 + Math.sin(t * 0.25) * 0.5, 2.5, 7.0); d.t.set(-0.3, 1.0, -8); d.f = 44;
    } else { // title: slow sweep down the hall
      const a = t * 0.11;
      d.p.set(Math.sin(a) * 3.3, 1.55 + Math.sin(a * 0.7) * 0.4, 2.2 - (0.5 - 0.5 * Math.cos(a)) * 9); d.t.set(-Math.sin(a) * 0.6, 0.6, -17.5); d.f = 40;
    }
  }
  function setCamera(mode, opts = {}) {
    cam.opts = opts || {};
    if (mode === cam.mode) return;
    cam.from.p.copy(cam.cur.p); cam.from.t.copy(cam.cur.t); cam.from.f = cam.cur.f;
    cam.blend = 0; cam.dur = mode === 'follow' ? 0.8 : 1.25; cam.mode = mode;
    if (mode === 'follow') { cam.fx = ballState.present ? ballState.x : 0; cam.fz = ballState.present ? ballState.z : 0; cam.fp.set(cam.fx * 0.55, 0.62, cam.fz + 2.3); cam.ft.set(cam.fx, 0.2, cam.fz - 5); }
  }
  let firstCam = true;
  function updateCamera(dt) {
    cam.t += dt;
    desired(dt);
    if (firstCam) { cam.blend = 1; firstCam = false; }
    cam.blend = Math.min(1, cam.blend + dt / cam.dur);
    const k = smooth(cam.blend), c = cam.cur;
    c.p.lerpVectors(cam.from.p, cam.des.p, k); c.t.lerpVectors(cam.from.t, cam.des.t, k); c.f = lerp(cam.from.f, cam.des.f, k);
    cam.shake = Math.max(0, cam.shake - dt * 1.9);
    const s = cam.shake * cam.shake * 0.05, tt = cam.t * 50;
    camera.position.set(c.p.x + Math.sin(tt * 1.3) * s, c.p.y + Math.sin(tt * 1.7 + 1) * s, c.p.z + Math.sin(tt * 0.9 + 2) * s * 0.5);
    camera.lookAt(c.t);
    // widen a little on portrait / narrow screens so the lane stays in frame
    const f = c.f * (camera.aspect < 1.2 ? lerp(1.5, 1, clamp((camera.aspect - 0.5) / 0.7, 0, 1)) : 1);
    if (Math.abs(camera.fov - f) > 0.01) { camera.fov = f; camera.updateProjectionMatrix(); }
  }

  // ── sync from physics ──
  const ps = { active: false };
  function syncPins(pins) {
    if (ps.active || !pins) return;
    for (let i = 0; i < 10; i++) {
      const p = pins[i], m = pinMeshes[i];
      if (!p) continue;
      m.visible = !!p.present;
      pinInfo[i].present = !!p.present; pinInfo[i].down = !!p.down;
      if (p.present) { m.position.set(p.x, p.y, p.z); m.quaternion.set(p.qx, p.qy, p.qz, p.qw); }
    }
  }
  function syncBall(b) {
    const on = !!(b && b.present);
    ballState.present = on;
    ball.visible = on;
    if (!on) { ballBlob.visible = false; return; }
    ballState.x = b.x; ballState.y = b.y; ballState.z = b.z; ballState.state = b.state;
    ball.position.set(b.x, b.y, b.z); ball.quaternion.set(b.qx, b.qy, b.qz, b.qw);
    const inPit = b.z < LANE.deckEndZ, floor = Math.abs(b.x) > LANE.halfWidth ? b.y - BALL.radius : 0;
    ballBlob.visible = !inPit;
    const h = Math.max(0, b.y - BALL.radius - floor), s = BALL.radius * (2.5 + h * 3);
    ballBlob.position.set(b.x + 0.01, floor + 0.0025, b.z - 0.015); ballBlob.scale.set(s, 1, s);
    ballBlob.material.opacity = 0.62 / (1 + h * 6);
  }
  function setBallPlayer(i) { ball.material = ballMats[clamp(i | 0, 0, 3)]; }
  function setHeldBall({ visible = false, x = 0, swing = 0, player = 0 } = {}) {
    heldS.visible = !!visible; heldS.tx = x; heldS.ts = clamp(swing, -1, 1);
    const p = clamp(player | 0, 0, 3);
    if (p !== heldS.player || !heldS.init) { heldS.player = p; heldBall.material = ballMats[p]; sleeveMat.color.set(PLAYERS[p].color); fx.setAimColor(PLAYERS[p].color); }
    if (visible && !heldS.init) { heldS.x = x; heldS.swing = heldS.ts; }
    heldS.init = !!visible;
  }
  function updateHeld(dt) {
    held.visible = heldS.visible; heldBlob.visible = heldS.visible;
    if (!heldS.visible) return;
    heldS.x = damp(heldS.x, heldS.tx, 16, dt); heldS.swing = damp(heldS.swing, heldS.ts, 22, dt);
    const s = heldS.swing, f = smooth(Math.max(0, s)), L = 0.66;
    const shY = lerp(1.38, 0.765, f), shZ = lerp(1.15, 0.3, f) + Math.max(0, -s) * 0.12;
    const th = s < 0 ? s * 1.25 : s * 0.45;
    const by = shY - L * Math.cos(th), bz = shZ - L * Math.sin(th);
    held.position.set(heldS.x, by, bz);
    arm.rotation.x = th; // forearm points back up toward the shoulder
    heldBall.rotation.x = -th;
    const sc = BALL.radius * (2.4 + by * 2.2);
    heldBlob.position.set(heldS.x, 0.0025, bz); heldBlob.scale.set(sc, 1, sc); heldBlob.material.opacity = 0.5 / (1 + by * 2.5);
  }

  // ── pinsetter ──
  const Q_LIE = new THREE.Quaternion().setFromAxisAngle(X_AXIS, -Math.PI / 2), _up = new THREE.Vector3();
  function finishPinsetter() {
    if (!ps.active) return;
    ps.active = false;
    ps.items.forEach((it, i) => {
      const keep = ps.mode === 'rack' || it.keep, s = PIN_SPOTS[i];
      it.m.visible = keep; pinInfo[i].present = keep; pinInfo[i].down = false;
      if (keep) { it.m.position.set(s.x, 0, s.z); it.m.quaternion.identity(); }
    });
    rack.position.y = RACK_TRAVEL; sweep.position.set(0, SWEEP_UP, SWEEP_FRONT_Z);
    const r = ps.resolve; ps.resolve = null; if (r) r();
  }
  function pinsetter(mode = 'sweep', opts = {}) {
    finishPinsetter();
    const full = mode === 'rack';
    const ids = full ? [] : ((opts && opts.standing) || pinInfo.filter((p) => p.present && !p.down).map((p) => p.id));
    const standing = new Set(ids);
    ps.items = pinMeshes.map((m, i) => {
      const keep = !full && standing.has(i + 1);
      if (keep && !m.visible) { m.visible = true; m.position.set(PIN_SPOTS[i].x, 0, PIN_SPOTS[i].z); m.quaternion.identity(); }
      return { m, keep, dead: m.visible && !keep, p0: m.position.clone(), q0: m.quaternion.clone(), vy: 0, hit: false, fall: 0, upright: _up.set(0, 1, 0).applyQuaternion(m.quaternion).y > 0.8 };
    });
    ps.mode = full ? 'rack' : 'sweep'; ps.t = 0; ps.dur = full ? 3.0 : 2.4; ps.fresh = false; ps.active = true;
    return new Promise((res) => { ps.resolve = res; });
  }
  function updatePinsetter(dt) {
    ps.t += dt;
    const t = ps.t, full = ps.mode === 'rack';
    const down = full ? smooth(seg(t, 0, 0.25)) - smooth(seg(t, 2.6, 3.0)) : smooth(seg(t, 0, 0.25)) - smooth(seg(t, 2.05, 2.4));
    const [b0, b1, b2] = full ? [0.3, 0.95, 1.35] : [0.78, 1.35, 1.72];
    const barZ = lerp(SWEEP_FRONT_Z, SWEEP_BACK_Z, smooth(seg(t, b0, b1)) - smooth(seg(t, b1, b2)));
    sweep.position.set(0, SWEEP_UP * (1 - down), barZ);
    let rackUp, carry;
    if (full) {
      carry = 1 - smooth(seg(t, 1.3, 2.2)); rackUp = carry + smooth(seg(t, 2.5, 3.0));
      if (t >= 1.3 && !ps.fresh) {
        ps.fresh = true;
        ps.items.forEach((it, i) => { it.keep = true; it.dead = false; it.m.visible = true; it.p0.set(PIN_SPOTS[i].x, 0, PIN_SPOTS[i].z); it.q0.identity(); });
      }
    } else {
      carry = smooth(seg(t, 0.5, 0.78)) - smooth(seg(t, 1.62, 2.0));
      rackUp = 1 - smooth(seg(t, 0, 0.4)) + carry + smooth(seg(t, 2.1, 2.4));
    }
    rack.position.y = rackUp * RACK_TRAVEL;
    ps.items.forEach((it, i) => {
      const m = it.m, s = PIN_SPOTS[i];
      if (it.keep) {
        const k = full ? 1 : smooth(seg(t, 0.3, 0.78));
        m.position.set(lerp(it.p0.x, s.x, k), lerp(it.p0.y, 0, k) + carry * RACK_TRAVEL, lerp(it.p0.z, s.z, k));
        m.quaternion.copy(it.q0).slerp(IDENT, k);
      } else if (it.dead && m.visible) {
        const front = it.upright && !it.hit ? 0.075 : 0.14;
        if (t >= b0 && t <= b1 && m.position.z > barZ - front) {
          const dz = barZ - front - m.position.z;
          m.position.z += dz; it.hit = true;
          if (!it.upright) m.rotateOnWorldAxis(X_AXIS, dz * 5);
        }
        if (it.hit && it.upright && it.fall < 1) {
          it.fall = Math.min(1, it.fall + dt * 5);
          m.quaternion.copy(it.q0).slerp(Q_LIE, smooth(it.fall)); m.position.y = lerp(it.p0.y, 0.058, it.fall);
        }
        if (m.position.z < LANE.deckEndZ - 0.04) {
          it.vy -= 9.8 * dt; m.position.y += it.vy * dt; m.position.z -= 0.7 * dt; m.rotateOnWorldAxis(X_AXIS, -4 * dt);
          if (m.position.y < LANE.pitFloorY - 0.12) m.visible = false;
        }
        if (t > b1 + 0.15) m.visible = false;
      }
    });
    if (t >= ps.dur) finishPinsetter();
  }

  // ── effects ──
  const show = { kind: null, t: 0, dur: 0, bursts: [] };
  const _col = new THREE.Color();
  function impact({ x = 0, y = 0.1, z = -18.3, strength = 0.5 } = {}) {
    const s = clamp(strength, 0, 1);
    fx.burst(x, y, z, s);
    cam.shake = Math.min(1, cam.shake + s * 0.55);
  }
  function celebrate(kind) {
    show.kind = kind; show.t = 0;
    show.dur = { strike: 2.6, turkey: 4.0, spare: 1.6, gutter: 1.1, split: 1.1 }[kind] || 1.2;
    show.bursts = kind === 'strike' ? [[0, 200]] : kind === 'turkey' ? [[0, 220], [0.5, 120], [1.1, 120]] : kind === 'spare' ? [[0, 80]] : [];
  }
  function updateShow(dt) {
    let dim = 1, flash = 0, sweepHue = -1, cheer = 0;
    if (show.kind) {
      show.t += dt;
      const t = show.t, k = 1 - t / show.dur, big = show.kind === 'turkey' ? 1.3 : show.kind === 'strike' ? 1 : 0.5;
      while (show.bursts.length && show.bursts[0][0] <= t) fx.confettiBurst(show.bursts.shift()[1], big);
      if (show.kind === 'gutter' || show.kind === 'split') {
        dim = 1 - 0.55 * Math.max(0, k) * (0.55 + 0.45 * Math.sign(Math.sin(t * 31) + Math.sin(t * 17.3)));
      } else {
        flash = Math.max(0, k) * big * (0.5 + 0.5 * Math.sin(t * 22));
        sweepHue = (t * 0.9) % 1; cheer = Math.max(0, k);
      }
      if (t >= show.dur) show.kind = null;
    }
    renderer.toneMappingExposure = BASE_EXPOSURE * (0.45 + 0.55 * dim);
    hemi.intensity = LIGHT0.hemi; key.intensity = LIGHT0.key;
    for (const n of neons) n.mat.color.setScalar(n.base * dim * (1 + flash * 0.9));
    neonA.intensity = LIGHT0.a * dim * (1 + flash * 3);
    if (sweepHue >= 0) {
      deckSpot.color.setHSL(sweepHue, 0.75, 0.62); deckSpot.intensity = LIGHT0.deck * (1.3 + flash);
      deckSpot.target.position.x = Math.sin(show.t * 5) * 0.5;
    } else { deckSpot.color.set('#fff3df'); deckSpot.intensity = LIGHT0.deck; deckSpot.target.position.x = 0; }
    barn.cows.forEach((cow, i) => {
      const u = cow.userData, tt = cam.t;
      cow.position.y = u.baseY + cheer * Math.abs(Math.sin(tt * 7 + i * 1.3)) * 0.22;
      u.head.rotation.x = Math.sin(tt * 0.6 + i * 2) * 0.06 - cheer * 0.25 + (show.kind === 'gutter' ? 0.25 : 0);
      u.head.rotation.y = Math.sin(tt * 0.35 + i * 1.7) * 0.25;
      u.head.rotation.z = Math.sin(tt * 0.8 + i) * 0.05 + cheer * Math.sin(tt * 9) * 0.12;
    });
    const tw = 0.92 + 0.08 * Math.sin(cam.t * 2.3);
    barn.glowMat.opacity = 0.5 * tw * dim;
  }

  // ── frame ──
  function update(dt) {
    dt = clamp(dt || 0, 0, 0.1);
    if (ps.active) updatePinsetter(dt);
    updateHeld(dt);
    updateShow(dt);
    updateCamera(dt);
    fx.update(dt, viewH * renderer.getPixelRatio(), camera.fov);
  }
  function render() {
    // automatic quality fallback from real frame time
    const now = performance.now(), ft = now - perf.last; perf.last = now;
    if (ft < 200 && !document.hidden) {
      perf.warm += ft;
      if (perf.warm > 2500) {
        perf.acc += ft; perf.n++;
        if (perf.n >= 80) { if (perf.acc / perf.n > 23 && quality > 0 && world.autoQuality) { setQuality(quality - 1); perf.warm = 1200; } perf.acc = 0; perf.n = 0; }
      }
    }
    if (refl.on) renderMirror();
    renderer.render(scene, camera);
  }
  addEventListener('resize', resize);

  const world = {
    resize, update, render, syncPins, syncBall, setHeldBall, setAim: fx.setAim, setBallPlayer, setCamera, pinsetter, impact, celebrate,
    monitorCanvas, monitorChanged() { monitorTex.needsUpdate = true; },
    // extras (not in the contract)
    autoQuality: true, setQuality, get quality() { return quality; }, renderer, scene, camera,
  };
  updateCamera(0);
  return world;
}
