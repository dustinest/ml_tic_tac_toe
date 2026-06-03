import type { Board, Line, Player, Winner } from './types';
import { bitFor, isFull, playerIndex } from './board';

export const LINES: Line[] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

/** Each winning line precomputed as a bitmask (cf. reference WINNING_BOARD). */
export const WIN_MASKS: number[] = LINES.map(
  ([a, c, d]) => bitFor(a) | bitFor(c) | bitFor(d),
);

export const other = (s: Player): Player => (s === 'X' ? 'O' : 'X');

export function winner(b: Board): Winner | null {
  for (const who of ['X', 'O'] as const) {
    const mask = b[playerIndex(who)];
    for (let li = 0; li < WIN_MASKS.length; li++) {
      if ((mask & WIN_MASKS[li]) === WIN_MASKS[li]) {
        return { who, line: LINES[li] };
      }
    }
  }
  if (isFull(b)) return { who: 'draw', line: null };
  return null;
}
