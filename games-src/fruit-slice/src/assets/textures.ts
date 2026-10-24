/**
 * Procedural CanvasTextures: fruit skins (u around, v bottom→top; canvas top
 * row = top of fruit) and cut-face flesh (drawn Cartesian, then resampled to
 * POLAR layout: u = angle, v = radius with v = 1 at the rim — see slicer.ts).
 */
import * as THREE from 'three';

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Ctx = CanvasRenderingContext2D;

function canvas(w: number, h: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: false })!;
  return [c, ctx];
}

export function toTexture(c: HTMLCanvasElement, srgb = true, wrapU = true): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = wrapU ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.anisotropy = 4;
  t.userData.shared = true;
  t.needsUpdate = true;
  return t;
}

// ------------------------------------------------------------ skin helpers ---

const SW = 512;
const SH = 256;

/** Horizontal stretch to keep features round on a sphere-mapped canvas row. */
function comp(y: number, h = SH): number {
  return 1 / Math.max(0.22, Math.sin((Math.PI * y) / h));
}

function ellipseWrapped(ctx: Ctx, x: number, y: number, rx: number, ry: number, rot = 0, w = SW): void {
  for (const ox of [-w, 0, w]) {
    const cx = x + ox;
    if (cx + rx < -2 || cx - rx > w + 2) continue;
    ctx.beginPath();
    ctx.ellipse(cx, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2);
    ctx.fill();
  }
}

function vGrad(ctx: Ctx, stops: [number, string][], w = SW, h = SH): void {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function speckle(ctx: Ctx, rnd: () => number, n: number, color: () => string, rMin: number, rMax: number, yMin = 0, yMax = SH, compensate = true): void {
  for (let i = 0; i < n; i++) {
    const x = rnd() * SW;
    const y = yMin + rnd() * (yMax - yMin);
    const r = rMin + rnd() * (rMax - rMin);
    ctx.fillStyle = color();
    ellipseWrapped(ctx, x, y, r * (compensate ? comp(y) : 1), r);
  }
}

function softBlob(ctx: Ctx, x: number, y: number, rx: number, ry: number, color: string, alpha: number): void {
  for (const ox of [-SW, 0, SW]) {
    const g = ctx.createRadialGradient(x + ox, y, 0, x + ox, y, rx);
    g.addColorStop(0, color.replace('A', String(alpha)));
    g.addColorStop(1, color.replace('A', '0'));
    ctx.save();
    ctx.translate(x + ox, y);
    ctx.scale(1, ry / rx);
    ctx.translate(-(x + ox), -y);
    ctx.fillStyle = g;
    ctx.fillRect(x + ox - rx, y - rx, rx * 2, rx * 2);
    ctx.restore();
  }
}

function hsl(h: number, s: number, l: number, a = 1): string {
  return `hsla(${h},${s}%,${l}%,${a})`;
}

/** Vertical strokes along meridians (stripes / fibres / streaks). */
function meridianStroke(ctx: Ctx, rnd: () => number, x0: number, y0: number, y1: number, width: number, wobble: number, freq: number): void {
  const steps = 24;
  const ph = rnd() * 10;
  for (const ox of [-SW, 0, SW]) {
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const y = y0 + ((y1 - y0) * i) / steps;
      const x = x0 + ox + Math.sin(ph + (i / steps) * freq) * wobble + (rnd() - 0.5) * wobble * 0.4;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

export interface SkinSet {
  map: THREE.Texture;
  bump?: THREE.Texture;
  emissive?: THREE.Texture;
}

function dimpleBump(seed: number, n: number, rMin: number, rMax: number, base = '#808080'): THREE.CanvasTexture {
  const [c, ctx] = canvas(SW, SH);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, SW, SH);
  const rnd = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const x = rnd() * SW, y = rnd() * SH;
    const r = rMin + rnd() * (rMax - rMin);
    const k = comp(y);
    for (const ox of [-SW, 0, SW]) {
      const g = ctx.createRadialGradient(x + ox, y, 0, x + ox, y, r * 1.6);
      g.addColorStop(0, 'rgba(0,0,0,0.55)');
      g.addColorStop(0.6, 'rgba(0,0,0,0.15)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.save();
      ctx.translate(x + ox, y);
      ctx.scale(k, 1);
      ctx.translate(-(x + ox), -y);
      ctx.fillRect(x + ox - r * 2, y - r * 2, r * 4, r * 4);
      ctx.restore();
    }
  }
  return toTexture(c, false);
}

export function paintSkin(kind: string): SkinSet {
  const [c, ctx] = canvas(SW, SH);
  const rnd = mulberry32(kind.length * 7919 + kind.charCodeAt(0) * 31 + kind.charCodeAt(1));
  switch (kind) {
    case 'apple': {
      vGrad(ctx, [[0, '#7d0d18'], [0.12, '#b5151f'], [0.5, '#d42330'], [0.85, '#c51b29'], [1, '#a8601e']]);
      // yellow-green blush on one side
      softBlob(ctx, SW * 0.72, SH * 0.55, 120, 80, 'rgba(236,170,52,A)', 0.55);
      softBlob(ctx, SW * 0.72, SH * 0.6, 60, 40, 'rgba(240,200,80,A)', 0.4);
      // streaks
      for (let i = 0; i < 150; i++) {
        ctx.strokeStyle = rnd() < 0.5 ? 'rgba(120,8,18,0.22)' : 'rgba(240,80,70,0.18)';
        const x = rnd() * SW;
        const y0 = SH * (0.05 + rnd() * 0.3);
        meridianStroke(ctx, rnd, x, y0, y0 + SH * (0.3 + rnd() * 0.5), 1.5 + rnd() * 3, 3, 3);
      }
      // stem cavity tint
      const g = ctx.createLinearGradient(0, 0, 0, 30);
      g.addColorStop(0, 'rgba(140,120,40,0.8)');
      g.addColorStop(1, 'rgba(140,120,40,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, SW, 30);
      speckle(ctx, rnd, 220, () => 'rgba(255,225,170,0.45)', 0.8, 1.6, 20, SH - 10);
      return { map: toTexture(c) };
    }
    case 'orange': {
      vGrad(ctx, [[0, '#e9781a'], [0.08, '#f5891c'], [0.5, '#fb9a24'], [0.92, '#f58a1e'], [1, '#d9731a']]);
      softBlob(ctx, SW * 0.3, SH * 0.4, 140, 90, 'rgba(255,190,80,A)', 0.25);
      speckle(ctx, rnd, 900, () => (rnd() < 0.6 ? 'rgba(190,80,10,0.22)' : 'rgba(255,200,110,0.25)'), 0.8, 1.8);
      // navel
      ctx.fillStyle = 'rgba(120,80,20,0.6)';
      ctx.fillRect(0, SH - 4, SW, 4);
      ctx.fillStyle = 'rgba(110,120,30,0.6)';
      ctx.fillRect(0, 0, SW, 4);
      return { map: toTexture(c), bump: dimpleBump(11, 1400, 1.2, 2.4) };
    }
    case 'watermelon': {
      ctx.fillStyle = '#5c9e3a';
      ctx.fillRect(0, 0, SW, SH);
      // pale mottling
      speckle(ctx, rnd, 300, () => 'rgba(160,205,110,0.25)', 3, 10, 0, SH, true);
      // dark jagged stripes
      const N = 16;
      for (let i = 0; i < N; i++) {
        const x = (i + 0.5) * (SW / N) + (rnd() - 0.5) * 6;
        ctx.strokeStyle = '#1d4d1c';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        meridianStroke(ctx, rnd, x, -5, SH + 5, 13, 5, 9);
        ctx.strokeStyle = 'rgba(29,77,28,0.7)';
        meridianStroke(ctx, rnd, x + 4, -5, SH + 5, 6, 8, 14);
      }
      // field spot
      softBlob(ctx, SW * 0.6, SH * 0.5, 70, 50, 'rgba(225,215,120,A)', 0.55);
      vGrad(ctx, [[0, 'rgba(30,60,20,0.35)'], [0.15, 'rgba(0,0,0,0)'], [0.85, 'rgba(0,0,0,0)'], [1, 'rgba(30,60,20,0.35)']]);
      return { map: toTexture(c) };
    }
    case 'banana':
      return paintBanana(c, ctx, rnd, ['#f3cd2f', '#ffe14a'], true);
    case 'pineapple': {
      ctx.fillStyle = '#a8681c';
      ctx.fillRect(0, 0, SW, SH);
      const [bc, bctx] = canvas(SW, SH);
      bctx.fillStyle = '#000';
      bctx.fillRect(0, 0, SW, SH);
      const cols = 11, rows = 9;
      const cw = SW / cols, ch = SH / rows;
      for (let j = -1; j <= rows * 2 + 1; j++) {
        for (let i = -1; i <= cols; i++) {
          const x = i * cw + (j % 2 ? cw / 2 : 0);
          const y = (j * ch) / 2;
          const k = comp(Math.min(SH - 1, Math.max(1, y)));
          const hw = (cw / 2) * 0.92, hh = (ch / 2) * 0.95;
          for (const [cctx, col] of [[ctx, true], [bctx, false]] as [Ctx, boolean][]) {
            for (const ox of [-SW, 0, SW]) {
              cctx.beginPath();
              cctx.moveTo(x + ox, y - hh);
              cctx.lineTo(x + ox + hw, y);
              cctx.lineTo(x + ox, y + hh);
              cctx.lineTo(x + ox - hw, y);
              cctx.closePath();
              const g = cctx.createRadialGradient(x + ox, y - hh * 0.1, 1, x + ox, y, hw * 1.1);
              if (col) {
                const t = y / SH;
                g.addColorStop(0, t < 0.3 ? '#e6c14a' : '#f7c54a');
                g.addColorStop(0.55, t < 0.3 ? '#c99a2e' : '#e3a133');
                g.addColorStop(1, '#8a5518');
              } else {
                g.addColorStop(0, '#fff');
                g.addColorStop(1, '#333');
              }
              cctx.fillStyle = g;
              cctx.fill();
              if (col) {
                // tiny spike / eye
                cctx.fillStyle = 'rgba(70,60,20,0.85)';
                cctx.beginPath();
                cctx.ellipse(x + ox, y - hh * 0.35, 2.4 * Math.min(k, 2), 3.2, 0, 0, Math.PI * 2);
                cctx.fill();
                cctx.fillStyle = 'rgba(120,150,50,0.55)';
                cctx.beginPath();
                cctx.ellipse(x + ox, y - hh * 0.55, 1.5 * Math.min(k, 2), 2.2, 0, 0, Math.PI * 2);
                cctx.fill();
              }
            }
          }
        }
      }
      vGrad(ctx, [[0, 'rgba(90,110,30,0.35)'], [0.25, 'rgba(0,0,0,0)'], [0.9, 'rgba(0,0,0,0)'], [1, 'rgba(70,40,10,0.4)']]);
      return { map: toTexture(c), bump: toTexture(bc, false) };
    }
    case 'strawberry': {
      vGrad(ctx, [[0, '#f2d38a'], [0.06, '#f08a5a'], [0.16, '#e2303a'], [0.6, '#d81f2e'], [1, '#b8121f']]);
      speckle(ctx, rnd, 200, () => 'rgba(150,0,20,0.18)', 4, 10);
      const [bc, bctx] = canvas(SW, SH);
      bctx.fillStyle = '#808080';
      bctx.fillRect(0, 0, SW, SH);
      const rows = 13, cols = 18;
      for (let j = 0; j < rows; j++) {
        const y = SH * (0.1 + (0.86 * (j + 0.5)) / rows);
        const k = Math.min(comp(y), 2.6);
        const nc = Math.max(5, Math.round(cols / k));
        for (let i = 0; i < nc; i++) {
          const x = ((i + (j % 2) * 0.5) / nc) * SW + (rnd() - 0.5) * 4;
          const yy = y + (rnd() - 0.5) * 3;
          ctx.fillStyle = 'rgba(120,0,15,0.55)';
          ellipseWrapped(ctx, x, yy, 4.2 * k, 5);
          ctx.fillStyle = rnd() < 0.5 ? '#f4d870' : '#e8c24e';
          ellipseWrapped(ctx, x, yy - 0.5, 1.8 * k, 2.8);
          ctx.fillStyle = 'rgba(255,255,220,0.7)';
          ellipseWrapped(ctx, x - 0.5 * k, yy - 1.4, 0.6 * k, 0.9);
          bctx.fillStyle = '#303030';
          ellipseWrapped(bctx, x, yy, 4 * k, 5);
          bctx.fillStyle = '#d0d0d0';
          ellipseWrapped(bctx, x, yy - 0.5, 1.8 * k, 2.6);
        }
      }
      return { map: toTexture(c), bump: toTexture(bc, false) };
    }
    case 'coconut': {
      ctx.fillStyle = '#6a4224';
      ctx.fillRect(0, 0, SW, SH);
      for (let i = 0; i < 900; i++) {
        const l = rnd();
        ctx.strokeStyle = l < 0.4 ? 'rgba(50,28,12,0.5)' : l < 0.8 ? 'rgba(150,105,60,0.45)' : 'rgba(190,150,100,0.4)';
        const x = rnd() * SW, y0 = rnd() * SH;
        meridianStroke(ctx, rnd, x, y0, y0 + 20 + rnd() * 60, 0.8 + rnd() * 1.6, 4, 2);
      }
      // three eyes near the top
      for (let i = 0; i < 3; i++) {
        const x = (i / 3) * SW + 40;
        const y = 16;
        ctx.fillStyle = '#2a170a';
        ellipseWrapped(ctx, x, y, 7 * comp(y), 6);
      }
      vGrad(ctx, [[0, 'rgba(40,20,8,0.5)'], [0.12, 'rgba(0,0,0,0)'], [1, 'rgba(40,20,8,0.3)']]);
      return { map: toTexture(c), bump: dimpleBump(23, 600, 1, 3, '#909090') };
    }
    case 'kiwi': {
      vGrad(ctx, [[0, '#5e3e1e'], [0.1, '#8a6234'], [0.5, '#93693a'], [0.9, '#866033'], [1, '#5a3b1c']]);
      speckle(ctx, rnd, 250, () => (rnd() < 0.5 ? 'rgba(70,45,20,0.25)' : 'rgba(170,130,80,0.2)'), 4, 12);
      for (let i = 0; i < 2500; i++) {
        ctx.strokeStyle = rnd() < 0.5 ? 'rgba(60,38,16,0.35)' : 'rgba(190,150,100,0.3)';
        ctx.lineWidth = 0.8;
        const x = rnd() * SW, y = rnd() * SH;
        const a = rnd() * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * 3 * comp(y), y + Math.sin(a) * 3);
        ctx.stroke();
      }
      return { map: toTexture(c) };
    }
    case 'lemon': {
      vGrad(ctx, [[0, '#c9b822'], [0.07, '#f2d92e'], [0.5, '#fbe73e'], [0.93, '#f2d92e'], [1, '#c2ae1e']]);
      softBlob(ctx, SW * 0.25, SH * 0.45, 140, 80, 'rgba(255,248,150,A)', 0.35);
      speckle(ctx, rnd, 900, () => (rnd() < 0.6 ? 'rgba(190,160,10,0.2)' : 'rgba(255,250,190,0.3)'), 0.8, 1.6);
      return { map: toTexture(c), bump: dimpleBump(37, 1300, 1, 2.1) };
    }
    case 'peach': {
      vGrad(ctx, [[0, '#e7a03a'], [0.5, '#f7b54e'], [1, '#f1a845']]);
      softBlob(ctx, SW * 0.55, SH * 0.45, 210, 150, 'rgba(226,64,54,A)', 0.85);
      softBlob(ctx, SW * 0.5, SH * 0.35, 120, 80, 'rgba(200,40,50,A)', 0.5);
      speckle(ctx, rnd, 400, () => 'rgba(255,230,180,0.18)', 1, 3);
      speckle(ctx, rnd, 150, () => 'rgba(170,30,30,0.18)', 1, 2.5, SH * 0.2, SH * 0.7);
      // crease shading at u = 0
      for (const ox of [0, SW]) {
        const g = ctx.createLinearGradient(ox - 14, 0, ox + 14, 0);
        g.addColorStop(0, 'rgba(150,40,30,0)');
        g.addColorStop(0.5, 'rgba(150,40,30,0.35)');
        g.addColorStop(1, 'rgba(150,40,30,0)');
        ctx.fillStyle = g;
        ctx.fillRect(ox - 14, 0, 28, SH);
      }
      return { map: toTexture(c) };
    }
    case 'plum': {
      vGrad(ctx, [[0, '#2a0d36'], [0.15, '#4b1a5e'], [0.5, '#5e2270'], [0.85, '#4a1a5c'], [1, '#2e0f3a']]);
      speckle(ctx, rnd, 160, () => 'rgba(140,40,90,0.25)', 6, 18);
      // waxy bloom
      speckle(ctx, rnd, 1400, () => 'rgba(190,180,230,0.13)', 1, 4);
      softBlob(ctx, SW * 0.4, SH * 0.5, 160, 90, 'rgba(170,150,220,A)', 0.18);
      for (const ox of [0, SW]) {
        const g = ctx.createLinearGradient(ox - 10, 0, ox + 10, 0);
        g.addColorStop(0, 'rgba(20,5,25,0)');
        g.addColorStop(0.5, 'rgba(20,5,25,0.45)');
        g.addColorStop(1, 'rgba(20,5,25,0)');
        ctx.fillStyle = g;
        ctx.fillRect(ox - 10, 0, 20, SH);
      }
      return { map: toTexture(c) };
    }
    case 'mango': {
      vGrad(ctx, [[0, '#d8432a'], [0.25, '#f07a2c'], [0.55, '#f6c23a'], [0.85, '#9fbf3a'], [1, '#6f9a2e']]);
      softBlob(ctx, SW * 0.7, SH * 0.25, 160, 90, 'rgba(220,50,50,A)', 0.55);
      softBlob(ctx, SW * 0.2, SH * 0.7, 140, 70, 'rgba(120,170,50,A)', 0.4);
      speckle(ctx, rnd, 350, () => 'rgba(255,245,190,0.55)', 0.7, 1.4);
      return { map: toTexture(c) };
    }
    case 'dragonfruit': {
      vGrad(ctx, [[0, '#c0105e'], [0.4, '#e3247e'], [0.8, '#e9358a'], [1, '#b80f58']]);
      speckle(ctx, rnd, 220, () => 'rgba(255,120,180,0.2)', 4, 14);
      speckle(ctx, rnd, 120, () => 'rgba(140,0,60,0.2)', 4, 12);
      return { map: toTexture(c) };
    }
    case 'pomegranate': {
      vGrad(ctx, [[0, '#7a0c1c'], [0.15, '#a3142a'], [0.55, '#b81c30'], [1, '#8e1024']]);
      softBlob(ctx, SW * 0.35, SH * 0.6, 150, 90, 'rgba(225,140,90,A)', 0.4);
      softBlob(ctx, SW * 0.85, SH * 0.4, 90, 60, 'rgba(230,160,100,A)', 0.3);
      for (let i = 0; i < 120; i++) {
        ctx.strokeStyle = rnd() < 0.5 ? 'rgba(90,5,20,0.25)' : 'rgba(240,120,110,0.2)';
        const x = rnd() * SW, y0 = rnd() * SH * 0.6;
        meridianStroke(ctx, rnd, x, y0, y0 + 40 + rnd() * 80, 1 + rnd() * 2, 4, 2);
      }
      speckle(ctx, rnd, 200, () => 'rgba(255,210,170,0.25)', 0.8, 1.5);
      return { map: toTexture(c) };
    }
    case 'freeze': {
      const s = paintBanana(c, ctx, rnd, ['#a8e4ff', '#e6f9ff'], false);
      // crystal veins
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      for (let i = 0; i < 60; i++) {
        ctx.lineWidth = 0.8 + rnd() * 1.5;
        const x = rnd() * SW, y = rnd() * SH;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (rnd() - 0.5) * 50, y + (rnd() - 0.5) * 30);
        ctx.lineTo(x + (rnd() - 0.5) * 60, y + (rnd() - 0.5) * 40);
        ctx.stroke();
      }
      s.map.needsUpdate = true;
      s.emissive = s.map;
      return s;
    }
    case 'frenzy': {
      const s = paintBanana(c, ctx, rnd, ['#ff5a1f', '#ffb52e'], false);
      for (let i = 0; i < 70; i++) {
        ctx.strokeStyle = rnd() < 0.5 ? 'rgba(255,230,90,0.65)' : 'rgba(200,20,10,0.5)';
        meridianStroke(ctx, rnd, rnd() * SW, SH * rnd() * 0.8, SH, 2 + rnd() * 5, 8, 5);
      }
      s.map.needsUpdate = true;
      s.emissive = s.map;
      return s;
    }
    case 'double': {
      const s = paintBanana(c, ctx, rnd, ['#e8a812', '#ffe27a'], false);
      speckle(ctx, rnd, 120, () => 'rgba(255,255,230,0.9)', 0.8, 1.8, 20, SH - 20, false);
      s.map.needsUpdate = true;
      s.emissive = s.map;
      return s;
    }
  }
  ctx.fillStyle = '#ccc';
  ctx.fillRect(0, 0, SW, SH);
  return { map: toTexture(c) };
}

/**
 * Banana skin: v = 0 at the blossom tip (canvas bottom), v = 1 at the stem
 * (canvas top). Ridges at u = k/5.
 */
function paintBanana(c: HTMLCanvasElement, ctx: Ctx, rnd: () => number, [base, light]: [string, string], natural: boolean): SkinSet {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, SW, SH);
  // soft highlights between ridges
  for (let k = 0; k < 5; k++) {
    const x = ((k + 0.5) / 5) * SW;
    const g = ctx.createLinearGradient(x - SW / 10, 0, x + SW / 10, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.5, light);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = g;
    ctx.fillRect(x - SW / 10, 0, SW / 5, SH);
    ctx.globalAlpha = 1;
  }
  // ridges
  for (let k = 0; k <= 5; k++) {
    const x = (k / 5) * SW;
    ctx.strokeStyle = natural ? 'rgba(150,130,20,0.45)' : 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, SH);
    ctx.stroke();
  }
  if (natural) {
    // greenish ends
    vGrad(ctx, [[0, 'rgba(120,150,40,0.85)'], [0.14, 'rgba(150,170,50,0.35)'], [0.3, 'rgba(0,0,0,0)'], [0.85, 'rgba(0,0,0,0)'], [0.94, 'rgba(160,160,40,0.4)'], [1, 'rgba(0,0,0,0)']]);
    // sugar spots
    speckle(ctx, rnd, 40, () => 'rgba(110,70,20,0.55)', 0.8, 2.2, SH * 0.15, SH * 0.85, false);
    speckle(ctx, rnd, 14, () => 'rgba(110,70,20,0.35)', 2, 3.5, SH * 0.2, SH * 0.8, false);
    // stem (top) + blossom tip (bottom)
    ctx.fillStyle = '#6d6a2a';
    ctx.fillRect(0, 0, SW, SH * 0.045);
    ctx.fillStyle = '#3d2a12';
    ctx.fillRect(0, 0, SW, SH * 0.018);
    ctx.fillStyle = '#3a2812';
    ctx.fillRect(0, SH * 0.965, SW, SH * 0.035);
    const g = ctx.createLinearGradient(0, SH * 0.9, 0, SH * 0.965);
    g.addColorStop(0, 'rgba(58,40,18,0)');
    g.addColorStop(1, 'rgba(58,40,18,0.9)');
    ctx.fillStyle = g;
    ctx.fillRect(0, SH * 0.9, SW, SH * 0.065);
  } else {
    vGrad(ctx, [[0, 'rgba(255,255,255,0.35)'], [0.06, 'rgba(0,0,0,0)'], [0.94, 'rgba(0,0,0,0)'], [1, 'rgba(255,255,255,0.35)']]);
  }
  return { map: toTexture(c) };
}

/** Simple single-colour-ish texture for attachments (stems, leaves, crowns). */
export function paintGradient(stops: [number, string][], veins = false): THREE.CanvasTexture {
  const [c, ctx] = canvas(64, 128);
  const g = ctx.createLinearGradient(0, 128, 0, 0); // v=0 (base) at bottom
  for (const [o, col] of stops) g.addColorStop(o, col);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 128);
  if (veins) {
    ctx.strokeStyle = 'rgba(255,255,220,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(32, 128);
    ctx.lineTo(32, 0);
    ctx.stroke();
    ctx.lineWidth = 1;
    for (let i = 1; i < 6; i++) {
      const y = 128 - i * 20;
      ctx.beginPath();
      ctx.moveTo(32, y);
      ctx.lineTo(6, y - 16);
      ctx.moveTo(32, y);
      ctx.lineTo(58, y - 16);
      ctx.stroke();
    }
  }
  return toTexture(c, true, false);
}

// ------------------------------------------------------------------ flesh ---

const FS = 512;
const FR = 256; // radius in px of the unit circle

type FleshPainter = (ctx: Ctx, rnd: () => number, R: (s: number) => number) => void;

function ring(ctx: Ctx, s: number, color: string | CanvasGradient): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(FR, FR, s * FR, 0, Math.PI * 2);
  ctx.fill();
}

function radial(ctx: Ctx, stops: [number, string][], s1 = 1): CanvasGradient {
  const g = ctx.createRadialGradient(FR, FR, 0, FR, FR, s1 * FR);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

function polar(a: number, s: number): [number, number] {
  return [FR + Math.cos(a) * s * FR, FR + Math.sin(a) * s * FR];
}

function teardrop(ctx: Ctx, a: number, s: number, len: number, wid: number, color: string, hl = true): void {
  const [x, y] = polar(a, s);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(a);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-len * 0.6, 0);
  ctx.quadraticCurveTo(-len * 0.1, -wid, len * 0.45, -wid * 0.55);
  ctx.quadraticCurveTo(len * 0.7, 0, len * 0.45, wid * 0.55);
  ctx.quadraticCurveTo(-len * 0.1, wid, -len * 0.6, 0);
  ctx.fill();
  if (hl) {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(len * 0.15, -wid * 0.3, len * 0.18, wid * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function segments(ctx: Ctx, rnd: () => number, n: number, sOuter: number, sCore: number, colA: string, colB: string, membrane: string): void {
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
    const gap = 0.035;
    ctx.beginPath();
    const [x0, y0] = polar(a0 + gap * 2.5, sCore);
    ctx.moveTo(x0, y0);
    ctx.arc(FR, FR, sOuter * FR, a0 + gap, a1 - gap);
    const [x1, y1] = polar(a1 - gap * 2.5, sCore);
    ctx.lineTo(x1, y1);
    ctx.closePath();
    const g = radial(ctx, [[0, colB], [0.5, colA], [1, colB]], sOuter);
    ctx.fillStyle = g;
    ctx.fill();
    // juice vesicles
    ctx.save();
    ctx.clip();
    for (let k = 0; k < 70; k++) {
      const a = a0 + rnd() * (a1 - a0);
      const s = sCore + rnd() * (sOuter - sCore);
      const [x, y] = polar(a, s);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      ctx.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10 + rnd() * 10, 2 + rnd() * 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  void membrane;
}

const FLESH: Record<string, FleshPainter> = {
  watermelon(ctx, rnd) {
    ring(ctx, 2, '#2f6b26');
    ring(ctx, 0.975, '#7fbf4f');
    ring(ctx, 0.955, '#dff0b8');
    ring(ctx, 0.915, radial(ctx, [[0, '#f5243f'], [0.7, '#ff3f4f'], [0.93, '#ff6d6a'], [1, '#ffb7a0']], 0.915));
    // juicy grain
    for (let i = 0; i < 500; i++) {
      const a = rnd() * Math.PI * 2, s = Math.sqrt(rnd()) * 0.86;
      const [x, y] = polar(a, s);
      ctx.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.13)' : 'rgba(170,0,30,0.12)';
      ctx.beginPath();
      ctx.arc(x, y, 2 + rnd() * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    const seeds = 22;
    for (let i = 0; i < seeds; i++) {
      const a = (i / seeds) * Math.PI * 2 + (rnd() - 0.5) * 0.15;
      const s = (i % 2 ? 0.48 : 0.62) + (rnd() - 0.5) * 0.06;
      teardrop(ctx, a + Math.PI, s, 22, 8, '#1a1210');
    }
  },
  orange(ctx, rnd) {
    ring(ctx, 2, '#f08a1a');
    ring(ctx, 0.965, '#fff1d6');
    ring(ctx, 0.92, '#fde7c0');
    segments(ctx, rnd, 10, 0.905, 0.1, '#ffa62b', '#ff8e18', '#fff');
    ring(ctx, 0.09, '#fff0d0');
  },
  lemon(ctx, rnd) {
    ring(ctx, 2, '#f4d82a');
    ring(ctx, 0.965, '#fffbe0');
    ring(ctx, 0.915, '#fff6c8');
    segments(ctx, rnd, 9, 0.9, 0.11, '#fff26a', '#ffe23c', '#fff');
    ring(ctx, 0.1, '#fffbe6');
  },
  kiwi(ctx, rnd) {
    ring(ctx, 2, '#6e4b28');
    ring(ctx, 0.975, radial(ctx, [[0, '#d8f08e'], [0.35, '#9fd34c'], [0.8, '#73b72e'], [1, '#5f9f22']], 0.975));
    ctx.strokeStyle = 'rgba(230,255,180,0.35)';
    for (let i = 0; i < 70; i++) {
      const a = (i / 70) * Math.PI * 2 + rnd() * 0.05;
      const [x0, y0] = polar(a, 0.22);
      const [x1, y1] = polar(a, 0.6 + rnd() * 0.3);
      ctx.lineWidth = 1 + rnd() * 2;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    ring(ctx, 0.2, radial(ctx, [[0, '#fbf8df'], [0.8, '#f0f0c8'], [1, '#d6e8a0']], 0.2));
    for (let i = 0; i < 70; i++) {
      const a = (i / 70) * Math.PI * 2 + (rnd() - 0.5) * 0.04;
      const s = 0.27 + rnd() * 0.08;
      teardrop(ctx, a, s, 11, 3.5, '#1a140c', false);
    }
  },
  apple(ctx, rnd) {
    ring(ctx, 2, '#c11a26');
    ring(ctx, 0.975, '#f6eac0');
    ring(ctx, 0.96, radial(ctx, [[0, '#f1e3a6'], [0.4, '#fbf1cf'], [1, '#fdf5d8']], 0.96));
    // vascular bundle dots
    for (let i = 0; i < 10; i++) {
      const [x, y] = polar((i / 10) * Math.PI * 2, 0.42);
      ctx.fillStyle = 'rgba(200,190,120,0.45)';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // star core
    ctx.strokeStyle = 'rgba(190,180,100,0.7)';
    ctx.fillStyle = 'rgba(236,224,160,0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const [x, y] = polar(a, i % 2 ? 0.12 : 0.3);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      teardrop(ctx, a, 0.19, 24, 9, '#4a2a12');
    }
    void rnd;
  },
  banana(ctx, rnd) {
    ring(ctx, 2, '#e8c22c');
    ring(ctx, 0.96, '#f6edc2');
    ring(ctx, 0.93, radial(ctx, [[0, '#efe1a8'], [0.3, '#fbf3d2'], [1, '#fdf6dc']], 0.93));
    // three-lobed centre
    ctx.fillStyle = 'rgba(214,190,120,0.55)';
    for (let i = 0; i < 3; i++) {
      const [x, y] = polar((i / 3) * Math.PI * 2, 0.08);
      ctx.beginPath();
      ctx.ellipse(x, y, 30, 18, (i / 3) * Math.PI * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 14; i++) {
      const a = rnd() * Math.PI * 2, s = rnd() * 0.12;
      const [x, y] = polar(a, s);
      ctx.fillStyle = '#7a5a2a';
      ctx.beginPath();
      ctx.arc(x, y, 3 + rnd() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  pineapple(ctx, rnd) {
    ring(ctx, 2, '#a26a1e');
    ring(ctx, 0.95, '#e7b13a');
    ring(ctx, 0.9, radial(ctx, [[0, '#fff2a0'], [0.25, '#ffe36a'], [0.7, '#ffd23e'], [1, '#f7c330']], 0.9));
    ctx.strokeStyle = 'rgba(255,250,200,0.45)';
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 2;
      const [x0, y0] = polar(a, 0.24);
      const [x1, y1] = polar(a, 0.85);
      ctx.lineWidth = 1 + rnd() * 2;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    // eyes near the rim
    for (let i = 0; i < 24; i++) {
      const [x, y] = polar((i / 24) * Math.PI * 2, 0.88);
      ctx.fillStyle = 'rgba(150,100,30,0.6)';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ring(ctx, 0.2, radial(ctx, [[0, '#fff7c6'], [1, '#ffeea0']], 0.2));
  },
  strawberry(ctx, rnd) {
    ring(ctx, 2, '#d01a28');
    ring(ctx, 0.96, radial(ctx, [[0, '#fff1ee'], [0.25, '#ffd2cc'], [0.55, '#ff7d78'], [0.85, '#f0333d'], [1, '#e2202e']], 0.96));
    ctx.strokeStyle = 'rgba(255,240,235,0.55)';
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + rnd() * 0.1;
      const [x0, y0] = polar(a, 0.2);
      const [x1, y1] = polar(a + (rnd() - 0.5) * 0.1, 0.85);
      ctx.lineWidth = 2 + rnd() * 2;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
  },
  coconut(ctx, rnd) {
    ring(ctx, 2, '#5a3519');
    ctx.strokeStyle = 'rgba(160,110,60,0.6)';
    for (let i = 0; i < 160; i++) {
      const a = rnd() * Math.PI * 2;
      const [x0, y0] = polar(a, 0.93);
      const [x1, y1] = polar(a + 0.05, 1.0);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    ring(ctx, 0.92, '#3b2210');
    ring(ctx, 0.885, '#8a5a32');
    ring(ctx, 0.87, radial(ctx, [[0, '#fffdf6'], [1, '#fbf6ea']], 0.87));
    ring(ctx, 0.58, radial(ctx, [[0, '#f4f7f3'], [0.85, '#eaf0ec'], [1, '#e2e8e2']], 0.58));
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.ellipse(FR - 50, FR - 60, 50, 22, -0.5, 0, Math.PI * 2);
    ctx.fill();
  },
  peach(ctx, rnd) {
    ring(ctx, 2, '#de4b33');
    ring(ctx, 0.975, radial(ctx, [[0, '#d24a2c'], [0.33, '#e9763a'], [0.5, '#ffb246'], [1, '#ffc35c']], 0.975));
    ctx.strokeStyle = 'rgba(200,60,40,0.35)';
    for (let i = 0; i < 40; i++) {
      const a = rnd() * Math.PI * 2;
      const [x0, y0] = polar(a, 0.3);
      const [x1, y1] = polar(a, 0.48 + rnd() * 0.12);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    ring(ctx, 0.31, radial(ctx, [[0, '#9a5228'], [0.8, '#7a3a18'], [1, '#5e2a10']], 0.31));
    ctx.strokeStyle = 'rgba(60,25,8,0.6)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      const a = rnd() * Math.PI * 2;
      const [x0, y0] = polar(a, 0.05 + rnd() * 0.1);
      const [x1, y1] = polar(a + (rnd() - 0.5), 0.25);
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(FR + (rnd() - 0.5) * 60, FR + (rnd() - 0.5) * 60, x1, y1);
      ctx.stroke();
    }
  },
  plum(ctx, rnd) {
    ring(ctx, 2, '#3a1048');
    ring(ctx, 0.975, radial(ctx, [[0, '#e7a73a'], [0.45, '#f2b640'], [0.75, '#e8853c'], [0.92, '#c63a3c'], [1, '#9a1e3a']], 0.975));
    ring(ctx, 0.27, radial(ctx, [[0, '#b07a42'], [0.8, '#8e5a2c'], [1, '#6a3e1c']], 0.27));
    ctx.strokeStyle = 'rgba(80,40,10,0.5)';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 6; i++) {
      const a = rnd() * Math.PI * 2;
      const [x0, y0] = polar(a, 0.04);
      const [x1, y1] = polar(a + 0.4, 0.22);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
  },
  mango(ctx, rnd) {
    ring(ctx, 2, '#c9542a');
    ring(ctx, 0.97, radial(ctx, [[0, '#ffd56a'], [0.4, '#ffbe2c'], [1, '#ffa318']], 0.97));
    ctx.strokeStyle = 'rgba(255,230,140,0.45)';
    for (let i = 0; i < 60; i++) {
      const a = rnd() * Math.PI * 2;
      const [x0, y0] = polar(a, 0.3);
      const [x1, y1] = polar(a, 0.9);
      ctx.lineWidth = 1 + rnd() * 1.5;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    ctx.fillStyle = '#f4e3b0';
    ctx.strokeStyle = '#e0c98a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(FR, FR, 0.42 * FR, 0.17 * FR, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(200,170,100,0.5)';
    ctx.lineWidth = 1.5;
    for (let i = -6; i <= 6; i++) {
      ctx.beginPath();
      ctx.moveTo(FR + i * 14, FR - 0.15 * FR);
      ctx.lineTo(FR + i * 14 + 6, FR + 0.15 * FR);
      ctx.stroke();
    }
  },
  dragonfruit(ctx, rnd) {
    ring(ctx, 2, '#d8186f');
    ring(ctx, 0.965, '#ff6fae');
    ring(ctx, 0.94, radial(ctx, [[0, '#ffffff'], [0.8, '#faf6f4'], [1, '#f5e9ee']], 0.94));
    for (let i = 0; i < 520; i++) {
      const a = rnd() * Math.PI * 2, s = Math.sqrt(rnd()) * 0.88;
      const [x, y] = polar(a, s);
      ctx.fillStyle = '#141014';
      ctx.beginPath();
      ctx.ellipse(x, y, 2.6, 2, rnd() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  pomegranate(ctx, rnd) {
    ring(ctx, 2, '#9a1426');
    ring(ctx, 0.95, '#f3e0b0');
    ring(ctx, 0.915, '#f8ebc8');
    // chambers
    const chambers = 6;
    const placed: [number, number, number][] = [];
    for (let i = 0; i < 2600 && placed.length < 260; i++) {
      const a = rnd() * Math.PI * 2, s = Math.sqrt(rnd()) * 0.86 + 0.02;
      const ca = (a / (Math.PI * 2)) * chambers;
      if (Math.abs(ca - Math.round(ca)) < 0.08 || s < 0.08) continue; // membranes
      const r = 10 + rnd() * 7;
      const [x, y] = polar(a, s);
      if (Math.hypot(x - FR, y - FR) + r > 0.9 * FR) continue;
      let ok = true;
      for (const [px, py, pr] of placed) if (Math.hypot(px - x, py - y) < pr + r - 2) { ok = false; break; }
      if (!ok) continue;
      placed.push([x, y, r]);
    }
    for (const [x, y, r] of placed) {
      const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
      g.addColorStop(0, '#ff5a73');
      g.addColorStop(0.5, '#d8143a');
      g.addColorStop(1, '#8c0a22');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  freeze(ctx, rnd) {
    ring(ctx, 2, '#5fc2ff');
    ring(ctx, 0.95, radial(ctx, [[0, '#ffffff'], [0.5, '#d6f6ff'], [1, '#8fdcff']], 0.95));
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const [x1, y1] = polar(a, 0.85);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(FR, FR);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      for (const s of [0.35, 0.6]) {
        const [bx, by] = polar(a, s);
        const [cx1, cy1] = polar(a + 0.18, s + 0.15);
        const [cx2, cy2] = polar(a - 0.18, s + 0.15);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx1, cy1);
        ctx.lineTo(bx, by);
        ctx.lineTo(cx2, cy2);
        ctx.stroke();
      }
    }
    void rnd;
  },
  frenzy(ctx, rnd) {
    ring(ctx, 2, '#d5301a');
    ring(ctx, 0.95, radial(ctx, [[0, '#fff7b0'], [0.35, '#ffd23a'], [0.7, '#ff8a1f'], [1, '#ff4a16']], 0.95));
    ctx.strokeStyle = 'rgba(160,20,10,0.55)';
    for (let i = 0; i < 18; i++) {
      let a = rnd() * Math.PI * 2, s = 0.3 + rnd() * 0.2;
      ctx.lineWidth = 2 + rnd() * 2;
      ctx.beginPath();
      ctx.moveTo(...polar(a, s));
      for (let k = 0; k < 4; k++) {
        a += (rnd() - 0.5) * 0.4;
        s += 0.12;
        ctx.lineTo(...polar(a, s));
      }
      ctx.stroke();
    }
  },
  double(ctx, rnd) {
    ring(ctx, 2, '#c88a10');
    ring(ctx, 0.95, radial(ctx, [[0, '#fffbe0'], [0.4, '#ffe07a'], [0.8, '#ffc12e'], [1, '#e6a01a']], 0.95));
    for (let i = 0; i < 40; i++) {
      const [x, y] = polar(rnd() * Math.PI * 2, Math.sqrt(rnd()) * 0.85);
      const r = 3 + rnd() * 6;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r * 0.25, y - r * 0.25);
      ctx.lineTo(x + r, y);
      ctx.lineTo(x + r * 0.25, y + r * 0.25);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - r * 0.25, y + r * 0.25);
      ctx.lineTo(x - r, y);
      ctx.lineTo(x - r * 0.25, y - r * 0.25);
      ctx.fill();
    }
  },
};

/** Cartesian flesh image (for previews) */
export function paintFleshCartesian(kind: string): HTMLCanvasElement {
  const [c, ctx] = canvas(FS, FS);
  const rnd = mulberry32(kind.charCodeAt(0) * 131 + kind.length);
  (FLESH[kind] ?? FLESH.apple)(ctx, rnd, (s) => s * FR);
  return c;
}

/** Polar-resampled flesh texture (u = angle, v = radius, v=1 at rim). */
export function paintFleshPolar(kind: string): THREE.CanvasTexture {
  const src = paintFleshCartesian(kind);
  const sctx = src.getContext('2d')!;
  const sd = sctx.getImageData(0, 0, FS, FS).data;
  const PW = 512, PH = 256;
  const [c, ctx] = canvas(PW, PH);
  const img = ctx.createImageData(PW, PH);
  const out = img.data;
  for (let py = 0; py < PH; py++) {
    const s = 1 - (py + 0.5) / PH; // top row = rim (flipY)
    for (let px = 0; px < PW; px++) {
      const a = ((px + 0.5) / PW) * Math.PI * 2;
      const fx = FR + Math.cos(a) * s * (FR - 1.5) - 0.5;
      const fy = FR + Math.sin(a) * s * (FR - 1.5) - 0.5;
      const x0 = Math.max(0, Math.min(FS - 2, Math.floor(fx)));
      const y0 = Math.max(0, Math.min(FS - 2, Math.floor(fy)));
      const tx = fx - x0, ty = fy - y0;
      const i00 = (y0 * FS + x0) * 4, i10 = i00 + 4, i01 = i00 + FS * 4, i11 = i01 + 4;
      const o = (py * PW + px) * 4;
      for (let k = 0; k < 3; k++) {
        const top = sd[i00 + k] + (sd[i10 + k] - sd[i00 + k]) * tx;
        const bot = sd[i01 + k] + (sd[i11 + k] - sd[i01 + k]) * tx;
        out[o + k] = top + (bot - top) * ty;
      }
      out[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = toTexture(c, true, true);
  return t;
}

/** Soft radial glow sprite (white; tint with SpriteMaterial.color). */
export function paintGlow(): THREE.CanvasTexture {
  const [c, ctx] = canvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return toTexture(c, true, false);
}

/** Bomb shell: near-black with a red equator band and a skull mark front & back. */
export function paintBomb(): THREE.CanvasTexture {
  const W = 512, H = 256;
  const [c, ctx] = canvas(W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#2a2d34');
  g.addColorStop(0.5, '#1c1e24');
  g.addColorStop(1, '#141519');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const rnd = mulberry32(99);
  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.02 + rnd() * 0.03})`;
    ctx.fillRect(rnd() * W, rnd() * H, 2, 2);
  }
  // red danger band (just below equator so the skull sits above it)
  ctx.fillStyle = '#d42a2a';
  ctx.fillRect(0, H * 0.62, W, H * 0.07);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, H * 0.685, W, H * 0.008);
  // rivets on the band
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = '#7a1414';
    ctx.beginPath();
    ctx.arc((i + 0.5) * (W / 16), H * 0.655, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // skulls at u = 0.25 (+z) and 0.75 (-z)
  for (const u of [0.25, 0.75]) {
    const x = u * W, y = H * 0.42;
    ctx.fillStyle = '#f2efe6';
    ctx.beginPath();
    ctx.ellipse(x, y, 30, 27, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 17, y + 12, 34, 22);
    ctx.fillStyle = '#1c1e24';
    ctx.beginPath();
    ctx.ellipse(x - 12, y + 2, 9, 10, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 12, y + 2, 9, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y + 12);
    ctx.lineTo(x - 4, y + 19);
    ctx.lineTo(x + 4, y + 19);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(x - 9, y + 25, 3, 9);
    ctx.fillRect(x - 1.5, y + 25, 3, 9);
    ctx.fillRect(x + 6, y + 25, 3, 9);
  }
  return toTexture(c);
}

/** Wooden plank texture (used by the asset demo; handy for the table too). */
export function paintWood(): THREE.CanvasTexture {
  const W = 1024, H = 1024;
  const [c, ctx] = canvas(W, H);
  const rnd = mulberry32(5);
  const planks = 6;
  for (let p = 0; p < planks; p++) {
    const y0 = (p * H) / planks;
    const hue = 24 + rnd() * 6, light = 30 + rnd() * 8;
    ctx.fillStyle = hsl(hue, 45, light);
    ctx.fillRect(0, y0, W, H / planks);
    for (let i = 0; i < 60; i++) {
      ctx.strokeStyle = hsl(hue, 40, light + (rnd() - 0.5) * 12, 0.35);
      ctx.lineWidth = 1 + rnd() * 3;
      const yy = y0 + rnd() * (H / planks);
      ctx.beginPath();
      ctx.moveTo(0, yy);
      for (let x = 0; x <= W; x += 32) ctx.lineTo(x, yy + Math.sin(x * 0.01 + i) * 3);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(20,10,5,0.55)';
    ctx.fillRect(0, y0, W, 3);
  }
  const t = toTexture(c);
  t.wrapT = THREE.RepeatWrapping;
  return t;
}
