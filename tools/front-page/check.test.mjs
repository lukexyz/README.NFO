import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkCommand, checkReadme, commandsIn, countClaims, denyHits } from './check.mjs';
import { relink } from './lib/relink.mjs';

const caps = { commands: ['(default)', 'more', 'use'], agents: { flags: ['--claude', '--codex'] }, project: { urlMode: 'github.com' } };
const helpFlags = new Set(['--model', '--jobs', '-N']);

test('commands: subcommands and flags must be ones the CLI reports', () => {
  const shown = commandsIn('Run `npx readme-nfo use 3`, then `npx readme-nfo more --jobs 4`.\n<!-- npx readme-nfo hidden -->\n```text\nnpx readme-nfo frobnicate --turbo -6\n```');
  assert.deepEqual(shown.map((c) => c.args), [['use', '3'], ['more', '--jobs', '4'], ['frobnicate', '--turbo', '-6']]);
  assert.deepEqual(shown.slice(0, 2).flatMap((c) => checkCommand(c, caps, helpFlags)), []);
  assert.deepEqual(checkCommand(shown[2], caps, helpFlags), ['npx readme-nfo frobnicate --turbo -6: unknown command "frobnicate"', 'npx readme-nfo frobnicate --turbo -6: unknown flag --turbo']);
  assert.deepEqual(checkCommand({ text: 'x', args: ['github.com/you/project'] }, caps, helpFlags), []);
});

test('counts: totals, dotted score lines and per-gallery rows are claims; text on other lines is not joined', () => {
  const claims = countClaims('153 styles, 10 new styles\nTOTAL   260   HEADERS\nSTYLES  153/153 CLEAR\nFAMILIES ..... 13\n1ST   116   CASTAWAY\n3RD   041   README.NFO');
  assert.deepEqual(claims.map((c) => `${c.kind}:${c.gallery ?? ''}${c.value}`), [
    'styles:153', 'styles:10', 'headers:260', 'families:13', 'styles:153', 'styles:153', 'gallery:castaway116', 'gallery:readme-nfo41',
  ]);
});

test('deny list: scene phrasing, piracy words and real group names; ordinary words pass', () => {
  assert.equal(denyHits('ACME PRESENTS', 'x').length, 1);
  assert.equal(denyHits('cracked by nobody, supplied by someone', 'x').length, 3);
  assert.equal(denyHits('in the style of Fairlight', 'x').length, 1);
  assert.deepEqual(denyHits('Retro headers drawn by Claude Code or Codex. The data reloaded nightly.', 'x'), []);
});

test('relink: root-relative links resolve from a design folder; code blocks and remote links stay', () => {
  const root = path.resolve('repo');
  const md = '<img src="docs/a/assets/x.svg" srcset="docs/a/assets/y.svg 2x">\n[g](examples/README.md#top) [r](https://x.y) [h](#here)\n`src="keep.svg"`\n```html\n<img src=".github/readme-nfo/header.svg">\n```';
  assert.equal(relink(md, path.join(root, 'docs', 'a'), root),
    '<img src="assets/x.svg" srcset="assets/y.svg 2x">\n[g](../../examples/README.md#top) [r](https://x.y) [h](#here)\n`src="keep.svg"`\n```html\n<img src=".github/readme-nfo/header.svg">\n```');
  assert.equal(relink(md, root, root), md);
});

test('the root README passes the front-page check', async () => {
  const result = await checkReadme();
  const failures = Object.entries(result.sections).filter(([, s]) => !s.ok).map(([name, s]) => `${name}: ${s.problems.join('; ')}`);
  assert.deepEqual(failures, []);
});

test('the front-page check fails on a missing image and an over-wide code block', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'readme-nfo-front-page-'));
  try {
    const file = path.join(dir, 'README.md');
    fs.writeFileSync(file, `![x](nope.svg)\n\n\`\`\`text\n${'x'.repeat(81)}\n\`\`\`\n`);
    const { ok, sections } = await checkReadme(file);
    assert.equal(ok, false);
    assert.match(sections.links.problems.join(), /missing image: nope\.svg/);
    assert.match(sections.code.problems.join(), /81 columns/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
