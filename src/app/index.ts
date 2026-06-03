import { winner, other } from '../game/rules';
import { empty, place, cellAt } from '../game/board';
import type { Move, Player } from '../game/types';
import { runMatch } from '../match/runMatch';
import type { MatchResult, MoveEvent } from '../match/types';
import { playMinimaxVsMl, playSelfPlay, resultFor } from '../match/training';
import { strings } from '../i18n';
import { AppState, type Mode } from './state';
import {
  renderLayout, BoardView, renderStats, drawChart, renderInspector, exportJson, buildControls,
} from '../view';

const $ = (id: string) => document.getElementById(id) as HTMLElement;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function startApp(): void {
  // Build the static chrome from i18n before anything queries the DOM.
  document.title = strings.layout.title;
  renderLayout($('app'));

  const s = new AppState();

  const els = {
    board: $('board'), status: $('status'), controls: $('controls'),
    boardTitle: $('boardtitle'), starterToggle: $('startertoggle'),
    tagline: $('tagline'), boardDesc: $('boarddesc'), learnLine: $('learnline'),
    learnDesc: $('learndesc'), inspDesc: $('inspdesc'),
    metricNote: $('metricnote'), metricExplain: $('metricexplain'),
    inspector: $('inspector'), exportBox: $('exportbox') as unknown as HTMLTextAreaElement,
    inspectorPanel: $('inspectorpanel') as unknown as HTMLDetailsElement,
    exportPanel: $('exportpanel') as unknown as HTMLDetailsElement,
    btnCopy: $('btnCopy'),
    chart: $('chart') as unknown as HTMLCanvasElement,
    sWin: $('sWin'), sDraw: $('sDraw'), sLoss: $('sLoss'),
    mGames: $('mGames'), mStates: $('mStates'), mFill: $('mFill'),
    agentMeta: $('agentmeta'),
  };

  const setStatus = (html: string) => { els.status.innerHTML = html; };

  const board = new BoardView({
    el: els.board,
    onCellClick: (i) => onCellClick(i),
    isCellLive: (i) =>
      s.isHumanMode() && !s.gameOver && !s.busy && s.turn === s.humanSymbol() && !cellAt(s.board, i),
  });

  // ---- stats / inspector refresh ----
  function refreshAll(): void {
    renderStats(els, s.stats.currentRates(), s.agent.games, s.store.states().length);
    drawChart(els.chart, s.stats.chartPoints);
    if (els.inspectorPanel.open) renderInspector(els.inspector, s.store);
  }

  // ---- human games (mh / mlh) ----
  function turnMsg(): string {
    return s.turn === s.humanSymbol()
      ? strings.status.yourTurn(s.turn)
      : strings.status.cpuThinking(s.turn);
  }

  function newGame(): void {
    s.board = empty(); s.gameOver = false; s.busy = false; s.turn = 'X';
    s.agent.startEpisode();
    board.render(s.board);
    if (!s.isHumanMode()) { setStatus(strings.status.trainPrompt); return; }
    setStatus(turnMsg());
    if (s.turn !== s.humanSymbol()) setTimeout(cpuTurn, 250);
  }

  function onCellClick(i: Move): void {
    if (!s.isHumanMode() || s.gameOver || s.busy || cellAt(s.board, i)) return;
    if (s.turn !== s.humanSymbol()) return;
    place(s.board, i, s.humanSymbol());
    if (checkEnd()) return;
    s.turn = other(s.turn);
    board.render(s.board);
    setStatus(turnMsg());
    setTimeout(cpuTurn, 250);
  }

  function cpuTurn(): void {
    if (s.gameOver) return;
    const cpu = s.cpuSymbol();
    // when playing a human, the agent uses its best move (no random exploration)
    s.agent.exploring = false;
    const move = s.mode === 'mh'
      ? s.minimax.chooseMove(s.board, cpu)
      : s.agent.chooseMove(s.board, cpu);
    place(s.board, move, cpu);
    if (checkEnd()) return;
    s.turn = other(s.turn);
    board.render(s.board);
    setStatus(turnMsg());
  }

  function checkEnd(): boolean {
    const w = winner(s.board);
    if (!w) return false;
    s.gameOver = true;
    board.render(s.board, w.line);
    if (s.mode === 'mlh') {
      const cpu = s.cpuSymbol();
      const reward = w.who === 'draw' ? 0 : w.who === cpu ? 1 : -1;
      s.agent.observeOutcome(reward as -1 | 0 | 1);
      s.stats.add(resultFor({ winner: w.who, line: w.line }, cpu));
      s.stats.snapshot(s.agent.games);
      refreshAll();
    }
    if (w.who === 'draw') setStatus(strings.status.draw);
    else setStatus(w.who === s.humanSymbol()
      ? strings.status.winHuman(w.who)
      : strings.status.winOther(w.who));
    return true;
  }

  // ---- training (mmml / mlml) ----
  function train(n: number): void {
    s.agent.exploring = true;   // bulk training explores (epsilon decays with games)
    s.agentO.exploring = true;
    const base = s.agent.games;
    for (let k = 0; k < n; k++) {
      const outcome = s.mode === 'mlml'
        ? playSelfPlay(s.agent, s.agentO)
        : playMinimaxVsMl(s.agent, s.minimax, base + k);
      s.stats.add(outcome);
      if ((base + k + 1) % 20 === 0) s.stats.snapshot(base + k + 1);
    }
    s.stats.snapshot(s.agent.games);
    refreshAll();
    setStatus(strings.status.trained(n, s.agent.games));
  }

  // ---- watch one game slowly: step the generator on a timer ----
  async function watch(): Promise<void> {
    if (s.busy) return;
    s.busy = true; s.board = empty(); s.gameOver = false; board.render(s.board);
    // watching shows the agent's best play, not exploratory noise
    s.agent.exploring = false;
    s.agentO.exploring = false;

    let gen: Generator<MoveEvent, MatchResult, void>;
    let perspective: Player;
    if (s.mode === 'mlml') {
      s.agent.startEpisode(); s.agentO.startEpisode();
      gen = runMatch(s.agent, s.agentO);
      perspective = 'X';
      setStatus(strings.status.selfPlayHeader);
    } else {
      const mlIsX = s.agent.games % 2 === 0;
      s.mlSymbol = mlIsX ? 'X' : 'O';
      const mm: Player = mlIsX ? 'O' : 'X';
      gen = mlIsX ? runMatch(s.agent, s.minimax) : runMatch(s.minimax, s.agent);
      perspective = s.mlSymbol;
      setStatus(strings.status.mlWatchHeader(s.mlSymbol, mm));
    }

    let step = gen.next();
    while (!step.done) {
      await sleep(420);
      s.board = step.value.board;
      const w = winner(s.board);
      board.render(s.board, w ? w.line : null);
      step = gen.next();
    }
    const result = step.value;
    board.render(s.board, result.line);
    const outcome = resultFor(result, perspective);
    s.stats.add(outcome);
    s.stats.snapshot(s.agent.games);
    if (s.mode === 'mlml') {
      setStatus(result.winner === 'draw' ? strings.status.selfPlayDraw
        : result.winner === 'X' ? strings.status.selfPlayWinX : strings.status.selfPlayWinO);
    } else {
      setStatus(result.winner === 'draw' ? strings.status.draw
        : strings.status.watchWin(result.winner, result.winner === perspective));
    }
    s.busy = false;
    refreshAll();
  }

  // ---- metric copy ----
  function updateMetricCopy(): void {
    els.metricNote.textContent = strings.metric.note[s.mode];
    els.metricExplain.innerHTML = strings.metric.explain[s.mode];
  }

  // ---- mode setup ----
  function setupMode(): void {
    els.boardTitle.textContent = strings.modeTitles[s.mode];
    els.boardDesc.textContent = strings.descriptions.board[s.mode];
    els.learnLine.classList.toggle('hidden', s.mode === 'mh'); // every mode but pure minimax learns
    els.starterToggle.classList.toggle('hidden', !s.isHumanMode());
    buildControls(els.controls, s.isHumanMode(), {
      train, watch, newGame, resetTraining,
    });
    newGame();
    updateMetricCopy();
  }

  function resetTraining(): void {
    s.resetTraining();
    els.exportPanel.open = false;
    refreshAll();
    newGame();
  }

  // ---- static wiring ----
  // The active button is derived from state, never stored in the markup, so
  // AppState (mode / humanStarts) stays the single source of truth.
  const modeButtons = document.querySelectorAll<HTMLButtonElement>('.modes button');
  const starterButtons = els.starterToggle.querySelectorAll<HTMLButtonElement>('button');

  function syncModeButtons(): void {
    modeButtons.forEach((b) => {
      const on = b.dataset.mode === s.mode;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', String(on));
    });
  }
  function syncStarterButtons(): void {
    starterButtons.forEach((b) => {
      const on = (b.dataset.start === 'human') === s.humanStarts;
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1; // roving tabindex: only the checked radio is tabbable
    });
  }

  modeButtons.forEach((b) => {
    b.addEventListener('click', () => {
      s.mode = b.dataset.mode as Mode;
      syncModeButtons();
      setupMode();
    });
  });
  starterButtons.forEach((b) => {
    b.addEventListener('click', () => {
      s.humanStarts = b.dataset.start === 'human';
      syncStarterButtons();
      newGame();
    });
  });
  els.starterToggle.addEventListener('keydown', (e) => {
    const keys = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    s.humanStarts = !s.humanStarts; // two options → any arrow flips
    syncStarterButtons();
    const checked = [...starterButtons].find((b) => b.tabIndex === 0);
    checked?.focus();
    newGame();
  });
  els.inspectorPanel.addEventListener('toggle', () => {
    if (els.inspectorPanel.open) renderInspector(els.inspector, s.store);
  });
  els.exportPanel.addEventListener('toggle', () => {
    if (els.exportPanel.open) els.exportBox.value = exportJson(s.store);
  });
  let copyTimer: number | undefined;
  els.btnCopy.addEventListener('click', async () => {
    const text = els.exportBox.value || exportJson(s.store);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fall back for non-secure contexts where the clipboard API is blocked
      els.exportBox.select();
      document.execCommand('copy');
      els.exportBox.setSelectionRange(0, 0);
      els.exportBox.blur();
    }
    const label = els.btnCopy.querySelector('.copylabel');
    if (label) label.textContent = strings.layout.actions.copied;
    els.btnCopy.classList.add('copied');
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => {
      if (label) label.textContent = strings.layout.actions.copy;
      els.btnCopy.classList.remove('copied');
    }, 1400);
  });

  // ---- init ----
  els.tagline.textContent = strings.tagline;
  els.learnDesc.textContent = strings.descriptions.learning;
  els.inspDesc.innerHTML = strings.descriptions.inspector;
  syncModeButtons();
  syncStarterButtons();
  setupMode();
  refreshAll();
}
