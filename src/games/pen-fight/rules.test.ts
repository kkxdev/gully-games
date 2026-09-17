import { describe, expect, it } from 'vitest';
import {
  calculateFlick,
  completeRound,
  cpuFlick,
  initialMatch,
  roundOutcome,
} from './rules';
describe('round outcomes', () => {
  it('handles either pen, both pens and neither falling', () => {
    expect(roundOutcome(false, true)).toBe('player');
    expect(roundOutcome(true, false)).toBe('cpu');
    expect(roundOutcome(true, true)).toBe('draw');
    expect(roundOutcome(false, false)).toBeNull();
  });
});
describe('best of five', () => {
  it('ends on the third win and freezes a finished match', () => {
    let match = initialMatch();
    for (const result of ['player', 'cpu', 'player', 'cpu', 'player'] as const)
      match = completeRound(match, result);
    expect(match).toEqual({
      scores: { player: 3, cpu: 2 },
      round: 5,
      winner: 'player',
    });
    expect(completeRound(match, 'cpu')).toBe(match);
  });
  it('allows CPU to win in three and replays draws', () => {
    const initial = initialMatch();
    expect(completeRound(initial, 'draw')).toBe(initial);
    let match = initial;
    for (let i = 0; i < 3; i++) match = completeRound(match, 'cpu');
    expect(match.winner).toBe('cpu');
    expect(match.round).toBe(3);
    expect(initial.scores.cpu).toBe(0);
  });
});
describe('flick controls', () => {
  it('aims opposite the drag, clamps power and handles zero drag', () => {
    expect(calculateFlick({ x: 0, y: 0 }, { x: -65, y: 0 })).toEqual({
      x: 1,
      y: 0,
      power: 0.5,
    });
    expect(calculateFlick({ x: 0, y: 0 }, { x: 1000, y: 0 })).toEqual({
      x: -1,
      y: 0,
      power: 1,
    });
    expect(calculateFlick({ x: 4, y: 4 }, { x: 4, y: 4 })).toEqual({
      x: 0,
      y: 0,
      power: 0,
    });
  });
  it('normalizes diagonal direction', () => {
    const flick = calculateFlick({ x: 0, y: 0 }, { x: -60, y: -80 });
    expect(flick.x).toBe(0.6);
    expect(flick.y).toBe(0.8);
  });
  it('bounds CPU variance and power while targeting the opponent', () => {
    const flick = cpuFlick({ x: 0, y: 0 }, { x: 300, y: 0 }, () => 0.5);
    expect(flick.y).toBe(0);
    expect(flick.x).toBe(1);
    expect(flick.power).toBeGreaterThan(0.4);
    for (const random of [0, 1]) {
      const edge = cpuFlick({ x: 0, y: 0 }, { x: 10000, y: 0 }, () => random);
      expect(Math.abs(Math.atan2(edge.y, edge.x))).toBeLessThanOrEqual(0.11);
      expect(edge.power).toBeLessThanOrEqual(0.85);
    }
  });
});
