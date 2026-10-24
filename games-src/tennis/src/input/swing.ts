import { clamp } from '../constants';

/** What the player wants from a swing. Camera/pose tracking can produce the same shape later. */
export interface SwingIntent {
  /** −1 (left) … +1 (right) across the opponent's court. */
  aimX: number;
  /** −1 (short) … +1 (deep). */
  aimY: number;
  /** 0…1 extra pace from a fast swing gesture. */
  flick: number;
  slice: boolean;
}

export interface InputSource {
  onSwing(cb: (intent: SwingIntent) => void): void;
  /** Manual lateral movement, −1…+1 (0 = let auto-positioning handle it). */
  moveAxis(): number;
  aim(): { x: number; y: number };
  enabled: boolean;
  dispose(): void;
}

/** Mouse/touch/keyboard implementation. Click/tap/Space swings, mouse position aims. */
export class MouseKeyboardInput implements InputSource {
  enabled = false;
  private cbs: ((i: SwingIntent) => void)[] = [];
  private mx = 0;
  private my = 0;
  private speed = 0;
  private lastMove = performance.now();
  private keys = new Set<string>();
  private shift = false;
  private off: (() => void)[] = [];

  constructor(el: HTMLElement) {
    this.mx = window.innerWidth / 2;
    this.my = window.innerHeight * 0.45;
    const move = (e: PointerEvent) => {
      const now = performance.now();
      const d = Math.hypot(e.clientX - this.mx, e.clientY - this.my);
      const dt = Math.max(1, now - this.lastMove);
      this.speed = this.speed * 0.6 + (d / dt) * 0.4;
      this.lastMove = now;
      this.mx = e.clientX;
      this.my = e.clientY;
    };
    const down = (e: PointerEvent) => {
      if (!this.enabled || e.button > 0) return;
      this.mx = e.clientX;
      if (e.pointerType === 'mouse') this.my = e.clientY;
      this.fire();
    };
    const kd = (e: KeyboardEvent) => {
      this.shift = e.shiftKey;
      if (e.repeat) return;
      this.keys.add(e.code);
      if (this.enabled && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        this.fire();
      }
    };
    const ku = (e: KeyboardEvent) => {
      this.shift = e.shiftKey;
      this.keys.delete(e.code);
    };
    const blur = () => this.keys.clear();
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerdown', down);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    window.addEventListener('blur', blur);
    this.off.push(
      () => el.removeEventListener('pointermove', move),
      () => el.removeEventListener('pointerdown', down),
      () => window.removeEventListener('keydown', kd),
      () => window.removeEventListener('keyup', ku),
      () => window.removeEventListener('blur', blur),
    );
  }

  private fire() {
    const a = this.aim();
    // Recent pointer speed in px/ms → 0..1 flick bonus.
    const recent = performance.now() - this.lastMove < 120 ? this.speed : 0;
    const intent: SwingIntent = { aimX: a.x, aimY: a.y, flick: clamp((recent - 0.6) / 2.4, 0, 1), slice: this.shift };
    for (const cb of this.cbs) cb(intent);
  }

  onSwing(cb: (i: SwingIntent) => void) {
    this.cbs.push(cb);
  }

  moveAxis() {
    let a = 0;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) a -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) a += 1;
    return a;
  }

  aim() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
      x: clamp((this.mx - w / 2) / (w * 0.32), -1, 1),
      y: clamp((h * 0.62 - this.my) / (h * 0.3), -1, 1),
    };
  }

  dispose() {
    for (const f of this.off) f();
  }
}
