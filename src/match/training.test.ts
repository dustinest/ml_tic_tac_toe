import { describe, it, expect } from 'vitest';
import { drainMatch, resultFor } from './training';
import { runMatch } from './runMatch';
import { MinimaxParticipant } from '../ai/minimax/minimax';
import { QLearningAgent } from '../ai/ml/agent';
import { MapQStore } from '../ai/ml/qstore';

describe('training helpers', () => {
  it('drainMatch runs a generator to completion and returns the result', () => {
    const x = new MinimaxParticipant();
    const o = new MinimaxParticipant();
    const result = drainMatch(runMatch(x, o));
    expect(result.winner).toBe('draw');
  });

  it('resultFor maps a winner to win/draw/loss from a perspective', () => {
    expect(resultFor({ winner: 'X', line: null }, 'X')).toBe('win');
    expect(resultFor({ winner: 'O', line: null }, 'X')).toBe('loss');
    expect(resultFor({ winner: 'draw', line: null }, 'X')).toBe('draw');
  });

  it('an exploring agent vs minimax never beats it (best case: draw)', () => {
    const store = new MapQStore();
    const agent = new QLearningAgent(store, Math.random, { alpha: 0.3, gamma: 0.9, epsilon: 0.2 });
    const mm = new MinimaxParticipant();
    let wins = 0;
    for (let k = 0; k < 50; k++) {
      const r = drainMatch(runMatch(agent, mm));
      if (r.winner === 'X') wins++;
    }
    expect(wins).toBe(0);
  });
});
