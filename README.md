# tic-tac-toe — AI algorithm vs machine learning

A hands-on demo of **two fundamentally different ways to make a computer play a
game**, shown side by side:

- **A classic AI algorithm — minimax.** Hand-coded, searches every possible
  continuation, and plays perfectly from move one. It never learns because it
  was never wrong; the knowledge lives in the algorithm.
- **A machine-learning agent — tabular Q-learning.** Starts knowing nothing and
  gets better only by playing: it remembers which moves led to wins and losses
  and updates its own value estimates. The knowledge is *learned* from experience.

Tic-tac-toe is just the playground small enough to **watch the difference** —
train the learner, race it against perfect play, and inspect exactly what it
figured out. Four modes:

1. **minimax vs human** — pure minimax, no learning.
2. **ML vs human · learns** — the agent learns from your games.
3. **minimax vs ML · learns** — fast training against perfect play; sides alternate.
4. **ML vs ML · self-play** — two agents share one Q-table and learn against each other.

Each training mode supports "Train N games" (instant) and "Play 1 (watch)"
(animated). A learning-curve chart and a Q-table inspector (with JSON export)
show what the agent has learned.

## Architecture

Modular, interface-driven TypeScript:

- `game/` — pure rules on a **bitboard** representation: the board is one integer
  per player (`[xMask, oMask]`, bit `i` = cell `i`); winning lines are precomputed
  bitmasks. Generalizes to more players / larger boards.
- `ai/` — both AIs implement a shared `Participant` interface:
  - `ai/minimax/` — memoized, depth-aware perfect play.
  - `ai/ml/` — tabular Q-learning (TD(0)) over a symmetry-canonicalized state, with
    a swappable `QStore` (one shared store powers self-play).
- `match/` — a generator-based match runner (timing lives outside it) plus training
  and self-play helpers.
- `stats/` — sliding-window (last 100) win/draw/loss rates and the chart series.
- `i18n/` — all user-facing strings in one place.
- `view/` — thin DOM adapters (board, stats, chart, inspector, controls).
- `app/` — composition root wiring modes → match runner → views.

## Develop

    npm install
    npm run dev        # Vite dev server
    npm test           # Vitest (logic + orchestration; 46 tests)
    npm run build      # single-file dist/index.html
    npm run preview    # serve the built file
