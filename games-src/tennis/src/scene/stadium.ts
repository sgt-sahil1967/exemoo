import * as THREE from 'three';
import { adCanvas, canvasTexture, glowTexture } from '../assets';
import { COURT } from '../constants';
import type { CourtColors } from './court';
import { Crowd, type Seat } from './crowd';
import { Scoreboard } from './scoreboard';

export type ThemeName = 'midnight' | 'riviera';

export interface ThemeDef {
  name: ThemeName;
  court: CourtColors;
  fog: [string, number, number];
  bloom: { strength: number; radius: number; threshold: number };
  exposure: number;
  envIntensity: number;
}

export const THEMES: Record<ThemeName, ThemeDef> = {
  midnight: {
    name: 'midnight',
    court: { court: '#2558c4', surround: '#14336e' },
    fog: ['#0a1426', 70, 260],
    bloom: { strength: 0.75, radius: 0.55, threshold: 1.1 },
    exposure: 0.95,
    envIntensity: 0.35,
  },
  riviera: {
    name: 'riviera',
    court: { court: '#2f7fd0', surround: '#3f9a63' },
    fog: ['#bfe1f2', 140, 900],
    bloom: { strength: 0.2, radius: 0.4, threshold: 1.2 },
    exposure: 0.95,
    envIntensity: 0.7,
  },
};

const WALL_X = 10.5;
const WALL_Z = 19;

interface StandOpts {
  rows: number;
  rowDepth: number;
  rise: number;
  baseY: number;
  gap: number;
  color: string;
  color2: string;
  fill: number;
  skipNearRows: number;
}

/** Everything theme-specific around the court: stands, crowd, sky, lights, scenery. */
export class Stadium {
  group = new THREE.Group();
  crowd: Crowd;
  scoreboard: Scoreboard;
  readonly def: ThemeDef;
  private animated: ((t: number, dt: number) => void)[] = [];

  constructor(def: ThemeDef) {
    this.def = def;
    const fog = new THREE.Fog(def.fog[0], def.fog[1], def.fog[2]);
    const night = def.name === 'midnight';

    const stand: StandOpts = night
      ? { rows: 22, rowDepth: 0.85, rise: 0.45, baseY: 1.3, gap: 0.6, color: '#1a2233', color2: '#202a3e', fill: 0.86, skipNearRows: 4 }
      : { rows: 12, rowDepth: 0.85, rise: 0.42, baseY: 1.2, gap: 0.6, color: '#e9edf2', color2: '#2f6fb3', fill: 0.62, skipNearRows: 3 };

    this.buildWalls(night);
    const seats = this.buildStands(stand);
    this.crowd = new Crowd(seats, night ? 0.62 : 1.0, fog);
    this.group.add(this.crowd.mesh);

    const topY = stand.baseY + stand.rows * stand.rise;
    const topD = stand.gap + stand.rows * stand.rowDepth;

    this.scoreboard = new Scoreboard(night ? 13 : 9, '#c8ff2e');
    this.scoreboard.group.position.set(0, topY + (night ? 4.2 : 3.6), -(WALL_Z + topD - 1));
    this.group.add(this.scoreboard.group);
    if (!night) {
      const legMat = new THREE.MeshStandardMaterial({ color: '#d9dee5', roughness: 0.5, metalness: 0.3 });
      for (const sx of [-3, 3]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4, 0.4), legMat);
        leg.position.set(sx, topY + 0.2, -(WALL_Z + topD - 1.2));
        this.group.add(leg);
      }
    }

    this.buildUmpireChair();
    this.buildBenches(night);

    if (night) this.buildNight(topY, topD);
    else this.buildDay(topY, topD);
  }

  update(t: number, dt: number) {
    this.crowd.update(t, dt);
    for (const f of this.animated) f(t, dt);
  }

  // ---------------------------------------------------------------- walls & ads

  private buildWalls(night: boolean) {
    const wallMat = new THREE.MeshStandardMaterial({ color: night ? '#0f1a2e' : '#1f5e8c', roughness: 0.7 });
    const H = 1.1;
    const segs: [number, number, number, number][] = [
      [0, -WALL_Z, WALL_X * 2 + 0.3, 0],
      [0, WALL_Z, WALL_X * 2 + 0.3, Math.PI],
      [-WALL_X, 0, WALL_Z * 2, Math.PI / 2],
      [WALL_X, 0, WALL_Z * 2, -Math.PI / 2],
    ];
    for (const [x, z, len, ry] of segs) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(len, H, 0.3), wallMat);
      wall.position.set(x, H / 2, z);
      wall.rotation.y = ry;
      wall.receiveShadow = true;
      this.group.add(wall);
    }

    // LED ad boards on the inner face of each wall.
    const boardW = 6.2;
    const boardH = boardW / 8;
    const geo = new THREE.PlaneGeometry(boardW, boardH);
    let k = 0;
    const place = (x: number, z: number, ry: number) => {
      const idx = (k++ % 6) + 1;
      const mat = new THREE.MeshStandardMaterial({ color: '#000', roughness: 0.4, emissive: '#ffffff', emissiveIntensity: night ? 0.95 : 0.75 });
      adCanvas(idx).then((c) => {
        const t = canvasTexture(c);
        mat.emissiveMap = t;
        mat.needsUpdate = true;
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, 0.12 + boardH / 2, z);
      m.rotation.y = ry;
      this.group.add(m);
    };
    for (const x of [-6.6, 0, 6.6]) place(x, -WALL_Z + 0.17, 0);
    for (const x of [-6.6, 0, 6.6]) place(x, WALL_Z - 0.17, Math.PI);
    for (const z of [-15.6, -9.4, -3.1, 3.1, 9.4, 15.6]) {
      place(-WALL_X + 0.17, z, Math.PI / 2);
      place(WALL_X - 0.17, z, -Math.PI / 2);
    }
  }

  // ---------------------------------------------------------------- stands

  private buildStands(o: StandOpts): Seat[] {
    const seats: Seat[] = [];
    const box = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.85 });
    const count = o.rows * 4;
    const inst = new THREE.InstancedMesh(box, mat, count);
    const m = new THREE.Matrix4();
    const c1 = new THREE.Color(o.color);
    const c2 = new THREE.Color(o.color2);
    let n = 0;
    for (let i = 0; i < o.rows; i++) {
      const d = o.gap + i * o.rowDepth;
      const top = o.baseY + i * o.rise;
      const endLen = 2 * (WALL_X + d + o.rowDepth);
      const sideLen = 2 * (WALL_Z + d);
      const col = i % 2 ? c1 : c1.clone().lerp(c2, 0.35);
      const add = (x: number, z: number, sx: number, sz: number) => {
        m.makeScale(sx, top, sz).setPosition(x, top / 2, z);
        inst.setMatrixAt(n, m);
        inst.setColorAt(n, col);
        n++;
      };
      add(0, -(WALL_Z + d + o.rowDepth / 2), endLen, o.rowDepth);
      add(0, WALL_Z + d + o.rowDepth / 2, endLen, o.rowDepth);
      add(-(WALL_X + d + o.rowDepth / 2), 0, o.rowDepth, sideLen);
      add(WALL_X + d + o.rowDepth / 2, 0, o.rowDepth, sideLen);

      // Seats along each row.
      const sp = 0.58;
      const y = top;
      const inset = 0.32;
      const push = (x: number, z: number, rotY: number) => {
        if (Math.random() < o.fill) seats.push({ pos: new THREE.Vector3(x + (Math.random() - 0.5) * 0.06, y, z), rotY });
      };
      for (let x = -endLen / 2 + 0.4; x <= endLen / 2 - 0.4; x += sp) {
        push(x, -(WALL_Z + d + inset), 0);
        if (i >= o.skipNearRows) push(x, WALL_Z + d + inset, Math.PI);
      }
      for (let z = -sideLen / 2 + 0.4; z <= sideLen / 2 - 0.4; z += sp) {
        push(-(WALL_X + d + inset), z, Math.PI / 2);
        push(WALL_X + d + inset, z, -Math.PI / 2);
      }
    }
    inst.receiveShadow = true;
    this.group.add(inst);
    return seats;
  }

  // ---------------------------------------------------------------- props

  private buildUmpireChair() {
    const g = new THREE.Group();
    const metal = new THREE.MeshStandardMaterial({ color: '#2b3b33', roughness: 0.4, metalness: 0.5 });
    const seatMat = new THREE.MeshStandardMaterial({ color: '#1f6f4a', roughness: 0.6 });
    for (const [x, z] of [
      [-0.35, -0.35],
      [0.35, -0.35],
      [-0.35, 0.35],
      [0.35, 0.35],
    ]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.9, 0.06), metal);
      leg.position.set(x, 0.95, z);
      g.add(leg);
    }
    const platform = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.9), seatMat);
    platform.position.y = 1.9;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.55), seatMat);
    seat.position.set(-0.1, 2.15, 0);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.6), seatMat);
    back.position.set(-0.4, 2.45, 0);
    g.add(platform, seat, back);
    // Umpire.
    const blazer = new THREE.MeshStandardMaterial({ color: '#16233b', roughness: 0.7 });
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.32, 4, 12), blazer);
    torso.position.set(-0.12, 2.75, 0);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 16, 12),
      new THREE.MeshStandardMaterial({ color: '#d9a57f', roughness: 0.6 }),
    );
    head.position.set(-0.1, 3.1, 0);
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.115, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: '#f2f2f2', roughness: 0.6 }),
    );
    cap.position.copy(head.position).y += 0.02;
    g.add(torso, head, cap);
    g.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = true;
    });
    g.position.set(-(COURT.doublesHalfW + 1.5), 0, 0);
    this.group.add(g);
  }

  private buildBenches(night: boolean) {
    const mat = new THREE.MeshStandardMaterial({ color: night ? '#1d2c4a' : '#ffffff', roughness: 0.5 });
    const cushion = new THREE.MeshStandardMaterial({ color: '#c8ff2e', roughness: 0.7 });
    for (const z of [-1.6, 1.6]) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 1.6), mat);
      bench.position.set(COURT.doublesHalfW + 2.2, 0.225, z);
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 1.5), cushion);
      pad.position.set(bench.position.x, 0.48, z);
      bench.castShadow = pad.castShadow = true;
      this.group.add(bench, pad);
    }
  }

  // ---------------------------------------------------------------- Midnight

  private buildNight(topY: number, topD: number) {
    const sky = makeSky('#02050c', '#0f2142', null);
    this.group.add(sky);

    // Stars.
    const starGeo = new THREE.BufferGeometry();
    const pts: number[] = [];
    for (let i = 0; i < 900; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.random() * Math.PI * 0.42;
      pts.push(Math.cos(th) * Math.sin(ph) * 380, Math.cos(ph) * 380, Math.sin(th) * Math.sin(ph) * 380);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: '#cfe0ff', size: 1.4, sizeAttenuation: false, fog: false }));
    this.group.add(stars);

    // Roof ring with light banks.
    const ringY = topY + 2.6;
    const inner = topD - 4;
    const ringMat = new THREE.MeshStandardMaterial({ color: '#0c111b', roughness: 0.6, metalness: 0.4 });
    const ringW = 7;
    const ring: [number, number, number, number][] = [
      [0, -(WALL_Z + inner + ringW / 2), (WALL_X + inner + ringW) * 2, ringW],
      [0, WALL_Z + inner + ringW / 2, (WALL_X + inner + ringW) * 2, ringW],
      [-(WALL_X + inner + ringW / 2), 0, ringW, (WALL_Z + inner) * 2],
      [WALL_X + inner + ringW / 2, 0, ringW, (WALL_Z + inner) * 2],
    ];
    for (const [x, z, sx, sz] of ring) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(sx, 1.2, sz), ringMat);
      r.position.set(x, ringY, z);
      this.group.add(r);
    }
    // Back wall above the top row so the bowl reads as enclosed.
    const backMat = new THREE.MeshStandardMaterial({ color: '#0d1422', roughness: 0.9 });
    const bw: [number, number, number, number][] = [
      [0, -(WALL_Z + topD + 0.3), (WALL_X + topD) * 2 + 1, 0.4],
      [0, WALL_Z + topD + 0.3, (WALL_X + topD) * 2 + 1, 0.4],
      [-(WALL_X + topD + 0.3), 0, 0.4, (WALL_Z + topD) * 2 + 1],
      [WALL_X + topD + 0.3, 0, 0.4, (WALL_Z + topD) * 2 + 1],
    ];
    for (const [x, z, sx, sz] of bw) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(sx, ringY + 0.6, sz), backMat);
      w.position.set(x, (ringY + 0.6) / 2, z);
      this.group.add(w);
    }
    // Glowing strip along the stand fascia (between wall and first row).
    const stripMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#5aa2ff').multiplyScalar(1.6) });
    for (const [x, z, sx, sz] of [
      [0, -(WALL_Z + 0.32), WALL_X * 2, 0.04],
      [0, WALL_Z + 0.32, WALL_X * 2, 0.04],
      [-(WALL_X + 0.32), 0, 0.04, WALL_Z * 2],
      [WALL_X + 0.32, 0, 0.04, WALL_Z * 2],
    ] as [number, number, number, number][]) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.05, sz), stripMat);
      s.position.set(x, 1.28, z);
      this.group.add(s);
    }

    // Light banks: rows of HDR panels on the inner edge of the ring.
    const panelGeo = new THREE.BoxGeometry(1.1, 0.25, 0.5);
    const panelMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 5, 4.6) });
    const positions: THREE.Vector3[] = [];
    const ex = WALL_X + inner + 0.3;
    const ez = WALL_Z + inner + 0.3;
    for (let x = -ex + 1; x <= ex - 1; x += 2.1) {
      positions.push(new THREE.Vector3(x, ringY - 0.65, -ez), new THREE.Vector3(x, ringY - 0.65, ez));
    }
    for (let z = -ez + 2; z <= ez - 2; z += 2.4) {
      positions.push(new THREE.Vector3(-ex, ringY - 0.65, z), new THREE.Vector3(ex, ringY - 0.65, z));
    }
    const panels = new THREE.InstancedMesh(panelGeo, panelMat, positions.length);
    const m = new THREE.Matrix4();
    positions.forEach((p, i) => {
      const side = Math.abs(p.x) > Math.abs(p.z) - 8;
      m.makeRotationY(side && Math.abs(p.x) >= ex - 0.01 ? Math.PI / 2 : 0).setPosition(p);
      panels.setMatrixAt(i, m);
    });
    this.group.add(panels);

    // Soft glow sprites at a few banks for that broadcast flare.
    const glow = glowTexture(128, 'rgba(210,225,255,1)');
    for (const p of positions.filter((_, i) => i % 5 === 0)) {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: glow, color: '#9fc0ff', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
      );
      s.position.copy(p);
      s.scale.setScalar(6);
      this.group.add(s);
    }

    // Lighting.
    const hemi = new THREE.HemisphereLight('#9dbaff', '#1b2236', 0.55);
    const key = new THREE.DirectionalLight('#eef3ff', 1.7);
    key.position.set(5, 30, 14);
    this.setupShadow(key);
    const fill = new THREE.DirectionalLight('#7aa0ff', 0.6);
    fill.position.set(-10, 20, -20);
    this.group.add(hemi, key, key.target, fill);
  }

  // ---------------------------------------------------------------- Riviera

  private buildDay(topY: number, topD: number) {
    const sunDir = new THREE.Vector3(-0.55, 0.62, -0.56).normalize();
    this.group.add(makeSky('#3d8fe0', '#d9eefb', sunDir));

    // Island ground and sea.
    const sand = new THREE.Mesh(
      new THREE.CircleGeometry(95, 64),
      new THREE.MeshStandardMaterial({ color: '#e8d7b0', roughness: 0.95 }),
    );
    sand.rotation.x = -Math.PI / 2;
    sand.position.y = -0.02;
    sand.receiveShadow = true;
    this.group.add(sand);
    const lawn = new THREE.Mesh(
      new THREE.CircleGeometry(72, 64),
      new THREE.MeshStandardMaterial({ color: '#5d9b52', roughness: 0.95 }),
    );
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.y = -0.01;
    lawn.receiveShadow = true;
    this.group.add(lawn);

    const water = makeWater(sunDir);
    this.group.add(water);
    this.animated.push((t) => ((water.material as THREE.ShaderMaterial).uniforms.uTime.value = t));

    // Palms around the island.
    const palm = makePalm();
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2 + Math.random() * 0.2;
      const r = 48 + Math.random() * 20;
      const p = palm.clone();
      p.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      p.rotation.y = Math.random() * Math.PI * 2;
      p.scale.setScalar(0.85 + Math.random() * 0.5);
      this.group.add(p);
    }

    // Distant islands.
    const islandMat = new THREE.MeshStandardMaterial({ color: '#6f9a86', roughness: 1 });
    for (let i = 0; i < 7; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 300 + Math.random() * 200;
      const isl = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), islandMat);
      isl.scale.set(30 + Math.random() * 50, 8 + Math.random() * 18, 30 + Math.random() * 40);
      isl.position.set(Math.cos(a) * r, -1, Math.sin(a) * r);
      this.group.add(isl);
    }

    // Clouds.
    const cloudTex = glowTexture(128, 'rgba(255,255,255,0.95)');
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 260 + Math.random() * 120;
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0.7, depthWrite: false, fog: false }));
      s.position.set(Math.cos(a) * r, 40 + Math.random() * 60, Math.sin(a) * r);
      s.scale.set(60 + Math.random() * 60, 18 + Math.random() * 12, 1);
      this.group.add(s);
    }

    const hemi = new THREE.HemisphereLight('#bfe2ff', '#c9b48a', 0.85);
    const sun = new THREE.DirectionalLight('#fff1d6', 2.3);
    sun.position.copy(sunDir).multiplyScalar(45);
    this.setupShadow(sun);
    this.group.add(hemi, sun, sun.target);
  }

  private setupShadow(light: THREE.DirectionalLight) {
    light.castShadow = true;
    light.shadow.mapSize.set(2048, 2048);
    const c = light.shadow.camera;
    c.left = -14;
    c.right = 14;
    c.top = 22;
    c.bottom = -22;
    c.near = 1;
    c.far = 120;
    light.shadow.bias = -0.0004;
    light.shadow.normalBias = 0.02;
    light.shadow.radius = 3;
  }
}

// ---------------------------------------------------------------- helpers

function makeSky(top: string, horizon: string, sunDir: THREE.Vector3 | null): THREE.Mesh {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uTop: { value: new THREE.Color(top) },
      uHorizon: { value: new THREE.Color(horizon) },
      uSun: { value: sunDir ?? new THREE.Vector3(0, -1, 0) },
      uHasSun: { value: sunDir ? 1 : 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uSun; uniform float uHasSun;
      varying vec3 vDir;
      void main() {
        float h = clamp(vDir.y, 0.0, 1.0);
        vec3 col = mix(uHorizon, uTop, pow(h, 0.55));
        if (uHasSun > 0.5) {
          float d = max(dot(normalize(vDir), uSun), 0.0);
          col += vec3(1.0, 0.9, 0.7) * (pow(d, 600.0) * 6.0 + pow(d, 12.0) * 0.35);
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(450, 32, 16), mat);
  sky.renderOrder = -1;
  return sky;
}

function makeWater(sunDir: THREE.Vector3): THREE.Mesh {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSun: { value: sunDir },
      uDeep: { value: new THREE.Color('#0a5f8f') },
      uShallow: { value: new THREE.Color('#2fd0c8') },
      uSky: { value: new THREE.Color('#bfe1f2') },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec3 uSun; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uSky;
      varying vec3 vWorld;
      float wave(vec2 p, vec2 d, float f, float s) { return sin(dot(p, d) * f + uTime * s); }
      void main() {
        vec2 p = vWorld.xz;
        float r = length(p);
        vec3 n = normalize(vec3(
          wave(p, vec2(0.8, 0.6), 0.35, 1.3) * 0.08 + wave(p, vec2(-0.3, 0.95), 0.9, 2.1) * 0.04 + wave(p, vec2(0.6,-0.8), 2.3, 3.0) * 0.02,
          1.0,
          wave(p, vec2(0.2, 1.0), 0.42, 1.1) * 0.08 + wave(p, vec2(0.9, -0.4), 1.1, 2.4) * 0.04 + wave(p, vec2(-0.7,-0.7), 2.7, 3.4) * 0.02));
        vec3 v = normalize(cameraPosition - vWorld);
        float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
        vec3 col = mix(uShallow, uDeep, smoothstep(96.0, 160.0, r));
        col = mix(col, uSky, fres * 0.7);
        vec3 h = normalize(uSun + v);
        col += vec3(1.0, 0.95, 0.85) * pow(max(dot(n, h), 0.0), 220.0) * 2.5;
        float foam = smoothstep(97.5, 95.0, r) * (0.6 + 0.4 * sin(r * 3.0 - uTime * 1.5));
        col = mix(col, vec3(1.0), foam * 0.8);
        float haze = smoothstep(250.0, 700.0, r);
        col = mix(col, uSky, haze);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const m = new THREE.Mesh(new THREE.CircleGeometry(1400, 96), mat);
  m.rotation.x = -Math.PI / 2;
  m.position.y = -0.4;
  return m;
}

function makePalm(): THREE.Group {
  const g = new THREE.Group();
  const lean = new THREE.Vector3(1.6, 0, 0.4);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    pts.push(new THREE.Vector3(lean.x * t * t, t * 9, lean.z * t * t));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const trunk = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 16, 0.22, 8, false),
    new THREE.MeshStandardMaterial({ color: '#8b6b4a', roughness: 1 }),
  );
  trunk.castShadow = true;
  g.add(trunk);
  const top = pts[pts.length - 1];
  const leafMat = new THREE.MeshStandardMaterial({ color: '#2f7d3a', roughness: 0.8, side: THREE.DoubleSide });
  for (let i = 0; i < 9; i++) {
    const geo = new THREE.PlaneGeometry(4.2, 0.9, 10, 1);
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < p.count; k++) {
      const x = p.getX(k) + 2.1;
      const w = Math.sin((x / 4.2) * Math.PI);
      p.setY(k, p.getY(k) * w);
      p.setZ(k, -0.12 * x * x);
      p.setX(k, x);
    }
    geo.computeVertexNormals();
    const leaf = new THREE.Mesh(geo, leafMat);
    leaf.rotation.order = 'YXZ';
    leaf.rotation.y = (i / 9) * Math.PI * 2;
    leaf.rotation.x = -Math.PI / 2;
    leaf.rotation.z = 0;
    leaf.position.copy(top);
    leaf.castShadow = true;
    g.add(leaf);
  }
  return g;
}
