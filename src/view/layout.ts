import { strings } from '../i18n';

const L = strings.layout;

/** GitHub / LinkedIn glyphs — kept here next to the only markup that uses them. */
const GITHUB_ICON =
  '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" fill="currentColor">' +
  '<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>';
const LINKEDIN_ICON =
  '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" fill="currentColor">' +
  '<path d="M13.63 0H2.37A2.34 2.34 0 0 0 0 2.31v11.38A2.34 2.34 0 0 0 2.37 16h11.26A2.34 2.34 0 0 0 16 13.69V2.31A2.34 2.34 0 0 0 13.63 0ZM4.86 13.12H2.9V6.37h1.96v6.75ZM3.88 5.5a1.14 1.14 0 1 1 0-2.28 1.14 1.14 0 0 1 0 2.28Zm9.24 7.62h-1.96V9.7c0-.83-.02-1.9-1.16-1.9-1.16 0-1.34.9-1.34 1.84v3.48H6.7V6.37h1.88v.92h.03c.26-.5.9-1.02 1.85-1.02 1.98 0 2.35 1.3 2.35 3v3.85Z"/></svg>';

/** Geometric actor glyphs (human / minimax tree / ML learning-curve), defined
 *  once and referenced by <use>. They inherit the button's text color. */
const ICON_DEFS =
  '<svg width="0" height="0" class="icon-defs" aria-hidden="true"><defs>' +
  '<g id="i-human" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
  '<circle cx="8" cy="5.2" r="2.8"/><path d="M2.7 13.7c0-3 2.4-4.8 5.3-4.8s5.3 1.8 5.3 4.8"/></g>' +
  '<g id="i-minimax"><g stroke="currentColor" stroke-width="1.7" fill="none"><path d="M8 4.2 4.6 9.6M8 4.2 11.4 9.6"/></g>' +
  '<g fill="currentColor"><circle cx="8" cy="3.6" r="2"/><circle cx="4.4" cy="10.6" r="2"/><circle cx="11.6" cy="10.6" r="2"/></g></g>' +
  '<g id="i-ml" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M2.4 13 6 9.2 8.6 10.9 13.4 4"/><path d="M10.3 4 13.6 4 13.6 7.3"/></g>' +
  // graduation cap — marks a mode that trains (the ML "learns")
  '<g id="i-learns" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M8 3 14.5 5.6 8 8.2 1.5 5.6 Z"/><path d="M4.6 6.9v3c0 1.1 1.5 1.9 3.4 1.9s3.4-.8 3.4-1.9v-3"/>' +
  '<path d="M14.5 5.6v3.4"/></g>' +
  '</defs></svg>';

const icon = (kind: string) =>
  `<span class="ico"><svg viewBox="0 0 16 16" aria-hidden="true"><use href="#i-${kind}"/></svg></span>`;

const modeButtons = L.modeButtons
  .map((b) => {
    const aria = `${L.actors[b.a]} vs ${L.actors[b.b]}${b.learns ? `, ${L.learnsTag}` : ''}`;
    return `<button data-mode="${b.mode}" aria-label="${aria}">` +
      `<span class="matchup">${icon(b.a)}<span class="vs">/</span>${icon(b.b)}</span></button>`;
  })
  .join('\n    ');


/**
 * Build the entire app markup from i18n copy and inject it into `root`.
 * Element ids/classes match what app/index.ts and the view adapters expect,
 * so wiring is unchanged — this just moves the static chrome out of index.html
 * and keeps every string in one place.
 */
export function renderLayout(root: HTMLElement): void {
  root.innerHTML = `
  ${ICON_DEFS}
  <header>
    <div class="masthead">
      <div class="flag" aria-hidden="true"><i class="b-x"></i><i class="b-o"></i><i class="b-a"></i></div>
      <div>
        <h1>TIC<span class="dot">·</span><span class="x">TAC</span><span class="dot">·</span>TOE</h1>
        <div class="sub" id="tagline"></div>
      </div>
    </div>
    <div class="meterchip"><span class="sub" id="agentmeta">${L.agentMetaSeed}</span></div>
  </header>

  <div class="grid">
    <div class="playcol">
      <div class="modes" role="tablist">
        ${modeButtons}
      </div>
      <div class="panel panel--board">
      <div class="phead">
        <span class="kicker"><b>01</b> ${L.kickers.play}</span>
        <h2 id="boardtitle">${L.panelTitles.board}</h2>
      </div>
      <div class="panel-desc">
        <span class="learnline hidden" id="learnline">${icon('learns')}<span>${L.learnLine}</span></span>
        <span id="boarddesc"></span>
      </div>
      <div class="toggle hidden" id="startertoggle">
        <button data-start="human">${L.starter.human}</button>
        <button data-start="cpu">${L.starter.cpu}</button>
      </div>
      <div class="board" id="board"></div>
      <div class="status" id="status"></div>
      <div class="btnrow" id="controls"></div>
      </div>
    </div>

    <div class="rail">
      <div class="panel">
        <div class="phead">
          <span class="kicker"><b>02</b> ${L.kickers.result}</span>
          <h2>${L.panelTitles.learning} <span class="sub" id="metricnote"></span></h2>
        </div>
        <p class="panel-desc" id="learndesc"></p>
        <div class="stats">
          <div class="stat win"><div class="v" id="sWin">0%</div><div class="l">${L.stats.wins}</div></div>
          <div class="stat draw"><div class="v" id="sDraw">0%</div><div class="l">${L.stats.draws}</div></div>
          <div class="stat loss"><div class="v" id="sLoss">0%</div><div class="l">${L.stats.losses}</div></div>
        </div>
        <div class="meta">
          <span>${L.meta.games} <b id="mGames">0</b></span>
          <span>${L.meta.states} <b id="mStates">0</b></span>
          <span>${L.meta.coverage} <b id="mFill">0</b></span>
        </div>
        <div class="chartwrap"><canvas id="chart" width="640" height="220"></canvas></div>
        <div class="legend">
          <span><i style="background:var(--loss)"></i>${L.legend.loss}</span>
          <span><i style="background:var(--draw)"></i>${L.legend.draw}</span>
          <span><i style="background:var(--win)"></i>${L.legend.win}</span>
          <span class="legend-dim">${L.legend.window}</span>
        </div>
        <div class="note" id="metricexplain"></div>
      </div>

      <div class="panel">
        <div class="phead">
          <span class="kicker"><b>03</b> ${L.kickers.memory}</span>
          <h2>${L.panelTitles.memory}</h2>
          <span class="headacts">
            <button class="act" id="btnInspect">${L.actions.inspect}</button>
            <button class="act" id="btnExport">${L.actions.export}</button>
          </span>
        </div>
        <p class="panel-desc" id="inspdesc"></p>
        <div class="insp hidden" id="inspector"></div>
        <textarea id="exportbox" readonly></textarea>
      </div>
    </div>
  </div>

  <footer class="colophon">
    <div class="colo-links">
      <a class="flink" href="https://github.com/dustinest/ml_tic_tac_toe" target="_blank" rel="noopener noreferrer">${GITHUB_ICON} GitHub</a>
      <a class="flink" href="https://www.linkedin.com/in/trapetsijuur/" target="_blank" rel="noopener noreferrer">${LINKEDIN_ICON} LinkedIn</a>
    </div>
  </footer>`;
}
