// Agent registry: finds Claude Code and Codex, checks sign-in without reading credentials,
// and runs one structured-output request per header. Assistant output is data, never executed.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

export const AGENTS = Object.freeze({
  claude: { id: 'claude', label: 'Claude Code', command: 'claude', other: 'codex',
    install: 'Install Claude Code (https://claude.com/claude-code), run claude and type /login.',
    signIn: 'Sign in to Claude Code: run claude and type /login (or set ANTHROPIC_API_KEY).' },
  codex: { id: 'codex', label: 'Codex', command: 'codex', other: 'claude',
    install: 'Install Codex (https://developers.openai.com/codex), then run codex login.',
    signIn: 'Sign in to Codex: run codex login (or set CODEX_API_KEY).' },
});
export const DEFAULT_CLAUDE_MODEL = 'sonnet';
// Codex runs ignore ~/.codex/config.toml unless --model is given, so a slow xhigh setting is not inherited.
export const CODEX_PINNED_EFFORT = 'medium';

const envValue = (env, name) => env[Object.keys(env).find(key => key.toUpperCase() === name) ?? name];
const isFile = file => { try { return fs.statSync(file).isFile(); } catch { return false; } };

// PATH x PATHEXT on Windows, so npm .cmd shims are found as well as .exe files.
export function resolveCommand(name, { env = process.env, platform = process.platform, exists = isFile } = {}) {
  const separator = platform === 'win32' ? ';' : ':';
  const join = platform === 'win32' ? path.win32.join : path.posix.join;
  const directories = String(envValue(env, 'PATH') || '').split(separator).map(entry => entry.trim().replace(/^"(.*)"$/, '$1')).filter(Boolean);
  const extensions = platform === 'win32'
    ? (path.win32.extname(name) ? [''] : String(envValue(env, 'PATHEXT') || '.COM;.EXE;.BAT;.CMD').split(';').filter(Boolean))
    : [''];
  for (const directory of directories) for (const extension of extensions) {
    const candidate = join(directory, name + extension.toLowerCase());
    if (exists(candidate)) return candidate;
    if (extension && exists(join(directory, name + extension))) return join(directory, name + extension);
  }
  return null;
}

// cmd.exe quoting, following cross-spawn: quote for the C runtime, then caret-escape metacharacters.
const META = /([()\][%!^"`<>&|;, *?])/g;
export function escapeCmdArgument(value, doubleEscape = false) {
  let arg = String(value).replace(/(?=(\\+?)?)\1"/g, '$1$1\\"').replace(/(?=(\\+?)?)\1$/, '$1$1');
  arg = `"${arg}"`.replace(META, '^$1');
  return doubleEscape ? arg.replace(META, '^$1') : arg;
}
export function commandLine(file, args, { platform = process.platform, env = process.env } = {}) {
  if (platform === 'win32' && /\.(?:cmd|bat)$/i.test(file)) {
    // Batch files re-parse their arguments when they forward %*, so escape twice (as cross-spawn
    // does for npm shims). This covers global npm shims such as %APPDATA%\npm\codex.cmd too.
    const line = [String(file).replace(META, '^$1'), ...args.map(arg => escapeCmdArgument(arg, true))].join(' ');
    return { command: envValue(env, 'COMSPEC') || 'cmd.exe', args: ['/d', '/s', '/c', `"${line}"`], verbatim: true };
  }
  return { command: file, args, verbatim: false };
}
export function spawnCommand(file, args, options = {}, { platform = process.platform, spawnFn = spawn, env = process.env } = {}) {
  const line = commandLine(file, args, { platform, env });
  return spawnFn(line.command, line.args, { ...options, shell: false, windowsHide: true, ...(line.verbatim ? { windowsVerbatimArguments: true } : {}) });
}

// Run a command, collect bounded output, never throw.
export function runCapture(file, args, { input, cwd, timeoutMs = 3000, spawnFn = spawn, platform = process.platform, env = process.env, maxBytes = 8_000_000, onStderr } = {}) {
  return new Promise(resolve => {
    let child, stdout = '', stderr = '', settled = false, timedOut = false;
    const finish = result => { if (settled) return; settled = true; clearTimeout(timer); resolve({ stdout, stderr, timedOut, ...result }); };
    try { child = spawnCommand(file, args, { cwd, env, stdio: ['pipe', 'pipe', 'pipe'] }, { platform, spawnFn, env }); }
    catch (error) { resolve({ code: null, stdout, stderr, error, timedOut }); return; }
    const timer = setTimeout(() => { timedOut = true; try { child.kill(); } catch {} finish({ code: null }); }, timeoutMs);
    child.stdout?.on('data', chunk => { if (stdout.length < maxBytes) stdout += chunk.toString(); });
    child.stderr?.on('data', chunk => { onStderr?.(chunk); stderr = (stderr + chunk.toString()).slice(-16000); });
    child.once('error', error => finish({ code: null, error }));
    child.once('close', code => finish({ code }));
    child.stdin?.on('error', () => {});
    if (child.stdin) child.stdin.end(input ?? '');
  });
}

const capitalise = value => value ? value[0].toUpperCase() + value.slice(1) : value;
// Account labels show plan or billing type only: never email, organisation or keys.
export function claudeAccount(statusText) {
  let data; try { data = JSON.parse(statusText); } catch { data = null; }
  if (!data) return { ready: /logged\s*in/i.test(statusText) && !/not\s+logged\s*in/i.test(statusText), account: 'Claude Code sign-in' };
  if (!data.loggedIn) return { ready: false, account: '' };
  const plan = typeof data.subscriptionType === 'string' && /^[a-z0-9_-]{1,20}$/i.test(data.subscriptionType) ? `Claude ${capitalise(data.subscriptionType)} plan` : null;
  const api = /api.?key|console/i.test(String(data.authMethod || ''));
  return { ready: true, account: api ? 'Anthropic API account (usage billed)' : plan || 'Claude Code sign-in' };
}
export function codexAccount(code, statusText) {
  if (code !== 0) return { ready: false, account: '' };
  if (/chatgpt/i.test(statusText)) return { ready: true, account: 'ChatGPT sign-in (Codex allowance)' };
  if (/api.?key/i.test(statusText)) return { ready: true, account: 'OpenAI API key (usage billed)' };
  return { ready: true, account: 'Codex sign-in' };
}

export async function probeAgent(id, { env = process.env, platform = process.platform, spawnFn = spawn, resolve = resolveCommand, timeoutMs = 3000 } = {}) {
  const agent = AGENTS[id];
  const file = resolve(agent.command, { env, platform });
  const base = { id, label: agent.label, file, installed: Boolean(file), ready: false, account: '', hint: file ? agent.signIn : agent.install };
  if (!file) return base;
  const run = args => runCapture(file, args, { timeoutMs, spawnFn, platform, env });
  if (id === 'claude') {
    const [status, help] = await Promise.all([
      envValue(env, 'ANTHROPIC_API_KEY') ? null : run(['auth', 'status']),
      run(['--help']),
    ]);
    const safeMode = /--safe-mode\b/.test(help.stdout || '');
    if (!status) return { ...base, ready: true, account: 'ANTHROPIC_API_KEY (usage billed)', safeMode, hint: '' };
    const parsed = claudeAccount(status.stdout || status.stderr || '');
    return { ...base, ...parsed, safeMode, hint: parsed.ready ? '' : agent.signIn };
  }
  if (envValue(env, 'CODEX_API_KEY')) return { ...base, ready: true, account: 'CODEX_API_KEY (usage billed)', hint: '' };
  const status = await run(['login', 'status']);
  const parsed = codexAccount(status.code, `${status.stdout}\n${status.stderr}`);
  return { ...base, ...parsed, hint: parsed.ready ? '' : agent.signIn };
}

export async function detectAgents(options = {}) {
  const [claude, codex] = await Promise.all([probeAgent('claude', options), probeAgent('codex', options)]);
  return { claude, codex };
}

// Engine choice: a flag wins; one signed-in agent is used; both asks once (or Claude when non-interactive).
export async function chooseAgent({ requested, statuses, interactive = false, ask, saved } = {}) {
  if (requested) {
    const status = statuses[requested];
    if (!status?.ready) throw Object.assign(new Error(`${AGENTS[requested].label} is not ready. ${status?.hint || AGENTS[requested].signIn}`), { code: 'AGENT_NOT_READY' });
    return { agent: status, note: '' };
  }
  const ready = ['claude', 'codex'].filter(id => statuses[id]?.ready);
  if (!ready.length) {
    throw Object.assign(new Error(`Sign in to Claude Code or Codex first.\n  Claude Code: ${statuses.claude?.hint || AGENTS.claude.signIn}\n  Codex: ${statuses.codex?.hint || AGENTS.codex.signIn}`), { code: 'NO_AGENT' });
  }
  if (ready.length === 1) return { agent: statuses[ready[0]], note: '' };
  if (saved && statuses[saved]?.ready) return { agent: statuses[saved], note: 'saved choice', saved };
  if (interactive && ask) {
    const answer = String(await ask('Both Claude Code and Codex are signed in. Use which? [1] Claude Code  [2] Codex (Enter = 1): ')).trim().toLowerCase();
    const id = /^(2|codex|c[o0]dex)$/.test(answer) ? 'codex' : 'claude';
    return { agent: statuses[id], note: 'your choice', save: id };
  }
  return { agent: statuses.claude, note: 'both signed in; non-interactive runs use Claude Code' };
}

export const switchHint = id => `switch: --${AGENTS[id].other}`;

const classify = (error, text) => {
  const sample = String(text || '');
  error.rateLimited = /rate.?limit|\b429\b|usage limit|too many requests|overloaded|quota/i.test(sample);
  error.fatal = !error.rateLimited && /not logged in|please (?:run )?.{0,10}login|invalid api key|unauthori[sz]ed|\b401\b|authentication/i.test(sample);
  return error;
};
const tail = value => String(value || '').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, ' ').trim().slice(-600);

export function claudeArgs(schema, { model, safeMode = false } = {}) {
  const args = ['-p', '--output-format', 'json', '--json-schema', JSON.stringify(schema), '--tools', '',
    '--no-session-persistence', '--permission-mode', 'dontAsk', '--model', model || DEFAULT_CLAUDE_MODEL];
  if (safeMode) args.push('--safe-mode');
  return args; // Never --bare: it ignores claude.ai sign-ins.
}
export function codexArgs(schemaFile, answerFile, { model } = {}) {
  const args = ['exec', '--sandbox', 'read-only', '--skip-git-repo-check', '--ephemeral', '--output-schema', schemaFile,
    '--output-last-message', answerFile, '--color', 'never'];
  if (model) args.push('-m', model);
  else args.push('--ignore-user-config', '-c', `model_reasoning_effort="${CODEX_PINNED_EFFORT}"`);
  return [...args, '-'];
}

// Parse `claude -p --output-format json`: require success and take structured_output.
export function parseClaudeResult(stdout) {
  const lines = String(stdout || '').trim().split(/\r?\n/).reverse();
  let result;
  for (const line of [String(stdout || '').trim(), ...lines]) { try { result = JSON.parse(line); break; } catch {} }
  if (!result || typeof result !== 'object') throw classify(new Error(`Claude Code did not return JSON. ${tail(stdout)}`), stdout);
  if (Array.isArray(result)) result = result.findLast(item => item?.type === 'result') || {};
  if (result.is_error || (result.subtype && result.subtype !== 'success')) {
    throw classify(new Error(`Claude Code reported ${result.subtype || 'an error'}: ${tail(result.result || result.error)}`), `${result.result || ''} ${result.error || ''}`);
  }
  let data = result.structured_output;
  if (!data && typeof result.result === 'string') { try { data = JSON.parse(result.result.replace(/^```(?:json)?\s*|\s*```$/g, '')); } catch {} }
  if (!data) throw new Error('Claude Code returned no structured output.');
  const model = Object.keys(result.modelUsage || {})[0];
  return { data, model: typeof model === 'string' ? model.replace(/[^\w.:-]/g, '').slice(0, 80) : undefined };
}

// Only forward model/provider fields from the Codex startup header, never its prompt or logs.
export function createRuntimeReporter(report = () => {}) {
  let header = '', stopped = false;
  const seen = {};
  return chunk => {
    if (stopped) return;
    header = (header + chunk.toString()).slice(0, 16384);
    const boundary = header.search(/\n(?:user|thinking)\r?\n/);
    const startup = boundary < 0 ? header : header.slice(0, boundary);
    if (/OpenAI Codex/i.test(startup)) {
      const update = {};
      for (const key of ['model', 'provider']) {
        const value = startup.match(new RegExp(`^${key}:\\s*([^\\r\\n]+)\\r?\\n`, 'm'))?.[1]?.trim();
        if (value && value !== seen[key]) { seen[key] = value; update[key] = value.replace(/[\u0000-\u001f\u007f-\u009f]/g, '').slice(0, 120); }
      }
      if (Object.keys(update).length) report(update);
    }
    if (boundary >= 0 || header.length >= 16384) stopped = true;
  };
}

// A driver turns (prompt, schema) into parsed JSON for one header, using files in `directory`.
export function createDriver(status, { model, spawnFn = spawn, platform = process.platform, env = process.env } = {}) {
  const id = status.id;
  const label = status.label || AGENTS[id].label;
  const modelLabel = id === 'claude' ? (model || DEFAULT_CLAUDE_MODEL) : (model || `Codex default, ${CODEX_PINNED_EFFORT} effort`);
  async function author(prompt, schema, directory, { timeoutMs = 1200000, onRuntime = () => {} } = {}) {
    fs.mkdirSync(directory, { recursive: true });
    const schemaFile = path.join(directory, 'schema.json'), answerFile = path.join(directory, 'answer.json');
    fs.writeFileSync(schemaFile, JSON.stringify(schema, null, 2));
    if (fs.existsSync(answerFile)) fs.unlinkSync(answerFile);
    const log = path.join(directory, 'run.log');
    if (id === 'claude') {
      const result = await runCapture(status.file, claudeArgs(schema, { model, safeMode: status.safeMode }), { input: prompt, cwd: directory, timeoutMs, spawnFn, platform, env });
      fs.writeFileSync(log, `exit ${result.code}${result.timedOut ? ' (timed out)' : ''}\n${result.stderr}\n`);
      if (result.timedOut) throw new Error('Claude Code timed out.');
      if (result.error) throw classify(new Error(`Cannot start Claude Code: ${result.error.message}`), result.error.message);
      if (result.code !== 0 && !result.stdout.trim()) throw classify(new Error(`Claude Code failed (exit ${result.code}). ${tail(result.stderr)}`), result.stderr);
      const parsed = parseClaudeResult(result.stdout);
      fs.writeFileSync(answerFile, JSON.stringify(parsed.data));
      if (parsed.model) onRuntime({ model: parsed.model });
      return parsed.data;
    }
    const reportRuntime = createRuntimeReporter(onRuntime);
    const result = await runCapture(status.file, codexArgs(schemaFile, answerFile, { model }), { input: prompt, cwd: directory, timeoutMs, spawnFn, platform, env, onStderr: reportRuntime });
    fs.writeFileSync(log, `exit ${result.code}${result.timedOut ? ' (timed out)' : ''}\n${result.stderr}\n`);
    if (result.timedOut) throw new Error('Codex timed out.');
    if (result.error) throw classify(new Error(`Cannot start Codex: ${result.error.message}`), result.error.message);
    if (result.code !== 0) throw classify(new Error(`Codex failed (exit ${result.code}). ${tail(result.stderr)}`), result.stderr);
    try { return JSON.parse(fs.readFileSync(answerFile, 'utf8')); }
    catch { throw new Error('Codex did not return a complete JSON result.'); }
  }
  return { id, label, modelLabel, account: status.account, author };
}
