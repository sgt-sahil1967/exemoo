// Procedural Web Audio for the Exemoo party minigames: synthesised one-shots and a small
// lookahead-scheduled music loop. Nothing is loaded from files.
// Copied unchanged from the party kit in games/shake-freeze.

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

/**
 * cfg = { bpm, root (MIDI note), scale: semitone list, prog: chord roots in scale degrees, lead: 'pluck'|'square'|'marimba' }
 */
export function createAudio(cfg = {}) {
  const bpm = cfg.bpm || 118;
  const root = cfg.root ?? 60;
  const scale = cfg.scale || [0, 2, 4, 7, 9];
  const prog = cfg.prog || [0, 9, 5, 7];
  const leadKind = cfg.lead || 'pluck';
  let ctx = null, master = null, sfxBus = null, musicBus = null, noiseBuf = null;
  let musicMode = 'off';
  let timer = 0, nextTime = 0, step = 0;
  let muted = false;
  try {
    muted = localStorage.getItem('exemoo.party.mute') === '1';
  } catch {
    /* ignore */
  }

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.85;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    master.connect(comp);
    comp.connect(ctx.destination);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.9;
    sfxBus.connect(master);
    musicBus = ctx.createGain();
    musicBus.gain.value = 0.28;
    musicBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }

  function unlock() {
    if (!ensure()) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    if (!timer) {
      nextTime = ctx.currentTime + 0.1;
      timer = setInterval(schedule, 25);
    }
  }

  const now = () => (ctx ? ctx.currentTime : 0);

  /** Oscillator voice. */
  function tone(freq, dur, { type = 'sine', vol = 0.3, slide = 0, at = 0, attack = 0.005, bus = 'sfx', pan = 0, detune = 0 } = {}) {
    if (!ctx || ctx.state !== 'running') return;
    const t0 = now() + at;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(Math.max(20, freq), t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t0 + dur);
    if (detune) o.detune.value = detune;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    let out = g;
    if (pan && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      g.connect(p);
      out = p;
    }
    out.connect(bus === 'music' ? musicBus : sfxBus);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  }

  /** Filtered noise burst. */
  function noise(dur, { freq = 1500, q = 1, vol = 0.3, type = 'bandpass', at = 0, slide = 0, bus = 'sfx', attack = 0.003, pan = 0 } = {}) {
    if (!ctx || ctx.state !== 'running') return;
    const t0 = now() + at;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(freq, t0);
    if (slide) f.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f);
    f.connect(g);
    let out = g;
    if (pan && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      g.connect(p);
      out = p;
    }
    out.connect(bus === 'music' ? musicBus : sfxBus);
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + dur + 0.05);
    src.onended = () => {
      src.disconnect();
      f.disconnect();
      g.disconnect();
    };
  }

  /** Common UI and party sounds. */
  const SFX = {
    click: () => tone(880, 0.06, { type: 'triangle', vol: 0.18, slide: 300 }),
    join: () => {
      tone(523, 0.1, { type: 'square', vol: 0.12 });
      tone(784, 0.16, { type: 'square', vol: 0.12, at: 0.08 });
    },
    beep: () => tone(660, 0.16, { type: 'square', vol: 0.16 }),
    go: () => {
      tone(988, 0.35, { type: 'square', vol: 0.16 });
      tone(1319, 0.4, { type: 'triangle', vol: 0.18, at: 0.02 });
    },
    whistle: () => {
      tone(2100, 0.28, { type: 'sine', vol: 0.22, slide: 300 });
      tone(2100, 0.5, { type: 'sine', vol: 0.18, at: 0.3, slide: -200 });
    },
    finish: () => {
      [72, 76, 79, 84].forEach((m, i) => tone(mtof(m), 0.25, { type: 'square', vol: 0.12, at: i * 0.09 }));
      noise(0.6, { freq: 6000, type: 'highpass', vol: 0.1, at: 0.3 });
    },
    win: () => {
      const notes = [67, 72, 76, 79, 76, 79, 84];
      notes.forEach((m, i) => {
        tone(mtof(m), i === notes.length - 1 ? 0.8 : 0.18, { type: 'square', vol: 0.11, at: i * 0.12 });
        tone(mtof(m - 12), 0.2, { type: 'triangle', vol: 0.12, at: i * 0.12 });
      });
    },
    pop: () => {
      tone(300, 0.08, { type: 'sine', vol: 0.3, slide: 900 });
      noise(0.05, { freq: 3000, vol: 0.12 });
    },
    ding: () => {
      tone(1568, 0.5, { type: 'sine', vol: 0.2 });
      tone(2093, 0.4, { type: 'triangle', vol: 0.08, at: 0.02 });
    },
    buzz: () => {
      tone(140, 0.35, { type: 'sawtooth', vol: 0.18, slide: -40 });
      tone(147, 0.35, { type: 'square', vol: 0.1 });
    },
    splat: () => {
      noise(0.25, { freq: 600, q: 0.8, vol: 0.4, slide: -400, type: 'lowpass' });
      tone(180, 0.2, { type: 'sine', vol: 0.3, slide: -120 });
    },
    whoosh: () => noise(0.35, { freq: 500, q: 2, vol: 0.2, slide: 2500, attack: 0.08 }),
    cheer: () => {
      for (let i = 0; i < 6; i++) noise(0.9, { freq: 900 + i * 300, q: 3, vol: 0.05, at: i * 0.04, attack: 0.15 });
    },
  };

  function play(name, opts) {
    if (SFX[name]) SFX[name](opts);
  }

  // ───────────── music ─────────────
  function note(deg, oct = 0) {
    const n = scale.length;
    const o = Math.floor(deg / n);
    const i = ((deg % n) + n) % n;
    return root + scale[i] + 12 * (o + oct);
  }
  function lead(m, t, dur) {
    const f = mtof(m);
    if (leadKind === 'square') {
      tone(f, dur, { type: 'square', vol: 0.07, at: t, bus: 'music' });
    } else if (leadKind === 'marimba') {
      tone(f, dur * 0.9, { type: 'sine', vol: 0.2, at: t, bus: 'music' });
      tone(f * 4, 0.05, { type: 'sine', vol: 0.05, at: t, bus: 'music' });
    } else {
      tone(f, dur, { type: 'triangle', vol: 0.16, at: t, bus: 'music' });
      tone(f * 2, dur * 0.5, { type: 'sine', vol: 0.05, at: t, bus: 'music' });
    }
  }
  // Seeded melody so the tune repeats like a real loop.
  let seed = (cfg.seed || 7) >>> 0;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const melody = [];
  for (let bar = 0; bar < 4; bar++) {
    const row = [];
    let deg = 4 + ((rnd() * 3) | 0);
    for (let s = 0; s < 16; s++) {
      const on = s % 4 === 0 ? rnd() < 0.85 : s % 2 === 0 ? rnd() < 0.45 : rnd() < 0.15;
      if (on) {
        deg += ((rnd() * 5) | 0) - 2;
        deg = Math.max(2, Math.min(10, deg));
        row.push(deg);
      } else row.push(null);
    }
    melody.push(row);
  }

  function schedule() {
    if (!ctx || ctx.state !== 'running') return;
    const spb = 60 / bpm / 4; // seconds per 16th
    while (nextTime < ctx.currentTime + 0.12) {
      const at = nextTime - ctx.currentTime;
      if (musicMode !== 'off') playStep(step, Math.max(0, at), spb);
      nextTime += spb;
      step = (step + 1) % 64;
    }
  }
  function playStep(s, at, spb) {
    const bar = (s / 16) | 0, i = s % 16;
    const chord = prog[bar % prog.length];
    const bass = root - 24 + chord;
    const busy = musicMode === 'play';
    if (i % 8 === 0) tone(mtof(bass), spb * 3.5, { type: 'triangle', vol: 0.28, at, bus: 'music' });
    if (i % 8 === 6) tone(mtof(bass + 12), spb * 1.5, { type: 'triangle', vol: 0.16, at, bus: 'music' });
    if (i === 4 || i === 12) {
      // off-beat chord stab
      [0, 4, 7].forEach((iv) => tone(mtof(root - 12 + chord + iv + (iv === 4 && (chord === 9 || chord === 2 || chord === 4) ? -1 : 0)), spb * 1.4, { type: 'sine', vol: 0.06, at, bus: 'music' }));
    }
    const m = melody[bar][i];
    if (m != null && (busy || i % 4 === 0)) lead(note(m), at, spb * (busy ? 1.8 : 3));
    if (busy) {
      if (i % 4 === 0) tone(150, 0.12, { type: 'sine', vol: 0.32, slide: -100, at, bus: 'music' });
      if (i === 4 || i === 12) noise(0.12, { freq: 1800, q: 0.8, vol: 0.14, at, bus: 'music' });
      if (i % 2 === 0) noise(0.04, { freq: 8000, type: 'highpass', vol: i % 4 === 2 ? 0.06 : 0.03, at, bus: 'music' });
    }
  }

  function setMusic(mode) {
    musicMode = mode;
  }
  function setMuted(m) {
    muted = m;
    try {
      localStorage.setItem('exemoo.party.mute', m ? '1' : '0');
    } catch {
      /* ignore */
    }
    if (master) master.gain.value = m ? 0 : 0.85;
  }

  return { unlock, tone, noise, play, setMusic, setMuted, get muted() { return muted; }, mtof };
}
