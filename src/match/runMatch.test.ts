import { describe, it, expect } from 'vitest';
import { runMatch } from './runMatch';
import type { MatchResult, MoveEvent } from './types';
import type { Participant, Reward } from '../ai/types';
import type { Board, Move, Player } from '../game/types';
import { cellAt } from '../game/board';

/** A participant that plays a fixed script of moves and records its reward. */
class ScriptedParticipant implements Participant {
  episodes = 0;
  reward: Reward | null = null;
  private i = 0;
  constructor(private readonly moves: Move[]) {}
  startEpisode(): void {
    this.episodes++;
    this.i = 0;
  }
  chooseMove(_board: Board, _me: Player): Move {
    return this.moves[this.i++];
  }
  observeOutcome(reward: Reward): void {
    this.reward = reward;
  }
}

function drain<R>(gen: Generator<MoveEvent, R, void>): { events: MoveEvent[]; result: R } {
  const events: MoveEvent[] = [];
  let n = gen.next();
  while (!n.done) {
    events.push(n.value);
    n = gen.next();
  }
  return { events, result: n.value };
}

describe('runMatch', () => {
  it('X starts and a row win is reported with its line + rewards', () => {
    const x = new ScriptedParticipant([0, 1, 2]);
    const o = new ScriptedParticipant([3, 4]);
    const { events, result } = drain<MatchResult>(runMatch(x, o));
    expect(result).toEqual({ winner: 'X', line: [0, 1, 2] });
    expect(events).toHaveLength(5);
    expect(x.reward).toBe(1);
    expect(o.reward).toBe(-1);
    expect(x.episodes).toBe(1);
    expect(o.episodes).toBe(1);
  });

  it('reports a draw with reward 0 for both', () => {
    const x = new ScriptedParticipant([0, 1, 5, 6, 8]);
    const o = new ScriptedParticipant([2, 3, 4, 7]);
    const { result } = drain<MatchResult>(runMatch(x, o));
    expect(result.winner).toBe('draw');
    expect(x.reward).toBe(0);
    expect(o.reward).toBe(0);
  });

  it('the first MoveEvent carries the post-move board snapshot and mover', () => {
    const x = new ScriptedParticipant([0, 1, 2]);
    const o = new ScriptedParticipant([3, 4]);
    const first = runMatch(x, o).next().value as MoveEvent;
    expect(first.player).toBe('X');
    expect(first.move).toBe(0);
    expect(cellAt(first.board, 0)).toBe('X');
  });
});
