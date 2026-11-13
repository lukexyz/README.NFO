// Friendly contact-list colours become two overlapping speech forms.
import {P,L,R,C,G,word,gradient,save} from './lib.mjs';
const defs=gradient('blue',[[0,'#c9e9ff'],[1,'#3988c2']])+gradient('green',[[0,'#dcf6aa'],[1,'#73b955']]);
let body=P('M48 68H140Q166 68 166 94V160Q166 180 143 180H99L67 211V180H48Q29 180 29 157V91Q29 68 48 68Z','url(#blue)','stroke="#32659b" stroke-width="5"');
body+=P('M114 110H188Q213 110 213 135V188Q213 213 190 213H179L192 236L151 213H114Q91 213 91 188V134Q91 110 114 110Z','url(#green)','stroke="#418254" stroke-width="5"');
body+=C(132,163,8,'#fff','class="typing first"')+C(156,163,8,'#fff','class="typing second"')+C(180,163,8,'#fff','class="typing third"')+C(47,76,13,'#abda66','stroke="#fff" stroke-width="5"');
body+=word({x:259,y:94,width:497,height:116,weight:15,ink:'var(--ink)',inks:[null,null,null,null,null,'#387cb2','#387cb2','#387cb2']});
save(8,{body,defs,css:'.typing{animation:typing 4.8s ease-in-out infinite}.second{animation-delay:.35s}.third{animation-delay:.7s}@keyframes typing{40%{opacity:.6}}',name:'You had to be there',description:'Two overlapping chat bubbles, a green presence light and an easy blue wordmark. A favourite becomes a conversation.',choices:['Two distinct bubbles stand for you and the people you know','The typing dots suggest swapping recommendations, with no fake notification counts']});
