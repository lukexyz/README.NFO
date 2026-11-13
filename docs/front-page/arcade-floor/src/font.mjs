// Original 5x7 pixel font for concept 06 (ARCADE FLOOR). Drawn for this page; not traced from any
// existing font. Rows run top to bottom, 1 = lit pixel. Every SVG on the page draws its lettering
// from these glyphs as paths, so there is no <text> and no font loading.
export const GLYPHS = {
  A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110',
  C: '01111 10000 10000 10000 10000 10000 01111', D: '11110 10001 10001 10001 10001 10001 11110',
  E: '11111 10000 10000 11110 10000 10000 11111', F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01111 10000 10000 10111 10001 10001 01111', H: '10001 10001 10001 11111 10001 10001 10001',
  I: '01110 00100 00100 00100 00100 00100 01110', J: '00111 00010 00010 00010 00010 10010 01100',
  K: '10001 10010 10100 11000 10100 10010 10001', L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001', N: '10001 11001 10101 10011 10001 10001 10001',
  O: '01110 10001 10001 10001 10001 10001 01110', P: '11110 10001 10001 11110 10000 10000 10000',
  Q: '01110 10001 10001 10001 10101 10010 01101', R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110', T: '11111 00100 00100 00100 00100 00100 00100',
  U: '10001 10001 10001 10001 10001 10001 01110', V: '10001 10001 10001 10001 10001 01010 00100',
  W: '10001 10001 10001 10101 10101 10101 01010', X: '10001 10001 01010 00100 01010 10001 10001',
  Y: '10001 10001 01010 00100 00100 00100 00100', Z: '11111 00001 00010 00100 01000 10000 11111',
  0: '01110 10001 10011 10101 11001 10001 01110', 1: '00100 01100 00100 00100 00100 00100 01110',
  2: '01110 10001 00001 00110 01000 10000 11111', 3: '11110 00001 00001 01110 00001 00001 11110',
  4: '00010 00110 01010 10010 11111 00010 00010', 5: '11111 10000 11110 00001 00001 10001 01110',
  6: '00110 01000 10000 11110 10001 10001 01110', 7: '11111 00001 00010 00100 01000 01000 01000',
  8: '01110 10001 10001 01110 10001 10001 01110', 9: '01110 10001 10001 01111 00001 00010 01100',
  '.': '00000 00000 00000 00000 00000 01100 01100', '-': '00000 00000 00000 01110 00000 00000 00000',
  ':': '00000 01100 01100 00000 01100 01100 00000', '/': '00001 00001 00010 00100 01000 10000 10000',
  '?': '01110 10001 00001 00110 00100 00000 00100', '*': '00000 00000 00100 01110 00100 00000 00000',
  '!': '00100 00100 00100 00100 00100 00000 00100', ' ': '00000 00000 00000 00000 00000 00000 00000',
  '·': '00000 00000 00000 01100 01100 00000 00000', '>': '01000 00100 00010 00001 00010 00100 01000',
  '<': '00010 00100 01000 10000 01000 00100 00010', '#': '01010 01010 11111 01010 11111 01010 01010',
  '+': '00000 00100 00100 11111 00100 00100 00000', '=': '00000 00000 11111 00000 11111 00000 00000',
  '(': '00010 00100 01000 01000 01000 00100 00010', ')': '01000 00100 00010 00010 00010 00100 01000',
  "'": '00100 00100 01000 00000 00000 00000 00000', '_': '00000 00000 00000 00000 00000 00000 11111',
  '►': '10000 11000 11100 11110 11100 11000 10000', '◄': '00001 00011 00111 01111 00111 00011 00001',
  '"': '01010 01010 00000 00000 00000 00000 00000', ',': '00000 00000 00000 00000 01100 00100 01000',
};

// Path data for one glyph in unit cells, horizontal runs merged. Bold ORs each row with itself shifted right.
export function glyphPath(ch, bold = false) {
  const rows = (GLYPHS[ch] ?? GLYPHS['?']).split(' ');
  let d = '';
  rows.forEach((row, y) => {
    let bits = [...row].map(Number);
    if (bold) bits = [...bits, 0].map((b, i) => b | (bits[i - 1] || 0));
    for (let x = 0; x < bits.length; x++) {
      if (!bits[x]) continue;
      let w = 1;
      while (bits[x + w]) w++;
      d += `M${x} ${y}h${w}v1h-${w}z`;
      x += w - 1;
    }
  });
  return d;
}

export const advance = (bold) => (bold ? 7 : 6);
export const textWidth = (str, s, bold = false) => ([...str].length * advance(bold) - 1) * s;

// A text writer that collects <defs> glyphs on demand and emits <use> references.
// prefix keeps ids unique per SVG file.
export function makeWriter(prefix = 'g') {
  const used = new Map();
  const id = (ch, bold) => `${prefix}${bold ? 'b' : 'r'}${ch.codePointAt(0).toString(16)}`;
  const text = (str, x, y, s, fill, { bold = false, cls = '', extra = '' } = {}) => {
    const adv = advance(bold);
    const uses = [...str].map((ch, i) => {
      if (ch === ' ') return '';
      const key = id(ch, bold);
      used.set(key, [ch, bold]);
      return `<use href="#${key}" x="${i * adv}"/>`;
    }).join('');
    return `<g transform="translate(${round(x)} ${round(y)}) scale(${s})" fill="${fill}"${cls ? ` class="${cls}"` : ''}${extra}>${uses}</g>`;
  };
  const centred = (str, cx, y, s, fill, opts = {}) => text(str, cx - textWidth(str, s, opts.bold) / 2, y, s, fill, opts);
  const right = (str, rx, y, s, fill, opts = {}) => text(str, rx - textWidth(str, s, opts.bold), y, s, fill, opts);
  const defs = () => [...used].map(([key, [ch, bold]]) => `<path id="${key}" d="${glyphPath(ch, bold)}"/>`).join('');
  return { text, centred, right, defs, id };
}

// Flat path (no <use>) for raster card strips rendered in HTML.
export function pixelPath(str, x, y, s) {
  let d = '';
  [...str].forEach((ch, i) => {
    const rows = (GLYPHS[ch] ?? GLYPHS['?']).split(' ');
    rows.forEach((row, r) => [...row].forEach((bit, c) => {
      if (bit === '1') d += `M${round(x + (i * 6 + c) * s)} ${round(y + r * s)}h${s}v${s}h-${s}z`;
    }));
  });
  return d;
}

export const round = (n) => Math.round(n * 100) / 100;
