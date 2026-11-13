// Rebuild this frozen selection. No network, image service or generation API is used.
import {DRAW} from './lib.mjs';
for(const p of DRAW.options)await import('./'+p.slug+'.mjs');
await import('./build-gallery.mjs');
console.log('Rebuilt ten MediaLog identities (collection 06).');
