import type { Board, Player } from '../../game/types';
import { cellAt } from '../../game/board';

/**
 * The 8 board symmetries (4 rotations + 4 reflections).
 * For transform P: transformed[i] = board[P[i]].
 * A real square `cp` maps to canonical position P.indexOf(cp).
 */
export const SYM: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8], // identity
  [6, 3, 0, 7, 4, 1, 8, 5, 2], // rotate 90
  [8, 7, 6, 5, 4, 3, 2, 1, 0], // rotate 180
  [2, 5, 8, 1, 4, 7, 0, 3, 6], // rotate 270
  [2, 1, 0, 5, 4, 3, 8, 7, 6], // mirror horizontal
  [6, 7, 8, 3, 4, 5, 0, 1, 2], // mirror vertical
  [0, 3, 6, 1, 4, 7, 2, 5, 8], // mirror main diagonal
  [8, 5, 2, 7, 4, 1, 6, 3, 0], // mirror anti-diagonal
];

export interface Canon {
  key: string;       // canonical color-blind state key
  perm: number[];    // the chosen transform; perm.indexOf(real) = canonical pos
}

export function canon(b: Board, me: Player): Canon {
  // 1) color-blind: my mark -> 1, opponent -> 2, empty -> 0
  const m = new Array<number>(9);
  for (let i = 0; i < 9; i++) {
    const c = cellAt(b, i);
    m[i] = c === '' ? 0 : c === me ? 1 : 2;
  }
  // 2) geometry: pick the lexicographically smallest of the 8 transforms
  let bestKey: string | null = null;
  let bestPerm = SYM[0];
  for (const P of SYM) {
    let s = '';
    for (let i = 0; i < 9; i++) s += m[P[i]];
    if (bestKey === null || s < bestKey) {
      bestKey = s;
      bestPerm = P;
    }
  }
  return { key: bestKey as string, perm: bestPerm };
}
