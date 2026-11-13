// The cumulative gallery: readme-headers/index.html, one card per numbered header and one
// divider per batch. It is rewritten after every header, and refreshes itself while a run is live.
import { escapeXml } from './svg.mjs';

export const pad = number => String(number).padStart(2, '0');
// Neutral alt text: never the catalogue style name (some name real groups or trademarks).
export const altText = (project, number) => `${project.name} header${number ? ` ${pad(number)}` : ''}`;
export const useCommand = (number, extra = '') => `npx readme-nfo use ${number}${extra}`;
const AGENT_LABELS = { claude: 'Claude Code', codex: 'Codex', host: 'your agent' };

function card(header, project, extra) {
  const number = pad(header.number), use = useCommand(header.number, extra);
  const state = header.status;
  const art = state === 'ok'
    ? `<a class="art" href="${escapeXml(header.svg)}"><img src="${escapeXml(header.svg)}" alt="${escapeXml(altText(project, header.number))}" loading="lazy"></a>`
    : `<div class="art empty ${state}"><span>${state === 'pending' ? 'DRAWING&hellip;' : state === 'briefed' ? 'WAITING FOR SVG' : 'SKIPPED'}</span>${header.issue ? `<small>${escapeXml(String(header.issue).slice(0, 160))}</small>` : ''}${state === 'failed' ? `<small><code>npx readme-nfo retry${escapeXml(extra)}</code></small>` : ''}</div>`;
  return `<article id="h${number}" class="${state}">
${art}
<footer><span class="num">${number}</span>${state === 'ok' ? `<code>${escapeXml(use)}</code><button type="button" data-copy="${escapeXml(use)}">Copy</button>` : `<span class="dim">${escapeXml(header.family || '')} &middot; ${escapeXml(header.id)}</span>`}</footer>
</article>`;
}

export function galleryHtml(state, project, { live = false, extra = '' } = {}) {
  const headers = state.headers || [];
  const ready = headers.filter(header => header.status === 'ok').length;
  const sections = (state.batches || []).map(batch => {
    const items = headers.filter(header => header.batch === batch.batch);
    if (!items.length) return '';
    const when = batch.startedAt ? new Date(batch.startedAt).toISOString().slice(0, 10) : '';
    return `<section aria-labelledby="credit-${batch.batch}"><h2 class="credit" id="credit-${batch.batch}"><b>CREDIT ${batch.batch}</b><span>${batch.from === batch.to ? pad(batch.from) : `${pad(batch.from)}-${pad(batch.to)}`}</span><span>${escapeXml(AGENT_LABELS[batch.agent] || batch.agent || '')}</span><span>${escapeXml(when)}</span></h2>
<div class="grid">${items.map(header => card(header, project, extra)).join('\n')}</div></section>`;
  }).join('\n');
  const running = live && headers.some(header => header.status === 'pending');
  const link = project.url ? `<a href="${escapeXml(project.url)}">${escapeXml(project.fullName)}</a>` : escapeXml(project.fullName);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
${running ? '<meta http-equiv="refresh" content="5">' : ''}<title>${escapeXml(project.name)} - README.NFO gallery</title><style>
:root{color-scheme:dark;--bg:#0c0d14;--panel:#1b1e2b;--ink:#e8ecf8;--dim:#8b93a7;--line:#3a3f55;--amber:#ffb000;--cyan:#7fe3ff}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 ui-monospace,Consolas,'Liberation Mono',monospace;padding:28px 16px}
main{max-width:1500px;margin:auto}h1{font-size:24px;margin:0 0 4px;letter-spacing:.06em}a{color:var(--cyan)}p{margin:6px 0;color:var(--dim)}
.top{border:2px solid var(--line);border-radius:4px;padding:16px 18px;margin-bottom:24px;background:linear-gradient(#1b1e2b,#0c0d14)}
.top code{color:var(--amber)}.live{color:var(--amber)}
.credit{display:flex;flex-wrap:wrap;gap:6px 18px;align-items:baseline;font-size:15px;font-weight:400;margin:30px 0 14px;padding:6px 0;border-top:2px dashed var(--line);border-bottom:2px dashed var(--line);color:var(--dim)}
.credit b{color:var(--amber);letter-spacing:.12em}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,420px),1fr));gap:18px}
article{display:flex;flex-direction:column;background:var(--panel);border:2px solid var(--line);border-radius:4px;overflow:hidden}
article:target{border-color:var(--amber)}
.num{flex:none;background:var(--amber);color:#0b0c12;font-weight:700;font-size:18px;padding:1px 9px;border-radius:3px}
.art{display:block;flex:1;background:#05060a}.art img{display:block;width:100%;height:auto}
.empty{aspect-ratio:960/380;display:flex;flex-direction:column;gap:6px;align-items:center;justify-content:center;color:var(--dim);border-bottom:1px solid var(--line);padding:16px;text-align:center}
.empty span{letter-spacing:.2em}.empty.pending span{color:var(--amber);animation:blink 1.2s steps(2) infinite}.empty small{max-width:90%;overflow-wrap:anywhere}
@keyframes blink{50%{opacity:.35}}@media(prefers-reduced-motion:reduce){.empty.pending span{animation:none}}
footer{display:flex;gap:10px;align-items:center;padding:10px 12px;background:#0b0c12;border-top:1px solid var(--line)}
footer code{flex:1;color:var(--ink);overflow-wrap:anywhere}footer .dim{flex:1}.dim{color:var(--dim)}
button{font:inherit;cursor:pointer;padding:4px 12px;border:1px solid var(--line);border-radius:3px;background:var(--panel);color:var(--ink)}button:hover{border-color:var(--amber)}
</style></head><body><main>
<div class="top"><h1>README.NFO &middot; ${escapeXml(project.name)}</h1>
<p>${link} &middot; ${ready} header${ready === 1 ? '' : 's'} ready${running ? ' &middot; <span class="live">drawing now, this page refreshes itself</span>' : ''}</p>
<p>Pick a number: type it in the terminal, or run <code>npx readme-nfo use N</code> in your project folder. It goes at the top of your README. Review with <code>git diff</code>, then commit.</p>
<p>More styles: <code>npx readme-nfo more</code>. Headers are MIT licensed (<a href="LICENSE">notice</a>).</p></div>
${sections || '<p>No headers yet.</p>'}
</main><script>
try{const y=sessionStorage.getItem('readme-nfo-scroll');if(y)scrollTo(0,+y);addEventListener('scroll',()=>sessionStorage.setItem('readme-nfo-scroll',scrollY));}catch{}
document.querySelectorAll('button[data-copy]').forEach(b=>b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);b.textContent='Copied'}catch{b.textContent='Select the text'}}));
</script></body></html>
`;
}
