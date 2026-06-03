import type { Board, Line, Move } from '../game/types';
import { cellAt } from '../game/board';

export interface BoardViewDeps {
  el: HTMLElement;
  onCellClick: (i: Move) => void;
  isCellLive: (i: Move) => boolean; // true when a human may click that empty cell
}

export class BoardView {
  constructor(private readonly deps: BoardViewDeps) {
    this.build();
  }

  private build(): void {
    const { el, onCellClick } = this.deps;
    el.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const c = document.createElement('div');
      c.className = 'cell';
      c.dataset.i = String(i);
      c.addEventListener('click', () => onCellClick(i));
      el.appendChild(c);
    }
  }

  render(board: Board, winLine: Line | null = null): void {
    const { el, isCellLive } = this.deps;
    [...el.children].forEach((c, i) => {
      const cell = c as HTMLElement;
      const mark = cellAt(board, i);
      cell.textContent = mark;
      cell.className = 'cell' + (mark ? ' ' + mark : '');
      if (!mark && isCellLive(i)) cell.classList.add('live');
      if (winLine && winLine.includes(i)) cell.classList.add('wincell');
    });
  }
}
