export interface Hyperparams {
  alpha: number;   // learning rate
  gamma: number;   // discount
  epsilon: number; // exploration probability (starting value if decaying)
  /** Floor the exploration rate decays toward. Default 0 (no floor). */
  epsilonMin?: number;
  /**
   * Time constant for exponential decay of epsilon over games played:
   * rate = epsilonMin + (epsilon - epsilonMin) * exp(-games / epsilonTau).
   * Default Infinity → epsilon stays constant (no decay).
   */
  epsilonTau?: number;
}

/** Injectable random source so exploration is deterministic in tests. */
export type Rng = () => number;

/** Q-value + visit storage. Shared between two agents in self-play. */
export interface QStore {
  get(stateKey: string, action: number): number;       // 0 if unseen
  has(stateKey: string, action: number): boolean;       // true once an entry exists (even if 0)
  set(stateKey: string, action: number, value: number): void;
  visit(stateKey: string): void;                        // increment visit count
  visits(stateKey: string): number;
  states(): string[];                                   // all known state keys
  actions(stateKey: string): number[];                  // actions stored for a state
  reset(): void;
}
