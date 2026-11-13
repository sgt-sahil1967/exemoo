// Back2Back player settings, saved in localStorage. Pure data + helpers; the UI lives in ui.ts, the effects in main.ts.
export interface Settings {
  crosshairSize: number; // 0.5..2 (1 = normal, 44 px)
  crosshairStyle: 'ring' | 'dot' | 'cross';
  crosshairColor: 'blue' | 'red' | 'green' | 'yellow' | 'white';
  aimSens: number; // 0.6..1.8
  steerSens: number; // 0.6..1.6
  volume: number; // 0..1
  engine: boolean;
  quality: 'high' | 'low';
  shake: 'off' | 'low' | 'full';
}

export const DEFAULTS: Settings = {
  crosshairSize: 1,
  crosshairStyle: 'ring',
  crosshairColor: 'blue',
  aimSens: 1,
  steerSens: 1,
  volume: 0.7,
  engine: true,
  quality: 'high',
  shake: 'full',
};

export const COLORS: Record<Settings['crosshairColor'], string> = { blue: '#2f7cff', red: '#ff3b30', green: '#2fc65a', yellow: '#ffd21f', white: '#ffffff' };

export type Key = keyof Settings;
export interface Spec {
  key: Key;
  label: string;
  group: 'Shooter' | 'Driver' | 'Game';
  kind: 'num' | 'choice';
  min?: number;
  max?: number;
  step?: number;
  choices?: string[];
  fmt?: (v: number | string | boolean) => string;
}

const pct = (v: number | string | boolean) => `${Math.round(Number(v) * 100)}%`;
const onOff = (v: number | string | boolean) => (v ? 'On' : 'Off');

export const SPECS: Spec[] = [
  { key: 'crosshairSize', label: 'Crosshair size', group: 'Shooter', kind: 'num', min: 0.5, max: 2, step: 0.1, fmt: pct },
  { key: 'crosshairStyle', label: 'Crosshair style', group: 'Shooter', kind: 'choice', choices: ['ring', 'dot', 'cross'] },
  { key: 'crosshairColor', label: 'Crosshair colour', group: 'Shooter', kind: 'choice', choices: ['blue', 'red', 'green', 'yellow', 'white'] },
  { key: 'aimSens', label: 'Aim sensitivity', group: 'Shooter', kind: 'num', min: 0.6, max: 1.8, step: 0.1, fmt: pct },
  { key: 'steerSens', label: 'Steering sensitivity', group: 'Driver', kind: 'num', min: 0.6, max: 1.6, step: 0.1, fmt: pct },
  { key: 'volume', label: 'Volume', group: 'Game', kind: 'num', min: 0, max: 1, step: 0.1, fmt: pct },
  { key: 'engine', label: 'Engine sound', group: 'Game', kind: 'choice', choices: ['on', 'off'], fmt: onOff },
  { key: 'quality', label: 'Graphics', group: 'Game', kind: 'choice', choices: ['high', 'low'] },
  { key: 'shake', label: 'Camera shake', group: 'Game', kind: 'choice', choices: ['off', 'low', 'full'] },
];

const KEY = 'back2back.settings';

export function loadSettings(): Settings {
  const s: Settings = { ...DEFAULTS };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Settings>;
    for (const sp of SPECS) {
      const v = raw[sp.key];
      if (v === undefined) continue;
      if (sp.kind === 'num' && typeof v === 'number') (s as unknown as Record<string, unknown>)[sp.key] = Math.min(sp.max ?? 1, Math.max(sp.min ?? 0, v));
      else if (sp.key === 'engine' && typeof v === 'boolean') s.engine = v;
      else if (sp.kind === 'choice' && sp.key !== 'engine' && typeof v === 'string' && sp.choices?.includes(v)) (s as unknown as Record<string, unknown>)[sp.key] = v;
    }
  } catch {
    /* no storage or bad JSON: defaults */
  }
  return s;
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

/** Step a setting one notch up (+1) or down (-1); choices wrap around. */
export function step(s: Settings, key: Key, dir: 1 | -1): void {
  const sp = SPECS.find((x) => x.key === key);
  if (!sp) return;
  const o = s as unknown as Record<string, unknown>;
  if (sp.kind === 'num') {
    const v = Math.round((Number(o[key]) + dir * (sp.step ?? 0.1)) * 100) / 100;
    o[key] = Math.min(sp.max ?? 1, Math.max(sp.min ?? 0, v));
  } else if (key === 'engine') {
    s.engine = !s.engine;
  } else {
    const list = sp.choices ?? [];
    const i = list.indexOf(String(o[key]));
    o[key] = list[(i + dir + list.length) % list.length];
  }
}

export function display(s: Settings, sp: Spec): string {
  const v = (s as unknown as Record<string, number | string | boolean>)[sp.key];
  if (sp.fmt) return sp.fmt(v);
  const t = String(v);
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Crosshair artwork. The yellow ring is the shot-cooldown meter (id xhRing). */
export function crosshairSvg(style: Settings['crosshairStyle'], color: Settings['crosshairColor']): string {
  const c = COLORS[color];
  const ring = '<circle id="xhRing" r="26" fill="none" stroke="#ffd21f" stroke-width="5" stroke-dasharray="163.4" transform="rotate(-90)"/>';
  let core: string;
  if (style === 'dot') core = `<circle r="4.5" fill="${c}" stroke="#1b1b3a" stroke-width="3"/>`;
  else if (style === 'cross') core = `<path d="M-20 0H-6M6 0H20M0-20V-6M0 6V20" stroke="#1b1b3a" stroke-width="8" stroke-linecap="round"/><path d="M-20 0H-6M6 0H20M0-20V-6M0 6V20" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
  else core = `<circle r="15" fill="none" stroke="#1b1b3a" stroke-width="7"/><circle r="15" fill="none" stroke="${c}" stroke-width="4"/><circle r="2.5" fill="${c}"/>`;
  return `<svg viewBox="-40 -40 80 80">${core}${ring}</svg>`;
}
