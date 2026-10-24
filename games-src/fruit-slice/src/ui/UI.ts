import './ui.css';
import QRCode from 'qrcode';
import { DEFAULT_SETTINGS } from '../contracts';
import type {
  GameMode, GameScreen, HudState, LinkInfo, PowerUpKind, RunStats, Settings,
} from '../contracts';
import { ICONS, logoSVG } from './art';

export interface UIHandlers {
  onModeSelect(mode: GameMode): void;
  onPause(): void;
  onResume(): void;
  onRestart(): void;
  /** back to menu */
  onQuit(): void;
  onSettingsChange(s: Settings): void;
  onCalibrate(): void;
  /** skip phone pairing */
  onPlayWithMouse(): void;
  /** re-open pairing screen */
  onShowPairing(): void;
}

export interface UIHooks {
  /** 3,2,1 then 0 for "GO!" */
  onCountdownTick?(n: number): void;
  onHover?(): void;
  onClick?(): void;
  /** Fired whenever the UI changes screen by itself (e.g. Settings / Back). */
  onScreenChange?(screen: GameScreen): void;
}

export interface MenuAnchor {
  id: GameMode | 'settings' | 'pair';
  /** NDC, y up */
  x: number;
  y: number;
  /** radius in NDC-height units (1 = half the viewport height) */
  r: number;
  label: string;
  sub?: string;
  /** 0..1 */
  hover?: number;
}

export type BannerKind = 'info' | 'freeze' | 'frenzy' | 'double' | 'danger' | 'gold';

export interface GameOverInfo {
  mode: GameMode;
  score: number;
  best: number;
  isNewBest: boolean;
  reason: 'bomb' | 'lives' | 'time';
  stats: RunStats;
}

const SETTINGS_KEY = 'tableslice.settings';
const BEST_KEY = 'tableslice.best';
export const BLADE_COLORS = ['#8ef6ff', '#ffffff', '#ff8a3d', '#ff4fa3', '#9dff6a', '#ffcf3d', '#b48cff'];
const MODE_SUB: Record<GameMode, string> = {
  classic: '3 lives · avoid bombs',
  arcade: '60s · power-ups',
  zen: '90s · no bombs',
};
const PU_ICON: Record<PowerUpKind, string> = { freeze: ICONS.snow, frenzy: ICONS.bolt, double: ICONS.x2 };

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, html?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

function lsGet<T>(key: string): T | null {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}
function lsSet(key: string, v: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* private mode etc. */
  }
}
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const fmtInt = (n: number) => Math.round(n).toLocaleString('en-US');

interface AnchorEl {
  root: HTMLDivElement;
  prog: SVGCircleElement;
  name: HTMLElement;
  sub: HTMLElement;
  best: HTMLElement;
  key: string;
}

export class UI {
  private readonly root: HTMLElement;
  private readonly h: UIHandlers;
  private hooks: UIHooks = {};
  private ui: HTMLDivElement;
  private screen: GameScreen | null = null;
  private screens = {} as Record<GameScreen, HTMLDivElement>;
  private primary = {} as Partial<Record<GameScreen, HTMLElement>>;
  private settingsReturn: GameScreen = 'menu';
  private settings: Settings;
  private bests: Record<string, number>;
  private size = { w: 1, h: 1 };
  private ro?: ResizeObserver;
  private timers = new Set<number>();
  private pointed: HTMLElement | null = null;

  // connection
  private badge!: HTMLButtonElement;
  private badgeText!: HTMLElement;
  private badgeRate!: HTMLElement;
  private linkStatus: LinkInfo['status'] = 'idle';
  private qrEl!: HTMLDivElement;
  private qrUrl = '';
  private urlEl!: HTMLElement;
  private pinEl!: HTMLElement;
  private statusEl!: HTMLElement;
  private statusText!: HTMLElement;

  // menu
  private anchorLayer!: HTMLDivElement;
  private anchors = new Map<string, AnchorEl>();
  private hintEl!: HTMLElement;

  // hud
  private scoreNum!: HTMLElement;
  private scoreBest!: HTMLElement;
  private multEl!: HTMLElement;
  private livesEl!: HTMLElement;
  private timerEl!: HTMLElement;
  private timerText!: HTMLElement;
  private puEl!: HTMLElement;
  private chips = new Map<PowerUpKind, HTMLElement>();
  private lastHud: { score: number; lives: number; maxLives: number; time: string; mode: GameMode | ''; mult: number } = {
    score: -1, lives: -1, maxLives: -1, time: '', mode: '', mult: 0,
  };
  private countdownEl!: HTMLElement;
  private countdownRun = 0;

  // overlays
  private bannerEl!: HTMLElement;
  private toastEl!: HTMLElement;
  private fpsEl!: HTMLElement;

  // settings
  private settingsSync: (() => void)[] = [];

  // game over
  private go!: {
    head: HTMLElement; sub: HTMLElement; score: HTMLElement; ribbon: HTMLElement; best: HTMLElement;
    stats: HTMLElement[];
  };
  private goAnim = 0;

  constructor(root: HTMLElement, handlers: UIHandlers) {
    this.root = root;
    this.h = handlers;
    this.settings = this.loadSettings();
    this.bests = lsGet<Record<string, number>>(BEST_KEY) ?? {};

    if (getComputedStyle(root).position === 'static') root.style.position = 'relative';
    this.ui = el('div', 'ts-ui');
    root.appendChild(this.ui);

    this.buildChrome();
    this.screens.pair = this.buildPair();
    this.screens.menu = this.buildMenu();
    this.screens.playing = this.buildHud();
    this.screens.paused = this.buildPaused();
    this.screens.settings = this.buildSettings();
    this.screens.gameover = this.buildGameOver();
    // stacking order
    for (const k of ['menu', 'playing', 'pair', 'paused', 'gameover', 'settings'] as GameScreen[]) {
      this.ui.appendChild(this.screens[k]);
    }
    this.ui.append(this.bannerEl, this.countdownEl, this.toastEl, this.badge, this.fpsEl);

    this.measure();
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.measure());
      this.ro.observe(this.ui);
    } else {
      window.addEventListener('resize', () => this.measure());
    }

    // Generic sound hooks for every button.
    this.ui.addEventListener('pointerover', (e) => {
      const t = (e.target as HTMLElement).closest('.ts-btn, .ts-anchor-hit, .ts-badge, .ts-swatch, .ts-toggle, .ts-seg button');
      const from = (e.relatedTarget as HTMLElement | null)?.closest?.('.ts-btn, .ts-anchor-hit, .ts-badge, .ts-swatch, .ts-toggle, .ts-seg button');
      if (t && t !== from) this.hooks.onHover?.();
    });
    this.ui.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('button, .ts-anchor-hit')) this.hooks.onClick?.();
    });

    this.applySettingsVisuals();
    this.setLink({ status: 'idle' });
  }

  // ================================================================ public API

  setHooks(h: UIHooks): void {
    this.hooks = { ...this.hooks, ...h };
  }

  getScreen(): GameScreen | null {
    return this.screen;
  }

  show(screen: GameScreen): void {
    if (screen === 'settings' && this.screen && this.screen !== 'settings') this.settingsReturn = this.screen;
    const prev = this.screen;
    this.screen = screen;
    const hudOn = screen === 'playing' || screen === 'paused' || (screen === 'settings' && (this.settingsReturn === 'paused' || this.settingsReturn === 'playing'));
    for (const k of Object.keys(this.screens) as GameScreen[]) {
      const on = k === screen || (k === 'playing' && hudOn);
      this.screens[k].classList.toggle('is-active', on);
      this.screens[k].setAttribute('aria-hidden', on ? 'false' : 'true');
    }
    this.screens.playing.classList.toggle('dim', screen !== 'playing');
    if (screen !== 'playing') this.cancelCountdown();
    if (screen !== 'gameover') cancelAnimationFrame(this.goAnim);
    if (screen === 'settings') this.settingsSync.forEach((f) => f());
    if (screen === 'playing' && prev !== 'paused' && prev !== 'settings') this.bannerEl.textContent = '';
    this.setPointedEl(null);
    // focus visuals for the phone "select" button
    this.ui.querySelectorAll('.is-focused').forEach((n) => n.classList.remove('is-focused'));
    const p = this.primary[screen];
    if (p) p.classList.add('is-focused');
    this.badge.style.opacity = screen === 'playing' ? '.7' : '';
  }

  setLink(info: LinkInfo, packetRate?: number): void {
    const s = info.status;
    const wasConnected = this.linkStatus === 'connected';
    this.linkStatus = s;
    this.badge.dataset.s = s;
    const tr = info.transport === 'relay' ? 'Relay' : 'WebRTC';
    const badgeLabel: Record<LinkInfo['status'], string> = {
      idle: 'No phone',
      signaling: 'Starting',
      waiting: info.pin ? `PIN ${info.pin}` : 'Waiting for phone',
      connecting: 'Connecting',
      connected: `Phone · ${tr}`,
      disconnected: 'Phone lost',
      error: 'Link error',
    };
    this.badgeText.textContent = badgeLabel[s];
    this.badgeRate.textContent = s === 'connected' && packetRate ? `${Math.round(packetRate)} Hz` : '';
    this.badge.title = info.message ?? (s === 'connected' ? 'Phone connected' : 'Click to pair a phone');

    // pairing card
    if (info.pin) {
      const digits = info.pin.padEnd(6, '·').slice(0, 6).split('');
      this.pinEl.innerHTML = digits.map((d) => `<span>${d}</span>`).join('');
    }
    if (info.joinUrl && info.joinUrl !== this.qrUrl) {
      this.qrUrl = info.joinUrl;
      this.urlEl.textContent = info.joinUrl;
      const url = info.joinUrl;
      QRCode.toString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#1b1410ff', light: '#ffffff00' } })
        .then((svg) => {
          if (url !== this.qrUrl) return;
          this.qrEl.classList.remove('empty');
          this.qrEl.querySelector('.qr-svg')!.innerHTML = svg;
        })
        .catch(() => this.qrEl.classList.add('empty'));
    }
    const txt: Record<LinkInfo['status'], string> = {
      idle: 'Starting up',
      signaling: 'Contacting the game server',
      waiting: 'Waiting for your phone',
      connecting: 'Phone found — connecting',
      connected: `Connected via ${info.transport === 'relay' ? 'relay' : 'WebRTC'}! Get ready`,
      disconnected: 'Phone disconnected — rejoin with the same PIN',
      error: info.message || 'Connection error — check Wi-Fi and reload',
    };
    this.statusEl.dataset.s = s;
    this.statusText.textContent = s === 'error' || s === 'connected' ? txt[s] : txt[s];
    this.statusText.classList.toggle('ts-dots', s !== 'error' && s !== 'connected');
    this.screens.pair.classList.toggle('connected', s === 'connected');
    if (s === 'connected' && !wasConnected && this.screen !== 'pair') this.toast('Phone connected');
    if (s === 'disconnected' && wasConnected) this.toast('Phone disconnected');
  }

  setMenuAnchors(anchors: MenuAnchor[]): void {
    const seen = new Set<string>();
    const { w, h } = this.size;
    for (const a of anchors) {
      seen.add(a.id);
      let ae = this.anchors.get(a.id);
      if (!ae) ae = this.createAnchor(a.id);
      const px = ((a.x + 1) / 2) * w;
      const py = ((1 - a.y) / 2) * h;
      const d = Math.max(20, a.r * h); // diameter = 2 * r * h/2
      ae.root.classList.remove('hide');
      ae.root.style.setProperty('--d', `${d.toFixed(1)}px`);
      ae.root.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
      const hv = clamp(a.hover ?? 0, 0, 1);
      ae.prog.style.strokeDashoffset = (1 - hv).toFixed(3);
      ae.prog.style.opacity = hv > 0 ? '1' : '0';
      ae.root.classList.toggle('hot', hv > 0);
      const isMode = a.id === 'classic' || a.id === 'arcade' || a.id === 'zen';
      const sub = a.sub ?? (isMode ? MODE_SUB[a.id as GameMode] : '');
      const best = isMode ? this.getBest(a.id as GameMode) : 0;
      const key = `${a.label}|${sub}|${best}`;
      if (key !== ae.key) {
        ae.key = key;
        ae.name.textContent = a.label;
        ae.sub.textContent = sub;
        ae.sub.style.display = sub ? '' : 'none';
        ae.best.textContent = best > 0 ? `★ BEST ${fmtInt(best)}` : '';
      }
    }
    for (const [id, ae] of this.anchors) if (!seen.has(id)) ae.root.classList.add('hide');
  }

  updateHud(hs: HudState): void {
    const L = this.lastHud;
    if (hs.mode !== L.mode) {
      L.mode = hs.mode;
      const timed = hs.mode !== 'classic';
      this.timerEl.classList.toggle('hide', !timed);
      this.livesEl.classList.toggle('hide', timed);
      L.lives = -1;
      L.maxLives = -1;
    }
    if (hs.score !== L.score) {
      const up = hs.score > L.score && L.score >= 0;
      L.score = hs.score;
      this.scoreNum.textContent = fmtInt(hs.score);
      if (up) {
        this.scoreNum.animate(
          [{ transform: 'scale(1.28) rotate(-3deg)', color: '#ffcf3d' }, { transform: 'scale(1)', color: '#fff' }],
          { duration: 320, easing: 'cubic-bezier(.34,1.56,.64,1)' },
        );
      }
    }
    this.scoreBest.textContent = `BEST ${fmtInt(Math.max(hs.best, hs.score))}`;

    if (hs.mode === 'classic') {
      const max = hs.maxLives ?? 3;
      const lives = clamp(hs.lives ?? max, 0, max);
      if (max !== L.maxLives) {
        L.maxLives = max;
        this.livesEl.innerHTML = '';
        for (let i = 0; i < max; i++) this.livesEl.appendChild(el('div', 'x', ICONS.cross));
        L.lives = max;
      }
      if (lives !== L.lives) {
        const missed = max - lives;
        // fill from the right-most (largest) mark inward: Fruit-Ninja style
        const xs = Array.from(this.livesEl.children) as HTMLElement[];
        xs.forEach((x, i) => {
          const isLost = i < missed; // smallest (left) mark fills first
          x.classList.toggle('lost', isLost);
        });
        L.lives = lives;
      }
    } else {
      const t = Math.max(0, hs.timeLeft ?? 0);
      const secs = Math.ceil(t);
      const txt = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
      if (txt !== L.time) {
        L.time = txt;
        this.timerText.textContent = txt;
      }
      this.timerEl.classList.toggle('low', t > 0 && t < 10);
    }

    if (hs.multiplier !== L.mult) {
      L.mult = hs.multiplier;
      this.multEl.textContent = `×${hs.multiplier}`;
      this.multEl.classList.toggle('on', hs.multiplier > 1);
    }

    // power-ups
    const active = new Set<PowerUpKind>();
    for (const p of hs.powerUps) {
      active.add(p.kind);
      let c = this.chips.get(p.kind);
      if (!c || c.classList.contains('out')) {
        c?.remove();
        c = el('div', 'ts-chip', `${PU_ICON[p.kind]}<span class="lbl ts-ink">${p.kind}</span>`);
        c.dataset.k = p.kind;
        this.puEl.appendChild(c);
        this.chips.set(p.kind, c);
      }
      c.style.setProperty('--p', clamp(p.remaining, 0, 1).toFixed(3));
    }
    for (const [k, c] of this.chips) {
      if (!active.has(k) && !c.classList.contains('out')) {
        c.classList.add('out');
        this.later(() => {
          c.remove();
          if (this.chips.get(k) === c) this.chips.delete(k);
        }, 320);
      }
    }
  }

  showCountdown(onDone: () => void): void {
    this.cancelCountdown();
    const run = ++this.countdownRun;
    const steps = [3, 2, 1, 0];
    const n = el('div', 'n ts-ink');
    this.countdownEl.appendChild(n);
    let i = 0;
    const step = () => {
      if (run !== this.countdownRun) return;
      if (i >= steps.length) {
        n.remove();
        onDone();
        return;
      }
      const v = steps[i++];
      n.textContent = v === 0 ? 'GO!' : String(v);
      n.classList.toggle('go', v === 0);
      this.hooks.onCountdownTick?.(v);
      n.animate(
        [
          { opacity: 0, transform: 'scale(2.4) rotate(-8deg)' },
          { opacity: 1, transform: 'scale(1) rotate(0)', offset: 0.28 },
          { opacity: 1, transform: 'scale(.94)', offset: 0.75 },
          { opacity: 0, transform: v === 0 ? 'scale(1.6)' : 'scale(.6)' },
        ],
        { duration: v === 0 ? 650 : 760, easing: 'cubic-bezier(.22,.9,.3,1)', fill: 'forwards' },
      );
      this.later(step, v === 0 ? 560 : 760);
    };
    step();
  }

  banner(text: string, kind: BannerKind, ms = 1500): void {
    const b = el('div', `ts-banner ${kind}`);
    const sp = el('span');
    sp.textContent = text;
    b.appendChild(sp);
    // keep at most 2 on screen
    while (this.bannerEl.children.length >= 2) this.bannerEl.firstElementChild!.remove();
    this.bannerEl.appendChild(b);
    this.later(() => {
      b.classList.add('out');
      this.later(() => b.remove(), 360);
    }, ms);
  }

  showGameOver(r: GameOverInfo): void {
    const g = this.go;
    const head = r.reason === 'bomb' ? 'BOOM!' : r.reason === 'time' ? "TIME'S UP" : 'GAME OVER';
    g.head.textContent = head;
    g.head.className = `ts-go-head ts-ink ${r.reason}`;
    g.sub.textContent = `${r.mode} mode${r.reason === 'bomb' ? ' · you hit a bomb' : r.reason === 'lives' ? ' · 3 fruits dropped' : ''}`;
    g.ribbon.classList.remove('on');
    const best = Math.max(r.best, r.isNewBest ? r.score : 0);
    g.best.innerHTML = r.isNewBest ? 'Your best ever!' : `Best <b>${fmtInt(best)}</b>`;
    const s = r.stats;
    const attempts = s.fruitsSliced + s.fruitsMissed;
    const acc = attempts > 0 ? Math.round((s.fruitsSliced / attempts) * 100) : 0;
    const vals = [fmtInt(s.fruitsSliced), s.bestCombo >= 3 ? `×${s.bestCombo}` : "–", fmtInt(s.criticals), `${acc}%`];
    g.stats.forEach((n, i) => (n.textContent = vals[i]));
    g.score.firstChild!.textContent = '0';
    this.show('gameover');
    // count-up
    cancelAnimationFrame(this.goAnim);
    const t0 = performance.now() + 250;
    const dur = clamp(600 + r.score * 2, 700, 1600);
    const tick = (now: number) => {
      const k = clamp((now - t0) / dur, 0, 1);
      const e = 1 - Math.pow(1 - k, 3);
      g.score.firstChild!.textContent = fmtInt(r.score * e);
      if (k < 1) this.goAnim = requestAnimationFrame(tick);
      else {
        g.score.animate([{ transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.34,1.56,.64,1)' });
        if (r.isNewBest) g.ribbon.classList.add('on');
      }
    };
    this.goAnim = requestAnimationFrame(tick);
  }

  getSettings(): Settings {
    return { ...this.settings };
  }

  getBest(mode: GameMode): number {
    return this.bests[mode] ?? 0;
  }

  setBest(mode: GameMode, score: number): void {
    this.bests[mode] = Math.max(0, Math.round(score));
    lsSet(BEST_KEY, this.bests);
    for (const ae of this.anchors.values()) ae.key = ''; // refresh labels
  }

  setFps(fps: number): void {
    this.fpsEl.textContent = `${Math.round(fps)} FPS`;
    this.fpsEl.classList.toggle('warn', fps < 50 && fps >= 30);
    this.fpsEl.classList.toggle('bad', fps < 30);
  }

  toast(text: string): void {
    const t = el('div', 'ts-toast');
    t.textContent = text;
    while (this.toastEl.children.length >= 3) this.toastEl.firstElementChild!.remove();
    this.toastEl.appendChild(t);
    this.later(() => {
      t.classList.add('out');
      this.later(() => t.remove(), 320);
    }, 2400);
  }

  /**
   * Phone pointer → UI. Pass the blade pointer in NDC each frame while a menu-like
   * screen is up; buttons under it get hover styling and pressPrimary() clicks it.
   * Returns true when the pointer is over an interactive UI element.
   */
  setPointer(x: number, y: number, visible = true): boolean {
    if (!visible || !this.screen) {
      this.setPointedEl(null);
      return false;
    }
    const r = this.ui.getBoundingClientRect();
    const px = r.left + ((x + 1) / 2) * r.width;
    const py = r.top + ((1 - y) / 2) * r.height;
    const hit = document.elementFromPoint(px, py) as HTMLElement | null;
    const t = hit?.closest<HTMLElement>('.ts-btn, .ts-swatch, .ts-toggle, .ts-seg button, .ts-badge') ?? null;
    const ok = t && this.ui.contains(t) ? t : null;
    this.setPointedEl(ok);
    return !!ok;
  }

  /** Activate the current screen's primary action (phone 'select'). Returns false if none. */
  pressPrimary(): boolean {
    const scr = this.screen;
    if (!scr) return false;
    let target: HTMLElement | null = this.pointed;
    if (!target) {
      const f = document.activeElement as HTMLElement | null;
      if (f && f !== document.body && this.screens[scr].contains(f) && f.matches('button')) target = f;
    }
    if (!target) target = this.primary[scr] ?? null;
    if (!target) return false;
    target.classList.add('is-pressed');
    this.later(() => target!.classList.remove('is-pressed'), 140);
    target.click();
    return true;
  }

  /** Move keyboard/phone focus between the current screen's buttons. */
  moveFocus(dir: 1 | -1): void {
    const scr = this.screen;
    if (!scr) return;
    const list = Array.from(this.screens[scr].querySelectorAll<HTMLElement>('.ts-btn'));
    if (!list.length) return;
    const cur = list.findIndex((b) => b.classList.contains('is-focused'));
    const next = list[(cur + dir + list.length) % list.length];
    list.forEach((b) => b.classList.remove('is-focused'));
    next.classList.add('is-focused');
    this.primary[scr] = next;
    this.hooks.onHover?.();
  }

  destroy(): void {
    this.ro?.disconnect();
    this.timers.forEach((t) => clearTimeout(t));
    cancelAnimationFrame(this.goAnim);
    this.ui.remove();
  }

  // ================================================================ internals

  private later(fn: () => void, ms: number): void {
    const id = window.setTimeout(() => {
      this.timers.delete(id);
      fn();
    }, ms);
    this.timers.add(id);
  }

  private measure(): void {
    const r = this.ui.getBoundingClientRect();
    this.size = { w: r.width || window.innerWidth, h: r.height || window.innerHeight };
  }

  private setPointedEl(t: HTMLElement | null): void {
    if (t === this.pointed) return;
    this.pointed?.classList.remove('is-pointed');
    this.pointed = t;
    if (t) {
      t.classList.add('is-pointed');
      this.hooks.onHover?.();
    }
  }

  private internalShow(s: GameScreen): void {
    this.show(s);
    this.hooks.onScreenChange?.(s);
  }

  private cancelCountdown(): void {
    this.countdownRun++;
    this.countdownEl.innerHTML = '';
  }

  private btn(label: string, cls: string, icon: string | null, onClick: () => void): HTMLButtonElement {
    const b = el('button', `ts-btn ${cls}`, `${icon ?? ''}${label ? `<span>${label}</span>` : ''}`);
    b.type = 'button';
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
    return b;
  }

  private screenEl(name: GameScreen, cls: string): HTMLDivElement {
    const s = el('div', `ts-screen ${cls}`);
    s.dataset.screen = name;
    s.setAttribute('aria-hidden', 'true');
    return s;
  }

  // ---------------------------------------------------------------- chrome
  private buildChrome(): void {
    this.badge = el('button', 'ts-badge') as HTMLButtonElement;
    this.badge.type = 'button';
    this.badge.innerHTML = `<span class="dot"></span>${ICONS.phone}<span class="txt"></span><span class="rate"></span>`;
    this.badgeText = this.badge.querySelector('.txt')!;
    this.badgeRate = this.badge.querySelector('.rate')!;
    this.badge.addEventListener('click', () => {
      if (this.screen === 'playing') return; // don't yank the player out mid-run
      if (this.screen !== 'pair') this.h.onShowPairing();
    });
    this.bannerEl = el('div', 'ts-banners');
    this.countdownEl = el('div', 'ts-countdown');
    this.toastEl = el('div', 'ts-toasts');
    this.fpsEl = el('div', 'ts-fps', '-- FPS');
  }

  // ------------------------------------------------------------------ pair
  private buildPair(): HTMLDivElement {
    const s = this.screenEl('pair', 'ts-pair');
    s.innerHTML = `<div class="ts-backdrop" style="background:radial-gradient(ellipse at 50% 40%, rgba(27,20,16,.25), rgba(12,8,6,.78))"></div>
      <div class="ts-center">
        <div class="ts-logo">${logoSVG()}</div>
        <div class="ts-card ts-pair-card ts-live">
          <div class="ts-qr-wrap">
            <div class="ts-qr empty"><div class="qr-svg" style="width:100%;height:100%"></div><div class="ts-qr-done">${ICONS.check}</div></div>
            <div class="ts-url">—</div>
          </div>
          <div class="ts-pair-info">
            <div class="ts-pin-label">Game PIN</div>
            <div class="ts-pin"><span>·</span><span>·</span><span>·</span><span>·</span><span>·</span><span>·</span></div>
            <ol class="ts-steps">
              <li><span class="ic">${ICONS.qr}<b>1</b></span><span>Scan the QR with your phone camera <small style="opacity:.6">(or open the link)</small></span></li>
              <li><span class="ic">${ICONS.shield}<b>2</b></span><span>Tap <em>Advanced → Proceed</em> on the warning, then <em>TAP TO START</em></span></li>
              <li><span class="ic">${ICONS.sword}<b>3</b></span><span>Hold your phone like a sword and press <em>Recenter</em></span></li>
            </ol>
            <div class="ts-status" data-s="idle"><span class="sdot"></span><span class="st ts-dots">Starting up</span></div>
          </div>
        </div>
        <div class="ts-pair-alt ts-live"><span>No phone handy?</span></div>
      </div>`;
    this.qrEl = s.querySelector('.ts-qr')!;
    this.urlEl = s.querySelector('.ts-url')!;
    this.pinEl = s.querySelector('.ts-pin')!;
    this.statusEl = s.querySelector('.ts-status')!;
    this.statusText = s.querySelector('.st')!;
    const mouse = this.btn('Play with mouse instead', 'wood small', ICONS.mouse, () => this.h.onPlayWithMouse());
    s.querySelector('.ts-pair-alt')!.appendChild(mouse);
    this.primary.pair = mouse;
    return s;
  }

  // ------------------------------------------------------------------ menu
  private buildMenu(): HTMLDivElement {
    const s = this.screenEl('menu', 'ts-menu');
    s.innerHTML = `<div class="ts-logo-top"><div class="ts-logo">${logoSVG()}</div></div>
      <div class="ts-anchors"></div>
      <div class="ts-hint ts-ink">Slice a fruit to start<small>or click one</small></div>
      <div class="ts-corner left"></div><div class="ts-corner right"></div>`;
    this.anchorLayer = s.querySelector('.ts-anchors')!;
    this.hintEl = s.querySelector('.ts-hint')!;
    s.querySelector('.ts-corner.left')!.appendChild(
      this.btn('Settings', 'wood small', ICONS.gear, () => this.internalShow('settings')),
    );
    s.querySelector('.ts-corner.right')!.appendChild(
      this.btn('Pair phone', 'wood small', ICONS.phone, () => this.h.onShowPairing()),
    );
    return s;
  }

  private createAnchor(id: MenuAnchor['id']): AnchorEl {
    const root = el('div', 'ts-anchor hide');
    root.dataset.id = id;
    root.innerHTML = `<svg class="ts-ring" viewBox="0 0 100 100">
        <circle class="glow" cx="50" cy="50" r="46"/>
        <g class="spin"><circle class="dash" cx="50" cy="50" r="46"/></g>
        <circle class="prog" cx="50" cy="50" r="46" pathLength="1"/>
      </svg>
      <div class="ts-anchor-hit" role="button" tabindex="-1" aria-label="${id}"></div>
      <div class="ts-anchor-label"><div class="name ts-ink"></div><div class="sub"></div><div class="best ts-ink"></div></div>`;
    root.querySelector('.ts-anchor-hit')!.addEventListener('click', () => {
      if (id === 'settings') this.internalShow('settings');
      else if (id === 'pair') this.h.onShowPairing();
      else this.h.onModeSelect(id);
    });
    this.anchorLayer.appendChild(root);
    const ae: AnchorEl = {
      root,
      prog: root.querySelector('.prog')!,
      name: root.querySelector('.name')!,
      sub: root.querySelector('.sub')!,
      best: root.querySelector('.best')!,
      key: '',
    };
    this.anchors.set(id, ae);
    return ae;
  }

  // ------------------------------------------------------------------- hud
  private buildHud(): HTMLDivElement {
    const s = this.screenEl('playing', 'ts-hud');
    s.innerHTML = `<div class="ts-score">
        <div class="fruit">${ICONS.melon}</div><div class="num ts-ink">0</div>
        <div class="best ts-ink">BEST 0</div>
        <div class="ts-mult ts-ink">×2</div>
      </div>
      <div class="ts-timer ts-ink hide"><span class="tt">1:00</span></div>
      <div class="ts-powerups"></div>
      <div class="ts-top-right"><div class="ts-lives"></div></div>`;
    this.scoreNum = s.querySelector('.ts-score .num')!;
    this.scoreBest = s.querySelector('.ts-score .best')!;
    this.multEl = s.querySelector('.ts-mult')!;
    this.timerEl = s.querySelector('.ts-timer')!;
    this.timerText = s.querySelector('.ts-timer .tt')!;
    this.puEl = s.querySelector('.ts-powerups')!;
    this.livesEl = s.querySelector('.ts-lives')!;
    const pause = this.btn('', 'cream icon ts-pause-btn', ICONS.pause, () => {
      if (this.screen === 'playing') this.h.onPause();
    });
    pause.setAttribute('aria-label', 'Pause');
    s.querySelector('.ts-top-right')!.appendChild(pause);
    return s;
  }

  // ---------------------------------------------------------------- paused
  private buildPaused(): HTMLDivElement {
    const s = this.screenEl('paused', 'ts-paused');
    s.innerHTML = `<div class="ts-backdrop"></div><div class="ts-center"><div class="ts-card ts-pause-card"><div class="ts-plank">PAUSED</div></div></div>`;
    const card = s.querySelector('.ts-pause-card')!;
    const resume = this.btn('Resume', 'green big', ICONS.play, () => this.h.onResume());
    const row1 = el('div', 'row');
    row1.append(
      this.btn('Restart', 'cream', ICONS.restart, () => this.h.onRestart()),
      this.btn('Settings', 'cream', ICONS.gear, () => this.internalShow('settings')),
    );
    const recenter = this.btn('Recenter phone', 'wood', ICONS.target, () => {
      this.h.onCalibrate();
      this.toast('Phone recentered');
    });
    const quit = this.btn('Quit to menu', 'red', ICONS.home, () => this.h.onQuit());
    card.append(resume, row1, recenter, quit);
    this.primary.paused = resume;
    return s;
  }

  // -------------------------------------------------------------- settings
  private buildSettings(): HTMLDivElement {
    const s = this.screenEl('settings', 'ts-settings');
    s.innerHTML = `<div class="ts-backdrop"></div><div class="ts-center"><div class="ts-card ts-settings-card">
      <div class="ts-plank">SETTINGS</div>
      <div class="ts-set-grid"><div class="ts-set-col a"></div><div class="ts-set-col b"></div></div>
      <div class="ts-set-foot"></div></div></div>`;
    const colA = s.querySelector('.ts-set-col.a')!;
    const colB = s.querySelector('.ts-set-col.b')!;

    const head = (t: string) => el('div', 'ts-set-h', t);
    const slider = (label: string, key: 'masterVolume' | 'sfxVolume' | 'musicVolume' | 'sensitivity', min: number, max: number, step: number, fmt: (v: number) => string) => {
      const f = el('label', 'ts-field');
      f.innerHTML = `<span class="lab"><span>${label}</span><span class="val"></span></span>`;
      const inp = el('input', 'ts-range');
      inp.type = 'range';
      inp.min = String(min);
      inp.max = String(max);
      inp.step = String(step);
      const val = f.querySelector('.val')!;
      const paint = () => {
        const v = Number(inp.value);
        val.textContent = fmt(v);
        inp.style.setProperty('--p', `${((v - min) / (max - min)) * 100}%`);
      };
      inp.addEventListener('input', () => {
        paint();
        this.patchSettings({ [key]: Number(inp.value) } as Partial<Settings>);
      });
      this.settingsSync.push(() => {
        inp.value = String(this.settings[key]);
        paint();
      });
      f.appendChild(inp);
      return f;
    };
    const toggle = (label: string, key: 'screenShake' | 'haptics' | 'showFps') => {
      const b = el('button', 'ts-toggle', `<span>${label}</span><span class="sw"></span>`);
      b.type = 'button';
      b.setAttribute('role', 'switch');
      b.addEventListener('click', () => {
        this.patchSettings({ [key]: !this.settings[key] } as Partial<Settings>);
        b.setAttribute('aria-checked', String(this.settings[key]));
      });
      this.settingsSync.push(() => b.setAttribute('aria-checked', String(this.settings[key])));
      return b;
    };
    const pct = (v: number) => `${Math.round(v * 100)}%`;

    colA.append(
      head('Sound'),
      slider('Master volume', 'masterVolume', 0, 1, 0.01, pct),
      slider('Effects', 'sfxVolume', 0, 1, 0.01, pct),
      slider('Music', 'musicVolume', 0, 1, 0.01, pct),
      head('Phone sword'),
      slider('Sensitivity', 'sensitivity', 0.5, 2, 0.05, (v) => `${v.toFixed(2)}×`),
      toggle('Phone haptics', 'haptics'),
    );

    // quality segmented
    const qf = el('div', 'ts-field');
    qf.innerHTML = `<span class="lab"><span>Graphics quality</span></span>`;
    const seg = el('div', 'ts-seg');
    const qBtns = (['low', 'high'] as const).map((q) => {
      const b = el('button', '', q === 'low' ? 'Fast' : 'Pretty');
      b.type = 'button';
      b.addEventListener('click', () => {
        this.patchSettings({ quality: q });
        qBtns.forEach((x, i) => x.classList.toggle('on', (['low', 'high'] as const)[i] === q));
      });
      seg.appendChild(b);
      return b;
    });
    this.settingsSync.push(() => qBtns.forEach((x, i) => x.classList.toggle('on', (['low', 'high'] as const)[i] === this.settings.quality)));
    qf.appendChild(seg);

    // blade colours
    const cf = el('div', 'ts-field');
    cf.innerHTML = `<span class="lab"><span>Blade colour</span></span>`;
    const sw = el('div', 'ts-swatches');
    const swatches = BLADE_COLORS.map((c) => {
      const b = el('button', 'ts-swatch');
      b.type = 'button';
      b.style.setProperty('--sw', c);
      b.setAttribute('aria-label', `Blade colour ${c}`);
      b.addEventListener('click', () => {
        this.patchSettings({ bladeColor: c });
        swatches.forEach((x) => x.classList.toggle('on', x === b));
      });
      sw.appendChild(b);
      return b;
    });
    this.settingsSync.push(() =>
      swatches.forEach((x, i) => x.classList.toggle('on', BLADE_COLORS[i].toLowerCase() === this.settings.bladeColor.toLowerCase())),
    );
    cf.appendChild(sw);

    colB.append(head('Display'), toggle('Screen shake', 'screenShake'), toggle('Show FPS', 'showFps'), qf, cf);

    const foot = s.querySelector('.ts-set-foot')!;
    const back = this.btn('Back', 'big', ICONS.back, () => this.internalShow(this.settingsReturn));
    foot.append(
      this.btn('Recenter phone', 'wood', ICONS.target, () => {
        this.h.onCalibrate();
        this.toast('Phone recentered');
      }),
      back,
    );
    this.primary.settings = back;
    this.settingsSync.forEach((f) => f());
    return s;
  }

  // -------------------------------------------------------------- gameover
  private buildGameOver(): HTMLDivElement {
    const s = this.screenEl('gameover', 'ts-gameover');
    s.innerHTML = `<div class="ts-backdrop"></div><div class="ts-center"><div class="ts-card ts-go-card">
      <div class="ts-go-head ts-ink">GAME OVER</div>
      <div class="ts-go-sub">classic</div>
      <div class="ts-go-score">0<span class="ts-ribbon">NEW BEST!</span></div>
      <div class="ts-go-best"></div>
      <div class="ts-stats">
        <div class="ts-stat"><div class="v">0</div><div class="k">Sliced</div></div>
        <div class="ts-stat"><div class="v">0</div><div class="k">Best combo</div></div>
        <div class="ts-stat"><div class="v">0</div><div class="k">Criticals</div></div>
        <div class="ts-stat"><div class="v">0</div><div class="k">Accuracy</div></div>
      </div>
      <div class="ts-go-btns"></div></div></div>`;
    this.go = {
      head: s.querySelector('.ts-go-head')!,
      sub: s.querySelector('.ts-go-sub')!,
      score: s.querySelector('.ts-go-score')!,
      ribbon: s.querySelector('.ts-ribbon')!,
      best: s.querySelector('.ts-go-best')!,
      stats: Array.from(s.querySelectorAll<HTMLElement>('.ts-stat .v')),
    };
    const again = this.btn('Play again', 'big', ICONS.restart, () => this.h.onRestart());
    s.querySelector('.ts-go-btns')!.append(again, this.btn('Menu', 'wood big', ICONS.home, () => this.h.onQuit()));
    this.primary.gameover = again;
    return s;
  }

  // -------------------------------------------------------------- settings
  private loadSettings(): Settings {
    const raw = lsGet<Partial<Settings>>(SETTINGS_KEY) ?? {};
    const d = DEFAULT_SETTINGS;
    const num = (v: unknown, def: number, a: number, b: number) => (typeof v === 'number' && isFinite(v) ? clamp(v, a, b) : def);
    const bool = (v: unknown, def: boolean) => (typeof v === 'boolean' ? v : def);
    return {
      masterVolume: num(raw.masterVolume, d.masterVolume, 0, 1),
      sfxVolume: num(raw.sfxVolume, d.sfxVolume, 0, 1),
      musicVolume: num(raw.musicVolume, d.musicVolume, 0, 1),
      sensitivity: num(raw.sensitivity, d.sensitivity, 0.5, 2),
      bladeColor: typeof raw.bladeColor === 'string' && /^#[0-9a-f]{3,8}$/i.test(raw.bladeColor) ? raw.bladeColor : d.bladeColor,
      screenShake: bool(raw.screenShake, d.screenShake),
      haptics: bool(raw.haptics, d.haptics),
      quality: raw.quality === 'low' || raw.quality === 'high' ? raw.quality : d.quality,
      showFps: bool(raw.showFps, d.showFps),
    };
  }

  private patchSettings(p: Partial<Settings>): void {
    this.settings = { ...this.settings, ...p };
    lsSet(SETTINGS_KEY, this.settings);
    this.applySettingsVisuals();
    this.h.onSettingsChange(this.getSettings());
  }

  private applySettingsVisuals(): void {
    this.fpsEl.classList.toggle('on', this.settings.showFps);
  }
}
