<p align="center">
  <img src="assets/11-win32-cracktro_opus_5.5.svg" width="100%" alt="A README banner in the style of a mid-2000s Windows cracktro. TORQUE DIRTY presents ULTRA-SATISFACTORY as a bevelled chrome logo: ULTRA in cyan chrome above SATISFACTORY in silver, standing on a mirror floor with its reflection, stars flying outward behind it, a sheen sweeping across the letters. On each side a square steel girder (one face hazard tape, one riveted plate, one a cyan light bar, one a lattice truss) is twisted like a wrung towel between two chucks. A text writer types three pages: a companion app for the factory game Satisfactory, every recipe, building and Space Elevator objective, one click apart, tabs Objectives, Items and Buildings; then the two commands to run it and the no-install address lukexyz.github.io/ULTRA-SATISFACTORY; then 140 items, 211 recipes (88 alternate), 477 buildings, 5 Space Elevator phases, protection none (Apache 2.0), unofficial fan project. Along the bottom a gold dot-matrix scroller rides a sine wave.">
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b>: every recipe, building and Space Elevator objective, one click apart.<br>
  <sub>⚡ wrung out by TORQUE DIRTY &middot; protection: none, it's Apache 2.0 &middot; an unofficial fan project, not affiliated with Coffee Stain Studios</sub>
</p>

⚡ A companion app for the factory-building game *Satisfactory*. It lives next to the game (the other monitor, a phone, the far side of an alt-tab) and answers the 3&nbsp;a.m. question: what goes into that, how many a minute, and which machine do I blame? Your spreadsheet may now retire.

- ⚡ **OBJECTIVES**: pick a Space Elevator phase, see what it wants and how many. Click a part, get its recipe.
- ⚡ **ITEMS**: search as you type. Recipe cards: ingredients per minute, the machine, its cycle time, its power draw.
- ⚡ **BUILDINGS**: every building and what it makes, by tier, plus Mk-by-Mk upgrade paths.

⚡ All of it bolted together: click an ingredient, land on its recipe; click the machine, land on its building.

⚡ Two commands, no installer wizard (Python 3.10+, from the repo root, then open `http://localhost:8501`):

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py
```

⚡ Or install nothing at all: it runs **[live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/)**, a stlite build (Streamlit on WebAssembly) that GitHub Actions republishes on every push to `main`. DirectX not required.

<p align="center">
  ⚡ <a href="#whats-inside">what's inside</a> &middot; <a href="#run-it-locally">run it locally</a> &middot; <a href="#how-its-built">how it's built</a> &middot; <a href="#data--credits">data &amp; credits</a> &middot; <a href="#license">license</a> &middot; <kbd>ESC</kbd> back to the factory
</p>

<details>
<summary>⚡ <b>TORQUE.NFO</b>: the intro again in 80 columns, a sample lookup, install notes, how the twister twists, greetz</summary>

```text
[=====o=====]                                                      [=====o=====]
  |=======|                T O R Q U E     D I R T Y                |##|\\\\\\|
 |#|=======|                    proudly presents                   |####|\\\\\\|
|####|======|                                                      |#####|\\\\\|
|######|====|     ╔═════════════════════════════════════════╗      |######|\\\\|
|#######|===|     ║   U L T R A - S A T I S F A C T O R Y   ║      |#######|\\\|
 |#######|=|      ╚═════════════════════════════════════════╝       |#######|\|
  |#######|   every recipe, building and Space Elevator objective,  |########||
 |/|#######|                    one click apart                     ||########|
|///|#######|                                                       |=|#######|
|////|######|   WHAT ......... companion app for Satisfactory      |====|######|
|/////|#####|   INSIDE ....... 140 items, 211 recipes (88 alt),    |======|####|
|//////|####|                  477 buildings, 5 elevator phases     |======|##|
|///////|###|   PROTECTION ... none. It is Apache 2.0.               |=======|
 |///////|#|    REQUIRES ..... Python 3.10+, or a browser tab       |X|=======|
  |///////|     DIRECTX ...... not required                        |XXXXX|=====|
 ||////////|    INTRO ........ 1 SVG, 0 lines of JavaScript        |XXXXXXX|===|
 |X|///////|    GIRDERS ...... 2, twisted. They signed a waiver.    ||XXXXXXXX|
|XXX|///////|   THE GAME ..... sold separately. Fan project.       |\\\\|XXXXXX|
|XXXX|//////|                                                      |\\\\\\\|XXX|
|XXXXX|/////|   press any key. nothing happens. it is a README.      |\\\\\\\|
[=====o=====]                                                      [=====o=====]

── ONE CLICK APART, DEMONSTRATED ───────────────────────────────────────────────
  Modular Frame ........... 2/min   Assembler    60 s cycle   15 MW
      in: 3 Reinforced Iron Plate + 12 Iron Rod   out: 2   (click the plate)
  Reinforced Iron Plate ... 5/min   Assembler    12 s cycle   15 MW
      in: 6 Iron Plate + 12 Screw   out: 1                  (click the plate)
  Iron Plate ............. 20/min   Constructor   6 s cycle    4 MW
      in: 3 Iron Ingot   out: 2                             (click the ingot)
  Iron Ingot ............. 30/min   Smelter       2 s cycle    4 MW
      in: 1 Iron Ore   out: 1                   (the ore you dig up yourself)
  Three clicks from frame to ingot. Standard recipes, one machine each.

── INSTALL NOTES ───────────────────────────────────────────────────────────────
  1. python -m pip install -r requirements.txt
  2. python -m streamlit run app/app.py
  3. open http://localhost:8501 on whichever screen the game is not on
  4. there is no step 4. No installer wizard, no browser toolbar, no reboot.
     It is a free lookup tool under Apache 2.0.
  Or skip all four: https://lukexyz.github.io/ULTRA-SATISFACTORY/

── THE SPACE ELEVATOR, FIVE PHASES (as the app names them) ─────────────────────
  1 Automation basics     2 Logistics & steel     3 Oil & computers
  4 Nuclear & endgame     5 Alien tech & quantum
  Phase 3 alone wants 2500 Versatile Framework. One Assembler makes 5 a
  minute, so that is 500 minutes of one Assembler. Put the kettle on.

── HOW THE TWISTER TWISTS ──────────────────────────────────────────────────────
  No GIF, no video, no JavaScript: one SVG file and some CSS keyframes.
  Each girder is 60 slices. Every slice plays the same 12 second
  animation, 72 ms out of step with the slice next to it. That lag is the
  twist. Faces: hazard tape, riveted plate, light bar, lattice truss.
  Music: none. Hum a chiptune. We trust you.
  Torque applied: excessive. Torque authorised: also excessive.

── GREETZ ──────────────────────────────────────────────────────────────────────
  The Overtightened Bolt Collective · Lefty Loosey Ltd
  · The Quarter-Turn Club · Rivet Counters International
  · The Stripped Thread Support Group
  · whoever is holding the other end of this girder
  · everyone who alt-tabbed here for one recipe and is still reading greetz

── NO GREETZ ───────────────────────────────────────────────────────────────────
  The Screw. 40 a minute per Constructor and the factory still wants more.
  We twist things for a living and even we are tired of screwing.

── SMALL PRINT ─────────────────────────────────────────────────────────────────
  An unofficial fan project, not affiliated with Coffee Stain Studios.
  The game is theirs and is sold separately. The game data comes from
  greeny/SatisfactoryTools. The item and building images come from the
  Satisfactory Wiki (CC BY-NC-SA 4.0). The code is Apache 2.0.
  TORQUE DIRTY is made up. The girders are fine. They asked to go again.

        ═════  torque responsibly. or don't. the girders like it.  ═════
```

</details>
