// Logs how long each header took to build, from a Workflow run's agent transcripts.
//   node tools/build-log.mjs --project=ultra-satisfactory --mode=ultracode <workflow-transcript-dir> [more dirs]
// Adds or replaces one row per header per run in examples/build-log.csv (key: run_id + filename).
//
// Each header is built by a "design" agent and then a "critic" agent. A transcript dir holds one
// agent-<id>.jsonl per agent (every line is timestamped, and assistant lines carry the model and
// effort) plus agent-<id>.meta.json with its label ("design:..." or "critic:..."). The header's
// slug and catalogue style id are read from the agent's prompt. `mode` is not in the transcripts,
// so it is passed on the command line. An agent that was interrupted and restarted leaves two
// transcripts for the same stage: their minutes are added together and counted in `restarts`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'examples', 'build-log.csv');
const COLS = ['started', 'finished', 'project', 'filename', 'style_id', 'category', 'model', 'effort', 'mode',
  'design_min', 'critique_min', 'total_min', 'elapsed_min', 'restarts', 'tool_calls', 'run_id'];

const args = process.argv.slice(2);
const flag = (name, fallback = '') => (args.find((a) => a.startsWith(`--${name}=`)) || `=${fallback}`).split('=').slice(1).join('=');
const dirs = args.filter((a) => !a.startsWith('--'));
const project = flag('project');
const mode = flag('mode');
if (!dirs.length || !project) {
  console.error('usage: node tools/build-log.mjs --project=<name> [--mode=ultracode] <workflow-transcript-dir>...');
  process.exit(2);
}

// catalogue style id -> family title
const category = new Map();
const stylesFile = path.join(ROOT, 'styles', 'styles.json');
if (fs.existsSync(stylesFile)) {
  for (const f of JSON.parse(fs.readFileSync(stylesFile, 'utf8')).families) for (const s of f.styles) category.set(s.id, f.title);
}

const pad = (n) => String(n).padStart(2, '0');
const local = (d) => {
  const off = -d.getTimezoneOffset();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    + `${off < 0 ? '-' : '+'}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`;
};
const mins = (ms) => (ms / 60000).toFixed(1);
const most = (counts) => [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k)[0] || '';
const bump = (m, k) => k && m.set(k, (m.get(k) || 0) + 1);

function readAgent(file) {
  const meta = JSON.parse(fs.readFileSync(file.replace(/\.jsonl$/, '.meta.json'), 'utf8'));
  const stage = /^design/i.test(meta.description) ? 'design' : /^crit/i.test(meta.description) ? 'critique' : null;
  let first = null, last = null, slug = '', styleId = '', tools = 0;
  const models = new Map(), efforts = new Map();
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let row;
    try { row = JSON.parse(line); } catch { continue; }
    if (row.timestamp) { first ??= row.timestamp; last = row.timestamp; }
    const content = row.message?.content;
    if (row.type === 'user' && typeof content === 'string' && !slug) {
      slug = ((content.match(/slug: ([0-9]{2,3}-[A-Za-z0-9._-]+)/) || [])[1] || '').replace(/[.,]+$/, '');
      styleId = (content.match(/catalogue entry ([a-z0-9]+-\d\d)/) || [])[1] || '';
    }
    if (row.type === 'assistant') {
      bump(models, row.message?.model);
      bump(efforts, row.effort);
      if (Array.isArray(content)) tools += content.filter((c) => c.type === 'tool_use').length;
    }
  }
  return { stage, slug, styleId, first: new Date(first), last: new Date(last), model: most(models), effort: most(efforts), tools };
}

const rows = [];
for (const dir of dirs) {
  const runId = path.basename(path.resolve(dir));
  const headers = new Map();
  for (const f of fs.readdirSync(dir).filter((n) => /^agent-.*\.jsonl$/.test(n))) {
    const a = readAgent(path.join(dir, f));
    if (!a.stage || !a.slug) continue;
    if (!headers.has(a.slug)) headers.set(a.slug, { design: [], critique: [] });
    headers.get(a.slug)[a.stage].push(a);
  }
  const spent = (list) => list.reduce((n, p) => n + (p.last - p.first), 0);
  for (const [slug, h] of [...headers].sort()) {
    const parts = [...h.design, ...h.critique];
    const start = new Date(Math.min(...parts.map((p) => p.first)));
    const end = new Date(Math.max(...parts.map((p) => p.last)));
    const work = spent(parts);
    const styleId = parts.map((p) => p.styleId).find(Boolean) || '';
    rows.push({
      started: local(start),
      finished: h.critique.length ? local(end) : '',
      project,
      filename: `${slug}.md`,
      style_id: styleId,
      category: styleId ? category.get(styleId) || '' : 'Original six',
      model: parts[0].model,
      effort: parts[0].effort,
      mode,
      design_min: h.design.length ? mins(spent(h.design)) : '',
      critique_min: h.critique.length ? mins(spent(h.critique)) : '',
      total_min: mins(work),
      elapsed_min: mins(end - start),
      restarts: Math.max(0, h.design.length - 1) + Math.max(0, h.critique.length - 1),
      tool_calls: parts.reduce((n, p) => n + p.tools, 0),
      run_id: runId,
    });
  }
}

// merge with what is already logged (key: run_id + filename), then write sorted by start time
const csvCell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const parseLine = (line) => [...line.matchAll(/("([^"]|"")*"|[^,]*)(,|$)/g)].slice(0, -1).map((m) => m[1].replace(/^"|"$/g, '').replace(/""/g, '"'));
const all = new Map();
if (fs.existsSync(OUT)) {
  const [head, ...lines] = fs.readFileSync(OUT, 'utf8').split(/\r?\n/).filter(Boolean);
  const cols = parseLine(head);
  for (const l of lines) {
    const r = Object.fromEntries(parseLine(l).map((v, i) => [cols[i], v]));
    all.set(`${r.run_id}|${r.filename}`, r);
  }
}
for (const r of rows) all.set(`${r.run_id}|${r.filename}`, r);
const sorted = [...all.values()].sort((a, b) => (a.started + a.filename).localeCompare(b.started + b.filename));
fs.writeFileSync(OUT, `${[COLS.join(','), ...sorted.map((r) => COLS.map((c) => csvCell(r[c] ?? '')).join(','))].join('\n')}\n`);
console.log(`logged ${rows.length} headers from ${dirs.length} run(s); ${sorted.length} rows in ${path.relative(ROOT, OUT)}`);
for (const r of rows) console.log(`  ${r.filename.padEnd(40)} design ${String(r.design_min).padStart(5)}  critique ${String(r.critique_min).padStart(5)}  total ${String(r.total_min).padStart(5)} min`);
