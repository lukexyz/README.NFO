// Local GitHub-flavoured Markdown renderer: the fallback when api.github.com is unreachable
// or rate-limited. Ported from tools/preview.mjs (minimal renderer + sanitizer) and extended
// to cover what front-page READMEs use: tables with alignment, <details>, <picture>, align
// attributes, fenced/indented code, nested and task lists, alerts, reference links and
// footnotes. It aims to emit the same HTML shape as the GitHub API so one stylesheet serves both.

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => esc(s).replace(/"/g, '&quot;');
// Keep existing entities (&amp; &#169; &copy;) but escape bare ampersands.
const escText = (s) => s.replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- GitHub sanitizer approximation ----------
const ALLOWED_TAGS = new Set(('h1 h2 h3 h4 h5 h6 h7 h8 br b i strong em a pre code img tt div ins del sup sub p picture '
  + 'ol ul table thead tbody tfoot blockquote dl dt dd kbd q samp var hr ruby rt rp li tr td th s strike summary details '
  + 'caption figure figcaption abbr bdo cite dfn mark small source span time wbr center').split(' '));
const DROP_WITH_CONTENT = ['script', 'style', 'svg', 'iframe', 'object', 'embed', 'canvas', 'math', 'template',
  'textarea', 'select', 'form', 'noscript', 'title', 'head'];
const ALLOWED_ATTRS = new Set(('abbr accept accept-charset accesskey action align alt aria-describedby aria-hidden '
  + 'aria-label aria-labelledby axis border cellpadding cellspacing char charoff charset checked clear cols colspan color '
  + 'compact coords datetime dir disabled enctype for frame headers height hreflang hspace ismap label lang maxlength '
  + 'media method multiple name nohref noshade nowrap open progress prompt readonly rel rev role rows rowspan rules scope '
  + 'selected shape size span start summary tabindex title type usemap valign value width itemprop').split(' '));
const URL_ATTRS = { a: ['href'], img: ['src', 'longdesc', 'srcset'], source: ['srcset'], div: ['itemscope', 'itemtype'], blockquote: ['cite'], del: ['cite'], ins: ['cite'], q: ['cite'] };

export function sanitize(html, warn = () => {}, where = 'html') {
  for (const t of DROP_WITH_CONTENT) {
    const re = new RegExp(`<${t}\\b[\\s\\S]*?<\\/${t}\\s*>|<${t}\\b[^>]*\\/?>`, 'gi');
    if (re.test(html)) warn(`${where}: <${t}> is stripped by GitHub (removed in preview)`);
    html = html.replace(re, '');
  }
  return html.replace(/<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g, (tag, name, attrs = '') => {
    if (!name) return tag; // comment: kept, invisible
    const lower = name.toLowerCase();
    if (!ALLOWED_TAGS.has(lower)) {
      warn(`${where}: <${lower}> is not allowed by GitHub (tag removed, text kept)`);
      return '';
    }
    if (tag.startsWith('</')) return `</${lower}>`;
    const kept = [];
    for (const m of attrs.matchAll(/([^\s"'=<>\/]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g)) {
      const attr = m[1].toLowerCase();
      let value = m[2] === undefined ? '' : m[2].replace(/^["']|["']$/g, '');
      if (attr === 'id' || (attr === 'name' && lower === 'a')) {
        kept.push(`${attr}="user-content-${escAttr(value)}"`);
      } else if ((URL_ATTRS[lower] || []).includes(attr)) {
        if (/^\s*(javascript|vbscript|data:text\/html)/i.test(value)) { warn(`${where}: unsafe ${attr} URL removed`); continue; }
        kept.push(`${attr}="${escAttr(value)}"`);
      } else if (ALLOWED_ATTRS.has(attr)) {
        kept.push(m[2] === undefined ? attr : `${attr}="${escAttr(value)}"`);
      } else if (attr !== '/') {
        warn(`${where}: ${attr}="..." on <${lower}> is stripped by GitHub`);
      }
    }
    return `<${lower}${kept.length ? ` ${kept.join(' ')}` : ''}>`;
  });
}

// ---------- inline ----------
function makeInline(ctx) {
  const store = [];
  const hold = (html) => `\u0002${store.push(html) - 1}\u0003`;
  const restore = (s) => {
    let prev;
    do { prev = s; s = s.replace(/\u0002(\d+)\u0003/g, (m, i) => store[Number(i)]); } while (s !== prev);
    return s;
  };

  function emphasis(s) {
    // GFM autolinks (www. and http(s)://), then strong/em/del on what is left.
    s = s.replace(/(^|[\s(*_~])((?:https?:\/\/|www\.)[^\s<\u0002]*[^\s<\u0002.,:;"')\]*_~?!])/g, (m, pre, url) =>
      `${pre}${hold(`<a href="${escAttr(/^www\./.test(url) ? `http://${url}` : url)}" rel="nofollow">${escText(url)}</a>`)}`);
    s = escText(s);
    s = s.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^\w])__(?=\S)([\s\S]*?\S)__(?=[^\w]|$)/g, '$1<strong>$2</strong>')
      .replace(/(^|[^*])\*(?=[^\s*])([^*]*?[^\s*])\*(?!\*)/g, '$1<em>$2</em>')
      .replace(/(^|[^\w])_(?=[^\s_])([^_]*?[^\s_])_(?=[^\w]|$)/g, '$1<em>$2</em>')
      .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>');
    return s;
  }

  function inline(text) {
    let s = text;
    // Backslash escapes.
    s = s.replace(/\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g, (m, ch) => hold(esc(ch)));
    // Code spans.
    s = s.replace(/(`+)(?!`)([\s\S]*?[^`])\1(?!`)/g, (m, ticks, code) => {
      let c = code.replace(/\n/g, ' ');
      if (/^ .* $/.test(c) && c.trim()) c = c.slice(1, -1);
      return hold(`<code class="notranslate">${esc(c)}</code>`);
    });
    // Autolinks <https://...> and <mail@host>.
    s = s.replace(/<((?:https?|ftp):\/\/[^\s<>]+)>/g, (m, url) => hold(`<a href="${escAttr(url)}" rel="nofollow">${esc(url)}</a>`));
    s = s.replace(/<([^\s<>@]+@[^\s<>@]+\.[a-z]{2,})>/gi, (m, mail) => hold(`<a href="mailto:${escAttr(mail)}">${esc(mail)}</a>`));
    // Raw inline HTML (sanitised tag by tag).
    s = s.replace(/<!--[\s\S]*?-->|<\/?[a-zA-Z][a-zA-Z0-9-]*(?:\s+[^\s"'=<>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*\s*\/?>/g,
      (tag) => hold(sanitize(tag, ctx.warn, 'inline html')));
    // Footnote references.
    s = s.replace(/\[\^([^\]\s]+)\]/g, (m, id) => {
      if (!ctx.footnotes.has(id.toLowerCase())) return m;
      const n = ctx.footnoteOrder.indexOf(id.toLowerCase()) + 1 || ctx.footnoteOrder.push(id.toLowerCase());
      return hold(`<sup><a href="#user-content-fn-${escAttr(id)}" id="user-content-fnref-${escAttr(id)}" data-footnote-ref="" aria-describedby="footnote-label">${n}</a></sup>`);
    });
    // Images (inline and reference). Wrapped in a link later only when not already inside one.
    const image = (alt, src, title) => hold(`<img src="${escAttr(src)}" alt="${escAttr(alt.replace(/\u0002\d+\u0003/g, ''))}"${title ? ` title="${escAttr(title)}"` : ''}>`);
    s = s.replace(/!\[([^\]]*)\]\(\s*<?([^)\s>]*)>?(?:\s+(?:"([^"]*)"|'([^']*)'))?\s*\)/g, (m, alt, src, t1, t2) => image(alt, src, t1 || t2));
    s = s.replace(/!\[([^\]]*)\]\[([^\]]*)\]/g, (m, alt, ref) => {
      const def = ctx.refs.get((ref || alt).trim().toLowerCase());
      return def ? image(alt, def.url, def.title) : m;
    });
    // Links (inline, full/collapsed/shortcut reference).
    const link = (inner, href, title) => hold(`<a href="${escAttr(href)}"${title ? ` title="${escAttr(title)}"` : ''}>${emphasis(inner)}</a>`);
    for (let pass = 0; pass < 2; pass++) {
      s = s.replace(/\[((?:[^\[\]]|\u0002\d+\u0003)*)\]\(\s*<?([^)\s>]*)>?(?:\s+(?:"([^"]*)"|'([^']*)'))?\s*\)/g, (m, inner, href, t1, t2) => link(inner, href, t1 || t2));
      s = s.replace(/\[((?:[^\[\]]|\u0002\d+\u0003)+)\](?:\[([^\]]*)\])?/g, (m, inner, ref) => {
        const def = ctx.refs.get((ref || inner).trim().toLowerCase());
        return def ? link(inner, def.url, def.title) : m;
      });
    }
    // Hard line breaks.
    s = s.replace(/(?: {2,}|\\)\n/g, () => hold('<br>\n'));
    s = emphasis(s);
    if (/\$[^$\n]+\$/.test(text) && !/`/.test(text)) ctx.warn('inline $math$ found: GitHub renders it with MathJax, the local renderer shows raw text');
    return restore(s);
  }
  return inline;
}

// ---------- blocks ----------
const FENCE = /^( {0,3})(`{3,}|~{3,})\s*([^\s`]*)[^`]*$/;
const HR = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const ATX = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/;
const LIST = /^( {0,3})([-*+]|\d{1,9}[.)])([ \t]+|$)/;
// CommonMark HTML block types 6 (block-level tag) and 7 (a lone complete tag on its own line).
const HTML_TYPE7 = /^ {0,3}(?:<[a-zA-Z][a-zA-Z0-9-]*(?:\s+[^\s"'=<>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*\s*\/?>|<\/[a-zA-Z][a-zA-Z0-9-]*\s*>)\s*$/;
const HTML_INTERRUPT = /^ {0,3}<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|pre|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul|script|style|textarea)(?:[\s/>]|$)|^ {0,3}<!--/i;
const ALERT_ICONS = {
  note: ['info', 'M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z'],
  tip: ['light-bulb', 'M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z'],
  important: ['report', 'M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z'],
  warning: ['alert', 'M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z'],
  caution: ['stop', 'M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z'],
};
const TABLE_DELIM =/^ {0,3}\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/;
const LANG_SCOPE = { sh: 'source-shell', bash: 'source-shell', shell: 'source-shell', zsh: 'source-shell', console: 'source-shell', powershell: 'source-powershell', ps1: 'source-powershell', pwsh: 'source-powershell', cmd: 'source-batchfile', bat: 'source-batchfile', js: 'source-js', javascript: 'source-js', mjs: 'source-js', ts: 'source-ts', typescript: 'source-ts', json: 'source-json', py: 'source-python', python: 'source-python', yaml: 'source-yaml', yml: 'source-yaml', html: 'text-html-basic', css: 'source-css', md: 'text-md', markdown: 'text-md', diff: 'source-diff' };

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const cells = [];
  let cur = '';
  let ticks = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '\\' && s[i + 1] === '|') { cur += '|'; i++; continue; }
    if (ch === '`') ticks ^= 1;
    if (ch === '|' && !ticks) { cells.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

export function renderLocal(markdown) {
  const warnings = [];
  const ctx = { refs: new Map(), footnotes: new Map(), footnoteOrder: [], warn: (m) => warnings.push(m) };
  let src = markdown.replace(/^﻿/, '').replace(/\r\n?/g, '\n').replace(/\t/g, '    ');

  // Collect link reference and footnote definitions outside code fences.
  {
    const lines = src.split('\n');
    let fence = null;
    const keep = [];
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const f = l.match(FENCE);
      if (fence) { if (new RegExp(`^ {0,3}${fence[0] === '`' ? '`' : '~'}{${fence.length},}\\s*$`).test(l)) fence = null; keep.push(l); continue; }
      if (f) { fence = f[2]; keep.push(l); continue; }
      const fn = l.match(/^ {0,3}\[\^([^\]\s]+)\]:\s?(.*)$/);
      if (fn) {
        const body = [fn[2]];
        while (i + 1 < lines.length && (/^ {4}/.test(lines[i + 1]) || (lines[i + 1].trim() === '' && /^ {4}/.test(lines[i + 2] || '')))) body.push(lines[++i].replace(/^ {4}/, ''));
        ctx.footnotes.set(fn[1].toLowerCase(), { id: fn[1], text: body.join('\n') });
        continue;
      }
      const ref = l.match(/^ {0,3}\[([^\]^][^\]]*)\]:\s*<?(\S+?)>?(?:\s+(?:"([^"]*)"|'([^']*)'|\(([^)]*)\)))?\s*$/);
      if (ref) { ctx.refs.set(ref[1].trim().toLowerCase(), { url: ref[2], title: ref[3] || ref[4] || ref[5] }); continue; }
      keep.push(l);
    }
    src = keep.join('\n');
  }
  const inline = makeInline(ctx);
  const codeBlocks = [];

  function blocks(lines, top = false) {
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === '') { i++; continue; }

      const fence = line.match(FENCE);
      if (fence) {
        const indent = fence[1].length;
        const marker = fence[2];
        const lang = (fence[3] || '').toLowerCase();
        const body = [];
        i++;
        const close = new RegExp(`^ {0,3}${marker[0] === '`' ? '`' : '~'}{${marker.length},}\\s*$`);
        while (i < lines.length && !close.test(lines[i])) body.push(lines[i++].replace(new RegExp(`^ {0,${indent}}`), ''));
        i++;
        if (top) codeBlocks.push({ kind: `fenced ${lang || '(no lang)'}`, lines: body });
        if (lang && lang !== 'text' && lang !== 'txt' && lang !== 'plaintext') {
          const scope = LANG_SCOPE[lang] || `source-${lang.replace(/[^a-z0-9-]/g, '')}`;
          out.push(`<div class="highlight highlight-${scope}" dir="auto"><pre class="notranslate">${esc(body.join('\n'))}</pre></div>`);
        } else {
          out.push(`<pre${lang ? ` lang="${escAttr(lang)}"` : ''} class="notranslate"><code class="notranslate">${esc(body.join('\n'))}${body.length ? '\n' : ''}</code></pre>`);
        }
        continue;
      }

      if (/^ {4,}\S/.test(line)) {
        const body = [];
        while (i < lines.length && (/^ {4,}/.test(lines[i]) || lines[i].trim() === '')) body.push(lines[i++].replace(/^ {4}/, ''));
        while (body.length && body[body.length - 1].trim() === '') body.pop();
        if (top) codeBlocks.push({ kind: 'indented', lines: body });
        out.push(`<pre class="notranslate"><code class="notranslate">${esc(body.join('\n'))}\n</code></pre>`);
        continue;
      }

      if (HTML_INTERRUPT.test(line) || HTML_TYPE7.test(line)) {
        const body = [];
        if (/^ {0,3}<(pre|script|style|textarea)\b/i.test(line)) {
          const tag = line.match(/<(\w+)/)[1];
          const end = new RegExp(`</${tag}>`, 'i');
          while (i < lines.length) { body.push(lines[i]); if (end.test(lines[i++])) break; }
          if (top && /^pre$/i.test(tag)) {
            const text = body.join('\n').replace(/^[\s\S]*?<pre\b[^>]*>/i, '').replace(/<\/pre>[\s\S]*$/i, '')
              .replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#\d+;|&[a-z]+;/g, 'x').replace(/&amp;/g, '&');
            codeBlocks.push({ kind: 'html <pre>', lines: text.split('\n') });
          }
        } else if (/^ {0,3}<!--/.test(line)) {
          while (i < lines.length) { body.push(lines[i]); if (/-->/.test(lines[i++])) break; }
          while (i < lines.length && lines[i].trim() !== '') body.push(lines[i++]);
        } else {
          while (i < lines.length && lines[i].trim() !== '') body.push(lines[i++]);
        }
        out.push(sanitize(body.join('\n'), ctx.warn, 'html block'));
        continue;
      }

      const h = line.match(ATX);
      if (h) { out.push(`<h${h[1].length} dir="auto">${inline((h[2] || '').trim())}</h${h[1].length}>`); i++; continue; }
      if (HR.test(line)) { out.push('<hr>'); i++; continue; }

      if (/^ {0,3}>/.test(line)) {
        const body = [];
        while (i < lines.length && lines[i].trim() !== '' && (/^ {0,3}>/.test(lines[i]) || body.length)) {
          if (!/^ {0,3}>/.test(lines[i]) && (FENCE.test(lines[i]) || ATX.test(lines[i]) || HR.test(lines[i]) || LIST.test(lines[i]))) break;
          body.push(lines[i++].replace(/^ {0,3}> ?/, ''));
        }
        const alert = body[0] && body[0].match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/i);
        if (alert) {
          const kind = alert[1].toLowerCase();
          const [name, d] = ALERT_ICONS[kind];
          const svg = `<svg class="octicon octicon-${name} mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="${d}"></path></svg>`;
          out.push(`<div class="markdown-alert markdown-alert-${kind}" dir="auto"><p class="markdown-alert-title" dir="auto">${svg}${kind[0].toUpperCase()}${kind.slice(1)}</p>${blocks(body.slice(1))}</div>`);
        } else {
          out.push(`<blockquote>\n${blocks(body)}\n</blockquote>`);
        }
        continue;
      }

      if (line.includes('|') && i + 1 < lines.length && TABLE_DELIM.test(lines[i + 1]) && lines[i + 1].includes('-')) {
        const head = splitRow(line);
        const aligns = splitRow(lines[i + 1]).map((c) => (/^:-+:$/.test(c) ? 'center' : /^:-+$/.test(c) ? 'left' : /^-+:$/.test(c) ? 'right' : ''));
        if (aligns.length === head.length) {
          i += 2;
          const rows = [];
          while (i < lines.length && lines[i].trim() !== '' && lines[i].includes('|')) rows.push(splitRow(lines[i++]));
          const cell = (tag, c, k) => `<${tag}${aligns[k] ? ` align="${aligns[k]}"` : ''}>${inline(c || '')}</${tag}>`;
          out.push(`<markdown-accessiblity-table><table role="table">\n<thead>\n<tr>\n${head.map((c, k) => cell('th', c, k)).join('\n')}\n</tr>\n</thead>\n<tbody>\n${rows.map((r) => `<tr>\n${head.map((x, k) => cell('td', r[k], k)).join('\n')}\n</tr>`).join('\n')}\n</tbody>\n</table></markdown-accessiblity-table>`);
          continue;
        }
      }

      const lm = line.match(LIST);
      if (lm) {
        const ordered = /\d/.test(lm[2]);
        const bullet = lm[2].slice(-1);
        const start = ordered ? parseInt(lm[2], 10) : 1;
        const items = [];
        let loose = false;
        while (i < lines.length) {
          const m = lines[i].match(LIST);
          if (!m || /\d/.test(m[2]) !== ordered || m[2].slice(-1) !== bullet) break;
          const contentIndent = m[1].length + m[2].length + (m[3].length > 4 || !m[3].length ? 1 : m[3].length);
          const body = [lines[i].slice(Math.min(contentIndent, lines[i].length))];
          i++;
          let sawBlank = false;
          while (i < lines.length) {
            const l = lines[i];
            if (l.trim() === '') { sawBlank = true; body.push(''); i++; continue; }
            const indent = l.match(/^ */)[0].length;
            if (indent >= contentIndent) { body.push(l.slice(contentIndent)); i++; continue; }
            if (sawBlank) break;
            if (LIST.test(l) || FENCE.test(l) || ATX.test(l) || HR.test(l) || /^ {0,3}>/.test(l) || HTML_INTERRUPT.test(l)) break;
            body.push(l); i++; // lazy continuation
          }
          let trailingBlank = false;
          while (body.length && body[body.length - 1] === '') { body.pop(); trailingBlank = true; }
          const next = i < lines.length && lines[i].match(LIST);
          if (trailingBlank && next && /\d/.test(next[2]) === ordered && next[2].slice(-1) === bullet) loose = true;
          // A blank line between two paragraphs of one item also makes the list loose.
          let inFence = false;
          body.forEach((l, k) => {
            if (FENCE.test(l)) inFence = !inFence;
            if (!inFence && l === '' && k > 0 && body[k + 1] && !LIST.test(body[k + 1]) && !LIST.test(body[k - 1])) loose = true;
          });
          items.push(body);
        }
        const tag = ordered ? 'ol' : 'ul';
        const isTask = items.some((b) => /^\[[ xX]\]\s/.test(b[0]));
        const lis = items.map((body) => {
          const task = body[0].match(/^\[([ xX])\]\s+/);
          if (task) body = [body[0].slice(task[0].length), ...body.slice(1)];
          let html = blocks(body);
          if (!loose) html = html.replace(/<p dir="auto">([\s\S]*?)<\/p>/g, '$1');
          const box = task ? `<input type="checkbox" id="" disabled="" class="task-list-item-checkbox" aria-label="${task[1] === ' ' ? 'Incomplete' : 'Completed'} task"${task[1] === ' ' ? '' : ' checked=""'}> ` : '';
          return `<li${task ? ' class="task-list-item"' : ''}>${box}${html}</li>`;
        });
        out.push(`<${tag}${ordered && start !== 1 ? ` start="${start}"` : ''}${isTask ? ' class="contains-task-list"' : ''} dir="auto">\n${lis.join('\n')}\n</${tag}>`);
        continue;
      }

      // Paragraph (with setext heading detection).
      const para = [];
      while (i < lines.length && lines[i].trim() !== '') {
        const l = lines[i];
        if (para.length) {
          if (/^ {0,3}=+\s*$/.test(l)) { out.push(`<h1 dir="auto">${inline(para.join('\n').trim())}</h1>`); para.length = 0; i++; break; }
          if (/^ {0,3}-+\s*$/.test(l)) { out.push(`<h2 dir="auto">${inline(para.join('\n').trim())}</h2>`); para.length = 0; i++; break; }
          if (FENCE.test(l) || ATX.test(l) || HR.test(l) || /^ {0,3}>/.test(l) || HTML_INTERRUPT.test(l)) break;
          if (/^ {0,3}([-*+]|1[.)])\s+\S/.test(l)) break;
        }
        para.push(l.replace(/^ {0,3}/, ''));
        i++;
      }
      if (para.length) out.push(`<p dir="auto">${inline(para.join('\n').replace(/\s+$/, ''))}</p>`);
    }
    return out.join('\n');
  }

  let html = blocks(src.split('\n'), true);
  if (ctx.footnoteOrder.length) {
    html += `\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only" dir="auto">Footnotes</h2>\n<ol dir="auto">\n${ctx.footnoteOrder.map((key) => {
      const fn = ctx.footnotes.get(key);
      const body = blocks(fn.text.split('\n')).replace(/<\/p>\s*$/, ` <a href="#user-content-fnref-${escAttr(fn.id)}" data-footnote-backref="" aria-label="Back to reference" class="data-footnote-backref">↩</a></p>`);
      return `<li id="user-content-fn-${escAttr(fn.id)}">\n${body}\n</li>`;
    }).join('\n')}\n</ol>\n</section>`;
  }
  return { html: wrapImages(html), warnings: [...new Set(warnings)], codeBlocks };
}

// GitHub links every image that is not already inside a link or a <picture> to its own source,
// and adds an inline max-width. Walk the tags so nesting is tracked.
export function wrapImages(html) {
  let aDepth = 0;
  let picDepth = 0;
  return html.replace(/<(\/?)(a|picture|img)\b([^>]*)>/gi, (tag, close, name, attrs) => {
    const n = name.toLowerCase();
    if (n === 'a') { aDepth = Math.max(0, aDepth + (close ? -1 : 1)); return tag; }
    if (n === 'picture') { picDepth = Math.max(0, picDepth + (close ? -1 : 1)); return tag; }
    if (picDepth) return tag;
    const img = /style=/.test(attrs) ? tag : tag.replace(/\s*\/?>$/, ' style="max-width: 100%;">');
    if (aDepth) return img;
    const src = (attrs.match(/\bsrc="([^"]*)"/) || [])[1];
    return src ? `<a target="_blank" rel="noopener noreferrer" href="${src}">${img}</a>` : img;
  });
}
