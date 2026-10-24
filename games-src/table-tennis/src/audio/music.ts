/**
 * Generative synthesized music: a chill lo-fi loop for menus and a brighter, more driving loop
 * for matches. Scheduled with a lookahead timer; tracks crossfade. Every voice is a short-lived
 * node graph that disconnects itself when done.
 */

export type TrackName = 'menu' | 'match';

const mtof = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);

interface TrackDef {
  bpm: number;
  swing: number; // 0..0.33 delay applied to off-beat 16ths
  /** Chord progression: arrays of MIDI notes (bass root first). One chord per bar. */
  chords: number[][];
  scale: number[]; // melody scale (MIDI)
  step: (t: Track, step: number, time: number, bar: number) => void;
}

class Track {
  readonly gain: GainNode;
  private timer = 0;
  private nextTime = 0;
  private stepIdx = 0;
  private stopped = false;
  private lowpass: BiquadFilterNode;

  constructor(
    readonly ctx: AudioContext,
    out: AudioNode,
    readonly def: TrackDef,
    readonly noise: AudioBuffer,
  ) {
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.lowpass = ctx.createBiquadFilter();
    this.lowpass.type = 'lowpass';
    this.lowpass.frequency.value = 9000;
    this.lowpass.connect(this.gain);
    this.gain.connect(out);
  }

  get bus(): AudioNode {
    return this.lowpass;
  }

  get sixteenth(): number {
    return 60 / this.def.bpm / 4;
  }

  start(fadeIn: number): void {
    const t = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(t);
    this.gain.gain.setValueAtTime(this.gain.gain.value, t);
    this.gain.gain.linearRampToValueAtTime(1, t + fadeIn);
    this.nextTime = t + 0.08;
    this.timer = window.setInterval(() => this.schedule(), 25);
    this.schedule();
  }

  stop(fadeOut: number): void {
    if (this.stopped) return;
    this.stopped = true;
    const t = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(t);
    this.gain.gain.setValueAtTime(this.gain.gain.value, t);
    this.gain.gain.linearRampToValueAtTime(0, t + fadeOut);
    window.setTimeout(() => {
      clearInterval(this.timer);
      this.lowpass.disconnect();
      this.gain.disconnect();
    }, (fadeOut + 0.6) * 1000);
  }

  /** Muffle the music (e.g. while paused). */
  setMuffle(on: boolean): void {
    const t = this.ctx.currentTime;
    this.lowpass.frequency.cancelScheduledValues(t);
    this.lowpass.frequency.setTargetAtTime(on ? 900 : 9000, t, 0.15);
  }

  private schedule(): void {
    if (this.stopped) return;
    const ahead = this.ctx.currentTime + 0.18;
    // if the tab was throttled, skip forward instead of bursting
    if (this.nextTime < this.ctx.currentTime - 0.2) this.nextTime = this.ctx.currentTime + 0.05;
    while (this.nextTime < ahead) {
      const s = this.stepIdx % 16;
      const bar = Math.floor(this.stepIdx / 16);
      const sw = s % 2 === 1 ? this.def.swing * this.sixteenth : 0;
      this.def.step(this, s, this.nextTime + sw, bar);
      this.nextTime += this.sixteenth;
      this.stepIdx++;
    }
  }

  // ───────────── instruments ─────────────
  private env(g: GainNode, time: number, peak: number, a: number, d: number): void {
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(peak, time + a);
    g.gain.exponentialRampToValueAtTime(0.0001, time + a + d);
  }

  private cleanup(src: AudioScheduledSourceNode, nodes: AudioNode[]): void {
    src.onended = () => nodes.forEach((n) => n.disconnect());
  }

  kick(time: number, vel = 1): void {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.frequency.setValueAtTime(150, time);
    o.frequency.exponentialRampToValueAtTime(45, time + 0.12);
    this.env(g, time, 0.9 * vel, 0.003, 0.28);
    o.connect(g).connect(this.bus);
    o.start(time);
    o.stop(time + 0.35);
    this.cleanup(o, [o, g]);
  }

  snare(time: number, vel = 1, tone = 1800): void {
    const n = this.ctx.createBufferSource();
    n.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = tone;
    f.Q.value = 0.8;
    const g = this.ctx.createGain();
    this.env(g, time, 0.35 * vel, 0.002, 0.16);
    n.connect(f).connect(g).connect(this.bus);
    const o = this.ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(220, time);
    o.frequency.exponentialRampToValueAtTime(150, time + 0.08);
    const og = this.ctx.createGain();
    this.env(og, time, 0.18 * vel, 0.002, 0.08);
    o.connect(og).connect(this.bus);
    const off = Math.random() * 1.5;
    n.start(time, off, 0.25);
    o.start(time);
    o.stop(time + 0.12);
    this.cleanup(n, [n, f, g]);
    this.cleanup(o, [o, og]);
  }

  hat(time: number, vel = 1, open = false): void {
    const n = this.ctx.createBufferSource();
    n.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 7000;
    const g = this.ctx.createGain();
    this.env(g, time, 0.12 * vel, 0.001, open ? 0.18 : 0.04);
    n.connect(f).connect(g).connect(this.bus);
    n.start(time, Math.random() * 1.5, 0.3);
    this.cleanup(n, [n, f, g]);
  }

  /** Soft electric-piano-ish chord (two detuned triangles per note + sine bell). */
  keys(time: number, notes: number[], dur: number, vel = 1): void {
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(2400, time);
    f.frequency.exponentialRampToValueAtTime(900, time + dur);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(0.07 * vel, time + 0.015);
    g.gain.exponentialRampToValueAtTime(0.03 * vel, time + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    f.connect(g).connect(this.bus);
    const oscs: OscillatorNode[] = [];
    for (const m of notes) {
      for (const [type, det] of [
        ['triangle', -6],
        ['triangle', 6],
        ['sine', 1200],
      ] as const) {
        const o = this.ctx.createOscillator();
        o.type = type;
        o.frequency.value = mtof(m);
        o.detune.value = det;
        if (det === 1200) {
          const bg = this.ctx.createGain();
          bg.gain.setValueAtTime(0.25, time);
          bg.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
          o.connect(bg).connect(f);
          o.onended = () => {
            o.disconnect();
            bg.disconnect();
          };
        } else {
          o.connect(f);
          o.onended = () => o.disconnect();
        }
        o.start(time);
        o.stop(time + dur + 0.05);
        oscs.push(o);
      }
    }
    oscs[0].addEventListener('ended', () => {
      f.disconnect();
      g.disconnect();
    });
  }

  bass(time: number, note: number, dur: number, vel = 1, type: OscillatorType = 'sine'): void {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = mtof(note);
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = type === 'sine' ? 2000 : 600;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(0.32 * vel, time + 0.01);
    g.gain.setTargetAtTime(0.0001, time + dur * 0.7, dur * 0.15);
    o.connect(f).connect(g).connect(this.bus);
    o.start(time);
    o.stop(time + dur + 0.2);
    this.cleanup(o, [o, f, g]);
  }

  pluck(time: number, note: number, vel = 1, dur = 0.25): void {
    const o = this.ctx.createOscillator();
    o.type = 'square';
    o.frequency.value = mtof(note);
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 4;
    f.frequency.setValueAtTime(3200, time);
    f.frequency.exponentialRampToValueAtTime(400, time + dur);
    const g = this.ctx.createGain();
    this.env(g, time, 0.06 * vel, 0.003, dur);
    o.connect(f).connect(g).connect(this.bus);
    o.start(time);
    o.stop(time + dur + 0.05);
    this.cleanup(o, [o, f, g]);
  }

  bell(time: number, note: number, vel = 1): void {
    const o = this.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = mtof(note);
    const o2 = this.ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = mtof(note) * 2.01;
    const g = this.ctx.createGain();
    this.env(g, time, 0.08 * vel, 0.005, 0.9);
    const g2 = this.ctx.createGain();
    g2.gain.value = 0.3;
    o.connect(g);
    o2.connect(g2).connect(g);
    g.connect(this.bus);
    o.start(time);
    o2.start(time);
    o.stop(time + 1);
    o2.stop(time + 1);
    this.cleanup(o, [o, o2, g, g2]);
  }

  crackle(time: number): void {
    const n = this.ctx.createBufferSource();
    n.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 2500 + Math.random() * 3000;
    f.Q.value = 2;
    const g = this.ctx.createGain();
    this.env(g, time, 0.03 + Math.random() * 0.04, 0.0005, 0.008);
    n.connect(f).connect(g).connect(this.bus);
    n.start(time, Math.random() * 1.5, 0.02);
    this.cleanup(n, [n, f, g]);
  }
}

const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

/** Lo-fi: Fmaj9 – Em7 – Dm9 – Cmaj7, lazy swung beat, sparse bells, vinyl crackle. */
const MENU: TrackDef = {
  bpm: 82,
  swing: 0.28,
  chords: [
    [41, 57, 60, 64, 67],
    [40, 55, 59, 62, 67],
    [38, 57, 60, 62, 65],
    [36, 55, 59, 64, 67],
  ],
  scale: [72, 74, 76, 79, 81, 84],
  step(t, s, time, bar) {
    const chord = this.chords[bar % this.chords.length];
    if (s === 0) t.keys(time, chord.slice(1), t.sixteenth * 9, 1);
    if (s === 10 && Math.random() < 0.7) t.keys(time, chord.slice(2), t.sixteenth * 5, 0.6);
    if (s === 0) t.bass(time, chord[0], t.sixteenth * 6);
    if (s === 7 || (s === 10 && Math.random() < 0.5)) t.bass(time, chord[0] + (Math.random() < 0.3 ? 7 : 0), t.sixteenth * 3, 0.7);
    if (s === 0 || s === 7 || (s === 10 && bar % 2 === 1)) t.kick(time, s === 0 ? 0.9 : 0.6);
    if (s === 4 || s === 12) t.snare(time, 0.55, 1400);
    if (s % 2 === 0) t.hat(time, s % 4 === 0 ? 0.55 : 0.35 + Math.random() * 0.2);
    if (s % 2 === 0 && bar % 4 !== 3 && Math.random() < 0.16) t.bell(time, pick(this.scale), 0.7 + Math.random() * 0.3);
    if (Math.random() < 0.25) t.crackle(time + Math.random() * t.sixteenth);
  },
};

/** Upbeat minimal: Am – F – C – G, four-on-the-floor, 16th pluck arps. */
const MATCH: TrackDef = {
  bpm: 116,
  swing: 0.08,
  chords: [
    [45, 69, 72, 76],
    [41, 69, 72, 77],
    [48, 67, 72, 76],
    [43, 67, 71, 74],
  ],
  scale: [69, 72, 74, 76, 79, 81],
  step(t, s, time, bar) {
    const chord = this.chords[bar % this.chords.length];
    const phrase = Math.floor(bar / 4) % 4; // build-up over 16 bars
    if (s % 4 === 0) t.kick(time, 0.85);
    if ((s === 4 || s === 12) && phrase > 0) t.snare(time, 0.5, 2200);
    if (s % 4 === 2) t.hat(time, 0.7, true);
    else if (phrase > 1) t.hat(time, 0.3);
    if (s % 2 === 0 || s === 15) t.bass(time, chord[0] + (s % 4 === 2 ? 12 : 0), t.sixteenth * 1.6, s % 4 === 2 ? 0.75 : 0.95, 'sawtooth');
    const arp = [0, 1, 2, 3, 2, 1, 3, 1];
    const n = chord[1 + (arp[s % 8] % 3)] + (arp[s % 8] === 3 ? 12 : 0);
    t.pluck(time, n, s % 4 === 0 ? 1 : 0.65, 0.18);
    if (s === 0) t.keys(time, chord.slice(1).map((m) => m - 12), t.sixteenth * 14, 0.6);
    if (phrase === 3 && s % 4 === 3 && Math.random() < 0.4) t.bell(time, pick(this.scale) + 12, 0.5);
  },
};

export class Music {
  private current: Track | null = null;
  private name: TrackName | null = null;

  constructor(
    private ctx: AudioContext,
    private out: AudioNode,
    private noise: AudioBuffer,
  ) {}

  get track(): TrackName | null {
    return this.name;
  }

  play(name: TrackName | null, fade = 1.6): void {
    if (name === this.name) return;
    this.name = name;
    this.current?.stop(fade);
    this.current = null;
    if (!name) return;
    const t = new Track(this.ctx, this.out, name === 'menu' ? MENU : MATCH, this.noise);
    t.start(fade);
    this.current = t;
  }

  muffle(on: boolean): void {
    this.current?.setMuffle(on);
  }

  dispose(): void {
    this.current?.stop(0.2);
    this.current = null;
    this.name = null;
  }
}
