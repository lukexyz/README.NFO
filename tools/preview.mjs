// GitHub-ish README preview + lint.
//   node tools/preview.mjs <file.md|file.svg> <outDir> [--times=0,1500,3000] [--width=830] [--mobile]
// Markdown: renders an approximation of github.com's README box (light + dark),
// strips what GitHub's sanitizer strips, lints code-block widths/characters and image refs.
// SVG: renders it the way GitHub does (inside <img>: no scripts, no external fetches).
// Needs `npm install` (Playwright) once; `npx playwright install chromium` if no browser is cached.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const flag = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=')[1] : fallback;
};
const [input, outDir] = positional;
if (!input || !outDir) {
  console.error('usage: node tools/preview.mjs <file.md|file.svg> <outDir> [--times=0,1500] [--width=830] [--mobile]');
  process.exit(2);
}
const times = flag('times', '0').split(',').map(Number);
const contentWidth = Number(flag('width', '830'));
const mobile = args.includes('--mobile');
fs.mkdirSync(outDir, { recursive: true });
const abs = path.resolve(input);
const base = path.basename(abs).replace(/\.[^.]+$/, '');
const warnings = [];
const warn = (m) => warnings.push(m);

// ---------- column width helpers ----------
const WIDE = /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]|\p{Extended_Pictographic}/u;
const colWidth = (line) => {
  let w = 0;
  for (const ch of line.replace(/\uFE0F/g, '')) w += WIDE.test(ch) ? 2 : 1;
  return w;
};
// Block elements, box drawing, shades, basic geometric shapes and Latin-1 are safe in GitHub's mono stack.
const SAFE_NON_ASCII = /[\u00A0-\u00FF\u2500-\u259F\u25A0-\u25FF\u2190-\u21FF\u2022\u2026\u2013\u2014\u2018\u2019\u201C\u201D\u266A\u266B\u2665\u2666\u2663\u2660\u00B7\u2219\u2591-\u2593]/u;

// ---------- GitHub sanitizer approximation ----------
const ALLOWED_TAGS = new Set('h1 h2 h3 h4 h5 h6 h7 h8 br b i strong em a pre code img tt div ins del sup sub p picture ol ul table thead tbody tfoot blockquote dl dt dd kbd q samp var hr ruby rt rp li tr td th s strike summary details caption figure figcaption abbr bdo cite dfn mark small source span time wbr'.split(' '));
const DROP_WITH_CONTENT = new Set(['script', 'style', 'svg', 'iframe', 'object', 'embed', 'audio', 'video', 'canvas', 'math', 'marquee', 'blink']);
function sanitize(html, where) {
  for (const t of DROP_WITH_CONTENT) {
    const re = new RegExp(`<${t}\\b[\\s\\S]*?<\\/${t}>|<${t}\\b[^>]*\\/?>`, 'gi');
    if (re.test(html)) warn(`${where}: <${t}> is stripped by GitHub (removed in preview)`);
    html = html.replace(re, '');
  }
  html = html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (tag, name) => {
    if (!ALLOWED_TAGS.has(name.toLowerCase())) {
      warn(`${where}: <${name}> is not allowed by GitHub (tag removed, text kept)`);
      return '';
    }
    return tag
      .replace(/\s(style|class|id|onload|onclick|onerror)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, (m, attr) => {
        warn(`${where}: ${attr}="..." attribute is stripped by GitHub`);
        return '';
      });
  });
  return html;
}

// ---------- minimal GitHub-flavoured markdown ----------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function inline(text) {
  const codes = [];
  text = text.replace(/`([^`]+)`/g, (m, c) => `\u0000${codes.push(esc(c)) - 1}\u0000`);
  text = text
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/(^|\W)_([^_\s][^_]*)_(?=\W|$)/g, '$1<em>$2</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    .replace(/(?: {2,}|\\)\n/g, '<br>\n');
  if (/\$[^$\n]+\$/.test(text)) warn('inline $math$ found: GitHub renders it with MathJax, preview shows raw text');
  return text.replace(/\u0000(\d+)\u0000/g, (m, i) => `<code>${codes[i]}</code>`);
}
function renderMarkdown(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  const codeBlocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const fence = line.match(/^(\s{0,3})(`{3,}|~{3,})\s*([\w+-]*)/);
    if (fence) {
      const body = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(fence[2])) body.push(lines[i++]);
      i++;
      codeBlocks.push({ kind: `fenced ${fence[3] || '(no lang)'}`, lines: body, at: out.length });
      out.push(`<div class="highlight"><pre><code>${esc(body.join('\n'))}</code></pre></div>`);
      continue;
    }
    if (/^\s*<pre\b/i.test(line)) {
      const body = [line];
      while (!/<\/pre>/i.test(lines[i]) && i + 1 < lines.length) body.push(lines[++i]);
      i++;
      const raw = body.join('\n');
      const text = raw.replace(/^[\s\S]*?<pre\b[^>]*>/i, '').replace(/<\/pre>[\s\S]*$/i, '')
        .replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#\d+;/g, 'x');
      codeBlocks.push({ kind: 'html <pre>', lines: text.split('\n'), at: out.length });
      out.push(sanitize(raw, 'html <pre>'));
      continue;
    }
    if (/^\s*<[a-zA-Z!/]/.test(line)) {
      const body = [];
      while (i < lines.length && lines[i].trim() !== '') body.push(lines[i++]);
      out.push(sanitize(body.join('\n'), 'html block'));
      continue;
    }
    if (line.trim() === '') { i++; continue; }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }
    if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
    if (/^\s*>/.test(line)) {
      const body = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ''));
      out.push(`<blockquote>${renderMarkdown(body.join('\n')).html}</blockquote>`);
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) {
      const row = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = row(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(row(lines[i++]));
      out.push(`<table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
      continue;
    }
    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*([-*+]|\d+\.)\s+/, ''));
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((t) => `<li>${sanitize(inline(t), 'list')}</li>`).join('')}</${tag}>`);
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,6}\s|```|~~~|\s*<pre|\s*>|\s*\|)/.test(lines[i])) para.push(lines[i++]);
    if (!para.length) { out.push(`<p>${esc(lines[i++])}</p>`); continue; }
    out.push(`<p>${sanitize(inline(para.join('\n')), 'paragraph')}</p>`);
  }
  return { html: out.join('\n'), codeBlocks };
}

const CSS = `
:root{color-scheme:light}
body{margin:0;padding:24px;background:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif;}
.box{width:${contentWidth + 66}px;border:1px solid #d1d9e0;border-radius:6px;background:#fff}
.box-head{padding:8px 16px;border-bottom:1px solid #d1d9e0;font-size:14px;font-weight:600;color:#1f2328}
.markdown-body{padding:32px;color:#1f2328;font-size:16px;line-height:1.5;word-wrap:break-word}
.markdown-body>*:first-child{margin-top:0!important}
h1,h2,h3,h4,h5,h6{margin-top:24px;margin-bottom:16px;font-weight:600;line-height:1.25}
h1{font-size:2em;padding-bottom:.3em;border-bottom:1px solid #d1d9e0b3}
h2{font-size:1.5em;padding-bottom:.3em;border-bottom:1px solid #d1d9e0b3}
p,blockquote,ul,ol,table,pre,details{margin-top:0;margin-bottom:16px}
a{color:#0969da;text-decoration:underline;text-underline-offset:.2rem}
img{max-width:100%;box-sizing:content-box;border-style:none}
code,pre,tt,kbd,samp{font-family:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace}
code{padding:.2em .4em;font-size:85%;background:#818b981f;border-radius:6px}
pre{padding:16px;overflow:auto;font-size:85%;line-height:1.45;color:#1f2328;background:#f6f8fa;border-radius:6px;word-wrap:normal}
pre code{padding:0;background:transparent;font-size:100%;white-space:pre}
blockquote{padding:0 1em;color:#59636e;border-left:.25em solid #d1d9e0}
hr{height:.25em;padding:0;margin:24px 0;background:#d1d9e0;border:0}
table{border-spacing:0;border-collapse:collapse;display:block;width:max-content;max-width:100%;overflow:auto}
td,th{padding:6px 13px;border:1px solid #d1d9e0}
tr:nth-child(2n){background:#f6f8fa}
kbd{display:inline-block;padding:3px 5px;font-size:11px;line-height:10px;color:#1f2328;background:#f6f8fa;border:1px solid #d1d9e0b3;border-bottom-color:#d1d9e0b3;border-radius:6px;box-shadow:inset 0 -1px 0 #d1d9e0b3}
sub,sup{font-size:75%}
summary{cursor:pointer}
@media (prefers-color-scheme:dark){
 :root{color-scheme:dark}
 body,.box{background:#0d1117}
 .box,.box-head{border-color:#3d444d}
 .box-head,.markdown-body,pre{color:#f0f6fc}
 h1,h2{border-bottom-color:#3d444db3}
 a{color:#4493f8}
 pre,tr:nth-child(2n){background:#151b23}
 code{background:#656c7633}
 blockquote{color:#9198a1;border-left-color:#3d444d}
 hr{background:#3d444d}
 td,th{border-color:#3d444d}
 kbd{color:#f0f6fc;background:#151b23;border-color:#3d444db3}
}`;

function lintCodeBlocks(codeBlocks) {
  const report = [];
  codeBlocks.forEach((b, n) => {
    const widths = b.lines.map(colWidth);
    const max = Math.max(0, ...widths);
    const issues = [];
    b.lines.forEach((l, k) => {
      if (l.includes('\t')) issues.push(`line ${k + 1}: TAB character (renders at unpredictable width)`);
      if (/\s+$/.test(l)) issues.push(`line ${k + 1}: trailing whitespace`);
      for (const ch of l) {
        const cp = ch.codePointAt(0);
        if (cp > 127 && !SAFE_NON_ASCII.test(ch)) issues.push(`line ${k + 1}: risky char U+${cp.toString(16).toUpperCase().padStart(4, '0')} "${ch}" (may not be single-width in GitHub's mono fonts)`);
      }
    });
    if (max > 100) issues.push(`max width ${max} cols: will horizontally scroll on github.com desktop (keep <= 80, hard limit ~96)`);
    else if (max > 80) issues.push(`max width ${max} cols: over the classic 80-col NFO width; fits desktop github but tight`);
    report.push(`code block #${n + 1} [${b.kind}]: ${b.lines.length} lines, max ${max} cols${issues.length ? '' : ', clean'}`);
    const seen = new Set();
    for (const s of issues) {
      const key = s.replace(/^line \d+: /, '');
      if (seen.has(key) && seen.size > 12) continue;
      seen.add(key);
      report.push(`   - ${s}`);
    }
  });
  return report;
}

function lintSvg(file) {
  const out = [];
  const src = fs.readFileSync(file, 'utf8');
  const kb = (fs.statSync(file).size / 1024).toFixed(1);
  out.push(`svg ${path.basename(file)}: ${kb} KB`);
  if (fs.statSync(file).size > 400 * 1024) out.push('   - over 400 KB: slow on github, consider simplifying');
  if (/<script\b/i.test(src)) out.push('   - <script> never runs inside <img> on GitHub');
  if (/(?:href|src)\s*=\s*["'](?!#|data:)[^"']+/i.test(src)) out.push('   - external href/src: blocked inside <img>; inline it as data: or draw it');
  if (/@import|url\(\s*["']?https?:/i.test(src)) out.push('   - external CSS/@import/url(http): blocked inside <img>');
  if (/<foreignObject\b/i.test(src)) out.push('   - <foreignObject>: renders inconsistently across browsers/GitHub; avoid');
  if (/<text\b/i.test(src) && !/font-family[^;"]*monospace|font-family[^;"]*sans-serif|font-family[^;"]*serif|@font-face/i.test(src)) out.push('   - <text> without a generic font fallback: font will vary per viewer');
  if (/<text\b/i.test(src) && !/@font-face/i.test(src)) out.push('   - note: <text> uses the viewer\'s system fonts (not identical everywhere). Pixel fonts drawn as <rect>/<path> are exact.');
  if (!/viewBox=/i.test(src)) out.push('   - no viewBox: will not scale down cleanly on narrow screens');
  if (!/@keyframes|<animate|<animateTransform|<animateMotion|<set\b/i.test(src)) out.push('   - (static: no CSS keyframes or SMIL animation)');
  if (/prefers-reduced-motion/i.test(src)) out.push('   - honours prefers-reduced-motion');
  return out;
}

const browser = await chromium.launch();
const shots = [];
async function capture(html, label, scheme, baseDir) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 420, height: 900 } : { width: contentWidth + 66 + 48, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: scheme,
  });
  const page = await ctx.newPage();
  const tmp = path.join(outDir, `.${base}-${label}-${scheme}.html`);
  fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><base href="${pathToFileURL(baseDir + path.sep).href}"><style>${CSS}${mobile ? '.box{width:auto}' : ''}</style></head><body>${html}</body></html>`);
  const t0 = Date.now();
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  const imgs = await page.evaluate(() => [...document.images].map((im) => ({ src: im.getAttribute('src'), ok: im.complete && im.naturalWidth > 0, w: im.naturalWidth, h: im.naturalHeight, shown: Math.round(im.getBoundingClientRect().width) })));
  for (const t of times) {
    const wait = t - (Date.now() - t0);
    if (wait > 0) await page.waitForTimeout(wait);
    const file = path.join(outDir, `${base}${mobile ? '-mobile' : ''}-${scheme}-t${t}.png`);
    await page.screenshot({ path: file, fullPage: true });
    shots.push(file);
  }
  await ctx.close();
  fs.rmSync(tmp, { force: true });
  return imgs;
}

const report = [];
if (/\.svg$/i.test(abs)) {
  report.push(...lintSvg(abs));
  const html = `<img src="${pathToFileURL(abs).href}" style="max-width:100%">`;
  for (const scheme of ['dark', 'light']) {
    const imgs = await capture(`<div class="box"><div class="markdown-body">${html}</div></div>`, 'svg', scheme, path.dirname(abs));
    if (scheme === 'dark') imgs.forEach((im) => report.push(im.ok ? `rendered in <img>: natural ${im.w}x${im.h}, shown at ${im.shown}px wide` : `FAILED to render as <img> (invalid SVG or blocked content): ${im.src}`));
  }
} else {
  const md = fs.readFileSync(abs, 'utf8');
  const { html, codeBlocks } = renderMarkdown(md);
  report.push(...lintCodeBlocks(codeBlocks));
  const refs = [...md.matchAll(/(?:src|srcset)\s*=\s*"([^"]+)"|!\[[^\]]*\]\(([^)\s]+)/g)].map((m) => m[1] || m[2]).filter((r) => !/^https?:|^data:/.test(r));
  for (const r of new Set(refs)) {
    const f = path.resolve(path.dirname(abs), r);
    if (!fs.existsSync(f)) report.push(`MISSING image ref: ${r}`);
    else if (/\.svg$/i.test(f)) report.push(...lintSvg(f));
  }
  const page = `<div class="box"><div class="box-head">README.md</div><article class="markdown-body">${html}</article></div>`;
  for (const scheme of ['dark', 'light']) {
    const imgs = await capture(page, 'md', scheme, path.dirname(abs));
    if (scheme === 'dark') imgs.filter((im) => !im.ok).forEach((im) => report.push(`image failed to load: ${im.src}`));
  }
}
await browser.close();

console.log('=== LINT ===');
console.log(report.join('\n') || '(nothing to report)');
if (warnings.length) {
  console.log('=== GITHUB SANITIZER WARNINGS ===');
  console.log([...new Set(warnings)].join('\n'));
}
console.log('=== SCREENSHOTS ===');
console.log(shots.join('\n'));
