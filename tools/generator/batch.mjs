// One gallery per project: readme-headers/draw.json holds {next, usedIds} plus every numbered
// header and batch. Numbers never restart and no style repeats within the gallery.
import fs from 'node:fs';
import path from 'node:path';
import { loadCatalogue, makePlan, slugFor } from './hybrid-catalogue.mjs';
import { authorHeaders, authorPrompt, imageIssues, legibilityIssues } from './author.mjs';
import { galleryHtml } from './hybrid-output.mjs';
import { gitCommonDirectory } from './project.mjs';

export const SCHEMA_VERSION = 3;
const SLUG = /^\d{2,3}-[a-z][a-z0-9]*-\d{2}$/;
const STATUSES = new Set(['pending', 'ok', 'failed', 'briefed']);
const LICENSE_TEXT = () => fs.readFileSync(new URL('../../LICENSE', import.meta.url), 'utf8');

export const svgPath = header => `assets/${header.slug}.svg`;

function contained(root, relative) {
  const target = path.resolve(root, relative), rel = path.relative(root, target);
  if (!rel || rel.startsWith(`..${path.sep}`) || rel === '..' || path.isAbsolute(rel)) throw new Error('Path escapes the headers folder.');
  const existing = fs.existsSync(target) ? target : path.dirname(target);
  if (fs.existsSync(existing)) {
    const real = path.relative(fs.realpathSync(root), fs.realpathSync(existing));
    if (real === '..' || real.startsWith(`..${path.sep}`) || path.isAbsolute(real)) throw new Error('A symlink escapes the headers folder.');
  }
  return target;
}
export function writeIn(root, relative, contents) {
  const target = contained(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  contained(root, relative);
  fs.writeFileSync(target, contents);
  return target;
}

// Default folder: <project root>/readme-headers; URL mode: ./readme-headers/<owner>-<repo>.
export function headersDirectory({ root, out, repository, cwd = process.cwd() }) {
  if (out) return path.resolve(cwd, out);
  if (repository) return path.resolve(cwd, 'readme-headers', `${repository.owner}-${repository.repo}`);
  return path.join(root, 'readme-headers');
}

// Keep the gallery out of commits without touching the project's .gitignore.
export function excludeFromGit(root, directory) {
  const common = gitCommonDirectory(root);
  if (!common) return false;
  const relative = path.relative(root, directory).split(path.sep).join('/');
  if (!relative || relative.startsWith('..')) return false;
  const pattern = `/${relative}/`;
  const file = path.join(common, 'info', 'exclude');
  let text = ''; try { text = fs.readFileSync(file, 'utf8'); } catch {}
  const lines = text.split(/\r?\n/).map(line => line.trim());
  if (lines.includes(pattern) || lines.includes(`${relative}/`) || lines.includes(relative) || lines.includes(`/${relative}`)) return false;
  // Sandboxed agents (e.g. Codex workspace-write) may make .git read-only: skip quietly.
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${text}${text && !text.endsWith('\n') ? '\n' : ''}# README.NFO header gallery\n${pattern}\n`);
  } catch { return false; }
  return true;
}

export function newState(project) {
  return { generator: 'README.NFO', schemaVersion: SCHEMA_VERSION, project: project.fullName, next: 1, usedIds: [], agent: null, batches: [], headers: [] };
}
export function readState(directory, catalogue = loadCatalogue()) {
  const file = path.join(directory, 'draw.json');
  if (!fs.existsSync(file)) return null;
  let state; try { state = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { throw new Error(`${file} is not valid JSON. Fix or delete it.`); }
  if (state?.schemaVersion !== SCHEMA_VERSION) throw new Error(`${file} is from an older README.NFO batch. Move it aside (or delete readme-headers/) and run again.`);
  if (!Number.isInteger(state.next) || state.next < 1 || !Array.isArray(state.usedIds) || !Array.isArray(state.headers) || !Array.isArray(state.batches)) throw new Error(`${file} is damaged.`);
  const numbers = new Set();
  for (const header of state.headers) {
    if (!Number.isInteger(header.number) || numbers.has(header.number) || header.number >= state.next || !catalogue.byId.has(header.id)
      || header.slug !== slugFor(header.number, header.id) || !SLUG.test(header.slug) || !STATUSES.has(header.status)) throw new Error(`${file} has an invalid header entry (${header?.number}).`);
    numbers.add(header.number);
    header.svg = svgPath(header); // Never trust a stored path.
  }
  if (state.usedIds.some(id => !catalogue.byId.has(id))) throw new Error(`${file} lists an unknown style.`);
  return state;
}
export function saveState(directory, state) { writeIn(directory, 'draw.json', JSON.stringify(state, null, 2) + '\n'); }
export function writeGallery(directory, state, project, options = {}) { return writeIn(directory, 'index.html', galleryHtml(state, project, options)); }

// One run at a time per gallery. A lock left by a dead process is taken over.
export function acquireLock(directory, { pid = process.pid, alive = isAlive } = {}) {
  fs.mkdirSync(directory, { recursive: true });
  const file = path.join(directory, '.lock');
  const body = JSON.stringify({ pid, startedAt: new Date().toISOString() });
  try { fs.writeFileSync(file, body, { flag: 'wx' }); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    let owner = {}; try { owner = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
    const age = Date.now() - Date.parse(owner.startedAt || 0);
    if (owner.pid && owner.pid !== pid && alive(owner.pid) && age < 6 * 3600e3) throw new Error(`Another README.NFO run (process ${owner.pid}) is using ${directory}. Wait for it to finish.`);
    fs.writeFileSync(file, body);
  }
  return () => { try { if (JSON.parse(fs.readFileSync(file, 'utf8')).pid === pid) fs.unlinkSync(file); } catch {} };
}
function isAlive(pid) { try { process.kill(pid, 0); return true; } catch (error) { return error.code === 'EPERM'; } }

// Any header still "pending" when a new run takes the lock was interrupted.
function settleInterrupted(state) {
  for (const header of state.headers) if (header.status === 'pending') { header.status = 'failed'; header.issue = 'Interrupted before it finished.'; }
}

function prepare(directory, project, root) {
  fs.mkdirSync(path.join(directory, 'assets'), { recursive: true });
  writeIn(directory, 'project.json', JSON.stringify(project, null, 2) + '\n');
  writeIn(directory, 'LICENSE', LICENSE_TEXT());
  if (root) excludeFromGit(root, directory);
}

function reserve(state, plan, { agent, model, kind, status, now }) {
  const batch = { batch: (state.batches.at(-1)?.batch || 0) + 1, from: plan.start, to: plan.start + plan.count - 1, kind, agent, model, seed: plan.seed, format: plan.format, startedAt: now().toISOString() };
  state.batches.push(batch);
  for (const pick of plan.options) state.headers.push({ number: pick.number, id: pick.id, family: pick.family, slug: pick.slug, batch: batch.batch, status, svg: svgPath(pick) });
  state.next = plan.start + plan.count;
  state.usedIds = [...new Set([...state.usedIds, ...plan.options.map(pick => pick.id)])];
  return batch;
}

const pickFor = (header, catalogue) => {
  const style = catalogue.byId.get(header.id);
  return { id: header.id, name: style.name, mode: 'fresh', style, number: header.number, slug: header.slug, family: header.family || catalogue.family.get(header.id) };
};

async function authorInto({ directory, state, project, picks, driver, jobs, galleryOptions, hooks, timeoutMs, wait, backoffMs }) {
  const byNumber = new Map(state.headers.map(header => [header.number, header]));
  const started = new Map();
  const refresh = live => { saveState(directory, state); writeGallery(directory, state, project, { ...galleryOptions, live }); };
  await authorHeaders(project, picks, directory, { driver, jobs, timeoutMs, wait, backoffMs,
    onRuntime: details => hooks.onRuntime?.(details),
    onStep: (pick, step) => { if (!started.has(pick.number)) started.set(pick.number, Date.now()); hooks.onStep?.(pick, step); },
    onDone: (pick, result) => {
      const header = byNumber.get(pick.number);
      header.seconds = Math.round((Date.now() - (started.get(pick.number) || Date.now())) / 1000);
      header.attempts = result.attempts;
      if (result.ok) {
        writeIn(directory, svgPath(header), result.image.svg);
        writeIn(directory, `src/${header.slug}.art.json`, JSON.stringify(result.image.artDecisions, null, 2) + '\n');
        header.status = 'ok'; delete header.issue;
        if (result.warnings?.length) header.warnings = result.warnings; else delete header.warnings;
      } else { header.status = 'failed'; header.issue = String(result.issue || 'Authoring failed.').slice(0, 400); }
      refresh(true);
      hooks.onDone?.(pick, result, header);
    },
  });
  refresh(false);
}

// Draw `count` new styles, number them from draw.json's `next`, and author them `jobs` at a time.
export async function runBatch(project, { directory, root, count = 10, seed, format = 'all', driver, jobs = 3, catalogue = loadCatalogue(), now = () => new Date(), galleryOptions = {}, timeoutMs, wait, backoffMs } = {}, hooks = {}) {
  const release = acquireLock(directory);
  try {
    const state = readState(directory, catalogue) || newState(project);
    settleInterrupted(state);
    const plan = makePlan(project, { count, seed, format, used: new Set(state.usedIds), start: state.next, catalogue });
    if (hooks.agentChoice) state.agent = hooks.agentChoice;
    prepare(directory, project, root);
    const batch = reserve(state, plan, { agent: driver.id, model: driver.modelLabel, kind: 'cli', status: 'pending', now });
    saveState(directory, state);
    writeGallery(directory, state, project, { ...galleryOptions, live: true });
    await hooks.onPlan?.({ state, batch, plan, directory });
    await authorInto({ directory, state, project, picks: plan.options, driver, jobs, galleryOptions, hooks, timeoutMs, wait, backoffMs });
    batch.finishedAt = now().toISOString();
    saveState(directory, state);
    return { state, batch, headers: state.headers.filter(header => header.batch === batch.batch) };
  } finally { release(); }
}

// Redraw skipped or interrupted headers with the same numbers and styles.
export async function retryFailed(project, { directory, driver, jobs = 3, catalogue = loadCatalogue(), galleryOptions = {}, timeoutMs, wait, backoffMs } = {}, hooks = {}) {
  const release = acquireLock(directory);
  try {
    const state = readState(directory, catalogue);
    if (!state) throw new Error('No gallery here yet. Run npx readme-nfo first.');
    settleInterrupted(state);
    const targets = state.headers.filter(header => header.status === 'failed');
    if (!targets.length) return { state, headers: [] };
    for (const header of targets) { header.status = 'pending'; delete header.issue; }
    saveState(directory, state);
    writeGallery(directory, state, project, { ...galleryOptions, live: true });
    await hooks.onPlan?.({ state, batch: { from: targets[0].number, to: targets.at(-1).number }, plan: { count: targets.length, catalogueSize: catalogue.distinct.length }, directory });
    await authorInto({ directory, state, project, picks: targets.map(header => pickFor(header, catalogue)), driver, jobs, galleryOptions, hooks, timeoutMs, wait, backoffMs });
    return { state, headers: targets };
  } finally { release(); }
}

// Agent mode, step 1: reserve numbers and write one brief per header. The host agent draws the SVGs.
export function briefBatch(project, { directory, root, count = 10, seed, format = 'all', catalogue = loadCatalogue(), now = () => new Date(), galleryOptions = {} } = {}) {
  const release = acquireLock(directory);
  try {
    const state = readState(directory, catalogue) || newState(project);
    settleInterrupted(state);
    const plan = makePlan(project, { count, seed, format, used: new Set(state.usedIds), start: state.next, catalogue });
    prepare(directory, project, root);
    const batch = reserve(state, plan, { agent: 'host', model: null, kind: 'brief', status: 'briefed', now });
    const picks = plan.options.map(pick => {
      const svg = path.join(directory, svgPath(pick));
      const brief = authorPrompt(project, [pick], { mode: 'file', files: { [pick.id]: svg } });
      const briefFile = writeIn(directory, `_author/${pick.slug}/brief.txt`, brief);
      return { number: pick.number, id: pick.id, slug: pick.slug, svgPath: svg, briefPath: briefFile, brief };
    });
    saveState(directory, state);
    writeGallery(directory, state, project, galleryOptions);
    return { state, batch, picks };
  } finally { release(); }
}

// Agent mode, step 2: validate saved SVGs for reserved, skipped or interrupted numbers, then rebuild the gallery.
export function checkHeaders(project, { directory, catalogue = loadCatalogue(), galleryOptions = {} } = {}) {
  const release = acquireLock(directory);
  try {
    const state = readState(directory, catalogue);
    if (!state) throw new Error('No gallery here yet. Run npx readme-nfo brief --json first.');
    settleInterrupted(state);
    const report = [];
    // Each number is its own drawing: an SVG identical to another header's is rejected.
    const seen = new Map();
    for (const header of state.headers) if (header.status === 'ok') { try { seen.set(fs.readFileSync(path.join(directory, svgPath(header)), 'utf8'), header.number); } catch {} }
    for (const header of state.headers) {
      if (header.status === 'ok') continue;
      const file = path.join(directory, svgPath(header));
      if (!fs.existsSync(file)) { report.push({ number: header.number, id: header.id, status: header.status, svgPath: file, issues: ['SVG not saved yet'] }); continue; }
      const svgText = fs.readFileSync(file, 'utf8');
      const issues = imageIssues(svgText, project.name);
      if (seen.has(svgText)) issues.push(`Same image as header ${String(seen.get(svgText)).padStart(2, '0')}; draw this style afresh`);
      if (issues.length) { header.issue = issues.join('; ').slice(0, 400); report.push({ number: header.number, id: header.id, status: header.status, svgPath: file, issues }); continue; }
      seen.set(svgText, header.number);
      const warnings = legibilityIssues(svgText);
      header.status = 'ok'; delete header.issue;
      if (warnings.length) header.warnings = warnings; else delete header.warnings;
      report.push({ number: header.number, id: header.id, status: 'ok', svgPath: file, issues: [], warnings });
    }
    // A batch finishes the first time every header in it is OK; `check` opens the gallery at that moment.
    const finished = [];
    for (const batch of state.batches) if (!batch.finishedAt && state.headers.filter(h => h.batch === batch.batch).every(h => h.status === 'ok')) { batch.finishedAt = new Date().toISOString(); finished.push(batch.batch); }
    saveState(directory, state);
    writeGallery(directory, state, project, galleryOptions);
    return { state, report, finished };
  } finally { release(); }
}

// Ctrl+C: mark unfinished headers so the gallery stops refreshing and `retry` can redraw them.
export function markInterrupted(directory, project, galleryOptions = {}) {
  try {
    const state = readState(directory);
    if (!state) return;
    settleInterrupted(state);
    saveState(directory, state);
    writeGallery(directory, state, project, galleryOptions);
    fs.rmSync(path.join(directory, '.lock'), { force: true });
  } catch {}
}
