import {write} from './lib.mjs';
const text=String.raw`                   .----------------.
                  /  open language   \
             .---'--------------------'---.
            /       .---.    .---.        \
           |        | o |----| o |         |
           |        '---'    '---'         |
           |            \__/              |
            \           /  \             /
             '---------'    '-----------'
                  /\              /\
                 /__\------------/__\
                   .-'          '-.
                  '----.    .----'
                       |____|

        heretic — open directions, drawn in plain text
        Python / directional ablation / Optuna
        https://github.com/p-e-w/heretic

        Original schematic creature; no borrowed signature.`;
write(4,{text,summary:'A contour-only ASCII creature made from two connected model nodes, with an open-language caption.',choices:['The creature face is a pair of connected residual nodes','Open jaws act as a metaphor for unrestricted model language']});
