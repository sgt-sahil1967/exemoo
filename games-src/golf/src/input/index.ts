/**
 * Input entry point: merges the phone club (PhoneSwingInput) and the mouse/keyboard fallback
 * (MouseSwingInput) into one SwingInput.
 *
 * Active device (drives `pose`):
 *   - preferMouse(true)                         → mouse
 *   - phone connected and (it was used at least as recently as the mouse, or the mouse has been
 *     idle for > 2 s)                           → phone
 *   - otherwise                                 → mouse
 * Swings and button presses from BOTH devices are forwarded (each is already de-duplicated).
 */
import type { ClubPose, ControllerButton, InputMode, Settings, SwingEvent, SwingInput } from '../core/contracts';
import { DEFAULT_SETTINGS } from '../core/contracts';
import { MouseSwingInput } from './mouseSwing';
import { PhoneSwingInput, type PhoneLinkLike } from './phoneSwing';

export type { PhoneLinkLike } from './phoneSwing';
export { PhoneSwingInput } from './phoneSwing';
export { MouseSwingInput } from './mouseSwing';

export interface CombinedInput extends SwingInput {
  setSettings(s: Settings): void;
  readonly active: 'phone' | 'mouse';
  preferMouse(on: boolean): void;
  /** Phone address calibration done (auto when held still pointing down, or recenter()). */
  readonly calibrated: boolean;
  /** 0…1 progress of the phone's hold-still auto-calibration (for a calibrate screen). */
  readonly calibration: number;
}

const MOUSE_IDLE_MS = 2000;

class Combined implements CombinedInput {
  private readonly swingCbs = new Set<(e: SwingEvent) => void>();
  private readonly buttonCbs = new Set<(b: ControllerButton) => void>();
  private readonly unsubs: Array<() => void> = [];
  private mousePreferred = false;
  private settings: Settings = { ...DEFAULT_SETTINGS };

  constructor(
    readonly phone: PhoneSwingInput,
    readonly mouse: MouseSwingInput,
    private readonly now: () => number,
  ) {
    for (const src of [phone, mouse]) {
      this.unsubs.push(
        src.onSwing((e) => this.swingCbs.forEach((cb) => cb(e))),
        src.onButton((b) => this.buttonCbs.forEach((cb) => cb(b))),
      );
    }
  }

  get kind(): 'phone' | 'mouse' {
    return this.active;
  }

  get active(): 'phone' | 'mouse' {
    if (this.mousePreferred || !this.phone.pose.connected) return 'mouse';
    const m = this.mouse.lastActivity;
    if (this.phone.lastActivity >= m || this.now() - m > MOUSE_IDLE_MS) return 'phone';
    return 'mouse';
  }

  get pose(): ClubPose {
    return this.active === 'phone' ? this.phone.pose : this.mouse.pose;
  }

  get calibrated(): boolean {
    return this.phone.calibrated;
  }

  get calibration(): number {
    return this.phone.calibration;
  }

  setSettings(s: Settings): void {
    this.settings = { ...s };
    this.phone.setSettings(s);
    this.mouse.setSettings(s);
  }

  preferMouse(on: boolean): void {
    this.mousePreferred = on;
  }

  onSwing(cb: (e: SwingEvent) => void): () => void {
    this.swingCbs.add(cb);
    return () => this.swingCbs.delete(cb);
  }

  onButton(cb: (b: ControllerButton) => void): () => void {
    this.buttonCbs.add(cb);
    return () => this.buttonCbs.delete(cb);
  }

  setMode(m: InputMode): void {
    this.phone.setMode(m);
    this.mouse.setMode(m);
  }

  recenter(): void {
    this.phone.recenter();
    this.mouse.recenter();
  }

  vibrate(pattern: number | number[]): void {
    if (this.settings.haptics) this.phone.vibrate(pattern);
  }

  update(dt: number): void {
    this.phone.update(dt);
    this.mouse.update(dt);
  }

  dispose(): void {
    this.unsubs.forEach((u) => u());
    this.phone.dispose();
    this.mouse.dispose();
    this.swingCbs.clear();
    this.buttonCbs.clear();
  }
}

/** Create the merged phone + mouse/keyboard input. `el` is the game canvas/overlay for the mouse. */
export function createInput(
  link: PhoneLinkLike,
  el: HTMLElement,
  opts: { now?: () => number; keyboardTarget?: EventTarget | null } = {},
): CombinedInput {
  const now = opts.now ?? (() => performance.now());
  const phone = new PhoneSwingInput(link, { now });
  const mouse = new MouseSwingInput(el, { now, keyboardTarget: opts.keyboardTarget });
  return new Combined(phone, mouse, now);
}
