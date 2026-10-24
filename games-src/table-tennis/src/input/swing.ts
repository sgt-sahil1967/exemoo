/**
 * Swing peak detector (pure, deterministic — unit tested).
 *
 * Feed it a normalised "swing intensity" m (≈ 1 for a full-power stroke) per sensor sample.
 * Sensitivity multiplies m, i.e. it scales every threshold by 1/sensitivity.
 *
 *   idle ──(m ≥ on)──▶ rising ──(m < peak·drop | m < off | onset+maxRise)──▶ fire @ peak
 *   fire ──▶ refractory (≥ refractoryMs AND (m < off OR rearmMs elapsed)) ──▶ idle
 */
export interface SwingPeak {
  /** Time (caller's clock, ms) of the peak sample. */
  time: number;
  /** 0 … 1 */
  power: number;
  /** Raw (sensitivity-scaled) peak intensity. */
  peak: number;
}

export interface SwingDetectorOptions {
  on?: number;
  off?: number;
  /** Fire once m falls below peak × drop. */
  drop?: number;
  refractoryMs?: number;
  rearmMs?: number;
  /** Max time from onset to emission (bounds latency on long plateaus). */
  maxRiseMs?: number;
  /** Power reported for a swing that just crosses `on`. */
  minPower?: number;
}

export interface SwingPushResult {
  /** This sample is the new running maximum of an in-progress swing (snapshot state now). */
  newMax: boolean;
  fired: SwingPeak | null;
}

export class SwingDetector {
  sensitivity = 1;
  enabled = true;
  private readonly o: Required<SwingDetectorOptions>;
  private phase: 'idle' | 'rising' | 'refractory' = 'idle';
  private onsetTime = 0;
  private peakVal = 0;
  private peakTime = 0;
  private fireTime = -1e9;
  private droppedSinceFire = true;

  constructor(opts: SwingDetectorOptions = {}) {
    this.o = {
      on: opts.on ?? 0.26,
      off: opts.off ?? 0.14,
      drop: opts.drop ?? 0.78,
      refractoryMs: opts.refractoryMs ?? 250,
      rearmMs: opts.rearmMs ?? 550,
      maxRiseMs: opts.maxRiseMs ?? 160,
      minPower: opts.minPower ?? 0.12,
    };
  }

  get swinging(): boolean {
    return this.phase === 'rising';
  }

  reset(): void {
    this.phase = 'idle';
    this.peakVal = 0;
    this.droppedSinceFire = true;
  }

  /** Map a (sensitivity-scaled) intensity to 0..1 power. */
  powerOf(m: number): number {
    const { on, minPower } = this.o;
    const k = (m - on) / (1 - on);
    return Math.max(0, Math.min(1, minPower + (1 - minPower) * Math.pow(Math.max(0, k), 0.85)));
  }

  push(time: number, intensity: number): SwingPushResult {
    const m = Math.max(0, intensity) * this.sensitivity;
    const o = this.o;
    const res: SwingPushResult = { newMax: false, fired: null };

    if (this.phase === 'refractory') {
      if (m < o.off) this.droppedSinceFire = true;
      const since = time - this.fireTime;
      if (since >= o.refractoryMs && (this.droppedSinceFire || since >= o.rearmMs)) this.phase = 'idle';
      else return res;
    }

    if (this.phase === 'idle') {
      if (!this.enabled || m < o.on) return res;
      this.phase = 'rising';
      this.onsetTime = time;
      this.peakVal = m;
      this.peakTime = time;
      res.newMax = true;
      return res;
    }

    // rising
    if (m > this.peakVal) {
      this.peakVal = m;
      this.peakTime = time;
      res.newMax = true;
      if (time - this.onsetTime < o.maxRiseMs) return res;
    }
    if (m < this.peakVal * o.drop || m < o.off || time - this.onsetTime >= o.maxRiseMs) {
      this.phase = 'refractory';
      this.fireTime = time;
      this.droppedSinceFire = m < o.off;
      if (!this.enabled) return res;
      res.fired = { time: this.peakTime, power: this.powerOf(this.peakVal), peak: this.peakVal };
    }
    return res;
  }
}
