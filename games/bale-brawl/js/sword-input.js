// Bale Brawl - phone packets to SwordIntent (PLAN.md 3.3). Pure maths, no DOM, no three.
// The blade is the device +Y axis (top edge of the phone, held like a remote), W3C world frame
// (X east, Y north, Z up). Recenter makes the current heading "pointing at the screen".
import { SWING } from './constants.js';

const PI = Math.PI;
const D2R = PI / 180;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const wrapPi = (a) => Math.atan2(Math.sin(a), Math.cos(a));

/** v' = q v q*  (same as games/straw-shot/game.js) */
export function rotate(v, q) {
  const { x, y, z, w } = q;
  const ix = w * v.x + y * v.z - z * v.y;
  const iy = w * v.y + z * v.x - x * v.z;
  const iz = w * v.z + x * v.y - y * v.x;
  const iw = -x * v.x - y * v.y - z * v.z;
  return {
    x: ix * w + iw * -x + iy * -z - iz * -y,
    y: iy * w + iw * -y + iz * -x - ix * -z,
    z: iz * w + iw * -z + ix * -y - iy * -x,
  };
}

const BLADE = { x: 0, y: 1, z: 0 };
const HIST_MS = 400;

/** Blade frame (bx right, by up, bz forward) of world blade vector v for a recenter heading yaw0. */
export function bladeFrame(v, yaw0) {
  const s = Math.sin(yaw0), c = Math.cos(yaw0);
  return { bx: v.x * c - v.y * s, by: v.z, bz: v.x * s + v.y * c };
}

export function createPhoneSword() {
  const S = {
    qLive: false, recenterNext: true, yaw0: 0,
    yaw: 0, pitch: 0.4, yawS: 0, pitchS: 0.4, bladeAngle: PI / 2,
    gyroYaw: 0, gyroPitch: 0,
    lastT: null, clock: 0, sincePacket: Infinity, packets: 0,
    guardOverride: null, buttonGuard: false,
    hist: [],            // { t, bx, by } blade tip (raw) in the player frame
    over: 0, swinging: false, startT: 0, peak: 0, peakTip: null, originTip: null,
    cooldownUntil: -Infinity, pending: null,
    rate: 0, rateAvg: 0,
  };

  function guardHeld() { return S.guardOverride != null ? S.guardOverride : S.buttonGuard; }

  function tipAt(t) {
    // blade tip at time t (linear between history samples; clamps to the ends)
    const h = S.hist;
    if (!h.length) return { bx: 0, by: 0 };
    if (t <= h[0].t) return h[0];
    for (let k = h.length - 1; k >= 0; k--) {
      if (h[k].t <= t) {
        const a = h[k], b = h[k + 1];
        if (!b) return a;
        const u = (t - a.t) / Math.max(1e-6, b.t - a.t);
        return { bx: a.bx + (b.bx - a.bx) * u, by: a.by + (b.by - a.by) * u };
      }
    }
    return h[0];
  }

  function fire(t) {
    S.swinging = false;
    S.over = 0;
    const o = S.originTip, p = S.peakTip || tipAt(t);
    let dbx = p.bx - o.bx, dby = p.by - o.by;
    if (Math.hypot(dbx, dby) < 1e-4) { dbx = 1; dby = 0; }
    const power = clamp((S.peak - SWING.startRate) / (SWING.fullRate - SWING.startRate), 0, 1);
    S.pending = { dir: Math.atan2(dby, dbx), power };
    S.cooldownUntil = t + SWING.cooldown * 1000;
  }

  function push(pkt) {
    if (!pkt) return;
    const t = Number.isFinite(pkt.t) ? pkt.t : (S.lastT ?? 0) + 16;
    let dtMs = S.lastT == null ? 16 : ((t - S.lastT) >>> 0) || 16;
    if (dtMs > 200) dtMs = 16;    // gap in the stream
    S.clock = S.lastT == null ? 0 : S.clock + dtMs;   // monotonic local clock (handles u32 wrap)
    S.lastT = t;
    const now = S.clock, dt = dtMs / 1000;
    S.sincePacket = 0;
    S.packets++;
    S.buttonGuard = !!((pkt.buttons >>> 0) & 1);

    const q = pkt.q || { x: 0, y: 0, z: 0, w: 0 };
    if (!S.qLive && Math.abs(q.x) + Math.abs(q.y) + Math.abs(q.z) > 1e-4) { S.qLive = true; S.recenterNext = true; }
    const gy = pkt.gyro || { alpha: 0, beta: 0, gamma: 0 };
    const alpha = +gy.alpha || 0, beta = +gy.beta || 0;

    let bx, by, bz;
    if (S.qLive) {
      const v = rotate(BLADE, q);
      if (S.recenterNext) { S.yaw0 = Math.atan2(v.x, v.y); S.recenterNext = false; S.yawS = null; }
      ({ bx, by, bz } = bladeFrame(v, S.yaw0));
      S.yaw = Math.atan2(bx, bz);
      S.pitch = Math.asin(clamp(by, -1, 1));
    } else {
      // no orientation sensor: integrate the gyro (like straw-shot), slow spring back to centre
      if (S.recenterNext) { S.gyroYaw = 0; S.gyroPitch = 0; S.recenterNext = false; S.yawS = null; }
      if (Math.abs(beta) > 2) S.gyroYaw -= beta * D2R * dt;
      if (Math.abs(alpha) > 2) S.gyroPitch += alpha * D2R * dt;
      const back = Math.exp(-dt / 1.5);
      S.gyroYaw = clamp(S.gyroYaw * back, -1.4, 1.4);
      S.gyroPitch = clamp(S.gyroPitch * back, -1.2, 1.4);
      S.yaw = S.gyroYaw; S.pitch = S.gyroPitch;
      bx = Math.sin(S.yaw) * Math.cos(S.pitch); by = Math.sin(S.pitch); bz = Math.cos(S.yaw) * Math.cos(S.pitch);
    }
    if (Math.hypot(bx, by) > SWING.bladeMinHypot) S.bladeAngle = ((Math.atan2(by, bx) % PI) + PI) % PI;

    // 35 ms one-pole smoothing of the pose
    const yawC = clamp(S.yaw, -1.4, 1.4), pitchC = clamp(S.pitch, -1.2, 1.4);
    if (S.yawS == null) { S.yawS = yawC; S.pitchS = pitchC; }
    else {
      const k = 1 - Math.exp(-dtMs / SWING.smoothMs);
      S.yawS += wrapPi(yawC - S.yawS) * k;
      S.pitchS += (pitchC - S.pitchS) * k;
    }

    // blade tip history for the swing direction
    S.hist.push({ t: now, bx, by });
    while (S.hist.length > 2 && now - S.hist[0].t > HIST_MS) S.hist.shift();

    // swing detection
    const w = Math.hypot(alpha, beta);
    S.rate = w;
    if (guardHeld()) { S.swinging = false; S.over = 0; return; }
    if (S.swinging) {
      if (w > S.peak) { S.peak = w; S.peakTip = { bx, by }; }
      if (w < 0.6 * S.peak || now - S.startT >= SWING.maxMs) fire(now);
      return;
    }
    if (now < S.cooldownUntil) { S.over = 0; return; }
    if (w > SWING.startRate) {
      S.over++;
      if (S.over === 1) S.overT = now;
      if (S.over >= 2) {
        S.swinging = true;
        S.startT = S.overT;
        S.originTip = tipAt(S.startT - SWING.lookbackMs);
        S.peak = w; S.peakTip = { bx, by };
      }
    } else S.over = 0;
  }

  function read(dt = 0) {
    S.sincePacket += Math.max(0, +dt || 0);
    const live = S.packets > 0 && S.sincePacket * 1000 < SWING.noPacketMs;
    const swing = S.pending;
    S.pending = null;
    return {
      live,
      yaw: S.yawS == null ? 0 : clamp(S.yawS, -1.4, 1.4),
      pitch: S.pitchS == null ? 0 : clamp(S.pitchS, -1.2, 1.4),
      bladeAngle: S.bladeAngle,
      guard: live ? guardHeld() : !!S.guardOverride,
      swing: live && swing ? swing : null,
    };
  }

  return {
    push,
    setGuard(held) { S.guardOverride = held == null ? null : !!held; },
    recenter() { S.recenterNext = true; },
    read,
    get debug() { return { rate: S.rate, peak: S.peak, yaw0: S.yaw0, qLive: S.qLive }; },
  };
}
