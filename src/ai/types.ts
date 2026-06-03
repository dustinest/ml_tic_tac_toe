import type { Board, Move, Player } from '../game/types';

/** Reward from a participant's own perspective at terminal state. */
export type Reward = -1 | 0 | 1;

/**
 * A match participant. Both minimax and the Q-learning agent satisfy this.
 * The match runner depends ONLY on this interface — it never knows how a
 * participant chooses or whether/how it learns.
 */
export interface Participant {
  /** Called once at the start of every game. */
  startEpisode(): void;
  /** Choose a legal move for `me` on `board`. May explore internally. */
  chooseMove(board: Board, me: Player): Move;
  /** Called once at terminal with this participant's own reward. */
  observeOutcome(reward: Reward): void;
}
