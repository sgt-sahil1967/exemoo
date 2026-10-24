/**
 * Low-level DSP helpers shared by the SFX renderer, the music sequencer and
 * the audio demo. Everything here is allocation-light and context-agnostic
 * (works with both realtime AudioContext and OfflineAudioContext).
 */

export type Rng = () => number;

/** Small fast seeded PRNG (mulberry32). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const midiToFreq = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);
export const dbToGain = (db: number): number => Math.pow(10, db / 20);
export const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;
export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length) % arr.length];
}

/** Create an AudioBuffer from raw channel data. */
export function makeBuffer(ctx: BaseAudioContext, channels: Float32Array[], sr: number): AudioBuffer {
  const len = Math.max(1, channels[0].length);
  const b = ctx.createBuffer(channels.length, len, sr);
  for (let c = 0; c < channels.length; c++) b.getChannelData(c).set(channels[c]);
  return b;
}

/** White noise buffer (decorrelated channels). */
export function noiseBuffer(ctx: BaseAudioContext, dur: number, channels: number, rng: Rng): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = Math.ceil(dur * sr);
  const b = ctx.createBuffer(channels, len, sr);
  for (let c = 0; c < channels; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = rng() * 2 - 1;
  }
  return b;
}

/**
 * Crackle buffer: soft hiss bed with sparse random impulses (fuse sparks,
 * ice cracks, fire). `rate` = impulses per second.
 */
export function crackleBuffer(
  ctx: BaseAudioContext, dur: number, rate: number, hiss: number, rng: Rng,
): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = Math.ceil(dur * sr);
  const b = ctx.createBuffer(2, len, sr);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (rng() * 2 - 1) * hiss;
    const count = Math.round(rate * dur);
    for (let k = 0; k < count; k++) {
      const at = Math.floor(rng() * len);
      const amp = (0.25 + 0.75 * rng() * rng()) * (rng() < 0.5 ? -1 : 1);
      const decay = (0.0006 + rng() * 0.003) * sr;
      const n = Math.min(len - at, Math.ceil(decay * 5));
      for (let i = 0; i < n; i++) {
        d[at + i] += amp * Math.exp(-i / decay) * (rng() * 2 - 1);
      }
    }
  }
  return b;
}

// --------------------------------------------------------- Karplus-Strong ---

export interface PluckOpts {
  /** Excitation brightness 0..1 (pick hardness). */
  bright?: number;
  /** Seconds to decay by 60 dB at the fundamental. */
  t60?: number;
  /** Loop filter weight 0.5..1 (0.5 = most damping of highs, 1 = none). */
  stretch?: number;
  /** Pluck position 0..0.5 as a fraction of string length (comb filter). */
  pick?: number;
  /** Rendered duration in seconds. */
  dur?: number;
  /** Plectrum click amount 0..1. */
  click?: number;
  /** Sine sub layer amount (bass weight) 0..1. */
  sub?: number;
}

/**
 * Karplus-Strong plucked string rendered in JS. Returns the data plus the
 * frequency it actually sounds at (integer delay line), so callers can
 * correct pitch exactly with playbackRate.
 */
export function ksPluck(sr: number, freq: number, rng: Rng, o: PluckOpts = {}): { data: Float32Array; freq: number } {
  const S = clamp(o.stretch ?? 0.5, 0.5, 0.99);
  const N = Math.max(4, Math.round(sr / freq + (1 - S)));
  const actual = sr / (N - (1 - S));
  const len = Math.ceil((o.dur ?? 1.5) * sr);
  const out = new Float32Array(len);
  const ring = new Float32Array(N);

  // Excitation: one-pole low-passed noise burst.
  const a = 0.06 + 0.9 * clamp(o.bright ?? 0.6, 0, 1);
  let lp = 0;
  for (let i = 0; i < N; i++) {
    lp += a * (rng() * 2 - 1 - lp);
    ring[i] = lp;
  }
  // Pluck position comb.
  const P = Math.max(1, Math.round(N * clamp(o.pick ?? 0.14, 0.02, 0.5)));
  const copy = ring.slice();
  let mean = 0;
  for (let i = 0; i < N; i++) {
    ring[i] = copy[i] - 0.92 * copy[(i - P + N) % N];
    mean += ring[i];
  }
  mean /= N;
  let pk = 1e-9;
  for (let i = 0; i < N; i++) {
    ring[i] -= mean;
    pk = Math.max(pk, Math.abs(ring[i]));
  }
  for (let i = 0; i < N; i++) ring[i] /= pk;

  const rho = Math.pow(0.001, 1 / (Math.max(0.05, o.t60 ?? 1.2) * actual));
  let idx = 0;
  for (let n = 0; n < len; n++) {
    const cur = ring[idx];
    const nx = idx + 1 === N ? 0 : idx + 1;
    out[n] = cur;
    ring[idx] = rho * (S * cur + (1 - S) * ring[nx]);
    idx = nx;
  }

  // Plectrum click: short differentiated noise burst.
  const click = o.click ?? 0.25;
  if (click > 0) {
    const cl = Math.floor(sr * 0.004);
    let prev = 0;
    for (let i = 0; i < cl && i < len; i++) {
      const x = rng() * 2 - 1;
      out[i] += click * (x - prev) * 0.5 * Math.exp(-i / (cl * 0.25));
      prev = x;
    }
  }
  // Sine sub (bass body).
  const sub = o.sub ?? 0;
  if (sub > 0) {
    const w = (2 * Math.PI * actual) / sr;
    const dec = sr * Math.max(0.1, (o.t60 ?? 1.2) * 0.3);
    const att = sr * 0.004;
    for (let n = 0; n < len; n++) {
      out[n] += sub * Math.sin(w * n) * Math.exp(-n / dec) * Math.min(1, n / att);
    }
  }
  // Normalise + tail fade.
  let peak = 1e-9;
  for (let n = 0; n < len; n++) peak = Math.max(peak, Math.abs(out[n]));
  const g = 0.9 / peak;
  const fade = Math.min(len, Math.floor(sr * 0.03));
  for (let n = 0; n < len; n++) {
    let v = out[n] * g;
    const r = len - n;
    if (r < fade) v *= r / fade;
    out[n] = v;
  }
  return { data: out, freq: actual };
}

// ----------------------------------------------------------- reverb IR ---

/** Stereo room/hall impulse: early taps + exponentially decaying darkening noise. */
export function makeImpulse(ctx: BaseAudioContext, dur: number, rng: Rng): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = Math.ceil(dur * sr);
  const b = ctx.createBuffer(2, len, sr);
  const pre = Math.floor(0.014 * sr);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    let lp = 0;
    for (let i = pre; i < len; i++) {
      const t = (i - pre) / sr;
      const env = Math.exp((-6.9 * t) / (dur * 0.85));
      // brightness falls with time: one-pole coefficient from 0.85 to 0.12
      const k = 0.12 + 0.73 * Math.exp(-t * 3.2);
      lp += k * (rng() * 2 - 1 - lp);
      d[i] = lp * env;
    }
    // early reflections (wooden room)
    for (let e = 0; e < 9; e++) {
      const at = pre + Math.floor((0.004 + rng() * 0.07) * sr);
      if (at < len) d[at] += (rng() < 0.5 ? -1 : 1) * (0.5 - e * 0.04);
    }
    // fade in to avoid hard edge, fade end
    const fi = Math.floor(0.004 * sr);
    for (let i = 0; i < fi; i++) d[pre + i] *= i / fi;
    let e2 = 0;
    for (let i = 0; i < len; i++) e2 += d[i] * d[i];
    const g = 1 / Math.sqrt(e2 || 1);
    for (let i = 0; i < len; i++) d[i] *= g;
  }
  return b;
}

// ------------------------------------------------------- node helpers ---

/** Percussive AD envelope on a gain param. */
export function perc(p: AudioParam, t: number, a: number, peak: number, d: number): void {
  p.setValueAtTime(0.0001, t);
  p.linearRampToValueAtTime(Math.max(0.0002, peak), t + Math.max(0.0005, a));
  p.exponentialRampToValueAtTime(0.0001, t + Math.max(0.0005, a) + Math.max(0.005, d));
}

export interface ToneOpts {
  type?: OscillatorType;
  f: number;
  /** glide target frequency */
  f2?: number;
  glide?: number;
  t: number;
  a?: number;
  d: number;
  v: number;
  detune?: number;
}

/** Oscillator with optional exponential pitch glide and AD envelope. */
export function tone(ctx: BaseAudioContext, dest: AudioNode, o: ToneOpts): OscillatorNode {
  const osc = ctx.createOscillator();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.f, o.t);
  if (o.f2 !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f2), o.t + (o.glide ?? o.d));
  if (o.detune) osc.detune.value = o.detune;
  const g = ctx.createGain();
  const a = o.a ?? 0.002;
  perc(g.gain, o.t, a, o.v, o.d);
  osc.connect(g).connect(dest);
  osc.start(o.t);
  osc.stop(o.t + a + o.d + 0.05);
  return osc;
}

export interface NoiseOpts {
  t: number;
  a?: number;
  d: number;
  v: number;
  type?: BiquadFilterType;
  f: number;
  f2?: number;
  glide?: number;
  q?: number;
  rate?: number;
}

/** Filtered noise burst with optional filter sweep. */
export function noiseHit(ctx: BaseAudioContext, dest: AudioNode, noise: AudioBuffer, o: NoiseOpts): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  if (o.rate) src.playbackRate.value = o.rate;
  const f = ctx.createBiquadFilter();
  f.type = o.type ?? 'bandpass';
  f.Q.value = o.q ?? 1;
  f.frequency.setValueAtTime(o.f, o.t);
  if (o.f2 !== undefined) f.frequency.exponentialRampToValueAtTime(Math.max(10, o.f2), o.t + (o.glide ?? o.d));
  const g = ctx.createGain();
  const a = o.a ?? 0.002;
  perc(g.gain, o.t, a, o.v, o.d);
  src.connect(f).connect(g).connect(dest);
  const off = Math.random() * Math.max(0, noise.duration - 0.5);
  src.start(o.t, off);
  src.stop(o.t + a + o.d + 0.05);
  return src;
}

/** Play an AudioBuffer once. */
export function sample(ctx: BaseAudioContext, dest: AudioNode, buf: AudioBuffer, t: number, v: number, rate = 1): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = rate;
  const g = ctx.createGain();
  g.gain.value = v;
  src.connect(g).connect(dest);
  src.start(t);
  return src;
}

/** tanh soft-saturation curve for a WaveShaperNode. */
export function driveCurve(drive: number, n = 1024): Float32Array<ArrayBuffer> {
  const c = new Float32Array(n);
  const norm = Math.tanh(drive);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = Math.tanh(x * drive) / norm;
  }
  return c;
}

// ---------------------------------------------------------- analysis ---

export interface BufferStats {
  duration: number;
  peak: number;
  /** max RMS over 30 ms windows */
  loud: number;
  /** whole-buffer RMS */
  rms: number;
  /** spectral centroid (Hz) around the loudest window */
  centroid: number;
  nan: boolean;
}

/** Mixdown helper (mono view of a buffer). */
export function monoData(b: AudioBuffer): Float32Array {
  const len = b.length;
  const out = new Float32Array(len);
  for (let c = 0; c < b.numberOfChannels; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < len; i++) out[i] += d[i] / b.numberOfChannels;
  }
  return out;
}

export function peakOf(b: AudioBuffer): number {
  let p = 0;
  for (let c = 0; c < b.numberOfChannels; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < d.length; i++) {
      const v = Math.abs(d[i]);
      if (v > p) p = v;
    }
  }
  return p;
}

/** Max short-term RMS (30 ms windows, hop 10 ms) across all channels. */
export function loudnessOf(b: AudioBuffer): { loud: number; at: number } {
  const sr = b.sampleRate;
  const win = Math.max(16, Math.floor(sr * 0.03));
  const hop = Math.max(8, Math.floor(sr * 0.01));
  let best = 0;
  let at = 0;
  const chans: Float32Array[] = [];
  for (let c = 0; c < b.numberOfChannels; c++) chans.push(b.getChannelData(c));
  for (let s = 0; s + win <= b.length || s === 0; s += hop) {
    let e = 0;
    const end = Math.min(b.length, s + win);
    for (const d of chans) for (let i = s; i < end; i++) e += d[i] * d[i];
    const r = Math.sqrt(e / (Math.max(1, end - s) * chans.length));
    if (r > best) {
      best = r;
      at = s;
    }
    if (end >= b.length) break;
  }
  return { loud: best, at };
}

/** Radix-2 magnitude spectrum (in-place FFT). */
function fftMag(x: Float32Array): Float32Array {
  const n = x.length;
  const re = Float64Array.from(x);
  const im = new Float64Array(n);
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < len / 2; k++) {
        const wr = Math.cos(ang * k), wi = Math.sin(ang * k);
        const ar = re[i + k + len / 2], ai = im[i + k + len / 2];
        const tr = ar * wr - ai * wi, ti = ar * wi + ai * wr;
        re[i + k + len / 2] = re[i + k] - tr;
        im[i + k + len / 2] = im[i + k] - ti;
        re[i + k] += tr;
        im[i + k] += ti;
      }
    }
  }
  const mag = new Float32Array(n / 2);
  for (let i = 0; i < n / 2; i++) mag[i] = Math.hypot(re[i], im[i]);
  return mag;
}

export function statsOf(b: AudioBuffer): BufferStats {
  const mono = monoData(b);
  let nan = false;
  let e = 0;
  for (let i = 0; i < mono.length; i++) {
    if (!Number.isFinite(mono[i])) nan = true;
    e += mono[i] * mono[i];
  }
  const { loud, at } = loudnessOf(b);
  const N = 4096;
  const seg = new Float32Array(N);
  for (let i = 0; i < N && at + i < mono.length; i++) {
    seg[i] = mono[at + i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)));
  }
  const mag = fftMag(seg);
  let num = 0, den = 0;
  for (let i = 1; i < mag.length; i++) {
    const f = (i * b.sampleRate) / N;
    num += f * mag[i];
    den += mag[i];
  }
  return {
    duration: b.duration,
    peak: peakOf(b),
    loud,
    rms: Math.sqrt(e / Math.max(1, mono.length)),
    centroid: den > 0 ? num / den : 0,
    nan,
  };
}
