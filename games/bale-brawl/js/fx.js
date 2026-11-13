// Bale Brawl - pooled particles (instanced): hay puffs, straw bits, impact stars, water droplets, foam,
// splash crowns, drips; plus camera shake. Five draw calls in total.
import * as THREE from 'three';
import { toon, gradientMap } from './world/toon.js';
import { ARENA } from './constants.js';

const PI = Math.PI;
const rand = (a, b) => a + Math.random() * (b - a);

function starGeometry() {
  const s = new THREE.Shape();
  for (let k = 0; k < 10; k++) {
    const r = k % 2 ? 0.45 : 1, a = (k / 10) * PI * 2 + PI / 2;
    if (k === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r); else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.25, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 1 });
  g.center();
  return g;
}

class Pool {
  constructor(scene, geo, mat, n, { shadow = false } = {}) {
    this.im = new THREE.InstancedMesh(geo, mat, n);
    this.im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.im.castShadow = shadow;
    this.im.frustumCulled = false;
    this.im.count = 0;
    this.im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
    scene.add(this.im);
    this.n = n;
    this.ps = [];
    this.next = 0;
  }
  spawn(p) {
    if (this.ps.length >= this.n) this.ps.shift();
    p.age = 0;
    p.rot = p.rot || new THREE.Euler(rand(0, PI), rand(0, PI), rand(0, PI));
    p.spin = p.spin || new THREE.Vector3(rand(-6, 6), rand(-6, 6), rand(-6, 6));
    p.color = new THREE.Color(p.color || '#ffffff');
    this.ps.push(p);
    return p;
  }
  update(dt, camera) {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3();
    let i = 0;
    const alive = [];
    for (const p of this.ps) {
      p.age += dt;
      if (p.age >= p.life) continue;
      p.vel.y -= (p.g ?? 9.8) * dt;
      p.vel.multiplyScalar(Math.exp(-(p.drag ?? 0) * dt));
      p.pos.addScaledVector(p.vel, dt);
      if (p.floor != null && p.pos.y < p.floor) {
        if (p.onFloor) p.onFloor(p);
        p.pos.y = p.floor; p.vel.set(p.vel.x * 0.4, Math.abs(p.vel.y) * (p.bounce ?? 0), p.vel.z * 0.4);
      }
      p.rot.x += p.spin.x * dt; p.rot.y += p.spin.y * dt; p.rot.z += p.spin.z * dt;
      const k = p.age / p.life;
      let sc = p.size;
      if (p.grow) sc *= 1 + p.grow * k;
      if (p.pop) sc *= k < 0.15 ? k / 0.15 : 1;
      sc *= p.fade === false ? 1 : k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      if (p.billboard && camera) q.copy(camera.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), p.rot.z));
      else q.setFromEuler(p.rot);
      s.set(sc * (p.sx || 1), sc * (p.sy || 1), sc * (p.sz || 1));
      m4.compose(p.pos, q, s);
      this.im.setMatrixAt(i, m4);
      this.im.instanceColor.setXYZ(i, p.color.r, p.color.g, p.color.b);
      i++;
      alive.push(p);
    }
    this.ps = alive;
    this.im.count = i;
    this.im.instanceMatrix.needsUpdate = true;
    this.im.instanceColor.needsUpdate = true;
  }
  clear() { this.ps = []; this.im.count = 0; }
}

export function createFx(scene) {
  const white = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap });
  const glow = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const puffs = new Pool(scene, new THREE.IcosahedronGeometry(1, 1), white, 160);
  const bits = new Pool(scene, new THREE.BoxGeometry(0.035, 0.012, 0.16), toon('#ffffff', { fresh: true }), 260, { shadow: false });
  const stars = new Pool(scene, starGeometry(), glow, 40);
  const drops = new Pool(scene, new THREE.IcosahedronGeometry(1, 0), new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap }), 260);
  const crownGeo = new THREE.CylinderGeometry(1.25, 0.55, 1, 24, 1, true);
  crownGeo.translate(0, 0.5, 0);
  {
    // jagged, splashy top rim
    const p = crownGeo.attributes.position;
    for (let i = 0; i < p.count; i++) if (p.getY(i) > 0.5) p.setY(i, 0.55 + Math.abs(Math.sin(i * 2.7)) * 0.6);
    crownGeo.computeVertexNormals();
  }
  const crowns = new Pool(scene, crownGeo, new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap, side: THREE.DoubleSide }), 8);
  const pools = [puffs, bits, stars, drops, crowns];

  let shakeAmp = 0, shakeT = 0;
  const shakeOff = new THREE.Vector3();

  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  function hayPuff(pos, n = 12, power = 1) {
    for (let k = 0; k < n; k++) {
      puffs.spawn({ pos: pos.clone().add(V(rand(-0.15, 0.15), rand(-0.1, 0.15), rand(-0.15, 0.15))),
        vel: V(rand(-1.5, 1.5), rand(0.3, 1.8), rand(-1.5, 1.5)).multiplyScalar(power), g: -0.5, drag: 3.5,
        size: rand(0.08, 0.16), grow: 1.4, life: rand(0.5, 0.9), color: Math.random() < 0.5 ? '#ffe7a3' : '#f2c45a' });
    }
    for (let k = 0; k < n * 2; k++) {
      bits.spawn({ pos: pos.clone(), vel: V(rand(-3, 3), rand(1, 4), rand(-3, 3)).multiplyScalar(power), g: 7, drag: 1.2,
        size: rand(0.8, 1.3), life: rand(0.7, 1.3), color: Math.random() < 0.5 ? '#f2c45a' : '#d9a43c', floor: 0.01, bounce: 0.1 });
    }
  }

  function impact(pos, power = 1, color = '#ffd21f') {
    for (let k = 0; k < 3 + Math.round(power * 3); k++) {
      const a = rand(0, PI * 2);
      stars.spawn({ pos: pos.clone(), vel: V(Math.cos(a) * rand(1.5, 3.5), rand(0.5, 3), Math.sin(a) * rand(1.5, 3.5)), g: 3, drag: 4,
        size: rand(0.07, 0.12) * (0.8 + power * 0.6), life: rand(0.35, 0.6), color: k % 3 === 2 ? '#ffffff' : color, billboard: true, pop: true,
        spin: V(0, 0, rand(-8, 8)) });
    }
    puffs.spawn({ pos: pos.clone(), vel: V(0, 0, 0), g: 0, size: 0.12 + power * 0.12, grow: 2.5, life: 0.18, color: '#ffffff' });
  }

  function blockSpark(pos) {
    for (let k = 0; k < 8; k++) {
      const a = rand(0, PI * 2);
      stars.spawn({ pos: pos.clone(), vel: V(Math.cos(a) * rand(2, 4), Math.sin(a) * rand(2, 4), rand(-1, 1)), g: 2, drag: 5,
        size: rand(0.05, 0.08), life: rand(0.25, 0.4), color: k % 2 ? '#ffffff' : '#9fe3ff', billboard: true, pop: true });
    }
    puffs.spawn({ pos: pos.clone(), vel: V(0, 0, 0), g: 0, size: 0.18, grow: 2, life: 0.15, color: '#e8fbff' });
  }

  function splash(x, z, big = 1) {
    const y = ARENA.waterY;
    crowns.spawn({ pos: V(x, y - 0.1, z), vel: V(0, 0, 0), g: 0, size: 0.55 * big, sy: 1.1, grow: 1.3, life: 0.7, rot: new THREE.Euler(0, 0, 0), spin: V(0, 0.6, 0), color: '#ffffff' });
    for (let k = 0; k < 46 * big; k++) {
      const a = rand(0, PI * 2), r = rand(0.1, 0.6);
      drops.spawn({ pos: V(x + Math.cos(a) * r, y, z + Math.sin(a) * r), vel: V(Math.cos(a) * rand(0.6, 3), rand(3, 7.5) * big, Math.sin(a) * rand(0.6, 3)),
        g: 11, size: rand(0.05, 0.11), life: 1.6, color: Math.random() < 0.6 ? '#bfefff' : '#ffffff', floor: y, onFloor: (p) => { p.life = Math.min(p.life, p.age + 0.05); } });
    }
    for (let k = 0; k < 14 * big; k++) {
      const a = rand(0, PI * 2);
      puffs.spawn({ pos: V(x + Math.cos(a) * 0.5, y + 0.05, z + Math.sin(a) * 0.5), vel: V(Math.cos(a) * rand(0.5, 1.5), rand(0.1, 0.6), Math.sin(a) * rand(0.5, 1.5)),
        g: 0.5, drag: 2, size: rand(0.12, 0.22), grow: 1, life: rand(0.6, 1.1), color: '#ffffff', floor: y });
    }
  }

  function smallSplash(x, z) {
    const y = ARENA.waterY;
    for (let k = 0; k < 14; k++) {
      const a = rand(0, PI * 2);
      drops.spawn({ pos: V(x, y, z), vel: V(Math.cos(a) * rand(0.5, 2), rand(2, 4), Math.sin(a) * rand(0.5, 2)), g: 11,
        size: rand(0.04, 0.08), life: 1, color: '#d9f6ff', floor: y, onFloor: (p) => { p.life = Math.min(p.life, p.age + 0.05); } });
    }
  }

  function drip(pos) {
    drops.spawn({ pos: pos.clone().add(V(rand(-0.25, 0.25), rand(-0.1, 0.2), rand(-0.25, 0.25))), vel: V(0, -0.2, 0), g: 6, size: rand(0.025, 0.04),
      sy: 1.6, life: 0.8, color: '#9fe3ff', floor: pos.y - 1.2, onFloor: (p) => { p.life = Math.min(p.life, p.age + 0.02); } });
  }

  function whoosh(pos, dirVec, color) {
    for (let k = 0; k < 4; k++) {
      puffs.spawn({ pos: pos.clone(), vel: dirVec.clone().multiplyScalar(rand(0.5, 1.5)).add(V(rand(-0.3, 0.3), rand(-0.3, 0.3), rand(-0.3, 0.3))),
        g: 0, drag: 6, size: rand(0.03, 0.06), grow: 0.5, life: 0.25, color: color || '#ffffff' });
    }
  }

  function confetti(pos, n = 60) {
    const cols = ['#ff3b30', '#ffd21f', '#2f7cff', '#2fc65a', '#ffffff', '#ff8a1f'];
    for (let k = 0; k < n; k++) {
      bits.spawn({ pos: pos.clone().add(V(rand(-0.5, 0.5), 0, rand(-0.5, 0.5))), vel: V(rand(-2.5, 2.5), rand(4, 8), rand(-2.5, 2.5)), g: 4, drag: 1.8,
        size: rand(1.3, 2), sx: 2.5, life: rand(1.6, 2.6), color: cols[k % cols.length], floor: ARENA.waterY });
    }
  }

  function shake(amount = 0.1, time = 0.25) { shakeAmp = Math.max(shakeAmp, amount); shakeT = Math.max(shakeT, time); }

  function update(dt, camera) {
    for (const p of pools) p.update(dt, camera);
    if (shakeT > 0) {
      shakeT -= dt;
      const a = shakeAmp * Math.max(0, shakeT) / 0.25;
      shakeOff.set(rand(-a, a), rand(-a, a), rand(-a, a));
      if (shakeT <= 0) { shakeAmp = 0; shakeOff.set(0, 0, 0); }
    } else shakeOff.set(0, 0, 0);
  }

  function clear() { for (const p of pools) p.clear(); shakeAmp = 0; shakeT = 0; shakeOff.set(0, 0, 0); }

  return { hayPuff, impact, blockSpark, splash, smallSplash, drip, whoosh, confetti, shake, update, clear, shakeOffset: shakeOff,
    dispose() { for (const p of pools) { p.im.geometry.dispose(); p.im.removeFromParent(); } } };
}
