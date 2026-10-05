import { asciiLettering } from './svg.mjs';

export const runtime = Object.freeze({ engine: 'Local catalogue renderer', model: null, provider: null,
  ai_credits: 0, billing: 'Local CPU; no AI account is billed', author: 'Luke Woods', license: 'MIT' });

export function estimateBatch(count, sampleMs, fresh = 0) {
  if (fresh) return { minimum: 120 + fresh * 10, maximum: 300 + fresh * 60, approximate: true };
  // A measured sample predicts rendering only; network, npm installation and disk speed vary.
  const seconds = Math.max(1, Math.ceil(count * Math.max(sampleMs, 1) / 1000));
  return { minimum: seconds, maximum: seconds * 3 + 2 };
}

export function createTerminal({ stream = process.stdout, color = true, now = () => performance.now() } = {}) {
  const colored = color && stream.isTTY && !process.env.NO_COLOR;
  const paint = (value, code) => colored ? `\x1b[${code}m${value}\x1b[0m` : value;
  const line = value => stream.write(value+'\n');
  let started, active = false;
  let completed = 0, authoring = false;
  const safe = value => String(value).replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ');
  const finish = () => { if (active) { stream.write('\n'); active = false; } };
  return {
    line: value => { finish(); line(safe(value)); }, finish,
    banner(count, maximum, format) {
      line(paint(asciiLettering('README.NFO'), '36'));
      line(paint('  R E P O S I T O R Y   H E A D E R   F O U N D R Y', '36'));
      line('  '+ '-'.repeat(60));
      line(`  CATALOGUE  ${maximum} distinct styles | DRAW ${count} | ${format.toUpperCase()}`);
      line('  AUTHOR     Luke Woods / README.NFO / MIT');
      line('  SOURCE     https://github.com/lukexyz/README.NFO');
      line('');
    },
    runtime(plan, details = {}) {
      finish(); authoring = plan.counts.fresh > 0;
      line(`  ENGINE     ${authoring ? 'Codex authoring + local rendering' : runtime.engine} / Node.js ${process.versions.node}`);
      line(`  MIX        ${plan.counts.fresh} newly authored / ${plan.counts.prebuilt} prebuilt`);
      line(`  LIBRARY    ${plan.prebuiltLibrarySize} distinct local compositions / ${plan.catalogueSize} catalogue briefs`);
      line(`  MODEL      ${authoring ? 'Codex configured default; resolved when authoring starts' : 'None (local rendering)'}`);
      line(`  CREDITS    ${authoring ? safe(details.billing || 'Your configured Codex account; usage applies') : '0 AI credits / no account is billed'}`);
      if (authoring) line('  USAGE      Exact credits and cost are not measured by README.NFO.');
    },
    resolvedRuntime(details) {
      finish();
      if (details.model) line(paint(`  MODEL      ${safe(details.model)} (reported by Codex)`, '32'));
      if (details.provider) line(`  PROVIDER   ${safe(details.provider)}`);
      if (details.provider && details.provider.toLowerCase() !== 'openai') line(`  CREDITS    Your configured ${safe(details.provider)} provider account; billing depends on that provider.`);
    },
    estimate(count, sampleMs, offline, fresh = 0) {
      const time = estimateBatch(count, sampleMs, fresh);
      const label=count>15?'LARGE DRAW (>15)':'TIME ESTIMATE';
      const range = fresh ? `${Math.ceil(time.minimum / 60)}-${Math.ceil(time.maximum / 60)} min` : `${time.minimum}-${time.maximum}s`;
      line(paint(`  ${label}  ~${range}${fresh ? ' for authoring and rendering' : ' for local rendering'}${offline?'':'; GitHub lookup adds network time'}.`,count>15?'33':'90'));
      line(fresh ? '  Rough planning estimate; model speed, workload and retries can change it.' : '  Estimate uses a timed sample on this machine; npm startup is extra.');
    },
    progress(done, total, label = '') {
      started ??= now();
      completed = done; this.total = total;
      if (!stream.isTTY && done!==0 && done!==total && done%Math.max(1,Math.floor(total / 10))!==0) return;
      const fraction=total?done/total:0, filled=Math.round(fraction*24);
      const elapsed=Math.max(0,now()-started), eta=done?Math.ceil(elapsed/done*(total-done)/1000):null;
      const timing = authoring ? `elapsed ${Math.floor(elapsed / 1000)}s` : eta===null?'ETA measuring':`ETA ${eta}s`;
      const text=`  [${'#'.repeat(filled)}${'.'.repeat(24-filled)}] ${String(Math.round(fraction*100)).padStart(3)}% ${done}/${total} | ${timing} | ${safe(label)}`;
      if(stream.isTTY) { stream.write('\r\x1b[2K'+paint(text,'36')); active=true; }
      else line(text);
      if(done===total)finish();
    },
    tick() { if (stream.isTTY && this.total) this.progress(completed, this.total, 'Authoring / validating; waiting for completed headers'); },
    warning(value) { finish(); line(paint('  ! '+safe(value),'33')); },
  };
}
