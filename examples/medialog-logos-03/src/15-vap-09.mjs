// A rounded desktop window becomes a view through an open book, without OS chrome.
import {P,L,R,ink,paper,blue,accent,save} from './lib.mjs';
const icon=R(34,68,171,165,ink,'rx="27"')+P('M51 92H112V186Q81 174 51 188Z',paper)+P('M125 92H188V188Q157 174 125 186Z',paper)+P('M51 155Q78 125 112 149V186Q81 174 51 188Z',blue)+P('M125 149Q162 120 188 147V188Q157 174 125 186Z',accent)+L('M119  90 V210',ink,8)+L('M60 209Q88 202 119 215Q153 202 181 209',paper,7);
save(15,{icon,name:'A window into it',description:'A softly framed book opens onto two quiet landscape shapes. Stories are a way into another world.',choices:['The window-and-landscape reference becomes an open volume','Two broad page planes carry the idea without clouds, buttons or screen labels']});
