import type { Board, Player } from '../game/types';
import { empty } from '../game/board';
import { MapQStore } from '../ai/ml/qstore';
import { QLearningAgent } from '../ai/ml/agent';
import { MinimaxParticipant } from '../ai/minimax/minimax';
import { StatsRecorder } from '../stats/stats';

export type Mode = 'mh' | 'mlh' | 'mmml' | 'mlml';
// epsilon starts at 0.3 and decays toward 0.02 over training, so the learning
// curve converges (draw% → ~100% vs minimax) instead of plateauing on noise.
const HYPER = { alpha: 0.3, gamma: 0.9, epsilon: 0.3, epsilonMin: 0.02, epsilonTau: 1200 };

/** Shared, persistent learning state across modes. */
export class AppState {
  mode: Mode = 'mlh';
  humanStarts = true;
  board: Board = empty();
  turn: Player = 'X';
  gameOver = false;
  busy = false;
  mlSymbol: Player = 'O';

  readonly store = new MapQStore();
  /** X-side learner; also the brain shown in stats/inspector. */
  readonly agent = new QLearningAgent(this.store, Math.random, HYPER);
  /** O-side learner for self-play; shares the same store. */
  readonly agentO = new QLearningAgent(this.store, Math.random, HYPER);
  readonly minimax = new MinimaxParticipant();
  readonly stats = new StatsRecorder();

  isHumanMode(): boolean {
    return this.mode === 'mh' || this.mode === 'mlh';
  }
  humanSymbol(): Player {
    return this.humanStarts ? 'X' : 'O';
  }
  cpuSymbol(): Player {
    return this.humanStarts ? 'O' : 'X';
  }
  resetTraining(): void {
    this.store.reset();
    this.agent.games = 0;
    this.agentO.games = 0;
    this.stats.reset();
  }
}
