import type { Rates } from '../stats/types';
import { strings } from '../i18n';

export interface StatsElements {
  sWin: HTMLElement; sDraw: HTMLElement; sLoss: HTMLElement;
  mGames: HTMLElement; mStates: HTMLElement; mFill: HTMLElement;
  agentMeta: HTMLElement;
}

export function renderStats(
  els: StatsElements,
  rates: Rates,
  games: number,
  states: number,
): void {
  els.sWin.textContent = Math.round(rates.win * 100) + '%';
  els.sDraw.textContent = Math.round(rates.draw * 100) + '%';
  els.sLoss.textContent = Math.round(rates.loss * 100) + '%';
  els.mGames.textContent = String(games);
  els.mStates.textContent = String(states);
  els.mFill.textContent = states + ' / ~627';
  els.agentMeta.textContent = strings.agentMeta(states, games);
}
