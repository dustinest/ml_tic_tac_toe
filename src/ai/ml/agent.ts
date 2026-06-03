import type { Board, Move, Player } from '../../game/types';
import { emptyCells } from '../../game/board';
import type { Participant, Reward } from '../types';
import type { Hyperparams, QStore, Rng } from './types';
import { canon } from './canonical';

interface ActionRef {
  real: Move;  // square on the real board
  cp: number;  // canonical position (index on the canonical board)
}

/**
 * Tabular Q-learning agent, TD(0). All learning happens internally:
 * the previous (state, action) is updated on the NEXT chooseMove
 * (bootstrap) and on observeOutcome (terminal).
 */
export class QLearningAgent implements Participant {
  readonly alpha: number;
  readonly gamma: number;
  readonly epsilon: number;
  readonly epsilonMin: number;
  readonly epsilonTau: number;
  games = 0;

  /**
   * When false, the agent always plays greedily (no random exploration),
   * regardless of epsilon. Set false for real play / watching a single game;
   * keep true for bulk training. Learning (TD updates) still happens either way.
   */
  exploring = true;

  private prevKey: string | null = null;
  private prevAct: number | null = null;

  constructor(
    private readonly store: QStore,
    private readonly rng: Rng,
    hyper: Hyperparams,
  ) {
    this.alpha = hyper.alpha;
    this.gamma = hyper.gamma;
    this.epsilon = hyper.epsilon;
    this.epsilonMin = hyper.epsilonMin ?? 0;
    this.epsilonTau = hyper.epsilonTau ?? Infinity;
  }

  /** Current exploration probability (decays with games when epsilonTau is finite). */
  explorationRate(): number {
    if (!this.exploring) return 0;
    if (!isFinite(this.epsilonTau)) return this.epsilon;
    return this.epsilonMin + (this.epsilon - this.epsilonMin) * Math.exp(-this.games / this.epsilonTau);
  }

  startEpisode(): void {
    this.prevKey = null;
    this.prevAct = null;
  }

  chooseMove(board: Board, me: Player): Move {
    const { key, perm } = canon(board, me);
    const legal = emptyCells(board);
    const acts: ActionRef[] = legal.map((j) => ({ real: j, cp: perm.indexOf(j) }));

    // bootstrap update of the previous (non-terminal) transition: reward 0
    if (this.prevKey !== null && this.prevAct !== null) {
      const futureBest = this.maxQ(key, acts.map((o) => o.cp));
      this.update(this.prevKey, this.prevAct, 0 + this.gamma * futureBest);
    }

    let chosen: ActionRef;
    // A move never tried from this state has no learned value to compare, so we
    // explore it first: only experience can teach the agent what it's worth.
    // This is what lets greedy play (exploring=false) still escape a rut — it
    // will try the unseen winning move instead of repeating a known-good one.
    const unknown = acts.filter((o) => !this.store.has(key, o.cp));
    console.log("Unknownn:" + unknown.length);
    if (unknown.length > 0) {
      chosen = unknown[(this.rng() * unknown.length) | 0];
    } else if (this.rng() < this.explorationRate()) {
      // A bit of randomizing to explore future paths not taken.
      // TODO this might become obsolete in future when we know if absolutely all moves in this path has been taken
      chosen = acts[(this.rng() * acts.length) | 0];
    } else {
      // exploit: highest learned Q wins (a learned win is high, a learned loss
      // is low and thus avoided); random tie-break among equals.
      let best = -Infinity;
      let ties: ActionRef[] = [];
      for (const o of acts) {
        const v = this.store.get(key, o.cp);
        if (v > best) {
          best = v;
          ties = [o];
        } else if (v === best) {
          ties.push(o);
        }
      }
      chosen = ties[(this.rng() * ties.length) | 0];
    }

    this.store.visit(key);
    this.prevKey = key;
    this.prevAct = chosen.cp;  // store the canonical position
    return chosen.real;        // play the real square
  }

  observeOutcome(reward: Reward): void {
    if (this.prevKey !== null && this.prevAct !== null) {
      this.update(this.prevKey, this.prevAct, reward); // terminal: no future
    }
    this.games++;
    this.prevKey = null;
    this.prevAct = null;
  }

  private maxQ(key: string, actions: number[]): number {
    let m = -Infinity;
    for (const a of actions) {
      const v = this.store.get(key, a);
      if (v > m) m = v;
    }
    return m === -Infinity ? 0 : m;
  }

  private update(key: string, action: number, target: number): void {
    const cur = this.store.get(key, action);
    this.store.set(key, action, cur + this.alpha * (target - cur));
  }
}
