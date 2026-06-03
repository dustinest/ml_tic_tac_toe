import { strings } from '../i18n';

export interface ControlActions {
  train: (n: number) => void;
  watch: () => void;
  newGame: () => void;
  resetTraining: () => void;
}

export function buildControls(
  el: HTMLElement,
  isHumanMode: boolean,
  actions: ControlActions,
): void {
  el.innerHTML = '';
  const add = (label: string, cls: string, fn: () => void) => {
    const b = document.createElement('button');
    b.className = 'act ' + cls;
    b.textContent = label;
    b.onclick = fn;
    el.appendChild(b);
  };
  if (!isHumanMode) {
    add(strings.controls.train100, 'primary', () => actions.train(100));
    add(strings.controls.train1000, 'primary', () => actions.train(1000));
    add(strings.controls.watchOne, '', () => actions.watch());
  } else {
    add(strings.controls.newGame, '', () => actions.newGame());
  }
  add(strings.controls.resetTraining, 'danger', () => actions.resetTraining());
}
