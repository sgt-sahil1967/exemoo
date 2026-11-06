// Keyboard / gamepad / phone → per-player kart input.
export const CONTROL_OPTIONS = [
  ['phone', 'Phone'],
  ['keysA', 'Keys A (WASD)'],
  ['keysB', 'Keys B (Arrows)'],
  ['keysAll', 'Whole keyboard'],
  ['pad1', 'Gamepad 1'], ['pad2', 'Gamepad 2'], ['pad3', 'Gamepad 3'], ['pad4', 'Gamepad 4'],
];

const MAP = {
  keysA: { gas: ['KeyW'], brake: ['KeyS'], left: ['KeyA'], right: ['KeyD'], drift: ['Space'], item: ['KeyE', 'KeyQ'] },
  keysB: { gas: ['ArrowUp'], brake: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'], drift: ['ShiftRight', 'Period'], item: ['Enter', 'Slash', 'ControlRight'] },
};
MAP.keysAll = Object.fromEntries(Object.keys(MAP.keysA).map(k => [k, [...MAP.keysA[k], ...MAP.keysB[k], ...(k === 'drift' ? ['ShiftLeft'] : [])]]));

export class Input {
  constructor(phones) {
    this.phones = phones;
    this.keys = new Set();
    this.pressed = new Set();
    addEventListener('keydown', e => {
      if (!this.keys.has(e.code)) this.pressed.add(e.code);
      this.keys.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) && document.activeElement?.tagName !== 'SELECT') e.preventDefault();
    });
    addEventListener('keyup', e => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
  }

  any(codes) { return codes.some(c => this.keys.has(c)); }
  consume(code) { const had = this.pressed.has(code); this.pressed.delete(code); return had; }
  endFrame() { this.pressed.clear(); }

  pads() { return navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : []; }

  startPressed() {
    for (const p of this.pads()) if (p.buttons[9]?.pressed) { if (!this._startHeld) { this._startHeld = true; return true; } return false; }
    this._startHeld = false;
    return false;
  }

  read(scheme, player, out, alsoKeyboard = false) {
    out.steer = 0; out.gas = false; out.brake = false; out.drift = false; out.item = false;
    const merge = s => {
      if (MAP[s]) {
        const m = MAP[s];
        const st = (this.any(m.right) ? 1 : 0) - (this.any(m.left) ? 1 : 0);
        if (st) out.steer = st;
        out.gas ||= this.any(m.gas); out.brake ||= this.any(m.brake);
        out.drift ||= this.any(m.drift); out.item ||= this.any(m.item);
      } else if (s.startsWith('pad')) {
        const p = this.pads()[+s[3] - 1];
        if (!p) return;
        const ax = p.axes[0] || 0;
        const st = Math.abs(ax) > .15 ? ax : (p.buttons[15]?.pressed ? 1 : 0) - (p.buttons[14]?.pressed ? 1 : 0);
        if (st) out.steer = st;
        out.gas ||= !!(p.buttons[0]?.pressed || p.buttons[7]?.value > .3);
        out.brake ||= !!(p.buttons[1]?.pressed || p.buttons[6]?.value > .3);
        out.drift ||= !!(p.buttons[5]?.pressed || p.buttons[2]?.pressed);
        out.item ||= !!(p.buttons[3]?.pressed || p.buttons[4]?.pressed);
      } else if (s === 'phone') {
        const P = this.phones.input(player);
        if (P.steer) out.steer = P.steer;
        out.gas ||= P.gas; out.brake ||= P.brake; out.drift ||= P.drift; out.item ||= P.item;
      }
    };
    merge(scheme);
    if (alsoKeyboard && scheme !== 'keysAll') {
      const keep = out.steer;
      merge('keysAll');
      if (!out.steer) out.steer = keep;
    }
    return out;
  }
}
