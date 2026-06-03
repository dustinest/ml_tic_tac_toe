import { winner, other } from '../game/rules';
import { empty, place, cellAt } from '../game/board';
import type { Move, Player } from '../game/types';
import { runMatch } from '../match/runMatch';
import type { MatchResult, MoveEvent } from '../match/types';
import { playMinimaxVsMl, playSelfPlay, resultFor } from '../match/training';
import { strings } from '../i18n';
import { AppState, type Mode } from './state';
import {
  BoardView, renderStats, drawChart, renderInspector, exportJson, buildControls,
} from '../view';

const $ = (id: string) => document.getElementById(id) as HTMLElement;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function startApp(): void {
  const s = new AppState();

  const els = {
    board: $('board'), status: $('status'), controls: $('controls'),
    boardTitle: $('boardtitle'), starterToggle: $('startertoggle'),
    metricNote: $('metricnote'), metricExplain: $('metricexplain'),
    inspector: $('inspector'), exportBox: $('exportbox') as unknown as HTMLTextAreaElement,
    chart: $('chart') as unknown as HTMLCanvasElement,
    sWin: $('sWin'), sDraw: $('sDraw'), sLoss: $('sLoss'),
    mGames: $('mGames'), mStates: $('mStates'), mFill: $('mFill'),
    agentMeta: $('agentmeta'),
    btnInspect: $('btnInspect'), btnExport: $('btnExport'),
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
    if (!els.inspector.classList.contains('hidden')) renderInspector(els.inspector, s.store);
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
    els.starterToggle.classList.toggle('hidden', !s.isHumanMode());
    buildControls(els.controls, s.isHumanMode(), {
      train, watch, newGame, resetTraining,
    });
    newGame();
    updateMetricCopy();
  }

  function resetTraining(): void {
    s.resetTraining();
    els.exportBox.style.display = 'none';
    refreshAll();
    newGame();
  }

  // ---- static wiring ----
  document.querySelectorAll<HTMLButtonElement>('.modes button').forEach((b) => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.modes button').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      s.mode = b.dataset.mode as Mode;
      setupMode();
    });
  });
  els.starterToggle.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
    b.addEventListener('click', () => {
      els.starterToggle.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      s.humanStarts = b.dataset.start === 'human';
      newGame();
    });
  });
  els.btnInspect.onclick = () => {
    els.inspector.classList.toggle('hidden');
    const hidden = els.inspector.classList.contains('hidden');
    els.btnInspect.textContent = hidden ? strings.inspector.show : strings.inspector.hide;
    if (!hidden) renderInspector(els.inspector, s.store);
  };
  els.btnExport.onclick = () => {
    if (els.exportBox.style.display === 'block') { els.exportBox.style.display = 'none'; return; }
    els.exportBox.value = exportJson(s.store);
    els.exportBox.style.display = 'block';
  };

  // ---- init ----
  setupMode();
  refreshAll();
}
