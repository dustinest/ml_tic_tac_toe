import { describe, it, expect } from 'vitest';
import { rates, StatsRecorder, WINDOW } from './stats';

describe('rates', () => {
  it('returns zeros for an empty array', () => {
    expect(rates([])).toEqual({ win: 0, draw: 0, loss: 0 });
  });
  it('computes fractions', () => {
    expect(rates(['win', 'win', 'draw', 'loss'])).toEqual({ win: 0.5, draw: 0.25, loss: 0.25 });
  });
});

describe('StatsRecorder', () => {
  it('currentRates reflects only the last WINDOW results', () => {
    const r = new StatsRecorder();
    for (let i = 0; i < WINDOW; i++) r.add('loss');
    r.add('win');
    const rt = r.currentRates();
    expect(rt.win).toBeCloseTo(1 / WINDOW, 6);
    expect(rt.loss).toBeCloseTo((WINDOW - 1) / WINDOW, 6);
  });

  it('snapshot appends a chart point at the given game count', () => {
    const r = new StatsRecorder();
    r.add('win');
    r.add('draw');
    r.snapshot(2);
    expect(r.chartPoints).toEqual([{ g: 2, win: 0.5, draw: 0.5, loss: 0 }]);
  });

  it('reset clears results and chart points', () => {
    const r = new StatsRecorder();
    r.add('win');
    r.snapshot(1);
    r.reset();
    expect(r.chartPoints).toEqual([]);
    expect(r.currentRates()).toEqual({ win: 0, draw: 0, loss: 0 });
  });
});
