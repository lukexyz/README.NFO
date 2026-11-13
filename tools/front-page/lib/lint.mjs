// README front-page lint: the GitHub constraints every concept must meet.
// Code blocks (80 columns, safe characters), local references, referenced SVGs
// (self-contained, reduced motion, glyphs as shapes) and markup GitHub strips.
import fs from 'node:fs';
import path from 'node:path';

const WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]|\p{Extended_Pictographic}/u;
export const colWidth = (line) => {
  let w = 0;
  for (const ch of line.replace(/️/g, '')) w += WIDE.test(ch) ? 2 : 1;
  return w;
};
// The hard-rule safe set: ASCII, Latin-1, box drawing, block elements and shades.
export const SAFE = (cp) => cp < 0x7f || (cp >= 0xa0 && cp <= 0xff) || (cp >= 0x2500 && cp <= 0x259f);

function closesFence(line, marker) {
  const closing = line.match(/^ {0,3}(`+|~+)\s*$/);
  return Boolean(closing && closing[1][0] === marker[0] && closing[1].length >= marker.length);
}

export function codeBlocks(markdown) {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(/^ {0,3}(`{3,}|~{3,})\s*([^\s`]*)/);
    if (open) {
      const body = [];
      const start = i + 1;
      for (i++; i < lines.length && !closesFence(lines[i], open[1]); i++) body.push(lines[i]);
      blocks.push({ kind: `fenced ${open[2] || '(no lang)'}`, line: start, lines: body });
    } else if (/^\s*<pre\b/i.test(lines[i])) {
      const start = i + 1;
      const raw = [lines[i]];
      while (!/<\/pre>/i.test(lines[i]) && i + 1 < lines.length) raw.push(lines[++i]);
      const text = raw.join('\n').replace(/^[\s\S]*?<pre\b[^>]*>/i, '').replace(/<\/pre>[\s\S]*$/i, '')
        .replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
        .replace(/&#\d+;|&[a-z]+;/g, 'x').replace(/&amp;/g, '&');
      blocks.push({ kind: 'html <pre>', line: start, lines: text.split('\n') });
    }
  }
  return blocks;
}

export function proseOnly(markdown) {
  let fence = null;
  return markdown.replace(/\r\n?/g, '\n').split('\n').map((line) => {
    const opening = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) { if (closesFence(line, fence)) fence = null; return ''; }
    if (opening) { fence = opening[1]; return ''; }
    return line;
  }).join('\n').replace(/<!--[\s\S]*?-->/g, '').replace(/(`+)[^\n]*?\1/g, '');
}

export function references(markdown) {
  const prose = proseOnly(markdown);
  const refs = [];
  const add = (ref, image) => { if (ref) refs.push({ ref, image }); };
  for (const m of prose.matchAll(/(!?)\[[^\]\n]*\]\(\s*(?:<([^>]+)>|([^\s)]+))/g)) add(m[2] || m[3], m[1] === '!');
  for (const m of prose.matchAll(/^ {0,3}\[[^\]^][^\]]*\]:\s*<?(\S+?)>?(?:\s|$)/gm)) add(m[1], false);
  for (const m of prose.matchAll(/\b(src|href)\s*=\s*(?:"([^"]+)"|'([^']+)')/gi)) add(m[2] || m[3], m[1].toLowerCase() === 'src');
  for (const m of prose.matchAll(/\bsrcset\s*=\s*(?:"([^"]+)"|'([^']+)')/gi)) {
    const value = m[1] || m[2];
    if (!/^data:/i.test(value)) value.split(',').forEach((part) => add(part.trim().split(/\s+/)[0], true));
  }
  return refs;
}

export function lintSvg(file) {
  const out = [];
  const src = fs.readFileSync(file, 'utf8');
  const bytes = fs.statSync(file).size;
  const animated = /@keyframes|<animate\b|<animateTransform\b|<animateMotion\b|<set\b/i.test(src);
  if (bytes > 400 * 1024) out.push(['WARN', `${(bytes / 1024).toFixed(0)} KB: heavy for a README image (GitHub serves SVGs uncompressed)`]);
  if (/<script\b/i.test(src)) out.push(['ERROR', '<script>: not allowed (and never runs inside <img> on GitHub)']);
  if (/<foreignObject\b/i.test(src)) out.push(['WARN', '<foreignObject> renders inconsistently inside <img>']);
  if (/(?:xlink:href|href|src)\s*=\s*["'](?!#|data:)[^"']+/i.test(src)) out.push(['ERROR', 'external href/src: blocked inside <img>; inline it as data: or draw it']);
  if (/@import|url\(\s*["']?(?:https?:|\/\/)/i.test(src) || /@font-face[^}]*url\(\s*["']?(?!data:)/i.test(src)) out.push(['ERROR', 'external CSS, @import or font URL: blocked inside <img>']);
  if (/<text\b/i.test(src)) out.push(['ERROR', '<text> depends on the viewer\'s fonts: draw glyphs as <path>/<rect>']);
  if (!/viewBox=/i.test(src)) out.push(['WARN', 'no viewBox: will not scale down cleanly on phones']);
  if (animated && !/prefers-reduced-motion/i.test(src)) out.push(['ERROR', 'animated but ignores prefers-reduced-motion']);
  return { bytes, animated, notes: out };
}

// Returns { lines: [[level, message]], counts }.
// linkBase is the folder local links resolve from: the repository root for a root-relative README.
export function lint(markdown, linkBase) {
  const report = [];
  const push = (level, msg) => report.push([level, msg]);

  // Code blocks: the README must stay inside 80 columns and the safe glyph set.
  codeBlocks(markdown).forEach((b, n) => {
    const max = Math.max(0, ...b.lines.map(colWidth));
    const risky = new Map();
    b.lines.forEach((l, k) => {
      for (const ch of l) {
        const cp = ch.codePointAt(0);
        if (!SAFE(cp) && cp !== 0x09) {
          const key = `U+${cp.toString(16).toUpperCase().padStart(4, '0')} "${ch}"`;
          if (!risky.has(key)) risky.set(key, b.line + k + 1);
        }
      }
    });
    const tabs = b.lines.findIndex((l) => l.includes('\t'));
    const head = `code block ${n + 1} (line ${b.line}, ${b.kind}): ${b.lines.length} lines, ${max} columns`;
    if (max > 80) push('ERROR', `${head}: over 80 columns`);
    // Phone: 309px column - 44px copy button - 32px padding = 233px, about 31 columns of 13.6px Consolas.
    else push('ok', `${head}${max > 31 ? ' (scrolls sideways on phones past ~31 columns)' : ''}`);
    if (tabs >= 0) push('WARN', `   tab character at line ${b.line + tabs + 1}: renders at unpredictable width`);
    for (const [key, line] of risky) push('ERROR',`   ${key} at line ${line} is outside the safe set (ASCII, Latin-1, box drawing, blocks, shades)`);
  });

  // References and images.
  const seen = new Set();
  let imageBytes = 0;
  let animatedCount = 0;
  let imageCount = 0;
  for (const { ref, image } of references(markdown)) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(ref)) {
      if (image && !seen.has(ref)) { seen.add(ref); imageCount++; push('info', `remote image (GitHub proxies it through camo): ${ref}`); }
      continue;
    }
    if (ref.startsWith('#')) continue;
    const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    const target = path.resolve(linkBase, clean.replace(/^\//, ''));
    if (!fs.existsSync(target)) { push('ERROR', `missing ${image ? 'image' : 'link target'}: ${ref}`); continue; }
    if (!image) continue;
    imageCount++;
    imageBytes += fs.statSync(target).size;
    if (/\.svg$/i.test(target)) {
      const svg = lintSvg(target);
      if (svg.animated) animatedCount++;
      for (const [level, msg] of svg.notes) push(level, `${clean}: ${msg}`);
    }
  }
  push('info', `${imageCount} images (${(imageBytes / 1024).toFixed(0)} KB local), ${animatedCount} animated SVG${animatedCount === 1 ? '' : 's'}`);

  // Markup GitHub strips.
  const prose = proseOnly(markdown);
  for (const [re, what] of [
    [/<style\b/i, '<style> is stripped'], [/<script\b/i, '<script> is stripped'], [/<svg\b/i, 'inline <svg> is stripped (load it through <img>)'],
    [/<iframe\b/i, '<iframe> is stripped'], [/\sclass\s*=/i, 'class attributes are stripped'], [/\sstyle\s*=/i, 'style attributes are stripped'],
    [/<video\b|<audio\b/i, '<video>/<audio> markup is stripped'], [/<(?:input|button|form)\b/i, 'form controls are stripped'],
  ]) if (re.test(prose)) push('WARN', `GitHub sanitizer: ${what}`);
  const noAlt = [...prose.matchAll(/<img\b(?![^>]*\balt\s*=)[^>]*>/gi)].length + [...prose.matchAll(/!\[\]\(/g)].length;
  if (noAlt) push('WARN', `${noAlt} image${noAlt === 1 ? '' : 's'} without alt text`);
  if (/^```mermaid/m.test(markdown)) push('info', 'mermaid blocks render as diagrams on github.com; the preview shows their source');

  const counts = { errors: report.filter((r) => r[0] === 'ERROR').length, warnings: report.filter((r) => r[0] === 'WARN').length };
  return { report, counts };
}
