import type { Player } from '../game/types';

const sym = (s: Player) => `<span class="${s}">${s}</span>`;

export const strings = {
  // Static chrome rendered by view/layout.ts. Kept here so every user-facing
  // string lives in one place (see CLAUDE.md).
  layout: {
    title: 'tic-tac-toe // a perfect solver vs. a machine that learns',
    agentMetaSeed: 'agent: 0 states · 0 games',
    modeButtons: [
      { mode: 'mlh', n: '1', label: 'ML vs human · learns' },
      { mode: 'mlml', n: '2', label: 'ML vs ML · learns' },
      { mode: 'mmml', n: '3', label: 'minimax vs ML · learns' },
      { mode: 'mh', n: '4', label: 'minimax vs human' },
    ],
    kickers: { play: 'Play', result: 'Result', memory: 'Memory' },
    panelTitles: {
      board: 'Game',
      learning: 'Learning curve',
      memory: 'What the agent has learned',
    },
    starter: { human: 'You start', cpu: 'Computer starts' },
    stats: { wins: 'Wins', draws: 'Draws', losses: 'Losses' },
    meta: { games: 'Training games', states: 'States learned', coverage: 'Q-coverage' },
    legend: { loss: 'loss %', draw: 'draw %', win: 'win %', window: 'window: last 100 games' },
    actions: { inspect: 'Show states', export: 'Export JSON' },
    // The no-JavaScript fallback necessarily lives as static markup in
    // index.html (JS can't render the page that exists when JS is off).
  },

  modeTitles: {
    mh: 'minimax vs human',
    mlh: 'ML vs human',
    mmml: 'minimax vs ML',
    mlml: 'ML vs ML',
  } as Record<string, string>,

  controls: {
    train100: 'Train 100',
    train1000: 'Train 1000',
    watchOne: 'Play 1 (watch)',
    newGame: 'New game',
    resetTraining: 'Reset training',
  },

  status: {
    trainPrompt: 'Press «Train» or «Play 1 (watch)».',
    yourTurn: (s: Player) => `Your move (${sym(s)})`,
    cpuThinking: (s: Player) => `Computer thinking… (${sym(s)})`,
    draw: 'Draw.',
    winHuman: (s: Player) => `${sym(s)} won — you!`,
    winOther: (s: Player) => `${sym(s)} won.`,
    mlWatchHeader: (ml: Player, mm: Player) => `ML is ${sym(ml)}, minimax is ${sym(mm)}`,
    selfPlayHeader: `ML (${sym('X')}) vs ML (${sym('O')}) — same brain, both learning`,
    watchWin: (who: Player, isMl: boolean) => `${sym(who)} won (${isMl ? 'ML' : 'minimax'}).`,
    selfPlayDraw: 'Draw — both played well.',
    selfPlayWinX: `${sym('X')} won.`,
    selfPlayWinO: `${sym('O')} won.`,
    trained: (n: number, total: number) => `Trained ${n} games. Total ${total}.`,
  },

  inspector: {
    empty: 'Table is empty. Train first.',
    show: 'Show states',
    hide: 'Hide states',
    capped: (cap: number, total: number) =>
      `Showing ${cap} most-visited states of ${total}. Full table: «Export JSON».`,
  },

  metric: {
    note: {
      mmml: '(ML perspective, last 100)',
      mlml: '(X perspective, last 100)',
      mlh: '(ML perspective)',
      mh: '',
    } as Record<string, string>,
    explain: {
      mmml:
        'Minimax plays perfectly, so the ML\'s best possible result is a ' +
        '<b style="color:var(--draw)">draw</b>. The sign of learning is the ' +
        '<b style="color:var(--loss)">loss %</b> falling to zero — the agent learns not to lose. ' +
        'No wins come from here, and that is correct.',
      mlml:
        'Both sides are the <b>same Q-table</b> learning against each other (self-play). ' +
        'The sign of learning is the <b style="color:var(--draw)">draw %</b> rising — as both get good, ' +
        'tic-tac-toe converges to a draw. Wins (X) and losses (O) should both shrink. ' +
        'Same principle as AlphaZero, just with a tiny table.',
      mlh:
        'The ML learns from your games, but learning at human pace is slow and noisy. ' +
        'For fast training use mode <b>3</b>. Here you mostly see whether what it learned transfers.',
      mh: 'Pure minimax, no learning. Try to win — you can\'t. The best you can get is a draw.',
    } as Record<string, string>,
  },

  tagline: 'a perfect solver vs. a machine that learns from scratch',

  descriptions: {
    board: {
      mh:
        'You against minimax — a solver that looks ahead through every possible ' +
        'continuation and never errs. It cannot be beaten. The best you can force is a draw.',
      mlh:
        'You against the Q-learning agent. Each finished game becomes training data: ' +
        'it shifts its value estimates toward the moves that worked. Teaching by hand is ' +
        'slow, though — for real progress, train it in mode 3.',
      mmml:
        'Train the agent against a perfect minimax opponent. «Train» runs hundreds of ' +
        'games instantly and feeds every result back into the table; «Play 1» steps through ' +
        'a single game so you can watch what it has learned.',
      mlml:
        'The agent plays itself — one shared brain on both sides of the board. «Train» piles ' +
        'up self-play experience fast; «Play 1» shows a single game at human speed.',
    } as Record<string, string>,
    learning:
      'After every game the win / draw / loss share over the last 100 games is plotted here. ' +
      'The line is the whole point: it tells you whether the agent is genuinely getting better, ' +
      'or just churning. Read the note under the chart for what «better» means in this mode.',
    inspector:
      'Each tile is one board position the agent has actually seen, drawn from its own ' +
      'point of view: <span style="color:var(--me)">■ its mark</span>, ' +
      '<span style="color:var(--opp)">■ the opponent</span>. Empty squares show the learned ' +
      '<b>Q-value</b> — its estimate of how good moving there is. A ' +
      '<span style="color:var(--win)">green outline</span> marks the move it currently prefers. ' +
      'Tiles are sorted by how often the position has come up.',
  },

  agentMeta: (states: number, games: number) => `agent: ${states} states · ${games} games`,

  chart: {
    emptyHint: 'train to see the learning curve →',
    gamesLabel: (n: number) => `${n} games`,
  },
};
