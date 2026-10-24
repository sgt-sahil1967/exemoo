import type { FruitKind, GameMode, PowerUpKind, ThrowableKind } from '../contracts';
import { MODE_RULES } from './constants';

export interface LaunchRequest {
  kind: ThrowableKind;
  /** Start x (world) */
  x: number;
  /** Apex height (world y) */
  apex: number;
  /** x the fruit drifts toward by its apex */
  targetX: number;
  /** seconds from now */
  delay: number;
  /** launch from a side instead of below (frenzy streams) */
  side?: -1 | 1;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(arr: readonly T[]): T => arr[(Math.random() * arr.length) | 0];

/**
 * Wave director. Produces launch requests whose density and danger ramp up
 * with elapsed play time. Pure logic — the game owns entities and physics.
 */
export class Spawner {
  private waveTimer = 1.2;
  private elapsed = 0;
  private frenzyTimer = 0;
  private lastPowerUpAt = -99;
  private waveIndex = 0;

  constructor(
    private readonly mode: GameMode,
    private readonly fruitWeights: { kind: FruitKind; weight: number }[],
  ) {}

  /** Remaining frenzy seconds (side streams). */
  startFrenzy(seconds: number) {
    this.frenzyTimer = seconds;
  }

  /**
   * @param alive number of live, unsliced fruits on screen
   * @param activePowerUps power-ups currently running (avoid duplicate spawns)
   */
  update(dt: number, alive: number, activePowerUps: PowerUpKind[], timeLeft?: number): LaunchRequest[] {
    this.elapsed += dt;
    const out: LaunchRequest[] = [];

    if (this.frenzyTimer > 0) {
      this.frenzyTimer -= dt;
      // dense side streams, a fruit every ~0.09 s alternating sides
      this.frenzyAcc += dt;
      while (this.frenzyAcc > 0.09) {
        this.frenzyAcc -= 0.09;
        const side = (this.frenzyFlip = -this.frenzyFlip) as -1 | 1;
        out.push({ kind: this.randomFruit(), x: side * 8.6, apex: rand(3.2, 5.6), targetX: side * rand(-1.5, 2.5), delay: 0, side });
      }
    }

    // stop new waves in the last moments of a timed mode so the end is clean
    if (timeLeft !== undefined && timeLeft < 1.2) return out;

    this.waveTimer -= dt;
    const level = this.level();
    const minGap = this.gap(level);
    const ready = this.waveTimer <= 0 && (alive <= 1 || this.waveTimer <= -minGap * 0.9);
    if (ready) {
      this.waveTimer = minGap;
      this.waveIndex++;
      out.push(...this.makeWave(level, activePowerUps));
    }
    return out;
  }

  private frenzyAcc = 0;
  private frenzyFlip = 1;

  /** 0 → 1 difficulty ramp. */
  private level(): number {
    const ramp = this.mode === 'classic' ? 150 : this.mode === 'arcade' ? 55 : 80;
    return Math.min(1, this.elapsed / ramp);
  }

  private gap(level: number): number {
    if (this.mode === 'zen') return 1.5 - level * 0.6;
    if (this.mode === 'arcade') return 1.35 - level * 0.55;
    return 2.1 - level * 0.9;
  }

  private randomFruit(): FruitKind {
    let total = 0;
    for (const f of this.fruitWeights) total += f.weight;
    let r = Math.random() * total;
    for (const f of this.fruitWeights) {
      r -= f.weight;
      if (r <= 0) return f.kind;
    }
    return this.fruitWeights[0].kind;
  }

  private makeWave(level: number, active: PowerUpKind[]): LaunchRequest[] {
    const rules = MODE_RULES[this.mode];
    const reqs: LaunchRequest[] = [];
    const first = this.waveIndex <= 2;

    const maxCount = first ? 2 : Math.round(2 + level * (this.mode === 'zen' ? 6 : 5));
    const count = first ? this.waveIndex : Math.max(1, Math.round(rand(1, maxCount)));
    const pattern = first ? 'volley' : pick(['volley', 'volley', 'stagger', 'arc', 'fountain'] as const);

    const fruits: ThrowableKind[] = [];
    for (let i = 0; i < count; i++) fruits.push(this.randomFruit());

    if (rules.bombs && !first) {
      const bombChance = this.mode === 'arcade' ? 0.35 + level * 0.25 : 0.12 + level * 0.4;
      if (Math.random() < bombChance) {
        const bombs = level > 0.6 && Math.random() < 0.35 ? 2 : 1;
        for (let b = 0; b < bombs; b++) fruits.splice((Math.random() * (fruits.length + 1)) | 0, 0, 'bomb');
      }
    }

    if (rules.powerUps && !first && this.elapsed - this.lastPowerUpAt > 7 && Math.random() < 0.3) {
      const options = (['freeze', 'frenzy', 'double'] as PowerUpKind[]).filter((p) => !active.includes(p));
      if (options.length) {
        fruits.push(pick(options));
        this.lastPowerUpAt = this.elapsed;
      }
    }

    const n = fruits.length;
    switch (pattern) {
      case 'volley': {
        // simultaneous, spread across the width
        for (let i = 0; i < n; i++) {
          const x = n === 1 ? rand(-2.5, 2.5) : -3.6 + (7.2 * (i + rand(0.15, 0.85))) / n;
          reqs.push({ kind: fruits[i], x, apex: rand(3.4, 5.4), targetX: x * rand(0.2, 0.7), delay: rand(0, 0.12) });
        }
        break;
      }
      case 'stagger': {
        // one after another from random spots
        for (let i = 0; i < n; i++) {
          const x = rand(-3.4, 3.4);
          reqs.push({ kind: fruits[i], x, apex: rand(3.6, 5.4), targetX: x * 0.3 + rand(-1, 1), delay: i * rand(0.16, 0.3) });
        }
        break;
      }
      case 'arc': {
        // a sweeping line from one side to the other
        const dir = Math.random() < 0.5 ? -1 : 1;
        for (let i = 0; i < n; i++) {
          const t = n === 1 ? 0.5 : i / (n - 1);
          const x = dir * (-3.6 + 7.2 * t);
          reqs.push({ kind: fruits[i], x, apex: 4.6 + Math.sin(t * Math.PI) * 0.8, targetX: x * 0.6, delay: i * 0.12 });
        }
        break;
      }
      case 'fountain': {
        // burst from the middle, fanning out
        const cx = rand(-1.5, 1.5);
        for (let i = 0; i < n; i++) {
          const spread = n === 1 ? 0 : (i / (n - 1) - 0.5) * 5.5;
          reqs.push({ kind: fruits[i], x: cx + rand(-0.3, 0.3), apex: rand(4.2, 5.6), targetX: cx + spread, delay: rand(0, 0.08) });
        }
        break;
      }
    }
    return reqs;
  }
}
