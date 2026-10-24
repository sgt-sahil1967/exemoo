import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import type { GameSetup, HoleDef } from '../core/contracts';
import { formatToPar, Round } from './round';

const look = { color: '#f00', skin: '#fc9', hair: '#420', hat: 'none' as const };
const setup: GameSetup = {
  mode: 'round',
  holes: 'beginner',
  wind: 'calm',
  players: [
    { name: 'A', look },
    { name: 'B', look },
  ],
};
const holes: HoleDef[] = [
  { number: 1, name: 'One', par: 4, tier: 'beginner' },
  { number: 2, name: 'Two', par: 3, tier: 'beginner' },
];
const pin = new Vector3(0, 0, -300);

describe('Round', () => {
  it('tees off in order, then the farthest player plays', () => {
    const r = new Round(setup, holes);
    r.beginHole();
    expect(r.next(pin)).toBe(0);
    r.stroke(0, new Vector3(), 'tee');
    r.placeBall(0, new Vector3(0, 0, -250), 'fairway');
    expect(r.next(pin)).toBe(1);
    r.stroke(1, new Vector3(), 'tee');
    r.placeBall(1, new Vector3(0, 0, -200), 'fairway');
    expect(r.next(pin)).toBe(1);
  });

  it('records holed strokes and picks up at the limit', () => {
    const r = new Round(setup, holes);
    r.beginHole();
    for (let k = 0; k < 8; k++) r.stroke(1, new Vector3(), 'rough');
    expect(r.mustPickUp(1)).toBe(true);
    expect(r.finishPlayer(1, 'pickedUp')).toBe(8);
    r.stroke(0, new Vector3(), 'tee');
    r.stroke(0, new Vector3(), 'fairway');
    r.stroke(0, new Vector3(), 'green');
    expect(r.finishPlayer(0, 'holed')).toBe(3);
    expect(r.next(pin)).toBeNull();
    expect(r.toPar(0)).toBe(-1);
    expect(r.advance()).toBe(true);
    r.beginHole();
    // Player 0 has the honour after the birdie.
    expect(r.next(pin)).toBe(0);
    expect(r.ranking()).toEqual([0, 1]);
  });

  it('counts penalties', () => {
    const r = new Round(setup, holes);
    r.beginHole();
    r.stroke(0, new Vector3(), 'tee');
    r.penalty(0);
    expect(r.players[0].taken).toBe(2);
  });

  it('formats score to par', () => {
    expect(formatToPar(0)).toBe('E');
    expect(formatToPar(2)).toBe('+2');
    expect(formatToPar(-1)).toBe('−1');
  });
});
