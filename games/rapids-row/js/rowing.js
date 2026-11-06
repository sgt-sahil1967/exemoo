// Rapids Row - paddle stroke detection from phone motion (circles in any plane) + keyboard fallback.
// Pure JS, no dependencies.

// ---- tuning -------------------------------------------------------------
const WINDOW_S = 1.2;          // analysis window
const MIN_SPAN_S = 0.55;       // need this much history before judging
const HP_TAU = 0.8;            // s, slow EMA removed (gravity / drift)
const ACC_FLOOR = 1.2;         // m/s^2 in-plane radius needed to count
const GYRO_FLOOR = 70;         // deg/s in-plane radius needed (fallback)
const MIN_ELLIPTICITY = 0.3;   // sqrt(l2/l1): rejects back-and-forth lines
const MIN_CONSISTENCY = 0.6;   // |net rotation| / total rotation: rejects shaking
const MIN_RATE = 0.3;          // circles/s
const RATE_FULL = 1.8;         // circles/s giving full rate factor
const ACC_AMP_FULL = 9;        // m/s^2 above floor for full amplitude factor
const GYRO_AMP_FULL = 400;     // deg/s above floor
const GYRO_POWER_SCALE = 0.85;
const ATTACK_S = 0.15;
const RELEASE_S = 0.5;
const CIRCLE_LATCH_S = 0.25;   // keep "circling" this long after criteria drop
const REST_PHASE = 0.0;
const IDLE_PHASE_AFTER_S = 0.35;
const IDLE_PHASE_EASE = 4;     // 1/s
const STALE_S = 0.3;           // no packets for this long -> idle

const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const wrap01 = (a) => a - Math.floor(a);

function qrot(q, x, y, z) {
  // v' = q * v * q^-1
  const { x: qx, y: qy, z: qz, w: qw } = q;
  const tx = 2 * (qy * z - qz * y), ty = 2 * (qz * x - qx * z), tz = 2 * (qx * y - qy * x);
  return [
    x + qw * tx + (qy * tz - qz * ty),
    y + qw * ty + (qz * tx - qx * tz),
    z + qw * tz + (qx * ty - qy * tx),
  ];
}
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function norm(a) {
  const l = Math.hypot(a[0], a[1], a[2]);
  return l < 1e-12 ? null : [a[0] / l, a[1] / l, a[2] / l];
}

/** Tracks a 3D signal in a sliding window and measures consistent rotation in its plane of max variance. */
class PlaneAnalyzer {
  constructor(floor) {
    this.floor = floor;
    this.reset();
  }
  reset() {
    this.buf = [];
    this.ema = null;
    this.e1 = norm([1, 0.3, 0.1]);
    this.e2 = norm([0, 1, 0.2]);
    this.n = [0, 0, 1];
    this.res = { ok: false, rate: 0, amp: 0, ratio: 0, consistency: 0, dTheta: 0, span: 0 };
  }
  add(t, dt, v) {
    if (!this.ema) this.ema = v.slice();
    const k = 1 - Math.exp(-dt / HP_TAU);
    for (let i = 0; i < 3; i++) this.ema[i] += (v[i] - this.ema[i]) * k;
    this.buf.push({ t, v: [v[0] - this.ema[0], v[1] - this.ema[1], v[2] - this.ema[2]] });
    while (this.buf.length > 2 && t - this.buf[0].t > WINDOW_S) this.buf.shift();
    return (this.res = this._analyze());
  }
  _analyze() {
    const b = this.buf, N = b.length;
    const bad = { ok: false, rate: 0, amp: 0, ratio: 0, consistency: 0, dTheta: 0, span: 0 };
    if (N < 8) return bad;
    const span = b[N - 1].t - b[0].t;
    bad.span = span;
    if (span < MIN_SPAN_S) return bad;
    const m = [0, 0, 0];
    for (const s of b) { m[0] += s.v[0]; m[1] += s.v[1]; m[2] += s.v[2]; }
    m[0] /= N; m[1] /= N; m[2] /= N;
    // covariance
    let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0;
    for (const s of b) {
      const x = s.v[0] - m[0], y = s.v[1] - m[1], z = s.v[2] - m[2];
      xx += x * x; xy += x * y; xz += x * z; yy += y * y; yz += y * z; zz += z * z;
    }
    xx /= N; xy /= N; xz /= N; yy /= N; yz /= N; zz /= N;
    const mul = (v) => [xx * v[0] + xy * v[1] + xz * v[2], xy * v[0] + yy * v[1] + yz * v[2], xz * v[0] + yz * v[1] + zz * v[2]];
    // power iteration, warm-started from last frame (keeps basis sign/orientation stable)
    let e1 = this.e1, e2 = this.e2;
    for (let i = 0; i < 12; i++) e1 = norm(mul(e1)) || e1;
    // e2: orthogonal to e1
    let e2o = this._orth(e2, e1);
    for (let i = 0; i < 12; i++) {
      const t = norm(this._orth(mul(e2o), e1));
      if (!t) break;
      e2o = t;
    }
    e2 = e2o;
    const l1 = dot(e1, mul(e1)), l2 = dot(e2, mul(e2));
    if (dot(e1, this.e1) < 0) e1 = [-e1[0], -e1[1], -e1[2]];
    if (dot(e2, this.e2) < 0) e2 = [-e2[0], -e2[1], -e2[2]];
    this.e1 = e1; this.e2 = e2;
    let n = norm(cross(e1, e2));
    if (!n || l1 < 1e-9) return bad;
    if (dot(n, this.n) < 0) n = [-n[0], -n[1], -n[2]];
    this.n = n;
    const ratio = Math.sqrt(Math.max(0, l2) / l1);

    // in-plane rotation
    let S = 0, A = 0, R = 0, last = 0;
    let prev = null;
    for (let i = 0; i < N; i++) {
      const p = [b[i].v[0] - m[0], b[i].v[1] - m[1], b[i].v[2] - m[2]];
      const d = dot(p, n);
      const q = [p[0] - n[0] * d, p[1] - n[1] * d, p[2] - n[2] * d];
      const mag = Math.hypot(q[0], q[1], q[2]);
      R += mag;
      if (prev && prev.mag > this.floor && mag > this.floor) {
        const th = Math.atan2(dot(cross(prev.q, q), n), dot(prev.q, q));
        S += th; A += Math.abs(th);
        if (i === N - 1) last = th;
      }
      prev = { q, mag };
    }
    R /= N;
    const consistency = A > 1e-6 ? Math.abs(S) / A : 0;
    const rate = Math.abs(S) / (TAU * span);
    const ok = ratio >= MIN_ELLIPTICITY && R >= this.floor && consistency >= MIN_CONSISTENCY && rate >= MIN_RATE;
    return { ok, rate, amp: R, ratio, consistency, dTheta: ok ? Math.abs(last) : 0, span };
  }
  _orth(v, e) {
    const d = dot(v, e);
    let r = [v[0] - e[0] * d, v[1] - e[1] * d, v[2] - e[2] * d];
    if (Math.hypot(r[0], r[1], r[2]) < 1e-9) {
      // pick any perpendicular
      r = Math.abs(e[0]) < 0.9 ? cross(e, [1, 0, 0]) : cross(e, [0, 1, 0]);
    }
    return norm(r);
  }
}

export class StrokeDetector {
  constructor() {
    this._cbs = [];
    this.acc = new PlaneAnalyzer(ACC_FLOOR);
    this.gyr = new PlaneAnalyzer(GYRO_FLOOR);
    this.recenter();
  }

  recenter() {
    this.acc.reset(); this.gyr.reset();
    this.power = 0; this.phase = REST_PHASE; this.reverse = false; this.rate = 0;
    this._lastT = null; this._targetPower = 0; this._targetRate = 0;
    this._circT = 99; this._idleT = 99; this._sincePush = 99;
    this._strokeAngle = 0; this._src = 'none'; this._strokes = 0;
  }

  onStroke(cb) {
    this._cbs.push(cb);
    return () => { this._cbs = this._cbs.filter((c) => c !== cb); };
  }

  push(p) {
    if (!p) return;
    this.reverse = !!((p.buttons | 0) & 1);
    this._sincePush = 0;
    let dt = 1 / 60;
    if (typeof p.t === 'number') {
      if (this._lastT != null) {
        const d = (p.t - this._lastT) / 1000;
        if (d > 0 && d < 0.2) dt = d;
        else if (d >= 0.2 || d < 0) this._reseed();
      }
      this._lastT = p.t;
    }
    this._clock = (this._clock || 0) + dt;
    const t = this._clock;
    const q = p.q && typeof p.q.w === 'number' ? p.q : { x: 0, y: 0, z: 0, w: 1 };
    const a = p.acc || { x: 0, y: 0, z: 0 };
    const g = p.gyro || { alpha: 0, beta: 0, gamma: 0 };
    const aw = qrot(q, a.x || 0, a.y || 0, a.z || 0);
    // rotationRate: alpha about z, beta about x, gamma about y (device axes)
    const gw = qrot(q, g.beta || 0, g.gamma || 0, g.alpha || 0);
    const ra = this.acc.add(t, dt, aw);
    const rg = this.gyr.add(t, dt, gw);

    let use = null, ampF = 0, scale = 1;
    if (ra.ok) { use = ra; ampF = clamp((ra.amp - ACC_FLOOR) / ACC_AMP_FULL, 0, 1); this._src = 'acc'; }
    else if (rg.ok) { use = rg; ampF = clamp((rg.amp - GYRO_FLOOR) / GYRO_AMP_FULL, 0, 1); scale = GYRO_POWER_SCALE; this._src = 'gyro'; }
    else this._src = 'none';

    if (use) {
      const rateF = clamp(use.rate / RATE_FULL, 0, 1);
      const gate = clamp((use.rate - MIN_RATE) / 0.3, 0, 1);
      this._targetPower = clamp(Math.pow(rateF, 0.9) * (0.55 + 0.45 * ampF) * gate * scale, 0, 1);
      this._targetRate = use.rate;
      this._circT = 0; this._idleT = 0;
      this.phase = wrap01(this.phase + use.dTheta / TAU);
      this._strokeAngle += use.dTheta;
      while (this._strokeAngle >= TAU) {
        this._strokeAngle -= TAU;
        this._strokes++;
        const ev = { strength: clamp(Math.max(this.power, this._targetPower), 0, 1) };
        for (const cb of this._cbs) cb(ev);
      }
    }
  }

  _reseed() { this.acc.reset(); this.gyr.reset(); }

  update(dt) {
    if (!(dt > 0)) return;
    this._circT += dt; this._idleT += dt; this._sincePush += dt;
    const live = this._circT < CIRCLE_LATCH_S && this._sincePush < STALE_S;
    const tp = live ? this._targetPower : 0;
    const tr = live ? this._targetRate : 0;
    const tau = tp > this.power ? ATTACK_S : RELEASE_S;
    this.power += (tp - this.power) * (1 - Math.exp(-dt / tau));
    this.rate += (tr - this.rate) * (1 - Math.exp(-dt / 0.2));
    if (this.power < 0.003 && tp === 0) this.power = 0;
    if (this.rate < 0.01 && tr === 0) this.rate = 0;
    if (this._idleT > IDLE_PHASE_AFTER_S || this._sincePush >= STALE_S) {
      if (this._idleT > 0.8) this._strokeAngle = 0;
      let d = REST_PHASE - this.phase; d -= Math.round(d);
      this.phase = wrap01(this.phase + d * Math.min(1, dt * IDLE_PHASE_EASE));
    }
  }

  get debug() {
    const r = this._src === 'gyro' ? this.gyr.res : this.acc.res;
    return {
      source: this._src, power: this.power, rate: this.rate, phase: this.phase, reverse: this.reverse,
      targetPower: this._targetPower, circling: this._circT < CIRCLE_LATCH_S,
      amp: r.amp, ratio: r.ratio, consistency: r.consistency, windowRate: r.rate,
      accAmp: this.acc.res.amp, gyroAmp: this.gyr.res.amp, accOk: this.acc.res.ok, gyroOk: this.gyr.res.ok,
      strokeAngle: this._strokeAngle, strokes: this._strokes,
    };
  }
}

// ---------------------------------------------------------------------------------------------

const HOLD_AFTER_S = 0.35;     // key down this long = "holding"
const HOLD_STROKE_RATE = 1.0;  // strokes/s while holding
const TAP_WINDOW_S = 1.2;
const TAP_TIMEOUT_S = 0.75;    // no tap for this long -> stop
const MAX_STROKE_RATE = 2.6;

export class KeyStroker {
  constructor({ forward = 'KeyW', back = 'KeyS' } = {}) {
    this.forwardKey = forward; this.backKey = back;
    this._cbs = [];
    this.power = 0; this.phase = 0; this.reverse = false; this.rate = 0;
    this._t = 0;
    this._fwdDown = false; this._backDown = false;
    this._downAt = 0;
    this._taps = [];
    this._dir = 0; // 1 forward, -1 back
    this._targetPower = 0; this._targetRate = 0;
    this._onDown = (e) => this._key(e, true);
    this._onUp = (e) => this._key(e, false);
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('keydown', this._onDown);
      window.addEventListener('keyup', this._onUp);
    }
  }

  destroy() {
    if (typeof window !== 'undefined' && window.removeEventListener) {
      window.removeEventListener('keydown', this._onDown);
      window.removeEventListener('keyup', this._onUp);
    }
    this._cbs = [];
  }

  onStroke(cb) { this._cbs.push(cb); return () => { this._cbs = this._cbs.filter((c) => c !== cb); }; }
  push() {}
  recenter() { this.power = 0; this.rate = 0; this.phase = 0; this._taps = []; this._targetPower = 0; this._targetRate = 0; }

  _key(e, down) {
    const code = e.code || e.key;
    const isF = code === this.forwardKey, isB = code === this.backKey;
    if (!isF && !isB) return;
    if (e.preventDefault) e.preventDefault();
    if (down) {
      if (e.repeat) return;
      this._press(isF ? 1 : -1);
    } else {
      this._release(isF ? 1 : -1);
    }
  }

  /** Programmatic input (also used by tests): dir = 1 forward, -1 back. */
  _press(dir) {
    if (dir > 0) this._fwdDown = true; else this._backDown = true;
    if (this._dir !== dir) { this._taps = []; this._dir = dir; }
    this._downAt = this._t;
    this._taps.push(this._t);
    this._retarget();
  }
  _release(dir) {
    if (dir > 0) this._fwdDown = false; else this._backDown = false;
    this._retarget();
  }

  _retarget() {
    const t = this._t;
    this._taps = this._taps.filter((x) => t - x <= TAP_WINDOW_S);
    // tap rate from recent intervals
    let tapRate = 0;
    if (this._taps.length >= 2) {
      const span = this._taps[this._taps.length - 1] - this._taps[0];
      if (span > 0.02) tapRate = (this._taps.length - 1) / span;
    }
    const down = this._dir > 0 ? this._fwdDown : this._backDown;
    const holding = down && t - this._downAt >= HOLD_AFTER_S;
    const recent = this._taps.length && t - this._taps[this._taps.length - 1] <= TAP_TIMEOUT_S;
    let sr = 0;
    if (holding) sr = HOLD_STROKE_RATE;
    else if (recent) sr = tapRate > 0 ? tapRate / 2 : 0.6; // each tap = half a stroke
    else if (down) sr = 0.6; // just pressed, wait to see if it's a hold
    sr = Math.min(sr, MAX_STROKE_RATE);
    this._targetRate = sr;
    this._targetPower = sr > 0 ? clamp(0.3 + 0.4 * sr, 0, 1) : 0;
    this._reverseNow = this._dir < 0 && sr > 0;
  }

  update(dt) {
    if (!(dt > 0)) return;
    this._t += dt;
    this._retarget();
    const tau = this._targetPower > this.power ? ATTACK_S : RELEASE_S;
    this.power += (this._targetPower - this.power) * (1 - Math.exp(-dt / tau));
    if (this._targetPower === 0 && this.power < 0.003) this.power = 0;
    this.rate += (this._targetRate - this.rate) * (1 - Math.exp(-dt / 0.2));
    if (this._targetRate === 0 && this.rate < 0.01) this.rate = 0;
    if (this._targetPower > 0 || this.power > 0.02) this.reverse = !!this._reverseNow;
    else this.reverse = false;
    if (this._targetRate > 0) {
      const before = this.phase;
      this.phase += this._targetRate * dt;
      const crossed = Math.floor(this.phase) - Math.floor(before);
      this.phase = wrap01(this.phase);
      for (let i = 0; i < crossed; i++) for (const cb of this._cbs) cb({ strength: clamp(this.power, 0, 1) });
    } else {
      let d = REST_PHASE - this.phase; d -= Math.round(d);
      this.phase = wrap01(this.phase + d * Math.min(1, dt * IDLE_PHASE_EASE));
    }
  }

  get debug() {
    return { power: this.power, rate: this.rate, phase: this.phase, reverse: this.reverse, targetPower: this._targetPower };
  }
}
