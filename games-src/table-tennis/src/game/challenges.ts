import type { ChallengeDef } from '../ui/ui';

export type ChallengeId = 'targets' | 'rally' | 'speed' | 'spin';

export const CHALLENGES: (ChallengeDef & { id: ChallengeId; seconds?: number; feeds?: number; unit: string })[] = [
  {
    id: 'targets',
    name: 'Target Practice',
    description: 'Glowing rings appear on the far side. Land your returns inside them — chain hits for a combo bonus.',
    goal: 'Score as many points as you can in 60 seconds',
    seconds: 60,
    unit: 'pts',
  },
  {
    id: 'rally',
    name: 'Rally Master',
    description: 'Keep the ball alive against a steady club player. Three attempts, your longest rally counts.',
    goal: 'Longest rally out of 3 tries',
    unit: 'hits',
  },
  {
    id: 'speed',
    name: 'Speed Demon',
    description: 'The machine feeds high, juicy balls. Swing hard and put them away on the table.',
    goal: 'Fastest legal smash in 12 balls',
    feeds: 12,
    unit: 'km/h',
  },
  {
    id: 'spin',
    name: 'Spin Doctor',
    description: 'Heavy backspin, every ball. Brush up through the ball to loop it back with topspin.',
    goal: 'Most topspin returns in 60 seconds',
    seconds: 60,
    unit: 'loops',
  },
];

export const challengeById = (id: string | undefined) => CHALLENGES.find((c) => c.id === id);
