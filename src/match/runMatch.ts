import type { Player } from '../game/types';
import type { Participant, Reward } from '../ai/types';
import { empty, place } from '../game/board';
import { winner, other } from '../game/rules';
import type { MatchResult, MoveEvent } from './types';

/**
 * Play one match between two participants. X always starts.
 * Yields a MoveEvent after each move; returns the MatchResult.
 * Contains no timing and no DOM.
 */
export function* runMatch(
  playerX: Participant,
  playerO: Participant,
): Generator<MoveEvent, MatchResult, void> {
  const board = empty();
  let toMove: Player = 'X';

  playerX.startEpisode();
  playerO.startEpisode();

  while (true) {
    const current = toMove === 'X' ? playerX : playerO;
    const move = current.chooseMove(board, toMove);
    place(board, move, toMove);
    yield { board: board.slice(), move, player: toMove };

    const w = winner(board);
    if (w) {
      const rewardFor = (p: Player): Reward =>
        w.who === 'draw' ? 0 : w.who === p ? 1 : -1;
      playerX.observeOutcome(rewardFor('X'));
      playerO.observeOutcome(rewardFor('O'));
      return { winner: w.who, line: w.line };
    }
    toMove = other(toMove);
  }
}
