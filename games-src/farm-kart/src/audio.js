// Everything is synthesised with WebAudio: engines, SFX, cow moos and a looping hoedown tune.
export class Audio {
  constructor() { this.ctx = null; this.musicOn = true; this.engines = []; this.vol = { master: .8, music: .5, sfx: .8 }; }

  /** volumes 0..1; music at 0 stops the music loop */
  setVolumes(master, music, sfx) {
    this.vol = { master, music, sfx };
    this.musicOn = music > 0;
    if (!this.ctx) return;
    this.master.gain.setTargetAtTime(master * .9, this.t, .05);
    this.musicBus.gain.setTargetAtTime(music * .44, this.t, .05);
    this.sfxBus.gain.setTargetAtTime(sfx, this.t, .05);
    if (!this.musicOn) this.stopMusic();
  }

  init() {
    if (this.ctx) { this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext;
    this.ctx = new C();
    this.master = this.ctx.createGain(); this.master.gain.value = this.vol.master * .9; this.master.connect(this.ctx.destination);
    this.sfxBus = this.ctx.createGain(); this.sfxBus.gain.value = this.vol.sfx; this.sfxBus.connect(this.master);
    this.musicBus = this.ctx.createGain(); this.musicBus.gain.value = this.vol.music * .44; this.musicBus.connect(this.master);
    const len = this.ctx.sampleRate;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  get t() { return this.ctx.currentTime; }

  tone(freq, dur, { type = 'square', vol = .25, slide = 0, delay = 0, attack = .005, bus } = {}) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    const t0 = this.t + delay;
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t0 + dur);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + attack); g.gain.exponentialRampToValueAtTime(.0008, t0 + dur);
    o.connect(g); g.connect(bus || this.sfxBus); o.start(t0); o.stop(t0 + dur + .05);
  }
  noise(dur, { vol = .3, f0 = 2000, f1 = 400, q = 1, delay = 0, type = 'bandpass', bus } = {}) {
    if (!this.ctx) return;
    const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter(); f.type = type; f.Q.value = q;
    const g = this.ctx.createGain(); const t0 = this.t + delay;
    f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0008, t0 + dur);
    s.connect(f); f.connect(g); g.connect(bus || this.sfxBus); s.start(t0, Math.random() * .5); s.stop(t0 + dur + .05);
  }

  // ---- SFX ----
  count(n) { this.tone(n > 0 ? 440 : 880, n > 0 ? .25 : .6, { type: 'square', vol: .22 }); }
  itemGet() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .09, { delay: i * .05, vol: .12 })); }
  itemReady() { this.tone(1318, .12, { type: 'triangle', vol: .2 }); }
  boost(me) { if (!me) return; this.noise(.6, { vol: .35, f0: 400, f1: 3000, q: .8 }); this.tone(220, .5, { type: 'sawtooth', slide: 3, vol: .08 }); }
  hit(me) { this.noise(.4, { vol: me ? .5 : .15, f0: 900, f1: 120, q: 1.5 }); this.tone(180, .35, { type: 'triangle', slide: .4, vol: me ? .3 : .08 }); }
  bump(me) { if (me) this.noise(.15, { vol: .35, f0: 300, f1: 90, type: 'lowpass' }); }
  throw(me) { if (me) this.noise(.25, { vol: .25, f0: 1500, f1: 4000, q: 2 }); }
  drop(me) { if (me) this.tone(160, .2, { type: 'sine', slide: .5, vol: .3 }); }
  bee(me) { if (!me) return; for (let i = 0; i < 3; i++) this.tone(210 + i * 7, .7, { type: 'sawtooth', vol: .04, delay: i * .02 }); }
  clover(me) { if (!me) return; [784, 988, 1175, 1568, 1175, 1568].forEach((f, i) => this.tone(f, .12, { type: 'triangle', delay: i * .07, vol: .18 })); }
  sparkLevel(l, me) { if (me) this.tone(l === 1 ? 900 : 1300, .08, { type: 'square', vol: .08 }); }
  lap() { [659, 880].forEach((f, i) => this.tone(f, .18, { delay: i * .12, vol: .18, type: 'triangle' })); }
  finalLap() { [523, 659, 784, 1046, 784, 1046].forEach((f, i) => this.tone(f, .16, { delay: i * .11, vol: .18 })); }
  finish(win) {
    const seq = win ? [523, 659, 784, 1046, 1318, 1046, 1318, 1568] : [523, 494, 440, 392];
    seq.forEach((f, i) => this.tone(f, .22, { delay: i * .13, vol: .2, type: 'triangle' }));
  }
  wrong() { this.tone(200, .15, { vol: .15 }); }
  click() { this.tone(700, .05, { vol: .1, type: 'triangle' }); }

  moo(pos, listeners) {
    if (!this.ctx || !pos) return;
    let d = Infinity;
    for (const l of listeners || []) d = Math.min(d, Math.hypot(l.x - pos.x, l.z - pos.z));
    if (d > 90) return;
    const vol = .35 * Math.max(0, 1 - d / 90);
    const t0 = this.t, dur = .9 + Math.random() * .4, base = 110 + Math.random() * 30;
    const o = this.ctx.createOscillator(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(base * 1.25, t0); o.frequency.linearRampToValueAtTime(base * 1.4, t0 + .15); o.frequency.exponentialRampToValueAtTime(base * .8, t0 + dur);
    f.type = 'lowpass'; f.frequency.setValueAtTime(300, t0); f.frequency.linearRampToValueAtTime(900, t0 + .25); f.frequency.linearRampToValueAtTime(400, t0 + dur); f.Q.value = 6;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .12); g.gain.setValueAtTime(vol, t0 + dur * .7); g.gain.linearRampToValueAtTime(0, t0 + dur);
    o.connect(f); f.connect(g); g.connect(this.sfxBus); o.start(t0); o.stop(t0 + dur + .05);
  }

  // ---- engines for human karts ----
  setEngines(n) {
    if (!this.ctx) return;
    for (const e of this.engines) { e.g.gain.setTargetAtTime(0, this.t, .05); setTimeout(() => { e.o1.stop(); e.o2.stop(); }, 300); }
    this.engines = [];
    for (let i = 0; i < n; i++) {
      const o1 = this.ctx.createOscillator(), o2 = this.ctx.createOscillator(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
      o1.type = 'sawtooth'; o2.type = 'square';
      f.type = 'lowpass'; f.frequency.value = 600;
      g.gain.value = 0;
      o1.connect(f); o2.connect(f); f.connect(g); g.connect(this.sfxBus);
      o1.start(); o2.start();
      this.engines.push({ o1, o2, f, g });
    }
  }
  engine(i, speedNorm, boosting, on) {
    const e = this.engines[i]; if (!e) return;
    const f = 55 + speedNorm * 110 + (boosting ? 40 : 0);
    e.o1.frequency.setTargetAtTime(f, this.t, .05);
    e.o2.frequency.setTargetAtTime(f * .5 + 3, this.t, .05);
    e.f.frequency.setTargetAtTime(400 + speedNorm * 900, this.t, .05);
    e.g.gain.setTargetAtTime(on ? (.05 + speedNorm * .05) / Math.sqrt(this.engines.length) : 0, this.t, .08);
  }

  // ---- music: an original hoedown loop in G ----
  startMusic() {
    if (!this.ctx || this.musicTimer || !this.musicOn) return;
    const bpm = 150, step = 60 / bpm / 2; // eighth notes
    const N = { G2: 98, D3: 146.8, C3: 130.8, A2: 110, E3: 164.8, B2: 123.5, G3: 196, A3: 220, B3: 246.9, C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, 'F#4': 370, G4: 392, A4: 440, B4: 493.9, D5: 587.3, C5: 523.3 };
    const chords = ['G', 'G', 'C', 'G', 'D', 'G', 'C', 'G', 'E', 'D', 'G', 'G'];
    const bassFor = { G: ['G2', 'D3'], C: ['C3', 'G2'], D: ['D3', 'A2'], E: ['E3', 'B2'] };
    const mel = [
      'G4', '-', 'B4', 'D5', 'B4', 'G4', 'A4', 'B4', 'G4', '-', 'D4', 'G4', 'B4', '-', 'A4', 'G4',
      'E4', 'G4', 'C5', '-', 'B4', 'A4', 'G4', 'E4', 'D4', '-', 'G4', 'A4', 'B4', '-', '-', '-',
      'A4', '-', 'F#4', 'A4', 'D5', '-', 'C5', 'A4', 'B4', 'A4', 'G4', 'D4', 'G4', '-', '-', '-',
      'C5', 'B4', 'A4', 'G4', 'E4', 'G4', 'A4', 'C5', 'B4', 'G4', 'A4', 'B4', 'G4', 'B4', 'D5', '-',
      'E4', 'G4', 'B4', 'G4', 'E4', 'D4', 'E4', 'G4', 'D4', '-', 'F#4', 'A4', 'D5', '-', 'C5', 'A4',
      'B4', 'G4', 'A4', 'F#4', 'G4', '-', '-', '-', 'G4', '-', 'D4', '-', 'G4', '-', '-', '-',
    ];
    let s = 0;
    let next = this.t + .1;
    const tick = () => {
      while (next < this.t + .25) {
        const bar = Math.floor(s / 8) % chords.length, beat = s % 8;
        const ch = chords[bar];
        if (beat % 2 === 0) this.tone(N[bassFor[ch][(beat / 2) % 2]], step * 1.6, { type: 'triangle', vol: .5, bus: this.musicBus, delay: next - this.t });
        else {
          // banjo-ish chord strum on offbeats
          const root = N[bassFor[ch][0]] * 2;
          [1, 1.26, 1.5].forEach((m, i) => this.tone(root * m * (ch === 'E' && i === 1 ? .95 : 1), step * .9, { type: 'square', vol: .06, bus: this.musicBus, delay: next - this.t + i * .012 }));
        }
        const m = mel[s % mel.length];
        if (m !== '-') this.tone(N[m], step * 1.4, { type: 'square', vol: .13, bus: this.musicBus, delay: next - this.t, attack: .003 });
        if (beat % 2 === 1) this.noise(.05, { vol: .08, f0: 8000, f1: 6000, q: .5, type: 'highpass', bus: this.musicBus, delay: next - this.t });
        next += step; s++;
      }
    };
    this.musicTimer = setInterval(tick, 50);
  }
  stopMusic() { clearInterval(this.musicTimer); this.musicTimer = null; }
}
