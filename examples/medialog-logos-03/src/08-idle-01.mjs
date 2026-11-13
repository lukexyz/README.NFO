// Two-part audio diamonds become the two halves of an open book.
import {P,L,ink,paper,blue,save} from './lib.mjs';
const icon=P('M25 123L76  70 L119 113L119 224L68 180Z',ink)+P('M130 113L173 70L221 123L179 180L130 224Z',blue)+L('M52 126L78 100L97 121V173M151 121L171 100L194 126',paper,8);
save(8,{icon,name:'Two sides of a story',description:'Two broad diamond folds create an open-book silhouette, divided by a clear white gutter.',choices:['The paired diamond reference becomes pages belonging together','Two restrained tones leave the centre fold and silhouette easy to recognise']});
