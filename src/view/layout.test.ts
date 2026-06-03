// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderLayout } from './layout';

/** Render the chrome into a detached element and return it for querying. */
function render(): HTMLElement {
  const root = document.createElement('div');
  renderLayout(root);
  return root;
}

describe('renderLayout semantic structure', () => {
  it('renders a single page header and footer', () => {
    const root = render();
    expect(root.querySelectorAll('header.masthead, header > .masthead').length).toBeGreaterThan(0);
    expect(root.querySelector('footer')).not.toBeNull();
  });

  it('wraps the play column in <main> and the rail in <aside>', () => {
    const root = render();
    const main = root.querySelector('main.playcol');
    const aside = root.querySelector('aside.rail');
    expect(main).not.toBeNull();
    expect(aside).not.toBeNull();
    // board lives in main; stats/memory live in aside
    expect(main!.querySelector('#board')).not.toBeNull();
    expect(aside!.querySelector('#chart')).not.toBeNull();
  });

  it('renders each panel as a <section> with an <h2> and a <header> phead', () => {
    const root = render();
    const sections = root.querySelectorAll('section.panel');
    expect(sections.length).toBe(3);
    sections.forEach((s) => {
      expect(s.querySelector('h2')).not.toBeNull();
      expect(s.querySelector('header.phead')).not.toBeNull();
    });
  });

  it('renders stats and meta as <ul>/<li> with .percent/.label spans and kept ids', () => {
    const root = render();
    const stats = root.querySelector('ul.stats');
    expect(stats).not.toBeNull();
    expect(stats!.querySelectorAll('li.stat').length).toBe(3);
    const win = stats!.querySelector('li.stat.win');
    expect(win!.querySelector('span.percent#sWin')).not.toBeNull();
    expect(win!.querySelector('span.label')).not.toBeNull();
    // no form-only <label> misused for readout text
    expect(stats!.querySelector('label')).toBeNull();

    const meta = root.querySelector('ul.meta');
    expect(meta).not.toBeNull();
    expect(meta!.querySelector('span.value#mGames')).not.toBeNull();
    expect(meta!.querySelector('#mStates')).not.toBeNull();
    expect(meta!.querySelector('#mFill')).not.toBeNull();
  });

  it('wraps the chart canvas in <figure> with a <figcaption> legend <ul>', () => {
    const root = render();
    const fig = root.querySelector('figure.chartwrap');
    expect(fig).not.toBeNull();
    expect(fig!.querySelector('canvas#chart')).not.toBeNull();
    const cap = fig!.querySelector('figcaption.legend');
    expect(cap).not.toBeNull();
    expect(cap!.querySelectorAll('ul > li').length).toBeGreaterThanOrEqual(3);
  });

  it('uses <output> for status and role=toolbar for controls', () => {
    const root = render();
    const status = root.querySelector('#status');
    expect(status!.tagName).toBe('OUTPUT');
    const controls = root.querySelector('#controls');
    expect(controls!.getAttribute('role')).toBe('toolbar');
  });

  it('marks mode buttons as role=tab and the board panel as role=tabpanel', () => {
    const root = render();
    const tabs = root.querySelectorAll('.modes button[role="tab"]');
    expect(tabs.length).toBe(root.querySelectorAll('.modes button').length);
    tabs.forEach((t) => expect(t.getAttribute('aria-selected')).toBe('false'));
    expect(root.querySelector('.panel--board[role="tabpanel"]')).not.toBeNull();
  });

  it('renders the starter toggle as a radiogroup fieldset with radio buttons', () => {
    const root = render();
    const fs = root.querySelector('fieldset#startertoggle');
    expect(fs).not.toBeNull();
    expect(fs!.getAttribute('role')).toBe('radiogroup');
    expect(fs!.querySelector('legend')).not.toBeNull();
    const radios = fs!.querySelectorAll('button[role="radio"]');
    expect(radios.length).toBe(2);
    radios.forEach((r) => expect(r.getAttribute('aria-checked')).toBe('false'));
  });

  it('renders a copy-to-clipboard button with an icon inside the export disclosure', () => {
    const root = render();
    const exp = root.querySelector('details#exportpanel');
    const btn = exp!.querySelector('button#btnCopy');
    expect(btn).not.toBeNull();
    expect(btn!.getAttribute('type')).toBe('button');
    // carries the copy glyph
    expect(btn!.querySelector('svg use[href="#i-copy"]')).not.toBeNull();
    // and its row sits before the textarea it copies
    expect(exp!.querySelector('.copyrow ~ textarea#exportbox')).not.toBeNull();
  });

  it('renders inspector and export as <details>/<summary> disclosures', () => {
    const root = render();
    const insp = root.querySelector('details#inspectorpanel');
    const exp = root.querySelector('details#exportpanel');
    expect(insp).not.toBeNull();
    expect(exp).not.toBeNull();
    // both disclosures closed by default
    expect((insp as HTMLDetailsElement).open).toBe(false);
    expect((exp as HTMLDetailsElement).open).toBe(false);
    expect(insp!.querySelector('summary')).not.toBeNull();
    expect(insp!.querySelector('#inspector')).not.toBeNull();
    expect(exp!.querySelector('summary')).not.toBeNull();
    expect(exp!.querySelector('textarea#exportbox')).not.toBeNull();
    // the old standalone action buttons are gone
    expect(root.querySelector('#btnInspect')).toBeNull();
    expect(root.querySelector('#btnExport')).toBeNull();
  });
});
