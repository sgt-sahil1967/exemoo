/** One-shot sound effects, all synthesized. */
import type { SfxName } from '../core/contracts';
import { bell, clamp, noise, rand, tone, type Core } from './engine';

export interface SfxOpts {
  volume?: number;
  rate?: number;
  pan?: number;
}

interface V {
  core: Core;
  out: AudioNode;
  t: number;
  /** Pitch/speed multiplier. */
  r: number;
}

type Voice = (v: V) => void;

const hitWood: Voice = ({ core, out, t, r }) => {
  noise(core, out, { filter: 'highpass', freq: 2500, t, dur: 0.03, gain: 0.7 });
  noise(core, out, { freq: 900 * r, q: 1, t, dur: 0.07, gain: 0.5 });
  tone(core, out, { freq: 190 * r, freqEnd: 90 * r, t, dur: 0.09, gain: 0.55 });
  tone(core, out, { freq: 2400 * r, t: t + 0.003, dur: 0.5, gain: 0.22 });
  tone(core, out, { type: 'triangle', freq: 3700 * r, t: t + 0.003, dur: 0.28, gain: 0.1 });
};

const hitIron: Voice = ({ core, out, t, r }) => {
  noise(core, out, { filter: 'highpass', freq: 3200, t, dur: 0.025, gain: 0.6 });
  tone(core, out, { freq: 230 * r, freqEnd: 120 * r, t, dur: 0.06, gain: 0.4 });
  tone(core, out, { type: 'triangle', freq: 1900 * r, t, dur: 0.12, gain: 0.14 });
};

const hitPutt: Voice = ({ core, out, t, r }) => {
  tone(core, out, { freq: 540 * r, freqEnd: 300 * r, t, dur: 0.08, gain: 0.55 });
  tone(core, out, { type: 'triangle', freq: 800 * r, t, dur: 0.05, gain: 0.15 });
  noise(core, out, { freq: 1300, t, dur: 0.02, gain: 0.2 });
};

const hitBad: Voice = ({ core, out, t, r }) => {
  tone(core, out, { freq: 125 * r, freqEnd: 55 * r, t, dur: 0.2, gain: 0.75 });
  noise(core, out, { filter: 'lowpass', freq: 450, t, dur: 0.12, gain: 0.45 });
};

const whoosh: Voice = ({ core, out, t, r }) => {
  const d = 0.5 / r;
  noise(core, out, { freq: 350 * r, freqEnd: 2600 * r, q: 1.6, t, dur: d, gain: 0.55, attack: d * 0.4 });
};

const land: Voice = ({ core, out, t, r }) => {
  tone(core, out, { freq: 115 * r, freqEnd: 50 * r, t, dur: 0.22, gain: 0.6 });
  noise(core, out, { filter: 'lowpass', freq: 320, t, dur: 0.16, gain: 0.35 });
};

const sand: Voice = ({ core, out, t, r }) => {
  noise(core, out, { freq: 1900 * r, freqEnd: 900 * r, q: 0.7, t, dur: 0.38, gain: 0.5, attack: 0.03 });
  noise(core, out, { filter: 'lowpass', freq: 400, t, dur: 0.12, gain: 0.25 });
};

const splash: Voice = ({ core, out, t, r }) => {
  noise(core, out, { freq: 1600 * r, freqEnd: 500 * r, q: 0.6, t, dur: 0.55, gain: 0.6, attack: 0.01 });
  noise(core, out, { filter: 'lowpass', freq: 500, t, dur: 0.3, gain: 0.4 });
  for (let i = 0; i < 6; i++) {
    const f = rand(380, 800) * r;
    tone(core, out, { freq: f, freqEnd: f * 1.8, t: t + 0.06 + i * rand(0.05, 0.09), dur: 0.07, gain: 0.16 });
  }
};

const tree: Voice = ({ core, out, t, r }) => {
  for (let i = 0; i < 5; i++) {
    noise(core, out, { freq: rand(2800, 5000) * r, q: 1.2, t: t + i * rand(0.04, 0.08), dur: 0.09, gain: 0.3 });
  }
  tone(core, out, { freq: 210 * r, freqEnd: 120 * r, t, dur: 0.09, gain: 0.5 });
  tone(core, out, { type: 'triangle', freq: 340 * r, t, dur: 0.06, gain: 0.15 });
};

const pin: Voice = ({ core, out, t, r }) => {
  noise(core, out, { filter: 'highpass', freq: 3000, t, dur: 0.02, gain: 0.5 });
  [1, 2.76, 5.4, 8.93].forEach((p, i) => {
    tone(core, out, { freq: 780 * p * r, t, dur: 1.0 / (1 + i * 0.6), gain: 0.28 / (1 + i * 0.5) });
  });
};

const lip: Voice = ({ core, out, t, r }) => {
  for (let i = 0; i < 4; i++) {
    noise(core, out, { freq: rand(2200, 3200) * r, q: 2, t: t + i * 0.032, dur: 0.02, gain: 0.35 });
  }
  tone(core, out, { freq: 1568 * r, t: t + 0.15, dur: 0.28, gain: 0.25 });
};

const cup: Voice = ({ core, out, t, r }) => {
  tone(core, out, { freq: 340 * r, freqEnd: 150 * r, t, dur: 0.14, gain: 0.6 });
  noise(core, out, { filter: 'lowpass', freq: 900, t, dur: 0.06, gain: 0.3 });
  const n = 3 + Math.round(Math.random());
  let at = t + 0.13;
  for (let i = 0; i < n; i++) {
    tone(core, out, { type: 'triangle', freq: rand(1500, 2200) * r, t: at, dur: 0.06, gain: 0.22 });
    noise(core, out, { freq: 3200, q: 2, t: at, dur: 0.02, gain: 0.25 });
    at += 0.07 - i * 0.012;
  }
  tone(core, out, { freq: 210 * r, freqEnd: 140 * r, t: at + 0.02, dur: 0.1, gain: 0.45 });
};

/** Many short claps over ~2.5 s with a swelling-then-fading density. */
const applause: Voice = ({ core, out, t, r }) => {
  for (let i = 0; i < 80; i++) {
    const x = Math.random();
    const at = t + x * 2.5 / r;
    const env = Math.sin(Math.PI * Math.pow(x, 0.7));
    if (Math.random() > env * 0.9 + 0.1) continue;
    noise(core, out, { freq: rand(1200, 3600), q: rand(0.6, 1.6), t: at, dur: rand(0.015, 0.035), gain: 0.2 * env + 0.04 });
  }
  noise(core, out, { freq: 2200, q: 0.4, t, dur: 2.4 / r, gain: 0.07, attack: 0.5 });
};

/** Formant filter bank fed by a node, writing to dest. */
function formants(core: Core, src: AudioNode, dest: AudioNode, t: number, f: number[], g: number[]): BiquadFilterNode[] {
  return f.map((hz, i) => {
    const bp = core.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 6;
    bp.frequency.setValueAtTime(hz, t);
    const gn = core.ctx.createGain();
    gn.gain.value = g[i] ?? 1;
    src.connect(bp).connect(gn).connect(dest);
    return bp;
  });
}

const cheer: Voice = ({ core, out, t, r }) => {
  const { ctx } = core;
  const d = 2.2 / r;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.linearRampToValueAtTime(0.9, t + d * 0.35);
  env.gain.exponentialRampToValueAtTime(0.0001, t + d);
  env.connect(out);
  const src = ctx.createBufferSource();
  src.buffer = core.noiseBuf;
  src.loop = true;
  const bps = formants(core, src, env, t, [750, 1250, 2700], [1.6, 1.0, 0.5]);
  bps.forEach((b, i) => b.frequency.linearRampToValueAtTime([900, 1500, 3000][i] ?? 1000, t + d * 0.5));
  src.start(t, rand(0, 1.5));
  src.stop(t + d + 0.05);
  // A few voiced "whoo" tones riding the swell.
  for (let i = 0; i < 4; i++) {
    const f = rand(300, 520) * r;
    tone(core, out, { type: 'sawtooth', freq: f, freqEnd: f * 1.3, t: t + rand(0, 0.4), dur: d * 0.7, gain: 0.03, attack: 0.4 });
  }
};

const aww: Voice = ({ core, out, t, r }) => {
  const { ctx } = core;
  const d = 1.3 / r;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.linearRampToValueAtTime(0.5, t + 0.15);
  env.gain.exponentialRampToValueAtTime(0.0001, t + d);
  env.connect(out);
  for (let v = 0; v < 3; v++) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    const f0 = rand(230, 290) * r;
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(f0 * 0.6, t + d);
    const bps = formants(core, osc, env, t, [800, 1150, 2600], [1.0, 0.7, 0.2]);
    bps[0].frequency.exponentialRampToValueAtTime(520, t + d);
    bps[1].frequency.exponentialRampToValueAtTime(900, t + d);
    osc.start(t + v * 0.03);
    osc.stop(t + d + 0.05);
  }
};

const chime: Voice = ({ core, out, t, r }) => {
  bell(core, out, 880 * r, t, 0.9, 0.3);
  bell(core, out, 1318.5 * r, t + 0.14, 1.1, 0.3);
};

const click: Voice = ({ core, out, t, r }) => {
  tone(core, out, { freq: 950 * r, t, dur: 0.035, gain: 0.22 });
};

const select: Voice = ({ core, out, t, r }) => {
  tone(core, out, { freq: 660 * r, t, dur: 0.07, gain: 0.25 });
  tone(core, out, { freq: 990 * r, t: t + 0.06, dur: 0.12, gain: 0.25 });
};

const back: Voice = ({ core, out, t, r }) => {
  tone(core, out, { freq: 620 * r, freqEnd: 400 * r, t, dur: 0.1, gain: 0.25 });
};

const connect: Voice = ({ core, out, t, r }) => {
  [1046.5, 1318.5, 1568].forEach((f, i) => bell(core, out, f * r, t + i * 0.1, 0.5 + i * 0.2, 0.25));
};

const VOICES: Record<SfxName, Voice> = {
  hitWood, hitIron, hitPutt, hitBad, whoosh, land, sand, splash, tree, pin, lip, cup,
  applause, cheer, aww, chime, click, select, back, connect,
};

/** Play a named effect through the sfx bus. Never throws. */
export function playSfx(core: Core, name: SfxName, opts: SfxOpts = {}): void {
  try {
    const { ctx } = core;
    if (ctx.state !== 'running') return;
    const voice = VOICES[name];
    if (!voice) return;
    const out = ctx.createGain();
    out.gain.value = clamp(opts.volume ?? 1, 0, 2);
    let tail: AudioNode = out;
    if (typeof ctx.createStereoPanner === 'function') {
      const p = ctx.createStereoPanner();
      p.pan.value = clamp(opts.pan ?? 0, -1, 1);
      out.connect(p);
      tail = p;
    }
    tail.connect(core.sfx);
    const r = clamp(opts.rate ?? 1, 0.25, 4) * rand(0.95, 1.05);
    voice({ core, out, t: ctx.currentTime + 0.005, r });
    // Disconnect after the longest sound has finished.
    setTimeout(() => {
      try {
        tail.disconnect();
        out.disconnect();
      } catch {
        /* already gone */
      }
    }, 4000);
  } catch {
    /* audio must never break the game */
  }
}
