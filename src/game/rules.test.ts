import { describe, it, expect } from 'vitest';
import { winner, other, LINES, WIN_MASKS } from './rules';
import { fromCells } from './board';

describe('rules', () => {
  it('other flips the player', () => {
    expect(other('X')).toBe('O');
    expect(other('O')).toBe('X');
  });

  it('LINES has 8 winning lines and WIN_MASKS mirrors them', () => {
    expect(LINES).toHaveLength(8);
    expect(WIN_MASKS).toHaveLength(8);
    expect(WIN_MASKS[0]).toBe((1 << 0) | (1 << 1) | (1 << 2));
    expect(WIN_MASKS[6]).toBe((1 << 0) | (1 << 4) | (1 << 8));
  });

  it('detects a row win and returns its line', () => {
    const b = fromCells(['X', 'X', 'X', '', '', '', '', '', '']);
    expect(winner(b)).toEqual({ who: 'X', line: [0, 1, 2] });
  });

  it('detects a diagonal win', () => {
    const b = fromCells(['O', '', '', '', 'O', '', '', '', 'O']);
    expect(winner(b)).toEqual({ who: 'O', line: [0, 4, 8] });
  });

  it('returns draw when board is full with no line', () => {
    const b = fromCells(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']);
    expect(winner(b)).toEqual({ who: 'draw', line: null });
  });

  it('returns null for an unfinished game', () => {
    const b = fromCells(['X', '', '', '', 'O', '', '', '', '']);
    expect(winner(b)).toBeNull();
  });
});
