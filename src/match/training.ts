import type { Player } from '../game/types';
import type { Participant } from '../ai/types';
import type { MatchResult, MoveEvent } from './types';
import { runMatch } from './runMatch';
import type { Outcome } from '../stats/types';

/** Drive a match generator to completion, ignoring intermediate events. */
export function drainMatch(gen: Generator<MoveEvent, MatchResult, void>): MatchResult {
  let n = gen.next();
  while (!n.done) n = gen.next();
  return n.value;
}

/** Map a result to win/draw/loss from `me`'s perspective. */
export function resultFor(result: MatchResult, me: Player): Outcome {
  if (result.winner === 'draw') return 'draw';
  return result.winner === me ? 'win' : 'loss';
}

/**
 * Play one minimax-vs-ML training game. Sides alternate by `gameIdx`
 * so the agent learns both colors. Returns the outcome from the ML's view.
 */
export function playMinimaxVsMl(
  agent: Participant,
  minimax: Participant,
  gameIdx: number,
): Outcome {
  const mlIsX = gameIdx % 2 === 0;
  const x = mlIsX ? agent : minimax;
  const o = mlIsX ? minimax : agent;
  const result = drainMatch(runMatch(x, o));
  return resultFor(result, mlIsX ? 'X' : 'O');
}

/**
 * Play one self-play game. Both agents share one store (passed in by the
 * caller). Returns the outcome from X's perspective.
 */
export function playSelfPlay(agentX: Participant, agentO: Participant): Outcome {
  const result = drainMatch(runMatch(agentX, agentO));
  return resultFor(result, 'X');
}
