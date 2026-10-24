/** Core WebAudio graph and small synthesis helpers shared by the audio modules. */

export interface Core {
  ctx: AudioContext;
  master: GainNode;
  music: GainNode;
  sfx: GainNode;
  noiseBuf: AudioBuffer;
}

export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
export const rand = (lo: number, hi: number): number => lo + Math.random() * (hi - lo);

/** MIDI note number to frequency in Hz. */
export const mtof = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);

/** Create the context and bus graph; returns null when WebAudio is unavailable. */
export function createCore(): Core | null {
  try {
    const g = globalThis as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const Ctor = g.AudioContext ?? g.webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    const master = ctx.createGain();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 20;
    comp.ratio.value = 3;
    comp.attack.value = 0.005;
    comp.release.value = 0.2;
    master.connect(comp).connect(ctx.destination);
    const music = ctx.createGain();
    const sfx = ctx.createGain();
    music.connect(master);
    sfx.connect(master);
    const len = ctx.sampleRate * 2;
    const noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return { ctx, master, music, sfx, noiseBuf };
  } catch {
    return null;
  }
}

export interface ToneOpts {
  type?: OscillatorType;
  freq: number;
  freqEnd?: number;
  t: number;
  dur: number;
  gain: number;
  attack?: number;
}

/** One-shot oscillator with an attack/exponential-decay envelope. */
export function tone(core: Core, dest: AudioNode, o: ToneOpts): void {
  const { ctx } = core;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.freq, o.t);
  if (o.freqEnd) osc.frequency.exponentialRampToValueAtTime(o.freqEnd, o.t + o.dur);
  const a = Math.min(o.attack ?? 0.004, o.dur * 0.5);
  g.gain.setValueAtTime(0.0001, o.t);
  g.gain.linearRampToValueAtTime(o.gain, o.t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, o.t + o.dur);
  osc.connect(g).connect(dest);
  osc.start(o.t);
  osc.stop(o.t + o.dur + 0.02);
}

export interface NoiseOpts {
  filter?: BiquadFilterType;
  freq: number;
  freqEnd?: number;
  q?: number;
  t: number;
  dur: number;
  gain: number;
  attack?: number;
}

/** One-shot filtered noise burst. */
export function noise(core: Core, dest: AudioNode, o: NoiseOpts): void {
  const { ctx } = core;
  const src = ctx.createBufferSource();
  src.buffer = core.noiseBuf;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = o.filter ?? 'bandpass';
  f.Q.value = o.q ?? 0.8;
  f.frequency.setValueAtTime(o.freq, o.t);
  if (o.freqEnd) f.frequency.exponentialRampToValueAtTime(o.freqEnd, o.t + o.dur);
  const g = ctx.createGain();
  const a = Math.min(o.attack ?? 0.003, o.dur * 0.5);
  g.gain.setValueAtTime(0.0001, o.t);
  g.gain.linearRampToValueAtTime(o.gain, o.t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, o.t + o.dur);
  src.connect(f).connect(g).connect(dest);
  src.start(o.t, rand(0, 1.5));
  src.stop(o.t + o.dur + 0.02);
}

/** Bell-like partial stack (inharmonic) for chimes and clangs. */
export function bell(core: Core, dest: AudioNode, freq: number, t: number, dur: number, gain: number): void {
  tone(core, dest, { freq, t, dur, gain });
  tone(core, dest, { freq: freq * 2.76, t, dur: dur * 0.5, gain: gain * 0.3 });
  tone(core, dest, { freq: freq * 5.4, t, dur: dur * 0.25, gain: gain * 0.12 });
}
