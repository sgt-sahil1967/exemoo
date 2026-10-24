/** BIRDIE UI: DOM overlay with Wii-Sports-style menus, HUD, banners and scorecard.
 *  `createUI(root)` returns a GameUI (plus a few optional extras, see BirdieUI). */
import './ui.css';
import './hud.css';
import type {
  CareerStats,
  ControllerButton,
  GameUI,
  Hole,
  HudState,
  LinkStatus,
  LinkTransport,
  ResultsData,
  ScorecardData,
  Settings,
  UIEvents,
  UIScreen,
} from '../core/contracts';
import { DEFAULT_SETTINGS, DEFAULT_STATS, PALETTE } from '../core/contracts';
import type { Vector3 } from 'three';
import { h, reducedMotion } from './dom';
import { FocusNav } from './focus';
import { Hud } from './hud';
import { Overlays } from './overlays';
import { linkChip, loadingScreen, pauseScreen, statsScreen, titleScreen } from './screens/basic';
import { connectScreen } from './screens/connect';
import { howtoScreen } from './screens/howto';
import { resultsScreen, scorecardScreen } from './screens/scorecard';
import { settingsScreen } from './screens/settings';
import { loadSetup, setupScreen } from './screens/setup';
import type { CourseSummaryRow, ScreenDef, UICtx, UISound, UIState } from './types';

export type { CourseSummaryRow, UISound } from './types';
export { KEY_HELP } from './screens/howto';

/** GameUI plus optional integrator hooks. */
export interface BirdieUI extends GameUI {
  /** Per-hole course data (number, par, yards, name) for the setup hole-set summaries. */
  setCourseSummary(rows: CourseSummaryRow[]): void;
  /** Keep the pause-menu scorecard current without showing it. */
  setScorecard(d: ScorecardData | null): void;
  /** Hook for menu blips: called with 'click' (focus move), 'select' (activate), 'back'. */
  setSound(fn: ((n: UISound) => void) | null): void;
  /** Tear down listeners and DOM. */
  dispose(): void;
}

export interface UIOptions {
  /** Listen to arrow keys / Enter / Escape for menu navigation (default true). Disable if the
   *  integrator already forwards the keyboard to navigate(). */
  keyboard?: boolean;
}

const MENU_SCREENS: UIScreen[] = ['loading', 'title', 'connect', 'setup', 'howto', 'stats', 'results'];

function loadFont() {
  if (document.getElementById('bd-font')) return;
  try {
    const pre = h('link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' });
    const link = h('link', {
      id: 'bd-font',
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap',
    });
    document.head.append(pre, link);
  } catch {
    /* offline: system rounded stack is used */
  }
}

export function createUI(root: HTMLElement, opts: UIOptions = {}): BirdieUI {
  loadFont();
  root.classList.add('bd-root');
  for (const [k, v] of Object.entries(PALETTE)) root.style.setProperty(`--${k.replace(/[A-Z0-9]/g, (m) => '-' + m.toLowerCase())}`, v);
  if (reducedMotion()) root.classList.add('is-reduced');

  const listeners = new Map<keyof UIEvents, Set<(...a: unknown[]) => void>>();
  let soundFn: ((n: UISound) => void) | null = null;
  const sound = (n: UISound) => {
    try {
      soundFn?.(n);
    } catch {
      /* ignore */
    }
  };

  const state: UIState = {
    settings: { ...DEFAULT_SETTINGS },
    stats: { ...DEFAULT_STATS },
    link: { status: 'idle', pin: '', url: '', transport: 'none' },
    scorecard: null,
    courseSummary: [],
    inputChoice: null,
    lastSetup: loadSetup(),
  };

  let screen: UIScreen = 'none';
  let prev: UIScreen = 'none';

  const ctx: UICtx = {
    state,
    emit(ev, ...args) {
      const set = listeners.get(ev);
      if (!set) return;
      for (const cb of [...set]) {
        try {
          cb(...args);
        } catch (err) {
          console.error(`[ui] ${ev} handler failed`, err);
        }
      }
    },
    go: (s, data) => showScreen(s, data),
    get prev() {
      return prev;
    },
    sound,
    setSettings(s: Settings) {
      state.settings = s;
      ctx.emit('settings', s);
      hudChip();
    },
    refocus: () => nav.refresh(),
  };

  // ── layers ──
  const hud = new Hud((b) => ctx.emit('hudButton', b));
  const over = new Overlays();
  const screensLayer = h('div', { class: 'bd-screens' });
  const dimmer = h('div', { class: 'bd-dimmer' });
  const hudLink = linkChip();
  hudLink.el.classList.add('bd-hud__link');
  root.append(hud.el, over.markerLayer, hudLink.el, over.bannerLayer, over.toastLayer, dimmer, screensLayer);
  const nav = new FocusNav(screensLayer);
  nav.onMove = () => sound('click');

  const defs: Partial<Record<UIScreen, ScreenDef>> = {
    loading: loadingScreen(),
    title: titleScreen(ctx),
    connect: connectScreen(ctx),
    setup: setupScreen(ctx),
    settings: settingsScreen(ctx),
    howto: howtoScreen(ctx),
    stats: statsScreen(ctx),
    pause: pauseScreen(ctx),
    scorecard: scorecardScreen(ctx),
    results: resultsScreen(ctx),
  };
  for (const [k, d] of Object.entries(defs)) {
    d!.el.dataset.screen = k;
    screensLayer.append(d!.el);
    // Clicking any nav item plays the select blip.
    d!.el.addEventListener('click', (e) => {
      const t = (e.target as HTMLElement).closest('[data-nav]') as HTMLElement | null;
      if (t && !(t as HTMLButtonElement).disabled) sound('select');
    });
  }

  function hudChip() {
    const s = state.link.status;
    const show = screen === 'none' && hud.state.visible && (s === 'disconnected' || s === 'error') && state.inputChoice !== 'mouse';
    hudLink.update(state);
    hudLink.el.classList.toggle('is-shown', show);
    root.classList.toggle('is-mouse', s !== 'connected');
  }

  function showScreen(s: UIScreen, data?: unknown) {
    const from = screen;
    const def = defs[s];
    if (s !== screen) {
      prev = screen;
      defs[screen]?.el.classList.remove('is-active');
    }
    screen = s;
    root.dataset.screen = s;
    root.classList.toggle('is-menu', MENU_SCREENS.includes(s));
    dimmer.classList.toggle('is-on', !!def?.dim);
    if (def) {
      try {
        def.show?.(data, from);
      } catch (err) {
        console.error('[ui] screen show failed', err);
      }
      def.el.classList.add('is-active');
      nav.setScope(def.el, def.first?.() ?? null);
    } else nav.setScope(null);
    hudChip();
  }

  function navigate(b: ControllerButton): boolean {
    const def = defs[screen];
    if (!def) return false;
    if (b === 'up' || b === 'down' || b === 'left' || b === 'right') {
      const cur = nav.current;
      if (cur && (b === 'left' || b === 'right') && def.adjust?.(cur, b === 'left' ? -1 : 1)) return true;
      nav.move(b);
      return true;
    }
    if (b === 'a' || b === 'swing') {
      const cur = nav.current;
      if (!cur) return true;
      if (cur instanceof HTMLInputElement && cur.type === 'text') cur.focus();
      else if (!(cur as HTMLButtonElement).disabled) {
        cur.classList.remove('is-press');
        void cur.offsetWidth;
        cur.classList.add('is-press');
        cur.click();
      }
      return true;
    }
    if (b === 'b') {
      if (def.back) {
        sound('back');
        def.back();
      }
      return true;
    }
    if (b === 'pause' && screen === 'pause') ctx.emit('resume');
    return true;
  }

  // ── keyboard ──
  const onKey = (e: KeyboardEvent) => {
    if (screen === 'none' || !defs[screen]) return;
    const t = e.target as HTMLElement;
    if (t instanceof HTMLInputElement && t.type === 'text') return;
    const map: Record<string, ControllerButton> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      Enter: 'a',
      ' ': 'a',
      Escape: 'b',
      Backspace: 'b',
    };
    const b = map[e.key];
    if (!b) return;
    e.preventDefault();
    navigate(b);
  };
  if (opts.keyboard !== false) window.addEventListener('keydown', onKey);

  const ui: BirdieUI = {
    get screen() {
      return screen;
    },
    showScreen: (s, data) => showScreen(s, data),
    hud(p: Partial<HudState>) {
      hud.update(p);
      if ('visible' in p) hudChip();
    },
    power: (m) => hud.power.set(m),
    banner: (text, kind, ms, sub) => over.banner(text, kind, ms, sub),
    toast: (text) => over.toast(text),
    minimap(hole: Hole | null, ball?: Vector3, aim?: Vector3) {
      hud.minimap.set(hole, ball, aim);
    },
    marker: (id, pos, text) => over.marker(id, pos, text),
    setLink(status: LinkStatus, pin: string, controllerUrl: string, transport: LinkTransport) {
      const l = state.link;
      if (l.status === status && l.pin === pin && l.url === controllerUrl && l.transport === transport) return;
      state.link = { status, pin, url: controllerUrl, transport };
      if (status === 'connected' && !state.inputChoice) state.inputChoice = 'phone';
      for (const d of Object.values(defs)) d?.refresh?.();
      hudChip();
    },
    setSettings(s: Settings) {
      state.settings = { ...s };
      defs.settings?.refresh?.();
    },
    setStats(s: CareerStats) {
      state.stats = s;
      defs.stats?.refresh?.();
    },
    navigate,
    on(ev, cb) {
      let set = listeners.get(ev);
      if (!set) listeners.set(ev, (set = new Set()));
      const f = cb as unknown as (...a: unknown[]) => void;
      set.add(f);
      return () => set!.delete(f);
    },
    setCourseSummary(rows) {
      state.courseSummary = rows.map((r) => ({ number: r.number, par: r.par, yards: r.yards, name: r.name }));
      defs.setup?.refresh?.();
    },
    setScorecard(d) {
      state.scorecard = d;
    },
    setSound(fn) {
      soundFn = fn;
    },
    dispose() {
      window.removeEventListener('keydown', onKey);
      nav.setScope(null);
      root.replaceChildren();
      root.classList.remove('bd-root');
    },
  };
  showScreen('loading');
  return ui;
}

export type { ResultsData, ScorecardData };
