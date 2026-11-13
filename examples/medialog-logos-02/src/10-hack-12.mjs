// Painted diskmag masthead distilled into a folded zine and hand-cut serif title.
import {P,L,R,C,G,word,save} from './lib.mjs';
let body=P('M37 85L112 66L204  90 V214L120 194L37 218Z','#283143')+P('M48 92L112 77V183L48 202Z','#f3d394')+P('M120 79L192 99V201L120 182Z','#d88c68');
body+=P('M77 100L 90 126L119 122L98 144L105 172L 80 158L57 173L 60 145L41 127L68 126Z','#745a79')+L('M134 124L173 134M134 148L165 157','#f5c79c',6);
body+=word({x:265,y:93,width:489,height:122,kind:'serif',weight:12,ink:'var(--ink)',gap:10});
save(10,{body,name:'Margin notes',description:'A folded culture zine with a purple star tucked into its pages. A painted editorial identity for a diary with opinions.',choices:['The star is a remembered favourite, drawn into the open publication','Broad serif lettering echoes a diskmag masthead without reproducing its tiny article columns']});
