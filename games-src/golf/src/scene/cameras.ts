/** Camera director: per-mode targets with critically damped transitions, terrain-aware. */
import { CatmullRomCurve3, PerspectiveCamera, Vector3 } from 'three';
import type { CameraMode, Hole } from '../core/contracts';
import { yawForward, yawTo } from '../core/contracts';
import { clamp, easeInOut, lerp, smoothDampV, smoothstep } from './util';

export interface CamOpts {
  ball?: Vector3;
  target?: Vector3;
  yaw?: number;
  instant?: boolean;
}

const UP = new Vector3(0, 1, 0);
const FLY_GLIDE = 4.8;
const FLY_HOLD = 1.3;

export class CameraRig {
  mode: CameraMode = 'menu';
  busy = false;
  private hole: Hole | null = null;
  private heightAt: (x: number, z: number) => number = () => 0;
  private opts: CamOpts = {};
  private pos = new Vector3(0, 80, 80);
  private look = new Vector3();
  private up = new Vector3(0, 1, 0);
  private vPos = new Vector3();
  private vLook = new Vector3();
  private dPos = new Vector3();
  private dLook = new Vector3();
  private dUp = new Vector3(0, 1, 0);
  private t = 0;
  private orbit = 0;
  private curve: CatmullRomCurve3 | null = null;
  private ball = new Vector3();
  private lastBall = new Vector3();
  private ballVel = new Vector3();
  private lastAnchor = new Vector3();
  private sideBlend = 0;
  private nearBlend = 0;
  private apexSeen = false;
  private landingDir = new Vector3(0, 0, 1);
  private snapNext = true;

  constructor(readonly camera: PerspectiveCamera) {}

  setHole(hole: Hole, heightAt: (x: number, z: number) => number) {
    this.hole = hole;
    this.heightAt = heightAt;
    const pts = hole.centerline.map((p) => new Vector3(p.x, heightAt(p.x, p.z), p.z));
    if (pts.length < 2) pts.push(hole.pin.clone());
    pts[pts.length - 1] = hole.pin.clone();
    this.curve = new CatmullRomCurve3(pts, false, 'centripetal');
    this.snapNext = true;
  }

  /** Live ball position, fed by the scene every frame. */
  trackBall(p: Vector3, dt: number) {
    if (dt > 0) {
      const v = new Vector3().subVectors(p, this.lastBall).divideScalar(dt);
      if (v.length() < 150) this.ballVel.lerp(v, 1 - Math.exp(-10 * dt));
    }
    this.lastBall.copy(p);
    this.ball.copy(p);
  }

  set(mode: CameraMode, opts: CamOpts = {}) {
    const changed = mode !== this.mode || mode === 'flyover';
    this.opts = { ...opts, ball: opts.ball?.clone(), target: opts.target?.clone() };
    if (changed) {
      this.mode = mode;
      this.t = 0;
      this.busy = mode === 'flyover';
      this.sideBlend = 0;
      this.apexSeen = false;
      if (mode === 'celebrate' && this.opts.target) {
        const d = new Vector3().subVectors(this.pos, this.opts.target);
        this.orbit = Math.atan2(d.z, d.x);
      }
      if (mode === 'menu') this.orbit = Math.atan2(this.pos.z, this.pos.x);
      if (mode === 'landing' && this.opts.target) {
        const src = this.opts.ball ?? this.ball;
        const d = new Vector3(src.x - this.opts.target.x, 0, src.z - this.opts.target.z);
        if (d.length() < 3) d.set(this.pos.x - this.opts.target.x, 0, this.pos.z - this.opts.target.z);
        this.landingDir.copy(d.normalize());
      }
      if (mode === 'flyover') this.snapNext = true;
    }
    if (opts.instant) this.snapNext = true;
    this.lastAnchor.copy(this.ball);
  }

  get viewYaw() {
    const d = new Vector3().subVectors(this.look, this.pos);
    return Math.atan2(-d.x, -d.z);
  }

  /** Compute desired pose; returns smoothing times [pos, look]. */
  private desired(dt: number): [number, number, boolean] {
    const h = this.hole;
    const o = this.opts;
    this.dUp.copy(UP);
    if (!h) {
      this.dPos.set(0, 50, 60);
      this.dLook.set(0, 0, 0);
      return [1, 1, false];
    }
    const tee = h.tee;
    const pin = h.pin;
    const fwdTP = new Vector3(pin.x - tee.x, 0, pin.z - tee.z).normalize();
    switch (this.mode) {
      case 'menu': {
        const c = new Vector3().addVectors(tee, pin).multiplyScalar(0.5);
        const len = tee.distanceTo(pin);
        this.orbit += dt * 0.045;
        const r = len * 0.55 + 70;
        this.dPos.set(c.x + Math.cos(this.orbit) * r, c.y + 70 + len * 0.18, c.z + Math.sin(this.orbit) * r);
        this.dLook.copy(c);
        return [1.6, 1.2, false];
      }
      case 'flyover':
        return this.flyover(dt);
      case 'address': {
        const b = o.ball ?? this.ball;
        const f = yawForward(o.yaw ?? yawTo(b.x, b.z, pin.x, pin.z), new Vector3());
        this.dPos.copy(b).addScaledVector(f, -5.2).add(new Vector3(0, 2.1, 0)).addScaledVector(new Vector3(-f.z, 0, f.x), -0.35);
        this.dLook.copy(b).addScaledVector(f, 18).add(new Vector3(0, 0.3, 0));
        return [0.45, 0.35, false];
      }
      case 'green': {
        const b = o.ball ?? this.ball;
        const tg = o.target ?? pin;
        const f = new Vector3(tg.x - b.x, 0, tg.z - b.z);
        const dist = f.length();
        if (dist < 0.01) f.copy(yawForward(o.yaw ?? 0, new Vector3()));
        else f.divideScalar(dist);
        if (o.yaw !== undefined) yawForward(o.yaw, f);
        const back = 3.2 + clamp(dist * 0.12, 0, 2.5);
        this.dPos.copy(b).addScaledVector(f, -back).add(new Vector3(0, 1.15 + clamp(dist * 0.06, 0, 1.4), 0));
        this.dLook.copy(b).addScaledVector(f, clamp(dist * 0.55, 1.5, 7));
        return [0.45, 0.35, false];
      }
      case 'follow': {
        const b = this.ball;
        const v = this.ballVel;
        const hv = new Vector3(v.x, 0, v.z);
        const speed = hv.length();
        const dir = speed > 1 ? hv.divideScalar(speed) : yawForward(o.yaw ?? 0, new Vector3());
        if (v.y > 2) this.apexSeen = false;
        if (v.y < -1) this.apexSeen = true;
        this.sideBlend = clamp(this.sideBlend + (this.apexSeen ? dt * 0.5 : -dt * 0.3), 0, 1);
        const side = new Vector3(-dir.z, 0, dir.x);
        const sb = smoothstep(0, 1, this.sideBlend);
        const behind = lerp(11, 7, sb);
        this.dPos.copy(b).addScaledVector(dir, -behind).addScaledVector(side, sb * 9).add(new Vector3(0, lerp(4, 3, sb), 0));
        this.dLook.copy(b).addScaledVector(v, 0.12);
        return [0.5, 0.06, true];
      }
      case 'landing': {
        const L = o.target ?? this.ball;
        const side = new Vector3(-this.landingDir.z, 0, this.landingDir.x);
        // incoming shot: wide; ball already at rest there: closer
        const near = this.ball.distanceTo(L) < 6 ? 1 : 0;
        this.nearBlend += ((near ? 1 : 0) - this.nearBlend) * Math.min(1, dt * 1.5);
        const nb = this.nearBlend;
        this.dPos.copy(L).addScaledVector(this.landingDir, lerp(-16, -7, nb)).addScaledVector(side, lerp(9, 3, nb)).add(new Vector3(0, lerp(4.5, 2.6, nb), 0));
        this.dLook.copy(this.ball);
        return [0.7, 0.12, false];
      }
      case 'top': {
        const pts = [tee, pin, ...h.centerline];
        if (o.ball) pts.push(o.ball);
        let minX = Infinity,
          maxX = -Infinity,
          minZ = Infinity,
          maxZ = -Infinity;
        for (const p of pts) {
          minX = Math.min(minX, p.x);
          maxX = Math.max(maxX, p.x);
          minZ = Math.min(minZ, p.z);
          maxZ = Math.max(maxZ, p.z);
        }
        const c = new Vector3((minX + maxX) / 2, 0, (minZ + maxZ) / 2);
        c.y = this.heightAt(c.x, c.z);
        // extent along / across the play direction
        const side = new Vector3(-fwdTP.z, 0, fwdTP.x);
        let along = 0;
        let across = 0;
        for (const p of pts) {
          const d = new Vector3(p.x - c.x, 0, p.z - c.z);
          along = Math.max(along, Math.abs(d.dot(fwdTP)));
          across = Math.max(across, Math.abs(d.dot(side)));
        }
        const fov = (this.camera.fov * Math.PI) / 180;
        const hv = (along + 40) / Math.tan(fov / 2);
        const hh = (across + 30) / (Math.tan(fov / 2) * this.camera.aspect);
        const H = Math.max(hv, hh, 60);
        this.dPos.copy(c).add(new Vector3(0, H, 0)).addScaledVector(fwdTP, -0.01);
        this.dLook.copy(c);
        this.dUp.copy(fwdTP);
        return [0.7, 0.7, false];
      }
      case 'celebrate': {
        const tg = o.target ?? pin;
        this.orbit += dt * 0.28;
        this.dPos.set(tg.x + Math.cos(this.orbit) * 6, tg.y + 2.4, tg.z + Math.sin(this.orbit) * 6);
        this.dLook.copy(tg).add(new Vector3(0, 0.8, 0));
        return [0.8, 0.5, false];
      }
    }
    return [1, 1, false];
  }

  private flyover(dt: number): [number, number, boolean] {
    const h = this.hole!;
    const c = this.curve!;
    void dt;
    const t = this.t;
    if (t < FLY_GLIDE) {
      const u = easeInOut(t / FLY_GLIDE);
      const p = c.getPointAt(u);
      const tan = c.getTangentAt(Math.min(u, 0.999));
      tan.y = 0;
      tan.normalize();
      this.dPos.copy(p).addScaledVector(tan, -lerp(30, 13, u));
      this.dPos.y = p.y + lerp(42, 4, Math.pow(u, 1.2));
      const la = c.getPointAt(Math.min(1, u + 0.22));
      this.dLook.copy(la).lerp(h.pin, smoothstep(0.55, 1, u));
      this.dLook.y += 1;
      return [0.12, 0.12, false];
    }
    if (t < FLY_GLIDE + FLY_HOLD) {
      const k = (t - FLY_GLIDE) / FLY_HOLD;
      const tan = c.getTangentAt(0.999);
      const a = Math.atan2(-tan.z, -tan.x) + k * 0.5;
      this.dPos.set(h.pin.x + Math.cos(a) * 13, h.pin.y + 4, h.pin.z + Math.sin(a) * 13);
      this.dLook.copy(h.pin).add(new Vector3(0, 1, 0));
      return [0.3, 0.2, false];
    }
    // cut back behind the golfer
    if (this.busy) {
      this.busy = false;
      this.snapNext = true;
    }
    const tee = h.tee;
    const f = new Vector3(h.centerline[1]?.x ?? h.pin.x, 0, h.centerline[1]?.z ?? h.pin.z).sub(new Vector3(tee.x, 0, tee.z)).normalize();
    this.dPos.copy(tee).addScaledVector(f, -6.5).add(new Vector3(0, 2.6, 0));
    this.dLook.copy(tee).addScaledVector(f, 25).add(new Vector3(0, 1, 0));
    return [0.5, 0.5, false];
  }

  skipFlyover() {
    if (this.mode === 'flyover' && this.busy) this.t = FLY_GLIDE + FLY_HOLD;
  }

  update(dt: number) {
    this.t += dt;
    const [stP, stL, carry] = this.desired(dt);
    if (carry) {
      const d = new Vector3().subVectors(this.ball, this.lastAnchor);
      this.pos.add(d);
    }
    this.lastAnchor.copy(this.ball);
    // long jumps become cuts
    if (this.snapNext || this.pos.distanceTo(this.dPos) > 160) {
      this.pos.copy(this.dPos);
      this.look.copy(this.dLook);
      this.up.copy(this.dUp);
      this.vPos.set(0, 0, 0);
      this.vLook.set(0, 0, 0);
      this.snapNext = false;
    } else {
      smoothDampV(this.pos, this.dPos, this.vPos, stP, dt);
      smoothDampV(this.look, this.dLook, this.vLook, stL, dt);
      this.up.lerp(this.dUp, 1 - Math.exp(-6 * dt)).normalize();
    }
    // terrain clearance
    if (this.mode !== 'top') {
      const minClear = this.mode === 'green' ? 0.7 : this.mode === 'address' ? 1.1 : 1.6;
      const g = this.heightAt(this.pos.x, this.pos.z) + minClear;
      if (this.pos.y < g) {
        this.pos.y = g;
        if (this.vPos.y < 0) this.vPos.y = 0;
      }
    }
    this.camera.position.copy(this.pos);
    this.camera.up.copy(this.up);
    this.camera.lookAt(this.look);
  }
}
