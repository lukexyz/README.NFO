#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArguments, fetchProject, normaliseProject, readLocalProject, findProjectRoot, SUBCOMMANDS } from './generator/project.mjs';
import { loadCatalogue, loadSamples } from './generator/hybrid-catalogue.mjs';
import { runBatch, retryFailed, briefBatch, checkHeaders, readState, headersDirectory, markInterrupted } from './generator/batch.mjs';
import { installHeader, INSTALL_DIR, START, END } from './generator/install.mjs';
import { createTerminal, SECONDS_PER_HEADER } from './generator/terminal.mjs';
import { openGallery } from './generator/browser.mjs';
import { detectAgents, chooseAgent, createDriver, switchHint, DEFAULT_CLAUDE_MODEL, CODEX_PINNED_EFFORT } from './generator/agents.mjs';
import { pad, useCommand } from './generator/hybrid-output.mjs';
import { supportsFormat } from './generator/catalogue.mjs';

const PACKAGE = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const HELP = `README.NFO: retro headers for your README, drawn fresh by Claude Code or Codex

  npx readme-nfo            10 new headers for the project in this folder
  npx readme-nfo more       10 more, numbered on (11-20, 21-30...); no style repeats
  npx readme-nfo use 3      put header 03 at the top of your README
  npx readme-nfo retry      redraw any headers that were skipped

Options
  -N, --count N      how many headers (default 10)
  --claude, --codex  choose the agent (default: the one you're signed in to;
                     asks once if both, and uses Claude when it can't ask)
  --model NAME       agent model (Claude: ${DEFAULT_CLAUDE_MODEL}; Codex: its default at ${CODEX_PINNED_EFFORT} effort)
  --jobs N           headers drawn at once (default 3, up to 8)
  --json             machine-readable output and no prompts, for agents and scripts
  --no-open          don't open the gallery in your browser
  --no-color         plain output (NO_COLOR works too)
  --format TYPE      catalogue treatments: all, svg or text (default all)
  --seed TEXT        repeat a draw
  --out DIR          gallery folder (default: readme-headers/ in your project)
  --project FILE     use a saved project.json instead of reading the folder
  --capabilities     print what this version supports, as JSON
  --help, --version

Agent mode (for agent plugins that draw the SVGs themselves)
  npx readme-nfo brief --count 3 --json   reserve the next numbers and print their briefs
  npx readme-nfo check --json             validate the SVGs saved for them, rebuild the gallery

Not cloned? npx readme-nfo github.com/owner/repo reads GitHub instead
(private repos use GH_TOKEN, or your gh sign-in).

Needs Node.js 22+ and Claude Code or Codex, signed in. It reads your project
folder, not GitHub, so private repos need no token; project facts go only to the
agent you pick. Headers land in readme-headers/ (kept out of git through
.git/info/exclude). Each header takes about 1-3 min with Claude or 2-7 min with
Codex, 3 at a time; the gallery fills as they land. Nothing is committed for you.
`;

export function capabilities(catalogue = loadCatalogue()) {
  return {
    name: PACKAGE.name, version: PACKAGE.version, node: PACKAGE.engines?.node,
    command: 'npx readme-nfo',
    agents: { supported: ['claude', 'codex'], flags: ['--claude', '--codex'], choice: 'flag, else the one signed in; asks once if both; non-interactive uses claude',
      claude: { command: 'claude -p --output-format json --json-schema', defaultModel: DEFAULT_CLAUDE_MODEL, bare: false },
      codex: { command: 'codex exec --sandbox read-only --ephemeral --output-schema', defaultModel: null, pinnedEffort: CODEX_PINNED_EFFORT, ignoreUserConfigWithoutModel: true },
      windowsCmdShims: true },
    project: { localDefault: true, networkInLocalMode: false, anyGitHost: true, noRemote: true, urlMode: 'github.com', urlToken: ['GH_TOKEN', 'GITHUB_TOKEN', 'gh auth token'] },
    styles: { distinct: catalogue.distinct.length, svgCapable: catalogue.distinct.filter(style => supportsFormat(style, 'svg')).length, samples: Object.keys(loadSamples()).length },
    batch: { defaultCount: 10, defaultJobs: 3, maxJobs: 8, rateLimitBackoffToJobs: 1, repairRetries: 1, skipOnFailure: true, liveGallery: true,
      legibilityWarningBelowPxAt375: 12, timePerHeaderSeconds: SECONDS_PER_HEADER },
    numbering: { continuous: true, state: 'readme-headers/draw.json', fields: ['next', 'usedIds'], moreCommand: 'npx readme-nfo more', noRepeats: true, oneGallery: 'readme-headers/index.html', batchDividers: true },
    install: { command: 'npx readme-nfo use N', svg: `${INSTALL_DIR}/header.svg`, license: `${INSTALL_DIR}/LICENSE`, markers: [START, END], keepsEol: true, keepsBom: true,
      refusesSymlinks: true, commits: false, createsReadmeIfMissing: true, pickPrompt: 'Install which header? [1-10, Enter = later]', pickPromptTtyOnly: true },
    output: { folder: 'readme-headers/', gitExclude: '.git/info/exclude' },
    commands: ['(default)', ...SUBCOMMANDS],
    json: true, capabilitiesFlag: true,
  };
}

function defaultAsk(question) {
  return import('node:readline/promises').then(async ({ createInterface }) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    try { return await rl.question(question); } finally { rl.close(); }
  });
}

async function loadProject(options, { cwd, readLocal, fetcher, warn, preferSaved }) {
  if (options.project) {
    const project = normaliseProject(JSON.parse(fs.readFileSync(path.resolve(cwd, options.project), 'utf8')));
    const root = findProjectRoot(cwd);
    return { project, root, directory: headersDirectory({ root, out: options.out, cwd }) };
  }
  if (options.repository) {
    const root = findProjectRoot(cwd);
    const directory = headersDirectory({ root, out: options.out, repository: options.repository, cwd });
    const saved = path.join(directory, 'project.json');
    if (preferSaved && fs.existsSync(saved)) return { project: normaliseProject(JSON.parse(fs.readFileSync(saved, 'utf8'))), root, directory };
    return { project: await fetcher(options.repository, { warn }), root, directory };
  }
  const local = readLocal(cwd);
  return { project: local.project, root: local.root, directory: headersDirectory({ root: local.root, out: options.out, cwd }) };
}

export async function main(args = process.argv.slice(2), {
  stream = process.stdout, errStream = process.stderr, cwd = process.cwd(), detect = detectAgents, driverFactory = createDriver,
  fetcher = fetchProject, readLocal = readLocalProject, openBrowser = openGallery, ask = defaultAsk,
  interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY), batchOptions = {},
} = {}) {
  const catalogue = loadCatalogue();
  const options = parseArguments(args, catalogue.distinct.length);
  const write = value => stream.write(value);
  const json = value => write(JSON.stringify(value, null, 2) + '\n');
  if (options.help) { write(HELP); return { command: 'help' }; }
  if (options.version) { write(`${PACKAGE.version}\n`); return { command: 'version' }; }
  if (options.capabilities) { json(capabilities(catalogue)); return { command: 'capabilities' }; }
  interactive = interactive && !options.json;
  const extra = options.out ? ` --out ${JSON.stringify(options.out)}` : options.repository ? ` ${options.repository.fullName}` : '';
  const galleryOptions = { extra };
  const warnings = [];
  const { project, root, directory } = await loadProject(options, { cwd, readLocal, fetcher, warn: message => warnings.push(message),
    preferSaved: ['use', 'check', 'retry'].includes(options.command) });
  const galleryFile = path.join(directory, 'index.html');
  const galleryUrl = pathToFileURL(galleryFile).href;

  if (options.command === 'use') {
    const result = installHeader({ number: options.number, directory, root: options.repository ? cwd : root, project });
    if (options.json) json({ ok: true, command: 'use', number: options.number, readme: result.readme, changes: result.changes.map(([action, file]) => ({ action, file })), next: 'Review with git diff, then commit.' });
    else {
      for (const [action, file] of result.changes) write(`  ${action.toUpperCase().padEnd(9)} ${file}\n`);
      write(`  Header ${pad(options.number)} is at the top of ${path.basename(result.readme)}. Review with git diff, then commit.\n`);
    }
    return { command: 'use', ...result };
  }
  if (options.command === 'brief') {
    const result = briefBatch(project, { directory, root, count: options.count, seed: options.seed, format: options.format, catalogue, galleryOptions });
    const out = { ok: true, command: 'brief', project: { name: project.name, fullName: project.fullName }, headersDir: directory, gallery: galleryUrl,
      batch: { batch: result.batch.batch, from: result.batch.from, to: result.batch.to },
      instructions: `Draw each header from its brief and save it as UTF-8 SVG at svgPath. Then run: npx readme-nfo check --json${extra}`,
      picks: result.picks,
      next: { check: `npx readme-nfo check --json${extra}`, install: useCommand('<N>', extra), more: `npx readme-nfo brief --json${extra}` } };
    if (options.json) json(out);
    else {
      write(`  Reserved ${pad(result.batch.from)}-${pad(result.batch.to)} for ${project.name}.\n`);
      for (const pick of result.picks) write(`  ${pad(pick.number)}  brief ${pick.briefPath}\n      save  ${pick.svgPath}\n`);
      write(`  Then run: npx readme-nfo check${extra}\n`);
    }
    return { command: 'brief', ...result };
  }
  if (options.command === 'check') {
    const { state, report } = checkHeaders(project, { directory, catalogue, galleryOptions });
    const problems = report.filter(item => item.issues.length);
    const ready = state.headers.filter(header => header.status === 'ok').map(header => header.number);
    if (options.json) json({ ok: !problems.length, command: 'check', gallery: galleryUrl, checked: report, ready,
      next: { install: useCommand('<N>', extra), fix: problems.length ? 'Fix each listed SVG at its svgPath, then run check again.' : undefined } });
    else {
      for (const item of report) write(`  ${pad(item.number)}  ${item.issues.length ? `NEEDS WORK  ${item.issues.join('; ')}` : 'OK'}\n`);
      write(`  GALLERY    ${galleryUrl}\n  INSTALL    ${useCommand('<N>', extra)}\n`);
    }
    if (problems.length) process.exitCode = 1;
    return { command: 'check', state, report };
  }

  // run, more and retry draw headers with an agent.
  const state = fs.existsSync(path.join(directory, 'draw.json')) ? readState(directory, catalogue) : null;
  if (options.command === 'more' && !state) throw new Error('There is no gallery here yet. Run npx readme-nfo first.');
  if (options.command === 'retry' && !state) throw new Error('There is no gallery here yet. Run npx readme-nfo first.');
  const remaining = catalogue.distinct.filter(style => !(state?.usedIds || []).includes(style.id) && supportsFormat(style, options.format)).length;
  const count = options.command === 'retry' ? state.headers.filter(header => header.status === 'failed' || header.status === 'pending').length : options.count;
  if (options.command === 'retry' && !count) {
    if (options.json) json({ ok: true, command: 'retry', headers: [], next: { install: useCommand('<N>', extra), more: `npx readme-nfo more${extra}` } });
    else write('  Nothing to retry: every header is ready.\n');
    return { command: 'retry', headers: [] };
  }
  if (options.command !== 'retry' && count > remaining) throw new Error(remaining ? `Only ${remaining} unused styles remain for this gallery; ask for -${remaining} or fewer.` : `Every one of the ${catalogue.distinct.length} styles is already in this gallery. Pick one with npx readme-nfo use N.`);
  const statuses = await detect();
  const choice = await chooseAgent({ requested: options.agent, statuses, interactive, ask, saved: state?.agent });
  const driver = driverFactory(choice.agent, { model: options.model });

  const terminal = createTerminal({ stream: options.json ? errStream : stream, color: options.color && !options.json });
  terminal.banner(count, catalogue.distinct.length, options.jobs);
  terminal.project(project.fullName);
  terminal.agent({ label: driver.label, hint: switchHint(driver.id), note: choice.note, account: driver.account, model: driver.modelLabel });
  for (const message of warnings) terminal.warning(message);
  let timer, interrupted;
  const onSigint = () => { interrupted = true; clearInterval(timer); terminal.finish(); markInterrupted(directory, project, galleryOptions); errStream.write('\nStopped. Finished headers are kept; run npx readme-nfo retry to redraw the rest.\n'); process.exit(130); };
  const hooks = {
    agentChoice: choice.save,
    onPlan: async ({ batch, plan }) => {
      terminal.plan({ from: batch.from, to: batch.to, total: plan.count, styles: plan.catalogueSize });
      terminal.estimate(plan.count, { jobs: options.jobs, agent: driver.id });
      terminal.destination(galleryUrl);
      process.once('SIGINT', onSigint);
      if (options.open && !options.json) {
        if (!(await openBrowser(galleryFile))) terminal.warning('Could not open your browser. Use the gallery link.');
      }
      if ((options.json ? errStream : stream).isTTY) timer = setInterval(() => terminal.tick(), 1000);
    },
    onRuntime: details => terminal.resolvedRuntime(details),
    onStep: (pick, step) => terminal.headerStep(pick, step),
    onDone: (pick, result, header) => terminal.headerDone(pick, result, header.seconds),
  };
  const started = Date.now();
  let result;
  try {
    const common = { directory, driver, jobs: options.jobs, catalogue, galleryOptions, ...batchOptions };
    result = options.command === 'retry'
      ? await retryFailed(project, common, hooks)
      : await runBatch(project, { ...common, root: options.repository ? findProjectRoot(cwd) : root, count, seed: options.seed, format: options.format }, hooks);
  } finally { clearInterval(timer); terminal.finish(); process.removeListener('SIGINT', onSigint); }
  if (interrupted) return;
  const headers = result.headers;
  const ready = headers.filter(header => header.status === 'ok');
  const skipped = headers.filter(header => header.status !== 'ok');
  const range = !headers.length ? '' : headers.length === 1 ? pad(headers[0].number) : `${pad(headers[0].number)}-${pad(headers.at(-1).number)}`;
  const seconds = Math.round((Date.now() - started) / 1000);
  const next = { install: useCommand('<N>', extra), more: `npx readme-nfo more${extra}`, ...(skipped.length ? { retry: `npx readme-nfo retry${extra}` } : {}) };
  if (options.json) {
    json({ ok: ready.length > 0, command: options.command, project: { name: project.name, fullName: project.fullName },
      agent: { id: driver.id, label: driver.label, model: driver.modelLabel, note: choice.note || undefined },
      gallery: galleryUrl, headersDir: directory, seconds,
      batch: result.batch ? { batch: result.batch.batch, from: result.batch.from, to: result.batch.to } : undefined,
      headers: headers.map(header => ({ number: header.number, id: header.id, status: header.status, svg: path.join(directory, header.svg), use: header.status === 'ok' ? useCommand(header.number, extra) : undefined, issue: header.issue, seconds: header.seconds })),
      next });
  } else {
    write(`  READY      ${ready.length} of ${headers.length} headers (${range}) in ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}\n`);
    for (const header of skipped) write(`  SKIPPED    ${pad(header.number)}  ${String(header.issue || '').slice(0, 140)}\n`);
    write(`  GALLERY    ${galleryUrl}\n`);
    if (ready.length) write(`  INSTALL    ${next.install}\n`);
    write(`  MORE       ${next.more}\n`);
    if (next.retry) write(`  RETRY      ${next.retry}\n`);
  }
  if (!ready.length) { process.exitCode = 1; return { command: options.command, ...result }; }
  if (interactive && ask) {
    const numbers = new Set(readState(directory, catalogue).headers.filter(header => header.status === 'ok').map(header => header.number));
    const low = headers[0].number, high = headers.at(-1).number;
    for (let tries = 0; tries < 3; tries++) {
      const answer = String(await ask(`Install which header? [${low === high ? low : `${low}-${high}`}, Enter = later] `)).trim();
      if (!answer) { write(`  Later: ${next.install}\n`); break; }
      const number = Number(answer.replace(/^#/, ''));
      if (!Number.isInteger(number) || !numbers.has(number)) { write(`  ${answer} is not a ready header number.\n`); continue; }
      const installed = installHeader({ number, directory, root: options.repository ? cwd : root, project });
      for (const [action, file] of installed.changes) write(`  ${action.toUpperCase().padEnd(9)} ${file}\n`);
      write(`  Header ${pad(number)} is at the top of ${path.basename(installed.readme)}. Review with git diff, then commit.\n`);
      break;
    }
  }
  return { command: options.command, ...result };
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  main().catch(error => {
    if (process.argv.includes('--json')) process.stdout.write(JSON.stringify({ ok: false, error: error.message, code: error.code }, null, 2) + '\n');
    else console.error(`README.NFO: ${error.message}`);
    process.exitCode = 1;
  });
}
