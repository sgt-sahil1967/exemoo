// Back2Back simulation (no DOM, no three). Player 1 drives: steering moves the car across the road, GAS /
// BRAKE set the speed, ITEM fires a nitro boost. Player 2 shoots: the crosshair follows the phone's aim
// and holding Action fires. Both share one hull. Each 1400 m zone ends in a boss; kills chain into a
// combo multiplier; upgrades, shields and repairs are collected on the road.
//
// Coordinates: `d` is distance along the road (metres, absolute), `x` the lateral offset from the road
// centreline (see track.ts). The car sits at distance D + CAR_Z with offset `carRel`.
import { ROAD_HALF, ZONE_LEN, center, curvature, zoneIndex } from './track';

export { ROAD_HALF };
export const CAR_Z = 3.5; // the car's plane, metres ahead of the camera focus
export const ZNEAR = 2.2;
export const ZFAR = 260;
const CAR_HALF = 1.1;
const BASE_HULL = 5;
const SPAWN_AHEAD = 250;
const BOSS_Z = 46; // the boss keeps this distance ahead of the car

export type Upgrade = 'engine' | 'armor' | 'rapid' | 'spread' | 'shield' | 'repair';
export type Kind =
  | 'raider' | 'heavy' | 'boss' | 'barrel' | 'rock' | 'hay' | 'oil' | 'bullet' | 'pickup' | 'ramp' | 'pad'
  | 'post' | 'drone' | 'bomber' | 'bomb' | 'vTower' | 'vHut' | 'vGate' | 'vChief';
export type BossStyle = 'village' | 'harvester';
const isVillage = (k: Kind) => k === 'vTower' || k === 'vHut' || k === 'vGate' || k === 'vChief';
const isFlyer = (k: Kind) => k === 'drone' || k === 'bomber';
/** Never hit the car by driving into them. */
const NO_RAM = new Set<Kind>(['boss', 'drone', 'bomber', 'vTower', 'vHut', 'vChief']);
// The storm: starts STORM_GAP behind the car, speeds up over time, and is rubber-banded so it never falls out of sight.
const STORM_GAP = 130;
const STORM_MAX_GAP = 160;
const STORM_STRIKE = 40; // inside this the storm lashes the car
const stormSpeed = (t: number) => Math.min(82, 20 + 0.1 * t + 0.00007 * t * t);
const VERGE = ROAD_HALF - 1.5; // beyond this |x| the car is on the verge

export interface Obj {
  id: number;
  kind: Kind;
  d: number;
  x: number;
  hp: number;
  hpMax: number;
  w: number;
  h: number;
  phase: number;
  wob: number;
  fireT: number;
  /** 0..1 while an enemy charges a shot */
  tele: number;
  /** seconds left of a hit flash */
  flash: number;
  hit: boolean;
  used: boolean;
  zPrev: number;
  upgrade: Upgrade;
  /** shell lateral drift per second */
  vx: number;
  /** height above the ground (flyers, bombs, shells in flight), metres */
  alt: number;
  /** shell vertical speed, m/s */
  vy: number;
  /** village pieces: distance ahead of the car they hold formation at */
  zOff: number;
}

export interface DriveIn {
  steer: number; // -1 (left) .. 1 (right)
  gas: boolean;
  brake: boolean;
  nitro: boolean;
  drift: boolean;
}
export interface AimIn {
  rx: number;
  ry: number;
  fire: boolean;
}

/** Screen position of a world point given as (d, x, height). Supplied by the 3D camera; null if behind it. */
export type Projector = (d: number, x: number, y: number) => { sx: number; sy: number } | null;

export type GameEvent =
  | { k: 'shot' }
  | { k: 'hit'; d: number; x: number; h: number; crit: boolean }
  | { k: 'kill'; d: number; x: number; h: number; size: number; color: number; crit?: boolean }
  | { k: 'hurt' }
  | { k: 'pickup'; u: Upgrade; d: number; x: number }
  | { k: 'nitro' }
  | { k: 'combo'; mult: number }
  | { k: 'boss'; phase: 'spawn' | 'down'; zone: number; style: BossStyle }
  | { k: 'spin' }
  | { k: 'air'; kind: 'drone' | 'bomber' }
  | { k: 'slip' }
  | { k: 'drift'; phase: 'start' | 'tier' | 'boost'; tier: number }
  | { k: 'jump' }
  | { k: 'land'; boost: boolean }
  | { k: 'pad' }
  | { k: 'near'; air: boolean }
  | { k: 'overheat' }
  | { k: 'ambush'; d: number; x: number; kind: Kind }
  | { k: 'storm' }
  | { k: 'shift' }
  | { k: 'escaped' }
  | { k: 'over' };

export interface Upgrades {
  engine: number;
  armor: number;
  rapid: number;
  spread: number;
}

const UPGRADE_CAP = 3;
const ARMOR_CAP = 4;
const PICKUP_KINDS: Upgrade[] = ['engine', 'armor', 'rapid', 'spread', 'shield', 'repair'];
const PICKUP_WEIGHTS = [0.22, 0.14, 0.22, 0.16, 0.14, 0.12];

const clampN = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

let nextId = 1;
function mk(kind: Kind, d: number, x: number, w: number, h: number, hp: number): Obj {
  return { id: nextId++, kind, d, x, hp, hpMax: hp, w, h, phase: Math.random() * 6.28, wob: 0, fireT: 1.2 + Math.random() * 1.5, tele: 0, flash: 0, hit: false, used: false, zPrev: 9999, upgrade: 'engine', vx: 0, alt: 0, vy: 0, zOff: 0 };
}

export class Game {
  D = 0;
  speed = 0;
  carRel = 0;
  time = 0;
  level = 1;
  zone = 0;

  hull = BASE_HULL;
  maxHull = BASE_HULL;
  score = 0;
  kills = 0;
  shots = 0;
  shotHits = 0;
  upg: Upgrades = { engine: 0, armor: 0, rapid: 0, spread: 0 };

  combo = 0; // consecutive kills inside the combo window
  comboT = 0;
  get mult(): number {
    return Math.min(5, 1 + Math.floor(this.combo / 3));
  }
  shield = 0; // seconds of shield left
  nitroT = 0;
  nitroCd = 0;
  slipT = 0; // seconds the driver is sliding on oil
  /** Drift: hold DRIFT while steering at speed; release for a boost (tiers 1-3). */
  drifting = false;
  driftDir = 1;
  driftCharge = 0;
  private driftTierShown = 0;
  boostT = 0; // boost from pads and drifts (stacks with nitro)
  airT = 0; // seconds of airtime left after a ramp
  airDur = 1;
  /** Gun heat 0..1; at 1 the gun locks for a moment. */
  heat = 0;
  heatLockT = 0;
  private sinceShot = 9;
  /** Target the crosshair is locked onto (aim assist), for the reticle. */
  lock: Obj | null = null;
  nearMisses = 0;
  private prevNitro = false;
  shotCd = 0;
  invul = 0;
  shake = 0;
  flash = 0;
  over = false;
  collide = true;
  /** Boss encounter */
  boss: Obj | null = null;
  bossStyle: BossStyle | null = null;
  private village: Obj[] = [];
  /** Storm: world distance of its leading edge and its speed (m/s). */
  stormD = -STORM_GAP;
  stormV = 20;
  private stormHitT = 0;
  overBy: 'hull' | 'storm' = 'hull';
  /** World distance where the current/next village starts (it is a fixed place on the road). */
  villageBase = 0;
  get stormGap(): number {
    return this.D - this.stormD;
  }
  bossesDown = 0;
  /** Lateral speed of the car (m/s) and time spent in the ditch. */
  carVx = 0;
  /** Vehicle dynamics exposed for animation / camera / sound. */
  gear = 1;
  rpm = 0;
  shiftT = 0;
  accLong = 0; // m/s², + = accelerating
  accLat = 0; // m/s², + = pushing toward the right
  get slipAng(): number {
    return Math.atan2(this.carVx, Math.max(this.speed, 6));
  }
  private ditchT = 0;
  private nextEdge = 90;
  /** Steering actually applied this frame (for car animation) */
  steerApplied = 0;
  /** World point of the last shot that hit something (d, x, h); the 3D layer draws the tracer to it. */
  lastShot: { d: number; x: number; h: number } | null = null;

  objs: Obj[] = [];
  events: GameEvent[] = [];
  project: Projector = () => null;
  private nextSpawn = 140;
  private nextPickup = 240;
  private nextBossD = ZONE_LEN - 160;

  reset(): void {
    this.D = 0;
    this.speed = 0;
    this.carRel = 0;
    this.time = 0;
    this.level = 1;
    this.zone = 0;
    this.hull = BASE_HULL;
    this.maxHull = BASE_HULL;
    this.score = 0;
    this.kills = 0;
    this.shots = 0;
    this.shotHits = 0;
    this.upg = { engine: 0, armor: 0, rapid: 0, spread: 0 };
    this.combo = 0;
    this.comboT = 0;
    this.shield = 0;
    this.nitroT = 0;
    this.nitroCd = 0;
    this.slipT = 0;
    this.drifting = false;
    this.driftCharge = 0;
    this.driftTierShown = 0;
    this.boostT = 0;
    this.airT = 0;
    this.heat = 0;
    this.heatLockT = 0;
    this.sinceShot = 9;
    this.lock = null;
    this.nearMisses = 0;
    this.prevNitro = false;
    this.shotCd = 0;
    this.invul = 0;
    this.shake = 0;
    this.flash = 0;
    this.over = false;
    this.boss = null;
    this.bossStyle = null;
    this.village = [];
    this.stormD = -STORM_GAP;
    this.stormV = 20;
    this.stormHitT = 0;
    this.overBy = 'hull';
    this.carVx = 0;
    this.gear = 1;
    this.rpm = 0;
    this.shiftT = 0;
    this.accLong = 0;
    this.accLat = 0;
    this.ditchT = 0;
    this.nextEdge = 90;
    this.bossesDown = 0;
    this.steerApplied = 0;
    this.lastShot = null;
    this.objs = [];
    this.events = [];
    this.nextSpawn = 140;
    this.nextPickup = 240;
    this.nextBossD = ZONE_LEN - 160;
  }

  /** World lateral position of the car. */
  carWorldX(): number {
    return center(this.D + CAR_Z) + this.carRel;
  }

  /** Difficulty from run time and zone together. */
  get difficulty(): number {
    return this.level + this.zone * 1.5;
  }

  get driftTier(): number {
    return this.driftCharge >= 1.6 ? 3 : this.driftCharge >= 1.0 ? 2 : this.driftCharge >= 0.5 ? 1 : 0;
  }

  /** Height of the car above the road while airborne (metres). */
  get air(): number {
    if (this.airT <= 0) return 0;
    const u = 1 - this.airT / this.airDur;
    return 3.4 * 4 * u * (1 - u);
  }

  /** Boss health 0..1 (village: all pieces combined), null when no boss. */
  get bossFrac(): number | null {
    if (!this.boss) return null;
    if (this.bossStyle === 'village') {
      let hp = 0;
      for (const o of this.village) if (!o.hit) hp += Math.max(0, o.hp);
    }
    return this.boss.hp / this.boss.hpMax;
  }

  get shotInterval(): number {
    return Math.max(0.12, 0.38 - 0.08 * this.upg.rapid);
  }

  step(dt: number, drive: DriveIn, aim: AimIn, collide = true): void {
    if (this.over) return;
    this.collide = collide;
    this.time += dt;
    this.level = Math.min(10, 1 + Math.floor(this.time / 25));
    this.zone = zoneIndex(this.D);

    // Combo window, shield, oil slip.
    if (this.comboT > 0) {
      this.comboT -= dt;
      if (this.comboT <= 0) this.combo = 0;
    }
    this.shield = Math.max(0, this.shield - dt);
    this.slipT = Math.max(0, this.slipT - dt);

    // Driver: nitro (ITEM) on a fresh press, 1.6 s boost, 8 s cooldown.
    this.nitroCd = Math.max(0, this.nitroCd - dt);
    if (this.nitroT > 0) this.nitroT = Math.max(0, this.nitroT - dt);
    if (collide && drive.nitro && !this.prevNitro && this.nitroCd <= 0 && this.nitroT <= 0) {
      this.nitroT = 1.6;
      this.nitroCd = 8;
      this.events.push({ k: 'nitro' });
    }
    this.prevNitro = drive.nitro;

    // Speed: the driver owns the throttle. Gas pulls toward top speed, lifting off lets the car coast down slowly,
    // the brake scrubs speed fast. Nothing keeps the car moving on its own: the storm is the reason to keep going.
    const top = Math.min(90, 46 + 5 * this.upg.engine + 1.5 * this.level);
    this.boostT = Math.max(0, this.boostT - dt);
    const cap = this.nitroT > 0 ? top + 20 : this.boostT > 0 ? top + 14 : top;
    const onGround = this.airT <= 0;
    // Five-speed box: torque falls across each gear and cuts briefly on an upshift, so acceleration has a rhythm.
    const GEAR_TOP = [0, 17, 31, 46, 64, 92];
    let gear = this.gear;
    while (gear < 5 && this.speed > GEAR_TOP[gear]) gear++;
    while (gear > 1 && this.speed < GEAR_TOP[gear - 1] - 4) gear--;
    if (gear > this.gear && drive.gas && onGround) {
      this.shiftT = 0.16;
      this.events.push({ k: 'shift' });
    }
    this.gear = gear;
    this.shiftT = Math.max(0, this.shiftT - dt);
    this.rpm = clampN((this.speed - GEAR_TOP[gear - 1]) / (GEAR_TOP[gear] - GEAR_TOP[gear - 1]), 0, 1);
    let acc = 0;
    if (drive.gas && !drive.brake) {
      const room = clampN((cap - this.speed) / 5, 0, 1);
      let torque = 25 * (1 - 0.5 * this.rpm) * (gear === 1 ? 1.15 : 1);
      if (this.shiftT > 0) torque = 0;
      if (this.nitroT > 0 || this.boostT > 0) torque += 20;
      acc += torque * room * (onGround ? 1 : 0.2);
    }
    acc -= 1.1 + 0.0011 * this.speed * this.speed; // rolling + air drag
    if (this.speed > cap) acc -= (this.speed - cap) * 1.5;
    if (drive.brake && onGround) acc -= 24;
    this.accLong += (acc - this.accLong) * Math.min(1, dt * 8);
    this.speed = Math.max(0, this.speed + acc * dt);
    // The verge is rough: it drags the car and shakes it; the ditch beyond hurts.
    const edge = Math.abs(this.carRel);
    if (this.collide && this.airT <= 0 && edge > VERGE) {
      const rough = clampN((edge - VERGE) / 2, 0.2, 1.5);
      this.speed = Math.max(0, this.speed - 16 * rough * dt);
      this.shake = Math.max(this.shake, 0.14);
      if (edge > ROAD_HALF + 1.6) {
        this.ditchT += dt;
        if (this.ditchT > 1.8) {
          this.ditchT = 0;
          this.slipT = Math.max(this.slipT, 0.8);
          this.hurt(1);
        }
      } else this.ditchT = Math.max(0, this.ditchT - dt);
    } else this.ditchT = Math.max(0, this.ditchT - dt);

    const dd = this.speed * dt;
    this.D += dd;
    this.updateStorm(dt, collide);
    this.score += dd * 0.5 * (collide ? this.mult : 1);

    // Airtime from a ramp: no ground contact, weak steering, a landing boost if you land straight.
    if (this.airT > 0) {
      this.airT -= dt;
      if (this.airT <= 0) {
        this.airT = 0;
        const clean = Math.abs(drive.steer) < 0.35;
        if (clean) this.boostT = Math.max(this.boostT, 0.7);
        this.events.push({ k: 'land', boost: clean });
      }
    }
    const grounded = this.airT <= 0;

    // Drift: hold DRIFT while steering at speed. Tighter turn in, charges up; release for a boost.
    const wantDrift = collide && drive.drift && grounded && this.speed > 28 && Math.abs(drive.steer) > 0.25;
    if (wantDrift) {
      if (!this.drifting) {
        this.drifting = true;
        this.driftDir = Math.sign(drive.steer) || 1;
        this.driftCharge = 0;
        this.driftTierShown = 0;
        this.events.push({ k: 'drift', phase: 'start', tier: 0 });
      }
      this.driftCharge += dt * (0.55 + 0.45 * Math.abs(drive.steer));
      if (this.driftTier > this.driftTierShown) {
        this.driftTierShown = this.driftTier;
        this.events.push({ k: 'drift', phase: 'tier', tier: this.driftTier });
      }
      this.speed = Math.max(0, this.speed - 3 * dt);
    } else if (this.drifting) this.endDrift();

    // Steering (oil makes the car slide: sluggish and wobbly), plus the curve pushing outward.
    let steer = drive.steer;
    if (this.slipT > 0) steer = steer * 0.35 + Math.sin(this.time * 9) * 0.55;
    if (!grounded) steer *= 0.4;
    // The steering rack takes ~0.35 s to full lock; tyres have limited grip, so the car understeers at speed,
    // carries sideways momentum, and slides when grip is lost (drift, oil, verge, airborne).
    const rack = Math.abs(steer) > Math.abs(this.steerApplied) ? 4 : 6.5;
    this.steerApplied += clampN(steer - this.steerApplied, -rack * dt, rack * dt);
    const sp = this.speed;
    const authority = clampN(sp / 9, 0, 1) * (1 - 0.32 * clampN(sp / Math.max(top, 1), 0, 1.3));
    const grip = (grounded ? 1 : 0.08) * (this.slipT > 0 ? 0.3 : 1) * (this.drifting ? 0.5 : 1) * (Math.abs(this.carRel) > VERGE ? 0.75 : 1);
    const latTarget = this.steerApplied * 13 * authority * (this.drifting ? 1.3 : 1) + (this.drifting ? this.driftDir * 2.2 : 0);
    const ax = clampN((latTarget - this.carVx) * 7, -22 * grip, 22 * grip);
    this.carVx += ax * dt;
    this.accLat += (ax - this.accLat) * Math.min(1, dt * 10);
    this.carRel += (this.carVx - 0.2 * curvature(this.D + CAR_Z) * sp * sp) * dt;
    if (Math.abs(this.carRel) > ROAD_HALF + 2.5) {
      this.carRel = clampN(this.carRel, -ROAD_HALF - 2.5, ROAD_HALF + 2.5);
      this.carVx *= 0.3;
    }

    this.invul = Math.max(0, this.invul - dt);
    this.shake = Math.max(0, this.shake - dt);
    this.flash = Math.max(0, this.flash - dt);
    this.shotCd -= dt;

    this.spawnAhead();
    this.updateObjects(dt);

    // Shooter: crosshair fire on held Action, rate set by the Rapid upgrade; heat builds and can lock the gun.
    this.sinceShot += dt;
    this.heatLockT = Math.max(0, this.heatLockT - dt);
    if (this.heatLockT > 0) this.heat = Math.max(0, this.heat - 0.8 * dt);
    else if (this.sinceShot > 0.25) this.heat = Math.max(0, this.heat - 0.3 * dt);
    this.lock = collide ? (this.scan(aim.rx * innerWidth, aim.ry * innerHeight)?.o ?? null) : null;
    if (collide && aim.fire && this.shotCd <= 0 && this.heatLockT <= 0) {
      this.shotCd = this.shotInterval;
      this.sinceShot = 0;
      this.heat += 0.12 - 0.015 * this.upg.rapid;
      this.fire(aim.rx, aim.ry);
      if (this.heat >= 1) {
        this.heat = 1;
        this.heatLockT = 1.3;
        this.events.push({ k: 'overheat' });
      }
    }

    this.checkCollisions();
    this.objs = this.objs.filter((o) => !o.hit && o.d - this.D > -10 && o.d - this.D < SPAWN_AHEAD + 80);
  }

  // ───────────── spawning ─────────────
  private spawnAhead(): void {
    // Boss: stop regular traffic while one is alive.
    if (!this.boss && this.collide && this.D >= this.nextBossD - (this.isVillageZone() ? 150 : 0)) this.spawnBoss();
    const bossFight = !!this.boss;
    while (this.nextSpawn < this.D + SPAWN_AHEAD) {
      if (!bossFight && this.nextSpawn < this.nextBossD - 30) this.spawnEnemy(this.nextSpawn);
      const gap = Math.max(20, 60 - this.difficulty * 3.5) * (0.7 + Math.random() * 0.6);
      this.nextSpawn += gap;
    }
    while (this.nextEdge < this.D + SPAWN_AHEAD) {
      this.spawnEdge(this.nextEdge);
      this.nextEdge += 16 + Math.random() * 18;
    }
    while (this.nextPickup < this.D + SPAWN_AHEAD) {
      const p = mk('pickup', this.nextPickup, (Math.random() * 2 - 1) * (ROAD_HALF - 2.5), 2.6, 1.6, 1);
      p.upgrade = this.pickUpgrade();
      this.objs.push(p);
      this.nextPickup += 220 + Math.random() * 160;
    }
  }

  private pickUpgrade(): Upgrade {
    let r = Math.random();
    for (let i = 0; i < PICKUP_KINDS.length; i++) {
      const k = PICKUP_KINDS[i];
      // Don't offer a maxed-out upgrade; hull repair only when hurt.
      const maxed = k !== 'shield' && k !== 'repair' && this.upg[k] >= (k === 'armor' ? ARMOR_CAP : UPGRADE_CAP);
      const w = maxed || (k === 'repair' && this.hull >= this.maxHull) ? 0 : PICKUP_WEIGHTS[i];
      r -= w;
      if (r <= 0 && w > 0) return k;
    }
    return 'shield';
  }

  /** Roadside obstacles on the verge so the edge is not a free escape lane. */
  private spawnEdge(d: number): void {
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = side * (ROAD_HALF - 0.4 + Math.random() * 2.2);
    const r = Math.random();
    if (r < 0.55) this.objs.push(mk('post', d, x, 0.7, 1.4, 1));
    else if (r < 0.8) this.objs.push(mk('rock', d, x, 2.2, 1.5, 9));
    else this.objs.push(mk('hay', d, x, 2.2, 1.6, 2));
  }

  private airCount(): number {
    let n = 0;
    for (const o of this.objs) if (isFlyer(o.kind) && !o.hit) n++;
    return n;
  }

  private spawnEnemy(d: number): void {
    const x = (Math.random() * 2 - 1) * (ROAD_HALF - 2.5);
    const dif = this.difficulty;
    if (dif >= 1.5 && this.airCount() < 2 && Math.random() < 0.13) {
      if (dif >= 3 && Math.random() < 0.42) {
        const b = mk('bomber', this.D + 190, x, 4.2, 1.4, 4);
        b.alt = 5.5;
        b.fireT = 0.6;
        this.objs.push(b);
        this.events.push({ k: 'air', kind: 'bomber' });
      } else {
        const dr = mk('drone', this.D + 170, x, 2.0, 1.2, 2);
        dr.alt = 4 + Math.random() * 3;
        dr.fireT = 2 + Math.random();
        this.objs.push(dr);
        this.events.push({ k: 'air', kind: 'drone' });
      }
      return;
    }
    const pRaider = Math.min(0.62, 0.34 + 0.035 * dif);
    const rr = Math.random();
    if (rr < 0.07) return void this.objs.push(mk('ramp', d, (Math.random() * 2 - 1) * (ROAD_HALF - 3.5), 5, 0.7, 1));
    if (rr < 0.15) return void this.objs.push(mk('pad', d, (Math.random() * 2 - 1) * (ROAD_HALF - 3), 4.4, 0.1, 1));
    const r = Math.random();
    if (r < pRaider) {
      const heavy = dif >= 3 && Math.random() < 0.3;
      this.objs.push(heavy ? mk('heavy', d, x, 3.0, 2.8, 3) : mk('raider', d, x, 2.4, 1.9, 1));
    } else if (r < pRaider + 0.2) {
      this.objs.push(mk('barrel', d, x, 1.3, 1.3, 1));
    } else if (r < pRaider + 0.32) {
      this.objs.push(mk('rock', d, x, 2.2, 1.5, 9));
    } else if (r < pRaider + 0.44) {
      this.objs.push(mk('hay', d, x, 2.2, 1.6, 2));
    } else {
      this.objs.push(mk('oil', d, x, 4.2, 0.1, 1));
    }
  }

  private isVillageZone(): boolean {
    // Zones 2, 4, 6... (index 1, 3, 5) end in a village; 1, 3, 5 keep the Mega Harvester.
    return zoneIndex(this.nextBossD) % 2 === 1;
  }

  /** The storm creeps up on the car, and strikes it when it gets close. */
  private updateStorm(dt: number, collide: boolean): void {
    if (!collide) {
      this.stormD = this.D - STORM_GAP;
      return;
    }
    this.stormV = stormSpeed(this.time);
    this.stormD += this.stormV * dt;
    if (this.D - this.stormD > STORM_MAX_GAP) this.stormD = this.D - STORM_MAX_GAP;
    const gap = this.D - this.stormD;
    this.stormHitT = Math.max(0, this.stormHitT - dt);
    if (gap <= 0) {
      this.hull = 0;
      this.overBy = 'storm';
      this.over = true;
      this.events.push({ k: 'over' });
    } else if (gap < STORM_STRIKE && this.stormHitT <= 0) {
      this.stormHitT = 2.2;
      this.events.push({ k: 'storm' });
      this.invul = 0;
      this.hurt(1);
    }
  }

  private spawnBoss(): void {
    const zi = zoneIndex(this.D + 200);
    if (this.isVillageZone()) return this.spawnVillage(zi);
    const b = mk('boss', this.D + BOSS_Z + 80, 0, 6, 4.5, 18 + 10 * zi);
    b.fireT = 2.5;
    this.objs.push(b);
    this.boss = b;
    this.bossStyle = 'harvester';
    this.events.push({ k: 'boss', phase: 'spawn', zone: zi, style: 'harvester' });
  }

  /** Boss village: a guarded place on the road. Towers and huts flank it, a gate bars it, the chief waits behind. Miss them and they get a free attack as you pass. */
  private spawnVillage(zi: number): void {
    const add = (kind: Kind, zOff: number, x: number, w: number, h: number, hp: number, fire: number) => {
      const o = mk(kind, this.villageBase + zOff, x, w, h, hp);
      o.zOff = zOff;
      o.fireT = fire;
      this.objs.push(o);
      this.village.push(o);
      return o;
    };
    this.village = [];
    this.villageBase = this.nextBossD;
    for (const sx of [-1, 1]) {
      add('vTower', 56, sx * 10.5, 3.4, 7, 5 + 2 * zi, 2 + (sx + 1) * 0.4);
      add('vHut', 40, sx * 12.5, 4, 3.4, 4 + zi, 1.5);
    }
    add('vGate', 78, 0, ROAD_HALF * 2 + 4, 3.4, 10 + 2 * zi, 99);
    const chief = add('vChief', 104, 0, 7, 5, 16 + 6 * zi, 3);
    this.boss = chief;
    this.bossStyle = 'village';
    this.events.push({ k: 'boss', phase: 'spawn', zone: zi, style: 'village' });
  }

  private gateAlive(): boolean {
    return this.village.some((o) => o.kind === 'vGate' && !o.hit);
  }

  // ───────────── objects ─────────────
  private updateObjects(dt: number): void {
    const shells: Obj[] = [];
    const dif = this.difficulty;
    for (const o of this.objs) {
      if (o.flash > 0) o.flash -= dt;
      if (o.kind === 'raider' || o.kind === 'heavy') {
        // Raiders are oncoming traffic: they close on the car and weave across the road.
        o.d += (this.speed - (o.kind === 'heavy' ? 16 : 22)) * dt;
        o.wob += dt;
        o.x = clampN(o.x + Math.sin(o.wob * 1.4 + o.phase) * 2.4 * dt, -ROAD_HALF + 1.6, ROAD_HALF - 1.6);
        o.fireT -= dt;
        o.tele = clampN(1 - o.fireT / 0.6, 0, 1);
        const z = o.d - this.D;
        // Shoots at where the car is going, even from another lane, until it is almost alongside.
        const side = Math.abs(o.x - this.carRel) > 3;
        if (this.collide && o.fireT <= 0 && z < 150 && z > (side ? 10 : 20)) {
          o.fireT = Math.max(1.6, 3.0 - 0.1 * dif) * (0.8 + Math.random() * 0.4);
          shells.push(this.aimShell(o, 0));
        } else if (o.fireT <= 0) o.fireT = 0.4;
      } else if (o.kind === 'boss') {
        this.updateBoss(o, dt, shells);
      } else if (o.kind === 'drone') {
        this.updateDrone(o, dt, shells);
      } else if (o.kind === 'bomber') {
        this.updateBomber(o, dt, shells);
      } else if (o.kind === 'bomb') {
        o.alt = Math.max(0, o.alt - 9 * dt);
        o.tele = clampN(1 - o.alt / 6, 0, 1);
      } else if (isVillage(o.kind)) {
        this.updateVillagePiece(o, dt, shells);
      } else if (o.kind === 'bullet') {
        // Shells travel back toward the car much faster than the road.
        o.d += (this.speed - 60) * dt;
        o.x += o.vx * dt;
        if (o.alt > 0) o.alt = Math.max(0, o.alt + o.vy * dt);
      }
    }
    this.objs.push(...shells);
  }

  private shellFrom(o: Obj, vx: number): Obj {
    const s = mk('bullet', o.d, o.x, 0.9, 0.9, 1);
    s.vx = vx;
    return s;
  }

  /** A shell from `o` led to where the car will be when it arrives (`spread` fans extra lateral m/s). */
  private aimShell(o: Obj, spread: number): Obj {
    const T = clampN((o.d - this.D - CAR_Z) / 60, 0.18, 3);
    const target = this.carRel + this.carVx * T * 0.7;
    const s = this.shellFrom(o, clampN((target - o.x) / T, -30, 30) + spread);
    if (o.alt > 0) {
      s.alt = o.alt;
      s.vy = -o.alt / T;
    }
    return s;
  }

  private updateDrone(o: Obj, dt: number, shells: Obj[]): void {
    o.wob += dt;
    const leaving = o.wob > 18;
    const z = o.d - this.D;
    const vrel = leaving ? 40 : clampN((52 - z) * 1.5, -40, 40);
    o.d += (this.speed + vrel) * dt;
    const want = clampN(this.carRel * 0.6 + Math.sin(o.wob * 0.9 + o.phase) * 7, -ROAD_HALF + 1.5, ROAD_HALF - 1.5);
    o.x += clampN(want - o.x, -9 * dt, 9 * dt);
    o.fireT -= dt;
    o.tele = clampN(1 - o.fireT / 0.7, 0, 1);
    if (this.collide && o.fireT <= 0 && z > 12 && z < 120 && !leaving) {
      o.fireT = Math.max(1.5, 2.6 - 0.08 * this.difficulty) * (0.8 + Math.random() * 0.4);
      shells.push(this.aimShell(o, 0));
    } else if (o.fireT <= 0) o.fireT = 0.4;
  }

  private updateBomber(o: Obj, dt: number, shells: Obj[]): void {
    // Closes on the car, passes overhead and drops bombs onto the lane; the shadow shows where each lands.
    o.d += (this.speed - 34) * dt;
    const z = o.d - this.D;
    const want = clampN(this.carRel + this.carVx * 0.4, -ROAD_HALF + 2, ROAD_HALF - 2);
    o.x += clampN(want - o.x, -6 * dt, 6 * dt);
    o.fireT -= dt;
    o.tele = clampN(1 - o.fireT / 0.5, 0, 1);
    if (this.collide && o.fireT <= 0 && z > 14 && z < 100) {
      o.fireT = 0.75;
      const t = z / Math.max(20, this.speed);
      const b = mk('bomb', o.d, clampN(this.carRel + this.carVx * t * 0.5 + (Math.random() - 0.5) * 3, -ROAD_HALF + 1, ROAD_HALF - 1), 2.6, 1.0, 1);
      b.alt = 6;
      shells.push(b);
    } else if (o.fireT <= 0) o.fireT = 0.3;
  }

  private updateVillagePiece(o: Obj, dt: number, spawned: Obj[]): void {
    if (o.hit) return;
    const z = o.d - this.D;
    const range = z < 105 && z > CAR_Z + 1;
    o.fireT -= dt;
    // Free attack: a guard left standing gets a point-blank shot as the car goes by.
    if (this.collide && !o.used && o.kind !== 'vGate' && z < CAR_Z - 1) {
      o.used = true;
      this.invul = 0;
      this.hurt(o.kind === 'vChief' ? 2 : 1);
      this.events.push({ k: 'ambush', d: o.d, x: o.x, kind: o.kind });
      if (o.kind === 'vChief') this.endVillage();
      return;
    }
    if (o.kind === 'vTower') {
      o.tele = clampN(1 - o.fireT / 0.7, 0, 1);
      if (this.collide && range && o.fireT <= 0) {
        o.fireT = Math.max(1.8, 3.2 - 0.1 * this.zone) * (0.8 + Math.random() * 0.4);
        const s = this.aimShell({ ...o, alt: 5.5 } as Obj, 0);
        spawned.push(s);
      }
    } else if (o.kind === 'vHut') {
      o.tele = clampN(1 - o.fireT / 0.8, 0, 1);
      if (this.collide && range && o.fireT <= 0) {
        o.fireT = 4 + Math.random() * 1.5;
        let n = 0;
        for (const q of this.objs) if (q.kind === 'raider' && !q.hit) n++;
        if (n < 3) {
          const r = mk('raider', o.d - 2, Math.sign(o.x) * 5, 2.4, 1.9, 1);
          spawned.push(r);
        }
      }
    } else if (o.kind === 'vChief') {
      const open = !this.gateAlive();
      o.wob += dt;
      o.x += (Math.sin(o.wob * 0.6) * (ROAD_HALF - 4) * (open ? 1 : 0.4) - o.x) * Math.min(1, dt * 1.4);
      o.tele = range ? clampN(1 - o.fireT / 0.9, 0, 1) : 0;
      if (this.collide && range && o.fireT <= 0) {
        o.fireT = Math.max(1.3, 2.4 - (1 - o.hp / o.hpMax) * 1.0);
        for (const sp of [-6, 0, 6]) spawned.push(this.aimShell(o, sp));
      } else if (o.fireT <= 0) o.fireT = 0.5;
    }
  }

  private updateBoss(b: Obj, dt: number, shells: Obj[]): void {
    // Hover ahead of the car, sweeping across the road.
    b.d += (this.D + BOSS_Z - b.d) * Math.min(1, dt * 2.2);
    b.wob += dt;
    const sweep = Math.sin(b.wob * 0.7) * (ROAD_HALF - 3.5);
    b.x += (sweep - b.x) * Math.min(1, dt * 1.6);
    const rage = 1 - b.hp / b.hpMax; // angrier as it is hurt
    b.fireT -= dt;
    b.tele = clampN(1 - b.fireT / 0.9, 0, 1);
    if (this.collide && b.fireT <= 0) {
      b.fireT = Math.max(1.3, 2.6 - rage * 1.2 - this.zone * 0.1);
      // volley of 3 shells fanned across the lanes around the car's predicted position
      for (const sp of [-7, 0, 7]) shells.push(this.aimShell(b, sp));
    }
  }

  private checkCollisions(): void {
    const carWorld = this.carWorldX();
    for (const o of this.objs) {
      const z = o.d - this.D;
      if (this.collide && !o.hit && o.zPrev > CAR_Z && z <= CAR_Z && !NO_RAM.has(o.kind)) {
        const dx = Math.abs(center(o.d) + o.x - carWorld);
        const reach = o.w / 2 + CAR_HALF;
        const groundHazard = o.kind === 'barrel' || o.kind === 'rock' || o.kind === 'hay' || o.kind === 'raider' || o.kind === 'heavy' || o.kind === 'oil' || o.kind === 'post' || o.kind === 'bomb';
        if (dx < reach) {
          if (this.airT > 0 && groundHazard) this.nearMiss(o, true);
          else this.collideWith(o);
        } else if (dx < reach + 1.3 && !o.used && (groundHazard || o.kind === 'bullet') && o.kind !== 'oil') this.nearMiss(o, false);
      }
      o.zPrev = z;
    }
  }

  private nearMiss(o: Obj, air: boolean): void {
    o.used = true;
    this.nearMisses++;
    this.score += (air ? 60 : 30) * this.mult;
    this.nitroCd = Math.max(0, this.nitroCd - 1.2);
    this.events.push({ k: 'near', air });
  }

  private endDrift(): void {
    const tier = this.driftTier;
    this.drifting = false;
    if (tier > 0) {
      this.boostT = Math.max(this.boostT, [0, 0.7, 1.2, 1.8][tier]);
      this.nitroCd = Math.max(0, this.nitroCd - tier * 1.5);
      this.events.push({ k: 'drift', phase: 'boost', tier });
    }
    this.driftCharge = 0;
    this.driftTierShown = 0;
  }

  private collideWith(o: Obj): void {
    const boom = (h: number, size: number, color: number) => this.events.push({ k: 'kill', d: o.d, x: o.x, h, size, color });
    switch (o.kind) {
      case 'pickup':
        o.hit = true;
        this.applyUpgrade(o);
        break;
      case 'ramp':
        if (!o.used && this.airT <= 0 && this.speed > 15) {
          o.used = true;
          if (this.drifting) this.endDrift();
          this.airDur = 0.7 + this.speed * 0.012;
          this.airT = this.airDur;
          this.events.push({ k: 'jump' });
        }
        break;
      case 'pad':
        if (!o.used) {
          o.used = true;
          this.boostT = Math.max(this.boostT, 1.3);
          this.events.push({ k: 'pad' });
        }
        break;
      case 'oil':
        if (!o.used) {
          o.used = true;
          this.slipT = 1.4;
          this.events.push({ k: 'slip' });
        }
        break;
      case 'barrel':
        o.hit = true;
        this.speed *= 0.6;
        this.hurt(1);
        boom(0.6, 1.6, 0xff8a00);
        break;
      case 'rock':
      case 'hay':
      case 'post':
        o.hit = true;
        this.speed *= o.kind === 'rock' ? 0.5 : 0.7;
        this.hurt(1);
        boom(0.8, 1.8, o.kind === 'hay' ? 0xffd21f : o.kind === 'post' ? 0xb98a4a : 0x8a8fa3);
        // Clipping something on the verge spins the car out.
        if (Math.abs(o.x) > VERGE) {
          this.slipT = Math.max(this.slipT, 1.0);
          this.speed *= 0.8;
          this.events.push({ k: 'spin' });
        }
        break;
      case 'bomb':
        o.hit = true;
        this.hurt(1);
        this.speed *= 0.75;
        boom(0.8, 3.2, 0xff8a00);
        break;
      case 'vGate':
        o.hit = true;
        this.speed = Math.min(this.speed, 9);
        this.hurt(2);
        boom(1.5, 6, 0xb98a4a);
        break;
      case 'raider':
      case 'heavy':
        o.hit = true;
        this.hurt(1);
        boom(1, 3, 0xff3b30);
        break;
      case 'bullet':
        o.hit = true;
        this.hurt(1);
        boom(0.6, 1.2, 0xff3b30);
        break;
      default:
        break;
    }
  }

  private applyUpgrade(o: Obj): void {
    const u = o.upgrade;
    if (u === 'armor') {
      if (this.upg.armor < ARMOR_CAP) {
        this.upg.armor++;
        this.maxHull = BASE_HULL + this.upg.armor;
      }
      this.hull = Math.min(this.maxHull, this.hull + 1);
    } else if (u === 'shield') this.shield = 8;
    else if (u === 'repair') this.hull = Math.min(this.maxHull, this.hull + 2);
    else this.upg[u] = Math.min(UPGRADE_CAP, this.upg[u] + 1);
    this.score += 50;
    this.events.push({ k: 'pickup', u, d: o.d, x: o.x });
  }

  private hurt(n: number): void {
    if (this.invul > 0 || !this.collide) return;
    this.combo = 0; // taking a hit breaks the chain
    this.comboT = 0;
    if (this.shield > 0) {
      this.shield = 0;
      this.invul = 0.6;
      this.shake = 0.2;
      this.events.push({ k: 'hurt' });
      return;
    }
    this.hull -= n;
    this.invul = 0.8;
    this.shake = 0.45;
    this.flash = 0.3;
    this.events.push({ k: 'hurt' });
    if (this.hull <= 0) {
      this.hull = 0;
      this.over = true;
      this.events.push({ k: 'over' });
    }
  }

  // ───────────── shooting ─────────────
  /** Best target near the crosshair (screen px). Aim assist widens the window; the upper part of a vehicle is a crit. */
  private scan(cx: number, cy: number): { o: Obj; crit: boolean } | null {
    const pad = 40 + 16 * this.upg.spread;
    let best: { o: Obj; crit: boolean } | null = null;
    let bestScore = Infinity;
    for (const o of this.objs) {
      if (o.hit || o.kind === 'pickup' || o.kind === 'rock' || o.kind === 'oil' || o.kind === 'ramp' || o.kind === 'pad' || o.kind === 'post') continue;
      if (o.kind === 'vChief' && this.gateAlive()) continue; // sheltered behind the barricade
      const z = o.d - this.D;
      if (z <= ZNEAR || z > ZFAR) continue;
      const y0 = o.kind === 'bullet' ? o.alt + 0.2 : o.alt;
      const a = this.project(o.d, o.x - o.w / 2, y0);
      const b = this.project(o.d, o.x + o.w / 2, y0 + o.h);
      if (!a || !b) continue;
      const l = Math.min(a.sx, b.sx);
      const r = Math.max(a.sx, b.sx);
      const t = Math.min(a.sy, b.sy);
      const bt = Math.max(a.sy, b.sy);
      const dx = cx < l ? l - cx : cx > r ? cx - r : 0;
      const dy = cy < t ? t - cy : cy > bt ? cy - bt : 0;
      const dist = Math.hypot(dx, dy);
      if (dist > pad) continue;
      const score = dist + z * 0.15;
      if (score < bestScore) {
        bestScore = score;
        const vehicle = o.kind === 'raider' || o.kind === 'heavy' || o.kind === 'boss' || o.kind === 'drone' || o.kind === 'bomber' || o.kind === 'vChief';
        best = { o, crit: vehicle && dist === 0 && cy < t + (bt - t) * 0.38 };
      }
    }
    return best;
  }

  private fire(rx: number, ry: number): void {
    this.shots++;
    this.events.push({ k: 'shot' });
    const hitT = this.scan(rx * innerWidth, ry * innerHeight);
    if (!hitT) {
      this.lastShot = null;
      return;
    }
    const best = hitT.o;
    // Weak point: bosses take triple damage on a crit while charging a volley.
    const crit = hitT.crit;
    const dmg = crit ? (best.kind === 'boss' && best.tele > 0.3 ? 3 : 2) : 1;
    this.shotHits++;
    this.lastShot = { d: best.d, x: best.x, h: best.alt + best.h * 0.5 };
    best.hp -= dmg;
    best.flash = 0.12;
    if (best.hp > 0) {
      this.events.push({ k: 'hit', d: best.d, x: best.x, h: best.alt + best.h * (crit ? 0.75 : 0.5), crit });
      return;
    }
    best.hit = true;
    let pts = 25;
    let size = 1.2;
    let color = 0xffd21f;
    switch (best.kind) {
      case 'raider':
        this.kills++;
        this.addCombo();
        pts = 150;
        size = 3;
        color = 0xff3b30;
        break;
      case 'heavy':
        this.kills++;
        this.addCombo();
        pts = 300;
        size = 4;
        color = 0x9b4dff;
        break;
      case 'boss':
        this.kills++;
        this.addCombo();
        pts = 2000;
        size = 9;
        color = 0xff8a00;
        this.bossDown(best, 'harvester');
        break;
      case 'vChief':
        this.kills++;
        this.addCombo();
        pts = 3000;
        size = 9;
        color = 0xff8a00;
        this.bossDown(best, 'village');
        break;
      case 'vTower':
      case 'vHut':
      case 'vGate':
        this.kills++;
        this.addCombo();
        pts = best.kind === 'vGate' ? 500 : 350;
        size = best.kind === 'vGate' ? 6 : 5;
        color = 0xb98a4a;
        break;
      case 'drone':
      case 'bomber':
        this.kills++;
        this.addCombo();
        pts = best.kind === 'drone' ? 200 : 350;
        size = best.kind === 'drone' ? 2.6 : 3.6;
        color = 0x4fd0ff;
        if (Math.random() < 0.3) {
          const p = mk('pickup', best.d, clampN(best.x, -ROAD_HALF + 2.5, ROAD_HALF - 2.5), 2.6, 1.6, 1);
          p.upgrade = this.pickUpgrade();
          this.objs.push(p);
        }
        break;
      case 'bomb':
        pts = 30;
        size = 3;
        color = 0xff8a00;
        break;
      case 'barrel':
        pts = 40;
        size = 1.8;
        color = 0xff8a00;
        break;
      case 'hay':
        pts = 30;
        size = 2;
        break;
      default:
        break;
    }
    this.score += pts * this.mult * (crit ? 1.5 : 1);
    this.events.push({ k: 'kill', d: best.d, x: best.x, h: best.alt + best.h * 0.5, size, color, crit });
  }

  /** The car drove through the village without felling its chief: the guards are left behind. */
  private endVillage(): void {
    this.boss = null;
    this.bossStyle = null;
    this.village = [];
    this.nextBossD = (zoneIndex(this.D) + 1) * ZONE_LEN + ZONE_LEN - 160;
    this.events.push({ k: 'escaped' });
  }

  private bossDown(chief: Obj, style: BossStyle): void {
    this.boss = null;
    this.bossStyle = null;
    this.bossesDown++;
    this.nextBossD = (zoneIndex(this.D) + 1) * ZONE_LEN + ZONE_LEN - 160;
    // The rest of the village collapses with its chief.
    for (const o of this.village) {
      if (o.hit || o === chief) continue;
      o.hit = true;
      this.events.push({ k: 'kill', d: o.d, x: o.x, h: o.h * 0.5, size: 5, color: 0xb98a4a });
    }
    this.village = [];
    this.events.push({ k: 'boss', phase: 'down', zone: zoneIndex(this.D), style });
    this.dropReward(chief);
  }

  private addCombo(): void {
    const before = this.mult;
    this.combo++;
    this.comboT = 3.2;
    if (this.mult !== before) this.events.push({ k: 'combo', mult: this.mult });
  }

  /** Beating a boss drops a crate and refills a hull point. */
  private dropReward(b: Obj): void {
    const p = mk('pickup', b.d + 18, 0, 2.6, 1.6, 1);
    p.upgrade = this.hull < this.maxHull ? 'repair' : this.pickUpgrade();
    this.objs.push(p);
    this.hull = Math.min(this.maxHull, this.hull + 1);
  }
}
