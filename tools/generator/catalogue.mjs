import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync(new URL('../../styles/styles.json', import.meta.url), 'utf8'));
export const catalogue = Object.freeze(data.families.flatMap(family => family.styles
  .filter(style => !style.duplicate_of).map(style => ({ ...style, family: family.key }))));
export const supportsFormat = (style, format = 'all') => format === 'all'
  || (format === 'text' ? ['text-only', 'text-plus-svg'].includes(style.medium) : style.medium !== 'text-only');
export const catalogueFor = format => catalogue.filter(style => supportsFormat(style, format));
export const formatsFor = style => style.medium === 'text-only' ? ['text'] : style.medium === 'text-plus-svg' ? ['text', 'svg'] : ['svg'];
