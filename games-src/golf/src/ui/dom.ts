/** Tiny DOM helpers for the UI layer (no framework). */

type Child = Node | string | number | null | undefined | false;
type AttrVal = string | number | boolean | null | undefined | ((ev: any) => void);

/** Create an element: h('div', { class: 'x', onclick: fn }, child, 'text'). `html` sets innerHTML. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, AttrVal> | null,
  ...children: (Child | Child[])[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) {
    for (const k in attrs) {
      const v = attrs[k];
      if (v === undefined || v === null || v === false) continue;
      if (typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
      else if (k === 'html') el.innerHTML = String(v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  append(el, children);
  return el;
}

/** Append children (flattened, falsy skipped). */
export function append(el: Element, children: (Child | Child[])[]) {
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(typeof c === 'number' ? String(c) : c);
  }
}

/** Parse an SVG/HTML string into an element. */
export function frag(markup: string): HTMLElement {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild as HTMLElement;
}

/** Set text only when it changed (keeps the HUD cheap). */
export function setText(el: Element, text: string) {
  if (el.textContent !== text) el.textContent = text;
}

/** Remove all children. */
export function clear(el: Element) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

/** "+2", "−1", "E". */
export function fmtToPar(d: number): string {
  if (d === 0) return 'E';
  return d > 0 ? `+${d}` : `−${-d}`;
}

/** Yards (or metres when units === 'meters'), rounded, with unit suffix. */
export function fmtDist(yds: number, units: 'yards' | 'meters' = 'yards'): string {
  return units === 'meters' ? `${Math.round(yds * 0.9144)} m` : `${Math.round(yds)} yd`;
}

export const reducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
