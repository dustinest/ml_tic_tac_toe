import type { Board, Line, Move, Player } from '../game/types';

export interface MoveEvent {
  board: Board;     // snapshot AFTER the move
  move: Move;
  player: Player;
}

export interface MatchResult {
  winner: Player | 'draw';
  line: Line | null;
}
