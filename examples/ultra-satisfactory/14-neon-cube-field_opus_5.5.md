<p align="center">
  <img src="assets/14-neon-cube-field_opus_5.5.svg" width="100%" alt="A README banner in the style of a 2010-era 64k intro. CUBIC METRES PER MINUTE presents ULTRA SATISFACTORY on a glowing segment display, ULTRA in cyan and SATISFACTORY in white, over a starfield. Below it a floor of 378 small neon cubes in an isometric grid, coloured as one continuous rainbow, rolls in a slow wave while the hues drift across it, under scanlines. Three signs stand on the floor, one per tab: OBJECTIVES, ITEMS and BUILDINGS. A text writer types four pages: a companion app for the factory game Satisfactory, every recipe, building and Space Elevator objective, one click apart; 140 items, 211 recipes (88 alternate), 477 buildings, 5 Space Elevator phases, 3 tabs, 0 spreadsheets required; the two commands that run it; and no install at lukexyz.github.io/ULTRA-SATISFACTORY, unofficial fan project, protection: none, it's Apache 2.0.">
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b>: a companion app for the factory-building game <i>Satisfactory</i>. Every recipe, building and Space Elevator objective, one click apart.<br>
  <sub>⚡ A CUBIC METRES PER MINUTE production. 378 foundations laid, 0 machines placed: we are calling it the planning phase. An unofficial fan project, not affiliated with Coffee Stain Studios.</sub>
</p>

⚡ Park it beside the game (second monitor, phone, the far side of an alt-tab) and stop keeping ratios in your head, where they were never safe. Three tabs, one per sign on the floor up there:

- ⚡ **OBJECTIVES**: pick a Space Elevator phase, see the parts it wants and how many. Click a part for its recipe.
- ⚡ **ITEMS**: search on every keystroke. Recipe cards show the ingredients with per-minute rates, the machine with its cycle time and power draw, and the products.
- ⚡ **BUILDINGS**: every building and what it makes, grouped by tier, plus Mk-by-Mk upgrade paths for miners, conveyors, pipelines and storage.

⚡ Everything links to everything: click an ingredient or a product for its recipe, click the machine for its building. It is a manifold, but for facts.

⚡ Two commands (Python 3.10+, from the repo root), then open `http://localhost:8501`:

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py
```

⚡ Or run nothing at all: it is **[live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/)**, a stlite build (Streamlit on WebAssembly) that GitHub Actions republishes on every push to `main`. No install, and no fuse to blow.

<p align="center">
  ⚡ <a href="#whats-inside">what's inside</a> &middot; <a href="#run-it-locally">run it locally</a> &middot; <a href="#how-its-built">how it's built</a> &middot; <a href="#data--credits">data &amp; credits</a> &middot; <a href="#license">license</a>
</p>

<p align="center">
  <img src="assets/14-neon-cube-field_opus_5.5-rule.svg" width="100%" alt="A divider: nineteen small translucent octahedra, one per hue of the rainbow, turning in a slow wave along a rail.">
</p>

<details>
<summary>⚡ <b>CUBES.NFO</b>: the info file. The one real cube, how the floor rolls, a floor inspection, greetz</summary>

```text
         /\                                      /\
        |\/|     /\                      /\     |\/|
 /\      \/  /\ |\/|                    |\/| /\  \/      /\
|\/| /\     |\/| \/      /\              \/ |\/|     /\ |\/|             /\
 \/ |\/|     \/      /\ |\/|     /\          \/     |\/| \/      /\     |\/|
     \/             |\/| \/     |\/| /\              \/      /\ |\/|     \/
                     \/      /\  \/ |\/|                    |\/| \/  /\
                            |\/|     \/                      \/     |\/|
                             \/                                      \/

       C U B I C   M E T R E S   P E R   M I N U T E   floors you with

                  U L T R A - S A T I S F A C T O R Y

  WHAT ......... companion app for the factory game Satisfactory
  INSIDE ....... 140 items, 211 recipes (88 alternate), 477 buildings,
                 5 Space Elevator phases, 3 tabs
  PROTECTION ... none. It is Apache 2.0. Read it, fork it.
  REQUIRES ..... Python 3.10+, or nothing but a browser tab
  SIZE ......... the banner is one SVG under 65,536 bytes: a 64k
                 intro's whole allowance. The generator refuses to
                 build a fatter one.
  FRAME RATE ... smug. 378 cubes move; 3 rectangles do all the colouring.
  CREDITS ...... code: zoopline · pixels: lintel · music: see below
  MUSIC ........ none. A fuse blew in the first bar. Nobody owned up.
  CUBES ........ 378, all decorative. The app knows one real cube.
  THE GAME ..... sold separately. This is an unofficial fan project.

── THE ONE REAL CUBE ──────────────────────────────────────────────────────────
  The app's data has exactly one item with Cube in its name. Look it up
  in the ITEMS tab and follow the ingredients down:

  Pressure Conversion Cube ... 1/min   Assembler              60 s   15 MW
      in: 1 Fused Modular Frame + 2 Radio Control Unit        out: 1
  Its purpose in life is to become pasta:
  Nuclear Pasta ............ 0.5/min   Particle Accelerator  120 s
      in: 200 Copper Powder + 1 Pressure Conversion Cube      out: 1
  Copper Powder ............. 50/min   Constructor             6 s    4 MW
      in: 30 Copper Ingot                                     out: 5
  Copper Ingot .............. 30/min   Smelter                 2 s    4 MW
      in: 1 Copper Ore                                        out: 1

  Read the powder line again. One Constructor eats 300 Copper Ingot a
  minute: that is ten Smelters feeding a single machine. Phase 4 wants
  100 Nuclear Pasta, so 100 cubes, 20,000 Copper Powder and 120,000
  Copper Ingot. One click per ingredient in the app. Rather more in the
  factory.

── HOW THE FLOOR ROLLS ────────────────────────────────────────────────────────
  No GIF, no video, no JavaScript. One SVG file and some CSS keyframes.
  378 cubes, each a single <use> of the same grey cube. The floor is two
  plane waves sharing one 4 second period. Add two sines of the same
  frequency and every point still moves as one sine, so each cube needs
  only an amplitude (8 levels) and a head start (44 steps). That is all
  the per-cube animation there is: up, down, a little bigger on top.
  Colour: the cubes are grey. Under them one rainbow gradient slides by
  every 32 seconds, and the grey layer is blended over it (hard-light):
  mid grey shows the hue, dark grey shades it, white stays white.
  Light: two soft bands slide along with the waves, pale on the crests,
  dark in the troughs. Rectangles doing all the colour work: 3.
  Colour animations per cube: 0. The cubes have not been told.

── FLOOR INSPECTION, FORM 7B ──────────────────────────────────────────────────
  Foundations laid .......... 378
  Machines placed ........... 0. We laid the floor and then got shy.
  Belts ..................... 0. They would not survive the floor.
  Manifold or balancer ...... neither. The meeting is still going.
  Signs ..................... 3, one per tab, all spelled right. A first.
  Floor flatness ............ periodic
  Display, letter O ......... lower right bar drops out twice every 16 s.
                              Maintenance was told. Maintenance is busy
                              straightening a pillar.
  Verdict ................... tidy. The spaghetti people may look away.

── GREETZ ─────────────────────────────────────────────────────────────────────
  Grid Snap Fundamentalists · Friends of the Unlabelled Crate
  · Sine Wave Health & Safety · the One-Tile-Off Apologists
  · Painter's Algorithm & Sons (back to front, always)
  · the Alt-Tab Athletic Club
  · the 44 phase steps, who never get thanked
  · whoever overclocked the thing that took out the music

── NO GREETZ ──────────────────────────────────────────────────────────────────
  The one machine starved of one input. You know which. So does it.

── SMALL PRINT ────────────────────────────────────────────────────────────────
  An unofficial fan project, not affiliated with Coffee Stain Studios.
  Satisfactory is theirs and is sold separately. Game data:
  greeny/SatisfactoryTools. Item and building images: the Satisfactory
  Wiki (CC BY-NC-SA 4.0). Code: Apache 2.0.
  CUBIC METRES PER MINUTE is made up, and so is everyone in the credits
  and the greetz. The cube is real.
```

</details>

<details>
<summary>⚡ <b>THE ELEVATOR'S INVOICE</b>: every Space Elevator order, priced in machine-minutes</summary>

```text
  THE SPACE ELEVATOR'S INVOICE
  Each phase as the OBJECTIVES tab lists it, priced in machine-minutes:
  how long ONE machine on the standard recipe takes to fill the order.
  Last machine in the chain only. Everything upstream is extra.

  PHASE 1  Automation basics
    Smart Plating .............   x50     2/min  Assembler ...........   25 min
    Versatile Framework .......  x100     5/min  Assembler ...........   20 min
    Automated Wiring ..........  x500   2.5/min  Assembler ...........  200 min
                                                             subtotal   245 min
  PHASE 2  Logistics & steel
    Automated Wiring ..........  x500   2.5/min  Assembler ...........  200 min
    Modular Frame .............  x500     2/min  Assembler ...........  250 min
    Smart Plating .............  x100     2/min  Assembler ...........   50 min
    Versatile Framework .......  x500     5/min  Assembler ...........  100 min
                                                             subtotal   600 min
  PHASE 3  Oil & computers
    Versatile Framework ....... x2500     5/min  Assembler ...........  500 min
    Modular Engine ............  x500     1/min  Manufacturer ........  500 min
    Adaptive Control Unit .....  x100     1/min  Manufacturer ........  100 min
                                                             subtotal  1100 min
  PHASE 4  Nuclear & endgame
    Assembly Director System .. x1000  0.75/min  Assembler ........... 1333 min
    Magnetic Field Generator ..  x500     1/min  Manufacturer ........  500 min
    Nuclear Pasta .............  x100   0.5/min  Particle Accelerator   200 min
    Thermal Propulsion Rocket .   x25     1/min  Manufacturer ........   25 min
                                                             subtotal  2058 min

                                                        PHASES 1 TO 4  4003 min

  PHASE 5  Alien tech & quantum
    Biochemical Sculptor x500, AI Expansion Server x100,
    Neural-Quantum Processor x100, Ballistic Warp Drive x100.
    Not invoiced. Quantum accounting is another department.
```

⚡ That is a shade under 67 hours of one machine per part, before a single ingredient exists. Build a second Assembler. Build forty. The rates are standard recipes straight from the app's data; the arithmetic is ours, rounded to the minute, so blame accordingly.

</details>
