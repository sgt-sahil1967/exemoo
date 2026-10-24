// Track, scenery, obstacle spawning and collision queries.
// The player stays at z = 0; the world scrolls toward +z.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { TRAIN_H, CAR_LEN, CAR_GAP, RAMP_LEN } from './assets.js';

export const LANE_X = [-2.5, 0, 2.5];
const SPAWN_Z = -150;
const DESPAWN_Z = 25;
const SEG_LEN = 20;
const SEG_COUNT = 10;
const STEP_UP = 0.8;
const MOVING_EXTRA = 11;

const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export class World {
  constructor(scene, assets) {
    this.scene = scene;
    this.A = assets;
    this.root = new THREE.Group();
    scene.add(this.root);
    this.objects = [];
    this.coins = [];
    this.powerups = [];
    this.buildTrack();
    this.buildScenery();
    this.reset();
  }

  // ---------- static track ----------
  buildTrack() {
    const { mat } = this.A;
    const bed = new THREE.Mesh(new THREE.PlaneGeometry(13, 240), mat.gravel);
    bed.rotation.x = -Math.PI / 2;
    bed.position.set(0, 0, -100);
    bed.receiveShadow = true;
    mat.gravel.map.repeat.set(1, 240 / 4);
    this.scene.add(bed);
    this.bedTex = mat.gravel.map;

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.02, -120);
    ground.receiveShadow = true;
    this.scene.add(ground);

    const railGeo = new THREE.BoxGeometry(0.1, 0.14, 240);
    for (const lx of LANE_X) for (const off of [-0.72, 0.72]) {
      const r = new THREE.Mesh(railGeo, mat.rail);
      r.position.set(lx + off, 0.07, -100);
      r.receiveShadow = true;
      this.scene.add(r);
    }
  }

  buildScenery() {
    const { mat, rand, pick } = this.A;
    this.segments = [];
    const wallGeo = new THREE.BoxGeometry(0.5, 2.6, SEG_LEN);
    const capGeo = new THREE.BoxGeometry(0.7, 0.2, SEG_LEN);
    const poleGeo = new THREE.CylinderGeometry(0.07, 0.09, 5.5, 8);
    const armGeo = new THREE.BoxGeometry(1.1, 0.08, 0.08);
    const bulbGeo = new THREE.BoxGeometry(0.4, 0.12, 0.25);
    const gantryLeg = new THREE.BoxGeometry(0.3, 7, 0.3);
    const gantryBeam = new THREE.BoxGeometry(14.5, 0.4, 0.4);
    const wireGeo = new THREE.BoxGeometry(0.03, 0.03, SEG_LEN);

    for (let i = 0; i < SEG_COUNT; i++) {
      const seg = new THREE.Group();
      seg.position.z = -i * SEG_LEN;
      for (const side of [-1, 1]) {
        const wall = new THREE.Mesh(wallGeo, pick(mat.walls));
        wall.position.set(side * 7.1, 1.3, -SEG_LEN / 2);
        wall.receiveShadow = true;
        seg.add(wall);
        const cap = new THREE.Mesh(capGeo, mat.concrete); cap.position.set(side * 7.1, 2.65, -SEG_LEN / 2); seg.add(cap);

        const pole = new THREE.Mesh(poleGeo, mat.post); pole.position.set(side * 6.5, 2.75, -4); seg.add(pole);
        const arm = new THREE.Mesh(armGeo, mat.post); arm.position.set(side * 6.0, 5.45, -4); seg.add(arm);
        const bulb = new THREE.Mesh(bulbGeo, mat.bulb); bulb.position.set(side * 5.55, 5.35, -4); seg.add(bulb);

        // two rows of buildings, random heights
        for (let b = 0; b < 2; b++) {
          const h = rand(7, 22), w = rand(5, 9), d = rand(6, 9);
          const tex = pick(mat.buildings).clone();
          tex.needsUpdate = true;
          tex.repeat.set(Math.round(d / 3), Math.round(h / 4));
          const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 });
          const bld = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
          bld.position.set(side * (11 + w / 2 + b * 7), h / 2, -SEG_LEN / 2 + rand(-4, 4));
          seg.add(bld);
        }
      }
      if (i % 2 === 0) {
        for (const side of [-1, 1]) { const leg = new THREE.Mesh(gantryLeg, mat.dark); leg.position.set(side * 7.4, 3.5, -12); seg.add(leg); }
        const beam = new THREE.Mesh(gantryBeam, mat.dark); beam.position.set(0, 6.9, -12); seg.add(beam);
      }
      for (const lx of LANE_X) { const wire = new THREE.Mesh(wireGeo, mat.dark); wire.position.set(lx, 6.6, -SEG_LEN / 2); seg.add(wire); }
      this.scene.add(seg);
      this.segments.push(seg);
    }
  }

  // ---------- lifecycle ----------
  reset() {
    for (const o of this.objects) this.root.remove(o.group);
    for (const c of this.coins) this.root.remove(c.mesh);
    for (const p of this.powerups) this.root.remove(p.group);
    this.objects = []; this.coins = []; this.powerups = [];
    this.travel = 0;
    this.laneBusy = [-999, -999, -999];
    this.laneQuiet = [999, 999, 999];
    this.sinceTrainEnd = 999;
    this.sincePowerup = 0;
    // pre-populate ahead of the player, leaving a short clear run-up
    const gap = this.rowGap(16);
    for (let z = -55; z > SPAWN_Z; z -= gap) {
      this.spawnRow(z);
      this.advanceSpawner(gap);
    }
    this.toNextRow = gap;
  }

  rowGap(speed) { return 20 + speed * 0.3; }

  advanceSpawner(d) {
    for (let l = 0; l < 3; l++) { this.laneBusy[l] -= d; this.laneQuiet[l] += d; }
    this.sincePowerup += d;
  }

  // ---------- spawning ----------
  spawnRow(z) {
    const diff = Math.min(1, this.travel / 2500);
    const busy = [0, 1, 2].map((l) => this.laneBusy[l] > 0);
    let trainsAllowed = 2 - busy.filter(Boolean).length;
    const allClearAhead = Math.max(...this.laneBusy) < -70;
    const content = [null, null, null];
    let movingPlaced = false;

    for (const l of shuffle([0, 1, 2])) {
      if (busy[l]) continue;
      const opts = [
        ['empty', 0.34 - 0.14 * diff],
        ['hurdle', 0.17],
        ['overhead', 0.13 + 0.03 * diff],
      ];
      if (trainsAllowed > 0) {
        opts.push(['train', 0.18 + 0.1 * diff], ['ramp', 0.12]);
        if (!movingPlaced && diff > 0.15 && allClearAhead && this.laneQuiet[l] > 90) opts.push(['moving', 0.12 * diff]);
      }
      let r = Math.random() * opts.reduce((s, o) => s + o[1], 0), type = 'empty';
      for (const [t, w] of opts) { if ((r -= w) <= 0) { type = t; break; } }
      if (type === 'train' || type === 'ramp' || type === 'moving') trainsAllowed--;
      if (type === 'moving') movingPlaced = true;
      content[l] = type;
    }
    // a moving train must have the other lanes clear of trains for this row
    if (movingPlaced) for (let l = 0; l < 3; l++) if (content[l] === 'train' || content[l] === 'ramp') content[l] = 'empty';

    for (let l = 0; l < 3; l++) {
      const t = content[l];
      if (!t || t === 'empty') continue;
      this.laneQuiet[l] = 0;
      if (t === 'hurdle') this.addSimple(l, z, 'hurdle');
      else if (t === 'overhead') this.addSimple(l, z, 'overhead');
      else {
        const cars = t === 'moving' ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * (2 + diff * 2));
        const len = this.addTrain(l, z, cars, t);
        this.laneBusy[l] = len + 4 + (t === 'ramp' ? RAMP_LEN : 0);
      }
    }

    this.placeCoins(z, content, busy);
  }

  addSimple(lane, z, kind) {
    const group = kind === 'hurdle' ? this.A.makeHurdle() : this.A.makeOverhead();
    const box = kind === 'hurdle'
      ? { x0: -1.1, x1: 1.1, y0: 0, y1: 1.05, z0: -0.15, z1: 0.15 }
      : { x0: -1.1, x1: 1.1, y0: 1.2, y1: 3.4, z0: -0.2, z1: 0.2 };
    this.addObject({ group, lane, z, kind, boxes: [box], minZ: -0.3, maxZ: 0.3, vz: 0 });
  }

  addTrain(lane, z, cars, type) {
    const { group, length } = this.A.makeTrain(cars, { moving: type === 'moving' });
    const boxes = [];
    for (let i = 0; i < cars; i++) {
      const z1 = -i * (CAR_LEN + CAR_GAP);
      boxes.push({ x0: -1.15, x1: 1.15, y0: 0, y1: TRAIN_H, z0: z1 - CAR_LEN - (i < cars - 1 ? CAR_GAP : 0), z1, walk: true });
    }
    let maxZ = 0.3;
    if (type === 'ramp') {
      group.add(this.A.makeRamp());
      boxes.push({ x0: -1.1, x1: 1.1, y0: 0, y1: TRAIN_H, z0: 0, z1: RAMP_LEN, walk: true, ramp: true });
      maxZ = RAMP_LEN;
    }
    this.addObject({ group, lane, z, kind: type, boxes, minZ: -length, maxZ, vz: type === 'moving' ? MOVING_EXTRA : 0 });
    return length;
  }

  addObject(o) {
    o.x = LANE_X[o.lane];
    o.group.position.set(o.x, 0, o.z);
    this.root.add(o.group);
    this.objects.push(o);
  }

  addCoin(x, y, z, vz = 0) {
    const mesh = this.A.makeCoin();
    mesh.position.set(x, y, z);
    this.root.add(mesh);
    this.coins.push({ mesh, vz, magnet: false, baseY: y, phase: z * 0.35 });
  }

  placeCoins(z, content, busy) {
    // optionally a power-up in a clear lane instead of coins there
    const clear = [0, 1, 2].filter((l) => !busy[l] && (content[l] === 'empty' || content[l] === null));
    if (this.sincePowerup > 380 && clear.length && Math.random() < 0.35) {
      const l = this.A.pick(clear);
      const type = this.A.pick(['magnet', 'double', 'sneakers']);
      const group = this.A.makePowerup(type);
      group.position.set(LANE_X[l], 1.2, z - 9);
      this.root.add(group);
      this.powerups.push({ group, type });
      this.sincePowerup = 0;
      clear.splice(clear.indexOf(l), 1);
    }
    if (Math.random() < 0.25) return;

    const candidates = [0, 1, 2].filter((l) => !busy[l]);
    if (!candidates.length) return;
    const l = this.A.pick(candidates);
    const x = LANE_X[l];
    const t = content[l];
    if (t === 'hurdle') {
      for (let i = -3; i <= 3; i++) { const dz = i * 1.8; this.addCoin(x, 0.9 + 1.9 * (1 - (dz / 6) ** 2), z + dz); }
    } else if (t === 'overhead') {
      for (let i = -3; i <= 3; i++) this.addCoin(x, 0.5, z + i * 2.2);
    } else if (t === 'ramp') {
      for (let i = 0; i < 4; i++) { const dz = RAMP_LEN - 1 - i * 1.6; this.addCoin(x, 0.9 + TRAIN_H * (1 - dz / RAMP_LEN), z + dz); }
      for (let i = 0; i < 8; i++) this.addCoin(x, TRAIN_H + 0.9, z - 1.5 - i * 2.4);
    } else if (t === 'train') {
      // coins on the roof of a plain train reward hopping across from a ramp
      for (let i = 0; i < 5; i++) this.addCoin(x, TRAIN_H + 0.9, z - 2 - i * 2.4);
    } else if (t !== 'moving') {
      for (let i = 0; i < 7; i++) this.addCoin(x, 0.9, z - 2 - i * 2.4);
    }
  }

  // ---------- per-frame ----------
  update(dt, speed, time) {
    const d = speed * dt;
    this.travel += d;
    this.bedTex.offset.y += d / 4;
    // scrolling chevrons on barriers and ramps
    this.A.mat.overhead.map.offset.x = (this.A.mat.overhead.map.offset.x + dt * 0.6) % 1;
    this.A.mat.arrows.map.offset.y = (this.A.mat.arrows.map.offset.y - dt * 1.8) % 1;
    for (const s of this.segments) {
      s.position.z += d;
      if (s.position.z > DESPAWN_Z) s.position.z -= SEG_LEN * SEG_COUNT;
    }

    this.toNextRow -= d;
    this.advanceSpawner(d);
    if (this.toNextRow <= 0) {
      this.spawnRow(SPAWN_Z - this.toNextRow);
      this.toNextRow += this.rowGap(speed);
    }

    for (let i = this.objects.length - 1; i >= 0; i--) {
      const o = this.objects[i];
      o.z += d + o.vz * dt;
      o.group.position.z = o.z;
      if (o.group.userData.tick && o.z > SPAWN_Z * 0.8) o.group.userData.tick(dt, time);
      if (o.z + o.minZ > DESPAWN_Z) { this.root.remove(o.group); this.objects.splice(i, 1); }
    }
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (!c.magnet) {
        c.mesh.position.z += d;
        c.mesh.position.y = c.baseY + Math.sin(time * 5 + c.phase) * 0.1;
      }
      c.mesh.rotation.y += dt * (c.magnet ? 14 : 4);
      if (c.mesh.position.z > DESPAWN_Z) { this.root.remove(c.mesh); this.coins.splice(i, 1); }
    }
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.group.position.z += d;
      p.group.position.y = 1.2 + Math.sin(time * 3 + i) * 0.15;
      p.group.userData.icon.rotation.y += dt * 2.5;
      p.group.userData.bubble.scale.setScalar(1 + Math.sin(time * 7 + i) * 0.07);
      p.group.userData.bubble.rotation.y -= dt;
      if (p.group.position.z > DESPAWN_Z) { this.root.remove(p.group); this.powerups.splice(i, 1); }
    }
  }

  // Ground height under the player and any hit against the player box.
  // p: { x, prevX, y, h } ; player occupies z in [-0.3, 0.3]
  collide(p) {
    let ground = 0, hit = null;
    const hw = 0.35;
    for (const o of this.objects) {
      const lz = -o.z;
      if (lz < o.minZ - 1 || lz > o.maxZ + 1) continue;
      for (const b of o.boxes) {
        const bx0 = o.x + b.x0, bx1 = o.x + b.x1;
        if (p.x + hw <= bx0 || p.x - hw >= bx1) continue;
        if (lz + 0.3 < b.z0 || lz - 0.3 > b.z1) continue;
        const wasInLane = p.prevX + hw > bx0 && p.prevX - hw < bx1;
        if (b.walk) {
          let top = b.y1;
          if (b.ramp) top = b.y0 + (b.y1 - b.y0) * Math.min(1, Math.max(0, (b.z1 - lz) / (b.z1 - b.z0)));
          if (p.y >= top - STEP_UP) { ground = Math.max(ground, top); continue; }
          hit = { type: wasInLane ? 'front' : 'side', obj: o };
        } else if (p.y + p.h > b.y0 && p.y < b.y1) {
          hit = { type: wasInLane ? 'front' : 'side', obj: o };
        }
      }
    }
    return { ground, hit };
  }
}
