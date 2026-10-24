/** Outdoor ambience: breeze noise plus random birdsong, and the live swing whoosh. */
import { clamp, rand, type Core } from './engine';

/** Looping noise source routed through a bandpass into a gain node. */
function loopNoise(core: Core, dest: AudioNode, type: BiquadFilterType, freq: number, q: number) {
  const { ctx } = core;
  const src = ctx.createBufferSource();
  src.buffer = core.noiseBuf;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  src.connect(filter).connect(gain).connect(dest);
  src.start();
  return { gain, filter };
}

/** Persistent swing whoosh; speed 0…1 drives gain and centre frequency. */
export function createSwingWhoosh(core: Core) {
  const w = loopNoise(core, core.sfx, 'bandpass', 300, 1.4);
  return (speed: number): void => {
    const s = clamp(speed, 0, 1);
    const now = core.ctx.currentTime;
    w.gain.gain.setTargetAtTime(s < 0.02 ? 0 : s * s * 0.9, now, 0.05);
    w.filter.frequency.setTargetAtTime(300 + s * 2200, now, 0.05);
  };
}

/** Birds and breeze. */
export function createAmbience(core: Core) {
  const bus = core.ctx.createGain();
  bus.gain.value = 0;
  bus.connect(core.music);
  const breeze = loopNoise(core, bus, 'lowpass', 600, 0.5);
  let on = false;
  let wind = 0;
  let bird: ReturnType<typeof setTimeout> | null = null;

  const chirp = (): void => {
    const { ctx } = core;
    if (ctx.state !== 'running') return;
    const base = rand(2400, 4200);
    const syl = 1 + Math.floor(Math.random() * 4);
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    let dest: AudioNode = bus;
    if (pan) {
      pan.pan.value = rand(-0.8, 0.8);
      pan.connect(bus);
      dest = pan;
    }
    let t = ctx.currentTime + 0.02;
    for (let i = 0; i < syl; i++) {
      const dur = rand(0.05, 0.12);
      const up = Math.random() < 0.5;
      const f0 = base * rand(0.9, 1.1);
      const car = ctx.createOscillator();
      const mod = ctx.createOscillator();
      const mg = ctx.createGain();
      const g = ctx.createGain();
      car.frequency.setValueAtTime(f0, t);
      car.frequency.exponentialRampToValueAtTime(f0 * (up ? 1.5 : 0.65), t + dur);
      mod.frequency.value = rand(30, 70);
      mg.gain.value = rand(60, 200);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.5, t + dur * 0.2);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      mod.connect(mg).connect(car.frequency);
      car.connect(g).connect(dest);
      car.start(t);
      mod.start(t);
      car.stop(t + dur + 0.02);
      mod.stop(t + dur + 0.02);
      t += dur + rand(0.04, 0.09);
    }
    setTimeout(() => {
      try {
        pan?.disconnect();
      } catch {
        /* ignore */
      }
    }, (t - ctx.currentTime + 0.3) * 1000);
  };

  const loop = (): void => {
    bird = null;
    if (!on) return;
    chirp();
    bird = setTimeout(loop, rand(2000, 7000));
  };

  const applyWind = (): void => {
    breeze.gain.gain.setTargetAtTime(0.02 + wind * 0.2, core.ctx.currentTime, 0.6);
    breeze.filter.frequency.setTargetAtTime(350 + wind * 900, core.ctx.currentTime, 0.6);
  };

  return {
    set(next: boolean, w: number | undefined): void {
      if (w !== undefined) wind = clamp(w, 0, 1);
      const now = core.ctx.currentTime;
      if (next && !on) {
        on = true;
        bus.gain.setTargetAtTime(1, now, 0.8);
        bird = setTimeout(loop, rand(500, 2000));
      } else if (!next && on) {
        on = false;
        bus.gain.setTargetAtTime(0, now, 0.5);
        if (bird !== null) clearTimeout(bird);
        bird = null;
      }
      if (on) applyWind();
    },
  };
}
