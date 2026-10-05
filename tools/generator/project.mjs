// Public GitHub data is input, never executable code. Generation needs no dependencies.
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

export function parseArguments(args, maximum = 12) {
  const options = { count: 10 };
  const valued = new Set(['repo', 'count', 'out', 'seed', 'project']);
  const assigned = new Set();
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') { options.help = true; continue; }
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
      options[key] = value; assigned.add(key);
    } else {
      if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}. Use --help.`);
      if (assigned.has('repo')) throw new Error('Supply one repository.');
      options.repo = arg; assigned.add('repo');
    }
  }
  if (options.help) return options;
  if (Boolean(options.repo) === Boolean(options.project)) throw new Error('Supply a GitHub repository, or --project project.json.');
  if (!/^\d+$/.test(String(options.count)) || Number(options.count) < 1 || Number(options.count) > maximum) {
    throw new Error(`Choose a count between 1 and ${maximum}.`);
  }
  options.count = Number(options.count);
  if (options.repo) options.repository = parseRepository(options.repo);
  if (options.seed && options.seed.length > 200) throw new Error('Keep the seed under 200 characters.');
  return options;
}

const clean = (value, limit = 300) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit);
const strings = (value, limit = 8) => Array.isArray(value) ? value.filter(item => typeof item === 'string').slice(0, limit).map(item => clean(item, 80)).filter(Boolean) : [];

export function normaliseProject(data) {
  const repository = parseRepository(data.fullName || data.full_name);
  const count = value => Number.isSafeInteger(value) && value >= 0 ? value : null;
  return {
    ...repository,
    name: clean(data.name || repository.repo, 100),
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

function readmeSummary(markdown) {
  const prose = markdown.replace(/<!--[\s\S]*?-->/g, '').replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/<[^>]*>/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  const paragraphs = prose.split(/\n\s*\n/).map(part => part.trim());
  return clean(paragraphs.find(part => !/^(?:#|[>|*-]|\d+\.)/.test(part) && part.length > 25)?.replace(/[*_`]/g, ''), 240);
}

export async function fetchProject(repository, { fetcher = fetch, token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN, warn = () => {} } = {}) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'README.NFO-header-generator', 'X-GitHub-Api-Version': '2022-11-28' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const base = `https://api.github.com/repos/${repository.fullName}`;
  const request = (url, accept) => fetcher(url, { headers: { ...headers, ...(accept ? { Accept: accept } : {}) }, signal: AbortSignal.timeout(20000) });
  const response = await request(base);
  if (!response.ok) {
    if (response.status === 404) throw new Error('Repository not found or private. Check the URL; private repositories need GH_TOKEN.');
    if (response.status === 403 || response.status === 429) throw new Error('GitHub access or rate limit blocked the request. Set GH_TOKEN or try again later.');
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
      // Bound processing even for unusually large READMEs.
      return (await res.text()).slice(0, 256000);
    }),
  ]);
  for (const result of extras) if (result.status === 'rejected') warn(`Using repository metadata only for ${result.reason.message}.`);
  const readme = extras[1].status === 'fulfilled' ? extras[1].value : '';
  const sections = [...readme.matchAll(/^#{2,3}\s+(.+?)\s*#*\s*$/gm)]
    .map(match => match[1].replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, ''));
  return normaliseProject({ ...metadata, fullName: repository.fullName,
    languages: extras[0].status === 'fulfilled' ? extras[0].value : undefined,
    description: metadata.description || readmeSummary(readme), sections });
}
