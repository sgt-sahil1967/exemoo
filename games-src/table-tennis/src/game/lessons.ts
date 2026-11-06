/**
 * "Learn to Play" — a short guided first rally (practice mode starts with it).
 * Each step feeds balls from the machine and waits for `need` hits that pass `check`.
 */
import type { Grade, Zone } from './hitTiming';

export interface LessonFeed {
  speed: [number, number];
  spin: 'top' | 'back' | 'mixed' | 'none' | 'high';
  /** Lateral spread of the feeds (× half table width). */
  spread: number;
}

export interface Lesson {
  title: string;
  detail: string;
  need: number;
  /** Simulation speed for the whole step (1 = real time). */
  slow: number;
  feed: LessonFeed;
  check: (hit: { zone: Zone; power: number; grade: Grade }) => boolean;
}

export const LESSONS: Lesson[] = [
  {
    title: 'Swing when the ring turns GREEN',
    detail: 'Any swing works — or tap the big phone button',
    need: 3,
    slow: 0.6,
    feed: { speed: [4.2, 4.8], spin: 'none', spread: 0.3 },
    check: () => true,
  },
  {
    title: 'Nice! Same again, a bit faster',
    detail: 'Watch the ring, not the ball',
    need: 3,
    slow: 0.85,
    feed: { speed: [5, 6], spin: 'none', spread: 0.6 },
    check: () => true,
  },
  {
    title: 'Point your phone LEFT, then swing',
    detail: 'The lit pad shows where your shot goes (or press ◀)',
    need: 1,
    slow: 0.85,
    feed: { speed: [5, 6], spin: 'none', spread: 0.4 },
    check: (h) => h.zone === -1,
  },
  {
    title: 'Now point RIGHT and swing',
    detail: 'Or press ▶ on the phone',
    need: 1,
    slow: 0.85,
    feed: { speed: [5, 6], spin: 'none', spread: 0.4 },
    check: (h) => h.zone === 1,
  },
  {
    title: 'Swing HARD for a fast shot',
    detail: 'Bigger swing = faster ball',
    need: 1,
    slow: 1,
    feed: { speed: [5.5, 6.5], spin: 'none', spread: 0.6 },
    check: (h) => h.power > 0.6,
  },
];
