/** Flat inline-SVG illustrations for How to Play and Calibrate. All drawn in code. */
import { PALETTE as P } from '../core/contracts';

const SKIN = '#f3c6a5';
const SKIN_D = '#dea07c';
const SLEEVE = P.accent2;

/** A hand holding a phone upright, centred at (0,0), roughly 60×110. */
function handPhone(screen: string = P.accent): string {
  return `
  <rect x="-15" y="-52" width="30" height="58" rx="7" fill="${P.ink}"/>
  <rect x="-12" y="-48" width="24" height="49" rx="4.5" fill="${screen}"/>
  <circle cx="0" cy="-30" r="7" fill="#fff" fill-opacity=".35"/>
  <rect x="-21" y="-6" width="42" height="34" rx="14" fill="${SKIN}"/>
  <path d="M-19 4h22M-19 12h22M-18 20h20" stroke="${SKIN_D}" stroke-width="2.2" stroke-linecap="round"/>
  <rect x="10" y="-22" width="11" height="28" rx="5.5" fill="${SKIN}" transform="rotate(16 15 -8)"/>
  <rect x="-15" y="24" width="30" height="26" rx="6" fill="${SLEEVE}"/>`;
}

function tableEdge(y: number, w = 160): string {
  return `<rect x="8" y="${y}" width="${w - 16}" height="12" rx="4" fill="${P.table}"/>
  <rect x="8" y="${y + 12}" width="${w - 16}" height="5" rx="2" fill="${P.tableDark}"/>
  <path d="M${w / 2} ${y}v12" stroke="#fff" stroke-width="2"/>`;
}

const wrap = (body: string, cls = ''): string =>
  `<svg class="art ${cls}" viewBox="0 0 160 110" aria-hidden="true" focusable="false">${body}</svg>`;

export const HOWTO_ART = {
  hold: wrap(`
    <circle cx="80" cy="56" r="44" fill="${P.accent}" fill-opacity=".1"/>
    <g transform="translate(80 66) rotate(-12)">${handPhone()}</g>
    <path d="M118 30l10-8M122 44h12M42 30l-10-8" stroke="${P.gold}" stroke-width="3.5" stroke-linecap="round"/>`),
  swing: wrap(`
    <path d="M28 88 C 48 30, 98 18, 132 34" fill="none" stroke="${P.accent2}" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 10"/>
    <path d="M124 24l10 10-13 4" fill="none" stroke="${P.accent2}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(54 70) rotate(-30)">
      <rect x="-4" y="6" width="8" height="22" rx="4" fill="#d99a5b"/>
      <circle cx="0" cy="-8" r="17" fill="${P.accent}"/>
      <path d="M-11 -12a12 12 0 0 1 8 -9" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>
    <circle cx="104" cy="44" r="8" fill="${P.ball}" stroke="${P.ink}" stroke-width="2.5"/>
    <path d="M86 40h-12M88 50h-9" stroke="${P.ink}" stroke-opacity=".25" stroke-width="3" stroke-linecap="round"/>`),
  timing: wrap(`
    ${tableEdge(78)}
    <path d="M14 22 Q 50 10, 74 78 Q 96 20, 140 46" fill="none" stroke="${P.ink}" stroke-opacity=".25" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round"/>
    <circle cx="74" cy="72" r="5" fill="${P.ball}" stroke="${P.ink}" stroke-width="2" opacity=".55"/>
    <circle cx="122" cy="38" r="17" fill="${P.gold}" fill-opacity=".3"/>
    <circle cx="122" cy="38" r="17" fill="none" stroke="${P.gold}" stroke-width="3"/>
    <circle cx="122" cy="38" r="7" fill="${P.ball}" stroke="${P.ink}" stroke-width="2.5"/>
    <path d="M60 78l14 -6" stroke="none"/>`),
  spin: wrap(`
    <g transform="translate(46 54)">
      <g transform="rotate(30)"><rect x="-3.5" y="10" width="7" height="20" rx="3.5" fill="#d99a5b"/><ellipse cx="0" cy="-6" rx="9" ry="18" fill="${P.accent}"/></g>
      <circle cx="0" cy="-36" r="9" fill="${P.ball}" stroke="${P.ink}" stroke-width="2.5"/>
      <path d="M-15 -44 a 16 16 0 0 1 26 -6" fill="none" stroke="${P.good}" stroke-width="4" stroke-linecap="round"/>
      <path d="M8 -56l4 6-7 2" fill="none" stroke="${P.good}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <g transform="translate(116 54)">
      <g transform="rotate(-30)"><rect x="-3.5" y="10" width="7" height="20" rx="3.5" fill="#d99a5b"/><ellipse cx="0" cy="-6" rx="9" ry="18" fill="${P.accent}"/></g>
      <circle cx="0" cy="-36" r="9" fill="${P.ball}" stroke="${P.ink}" stroke-width="2.5"/>
      <path d="M15 -44 a 16 16 0 0 0 -26 -6" fill="none" stroke="${P.accent2}" stroke-width="4" stroke-linecap="round"/>
      <path d="M-8 -56l-4 6 7 2" fill="none" stroke="${P.accent2}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <text x="46" y="104" text-anchor="middle" class="art-lbl" fill="${P.ink}">TOP</text>
    <text x="116" y="104" text-anchor="middle" class="art-lbl" fill="${P.ink}">BACK</text>`),
  aim: wrap(`
    <path d="M22 96 L44 40 H116 L138 96 Z" fill="${P.table}"/>
    <path d="M80 40v56M33 68h94" stroke="#fff" stroke-width="2" stroke-opacity=".7"/>
    <path d="M44 40h72" stroke="${P.tableDark}" stroke-width="3"/>
    <ellipse cx="112" cy="54" rx="12" ry="6" fill="none" stroke="${P.gold}" stroke-width="3.5"/>
    <ellipse cx="112" cy="54" rx="4" ry="2" fill="${P.gold}"/>
    <path d="M46 92 Q 74 20, 110 52" fill="none" stroke="${P.gold}" stroke-width="3" stroke-dasharray="3 6" stroke-linecap="round"/>
    <g transform="translate(36 90) scale(.42) rotate(24)">${handPhone()}</g>`),
  serve: wrap(`
    ${tableEdge(84)}
    <path d="M52 70 V 22" stroke="${P.accent2}" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 8"/>
    <path d="M45 30l7 -9 7 9" fill="none" stroke="${P.accent2}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle class="art-toss" cx="52" cy="16" r="7" fill="${P.ball}" stroke="${P.ink}" stroke-width="2.5"/>
    <ellipse cx="52" cy="76" rx="13" ry="7" fill="${SKIN}"/>
    <path d="M70 16 Q 110 10, 118 84" fill="none" stroke="${P.ink}" stroke-opacity=".22" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round"/>
    <g transform="translate(112 50) rotate(20)"><rect x="-3.5" y="10" width="7" height="18" rx="3.5" fill="#d99a5b"/><circle cx="0" cy="-4" r="14" fill="${P.accent}"/></g>`),
} as const;

/** Calibrate illustration: phone held like a paddle, pointing at a screen. */
export const CALIBRATE_ART = `<svg class="art art-cal" viewBox="0 0 220 150" aria-hidden="true" focusable="false">
  <rect x="128" y="18" width="80" height="54" rx="8" fill="${P.ink}"/>
  <rect x="133" y="23" width="70" height="44" rx="5" fill="${P.table}"/>
  <path d="M168 23v44" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/>
  <path d="M158 80h20M168 72v8" stroke="${P.ink}" stroke-width="4" stroke-linecap="round"/>
  <circle class="cal-dot" cx="168" cy="45" r="5" fill="${P.gold}"/>
  <path class="cal-beam" d="M70 74 L160 45" stroke="${P.gold}" stroke-width="3" stroke-dasharray="4 7" stroke-linecap="round"/>
  <g class="cal-bob"><g transform="translate(58 100) rotate(62)">${handPhone()}</g></g>
</svg>`;
