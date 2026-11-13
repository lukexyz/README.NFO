// Rebuilds this fixed draw only. No network or paid generation calls.
import {draw} from './lib.mjs';
for(const pick of draw.options) await import('./'+pick.slug+'.mjs');
await import('./build-gallery.mjs');
console.log('Rebuilt ten original MediaLog headers.');
