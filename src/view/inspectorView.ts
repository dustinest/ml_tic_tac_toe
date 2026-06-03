import type { QStore } from '../ai/ml/types';
import { strings } from '../i18n';

const CAP = 180;

/** Sort known states by descending visits. */
function sortedStates(store: QStore): string[] {
  return store.states().sort((a, b) => store.visits(b) - store.visits(a));
}

export function renderInspector(el: HTMLElement, store: QStore): void {
  const keys = sortedStates(store);
  el.innerHTML = '';
  if (!keys.length) {
    el.innerHTML = `<p class="note">${strings.inspector.empty}</p>`;
    return;
  }
  keys.slice(0, CAP).forEach((key) => {
    let bestA = -1, bestV = -Infinity;
    for (const a of store.actions(key)) {
      const v = store.get(key, a);
      if (v > bestV) { bestV = v; bestA = a; }
    }
    const mini = document.createElement('div');
    mini.className = 'mini';
    const g = document.createElement('div');
    g.className = 'mg';
    for (let i = 0; i < 9; i++) {
      const c = document.createElement('div');
      c.className = 'mc';
      const ch = key[i];
      if (ch === '1') { c.classList.add('me'); c.textContent = '●'; }
      else if (ch === '2') { c.classList.add('opp'); c.textContent = '○'; }
      else if (store.actions(key).includes(i)) {
        const s = document.createElement('span');
        s.className = 'q';
        s.textContent = store.get(key, i).toFixed(1);
        c.appendChild(s);
      }
      if (i === bestA) c.classList.add('best');
      g.appendChild(c);
    }
    mini.appendChild(g);
    const vis = document.createElement('div');
    vis.className = 'vis';
    vis.textContent = '×' + store.visits(key);
    mini.appendChild(vis);
    el.appendChild(mini);
  });
  if (keys.length > CAP) {
    const m = document.createElement('div');
    m.className = 'note';
    m.style.gridColumn = '1/-1';
    m.textContent = strings.inspector.capped(CAP, keys.length);
    el.appendChild(m);
  }
}

export function exportJson(store: QStore): string {
  const out: Record<string, { visits: number; q: Record<number, number> }> = {};
  for (const k of sortedStates(store)) {
    const q: Record<number, number> = {};
    for (const a of store.actions(k)) q[a] = +store.get(k, a).toFixed(3);
    out[k] = { visits: store.visits(k), q };
  }
  return JSON.stringify(out, null, 1);
}
