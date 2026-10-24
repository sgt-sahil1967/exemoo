/** BIRDIE audio: fully synthesized WebAudio engine. All calls are safe no-ops without AudioContext. */
import type { AudioEngine, SfxName } from '../core/contracts';
import { createAmbience, createSwingWhoosh } from './ambience';
import { clamp, createCore, type Core } from './engine';
import { createMusic, type Track } from './music';
import { playSfx } from './sfx';

export function createAudio(): AudioEngine {
  let core: Core | null = null;
  let failed = false;
  let vols = { master: 0.8, music: 0.6, sfx: 0.9 };
  let whoosh: ((s: number) => void) | null = null;
  let music: ReturnType<typeof createMusic> | null = null;
  let amb: ReturnType<typeof createAmbience> | null = null;
  // State requested before the context existed.
  let wantTrack: Track | null = null;
  let wantAmb = { on: false, wind: 0 };
  let wantWhoosh = 0;

  const applyVolumes = (): void => {
    if (!core) return;
    const t = core.ctx.currentTime;
    core.master.gain.setTargetAtTime(vols.master, t, 0.02);
    core.music.gain.setTargetAtTime(vols.music, t, 0.02);
    core.sfx.gain.setTargetAtTime(vols.sfx, t, 0.02);
  };

  const guard = (fn: () => void): void => {
    try {
      fn();
    } catch {
      /* audio must never throw */
    }
  };

  return {
    unlock(): void {
      guard(() => {
        if (!core && !failed) {
          core = createCore();
          if (!core) {
            failed = true;
            return;
          }
          whoosh = createSwingWhoosh(core);
          music = createMusic(core);
          amb = createAmbience(core);
          core.master.gain.value = vols.master;
          core.music.gain.value = vols.music;
          core.sfx.gain.value = vols.sfx;
          music.play(wantTrack);
          amb.set(wantAmb.on, wantAmb.wind);
          whoosh(wantWhoosh);
        }
        if (core && core.ctx.state === 'suspended') void core.ctx.resume().catch(() => undefined);
      });
    },
    play(name: SfxName, opts?: { volume?: number; rate?: number; pan?: number }): void {
      if (core) playSfx(core, name, opts);
    },
    // The live swing whoosh (filtered noise) read as a hiss with phone swings: kept silent.
    setSwingWhoosh(_speed: number): void {
      wantWhoosh = 0;
      if (whoosh) guard(() => whoosh?.(0));
    },
    music(track: Track | null): void {
      wantTrack = track;
      if (music) guard(() => music?.play(track));
    },
    ambience(on: boolean, wind?: number): void {
      wantAmb = { on, wind: wind ?? wantAmb.wind };
      if (amb) guard(() => amb?.set(on, wind));
    },
    setVolumes(master: number, music: number, sfx: number): void {
      vols = { master: clamp(master, 0, 1), music: clamp(music, 0, 1), sfx: clamp(sfx, 0, 1) };
      guard(applyVolumes);
    },
  };
}
