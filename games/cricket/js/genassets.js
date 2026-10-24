// Artwork generated with Gemini (scripts/gen-cricket-assets.mjs → assets/gen/*.svg, listed in manifest.json):
// the ball's leather, the bat sticker, team crests and sponsor boards. Missing files just keep the built-in look.
import { svgTexture } from './svg.js';

const BASE = new URL('../assets/gen/', import.meta.url);

/** {name: {svg, w, h}} for every generated file that loads; {} if there are none. */
export async function loadGenerated() {
  try {
    const r = await fetch(new URL('manifest.json', BASE), { cache: 'no-cache' });
    if (!r.ok) return {};
    const { files } = await r.json();
    const out = {};
    await Promise.all(Object.entries(files ?? {}).map(async ([name, f]) => {
      const res = await fetch(new URL(f.file, BASE));
      if (res.ok) out[name] = { svg: await res.text(), w: f.w, h: f.h };
    }));
    return out;
  } catch {
    return {};
  }
}

/** Texture from a generated SVG at `scale` × its own size. */
export const genTexture = (a, scale = 2, opts = {}) => svgTexture(a.svg, a.w * scale, a.h * scale, opts);
