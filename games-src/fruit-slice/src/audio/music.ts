/**
 * Procedural music: lookahead-scheduled sequencer with three styles.
 * Instruments are pre-rendered samples (Karplus-Strong koto/bass, taiko kit)
 * plus a few cheap live voices (saw pad, breathy shakuhachi).
 *
 * Key: D major pentatonic (D E F# A B), "yo"-scale flavoured.
 */
import { type Rng, midiToFreq, mulberry32, pick } from './dsp';
import type { DrumName, PluckKind } from './sfx';

export type TrackName = 'menu' | 'game' | 'frenzy';

export interface MusicHost {
  ctx: AudioContext;
  reverb: AudioNode;
  noise: AudioBuffer;
  pluck(midi: number, kind?: PluckKind): { buf: AudioBuffer; rate: number };
  drum(name: DrumName): AudioBuffer | undefined;
  /** time-scale pitch/tempo factor (1 = normal) */
  rate(): number;
}

interface Chord { bass: number; pcs: number[]; pad: number[] }

const CH: Record<string, Chord> = {
  D: { bass: 38, pcs: [2, 6, 9], pad: [62, 66, 69, 76] },
  Bm: { bass: 35, pcs: [11, 2, 6], pad: [59, 62, 66, 69] },
  G: { bass: 43, pcs: [11, 2], pad: [55, 59, 62, 66] },
  A: { bass: 45, pcs: [9, 4], pad: [57, 61, 64, 69] },
  Asus: { bass: 45, pcs: [9, 4, 2], pad: [57, 62, 64, 69] },
  Fm: { bass: 42, pcs: [6, 9], pad: [57, 61, 66, 69] }, // F#m
  Em: { bass: 40, pcs: [4, 11], pad: [55, 59, 64, 67] },
};

const PENT = [0, 2, 4, 7, 9];
/** pentatonic index -> midi (0 = D4) */
const pm = (i: number): number => 62 + 12 * Math.floor(i / 5) + PENT[((i % 5) + 5) % 5];
const pcOf = (i: number): number => pm(i) % 12;

function nearestTone(i: number, ch: Chord, root = false): number {
  const want = root ? [ch.pcs[0]] : ch.pcs;
  for (const d of [0, 1, -1, 2, -2, 3, -3]) if (want.includes(pcOf(i + d))) return i + d;
  return i;
}

// rhythm libraries (16th steps within one bar)
const RH_LOW = [[0, 6, 8, 12], [0, 4, 10], [0, 3, 6, 12], [2, 6, 8, 14], [0, 8, 11]];
const RH_MED = [
  [0, 3, 6, 8, 10, 12], [0, 2, 4, 7, 8, 12, 14], [0, 3, 6, 10, 12], [0, 4, 6, 8, 11, 14],
  [0, 2, 3, 6, 8, 12], [0, 6, 8, 10, 11, 14], [2, 4, 6, 8, 12], [0, 3, 4, 8, 11, 12, 14],
];
const RH_HIGH = [
  [0, 2, 3, 4, 6, 8, 10, 11, 12, 14], [0, 1, 2, 4, 6, 7, 8, 10, 12, 14], [0, 2, 4, 5, 6, 8, 10, 12, 13, 14],
  [0, 3, 4, 6, 8, 9, 10, 12, 14, 15], [0, 2, 3, 6, 7, 8, 10, 11, 14],
];
const CADENCE = [[0, 3, 6, 8], [0, 2, 4, 8], [0, 8], [0, 4, 6]];
const MOVES = [-2, -1, -1, 1, 1, 2, 0, -3, 3, 1, -1];

type Density = 'low' | 'med' | 'high';
interface Motif { rhythm: number[]; moves: number[] }
interface MNote { step: number; idx: number; vel: number; grace: boolean }

function makeMotif(rng: Rng, density: Density): Motif {
  const lib = density === 'low' ? RH_LOW : density === 'high' ? RH_HIGH : RH_MED;
  const rhythm = pick(rng, lib);
  return { rhythm, moves: rhythm.map((_, k) => (k === 0 ? 0 : pick(rng, MOVES))) };
}

/** Realise a 4-bar phrase: statement, sequence, variation, cadence. */
function realise(rng: Rng, m: Motif, chords: Chord[], base: number, lo: number, hi: number, density: Density, answer: boolean): MNote[] {
  const notes: MNote[] = [];
  const lib = density === 'low' ? RH_LOW : density === 'high' ? RH_HIGH : RH_MED;
  for (let bar = 0; bar < 4; bar++) {
    const ch = chords[bar];
    let rhythm = m.rhythm;
    let moves = m.moves;
    if (bar === 2 && rng() < 0.6) {
      rhythm = pick(rng, lib);
      moves = rhythm.map(() => pick(rng, MOVES));
    } else if (bar === 2) {
      moves = m.moves.map((x) => -x); // inversion
    }
    if (bar === 3) rhythm = density === 'high' ? pick(rng, RH_MED) : pick(rng, CADENCE);
    let idx = nearestTone(base + (bar === 1 ? pick(rng, [-1, 1, 2]) : bar === 2 ? 1 : 0), ch);
    rhythm.forEach((on, k) => {
      if (k > 0) idx += moves[k % moves.length] ?? 0;
      if (idx > hi) idx -= 3;
      if (idx < lo) idx += 3;
      if (on % 8 === 0) idx = nearestTone(idx, ch);
      const last = bar === 3 && k === rhythm.length - 1;
      if (last) idx = nearestTone(idx, answer ? CH.D : ch, true);
      const gap = (rhythm[k + 1] ?? 16) - on;
      notes.push({
        step: bar * 16 + on,
        idx,
        vel: (on % 4 === 0 ? 0.85 : 0.62) * (0.88 + rng() * 0.24) * (last ? 1.05 : 1),
        grace: gap >= 4 && rng() < 0.22,
      });
    });
  }
  return notes;
}

type InstName = 'koto' | 'bass' | 'don' | 'ka' | 'shime' | 'shaker' | 'pad' | 'flute' | 'wood' | 'big';

// bus gain / reverb send per instrument
const MIX: Record<InstName, [number, number]> = {
  koto: [0.42, 0.32], bass: [0.5, 0.04], don: [0.62, 0.14], ka: [0.3, 0.1], shime: [0.2, 0.1],
  shaker: [0.12, 0.05], pad: [0.07, 0.45], flute: [0.2, 0.5], wood: [0.25, 0.2], big: [0.7, 0.3],
};

interface Style {
  bpm: number;
  swing: number;
  blocks: string[];
}
const STYLES: Record<TrackName, Style> = {
  menu: { bpm: 88, swing: 0.1, blocks: ['M', 'M2'] },
  game: { bpm: 118, swing: 0.04, blocks: ['A', 'A2', 'B', 'A', 'C', 'B2'] },
  frenzy: { bpm: 138, swing: 0.02, blocks: ['F', 'F2'] },
};

const PROG: Record<string, string[]> = {
  M: ['D', 'Bm', 'G', 'Asus', 'D', 'Fm', 'Em', 'A'],
  A: ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'D', 'A'],
  B: ['G', 'A', 'Fm', 'Bm', 'G', 'A', 'D', 'D'],
  C: ['G', 'G', 'D', 'D', 'Bm', 'Bm', 'A', 'A'],
  F: ['Bm', 'A', 'G', 'A', 'Bm', 'A', 'G', 'D'],
};

export class Track {
  readonly out: GainNode;
  private buses = {} as Record<InstName, GainNode>;
  private sends: GainNode[] = [];
  private next: number;
  private step = 0;
  private rng: Rng;
  private style: Style;
  private block = '';
  private chord: Chord = CH.D;
  private barChords: Chord[] = [];
  private phrase = new Map<number, MNote[]>();
  private motifs: Record<string, Motif> = {};
  stopping = false;
  stopAt = Infinity;

  constructor(private host: MusicHost, readonly name: TrackName, dest: AudioNode, startAt: number, seed: number) {
    const ctx = host.ctx;
    this.style = STYLES[name];
    this.rng = mulberry32(seed);
    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.out.connect(dest);
    (Object.keys(MIX) as InstName[]).forEach((k) => {
      const g = ctx.createGain();
      g.gain.value = MIX[k][0];
      g.connect(this.out);
      const s = ctx.createGain();
      s.gain.value = MIX[k][1];
      g.connect(s).connect(host.reverb);
      this.sends.push(s);
      this.buses[k] = g;
    });
    this.next = startAt;
  }

  fadeIn(t: number, dur: number): void {
    const g = this.out.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(0.0001, t);
    g.linearRampToValueAtTime(1, t + Math.max(0.02, dur));
  }

  fadeOut(t: number, dur: number): void {
    const g = this.out.gain;
    this.stopping = true;
    this.stopAt = t + dur;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(0, t + Math.max(0.02, dur));
  }

  dispose(): void {
    try { this.out.disconnect(); } catch { /* already */ }
    for (const s of this.sends) try { s.disconnect(); } catch { /* already */ }
  }

  private stepDur(step: number): number {
    const base = 60 / this.style.bpm / 4 / this.host.rate();
    return base * (step % 2 === 0 ? 1 + this.style.swing : 1 - this.style.swing);
  }

  /** Schedule all steps that start before `until`. */
  schedule(until: number): void {
    const now = this.host.ctx.currentTime;
    if (this.next < now - 0.05) this.next = now + 0.03; // resync after a stall
    let guard = 0;
    while (this.next < until && this.next < this.stopAt && guard++ < 64) {
      try { this.scheduleStep(this.step, this.next); } catch { /* never kill the loop */ }
      this.next += this.stepDur(this.step);
      this.step++;
    }
  }

  // ------------------------------------------------------------ voices ---

  private hum(t: number, amt = 0.006): number {
    return Math.max(this.host.ctx.currentTime, t + (this.rng() - 0.5) * amt);
  }

  private play(inst: InstName, buf: AudioBuffer | undefined, t: number, vel: number, rate = 1, pan = 0): void {
    if (!buf) return;
    const ctx = this.host.ctx;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate * this.host.rate();
    const g = ctx.createGain();
    g.gain.value = vel;
    src.connect(g);
    if (pan !== 0 && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      g.connect(p).connect(this.buses[inst]);
    } else g.connect(this.buses[inst]);
    src.start(t);
    src.onended = () => { try { g.disconnect(); } catch { /* */ } };
  }

  private koto(midi: number, t: number, vel: number, pan = 0): void {
    const p = this.host.pluck(midi, 'koto');
    this.play('koto', p.buf, t, vel, p.rate, pan);
  }

  private bassNote(midi: number, t: number, vel: number): void {
    const p = this.host.pluck(midi, 'bass');
    this.play('bass', p.buf, t, vel, p.rate);
  }

  private drum(name: DrumName, inst: InstName, t: number, vel: number, pan = 0): void {
    this.play(inst, this.host.drum(name), t, vel * (0.9 + this.rng() * 0.2), 1, pan);
  }

  private pad(notes: number[], t: number, dur: number, vel: number, bright: number): void {
    const ctx = this.host.ctx;
    const r = this.host.rate();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = 0.4;
    lp.frequency.setValueAtTime(500 + 300 * bright, t);
    lp.frequency.linearRampToValueAtTime(900 + 900 * bright, t + dur * 0.5);
    lp.frequency.linearRampToValueAtTime(600 + 300 * bright, t + dur + 1);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel, t + Math.min(0.9, dur * 0.4));
    g.gain.setValueAtTime(vel, t + dur);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.2);
    lp.connect(g).connect(this.buses.pad);
    const end = t + dur + 1.3;
    for (const m of notes) {
      for (const det of [-7, 7]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = midiToFreq(m) * r;
        o.detune.value = det + (this.rng() - 0.5) * 4;
        o.connect(lp);
        o.start(t);
        o.stop(end);
      }
    }
    setTimeout(() => { try { g.disconnect(); } catch { /* */ } }, (end - ctx.currentTime + 0.5) * 1000);
  }

  /** Breathy shakuhachi-like voice. */
  private flute(midi: number, t: number, dur: number, vel: number): void {
    const ctx = this.host.ctx;
    const f = midiToFreq(midi) * this.host.rate();
    const end = t + dur + 0.45;
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.linearRampToValueAtTime(vel, t + 0.14);
    amp.gain.setValueAtTime(vel * 0.85, t + dur);
    amp.gain.exponentialRampToValueAtTime(0.0001, end);
    amp.connect(this.buses.flute);
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(f * 0.965, t); // meri -> kari bend in
    o.frequency.exponentialRampToValueAtTime(f, t + 0.13);
    const o2 = ctx.createOscillator();
    o2.type = 'triangle';
    o2.frequency.setValueAtTime(f * 2 * 0.965, t);
    o2.frequency.exponentialRampToValueAtTime(f * 2, t + 0.13);
    const g2 = ctx.createGain();
    g2.gain.value = 0.12;
    const vib = ctx.createOscillator();
    vib.frequency.value = 4.8 + this.rng();
    const vg = ctx.createGain();
    vg.gain.setValueAtTime(0, t);
    vg.gain.linearRampToValueAtTime(f * 0.007, t + Math.min(dur, 0.6));
    vib.connect(vg);
    vg.connect(o.frequency);
    o.connect(amp);
    o2.connect(g2).connect(amp);
    // breath noise, tuned and broadband
    const n = ctx.createBufferSource();
    n.buffer = this.host.noise;
    n.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = f;
    bp.Q.value = 7;
    const ng = ctx.createGain();
    ng.gain.value = 0.9;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2500;
    const hg = ctx.createGain();
    hg.gain.setValueAtTime(0.12, t);
    hg.gain.exponentialRampToValueAtTime(0.03, t + 0.2); // chiff
    n.connect(bp).connect(ng).connect(amp);
    n.connect(hp).connect(hg).connect(amp);
    for (const s of [o, o2, vib]) { s.start(t); s.stop(end); }
    n.start(t, this.rng() * 2);
    n.stop(end);
  }

  // ---------------------------------------------------------- sequence ---

  private beginBar(bar: number, t: number): void {
    const st = this.style;
    const blockIdx = Math.floor(bar / 8);
    const inBlock = bar % 8;
    if (inBlock === 0) {
      this.block = st.blocks[blockIdx % st.blocks.length];
      const fam = this.block[0];
      const key = fam === 'M' ? 'M' : fam;
      this.barChords = PROG[key].map((c) => CH[c]);
      // new motif for fresh blocks; '2' variants reuse the family motif
      const dens: Density = fam === 'F' ? 'high' : fam === 'M' || fam === 'C' ? 'low' : 'med';
      if (!this.block.endsWith('2') || !this.motifs[fam]) this.motifs[fam] = makeMotif(this.rng, dens);
    }
    this.chord = this.barChords[inBlock];
    if (inBlock % 4 === 0) {
      const fam = this.block[0];
      const dens: Density = fam === 'F' ? 'high' : fam === 'M' || fam === 'C' ? 'low' : 'med';
      const reg = fam === 'B' || fam === 'F' ? [8, 5, 13] : fam === 'M' ? [6, 3, 10] : [5, 3, 10];
      const motif = inBlock === 4 && this.rng() < 0.35 ? makeMotif(this.rng, dens) : this.motifs[fam];
      const ns = realise(this.rng, motif, this.barChords.slice(inBlock, inBlock + 4), reg[0], reg[1], reg[2], dens, inBlock === 4);
      this.phrase.clear();
      for (const n of ns) {
        const arr = this.phrase.get(n.step) ?? [];
        arr.push(n);
        this.phrase.set(n.step, arr);
      }
    }
    // pad per bar
    const barDur = (60 / st.bpm) * 4 / this.host.rate();
    const fam = this.block[0];
    const padVel = fam === 'M' ? 0.55 : fam === 'C' ? 0.6 : fam === 'B' ? 0.35 : fam === 'F' ? 0.3 : 0.25;
    this.pad(this.chord.pad, t, barDur * 0.98, padVel, fam === 'F' ? 1 : 0.4);
  }

  private scheduleStep(step: number, t: number): void {
    const s = step % 16;
    const bar = Math.floor(step / 16);
    if (s === 0) this.beginBar(bar, t);
    const fam = this.block[0];
    const inBlock = bar % 8;
    const rng = this.rng;
    const ch = this.chord;

    // melody
    {
      const ps = (inBlock % 4) * 16 + s;
      const notes = this.phrase.get(ps);
      if (notes) {
        for (const n of notes) {
          let midi = pm(n.idx);
          if (fam === 'C') {
            // breakdown: long breathy flute notes on strong steps only
            if (s % 4 === 0 && (s === 0 || rng() < 0.4)) this.flute(midi, this.hum(t, 0.01), 0.9 + rng() * 0.8, 0.5 * n.vel);
            continue;
          }
          if (fam === 'F' && n.idx < 8) midi += 12;
          const tt = this.hum(t, 0.012);
          if (n.grace && fam !== 'F') this.koto(pm(n.idx - 1) + (midi - pm(n.idx)), Math.max(this.host.ctx.currentTime, tt - 0.04), n.vel * 0.45, -0.1);
          this.koto(midi, tt, n.vel, (rng() - 0.5) * 0.3);
        }
      }
    }

    switch (fam) {
      case 'M': this.menuStep(s, t, bar, inBlock, ch); break;
      case 'A': case 'B': this.gameStep(s, t, inBlock, ch, fam === 'B'); break;
      case 'C': this.breakStep(s, t, inBlock, ch); break;
      case 'F': this.frenzyStep(s, t, bar, inBlock, ch); break;
    }
  }

  private arp(s: number, t: number, ch: Chord, pattern: number[], vel: number, lo: number): void {
    const k = pattern.indexOf(s);
    if (k < 0) return;
    let idx = nearestTone(lo, ch, true);
    for (let i = 0; i < k; i++) idx = nearestTone(idx + 2, ch);
    this.koto(pm(idx), this.hum(t, 0.014), vel * (k === 0 ? 1 : 0.75 + this.rng() * 0.2), 0.25);
  }

  private menuStep(s: number, t: number, bar: number, inBlock: number, ch: Chord): void {
    const rng = this.rng;
    if (s === 0) this.bassNote(ch.bass, this.hum(t), 0.55);
    if (s === 10) this.bassNote(ch.bass + 7, this.hum(t), 0.28);
    // gentle low arpeggio on alternate bars, or under the melody softly
    this.arp(s, t, ch, bar % 2 === 0 ? [0, 3, 6, 10] : [0, 4, 8, 11, 14], 0.32, -2);
    // shaker 8ths (swung), soft
    if (s % 2 === 0) this.drum((['shaker0', 'shaker1', 'shaker2'] as DrumName[])[(s / 2) % 3], 'shaker', this.hum(t, 0.008), s % 4 === 2 ? 0.55 : 0.3, 0.3);
    if (s === 14 && bar % 2 === 1) this.drum(rng() < 0.5 ? 'woodHi' : 'woodLo', 'wood', this.hum(t), 0.35, -0.3);
    if (s === 0 && inBlock === 0) this.drum('don', 'don', t, 0.4);
    // occasional shakuhachi phrase
    if (this.block === 'M2' && s === 8 && inBlock % 4 === 1 && rng() < 0.7) {
      const idx = nearestTone(4 + Math.floor(rng() * 4), ch);
      this.flute(pm(idx), t, 1.3, 0.35);
    }
  }

  private gameStep(s: number, t: number, inBlock: number, ch: Chord, busy: boolean): void {
    const rng = this.rng;
    const fill = inBlock === 7 && s >= 8;
    // taiko
    if (!fill) {
      const don: Record<number, number> = busy ? { 0: 1, 3: 0.5, 6: 0.7, 8: 0.9, 11: 0.6, 14: 0.5 } : { 0: 1, 7: 0.55, 8: 0.85, 11: 0.5 };
      if (don[s]) this.drum('don', 'don', this.hum(t, 0.004), don[s]);
      if (s === 4 || s === 12) this.drum('ka', 'ka', this.hum(t, 0.004), 0.75, 0.2);
      if (s === 14 && rng() < 0.6) this.drum('ka', 'ka', this.hum(t, 0.004), 0.3, 0.2);
    } else {
      const f: Record<number, number> = { 8: 0.75, 10: 0.7, 12: 0.85, 13: 0.6, 14: 0.95, 15: 0.75 };
      if (f[s]) this.drum('don', 'don', this.hum(t, 0.003), f[s], (s % 2 ? 0.15 : -0.15));
      if (s === 11) this.drum('ka', 'ka', t, 0.6);
    }
    if (busy && s % 2 === 0) this.drum('shime', 'shime', this.hum(t, 0.004), s % 4 === 0 ? 0.5 : 0.3, -0.25);
    // shaker 16ths
    const sv = [0.22, 0.1, 0.4, 0.12][s % 4];
    this.drum((['shaker0', 'shaker1', 'shaker2'] as DrumName[])[s % 3], 'shaker', this.hum(t, 0.005), sv * (busy ? 1.2 : 1), 0.35);
    // bass
    const bp: [number, number, number][] = busy
      ? [[0, 0, 1], [2, 0, 0.5], [4, 12, 0.7], [6, 0, 0.6], [8, 7, 0.9], [10, 7, 0.5], [12, 12, 0.7], [14, 0, 0.55]]
      : [[0, 0, 1], [3, 0, 0.6], [6, 12, 0.7], [8, 0, 0.9], [11, 7, 0.6], [14, 12, 0.65]];
    for (const [st, semi, v] of bp) if (st === s) this.bassNote(ch.bass + semi, this.hum(t, 0.006), v * 0.9);
    // koto chord stabs in B
    if (busy && (s === 6 || s === 14)) {
      const idx = nearestTone(2, ch);
      this.koto(pm(idx), this.hum(t), 0.3, -0.35);
      this.koto(pm(nearestTone(idx + 2, ch)), this.hum(t + 0.012), 0.26, -0.35);
    }
  }

  private breakStep(s: number, t: number, inBlock: number, ch: Chord): void {
    if (inBlock < 7) {
      if (s === 0 && inBlock % 2 === 0) this.drum('donBig', 'big', t, 0.55);
      if (s === 0) this.bassNote(ch.bass, this.hum(t), 0.7);
      if (s === 8 && inBlock % 2 === 1) this.bassNote(ch.bass + 7, this.hum(t), 0.4);
      this.arp(s, t, ch, [0, 3, 6, 8, 11, 14], 0.3, 3);
      if (inBlock >= 4 && s % 2 === 0) this.drum('shaker1', 'shaker', this.hum(t), s % 4 === 2 ? 0.35 : 0.18, 0.3);
      if (inBlock >= 6 && (s === 4 || s === 12)) this.drum('ka', 'ka', t, 0.5);
    } else {
      // build-up roll
      const prog = s / 15;
      if (s % 2 === 0 || s >= 8) this.drum('don', 'don', this.hum(t, 0.003), 0.35 + 0.6 * prog, s % 2 ? 0.15 : -0.15);
      this.drum('shime', 'shime', t, 0.2 + 0.4 * prog);
      if (s === 0) this.bassNote(ch.bass, t, 0.7);
    }
  }

  private frenzyStep(s: number, t: number, bar: number, inBlock: number, ch: Chord): void {
    const fill = inBlock % 4 === 3 && s >= 12;
    if (s === 0 && bar % 4 === 0) this.drum('donBig', 'big', t, 0.8);
    if (!fill) {
      const don: Record<number, number> = { 0: 1, 3: 0.6, 6: 0.8, 8: 0.95, 10: 0.55, 11: 0.7, 14: 0.8 };
      if (don[s]) this.drum('don', 'don', this.hum(t, 0.003), don[s], s % 2 ? 0.12 : -0.12);
      if (s === 4 || s === 12) this.drum('ka', 'ka', this.hum(t, 0.003), 0.85, 0.2);
      if (s === 2 || s === 7 || s === 15) this.drum('ka', 'ka', this.hum(t, 0.003), 0.35, 0.2);
    } else this.drum('don', 'don', t, 0.6 + (s - 12) * 0.12, s % 2 ? 0.2 : -0.2);
    this.drum('shime', 'shime', this.hum(t, 0.003), s % 4 === 0 ? 0.5 : s % 2 === 0 ? 0.35 : 0.2, -0.25);
    this.drum((['shaker0', 'shaker1', 'shaker2'] as DrumName[])[s % 3], 'shaker', this.hum(t, 0.004), [0.3, 0.15, 0.5, 0.18][s % 4], 0.35);
    if (s % 2 === 0) {
      const semi = [0, 12, 0, 12, 0, 12, 7, 12][s / 2];
      this.bassNote(ch.bass + semi, this.hum(t, 0.004), s % 4 === 0 ? 0.95 : 0.7);
    }
  }
}
