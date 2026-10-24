/** Tiny DOM helpers used by the SPINSHOT UI. */

export type Child = Node | string | number | null | undefined | false;
type Attrs = Record<string, unknown>;

/**
 * Hyperscript-style element builder.
 *  - `class` / `className` → className
 *  - `style` (object or string)
 *  - `on<Event>` functions → addEventListener
 *  - `html` → innerHTML (trusted, code-generated strings only)
 *  - `data-*`, `aria-*` and everything else → setAttribute (booleans toggle the attribute)
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Attrs | null,
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class' || k === 'className') el.className = String(v);
      else if (k === 'style') {
        if (typeof v === 'string') el.style.cssText = v;
        else
          for (const [sk, sv] of Object.entries(v as Record<string, string>)) {
            if (sk.startsWith('--')) el.style.setProperty(sk, sv);
            else (el.style as unknown as Record<string, string>)[sk] = sv;
          }
      } else if (k === 'html') el.innerHTML = String(v);
      else if (k.startsWith('on') && typeof v === 'function') {
        el.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
      } else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, String(v));
    }
  }
  append(el, children);
  return el;
}

export function append(el: Element, children: Child[]): void {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

export function clear(el: Element): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}

/** Parse a trusted SVG/HTML string into a single element. */
export function frag(html: string): Element {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild as Element;
}

export const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);

export const reducedMotion = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Restart a CSS animation class on an element. */
export function replay(el: HTMLElement, cls: string): void {
  el.classList.remove(cls);
  void el.offsetWidth; // force reflow
  el.classList.add(cls);
}
