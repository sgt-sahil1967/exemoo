/**
 * Procedural sound designs. Each design is rendered once (per variation) into
 * an AudioBuffer with an OfflineAudioContext by the SoundEngine.
 *
 * Theme: warm wooden dojo — koto plucks, taiko, wood blocks, breathy air.
 */
import type { SfxName } from '../contracts';
import {
  type Rng, crackleBuffer, driveCurve, midiToFreq, noiseHit, perc, sample, tone,
} from './dsp';

export type PluckKind = 'koto' | 'bass' | 'harp';
export type DrumName =
  | 'don' | 'donBig' | 'ka' | 'shime' | 'shaker0' | 'shaker1' | 'shaker2' | 'woodHi' | 'woodLo';

export interface Kit {
  sr: number;
  /** stereo white noise, 3 s */
  noise: AudioBuffer;
  pluck(midi: number, kind?: PluckKind): { buf: AudioBuffer; rate: number };
  drum(name: DrumName): AudioBuffer | undefined;
}

type Render = (ctx: OfflineAudioContext, out: AudioNode, kit: Kit, rng: Rng, variant: number) => void;

export interface SfxDesign {
  /** rendered length (s) */
  dur: number;
  variants: number;
  /** playback gain in dB applied after loudness normalisation */
  db: number;
  /** built-in random pitch variance (± fraction) */
  variance: number;
  maxVoices: number;
  /** reverb send 0..1 */
  send: number;
  /** min seconds between triggers of this sound */
  minGap?: number;
  /** cycle variations in order instead of random (tick/tock) */
  roundRobin?: boolean;
  /** music duck [amount 0..1, hold s] */
  duck?: [number, number];
  /** make the buffer seamlessly loopable (crossfade seconds) */
  loopXfade?: number;
  render: Render;
}

export interface DrumDesign { dur: number; render: Render }

// ------------------------------------------------------------- helpers ---

function pl(ctx: BaseAudioContext, out: AudioNode, kit: Kit, midi: number, t: number, v: number, kind: PluckKind = 'koto'): void {
  const p = kit.pluck(midi, kind);
  sample(ctx, out, p.buf, t, v, p.rate);
}

function drum(ctx: BaseAudioContext, out: AudioNode, kit: Kit, name: DrumName, t: number, v: number, rate = 1): void {
  const b = kit.drum(name);
  if (b) sample(ctx, out, b, t, v, rate);
}

/** Inharmonic struck-metal gong / bell. */
function gong(ctx: BaseAudioContext, out: AudioNode, kit: Kit, t: number, f: number, len: number, v: number, rng: Rng): void {
  const ratios = [1, 1.49, 2.0, 2.41, 2.99, 3.85, 4.72, 5.9];
  const amps = [1, 0.55, 0.5, 0.35, 0.3, 0.2, 0.14, 0.08];
  const bus = ctx.createGain();
  bus.gain.value = v;
  bus.connect(out);
  ratios.forEach((r, i) => {
    const fr = f * r * (1 + (rng() - 0.5) * 0.008);
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(fr * 0.995, t);
    osc.frequency.linearRampToValueAtTime(fr, t + 0.3); // gong "bloom"
    const g = ctx.createGain();
    const d = len * (1 - i * 0.09);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(amps[i], t + 0.012 + i * 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    // slow beating
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.8 + rng() * 2.5;
    const lg = ctx.createGain();
    lg.gain.value = amps[i] * 0.25;
    lfo.connect(lg).connect(g.gain);
    osc.connect(g).connect(bus);
    osc.start(t);
    osc.stop(t + d + 0.05);
    lfo.start(t);
    lfo.stop(t + d + 0.05);
  });
  noiseHit(ctx, bus, kit.noise, { t, d: 0.5, v: 0.12, type: 'bandpass', f: f * 8, q: 0.8 });
  noiseHit(ctx, bus, kit.noise, { t, d: 0.02, v: 0.3, type: 'highpass', f: 2000 });
}

/** Tiny water droplet "plip" — sine with fast upward pitch sweep. */
function droplet(ctx: BaseAudioContext, out: AudioNode, t: number, f: number, v: number): void {
  tone(ctx, out, { f, f2: f * (1.6 + Math.random() * 0.6), glide: 0.018, t, a: 0.001, d: 0.03, v });
}

/** Wet splat layer used by squish/splat/pomegranate. */
function splatLayer(ctx: BaseAudioContext, out: AudioNode, kit: Kit, rng: Rng, t: number, size: number, drops: number, spread: number): void {
  // body: low-passed noise slap with closing filter
  noiseHit(ctx, out, kit.noise, { t, a: 0.002, d: 0.1 + 0.1 * size, v: 1, type: 'lowpass', f: 1800 + 1400 * size, f2: 380, glide: 0.12 + 0.1 * size, q: 1.2 });
  // gurgly mid resonance
  noiseHit(ctx, out, kit.noise, { t: t + 0.004, a: 0.004, d: 0.12 + 0.12 * size, v: 0.45, type: 'bandpass', f: 520 + rng() * 260, f2: 300, q: 4 });
  // fleshy thump
  tone(ctx, out, { f: 150 + rng() * 40, f2: 60, glide: 0.08, t, a: 0.002, d: 0.07 + 0.08 * size, v: 0.55 + 0.25 * size });
  // droplets
  for (let i = 0; i < drops; i++) {
    const dt = t + 0.008 + rng() * spread;
    droplet(ctx, out, dt, 700 + rng() * 1500, 0.12 + rng() * 0.18);
  }
}

// --------------------------------------------------------------- drums ---

export const DRUMS: Record<DrumName, DrumDesign> = {
  don: {
    dur: 0.9,
    render(ctx, out, kit) {
      tone(ctx, out, { f: 118, f2: 64, glide: 0.11, t: 0, a: 0.002, d: 0.65, v: 1 });
      tone(ctx, out, { f: 186, f2: 104, glide: 0.08, t: 0, a: 0.002, d: 0.22, v: 0.35 });
      noiseHit(ctx, out, kit.noise, { t: 0, a: 0.001, d: 0.06, v: 0.55, type: 'lowpass', f: 900, q: 0.7 });
      noiseHit(ctx, out, kit.noise, { t: 0, a: 0.0005, d: 0.012, v: 0.25, type: 'bandpass', f: 2500, q: 1 });
    },
  },
  donBig: {
    dur: 1.6,
    render(ctx, out, kit) {
      tone(ctx, out, { f: 92, f2: 47, glide: 0.18, t: 0, a: 0.003, d: 1.25, v: 1 });
      tone(ctx, out, { f: 148, f2: 76, glide: 0.12, t: 0, a: 0.003, d: 0.4, v: 0.4 });
      noiseHit(ctx, out, kit.noise, { t: 0, a: 0.002, d: 0.16, v: 0.6, type: 'lowpass', f: 700, f2: 200, q: 0.7 });
      noiseHit(ctx, out, kit.noise, { t: 0, a: 0.0005, d: 0.02, v: 0.3, type: 'bandpass', f: 1800, q: 1 });
    },
  },
  ka: {
    // rim hit: dry wooden click
    dur: 0.18,
    render(ctx, out, kit) {
      tone(ctx, out, { f: 1250, t: 0, a: 0.0005, d: 0.035, v: 0.7 });
      tone(ctx, out, { f: 2950, t: 0, a: 0.0005, d: 0.018, v: 0.35 });
      noiseHit(ctx, out, kit.noise, { t: 0, a: 0.0005, d: 0.025, v: 0.8, type: 'bandpass', f: 1900, q: 3 });
    },
  },
  shime: {
    // small high-tension taiko
    dur: 0.3,
    render(ctx, out, kit) {
      tone(ctx, out, { f: 420, f2: 320, glide: 0.05, t: 0, a: 0.001, d: 0.12, v: 0.8 });
      tone(ctx, out, { f: 690, f2: 560, glide: 0.04, t: 0, a: 0.001, d: 0.05, v: 0.3 });
      noiseHit(ctx, out, kit.noise, { t: 0, a: 0.0005, d: 0.03, v: 0.6, type: 'bandpass', f: 2200, q: 1.5 });
    },
  },
  shaker0: { dur: 0.12, render: shaker(6500, 0.045) },
  shaker1: { dur: 0.12, render: shaker(7600, 0.04) },
  shaker2: { dur: 0.14, render: shaker(5600, 0.06) },
  woodHi: { dur: 0.2, render: woodblock(1020) },
  woodLo: { dur: 0.22, render: woodblock(760) },
};

function shaker(f: number, d: number): Render {
  return (ctx, out, kit) => {
    noiseHit(ctx, out, kit.noise, { t: 0, a: 0.008, d, v: 1, type: 'bandpass', f, q: 1.2 });
    noiseHit(ctx, out, kit.noise, { t: 0, a: 0.004, d: d * 0.6, v: 0.5, type: 'highpass', f: 9000, q: 0.7 });
  };
}

function woodblock(f: number): Render {
  return (ctx, out, kit) => {
    tone(ctx, out, { f, t: 0, a: 0.0005, d: 0.075, v: 1 });
    tone(ctx, out, { f: f * 2.57, t: 0, a: 0.0005, d: 0.03, v: 0.35 });
    tone(ctx, out, { f: f * 4.2, t: 0, a: 0.0005, d: 0.012, v: 0.15 });
    noiseHit(ctx, out, kit.noise, { t: 0, a: 0.0003, d: 0.006, v: 0.5, type: 'bandpass', f: 3200, q: 1 });
  };
}

// ----------------------------------------------------------------- sfx ---

export const SFX: Record<SfxName, SfxDesign> = {
  swoosh: {
    dur: 0.45, variants: 4, db: -7, variance: 0.06, maxVoices: 4, send: 0.05, minGap: 0.03,
    render(ctx, out, kit, rng) {
      const d = 0.24 + rng() * 0.12;
      const pk = d * (0.32 + rng() * 0.15);
      const pan = ctx.createStereoPanner();
      const dir = rng() < 0.5 ? -1 : 1;
      pan.pan.setValueAtTime(-0.45 * dir, 0);
      pan.pan.linearRampToValueAtTime(0.45 * dir, d);
      pan.connect(out);
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0, 0);
      amp.gain.linearRampToValueAtTime(1, pk);
      amp.gain.setTargetAtTime(0, pk, (d - pk) / 3.2);
      amp.connect(pan);
      const lo = 380 + rng() * 220, hi = 1700 + rng() * 1500, end = 550 + rng() * 300;
      const mk = (q: number, mult: number, v: number, type: BiquadFilterType = 'bandpass') => {
        const s = ctx.createBufferSource();
        s.buffer = kit.noise;
        const f = ctx.createBiquadFilter();
        f.type = type;
        f.Q.value = q;
        f.frequency.setValueAtTime(lo * mult, 0);
        f.frequency.exponentialRampToValueAtTime(hi * mult, pk);
        f.frequency.exponentialRampToValueAtTime(end * mult, d);
        const g = ctx.createGain();
        g.gain.value = v;
        s.connect(f).connect(g).connect(amp);
        s.start(0, rng() * 2);
        s.stop(d + 0.05);
      };
      mk(0.9 + rng() * 0.5, 1, 1);           // body of the air
      mk(5 + rng() * 3, 1.4, 0.35);          // faint whistle
      mk(0.7, 3.2, 0.18, 'highpass');        // airy top
    },
  },

  slice: {
    dur: 0.32, variants: 4, db: -5, variance: 0.05, maxVoices: 6, send: 0.08, minGap: 0.012,
    render(ctx, out, kit, rng) {
      const t = 0.002;
      const sh = 1 + (rng() - 0.5) * 0.2;
      // schhk: sweeping bright noise
      noiseHit(ctx, out, kit.noise, { t, a: 0.002, d: 0.085, v: 1, type: 'bandpass', f: 7200 * sh, f2: 2600 * sh, glide: 0.07, q: 1.4 });
      // crisp transient
      noiseHit(ctx, out, kit.noise, { t, a: 0.0004, d: 0.018, v: 0.9, type: 'highpass', f: 2500, q: 0.7 });
      // blade ring (inharmonic, short)
      const fr = 3100 * sh;
      tone(ctx, out, { f: fr, t, a: 0.001, d: 0.16, v: 0.1 });
      tone(ctx, out, { f: fr * 1.51, t, a: 0.001, d: 0.11, v: 0.07 });
      tone(ctx, out, { f: fr * 2.23, t, a: 0.001, d: 0.07, v: 0.05 });
      // wet cut
      noiseHit(ctx, out, kit.noise, { t: t + 0.01, a: 0.004, d: 0.07, v: 0.45, type: 'bandpass', f: 1300 * sh, f2: 800, q: 2 });
      tone(ctx, out, { f: 320, f2: 140, glide: 0.05, t, a: 0.001, d: 0.05, v: 0.25 });
    },
  },

  squish: {
    dur: 0.42, variants: 4, db: -5, variance: 0.07, maxVoices: 6, send: 0.04, minGap: 0.01,
    render(ctx, out, kit, rng) {
      splatLayer(ctx, out, kit, rng, 0.002, 0.4 + rng() * 0.3, 3 + Math.floor(rng() * 4), 0.16);
    },
  },

  splat: {
    dur: 0.6, variants: 3, db: -5, variance: 0.06, maxVoices: 4, send: 0.06, minGap: 0.02,
    render(ctx, out, kit, rng) {
      noiseHit(ctx, out, kit.noise, { t: 0.001, a: 0.0005, d: 0.02, v: 0.6, type: 'highpass', f: 1000, q: 0.7 });
      splatLayer(ctx, out, kit, rng, 0.002, 1, 7 + Math.floor(rng() * 4), 0.3);
    },
  },

  thud: {
    dur: 0.32, variants: 4, db: -9, variance: 0.08, maxVoices: 6, send: 0.08, minGap: 0.02,
    render(ctx, out, kit, rng) {
      const f = 165 * (1 + (rng() - 0.5) * 0.3);
      tone(ctx, out, { f: f * 1.08, f2: f * 0.92, glide: 0.06, t: 0, a: 0.001, d: 0.14, v: 1 });
      tone(ctx, out, { f: f * 2.62, t: 0, a: 0.001, d: 0.07, v: 0.45 });
      tone(ctx, out, { f: f * 5.1, t: 0, a: 0.001, d: 0.035, v: 0.22 });
      noiseHit(ctx, out, kit.noise, { t: 0, a: 0.0005, d: 0.03, v: 0.55, type: 'lowpass', f: 1100, q: 0.8 });
      noiseHit(ctx, out, kit.noise, { t: 0.002, a: 0.001, d: 0.05, v: 0.2, type: 'bandpass', f: 420, q: 5 });
    },
  },

  throw: {
    dur: 0.4, variants: 3, db: -15, variance: 0.1, maxVoices: 5, send: 0.04, minGap: 0.02,
    render(ctx, out, kit, rng) {
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0, 0);
      amp.gain.linearRampToValueAtTime(1, 0.1);
      amp.gain.setTargetAtTime(0, 0.12, 0.07);
      amp.connect(out);
      noiseHit(ctx, amp, kit.noise, { t: 0, a: 0.001, d: 0.38, v: 1, type: 'bandpass', f: 240 + rng() * 80, f2: 1000 + rng() * 400, glide: 0.24, q: 2.5 });
      tone(ctx, amp, { f: 170 + rng() * 40, f2: 380, glide: 0.2, t: 0, a: 0.04, d: 0.25, v: 0.25 });
    },
  },

  bombFuse: {
    dur: 2.3, variants: 1, db: -13, variance: 0, maxVoices: 4, send: 0, loopXfade: 0.25,
    render(ctx, out, kit, rng) {
      const cr = crackleBuffer(ctx, 2.3, 55, 0.0, rng);
      // hiss bed with slow flutter
      const hiss = ctx.createBufferSource();
      hiss.buffer = kit.noise;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 2600;
      const hg = ctx.createGain();
      hg.gain.value = 0.32;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 6.5;
      const lg = ctx.createGain();
      lg.gain.value = 0.12;
      lfo.connect(lg).connect(hg.gain);
      hiss.connect(hp).connect(hg).connect(out);
      // sizzle body
      const sz = ctx.createBufferSource();
      sz.buffer = kit.noise;
      sz.playbackRate.value = 0.7;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1100;
      bp.Q.value = 1.2;
      const sg = ctx.createGain();
      sg.gain.value = 0.18;
      sz.connect(bp).connect(sg).connect(out);
      // crackles
      const c = ctx.createBufferSource();
      c.buffer = cr;
      const cf = ctx.createBiquadFilter();
      cf.type = 'bandpass';
      cf.frequency.value = 3800;
      cf.Q.value = 0.7;
      const cg = ctx.createGain();
      cg.gain.value = 1.4;
      c.connect(cf).connect(cg).connect(out);
      for (const s of [hiss, sz, c]) s.start(0);
      lfo.start(0);
    },
  },

  explosion: {
    dur: 2.6, variants: 2, db: -1, variance: 0.05, maxVoices: 2, send: 0.25, duck: [0.65, 0.9],
    render(ctx, out, kit, rng) {
      const sh = ctx.createWaveShaper();
      sh.curve = driveCurve(2.2);
      const pre = ctx.createGain();
      pre.gain.value = 0.9;
      pre.connect(sh).connect(out);
      // crack
      noiseHit(ctx, pre, kit.noise, { t: 0, a: 0.0005, d: 0.06, v: 1, type: 'highpass', f: 900, q: 0.6 });
      // boom
      tone(ctx, pre, { f: 115 + rng() * 15, f2: 36, glide: 0.55, t: 0, a: 0.003, d: 1.3, v: 1 });
      tone(ctx, pre, { f: 72, f2: 30, glide: 0.8, t: 0.01, a: 0.01, d: 1.7, v: 0.6 });
      // body noise closing down
      noiseHit(ctx, pre, kit.noise, { t: 0, a: 0.002, d: 1.7, v: 0.9, type: 'lowpass', f: 3200, f2: 110, glide: 1.3, q: 0.9 });
      // debris rumble tail
      noiseHit(ctx, pre, kit.noise, { t: 0.05, a: 0.15, d: 2.1, v: 0.45, type: 'lowpass', f: 320, q: 1.5, rate: 0.6 });
      // scattered debris crackle
      for (let i = 0; i < 10; i++) {
        noiseHit(ctx, pre, kit.noise, { t: 0.08 + rng() * 0.7, a: 0.001, d: 0.03 + rng() * 0.04, v: 0.12 + rng() * 0.15, type: 'bandpass', f: 1500 + rng() * 3000, q: 2 });
      }
    },
  },

  combo: {
    // rising koto arpeggio; play with pitch=comboPitch(n) for bigger combos
    dur: 1.4, variants: 1, db: -6, variance: 0, maxVoices: 2, send: 0.35,
    render(ctx, out, kit) {
      const notes = [74, 78, 81, 86];
      notes.forEach((m, i) => pl(ctx, out, kit, m, 0.002 + i * 0.055, 0.65 + i * 0.12));
      tone(ctx, out, { f: midiToFreq(98), t: 0.17, a: 0.002, d: 0.5, v: 0.1 });
      tone(ctx, out, { f: midiToFreq(105), t: 0.2, a: 0.002, d: 0.3, v: 0.05 });
    },
  },

  critical: {
    dur: 1.2, variants: 2, db: -6, variance: 0.02, maxVoices: 2, send: 0.4,
    render(ctx, out, kit, rng) {
      const bell = (f: number, t: number, v: number) => {
        [1, 2.76, 5.4, 8.93].forEach((r, i) =>
          tone(ctx, out, { f: f * r, t, a: 0.001, d: [0.8, 0.35, 0.16, 0.08][i], v: v * [0.6, 0.25, 0.1, 0.05][i] }));
      };
      bell(1760, 0.002, 1);
      bell(2637, 0.07, 0.7);
      noiseHit(ctx, out, kit.noise, { t: 0.002, a: 0.0005, d: 0.012, v: 0.4, type: 'highpass', f: 5000 });
      for (let i = 0; i < 9; i++) {
        tone(ctx, out, { f: 4000 + rng() * 4500, t: 0.03 + rng() * 0.4, a: 0.001, d: 0.05 + rng() * 0.05, v: 0.06 + rng() * 0.06 });
      }
    },
  },

  miss: {
    dur: 0.55, variants: 1, db: -9, variance: 0.02, maxVoices: 3, send: 0.15,
    render(ctx, out) {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1600;
      lp.connect(out);
      tone(ctx, lp, { type: 'triangle', f: 466, f2: 330, glide: 0.3, t: 0.002, a: 0.012, d: 0.38, v: 0.9 });
      tone(ctx, lp, { f: 233, f2: 165, glide: 0.3, t: 0.002, a: 0.012, d: 0.3, v: 0.3 });
    },
  },

  lifeLost: {
    dur: 0.75, variants: 1, db: -7, variance: 0, maxVoices: 2, send: 0.1,
    render(ctx, out, kit) {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1300;
      lp.Q.value = 2;
      lp.connect(out);
      for (const t of [0.002, 0.19]) {
        for (const [type, f] of [['sawtooth', 98], ['square', 103.8], ['sawtooth', 146]] as [OscillatorType, number][]) {
          const osc = ctx.createOscillator();
          osc.type = type;
          osc.frequency.setValueAtTime(f * 1.04, t);
          osc.frequency.exponentialRampToValueAtTime(f * 0.96, t + 0.15);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(0.32, t + 0.006);
          g.gain.setValueAtTime(0.3, t + 0.11);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
          osc.connect(g).connect(lp);
          osc.start(t);
          osc.stop(t + 0.2);
        }
        noiseHit(ctx, out, kit.noise, { t, a: 0.001, d: 0.05, v: 0.3, type: 'bandpass', f: 500, q: 2 });
      }
      tone(ctx, out, { f: 80, f2: 50, glide: 0.2, t: 0.002, a: 0.003, d: 0.25, v: 0.5 });
    },
  },

  gameOver: {
    dur: 3.2, variants: 1, db: -5, variance: 0, maxVoices: 1, send: 0.45, duck: [0.7, 2.6],
    render(ctx, out, kit) {
      const seq: [number, number, number][] = [
        [81, 0.0, 0.8], [78, 0.17, 0.72], [76, 0.34, 0.7], [74, 0.52, 0.72],
        [71, 0.74, 0.68], [69, 0.98, 0.7], [66, 1.26, 0.65],
      ];
      for (const [m, t, v] of seq) pl(ctx, out, kit, m, t + 0.002, v);
      // final low chord
      pl(ctx, out, kit, 62, 1.62, 0.9);
      pl(ctx, out, kit, 69, 1.64, 0.5);
      pl(ctx, out, kit, 50, 1.62, 0.8, 'bass');
      drum(ctx, out, kit, 'donBig', 1.62, 0.5);
      tone(ctx, out, { f: midiToFreq(50), t: 1.62, a: 0.3, d: 1.4, v: 0.15 });
    },
  },

  start: {
    dur: 1.5, variants: 1, db: -5, variance: 0, maxVoices: 1, send: 0.35,
    render(ctx, out, kit) {
      [62, 69, 74, 78, 81, 86].forEach((m, i) => pl(ctx, out, kit, m, 0.002 + i * 0.03, 0.6 + i * 0.07));
      drum(ctx, out, kit, 'don', 0.002, 0.8);
      drum(ctx, out, kit, 'ka', 0.002, 0.4);
    },
  },

  countdown: {
    dur: 0.3, variants: 1, db: -6, variance: 0, maxVoices: 2, send: 0.15,
    render(ctx, out, kit) {
      drum(ctx, out, kit, 'woodHi', 0.002, 1, 0.92);
    },
  },

  go: {
    dur: 2.4, variants: 1, db: -3, variance: 0, maxVoices: 1, send: 0.35,
    render(ctx, out, kit, rng) {
      drum(ctx, out, kit, 'donBig', 0.002, 1);
      drum(ctx, out, kit, 'ka', 0.002, 0.5);
      gong(ctx, out, kit, 0.004, 220, 2.2, 0.45, rng);
      pl(ctx, out, kit, 74, 0.01, 0.5);
      pl(ctx, out, kit, 81, 0.02, 0.5);
    },
  },

  menuSelect: {
    dur: 0.8, variants: 1, db: -8, variance: 0, maxVoices: 2, send: 0.3, minGap: 0.04,
    render(ctx, out, kit) {
      pl(ctx, out, kit, 81, 0.002, 0.7);
      pl(ctx, out, kit, 86, 0.055, 0.85);
      drum(ctx, out, kit, 'woodHi', 0.002, 0.25, 1.3);
    },
  },

  hover: {
    dur: 0.08, variants: 2, db: -19, variance: 0.03, maxVoices: 2, send: 0, minGap: 0.035,
    render(ctx, out, kit, _rng, v) {
      tone(ctx, out, { f: v ? 2600 : 2350, t: 0.001, a: 0.0005, d: 0.022, v: 0.6 });
      noiseHit(ctx, out, kit.noise, { t: 0.001, a: 0.0003, d: 0.007, v: 0.5, type: 'bandpass', f: 4500, q: 1.5 });
    },
  },

  freeze: {
    dur: 1.8, variants: 1, db: -5, variance: 0, maxVoices: 1, send: 0.5,
    render(ctx, out, kit, rng) {
      const cr = crackleBuffer(ctx, 0.9, 70, 0, rng);
      const c = ctx.createBufferSource();
      c.buffer = cr;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 3500;
      const cg = ctx.createGain();
      perc(cg.gain, 0, 0.02, 0.8, 0.8);
      c.connect(hp).connect(cg).connect(out);
      c.start(0);
      // icy downward air
      noiseHit(ctx, out, kit.noise, { t: 0, a: 0.06, d: 1.1, v: 0.45, type: 'bandpass', f: 7000, f2: 1600, glide: 1, q: 2 });
      // glassy shimmer cluster
      const pent = [86, 88, 90, 93, 95, 98, 100, 102, 105];
      for (let i = 0; i < 12; i++) {
        const m = pent[Math.floor(rng() * pent.length)];
        tone(ctx, out, { f: midiToFreq(m), t: 0.01 + rng() * 0.55, a: 0.004, d: 0.4 + rng() * 0.6, v: 0.07 + rng() * 0.06 });
      }
      // chord bed
      for (const m of [88, 95, 100]) tone(ctx, out, { f: midiToFreq(m), t: 0.02, a: 0.08, d: 1.4, v: 0.08, detune: (rng() - 0.5) * 12 });
    },
  },

  frenzy: {
    dur: 1.6, variants: 1, db: -4, variance: 0, maxVoices: 1, send: 0.3,
    render(ctx, out, kit, rng) {
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, 0);
      amp.gain.exponentialRampToValueAtTime(1, 0.95);
      amp.gain.setTargetAtTime(0, 1.0, 0.12);
      amp.connect(out);
      noiseHit(ctx, amp, kit.noise, { t: 0, a: 0.001, d: 1.5, v: 0.9, type: 'bandpass', f: 200, f2: 3800, glide: 1.0, q: 1.5 });
      const sh = ctx.createWaveShaper();
      sh.curve = driveCurve(3);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(400, 0);
      lp.frequency.exponentialRampToValueAtTime(3200, 1.0);
      const sg = ctx.createGain();
      sg.gain.value = 0.3;
      sh.connect(lp).connect(sg).connect(amp);
      for (const det of [-10, 10]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.detune.value = det;
        o.frequency.setValueAtTime(70, 0);
        o.frequency.exponentialRampToValueAtTime(300, 1.0);
        o.connect(sh);
        o.start(0);
        o.stop(1.5);
      }
      const cr = crackleBuffer(ctx, 1.4, 50, 0, rng);
      const c = ctx.createBufferSource();
      c.buffer = cr;
      const cf = ctx.createBiquadFilter();
      cf.type = 'bandpass';
      cf.frequency.value = 2600;
      c.connect(cf).connect(amp);
      c.start(0);
      drum(ctx, out, kit, 'don', 0.98, 0.9);
      drum(ctx, out, kit, 'ka', 0.98, 0.4);
    },
  },

  double: {
    dur: 1.3, variants: 1, db: -6, variance: 0, maxVoices: 1, send: 0.3,
    render(ctx, out, kit, rng) {
      const coin = (m1: number, m2: number, t: number, v: number) => {
        for (const [m, dt, d] of [[m1, 0, 0.07], [m2, 0.06, 0.4]] as [number, number, number][]) {
          const f = midiToFreq(m);
          tone(ctx, out, { f, t: t + dt, a: 0.001, d, v: v * 0.6 });
          tone(ctx, out, { type: 'square', f, t: t + dt, a: 0.001, d: d * 0.6, v: v * 0.08 });
          tone(ctx, out, { f: f * 2.76, t: t + dt, a: 0.001, d: d * 0.4, v: v * 0.1 });
        }
      };
      coin(81, 86, 0.002, 0.9);
      coin(86, 93, 0.12, 0.8);
      coin(90, 98, 0.24, 0.85);
      for (let i = 0; i < 6; i++) tone(ctx, out, { f: 5000 + rng() * 3000, t: 0.3 + rng() * 0.4, a: 0.001, d: 0.05, v: 0.06 });
    },
  },

  pomegranateHit: {
    dur: 0.3, variants: 3, db: -6, variance: 0.04, maxVoices: 4, send: 0.06, minGap: 0.02,
    render(ctx, out, kit, rng) {
      tone(ctx, out, { f: 680 + rng() * 120, f2: 210, glide: 0.04, t: 0.001, a: 0.001, d: 0.07, v: 0.85 });
      noiseHit(ctx, out, kit.noise, { t: 0.001, a: 0.001, d: 0.05, v: 0.5, type: 'bandpass', f: 1500, q: 1.5 });
      noiseHit(ctx, out, kit.noise, { t: 0.001, a: 0.001, d: 0.08, v: 0.5, type: 'lowpass', f: 1200, f2: 400, q: 1 });
      droplet(ctx, out, 0.02 + rng() * 0.03, 900 + rng() * 800, 0.2);
      droplet(ctx, out, 0.05 + rng() * 0.05, 900 + rng() * 800, 0.15);
    },
  },

  pomegranateBurst: {
    dur: 2.0, variants: 1, db: -3, variance: 0, maxVoices: 1, send: 0.35, duck: [0.4, 0.6],
    render(ctx, out, kit, rng) {
      splatLayer(ctx, out, kit, rng, 0.002, 1.3, 14, 0.5);
      splatLayer(ctx, out, kit, rng, 0.05, 0.8, 6, 0.4);
      [86, 90, 93, 98, 102].forEach((m, i) => pl(ctx, out, kit, m, 0.06 + i * 0.05, 0.55 + i * 0.05));
      tone(ctx, out, { f: midiToFreq(98), t: 0.3, a: 0.002, d: 0.9, v: 0.12 });
      tone(ctx, out, { f: midiToFreq(98) * 2.76, t: 0.3, a: 0.002, d: 0.3, v: 0.04 });
    },
  },

  newBest: {
    dur: 3.0, variants: 1, db: -4, variance: 0, maxVoices: 1, send: 0.4, duck: [0.6, 2.0],
    render(ctx, out, kit, rng) {
      const strum = (notes: number[], t: number, v: number) =>
        notes.forEach((m, i) => pl(ctx, out, kit, m, t + i * 0.014, v * (0.8 + i * 0.07)));
      const D = [62, 66, 69, 74], G = [67, 71, 74, 79], A = [69, 73, 76, 81], D2 = [74, 78, 81, 86, 90];
      strum(D, 0.002, 0.55);
      strum(D, 0.15, 0.55);
      strum(D, 0.3, 0.6);
      strum(G, 0.48, 0.8);
      strum(A, 0.86, 0.75);
      strum(D2, 1.2, 0.9);
      drum(ctx, out, kit, 'don', 0.48, 0.7);
      drum(ctx, out, kit, 'don', 0.86, 0.6);
      drum(ctx, out, kit, 'donBig', 1.2, 0.8);
      for (const t of [0.002, 0.15, 0.3]) drum(ctx, out, kit, 'ka', t, 0.35);
      for (let i = 0; i < 10; i++) tone(ctx, out, { f: 3500 + rng() * 4500, t: 1.22 + rng() * 0.8, a: 0.001, d: 0.08, v: 0.05 });
      tone(ctx, out, { f: midiToFreq(98), t: 1.22, a: 0.002, d: 1.2, v: 0.1 });
    },
  },

  connect: {
    dur: 0.8, variants: 1, db: -7, variance: 0, maxVoices: 1, send: 0.3,
    render(ctx, out, kit) {
      for (const [m, t] of [[76, 0.002], [83, 0.1]]) {
        const f = midiToFreq(m);
        tone(ctx, out, { f, t, a: 0.003, d: 0.45, v: 0.6 });
        tone(ctx, out, { f: f * 2, t, a: 0.002, d: 0.18, v: 0.18 });
        tone(ctx, out, { f: f * 3.01, t, a: 0.001, d: 0.06, v: 0.08 });
        pl(ctx, out, kit, m, t, 0.4);
      }
    },
  },

  disconnect: {
    dur: 0.8, variants: 1, db: -8, variance: 0, maxVoices: 1, send: 0.3,
    render(ctx, out) {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2200;
      lp.connect(out);
      for (const [m, t] of [[83, 0.002], [76, 0.13]]) {
        const f = midiToFreq(m);
        tone(ctx, lp, { type: 'triangle', f, f2: f * 0.985, glide: 0.3, t, a: 0.006, d: 0.4, v: 0.7 });
        tone(ctx, lp, { f: f * 0.5, t, a: 0.006, d: 0.3, v: 0.2 });
      }
    },
  },

  tick: {
    dur: 0.1, variants: 2, db: -9, variance: 0, maxVoices: 2, send: 0.05, roundRobin: true, minGap: 0.05,
    render(ctx, out, kit, _rng, v) {
      const f = v ? 1500 : 2100;
      tone(ctx, out, { f, t: 0.001, a: 0.0005, d: 0.02, v: 0.7 });
      tone(ctx, out, { f: f * 2.6, t: 0.001, a: 0.0005, d: 0.007, v: 0.3 });
      noiseHit(ctx, out, kit.noise, { t: 0.001, a: 0.0003, d: 0.005, v: 0.6, type: 'highpass', f: 3000 });
    },
  },

  timeUp: {
    dur: 3.2, variants: 1, db: -3, variance: 0, maxVoices: 1, send: 0.4, duck: [0.6, 2.2],
    render(ctx, out, kit, rng) {
      drum(ctx, out, kit, 'donBig', 0.002, 1, 0.9);
      gong(ctx, out, kit, 0.004, 130, 3.0, 0.55, rng);
    },
  },
};

/**
 * Pitch multiplier for the `combo` sound so bigger combos climb the
 * pentatonic scale: comboPitch(3) = 1, each extra fruit = next scale step.
 */
export function comboPitch(count: number): number {
  const steps = [0, 2, 4, 7, 9];
  const k = Math.max(0, Math.min(8, Math.round(count) - 3));
  const semis = 12 * Math.floor(k / 5) + steps[k % 5];
  return Math.pow(2, semis / 12);
}
