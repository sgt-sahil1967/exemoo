#!/usr/bin/env node
/**
 * Generate Rapids Row audio with Gemini.
 *
 * The model is text-only, so Gemini writes a strict JSON "synth recipe" for each sound (layers of oscillators /
 * noise with pitch + amp envelopes and filters, or a step-sequencer tune for music). This script validates the
 * recipe, renders it offline to 16-bit mono WAV and records everything in assets/audio/.
 *
 *   node scripts/gen-rapids-audio.mjs                    generate any missing sounds
 *   node scripts/gen-rapids-audio.mjs --force            regenerate everything
 *   node scripts/gen-rapids-audio.mjs coin beep --force  regenerate just those
 *
 * Reads GEMINI_API_KEY and GEMINI_MODEL from ../.env (parent folder) or the environment.
 * Writes games/rapids-row/assets/audio/<name>.wav, recipes/<name>.json (raw Gemini output) and manifest.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'games', 'rapids-row', 'assets', 'audio');
const recipeDir = path.join(outDir, 'recipes');
const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.filter((a) => !a.startsWith('--'));

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
// Only GEMINI_MODEL (.env) is used. --allow-fallback also tries the Flash models below when the key has no quota
// for it; the manifest records the model actually used for each file.
const MODELS = [...new Set([process.env.GEMINI_MODEL || 'gemini-3.1-pro-preview', ...(process.argv.includes('--allow-fallback') ? ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.6-flash'] : [])])];
let modelIdx = 0;
const MODEL = MODELS[0];
if (!KEY) {
  console.error('GEMINI_API_KEY is not set (../.env or environment).');
  process.exit(1);
}

const SR = 22050;
const CONCURRENCY = 4;
const XFADE = 0.5; // seconds of tail crossfaded into the head of ambience loops

// ---------------------------------------------------------------------------------------------------------------
// Sound list: brief for Gemini + render settings. peak = normalised peak (linear), loop = 'xfade' | 'wrap' | null.
// ---------------------------------------------------------------------------------------------------------------
const SOUNDS = [
  { name: 'splash_1', dur: [0.25, 0.5], peak: 0.89, brief: 'A paddle blade dipping into river water: a short wet splash, ~0.35 s. Bandpassed/lowpassed noise burst with a quick attack and fast decay, a faint low "bloop" sine with falling pitch. Variant 1: medium, soft.' },
  { name: 'splash_2', dur: [0.25, 0.5], peak: 0.89, brief: 'A paddle blade dipping into river water, ~0.35 s. Variant 2: slightly brighter and sharper splash, more high-frequency fizz, quicker bloop.' },
  { name: 'splash_3', dur: [0.25, 0.5], peak: 0.89, brief: 'A paddle blade dipping into river water, ~0.4 s. Variant 3: deeper, heavier splash with a lower bloop and a bit more body.' },
  { name: 'rock_hit', dur: [0.3, 0.9], peak: 0.95, brief: 'A canoe smacking into a rock: a heavy low thud (sine with fast pitch drop from ~140 Hz to 45 Hz) plus a sharp noisy crack on top (highpass noise, very short), and a little rumble tail. ~0.5 s.' },
  { name: 'log_hit', dur: [0.3, 0.9], peak: 0.92, brief: 'A canoe bonking a floating log: a hollow wooden "bonk" - two sine/triangle partials around 180 Hz and 320 Hz with fast decay and a slight pitch drop, plus a tiny woody click of bandpassed noise. ~0.45 s.' },
  { name: 'bank_scrape', dur: [0.4, 0.9], peak: 0.85, brief: 'A canoe hull scraping gritty mud and gravel on the river bank, ~0.6 s: bandpassed brown/white noise with a swell, some amplitude tremolo (~30-50 Hz) for grit, cutoff drifting downward.' },
  { name: 'coin', dur: [0.2, 0.7], peak: 0.89, brief: 'A bright cartoon coin pickup chime: two quick sparkly notes (e.g. B5 then E6, ~988 Hz then ~1319 Hz) with triangle/sine tones, short ring-out, ~0.35 s total.' },
  { name: 'checkpoint', dur: [0.5, 1.2], peak: 0.89, brief: 'A happy 3-note rising major arpeggio (C5, E5, G5 then optionally a high C6 sparkle) as a checkpoint passed jingle, soft square/triangle plucks with short decays, ~0.8 s total.' },
  { name: 'beep', dur: [0.15, 0.4], peak: 0.89, brief: 'A single race-countdown beep: clean tone at ~440 Hz (sine + a little square), quick attack, ~0.25 s, slight release so there is no click.' },
  { name: 'go', dur: [0.4, 0.9], peak: 0.92, brief: 'The race START "GO!" signal: a higher (~880 Hz) and longer (~0.6 s) beep/horn than the countdown beep, saw+square layered, with a slight rise at the start and gentle release.' },
  { name: 'finish', dur: [2.0, 3.2], peak: 0.92, brief: 'A victorious cartoon fanfare, ~2.5 s: brass-like saw lead playing a triumphant rising phrase (e.g. C-E-G-C then a held high chord) with lowpass filter, bass notes underneath, optional cymbal-ish noise shimmer at the end.' },
  { name: 'cheer', dur: [1.5, 2.6], peak: 0.85, brief: 'A crowd cheering, ~2 s, noise-based: several bandpassed noise layers (formants around 500-900 Hz and 1500-2500 Hz) with a swelling then falling amplitude, tremolo/wobble ~6-9 Hz, maybe a couple of high squeaky sine "whoop" glides on top.' },
  { name: 'moo', dur: [1.0, 1.5], peak: 0.9, brief: 'A cartoon cow "mooooo", ~1.2 s: sawtooth around 150-200 Hz that glides up slightly then drops in pitch (end ~110 Hz), with vibrato, run through bandpass/lowpass "formant" filters (use 2-3 saw layers at the same pitch with bandpass cutoffs around 500, 900 and 2200 Hz, Q 3-6) and a little breathy noise.' },
  { name: 'river_loop', dur: [5.5, 6.5], peak: 0.35, loop: 'xfade', brief: 'A gentle flowing river ambience, exactly ~6 s, to loop seamlessly: layers of pink and brown noise filtered with lowpass/bandpass at slowly drifting cutoffs (a low murmur around 300-600 Hz and a soft babble around 1500-3000 Hz), with slow tremolo (0.2-0.8 Hz, small depth). Keep it steady with no attack/decay envelope: amp envelope attack ~0, sustain 1, long layers covering the whole duration.' },
  { name: 'rapids_loop', dur: [5.5, 6.5], peak: 0.5, loop: 'xfade', brief: 'Rushing whitewater rapids ambience, exactly ~6 s, to loop seamlessly: louder, broadband white + pink noise with a roaring body (bandpass ~800-2500 Hz, plus highpass hiss above 4 kHz) and a low brown-noise rumble, with faster irregular tremolo (1-4 Hz, moderate depth). Steady, no attack/decay envelope: sustain 1, layers covering the whole duration.' },
  { name: 'music_loop', kind: 'music', dur: [16, 24], peak: 0.7, loop: 'wrap', brief: 'An upbeat, cheerful cartoon adventure tune for a rowing game on a sunny river, ~20 s seamless loop. Major key (e.g. C or G major), tempo 120-136 BPM, 8 or 10 bars of 4/4 so total length is 16-24 s (bars*4*60/tempo). Tracks: bouncy bass (triangle/square, root-fifth pattern), light drums (kick = sine with pitchEnv mult0 4 to mult1 1; snare = noise with bandpass; hi-hat = white noise highpass, very short), chord stabs or plucky arpeggio, and a catchy singable lead melody (square or triangle with a bit of vibrato) that resolves back to the start so the loop sounds natural. Keep it fun, simple and not busy.' },
  { name: 'click', dur: [0.04, 0.2], peak: 0.85, brief: 'A tiny UI button click/tap: very short (~0.06 s) soft pop - a sine blip around 900-1400 Hz with fast decay plus a hint of noise tick.' },
];

// ---------------------------------------------------------------------------------------------------------------
// Recipe schema (sent to Gemini verbatim) and strict validator.
// ---------------------------------------------------------------------------------------------------------------
const SCHEMA_DOC = `
You are a sound designer writing a JSON "synth recipe" that a small offline renderer turns into a mono WAV (22050 Hz).
Output ONLY one JSON object. No markdown, no comments. Unknown fields are rejected. Numbers are clamped to the ranges given.

SFX recipe:
{
  "kind": "sfx",
  "duration": seconds (0.03..8),
  "layers": [ LAYER, ... ]          // 1..12 layers, mixed (summed)
}

Music recipe:
{
  "kind": "music",
  "tempo": BPM (60..200),
  "bars": integer (1..32),          // 4/4, 16 steps per bar (16th notes). total seconds = bars*4*60/tempo
  "tracks": [ TRACK, ... ]          // 1..10 tracks
}

LAYER:
{
  "source": "sine" | "square" | "saw" | "triangle" | "noise",
  "noiseColor": "white" | "pink" | "brown",       // only for source "noise" (default white)
  "start": seconds offset into the sound (default 0),
  "dur": seconds the layer is held (before release) (0.005..8),
  "gain": linear 0..2 (default 1),
  "freq": {                                       // oscillators only
    "start": Hz (20..8000), "end": Hz (20..8000) (default = start),
    "curve": "lin" | "exp" (default "exp"),       // glide shape start->end across "dur"
    "vibratoHz": 0..20, "vibratoDepth": semitones 0..2
  },
  "amp": { "attack": s 0..4, "decay": s 0..4, "sustain": 0..1, "release": s 0..4 },   // ADSR; release follows after "dur"
  "ampEnd": optional gain multiplier 0..2 reached at the end of "dur" (linear ramp, e.g. for swells; default 1),
  "filter": {                                     // optional biquad
    "type": "lowpass" | "highpass" | "bandpass",
    "cutoff": { "start": Hz (40..10000), "end": Hz (40..10000) (default = start), "curve": "lin"|"exp" },
    "q": 0.3..20 (default 0.8)
  },
  "tremolo": { "hz": 0.05..60, "depth": 0..1 },   // optional amplitude wobble
  "repeats": { "count": integer 1..16 (extra copies), "interval": seconds 0.01..2, "gainDecay": 0..1.5, "pitchStep": semitones -12..12 }   // optional echo/arpeggio copies
}

TRACK (music):
{
  "name": string,
  "gain": 0..2,
  "instrument": {                                 // same fields as LAYER except start/dur/freq/repeats; frequency comes from each note
    "source": ..., "noiseColor": ..., "amp": {...}, "filter": {...}, "tremolo": {...},
    "vibratoHz": 0..20, "vibratoDepth": semitones 0..2,
    "pitchEnv": { "mult0": 0.25..8, "mult1": 0.25..8, "time": seconds 0.005..1 }   // optional: note freq * mult0 gliding to mult1 (kick drums)
  },
  "notes": [ { "step": integer 0..(bars*16-1), "len": steps 1..64, "midi": 24..108 (60 = middle C, used for pitch; for noise drums any value), "vel": 0..1 } ]   // max 300 notes per track
}
Notes: "amp" is required on every layer/instrument (tone has no click only if attack >= 0.002 and release >= 0.005).
Prefer layered, characterful sounds. Keep total loudness sane; the renderer normalises the peak.
`.trim();

class RecipeError extends Error {}
const fail = (msg) => { throw new RecipeError(msg); };
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
function num(v, lo, hi, def, label) {
  if (v === undefined || v === null) { if (def === undefined) fail(`${label} is required`); return def; }
  if (typeof v !== 'number' || !Number.isFinite(v)) fail(`${label} must be a number`);
  return clamp(v, lo, hi);
}
function obj(v, allowed, label) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) fail(`${label} must be an object`);
  for (const k of Object.keys(v)) if (!allowed.includes(k)) fail(`${label}: unknown field "${k}"`);
  return v;
}
function oneOf(v, list, def, label) {
  if (v === undefined) { if (def === undefined) fail(`${label} is required`); return def; }
  if (!list.includes(v)) fail(`${label} must be one of ${list.join('|')}`);
  return v;
}
function vAmp(a, label) {
  obj(a, ['attack', 'decay', 'sustain', 'release'], label);
  return {
    attack: num(a.attack, 0, 4, 0.005, `${label}.attack`), decay: num(a.decay, 0, 4, 0.1, `${label}.decay`),
    sustain: num(a.sustain, 0, 1, 1, `${label}.sustain`), release: num(a.release, 0, 4, 0.05, `${label}.release`),
  };
}
function vSweep(s, lo, hi, label) {
  obj(s, ['start', 'end', 'curve'], label);
  const start = num(s.start, lo, hi, undefined, `${label}.start`);
  return { start, end: num(s.end, lo, hi, start, `${label}.end`), curve: oneOf(s.curve, ['lin', 'exp'], 'exp', `${label}.curve`) };
}
function vFilter(f, label) {
  obj(f, ['type', 'cutoff', 'q'], label);
  const cut = typeof f.cutoff === 'number' ? { start: f.cutoff } : f.cutoff;
  return { type: oneOf(f.type, ['lowpass', 'highpass', 'bandpass'], undefined, `${label}.type`), cutoff: vSweep(cut, 40, 10000, `${label}.cutoff`), q: num(f.q, 0.3, 20, 0.8, `${label}.q`) };
}
function vTremolo(t, label) {
  obj(t, ['hz', 'depth'], label);
  return { hz: num(t.hz, 0.05, 60, undefined, `${label}.hz`), depth: num(t.depth, 0, 1, 0.5, `${label}.depth`) };
}
const SOURCES = ['sine', 'square', 'saw', 'triangle', 'noise'];
const NOISES = ['white', 'pink', 'brown'];
// Fields shared by LAYER and music instruments.
function vVoice(v, label, extra) {
  const out = {
    source: oneOf(v.source, SOURCES, undefined, `${label}.source`),
    noiseColor: oneOf(v.noiseColor, NOISES, 'white', `${label}.noiseColor`),
    amp: vAmp(v.amp ?? fail(`${label}.amp is required`), `${label}.amp`),
  };
  if (v.filter !== undefined) out.filter = vFilter(v.filter, `${label}.filter`);
  if (v.tremolo !== undefined) out.tremolo = vTremolo(v.tremolo, `${label}.tremolo`);
  Object.assign(out, extra);
  return out;
}
function vLayer(l, i) {
  const label = `layers[${i}]`;
  obj(l, ['source', 'noiseColor', 'start', 'dur', 'gain', 'freq', 'amp', 'ampEnd', 'filter', 'tremolo', 'repeats'], label);
  const extra = {
    start: num(l.start, 0, 8, 0, `${label}.start`), dur: num(l.dur, 0.005, 8, undefined, `${label}.dur`),
    gain: num(l.gain, 0, 2, 1, `${label}.gain`), ampEnd: num(l.ampEnd, 0, 2, 1, `${label}.ampEnd`),
  };
  const out = vVoice(l, label, extra);
  if (out.source !== 'noise') {
    if (l.freq === undefined) fail(`${label}.freq is required for oscillators`);
    obj(l.freq, ['start', 'end', 'curve', 'vibratoHz', 'vibratoDepth'], `${label}.freq`);
    out.freq = vSweep({ start: l.freq.start, end: l.freq.end, curve: l.freq.curve }, 20, 8000, `${label}.freq`);
    out.freq.vibratoHz = num(l.freq.vibratoHz, 0, 20, 0, `${label}.freq.vibratoHz`);
    out.freq.vibratoDepth = num(l.freq.vibratoDepth, 0, 2, 0, `${label}.freq.vibratoDepth`);
  }
  if (l.repeats !== undefined) {
    obj(l.repeats, ['count', 'interval', 'gainDecay', 'pitchStep'], `${label}.repeats`);
    out.repeats = {
      count: Math.round(num(l.repeats.count, 1, 16, undefined, `${label}.repeats.count`)),
      interval: num(l.repeats.interval, 0.01, 2, undefined, `${label}.repeats.interval`),
      gainDecay: num(l.repeats.gainDecay, 0, 1.5, 0.7, `${label}.repeats.gainDecay`),
      pitchStep: num(l.repeats.pitchStep, -12, 12, 0, `${label}.repeats.pitchStep`),
    };
  }
  return out;
}
function vTrack(t, i, bars) {
  const label = `tracks[${i}]`;
  obj(t, ['name', 'gain', 'instrument', 'notes'], label);
  const ins = obj(t.instrument, ['source', 'noiseColor', 'amp', 'filter', 'tremolo', 'vibratoHz', 'vibratoDepth', 'pitchEnv'], `${label}.instrument`);
  const instrument = vVoice(ins, `${label}.instrument`, {
    vibratoHz: num(ins.vibratoHz, 0, 20, 0, `${label}.instrument.vibratoHz`),
    vibratoDepth: num(ins.vibratoDepth, 0, 2, 0, `${label}.instrument.vibratoDepth`),
  });
  if (ins.pitchEnv !== undefined) {
    obj(ins.pitchEnv, ['mult0', 'mult1', 'time'], `${label}.instrument.pitchEnv`);
    instrument.pitchEnv = {
      mult0: num(ins.pitchEnv.mult0, 0.25, 8, 1, 'pitchEnv.mult0'), mult1: num(ins.pitchEnv.mult1, 0.25, 8, 1, 'pitchEnv.mult1'),
      time: num(ins.pitchEnv.time, 0.005, 1, 0.1, 'pitchEnv.time'),
    };
  }
  if (!Array.isArray(t.notes) || !t.notes.length) fail(`${label}.notes must be a non-empty array`);
  if (t.notes.length > 300) fail(`${label}.notes has more than 300 notes`);
  const notes = t.notes.map((n, j) => {
    obj(n, ['step', 'len', 'midi', 'vel'], `${label}.notes[${j}]`);
    return {
      step: Math.round(num(n.step, 0, bars * 16 - 1, undefined, `${label}.notes[${j}].step`)),
      len: Math.round(num(n.len, 1, 64, 1, `${label}.notes[${j}].len`)),
      midi: num(n.midi, 24, 108, 60, `${label}.notes[${j}].midi`), vel: num(n.vel, 0, 1, 0.8, `${label}.notes[${j}].vel`),
    };
  });
  return { name: String(t.name ?? `track${i}`).slice(0, 40), gain: num(t.gain, 0, 2, 1, `${label}.gain`), instrument, notes };
}
function validate(raw, spec) {
  const kind = spec.kind ?? 'sfx';
  if (kind === 'music') {
    obj(raw, ['kind', 'tempo', 'bars', 'tracks'], 'recipe');
    if (raw.kind !== 'music') fail('kind must be "music"');
    const tempo = num(raw.tempo, 60, 200, undefined, 'tempo');
    const bars = Math.round(num(raw.bars, 1, 32, undefined, 'bars'));
    const duration = (bars * 4 * 60) / tempo;
    if (duration < spec.dur[0] || duration > spec.dur[1]) fail(`music length ${duration.toFixed(1)} s must be within ${spec.dur[0]}-${spec.dur[1]} s (bars*4*60/tempo)`);
    if (!Array.isArray(raw.tracks) || !raw.tracks.length || raw.tracks.length > 10) fail('tracks must have 1..10 entries');
    return { kind, tempo, bars, tracks: raw.tracks.map((t, i) => vTrack(t, i, bars)) };
  }
  obj(raw, ['kind', 'duration', 'layers'], 'recipe');
  if (raw.kind !== undefined && raw.kind !== 'sfx') fail('kind must be "sfx"');
  const duration = num(raw.duration, 0.03, 8, undefined, 'duration');
  if (duration < spec.dur[0] || duration > spec.dur[1]) fail(`duration ${duration} must be within ${spec.dur[0]}-${spec.dur[1]} s`);
  if (!Array.isArray(raw.layers) || !raw.layers.length || raw.layers.length > 12) fail('layers must have 1..12 entries');
  return { kind, duration, layers: raw.layers.map(vLayer) };
}

// ---------------------------------------------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------------------------------------------
function rng(seed) { // mulberry32
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

function makeNoise(color, rand) {
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, brown = 0;
  return () => {
    const w = rand() * 2 - 1;
    if (color === 'pink') {
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      const p = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926; return p;
    }
    if (color === 'brown') { brown = (brown + 0.02 * w) / 1.02; return brown * 3.5; }
    return w;
  };
}
function osc(source, ph) { // ph in cycles
  const p = ph - Math.floor(ph);
  if (source === 'sine') return Math.sin(2 * Math.PI * p);
  if (source === 'square') return p < 0.5 ? 0.7 : -0.7;
  if (source === 'saw') return (2 * p - 1) * 0.8;
  return (p < 0.5 ? 4 * p - 1 : 3 - 4 * p) * 0.9; // triangle
}
function sweepAt(s, u) { // u 0..1
  u = clamp(u, 0, 1);
  if (s.curve === 'exp') return s.start * Math.pow(s.end / s.start, u);
  return s.start + (s.end - s.start) * u;
}
function biquadCoeffs(type, f, q) {
  const w = 2 * Math.PI * clamp(f, 20, SR * 0.45) / SR, c = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al;
  let b0, b1, b2;
  if (type === 'lowpass') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; }
  else if (type === 'highpass') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; }
  else { b0 = al; b1 = 0; b2 = -al; }
  return [b0 / a0, b1 / a0, b2 / a0, (-2 * c) / a0, (1 - al) / a0];
}
function adsr(a, t, dur) { // t seconds since note on, dur = hold time
  if (t < 0) return 0;
  if (t < dur) {
    if (t < a.attack) return t / a.attack;
    const d = t - a.attack;
    return d < a.decay ? 1 - (1 - a.sustain) * (d / a.decay) : a.sustain;
  }
  const level = dur < a.attack ? dur / a.attack : (dur - a.attack < a.decay ? 1 - (1 - a.sustain) * ((dur - a.attack) / a.decay) : a.sustain);
  const r = (t - dur) / Math.max(a.release, 1e-4);
  return r >= 1 ? 0 : level * (1 - r);
}

/**
 * Mix one voice into buf. spec has source/noiseColor/amp/filter/tremolo; opts: t0, dur, gain, ampEnd, hz(u,t) pitch fn.
 * wrap: samples past the buffer end wrap to its start (seamless music loop).
 */
function voice(buf, spec, o, seed, wrap) {
  const N = buf.length, rel = spec.amp.release;
  const total = o.dur + rel;
  const i0 = Math.floor(o.t0 * SR), n = Math.ceil(total * SR);
  const rand = rng(seed), noise = spec.source === 'noise' ? makeNoise(spec.noiseColor, rand) : null;
  const tremPhase = rand();
  let ph = 0, x1 = 0, x2 = 0, y1 = 0, y2 = 0, co = null;
  for (let k = 0; k < n; k++) {
    let idx = i0 + k;
    if (idx >= N) { if (!wrap) break; idx %= N; }
    const t = k / SR, u = o.dur > 0 ? Math.min(1, t / o.dur) : 1;
    let s;
    if (noise) s = noise();
    else {
      const f = o.hz(u, t);
      ph += f / SR;
      s = osc(spec.source, ph);
    }
    if (spec.filter) {
      if (k % 16 === 0) co = biquadCoeffs(spec.filter.type, sweepAt(spec.filter.cutoff, u), spec.filter.q);
      const y = co[0] * s + co[1] * x1 + co[2] * x2 - co[3] * y1 - co[4] * y2;
      x2 = x1; x1 = s; y2 = y1; y1 = y; s = y;
    }
    let a = adsr(spec.amp, t, o.dur) * o.gain * (1 + (o.ampEnd - 1) * u);
    if (spec.tremolo) a *= 1 - spec.tremolo.depth * (0.5 + 0.5 * Math.sin(2 * Math.PI * (spec.tremolo.hz * t + tremPhase)));
    buf[idx] += s * a;
  }
}

function renderSfx(r, name, seconds) {
  const buf = new Float32Array(Math.round(seconds * SR));
  r.layers.forEach((l, li) => {
    const copies = 1 + (l.repeats?.count ?? 0);
    for (let c = 0; c < copies; c++) {
      const semi = (l.repeats?.pitchStep ?? 0) * c, mult = Math.pow(2, semi / 12);
      const f = l.freq;
      voice(buf, l, {
        t0: l.start + c * (l.repeats?.interval ?? 0), dur: l.dur, gain: l.gain * Math.pow(l.repeats?.gainDecay ?? 1, c), ampEnd: l.ampEnd,
        hz: f ? (u, t) => sweepAt(f, u) * mult * Math.pow(2, (f.vibratoDepth * Math.sin(2 * Math.PI * f.vibratoHz * t)) / 12) : null,
      }, hash(`${name}${li}${c}`), false);
    }
  });
  return buf;
}
function renderMusic(r, name) {
  const stepSec = 60 / r.tempo / 4, N = Math.round(r.bars * 16 * stepSec * SR);
  const buf = new Float32Array(N);
  r.tracks.forEach((t, ti) => {
    const ins = t.instrument, pe = ins.pitchEnv;
    t.notes.forEach((n, ni) => {
      const base = 440 * Math.pow(2, (n.midi - 69) / 12);
      voice(buf, ins, {
        t0: n.step * stepSec, dur: n.len * stepSec, gain: t.gain * n.vel * 0.5, ampEnd: 1,
        hz: (u, tt) => {
          const m = pe ? (tt >= pe.time ? pe.mult1 : pe.mult0 * Math.pow(pe.mult1 / pe.mult0, tt / pe.time)) : 1;
          return base * m * Math.pow(2, (ins.vibratoDepth * Math.sin(2 * Math.PI * ins.vibratoHz * tt)) / 12);
        },
      }, hash(`${name}${ti}${ni}`), true);
    });
  });
  return buf;
}
/** Fold the extra tail (length X) back over the head with an equal-power crossfade so the loop has no seam. */
function crossfadeLoop(buf, L) {
  const X = buf.length - L, out = buf.slice(0, L);
  for (let i = 0; i < X; i++) {
    const a = (i / X) * Math.PI / 2;
    out[i] = buf[i] * Math.sin(a) + buf[L + i] * Math.cos(a);
  }
  return out;
}

function finalize(buf, spec) {
  const N = buf.length;
  let mean = 0;
  for (let i = 0; i < N; i++) mean += buf[i];
  mean /= N;
  let peak = 0;
  for (let i = 0; i < N; i++) { buf[i] -= mean; peak = Math.max(peak, Math.abs(buf[i])); }
  const g = peak > 1e-6 ? spec.peak / peak : 0;
  for (let i = 0; i < N; i++) buf[i] *= g;
  if (!spec.loop) { // tiny fades kill clicks at the file edges
    const f = Math.min(N >> 1, Math.round(0.002 * SR));
    for (let i = 0; i < f; i++) { buf[i] *= i / f; buf[N - 1 - i] *= i / f; }
  }
  return buf;
}
function stats(buf, spec) {
  let peak = 0, sq = 0, maxStep = 0;
  for (let i = 0; i < buf.length; i++) { peak = Math.max(peak, Math.abs(buf[i])); sq += buf[i] * buf[i]; if (i) maxStep = Math.max(maxStep, Math.abs(buf[i] - buf[i - 1])); }
  const rms = Math.sqrt(sq / buf.length);
  const seam = Math.abs(buf[0] - buf[buf.length - 1]);
  return { peak, rms, seam, maxStep, duration: buf.length / SR };
}
function sanity(st, spec) {
  if (st.rms < 0.01) return `too quiet (rms ${st.rms.toFixed(4)})`;
  if (st.peak > 0.999) return 'clipping';
  if (st.duration < spec.dur[0] || st.duration > spec.dur[1] + 0.01) return `bad duration ${st.duration.toFixed(2)}`;
  if (spec.loop && st.seam > Math.max(0.15, st.maxStep * 1.5)) return `loop seam jump ${st.seam.toFixed(3)}`;
  return null;
}

function wavBytes(buf) {
  const out = Buffer.alloc(44 + buf.length * 2);
  out.write('RIFF', 0); out.writeUInt32LE(36 + buf.length * 2, 4); out.write('WAVEfmt ', 8);
  out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(SR, 24);
  out.writeUInt32LE(SR * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(buf.length * 2, 40);
  for (let i = 0; i < buf.length; i++) out.writeInt16LE(Math.round(clamp(buf[i], -1, 1) * 32767), 44 + i * 2);
  return out;
}

function render(recipe, spec) {
  let buf;
  if (recipe.kind === 'music') buf = renderMusic(recipe, spec.name);
  else if (spec.loop === 'xfade') {
    const L = Math.round(recipe.duration * SR);
    buf = crossfadeLoop(renderSfx(recipe, spec.name, recipe.duration + XFADE), L);
  } else buf = renderSfx(recipe, spec.name, recipe.duration);
  return finalize(buf, spec);
}

// ---------------------------------------------------------------------------------------------------------------
// Gemini
// ---------------------------------------------------------------------------------------------------------------
async function askGemini(spec, feedback) {
  const prompt = `${SCHEMA_DOC}\n\nSOUND: "${spec.name}"\nBRIEF: ${spec.brief}\nDuration must be within ${spec.dur[0]}-${spec.dur[1]} seconds.` +
    (spec.loop === 'xfade' ? '\nThis is an ambience loop: keep it statistically steady from start to end (the renderer crossfades the tail into the head).' : '') +
    (feedback ? `\n\nYour previous attempt was rejected: ${feedback}\nFix it and return the corrected JSON.` : '') + '\n\nReturn ONLY the JSON object.';
  const body = { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.9, responseMimeType: 'application/json' } };
  for (let h = 1; h <= 3; h++) {
    const used = modelIdx;
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODELS[used])}:generateContent`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY }, body: JSON.stringify(body), signal: AbortSignal.timeout(240_000),
    }).catch((e) => ({ ok: false, status: 0, text: async () => String(e) }));
    if (!r.ok) {
      const t = await r.text();
      console.error(`  ${spec.name}: HTTP ${r.status} ${t.slice(0, 120).replace(/\s+/g, ' ')}`);
      if (r.status === 429 && /limit: 0|PerDay/.test(t) && used < MODELS.length - 1) {
        if (modelIdx === used) { modelIdx++; console.error(`  no quota for ${MODELS[used]}, falling back to ${MODELS[modelIdx]}`); }
        h--; continue;
      }
      if (r.status === 0 || r.status === 429 || r.status >= 500) { await new Promise((res) => setTimeout(res, 4000 * h)); continue; }
      return null;
    }
    const j = await r.json();
    spec.model = MODELS[used];
    return (j.candidates?.[0]?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? '').join('');
  }
  return null;
}

async function generate(spec) {
  let feedback = '', retries = 0;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const text = await askGemini(spec, feedback);
    if (text === null) { feedback = 'no response'; retries++; continue; }
    let raw;
    try { raw = JSON.parse(text.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, '')); } catch (e) { feedback = `invalid JSON (${e.message})`; retries++; console.error(`  ${spec.name}: ${feedback}`); continue; }
    try {
      const recipe = validate(raw, spec);
      const buf = render(recipe, spec);
      const st = stats(buf, spec), bad = sanity(st, spec);
      if (bad) fail(bad);
      return { raw, recipe, buf, st, retries };
    } catch (e) {
      if (!(e instanceof RecipeError)) throw e;
      feedback = e.message; retries++;
      console.error(`  ${spec.name}: rejected (${e.message}), attempt ${attempt}`);
    }
  }
  return null;
}

fs.mkdirSync(recipeDir, { recursive: true });
const manifestPath = path.join(outDir, 'manifest.json');
const manifest = { requestedModel: MODEL, generatedAt: new Date().toISOString(), sampleRate: SR, files: {} };
if (fs.existsSync(manifestPath)) Object.assign(manifest.files, JSON.parse(fs.readFileSync(manifestPath, 'utf8')).files ?? {});

const todo = SOUNDS.filter((s) => (only.length ? only.includes(s.name) : force || !fs.existsSync(path.join(outDir, `${s.name}.wav`))));
for (const n of only) if (!SOUNDS.some((s) => s.name === n)) console.error(`unknown sound "${n}"`);
for (const s of SOUNDS) if (!todo.includes(s)) console.log(`skip ${s.name}`);

let next = 0, failed = 0;
async function worker() {
  while (next < todo.length) {
    const spec = todo[next++];
    console.log(`generating ${spec.name} with ${MODELS[modelIdx]}...`);
    const res = await generate(spec);
    if (!res) { failed++; console.error(`FAILED ${spec.name}`); continue; }
    fs.writeFileSync(path.join(outDir, `${spec.name}.wav`), wavBytes(res.buf));
    fs.writeFileSync(path.join(recipeDir, `${spec.name}.json`), JSON.stringify(res.raw, null, 2));
    manifest.files[spec.name] = {
      file: `${spec.name}.wav`, duration: +res.st.duration.toFixed(3), loop: !!spec.loop, peak: +res.st.peak.toFixed(3), rms: +res.st.rms.toFixed(4), retries: res.retries, model: spec.model,
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`ok ${spec.name} ${res.st.duration.toFixed(2)}s peak ${res.st.peak.toFixed(2)} rms ${res.st.rms.toFixed(3)} retries ${res.retries}`);
  }
}
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, todo.length) }, worker));
console.log(failed ? `done with ${failed} failure(s)` : 'done');
process.exit(failed ? 1 : 0);
