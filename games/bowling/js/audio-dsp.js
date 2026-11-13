// Moo Bowl audio: pure DSP. Everything here fills Float32Arrays and needs no AudioContext,
// so it runs in Node tests as well as the browser. Each render function returns an array of
// channels (1 or 2 Float32Arrays), peak-normalised below 1.0.

const TAU = Math.PI * 2;

export function mulberry32(a) {
  let s = a >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

/** RBJ biquad, applied in place over data[from..to). type: lowpass | highpass | bandpass. */
export function biquad(data, type, f, q, sr, from = 0, to = data.length) {
  const w0 = (TAU * Math.min(f, sr * 0.45)) / sr;
  const cw = Math.cos(w0), sw = Math.sin(w0), alpha = sw / (2 * q);
  let b0, b1, b2;
  if (type === 'lowpass') { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = b0; }
  else if (type === 'highpass') { b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0; }
  else { b0 = alpha; b1 = 0; b2 = -alpha; }
  const a0 = 1 + alpha, a1 = -2 * cw, a2 = 1 - alpha;
  b0 /= a0; b1 /= a0; b2 /= a0;
  const na1 = a1 / a0, na2 = a2 / a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = from; i < to; i++) {
    const x = data[i];
    const y = b0 * x + b1 * x1 + b2 * x2 - na1 * y1 - na2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    data[i] = y;
  }
  return data;
}

export function peakOf(d) {
  let p = 0;
  for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > p) p = a; }
  return p;
}

/** Normalise a set of channels together so the peak is `target`; remove any NaN. */
export function normalise(chs, target = 0.9) {
  let p = 0;
  for (const c of chs) {
    for (let i = 0; i < c.length; i++) { if (!Number.isFinite(c[i])) c[i] = 0; }
    p = Math.max(p, peakOf(c));
  }
  if (p > 1e-9) { const g = target / p; for (const c of chs) for (let i = 0; i < c.length; i++) c[i] *= g; }
  return chs;
}

function fadeEnds(d, sr, inMs = 0.3, outMs = 6) {
  const a = Math.max(1, Math.floor((sr * inMs) / 1000)), b = Math.max(1, Math.floor((sr * outMs) / 1000));
  for (let i = 0; i < a && i < d.length; i++) d[i] *= i / a;
  for (let i = 0; i < b && i < d.length; i++) d[d.length - 1 - i] *= i / b;
}

/** Add a decaying sine mode. */
function addMode(out, sr, t0, f, tau, amp, rnd, sweep = 0) {
  const start = Math.floor(t0 * sr);
  const n = Math.min(out.length - start, Math.floor(tau * sr * 7));
  if (n <= 0) return;
  let ph = rnd() * TAU * 0.25;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = Math.exp(-t / tau) * (1 - Math.exp(-t / 0.00025));
    const fi = f * (1 - sweep * (1 - Math.exp(-t / tau)));
    ph += (TAU * fi) / sr;
    out[start + i] += Math.sin(ph) * env * amp;
  }
}

/** Add a short noise click, band-limited by simple filters. */
function addClick(out, sr, t0, ms, amp, rnd, hp, lp) {
  const start = Math.floor(t0 * sr);
  const n = Math.max(4, Math.floor((ms / 1000) * sr));
  if (start + n > out.length) return;
  const seg = new Float32Array(n);
  for (let i = 0; i < n; i++) seg[i] = (rnd() * 2 - 1) * Math.exp((-i / n) * 5);
  if (hp) biquad(seg, 'highpass', hp, 0.7, sr);
  if (lp) biquad(seg, 'lowpass', lp, 0.7, sr);
  for (let i = 0; i < n; i++) out[start + i] += seg[i] * amp;
}

/** A tiny wooden knock used inside machine sounds. */
function addKnock(out, sr, t, base, amp, rnd, tauScale = 1) {
  addClick(out, sr, t, 1.2, amp * 0.6, rnd, 1200, 8000);
  addMode(out, sr, t, base, 0.012 * tauScale, amp, rnd);
  addMode(out, sr, t, base * 2.3, 0.008 * tauScale, amp * 0.6, rnd);
  addMode(out, sr, t, base * 3.7, 0.005 * tauScale, amp * 0.35, rnd);
}

/**
 * Wooden pin knocks by modal synthesis.
 * type: 'hit' (ball on pin: low weight + bright body), 'clack' (pin on pin/wall: bright, light),
 *       'floor' (pin on deck: dull and low).
 */
export function renderPin(type, sr, seed) {
  const rnd = mulberry32(seed * 7919 + (type === 'hit' ? 11 : type === 'clack' ? 23 : 37));
  const jit = (v, p) => v * (1 + (rnd() * 2 - 1) * p);
  let dur;
  if (type === 'hit') dur = 0.45;
  else if (type === 'clack') dur = 0.3;
  else dur = 0.55;
  const out = new Float32Array(Math.floor(sr * dur));

  if (type === 'hit') {
    const base = lerp(560, 860, rnd());
    const ratios = [1, 1.93, 2.97, 4.2];
    const taus = [0.11, 0.08, 0.055, 0.035];
    const amps = [1, 0.8, 0.6, 0.4];
    for (let k = 0; k < ratios.length; k++) addMode(out, sr, 0, jit(base * ratios[k], 0.04), jit(taus[k], 0.2), amps[k] * lerp(0.8, 1.1, rnd()), rnd);
    // weight: ball on maple, 120 to 250 Hz
    addMode(out, sr, 0, lerp(120, 250, rnd()), 0.075, 1.25, rnd, 0.1);
    addMode(out, sr, 0, lerp(300, 420, rnd()), 0.04, 0.5, rnd);
    addClick(out, sr, 0, 3, 1.1, rnd, 600, 7000);
  } else if (type === 'clack') {
    const base = lerp(950, 1500, rnd());
    const ratios = [1, 1.52, 2.31, 3.05, 3.9];
    const taus = [0.05, 0.04, 0.03, 0.022, 0.015];
    const amps = [1, 0.9, 0.7, 0.5, 0.35];
    for (let k = 0; k < ratios.length; k++) addMode(out, sr, 0, jit(base * ratios[k], 0.05), jit(taus[k], 0.25), amps[k] * lerp(0.8, 1.1, rnd()), rnd);
    addMode(out, sr, 0, lerp(380, 520, rnd()), 0.02, 0.25, rnd);
    addClick(out, sr, 0, 2, 1.3, rnd, 2500, 12000);
  } else {
    const base = lerp(220, 360, rnd());
    const ratios = [1, 2.2, 3.5, 5.1];
    const taus = [0.13, 0.09, 0.06, 0.04];
    const amps = [1, 0.7, 0.45, 0.25];
    for (let k = 0; k < ratios.length; k++) addMode(out, sr, 0, jit(base * ratios[k], 0.05), jit(taus[k], 0.2), amps[k] * lerp(0.8, 1.1, rnd()), rnd);
    addMode(out, sr, 0, lerp(85, 140, rnd()), 0.09, 1.2, rnd, 0.12);
    addClick(out, sr, 0, 4, 0.5, rnd, 200, 1500);
    // a softer second contact as the pin settles
    const t2 = lerp(0.06, 0.11, rnd());
    addMode(out, sr, t2, jit(base * 1.1, 0.05), 0.07, 0.35, rnd);
    addMode(out, sr, t2, lerp(85, 140, rnd()) * 1.1, 0.06, 0.4, rnd);
    biquad(out, 'lowpass', 2200, 0.7, sr);
  }
  fadeEnds(out, sr);
  return normalise([out], 0.9);
}

/** Stereo short-hall impulse response (about 1 s), dark tail with a few early reflections. */
export function renderIR(sr, seed = 5, dur = 1.0) {
  const rnd = mulberry32(seed);
  const n = Math.floor(sr * dur);
  const chs = [new Float32Array(n), new Float32Array(n)];
  for (let c = 0; c < 2; c++) {
    const d = chs[c];
    let lp = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const k = lerp(0.75, 0.12, Math.min(1, t / 0.7)); // darkens over time
      lp += k * ((rnd() * 2 - 1) - lp);
      d[i] = lp * Math.exp(-t / 0.26) * Math.min(1, t / 0.012);
    }
    const taps = [0.007, 0.013, 0.021, 0.031, 0.044, 0.058];
    for (let j = 0; j < taps.length; j++) {
      const idx = Math.floor((taps[j] + (c ? 0.0017 : 0) * (j + 1)) * sr);
      if (idx < n) d[idx] += (rnd() < 0.5 ? -1 : 1) * (0.55 - j * 0.06);
    }
  }
  return normalise(chs, 0.9); // ConvolverNode.normalize handles wet level
}

/** Seamless looping brown noise (rumble bed). */
export function renderBrown(sr, secs = 2, seed = 3) {
  const rnd = mulberry32(seed);
  const L = Math.floor(sr * secs), xf = Math.floor(sr * 0.12);
  const g = new Float32Array(L + xf);
  let y = 0;
  for (let i = 0; i < g.length; i++) { y = (y + 0.02 * (rnd() * 2 - 1)) / 1.0 * 0.998; g[i] = y; }
  biquad(g, 'highpass', 25, 0.7, sr);
  const out = new Float32Array(L);
  for (let i = 0; i < L; i++) {
    if (i < xf) { const w = i / xf; out[i] = g[i] * Math.sin(w * Math.PI / 2) + g[L + i] * Math.cos(w * Math.PI / 2); }
    else out[i] = g[i];
  }
  return normalise([out], 0.8);
}

/** Seamless looping pink noise (Paul Kellet). */
export function renderPink(sr, secs = 2, seed = 4) {
  const rnd = mulberry32(seed);
  const L = Math.floor(sr * secs), xf = Math.floor(sr * 0.12);
  const g = new Float32Array(L + xf);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < g.length; i++) {
    const w = rnd() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
    g[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362; b6 = w * 0.115926;
  }
  const out = new Float32Array(L);
  for (let i = 0; i < L; i++) {
    if (i < xf) { const w = i / xf; out[i] = g[i] * Math.sin(w * Math.PI / 2) + g[L + i] * Math.cos(w * Math.PI / 2); }
    else out[i] = g[i];
  }
  return normalise([out], 0.8);
}

/** Ball lands on the lane: deep woody thud plus a short slide noise. */
export function renderRelease(sr, seed = 1) {
  const rnd = mulberry32(seed + 101);
  const out = new Float32Array(Math.floor(sr * 0.75));
  // sweeping low body
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / sr;
    const f = 52 + 100 * Math.exp(-t / 0.035);
    ph += (TAU * f) / sr;
    out[i] += Math.sin(ph) * Math.exp(-t / 0.11) * 1.0 * (1 - Math.exp(-t / 0.0008));
  }
  addMode(out, sr, 0, 190, 0.05, 0.55, rnd);
  addMode(out, sr, 0, 330, 0.03, 0.3, rnd);
  addMode(out, sr, 0, 610, 0.02, 0.15, rnd);
  addClick(out, sr, 0, 4, 0.5, rnd, 300, 4000);
  // slide: filtered noise swish that decays as the ball grips the oil
  const n = Math.floor(sr * 0.32);
  const sl = new Float32Array(n);
  for (let i = 0; i < n; i++) sl[i] = (rnd() * 2 - 1) * Math.exp(-i / sr / 0.12) * Math.min(1, i / sr / 0.01);
  biquad(sl, 'bandpass', 650, 0.9, sr);
  const st = Math.floor(sr * 0.012);
  for (let i = 0; i < n; i++) out[st + i] += sl[i] * 1.3;
  fadeEnds(out, sr);
  return normalise([out], 0.9);
}

/** Hollow plastic gutter clunk with a rattle. */
export function renderGutter(sr, seed = 1) {
  const rnd = mulberry32(seed + 202);
  const out = new Float32Array(Math.floor(sr * 1.3));
  const modes = [[310, 0.16, 1], [520, 0.14, 0.8], [940, 0.1, 0.55], [1480, 0.07, 0.35], [2250, 0.04, 0.2]];
  const strike = (t, a) => {
    for (const [f, tau, g] of modes) addMode(out, sr, t, f * lerp(0.96, 1.04, rnd()), tau, g * a, rnd);
    addClick(out, sr, t, 3, 0.4 * a, rnd, 500, 5000);
    addMode(out, sr, t, 95, 0.08, 0.7 * a, rnd, 0.1);
  };
  strike(0, 1);
  let t = 0.09;
  let gap = 0.07;
  for (let k = 0; k < 8; k++) {
    strike(t, 0.34 * Math.exp(-k * 0.28) * lerp(0.6, 1, rnd()));
    t += gap; gap *= lerp(0.62, 0.85, rnd());
  }
  // a rolling hollow wash
  const n = Math.floor(sr * 0.9);
  const w = new Float32Array(n);
  for (let i = 0; i < n; i++) w[i] = (rnd() * 2 - 1) * Math.exp(-i / sr / 0.3) * 0.5;
  biquad(w, 'bandpass', 520, 5, sr);
  for (let i = 0; i < n; i++) out[i + Math.floor(sr * 0.05)] += w[i] * 1.5;
  fadeEnds(out, sr);
  return normalise([out], 0.9);
}

/** Deep thump of the ball into the pit cushion. */
export function renderPit(sr, seed = 1) {
  const rnd = mulberry32(seed + 303);
  const out = new Float32Array(Math.floor(sr * 1.0));
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / sr;
    const f = 36 + 60 * Math.exp(-t / 0.06);
    ph += (TAU * f) / sr;
    out[i] += Math.sin(ph) * Math.exp(-t / 0.2) * (1 - Math.exp(-t / 0.003));
  }
  const n = Math.floor(sr * 0.5);
  const nz = new Float32Array(n);
  for (let i = 0; i < n; i++) nz[i] = (rnd() * 2 - 1) * Math.exp(-i / sr / 0.1);
  biquad(nz, 'lowpass', 280, 0.8, sr);
  for (let i = 0; i < n; i++) out[i] += nz[i] * 2.2;
  addMode(out, sr, 0.0, 140, 0.06, 0.4, rnd);
  fadeEnds(out, sr, 1, 20);
  return normalise([out], 0.9);
}

/** Pinsetter machine: motor hum, clatter, sweep. withRack adds the rack lowering and pins being set (3 s). */
export function renderPinsetter(sr, withRack, seed = 1) {
  const rnd = mulberry32(seed + (withRack ? 404 : 505));
  const dur = withRack ? 3.0 : 2.4;
  const n = Math.floor(sr * dur);
  const out = new Float32Array(n);
  // motor hum with harmonics, rising then settling
  let ph = 0;
  const motorEnd = withRack ? 2.9 : 2.4;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const up = smooth(t / 0.9);
    let f = 52 + 95 * up;
    if (t > 1.85) f -= 55 * smooth((t - 1.85) / 0.55);
    if (withRack && t > 2.2) f = 78 + 22 * Math.sin((t - 2.2) * 5);
    ph += (TAU * f) / sr;
    const env = smooth(t / 0.2) * smooth((motorEnd - t) / 0.35) * (withRack ? 1 : 1);
    const am = 0.82 + 0.18 * Math.sin(t * TAU * 23);
    let s = 0;
    for (let h = 1; h <= 6; h++) s += Math.sin(ph * h + h) / h;
    out[i] += s * env * am * 0.2;
  }
  // gear whine
  let ph2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const f = 780 + 1100 * smooth(t / 0.9);
    ph2 += (TAU * f) / sr;
    out[i] += Math.sin(ph2) * 0.012 * smooth(t / 0.3) * smooth((2.1 - t) / 0.3);
  }
  // rack lowering clunk at start, deck clunk near 2.0
  addMode(out, sr, 0.05, 70, 0.07, 0.9, rnd);
  addClick(out, sr, 0.05, 6, 0.5, rnd, 200, 3000);
  addMode(out, sr, 1.95, 62, 0.08, 1.0, rnd);
  addClick(out, sr, 1.95, 6, 0.5, rnd, 200, 3000);
  // sweep bar swish
  const s0 = Math.floor(sr * 0.65), sn = Math.floor(sr * 1.2);
  const sw = new Float32Array(sn);
  for (let i = 0; i < sn; i++) sw[i] = (rnd() * 2 - 1) * Math.sin((i / sn) * Math.PI) ** 1.5;
  biquad(sw, 'bandpass', 700, 0.7, sr);
  biquad(sw, 'lowpass', 2200, 0.7, sr);
  for (let i = 0; i < sn; i++) out[s0 + i] += sw[i] * 0.9;
  // clatter of pins being cleared
  let t = 0.55;
  while (t < 1.85) {
    const density = Math.sin(((t - 0.55) / 1.3) * Math.PI);
    addKnock(out, sr, t, lerp(500, 1800, rnd()), lerp(0.1, 0.55, rnd()) * (0.4 + 0.6 * density), rnd, lerp(0.7, 1.5, rnd()));
    t += lerp(0.006, 0.06, rnd()) / (0.4 + density);
  }
  if (withRack) {
    // soft multi-clack of ten pins being set on the deck
    for (let k = 0; k < 10; k++) {
      const tt = 2.15 + k * 0.065 + rnd() * 0.03;
      addKnock(out, sr, tt, lerp(420, 900, rnd()), lerp(0.25, 0.45, rnd()), rnd, 1.6);
    }
    addMode(out, sr, 2.88, 70, 0.06, 0.6, rnd);
  }
  fadeEnds(out, sr, 2, 25);
  return normalise([out], 0.88);
}

/** Add a harmonic voice with two formants (used for cheers and groans). */
function addVoice(out, sr, t0, dur, f0a, f0b, f1a, f1b, f2a, f2b, amp, rnd, vibHz = 5.5) {
  const start = Math.floor(t0 * sr), n = Math.min(out.length - start, Math.floor(dur * sr));
  if (n <= 0) return;
  let ph = 0;
  const vp = rnd() * TAU;
  const harmonics = 22;
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const f0 = lerp(f0a, f0b, u) * (1 + 0.012 * Math.sin(vp + (i / sr) * TAU * vibHz));
    const F1 = lerp(f1a, f1b, u), F2 = lerp(f2a, f2b, u);
    ph += (TAU * f0) / sr;
    let s = 0;
    for (let h = 1; h <= harmonics; h++) {
      const fh = f0 * h;
      if (fh > 5000) break;
      const w = Math.exp(-(((fh - F1) / (F1 * 0.28)) ** 2)) + 0.6 * Math.exp(-(((fh - F2) / (F2 * 0.25)) ** 2)) + 0.03;
      s += Math.sin(ph * h) * w / Math.sqrt(h);
    }
    const env = Math.min(1, u / 0.12) * Math.min(1, (1 - u) / 0.35);
    out[start + i] += s * env * amp * 0.25;
  }
}

function crowdNoise(n, sr, rnd, c1, c2, mixHi) {
  const a = new Float32Array(n), b = new Float32Array(n);
  for (let i = 0; i < n; i++) { a[i] = rnd() * 2 - 1; b[i] = a[i]; }
  biquad(a, 'bandpass', c1, 0.7, sr);
  biquad(b, 'bandpass', c2, 0.6, sr);
  for (let i = 0; i < n; i++) a[i] += b[i] * mixHi;
  return a;
}

function flutter(n, sr, rnd, hz, depth) {
  const f = new Float32Array(n);
  for (let i = 0; i < n; i++) f[i] = rnd() * 2 - 1;
  biquad(f, 'lowpass', hz, 0.7, sr);
  let p = 0;
  for (let i = 0; i < n; i++) p = Math.max(p, Math.abs(f[i]));
  for (let i = 0; i < n; i++) f[i] = 1 + (f[i] / (p + 1e-9)) * depth;
  return f;
}

/** Crowd cheer: swelling noise with a few whoops. Stereo. */
export function renderCheer(sr, seed = 1) {
  const dur = 3.2, n = Math.floor(sr * dur);
  const chs = [];
  const shared = mulberry32(seed + 606);
  const whoops = [];
  for (let k = 0; k < 6; k++) whoops.push({ t: lerp(0.1, 1.7, shared()), d: lerp(0.4, 0.75, shared()), f: lerp(250, 420, shared()), a: lerp(0.5, 1, shared()), v: shared() });
  for (let c = 0; c < 2; c++) {
    const rnd = mulberry32(seed * 31 + c * 977 + 7);
    const bed = crowdNoise(n, sr, rnd, 800, 1800, 0.3);
    const fl = flutter(n, sr, rnd, 14, 0.35);
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const env = smooth(t / 0.55) * Math.exp(-Math.max(0, t - 1.5) / 0.7);
      bed[i] *= env * fl[i] * 1.6;
    }
    for (const w of whoops) {
      const side = c === 0 ? 1 - w.v * 0.6 : 0.4 + w.v * 0.6;
      addVoice(bed, sr, w.t, w.d, w.f, w.f * 1.55, 650, 800, 1150, 1500, w.a * side * 0.55, rnd);
    }
    fadeEnds(bed, sr, 5, 30);
    chs.push(bed);
  }
  return normalise(chs, 0.85);
}

/** Disappointed 'aww': falling vowel voices over a murmur. Stereo. */
export function renderAww(sr, seed = 1) {
  const dur = 2.3, n = Math.floor(sr * dur);
  const chs = [];
  for (let c = 0; c < 2; c++) {
    const rnd = mulberry32(seed * 17 + c * 911 + 3);
    const bed = crowdNoise(n, sr, rnd, 650, 1300, 0.3);
    const fl = flutter(n, sr, rnd, 9, 0.3);
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      bed[i] *= smooth(t / 0.3) * Math.exp(-Math.max(0, t - 0.7) / 0.7) * fl[i] * 1.0;
    }
    for (let k = 0; k < 6; k++) {
      const t0 = rnd() * 0.3, f0 = lerp(260, 400, rnd());
      addVoice(bed, sr, t0, lerp(1.0, 1.6, rnd()), f0, f0 * lerp(0.55, 0.68, rnd()), 720, 420, 1150, 800, lerp(0.4, 0.8, rnd()), rnd, 4.5);
    }
    fadeEnds(bed, sr, 5, 40);
    chs.push(bed);
  }
  return normalise(chs, 0.8);
}

/** Applause: many randomised hand claps with a swell. Stereo. */
export function renderClap(sr, seed = 1) {
  const dur = 2.8, n = Math.floor(sr * dur);
  const chs = [];
  for (let c = 0; c < 2; c++) {
    const rnd = mulberry32(seed * 13 + c * 571 + 9);
    const out = new Float32Array(n);
    const clapCount = 150;
    for (let k = 0; k < clapCount; k++) {
      // density rises quickly, peaks, falls away
      const u = Math.pow(rnd(), 0.9);
      const t = 0.02 + u * (dur - 0.45);
      const dens = smooth(t / 0.4) * Math.exp(-Math.max(0, t - 1.2) / 0.9);
      if (rnd() > dens + 0.05) continue;
      const len = Math.floor(sr * 0.045);
      const seg = new Float32Array(len);
      for (let i = 0; i < len; i++) seg[i] = (rnd() * 2 - 1) * Math.exp(-i / sr / lerp(0.006, 0.013, rnd()));
      biquad(seg, 'bandpass', lerp(900, 2400, rnd()), lerp(0.9, 2.2, rnd()), sr);
      const a = lerp(0.3, 1, rnd()) * (0.4 + 0.6 * dens);
      const s0 = Math.floor(t * sr);
      for (let i = 0; i < len && s0 + i < n; i++) out[s0 + i] += seg[i] * a * 2.5;
    }
    // dense diffuse bed
    const bed = crowdNoise(n, sr, rnd, 1800, 3200, 0.3);
    const fl = flutter(n, sr, rnd, 40, 0.6);
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      out[i] += bed[i] * fl[i] * smooth(t / 0.5) * Math.exp(-Math.max(0, t - 1.2) / 0.8) * 0.28;
    }
    fadeEnds(out, sr, 5, 40);
    chs.push(out);
  }
  return normalise(chs, 0.8);
}

/** Convenience used by tests: every pre-rendered one-shot at a given rate. */
export function renderAll(sr = 44100) {
  const r = {};
  for (const t of ['hit', 'clack', 'floor']) r[t] = [0, 1, 2, 3, 4].map((s) => renderPin(t, sr, s + 1)[0]);
  r.release = renderRelease(sr)[0];
  r.gutter = renderGutter(sr)[0];
  r.pit = renderPit(sr)[0];
  r.sweep = renderPinsetter(sr, false)[0];
  r.rack = renderPinsetter(sr, true)[0];
  r.cheer = renderCheer(sr);
  r.aww = renderAww(sr);
  r.clap = renderClap(sr);
  r.ir = renderIR(sr);
  r.brown = renderBrown(sr)[0];
  r.pink = renderPink(sr)[0];
  return r;
}
