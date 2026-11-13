// Back2Back 3D stage: three.js renderer, chase camera, world + object views, fx, crosshair → turret aim.
// The sim (sim.ts) is the source of truth; this file mirrors its objects into three.js each frame.
import * as THREE from 'three';
import { createWorld, type World } from './world';
import { createFx, type Fx } from './fx';
import { makeCar, makeEnemy, makeBarrel, makeRock, makeHayBale, makeOilSlick, makeShell, makePickup, updatePickup, updateShell, type CarRig, type EnemyRig } from './models';
import { CAR_Z, type AimIn, type DriveIn, type Game, type GameEvent, type Obj } from './sim';
import { makeFlyer } from './flyers';
import { makeVillagePiece } from './village';
import { createPost, type Post } from './post';
import { createCine, type Cine } from './cine';
import { heading, trackToWorld, turnAhead, type Zone } from './track';

import { makeRamp, makePad, updateProps } from './props';
import { makeVillageDecor } from './village';

// Roadside fence post (simple, readable from far away).
let postMats: { wood: THREE.MeshToonMaterial; band: THREE.MeshToonMaterial } | null = null;
function makePost(): THREE.Group {
  postMats ??= { wood: new THREE.MeshToonMaterial({ color: 0xb98a4a }), band: new THREE.MeshToonMaterial({ color: 0xff3b30 }) };
  const g = new THREE.Group();
  const p = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.4, 0.4), postMats.wood);
  p.position.y = 0.7;
  p.castShadow = true;
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.22, 0.44), postMats.band);
  b.position.y = 1.15;
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 2.4), postMats.wood);
  rail.position.y = 0.95;
  g.add(p, b, rail);
  return g;
}

// Ground blob under flyers and bombs (a bomb's shadow doubles as its landing telegraph).
let shadowGeo: THREE.CircleGeometry | null = null;
function makeShadow(red: boolean): THREE.Mesh {
  if (!shadowGeo) {
    shadowGeo = new THREE.CircleGeometry(1, 24);
    shadowGeo.rotateX(-Math.PI / 2);
  }
  const m = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({ color: red ? 0xff2a1a : 0x000000, transparent: true, opacity: 0.35, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 }));
  m.renderOrder = 2;
  return m;
}

interface View {
  group: THREE.Object3D;
  shadow?: THREE.Mesh;
  rig?: EnemyRig;
  kind: Obj['kind'];
  lastFlash: number;
}

const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpC = new THREE.Vector3();

export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(62, 1, 0.3, 700);
  private readonly world: World;
  private fx!: Fx;
  private readonly post: Post;
  readonly cine: Cine = createCine();
  /** Sim time scale requested by the active cinematic shot (1 = normal). */
  timeScale = 1;
  /** Set by the integrator: slow-mo amount (0..1) and a white flash pulse (0..1) for post-processing. */
  slow = 0;
  whiteFlash = 0;
  private lastAir = 0;
  private turnSm = 0;
  // Sprung body: pitch (squat / dive), roll (lean) and heave (bumps), each a damped spring.
  private susp = { p: 0, pv: 0, r: 0, rv: 0, h: 0, hv: 0, y: 0, yv: 0 };
  private camAcc = 0;
  private camLat = 0;

  private suspStep(dt: number): void {
    const g = this.game;
    const s = this.susp;
    const sp01 = Math.min(1.2, g.speed / 50);
    const grounded = g.airT <= 0;
    const pT = grounded ? Math.max(-0.14, Math.min(0.12, g.accLong * 0.0042)) : 0;
    const rT = grounded ? Math.max(-0.13, Math.min(0.13, g.accLat * 0.0055)) : 0;
    const yT = Math.max(-0.35, Math.min(0.35, -g.slipAng * 0.55));
    const verge = Math.abs(g.carRel) > 8.5 && grounded;
    const bump = grounded ? (Math.sin(g.D * 0.9) * 0.5 + Math.sin(g.D * 2.3 + 1) * 0.35) * 0.02 * sp01 + (verge ? (Math.random() - 0.5) * 0.12 : 0) : 0;
    const step = (x: number, v: number, target: number, k: number, c: number): [number, number] => {
      v += (k * (target - x) - c * v) * dt;
      return [x + v * dt, v];
    };
    [s.p, s.pv] = step(s.p, s.pv, pT, 70, 9);
    [s.r, s.rv] = step(s.r, s.rv, rT, 60, 8);
    [s.h, s.hv] = step(s.h, s.hv, bump, 140, 11);
    [s.y, s.yv] = step(s.y, s.yv, yT, 50, 8);
  }

  // ── storm finale: a dark wall rolls over the car, lightning flashes, the buggy is lifted and spun away ──
  private endT = 0;
  private wall: THREE.Group | null = null;
  private bolts: THREE.Line[] = [];
  private nextBolt = 0;
  private boltT = 0;
  private readonly skL = new THREE.Vector3();
  private readonly skR = new THREE.Vector3();
  private decor: THREE.Group | null = null;
  private decorD = 0;
  turnHint = 0;
  shakeScale = 1;
  setQuality(q: 'high' | 'low'): void {
    this.post.setQuality(q);
  }
  private readonly cineBase = { pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 62 };
  private readonly bossTmp = new THREE.Vector3();
  private readonly car: CarRig;
  private readonly views = new Map<number, View>();
  private readonly raycaster = new THREE.Raycaster();
  private readonly ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.3);
  private fov = 62;
  private smoothX = 0;
  private zoneCb: (z: Zone, i: number) => void = () => {};
  /** Screen-space aim point (fractions) → world target under the crosshair, for tracers. */
  readonly target = new THREE.Vector3();

  constructor(canvas: HTMLCanvasElement, private readonly game: Game) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.world = createWorld(this.scene, this.renderer);
    this.post = createPost(this.renderer, this.scene, this.camera);
    this.world.onZone((z, i) => this.zoneCb(z, i));
    this.fx = createFx(this.scene);
    this.car = makeCar();
    this.car.group.rotation.order = 'YXZ';
    this.scene.add(this.car.group);
    this.resize();
    game.project = (d, x, y) => this.project(d, x, y);
  }

  onZone(cb: (z: Zone, i: number) => void): void {
    this.zoneCb = cb;
  }

  resize(): void {
    const w = innerWidth;
    const h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = `${w}px`;
    this.renderer.domElement.style.height = `${h}px`;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.post?.resize(w, h);
    this.fx?.setViewScale(h / (2 * Math.tan((this.camera.fov * Math.PI) / 360)));
  }

  /** Screen position (CSS px) of a road point, or null when behind the camera. */
  project(d: number, x: number, y: number): { sx: number; sy: number } | null {
    const v = trackToWorld(d, x, y, tmpA);
    v.project(this.camera);
    if (v.z > 1 || v.z < -1) return null;
    return { sx: ((v.x + 1) / 2) * innerWidth, sy: ((1 - v.y) / 2) * innerHeight };
  }

  /** Start the "swallowed by the storm" finale (the sim is already over). */
  startStormEnd(): void {
    this.stormReset();
    this.endT = 0.001;
    this.nextBolt = 0.2;
    const wall = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: 0x24103e, fog: false });
    const mat2 = new THREE.MeshBasicMaterial({ color: 0x3b2266, fog: false });
    for (let i = 0; i < 26; i++) {
      const r = 7 + Math.random() * 9;
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), i % 3 ? mat : mat2);
      m.position.set(-34 + (i % 9) * 8.5 + Math.random() * 4, 4 + Math.random() * 20, -((i / 9) | 0) * 9 - Math.random() * 6);
      m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      wall.add(m);
    }
    this.scene.add(wall);
    this.wall = wall;
    const bm = new THREE.LineBasicMaterial({ color: 0xf4eaff, fog: false });
    for (let i = 0; i < 3; i++) {
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 7; k++) pts.push(new THREE.Vector3((Math.random() - 0.5) * 3, 30 - k * 4.3, (Math.random() - 0.5) * 3));
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), bm);
      line.visible = false;
      this.scene.add(line);
      this.bolts.push(line);
    }
    this.cine.play('crash', {});
  }

  /** Clear any storm-finale state (new run / back to title). */
  stormReset(): void {
    this.endT = 0;
    if (this.wall) {
      this.scene.remove(this.wall);
      this.wall = null;
    }
    for (const b of this.bolts) this.scene.remove(b);
    this.bolts = [];
    this.world.setNight?.(0);
    this.whiteFlash = 0;
    this.car.group.rotation.z = 0;
    this.car.group.rotation.x = 0;
  }

  private stormEndStep(dt: number, carPos: THREE.Vector3, yaw: number): void {
    this.endT += dt;
    const t = this.endT;
    const back = tmpA.set(Math.sin(yaw), 0, Math.cos(yaw));
    // the wall rolls forward and swallows the car around t = 1.8 s
    const dist = Math.max(-8, 80 - 48 * t);
    if (this.wall) {
      this.wall.position.copy(carPos).addScaledVector(back, dist).setY(0);
      this.wall.rotation.y = yaw;
    }
    this.world.setNight?.(Math.min(1, 0.7 + t * 0.4));
    // lightning
    this.boltT -= dt;
    if (this.boltT <= 0) for (const b of this.bolts) b.visible = false;
    this.nextBolt -= dt;
    if (this.nextBolt <= 0 && this.bolts.length) {
      this.nextBolt = 0.25 + Math.random() * 0.4;
      this.boltT = 0.12;
      this.whiteFlash = Math.max(this.whiteFlash, 0.55 + Math.random() * 0.3);
      const b = this.bolts[(Math.random() * this.bolts.length) | 0];
      b.visible = true;
      b.position.copy(carPos).addScaledVector(back, dist * 0.5 + (Math.random() - 0.5) * 18).setY(0);
      b.position.x += (Math.random() - 0.5) * 24;
    }
    // the buggy is lifted and spun away once the wall arrives
    const k = Math.max(0, t - 1.5);
    this.car.group.position.y = Math.min(14, k * k * 5);
    this.car.group.position.addScaledVector(back, -k * 6);
    this.car.group.rotation.y = yaw + k * k * 2.4;
    this.car.group.rotation.z = Math.sin(k * 6) * Math.min(1, k) * 0.9;
    this.car.group.rotation.x = Math.min(1.2, k * 0.8);
    this.slow = 0.55;
    if (t > 1.7 && Math.random() < dt * 40) this.fx.debris(tmpB.copy(this.car.group.position), 0xb8763e, 6);
  }

  // ───────────── frame ─────────────
  update(dt: number, t: number, drive: DriveIn, aim: AimIn, showAim: boolean): void {
    const g = this.game;
    const carD = g.D + CAR_Z;
    const carPos = trackToWorld(carD, g.carRel, 0, tmpB);
    const yaw = heading(carD);

    // Camera: behind and above the car, looking down the road; leans into the lane and pulls back on nitro.
    this.smoothX += (g.carRel * 0.8 - this.smoothX) * Math.min(1, dt * 4);
    this.camAcc += (g.accLong - this.camAcc) * Math.min(1, dt * 3);
    this.camLat += (g.accLat - this.camLat) * Math.min(1, dt * 3);
    const camBack = 4.5 + Math.max(-0.5, Math.min(1.1, this.camAcc * 0.04));
    const camPos = trackToWorld(g.D - camBack, this.smoothX, 4.6 + g.speed * 0.01 + this.susp.h * 0.6, tmpC);
    const turn = turnAhead(g.D, 70);
    this.turnSm += (turn - this.turnSm) * Math.min(1, dt * 3);
    const look = trackToWorld(g.D + 24 + 30 * Math.abs(this.turnSm), this.smoothX * 0.7 + this.turnSm * 5, 1.4, tmpA);
    if (g.shake > 0 && !this.cine.active) {
      const k = g.shake * 0.5 * this.shakeScale;
      camPos.x += (Math.random() - 0.5) * k;
      camPos.y += (Math.random() - 0.5) * k;
    }
    const targetFov = 62 + Math.min(1, g.speed / 80) * 6 + (g.nitroT > 0 ? 12 : 0);
    this.fov += (targetFov - this.fov) * Math.min(1, dt * 5);
    const base = this.cineBase;
    base.pos.copy(camPos);
    base.look.copy(look);
    base.fov = this.fov;
    const bossPos = g.boss ? trackToWorld(g.boss.d, g.boss.x, 0, this.bossTmp) : null;
    const co = this.cine.update(base, { dt, carPos, carYaw: yaw, speed: g.speed, D: g.D, carRel: g.carRel, bossPos });
    this.timeScale = co.timeScale;
    this.slow = 1 - co.timeScale;
    this.camera.position.copy(co.pos);
    this.camera.lookAt(co.look);
    this.camera.rotateZ(co.roll + (co.active ? 0 : -this.turnSm * 0.06 - this.camLat * 0.0022));
    if (Math.abs(this.camera.fov - co.fov) > 0.05) {
      this.camera.fov = co.fov;
      this.camera.updateProjectionMatrix();
    }
    this.camera.updateMatrixWorld(true);

    // Crosshair → a point on a plane above the road → turret yaw / pitch.
    this.raycaster.setFromCamera(new THREE.Vector2(aim.rx * 2 - 1, -(aim.ry * 2 - 1)), this.camera);
    if (!this.raycaster.ray.intersectPlane(this.ground, this.target)) this.target.copy(look);
    const muzzle = this.car.muzzle.getWorldPosition(new THREE.Vector3());
    const dx = this.target.x - muzzle.x;
    const dz = this.target.z - muzzle.z;
    const aimYaw = Math.atan2(-dx, -dz) - yaw;
    const aimPitch = Math.atan2(this.target.y - muzzle.y, Math.hypot(dx, dz));

    // Car
    const air = g.air;
    const airVel = (air - this.lastAir) / Math.max(dt, 1e-3);
    this.lastAir = air;
    this.car.group.position.copy(carPos);
    this.suspStep(dt);
    this.car.group.position.y = air + Math.max(-0.12, Math.min(0.12, this.susp.h));
    this.car.group.rotation.y = yaw + this.susp.y;
    this.car.group.rotation.x = (air > 0 ? Math.max(-0.45, Math.min(0.45, airVel * 0.045)) : 0) + this.susp.p;
    this.car.group.rotation.z = this.susp.r;
    this.car.update(dt, t, {
      steer: g.steerApplied,
      speed: g.speed,
      nitro: g.nitroT > 0,
      aimYaw: showAim ? aimYaw : 0,
      aimPitch: showAim ? aimPitch : 0,
      firing: aim.fire && showAim,
      hurt: g.invul > 0 && g.shield <= 0,
      shield: g.shield > 0,
      upgrades: g.upg,
      braking: !!drive.brake,
      drifting: g.drifting,
      damage: Math.max(0, Math.min(1, 1 - g.hull / g.maxHull)),
    });
    this.turnHint = turn;
    if (this.endT > 0) this.stormEndStep(dt, carPos, yaw);

    this.syncObjects(dt, t);
    this.ambientFx(dt, carPos, yaw);
    if (this.endT <= 0) this.world.setNight?.(Math.max(0, Math.min(1, 1 - g.stormGap / 160)) * 0.7);
    if (this.decor && (g.D > this.decorD + 140 || g.D < this.decorD - 200)) {
      this.scene.remove(this.decor);
      this.decor = null;
    }
    this.world.update(g.D, t, dt, g.speed);
    this.fx.update(dt);
    this.whiteFlash = Math.max(0, this.whiteFlash - dt * 1.6);
    this.post.render(dt, {
      speed: g.speed,
      nitro: g.nitroT > 0,
      hurt: Math.min(1, g.flash / 0.3),
      boost: Math.min(1, g.boostT) * 0.8 + (g.drifting ? g.driftTier * 0.15 : 0),
      slow: this.slow,
      flash: this.whiteFlash,
    });
  }

  private ambientFx(dt: number, carPos: THREE.Vector3, yaw: number): void {
    const g = this.game;
    const back = tmpA.set(Math.sin(yaw), 0, Math.cos(yaw)); // behind the car
    if (g.nitroT > 0 && Math.random() < dt * 90) {
      this.fx.nitro(tmpB.copy(carPos).addScaledVector(back, 2.2).setY(0.7), back);
    }
    if (g.speed > 8 && Math.abs(g.steerApplied) > 0.6 && Math.random() < dt * 50) {
      this.fx.dust(tmpB.copy(carPos).addScaledVector(back, 1.6).setY(0.1), tmpC.set(Math.random() - 0.5, 1.2, Math.random() - 0.5));
    }
    {
      const right = tmpC.set(Math.cos(yaw), 0, -Math.sin(yaw));
      const rear = tmpA.copy(carPos).addScaledVector(back, 1.5);
      const l = this.skL.copy(rear).addScaledVector(right, -0.95).setY(0.05);
      const r = this.skR.copy(rear).addScaledVector(right, 0.95).setY(0.05);
      const drifting = g.drifting && g.air <= 0;
      this.fx.skid(l, r, drifting ? 1 : 0);
      if (drifting) {
        const dir = tmpB.copy(right).multiplyScalar(Math.sign(g.steerApplied) || 1);
        if (Math.random() < dt * 40) this.fx.tireSmoke(l, dir, 1);
        if (Math.random() < dt * 30) this.fx.sparkTrail(r, tmpB.set((Math.random() - 0.5) * 3, 2, (Math.random() - 0.5) * 3));
      }
    }
    if (g.hull <= 2 && g.hull > 0 && Math.random() < dt * 8) this.fx.smoke(tmpB.copy(carPos).setY(1.4), 1);
    if (Math.abs(g.carRel) > 10 && g.speed > 8 && Math.random() < dt * 60) {
      this.fx.dust(tmpB.copy(carPos).addScaledVector(back, 1.2).setY(0.1), tmpC.set(Math.random() - 0.5, 1.6, Math.random() - 0.5));
    }
  }

  // ───────────── objects ─────────────
  private makeView(o: Obj): View {
    switch (o.kind) {
      case 'raider':
      case 'heavy':
      case 'boss': {
        const rig = makeEnemy(o.kind);
        const wrap = new THREE.Group();
        rig.group.rotation.y = Math.PI; // face the player
        wrap.add(rig.group);
        return { group: wrap, rig, kind: o.kind, lastFlash: 0 };
      }
      case 'drone':
      case 'bomber': {
        const rig = makeFlyer(o.kind);
        const wrap = new THREE.Group();
        rig.group.rotation.y = Math.PI;
        wrap.add(rig.group);
        return { group: wrap, rig, kind: o.kind, lastFlash: 0, shadow: makeShadow(false) };
      }
      case 'vTower':
      case 'vHut':
      case 'vGate':
      case 'vChief': {
        const rig = makeVillagePiece(o.kind);
        const wrap = new THREE.Group();
        rig.group.rotation.y = Math.PI;
        wrap.add(rig.group);
        return { group: wrap, rig, kind: o.kind, lastFlash: 0 };
      }
      case 'post':
        return { group: makePost(), kind: o.kind, lastFlash: 0 };
      case 'bomb': {
        const s = makeShell();
        s.scale.setScalar(2.2);
        return { group: s, kind: o.kind, lastFlash: 0, shadow: makeShadow(true) };
      }
      case 'barrel':
        return { group: makeBarrel(), kind: o.kind, lastFlash: 0 };
      case 'rock':
        return { group: makeRock(o.id), kind: o.kind, lastFlash: 0 };
      case 'hay':
        return { group: makeHayBale(), kind: o.kind, lastFlash: 0 };
      case 'oil':
        return { group: makeOilSlick(), kind: o.kind, lastFlash: 0 };
      case 'bullet':
        return { group: makeShell(), kind: o.kind, lastFlash: 0 };
      case 'pickup':
        return { group: makePickup(o.upgrade), kind: o.kind, lastFlash: 0 };
      case 'ramp':
        return { group: makeRamp(), kind: o.kind, lastFlash: 0 };
      case 'pad':
        return { group: makePad(), kind: o.kind, lastFlash: 0 };
    }
  }

  private syncObjects(dt: number, t: number): void {
    const g = this.game;
    const live = new Set<number>();
    for (const o of g.objs) {
      const z = o.d - g.D;
      if (z > 270 || z < -12) continue;
      live.add(o.id);
      let v = this.views.get(o.id);
      if (!v) {
        v = this.makeView(o);
        this.views.set(o.id, v);
        this.scene.add(v.group);
        if (v.shadow) this.scene.add(v.shadow);
      }
      const y = o.kind === 'bullet' ? 1.1 + o.alt : o.alt;
      trackToWorld(o.d, o.x, y, v.group.position);
      v.group.rotation.y = heading(o.d) + (o.kind === 'bullet' || o.kind === 'bomb' ? Math.PI : 0); // shells fly toward the car
      if (v.shadow) {
        trackToWorld(o.d, o.x, 0.07, v.shadow.position);
        v.shadow.rotation.y = heading(o.d);
        const mat = v.shadow.material as THREE.MeshBasicMaterial;
        if (o.kind === 'bomb') {
          const pulse = 0.5 + 0.5 * Math.sin(t * 18);
          v.shadow.scale.setScalar(1.3 + 0.4 * o.tele);
          mat.opacity = 0.25 + 0.4 * o.tele * (0.6 + 0.4 * pulse);
        } else {
          v.shadow.scale.set(o.w * 0.7, 1, o.w * 0.5);
          mat.opacity = Math.max(0.12, 0.42 - o.alt * 0.04);
        }
      }
      if (v.rig) {
        if (o.flash > 0 && v.lastFlash <= 0) v.rig.flash();
        v.lastFlash = o.flash;
        v.rig.update(dt, t, { hpFrac: o.hp / o.hpMax, speed: g.speed, telegraph: o.tele });
      } else if (o.kind === 'pickup') updatePickup(v.group as THREE.Group, t);
      else if (o.kind === 'bullet') updateShell(v.group as THREE.Group, t);
      else if (o.kind === 'pad') updateProps(v.group, t);
    }
    for (const [id, v] of this.views) {
      if (live.has(id)) continue;
      this.scene.remove(v.group);
      if (v.shadow) {
        this.scene.remove(v.shadow);
        (v.shadow.material as THREE.Material).dispose();
      }
      this.views.delete(id);
    }
  }

  // ───────────── events ─────────────
  handle(e: GameEvent): void {
    switch (e.k) {
      case 'shot': {
        const m = this.car.muzzle.getWorldPosition(tmpA.clone());
        const dir = tmpB.copy(this.target).sub(m).normalize();
        this.fx.muzzle(m, dir);
        this.car.fireKick();
        const end = this.game.lastShot ? trackToWorld(this.game.lastShot.d, this.game.lastShot.x, this.game.lastShot.h, tmpC) : this.target;
        this.fx.tracer(m, end, 0xffd21f);
        if (!this.game.lastShot) this.fx.impact(this.target, 0xffd21f);
        break;
      }
      case 'hit':
        this.fx.impact(trackToWorld(e.d, e.x, e.h, tmpA), 0xffffff);
        break;
      case 'kill':
        this.fx.explosion(trackToWorld(e.d, e.x, e.h, tmpA), e.size, e.color);
        break;
      case 'land':
        this.susp.hv -= 2.4;
        this.susp.pv -= 1.2;
        break;
      case 'hurt':
        this.susp.rv += (Math.random() - 0.5) * 5;
        this.susp.pv -= 1.6;
        this.susp.yv += (Math.random() - 0.5) * 3;
        break;
      case 'shift':
        this.susp.pv += 0.9;
        break;
      case 'pickup':
        this.fx.pickupBurst(trackToWorld(e.d, e.x, 1.2, tmpA), 0xffd21f);
        break;
      case 'boss':
        if (e.phase === 'down') {
          const p = tmpA.copy(this.camera.position);
          const bp = this.game.boss ? trackToWorld(this.game.boss.d, this.game.boss.x, 1.5, tmpB) : p;
          this.fx.shockwave(bp, 8);
          this.fx.confetti(bp);
          this.fx.debris(bp, 0xff8a00, 30);
          this.whiteFlash = 0.8;
        } else if (e.style === 'village') {
          if (this.decor) this.scene.remove(this.decor);
          this.decor = makeVillageDecor();
          this.decorD = this.game.villageBase;
          trackToWorld(this.game.villageBase + 20, 0, 0, this.decor.position);
          this.decor.rotation.y = 0;
          this.scene.add(this.decor);
        }
        break;
      default:
        break;
    }
  }
}
