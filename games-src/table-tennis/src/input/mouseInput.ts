/**
 * Mouse / keyboard fallback paddle.
 *
 *  pointer x/y            → aimX / aimY (relative to the element's centre, ±40 % of its size = ±1)
 *  fast upward flick      → swing (power from pointer speed; aim is taken from just before the flick)
 *  left click / Space     → swing (medium power, boosted by current pointer speed)
 *  hold Shift / right btn → open face (backspin, face > 0)
 *  hold Ctrl / Alt        → closed face (topspin, face < 0)
 *  pointer left of centre → backhand (right-handed; mirrored for left)
 *  arrows → up/down/left/right, Enter → action, Backspace → back,
 *  Escape / P → pause while swinging is enabled (in play), back while it is disabled (menus),
 *  Space while swinging is disabled → action, R → recenter (+ 'recenter' button).
 */
import { Quaternion } from 'three';
import type { ControllerButton, Handedness, PaddleInput, PaddleState, SwingEvent } from '../core/contracts';
import { SwingDetector } from './swing';
import { DEG, clamp, composePaddle } from './paddleMath';

const OPEN_FACE = 0.55; // rad
const CLOSED_FACE = -0.5;
const FLICK_FULL = 9; // element-heights per second for full power
const CLICK_POWER = 0.55;
const SPACE_POWER = 0.6;

interface Sample {
  t: number;
  x: number;
  y: number;
}

export class MouseInput implements PaddleInput {
  readonly kind = 'mouse' as const;
  readonly state: PaddleState = {
    connected: true,
    orientation: new Quaternion(),
    aimX: 0,
    aimY: 0,
    face: 0,
    backhand: false,
    swing: 0,
  };

  private handedness: Handedness;
  private swingEnabled = true;
  private swingCbs = new Set<(e: SwingEvent) => void>();
  private buttonCbs = new Set<(b: ControllerButton) => void>();
  private readonly detector = new SwingDetector({ on: 0.36, off: 0.18, drop: 0.7, maxRiseMs: 120, minPower: 0.2 });
  private samples: Sample[] = [];
  /** Normalised pointer, −1..1 (x right, y up). */
  private px = 0;
  private py = 0;
  private hasPointer = false;
  private ax = 0; // smoothed aim
  private ay = 0;
  private face = 0;
  private speed = 0; // heights/s
  private vx = 0;
  private vy = 0;
  private swingLevel = 0;
  private rightHeld = false;
  private shift = false;
  private ctrl = false;
  private backhand = false;
  private centerX = 0;
  private centerY = 0;
  private preFlick: PaddleState | null = null;
  private lastSwingAt = -1e9;
  private readonly ac = new AbortController();

  constructor(
    private el: HTMLElement,
    opts: { handedness?: Handedness } = {},
  ) {
    this.handedness = opts.handedness ?? 'right';
    const sig = { signal: this.ac.signal };
    window.addEventListener('pointermove', (e) => this.onMove(e), { ...sig, passive: true });
    el.addEventListener('pointerdown', (e) => this.onDown(e), sig);
    window.addEventListener('pointerup', (e) => this.onUp(e), sig);
    window.addEventListener('blur', () => this.clearHeld(), sig);
    el.addEventListener('contextmenu', (e) => e.preventDefault(), sig);
    window.addEventListener('keydown', (e) => this.onKey(e, true), sig);
    window.addEventListener('keyup', (e) => this.onKey(e, false), sig);
  }

  setHandedness(h: Handedness): void {
    this.handedness = h;
  }

  /** Mouse has no sensitivity setting in the contract, but accept it for symmetry. */
  setSensitivity(s: number): void {
    this.detector.sensitivity = clamp(s, 0.25, 4);
  }

  setSwingEnabled(on: boolean): void {
    this.swingEnabled = on;
    this.detector.enabled = on;
    if (!on) this.detector.reset();
  }

  onSwing(cb: (e: SwingEvent) => void): () => void {
    this.swingCbs.add(cb);
    return () => this.swingCbs.delete(cb);
  }

  onButton(cb: (b: ControllerButton) => void): () => void {
    this.buttonCbs.add(cb);
    return () => this.buttonCbs.delete(cb);
  }

  /** Make the current pointer position the centre of aim. */
  recenter(): void {
    if (this.hasPointer) {
      const r = this.el.getBoundingClientRect();
      const last = this.samples[this.samples.length - 1];
      if (last) {
        this.centerX = clamp((last.x - (r.left + r.width / 2)) / (r.width * 0.4), -0.6, 0.6);
        this.centerY = clamp(-(last.y - (r.top + r.height / 2)) / (r.height * 0.4), -0.6, 0.6);
      }
    } else {
      this.centerX = this.centerY = 0;
    }
  }

  vibrate(): void {
    /* no-op */
  }

  dispose(): void {
    this.ac.abort();
    this.swingCbs.clear();
    this.buttonCbs.clear();
  }

  // ─────────────────────────────────── events ───────────────────────────────────
  private emitButton(b: ControllerButton): void {
    for (const cb of this.buttonCbs) cb(b);
  }

  private onMove(e: PointerEvent): void {
    const r = this.el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [];
    const list = events.length ? events : [e];
    for (const ev of list) {
      this.samples.push({ t: ev.timeStamp || performance.now(), x: ev.clientX, y: ev.clientY });
    }
    const t = this.samples[this.samples.length - 1].t;
    while (this.samples.length > 2 && t - this.samples[0].t > 80) this.samples.shift();
    this.hasPointer = true;
    this.px = clamp((e.clientX - (r.left + r.width / 2)) / (r.width * 0.4) - this.centerX, -1, 1);
    this.py = clamp(-(e.clientY - (r.top + r.height / 2)) / (r.height * 0.4) - this.centerY, -1, 1);

    // velocity over the last ~50 ms in element-heights per second
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    const dt = (last.t - first.t) / 1000;
    if (dt > 0.004) {
      this.vx = (last.x - first.x) / r.height / dt;
      this.vy = -(last.y - first.y) / r.height / dt; // + = up
      this.speed = Math.hypot(this.vx, this.vy);
    }
    // flick: upward-dominant fast motion = forward stroke
    const upward = this.vy > 0 && this.vy > Math.abs(this.vx) * 0.6;
    const intensity = upward ? this.vy / FLICK_FULL : 0;
    if (!this.detector.swinging && intensity < 0.2) this.preFlick = null;
    if (intensity > 0.15 && !this.preFlick) this.preFlick = this.makeState();
    const res = this.detector.push(t, intensity);
    if (res.fired) this.fireSwing(res.fired.power, res.fired.time);
    this.swingLevel = Math.max(this.swingLevel, clamp(this.speed / FLICK_FULL, 0, 1));
  }

  private onDown(e: PointerEvent): void {
    if (e.button === 2) {
      this.rightHeld = true;
      return;
    }
    if (e.button !== 0 || e.pointerType === 'touch') return;
    if (!this.swingEnabled) return;
    this.preFlick = null;
    this.fireSwing(clamp(CLICK_POWER + (this.speed / FLICK_FULL) * 0.45, 0, 1), performance.now());
  }

  private onUp(e: PointerEvent): void {
    if (e.button === 2) this.rightHeld = false;
  }

  private clearHeld(): void {
    this.rightHeld = this.shift = this.ctrl = false;
  }

  private onKey(e: KeyboardEvent, down: boolean): void {
    this.shift = e.shiftKey;
    this.ctrl = e.ctrlKey || e.altKey;
    if (!down) return;
    const tgt = e.target as HTMLElement | null;
    if (tgt && (tgt.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(tgt.tagName))) return;
    if (e.repeat && !e.key.startsWith('Arrow')) return;
    const btn = (b: ControllerButton) => {
      e.preventDefault();
      this.emitButton(b);
    };
    switch (e.key) {
      case 'ArrowUp':
        return btn('up');
      case 'ArrowDown':
        return btn('down');
      case 'ArrowLeft':
        return btn('left');
      case 'ArrowRight':
        return btn('right');
      case 'Enter':
        return btn('action');
      case 'Backspace':
        return btn('back');
      case 'Escape':
        return btn(this.swingEnabled ? 'pause' : 'back');
      case 'p':
      case 'P':
        return btn('pause');
      case 'e':
      case 'E':
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        return btn('power');
      case 'r':
      case 'R':
        if (e.metaKey || e.ctrlKey) return; // let the browser reload
        this.recenter();
        return btn('recenter');
      case ' ':
        e.preventDefault();
        if (this.swingEnabled) this.fireSwing(clamp(SPACE_POWER + (this.speed / FLICK_FULL) * 0.4, 0, 1), performance.now());
        else this.emitButton('action');
        return;
      default:
        return;
    }
  }

  private fireSwing(power: number, time: number): void {
    if (!this.swingEnabled) return;
    const now = performance.now();
    if (now - this.lastSwingAt < 200) return;
    this.lastSwingAt = now;
    const paddle = this.preFlick ?? this.makeState();
    this.preFlick = null;
    paddle.swing = Math.max(paddle.swing, power);
    this.swingLevel = Math.max(this.swingLevel, power);
    // forward stroke; lateral from pointer motion, vertical from face (closed face → brush up)
    const lat = clamp(this.vx / FLICK_FULL, -0.6, 0.6);
    const up = clamp(-paddle.face * 0.8 + (this.vy / FLICK_FULL) * 0.25, -0.7, 0.8);
    const n = Math.hypot(lat, up, 1);
    const ev: SwingEvent = { time, power, dir: { x: lat / n, y: up / n, z: 1 / n }, paddle };
    for (const cb of this.swingCbs) cb(ev);
  }

  private makeState(): PaddleState {
    const s: PaddleState = { ...this.state, orientation: this.state.orientation.clone() };
    // use the unsmoothed pointer so fast flicks keep the aim they started with
    s.aimX = this.px;
    s.aimY = this.py;
    this.applyOrientation(s);
    return s;
  }

  private applyOrientation(s: PaddleState): void {
    const hand = this.handedness === 'right' ? 1 : -1;
    const roll = s.backhand ? 55 * DEG * hand : -s.aimX * 12 * DEG * hand;
    composePaddle(s.aimX * 50 * DEG, s.face + s.aimY * 10 * DEG, roll, s.orientation);
  }

  update(dt: number): void {
    dt = clamp(dt, 0, 0.1);
    const k = 1 - Math.exp(-dt / 0.03);
    this.ax += (this.px - this.ax) * k;
    this.ay += (this.py - this.ay) * k;
    const targetFace = this.rightHeld || this.shift ? OPEN_FACE : this.ctrl ? CLOSED_FACE : 0;
    this.face += (targetFace - this.face) * (1 - Math.exp(-dt / 0.06));
    // speed decays when the pointer stops
    this.speed *= Math.exp(-dt / 0.08);
    this.vx *= Math.exp(-dt / 0.08);
    this.vy *= Math.exp(-dt / 0.08);
    this.swingLevel *= Math.exp(-dt / 0.15);
    const hand = this.handedness === 'right' ? 1 : -1;
    const side = this.ax * hand;
    this.backhand = this.backhand ? side < -0.08 : side < -0.18;

    const s = this.state;
    s.connected = true;
    s.aimX = this.ax;
    s.aimY = this.ay;
    s.face = this.face;
    s.backhand = this.backhand;
    s.swing = clamp(this.swingLevel, 0, 1);
    this.applyOrientation(s);
  }
}
