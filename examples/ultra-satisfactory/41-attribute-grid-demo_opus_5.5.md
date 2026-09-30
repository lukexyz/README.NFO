<p align="center">
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><img src="assets/41-attribute-grid-demo_opus_5.5.svg" width="704" alt="ULTRA-SATISFACTORY as an 8-bit demo screen: 32 by 24 colour cells, two colours per cell, inside a wide black border with three raster bars drifting through it. A chunky two-armed spiral of black, blue, magenta and red cells turns behind ULTRA, built from whole bright-cyan cells, above SATISFACTORY in white and a yellow bar reading: a companion app for Satisfactory. Three block-highlighted tabs take turns lighting up: OBJECTIVES (5 Space Elevator shopping lists), ITEMS (140 items, 211 recipes, 1 search) and BUILDINGS (477 buildings and what they make). Below, a twister effect turns out to be one giant rotating screw, driven by a machine with a hexagon-and-cog emblem and emptying into a crate labelled SCREWS that is already full of them, captioned with the real recipe: Screw, 40 a minute, Constructor, 6 seconds, 4 MW. Along the bottom a rainbow-banded scroller runs the pitch: every recipe, building and Space Elevator objective, one click apart; unofficial fan project."></a>
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b>: a companion app for the factory-building game <i>Satisfactory</i>. Every recipe, building and Space Elevator objective, one click apart.<br>
  <sub>⚡ Drawn in 768 colour cells at two colours each, which is still more planning than your screw storage got. Unofficial fan project, not affiliated with Coffee Stain Studios.</sub>
</p>

<p align="center">
  ⚡
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><kbd>RUN</kbd> live in your browser</a> ·
  <a href="#run-it-locally"><kbd>LOAD</kbd> run it locally</a> ·
  <a href="#whats-inside"><kbd>LIST</kbd> what's inside</a> ·
  <a href="#how-its-built"><kbd>PEEK</kbd> how it's built</a>
</p>

⚡ Three tabs, no colour clash: **Objectives** (pick a Space Elevator phase, see the parts it wants and how many), **Items** (search on every keystroke; recipe cards with per-minute rates, the machine, its cycle time and power draw) and **Buildings** (every building and what it makes, plus Mk-by-Mk upgrade paths). Everything links, so a part is one click from its recipe and a machine is one click from its building. Park it on a second monitor, a phone, or the far side of an alt-tab.

⚡ Loading takes two lines (Python 3.10+, from the repo root) and no tape. Or skip loading altogether: it runs [live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/).

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py     # then open http://localhost:8501
```

<details>
<summary>⚡ <b>THE ATTRIBUTE MAP</b>: the same screen as text, one character per colour cell, with the workings</summary>

```text
     01234567890123456789012345678901
    ┌────────────────────────────────┐  BORDER: three raster bars on a slow sine
  0 │·················::::░░░░░░░    │  ROWS 0-9: THE SPIRAL
  1 │·█·· █ █     █████:█████░█████  │  one phase number per cell and one ramp:
  2 │·█   █ █       █··:█:░░█░█   █  │  black, blue, magenta, red (here: space,
  3 │ █   █ █     ░ █··:█████░█   █  │  dot, colon, shade). every other step is
  4 │ █   █ █  ░░░░░█ ·:█░█░░ █████  │  a 50/50 chequer. cycle it and it turns.
  5 │ █   █ █░░░░░:·█:░░█░░█  █   █  │  ULTRA is 71 whole cells of BRIGHT cyan,
  6 │ █████ █████::·█  ░█   █ █   █  │  edged in one pixel of BRIGHT white INK.
  7 │      ░░░░░:::··               ·│
  8 │    S A T I S F A C T O R Y  ···│  SATISFACTORY: four cells to the letter.
  9 │                             ···│
 10 │A COMPANION APP FOR SATISFACTORY│  ROW 10: exactly 32 characters. counted.
 11 │                                │
 12 │ OBJECTIVES   ITEMS   BUILDINGS │  ROWS 12-13: THE TABS. the live one gets
 13 │5 SPACE ELEVATOR SHOPPING LISTS │  PAPER, the others INK. they take turns.
 14 │                                │
 15 │┌─╥──┐▒▒▒ █ ░▒  ▓█ ░ ▓     ╤ ╤╤ │  ROWS 15-19: THE SCREW. a twister in the
 16 ││┌──┐├▒▒▒▒██░▒▒▒▓██░▒▓█░  ╤╤╤╤╤╤│  20-column multicolour band, where cells
 17 │││<>│╞▒▒▒▒███▒▒▒▒███▒▒██▒▒╔════╗│  are 8 pixels wide and 2 lines tall. one
 18 ││└──┘├▓▓▓▒░██▓▓▒▒░██▒▒██  SCREWS│  turning bar, staggered along its length.
 19 │╧════╧▓▓                  ╚════╝│  the machine and the crate are 1-bit art.
 20 │SCREW 40/MIN  CONSTRUCTOR 6S 4MW│  ROW 20: its real recipe, as Items has it
 21 │                                │
 22 │  ULTRA-SATISFACTORY  *  A COMPA│  ROWS 22-23: THE SCROLLER. text moves in
 23 │                                │  pixels, colours stay put in their cells.
    └────────────────────────────────┘  BORDER again: one colour per scanline.
```

⚡ The rules are self-imposed and all obeyed: a 256 by 192 picture cut into 32 by 24 cells, one INK and one PAPER per cell from eight colours, one BRIGHT bit that both must share, and effects that change colour in steps and never blend. The generator stores exactly one INK and one PAPER per cell, so a third colour has nowhere to go, which makes it tidier than any factory we have built.

⚡ The screw is the Items tab's honest example: one Iron Rod in, four Screws out, 40 a minute from a Constructor on a 6 second cycle at 4 MW. The crate was full before you got here.

</details>

<details>
<summary>⚡ <b>THE SCROLLTEXT</b>: all of it, at 32 columns, for people who cannot spare it two and a half minutes</summary>

```text
ULTRA-SATISFACTORY * A COMPANION
APP FOR THE FACTORY GAME
SATISFACTORY * EVERY RECIPE,
BUILDING AND SPACE ELEVATOR
OBJECTIVE, ONE CLICK APART * 140
ITEMS, 211 RECIPES (88 OF THEM
ALTERNATES), 477 BUILDINGS, 5
PHASES * UNOFFICIAL FAN PROJECT,
NOT AFFILIATED WITH COFFEE STAIN
STUDIOS * THIS TEXT RUNS RIGHT
TO LEFT. SO DOES THE BELT YOU
BUILT BACKWARDS * THIS SCREEN
HAS 768 COLOUR CELLS, SO EVERY
BUILDING COULD HAVE ITS OWN AND
LEAVE 291 SPARE FOR SCREWS * TWO
COLOURS PER CELL IS OUR VERSION
OF ONE ITEM PER BELT: PUT SCREWS
AND WIRE ON THE SAME BELT AND
THAT IS COLOUR CLASH TOO * THE
SCREW ABOVE IS NOT TO SCALE.
NEITHER IS YOUR STORAGE BOX *
THE GAME DATA IS 1.5 MEGABYTES:
THIRTY-TWO 48K MACHINES JUST TO
HOLD IT, SO IT RUNS IN A BROWSER
TAB INSTEAD. NO TAPE, NO AZIMUTH
SCREWDRIVER * CELL BLOCK 768
SENDS GREETINGS TO THE MANIFOLD
PEOPLE, THE LOAD BALANCER
PEOPLE, AND THE FUSE THAT WAITED
UNTIL YOU WERE FAR AWAY * THE
BORDER EFFECT WAS TEMPORARY. IT
IS NOW LOAD-BEARING * THE CODE
IS APACHE 2.0 * TEXT RESTARTS,
LIKE YOUR FACTORY AFTER THE FUSE
```

⚡ The sums in it are real: 768 cells minus 477 buildings is 291, and the game data (one JSON file of about 1.5 MB) is too big for thirty-one 48K machines, so thirty-two it is. Cell Block 768 is not real, and neither are its greetings.

⚡ Credits that are real: game data from [greeny/SatisfactoryTools](https://github.com/greeny/SatisfactoryTools), item and building images from the [Satisfactory Wiki](https://satisfactory.wiki.gg) (CC BY-NC-SA 4.0), code under [Apache 2.0](LICENSE).

</details>
