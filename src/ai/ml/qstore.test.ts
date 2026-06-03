import { describe, it, expect } from 'vitest';
import { MapQStore } from './qstore';

describe('MapQStore', () => {
  it('returns 0 for unseen (state, action)', () => {
    const s = new MapQStore();
    expect(s.get('000000000', 4)).toBe(0);
  });

  it('stores and retrieves a value', () => {
    const s = new MapQStore();
    s.set('000000000', 4, 0.5);
    expect(s.get('000000000', 4)).toBe(0.5);
  });

  it('tracks visits and known states', () => {
    const s = new MapQStore();
    s.set('100020000', 1, 0.2);
    s.visit('100020000');
    s.visit('100020000');
    expect(s.visits('100020000')).toBe(2);
    expect(s.states()).toEqual(['100020000']);
    expect(s.actions('100020000')).toEqual([1]);
  });

  it('has() reports whether a (state, action) entry exists', () => {
    const s = new MapQStore();
    expect(s.has('000000000', 4)).toBe(false);
    s.set('000000000', 4, 0); // even a stored 0 counts as known
    expect(s.has('000000000', 4)).toBe(true);
    expect(s.has('000000000', 1)).toBe(false); // other actions still unseen
  });

  it('reset clears everything', () => {
    const s = new MapQStore();
    s.set('100020000', 1, 0.2);
    s.visit('100020000');
    s.reset();
    expect(s.states()).toEqual([]);
    expect(s.visits('100020000')).toBe(0);
  });
});
