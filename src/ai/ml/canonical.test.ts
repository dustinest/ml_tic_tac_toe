import { describe, it, expect } from 'vitest';
import { SYM, canon } from './canonical';
import { fromCells } from '../../game/board';
import type { Cell } from '../../game/types';

describe('canonical', () => {
  it('has 8 symmetry permutations', () => {
    expect(SYM).toHaveLength(8);
    for (const p of SYM) expect(p).toHaveLength(9);
  });

  it('is color-blind and picks the lexicographically smallest transform', () => {
    // pattern [1,0,0,0,2,0,0,0,0]; center O is fixed by all symmetries, the
    // corner X maps across the 4 corners, so the lex-min representative puts
    // the lone 1 in the last reachable corner -> '000020001'.
    const b = fromCells(['X', '', '', '', 'O', '', '', '', '']);
    const { key } = canon(b, 'X');
    expect(key).toBe('000020001');
  });

  it('maps all 8 symmetric boards to the same key', () => {
    const base: Cell[] = ['X', '', '', '', 'O', '', '', '', ''];
    const baseKey = canon(fromCells(base), 'X').key;
    for (const p of SYM) {
      const transformed: Cell[] = Array(9).fill('');
      for (let i = 0; i < 9; i++) transformed[i] = base[p[i]];
      expect(canon(fromCells(transformed), 'X').key).toBe(baseKey);
    }
  });

  it('perm maps a real square to its canonical position via indexOf', () => {
    const b = fromCells(['X', '', '', '', 'O', '', '', '', '']);
    const { perm } = canon(b, 'X');
    const cps = [1, 2, 3, 5, 6, 7, 8].map((real) => perm.indexOf(real));
    expect(new Set(cps).size).toBe(cps.length);
  });
});
