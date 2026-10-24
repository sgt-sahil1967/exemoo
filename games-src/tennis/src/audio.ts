// All sound is synthesised with WebAudio, so there are no sample files to ship.
export class Sfx {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private crowdGain!: GainNode;
  private noise!: AudioBuffer;
  private applauseBuf!: AudioBuffer;
  muted = false;

  /** Must be called from a user gesture. */
  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.8;
    const comp = ctx.createDynamicsCompressor();
    this.master.connect(comp).connect(ctx.destination);

    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    // Applause: thousands of tiny claps.
    const alen = ctx.sampleRate * 3;
    this.applauseBuf = ctx.createBuffer(2, alen, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const a = this.applauseBuf.getChannelData(ch);
      for (let k = 0; k < 2600; k++) {
        const start = Math.floor(Math.pow(Math.random(), 1.3) * (alen - 2000));
        const amp = 0.15 + Math.random() * 0.25;
        const dur = 300 + Math.random() * 500;
        for (let i = 0; i < dur; i++) a[start + i] += (Math.random() * 2 - 1) * amp * Math.exp(-i / (dur / 5));
      }
    }

    // Crowd ambience: filtered brown noise.
    const brown = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const b = brown.getChannelData(0);
    let last = 0;
    for (let i = 0; i < b.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      b[i] = last * 3.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = brown;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 520;
    this.crowdGain = ctx.createGain();
    this.crowdGain.gain.value = 0.11;
    src.connect(lp).connect(this.crowdGain).connect(this.master);
    src.start();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.8, this.ctx.currentTime, 0.05);
  }

  private noiseBurst(t: number, dur: number, freq: number, q: number, gain: number, type: BiquadFilterType = 'bandpass') {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t, Math.random());
    src.stop(t + dur + 0.02);
  }

  private tone(t: number, f0: number, f1: number, dur: number, gain: number, type: OscillatorType = 'sine') {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  hit(power: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.noiseBurst(t, 0.06, 2200 + power * 800, 1.2, 0.7 + power * 0.5);
    this.tone(t, 700 + power * 300, 180, 0.09, 0.5 + power * 0.3);
    this.tone(t, 2600, 1200, 0.03, 0.12, 'triangle');
  }

  bounce(strength: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const s = Math.min(1, strength / 8);
    this.tone(t, 260, 110, 0.07, 0.35 * s + 0.05);
    this.noiseBurst(t, 0.04, 900, 0.8, 0.25 * s, 'lowpass');
  }

  net() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.noiseBurst(t, 0.12, 400, 0.7, 0.5, 'lowpass');
    this.tone(t, 140, 70, 0.12, 0.3);
  }

  applause(intensity: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.applauseBuf;
    src.playbackRate.value = 0.9 + Math.random() * 0.2;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 700;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.35 * intensity, t + 0.15);
    g.gain.setTargetAtTime(0, t + 1.4, 0.5);
    src.connect(hp).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + 3.5);
    this.crowdGain.gain.setTargetAtTime(0.11 + 0.1 * intensity, t, 0.1);
    this.crowdGain.gain.setTargetAtTime(0.11, t + 1.5, 0.8);
  }

  /** Crowd "ooh" for near misses. */
  ooh() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      const f = 180 + Math.random() * 120;
      o.frequency.setValueAtTime(f, t);
      o.frequency.linearRampToValueAtTime(f * 0.8, t + 0.9);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 700;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.03, t + 0.15);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
      o.connect(lp).connect(g).connect(this.master);
      o.start(t);
      o.stop(t + 1.05);
    }
  }

  ui() {
    if (!this.ctx) return;
    this.tone(this.ctx.currentTime, 900, 1300, 0.06, 0.12, 'triangle');
  }

  whoosh() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.noiseBurst(t, 0.18, 900, 0.6, 0.18);
  }
}
