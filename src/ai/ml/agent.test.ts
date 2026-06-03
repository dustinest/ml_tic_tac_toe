import { describe, it, expect } from 'vitest';
import { QLearningAgent } from './agent';
import { MapQStore } from './qstore';
import { empty } from '../../game/board';
import type { Board } from '../../game/types';

const greedy = () => ({ alpha: 0.3, gamma: 0.9, epsilon: 0 });

describe('QLearningAgent', () => {
  it('with epsilon=0 picks the highest-Q legal action (greedy)', () => {
    const store = new MapQStore();
    const agent = new QLearningAgent(store, () => 0, greedy());
    const b: Board = empty();
    const mv = agent.chooseMove(b, 'X');
    expect(mv).toBeGreaterThanOrEqual(0);
    expect(mv).toBeLessThan(9);
  });

  it('terminal reward updates the last (state, action) Q toward the reward', () => {
    const store = new MapQStore();
    const agent = new QLearningAgent(store, () => 0, greedy());
    agent.startEpisode();
    const b: Board = empty();
    agent.chooseMove(b, 'X');
    agent.observeOutcome(1);
    const states = store.states();
    expect(states.length).toBe(1);
    const acts = store.actions(states[0]);
    expect(store.get(states[0], acts[0])).toBeCloseTo(0.3, 6);
  });

  it('increments games on observeOutcome and resets episode state', () => {
    const store = new MapQStore();
    const agent = new QLearningAgent(store, () => 0, greedy());
    expect(agent.games).toBe(0);
    agent.startEpisode();
    agent.chooseMove(empty(), 'X');
    agent.observeOutcome(0);
    expect(agent.games).toBe(1);
  });

  it('two agents sharing one store learn into the same table (self-play)', () => {
    const store = new MapQStore();
    const ax = new QLearningAgent(store, () => 0, greedy());
    const ao = new QLearningAgent(store, () => 0, greedy());
    ax.startEpisode();
    ao.startEpisode();
    ax.chooseMove(empty(), 'X');
    ax.observeOutcome(1);
    ao.chooseMove(empty(), 'O');
    ao.observeOutcome(-1);
    expect(store.states().length).toBeGreaterThanOrEqual(1);
  });

  it('exploring=false forces greedy regardless of epsilon', () => {
    const store = new MapQStore();
    // epsilon=1 would always explore — but exploring=false must override it.
    // With every move already known (nothing left to explore), greedy must
    // pick the unique highest-Q action rather than a random one.
    const seq = [0.0, 0.5];
    let i = 0;
    const rng = () => seq[i++ % seq.length];
    const agent = new QLearningAgent(store, rng, { alpha: 0.3, gamma: 0.9, epsilon: 1 });
    agent.exploring = false;
    const b: Board = empty();
    // seed every action on the canonical empty board (key is all zeros), center best
    const key = '000000000';
    for (let a = 0; a < 9; a++) store.set(key, a, 1);
    store.set(key, 4, 5); // center has high Q
    const mv = agent.chooseMove(b, 'X');
    expect(agent.explorationRate()).toBe(0);
    expect(mv).toBe(4); // greedy picks the high-Q canonical action (center maps to 4)
  });

  it('prefers an untried move over a higher-Q known one (explore first)', () => {
    // This is the "b3" case: the agent has a learned-good move but has never
    // tried the winning one. It must explore the untried move, not exploit.
    const store = new MapQStore();
    const agent = new QLearningAgent(store, () => 0, greedy()); // epsilon 0, no random
    const key = '000000000'; // canonical empty board (perm = identity)
    store.set(key, 4, 5); // center is known and clearly best
    const mv = agent.chooseMove(empty(), 'X');
    expect(store.has(key, mv)).toBe(false); // it chose an untried action
    expect(mv).not.toBe(4);                 // not the high-Q known one
  });

  it('falls back to greedy max-Q once every legal move is known', () => {
    const store = new MapQStore();
    const agent = new QLearningAgent(store, () => 0, greedy());
    const key = '000000000';
    for (let a = 0; a < 9; a++) store.set(key, a, 1);
    store.set(key, 4, 5); // center uniquely best
    const mv = agent.chooseMove(empty(), 'X');
    expect(mv).toBe(4); // nothing left to explore → exploit the best
  });

  it('explorationRate decays with games when epsilonTau is finite; constant otherwise', () => {
    const store = new MapQStore();
    const constant = new QLearningAgent(store, () => 0, { alpha: 0.3, gamma: 0.9, epsilon: 0.2 });
    expect(constant.explorationRate()).toBeCloseTo(0.2, 6);
    constant.games = 10_000;
    expect(constant.explorationRate()).toBeCloseTo(0.2, 6); // no decay by default

    const decaying = new QLearningAgent(store, () => 0, {
      alpha: 0.3, gamma: 0.9, epsilon: 0.3, epsilonMin: 0.02, epsilonTau: 1000,
    });
    expect(decaying.explorationRate()).toBeCloseTo(0.3, 6); // games=0
    decaying.games = 1000;
    // 0.02 + (0.3-0.02)*e^-1 ≈ 0.123
    expect(decaying.explorationRate()).toBeCloseTo(0.02 + 0.28 * Math.exp(-1), 6);
    decaying.games = 100_000;
    expect(decaying.explorationRate()).toBeCloseTo(0.02, 4); // approaches the floor
  });
});
