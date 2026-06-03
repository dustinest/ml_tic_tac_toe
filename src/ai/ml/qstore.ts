import type { QStore } from './types';

export class MapQStore implements QStore {
  private Q: Record<string, Record<number, number>> = {};
  private V: Record<string, number> = {};

  get(stateKey: string, action: number): number {
    const row = this.Q[stateKey];
    return row && row[action] !== undefined ? row[action] : 0;
  }
  has(stateKey: string, action: number): boolean {
    const row = this.Q[stateKey];
    return row !== undefined && row[action] !== undefined;
  }
  set(stateKey: string, action: number, value: number): void {
    if (!this.Q[stateKey]) this.Q[stateKey] = {};
    this.Q[stateKey][action] = value;
  }
  visit(stateKey: string): void {
    this.V[stateKey] = (this.V[stateKey] || 0) + 1;
  }
  visits(stateKey: string): number {
    return this.V[stateKey] || 0;
  }
  states(): string[] {
    return Object.keys(this.Q);
  }
  actions(stateKey: string): number[] {
    return this.Q[stateKey] ? Object.keys(this.Q[stateKey]).map(Number) : [];
  }
  reset(): void {
    this.Q = {};
    this.V = {};
  }
}
