import { describe, expect, it } from 'vitest';
import { createAudio } from './index';

describe('createAudio without AudioContext', () => {
  it('never throws', () => {
    const a = createAudio();
    expect(() => {
      a.unlock();
      a.play('cup', { volume: 1, rate: 1, pan: 0 });
      a.setSwingWhoosh(0.5);
      a.music('menu');
      a.music(null);
      a.ambience(true, 0.5);
      a.ambience(false);
      a.setVolumes(1, 0.5, 0.5);
    }).not.toThrow();
  });
});
