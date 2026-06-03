# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server
npm test           # Vitest, run once (logic + orchestration)
npm run test:watch # Vitest in watch mode
npm run build      # type-check (tsc --noEmit) THEN bundle to single dist/index.html
npm run preview    # serve the built single-file app
```

Run a single test file or test:

```bash
npx vitest run src/ai/ml/canonical.test.ts
npx vitest run -t "name of the test"
```

Note: `npm run build` fails on any type error — `tsc --noEmit` runs before Vite. `tsconfig.json`
enables `strict`, `noUnusedLocals`, `noUnusedParameters`, and `noImplicitReturns`, so unused
imports/params break the build, not just lint.

## Architecture

See README.md for the full module tour. Key structural points that span files:

- **`Participant` interface (`src/ai/types.ts`) is the central seam.** Both minimax and the
  Q-learning agent implement `startEpisode / chooseMove / observeOutcome`. `runMatch` depends
  ONLY on this interface — it never knows which AI it's driving or whether one learns.

- **`runMatch` (`src/match/runMatch.ts`) is a pure generator.** X always starts; it yields a
  `MoveEvent` per move and returns a `MatchResult`. It contains no timing and no DOM. Callers
  choose how to consume it: `drainMatch` (instant training, in `match/training.ts`) drives it to
  completion; the UI's `watch()` (in `app/index.ts`) steps it on a `setTimeout` timer for animation.

- **Board is a bitboard** (`Board = number[]`, `[xMask, oMask]`). Bit `i` = cell `i`. Always use
  the helpers in `game/board.ts` (`empty`, `place`, `cellAt`) and `game/rules.ts` (`winner`,
  `other`) rather than touching the integers directly.

- **The ML agent canonicalizes state** (`ai/ml/canonical.ts`): color-blind remap (me→1, opp→2)
  plus the lexicographically smallest of 8 board symmetries, so symmetric positions share one
  Q-table entry. `chooseMove` must map the chosen canonical move back through the permutation.

- **`exploring` flag controls epsilon-greedy.** `app/index.ts` sets `agent.exploring = true`
  during bulk training and `false` when playing/watching a human (best move, no random noise).
  When editing training or play flows, preserve this toggle.

- **Self-play shares one `QStore`.** In `mlml` mode both agents read/write the same store, so
  both sides' experience accumulates into a single Q-table.

- **`app/index.ts` is the composition root** and the only file that touches the DOM directly
  (via `view/` adapters). Modes: `mh` (minimax vs human), `mlh` (ML vs human, learns),
  `mmml` (minimax vs ML, learns), `mlml` (ML self-play). It wires modes → match runner → views.

- **All user-facing strings live in `i18n/en.ts`.** Add copy there, not inline in views or app.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml` → builds and publishes the single-file
app to GitHub Pages. `vite.config.ts` `base` must stay `/ml_tic_tac_toe/` (the repo name) for the
project-site URL to resolve.
