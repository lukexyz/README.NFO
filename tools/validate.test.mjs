import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { checkCatalogue, closesFence, localReferences, localTarget, svgPolicyIssues } from './lib/checks.mjs';

const style = (id, duplicate_of) => ({ id, name: id, ...(duplicate_of ? { duplicate_of } : {}) });
const catalogue = (styles) => ({ families: [{ key: 'c64', styles }] });

test('fence endings allow three spaces and longer markers, but not shorter or labelled markers', () => {
  assert.equal(closesFence('   ```', '```'), true);
  assert.equal(closesFence('~~~~~', '~~~~'), true);
  for (const line of ['    ```', '```html', '~~', '~~~~']) assert.equal(closesFence(line, '```'), false);
  assert.equal(closesFence('```', '````'), false);
});

test('catalogue IDs allow digits in the family; duplicates do not count as distinct styles', () => {
  const result = checkCatalogue(catalogue([style('c64-01'), style('c64-02', 'c64-01')]));
  assert.deepEqual(result.errors, []);
  assert.equal(result.distinct.length, 1);
});

test('catalogue rejects collisions, missing duplicate targets and duplicate cycles', () => {
  assert.match(checkCatalogue(catalogue([style('c64-01'), style('c64-01')])).errors.join(), /Duplicate style ID/);
  assert.match(checkCatalogue(catalogue([style('c64-01', 'c64-99')])).errors.join(), /unknown duplicate target/);
  assert.match(checkCatalogue(catalogue([style('c64-01', 'c64-02'), style('c64-02', 'c64-01')])).errors.join(), /duplicate cycle/);
  assert.match(checkCatalogue(catalogue([style('pc-01')])).errors.join(), /Invalid style/);
});

test('image references ignore copy examples, inline code, comments and remote URLs', () => {
  const markdown = [
    '![banner](assets/banner.svg)',
    '<img src=\'assets/badge.svg\'>',
    '<img srcset="assets/small.svg 1x, assets/large.svg 2x">',
    '![wide](<assets/a banner.svg>)',
    '![remote](https://example.com/banner.svg)',
    '<img src="data:image/svg+xml;base64,ABC">',
    '```html', '<img src="copy-this-example.svg">', '```',
    '~~~~html', '<img src="another-example.svg">', '~~~~~',
    '`<img src="inline-example.svg">`',
    '<!-- <img src="comment.svg"> -->',
    '[instructions](README.md)',
  ].join('\n');
  assert.deepEqual(localReferences(markdown, true), [
    'assets/banner.svg', 'assets/a banner.svg', 'assets/badge.svg', 'assets/small.svg', 'assets/large.svg',
  ]);
  assert.ok(localReferences(markdown).includes('README.md'));
});

test('local targets decode spaces and fragments, and reject traversal beyond the repository', () => {
  const root = path.resolve('fixture');
  assert.equal(localTarget(root, 'examples/README.md', '../docs/my%20banner.svg#title'), path.join(root, 'docs/my banner.svg'));
  assert.throws(() => localTarget(root, 'README.md', '../outside.svg'), /escapes/);
  assert.throws(() => localTarget(root, 'README.md', '%2e%2e/outside.svg'), /escapes/);
});

test('SVG policy allows internal resources and embedded data', () => {
  const source = '<svg viewBox="0 0 100 50"><style>.a{fill:url(#paint)}.b{fill:url("#paint")}@font-face{src:url("data:font/woff;base64,ABC")}</style><use href="#glyph"/><image href="data:image/png;base64,ABC"/></svg>';
  assert.deepEqual(svgPolicyIssues(source), []);
  assert.deepEqual(svgPolicyIssues('<svg viewBox="0 0 100 50"><desc>Escaped HTML: &lt;img onerror=example()&gt;</desc></svg>'), []);
});

test('SVG policy reports blocked content, remote resources, bad dimensions and motion without a fallback', () => {
  const source = '<svg viewBox="0 0 NaN 0" onload="run()"><script>run()</script><foreignObject/><image href="https://example.com/a.png"/><style>@import "font.css"; @keyframes spin{}</style></svg>';
  const issues = svgPolicyIssues(source).join('\n');
  for (const expected of ['scripts', 'event handlers', 'external image', 'external CSS', 'viewBox', 'prefers-reduced-motion']) assert.ok(issues.includes(expected));
  assert.deepEqual(svgPolicyIssues('<svg viewBox="0 0 10 10"><style>@keyframes fade{} @media(prefers-reduced-motion:reduce){*{animation:none}}</style></svg>'), []);
  assert.match(svgPolicyIssues('<svg viewBox="0 0 10 10" aria-label="a > b" onload="run()"/>').join(), /event handlers/);
});
