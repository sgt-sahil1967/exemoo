// Phone motion features for a swing, for the training log (no three.js, so Node tests can import it).
//
// The phone streams its orientation quaternion (W3C DeviceOrientation: device frame → earth frame, z up), the
// acceleration (gravity removed when the phone reports it, see `lin`) and the rotation rate. Gravity makes
// "up" known, so the vertical parts are drift-free: how much the swing rises, and how the phone pitches.
// The yaw (about the vertical) is relative unless a compass heading comes with it.

const r = (n, d = 2) => (Number.isFinite(n) ? Math.round(n * 10 ** d) / 10 ** d : null);
const DEG = 180 / Math.PI;

/** Rotate v by the unit quaternion q. */
export function rotate(q, [x, y, z]) {
  const { x: qx, y: qy, z: qz, w } = q;
  const tx = 2 * (qy * z - qz * y), ty = 2 * (qz * x - qx * z), tz = 2 * (qx * y - qy * x);
  return [x + w * tx + (qy * tz - qz * ty), y + w * ty + (qz * tx - qx * tz), z + w * tz + (qx * ty - qy * tx)];
}

/** Heading (deg clockwise from north) of the device's −z axis (out of the back of the phone), or null if it points up/down. */
export function pointing(q) {
  const [x, y, z] = rotate(q, [0, 0, -1]); // earth frame: x east, y north, z up
  if (Math.hypot(x, y) < 0.2) return null;
  return (Math.atan2(x, y) * DEG + 360) % 360;
}

/**
 * Features of one swing from the streamed packets {at, q, acc, gyro} (at = epoch ms), the swing's onset and
 * contact times, and the compass samples {at, ios, abs}. Returns null when the phone sent nothing in the window.
 *   pitch0 / pitch1   elevation of the phone's long axis (device y) above horizontal at onset and contact + 100 ms (deg)
 *   dPitch            pitch1 − pitch0: the phone tipping up (+) or down (−) through the swing
 *   accPeak           peak acceleration magnitude (m/s²), accPeakAt = ms after onset
 *   accUp / accDown   largest upward / downward acceleration in earth axes (m/s²); gravity-free only if `lin`
 *   accFlat           peak horizontal acceleration (m/s²)
 *   gyroPeak          peak rotation rate (deg/s)
 *   yaw               change in the phone's pointing direction, relative (deg)
 *   heading0 / heading1  compass heading (deg from north) nearest onset and contact, ios or from the absolute orientation
 */
export function swingFeatures(packets, onsetAt, contactAt, compass = [], lin = true) {
  const win = packets.filter((p) => p.at >= onsetAt - 100 && p.at <= contactAt + 250);
  if (win.length < 3) return null;
  const nearest = (list, at) => list.reduce((b, p) => (!b || Math.abs(p.at - at) < Math.abs(b.at - at) ? p : b), null);
  const pitchOf = (p) => Math.asin(Math.max(-1, Math.min(1, rotate(p.q, [0, 1, 0])[2]))) * DEG;
  const p0 = nearest(win, onsetAt), p1 = nearest(win, contactAt + 100);
  let accPeak = 0, accPeakAt = 0, accUp = 0, accDown = 0, accFlat = 0, gyroPeak = 0;
  for (const p of win) {
    const a = [p.acc.x, p.acc.y, p.acc.z];
    const m = Math.hypot(...a);
    if (m > accPeak) (accPeak = m), (accPeakAt = p.at - onsetAt);
    const w = rotate(p.q, a);
    accUp = Math.max(accUp, w[2]);
    accDown = Math.max(accDown, -w[2]);
    accFlat = Math.max(accFlat, Math.hypot(w[0], w[1]));
    gyroPeak = Math.max(gyroPeak, Math.hypot(p.gyro.alpha, p.gyro.beta, p.gyro.gamma));
  }
  const h0 = pointing(p0.q), h1 = pointing(p1.q);
  const yaw = h0 != null && h1 != null ? ((h1 - h0 + 540) % 360) - 180 : null;
  const heading = (at) => {
    const c = nearest(compass.filter((s) => Math.abs(s.at - at) < 400), at);
    if (!c) return null;
    return c.ios ?? (c.abs ? (360 - c.abs[0]) % 360 : null);
  };
  return {
    n: win.length, lin,
    pitch0: r(pitchOf(p0), 1), pitch1: r(pitchOf(p1), 1), dPitch: r(pitchOf(p1) - pitchOf(p0), 1),
    accPeak: r(accPeak), accPeakAt: Math.round(accPeakAt), accUp: r(accUp), accDown: r(accDown), accFlat: r(accFlat),
    gyroPeak: r(gyroPeak, 0), yaw: r(yaw, 1), heading0: r(heading(onsetAt), 1), heading1: r(heading(contactAt), 1),
  };
}
