// Bale Brawl - procedural WebAudio: combat sfx, UI stings, crowd, and a short looping farmyard tune.
// Nothing plays until unlock() is called from a user gesture. Safe to call anything at any time.

export function createAudio() {
  let ctx = null, master = null, sfxBus = null, musicBus = null, noiseBuf = null;
  let muted = false, wantMusic = false, paused = false, unlocked = false;
  let musicTimer = null, nextNote = 0, step = 0, bar = 0;
  const vol = { master: 0.8, sfx: 0.9, music: 0.32 };

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

  // ── building blocks ──
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

  // ── sounds ──
  const S = {
    whoosh(p = 0.7) {
      const t = ctx.currentTime;
      noise(t, 0.16 + p * 0.1, { f0: 500 + p * 400, f1: 2400 + p * 1800, q: 1.4, peak: 0.12 + p * 0.22, attack: 0.04 });
    },
    bonk(p = 0.7) {
      const t = ctx.currentTime;
      tone('sine', 260 + p * 60, 90, t, 0.22, 0.55);
      tone('triangle', 520, 900 + p * 400, t + 0.01, 0.12, 0.18);         // squeaky foam
      noise(t, 0.09, { type: 'lowpass', f0: 1800, f1: 300, q: 0.7, peak: 0.35 });
      if (p > 0.75) tone('square', 1200, 1800, t + 0.03, 0.08, 0.05);
    },
    block() {
      const t = ctx.currentTime;
      noise(t, 0.07, { f0: 2600, q: 4, peak: 0.4 });
      tone('square', 880, 620, t, 0.07, 0.12);
      tone('triangle', 1760, 1500, t + 0.005, 0.18, 0.12);
      tone('sine', 180, 120, t, 0.12, 0.25);
    },
    clash() {
      const t = ctx.currentTime;
      for (const [f, d] of [[1320, 0], [1980, 0.004], [2640, 0.01]]) tone('triangle', f, f * 0.97, t + d, 0.35, 0.12);
      noise(t, 0.1, { f0: 3500, q: 3, peak: 0.35 });
      tone('sine', 160, 90, t, 0.15, 0.3);
    },
    splash() {
      const t = ctx.currentTime;
      noise(t, 0.55, { type: 'lowpass', f0: 4000, f1: 400, q: 0.8, peak: 0.6, attack: 0.01 });
      noise(t + 0.02, 0.3, { f0: 900, q: 1, peak: 0.25 });
      for (let k = 0; k < 7; k++) {
        const tt = t + 0.18 + Math.random() * 0.6;
        const f = 500 + Math.random() * 900;
        tone('sine', f, f * 1.8, tt, 0.06, 0.08);
      }
    },
    plop() {
      const t = ctx.currentTime;
      tone('sine', 300, 700, t, 0.08, 0.15);
      noise(t, 0.15, { type: 'lowpass', f0: 1500, f1: 300, peak: 0.12 });
    },
    edge() {
      const t = ctx.currentTime;
      // crowd "ooh"
      noise(t, 0.7, { f0: 420, f1: 360, q: 6, peak: 0.12, attack: 0.15 });
      noise(t, 0.7, { f0: 900, f1: 760, q: 8, peak: 0.06, attack: 0.15 });
    },
    crowd(k = 1) {
      const t = ctx.currentTime;
      noise(t, 0.9 + k * 0.5, { f0: 700, f1: 1200, q: 0.8, peak: 0.12 + k * 0.12, attack: 0.08 });
      noise(t, 0.9 + k * 0.5, { f0: 2400, f1: 2000, q: 2, peak: 0.05 + k * 0.05, attack: 0.1 });
    },
    quack() {
      const t = ctx.currentTime + Math.random() * 0.2;
      for (let k = 0; k < 2; k++) {
        const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(520, t + k * 0.16); o.frequency.exponentialRampToValueAtTime(380, t + k * 0.16 + 0.12);
        f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 3;
        env(g, t + k * 0.16, 0.01, 0.12, 0.12);
        o.connect(f); f.connect(g); g.connect(sfxBus);
        o.start(t + k * 0.16); o.stop(t + k * 0.16 + 0.2);
      }
    },
    sink() {
      const t = ctx.currentTime;
      tone('sine', 900, 200, t, 0.5, 0.12);
    },
    click() { const t = ctx.currentTime; tone('triangle', 900, 1300, t, 0.05, 0.18); },
    count() { const t = ctx.currentTime; tone('square', 660, 660, t, 0.16, 0.12); tone('sine', 1320, 1320, t, 0.16, 0.1); },
    go() {
      const t = ctx.currentTime;
      for (const f of [523, 659, 784, 1047]) tone('square', f, f, t, 0.35, 0.07);
      tone('sine', 1047, 1047, t, 0.5, 0.15);
    },
    round() {
      const t = ctx.currentTime;
      [523, 659, 784].forEach((f, k) => tone('triangle', f, f, t + k * 0.09, 0.25, 0.2));
      noise(t, 0.3, { f0: 5000, q: 2, peak: 0.05 });
    },
    win() {
      const t = ctx.currentTime;
      const notes = [523, 659, 784, 1047, 784, 1047, 1319];
      notes.forEach((f, k) => { tone('square', f, f, t + k * 0.11, 0.22, 0.08); tone('triangle', f / 2, f / 2, t + k * 0.11, 0.22, 0.12); });
      S.crowd(1.5);
    },
    lose() {
      const t = ctx.currentTime;
      [392, 370, 349, 294].forEach((f, k) => {
        const o = tone('sawtooth', f, f * (k === 3 ? 0.9 : 1), t + k * 0.32, k === 3 ? 0.9 : 0.28, 0.08, sfxBus, 0.02);
        if (k === 3) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 7; lg.gain.value = 8; l.connect(lg); lg.connect(o.frequency); l.start(t + k * 0.32); l.stop(t + 2); }
      });
    },
    sudden() {
      const t = ctx.currentTime;
      for (let k = 0; k < 3; k++) { tone('square', 440, 880, t + k * 0.28, 0.22, 0.09); }
      tone('sawtooth', 110, 220, t, 0.9, 0.08);
    },
    rumble() {
      const t = ctx.currentTime;
      noise(t, 1.2, { type: 'lowpass', f0: 300, f1: 120, peak: 0.3, attack: 0.2 });
    },
  };

  function play(name, arg) {
    if (!ok() || paused) return;
    const f = S[name];
    if (!f) return;
    try { f(arg); } catch (e) { /* ignore */ }
  }

  // ── music: a bouncy 4-bar farmyard loop (banjo-ish pluck, oom-pah bass, tiny whistle) ──
  const BPM = 132, STEP = 60 / BPM / 2;   // eighth notes
  const N = (n) => 440 * Math.pow(2, (n - 69) / 12);
  // chords per bar (root midi): C F G C / C F G G
  const CHORDS = [[48, 52, 55], [53, 57, 60], [55, 59, 62], [48, 52, 55], [48, 52, 55], [53, 57, 60], [55, 59, 62], [55, 59, 62]];
  const MEL = [
    [72, null, 76, 79, 76, null, 72, null], [77, null, 76, 74, 72, null, null, null],
    [74, null, 79, 77, 76, 74, 72, null], [76, null, 72, null, 67, null, null, null],
    [72, 74, 76, null, 79, null, 76, 74], [77, null, 81, null, 79, 77, 76, null],
    [74, 76, 77, 79, 77, 76, 74, 71], [72, null, null, null, 79, null, null, null],
  ];
  function pluck(f, t, peak = 0.12, dur = 0.22) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
    o.type = 'triangle'; o2.type = 'square';
    o.frequency.value = f; o2.frequency.value = f * 2.001;
    fl.type = 'lowpass'; fl.frequency.setValueAtTime(f * 6, t); fl.frequency.exponentialRampToValueAtTime(f * 1.5, t + dur);
    const g2 = ctx.createGain(); g2.gain.value = 0.25;
    env(g, t, 0.003, peak, dur);
    o.connect(fl); o2.connect(g2); g2.connect(fl); fl.connect(g); g.connect(musicBus);
    o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  function scheduleMusic() {
    if (!ctx) return;
    while (nextNote < ctx.currentTime + 0.25) {
      const t = nextNote, b = bar % 8, s = step % 8;
      const ch = CHORDS[b];
      if (s === 0 || s === 4) pluck(N(ch[0] - 12), t, 0.2, 0.3);           // oom
      if (s === 2 || s === 6) { ch.forEach((n) => pluck(N(n), t, 0.05, 0.12)); }   // pah
      const m = MEL[b][s];
      if (m) pluck(N(m), t, 0.09, 0.2);
      if (s % 2 === 1) noise(t, 0.03, { type: 'highpass', f0: 7000, peak: 0.025, bus: musicBus });
      nextNote += STEP;
      step++;
      if (step % 8 === 0) bar++;
    }
  }
  function startMusic() {
    if (musicTimer || !ok() || paused || !wantMusic) return;
    nextNote = ctx.currentTime + 0.1; step = 0; bar = 0;
    musicTimer = setInterval(() => { try { scheduleMusic(); } catch (e) { /* ignore */ } }, 60);
  }
  function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }

  // ambient ducks now and then
  let quackTimer = null;
  function startAmbience() {
    if (quackTimer) return;
    quackTimer = setInterval(() => { if (ok() && !paused && Math.random() < 0.35) play('quack'); }, 4000);
  }

  return {
    unlock() {
      if (!build()) return;
      try { if (ctx.state !== 'running') ctx.resume(); } catch (e) { /* ignore */ }
      unlocked = true;
      startAmbience();
      if (wantMusic) setTimeout(startMusic, 50);
    },
    play,
    setMuted(on) {
      muted = !!on;
      if (master) master.gain.setTargetAtTime(muted ? 0 : vol.master, ctx.currentTime, 0.03);
      if (muted) stopMusic(); else startMusic();
    },
    music(on) { wantMusic = !!on; if (wantMusic) startMusic(); else stopMusic(); },
    setPaused(on) {
      paused = !!on;
      if (paused) stopMusic(); else startMusic();
    },
    get muted() { return muted; },
    dispose() { stopMusic(); if (quackTimer) clearInterval(quackTimer); try { if (ctx) ctx.close(); } catch (e) { /* ignore */ } },
  };
}
