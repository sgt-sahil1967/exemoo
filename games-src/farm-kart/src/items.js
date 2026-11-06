// Item boxes, roulette, and the item effects (carrots, eggs, mud pies, bees, clovers).
import * as THREE from 'three';
import { makeItemMesh } from './models.js';
import { rboxGeo } from './geo.js';
import { terrainH, FENCE } from './track.js';

export const ITEMS = {
  carrot:  { name: 'Turbo Carrot' },
  carrot3: { name: 'Carrot Bunch', count: 3 },
  egg:     { name: 'Egg Toss' },
  mud:     { name: 'Mud Pie' },
  bee:     { name: 'Angry Bee' },
  clover:  { name: 'Lucky Clover' },
};
export const ITEM_KEYS = Object.keys(ITEMS);

function weighted(table) {
  let sum = 0; for (const k in table) sum += table[k];
  let r = Math.random() * sum;
  for (const k in table) { r -= table[k]; if (r <= 0) return k; }
  return Object.keys(table)[0];
}

export class Items {
  constructor(game) {
    this.game = game;
    this.boxes = [];
    this.projectiles = [];
    this.hazards = [];
  }

  setTrack(tr) {
    for (const b of this.boxes) this.game.scene.remove(b.m);
    this.boxes = [];
    const T = this.game.T;
    const geo = rboxGeo(2, 2, 2, .3, 3);
    const mat = new THREE.MeshStandardMaterial({ map: T.itemBox, emissiveMap: T.itemBox, transparent: true, opacity: .92, emissive: 0xffffff, emissiveIntensity: .2, roughness: .3 });
    for (const s of tr.itemSpots) {
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = true;
      m.position.set(s.x, s.y + 1.8, s.z);
      this.game.scene.add(m);
      this.boxes.push({ m, x: s.x, z: s.z, y: s.y, active: true, t: 0, ph: Math.random() * 6 });
    }
  }

  reset() {
    for (const b of this.boxes) { b.active = true; b.m.visible = true; b.m.scale.setScalar(1); }
    for (const p of this.projectiles) this.game.scene.remove(p.mesh);
    for (const h of this.hazards) this.game.scene.remove(h.mesh);
    this.projectiles = []; this.hazards = [];
  }

  pick(k) {
    const n = this.game.karts.length;
    const r = n > 1 ? k.rank / (n - 1) : 0; // 0 = leader
    if (k.rank === 0) return weighted({ mud: 45, egg: 40, carrot: 15 });
    if (r < .5) return weighted({ egg: 30, mud: 20, carrot: 25, bee: 12, carrot3: 13 });
    if (r < .8) return weighted({ egg: 15, carrot3: 30, bee: 25, clover: 10, carrot: 20 });
    return weighted({ carrot3: 30, bee: 30, clover: 28, carrot: 12 });
  }

  update(dt, t) {
    const g = this.game;
    const itemsOn = g.S?.items !== false;
    for (const b of this.boxes) {
      if (!itemsOn) { b.m.visible = false; continue; }
      if (b.active) b.m.visible = true;
      b.m.rotation.y += dt * 1.4; b.m.rotation.x = Math.sin(t * 1.3 + b.ph) * .3;
      b.m.position.y = b.y + 1.8 + Math.sin(t * 2 + b.ph) * .25;
      if (!b.active) {
        b.t -= dt;
        if (b.t <= 0) { b.active = true; b.m.visible = true; }
        else if (b.t < .4) { b.m.visible = true; b.m.scale.setScalar(1 - b.t / .4); }
        continue;
      }
      b.m.scale.setScalar(Math.min(1, b.m.scale.x + dt * 3));
      for (const k of g.karts) {
        if ((k.x - b.x) ** 2 + (k.z - b.z) ** 2 < 2.8 ** 2 && Math.abs(k.y - b.y) < 3) {
          b.active = false; b.t = 2.5; b.m.visible = false;
          if (g.fx) g.fx.onItemBox(b.x, b.m.position.y, b.z); else g.particles.burst(b.x, b.y + 1.8, b.z, 14, 0xffffff, 7);
          if (!k.item && k.rollT <= 0) {
            k.pending = this.pick(k); k.rollT = 1.1;
            if (k.isHuman) g.audio.itemGet();
          }
          break;
        }
      }
    }
    // roulette + use
    for (const k of g.karts) {
      if (k.rollT > 0) {
        k.rollT -= dt;
        if (k.rollT <= 0) { k.item = k.pending; k.itemCount = ITEMS[k.item].count || 1; if (k.isHuman) { g.audio.itemReady(); g.phones.buzz(k.player, 30); } }
      }
      const press = k.input.item && !k.itemHeld;
      k.itemHeld = k.input.item;
      if (press && k.item && g.raceOn && k.spinT <= 0) this.use(k);
    }

    // projectiles
    const tr = g.track;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;
      if (p.type === 'egg') {
        p.x += p.vx * dt; p.z += p.vz * dt;
        tr.nearest(p.x, p.z, p.idx, p.n); p.idx = p.n.idx;
        if (Math.abs(p.n.lat) > FENCE - .6) {
          // bounce off fence
          const rx = -tr.tz[p.idx], rz = tr.tx[p.idx], s = Math.sign(p.n.lat);
          const vd = p.vx * rx + p.vz * rz;
          if (vd * s > 0) { p.vx -= 2 * vd * rx; p.vz -= 2 * vd * rz; p.bounces++; }
          p.x -= rx * s * .5; p.z -= rz * s * .5;
          if (p.bounces > 3) p.life = 0;
        }
        p.mesh.rotation.x += dt * 12;
      } else if (p.type === 'bee') {
        const tgt = p.target;
        if (tgt && !tgt.finished) {
          const d = Math.hypot(tgt.x - p.x, tgt.z - p.z);
          let ax, az;
          if (d < 28) { ax = tgt.x; az = tgt.z; }
          else {
            tr.nearest(p.x, p.z, p.idx, p.n); p.idx = p.n.idx;
            const a = tr.at(p.idx + Math.round(10 / tr.seg), 0); ax = a.x; az = a.z;
          }
          const dx = ax - p.x, dz = az - p.z, dl = Math.hypot(dx, dz) || 1;
          p.x += dx / dl * p.speed * dt; p.z += dz / dl * p.speed * dt;
          p.mesh.rotation.y = Math.atan2(dx, dz);
        } else {
          tr.nearest(p.x, p.z, p.idx, p.n); p.idx = p.n.idx;
          const a = tr.at(p.idx + Math.round(10 / tr.seg), 0);
          const dx = a.x - p.x, dz = a.z - p.z, dl = Math.hypot(dx, dz) || 1;
          p.x += dx / dl * p.speed * dt; p.z += dz / dl * p.speed * dt;
        }
        p.mesh.children[0].children.forEach(c => { if (c.name === 'wing') c.rotation.z = Math.sin(t * 60) * .6; });
        if (Math.random() < .3) g.particles.emit(p.x, p.y + 1.2, p.z, 0, .5, 0, 0xffe066, .25, .4);
      }
      p.y = terrainH(p.x, p.z) + (p.type === 'bee' ? 1 + Math.sin(t * 8) * .3 : 0);
      p.mesh.position.set(p.x, p.y, p.z);
      // collisions
      for (const k of g.karts) {
        if (k === p.owner && p.age < .5) continue;
        if ((k.x - p.x) ** 2 + (k.z - p.z) ** 2 < 2.3 ** 2) {
          if (k.hit(p.type)) g.onHit(k, p.owner, p.type);
          p.life = 0;
          break;
        }
      }
      // eggs smash on hay bales
      for (const c of tr.colliders) if ((c.x - p.x) ** 2 + (c.z - p.z) ** 2 < (c.r + .6) ** 2) p.life = 0;
      p.age += dt;
      if (p.life <= 0) {
        if (g.fx?.onSplat) g.fx.onSplat(p.x, p.y, p.z, p.type);
        else {
          g.particles.burst(p.x, p.y + 1, p.z, 16, p.type === 'egg' ? 0xfff8ec : 0xffd23a, 8);
          if (p.type === 'egg') g.particles.burst(p.x, p.y + 1, p.z, 8, 0xffb21a, 5);
        }
        g.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }
    // dropped mud pies
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      h.life -= dt;
      let gone = h.life <= 0;
      for (const k of g.karts) {
        if (k === h.owner && h.age < .8) continue;
        if ((k.x - h.x) ** 2 + (k.z - h.z) ** 2 < 2.1 ** 2) {
          if (k.hit('mud')) g.onHit(k, h.owner, 'mud');
          gone = true; break;
        }
      }
      h.age += dt;
      if (gone) { g.scene.remove(h.mesh); this.hazards.splice(i, 1); }
    }
  }

  use(k) {
    const g = this.game;
    const type = k.item;
    k.itemCount--;
    if (k.itemCount <= 0) k.item = null;
    const fx = k.fx, fz = k.fz;
    switch (type) {
      case 'carrot': case 'carrot3':
        k.boostT = Math.max(k.boostT, 1.35); g.audio.boost(k.isHuman); g.fx?.onBoost(k, 0); break;
      case 'clover':
        k.starT = 6.5; k.spinT = 0; g.audio.clover(k.isHuman); break;
      case 'mud': {
        const x = k.x - fx * 3.2, z = k.z - fz * 3.2;
        const mesh = makeItemMesh('mud'); mesh.position.set(x, terrainH(x, z) + .05, z); g.scene.add(mesh);
        this.hazards.push({ x, z, mesh, owner: k, life: 40, age: 0 });
        g.audio.drop(k.isHuman);
        break;
      }
      case 'egg': {
        const sp = Math.max(k.speed + 38, 62);
        const mesh = makeItemMesh('egg'); g.scene.add(mesh);
        const x = k.x + fx * 3, z = k.z + fz * 3;
        this.projectiles.push({ type, x, z, y: 0, vx: fx * sp, vz: fz * sp, mesh, owner: k, life: 4.5, age: 0, idx: k.idx, n: {}, bounces: 0 });
        g.audio.throw(k.isHuman);
        break;
      }
      case 'bee': {
        const sorted = [...g.karts].sort((a, b) => a.rank - b.rank);
        const target = k.rank > 0 ? sorted[k.rank - 1] : null;
        const mesh = makeItemMesh('bee'); g.scene.add(mesh);
        const x = k.x + fx * 3, z = k.z + fz * 3;
        this.projectiles.push({ type, x, z, y: 0, mesh, owner: k, target, speed: Math.max(58, k.speed + 22), life: 14, age: 0, idx: k.idx, n: {} });
        g.audio.bee(k.isHuman);
        break;
      }
    }
  }
}
