import { describe, expect, test } from 'vitest';
import { Vector3 } from 'three';
import type { BallEvent, PointResult, Side } from '../core/contracts';
import { Referee, Scoreboard } from './rules';

const z = (s: Side, d = 0.8) => (s === 'player' ? d : -d);
const bounce = (s: Side): BallEvent => ({ type: 'bounce', side: s, pos: new Vector3(0, 0.76, z(s)), speed: 5 });
const edge = (s: Side): BallEvent => ({ type: 'edge', side: s, pos: new Vector3(0.76, 0.76, z(s)) });
const net: BallEvent = { type: 'net', pos: new Vector3(0, 0.9, 0), speed: 5 };
const floor = (s: Side): BallEvent => ({ type: 'floor', pos: new Vector3(0, 0, z(s, 2.5)), speed: 4 });

function feed(ref: Referee, evs: BallEvent[]): PointResult | 'let' | null {
  for (const e of evs) {
    const r = ref.onEvent(e);
    if (r) return r;
  }
  return null;
}

describe('Referee', () => {
  test('legal serve and rally, then double bounce', () => {
    const ref = new Referee();
    ref.startRally('player');
    expect(ref.phase).toBe('serve');
    expect(ref.expecting).toBe('player');
    expect(ref.onHit('player')).toBeNull();
    expect(ref.rally).toBe(1);
    expect(feed(ref, [bounce('player')])).toBeNull();
    expect(ref.readyToStrike).toBe(false);
    expect(feed(ref, [bounce('opponent')])).toBeNull();
    expect(ref.readyToStrike).toBe(true);
    expect(ref.onHit('opponent')).toBeNull();
    expect(ref.rally).toBe(2);
    expect(ref.expecting).toBe('player');
    expect(ref.lastHitter).toBe('opponent');
    expect(feed(ref, [bounce('player')])).toBeNull();
    const r = feed(ref, [bounce('player')]) as PointResult;
    expect(r).toMatchObject({ winner: 'opponent', reason: 'double-bounce', faultBy: 'player', rally: 2, ace: false });
    expect(ref.phase).toBe('over');
  });

  test('ace: serve never touched', () => {
    const ref = new Referee();
    ref.startRally('opponent');
    ref.onHit('opponent');
    const r = feed(ref, [bounce('opponent'), bounce('player'), floor('player')]) as PointResult;
    expect(r).toMatchObject({ winner: 'opponent', reason: 'missed', faultBy: 'player', ace: true, rally: 1 });
  });

  test('let: serve clips the net and lands legally', () => {
    const ref = new Referee();
    ref.startRally('player');
    ref.onHit('player');
    expect(feed(ref, [bounce('player'), net, bounce('opponent')])).toBe('let');
  });

  test('serve into the net', () => {
    const ref = new Referee();
    ref.startRally('player');
    ref.onHit('player');
    const r = feed(ref, [bounce('player'), net, bounce('player')]) as PointResult;
    expect(r).toMatchObject({ winner: 'opponent', reason: 'net', faultBy: 'player' });
  });

  test('serve fault: did not bounce on own half first', () => {
    const ref = new Referee();
    ref.startRally('player');
    ref.onHit('player');
    expect(feed(ref, [bounce('opponent')])).toMatchObject({ winner: 'opponent', reason: 'serve-fault' });
  });

  test('rally ball into the net', () => {
    const ref = new Referee();
    ref.startRally('player');
    ref.onHit('player');
    feed(ref, [bounce('player'), bounce('opponent')]);
    ref.onHit('opponent');
    const r = feed(ref, [net, floor('opponent')]) as PointResult;
    expect(r).toMatchObject({ winner: 'player', reason: 'net', faultBy: 'opponent', rally: 2 });
  });

  test('out: return lands off the table', () => {
    const ref = new Referee();
    ref.startRally('player');
    ref.onHit('player');
    feed(ref, [bounce('player'), bounce('opponent')]);
    ref.onHit('opponent');
    const r = feed(ref, [floor('player')]) as PointResult;
    expect(r).toMatchObject({ winner: 'player', reason: 'out', faultBy: 'opponent' });
  });

  test('own side: return bounces on the hitter half', () => {
    const ref = new Referee();
    ref.startRally('opponent');
    ref.onHit('opponent');
    feed(ref, [bounce('opponent'), bounce('player')]);
    ref.onHit('player');
    expect(feed(ref, [bounce('player')])).toMatchObject({ winner: 'opponent', reason: 'own-side', faultBy: 'player' });
  });

  test('volley: striking before the bounce', () => {
    const ref = new Referee();
    ref.startRally('player');
    ref.onHit('player');
    feed(ref, [bounce('player'), bounce('opponent')]);
    ref.onHit('opponent');
    expect(ref.onHit('player')).toMatchObject({ winner: 'opponent', reason: 'volley', faultBy: 'player' });
  });

  test('double hit', () => {
    const ref = new Referee();
    ref.startRally('player');
    ref.onHit('player');
    expect(ref.onHit('player')).toMatchObject({ winner: 'opponent', reason: 'double-hit' });
  });

  test('edge counts as a bounce on that side', () => {
    const ref = new Referee();
    ref.startRally('player');
    ref.onHit('player');
    expect(feed(ref, [bounce('player'), edge('opponent')])).toBeNull();
    expect(ref.readyToStrike).toBe(true);
    expect(feed(ref, [floor('opponent')])).toMatchObject({ winner: 'player', reason: 'missed', ace: true });
  });

  test('ball returned back over the net by backspin without being struck', () => {
    const ref = new Referee();
    ref.startRally('player');
    ref.onHit('player');
    feed(ref, [bounce('player'), bounce('opponent')]);
    expect(feed(ref, [bounce('player')])).toMatchObject({ winner: 'player', reason: 'double-bounce', faultBy: 'opponent' });
  });

  test('events are ignored before the serve and after the point', () => {
    const ref = new Referee();
    ref.startRally('player');
    expect(feed(ref, [floor('player')])).toBeNull();
    ref.onHit('player');
    feed(ref, [bounce('opponent')]);
    expect(ref.phase).toBe('over');
    expect(feed(ref, [floor('player')])).toBeNull();
    expect(ref.onHit('opponent')).toBeNull();
  });
});

describe('Scoreboard', () => {
  test('serve rotates every two points, first server alternates each game', () => {
    const sb = new Scoreboard(2, 'player');
    const seq: Side[] = [];
    for (let i = 0; i < 6; i++) {
      seq.push(sb.server());
      sb.award(i % 2 === 0 ? 'player' : 'opponent');
    }
    expect(seq).toEqual(['player', 'player', 'opponent', 'opponent', 'player', 'player']);
    // finish game 1 for the player
    while (sb.games.player === 0) sb.award('player');
    expect(sb.gameScores).toEqual([{ player: 11, opponent: 3 }]);
    expect(sb.points).toEqual({ player: 0, opponent: 0 });
    expect(sb.server()).toBe('opponent');
  });

  test('deuce: win by two, serve alternates every point from 10-10', () => {
    const sb = new Scoreboard(1, 'player');
    for (let i = 0; i < 10; i++) { sb.award('player'); sb.award('opponent'); }
    expect(sb.points).toEqual({ player: 10, opponent: 10 });
    expect(sb.deuce()).toBe(true);
    expect(sb.gamePoint()).toBeNull();
    const s1 = sb.server();
    sb.award('player');
    expect(sb.server()).not.toBe(s1);
    expect(sb.gamePoint()).toBe('player');
    expect(sb.matchPoint()).toBe('player');
    expect(sb.award('opponent')).toEqual({});
    expect(sb.deuce()).toBe(true);
    sb.award('opponent');
    expect(sb.gamePoint()).toBe('opponent');
    sb.award('player');
    sb.award('player');
    const r = sb.award('player');
    expect(r).toEqual({ gameWon: 'player', matchWon: 'player' });
    expect(sb.gameScores[0]).toEqual({ player: 14, opponent: 12 });
    expect(sb.matchWinner).toBe('player');
  });

  test('server at 10-10 continues the 2-point rotation correctly', () => {
    const sb = new Scoreboard(1, 'opponent');
    for (let i = 0; i < 10; i++) { sb.award('player'); sb.award('opponent'); }
    // 20 points played: 10 changes → back to the first server
    expect(sb.server()).toBe('opponent');
    sb.award('player');
    expect(sb.server()).toBe('player');
  });

  test('match ends at gamesToWin games', () => {
    const sb = new Scoreboard(3, 'player');
    const winGame = (s: Side) => { let r = {}; while (!('gameWon' in r)) r = sb.award(s); return r as { gameWon?: Side; matchWon?: Side }; };
    expect(winGame('player').matchWon).toBeUndefined();
    expect(winGame('opponent').matchWon).toBeUndefined();
    expect(winGame('player').matchWon).toBeUndefined();
    expect(sb.matchPoint()).toBeNull();
    for (let i = 0; i < 10; i++) sb.award('player');
    expect(sb.matchPoint()).toBe('player');
    expect(sb.award('player')).toEqual({ gameWon: 'player', matchWon: 'player' });
    expect(sb.games).toEqual({ player: 3, opponent: 1 });
    expect(sb.gameScores.length).toBe(4);
    // first server alternates per game: game 5 would start with the opponent… game 4 started with opponent
    expect(sb.gamePoint()).toBeNull();
  });
});
