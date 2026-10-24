/** Procedural music: lookahead scheduler on AudioContext time with crossfades. */
import { clamp, mtof, noise, tone, type Core } from './engine';

export type Track = 'menu' | 'course' | 'results';

interface Song {
  /** Seconds per scheduler step. */
  step: number;
  /** Schedule everything happening on `step` at time `t` into `bus`. */
  at(core: Core, bus: AudioNode, step: number, t: number): void;
}

/** FM electric-piano / marimba voice. */
function fm(core: Core, bus: AudioNode, midi: number, t: number, dur: number, gain: number, ratio = 2, index = 1.5): void {
  const { ctx } = core;
  const f = mtof(midi);
  const car = ctx.createOscillator();
  const mod = ctx.createOscillator();
  const mg = ctx.createGain();
  const g = ctx.createGain();
  car.frequency.value = f;
  mod.frequency.value = f * ratio;
  mg.gain.setValueAtTime(f * index, t);
  mg.gain.exponentialRampToValueAtTime(f * 0.01, t + dur * 0.6);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  mod.connect(mg).connect(car.frequency);
  car.connect(g).connect(bus);
  car.start(t);
  mod.start(t);
  car.stop(t + dur + 0.02);
  mod.stop(t + dur + 0.02);
}

/** Soft pad note with a slow attack. */
function pad(core: Core, bus: AudioNode, midi: number, t: number, dur: number, gain: number): void {
  tone(core, bus, { type: 'triangle', freq: mtof(midi), t, dur, gain, attack: dur * 0.35 });
}

const bass = (core: Core, bus: AudioNode, midi: number, t: number, dur: number, gain: number): void =>
  tone(core, bus, { type: 'triangle', freq: mtof(midi), t, dur, gain, attack: 0.01 });

const brush = (core: Core, bus: AudioNode, t: number, gain: number): void =>
  noise(core, bus, { filter: 'highpass', freq: 6000, q: 0.5, t, dur: 0.07, gain, attack: 0.015 });

// Chord roots/voicings per bar (C, Am, F, G).
const ROOTS = [48, 45, 41, 43];
const CHORDS = [[60, 64, 67, 71], [57, 60, 64, 67], [60, 65, 69, 72], [59, 62, 67, 71]];
// Menu melody: 8 eighth-notes per bar (0 = rest), pentatonic-ish.
const MELODY = [
  [76, 0, 79, 76, 72, 0, 74, 76],
  [76, 0, 72, 0, 69, 72, 76, 0],
  [77, 0, 76, 72, 77, 0, 81, 77],
  [79, 76, 74, 0, 71, 74, 79, 0],
];

const menu: Song = {
  step: 60 / 112 / 4,
  at(core, bus, s, t) {
    const bar = Math.floor(s / 16) % 4;
    const i = s % 16;
    if ([0, 6, 8, 14].includes(i)) CHORDS[bar].forEach((m) => fm(core, bus, m, t, 0.45, 0.05, 1, 0.9));
    if (i % 2 === 0) {
      const n = MELODY[bar][i / 2];
      if (n) fm(core, bus, n, t, 0.5, 0.09, 4, 1.2);
    }
    if (i === 0 || i === 8) bass(core, bus, ROOTS[bar], t, 0.4, 0.2);
    if (i === 6 || i === 14) bass(core, bus, ROOTS[bar] + 7, t, 0.25, 0.15);
    if (i % 4 === 2) brush(core, bus, t, 0.05);
    else if (i % 2 === 1) brush(core, bus, t, 0.015);
  },
};

const COURSE_CHORDS = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 69]];
const PENTA = [72, 74, 76, 79, 81, 84];

const course: Song = {
  step: 60 / 64 / 2,
  at(core, bus, s, t) {
    const bar = Math.floor(s / 16) % 4;
    const i = s % 16;
    if (i === 0) {
      COURSE_CHORDS[bar].forEach((m, k) => pad(core, bus, m, t + k * 0.05, 7, 0.035));
      bass(core, bus, COURSE_CHORDS[bar][0] - 12, t, 3, 0.1);
    }
    if (i % 4 === 0 && Math.random() < 0.3) {
      fm(core, bus, PENTA[Math.floor(Math.random() * PENTA.length)], t, 1.6, 0.04, 4, 0.8);
    }
  },
};

const FANFARE: Array<[number, number, number]> = [
  // [step, midi, length in steps]
  [0, 67, 2], [2, 72, 2], [4, 76, 2], [6, 79, 6],
  [12, 76, 2], [14, 79, 2], [16, 84, 12],
];

const results: Song = {
  step: 60 / 120 / 4,
  at(core, bus, s, t) {
    if (s < 32) {
      for (const [st, m, len] of FANFARE) {
        if (st === s) {
          fm(core, bus, m, t, len * 0.125 + 0.2, 0.1, 1, 1.4);
          fm(core, bus, m - 12, t, len * 0.125 + 0.2, 0.05, 2, 1);
        }
      }
      if (s === 0 || s === 16) bass(core, bus, s ? 48 : 43, t, 1.5, 0.22);
      if (s === 16) [60, 64, 67, 72].forEach((m) => fm(core, bus, m, t, 1.8, 0.05, 1, 0.8));
      return;
    }
    const l = s - 32;
    const bar = Math.floor(l / 16) % 4;
    const i = l % 16;
    const root = 48 + [0, 5, 7, 0][bar];
    if (i === 0 || i === 8) {
      [0, 4, 7, 12].forEach((o) => fm(core, bus, root + 12 + o, t, 0.9, 0.04, 1, 0.8));
      bass(core, bus, root - 12, t, 0.6, 0.18);
    }
    if (i % 4 === 2) fm(core, bus, root + 24 + [0, 4, 7, 4][(i >> 2) % 4], t, 0.4, 0.06, 4, 1.2);
    if (i % 4 === 2) brush(core, bus, t, 0.03);
  },
};

const SONGS: Record<Track, Song> = { menu, course, results };
const LEVEL: Record<Track, number> = { menu: 0.9, course: 0.8, results: 0.9 };

/** Create a music player bound to the audio core. */
export function createMusic(core: Core) {
  let timer: ReturnType<typeof setInterval> | null = null;
  let song: Song | null = null;
  let bus: GainNode | null = null;
  let step = 0;
  let next = 0;
  let current: Track | null = null;

  const tick = (): void => {
    if (!song || !bus) return;
    const { ctx } = core;
    if (ctx.state !== 'running') {
      next = ctx.currentTime + 0.05;
      return;
    }
    // Catch up after tab throttling instead of bursting old notes.
    if (next < ctx.currentTime - 0.1) next = ctx.currentTime + 0.05;
    while (next < ctx.currentTime + 0.25) {
      try {
        song.at(core, bus, step, next);
      } catch {
        /* ignore */
      }
      step++;
      next += song.step;
    }
  };

  const stopTimer = (): void => {
    if (timer !== null) clearInterval(timer);
    timer = null;
  };

  return {
    /** Switch tracks with a crossfade; null fades out. */
    play(track: Track | null): void {
      if (track === current) return;
      current = track;
      const { ctx } = core;
      const now = ctx.currentTime;
      if (bus) {
        const old = bus;
        old.gain.cancelScheduledValues(now);
        old.gain.setTargetAtTime(0, now, 0.4);
        setTimeout(() => {
          try {
            old.disconnect();
          } catch {
            /* ignore */
          }
        }, 3000);
      }
      stopTimer();
      bus = null;
      song = null;
      if (!track) return;
      bus = ctx.createGain();
      bus.gain.setValueAtTime(0, now);
      bus.gain.setTargetAtTime(clamp(LEVEL[track], 0, 1), now, 0.5);
      bus.connect(core.music);
      song = SONGS[track];
      step = 0;
      next = now + 0.08;
      tick();
      timer = setInterval(tick, 60);
    },
  };
}
