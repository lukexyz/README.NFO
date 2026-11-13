// Project facts are input data, never executable code. Local mode reads the folder on disk and
// makes no network call; URL mode reads GitHub's public API (with GH_TOKEN or `gh auth token`).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { resolveCommand, runCapture } from './agents.mjs';
import { catalogueFor } from './catalogue.mjs';

export function parseRepository(value) {
  let input = String(value || '').trim();
  if (/^[\w.-]+\/[\w.-]+$/.test(input)) input = `https://github.com/${input}`;
  else if (/^github\.com\//i.test(input)) input = `https://${input}`;
  let url;
  try { url = new URL(input); } catch { throw new Error('Use a GitHub repository URL or owner/repo.'); }
  if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 'github.com' || url.port || url.username || url.password || url.search || url.hash) {
    throw new Error('Use a plain https://github.com/owner/repo URL.');
  }
  const parts = url.pathname.replace(/\/$/, '').split('/').slice(1);
  if (parts.length !== 2 || parts.some(part => !/^[\w.-]+$/.test(part) || /^\.+$/.test(part))) {
    throw new Error('Use the repository URL, without a file or branch path.');
  }
  const owner = parts[0], repo = parts[1].replace(/\.git$/, '');
  if (!repo || /^\.+$/.test(repo)) throw new Error('The repository name is missing.');
  return { owner, repo, fullName: `${owner}/${repo}`, url: `https://github.com/${owner}/${repo}` };
}

// Any host's remote URL (https, ssh or scp-like) to {host, owner, repo, url}; credentials are dropped.
export function parseRemote(value) {
  const input = String(value || '').trim();
  let host, route;
  const scp = input.match(/^(?:[\w.-]+@)?([\w.-]+):(?!\/\/)(.+)$/);
  if (scp && !/^[a-z]:[\\/]/i.test(input)) { host = scp[1]; route = scp[2]; }
  else {
    try { const url = new URL(input); if (!['https:', 'http:', 'ssh:', 'git:'].includes(url.protocol)) return null; host = url.hostname; route = url.pathname; }
    catch { return null; }
  }
  const parts = route.replace(/^\/+|\/+$/g, '').replace(/\.git$/, '').split('/').filter(Boolean);
  if (!host || parts.length < 2 || parts.some(part => !/^[\w.-]+$/.test(part) || /^\.+$/.test(part))) return null;
  const repo = parts.at(-1), owner = parts.slice(0, -1).join('/');
  return { host: host.toLowerCase(), owner, repo, url: `https://${host.toLowerCase()}/${owner}/${repo}` };
}

export const SUBCOMMANDS = ['more', 'use', 'brief', 'check', 'retry'];
const RETIRED = {
  resume: 'The --resume option was replaced by `npx readme-nfo retry`, which redraws skipped headers.',
  exclude: 'Every gallery remembers its styles in readme-headers/draw.json, so --exclude is no longer needed.',
  'allow-repeats': 'Styles never repeat within a gallery. Delete readme-headers/ to start a new one.',
};

export function parseArguments(args, maximum) {
  const options = { command: 'run', count: 10, format: 'all', open: true, color: true, json: false, jobs: 3 };
  const valued = new Set(['repo', 'count', 'out', 'seed', 'project', 'format', 'model', 'jobs']);
  const assigned = new Set();
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (/^--?creativity(?:=|$)/.test(arg)) throw new Error('Every header is freshly authored. Remove the creativity option and its value, then run again.');
    const retired = arg.match(/^--(resume|exclude|allow-repeats)(?:=|$)/);
    if (retired) throw new Error(RETIRED[retired[1]]);
    if (arg === '--help' || arg === '-h') { options.help = true; continue; }
    if (arg === '--version' || arg === '-v') { options.version = true; continue; }
    if (arg === '--capabilities') { options.capabilities = true; continue; }
    if (arg === '--json') { options.json = true; continue; }
    if (arg === '--no-open') { options.open = false; continue; }
    if (arg === '--no-color') { options.color = false; continue; }
    if (arg === '--claude' || arg === '--codex') {
      if (options.agent && options.agent !== arg.slice(2)) throw new Error('Choose --claude or --codex, not both.');
      options.agent = arg.slice(2); continue;
    }
    if (/^-\d+$/.test(arg)) {
      if (assigned.has('count')) throw new Error('Supply the count once.');
      options.count = arg.slice(1); assigned.add('count'); continue;
    }
    if (arg.startsWith('--')) {
      const [key, ...rest] = arg.slice(2).split('=');
      if (!valued.has(key)) throw new Error(`Unknown option: --${key}. Use --help.`);
      if (assigned.has(key)) throw new Error(`Supply --${key} once.`);
      const value = rest.length ? rest.join('=') : args[++i];
      if (!value || value.startsWith('--')) throw new Error(`--${key} needs a value.`);
      options[key] = value; assigned.add(key); continue;
    }
    if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}. Use --help.`);
    positional.push(arg);
  }
  if (options.help || options.version || options.capabilities) return options;
  if (positional.length && SUBCOMMANDS.includes(positional[0])) options.command = positional.shift();
  if (options.command === 'use') {
    const number = positional.shift();
    if (!/^\d{1,3}$/.test(String(number || '')) || Number(number) < 1) throw new Error('Say which header to install, for example: npx readme-nfo use 3');
    options.number = Number(number);
  }
  if (positional.length > 1) throw new Error(`Unexpected argument: ${positional[1]}. Use --help.`);
  if (positional.length) {
    if (options.repo) throw new Error('Supply one repository.');
    options.repo = positional[0];
  }
  if (options.repo && options.project) throw new Error('Supply a repository URL or --project, not both.');
  if (options.repo) options.repository = parseRepository(options.repo);
  if (!['all', 'svg', 'text'].includes(options.format)) throw new Error('--format must be all, svg or text.');
  maximum ??= catalogueFor(options.format).length;
  if (!/^\d+$/.test(String(options.count)) || Number(options.count) < 1 || Number(options.count) > maximum) {
    throw new Error(`Choose a count between 1 and ${maximum}.`);
  }
  options.count = Number(options.count);
  if (!/^\d+$/.test(String(options.jobs)) || Number(options.jobs) < 1 || Number(options.jobs) > 8) throw new Error('--jobs must be between 1 and 8.');
  options.jobs = Number(options.jobs);
  if (options.model && !/^[\w.:/@-]{1,80}$/.test(options.model)) throw new Error('--model must be a plain model name.');
  if (options.seed && options.seed.length > 200) throw new Error('Keep the seed under 200 characters.');
  return options;
}

const clean = (value, limit = 300) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit);
const strings = (value, limit = 8) => Array.isArray(value) ? value.filter(item => typeof item === 'string').slice(0, limit).map(item => clean(item, 80)).filter(Boolean) : [];
const safeUrl = value => { try { const url = new URL(String(value)); return url.protocol === 'https:' && !url.username && !url.password ? `${url.origin}${url.pathname}`.replace(/\/$/, '') : ''; } catch { return ''; } };

export function normaliseProject(data) {
  let identity;
  try {
    identity = parseRepository(data.fullName || data.full_name);
    if (data.url && safeUrl(data.url) && !/^https:\/\/github\.com\//i.test(safeUrl(data.url))) throw new Error('Not GitHub');
  } catch {
    const fullName = clean(data.fullName || data.full_name || data.name, 120);
    if (!fullName) throw new Error('Project data needs a name.');
    const [owner, ...rest] = fullName.includes('/') ? fullName.split('/') : ['', fullName];
    identity = { owner, repo: rest.join('/') || fullName, fullName, url: safeUrl(data.url) };
  }
  const count = value => Number.isSafeInteger(value) && value >= 0 ? value : null;
  return {
    ...identity,
    name: clean(data.name || identity.repo, 100),
    description: clean(data.description, 240),
    languages: strings(data.languages || (data.language ? [data.language] : [])),
    topics: strings(data.topics, 12),
    sections: strings(data.sections, 8),
    stars: count(data.stars ?? data.stargazers_count),
    forks: count(data.forks ?? data.forks_count),
    license: clean(data.license && typeof data.license === 'object' ? data.license.spdx_id : data.license, 40) || 'UNSPECIFIED',
    defaultBranch: clean(data.defaultBranch || data.default_branch, 80) || 'main',
  };
}

export function readmeSummary(markdown) {
  const prose = markdown.replace(/<!--[\s\S]*?-->/g, '').replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/<[^>]*>/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  const paragraphs = prose.split(/\n\s*\n/).map(part => part.trim());
  return clean(paragraphs.find(part => !/^(?:#|[>|*-]|\d+\.)/.test(part) && part.length > 25)?.replace(/[*_`]/g, ''), 240);
}
export const readmeSections = readme => [...readme.matchAll(/^#{2,3}\s+(.+?)\s*#*\s*$/gm)]
  .map(match => match[1].replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, ''))
  .filter(section => !/README\.NFO header/i.test(section));

export async function ghToken({ env = process.env, spawnFn, resolve = resolveCommand } = {}) {
  const file = resolve('gh', { env });
  if (!file) return undefined;
  const result = await runCapture(file, ['auth', 'token'], { timeoutMs: 3000, env, ...(spawnFn ? { spawnFn } : {}) });
  const token = result.code === 0 ? result.stdout.trim() : '';
  return /^[\w-]{20,255}$/.test(token) ? token : undefined;
}

export async function fetchProject(repository, { fetcher = fetch, token, tokenSource = () => ghToken(), env = process.env, warn = () => {} } = {}) {
  token ??= env.GH_TOKEN || env.GITHUB_TOKEN || await tokenSource();
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'README.NFO-header-generator', 'X-GitHub-Api-Version': '2022-11-28' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const base = `https://api.github.com/repos/${repository.fullName}`;
  const request = (url, accept) => fetcher(url, { headers: { ...headers, ...(accept ? { Accept: accept } : {}) }, signal: AbortSignal.timeout(20000) });
  const response = await request(base);
  if (!response.ok) {
    if (response.status === 404) throw new Error('Repository not found or private. Run inside your project folder instead (no token needed), or sign in with gh auth login.');
    if (response.status === 403 || response.status === 429) throw new Error('GitHub access or rate limit blocked the request. Run inside your project folder instead, or try again later.');
    throw new Error(`GitHub returned HTTP ${response.status}. Try again later.`);
  }
  const metadata = await response.json();
  const extras = await Promise.allSettled([
    request(`${base}/languages`).then(async res => {
      if (!res.ok) throw new Error(`languages: HTTP ${res.status}`);
      const languages = await res.json();
      return Object.entries(languages).sort((a, b) => b[1] - a[1]).map(([name]) => name);
    }),
    request(`${base}/readme`, 'application/vnd.github.raw+json').then(async res => {
      if (res.status === 404) return '';
      if (!res.ok) throw new Error(`README: HTTP ${res.status}`);
      return (await res.text()).slice(0, 256000);
    }),
  ]);
  for (const result of extras) if (result.status === 'rejected') warn(`Using repository metadata only for ${result.reason.message}.`);
  const readme = extras[1].status === 'fulfilled' ? extras[1].value : '';
  return normaliseProject({ ...metadata, fullName: repository.fullName, url: repository.url,
    languages: extras[0].status === 'fulfilled' ? extras[0].value : undefined,
    description: metadata.description || readmeSummary(readme), sections: readmeSections(readme) });
}

// ---------- Local mode ----------

// The project root is the nearest folder with .git (directory or worktree file); without git, the
// nearest folder with a project manifest; otherwise the folder itself.
const MANIFESTS = ['package.json', 'pyproject.toml', 'Cargo.toml', 'go.mod'];
function nearest(start, test) {
  let directory = path.resolve(start);
  for (;;) {
    if (test(directory)) return directory;
    const parent = path.dirname(directory);
    if (parent === directory) return null;
    directory = parent;
  }
}
export function findProjectRoot(start = process.cwd()) {
  return nearest(start, directory => fs.existsSync(path.join(directory, '.git')))
    || nearest(start, directory => MANIFESTS.some(name => fs.existsSync(path.join(directory, name))))
    || path.resolve(start);
}
// The real git directory (handles `.git` files used by worktrees and submodules).
export function gitDirectory(root) {
  const dotGit = path.join(root, '.git');
  try {
    const stat = fs.lstatSync(dotGit);
    if (stat.isDirectory()) return dotGit;
    if (stat.isFile()) {
      const target = fs.readFileSync(dotGit, 'utf8').match(/^gitdir:\s*(.+)$/m)?.[1]?.trim();
      return target ? path.resolve(root, target) : null;
    }
  } catch {}
  return null;
}
export function gitCommonDirectory(root) {
  const directory = gitDirectory(root);
  if (!directory) return null;
  try { const common = fs.readFileSync(path.join(directory, 'commondir'), 'utf8').trim(); if (common) return path.resolve(directory, common); } catch {}
  return directory;
}
export function originRemote(root) {
  const directory = gitCommonDirectory(root);
  if (!directory) return null;
  let config; try { config = fs.readFileSync(path.join(directory, 'config'), 'utf8'); } catch { return null; }
  const sections = config.split(/^(?=\s*\[)/m);
  const remotes = sections.map(section => ({ name: section.match(/^\s*\[remote\s+"([^"]+)"\]/)?.[1], url: section.match(/^\s*url\s*=\s*(.+?)\s*$/m)?.[1] })).filter(remote => remote.name && remote.url);
  const remote = remotes.find(item => item.name === 'origin') || remotes[0];
  return remote ? parseRemote(remote.url) : null;
}
function currentBranch(root) {
  const directory = gitDirectory(root);
  try { return fs.readFileSync(path.join(directory, 'HEAD'), 'utf8').match(/^ref:\s*refs\/heads\/(.+)$/m)?.[1]?.trim(); } catch { return undefined; }
}

const LANGUAGES = { js: 'JavaScript', mjs: 'JavaScript', cjs: 'JavaScript', jsx: 'JavaScript', ts: 'TypeScript', tsx: 'TypeScript', mts: 'TypeScript', py: 'Python', rb: 'Ruby', go: 'Go', rs: 'Rust',
  java: 'Java', kt: 'Kotlin', kts: 'Kotlin', swift: 'Swift', c: 'C', h: 'C', cc: 'C++', cpp: 'C++', cxx: 'C++', hpp: 'C++', cs: 'C#', fs: 'F#', php: 'PHP', scala: 'Scala', dart: 'Dart',
  lua: 'Lua', r: 'R', jl: 'Julia', ex: 'Elixir', exs: 'Elixir', erl: 'Erlang', hs: 'Haskell', ml: 'OCaml', clj: 'Clojure', zig: 'Zig', nim: 'Nim', sh: 'Shell', bash: 'Shell',
  ps1: 'PowerShell', html: 'HTML', htm: 'HTML', css: 'CSS', scss: 'SCSS', sass: 'Sass', vue: 'Vue', svelte: 'Svelte', astro: 'Astro', sql: 'SQL', asm: 'Assembly', s: 'Assembly',
  m: 'Objective-C', mm: 'Objective-C++', pl: 'Perl', groovy: 'Groovy', tf: 'HCL', sol: 'Solidity', elm: 'Elm', v: 'V', ipynb: 'Jupyter Notebook', glsl: 'GLSL', wgsl: 'WGSL' };
const SKIP = new Set(['.git', 'node_modules', 'readme-headers', 'dist', 'build', 'out', 'target', 'vendor', '.venv', 'venv', '__pycache__', '.next', 'coverage']);

export function listFiles(root, { maxFiles = 20000 } = {}) {
  if (gitDirectory(root)) {
    const result = spawnSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 10000, maxBuffer: 64 * 1024 * 1024 });
    if (result.status === 0) return result.stdout.split('\0').filter(Boolean).slice(0, maxFiles);
  }
  const files = [], stack = [''];
  while (stack.length && files.length < maxFiles) {
    const relative = stack.pop();
    let entries; try { entries = fs.readdirSync(path.join(root, relative), { withFileTypes: true }); } catch { continue; }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const child = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) { if (!SKIP.has(entry.name) && !entry.name.startsWith('.')) stack.push(child); }
      else if (entry.isFile()) files.push(child);
    }
  }
  return files;
}
export function languagesByBytes(root, files) {
  const bytes = new Map();
  for (const file of files) {
    if (file.split('/').some(part => SKIP.has(part))) continue;
    const language = LANGUAGES[path.extname(file).slice(1).toLowerCase()];
    if (!language) continue;
    let size = 0; try { size = fs.statSync(path.join(root, file)).size; } catch { continue; }
    bytes.set(language, (bytes.get(language) || 0) + size);
  }
  return [...bytes].sort((a, b) => b[1] - a[1]).map(([language]) => language);
}

const readText = (file, limit = 256000) => { try { const stat = fs.lstatSync(file); if (!stat.isFile()) return ''; return fs.readFileSync(file, 'utf8').slice(0, limit); } catch { return ''; } };
// Tiny TOML reader for [section] key = "string" and key = ["a", "b"]: enough for names and descriptions.
export function tomlSection(text, section) {
  const lines = text.split(/\r?\n/), result = {};
  let inside = false;
  for (const line of lines) {
    const header = line.match(/^\s*\[([^\]]+)\]\s*$/);
    if (header) { inside = header[1].trim() === section; continue; }
    if (!inside) continue;
    const pair = line.match(/^\s*([\w-]+)\s*=\s*(.+?)\s*$/);
    if (!pair) continue;
    const value = pair[2];
    if (/^["']/.test(value)) result[pair[1]] = value.match(/^(["'])(.*?)\1/)?.[2];
    else if (value.startsWith('[')) result[pair[1]] = [...value.matchAll(/["']([^"']*)["']/g)].map(match => match[1]);
    else if (value.startsWith('{')) result[pair[1]] = value.match(/\b(?:text|file)\s*=\s*["']([^"']*)["']/)?.[1];
  }
  return result;
}
export function detectLicense(text) {
  if (!text) return '';
  if (/MIT License|Permission is hereby granted, free of charge/i.test(text)) return 'MIT';
  if (/Apache License,?\s+Version 2\.0/i.test(text)) return 'Apache-2.0';
  if (/GNU AFFERO GENERAL PUBLIC LICENSE/i.test(text)) return 'AGPL-3.0';
  if (/GNU LESSER GENERAL PUBLIC LICENSE/i.test(text)) return 'LGPL-3.0';
  if (/GNU GENERAL PUBLIC LICENSE\s+Version 3/i.test(text)) return 'GPL-3.0';
  if (/GNU GENERAL PUBLIC LICENSE\s+Version 2/i.test(text)) return 'GPL-2.0';
  if (/Mozilla Public License,?\s+(?:Version|v\.)\s*2\.0/i.test(text)) return 'MPL-2.0';
  if (/ISC License|Permission to use, copy, modify, and\/or distribute/i.test(text)) return 'ISC';
  if (/Redistribution and use in source and binary forms/i.test(text)) return /Neither the name/i.test(text) ? 'BSD-3-Clause' : 'BSD-2-Clause';
  if (/This is free and unencumbered software released into the public domain/i.test(text)) return 'Unlicense';
  return '';
}
export function findReadme(root) {
  let entries; try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch { return null; }
  const candidates = entries.filter(entry => /^readme(?:\.(?:md|markdown))?$/i.test(entry.name)).map(entry => entry.name);
  const order = name => ['README.md', 'readme.md', 'Readme.md'].indexOf(name) + 1 || (/\.(md|markdown)$/i.test(name) ? 4 : 5);
  candidates.sort((a, b) => order(a) - order(b) || a.localeCompare(b));
  return candidates.length ? path.join(root, candidates[0]) : null;
}

export function readLocalProject(start = process.cwd(), { files: listed } = {}) {
  const root = findProjectRoot(start);
  const remote = originRemote(root);
  const folder = path.basename(root);
  const pkg = (() => { try { return JSON.parse(readText(path.join(root, 'package.json'))); } catch { return {}; } })() || {};
  const pyproject = readText(path.join(root, 'pyproject.toml'));
  const python = { ...tomlSection(pyproject, 'tool.poetry'), ...tomlSection(pyproject, 'project') };
  const cargo = tomlSection(readText(path.join(root, 'Cargo.toml')), 'package');
  const goModule = readText(path.join(root, 'go.mod')).match(/^module\s+(\S+)/m)?.[1];
  const readmeFile = findReadme(root);
  const readme = readmeFile ? readText(readmeFile) : '';
  const licenseFile = (() => { try { return fs.readdirSync(root).find(name => /^(?:licen[cs]e|copying)(?:\.(?:md|txt))?$/i.test(name)); } catch { return undefined; } })();
  const manifestName = [typeof pkg.name === 'string' ? pkg.name.replace(/^@[^/]+\//, '') : '', python.name, cargo.name, goModule?.split('/').at(-1)].find(value => typeof value === 'string' && /^[\w.-]{1,100}$/.test(value));
  const readmeTitle = readme.match(/^#\s+([^\n#<]{1,80}?)\s*$/m)?.[1]?.replace(/[*_`]/g, '').trim();
  const name = remote?.repo || manifestName || folder;
  const pkgLicense = typeof pkg.license === 'string' ? pkg.license : '';
  const files = listed || listFiles(root);
  return {
    root, readmeFile,
    project: normaliseProject({
      fullName: remote ? `${remote.owner}/${remote.repo}` : name,
      url: remote?.url,
      name: readmeTitle && readmeTitle.toLowerCase().replace(/[^a-z0-9]/g, '') === name.toLowerCase().replace(/[^a-z0-9]/g, '') ? readmeTitle : name,
      description: [pkg.description, python.description, cargo.description].find(value => typeof value === 'string' && value.trim()) || readmeSummary(readme),
      languages: languagesByBytes(root, files),
      topics: [pkg.keywords, python.keywords, cargo.keywords].find(Array.isArray) || [],
      sections: readmeSections(readme),
      license: detectLicense(licenseFile ? readText(path.join(root, licenseFile)) : '') || pkgLicense || python.license || cargo.license || '',
      defaultBranch: currentBranch(root),
    }),
  };
}
