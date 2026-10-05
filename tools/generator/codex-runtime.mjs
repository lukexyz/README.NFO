import { spawn } from 'node:child_process';

// Ask the CLI for its sign-in type. Never read or display stored credentials.
export async function inspectAuthorRuntime({ runner = spawn, env = process.env } = {}) {
  if (env.CODEX_API_KEY) return { billing: 'API account owning CODEX_API_KEY (usage billed)', auth: 'api-key' };
  return new Promise(resolve => {
    let child, output = '', settled = false;
    const finish = value => { if (settled) return; settled = true; clearTimeout(timer); resolve(value); };
    const unknown = { auth: 'unknown', billing: 'Your configured Codex account/provider; usage applies (sign-in type unavailable)' };
    let timer;
    try { child = runner('codex', ['login', 'status'], { stdio: ['ignore', 'pipe', 'pipe'], shell: false, windowsHide: true }); }
    catch { resolve(unknown); return; }
    const collect = chunk => { output = (output + chunk.toString()).slice(-4096); };
    child.stdout?.on('data', collect); child.stderr?.on('data', collect);
    timer = setTimeout(() => { child.kill(); finish(unknown); }, 3000);
    child.once('error', () => finish(unknown));
    child.once('close', code => {
      if (code === 0 && /logged in using chatgpt/i.test(output)) finish({ auth: 'chatgpt', billing: 'Your signed-in ChatGPT account / Codex allowance' });
      else if (code === 0 && /(?:api key|api_key|apikey)/i.test(output)) finish({ auth: 'api-key', billing: 'API account owning your Codex login key (usage billed)' });
      else finish(unknown);
    });
  });
}

// Only forward model/provider fields from the CLI startup header, never its prompt or logs.
export function createRuntimeReporter(report = () => {}) {
  let header = '', stopped = false;
  const seen = {};
  return chunk => {
    if (stopped) return;
    header = (header + chunk.toString()).slice(0, 16384);
    const boundary = header.search(/\n(?:user|thinking)\r?\n/);
    const startup = boundary < 0 ? header : header.slice(0, boundary);
    if (/OpenAI Codex/i.test(startup)) {
      const update = {};
      for (const key of ['model', 'provider']) {
        const value = startup.match(new RegExp(`^${key}:\\s*([^\\r\\n]+)\\r?\\n`, 'm'))?.[1]?.trim();
        if (value && value !== seen[key]) { seen[key] = value; update[key] = value.replace(/[\u0000-\u001f\u007f-\u009f]/g, '').slice(0, 120); }
      }
      if (Object.keys(update).length) report(update);
    }
    if (boundary >= 0 || header.length >= 16384) stopped = true;
  };
}
