/**
 * Local persistence for settings and career stats. Every access is guarded: storage can be
 * unavailable (private windows, blocked site data) and the game must still run.
 */
import type { CareerStats, Settings } from '../core/contracts';
import { DEFAULT_SETTINGS, DEFAULT_STATS } from '../core/contracts';

const SETTINGS_KEY = 'birdie.settings.v1';
const STATS_KEY = 'birdie.stats.v1';

function read<T extends object>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return structuredClone(fallback);
    return { ...structuredClone(fallback), ...JSON.parse(raw) };
  } catch {
    return structuredClone(fallback);
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: keep in memory only */
  }
}

export const loadSettings = (): Settings => read(SETTINGS_KEY, DEFAULT_SETTINGS);
export const saveSettings = (s: Settings) => write(SETTINGS_KEY, s);
export const loadStats = (): CareerStats => read(STATS_KEY, DEFAULT_STATS);
export const saveStats = (s: CareerStats) => write(STATS_KEY, s);
