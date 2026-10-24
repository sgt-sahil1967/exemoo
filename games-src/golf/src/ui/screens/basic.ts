/** Loading, title, pause and stats screens + the phone-link chip. */
import type { GameMode, HoleSet } from '../../core/contracts';
import { h, frag, clear, fmtToPar } from '../dom';
import { logoSvg } from '../icons';
import type { ScreenDef, UICtx, UIState } from '../types';
import { btn, icon, panel, spinner } from '../widgets';

// ───────────────────────────── link chip ─────────────────────────────

/** Small status chip for the phone link. Returns element + updater. */
export function linkChip(onClick?: () => void): { el: HTMLElement; update(s: UIState): void } {
  const dot = h('span', { class: 'bd-chip__dot' });
  const ico = h('span', { class: 'bd-chip__ico' });
  const text = h('span', { class: 'bd-chip__text' });
  const el = onClick
    ? h('button', { type: 'button', class: 'bd-chip', 'data-nav': 'link-chip', onclick: onClick }, ico, dot, text)
    : h('div', { class: 'bd-chip' }, ico, dot, text);
  let lastKey = '';
  const update = (s: UIState) => {
    const { status, transport } = s.link;
    const key = `${status}|${transport}|${s.inputChoice}`;
    if (key === lastKey) return;
    lastKey = key;
    let tone = 'idle';
    let msg = 'Phone not connected';
    let ic: 'phone' | 'mouse' = 'phone';
    if (status === 'connected') {
      tone = 'ok';
      msg = `Phone connected${transport === 'webrtc' ? ' · WebRTC' : transport === 'relay' ? ' · Relay' : ''}`;
    } else if (status === 'pairing' || status === 'connecting') {
      tone = 'busy';
      msg = status === 'pairing' ? 'Pairing…' : 'Connecting…';
    } else if (status === 'disconnected') {
      tone = 'bad';
      msg = 'Phone disconnected';
    } else if (status === 'error') {
      tone = 'bad';
      msg = 'Link error';
    } else if (s.inputChoice === 'mouse') {
      ic = 'mouse';
      msg = 'Mouse mode';
    }
    el.dataset.tone = tone;
    clear(ico);
    ico.append(icon(ic));
    text.textContent = msg;
  };
  return { el, update };
}

// ───────────────────────────── loading ─────────────────────────────

export function loadingScreen(): ScreenDef {
  const msg = h('p', { class: 'bd-loading__msg' }, 'Loading…');
  const el = h(
    'div',
    { class: 'bd-screen bd-loading' },
    h('div', { class: 'bd-loading__inner' }, frag(logoSvg('bd-logo bd-logo--loading')), spinner(), msg),
  );
  return {
    el,
    show(data) {
      const m = (data as { message?: string } | undefined)?.message;
      msg.textContent = m ?? 'Loading the course…';
    },
  };
}

// ───────────────────────────── title ─────────────────────────────

export function titleScreen(ctx: UICtx): ScreenDef {
  const play = () => ctx.go('setup', { training: false });
  const training = () => ctx.go('setup', { training: true });
  const playBtn = btn('Play', play, { icon: 'play', kind: 'primary', size: 'lg', nav: 'play', cls: 'bd-title__play' });
  const chip = linkChip(() => ctx.go('connect'));
  const el = h(
    'div',
    { class: 'bd-screen bd-title' },
    h('div', { class: 'bd-title__sky' }),
    h(
      'div',
      { class: 'bd-title__stack' },
      h('div', { class: 'bd-title__logo' }, frag(logoSvg()), h('p', { class: 'bd-title__tag' }, 'Swing your phone. Sink the putt.')),
      h(
        'nav',
        { class: 'bd-title__menu' },
        playBtn,
        h(
          'div',
          { class: 'bd-title__grid' },
          btn('Training', training, { icon: 'target', nav: 'training' }),
          btn('How to Play', () => ctx.go('howto'), { icon: 'help', nav: 'howto' }),
          btn('Stats', () => ctx.go('stats'), { icon: 'trophy', nav: 'stats' }),
          btn('Settings', () => ctx.go('settings'), { icon: 'settings', nav: 'settings' }),
        ),
      ),
    ),
    h('div', { class: 'bd-title__corner' }, chip.el),
    h('div', { class: 'bd-title__hint' }, 'Use the phone’s d-pad, arrow keys or the mouse'),
  );
  return {
    el,
    first: () => playBtn,
    refresh: () => chip.update(ctx.state),
    show: () => chip.update(ctx.state),
  };
}

// ───────────────────────────── pause ─────────────────────────────

export function pauseScreen(ctx: UICtx): ScreenDef {
  const resume = btn('Resume', () => ctx.emit('resume'), { icon: 'play', kind: 'primary', nav: 'resume' });
  const recenter = btn('Recenter Club', () => ctx.emit('recenter'), { icon: 'recenter', nav: 'recenter' });
  const card = btn('Scorecard', () => ctx.go('scorecard', { fromPause: true }), { icon: 'card', nav: 'scorecard' });
  let quitArmed = 0;
  const quit = btn(
    'Quit to Title',
    () => {
      if (quitArmed) {
        clearTimeout(quitArmed);
        quitArmed = 0;
        ctx.emit('quit');
        return;
      }
      quit.classList.add('is-warn');
      quit.querySelector('.bd-btn__label')!.textContent = 'Press again to quit';
      quitArmed = window.setTimeout(resetQuit, 2600);
    },
    { icon: 'home', nav: 'quit' },
  );
  const resetQuit = () => {
    quitArmed = 0;
    quit.classList.remove('is-warn');
    quit.querySelector('.bd-btn__label')!.textContent = 'Quit to Title';
  };
  const el = h(
    'div',
    { class: 'bd-screen bd-pause' },
    panel(
      'Paused',
      'pause',
      [
        h(
          'div',
          { class: 'bd-stack' },
          resume,
          btn('Restart', () => ctx.emit('restart'), { icon: 'restart', nav: 'restart' }),
          recenter,
          card,
          btn('Settings', () => ctx.go('settings'), { icon: 'settings', nav: 'settings' }),
          quit,
        ),
      ],
      undefined,
      'bd-panel--narrow',
    ),
  );
  return {
    el,
    dim: true,
    first: () => resume,
    back: () => ctx.emit('resume'),
    show() {
      resetQuit();
      recenter.hidden = ctx.state.link.status !== 'connected';
      card.hidden = !ctx.state.scorecard;
    },
  };
}

// ───────────────────────────── stats ─────────────────────────────

const SET_LABEL: Record<HoleSet, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Expert',
  front9: 'Front 9',
};
const TRAIN_LABEL: Partial<Record<GameMode, [string, (v: number) => string]>> = {
  'training-putt': ['Putting', (v) => `${Math.round(v)} holed`],
  'training-approach': ['Approach', (v) => `${v.toFixed(1)} yd`],
  'training-drive': ['Long Drive', (v) => `${Math.round(v)} yd`],
};

export function statsScreen(ctx: UICtx): ScreenDef {
  const body = h('div', { class: 'bd-stats' });
  const backBtn = btn('Back', () => ctx.go('title'), { icon: 'back', nav: 'back' });
  const el = h('div', { class: 'bd-screen' }, panel('Career Stats', 'trophy', [body], [backBtn]));
  const tile = (value: string, name: string, cls = '') =>
    h('div', { class: `bd-tile ${cls}` }, h('div', { class: 'bd-tile__value' }, value), h('div', { class: 'bd-tile__name' }, name));
  const render = () => {
    const s = ctx.state.stats;
    clear(body);
    body.append(
      h(
        'div',
        { class: 'bd-tiles' },
        tile(String(s.roundsPlayed), 'Rounds played', 'is-blue'),
        tile(String(s.holesInOne), 'Holes in one', 'is-gold'),
        tile(String(s.eagles), 'Eagles'),
        tile(String(s.birdies), 'Birdies'),
        tile(s.longestDriveYds ? `${Math.round(s.longestDriveYds)} yd` : '—', 'Longest drive'),
        tile(s.longestPuttYds ? `${s.longestPuttYds.toFixed(1)} yd` : '—', 'Longest putt'),
      ),
      h(
        'div',
        { class: 'bd-stats__cols' },
        h(
          'div',
          { class: 'bd-list' },
          h('h3', null, icon('flag'), 'Best rounds'),
          ...(Object.keys(SET_LABEL) as HoleSet[]).map((k) =>
            h('div', { class: 'bd-list__row' }, h('span', null, SET_LABEL[k]), h('b', null, s.bestRound[k] === undefined ? '—' : fmtToPar(s.bestRound[k]!))),
          ),
        ),
        h(
          'div',
          { class: 'bd-list' },
          h('h3', null, icon('target'), 'Training bests'),
          ...Object.entries(TRAIN_LABEL).map(([k, [name, f]]) => {
            const v = s.trainingBest[k as GameMode];
            return h('div', { class: 'bd-list__row' }, h('span', null, name), h('b', null, v === undefined ? '—' : f(v)));
          }),
        ),
      ),
    );
  };
  return { el, dim: true, first: () => backBtn, back: () => ctx.go('title'), show: render, refresh: render };
}
