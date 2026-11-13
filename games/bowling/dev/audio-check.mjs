// Run: /opt/homebrew/opt/node@24/bin/node games/bowling/dev/audio-check.mjs
import assert from 'node:assert/strict';
import { renderAll, peakOf } from '../js/audio-dsp.js';

const SR = 44100;

function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < len / 2; k++) {
        const wr = Math.cos(ang * k), wi = Math.sin(ang * k);
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * wr - im[i + k + len / 2] * wi;
        const vi = re[i + k + len / 2] * wi + im[i + k + len / 2] * wr;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
      }
    }
  }
}

function spectrum(data, n = 16384) {
  const re = new Float64Array(n), im = new Float64Array(n);
  for (let i = 0; i < Math.min(n, data.length); i++) re[i] = data[i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / Math.min(n, data.length)));
  fft(re, im);
  const mag = new Float64Array(n / 2);
  for (let i = 0; i < n / 2; i++) mag[i] = re[i] * re[i] + im[i] * im[i];
  return mag;
}

function centroid(data) {
  const m = spectrum(data), n = m.length * 2;
  let a = 0, b = 0;
  for (let i = 1; i < m.length; i++) { const f = (i * SR) / n; a += f * m[i]; b += m[i]; }
  return a / b;
}

function bandFrac(data, lo, hi) {
  const m = spectrum(data), n = m.length * 2;
  let band = 0, tot = 0;
  for (let i = 1; i < m.length; i++) { const f = (i * SR) / n; tot += m[i]; if (f >= lo && f < hi) band += m[i]; }
  return band / tot;
}

const r = renderAll(SR);
const check = (name, d) => {
  const p = peakOf(d);
  let e = 0;
  for (let i = 0; i < d.length; i++) { assert.ok(Number.isFinite(d[i]), `${name} NaN at ${i}`); e += d[i] * d[i]; }
  assert.ok(p > 0.05, `${name} silent (peak ${p})`);
  assert.ok(p < 1.0, `${name} clips (peak ${p})`);
  assert.ok(Math.sqrt(e / d.length) > 0.005, `${name} too quiet rms`);
};

for (const t of ['hit', 'clack', 'floor']) r[t].forEach((d, i) => check(`${t}[${i}]`, d));
for (const k of ['release', 'gutter', 'pit', 'sweep', 'rack', 'brown', 'pink']) check(k, r[k]);
for (const k of ['cheer', 'aww', 'clap', 'ir']) r[k].forEach((d, i) => check(`${k}[${i}]`, d));
assert.ok(r.sweep.length === Math.floor(SR * 2.4), 'sweep length 2.4 s');
assert.ok(r.rack.length === Math.floor(SR * 3.0), 'rack length 3.0 s');

const avg = (arr, f) => arr.reduce((s, d) => s + f(d), 0) / arr.length;
const cHit = avg(r.hit, centroid), cClack = avg(r.clack, centroid), cFloor = avg(r.floor, centroid);
console.log('centroid Hz  hit', cHit.toFixed(0), ' clack', cClack.toFixed(0), ' floor', cFloor.toFixed(0));
assert.ok(cClack > cHit * 1.15, 'clack brighter than hit');
assert.ok(cHit > cFloor * 1.15, 'floor duller than hit');

const lowHit = avg(r.hit, (d) => bandFrac(d, 100, 300));
const lowClack = avg(r.clack, (d) => bandFrac(d, 100, 300));
const bodyHit = avg(r.hit, (d) => bandFrac(d, 500, 4000));
const hiClack = avg(r.clack, (d) => bandFrac(d, 4000, 12000));
const hiFloor = avg(r.floor, (d) => bandFrac(d, 4000, 12000));
console.log('hit 100-300 Hz', lowHit.toFixed(3), 'clack', lowClack.toFixed(3), '| hit 0.5-4k', bodyHit.toFixed(3), '| clack >4k', hiClack.toFixed(3), 'floor >4k', hiFloor.toFixed(4));
assert.ok(lowHit > lowClack * 2, 'pinHit has more low-end weight than clack');
assert.ok(bodyHit > 0.15, 'pinHit has body mode energy 0.5-4 kHz');
assert.ok(hiClack > hiFloor * 5, 'clack has more highs than floor');

// pin knocks are short: 95% of energy within 250 ms for clack
const early = (d, ms) => {
  const n = Math.floor((SR * ms) / 1000);
  let a = 0, b = 0;
  for (let i = 0; i < d.length; i++) { const v = d[i] * d[i]; b += v; if (i < n) a += v; }
  return a / b;
};
assert.ok(avg(r.clack, (d) => early(d, 200)) > 0.95, 'clack is short');
assert.ok(avg(r.hit, (d) => early(d, 300)) > 0.93, 'hit is short');

// variations differ
assert.notDeepEqual(Array.from(r.hit[0].slice(0, 200)), Array.from(r.hit[1].slice(0, 200)));
// release is low, gutter hollow mid, pit very low
console.log('centroid release', centroid(r.release).toFixed(0), 'pit', centroid(r.pit).toFixed(0), 'gutter', centroid(r.gutter).toFixed(0), 'cheer', centroid(r.cheer[0]).toFixed(0), 'clap', centroid(r.clap[0]).toFixed(0));
assert.ok(centroid(r.pit) < 300, 'pit thump is deep');
assert.ok(centroid(r.release) < 700, 'release thud is low');
assert.ok(bandFrac(r.gutter, 250, 1600) > 0.4, 'gutter is hollow midrange');
assert.ok(centroid(r.clap[0]) > 1500, 'clap is bright');
// ten simultaneous hits summed without limiter would exceed 1, which is why the engine has a limiter chain
console.log('all audio-dsp checks passed');
