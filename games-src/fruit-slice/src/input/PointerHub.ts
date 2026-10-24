import type { PointerSource, PointerState } from '../contracts';

/**
 * Combines a phone pointer and a mouse/touch pointer: a held mouse/touch wins
 * (so you can grab the mouse any time), otherwise the phone when active,
 * otherwise the mouse hover position (inactive).
 */
export class PointerHub implements PointerSource {
  readonly state: PointerState = { x: 0, y: 0, active: false, source: 'none' };
  /** Which source drives `state` this frame. */
  current: 'phone' | 'mouse' | 'none' = 'none';

  constructor(
    readonly phone: PointerSource | null,
    readonly mouse: PointerSource | null,
  ) {}

  update(dt: number): void {
    this.phone?.update(dt);
    this.mouse?.update(dt);
    const m = this.mouse?.state;
    const p = this.phone?.state;
    let src: PointerState | undefined;
    if (m?.active) {
      src = m;
      this.current = 'mouse';
    } else if (p?.active) {
      src = p;
      this.current = 'phone';
    } else if (m) {
      src = m;
      this.current = 'mouse';
    } else {
      src = p;
      this.current = p ? 'phone' : 'none';
    }
    if (!src) {
      this.state.active = false;
      this.state.source = 'none';
      return;
    }
    this.state.x = src.x;
    this.state.y = src.y;
    this.state.active = src.active;
    this.state.source = src.source;
  }
}
