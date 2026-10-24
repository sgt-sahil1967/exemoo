import type { PointerSource, PointerState } from '../contracts';

/**
 * Mouse / touch blade on a canvas. Active while a button or finger is down;
 * position also tracks hover (active = false).
 */
export class MousePointer implements PointerSource {
  readonly state: PointerState = { x: 0, y: 0, active: false, source: 'mouse' };
  /** performance.now() of the last pointer event. */
  lastEventAt = 0;

  private readonly el: HTMLElement;
  private pointerId: number | null = null;
  private readonly abort = new AbortController();

  constructor(el: HTMLElement) {
    this.el = el;
    if (!el.style.touchAction) el.style.touchAction = 'none';
    const opts = { signal: this.abort.signal };
    el.addEventListener('pointerdown', this.onDown, opts);
    el.addEventListener('pointermove', this.onMove, opts);
    el.addEventListener('pointerup', this.onUp, opts);
    el.addEventListener('pointercancel', this.onUp, opts);
    el.addEventListener('lostpointercapture', this.onUp, opts);
    window.addEventListener('blur', this.release, opts);
    el.addEventListener('contextmenu', (e) => e.preventDefault(), opts);
  }

  update(_dt: number): void {
    /* event driven */
  }

  dispose(): void {
    this.abort.abort();
  }

  private setFrom(e: PointerEvent): void {
    const r = this.el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    this.state.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    this.state.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    this.state.source = e.pointerType === 'touch' ? 'touch' : 'mouse';
    this.lastEventAt = performance.now();
  }

  private readonly onDown = (e: PointerEvent): void => {
    if (this.pointerId !== null && e.pointerId !== this.pointerId) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    this.pointerId = e.pointerId;
    try { this.el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    this.setFrom(e);
    this.state.active = true;
  };

  private readonly onMove = (e: PointerEvent): void => {
    if (this.pointerId !== null && e.pointerId !== this.pointerId) return;
    // Use coalesced events' last position for minimal latency.
    this.setFrom(e);
  };

  private readonly onUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    this.setFrom(e);
    this.release();
  };

  private readonly release = (): void => {
    this.pointerId = null;
    this.state.active = false;
  };
}
