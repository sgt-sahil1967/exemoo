// Rapids Row - boat physics. Pure JS (no three.js). See CONTRACT.md.
// World: forward = (-sin h, -cos h); right = (cos h, -sin h); +h turns LEFT.

// ---- tuning -------------------------------------------------------------
const SUBSTEP = 1 / 120;
const MAX_SUBSTEPS = 40;
const THRUST_K = 3.85;        // m/s^2 per paddle at effective power 1 (v2: ~22 m/s top speed)
const POWER_EXP = 1.3;        // thrust ~ power^1.3 (keyboard hold 0.7 -> ~15 m/s)
const REVERSE_K = 0.55;       // reverse thrust multiplier
const SYNC_BONUS = 0.15;      // extra thrust when both paddles in phase
const SYNC_POWER_MIN = 0.4;
const SYNC_PHASE_FULL = 0.2;  // phase diff (cycles) below which sync = 1
const SYNC_PHASE_ZERO = 0.4;  // ...and above which sync = 0
const DRAG_LIN = 0.35;        // linear water drag (1/s)
const DRAG_QUAD = 0.0045;     // quadratic water drag (1/m)
const KEEL = 4.0;             // lateral velocity decay (1/s)
const CURRENT_SCALE = 1.2;    // track.current (1.5 calm) -> m/s drift (~1.8 calm)
const YAW_K = 2.2;            // yaw accel per unit effective-power difference
const YAW_SPEED_REF = 30;     // yaw torque scaled by 1/(1+speed/ref) so it isn't twitchy when fast
const YAW_DAMP = 2.5;         // yaw rate damping (1/s)
const ALIGN_K = 1.4;          // auto-align yaw accel per rad when idle
const IDLE_POWER = 0.05;
const BANK_MARGIN = 1.4;      // keep centre this far inside the bank
const BANK_RESTITUTION = 0.3;
const BANK_SPEED_KEEP = 0.7;  // speed multiplier on a hard bank hit
const HALF_LENGTH = 2.4;      // hull capsule
const HULL_RADIUS = 0.6;
const OBST_RESTITUTION = 0.35;
const OBST_MAX_LOSS = 0.4;    // max speed fraction lost on a head-on hit
const SPIN_K = 0.12;          // yaw kick from off-centre hits
const HIT_COOLDOWN = 0.8;     // s, per obstacle / bank
const HIT_MIN_IMPACT = 0.4;   // m/s below which no onHit is emitted
const INVULN_TIME = 1.5;      // s of hazard immunity after respawn
const HIT_FULL_IMPACT = 8;    // impact (m/s) mapping to strength 1

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const wrapPi = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
const wrap01 = (a) => a - Math.floor(a);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

export class Boat {
  constructor(track) {
    this.track = track;
    this._hitCbs = [];
    this.sync = 0;
    this.reset();
  }

  reset(at) {
    const st = at || this.track.start;
    this.x = st.x; this.z = st.z; this.heading = st.heading || 0;
    this.s = st.s || 0;
    this.invulnerable = at ? INVULN_TIME : 0;
    this.vx = 0; this.vz = 0; this.yawRate = 0;
    this.speed = 0; this.forwardSpeed = 0;
    this.lateral = 0; this.halfWidth = 12; this.current = 0;
    this.sync = 0;
    this.finished = false;
    this._time = 0;
    this._cool = new Map();
    this._bankCool = 0;
    const loc = this.track.locate(this.x, this.z, this.s);
    this._applyLoc(loc);
    // start already drifting with the water
    const fl = this.current * CURRENT_SCALE;
    this.vx = loc.tx * fl; this.vz = loc.tz * fl;
    this._updateDerived();
  }

  onHit(cb) { this._hitCbs.push(cb); return () => { this._hitCbs = this._hitCbs.filter((c) => c !== cb); }; }

  _emit(kind, strength, x, z, type, hazard) {
    const ev = { kind, type: type || kind, hazard: !!hazard, strength: clamp(strength, 0, 1), x, z };
    for (const cb of this._hitCbs) cb(ev);
  }

  _applyLoc(loc) {
    this.s = loc.s; this.lateral = loc.lateral; this.halfWidth = loc.halfWidth;
    this.current = loc.current; this._tx = loc.tx; this._tz = loc.tz;
  }

  _updateDerived() {
    this.speed = Math.hypot(this.vx, this.vz);
    this.forwardSpeed = this.vx * -Math.sin(this.heading) + this.vz * -Math.cos(this.heading);
    this.finished = this.s >= this.track.finishS;
  }

  step(dt, paddles) {
    if (!(dt > 0)) return;
    dt = Math.min(dt, 0.25);
    const L = paddles && paddles[0] || {};
    const R = paddles && paddles[1] || {};
    const pl = clamp(L.power || 0, 0, 1), pr = clamp(R.power || 0, 0, 1);
    const el = Math.pow(pl, POWER_EXP), er = Math.pow(pr, POWER_EXP);
    const tl = (L.reverse ? -el * REVERSE_K : el) * THRUST_K;
    const tr = (R.reverse ? -er * REVERSE_K : er) * THRUST_K;
    const yawIn = (R.reverse ? -er * REVERSE_K : er) - (L.reverse ? -el * REVERSE_K : el);

    // sync
    let syncT = 0;
    if (pl > SYNC_POWER_MIN && pr > SYNC_POWER_MIN && !L.reverse && !R.reverse) {
      const d = Math.abs(wrapPi(((L.phase || 0) - (R.phase || 0)) * 2 * Math.PI)) / (2 * Math.PI);
      syncT = 1 - smooth(SYNC_PHASE_FULL, SYNC_PHASE_ZERO, d);
    }
    this.sync += (syncT - this.sync) * (1 - Math.exp(-6 * dt));
    const bonus = 1 + SYNC_BONUS * this.sync;
    const thrust = (tl + tr) * (tl > 0 && tr > 0 ? bonus : 1);
    const yawTorque = yawIn * YAW_K;
    const idle = 1 - clamp(Math.max(pl, pr) / IDLE_POWER, 0, 1);

    const n = Math.min(MAX_SUBSTEPS, Math.ceil(dt / SUBSTEP));
    const h = dt / n;
    for (let i = 0; i < n; i++) this._sub(h, thrust, yawTorque, idle);
    this._updateDerived();
  }

  _sub(h, thrust, yawTorque, idle) {
    this._time += h;
    if (this.invulnerable > 0) this.invulnerable = Math.max(0, this.invulnerable - h);
    // current track state at last position
    const loc = this.track.locate(this.x, this.z, this.s);
    this._applyLoc(loc);
    const fl = loc.current * CURRENT_SCALE;
    const flx = loc.tx * fl, flz = loc.tz * fl;

    // yaw
    let yawAcc = yawTorque / (1 + this.speed / YAW_SPEED_REF) - YAW_DAMP * this.yawRate;
    if (idle > 0) {
      const ht = Math.atan2(-loc.tx, -loc.tz);
      yawAcc += ALIGN_K * idle * wrapPi(ht - this.heading);
    }
    this.yawRate += yawAcc * h;
    this.heading += this.yawRate * h;

    // velocity relative to water, in boat axes
    const fx = -Math.sin(this.heading), fz = -Math.cos(this.heading);
    const rx = Math.cos(this.heading), rz = -Math.sin(this.heading);
    const rvx = this.vx - flx, rvz = this.vz - flz;
    let u = rvx * fx + rvz * fz;
    let w = rvx * rx + rvz * rz;
    u += (thrust - DRAG_LIN * u - DRAG_QUAD * Math.abs(u) * u) * h;
    w *= Math.exp(-KEEL * h);
    this.vx = flx + fx * u + rx * w;
    this.vz = flz + fz * u + rz * w;

    this.x += this.vx * h;
    this.z += this.vz * h;

    this._bank(loc);
    this._obstacles();
    this._applyLoc(this.track.locate(this.x, this.z, this.s));
  }

  _bank(loc0) {
    const loc = this.track.locate(this.x, this.z, this.s);
    const rnx = -loc.tz, rnz = loc.tx; // track right normal
    const fx = -Math.sin(this.heading), fz = -Math.cos(this.heading);
    const lim = loc.halfWidth - BANK_MARGIN - 1.0 * Math.abs(fx * rnx + fz * rnz);
    const over = Math.abs(loc.lateral) - lim;
    if (over <= 0) return;
    const sgn = loc.lateral > 0 ? 1 : -1;
    const nox = rnx * sgn, noz = rnz * sgn; // outward normal
    this.x -= nox * over; this.z -= noz * over;
    const vn = this.vx * nox + this.vz * noz;
    if (vn > 0) {
      this.vx -= (1 + BANK_RESTITUTION) * vn * nox;
      this.vz -= (1 + BANK_RESTITUTION) * vn * noz;
      const keep = 1 - (1 - BANK_SPEED_KEEP) * clamp(vn / 3, 0.15, 1);
      this.vx *= keep; this.vz *= keep;
      // nudge heading back along the river
      const ht = Math.atan2(-loc.tx, -loc.tz);
      this.yawRate += clamp(wrapPi(ht - this.heading), -1, 1) * 1.0;
      if (vn > HIT_MIN_IMPACT && this._time >= this._bankCool) {
        this._bankCool = this._time + HIT_COOLDOWN;
        this._emit('bank', vn / HIT_FULL_IMPACT, this.x, this.z);
      }
    }
  }

  _obstacles() {
    const obs = this.track.obstacles;
    if (!obs) return;
    const fx = -Math.sin(this.heading), fz = -Math.cos(this.heading);
    const bx0 = this.x - fx * HALF_LENGTH, bz0 = this.z - fz * HALF_LENGTH;
    const bx1 = this.x + fx * HALF_LENGTH, bz1 = this.z + fz * HALF_LENGTH;
    for (let i = 0; i < obs.length; i++) {
      const o = obs[i];
      if (o.solid === false && !o.hazard) continue;
      // live bounds (works for moving obstacles and segments)
      const seg = o.shape === 'segment';
      const ax = seg ? o.x1 : o.x, az = seg ? o.z1 : o.z;
      const cx = seg ? o.x2 : o.x, cz = seg ? o.z2 : o.z;
      const m = o.r + HALF_LENGTH + HULL_RADIUS;
      if (Math.max(ax, cx) + m < this.x || Math.min(ax, cx) - m > this.x ||
          Math.max(az, cz) + m < this.z || Math.min(az, cz) - m > this.z) continue;
      const cl = closestSegSeg(bx0, bz0, bx1, bz1, ax, az, cx, cz);
      const pen = o.r + HULL_RADIUS - cl.dist;
      if (pen <= 0) continue;
      let nx, nz; // from obstacle toward boat
      if (cl.dist < 1e-6) { nx = -fz; nz = fx; } else { nx = (cl.px - cl.qx) / cl.dist; nz = (cl.pz - cl.qz) / cl.dist; }
      const ovx = o.vx || 0, ovz = o.vz || 0;
      let rvx = this.vx - ovx, rvz = this.vz - ovz;
      const vn = rvx * nx + rvz * nz;
      if (o.hazard) {
        if (this.invulnerable > 0) continue;
        const cd = this._cool.get(i) || 0;
        if (this._time >= cd) {
          this._cool.set(i, this._time + 3);
          this._emit(o.type, Math.max(0.3, -vn / HIT_FULL_IMPACT), this.x, this.z, o.type, true);
        }
        continue;
      }
      this.x += nx * pen; this.z += nz * pen;
      if (vn < 0) {
        const impact = -vn;
        rvx -= (1 + OBST_RESTITUTION) * vn * nx;
        rvz -= (1 + OBST_RESTITUTION) * vn * nz;
        const soft = o.type === 'buoy' ? 0.4 : 1;
        const keep = 1 - OBST_MAX_LOSS * soft * clamp(impact / HIT_FULL_IMPACT, 0, 1);
        this.vx = ovx + rvx * keep; this.vz = ovz + rvz * keep;
        const lx = cl.px - this.x, lz = cl.pz - this.z;
        this.yawRate += SPIN_K * (lz * nx - lx * nz) * impact * 0.5;
        this.yawRate = clamp(this.yawRate, -3, 3);
        const cd = this._cool.get(i) || 0;
        if (impact > HIT_MIN_IMPACT && this._time >= cd) {
          this._cool.set(i, this._time + HIT_COOLDOWN);
          this._emit(o.type === 'log' || o.type === 'buoy' ? o.type : 'rock', impact / HIT_FULL_IMPACT, this.x, this.z, o.type, false);
        }
      }
    }
  }
}

// closest points between segments P (p0->p1) and Q (q0->q1) in the XZ plane
function closestSegSeg(p0x, p0z, p1x, p1z, q0x, q0z, q1x, q1z) {
  const d1x = p1x - p0x, d1z = p1z - p0z, d2x = q1x - q0x, d2z = q1z - q0z;
  const rx = p0x - q0x, rz = p0z - q0z;
  const a = d1x * d1x + d1z * d1z, e = d2x * d2x + d2z * d2z;
  const f = d2x * rx + d2z * rz;
  let sP, tQ;
  if (a < 1e-9 && e < 1e-9) { sP = 0; tQ = 0; }
  else if (a < 1e-9) { sP = 0; tQ = clamp(f / e, 0, 1); }
  else {
    const c = d1x * rx + d1z * rz;
    if (e < 1e-9) { tQ = 0; sP = clamp(-c / a, 0, 1); }
    else {
      const b = d1x * d2x + d1z * d2z;
      const den = a * e - b * b;
      sP = den > 1e-9 ? clamp((b * f - c * e) / den, 0, 1) : 0;
      tQ = (b * sP + f) / e;
      if (tQ < 0) { tQ = 0; sP = clamp(-c / a, 0, 1); }
      else if (tQ > 1) { tQ = 1; sP = clamp((b - c) / a, 0, 1); }
    }
  }
  const px = p0x + d1x * sP, pz = p0z + d1z * sP, qx = q0x + d2x * tQ, qz = q0z + d2z * tQ;
  return { px, pz, qx, qz, dist: Math.hypot(px - qx, pz - qz) };
}
