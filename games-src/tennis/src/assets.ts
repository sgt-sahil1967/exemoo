import * as THREE from 'three';

// SVGs produced by scripts/gen-svg.mjs. Any that are missing fall back to procedural drawings.
const urls = import.meta.glob('../assets/svg/*.svg', { query: '?url', import: 'default', eager: true }) as Record<
  string,
  string
>;

export function svgUrl(name: string): string | null {
  return urls[`../assets/svg/${name}.svg`] ?? null;
}

const cache = new Map<string, Promise<HTMLImageElement | null>>();

export function loadSvg(name: string): Promise<HTMLImageElement | null> {
  let p = cache.get(name);
  if (!p) {
    const url = svgUrl(name);
    p = !url
      ? Promise.resolve(null)
      : new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img.naturalWidth > 0 || img.width > 0 ? img : null);
          img.onerror = () => resolve(null);
          img.src = url;
        });
    cache.set(name, p);
  }
  return p;
}

export function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

export function canvasTexture(c: HTMLCanvasElement, srgb = true): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// ---------- Procedural fallbacks ----------

const AD_FALLBACK: [string, string, string][] = [
  ['VOLTA', '#0b0b0b', '#c8ff2e'],
  ['NORDHAVN', '#0f1d3a', '#d8b25a'],
  ['STRATA', '#b3122e', '#ffffff'],
  ['AEROLINE', '#2c8de0', '#ffffff'],
  ['KOVA', '#1d2327', '#2fd3c0'],
  ['SUNSET BAY', '#ff7a3d', '#ffffff'],
];

/** Draw ad board `i` (1-based) into a 1024×128 canvas. */
export async function adCanvas(i: number): Promise<HTMLCanvasElement> {
  const [c, g] = canvas(1024, 128);
  const img = await loadSvg(`ad${i}`);
  if (img) {
    g.drawImage(img, 0, 0, 1024, 128);
    return c;
  }
  const [name, bg, fg] = AD_FALLBACK[(i - 1) % AD_FALLBACK.length];
  const grad = g.createLinearGradient(0, 0, 1024, 0);
  grad.addColorStop(0, bg);
  grad.addColorStop(1, shade(bg, -0.25));
  g.fillStyle = grad;
  g.fillRect(0, 0, 1024, 128);
  g.fillStyle = fg;
  g.font = 'italic 900 78px "Arial Black", Impact, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(name, 512, 68);
  return c;
}

function shade(hex: string, amt: number): string {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, amt);
  return `#${c.getHexString()}`;
}

/** Atlas of 6 white spectator silhouettes, each 128×160. */
export async function crowdAtlas(): Promise<HTMLCanvasElement> {
  const [c, g] = canvas(128 * 6, 160);
  for (let i = 0; i < 6; i++) {
    const img = await loadSvg(`crowd${i + 1}`);
    g.save();
    g.translate(i * 128, 0);
    if (img) {
      g.drawImage(img, 0, 0, 128, 160);
      // Force pure white silhouette regardless of the SVG's colours.
      g.globalCompositeOperation = 'source-in';
      g.fillStyle = '#fff';
      g.fillRect(0, 0, 128, 160);
    } else {
      drawSpectator(g, i);
    }
    g.restore();
  }
  return c;
}

function drawSpectator(g: CanvasRenderingContext2D, pose: number) {
  g.fillStyle = '#fff';
  // torso
  g.beginPath();
  g.moveTo(22, 160);
  g.quadraticCurveTo(20, 92, 46, 84);
  g.lineTo(82, 84);
  g.quadraticCurveTo(108, 92, 106, 160);
  g.closePath();
  g.fill();
  // neck + head
  g.fillRect(56, 66, 16, 22);
  g.beginPath();
  g.ellipse(64, 52, 19, 23, 0, 0, Math.PI * 2);
  g.fill();
  g.lineCap = 'round';
  g.strokeStyle = '#fff';
  g.lineWidth = 15;
  const arm = (x0: number, y0: number, x1: number, y1: number, x2: number, y2: number) => {
    g.beginPath();
    g.moveTo(x0, y0);
    g.quadraticCurveTo(x1, y1, x2, y2);
    g.stroke();
  };
  if (pose === 1) {
    arm(34, 96, 18, 50, 26, 8);
    arm(94, 96, 110, 50, 102, 8);
  } else if (pose === 2) {
    arm(94, 96, 116, 56, 108, 14);
    g.fillRect(40, 26, 48, 9); // cap brim
  } else if (pose === 3) {
    arm(34, 96, 40, 128, 60, 112);
    arm(94, 96, 88, 128, 68, 112);
    g.beginPath();
    g.ellipse(64, 60, 25, 30, 0, 0, Math.PI * 2);
    g.fill();
  } else if (pose === 4) {
    g.beginPath();
    g.ellipse(64, 36, 40, 8, 0, 0, Math.PI * 2);
    g.fill();
  } else if (pose === 5) {
    arm(94, 96, 112, 70, 112, 30);
    g.fillRect(112, 22, 4, 40);
    g.fillRect(114, 22, 14, 14);
  }
}

/** Radial glow sprite texture. */
export function glowTexture(size = 128, inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)'): THREE.Texture {
  const [c, g] = canvas(size, size);
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.25, inner.replace(/[\d.]+\)$/, '0.55)'));
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return canvasTexture(c);
}

/** Tileable grain texture used to give the court surface texture. */
export function grainTexture(size = 512, contrast = 0.08, speck = 0.04): THREE.CanvasTexture {
  const [c, g] = canvas(size, size);
  const img = g.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    let v = 1 - Math.random() * contrast;
    if (Math.random() < speck) v -= 0.06 + Math.random() * 0.05;
    const b = Math.max(0, Math.min(255, Math.round(v * 255)));
    img.data[i * 4] = b;
    img.data[i * 4 + 1] = b;
    img.data[i * 4 + 2] = b;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = canvasTexture(c, false);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
