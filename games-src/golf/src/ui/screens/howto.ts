/** How to Play: illustrated cards (inline SVG) for phone, mouse and keyboard. */
import { h, frag } from '../dom';
import type { ScreenDef, UICtx } from '../types';
import { btn, panel, seg } from '../widgets';

/** Keyboard shortcuts shown on the How to Play screen (keep in sync with src/input). */
export const KEY_HELP: [string, string][] = [
  ['Mouse', 'Hold button, drag down, flick up to swing'],
  ['Space (hold)', 'Arm the swing (same as SWING)'],
  ['← →', 'Aim left / right'],
  ['↑ ↓', 'Putter range (on the green)'],
  ['Q / E', 'Club down / up'],
  ['M', 'Map view'],
  ['R', 'Recenter the phone'],
  ['Esc / P', 'Pause'],
];

const INK = '#22303c';
const BLUE = '#20a4f3';
const GRASS = '#72c450';

const phone = (x: number, y: number, rot = 0, btnOn = false) => `
  <g transform="translate(${x} ${y}) rotate(${rot})">
    <rect x="-17" y="-34" width="34" height="68" rx="7" fill="#fff" stroke="${INK}" stroke-width="3"/>
    <rect x="-12" y="-27" width="24" height="44" rx="3" fill="#d8f0ff"/>
    <circle cx="0" cy="-2" r="8" fill="${btnOn ? BLUE : '#9fb3c0'}"/>
    <text x="0" y="1" text-anchor="middle" font-size="5.5" font-weight="900" fill="#fff" font-family="system-ui">SWING</text>
  </g>`;

const ILLOS: Record<string, string> = {
  hold: `<svg viewBox="0 0 200 120"><rect width="200" height="120" rx="14" fill="#e8f6ff"/>
    <ellipse cx="100" cy="112" rx="70" ry="6" fill="${GRASS}" opacity=".5"/>
    ${phone(100, 46)}
    <ellipse cx="100" cy="74" rx="16" ry="9" fill="#f6c9a0" stroke="${INK}" stroke-width="2.5"/>
    <ellipse cx="100" cy="86" rx="15" ry="8" fill="#f6c9a0" stroke="${INK}" stroke-width="2.5"/>
    <path d="M100 94 L100 104" stroke="${INK}" stroke-width="3" stroke-dasharray="3 4"/>
    <circle cx="112" cy="106" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/></svg>`,
  swing: `<svg viewBox="0 0 200 120"><rect width="200" height="120" rx="14" fill="#e8f6ff"/>
    <path d="M40 30 A70 70 0 0 0 160 30" fill="none" stroke="${BLUE}" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 10"/>
    <path d="M150 22 l12 6 -11 8" fill="none" stroke="${BLUE}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    ${phone(100, 64, 0, true)}
    <circle cx="100" cy="62" r="13" fill="none" stroke="${BLUE}" stroke-width="3" opacity=".5"/>
    <text x="100" y="114" text-anchor="middle" font-size="12" font-weight="900" fill="${INK}" font-family="system-ui">HOLD + SWING</text></svg>`,
  practice: `<svg viewBox="0 0 200 120"><rect width="200" height="120" rx="14" fill="#f2f6f8"/>
    <path d="M40 30 A70 70 0 0 0 160 30" fill="none" stroke="#9fb3c0" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 10"/>
    ${phone(100, 64, 0, false)}
    <text x="100" y="114" text-anchor="middle" font-size="12" font-weight="900" fill="#5b6b78" font-family="system-ui">NO BUTTON = PRACTICE</text></svg>`,
  aim: `<svg viewBox="0 0 200 120"><rect width="200" height="120" rx="14" fill="#e8f6ff"/>
    <path d="M150 104 L118 26 M150 104 L150 22 M150 104 L182 26" stroke="${GRASS}" stroke-width="4" stroke-dasharray="4 6" stroke-linecap="round"/>
    <circle cx="150" cy="104" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/>
    <g transform="translate(62 62)"><rect x="-12" y="-38" width="24" height="76" rx="6" fill="#fff" stroke="${INK}" stroke-width="3"/>
    <rect x="-38" y="-12" width="76" height="24" rx="6" fill="#fff" stroke="${INK}" stroke-width="3"/>
    <rect x="-10" y="-10" width="20" height="20" fill="#fff"/>
    <path d="M-30 0 l10 -8 v16z M30 0 l-10 -8 v16z" fill="${BLUE}"/><path d="M0 -30 l-8 10 h16z M0 30 l-8 -10 h16z" fill="#9fb3c0"/></g></svg>`,
  clubs: `<svg viewBox="0 0 200 120"><rect width="200" height="120" rx="14" fill="#e8f6ff"/>
    <g stroke="${INK}" stroke-width="4" stroke-linecap="round"><path d="M70 18 L58 86"/><path d="M100 18 L100 86"/><path d="M130 18 L142 86"/></g>
    <path d="M44 86 h22 a6 6 0 0 1 0 12 h-18z" fill="#5b6b78"/><path d="M92 84 h18 l-4 14 h-14z" fill="#9fb3c0"/><path d="M136 86 h18 l2 12 h-20z" fill="#c9d6de"/>
    <circle cx="28" cy="58" r="14" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M21 58 h14" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="172" cy="58" r="14" fill="${BLUE}"/><path d="M165 58 h14 M172 51 v14" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
  putt: `<svg viewBox="0 0 200 120"><rect width="200" height="120" rx="14" fill="#86d65e"/>
    <g fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2">
    <path d="M0 30 C60 18 140 42 200 28"/><path d="M0 52 C60 40 140 64 200 50"/><path d="M0 74 C60 62 140 86 200 72"/><path d="M0 96 C60 84 140 108 200 94"/>
    <path d="M40 0 C34 40 46 80 40 120"/><path d="M90 0 C84 40 96 80 90 120"/><path d="M140 0 C134 40 146 80 140 120"/></g>
    <path d="M58 92 C80 70 120 56 150 40" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>
    <ellipse cx="152" cy="38" rx="9" ry="5" fill="#1c3320"/><path d="M152 38 V6" stroke="#fff" stroke-width="2.5"/><path d="M152 6 l20 6 -20 6z" fill="#ff3b30"/>
    <circle cx="56" cy="94" r="5" fill="#fff" stroke="${INK}" stroke-width="1.5"/></svg>`,
  map: `<svg viewBox="0 0 200 120"><rect width="200" height="120" rx="14" fill="#3a7a2c"/>
    <path d="M86 112 C70 80 80 50 104 34 C116 26 130 22 132 14" fill="none" stroke="#72c450" stroke-width="26" stroke-linecap="round"/>
    <ellipse cx="128" cy="18" rx="18" ry="12" fill="#86d65e"/><ellipse cx="78" cy="60" rx="10" ry="7" fill="#f2dc9b"/>
    <circle cx="140" cy="70" r="14" fill="#3fa7e0"/><g fill="#2b5a22"><circle cx="40" cy="30" r="7"/><circle cx="52" cy="44" r="6"/><circle cx="160" cy="98" r="7"/></g>
    <circle cx="86" cy="104" r="4" fill="#fff"/><path d="M86 104 L118 26" stroke="#fff" stroke-width="2" stroke-dasharray="4 4"/>
    <path d="M128 18 V2" stroke="#fff" stroke-width="2"/><path d="M128 2 l10 4 -10 4z" fill="#ff3b30"/></svg>`,
  mouse: `<svg viewBox="0 0 200 120"><rect width="200" height="120" rx="14" fill="#e8f6ff"/>
    <g transform="translate(56 60)"><rect x="-22" y="-36" width="44" height="72" rx="22" fill="#fff" stroke="${INK}" stroke-width="3"/>
    <path d="M-22 -8 h44 M0 -36 v28" stroke="${INK}" stroke-width="3"/><path d="M-20 -10 V-14 a20 20 0 0 1 18 -20 V-10z" fill="${BLUE}"/></g>
    <path d="M120 20 V84" stroke="#9fb3c0" stroke-width="6" stroke-linecap="round"/><path d="M110 76 l10 12 10 -12" fill="none" stroke="#9fb3c0" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M160 96 V22" stroke="${BLUE}" stroke-width="6" stroke-linecap="round"/><path d="M150 32 l10 -12 10 12" fill="none" stroke="${BLUE}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="120" y="110" text-anchor="middle" font-size="10" font-weight="900" fill="#5b6b78" font-family="system-ui">DRAG</text>
    <text x="160" y="110" text-anchor="middle" font-size="10" font-weight="900" fill="${BLUE}" font-family="system-ui">FLICK</text></svg>`,
};

interface Card {
  illo: keyof typeof ILLOS;
  title: string;
  text: string;
}

const PHONE_CARDS: Card[] = [
  { illo: 'hold', title: 'Hold it like a club', text: 'Grip the phone with both hands, screen facing you, top pointing down at the ball.' },
  { illo: 'swing', title: 'Hold SWING and swing', text: 'Keep your thumb on SWING, take it back and swing through. Faster = farther.' },
  { illo: 'practice', title: 'Practice swings', text: 'Swing without the button to feel the power. The meter shows how far back you went.' },
  { illo: 'aim', title: 'Aim with the d-pad', text: 'Left / right turns your aim. The ring shows where a full shot lands.' },
  { illo: 'clubs', title: 'Change clubs', text: '− and + pick a club. Each one shows its full-power carry in yards.' },
  { illo: 'putt', title: 'Putting', text: 'On the green the grid shows slopes. Choose a putt range, then a gentle pendulum stroke.' },
];
const OTHER_CARDS: Card[] = [
  { illo: 'mouse', title: 'Mouse', text: 'Hold the button, drag down for the backswing, then flick up to hit. Release early to cancel.' },
  { illo: 'map', title: 'Map view', text: 'Press 1 / Map to look over the whole hole, wind and hazards before you play.' },
];

export function howtoScreen(ctx: UICtx): ScreenDef {
  const card = (c: Card) =>
    h('article', { class: 'bd-how' }, h('div', { class: 'bd-how__illo' }, frag(ILLOS[c.illo])), h('h3', null, c.title), h('p', null, c.text));
  const keys = h(
    'article',
    { class: 'bd-how bd-how--keys' },
    h('h3', null, 'Keyboard'),
    h('div', { class: 'bd-keys' }, ...KEY_HELP.map(([k, d]) => h('div', { class: 'bd-keys__row' }, h('kbd', null, k), h('span', null, d)))),
  );
  const phonePage = h('div', { class: 'bd-howgrid' }, ...PHONE_CARDS.map(card));
  const otherPage = h('div', { class: 'bd-howgrid bd-howgrid--other' }, ...OTHER_CARDS.map(card), keys);
  otherPage.hidden = true;
  const tabs = seg('tab', [{ value: 'phone', label: 'Phone', icon: 'phone' }, { value: 'other', label: 'Mouse & Keys', icon: 'mouse' }], 'phone', (v) => {
    phonePage.hidden = v !== 'phone';
    otherPage.hidden = v === 'phone';
    ctx.refocus();
  }, 'bd-seg--tabs');
  const back = btn('Got it!', () => ctx.go('title'), { icon: 'check', kind: 'primary', nav: 'done' });
  const el = h(
    'div',
    { class: 'bd-screen' },
    panel('How to Play', 'help', [tabs.el, phonePage, otherPage], [h('span', { class: 'bd-grow' }), back], 'bd-panel--wide'),
  );
  return { el, dim: true, first: () => back, back: () => ctx.go('title') };
}
