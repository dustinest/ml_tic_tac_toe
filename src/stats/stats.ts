import type { ChartPoint, Outcome, Rates } from './types';

export const WINDOW = 100;

export function rates(arr: Outcome[]): Rates {
  if (!arr.length) return { win: 0, draw: 0, loss: 0 };
  let w = 0, d = 0, l = 0;
  for (const r of arr) {
    if (r === 'win') w++;
    else if (r === 'draw') d++;
    else l++;
  }
  const n = arr.length;
  return { win: w / n, draw: d / n, loss: l / n };
}

/** Accumulates outcomes and a sliding-window learning curve. */
export class StatsRecorder {
  readonly results: Outcome[] = [];
  readonly chartPoints: ChartPoint[] = [];

  add(o: Outcome): void {
    this.results.push(o);
  }
  currentRates(): Rates {
    return rates(this.results.slice(-WINDOW));
  }
  snapshot(games: number): void {
    this.chartPoints.push({ g: games, ...this.currentRates() });
  }
  reset(): void {
    this.results.length = 0;
    this.chartPoints.length = 0;
  }
}
