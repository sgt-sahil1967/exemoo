// Moving / reactive road hazards. Each one updates itself, collides with karts
// (called from Kart.update), tells CPU drivers where to dodge, and has a clear tell.
import * as THREE from 'three';
import { HALF_W, FENCE } from './dims.js';
import { SHAPE } from './particles.js';
import { rand, signTex } from './textures.js';
import { mat, gloss, metal, rboxGeo, PAL } from './geo.js';
import { makeHayBale, makePumpkin, makeTractor } from './models.js';
import { Inst, segM, M, sheet } from './features.js';
import * as P from './props.js';

const TAU = Math.PI * 2;
const _v = new THREE.Vector3();
const rr = (a, b) => a + (b - a) * Math.random();

function pushOut(k, cx, cz, R) {
  const dx = k.x - cx, dz = k.z - cz, d2 = dx * dx + dz * dz;
  if (d2 >= R * R) return null;
  const d = Math.sqrt(d2) || 1e-3, nx = d2 > 1e-6 ? dx / d : 1, nz = d2 > 1e-6 ? dz / d : 0;
  k.x = cx + nx * R; k.z = cz + nz * R;
  return [nx, nz];
}
function bump(k, g, nx, nz, power = 8, slow = .5) {
  if (k.speed > 6) k.speed *= slow;
  k.bvx += nx * power; k.bvz += nz * power;
  if (k.bumpCd <= 0) { g.audio.bump(k.isHuman); k.bumpCd = .35; if (k.isHuman) g.phones?.buzz?.(k.player, 30); }
}
function spinHit(k, g, nx, nz, power = 10) {
  k.bvx += nx * power; k.bvz += nz * power;
  if (k.hit('cow')) k.speed *= .5;
  else if (k.speed > 8) k.speed *= .8;
}
/** signed distance (m) along the track from kart to index i */
function ahead(tr, k, i) { let d = i - k.idx; const N = tr.N; if (d > N / 2) d -= N; if (d < -N / 2) d += N; return d * tr.seg; }
function puff(tr, x, y, z, col, n = 1, s = 1, up = 3) {
  const fx = tr.game?.fx; if (!fx) return;
  for (let j = 0; j < n; j++) {
    const i = fx.norm.emit(x + rr(-.6, .6) * s, y, z + rr(-.6, .6) * s, rr(-1.5, 1.5) * s, rr(up * .6, up), rr(-1.5, 1.5) * s, col, rr(.7, 1.1) * s, rr(1.6, 2.4) * s, rr(.6, 1.1), SHAPE.puff, -1, 1.2, .9);
    fx.norm.spin[i] = rr(-2, 2);
  }
}
function signs(tr, i, text, ahead = 34) {
  const tex = signTex(text); tr.own.push(tex);
  for (const d of [-1, 1]) {
    const j = tr.wrap(i - d * Math.round(ahead / tr.seg));
    tr.signPost(tr.at(j, d * (FENCE + 1.6)), tr.headingAt(j) + (d < 0 ? 0 : Math.PI), tex, 3.6);
  }
}

class Hazard {
  constructor(tr, d) { this.tr = tr; this.d = d; }
  update() {}
  collide() {}
  avoid() {}
  stopFor() { return false; }
}

// ------------------------------------------------------------------ things crossing the road
const CROSS = {
  tractor: { speed: 6.5, extra: 7, bodies: [[-1.6, 2], [1.6, 2]], wait: [2.5, 5], warn: 1.6, mode: 'back', lane: 'dirt', sign: 'TRACTOR\nCROSSING', gap: 7 },
  hay: { speed: 12, extra: 6, bodies: [[0, 1.5]], wait: [1.5, 4], warn: 1.1, mode: 'loop', roll: 1.2, sign: 'ROLLING\nHAY', gap: 4, lane: 'dirt' },
  pumpkin: { speed: 11, extra: 6, bodies: [[0, 1.9]], wait: [1.5, 4], warn: 1.1, mode: 'loop', roll: 1.7, sign: 'ROLLING\nPUMPKINS', gap: 4, lane: 'dirt' },
  snowball: { speed: 12, extra: 6, bodies: [[0, 2]], wait: [1.5, 4], warn: 1.1, mode: 'loop', roll: 2, sign: 'SNOWBALLS', gap: 4, lane: 'snow' },
  minecart: { speed: 10, extra: 6, bodies: [[0, 1.9]], wait: [2, 4.5], warn: 1.5, mode: 'back', lane: 'rails', signals: true, sign: 'MINE\nCARTS', gap: 5, railExt: 30 },
  train: { speed: 16, extra: 24, bodies: [[-9, 2.2], [-5.5, 2.2], [-2, 2.2], [1.5, 2.2], [5, 2.2], [8.5, 2.2]], wait: [6, 9], warn: 2.4, mode: 'back', lane: 'rails', signals: true, gates: true, stop: true, sign: 'TRAIN\nCROSSING', gap: 6, railExt: 140 },
};
function crossModel(type) {
  const g = new THREE.Group(), spin = new THREE.Group(); g.add(spin);
  let beacon = null;
  if (type === 'tractor') { spin.add(P.rigid(makeTractor(PAL.green))); beacon = P.addBeacon(spin, 5.75); beacon.position.z = -.8; beacon.scale.setScalar(1.3); }
  else if (type === 'hay') { const b = makeHayBale(); b.position.y = -1.2; spin.add(P.rigid(b)); spin.position.y = 1.2; }
  else if (type === 'pumpkin') { const p = P.makeJackLantern(1.7); p.rotation.y = Math.PI / 2; spin.add(P.rigid(p)); spin.position.y = 1.6; }
  else if (type === 'snowball') { spin.add(P.rigid(P.makeSnowball(2))); spin.position.y = 2; }
  else if (type === 'minecart') spin.add(P.rigid(P.makeMineCart()));
  else if (type === 'train') { const t = new THREE.Group(), l = P.makeLocomotive(PAL.red); l.position.z = 4.7; t.add(l); const w = P.makeWagonCar(PAL.blue, 'coal'); w.position.z = -6.2; t.add(w); spin.add(P.rigid(t)); }
  return { group: g, spin, beacon };
}
const LIGHT_ON = mat('#ff2a1a', { emissive: '#ff2010', emissiveIntensity: 1.6 }), LIGHT_OFF = mat('#5a1010');
const BEACON_ON = mat('#ffb000', { emissive: '#ff9000', emissiveIntensity: 1.8 }), BEACON_OFF = mat('#ffb000', { emissive: '#ff9000', emissiveIntensity: .1 });

class Crossing extends Hazard {
  constructor(tr, d) {
    super(tr, d);
    const c = this.c = CROSS[d.type];
    this.i = tr.straightNear(d.at, d.search ?? .02);
    this.E = FENCE + c.extra; this.speed = d.speed ?? c.speed;
    this.dir = d.dir ?? 1; this.lat = -this.dir * this.E; this.state = 'wait'; this.t = 1 + rand() * 3;
    this.m = crossModel(d.type); tr.group.add(this.m.group);
    tr.fenceGaps.push({ i: this.i, half: c.gap + 1 });
    this.buildLane();
    if (c.signals) this.buildSignals();
    if (c.sign) signs(tr, this.i, c.sign);
    this.place(0);
  }
  pt(lat) { return this.tr.at(this.i, lat, new THREE.Vector3()); }
  buildLane() {
    const tr = this.tr, c = this.c, i = this.i, ext = c.railExt ?? 10, L = this.E + ext;
    const lp = (lat, along = 0) => { const x = tr.px[i] - tr.tz[i] * lat + tr.tx[i] * along, z = tr.pz[i] + tr.tx[i] * lat + tr.tz[i] * along; return new THREE.Vector3(x, tr.terrainH(x, z), z); };
    for (let l = FENCE + 4; l < L; l += 6) for (const sd of [-1, 1]) { const p = lp(sd * l); tr.placed.push({ x: p.x, z: p.z, r: 4.5 }); }
    if (c.lane === 'rails') {
      const B = new Inst(), railM = metal('#7a7f8c'), tieM = mat('#6b4423');
      const step = 2;
      for (let l = -L; l < L; l += step) {
        for (const sd of [-.9, .9]) B.add(rboxGeo(.25, .22, 1, .05, 1), railM, segM(lp(l, sd), lp(l + step, sd), 1, 1, 0, .32));
        const p = lp(l + step / 2), yaw = tr.headingAt(i);
        B.add(rboxGeo(.5, .2, 2.8, .05, 1), tieM, M(p.x, p.y + .14, p.z, yaw));
      }
      B.flush(tr.group, { shadow: false });
    } else {
      const col = c.lane === 'snow' ? '#e8f0fa' : '#b07a45';
      for (const s of [-1, 1]) {
        const rows = [];
        for (let l = HALF_W + .5; l <= L; l += 2) rows.push([lp(s * l, -2.6).add(_v.set(0, .1, 0)), lp(s * l, 2.6).add(_v.set(0, .1, 0))]);
        const m = sheet(rows, mat(col, { roughness: 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })); m.castShadow = false; tr.group.add(m);
      }
    }
  }
  buildSignals() {
    const tr = this.tr, i = this.i;
    this.lights = []; this.arms = [];
    for (const d of [-1, 1]) {
      const j = tr.wrap(i - d * Math.round(7 / tr.seg)), p = tr.at(j, d * (FENCE + 2.2));
      const s = P.makeCrossingSignal(); s.group.position.copy(p); s.group.rotation.y = tr.headingAt(j) + (d < 0 ? 0 : Math.PI); tr.group.add(s.group);
      this.lights.push(...s.lights);
      if (this.c.gates) {
        const q = tr.at(j, d * (HALF_W + 1.5)), a = P.makeBarrierArm(2 * HALF_W + .5);
        a.group.position.copy(q); a.group.rotation.y = Math.atan2(d * tr.tx[j], d * tr.tz[j]);
        tr.group.add(a.group); this.arms.push(a.arm);
      }
    }
    for (const a of this.arms) a.rotation.z = 1.45;
  }
  get moving() { return this.state === 'go'; }
  place(t) {
    const p = this.pt(this.lat), g = this.m.group, tr = this.tr;
    g.position.copy(p);
    const lx = -tr.tz[this.i] * this.dir, lz = tr.tx[this.i] * this.dir;
    g.rotation.y = Math.atan2(lx, lz);
    this.mx = lx; this.mz = lz;
  }
  update(dt, t) {
    const c = this.c;
    if (this.state === 'wait') {
      this.t -= dt;
      if (c.mode === 'loop') { this.m.group.visible = this.t < 1.2; if (this.t < 1.2) this.m.group.scale.setScalar(Math.min(1, (1.2 - this.t) * 2)); }
      if (this.t <= 0) { this.state = 'warn'; this.t = c.warn; }
    } else if (this.state === 'warn') {
      this.t -= dt;
      if (c.roll) this.m.spin.rotation.x = Math.sin(t * 22) * .08;
      if (this.t <= 0) this.state = 'go';
    } else if (this.state === 'go') {
      this.lat += this.dir * this.speed * dt;
      if (c.roll) this.m.spin.rotation.x += this.speed * dt / c.roll;
      if (this.d.type === 'tractor' && Math.random() < dt * 6) { const p = this.pt(this.lat); puff(this.tr, p.x - this.mx * 2, p.y + 5.5, p.z - this.mz * 2, 0x8a8a96, 1, .6, 2); }
      if (this.lat * this.dir >= this.E) {
        this.lat = this.dir * this.E; this.state = 'wait'; this.t = c.wait[0] + rand() * (c.wait[1] - c.wait[0]);
        if (c.mode === 'back') this.dir *= -1; else { this.lat = -this.dir * this.E; this.m.group.visible = false; }
      }
    }
    this.place(t);
    const blink = Math.floor(t * 4) % 2;
    const alarm = this.state === 'warn' || this.state === 'go';
    if (this.m.beacon) this.m.beacon.material = (alarm || this.t < 2) && blink ? BEACON_ON : BEACON_OFF;
    if (this.lights) this.lights.forEach((l, k) => l.material = alarm && (k % 2) === blink ? LIGHT_ON : LIGHT_OFF);
    if (this.arms) { const tgt = alarm ? 0 : 1.45; for (const a of this.arms) a.rotation.z += (tgt - a.rotation.z) * Math.min(1, dt * 3); }
  }
  collide(k, g) {
    if (!this.m.group.visible) return;
    const p = this.pt(this.lat);
    if (Math.abs(ahead(this.tr, k, this.i)) > 30) return;
    for (const [off, r] of this.c.bodies) {
      const n = pushOut(k, p.x + this.mx * off, p.z + this.mz * off, r + 1.2);
      if (!n) continue;
      if (this.state === 'go') spinHit(k, g, this.mx * .7 + n[0] * .5, this.mz * .7 + n[1] * .5, 12);
      else bump(k, g, n[0], n[1], 7, .5);
      g.particles?.burst(k.x, k.y + 1.2, k.z, 8, this.d.type === 'snowball' ? 0xffffff : 0xf2c14e, 6);
      break;
    }
  }
  latAt(dtF) {
    let lat = this.lat, tm = dtF;
    if (this.state === 'wait') tm -= this.t + this.c.warn; else if (this.state === 'warn') tm -= this.t;
    if (tm > 0) lat += this.dir * this.speed * tm;
    return Math.max(-this.E, Math.min(this.E, lat));
  }
  avoid(dodge, k) {
    const dist = ahead(this.tr, k, this.i);
    if (dist < 2 || dist > 70 || (this.state === 'wait' && this.t > 3)) return;
    const lat = this.latAt(dist / Math.max(12, k.speed));
    for (const [off, r] of this.c.bodies) dodge(lat + this.dir * off, r + .5);
  }
  stopFor(k) {
    if (!this.c.stop || this.state === 'wait') return false;
    const dist = ahead(this.tr, k, this.i);
    return dist > 4 && dist < 55 && Math.abs(this.lat) < this.E - 2;
  }
}

// ------------------------------------------------------------------ pop-up hazards (moles, geysers)
class Popper extends Hazard {
  constructor(tr, d) {
    super(tr, d);
    this.geyser = d.kind === 'geyser';
    this.spots = d.spots.map(([f, lat], n) => {
      const i = tr.idxOf(f), p = tr.at(i, lat, new THREE.Vector3());
      const base = P.rigid(this.geyser ? P.makeGeyserVent() : P.makeMoleHill());
      base.position.copy(p); base.rotation.y = rand() * TAU; tr.group.add(base);
      const up = P.rigid(this.geyser ? P.makeSteamColumn() : P.makeMole());
      if (this.geyser) up.traverse(o => { o.castShadow = false; });
      up.position.copy(p); up.visible = false; tr.group.add(up);
      up.rotation.y = tr.headingAt(i) + Math.PI;
      return { i, lat, p, base, up, state: 'idle', t: .5 + n * .9 + rand() * 2, h: 0 };
    });
    signs(tr, this.spots[0].i, this.geyser ? 'HOT\nSPRINGS' : 'MOLES!', 40);
    this.r = this.geyser ? 2.3 : 1.3;
  }
  update(dt, t) {
    for (const s of this.spots) {
      s.t -= dt;
      if (s.state === 'idle' && s.t <= 0) { s.state = 'warn'; s.t = 1.2; }
      else if (s.state === 'warn') {
        s.base.scale.set(1 + Math.sin(t * 40) * .07, 1 + Math.sin(t * 33) * .12, 1 + Math.cos(t * 37) * .07);
        if (Math.random() < dt * 14) puff(this.tr, s.p.x, s.p.y + .5, s.p.z, this.geyser ? 0xffffff : 0x7a4e26, 1, this.geyser ? .7 : .5, this.geyser ? 4 : 3);
        if (s.t <= 0) { s.state = 'up'; s.t = this.geyser ? 1.8 : 1.6; s.base.scale.setScalar(1); }
      } else if (s.state === 'up') {
        s.h = Math.min(1, s.h + dt * 7);
        if (this.geyser && Math.random() < dt * 20) puff(this.tr, s.p.x, s.p.y + 9 * s.h, s.p.z, 0xffffff, 1, 1.4, 5);
        if (s.t <= 0) { s.state = 'down'; }
      } else if (s.state === 'down') {
        s.h = Math.max(0, s.h - dt * 4);
        if (s.h <= 0) { s.state = 'idle'; s.t = 1.5 + rand() * 3; }
      }
      s.up.visible = s.h > .01;
      if (this.geyser) { s.up.scale.set(.6 + .4 * s.h, Math.max(.01, s.h), .6 + .4 * s.h); s.up.position.y = s.p.y; }
      else s.up.position.y = s.p.y - 1.9 * (1 - s.h) + Math.sin(t * 9) * .05 * s.h;
    }
  }
  collide(k, g) {
    for (const s of this.spots) {
      if (s.h < .5) continue;
      if (this.geyser) {
        if ((k.x - s.p.x) ** 2 + (k.z - s.p.z) ** 2 > (this.r + 1.1) ** 2 || (k._gey || 0) > g.time) continue;
        k._gey = g.time + 1.2;
        k.vy = 15; k.airborne = true; k.jump = true; k.airT = 0; k.trickDone = false; k.drifting = false; k.charge = 0;
        k.speed *= .7; k.spinT = Math.max(k.spinT, .35);
        g.audio.bump(k.isHuman); if (k.isHuman) g.phones?.buzz?.(k.player, [40, 30, 40]);
        puff(this.tr, k.x, k.y, k.z, 0xffffff, 8, 1.2, 6);
      } else {
        if (k.airborne && k.y > s.p.y + 1.4) continue;
        const n = pushOut(k, s.p.x, s.p.z, this.r + 1.1);
        if (n) { bump(k, g, n[0], n[1], 9, .45); puff(this.tr, s.p.x, s.p.y + .5, s.p.z, 0x7a4e26, 4, .7, 4); }
      }
    }
  }
  avoid(dodge, k) {
    for (const s of this.spots) {
      if (s.state === 'idle' && s.t > 1.2) continue;
      const d = ahead(this.tr, k, s.i); if (d > 3 && d < 50) dodge(s.lat, this.r + .6);
    }
  }
}

// ------------------------------------------------------------------ swinging jack-o'-lantern
class Pendulum extends Hazard {
  constructor(tr, d) {
    super(tr, d);
    this.i = tr.straightNear(d.at, .015);
    const p = tr.at(this.i, 0), h = tr.headingAt(this.i);
    this.top = 14; this.L = 10.5; this.amp = d.amp ?? 1.05; this.w = TAU / (d.period ?? 3.4); this.ph = d.ph ?? 0;
    tr.put(P.makeGantry(2 * FENCE + 2, this.top + .6, '#6b4423'), p.x, p.z, h, { y: p.y - tr.groundAt(p.x, p.z) });
    const piv = this.piv = new THREE.Group(); piv.position.set(p.x, p.y + this.top, p.z); piv.rotation.order = 'YZX'; piv.rotation.y = h; tr.group.add(piv);
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, this.L - 1.5, 6), mat('#8a6a3a')); rope.position.y = -(this.L - 1.5) / 2; rope.castShadow = true; piv.add(rope);
    this.bob = P.rigid(P.makeJackLantern(2.2)); this.bob.position.y = -this.L; piv.add(this.bob);
    this.lx = -tr.tz[this.i]; this.lz = tr.tx[this.i];
    tr.colliderFree?.push(this.i);
    if (d.sign !== false) signs(tr, this.i, 'SWINGING\nPUMPKIN', 40);
    this.bw = new THREE.Vector3();
  }
  theta(t) { return this.amp * Math.sin(this.w * t + this.ph); }
  update(dt, t) { this.piv.rotation.z = this.theta(t); this.bob.rotation.y = Math.sin(t * 2) * .4; this.bob.getWorldPosition(this.bw); this.t = t; }
  collide(k, g) {
    const b = this.bw;
    if (b.y - 2.2 > k.y + 1.8) return;
    const n = pushOut(k, b.x, b.z, 2.2 + 1.2);
    if (n) { spinHit(k, g, n[0], n[1], 12); g.particles?.burst(b.x, b.y, b.z, 10, 0xff8a00, 7); }
  }
  avoid(dodge, k, game) {
    const d = ahead(this.tr, k, this.i); if (d < 3 || d > 60) return;
    const th = this.theta((this.t ?? game.time) + d / Math.max(12, k.speed));
    if (Math.abs(th) > .75) return;
    // pivot local x is -lateral
    dodge(-this.L * Math.sin(th), 3.2);
  }
}

// ------------------------------------------------------------------ swinging ranch gate
class Gate extends Hazard {
  constructor(tr, d) {
    super(tr, d);
    this.i = tr.straightNear(d.at, .01); this.side = d.side ?? 1; this.len = d.len ?? 10.5;
    const h = tr.headingAt(this.i), hl = this.side * (FENCE - .4);
    this.hinge = tr.at(this.i, hl, new THREE.Vector3());
    this.closedY = this.side > 0 ? h : h + Math.PI; this.openY = h + Math.PI / 2 * this.side;
    this.g = P.rigid(P.makeRanchGate(this.len)); this.g.position.copy(this.hinge); tr.group.add(this.g);
    tr.put(P.makeGatePost(), this.hinge.x, this.hinge.z, 0, { y: this.hinge.y - tr.groundAt(this.hinge.x, this.hinge.z) });
    tr.fenceGaps.push({ i: this.i, half: this.len + 2, side: this.side });
    this.cyc = 6.8; this.ph = d.ph ?? 0; this.open = 1;
    if (d.sign) signs(tr, this.i, d.sign, 40);
  }
  openAt(t) {
    const c = ((t + this.ph) % this.cyc + this.cyc) % this.cyc;
    if (c < 2.2) return 1; if (c < 3.2) return 1 - (c - 2.2); if (c < 5.8) return 0; return c - 5.8;
  }
  update(dt, t) {
    const o = this.openAt(t), e = o * o * (3 - 2 * o);
    this.open = e;
    let dy = this.openY - this.closedY; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    this.g.rotation.y = this.closedY + dy * e;
    const a = this.g.rotation.y;
    this.tip = [this.hinge.x + Math.cos(a) * this.len, this.hinge.z - Math.sin(a) * this.len];
    this.t = t;
  }
  collide(k, g) {
    if (!this.tip) return;
    const ax = this.hinge.x, az = this.hinge.z, bx = this.tip[0], bz = this.tip[1];
    const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
    let u = ((k.x - ax) * dx + (k.z - az) * dz) / l2; u = Math.max(0, Math.min(1, u));
    const n = pushOut(k, ax + dx * u, az + dz * u, 1.7);
    if (n) bump(k, g, n[0], n[1], 11, .4);
  }
  avoid(dodge, k, game) {
    const d = ahead(this.tr, k, this.i); if (d < 2 || d > 55) return;
    const o = this.openAt((this.t ?? game.time) + d / Math.max(12, k.speed));
    if (o > .7) return;
    dodge(this.side * (FENCE - .4 - this.len / 2), this.len / 2 + .8);
  }
}

// ------------------------------------------------------------------ sliding ice blocks
class Sliders extends Hazard {
  constructor(tr, d) {
    super(tr, d);
    const i0 = tr.straightNear(d.at, .015), n = d.n ?? 3, gap = Math.round((d.gap ?? 16) / tr.seg);
    this.amp = d.amp ?? HALF_W - 2.5; this.w = TAU / (d.period ?? 4.2);
    this.blocks = [];
    const strip = new THREE.MeshStandardMaterial({ color: '#d6efff', roughness: .1, metalness: .2, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
    for (let j = 0; j < n; j++) {
      const i = tr.wrap(i0 + j * gap), m = P.rigid(P.makeIceBlock(3.4));
      tr.group.add(m);
      tr.roadStrip(i - 3, 6, HALF_W, -HALF_W, strip, .25, 6, 4);
      this.blocks.push({ i, m, ph: j * 2.1, lat: 0, p: new THREE.Vector3() });
    }
    signs(tr, i0, 'ICE\nBLOCKS', 40);
  }
  latAt(b, t) { return this.amp * Math.sin(this.w * t + b.ph); }
  update(dt, t) {
    for (const b of this.blocks) {
      b.lat = this.latAt(b, t);
      this.tr.at(b.i, b.lat, b.p);
      b.m.position.copy(b.p); b.m.rotation.y = this.tr.headingAt(b.i) + Math.sin(t * 1.3 + b.ph) * .15;
    }
    this.t = t;
  }
  collide(k, g) {
    for (const b of this.blocks) {
      const n = pushOut(k, b.p.x, b.p.z, 2.2 + 1.2);
      if (n) { bump(k, g, n[0], n[1], 12, .4); g.particles?.burst(k.x, k.y + 1, k.z, 8, 0xdff4ff, 6); }
    }
  }
  avoid(dodge, k, game) {
    for (const b of this.blocks) {
      const d = ahead(this.tr, k, b.i); if (d < 2 || d > 50) continue;
      dodge(this.latAt(b, (this.t ?? game.time) + d / Math.max(12, k.speed)), 2.8);
    }
  }
}

// ------------------------------------------------------------------ dust devil wandering on the road
class DustDevil extends Hazard {
  constructor(tr, d) {
    super(tr, d);
    this.i0 = tr.straightNear(d.at, .02); this.range = Math.round((d.range ?? 50) / 2 / tr.seg);
    this.k = 0; this.lat = (rand() - .5) * 10; this.vk = 4; this.vl = 3; this.t = 0;
    this.m = P.makeDustDevil(); tr.group.add(this.m);
    this.spin = this.m.getObjectByName('spin');
    this.p = new THREE.Vector3();
    signs(tr, this.i0, 'DUST\nDEVILS', 50);
  }
  get i() { return this.tr.wrap(this.i0 + Math.round(this.k)); }
  update(dt, t) {
    this.t -= dt;
    if (this.t <= 0) { this.t = 1.5 + rand() * 2; this.vk = (rand() - .5) * 14; this.vl = (rand() - .5) * 12; }
    this.k += this.vk * dt / this.tr.seg; this.lat += this.vl * dt;
    if (Math.abs(this.k) > this.range) { this.k = Math.sign(this.k) * this.range; this.vk *= -1; }
    if (Math.abs(this.lat) > HALF_W - 1.5) { this.lat = Math.sign(this.lat) * (HALF_W - 1.5); this.vl *= -1; }
    this.tr.at(this.i, this.lat, this.p);
    this.m.position.copy(this.p);
    this.spin.rotation.y += dt * 9;
    this.spin.children.forEach((c, n) => { c.position.x = Math.sin(t * 3 + n) * .35; });
    if (Math.random() < dt * 12) puff(this.tr, this.p.x + rr(-2, 2), this.p.y + .4, this.p.z + rr(-2, 2), 0xe8c28a, 1, 1, 3);
    this.now = t;
  }
  collide(k, g) {
    const n = pushOut(k, this.p.x, this.p.z, 2.3 + 1.1);
    if (!n) return;
    if (k.hit('cow')) { k.vy = 9; k.airborne = true; k.speed *= .55; puff(this.tr, k.x, k.y, k.z, 0xe8c28a, 8, 1.2, 5); }
  }
  avoid(dodge, k) {
    const d = ahead(this.tr, k, this.i); if (d > 2 && d < 45) dodge(this.lat + this.vl * d / Math.max(12, k.speed), 3.2);
  }
}

// ------------------------------------------------------------------ chickens pecking on the road
class Chickens extends Hazard {
  constructor(tr, d) {
    super(tr, d);
    this.i0 = tr.straightNear(d.at, .02); const range = (d.range ?? 30) / tr.seg;
    this.list = [];
    for (let n = 0; n < (d.n ?? 7); n++) {
      const c = { group: P.rigid(P.makeChicken(1.15).group) }; tr.group.add(c.group);
      this.list.push({ c, k: (rand() - .5) * range, lat: (rand() - .5) * 2 * (HALF_W - 1), h: rand() * TAU, run: 0, fly: null, ph: rand() * 6, p: new THREE.Vector3(), y: 0, rest: range });
    }
    signs(tr, this.i0, 'CHICKENS', 45);
  }
  update(dt, t) {
    const karts = this.tr.game?.karts || [];
    for (const ch of this.list) {
      const i = this.tr.wrap(this.i0 + Math.round(ch.k));
      if (ch.fly) {
        ch.fly.vy -= 22 * dt; ch.y += ch.fly.vy * dt; ch.lat += ch.fly.vl * dt;
        ch.c.group.rotation.x += dt * 12;
        if (ch.y <= 0 && ch.fly.vy < 0) { ch.fly = null; ch.y = 0; ch.c.group.rotation.x = 0; ch.lat = Math.sign(ch.lat || 1) * (FENCE - 1.5); }
      } else {
        // flee from the nearest kart
        let near = null, nd = 14 * 14;
        this.tr.at(i, ch.lat, ch.p);
        for (const k of karts) { const d2 = (k.x - ch.p.x) ** 2 + (k.z - ch.p.z) ** 2; if (d2 < nd) { nd = d2; near = k; } }
        if (near) { const kl = this.tr.nearest(near.x, near.z, i, {}).lat; ch.run = ch.lat >= kl ? 1 : -1; }
        else if (Math.random() < dt * .3) ch.run = 0;
        if (ch.run) ch.lat += ch.run * 7 * dt;
        else { ch.lat += Math.sin(t * .7 + ch.ph) * dt * 1.2; }
        if (Math.abs(ch.lat) > FENCE - 1.2) { ch.lat = Math.sign(ch.lat) * (FENCE - 1.2); if (!near) ch.run = 0; }
        if (!near && Math.abs(ch.lat) > FENCE - 2 && Math.random() < dt * .25) ch.lat *= .3; // wander back on
      }
      this.tr.at(i, ch.lat, ch.p);
      const g = ch.c.group;
      g.position.set(ch.p.x, ch.p.y + ch.y, ch.p.z);
      const h = this.tr.headingAt(i);
      g.rotation.y = ch.run ? h + (ch.run > 0 ? -Math.PI / 2 : Math.PI / 2) : h + Math.PI + Math.sin(t * .5 + ch.ph) * 1.2;
      const run = ch.run || ch.fly;
      if (!ch.fly) {
        g.rotation.z = run ? Math.sin(t * 22 + ch.ph) * .18 : 0;
        g.rotation.x = run ? -.15 : Math.max(0, Math.sin(t * 5 + ch.ph)) * .45;
        g.position.y += run ? Math.abs(Math.sin(t * 22 + ch.ph)) * .25 : 0;
      }
    }
  }
  collide(k, g) {
    for (const ch of this.list) {
      if (ch.fly) continue;
      if ((k.x - ch.p.x) ** 2 + (k.z - ch.p.z) ** 2 > 2.1 * 2.1) continue;
      ch.fly = { vy: 11 + rand() * 4, vl: (rand() - .5) * 10 };
      if (k.speed > 8) k.speed *= .84;
      if (k.bumpCd <= 0) { g.audio.bump(k.isHuman); k.bumpCd = .3; }
      const fx = g.fx;
      if (fx) for (let j = 0; j < 12; j++) { const q = fx.norm.emit(ch.p.x, ch.p.y + 1, ch.p.z, rr(-5, 5), rr(2, 7), rr(-5, 5), j % 4 ? 0xffffff : 0xff3b30, .5, .3, rr(.8, 1.3), SHAPE.fluff, 4, 2); fx.norm.spin[q] = rr(-6, 6); fx.norm.flut[q] = rr(6, 12); }
    }
  }
}

// ------------------------------------------------------------------ springy bumper cacti
class Cacti extends Hazard {
  constructor(tr, d) {
    super(tr, d);
    this.list = d.spots.map(([f, lat]) => {
      const i = tr.idxOf(f), p = tr.at(i, lat, new THREE.Vector3()), m = P.makeBumperCactus(), ry = tr.headingAt(i) + Math.PI;
      const t0 = m.getObjectByName('top'); m.remove(t0); t0.position.y = 0;
      tr.put(m, p.x, p.z, ry, { y: p.y - tr.groundAt(p.x, p.z) });
      const top = P.rigid(t0); top.position.set(p.x, p.y + 1.2, p.z); top.rotation.y = ry; tr.group.add(top);
      return { i, lat, p, m, top, wob: 0, wx: 0, wz: 0 };
    });
    signs(tr, this.list[0].i, 'BOUNCY\nCACTUS', 40);
  }
  update(dt, t) {
    for (const c of this.list) {
      c.wob = Math.max(0, c.wob - dt);
      const a = c.wob * Math.sin(c.wob * 26) * .5;
      c.top.rotation.x = a * c.wz; c.top.rotation.z = -a * c.wx;
      c.top.scale.y = 1 - a * .3 + Math.sin(t * 2 + c.i) * .02;
    }
  }
  collide(k, g) {
    for (const c of this.list) {
      const n = pushOut(k, c.p.x, c.p.z, 1.5 + 1.2);
      if (!n) continue;
      const sp = Math.abs(k.speed);
      k.speed *= .3; k.bvx += n[0] * (8 + sp * .35); k.bvz += n[1] * (8 + sp * .35);
      c.wob = 1; c.wx = -n[0]; c.wz = -n[1];
      if (k.bumpCd <= 0) { g.audio.bump(k.isHuman); k.bumpCd = .3; if (k.isHuman) g.phones?.buzz?.(k.player, 40); }
      g.particles?.burst(c.p.x, c.p.y + 2.5, c.p.z, 8, 0x5cc06a, 7);
    }
  }
  avoid(dodge, k) { for (const c of this.list) { const d = ahead(this.tr, k, c.i); if (d > 2 && d < 45) dodge(c.lat, 2); } }
}

const KINDS = { cross: Crossing, mole: Popper, geyser: Popper, pendulum: Pendulum, gate: Gate, ice: Sliders, devil: DustDevil, chickens: Chickens, cactus: Cacti };
export function buildHazards(tr, list = []) { for (const d of list) tr.hazards.push(new KINDS[d.kind](tr, d)); }
