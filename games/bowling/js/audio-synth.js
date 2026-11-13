// Moo Bowl audio: small live-synthesis voice helpers (oscillators / filtered noise / FM).
// Every voice disconnects itself when it ends.

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const rand = (lo, hi) => lo + Math.random() * (hi - lo);
export const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

export function createSynth(ctx, noiseBuf) {
  const free = (...nodes) => {
    for (const n of nodes) { try { n.disconnect(); } catch (e) { /* ignore */ } }
  };

  /** Oscillator voice. o: freq, freqEnd, dur, gain, type, attack, detune, lp, pan, vib */
  function tone(dest, t, o) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.freq, t);
    if (o.freqEnd) osc.frequency.exponentialRampToValueAtTime(o.freqEnd, t + o.dur);
    if (o.detune) osc.detune.value = o.detune;
    const a = Math.min(o.attack == null ? 0.004 : o.attack, o.dur * 0.5);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(o.gain, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    let head = osc;
    let lp = null, pan = null, lfo = null, lfoG = null;
    if (o.lp) {
      lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = o.lp;
      lp.Q.value = 0.5;
      osc.connect(lp);
      head = lp;
    }
    head.connect(g);
    let tail = g;
    if (o.pan && ctx.createStereoPanner) {
      pan = ctx.createStereoPanner();
      pan.pan.value = clamp(o.pan, -1, 1);
      g.connect(pan);
      tail = pan;
    }
    if (o.vib) {
      lfo = ctx.createOscillator();
      lfoG = ctx.createGain();
      lfo.frequency.value = o.vib.hz || 5.5;
      lfoG.gain.value = o.vib.cents || 10;
      lfo.connect(lfoG).connect(osc.detune);
      lfo.start(t);
      lfo.stop(t + o.dur + 0.05);
    }
    tail.connect(dest);
    osc.start(t);
    osc.stop(t + o.dur + 0.03);
    osc.onended = () => free(osc, lp, g, pan, lfo, lfoG);
  }

  /** Filtered noise burst. o: filter, freq, freqEnd, q, dur, gain, attack, pan */
  function noise(dest, t, o) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = o.filter || 'bandpass';
    f.Q.value = o.q || 0.8;
    f.frequency.setValueAtTime(o.freq, t);
    if (o.freqEnd) f.frequency.exponentialRampToValueAtTime(o.freqEnd, t + o.dur);
    const g = ctx.createGain();
    const a = Math.min(o.attack == null ? 0.003 : o.attack, o.dur * 0.5);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(o.gain, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(f).connect(g);
    let tail = g, pan = null;
    if (o.pan && ctx.createStereoPanner) {
      pan = ctx.createStereoPanner();
      pan.pan.value = clamp(o.pan, -1, 1);
      g.connect(pan);
      tail = pan;
    }
    tail.connect(dest);
    src.start(t, rand(0, noiseBuf.duration - o.dur - 0.1 > 0 ? noiseBuf.duration - o.dur - 0.1 : 0));
    src.stop(t + o.dur + 0.03);
    src.onended = () => free(src, f, g, pan);
  }

  /**
   * Two-operator FM voice (electric piano, vibes, bells).
   * o: freq, ratio, index, indexEnd, idxDur, dur, gain, attack, pan, type
   */
  function fm(dest, t, o) {
    const car = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const mg = ctx.createGain();
    const g = ctx.createGain();
    car.type = o.type || 'sine';
    mod.type = 'sine';
    car.frequency.value = o.freq;
    mod.frequency.value = o.freq * (o.ratio || 1);
    const i0 = o.index * o.freq * (o.ratio || 1);
    const i1 = Math.max(0.01, (o.indexEnd == null ? 0.05 : o.indexEnd) * o.freq * (o.ratio || 1));
    mg.gain.setValueAtTime(i0, t);
    mg.gain.exponentialRampToValueAtTime(i1, t + (o.idxDur || o.dur * 0.6));
    mod.connect(mg).connect(car.frequency);
    const a = Math.min(o.attack == null ? 0.003 : o.attack, o.dur * 0.5);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(o.gain, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    car.connect(g);
    let tail = g, pan = null;
    if (o.pan && ctx.createStereoPanner) {
      pan = ctx.createStereoPanner();
      pan.pan.value = clamp(o.pan, -1, 1);
      g.connect(pan);
      tail = pan;
    }
    tail.connect(dest);
    car.start(t); mod.start(t);
    car.stop(t + o.dur + 0.03); mod.stop(t + o.dur + 0.03);
    car.onended = () => free(car, mod, mg, g, pan);
  }

  return { tone, noise, fm, free };
}
