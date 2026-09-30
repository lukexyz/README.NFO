<!-- Header 23-illustrated-ansi_opus_5.5 for ULTRA-SATISFACTORY. The banner is drawn by src/23-illustrated-ansi_opus_5.5.mjs: edit that and re-run it. -->

<p align="center">
  <img src="assets/23-illustrated-ansi_opus_5.5.svg" width="830" alt="ULTRA-SATISFACTORY as a 1990s illustrated ANSI: an 80-column, 16-colour comic that scrolls slowly upwards like an art file in a DOS viewer and loops once a minute. It opens on a black header band with ULTRA in cyan and SATISFACTORY in white block letters with grey shading, over the line: a companion app for the factory game Satisfactory, unofficial fan project. On a flat royal blue ground stands the mascot Gary, senior cog: a gold cog with heavy eyelids and a toothy grin, a red hard hat, a spanner in one white glove and a thumb up with the other. His speech balloon says: every recipe, building and Space Elevator objective, one click apart, I timed it. A small blue credit plaque reads pallet jack, SWARF, production. The scroll then passes four comic panels. OBJECTIVES, on purple: a clipboard for Space Elevator phase 3 of 5. ITEMS, on red: a Constructor sending 40 screws a minute along a belt into an overflowing box, beside the Screw recipe card. BUILDINGS, on cyan: miners Mk.1 to Mk.3 and a count of all 477 buildings by kind. RUN IT, on green: a monitor showing the two commands, and Gary peeking over the desk to add that it also runs in a browser. A grey status bar shows the file name ULTRASAT.ANS and a scroll gauge.">
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b> · an illustrated ANSI in 80 columns and 16 colours · a SWARF production<br>
  <sub>⚡ starring Gary, senior cog (not in the game: Gary is management) · an unofficial fan project, not affiliated with Coffee Stain Studios</sub>
</p>

⚡ **ULTRA-SATISFACTORY** is a companion app for the factory-building game *Satisfactory*: every recipe, building and Space Elevator objective, one click apart. It sits beside the game (second monitor, phone, or a quick alt-tab) and answers the questions your factory keeps asking. Today's: a Rotor line eats 100 Screws a minute and a Constructor makes 40, so you need two and a half Constructors, and nobody has ever built half a Constructor on purpose.

⚡ Three tabs, one comic panel each. **Objectives** takes a Space Elevator phase and lists the parts it wants, and how many. **Items** searches on every keystroke and deals out recipe cards: ingredients at per-minute rates, the machine, its cycle time, its power draw. **Buildings** has every building by tier, what each one makes, and the Mk-by-Mk upgrade paths. All of it is wired together: click a part for its recipe, click the machine for its building.

⚡ Two commands and it is up (Python 3.10+, from the repo root, [the details](#run-it-locally)). Or install nothing at all: it [runs live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/).

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py     # then open http://localhost:8501
```

⚡ One lap of the scroller takes exactly one minute, so everything in it is per minute. In that lap a Constructor makes 40 Screws (count them: the belt in the Items panel really does drop 40 into the box), a Smelter makes 30 Iron Ingots, and Gary takes 0 sick days. Further down: [what's inside](#whats-inside) · [how it's built](#how-its-built) · [data & credits](#data--credits) · [license](#license).

<details>
<summary>⚡ <b>FILE_ID.DIZ</b> · the pack notes, the comic in plain text, the SAUCE record and the greets</summary>

```text
 ┌─ FILE_ID.DIZ ───────────────────────────────┐
 │ ULTRA-SATISFACTORY          [SWARF 09/26]   │
 │ ░▒▓ illustrated ANSI · 80x139 · iCE ▓▒░     │
 │ A companion app for the game Satisfactory:  │
 │ every recipe, building and Space Elevator   │
 │ objective, one click apart. 140 items, 211  │
 │ recipes (88 alternates), 477 buildings, 5   │
 │ phases. Free. Apache 2.0. Unofficial.       │
 │ art: pallet jack     mascot: Gary (a cog)   │
 └─────────────────────────────────────────────┘

 THE COMIC, IN PLAIN TEXT (for anyone reading without the pictures)

 PAGE 1 · royal blue
   GARY, SENIOR COG. 8 TEETH. 0 SICK DAYS. Hard hat, spanner, thumb up,
   and a grin with four more teeth in it (those are not on the payroll).
   Gary: "Every recipe, building and Space Elevator objective:
          one click apart. I timed it."
   Caption: The belt was "temporary". It is now load-bearing.

 PAGE 2 · OBJECTIVES · purple
   A clipboard, held up by a white glove that would like to go home.
   Space Elevator, phase 3 of 5, "Oil & computers":
     > Versatile Framework    x2500    (picked, in a blue bar)
       Modular Engine          x500
       Adaptive Control Unit   x100
   Small print on the clipboard: click a part, get its recipe.
   Caption: The elevator wants 2500 of them. It did not say please.

 PAGE 3 · ITEMS · red
   The search box says "scre". One hit out of 140 items.
   Recipe card: SCREW.  in   1 Iron Rod   10/min
                        out  4 Screw      40/min
                        via  Constructor, 6 s cycle, 4 MW
   Sound effect: TINK!
   Caption: 140 items. 211 recipes, 88 of them alternates. One box.
            It is full of screws. It was always full of screws.

 PAGE 4 · BUILDINGS · cyan
   Three miners in a row, Mk.1 to Mk.3, each one smugger than the last.
   All 477 buildings: 9 production, 333 structure, 59 logistics,
   26 decor, 15 power, 14 transit, 7 special, 7 storage, 7 extraction.
   Caption: 333 of the 477 are structure pieces. The tidy people use
            them all. The spaghetti people use four, and clip the rest
            through a wall.

 PAGE 5 · RUN IT · green
   On the monitor:   > python -m pip install -r requirements.txt
                     > python -m streamlit run app/app.py
                       up at http://localhost:8501
   Gary, from behind the desk: "Or install nothing. It runs in a
   browser: lukexyz.github.io/ULTRA-SATISFACTORY"

 ─────────────────────────────────────────────────────────────────────────
 SAUCE00
   Title ....... ULTRA-SATISFACTORY     (35 characters allowed. 18 used)
   Author ...... pallet jack            (20 allowed)
   Group ....... SWARF                  (20 allowed)
   Date ........ 20260930
   Size ........ 80 x 139
   Flags ....... iCE colors on          (16 backgrounds. blink was the price)
   Protection .. none (not a real SAUCE field. it's Apache 2.0, the
                 source is right there)

 HOW IT WAS DRAWN
   No ANSI editor was harmed. The generator paints vector shapes onto a
   grid, then forces every cell to be something a text screen could
   really hold: one character (full block, half block or one of the
   three shades), one foreground colour, one background colour.
   Gary is 100% legal. Gary insists you write that down.

 S W A R F · what is left on the floor after the real work
   pallet jack ............. ansi, outlines, this one
   Mrs. Overflow ........... shading (three characters, used with restraint)
   fuse #14 ................ power. blew at the worst possible moment
   the wrong-way splitter .. logistics. has never once apologised
   a spreadsheet ........... founder, treasurer, only adult present

 GREETS
   Spaghetti Local 477 · the Tidy Foundation League · the Friends of the
   Load-Bearing Temporary Belt · everyone hoarding all 88 alternates

 NO GREETS
   the machine starved of exactly one input. you know which input

 SMALL PRINT
   unofficial fan project, not affiliated with Coffee Stain Studios.
   game data: greeny/SatisfactoryTools. images: Satisfactory Wiki,
   CC BY-NC-SA 4.0. the code is Apache 2.0. the cog is original.
```

</details>
