import { describe, expect, test } from 'vitest';
import { other, type Difficulty, type PointResult, type Side } from '../core/contracts';
import { Ball, SUBSTEP } from '../physics/ball';
import { solveServe, solveShot } from '../physics/solver';
import { AIPlayer, type AIPlan } from './ai';
import { Referee } from './rules';

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface PointLog { result: PointResult | 'let' | 'timeout'; hits: number; }

/** Headless AI-vs-AI rallies: the same loop a match runs every frame. */
export function playPoints(dp: Difficulty, dop: Difficulty, n: number, seed = 1): PointLog[] {
  const rng = mulberry32(seed);
  const ais: Record<Side, AIPlayer> = { player: new AIPlayer('player', dp, rng), opponent: new AIPlayer('opponent', dop, rng) };
  const ball = new Ball();
  const ref = new Referee();
  const score: Record<Side, number> = { player: 0, opponent: 0 };
  const logs: PointLog[] = [];
  const dt = SUBSTEP * 4; // 180 Hz frames
  for (let i = 0; i < n; i++) {
    const server: Side = Math.floor(i / 2) % 2 === 0 ? 'player' : 'opponent';
    ref.startRally(server);
    for (const s of ['player', 'opponent'] as const) ais[s].clearPlan();
    const sv = ais[server].planServe({ myScore: score[server] % 11, theirScore: score[other(server)] % 11 });
    // toss
    let t = 0;
    while (t < sv.tossTime) { ais.player.update(dt); ais.opponent.update(dt); t += dt; }
    const { vel, spin } = solveServe(sv.strikePos, server, sv.request, rng);
    ref.onHit(server);
    ball.set(sv.strikePos, vel, spin);
    let pending: { side: Side; plan: AIPlan; left: number } | null = null;
    const plan = (s: Side) => {
      const p = ais[s].planReturn(ball.state, { opponentBody: ais[other(s)].body, rally: ref.rally, myScore: score[s] % 11, theirScore: score[other(s)] % 11 });
      pending = p ? { side: s, plan: p, left: p.t } : null;
    };
    plan(other(server));
    let result: PointResult | 'let' | 'timeout' = 'timeout';
    for (let time = 0; time < 45; time += dt) {
      let step = dt;
      const pd = pending as { side: Side; plan: AIPlan; left: number } | null;
      if (pd && pd.left <= dt + 1e-9) step = pd.left; // land exactly on the contact time
      let done = false;
      for (const ev of ball.step(step)) {
        const r = ref.onEvent(ev);
        if (r) { result = r; done = true; break; }
        if (ev.type === 'net' && ref.lastHitter) plan(ref.expecting);
      }
      if (done) break;
      ais.player.update(step); ais.opponent.update(step);
      const pp = pending as { side: Side; plan: AIPlan; left: number } | null;
      if (pp) {
        pp.left -= step;
        if (pp.left <= 1e-9) {
          pending = null;
          if (!pp.plan.willMiss && ref.readyToStrike && ref.expecting === pp.side) {
            const r = ref.onHit(pp.side);
            if (r) { result = r; break; }
            const shot = solveShot(ball.state.pos.clone(), pp.plan.request, rng);
            ball.set(ball.state.pos.clone(), shot.vel, shot.spin);
            plan(other(pp.side));
          }
        }
      }
    }
    if (result !== 'let' && result !== 'timeout') score[result.winner]++;
    logs.push({ result, hits: result === 'let' || result === 'timeout' ? ref.rally : result.rally });
  }
  return logs;
}

export function summarize(logs: PointLog[]) {
  const pts = logs.filter((l) => typeof l.result === 'object') as { result: PointResult; hits: number }[];
  const hits = pts.map((p) => p.hits);
  const avg = hits.reduce((a, b) => a + b, 0) / Math.max(1, hits.length);
  const hist: Record<string, number> = {};
  for (const h of hits) { const k = h >= 10 ? '10+' : String(h); hist[k] = (hist[k] ?? 0) + 1; }
  const reasons: Record<string, number> = {};
  for (const p of pts) { const k = `${p.result.reason}${p.result.faultBy ? ':' + p.result.faultBy : ''}`; reasons[k] = (reasons[k] ?? 0) + 1; }
  const wins = { player: pts.filter((p) => p.result.winner === 'player').length, opponent: pts.filter((p) => p.result.winner === 'opponent').length };
  return { avg, hist, reasons, wins, lets: logs.filter((l) => l.result === 'let').length, timeouts: logs.filter((l) => l.result === 'timeout').length };
}

describe('AI vs AI', () => {
  test('pro vs pro rallies average > 4 hits', () => {
    const s = summarize(playPoints('pro', 'pro', 200, 7));
    console.log('pro-pro', JSON.stringify(s));
    expect(s.avg).toBeGreaterThan(4);
    expect(s.timeouts).toBeLessThanOrEqual(10); // ≤5% of 200 points may be marathon rallies
  });
  test('legend beats rookie most points', () => {
    const s = summarize(playPoints('legend', 'rookie', 200, 11));
    console.log('legend-rookie', JSON.stringify(s));
    expect(s.wins.player).toBeGreaterThan(s.wins.opponent * 2);
  });
  test('distribution report', { timeout: 120000 }, () => {
    for (const [a, b] of [['rookie', 'rookie'], ['club', 'club'], ['legend', 'legend'], ['club', 'pro'], ['pro', 'legend']] as const) {
      console.log(`${a}-${b}`, JSON.stringify(summarize(playPoints(a, b, 200, 3))));
    }
  });
});
