// Memphis primitive shapes become two playful page forms, with no confetti field.
import {P,L,C,ink,paper,blue,accent,save} from './lib.mjs';
const icon=P('M32 119C54 77 97 81 114 109V211C82 182 58 182 32 193Z',ink)+P('M127 110L205 87V188L127 213Z',blue)+P('M145 120L177 110L180 153L165 144L150 161Z',accent)+L('M42 210Q 80 201 119 229Q164 201 205 205',ink,9)+C(62, 70,10,accent);
save(19,{icon,name:'A little off-script',description:'A rounded left page, an angular right page and a folded bookmark. A book with a little personality in its proportions.',choices:['The asymmetric shapes carry the playful reference','A navy foundation and one warm accent keep the composition calm']});
