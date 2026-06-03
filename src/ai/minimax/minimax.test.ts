import { describe, it, expect } from 'vitest';
import { minimaxMove, MinimaxParticipant } from './minimax';
import { empty, emptyCells, fromCells, place } from '../../game/board';
import { winner, other } from '../../game/rules';
import type { Board, Player } from '../../game/types';

describe('minimax', () => {
  it('takes an immediately winning move', () => {
    const b = fromCells(['X', 'X', '', '', 'O', '', 'O', '', '']);
    expect(minimaxMove(b, 'X')).toBe(2);
  });

  it('blocks an immediate loss', () => {
    const b = fromCells(['O', 'O', '', '', 'X', '', '', '', '']);
    expect(minimaxMove(b, 'X')).toBe(2);
  });

  it('prefers the faster win (depth-aware)', () => {
    const b = fromCells(['X', 'X', '', '', 'O', '', '', '', 'O']);
    expect(minimaxMove(b, 'X')).toBe(2);
  });

  it('never loses from the empty board against any line of play', () => {
    const b: Board = empty();
    let toMove: Player = 'X';
    while (!winner(b)) {
      const mv = minimaxMove(b, toMove);
      place(b, mv, toMove);
      toMove = other(toMove);
    }
    expect(winner(b)!.who).toBe('draw');
    expect(emptyCells(b)).toHaveLength(0);
  });

  it('MinimaxParticipant implements Participant and plays a complete game', () => {
    const p = new MinimaxParticipant();
    p.startEpisode();
    const b: Board = empty();
    let toMove: Player = 'X';
    while (!winner(b)) {
      const mv = p.chooseMove(b, toMove);
      place(b, mv, toMove);
      toMove = other(toMove);
    }
    p.observeOutcome(0);
    expect(winner(b)!.who).toBe('draw');
  });
});
