import type { Board, Move, Player } from '../../game/types';
import { emptyCells, place, unplace, filledCount } from '../../game/board';
import { winner, other } from '../../game/rules';
import type { Participant, Reward } from '../types';

const mmCache = new Map<string, number>();

/**
 * Perfect-play score for `me` with `toMove` to move. Depth-aware:
 * an earlier win scores higher (10 - depth) and a later loss scores
 * higher (depth - 10), so it prefers the fastest win / slowest loss.
 * NOTE: mutates `b` in place during search and restores it (place/unplace).
 */
export function minimaxScore(b: Board, toMove: Player, me: Player): number {
  const w = winner(b);
  if (w) {
    if (w.who === 'draw') return 0;
    const depth = filledCount(b);
    return w.who === me ? 10 - depth : depth - 10;
  }
  const key = `${b[0]},${b[1]},${toMove},${me}`;
  const cached = mmCache.get(key);
  if (cached !== undefined) return cached;

  const cells = emptyCells(b);
  let best = toMove === me ? -Infinity : Infinity;
  for (const i of cells) {
    place(b, i, toMove);
    const s = minimaxScore(b, other(toMove), me);
    unplace(b, i, toMove);
    best = toMove === me ? Math.max(best, s) : Math.min(best, s);
  }
  mmCache.set(key, best);
  return best;
}

export function minimaxMove(b: Board, me: Player): Move {
  const cells = emptyCells(b);
  let bestVal = -Infinity;
  let bestMove = cells[0];
  for (const i of cells) {
    place(b, i, me);
    const v = minimaxScore(b, other(me), me);
    unplace(b, i, me);
    if (v > bestVal) {
      bestVal = v;
      bestMove = i;
    }
  }
  return bestMove;
}

/** Minimax as a Participant: plays perfectly, never learns. */
export class MinimaxParticipant implements Participant {
  startEpisode(): void {
    /* stateless */
  }
  chooseMove(board: Board, me: Player): Move {
    // operate on a copy so the runner's board is never mutated by search
    return minimaxMove(board.slice(), me);
  }
  observeOutcome(_reward: Reward): void {
    /* never learns */
  }
}
