// One-Euro filter (Casiez et al. 2012): heavy smoothing when a signal is still,
// little lag when it moves fast. Ideal for jittery pose landmarks.

const alpha = (cutoff: number, dt: number) => {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
};

export class OneEuro {
  private x = 0;
  private dx = 0;
  private ready = false;

  constructor(public minCutoff = 1.2, public beta = 0.02, public dCutoff = 1) {}

  reset() { this.ready = false; }

  filter(value: number, dt: number) {
    if (!this.ready || dt <= 0) {
      this.x = value;
      this.dx = 0;
      this.ready = true;
      return value;
    }
    const d = (value - this.x) / dt;
    this.dx += alpha(this.dCutoff, dt) * (d - this.dx);
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    this.x += alpha(cutoff, dt) * (value - this.x);
    return this.x;
  }

  /** Current velocity estimate (units per second), useful for extrapolation. */
  get velocity() { return this.dx; }
}

/** A bank of filters for N points × K channels, stored flat. */
export class OneEuroBank {
  private f: OneEuro[];

  constructor(readonly count: number, readonly channels: number, minCutoff: number, beta: number) {
    this.f = Array.from({ length: count * channels }, () => new OneEuro(minCutoff, beta));
  }

  reset() { for (const f of this.f) f.reset(); }

  filter(i: number, c: number, value: number, dt: number) {
    return this.f[i * this.channels + c].filter(value, dt);
  }

  velocity(i: number, c: number) {
    return this.f[i * this.channels + c].velocity;
  }
}
