// Original repository bitmap lettering. Paths keep the retro font portable in SVG images.
export const escapeXml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const FONT = {
  A:[14,17,17,31,17,17,17], B:[30,17,17,30,17,17,30], C:[15,16,16,16,16,16,15],
  D:[30,17,17,17,17,17,30], E:[31,16,16,30,16,16,31], F:[31,16,16,30,16,16,16],
  G:[15,16,16,23,17,17,15], H:[17,17,17,31,17,17,17], I:[31,4,4,4,4,4,31],
  J:[7,2,2,2,18,18,12], K:[17,18,20,24,20,18,17], L:[16,16,16,16,16,16,31],
  M:[17,27,21,21,17,17,17], N:[17,25,25,21,19,19,17], O:[14,17,17,17,17,17,14],
  P:[30,17,17,30,16,16,16], Q:[14,17,17,17,21,18,13], R:[30,17,17,30,20,18,17],
  S:[15,16,16,14,1,1,30], T:[31,4,4,4,4,4,4], U:[17,17,17,17,17,17,14],
  V:[17,17,17,17,17,10,4], W:[17,17,17,21,21,21,10], X:[17,17,10,4,10,17,17],
  Y:[17,17,10,4,4,4,4], Z:[31,1,2,4,8,16,31],
  '0':[14,17,19,21,25,17,14], '1':[4,12,4,4,4,4,14], '2':[14,17,1,2,4,8,31],
  '3':[30,1,1,14,1,1,30], '4':[2,6,10,18,31,2,2], '5':[31,16,16,30,1,1,30],
  '6':[14,16,16,30,17,17,14], '7':[31,1,2,4,8,8,8], '8':[14,17,17,14,17,17,14],
  '9':[14,17,17,15,1,1,14], '.':[0,0,0,0,0,12,12], ',':[0,0,0,0,0,12,8],
  ':':[0,12,12,0,12,12,0], ';':[0,12,12,0,12,12,8], '-':[0,0,0,31,0,0,0],
  '_':[0,0,0,0,0,0,31], '/':[1,2,2,4,8,8,16], '\\':[16,8,8,4,2,2,1],
  '+':[0,4,4,31,4,4,0], '=':[0,0,31,0,31,0,0], '>':[16,8,4,2,4,8,16],
  '<':[1,2,4,8,4,2,1], '[':[14,8,8,8,8,8,14], ']':[14,2,2,2,2,2,14],
  '(':[2,4,8,8,8,4,2], ')':[8,4,2,2,2,4,8], '!':[4,4,4,4,4,0,4],
  '?':[14,17,1,2,4,0,4], '#':[10,31,10,10,31,10,0], '*':[0,21,14,31,14,21,0],
  '|':[4,4,4,4,4,4,4], '%':[25,25,2,4,8,19,19], ' ':[0,0,0,0,0,0,0],
  "'":[4,4,8,0,0,0,0], '&':[12,18,20,8,21,18,13], '@':[14,17,23,21,23,16,14],
};

export const short = (value, length) => [...String(value)].length <= length ? String(value) : [...String(value)].slice(0, length - 3).join('') + '...';
export const width = (value, scale) => Math.max(0, [...String(value)].length * 6 - 1) * scale;
export function lettering(value, x, y, { scale = 3, maxWidth = 880, fill = '#fff', center = false, attrs = '' } = {}) {
  const source = String(value).toUpperCase();
  const text = source.normalize('NFKD').replace(/\p{M}/gu, '').replace(/[\u2010-\u2015]/g, '-').replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, "'");
  scale = Math.min(scale, maxWidth / Math.max(1, width(text, 1)));
  const w = width(text, scale);
  if (center) x -= w / 2;
  // Preserve non-Latin project identities with the browser's Unicode font fallback.
  if ([...text].some(character => !FONT[character])) {
    return `<text x="${x}" y="${y + scale * 7}" font-family="monospace" font-size="${scale * 9}" textLength="${w}" lengthAdjust="spacingAndGlyphs" fill="${fill}" ${attrs}>${escapeXml(source)}</text>`;
  }
  let d = '';
  for (const [index, character] of [...text].entries()) {
    for (let row = 0; row < 7; row++) for (let col = 0; col < 5; col++) {
      if (FONT[character][row] & (1 << (4 - col))) d += `M${index * 6 + col} ${row}h1v1h-1z`;
    }
  }
  return `<g transform="translate(${x} ${y}) scale(${scale})" ${attrs}><path d="${d}" fill="${fill}"/></g>`;
}

export function paragraph(value, x, y, { columns = 66, lines = 3, scale = 1.8, fill = '#a6b7cc', maxWidth = 840, lineHeight = 22 } = {}) {
  const words = String(value).split(/\s+/).filter(Boolean), wrapped = [];
  let current = '';
  for (const word of words) {
    if (current && [...current + ' ' + word].length > columns) { wrapped.push(current); current = word; }
    else current += (current ? ' ' : '') + word;
  }
  if (current) wrapped.push(current);
  if (wrapped.length > lines) wrapped[lines - 1] = short(wrapped.slice(lines - 1).join(' '), columns);
  return wrapped.slice(0, lines).map((line, index) => lettering(line, x, y + index * lineHeight, { scale, fill, maxWidth })).join('');
}

export const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
export function svg(project, name, { body, defs = '', css = '', background = '#070d17', height = 400 }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 ${height}" role="img" aria-labelledby="title desc">
<title id="title">${escapeXml(project.name)} — ${escapeXml(name)}</title>
<desc id="desc">${escapeXml(project.description || project.fullName)}. ${escapeXml(project.fullName)}. Repository metadata snapshot; decorative animation.</desc>
<defs>${defs}</defs><style>${css}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}</style>
${rect(0, 0, 960, height, background)}${body}</svg>\n`;
}
