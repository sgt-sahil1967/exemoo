// Moo Bowl input: camera (hand position, throw moment) + phone (speed, curve), with phone-only, mouse and
// keyboard fallbacks. All the detection maths is in throwdetect.js; this file is the browser wiring.
//
// Sources (chosen automatically, reported in aim.source / status.source / throw.source):
//   camera+phone  stand facing the camera, phone in the bowling hand, swing: camera gives x, angle and the
//                 release, the phone gives speed and curve
//   camera        same without a phone: speed from the hand, curve from the bend of the hand path
//   phone         d-pad left / right moves the ball; HOLD Action, swing, let go (or just swing through)
//   mouse         move = aim; press, pull back, flick forward = throw.  Keyboard: Left / Right aim,
//                 A / D or Down / Up curve, Space starts the power meter, Space again throws.
// Mouse and keyboard always work. Escape / P are left alone (the UI pauses with them).

import { THROW } from './constants.js';
import { ThrowDetector, OneEuro, flickThrow, meterPower, meterSpeed, clamp, TUNING } from './throwdetect.js';
import { createHandcam } from './handcam.js';

const epoch = () => performance.timeOrigin + performance.now();
const KEY_AIM_SPEED = 0.45; // m/s across the lane while Left / Right is held
const KEY_CURVE_SPEED = 1.1; // curve units / s while A / D is held
const DPAD_STEP = THROW.maxX / 9; // one d-pad press, about two boards
const METER_PERIOD = 1.5; // s for the power meter to go up and down once

export function createInput({ exemoo, canvas } = {}) {
  const det = new ThrowDetector();
  const listeners = { throw: new Set(), status: new Set() };
  const emit = (ev, arg) => {
    for (const cb of listeners[ev]) {
      try {
        cb(arg);
      } catch (e) {
        console.error(`[bowling input] ${ev} listener failed`, e);
      }
    }
  };

  const aim = { x: 0, angle: 0, swing: 0, tracked: false, source: 'mouse' };
  const meter = { visible: false, power: 0, aim: 0, curve: 0 };
  let hand = 'right', armed = false;
  let camOn = false, phoneOn = !!exemoo?.phone?.connected, lastPoseAt = -Infinity;
  let manualX = 0, manualCurve = 0;
  let meterStart = 0, meterOn = false, keyUsedAt = -Infinity;
  const keys = new Set();
  let drag = null; // { pts: [{t, x, y}], x0 (lane x) }
  let lastStatus = '';
  const swingF = new OneEuro(3, 0.8);
  let swingTarget = 0, throwSwingUntil = 0;

  // ── hand cam ──
  let camWanted = true;
  const hc = typeof document !== 'undefined' ? createHandcam() : null;
  const handcam = {
    setVisible(on) {
      camWanted = !!on;
      hc?.setVisible(camWanted && camOn);
    },
    flash: (text, color) => hc?.flash(text, color),
  };

  // ── sources ──
  const camTracked = (now) => camOn && det.camTracked(now);
  const phoneLive = (now) => phoneOn && det.phoneAlive(now);
  function source(now) {
    const c = camTracked(now), p = phoneLive(now);
    return c && p ? 'camera+phone' : c ? 'camera' : p ? 'phone' : 'mouse';
  }
  function checkStatus(now) {
    const s = { camera: camOn, phone: phoneOn, source: source(now) };
    const key = `${s.camera}|${s.phone}|${s.source}`;
    if (key === lastStatus) return;
    lastStatus = key;
    emit('status', s);
  }

  // ── throws ──
  function fire(t) {
    if (!armed) return;
    armed = false;
    det.disarm();
    meterOn = false;
    meter.visible = false;
    drag = null;
    const out = {
      x: clamp(t.x ?? manualX, -THROW.maxX, THROW.maxX),
      angle: clamp(t.angle || 0, -THROW.maxAngle, THROW.maxAngle),
      speed: clamp(t.speed, THROW.minSpeed, THROW.maxSpeed),
      curve: clamp(t.curve || 0, -1, 1),
      source: t.source,
      detail: { camSpeed: 0, imuPeak: 0, twist: 0, ...t.detail },
    };
    aim.x = out.x;
    aim.angle = out.angle;
    swingTarget = 1;
    throwSwingUntil = performance.now() + 400;
    if (t.source !== 'mouse') hc?.flash(`${(out.speed * 2.23694).toFixed(0)} MPH${Math.abs(out.curve) > 0.15 ? (out.curve < 0 ? '  HOOK L' : '  HOOK R') : ''}`);
    emit('throw', out);
  }

  // ── shell events ──
  if (exemoo?.on) {
    exemoo.on('pose', (pose) => {
      if (!pose) return;
      camOn = true;
      lastPoseAt = performance.now();
      const now = epoch();
      const t = det.onPose(pose, now);
      hc?.update(pose, det.cam, hand);
      if (t) fire(t);
    });
    exemoo.on('packet', (p) => {
      if (!p) return;
      phoneOn = true;
      const t = det.onPacket(p, epoch());
      if (t) fire(t);
    });
    exemoo.on('camera', (on) => {
      camOn = !!on;
      if (!camOn) det.cam.reset();
      hc?.setVisible(camWanted && camOn);
      checkStatus(epoch());
    });
    exemoo.on('status', (s) => {
      phoneOn = !!s?.connected;
      if (!phoneOn) det.imu.reset();
      checkStatus(epoch());
    });
    exemoo.on('button', (b) => {
      if (!armed) return;
      if (b === 'left' || b === 'right') nudge(b === 'left' ? -DPAD_STEP : DPAD_STEP);
      else if (b === 'recenter') (manualX = 0), (manualCurve = 0);
      // A phone that sends no motion (permission denied): Action works the power meter like Space.
      else if (b === 'action' && !det.phoneAlive(epoch())) space();
    });
  }

  const nudge = (dx) => {
    manualX = clamp(manualX + dx, -THROW.maxX, THROW.maxX);
  };

  // ── keyboard ──
  function space() {
    if (!armed) return;
    keyUsedAt = performance.now();
    if (!meterOn) {
      if (camTracked(epoch())) manualX = det.cam.live.x; // start from where the hand aims
      meterOn = true;
      meterStart = performance.now();
      return;
    }
    const power = meterPower((performance.now() - meterStart) / 1000, METER_PERIOD);
    fire({ x: aimX(epoch()), angle: 0, speed: meterSpeed(power), curve: manualCurve, source: 'mouse', detail: { by: 'keyboard', power } });
  }
  const KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'Space']);
  function onKeyDown(e) {
    if (!armed || !KEYS.has(e.code) || e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (tag === 'BUTTON' && e.target.getClientRects?.().length) return; // a visible menu button keeps its keys
    e.preventDefault();
    keyUsedAt = performance.now();
    if (e.code === 'Space') {
      if (!e.repeat) space();
    } else keys.add(e.code);
  }
  const onKeyUp = (e) => keys.delete(e.code);

  // ── mouse / touch ──
  const el = canvas || (typeof document !== 'undefined' ? document.body : null);
  const laneX = (clientX) => {
    const r = el.getBoundingClientRect();
    return clamp(((clientX - r.left) / Math.max(1, r.width) - 0.5) * 2.6 * THROW.maxX, -THROW.maxX, THROW.maxX);
  };
  const dragPoint = (e) => {
    const r = el.getBoundingClientRect(), h = Math.max(1, r.height);
    return { t: performance.now(), x: (e.clientX - r.left) / h, y: (e.clientY - r.top) / h };
  };
  function onPointerDown(e) {
    if (!armed || (e.button ?? 0) !== 0) return;
    manualX = laneX(e.clientX);
    drag = { pts: [dragPoint(e)], x0: manualX };
    try {
      el.setPointerCapture?.(e.pointerId);
    } catch { /* not capturable */ }
  }
  function onPointerMove(e) {
    if (!armed) return;
    if (drag) {
      drag.pts.push(dragPoint(e));
      if (drag.pts.length > 400) drag.pts.shift();
    } else if (e.pointerType !== 'touch') manualX = laneX(e.clientX);
  }
  function onPointerUp(e) {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (!armed) return;
    d.pts.push(dragPoint(e));
    // Only the last 0.6 s counts: a long hold before the flick is aiming, not swinging.
    const t1 = d.pts[d.pts.length - 1].t;
    const f = flickThrow(d.pts.filter((p) => t1 - p.t <= 600));
    if (f) fire({ x: d.x0, angle: f.angle, speed: f.speed, curve: f.curve, source: 'mouse', detail: { by: 'mouse', flick: f.upSpeed } });
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', () => keys.clear());
    if (el) {
      el.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', () => (drag = null));
    }
  }

  /** Where the ball starts: the camera's hand position when it tracks, else the manual aim. */
  const aimX = (now) => (camTracked(now) && !drag && !meterOn ? det.cam.live.x : manualX);

  function update(dt = 1 / 60) {
    const now = epoch(), pnow = performance.now();
    dt = Math.min(0.1, Math.max(0, dt));
    // The shell stops sending poses when nobody is in view; the camera itself may still be on.
    if (camOn && det.cam.live.tracked && pnow - lastPoseAt > 1500) det.cam.reset();

    if (armed) {
      const t = det.tick(now);
      if (t) fire(t);
    }
    if (armed) {
      const kx = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
      const kc = (keys.has('KeyD') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowDown') ? 1 : 0);
      if (kx) {
        if (camTracked(now) && !meterOn) manualX = det.cam.live.x; // take over from where the hand is
        nudge(kx * KEY_AIM_SPEED * dt);
      }
      if (kc) manualCurve = clamp(manualCurve + kc * KEY_CURVE_SPEED * dt, -1, 1);
      if (kx || kc) keyUsedAt = pnow;
    }

    const src = source(now), tracked = camTracked(now);
    const keyboardActive = meterOn || pnow - keyUsedAt < 6000;
    meter.visible = armed && keyboardActive && !drag;
    meter.power = meterOn ? meterPower((pnow - meterStart) / 1000, METER_PERIOD) : 0;
    meter.curve = manualCurve;

    // Live aim.
    if (pnow < throwSwingUntil) {
      // just thrown: keep the released pose for a moment
    } else if (drag) {
      const p0 = drag.pts[0], p1 = drag.pts[drag.pts.length - 1];
      let low = p0.y;
      for (const p of drag.pts) low = Math.max(low, p.y);
      const pull = low - p0.y, fwd = low - p1.y;
      swingTarget = clamp(-clamp(pull / 0.2, 0, 1) + (fwd > 0.02 ? (fwd / (pull + 0.1)) * 2 : 0), -1, 1);
      aim.x = drag.x0;
      aim.angle = 0;
    } else if (meterOn) {
      swingTarget = -meter.power;
      aim.x = manualX;
      aim.angle = 0;
    } else if (tracked) {
      swingTarget = det.cam.live.swing;
      aim.x = det.cam.live.x;
      aim.angle = det.cam.live.angle;
    } else {
      swingTarget = det.phone.holding ? det.phone.live.swing : 0;
      aim.x = manualX;
      aim.angle = 0;
    }
    aim.swing = clamp(swingF.filter(swingTarget, pnow / 1000), -1, 1);
    aim.tracked = tracked;
    aim.source = drag || meterOn ? 'mouse' : src;
    meter.aim = clamp(aim.x / THROW.maxX, -1, 1);

    checkStatus(now);
    hc?.draw();
  }

  return {
    setHand(h) {
      hand = h === 'left' ? 'left' : 'right';
      det.setHand(hand);
    },
    arm() {
      armed = true;
      det.arm();
      meterOn = false;
      drag = null;
      keys.clear();
      swingTarget = 0;
      throwSwingUntil = 0;
    },
    disarm() {
      armed = false;
      det.disarm();
      meterOn = false;
      meter.visible = false;
      drag = null;
      keys.clear();
    },
    update,
    aim,
    meter,
    handcam,
    on(ev, cb) {
      if (!listeners[ev]) return () => {};
      listeners[ev].add(cb);
      if (ev === 'status') cb({ camera: camOn, phone: phoneOn, source: source(epoch()) });
      return () => listeners[ev].delete(cb);
    },
    /** For tuning / debugging in the console. */
    debug: { det, TUNING },
  };
}
