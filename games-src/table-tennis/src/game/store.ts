import { DEFAULT_SETTINGS, DEFAULT_STATS, type CareerStats, type Settings } from '../core/contracts';

const SETTINGS_KEY = 'spinshot.settings.v1';
const STATS_KEY = 'spinshot.stats.v1';

function read<T extends object>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return structuredClone(fallback);
    // Merge so new fields added in later versions get their defaults.
    return { ...structuredClone(fallback), ...JSON.parse(raw) };
  } catch {
    return structuredClone(fallback);
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) — play on without persistence */
  }
}

export const loadSettings = (): Settings => read(SETTINGS_KEY, DEFAULT_SETTINGS);
export const saveSettings = (s: Settings) => write(SETTINGS_KEY, s);
export const loadStats = (): CareerStats => read(STATS_KEY, DEFAULT_STATS);
export const saveStats = (s: CareerStats) => write(STATS_KEY, s);
export const freshStats = (): CareerStats => structuredClone(DEFAULT_STATS);
