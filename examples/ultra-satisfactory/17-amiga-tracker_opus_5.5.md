<p align="center">
  <img src="assets/17-amiga-tracker_opus_5.5.svg" width="828" alt="ULTRA-SATISFACTORY drawn as the editor screen of an Amiga-style four-channel music tracker. A grey embossed panel holds a stack of numeric fields with arrow buttons (ITEMS 0140, RECIPES 0211, BUILDINGS 0477), a button grid that includes the app's three tabs OBJECTIVES, ITEMS and BUILDINGS, a logo plate reading ULTRA-SATISFACTORY, companion app for Satisfactory, every recipe, one click apart, and four small scopes with yellow traces. Underneath, four black pattern windows labelled SMELTER, CONSTRUCTOR, ASSEMBLER and MANUFACTURER scroll blue note data under a fixed grey edit row. One row is one second and every note is a machine finishing a craft cycle, so Iron Ingot plays every 2 rows and Heavy Modular Frame every 30. A fat green VU bar per channel jumps on each note. The SAMPLENAME strip steps through real recipes (Reinforced Iron Plate: Assembler, 5 per minute, 12 second cycle, 15 MW), the status line reads ALL RIGHT, then FUSE BLOWN. AGAIN while the lamp on a button marked OVERCLOCK blinks, then SCREW BOX FULL during the Screw pattern, and a yellow arrow pointer hovers over OVERCLOCK the whole time.">
</p>

<h1 align="center">ULTRA-SATISFACTORY</h1>

<p align="center">
  ⚡ <b>A companion app for the factory-building game <i>Satisfactory</i>: every recipe, building and Space Elevator objective, one click apart.</b><br>
  ⚡ Pictured as a four-channel tracker module, because a factory is just a song you cannot stop arranging. One row is one second, every note is a machine finishing a craft cycle, and every recipe number is the app's real data. Only the tune is made up.
</p>

⚡ You run it beside the game: second monitor, phone, or one alt-tab away. Three tabs, and everything links: click an ingredient or a product for its recipe, click the machine for its building.

- ⚡ <kbd>CH 1</kbd> **OBJECTIVES**: pick a Space Elevator phase, see the parts it wants and how many.
- ⚡ <kbd>CH 2</kbd> **ITEMS**: search as you type. Recipe cards show per-minute rates, the machine, its cycle time and its power draw.
- ⚡ <kbd>CH 3</kbd> **BUILDINGS**: every building and what it makes, grouped by tier, plus Mk-by-Mk upgrade paths.
- ⚡ <kbd>CH 4</kbd> *muted*: your actual factory. The app cannot hear it, which is a mercy.

⚡ To load it from disk: Python 3.10+ and two commands, run from the repo root. The long version is under [Run it locally](#run-it-locally).

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py        # then open http://localhost:8501
```

⚡ No disk drive? [Play it live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/): nothing to install, and it has never once asked for disk 2.

<p align="center">
  <sub>⚡ <code>140&nbsp;items</code> <code>211&nbsp;recipes,&nbsp;88&nbsp;of&nbsp;them&nbsp;alternates</code> <code>477&nbsp;buildings</code> <code>5&nbsp;Space&nbsp;Elevator&nbsp;phases</code> <code>4&nbsp;channels</code> <code>0&nbsp;bytes&nbsp;of&nbsp;audio</code></sub><br>
  <sub>⚡ Unofficial fan project, not affiliated with Coffee Stain Studios. The game is sold separately. The module does not exist: that is a picture of a song.</sub><br>
  <sub>⚡ Further down the disk: <a href="#whats-inside">What's inside</a> · <a href="#run-it-locally">Run it locally</a> · <a href="#how-its-built">How it's built</a> · <a href="#data--credits">Data &amp; credits</a> · <a href="#license">License</a></sub>
</p>

<details>
<summary>⚡ <b>MODULE INFO</b>: how to read the pattern, the sample list, the order list, greets and credits</summary>

<br>

⚡ The pattern is a production schedule. Each cell reads <code>NOTE SAMPLE EFFECT</code>, for example <code>E-3 02 C02</code>.

- ⚡ **Sample** is the item. `02` is Iron Plate: the full list is below.
- ⚡ **One row is one second** of factory time. A note is the machine finishing one craft cycle of the standard recipe, so Iron Ingot (2 s) plays every 2 rows and Modular Engine (60 s) plays once a pattern and then sulks. The playback runs at four rows a second, because somebody left OVERCLOCK on.
- ⚡ **`Cxx` is "set volume".** Here volume means what the spreadsheet people mean: items out per cycle. Notes per pattern times volume is items per minute. Iron Plate: 10 notes at `C02`, 20 a minute.
- ⚡ **`D00` on row 59 is a pattern break.** A minute has 60 seconds and a pattern has 64 rows. Four idle rows is four too many.
- ⚡ **The fields top left are a recipe card.** SAMPLE, PER MIN, CYCLE S and POWER MW follow the red cursor from channel to channel, the same numbers the ITEMS tab shows.
- ⚡ **The VU bars and scopes** are there because they look good. So is the melody: the pitches are invented, the timing is not.
- ⚡ **The status line** is the shift report. The fuse goes the moment the Modular Engine starts up, the OVERCLOCK lamp blinks until somebody resets it, and the screw box fills during the Screw pattern.

```text
ULTRA-SATISFACTORY.MOD              4 channels  4 patterns  0 bytes of audio
composed by FUSE BOX FOUR (four machines, one fuse, no spare)

 ## SAMPLENAME              MACHINE        CYCLE  VOL  /MIN   MW
 01 iron ingot              Smelter          2 s  C01    30    4
 02 iron plate              Constructor      6 s  C02    20    4
 03 reinforced iron plate   Assembler       12 s  C01     5   15
 04 heavy modular frame     Manufacturer    30 s  C01     2   55
 05 copper ingot            Smelter          2 s  C01    30    4
 06 wire                    Constructor      4 s  C02    30    4
 07 rotor                   Assembler       15 s  C01     4   15
 08 modular engine          Manufacturer    60 s  C01     1   55
 09 caterium ingot          Smelter          4 s  C01    15    4
 0A screw                   Constructor      6 s  C04    40    4
 0B smart plating           Assembler       30 s  C01     2   15
 0C iron rod                Constructor      4 s  C01    15    4
 0D modular frame           Assembler       60 s  C02     2   15
 0E ----------------------
 0F one row = one second
 10 one pattern = a minute
 11 a note = one machine
 12 finishing one cycle
 13 ----------------------
 14 the tune is invented
 15 the numbers are not
 16 ----------------------
 17 greets fly out to:
 18  club underclock
 19  mezzanine nine
 1A  the pallet cleansers
 1B  and whoever is still
 1C  hand-feeding a smelter
 1D ----------------------
 1E no audio was harmed
 1F apache 2.0: copy away

ORDER LIST (which sample each machine plays)
 POS  PAT   1 SMELTER   2 CONSTRUCTOR   3 ASSEMBLER   4 MANUFACTURER
  00   00      01            02              03             04
  01   01      05            06              07             08
  02   02      09            0A              0B             04
  03   03      01            0C              0D             04

THE LONGER SONG (what the Space Elevator wants, as OBJECTIVES lists it)
  1 Automation basics .... Smart Plating x50, Versatile Framework x100,
                           Automated Wiring x500
  2 Logistics & steel .... Automated Wiring x500, Modular Frame x500,
                           Smart Plating x100, Versatile Framework x500
  3 Oil & computers ...... Versatile Framework x2500, Modular Engine x500,
                           Adaptive Control Unit x100
  4 Nuclear & endgame .... Assembly Director System x1000,
                           Magnetic Field Generator x500, Nuclear Pasta x100,
                           Thermal Propulsion Rocket x25
  5 Alien tech & quantum . Biochemical Sculptor x500, AI Expansion Server x100,
                           Neural-Quantum Processor x100,
                           Ballistic Warp Drive x100

  Phase 2 wants 500 Modular Frames. One Assembler plays 2 a minute.
  That is 250 patterns of the same bar. Build more Assemblers.

STATUS LINE, IN ORDER OF APPEARANCE
  ALL RIGHT → FUSE BLOWN. AGAIN → ALL RIGHT-ISH → SCREW BOX FULL →
  ALL RIGHT → PIPE CLIPS WALL → NOBODY SAW THAT

CREDITS
  Game data ....... greeny/SatisfactoryTools
  Item images ..... Satisfactory Wiki, CC BY-NC-SA 4.0
  Code ............ Apache 2.0. Protection: none. Copy it to a friend.
  Unofficial fan project, not affiliated with Coffee Stain Studios.
```

</details>
