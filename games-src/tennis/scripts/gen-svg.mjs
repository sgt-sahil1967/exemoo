// Dev-time asset generator: asks Gemini for SVGs and writes them to assets/svg/.
// Usage: node scripts/gen-svg.mjs [name ...]   (no args = generate all missing)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'assets/svg');

function loadEnv() {
  const env = {};
  for (const p of [join(root, '.env'), join(root, '../.env')]) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

const env = loadEnv();
const KEY = env.GEMINI_API_KEY;
// GEMINI_SVG_MODEL overrides GEMINI_MODEL (e.g. when the pro model has no free-tier quota).
const MODEL = process.env.GEMINI_SVG_MODEL || env.GEMINI_MODEL || 'gemini-3.1-pro-preview';
if (!KEY) throw new Error('GEMINI_API_KEY missing from .env');

const STYLE = `Return ONLY one complete, valid standalone SVG document (xmlns attribute included), no markdown fences, no commentary.
Use clean vector shapes, gradients are welcome, no <image>, no external fonts or links, no scripts. Fonts: use font-family="Arial Black, Impact, sans-serif" when text is needed.`;

const crowd = (i, pose) => ({
  name: `crowd${i}`,
  prompt: `A single seated stadium spectator seen from the front, upper body only (head, shoulders, torso, arms), ${pose}.
viewBox="0 0 128 160". Pure solid white (#ffffff) silhouette fill only, transparent background, no outlines, no other colours.
The figure should fill the frame width-wise ~70% and touch the bottom edge. Natural human proportions, smooth curves.`,
});

const ad = (i, brand, desc) => ({
  name: `ad${i}`,
  prompt: `A wide stadium advertising board banner for a FICTIONAL brand named "${brand}" (${desc}).
viewBox="0 0 1024 128". Full-bleed background, bold modern sports branding, large legible wordmark text "${brand}", a simple original logo mark, high contrast so it reads from far away on an LED board.`,
});

const ASSETS = [
  {
    name: 'logo',
    prompt: `A sporty logo wordmark for a fictional tennis video game named "COURT ACE".
viewBox="0 0 640 160". Transparent background. Italic heavy text: "COURT" in white, "ACE" in electric lime (#c8ff2e), plus a small stylised tennis ball mark with motion streaks to the left. Slight dark drop shadow.`,
  },
  ad(1, 'VOLTA', 'energy drink, black and electric lime'),
  ad(2, 'NORDHAVN', 'luxury watches, deep navy and gold'),
  ad(3, 'STRATA', 'sports apparel, white on crimson'),
  ad(4, 'AEROLINE', 'airline, sky blue gradient with white'),
  ad(5, 'KOVA', 'electric cars, graphite and teal'),
  ad(6, 'SUNSET BAY', 'island resort, orange to pink gradient'),
  crowd(1, 'sitting relaxed, arms down'),
  crowd(2, 'both arms raised up cheering'),
  crowd(3, 'wearing a cap, one arm raised waving'),
  crowd(4, 'long hair, hands clapping in front of chest'),
  crowd(5, 'wearing a wide sun hat, sitting'),
  crowd(6, 'leaning forward, holding a small flag'),
  {
    name: 'thumb-midnight',
    prompt: `A stylised illustration thumbnail of a night-time tennis arena seen from high behind the baseline: blue hard court with white lines, net, dark stands, bright floodlights with glow, dark navy sky.
viewBox="0 0 320 180". Rich, moody, premium.`,
  },
  {
    name: 'thumb-riviera',
    prompt: `A stylised illustration thumbnail of a daylight island tennis court seen from high behind the baseline: teal-blue court with white lines and net, white stands, turquoise sea around, bright sky with soft clouds, a palm tree.
viewBox="0 0 320 180". Bright, sunny, premium.`,
  },
  { name: 'icon-ball', prompt: `A minimal flat icon of a tennis ball, lime (#c8ff2e) with white seam curves. viewBox="0 0 64 64". Transparent background.` },
  { name: 'icon-racket', prompt: `A minimal flat icon of a tennis racket at a 45° angle, white outline strokes (stroke-width 4, no fill except strings as thin lines). viewBox="0 0 64 64". Transparent background.` },
  { name: 'icon-trophy', prompt: `A minimal flat icon of a trophy cup, gold gradient. viewBox="0 0 64 64". Transparent background.` },
  { name: 'icon-sound', prompt: `A minimal flat speaker-with-sound-waves icon, white strokes stroke-width 4, round caps. viewBox="0 0 64 64". Transparent background.` },
];

async function generate(asset) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `${asset.prompt}\n\n${STYLE}` }] }],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const json = await res.json();
      const text = (json.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('');
      const m = text.match(/<svg[\s\S]*<\/svg>/i);
      if (!m) throw new Error('no <svg> in response');
      let svg = m[0];
      if (!/xmlns=/.test(svg)) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      if (/<script|<image|href="http/i.test(svg)) throw new Error('disallowed content');
      writeFileSync(join(outDir, `${asset.name}.svg`), svg);
      console.log(`ok   ${asset.name} (${svg.length} bytes)`);
      return;
    } catch (e) {
      console.warn(`fail ${asset.name} attempt ${attempt}: ${e.message.slice(0, 60)}`);
      // Back off on rate limits / overload.
      if (/HTTP (429|503)/.test(e.message)) await new Promise((r) => setTimeout(r, 15000 * attempt));
    }
  }
}

const only = process.argv.slice(2);
const todo = ASSETS.filter((a) =>
  only.length ? only.includes(a.name) : !existsSync(join(outDir, `${a.name}.svg`)),
);
const queue = [...todo];
await Promise.all(
  Array.from({ length: Number(process.env.GEN_CONCURRENCY || 1) }, async () => {
    while (queue.length) await generate(queue.shift());
  }),
);
console.log('done');
