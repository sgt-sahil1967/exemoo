import { describe, expect, it } from 'vitest';
import { buildHole } from '../course';
import { TRAINING_BALLS, TRAINING_HOLE, Training, type TrainingMode } from './training';

describe('Training setups on real holes', () => {
  for (const mode of Object.keys(TRAINING_HOLE) as TrainingMode[]) {
    it(`${mode} finds valid spots`, () => {
      const hole = buildHole(TRAINING_HOLE[mode]);
      const t = new Training(mode, 42);
      for (let i = 0; i < TRAINING_BALLS; i++) {
        const a = t.setup(hole);
        const want = mode === 'training-putt' ? 'green' : mode === 'training-drive' ? 'tee' : 'fairway';
        expect(a.lie).toBe(want);
        t.record(hole, a, { holed: false, pos: hole.pin, surface: 'green', hazard: false });
      }
      expect(t.done).toBe(true);
    });
  }
});
