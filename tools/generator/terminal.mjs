// Kept for rebuilding older saved local-renderer bundles.
export const runtime = Object.freeze({ engine: 'Local catalogue renderer', model: null, provider: null,
  ai_credits: 0, billing: 'Local CPU; no AI account is billed', author: 'Luke Woods', license: 'MIT' });

// Measured per-header times: Claude Sonnet 39-74 s, Codex 151-378 s (pipeline audit, 2026-11).
export const SECONDS_PER_HEADER = { claude: [40, 180], codex: [120, 420] };
export function estimateBatch(count, { jobs = 3, agent = 'claude' } = {}) {
  const [low, high] = SECONDS_PER_HEADER[agent] || SECONDS_PER_HEADER.codex;
  const rounds = Math.ceil(count / Math.max(1, Math.min(jobs, count)));
  return { minimum: rounds * low, maximum: rounds * high, approximate: true };
}
export function estimateText(count, options) {
  const time = estimateBatch(count, options);
  return `~${Math.max(1, Math.round(time.minimum / 60))}-${Math.ceil(time.maximum / 60)} min estimate`;
}

const STEP_LABEL = { drawing: 'drawing', repairing: 'repair' };

export function createTerminal({ stream = process.stdout, color = true, now = () => performance.now() } = {}) {
  const colored = color && stream.isTTY && !process.env.NO_COLOR;
  const paint = (value, code = '38;5;141') => colored ? `\x1b[${code}m${value}\x1b[0m` : value;
  const safe = value => String(value).replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ');
  const cells = value => [...value].reduce((total, ch) => total + (/\p{Extended_Pictographic}|[ᄀ-ᅟ〈〉⺀-꓏가-힣豈-﫿︐-﹯！-｠￠-￦]/u.test(ch) ? 2 : /\p{Mark}/u.test(ch) ? 0 : 1), 0);
  const clip = (value, size) => { let result = ''; for (const ch of safe(value)) { if (cells(result + ch) > size) break; result += ch; } return result; };
  const clock = ms => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
  const pad = number => String(number).padStart(2, '0');
  let active = false, closed = false, activeRows = 0, started;
  let count = 0, maximum = 0, completed = 0, skipped = 0, jobs = 3, range = '', project = 'Reading your project';
  let agent = 'Checking sign-in...', model = '', account = '', gallery = 'Preparing...', estimate = '', notice = '', last = '';
  const slots = new Map();
  const line = value => stream.write(`${safe(value).trimEnd()}\n`);
  const draw = () => {
    if (!stream.isTTY || closed) return;
    const width = Math.max(30, Math.min(76, (stream.columns || 78) - 2)), inner = width - 4;
    const fit = value => cells(safe(value)) > inner ? clip(value, inner - 3) + '...' : safe(value);
    const row = value => { const text = fit(value); return `${paint('|', '38;5;99')} ${paint(text)}${' '.repeat(Math.max(0, inner - cells(text)))} ${paint('|', '38;5;99')}`; };
    const tag = '[ README.NFO ]';
    const top = paint('+--', '38;5;99') + paint(tag, '1;38;5;183') + paint('-'.repeat(width - tag.length - 4) + '+', '38;5;99');
    const rule = paint('+' + '-'.repeat(width - 2) + '+', '38;5;99');
    const fraction = count ? (completed + skipped) / count : 0;
    const size = Math.max(5, Math.min(24, inner - 26));
    const filled = Math.round(fraction * size);
    const elapsed = started === undefined ? 0 : Math.max(0, now() - started);
    const working = [...slots].map(([number, slot]) => `${pad(number)} ${STEP_LABEL[slot.step] || slot.step} ${clock(now() - slot.since)}`).join('  ');
    const rows = [top,
      row('///  R E P O S I T O R Y   H E A D E R S'),
      row(project),
      row(`DRAW ${count} / ${maximum} STYLES / ${jobs} AT A TIME${range ? ` / ${range}` : ''}`),
      row(`AGENT    ${agent}`),
      row(`MODEL    ${model || '-'}`),
      row(`ACCOUNT  ${account || '-'}`),
      rule,
      row(`NOW      ${working || (count && completed + skipped >= count ? 'done' : 'waiting')}`),
      row(`BATCH [${'#'.repeat(filled)}${'.'.repeat(size - filled)}] ${Math.round(fraction * 100)}% ${completed}/${count} ready${skipped ? `, ${skipped} skipped` : ''}`),
      row(last || 'Waiting for the first header'),
      row(notice || `elapsed ${clock(elapsed)}${estimate ? ' / ' + estimate : ''}`),
      row(`GALLERY  ${gallery}`), rule];
    stream.write((active ? `\r\x1b[${activeRows - 1}A` : '') + rows.map(text => '\x1b[2K' + text).join('\n'));
    active = true; activeRows = rows.length;
  };
  const finish = () => { if (active) { stream.write('\n'); active = false; } closed = true; };
  const plain = value => { if (!stream.isTTY || closed) line(value); };
  return {
    line: value => { if (active) finish(); line(value); },
    finish,
    banner(total, styles, parallel = 3) { count = total; maximum = styles; jobs = Math.min(parallel, total); closed = false; if (stream.isTTY) draw(); else line(`README.NFO / ${count} new header${count === 1 ? '' : 's'} / ${maximum} styles / ${jobs} at a time`); },
    project(value) { project = safe(value); draw(); },
    agent({ label, hint, note, account: billing, model: name }) {
      agent = `${label}${hint ? ` (${hint})` : ''}${note ? ` / ${note}` : ''}`; account = billing || ''; model = name || '';
      draw(); plain(`AGENT ${agent}`); if (account) plain(`ACCOUNT ${account}`);
    },
    resolvedRuntime(details) {
      if (details.model && details.model !== model) { model = safe(details.model); draw(); plain(`MODEL ${model} (reported by the agent)`); }
      if (details.provider && details.provider.toLowerCase() !== 'openai') { account = `${safe(details.provider)} account; usage applies`; draw(); }
    },
    plan({ from, to, total, styles }) { range = from === to ? pad(from) : `${pad(from)}-${pad(to)}`; count = total ?? count; maximum = styles ?? maximum; draw(); plain(`DRAW ${range} (${count} header${count === 1 ? '' : 's'})`); },
    estimate(total, options) { estimate = estimateText(total, options); draw(); plain(`${estimate}; timing depends on the model and plan.`); },
    destination(value) { gallery = safe(value); draw(); plain(`GALLERY ${gallery}`); },
    headerStep(pick, step) {
      started ??= now();
      const slot = slots.get(pick.number);
      slots.set(pick.number, { step, since: slot && slot.step === step ? slot.since : now() });
      draw(); plain(`HEADER ${pad(pick.number)} ${step}`);
    },
    headerDone(pick, result, seconds) {
      slots.delete(pick.number);
      if (result.ok) { completed++; last = `${pad(pick.number)} ready${seconds !== undefined ? ` in ${seconds} s` : ''}${result.attempts > 1 ? ' after one repair' : ''}`; }
      else { skipped++; last = `${pad(pick.number)} skipped: ${safe(result.issue || '').slice(0, 120)}`; }
      draw(); plain(`HEADER ${last}`);
    },
    tick() { if (count && completed + skipped < count) draw(); },
    warning(value) { notice = '! ' + safe(value); if (closed || !stream.isTTY) line(notice); else draw(); },
  };
}
