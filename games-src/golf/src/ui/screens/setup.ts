/** Game setup: mode, hole set, players (name + look), wind, handedness. Emits start(setup). */
import type { GameMode, GameSetup, GolferLook, Handedness, HoleSet, PlayerSetup } from '../../core/contracts';
import { PLAYER_COLORS } from '../../core/contracts';
import { h } from '../dom';
import { avatarSvg, HAIR_COLORS, HATS, SHIRT_COLORS, SKIN_TONES } from '../avatar';
import type { ScreenDef, UICtx } from '../types';
import { btn, icon, label, panel, seg } from '../widgets';
import { linkChip } from './basic';

const SETUP_KEY = 'birdie.setup.v1';

export function defaultPlayer(i: number): PlayerSetup {
  return {
    name: `Player ${i + 1}`,
    look: {
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      skin: SKIN_TONES[[1, 0, 3, 2][i % 4]],
      hair: HAIR_COLORS[[0, 3, 1, 4][i % 4]],
      hat: (['cap', 'visor', 'none', 'cap'] as const)[i % 4],
    },
  };
}

export function defaultSetup(): GameSetup {
  return { mode: 'round', holes: 'beginner', players: [defaultPlayer(0)], wind: 'normal' };
}

/** Last setup from localStorage (validated), else defaults. */
export function loadSetup(): GameSetup {
  try {
    const raw = localStorage.getItem(SETUP_KEY);
    if (!raw) return defaultSetup();
    const s = JSON.parse(raw) as GameSetup;
    if (!s || !Array.isArray(s.players) || !s.players.length) return defaultSetup();
    const d = defaultSetup();
    return {
      mode: (['round', 'training-putt', 'training-approach', 'training-drive'] as GameMode[]).includes(s.mode) ? s.mode : d.mode,
      holes: (['beginner', 'intermediate', 'expert', 'front9'] as HoleSet[]).includes(s.holes) ? s.holes : d.holes,
      wind: (['calm', 'normal', 'strong'] as const).includes(s.wind) ? s.wind : d.wind,
      players: s.players.slice(0, 4).map((p, i) => ({
        name: String(p?.name ?? '').slice(0, 12) || defaultPlayer(i).name,
        look: { ...defaultPlayer(i).look, ...(p?.look ?? {}) },
      })),
    };
  } catch {
    return defaultSetup();
  }
}

function saveSetup(s: GameSetup) {
  try {
    localStorage.setItem(SETUP_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
}

const SET_RANGE: Record<HoleSet, [number, number]> = {
  beginner: [1, 3],
  intermediate: [4, 6],
  expert: [7, 9],
  front9: [1, 9],
};

const SET_DEFAULT: Record<HoleSet, [string, string]> = {
  beginner: ['Beginner', 'Holes 1–3'],
  intermediate: ['Intermediate', 'Holes 4–6'],
  expert: ['Expert', 'Holes 7–9'],
  front9: ['Front 9', 'Holes 1–9'],
};

export function setupScreen(ctx: UICtx): ScreenDef {
  let setup = ctx.state.lastSetup;
  let count = setup.players.length;
  const players: PlayerSetup[] = [0, 1, 2, 3].map((i) => {
    const p = setup.players[i];
    return p ? { name: p.name, look: { ...p.look } } : defaultPlayer(i);
  });

  // ── left column ──
  const mode = seg<GameMode>(
    'mode',
    [
      { value: 'round', label: 'Round', sub: 'Stroke play', icon: 'flag' },
      { value: 'training-putt', label: 'Putting', sub: 'Sink putts', icon: 'putter' },
      { value: 'training-approach', label: 'Approach', sub: 'Closest to pin', icon: 'target' },
      { value: 'training-drive', label: 'Long Drive', sub: 'Longest drive', icon: 'club' },
    ],
    setup.mode,
    (v) => {
      setup = { ...setup, mode: v };
      syncMode();
    },
    'bd-seg--grid bd-seg--mode',
  );
  const holeOpts = () =>
    (Object.keys(SET_DEFAULT) as HoleSet[]).map((k) => {
      const [a, b] = SET_RANGE[k];
      const rows = ctx.state.courseSummary.filter((r) => r.number >= a && r.number <= b);
      const par = rows.reduce((t, r) => t + r.par, 0);
      const yds = rows.reduce((t, r) => t + r.yards, 0);
      const sub = rows.length ? `${SET_DEFAULT[k][1]}\nPar ${par} · ${Math.round(yds).toLocaleString()} yd` : SET_DEFAULT[k][1];
      return { value: k, label: SET_DEFAULT[k][0], sub };
    });
  let holes = seg<HoleSet>('holes', holeOpts(), setup.holes, (v) => (setup = { ...setup, holes: v }), 'bd-seg--grid bd-seg--holes');
  const holesWrap = h('div', { class: 'bd-setup__holes' }, label('Course', 'flag'), holes.el);
  const trainNote = h('p', { class: 'bd-note' }, 'Training is played on the practice range — no hole set needed.');
  const wind = seg<GameSetup['wind']>(
    'wind',
    [
      { value: 'calm', label: 'Calm' },
      { value: 'normal', label: 'Breezy' },
      { value: 'strong', label: 'Windy' },
    ],
    setup.wind,
    (v) => (setup = { ...setup, wind: v }),
  );
  const hand = seg<Handedness>(
    'hand',
    [
      { value: 'right', label: 'Right-handed' },
      { value: 'left', label: 'Left-handed' },
    ],
    ctx.state.settings.handedness,
    (v) => ctx.setSettings({ ...ctx.state.settings, handedness: v }),
  );
  const syncMode = () => {
    const round = setup.mode === 'round';
    holesWrap.classList.toggle('is-hidden', !round);
    trainNote.hidden = round;
    ctx.refocus();
  };

  // ── players ──
  const countLabel = h('b', { class: 'bd-count__n' });
  const minus = btn('', () => setCount(count - 1), { icon: 'minus', nav: 'p-minus', size: 'sm', cls: 'bd-btn--round', title: 'Fewer players' });
  const plus = btn('', () => setCount(count + 1), { icon: 'plus', nav: 'p-plus', size: 'sm', cls: 'bd-btn--round', title: 'More players' });
  const cards = players.map((p, i) => playerCard(p, i));
  const addCard = h(
    'button',
    { type: 'button', class: 'bd-addp', 'data-nav': 'p-add', onclick: () => setCount(count + 1) },
    icon('plus'),
    h('span', null, 'Add Player'),
  );
  const grid = h('div', { class: 'bd-players' }, ...cards.map((c) => c.el), addCard);
  const setCount = (n: number) => {
    count = Math.max(1, Math.min(4, n));
    countLabel.textContent = String(count);
    minus.disabled = count <= 1;
    plus.disabled = count >= 4;
    cards.forEach((c, i) => {
      c.el.hidden = i >= count;
    });
    grid.dataset.count = String(count);
    addCard.hidden = count >= 4;
    ctx.refocus();
  };

  function playerCard(p: PlayerSetup, i: number) {
    const av = h('div', { class: 'bd-pcard__avatar' });
    const tag = h('span', { class: 'bd-pcard__tag' }, `P${i + 1}`);
    const name = h('input', {
      class: 'bd-input',
      type: 'text',
      maxlength: 12,
      value: p.name,
      'data-nav': `p${i}-name`,
      'aria-label': `Player ${i + 1} name`,
      spellcheck: 'false',
      oninput: () => {
        p.name = name.value;
      },
      onkeydown: (e: KeyboardEvent) => {
        e.stopPropagation();
        if (e.key === 'Enter' || e.key === 'Escape') name.blur();
      },
    });
    const swatchRow = (key: keyof GolferLook, colors: readonly string[], cls = '') =>
      h(
        'div',
        { class: `bd-swatches ${cls}` },
        ...colors.map((c) =>
          h('button', {
            type: 'button',
            class: 'bd-swatch',
            style: `--c:${c}`,
            'data-nav': `p${i}-${key}-${c}`,
            'data-v': c,
            'aria-label': `${key} ${c}`,
            onclick: () => {
              (p.look as unknown as Record<string, string>)[key] = c;
              paint();
            },
          }),
        ),
      );
    const shirts = swatchRow('color', SHIRT_COLORS, 'bd-swatches--shirt');
    const skins = swatchRow('skin', SKIN_TONES);
    const hairs = swatchRow('hair', HAIR_COLORS);
    const hatBtn = h(
      'button',
      {
        type: 'button',
        class: 'bd-hat',
        'data-nav': `p${i}-hat`,
        onclick: () => {
          p.look.hat = HATS[(HATS.indexOf(p.look.hat) + 1) % HATS.length];
          paint();
        },
      },
      h('span', { class: 'bd-hat__k' }, 'Hat'),
      h('b', { class: 'bd-hat__v' }),
      icon('next'),
    );
    const paint = () => {
      av.innerHTML = avatarSvg(p.look);
      el.style.setProperty('--pc', p.look.color === '#ffffff' ? '#9fb3c0' : p.look.color);
      for (const [row, v] of [[shirts, p.look.color], [skins, p.look.skin], [hairs, p.look.hair]] as const)
        row.querySelectorAll<HTMLElement>('.bd-swatch').forEach((s) => s.classList.toggle('is-on', s.dataset.v === v));
      hatBtn.querySelector('.bd-hat__v')!.textContent = p.look.hat === 'none' ? 'None' : p.look.hat === 'cap' ? 'Cap' : 'Visor';
    };
    const el = h(
      'div',
      { class: 'bd-pcard' },
      h('div', { class: 'bd-pcard__left' }, av, tag),
      h(
        'div',
        { class: 'bd-pcard__right' },
        h('div', { class: 'bd-pcard__row' }, name, hatBtn),
        h('div', { class: 'bd-pcard__row' }, h('span', { class: 'bd-mini' }, 'Shirt'), shirts),
        h('div', { class: 'bd-pcard__row' }, h('span', { class: 'bd-mini' }, 'Skin'), skins),
        h('div', { class: 'bd-pcard__row' }, h('span', { class: 'bd-mini' }, 'Hair'), hairs),
      ),
    );
    paint();
    return { el, paint };
  }

  const tee = btn('Tee Off!', () => {
    const out: GameSetup = {
      ...setup,
      players: players.slice(0, count).map((p, i) => ({ name: p.name.trim() || `Player ${i + 1}`, look: { ...p.look } })),
    };
    ctx.state.lastSetup = out;
    saveSetup(out);
    ctx.emit('start', out);
  }, { icon: 'flag', kind: 'go', size: 'lg', nav: 'tee' });
  const back = btn('Back', () => ctx.go('title'), { icon: 'back', nav: 'back', kind: 'ghost' });
  const chip = linkChip(() => ctx.go('connect'));

  const left = h(
    'div',
    { class: 'bd-setup__left' },
    label('Mode', 'club'),
    mode.el,
    holesWrap,
    trainNote,
    label('Wind', 'wind'),
    wind.el,
    label('Golfer', 'person'),
    hand.el,
  );
  const right = h(
    'div',
    { class: 'bd-setup__right' },
    h('div', { class: 'bd-setup__phead' }, label('Players', 'person'), h('div', { class: 'bd-count' }, minus, countLabel, plus)),
    grid,
  );
  const el = h(
    'div',
    { class: 'bd-screen' },
    panel('Game Setup', 'flag', [h('div', { class: 'bd-setup' }, left, right)], [back, chip.el, h('span', { class: 'bd-grow' }), tee], 'bd-panel--wide bd-panel--setup'),
  );
  setCount(count);
  syncMode();
  let summaryKey = JSON.stringify(ctx.state.courseSummary);

  return {
    el,
    dim: true,
    first: () => tee,
    back: () => ctx.go('title'),
    show(data) {
      const t = (data as { training?: boolean } | undefined)?.training;
      if (t === true && setup.mode === 'round') {
        const last = ctx.state.lastSetup.mode;
        setup = { ...setup, mode: last.startsWith('training') ? last : 'training-putt' };
      } else if (t === false) setup = { ...setup, mode: 'round' };
      mode.set(setup.mode);
      hand.set(ctx.state.settings.handedness);
      syncMode();
      chip.update(ctx.state);
    },
    refresh() {
      chip.update(ctx.state);
      hand.set(ctx.state.settings.handedness);
      const key = JSON.stringify(ctx.state.courseSummary);
      if (key === summaryKey) return;
      summaryKey = key;
      const fresh = seg<HoleSet>('holes', holeOpts(), setup.holes, (v) => (setup = { ...setup, holes: v }), 'bd-seg--grid bd-seg--holes');
      holes.el.replaceWith(fresh.el);
      holes = fresh;
    },
  };
}
