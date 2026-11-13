// Moo Bowl audio: generative bowling-alley jukebox groove (retro lounge, F major, ~100 BPM).
// Lookahead scheduler (25 ms timer, ~140 ms horizon on audio time), 16-bar form, per-layer
// gains that crossfade between modes: title / game / results / off.

import { mtof, rand, clamp } from './audio-synth.js';
import { mulberry32 } from './audio-dsp.js';

const LOOKAHEAD = 0.14;
const TICK_MS = 25;

// 16 bars. Each bar is one or two chords [rootPitchClass, quality].
const F = 5, D = 2, G = 7, C = 0, A = 9, Bb = 10;
const FORM = [
  [[F, 'maj7']], [[D, 'm7']], [[G, 'm7']], [[C, '7']],
  [[F, 'maj7']], [[A, 'm7'], [D, '7']], [[G, 'm7']], [[C, '7']],
  [[Bb, 'maj7']], [[G, 'm7']], [[A, 'm7'], [D, '7']], [[G, 'm7']],
  [[F, 'maj7'], [D, 'm7']], [[G, 'm7'], [C, '7']], [[A, 'm7'], [D, '7']], [[G, 'm7'], [C, '7']],
];
const IV = { maj7: [4, 7, 11, 14], m7: [3, 7, 10, 14], 7: [4, 7, 10, 14] };
const SCALE = [0, 2, 4, 5, 7, 9, 11]; // F major relative to F

const MODES = {
  title: { bpm: 100, bus: 0.9, layers: { drums: 1, bass: 1, keys: 1, pad: 0.35, mel: 1 }, sparse: false },
  game: { bpm: 100, bus: 0.55, layers: { drums: 0.5, bass: 0.7, keys: 0.6, pad: 0.9, mel: 0 }, sparse: true },
  results: { bpm: 112, bus: 1.0, layers: { drums: 1, bass: 1, keys: 1, pad: 0.3, mel: 1.1 }, sparse: false },
  off: { bpm: 100, bus: 0, layers: { drums: 0, bass: 0, keys: 0, pad: 0, mel: 0 }, sparse: true },
};

function voicing(pc, q) {
  const base = 48 + pc;
  return IV[q].map((i) => base + i);
}

export function createMusic({ ctx, dest, synth }) {
  const bus = ctx.createGain();
  bus.gain.value = 0;
  bus.connect(dest);
  const layers = {};
  for (const k of ['drums', 'bass', 'keys', 'pad', 'mel']) {
    layers[k] = ctx.createGain();
    layers[k].gain.value = 0;
    layers[k].connect(bus);
  }
  // a touch of tape-style echo on the melody
  const echo = ctx.createDelay(1);
  const echoFb = ctx.createGain();
  const echoOut = ctx.createGain();
  echo.delayTime.value = 0.45;
  echoFb.gain.value = 0.32;
  echoOut.gain.value = 0.28;
  const echoLp = ctx.createBiquadFilter();
  echoLp.type = 'lowpass';
  echoLp.frequency.value = 2400;
  layers.mel.connect(echo);
  echo.connect(echoLp).connect(echoFb).connect(echo);
  echoLp.connect(echoOut).connect(bus);

  let mode = 'off';
  let timer = null;
  let paused = false;
  let step = 0; // 16th within the 256-step form
  let loop = 0;
  let nextTime = 0;
  let stopTimer = null;
  let lastEnabled = false;

  const swingOffset = (s, stepDur) => {
    const m = s % 4;
    return m === 2 || m === 3 ? stepDur * 0.4 : 0;
  };

  function gainOf(layer) { return layers[layer].gain.value > 0.02 && MODES[mode].layers[layer] > 0; }

  // ---------- instruments ----------
  function kick(t, v) {
    synth.tone(layers.drums, t, { freq: 130, freqEnd: 44, dur: 0.26, gain: 0.7 * v, attack: 0.002 });
    synth.noise(layers.drums, t, { filter: 'lowpass', freq: 900, q: 0.7, dur: 0.02, gain: 0.25 * v });
  }
  function snare(t, v) {
    synth.noise(layers.drums, t, { filter: 'bandpass', freq: 1900, q: 0.7, dur: 0.17, gain: 0.34 * v });
    synth.tone(layers.drums, t, { freq: 210, freqEnd: 160, dur: 0.12, gain: 0.22 * v, type: 'triangle' });
  }
  function rim(t, v) {
    synth.tone(layers.drums, t, { freq: 1650, freqEnd: 1300, dur: 0.035, gain: 0.12 * v, type: 'square', lp: 4000 });
    synth.noise(layers.drums, t, { filter: 'bandpass', freq: 3000, q: 1.2, dur: 0.03, gain: 0.1 * v });
  }
  function hat(t, v, open) {
    synth.noise(layers.drums, t, { filter: 'highpass', freq: 7500, q: 0.7, dur: open ? 0.16 : 0.04, gain: 0.1 * v, attack: 0.001, pan: rand(-0.15, 0.15) });
  }
  function clap(t, v) {
    for (let i = 0; i < 3; i++) synth.noise(layers.drums, t + i * 0.011, { filter: 'bandpass', freq: 1500, q: 1.1, dur: i === 2 ? 0.14 : 0.025, gain: 0.2 * v });
  }
  function bassNote(t, midi, dur, v) {
    const f = mtof(midi);
    synth.tone(layers.bass, t, { freq: f, dur, gain: 0.5 * v, type: 'triangle', attack: 0.006, lp: 700 });
    synth.tone(layers.bass, t, { freq: f * 2, dur: dur * 0.5, gain: 0.07 * v, type: 'sine', attack: 0.004 });
    synth.noise(layers.bass, t, { filter: 'bandpass', freq: 900, q: 1, dur: 0.02, gain: 0.05 * v });
  }
  function epiano(t, midi, dur, v, pan) {
    const f = mtof(midi);
    synth.fm(layers.keys, t, { freq: f, ratio: 1, index: 1.4, indexEnd: 0.12, idxDur: dur * 0.5, dur, gain: 0.11 * v, attack: 0.003, pan });
    synth.fm(layers.keys, t, { freq: f, ratio: 14, index: 0.12, indexEnd: 0.005, idxDur: 0.08, dur: dur * 0.3, gain: 0.05 * v, attack: 0.001, pan });
  }
  function vibe(t, midi, dur, v, pan) {
    const f = mtof(midi);
    synth.fm(layers.mel, t, { freq: f, ratio: 4, index: 0.9, indexEnd: 0.02, idxDur: 0.25, dur, gain: 0.15 * v, attack: 0.002, pan });
    synth.tone(layers.mel, t, { freq: f * 2, dur: dur * 0.35, gain: 0.025 * v, vib: { hz: 5.5, cents: 8 } });
  }
  function pad(t, notes, dur, v) {
    for (let i = 0; i < notes.length; i++) {
      const f = mtof(notes[i] - 12);
      for (const d of [-7, 7]) {
        synth.tone(layers.pad, t, { freq: f, dur: dur + 0.4, gain: 0.032 * v, type: 'triangle', attack: dur * 0.35, detune: d + i * 2, lp: 1400 });
      }
    }
  }

  // ---------- pattern generation ----------
  const KEYS_PATTERNS = [
    [0, 6, 10], [0, 3, 8, 11], [2, 6, 12], [0, 5, 8, 14], [0, 7, 10, 13], [3, 8, 11],
  ];

  function chordAt(bar, within) {
    const chords = FORM[bar];
    const ci = chords.length === 1 ? 0 : (within >= 8 ? 1 : 0);
    return chords[ci];
  }

  function scaleNoteNear(rootPc, target, rnd, tonesOnly, chordMidis) {
    // snap to F major scale (target is MIDI)
    let best = target, bd = 99;
    for (let m = target - 4; m <= target + 4; m++) {
      const rel = (((m - 5) % 12) + 12) % 12;
      if (!SCALE.includes(rel)) continue;
      const d = Math.abs(m - target) + (tonesOnly && !chordMidis.some((c) => (c - m) % 12 === 0) ? 3 : 0);
      if (d < bd) { bd = d; best = m; }
    }
    return best;
  }

  const phraseCache = new Map();
  /** Melody for a two-bar phrase: list of {step (0..31), midi, len}. */
  function phrase(p, lp) {
    const key = p + ':' + lp;
    if (phraseCache.has(key)) return phraseCache.get(key);
    const motifId = p % 4;
    const seed = motifId * 977 + (lp % 3) * 5003 + (p >= 4 ? 31 : 0) + 7;
    const rnd = mulberry32(seed);
    const rhythms = [
      [0, 3, 6, 10, 14, 20, 24],
      [2, 6, 8, 12, 18, 22, 26],
      [0, 4, 7, 10, 16, 19, 24, 28],
      [3, 6, 11, 14, 19, 22],
    ];
    const rh = rhythms[(motifId + (p >= 4 ? 1 : 0) + (lp % 2)) % rhythms.length];
    const out = [];
    let cur = 72 + [0, 2, 4, 7][Math.floor(rnd() * 4)] - (rnd() < 0.3 ? 12 : 0);
    for (let i = 0; i < rh.length; i++) {
      const bar = (p * 2 + (rh[i] >= 16 ? 1 : 0)) % 16;
      const chord = chordAt(bar, rh[i] % 16);
      const notes = voicing(chord[0], chord[1]);
      const strong = rh[i] % 8 === 0 || i === rh.length - 1;
      cur += Math.floor(rnd() * 5) - 2 + (cur > 80 ? -2 : cur < 67 ? 2 : 0);
      cur = clamp(cur, 64, 86);
      const m = scaleNoteNear(chord[0], cur, rnd, strong, notes);
      cur = m;
      const nextStep = i + 1 < rh.length ? rh[i + 1] : 32;
      out.push({ step: rh[i], midi: m, len: Math.min(nextStep - rh[i], 6) });
    }
    phraseCache.set(key, out);
    if (phraseCache.size > 64) phraseCache.clear();
    return out;
  }

  function scheduleStep(s, t, stepDur) {
    const bar = Math.floor(s / 16) % 16;
    const within = s % 16;
    const cfg = MODES[mode];
    const sparse = cfg.sparse;
    const sw = swingOffset(s, stepDur);
    const tt = t + sw;
    const beatDur = stepDur * 4;
    const rnd = Math.random;
    const chord = chordAt(bar, within);
    const nextBar = (bar + 1) % 16;
    const chordNext = within < 8 && FORM[bar].length > 1 ? FORM[bar][1] : FORM[nextBar][0];

    // drums
    if (gainOf('drums')) {
      if (mode === 'results') {
        if (within % 4 === 0) kick(t, 0.95);
        if (within === 4 || within === 12) { snare(tt, 0.8); clap(tt, 0.5); }
        if (within % 2 === 0) hat(tt, within % 4 === 2 ? 0.9 : 0.55, within === 14);
        if (within % 4 === 3 && rnd() < 0.5) hat(tt, 0.3, false);
        if (within === 15 && bar % 4 === 3) snare(tt, 0.4);
      } else if (!sparse) {
        if (within === 0 || (within === 10 && bar % 2 === 0) || (within === 7 && bar % 4 === 3)) kick(t, within === 0 ? 0.9 : 0.6);
        if (within === 4 || within === 12) snare(tt, 0.65);
        if (within === 15 && rnd() < 0.35) snare(tt, 0.18);
        if (within % 2 === 0) hat(tt, within % 4 === 0 ? 0.7 : 0.45, within === 14 && bar % 2 === 1);
        if (within % 4 === 3 && rnd() < 0.25) hat(tt, 0.2, false);
      } else {
        if (within === 0 && bar % 2 === 0) kick(t, 0.55);
        if (within === 12) rim(tt, 0.6);
        if (within % 4 === 0) hat(tt, 0.35, false);
      }
    }

    // bass: walking on the beat
    if (gainOf('bass') && within % 4 === 0) {
      const beat = within / 4;
      const root = 36 + chord[0];
      const sub = FORM[bar].length === 2;
      let midi;
      const q = chord[1];
      const third = q === 'm7' ? 3 : 4;
      if (sparse) {
        if (within === 0) midi = root;
        else if (within === 8 && !sub) midi = root + 7;
        else midi = null;
      } else if (sub) {
        // two beats per chord: root then fifth/approach
        const b2 = beat % 2;
        if (b2 === 0) midi = root;
        else { const nr = 36 + (within < 8 ? FORM[bar][1][0] : chordNext[0]); midi = rnd() < 0.5 ? root + 7 : nr + (rnd() < 0.5 ? 1 : -1); }
      } else if (beat === 0) midi = root;
      else if (beat === 1) midi = root + (rnd() < 0.6 ? third : 7);
      else if (beat === 2) midi = root + 7;
      else midi = 36 + chordNext[0] + (rnd() < 0.5 ? -1 : 1);
      if (midi != null) {
        while (midi < 33) midi += 12;
        while (midi > 50) midi -= 12;
        bassNote(tt, midi, beatDur * (sparse ? 1.6 : 0.9), within === 0 ? 1 : 0.8);
      }
      // little offbeat ghost
    }
    if (gainOf('bass') && !sparse && within === 14 && Math.random() < 0.3) bassNote(tt, 36 + chord[0] + 12, beatDur * 0.3, 0.45);

    // keys comping
    if (gainOf('keys')) {
      const pat = KEYS_PATTERNS[(bar * 5 + loop * 3 + (bar > 7 ? 1 : 0)) % KEYS_PATTERNS.length];
      let hit = false;
      if (sparse) hit = (within === 0 && bar % 2 === 0) || (within === 10 && bar % 4 === 1);
      else hit = pat.includes(within);
      if (hit) {
        const notes = voicing(chord[0], chord[1]);
        const dur = sparse ? beatDur * 3 : beatDur * (within === 0 ? 1.6 : 0.9);
        const vel = (within === 0 ? 1 : 0.8) * (sparse ? 0.7 : 1);
        for (let i = 0; i < notes.length; i++) epiano(tt + i * 0.011, notes[i], dur, vel * (i === 0 ? 0.9 : 1), -0.25 + i * 0.16);
      }
    }

    // pad on chord changes
    if (gainOf('pad')) {
      const start = FORM[bar].length === 1 ? within === 0 : within === 0 || within === 8;
      if (start) {
        const notes = voicing(chord[0], chord[1]).slice(0, 3);
        const len = FORM[bar].length === 1 ? beatDur * 4 : beatDur * 2;
        pad(t, notes, len, 1);
      }
    }

    // melody vibes
    if (gainOf('mel')) {
      const p = Math.floor(s / 32) % 8;
      if (!(loop % 2 === 0 && p === 0)) { // leave the very first phrase of every other loop open
        const local = s % 32;
        const ph = phrase(p, loop);
        for (const n of ph) {
          if (n.step === local) vibe(t + swingOffset(s, stepDur), n.midi, beatDur * (0.5 + n.len * 0.25), mode === 'results' ? 1.1 : 0.9, rand(-0.3, 0.3));
        }
      }
    }
  }

  function tick() {
    if (paused || mode === 'off' && layers.keys.gain.value < 0.005) return;
    const now = ctx.currentTime;
    if (nextTime < now - 0.05) nextTime = now + 0.05; // never replay missed notes
    let guard = 0;
    while (nextTime < now + LOOKAHEAD && guard++ < 8) {
      const stepDur = 60 / MODES[mode].bpm / 4;
      try { scheduleStep(step, nextTime, stepDur); } catch (e) { /* keep the clock alive */ }
      nextTime += stepDur;
      step = (step + 1) % 256;
      if (step === 0) loop++;
    }
  }

  function startTimer() {
    if (timer != null || paused) return;
    nextTime = Math.max(nextTime, ctx.currentTime + 0.08);
    // start on the next bar line so crossfades stay on the grid
    timer = setInterval(tick, TICK_MS);
  }
  function haltTimer() {
    if (timer != null) { clearInterval(timer); timer = null; }
  }

  function applyMode() {
    const cfg = MODES[mode];
    const now = ctx.currentTime;
    bus.gain.cancelScheduledValues(now);
    bus.gain.setTargetAtTime(cfg.bus, now, mode === 'off' ? 0.35 : 0.5);
    for (const k of Object.keys(layers)) {
      layers[k].gain.cancelScheduledValues(now);
      layers[k].gain.setTargetAtTime(cfg.layers[k], now, 0.6);
    }
  }

  return {
    setMode(m) {
      if (!MODES[m]) m = 'off';
      if (m === mode) return;
      const prev = mode;
      mode = m;
      if (stopTimer) { clearTimeout(stopTimer); stopTimer = null; }
      if (m === 'off') {
        applyMode();
        stopTimer = setTimeout(() => { if (mode === 'off') haltTimer(); }, 2500);
        return;
      }
      // on the way in from silence, restart from the top of the form
      if (prev === 'off') { step = 0; nextTime = ctx.currentTime + 0.1; }
      // wake layers immediately so the first scheduled bar is audible
      applyMode();
      for (const k of Object.keys(layers)) {
        if (MODES[m].layers[k] > 0 && layers[k].gain.value < 0.03) layers[k].gain.setValueAtTime(0.03, ctx.currentTime);
      }
      startTimer();
    },
    pause() { paused = true; haltTimer(); },
    resume() {
      if (!paused) return;
      paused = false;
      nextTime = ctx.currentTime + 0.1; // skip the gap, no backlog of notes
      if (mode !== 'off') startTimer();
    },
    get mode() { return mode; },
    dispose() { haltTimer(); if (stopTimer) clearTimeout(stopTimer); try { bus.disconnect(); } catch (e) { /* ignore */ } },
  };
}
