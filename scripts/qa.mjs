// Quality gates for ok's change flow: axe-core accessibility (WCAG 2.x A/AA) plus basic page checks
// on every built page in dist/. Prints one JSON line and exits non-zero on failure.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';
import axe from 'axe-core';

const dist = process.argv[2] || 'dist';
const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.html')) pages.push(p);
  }
})(dist);

const results = [];
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom;
  const doc = window.document;
  const problems = [];
  if (!doc.documentElement.getAttribute('lang')) problems.push('html has no lang');
  if (!doc.title.trim()) problems.push('missing <title>');
  if (!doc.querySelector('meta[name="description"]')?.getAttribute('content')) problems.push('missing meta description');
  if (doc.querySelectorAll('h1').length !== 1) problems.push(`expected one h1, found ${doc.querySelectorAll('h1').length}`);
  window.eval(axe.source);
  // Colour contrast needs layout/canvas, which jsdom doesn't have: checked by Lighthouse/axe in a browser instead.
  const axeRes = await window.axe.run(doc, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] }, rules: { 'color-contrast': { enabled: false } } });
  for (const v of axeRes.violations) problems.push(`axe ${v.id} (${v.impact}): ${v.nodes.length} node(s)`);
  results.push({ page: file.slice(dist.length) || '/', problems });
  window.close();
}
const failed = results.filter((r) => r.problems.length);
console.log(JSON.stringify({ ok: failed.length === 0, pages: results.length, failed }));
process.exit(failed.length ? 1 : 0);
