// Procedural Web Audio sound effects + music for Subway Runner. No audio files.

const BPM = 126;
const STEP = 60 / BPM / 4; // 16th note duration
const LOOKAHEAD = 0.1;
const TICK_MS = 25;

// A-minor progression (Am - F - C - G), root MIDI notes for bass
const PROG = [45, 41, 48, 43];
const CHORDS = [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]];
const ARP_PATTERN = [0, 1, 2, 1, 0, 2, 1, 2];
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

export class AudioFX {
  constructor() {
    this.ctx = null;
    this._muted = false;
    this._musicOn = false;
    this._timer = null;
    this._step = 0;
    this._nextTime = 0;
  }

  unlock() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        const ctx = new AC();
        this.ctx = ctx;
        this.comp = ctx.createDynamicsCompressor();
        this.comp.threshold.value = -14;
        this.comp.ratio.value = 4;
        this.comp.connect(ctx.destination);
        this.master = ctx.createGain();
        this.master.gain.value = this._muted ? 0 : 0.5;
        this.master.connect(this.comp);
        this.sfx = ctx.createGain();
        this.sfx.gain.value = 1;
        this.sfx.connect(this.master);
        this.music = ctx.createGain();
        this.music.gain.value = 0.25;
        this.music.connect(this.master);
        // One reusable 1-second white noise buffer
        const len = ctx.sampleRate;
        this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = this.noise.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      }
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    } catch (e) { /* audio unavailable */ }
  }

  get muted() { return this._muted; }

  setMuted(m) {
    this._muted = !!m;
    try {
      if (this.master) this.master.gain.setTargetAtTime(this._muted ? 0 : 0.5, this.ctx.currentTime, 0.02);
    } catch (e) {}
  }

  // --- primitives ---
  _tone(type, f0, f1, t, dur, vol, out = this.sfx) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  _noise(filterType, f0, f1, t, dur, vol, q = 1, out = this.sfx) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = filterType;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.01, dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(out);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.02);
  }

  play(name) {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime + 0.005;
      switch (name) {
        case 'coin': {
          const v = 1 + (Math.random() - 0.5) * 0.06;
          this._tone('square', 988 * v, 988 * v, t, 0.06, 0.12);
          this._tone('triangle', 1319 * v, 1480 * v, t + 0.055, 0.12, 0.18);
          break;
        }
        case 'jump':
          this._tone('sine', 260, 720, t, 0.18, 0.3);
          this._tone('triangle', 520, 1100, t, 0.12, 0.06);
          break;
        case 'roll':
          this._noise('lowpass', 3000, 300, t, 0.3, 0.35, 2);
          break;
        case 'lane':
          this._noise('bandpass', 1800, 2600, t, 0.1, 0.18, 3);
          break;
        case 'crash':
          this._noise('lowpass', 4000, 200, t, 0.6, 0.6, 0.7);
          this._tone('sine', 140, 40, t, 0.45, 0.7);
          this._tone('square', 90, 50, t, 0.2, 0.12);
          break;
        case 'powerup':
          [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => {
            this._tone('triangle', midi(72 + s), midi(72 + s), t + i * 0.045, 0.14, 0.16);
            this._tone('sine', midi(84 + s), midi(84 + s), t + i * 0.045 + 0.02, 0.08, 0.05);
          });
          break;
        case 'start':
          [[67, 0, 0.1], [72, 0.1, 0.1], [76, 0.2, 0.1], [79, 0.3, 0.3]].forEach(([n, d, len]) => {
            this._tone('square', midi(n), midi(n), t + d, len, 0.1);
            this._tone('triangle', midi(n - 12), midi(n - 12), t + d, len, 0.15);
          });
          break;
        case 'stumble':
          this._tone('sawtooth', 110, 70, t, 0.22, 0.18);
          this._tone('square', 116, 72, t, 0.22, 0.08);
          break;
        case 'click':
          this._tone('square', 2200, 1800, t, 0.025, 0.08);
          break;
        default:
          break;
      }
    } catch (e) {}
  }

  // --- music ---
  _kick(t) { this._tone('sine', 150, 45, t, 0.22, 0.9, this.music); }
  _hat(t, v = 0.15) { this._noise('highpass', 8000, 8000, t, 0.04, v, 1, this.music); }
  _snare(t) {
    this._noise('bandpass', 2500, 1800, t, 0.16, 0.45, 0.8, this.music);
    this._tone('triangle', 220, 160, t, 0.08, 0.3, this.music);
  }

  _scheduleStep(step, t) {
    const s = step % 16;
    const bar = Math.floor(step / 16) % PROG.length;
    if (s % 4 === 0) this._kick(t);
    if (s === 10) this._kick(t);
    if (s === 4 || s === 12) this._snare(t);
    if (s % 2 === 0) this._hat(t, s % 4 === 2 ? 0.2 : 0.1);
    // Bass: syncopated eighths on root / octave
    if (s % 2 === 0 && s !== 6) {
      const n = PROG[bar] + (s === 8 || s === 14 ? 12 : 0);
      this._tone('triangle', midi(n), midi(n), t, STEP * 1.6, 0.5, this.music);
    }
    // Arpeggio: 16ths, every other bar goes up an octave on the back half
    const chord = CHORDS[bar];
    const n = chord[ARP_PATTERN[s % 8]] + 12 + (s >= 8 && (Math.floor(step / 16) % 2) ? 12 : 0);
    this._tone('square', midi(n), midi(n), t, STEP * 0.8, 0.07, this.music);
  }

  _tick() {
    try {
      if (!this._musicOn || !this.ctx) return;
      while (this._nextTime < this.ctx.currentTime + LOOKAHEAD) {
        this._scheduleStep(this._step, this._nextTime);
        this._step++;
        this._nextTime += STEP;
      }
    } catch (e) {}
    if (this._musicOn) this._timer = setTimeout(() => this._tick(), TICK_MS);
  }

  startMusic() {
    if (this._musicOn) return;
    try {
      this.unlock();
      if (!this.ctx) return;
      this._musicOn = true;
      this._step = 0;
      this._nextTime = this.ctx.currentTime + 0.05;
      this.music.gain.cancelScheduledValues(this.ctx.currentTime);
      this.music.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this._tick();
    } catch (e) { this._musicOn = false; }
  }

  stopMusic() {
    this._musicOn = false;
    if (this._timer) clearTimeout(this._timer);
    this._timer = null;
    try {
      if (this.ctx && this.music) {
        // Brief fade so already-scheduled notes don't ring out abruptly
        const now = this.ctx.currentTime;
        this.music.gain.cancelScheduledValues(now);
        this.music.gain.setValueAtTime(this.music.gain.value, now);
        this.music.gain.linearRampToValueAtTime(0, now + 0.15);
      }
    } catch (e) {}
  }
}
