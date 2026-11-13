// Bumper Carts - procedural Web Audio: cart sfx, UI stings, crowd, a motor hum and a short looping
// fairground waltz. Nothing plays until unlock() is called from a user gesture. Safe to call anything any time.
// Names: click count go storm win lose (main.js), and charge whoosh bonk clash crack smash wall splash honk
// crowd drop full (engine).

export function createAudio() {
  let ctx = null, master = null, sfxBus = null, musicBus = null, noiseBuf = null;
  let muted = false, wantMusic = false, paused = false, unlocked = false;
  let musicTimer = null, nextNote = 0, step = 0, bar = 0;
  let motor = null, motorLevel = 0;
  const charges = new Map();   // seat -> { o, g }
  const vol = { master: 0.8, sfx: 0.9, music: 0.28 };

  function build() {
    if (ctx) return true;
    const Ctor = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Ctor) return false;
    try { ctx = new Ctor(); } catch (e) { ctx = null; return false; }
    master = ctx.createGain(); master.gain.value = muted ? 0 : vol.master;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = vol.sfx; sfxBus.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = vol.music; musicBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }
  const ok = () => ctx && unlocked && !muted && ctx.state !== 'closed';

  function env(g, t, a, peak, dec, end = 0.0001) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
    g.gain.exponentialRampToValueAtTime(end, t + a + dec);
  }
  function tone(type, f0, f1, t, dur, peak = 0.3, bus = sfxBus, attack = 0.005) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    env(g, t, attack, peak, dur);
    o.connect(g); g.connect(bus);
    o.start(t); o.stop(t + attack + dur + 0.05);
    return o;
  }
  function noise(t, dur, { type = 'bandpass', f0 = 1000, f1 = null, q = 1, peak = 0.3, attack = 0.005, bus = sfxBus } = {}) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    s.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain();
    env(g, t, attack, peak, dur);
    s.connect(f); f.connect(g); g.connect(bus);
    s.start(t, Math.random() * 0.5); s.stop(t + attack + dur + 0.05);
  }

  const S = {
    whoosh(p = 0.7) {
      const t = ctx.currentTime;
      noise(t, 0.22 + p * 0.15, { f0: 400 + p * 400, f1: 2600 + p * 2000, q: 1.2, peak: 0.15 + p * 0.25, attack: 0.03 });
      tone('sawtooth', 160 + p * 60, 420 + p * 300, t, 0.2, 0.04);
    },
    bonk(p = 0.5) {
      // fat rubber bumper
      const t = ctx.currentTime;
      tone('sine', 150 + p * 70, 55, t, 0.18 + p * 0.15, 0.35 + p * 0.4);
      tone('triangle', 420 + p * 200, 180, t, 0.09, 0.12 + p * 0.1);
      noise(t, 0.07, { type: 'lowpass', f0: 1400, f1: 250, q: 0.7, peak: 0.15 + p * 0.3 });
      if (p > 0.7) tone('square', 900, 1500, t + 0.02, 0.06, 0.05);
    },
    clash() {
      const t = ctx.currentTime;
      for (const [f, d] of [[880, 0], [1320, 0.004], [1980, 0.01]]) tone('triangle', f, f * 0.97, t + d, 0.4, 0.12);
      tone('sine', 120, 50, t, 0.3, 0.5);
      noise(t, 0.12, { f0: 3000, q: 2, peak: 0.3 });
    },
    crack() {
      const t = ctx.currentTime;
      noise(t, 0.05, { type: 'highpass', f0: 1800, peak: 0.45 });
      noise(t + 0.03, 0.12, { f0: 900, q: 3, peak: 0.25 });
      tone('square', 300, 160, t, 0.08, 0.06);
    },
    smash() {
      const t = ctx.currentTime;
      for (let k = 0; k < 5; k++) noise(t + k * 0.04 + Math.random() * 0.02, 0.08, { f0: 700 + Math.random() * 1600, q: 3, peak: 0.3 });
      tone('sine', 140, 60, t, 0.25, 0.3);
      noise(t, 0.4, { type: 'lowpass', f0: 1200, f1: 200, peak: 0.25 });
    },
    wall(p = 0.5) {
      const t = ctx.currentTime;
      tone('sine', 110, 70, t, 0.12, 0.2 + p * 0.25);
      noise(t, 0.05, { f0: 600, q: 2, peak: 0.1 + p * 0.15 });
    },
    splash() {
      // gloopy mud
      const t = ctx.currentTime;
      noise(t, 0.6, { type: 'lowpass', f0: 1600, f1: 200, q: 1.5, peak: 0.6, attack: 0.01 });
      tone('sine', 220, 60, t, 0.35, 0.35);
      for (let k = 0; k < 6; k++) {
        const tt = t + 0.2 + Math.random() * 0.6, f = 180 + Math.random() * 260;
        tone('sine', f, f * 2.2, tt, 0.07, 0.1);
      }
    },
    honk() {
      const t = ctx.currentTime;
      for (const f of [330, 415]) {
        const o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = 'sawtooth'; o.frequency.value = f;
        fl.type = 'bandpass'; fl.frequency.value = 900; fl.Q.value = 2;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
        g.gain.setValueAtTime(0.12, t + 0.16); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        o.connect(fl); fl.connect(g); g.connect(sfxBus);
        o.start(t); o.stop(t + 0.25);
      }
    },
    full() { const t = ctx.currentTime; tone('triangle', 1320, 1760, t, 0.1, 0.12); tone('sine', 2640, 2640, t + 0.05, 0.12, 0.06); },
    drop() {
      const t = ctx.currentTime;
      tone('sine', 900, 300, t, 0.35, 0.08);
      tone('triangle', 200, 420, t + 0.42, 0.18, 0.2);   // boing on landing
    },
    crowd(k = 1) {
      const t = ctx.currentTime;
      noise(t, 0.9 + k * 0.5, { f0: 700, f1: 1200, q: 0.8, peak: 0.1 + k * 0.12, attack: 0.08 });
      noise(t, 0.9 + k * 0.5, { f0: 2400, f1: 2000, q: 2, peak: 0.04 + k * 0.05, attack: 0.1 });
    },
    click() { const t = ctx.currentTime; tone('triangle', 900, 1300, t, 0.05, 0.18); },
    count() { const t = ctx.currentTime; tone('square', 660, 660, t, 0.16, 0.12); tone('sine', 1320, 1320, t, 0.16, 0.1); },
    go() {
      const t = ctx.currentTime;
      for (const f of [523, 659, 784, 1047]) tone('square', f, f, t, 0.35, 0.07);
      tone('sine', 1047, 1047, t, 0.5, 0.15);
      S.honk();
    },
    storm() {
      const t = ctx.currentTime;
      noise(t, 1.6, { type: 'lowpass', f0: 500, f1: 80, q: 0.7, peak: 0.6, attack: 0.05 });   // thunder
      noise(t + 0.25, 1.2, { type: 'lowpass', f0: 300, f1: 60, peak: 0.4, attack: 0.2 });
      for (let k = 0; k < 4; k++) { tone('triangle', 1568, 1568, t + 0.1 + k * 0.18, 0.5, 0.1); tone('sine', 784, 784, t + 0.1 + k * 0.18, 0.5, 0.08); }   // alarm bell
      S.crowd(1.2);
    },
    win() {
      const t = ctx.currentTime;
      [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, k) => { tone('square', f, f, t + k * 0.11, 0.22, 0.08); tone('triangle', f / 2, f / 2, t + k * 0.11, 0.22, 0.12); });
      S.crowd(1.5);
    },
    lose() {
      const t = ctx.currentTime;
      [392, 370, 349, 294].forEach((f, k) => {
        const o = tone('sawtooth', f, f * (k === 3 ? 0.9 : 1), t + k * 0.32, k === 3 ? 0.9 : 0.28, 0.08, sfxBus, 0.02);
        if (k === 3) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 7; lg.gain.value = 8; l.connect(lg); lg.connect(o.frequency); l.start(t + k * 0.32); l.stop(t + 2); }
      });
    },
  };

  function play(name, arg) {
    if (!ok() || paused) return;
    const f = S[name];
    if (!f) return;
    try { f(arg); } catch (e) { /* ignore */ }
  }

  /** Rising whine while seat `i` charges; stopCharge(i) cuts it. */
  function startCharge(i, time = 1) {
    stopCharge(i);
    if (!ok() || paused) return;
    try {
      const t = ctx.currentTime;
      const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sawtooth'; o2.type = 'square';
      o.frequency.setValueAtTime(140 + i * 9, t); o.frequency.exponentialRampToValueAtTime(520 + i * 20, t + time);
      o2.frequency.setValueAtTime(8, t); o2.frequency.linearRampToValueAtTime(22, t + time);
      const lg = ctx.createGain(); lg.gain.value = 18;
      o2.connect(lg); lg.connect(o.frequency);
      const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 1400;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.08);
      o.connect(fl); fl.connect(g); g.connect(sfxBus);
      o.start(t); o2.start(t);
      charges.set(i, { o, o2, g });
    } catch (e) { /* ignore */ }
  }
  function stopCharge(i) {
    const v = charges.get(i);
    if (!v) return;
    charges.delete(i);
    try {
      const t = ctx.currentTime;
      v.g.gain.cancelScheduledValues(t);
      v.g.gain.setTargetAtTime(0.0001, t, 0.02);
      v.o.stop(t + 0.1); v.o2.stop(t + 0.1);
    } catch (e) { /* ignore */ }
  }
  function stopAllCharges() { for (const i of [...charges.keys()]) stopCharge(i); }

  // ── shared motor hum: level 0..1 from the carts' total speed ──
  function ensureMotor() {
    if (motor || !ok()) return;
    try {
      const o = ctx.createOscillator(), o2 = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = 55;
      o2.type = 'square'; o2.frequency.value = 82;
      fl.type = 'lowpass'; fl.frequency.value = 300;
      g.gain.value = 0;
      o.connect(fl); o2.connect(fl); fl.connect(g); g.connect(sfxBus);
      o.start(); o2.start();
      motor = { o, o2, fl, g };
    } catch (e) { motor = null; }
  }
  function setMotor(level) {
    motorLevel = Math.max(0, Math.min(1, +level || 0));
    if (!ok()) return;
    ensureMotor();
    if (!motor) return;
    const t = ctx.currentTime, on = paused ? 0 : 1;
    motor.g.gain.setTargetAtTime(on * (0.012 + 0.035 * motorLevel), t, 0.1);
    motor.o.frequency.setTargetAtTime(48 + motorLevel * 40, t, 0.1);
    motor.o2.frequency.setTargetAtTime(72 + motorLevel * 60, t, 0.1);
    motor.fl.frequency.setTargetAtTime(220 + motorLevel * 500, t, 0.1);
  }
  function killMotor() { if (motor) { try { motor.o.stop(); motor.o2.stop(); } catch (e) { /* ignore */ } motor = null; } }

  // ── music: a short looping fairground waltz (calliope melody, oom-pah-pah) ──
  const BPM = 168, BEAT = 60 / BPM;
  const N = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const CHORDS = [[48, 52, 55], [48, 52, 55], [55, 59, 62], [55, 59, 62], [53, 57, 60], [48, 52, 55], [55, 59, 62], [48, 52, 55]];
  const MEL = [
    [79, 76, 77], [79, null, 72], [74, 77, 76], [74, null, 67],
    [77, 76, 74], [72, 76, 79], [84, 83, 81], [79, null, null],
  ];
  function calliope(f, t, peak = 0.08, dur = 0.3) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain();
    o.type = 'square'; o2.type = 'sine';
    o.frequency.value = f; o2.frequency.value = f * 2;
    const vib = ctx.createOscillator(), vg = ctx.createGain();
    vib.frequency.value = 6; vg.gain.value = f * 0.008;
    vib.connect(vg); vg.connect(o.frequency);
    const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = f * 4;
    g2.gain.value = 0.5;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.02);
    g.gain.setValueAtTime(peak, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(fl); o2.connect(g2); g2.connect(fl); fl.connect(g); g.connect(musicBus);
    o.start(t); o2.start(t); vib.start(t);
    o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05); vib.stop(t + dur + 0.05);
  }
  function pluck(f, t, peak, dur) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = f;
    env(g, t, 0.004, peak, dur);
    o.connect(g); g.connect(musicBus);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function scheduleMusic() {
    if (!ctx) return;
    while (nextNote < ctx.currentTime + 0.25) {
      const t = nextNote, b = bar % 8, s = step % 3;
      const ch = CHORDS[b];
      if (s === 0) pluck(N(ch[0] - 12), t, 0.22, 0.35);
      else ch.forEach((n) => pluck(N(n), t, 0.045, 0.14));
      const m = MEL[b][s];
      if (m) calliope(N(m), t, 0.06, BEAT * (MEL[b][s + 1] === null ? 1.8 : 0.9));
      if (s === 0) noise(t, 0.04, { type: 'highpass', f0: 6000, peak: 0.02, bus: musicBus });
      nextNote += BEAT;
      step++;
      if (step % 3 === 0) bar++;
    }
  }
  function startMusic() {
    if (musicTimer || !ok() || paused || !wantMusic) return;
    nextNote = ctx.currentTime + 0.1; step = 0; bar = 0;
    musicTimer = setInterval(() => { try { scheduleMusic(); } catch (e) { /* ignore */ } }, 60);
  }
  function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }

  return {
    unlock() {
      if (!build()) return;
      try { if (ctx.state !== 'running') ctx.resume(); } catch (e) { /* ignore */ }
      unlocked = true;
      if (wantMusic) setTimeout(startMusic, 50);
    },
    play,
    startCharge, stopCharge, stopAllCharges, setMotor,
    setMuted(on) {
      muted = !!on;
      if (master) master.gain.setTargetAtTime(muted ? 0 : vol.master, ctx.currentTime, 0.03);
      if (muted) { stopMusic(); stopAllCharges(); } else startMusic();
    },
    music(on) { wantMusic = !!on; if (wantMusic) startMusic(); else stopMusic(); },
    setPaused(on) {
      paused = !!on;
      if (paused) { stopMusic(); stopAllCharges(); setMotor(motorLevel); } else { startMusic(); setMotor(motorLevel); }
    },
    get muted() { return muted; },
    dispose() { stopMusic(); stopAllCharges(); killMotor(); try { if (ctx) ctx.close(); } catch (e) { /* ignore */ } },
  };
}
