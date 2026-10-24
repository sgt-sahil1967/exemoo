/** Inline SVG art for the UI: wordmark + icon set. Pure strings, no deps. */

let logoSeq = 0;

/** Citrus wheel half (used as the fruit motif in the wordmark). */
function citrusHalf(cx: number, cy: number, r: number, rot: number, clip: string): string {
  const seg: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    seg.push(
      `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * r * 0.74).toFixed(1)}" y2="${(cy + Math.sin(a) * r * 0.74).toFixed(1)}"/>`,
    );
  }
  return `<g transform="rotate(${rot} ${cx} ${cy})" clip-path="url(#${clip})">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ff8a3d" stroke="#3a2416" stroke-width="5"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.8}" fill="#ffe0a6"/>
    <g stroke="#ffb35c" stroke-width="3.2" stroke-linecap="round">${seg.join('')}</g>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.12}" fill="#fff4dc"/>
    <line x1="${cx - r - 3}" y1="${cy}" x2="${cx + r + 3}" y2="${cy}" stroke="#3a2416" stroke-width="5" stroke-linecap="round"/>
  </g>`;
}

/**
 * "TABLE SLICE" wordmark. The word SLICE is cut diagonally and the top half
 * slides off the cut, with a bright blade streak through the gap.
 */
export function logoSVG(): string {
  const p = `tsl${++logoSeq}`;
  const font = `font-family="'Arial Rounded MT Bold','Nunito','Trebuchet MS',system-ui,sans-serif" font-weight="900"`;
  // cut line: from (20,168) to (580,118)
  const slice = (fill: string, stroke: string, sw: number) =>
    `<text x="300" y="196" text-anchor="middle" ${font} font-size="128" textLength="500" lengthAdjust="spacingAndGlyphs"
       fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke">SLICE</text>`;
  return `<svg class="ts-logo-svg" viewBox="0 0 600 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Table Slice">
  <defs>
    <linearGradient id="${p}g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd85a"/><stop offset=".45" stop-color="#ff8a3d"/><stop offset="1" stop-color="#e8433a"/>
    </linearGradient>
    <linearGradient id="${p}b" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".25" stop-color="#fff" stop-opacity=".95"/>
      <stop offset=".8" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="${p}top"><polygon points="0,0 600,0 600,118 0,168"/></clipPath>
    <clipPath id="${p}bot"><polygon points="0,168 600,118 600,230 0,230"/></clipPath>
    <clipPath id="${p}c1"><rect x="0" y="0" width="600" height="62"/></clipPath>
    <clipPath id="${p}c2"><rect x="0" y="0" width="600" height="62"/></clipPath>
  </defs>
  <!-- TABLE -->
  <text x="300" y="80" text-anchor="middle" ${font} font-size="62" textLength="300" lengthAdjust="spacingAndGlyphs"
     fill="#3a2416" opacity=".55" transform="translate(0 6)">TABLE</text>
  <text x="300" y="80" text-anchor="middle" ${font} font-size="62" textLength="300" lengthAdjust="spacingAndGlyphs"
     fill="#f6ead2" stroke="#6b4426" stroke-width="10" stroke-linejoin="round" paint-order="stroke">TABLE</text>
  <!-- flying citrus halves -->
  ${citrusHalf(88, 62, 38, -24, `${p}c1`)}
  ${citrusHalf(512, 62, 38, 204, `${p}c2`)}
  <!-- SLICE: shadow, bottom half, top half (shifted along the cut) -->
  <g transform="translate(0 9)" opacity=".55">${slice('#1b1410', '#1b1410', 18)}</g>
  <g clip-path="url(#${p}bot)">${slice(`url(#${p}g)`, '#3a2416', 16)}</g>
  <g transform="translate(-10 -9) rotate(-1.2 300 140)"><g clip-path="url(#${p}top)">${slice(`url(#${p}g)`, '#3a2416', 16)}
    <text x="300" y="196" text-anchor="middle" ${font} font-size="128" textLength="500" lengthAdjust="spacingAndGlyphs"
       fill="none" stroke="#fff6dd" stroke-opacity=".45" stroke-width="3" transform="translate(-2 -4)">SLICE</text></g></g>
  <!-- blade streak -->
  <path d="M8 176 L592 112 L592 117 L8 182 Z" fill="url(#${p}b)" opacity=".95"/>
  <circle cx="560" cy="117" r="5" fill="#fff"/>
</svg>`;
}

const s = (body: string, vb = '0 0 24 24') =>
  `<svg viewBox="${vb}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ICONS = {
  gear: s(
    '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.6M12 18.9v2.6M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12h2.6M18.9 12h2.6M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/><circle cx="12" cy="12" r="6.6"/>',
  ),
  phone: s('<rect x="6.5" y="2.5" width="11" height="19" rx="2.6"/><path d="M10.5 18.3h3"/>'),
  qr: s(
    '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h3v3M21 14v.01M14 21h.01M17.5 21H21v-3.5"/>',
  ),
  shield: s(
    '<path d="M12 2.8 4.5 5.6v5.6c0 4.6 3.1 8.4 7.5 10 4.4-1.6 7.5-5.4 7.5-10V5.6z"/><path d="M12 8v4.4M12 15.6v.01"/>',
  ),
  sword: s(
    '<path d="M14.5 3.5h6v6L10 20l-3.2.8.8-3.2z"/><path d="M5.2 14.6l4.2 4.2M3.5 20.5l2.4-2.4"/>',
  ),
  pause: s('<path d="M8.5 5v14M15.5 5v14" stroke-width="3.4"/>'),
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4.8v14.4a1 1 0 0 0 1.5.86l11.4-7.2a1 1 0 0 0 0-1.72L9.5 3.94A1 1 0 0 0 8 4.8z" fill="currentColor"/></svg>',
  restart: s('<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 3.5v5h5"/>'),
  home: s('<path d="M3.5 11 12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5.5h4V20"/>'),
  target: s(
    '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"/>',
  ),
  back: s('<path d="M15 5 8 12l7 7"/>'),
  mouse: s('<rect x="6" y="3" width="12" height="18" rx="6"/><path d="M12 7v3.5"/>'),
  check: s('<path d="M5 12.5 10 17.5 19.5 7"/>'),
  snow: s(
    '<path d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6"/><path d="M9.3 4.3 12 6.6l2.7-2.3M9.3 19.7 12 17.4l2.7 2.3"/>',
  ),
  bolt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 2 4.8 13.4h6.1L9.8 22l9.4-12.2h-6.3z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  x2: '<svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="17" text-anchor="middle" font-size="14" font-weight="900" fill="currentColor" font-family="\'Arial Rounded MT Bold\',system-ui,sans-serif">×2</text></svg>',
  wifi: s('<path d="M2.5 9a14 14 0 0 1 19 0M5.8 12.6a9 9 0 0 1 12.4 0M9.2 16.1a4 4 0 0 1 5.6 0"/><path d="M12 19.6v.01" stroke-width="3.2"/>'),
  /** Watermelon slice used next to the score. */
  melon:
    '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M4 16a20 20 0 0 0 40 0z" fill="#6cc04a" stroke="#2f5a1c" stroke-width="2.5" stroke-linejoin="round"/><path d="M8.6 16a15.4 15.4 0 0 0 30.8 0z" fill="#ff5a4a"/><path d="M8.6 16h30.8" stroke="#fff3df" stroke-width="2"/><g fill="#2a1a12"><ellipse cx="17" cy="22" rx="1.4" ry="2.1" transform="rotate(-20 17 22)"/><ellipse cx="24" cy="25.5" rx="1.4" ry="2.1"/><ellipse cx="31" cy="22" rx="1.4" ry="2.1" transform="rotate(20 31 22)"/><ellipse cx="21" cy="30" rx="1.2" ry="1.8" transform="rotate(-10 21 30)"/><ellipse cx="27.5" cy="30" rx="1.2" ry="1.8" transform="rotate(10 27.5 30)"/></g></svg>',
  /** Thick X used for classic lives. */
  cross:
    '<svg viewBox="0 0 40 40" aria-hidden="true"><path class="x-shadow" d="M9 9l22 22M31 9 9 31" stroke-width="10" stroke-linecap="round"/><path class="x-main" d="M9 9l22 22M31 9 9 31" stroke-width="7" stroke-linecap="round"/></svg>',
};
