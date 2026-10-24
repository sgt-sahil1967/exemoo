/**
 * MouseSwingInput — desktop fallback (also handy for testing without a phone).
 *
 *   hold LEFT button (or Space)  = SWING held ("armed"); the press point is the address
 *   drag DOWN                    = backswing (pose.backswing follows; full = 35 % of the element
 *                                  height, putts 18 %)
 *   flick UP through the address = swing. power from the upward flick speed (element heights / s:
 *                                  1.0 → 0.2, 4.0 → 1.0, capped 1.15; putts 0.3 → 0.05, 1.6 → 1.1)
 *                                  × sensitivity, capped by backswing length like the phone
 *                                  curve from the flick's horizontal drift (right = slice for a
 *                                  right-hander, mirrored for left-handers)
 *   release without a flick      = cancel
 *   RIGHT-button drag            = practice swing (not armed)
 *
 * Keyboard: arrows = d-pad (auto-repeat allowed), Q / [ = club −, E / ] = club +, M = map,
 * Esc / P = pause, Enter = A, Backspace = B, R = recenter, Space (hold) = SWING button.
 * Renders nothing; only sets the cursor on the element.
 */
import type { ClubPose, ControllerButton, InputMode, Settings, SwingEvent, SwingInput } from '../core/contracts';
import { DEFAULT_SETTINGS } from '../core/contracts';
import { clamp } from './clubMath';
import { freshPose } from './phoneSwing';

const KEYMAP: Record<string, ControllerButton> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyQ: 'minus',
  BracketLeft: 'minus',
  KeyE: 'plus',
  BracketRight: 'plus',
  KeyM: 'map',
  Escape: 'pause',
  KeyP: 'pause',
  Enter: 'a',
  NumpadEnter: 'a',
  Backspace: 'b',
  KeyR: 'recenter',
};
const REPEATABLE = new Set<ControllerButton>(['up', 'down', 'left', 'right']);

interface Tune {
  fullFrac: number;
  speedLo: number;
  powerLo: number;
  speedHi: number;
  powerHi: number;
  minBack: number;
  minSpeed: number;
  curveAngle: number;
  cap: boolean;
}
const AIM: Tune = { fullFrac: 0.35, speedLo: 1, powerLo: 0.2, speedHi: 4, powerHi: 1, minBack: 0.08, minSpeed: 0.35, curveAngle: 0.35, cap: true };
const PUTT: Tune = { fullFrac: 0.18, speedLo: 0.3, powerLo: 0.05, speedHi: 1.6, powerHi: 1.1, minBack: 0.05, minSpeed: 0.08, curveAngle: 0.5, cap: false };

interface Sample {
  t: number;
  x: number;
  y: number;
}

export class MouseSwingInput implements SwingInput {
  readonly kind = 'mouse' as const;
  readonly pose: ClubPose = freshPose(true);
  lastActivity = -1e9;

  private settings: Settings = { ...DEFAULT_SETTINGS };
  private mode: InputMode = 'menu';
  private swingCbs = new Set<(e: SwingEvent) => void>();
  private buttonCbs = new Set<(b: ControllerButton) => void>();
  private unsubs: Array<() => void> = [];
  private readonly now: () => number;
  private readonly heightOverride: number | undefined;

  private px = 0;
  private py = 0;
  private drawing: 'armed' | 'practice' | null = null;
  private spaceHeld = false;
  private leftHeld = false;
  private done = false;
  private y0 = 0;
  private back = 0;
  private backMax = 0;
  private topX = 0;
  private samples: Sample[] = [];
  private lastSwingAt = -1e9;
  private speed = 0;

  constructor(
    private readonly el: HTMLElement | null,
    opts: { settings?: Settings; now?: () => number; height?: number; keyboardTarget?: EventTarget | null } = {},
  ) {
    this.now = opts.now ?? (() => performance.now());
    this.heightOverride = opts.height;
    if (opts.settings) this.setSettings(opts.settings);
    if (el) this.attachPointer(el);
    const kt = opts.keyboardTarget !== undefined ? opts.keyboardTarget : typeof window !== 'undefined' ? window : null;
    if (kt) this.attachKeyboard(kt);
    this.updateCursor();
  }

  private attachPointer(el: HTMLElement): void {
    const down = (e: PointerEvent) => {
      if (e.button !== 0 && e.button !== 2) return;
      if (!this.swingMode) return;
      e.preventDefault();
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      this.pointerDown(e.clientX, e.clientY, e.button);
    };
    const move = (e: PointerEvent) => this.pointerMove(e.clientX, e.clientY);
    const up = (e: PointerEvent) => this.pointerUp(e.button);
    const ctx = (e: Event) => {
      if (this.swingMode) e.preventDefault();
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('contextmenu', ctx);
    this.unsubs.push(() => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('contextmenu', ctx);
    });
  }

  private attachKeyboard(t: EventTarget): void {
    const kd = (e: Event) => this.onKey(e as KeyboardEvent, true);
    const ku = (e: Event) => this.onKey(e as KeyboardEvent, false);
    t.addEventListener('keydown', kd);
    t.addEventListener('keyup', ku);
    this.unsubs.push(() => {
      t.removeEventListener('keydown', kd);
      t.removeEventListener('keyup', ku);
    });
  }

  private onKey(e: KeyboardEvent, down: boolean): void {
    const tgt = e.target as HTMLElement | null;
    if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable)) return;
    if (this.key(e.code, down, e.repeat)) e.preventDefault();
  }

  /** Keyboard handler (public for tests). Returns true if the key was used. */
  key(code: string, down: boolean, repeat = false): boolean {
    if (code === 'Space') {
      if (down && !repeat) {
        this.spaceHeld = true;
        if (this.swingMode) this.startDraw('armed');
        else this.press('a');
      } else if (!down) {
        this.spaceHeld = false;
        if (!this.leftHeld) this.endDraw();
      }
      this.updateArmed();
      return true;
    }
    const b = KEYMAP[code];
    if (!b) return false;
    if (down && (!repeat || REPEATABLE.has(b))) this.press(b);
    return true;
  }

  private press(b: ControllerButton): void {
    this.lastActivity = this.now();
    for (const cb of this.buttonCbs) cb(b);
  }

  /** Pointer handlers (public for tests). Coordinates in CSS pixels. */
  pointerDown(x: number, y: number, button = 0): void {
    this.px = x;
    this.py = y;
    if (!this.swingMode) return;
    if (button === 0) this.leftHeld = true;
    this.startDraw(button === 2 ? 'practice' : 'armed');
    this.updateArmed();
  }

  pointerMove(x: number, y: number): void {
    this.px = x;
    this.py = y;
    if (!this.drawing || this.done) return;
    const t = this.now();
    this.lastActivity = t;
    this.samples.push({ t, x, y });
    while (this.samples.length > 2 && t - this.samples[1].t > 80) this.samples.shift();
    const tune = this.tune;
    const h = this.height;
    const back = (y - this.y0) / (h * tune.fullFrac);
    if (back > this.back && back >= this.backMax) this.topX = x;
    this.back = back;
    this.backMax = Math.max(this.backMax, back);
    if (this.backMax >= tune.minBack && back <= 0) {
      const v = this.flickSpeed();
      if (v.up >= tune.minSpeed) this.fire(v.up, x);
    }
  }

  pointerUp(button = 0): void {
    if (button === 0) this.leftHeld = false;
    if (this.drawing === 'armed' && (this.leftHeld || this.spaceHeld)) return;
    this.endDraw();
    this.updateArmed();
  }

  private flickSpeed(): { up: number } {
    const s = this.samples;
    if (s.length < 2) return { up: 0 };
    const a = s[0];
    const b = s[s.length - 1];
    const dt = (b.t - a.t) / 1000;
    if (dt <= 0) return { up: 0 };
    return { up: (a.y - b.y) / this.height / dt };
  }

  private fire(upSpeed: number, x: number): void {
    const t = this.now();
    this.done = true;
    if (t - this.lastSwingAt < 1000) return;
    this.lastSwingAt = t;
    const tune = this.tune;
    const v = upSpeed * clamp(this.settings.sensitivity, 0.25, 4);
    let power = v <= tune.speedLo ? (tune.powerLo * v) / tune.speedLo : tune.powerLo + ((tune.powerHi - tune.powerLo) * (v - tune.speedLo)) / (tune.speedHi - tune.speedLo);
    const backswing = clamp(this.backMax, 0, 1.2);
    if (tune.cap) power = Math.min(power, 0.3 + 0.85 * backswing);
    power = clamp(power, 0, 1.15);
    const dy = Math.max(1, this.backMax * this.height * tune.fullFrac);
    const angle = Math.atan2(x - this.topX, dy);
    const hand = this.settings.handedness === 'left' ? -1 : 1;
    let curve = clamp((angle / tune.curveAngle) * hand, -1, 1);
    curve = Math.abs(curve) < 0.08 ? 0 : (Math.sign(curve) * (Math.abs(curve) - 0.08)) / 0.92;
    let quality = 1;
    if (!this.isPutt && backswing < 0.35) quality -= 0.5 * (1 - backswing / 0.35);
    if (power > 1) quality -= (power - 1) * 1.5;
    const ev: SwingEvent = {
      time: t,
      power,
      curve,
      quality: clamp(quality, 0.15, 1),
      backswing,
      practice: this.settings.holdToSwing ? this.drawing !== 'armed' : false,
    };
    this.speed = clamp(v / tune.speedHi, 0, 1);
    for (const cb of this.swingCbs) cb(ev);
  }

  private startDraw(kind: 'armed' | 'practice'): void {
    if (this.drawing) return;
    this.drawing = kind;
    this.done = false;
    this.y0 = this.py;
    this.topX = this.px;
    this.back = 0;
    this.backMax = 0;
    this.samples = [{ t: this.now(), x: this.px, y: this.py }];
    this.lastActivity = this.now();
    this.updateCursor();
  }

  private endDraw(): void {
    this.drawing = null;
    this.done = false;
    this.back = 0;
    this.backMax = 0;
    this.samples = [];
    this.updateCursor();
  }

  private updateArmed(): void {
    this.pose.armed = this.swingMode && (this.leftHeld || this.spaceHeld);
  }

  private get swingMode(): boolean {
    return this.mode === 'aim' || this.mode === 'putt';
  }
  private get isPutt(): boolean {
    return this.mode === 'putt';
  }
  private get tune(): Tune {
    return this.isPutt ? PUTT : AIM;
  }
  private get height(): number {
    if (this.heightOverride) return this.heightOverride;
    const h = this.el?.getBoundingClientRect?.().height;
    return h && h > 50 ? h : 800;
  }

  private updateCursor(): void {
    if (!this.el?.style) return;
    this.el.style.cursor = !this.swingMode ? '' : this.drawing ? 'grabbing' : 'grab';
  }

  setSettings(s: Settings): void {
    this.settings = { ...s };
  }

  setMode(m: InputMode): void {
    this.mode = m;
    this.endDraw();
    this.updateArmed();
  }

  onSwing(cb: (e: SwingEvent) => void): () => void {
    this.swingCbs.add(cb);
    return () => this.swingCbs.delete(cb);
  }

  onButton(cb: (b: ControllerButton) => void): () => void {
    this.buttonCbs.add(cb);
    return () => this.buttonCbs.delete(cb);
  }

  recenter(): void {
    if (this.drawing) {
        this.y0 = this.py;
    }
  }

  vibrate(): void {
    /* no haptics on desktop */
  }

  update(dt: number): void {
    const p = this.pose;
    const back = this.drawing && !this.done ? clamp(this.back, -0.2, 1.2) : 0;
    const k = 1 - Math.exp(-clamp(dt, 0, 0.1) / 0.03);
    p.backswing += (back - p.backswing) * k;
    const full = this.isPutt ? 15 * (Math.PI / 180) : 0.85 * Math.PI;
    p.shaftAngle = p.backswing * full;
    p.face = 0;
    this.speed *= Math.exp(-clamp(dt, 0, 0.1) / 0.15);
    p.speed = this.speed;
    p.connected = true;
  }

  dispose(): void {
    for (const u of this.unsubs) u();
    this.unsubs = [];
    this.swingCbs.clear();
    this.buttonCbs.clear();
  }
}
