// `use N`: copy header N to .github/readme-nfo/, add README.NFO's MIT notice, and put one marked
// block at the top of the root README. Never commits. Re-runs replace the block in place.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { escapeXml } from './svg.mjs';
import { altText, pad } from './hybrid-output.mjs';
import { readState, excludeFromGit } from './batch.mjs';
import { imageIssues } from './author.mjs';
import { findReadme } from './project.mjs';

export const START = '<!-- README.NFO header: start -->';
export const END = '<!-- README.NFO header: end -->';
export const INSTALL_DIR = '.github/readme-nfo';
const LICENSE_TEXT = () => fs.readFileSync(new URL('../../LICENSE', import.meta.url), 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');

function refuseSymlink(file) {
  try { if (fs.lstatSync(file).isSymbolicLink()) throw new Error(`${file} is a symlink. README.NFO does not write through symlinks.`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}

export function headerBlock({ src, alt, eol = '\n' }) {
  return [START, `<p align="center"><img src="${escapeXml(src)}" width="100%" alt="${escapeXml(alt)}"></p>`, END].join(eol);
}

// Insert at the very top, or replace an existing marked block. Keeps BOM and line endings.
export function patchReadme(text, block) {
  const bom = text.startsWith('﻿') ? '﻿' : '';
  let body = bom ? text.slice(1) : text;
  const eol = /\r\n/.test(body) ? '\r\n' : '\n';
  const fixed = block.replace(/\r?\n/g, eol);
  const start = body.indexOf(START), end = body.indexOf(END, start + 1);
  if (start >= 0 && end > start) {
    body = body.slice(0, start) + fixed + body.slice(end + END.length);
    return { text: bom + body, replaced: true };
  }
  if (start >= 0 || body.includes(END)) throw new Error('The README has a broken README.NFO marker. Remove the stray marker line and run again.');
  return { text: bom + fixed + eol + (body.length ? eol + body.replace(/^(?:\r?\n)+/, '') : ''), replaced: false };
}

// Write a file only if it is missing or is one README.NFO wrote (matched by content).
function writeOwned(file, contents, isOurs) {
  refuseSymlink(file);
  if (fs.existsSync(file)) {
    const current = fs.readFileSync(file, 'utf8');
    if (current === contents) return 'unchanged';
    if (!isOurs(current)) throw new Error(`${file} already exists and was not written by README.NFO. Move it, then run again.`);
    fs.writeFileSync(file, contents);
    return 'replaced';
  }
  fs.writeFileSync(file, contents);
  return 'created';
}

export function installHeader({ number, directory, root, project }) {
  const state = readState(directory);
  if (!state) throw new Error(`No gallery in ${directory}. Run npx readme-nfo first.`);
  const header = state.headers.find(item => item.number === number);
  if (!header) {
    const ready = state.headers.filter(item => item.status === 'ok').map(item => item.number);
    throw new Error(`There is no header ${pad(number)}. Ready: ${ready.length ? ready.map(pad).join(', ') : 'none yet'}.`);
  }
  if (header.status !== 'ok') throw new Error(`Header ${pad(number)} is not ready (${header.status}). ${header.status === 'failed' ? 'Try npx readme-nfo retry, or pick another number.' : 'Pick another number.'}`);
  const source = path.join(directory, header.svg);
  const svg = fs.readFileSync(source, 'utf8');
  const issues = imageIssues(svg, project.name);
  if (issues.length) throw new Error(`Header ${pad(number)} no longer passes checks: ${issues.join('; ')}`);

  refuseSymlink(path.join(root, '.github'));
  const target = path.join(root, INSTALL_DIR);
  refuseSymlink(target);
  fs.mkdirSync(target, { recursive: true });
  // An existing header.svg is ours if it matches any SVG in this gallery.
  const ours = new Set(state.headers.filter(item => item.status === 'ok').map(item => { try { return hash(fs.readFileSync(path.join(directory, item.svg), 'utf8')); } catch { return ''; } }));
  const svgFile = path.join(target, 'header.svg'), licenseFile = path.join(target, 'LICENSE');
  const license = LICENSE_TEXT();
  const changes = [];
  const svgResult = writeOwned(svgFile, svg, current => ours.has(hash(current)));
  const licenseResult = writeOwned(licenseFile, license, current => /^MIT License/.test(current) && /Luke Woods/.test(current));
  const shown = file => path.relative(root, file).split(path.sep).join('/');
  changes.push([svgResult, shown(svgFile)], [licenseResult, shown(licenseFile)]);

  let readme = findReadme(root);
  const created = !readme;
  if (readme) refuseSymlink(readme);
  readme ||= path.join(root, 'README.md');
  const src = path.relative(path.dirname(readme), svgFile).split(path.sep).join('/');
  const block = headerBlock({ src, alt: altText(project) });
  const before = created ? '' : fs.readFileSync(readme, 'utf8');
  const initial = created ? `${block}\n\n# ${project.name}\n${project.description ? `\n${project.description}\n` : ''}` : null;
  const patched = created ? { text: initial, replaced: false } : patchReadme(before, block);
  if (patched.text !== before) fs.writeFileSync(readme, patched.text);
  changes.push([created ? 'created' : patched.text === before ? 'unchanged' : 'updated', shown(readme)]);
  excludeFromGit(root, directory);
  return { number, header, readme, created, replaced: patched.replaced, changes };
}
