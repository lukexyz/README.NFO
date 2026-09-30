<!-- Header 21-shaded-block-nfo_opus_5.5 for ULTRA-SATISFACTORY. The banner is drawn by src/21-shaded-block-nfo_opus_5.5.mjs: edit that and re-run it. -->

<p align="center">
  <img src="assets/21-shaded-block-nfo_opus_5.5.svg" width="800" alt="ULTRA-SATISFACTORY, drawn as a 1990s shaded block NFO: a text screen built from block and dither characters. The crew MERGED CELLS presents ULTRA in cyan slab capitals with a dithered shadow down the right of every stroke, each stem dissolving below the baseline through dark, medium and light shade into single dots. Under a thin frame rule, SATISFACTORY is set in grey two-tone capitals, with debris scattered round both words, broken bands of light shade behind them and frame walls of fading shade blocks down both margins. A highlight sweeps across the logo one character cell at a time. Caption: every recipe, building and objective, one click apart. Two headings in a three-row half-block font grow out of the frame. WHAT IT IS: release ULTRA-SATISFACTORY, type Satisfactory companion app, status unofficial fan project, protection none (it's Apache 2.0), 140 craftable items, 211 recipes of which 88 are alternates, 477 player-buildable buildings, 5 Space Elevator phases. Three tabs: Objectives, Items, Buildings. RUN IT: python -m pip install -r requirements.txt, then python -m streamlit run app/app.py, or open lukexyz.github.io/ULTRA-SATISFACTORY in a browser. Footer: greetz to every spreadsheet that outgrew its factory. Signed dr!MRG.">
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b> · a MERGED CELLS release · protection: none, it's <a href="LICENSE">Apache 2.0</a><br>
  <sub>⚡ unofficial fan project, not affiliated with Coffee Stain Studios · the game is not included, go and buy it, it's very good</sub>
</p>

⚡ **ULTRA-SATISFACTORY** is a companion app for the factory-building game *Satisfactory*: every recipe, building and Space Elevator objective, one click apart. Park it on the second monitor, the phone, or the far side of an alt-tab, and it answers "what goes into that again?" before the machine you were feeding runs dry.

⚡ Three tabs, cross-wired like a manifold somebody actually finished: **Objectives** (pick a Space Elevator phase, see the parts it wants and how many), **Items** (search as you type; recipe cards with per-minute rates, the machine, its cycle time and its power draw) and **Buildings** (every building by tier, what it makes, Mk-by-Mk upgrade paths). Every ingredient, product and machine is a link, so the answer is never more than a click from the question.

⚡ Two commands and it runs (Python 3.10+, from the repo root, [details here](#run-it-locally)). Or install nothing at all and [open it live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/): no spreadsheet required, which some of us are taking personally.

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py     # then open http://localhost:8501
```

<details>
<summary>⚡ <b>MRG-ULTRA.NFO</b> · the rest of the file: release notes, the rate card, the elevator's demands, group news, greetz</summary>

```text
 ·:· ────────────────────────────────────────────────────────────────── ·:·
      M E R G E D   C E L L S                                 ( M R G )
      "somebody merged A1:F1. nothing has sorted since"
 ·:· ────────────────────────────────────────────────────────────────── ·:·

                          p r e s e n t s

                        ULTRA-SATISFACTORY
          every recipe, building & objective. one click apart.

 ───■ RELEASE NOTES ■──────────────────────────────────────────────────────

   release ......: ULTRA-SATISFACTORY, a lookup tool for a second monitor
   game data ....: greeny/SatisfactoryTools, with thanks (data/data.json)
   pictures .....: the Satisfactory Wiki, CC BY-NC-SA 4.0
   packager .....: one Streamlit app, app/app.py, grids by streamlit-aggrid
   couriers .....: GitHub Actions, to GitHub Pages, on every push to main
   also seen on .: Modal, as a full Streamlit server (modal_app.py)
   protection ...: none. it's Apache 2.0. there was nothing to remove
   the game .....: not included and not ours. buy it, it's very good
   affiliation ..: none. unofficial fan project, not Coffee Stain Studios
   contents .....: 140 craftable items, 211 machine recipes (88 of them
                   alternates), 477 player-buildable buildings, 5 phases

 ───■ THE RATE CARD ■──────────────────────────────────────────────────────

   what an Items card tells you, one standard recipe per production
   machine. all nine machines reported for duty.

   item .................... per min .... cycle .... machine ........ power
   Iron Ingot ................... 30 ...... 2 s .... Smelter ......... 4 MW
   Screw ........................ 40 ...... 6 s .... Constructor ..... 4 MW
   Steel Ingot .................. 45 ...... 4 s .... Foundry ........ 16 MW
   Modular Frame ................. 2 ..... 60 s .... Assembler ...... 15 MW
   Heavy Modular Frame ........... 2 ..... 30 s .... Manufacturer ... 55 MW
   Plastic ...................... 20 ...... 6 s .... Refinery ....... 30 MW
   Packaged Water ............... 60 ...... 2 s .... Packager ....... 10 MW
   Cooling System ................ 6 ..... 10 s .... Blender ........ 75 MW
   Nuclear Pasta ............... 0.5 .... 120 s .... Particle Accelerator

   forty Screws a minute, per Constructor. one Manufacturer on Heavy
   Modular Frames eats 200 a minute, which is five Constructors doing
   nothing else. this is how a storage box ends up holding only Screws.
   nobody decides it. it just happens.

 ───■ THE ELEVATOR'S DEMANDS ■─────────────────────────────────────────────

   the Objectives tab, in full. pick a phase, click a part, get its recipe.

   1 Automation basics ......: Smart Plating x50
                               Versatile Framework x100
                               Automated Wiring x500
   2 Logistics & steel ......: Automated Wiring x500
                               Modular Frame x500
                               Smart Plating x100
                               Versatile Framework x500
   3 Oil & computers ........: Versatile Framework x2500
                               Modular Engine x500
                               Adaptive Control Unit x100
   4 Nuclear & endgame ......: Assembly Director System x1000
                               Magnetic Field Generator x500
                               Nuclear Pasta x100
                               Thermal Propulsion Rocket x25
   5 Alien tech & quantum ...: Biochemical Sculptor x500
                               AI Expansion Server x100
                               Neural-Quantum Processor x100
                               Ballistic Warp Drive x100

   it never says please. it never says thank you. it says x2500.

 ───■ iNSTALL NOTES ■──────────────────────────────────────────────────────

   01 ...: python -m pip install -r requirements.txt
   02 ...: python -m streamlit run app/app.py
   03 ...: open http://localhost:8501 and put it on the other monitor
   or ...: https://lukexyz.github.io/ULTRA-SATISFACTORY/  (unpack nothing)

 ───■ GROUP NEWS ■─────────────────────────────────────────────────────────

   MERGED CELLS was founded the night somebody merged A1 through F1 of
   the factory planner. the sheet has not sorted since. neither have we.

   the planner has 14 tabs. this app has three. one of those numbers is
   a boast and the group can no longer agree which.

   on manifolds versus load balancers the group takes no side. it takes
   minutes, and the minutes are 40 pages long.

   the pipe that goes through the wall is a design decision. we have
   looked directly at it and we have seen nothing.

   overclocking is not a personality. underclocking is, regrettably.

   wanted: one courier able to find the splitter that faces the wrong way.
   no experience needed. nobody has any.

 ───■ GREETZ ■─────────────────────────────────────────────────────────────

   Programmable Splitter Lodge No. 9 ·· the Fluid Buffer Optimists
   One Input Short Productions ·· Fuse Box Roulette ·· Third Output Unused
   the Society for Straight Belts, and the people they keep writing to
   everyone whose planner has a column nobody remembers adding

   no greetz to the one Assembler waiting on a single Iron Rod.

 ·:· ────────────────────────────────────────────────────────────────── ·:·
   logo and frame by dross (dr!MRG), one cell at a time on a 96 x 44 screen
   this file looks best in a font where a block is a block
 ·:· ────────────────────────────────────────────────────────────────── ·:·
```

</details>
