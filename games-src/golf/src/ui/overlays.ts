/** Banners (springy centred text), toasts and floating world markers. */
import { h } from './dom';
import { ICONS } from './icons';

export type BannerKind = 'info' | 'good' | 'great' | 'bad';

export class Overlays {
  readonly bannerLayer = h('div', { class: 'bd-banners', 'aria-live': 'polite' });
  readonly toastLayer = h('div', { class: 'bd-toasts', 'aria-live': 'polite' });
  readonly markerLayer = h('div', { class: 'bd-markers' });
  private current: HTMLElement | null = null;
  private timer = 0;
  private markers = new Map<string, HTMLElement>();

  banner(text: string, kind: BannerKind, ms = 2200, sub?: string) {
    this.dismissBanner();
    const letters = h('div', { class: 'bd-banner__text' });
    // Per-letter spans for a staggered bounce (words kept together).
    let n = 0;
    for (const word of text.split(' ')) {
      const w = h('span', { class: 'bd-banner__word' });
      for (const ch of word) w.append(h('span', { class: 'bd-banner__ch', style: `--i:${n++}` }, ch));
      letters.append(w, ' ');
    }
    const b = h(
      'div',
      { class: `bd-banner bd-banner--${kind}` },
      kind === 'great' ? sparkles() : null,
      letters,
      sub ? h('div', { class: 'bd-banner__sub' }, sub) : null,
    );
    this.bannerLayer.append(b);
    this.current = b;
    this.timer = window.setTimeout(() => this.dismissBanner(), Math.max(400, ms));
  }

  private dismissBanner() {
    clearTimeout(this.timer);
    const b = this.current;
    if (!b) return;
    this.current = null;
    b.classList.add('is-out');
    window.setTimeout(() => b.remove(), 450);
  }

  toast(text: string) {
    const t = h('div', { class: 'bd-toast' }, text);
    this.toastLayer.append(t);
    while (this.toastLayer.children.length > 3) this.toastLayer.firstElementChild!.remove();
    window.setTimeout(() => {
      t.classList.add('is-out');
      window.setTimeout(() => t.remove(), 400);
    }, 2600);
  }

  marker(id: string, pos: { x: number; y: number } | null, text?: string) {
    let m = this.markers.get(id);
    if (!pos) {
      if (m) {
        m.remove();
        this.markers.delete(id);
      }
      return;
    }
    if (!m) {
      m = h('div', { class: 'bd-marker' }, h('span', { class: 'bd-marker__t' }));
      this.markerLayer.append(m);
      this.markers.set(id, m);
    }
    if (text !== undefined) {
      const t = m.firstElementChild!;
      if (t.textContent !== text) t.textContent = text;
    }
    m.style.transform = `translate(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px)`;
  }
}

function sparkles(): HTMLElement {
  const wrap = h('div', { class: 'bd-sparkles', 'aria-hidden': 'true' });
  const spots = [
    [-46, -60, 1.2], [44, -70, 0.9], [-58, 30, 0.8], [56, 36, 1.1], [-20, -90, 0.7], [22, 80, 0.8], [-70, -10, 0.6], [72, -12, 0.7],
  ];
  spots.forEach(([x, y, s], i) => {
    const sp = h('span', { class: 'bd-spark', style: `--x:${x}%;--y:${y}%;--s:${s};--i:${i}`, html: ICONS.sparkle });
    wrap.append(sp);
  });
  return wrap;
}
