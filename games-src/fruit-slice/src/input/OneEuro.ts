/**
 * One-Euro filter (Casiez et al. 2012): an adaptive low-pass whose cutoff
 * rises with speed, so it is steady at rest and responsive when moving fast.
 */
export class OneEuroFilter {
  minCutoff: number;
  beta: number;
  dCutoff: number;
  private x: number | null = null;
  private dx = 0;

  constructor(minCutoff = 1.5, beta = 1.5, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  /** Filtered value. */
  get value(): number {
    return this.x ?? 0;
  }

  /** Filtered derivative (units per second). */
  get velocity(): number {
    return this.dx;
  }

  reset(value?: number): void {
    this.x = value ?? null;
    this.dx = 0;
  }

  /** Feed a new raw value observed `dt` seconds after the previous one. */
  filter(value: number, dt: number): number {
    if (this.x === null || !(dt > 0)) {
      this.x = value;
      this.dx = 0;
      return value;
    }
    const rawDx = (value - this.x) / dt;
    this.dx += alpha(this.dCutoff, dt) * (rawDx - this.dx);
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    this.x += alpha(cutoff, dt) * (value - this.x);
    return this.x;
  }
}

function alpha(cutoff: number, dt: number): number {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
}
