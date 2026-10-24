/** Procedural canvas textures (everything is generated in code). */
import { CanvasTexture, SRGBColorSpace, Texture } from 'three';

export function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export function toTexture(c: HTMLCanvasElement, srgb = true): CanvasTexture {
  const t = new CanvasTexture(c);
  if (srgb) t.colorSpace = SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

const cache = new Map<string, Texture>();
function cached(key: string, make: () => Texture) {
  let t = cache.get(key);
  if (!t) {
    t = make();
    cache.set(key, t);
  }
  return t;
}

/** Soft radial blob (white centre → transparent edge). Used for shadows, puffs, dots. */
export function radialTexture(hardness = 0): Texture {
  return cached(`radial${hardness}`, () => {
    const s = 64;
    const c = makeCanvas(s, s);
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(Math.min(0.95, hardness), 'rgba(255,255,255,1)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, s, s);
    return toTexture(c);
  });
}

/** Crisp round dot with a soft rim (aim arc / grid flow dots). */
export function dotTexture(): Texture {
  return cached('dot', () => {
    const s = 64;
    const c = makeCanvas(s, s);
    const g = c.getContext('2d')!;
    g.beginPath();
    g.arc(s / 2, s / 2, s / 2 - 6, 0, Math.PI * 2);
    g.fillStyle = '#ffffff';
    g.shadowColor = 'rgba(0,0,0,0.35)';
    g.shadowBlur = 5;
    g.fill();
    return toTexture(c);
  });
}

/** Ball finder arrow (screen-space sprite): yellow down arrow with dark outline. */
export function arrowTexture(): Texture {
  return cached('arrow', () => {
    const w = 64;
    const h = 80;
    const c = makeCanvas(w, h);
    const g = c.getContext('2d')!;
    g.beginPath();
    g.moveTo(w / 2, h - 6);
    g.lineTo(6, h * 0.42);
    g.lineTo(w * 0.32, h * 0.42);
    g.lineTo(w * 0.32, 6);
    g.lineTo(w * 0.68, 6);
    g.lineTo(w * 0.68, h * 0.42);
    g.lineTo(w - 6, h * 0.42);
    g.closePath();
    g.lineJoin = 'round';
    g.lineWidth = 7;
    g.strokeStyle = 'rgba(34,48,60,0.85)';
    g.stroke();
    g.fillStyle = '#ffd23d';
    g.fill();
    g.lineWidth = 2.5;
    g.strokeStyle = '#ffffff';
    g.stroke();
    return toTexture(c);
  });
}

/** White ring with soft edges (ripples, cup sparkle). */
export function ringTexture(): Texture {
  return cached('ring', () => {
    const s = 128;
    const c = makeCanvas(s, s);
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(s / 2, s / 2, s * 0.3, s / 2, s / 2, s / 2);
    grd.addColorStop(0, 'rgba(255,255,255,0)');
    grd.addColorStop(0.55, 'rgba(255,255,255,1)');
    grd.addColorStop(0.75, 'rgba(255,255,255,0.8)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, s, s);
    return toTexture(c);
  });
}
