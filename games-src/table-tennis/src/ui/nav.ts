/**
 * Spatial focus navigation for controller / keyboard / phone air-cursor input.
 *
 * Focusable items carry `data-nav` with an optional kind:
 *   ""        plain button-like: activate → click()
 *   "toggle"  switch button: activate → click()
 *   "slider"  element is (or contains) an <input type=range>: left/right adjust
 *   "seg"     segmented group of `[data-value]` buttons: left/right select prev/next, activate cycles
 *   "text"    text input: activate focuses it for typing
 */

export type Dir = 'up' | 'down' | 'left' | 'right';
export type NavSound = 'move' | 'select' | 'back' | 'error';

export class Nav {
  scope: HTMLElement | null = null;
  focused: HTMLElement | null = null;
  hovered: HTMLElement | null = null;
  /** Remember the last focused element per scope so returning restores it. */
  private memory = new WeakMap<HTMLElement, HTMLElement>();

  constructor(private sound: (k: NavSound) => void) {}

  items(): HTMLElement[] {
    if (!this.scope) return [];
    const out: HTMLElement[] = [];
    this.scope.querySelectorAll<HTMLElement>('[data-nav]').forEach((el) => {
      if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') return;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      if (el.closest('[hidden]')) return;
      out.push(el);
    });
    return out;
  }

  setScope(scope: HTMLElement | null, preferred?: HTMLElement | null): void {
    if (this.scope && this.focused) this.memory.set(this.scope, this.focused);
    this.scope = scope;
    this.setHover(null);
    const remembered = scope ? this.memory.get(scope) : undefined;
    const target =
      preferred ??
      (remembered && remembered.isConnected && scope?.contains(remembered) ? remembered : null) ??
      scope?.querySelector<HTMLElement>('[data-autofocus]') ??
      null;
    this.focus(target ?? null, { scroll: false });
  }

  /** Re-validate focus after the scope's DOM changed. */
  refresh(): void {
    if (this.focused && (!this.focused.isConnected || !this.scope?.contains(this.focused))) {
      this.focus(null, { scroll: false });
    }
  }

  focus(el: HTMLElement | null, opts: { scroll?: boolean } = {}): void {
    if (this.focused === el) return;
    this.focused?.classList.remove('nav-focus');
    this.focused = el;
    if (el) {
      el.classList.add('nav-focus');
      if (opts.scroll !== false) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  setHover(el: HTMLElement | null): void {
    if (this.hovered === el) return;
    this.hovered?.classList.remove('nav-hover');
    this.hovered = el;
    el?.classList.add('nav-hover');
  }

  private ensureFocus(): boolean {
    if (this.focused && this.focused.isConnected && this.items().includes(this.focused)) return true;
    const first =
      this.scope?.querySelector<HTMLElement>('[data-autofocus]') ?? this.items()[0] ?? null;
    if (first && this.items().includes(first)) {
      this.focus(first);
      this.sound('move');
    }
    return false;
  }

  move(dir: Dir): void {
    if (!this.ensureFocus()) return;
    const cur = this.focused!;
    const kind = cur.dataset.nav ?? '';
    if ((dir === 'left' || dir === 'right') && (kind === 'slider' || kind === 'seg')) {
      if (this.adjust(cur, dir === 'right' ? 1 : -1)) this.sound('move');
      return;
    }
    const next = this.findNeighbour(cur, dir);
    if (next) {
      this.focus(next);
      this.sound('move');
    }
  }

  private findNeighbour(cur: HTMLElement, dir: Dir): HTMLElement | null {
    const a = cur.getBoundingClientRect();
    const acx = a.left + a.width / 2;
    const acy = a.top + a.height / 2;
    const horiz = dir === 'left' || dir === 'right';
    const sgn = dir === 'right' || dir === 'down' ? 1 : -1;
    type Cand = { el: HTMLElement; score: number; inLine: boolean };
    const cands: Cand[] = [];
    for (const el of this.items()) {
      if (el === cur || cur.contains(el) || el.contains(cur)) continue;
      const b = el.getBoundingClientRect();
      const bcx = b.left + b.width / 2;
      const bcy = b.top + b.height / 2;
      if (((horiz ? bcx - acx : bcy - acy) * sgn) < 4) continue;
      // gap along the travel direction (0 if overlapping) and across it
      const primary = Math.max(0, horiz ? (sgn > 0 ? b.left - a.right : a.left - b.right) : sgn > 0 ? b.top - a.bottom : a.top - b.bottom);
      const overlap = horiz
        ? Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
        : Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const crossGap = horiz
        ? Math.max(0, Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom))
        : Math.max(0, Math.max(a.left, b.left) - Math.min(a.right, b.right));
      const inLine = overlap > 0;
      // ignore far-off-diagonal targets
      if (!inLine && crossGap > primary + (horiz ? a.height : a.width) * 1.2) continue;
      const centreOff = horiz ? Math.abs(bcy - acy) : Math.abs(bcx - acx);
      const score = primary + (inLine ? centreOff * 0.15 : crossGap * 2.5 + centreOff * 0.3);
      cands.push({ el, score, inLine });
    }
    const pool = cands.some((c) => c.inLine) ? cands.filter((c) => c.inLine) : cands;
    let best: Cand | null = null;
    for (const c of pool) if (!best || c.score < best.score - 0.5) best = c; // DOM order breaks ties
    return best?.el ?? null;
  }

  /** Slider/segment adjust. Returns true if the value changed. */
  adjust(el: HTMLElement, step: 1 | -1): boolean {
    const kind = el.dataset.nav;
    if (kind === 'slider') {
      const input = (el instanceof HTMLInputElement ? el : el.querySelector('input[type=range]')) as HTMLInputElement | null;
      if (!input) return false;
      const min = parseFloat(input.min || '0');
      const max = parseFloat(input.max || '1');
      const st = parseFloat(input.step || '0') || (max - min) / 20;
      const v = Math.min(max, Math.max(min, parseFloat(input.value) + st * step));
      if (v === parseFloat(input.value)) return false;
      input.value = String(v);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    if (kind === 'seg') {
      const opts = Array.from(el.querySelectorAll<HTMLElement>('[data-value]'));
      const idx = opts.findIndex((o) => o.getAttribute('aria-checked') === 'true');
      const ni = idx + step;
      if (ni < 0 || ni >= opts.length) return false;
      opts[ni].click();
      return true;
    }
    return false;
  }

  /** Activate the hovered (air-cursor) element if any, else the focused one. */
  activate(useHover: boolean): void {
    const el = useHover && this.hovered ? this.hovered : this.focused;
    if (!el) {
      this.ensureFocus();
      return;
    }
    const kind = el.dataset.nav ?? '';
    if (kind === 'seg') {
      const opts = Array.from(el.querySelectorAll<HTMLElement>('[data-value]'));
      const idx = opts.findIndex((o) => o.getAttribute('aria-checked') === 'true');
      opts[(idx + 1) % opts.length]?.click();
      return;
    }
    if (kind === 'slider') {
      // nothing to click — nudge up so activation is still audible/visible
      this.adjust(el, 1);
      this.sound('move');
      return;
    }
    if (kind === 'text') {
      const input = (el instanceof HTMLInputElement ? el : el.querySelector('input')) as HTMLInputElement | null;
      input?.focus();
      input?.select();
      return;
    }
    el.click();
  }
}
