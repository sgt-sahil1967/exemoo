// Arcade kart physics, drifting/mini-turbo, lap tracking and model animation.
import * as THREE from 'three';
import { makeKart } from './models.js';
import { slimRig } from './props.js';
import { terrainH, FENCE } from './track.js';

const BASE_MAX = 40;
const SLOW = { grass: .52, mud: .38, sand: .48, leaves: .6 };
const ACCEL = 24;
const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));

export class Kart {
  constructor(game, ch, { player = -1, tint = 0, name } = {}) {
    this.game = game;
    this.ch = ch;
    this.name = name || ch.name;
    this.player = player;          // -1 = CPU
    this.isHuman = player >= 0;
    this.model = makeKart(ch, tint);
    { const m = this.model; slimRig(m.root, [m.body, ...m.wheels, ...m.steerPivots, m.driver, m.head, m.steeringWheel, m.flag]); m.root.traverse(o => { if (o.isMesh) o.receiveShadow = false; }); }
    game.scene.add(this.model.root);
    this.shadow = game.track.addShadow(0, 0, 4.2);
    this.n = { idx: 0, lat: 0, frac: 0, dist: 0 };
    this.input = { steer: 0, gas: false, brake: false, drift: false, item: false };
    this.reset();
  }

  reset() {
    this.x = 0; this.z = 0; this.y = 0; this.vy = 0;
    this.heading = 0; this.speed = 0; this.steer = 0;
    this.bvx = 0; this.bvz = 0;
    this.airborne = false; this.hopping = false; this.landVy = 0;
    this.gvy = 0; this.jump = false; this.airT = 0; this.trickDone = false; this.trickT = 0; this.trickDir = 1;
    this.drifting = false; this.driftDir = 0; this.charge = 0; this.driftVis = 0;
    this.boostT = 0; this.spinT = 0; this.spinA = 0; this.starT = 0; this.invulnT = 0;
    this.item = null; this.itemCount = 0; this.rollT = 0; this.pending = null; this.itemHeld = false;
    this.lap = 0; this.armed = true; this.lastFrac = 0; this.progress = 0;
    this.finished = false; this.finishTime = 0; this.rank = 0;
    this.lapTimes = []; this.lapStart = 0;
    this.wrongT = 0; this.bumpCd = 0; this.speedMult = 1;
    this.idx = -1; this.surf = 'road'; this.wasPad = false;
    this.lastFrac = .99;
  }

  place(i, lat) {
    const tr = this.game.track;
    const p = tr.at(i, lat);
    this.x = p.x; this.z = p.z; this.y = p.y;
    this.heading = tr.headingAt(i);
    this.idx = i;
    tr.nearest(this.x, this.z, i, this.n);
    this.lastFrac = this.n.frac;
    this.syncModel(0);
  }

  get fx() { return Math.sin(this.heading); }
  get fz() { return Math.cos(this.heading); }

  hit(kind) {
    if (this.starT > 0 || this.invulnT > 0) return false;
    this.spinT = kind === 'bee' ? 1.7 : kind === 'cow' ? 1.1 : 1.3;
    this.invulnT = this.spinT + .8;
    if (kind === 'bee' || kind === 'egg') this.vy = 7;
    this.drifting = false; this.charge = 0; this.boostT = 0;
    this.game.audio.hit(this.isHuman);
    if (this.isHuman) this.game.phones.buzz(this.player, [90, 50, 90]);
    this.game.fx?.onHit(this, kind);
    return true;
  }

  update(dt, raceOn) {
    const g = this.game, tr = g.track, inp = this.input;
    tr.nearest(this.x, this.z, this.idx, this.n);
    this.idx = this.n.idx;
    const surf = this.airborne ? this.surf : tr.surfaceAt(this.x, this.z, this.n);
    this.surf = surf;

    if (surf === 'boost') { if (!this.wasPad) { this.boostT = Math.max(this.boostT, 1.2); g.audio.boost(this.isHuman); g.fx?.onBoost(this, 0); } this.wasPad = true; }
    else this.wasPad = false;

    const control = raceOn && this.spinT <= 0;
    let maxS = BASE_MAX * this.ch.speed * this.speedMult;
    const boosting = this.boostT > 0;
    if (this.starT > 0) maxS *= 1.12;
    if (boosting) maxS *= 1.38;
    else if (this.starT <= 0) {
      maxS *= SLOW[surf] ?? 1;
    }

    // ---- longitudinal ----
    const gas = control && inp.gas, brake = control && inp.brake;
    if (boosting && control) this.speed = Math.min(maxS, this.speed + 70 * dt);
    else if (gas) { if (this.speed < maxS) this.speed = Math.min(maxS, this.speed + ACCEL * this.ch.accel * dt * (this.speed < 0 ? 3 : 1) * (1.15 - .4 * Math.max(0, this.speed / maxS))); }
    else if (brake) this.speed = this.speed > 0 ? Math.max(-.1, this.speed - 48 * dt) : Math.max(-13, this.speed - 20 * dt);
    else this.speed -= Math.sign(this.speed) * Math.min(Math.abs(this.speed), 10 * dt);
    if (this.speed > maxS) this.speed = Math.max(maxS, this.speed - 32 * dt);
    if (this.spinT > 0) { this.spinT -= dt; this.speed *= Math.exp(-2.6 * dt); this.spinA += dt * 13 * Math.max(.2, this.spinT); }
    else this.spinA *= Math.exp(-10 * dt);

    // ---- steering & drift ----
    const steerIn = control ? inp.steer : 0;
    this.steer += (steerIn - this.steer) * Math.min(1, dt * 12);
    const sp = Math.abs(this.speed);
    const grip = Math.min(1, sp / 7);
    let turn = 1.95 * this.ch.handling * grip * (1 - .32 * Math.min(1, sp / 50));
    if (surf === 'ice' && this.starT <= 0) turn *= .45;
    let st = this.steer;

    if (control && inp.drift && !this.prevDrift && !this.drifting && !this.airborne && sp > 8) {
      this.vy = 5.5; this.hopping = true; this.airborne = true;
    }
    if (control && inp.drift && !this.drifting && !this.airborne && Math.abs(this.steer) > .35 && sp > 12) {
      this.drifting = true; this.driftDir = Math.sign(this.steer); this.charge = 0;
    }
    this.prevDrift = inp.drift;
    if (this.drifting) {
      if (!inp.drift || sp < 9 || !control) this.endDrift();
      else {
        st = this.driftDir * (.6 + .45 * this.steer * this.driftDir);
        turn *= 1.18;
        const prev = this.charge;
        this.charge += dt * (.55 + .7 * Math.abs(this.steer));
        if (prev < 1 && this.charge >= 1) { g.audio.sparkLevel(1, this.isHuman); g.fx?.onDriftLevel(this, 1); }
        if (prev < 2.2 && this.charge >= 2.2) { g.audio.sparkLevel(2, this.isHuman); g.fx?.onDriftLevel(this, 2); }
      }
    }
    if (this.airborne && this.jump) turn *= .55;
    // mid-air trick off a ramp: tap drift for a spin, land it for a boost
    if (control && this.jump && this.airborne && inp.drift && !this.prevTrick && !this.trickDone && this.airT > .08) {
      this.trickDone = true; this.trickT = .5; this.trickDir = this.steer < -.2 ? -1 : 1;
      g.audio.sparkLevel(1, this.isHuman);
    }
    this.prevTrick = inp.drift;
    this.heading -= st * turn * dt * (this.speed >= 0 ? 1 : -1);

    // ---- integrate ----
    const fx = this.fx, fz = this.fz;
    let vx = fx * this.speed, vz = fz * this.speed;
    if (this.drifting) { const rx = -Math.cos(this.heading), rz = Math.sin(this.heading); vx -= rx * this.driftDir * this.speed * .1; vz -= rz * this.driftDir * this.speed * .1; }
    this.x += (vx + this.bvx) * dt; this.z += (vz + this.bvz) * dt;
    const bd = Math.exp(-5 * dt); this.bvx *= bd; this.bvz *= bd;

    // ---- walls ----
    tr.nearest(this.x, this.z, this.idx, this.n);
    this.idx = this.n.idx;
    const lim = FENCE - 1.1;
    if (Math.abs(this.n.lat) > lim) {
      const s = Math.sign(this.n.lat), e = Math.abs(this.n.lat) - lim;
      const rx = -tr.tz[this.idx], rz = tr.tx[this.idx];
      this.x -= rx * e * s; this.z -= rz * e * s;
      const into = (fx * rx + fz * rz) * s;
      if (into > .15 && this.speed > 5) {
        this.speed *= into > .6 ? .55 : .85;
        this.bvx -= rx * s * 6; this.bvz -= rz * s * 6;
        if (this.bumpCd <= 0) { g.audio.bump(this.isHuman); this.bumpCd = .4; }
      }
      // steer heading toward track direction a bit
      const th = Math.atan2(tr.tx[this.idx], tr.tz[this.idx]);
      const d = wrapA(th - this.heading);
      if (Math.abs(d) < Math.PI / 2) this.heading += d * Math.min(1, dt * 3);
    }
    this.bumpCd -= dt;

    // ---- moving hazards (tractors, moles, geysers, gates ...)
    tr.game = g;
    for (const h of tr.hazards) h.collide(this, g, dt);

    // ---- vertical ----
    const gy = terrainH(this.x, this.z);
    if (this.trickT > 0) this.trickT -= dt;
    if (this.airborne || this.vy > 0) {
      this.vy -= 30 * dt; this.y += this.vy * dt; this.airT += dt;
      if (this.y <= gy) {
        this.landVy = -this.vy;
        this.y = gy; this.vy = 0; this.airborne = false; this.gvy = 0;
        if (this.landVy > 3) g.fx?.onLand(this);
        if (this.jump) {
          this.jump = false;
          if (this.trickDone && this.spinT <= 0) {
            this.boostT = Math.max(this.boostT, .9); g.audio.boost(this.isHuman); g.fx?.onBoost(this, 1);
            if (this.isHuman) g.msg?.(this, 'TRICK!', '#5fd8ff', .9);
          }
          this.trickDone = false; this.trickT = 0;
        }
        if (this.hopping) {
          this.hopping = false;
          if (inp.drift && Math.abs(this.steer) > .25 && sp > 12 && control) {
            this.drifting = true; this.driftDir = Math.sign(this.steer); this.charge = 0;
          }
        }
      }
    } else {
      // follow the ground; take off when it falls away faster than gravity (ramp lips)
      let gv = (gy - this.y) / dt;
      if (gv > Math.abs(this.speed) * .8 + 3 || gv < -40) gv = 0; // steps / drops: no launch energy
      const pred = this.y + this.gvy * dt - 15 * dt * dt;
      if (this.gvy > 3 && gy < pred - .03) {
        this.airborne = true; this.jump = true; this.airT = 0; this.trickDone = false;
        this.vy = Math.min(this.gvy, 15); this.y = pred; this.gvy = 0;
        if (this.drifting) this.endDrift();
      } else { this.y = gy; this.gvy = this.gvy + (gv - this.gvy) * Math.min(1, dt * 30); }
    }

    // ---- timers ----
    if (this.boostT > 0) {
      this.boostT -= dt; // flames/streaks drawn by Effects
    }
    if (this.starT > 0) {
      this.starT -= dt; // rainbow shell/sparkles drawn by Effects
    }
    if (this.invulnT > 0) this.invulnT -= dt;
    // surface dust, drift sparks and skid marks are drawn by Effects

    // ---- lap tracking ----
    const f = this.n.frac;
    if (this.lastFrac > .85 && f < .15) {
      if (this.armed) { this.lap++; this.armed = false; g.onLap(this); }
    } else if (this.lastFrac < .15 && f > .85) {
      if (!this.armed) { this.lap--; this.armed = true; }
    }
    if (f > .4 && f < .6) this.armed = true;
    this.lastFrac = f;
    this.progress = this.lap + f;

    // wrong way
    const dot = fx * tr.tx[this.idx] + fz * tr.tz[this.idx];
    this.wrongT = dot < -.4 && this.speed > 3 ? this.wrongT + dt : 0;

    this.syncModel(dt);
  }

  endDrift() {
    if (this.charge >= 2.2) { this.boostT = Math.max(this.boostT, 1.25); this.game.audio.boost(this.isHuman); this.game.fx?.onBoost(this, 2); }
    else if (this.charge >= 1) { this.boostT = Math.max(this.boostT, .65); this.game.audio.boost(this.isHuman); this.game.fx?.onBoost(this, 1); }
    this.drifting = false; this.charge = 0;
  }

  syncModel(dt) {
    const m = this.model;
    const tgtVis = this.drifting ? -this.driftDir * .38 : 0;
    this.driftVis += (tgtVis - this.driftVis) * Math.min(1, dt * 8);
    m.root.position.set(this.x, this.y, this.z);
    m.root.rotation.order = 'YXZ';
    m.root.rotation.y = this.heading + this.driftVis + this.spinA;
    // terrain tilt
    const e = 1.2;
    const gx = (terrainH(this.x + e, this.z) - terrainH(this.x - e, this.z)) / (2 * e);
    const gz = (terrainH(this.x, this.z + e) - terrainH(this.x, this.z - e)) / (2 * e);
    const fx = this.fx, fz = this.fz, rx = -Math.cos(this.heading), rz = Math.sin(this.heading);
    const cl = (v, a) => Math.max(-a, Math.min(a, v));
    if (this.airborne && this.jump) m.root.rotation.x = cl(-Math.atan2(this.vy, Math.max(8, Math.abs(this.speed))) * .6, .5);
    else m.root.rotation.x = cl(-Math.atan(gx * fx + gz * fz), .45) * (this.airborne ? .5 : 1);
    m.root.rotation.z = cl(-Math.atan(gx * rx + gz * rz), .4) + (this.trickT > 0 ? (1 - this.trickT / .5) * Math.PI * 2 * this.trickDir : 0);
    m.body.rotation.z = this.steer * Math.min(1, Math.abs(this.speed) / 30) * .09;
    m.body.position.y = this.hopping ? .1 : 0;
    for (const w of m.wheels) w.rotation.x += this.speed * dt / .45;
    for (const p of m.steerPivots) p.rotation.y = -this.steer * .45;
    m.steeringWheel.rotation.z = this.steer * 1.2;
    m.head.rotation.y = -this.steer * .3;
    m.head.rotation.z = this.spinT > 0 ? Math.sin(this.spinA * 3) * .4 : 0;
    m.flag.rotation.y = Math.sin(performance.now() * .012 + this.x) * .3;
    // flashing when invulnerable / glow for clover
    m.root.visible = !(this.invulnT > 0 && this.spinT <= 0 && Math.floor(this.invulnT * 12) % 2 === 0);
    this.shadow.position.set(this.x, terrainH(this.x, this.z) + .26, this.z);
    this.shadow.rotation.y = this.heading;
    const sc = 4.2 / (1 + (this.y - terrainH(this.x, this.z)) * .3);
    this.shadow.scale.set(sc * .75, 1, sc);
  }
}
