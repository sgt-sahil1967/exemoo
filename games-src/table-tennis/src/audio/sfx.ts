/**
 * SPINSHOT sound effects — everything synthesized with WebAudio (no samples).
 * Graph: voices → sfxGain ─┐
 *        music  → musicGain ┴→ masterGain → compressor → destination
 * The AudioContext is created lazily in unlock() (call on the first user gesture).
 */
import type { StrokeKind } from '../core/contracts';
import { Music, type TrackName } from './music';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const rand = (a: number, b: number): number => a + Math.random() * (b - a);

export class Sfx {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicGain!: GainNode;
  private sfxGain!: GainNode;
  private comp!: DynamicsCompressorNode;
  private white!: AudioBuffer;
  private pink!: AudioBuffer;
  private musicEngine: Music | null = null;
  private wantTrack: TrackName | null = null;
  private vol = { master: 0.8, music: 0.4, sfx: 0.9 };
  private crowdNodes: { gain: GainNode; srcs: AudioScheduledSourceNode[]; nodes: AudioNode[] } | null = null;
  private crowdLevel = 0;
  private lastUi = 0;
  private slowPulse: { env: GainNode; stop: (t: number) => void } | null = null;

  // ─────────────────────────── setup ───────────────────────────
  unlock(): void {
    if (!this.ctx) {
      const AC: typeof AudioContext | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC({ latencyHint: 'interactive' });
      this.ctx = ctx;
      this.comp = ctx.createDynamicsCompressor();
      this.comp.threshold.value = -14;
      this.comp.knee.value = 10;
      this.comp.ratio.value = 4;
      this.comp.attack.value = 0.004;
      this.comp.release.value = 0.2;
      this.master = ctx.createGain();
      this.musicGain = ctx.createGain();
      this.sfxGain = ctx.createGain();
      this.musicGain.connect(this.master);
      this.sfxGain.connect(this.master);
      this.master.connect(this.comp).connect(ctx.destination);
      this.white = this.makeNoise(2, false);
      this.pink = this.makeNoise(4, true);
      this.applyVolumes(true);
      this.musicEngine = new Music(ctx, this.musicGain, this.white);
      if (this.wantTrack) this.musicEngine.play(this.wantTrack, 2);
      if (this.crowdLevel > 0) this.crowd(this.crowdLevel);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  /** Addition: true once the AudioContext exists and is running. */
  get ready(): boolean {
    return !!this.ctx && this.ctx.state === 'running';
  }

  setVolumes(master: number, music: number, sfx: number): void {
    this.vol = { master: clamp01(master), music: clamp01(music), sfx: clamp01(sfx) };
    this.applyVolumes(false);
  }

  private applyVolumes(immediate: boolean): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const set = (p: AudioParam, v: number) => {
      p.cancelScheduledValues(t);
      if (immediate) p.setValueAtTime(v, t);
      else p.setTargetAtTime(v, t, 0.05);
    };
    // perceptual curve
    set(this.master.gain, Math.pow(this.vol.master, 1.6));
    set(this.musicGain.gain, Math.pow(this.vol.music, 1.6) * 0.55);
    set(this.sfxGain.gain, Math.pow(this.vol.sfx, 1.6));
  }

  private makeNoise(seconds: number, pink: boolean): AudioBuffer {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (!pink) {
        d[i] = w;
        continue;
      }
      // Paul Kellet's pink noise filter
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
    // smooth loop seam
    const fade = Math.min(2048, len >> 4);
    for (let i = 0; i < fade; i++) {
      const k = i / fade;
      d[len - fade + i] = d[len - fade + i] * (1 - k) + d[i] * k;
    }
    return buf;
  }

  // ─────────────────────────── voice helpers ───────────────────────────
  private now(): number {
    return this.ctx!.currentTime + 0.002;
  }

  /** Disconnect all nodes when the source ends. */
  private done(src: AudioScheduledSourceNode, nodes: AudioNode[]): void {
    src.onended = () => {
      for (const n of nodes) n.disconnect();
    };
  }

  private noiseBurst(
    time: number,
    opts: { type: BiquadFilterType; freq: number; q?: number; gain: number; attack?: number; decay: number; freqEnd?: number; pink?: boolean; dest?: AudioNode },
  ): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = opts.pink ? this.pink : this.white;
    const f = ctx.createBiquadFilter();
    f.type = opts.type;
    f.frequency.setValueAtTime(opts.freq, time);
    if (opts.freqEnd) f.frequency.exponentialRampToValueAtTime(opts.freqEnd, time + (opts.attack ?? 0.001) + opts.decay);
    f.Q.value = opts.q ?? 1;
    const g = ctx.createGain();
    const a = opts.attack ?? 0.001;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(opts.gain, time + a);
    g.gain.exponentialRampToValueAtTime(0.0001, time + a + opts.decay);
    src.connect(f).connect(g).connect(opts.dest ?? this.sfxGain);
    const dur = a + opts.decay + 0.02;
    src.start(time, Math.max(0, Math.random() * (src.buffer!.duration - dur - 0.01)), dur);
    this.done(src, [src, f, g]);
  }

  private tone(
    time: number,
    opts: { type?: OscillatorType; freq: number; freqEnd?: number; gain: number; attack?: number; decay: number; sustain?: number; dest?: AudioNode; detune?: number },
  ): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = opts.type ?? 'sine';
    o.frequency.setValueAtTime(opts.freq, time);
    if (opts.freqEnd) o.frequency.exponentialRampToValueAtTime(opts.freqEnd, time + (opts.attack ?? 0.002) + opts.decay);
    if (opts.detune) o.detune.value = opts.detune;
    const g = ctx.createGain();
    const a = opts.attack ?? 0.002;
    const hold = opts.sustain ?? 0;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(opts.gain, time + a);
    if (hold) g.gain.setValueAtTime(opts.gain, time + a + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, time + a + hold + opts.decay);
    o.connect(g).connect(opts.dest ?? this.sfxGain);
    o.start(time);
    o.stop(time + a + hold + opts.decay + 0.03);
    this.done(o, [o, g]);
  }

  // ─────────────────────────── game sounds ───────────────────────────
  paddleHit(power: number, kind: StrokeKind): void {
    if (!this.ctx) return;
    const t = this.now();
    const p = clamp01(power);
    const soft = kind === 'push' || kind === 'chop' || kind === 'block' || kind === 'lob';
    const smash = kind === 'smash' || p > 0.92;
    const vol = (0.3 + 0.7 * p) * (soft ? 0.65 : 1);
    const bright = soft ? 0.8 : 1 + p * 0.25;
    const pv = rand(0.97, 1.03);
    // woody resonant "pock" body
    this.tone(t, { type: 'sine', freq: 1250 * bright * pv, freqEnd: 1050 * bright * pv, gain: 0.32 * vol, decay: 0.055 + p * 0.02 });
    this.tone(t, { type: 'triangle', freq: 2350 * bright * pv, freqEnd: 2100 * bright * pv, gain: 0.14 * vol, decay: 0.035 });
    this.tone(t, { type: 'sine', freq: 190, freqEnd: 120, gain: 0.25 * vol, decay: 0.05 });
    // contact click
    this.noiseBurst(t, { type: 'bandpass', freq: 1800 + p * 1200, q: 1.3, gain: 0.55 * vol, decay: soft ? 0.025 : 0.04 });
    if (smash) {
      this.noiseBurst(t, { type: 'highpass', freq: 2500, gain: 0.35 * vol, decay: 0.09 });
      this.noiseBurst(t + 0.006, { type: 'bandpass', freq: 900, q: 0.8, gain: 0.3 * vol, decay: 0.07 });
    }
  }

  tableBounce(speed: number): void {
    if (!this.ctx) return;
    const t = this.now();
    const v = clamp01(speed / 10) * 0.85 + 0.15;
    const pv = rand(0.95, 1.06);
    this.tone(t, { type: 'sine', freq: 2900 * pv, freqEnd: 2600 * pv, gain: 0.2 * v, decay: 0.03 });
    this.tone(t, { type: 'triangle', freq: 1650 * pv, freqEnd: 1450 * pv, gain: 0.12 * v, decay: 0.045 });
    this.tone(t, { type: 'sine', freq: 420, freqEnd: 260, gain: 0.16 * v, decay: 0.04 });
    this.noiseBurst(t, { type: 'bandpass', freq: 4200, q: 1.5, gain: 0.4 * v, decay: 0.018 });
  }

  netHit(): void {
    if (!this.ctx) return;
    const t = this.now();
    this.tone(t, { type: 'sine', freq: 120, freqEnd: 70, gain: 0.4, decay: 0.14 });
    this.noiseBurst(t, { type: 'lowpass', freq: 650, gain: 0.55, decay: 0.12, pink: true });
    // rattle of the net cord
    for (let i = 0; i < 5; i++) {
      this.noiseBurst(t + 0.02 + i * rand(0.018, 0.03), { type: 'bandpass', freq: rand(2500, 4500), q: 3, gain: 0.1 * (1 - i / 6), decay: 0.012 });
    }
  }

  floorBounce(speed: number): void {
    if (!this.ctx) return;
    const t = this.now();
    const v = clamp01(speed / 8) * 0.8 + 0.2;
    const pv = rand(0.94, 1.06);
    this.tone(t, { type: 'sine', freq: 720 * pv, freqEnd: 480 * pv, gain: 0.22 * v, decay: 0.07 });
    this.tone(t, { type: 'triangle', freq: 1300 * pv, freqEnd: 1100 * pv, gain: 0.06 * v, decay: 0.04 });
    this.noiseBurst(t, { type: 'lowpass', freq: 1600, gain: 0.25 * v, decay: 0.035 });
  }

  whoosh(power: number): void {
    if (!this.ctx) return;
    const t = this.now();
    const p = clamp01(power);
    const dur = 0.16 + p * 0.12;
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.pink;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(350, t);
    f.frequency.exponentialRampToValueAtTime(1800 + p * 1600, t + dur * 0.55);
    f.frequency.exponentialRampToValueAtTime(600, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.35 + p * 0.8, t + dur * 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.sfxGain);
    src.start(t, Math.random() * 3, dur + 0.05);
    this.done(src, [src, f, g]);
  }

  crowd(level: number): void {
    this.crowdLevel = clamp01(level);
    if (!this.ctx) return;
    const ctx = this.ctx;
    if (!this.crowdNodes && this.crowdLevel > 0) {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(this.sfxGain);
      const srcs: AudioScheduledSourceNode[] = [];
      const nodes: AudioNode[] = [gain];
      // two murmuring bands, each amplitude-modulated by slow LFOs
      for (const [freq, q, lfoRate, offset] of [
        [480, 0.7, 0.13, 0],
        [1100, 1.4, 0.21, 1.7],
      ] as const) {
        const src = ctx.createBufferSource();
        src.buffer = this.pink;
        src.loop = true;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = freq;
        bp.Q.value = q;
        const amp = ctx.createGain();
        amp.gain.value = 0.6;
        const lfo = ctx.createOscillator();
        lfo.frequency.value = lfoRate;
        const lfoG = ctx.createGain();
        lfoG.gain.value = 0.25;
        lfo.connect(lfoG).connect(amp.gain);
        src.connect(bp).connect(amp).connect(gain);
        src.start(ctx.currentTime, offset);
        lfo.start();
        srcs.push(src, lfo);
        nodes.push(bp, amp, lfo, lfoG, src);
      }
      this.crowdNodes = { gain, srcs, nodes };
    }
    if (this.crowdNodes) {
      const g = this.crowdNodes.gain.gain;
      g.cancelScheduledValues(ctx.currentTime);
      g.setTargetAtTime(this.crowdLevel * 0.32, ctx.currentTime, 0.6);
      if (this.crowdLevel === 0) {
        const cn = this.crowdNodes;
        this.crowdNodes = null;
        window.setTimeout(() => {
          for (const s of cn.srcs) {
            try {
              s.stop();
            } catch {
              /* already stopped */
            }
          }
          for (const n of cn.nodes) n.disconnect();
        }, 3000);
      }
    }
  }

  applause(intensity: number): void {
    if (!this.ctx) return;
    const t0 = this.now();
    const k = clamp01(intensity);
    const dur = 1.4 + k * 2.4;
    const claps = Math.round(25 + k * 110);
    for (let i = 0; i < claps; i++) {
      // density front-loaded: fast swell, long tail
      const u = Math.pow(Math.random(), 1.7);
      const t = t0 + 0.05 + u * dur;
      const fade = 1 - u * 0.85;
      this.noiseBurst(t, { type: 'bandpass', freq: rand(900, 2600), q: rand(1, 2.2), gain: rand(0.12, 0.3) * (0.5 + k * 0.5) * fade, decay: rand(0.012, 0.035) });
    }
    // cheering wash
    this.noiseBurst(t0, { type: 'bandpass', freq: 900, q: 0.6, gain: 0.22 + k * 0.35, attack: 0.25, decay: dur * 0.9, pink: true });
  }

  groan(): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = this.now();
    const dur = 1.3;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.linearRampToValueAtTime(1.3, t + 0.22);
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    out.connect(this.sfxGain);
    // formants for "oh"
    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(520, t);
    f1.frequency.linearRampToValueAtTime(420, t + dur);
    f1.Q.value = 5;
    const f2 = ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.setValueAtTime(900, t);
    f2.frequency.linearRampToValueAtTime(760, t + dur);
    f2.Q.value = 6;
    f1.connect(out);
    f2.connect(out);
    const nodes: AudioNode[] = [out, f1, f2];
    const n = ctx.createBufferSource();
    n.buffer = this.pink;
    const ng = ctx.createGain();
    ng.gain.value = 1.4;
    n.connect(ng);
    ng.connect(f1);
    ng.connect(f2);
    n.start(t, Math.random(), dur + 0.1);
    nodes.push(n, ng);
    // a few detuned "voices" sliding down
    let last: AudioScheduledSourceNode = n;
    for (let i = 0; i < 6; i++) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      const base = rand(120, 230);
      o.frequency.setValueAtTime(base, t);
      o.frequency.exponentialRampToValueAtTime(base * 0.78, t + dur);
      const og = ctx.createGain();
      og.gain.value = 0.05;
      o.connect(og);
      og.connect(f1);
      og.connect(f2);
      o.start(t + rand(0, 0.08));
      o.stop(t + dur + 0.05);
      nodes.push(o, og);
      last = o;
    }
    this.done(last, nodes);
  }

  score(good: boolean): void {
    if (!this.ctx) return;
    const t = this.now();
    if (good) {
      this.bell(t, 1046.5, 0.22);
      this.bell(t + 0.09, 1568, 0.22);
    } else {
      this.tone(t, { type: 'triangle', freq: 392, gain: 0.16, decay: 0.22 });
      this.tone(t + 0.12, { type: 'triangle', freq: 293.7, gain: 0.16, decay: 0.35 });
    }
  }

  private bell(t: number, f: number, g: number, decay = 0.6): void {
    this.tone(t, { type: 'sine', freq: f, gain: g, decay });
    this.tone(t, { type: 'sine', freq: f * 2, gain: g * 0.35, decay: decay * 0.5 });
    this.tone(t, { type: 'sine', freq: f * 3.01, gain: g * 0.12, decay: decay * 0.3 });
  }

  win(): void {
    if (!this.ctx) return;
    const t = this.now();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      this.tone(t + i * 0.11, { type: 'square', freq: f, gain: 0.05, decay: 0.18 });
      this.bell(t + i * 0.11, f, 0.12, 0.35);
    });
    const ct = t + 0.5;
    for (const f of [523.25, 659.25, 783.99, 1046.5, 1318.5]) {
      this.tone(ct, { type: 'triangle', freq: f, gain: 0.07, attack: 0.02, sustain: 0.5, decay: 0.9 });
      this.tone(ct, { type: 'sawtooth', freq: f / 2, gain: 0.015, attack: 0.03, sustain: 0.4, decay: 0.8, detune: 7 });
    }
    for (let i = 0; i < 6; i++) this.bell(ct + 0.15 + i * 0.09, 2093 * (1 + (i % 3) * 0.25), 0.05, 0.3);
  }

  lose(): void {
    if (!this.ctx) return;
    const t = this.now();
    const seq = [440, 349.23, 293.66];
    seq.forEach((f, i) => this.tone(t + i * 0.26, { type: 'triangle', freq: f, gain: 0.13, attack: 0.01, decay: 0.4 }));
    for (const f of [146.83, 220, 293.66, 349.23]) {
      this.tone(t + 0.8, { type: 'triangle', freq: f, gain: 0.06, attack: 0.05, sustain: 0.4, decay: 1.1 });
    }
  }

  ui(kind: 'move' | 'select' | 'back' | 'error'): void {
    if (!this.ctx) return;
    const t = this.now();
    if (kind === 'move') {
      // rate-limit fast hovering
      if (t - this.lastUi < 0.035) return;
      this.lastUi = t;
      this.tone(t, { type: 'sine', freq: 1320, freqEnd: 1500, gain: 0.07, decay: 0.045 });
    } else if (kind === 'select') {
      this.tone(t, { type: 'sine', freq: 880, gain: 0.12, decay: 0.07 });
      this.tone(t + 0.055, { type: 'sine', freq: 1318.5, gain: 0.12, decay: 0.12 });
      this.tone(t, { type: 'triangle', freq: 440, gain: 0.04, decay: 0.08 });
    } else if (kind === 'back') {
      this.tone(t, { type: 'sine', freq: 990, gain: 0.1, decay: 0.06 });
      this.tone(t + 0.05, { type: 'sine', freq: 660, gain: 0.1, decay: 0.1 });
    } else {
      this.tone(t, { type: 'square', freq: 150, gain: 0.05, decay: 0.12 });
      this.tone(t + 0.08, { type: 'square', freq: 120, gain: 0.05, decay: 0.14 });
    }
  }

  /** Slow-mo enter (deep downward "vwoom" + soft low pulse at ~1.2 Hz while on) / exit (quick upward sweep). */
  slowMo(on: boolean): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = this.now();
    const stopPulse = () => {
      const p = this.slowPulse;
      if (!p) return;
      this.slowPulse = null;
      p.env.gain.cancelScheduledValues(t);
      p.env.gain.setValueAtTime(Math.max(0.0001, p.env.gain.value), t);
      p.env.gain.linearRampToValueAtTime(0.0001, t + 0.12);
      p.stop(t + 0.14);
    };
    if (on) {
      stopPulse();
      this.tone(t, { type: 'sine', freq: 520, freqEnd: 48, gain: 0.3, attack: 0.01, decay: 0.7 });
      this.tone(t, { type: 'triangle', freq: 260, freqEnd: 40, gain: 0.12, attack: 0.02, decay: 0.6 });
      this.noiseBurst(t, { type: 'bandpass', freq: 2400, freqEnd: 140, q: 0.9, gain: 0.12, attack: 0.04, decay: 0.55, pink: true });
      // soft low pulse (~1.2 Hz) until slowMo(false)
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(1, t + 0.5);
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = 58;
      const amp = ctx.createGain();
      amp.gain.value = 0.045;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 1.2;
      const depth = ctx.createGain();
      depth.gain.value = 0.045;
      lfo.connect(depth).connect(amp.gain);
      o.connect(amp).connect(env).connect(this.sfxGain);
      o.start(t);
      lfo.start(t);
      o.onended = () => {
        for (const n of [o, lfo, amp, depth, env]) n.disconnect();
      };
      this.slowPulse = {
        env,
        stop: (at) => {
          o.stop(at);
          lfo.stop(at);
        },
      };
    } else {
      const was = !!this.slowPulse;
      stopPulse();
      if (!was) return;
      this.tone(t, { type: 'sine', freq: 90, freqEnd: 640, gain: 0.2, attack: 0.01, decay: 0.2 });
      this.noiseBurst(t, { type: 'bandpass', freq: 200, freqEnd: 3200, q: 0.9, gain: 0.08, attack: 0.02, decay: 0.2, pink: true });
    }
  }

  music(track: 'menu' | 'match' | null): void {
    this.wantTrack = track;
    this.musicEngine?.play(track);
  }

  /** Addition: low-pass the music (e.g. while paused). */
  muffleMusic(on: boolean): void {
    this.musicEngine?.muffle(on);
  }
}
