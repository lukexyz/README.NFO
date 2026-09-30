<p align="center">
  <img src="assets/12-cassette-jcard_opus_5.5.svg" width="100%" alt="ULTRA-SATISFACTORY as a netlabel cassette, laid out on a cutting mat. A translucent orange cassette with a black label reading ULTRA-SATISFACTORY, SIDE A, C-6, 5:31; its reels turn, the tape pack on the left shrinks while the one on the right grows, and after six tracks the cassette flips over to SIDE B. Below it, a green-ink index card lists twelve recipes as tracks, with each item's craft cycle as its running time. Side A, Smelter and Constructor: Iron Ingot 0:02, Copper Ingot 0:02, Iron Plate 0:06, Iron Rod 0:04, Screw 0:06, Cable 0:02. Side B, Assembler and Manufacturer: Rotor 0:15, Smart Plating 0:30, Modular Frame 1:00, Versatile Framework 0:24, Modular Engine 1:00, Adaptive Control Unit 2:00. A highlighter marks the track now playing, and someone has written YOUR SAVE: 600 HRS in ballpoint. Along the bottom edge sits the top of a tape deck: a play lamp, a three-digit counter that adds up the craft seconds played on this side (022 when side A ends, 309 when side B ends) and a two-row level meter labelled BELT and HISS. On the right the J-card lies open: a flap with the counts (140 items, 211 recipes, 477 buildings, 5 phases) and the credits, a navy spine with ULTRA-SATISFACTORY in gold and the catalogue number BH-140-211-477, and a sunset front cover with a factory skyline, the title ULTRA SATIS-FACTORY and three stripes for the tabs OBJECTIVES, ITEMS and BUILDINGS. An obi strip down the cover carries the name in katakana, the pitch (every recipe, building and Space Elevator objective, one click apart) and the price: 0 yen, free forever.">
</p>

<h1 align="center">ULTRA-SATISFACTORY</h1>

<p align="center">
  ⚡ <b>A companion app for the factory-building game <i>Satisfactory</i>: every recipe, building and Space Elevator objective, one click apart.</b><br>
  ⚡ Out now on Belt Hiss Tapes, a label that does not exist, on a format your PC cannot play. Luckily it is an app. Press play anyway.
</p>

<p align="center">
  ⚡
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><kbd>► PLAY</kbd></a> live in your browser &nbsp;
  <a href="#run-it-locally"><kbd>● REC</kbd></a> dub a local copy &nbsp;
  <a href="#whats-inside"><kbd>►► FF</kbd></a> what's inside &nbsp;
  <a href="#how-its-built"><kbd>◄◄ REW</kbd></a> how it's built &nbsp;
  <kbd>■ STOP</kbd> <i>not fitted</i>
</p>

⚡ You play it alongside the game: second monitor, phone, or the far side of an alt-tab at 3 a.m., when the belts have backed up and you cannot remember what goes in a Rotor. Three tabs, and everything links: click a part for its recipe, click the machine for its building.

- ⚡ <kbd>OBJECTIVES</kbd> pick a Space Elevator phase, see the parts it wants and how many.
- ⚡ <kbd>ITEMS</kbd> search as you type. Recipe cards show per-minute rates, the machine, its cycle time and its power draw.
- ⚡ <kbd>BUILDINGS</kbd> every building and what it makes, grouped by tier, plus Mk-by-Mk upgrade paths.

⚡ To dub your own copy: Python 3.10+ and two commands, run from the repo root. The long version is under [Run it locally](#run-it-locally).

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py        # now playing on http://localhost:8501
```

⚡ No deck, no Python, no patience? [Play it live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/): nothing to install, nothing to rewind.

<p align="center">
  <sub>⚡ Unofficial fan project, not affiliated with Coffee Stain Studios. The game is sold separately. The tape is not sold at all.</sub>
</p>

<details>
<summary>⚡ <b>Liner notes</b>: the index card as text, the catalogue number decoded, the Space Elevator suite, credits and thanks</summary>

```text
ULTRA-SATISFACTORY · VARIOUS MACHINES     BELT HISS TAPES · BH-140-211-477 · C-6
┌─[A] SIDE A · smelter + constructor ─┬─[B] SIDE B · assembler + manufacturer ─┐
│ 1  Iron Ingot ............... 0:02  │ 1  Rotor ....................... 0:15  │
│ 2  Copper Ingot ............. 0:02  │ 2  Smart Plating ............... 0:30  │
│ 3  Iron Plate ............... 0:06  │ 3  Modular Frame ............... 1:00  │
│ 4  Iron Rod ................. 0:04  │ 4  Versatile Framework ......... 0:24  │
│ 5  Screw .................... 0:06  │ 5  Modular Engine .............. 1:00  │
│ 6  Cable .................... 0:02  │ 6  Adaptive Control Unit ....... 2:00  │
├─────────────────────────────────────┴────────────────────────────────────────┤
│ NR [ ] on [x] off      BELTS [x] spaghetti [ ] tidy      DATE  3 a.m. again  │
│ Running time = one craft cycle of the standard recipe.  0:22 + 5:09 = 5:31   │
└──────────────────────────────────────────────────────────────────────────────┘

ULTRA-SATISFACTORY                                        BELT HISS TAPES · 2026
various machines                                         cat. no. BH-140-211-477
════════════════════════════════════════════════════════════════════════════════

THE CATALOGUE NUMBER IS THE TRACK COUNT
  140 ....... craftable items, searched on every keystroke
  211 ....... machine recipes, 88 of them alternates
  477 ....... buildings you can build: 9 production machines, 333 structure
              pieces, 59 logistics, 26 decor, 15 power, 14 transit,
              7 special, 7 storage, 7 extraction
    5 ....... Space Elevator phases (the hidden tracks, below)

ABOUT THE RUNNING TIMES
  Every time on the card is real: it is the craft cycle of that item's
  standard recipe, in minutes and seconds. A Modular Frame takes 60 s in an
  Assembler, so track B3 runs 1:00. The whole tape runs 5:31.
  The counter on the deck adds the craft seconds up as they play: it reads
  022 when side A runs out and 309 at the end of side B.
  Your save file runs somewhat longer.

HIDDEN TRACKS: THE SPACE ELEVATOR SUITE, IN FIVE MOVEMENTS
  I    Automation basics ...... Smart Plating x50, Versatile Framework x100,
                                Automated Wiring x500
  II   Logistics & steel ...... Automated Wiring x500, Modular Frame x500,
                                Smart Plating x100, Versatile Framework x500
  III  Oil & computers ........ Versatile Framework x2500, Modular Engine x500,
                                Adaptive Control Unit x100
  IV   Nuclear & endgame ...... Assembly Director System x1000,
                                Magnetic Field Generator x500,
                                Nuclear Pasta x100,
                                Thermal Propulsion Rocket x25
  V    Alien tech & quantum ... Biochemical Sculptor x500,
                                AI Expansion Server x100,
                                Neural-Quantum Processor x100,
                                Ballistic Warp Drive x100

PERSONNEL
  Smelter ............ ingots. 4 MW. has never once complained
  Constructor ........ plates, rods, screws, cable. 4 MW. the workhorse
  Assembler .......... 15 MW. the rhythm section
  Manufacturer ....... 55 MW. lead machine. very loud
  also appearing ..... Blender, Foundry, Packager, Particle Accelerator,
                       Refinery

PRODUCTION
  recorded at ........ app/app.py: one Streamlit app, three tabs
  mastered by ........ ultra_satisfactory/data.py, straight from data/data.json
  searchable grids ... streamlit-aggrid
  pressed at ......... GitHub Pages: a stlite build (Streamlit in the browser,
                       via WebAssembly), republished by GitHub Actions on
                       every push to main
  also touring ....... modal_app.py: a full Streamlit server on Modal

CREDITS
  game data .......... greeny/SatisfactoryTools
  pictures ........... the Satisfactory Wiki (CC BY-NC-SA 4.0)
  code licence ....... Apache 2.0. home taping is encouraged: fork it
  the game ........... Satisfactory, by Coffee Stain Studios. sold separately.
                       this is an unofficial fan project, not affiliated

THANKS
  the Sawtooth Roof Appreciation Society · the Pencil Rewinders' Union ·
  the Headlift Support Group (meets upstairs, arrives eventually) ·
  everyone who built the stairs last · whoever keeps petting the Lizard
  Doggo instead of fixing the power. you are the real take-up reel.

SMALL PRINT
  Belt Hiss Tapes is made up, and so are the tape and the deck. The app is
  real. The reels in the picture keep a constant tape speed, so the emptier
  hub turns faster. This helps nobody.
  No cassettes were harmed. Several belts were.
════════════════════════════════════════════════════════════════════════════════
```

</details>

<details>
<summary>⚡ <b>Care of your tape</b>: troubleshooting for pioneers</summary>

```text
SYMPTOM                        REMEDY
─────────────────────────────  ─────────────────────────────────────────────────
tape will not play             it is a web app. open the link instead
port 8501 already taken        that is the last copy you dubbed. still running
belts backed up                ITEMS tab: type the part, read the per-minute
                               rates, build one more machine
forgot what phase 3 wants      OBJECTIVES tab. it wants 2500 Versatile
                               Frameworks. sit down first
cannot find the Assembler      BUILDINGS tab, or click the machine on any
                               recipe card. everything links
it is 3 a.m.                   correct. no remedy is known
tape chewed by the deck        there is no tape. check the belts instead
```

</details>
