// Deny-list scan shared by the build scripts. A page or SVG fails when it
// mentions piracy vocabulary or a real scene group name. Word lists are
// matched case-insensitively on word boundaries; known false positives
// (crackle, razor-straight) are allowed explicitly.
import fs from 'node:fs';

export const PIRACY = [
  'crack', 'cracks', 'cracked', 'cracker', 'crackers', 'cracking', 'cracktro', 'cracktros',
  'keygen', 'keygens', 'serial', 'serials', 'warez', 'supplied by', 'swapper', 'swappers',
  'nuke', 'nuked', 'protection', 'rip', 'ripped', 'trainer', 'trainers',
];
// Words my own copy must avoid on top of PIRACY.
export const COPY_ONLY = ['presents', 'intro pack'];
export const GROUPS = [
  'razor 1911', 'razor1911', 'rzr', 'fairlight', 'flt', 'paradox', 'skid row', 'skidrow',
  'red sector', 'kefrens', 'quartex', 'tristar', 'future crew', 'reloaded', 'hoodlum',
  'deviance', 'prestige', 'trsi', 'scoopex', 'melon dezign', 'sanity', 'spaceballs',
  'phenomena', 'rebels', 'silents', 'anthrox', 'crusaders', 'hotline', 'ikari', 'byterapers',
  'the humble guys', 'thg', 'pwa', 'vitality', 'tdu',
  'farbrausch', 'haujobb', 'andromeda',
  'bamiga', 'alpha flight', 'fairlight', 'dynamic duo', 'rabenauge',
  'genesis project', 'laxity', 'censor design', 'booze design',
  'onslaught', 'hokuto force',
  'vision factory', 'the silents', 'dexion', 'tdr',
];
const ALLOW = [/crackle/gi, /razor-straight/gi, /hybrid-/gi, /\bhybrid (header|catalogue|output|author)/gi, /first-class/gi, /class=/gi];

export function scanText(text) {
  let t = text;
  for (const re of ALLOW) t = t.replace(re, ' ');
  const hits = [];
  for (const w of [...PIRACY, ...GROUPS]) {
    const re = new RegExp(`(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z0-9])`, 'i');
    const m = t.match(re);
    if (m) {
      const i = m.index;
      hits.push(`${w}: ...${t.slice(Math.max(0, i - 50), i + w.length + 40).replace(/\s+/g, ' ')}...`);
    }
  }
  return hits;
}
export const scanFile = (f) => scanText(fs.readFileSync(f, 'utf8'));
