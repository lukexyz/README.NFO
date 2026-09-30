<p align="center">
  <img src="assets/13-chrome-spheres_opus_5.5.svg" width="100%" alt="A README banner in the demoscene's oldest style: chrome spheres over a checkerboard. REFLECTIVE ASSETS DIVISION presents ULTRA-SATISFACTORY as a thick italic chrome logo floating in the sky, steel blue with a bright break line across the letters and its sides running back to the vanishing point. Under it, on a small plate: every recipe, building and Space Elevator objective, one click apart. Below, a grey and white checker floor of foundations flies towards the viewer and fades into haze at a low horizon, and six mirror balls tinted from cyan through purple to pink bounce over it in a wave, each reflecting the moving floor and the sky. The sky runs a one-minute day: a dusty mauve afternoon, the sun setting on the right, a starry indigo night with the moon up and coloured light pooling under the spheres, then dawn. A small gold scroller at the horizon lists the tabs Objectives, Items and Buildings, the counts (140 items, 211 recipes of which 88 are alternates, 477 buildings, 5 Space Elevator phases), the two commands to run it, the no-install address lukexyz.github.io/ULTRA-SATISFACTORY, and that it is an unofficial fan project.">
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b>: every recipe, building and Space Elevator objective, one click apart.<br>
  <sub>⚡ polished by the REFLECTIVE ASSETS DIVISION &middot; six spheres, zero output, perfect uptime &middot; an unofficial fan project, not affiliated with Coffee Stain Studios</sub>
</p>

⚡ A companion app for the factory-building game *Satisfactory*. It lives beside the game (second monitor, phone, or the far side of an alt-tab) and answers the questions you were about to open a spreadsheet for: what goes into that, how many a minute, and in which machine. It cannot tell you which Assembler has been quietly starved of one input since Tuesday. It can tell you exactly what that Assembler wanted.

- ⚡ **OBJECTIVES**: pick a Space Elevator phase, see the parts it wants and how many. Click a part, get its recipe.
- ⚡ **ITEMS**: search as you type. Recipe cards show ingredients per minute, the machine, its cycle time and its power draw.
- ⚡ **BUILDINGS**: every building and what it makes, grouped by tier, plus Mk-by-Mk upgrade paths.

⚡ Everything reflects everything else: click an ingredient to land on its recipe, click the machine to land on its building.

⚡ Two commands, no 3D accelerator card (Python 3.10+, from the repo root, then open `http://localhost:8501`):

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py
```

⚡ Or install nothing: it runs **[live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/)**, a stlite build (Streamlit on WebAssembly) that GitHub Actions republishes on every push to `main`.

<p align="center">
  ⚡ <a href="#whats-inside">what's inside</a> &middot; <a href="#run-it-locally">run it locally</a> &middot; <a href="#how-its-built">how it's built</a> &middot; <a href="#data--credits">data &amp; credits</a> &middot; <a href="#license">license</a>
</p>

<details>
<summary>⚡ <b>R.A.D. QUARTERLY REFLECTION</b>: the banner again in 80 columns, the asset register, a sample lookup, how the floor moves, greetz</summary>

```text
                   REFLECTIVE ASSETS DIVISION   presents
            ______________________________________________________
           /                                                      /
          /        U L T R A  -  S A T I S F A C T O R Y         /
         /______________________________________________________/
      every recipe, building and Space Elevator objective, one click apart

                                                                 .-"""-.
       .-"""-.                                                  /  o    \
      /  o    \                                                |=========|
     |=========|                                                \ # # # /
 . .  \ # # # /  . . . . . . . . .  .-"""-.  . . . . . . . . . . `-...-' . . . .
##  ## `-...-' #  ##   ##  ###  ## /  o    \  ##  ###  ##   ##  ###  ##  ###  ##
###    ####    ####    ####   ### |=========| ####   ####    ####    ####    ###
#####     ######     ######     ## \ # # # / ###     ######      (:::::)   #####
  #### (:::::)  #######       ##### `-...-' ######       #######       #######
  ########         ########         ########         ########         ########
     ##########          ##########          ##########          ##########
###########            ###########  (:::::)   ###########            ###########
#######             #############              #############             #######

── ASSET REGISTER (SPHERES, REFLECTIVE, QTY 6) ─────────────────────────────────
  No  Tint     Output  Appraisal
  01  cyan     0/min   Reflects on the floor. The floor has not replied.
  02  blue     0/min   Middle management: bounces every idea straight back.
  03  indigo   0/min   Holds no screws. Would like that on the record.
  04  purple   0/min   Third performance review. Still well rounded.
  05  magenta  0/min   Largest. Says it is only nearer the camera. Correct.
  06  pink     0/min   Has cut no corners. Has none to cut.
  Combined output: nothing. Combined power draw: nothing. Not one of them
  is starved of an input. It is the most efficient line we have ever run.

── THE FLOOR ───────────────────────────────────────────────────────────────────
  Foundations, laid to the horizon. The plan said "a small starter base".
  The plan is under the foundations now. Anything out of square was placed
  past the haze, where nobody can count tiles.

── ONE CLICK APART, DEMONSTRATED ───────────────────────────────────────────────
  Phase 1 "Automation basics" wants Smart Plating x50. So you click:
  Smart Plating .... 2/min   Assembler     30 s cycle   15 MW
      in: 1 Reinforced Iron Plate + 1 Rotor   out: 1       (click the Rotor)
  Rotor ............ 4/min   Assembler     15 s cycle   15 MW
      in: 5 Iron Rod + 25 Screw   out: 1                   (click the Screw)
  Screw ........... 40/min   Constructor    6 s cycle    4 MW
      in: 1 Iron Rod   out: 4                           (click the Iron Rod)
  Iron Rod ........ 15/min   Constructor    4 s cycle    4 MW
      in: 1 Iron Ingot   out: 1              (you know where the ingots are)
  50 Smart Plating at 2 a minute is 25 minutes of one Assembler. A day on
  this banner lasts 60 seconds, so that is 25 sunsets. Pack a lunch.
  Standard recipes. The 88 alternates are in the data, reflecting quietly.

── HOW THE FLOOR MOVES ─────────────────────────────────────────────────────────
  No GIF, no video, no JavaScript. One SVG file and CSS keyframes.
  A checkerboard is rows XOR columns. Fly straight ahead and the column
  edges never move on screen: they are wedges fanning out of the vanishing
  point. So the columns are two fixed clip paths (even wedges, odd wedges)
  and the rows are 32 plain rectangles on ONE shared keyframe track, from
  the horizon to your feet, each running a little later than the last.
  Rows under the odd wedges run one tile out of step. That is the floor.
  Drifting sideways is a skew about the horizon line, and nothing more.
  The mirror balls are the same trick bent round: wedges out of the
  centre, rings collapsing onto the equator. The sun and the moon share
  one wheel. Music: none. Hum something in 4/4.

── KNOWN ISSUES ────────────────────────────────────────────────────────────────
  * The scroller is slow. Nobody overclocked it. Closed: works as designed.
  * The spheres make nothing. Efficiency was told. Efficiency is a sphere.
  * The sun sets on the right and rises on the left. Nobody checked which
    way this planet turns. Closed: could not reproduce at night.
  * The sun also sets behind the scroller. The scroller has right of way.
  * Chrome spheres over a checkerboard is the oldest joke in the demoscene.
    We played it straight. Closed: not a bug.

── GREETZ ──────────────────────────────────────────────────────────────────────
  Vanishing Point Accounts Payable · Wedge & Row Flooring
  · Fog It And Forget It Surveying · The Every-Other-Tile Club
  · The Right Angle Supremacy League · The Noodle Bus Preservation Trust
  · Amalgamated Bevellers, Local 45 Degrees
  · the storage box of screws nobody ordered
  · everyone who alt-tabbed here for one recipe and stayed for the sunset

── SMALL PRINT ─────────────────────────────────────────────────────────────────
  An unofficial fan project, not affiliated with Coffee Stain Studios. The
  game is theirs. Game data: greeny/SatisfactoryTools. Item and building
  images: the Satisfactory Wiki (CC BY-NC-SA 4.0). Code: Apache 2.0.
  REFLECTIVE ASSETS DIVISION is made up. The spheres are vectors. No
  foundations were harmed.

              ═════  stay shiny. reflect responsibly.  ═════
```

</details>
