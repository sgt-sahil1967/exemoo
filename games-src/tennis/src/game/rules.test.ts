import { describe, expect, it } from 'vitest';
import { SetScore, type Side } from './rules';

const win = (s: SetScore, side: Side, n: number) => {
  for (let i = 0; i < n; i++) s.pointWon(side);
};

describe('SetScore', () => {
  it('counts 15/30/40 and wins a game at 4–0', () => {
    const s = new SetScore(0);
    win(s, 0, 3);
    expect(s.pointLabels()).toEqual(['40', '0']);
    const r = s.pointWon(0);
    expect(r.gameWinner).toBe(0);
    expect(s.games).toEqual([1, 0]);
    expect(s.points).toEqual([0, 0]);
  });

  it('handles deuce and advantage', () => {
    const s = new SetScore(0);
    win(s, 0, 3);
    win(s, 1, 3);
    expect(s.status().deuce).toBe(true);
    s.pointWon(1);
    expect(s.pointLabels()).toEqual(['40', 'AD']);
    expect(s.status().adv).toBe(1);
    s.pointWon(0);
    expect(s.status().deuce).toBe(true);
    s.pointWon(0);
    expect(s.pointWon(0).gameWinner).toBe(0);
  });

  it('alternates serve each game and serve side each point', () => {
    const s = new SetScore(0);
    expect(s.server).toBe(0);
    expect(s.serveSide).toBe('deuce');
    s.pointWon(1);
    expect(s.serveSide).toBe('ad');
    win(s, 1, 3);
    expect(s.server).toBe(1);
    expect(s.serveSide).toBe('deuce');
  });

  it('wins the set 6–4 and requires a two-game lead at 5–5', () => {
    const s = new SetScore(0);
    for (let g = 0; g < 5; g++) {
      win(s, 0, 4);
      win(s, 1, 4);
    }
    expect(s.games).toEqual([5, 5]);
    win(s, 0, 4);
    expect(s.winner).toBeNull();
    win(s, 0, 4);
    expect(s.winner).toBe(0);
    expect(s.games).toEqual([7, 5]);
  });

  it('plays a tiebreak at 6–6 with correct server rotation', () => {
    const s = new SetScore(0);
    for (let g = 0; g < 6; g++) {
      win(s, 0, 4);
      win(s, 1, 4);
    }
    expect(s.tiebreak).toBe(true);
    const first = s.server;
    const servers: Side[] = [];
    for (let i = 0; i < 6; i++) {
      servers.push(s.server);
      s.pointWon(i % 2 === 0 ? 0 : 1);
    }
    const o = (first === 0 ? 1 : 0) as Side;
    expect(servers).toEqual([first, o, o, first, first, o]);
    expect(s.pointLabels()).toEqual(['3', '3']);
    win(s, 1, 3);
    expect(s.winner).toBeNull();
    s.pointWon(1);
    expect(s.winner).toBe(1);
    expect(s.games).toEqual([6, 7]);
  });

  it('tiebreak needs a two-point margin', () => {
    const s = new SetScore(1);
    s.forceTiebreak();
    win(s, 0, 6);
    win(s, 1, 6);
    s.pointWon(0);
    expect(s.winner).toBeNull();
    expect(s.status().setPoint).toBe(0);
    s.pointWon(0);
    expect(s.winner).toBe(0);
  });
});
