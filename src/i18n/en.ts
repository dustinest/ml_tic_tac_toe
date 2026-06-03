import type { Player } from '../game/types';

const sym = (s: Player) => `<span class="${s}">${s}</span>`;

export const strings = {
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

  agentMeta: (states: number, games: number) => `agent: ${states} states · ${games} games`,

  chart: {
    emptyHint: 'train to see the learning curve →',
    gamesLabel: (n: number) => `${n} games`,
  },
};
