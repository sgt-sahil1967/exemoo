/** SPINSHOT logo: paddle + ball mark with a motion swoosh, and a rounded wordmark. */
import { PALETTE } from '../core/contracts';

const FONT = `ui-rounded, 'SF Pro Rounded', 'Nunito', 'Varela Round', system-ui, -apple-system, 'Segoe UI', sans-serif`;

/** The mark alone, in a 64×64 box. */
export function logoMarkSvg(size = 64, idPrefix = 'lm'): string {
  const g = `${idPrefix}g`;
  return `<svg class="logo-mark" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="${g}" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="${PALETTE.accent2}" stop-opacity="0"/>
      <stop offset=".55" stop-color="${PALETTE.accent2}" stop-opacity=".9"/>
      <stop offset="1" stop-color="${PALETTE.gold}"/>
    </linearGradient>
  </defs>
  <path d="M10 36 C 14 18, 28 9, 44 12" fill="none" stroke="url(#${g})" stroke-width="5" stroke-linecap="round"/>
  <path d="M17 41 C 22 27, 31 21, 41 20" fill="none" stroke="url(#${g})" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>
  <g transform="rotate(-38 26 38)">
    <rect x="22" y="45" width="8.5" height="17" rx="4.2" fill="#d99a5b"/>
    <rect x="22" y="52" width="8.5" height="10" rx="4.2" fill="#b97a3e"/>
    <circle cx="26.2" cy="35" r="15.5" fill="${PALETTE.accent}"/>
    <path d="M14.5 31 a 12 12 0 0 1 9 -9.5" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="3" stroke-linecap="round"/>
  </g>
  <circle cx="49" cy="13" r="7.2" fill="${PALETTE.ball}" stroke="${PALETTE.ink}" stroke-width="2.4"/>
  <path d="M45.8 10.6 a 4 4 0 0 1 3 -1.8" fill="none" stroke="${PALETTE.ink}" stroke-opacity=".25" stroke-width="1.6" stroke-linecap="round"/>
</svg>`;
}

/** Full logo: mark + wordmark. `stacked` puts the mark above the word. */
export function logoSvg(opts: { stacked?: boolean; tagline?: boolean } = {}): string {
  const word = (x: number, y: number, size: number, anchor: string): string =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT}" font-weight="900" font-size="${size}" letter-spacing="-1" transform="skewX(-7)">` +
    `<tspan fill="${PALETTE.ink}">SPIN</tspan><tspan fill="${PALETTE.accent}">SHOT</tspan></text>`;
  if (opts.stacked) {
    const tag = opts.tagline
      ? `<text x="180" y="224" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="12.5" letter-spacing="3" fill="${PALETTE.ink}" fill-opacity=".5">PHONE · PADDLE · TABLE TENNIS</text>`
      : '';
    return `<svg class="logo logo-stacked" viewBox="0 0 360 ${opts.tagline ? 232 : 204}" role="img" aria-label="Spinshot">
  <g transform="translate(121 0) scale(1.85)">${logoMarkSvg(64, 'ls').replace(/<svg[^>]*>/, '<g>').replace('</svg>', '</g>')}</g>
  ${word(203, 190, 72, 'middle')}
  ${tag}
</svg>`;
  }
  return `<svg class="logo logo-row" viewBox="0 0 300 64" role="img" aria-label="Spinshot">
  ${logoMarkSvg(64, 'lr').replace(/<svg[^>]*>/, '<g>').replace('</svg>', '</g>')}
  ${word(84, 47, 42, 'start')}
</svg>`;
}
