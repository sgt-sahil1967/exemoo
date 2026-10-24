/**
 * Environments: 'club' (bright community hall) and 'arena' (evening competition).
 * Only meshes live here; the Stage owns a fixed light rig and just re-tunes it per theme
 * (constant light count → no shader recompiles on theme switch).
 */
import {
  AdditiveBlending,
  BoxGeometry,
  CapsuleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  SphereGeometry,
  type BufferGeometry,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Quality, Side, ThemeName } from '../core/contracts';
import { PALETTE } from '../core/contracts';
import {
  makeArenaFloorTexture,
  makeBarrierTexture,
  makeClubFloorTexture,
  makeConeTexture,
  makeGradientTexture,
  makeLedTexture,
  makeWindowTexture,
  rng,
} from './textures';
import { mat, mergeStatic, shadowed } from './util';

export interface LightConfig {
  background: string;
  fog: [string, number, number];
  hemiSky: string;
  hemiGround: string;
  hemi: number;
  dirColor: string;
  dir: number;
  dirPos: [number, number, number];
  spotColor: string;
  spot: number;
  exposure: number;
}

export interface Environment {
  group: Group;
  lights: LightConfig;
  update(dt: number, time: number): void;
  pulse(side: Side, color: string): void;
}

export function buildEnvironment(theme: ThemeName, quality: Quality): Environment {
  const env = theme === 'club' ? buildClub(quality) : buildArena(quality);
  mergeStatic(env.group);
  return env;
}

// ───────────────────────────────────── CLUB ─────────────────────────────────────
function buildClub(quality: Quality): Environment {
  const g = new Group();
  const RX = 16;
  const RZ = 22;
  const WALL_H = 5.5;
  const floor = new Mesh(new PlaneGeometry(RX, RZ), new MeshStandardMaterial({ map: makeClubFloorTexture(RX, RZ), roughness: 0.62 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  g.add(floor);

  const wallTex = makeGradientTexture([
    [0, '#fbf6ec'],
    [0.75, '#efe5d3'],
    [1, '#e5d8c1'],
  ]);
  const wallMat = new MeshStandardMaterial({ map: wallTex, roughness: 0.95 });
  const skirtMat = mat('#c98d5c', { rough: 0.7 });
  const addWall = (w: number, x: number, z: number, ry: number): void => {
    const m = new Mesh(new PlaneGeometry(w, WALL_H), wallMat);
    m.position.set(x, WALL_H / 2, z);
    m.rotation.y = ry;
    m.receiveShadow = true;
    g.add(m);
    const sk = new Mesh(new BoxGeometry(w, 0.14, 0.03), skirtMat);
    sk.position.set(x, 0.07, z);
    sk.rotation.y = ry;
    sk.translateZ(0.015);
    g.add(sk);
    // painted accent band
    const band = new Mesh(new PlaneGeometry(w, 0.12), mat(PALETTE.accent2, { rough: 0.9 }));
    band.position.set(x, 1.35, z);
    band.rotation.y = ry;
    band.translateZ(0.005);
    g.add(band);
  };
  addWall(RX, 0, -RZ / 2, 0);
  addWall(RX, 0, RZ / 2, Math.PI);
  addWall(RZ, -RX / 2, 0, Math.PI / 2);
  addWall(RZ, RX / 2, 0, -Math.PI / 2);

  // big soft windows (back wall + left wall)
  const winTex = makeWindowTexture();
  const paneMat = new MeshBasicMaterial({ map: winTex, color: '#ffffff' });
  const mullMat = mat('#ffffff', { rough: 0.5 });
  const addWindow = (x: number, z: number, ry: number, w: number, h: number, y: number): void => {
    const wg = new Group();
    const pane = new Mesh(new PlaneGeometry(w, h), paneMat);
    wg.add(pane);
    const fr = 0.08;
    for (const [px, py, sw, sh] of [
      [0, h / 2, w + fr, fr],
      [0, -h / 2, w + fr, fr * 1.6],
      [-w / 2, 0, fr, h],
      [w / 2, 0, fr, h],
      [0, 0, fr * 0.6, h],
      [0, h * 0.18, w, fr * 0.6],
    ] as [number, number, number, number][]) {
      const b = new Mesh(new BoxGeometry(sw, sh, 0.06), mullMat);
      b.position.set(px, py, 0.03);
      wg.add(b);
    }
    wg.position.set(x, y, z);
    wg.rotation.y = ry;
    wg.translateZ(0.01);
    g.add(wg);
  };
  for (const x of [-4.6, 0, 4.6]) addWindow(x, -RZ / 2, 0, 3.2, 2.6, 3.0);
  for (const z of [-6, -1.5, 3]) addWindow(-RX / 2, z, Math.PI / 2, 3.0, 2.6, 3.0);

  // ceiling beams + pendant lamps (seen in menu orbit)
  const beamMat = mat('#e9dcc6', { rough: 0.9 });
  for (const z of [-7, -3.5, 0, 3.5, 7]) {
    const b = new Mesh(new BoxGeometry(RX, 0.3, 0.25), beamMat);
    b.position.set(0, WALL_H - 0.15, z);
    g.add(b);
  }
  const ceil = new Mesh(new PlaneGeometry(RX, RZ), mat('#f3ecdf', { rough: 1 }));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = WALL_H;
  g.add(ceil);
  const shadeMat = mat(PALETTE.ink, { rough: 0.5 });
  const bulbMat = new MeshBasicMaterial({ color: '#fff4dc' });
  for (const [x, z] of [[0, -1.0], [0, -4.6], [-4.5, -1.0], [4.5, -1.0]]) {
    const cord = new Mesh(new CylinderGeometry(0.006, 0.006, 1.6, 6), shadeMat);
    cord.position.set(x, WALL_H - 0.8, z);
    const shade = new Mesh(new ConeGeometry(0.42, 0.3, 24, 1, true), shadeMat);
    shade.material.side = DoubleSide;
    shade.position.set(x, WALL_H - 1.7, z);
    const bulb = new Mesh(new SphereGeometry(0.11, 14, 10), bulbMat);
    bulb.position.set(x, WALL_H - 1.82, z);
    g.add(cord, shade, bulb);
  }

  // low barriers with SPINSHOT panels around the court
  const texA = makeBarrierTexture(PALETTE.ink, '#ffffff', PALETTE.accent);
  const texB = makeBarrierTexture(PALETTE.accent, '#ffffff', PALETTE.gold);
  const panelA = new MeshStandardMaterial({ map: texA, roughness: 0.7 });
  const panelB = new MeshStandardMaterial({ map: texB, roughness: 0.7 });
  const edge = mat('#2a3042', { rough: 0.6 });
  const BX = 3.6;
  const BZ = 5.6;
  const addBarrier = (x: number, z: number, ry: number, i: number): void => {
    const bg = new Group();
    const body = new Mesh(new BoxGeometry(2.0, 0.62, 0.05), edge);
    body.position.y = 0.36;
    bg.add(body);
    for (const s of [-1, 1]) {
      const face = new Mesh(new PlaneGeometry(1.96, 0.58), i % 2 ? panelB : panelA);
      face.position.set(0, 0.36, s * 0.0255);
      face.rotation.y = s > 0 ? 0 : Math.PI;
      bg.add(face);
    }
    for (const s of [-1, 1]) {
      const foot = new Mesh(new BoxGeometry(0.06, 0.05, 0.38), edge);
      foot.position.set(s * 0.85, 0.025, 0);
      bg.add(foot);
    }
    bg.position.set(x, 0, z);
    bg.rotation.y = ry;
    g.add(shadowed(bg));
  };
  let bi = 0;
  for (let x = -BX + 1; x <= BX - 1 + 1e-3; x += 2) {
    addBarrier(x, -BZ, 0, bi++);
    addBarrier(x, BZ, Math.PI, bi++);
  }
  for (let z = -BZ + 1.2; z <= BZ - 1.2 + 1e-3; z += 2.05) {
    addBarrier(-BX - 0.0, z, Math.PI / 2, bi++);
    addBarrier(BX + 0.0, z, -Math.PI / 2, bi++);
  }

  // plants
  const r = rng(11);
  const potMat = mat('#d9825b', { rough: 0.8, flat: true });
  const leafMats = [mat('#5fae6e', { flat: true, rough: 0.8 }), mat('#4c9a62', { flat: true, rough: 0.8 }), mat('#7cc47f', { flat: true, rough: 0.8 })];
  const addPlant = (x: number, z: number, kind: number, s = 1): void => {
    const pg = new Group();
    const pot = new Mesh(new CylinderGeometry(0.26, 0.2, 0.42, 8), potMat);
    pot.position.y = 0.21;
    pg.add(pot);
    if (kind === 0) {
      for (let i = 0; i < 4; i++) {
        const b = new Mesh(new IcosahedronGeometry(0.32 + r() * 0.12, 0), leafMats[i % 3]);
        b.position.set((r() - 0.5) * 0.35, 0.75 + i * 0.2 + r() * 0.1, (r() - 0.5) * 0.35);
        b.rotation.set(r() * 3, r() * 3, r() * 3);
        pg.add(b);
      }
    } else {
      for (let i = 0; i < 7; i++) {
        const leaf = new Mesh(new ConeGeometry(0.07, 0.9 + r() * 0.6, 4), leafMats[i % 3]);
        const a = (i / 7) * Math.PI * 2;
        leaf.position.set(Math.cos(a) * 0.09, 0.8, Math.sin(a) * 0.09);
        leaf.rotation.set(Math.sin(a) * 0.25, r(), -Math.cos(a) * 0.25);
        pg.add(leaf);
      }
    }
    pg.position.set(x, 0, z);
    pg.scale.setScalar(s);
    g.add(shadowed(pg));
  };
  addPlant(-6.8, -9.6, 0, 1.3);
  addPlant(-5.2, -9.8, 1, 1.1);
  addPlant(6.6, -9.5, 1, 1.2);
  addPlant(7.0, -7.2, 0, 1.0);
  addPlant(-7.1, 6.5, 0, 1.2);
  addPlant(4.6, -6.3, 1, 0.9);
  addPlant(-4.6, -6.4, 0, 0.9);

  // bench + spare ball basket by the back wall
  const bench = new Group();
  const seat = new Mesh(new BoxGeometry(2.4, 0.07, 0.42), mat('#d9a066', { rough: 0.6 }));
  seat.position.y = 0.45;
  bench.add(seat);
  for (const s of [-1, 1]) {
    const leg = new Mesh(new BoxGeometry(0.06, 0.45, 0.36), edge);
    leg.position.set(s * 1.05, 0.225, 0);
    bench.add(leg);
  }
  bench.position.set(-6.9, 0, -2);
  bench.rotation.y = Math.PI / 2;
  g.add(shadowed(bench));
  const basket = new Mesh(new CylinderGeometry(0.28, 0.22, 0.5, 10, 1, true), new MeshStandardMaterial({ color: PALETTE.accent2, side: DoubleSide, roughness: 0.6 }));
  basket.position.set(4.4, 0.25, -6.9);
  g.add(shadowed(basket));
  const balls = new InstancedMesh(new SphereGeometry(0.025, 8, 6), mat('#fff3df', { rough: 0.4 }), 30);
  const o = new Object3D();
  for (let i = 0; i < 30; i++) {
    const a = r() * Math.PI * 2;
    const rr = r() * 0.22;
    o.position.set(4.4 + Math.cos(a) * rr, 0.42 + r() * 0.08, -6.9 + Math.sin(a) * rr);
    o.updateMatrix();
    balls.setMatrixAt(i, o.matrix);
  }
  g.add(balls);
  void quality;

  return {
    group: g,
    lights: {
      background: '#efe6d6',
      fog: ['#efe6d6', 14, 34],
      hemiSky: '#fff6e8',
      hemiGround: '#caa37c',
      hemi: 1.25,
      dirColor: '#fff0da',
      dir: 2.9,
      dirPos: [-3.5, 7, 2.5],
      spotColor: '#fff4e0',
      spot: 18,
      exposure: 1.0,
    },
    update: () => {},
    pulse: () => {},
  };
}

// ───────────────────────────────────── ARENA ────────────────────────────────────
function buildArena(quality: Quality): Environment {
  const g = new Group();
  const FX = 30;
  const FZ = 36;
  const CX = 7;
  const CZ = 12.5;
  const floor = new Mesh(new PlaneGeometry(FX, FZ), new MeshStandardMaterial({ map: makeArenaFloorTexture(FX, FZ, CX, CZ), roughness: 0.55 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  g.add(floor);

  // LED barrier boards
  const led = makeLedTexture();
  const ledMat = new MeshBasicMaterial({ map: led, color: '#ffffff' });
  const boardBody = mat('#0b1020', { rough: 0.5 });
  const BX = CX / 2 + 0.2;
  const BZ = CZ / 2 + 0.2;
  const boards: Mesh[] = [];
  const addBoard = (x: number, z: number, ry: number, w: number, off: number): void => {
    const bg = new Group();
    const body = new Mesh(new BoxGeometry(w, 0.8, 0.22), boardBody);
    body.position.y = 0.4;
    bg.add(body);
    const m = ledMat.clone();
    m.map = led.clone();
    m.map.repeat.set(w / 8, 1);
    m.map.offset.x = off;
    const face = new Mesh(new PlaneGeometry(w - 0.06, 0.62), m);
    face.position.set(0, 0.42, 0.111);
    bg.add(face);
    boards.push(face);
    bg.position.set(x, 0, z);
    bg.rotation.y = ry;
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(bg);
  };
  addBoard(0, -BZ, 0, CX + 0.4, 0);
  addBoard(0, BZ, Math.PI, CX + 0.4, 0.3);
  addBoard(-BX, 0, Math.PI / 2, CZ - 0.2, 0.55);
  addBoard(BX, 0, -Math.PI / 2, CZ - 0.2, 0.8);

  // stands: stepped tiers on 3 sides + crowd
  const tierMat = mat('#1a2238', { rough: 0.8 });
  const tierEdge = mat('#26304d', { rough: 0.7 });
  const seats: { x: number; y: number; z: number; ry: number }[] = [];
  const ROWS = 6;
  const addStand = (cx: number, cz: number, ry: number, len: number, startD: number): void => {
    const sg = new Group();
    for (let r = 0; r < ROWS; r++) {
      const step = new Mesh(new BoxGeometry(len, 0.5 * (r + 1), 0.95), r % 2 ? tierMat : tierEdge);
      step.position.set(0, 0.25 * (r + 1), -(startD + r * 0.95));
      sg.add(step);
      for (let s = 0; s < Math.floor(len / 0.62); s++) {
        const lx = -len / 2 + 0.31 + s * 0.62;
        seats.push({ x: lx, y: 0.5 * (r + 1), z: -(startD + r * 0.95) + 0.1, ry: 0 });
        const last = seats[seats.length - 1];
        // convert to world
        const o = new Object3D();
        o.position.set(lx, last.y, last.z);
        o.rotation.y = 0;
        sg.position.set(cx, 0, cz);
        sg.rotation.y = ry;
        sg.updateMatrixWorld(true);
        o.applyMatrix4(sg.matrixWorld);
        last.x = o.position.x;
        last.z = o.position.z;
        last.ry = ry;
      }
    }
    sg.position.set(cx, 0, cz);
    sg.rotation.y = ry;
    g.add(sg);
  };
  // sides face inward: stand local −Z extends away from court
  addStand(-(CX / 2 + 2.2), 0, Math.PI / 2, 16, 0);
  addStand(CX / 2 + 2.2, 0, -Math.PI / 2, 16, 0);
  addStand(0, -(CZ / 2 + 2.0), 0, 12, 0);
  addStand(0, CZ / 2 + 3.0, Math.PI, 12, 0);

  const r = rng(5);
  const frac = quality === 'high' ? 0.92 : quality === 'medium' ? 0.6 : 0.3;
  const chosen = seats.filter(() => r() < frac);
  const body = new CapsuleGeometry(0.2, 0.32, 2, 6);
  body.translate(0, 0.38, 0);
  const head = new SphereGeometry(0.12, 7, 5);
  head.translate(0, 0.86, 0);
  const crowdGeo = mergeGeometries([body as BufferGeometry, head as BufferGeometry]);
  const crowd = new InstancedMesh(crowdGeo, new MeshStandardMaterial({ roughness: 0.9 }), Math.max(1, chosen.length));
  const shirt = [PALETTE.accent, PALETTE.accent2, PALETTE.gold, '#e9e4da', '#5a6fb0', '#8a7dff', '#3a4466'];
  const c = new Color();
  const phases: number[] = [];
  chosen.forEach((s, i) => {
    c.set(shirt[Math.floor(r() * shirt.length)]).multiplyScalar(0.3 + r() * 0.18);
    crowd.setColorAt(i, c);
    phases.push(r() * Math.PI * 2);
  });
  g.add(crowd);
  const o = new Object3D();
  let excite = 0;
  let excitedSide: Side | null = null;
  const placeCrowd = (time: number): void => {
    chosen.forEach((s, i) => {
      const ph = phases[i];
      const e = excitedSide ? excite : 0;
      const bob = Math.sin(time * 1.6 + ph) * 0.015 + Math.max(0, Math.sin(time * 9 + ph)) * 0.12 * e;
      o.position.set(s.x, s.y + bob, s.z);
      o.rotation.set(0, s.ry + Math.sin(time * 0.4 + ph) * 0.15, 0);
      o.scale.set(1, 0.9 + (ph % 0.3), 1);
      o.updateMatrix();
      crowd.setMatrixAt(i, o.matrix);
    });
    crowd.instanceMatrix.needsUpdate = true;
  };
  placeCrowd(0);

  // overhead truss + light cones
  const trussMat = mat('#2b3247', { rough: 0.5, metal: 0.5 });
  for (const z of [-2.2, 2.2]) {
    const t = new Mesh(new BoxGeometry(6, 0.25, 0.25), trussMat);
    t.position.set(0, 7, z);
    g.add(t);
    for (const x of [-1.4, 0, 1.4]) {
      const can = new Mesh(new CylinderGeometry(0.18, 0.24, 0.35, 12), trussMat);
      can.position.set(x, 6.75, z);
      g.add(can);
      const lens = new Mesh(new CylinderGeometry(0.17, 0.17, 0.02, 12), new MeshBasicMaterial({ color: '#fff3d8' }));
      lens.position.set(x, 6.57, z);
      g.add(lens);
    }
  }
  const coneTex = makeConeTexture();
  for (const z of [-2.2, 2.2]) {
    const cone = new Mesh(
      new CylinderGeometry(0.2, 2.2, 6.5, 24, 1, true),
      new MeshBasicMaterial({ map: coneTex, color: '#ffe2b8', transparent: true, opacity: 0.03, blending: AdditiveBlending, depthWrite: false, side: DoubleSide }),
    );
    cone.position.set(0, 3.3, z * 0.7);
    cone.renderOrder = 1;
    g.add(cone);
  }

  // back walls (dark) to close the space
  const wallMat = new MeshStandardMaterial({ color: '#0d1322', roughness: 1 });
  for (const [x, z, ry, w] of [
    [0, -18, 0, 30],
    [0, 18, Math.PI, 30],
    [-15, 0, Math.PI / 2, 36],
    [15, 0, -Math.PI / 2, 36],
  ] as [number, number, number, number][]) {
    const w2 = new Mesh(new PlaneGeometry(w, 12), wallMat);
    w2.position.set(x, 6, z);
    w2.rotation.y = ry;
    g.add(w2);
  }
  // big hanging banner over the far stand
  const ban = new Mesh(new PlaneGeometry(6, 0.9), new MeshBasicMaterial({ map: led.clone(), color: '#ffffff' }));
  (ban.material as MeshBasicMaterial).map!.repeat.set(0.25, 1);
  ban.position.set(0, 5.2, -(CZ / 2 + 7));
  g.add(ban);

  let ledT = 0;
  let pulseColor = new Color('#ffffff');
  let pulseT = 9;
  return {
    group: g,
    lights: {
      background: '#0e1424',
      fog: ['#0e1424', 12, 34],
      hemiSky: '#7d8cc4',
      hemiGround: '#1b2034',
      hemi: 0.7,
      dirColor: '#fff0dd',
      dir: 1.1,
      dirPos: [1.2, 9, 2.2],
      spotColor: '#ffe8c8',
      spot: 170,
      exposure: 1.05,
    },
    update: (dt, time) => {
      ledT += dt;
      for (const b of boards) {
        const m = b.material as MeshBasicMaterial;
        m.map!.offset.x += dt * 0.035;
        if (pulseT < 1.2) m.color.copy(pulseColor).lerp(new Color('#ffffff'), pulseT / 1.2);
        else m.color.set('#ffffff');
      }
      pulseT += dt;
      excite = Math.max(0, excite - dt * 0.45);
      placeCrowd(time);
    },
    pulse: (side, color) => {
      pulseColor = new Color(color).multiplyScalar(1.6);
      pulseT = 0;
      excite = 1;
      excitedSide = side;
    },
  };
}
