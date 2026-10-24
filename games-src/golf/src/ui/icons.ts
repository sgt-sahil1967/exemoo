/** Inline SVG icon set + the Birdie logo, all generated in code. Icons use currentColor. */

const S = (body: string, extra = '') =>
  `<svg class="bd-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${body}</svg>`;

export const ICONS = {
  play: S('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>'),
  club: S('<path d="M15.5 2.5 8.6 17.2"/><path d="M8.6 17.2c-.5 1.2-1.8 2.6-4 2.8-.9.1-1.4-.5-1-1.3l1.1-2.2c.4-.7 1.2-1 2-.8z" fill="currentColor"/><circle cx="18.5" cy="19.5" r="2" fill="currentColor" stroke="none"/>'),
  wind: S('<path d="M3 8h10.5a2.5 2.5 0 1 0-2.5-2.5"/><path d="M3 12h15.5a2.5 2.5 0 1 1-2.5 2.5"/><path d="M3 16h7"/>'),
  flag: S('<path d="M6 21V3"/><path d="M6 3.5 17.5 7 6 11" fill="currentColor"/><ellipse cx="7" cy="21" rx="4" ry="1.2"/>'),
  phone: S('<rect x="6.5" y="2" width="11" height="20" rx="2.6"/><path d="M10.5 18.5h3"/>'),
  mouse: S('<rect x="6" y="3" width="12" height="18" rx="6"/><path d="M12 7v3.5"/>'),
  settings: S('<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>'),
  pause: S('<rect x="6.5" y="5" width="3.6" height="14" rx="1.2" fill="currentColor"/><rect x="13.9" y="5" width="3.6" height="14" rx="1.2" fill="currentColor"/>', ''),
  map: S('<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20"/>'),
  trophy: S('<path d="M7 3.5h10v5a5 5 0 0 1-10 0z"/><path d="M7 5.5H4a3 3 0 0 0 3 4M17 5.5h3a3 3 0 0 1-3 4"/><path d="M12 13.5v3.5M8 21h8M9.5 17h5l.5 4h-6z"/>'),
  help: S('<circle cx="12" cy="12" r="9.5"/><path d="M9.3 9.2a2.8 2.8 0 1 1 3.8 2.6c-.7.3-1.1.9-1.1 1.6v.6"/><circle cx="12" cy="17.2" r="1.1" fill="currentColor" stroke="none"/>'),
  stats: S('<path d="M4 20V11M10 20V5M16 20v-7M21 20H3"/>'),
  back: S('<path d="M15 5 8 12l7 7"/>'),
  next: S('<path d="m9 5 7 7-7 7"/>'),
  check: S('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  x: S('<path d="M6 6l12 12M18 6 6 18"/>'),
  restart: S('<path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5"/><path d="M4 3.5v4.5h4.5"/>'),
  home: S('<path d="M3.5 11 12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5.5h4V20"/>'),
  card: S('<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M9 9v11M15 9v11"/>'),
  target: S('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>'),
  keyboard: S('<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M7.5 14h9"/>'),
  link: S('<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>'),
  plus: S('<path d="M12 5v14M5 12h14"/>'),
  minus: S('<path d="M5 12h14"/>'),
  left: S('<path d="M14.5 5.5 8 12l6.5 6.5"/>'),
  right: S('<path d="M9.5 5.5 16 12l-6.5 6.5"/>'),
  crown: S('<path d="M3.5 18 2.5 7l5.5 4.5L12 4l4 7.5L21.5 7l-1 11z" fill="currentColor"/>'),
  person: S('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  sparkle: S('<path d="M12 2.5c.7 4.6 2.9 6.8 7.5 7.5-4.6.7-6.8 2.9-7.5 7.5-.7-4.6-2.9-6.8-7.5-7.5 4.6-.7 6.8-2.9 7.5-7.5z" fill="currentColor"/>'),
  recenter: S('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/>'),
  volume: S('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  ball: S('<circle cx="12" cy="12" r="8.5"/><circle cx="9.5" cy="9.5" r=".8" fill="currentColor"/><circle cx="13" cy="8.5" r=".8" fill="currentColor"/><circle cx="10.5" cy="13" r=".8" fill="currentColor"/><circle cx="14.5" cy="12" r=".8" fill="currentColor"/>'),
  putter: S('<path d="M16 2.5 11 18"/><path d="M6 18h7.5a1.5 1.5 0 0 1 0 3H6z" fill="currentColor"/>'),
  grid: S('<path d="M3 8c6-3 12-3 18 0M3 13c6-3 12-3 18 0M3 18c6-3 12-3 18 0"/><path d="M8 4v16M16 4v16" opacity=".5"/>'),
} as const;

export type IconName = keyof typeof ICONS;

/** The Birdie wordmark: golf ball + rounded word + planted flag. */
export function logoSvg(cls = 'bd-logo'): string {
  return `<svg class="${cls}" viewBox="0 0 640 220" role="img" aria-label="Birdie">
  <defs>
    <linearGradient id="bdLogoFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5cc8ff"/><stop offset=".55" stop-color="#20a4f3"/><stop offset="1" stop-color="#1281cc"/>
    </linearGradient>
    <radialGradient id="bdBall" cx=".35" cy=".3" r=".75">
      <stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#eef3f6"/><stop offset="1" stop-color="#c9d6de"/>
    </radialGradient>
    <linearGradient id="bdFlag" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ff5a4f"/><stop offset="1" stop-color="#e5322a"/>
    </linearGradient>
    <filter id="bdLogoShadow" x="-10%" y="-10%" width="120%" height="140%">
      <feDropShadow dx="0" dy="7" stdDeviation="6" flood-color="#0b3a5c" flood-opacity=".32"/>
    </filter>
  </defs>
  <g filter="url(#bdLogoShadow)">
    <ellipse cx="120" cy="196" rx="440" ry="10" fill="#0b3a5c" opacity=".0"/>
    <!-- flag -->
    <g class="bd-logo__flag">
      <rect x="566" y="22" width="9" height="168" rx="4.5" fill="#ffffff" stroke="#1281cc" stroke-width="4"/>
      <path class="bd-logo__cloth" d="M575 26 C 605 30, 615 44, 640 40 L 628 64 L 640 88 C 615 92, 600 80, 575 84 Z" fill="url(#bdFlag)" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
    </g>
    <!-- wordmark -->
    <text x="330" y="168" text-anchor="middle" font-family="Nunito, 'Varela Round', ui-rounded, 'SF Pro Rounded', system-ui, sans-serif"
      font-weight="900" font-size="168" letter-spacing="-4" fill="url(#bdLogoFill)" stroke="#ffffff" stroke-width="18"
      stroke-linejoin="round" paint-order="stroke">Birdie</text>
    <!-- ball -->
    <g class="bd-logo__ball">
      <circle cx="58" cy="150" r="40" fill="url(#bdBall)" stroke="#ffffff" stroke-width="7"/>
      <g fill="#b9c8d2" opacity=".85">
        <circle cx="44" cy="134" r="4"/><circle cx="60" cy="128" r="4"/><circle cx="75" cy="137" r="4"/>
        <circle cx="38" cy="150" r="4"/><circle cx="54" cy="146" r="4"/><circle cx="70" cy="152" r="4"/>
        <circle cx="46" cy="165" r="4"/><circle cx="62" cy="166" r="4"/><circle cx="78" cy="166" r="3.5"/>
      </g>
    </g>
  </g>
</svg>`;
}
