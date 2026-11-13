// Bumper Carts - phone packets to CartIntent (PLAN.md 5.2). Pure maths, no DOM, no three.
// The phone is held flat like a tray. We read gravity in the phone's own frame (pitch and roll only,
// never heading): right edge down = +x (screen right), top edge down / tipped away = +y (up the screen).
import { TILT } from './constants.js';

const D2R = Math.PI / 180;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/** World up expressed in the phone frame, x and y components (W3C device frame, quaternion device->world). */
export function upInPhone(q) {
  const { x, y, z, w } = q;
  return { ux: 2 * (x * z - w * y), uy: 2 * (y * z + w * x) };
}

/** Raw tilt (-ux, -uy): + x = right edge down, + y = top edge down. Magnitude = sin(tilt angle). */
export function rawTilt(q) {
  const { ux, uy } = upInPhone(q);
  return { x: -ux, y: -uy };
}

/** Dead zone + full scale: maps a tilt vector to an intent vector with |out| <= 1. */
export function shapeTilt(tx, ty, dead = TILT.dead, full = TILT.full) {
  const m = Math.hypot(tx, ty);
  if (m < 1e-9) return { x: 0, y: 0 };
  const mag = clamp((m - dead) / (full - dead), 0, 1);
  return { x: (tx / m) * mag, y: (ty / m) * mag };
}

export function createPhoneTilt() {
  const S = {
    qLive: false, recenterNext: true,
    raw: { x: 0, y: 0 }, raw0: { x: 0, y: 0 },
    gx: 0, gy: 0,                // gyro-only fallback: integrated roll / pitch (rad)
    sx: 0, sy: 0,                // smoothed output
    lastT: null, sincePacket: Infinity, packets: 0,
    action: false,
  };

  function push(pkt, actionHeld) {
    if (!pkt) return;
    const t = Number.isFinite(pkt.t) ? pkt.t : (S.lastT ?? 0) + 16;
    let dtMs = S.lastT == null ? 16 : ((t - S.lastT) >>> 0) || 16;
    if (dtMs > 200) dtMs = 16;   // gap in the stream
    S.lastT = t;
    const dt = dtMs / 1000;
    S.sincePacket = 0;
    S.packets++;
    S.action = actionHeld == null ? !!((pkt.buttons >>> 0) & 1) : !!actionHeld;

    const q = pkt.q || { x: 0, y: 0, z: 0, w: 0 };
    const hasQ = Math.abs(q.x) + Math.abs(q.y) + Math.abs(q.z) > 1e-4;
    if (!S.qLive && hasQ) { S.qLive = true; S.recenterNext = true; }

    if (S.qLive) {
      S.raw = rawTilt(q);
    } else {
      // No orientation sensor: integrate the gyro rate (deg/s, W3C rotationRate), slow spring back to flat.
      // beta = rate about the device x axis (+ = top edge rises), gamma = about device y (+ = right edge drops).
      const gy = pkt.gyro || { alpha: 0, beta: 0, gamma: 0 };
      const beta = +gy.beta || 0, gamma = +gy.gamma || 0;
      if (Math.abs(gamma) > TILT.gyroMinDeg) S.gx += gamma * D2R * dt;
      if (Math.abs(beta) > TILT.gyroMinDeg) S.gy -= beta * D2R * dt;
      const back = Math.exp(-dt / TILT.gyroSpring);
      S.gx = clamp(S.gx * back, -1.2, 1.2);
      S.gy = clamp(S.gy * back, -1.2, 1.2);
      S.raw = { x: Math.sin(S.gx), y: Math.sin(S.gy) };
    }

    if (S.recenterNext) {
      S.recenterNext = false;
      if (S.qLive) {
        if (Math.hypot(S.raw.x, S.raw.y) <= TILT.recenterMax) S.raw0 = { ...S.raw };
      } else {
        S.gx = 0; S.gy = 0; S.raw = { x: 0, y: 0 }; S.raw0 = { x: 0, y: 0 };
      }
    }

    const target = shapeTilt(S.raw.x - S.raw0.x, S.raw.y - S.raw0.y);
    const k = 1 - Math.exp(-dtMs / TILT.smoothMs);
    S.sx += (target.x - S.sx) * k;
    S.sy += (target.y - S.sy) * k;
    const m = Math.hypot(S.sx, S.sy);
    if (m > 1) { S.sx /= m; S.sy /= m; }
  }

  function read(dt = 0) {
    S.sincePacket += Math.max(0, +dt || 0);
    const live = S.packets > 0 && S.sincePacket * 1000 < TILT.noPacketMs;
    if (!live) return { live: false, x: 0, y: 0, charge: false };
    return { live: true, x: S.sx, y: S.sy, charge: S.action };
  }

  return {
    push,
    recenter() { S.recenterNext = true; },
    read,
    get debug() {
      return { raw: { ...S.raw }, raw0: { ...S.raw0 }, qLive: S.qLive, packets: S.packets, out: { x: S.sx, y: S.sy }, action: S.action };
    },
  };
}
