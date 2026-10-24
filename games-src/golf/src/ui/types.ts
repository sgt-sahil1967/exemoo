/** Internal UI types shared by screens. */
import type {
  CareerStats,
  GameSetup,
  LinkStatus,
  LinkTransport,
  ScorecardData,
  Settings,
  UIEvents,
  UIScreen,
} from '../core/contracts';

/** One hole of the course summary (supplied by the integrator via setCourseSummary). */
export interface CourseSummaryRow {
  number: number;
  par: number;
  yards: number;
  name: string;
}

export type UISound = 'click' | 'select' | 'back';

export interface UIState {
  settings: Settings;
  stats: CareerStats;
  link: { status: LinkStatus; pin: string; url: string; transport: LinkTransport };
  scorecard: ScorecardData | null;
  courseSummary: CourseSummaryRow[];
  /** What the player picked on the connect screen (null = not yet). */
  inputChoice: 'phone' | 'mouse' | null;
  lastSetup: GameSetup;
}

export interface UICtx {
  state: UIState;
  emit<K extends keyof UIEvents>(ev: K, ...args: Parameters<UIEvents[K]>): void;
  /** Switch screens from inside the UI (menu flow). */
  go(s: UIScreen, data?: unknown): void;
  /** Screen shown before the current one. */
  readonly prev: UIScreen;
  sound(n: UISound): void;
  /** Persist + emit a settings change. */
  setSettings(s: Settings): void;
  /** Re-validate focus after a re-render. */
  refocus(): void;
}

export interface ScreenDef {
  el: HTMLElement;
  /** Called each time the screen becomes active. */
  show?(data: unknown, from: UIScreen): void;
  /** d-pad B / Esc; undefined = ignore. */
  back?(): void;
  /** Element focused when the screen opens. */
  first?(): HTMLElement | null;
  /** Shared state changed (link / settings / stats / summary) while this screen exists. */
  refresh?(): void;
  /** d-pad left/right on a focused element; return true if consumed (sliders). */
  adjust?(el: HTMLElement, dir: -1 | 1): boolean;
  /** Dim the 3D view behind this screen. */
  dim?: boolean;
}
