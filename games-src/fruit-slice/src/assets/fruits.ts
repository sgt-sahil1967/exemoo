/**
 * Fruit / power-up / bomb models, specs, slicing and disposal.
 *
 * Every model is a Group of Meshes with identity transforms:
 *  - one sliceable closed "body" mesh (userData.body = true, geometry built by
 *    geometry.buildSurface so it carries weld ids),
 *  - merged attachment meshes (stems, leaves, crowns, seeds ...). Geometries
 *    and materials come from a per-kind template cache and are flagged
 *    userData.shared = true, so models are cheap to create and dispose.
 */
import * as THREE from 'three';
import type {
  FruitKind, FruitSpec, PowerUpKind, SliceHalf, SliceResult,
} from '../contracts';
import {
  buildLeaf, buildSurface, buildTube, mergeParts, placeGeometry, angDist, smoothstep,
} from './geometry';
import { sliceGeometry, type SlicedPart } from './slicer';
import {
  paintBomb, paintFleshPolar, paintGradient, paintSkin, mulberry32,
} from './textures';

type Kind = FruitKind | PowerUpKind | 'pomegranate';

const TAU = Math.PI * 2;

// ----------------------------------------------------------------- specs ---

function spec(kind: Kind, radius: number, juiceColor: number, fleshColor: number, weight: number): FruitSpec {
  return { kind, radius, juiceColor, fleshColor, points: 1, weight };
}

export const FRUIT_SPECS: Record<Kind, FruitSpec> = {
  apple: spec('apple', 0.30, 0xf3e3b0, 0xf6efd2, 10),
  orange: spec('orange', 0.31, 0xff9a1a, 0xffa733, 10),
  watermelon: spec('watermelon', 0.46, 0xff3b52, 0xff4b5f, 6),
  banana: spec('banana', 0.42, 0xf8e6a0, 0xf6e7b4, 8),
  pineapple: spec('pineapple', 0.48, 0xffd23a, 0xffd84a, 5),
  strawberry: spec('strawberry', 0.22, 0xff2b45, 0xff4d5e, 9),
  coconut: spec('coconut', 0.34, 0xf4f1e6, 0xfaf8f0, 5),
  kiwi: spec('kiwi', 0.24, 0x9ad23a, 0x8fd13f, 8),
  lemon: spec('lemon', 0.26, 0xfff04a, 0xfff27a, 8),
  peach: spec('peach', 0.29, 0xffb066, 0xffc27a, 8),
  plum: spec('plum', 0.24, 0xb8274a, 0xd8504f, 7),
  mango: spec('mango', 0.34, 0xffb82e, 0xffc233, 7),
  dragonfruit: spec('dragonfruit', 0.34, 0xd81b60, 0xf4eef2, 5),
  pomegranate: spec('pomegranate', 0.42, 0xc4122e, 0xd41f3a, 0),
  freeze: spec('freeze', 0.34, 0x7fd8ff, 0xbfeaff, 0),
  frenzy: spec('frenzy', 0.34, 0xff7a1a, 0xffa040, 0),
  double: spec('double', 0.34, 0xffd23a, 0xffe27a, 0),
};

export const FRUIT_KINDS: FruitKind[] = [
  'apple', 'orange', 'watermelon', 'banana', 'pineapple', 'strawberry', 'coconut',
  'kiwi', 'lemon', 'peach', 'plum', 'mango', 'dragonfruit',
];

// --------------------------------------------------------------- helpers ---

interface Part {
  geom: THREE.BufferGeometry;
  mat: THREE.Material;
  body?: boolean;
  /** slice attachments per triangle (spread-out detail) instead of per mesh */
  splitTris?: boolean;
}

interface Template {
  parts: Part[];
  radius: number;
}

type Prof = (phi: number, th: number) => [number, number];

/** Surface of revolution: phi 0 (bottom) .. π (top). */
function lathe(segU: number, segV: number, f: Prof): THREE.BufferGeometry {
  return buildSurface(segU, segV, (u, v, out) => {
    const th = u * TAU;
    const [r, y] = f(v * Math.PI, th);
    out.set(r * Math.cos(th), y, r * Math.sin(th));
  });
}

const gauss = (x: number, w: number): number => Math.exp(-(x * x) / (w * w));

function topOf(g: THREE.BufferGeometry): THREE.Vector3 {
  const p = g.attributes.position;
  return new THREE.Vector3().fromBufferAttribute(p, p.count - 1);
}
function bottomOf(g: THREE.BufferGeometry): THREE.Vector3 {
  return new THREE.Vector3().fromBufferAttribute(g.attributes.position, 0);
}

function stem(base: THREE.Vector3, h: number, r: number, bend = 0.2, dir = new THREE.Vector3(0, 1, 0)): THREE.BufferGeometry {
  const side = new THREE.Vector3(1, 0, 0);
  return buildTube(
    8, 5,
    (v, out) => out.copy(base).addScaledVector(dir, v * h).addScaledVector(side, bend * h * v * v),
    (v) => r * (1 - 0.25 * v) * (1 + 0.5 * smoothstep(0.7, 1, v)),
  );
}

const Y = new THREE.Vector3(0, 1, 0);

function leafAt(base: THREE.Vector3, dir: THREE.Vector3, o: Parameters<typeof buildLeaf>[0], up = Y): THREE.BufferGeometry {
  return placeGeometry(buildLeaf(o), base, dir, up);
}

function solid(color: number, rough = 0.7, extra: Partial<THREE.MeshStandardMaterialParameters> = {}): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra });
}

function leafMat(a = '#2f6a1f', b = '#79b03a'): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: paintGradient([[0, a], [1, b]], true),
    roughness: 0.55,
    side: THREE.DoubleSide,
  });
}

function skinMat(kind: Kind, rough: number, bumpScale = 2): THREE.MeshStandardMaterial {
  const s = paintSkin(kind);
  const m = new THREE.MeshStandardMaterial({ map: s.map, roughness: rough, metalness: 0 });
  if (s.bump) { m.bumpMap = s.bump; m.bumpScale = bumpScale; }
  return m;
}

function powerMat(kind: PowerUpKind, tint: number, glow: number): THREE.MeshStandardMaterial {
  const s = paintSkin(kind);
  return new THREE.MeshStandardMaterial({
    map: s.map,
    color: tint,
    roughness: 0.25,
    metalness: 0.1,
    emissive: new THREE.Color(0xffffff),
    emissiveMap: s.emissive ?? s.map,
    emissiveIntensity: glow,
  });
}

/** Ellipsoid profile with per-axis radii. */
function ell(rx: number, ry: number): Prof {
  return (phi) => [Math.sin(phi) * rx, -Math.cos(phi) * ry];
}

// ------------------------------------------------------------- templates ---

function buildTemplate(kind: Kind): Template {
  const parts: Part[] = [];
  const body = (geom: THREE.BufferGeometry, mat: THREE.Material): void => {
    parts.push({ geom, mat, body: true });
  };
  const att = (geom: THREE.BufferGeometry, mat: THREE.Material, splitTris = false): void => {
    parts.push({ geom, mat, splitTris });
  };
  let attachWeight = 0.8;

  switch (kind) {
    case 'apple': {
      const g = lathe(30, 22, (phi, th) => {
        const s = Math.sin(phi), c = Math.cos(phi);
        const lobes = 1 + 0.035 * Math.cos(5 * th) * smoothstep(0.6, 0, c + 0.2) * (c < 0.3 ? 1 : 0);
        const r = s * (1 + 0.1 * c) * lobes;
        let y = -c * 0.88;
        y -= 0.3 * gauss(Math.PI - phi, 0.42); // stem cavity
        y += 0.14 * gauss(phi, 0.4);
        return [r, y];
      });
      body(g, skinMat('apple', 0.34));
      const t = topOf(g);
      att(stem(t.clone().add(new THREE.Vector3(0, -0.12, 0)), 0.42, 0.045, 0.3), solid(0x5a3a1e, 0.8));
      att(leafAt(t.clone().add(new THREE.Vector3(0.02, 0.12, 0)), new THREE.Vector3(1, 0.35, 0.35), { length: 0.62, width: 0.3, bend: -0.1, cup: 0.12 }), leafMat());
      break;
    }
    case 'orange': {
      const g = lathe(30, 22, (phi) => {
        const s = Math.sin(phi), c = Math.cos(phi);
        return [s, -c * 0.95 - 0.06 * gauss(Math.PI - phi, 0.3) - 0.04 * gauss(phi, 0.3)];
      });
      body(g, skinMat('orange', 0.6, 2.5));
      const t = topOf(g);
      att(stem(t.clone().add(new THREE.Vector3(0, -0.04, 0)), 0.1, 0.05, 0), solid(0x4f7a2a, 0.7));
      att(leafAt(t.clone().add(new THREE.Vector3(0, 0.0, 0)), new THREE.Vector3(1, 0.1, 0.25), { length: 0.42, width: 0.24, bend: 0.05 }), leafMat());
      break;
    }
    case 'watermelon': {
      body(lathe(32, 22, (phi, th) => {
        const bulge = 1 + 0.015 * Math.cos(8 * th);
        return [Math.sin(phi) * 0.92 * bulge, -Math.cos(phi) * 1.12];
      }), skinMat('watermelon', 0.38));
      const g = parts[0].geom;
      att(stem(topOf(g).add(new THREE.Vector3(0, -0.08, 0)), 0.22, 0.05, 0.4), solid(0x5c6b2a, 0.8));
      break;
    }
    case 'banana': {
      const spine = (v: number, out: THREE.Vector3): void => {
        const a = (v - 0.5) * 1.7;
        out.set(Math.sin(a) * 1.15, (1 - Math.cos(a)) * 1.15, 0);
      };
      const g = buildTube(
        30, 24, spine,
        (v, th) => {
          const taper = 0.2 + 0.8 * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, v * 0.92 + 0.04))), 0.45);
          const end = v > 0.9 ? 1 - 0.55 * smoothstep(0.9, 1, v) : 1;
          return 0.24 * taper * end * (1 + 0.1 * Math.cos(5 * th));
        },
        new THREE.Vector3(0, 0, 1),
      );
      body(g, skinMat('banana', 0.48));
      const t = topOf(g);
      const dir = new THREE.Vector3(1, 0.5, 0);
      att(stem(t.clone().addScaledVector(dir.clone().normalize(), -0.03), 0.2, 0.05, 0, dir.clone().normalize()), solid(0x5f6a24, 0.8));
      break;
    }
    case 'pineapple': {
      const g = lathe(30, 22, (phi, th) => {
        const s = Math.sin(phi), c = Math.cos(phi);
        const r = s * (0.78 + 0.05 * c) * (1 + 0.012 * Math.cos(8 * th));
        return [r, -c * 1.12 - 0.05 * gauss(phi, 0.3)];
      });
      body(g, skinMat('pineapple', 0.55, 3));
      const t = topOf(g);
      const lg: THREE.BufferGeometry[] = [];
      const rnd = mulberry32(5);
      const n = 16;
      for (let i = 0; i < n; i++) {
        const ring = i % 2;
        const a = (i / n) * TAU + rnd() * 0.2;
        const lift = 0.9 - ring * 0.45 + rnd() * 0.2;
        const dir = new THREE.Vector3(Math.cos(a) * (0.35 + ring * 0.35), lift, Math.sin(a) * (0.35 + ring * 0.35));
        lg.push(leafAt(t.clone().add(new THREE.Vector3(0, -0.12, 0)), dir, {
          length: 0.72 + rnd() * 0.3 - ring * 0.12, width: 0.2, segL: 5, segW: 1, bend: -0.05, cup: 0.35, shape: 'blade', twist: (rnd() - 0.5) * 0.8,
        }));
      }
      lg.push(leafAt(t.clone().add(new THREE.Vector3(0, -0.12, 0)), new THREE.Vector3(0, 1, 0.001), { length: 0.7, width: 0.2, segL: 5, segW: 1, bend: 0, cup: 0.3, shape: 'blade' }));
      att(mergeParts(lg), new THREE.MeshStandardMaterial({
        map: paintGradient([[0, '#255a1c'], [0.6, '#3f8a2a'], [1, '#9acb3c']]), roughness: 0.55, side: THREE.DoubleSide,
      }), true);
      attachWeight = 0.62;
      break;
    }
    case 'strawberry': {
      const g = lathe(26, 20, (phi, th) => {
        const v = phi / Math.PI;
        const w = 0.45 + 0.55 * smoothstep(0, 0.65, v);
        const r = Math.sin(phi) * 0.95 * w * (1 + 0.025 * Math.cos(6 * th));
        return [r, -Math.cos(phi) * 1.0 * (v < 0.5 ? 1.12 : 0.92)];
      });
      body(g, skinMat('strawberry', 0.42, 1.5));
      const t = topOf(g);
      const sg: THREE.BufferGeometry[] = [];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        sg.push(leafAt(t.clone().add(new THREE.Vector3(0, -0.06, 0)), new THREE.Vector3(Math.cos(a), -0.1, Math.sin(a)), {
          length: 0.55, width: 0.28, segL: 4, segW: 1, bend: 0.1, cup: 0.15, shape: 'sepal',
        }));
      }
      att(mergeParts(sg), leafMat('#2a6a1c', '#5aa530'), false);
      att(stem(t.clone().add(new THREE.Vector3(0, -0.04, 0)), 0.3, 0.045, 0.2), solid(0x4c8a2a, 0.7));
      attachWeight = 0.75;
      break;
    }
    case 'coconut': {
      const g = lathe(28, 20, (phi, th) => {
        const tri = 1 + 0.02 * Math.cos(3 * th) * Math.sin(phi);
        return [Math.sin(phi) * 0.98 * tri, -Math.cos(phi) * 1.0];
      });
      body(g, skinMat('coconut', 0.88, 3));
      att(stem(topOf(g).add(new THREE.Vector3(0, -0.05, 0)), 0.1, 0.07, 0), solid(0x4a2f18, 0.95));
      break;
    }
    case 'kiwi': {
      const g = lathe(26, 18, (phi) => [Math.sin(phi) * 0.82, -Math.cos(phi) * 1.12]);
      body(g, skinMat('kiwi', 0.95));
      att(stem(topOf(g).add(new THREE.Vector3(0, -0.04, 0)), 0.1, 0.04, 0), solid(0x7a5a30, 0.9));
      break;
    }
    case 'lemon': {
      const g = lathe(28, 22, (phi) => {
        const s = Math.sin(phi), c = Math.cos(phi);
        const y = -c * 1.0 - 0.2 * gauss(phi, 0.3) + 0.2 * gauss(Math.PI - phi, 0.3);
        return [s * 0.8, y];
      });
      body(g, skinMat('lemon', 0.5, 2));
      const t = topOf(g);
      att(stem(t.clone().add(new THREE.Vector3(0, -0.05, 0)), 0.1, 0.04, 0), solid(0x6a8a2a, 0.7));
      break;
    }
    case 'peach': {
      const g = lathe(28, 22, (phi, th) => {
        const s = Math.sin(phi), c = Math.cos(phi);
        const crease = 1 - 0.1 * gauss(angDist(th, 0), 0.35) * s;
        const squash = 1 + 0.03 * c;
        return [s * crease * squash, -c * 0.92 - 0.2 * gauss(Math.PI - phi, 0.4) + 0.04 * gauss(phi, 0.5)];
      });
      body(g, skinMat('peach', 0.78));
      const t = topOf(g);
      att(stem(t.clone().add(new THREE.Vector3(0, -0.08, 0)), 0.2, 0.04, 0.2), solid(0x5a3a1e, 0.8));
      att(leafAt(t.clone().add(new THREE.Vector3(0, 0.0, 0)), new THREE.Vector3(1, 0.4, -0.3), { length: 0.55, width: 0.2, bend: -0.1 }), leafMat());
      break;
    }
    case 'plum': {
      const g = lathe(28, 22, (phi, th) => {
        const s = Math.sin(phi), c = Math.cos(phi);
        const crease = 1 - 0.05 * gauss(angDist(th, 0), 0.4) * s;
        return [s * 0.88 * crease, -c * 1.0 - 0.14 * gauss(Math.PI - phi, 0.4)];
      });
      body(g, skinMat('plum', 0.26));
      att(stem(topOf(g).add(new THREE.Vector3(0, -0.1, 0)), 0.22, 0.035, 0.25), solid(0x5a4228, 0.8));
      break;
    }
    case 'mango': {
      const g = buildSurface(30, 22, (u, v, out) => {
        const th = u * TAU, phi = v * Math.PI;
        const s = Math.sin(phi), c = Math.cos(phi);
        const w = 0.72 + 0.28 * smoothstep(0, 0.55, v);
        let r = s * 0.82 * w;
        r *= 1 + 0.12 * Math.cos(th) * s; // one flank fuller
        const y = -c * 1.15 - 0.12 * gauss(Math.PI - phi, 0.35);
        out.set(r * Math.cos(th) + 0.18 * s * s * Math.sin(phi) , y, r * Math.sin(th));
      });
      body(g, skinMat('mango', 0.42));
      const t = topOf(g);
      att(stem(t.clone().add(new THREE.Vector3(0, -0.08, 0)), 0.24, 0.045, 0.2), solid(0x5e6a26, 0.75));
      break;
    }
    case 'dragonfruit': {
      const g = lathe(28, 22, (phi, th) => {
        const bulge = 1 + 0.03 * Math.cos(5 * th);
        return [Math.sin(phi) * 0.82 * bulge, -Math.cos(phi) * 1.12];
      });
      body(g, skinMat('dragonfruit', 0.5));
      const sc: THREE.BufferGeometry[] = [];
      const rnd = mulberry32(21);
      const N = 34;
      const pos = new THREE.Vector3();
      for (let i = 0; i < N; i++) {
        const v = 0.1 + 0.8 * ((i + 0.5) / N);
        const th = i * 2.399963 + rnd() * 0.3;
        const phi = v * Math.PI;
        pos.set(Math.sin(phi) * 0.8 * Math.cos(th), -Math.cos(phi) * 1.1, Math.sin(phi) * 0.8 * Math.sin(th));
        const n = new THREE.Vector3(pos.x / 0.64, pos.y / 1.21, pos.z / 0.64).normalize();
        const tg = Y.clone().addScaledVector(n, -n.y).normalize();
        sc.push(leafAt(pos.clone().addScaledVector(n, -0.02), tg, {
          length: 0.4 + rnd() * 0.12, width: 0.2, segL: 3, segW: 1, bend: 0.35, cup: 0.1, shape: 'leaf',
        }, n));
      }
      att(mergeParts(sc), new THREE.MeshStandardMaterial({
        map: paintGradient([[0, '#d81a6a'], [0.55, '#e24a8c'], [0.8, '#8cc63a'], [1, '#3f9a2a']]), roughness: 0.5, side: THREE.DoubleSide,
      }), true);
      attachWeight = 0.82;
      break;
    }
    case 'pomegranate': {
      const g = lathe(28, 22, (phi, th) => {
        const s = Math.sin(phi), c = Math.cos(phi);
        return [s * (1 + 0.012 * Math.cos(6 * th)), -c * 0.94 - 0.18 * gauss(Math.PI - phi, 0.28)];
      });
      body(g, skinMat('pomegranate', 0.4));
      const t = topOf(g);
      const cg: THREE.BufferGeometry[] = [];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        cg.push(leafAt(t.clone().add(new THREE.Vector3(Math.cos(a) * 0.1, -0.02, Math.sin(a) * 0.1)), new THREE.Vector3(Math.cos(a) * 0.55, 1, Math.sin(a) * 0.55), {
          length: 0.42, width: 0.22, segL: 3, segW: 1, bend: 0.2, cup: 0.3, shape: 'leaf',
        }));
      }
      att(mergeParts(cg), new THREE.MeshStandardMaterial({
        map: paintGradient([[0, '#7a1020'], [1, '#c8431f']]), roughness: 0.55, side: THREE.DoubleSide,
      }));
      att(stem(t.clone().add(new THREE.Vector3(0, -0.12, 0)), 0.1, 0.1, 0), solid(0x8c2a1a, 0.6));
      break;
    }
    case 'freeze': {
      const g = lathe(30, 20, (phi, th) => {
        const s = Math.sin(phi);
        const star = 1 + 0.16 * Math.pow(Math.abs(Math.cos(3 * th)), 2.2) * s * 1.4;
        return [s * star, -Math.cos(phi) * 1.0];
      });
      body(g, powerMat("freeze", 0x86cfff, 0.6));
      const sg: THREE.BufferGeometry[] = [];
      const t = topOf(g);
      const b = bottomOf(g);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU;
        const L = i === 0 ? 0.8 : 0.55 + (i % 2) * 0.12;
        sg.push(leafAt(t.clone().add(new THREE.Vector3(0, -0.08, 0)), new THREE.Vector3(Math.cos(a) * 0.35, 1, Math.sin(a) * 0.35), { length: L, width: 0.2, segL: 3, segW: 1, bend: 0, cup: 0.4, shape: 'blade' }));
        sg.push(leafAt(b.clone().add(new THREE.Vector3(0, 0.08, 0)), new THREE.Vector3(Math.cos(a + 0.6) * 0.35, -1, Math.sin(a + 0.6) * 0.35), { length: 0.32, width: 0.17, segL: 3, segW: 1, bend: 0, cup: 0.4, shape: 'blade' }));
      }
      att(mergeParts(sg), new THREE.MeshStandardMaterial({
        color: 0xdff6ff, roughness: 0.1, metalness: 0.2, emissive: 0x6fcfff, emissiveIntensity: 1.1, side: THREE.DoubleSide, transparent: true, opacity: 0.92,
      }), true);
      attachWeight = 0.7;
      break;
    }
    case 'frenzy': {
      const g = lathe(30, 20, (phi, th) => {
        const s = Math.sin(phi);
        const rip = 1 + 0.07 * Math.cos(5 * th) * s;
        return [s * rip, -Math.cos(phi) * 1.0];
      });
      body(g, powerMat('frenzy', 0xffd0a0, 1.15));
      const t = topOf(g);
      const fg: THREE.BufferGeometry[] = [];
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU;
        const tall = i % 2 === 0;
        fg.push(leafAt(t.clone().add(new THREE.Vector3(Math.cos(a) * 0.12, -0.15, Math.sin(a) * 0.12)), new THREE.Vector3(Math.cos(a) * (tall ? 0.25 : 0.6), 1, Math.sin(a) * (tall ? 0.25 : 0.6)), {
          length: tall ? 0.8 : 0.55, width: 0.3, segL: 5, segW: 1, bend: 0.12, cup: 0.15, shape: 'leaf', twist: 0.6,
        }));
      }
      att(mergeParts(fg), new THREE.MeshStandardMaterial({
        map: paintGradient([[0, '#ff4a10'], [0.6, '#ff9a20'], [1, '#fff070']]), roughness: 0.4,
        emissive: 0xff6a10, emissiveIntensity: 1.2, side: THREE.DoubleSide,
      }), true);
      attachWeight = 0.65;
      break;
    }
    case 'double': {
      const g = lathe(30, 20, (phi, th) => {
        const s = Math.sin(phi);
        return [s * (1 + 0.05 * Math.cos(5 * th) * s), -Math.cos(phi) * 0.95];
      });
      body(g, powerMat('double', 0xfff0b0, 1.0));
      const ring = new THREE.TorusGeometry(1.22, 0.075, 8, 40);
      ring.rotateX(Math.PI / 2 - 0.5);
      ring.rotateZ(0.3);
      const ring2 = ring.clone().rotateY(Math.PI / 2);
      att(mergeParts([ring, ring2]), new THREE.MeshStandardMaterial({
        color: 0xffd050, metalness: 0.9, roughness: 0.22, emissive: 0xffa800, emissiveIntensity: 0.9,
      }), true);
      attachWeight = 1;
      break;
    }
  }

  // Recentre on the body's bounding-box centre, then scale to the spec radius.
  const bodyGeom = parts.find((p) => p.body)!.geom;
  bodyGeom.computeBoundingBox();
  const c = bodyGeom.boundingBox!.getCenter(new THREE.Vector3());
  let bodyMax = 0;
  let attMax = 0;
  const p = new THREE.Vector3();
  for (const part of parts) {
    part.geom.translate(-c.x, -c.y, -c.z);
    const pa = part.geom.attributes.position;
    let m = 0;
    for (let i = 0; i < pa.count; i++) m = Math.max(m, p.fromBufferAttribute(pa, i).length());
    if (part.body) bodyMax = m; else attMax = Math.max(attMax, m);
  }
  const R = FRUIT_SPECS[kind].radius;
  const scale = R / Math.max(bodyMax, attMax * attachWeight);
  for (const part of parts) {
    part.geom.scale(scale, scale, scale);
    part.geom.computeBoundingSphere();
    part.geom.userData.shared = true;
    part.mat.userData.shared = true;
  }
  // drop the stale weld-independent attributes we do not need
  return { parts, radius: R };
}

const templates = new Map<Kind, Template>();

function getTemplate(kind: Kind): Template {
  let t = templates.get(kind);
  if (!t) {
    t = buildTemplate(kind);
    templates.set(kind, t);
  }
  return t;
}

export function createFruitModel(kind: Kind): THREE.Group {
  const tpl = getTemplate(kind);
  const group = new THREE.Group();
  group.name = kind;
  group.userData.kind = kind;
  group.userData.radius = tpl.radius;
  for (const part of tpl.parts) {
    const m = new THREE.Mesh(part.geom, part.mat);
    m.castShadow = true;
    m.userData.body = !!part.body;
    m.userData.splitTris = !!part.splitTris;
    group.add(m);
  }
  return group;
}

// ------------------------------------------------------------------ bomb ---

let bombTemplate: { parts: Part[]; fuseTip: THREE.Vector3 } | null = null;

export function createBombModel(): THREE.Group {
  if (!bombTemplate) {
    const parts: Part[] = [];
    const R = 0.33;
    const shell = lathe(32, 22, (phi) => [Math.sin(phi) * R, -Math.cos(phi) * R]);
    parts.push({
      geom: shell,
      mat: new THREE.MeshStandardMaterial({ map: paintBomb(), roughness: 0.38, metalness: 0.55 }),
    });
    const metal = new THREE.MeshStandardMaterial({ color: 0x9aa0aa, metalness: 0.95, roughness: 0.3 });
    const cap = new THREE.CylinderGeometry(0.085, 0.1, 0.07, 20);
    cap.translate(0, R + 0.0, 0);
    const collar = new THREE.TorusGeometry(0.105, 0.022, 8, 24);
    collar.rotateX(Math.PI / 2);
    collar.translate(0, R - 0.035, 0);
    parts.push({ geom: mergeParts([cap, collar]), mat: metal });
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, R + 0.03, 0),
      new THREE.Vector3(0.02, R + 0.14, 0),
      new THREE.Vector3(0.1, R + 0.2, 0.01),
      new THREE.Vector3(0.17, R + 0.2, 0.02),
    ]);
    const fuse = new THREE.TubeGeometry(curve, 14, 0.016, 6, false);
    parts.push({ geom: fuse, mat: new THREE.MeshStandardMaterial({ color: 0xc9a46a, roughness: 0.9 }) });
    const ember = new THREE.SphereGeometry(0.03, 10, 8);
    ember.translate(0.17, R + 0.2, 0.02);
    parts.push({
      geom: ember,
      mat: new THREE.MeshStandardMaterial({ color: 0xff9a30, emissive: 0xff6a10, emissiveIntensity: 2.2 }),
    });
    for (const p of parts) { p.geom.userData.shared = true; p.mat.userData.shared = true; p.geom.computeBoundingSphere(); }
    bombTemplate = { parts, fuseTip: new THREE.Vector3(0.17, R + 0.2, 0.02) };
  }
  const g = new THREE.Group();
  g.name = 'bomb';
  g.userData.kind = 'bomb';
  g.userData.radius = 0.36;
  for (const p of bombTemplate.parts) {
    const m = new THREE.Mesh(p.geom, p.mat);
    m.castShadow = true;
    g.add(m);
  }
  const tip = new THREE.Object3D();
  tip.name = 'fuseTip';
  tip.position.copy(bombTemplate.fuseTip);
  g.add(tip);
  g.userData.fuseTip = tip;
  return g;
}

// ----------------------------------------------------------------- slice ---

const fleshMats = new Map<string, THREE.MeshStandardMaterial>();

function fleshMat(kind: string): THREE.MeshStandardMaterial {
  let m = fleshMats.get(kind);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      map: paintFleshPolar(kind),
      roughness: 0.62,
      metalness: 0,
      emissive: kind === 'freeze' || kind === 'frenzy' || kind === 'double' ? 0xffffff : 0x000000,
      emissiveIntensity: 0.1,
    });
    if (m.emissive.getHex() !== 0) m.emissiveMap = m.map;
    m.userData.shared = true;
    fleshMats.set(kind, m);
  }
  return m;
}

function geomFromPart(part: SlicedPart, c: THREE.Vector3): THREE.BufferGeometry {
  const pos = part.pos;
  for (let i = 0; i < pos.length; i += 3) {
    pos[i] -= c.x; pos[i + 1] -= c.y; pos[i + 2] -= c.z;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(part.nor, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(part.uv, 2));
  g.addGroup(0, part.surfCount, 0);
  if (part.capCount > 0) g.addGroup(part.surfCount, part.capCount, 1);
  g.computeBoundingSphere();
  return g;
}

/** Volumetric centroid of a closed triangle soup (falls back to bbox centre). */
function centroidOf(part: SlicedPart): THREE.Vector3 {
  const p = part.pos;
  let vol = 0, cx = 0, cy = 0, cz = 0;
  for (let i = 0; i < p.length; i += 9) {
    const ax = p[i], ay = p[i + 1], az = p[i + 2];
    const bx = p[i + 3], by = p[i + 4], bz = p[i + 5];
    const qx = p[i + 6], qy = p[i + 7], qz = p[i + 8];
    const v = ax * (by * qz - bz * qy) - ay * (bx * qz - bz * qx) + az * (bx * qy - by * qx);
    vol += v;
    cx += v * (ax + bx + qx);
    cy += v * (ay + by + qy);
    cz += v * (az + bz + qz);
  }
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < p.length; i += 3) {
    for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], p[i + k]); mx[k] = Math.max(mx[k], p[i + k]); }
  }
  const bb = new THREE.Vector3((mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2);
  if (Math.abs(vol) < 1e-9) return bb;
  const c = new THREE.Vector3(cx / (4 * vol), cy / (4 * vol), cz / (4 * vol));
  // sanity: must lie inside the half's bounding box
  if (c.x < mn[0] || c.x > mx[0] || c.y < mn[1] || c.y > mx[1] || c.z < mn[2] || c.z > mx[2]) return bb;
  return c;
}

/** Split a non-indexed-or-indexed attachment geometry by triangles. */
function splitAttachment(
  g: THREE.BufferGeometry, n: THREE.Vector3, perTri: boolean,
): [number[] | null, number[] | null] {
  const pos = g.attributes.position.array as ArrayLike<number>;
  const nor = g.attributes.normal.array as ArrayLike<number>;
  const uv = g.attributes.uv.array as ArrayLike<number>;
  const idx = g.index ? (g.index.array as ArrayLike<number>) : null;
  const tc = idx ? idx.length / 3 : pos.length / 9;
  const out: [number[], number[]] = [[], []];
  let whole = 0;
  if (!perTri) {
    // whole mesh to the side of its bounding-sphere centre
    const c = g.boundingSphere!.center;
    whole = c.x * n.x + c.y * n.y + c.z * n.z >= 0 ? 1 : 0;
  }
  for (let t = 0; t < tc; t++) {
    const i0 = idx ? idx[t * 3] : t * 3, i1 = idx ? idx[t * 3 + 1] : t * 3 + 1, i2 = idx ? idx[t * 3 + 2] : t * 3 + 2;
    let side = whole;
    if (perTri) {
      const mx = (pos[i0 * 3] + pos[i1 * 3] + pos[i2 * 3]) / 3;
      const my = (pos[i0 * 3 + 1] + pos[i1 * 3 + 1] + pos[i2 * 3 + 1]) / 3;
      const mz = (pos[i0 * 3 + 2] + pos[i1 * 3 + 2] + pos[i2 * 3 + 2]) / 3;
      side = mx * n.x + my * n.y + mz * n.z >= 0 ? 1 : 0;
    }
    const o = out[side];
    for (const i of [i0, i1, i2]) {
      o.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2], uv[i * 2], uv[i * 2 + 1]);
    }
  }
  return [out[0].length ? out[0] : null, out[1].length ? out[1] : null];
}

function attachmentGeom(data: number[], c: THREE.Vector3): THREE.BufferGeometry {
  const n = data.length / 8;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const o = i * 8;
    pos[i * 3] = data[o] - c.x; pos[i * 3 + 1] = data[o + 1] - c.y; pos[i * 3 + 2] = data[o + 2] - c.z;
    nor[i * 3] = data[o + 3]; nor[i * 3 + 1] = data[o + 4]; nor[i * 3 + 2] = data[o + 5];
    uv[i * 2] = data[o + 6]; uv[i * 2 + 1] = data[o + 7];
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.computeBoundingSphere();
  return g;
}

const _n = new THREE.Vector3();

export function sliceFruit(model: THREE.Group, planeNormalLocal: THREE.Vector3): SliceResult {
  const kind = (model.userData.kind as string) ?? 'apple';
  const n = _n.copy(planeNormalLocal).normalize();
  const flesh = fleshMat(kind);
  const meshes = model.children.filter((c): c is THREE.Mesh => (c as THREE.Mesh).isMesh);
  const bodyMesh = meshes.find((m) => m.userData.body) ?? meshes[0];

  const [p0, p1] = sliceGeometry(
    bodyMesh.geometry as never, n.x, n.y, n.z, true, Math.random(),
  );
  const sides = [p0, p1];
  const cs: THREE.Vector3[] = sides.map((p) => (p ? centroidOf(p) : new THREE.Vector3()));
  // Never return an empty half: fall back to a sliver so callers can rely on two objects.
  const groups = [new THREE.Group(), new THREE.Group()];
  for (let s = 0; s < 2; s++) {
    const part = sides[s];
    const grp = groups[s];
    grp.userData.kind = kind;
    grp.userData.half = true;
    if (!part) continue;
    const mesh = new THREE.Mesh(geomFromPart(part, cs[s]), [bodyMesh.material as THREE.Material, flesh]);
    mesh.castShadow = true;
    grp.add(mesh);
  }
  for (const m of meshes) {
    if (m === bodyMesh) continue;
    const res = splitAttachment(m.geometry, n, !!m.userData.splitTris);
    for (let s = 0; s < 2; s++) {
      const data = res[s];
      if (!data) continue;
      const mesh = new THREE.Mesh(attachmentGeom(data, cs[s]), m.material);
      mesh.castShadow = true;
      groups[s].add(mesh);
    }
  }
  const halves: [SliceHalf, SliceHalf] = [
    { object: groups[0], localOffset: cs[0].clone() },
    { object: groups[1], localOffset: cs[1].clone() },
  ];
  return { halves };
}

// --------------------------------------------------------------- disposal ---

export function disposeObject(obj: THREE.Object3D): void {
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh && !(o as THREE.Points).isPoints && !(o as THREE.Line).isLine) return;
    const geo = m.geometry as THREE.BufferGeometry | undefined;
    if (geo && !geo.userData.shared) geo.dispose();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (!mat) return;
    for (const mm of Array.isArray(mat) ? mat : [mat]) {
      if (!mm.userData.shared) mm.dispose();
    }
  });
}

// --------------------------------------------------------------- prewarm ---

/** Build every template + flesh texture and compile shaders / upload textures. */
export function prewarmAssets(renderer: THREE.WebGLRenderer): void {
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x886644, 1));
  const dl = new THREE.DirectionalLight(0xffffff, 1);
  dl.castShadow = true;
  scene.add(dl);
  const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
  cam.position.set(0, 0, 5);
  const kinds = Object.keys(FRUIT_SPECS) as Kind[];
  for (const k of kinds) {
    const model = createFruitModel(k);
    scene.add(model);
    const { halves } = sliceFruit(model, new THREE.Vector3(0.3, 1, 0.2).normalize());
    for (const h of halves) { scene.add(h.object); }
    fleshMat(k);
  }
  scene.add(createBombModel());
  try {
    renderer.compile(scene, cam);
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
        const std = mat as THREE.MeshStandardMaterial;
        for (const t of [std.map, std.bumpMap, std.emissiveMap]) if (t) renderer.initTexture(t);
      }
    });
  } catch {
    /* prewarm is best-effort */
  }
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m.userData.half !== undefined) return;
  });
  // dispose temporary slice geometries
  for (const c of [...scene.children]) {
    if (c.userData.half) disposeObject(c);
  }
}
