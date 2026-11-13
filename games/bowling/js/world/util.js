// Moo Bowl world helpers: maths, seeded random, canvas textures, geometry merging.
import * as THREE from 'three';
import { mergeGeometries as mergeRaw } from 'three/addons/utils/BufferGeometryUtils.js';

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
/** 0..1 progress of t through [a, b]. */
export const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
export const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));

export const FONT = '"Lilita One", "Arial Rounded MT Bold", "Baloo 2", Impact, "Arial Black", sans-serif';

export function rng(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

export function tex(canvas, { srgb = true, repeat = null, aniso = 8, wrap = false } = {}) {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  if (repeat || wrap) { t.wrapS = t.wrapT = THREE.RepeatWrapping; if (repeat) t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

/** Merge geometries into one (position / normal / uv only, non-indexed). */
export function merge(list) {
  const out = mergeRaw(list.map((g) => {
    const n = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k);
    return n;
  }));
  return out;
}

/** Merge [geometry, colour] pairs into one vertex-coloured geometry. */
export function mergeColored(parts) {
  const col = new THREE.Color();
  return mergeRaw(parts.map(([g, c]) => {
    const n = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(n.attributes)) if (!['position', 'normal'].includes(k)) n.deleteAttribute(k);
    col.set(c);
    const cnt = n.attributes.position.count, arr = new Float32Array(cnt * 3);
    for (let i = 0; i < cnt; i++) { arr[i * 3] = col.r; arr[i * 3 + 1] = col.g; arr[i * 3 + 2] = col.b; }
    n.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    return n;
  }));
}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
/** Bake a transform into a geometry: position, euler rotation, scale. */
export function xf(geo, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) {
  _e.set(r[0], r[1], r[2]); _q.setFromEuler(_e);
  _p.set(p[0], p[1], p[2]);
  if (typeof s === 'number') _s.set(s, s, s); else _s.set(s[0], s[1], s[2]);
  _m.compose(_p, _q, _s);
  return geo.applyMatrix4(_m);
}

/**
 * Box with world-scale UVs (texture density `uv` repeats per metre), centred at x, y, z and rotated.
 * Keeps wood grain the same size on beams of any length.
 */
export function tbox(w, h, d, x = 0, y = 0, z = 0, { rx = 0, ry = 0, rz = 0, uv = 1 } = {}) {
  const g = new THREE.BoxGeometry(w, h, d);
  const a = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) {
    const k = f * 4 + i;
    a.setXY(k, a.getX(k) * dims[f][0] * uv, a.getY(k) * dims[f][1] * uv);
  }
  return xf(g, [x, y, z], [rx, ry, rz]);
}

/** Flat quad at height y, facing up. v = 1 at z0, 0 at z1 (z1 < z0), u = u0 at x0 .. u1 at x1. */
export function floorQuad(x0, x1, z0, z1, y = 0, u0 = 0, u1 = 1, v0 = 1, v1 = 0) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([x0, y, z0, x1, y, z0, x0, y, z1, x1, y, z1], 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([u0, v0, u1, v0, u0, v1, u1, v1], 2));
  g.setIndex([0, 1, 2, 1, 3, 2]);
  return g;
}

/**
 * Paint wooden boards running along canvas Y into the rect: n boards across, random end joints,
 * per-board tone variation and fine grain streaks.
 */
export function drawBoards(g, x0, y0, w, h, { n, rand, hue = 33, sat = 55, light = 62, dl = 5, seam = 0.28, segLen = [400, 1200], grain = 1 }) {
  const bw = w / n;
  for (let i = 0; i < n; i++) {
    const bx = x0 + i * bw;
    let y = y0 - rand() * segLen[0];
    while (y < y0 + h) {
      const len = segLen[0] + rand() * (segLen[1] - segLen[0]);
      const l = light + (rand() - 0.5) * 2 * dl, s = sat + (rand() - 0.5) * 10, hh = hue + (rand() - 0.5) * 5;
      g.fillStyle = `hsl(${hh.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%)`;
      const ya = Math.max(y, y0), yb = Math.min(y + len, y0 + h);
      if (yb > ya) {
        g.fillRect(bx, ya, bw + 0.6, yb - ya);
        // soft lengthwise figure inside the board
        const k = 2 + Math.floor(rand() * 3);
        for (let j = 0; j < k; j++) {
          g.fillStyle = rand() < 0.5 ? 'rgba(255,240,210,0.07)' : 'rgba(90,45,10,0.07)';
          const fx = bx + rand() * bw * 0.8, fw = bw * (0.1 + rand() * 0.3);
          g.fillRect(fx, ya, Math.min(fw, bx + bw - fx), yb - ya);
        }
        if (y > y0) { g.fillStyle = `rgba(50,25,8,${seam})`; g.fillRect(bx, ya, bw, 1.2); }
      }
      y += len;
    }
  }
  const streaks = Math.floor((w * h) / 520 * grain);
  for (let i = 0; i < streaks; i++) {
    const gx = x0 + rand() * w, gy = y0 + rand() * h, len = 40 + rand() * 420;
    g.fillStyle = rand() < 0.55 ? `rgba(80,40,10,${0.03 + rand() * 0.06})` : `rgba(255,235,200,${0.03 + rand() * 0.05})`;
    g.fillRect(gx, gy, 1, Math.min(len, y0 + h - gy));
  }
  g.fillStyle = `rgba(45,22,6,${seam})`;
  for (let i = 1; i < n; i++) g.fillRect(x0 + i * bw - 0.5, y0, 1, h);
}

/** Neon tube lettering: outlined glyphs with a coloured glow and a hot white core. */
export function neonText(g, text, x, y, size, color, { align = 'center', tube = 0.06, fill = false } = {}) {
  g.save();
  g.font = `${size}px ${FONT}`;
  g.textAlign = align; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.lineCap = 'round';
  const lw = size * tube;
  g.shadowColor = color; g.strokeStyle = color;
  g.globalAlpha = 0.55; g.shadowBlur = size * 0.5; g.lineWidth = lw * 1.6; g.strokeText(text, x, y);
  g.globalAlpha = 0.9; g.shadowBlur = size * 0.2; g.lineWidth = lw; g.strokeText(text, x, y);
  if (fill) { g.globalAlpha = 0.16; g.fillStyle = color; g.fillText(text, x, y); }
  g.globalAlpha = 1; g.shadowBlur = size * 0.06; g.strokeStyle = '#fff6ea'; g.lineWidth = lw * 0.36; g.strokeText(text, x, y);
  g.restore();
}

/** Neon tube along a 2D path function (ctx) => void that builds the path. */
export function neonPath(g, build, color, lw) {
  g.save();
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.shadowColor = color; g.strokeStyle = color;
  g.globalAlpha = 0.55; g.shadowBlur = lw * 7; g.lineWidth = lw * 1.6; g.beginPath(); build(g); g.stroke();
  g.globalAlpha = 0.9; g.shadowBlur = lw * 3; g.lineWidth = lw; g.beginPath(); build(g); g.stroke();
  g.globalAlpha = 1; g.shadowBlur = lw; g.strokeStyle = '#fff6ea'; g.lineWidth = lw * 0.36; g.beginPath(); build(g); g.stroke();
  g.restore();
}

/** Soft round dot texture for glows and blob shadows. */
export function dotTexture(size = 128, inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)', mid = 0.35) {
  const c = makeCanvas(size, size), g = c.getContext('2d');
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, inner); grd.addColorStop(mid, inner.replace(/[\d.]+\)$/, '0.45)')); grd.addColorStop(1, outer);
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  return tex(c, { srgb: true, aniso: 1 });
}
