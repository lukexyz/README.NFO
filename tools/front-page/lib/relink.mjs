// Rewrites a README written with repository-root-relative links so it works from another folder.
//   relink(markdown, fromDir, repoRoot) -> markdown whose local src/href/srcset and [text](link)
// targets resolve from fromDir. Remote URLs, #anchors, absolute paths, data: URIs, fenced code
// blocks and inline code spans are left alone (a code sample such as an install snippet keeps the
// path it shows the reader).
import path from 'node:path';

const LOCAL = (ref) => ref && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(ref);

export function relink(markdown, fromDir, repoRoot) {
  if (path.resolve(fromDir) === path.resolve(repoRoot)) return markdown;
  const fix = (ref) => {
    if (!LOCAL(ref)) return ref;
    const [, file, tail] = ref.match(/^([^?#]*)(.*)$/);
    const rel = path.relative(fromDir, path.resolve(repoRoot, file)).split(path.sep).join('/') || '.';
    return `${rel}${/\/$/.test(file) && rel !== '.' ? '/' : ''}${tail}`;
  };
  const prose = (text) => {
    const spans = [];
    let out = text.replace(/(`+)(?!`)[\s\S]*?[^`]\1(?!`)/g, (m) => `\u0000${spans.push(m) - 1}\u0000`);
    out = out
      .replace(/\b(src|href)=(["'])([^"']*)\2/gi, (m, attr, q, ref) => `${attr}=${q}${fix(ref)}${q}`)
      .replace(/\bsrcset=(["'])([^"']*)\1/gi, (m, q, value) => `srcset=${q}${value.split(',').map((part) => {
        const [lead, ref, rest] = part.match(/^(\s*)(\S*)([\s\S]*)$/).slice(1);
        return `${lead}${fix(ref)}${rest}`;
      }).join(',')}${q}`)
      .replace(/(\]\(\s*)(<[^>]+>|[^\s)]+)/g, (m, open, ref) => (ref.startsWith('<') ? `${open}<${fix(ref.slice(1, -1))}>` : `${open}${fix(ref)}`))
      .replace(/^( {0,3}\[[^\]^][^\]]*\]:\s*)(\S+)/gm, (m, open, ref) => `${open}${fix(ref)}`);
    return out.replace(/\u0000(\d+)\u0000/g, (m, k) => spans[Number(k)]);
  };
  const lines = markdown.split('\n');
  const out = [];
  let fence = null;
  let chunk = [];
  const flush = () => { if (chunk.length) out.push(prose(chunk.join('\n'))); chunk = []; };
  for (const line of lines) {
    if (fence) {
      out.push(line);
      const close = line.match(/^ {0,3}(`+|~+)\s*$/);
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) fence = null;
      continue;
    }
    const open = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (open) { flush(); fence = open[1]; out.push(line); continue; }
    chunk.push(line);
  }
  flush();
  return out.join('\n');
}
