// Real facts for the page chrome: file list and commit data from git (origin/main when present),
// stars, languages, contributors and releases from the public GitHub API, cached for a day so four
// concept builders share one set of requests. Anything unavailable is left out rather than invented.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const REPO = 'lukexyz/README.NFO';
const DAY = 24 * 3600 * 1000;
const GIT_CACHE_VERSION = 2;
const LANG_COLORS = { HTML: '#e34c26', JavaScript: '#f1e05a', CSS: '#663399', TypeScript: '#3178c6', Python: '#3572A5', Shell: '#89e051', PowerShell: '#012456', Batchfile: '#C1F12E', Makefile: '#427819' };

const git = (root, args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 1));
  fs.renameSync(tmp, file);
}
const readJson = (file) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } };

function gitFacts(root, cacheDir) {
  let ref = 'origin/main';
  try { git(root, ['rev-parse', '--verify', '--quiet', ref]); } catch { ref = 'HEAD'; }
  let sha;
  try { sha = git(root, ['rev-parse', ref]); } catch { return null; }
  const cacheFile = path.join(cacheDir, 'git.json');
  const cached = readJson(cacheFile);
  if (cached && cached.sha === sha && cached.v === GIT_CACHE_VERSION) return cached;
  const [, short, author, subject, date] = git(root, ['log', '-1', '--format=%H%x1f%h%x1f%an%x1f%s%x1f%cI', ref]).split('\x1f');
  const tree = git(root, ['ls-tree', ref]).split('\n').filter(Boolean).map((line) => {
    const [meta, name] = line.split('\t');
    return { type: meta.split(' ')[1], name };
  });
  const entries = tree.map(({ type, name }) => {
    let shown = name;
    // GitHub collapses chains of single-child folders (".github/workflows").
    while (type === 'tree') {
      const kids = git(root, ['ls-tree', `${ref}:${shown}`]).split('\n').filter(Boolean);
      if (kids.length !== 1 || !/^\d+ tree /.test(kids[0])) break;
      shown = `${shown}/${kids[0].split('\t')[1]}`;
    }
    const [message, when] = git(root, ['log', '-1', '--format=%s%x1f%cI', ref, '--', name]).split('\x1f');
    return { name: shown, dir: type === 'tree', message, date: when };
  }).sort((a, b) => (a.dir === b.dir ? (a.name < b.name ? -1 : 1) : a.dir ? -1 : 1)); // folders first, then byte order like GitHub
  let branches = 0;
  try {
    branches = git(root, ['for-each-ref', '--format=%(refname)', ref === 'HEAD' ? 'refs/heads' : 'refs/remotes/origin'])
      .split('\n').filter((r) => r && !/\/HEAD$/.test(r)).length;
  } catch { /* leave 0 */ }
  let tags = 0;
  try { tags = git(root, ['tag', '-l']).split('\n').filter(Boolean).length; } catch { /* leave 0 */ }
  const facts = { v: GIT_CACHE_VERSION, sha, ref, short, author, subject, date, commits: Number(git(root, ['rev-list', '--count', ref])), entries, branches, tags };
  writeJson(cacheFile, facts);
  return facts;
}

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'readme-nfo-front-page-preview' }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function apiFacts(cacheDir, offline) {
  const cacheFile = path.join(cacheDir, 'github.json');
  const cached = readJson(cacheFile);
  if (offline || (cached && Date.now() - cached.fetchedAt < DAY)) return cached;
  try {
    const base = `https://api.github.com/repos/${REPO}`;
    const repo = await getJson(base);
    const [languages, contributors, releases, owner] = await Promise.all([
      getJson(`${base}/languages`).catch(() => null),
      getJson(`${base}/contributors?per_page=100`).catch(() => null),
      getJson(`${base}/releases?per_page=1`).catch(() => null),
      getJson(`https://api.github.com/users/${repo.owner.login}`).catch(() => null),
    ]);
    const total = languages ? Object.values(languages).reduce((a, b) => a + b, 0) : 0;
    const facts = {
      fetchedAt: Date.now(),
      description: repo.description,
      homepage: repo.homepage,
      topics: repo.topics || [],
      stars: repo.stargazers_count,
      watching: repo.subscribers_count,
      forks: repo.forks_count,
      license: repo.license && repo.license.spdx_id && repo.license.spdx_id !== 'NOASSERTION' ? `${repo.license.spdx_id} license` : null,
      visibility: repo.private ? 'Private' : 'Public',
      owner: { login: repo.owner.login, avatar: repo.owner.avatar_url, name: owner && owner.name },
      languages: languages && total ? Object.entries(languages).map(([name, bytes]) => ({ name, pct: Math.round((bytes / total) * 1000) / 10, color: LANG_COLORS[name] || '#8b949e' })) : null,
      contributors: Array.isArray(contributors) ? contributors.map((c) => ({ login: c.login, avatar: c.avatar_url, name: c.login === repo.owner.login && owner ? owner.name : null })) : null,
      releases: Array.isArray(releases) ? releases.length : null,
    };
    writeJson(cacheFile, facts);
    return facts;
  } catch (err) {
    if (cached) return { ...cached, stale: String(err.message || err) };
    return null;
  }
}

export function relativeTime(iso, now = Date.now()) {
  // Mirrors GitHub's relative-time element: round to one unit, 6+ days becomes weeks.
  let ms = Math.max(0, now - Date.parse(iso));
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 55) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const totalHours = ms / 3600000;
  let days = Math.floor(totalHours / 24);
  const hours = totalHours - days * 24;
  if (days && hours >= 12) days += 1;
  if (!days && hours >= 21) days = 1;
  if (!days) { const h = Math.max(1, Math.round(totalHours)); return `${h} hour${h === 1 ? '' : 's'} ago`; }
  if (days === 1) return 'yesterday';
  if (days < 6) return `${days} days ago`;
  if (days < 27) { const w = Math.max(1, Math.round(days / 7)); return w === 1 ? 'last week' : `${w} weeks ago`; }
  const months = Math.round(days / 30.44);
  if (months < 12) return months <= 1 ? 'last month' : `${months} months ago`;
  const years = Math.round(days / 365.25);
  return years <= 1 ? 'last year' : `${years} years ago`;
}

export async function repoMeta({ repoRoot, cacheDir, offline = false }) {
  let gitData = null;
  try { gitData = gitFacts(repoRoot, cacheDir); } catch { gitData = null; }
  const api = await apiFacts(cacheDir, offline);
  let pkg = null;
  try { pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')); } catch { /* ignore */ }
  const [owner, name] = REPO.split('/');
  return {
    owner,
    name,
    visibility: api ? api.visibility : 'Public',
    description: (api && api.description) || (pkg && pkg.description) || null,
    license: (api && api.license) || (pkg && pkg.license ? `${pkg.license} license` : null),
    api,
    git: gitData,
  };
}
