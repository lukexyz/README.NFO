import {R,C,L,T,write} from './lib.mjs';
let body='';
for(let i=0;i<65;i++)body+=C((i*137)%960,(i*83)%400,i%6?1:2,['#fff','#ff0','#0ff'][i%3]);
body+=T('welcome to the',480,42,24,'#0ff','text-anchor="middle" font-family="serif"')+T('HERETIC',480,139,90,'#ff0','text-anchor="middle" font-family="Georgia,serif" font-weight="bold"')
  +T('unlocked language / open research',480,181,25,'#f0f','text-anchor="middle" font-family="serif"');
for(let i=0;i<48;i++)body+=R(i*20,211,20,13,i%2?'#000':'#ff0');
['PYTHON','AGPL-3.0','ABLITERATION','OPTUNA'].forEach((label,i)=>{body+=R(146+i*174,244,160,38,'#121230','stroke="#0ff"')+T(label,226+i*174,270,15,'#0f0','text-anchor="middle"');});
body+=L('M110 307H850','#f0f',3)+T('[ previous ]  ::  OPEN MODEL RING  ::  [ next ]',480,341,20,'#0ff','text-anchor="middle"')+T('p-e-w/heretic / homepage study',480,376,14,'#eee','text-anchor="middle"');
write(1,{body,background:'#000',summary:'A star-tiled web 1.0 homepage with a serif Heretic welcome, original research badges and a webring strip.',choices:['Research tools become original 88x31-inspired badges','The webring connects the model and research metaphor without inventing visitor counts'],text:'WELCOME TO THE HERETIC HOMEPAGE\n\n[ PYTHON ] [ AGPL-3.0 ] [ ABLITERATION ] [ OPTUNA ]\n\nFully automatic censorship removal for language models\nhttps://github.com/p-e-w/heretic'});
