// Offline sound renderer: no network, no external assets.
// Every sound is a hand-authored synth recipe (scripts/sound-recipes.mjs). This script
// writes the recipes to public/sounds/recipes/*.json and renders them to public/sounds/*.wav.
//
// Usage:
//   node scripts/gen-sounds.mjs            write recipes from sound-recipes.mjs, render all
//   node scripts/gen-sounds.mjs pass splat render just these
//   node scripts/gen-sounds.mjs --render   re-render from the saved JSON (keeps hand edits)
//
// Recipe schema:
// { duration, gain (0..1), loop?: bool (fold tails back to the start for seamless looping),
//   layers: [{ wave: sine|square|saw|triangle|noise, start, dur, freq: [from, to] (exp sweep),
//              notes?: [{ t, f, f2?, d, v? }], env: { a, d, s, r }, gain, duty?,
//              vibrato?: { rate, depth (semitones) }, fm?: { ratio, index, decay } (sine only),
//              filter?: { type: lowpass|highpass|bandpass, freq: [from, to], q }, drive? }],
//   echo?: { delay, feedback, mix }, reverb?: { mix, size } }
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RECIPES } from './sound-recipes.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public/sounds');
const recipeDir = join(outDir, 'recipes');
mkdirSync(recipeDir, { recursive: true });
const SR = 44100;

// ---------------------------------------------------------------- wav

function writeWav(path, samples, rate) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + samples.length * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), 44 + i * 2);
  }
  writeFileSync(path, buf);
}

// ---------------------------------------------------------------- synth

const num = (v, d, lo = -Infinity, hi = Infinity) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d;
};

function envAt(t, len, env) {
  const a = num(env?.a, 0.005, 0.0005, 5), d = num(env?.d, 0.1, 0, 5);
  const s = num(env?.s, 0.6, 0, 1), r = num(env?.r, 0.1, 0.002, 5);
  if (t < 0) return 0;
  let v;
  if (t < a) v = t / a;
  else if (t < a + d) v = 1 - (1 - s) * ((t - a) / d);
  else v = s;
  // Release starts from wherever the envelope is when the note ends.
  if (t > len) v = envAt(len, len + 1, env) * Math.max(0, 1 - (t - len) / r);
  return v;
}

function makeBiquad() {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, b0 = 1, b1 = 0, b2 = 0, a1 = 0, a2 = 0;
  return {
    set(type, f, q) {
      const w = (2 * Math.PI * Math.min(f, SR * 0.45)) / SR, cs = Math.cos(w), al = Math.sin(w) / (2 * q);
      let n0, n1, n2;
      if (type === 'highpass') { n0 = (1 + cs) / 2; n1 = -(1 + cs); n2 = (1 + cs) / 2; }
      else if (type === 'bandpass') { n0 = al; n1 = 0; n2 = -al; }
      else { n0 = (1 - cs) / 2; n1 = 1 - cs; n2 = (1 - cs) / 2; }
      const a0 = 1 + al;
      b0 = n0 / a0; b1 = n1 / a0; b2 = n2 / a0; a1 = (-2 * cs) / a0; a2 = (1 - al) / a0;
    },
    run(x) {
      const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y;
      return y;
    },
  };
}

// Band-limited-ish oscillators (polyBLEP) so square/saw don't alias harshly.
function blep(t, dt) {
  if (t < dt) { t /= dt; return t + t - t * t - 1; }
  if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; }
  return 0;
}

function osc(wave, p, dt, duty) {
  switch (wave) {
    case 'square': {
      let x = p < duty ? 1 : -1;
      x += blep(p, dt);
      x -= blep((p + 1 - duty) % 1, dt);
      return x;
    }
    case 'saw': return 2 * p - 1 - blep(p, dt);
    case 'triangle': return 1 - 4 * Math.abs(p - 0.5);
    case 'noise': return Math.random() * 2 - 1;
    default: return Math.sin(2 * Math.PI * p);
  }
}

/** Render one voice (a layer or a single note) additively into `out`. */
function renderVoice(out, L, startT, len, f0, f1, vel) {
  const r = num(L.env?.r, 0.1, 0.002, 5);
  const i0 = Math.floor(startT * SR);
  const n = Math.min(Math.floor((len + r) * SR), out.length - i0);
  if (n <= 0 || i0 < 0) return;
  const wave = ['sine', 'square', 'saw', 'triangle', 'noise'].includes(L.wave) ? L.wave : 'sine';
  const duty = num(L.duty, 0.5, 0.05, 0.5);
  const vib = L.vibrato ? { rate: num(L.vibrato.rate, 5, 0, 30), depth: num(L.vibrato.depth, 0, 0, 12) } : null;
  const fm = L.fm && wave === 'sine'
    ? { ratio: num(L.fm.ratio, 2, 0.1, 16), index: num(L.fm.index, 1, 0, 20), decay: num(L.fm.decay, 1, 0.001, 10) }
    : null;
  const drive = num(L.drive, 0, 0, 1);
  const g = num(L.gain, 0.5, 0, 1) * vel;
  const filt = L.filter ? makeBiquad() : null;
  const ff0 = num(L.filter?.freq?.[0], 1000, 20, 20000), ff1 = num(L.filter?.freq?.[1], ff0, 20, 20000);
  const fq = num(L.filter?.q, 0.8, 0.1, 30);
  let phase = Math.random(), mphase = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const u = Math.min(1, t / Math.max(len, 1e-4));
    let f = f0 * Math.pow(f1 / f0, u);
    if (vib) f *= Math.pow(2, (vib.depth / 12) * Math.sin(2 * Math.PI * vib.rate * t));
    phase += f / SR;
    phase -= Math.floor(phase);
    let x;
    if (fm) {
      mphase += (f * fm.ratio) / SR;
      const idx = fm.index * Math.exp(-t / fm.decay);
      x = Math.sin(2 * Math.PI * phase + idx * Math.sin(2 * Math.PI * mphase));
    } else {
      x = osc(wave, phase, f / SR, duty);
    }
    if (filt) {
      if ((k & 31) === 0) filt.set(L.filter.type, ff0 * Math.pow(ff1 / ff0, u), fq);
      x = filt.run(x);
    }
    if (drive > 0) x = Math.tanh(x * (1 + drive * 6)) / Math.tanh(1 + drive * 6);
    out[i0 + k] += x * g * envAt(t, len, L.env);
  }
}

/** Small Schroeder reverb: 4 damped combs into 2 allpasses. */
function reverb(buf, mix, size) {
  const combs = [1116, 1188, 1277, 1356].map((d) => ({ d: Math.round(d * (0.6 + size * 0.8)), b: null, i: 0, lp: 0 }));
  const aps = [556, 441].map((d) => ({ d, b: new Float32Array(d), i: 0 }));
  const fb = 0.7 + size * 0.26, damp = 0.3;
  for (const c of combs) c.b = new Float32Array(c.d);
  const wet = new Float32Array(buf.length);
  for (let n = 0; n < buf.length; n++) {
    const x = buf[n] * 0.25;
    let y = 0;
    for (const c of combs) {
      const o = c.b[c.i];
      c.lp = o * (1 - damp) + c.lp * damp;
      c.b[c.i] = x + c.lp * fb;
      c.i = (c.i + 1) % c.d;
      y += o;
    }
    for (const a of aps) {
      const o = a.b[a.i];
      a.b[a.i] = y + o * 0.5;
      a.i = (a.i + 1) % a.d;
      y = o - y * 0.5;
    }
    wet[n] = y;
  }
  for (let n = 0; n < buf.length; n++) buf[n] = buf[n] * (1 - mix * 0.5) + wet[n] * mix;
}

function renderRecipe(recipe) {
  const dur = num(recipe.duration, 1, 0.03, 30);
  const loop = !!recipe.loop;
  const tail = loop || recipe.reverb || recipe.echo ? 3 : 0;
  const total = Math.ceil(dur * SR);
  let out = new Float32Array(total + Math.ceil(tail * SR));
  for (const L of (recipe.layers || []).slice(0, 10)) {
    const start = num(L.start, 0, 0, dur);
    if (Array.isArray(L.notes) && L.notes.length) {
      for (const nt of L.notes.slice(0, 600)) {
        const f = num(nt.f, 440, 20, 18000);
        renderVoice(out, L, start + num(nt.t, 0, 0, dur), num(nt.d, 0.1, 0.005, dur), f, num(nt.f2, f, 20, 18000), num(nt.v, 1, 0, 1));
      }
    } else {
      const f0 = num(L.freq?.[0], 440, 20, 18000);
      renderVoice(out, L, start, num(L.dur, dur - start, 0.005, dur), f0, num(L.freq?.[1], f0, 20, 18000), 1);
    }
  }
  if (recipe.echo) {
    const d = Math.floor(num(recipe.echo.delay, 0.2, 0.01, 1) * SR);
    const fb = num(recipe.echo.feedback, 0.3, 0, 0.85), mix = num(recipe.echo.mix, 0.25, 0, 1);
    const wet = new Float32Array(out.length);
    for (let i = d; i < out.length; i++) wet[i] = out[i - d] + wet[i - d] * fb;
    for (let i = 0; i < out.length; i++) out[i] += wet[i] * mix;
  }
  if (recipe.reverb) reverb(out, num(recipe.reverb.mix, 0.2, 0, 1), num(recipe.reverb.size, 0.5, 0, 1));
  if (loop) {
    // Fold everything past the loop point back onto the start: seamless when looped.
    for (let i = total; i < out.length; i++) out[i % total] += out[i];
    out = out.subarray(0, total);
  } else {
    // Trim the tail to the last audible sample (keeps reverb/echo decays, drops silence).
    let pk = 1e-9;
    for (let i = 0; i < out.length; i++) pk = Math.max(pk, Math.abs(out[i]));
    let end = out.length;
    while (end > total && Math.abs(out[end - 1]) < pk * 0.004) end--;
    out = out.subarray(0, end);
  }
  // DC block + normalise to the recipe's gain.
  let prevX = 0, prevY = 0, peak = 1e-6;
  for (let i = 0; i < out.length; i++) {
    const y = out[i] - prevX + 0.995 * prevY;
    prevX = out[i]; prevY = y; out[i] = y;
    peak = Math.max(peak, Math.abs(y));
  }
  const target = 0.9 * num(recipe.gain, 0.8, 0.1, 1);
  for (let i = 0; i < out.length; i++) out[i] *= target / peak;
  if (!loop) {
    const fade = Math.min(out.length, Math.floor(SR * 0.01));
    for (let i = 0; i < fade; i++) out[out.length - 1 - i] *= i / fade;
  }
  return out;
}

function render(name, recipe) {
  const samples = renderRecipe(recipe);
  writeWav(join(outDir, `${name}.wav`), samples, SR);
  console.log(`ok   ${name} (${(samples.length / SR).toFixed(2)}s)`);
}

// ---------------------------------------------------------------- main

const args = process.argv.slice(2);
if (args.includes('--render')) {
  for (const f of readdirSync(recipeDir).filter((f) => f.endsWith('.json'))) {
    render(f.replace(/\.json$/, ''), JSON.parse(readFileSync(join(recipeDir, f), 'utf8')));
  }
} else {
  const names = Object.keys(RECIPES).filter((n) => !args.length || args.includes(n));
  for (const name of names) {
    writeFileSync(join(recipeDir, `${name}.json`), JSON.stringify(RECIPES[name], null, 2));
    render(name, RECIPES[name]);
  }
}

// Voice callouts use the browser's speech synthesis, so drop any old voice clips.
for (const f of readdirSync(outDir).filter((f) => /^v_.*\.wav$/.test(f))) rmSync(join(outDir, f));

const files = readdirSync(outDir).filter((f) => f.endsWith('.wav')).map((f) => f.replace(/\.wav$/, ''));
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(files.sort(), null, 2));
console.log(`manifest: ${files.length} sounds`);
