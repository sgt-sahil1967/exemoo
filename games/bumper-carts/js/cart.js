// Bumper Carts - procedural toon hay cart with a fat rubber-tube bumper, springy pennant and an animal rider.
// Model space: faces +Z, y up, floor at y = 0. Driven every frame by the sim cart (see update()):
// lean into motion, charge shake + glow ring, dash stretch, stun stars, fall + sink, respawn drop, safe blink.
import * as THREE from 'three';
import { toon, outline, mesh, place, merged, canvasTex, INK } from './world/toon.js';
import { MATCH, ARENA } from './constants.js';

const PI = Math.PI;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));
const wrapPi = (a) => Math.atan2(Math.sin(a), Math.cos(a));

const LOOK = {
  cow: { skull: '#ffffff', fur: '#ffffff', muzzle: '#ffb3c1', ear: '#ffffff', earIn: '#ffb3c1', hand: '#3a2a2a' },
  pig: { skull: '#ffb0c4', fur: '#ffb0c4', muzzle: '#ff8fab', ear: '#ffb0c4', earIn: '#ff8fab', hand: '#a8566c' },
  sheep: { skull: '#3c3b4f', fur: '#fbf7ef', muzzle: '#56546a', ear: '#3c3b4f', earIn: '#6d6a85', hand: '#26263f' },
  chick: { skull: '#ffd21f', fur: '#ffd21f', muzzle: '#ff9f1c', ear: '#ffd21f', earIn: '#ffd21f', hand: '#ff9f1c' },
};

/** Face features around a head centred at the origin (skull radius ~0.26), facing +Z. */
function featureGeo(animal) {
  const A = LOOK[animal] || LOOK.cow;
  const P = [];
  for (const s of [-1, 1]) {
    P.push([place(new THREE.SphereGeometry(0.07, 12, 8), [s * 0.1, 0.05, 0.215], [0, s * 0.35, 0], [1, 1.2, 0.6]), '#ffffff']);
    P.push([place(new THREE.SphereGeometry(0.034, 10, 8), [s * 0.105, 0.05, 0.255]), INK]);
    P.push([place(new THREE.SphereGeometry(0.011, 6, 4), [s * 0.105 - 0.01, 0.064, 0.285]), '#ffffff']);
    P.push([place(new THREE.BoxGeometry(0.08, 0.018, 0.02), [s * 0.1, 0.14, 0.235], [0, 0, s * 0.25]), INK]);
  }
  if (animal === 'pig') {
    P.push([place(new THREE.CylinderGeometry(0.1, 0.11, 0.1, 16), [0, -0.05, 0.25], [PI / 2, 0, 0]), A.muzzle]);
    for (const s of [-1, 1]) P.push([place(new THREE.SphereGeometry(0.022, 8, 6), [s * 0.04, -0.05, 0.3]), '#a8566c']);
  } else if (animal === 'chick') {
    P.push([place(new THREE.ConeGeometry(0.07, 0.16, 8), [0, -0.03, 0.3], [PI / 2, 0, 0], [1, 1, 0.55]), A.muzzle]);
    P.push([place(new THREE.ConeGeometry(0.06, 0.1, 8), [0, -0.07, 0.27], [PI / 2 + 0.3, 0, 0], [1, 1, 0.4]), '#ff7a1f']);
    for (let k = 0; k < 3; k++) P.push([place(new THREE.SphereGeometry(0.05, 8, 6), [(k - 1) * 0.05, 0.27, -0.02 + k * 0.02], [0, 0, (k - 1) * 0.5], [0.45, 1.4, 0.45]), '#ffb81f']);
    for (const s of [-1, 1]) P.push([place(new THREE.SphereGeometry(0.04, 8, 6), [s * 0.17, -0.06, 0.18], [0, 0, 0], [1, 0.7, 0.4]), '#ff9fb0']);
  } else {
    P.push([place(new THREE.SphereGeometry(1, 16, 10), [0, -0.08, 0.2], [0, 0, 0], [0.17, 0.11, 0.12]), A.muzzle]);
    for (const s of [-1, 1]) P.push([place(new THREE.SphereGeometry(0.02, 8, 6), [s * 0.055, -0.06, 0.315], [0, 0, 0], [1, 1.4, 0.6]), INK]);
  }
  if (animal !== 'chick') {
    for (const s of [-1, 1]) {
      const flop = animal === 'pig' || animal === 'sheep';
      const rz = s * (flop ? 1.9 : 1.35);
      P.push([place(new THREE.SphereGeometry(0.07, 10, 8), [s * 0.27, 0.08, -0.02], [animal === 'pig' ? -0.5 : 0, 0, rz], [0.75, 1.3, 0.35]), A.ear]);
      P.push([place(new THREE.SphereGeometry(0.05, 8, 6), [s * 0.275, 0.08, 0.0], [animal === 'pig' ? -0.5 : 0, 0, rz], [0.6, 1.1, 0.25]), A.earIn]);
    }
  }
  if (animal === 'cow') {
    for (const s of [-1, 1]) P.push([place(new THREE.ConeGeometry(0.035, 0.16, 8), [s * 0.12, 0.27, 0], [0, 0, -s * 0.35]), '#fff3c9']);
    for (const [x, y, z] of [[0.13, 0.15, 0.15], [-0.19, 0.06, -0.1], [0.06, 0.19, -0.15], [0.2, -0.04, -0.08]]) {
      const n = Math.hypot(x, y, z), k = 0.245 / n;
      P.push([place(new THREE.SphereGeometry(0.075, 10, 6), [x * k, y * k, z * k], [0, 0, 0], [1, 0.75, 1]), '#26263f']);
    }
  }
  if (animal === 'sheep') {
    for (let k = 0; k < 9; k++) {
      const a = -0.2 + (k / 8) * (PI + 0.4);
      P.push([place(new THREE.IcosahedronGeometry(0.09, 1), [Math.cos(a) * 0.2, 0.2 + Math.sin(k * 2.1) * 0.03, Math.sin(a) * -0.12 + 0.02]), '#fbf7ef']);
    }
    P.push([place(new THREE.IcosahedronGeometry(0.11, 1), [0, 0.27, 0.03]), '#fbf7ef']);
  }
  return merged(P);
}

/** The wooden hay cart (merged, vertex coloured), plus steering wheel and hay. */
function cartGeo() {
  const P = [];
  const wood = '#c98547', dark = '#8a5a2e', light = '#e2a868';
  P.push([place(new THREE.BoxGeometry(0.66, 0.08, 0.76), [0, 0.18, 0]), dark]);                       // bed
  for (const s of [-1, 1]) {
    P.push([place(new THREE.BoxGeometry(0.07, 0.28, 0.76), [s * 0.31, 0.34, 0]), wood]);               // sides
    for (const y of [0.27, 0.41]) P.push([place(new THREE.BoxGeometry(0.075, 0.02, 0.77), [s * 0.31, y, 0]), dark]);
    for (const z of [-0.36, 0.36]) P.push([place(new THREE.BoxGeometry(0.09, 0.34, 0.06), [s * 0.31, 0.35, z]), light]);
  }
  P.push([place(new THREE.BoxGeometry(0.62, 0.3, 0.07), [0, 0.35, 0.36]), wood]);                     // front board
  P.push([place(new THREE.BoxGeometry(0.62, 0.22, 0.07), [0, 0.31, -0.36]), wood]);                   // back board
  P.push([place(new THREE.CircleGeometry(0.09, 5), [0, 0.36, 0.4]), '#ffd21f']);                      // painted badge
  // hay tufts at the back
  for (let k = 0; k < 7; k++) P.push([place(new THREE.IcosahedronGeometry(0.09, 0), [-0.22 + k * 0.075, 0.44 + (k % 2) * 0.03, -0.27], [k, k * 0.7, 0], [1.3, 0.8, 1]), k % 2 ? '#f2c45a' : '#ffe08a']);
  // steering column + wheel
  P.push([place(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), [0, 0.5, 0.24], [-0.5, 0, 0]), '#3a3a4a']);
  P.push([place(new THREE.TorusGeometry(0.1, 0.022, 6, 16), [0, 0.63, 0.19], [-0.5 + PI / 2, 0, 0]), '#1b1b3a']);
  // pole socket
  P.push([place(new THREE.CylinderGeometry(0.04, 0.05, 0.1, 8), [0.22, 0.48, -0.3]), dark]);
  return merged(P);
}

function wheelPairGeo() {
  const P = [];
  for (const s of [-1, 1]) {
    P.push([place(new THREE.CylinderGeometry(0.13, 0.13, 0.07, 14), [s * 0.36, 0, 0], [0, 0, PI / 2]), '#3a2a2a']);
    P.push([place(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8), [s * 0.37, 0, 0], [0, 0, PI / 2]), '#ffd21f']);
    for (let k = 0; k < 3; k++) P.push([place(new THREE.BoxGeometry(0.075, 0.2, 0.025), [s * 0.36, 0, 0], [k * PI / 3, 0, 0]), '#e2a868']);
  }
  return merged(P);
}

function starGeo() {
  const sh = new THREE.Shape();
  for (let k = 0; k < 10; k++) {
    const r = k % 2 ? 0.45 : 1, a = (k / 10) * PI * 2 + PI / 2;
    if (k === 0) sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); else sh.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const P = [];
  for (let k = 0; k < 4; k++) {
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: false });
    g.center();
    g.scale(0.07, 0.07, 0.07);
    const a = (k / 4) * PI * 2;
    g.translate(Math.cos(a) * 0.28, (k % 2) * 0.04, Math.sin(a) * 0.28);
    P.push([g, k % 2 ? '#ffffff' : '#ffd21f']);
  }
  return merged(P);
}

function ringMaterial(color) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { fill: { value: 0 }, color: { value: new THREE.Color(color) }, alpha: { value: 0 }, pulse: { value: 0 } },
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float fill; uniform vec3 color; uniform float alpha; uniform float pulse; varying vec2 vP;
      void main(){
        float a = atan(vP.x, vP.y) / 6.2831853 + 0.5;   // 0..1 round from the back
        float on = step(a, fill);
        vec3 c = mix(vec3(1.0), color, on);
        c = mix(c, vec3(1.0), pulse * on * 0.6);
        gl_FragColor = vec4(c, alpha * mix(0.3, 0.95, on));
      }`,
  });
}

function tagTexture(text, color) {
  return canvasTex(256, 96, (g, w, h) => {
    g.fillStyle = INK;
    g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 38); g.fill();
    g.fillStyle = color;
    g.beginPath(); g.roundRect(14, 14, w - 28, h - 28, 30); g.fill();
    g.font = '900 54px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 8; g.strokeStyle = INK; g.strokeText(text, w / 2, h / 2 + 3);
    g.fillStyle = '#ffffff'; g.fillText(text, w / 2, h / 2 + 3);
  });
}

export function createCart({ animal = 'cow', color = '#ff3b30', tag = '' } = {}) {
  const A = LOOK[animal] || LOOK.cow;
  const root = new THREE.Group();
  root.name = `cart-${animal}`;
  const owned = [];   // per-cart materials / textures to dispose
  const fresh = (c, o = {}) => { const m = toon(c, { ...o, fresh: true }); owned.push(m); return m; };

  const body = new THREE.Group();
  root.add(body);
  const vc = toon('#ffffff', { vc: true });
  const cartM = mesh(cartGeo(), vc);
  body.add(cartM);
  outline(cartM, 0.025);
  const bumperMat = fresh(color, { emissive: color, emissiveIntensity: 0 });
  const bumper = mesh(new THREE.TorusGeometry(0.43, 0.12, 12, 40), bumperMat);
  bumper.rotation.x = PI / 2;
  bumper.position.y = 0.2;
  body.add(bumper);
  outline(bumper, 0.02);
  const wheelGeo = wheelPairGeo();
  const axles = [-0.24, 0.24].map((z) => { const m = mesh(wheelGeo, vc); m.position.set(0, 0.13, z); body.add(m); return m; });

  // pennant on a springy pole
  const pole = new THREE.Group();
  pole.position.set(0.22, 0.5, -0.3);
  body.add(pole);
  pole.add(mesh(place(new THREE.CylinderGeometry(0.015, 0.02, 1.0, 6), [0, 0.5, 0]), toon('#8a5a2e'), { cast: false }));
  const flagMat = fresh(color, { side: THREE.DoubleSide });
  const flagShape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(0, -0.22), new THREE.Vector2(-0.42, -0.11)]);
  const flag = mesh(new THREE.ShapeGeometry(flagShape), flagMat, { cast: false });
  flag.position.y = 0.98;
  flag.rotation.y = PI / 2;
  pole.add(flag);
  pole.add(mesh(place(new THREE.SphereGeometry(0.035, 8, 6), [0, 1.01, 0]), toon('#ffd21f'), { cast: false }));

  // rider
  const rider = new THREE.Group();
  rider.position.set(0, 0.42, -0.04);
  body.add(rider);
  const torso = mesh(merged([
    [place(new THREE.SphereGeometry(0.22, 16, 10), [0, 0.14, 0], [0, 0, 0], [1, 1.05, 0.9]), color],
    [place(new THREE.TorusGeometry(0.13, 0.04, 6, 16), [0, 0.32, 0], [PI / 2, 0, 0]), '#ffffff'],
  ]), vc);
  rider.add(torso);
  const head = new THREE.Group();
  head.position.set(0, 0.55, 0.02);
  rider.add(head);
  const skull = mesh(new THREE.SphereGeometry(0.26, 20, 14), toon(A.skull));
  skull.scale.set(1.04, 0.96, 0.96);
  head.add(skull);
  outline(skull, 0.02);
  head.add(mesh(featureGeo(animal), vc, { cast: false }));
  const armGeo = merged([
    [place(new THREE.CapsuleGeometry(0.055, 0.22, 4, 8), [0, -0.14, 0]), A.fur],
    [place(new THREE.SphereGeometry(0.07, 10, 8), [0, -0.3, 0]), A.hand],
  ]);
  const arms = [-1, 1].map((s) => {
    const g = new THREE.Group();
    g.position.set(s * 0.2, 0.3, 0.02);
    g.add(mesh(armGeo, vc));
    rider.add(g);
    return { g, s };
  });
  const stars = mesh(starGeo(), toon('#ffffff', { vc: true, emissive: '#ffd21f', emissiveIntensity: 0.6 }), { cast: false });
  stars.position.y = 0.95;
  stars.visible = false;
  rider.add(stars);

  // charge ring on the floor (not leaning)
  const ringMat = ringMaterial(color);
  owned.push(ringMat);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.8, 48), ringMat);
  ring.rotation.x = -PI / 2;
  ring.position.y = 0.025;
  ring.renderOrder = 3;
  root.add(ring);

  // name tag
  let tagSprite = null;
  if (tag) {
    const tex = tagTexture(tag, color);
    const sm = new THREE.SpriteMaterial({ map: tex, depthWrite: false, transparent: true });
    owned.push(sm, tex);
    tagSprite = new THREE.Sprite(sm);
    tagSprite.scale.set(0.62, 0.23, 1);
    tagSprite.position.y = 1.75;
    tagSprite.renderOrder = 5;
    root.add(tagSprite);
  }


  // ── animation state ──
  const st = {
    mode: 'play', spot: new THREE.Vector3(), rank: 0, t: 0,
    pvx: 0, pvz: 0, ax: 0, az: 0, pitch: 0, roll: 0, pv: 0, rv: 0,
    poleX: 0, poleZ: 0, poleVX: 0, poleVZ: 0,
    prevState: null, dropT: 1, stretch: 0, fallYaw: 0, wheel: 0, stunSpin: 0, yaw: 0, init: false,
  };

  function update(dt, c, ctx = {}) {
    st.t += dt;
    const t = st.t;
    if (st.mode === 'hidden' || !c) { root.visible = false; return; }
    root.visible = true;

    if (st.mode === 'podium') {
      root.position.copy(st.spot);
      st.yaw = damp(st.yaw, 0, 6, dt);
      root.rotation.set(0, st.yaw, 0);
      const hop = st.rank === 0 ? Math.abs(Math.sin(t * 6)) * 0.18 : st.rank < 3 ? Math.abs(Math.sin(t * 4 + st.rank)) * 0.06 : 0;
      body.position.set(0, hop, 0);
      body.rotation.set(0, 0, Math.sin(t * 3) * (st.rank === 0 ? 0.08 : 0.03));
      body.scale.set(1, 1, 1);
      body.visible = true;
      rider.rotation.set(0, 0, 0);
      head.rotation.set(st.rank > 2 ? 0.35 : -0.15, Math.sin(t * 2) * 0.3, 0);
      for (const a of arms) {
        if (st.rank === 0) { a.g.rotation.set(-2.9 + Math.sin(t * 8 + a.s) * 0.3, 0, a.s * 0.3); }
        else if (st.rank < 3) { a.g.rotation.set(a.s > 0 ? -2.6 + Math.sin(t * 6) * 0.4 : -0.9, 0, 0); }
        else a.g.rotation.set(-0.3, 0, a.s * 0.1);
      }
      stars.visible = false;
      ringMat.uniforms.alpha.value = 0;
      if (tagSprite) tagSprite.visible = false;
      springPole(dt, 0, 0);
      flag.rotation.z = Math.sin(t * 7) * 0.15;
      return;
    }

    const state = c.state;
    if (!st.init) { st.init = true; st.yaw = PI / 2 - c.facing; st.pvx = c.vx; st.pvz = c.vz; }
    if (st.prevState === 'out' && state !== 'out' && state !== 'fall') st.dropT = 0;
    st.prevState = state;

    // acceleration (smoothed)
    const idt = dt > 1e-5 ? 1 / dt : 0;
    st.ax = damp(st.ax, (c.vx - st.pvx) * idt, 12, dt);
    st.az = damp(st.az, (c.vz - st.pvz) * idt, 12, dt);
    st.pvx = c.vx; st.pvz = c.vz;

    // yaw follows the sim facing (stun adds a wobble spin)
    const targetYaw = PI / 2 - c.facing;
    st.yaw += wrapPi(targetYaw - st.yaw) * (1 - Math.exp(-20 * dt));
    st.stunSpin = state === 'stun' ? st.stunSpin + dt * 9 : damp(st.stunSpin, Math.round(st.stunSpin / (2 * PI)) * 2 * PI, 8, dt);
    const yaw = st.yaw + (state === 'stun' ? Math.sin(st.stunSpin) * 0.35 : 0);

    // forward / right in world for this yaw
    const fx = Math.sin(yaw), fz = Math.cos(yaw);
    const rx = Math.cos(yaw), rz = -Math.sin(yaw);   // local +x
    const aF = st.ax * fx + st.az * fz, aR = st.ax * rx + st.az * rz;
    const spF = c.vx * fx + c.vz * fz;

    // lean: spring toward the accel lean
    const tp = clamp(-aF * 0.012, -0.22, 0.22), tr = clamp(-aR * 0.012, -0.25, 0.25);
    st.pv += ((tp - st.pitch) * 120 - st.pv * 12) * dt; st.pitch += st.pv * dt;
    st.rv += ((tr - st.roll) * 120 - st.rv * 12) * dt; st.roll += st.rv * dt;

    let y = 0, px = c.x, pz = c.z, tumbleX = 0, tumbleZ = 0;
    if (state === 'fall') {
      const k = clamp(c.fallT / MATCH.fallTime, 0, 1);
      y = 0.25 * Math.sin(k * PI * 0.6) - (0.25 - ARENA.mudY + 0.15) * k * k;
      const d = Math.hypot(c.x, c.z) || 1;
      // tumble outward
      const ox = c.x / d, oz = c.z / d;
      const lx = ox * rx + oz * rz, lz = ox * fx + oz * fz;
      tumbleX = lz * k * 1.4; tumbleZ = -lx * k * 1.4;
    } else if (state === 'out') {
      y = ARENA.mudY - 0.4;
    }
    if (st.dropT < 1) {
      st.dropT = Math.min(1, st.dropT + dt / 0.45);
      const k = st.dropT;
      y += 5 * (1 - k) * (1 - k);
    }
    root.position.set(px, y, pz);
    root.rotation.set(0, yaw, 0);
    body.rotation.set(st.pitch + tumbleX, 0, st.roll + tumbleZ, 'XZY');
    root.visible = state !== 'out';

    // squash on landing, dash stretch, charge shake
    let sx = 1, sy = 1, sz = 1, shx = 0, shz = 0;
    st.stretch = damp(st.stretch, state === 'dash' ? 1 : 0, state === 'dash' ? 25 : 8, dt);
    sz += 0.24 * st.stretch; sx -= 0.1 * st.stretch; sy -= 0.08 * st.stretch;
    const ch = state === 'charge' ? c.charge : 0;
    if (ch > 0) { shx = (Math.random() - 0.5) * 0.06 * ch; shz = (Math.random() - 0.5) * 0.06 * ch; sy -= 0.06 * ch; sx += 0.03 * ch; }
    if (st.dropT > 0.85 && st.dropT < 1) { const q = Math.sin(((st.dropT - 0.85) / 0.15) * PI); sy -= 0.2 * q; sx += 0.12 * q; sz += 0.12 * q; }
    body.scale.set(sx, sy, sz);
    body.position.set(shx, 0, shz);

    // rider pose
    rider.rotation.x = damp(rider.rotation.x, state === 'dash' ? 0.35 : -0.3 * ch + clamp(spF * 0.02, -0.1, 0.1), 10, dt);
    head.rotation.set(state === 'stun' ? Math.sin(t * 14) * 0.2 : 0, state === 'stun' ? Math.sin(t * 11) * 0.4 : 0, state === 'stun' ? Math.sin(t * 9) * 0.25 : st.roll * -0.8);
    for (const a of arms) {
      if (state === 'stun' || state === 'fall') a.g.rotation.set(-2.6 + Math.sin(t * 15 + a.s * 2) * 0.5, 0, a.s * (0.5 + Math.sin(t * 13) * 0.3));
      else if (state === 'charge') a.g.rotation.set(-1.0 + Math.sin(t * 30) * 0.08 * ch, 0, a.s * 0.2);
      else a.g.rotation.set(-1.2, 0, a.s * 0.25);
    }
    stars.visible = state === 'stun';
    if (stars.visible) stars.rotation.y += dt * 6;

    // wheels
    st.wheel += spF * dt / 0.13;
    for (const ax of axles) ax.rotation.x = st.wheel;

    // pennant spring
    springPole(dt, -st.ax * 0.004, -st.az * 0.004, yaw);
    flag.rotation.z = Math.sin(t * (6 + Math.hypot(c.vx, c.vz))) * 0.18;

    // charge ring + bumper glow
    const ringOn = state === 'charge' || state === 'dash';
    const u = ringMat.uniforms;
    u.alpha.value = damp(u.alpha.value, ringOn && state !== 'out' ? 1 : 0, 14, dt);
    if (state === 'charge') u.fill.value = c.charge;
    u.pulse.value = c.charge >= 1 && state === 'charge' ? 0.5 + 0.5 * Math.sin(t * 25) : 0;
    bumperMat.emissiveIntensity = damp(bumperMat.emissiveIntensity, state === 'charge' ? 0.25 + 0.5 * c.charge : state === 'dash' ? 0.6 : 0, 12, dt);

    // safe blink
    const blink = c.safeT > 0 && Math.floor(t * 12) % 2 === 0;
    body.visible = !blink;
    if (tagSprite) tagSprite.visible = state !== 'fall' && state !== 'out' && ctx.tags !== false;
  }

  function springPole(dt, wx, wz, yaw = 0) {
    // world push -> local lean of the pole
    const lx = wx * Math.cos(yaw) - wz * Math.sin(yaw), lz = wx * Math.sin(yaw) + wz * Math.cos(yaw);
    st.poleVX += ((clamp(lz, -0.6, 0.6) - st.poleX) * 90 - st.poleVX * 5) * dt;
    st.poleVZ += ((clamp(-lx, -0.6, 0.6) - st.poleZ) * 90 - st.poleVZ * 5) * dt;
    st.poleX += st.poleVX * dt; st.poleZ += st.poleVZ * dt;
    pole.rotation.set(st.poleX, 0, st.poleZ);
  }

  function setMode(mode, opts = {}) {
    st.mode = mode;
    if (opts.spot) st.spot.copy(opts.spot);
    if (opts.rank != null) st.rank = opts.rank;
    if (mode === 'play') { st.init = false; st.dropT = 1; }
    if (mode === 'podium') st.yaw = root.rotation.y;
  }

  return {
    root, animal, color,
    update, setMode,
    get mode() { return st.mode; },
    /** Bumper front point in world space. */
    frontWorld(out = new THREE.Vector3()) { return body.localToWorld(out.set(0, 0.25, 0.5)); },
    headWorld(out = new THREE.Vector3()) { return head.localToWorld(out.set(0, 0.1, 0)); },
    centerWorld(out = new THREE.Vector3()) { return root.localToWorld(out.set(0, 0.3, 0)); },
    dropping() { return st.dropT < 1; },
    dispose() {
      root.removeFromParent();
      root.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      for (const m of owned) m.dispose();
    },
  };
}

