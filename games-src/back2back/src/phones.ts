// Phone input for Back2Back, in the same shape as Rapids Row and Farm Kart's Exemoo adapter.
//
//  • Player 1 · Driver. Inside the Exemoo shell this is the phone the shell already paired (SDK).
//    Opened directly, it gets its own PIN room. Layout "kart": tilt the phone like a wheel (or ◀ ▶),
//    GAS / BRAKE / ITEM (nitro). Sends {t:'in', s, g, b, d, i}.
//  • Player 2 · Shooter. Always its own PIN room (ScreenLink), so 2 phones pair with their own PINs.
//    Layout "swing" with the motion stream on: point the phone at the screen to aim, hold Action to fire.
//    In menus both phones use the "remote" layout (d-pad + GO + Back).
//  • Without a phone, the driver uses ← → ↑ ↓ (A/D, W/S, Shift = nitro) and the shooter uses the mouse
//    (click or Space to fire).
import { connectExemoo } from '../../../public/sdk/exemoo.js';
import { ScreenLink } from '../../../public/js/screen-link.js';
import { normalizeButton } from '../../../public/js/protocol.js';
import { Aimer, type AimPacket } from './aim';
import type { AimIn, DriveIn } from './sim';

/** A phone counts as live for this long after its last message. */
const FRESH_MS = 1500;
export type Who = 'driver' | 'shooter';
export type Mode = 'play' | 'menu';

const COLOR: Record<Who, string> = { driver: '#ff3b30', shooter: '#2f7cff' };
const TITLE: Record<Who, string> = { driver: 'Back2Back · Driver', shooter: 'Back2Back · Shooter' };
const LAYOUT_PLAY: Record<Who, string> = { driver: 'kart', shooter: 'swing' };
const PAD_LAYOUT: Record<Who, string> = { driver: 'kart', shooter: 'swing' };

interface Seat {
  connected: boolean;
  pin: string;
  last: number;
}

export class Phones {
  readonly sdk = connectExemoo({ layout: 'remote', title: 'Back2Back', menuCursor: () => this.mode === 'menu' });
  readonly inShell: boolean = this.sdk.inShell;
  /** Only when the driver is not paired through the shell. */
  private readonly driverLink: ScreenLink | null = null;
  private readonly shooterLink: ScreenLink;
  private padBase = `${location.origin}/pad`;
  private mode: Mode = 'menu';

  readonly driver: Seat & { steer: number; gas: boolean; brake: boolean; nitro: boolean; drift: boolean } = {
    connected: false,
    pin: '',
    last: 0,
    steer: 0,
    gas: false,
    brake: false,
    nitro: false,
    drift: false,
  };
  readonly shooter: Seat & { aim: Aimer; fire: boolean } = { connected: false, pin: '', last: 0, aim: new Aimer(), fire: false };

  /** Set by main: a phone pressed a button. */
  onButton: (who: Who, b: string) => void = () => {};
  /** Set by main: pairing state changed (redraw the pairing cards). */
  onChange: () => void = () => {};

  private keys = new Set<string>();
  private mx = 0.5;
  private my = 0.56;
  private mouseFire = false;

  constructor() {
    if (this.inShell) {
      this.sdk.on('status', (s) => {
        const was = this.driver.connected;
        this.driver.connected = !!s.connected;
        this.driver.last = this.driver.connected ? performance.now() : 0;
        if (this.driver.connected && !was) this.applyMode('driver');
        this.onChange();
      });
      this.sdk.on('message', (m) => this.onDriverMessage(m));
      this.sdk.on('button', (b) => this.onButton('driver', normalizeButton(b)));
    } else {
      this.driverLink = this.makeLink('driver', 'back2back.room1');
    }
    this.shooterLink = this.makeLink('shooter', 'back2back.room2');
    this.bindInput();
    fetch('/api/info', { cache: 'no-store' })
      .then((r) => r.json())
      .then((i) => {
        if (i?.padUrl) this.padBase = i.padUrl;
        if (Array.isArray(i?.iceServers)) {
          if (this.driverLink) this.driverLink.iceServers = i.iceServers;
          this.shooterLink.iceServers = i.iceServers;
        }
        this.driverLink?.start();
        this.shooterLink.start();
        this.onChange();
      })
      .catch(() => {
        this.driverLink?.start();
        this.shooterLink.start();
      });
  }

  private makeLink(who: Who, storageKey: string): ScreenLink {
    const link = new ScreenLink({ storageKey });
    const seat = who === 'driver' ? this.driver : this.shooter;
    link.on('room', () => {
      seat.pin = link.pin;
      this.onChange();
    });
    link.on('status', (s: string) => {
      const ok = s === 'connected';
      const was = seat.connected;
      seat.connected = ok;
      seat.pin = link.pin || seat.pin;
      if (!ok) seat.last = 0;
      if (ok && !was) this.applyMode(who);
      this.onChange();
    });
    link.on('message', (m: { t: string; b?: string } & Record<string, unknown>) => {
      if (m.t === 'button') this.onButton(who, normalizeButton(m.b ?? ''));
      else if (who === 'driver' && m.t === 'in') this.onDriverMessage(m);
    });
    if (who === 'shooter') {
      link.on('packet', (p: AimPacket & { buttons: number }) => {
        this.shooter.aim.push(p);
        this.shooter.fire = (p.buttons & 1) !== 0; // bit 0 = Action
        this.shooter.last = performance.now();
      });
    }
    return link;
  }

  private onDriverMessage(m: Record<string, unknown>): void {
    if (m.t !== 'in') return;
    const d = this.driver;
    d.steer = Math.max(-1, Math.min(1, Number(m.s) || 0));
    d.gas = !!m.g;
    d.brake = !!m.b;
    d.nitro = !!m.i;
    d.drift = !!m.d;
    d.last = performance.now();
  }

  // ───────────── modes and layouts ─────────────
  /** 'play' → driver kart wheel, shooter swing aim; 'menu' → both remote (d-pad + GO). */
  setMode(mode: Mode): void {
    this.mode = mode;
    this.applyMode('driver');
    this.applyMode('shooter');
  }

  private applyMode(who: Who): void {
    const play = this.mode === 'play';
    const layout = play ? LAYOUT_PLAY[who] : 'remote';
    if (who === 'driver' && this.inShell) {
      this.sdk.setLayout(layout as 'kart' | 'remote', TITLE.driver, []);
      this.sdk.send({ t: 'theme', color: COLOR.driver });
      return;
    }
    const link = who === 'driver' ? this.driverLink : this.shooterLink;
    if (!link?.connected) return;
    link.send({ t: 'layout', layout, title: TITLE[who], buttons: [] });
    link.send({ t: 'theme', color: COLOR[who] });
    if (who === 'shooter') link.send({ t: 'stream', on: play });
  }

  /** Haptic buzz on a phone (no-op without one). */
  haptic(who: Who, pattern: number | number[]): void {
    if (who === 'driver' && this.inShell) return void this.sdk.haptic(pattern as number);
    const link = who === 'driver' ? this.driverLink : this.shooterLink;
    if (link?.connected) link.send({ t: 'haptic', pattern });
  }

  /** Menu navigation over the page's buttons (d-pad and Action). */
  nav(b: string): void {
    this.sdk.nav(b as 'action');
  }

  /** Is this seat's phone currently paired (ignores the keyboard fallback)? */
  isPhone(who: Who): boolean {
    const seat = who === 'driver' ? this.driver : this.shooter;
    return seat.connected && performance.now() - seat.last < FRESH_MS;
  }

  /** Where a phone should go to pair this seat. Empty while the PIN is not known yet. */
  padUrl(who: Who): string {
    const pin = who === 'driver' ? (this.driverLink?.pin ?? '') : this.shooterLink.pin;
    if (!pin) return '';
    return `${this.padBase}?pin=${pin}&layout=${PAD_LAYOUT[who]}&title=${encodeURIComponent(TITLE[who])}`;
  }

  // ───────────── input ─────────────
  driveInput(): DriveIn {
    const d = this.driver;
    // The kart pad sends only when its input changes, so a connected driver counts as live.
    if (d.connected) return { steer: d.steer, gas: d.gas, brake: d.brake, nitro: d.nitro, drift: d.drift };
    const k = this.keys;
    return {
      steer: (k.has('ArrowRight') || k.has('KeyD') ? 1 : 0) - (k.has('ArrowLeft') || k.has('KeyA') ? 1 : 0),
      gas: k.has('ArrowUp') || k.has('KeyW'),
      brake: k.has('ArrowDown') || k.has('KeyS'),
      nitro: k.has('ShiftLeft') || k.has('ShiftRight') || k.has('KeyE'),
      drift: k.has('KeyZ') || k.has('ControlLeft'),
    };
  }

  aimInput(): AimIn {
    if (this.isPhone('shooter')) return { rx: this.shooter.aim.rx, ry: this.shooter.aim.ry, fire: this.shooter.fire };
    return { rx: this.mx, ry: this.my, fire: this.mouseFire || this.keys.has('Space') };
  }

  /** Which controls are live, for the HUD. */
  inputLabel(who: Who): 'phone' | 'keys' {
    return this.isPhone(who) ? 'phone' : 'keys';
  }

  private bindInput(): void {
    const prevent = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']);
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (prevent.has(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
    window.addEventListener('pointermove', (e) => {
      this.mx = Math.max(0, Math.min(1, e.clientX / innerWidth));
      this.my = Math.max(0, Math.min(1, e.clientY / innerHeight));
    });
    window.addEventListener('pointerdown', (e) => {
      if (e.button === 0) this.mouseFire = true;
    });
    window.addEventListener('pointerup', () => (this.mouseFire = false));
  }
}
