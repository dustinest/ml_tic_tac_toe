import { describe, it, expect } from 'vitest';
import {
  empty, emptyCells, isFull, cellAt, hasAt, place, unplace, fromCells, occupied, filledCount,
} from './board';

describe('board (bitboard)', () => {
  it('empty() is two zero masks', () => {
    expect(empty()).toEqual([0, 0]);
  });

  it('place sets a bit in the correct player mask; cellAt reads it back', () => {
    const b = empty();
    place(b, 0, 'X');
    place(b, 4, 'O');
    expect(b[0]).toBe(1 << 0);
    expect(b[1]).toBe(1 << 4);
    expect(cellAt(b, 0)).toBe('X');
    expect(cellAt(b, 4)).toBe('O');
    expect(cellAt(b, 1)).toBe('');
  });

  it('hasAt reflects occupancy per player', () => {
    const b = fromCells(['X', '', 'O', '', '', '', '', '', '']);
    expect(hasAt(b, 'X', 0)).toBe(true);
    expect(hasAt(b, 'O', 0)).toBe(false);
    expect(hasAt(b, 'O', 2)).toBe(true);
  });

  it('unplace clears a bit', () => {
    const b = empty();
    place(b, 5, 'X');
    expect(hasAt(b, 'X', 5)).toBe(true);
    unplace(b, 5, 'X');
    expect(hasAt(b, 'X', 5)).toBe(false);
  });

  it('emptyCells returns indices of blanks', () => {
    const b = fromCells(['X', '', 'O', '', '', '', '', '', '']);
    expect(emptyCells(b)).toEqual([1, 3, 4, 5, 6, 7, 8]);
  });

  it('occupied unions both players; isFull and filledCount track fill', () => {
    expect(isFull(empty())).toBe(false);
    expect(filledCount(empty())).toBe(0);
    const full = fromCells(['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O']);
    expect(occupied(full)).toBe(0b111111111);
    expect(isFull(full)).toBe(true);
    expect(filledCount(full)).toBe(9);
  });

  it('fromCells round-trips through cellAt', () => {
    const cells = ['X', 'O', '', 'X', '', 'O', '', '', 'X'] as const;
    const b = fromCells([...cells]);
    for (let i = 0; i < 9; i++) expect(cellAt(b, i)).toBe(cells[i]);
  });
});
