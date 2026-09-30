// Magazine type-in listing header for the ULTRA-SATISFACTORY README (style print-03).
// Plain Node, no dependencies, deterministic. Run:
//   node examples/ultra-satisfactory/src/31-type-in-listing_opus_5.5.mjs
// It rewrites examples/ultra-satisfactory/31-type-in-listing_opus_5.5.md and the bonus
// page scan in assets/31-type-in-listing_opus_5.5.svg. Edit this file, not those.
//
// The style: the back pages of a 1980s home-computer magazine, where whole programs were
// printed for readers to type in. Two narrow columns of BASIC, wrapped lines with a hanging
// continuation, a ":rem NNN" checksum at the right of every line, and machine code as rows
// of six decimal bytes plus a check byte. The conventions are reused; no real listing,
// magazine name, masthead or checksum utility is copied. The magazine here is invented.
//
// Nothing on the page is decoration:
//   * Program 1 is a real BASIC program, written to Commodore 64 BASIC V2 rules. This file
//     contains a small interpreter for that dialect and RUNS the listing to produce the
//     screen transcript shown in the README. It then re-reads the listing out of the wrapped
//     two-column page it has just laid out, the way a reader would type it, and checks that
//     it still runs identically and that every line still matches its printed checksum.
//   * Every ":rem" number is computed: character codes of the line as printed, line number
//     included, spaces skipped, summed, modulo 256.
//   * The DATA lines are recipe figures from the app's own data (checked against
//     ultra_satisfactory/data.py), and line 80 of the listing adds them up as a second check.
//   * Program 2 is 42 bytes of real 6502: a print loop and a message. This file executes it
//     on a seven-opcode emulator to confirm what it prints. Its seventh column is
//     (address + the six bytes) modulo 256.
// The build refuses to write anything if one of those checks fails.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '31-type-in-listing_opus_5.5';
const OUT_MD = path.resolve(HERE, '..', `${SLUG}.md`);
const OUT_SVG = path.resolve(HERE, '..', 'assets', `${SLUG}.svg`);
const SVG_REF = `assets/${SLUG}.svg`;

const LIVE = 'https://lukexyz.github.io/ULTRA-SATISFACTORY/';
const MAGAZINE = 'WHAT CONVEYOR?';
const ISSUE = 'September 2026';
const PAGE_NO = 88; // the app's data holds 88 alternate recipes; the page number is a nod to them

const PAGE_W = 80; // the whole page, in characters
const COL_W = 39; // each of the two listing columns
const GUTTER = PAGE_W - 2 * COL_W;
const SCREEN_W = 40; // the home computer's screen, for the RUN transcript

// ------------------------------------------------------------------ inline markup
// Text is built as plain strings. Bold and links are zero-width marker characters, so widths
// can be measured exactly; HTML is produced at the very end.
const links = [];
const B = (s) => `\u0001${s}\u0002`;
const A = (s, href) => {
  links.push(href);
  return `\u0003${String.fromCharCode(0xe000 + links.length - 1)}${s}\u0004`;
};
const PREF = '\u0005'; // in a listing line: the break just before this point is the preferred one
const visible = (s) => s.replace(/\u0003[\ue000-\uf8ff]/g, '').replace(/[\u0001\u0002\u0004\u0005]/g, '');
const len = (s) => [...visible(s)].length;
const padR = (s, n) => s + ' '.repeat(Math.max(0, n - len(s)));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const toHtml = (s) => esc(s)
  .replace(/\u0001/g, '<b>').replace(/\u0002/g, '</b>')
  .replace(/\u0003([\ue000-\uf8ff])/g, (m, c) => `<a href="${links[c.charCodeAt(0) - 0xe000]}">`)
  .replace(/\u0004/g, '</a>');
// A marked-up string as cells: one per visible character, each carrying its bold flag and link.
function toCells(s) {
  const cells = [];
  let bold = false, href = null;
  const chars = [...s];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === '\u0001') bold = true;
    else if (c === '\u0002') bold = false;
    else if (c === '\u0003') href = links[chars[++i].charCodeAt(0) - 0xe000];
    else if (c === '\u0004') href = null;
    else if (c === PREF) cells[cells.length - 1].pref = true;
    else cells.push({ ch: c, bold, href });
  }
  return cells;
}
// Cells back to a marked-up string. A link never covers leading or trailing spaces.
function fromCells(cells) {
  let out = '';
  let i = 0;
  while (i < cells.length) {
    const { bold, href } = cells[i];
    let j = i;
    while (j < cells.length && cells[j].bold === bold && cells[j].href === href) j++;
    let run = cells.slice(i, j).map((c) => c.ch).join('');
    if (href) {
      const lead = run.match(/^ */)[0], trail = run.match(/ *$/)[0];
      const core = run.slice(lead.length, run.length - trail.length);
      run = core ? lead + A(core, href) + trail : run;
    }
    out += bold ? B(run) : run;
    i = j;
  }
  return out;
}

// ------------------------------------------------------------------ the data
// Standard recipes, as the app's ITEMS tab shows them: output per minute, cycle seconds,
// machine, megawatts. Verified on 2026-09-30 with
//   python -B -c "from ultra_satisfactory.data import load_data, get_item_recipe; ..."
// Check again before changing one.
const MACHINES = ['ASSEMBLER', 'BLENDER', 'CONSTRUCTOR', 'FOUNDRY', 'MANUFACTURER', 'PACKAGER', 'PARTICLE ACCELERATOR', 'REFINERY', 'SMELTER'];
const RECIPES = [
  ['IRON INGOT', 30, 2, 'SMELTER', 4],
  ['STEEL INGOT', 45, 4, 'FOUNDRY', 16],
  ['IRON PLATE', 20, 6, 'CONSTRUCTOR', 4],
  ['SCREW', 40, 6, 'CONSTRUCTOR', 4],
  ['MODULAR FRAME', 2, 60, 'ASSEMBLER', 15],
  ['SMART PLATING', 2, 30, 'ASSEMBLER', 15],
  ['VERSATILE FRAMEWORK', 5, 24, 'ASSEMBLER', 15],
  ['AUTOMATED WIRING', 2.5, 24, 'ASSEMBLER', 15],
  ['MODULAR ENGINE', 1, 60, 'MANUFACTURER', 55],
  ['PLASTIC', 20, 6, 'REFINERY', 30],
  ['PACKAGED WATER', 60, 2, 'PACKAGER', 10],
  ['COOLING SYSTEM', 6, 10, 'BLENDER', 75],
];
const COUNTS = { items: 140, recipes: 211, alternates: 88, buildings: 477, machines: 9, phases: 5 };
if (MACHINES.length !== COUNTS.machines) throw new Error('machine list does not match the count');
const machineNo = (name) => {
  const i = MACHINES.indexOf(name);
  if (i < 0) throw new Error(`unknown machine ${name}`);
  return i + 1;
};
const recipeData = RECIPES.map(([name, rate, cycle, machine, mw]) => [name, rate, cycle, machineNo(machine), mw]);
// What the listing's check line compares against: every number in the recipe DATA, added up.
const DATA_TOTAL = recipeData.reduce((t, r) => t + r[1] + r[2] + r[3] + r[4], 0);
const basicNum = (n) => String(n).replace(/^0\./, '.');

// ------------------------------------------------------------------ Program 1, the listing
// Commodore 64 BASIC V2 rules: upper case, keys in braces, lines of at most 78 characters as
// typed from the page, row-break spaces included (the machine's editor takes 80, and a line of
// exactly 80 is awkward to enter), nothing printed wider than 39 columns, no variable name that
// hides a keyword. Links may only sit on REM text. Spaces outside quotes are for the reader: BASIC
// ignores them, and so does the checksum.
const rec = (name) => {
  const r = recipeData.find((x) => x[0] === name);
  if (!r) throw new Error(`no recipe for ${name}`);
  return r.map(basicNum).join(',');
};
const pair = (a, b) => `DATA ${rec(a)},${PREF}${rec(b)}`;
const CHECK_LINE = 80, MENU_LINE = 100, EXAMPLE_LINE = 110;
const PROGRAM = [
  [10, `PRINT"{CLR}{DOWN}{RVS} ${B('ULTRA-SATISFACTORY')} {OFF}"`],
  [20, 'REM COMPANION APP FOR SATISFACTORY, THE FACTORY-BUILDING GAME'],
  [30, 'REM EVERY RECIPE, BUILDING AND SPACE ELEVATOR OBJECTIVE'],
  [40, 'REM UNOFFICIAL FAN PROJECT. NO TIES TO COFFEE STAIN STUDIOS'],
  [50, `REM THE FULL-SIZE APP: ${A('OPEN IT LIVE', LIVE)}, OR ${A('RUN IT LOCALLY', '#run-it-locally')}`],
  [60, `REM ${A("WHAT'S INSIDE", '#whats-inside')}, ${A("HOW IT'S BUILT", '#how-its-built')}, ${A('DATA & CREDITS', '#data--credits')}, ${A('LICENSE', '#license')}`],
  [70, 'FOR I=1 TO 12:READ N$,R,S,M,W:T=T+R+S+M+W:NEXT'],
  [CHECK_LINE, `IF T<>${basicNum(DATA_TOTAL)} THEN PRINT"DATA TYPO. ${PREF}A MACHINE IS STARVED.":END`],
  [90, `FOR I=1 TO 9:${PREF}READ M$(I):NEXT`],
  [MENU_LINE, `PRINT"{DOWN}1 OBJECTIVES 2 ITEMS ${PREF}3 BUILDINGS"`],
  [EXAMPLE_LINE, `INPUT"TAB";K:ON K GOSUB 200,300,400:GOTO ${MENU_LINE}`],
  [200, `PRINT"PHASE 1 OF ${COUNTS.phases}, AUTOMATION BASICS:"`],
  [210, 'PRINT"SMART PLATING X50":PRINT"VERSATILE FRAMEWORK X100"'],
  [220, 'PRINT"AUTOMATED WIRING X500":RETURN'],
  [300, 'INPUT"ITEM";Q$:RESTORE:FOR I=1 TO 12:READ N$,R,S,M,W:IF N$=Q$ THEN 320'],
  [310, `NEXT:PRINT"NOT ON THIS PAGE. THE APP HAS ${COUNTS.items}.":RETURN`],
  [320, 'PRINT R"A MINUTE FROM ONE "M$(M):PRINT S"SEC,"W"MW":RETURN'],
  [400, `FOR I=1 TO 9:PRINT M$(I):NEXT:PRINT"${COUNTS.buildings - COUNTS.machines} MORE IN THE REAL APP.":RETURN`],
  [500, pair('IRON INGOT', 'IRON PLATE')],
  [510, pair('SCREW', 'STEEL INGOT')],
  [520, pair('MODULAR FRAME', 'SMART PLATING')],
  [530, pair('VERSATILE FRAMEWORK', 'PLASTIC')],
  [540, pair('AUTOMATED WIRING', 'PACKAGED WATER')],
  [550, pair('MODULAR ENGINE', 'COOLING SYSTEM')],
  [560, `DATA ${MACHINES.slice(0, 5).join(',')}`],
  [570, `DATA ${MACHINES.slice(5).join(',')}`],
];
{
  // every recipe appears in the DATA exactly once, and the recipe DATA comes before the machines
  const all = PROGRAM.filter(([n]) => n >= 500 && n < 560).map(([, t]) => t).join(',');
  for (const r of recipeData) if (all.split(`${r[0]},`).length !== 2) throw new Error(`${r[0]} is not in the DATA exactly once`);
}

// The checksum column: character codes of the line as printed, line number included, spaces
// skipped, summed, modulo 256. (A plain sum: it catches a wrong or missing character, and,
// like every plain sum, not two characters swapped. Line 80 is the second opinion.)
const checksum = (line) => [...line].reduce((t, c) => (c === ' ' ? t : t + c.charCodeAt(0)), 0) % 256;

for (const [n, text] of PROGRAM) {
  const plain = `${n} ${visible(text)}`;
  if (plain.length > 78) throw new Error(`line ${n} is ${plain.length} characters: too long to type in`);
  if (/[^\x20-\x7e]/.test(plain)) throw new Error(`line ${n} has a character outside printable ASCII`);
  if (/[a-z]/.test(plain)) throw new Error(`line ${n} has lower case`);
}

// ------------------------------------------------------------------ a small BASIC V2
// Enough of the dialect to run Program 1 honestly: PRINT (with number padding and the brace
// keys), INPUT, DIM, LET, FOR/NEXT, READ/DATA, IF/THEN, GOTO, GOSUB/RETURN, ON, END, REM,
// expressions with AND/OR/NOT and string comparison. Keywords are recognised wherever they
// start, as the real machine's tokeniser does, so a variable name cannot swallow one.
const KEYWORDS = ['RESTORE', 'PRINT', 'INPUT', 'RETURN', 'GOSUB', 'GOTO', 'NEXT', 'READ', 'DATA', 'THEN', 'STEP', 'DIM', 'FOR', 'REM', 'END', 'LET', 'AND', 'NOT', 'IF', 'ON', 'OR', 'TO'];
function runBasic(programLines, inputs) {
  const lines = programLines.map(([n, text]) => ({ n, text })).sort((a, b) => a.n - b.n);
  const indexOf = (n) => {
    const i = lines.findIndex((l) => l.n === n);
    if (i < 0) throw new Error(`?UNDEF'D STATEMENT: no line ${n}`);
    return i;
  };
  // DATA items, in line order. Unquoted strings lose leading spaces, as on the real machine.
  const data = [];
  for (const l of lines) {
    let inQuote = false;
    for (let p = 0; p < l.text.length; p++) {
      const c = l.text[p];
      if (c === '"') inQuote = !inQuote;
      if (!inQuote && l.text.startsWith('REM', p)) break;
      if (!inQuote && l.text.startsWith('DATA', p)) {
        let q = p + 4, item = '', quoted = false;
        const flush = () => { data.push(quoted ? item : item.replace(/^ +/, '')); item = ''; quoted = false; };
        for (; q < l.text.length; q++) {
          const d = l.text[q];
          if (d === '"') { inQuote = !inQuote; quoted = true; continue; }
          if (!inQuote && d === ',') { flush(); continue; }
          if (!inQuote && d === ':') break;
          item += d;
        }
        flush();
        p = q;
      }
    }
  }
  let dataPtr = 0;
  const vars = new Map();
  const arrays = new Map();
  const stack = []; // FOR and GOSUB frames
  const inputQueue = [...inputs];
  // the screen: rows of cells
  const screen = [[]];
  let rvs = false;
  const row = () => screen[screen.length - 1];
  const newline = () => { screen.push([]); rvs = false; };
  const putChar = (ch) => {
    row().push({ ch, rvs });
    if (row().length >= SCREEN_W) throw new Error(`the listing prints a row ${SCREEN_W} columns wide: "${row().map((c) => c.ch).join('')}"`);
  };
  const putString = (s) => {
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '{') {
        const end = s.indexOf('}', i);
        if (end < 0) throw new Error(`unclosed brace key in "${s}"`);
        const m = s.slice(i + 1, end).match(/^(?:(\d+) )?([A-Z]+)$/);
        if (!m) throw new Error(`bad brace key {${s.slice(i + 1, end)}}`);
        const count = Number(m[1] || 1);
        for (let k = 0; k < count; k++) {
          if (m[2] === 'CLR') { screen.length = 0; screen.push([]); rvs = false; }
          else if (m[2] === 'DOWN') { if (row().length) throw new Error('{DOWN} used mid-row'); screen.push([]); }
          else if (m[2] === 'RVS') rvs = true;
          else if (m[2] === 'OFF') rvs = false;
          else if (m[2] === 'SPACES' || m[2] === 'SPACE') putChar(' ');
          else throw new Error(`unknown brace key {${m[2]}}`);
        }
        i = end;
      } else putChar(s[i]);
    }
  };
  const numText = (v) => {
    const s = basicNum(Math.abs(v));
    return (v < 0 ? '-' : ' ') + s + ' ';
  };

  let li = 0, pos = 0, src = lines[0].text;
  const jump = (n) => { li = indexOf(n); pos = 0; src = lines[li].text; };
  const skip = () => { while (src[pos] === ' ') pos++; };
  const peekKw = () => { skip(); return KEYWORDS.find((k) => src.startsWith(k, pos)) || null; };
  const eat = (s) => { skip(); if (src.startsWith(s, pos)) { pos += s.length; return true; } return false; };
  const need = (s) => { if (!eat(s)) throw new Error(`?SYNTAX ERROR IN ${lines[li].n}: expected ${s} at "${src.slice(pos)}"`); };
  const atEnd = () => { skip(); return pos >= src.length || src[pos] === ':'; };
  const readName = () => {
    skip();
    if (!/[A-Z]/.test(src[pos] || '')) return null;
    let name = src[pos++];
    if (/[A-Z0-9]/.test(src[pos] || '') && !KEYWORDS.some((k) => src.startsWith(k, pos))) name += src[pos++];
    if (/[A-Z0-9]/.test(src[pos] || '') && !KEYWORDS.some((k) => src.startsWith(k, pos))) throw new Error(`line ${lines[li].n}: variable name longer than two characters`);
    if (src[pos] === '$') name += src[pos++];
    return name;
  };
  // a reference: { name, idx } where idx is null for a plain variable
  const readRef = () => {
    const name = readName();
    if (!name) throw new Error(`?SYNTAX ERROR IN ${lines[li].n}: expected a variable at "${src.slice(pos)}"`);
    skip();
    if (src[pos] === '(') {
      pos++;
      const idx = numExpr();
      need(')');
      return { name, idx };
    }
    return { name, idx: null };
  };
  const isStr = (name) => name.endsWith('$');
  const getRef = ({ name, idx }) => {
    if (idx === null) return vars.has(name) ? vars.get(name) : (isStr(name) ? '' : 0);
    if (!arrays.has(name)) arrays.set(name, new Array(11).fill(isStr(name) ? '' : 0));
    const arr = arrays.get(name);
    if (idx < 0 || idx >= arr.length) throw new Error(`?BAD SUBSCRIPT IN ${lines[li].n}: ${name}(${idx})`);
    return arr[Math.floor(idx)];
  };
  const setRef = ({ name, idx }, value) => {
    if (idx === null) { vars.set(name, value); return; }
    if (!arrays.has(name)) arrays.set(name, new Array(11).fill(isStr(name) ? '' : 0));
    const arr = arrays.get(name);
    if (idx < 0 || idx >= arr.length) throw new Error(`?BAD SUBSCRIPT IN ${lines[li].n}: ${name}(${idx})`);
    arr[Math.floor(idx)] = value;
  };
  // expressions. Values are JS numbers or strings; true is -1, false is 0.
  function primary() {
    skip();
    const c = src[pos];
    if (c === '"') {
      const end = src.indexOf('"', pos + 1);
      const s = src.slice(pos + 1, end < 0 ? src.length : end);
      pos = end < 0 ? src.length : end + 1;
      return s;
    }
    if (c === '(') { pos++; const v = orExpr(); need(')'); return v; }
    if (c === '-') { pos++; return -primary(); }
    if (/[0-9.]/.test(c || '')) {
      const m = src.slice(pos).match(/^[0-9]*\.?[0-9]*/)[0];
      pos += m.length;
      return Number(m === '.' ? 0 : m);
    }
    if (peekKw()) throw new Error(`?SYNTAX ERROR IN ${lines[li].n}: keyword where a value should be at "${src.slice(pos)}"`);
    return getRef(readRef());
  }
  function mulExpr() {
    let v = primary();
    for (;;) {
      if (eat('*')) v *= primary();
      else if (eat('/')) v /= primary();
      else return v;
    }
  }
  function addExpr() {
    let v = mulExpr();
    for (;;) {
      if (eat('+')) { const r = mulExpr(); if (typeof v !== typeof r) throw new Error(`?TYPE MISMATCH IN ${lines[li].n}`); v += r; }
      else if (eat('-')) v -= mulExpr();
      else return v;
    }
  }
  function relExpr() {
    const l = addExpr();
    skip();
    const op = ['<>', '<=', '>=', '=', '<', '>'].find((o) => src.startsWith(o, pos));
    if (!op) return l;
    pos += op.length;
    const r = addExpr();
    if (typeof l !== typeof r) throw new Error(`?TYPE MISMATCH IN ${lines[li].n}`);
    const t = { '<>': l !== r, '<=': l <= r, '>=': l >= r, '=': l === r, '<': l < r, '>': l > r }[op];
    return t ? -1 : 0;
  }
  function notExpr() { return eat('NOT') ? ~notExpr() : relExpr(); }
  function andExpr() { let v = notExpr(); while (eat('AND')) v &= notExpr(); return v; }
  function orExpr() { let v = andExpr(); while (eat('OR')) v |= andExpr(); return v; }
  function numExpr() { const v = orExpr(); if (typeof v !== 'number') throw new Error(`?TYPE MISMATCH IN ${lines[li].n}`); return v; }
  const lineNumber = () => {
    skip();
    const m = src.slice(pos).match(/^[0-9]+/);
    if (!m) throw new Error(`?SYNTAX ERROR IN ${lines[li].n}: expected a line number at "${src.slice(pos)}"`);
    pos += m[0].length;
    return Number(m[0]);
  };

  let steps = 0;
  let stopped = null;
  while (!stopped) {
    if (++steps > 20000) throw new Error('the listing ran for 20000 statements without stopping');
    skip();
    while (src[pos] === ':') { pos++; skip(); }
    if (pos >= src.length) {
      li++;
      if (li >= lines.length) { stopped = 'end of program'; break; }
      pos = 0; src = lines[li].text;
      continue;
    }
    const kw = peekKw();
    if (kw) pos += kw.length;
    if (kw === 'REM') { pos = src.length; }
    else if (kw === 'DATA') { while (pos < src.length && src[pos] !== ':') pos++; }
    else if (kw === 'END') { stopped = 'END'; }
    else if (kw === 'RESTORE') { dataPtr = 0; }
    else if (kw === 'PRINT') {
      let trailing = false;
      while (!atEnd()) {
        if (eat(';')) { trailing = true; continue; }
        if (eat(',')) throw new Error('comma tab stops are not implemented: the listing should not use them');
        const v = orExpr();
        putString(typeof v === 'number' ? numText(v) : v);
        trailing = false;
      }
      if (!trailing) newline();
    } else if (kw === 'INPUT') {
      skip();
      if (src[pos] === '"') { putString(primary()); need(';'); }
      const ref = readRef();
      putString('? ');
      if (!inputQueue.length) { stopped = 'waiting at INPUT'; break; }
      const typed = inputQueue.shift();
      for (const ch of typed) row().push({ ch, rvs: false, typed: true });
      newline();
      if (isStr(ref.name)) setRef(ref, typed);
      else {
        if (!/^ *-?[0-9]*\.?[0-9]+ *$/.test(typed)) throw new Error(`?REDO FROM START: "${typed}" is not a number`);
        setRef(ref, Number(typed));
      }
    } else if (kw === 'DIM') {
      do {
        const name = readName();
        need('(');
        const size = numExpr();
        need(')');
        if (arrays.has(name)) throw new Error(`?REDIM'D ARRAY IN ${lines[li].n}`);
        arrays.set(name, new Array(size + 1).fill(isStr(name) ? '' : 0));
      } while (eat(','));
    } else if (kw === 'FOR') {
      const name = readName();
      need('=');
      vars.set(name, numExpr());
      need('TO');
      const limit = numExpr();
      const step = eat('STEP') ? numExpr() : 1;
      // a second FOR on the same variable replaces the first, as on the real machine
      for (let k = stack.length - 1; k >= 0 && stack[k].type === 'for'; k--) if (stack[k].name === name) { stack.length = k; break; }
      stack.push({ type: 'for', name, limit, step, li, pos });
    } else if (kw === 'NEXT') {
      const name = atEnd() ? null : readName();
      let f = stack[stack.length - 1];
      while (f && f.type === 'for' && name && f.name !== name) { stack.pop(); f = stack[stack.length - 1]; }
      if (!f || f.type !== 'for') throw new Error(`?NEXT WITHOUT FOR IN ${lines[li].n}`);
      const v = vars.get(f.name) + f.step;
      vars.set(f.name, v);
      if (f.step >= 0 ? v <= f.limit : v >= f.limit) { li = f.li; src = lines[li].text; pos = f.pos; }
      else stack.pop();
    } else if (kw === 'READ') {
      do {
        const ref = readRef();
        if (dataPtr >= data.length) throw new Error(`?OUT OF DATA IN ${lines[li].n}`);
        const item = data[dataPtr++];
        if (isStr(ref.name)) setRef(ref, item);
        else {
          if (!/^ *-?[0-9]*\.?[0-9]* *$/.test(item)) throw new Error(`?SYNTAX ERROR: DATA item "${item}" read into a number`);
          setRef(ref, Number(item.trim() === '' || item.trim() === '.' ? 0 : item));
        }
      } while (eat(','));
    } else if (kw === 'IF') {
      const cond = numExpr();
      need('THEN');
      if (!cond) { pos = src.length; }
      else { skip(); if (/[0-9]/.test(src[pos] || '')) jump(lineNumber()); }
    } else if (kw === 'GOTO') { jump(lineNumber()); }
    else if (kw === 'GOSUB') {
      const n = lineNumber();
      stack.push({ type: 'gosub', li, pos });
      jump(n);
    } else if (kw === 'RETURN') {
      while (stack.length && stack[stack.length - 1].type !== 'gosub') stack.pop();
      if (!stack.length) throw new Error(`?RETURN WITHOUT GOSUB IN ${lines[li].n}`);
      const f = stack.pop();
      li = f.li; src = lines[li].text; pos = f.pos;
    } else if (kw === 'ON') {
      const k = Math.floor(numExpr());
      const sub = eat('GOSUB');
      if (!sub) need('GOTO');
      const targets = [lineNumber()];
      while (eat(',')) targets.push(lineNumber());
      if (k >= 1 && k <= targets.length) {
        if (sub) stack.push({ type: 'gosub', li, pos });
        jump(targets[k - 1]);
      }
    } else if (kw === 'LET' || kw === null) {
      const ref = readRef();
      need('=');
      const v = orExpr();
      if ((typeof v === 'string') !== isStr(ref.name)) throw new Error(`?TYPE MISMATCH IN ${lines[li].n}`);
      setRef(ref, v);
    } else throw new Error(`?SYNTAX ERROR IN ${lines[li].n}: ${kw} cannot start a statement`);
  }
  if (!row().length) screen.pop();
  return { screen, stopped, steps };
}
const screenText = (screen) => screen.map((r) => r.map((c) => c.ch).join('').replace(/ +$/, '')).join('\n');

// ------------------------------------------------------------------ Program 2, machine code
// 6502, assembled by hand for $C000 (49152): a loop that prints a zero-terminated message
// through the machine's character-output call at $FFD2.
//   C000  A2 00      LDX #$00
//   C002  BD 0E C0   LDA $C00E,X
//   C005  F0 06      BEQ $C00D
//   C007  20 D2 FF   JSR $FFD2
//   C00A  E8         INX
//   C00B  D0 F5      BNE $C002
//   C00D  60         RTS
//   C00E  the message, then 13 (RETURN) and 0
const ML_BASE = 49152;
const ML_MESSAGE = 'COMPLY. OVERCLOCK. REPEAT.';
const ML_CODE = [0xa2, 0x00, 0xbd, 0x0e, 0xc0, 0xf0, 0x06, 0x20, 0xd2, 0xff, 0xe8, 0xd0, 0xf5, 0x60];
const ML_BYTES = [...ML_CODE, ...[...ML_MESSAGE].map((c) => c.charCodeAt(0)), 13, 0];
if (ML_BYTES.length % 6) throw new Error(`Program 2 is ${ML_BYTES.length} bytes: pick a message that fills whole rows of six`);
const mlRows = [];
for (let i = 0; i < ML_BYTES.length; i += 6) {
  const addr = ML_BASE + i;
  const six = ML_BYTES.slice(i, i + 6);
  mlRows.push({ addr, six, check: (addr + six.reduce((a, b) => a + b, 0)) % 256 });
}
const mlText = ({ addr, six, check }) => `${addr} :${[...six, check].map((b) => String(b).padStart(3, '0')).join(',')}`;
// Parse the printed rows back, check every row's seventh number, then execute.
function run6502(rows) {
  const mem = new Map();
  for (const text of rows) {
    const m = text.match(/^(\d+) :((?:\d{3},){6}\d{3})$/);
    if (!m) throw new Error(`machine-code row is malformed: ${text}`);
    const addr = Number(m[1]);
    const nums = m[2].split(',').map(Number);
    const check = nums.pop();
    if ((addr + nums.reduce((a, b) => a + b, 0)) % 256 !== check) throw new Error(`machine-code row ${addr} fails its check byte`);
    nums.forEach((b, k) => mem.set(addr + k, b));
  }
  const peek = (a) => { if (!mem.has(a)) throw new Error(`6502 read outside the program at ${a}`); return mem.get(a); };
  let pc = ML_BASE, a = 0, x = 0, z = false, out = '';
  const setNZ = (v) => { z = v === 0; return v; };
  for (let steps = 0; steps < 5000; steps++) {
    const op = peek(pc);
    if (op === 0xa2) { x = setNZ(peek(pc + 1)); pc += 2; }
    else if (op === 0xbd) { a = setNZ(peek((peek(pc + 1) | (peek(pc + 2) << 8)) + x)); pc += 3; }
    else if (op === 0xf0) { const d = peek(pc + 1); pc += 2; if (z) pc += d < 128 ? d : d - 256; }
    else if (op === 0xd0) { const d = peek(pc + 1); pc += 2; if (!z) pc += d < 128 ? d : d - 256; }
    else if (op === 0xe8) { x = setNZ((x + 1) & 255); pc += 1; }
    else if (op === 0x20) {
      const target = peek(pc + 1) | (peek(pc + 2) << 8);
      if (target !== 0xffd2) throw new Error('6502: JSR to somewhere other than character output');
      out += a === 13 ? '\n' : String.fromCharCode(a);
      pc += 3;
    } else if (op === 0x60) return out;
    else throw new Error(`6502: opcode ${op} at ${pc} is not one of the seven this build knows`);
  }
  throw new Error('6502: did not return');
}

// ------------------------------------------------------------------ setting the columns
// A BASIC line as the magazine sets it: "10 " then the text, wrapped to the column, the
// continuation hanging under the text, and ":rem NNN" pushed to the right edge of its last row
// (or onto a row of its own when the last row is full).
// Rows are only broken where a reader can rejoin them with one space and get the same program:
// at a space anywhere, or, outside quotes, after a comma, colon or semicolon (BASIC ignores the
// extra space there, and a DATA item loses its leading space).
function setLine(n, text) {
  const cells = toCells(text);
  const plain = cells.map((c) => c.ch).join('');
  const prefix = `${n} `;
  const kind = plain.startsWith('REM') ? 'rem' : plain.startsWith('DATA') ? 'data' : 'code';
  // breaks: a row may end just before cell `end`; the next row starts at cell `next`
  const breaks = [];
  let inQuote = false;
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i].ch;
    const free = kind === 'code' && !inQuote;
    if (c === '"') {
      if (!inQuote && kind === 'code' && i > 0) breaks.push({ end: i, next: i, cost: 2 }); // before an opening quote
      inQuote = !inQuote;
      if (!inQuote && kind === 'code' && i + 1 < cells.length) breaks.push({ end: i + 1, next: i + 1, cost: 2 }); // after a closing quote
      continue;
    }
    if (c === ' ') {
      const lone = i > 0 && cells[i - 1].ch !== ' ' && i + 1 < cells.length && cells[i + 1].ch !== ' ';
      if (lone) breaks.push({ end: i, next: i + 1, cost: cells[i].pref ? -5 : free ? 4 : kind === 'data' ? 5 : 1 });
    } else if (free && c === ':') breaks.push({ end: i + 1, next: i + 1, cost: cells[i].pref ? -5 : 0 });
    else if (free && /[,;]/.test(c)) breaks.push({ end: i + 1, next: i + 1, cost: 3 });
    else if (kind === 'data' && c === ',') breaks.push({ end: i + 1, next: i + 1, cost: cells[i].pref ? -5 : 2 });
  }
  const sum = checksum(prefix + plain);
  const rem = `:rem ${sum}`;
  const width = COL_W - prefix.length;
  // Fewest rows first (a row holding only the checksum counts as a row), then the tidiest
  // breaks, then the fullest early rows.
  const better = (a, b) => !b || a.rows < b.rows || (a.rows === b.rows && (a.cost < b.cost || (a.cost === b.cost && a.fill > b.fill)));
  const memo = new Map();
  const solve = (start) => {
    if (memo.has(start)) return memo.get(start);
    let best = null;
    const rest = cells.length - start;
    if (rest <= width) {
      const fits = rest + 1 + rem.length <= width;
      best = { rows: fits ? 1 : 2, cost: fits ? 0 : 1.5, fill: 0, cuts: [] };
    }
    for (const b of breaks) {
      if (b.end <= start || b.end - start > width || b.next >= cells.length) continue;
      const sub = solve(b.next);
      if (!sub) continue;
      const cand = { rows: sub.rows + 1, cost: sub.cost + b.cost, fill: (b.end - start) + sub.fill / 100, cuts: [b, ...sub.cuts] };
      if (better(cand, best)) best = cand;
    }
    memo.set(start, best);
    return best;
  };
  const plan = solve(0);
  if (!plan) throw new Error(`line ${n}: cannot be set in a ${COL_W}-column column: "${plain}"`);
  const rows = [];
  let start = 0;
  for (const b of plan.cuts) { rows.push(cells.slice(start, b.end)); start = b.next; }
  rows.push(cells.slice(start));
  const out = rows.map((r, k) => (k === 0 ? prefix : ' '.repeat(prefix.length)) + fromCells(r));
  const last = out[out.length - 1];
  if (len(last) + 1 + rem.length <= COL_W) out[out.length - 1] = padR(last, COL_W - rem.length) + rem;
  else out.push(' '.repeat(COL_W - rem.length) + rem);
  return { n, rows: out, sum };
}
const setLines = PROGRAM.map(([n, text]) => setLine(n, text));

// Read a set listing back the way a typist would: join a line's rows with one space, take the
// number after ":rem" as the printed checksum. Returns [[n, text, printedSum], ...].
function typeIn(rows) {
  const out = [];
  for (const raw of rows) {
    let r = visible(raw).replace(/ +$/, '');
    if (!r.trim()) continue;
    let sum = null;
    const m = r.match(/ *:rem (\d+)$/);
    if (m) { sum = Number(m[1]); r = r.slice(0, r.length - m[0].length); }
    const head = r.match(/^(\d+) (.*)$/);
    if (head) out.push([Number(head[1]), head[2], null]);
    else if (r.trim()) {
      if (!out.length) throw new Error(`continuation row with no line above it: ${r}`);
      out[out.length - 1][1] += ` ${r.trim()}`;
    }
    if (sum !== null) out[out.length - 1][2] = sum;
  }
  return out;
}

// ------------------------------------------------------------------ the page
// Two columns. Program 1 runs down the first and into the second; Program 2 closes the second.
const P1_HEAD = [B('Program 1: ULTRA-SATISFACTORY'), ''];
const P2_HEAD = ['', B('Program 2: A Word From Management'), ''];
const mlLines = mlRows.map(mlText);
const p2Block = [...P2_HEAD, ...mlLines];
const listingRows = setLines.flatMap((l) => l.rows);
const totalRows = P1_HEAD.length + listingRows.length + p2Block.length;
// split between BASIC lines, wherever the two columns come out closest in height
let split = 0;
{
  let best = Infinity, rows1 = P1_HEAD.length;
  for (let k = 0; k <= setLines.length; k++) {
    const diff = Math.abs(rows1 - (totalRows - rows1));
    if (diff <= best) { best = diff; split = k; }
    if (k < setLines.length) rows1 += setLines[k].rows.length;
  }
}
const col1 = [...P1_HEAD, ...setLines.slice(0, split).flatMap((l) => l.rows)];
const col2 = [...setLines.slice(split).flatMap((l) => l.rows), ...p2Block];
const bodyRows = Math.max(col1.length, col2.length);
while (col1.length < bodyRows) col1.push('');
while (col2.length < bodyRows) col2.unshift(''); // keep Program 2 on the foot of the column
for (const r of [...col1, ...col2]) if (len(r) > COL_W) throw new Error(`column row is ${len(r)} wide: ${visible(r)}`);
const footL = `${PAGE_NO}   ${B(MAGAZINE)}   ${ISSUE}`;
const footR = 'The number after :rem is a checksum.';
const pageRows = [
  ...col1.map((l, k) => (padR(l, COL_W) + ' '.repeat(GUTTER) + col2[k])),
  '-'.repeat(PAGE_W),
  footL + ' '.repeat(PAGE_W - len(footL) - len(footR)) + footR,
];

// ------------------------------------------------------------------ the proofs
// 1. Run the listing as written.
const SESSION = ['1', '2', 'SMART PLATING', '3', '2', 'NUCLEAR PASTA'];
const asWritten = runBasic(PROGRAM.map(([n, text]) => [n, visible(text)]), SESSION);
if (asWritten.stopped !== 'waiting at INPUT') throw new Error(`the listing stopped early: ${asWritten.stopped}`);
// 2. Type it back in from the page: both columns, top to bottom, exactly as printed.
const col1Text = pageRows.slice(0, bodyRows).map((r) => fromCells(toCells(r).slice(0, COL_W)));
const col2Text = pageRows.slice(0, bodyRows).map((r) => fromCells(toCells(r).slice(COL_W + GUTTER)));
const isListing = (r) => /^(\d+ | +\S)/.test(visible(r)) && !/^\d+ :/.test(visible(r));
const typed = typeIn([...col1Text.slice(P1_HEAD.length), ...col2Text.filter((r, k) => k < col2Text.length - p2Block.length)].filter(isListing));
if (typed.length !== PROGRAM.length) throw new Error(`typed back ${typed.length} lines, the program has ${PROGRAM.length}`);
for (const [n, text, sum] of typed) {
  if (`${n} ${text}`.length > 78) throw new Error(`line ${n} is ${`${n} ${text}`.length} characters when typed from the page: too long to enter`);
  if (sum === null) throw new Error(`line ${n} has no checksum on the page`);
  if (checksum(`${n} ${text}`) !== sum) throw new Error(`line ${n}: typed from the page it sums to ${checksum(`${n} ${text}`)}, the page says ${sum}`);
}
const asTyped = runBasic(typed.map(([n, text]) => [n, text]), SESSION);
if (screenText(asTyped.screen) !== screenText(asWritten.screen)) {
  console.log(pageRows.map(visible).join('\n'));
  console.log(screenText(asWritten.screen));
  console.log('=====TYPED');
  console.log(typed);
  console.log(screenText(asTyped.screen));
  throw new Error('the listing typed back from the page runs differently from the source');
}
// 3. One wrong digit in the DATA must trip the check line (and a swap of two digits must slip past
//    the line checksum, which is why that line exists).
const TYPO_LINE = 510, TYPO_FROM = 'STEEL INGOT,45,', TYPO_TO = 'STEEL INGOT,54,';
const swapped = typed.map(([n, text]) => [n, n === TYPO_LINE ? text.replace(TYPO_FROM, TYPO_TO) : text]);
if (swapped.every(([n, text], k) => text === typed[k][1])) throw new Error(`the typo demo did not change line ${TYPO_LINE}`);
const typoRun = runBasic(swapped, SESSION);
if (typoRun.stopped !== 'END') throw new Error(`a typo in the DATA was not caught by line ${CHECK_LINE}`);
const typoLine = swapped.find(([n]) => n === TYPO_LINE);
if (checksum(`${TYPO_LINE} ${typoLine[1]}`) !== typed.find(([n]) => n === TYPO_LINE)[2]) throw new Error('expected a digit swap to keep the same line checksum');
// 4. Run Program 2 from its printed rows.
const mlOut = run6502(mlLines);
if (mlOut !== `${ML_MESSAGE}\n`) throw new Error(`Program 2 printed "${mlOut}"`);

// ------------------------------------------------------------------ plain-text checks
function checkBlock(name, rows, max = PAGE_W) {
  rows.forEach((r, k) => {
    const v = visible(r);
    if ([...v].length > max) throw new Error(`${name} row ${k + 1} is ${[...v].length} columns`);
    if (/[^\x20-\x7e]/.test(v)) throw new Error(`${name} row ${k + 1} is not plain ASCII: ${v}`);
  });
  return rows.map((r) => toHtml(r.replace(/ +$/, ''))).join('\n');
}

// ------------------------------------------------------------------ the RUN transcript
// The screen the interpreter produced, with the margin notes a reviewer would pencil in.
const NOTE_COL = Math.max(...asWritten.screen.map((r) => r.length)) + 3;
const NOTE_W = PAGE_W - NOTE_COL - 3;
function transcript(screen, notes) {
  const rows = screen.map((full) => {
    const r = [...full];
    while (r.length && r[r.length - 1].ch === ' ') r.pop();
    let out = '';
    let k = 0;
    while (k < r.length) {
      let j = k;
      const strong = (c) => Boolean(c.rvs || c.typed);
      while (j < r.length && strong(r[j]) === strong(r[k])) j++;
      const run = r.slice(k, j).map((c) => c.ch).join('');
      out += strong(r[k]) ? B(run) : run;
      k = j;
    }
    return out;
  });
  const seen = new Map();
  const out = [...rows];
  rows.forEach((r, i) => {
    const key = visible(r).replace(/ +$/, '');
    const nth = (seen.get(key) || 0) + 1;
    seen.set(key, nth);
    const hit = notes.find((n) => n.at === key && (n.nth || 1) === nth);
    if (!hit) return;
    hit.used = true;
    hit.text.forEach((t, k) => {
      if (t.length > NOTE_W) throw new Error(`margin note too long (${t.length} > ${NOTE_W}): ${t}`);
      if (i + k >= out.length) out.push('');
      out[i + k] = padR(out[i + k], NOTE_COL) + (k === 0 ? '<- ' : '   ') + t;
    });
  });
  for (const n of notes) if (!n.used) throw new Error(`margin note never placed: ${n.at}`);
  return out;
}
const runRows = [
  B('RUN'),
  ...transcript(asWritten.screen, [
    { at: ' ULTRA-SATISFACTORY', text: ['Line 10: clear the screen, then the', 'name in reverse video.'] },
    { at: 'TAB? 1', text: [`OBJECTIVES. The app has all ${COUNTS.phases} phases;`, 'the page had room for one.'] },
    { at: 'TAB? 2', text: [`ITEMS. The app searches all ${COUNTS.items} as`, 'you type, and adds the ingredients', 'with their per-minute rates.'] },
    { at: 'TAB? 3', text: [`BUILDINGS. The ${COUNTS.machines} that make things.`, `The app has all ${COUNTS.buildings}, and what`, 'each one makes.'] },
    { at: 'ITEM? NUCLEAR PASTA', text: ['A real item. The column was full.'] },
    { at: 'TAB?', text: ['RUN/STOP and RESTORE. Open the real one.'] },
  ]),
  '',
  B('SYS 49152'),
  ...mlOut.replace(/\n$/, '').split('\n').map((l, k) => (k === 0 ? padR(l, NOTE_COL) + `<- Program 2, all ${ML_BYTES.length} bytes of it.` : l)),
];
const typoShown = `${TYPO_LINE} ${visible(PROGRAM.find(([n]) => n === TYPO_LINE)[1]).replace(TYPO_FROM, TYPO_TO)}`;
const typoRows = [
  typoShown,
  B('RUN'),
  ...transcript(typoRun.screen, []),
];
const typoSum = checksum(typoShown);

// ------------------------------------------------------------------ the 6502, annotated
const asm = [
  [2, 'LDX #0', 'start at the first character'],
  [3, `LDA ${ML_BASE + ML_CODE.length},X`, 'fetch it'],
  [2, `BEQ ${ML_BASE + 13}`, 'a zero means the message is over'],
  [3, 'JSR 65490', 'print it: the character-output call'],
  [1, 'INX', 'next character'],
  [2, `BNE ${ML_BASE + 2}`, 'and round again'],
  [1, 'RTS', 'back to BASIC'],
];
if (asm.reduce((t, a) => t + a[0], 0) !== ML_CODE.length) throw new Error('the annotated 6502 does not cover the code bytes');
const asmRows = [];
{
  let at = 0;
  for (const [size, op, note] of asm) {
    const bytes = ML_CODE.slice(at, at + size).map((b) => String(b).padStart(3, '0')).join(',');
    asmRows.push(`${ML_BASE + at}  ${padR(bytes, 11)}  ${padR(op, 13)}  ${note}`);
    at += size;
  }
  asmRows.push(`${ML_BASE + at}  ${[...ML_MESSAGE.slice(0, 6)].map((c) => String(c.charCodeAt(0)).padStart(3, '0')).join(',')} ...  "${ML_MESSAGE}"`);
  asmRows.push(`${' '.repeat(7)}then 013 (RETURN) and 000 (stop)`);
}

// ------------------------------------------------------------------ the back pages
const sig = (s) => ' '.repeat(42) + s;
const LETTERS = [
  B('LETTERS'),
  '',
  `Sir: I typed in all ${PROGRAM.length} lines and the machine told me a Screw is made 40 to the`,
  'minute. My storage boxes have known this for some time. There are eleven of',
  'them. It is all Screws.',
  sig('W. Sprag (Mrs), address withheld'),
  '',
  'Sir: Your listing takes no position on manifolds versus load balancers.',
  'Kindly take one. There is a wager on it, and a belt.',
  sig('Col. B. Underflow (retd.)'),
  `  ${B('The Editor writes:')} Manifolds. The Deputy Editor has asked to be moved.`,
  '',
  `Sir: Line ${CHECK_LINE} said a machine was starved. I went and looked. One was. I should`,
  'like to know how long your magazine has been watching my factory.',
  sig('Name and coordinates supplied'),
  '',
  'Sir: I clipped a pipe through a wall in March and nobody has mentioned it.',
  'Should I say something?',
  sig('Anxious, no fixed foundation'),
  `  ${B('The Editor writes:')} No.`,
  '',
  B('ERRATA'),
  '',
  'Last month\'s power-grid listing, line 40: for "OVERCLOCK EVERYTHING" read',
  '"OVERCLOCK EVERYTHING, THEN STAND NEAR THE FUSE". We apologise to readers',
  'who were standing elsewhere.',
  '',
  B('NEXT MONTH'),
  '',
  'Twelve splitters on test: we recommend the one you already built. Plus: is',
  'your "temporary" bus load-bearing? Take our quiz, then leave it exactly as',
  'it is.',
];

// ------------------------------------------------------------------ the page, as printed
// The bonus: the same two columns set on yellowed magazine stock, the way the catalogue entry
// describes the optional upgrade. Listing text is a 5x7 dot-matrix face (listings were
// reproduced from printer output); headings are a slab-serif stroke face drawn below. A reader
// has been at it with a pencil and a highlighter: the stripe sits on the line being typed and a
// tick lands beside each line as it is finished. No <text>, no filters, CSS animation only.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f1 = (n) => String(Math.round(n * 10) / 10);
const f2 = (n) => String(Math.round(n * 100) / 100);

// 5x7 dot-matrix font. Rows top to bottom, '#' = a pin fires. An 8th and 9th row are descenders.
const DOT_SRC = {
  A: '.###.|#...#|#...#|#...#|#####|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.', D: '###..|#..#.|#...#|#...#|#...#|#..#.|###..',
  E: '#####|#....|#....|####.|#....|#....|#####', F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.####', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.', J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|#...#|##..#|#.#.#|#..##|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.', V: '#...#|#...#|#...#|.#.#.|.#.#.|..#..|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|#...#|.#.#.|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  e: '.....|.....|.###.|#...#|#####|#....|.###.', m: '.....|.....|##.#.|#.#.#|#.#.#|#.#.#|#...#',
  r: '.....|.....|#.##.|##..#|#....|#....|#....',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####', 3: '#####|...#.|..#..|...#.|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
  '"': '.#.#.|.#.#.|.#.#.|.....|.....|.....|.....', $: '..#..|.####|#.#..|.###.|..#.#|####.|..#..',
  '&': '.##..|#..#.|#.#..|.#...|#.#.#|#..#.|.##.#', "'": '..#..|..#..|.#...|.....|.....|.....|.....',
  '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.', ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....', ',': '.....|.....|.....|.....|.....|.##..|..#..|.#...',
  '-': '.....|.....|.....|#####|.....|.....|.....', '.': '.....|.....|.....|.....|.....|.##..|.##..',
  ':': '.....|.##..|.##..|.....|.##..|.##..|.....', ';': '.....|.##..|.##..|.....|.##..|..#..|.#...',
  '<': '...#.|..#..|.#...|#....|.#...|..#..|...#.', '=': '.....|.....|#####|.....|#####|.....|.....',
  '>': '.#...|..#..|...#.|....#|...#.|..#..|.#...', '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
  '{': '..##.|.#...|.#...|#....|.#...|.#...|..##.', '}': '.##..|...#.|...#.|....#|...#.|...#.|.##..',
};
// one glyph as pen strokes: a horizontal run of pins is one round-capped line
function dotPath(src) {
  const rows = src.split('|');
  if (rows.some((r) => r.length !== 5) || rows.length < 7 || rows.length > 9) throw new Error(`bad dot glyph ${src}`);
  let d = '';
  rows.forEach((r, y) => {
    for (let x = 0; x < 5; x++) {
      if (r[x] !== '#') continue;
      let e = x;
      while (e + 1 < 5 && r[e + 1] === '#') e++;
      d += `M${x} ${y}h${e - x || '.01'}`; // a lone pin is a very short line, so every renderer draws its round cap
      x = e;
    }
  });
  return d;
}

// Slab-serif capitals as centre-line strokes, cap height 100 at stroke width 14 (centre lines
// run from y = 7 to y = 93). [advance, path]. Only the glyphs the page uses.
const SLAB = {
  A: [88, 'M14 93L44 7L74 93M24 64H64M2 93H28M60 93H86'],
  B: [78, 'M8 7H44A20 20.5 0 0 1 44 48H22M44 48H46A22.5 22.5 0 0 1 46 93H8M22 7V93'],
  C: [80, 'M68 8V32M68 30C64 15 54 7 42 7C24 7 12 24 12 50C12 76 24 93 42 93C55 93 65 85 70 70'],
  D: [84, 'M8 7H40C62 7 74 24 74 50C74 76 62 93 40 93H8M22 7V93'],
  E: [72, 'M22 7V93M8 7H64V26M22 50H50M8 93H64V74'],
  F: [68, 'M22 7V93M8 7H62V26M22 50H50M8 93H40'],
  G: [86, 'M70 8V32M70 30C66 15 56 7 44 7C26 7 14 24 14 50C14 76 26 93 44 93C60 93 72 84 72 62V54H50'],
  H: [88, 'M22 7V93M66 7V93M22 50H66M8 7H36M52 7H80M8 93H36M52 93H80'],
  I: [44, 'M22 7V93M8 7H36M8 93H36'],
  K: [84, 'M22 7V93M66 7L22 58M38 42L68 93M8 7H36M8 93H36M54 7H78M56 93H80'],
  L: [68, 'M22 7V93M8 7H36M8 93H62V74'],
  M: [104, 'M20 93V7L52 70L84 7V93M6 7H20M84 7H98M6 93H34M70 93H98'],
  N: [90, 'M22 93V7L68 93V7M8 7H22M8 93H36M54 7H82'],
  O: [88, 'M44 7C62 7 76 25 76 50C76 75 62 93 44 93C26 93 12 75 12 50C12 25 26 7 44 7Z'],
  P: [74, 'M8 7H46A21.5 21.5 0 0 1 46 50H22M22 7V93M8 93H38'],
  R: [82, 'M8 7H46A21.5 21.5 0 0 1 46 50H22M22 7V93M8 93H36M42 50L64 93H78'],
  S: [72, 'M60 8V28M60 27C58 13 49 7 36 7C20 7 11 16 11 29C11 43 22 47 36 51C50 55 62 60 62 72C62 86 51 93 36 93C22 93 13 87 11 73M11 72V92'],
  T: [76, 'M6 26V7H70V26M38 7V93M24 93H52'],
  U: [84, 'M20 7V62A22 31 0 0 0 64 62V7M6 7H34M50 7H78'],
  V: [86, 'M12 7L43 93L74 7M2 7H26M60 7H84'],
  W: [116, 'M10 7L34 93L58 25L82 93L106 7M0 7H22M94 7H116'],
  Y: [84, 'M12 7L42 52L72 7M42 52V93M2 7H24M60 7H82M28 93H56'],
  0: [72, 'M36 7C50 7 61 25 61 50C61 75 50 93 36 93C22 93 11 75 11 50C11 25 22 7 36 7Z'],
  1: [62, 'M16 24L33 7V93M15 93H51'],
  2: [72, 'M12 28C12 14 22 7 36 7C50 7 60 15 60 29C60 42 50 52 36 64C24 74 14 82 12 93H62V76'],
  3: [72, 'M12 24C14 13 23 7 35 7C48 7 57 15 57 27C57 39 48 47 34 47C50 47 60 56 60 69C60 84 49 93 35 93C22 93 12 86 10 74'],
  4: [74, 'M50 93V7L10 66H66M38 93H62'],
  5: [72, 'M56 7H18L14 46C20 41 28 39 36 39C50 39 60 50 60 65C60 82 49 93 34 93C22 93 13 87 10 76'],
  7: [70, 'M8 24V7H60L30 93M20 93H42'],
  9: [72, 'M14 78C18 88 26 93 35 93C50 93 60 76 60 48C60 22 50 7 36 7C22 7 12 17 12 32C12 46 22 55 35 55C46 55 56 47 60 38'],
  6: [72, 'M58 22C54 12 46 7 37 7C22 7 12 24 12 52C12 78 22 93 36 93C50 93 60 83 60 68C60 54 50 45 37 45C26 45 16 53 12 62'],
  8: [72, 'M36 7C48 7 56 16 56 28C56 40 48 48 36 48C24 48 16 40 16 28C16 16 24 7 36 7ZM36 48C50 48 60 57 60 70C60 84 50 93 36 93C22 93 12 84 12 70C12 57 22 48 36 48Z'],
  '-': [48, 'M8 55H40'],
  ':': [36, 'M11 38H25M11 86H25'],
  '.': [36, 'M11 86H25'],
  ',': [36, 'M11 86H25M21 90L13 110'],
  '?': [66, 'M12 28C12 14 22 7 34 7C47 7 56 15 56 28C56 40 46 46 36 53V66M29 86H43'],
  ' ': [38, ''],
};

function buildSvg() {
  const rand = mulberry32(0x3188);
  const W = 1000;
  const U = 1.75; // dot pitch
  const CELL = 6 * U, ROW = 10 * U;
  const MARGIN = 74;
  const COLPX = COL_W * CELL;
  const GUT = W - 2 * MARGIN - 2 * COLPX;
  const colX = [MARGIN, MARGIN + COLPX + GUT];
  const BODY_Y = 204;
  const bodyH = bodyRows * ROW;
  const FOOT_Y = BODY_Y + bodyH + 18;
  const H = Math.round(FOOT_Y + 50);
  const INK = '#221d16';
  const PAPER = '#f1e8cf';

  const usedDot = new Set(), usedSlab = new Set();
  const did = (ch) => `d${ch.charCodeAt(0).toString(36)}`;
  const sid = (ch) => `s${ch.charCodeAt(0).toString(36)}`;
  // slab text: returns { svg, width } at a given cap height; weight is the stroke in glyph units
  const slab = (str, x, y, cap, { weight = 14, track = 0, fill = INK, anchor = 'start' } = {}) => {
    const k = cap / 100;
    let adv = 0, uses = '';
    for (const ch of str) {
      const g = SLAB[ch];
      if (!g) throw new Error(`no slab glyph for "${ch}" in "${str}"`);
      if (ch !== ' ') { usedSlab.add(ch); uses += `<use href="#${sid(ch)}"${adv ? ` x="${f1(adv)}"` : ''}/>`; }
      adv += g[0] + track;
    }
    const width = (adv - track) * k;
    const x0 = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x;
    return { width, svg: `<g transform="translate(${f1(x0)} ${f1(y)}) scale(${f2(k)})" stroke="${fill}" stroke-width="${weight}">${uses}</g>` };
  };

  // where every BASIC line sits: column, first row, row count
  const placed = [];
  {
    let r = P1_HEAD.length;
    setLines.slice(0, split).forEach((l) => { placed.push({ n: l.n, col: 0, row: r, rows: l.rows.length }); r += l.rows.length; });
    r = bodyRows - col2.length + (col2.length - (setLines.slice(split).reduce((t, l) => t + l.rows.length, 0) + p2Block.length));
    setLines.slice(split).forEach((l) => { placed.push({ n: l.n, col: 1, row: r, rows: l.rows.length }); r += l.rows.length; });
    // then Program 2, a row at a time
    r += P2_HEAD.length;
    mlLines.forEach((t, k) => placed.push({ n: `m${k}`, col: 1, row: r + k, rows: 1, chars: t.length }));
  }

  // ---- paper
  let paper = '';
  paper += `<rect width="${W}" height="${H}" rx="5" fill="url(#pg)"/>`;
  paper += `<rect width="${W}" height="${H}" rx="5" fill="url(#pv)"/>`;
  paper += `<rect x="${W - 70}" width="70" height="${H}" fill="url(#ps)"/>`; // the shadow running into the spine
  // foxing: a few dozen faint specks
  let specks = '';
  for (let i = 0; i < 70; i++) {
    const x = rand() * W, y = rand() * H, r = 0.5 + rand() * rand() * 2.6;
    specks += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" opacity="${f2(0.05 + rand() * 0.13)}"/>`;
  }
  paper += `<g fill="#8a6a3a">${specks}</g>`;
  // a coffee ring, because somebody typed this in with a mug on the page
  {
    const cx = W - 118, cy = H - 108, R = 74;
    const ring = (rr, jit, seedShift) => {
      const pts = [];
      const n = 28;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + seedShift;
        const r = rr + (rand() - 0.5) * jit;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.97]);
      }
      let d = '';
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
        if (i === 0) d += `M${f1(p1[0])} ${f1(p1[1])}`;
        d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
      }
      return `${d}Z`;
    };
    paper += `<g fill="none" stroke="#7a4a1c" stroke-linecap="round">`
      + `<path d="${ring(R, 2.4, 0.3)}" stroke-width="5.5" opacity=".13"/>`
      + `<path d="${ring(R + 1.5, 3.2, 1.1)}" stroke-width="2" opacity=".17" stroke-dasharray="150 22 210 9 60 30"/>`
      + `<path d="${ring(R - 4, 2, 2.2)}" stroke-width="1.2" opacity=".12" stroke-dasharray="90 40 30 60"/>`
      + `</g>`;
  }

  // ---- header: section tag, headline, deck, rules
  let head = '';
  const tag = slab('TYPE-IN OF THE MONTH', MARGIN + 11, 46, 10, { track: 26, fill: PAPER, weight: 15 });
  head += `<rect x="${MARGIN}" y="40" width="${f1(tag.width + 22)}" height="22" fill="${INK}"/>${tag.svg}`;
  head += `<path d="M${f1(MARGIN + tag.width + 30)} 51H${W - MARGIN - 52}" stroke="${INK}" stroke-width="1.2"/>`;
  // the app's emblem idea, redrawn as a printer's spot: a hexagon with a cog in it
  {
    const cx = W - MARGIN - 22, cy = 51, R = 21;
    const hex = Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 6 + (i * Math.PI) / 3; return `${f1(cx + R * Math.cos(a))} ${f1(cy + R * Math.sin(a))}`; }).join('L');
    let cog = '';
    const teeth = 8;
    for (let i = 0; i < teeth * 4; i++) {
      const a = (i / (teeth * 4)) * Math.PI * 2 - Math.PI / teeth / 2;
      const r = i % 4 < 2 ? 11.5 : 8.2;
      cog += `${i ? 'L' : 'M'}${f1(cx + r * Math.cos(a))} ${f1(cy + r * Math.sin(a))}`;
    }
    head += `<path d="M${hex}Z" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linejoin="miter"/>`;
    head += `<path d="${cog}Z" fill="${INK}"/><circle cx="${cx}" cy="${cy}" r="3.4" fill="${PAPER}"/>`;
  }
  const title = slab('ULTRA-SATISFACTORY', MARGIN - 3, 82, 58, { track: 1 });
  if (title.width > W - 2 * MARGIN + 6) throw new Error(`headline is ${title.width} wide`);
  head += title.svg;
  const deck = slab(`THE FACTORY COMPANION APP, CUT DOWN TO ${PROGRAM.length} LINES OF BASIC. TYPE IT IN, RUN IT, ASK IT THINGS.`, MARGIN, 158, 10.5, { weight: 11, track: 9 });
  if (deck.width > W - 2 * MARGIN) throw new Error(`deck is ${deck.width} wide`);
  head += deck.svg;
  head += `<path d="M${MARGIN} 184H${W - MARGIN}" stroke="${INK}" stroke-width="2.6"/><path d="M${MARGIN} 189H${W - MARGIN}" stroke="${INK}" stroke-width=".8"/>`;

  // ---- the two columns
  let body = '', heads = '';
  const column = (rows, c) => {
    rows.forEach((raw, k) => {
      const t = visible(raw).replace(/ +$/, '');
      if (!t) return;
      const y = BODY_Y + k * ROW;
      if (raw.startsWith('\u0001Program')) {
        heads += slab(t.toUpperCase(), colX[c], y + 3, 11, { weight: 15, track: 6 }).svg;
        return;
      }
      let uses = '';
      [...t].forEach((ch, i) => {
        if (ch === ' ') return;
        if (!DOT_SRC[ch]) throw new Error(`no dot-matrix glyph for "${ch}" in "${t}"`);
        usedDot.add(ch);
        uses += `<use href="#${did(ch)}"${i ? ` x="${i * 6}"` : ''}/>`;
      });
      body += `<g transform="translate(${c ? f1((colX[1] - colX[0]) / U) : 0} ${k * 10})">${uses}</g>`;
    });
  };
  column(col1, 0);
  column(col2, 1);
  body = `<g transform="translate(${colX[0]} ${f1(BODY_Y + 2 * U)}) scale(${U})" fill="none" stroke="${INK}" stroke-width="1.22" stroke-linecap="round" opacity=".9">${body}</g>`;

  // ---- footer
  let foot = `<path d="M${MARGIN} ${f1(FOOT_Y)}H${W - MARGIN}" stroke="${INK}" stroke-width=".8"/>`;
  const folio = slab(String(PAGE_NO), MARGIN, FOOT_Y + 12, 15, { weight: 16 });
  foot += folio.svg;
  const mag = slab(MAGAZINE, MARGIN + folio.width + 18, FOOT_Y + 14, 11, { weight: 15, track: 10 });
  foot += mag.svg;
  foot += slab(ISSUE.toUpperCase(), MARGIN + folio.width + 18 + mag.width + 22, FOOT_Y + 14, 11, { weight: 9, track: 10 }).svg;
  foot += slab('THE NUMBER AFTER :REM IS A CHECKSUM', W - MARGIN, FOOT_Y + 14, 9.5, { weight: 10, track: 9, anchor: 'end' }).svg;

  // ---- the reader's pencil and highlighter
  const SLOT = 1.3, HOLD = 5, FADE = 1.2;
  const T = placed.length * SLOT + HOLD + FADE;
  const pct = (t) => `${f2((t / T) * 100)}%`;
  const STATIC_DONE = placed.findIndex((p) => p.n === 200); // the frame shown when motion is off
  // The loop starts at that same frame (a negative delay), so a visitor's first sight of the page
  // already shows how far the typist has got, and line 510 comes round in about ten seconds.
  const START = STATIC_DONE * SLOT + 0.05;
  let css = '';
  let marks = '', ticks = '';
  placed.forEach((p, i) => {
    const x = colX[p.col], y = BODY_Y + p.row * ROW;
    // highlighter: one wobbly stripe per row of the line
    let d = '';
    for (let r = 0; r < p.rows; r++) {
      const yy = y + r * ROW + 1.2;
      const l = x - 5 + (rand() - 0.5) * 3, rr = x + (p.chars ? p.chars * CELL : COLPX) + 4 + (rand() - 0.5) * 4;
      const h = ROW - 2.6;
      const w1 = (rand() - 0.5) * 1.6, w2 = (rand() - 0.5) * 1.6;
      d += `M${f1(l)} ${f1(yy + w1)}L${f1(rr)} ${f1(yy + w2)}L${f1(rr + 1.5)} ${f1(yy + h + w2)}L${f1(l - 1)} ${f1(yy + h + w1)}Z`;
    }
    const t0 = i * SLOT, t1 = t0 + SLOT;
    const onStatic = i === STATIC_DONE;
    marks += `<path class="h${onStatic ? ' on' : ''}" id="h${i}" d="${d}"/>`;
    if (i === 0) css += `@keyframes h0{0%,${pct(t1 - 0.15)}{opacity:1}${pct(t1)},${pct(T - FADE)}{opacity:0}100%{opacity:1}}`;
    else css += `@keyframes h${i}{0%,${pct(t0 - 0.15)}{opacity:0}${pct(t0)},${pct(t1 - 0.15)}{opacity:1}${pct(t1)},100%{opacity:0}}`;
    css += `#h${i}{animation:h${i} ${f1(T)}s linear ${f2(-START)}s infinite}`;
    // pencil tick in the margin beside the line's first row
    const tx = x - 17 + (rand() - 0.5) * 3, ty = y + 6 + (rand() - 0.5) * 2.4;
    const a = 3 + rand() * 1.6, b = 7.5 + rand() * 3.5, tilt = (rand() - 0.5) * 2.4;
    ticks += `<path class="t${i < STATIC_DONE ? ' on' : ''}" id="t${i}" d="M${f1(tx)} ${f1(ty + 3)}l${f1(a)} ${f1(4 + tilt * 0.4)}l${f1(b)} ${f1(-10.5 + tilt)}"/>`;
    css += `@keyframes t${i}{0%,${pct(t1 - 0.2)}{opacity:0}${pct(t1)},${pct(T - FADE)}{opacity:1}100%{opacity:0}}#t${i}{animation:t${i} ${f1(T)}s linear ${f2(-START)}s infinite}`;
  });
  // and a ring round the number that went in wrong the first time (see the RUN notes)
  let ringMark = '';
  {
    const needle = TYPO_FROM.slice(TYPO_FROM.indexOf(',') + 1);
    const k = col2.findIndex((r) => visible(r).includes(TYPO_FROM));
    if (k < 0) throw new Error('cannot find the typo row on the page');
    const at = visible(col2[k]).indexOf(TYPO_FROM) + TYPO_FROM.indexOf(',') + 1;
    const cx = colX[1] + (at + (needle.length - 1) / 2) * CELL - 1.5, cy = BODY_Y + k * ROW + 8.4;
    let d = '';
    const turns = 1.7, steps = 30;
    for (let i = 0; i <= steps; i++) {
      const a = -2.4 + (i / steps) * turns * Math.PI * 2;
      const grow = 1 + (i / steps) * 0.16;
      const x = cx + Math.cos(a) * 15 * grow + (rand() - 0.5) * 0.9, y = cy + Math.sin(a) * 8.6 * grow + (rand() - 0.5) * 0.9;
      d += `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`;
    }
    const i = placed.findIndex((q) => q.n === TYPO_LINE);
    ringMark = `<path id="ring" class="t" d="${d}" stroke-width="1.3"/>`;
    css += `#ring{animation:t${i} ${f1(T)}s linear ${f2(-START)}s infinite}`;
  }
  css = `.h{opacity:0}.t{opacity:0}.on{opacity:1}${css}@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;
  const pencil = `<g fill="#f3d63a" opacity=".62">${marks}</g>`;
  const pencilTicks = `<g fill="none" stroke="#4c4a4f" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" opacity=".82">${ticks}${ringMark}</g>`;

  const defs = [
    `<linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6efdb"/><stop offset=".55" stop-color="${PAPER}"/><stop offset="1" stop-color="#e9dcb8"/></linearGradient>`,
    `<radialGradient id="pv" cx=".45" cy=".42" r=".8"><stop offset=".55" stop-color="#b8935a" stop-opacity="0"/><stop offset="1" stop-color="#a87f42" stop-opacity=".2"/></radialGradient>`,
    `<linearGradient id="ps" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b4a1e" stop-opacity="0"/><stop offset="1" stop-color="#6b4a1e" stop-opacity=".2"/></linearGradient>`,
    ...[...usedDot].sort().map((ch) => `<path id="${did(ch)}" d="${dotPath(DOT_SRC[ch])}"/>`),
    ...[...usedSlab].sort().map((ch) => `<path id="${sid(ch)}" d="${SLAB[ch][1]}"/>`),
  ].join('');
  const title0 = `Page ${PAGE_NO} of ${MAGAZINE}, an invented magazine: the ULTRA-SATISFACTORY type-in listing in two columns on yellowed paper`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${title0}">`
    + `<title>${title0}</title><style>${css}</style><defs>${defs}</defs>`
    + paper + pencil
    + `<g fill="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="2">${head}${heads}${foot}</g>`
    + body + pencilTicks
    + `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="5" fill="none" stroke="#b9a877" stroke-opacity=".8"/>`
    + `</svg>\n`;
}
const svg = buildSvg();
if (/<text\b/.test(svg)) throw new Error('the page SVG must not use <text>');
fs.writeFileSync(OUT_SVG, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT_SVG)}: ${(svg.length / 1024).toFixed(1)} KB`);

// ------------------------------------------------------------------ the README header
const example = setLines.find((l) => l.n === EXAMPLE_LINE);
const exampleLine = `${EXAMPLE_LINE} ${visible(PROGRAM.find(([n]) => n === EXAMPLE_LINE)[1])}`;
const ALT_THUMB = `ULTRA-SATISFACTORY as page ${PAGE_NO} of WHAT CONVEYOR?, an invented magazine in the style of a 1980s home-computer monthly: a slab-serif headline over two narrow columns of type-in BASIC listing on yellowed paper, with a highlighter stripe on the line being typed.`;
const pre = (name, rows, max) => `<pre>\n${checkBlock(name, rows, max)}\n</pre>`;
const mdParts = [
  `<!-- Header ${SLUG} for ULTRA-SATISFACTORY. Generated by src/${SLUG}.mjs: edit that, not this. -->`,
  '',
  '# ULTRA-SATISFACTORY',
  '',
  `<a href="${SVG_REF}"><img align="right" width="36%" src="${SVG_REF}" alt="${ALT_THUMB}"></a>`,
  '',
  '⚡ <b>A companion app for the factory-building game <i>Satisfactory</i>: every recipe, building and Space Elevator objective, one click apart.</b> Keep it open beside the game on a second monitor, a phone or an alt-tab.',
  '',
  `⚡ For readers who like to earn their software, this month's type-in is the pocket edition: ${PROGRAM.length} lines of BASIC that really run, ${RECIPES.length} real recipes, and a checksum on every line that really adds up. The full-size app has all ${COUNTS.items} items, ${COUNTS.recipes} recipes, ${COUNTS.buildings} buildings and all ${COUNTS.phases} Space Elevator phases, and needs [no typing at all](${LIVE}).<br clear="right">`,
  '',
  pre('page', pageRows),
  '',
  '⚡ The full-size app has three tabs. **Objectives**: pick a Space Elevator phase, see the parts it wants and how many, click a part for its recipe. **Items**: search every item as you type; each recipe card shows the ingredients with per-minute rates, the machine with its cycle time and power draw, and the products. **Buildings**: every building and what it makes, grouped by tier, with Mk-by-Mk upgrade paths for miners, conveyors, pipelines and storage. Everything is a link: ingredients and products open their recipes, machines open their buildings.',
  '',
  `⚡ [Open it live in your browser](${LIVE}): nothing to install, nothing to type. Or run it yourself with Python 3.10+, from the repo root:`,
  '',
  '```sh',
  'python -m pip install -r requirements.txt',
  'python -m streamlit run app/app.py        # then open http://localhost:8501',
  '```',
  '',
  '⚡ Unofficial fan project, not affiliated with Coffee Stain Studios. *WHAT CONVEYOR?* is an invented magazine and so is everyone who writes to it. The recipes, the checksums and the machine code are real. So, we regret to say, is your spaghetti.',
  '',
  '<details>',
  '<summary>⚡ <b>RUN</b>: what you get for an evening of typing, and what happens when you fumble a digit</summary>',
  '',
  '<br>',
  '',
  `⚡ This is the listing's actual output. The script that builds this header carries a small BASIC interpreter: it runs Program 1, then types it back in from the two printed columns and checks that it still runs the same. Typed input is in bold.`,
  '',
  pre('run', runRows),
  '',
  `⚡ Now the classic: on line ${TYPO_LINE}, type Steel Ingot's 45 a minute as 54. The line still checksums to ${typoSum}, because a plain sum cannot see two digits swapped. Line ${CHECK_LINE} can, because it adds up the DATA itself:`,
  '',
  pre('typo', typoRows),
  '',
  '</details>',
  '',
  '<details>',
  '<summary>⚡ <b>How to type it in</b>: brace keys, wrapped lines, and checking the checksums yourself</summary>',
  '',
  '<br>',
  '',
  '- ⚡ **Braces are keys, not text.** `{CLR}` is the clear-screen key, `{DOWN}` is cursor down, `{RVS}` and `{OFF}` switch reverse video on and off. Press the key and leave the braces on the page.',
  '- ⚡ **A line that runs out of column carries on underneath.** Type it as one line, with one space where the row breaks. `:rem` and the number after it are the checksum, not part of the line.',
  `- ⚡ **The checksum** is the character codes of the line as printed, line number included, spaces skipped, added up, and the remainder kept after dividing by 256. You do not need a 1983 home computer to check one. Run this, paste \`${exampleLine}\`, and it answers ${example.sum}:`,
  '',
  '```sh',
  'python -c "print(sum(map(ord, input().replace(\' \', \'\'))) % 256)"',
  '```',
  '',
  `- ⚡ **Program 2 is machine code**: an address, six bytes, and a seventh number that is the address plus the six bytes, remainder after 256. It is ${ML_BYTES.length} bytes of 6502: a ${ML_CODE.length}-byte loop, then the message it prints, one character code at a time. POKE the six bytes of each row into memory from the address shown, then \`SYS ${ML_BASE}\`.`,
  '',
  pre('asm', asmRows),
  '',
  '- ⚡ **The honesty box.** Program 1 is written to Commodore 64 BASIC V2 rules, and Program 2 calls that machine\'s character output. Both were run by the build script, on its own interpreter and a seven-opcode 6502, and the build stops if a checksum, the DATA total or the output is wrong. Nobody has tried them on real hardware yet. Be the first.',
  '',
  '</details>',
  '',
  '<details>',
  `<summary>⚡ <b>Page ${PAGE_NO}, as printed</b>: the same listing on paper, with a reader's pencil ticks and a highlighter</summary>`,
  '',
  '<br>',
  '',
  '<p align="center">',
  `  <img src="${SVG_REF}" width="100%" alt="Page ${PAGE_NO} of WHAT CONVEYOR?, an invented home-computer magazine, on yellowed paper with a coffee ring. Under the headline ULTRA-SATISFACTORY, the type-in listing runs in two narrow columns of dot-matrix type with a checksum after every line. A yellow highlighter stripe marks the line being typed and pencil ticks collect beside the lines already done.">`,
  '</p>',
  '',
  `⚡ Same words, same checksums, drawn from the same data as the text above: every letter is a path, so it looks the same for everyone. The highlighter works down the page one line at a time and leaves a tick behind it. Watch what the pencil does when it reaches line ${TYPO_LINE}.`,
  '',
  '</details>',
  '',
  '<details>',
  `<summary>⚡ <b>The back pages</b>: letters, errata, next month, and the small print</summary>`,
  '',
  '<br>',
  '',
  pre('letters', LETTERS),
  '',
  `⚡ The small print, which is true: game data from [greeny/SatisfactoryTools](https://github.com/greeny/SatisfactoryTools), item and building images from the [Satisfactory Wiki](https://satisfactory.wiki.gg) (CC BY-NC-SA 4.0), code under [Apache 2.0](LICENSE). The listing knows ${RECIPES.length} recipes. The app knows ${COUNTS.items} items, ${COUNTS.recipes} recipes (${COUNTS.alternates} of them alternates), ${COUNTS.buildings} buildings and all ${COUNTS.phases} Space Elevator phases, and you do not have to type any of it.`,
  '',
  '</details>',
  '',
];
const md = mdParts.join('\n');
if (/\u2014/.test(md)) throw new Error('em dash in the header');
for (const line of md.split('\n')) if (/[ \t]+$/.test(line)) throw new Error(`trailing whitespace: "${line}"`);
fs.writeFileSync(OUT_MD, md);
console.log(`wrote ${path.relative(process.cwd(), OUT_MD)}: ${md.length} bytes, page ${pageRows.length} rows x ${PAGE_W} columns, ${PROGRAM.length} BASIC lines, all checksums verified`);
