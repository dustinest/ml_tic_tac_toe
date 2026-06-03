import type { Board, Cell, Move, Player } from './types';

const FULL = 0b111111111; // 511 — all 9 cells occupied

export const playerIndex = (p: Player): number => (p === 'X' ? 0 : 1);
export const bitFor = (move: Move): number => 1 << move;

export const empty = (): Board => [0, 0];

/** Mask of all occupied cells (either player). */
export const occupied = (b: Board): number => b[0] | b[1];

export const hasAt = (b: Board, p: Player, move: Move): boolean =>
  (b[playerIndex(p)] & bitFor(move)) !== 0;

/** Which player occupies `move`, or '' if empty. */
export const cellAt = (b: Board, move: Move): Cell => {
  const bit = bitFor(move);
  if (b[0] & bit) return 'X';
  if (b[1] & bit) return 'O';
  return '';
};

/** Set `move` for `player` (mutating). Returns `b` for chaining. */
export const place = (b: Board, move: Move, player: Player): Board => {
  b[playerIndex(player)] |= bitFor(move);
  return b;
};

/** Clear `move` for `player` (mutating) — used to undo during minimax search. */
export const unplace = (b: Board, move: Move, player: Player): Board => {
  b[playerIndex(player)] &= ~bitFor(move);
  return b;
};

export const emptyCells = (b: Board): Move[] => {
  const occ = occupied(b);
  const r: Move[] = [];
  for (let i = 0; i < 9; i++) if (!(occ & (1 << i))) r.push(i);
  return r;
};

export const isFull = (b: Board): boolean => occupied(b) === FULL;

/** Number of occupied cells (search depth). */
export const filledCount = (b: Board): number => {
  let occ = occupied(b);
  let n = 0;
  while (occ) {
    occ &= occ - 1; // clear lowest set bit
    n++;
  }
  return n;
};

/** Build a board from a 9-cell layout — handy for tests and seeding. */
export const fromCells = (cells: Cell[]): Board => {
  const b = empty();
  for (let i = 0; i < 9; i++) {
    const c = cells[i];
    if (c) place(b, i, c);
  }
  return b;
};
