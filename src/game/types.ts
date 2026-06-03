export type Player = 'X' | 'O';
export type Cell = Player | '';

/**
 * Bitboard representation (see the reference engine in tic_tac_toe_react).
 * The board is one integer per player: index 0 = X's mask, index 1 = O's mask.
 * Each mask is a 9-bit field where bit `i` (= 1 << i) means that player
 * occupies cell `i` (row-major, 0..8). The whole 3x3 board therefore fits in
 * two integers; larger boards would extend to more bits / an integer array.
 */
export type Board = number[];
export type Move = number;           // 0..8 cell index
export type Line = [number, number, number];
export interface Winner {
  who: Player | 'draw';
  line: Line | null;                 // null for a draw
}
