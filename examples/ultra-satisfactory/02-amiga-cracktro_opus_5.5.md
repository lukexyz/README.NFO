<p align="center">
  <img src="assets/02-amiga-cracktro_opus_5.5.svg" width="100%" alt="Amiga demoscene-style intro banner. 'Manifold Destiny presents' above ULTRA-SATISFACTORY in chunky chrome letters: ULTRA in ice cyan between two turning hex-cog emblems, SATISFACTORY in silver and gold, over sweeping copper raster bars and a parallax starfield. The subtitle reads Objectives, Items, Buildings, every recipe one click apart. Below it, in front of a distant factory skyline with blinking chimney beacons, a pixel production line runs on a conveyor belt: ingots leave a glowing Smelter, a Constructor's press thumps on the beat, an Assembler bolts parts into frames and a Space Elevator sends a pod up a tether that rises out of the frame. A sine-wave scroller opens with 'Every recipe, one click apart!' and the footer reads: live in your browser, lukexyz.github.io/ULTRA-SATISFACTORY">
</p>

<h3 align="center">⚡ ULTRA-SATISFACTORY: every recipe, building and Space Elevator objective, one click apart.</h3>

<p align="center">
  ⚡ A companion app for the factory-building game <i>Satisfactory</i>. Park it on the second monitor, the phone or one alt-tab away,
  and stop doing belt maths in your head at 3&nbsp;a.m.<br>
  ⚡ Three tabs, everything cross-linked: <b>OBJECTIVES</b> (what each Space Elevator phase wants, and how many),
  <b>ITEMS</b> (search as you type, recipe cards with per-minute rates) and <b>BUILDINGS</b> (build costs, what each one makes, Mk-by-Mk upgrades).<br>
  ⚡ Unofficial fan project, not affiliated with Coffee Stain Studios. The game is sold separately. This bit is free.
</p>

<p align="center">
  ⚡&nbsp;
  <code>ITEMS:&nbsp;140</code>&nbsp;
  <code>RECIPES:&nbsp;211&nbsp;(88&nbsp;alt)</code>&nbsp;
  <code>BUILDINGS:&nbsp;477</code>&nbsp;
  <code>PROTECTION:&nbsp;none&nbsp;(Apache&nbsp;2.0)</code>&nbsp;
  <code>BELTS:&nbsp;just&nbsp;one&nbsp;more</code>
</p>

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py
```

<p align="center">
  ⚡ Python 3.10+, run from the repo root, then open <b>http://localhost:8501</b>. The long version is in <a href="#run-it-locally">Run&nbsp;it&nbsp;locally</a>.<br>
  ⚡ Or install nothing: it runs <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><b>live&nbsp;in&nbsp;your&nbsp;browser</b></a>,
  a stlite build (Streamlit on WebAssembly) that GitHub Actions republishes on every push to <code>main</code>.
</p>

<p align="center"><sub>⚡ &#9835; NOW PLAYING: FACTORY.MOD &middot; channels are machines, notes are items per minute, straight from the app's data &#9835;</sub></p>

```text
╔════════════════════════════════════════════════════════════════════════╗
║ FACTORY.MOD   ORE → INGOT → PART → FRAME   BPM 120   PAT 03   SLEEP 00 ║
╠════╦════════════════╦════════════════╦════════════════╦════════════════╣
║ ## ║ 1 SMELTER      ║ 2 CONSTRUCTOR  ║ 3 ASSEMBLER    ║ 4 MANUFACTURER ║
╠════╬════════════════╬════════════════╬════════════════╬════════════════╣
║ 00 ║ FEI 030 002 04 ║ PLT 020 006 04 ║ RIP 005 012 15 ║ HMF 002 030 55 ║
║ 01 ║ --- --- --- -- ║ ROD 015 004 04 ║ --- --- --- -- ║ --- --- --- -- ║
║ 02 ║ CUI 030 002 04 ║ SCR 040 006 04 ║ ROT 004 015 15 ║ --- --- --- -- ║
║ 03 ║ --- --- --- -- ║ --- --- --- -- ║ --- --- --- -- ║ --- --- --- -- ║
║>04<║ FEI 030 002 04 ║ WIR 030 004 04 ║ MFR 002 060 15 ║ MEN 001 060 55 ║
║ 05 ║ --- --- --- -- ║ CBL 030 002 04 ║ --- --- --- -- ║ --- --- --- -- ║
║ 06 ║ CAI 015 004 04 ║ PLT 020 006 04 ║ SPL 002 030 15 ║ ACU 001 120 55 ║
║ 07 ║ --- --- --- -- ║ ROD 015 004 04 ║ --- --- --- -- ║ --- --- --- -- ║
╚════╩════════════════╩════════════════╩════════════════╩════════════════╝
 each note: ITEM, items per minute, cycle in seconds, machine MW
 (standard recipes, one machine each)
 FEI Iron Ingot   CUI Copper Ingot   CAI Caterium Ingot   PLT Iron Plate
 ROD Iron Rod   SCR Screw   WIR Wire   CBL Cable   ROT Rotor
 RIP Reinforced Iron Plate   MFR Modular Frame   SPL Smart Plating
 HMF Heavy Modular Frame   MEN Modular Engine   ACU Adaptive Control Unit
 --- machine idle (unacceptable)
```

<details>
<summary>⚡ <b>ULTRA-SATISFACTORY.NFO</b>: release notes, install, files, the Space Elevator shopping list and greetz</summary>

```text
                      ██  ██ ██     ▀▀██▀▀ ██▀▀█▄ ▄█▀▀█▄
                      ██  ██ ██       ██   ██▄▄█▀ ██▄▄██
                      ▀█▄▄█▀ ██▄▄▄▄   ██   ██ ▀█▄ ██  ██
▄█▀▀▀▀ ▄█▀▀█▄ ▀▀██▀▀ ██ ▄█▀▀▀▀ ██▀▀▀▀ ▄█▀▀█▄ ▄█▀▀▀▀ ▀▀██▀▀ ▄█▀▀█▄ ██▀▀█▄ ██  ██
 ▀▀▀█▄ ██▄▄██   ██   ██  ▀▀▀█▄ ██▀▀▀  ██▄▄██ ██       ██   ██  ██ ██▄▄█▀  ▀██▀
▄▄▄▄█▀ ██  ██   ██   ██ ▄▄▄▄█▀ ██     ██  ██ ▀█▄▄▄▄   ██   ▀█▄▄█▀ ██ ▀█▄   ██
        ═════  M A N I F O L D   D E S T I N Y   P R E S E N T S  ═════

╔═════════════════════════════════════════════════════════════════════════════╗
║ RELEASE ..... ULTRA-SATISFACTORY         TYPE ....... companion app         ║
║ SUPPLIED BY . greeny/SatisfactoryTools   PACKED BY .. one Streamlit file    ║
║ PROTECTION .. none (Apache 2.0)          RUNS ON .... Python or a browser   ║
║ ITEMS ....... 140 craftable              RECIPES .... 211 (88 alternates)   ║
║ BUILDINGS ... 477                        PHASES ..... 5, Space Elevator     ║
║ GAME ........ sold separately            SLEEP ...... an alternate recipe   ║
╚═════════════════════════════════════════════════════════════════════════════╝

── RELEASE NOTES ──────────────────────────────────────────────────────────────
  * Every recipe, building and Space Elevator objective, one click apart.
  * Three tabs: OBJECTIVES, ITEMS, BUILDINGS. Everything links: click an
    ingredient for its recipe, click the machine for its building.
  * Recipe cards show per-minute rates, cycle time and power draw, so the
    belt maths happens on the second monitor and not in your head.
  * Runs next to the game: second monitor, phone, or one alt-tab away.
  * Does not build the factory for you. We checked. Twice.
  * Does not judge your spaghetti either. It is load-bearing.

── INSTALL ────────────────────────────────────────────────────────────────────
  1. python -m pip install -r requirements.txt
  2. python -m streamlit run app/app.py
  3. open http://localhost:8501 and drag it to the other monitor
  4. alt-tab back in. Tell nobody how long you were gone.
  Or install nothing: https://lukexyz.github.io/ULTRA-SATISFACTORY/

── FILES ──────────────────────────────────────────────────────────────────────
  app/app.py ................... the app: a single Streamlit file
  ultra_satisfactory/data.py ... loads the game data
  data/data.json ............... the recipe book
  modal_app.py ................. the same app as a server on Modal
  LICENSE ...................... Apache 2.0. Protection: none.

── THE SPACE ELEVATOR SHOPPING LIST (AS THE APP LISTS IT) ─────────────────────
  1 Automation basics .... Smart Plating x50 * Versatile Framework x100
                           * Automated Wiring x500
  2 Logistics & steel .... Automated Wiring x500 * Modular Frame x500
                           * Smart Plating x100 * Versatile Framework x500
  3 Oil & computers ...... Versatile Framework x2500 * Modular Engine x500
                           * Adaptive Control Unit x100
  4 Nuclear & endgame .... Assembly Director System x1000
                           * Magnetic Field Generator x500
                           * Nuclear Pasta x100 * Thermal Propulsion Rocket x25
  5 Alien tech & quantum . Biochemical Sculptor x500 * AI Expansion Server x100
                           * Neural-Quantum Processor x100
                           * Ballistic Warp Drive x100
  Pick a phase in OBJECTIVES, click a part, get its recipe.

── GREETZ ─────────────────────────────────────────────────────────────────────
  The Spaghetti Logistics Union * Bus Lane Bandits * Overclockers Anonymous
  * The Load Balancer Lads * everyone whose "temporary" belt is still there
  200 hours later * whoever is still hand-feeding a constructor. We see you.

── NO GREETZ ──────────────────────────────────────────────────────────────────
  Belts that clip through other belts. You know what you did.

── SMALL PRINT ────────────────────────────────────────────────────────────────
  Unofficial fan project, not affiliated with Coffee Stain Studios.
  Game data: greeny/SatisfactoryTools. Item and building images:
  Satisfactory Wiki, CC BY-NC-SA 4.0. Code: Apache 2.0.

     ═════  efficiency is mandatory. sleep is an alternate recipe.  ═════
```

</details>

<p align="center">
  <img src="assets/02-amiga-cracktro_opus_5.5-rule.svg" width="100%" alt="A strip of conveyor belt carrying pixel ingots, plates, screws and frames off to the right">
</p>
