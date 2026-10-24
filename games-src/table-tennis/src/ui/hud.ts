/** In-match heads-up display (DOM overlay, never blocks canvas input except the pause button). */
import type { LinkStatus, LinkTransport, Side } from '../core/contracts';
import { clamp, h, replay } from './dom';
import { icon } from './icons';

export type CalloutTone = 'good' | 'bad' | 'neutral' | 'gold';

export interface HudScore {
  points: Record<Side, number>;
  games: Record<Side, number>;
  server: Side;
  names: [string, string];
  gamePoint: Side | null;
  matchPoint: Side | null;
  /** Optional (addition): games needed to win; falls back to the UI's current match config. */
  gamesToWin?: number;
}

export interface HudChallenge {
  name: string;
  score: number;
  best: number;
  detail: string;
}

const STATUS_LABEL: Record<LinkStatus, string> = {
  idle: 'Offline',
  connecting: 'Connecting',
  waiting: 'Waiting',
  pairing: 'Pairing',
  connected: 'Phone',
  disconnected: 'Disconnected',
  error: 'Error',
};

export class Hud {
  readonly el: HTMLDivElement;
  onPause: () => void = () => {};

  private board: HTMLDivElement;
  private nameEl: Record<Side, HTMLSpanElement>;
  private ptsEl: Record<Side, HTMLSpanElement>;
  private pipsEl: Record<Side, HTMLSpanElement>;
  private serveEl: Record<Side, HTMLSpanElement>;
  private tagEl: HTMLDivElement;
  private rallyEl: HTMLDivElement;
  private rallyNum: HTMLSpanElement;
  private speedEl: HTMLDivElement;
  private speedNum: HTMLSpanElement;
  private calloutEl: HTMLDivElement;
  private calloutText: HTMLDivElement;
  private calloutSub: HTMLDivElement;
  private promptEl: HTMLDivElement;
  private connEl: HTMLDivElement;
  private connText: HTMLSpanElement;
  private meters: Record<'main' | Side, MeterParts>;
  private splitEl: HTMLDivElement;
  private splitTag: Record<Side, HTMLDivElement>;
  private splitPrompt: Record<Side, HTMLDivElement>;
  private splitOn = false;
  private slow: {
    vig: HTMLDivElement;
    label: HTMLDivElement;
    bar: HTMLDivElement;
    pips: HTMLSpanElement;
    box: HTMLDivElement;
    pipEls: HTMLElement[];
  };
  private chalEl: HTMLDivElement;
  private chal: { name: HTMLDivElement; score: HTMLSpanElement; best: HTMLSpanElement; detail: HTMLDivElement };

  private lastPts: Record<Side, number> = { player: -1, opponent: -1 };
  private lastRally = 0;
  private lastChalScore = -1;
  private speedTimer = 0;
  private calloutTimer = 0;
  private visible = false;
  private controllerKind: 'phone' | 'mouse' | 'none' = 'none';

  constructor(private gamesToWin: () => number) {
    const side = (s: Side) => {
      const name = h('span', { class: 'sb-name' });
      const serve = h('span', { class: 'sb-serve', title: 'Serving' });
      const pips = h('span', { class: 'sb-pips' });
      const pts = h('span', { class: 'sb-pts' }, '0');
      const wrap = h(
        'div',
        { class: `sb-side sb-${s}` },
        s === 'player'
          ? h('div', { class: 'sb-id' }, h('span', { class: 'sb-dot' }), name, serve)
          : h('div', { class: 'sb-id' }, serve, name, h('span', { class: 'sb-dot' })),
        pips,
      );
      return { wrap, name, serve, pips, pts };
    };
    const p = side('player');
    const o = side('opponent');
    this.nameEl = { player: p.name, opponent: o.name };
    this.ptsEl = { player: p.pts, opponent: o.pts };
    this.pipsEl = { player: p.pips, opponent: o.pips };
    this.serveEl = { player: p.serve, opponent: o.serve };
    this.tagEl = h('div', { class: 'sb-tag' });
    this.board = h(
      'div',
      { class: 'sb' },
      h('div', { class: 'sb-pill' }, p.wrap, h('div', { class: 'sb-score' }, p.pts, h('span', { class: 'sb-colon' }), o.pts), o.wrap),
      this.tagEl,
    );

    this.rallyNum = h('span', { class: 'rally-num' }, '0');
    this.rallyEl = h('div', { class: 'rally' }, h('span', { class: 'rally-lbl' }, 'Rally'), this.rallyNum);

    this.speedNum = h('span', { class: 'speed-num' }, '0');
    this.speedEl = h('div', { class: 'speed' }, icon('bolt'), this.speedNum, h('span', { class: 'speed-unit' }, 'km/h'));

    this.calloutText = h('div', { class: 'callout-text' });
    this.calloutSub = h('div', { class: 'callout-sub' });
    this.calloutEl = h('div', { class: 'callout', 'aria-live': 'polite' }, this.calloutText, this.calloutSub);

    this.promptEl = h('div', { class: 'prompt' });

    this.connText = h('span', { class: 'conn-text' });
    this.connEl = h('div', { class: 'conn chip' }, h('span', { class: 'status-dot' }), this.connText);

    const mainMeter = makeMeter();
    const meterP = makeMeter();
    const meterO = makeMeter();
    this.meters = { main: mainMeter, player: meterP, opponent: meterO };
    const meter = mainMeter.el;

    // split-screen overlay: divider, name tags and per-half prompt / meter
    const tag = (cls: string) => h('div', { class: `hs-tag ${cls}` });
    this.splitTag = { player: tag('p1'), opponent: tag('p2') };
    this.splitPrompt = { player: h('div', { class: 'prompt' }), opponent: h('div', { class: 'prompt' }) };
    this.splitEl = h(
      'div',
      { class: 'hud-split' },
      h('div', { class: 'hs-divider' }),
      h('div', { class: 'hs-half hs-left' }, this.splitTag.player, h('div', { class: 'hs-bl' }, meterP.el), h('div', { class: 'hs-bc' }, this.splitPrompt.player)),
      h('div', { class: 'hs-half hs-right' }, this.splitTag.opponent, h('div', { class: 'hs-bl' }, meterO.el), h('div', { class: 'hs-bc' }, this.splitPrompt.opponent)),
    );
    this.splitEl.hidden = true;

    // slow-mo indicator
    const pips = h('span', { class: 'sm-pips' });
    const smHint = h('span', { class: 'sm-hint' }, 'E / SLOW-MO');
    const smBox = h('div', { class: 'slowmo' }, icon('clock'), pips, smHint);
    smBox.hidden = true;
    const smBar = h('div', { class: 'sm-bar-fill' });
    const smLabel = h('div', { class: 'slowmo-label' }, h('span', null, 'SLOW-MO'), h('div', { class: 'sm-bar' }, smBar));
    const smVig = h('div', { class: 'slowmo-vig' });
    this.slow = { vig: smVig, label: smLabel, bar: smBar, pips, box: smBox, pipEls: [] };

    this.chal = {
      name: h('div', { class: 'chal-name' }),
      score: h('span', { class: 'chal-score' }, '0'),
      best: h('span', { class: 'chal-best' }),
      detail: h('div', { class: 'chal-detail' }),
    };
    this.chalEl = h(
      'div',
      { class: 'chal card-glass' },
      this.chal.name,
      h('div', { class: 'chal-row' }, this.chal.score, this.chal.best),
      this.chal.detail,
    );

    const pauseBtn = h(
      'button',
      { class: 'hud-pause', 'aria-label': 'Pause', title: 'Pause', onclick: () => this.onPause() },
      icon('pause'),
    );

    this.el = h(
      'div',
      { class: 'hud', 'aria-hidden': 'true' },
      smVig,
      this.splitEl,
      h('div', { class: 'hud-tl' }, pauseBtn, this.chalEl),
      h('div', { class: 'hud-tc' }, this.board, this.rallyEl, smLabel),
      h('div', { class: 'hud-tr' }, this.connEl),
      this.calloutEl,
      h('div', { class: 'hud-bl' }, meter),
      h('div', { class: 'hud-bc' }, this.promptEl),
      h('div', { class: 'hud-br' }, smBox, this.speedEl),
    );
    this.setChallenge(null);
    this.setPrompt(null);
    this.setSlowMo(null);
    this.setScore({
      points: { player: 0, opponent: 0 },
      games: { player: 0, opponent: 0 },
      server: 'player',
      names: ['You', 'CPU'],
      gamePoint: null,
      matchPoint: null,
    });
    this.connEl.hidden = true;
  }

  // ───────────────────────── public API (UI.hud) ─────────────────────────
  show(on: boolean): void {
    this.visible = on;
    this.el.classList.toggle('on', on);
    this.el.setAttribute('aria-hidden', on ? 'false' : 'true');
  }

  get shown(): boolean {
    return this.visible;
  }

  setScore(s: HudScore): void {
    const sides: Side[] = ['player', 'opponent'];
    const total = Math.max(1, s.gamesToWin ?? this.gamesToWin(), s.games.player, s.games.opponent);
    this.nameEl.player.textContent = s.names[0];
    this.nameEl.opponent.textContent = s.names[1];
    for (const side of sides) {
      const pts = s.points[side];
      if (this.ptsEl[side].textContent !== String(pts)) {
        this.ptsEl[side].textContent = String(pts);
        if (this.lastPts[side] >= 0 && pts > this.lastPts[side]) replay(this.ptsEl[side], 'pop');
      }
      this.lastPts[side] = pts;
      this.serveEl[side].classList.toggle('on', s.server === side);
      const pips = this.pipsEl[side];
      if (pips.childElementCount !== total || pips.dataset.won !== String(s.games[side])) {
        pips.textContent = '';
        for (let i = 0; i < total; i++) pips.append(h('i', { class: i < s.games[side] ? 'won' : '' }));
        pips.dataset.won = String(s.games[side]);
      }
    }
    const deuce = s.points.player >= 10 && s.points.player === s.points.opponent;
    let tag = '';
    let cls = '';
    if (s.matchPoint) {
      tag = 'Match point';
      cls = `gold ${s.matchPoint}`;
    } else if (s.gamePoint) {
      tag = 'Game point';
      cls = s.gamePoint;
    } else if (deuce) {
      tag = 'Deuce';
      cls = 'neutral';
    }
    if (this.tagEl.textContent !== tag) {
      this.tagEl.textContent = tag;
      this.tagEl.className = `sb-tag ${cls}`;
      if (tag) replay(this.tagEl, 'show');
    }
  }

  setRally(n: number): void {
    this.rallyNum.textContent = String(n);
    this.rallyEl.classList.toggle('on', n >= 2);
    if (n > this.lastRally && n >= 2) {
      replay(this.rallyNum, 'pop');
      this.rallyEl.classList.toggle('hot', n >= 10);
    }
    if (n < 2) this.rallyEl.classList.remove('hot');
    this.lastRally = n;
  }

  setShotSpeed(kmh: number): void {
    this.speedNum.textContent = String(Math.round(kmh));
    this.speedEl.classList.toggle('fast', kmh >= 80);
    this.speedEl.classList.add('on');
    replay(this.speedEl, 'pop');
    clearTimeout(this.speedTimer);
    this.speedTimer = window.setTimeout(() => this.speedEl.classList.remove('on'), 1800);
  }

  callout(text: string, tone: CalloutTone, sub?: string): void {
    this.calloutText.textContent = text;
    this.calloutSub.textContent = sub ?? '';
    this.calloutSub.hidden = !sub;
    this.calloutEl.className = `callout tone-${tone}`;
    this.calloutEl.dataset.len = text.length > 9 ? 'long' : 'short';
    replay(this.calloutEl, 'play');
    clearTimeout(this.calloutTimer);
    this.calloutTimer = window.setTimeout(() => this.calloutEl.classList.remove('play'), 1700);
  }

  setPrompt(text: string | null, side?: Side): void {
    const el = this.splitOn && side ? this.splitPrompt[side] : this.promptEl;
    if (text) el.textContent = text;
    el.classList.toggle('on', !!text);
    // a null prompt without a side clears everything (e.g. leaving a serve state)
    if (!text && !side) for (const p of Object.values(this.splitPrompt)) p.classList.remove('on');
  }

  /** Split-screen HUD: centre divider, coloured name tags, per-half prompt / swing meter. */
  setSplit(on: boolean, names?: [string, string]): void {
    this.splitOn = on;
    this.splitEl.hidden = !on;
    this.el.classList.toggle('split', on);
    if (names) {
      this.splitTag.player.textContent = names[0];
      this.splitTag.opponent.textContent = names[1];
    } else if (on) {
      if (!this.splitTag.player.textContent) this.splitTag.player.textContent = 'P1';
      if (!this.splitTag.opponent.textContent) this.splitTag.opponent.textContent = 'P2';
    }
    if (!on) for (const p of Object.values(this.splitPrompt)) p.classList.remove('on');
    this.promptEl.classList.remove('on');
  }

  /** Slow-mo power-up indicator. null hides everything. */
  setSlowMo(s: { charges: number; max: number; active: boolean; remaining: number } | null): void {
    const m = this.slow;
    if (!s) {
      m.box.hidden = true;
      m.vig.classList.remove('on');
      m.label.classList.remove('on');
      return;
    }
    m.box.hidden = false;
    if (m.pipEls.length !== s.max) {
      m.pips.textContent = '';
      m.pipEls = Array.from({ length: s.max }, () => h('i'));
      m.pips.append(...m.pipEls);
    }
    m.pipEls.forEach((p, i) => p.classList.toggle('full', i < s.charges));
    m.box.classList.toggle('active', s.active);
    m.box.classList.toggle('empty', s.charges <= 0 && !s.active);
    m.vig.classList.toggle('on', s.active);
    m.label.classList.toggle('on', s.active);
    m.bar.style.transform = `scaleX(${clamp(s.remaining, 0, 1).toFixed(3)})`;
  }

  setControllerKind(kind: 'phone' | 'mouse' | 'none'): void {
    this.controllerKind = kind;
    if (kind === 'mouse') {
      this.connEl.hidden = false;
      this.connEl.className = 'conn chip st-mouse';
      this.connText.textContent = 'Mouse';
    }
  }

  setConnection(status: LinkStatus, transport: LinkTransport, latencyMs: number): void {
    if (this.controllerKind === 'mouse' && status !== 'connected') {
      this.setControllerKind('mouse');
      return;
    }
    if (status === 'idle' && transport === 'none') {
      this.connEl.hidden = true;
      return;
    }
    this.connEl.hidden = false;
    this.connEl.className = `conn chip st-${status}`;
    const parts = [STATUS_LABEL[status]];
    if (status === 'connected') {
      if (transport !== 'none') parts.push(transport === 'webrtc' ? 'WebRTC' : 'Relay');
      if (latencyMs > 0) parts.push(`${Math.round(latencyMs)} ms`);
      this.connEl.classList.toggle('slow', latencyMs > 60);
    }
    this.connText.textContent = parts.join(' · ');
  }

  setChallenge(c: HudChallenge | null): void {
    this.chalEl.hidden = !c;
    if (!c) {
      this.lastChalScore = -1;
      return;
    }
    this.chal.name.textContent = c.name;
    this.chal.score.textContent = String(c.score);
    this.chal.best.textContent = `Best ${c.best}`;
    this.chal.detail.textContent = c.detail;
    if (this.lastChalScore >= 0 && c.score > this.lastChalScore) replay(this.chal.score, 'pop');
    this.chal.best.classList.toggle('beaten', c.score > c.best && c.best > 0);
    this.lastChalScore = c.score;
  }

  setSwingMeter(v: number, side?: Side): void {
    const m = this.meters[this.splitOn && side ? side : 'main'];
    const x = clamp(v, 0, 1);
    const now = performance.now();
    if (x >= m.peak) {
      m.peak = x;
      m.peakT = now;
    } else if (now - m.peakT > 600) {
      m.peak = Math.max(x, m.peak - 0.02);
    }
    m.fill.style.transform = `scaleY(${x.toFixed(3)})`;
    m.pk.style.bottom = `${(m.peak * 100).toFixed(1)}%`;
    m.fill.classList.toggle('hot', x > 0.75);
  }
}

interface MeterParts {
  el: HTMLDivElement;
  fill: HTMLDivElement;
  pk: HTMLDivElement;
  peak: number;
  peakT: number;
}

function makeMeter(): MeterParts {
  const fill = h('div', { class: 'meter-fill' });
  const pk = h('div', { class: 'meter-peak' });
  const el = h('div', { class: 'meter' }, h('div', { class: 'meter-track' }, fill, pk), h('div', { class: 'meter-lbl' }, 'Swing'));
  return { el, fill, pk, peak: 0, peakT: 0 };
}
