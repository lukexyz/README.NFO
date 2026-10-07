import {T,write} from './lib.mjs';
const text=String.raw`¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯
   __  __  ____  ____  ____  ______  __  _____
  / / / / / __/ / __/ / __/ /_  __/ / / / ___/
 / /_/ / / /_  / /_/ / /_   / /   / / / /
/ __  / / __/ / _  / / __/ / /   / / / /___
¯/ /¯/ /¯/ /___¯/ /| |¯/ /___¯/ /¯¯/ /¯¯\____/
/_/ /_/ /____//_/ |_|/____/ /_/  /_/
:::::::::::: h E R E T I C / open directions ::::::::::::::::
   ¾¾¾¾     model research     ¾¾¾¾     Python     ¾¾¾¾
   ¦  Directional ablation / Optuna parameter search       ¦
   ¦  AGPL-3.0 / p-e-w/heretic                             ¦
   ·  Original Latin-1 outline artwork / no artist tag     ·
___________________________________________________________`;
let body='';text.split('\n').forEach((line,i)=>{body+=T(line,52,47+i*25,20,'#e4d4bc');});
write(37,{body,text,background:'#17120f',summary:'A full-width Latin-1 colly page with exaggerated outline horizontals, macron ceilings and a scene-case Heretic caption.',choices:['The long letter rails are drawn for the Heretic name','Fraction and broken-bar textures frame actual research facts without copying an artist signature']});
