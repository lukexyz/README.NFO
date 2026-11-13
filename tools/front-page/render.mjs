#!/usr/bin/env node
// Render a front-page concept README the way github.com shows it.
//   node tools/front-page/render.mjs <conceptDir> [--local] [--refresh] [--offline]
// Reads <conceptDir>/README.md, renders it with
// GitHub's own Markdown API (cached by content hash in <conceptDir>/.render-cache/), falls back to a
// local GitHub-flavoured renderer when the API is unreachable or rate-limited, lints it against the
// README constraints and writes <conceptDir>/preview.html: a signed-out github.com repository page.
// A README under comparisons/ is written as if it were the repository's root README (links from the
// root); anywhere else (docs/front-page/<design>/, or the root README itself) it links from its own folder.
//   --local    skip the API and use the local renderer
//   --refresh  ignore the render cache and ask the API again
//   --offline  no network at all (cached API render if present, else local; cached repo facts only)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderLocal } from './lib/local-gfm.mjs';
import { lint } from './lib/lint.mjs';
import { repoMeta } from './lib/meta.mjs';
import { buildPage, MD_CSS_CDN, COPY_ICON, CHECK_ICON, LINK_ICON_PATH } from './lib/page.mjs';

const TOOLS = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(TOOLS, '..', '..');
const CACHE = path.join(TOOLS, '.cache');
const REPO = 'lukexyz/README.NFO';
const PREP_VERSION = 'gfm-softbreak-marker-1';
const KEEP_BR = '<br id="nfo-keep-br">';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const [target] = args.filter((a) => !a.startsWith('--'));
if (!target) {
  console.error('usage: node tools/front-page/render.mjs <conceptDir> [--local] [--refresh] [--offline]');
  process.exit(2);
}
const conceptDir = path.resolve(/\.md$/i.test(target) ? path.dirname(target) : target);
const readmePath = /\.md$/i.test(target) ? path.resolve(target) : path.join(conceptDir, 'README.md');
if (!fs.existsSync(readmePath)) {
  console.error(`No README.md in ${conceptDir}`);
  process.exit(2);
}
const concept = path.basename(conceptDir);
const markdown = fs.readFileSync(readmePath, 'utf8');
const offline = flags.has('--offline');
const rootRelative = conceptDir.startsWith(path.join(REPO_ROOT, 'comparisons') + path.sep);
const linkBase = rootRelative ? REPO_ROOT : conceptDir;

// ---------- GitHub API ----------
// mode "gfm" renders like an issue comment, turning every soft line break into <br>. A README does
// not, so mark the breaks the author meant (<br> tags and hard breaks) and drop the rest afterwards.
function prepareForApi(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  let fence = null;
  return lines.map((line, i) => {
    const open = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      const close = line.match(/^ {0,3}(`+|~+)\s*$/);
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) fence = null;
      return line;
    }
    if (open) { fence = open[1]; return line; }
    const spans = [];
    let out = line.replace(/(`+)(?!`)[\s\S]*?[^`]\1(?!`)/g, (m) => `\u0000${spans.push(m) - 1}\u0000`);
    out = out.replace(/<br\s*\/?>/gi, KEEP_BR);
    const next = lines[i + 1];
    const text = out.trim();
    if (next !== undefined && next.trim() !== '' && /(?: {2,}|\\)$/.test(out) && text && !/^</.test(text) && !/>\s*\\?$/.test(out)
      && !/^ {0,3}(#|\||[-*_]{3,}\s*$)/.test(out)) {
      out = out.replace(/(?: {2,}|\\)$/, KEEP_BR);
    }
    return out.replace(/\u0000(\d+)\u0000/g, (m, k) => spans[Number(k)]);
  }).join('\n');
}
function finishApiHtml(html) {
  return html
    .replace(/(<pre\b[\s\S]*?<\/pre>)|<br>\n/g, (m, pre) => pre || '\n')
    .replace(/<br id="user-content-nfo-keep-br">/g, '<br>');
}

async function renderWithApi() {
  const key = crypto.createHash('sha256').update(`${PREP_VERSION}\n${markdown}`).digest('hex');
  const cacheDir = path.join(conceptDir, '.render-cache');
  const cacheFile = path.join(cacheDir, `${key}.html`);
  if (!flags.has('--refresh') && fs.existsSync(cacheFile)) {
    return { html: finishApiHtml(fs.readFileSync(cacheFile, 'utf8')), label: 'GitHub API (cached)', note: `cache ${path.relative(REPO_ROOT, cacheFile)}` };
  }
  if (offline) throw new Error('offline and no cached API render');
  let res;
  try {
    res = await fetch('https://api.github.com/markdown', {
      method: 'POST',
      headers: { Accept: 'text/html', 'Content-Type': 'application/json', 'User-Agent': 'readme-nfo-front-page-preview', 'X-GitHub-Api-Version': '2022-11-28' },
      body: JSON.stringify({ text: prepareForApi(markdown), mode: 'gfm', context: REPO }),
      signal: AbortSignal.timeout(30000),
    });
  } catch (err) {
    throw new Error(`api.github.com unreachable (${err.cause?.code || err.message})`);
  }
  const remaining = res.headers.get('x-ratelimit-remaining');
  if (!res.ok) {
    const reset = Number(res.headers.get('x-ratelimit-reset'));
    const when = reset ? ` until ${new Date(reset * 1000).toLocaleTimeString()}` : '';
    throw new Error(res.status === 403 || res.status === 429 ? `rate-limited${when} (60 requests/hour unauthenticated)` : `HTTP ${res.status}`);
  }
  const raw = await res.text();
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(cacheFile, raw);
  return { html: finishApiHtml(raw), label: 'GitHub API', note: `${remaining ?? '?'} API requests left this hour` };
}

// ---------- shared post-processing ----------
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&amp;/g, '&');
const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function headingAnchors(html) {
  const used = new Map();
  return html.replace(/<h([1-6])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g, (m, level, attrs = '', inner) => {
    if (/sr-only|class="anchor"/.test(attrs + inner)) return m;
    const text = decode(inner.replace(/<[^>]+>/g, '')).trim();
    let slug = text.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, '').replace(/ /g, '-');
    const n = used.get(slug) || 0;
    used.set(slug, n + 1);
    if (n) slug = `${slug}-${n}`;
    return `<h${level}${attrs}><a id="user-content-${escAttr(slug)}" class="anchor" aria-label="Permalink: ${escAttr(text)}" href="#${escAttr(slug)}"><svg class="octicon octicon-link" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="${LINK_ICON_PATH}"></path></svg></a>${inner}</h${level}>`;
  });
}

function copyButtons(html) {
  const button = (pre) => {
    const text = decode(pre.replace(/^<pre\b[^>]*>/, '').replace(/<\/pre>$/, '').replace(/<[^>]+>/g, '')).replace(/\n$/, '');
    return `<div class="zeroclipboard-container"><button type="button" class="pv-copy" aria-label="Copy code to clipboard" value="${escAttr(text)}" data-copy="${escAttr(COPY_ICON)}" data-check="${escAttr(CHECK_ICON)}">${COPY_ICON}</button></div>`;
  };
  const held = [];
  html = html.replace(/(<div class="highlight[^"]*"[^>]*>)(<pre\b[\s\S]*?<\/pre>)(<\/div>)/g, (m, open, pre, close) => `\u0001${held.push(`${open}${pre}${button(pre)}${close}`) - 1}\u0001`);
  html = html.replace(/<pre\b[\s\S]*?<\/pre>/g, (pre) => `<div class="snippet-clipboard-content notranslate position-relative overflow-auto">${pre}${button(pre)}</div>`);
  return html.replace(/\u0001(\d+)\u0001/g, (m, k) => held[Number(k)]);
}

// Keep a local copy of the markdown CSS so the preview still styles offline.
async function vendorCss() {
  const out = {};
  for (const theme of ['light', 'dark']) {
    const file = path.join(CACHE, path.basename(MD_CSS_CDN[theme]));
    if (!fs.existsSync(file) && !offline) {
      try {
        const res = await fetch(MD_CSS_CDN[theme], { signal: AbortSignal.timeout(15000) });
        if (res.ok) {
          fs.mkdirSync(CACHE, { recursive: true });
          const tmp = `${file}.${process.pid}.tmp`;
          fs.writeFileSync(tmp, await res.text());
          fs.renameSync(tmp, file);
        }
      } catch { /* the CDN link still works online */ }
    }
    if (fs.existsSync(file)) out[theme] = path.relative(conceptDir, file).split(path.sep).join("/");
  }
  return out;
}

// ---------- main ----------
let rendered;
let fallbackReason = null;
if (flags.has('--local')) {
  fallbackReason = '--local';
} else {
  try { rendered = await renderWithApi(); } catch (err) { fallbackReason = err.message; }
}
let localWarnings = [];
if (!rendered) {
  const local = renderLocal(markdown);
  localWarnings = local.warnings;
  rendered = { html: local.html, label: 'local renderer', note: `fallback: ${fallbackReason}` };
}

const readmeHtml = copyButtons(headingAnchors(rendered.html));
const [meta, localCss] = await Promise.all([repoMeta({ repoRoot: REPO_ROOT, cacheDir: CACHE, offline }), vendorCss()]);
const page = buildPage({
  concept,
  readmeHtml,
  meta,
  // Relative, so the preview works from file:// and from a local web server.
  // READMEs under comparisons/ are written as if at the repo root; anywhere else they link from their own folder.
  repoRootUrl: rootRelative ? `${path.relative(conceptDir, REPO_ROOT).split(path.sep).join('/') || '.'}/` : './',
  localCss,
  renderer: rendered.label,
});
const out = path.join(conceptDir, 'preview.html');
fs.writeFileSync(out, page);

const { report, counts } = lint(markdown, linkBase);
const pad = (s) => s.padEnd(9);
console.log(`README.NFO front-page preview: ${concept}`);
console.log(`  ${pad('renderer')}${rendered.label} (${rendered.note})`);
if (meta.api?.stale) console.log(`  ${pad('repo')}using cached repository facts (${meta.api.stale})`);
if (!meta.api) console.log(`  ${pad('repo')}repository facts unavailable: stars, languages and contributors left out`);
console.log(`  ${pad('preview')}${out}`);
console.log(`  ${pad('open')}${pathToFileURL(out).href}#dark-desktop   (or #light-mobile, #dark-mobile ...)`);
console.log(`  ${pad('lint')}${counts.errors} error${counts.errors === 1 ? '' : 's'}, ${counts.warnings} warning${counts.warnings === 1 ? '' : 's'}`);
for (const [level, msg] of report) console.log(`    ${level === 'ok' ? '  ' : level === 'info' ? '· ' : `${level} `}${msg}`);
for (const w of localWarnings) console.log(`    local renderer: ${w}`);
console.log(`  next     node ${path.join(TOOLS, 'shoot.mjs').replace(/\\/g, '/')} ${conceptDir.replace(/\\/g, '/')}`);
