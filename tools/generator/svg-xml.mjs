// A strict parser for the self-contained SVG XML subset used by this plugin.
// No DTDs/custom entities. Browser image decoding remains a required visual check.
const name = /^[A-Za-z_][A-Za-z0-9_.:-]*/;
const validCodepoint = n => n === 9 || n === 10 || n === 13 || (n >= 32 && n <= 0xd7ff)
  || (n >= 0xe000 && n <= 0xfffd) || (n >= 0x10000 && n <= 0x10ffff);
function entities(value) {
  for (const match of value.matchAll(/&([^;\s<&]*);?|&/g)) {
    if (!match[0].endsWith(';')) throw new Error('Unescaped ampersand');
    const entity = match[1];
    if (['amp', 'lt', 'gt', 'apos', 'quot'].includes(entity)) continue;
    const n = /^#x[0-9a-f]+$/i.test(entity) ? parseInt(entity.slice(2), 16)
      : /^#\d+$/.test(entity) ? Number(entity.slice(1)) : NaN;
    if (!validCodepoint(n)) throw new Error(`Invalid XML entity: &${entity};`);
  }
}

export function checkSvgXml(source) {
  try {
    source = source.replace(/^\uFEFF/, '');
    for (const char of source) if (!validCodepoint(char.codePointAt(0))) throw new Error('Invalid XML character');
    const stack = [];
    let roots = 0, pos = 0, declaration = false;
    while (pos < source.length) {
      if (source[pos] !== '<') {
        let end = source.indexOf('<', pos);
        if (end < 0) end = source.length;
        const text = source.slice(pos, end);
        if (!stack.length && text.trim()) throw new Error('Text outside the SVG root');
        if (text.includes(']]>')) throw new Error('CDATA terminator in ordinary text');
        entities(text); pos = end; continue;
      }
      if (source.startsWith('<!--', pos)) {
        const end = source.indexOf('-->', pos + 4);
        if (end < 0 || source.slice(pos + 4, end).includes('--')) throw new Error('Invalid XML comment');
        pos = end + 3; continue;
      }
      if (source.startsWith('<![CDATA[', pos)) {
        if (!stack.length) throw new Error('CDATA outside the SVG root');
        const end = source.indexOf(']]>', pos + 9);
        if (end < 0) throw new Error('Unclosed CDATA');
        pos = end + 3; continue;
      }
      if (source.startsWith('<?xml ', pos)) {
        if (pos !== 0 || declaration || roots) throw new Error('Misplaced XML declaration');
        const end = source.indexOf('?>', pos + 6);
        if (end < 0 || !/^<\?xml\s+version\s*=\s*(["'])1\.0\1(?:\s+encoding\s*=\s*(["'])UTF-8\2)?(?:\s+standalone\s*=\s*(["'])(?:yes|no)\3)?\s*\?>$/i.test(source.slice(pos, end + 2))) throw new Error('Unsupported XML declaration');
        declaration = true; pos = end + 2; continue;
      }
      if (source.startsWith('<!', pos) || source.startsWith('<?', pos)) throw new Error('DTDs and processing instructions are not permitted');
      if (source.startsWith('</', pos)) {
        const match = source.slice(pos).match(/^<\/([A-Za-z_][A-Za-z0-9_.:-]*)\s*>/);
        if (!match || stack.pop() !== match[1]) throw new Error('Mismatched XML closing tag');
        pos += match[0].length; continue;
      }
      const match = source.slice(pos + 1).match(name);
      if (!match) throw new Error('Invalid XML element name');
      const tag = match[0];
      pos += 1 + tag.length;
      const attrs = new Map();
      let selfClosed = false;
      while (true) {
        const whitespace = source.slice(pos).match(/^\s*/)[0];
        pos += whitespace.length;
        if (source.startsWith('/>', pos)) { pos += 2; selfClosed = true; break; }
        if (source[pos] === '>') { pos++; break; }
        if (!whitespace) throw new Error('Missing space before an XML attribute');
        const attr = source.slice(pos).match(/^([A-Za-z_][A-Za-z0-9_.:-]*)\s*=\s*(["'])/);
        if (!attr) throw new Error('Invalid XML attribute');
        if (attrs.has(attr[1])) throw new Error(`Duplicate XML attribute: ${attr[1]}`);
        pos += attr[0].length;
        const end = source.indexOf(attr[2], pos);
        if (end < 0) throw new Error('Unclosed XML attribute');
        const value = source.slice(pos, end);
        if (value.includes('<')) throw new Error('Unescaped less-than sign in attribute');
        entities(value); attrs.set(attr[1], value); pos = end + 1;
      }
      if (!stack.length) {
        if (++roots !== 1 || tag !== 'svg' || attrs.get('xmlns') !== 'http://www.w3.org/2000/svg') throw new Error('One SVG root with the SVG namespace is required');
      }
      if (!selfClosed) stack.push(tag);
    }
    if (stack.length || roots !== 1) throw new Error('Unclosed or missing SVG root');
    return [];
  } catch (error) { return [error.message]; }
}
