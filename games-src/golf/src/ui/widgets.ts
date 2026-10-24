/** Reusable menu widgets: pill buttons, panels, segmented controls, toggles, sliders. */
import { h, frag } from './dom';
import { ICONS, type IconName } from './icons';

export function icon(name: IconName): HTMLElement {
  return frag(ICONS[name]);
}

export interface BtnOpts {
  icon?: IconName;
  kind?: 'primary' | 'go' | 'plain' | 'ghost';
  size?: 'lg' | 'md' | 'sm';
  nav?: string;
  cls?: string;
  title?: string;
}

/** Pill button that participates in d-pad navigation. */
export function btn(label: string, onClick: () => void, o: BtnOpts = {}): HTMLButtonElement {
  const b = h(
    'button',
    {
      type: 'button',
      class: `bd-btn bd-btn--${o.kind ?? 'plain'} bd-btn--${o.size ?? 'md'} ${o.cls ?? ''}`,
      'data-nav': o.nav ?? label,
      title: o.title,
      onclick: () => onClick(),
    },
    o.icon ? h('span', { class: 'bd-btn__ico' }, icon(o.icon)) : null,
    label ? h('span', { class: 'bd-btn__label' }, label) : null,
  );
  return b;
}

/** White card with a Wii-blue header band. */
export function panel(title: string, ico: IconName, body: Node[], foot?: Node[], cls = ''): HTMLElement {
  return h(
    'section',
    { class: `bd-panel ${cls}` },
    h('header', { class: 'bd-panel__head' }, h('span', { class: 'bd-panel__badge' }, icon(ico)), h('h2', null, title)),
    h('div', { class: 'bd-panel__body' }, ...body),
    foot ? h('footer', { class: 'bd-panel__foot' }, ...foot) : null,
  );
}

/** Small section heading inside a panel. */
export function label(text: string, ico?: IconName): HTMLElement {
  return h('div', { class: 'bd-label' }, ico ? icon(ico) : null, h('span', null, text));
}

export interface SegOpt<T extends string> {
  value: T;
  label: string;
  sub?: string;
  icon?: IconName;
}

/** Segmented control. Returns the element plus a setter. */
export function seg<T extends string>(
  key: string,
  opts: SegOpt<T>[],
  value: T,
  onChange: (v: T) => void,
  cls = '',
): { el: HTMLElement; set(v: T): void } {
  const el = h('div', { class: `bd-seg ${cls}`, role: 'radiogroup' });
  const buttons = opts.map((o) =>
    h(
      'button',
      {
        type: 'button',
        class: 'bd-seg__opt',
        role: 'radio',
        'data-nav': `${key}:${o.value}`,
        'data-value': o.value,
        onclick: () => {
          set(o.value);
          onChange(o.value);
        },
      },
      o.icon ? icon(o.icon) : null,
      h('span', { class: 'bd-seg__label' }, o.label),
      o.sub ? h('span', { class: 'bd-seg__sub' }, o.sub) : null,
    ),
  );
  el.append(...buttons);
  const set = (v: T) => {
    for (const b of buttons) {
      const on = b.dataset.value === v;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', String(on));
    }
  };
  set(value);
  return { el, set };
}

/** On/off switch row. */
export function toggle(key: string, text: string, value: boolean, onChange: (v: boolean) => void): { el: HTMLElement; set(v: boolean): void } {
  const knob = h('span', { class: 'bd-switch' }, h('span', { class: 'bd-switch__knob' }));
  const el = h(
    'button',
    {
      type: 'button',
      class: 'bd-toggle',
      role: 'switch',
      'data-nav': key,
      onclick: () => {
        const v = el.getAttribute('aria-checked') !== 'true';
        set(v);
        onChange(v);
      },
    },
    h('span', { class: 'bd-toggle__text' }, text),
    knob,
  );
  const set = (v: boolean) => {
    el.setAttribute('aria-checked', String(v));
    el.classList.toggle('is-on', v);
  };
  set(value);
  return { el, set };
}

/** Range slider with a live value read-out. */
export function slider(
  key: string,
  min: number,
  max: number,
  step: number,
  value: number,
  fmt: (v: number) => string,
  onChange: (v: number) => void,
): { el: HTMLElement; input: HTMLInputElement; set(v: number): void } {
  const out = h('output', { class: 'bd-slider__out' });
  const input = h('input', {
    type: 'range',
    class: 'bd-slider__input',
    min,
    max,
    step,
    'data-nav': key,
    oninput: () => {
      const v = Number(input.value);
      paint(v);
      onChange(v);
    },
  });
  const paint = (v: number) => {
    out.textContent = fmt(v);
    input.style.setProperty('--fill', `${((v - min) / (max - min)) * 100}%`);
  };
  const set = (v: number) => {
    input.value = String(v);
    paint(v);
  };
  set(value);
  const el = h('div', { class: 'bd-slider' }, input, out);
  return { el, input, set };
}

/** Nudge a range input by one step (d-pad left/right). */
export function nudgeRange(input: HTMLInputElement, dir: -1 | 1) {
  const step = Number(input.step) || 1;
  const v = Math.min(Number(input.max), Math.max(Number(input.min), Number(input.value) + dir * step));
  input.value = String(Math.round(v / step) * step);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

/** Loading spinner (golf ball orbiting). */
export function spinner(): HTMLElement {
  return h('div', { class: 'bd-spinner', role: 'status', 'aria-label': 'Loading' }, h('span'), h('span'), h('span'));
}
