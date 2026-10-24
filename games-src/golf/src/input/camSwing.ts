/**
 * Camera swing tracker (Exemoo camera assist): follows the player's hands through a real golf swing.
 *
 *   address  hands low and still (the reference)
 *   back     hands rising away from address; the highest point is the backswing
 *   down     hands coming down fast; peak hand speed is recorded
 *   impact   hands back at address height while moving fast → emits a CamImpact
 *   follow   until the hands settle again
 *
 * Units: image coordinates (0…1, y down) normalised by shoulder width (`scale`), so the numbers
 * don't depend on how far the player stands from the camera.
 */
export interface CamSample { t: number; x: number; y: number; sx: number; sy: number; scale: number }
export interface CamImpact {
  t: number;
  /** Backswing height above address, in shoulder widths. */
  rise: number;
  /** Peak hand speed on the downswing, shoulder widths per second. */
  speed: number;
  /** Sideways hand travel through impact (−1 … +1): + = out-to-in (slice), − = in-to-out (hook). */
  path: number;
}

type Phase = 'none' | 'address' | 'back' | 'down' | 'follow';

export class CamSwing {
  phase: Phase = 'none';
  private hist: CamSample[] = [];
  private stillSince = 0;
  private addrX = 0;
  private addrY = 0;
  private topRise = 0;
  private peakSpeed = 0;
  private last: CamSample | null = null;
  lastAt = -Infinity;

  /** Feed a camera sample; returns an impact when one completes. Duplicate frames are ignored. */
  push(s: CamSample): CamImpact | null {
    const prev = this.last;
    if (prev && prev.x === s.x && prev.y === s.y) return null; // same camera frame repeated in another packet
    this.last = s;
    this.lastAt = s.t;
    this.hist.push(s);
    while (this.hist.length && s.t - this.hist[0].t > 1500) this.hist.shift();
    if (!prev) return null;
    const dt = Math.max(1e-3, (s.t - prev.t) / 1000);
    const sc = s.scale || 0.2;
    const vx = (s.x - prev.x) / sc / dt, vy = (s.y - prev.y) / sc / dt; // shoulder widths / s (vy > 0 = down)
    const speed = Math.hypot(vx, vy);
    const rise = (this.addrY - s.y) / sc; // + = hands above address

    // Address: hands below the shoulder and still for 0.35 s.
    const low = s.y > s.sy + sc * 0.6;
    if (speed < 0.8 && low) {
      if (!this.stillSince) this.stillSince = s.t;
      if (s.t - this.stillSince > 350 && (this.phase === 'none' || this.phase === 'address' || this.phase === 'follow')) {
        this.phase = 'address';
        this.addrX = s.x;
        this.addrY = s.y;
      }
    } else this.stillSince = 0;

    switch (this.phase) {
      case 'address':
        if (rise > 0.45 && vy < 0) { this.phase = 'back'; this.topRise = rise; this.peakSpeed = 0; }
        break;
      case 'back':
        this.topRise = Math.max(this.topRise, rise);
        if (vy > 2.2 && rise < this.topRise - 0.15) { this.phase = 'down'; this.peakSpeed = speed; }
        if (rise < 0.2 && speed < 1) this.phase = 'address'; // lifted and put it back down: not a swing
        break;
      case 'down':
        this.peakSpeed = Math.max(this.peakSpeed, speed);
        if (rise < 0.35) {
          this.phase = 'follow';
          // Path: sideways hand movement over the last ~120 ms, relative to the downswing speed.
          const back = this.hist.find((h) => s.t - h.t < 130) ?? prev;
          const path = Math.max(-1, Math.min(1, ((s.x - back.x) / sc / Math.max(0.05, (s.t - back.t) / 1000)) / Math.max(3, this.peakSpeed)));
          return { t: s.t, rise: this.topRise, speed: this.peakSpeed, path };
        }
        break;
      default:
        break;
    }
    return null;
  }

  /** Live backswing in shoulder widths (for the power meter), or null without a fresh camera frame. */
  liveRise(now: number): number | null {
    if (!this.last || now - this.lastAt > 400 || this.phase === 'none') return null;
    return Math.max(0, (this.addrY - this.last.y) / (this.last.scale || 0.2));
  }

  get addressX() {
    return this.addrX;
  }
}
