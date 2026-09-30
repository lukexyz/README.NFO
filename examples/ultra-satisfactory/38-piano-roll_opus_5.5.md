<p align="center">
  <img src="assets/38-piano-roll_opus_5.5.svg" width="100%" alt="ULTRA-SATISFACTORY as a falling-note piano roll. The name is spelled in note blocks, ULTRA in cyan and SATISFACTORY in white, drifting down onto an 88-key keyboard whose keys light up as each bar lands. Under the title falls the app's whole recipe book: 211 bars, one for every machine recipe, each as long as its cycle time and coloured by its machine, from the slowest machine on the left to the fastest on the right: Particle Accelerator (3 recipes), Manufacturer (38), Assembler (58), Blender (13), Foundry (7), Refinery (29), Constructor (39), Packager (20) and Smelter (4). Hollow bars are the 88 alternate recipes, and a purple diamond marks the parts the Space Elevator asks for. The longest bars are labelled, among them Uranium Fuel Unit 300 s, Nuclear Pasta 120 s and Modular Frame 60 s. The top line reads: every recipe, building and Space Elevator objective, one click apart; a companion app for Satisfactory, unofficial fan project. Three blocks name the tabs Objectives, Items and Buildings, and a counter of recipes played climbs to 211 of 211. A note in the margin reads: Smelter: 4 notes, 10 s. That is the whole part.">
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b> is a companion app for the factory-building game <i>Satisfactory</i>: every recipe, building and Space Elevator objective, one click apart.<br>
  <sub>⚡ That is its whole recipe book up there, arranged for piano: 211 machine recipes, 211 notes, and for once length is everything, because each bar is as long as its cycle time. An unofficial fan project, not affiliated with Coffee Stain Studios.</sub>
</p>

<p align="center">
  ⚡ <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><b>Press play: it runs live in your browser, nothing to install</b></a><br>
  <sub>⚡ <a href="#run-it-locally">Run it locally</a> &nbsp;&middot;&nbsp; <a href="#whats-inside">What's inside</a> &nbsp;&middot;&nbsp; <a href="#how-its-built">How it's built</a> &nbsp;&middot;&nbsp; <a href="#data--credits">Data &amp; credits</a> &nbsp;&middot;&nbsp; <a href="#license">License</a></sub>
</p>

| Movement | What you get |
| :--- | :--- |
| ⚡&nbsp;I.&nbsp;**Objectives** | *Maestoso.* Pick a Space Elevator phase and get its shopping list: which parts, and how many of each. Click a part and you are at its recipe. |
| ⚡&nbsp;II.&nbsp;**Items** | *Presto.* Search every item, one keystroke at a time. Each recipe card shows the ingredients at per-minute rates, the machine with its cycle time and power draw, and what comes out. |
| ⚡&nbsp;III.&nbsp;**Buildings** | *Largo.* Every building and what it makes, grouped by tier, plus Mk-by-Mk upgrade paths for miners, conveyors, pipelines and storage. |

⚡ Everything links: click an ingredient or a product and you are at its recipe, click the machine and you are at its building. Keep it on the second monitor, a phone, or the far side of an alt-tab, and retire the spreadsheet with the tab called "FINAL final v3".

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py
```

⚡ Python 3.10+, run from the repo root, and Streamlit serves it at `http://localhost:8501` (the long version is under [Run it locally](#run-it-locally)). Or skip all of that and open the [live build](https://lukexyz.github.io/ULTRA-SATISFACTORY/).

<details>
<summary>⚡ <b>Programme notes</b>: how to read the roll, and why the Smelter only gets four notes</summary>

```text
 THE RECIPE BOOK, ARRANGED FOR 88 KEYS
 211 notes · one 300 s phrase, then the title card · 12.5x speed, on a loop

 HOW TO READ IT
   a bar ............ one machine recipe. All 211 are up there, once each
   its length ....... the cycle time, to scale (the ruler on the left is
                      in minutes). A 60 s recipe is a long bar, a 2 s ingot
                      is a blip, a 1 s Packager job is a tick
   its colour ....... the machine that makes it
   hollow ........... one of the 88 alternate recipes (the ones under 4 s
                      are too small to hollow out, so they are dimmed)
   a diamond ........ a part the Space Elevator asks for. Phases 1 to 4
                      only: Phase 5's parts have no machine recipe in the
                      data, so they have no note
   left to right .... slowest machine to fastest, by average cycle time
   which key ........ arrangement. The seconds are real, the tune is ours

 THE BAND               RECIPES  ALT  SECONDS  AVERAGE  PLAYS
   Particle Accelerator       3    1      300  100.0 s  one line, no rests
   Manufacturer              38   19     2278   59.9 s  the organ pipes
   Assembler                 58   31     1298   22.4 s  the actual tune
   Blender                   13    6      191   14.7 s  one slow arch
   Foundry                    7    5       57    8.1 s  mostly waiting
   Refinery                  29   17      204    7.0 s  zigzags
   Constructor               39    8      253    6.5 s  never shuts up
   Packager                  20    0       54    2.7 s  packs going up,
                                                        unpacks coming down
   Smelter                    4    1       10    2.5 s  see below
                            ---  ---     ----
                            211   88     4645           77 min 25 s, if you
                                                        queued them end to end

 LONGEST NOTE ...... Uranium Fuel Unit (an alternate, Manufacturer): 300 s.
                     It is held for the entire phrase. Bring a book
 SHORTEST .......... eight recipes take 1 s: six Packager jobs, Aluminum
                     Scrap in the Refinery and the Empty Fluid Tank in the
                     Constructor
 MOST POPULAR ...... 6 s. Thirty recipes agree on it, Screw among them.
                     You already own four containers of that note
 TIDIEST ........... the Particle Accelerator. Its three recipes add up to
                     exactly 300 s (120 + 60 + 120), so it plays the whole
                     phrase alone without a single rest. Nobody asked it to
 THE SMELTER ....... four recipes, ten seconds in total. It comes in on the
                     first beat with an Iron Ingot, then sits there like
                     the triangle player, counting bars
 88 ................ a piano has 88 keys. The app has 88 alternate recipes.
                     This was not planned by anybody
 NOTE COUNT ........ 211. The black MIDI crowd would call that a rest
```

⚡ Small print: the app looks recipes up. It does not play them, time them or judge your manifolds. The roll is just what 211 cycle times look like when you stop reading them as a table.

</details>

<details>
<summary>⚡ <b>Back of the programme</b>: who made what, the licence, and who gets applause</summary>

```text
 ENGRAVED BY ....... one Node script with no dependencies. It places every
                     bar from a copy of the app's own data, and refuses to
                     run if a recipe is missing or played twice
 THE APP ........... Python: a single Streamlit app (app/app.py), with
                     streamlit-aggrid for the searchable grids
 GAME DATA ......... greeny/SatisfactoryTools, loaded from data/data.json
 PICTURES .......... the Satisfactory Wiki, CC BY-NC-SA 4.0
 LIVE BUILD ........ stlite: Streamlit in your browser via WebAssembly,
                     published by GitHub Actions on every push to main
 SECOND VENUE ...... Modal, where the same app runs as a full Streamlit
                     server (modal_app.py)
 LICENCE ........... the code is Apache 2.0, see LICENSE. Copy it, fork it,
                     transpose it into a key you like better
 THE GAME .......... Satisfactory belongs to Coffee Stain Studios. This is
                     an unofficial fan project: no affiliation, no game
                     inside, it only looks things up

 PERFORMED BY ...... The Tacet Smelter Orchestra: nine machines, one of
                     them resting with great discipline
 PUBLISHED BY ...... Urtext Spaghetti Edition. The original tangle, with
                     no editorial tidying
 TEMPO ............. Allegro ma non tidy
 PAGE TURNER ....... a pioneer who was told this would take five minutes

 APPLAUSE FOR ...... the left hand, for holding Nuclear Pasta down for two
                     whole minutes without complaining · manifold people ·
                     load balancer people (written for manifold, but you
                     may rearrange at your own expense) · everyone who
                     labels their storage · the fuse that waits politely
                     for the last bar
 NO ENCORE FOR ..... the "temporary" rig that is now load-bearing · the
                     belt you laid backwards and found out about later ·
                     the pipe through the wall. We all saw it
```

⚡ The Tacet Smelter Orchestra and Urtext Spaghetti Edition do not exist. The data and image credits do, and so does the licence: the code is [Apache 2.0](LICENSE).

</details>
