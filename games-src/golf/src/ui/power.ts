/** Wii-Golf-style vertical power meter: live backswing fill, overswing zone, armed glow, frozen result. */
import { PUTT_RANGE_M, type PuttRange } from '../core/contracts';
import { h, setText } from './dom';

/** Top of the scale (backswing / power units). 1.0 sits at 1/1.2 of the track. */
const MAX = 1.2;

export interface PowerInput {
  backswing: number;
  armed: boolean;
  putt: boolean;
  result?: { power: number; curve: number };
}

export class PowerMeter {
  readonly el: HTMLElement;
  private fill: HTMLElement;
  private peak: HTMLElement;
  private ticks: HTMLElement;
  private state: HTMLElement;
  private title: HTMLElement;
  private res: HTMLElement;
  private resPct: HTMLElement;
  private curveDot: HTMLElement;
  private curveLabel: HTMLElement;
  private mode = '';
  private peakV = 0;
  private lastFill = -1;
  private puttRange: PuttRange = 'medium';
  private units: 'yards' | 'meters' = 'yards';

  constructor() {
    this.fill = h('div', { class: 'bd-power__fill' });
    this.peak = h('div', { class: 'bd-power__peak' });
    this.ticks = h('div', { class: 'bd-power__ticks' });
    this.state = h('div', { class: 'bd-power__state' });
    this.title = h('div', { class: 'bd-power__title' }, 'Power');
    this.resPct = h('b');
    this.curveDot = h('i', { class: 'bd-power__cdot' });
    this.curveLabel = h('span', { class: 'bd-power__clabel' });
    this.res = h(
      'div',
      { class: 'bd-power__result' },
      this.resPct,
      h('div', { class: 'bd-power__curve' }, h('span', { class: 'bd-power__ctrack' }, h('i', { class: 'bd-power__cmid' }), this.curveDot)),
      this.curveLabel,
    );
    this.el = h(
      'div',
      { class: 'bd-power bd-card is-hidden' },
      this.title,
      h(
        'div',
        { class: 'bd-power__track' },
        h('div', { class: 'bd-power__over' }),
        this.fill,
        this.peak,
        h('div', { class: 'bd-power__full' }),
        this.ticks,
      ),
      this.state,
      this.res,
    );
    this.buildTicks(false);
  }

  /** Putt scale depends on the selected range + units (from the HUD). */
  configure(range: PuttRange | null, units: 'yards' | 'meters') {
    const r = range ?? this.puttRange;
    if (r === this.puttRange && units === this.units) return;
    this.puttRange = r;
    this.units = units;
    if (this.mode === 'putt') this.buildTicks(true);
  }

  private buildTicks(putt: boolean) {
    this.ticks.innerHTML = '';
    const steps = [0.25, 0.5, 0.75, 1];
    for (const f of steps) {
      let text = `${Math.round(f * 100)}`;
      if (putt) {
        const m = PUTT_RANGE_M[this.puttRange] * f;
        text = this.units === 'meters' ? `${Math.round(m)}m` : `${Math.round(m * 3.281)}ft`;
      }
      this.ticks.append(h('span', { class: `bd-power__tick${f === 1 ? ' is-full' : ''}`, style: `bottom:${(f / MAX) * 100}%` }, h('em', null, text)));
    }
  }

  set(m: PowerInput | null) {
    if (!m) {
      this.el.classList.add('is-hidden');
      this.peakV = 0;
      return;
    }
    this.el.classList.remove('is-hidden');
    const mode = m.putt ? 'putt' : 'full';
    if (mode !== this.mode) {
      this.mode = mode;
      this.el.classList.toggle('is-putt', m.putt);
      setText(this.title, m.putt ? 'Putt' : 'Power');
      this.buildTicks(m.putt);
    }
    const frozen = !!m.result;
    const v = Math.max(0, Math.min(MAX, frozen ? m.result!.power : m.backswing));
    if (!frozen) {
      if (v < 0.03) this.peakV = 0;
      this.peakV = Math.max(this.peakV, v);
    }
    const pct = Math.round((v / MAX) * 1000) / 10;
    if (pct !== this.lastFill) {
      this.lastFill = pct;
      this.fill.style.clipPath = `inset(${100 - pct}% 0 0 0 round 0 0 999px 999px)`;
      this.peak.style.bottom = `${(this.peakV / MAX) * 100}%`;
    }
    this.el.classList.toggle('is-over', v > 1.0);
    this.el.classList.toggle('is-armed', m.armed && !frozen);
    this.el.classList.toggle('is-frozen', frozen);
    setText(this.state, frozen ? '' : m.armed ? 'SWING!' : 'Practice');
    if (frozen) {
      const r = m.result!;
      setText(this.resPct, `${Math.round(r.power * 100)}%`);
      const c = Math.max(-1, Math.min(1, r.curve));
      this.curveDot.style.left = `${50 + c * 46}%`;
      const a = Math.abs(c);
      const name = a < 0.12 ? 'Straight' : c < 0 ? (a < 0.4 ? 'Draw' : 'Hook') : a < 0.4 ? 'Fade' : 'Slice';
      setText(this.curveLabel, name);
      this.res.dataset.tone = a < 0.12 ? 'good' : a < 0.4 ? 'ok' : 'bad';
    }
  }
}
