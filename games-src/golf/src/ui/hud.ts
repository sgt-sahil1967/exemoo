/** In-play HUD: hole card, wind, club selector, lie/distance, power meter, minimap, mouse buttons. */
import type { ClubId, HudState, UIEvents } from '../core/contracts';
import { clubById, PUTT_RANGE_M, SURFACES } from '../core/contracts';
import { h, setText, fmtDist, fmtToPar } from './dom';
import { inkOn } from './avatar';
import { Minimap } from './minimap';
import { PowerMeter } from './power';
import { icon } from './widgets';

type HudBtn = Parameters<UIEvents['hudButton']>[0];

const DEFAULT_HUD: HudState = {
  visible: false,
  holeNumber: 1,
  par: 4,
  yards: 0,
  stroke: 1,
  playerName: 'Player 1',
  playerColor: '#ff5a5f',
  scoreToPar: 0,
  toPinYds: 0,
  lie: 'tee',
  club: '1W',
  clubs: [],
  clubCarryYds: 0,
  puttRange: null,
  wind: { yaw: 0, speed: 0 },
  viewYaw: 0,
  elevationYds: 0,
  trainingLine: '',
  units: 'yards',
};

const SHORT: Record<ClubId, string> = {
  '1W': '1W', '3W': '3W', '5W': '5W', '4I': '4I', '5I': '5I', '6I': '6I', '7I': '7I', '8I': '8I', '9I': '9I', PW: 'PW', SW: 'SW', PT: 'PT',
};

export class Hud {
  readonly el: HTMLElement;
  readonly power = new PowerMeter();
  readonly minimap = new Minimap();
  readonly mouseBtns: HTMLElement;
  private s: HudState = { ...DEFAULT_HUD };
  private els: Record<string, HTMLElement> = {};

  constructor(private emit: (b: HudBtn) => void) {
    const e = this.els;
    const hb = (b: HudBtn, ico: Parameters<typeof icon>[0], key: string, title: string, cls = '') =>
      h(
        'button',
        { type: 'button', class: `bd-hbtn ${cls}`, title, 'aria-label': title, onclick: () => this.emit(b) },
        icon(ico),
        key ? h('kbd', null, key) : null,
      );

    // Top-left hole card.
    e.hole = h('b', { class: 'bd-holecard__hole' });
    e.par = h('span', { class: 'bd-holecard__meta' });
    e.player = h('span', { class: 'bd-pill bd-holecard__player' });
    e.stroke = h('span', { class: 'bd-holecard__stroke' });
    e.toPar = h('span', { class: 'bd-topar' });
    e.training = h('div', { class: 'bd-training is-hidden' });
    const holeCard = h(
      'div',
      { class: 'bd-hud__tl' },
      h(
        'div',
        { class: 'bd-card bd-holecard' },
        h('div', { class: 'bd-holecard__row' }, h('span', { class: 'bd-holecard__flag' }, icon('flag')), e.hole, e.par),
        h('div', { class: 'bd-holecard__row' }, e.player, e.stroke, e.toPar),
      ),
      e.training,
    );

    // Top-right wind + buttons.
    e.windArrow = h('div', { class: 'bd-wind__arrow' }, h('div', { class: 'bd-wind__wobble', html: windArrowSvg() }));
    e.windSpeed = h('div', { class: 'bd-wind__speed' });
    const wind = h(
      'div',
      { class: 'bd-wind bd-card' },
      h('div', { class: 'bd-wind__dial', html: dialSvg() }, e.windArrow),
      e.windSpeed,
    );
    this.mouseBtns = h(
      'div',
      { class: 'bd-hud__btns' },
      hb('map', 'map', 'M', 'Map view'),
      hb('pause', 'pause', 'Esc', 'Pause'),
    );
    const tr = h('div', { class: 'bd-hud__tr' }, this.mouseBtns, wind);

    // Bottom-left club selector.
    e.clubBadge = h('div', { class: 'bd-club__badge' });
    e.clubName = h('div', { class: 'bd-club__name' });
    e.clubCarry = h('div', { class: 'bd-club__carry' });
    e.clubPrev = h('span', { class: 'bd-club__nb' });
    e.clubNext = h('span', { class: 'bd-club__nb' });
    e.putt = h(
      'button',
      { type: 'button', class: 'bd-puttchip is-hidden', onclick: () => this.emit('puttRange'), title: 'Change putt range' },
      icon('putter'),
      h('span', { class: 'bd-puttchip__t' }),
    );
    const club = h(
      'div',
      { class: 'bd-hud__bl' },
      h(
        'div',
        { class: 'bd-card bd-club' },
        hb('clubPrev', 'minus', '', 'Previous club', 'bd-hbtn--sm'),
        h(
          'div',
          { class: 'bd-club__main' },
          h('div', { class: 'bd-club__strip' }, e.clubPrev, e.clubBadge, e.clubNext),
          h('div', { class: 'bd-club__text' }, e.clubName, e.clubCarry),
        ),
        hb('clubNext', 'plus', '', 'Next club', 'bd-hbtn--sm'),
      ),
      e.putt,
    );

    // Bottom-centre lie / distance.
    e.lieDot = h('span', { class: 'bd-lie__dot' });
    e.lie = h('span', { class: 'bd-lie__name' });
    e.dist = h('b', { class: 'bd-lie__dist' });
    e.elev = h('span', { class: 'bd-lie__elev' });
    const lie = h(
      'div',
      { class: 'bd-hud__bc' },
      hb('aimLeft', 'left', '', 'Aim left', 'bd-hbtn--aim bd-mouseonly'),
      h('div', { class: 'bd-card bd-lie' }, e.lieDot, e.lie, h('span', { class: 'bd-lie__sep' }), e.dist, e.elev),
      hb('aimRight', 'right', '', 'Aim right', 'bd-hbtn--aim bd-mouseonly'),
    );

    const right = h('div', { class: 'bd-hud__r' }, this.power.el);
    const br = h('div', { class: 'bd-hud__br' }, this.minimap.el);
    this.el = h('div', { class: 'bd-hud' }, holeCard, tr, right, club, lie, br);
    this.render(true);
  }

  update(p: Partial<HudState>) {
    let changed = false;
    for (const k in p) {
      const key = k as keyof HudState;
      const v = p[key];
      const old = this.s[key];
      if (v === undefined) continue;
      if (typeof v === 'object' && v !== null) {
        if (JSON.stringify(v) === JSON.stringify(old)) continue;
      } else if (v === old) continue;
      (this.s as unknown as Record<string, unknown>)[key] = Array.isArray(v) ? [...v] : typeof v === 'object' ? { ...v } : v;
      changed = true;
    }
    if (changed) this.render(false);
  }

  get state(): Readonly<HudState> {
    return this.s;
  }

  private render(_first: boolean) {
    const s = this.s;
    const e = this.els;
    this.el.classList.toggle('is-visible', s.visible);
    setText(e.hole, `Hole ${s.holeNumber}`);
    setText(e.par, `Par ${s.par} · ${fmtDist(s.yards, s.units)}`);
    setText(e.player, s.playerName);
    e.player.style.setProperty('--pc', s.playerColor);
    e.player.style.color = inkOn(s.playerColor);
    setText(e.stroke, `Shot ${s.stroke}`);
    setText(e.toPar, fmtToPar(s.scoreToPar));
    e.toPar.dataset.tone = s.scoreToPar < 0 ? 'under' : s.scoreToPar > 0 ? 'over' : 'even';
    setText(e.training, s.trainingLine);
    e.training.classList.toggle('is-hidden', !s.trainingLine);

    // Wind relative to the camera: rel=0 blows away from the viewer (up). +yaw = left = CCW.
    const calm = s.wind.speed < 0.3;
    const rel = s.wind.yaw - s.viewYaw;
    e.windArrow.style.transform = `rotate(${-rel}rad)`;
    e.windArrow.classList.toggle('is-hidden', calm);
    e.windArrow.style.setProperty('--wob', `${2 + s.wind.speed * 0.9}deg`);
    e.windArrow.style.setProperty('--wobt', `${Math.max(0.5, 2.2 - s.wind.speed * 0.15)}s`);
    setText(e.windSpeed, calm ? 'Calm' : `${s.wind.speed.toFixed(s.wind.speed < 10 ? 1 : 0)} m/s`);

    // Club strip.
    const list = s.clubs.length ? s.clubs : [s.club];
    const i = Math.max(0, list.indexOf(s.club));
    const c = clubById(s.club);
    setText(e.clubBadge, SHORT[s.club]);
    e.clubBadge.dataset.kind = c.kind;
    setText(e.clubPrev, i > 0 ? SHORT[list[i - 1]] : '');
    setText(e.clubNext, i < list.length - 1 ? SHORT[list[i + 1]] : '');
    setText(e.clubName, c.name);
    const putting = c.kind === 'putter';
    setText(e.clubCarry, putting ? 'Putting' : `${fmtDist(s.clubCarryYds || c.carryYards, s.units)} carry`);
    e.putt.classList.toggle('is-hidden', !(putting && s.puttRange));
    if (s.puttRange) {
      const m = PUTT_RANGE_M[s.puttRange];
      const name = s.puttRange[0].toUpperCase() + s.puttRange.slice(1);
      setText(e.putt.querySelector('.bd-puttchip__t')!, `${name} · ${s.units === 'meters' ? `${m} m` : `${Math.round(m * 3.281)} ft`}`);
    }
    this.power.configure(s.puttRange, s.units);

    // Lie + distance.
    const surf = SURFACES[s.lie];
    e.lieDot.style.background = surf.color;
    setText(e.lie, surf.label);
    const toPin = s.lie === 'green' && s.toPinYds < 30
      ? s.units === 'meters' ? `${(s.toPinYds * 0.9144).toFixed(1)} m to pin` : `${Math.round(s.toPinYds * 3)} ft to pin`
      : `${fmtDist(s.toPinYds, s.units)} to pin`;
    setText(e.dist, toPin);
    const el = s.elevationYds;
    e.elev.classList.toggle('is-hidden', Math.abs(el) < 2);
    setText(e.elev, `${el > 0 ? '↑' : '↓'} ${fmtDist(Math.abs(el), s.units)}`);
    e.elev.dataset.dir = el > 0 ? 'up' : 'down';
  }
}

function windArrowSvg() {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M50 10 L72 44 L58 44 L58 86 Q50 92 42 86 L42 44 L28 44 Z" fill="#20a4f3" stroke="#ffffff" stroke-width="5" stroke-linejoin="round"/>
  </svg>`;
}

function dialSvg() {
  let ticks = '';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r0 = i % 4 === 0 ? 38 : 41;
    ticks += `<line x1="${50 + Math.sin(a) * r0}" y1="${50 - Math.cos(a) * r0}" x2="${50 + Math.sin(a) * 45}" y2="${50 - Math.cos(a) * 45}" stroke="${i % 4 === 0 ? '#9fb3c0' : '#d3dee5'}" stroke-width="${i % 4 === 0 ? 3 : 2}" stroke-linecap="round"/>`;
  }
  return `<svg class="bd-wind__face" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="48" fill="#eef7fd"/>
    <circle cx="50" cy="50" r="30" fill="#ffffff"/>
    ${ticks}
    <path d="M50 3 l5 8 h-10z" fill="#ff3b30"/>
  </svg>`;
}
