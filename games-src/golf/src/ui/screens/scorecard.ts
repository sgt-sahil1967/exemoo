/** Scorecard (classic table with birdie circles / bogey squares) and the results podium. */
import type { ResultsData, ScorecardData } from '../../core/contracts';
import { h, clear, fmtToPar } from '../dom';
import { avatarSvg, inkOn } from '../avatar';
import type { ScreenDef, UICtx } from '../types';
import { btn, icon, panel } from '../widgets';

/** CSS class for a score relative to par. */
function markClass(strokes: number, par: number): string {
  if (strokes === 1) return 'is-ace';
  const d = strokes - par;
  if (d <= -2) return 'is-eagle';
  if (d === -1) return 'is-birdie';
  if (d === 0) return 'is-par';
  if (d === 1) return 'is-bogey';
  return 'is-double';
}

/** Build the scorecard table element. */
export function scorecardTable(d: ScorecardData): HTMLElement {
  const n = d.holes.length;
  const parTotal = d.holes.reduce((t, x) => t + x.par, 0);
  const ydsTotal = d.holes.reduce((t, x) => t + x.yards, 0);
  const cur = (i: number) => (i === d.current ? ' is-current' : '');
  const head = h(
    'tr',
    { class: 'bd-sc__holes' },
    h('th', { class: 'bd-sc__name' }, 'Hole'),
    ...d.holes.map((x, i) => h('th', { class: `bd-sc__cell${cur(i)}` }, String(x.number))),
    h('th', { class: 'bd-sc__tot' }, n === 9 ? 'Out' : 'Total'),
    h('th', { class: 'bd-sc__tot' }, 'To Par'),
  );
  const yds = h(
    'tr',
    { class: 'bd-sc__yds' },
    h('th', { class: 'bd-sc__name' }, 'Yards'),
    ...d.holes.map((x, i) => h('td', { class: `bd-sc__cell${cur(i)}` }, String(Math.round(x.yards)))),
    h('td', { class: 'bd-sc__tot' }, String(Math.round(ydsTotal))),
    h('td', { class: 'bd-sc__tot' }),
  );
  const par = h(
    'tr',
    { class: 'bd-sc__par' },
    h('th', { class: 'bd-sc__name' }, 'Par'),
    ...d.holes.map((x, i) => h('td', { class: `bd-sc__cell${cur(i)}` }, String(x.par))),
    h('td', { class: 'bd-sc__tot' }, String(parTotal)),
    h('td', { class: 'bd-sc__tot' }),
  );
  const rows = d.players.map((p) => {
    let total = 0;
    let toPar = 0;
    let played = 0;
    const cells = d.holes.map((x, i) => {
      const s = p.strokes[i];
      if (s === null || s === undefined) return h('td', { class: `bd-sc__cell${cur(i)}` }, h('span', { class: 'bd-sc__empty' }, '·'));
      total += s;
      toPar += s - x.par;
      played++;
      return h('td', { class: `bd-sc__cell${cur(i)}` }, h('span', { class: `bd-mark ${markClass(s, x.par)}` }, String(s)));
    });
    return h(
      'tr',
      { class: 'bd-sc__player' },
      h('th', { class: 'bd-sc__name' }, h('span', { class: 'bd-pill', style: `--pc:${p.color};color:${inkOn(p.color)}` }, p.name)),
      ...cells,
      h('td', { class: 'bd-sc__tot bd-sc__strong' }, played ? String(total) : '–'),
      h('td', { class: `bd-sc__tot bd-sc__strong ${toPar < 0 ? 'is-under' : toPar > 0 ? 'is-over' : ''}` }, played ? fmtToPar(toPar) : '–'),
    );
  });
  const legend = h(
    'div',
    { class: 'bd-sc__legend' },
    h('span', null, h('span', { class: 'bd-mark is-eagle' }, '3'), 'Eagle'),
    h('span', null, h('span', { class: 'bd-mark is-birdie' }, '3'), 'Birdie'),
    h('span', null, h('span', { class: 'bd-mark is-bogey' }, '5'), 'Bogey'),
    h('span', null, h('span', { class: 'bd-mark is-double' }, '6'), 'Double+'),
  );
  return h(
    'div',
    { class: 'bd-sc' },
    h('div', { class: 'bd-sc__scroll' }, h('table', { class: 'bd-sc__table' }, h('thead', null, head), h('tbody', null, yds, par, ...rows))),
    legend,
  );
}

export function scorecardScreen(ctx: UICtx): ScreenDef {
  let fromPause = false;
  const body = h('div');
  const cont = btn('Continue', () => (fromPause ? ctx.go('pause') : ctx.emit('next')), { icon: 'next', kind: 'primary', nav: 'continue' });
  const p = panel('Scorecard', 'card', [body], [h('span', { class: 'bd-grow' }), cont], 'bd-panel--wide bd-panel--card');
  const title = p.querySelector('h2')!;
  const el = h('div', { class: 'bd-screen' }, p);
  return {
    el,
    dim: true,
    first: () => cont,
    back: () => (fromPause ? ctx.go('pause') : undefined),
    show(data) {
      const o = data as (ScorecardData & { fromPause?: boolean }) | { fromPause: boolean } | undefined;
      fromPause = !!o && 'fromPause' in o && !!o.fromPause;
      if (o && 'holes' in o) ctx.state.scorecard = o;
      const d = ctx.state.scorecard;
      clear(body);
      title.textContent = d ? `${d.courseName}${d.final ? ' · Final' : ''}` : 'Scorecard';
      cont.querySelector('.bd-btn__label')!.textContent = fromPause ? 'Back' : d?.final ? 'See Results' : 'Next Hole';
      if (d) body.append(scorecardTable(d));
      else body.append(h('p', { class: 'bd-note' }, 'No scores yet.'));
    },
  };
}

export function resultsScreen(ctx: UICtx): ScreenDef {
  const head = h('h1', { class: 'bd-results__title' });
  const podium = h('div', { class: 'bd-podium' });
  const notes = h('div', { class: 'bd-results__notes' });
  const again = btn('Play Again', () => ctx.emit('restart'), { icon: 'restart', kind: 'go', nav: 'again' });
  const menu = btn('Main Menu', () => ctx.emit('quit'), { icon: 'home', nav: 'menu' });
  const confetti = h('div', { class: 'bd-confetti', 'aria-hidden': 'true' });
  const colors = ['#ffc83d', '#20a4f3', '#ff5a5f', '#59c135', '#8b5cf6', '#ffffff'];
  for (let i = 0; i < 36; i++) {
    confetti.append(
      h('i', {
        style: `--x:${(i * 37) % 100}%;--d:${(i * 0.17) % 2.4}s;--t:${3 + ((i * 7) % 5) * 0.5}s;--c:${colors[i % colors.length]};--r:${(i * 47) % 360}deg`,
      }),
    );
  }
  const el = h(
    'div',
    { class: 'bd-screen bd-results' },
    confetti,
    h(
      'section',
      { class: 'bd-results__card' },
      h('div', { class: 'bd-results__trophy' }, icon('trophy')),
      head,
      podium,
      notes,
      h('div', { class: 'bd-results__btns' }, menu, again),
    ),
  );
  return {
    el,
    dim: true,
    first: () => again,
    show(data) {
      const d = (data as ResultsData | undefined) ?? { title: 'Round Complete', rows: [] };
      head.textContent = d.title;
      clear(podium);
      clear(notes);
      const rows = d.rows.slice(0, 4);
      podium.dataset.count = String(rows.length);
      // Podium order: 2nd, 1st, 3rd, 4th (single player: just 1st).
      const order = rows.length >= 2 ? [1, 0, 2, 3].filter((i) => i < rows.length) : [0];
      for (const i of order) {
        const r = rows[i];
        if (!r) continue;
        const look = ctx.state.lastSetup.players.find((p) => p.name === r.name)?.look;
        podium.append(
          h(
            'div',
            { class: `bd-step-pod is-${i + 1}${r.best ? ' is-best' : ''}`, style: `--pc:${r.color};--i:${order.indexOf(i)}` },
            h(
              'div',
              { class: 'bd-step-pod__who' },
              i === 0 ? h('span', { class: 'bd-step-pod__crown' }, icon('crown')) : null,
              h('div', { class: 'bd-step-pod__avatar', html: avatarSvg(look ?? { color: r.color, skin: '#f6c9a0', hair: '#5a3a22', hat: 'cap' }) }),
              h('div', { class: 'bd-step-pod__name' }, r.name),
              h('div', { class: 'bd-step-pod__value' }, r.value),
              r.sub ? h('div', { class: 'bd-step-pod__sub' }, r.sub) : null,
              r.best ? h('div', { class: 'bd-step-pod__badge' }, icon('sparkle'), 'New best!') : null,
            ),
            h('div', { class: 'bd-step-pod__block' }, String(i + 1)),
          ),
        );
      }
      for (const n of d.notes ?? []) notes.append(h('span', { class: 'bd-chip bd-chip--note' }, icon('sparkle'), n));
    },
  };
}
