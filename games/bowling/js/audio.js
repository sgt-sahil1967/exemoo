// Moo Bowl audio. Web Audio only, everything synthesised in code (no files).
//
//   const audio = createAudio();      // safe before any gesture, creates nothing yet
//   audio.unlock();                   // from a click/tap: builds the context and resumes it
//
// Pre-gesture (or with no Web Audio) every method is a silent no-op and never throws. The music
// mode and ambience requested before unlock are remembered and start once unlocked.
//
// Graph:  sfxBus --\                                    (reverb send: pins, stingers, crowd)
//                   +-> comp -> brickwall limiter -> soft clip -> master(mute) -> destination
//  musicBus -> duck /
//
// One-shots are rendered as Float32Arrays by audio-dsp.js (pure functions, unit-tested in Node)
// and copied into AudioBuffers; stingers, UI and music use live oscillator synthesis.

import {
  renderPin, renderIR, renderBrown, renderPink, renderRelease, renderGutter, renderPit,
  renderPinsetter, renderCheer, renderAww, renderClap,
} from './audio-dsp.js';
import { createSynth, clamp, rand, mtof } from './audio-synth.js';
import { createMusic } from './audio-music.js';

const PIN_VARIANTS = 6;
const MAX_PIN_VOICES = 14;
const MIN_SPACING = { hit: 0.004, clack: 0.004, floor: 0.006 };

export function createAudio() {
  let ctx = null;
  let ok = true;             // false once Web Audio is known to be unavailable
  let unlocked = false;
  let muted = false;
  let wantMusic = 'off';
  let wantAmbience = false;

  // graph nodes
  let sfx, musicBus, musicDuck, comp, limiter, shaper, master, reverbIn, reverbOut, noiseBuf, synth, music;
  const bufs = {};           // name -> AudioBuffer
  const pinVoices = [];
  const lastPinT = { hit: 0, clack: 0, floor: 0 };
  let lastDuck = 0;
  let roll = null;           // live roll voice
  let ambience = null;
  let ambTimer = null;

  const api = {};
  const safe = (fn) => (...a) => {
    try { return ctx && unlocked ? fn(...a) : undefined; } catch (e) { return undefined; }
  };

  // ---------- context / graph ----------
  function build() {
    const Ctor = typeof globalThis !== 'undefined' && (globalThis.AudioContext || globalThis.webkitAudioContext);
    if (!Ctor) { ok = false; return false; }
    try { ctx = new Ctor({ latencyHint: 'interactive' }); } catch (e) {
      try { ctx = new Ctor(); } catch (e2) { ok = false; return false; }
    }
    const sr = ctx.sampleRate;
    sfx = ctx.createGain(); sfx.gain.value = 0.9;
    musicBus = ctx.createGain(); musicBus.gain.value = 0.5;
    musicDuck = ctx.createGain(); musicDuck.gain.value = 1;
    const premix = ctx.createGain(); premix.gain.value = 0.8;
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 18; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.2;
    limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -3; limiter.knee.value = 0; limiter.ratio.value = 20; limiter.attack.value = 0.001; limiter.release.value = 0.08;
    shaper = ctx.createWaveShaper();
    const curve = new Float32Array(2048);
    const k = 1.4, norm = Math.tanh(k);
    for (let i = 0; i < curve.length; i++) { const x = (i / (curve.length - 1)) * 2 - 1; curve[i] = Math.tanh(k * x) / norm; }
    shaper.curve = curve; shaper.oversample = '2x';
    master = ctx.createGain(); master.gain.value = muted ? 0 : 1;
    sfx.connect(premix);
    musicBus.connect(musicDuck); musicDuck.connect(premix);
    premix.connect(comp); comp.connect(limiter); limiter.connect(shaper); shaper.connect(master); master.connect(ctx.destination);

    // short hall reverb
    reverbIn = ctx.createGain(); reverbIn.gain.value = 1;
    const conv = ctx.createConvolver();
    const ir = renderIR(sr, 5, 1.0);
    const irBuf = ctx.createBuffer(2, ir[0].length, sr);
    irBuf.copyToChannel(ir[0], 0); irBuf.copyToChannel(ir[1], 1);
    conv.buffer = irBuf;
    reverbOut = ctx.createGain(); reverbOut.gain.value = 0.55;
    reverbIn.connect(conv); conv.connect(reverbOut); reverbOut.connect(sfx);

    // shared white noise for live synth
    noiseBuf = ctx.createBuffer(1, sr * 2, sr);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    synth = createSynth(ctx, noiseBuf);
    music = createMusic({ ctx, dest: musicBus, synth });

    // pre-render the pin knocks right away, the heavier buffers a little later
    for (const t of ['hit', 'clack', 'floor']) for (let v = 0; v < PIN_VARIANTS; v++) toBuf(`${t}${v}`, renderPin(t, sr, v + 1));
    toBuf('release', renderRelease(sr));
    const lazy = [
      ['gutter', () => renderGutter(sr)], ['pit', () => renderPit(sr)],
      ['sweep', () => renderPinsetter(sr, false)], ['rack', () => renderPinsetter(sr, true)],
      ['cheer', () => renderCheer(sr)], ['aww', () => renderAww(sr)], ['clap', () => renderClap(sr)],
      ['brown', () => renderBrown(sr, 2, 3)], ['pink', () => renderPink(sr, 2, 4)],
    ];
    lazy.forEach(([name, fn], i) => setTimeout(() => { try { if (!bufs[name]) toBuf(name, fn()); } catch (e) { /* ignore */ } }, 40 * (i + 1)));
    lazy.forEach(([name, fn]) => { lazyFns[name] = fn; });
    return true;
  }
  const lazyFns = {};

  function toBuf(name, chs) {
    const b = ctx.createBuffer(chs.length, chs[0].length, ctx.sampleRate);
    for (let c = 0; c < chs.length; c++) b.copyToChannel(chs[c], c);
    bufs[name] = b;
    return b;
  }
  function getBuf(name) {
    if (bufs[name]) return bufs[name];
    if (lazyFns[name]) return toBuf(name, lazyFns[name]());
    return null;
  }

  // ---------- helpers ----------
  /** Play a pre-rendered buffer through optional lowpass / pan / reverb send. */
  function playBuf(buf, o = {}) {
    if (!buf) return null;
    const t = o.t == null ? ctx.currentTime : o.t;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = o.rate || 1;
    const g = ctx.createGain();
    g.gain.value = o.gain == null ? 1 : o.gain;
    let head = src, lp = null, pan = null, send = null;
    if (o.lp) { lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.lp; lp.Q.value = 0.6; head.connect(lp); head = lp; }
    head.connect(g);
    let tail = g;
    if (ctx.createStereoPanner && o.pan) { pan = ctx.createStereoPanner(); pan.pan.value = clamp(o.pan, -1, 1); g.connect(pan); tail = pan; }
    tail.connect(o.dest || sfx);
    if (o.send) { send = ctx.createGain(); send.gain.value = o.send; tail.connect(send); send.connect(reverbIn); }
    src.start(t);
    const dur = buf.duration / (o.rate || 1);
    const voice = { src, g, lp, pan, send, end: t + dur, level: o.gain == null ? 1 : o.gain };
    src.onended = () => {
      for (const n of [src, g, lp, pan, send]) if (n) { try { n.disconnect(); } catch (e) { /* ignore */ } }
      if (o.onend) o.onend(voice);
    };
    return voice;
  }

  function duck(depth, hold = 0.25, release = 0.5) {
    const now = ctx.currentTime;
    if (now - lastDuck < 0.12) return;
    lastDuck = now;
    const p = musicDuck.gain;
    p.cancelScheduledValues(now);
    p.setTargetAtTime(1 - depth, now, 0.02);
    p.setTargetAtTime(1, now + hold, release / 3);
  }

  // ---------- pin sounds ----------
  function pinVoice(type, strength, x, extra = {}) {
    const now = ctx.currentTime;
    const s = clamp(strength == null ? 0.6 : strength, 0, 1);
    // spacing: stagger rather than drop, but drop if it would lag noticeably
    let t = Math.max(now + Math.random() * 0.004, lastPinT[type] + MIN_SPACING[type]);
    if (t - now > 0.06) return;
    lastPinT[type] = t;

    let level;
    let cutoff;
    let semis;
    if (type === 'hit') { level = 0.28 + 0.72 * Math.pow(s, 1.1); cutoff = 2200 + s * s * 16000; semis = rand(-2.5, 2.5) - s * 1.0; }
    else if (type === 'clack') { level = 0.12 + 0.62 * Math.pow(s, 1.2); cutoff = 3500 + s * s * 14000; semis = rand(-3, 3); }
    else { level = 0.1 + 0.55 * Math.pow(s, 1.1); cutoff = 700 + s * 2800; semis = rand(-2.5, 2); }
    level *= extra.gain == null ? 1 : extra.gain;
    if (extra.lp) cutoff = Math.min(cutoff, extra.lp);

    // voice limit: steal the quietest remaining voice, or drop this one if it is quieter still
    if (pinVoices.length >= MAX_PIN_VOICES) {
      let wi = -1, wv = Infinity;
      for (let i = 0; i < pinVoices.length; i++) {
        const v = pinVoices[i];
        const rem = Math.max(0, v.end - now) + 0.02;
        const score = v.level * rem;
        if (score < wv) { wv = score; wi = i; }
      }
      if (wi >= 0 && wv > level * 0.25) return; // everything playing is louder than this one
      if (wi >= 0) {
        const v = pinVoices[wi];
        pinVoices.splice(wi, 1);
        try { v.g.gain.cancelScheduledValues(now); v.g.gain.setTargetAtTime(0, now, 0.004); v.src.stop(now + 0.025); } catch (e) { /* ignore */ }
      }
    }

    const buf = getBuf(`${type}${Math.floor(Math.random() * PIN_VARIANTS)}`);
    const voice = playBuf(buf, {
      t, gain: level, rate: Math.pow(2, semis / 12), lp: cutoff,
      pan: clamp((x || 0) * 1.8, -1, 1),
      send: (type === 'clack' ? 0.34 : type === 'hit' ? 0.28 : 0.2) * (extra.send == null ? 1 : extra.send),
      onend: (v) => { const i = pinVoices.indexOf(v); if (i >= 0) pinVoices.splice(i, 1); },
    });
    if (voice) pinVoices.push(voice);
    if (type === 'hit' && s > 0.55) duck(0.18 + 0.15 * s, 0.18, 0.6);
  }

  // ---------- rolling ----------
  function startRoll() {
    const brown = getBuf('brown'), pink = getBuf('pink');
    if (!brown || !pink) return null;
    const r = {};
    r.out = ctx.createGain(); r.out.gain.value = 0;
    r.pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    r.mix = ctx.createGain();
    r.am = ctx.createGain(); r.am.gain.value = 0.9;
    r.mix.connect(r.am); r.am.connect(r.pan); r.pan.connect(r.out); r.out.connect(sfx);
    const mkSrc = (b, rate) => { const s = ctx.createBufferSource(); s.buffer = b; s.loop = true; s.playbackRate.value = rate; return s; };
    r.brown = mkSrc(brown, 1); r.pink = mkSrc(pink, 1);
    // wood path
    r.nGain = ctx.createGain(); r.nGain.gain.value = 1;
    r.lp = ctx.createBiquadFilter(); r.lp.type = 'lowpass'; r.lp.frequency.value = 300; r.lp.Q.value = 0.8;
    r.bodyG = ctx.createGain(); r.bodyG.gain.value = 1;
    r.hiss = ctx.createBiquadFilter(); r.hiss.type = 'bandpass'; r.hiss.frequency.value = 1800; r.hiss.Q.value = 0.8;
    r.hissG = ctx.createGain(); r.hissG.gain.value = 0;
    r.rumble = ctx.createOscillator(); r.rumble.type = 'sine'; r.rumble.frequency.value = 42;
    r.rumble2 = ctx.createOscillator(); r.rumble2.type = 'triangle'; r.rumble2.frequency.value = 84;
    r.rumG = ctx.createGain(); r.rumG.gain.value = 0;
    r.brown.connect(r.lp); r.lp.connect(r.bodyG); r.bodyG.connect(r.nGain);
    r.pink.connect(r.hiss); r.hiss.connect(r.hissG); r.hissG.connect(r.nGain);
    r.rumble.connect(r.rumG); r.rumble2.connect(r.rumG); r.rumG.connect(r.nGain);
    r.nGain.connect(r.mix);
    // gutter path: hollow resonant plastic
    r.gGain = ctx.createGain(); r.gGain.gain.value = 0;
    r.g1 = ctx.createBiquadFilter(); r.g1.type = 'bandpass'; r.g1.frequency.value = 410; r.g1.Q.value = 9;
    r.g2 = ctx.createBiquadFilter(); r.g2.type = 'bandpass'; r.g2.frequency.value = 870; r.g2.Q.value = 7;
    r.g3 = ctx.createBiquadFilter(); r.g3.type = 'bandpass'; r.g3.frequency.value = 2300; r.g3.Q.value = 5;
    r.g1G = ctx.createGain(); r.g1G.gain.value = 3;
    r.g2G = ctx.createGain(); r.g2G.gain.value = 1.6;
    r.g3G = ctx.createGain(); r.g3G.gain.value = 0.6;
    r.brown.connect(r.g1); r.g1.connect(r.g1G); r.g1G.connect(r.gGain);
    r.brown.connect(r.g2); r.g2.connect(r.g2G); r.g2G.connect(r.gGain);
    r.pink.connect(r.g3); r.g3.connect(r.g3G); r.g3G.connect(r.gGain);
    r.gGain.connect(r.mix);
    // ball rotation: periodic amplitude modulation
    r.lfo = ctx.createOscillator(); r.lfo.frequency.value = 6;
    r.lfoG = ctx.createGain(); r.lfoG.gain.value = 0.1;
    r.lfo.connect(r.lfoG); r.lfoG.connect(r.am.gain);
    const t = ctx.currentTime;
    r.brown.start(t, Math.random() * 1.5); r.pink.start(t, Math.random() * 1.5);
    r.rumble.start(t); r.rumble2.start(t); r.lfo.start(t);
    r.nodes = ['brown', 'pink', 'rumble', 'rumble2', 'lfo'];
    return r;
  }
  function stopRoll(r) {
    const now = ctx.currentTime;
    r.out.gain.cancelScheduledValues(now);
    r.out.gain.setTargetAtTime(0, now, 0.025);
    setTimeout(() => {
      try {
        for (const k of r.nodes) r[k].stop();
        for (const k of Object.keys(r)) if (r[k] && typeof r[k].disconnect === 'function') r[k].disconnect();
      } catch (e) { /* ignore */ }
    }, 220);
  }

  api.roll = safe((o) => {
    if (!o || !o.active) {
      if (roll) { stopRoll(roll); roll = null; }
      return;
    }
    if (muted) { if (roll) { stopRoll(roll); roll = null; } return; }
    if (!roll) { roll = startRoll(); if (!roll) return; }
    const r = roll;
    const now = ctx.currentTime;
    const sp = Number.isFinite(o.speed) ? o.speed : 6;
    const s = clamp((sp - 3.5) / 7, 0, 1);
    const d = clamp(-(Number.isFinite(o.z) ? o.z : 0) / 19, 0, 1);
    const dist = 1 - 0.8 * d * (0.6 + 0.4 * d);
    const dull = 1 - 0.62 * d;
    const gut = o.gutter ? 1 : 0;
    const T = 0.06;
    const lvl = (0.2 + 0.8 * s) * dist;
    r.out.gain.setTargetAtTime(0.85 * (0.7 + 0.3 * (1 - gut * 0.1)), now, 0.04);
    r.nGain.gain.setTargetAtTime((1 - gut) * lvl, now, T);
    r.gGain.gain.setTargetAtTime(gut * lvl * 0.55, now, T);
    r.lp.frequency.setTargetAtTime((240 + s * s * 1700 + s * 300) * dull, now, T);
    r.bodyG.gain.setTargetAtTime(1.9, now, T);
    r.hissG.gain.setTargetAtTime(0.1 * s * s * dull * 1.1 + 0.01, now, T);
    r.hiss.frequency.setTargetAtTime((1300 + s * 1900) * dull, now, T);
    r.rumG.gain.setTargetAtTime(0.5 * (0.35 + 0.65 * s) * (1 - 0.5 * d), now, T);
    r.rumble.frequency.setTargetAtTime(38 + s * 26, now, 0.1);
    r.rumble2.frequency.setTargetAtTime(76 + s * 52, now, 0.1);
    r.g1.frequency.setTargetAtTime(370 + s * 110, now, 0.1);
    r.g2.frequency.setTargetAtTime(780 + s * 200, now, 0.1);
    // revolutions per second of a 0.109 m radius ball
    r.lfo.frequency.setTargetAtTime(clamp(sp / 0.685, 3, 16), now, 0.1);
    r.lfoG.gain.setTargetAtTime(gut ? 0.22 : 0.08 + 0.05 * s, now, 0.1);
    r.pan.pan && r.pan.pan.setTargetAtTime(clamp(((o.x || 0) * 1.8) * (1 - 0.3 * d), -1, 1), now, 0.05);
  });

  // ---------- one-shot effects ----------
  api.release = safe((speed) => {
    if (muted) return;
    const s = clamp(((speed == null ? 7 : speed) - 3.5) / 7, 0, 1);
    playBuf(getBuf('release'), { gain: 0.5 + 0.5 * s, rate: Math.pow(2, rand(-1, 1) / 12), send: 0.12 });
  });
  api.pinHit = safe((strength, x) => { if (!muted) pinVoice('hit', strength, x); });
  api.pinClack = safe((strength, x) => { if (!muted) pinVoice('clack', strength, x); });
  api.pinFloor = safe((strength) => { if (!muted) pinVoice('floor', strength, 0); });
  api.gutter = safe(() => { if (!muted) playBuf(getBuf('gutter'), { gain: 0.8, rate: Math.pow(2, rand(-1, 1) / 12), send: 0.15 }); });
  api.ballPit = safe(() => { if (!muted) { playBuf(getBuf('pit'), { gain: 0.95, send: 0.1 }); duck(0.15, 0.2, 0.5); } });
  api.sweep = safe(() => { if (!muted) playBuf(getBuf('sweep'), { gain: 0.6, send: 0.08 }); });
  api.rack = safe(() => { if (!muted) playBuf(getBuf('rack'), { gain: 0.6, send: 0.08 }); });

  // ---------- jingles ----------
  function bell(dest, t, midi, dur, g, pan) {
    const f = mtof(midi);
    synth.fm(dest, t, { freq: f, ratio: 3.5, index: 0.8, indexEnd: 0.02, idxDur: 0.3, dur, gain: g, attack: 0.002, pan });
    synth.tone(dest, t, { freq: f * 2, dur: dur * 0.4, gain: g * 0.15, attack: 0.002, pan });
  }
  function sparkle(dest, t, n, span, g) {
    for (let i = 0; i < n; i++) {
      const f = rand(3000, 7000);
      synth.tone(dest, t + Math.random() * span, { freq: f, dur: rand(0.08, 0.2), gain: g * rand(0.4, 1), attack: 0.001, pan: rand(-0.8, 0.8) });
    }
  }
  function brass(dest, t, midi, dur, g) {
    const f = mtof(midi);
    for (const d of [-8, 8]) synth.tone(dest, t, { freq: f, dur, gain: g, type: 'sawtooth', detune: d, attack: 0.03, lp: 2200 });
  }

  api.call = safe((kind) => {
    if (muted) return;
    const t = ctx.currentTime + 0.02;
    const out = sfx;
    switch (kind) {
      case 'strike': {
        [72, 76, 79, 84, 88].forEach((m, i) => bell(out, t + i * 0.07, m, 0.7, 0.2, -0.3 + i * 0.15));
        brass(out, t + 0.28, 60, 0.7, 0.05); brass(out, t + 0.28, 67, 0.7, 0.04); brass(out, t + 0.28, 76, 0.7, 0.04);
        sparkle(out, t + 0.3, 9, 0.5, 0.06);
        duck(0.4, 0.9, 0.6);
        break;
      }
      case 'turkey': {
        [67, 72, 76, 79].forEach((m, i) => { brass(out, t + i * 0.13, m, 0.18, 0.06); bell(out, t + i * 0.13, m + 12, 0.5, 0.12, -0.4 + i * 0.25); });
        [72, 76, 79, 84].forEach((m) => brass(out, t + 0.6, m, 1.1, 0.055));
        brass(out, t + 0.6, 48, 1.1, 0.06);
        [84, 88, 91, 96].forEach((m, i) => bell(out, t + 0.62 + i * 0.09, m, 0.8, 0.14, rand(-0.6, 0.6)));
        sparkle(out, t + 0.6, 20, 1.1, 0.06);
        synth.noise(out, t + 0.6, { filter: 'highpass', freq: 5000, dur: 0.9, gain: 0.04, attack: 0.1 });
        duck(0.5, 1.6, 0.8);
        break;
      }
      case 'spare': {
        bell(out, t, 79, 0.5, 0.2, -0.15);
        bell(out, t + 0.12, 84, 0.8, 0.22, 0.15);
        sparkle(out, t + 0.12, 3, 0.2, 0.05);
        duck(0.25, 0.5, 0.5);
        break;
      }
      case 'split': {
        synth.tone(out, t, { freq: mtof(64), dur: 0.3, gain: 0.14, type: 'triangle', vib: { hz: 6, cents: 25 }, lp: 1800, attack: 0.01 });
        synth.tone(out, t + 0.17, { freq: mtof(70), dur: 0.5, gain: 0.14, type: 'triangle', vib: { hz: 6, cents: 30 }, lp: 1800, attack: 0.01 });
        synth.tone(out, t + 0.17, { freq: mtof(71), dur: 0.5, gain: 0.08, type: 'triangle', lp: 1800, attack: 0.01 });
        duck(0.2, 0.5, 0.5);
        break;
      }
      case 'gutter': {
        synth.tone(out, t, { freq: 620, freqEnd: 110, dur: 0.75, gain: 0.2, type: 'triangle', vib: { hz: 9, cents: 70 }, lp: 2400, attack: 0.01 });
        synth.tone(out, t, { freq: 625, freqEnd: 112, dur: 0.75, gain: 0.08, type: 'sawtooth', lp: 1200, attack: 0.01 });
        synth.tone(out, t + 0.74, { freq: 120, freqEnd: 62, dur: 0.3, gain: 0.35, attack: 0.003 });
        synth.noise(out, t + 0.74, { filter: 'lowpass', freq: 400, dur: 0.1, gain: 0.15 });
        duck(0.2, 0.9, 0.5);
        break;
      }
      case 'open': {
        synth.fm(out, t, { freq: mtof(81), ratio: 2, index: 0.5, indexEnd: 0.02, dur: 0.22, gain: 0.12, attack: 0.003 });
        synth.tone(out, t + 0.07, { freq: mtof(74), dur: 0.2, gain: 0.07, type: 'triangle', attack: 0.004 });
        break;
      }
      default: break;
    }
  });

  api.crowd = safe((kind) => {
    if (muted) return;
    const names = { cheer: 'cheer', aww: 'aww', clap: 'clap' };
    const name = names[kind];
    if (!name) return;
    const g = kind === 'cheer' ? 0.55 : kind === 'aww' ? 0.5 : 0.42;
    playBuf(getBuf(name), { gain: g, rate: Math.pow(2, rand(-0.6, 0.6) / 12), send: 0.18 });
    if (kind === 'cheer') duck(0.3, 1.2, 0.8);
  });

  api.ui = safe((kind) => {
    if (muted) return;
    const t = ctx.currentTime + 0.005;
    const woody = (tt, f, g) => {
      synth.tone(sfx, tt, { freq: f, freqEnd: f * 0.72, dur: 0.07, gain: g, attack: 0.001 });
      synth.noise(sfx, tt, { filter: 'bandpass', freq: f * 2.6, q: 2, dur: 0.025, gain: g * 0.8, attack: 0.001 });
    };
    switch (kind) {
      case 'move': woody(t, 780, 0.1); break;
      case 'select':
        woody(t, 620, 0.14);
        synth.fm(sfx, t + 0.05, { freq: 990, ratio: 2, index: 0.4, indexEnd: 0.02, dur: 0.16, gain: 0.1, attack: 0.002 });
        break;
      case 'back': woody(t, 480, 0.12); synth.tone(sfx, t + 0.04, { freq: 360, freqEnd: 300, dur: 0.1, gain: 0.07, type: 'triangle' }); break;
      case 'start':
        woody(t, 520, 0.16);
        [67, 72, 76, 79].forEach((m, i) => synth.fm(sfx, t + 0.06 + i * 0.065, { freq: mtof(m), ratio: 3.5, index: 0.6, indexEnd: 0.02, dur: 0.4, gain: 0.12, attack: 0.002 }));
        break;
      default: break;
    }
  });

  // ---------- music & ambience ----------
  api.music = (mode) => {
    wantMusic = ['title', 'game', 'results', 'off'].includes(mode) ? mode : 'off';
    try { if (ctx && unlocked && music && !hidden()) music.setMode(wantMusic); } catch (e) { /* ignore */ }
  };

  function ambStart() {
    if (ambience) return;
    const brown = getBuf('brown'), pink = getBuf('pink');
    if (!brown || !pink) return;
    const a = { nodes: [] };
    a.out = ctx.createGain(); a.out.gain.value = 0; a.out.connect(sfx);
    const mk = (b, rate) => { const s = ctx.createBufferSource(); s.buffer = b; s.loop = true; s.playbackRate.value = rate; s.start(ctx.currentTime, Math.random() * 1.5); a.nodes.push(s); return s; };
    // room tone
    const room = mk(brown, 0.8), roomLp = ctx.createBiquadFilter(); roomLp.type = 'lowpass'; roomLp.frequency.value = 240;
    const roomG = ctx.createGain(); roomG.gain.value = 0.55;
    room.connect(roomLp); roomLp.connect(roomG); roomG.connect(a.out);
    // lights / ballast hum
    const hum = ctx.createOscillator(); hum.frequency.value = 120; const humG = ctx.createGain(); humG.gain.value = 0.006;
    hum.connect(humG); humG.connect(a.out); hum.start(); a.nodes.push(hum);
    // murmur
    const mur = mk(pink, 0.9);
    const m1 = ctx.createBiquadFilter(); m1.type = 'bandpass'; m1.frequency.value = 520; m1.Q.value = 1.2;
    const m2 = ctx.createBiquadFilter(); m2.type = 'bandpass'; m2.frequency.value = 1150; m2.Q.value = 1.4;
    const murG = ctx.createGain(); murG.gain.value = 0.1;
    mur.connect(m1); mur.connect(m2); m1.connect(murG); m2.connect(murG); murG.connect(a.out);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.27; const lfoG = ctx.createGain(); lfoG.gain.value = 0.05;
    lfo.connect(lfoG); lfoG.connect(murG.gain); lfo.start(); a.nodes.push(lfo);
    a.extra = [roomLp, roomG, humG, m1, m2, murG, lfoG];
    a.out.gain.setTargetAtTime(0.5, ctx.currentTime, 0.8);
    ambience = a;
    ambSchedule();
  }
  function ambStop() {
    if (ambTimer) { clearTimeout(ambTimer); ambTimer = null; }
    if (!ambience) return;
    const a = ambience; ambience = null;
    a.out.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    setTimeout(() => {
      try { for (const n of a.nodes) n.stop(); for (const n of a.extra) n.disconnect(); a.out.disconnect(); } catch (e) { /* ignore */ }
    }, 2000);
  }
  function ambSchedule() {
    if (ambTimer) clearTimeout(ambTimer);
    if (!ambience || hidden()) return;
    ambTimer = setTimeout(() => {
      try { if (ambience && !muted) distantLane(); } catch (e) { /* ignore */ }
      ambSchedule();
    }, rand(1500, 5200));
  }
  function distantLane() {
    const now = ctx.currentTime;
    const pan = rand(-0.9, 0.9);
    const rollDur = rand(1.0, 1.9);
    // distant roll: dark noise swelling then fading
    const src = ctx.createBufferSource(); src.buffer = getBuf('brown'); src.loop = true; src.playbackRate.value = rand(0.9, 1.15);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 330;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(rand(0.25, 0.45), now + 0.2);
    g.gain.linearRampToValueAtTime(0.12, now + rollDur);
    g.gain.linearRampToValueAtTime(0.0001, now + rollDur + 0.3);
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    if (p.pan) p.pan.value = pan;
    src.connect(lp); lp.connect(g); g.connect(p); p.connect(sfx);
    src.start(now, Math.random() * 1.5); src.stop(now + rollDur + 0.4);
    src.onended = () => { for (const n of [src, lp, g, p]) try { n.disconnect(); } catch (e) { /* ignore */ } };
    // distant crash at the end of the roll
    const crashAt = now + rollDur;
    const n = 1 + Math.floor(Math.random() * 5);
    for (let i = 0; i < n; i++) {
      const type = Math.random() < 0.6 ? 'clack' : 'hit';
      const tt = crashAt + i * rand(0.01, 0.06);
      const buf = getBuf(`${type}${Math.floor(Math.random() * PIN_VARIANTS)}`);
      playBuf(buf, { t: tt, gain: rand(0.04, 0.1), rate: Math.pow(2, rand(-3, 2) / 12), lp: 1500, pan, send: 0.5 });
    }
  }
  api.ambience = (on) => {
    wantAmbience = !!on;
    try {
      if (!ctx || !unlocked) return;
      if (wantAmbience) ambStart(); else ambStop();
    } catch (e) { /* ignore */ }
  };

  // ---------- lifecycle ----------
  const hidden = () => typeof document !== 'undefined' && document.hidden === true;
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('visibilitychange', () => {
      try {
        if (!ctx || !unlocked) return;
        if (hidden()) {
          music && music.pause();
          if (ambTimer) { clearTimeout(ambTimer); ambTimer = null; }
          if (roll) { stopRoll(roll); roll = null; }
        } else {
          if (ctx.state === 'suspended') ctx.resume().catch(() => {});
          music && music.resume();
          music && music.setMode(wantMusic);
          if (ambience) ambSchedule();
        }
      } catch (e) { /* ignore */ }
    });
  }

  api.unlock = () => {
    try {
      if (!ok) return;
      if (!ctx && !build()) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      if (!unlocked) {
        unlocked = true;
        // iOS: a silent blip inside the gesture finishes the unlock
        try {
          const o = ctx.createOscillator(), g = ctx.createGain();
          g.gain.value = 0.0001; o.connect(g); g.connect(ctx.destination);
          o.start(); o.stop(ctx.currentTime + 0.02);
          o.onended = () => { try { o.disconnect(); g.disconnect(); } catch (e) { /* ignore */ } };
        } catch (e) { /* ignore */ }
        if (wantMusic !== 'off') music.setMode(wantMusic);
        if (wantAmbience) setTimeout(() => { try { if (wantAmbience && !ambience) ambStart(); } catch (e) { /* ignore */ } }, 300);
      }
    } catch (e) { /* ignore */ }
  };

  api.setMuted = (m) => {
    muted = !!m;
    try {
      if (ctx && master) {
        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setTargetAtTime(muted ? 0 : 1, now, 0.04);
      }
      if (muted && roll) { stopRoll(roll); roll = null; }
    } catch (e) { /* ignore */ }
  };
  Object.defineProperty(api, 'muted', { get: () => muted, enumerable: true });
  return api;
}
