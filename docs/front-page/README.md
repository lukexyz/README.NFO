# Front-page designs

Four complete front pages were designed for README.NFO from ten concepts. The plan, scores and research are in [comparisons/front-page](../../comparisons/front-page/PLAN.md). **Arcade Floor** is the live [README](../../README.md); the others are kept here, ready to swap in.

| Design | What it is |
| --- | --- |
| [Arcade Floor](arcade-floor/README.md) | **Live.** An arcade cabinet in attract mode (INSERT COIN, 1P Claude, 2P Codex), a CONTINUE? screen acting out "number 3", and a floor of 50 numbered cabinets. |
| [BBS Local Logon](bbs-local-logon/README.md) | A colour ANSI bulletin board: hotkey main menu, a numbered file listing of examples, batch 1 then "make 10 more" for batch 2. |
| [The Release](the-release/README.md) | A 2000s game-release NFO: block logo, install notes first, an animated numbered-batches diagram; a green-bar printout in light mode. |
| [Boot Intro](boot-intro/README.md) | A cracktro: chrome logo, starfield, copper bars, a sine scroller and a CLAUDE CODE / CODEX engine flip, with plain steps straight after. |
| [Original](original/README.md) | The front page before the redesign. |

Each design's `src/` holds the Node scripts that rebuild its art, and `NOTES.md` explains it. To preview any design as GitHub shows it: `node tools/front-page/render.mjs docs/front-page/<design>` writes a `preview.html` beside it.
