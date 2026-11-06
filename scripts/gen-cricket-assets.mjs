#!/usr/bin/env node
/**
 * Generate cricket artwork with Gemini (SVG), for things no free asset pack provides.
 *
 *   node scripts/gen-cricket-assets.mjs            generate any missing files
 *   node scripts/gen-cricket-assets.mjs --force    regenerate everything
 *
 * Reads GEMINI_API_KEY from ../.env (the parent folder) or the environment. Always uses gemini-3.8-flash
 * (the project's chosen model for artwork; GEMINI_MODEL in .env is ignored here).
 * Writes games/cricket/assets/gen/<name>.svg and manifest.json. Every SVG is checked: it must be a single
 * <svg> document with no scripts, event handlers or external references; rejected output is retried.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'games', 'cricket', 'assets', 'gen');
const force = process.argv.includes('--force');

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}
loadEnv(path.join(root, '..', '.env'));
loadEnv(path.join(root, '.env'));
const KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3.8-flash';
if (!KEY) {
  console.error('GEMINI_API_KEY is not set (../.env or environment).');
  process.exit(1);
}

const STYLE = 'Bold, clean, modern sports-broadcast style with flat colours and crisp shapes; no photos, no gradients that look muddy.';
const ASSETS = [
  { name: 'ball', w: 1024, h: 512, prompt: `An equirectangular texture for a red leather cricket ball (it wraps a sphere): deep cherry red leather with subtle grain and slight scuffs, one raised white-and-cream stitched seam running around the equator (the horizontal middle of the image) made of two rows of small slanted stitches, plus two fainter quarter seams. Fill the whole canvas. ${STYLE}` },
  { name: 'bat-sticker', w: 256, h: 512, prompt: 'A cricket bat blade face sticker, portrait: brand name "MOO WILLOW" stacked vertically in bold capitals, a stylised cow-horn logo, blue (#2f7cff) and yellow (#ffd21f) panels with a dark navy (#1b1b3a) outline, on a transparent background (no full-canvas rectangle).' },
  { name: 'crest-blue', w: 256, h: 256, prompt: `A cricket team crest for "MOO MOO XI": shield shape, royal blue (#2f7cff) with yellow (#ffd21f) trim, crossed bats and a ball, a small cow head, text "MOO" on a ribbon. Transparent background outside the shield. ${STYLE}` },
  { name: 'crest-yellow', w: 256, h: 256, prompt: `A cricket team crest for "FARMYARD CC": round badge, golden yellow (#ffd21f) with red (#ff3b30) trim, a stylised rooster over three stumps, text "FARMYARD" around the edge. Transparent background outside the badge. ${STYLE}` },
  ...[['MOO MOO STAND', '#2f7cff'], ['EXEMOO PAVILION', '#ff3b30'], ['FARMYARD END', '#2fc65a'], ['BARN STAND', '#ffd21f']].map(([stand, col], i) => ({
    name: `fascia-${i + 1}`, w: 2048, h: 128,
    prompt: `A long horizontal stadium stand fascia banner (2048x128) that will tile seamlessly left-to-right: the stand name "${stand}" in big bold white capitals with a dark outline, centred, flanked by cricket motifs (stumps, crossed bats, a ball) and small stars, on a ${col} background with a thin lighter stripe along the top and bottom edges. Both left and right edges must match so it tiles. ${STYLE}`,
  })),
  ...['MOO WILLOW BATS', 'GRASSFED SPORTS DRINK', 'HAYSTACK BANK', 'PASTURE AIRWAYS', 'SIXER SNACKS', 'CLOVER MOBILE'].map((brand, i) => ({
    name: `board-${i + 1}`, w: 1024, h: 128,
    prompt: `A wide perimeter advertising board for a cricket ground (1024x128): fictional brand "${brand}", a simple bold logo mark on the left, the brand name large in the middle, a short tagline smaller, strong contrasting colours, a 6px dark outline around the board. Text must stay inside the board. ${STYLE}`,
  })),
];

function check(svg, a) {
  const m = /<svg[\s\S]*<\/svg>/i.exec(svg);
  if (!m) return { error: 'no <svg> element' };
  const s = m[0];
  if (/<script|\son\w+\s*=|javascript:|<foreignObject/i.test(s)) return { error: 'scripts or event handlers' };
  if (/(?:href|src)\s*=\s*["'](?!#|data:image\/)/i.test(s)) return { error: 'external reference' };
  if (s.length > 400_000) return { error: 'too large' };
  let out = s;
  if (!/viewBox=/i.test(out)) out = out.replace(/<svg/i, `<svg viewBox="0 0 ${a.w} ${a.h}"`);
  out = out.replace(/<svg([^>]*)>/i, (all, attrs) => `<svg${attrs.replace(/\s(width|height)="[^"]*"/gi, '')} width="${a.w}" height="${a.h}">`);
  if (!/xmlns=/.test(out)) out = out.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  return { svg: out };
}

async function generate(a) {
  const body = {
    contents: [{ role: 'user', parts: [{ text: `${a.prompt}\n\nReturn ONLY one complete, valid SVG document (no markdown fences, no commentary). Canvas: width="${a.w}" height="${a.h}" viewBox="0 0 ${a.w} ${a.h}". Use only basic SVG elements (path, rect, circle, ellipse, polygon, text, g, defs, linearGradient, radialGradient, clipPath). No scripts, no images, no external fonts or links; use font-family="Arial Black, Arial, sans-serif".` }] }],
    generationConfig: { temperature: 0.8 },
  };
  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error(`  ${a.name}: HTTP ${r.status} ${t.slice(0, 200)}`);
      if (r.status === 429 || r.status >= 500) { await new Promise((res) => setTimeout(res, 4000 * attempt)); continue; }
      return null;
    }
    const j = await r.json();
    const text = (j.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('');
    const res = check(text, a);
    if (res.svg) return res.svg;
    console.error(`  ${a.name}: rejected (${res.error}), attempt ${attempt}`);
  }
  return null;
}

fs.mkdirSync(outDir, { recursive: true });
const manifest = { model: MODEL, generatedAt: new Date().toISOString(), files: {} };
const manifestPath = path.join(outDir, 'manifest.json');
if (fs.existsSync(manifestPath)) Object.assign(manifest.files, JSON.parse(fs.readFileSync(manifestPath, 'utf8')).files ?? {});
for (const a of ASSETS) {
  const file = path.join(outDir, `${a.name}.svg`);
  if (!force && fs.existsSync(file)) { console.log(`skip ${a.name} (exists)`); continue; }
  console.log(`generating ${a.name} with ${MODEL}...`);
  const svg = await generate(a);
  if (!svg) { console.error(`FAILED ${a.name}`); continue; }
  fs.writeFileSync(file, svg);
  manifest.files[a.name] = { file: `${a.name}.svg`, w: a.w, h: a.h };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`ok ${a.name} (${svg.length} bytes)`);
}
console.log('done');
