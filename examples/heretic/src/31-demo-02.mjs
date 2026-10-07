import {write} from './lib.mjs';
const text=`+------------------------------------------------------------------+
|                       = HERETIC READ.ME =                         |
|                  model research / Python / AGPL-3.0               |
+------------------------------------------------------------------+

                       M A I N   I N D E X
             The project .................................. 01
             Directional ablation ......................... 02
             Parameter search ............................. 03

                               - 01 -

        THE PROJECT
        ===========
        Automatic censorship removal for language models.
        Original header artwork; this is not a release manual.

        COMPONENT       ROLE
        --------------- ------------------------
        Python          implementation
        Ablation        model intervention
        Optuna / TPE    parameter optimisation

------------------------ CUT HERE! --------------------------------
        Favourite direction: ____________________________
        [ ] inspect the README   [ ] compare the artwork

        https://github.com/p-e-w/heretic`;
write(31,{text,summary:'A paged demo READ.ME with a main index, research-component table and cut-here direction form.',choices:['Membership columns become verified software components and roles','The tear-off form asks for a direction rather than invented contact details']});
