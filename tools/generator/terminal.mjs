import { asciiLettering } from './svg.mjs';

export const runtime = Object.freeze({ engine: 'Local catalogue renderer', model: null, provider: null,
  ai_credits: 0, billing: 'Local CPU; no AI account is billed', author: 'Luke Woods', license: 'MIT' });

export function estimateBatch(count, sampleMs, fresh = 0) {
  if (fresh) return { minimum: fresh * 60, maximum: fresh * 480, approximate: true };
  const seconds = Math.max(1, Math.ceil(count * Math.max(sampleMs, 1) / 1000));
  return { minimum: seconds, maximum: seconds * 3 + 2 };
}

export function createTerminal({ stream = process.stdout, color = true, now = () => performance.now() } = {}) {
  const colored = color && stream.isTTY && !process.env.NO_COLOR;
  const paint = (value, code = '38;5;141') => colored ? `\x1b[${code}m${value}\x1b[0m` : value;
  const safe = value => String(value).replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ');
  const width = Math.max(36, Math.min(88, (stream.columns || 90) - 2)), inner = width - 4;
  const cells = value => [...value].reduce((total, ch) => total + (/\p{Extended_Pictographic}|[\u1100-\u115f\u2329\u232a\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe10-\ufe6f\uff01-\uff60\uffe0-\uffe6]/u.test(ch) ? 2 : /\p{Mark}/u.test(ch) ? 0 : 1), 0);
  const clip = (value, size) => {
    let result='';
    for (const ch of value) { if (cells(result + ch) > size) break; result += ch; }
    return result;
  };
  const wrap = value => {
    let rest=safe(value), rows=[];
    while (cells(rest)>inner) {
      let part=clip(rest,inner), split=part.lastIndexOf(' ');
      if (split>inner/2) part=part.slice(0,split);
      rows.push(part);rest=rest.slice(part.length).trimStart();
    }
    return [...rows,rest];
  };
  const row = value => {
    const text=safe(value), match=text.match(/^([A-Z][A-Z /().>0-9-]*?)(\s{2,})(.*)$/);
    const content=match ? paint(match[1]) + match[2] + match[3] : text.startsWith('[') ? paint(text) : text;
    return `${paint('|','38;5;99')} ${content}${' '.repeat(Math.max(0,inner-cells(text)))} ${paint('|','38;5;99')}`;
  };
  const border = title => {
    const tag=title?`[ ${clip(title,inner-4)} ]`:'';
    return paint('+--','38;5;99') + paint(tag,'1;38;5;141') + paint('-'.repeat(Math.max(0,width-tag.length-4))+'+','38;5;99');
  };
  const panel = (title, values) => [border(title), ...values.flatMap(wrap).map(row), border('')];
  let started, active = false, completed = 0, authoring = false;
  let totalCount=0, header, headerStarted, activeRows=0, ticks=0, latestLabel='Preparing headers';
  const finish = () => { if (active) { stream.write('\n'); active=false; } };
  const show = (title, values) => { finish(); stream.write(panel(title,values).join('\n')+'\n'); };
  const info = (key,value) => `${key.padEnd(11)} ${safe(value)}`;
  const drawProgress = () => {
    const fraction=totalCount?completed/totalCount:0, elapsed=Math.max(0,now()-started);
    const eta=completed?Math.ceil(elapsed/completed*(totalCount-completed)/1000):null;
    const headerFraction=header?header.step/header.steps:0;
    const barWidth=Math.min(28,Math.max(8,inner-20));
    const bar=(fraction,summary)=>`[${'#'.repeat(Math.round(fraction*barWidth))}${'.'.repeat(barWidth-Math.round(fraction*barWidth))}] ${summary}`;
    const waiting=header && header.step<header.steps;
    const spinner=['|','/','-','\\'][ticks++%4];
    const values=[
      header?`HEADER ${header.number}/${header.total} / ${header.id}`:'HEADER / WAITING',
      bar(headerFraction,`${String(Math.round(headerFraction*100)).padStart(3)}% ${header?.step||0}/${header?.steps||5} stages`),
      header?`${header.label}${waiting?' ['+spinner+']':''} / ${Math.floor(Math.max(0,now()-headerStarted)/1000)}s`:latestLabel,
      '',
      `BATCH / ${completed} of ${totalCount} headers saved`,
      bar(fraction,`${String(Math.round(fraction*100)).padStart(3)}% ${completed}/${totalCount}`),
      authoring?`elapsed ${Math.floor(elapsed/1000)}s`:eta===null?'ETA measuring':`ETA ${eta}s`,
    ].map(value=>cells(safe(value))>inner?clip(safe(value),inner-3)+'...':safe(value));
    const rendered=panel(completed===totalCount?'DRAW COMPLETE':'GENERATING',values);
    if(stream.isTTY){
      stream.write((active?`\r\x1b[${activeRows-1}A`:'')+rendered.map(text=>'\x1b[2K'+text).join('\n'));active=true;activeRows=rendered.length;
    }else stream.write(rendered.join('\n')+'\n');
    if(completed===totalCount)finish();
  };
  return {
    line(value) { show('LOG', [safe(value).trim()]); }, finish,
    banner(count, maximum, format) {
      const art=asciiLettering(inner<59?'NFO':'README.NFO').split('\n').map(line=>line.trimEnd());
      finish();
      const artRows=art.flatMap(wrap).map(text=>{
        const lead=' '.repeat(Math.max(0,Math.floor((inner-cells(text))/2)));
        return `${paint('|','38;5;99')} ${lead}${paint(text,'1;38;5;141')}${' '.repeat(Math.max(0,inner-cells(text)-lead.length))} ${paint('|','38;5;99')}`;
      });
      stream.write([border('README.NFO / HEADER FOUNDRY'),...artRows,row(''),
        row(clip('R E P O S I T O R Y   H E A D E R   F O U N D R Y',inner)),
        ...[info('CATALOGUE',`${maximum} distinct styles / DRAW ${count} / ${format.toUpperCase()}`),
          info('AUTHOR','Luke Woods / README.NFO / MIT'),info('SOURCE','https://github.com/lukexyz/README.NFO')].flatMap(wrap).map(row),border('')].join('\n')+'\n');
    },
    runtime(plan, details = {}) {
      authoring = plan.counts.fresh > 0;
      show('RUN INFO', [
        info('ENGINE',`${authoring?'Codex authoring + local rendering':runtime.engine} / Node.js ${process.versions.node}`),
        info('MIX',`${plan.counts.fresh} newly authored / ${plan.counts.prebuilt} prebuilt`),
        info('LIBRARY',`${plan.prebuiltLibrarySize} local compositions / ${plan.catalogueSize} catalogue briefs`),
        info('MODEL',authoring?'Codex configured default; resolved when authoring starts':'None (local rendering)'),
        info('CREDITS',authoring?details.billing||'Your configured Codex account; usage applies':'0 AI credits / no account is billed'),
        ...(authoring?[info('USAGE','Exact credits and cost are not measured by README.NFO.')]:[]),
      ]);
    },
    resolvedRuntime(details) {
      const rows=[];
      if(details.model)rows.push(info('MODEL',`${safe(details.model)} (reported by Codex)`));
      if(details.provider)rows.push(info('PROVIDER',details.provider));
      if(details.provider && details.provider.toLowerCase()!=='openai')rows.push(info('CREDITS',`Your configured ${safe(details.provider)} provider account; billing depends on that provider.`));
      if(rows.length)show('AUTHORING SESSION',rows);
    },
    estimate(count, sampleMs, offline, fresh = 0) {
      const time=estimateBatch(count,sampleMs,fresh);
      const range=fresh?`${Math.ceil(time.minimum/60)}-${Math.ceil(time.maximum/60)} min`:`${time.minimum}-${time.maximum}s`;
      show(count>15?'LARGE DRAW (>15)':'TIME ESTIMATE',[
        `~${range}${fresh?' for authoring and rendering':' for local rendering'}${offline?'':'; GitHub lookup adds network time'}.`,
        fresh?'Rough planning estimate; model speed, workload and retries can change it.':'Estimate uses a timed sample on this machine; npm startup is extra.',
      ]);
    },
    progress(done, total, label = '') {
      started ??= now();completed=done;totalCount=total;latestLabel=label;
      if(!stream.isTTY && done!==0 && done!==total && done%Math.max(1,Math.floor(total/10))!==0)return;
      drawProgress();
    },
    headerProgress(details) {
      started ??= now();totalCount=details.total;
      if(header?.id!==details.id)headerStarted=now();
      header=details;
      if(stream.isTTY || [0,2,5].includes(details.step))drawProgress();
    },
    tick() { if(stream.isTTY && totalCount && completed<totalCount)drawProgress(); },
    warning(value) { show('NOTICE',['! '+safe(value)]); },
  };
}
