/** Spatial focus navigation for menus (phone d-pad / keyboard) with a smoothly gliding focus ring. */

export type NavDir = 'up' | 'down' | 'left' | 'right';

export class FocusNav {
  readonly ring: HTMLDivElement;
  current: HTMLElement | null = null;
  private scope: HTMLElement | null = null;
  private last = '';
  private raf = 0;
  /** Called when focus moves to a new element (for the UI click sound). */
  onMove: (() => void) | null = null;

  constructor(layer: HTMLElement) {
    this.ring = document.createElement('div');
    this.ring.className = 'bd-ring';
    layer.appendChild(this.ring);
    // Mouse hover and native focus (Tab) both move the ring.
    layer.addEventListener('pointerover', (e) => {
      if ((e as PointerEvent).pointerType === 'touch') return;
      const t = (e.target as HTMLElement).closest?.('[data-nav]') as HTMLElement | null;
      if (t && this.scope?.contains(t) && t !== this.current && this.usable(t)) this.focus(t, false);
    });
    layer.addEventListener('focusin', (e) => {
      const t = (e.target as HTMLElement).closest?.('[data-nav]') as HTMLElement | null;
      if (t && this.scope?.contains(t) && t !== this.current) this.focus(t, false);
    });
  }

  /** Activate navigation within a screen element; null disables. */
  setScope(el: HTMLElement | null, first?: HTMLElement | null) {
    this.scope = el;
    this.setCurrent(null);
    if (!el) {
      this.ring.classList.remove('is-on');
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      return;
    }
    const pick = first && this.usable(first) ? first : this.items()[0] ?? null;
    if (pick) this.focus(pick, false);
    if (!this.raf) this.loop();
  }

  /** Re-validate focus after a screen re-render (keeps the same data-nav key if possible). */
  refresh() {
    if (!this.scope) return;
    if (this.current && this.scope.contains(this.current) && this.usable(this.current)) return;
    const key = this.current?.dataset.nav;
    const same = key ? (this.scope.querySelector(`[data-nav="${CSS.escape(key)}"]`) as HTMLElement | null) : null;
    const pick = same && this.usable(same) ? same : this.items()[0] ?? null;
    this.setCurrent(null);
    if (pick) this.focus(pick, false);
  }

  items(): HTMLElement[] {
    if (!this.scope) return [];
    return Array.from(this.scope.querySelectorAll<HTMLElement>('[data-nav]')).filter((e) => this.usable(e));
  }

  private usable(e: HTMLElement) {
    if ((e as HTMLButtonElement).disabled || e.getAttribute('aria-disabled') === 'true') return false;
    if (e.closest('[hidden], .is-hidden')) return false;
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  private setCurrent(el: HTMLElement | null) {
    this.current?.classList.remove('is-focused');
    this.current = el;
    el?.classList.add('is-focused');
  }

  focus(el: HTMLElement, scroll = true) {
    if (el === this.current) return;
    this.setCurrent(el);
    if (scroll) el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    this.onMove?.();
    this.place();
  }

  /** Move focus in a direction; returns false when nothing lies that way. */
  move(dir: NavDir): boolean {
    const items = this.items();
    if (!items.length) return false;
    const cur = this.current && items.includes(this.current) ? this.current : null;
    if (!cur) {
      this.focus(items[0]);
      return true;
    }
    const a = cur.getBoundingClientRect();
    const acx = a.left + a.width / 2;
    const acy = a.top + a.height / 2;
    let best: HTMLElement | null = null;
    let bestScore = Infinity;
    for (const e of items) {
      if (e === cur) continue;
      const b = e.getBoundingClientRect();
      const bcx = b.left + b.width / 2;
      const bcy = b.top + b.height / 2;
      let primary: number;
      let secondary: number;
      if (dir === 'down' || dir === 'up') {
        primary = dir === 'down' ? b.top - a.bottom : a.top - b.bottom;
        if ((dir === 'down' ? bcy - acy : acy - bcy) <= 2) continue;
        // Overlapping horizontally = aligned (no penalty).
        const overlap = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        secondary = overlap > 0 ? 0 : Math.abs(bcx - acx);
      } else {
        primary = dir === 'right' ? b.left - a.right : a.left - b.right;
        if ((dir === 'right' ? bcx - acx : acx - bcx) <= 2) continue;
        const overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        secondary = overlap > 0 ? 0 : Math.abs(bcy - acy);
      }
      const score = Math.max(primary, -10) + secondary * 2.2;
      if (score < bestScore) {
        bestScore = score;
        best = e;
      }
    }
    if (!best) return false;
    this.focus(best);
    return true;
  }

  /** Track the focused element every frame (screens animate, panels scroll). */
  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    this.place();
  };

  private place() {
    const el = this.current;
    if (!el || !this.scope) {
      if (this.last) {
        this.ring.classList.remove('is-on');
        this.last = '';
      }
      return;
    }
    const r = el.getBoundingClientRect();
    const pad = 5;
    const radius = getComputedStyle(el).borderTopLeftRadius;
    const key = `${r.left | 0},${r.top | 0},${r.width | 0},${r.height | 0},${radius}`;
    if (key === this.last) return;
    this.last = key;
    const s = this.ring.style;
    s.transform = `translate(${r.left - pad}px, ${r.top - pad}px)`;
    s.width = `${r.width + pad * 2}px`;
    s.height = `${r.height + pad * 2}px`;
    const rad = parseFloat(radius) || 0;
    s.borderRadius = rad >= r.height / 2 ? '999px' : `${rad + pad}px`;
    this.ring.classList.add('is-on');
  }
}
