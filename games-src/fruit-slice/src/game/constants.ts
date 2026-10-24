import type { GameMode } from '../contracts';

/** Fruits fly in this plane, just behind the table's far edge (z = -2.2). */
export const ACTION_Z = -2.8;
/** Visual scale applied to asset models (asset radius × this = world radius). */
export const FRUIT_SCALE = 1.9;

export const GRAVITY = 7.6;
export const LAUNCH_Y = -1.9;
/** Unsliced fruit below this (falling) count as missed. */
export const MISS_Y = -1.2;
export const KILL_Y = -7;

export const TABLE = { minX: -4.2, maxX: 4.2, minZ: -2.2, maxZ: 1.6, topY: 0 };

/** Minimum blade speed (screen heights / s, NDC units ÷ 2) that can cut. */
export const CUT_SPEED = 0.9;
export const SWOOSH_SPEED = 2.4;
/** Combo: slices within this window of each other belong to one swipe. */
export const COMBO_WINDOW = 0.32;
export const CRITICAL_CHANCE = 0.05;
export const CRITICAL_POINTS = 10;

export const MODE_RULES: Record<GameMode, { lives?: number; time?: number; bombs: boolean; powerUps: boolean }> = {
  classic: { lives: 3, bombs: true, powerUps: false },
  arcade: { time: 60, bombs: true, powerUps: true },
  zen: { time: 90, bombs: false, powerUps: false },
};

export const POWERUP_DURATION = { freeze: 5, frenzy: 5, double: 8 } as const;
export const ARCADE_BOMB_PENALTY = 10;
export const EXTRA_LIFE_EVERY = 100;

export const MENU_FRUITS: { mode: GameMode; kind: 'watermelon' | 'pineapple' | 'peach'; x: number; y: number }[] = [
  { mode: 'classic', kind: 'watermelon', x: -3.3, y: 2.05 },
  { mode: 'arcade', kind: 'pineapple', x: 0, y: 2.05 },
  { mode: 'zen', kind: 'peach', x: 3.3, y: 2.05 },
];
