/**
 * Drop-in replacements for the phone links the existing games were written against, backed by the
 * Exemoo SDK. A ported game swaps `new PhoneLink()` for one of these when it runs in the shell and
 * the rest of its input code (swing detection, menus, calibration) stays as it was.
 *
 *   SpinshotLink  — table-tennis / golf `PhoneLink` (events 'status' | 'packet' | 'message')
 *   SliceLink     — fruit-slice `PhoneLink` (onInfo / onSample / onButton, legacy SEN1 quaternions)
 */
import { connectExemoo } from './exemoo.js';

/** Rebuild a quaternion with the legacy sword-relay Euler order (Z-Y'-X''), which fruit-slice expects. */
export function legacyQuat({ x, y, z, w }) {
  // Correct quaternion is R = Rz(alpha)·Rx(beta)·Ry(gamma): recover the angles…
  const m12 = 2 * (x * y - w * z);
  const m22 = 1 - 2 * (x * x + z * z);
  const m31 = 2 * (x * z - w * y);
  const m32 = 2 * (y * z + w * x);
  const m33 = 1 - 2 * (x * x + y * y);
  const beta = Math.asin(Math.max(-1, Math.min(1, m32)));
  const gamma = Math.atan2(-m31, m33);
  const alpha = Math.atan2(-m12, m22);
  // …and build it the way the old controller did.
  const cz = Math.cos(alpha / 2), sz = Math.sin(alpha / 2);
  const cx = Math.cos(beta / 2), sx = Math.sin(beta / 2);
  const cy = Math.cos(gamma / 2), sy = Math.sin(gamma / 2);
  return [sx * cy * cz - cx * sy * sz, cx * sy * cz + sx * cy * sz, cx * cy * sz - sx * sy * cz, cx * cy * cz + sx * sy * sz];
}

class Listeners {
  constructor() {
    this.map = new Map();
  }
  on(ev, cb) {
    if (!this.map.has(ev)) this.map.set(ev, new Set());
    this.map.get(ev).add(cb);
    return () => this.map.get(ev)?.delete(cb);
  }
  emit(ev, ...a) {
    for (const cb of this.map.get(ev) || []) {
      try {
        cb(...a);
      } catch (e) {
        console.error('[exemoo adapter]', e);
      }
    }
  }
}

/** table-tennis / golf PhoneLink, fed by the shell's phone. */
export class SpinshotLink {
  /**
   * buttons: extra pad buttons. buttonMap: Exemoo button name → game name for {t:'button'} messages.
   * maskBits: Exemoo button name → bit index in the game's own SEN2 button mask (golf orders bits differently).
   */
  constructor({ layout = 'swing', title, buttons, buttonMap = {}, maskBits = null } = {}) {
    this.pin = '';
    this.status = 'waiting';
    this.transport = 'none';
    this.latencyMs = 0;
    this.packetRate = 0;
    this._l = new Listeners();
    this._count = 0;
    this._url = '';
    this.sdk = connectExemoo({ layout, title, buttons });
    const order = ['action', 'pause', 'recenter', 'up', 'down', 'left', 'right', 'back', 'power', 'home'];
    const remap = maskBits
      ? (mask) => {
          let out = 0;
          order.forEach((name, i) => {
            if (mask & (1 << i) && maskBits[name] != null) out |= 1 << maskBits[name];
          });
          return out;
        }
      : null;
    this.sdk.on('status', (s) => {
      this.pin = s.pin;
      this._url = s.padUrl;
      this.latencyMs = s.latency || 0;
      const status = s.connected ? 'connected' : 'waiting';
      const transport = s.connected ? s.transport : 'none';
      if (status === this.status && transport === this.transport) return;
      this.status = status;
      this.transport = transport;
      this._l.emit('status', status);
    });
    this.sdk.on('packet', (p) => {
      this._count++;
      this._l.emit('packet', remap ? { ...p, buttons: remap(p.buttons) } : p);
    });
    this.sdk.on('button', (b) => this._l.emit('message', { t: 'button', b: buttonMap[b] ?? b }));
    this.sdk.on('message', (m) => this._l.emit('message', m));
    setInterval(() => {
      this.packetRate = this._count;
      this._count = 0;
    }, 1000);
  }
  on(ev, cb) {
    return this._l.on(ev, cb);
  }
  start() {
    return Promise.resolve();
  }
  stop() {}
  async controllerUrl() {
    return this._url;
  }
  send(msg) {
    if (msg?.t === 'haptic') this.sdk.haptic(msg.pattern);
    else this.sdk.send(msg);
  }
}

/** Exemoo button → fruit-slice button. */
const SLICE_BUTTONS = { action: 'select', recenter: 'calibrate', pause: 'pause', back: 'pause' };

/** fruit-slice PhoneLink, fed by the shell's phone. */
export class SliceLink {
  constructor({ layout = 'slice', title } = {}) {
    this.latestSample = null;
    this.packetRate = 0;
    this._info = { status: 'waiting' };
    this._l = new Listeners();
    this._count = 0;
    this.sdk = connectExemoo({ layout, title });
    this.sdk.on('status', (s) => {
      this._setInfo(
        s.connected
          ? { status: 'connected', pin: s.pin, joinUrl: s.padUrl, transport: s.transport }
          : { status: 'waiting', pin: s.pin, joinUrl: s.padUrl, message: 'Scan the code with your phone' },
      );
    });
    this.sdk.on('packet', (p) => {
      this._count++;
      // held: the pad's blade area (action) is being touched. Camera assist is not used by fruit-slice.
      const sample = { seq: p.seq, t: p.t, quat: legacyQuat(p.q), accel: [p.acc.x, p.acc.y, p.acc.z], receivedAt: performance.now(), held: this.sdk.held(p, 'action') };
      this.latestSample = sample;
      this._l.emit('sample', sample);
    });
    this.sdk.on('button', (b) => {
      const mapped = SLICE_BUTTONS[b];
      if (mapped) this._l.emit('button', mapped);
    });
    setInterval(() => {
      this.packetRate = this._count;
      this._count = 0;
    }, 1000);
  }
  get info() {
    return this._info;
  }
  _setInfo(info) {
    const prev = this._info;
    if (prev.status === info.status && prev.pin === info.pin && prev.joinUrl === info.joinUrl && prev.transport === info.transport) return;
    this._info = info;
    this._l.emit('info', info);
  }
  start() {
    return Promise.resolve();
  }
  stop() {}
  onInfo(cb) {
    const off = this._l.on('info', cb);
    cb(this._info);
    return off;
  }
  onSample(cb) {
    return this._l.on('sample', cb);
  }
  onButton(cb) {
    return this._l.on('button', cb);
  }
  send(msg) {
    if (msg?.t === 'haptic') this.sdk.haptic(msg.pattern);
    else this.sdk.send(msg);
  }
}
