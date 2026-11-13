// Keyboard to CartIntent (PLAN.md 5.1 and 5.6). Used when a seat has no phone, or the phone went quiet.
//
//   createKeyCart({ keys, onPress? }) -> Control & { active, enabled, dispose() }
//   keys = { up, down, left, right, charge }   KeyboardEvent.code values
//
// Keys give a full-magnitude intent; diagonals are normalised so they are not faster. y = +1 is up the screen.
// `enabled` (default true) gates the intent so menus keep Enter and Space; `onPress(code, event)` fires on
// every fresh keydown of the charge key even while disabled (the lobby uses it for "press to join") and may
// return true to swallow the key (preventDefault on keydown and keyup).

export const KEY_SETS = [
  { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', charge: 'Space' },
  { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', charge: 'Enter' },
  { up: 'KeyI', down: 'KeyK', left: 'KeyJ', right: 'KeyL', charge: 'KeyU' },
  { up: 'Numpad8', down: 'Numpad5', left: 'Numpad4', right: 'Numpad6', charge: 'Numpad0' },
];

/** Short labels for the lobby cards. */
export const KEY_HELP = ['W A S D + Space', 'arrows + Enter', 'I J K L + U', 'numpad 8 4 5 6 + 0'];

export function createKeyCart({ keys, onPress = null } = {}) {
  const k = keys || KEY_SETS[0];
  const mine = new Set([k.up, k.down, k.left, k.right, k.charge]);
  const held = new Set();
  const swallowed = new Set();
  let enabled = true;
  let live = false;

  const typing = (e) => e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
  const down = (e) => {
    if (!mine.has(e.code) || e.ctrlKey || e.metaKey || e.altKey || typing(e)) return;
    if (e.code === k.charge && !e.repeat && onPress && onPress(e.code, e)) {
      swallowed.add(e.code);
      e.preventDefault();
    }
    if (swallowed.has(e.code)) {
      e.preventDefault();
      return;
    }
    if (!enabled) return;
    if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    held.add(e.code);
    live = true;
  };
  const up = (e) => {
    if (swallowed.delete(e.code)) e.preventDefault();
    held.delete(e.code);
  };
  const blur = () => held.clear();
  addEventListener('keydown', down);
  addEventListener('keyup', up);
  addEventListener('blur', blur);

  const cart = {
    get active() { return live && held.size > 0; },
    get enabled() { return enabled; },
    set enabled(v) {
      enabled = !!v;
      if (!enabled) held.clear();
    },
    read() {
      let x = (held.has(k.right) ? 1 : 0) - (held.has(k.left) ? 1 : 0);
      let y = (held.has(k.up) ? 1 : 0) - (held.has(k.down) ? 1 : 0);
      const m = Math.hypot(x, y);
      if (m > 1) {
        x /= m;
        y /= m;
      }
      return { live, x, y, charge: held.has(k.charge) };
    },
    recenter() {},
    dispose() {
      removeEventListener('keydown', down);
      removeEventListener('keyup', up);
      removeEventListener('blur', blur);
      held.clear();
    },
  };
  return cart;
}
