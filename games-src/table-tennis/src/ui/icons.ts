/**
 * Hand-drawn inline SVG icon set (24×24, round strokes, currentColor).
 * Every icon is authored here — no icon fonts or external assets.
 */

const S = (body: string, extra = ''): string =>
  `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" ${extra}>${body}</svg>`;

export const ICONS = {
  play: S('<path d="M8 5.6v12.8c0 .8.9 1.3 1.6.9l10-6.4c.6-.4.6-1.3 0-1.7l-10-6.4C8.9 4.3 8 4.8 8 5.6z" fill="currentColor" stroke="none"/>'),
  target: S('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>'),
  trophy: S('<path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 6H4.5v1.5A3 3 0 0 0 7.5 10.5M17 6h2.5v1.5a3 3 0 0 1-3 3"/><path d="M12 14v3.5M8.5 20h7M9.5 17.5h5"/>'),
  phone: S('<rect x="6.5" y="2.8" width="11" height="18.4" rx="2.6"/><path d="M10.5 17.6h3"/>'),
  sliders: S('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>'),
  chart: S('<path d="M5 20V12M10 20V6M15 20v-9M20 20V4" />'),
  help: S('<circle cx="12" cy="12" r="9"/><path d="M9.4 9.3a2.7 2.7 0 0 1 5.2 1c0 1.9-2.6 2.3-2.6 3.9"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/>'),
  back: S('<path d="M15 5l-7 7 7 7"/>'),
  arrowRight: S('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  pause: S('<rect x="6.5" y="5" width="3.8" height="14" rx="1.4" fill="currentColor" stroke="none"/><rect x="13.7" y="5" width="3.8" height="14" rx="1.4" fill="currentColor" stroke="none"/>'),
  recenter: S('<circle cx="12" cy="12" r="6.5"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>'),
  home: S('<path d="M4 11l8-6.5 8 6.5"/><path d="M6.5 9.5V19a1 1 0 0 0 1 1h3v-5h3v5h3a1 1 0 0 0 1-1V9.5"/>'),
  mouse: S('<rect x="6.5" y="3" width="11" height="18" rx="5.5"/><path d="M12 6.5v3.2"/>'),
  check: S('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  star: S('<path d="M12 3.4l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.8l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" fill="currentColor" stroke-width="1.4"/>'),
  starEmpty: S('<path d="M12 3.4l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.8l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" stroke-width="1.8"/>'),
  signal: S('<path d="M5 19v-2M9.5 19v-5M14 19v-8M18.5 19V6"/>'),
  refresh: S('<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/>'),
  volume: S('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke-width="1.6"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  music: S('<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'),
  monitor: S('<rect x="3" y="4.5" width="18" height="12" rx="2.2"/><path d="M9 20h6M12 16.5V20"/>'),
  gamepad: S('<path d="M7 8h10a4 4 0 0 1 3.9 4.9l-.9 4a2.4 2.4 0 0 1-4.2.9L14 16h-4l-1.8 1.8a2.4 2.4 0 0 1-4.2-.9l-.9-4A4 4 0 0 1 7 8z"/><path d="M8 11v3M6.5 12.5h3"/><circle cx="16" cy="12" r=".7" fill="currentColor"/>'),
  ball: S('<circle cx="12" cy="12" r="7.5" fill="currentColor" stroke="none"/>'),
  paddle: S('<circle cx="10" cy="9.5" r="6.5" fill="currentColor" stroke="none"/><path d="M14 14.5l5 5" stroke-width="3.2"/>'),
  flame: S('<path d="M12 21c-3.8 0-6.5-2.6-6.5-6.2 0-3.4 2.6-5.2 3.6-8.8 1.9 1.4 2.7 3.2 2.7 4.8 1-.6 1.6-1.6 1.8-2.9 2.2 1.8 2.9 4.4 2.9 6.9 0 3.6-2.7 6.2-4.5 6.2z"/>'),
  bolt: S('<path d="M13 2.8L5.5 13.2h5.6L10 21.2l8.5-11h-5.8z" fill="currentColor" stroke-width="1.4"/>'),
  close: S('<path d="M6 6l12 12M18 6L6 18"/>'),
  user: S('<circle cx="12" cy="8.5" r="3.8"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/>'),
  hand: S('<path d="M8 12V6.2a1.6 1.6 0 0 1 3.2 0V11M11.2 10.5V4.8a1.6 1.6 0 0 1 3.2 0v5.7M14.4 10.5V6.2a1.6 1.6 0 0 1 3.2 0v7.3a7 7 0 0 1-7 7h-.4a6 6 0 0 1-4.6-2.2l-3-3.7a1.6 1.6 0 0 1 2.4-2.1L8 14"/>'),
  trash: S('<path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l.9 12.2a1 1 0 0 0 1 .8h7.2a1 1 0 0 0 1-.8L17.5 7"/>'),
  clock: S('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  percent: S('<path d="M18.5 5.5l-13 13"/><circle cx="7" cy="7" r="2.3"/><circle cx="17" cy="17" r="2.3"/>'),
  rally: S('<path d="M4 16c2.5-6 5-6 8 0s5.5 6 8 0"/><circle cx="4" cy="16" r="1.4" fill="currentColor"/><circle cx="20" cy="16" r="1.4" fill="currentColor"/>'),
  ace: S('<path d="M12 3l2.2 5.8L20 9.5l-4.5 3.8L17 19.5 12 16l-5 3.5 1.5-6.2L4 9.5l5.8-.7z"/>'),
  medal: S('<path d="M8 3h8l-2.5 6h-3z"/><circle cx="12" cy="15" r="5.5"/><path d="M12 12.5v5"/>'),
  wifi: S('<path d="M3.5 9.5a12 12 0 0 1 17 0M6.5 12.7a7.6 7.6 0 0 1 11 0M9.6 15.8a3.2 3.2 0 0 1 4.8 0"/><circle cx="12" cy="19" r=".9" fill="currentColor"/>'),
  qr: S('<rect x="4" y="4" width="6" height="6" rx="1.2"/><rect x="14" y="4" width="6" height="6" rx="1.2"/><rect x="4" y="14" width="6" height="6" rx="1.2"/><path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5z" fill="currentColor"/>'),
  versus: S('<circle cx="7.5" cy="8.5" r="4" fill="currentColor" stroke="none"/><path d="M10.4 11.4L13 14" stroke-width="2.6"/><circle cx="16.5" cy="15.5" r="4" fill="currentColor" stroke="none" opacity=".55"/><path d="M13.6 12.6L11 10" stroke-width="2.6" opacity=".55"/>'),
  keyboard: S('<rect x="2.5" y="6" width="19" height="12" rx="2.4"/><path d="M6 10h.01M9.3 10h.01M12.6 10h.01M15.9 10h.01M18 10h.01M7.5 14h9"/>'),
} as const;

export type IconName = keyof typeof ICONS;

/** Returns a `<span class="ico">` holding the requested icon. */
export function icon(name: IconName, cls = ''): HTMLSpanElement {
  const s = document.createElement('span');
  s.className = `ico ${cls}`.trim();
  s.innerHTML = ICONS[name];
  return s;
}
