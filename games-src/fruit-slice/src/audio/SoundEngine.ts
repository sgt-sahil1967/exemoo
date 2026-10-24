/**
 * SoundEngine — fully procedural Web Audio engine for Table Slice.
 *
 * Graph:
 *   voices → sfxBus ─┐
 *   tracks → duck → musicBus ─┼→ mix → muffle(LPF) → glue comp → master → limiter → soft clip → analyser → out
 *   sends  → reverb (generated IR) ─┘
 *
 * All SFX are rendered once into AudioBuffers with OfflineAudioContext at
 * construction (works before any user gesture). Nothing is audible until
 * the context is resumed via unlock(); every public method is a safe no-op
 * when the context is suspended/closed or buffers are still rendering.
 */
import type { PlayOptions, SfxName, SoundHandle } from '../contracts';
import { DEFAULT_SETTINGS } from '../contracts';
import {
  clamp, dbToGain, ksPluck, loudnessOf, makeBuffer, makeImpulse, midiToFreq, mulberry32, noiseBuffer, peakOf,
} from './dsp';
import { Track, type MusicHost, type TrackName } from './music';
import { DRUMS, SFX, type DrumName, type Kit, type PluckKind } from './sfx';

interface Voice { src: AudioBufferSourceNode; gain: GainNode; ended: boolean }

const NOOP: SoundHandle = { stop() { /* nothing playing */ } };
/** Short-term RMS every SFX is normalised to before its design gain. */
const TARGET_LOUD = 0.3;
const MUFFLE_HZ = 650;

const PLUCK_OPTS: Record<PluckKind, Parameters<typeof ksPluck>[3]> = {
  koto: { bright: 0.68, t60: 1.5, stretch: 0.62, pick: 0.13, dur: 1.7, click: 0.35 },
  bass: { bright: 0.32, t60: 0.9, stretch: 0.5, pick: 0.22, dur: 1.2, click: 0.1, sub: 0.55 },
  harp: { bright: 0.45, t60: 2.2, stretch: 0.75, pick: 0.2, dur: 2.4, click: 0.1 },
};

export class SoundEngine {
  readonly context: AudioContext;
  /** Resolves once every SFX/drum buffer has been rendered. */
  readonly ready: Promise<void>;
  /** Post-limiter analyser (for meters/debug). */
  readonly analyser: AnalyserNode | null = null;

  private ok = false;
  private primed = false;
  private sfxBus!: GainNode;
  private musicBus!: GainNode;
  private duck!: GainNode;
  private muffle!: BiquadFilterNode;
  private master!: GainNode;
  private reverbIn!: GainNode;
  private noise!: AudioBuffer;

  private buffers = new Map<SfxName, AudioBuffer[]>();
  private gains = new Map<SfxName, number>();
  private voices = new Map<SfxName, Voice[]>();
  private lastPlay = new Map<SfxName, number>();
  private lastIdx = new Map<SfxName, number>();
  private loops = new Set<{ src: AudioBufferSourceNode; gain: GainNode }>();
  private plucks = new Map<string, { buf: AudioBuffer; rate: number }>();
  private drums = new Map<DrumName, AudioBuffer>();
  private rng = mulberry32((Math.random() * 2 ** 32) >>> 0);
  private isReady = false;

  private tracks: Track[] = [];
  private current: Track | null = null;
  private desired: TrackName | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private musicRate = 1;
  private host!: MusicHost;
  private vol = { master: DEFAULT_SETTINGS.masterVolume, sfx: DEFAULT_SETTINGS.sfxVolume, music: DEFAULT_SETTINGS.musicVolume };

  constructor() {
    let ctx: AudioContext | null = null;
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) ctx = new AC({ latencyHint: 'interactive' });
    } catch {
      ctx = null;
    }
    this.context = ctx as AudioContext;
    if (!ctx) {
      this.ready = Promise.resolve();
      return;
    }
    try {
      this.buildGraph(ctx);
      this.ok = true;
    } catch {
      this.ok = false;
    }
    this.ready = this.ok ? this.renderAll().catch(() => undefined) : Promise.resolve();
    if (this.ok) {
      ctx.onstatechange = () => this.ensureMusic();
      const gesture = () => { if (this.context.state !== 'running') void this.unlock(); };
      for (const ev of ['pointerdown', 'mousedown', 'touchend', 'keydown']) {
        window.addEventListener(ev, gesture, { capture: true, passive: true });
      }
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.context.state !== 'running' && this.primed) void this.unlock();
      });
    }
  }

  // ------------------------------------------------------------- graph ---

  private buildGraph(ctx: AudioContext): void {
    const mix = ctx.createGain();
    this.muffle = ctx.createBiquadFilter();
    this.muffle.type = 'lowpass';
    this.muffle.frequency.value = 20000;
    this.muffle.Q.value = 0.6;

    const glue = ctx.createDynamicsCompressor();
    glue.threshold.value = -16;
    glue.knee.value = 10;
    glue.ratio.value = 2.5;
    glue.attack.value = 0.006;
    glue.release.value = 0.22;

    this.master = ctx.createGain();
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -3;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.001;
    limiter.release.value = 0.12;

    const clip = ctx.createWaveShaper();
    const n = 2048;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      const ax = Math.abs(x);
      const y = ax < 0.75 ? ax : 0.75 + 0.22 * Math.tanh((ax - 0.75) / 0.22);
      curve[i] = Math.sign(x) * y;
    }
    clip.curve = curve;

    const an = ctx.createAnalyser();
    an.fftSize = 2048;
    (this as { analyser: AnalyserNode | null }).analyser = an;

    mix.connect(this.muffle).connect(glue).connect(this.master).connect(limiter).connect(clip).connect(an).connect(ctx.destination);

    this.sfxBus = ctx.createGain();
    this.sfxBus.connect(mix);
    this.duck = ctx.createGain();
    this.musicBus = ctx.createGain();
    this.duck.connect(this.musicBus).connect(mix);

    const rng = mulberry32(1234);
    const conv = ctx.createConvolver();
    conv.normalize = false;
    conv.buffer = makeImpulse(ctx, 2.4, rng);
    this.reverbIn = ctx.createGain();
    const ret = ctx.createGain();
    ret.gain.value = 0.55;
    this.reverbIn.connect(conv).connect(ret).connect(mix);

    this.noise = noiseBuffer(ctx, 3, 2, rng);
    this.applyVolumes(0);

    this.host = {
      ctx,
      reverb: this.reverbIn,
      noise: this.noise,
      pluck: (m, k) => this.pluck(m, k),
      drum: (d) => this.drums.get(d),
      rate: () => this.musicRate,
    };
  }

  private kit(): Kit {
    return {
      sr: this.context.sampleRate,
      noise: this.noise,
      pluck: (m, k) => this.pluck(m, k),
      drum: (d) => this.drums.get(d),
    };
  }

  /** Karplus-Strong pluck sample for a midi note (cached). */
  private pluck(midi: number, kind: PluckKind = 'koto'): { buf: AudioBuffer; rate: number } {
    const key = kind + midi;
    let p = this.plucks.get(key);
    if (!p) {
      const f = midiToFreq(midi);
      const r = ksPluck(this.context.sampleRate, f, mulberry32(midi * 31 + kind.length), PLUCK_OPTS[kind]);
      p = { buf: makeBuffer(this.context, [r.data], this.context.sampleRate), rate: f / r.freq };
      this.plucks.set(key, p);
    }
    return p;
  }

  private async render(dur: number, fn: (ctx: OfflineAudioContext, out: AudioNode) => void): Promise<AudioBuffer> {
    const sr = this.context.sampleRate;
    const OAC = window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
    const ctx = new OAC(2, Math.ceil(dur * sr), sr);
    const out = ctx.createGain();
    out.connect(ctx.destination);
    fn(ctx, out);
    return ctx.startRendering();
  }

  private async renderAll(): Promise<void> {
    const kit = this.kit();
    const t0 = performance.now();
    await Promise.all(
      (Object.keys(DRUMS) as DrumName[]).map(async (name) => {
        try {
          const b = await this.render(DRUMS[name].dur, (c, o) => DRUMS[name].render(c, o, kit, mulberry32(name.length * 97), 0));
          this.normalise(b, 0.9, Infinity);
          this.drums.set(name, b);
        } catch { /* skip drum */ }
      }),
    );
    // warm the pluck cache for the music range so the scheduler never stalls
    for (let m = 50; m <= 100; m++) this.pluck(m, 'koto');
    for (let m = 33; m <= 57; m++) this.pluck(m, 'bass');

    await Promise.all(
      (Object.keys(SFX) as SfxName[]).map(async (name) => {
        const d = SFX[name];
        const list: AudioBuffer[] = [];
        for (let v = 0; v < d.variants; v++) {
          try {
            const seed = (name.charCodeAt(0) * 7919 + name.length * 131 + v * 104729) >>> 0;
            let b = await this.render(d.dur, (c, o) => d.render(c, o, kit, mulberry32(seed), v));
            if (d.loopXfade) b = this.makeLoop(b, d.loopXfade);
            else this.fadeTail(b, 0.012);
            this.normalise(b, 0.98, TARGET_LOUD);
            list.push(b);
          } catch { /* skip variant */ }
        }
        if (list.length) {
          this.buffers.set(name, list);
          this.gains.set(name, dbToGain(d.db));
        }
      }),
    );
    this.isReady = true;
    this.renderMs = performance.now() - t0;
    this.ensureMusic();
  }

  /** ms spent rendering all buffers (debug). */
  renderMs = 0;

  private normalise(b: AudioBuffer, maxPeak: number, loud: number): void {
    const pk = peakOf(b);
    if (!(pk > 0) || !Number.isFinite(pk)) return;
    let g = maxPeak / pk;
    if (Number.isFinite(loud)) {
      const l = loudnessOf(b).loud;
      if (l > 0) g = Math.min(g, loud / l);
    }
    for (let c = 0; c < b.numberOfChannels; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < d.length; i++) d[i] *= g;
    }
  }

  private fadeTail(b: AudioBuffer, sec: number): void {
    const n = Math.min(b.length, Math.floor(sec * b.sampleRate));
    for (let c = 0; c < b.numberOfChannels; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < n; i++) d[b.length - 1 - i] *= i / n;
    }
  }

  /** Equal-power crossfade tail into head → seamless loop. */
  private makeLoop(b: AudioBuffer, xf: number): AudioBuffer {
    const X = Math.floor(xf * b.sampleRate);
    const L = b.length - X;
    const out = this.context.createBuffer(b.numberOfChannels, L, b.sampleRate);
    for (let c = 0; c < b.numberOfChannels; c++) {
      const src = b.getChannelData(c);
      const dst = out.getChannelData(c);
      dst.set(src.subarray(0, L));
      for (let i = 0; i < X; i++) {
        const p = i / X;
        dst[i] = src[i] * Math.sin(p * Math.PI * 0.5) + src[L + i] * Math.cos(p * Math.PI * 0.5);
      }
    }
    return out;
  }

  // -------------------------------------------------------------- state ---

  private running(): boolean {
    return this.ok && this.context.state === 'running';
  }

  /** Resume the context (call from a user gesture). Safe to call repeatedly. */
  async unlock(): Promise<void> {
    if (!this.ok) return;
    const ctx = this.context;
    if (ctx.state === 'closed') return;
    try {
      if (ctx.state !== 'running') {
        await Promise.race([ctx.resume(), new Promise((r) => setTimeout(r, 1500))]);
      }
    } catch { /* not allowed yet */ }
    if (!this.primed && ctx.state === 'running') {
      try {
        // iOS: a silent buffer started inside the gesture fully unlocks output
        const s = ctx.createBufferSource();
        s.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
        s.connect(ctx.destination);
        s.start(0);
        this.primed = true;
      } catch { /* ignore */ }
    }
    this.ensureMusic();
  }

  setVolumes(master: number, sfx: number, music: number): void {
    this.vol = { master: clamp(+master || 0, 0, 1), sfx: clamp(+sfx || 0, 0, 1), music: clamp(+music || 0, 0, 1) };
    if (this.ok) this.applyVolumes(0.03);
  }

  private applyVolumes(tc: number): void {
    try {
      const t = this.context.currentTime;
      // squared taper feels linear to the ear on a 0..1 slider
      const set = (p: AudioParam, v: number) => (tc > 0 ? p.setTargetAtTime(v * v, t, tc) : (p.value = v * v));
      set(this.master.gain, this.vol.master);
      set(this.sfxBus.gain, this.vol.sfx);
      set(this.musicBus.gain, this.vol.music);
    } catch { /* closed */ }
  }

  /** Low-pass everything (pause menu / freeze power-up). */
  setMuffled(on: boolean): void {
    if (!this.ok || this.context.state === 'closed') return;
    try {
      const f = this.muffle.frequency;
      const t = this.context.currentTime;
      f.cancelScheduledValues(t);
      f.setValueAtTime(f.value, t);
      f.exponentialRampToValueAtTime(on ? MUFFLE_HZ : 20000, t + (on ? 0.25 : 0.35));
    } catch { /* ignore */ }
  }

  /** Game time scale (slow-mo). Music tempo and pitch follow gently. */
  setTimeScale(s: number): void {
    const v = Number.isFinite(s) ? clamp(s, 0.05, 2) : 1;
    this.musicRate = clamp(1 + (v - 1) * 0.12, 0.88, 1.06);
  }

  // ---------------------------------------------------------------- sfx ---

  play(name: SfxName, opts: PlayOptions = {}): void {
    if (!this.running()) return;
    try {
      const bufs = this.buffers.get(name);
      const d = SFX[name];
      if (!bufs || !d) return;
      const ctx = this.context;
      const now = ctx.currentTime;
      const last = this.lastPlay.get(name) ?? -1;
      if (d.minGap && now - last < d.minGap) return;
      this.lastPlay.set(name, now);

      // voice limiting: steal the oldest
      const list = (this.voices.get(name) ?? []).filter((v) => !v.ended);
      while (list.length >= d.maxVoices) {
        const old = list.shift();
        if (old) this.kill(old.src, old.gain, now);
      }

      let idx: number;
      const prev = this.lastIdx.get(name) ?? -1;
      if (d.roundRobin) idx = (prev + 1) % bufs.length;
      else {
        idx = Math.floor(this.rng() * bufs.length);
        if (bufs.length > 1 && idx === prev) idx = (idx + 1) % bufs.length;
      }
      this.lastIdx.set(name, idx);

      const vol = clamp(opts.volume ?? 1, 0, 2);
      if (vol <= 0) return;
      const pitch = Number.isFinite(opts.pitch) ? (opts.pitch as number) : 1;
      const rate = clamp(pitch * (1 + (this.rng() * 2 - 1) * d.variance), 0.25, 4);

      const src = ctx.createBufferSource();
      src.buffer = bufs[idx];
      src.playbackRate.value = rate;
      const g = ctx.createGain();
      g.gain.value = vol * (this.gains.get(name) ?? 1);
      src.connect(g);
      let tail: AudioNode = g;
      const pan = clamp(opts.pan ?? 0, -1, 1);
      if (pan !== 0 && ctx.createStereoPanner) {
        const p = ctx.createStereoPanner();
        p.pan.value = pan;
        g.connect(p);
        tail = p;
      }
      tail.connect(this.sfxBus);
      if (d.send > 0) {
        const s = ctx.createGain();
        s.gain.value = d.send;
        tail.connect(s).connect(this.reverbIn);
      }
      const voice: Voice = { src, gain: g, ended: false };
      src.onended = () => {
        voice.ended = true;
        try { g.disconnect(); tail.disconnect(); } catch { /* */ }
      };
      src.start(now);
      list.push(voice);
      this.voices.set(name, list);
      if (d.duck) this.duckMusic(d.duck[0], d.duck[1]);
    } catch { /* never throw from play */ }
  }

  /** Looping SFX (bomb fuse). Returned handle fades out on stop(). */
  loop(name: 'bombFuse', opts: PlayOptions = {}): SoundHandle {
    if (!this.running()) return NOOP;
    try {
      const bufs = this.buffers.get(name);
      if (!bufs) return NOOP;
      const ctx = this.context;
      const now = ctx.currentTime;
      if (this.loops.size >= SFX[name].maxVoices) {
        const oldest = this.loops.values().next().value;
        if (oldest) {
          this.kill(oldest.src, oldest.gain, now);
          this.loops.delete(oldest);
        }
      }
      const buf = bufs[0];
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.playbackRate.value = clamp((opts.pitch ?? 1) * (0.95 + this.rng() * 0.1), 0.25, 4);
      const g = ctx.createGain();
      const target = clamp(opts.volume ?? 1, 0, 2) * (this.gains.get(name) ?? 1);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(target, now + 0.06);
      src.connect(g);
      let tail: AudioNode = g;
      if (opts.pan && ctx.createStereoPanner) {
        const p = ctx.createStereoPanner();
        p.pan.value = clamp(opts.pan, -1, 1);
        g.connect(p);
        tail = p;
      }
      tail.connect(this.sfxBus);
      src.start(now, this.rng() * buf.duration);
      const entry = { src, gain: g };
      this.loops.add(entry);
      let stopped = false;
      return {
        stop: () => {
          if (stopped) return;
          stopped = true;
          this.loops.delete(entry);
          try { this.kill(src, g, this.context.currentTime, 0.03); } catch { /* */ }
          setTimeout(() => { try { tail.disconnect(); } catch { /* */ } }, 400);
        },
      };
    } catch {
      return NOOP;
    }
  }

  private kill(src: AudioBufferSourceNode, g: GainNode, now: number, tc = 0.012): void {
    try {
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.setTargetAtTime(0, now, tc);
      src.stop(now + tc * 6);
    } catch { /* already stopped */ }
  }

  private duckMusic(amount: number, hold: number): void {
    const p = this.duck.gain;
    const t = this.context.currentTime;
    p.cancelScheduledValues(t);
    p.setValueAtTime(p.value, t);
    p.setTargetAtTime(1 - amount, t, 0.03);
    p.setTargetAtTime(1, t + hold, 0.45);
  }

  // -------------------------------------------------------------- music ---

  /** Start (or crossfade to) a music track. Remembered until unlock if needed. */
  startMusic(track: TrackName): void {
    if (track !== 'menu' && track !== 'game' && track !== 'frenzy') return;
    this.desired = track;
    this.ensureMusic();
  }

  stopMusic(fade = 1): void {
    this.desired = null;
    if (!this.ok) return;
    try {
      const t = this.context.currentTime;
      for (const tr of this.tracks) if (!tr.stopping) tr.fadeOut(t, Math.max(0.02, fade));
      this.current = null;
    } catch { /* */ }
  }

  private ensureMusic(): void {
    if (!this.running() || !this.isReady) return;
    const want = this.desired;
    if (!want) return;
    if (this.current && this.current.name === want && !this.current.stopping) return;
    try {
      const ctx = this.context;
      const t = ctx.currentTime;
      const crossfade = !!this.current;
      if (this.current) this.current.fadeOut(t, 1);
      const tr = new Track(this.host, want, this.duck, t + 0.08, (this.rng() * 2 ** 32) >>> 0);
      tr.fadeIn(t + 0.05, crossfade ? 1 : 0.04);
      this.tracks.push(tr);
      this.current = tr;
      this.pump();
    } catch { /* */ }
  }

  /** Lookahead scheduler: a coarse timer wakes us, Web Audio clock does the timing. */
  private pump = (): void => {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (!this.ok || this.context.state === 'closed') return;
    const now = this.context.currentTime;
    const hidden = typeof document !== 'undefined' && document.hidden;
    const ahead = hidden ? 1.3 : 0.14;
    if (this.context.state === 'running') {
      for (const tr of this.tracks) tr.schedule(now + ahead);
    }
    // retire faded tracks
    this.tracks = this.tracks.filter((tr) => {
      if (tr.stopping && now > tr.stopAt + 2.5) {
        tr.dispose();
        return false;
      }
      return true;
    });
    if (this.tracks.length) this.timer = setTimeout(this.pump, hidden ? 250 : 25);
  };

  /** Debug: rendered buffers by name. */
  debugBuffers(): Map<SfxName, AudioBuffer[]> {
    return this.buffers;
  }

  /** Stop everything and close the context. */
  dispose(): void {
    if (!this.ok) return;
    this.stopMusic(0.05);
    for (const l of this.loops) this.kill(l.src, l.gain, this.context.currentTime);
    this.loops.clear();
    this.ok = false;
    setTimeout(() => { void this.context.close().catch(() => undefined); }, 200);
  }
}
