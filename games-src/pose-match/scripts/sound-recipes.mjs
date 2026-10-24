// Hand-authored synth recipes for every sound in the game (rendered by gen-sounds.mjs).
// Schema: { duration, gain, loop?, layers: [...], echo?, reverb? } — see gen-sounds.mjs.

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

const SFX = {
  whoosh: {
    duration: 1.0, gain: 0.7,
    layers: [
      { wave: 'noise', start: 0, dur: 0.75, env: { a: 0.45, d: 0.25, s: 0.6, r: 0.22 }, gain: 0.9,
        filter: { type: 'bandpass', freq: [280, 2600], q: 1.3 } },
      { wave: 'noise', start: 0.1, dur: 0.6, env: { a: 0.4, d: 0.2, s: 0.5, r: 0.2 }, gain: 0.35,
        filter: { type: 'highpass', freq: [1500, 6000], q: 0.7 } },
      { wave: 'sine', start: 0, dur: 0.7, freq: [55, 95], env: { a: 0.3, d: 0.3, s: 0.5, r: 0.25 }, gain: 0.45 },
    ],
    reverb: { mix: 0.15, size: 0.6 },
  },

  pass: {
    duration: 0.9, gain: 0.75,
    layers: [
      { wave: 'sine', fm: { ratio: 3.5, index: 2.2, decay: 0.12 },
        notes: [{ t: 0, f: 1046.5, d: 0.09 }, { t: 0.09, f: 1568, d: 0.3 }],
        env: { a: 0.002, d: 0.25, s: 0.3, r: 0.25 }, gain: 0.7 },
      { wave: 'triangle',
        notes: [{ t: 0, f: 523.25, d: 0.09 }, { t: 0.09, f: 784, d: 0.3 }],
        env: { a: 0.003, d: 0.2, s: 0.4, r: 0.2 }, gain: 0.35 },
      { wave: 'square', duty: 0.125, start: 0.16,
        notes: [{ t: 0, f: 2093, d: 0.04, v: 0.8 }, { t: 0.05, f: 2637, d: 0.04, v: 0.7 }, { t: 0.1, f: 3136, d: 0.04, v: 0.6 }, { t: 0.15, f: 4186, d: 0.06, v: 0.5 }],
        env: { a: 0.001, d: 0.04, s: 0.2, r: 0.05 }, gain: 0.14 },
    ],
    echo: { delay: 0.11, feedback: 0.28, mix: 0.22 },
    reverb: { mix: 0.18, size: 0.5 },
  },

  splat: {
    duration: 0.7, gain: 0.85,
    layers: [
      { wave: 'sine', start: 0, dur: 0.16, freq: [190, 48], env: { a: 0.001, d: 0.15, s: 0, r: 0.04 }, gain: 0.95, drive: 0.45 },
      { wave: 'noise', start: 0, dur: 0.22, env: { a: 0.001, d: 0.2, s: 0, r: 0.05 }, gain: 0.8,
        filter: { type: 'lowpass', freq: [3200, 280], q: 1 } },
      { wave: 'noise', start: 0.01, dur: 0.13, env: { a: 0.005, d: 0.1, s: 0.2, r: 0.04 }, gain: 0.5,
        filter: { type: 'bandpass', freq: [700, 2200], q: 6 } },
      { wave: 'triangle', start: 0.06, dur: 0.38, freq: [420, 110], vibrato: { rate: 18, depth: 2 },
        env: { a: 0.01, d: 0.3, s: 0.25, r: 0.12 }, gain: 0.35 },
    ],
  },

  lifelost: {
    duration: 1.0, gain: 0.65,
    layers: [
      { wave: 'square', duty: 0.35,
        notes: [{ t: 0, f: 392, f2: 380, d: 0.2 }, { t: 0.25, f: 370, f2: 356, d: 0.2 }, { t: 0.5, f: 349, f2: 320, d: 0.35 }],
        env: { a: 0.01, d: 0.1, s: 0.7, r: 0.08 }, gain: 0.6, vibrato: { rate: 6, depth: 0.25 },
        filter: { type: 'lowpass', freq: [2200, 800], q: 2 } },
      { wave: 'triangle',
        notes: [{ t: 0, f: 196, d: 0.2 }, { t: 0.25, f: 185, d: 0.2 }, { t: 0.5, f: 174.6, f2: 160, d: 0.35 }],
        env: { a: 0.01, d: 0.1, s: 0.7, r: 0.08 }, gain: 0.4 },
    ],
  },

  gameover: {
    duration: 2.4, gain: 0.75,
    layers: [
      { wave: 'saw',
        notes: [{ t: 0, f: 196, d: 0.36 }, { t: 0.42, f: 185, d: 0.36 }, { t: 0.84, f: 174.6, d: 0.36 }],
        env: { a: 0.04, d: 0.1, s: 0.8, r: 0.12 }, gain: 0.6,
        filter: { type: 'lowpass', freq: [1300, 1100], q: 2.5 } },
      { wave: 'saw', start: 1.26,
        notes: [{ t: 0, f: 164.8, f2: 158, d: 0.85 }],
        env: { a: 0.05, d: 0.2, s: 0.8, r: 0.25 }, gain: 0.6, vibrato: { rate: 5.5, depth: 0.6 },
        filter: { type: 'lowpass', freq: [1300, 500], q: 2.5 } },
      { wave: 'sine',
        notes: [{ t: 0, f: 98, d: 0.36 }, { t: 0.42, f: 92.5, d: 0.36 }, { t: 0.84, f: 87.3, d: 0.36 }, { t: 1.26, f: 82.4, d: 0.85 }],
        env: { a: 0.03, d: 0.1, s: 0.8, r: 0.2 }, gain: 0.35 },
    ],
    reverb: { mix: 0.22, size: 0.6 },
  },

  tick: {
    duration: 0.18, gain: 0.75,
    layers: [
      { wave: 'sine', start: 0, dur: 0.05, freq: [1250, 820], fm: { ratio: 2.4, index: 3, decay: 0.02 },
        env: { a: 0.001, d: 0.05, s: 0, r: 0.04 }, gain: 0.9 },
      { wave: 'noise', start: 0, dur: 0.012, env: { a: 0.001, d: 0.01, s: 0, r: 0.01 }, gain: 0.35,
        filter: { type: 'bandpass', freq: [2600, 2600], q: 4 } },
    ],
  },

  go: {
    duration: 0.9, gain: 0.85,
    layers: [
      { wave: 'square', duty: 0.5, start: 0, dur: 0.24, freq: [300, 1400], env: { a: 0.003, d: 0.1, s: 0.7, r: 0.04 }, gain: 0.45,
        filter: { type: 'lowpass', freq: [1500, 6000], q: 1 } },
      { wave: 'sine', fm: { ratio: 2, index: 1.5, decay: 0.2 }, start: 0.2,
        notes: [{ t: 0, f: 784, d: 0.35 }, { t: 0, f: 988, d: 0.35 }, { t: 0, f: 1175, d: 0.35 }, { t: 0, f: 1568, d: 0.35, v: 0.6 }],
        env: { a: 0.004, d: 0.2, s: 0.5, r: 0.25 }, gain: 0.4 },
      { wave: 'noise', start: 0.2, dur: 0.4, env: { a: 0.01, d: 0.3, s: 0.2, r: 0.15 }, gain: 0.15,
        filter: { type: 'highpass', freq: [6000, 9000], q: 0.7 } },
    ],
    echo: { delay: 0.09, feedback: 0.25, mix: 0.2 },
  },

  click: {
    duration: 0.08, gain: 0.55,
    layers: [{ wave: 'sine', start: 0, dur: 0.03, freq: [950, 480], env: { a: 0.001, d: 0.03, s: 0, r: 0.02 }, gain: 1 }],
  },

  warn: {
    duration: 0.38, gain: 0.55,
    layers: [{
      wave: 'square', duty: 0.5,
      notes: [{ t: 0, f: 1760, d: 0.08 }, { t: 0.16, f: 1760, d: 0.08 }],
      env: { a: 0.002, d: 0.02, s: 0.8, r: 0.025 }, gain: 0.6,
      filter: { type: 'lowpass', freq: [4200, 4200], q: 0.8 },
    }],
  },

  newbest: {
    duration: 1.8, gain: 0.8,
    layers: [
      { wave: 'saw',
        notes: [523.25, 659.25, 784, 1046.5].map((f, i) => ({ t: i * 0.1, f, d: 0.08 }))
          .concat([1046.5, 1318.5, 1568].map((f) => ({ t: 0.42, f, d: 0.7, v: 0.8 }))),
        env: { a: 0.01, d: 0.1, s: 0.7, r: 0.3 }, gain: 0.35, vibrato: { rate: 5.5, depth: 0.08 },
        filter: { type: 'lowpass', freq: [2500, 3500], q: 1.5 } },
      { wave: 'square', duty: 0.25,
        notes: [523.25, 659.25, 784, 1046.5].map((f, i) => ({ t: i * 0.1, f: f * 2, d: 0.07 }))
          .concat([{ t: 0.42, f: 2093, d: 0.7 }]),
        env: { a: 0.005, d: 0.08, s: 0.5, r: 0.25 }, gain: 0.18 },
      { wave: 'sine', fm: { ratio: 3.5, index: 2, decay: 0.08 }, start: 0.45,
        notes: [2093, 2637, 3136, 4186, 3136, 4186].map((f, i) => ({ t: i * 0.07, f, d: 0.06, v: 1 - i * 0.1 })),
        env: { a: 0.001, d: 0.06, s: 0.2, r: 0.15 }, gain: 0.2 },
    ],
    reverb: { mix: 0.22, size: 0.6 },
  },
};

// ---------------------------------------------------------------- music: 128 BPM, 8 bars of 4/4 = 15.0 s

function music() {
  const B = 60 / 128; // beat
  const E = B / 2; // eighth
  const bars = 8;
  const chords = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]; // C Am F G
  const roots = [48, 45, 41, 43];
  // Lead melody: [eighth step, midi note, length in eighths] per bar.
  const melody = [
    [[0, 67, 1], [1, 72, 1], [2, 76, 2], [4, 74, 1], [5, 72, 1], [6, 67, 2]],
    [[0, 69, 1], [1, 72, 1], [2, 76, 2], [4, 79, 1], [5, 77, 1], [6, 76, 2]],
    [[0, 77, 1], [1, 76, 1], [2, 74, 1], [3, 72, 1], [4, 69, 2], [6, 72, 2]],
    [[0, 71, 1], [1, 74, 1], [2, 79, 2], [4, 77, 1], [5, 74, 1], [6, 71, 1], [7, 74, 1]],
    [[0, 67, 1], [1, 72, 1], [2, 76, 2], [4, 79, 1], [5, 76, 1], [6, 84, 2]],
    [[0, 81, 1], [1, 79, 1], [2, 76, 2], [4, 72, 1], [5, 76, 1], [6, 79, 2]],
    [[0, 77, 1], [2, 77, 1], [3, 76, 1], [4, 74, 2], [6, 72, 1], [7, 74, 1]],
    [[0, 71, 2], [2, 74, 1], [3, 77, 1], [4, 79, 2], [6, 74, 1], [7, 71, 1]],
  ];
  const bass = [], lead = [], kick = [], hat = [], snN = [], snT = [], stab = [];
  for (let bar = 0; bar < bars; bar++) {
    const t0 = bar * 4 * B;
    const ci = bar % 4;
    for (let e = 0; e < 8; e++) {
      const n = roots[ci] + (e % 2 ? 12 : 0);
      bass.push({ t: t0 + e * E, f: midi(n - 12), d: E * 0.8, v: e % 2 ? 0.75 : 1 });
    }
    for (let b = 0; b < 4; b++) {
      kick.push({ t: t0 + b * B, f: 155, f2: 45, d: 0.14 });
      hat.push({ t: t0 + b * B + E, f: 8000, d: 0.04, v: 1 });
      hat.push({ t: t0 + b * B + E * 1.5, f: 8000, d: 0.02, v: 0.4 });
      if (b % 2) {
        snN.push({ t: t0 + b * B, f: 1800, d: 0.14 });
        snT.push({ t: t0 + b * B, f: 195, f2: 160, d: 0.07 });
        for (const n of chords[ci]) stab.push({ t: t0 + b * B + E, f: midi(n), d: E * 0.6, v: 0.8 });
      }
    }
    for (const [s, n, len] of melody[bar]) lead.push({ t: t0 + s * E, f: midi(n), d: len * E * 0.85 });
  }
  return {
    duration: bars * 4 * B, gain: 0.8, loop: true,
    layers: [
      { wave: 'saw', notes: bass, env: { a: 0.004, d: 0.12, s: 0.45, r: 0.04 }, gain: 0.5,
        filter: { type: 'lowpass', freq: [750, 750], q: 3 } },
      { wave: 'square', duty: 0.25, notes: lead, env: { a: 0.005, d: 0.08, s: 0.6, r: 0.05 }, gain: 0.3,
        vibrato: { rate: 5, depth: 0.1 }, filter: { type: 'lowpass', freq: [4500, 4500], q: 0.8 } },
      { wave: 'sine', notes: kick, env: { a: 0.001, d: 0.14, s: 0, r: 0.02 }, gain: 0.9, drive: 0.25 },
      { wave: 'noise', notes: hat, env: { a: 0.001, d: 0.035, s: 0, r: 0.02 }, gain: 0.22,
        filter: { type: 'highpass', freq: [7000, 7000], q: 0.8 } },
      { wave: 'noise', notes: snN, env: { a: 0.001, d: 0.13, s: 0, r: 0.05 }, gain: 0.45,
        filter: { type: 'bandpass', freq: [1800, 1800], q: 0.8 } },
      { wave: 'triangle', notes: snT, env: { a: 0.001, d: 0.07, s: 0, r: 0.03 }, gain: 0.35 },
      { wave: 'square', duty: 0.5, notes: stab, env: { a: 0.003, d: 0.06, s: 0.4, r: 0.04 }, gain: 0.1,
        filter: { type: 'lowpass', freq: [2400, 2400], q: 1 } },
    ],
    reverb: { mix: 0.1, size: 0.45 },
  };
}

export const RECIPES = { ...SFX, music: music() };
