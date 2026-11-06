/**
 * SPINSHOT DOM overlay UI: menus, pairing, calibration, settings, stats, results and the HUD.
 * Lives in `#ui` above the full-screen WebGL canvas. The root never captures pointer events;
 * only the active menu screen (and HUD buttons) do.
 */
import { toString as qrToString } from 'qrcode';
import type {
  CareerStats,
  Difficulty,
  GameMode,
  LinkStatus,
  LinkTransport,
  PaddleState,
  Settings,
  Side,
} from '../core/contracts';
import { CALIBRATE_ART, HOWTO_ART } from './art';
import { clamp, clear, h, reducedMotion, replay } from './dom';
import { Hud } from './hud';
import { icon, type IconName } from './icons';
import { logoMarkSvg, logoSvg } from './logo';
import { Nav, type Dir, type NavSound } from './nav';

export type Screen =
  | 'title'
  | 'main'
  | 'play-setup'
  | 'challenges'
  | 'pair'
  | 'versus-pair'
  | 'calibrate'
  | 'settings'
  | 'stats'
  | 'howto'
  | 'pause'
  | 'result'
  | 'none';

export interface StartConfig {
  mode: GameMode;
  difficulty: Difficulty;
  gamesToWin: 1 | 2 | 3;
  challengeId?: string;
}
export interface ChallengeDef {
  id: string;
  name: string;
  description: string;
  goal: string;
}
export interface ResultData {
  title: string;
  won: boolean;
  mode: GameMode;
  games: Array<Record<Side, number>>;
  stats: { label: string; value: string }[];
  newRecords: string[];
}

type MenuScreen = Exclude<Screen, 'none'>;

const DIFFS: { id: Difficulty; name: string; stars: number; desc: string; opp: string }[] = [
  { id: 'rookie', name: 'Rookie', stars: 1, desc: 'Gentle rallies, slow balls and plenty of forgiveness.', opp: 'Pip' },
  { id: 'club', name: 'Club', stars: 2, desc: 'A steady all-rounder who keeps the ball in play.', opp: 'Max' },
  { id: 'pro', name: 'Pro', stars: 3, desc: 'Fast, spinny, and punishes every loose ball.', opp: 'Rina' },
  { id: 'legend', name: 'Legend', stars: 4, desc: 'Reads everything. Bring your very best strokes.', opp: 'Kaz' },
];

const STATUS_TEXT: Record<LinkStatus, string> = {
  idle: 'Starting…',
  connecting: 'Connecting to game server…',
  waiting: 'Waiting for your phone…',
  pairing: 'Phone found — linking up…',
  connected: 'Phone connected',
  disconnected: 'Phone disconnected',
  error: 'Connection problem',
};

const TRANSITION_MS = 240;

export class UI {
  // ───────────── callbacks (assigned by main) ─────────────
  onStart: (cfg: StartConfig) => void = () => {};
  onSettings: (s: Settings) => void = () => {};
  onResume: () => void = () => {};
  onQuit: () => void = () => {};
  onRestart: () => void = () => {};
  onRecenter: () => void = () => {};
  onPair: () => void = () => {};
  /** Fired when the user opens the 'versus-pair' screen (main starts both links). */
  onVersusPair: () => void = () => {};
  onUseMouse: () => void = () => {};
  onResetStats: () => void = () => {};
  /** Addition: navigation/UI sounds — wire to Sfx.ui(kind). */
  onSound: (kind: NavSound) => void = () => {};
  /** Addition: user pressed "Continue" on the calibrate screen. */
  onCalibrateDone: () => void = () => {};
  /** Addition: HUD pause button pressed (touch/mouse players). */
  onPause: () => void = () => {};
  /** Addition: fired after every screen change. */
  onScreen: (s: Screen) => void = () => {};

  readonly hud: Hud;

  private _screen: Screen = 'none';
  private root: HTMLElement;
  private layer: HTMLDivElement;
  private screens = {} as Record<MenuScreen, HTMLElement>;
  private nav: Nav;
  private cursorEl: HTMLDivElement;
  private cursorVisible = false;
  private toastsEl: HTMLDivElement;
  private modal: HTMLElement | null = null;
  private returnTo: Partial<Record<Screen, Screen>> = {};
  private leaveTimers = new Map<HTMLElement, number>();

  private settings: Settings;
  private stats: CareerStats;
  private challenges: ChallengeDef[];
  private lastStart: StartConfig | null = null;
  private controller: { kind: 'phone' | 'mouse' | 'none'; status: LinkStatus } = { kind: 'none', status: 'idle' };

  // dynamic bits
  private badges: HTMLElement[] = [];
  private playSub!: HTMLElement;
  private setupCards = new Map<Difficulty, HTMLElement>();
  private setupLen!: HTMLElement;
  private setupSel: { difficulty: Difficulty; gamesToWin: 1 | 2 | 3 };
  private challengeGrid!: HTMLElement;
  private statsGrid!: HTMLElement;
  private settingsBody!: HTMLElement;
  private settingsTabs!: HTMLElement;
  private settingsTab: 'gameplay' | 'audio' | 'graphics' = 'gameplay';
  private versus!: {
    cards: Record<1 | 2, { qr: HTMLElement; qrCard: HTMLElement; url: HTMLElement; pin: HTMLElement; chip: HTMLElement; chipText: HTMLElement; detail: HTMLElement; lastUrl: string; lastPin: string }>;
    status: Record<1 | 2, LinkStatus>;
    len: HTMLElement;
    gamesToWin: 1 | 2 | 3;
    start: HTMLButtonElement;
  };
  private pair!: {
    qr: HTMLElement;
    qrCard: HTMLElement;
    url: HTMLElement;
    pin: HTMLElement;
    chip: HTMLElement;
    chipText: HTMLElement;
    detail: HTMLElement;
    cont: HTMLButtonElement;
    lastUrl: string;
    lastPin: string;
  };
  private cal!: {
    paddle: HTMLElement;
    ring: SVGCircleElement;
    pct: HTMLElement;
    status: HTMLElement;
    cont: HTMLButtonElement;
    stage: HTMLElement;
    done: boolean;
  };
  private resultEl!: HTMLElement;

  constructor(root: HTMLElement, settings: Settings, stats: CareerStats, challenges: ChallengeDef[]) {
    this.root = root;
    this.settings = { ...settings };
    this.stats = stats;
    this.challenges = challenges;
    this.setupSel = { difficulty: settings.difficulty, gamesToWin: settings.gamesToWin };
    this.nav = new Nav((k) => this.onSound(k));

    root.classList.add('ui-root');
    root.dataset.screen = 'none';
    clear(root);

    this.hud = new Hud(() => this.lastStart?.gamesToWin ?? this.settings.gamesToWin);
    this.hud.onPause = () => {
      this.onSound('select');
      this.onPause();
    };

    this.layer = h('div', { class: 'screens' });
    this.cursorEl = h('div', { class: 'air-cursor' });
    this.toastsEl = h('div', { class: 'toasts', 'aria-live': 'polite' });
    root.append(h('div', { class: 'backdrop' }), this.hud.el, this.layer, this.toastsEl, this.cursorEl);

    this.screens.title = this.buildTitle();
    this.screens.main = this.buildMain();
    this.screens['play-setup'] = this.buildSetup();
    this.screens.challenges = this.buildChallenges();
    this.screens.pair = this.buildPair();
    this.screens['versus-pair'] = this.buildVersusPair();
    this.screens.calibrate = this.buildCalibrate();
    this.screens.settings = this.buildSettings();
    this.screens.stats = this.buildStats();
    this.screens.howto = this.buildHowto();
    this.screens.pause = this.buildPause();
    this.screens.result = this.buildResult();
    for (const [name, el] of Object.entries(this.screens)) {
      el.classList.add('screen', `scr-${name}`);
      el.hidden = true;
      this.layer.append(el);
    }

    // Mouse/touch: hover moves the focus ring, trusted clicks make a sound.
    this.layer.addEventListener('pointerover', (e) => {
      if ((e as PointerEvent).pointerType !== 'mouse') return;
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-nav]');
      if (t && this.nav.scope?.contains(t) && this.nav.focused !== t) {
        this.nav.focus(t, { scroll: false });
        this.onSound('move');
      }
    });
    this.layer.addEventListener('click', (e) => {
      if (!e.isTrusted) return;
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-nav], [data-value]');
      if (!t) return;
      if (t.dataset.nav === 'slider' || t.dataset.nav === 'text') return;
      this.onSound((t.dataset.sound as NavSound) ?? 'select');
    });

    this.refreshBadges();
    this.renderChallenges();
    this.renderStats();
  }

  // ═════════════════════════════ public API ═════════════════════════════
  get screen(): Screen {
    return this._screen;
  }

  /** Addition: true while a text field in the UI has keyboard focus (main should not forward keys). */
  get typing(): boolean {
    const a = document.activeElement;
    return !!a && a instanceof HTMLInputElement && a.type === 'text' && this.root.contains(a);
  }

  show(screen: Screen): void {
    const prev = this._screen;
    if (prev === screen) return;
    this.closeModal();
    if (this.typing) (document.activeElement as HTMLElement).blur();
    if (screen === 'settings' || screen === 'pair' || screen === 'versus-pair' || screen === 'calibrate' || screen === 'howto') {
      if (prev !== 'none' && prev !== screen) this.returnTo[screen] = prev;
    }
    this._screen = screen;
    this.root.dataset.screen = screen;

    // refresh dynamic content before showing
    if (screen === 'stats') this.renderStats();
    if (screen === 'challenges') this.renderChallenges();
    if (screen === 'settings') this.renderSettings();
    if (screen === 'play-setup') this.syncSetup();
    if (screen === 'main') this.syncMain();
    if (screen === 'versus-pair') this.syncVersus(true);

    const outgoing = prev !== 'none' ? this.screens[prev] : null;
    const incoming = screen !== 'none' ? this.screens[screen] : null;
    const rm = reducedMotion();
    if (outgoing) {
      outgoing.classList.remove('active', 'enter');
      outgoing.classList.add('leave');
      const t = window.setTimeout(
        () => {
          outgoing.hidden = true;
          outgoing.classList.remove('leave');
          this.leaveTimers.delete(outgoing);
        },
        rm ? 0 : TRANSITION_MS,
      );
      this.leaveTimers.set(outgoing, t);
    }
    if (incoming) {
      const pending = this.leaveTimers.get(incoming);
      if (pending) {
        clearTimeout(pending);
        this.leaveTimers.delete(incoming);
      }
      incoming.hidden = false;
      incoming.classList.remove('leave');
      incoming.scrollTop = 0;
      replay(incoming, 'enter');
      incoming.classList.add('active');
      this.nav.setScope(incoming);
    } else {
      this.nav.setScope(null);
      this.pointer(0, 0, false);
    }
    this.onScreen(screen);
  }

  setStats(stats: CareerStats): void {
    this.stats = stats;
    this.renderStats();
    this.renderChallenges();
  }

  /** Addition: sync settings changed outside the UI (e.g. loaded later). Does not fire onSettings. */
  setSettings(s: Settings): void {
    this.settings = { ...s };
    this.setupSel = { difficulty: s.difficulty, gamesToWin: s.gamesToWin };
    if (this._screen === 'settings') this.renderSettings();
    this.syncSetup();
    this.syncMain();
  }

  setPairing(info: { pin: string; url: string; status: LinkStatus; transport: LinkTransport; detail?: string }): void {
    const p = this.pair;
    if (info.url !== p.lastUrl) {
      p.lastUrl = info.url;
      p.url.textContent = info.url ? info.url.replace(/^https?:\/\//, '') : '';
      if (!info.url) {
        p.qr.innerHTML = '<div class="qr-wait"><span class="spinner"></span></div>';
      } else {
        this.drawQr(p.qr, info.url, () => this.pair.lastUrl === info.url);
      }
    }
    if (info.pin !== p.lastPin) {
      p.lastPin = info.pin;
      clear(p.pin);
      const digits = (info.pin || '------').padEnd(6, '-').slice(0, 6).split('');
      digits.forEach((d, i) => {
        if (i === 3) p.pin.append(h('span', { class: 'pin-gap' }));
        p.pin.append(h('span', { class: `pin-d ${d === '-' ? 'empty' : ''}`, style: { animationDelay: `${i * 40}ms` } }, d === '-' ? '' : d));
      });
      if (info.pin) replay(p.pin, 'show');
    }
    const st = info.status;
    let text = STATUS_TEXT[st];
    if (st === 'connected') text += info.transport === 'webrtc' ? ' · WebRTC' : info.transport === 'relay' ? ' · Relay' : '';
    p.chip.className = `chip status-chip st-${st}`;
    p.chipText.textContent = text;
    p.detail.textContent = info.detail ?? '';
    p.detail.hidden = !info.detail;
    p.qrCard.classList.toggle('linked', st === 'connected');
    p.cont.hidden = st !== 'connected';
    if (st === 'connected' && this._screen === 'pair' && this.nav.focused !== p.cont) this.nav.focus(p.cont);
  }

  /** Render a QR code for `url` into `target` (shared by the pair and versus-pair screens). */
  private drawQr(target: HTMLElement, url: string, current: () => boolean): void {
    qrToString(url, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 0,
      color: { dark: '#1d2333', light: '#ffffff00' },
    })
      .then((svg) => {
        if (!current()) return;
        target.innerHTML = svg + `<div class="qr-logo">${logoMarkSvg(40, 'qr')}</div>`;
      })
      .catch(() => {
        target.innerHTML = '<div class="qr-wait">QR unavailable</div>';
      });
  }

  setVersusPairing(slot: 1 | 2, info: { pin: string; url: string; status: LinkStatus; transport: LinkTransport; detail?: string }): void {
    const v = this.versus;
    const c = v.cards[slot];
    if (info.url !== c.lastUrl) {
      c.lastUrl = info.url;
      c.url.textContent = info.url ? info.url.replace(/^https?:\/\//, '') : '';
      if (!info.url) {
        c.qr.innerHTML = '<div class="qr-wait"><span class="spinner"></span></div>';
      } else {
        this.drawQr(c.qr, info.url, () => c.lastUrl === info.url);
      }
    }
    if (info.pin !== c.lastPin) {
      c.lastPin = info.pin;
      clear(c.pin);
      const digits = (info.pin || '------').padEnd(6, '-').slice(0, 6).split('');
      digits.forEach((d, i) => {
        if (i === 3) c.pin.append(h('span', { class: 'pin-gap' }));
        c.pin.append(h('span', { class: `pin-d ${d === '-' ? 'empty' : ''}`, style: { animationDelay: `${i * 40}ms` } }, d === '-' ? '' : d));
      });
      if (info.pin) replay(c.pin, 'show');
    }
    const st = info.status;
    let text = STATUS_TEXT[st];
    if (st === 'connected') text += info.transport === 'webrtc' ? ' · WebRTC' : info.transport === 'relay' ? ' · Relay' : '';
    c.chip.className = `chip status-chip st-${st}`;
    c.chipText.textContent = text;
    c.detail.textContent = info.detail ?? '';
    c.detail.hidden = !info.detail;
    c.qrCard.classList.toggle('linked', st === 'connected');
    v.status[slot] = st;
    this.syncVersus(false);
  }

  setCalibration(progress: number, paddle: PaddleState): void {
    const c = this.cal;
    const pr = clamp(progress, 0, 1);
    const circ = 2 * Math.PI * 88;
    c.ring.style.strokeDashoffset = String(circ * (1 - pr));
    c.pct.textContent = `${Math.round(pr * 100)}%`;
    const done = pr >= 1;
    if (done !== c.done) {
      c.done = done;
      c.stage.classList.toggle('done', done);
      c.status.textContent = done ? 'Calibrated!' : 'Hold still…';
      c.cont.classList.toggle('primary', done);
      c.cont.classList.toggle('secondary', !done);
      if (done) {
        replay(c.status, 'pop');
        if (this._screen === 'calibrate') this.nav.focus(c.cont);
      }
    }
    const yaw = clamp(paddle.aimX, -1, 1) * 42 + (paddle.backhand ? 180 : 0);
    const pitch = clamp(paddle.aimY, -1, 1) * 32 - (paddle.face * 180) / Math.PI;
    const roll = clamp(paddle.aimX, -1, 1) * -8;
    c.paddle.style.transform = `rotateY(${yaw.toFixed(1)}deg) rotateX(${pitch.toFixed(1)}deg) rotateZ(${roll.toFixed(1)}deg)`;
    c.stage.classList.toggle('disconnected', !paddle.connected);
    c.stage.style.setProperty('--swing', clamp(paddle.swing, 0, 1).toFixed(2));
  }

  setController(kind: 'phone' | 'mouse' | 'none', status: LinkStatus): void {
    this.controller = { kind, status };
    this.hud.setControllerKind(kind);
    this.refreshBadges();
  }

  showResult(r: ResultData): void {
    this.renderResult(r);
    this.show('result');
  }

  navigate(dir: Dir): void {
    if (this._screen === 'none') return;
    if (this._screen === 'title') return;
    if (this.typing) return;
    this.nav.move(dir);
  }

  activate(): void {
    if (this._screen === 'none') return;
    if (this._screen === 'title') {
      this.onSound('select');
      this.show('main');
      return;
    }
    if (this.typing) {
      (document.activeElement as HTMLElement).blur();
      return;
    }
    const target = this.cursorVisible && this.nav.hovered ? this.nav.hovered : this.nav.focused;
    if (target) {
      const kind = target.dataset.nav ?? '';
      if (kind !== 'slider') this.onSound((target.dataset.sound as NavSound) ?? 'select');
      target.classList.add('pressed');
      window.setTimeout(() => target.classList.remove('pressed'), 140);
    }
    this.nav.activate(this.cursorVisible);
  }

  back(): void {
    if (this.modal) {
      this.onSound('back');
      this.closeModal();
      return;
    }
    if (this.typing) {
      (document.activeElement as HTMLElement).blur();
      return;
    }
    const s = this._screen;
    switch (s) {
      case 'none':
      case 'title':
        return;
      case 'main':
        this.onSound('back');
        this.show('title');
        return;
      case 'pause':
        this.onSound('back');
        this.onResume();
        return;
      case 'result':
        this.onSound('back');
        this.onQuit();
        return;
      default:
        this.onSound('back');
        this.show(this.returnTo[s] ?? 'main');
    }
  }

  pointer(x: number, y: number, visible: boolean): void {
    const vis = visible && this._screen !== 'none';
    this.cursorVisible = vis;
    this.cursorEl.classList.toggle('on', vis);
    if (!vis) {
      this.nav.setHover(null);
      return;
    }
    const px = clamp(x, 0, 1) * window.innerWidth;
    const py = clamp(y, 0, 1) * window.innerHeight;
    this.cursorEl.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
    const hit = document.elementFromPoint(px, py) as HTMLElement | null;
    const t = hit?.closest<HTMLElement>('[data-nav]') ?? null;
    const target = t && this.nav.scope?.contains(t) ? t : null;
    this.nav.setHover(target);
    this.cursorEl.classList.toggle('over', !!target);
    if (target && this.nav.focused !== target) {
      this.nav.focus(target, { scroll: false });
      this.onSound('move');
    }
  }

  toast(text: string): void {
    const t = h('div', { class: 'toast' }, text);
    this.toastsEl.append(t);
    while (this.toastsEl.childElementCount > 3) this.toastsEl.firstElementChild?.remove();
    window.setTimeout(() => {
      t.classList.add('out');
      window.setTimeout(() => t.remove(), 320);
    }, 2600);
  }

  // ═════════════════════════════ builders ═════════════════════════════
  private btn(
    label: string,
    opts: { icon?: IconName; variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'; onClick: () => void; sound?: NavSound; autofocus?: boolean; cls?: string; sub?: string },
  ): HTMLButtonElement {
    return h(
      'button',
      {
        class: `btn ${opts.variant ?? 'secondary'} ${opts.cls ?? ''}`,
        type: 'button',
        'data-nav': '',
        'data-sound': opts.sound,
        'data-autofocus': opts.autofocus,
        onclick: opts.onClick,
      },
      opts.icon ? icon(opts.icon) : null,
      h('span', { class: 'btn-label' }, label, opts.sub ? h('small', null, opts.sub) : null),
    );
  }

  private head(title: string, extra?: HTMLElement): HTMLElement {
    return h(
      'header',
      { class: 'scr-head' },
      h(
        'button',
        { class: 'icon-btn back-btn', type: 'button', 'data-nav': '', 'data-sound': 'back', 'aria-label': 'Back', onclick: () => this.goBackFromButton() },
        icon('back'),
      ),
      h('h2', null, title),
      h('div', { class: 'head-extra' }, extra ?? null),
    );
  }

  private goBackFromButton(): void {
    const s = this._screen;
    if (s === 'pause' || s === 'result' || s === 'main' || s === 'title' || s === 'none') return this.back();
    this.show(this.returnTo[s] ?? 'main');
  }

  private hints(): HTMLElement {
    const k = (t: string) => h('kbd', null, t);
    return h(
      'footer',
      { class: 'hints' },
      h('span', null, k('↑'), k('↓'), k('←'), k('→'), ' Move'),
      h('span', null, k('Enter'), ' Select'),
      h('span', null, k('Esc'), ' Back'),
    );
  }

  private badge(): HTMLElement {
    const b = h('button', {
      class: 'chip ctrl-badge',
      type: 'button',
      'data-nav': '',
      onclick: () => this.openPair(),
    });
    this.badges.push(b);
    return b;
  }

  private refreshBadges(): void {
    const { kind, status } = this.controller;
    for (const b of this.badges) {
      clear(b);
      let st: string;
      let text: string;
      let ic: IconName;
      if (kind === 'phone' && status === 'connected') {
        st = 'connected';
        text = 'Phone connected';
        ic = 'phone';
      } else if (kind === 'phone') {
        st = status === 'disconnected' || status === 'error' ? 'error' : 'waiting';
        text = status === 'disconnected' ? 'Phone disconnected' : status === 'error' ? 'Phone error' : 'Phone linking…';
        ic = 'phone';
      } else if (kind === 'mouse') {
        st = 'mouse';
        text = 'Mouse';
        ic = 'mouse';
      } else {
        st = 'idle';
        text = 'Connect phone';
        ic = 'qr';
      }
      b.className = `chip ctrl-badge st-${st} ${b.classList.contains('nav-focus') ? 'nav-focus' : ''}`;
      b.append(h('span', { class: 'status-dot' }), icon(ic), h('span', null, text));
    }
  }

  private openVersusPair(): void {
    this.show('versus-pair');
    this.onVersusPair();
  }

  private openPair(): void {
    this.show('pair');
    this.onPair();
  }

  // ─── title ───
  private buildTitle(): HTMLElement {
    const el = h(
      'section',
      { onclick: () => this.activate() },
      h(
        'div',
        { class: 'title-wrap' },
        h('div', { class: 'title-logo', html: logoSvg({ stacked: true, tagline: true }) }),
        h(
          'div',
          { class: 'bouncer', 'aria-hidden': 'true' },
          h('div', { class: 'bouncer-ball' }),
          h('div', { class: 'bouncer-shadow' }),
        ),
        h('div', { class: 'press', 'data-nav': '', 'data-autofocus': true }, 'Press any key or tap to start'),
      ),
      h('div', { class: 'title-foot' }, icon('phone'), 'Best played with your phone as the paddle'),
    );
    return el;
  }

  // ─── main ───
  private buildMain(): HTMLElement {
    const tile = (label: string, ic: IconName, sub: string, color: string, onClick: () => void) =>
      h(
        'button',
        { class: 'tile', type: 'button', 'data-nav': '', style: { '--c': color }, onclick: onClick },
        h('span', { class: 'tile-ico' }, icon(ic)),
        h('span', { class: 'tile-text' }, h('b', null, label), h('small', null, sub)),
      );
    this.playSub = h('small');
    const play = h(
      'button',
      { class: 'play-btn', type: 'button', 'data-nav': '', 'data-autofocus': true, onclick: () => this.show('play-setup') },
      h('span', { class: 'play-ico' }, icon('play')),
      h('span', { class: 'tile-text' }, h('b', null, 'Play Match'), this.playSub),
      h('span', { class: 'play-arrow' }, icon('arrowRight')),
    );
    return h(
      'section',
      null,
      h('div', { class: 'topbar' }, h('div'), this.badge()),
      h(
        'div',
        { class: 'main-wrap' },
        h('div', { class: 'main-brand', html: logoSvg({ stacked: true, tagline: true }) }),
        h(
          'nav',
          { class: 'main-menu' },
          play,
          h(
            'div',
            { class: 'tiles' },
            tile('2 Players', 'versus', 'Split screen · 2 phones', 'var(--accent)', () => this.openVersusPair()),
            tile('Learn to Play', 'target', '1-minute guided rally, then practice', 'var(--accent2)', () =>
              this.start({ mode: 'practice', difficulty: this.settings.difficulty, gamesToWin: this.settings.gamesToWin }),
            ),
            tile('Challenges', 'trophy', 'Targets & drills', 'var(--gold)', () => this.show('challenges')),
            tile('Connect Phone', 'phone', 'Your phone is the paddle', 'var(--accent)', () => this.openPair()),
            tile('Settings', 'sliders', 'Controls, audio, graphics', 'var(--ink-60)', () => this.show('settings')),
            tile('Stats', 'chart', 'Your career so far', 'var(--table)', () => this.show('stats')),
            tile('How to Play', 'help', 'Swing, spin & serve', 'var(--good)', () => this.show('howto')),
          ),
        ),
      ),
      this.hints(),
    );
  }

  private syncMain(): void {
    if (!this.playSub) return;
    const d = DIFFS.find((x) => x.id === this.settings.difficulty)!;
    this.playSub.textContent = `vs ${d.opp} · ${d.name} · Best of ${this.settings.gamesToWin * 2 - 1}`;
  }

  private start(cfg: StartConfig): void {
    this.lastStart = cfg;
    this.onStart(cfg);
  }

  // ─── play setup ───
  private buildSetup(): HTMLElement {
    const grid = h('div', { class: 'diff-grid', role: 'radiogroup', 'aria-label': 'Difficulty' });
    for (const d of DIFFS) {
      const stars = h('span', { class: 'stars' });
      for (let i = 0; i < 4; i++) stars.append(icon(i < d.stars ? 'star' : 'starEmpty'));
      const card = h(
        'button',
        {
          class: `diff-card d-${d.id}`,
          type: 'button',
          role: 'radio',
          'data-nav': '',
          onclick: () => {
            this.setupSel.difficulty = d.id;
            this.syncSetup();
          },
          ondblclick: () => this.startMatch(),
        },
        h('span', { class: 'diff-top' }, h('span', { class: 'diff-avatar' }, d.opp[0]), stars),
        h('b', null, d.name),
        h('span', { class: 'diff-opp' }, `vs ${d.opp}`),
        h('small', null, d.desc),
        h('span', { class: 'diff-check' }, icon('check')),
      );
      this.setupCards.set(d.id, card);
      grid.append(card);
    }
    this.setupLen = this.seg(
      [
        { v: '1', l: 'Best of 1' },
        { v: '2', l: 'Best of 3' },
        { v: '3', l: 'Best of 5' },
      ],
      () => String(this.setupSel.gamesToWin),
      (v) => {
        this.setupSel.gamesToWin = Number(v) as 1 | 2 | 3;
      },
      'Match length',
    );
    const startBtn = this.btn('Start Match', { icon: 'play', variant: 'primary', cls: 'big', onClick: () => this.startMatch() });
    return h(
      'section',
      null,
      this.head('Play Match', this.badge()),
      h(
        'div',
        { class: 'scr-body' },
        h('h3', { class: 'label' }, 'Choose your opponent'),
        grid,
        h(
          'div',
          { class: 'setup-foot' },
          h('div', { class: 'setup-len' }, h('h3', { class: 'label' }, 'Match length'), this.setupLen),
          startBtn,
        ),
      ),
      this.hints(),
    );
  }

  private syncSetup(): void {
    for (const [id, card] of this.setupCards) {
      const on = id === this.setupSel.difficulty;
      card.classList.toggle('selected', on);
      card.setAttribute('aria-checked', String(on));
    }
    this.setupLen?.querySelectorAll<HTMLElement>('[data-value]').forEach((o) => {
      o.setAttribute('aria-checked', String(o.dataset.value === String(this.setupSel.gamesToWin)));
    });
    for (const c of this.setupCards.values()) c.removeAttribute('data-autofocus');
    this.setupCards.get(this.setupSel.difficulty)?.setAttribute('data-autofocus', '');
  }

  private startMatch(): void {
    const { difficulty, gamesToWin } = this.setupSel;
    if (difficulty !== this.settings.difficulty || gamesToWin !== this.settings.gamesToWin) {
      this.settings = { ...this.settings, difficulty, gamesToWin };
      this.onSettings({ ...this.settings });
      this.syncMain();
    }
    this.start({ mode: 'match', difficulty, gamesToWin });
  }

  // ─── challenges ───
  private buildChallenges(): HTMLElement {
    this.challengeGrid = h('div', { class: 'chal-grid' });
    return h('section', null, this.head('Challenges', this.badge()), h('div', { class: 'scr-body' }, this.challengeGrid), this.hints());
  }

  private renderChallenges(): void {
    if (!this.challengeGrid) return;
    clear(this.challengeGrid);
    const colors = ['var(--accent)', 'var(--accent2)', 'var(--gold)', 'var(--table)', 'var(--good)'];
    if (!this.challenges.length) {
      this.challengeGrid.append(h('div', { class: 'empty' }, 'No challenges yet.'));
      return;
    }
    this.challenges.forEach((c, i) => {
      const best = this.stats.challengeBest[c.id];
      this.challengeGrid.append(
        h(
          'button',
          {
            class: 'chal-card',
            type: 'button',
            'data-nav': '',
            'data-autofocus': i === 0,
            style: { '--c': colors[i % colors.length] },
            onclick: () =>
              this.start({ mode: 'challenge', difficulty: this.settings.difficulty, gamesToWin: this.settings.gamesToWin, challengeId: c.id }),
          },
          h('span', { class: 'chal-num' }, String(i + 1).padStart(2, '0')),
          h('b', null, c.name),
          h('small', null, c.description),
          h('span', { class: 'chal-goal' }, icon('target'), c.goal),
          h(
            'span',
            { class: 'chal-foot' },
            best !== undefined
              ? h('span', { class: 'best has' }, icon('medal'), `Best ${best}`)
              : h('span', { class: 'best' }, 'Not played yet'),
            h('span', { class: 'go' }, icon('play')),
          ),
        ),
      );
    });
    this.nav.refresh();
  }

  // ─── pair ───
  private buildPair(): HTMLElement {
    const qr = h('div', { class: 'qr', html: '<div class="qr-wait"><span class="spinner"></span></div>' });
    const url = h('div', { class: 'qr-url' });
    const qrCard = h('div', { class: 'qr-card' }, qr, h('div', { class: 'qr-check' }, icon('check')), url);
    const pin = h('div', { class: 'pin', 'aria-label': 'Pairing PIN' });
    const chipText = h('span');
    const chip = h('div', { class: 'chip status-chip st-idle' }, h('span', { class: 'status-dot' }), chipText);
    const detail = h('div', { class: 'pair-detail' });
    const cont = this.btn('Continue', { icon: 'arrowRight', variant: 'primary', onClick: () => this.show('calibrate') });
    cont.hidden = true;
    const step = (n: number, ic: IconName, title: string, sub: string) =>
      h('li', null, h('span', { class: 'step-n' }, String(n)), h('span', { class: 'step-ico' }, icon(ic)), h('span', null, h('b', null, title), h('small', null, sub)));
    this.pair = { qr, qrCard, url, pin, chip, chipText, detail, cont, lastUrl: '\u0000', lastPin: '\u0000' };
    const el = h(
      'section',
      null,
      this.head('Connect Phone'),
      h(
        'div',
        { class: 'scr-body pair-body' },
        qrCard,
        h(
          'div',
          { class: 'pair-info' },
          h('h3', { class: 'label' }, 'Or enter this PIN on your phone'),
          pin,
          h(
            'ol',
            { class: 'steps' },
            step(1, 'qr', 'Open camera & scan', 'Point your phone camera at the code'),
            step(2, 'hand', 'Tap “Enable Motion”', 'Allow motion sensors when asked'),
            step(3, 'paddle', 'Hold phone like a paddle', 'Upright, screen facing you, back toward the TV'),
          ),
          h('div', { class: 'pair-status' }, chip, detail),
          h(
            'div',
            { class: 'row' },
            cont,
            this.btn('Play with mouse instead', { icon: 'mouse', variant: 'ghost', onClick: () => this.onUseMouse(), autofocus: true }),
          ),
        ),
      ),
      this.hints(),
    );
    this.setPairing({ pin: '', url: '', status: 'idle', transport: 'none' });
    return el;
  }

  // ─── versus pair ───
  private buildVersusPair(): HTMLElement {
    const card = (slot: 1 | 2, color: string, label: string, where: string) => {
      const qr = h('div', { class: 'qr', html: '<div class="qr-wait"><span class="spinner"></span></div>' });
      const url = h('div', { class: 'qr-url' });
      const qrCard = h('div', { class: 'qr-card' }, qr, h('div', { class: 'qr-check' }, icon('check')), url);
      const pin = h('div', { class: 'pin', 'aria-label': `${label} pairing PIN` });
      const chipText = h('span');
      const chip = h('div', { class: 'chip status-chip st-idle' }, h('span', { class: 'status-dot' }), chipText);
      const detail = h('div', { class: 'pair-detail' });
      detail.hidden = true;
      const el = h(
        'div',
        { class: `vs-card vs-p${slot}`, style: { '--c': color } },
        h('div', { class: 'vs-head' }, h('span', { class: 'vs-dot' }), h('b', null, label), h('small', null, where)),
        qrCard,
        pin,
        h('div', { class: 'pair-status' }, chip, detail),
      );
      return { el, qr, qrCard, url, pin, chip, chipText, detail, lastUrl: '\u0000', lastPin: '\u0000' };
    };
    const c1 = card(1, '#ff6b4a', 'Player 1', 'Near side');
    const c2 = card(2, '#2ec4b6', 'Player 2', 'Far side');
    const len = this.seg(
      [
        { v: '1', l: 'Best of 1' },
        { v: '2', l: 'Best of 3' },
        { v: '3', l: 'Best of 5' },
      ],
      // seg() reads the value while this.versus is still being built.
      () => String(this.versus?.gamesToWin ?? this.settings.gamesToWin),
      (v) => {
        this.versus.gamesToWin = Number(v) as 1 | 2 | 3;
      },
      'Match length',
    );
    const start = this.btn('Start', { icon: 'play', variant: 'primary', onClick: () => this.startVersus() });
    start.disabled = true;
    const { el: e1, ...r1 } = c1;
    const { el: e2, ...r2 } = c2;
    this.versus = {
      cards: { 1: r1, 2: r2 },
      status: { 1: 'idle', 2: 'idle' },
      len,
      gamesToWin: this.settings.gamesToWin,
      start,
    };
    len.querySelectorAll<HTMLElement>('[data-value]').forEach((o) => o.setAttribute('aria-checked', String(o.dataset.value === String(this.versus.gamesToWin))));
    return h(
      'section',
      null,
      this.head('2 Players'),
      h(
        'div',
        { class: 'scr-body vs-body' },
        h('div', { class: 'vs-cards' }, e1, e2),
        h('div', { class: 'vs-foot' }, h('div', { class: 'setup-len' }, h('h3', { class: 'label' }, 'Match length'), len), start),
      ),
      this.hints(),
    );
  }

  private syncVersus(opening: boolean): void {
    const v = this.versus;
    if (!v) return;
    if (opening) {
      v.gamesToWin = this.settings.gamesToWin;
      v.len.querySelectorAll<HTMLElement>('[data-value]').forEach((o) => o.setAttribute('aria-checked', String(o.dataset.value === String(v.gamesToWin))));
    }
    const ready = v.status[1] === 'connected' && v.status[2] === 'connected';
    const was = !v.start.disabled;
    v.start.disabled = !ready;
    if (ready && !was && this._screen === 'versus-pair') this.nav.focus(v.start);
  }

  private startVersus(): void {
    if (this.versus.start.disabled) return;
    this.start({ mode: 'versus', difficulty: this.settings.difficulty, gamesToWin: this.versus.gamesToWin });
  }

  // ─── calibrate ───
  private buildCalibrate(): HTMLElement {
    const circ = 2 * Math.PI * 88;
    const ringSvg = h('div', {
      class: 'cal-ring',
      html: `<svg viewBox="0 0 200 200" aria-hidden="true"><circle class="ring-bg" cx="100" cy="100" r="88"/><circle class="ring-fg" cx="100" cy="100" r="88" stroke-dasharray="${circ.toFixed(2)}" stroke-dashoffset="${circ.toFixed(2)}" transform="rotate(-90 100 100)"/></svg>`,
    });
    const paddle = h(
      'div',
      { class: 'pv-paddle' },
      h('div', { class: 'pv-face pv-front' }),
      h('div', { class: 'pv-face pv-back' }),
      h('div', { class: 'pv-edge' }),
      h('div', { class: 'pv-handle' }),
    );
    const pct = h('div', { class: 'cal-pct' }, '0%');
    const stage = h('div', { class: 'cal-stage' }, ringSvg, h('div', { class: 'pv-persp' }, paddle), h('div', { class: 'pv-shadow' }));
    const status = h('div', { class: 'cal-status' }, 'Hold still…');
    const cont = this.btn('Continue', { icon: 'arrowRight', variant: 'secondary', onClick: () => this.onCalibrateDone(), autofocus: true });
    this.cal = {
      paddle,
      ring: ringSvg.querySelector('.ring-fg') as SVGCircleElement,
      pct,
      status,
      cont,
      stage,
      done: false,
    };
    return h(
      'section',
      null,
      this.head('Calibrate Paddle'),
      h(
        'div',
        { class: 'scr-body cal-body' },
        h(
          'div',
          { class: 'cal-explain' },
          h('div', { class: 'cal-art', html: CALIBRATE_ART }),
          h('p', { class: 'lead' }, 'Hold your phone upright like a paddle — screen facing you, the back of the phone toward the game. Keep still for a moment.'),
          h('p', { class: 'muted' }, 'Keep it still for a moment. You can recenter any time from the pause menu.'),
        ),
        h(
          'div',
          { class: 'cal-live' },
          stage,
          h('div', { class: 'cal-readout' }, status, pct),
          h(
            'div',
            { class: 'row' },
            this.btn('Recenter', { icon: 'recenter', variant: 'ghost', onClick: () => this.onRecenter() }),
            cont,
          ),
        ),
      ),
      this.hints(),
    );
  }

  // ─── settings ───
  private seg(
    options: { v: string; l: string }[],
    get: () => string,
    set: (v: string) => void,
    label: string,
  ): HTMLElement {
    const g = h('div', { class: 'seg', role: 'radiogroup', 'aria-label': label, 'data-nav': 'seg' });
    const sync = () =>
      g.querySelectorAll<HTMLElement>('[data-value]').forEach((o) => o.setAttribute('aria-checked', String(o.dataset.value === get())));
    for (const o of options) {
      g.append(
        h(
          'button',
          {
            type: 'button',
            role: 'radio',
            'data-value': o.v,
            tabindex: '-1',
            onclick: () => {
              set(o.v);
              sync();
            },
          },
          o.l,
        ),
      );
    }
    sync();
    return g;
  }

  private slider(min: number, max: number, step: number, get: () => number, set: (v: number) => void, fmt: (v: number) => string): HTMLElement {
    const out = h('output');
    const input = h('input', { type: 'range', min, max, step, tabindex: '-1' }) as HTMLInputElement;
    input.value = String(get());
    const sync = () => {
      const v = parseFloat(input.value);
      input.style.setProperty('--p', `${(((v - min) / (max - min)) * 100).toFixed(1)}%`);
      out.textContent = fmt(v);
    };
    input.addEventListener('input', () => {
      set(parseFloat(input.value));
      sync();
    });
    sync();
    return h('label', { class: 'slider', 'data-nav': 'slider' }, input, out);
  }

  private toggle(get: () => boolean, set: (v: boolean) => void, label: string): HTMLElement {
    const b = h('button', { class: 'toggle', type: 'button', role: 'switch', 'aria-label': label, 'data-nav': 'toggle', tabindex: '-1' }, h('span', { class: 'knob' }));
    const sync = () => b.setAttribute('aria-checked', String(get()));
    b.addEventListener('click', () => {
      set(!get());
      sync();
    });
    sync();
    return b;
  }

  private change<K extends keyof Settings>(k: K, v: Settings[K]): void {
    this.settings = { ...this.settings, [k]: v };
    if (k === 'difficulty') this.setupSel.difficulty = v as Difficulty;
    if (k === 'gamesToWin') this.setupSel.gamesToWin = v as 1 | 2 | 3;
    this.syncMain();
    this.onSettings({ ...this.settings });
  }

  private buildSettings(): HTMLElement {
    this.settingsTabs = this.seg(
      [
        { v: 'gameplay', l: 'Gameplay' },
        { v: 'audio', l: 'Audio' },
        { v: 'graphics', l: 'Graphics' },
      ],
      () => this.settingsTab,
      (v) => {
        this.settingsTab = v as typeof this.settingsTab;
        this.renderSettings(true);
      },
      'Settings section',
    );
    this.settingsTabs.classList.add('tabs');
    this.settingsTabs.setAttribute('data-autofocus', '');
    this.settingsBody = h('div', { class: 'set-list' });
    return h('section', null, this.head('Settings', this.settingsTabs), h('div', { class: 'scr-body' }, this.settingsBody), this.hints());
  }

  private renderSettings(keepFocus = false): void {
    const s = () => this.settings;
    const row = (label: string, hint: string, ctrl: HTMLElement, ic: IconName) =>
      h(
        'div',
        { class: 'set-row' },
        h('span', { class: 'set-ico' }, icon(ic)),
        h('span', { class: 'set-label' }, h('b', null, label), hint ? h('small', null, hint) : null),
        h('span', { class: 'set-ctrl' }, ctrl),
      );
    const pct = (v: number) => `${Math.round(v * 100)}%`;
    clear(this.settingsBody);
    const tab = this.settingsTab;
    this.settingsTabs.querySelectorAll<HTMLElement>('[data-value]').forEach((o) => o.setAttribute('aria-checked', String(o.dataset.value === tab)));
    if (tab === 'gameplay') {
      const name = h('input', {
        type: 'text',
        maxlength: 14,
        spellcheck: 'false',
        autocomplete: 'off',
        class: 'text-in',
        'aria-label': 'Player name',
      }) as HTMLInputElement;
      name.value = s().playerName;
      name.addEventListener('input', () => this.change('playerName', name.value.trim() || 'You'));
      name.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'Escape') name.blur();
        e.stopPropagation();
      });
      const nameWrap = h('label', { class: 'text-wrap', 'data-nav': 'text' }, name, icon('user'));
      this.settingsBody.append(
        row(
          'Difficulty',
          'Default opponent strength',
          this.seg(
            DIFFS.map((d) => ({ v: d.id, l: d.name })),
            () => s().difficulty,
            (v) => this.change('difficulty', v as Difficulty),
            'Difficulty',
          ),
          'trophy',
        ),
        row(
          'Handedness',
          'Which hand holds the phone',
          this.seg(
            [
              { v: 'right', l: 'Right' },
              { v: 'left', l: 'Left' },
            ],
            () => s().handedness,
            (v) => this.change('handedness', v as Settings['handedness']),
            'Handedness',
          ),
          'hand',
        ),
        row('Assist', 'Helps positioning, timing and aim', this.slider(0, 1, 0.05, () => s().assist, (v) => this.change('assist', v), (v) => (v < 0.05 ? 'Off' : pct(v))), 'target'),
        row('Swing sensitivity', 'How hard you need to swing', this.slider(0.5, 2, 0.05, () => s().sensitivity, (v) => this.change('sensitivity', v), (v) => `${v.toFixed(2)}×`), 'bolt'),
        row('Show trajectory', 'Dotted guide for the incoming ball', this.toggle(() => s().showTrajectory, (v) => this.change('showTrajectory', v), 'Show trajectory'), 'rally'),
        row('Haptics', 'Phone buzzes on every hit', this.toggle(() => s().haptics, (v) => this.change('haptics', v), 'Haptics'), 'phone'),
        row('Player name', 'Shown on the scoreboard', nameWrap, 'user'),
      );
    } else if (tab === 'audio') {
      this.settingsBody.append(
        row('Master volume', '', this.slider(0, 1, 0.05, () => s().masterVolume, (v) => this.change('masterVolume', v), pct), 'volume'),
        row('Music', '', this.slider(0, 1, 0.05, () => s().musicVolume, (v) => this.change('musicVolume', v), pct), 'music'),
        row('Sound effects', 'Hits, bounces, crowd', this.slider(0, 1, 0.05, () => s().sfxVolume, (v) => this.change('sfxVolume', v), pct), 'ball'),
      );
    } else {
      this.settingsBody.append(
        row(
          'Quality',
          'Lower it if the game stutters',
          this.seg(
            [
              { v: 'low', l: 'Low' },
              { v: 'medium', l: 'Medium' },
              { v: 'high', l: 'High' },
            ],
            () => s().quality,
            (v) => this.change('quality', v as Settings['quality']),
            'Quality',
          ),
          'monitor',
        ),
        row(
          'Venue',
          'Where you play',
          this.seg(
            [
              { v: 'club', l: 'Club' },
              { v: 'arena', l: 'Arena' },
            ],
            () => s().theme,
            (v) => this.change('theme', v as Settings['theme']),
            'Theme',
          ),
          'home',
        ),
      );
    }
    if (keepFocus) this.nav.focus(this.settingsTabs, { scroll: false });
    this.nav.refresh();
  }

  // ─── stats ───
  private buildStats(): HTMLElement {
    this.statsGrid = h('div', { class: 'stats-grid' });
    const reset = this.btn('Reset stats', { icon: 'trash', variant: 'ghost', cls: 'danger-text', onClick: () => this.confirmReset() });
    return h('section', null, this.head('Career Stats', reset), h('div', { class: 'scr-body' }, this.statsGrid), this.hints());
  }

  private renderStats(): void {
    if (!this.statsGrid) return;
    const st = this.stats;
    clear(this.statsGrid);
    const played = st.matchesPlayed;
    const rate = played ? st.matchesWon / played : 0;
    const totalPts = st.pointsWon + st.pointsLost;
    const card = (ic: IconName, label: string, value: string, sub: string, color: string, big = false) =>
      h(
        'div',
        { class: `stat-card ${big ? 'big' : ''}`, 'data-nav': '', style: { '--c': color } },
        h('span', { class: 'stat-ico' }, icon(ic)),
        h('span', { class: 'stat-val' }, value),
        h('span', { class: 'stat-lbl' }, label),
        sub ? h('small', null, sub) : null,
      );
    const circ = 2 * Math.PI * 40;
    const wr = h('div', {
      class: 'wr-ring',
      html: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" class="ring-bg"/><circle cx="50" cy="50" r="40" class="ring-fg" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${(circ * (1 - rate)).toFixed(1)}" transform="rotate(-90 50 50)"/></svg>`,
    });
    wr.append(h('span', { class: 'wr-text' }, h('span', { class: 'stat-val' }, played ? `${Math.round(rate * 100)}%` : '—'), h('span', { class: 'stat-lbl' }, 'Win rate')));
    const ring = h(
      'div',
      { class: 'stat-card winrate big', 'data-nav': '', 'data-autofocus': true, style: { '--c': 'var(--accent)' } },
      wr,
      h('small', null, `${st.matchesWon} won · ${played - st.matchesWon} lost`),
    );
    this.statsGrid.append(
      ring,
      card('trophy', 'Matches played', String(played), played ? `${st.matchesWon} victories` : 'Play your first match!', 'var(--gold)'),
      card('rally', 'Longest rally', String(st.longestRally), 'hits in one point', 'var(--accent2)'),
      card('bolt', 'Fastest shot', `${Math.round(st.fastestShotKmh)}`, 'km/h', 'var(--accent)'),
      card('ace', 'Aces', String(st.aces), 'unreturned serves', 'var(--gold)'),
      card('percent', 'Points won', String(st.pointsWon), totalPts ? `${Math.round((st.pointsWon / totalPts) * 100)}% of all points` : 'no points yet', 'var(--good)'),
      card('clock', 'Points played', String(totalPts), `${st.pointsLost} lost`, 'var(--table)'),
    );
    const bests = this.challenges.filter((c) => st.challengeBest[c.id] !== undefined);
    if (bests.length) {
      this.statsGrid.append(
        h(
          'div',
          { class: 'stat-card wide', 'data-nav': '', style: { '--c': 'var(--table)' } },
          h('span', { class: 'stat-ico' }, icon('medal')),
          h('span', { class: 'stat-lbl' }, 'Challenge bests'),
          h('ul', { class: 'best-list' }, ...bests.map((c) => h('li', null, h('span', null, c.name), h('b', null, String(st.challengeBest[c.id]))))),
        ),
      );
    }
    this.nav.refresh();
  }

  private confirmReset(): void {
    this.openModal(
      'Reset all stats?',
      'Your career record and challenge bests will be wiped. This can’t be undone.',
      [
        { label: 'Cancel', variant: 'secondary', autofocus: true, sound: 'back', run: () => this.closeModal() },
        {
          label: 'Reset',
          variant: 'danger',
          icon: 'trash',
          run: () => {
            this.closeModal();
            this.onResetStats();
            this.toast('Stats reset');
          },
        },
      ],
    );
  }

  private openModal(
    title: string,
    text: string,
    actions: { label: string; variant: 'primary' | 'secondary' | 'danger'; icon?: IconName; autofocus?: boolean; sound?: NavSound; run: () => void }[],
  ): void {
    this.closeModal();
    const box = h(
      'div',
      { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h(
        'div',
        { class: 'modal-card' },
        h('h3', null, title),
        h('p', null, text),
        h('div', { class: 'row' }, ...actions.map((a) => this.btn(a.label, { variant: a.variant, icon: a.icon, autofocus: a.autofocus, sound: a.sound, onClick: a.run }))),
      ),
    );
    box.addEventListener('click', (e) => {
      if (e.target === box) this.closeModal();
    });
    this.layer.append(box);
    this.modal = box;
    this.nav.setScope(box);
  }

  private closeModal(): void {
    if (!this.modal) return;
    this.modal.remove();
    this.modal = null;
    const cur = this._screen !== 'none' ? this.screens[this._screen] : null;
    this.nav.setScope(cur);
  }

  // ─── how to ───
  private buildHowto(): HTMLElement {
    const cards: { art: keyof typeof HOWTO_ART; title: string; text: string }[] = [
      { art: 'hold', title: 'Hold it like a paddle', text: 'Grip the bottom of the phone like a handle: upright, screen facing you, back of the phone is your rubber.' },
      { art: 'timing', title: 'Swing when the ring turns green', text: 'You run to the ball automatically. A ring closes around the ball — swing (any swing!) when it turns green. No phone motion? Tap the big button instead.' },
      { art: 'swing', title: 'Early or late still counts', text: 'PERFECT timing hits hardest and straightest. EARLY or LATE swings still send the ball back, just softer.' },
      { art: 'aim', title: 'Point to aim', text: 'Point the phone left or right (or press ◀ ▶) — the lit pad on the far side shows where your shot will land.' },
      { art: 'spin', title: 'Spin (optional)', text: 'Brush upward for a fast topspin loop; chop downward for a slow backspin push. A high ball + big swing = smash.' },
      { art: 'serve', title: 'Serving', text: 'Swing or tap to serve. Serves alternate every 2 points — every point from 10–10. First to 11, win by 2.' },
    ];
    return h(
      'section',
      null,
      this.head('How to Play'),
      h(
        'div',
        { class: 'scr-body' },
        h(
          'div',
          { class: 'howto-grid' },
          ...cards.map((c, i) =>
            h(
              'article',
              { class: 'howto-card', 'data-nav': '', 'data-autofocus': i === 0 },
              h('div', { class: 'howto-art', html: HOWTO_ART[c.art] }),
              h('div', { class: 'howto-text' }, h('b', null, h('span', { class: 'howto-n' }, String(i + 1)), c.title), h('small', null, c.text)),
            ),
          ),
        ),
        h(
          'p',
          { class: 'muted center' },
          icon('mouse'),
          ' No phone? Click or press Space when the ring turns green; move the mouse left/right to aim.',
        ),
      ),
      this.hints(),
    );
  }

  // ─── pause ───
  private buildPause(): HTMLElement {
    return h(
      'section',
      null,
      h(
        'div',
        { class: 'pause-card' },
        h('div', { class: 'pause-ico' }, icon('pause')),
        h('h2', null, 'Paused'),
        h(
          'div',
          { class: 'stack' },
          this.btn('Resume', { icon: 'play', variant: 'primary', autofocus: true, onClick: () => this.onResume() }),
          this.btn('Recenter paddle', {
            icon: 'recenter',
            onClick: () => {
              this.onRecenter();
              this.toast('Paddle recentered');
            },
          }),
          this.btn('Settings', { icon: 'sliders', onClick: () => this.show('settings') }),
          this.btn('Quit to menu', { icon: 'home', variant: 'ghost', sound: 'back', onClick: () => this.onQuit() }),
        ),
      ),
    );
  }

  // ─── result ───
  private buildResult(): HTMLElement {
    this.resultEl = h('div', { class: 'result-card' });
    return h('section', null, this.resultEl);
  }

  private renderResult(r: ResultData): void {
    const el = this.resultEl;
    clear(el);
    const modeLabel: Record<GameMode, string> = { match: 'Match', practice: 'Practice', challenge: 'Challenge', demo: 'Demo', versus: '2 Players' };
    el.className = `result-card ${r.won ? 'won' : 'lost'}`;
    const recs = new Set(r.newRecords.map((s) => s.toLowerCase()));
    const banner = h(
      'div',
      { class: 'banner' },
      h('div', { class: 'banner-ico' }, icon(r.won ? 'trophy' : 'paddle')),
      h('div', null, h('span', { class: 'banner-mode' }, modeLabel[r.mode] ?? ''), h('h2', null, r.title)),
    );
    el.append(banner);
    if (r.games.length) {
      const opp = DIFFS.find((d) => d.id === (this.lastStart?.difficulty ?? this.settings.difficulty))?.opp ?? 'CPU';
      const tbl = h('table', { class: 'games' });
      const headRow = h('tr', null, h('th', null, ''));
      r.games.forEach((_, i) => headRow.append(h('th', null, `G${i + 1}`)));
      tbl.append(h('thead', null, headRow));
      const body = h('tbody');
      (['player', 'opponent'] as Side[]).forEach((side) => {
        const tr = h('tr', { class: side }, h('td', { class: 'nm' }, h('span', { class: 'sb-dot' }), side === 'player' ? this.settings.playerName : opp));
        r.games.forEach((g) => tr.append(h('td', { class: g[side] > g[side === 'player' ? 'opponent' : 'player'] ? 'w' : '' }, String(g[side]))));
        body.append(tr);
      });
      tbl.append(body);
      el.append(h('div', { class: 'games-wrap' }, tbl));
    }
    if (r.stats.length) {
      el.append(
        h(
          'div',
          { class: 'res-stats' },
          ...r.stats.map((s) =>
            h(
              'div',
              { class: `res-stat ${recs.has(s.label.toLowerCase()) ? 'record' : ''}` },
              h('b', null, s.value),
              h('small', null, s.label),
              recs.has(s.label.toLowerCase()) ? h('span', { class: 'rec-tag' }, 'New record') : null,
            ),
          ),
        ),
      );
    }
    if (r.newRecords.length) {
      el.append(h('div', { class: 'records' }, ...r.newRecords.map((t) => h('span', { class: 'chip gold' }, icon('star'), `New record · ${t}`))));
    }
    el.append(
      h(
        'div',
        { class: 'row center' },
        this.btn('Play Again', { icon: 'refresh', variant: 'primary', autofocus: true, onClick: () => this.onRestart() }),
        this.btn('Main Menu', { icon: 'home', variant: 'secondary', sound: 'back', onClick: () => this.onQuit() }),
      ),
    );
  }
}
