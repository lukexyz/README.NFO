// Shared facts for concept 05: every committed header page with its style id, family, kind and
// whether the front page may show or link it. Everything is computed from git and the catalogue.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';

export const SRC = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(SRC, '..', '..', '..', '..');
const git = (args) => execSync(`git ${args}`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);

export const PROJECT = { castaway: 'Castaway', 'ultra-satisfactory': 'ULTRA-SATISFACTORY', 'readme-nfo': 'README.NFO', heretic: 'Heretic', 'dance-vision': 'Dance Vision', 'naturalis-historia': 'NATURALIS-HISTORIA', gl4ss: 'GL4SS', st3gg: 'ST3GG' };
// Last-callers order and counts as the brief gives them (largest first); counts are recomputed.
export const CALLER_ORDER = ['castaway', 'ultra-satisfactory', 'readme-nfo', 'heretic', 'dance-vision', 'naturalis-historia', 'gl4ss', 'st3gg'];

// Shared deny list for tiles and picks (chief.json shared_facts_md).
const DENY_TILE = [
  /^examples\/dance-vision\//,
  /^examples\/readme-nfo\//, // its set art says 152
  /^examples\/castaway\/(15|22|23|3[1-5]|83|99|10[3-6]|115|116)-/,
  /^examples\/heretic\/(06|09|29|38)-/,
  /^examples\/ultra-satisfactory\/(0[1-6]|11|15|21|29)-/,
];
// Never linked at all: piracy vocabulary in the page (word-start match, so "cracktro" counts).
const HARD = /\b(crack(s|ed|er|ers|ing|tro|tros)?|keygens?|keymaker|warez|serial numbers?|nuked?|topsites?|sitebot|xdcc|fxp|sfv|zipscript|pirate[sd]?|piracy|trainers?|supplied by|swappers?)\b/i;

// Never linked at all: a real scene group named in the page, its slug or its SVG <title>.
// Case-sensitive proper nouns, so colour words ("orange") and map legends do not count.
export const GROUP = /\b(Razor ?1911|Razor look|Fairlight|TRSI|Red Sector|Kefrens|Future Crew|Skid ?Row|SKIDROW|Reloaded|Paradox|Quartex|Scoopex|Melon Dezign|Hoodlum|Deviance|Tristar|Ikari|Hokuto Force|Skillion|Dream Team|Phenomena|Spaceballs|Silents|Farbrausch|Conspiracy|Haujobb|Censor Design|Booze Design|Oxyron|Genesis Project|DrinkOrDie|ACiD|Blocktronics|Mistigris|Sanity|Crionics|Cascada|Byterapers|Andromeda|Anarchy|Vision Factory)\b|kefrens/;

export async function inventory() {
  const { loadCatalogue } = await import(pathToFileURL(`${ROOT}/tools/generator/hybrid-catalogue.mjs`).href);
  const cat = loadCatalogue();
  const perFamilyStyles = {};
  for (const s of cat.distinct) { const f = cat.family.get(s.id); perFamilyStyles[f] = (perFamilyStyles[f] || 0) + 1; }
  const pages = git('ls-files examples').filter((f) => /^examples\/[^/]+\/\d+-[^/]+\.md$/.test(f));
  const svgs = git('ls-files "examples/*/assets/*.svg"');
  const log = fs.readFileSync(`${ROOT}/examples/build-log.csv`, 'utf8').trim().split(/\r?\n/).slice(1).map((l) => l.split(','));
  const logId = new Map(log.map((r) => [`examples/${r[2]}/${r[3]}`, r[4]]));
  const PLINY = { 'off-air': 'idle-10', 'telnet-board': 'asia-03', 'demo-titles': 'demo-01', viewdata: 'ansi-09', 'luna-desktop': 'vap-09' };
  const SIX = { 'nfo-release': 'nfo', 'amiga-cracktro': 'c64', 'keygen-dialog': 'pc', 'c64-loader': 'c64', 'crt-terminal': 'hack', 'ansi-bbs': 'ansi', 'ansi-bbs-pirate-fm': 'ansi' };
  const NAMES = JSON.parse(fs.readFileSync(path.join(SRC, 'neutral-names.json'), 'utf8')).names;
  const headers = pages.map((md) => {
    const [, set, name] = md.split('/');
    const base = name.replace(/\.md$/, '');
    const slug = base.replace(/^\d+-/, '').replace(/_opus_5\.5$/, '');
    const id = logId.get(md) || (/^[a-z0-9]+-\d+$/.test(slug) ? slug : PLINY[slug]) || '';
    const six = !id && SIX[slug] ? slug : '';
    const family = id ? cat.family.get(id) || id.split('-')[0] : SIX[slug];
    const text = fs.readFileSync(path.join(ROOT, md), 'utf8');
    const own = svgs.filter((s) => s.startsWith(`examples/${set}/assets/${base}`));
    const main = text.match(/<img[^>]*src="([^"]+\.svg)"/i);
    const animated = own.some((s) => /@keyframes|<animate|<set\b/.test(fs.readFileSync(path.join(ROOT, s), 'utf8')));
    const svgTitle = main ? ((fs.readFileSync(path.join(ROOT, path.dirname(md), main[1]), 'utf8').match(/<title[^>]*>([^<]*)/) || [])[1] || '') : '';
    const hidden = HARD.test(text) || HARD.test(slug) ? 'vocab' : GROUP.test(text) || GROUP.test(slug) || GROUP.test(svgTitle) ? 'group' : '';
    const tileOk = !hidden && !DENY_TILE.some((re) => re.test(md));
    return {
      md, set, base, n: base.match(/^\d+/)[0], id, family, project: PROJECT[set] || set,
      name: NAMES[id] || NAMES[`six:${six}`] || slug, kind: own.length ? (animated ? 'animated' : 'svg') : 'text',
      svg: main ? path.posix.normalize(path.posix.join(path.posix.dirname(md), main[1])) : '', hidden, tileOk,
    };
  });
  const perSet = {};
  for (const h of headers) perSet[h.set] = (perSet[h.set] || 0) + 1;
  const callers = CALLER_ORDER.filter((s) => perSet[s]).map((s) => [s, perSet[s]]);
  const F = { styles: cat.distinct.length, families: Object.keys(perFamilyStyles).length, headers: headers.length, projects: callers.length };
  return { headers, perFamilyStyles, callers, F, NAMES };
}
