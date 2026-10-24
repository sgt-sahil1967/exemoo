/** Mii-like golfer avatar preview drawn as inline SVG from a GolferLook. */
import type { GolferLook } from '../core/contracts';
import { PLAYER_COLORS } from '../core/contracts';

/** Shirt colours offered in setup (player colours first). */
export const SHIRT_COLORS: readonly string[] = [...PLAYER_COLORS, '#22c55e', '#f97316', '#ec4899', '#14b8a6', '#ffffff', '#334155'];
export const SKIN_TONES: readonly string[] = ['#ffe0c4', '#f6c9a0', '#e2a678', '#c68a5a', '#9a6440', '#6b4428'];
export const HAIR_COLORS: readonly string[] = ['#2b1d14', '#5a3a22', '#a0662f', '#e0b45a', '#c8452c', '#9aa3ab'];
export const HATS: readonly GolferLook['hat'][] = ['none', 'cap', 'visor'];

/** Darken/lighten a #rrggbb colour by `amt` (−1…1). */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  r = Math.round((t - r) * p + r);
  g = Math.round((t - g) * p + g);
  b = Math.round((t - b) * p + b);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** Readable text colour on top of `hex`. */
export function inkOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const l = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return l > 170 ? '#22303c' : '#ffffff';
}

export function avatarSvg(look: GolferLook): string {
  const shirt = look.color;
  const shirtD = shade(shirt, -0.22);
  const skin = look.skin;
  const skinD = shade(skin, -0.15);
  const hair = look.hair;
  const hatC = look.color === '#ffffff' ? '#20a4f3' : shirt;
  const hatD = shade(hatC, -0.25);
  const hairBack = look.hat === 'cap'
    ? ''
    : `<path d="M30 52c-2-20 10-32 30-32s32 12 30 32c-4-8-10-12-16-13-8 6-22 8-36 6-4 2-6 4-8 7z" fill="${hair}"/>`;
  const hairSide = `<path d="M31 56c-3-6-2-12 1-16l4 2c-2 4-2 9-1 14zM89 56c3-6 2-12-1-16l-4 2c2 4 2 9 1 14z" fill="${hair}"/>`;
  let hat = '';
  if (look.hat === 'cap') {
    hat = `<path d="M30 48c0-17 13-28 30-28s30 11 30 28z" fill="${hatC}"/>
      <path d="M60 20c3 0 4 2 4 3s-1 2-4 2-4-1-4-2 1-3 4-3z" fill="${hatD}"/>
      <path d="M58 46h40c4 0 5 5 0 6-12 3-28 2-40-1z" fill="${hatD}"/>
      <path d="M30 48h60" stroke="${hatD}" stroke-width="3"/>`;
  } else if (look.hat === 'visor') {
    hat = `<path d="M30 44c8-4 52-4 60 0v6c-8-3-52-3-60 0z" fill="${hatC}"/>
      <path d="M56 47h40c4 0 5 5 0 6-12 3-28 2-40-1z" fill="${hatD}"/>`;
  }
  return `<svg class="bd-avatar" viewBox="0 0 120 130" aria-hidden="true">
    <ellipse cx="60" cy="124" rx="34" ry="5" fill="#0b2a40" opacity=".12"/>
    <path d="M22 124c0-24 16-38 38-38s38 14 38 38z" fill="${shirt}" stroke="${shirtD}" stroke-width="3"/>
    <path d="M48 88l12 12 12-12" fill="#ffffff" stroke="${shirtD}" stroke-width="3" stroke-linejoin="round"/>
    <rect x="52" y="74" width="16" height="16" rx="6" fill="${skinD}"/>
    ${hairBack}
    <ellipse cx="60" cy="56" rx="28" ry="30" fill="${skin}"/>
    <ellipse cx="32" cy="60" rx="5" ry="7" fill="${skinD}"/><ellipse cx="88" cy="60" rx="5" ry="7" fill="${skinD}"/>
    ${look.hat === 'cap' ? '' : hairSide}
    <ellipse cx="49" cy="60" rx="3.6" ry="4.6" fill="#22303c"/><ellipse cx="71" cy="60" rx="3.6" ry="4.6" fill="#22303c"/>
    <circle cx="50.2" cy="58.4" r="1.2" fill="#fff"/><circle cx="72.2" cy="58.4" r="1.2" fill="#fff"/>
    <path d="M44 51q5-3 10 0M66 51q5-3 10 0" stroke="${hair}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M51 72q9 7 18 0" stroke="#7a3b2a" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <ellipse cx="42" cy="69" rx="4.5" ry="2.6" fill="#ff8a8a" opacity=".35"/><ellipse cx="78" cy="69" rx="4.5" ry="2.6" fill="#ff8a8a" opacity=".35"/>
    ${look.hat === 'visor' ? `<path d="M31 44c4-14 16-22 29-22s25 8 29 22c-10-6-48-6-58 0z" fill="${hair}"/>` : ''}
    ${look.hat === 'none' ? `<path d="M32 50c1-18 13-28 28-28s27 10 28 28c-5-7-11-10-17-11-7 5-21 8-39 11z" fill="${hair}"/>` : ''}
    ${hat}
  </svg>`;
}
