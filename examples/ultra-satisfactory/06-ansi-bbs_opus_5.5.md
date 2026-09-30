<p align="center">
  <img src="assets/06-ansi-bbs_opus_5.5.svg" width="832" alt="ULTRA-SATISFACTORY, drawn as a 1990s ANSI BBS login screen. A modem dials in and the screen draws itself row by row: a big cyan ULTRA over a white SATISFACTORY, a hexagon emblem with a turning cog, and the ident of THE CLOGGED MERGER BBS (sysop Belt Daddy, caller Pioneer #0140, last on at 3 A.M.). Below are three panels in the app's tab colours. ITEMS shows a recipe card as a production line: 3 Reinforced Iron Plate and 12 Iron Rod ride conveyors into an Assembler (60 s, 15 MW) and 2 Modular Frame ride out. OBJECTIVES lists the five Space Elevator phases like a rave line-up. BUILDINGS is the shift roster of nine production machines. Then a file transfer counting up to 140 items, 211 recipes and 477 buildings, a blinking PRESS ANY KEY, a scroller, and a status bar with the run command and the live URL.">
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b> · now calling THE CLOGGED MERGER BBS, the factory-floor bulletin board<br>
  <sub>⚡ SysOp: Belt Daddy · node 1 of 1 · the shift never ends · an unofficial fan project, not affiliated with Coffee Stain Studios</sub>
</p>

⚡ **ULTRA-SATISFACTORY** is a companion app for the factory-building game *Satisfactory*: every recipe, building and Space Elevator objective, one click apart. Park it on a second monitor, a phone, or the far side of an alt-tab, and look things up before the belt backs up.

⚡ Three tabs, all wired into each other: **Objectives** (what the Space Elevator wants next, and how many), **Items** (search as you type; recipe cards with per-minute rates, the machine, its cycle time and power draw) and **Buildings** (build costs, what each one makes, Mk-by-Mk upgrade paths). Click any part and you're on its recipe. It is 3 a.m. You only came to check one thing.

⚡ Two commands and you're dialled in (Python 3.10+, run from the repo root). Or install nothing at all: it runs [live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/).

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py     # then open http://localhost:8501
```

<pre>
══════════════════════════════════════════════════════════════════════════════
 THE CLOGGED MERGER BBS  -=[ MAIN MENU ]=-  node 1 of 1 · 14400 baud · 03:07
──────────────────────────────────────────────────────────────────────────────
  <a href="#whats-inside">[O] Objectives</a> ... 5 phases          <a href="#how-its-built">[H] How it's built</a> . one Streamlit app
  <a href="#whats-inside">[I] Items</a> ........ 211 recipes       <a href="#data--credits">[D] Data &amp; credits</a> . who to thank
  <a href="#whats-inside">[B] Buildings</a> .... 477 to build      <a href="app/app.py">[S] Source</a> ......... app/app.py
  <a href="#run-it-locally">[R] Run it</a> ....... two commands      <a href="#license">[A] Apache 2.0</a> ..... protection: none
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/">[L] Live</a> ......... in your browser   <a href="#top">[G] Goodbye</a> ........ ATH0, NO CARRIER
══════════════════════════════════════════════════════════════════════════════
 Select [O I B R L H D S A G] or press any key (still a README) &gt; _
</pre>

<details>
<summary>⚡ <b>MERGER.NFO</b> · release info, the line-up in full, house rules, greetz</summary>

```text
             _   _ _   _____ ___    _
            | | | | | |_   _| _ \  /_\
            | |_| | |__ | | |   / / _ \
             \___/|____||_| |_|_\/_/ \_\   S A T I S F A C T O R Y

      -=[ THE CLOGGED MERGER BBS · the factory-floor bulletin board ]=-

 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
  RELEASE INFO
   Title ............ ULTRA-SATISFACTORY
   Type ............. companion app for the game Satisfactory. a lookup tool
   The game ......... not included, not ours. go and buy it, it's very good
   Released by ...... THE CLOGGED MERGER BBS (sysop: Belt Daddy)
   Supplied by ...... greeny/SatisfactoryTools (the data)
                      the Satisfactory Wiki (the images)
   Cracked by ....... nobody. this app was never locked
   Protection ....... none. it's Apache 2.0
   Format ........... one Streamlit app, app/app.py. Python 3.10+
   Contents ......... 140 items, 211 recipes (88 alternates), 477 buildings,
                      5 Space Elevator phases
   Runs on .......... a second monitor, a phone, the far side of alt-tab
   Rating ........... [##########] would alt-tab again

  THE RECIPE CARD ON THE SCREEN ABOVE
    3 Reinforced Iron Plate  3/min ═╗
                                    ╠═[ ASSEMBLER ]═► 2 Modular Frame  2/min
   12 Iron Rod              12/min ═╝   60 s · 15 MW
   the belts up there are to scale: rods are packed 4x tighter than plates

  INSTALL
   1. python -m pip install -r requirements.txt
   2. python -m streamlit run app/app.py
   3. open http://localhost:8501
   4. or install nothing: https://lukexyz.github.io/ULTRA-SATISFACTORY/

  THE LINE-UP (Space Elevator, all five phases, doors whenever you're ready)
   1 AUTOMATION BASICS
     Smart Plating x50 · Versatile Framework x100 · Automated Wiring x500
   2 LOGISTICS & STEEL
     Automated Wiring x500 · Modular Frame x500 · Smart Plating x100
     Versatile Framework x500
   3 OIL & COMPUTERS
     Versatile Framework x2500 · Modular Engine x500
     Adaptive Control Unit x100
   4 NUCLEAR & ENDGAME
     Assembly Director System x1000 · Magnetic Field Generator x500
     Nuclear Pasta x100 · Thermal Propulsion Rocket x25
   5 ALIEN TECH & QUANTUM
     Biochemical Sculptor x500 · AI Expansion Server x100
     Neural-Quantum Processor x100 · Ballistic Warp Drive x100

  THE SHIFT ROSTER (9 production machines, 0 tea breaks)
   Assembler · Blender · Constructor · Foundry · Manufacturer · Packager
   Particle Accelerator · Refinery · Smelter
   + 468 more things to build: 333 structure pieces, 59 logistics, 26 decor,
     15 power, 14 transit, 7 special, 7 storage, 7 extraction

  HOUSE RULES
   1. spaghetti is a layout, not a failure
   2. "just one more belt" is not a unit of time
   3. nobody rebuilds the starter base. we all said we would
   4. an alternate recipe is not a personality (there are 88. collect them)
   5. if it runs at 99.8% efficiency, no it doesn't, go and look

  GREETZ
   the Manifold Militia · the Load Balancer Purists · Clipping Anonymous
   the Temporary Belt Preservation Society (est. three saves ago)
   everyone whose power grid is one more Smelter away from a blackout
   whoever is on the other side of that alt-tab, still holding W

  NO LOVE TO
   the one splitter facing the wrong way. you know where it is. we don't

  SMALL PRINT
   unofficial fan project, not affiliated with Coffee Stain Studios.
   game data: greeny/SatisfactoryTools. images: Satisfactory Wiki,
   CC BY-NC-SA 4.0. the code is Apache 2.0.

 ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
        the shift never ends · 14400 baud · ATH0 · NO CARRIER
```

</details>
