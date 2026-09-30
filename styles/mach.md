# Retro machine, console and arcade screens

<sub>Generated from <code>styles.json</code> by <code>tools/build-styles.mjs</code>. 15 styles, researched 2026-09-30. Checked by a second reviewer, who made 39 corrections. [Back to the catalogue](README.md) · [Full index](INDEX.md)</sub>

## Reviewer's summary

Checked against the sources, this family holds fifteen usable styles in five schools that differ by grid and light source. (1) Home-micro boot and loader screens (ZX Spectrum tape load, Amiga Kickstart and Guru Meditation): low resolution, few colours, one signature moment each. (2) PC 80x25 text-mode screens (twin-panel commander with a Borland IDE variant, BIOS POST, DOS SETUP sound-card dialog, Windows 9x blue screen): one shared grid, the IBM box-drawing set and the documented 16-colour CGA/VGA palette. Their layout survives in a plain-text README block but their colour does not, so only the commander and the POST log are worth shipping as text. (3) Broadcast teletext: 40 columns, eight pure colours, 2x3 mosaics. (4) Tile-based console, handheld and arcade rasters (Game Boy boot, arcade high-score table, NES-era title card, Nokia-era 84x48 LCD, SNES Mode 7 floor): 8x8 tiles, hard colour limits, stepped motion. (5) Glowing-glass displays that are not pixel grids (vector monitors and XY oscilloscopes, pinball plasma dot matrix, VFD and segment panels): their character is glow, dot or segment shape and beam drawing, so they need SVG strokes, masks and filters. For the owner's "chiptune" ask, the honest silent options in this family are the SETUP sound-card dialog, the VFD "now playing" panel and the oscilloscope XY trace; Razor 1911, NFO artists and vaporwave belong to other families. Most "real palette values" the brief asked for do not exist: only the CGA text palette is documented; Spectrum, NES, Game Boy, Nokia, plasma and phosphor colours are emulator or community conventions and are labelled as such below. Web search ran out of budget late in the check, so a few details in the four styles I added are marked as general knowledge rather than sourced.

## Styles

| ID | Style | Medium | Build | Impact |
| --- | --- | --- | --- | --- |
| [mach-01](#mach-01) | ZX Spectrum tape loader: border stripes and loading-screen build-up | Animated SVG | Medium | 4/5 |
| [mach-02](#mach-02) | Amiga Kickstart 1.x: Guru Meditation banner, with insert-disk hand and blue-and-orange Workbench | Animated SVG | Easy | 4/5 |
| [mach-03](#mach-03) | Twin-panel DOS commander (Norton Commander lineage), with Borland blue IDE variant | Text + SVG | Easy | 4/5 |
| [mach-04](#mach-04) | PC power-on: BIOS POST screen | Text + SVG | Easy | 3/5 |
| [mach-05](#mach-05) | DOS game SETUP.EXE: sound card configuration dialog | Text + SVG | Easy | 3/5 |
| [mach-06](#mach-06) | Teletext page (Ceefax era, BBC Micro MODE 7) | Animated SVG | Medium | 4/5 |
| [mach-07](#mach-07) | Game Boy DMG boot: logo drop on a four-shade green LCD | Animated SVG | Easy | 4/5 |
| [mach-08](#mach-08) | Arcade attract mode: high-score table and coin prompt | Text + SVG | Easy | 4/5 |
| [mach-09](#mach-09) | 8-bit console title screen (NES / Famicom era) | Animated SVG | Easy | 3/5 |
| [mach-10](#mach-10) | Vector arcade, Vectrex and XY oscilloscope: beam-drawn glowing lines | Animated SVG | Medium | 5/5 |
| [mach-11](#mach-11) | Pinball dot-matrix display (orange plasma DMD) | Animated SVG | Medium | 5/5 |
| [mach-12](#mach-12) | VFD and segment-display front panel (hi-fi, VCR, calculator) | Animated SVG | Easy | 4/5 |
| [mach-13](#mach-13) | Nokia-era 84x48 monochrome phone LCD | Animated SVG | Easy | 3/5 |
| [mach-14](#mach-14) | Windows 9x text-mode blue screen | Static SVG | Easy | 3/5 |
| [mach-15](#mach-15) | SNES Mode 7: rotating textured ground plane | Animated SVG | Hard | 4/5 |

---

<a name="mach-01"></a>

## mach-01 · ZX Spectrum tape loader: border stripes and loading-screen build-up

**Animated SVG** · build: **Medium** · impact: **4/5** · 1982 to 1992; Sinclair ZX Spectrum cassette software (UK and Europe). Machine released 23 April 1982, discontinued 1992.

The Spectrum ROM loader paints the TV border with stripes that visualise the cassette signal while the game's title picture builds up on screen. Owners remember two phases: slow thick red/cyan bands for the pilot tone, then thin jittering blue/yellow bands for header and data. It differs from the existing C64 loader style because the two colour pairs carry meaning and the picture arrives in a peculiar interleaved order dictated by the screen memory layout.

**What it looks like**

- 256x192 'paper' area centred in a 384x288 frame, so the border is 64 px wide left and right and 48 px top and bottom
- Pilot phase: slow, thick red and cyan horizontal bands rolling through the border only
- Data phase: thin, irregular blue and yellow stripes; a 1 bit lasts twice as long as a 0 bit, so stripe thickness jitters with the data
- A one-line header message in the ROM font after the first short data burst, of the form 'Program: name' or 'Bytes: name'
- Picture bitmap arrives in three 64-line thirds; inside each third the first pixel line of all eight character rows appears, then the second line of all eight, and so on, giving a venetian-blind fill
- Colour arrives last: attributes sweep in 32 cells per row, top row to bottom row, turning the monochrome picture into colour
- 8x8 attribute cells with exactly two colours each (INK and PAPER), so colour changes land on a visible 8-pixel grid (attribute clash)
- 15 colours (8 normal, 7 BRIGHT; black has no bright twin) and a FLASH attribute that swaps ink and paper every 0.64 s

**Palette.** No canonical RGB: Wikipedia states the real colours are unknown and models non-bright as 85% signal (0.55 V) and bright as 100% (0.65 V). The widely used approximation (Lospec 'ZX Spectrum' palette): \#000000, \#0000D8, \#D80000, \#D800D8, \#00D800, \#00D8D8, \#D8D800, \#D8D8D8, and bright versions \#0000FF, \#FF0000, \#FF00FF, \#00FF00, \#00FFFF, \#FFFF00, \#FFFFFF. Border pairs: red/cyan (pilot), blue/yellow (header and data).

**Lettering.** 8x8 pixel ROM font, mixed case, 32 characters per line on a 32x24 grid; the set includes a pound sign, a copyright sign and sixteen 2x2 block-graphics characters. The SVG cannot load fonts, so the generator needs its own original 8x8 glyph table emitted as rects or one path. Logos are bitmap art constrained to the 8x8 two-colour cell rule.

**Motion.** Compressed to a few seconds (a real 6912-byte screen took most of a minute). Phase 1: plain paper, thick red/cyan bands. Phase 2: short blue/yellow burst, header line appears. Phase 3: pilot again, then a long blue/yellow phase while the bitmap fills in by thirds with interleaved lines, then colour sweeps down row by row. End: border snaps to one colour and the frame holds as a static title card.

**As a README header.** One animated SVG, 384 logical pixels wide, cropped to a banner (384x160 still reads because the border is mostly empty). The border carries the stripes; the paper holds the project name as attribute-grid block art plus two or three 8x8 text lines (a 'Program: &lt;repo&gt;' header line, version, one-line pitch). All SVG; no worthwhile text-only form. The animation must end on a static, readable title card.

**How to build it.** Stripes: two tiled &lt;pattern&gt; fills of uneven-height rects (pilot and data) on the border, scrolled with animateTransform on patternTransform or CSS keyframes using steps(), swapped by stepped opacity. Interleaved bitmap fill: per third, eight line-layers (layer k holds pixel line k of each character row) switched on in turn with steps(1) and staggered delays, 24 steps in all. Colour sweep: a second coloured copy revealed by a clipPath rect growing in steps(24). Pixel art and glyphs as merged rects or one path with shape-rendering=crispEdges; 768 attribute cells is tiny. The real work is authoring logo art that obeys the two-colours-per-cell rule. Add a prefers-reduced-motion rule that jumps to the final card.

**Do not copy / caveats.** Do not copy the Sinclair logo, the rainbow-stripe trade dress, the ROM font bitmaps or any real loading screen. Freely reusable: the two stripe phases, border/paper layout, attribute-cell constraint, interleaved fill order. Fast high-contrast stripes are a photosensitivity risk: keep them short and slowed. Hex colours are an emulator convention, not measured values. Recognition is strong in the UK and Europe, weak in North America.

**References**

- [Nostalgia Nerd: loading bands, red/cyan pilot, blue/yellow header and data, ZX81 origin of the effect](<https://www.nostalgianerd.com/what-are-loading-bands-for/>)
- [World of Spectrum: annotated ROM load routine (border white, then red/cyan on leader edges, blue/yellow for bytes; 2168 T pilot, 667/735 sync, 855/1710 bit half-pulses)](<https://worldofspectrum.net/legacy-info/spectrum-rom-load-routine/>)
- [Wikipedia: ZX Spectrum graphic modes (256x192, 8x8 attributes, 15 colours, 384x288 frame, 0.64 s flash, true colours unknown)](<https://en.wikipedia.org/wiki/ZX_Spectrum_graphic_modes>)
- [Spectrum Computing FAQ: display file order (thirds, interleaved pixel lines) and attribute file order (32 bytes per row, top to bottom)](<https://spectrumcomputing.co.uk/faq/Spectrum_Memory.html>)
- [ZX Spectrum BASIC manual chapter 20: the on-screen tape messages 'Program:', 'Number array:', 'Character array:', 'Bytes:'](<https://worldofspectrum.org/ZXBasicManual/zxmanchap20.html>)
- [Wikipedia: Attribute clash, including Don Priestley's cell-aligned sprite style](<https://en.wikipedia.org/wiki/Attribute_clash>)
- [Wikipedia: ZX Spectrum character set (8x8 glyphs, 2x2 block graphics, UDGs, pound and copyright signs)](<https://en.wikipedia.org/wiki/ZX_Spectrum_character_set>)
- [Lospec: ZX Spectrum palette with D8/FF hex values](<https://lospec.com/palette-list/zx-spectrum>)
- [atomic14: a 2024 rebuild of tape loading with pulse timings and the 170 bytes/s figure](<https://atomic14.substack.com/p/old-school-tape-loading>)
- [ZX-Art: archive of Spectrum graphics, demos and music, for studying real loading screens](<https://zxart.ee/eng/>)

---

<a name="mach-02"></a>

## mach-02 · Amiga Kickstart 1.x: Guru Meditation banner, with insert-disk hand and blue-and-orange Workbench

**Animated SVG** · build: **Easy** · impact: **4/5** · 1985 to 1990; Commodore Amiga with Kickstart and Workbench 1.1 to 1.3

Three system screens Amiga owners know by heart: the white boot screen with a simple drawing of a hand holding a floppy, the four-colour blue-and-orange Workbench, and the Guru Meditation alert, a short black box across the top of the screen with red text and a flashing red frame. The name was an in-house joke about sitting still on a Joyboard balance controller. The alert is already a wide, short banner, which makes it a natural README header.

**What it looks like**

- Power-on colour steps: dark grey, light grey, then white when ready to boot (red, green, blue, yellow signal faults)
- Insert-disk card: white screen, black one-pixel outlines, a periwinkle-blue 3.5-inch disk with a grey metal shutter held in a white outlined hand, label drawn upside down, small version text beside it
- Workbench 1.x: saturated blue desktop, white, near-black and one orange accent, chosen for contrast on poor TV sets
- Guru alert: black rectangle across the top of the screen, red frame, two centred lines of red text
- Second alert line ends in the error number: a hash sign, eight hex digits, a full stop, eight hex digits
- 640x200 (NTSC) or 640x256 (PAL) display, so pixels are tall and text looks stretched vertically
- Flat fills and hard outlines only; on 2.x and 3.x recoverable alerts are yellow (green on very early 2.x)

**Palette.** Guru: \#FF0000 on \#000000 (as used in the Wikimedia Commons reproduction; no Commodore document opened). Workbench 1.x: blue \#0055AA, white \#FFFFFF, near-black \#000022, orange \#FF8800 (from a modern tribute theme; consistent with the commonly quoted 12-bit values, not checked against Commodore documentation). Insert-disk card: white, black, a periwinkle blue near \#7777CC and mid grey, estimated by eye from the Wikimedia image.

**Lettering.** Topaz 8, the fixed-width ROM font. The 1.x design differs from the 2.0 design (a 2024 amiga-news report confirms the font changed between Kickstart versions; the usual description of 1.x as serif and 2.0 as sans was not confirmed from an opened page). Draw an original 8x8 face with slab-like capitals, or fall back to generic monospace.

**Motion.** Minimal version: a static alert whose red frame toggles on and off (the Commons reproduction uses two 0.6 s frames). Longer cut: background steps dark grey, light grey, white; an original insert-disk card appears; hard cut to a blue desktop with one window; then the alert drops in at the top and its frame flashes.

**As a README header.** Primary: the whole header is one alert box, about 640x100, black with a flashing red frame; line one is the project name and pitch in your own words, line two a version string shaped like the error number (release and short commit hash as two 8-digit hex fields). Optional longer cut adds the boot colour steps and an original insert-disk drawing with the install command under it. Text-only fallback: a box-drawing frame with the same two lines; it keeps the layout but loses the red and the flash.

**How to build it.** A rect with a red stroke toggled by a CSS keyframe with steps(1) at about 0.6 s per state; background colour steps by the same method; text as SVG text in monospace pinned with textLength, or as embedded pixel-glyph paths. The disk drawing is a few flat polygons. Tiny file. Include a prefers-reduced-motion rule that leaves the frame on.

**Do not copy / caveats.** Do not trace the original hand-and-disk drawing; do not use the Amiga name, checkmark logo, Boing ball or Topaz bitmaps; do not reuse the original alert sentences. The box shape, red-on-black scheme, hex number format and flashing frame are widely parodied and generic. A crash screen as a header can read as 'this project is broken', so the copy must make the joke obvious. Keep the flash at or below one per second. Unconfirmed: the real machine's exact flash rate (the 0.6 s figure is from a reproduction), the documented Workbench palette values, and the Topaz 1.x design details.

**References**

- [Wikipedia: Guru Meditation (box position, red on 1.x, yellow/green later, number format, Joyboard origin, power LED behaviour)](<https://en.wikipedia.org/wiki/Guru_Meditation>)
- [Wikimedia Commons: two-frame animation of the 1.x alert (red frame on and off, 0.6 s each, \#FF0000 on black)](<https://upload.wikimedia.org/wikipedia/commons/b/b2/Amiga_Guru_Meditation.gif>)
- [Wikipedia: Kickstart (diagnostic colour sequence and fault colours; boot prompt images)](<https://en.wikipedia.org/wiki/Kickstart_(Amiga)>)
- [Wikimedia Commons: Kickstart 1.3 insert-disk image (white ground, black outline, blue disk, grey shutter)](<https://upload.wikimedia.org/wikipedia/commons/e/e8/Kickstart1_3.png>)
- [Wikipedia: AmigaOS version history (hand on a white screen with a blue disk; blue/orange scheme; grey 3D look from 2.0)](<https://en.wikipedia.org/wiki/AmigaOS_version_history>)
- [Wikipedia: Workbench (blue-and-orange scheme and reason, 640x200/640x256 modes)](<https://en.wikipedia.org/wiki/Workbench_(AmigaOS)>)
- [Obsidian theme modelled on Workbench 1.3, listing \#0055AA, \#FFFFFF, \#FF8800, \#000022](<https://www.obsidianstats.com/themes/obsidian-theme-inspired-by-amiga-workbench-1.3>)
- [amiga-news: Topaz differs between Kickstart versions (1.4 alpha already sans, not yet the 2.0 shape)](<https://amiga-news.de/en/news/AN-2024-10-00095-EN.html>)

---

<a name="mach-03"></a>

## mach-03 · Twin-panel DOS commander (Norton Commander lineage), with Borland blue IDE variant

**Text + SVG** · build: **Easy** · impact: **4/5** · 1986 to 1998 on MS-DOS (final DOS version 5.51, 1 July 1998); the layout lives on in Volkov Commander, DOS Navigator, FAR Manager and Midnight Commander (1994). Borland variant: Turbo Pascal 5.0 (1988) to the mid 1990s.

John Socha's two-panel file manager, started in 1984 as Visual DOS, defined the orthodox file manager: two file lists side by side, a command line under them and an F1 to F10 key bar on the bottom row. Its blue panels are as recognisable to DOS users as the C64 boot screen is to Commodore owners. It is the one style here that matches what a README is: a list of files with a menu.

**What it looks like**

- 80x25 text mode; two equal panels framed in double-line box-drawing characters with the current path set into the top border
- Panels blue with light-cyan file text; column headings ('Name') in yellow; thin single-line column rules
- Cursor bar: a cyan bar with black text one row high; selected files turn yellow
- File names in lowercase, directories in uppercase; Brief mode shows three name columns per panel, Full mode shows Name, Size, Date, Time
- A one-row status line inside each panel's bottom edge showing the current file's name, size, date and time
- Bottom row key bar: each of ten slots is a grey digit on black followed by a black-on-cyan label (Help, Menu, View, Edit, Copy, RenMov, Mkdir, Delete, PullDn, Quit)
- DOS prompt with blinking cursor on the row above the key bar; pull-down menu bar Left, Files, Disk, Commands, Right in cyan
- Grey dialogs with black drop shadows, yellow hot letters and input fields drawn as square brackets filled with dots
- Borland variant: light-grey menu bar with red hot letters, a blue editor window in a white double-line frame with a centred file name, close and zoom gadgets in the frame, cyan scroll bars on the right and bottom edges, a line:column counter in the bottom frame, grey status row with red key names

**Palette.** Fixed CGA/VGA text palette: blue \#0000AA (panels, editor), cyan \#00AAAA (menus, cursor bar, key labels), light cyan \#55FFFF (file text), yellow \#FFFF55 (headings, selection), light grey \#AAAAAA (dialogs, Borland menu bar), white \#FFFFFF, black \#000000, dark grey \#555555, red \#AA0000 (Borland hot keys). Roles checked against screenshots on the Birman page and a Commons Turbo C++ screenshot.

**Lettering.** IBM VGA ROM font, code page 437: double and single box-drawing for frames and rules, block and shade characters for scroll bars. In a README these are Unicode box-drawing characters in a pre block. In the SVG, draw frames as paths or rects (do not rely on box glyphs in a fallback font) and pin each text row to the grid with textLength.

**Motion.** The cursor bar steps down the file list one row at a time; the prompt cursor blinks; optionally a grey Copy dialog pops up with a block-character progress bar that fills, then closes. Everything moves in whole character cells with stepped timing.

**As a README header.** Text-only: an exactly 80-column pre block; the left panel lists the repo's real top-level files and folders (links work inside an HTML pre), the right panel is an info sheet with version, licence, language and counts, and the bottom row is the navigation ('1Docs 2Install 3Usage ... 10Quit'). SVG: the same layout in blue, cyan and yellow with a stepping cursor bar. Best: SVG above the fold, text version below as the linked table of contents. Own-made illustration of the frame technique: a top border like '╔══ C:/REPO ══╗', a row like '║ readme   md │ 4096 ║', a bottom border like '╚═════════════╝'. Borland variant: a blue editor window showing a short usage snippet, grey menu bar whose items are README sections, and a compile-result dialog.

**How to build it.** Text version: plain characters, every line padded to the same width. SVG version: rects for the blue field, frames and cursor bar; text rows on a fixed cell grid with textLength; cursor bar moved by translate keyframes with steps(n); prompt blink with steps(1); dialog toggled by stepped opacity with a rect whose width steps. One 80x25 renderer also serves the POST, SETUP and blue-screen styles.

**Do not copy / caveats.** Do not use the Norton name, Symantec or Borland branding, or the exact strings of any one product; the twin-panel arrangement and the blue IDE window have been cloned for decades and are generic. The text-only version is monochrome and loses the blue that makes it recognisable. Box-drawing alignment depends on the viewer's monospace font and 80 columns scroll sideways on phones. Screen readers read box characters as noise: give the SVG real alt text and keep one plain sentence under the block. QBasic's similar blue editor was not screenshot-checked.

**References**

- [Wikipedia: Norton Commander (John Socha, 1984 start as Visual DOS, 1986 release, 5.51 in 1998, clones)](<https://en.wikipedia.org/wiki/Norton_Commander>)
- [Ilya Birman, UI Museum: Norton Commander 5.0, screen-by-screen walkthrough of panels, menus, dialogs, shadows and key bar, with screenshots](<https://ilyabirman.net/meanwhile/all/ui-museum-norton-commander-5-0/>)
- [Wikipedia: Midnight Commander (1994, Miguel de Icaza, written as a clone, GPL)](<https://en.wikipedia.org/wiki/Midnight_Commander>)
- [Wikipedia: Color Graphics Adapter (the 16 text colours with hex values, 80x25, blink attribute)](<https://en.wikipedia.org/wiki/Color_Graphics_Adapter>)
- [Wikipedia: Turbo Pascal (blue editor background from 5.0 in 1988; Turbo Vision, mouse and windows in 6.0, 1990; syntax highlighting in 7.0, 1992)](<https://en.wikipedia.org/wiki/Turbo_Pascal>)
- [Wikipedia: Turbo Vision (text-mode UI framework behind the Borland IDEs; C++ source released to the public domain around 1997)](<https://en.wikipedia.org/wiki/Turbo_Vision>)
- [Wikimedia Commons screenshot of the Turbo C++ IDE (grey menu bar, red hot letters, blue editor, cyan scroll bars, grey status row)](<https://en.wikipedia.org/wiki/File:Turbo_CPP_Compiler.jpg>)

---

<a name="mach-04"></a>

## mach-04 · PC power-on: BIOS POST screen

**Text + SVG** · build: **Easy** · impact: **3/5** · 1993 to about 2000; IBM PC clones, modelled on the Award 4.50/4.51 layout (4.50G 1993, 4.51PG 1995 to 1997, 6.00PG April 1998), before vendor splash logos hid the text

The black text screen a 1990s PC showed while it named the CPU, counted memory and found the drives. The Award layout is the one most people picture: a small vendor mark top-left, the yellow-and-green energy-saving logo top-right, a climbing memory count and a setup-key prompt at the bottom. Memory counts on screen go back to the IBM XT; full tests were dropped as RAM grew.

**What it looks like**

- 80x25 text mode, light grey on black
- Rows 1 and 2: BIOS name/version line and a copyright line, with a small two-row vendor mark occupying the first three character cells in bright blue
- Top-right corner: a logo about 17 cells wide and 6 rows tall drawn by redefining character glyphs, in yellow and green
- Row 4: a motherboard identification line; row 6: CPU type and clock speed
- A memory test line whose number climbs in 1024K steps and stops with OK
- Device detection lines appearing one at a time with a pause on each
- Bottom-left: a prompt naming the key that enters setup and the key that skips the memory test, above a long date-and-ID string
- Hard clear to the operating system's boot text

**Palette.** VGA text attributes per the ncot.uk recreation: light grey \#AAAAAA on black \#000000 (attribute 0x07) for text; light blue \#5555FF (0x09) for the three-cell vendor mark; yellow \#FFFF55 (0x0E) and green \#00AA00 (0x02) for the corner logo; white \#FFFFFF for highlights.

**Lettering.** VGA ROM font, code page 437, 80 columns. Vendor lines are mixed case; status lines are terse 'Label : value' pairs. Both logos are custom glyphs loaded into the upper half of the character set (from code 128), so they sit on the 8x16 cell grid: design the project badge the same way, as a block of 8x16 cells.

**Motion.** Whole lines appear at once (a BIOS prints lines, it does not type them); the memory counter runs up fast and stops on OK; a short pause on each detection line; a blinking underline cursor; hard clear. Optionally one DOS-extender banner line flashes past before the 'program' starts.

**As a README header.** The boot log is the project summary: a name/version line and copyright line at the top with an original three-cell mark, an original corner badge top-right, 'label : value' rows for language, dependencies and size, a counter row that climbs to a real number (tests, items, downloads) and says OK, and a bottom prompt naming the install command. Text-only: the finished log as a static code block. SVG: the same log arriving line by line with the counter running. Keep it grey-on-black VGA with no glow and a corner badge so it does not read as the existing phosphor terminal.

**How to build it.** Each line is a text element switched on by opacity keyframes with steps(1) and a staggered delay. The counter cannot change text without script, so use an odometer: a vertical strip of pre-written values inside a clipPath moved with translate and steps(n). Badge as pixel rects on the 8x16 grid. Very small file.

**Do not copy / caveats.** Award, AMI and Phoenix names, the vendor medallion and the Energy Star mark are trademarks (the last is a US government certification mark): invent a vendor string and draw original marks. Do not reproduce a real BIOS screen line for line. It is the quietest style here and the closest in concept to the existing phosphor terminal (both are boot logs), so it depends on good copy and on the badge and counter. The end date of the text-POST era is approximate.

**References**

- [ncot.uk: recreating the Award boot screen in DOS: redefined-character logo (17x6 cells at column 60), attributes 0x07/0x09/0x0E/0x02, 1024K memory count, line layout](<https://ncot.uk/projects/lets-recreate-a-90s-pc-bios-boot-screen/>)
- [DOS Days: Award BIOS history (4.50G 1993 new black startup screen and first Energy Star logo; blue medallion top-left on some; 4.51PG; 6.00PG April 1998; Phoenix merger)](<https://dosdays.co.uk/topics/bios_award.php>)
- [Wikipedia: Power-on self-test (memory count from the IBM XT, beep codes, later logo splash screens)](<https://en.wikipedia.org/wiki/Power-on_self-test>)
- [Wikipedia: DOS/4G (Rational Systems, 1991; DOS/4GW bundled with Watcom C; start-up messages before Doom and other games)](<https://en.wikipedia.org/wiki/DOS/4G>)
- [Wikipedia: Color Graphics Adapter (hex values for the 16 text colours)](<https://en.wikipedia.org/wiki/Color_Graphics_Adapter>)

---

<a name="mach-05"></a>

## mach-05 · DOS game SETUP.EXE: sound card configuration dialog

**Text + SVG** · build: **Easy** · impact: **3/5** · About 1991 to 1997; MS-DOS games and demos before plug and play (checked against the setup program shipped with The Ultimate Doom, version 1.9, 1995)

DOS had no hardware detection, so every game shipped a text-mode setup program that asked which sound card you owned and then its port, IRQ and DMA. Choosing wrong meant silence, which is why a generation remembers the card list and the numbers. It is the most honest way to say 'chiptune' in a silent medium: the screen where you chose what the music would be played on.

**What it looks like**

- 80x25 text mode; top row a light-grey bar with the program title at the left and a copyright notice at the right; bottom row a plain grey bar
- Backdrop filled with a shade character so it reads as a dithered blue-and-grey field, not a flat colour
- A light-grey 'current configuration' panel near the top listing controller, music device and sound-effects device in dark text
- Stacked blue windows with light-cyan line frames, each with its title centred in a grey bar
- White option text with a full-width light-grey highlight bar on the current choice
- Key hints along each window's bottom edge: the key name in bright green, then '=Action' in white
- Solid black drop shadows offset one row down and two columns right
- Small numeric pick-lists: ports 210 to 280, IRQ 2/5/7, DMA 0/1/3/5/6/7
- The card list reads like a period catalogue: PC speaker, FM card, wavetable cards, General MIDI, 'no music'

**Palette.** CGA/VGA text colours: blue \#0000AA (windows), light grey \#AAAAAA (bars, highlight, config panel), light cyan \#55FFFF (frames), white \#FFFFFF (options), light green \#55FF55 (key names), dark grey \#555555 (panel text), black \#000000 (shadows). The Doom Wiki reportedly documents a custom dark blue (\#041441) in earlier setup versions; that page sits behind a bot check and was not opened.

**Lettering.** VGA ROM font, code page 437; single-line box-drawing frames; the medium shade character for the backdrop; short mixed-case labels; bare hex and decimal values.

**Motion.** The highlight bar walks down the device list and stops on one; the window is replaced by Port, then IRQ, then DMA, each with the bar landing on a value while the grey configuration panel updates; a 'testing' row shows a small level meter of block characters bouncing as the visual stand-in for the test sound; a final line confirms the settings were saved.

**As a README header.** One stacked-window composition on the dithered field, 80 columns by 14 to 16 rows. The grey panel is the project's 'current configuration' (version, licence, runtime); the device list is something real (supported platforms, back ends, output formats) or an invented sound-device list as a joke; the Port/IRQ/DMA pick-lists become three short option lists; the key-hint row carries the install command. Text-only works with box-drawing frames and shade characters; the SVG adds colour and the walking highlight bar. Pairs naturally with a tracker or oscilloscope strip from another family.

**How to build it.** Rect fills on a character grid; the backdrop as a 2x2 checker &lt;pattern&gt;; highlight rect moved with translate and steps(); window swaps by stepped opacity on groups; the level meter as three or four rects with stepped height keyframes. Shares the 80x25 renderer with the commander, POST and blue-screen styles.

**Do not copy / caveats.** Sound Blaster, Gravis UltraSound, AdLib, Roland and Doom are trademarks: invented parody card names are safer and funnier. Do not copy any one game's setup layout or strings; stacked text-mode windows with shadows are generic. It is a second blue DOS text UI next to the commander, so ship one or keep this clearly the 'stacked dialog' layout. Wikipedia's claim that 6000 UltraSound cards were given to scene groups carries a citation-needed tag and is left out. Details here are from one game's version 1.9 screenshots; other games' setup programs varied.

**References**

- [DOS Days: Doom page with the supported card list, the nine setup screens in order, and screenshots of each](<https://www.dosdays.co.uk/topics/Games/game_doom.php>)
- [DOS Days screenshot: 'select music card' window (layout, colours, shadows, key hints as described above)](<https://www.dosdays.co.uk/media/games/doom/setup2.png>)
- [Wikipedia: Sound Blaster (1989, Yamaha YM3812 OPL2, AdLib compatibility)](<https://en.wikipedia.org/wiki/Sound_Blaster>)
- [Wikipedia: Gravis UltraSound (1992, sample-based synthesis, hardware mixing suited to MOD/S3M/XM trackers, demoscene adoption)](<https://en.wikipedia.org/wiki/Gravis_UltraSound>)
- [Wikipedia: Miles Sound System (John Miles, 1991, originally the Audio Interface Library; driver layer behind many DOS games)](<https://en.wikipedia.org/wiki/Miles_Sound_System>)
- [Wikipedia: Color Graphics Adapter (hex values for the text colours)](<https://en.wikipedia.org/wiki/Color_Graphics_Adapter>)

---

<a name="mach-06"></a>

## mach-06 · Teletext page (Ceefax era, BBC Micro MODE 7)

**Animated SVG** · build: **Medium** · impact: **4/5** · Broadcast teletext 1974 to 2012 in the UK (Ceefax from 23 September 1974, ORACLE experimental from 30 June 1975, eight-colour Level 1 in 1976); BBC Micro MODE 7 from 1981; art revival from 2012 (International Teletext Art Festival, Block Party)

> Same style as [ansi-08](ansi.md#ansi-08), researched twice. Kept here for the extra detail.

A 40-column page of text and chunky block graphics in eight pure colours, sent in spare lines of the TV signal and called up by three-digit page number. For British and many European viewers it is instantly recognisable, and it has a living art scene with its own editors, festivals and a prize-winning BBC Micro demo made entirely in teletext mode.

**What it looks like**

- 40x24 character grid in broadcast (40x25 on the BBC Micro, where each cell is 12x20 px for a 480x500 screen)
- Eight colours only: black, red, green, yellow, blue, magenta, cyan, white
- Mosaic graphics: each cell split into a 2x3 block of 'sixels', in contiguous form or separated form (gaps between blocks)
- Colour and mode changes are control codes that each occupy a cell and show as a blank, so every colour change costs a visible space
- Header row with page number, service name, date and a running clock
- Double-height text for headlines; flash; conceal/reveal
- Letterforms on a 5x9 matrix smoothed on the diagonals to 10x18, giving rounded-pixel characters
- Index pages organised by number range (100s news, 300s sport, 400s weather, 888 subtitles) and a bottom row of four coloured link words (red, green, yellow, blue)

**Palette.** The eight corners of the RGB cube: \#000000, \#FF0000, \#00FF00, \#FFFF00, \#0000FF, \#FF00FF, \#00FFFF, \#FFFFFF. Usually a black page with coloured text and solid bands behind headings. The original Level 1 standard had no way to set black foreground text.

**Lettering.** The Mullard SAA5050 character set: 5x9 matrix interpolated to 10x18 inside a 12x20 cell. Bedstead is an outline recreation whose generator program and new glyphs are public domain. The SVG cannot load fonts, so emit the needed glyphs as paths. Headlines are the same glyphs at double height; big logos are built from mosaic blocks, not letters.

**Motion.** A header clock that ticks; a page counter rolling through numbers as if waiting for the page to come round; one flashing word at about one flash per second; the page painting in row by row from the top; sub-pages swapping in a slow carousel; a 'reveal' uncovering a hidden line.

**As a README header.** SVG at 480 logical px wide, cropped to the top 10 to 14 rows. Row 1 is the header: a page number, the project name as the service name, date and clock. Below it, the project name as a mosaic-block logo on a coloured band, a double-height one-line pitch, then an index where README sections have page numbers (Install 101, Usage 102) and a bottom row of four coloured link words. Repeat the index as real Markdown links under the image. A text-only version with quadrant block characters is a weak fallback: it loses the colour and the 2x3 shapes.

**How to build it.** Rendering is simple: a 40-column grid of 12x20 cells; mosaics as rects (merge horizontal runs); double height as scaleY(2) on a row group; flash as a steps(1) opacity keyframe; clock and page counter as clipped number strips moved in steps; row-by-row paint as a stepped clipPath. The effort is in the generator: a 5x9 glyph table with the diagonal-smoothing rule, a mosaic logo builder, and enforcing 'a colour change costs one blank cell', which is what makes it look authentic rather than merely blocky.

**Do not copy / caveats.** Do not use BBC, Ceefax, ORACLE or Teletext Ltd names and logos, and do not copy real broadcast pages or any artist's work; the grid, palette and mosaic technique are free to use. The Bedstead author believes the original chip font is effectively public domain in the UK but says he is not a lawyer. Pure blue on black is nearly unreadable and flash is a photosensitivity concern: avoid blue text and keep flashing slow and small. Recognition is strong in the UK and parts of Europe, weak in North America. Unicode sextant characters exist for a text version but font coverage is unreliable.

**References**

- [Wikipedia: Teletext (40x24 grid, eight colours from 1976, 2x3 mosaics, effects, header with page number and clock, Ceefax and ORACLE dates)](<https://en.wikipedia.org/wiki/Teletext>)
- [Wikipedia: Mullard SAA5050 (5x9 to 10x18 smoothing, 12x20 cell, 480x500, machines using it, no black foreground)](<https://en.wikipedia.org/wiki/Mullard_SAA5050>)
- [Wikipedia: Ceefax (1974 to 2012, page ranges, Pages from Ceefax)](<https://en.wikipedia.org/wiki/Ceefax>)
- [BBC BASIC teletext generator manual: 24 rows of 40, the 25th row for fastext coloured-key labels, every control code explained](<https://www.bbcbasic.co.uk/tccgen/manual/tcgen2.html>)
- [edit.tf: browser teletext editor that stores the page in the URL; shows every attribute](<https://edit.tf/>)
- [Hyperallergic (2014) on the third International Teletext Art Festival in Berlin, organised by the Helsinki collective FixC, first held 2012; artists named include Dan Farrimond, Raquel Meyers, LIA, Kim Asendorf](<https://hyperallergic.com/the-retro-aesthetics-of-teletext-art>)
- [Teletext Archaeologist: Block Party 2018, naming Horsenburger (Steve Horsley), Dan Farrimond, Carl Attrill, Alistair Cree, Raquel Meyers](<https://teletextarchaeologist.org/2018/08/block-party-2018-bloktoberfest/>)
- [Pouet: Teletextr by Bitshifters, BBC Micro, 1st in oldskool demo at NOVA 2017](<https://www.pouet.net/prod.php?which=70465>)
- [Demozoo: Teletextr credits (code KieranHJ, graphics Horsenburger, 24 June 2017)](<https://demozoo.org/productions/173427/>)
- [Bedstead: outline font family based on the SAA5050 characters; generator and new glyphs public domain](<https://bjh21.me.uk/bedstead/>)
- [BeebWiki: MODE 7 (40x25, 78x75 block graphics, 1 KB of screen memory, in-line control codes)](<https://beebwiki.mdfs.net/MODE_7>)

---

<a name="mach-07"></a>

## mach-07 · Game Boy DMG boot: logo drop on a four-shade green LCD

**Animated SVG** · build: **Easy** · impact: **4/5** · 1989 onward; Nintendo Game Boy, original DMG model (Japan 21 April 1989, North America 31 July 1989, Europe 28 September 1990); the 1996 Pocket has a true black-and-white screen

On power-up the original Game Boy scrolls a logo slowly down from the top of its small green-tinted screen, stops it in the middle and plays a two-note chime. The four olive shades and the visible pixel grid of that LCD are among the most recognisable looks in gaming. The boot ROM reads the logo from the cartridge and locks up if it does not match its own copy, which is exactly why that logo must never be reproduced.

**What it looks like**

- 160x144 pixels, 10:9
- Exactly four shades, from a pale yellow-green 'off' colour to a dark green-black
- A 1-bit wordmark stored as 48 bytes (48x8 pixels), drawn at double size (96x16) and descending from the top edge to the centre
- Visible pixel grid: each pixel a small square with a lighter gap in the LCD-off colour around it
- Slow LCD response: moving things leave a ghost trail
- Everything built from 8x8 tiles; at most 10 sprites on a line
- A hard pause after the logo lands, then a cut to the game's own title screen

**Palette.** No official RGB: the hardware has four shade indices on a green-tinted reflective STN panel. The bgb emulator's default palette (Lospec): \#081820, \#346856, \#88C070, \#E0F8D0. bgb's author separately describes a 'DMG reality' scheme sampled from a real unit by colour-corrected photography, but publishes no hex values for it.

**Lettering.** No system font: each game carries its own 8x8 tile font, usually uppercase with 1-pixel strokes. For the README, draw the project wordmark as an original 1-bit bitmap about 48x8 and double it, and set body text in an original 8x8 tile font.

**Motion.** The wordmark slides straight down at constant speed from above the top edge to the vertical centre (duration not documented; two to three seconds reads right), holds for a beat where the chime would be, then a hard cut to a title card with a blinking start prompt. A faint trailing copy sells the LCD ghosting.

**As a README header.** All SVG. Either a 160x144 screen at 3x or 4x in the middle of a wide neutral bezel strip with project facts set left and right, or a cropped 160x72 'wide LCD' banner. The project name drops in as the wordmark, lands, and the screen cuts to a title card: tile-built logo, one line of pitch, a blinking start prompt that names the install command. Not suited to a text-only version.

**How to build it.** The drop is one translateY keyframe with linear timing and a hold. Pixel grid: a tiled &lt;pattern&gt; of 1-unit lines in the lightest shade at low opacity over the screen. Ghosting: a second copy of the wordmark delayed by a fraction of a second at low opacity (cheaper than a blur filter on moving content). Title swap with steps(1) opacity. Pixel art as merged rects with crispEdges; very small file.

**Do not copy / caveats.** Never reproduce the Nintendo logo bitmap or wordmark, the Game Boy name as branding, or the console's shell design; the logo check was built as a legal lock. Reusable: a four-shade green ramp, the 160x144 grid, a wordmark that drops in and pauses. The two lightest shades have very low contrast with each other, so text must be in the darkest shade. Palette values are an emulator convention, not manufacturer data. Drop duration is unconfirmed.

**References**

- [Pan Docs: Power-Up Sequence (logo unpacked to video memory and scrolled down, sound after, lock-up if the check fails, model differences)](<https://gbdev.io/pandocs/Power_Up_Sequence.html>)
- [Pan Docs: The Cartridge Header (48-byte logo at \$0104 to \$0133, scaled by 2 on monochrome models)](<https://gbdev.io/pandocs/The_Cartridge_Header.html>)
- [Copetti: Game Boy architecture (160x144, 8x8 tiles, 10 sprites per line, boot sequence)](<https://classic.copetti.org/writings/consoles/game-boy/>)
- [bgb 'reality' notes: how a real DMG screen looks (sampled shades, pixel-gap edge in the LCD-off colour, motion blur, contrast wheel)](<https://bgb.bircd.org/reality/index.html>)
- [Lospec: bgb default Game Boy palette with hex values](<https://lospec.com/palette-list/nintendo-gameboy-bgb>)
- [Wikipedia: Game Boy (release dates, reflective STN LCD, grey/green shades, Pocket's FSTN black-and-white display)](<https://en.wikipedia.org/wiki/Game_Boy>)

---

<a name="mach-08"></a>

## mach-08 · Arcade attract mode: high-score table and coin prompt

**Text + SVG** · build: **Easy** · impact: **4/5** · 1976 to mid 1980s coin-op raster games (Sea Wolf 1976, Space Invaders 1978, Star Fire December 1978, Pac-Man 1980)

When nobody is playing, a cabinet loops its title, a demo and the high-score list to pull in passers-by, with a prompt to insert a coin. Sea Wolf was the first game to use the term 'high score', Star Fire let players enter initials, and Asteroids took that idea from Star Fire and made the initials table famous. The look is a black screen, saturated uppercase 8x8 lettering and blinking text.

**What it looks like**

- Black screen with text in saturated single colours, one colour per line
- Uppercase monospaced lettering on an 8x8 pixel grid
- A score header across the top with player-score and high-score fields
- A ranked table: place, zero-padded score, three-letter initials
- A blinking coin or start prompt and a credit counter on the bottom row
- A loop that hard-cuts between title, demo and score table every few seconds
- Earliest machines: a monochrome picture tinted by strips of orange and green cellophane, so colour changes by horizontal band, not by object
- Portrait monitors on many classics (Pac-Man: 224x288, tube rotated 90 degrees)

**Palette.** Hardware-specific, no single canonical set: in practice pure black plus fully saturated white, red, yellow, cyan, green, magenta and orange, one per text row. For the cellophane look, white pixels under an orange band and a green band.

**Lettering.** 8x8 pixel, monospaced, mostly uppercase. Toshi Omagari's Arcade Game Typography (2019) documents about 250 such fonts from the 1970s to the 2000s, including thick-and-thin faces, scripts, heavy coloured extrusions and a pseudo-interlaced face, all inside the same grid. Draw an original 8x8 face: a single-colour sans with 1-pixel strokes for the table and a two-tone or extruded face for the title.

**Motion.** Coin prompt blinking about once a second with stepped timing; table rows appearing one by one; the title cycling through the palette; hard cuts between title card and score table; a score value rolling upward.

**As a README header.** The score table is the content: rank, score and initials become top contributors, headline features with numbers, or benchmark results; the high-score field in the header shows stars or the version; the blinking prompt carries the install command. Text-only: a centred fixed-width table in a code block, which reads well even in monochrome. SVG: the same in colour with blink and cuts. Layout options: a landscape banner, or a portrait 'monitor' centred between two side panels holding project facts.

**How to build it.** Text rows as pixel-glyph paths or rects on an 8x8 grid; blink with steps(1); row reveal with staggered opacity delays; colour cycling with stepped fill keyframes; title/table cut by toggling two groups; rolling score via a clipped number strip. No filters needed.

**Do not copy / caveats.** Do not copy any manufacturer's font pixel for pixel, any game logo or any character sprite (ghosts, invaders, ships); the table layout, blink and colour-per-row conventions are generic. Keep blinking at or below two flashes per second. The exact header and credit wording used on real cabinets is general knowledge, not quoted by the sources opened, so write your own labels.

**References**

- [Wikipedia glossary entry for attract mode (title screen, story, high-score list, demo play, originally to entice arcade passers-by)](<https://en.wikipedia.org/wiki/Glossary_of_video_game_terms>)
- [Wikipedia: Score (game) (Sea Wolf 1976 and the term 'high score', Star Fire December 1978 initials, Space Invaders and score-chasing)](<https://en.wikipedia.org/wiki/Score_(game)>)
- [Wikipedia: Asteroids (November 1979; the initials table was copied from Exidy's Star Fire)](<https://en.wikipedia.org/wiki/Asteroids_(video_game)>)
- [Wikipedia: Space Invaders (black-and-white picture with orange and green cellophane strips; image reflected over a painted moon backdrop)](<https://en.wikipedia.org/wiki/Space_Invaders>)
- [Wikipedia: Pac-Man (1980, 224x288, monitor rotated 90 degrees)](<https://en.wikipedia.org/wiki/Pac-Man>)
- [Toshi Omagari: Arcade Game Typography, the reference book on 8x8 arcade fonts](<https://tosche.net/non-fonts/arcade-game-typography>)
- [Creative Review: a visual history of arcade game typography, with named examples of extruded, script and pseudo-interlaced faces](<https://www.creativereview.co.uk/a-visual-history-of-arcade-game-typography/>)

---

<a name="mach-09"></a>

## mach-09 · 8-bit console title screen (NES / Famicom era)

**Animated SVG** · build: **Easy** · impact: **3/5** · 1983 to early 1990s; Nintendo Famicom (Japan, 15 July 1983) and NES (North America from October 1985)

The title card a cartridge game showed at power-on: a big tile-built logo, a one- or two-line menu with a small cursor, a copyright line and a blinking start prompt. It is separated from the arcade style because the hardware rules differ: colour is assigned in 16x16-pixel zones from four small palettes, which gives NES screens their particular blocky colour layout. Split out from the colleague's arcade entry, where it was a one-line variant.

**What it looks like**

- 256x240 frame built from 8x8 tiles (a 32x30 tile grid)
- Colour assigned per 16x16-pixel zone: each zone picks one of four background palettes, each palette being three colours plus one shared backdrop colour
- At most about 25 colours on screen from 54 usable, so a title card typically uses one flat backdrop colour and three or four small colour groups
- Artwork designed in 16x16 or 32x32 'metatiles' so that colour boundaries fall on the zone grid
- A large logo in the upper half made of tile-built block letters with a hard one- or two-pixel drop shadow or outline in a second colour (general knowledge, not from a fetched source)
- A short menu with a small sprite cursor to the left of the selected line, a copyright line, and a blinking start prompt (general knowledge)
- Sprites limited to 8 per scanline, so a row of many moving objects flickers

**Palette.** No canonical RGB: the console generates composite video directly and Nintendo never specified a reference monitor, so every hex set in circulation is one emulator's decode. Structure to respect: 64 palette entries of which 54 are distinct usable colours; one backdrop colour plus four background palettes of three colours and four sprite palettes of three. Pick any published emulator palette and state which one.

**Lettering.** Each game carries its own 8x8 tile font, almost always uppercase, single colour, 1-pixel or 2-pixel strokes; title logos are custom tile art, often two tiles tall per letter. Draw an original font and logo; respect the rule of three colours plus backdrop inside any 16x16 zone.

**Motion.** Logo slides or drops into place in whole-pixel steps; one palette entry cycles through three or four colours so the logo shimmers without any pixels moving; the menu cursor steps between lines; the start prompt blinks; after a pause, a hard cut to a demo-style second card and back.

**As a README header.** All SVG: a 256x240 card cropped to roughly 256x112 for a banner, or shown whole and centred between two flat side panels. Upper half: the project name as an original tile-built logo with a hard shadow; below: a two-line menu whose entries are the main README sections with a cursor on the first, a line for licence and year, and a blinking prompt that names the install command. Repeat the menu as real Markdown links under the image. A text-only version has nothing to offer.

**How to build it.** Pixel art as merged rects with crispEdges on a 256-unit grid. Palette cycling: give the cycling colour its own class and animate fill with a steps() keyframe. Cursor and logo movement with translate and steps(); blink with steps(1). The generator should validate the 16x16 zone rule (three colours plus backdrop per zone), since that constraint is what makes it look like the hardware rather than generic pixel art. Small file.

**Do not copy / caveats.** Do not copy any game's logo, font, characters or title layout, and do not use Nintendo, NES or Famicom names or the seal of quality; the resolution, zone-colour rule and title-card structure are generic. Recognition of real title screens comes from specific games' art, which cannot be borrowed, so a generic card is less striking than the other styles unless the logo art is strong. Title-card conventions described here are general knowledge; the search budget ran out before I could source them. Any hex values are an emulator's interpretation.

**References**

- [NESdev wiki: PPU palettes (backdrop plus four background and four sprite palettes; no single correct RGB palette; no reference monitor was specified)](<https://www.nesdev.org/wiki/PPU_palettes>)
- [NESdev wiki: PPU attribute tables (one byte per 32x32 px area, four 16x16 quadrants each choosing a palette; why games use 16x16 metatiles)](<https://www.nesdev.org/wiki/PPU_attribute_tables>)
- [Copetti: NES architecture (256x240, 8x8 tiles, 256-tile pattern tables, 8 sprites per scanline, 16x16 colour blocks)](<https://www.copetti.org/writings/consoles/nes/>)
- [Wikipedia: Nintendo Entertainment System (release dates, 256x240, 54 usable colours, up to 25 at once)](<https://en.wikipedia.org/wiki/Nintendo_Entertainment_System>)
- [Toshi Omagari: Arcade Game Typography, for the 8x8 lettering tradition these title fonts share](<https://tosche.net/non-fonts/arcade-game-typography>)

---

<a name="mach-10"></a>

## mach-10 · Vector arcade, Vectrex and XY oscilloscope: beam-drawn glowing lines

**Animated SVG** · build: **Medium** · impact: **5/5** · 1979 to 1984; Atari vector arcade games (Asteroids November 1979, Battlezone November 1980, Tempest October 1981 in colour, Star Wars 1983) and the Vectrex home console (late 1982 to February 1984). Oscilloscope variant: XY-mode 'oscilloscope music' from the 2010s (Jerobeam Fenderson and Hansi Raber, album 2016).

These displays have no pixels: the electron beam draws each line directly, so the picture is thin luminous strokes on black with no stair-stepping. Brightness depends on how slowly the beam moves, text is a handful of straight strokes, and colour on monochrome tubes came from plastic overlays. The oscilloscope variant is the same look in green, where the left and right audio channels drive the X and Y axes so the music draws the picture: a rare honest way to evoke sound in a silent header.

**What it looks like**

- Pure black screen with thin, sharp, glowing lines and no pixel structure
- Line brightness varies: brighter where the beam moves slowly
- Lettering built from a few straight strokes per character
- Flicker when a lot is on screen, because everything is redrawn 30 to 40 times a second
- Wireframe 3D objects in outline; a mountain horizon with an erupting volcano and crescent moon (Battlezone); a field of lanes seen down a tube (Tempest); grid lines on an approaching surface (Star Wars)
- Simple outline shapes: a triangular ship, irregular polygon rocks, small saucers
- Colour by overlay on monochrome tubes: Battlezone tints the lower four fifths green and the top fifth red; every Vectrex game shipped with its own translucent overlay sheet
- Oscilloscope variant: one continuous green trace forming Lissajous loops and rotating figures, on a faint measurement graticule

**Palette.** White phosphor on black for Asteroids, Battlezone and the Vectrex, with overlay tints (green and red zones on Battlezone); saturated coloured lines on the colour tubes (Tempest, Star Wars). No measured hex values were found. My own recipe: a near-white core such as \#EAF6FF with a wider cool-blue halo; for the overlay or oscilloscope look, a green core such as \#7CFF9B with a darker green halo.

**Lettering.** Single-stroke capitals built from straight segments, wide and geometric, often with open corners. The Hershey fonts (Dr Allen V. Hershey, Naval Weapons Laboratory, about 1967, designed for vector CRT rendering, publicly available with few restrictions) are a ready-made base for an SVG stroke alphabet; otherwise draw an original segment alphabet.

**Motion.** The beam draws the logo stroke by stroke; the finished picture holds with a faint brightness shimmer; wireframe objects drift and rotate; title text pulses slowly. One single-frame flicker now and then is enough. Oscilloscope variant: a closed trace morphs continuously between two or three figures.

**As a README header.** All SVG; no text-only form makes sense. A black banner where the project name is drawn on by the beam in stroke capitals, a smaller stroke tagline beneath, score-style counters in the top corners for version and stats, and one slowly rotating wireframe object that stands for the project. Optional two-zone tint (one colour for a top strip, another below) to echo overlay colour. Oscilloscope variant: a green trace that draws the project initials as one closed figure, beside a 'now playing' line.

**How to build it.** Draw-on: stroke-dasharray with stroke-dashoffset animated per path, staggered. Glow without heavy filters: stack each path three times at stroke widths of about 6, 3 and 1 with opacities of about 0.15, 0.35 and 1; if you use feGaussianBlur instead, keep the filter region tight and do not animate inside it, since blur on moving content is the main CPU cost. Bright vertices: round line caps or small circles at joints. In-plane rotation: animateTransform. Pseudo-3D rotation or figure morphing: SMIL animate on the path 'd' or polyline 'points' between precomputed frames with identical point counts. Stroke text needs a small segment-font table in the generator.

**Do not copy / caveats.** Do not reuse Atari or Vectrex names, logos, cabinet art, or the specific ship, saucer, tank and web designs, or any oscilloscope-music artist's figures; glowing strokes, wireframes and beam draw-on are generic techniques. Small stroke text is hard to read: keep body copy in Markdown below the image. Flicker and pulsing must be gentle. Phosphor colours are my own suggestion, not sourced. The brighter-dot-at-vertices detail is general knowledge; the source only says slower beam movement is brighter.

**References**

- [Wikipedia: Vector monitor (how the beam draws, brightness by beam speed, stroke text, refresh flicker, colour methods, games list)](<https://en.wikipedia.org/wiki/Vector_monitor>)
- [Wikipedia: Asteroids (1979, QuadraScan and the Digital Vector Generator; ship, rocks, two saucers)](<https://en.wikipedia.org/wiki/Asteroids_(video_game)>)
- [Wikipedia: Battlezone (1980, wireframe, green lower four fifths and red top fifth overlay, volcano and crescent moon, radar at top)](<https://en.wikipedia.org/wiki/Battlezone_(1980_video_game)>)
- [Wikipedia: Tempest (1981, Color-QuadraScan, lanes on a tube viewed from one end, Dave Theurer)](<https://en.wikipedia.org/wiki/Tempest_(video_game)>)
- [Wikipedia: Star Wars arcade (1983, 3D colour vectors; yellow grid lines on the Death Star approach spell out messages)](<https://en.wikipedia.org/wiki/Star_Wars_(1983_video_game)>)
- [Wikipedia: Vectrex (9-inch monochrome vector tube, per-game overlays, built-in Mine Storm, Smith Engineering, GCE, Milton Bradley)](<https://en.wikipedia.org/wiki/Vectrex>)
- [Game Developer: a history of the Vectrex (Jay Smith, overlays seated in grooves in front of the tube, brightness control)](<https://www.gamedeveloper.com/design/a-history-of-gaming-platforms-the-vectrex>)
- [Wikipedia: Hershey fonts (stroke fonts from about 1967 for vector CRTs, publicly available, SVG versions exist)](<https://en.wikipedia.org/wiki/Hershey_fonts>)
- [Oscilloscope Music (Jerobeam Fenderson and Hansi Raber): the audio signal is fed to an analogue oscilloscope, left and right channels on X and Y, drawing green glowing lines](<https://oscilloscopemusic.com/>)

---

<a name="mach-11"></a>

## mach-11 · Pinball dot-matrix display (orange plasma DMD)

**Animated SVG** · build: **Medium** · impact: **5/5** · 1991 to the late 1990s: Data East Checkpoint (February 1991, the first pinball DMD), Williams Gilligan's Island (May 1991) and Terminator 2 (July 1991), through WPC-95 (to October 1998)

The orange panel in the backbox of 1990s pinball machines showed scores, cartoon animations and mini-games on a grid of 128 by 32 glowing dots. It is a gas-plasma display, so every dot is a small round orange light on dark glass. Its 4:1 shape is already a banner and its attract loop (title, scores, start prompt) is already a header.

**What it looks like**

- 128x32 round dots as the standard; the first DMDs (Checkpoint and four other Data East games, 1991 to 1992) were 128x16; four Data East/Sega games of 1994 to 1995 used 192x64
- Monochrome orange glow from gas plasma
- Between 4 and 16 brightness levels per dot, made by rapidly switching dots on and off
- Round dots with dark gaps, so large filled shapes look like perforated sheet
- Several bitmap fonts at once: giant score digits beside a tiny status line
- Full-frame animations, wipes, scrolls, flashing award frames and 'video mode' mini-games (first on Terminator 2)
- An idle loop alternating game title, high scores and a start prompt

**Palette.** No measured values found. My own recipe for plasma: fully lit \#FF7A00, two or three dimmer steps at lower opacity, unlit dot about \#2A1200, glass near-black \#0A0400.

**Lettering.** Bitmap fonts designed on the dot grid at several heights (about 5, 7, 9 and up to the full 32 dots), heavy and condensed for scores, all uppercase for the small sizes. Draw original dot fonts at two or three heights.

**Motion.** Text scrolling in from the right in whole-dot steps; a big number counting up; a wipe or dissolve between frames; a flashing inverted frame for emphasis; a sparkle sweeping across the logo; the idle loop cycling three or four frames.

**As a README header.** One 4:1 SVG banner is the whole header. Frame 1: project name in tall dot letters with a sparkle pass. Frames 2 to 4: one stat each as a giant number with a small label. Last frame: a start prompt with the install command, held long enough to read. No real text-only equivalent.

**How to build it.** Two layers. Bottom: every dot unlit, as a tiled &lt;pattern&gt; of dim circles. Top: the lit content drawn as ordinary rects on the dot grid and shown through a &lt;mask&gt; filled with a tiled pattern of circles, so any shape becomes round dots without emitting 4096 elements. Optional soft halo: one feGaussianBlur copy under the lit layer. Move content with translate in steps() equal to the dot pitch so it always lands on the grid; art must be authored on the grid. Brightness levels are three or four fill opacities. Frame cycling by stepped opacity on groups. At a 6-unit pitch the banner is 768x192.

**Do not copy / caveats.** Do not use licensed table themes, manufacturer names or logos (Williams, Bally, Data East, Sega, Stern) or any real display animation; the dot grid, orange glow and frame-cycling idea are generic. Keep flash frames slow and brief. Dim shades can vanish on poor screens, so keep essential text at full brightness. All hex colours are my own suggestions.

**References**

- [Wikipedia: Checkpoint (Data East, February 1991, first pinball DMD, half-height 128x16)](<https://en.wikipedia.org/wiki/Checkpoint_(pinball)>)
- [Wikipedia: Terminator 2 pinball (first Williams game designed for a DMD, first video mode; Gilligan's Island shipped first)](<https://en.wikipedia.org/wiki/Terminator_2:_Judgment_Day_(pinball)>)
- [Wikipedia: Williams Pinball Controller (16-segment alphanumeric generation from FunHouse, September 1990; 128x32 dot matrix from May 1991; WPC-95 to October 1998)](<https://en.wikipedia.org/wiki/Williams_Pinball_Controller>)
- [PinWiki: Data East/Sega display boards by size (128x16, 128x32, 192x64) with the games that used each](<https://pinwiki.com/wiki/index.php/Data_East/Sega>)
- [ColorDMD: the original displays were monochrome gas plasma with an orange glow, introduced in 1991](<https://www.colordmd.com/About.html>)
- [Google Patents US8773452: pinball DMDs are most commonly 128x32, monochrome, with 4 to 16 intensity levels made by frame sequencing](<https://patents.google.com/patent/US8773452>)

---

<a name="mach-12"></a>

## mach-12 · VFD and segment-display front panel (hi-fi, VCR, calculator)

**Animated SVG** · build: **Easy** · impact: **4/5** · Vacuum fluorescent displays from 1959 (Philips DM160) and 1967 (first multi-segment device, Ise Electronics), peaking in the late 1980s at hundreds of millions of units a year; 14-segment gas-plasma displays on pinball machines 1986 to 1991; seven-segment LED and LCD digits from the 1970s onward

The glowing blue-green readout behind smoked glass on VCRs, car radios, microwaves and stacked hi-fi systems, and its cousins the red LED digit and the grey LCD calculator digit. These are not pixel grids: each character is a fixed set of segments that are either lit or faintly visible. Split out from the colleague's pinball entry because its geometry, colour and content differ, and because a hi-fi panel with a track ticker and level bars is the cleanest way in this family to suggest music without sound.

**What it looks like**

- Seven-segment digits: segments a to g plus a decimal point; hex B and D appear as lowercase b and d to avoid reading as 8 and 0
- 14- or 16-segment 'starburst' cells for letters: the seven segments plus four diagonals and a split centre bar
- Unlit segments stay faintly visible, so every position shows a ghost of the full figure
- Blue-green light from a phosphor peaking at 505 nm, often behind a filter that pushes it to deep green or deep blue
- Fixed annunciators (small words and symbols that are either on or off) in a second colour such as orange or red
- Level meters as stacks of short horizontal bar segments (general knowledge, not in a fetched source)
- LED variant: red digits on black; LCD variant: dark grey segments on a grey-green ground with no glow

**Palette.** No measured values found. My own recipes: VFD lit \#6FFFE9 with a wider halo of \#19C9B5, unlit segment about 8% opacity of the lit colour, glass \#061012; annunciators \#FF7A1A. Red LED: lit \#FF2A1A on \#120000. LCD: segments \#2B2F2A on \#A9B59A.

**Lettering.** The fixed seven-segment figure for digits (slanted a few degrees on most real parts, from general knowledge) and the starburst cell for letters, which can form the full basic Latin alphabet. Text is one character per cell with fixed gaps; no kerning, no lowercase on most panels.

**Motion.** Digits ticking like a clock or counter; a ticker moving through the alphanumeric cells one whole cell at a time; level bars bouncing in stepped heights; an annunciator blinking; a slow left-to-right power-on sweep that lights every segment once.

**As a README header.** A wide, short SVG panel (about 8:1): left, a starburst-cell ticker carrying the project name and pitch; centre, a row of level bars; right, seven-segment digits for version or a live-looking counter, with small annunciators for licence and build status. It sits well directly under another header as a 'now playing' strip. A text-only form is not worthwhile.

**How to build it.** Each digit is seven polygons (fourteen for a starburst cell) defined once and reused with &lt;use&gt;. Draw every cell twice: all segments at low opacity for the ghost, then the lit subset on top. Changing digits: stack the ten lit states in one cell and switch them with steps(1) opacity keyframes and staggered delays. Ticker: pre-render the message as cells and move the group by one cell pitch per step inside a clipPath. Level bars: rects whose height steps between a few values with different durations per column. Glow: one small feGaussianBlur on the static lit layer, or a wider low-opacity stroke.

**Do not copy / caveats.** Do not copy any manufacturer's panel layout, brand marks or format logos (the ones printed on real hi-fi and VCR fronts are trademarks); segment geometry is generic. Starburst letters are harder to read than real text, so keep the ticker short and repeat the information in Markdown. All colours are my own suggestions. The level-meter and slanted-digit details are general knowledge, not from a page I opened.

**References**

- [Wikipedia: Vacuum fluorescent display (1959 and 1967 origins, 505 nm phosphor, filters, segment and dot-matrix forms, VCR, car radio, microwave, calculator and hi-fi use, extra indicator colours)](<https://en.wikipedia.org/wiki/Vacuum_fluorescent_display>)
- [Wikipedia: Seven-segment display (segment names, technologies, how hex letters are formed)](<https://en.wikipedia.org/wiki/Seven-segment_display>)
- [Wikipedia: Fourteen-segment display (starburst layout, full alphabet, gas-plasma versions in pinball 1986 to 1991, VCR and car stereo use)](<https://en.wikipedia.org/wiki/Fourteen-segment_display>)
- [Wikipedia: Sixteen-segment display (14 segments plus comma and period on pinball displays)](<https://en.wikipedia.org/wiki/Sixteen-segment_display>)
- [Wikipedia: Williams Pinball Controller (16-segment alphanumeric displays on the 1990 generation)](<https://en.wikipedia.org/wiki/Williams_Pinball_Controller>)

---

<a name="mach-13"></a>

## mach-13 · Nokia-era 84x48 monochrome phone LCD

**Animated SVG** · build: **Easy** · impact: **3/5** · 1998 to the early 2000s; Nokia 5110 (April 1998) and 3310 (September 2000, 126 million sold), both 84x48 pixels

The tiny green-backlit screen of turn-of-the-century phones: 84 by 48 square pixels, five lines of text, a bitmap operator logo in the middle and Snake. It covers the LCD, pager and handset part of the brief and is distinct from the Game Boy style in being strictly two-tone and four times coarser.

**What it looks like**

- 84x48 pixels, 1.75:1, strictly two tones: dark pixels on a pale green backlit ground
- Five lines of text at most
- An operator logo of 72x14 pixels centred on the idle screen; picture messages of 72x28 pixels, which double as screensavers
- Signal-strength and battery indicators as stepped bar stacks at the left and right edges, and a soft-key label centred on the bottom row (general knowledge, not from a fetched source)
- Large square pixels with a hairline gap between them
- Snake: a one-pixel-wide-grid line creature turning at right angles toward a dot, from the 1998 game written by Taneli Armanto

**Palette.** No official values. Community palette on Lospec ('Nokia 3310', submitted by Marcos Padilha): \#C7F0D8 ground, \#43523D pixels. Most markets had a green backlight; some variants blue.

**Lettering.** A proportional bitmap menu font roughly 7 to 8 pixels tall plus a tiny status font (general knowledge). Draw an original 1-bit face; the project logo is a 72x14 bitmap, which is the real design constraint.

**Motion.** A snake crawls in from the left and traces around the logo; the logo arrives as if it were a picture message and wipes on; signal bars step up one at a time; text lines appear letter by letter; the screen ends on a static idle screen.

**As a README header.** All SVG. Either one 84x48 screen at 6x to 8x centred between flat side panels, or a custom wide LCD of 168x48 that keeps the pixel size and look. Idle screen: project logo as a 72x14 bitmap, version on the line below, a soft-key label naming the install command, bar indicators as simple stats. No text-only form.

**How to build it.** About 4000 pixels at most: emit lit pixels as merged rects with crispEdges, lay a &lt;pattern&gt; of hairlines over them for the pixel gap, and optionally offset a low-opacity copy by a fraction of a pixel for the LCD shadow. Snake: a polyline revealed with stroke-dashoffset in steps() so it advances one cell per tick, with a matching dash gap trailing behind to keep a fixed length. Bars and blinks with steps(1). Very small file.

**Do not copy / caveats.** Do not use the Nokia name or logo, operator logos, the ringtone, or the original Snake graphics and fonts; an 84x48 two-tone grid, a centred bitmap logo and a snake made of square cells are generic. Two tones and 48 rows leave little room: one logo and two short lines is the limit. Palette is a community approximation. Screen-furniture details are general knowledge because the search budget ran out.

**References**

- [Wikipedia: Nokia 3310 (September 2000, 84x48 monochrome LCD with 5 lines of text, green backlight, Snake II and other games, 126 million sold)](<https://en.wikipedia.org/wiki/Nokia_3310>)
- [Wikipedia: Nokia 5110 (April 1998, 84x48, Philips PCD8544 controller, Snake)](<https://en.wikipedia.org/wiki/Nokia_5110>)
- [Wikipedia: Smart Messaging (operator logo 72x14, picture message 72x28, logo sits mid-screen, picture message as screensaver)](<https://en.wikipedia.org/wiki/Smart_Messaging>)
- [Wikipedia: Snake (1998 video game) (Taneli Armanto, Nokia 6110 and 5110)](<https://en.wikipedia.org/wiki/Snake_(1998_video_game)>)
- [Lospec: Nokia 3310 two-colour palette](<https://lospec.com/palette-list/nokia-3310>)

---

<a name="mach-14"></a>

## mach-14 · Windows 9x text-mode blue screen

**Static SVG** · build: **Easy** · impact: **3/5** · 1995 to 2000 (Windows 95, 98, Me), with the Windows NT 'STOP' screen as a variant (NT 3.1 onward)

> Same style as [vap-08](vap.md#vap-08), researched twice. Kept here for the extra detail.

The most widely recognised error screen in computing: a full blue 80x25 text screen with white text, a small inverted title in the middle and a line asking you to press a key. The colleague researched it and left it out; it is added here because it is instantly recognisable, trivial to build, and no worse as a joke than the Guru Meditation banner, provided the wording is original.

**What it looks like**

- 80x25 text mode at 720x400, the whole screen one flat blue
- White VGA text throughout
- A one-word title centred on its own row in inverted colours: blue text on a light-grey bar only as wide as the word plus one space each side
- A left-aligned body block of five or six short lines starting about ten columns in, with blank rows between paragraphs
- One line of hex fields separated by colons
- A centred last line asking for a key press, ending in a blinking underscore cursor
- NT variant: text starts at the top-left with a line beginning with three asterisks and a stop code followed by four hex parameters, then a dense dump; no title bar

**Palette.** 9x: VGA blue \#0000AA, white \#FFFFFF, light grey \#AAAAAA for the title bar (text-mode colours; the blue and white were user-configurable in SYSTEM.INI). NT variants per Wikipedia: \#0000A8 for NT 3.1 to 4.0, \#000080 for Windows 2000 to 7, \#0078D7 for Windows 10 (1607 to 22H2).

**Lettering.** VGA ROM font, 9x16 cells at 720x400, mixed case, no box-drawing at all. In SVG use monospace text pinned with textLength on an 80-column grid, or pixel-glyph paths.

**Motion.** Almost none: the blinking cursor after the key-press line. Optional: the screen snaps in after a half-second of black, as a real one does.

**As a README header.** One blue SVG banner, 80 columns by 12 to 14 rows: the project name in the inverted centred title bar, a body block in your own words that states what the project does as if it were the 'error', one hex line carrying version and commit, and the install command on the key-press line. A pre-block text version keeps the layout but without the blue it is not recognisable, so it is not worth shipping alone.

**How to build it.** One blue rect, one grey rect behind the title, a dozen text rows pinned to a cell grid with textLength, and an optional steps(1) blink on the cursor. Uses the same 80x25 renderer as the other DOS styles. A few kilobytes.

**Do not copy / caveats.** Do not use the Windows or Microsoft names or reproduce the original message text; a blue text screen with a centred inverted title is generic, the wording is not. A crash screen as a header risks reading as 'this project is broken', and the project already has the Guru banner as a crash joke, so ship at most one of the two. Later sad-face and QR-code versions are much closer to protected product design and should be avoided.

**References**

- [Wikipedia: Blue screen of death (9x screens are 80x25 text at 720x400 with white on blue, configurable; NT colours by version; design history)](<https://en.wikipedia.org/wiki/Blue_screen_of_death>)
- [Wikimedia Commons: Windows 9x blue screen image (layout as described above)](<https://upload.wikimedia.org/wikipedia/commons/3/3b/Windows_9X_BSOD.png>)
- [Wikipedia: System crash screen (survey of crash screens, including the ST's row of bombs and the Guru Meditation)](<https://en.wikipedia.org/wiki/System_crash_screen>)
- [Wikipedia: Color Graphics Adapter (hex values for the text colours)](<https://en.wikipedia.org/wiki/Color_Graphics_Adapter>)

---

<a name="mach-15"></a>

## mach-15 · SNES Mode 7: rotating textured ground plane

**Animated SVG** · build: **Hard** · impact: **4/5** · 1990 to the mid 1990s; Super Nintendo / Super Famicom (F-Zero 1990, Super Mario Kart, Final Fantasy VI overworld)

Mode 7 lets the console rotate and scale one background layer, and by changing the scale on every scanline it turns that flat map into a ground plane receding to a horizon. The memorable part is that the whole world swings around the player while the vehicle stays fixed on screen. The brief named it and the colleague did not research it; it is the one hard, high-reward style in this family.

**What it looks like**

- 256x224 frame: a band of sky above a horizon line, the lower part one flat textured plane
- The plane is a single tile map: pixels are many screen pixels wide near the camera and shrink to shimmer near the horizon
- The whole plane rotates and slides around a fixed viewpoint; nothing on the plane stands up
- Only one transformed layer exists, so vehicles, objects and the status display are flat sprites drawn on top and never rotate with the ground
- A different scale on every scanline, so horizontal bands are faintly visible when the map has strong straight edges
- Up to 256 colours on screen from 32,768

**Palette.** Free: 256 on-screen colours from a 15-bit master palette, so there is no fixed palette to match. The look comes from flat, saturated map colours (a track in one colour, a border stripe, a contrasting infield) and a two- or three-band sky.

**Lettering.** None of its own; status text is ordinary 8x8 sprite lettering. The opportunity is to write the project name on the ground as part of the map, in large block letters that sweep past as the plane turns.

**Motion.** The map rotates slowly about the viewpoint and scrolls forward, so lettering painted on the ground swings into view, passes under the camera and leaves; a small fixed sprite sits at bottom centre; the sky does not move.

**As a README header.** All SVG: a 256x112 to 256x144 banner. Top quarter: flat sky bands with the version and one stat as status text. Below: the rotating plane, whose map is an original 'track' with the project name painted along it. The pitch and links go in Markdown underneath, since nothing on a moving floor is readable for long.

**How to build it.** SVG transforms are affine for a whole element, so reproduce the hardware trick literally: cut the floor into 50 to 60 horizontal strips two units tall; each strip is a group with its own clip-path rect, then translate(centre, y) scale(s) with s fixed per strip and growing linearly with distance below the horizon, then a group with a shared CSS rotate keyframe, then a group with a shared translate keyframe for the camera path, then a &lt;use&gt; of the one map defined in &lt;defs&gt;. Every strip reuses the same two @keyframes, so the file stays small, but the browser redraws the map once per strip per frame: keep the map under about 40 simple shapes and measure CPU before shipping. Cheaper fallback with no rotation: a checker or stripe floor where each strip toggles between two phases with steps(1) and a negative animation-delay proportional to its depth. Do not rely on CSS 3D perspective transforms on SVG content; support inside an image-embedded SVG is inconsistent (general knowledge, test before use). Add prefers-reduced-motion to freeze on a composed frame.

**Do not copy / caveats.** Do not use Nintendo, SNES or game names, or any game's track layouts, vehicles or status-display design; per-scanline scaling of a flat map is a generic technique. Continuous rotation can cause motion discomfort: keep it slow and respect reduced-motion. Without rotation it looks like the grid-to-horizon floor that a synthwave or vaporwave style will already have, so it only earns its place if the rotation works. Not prototyped: the performance of 50-plus clipped, animated copies on GitHub's README page is the open risk.

**References**

- [Wikipedia: Mode 7 (rotation and scaling of one background layer, per-scanline affine transforms for a receding plane, single-layer limit, games)](<https://en.wikipedia.org/wiki/Mode_7>)
- [Wikipedia: F-Zero (1990; a single layer scaled and rotated around the vehicle; the circuit moves around the car)](<https://en.wikipedia.org/wiki/F-Zero_(video_game)>)
- [Copetti: Super Nintendo architecture (256x224, 256 of 32,768 colours, Mode 7 as one 8-bit layer with affine transform adjusted per scanline via HDMA)](<https://www.copetti.org/writings/consoles/super-nintendo/>)

---

## Considered and left out

- None of the colleague's ten styles was dropped outright. The NES title card was split out of the arcade entry, and the VFD and segment displays were split out of the pinball entry, because each has different geometry, colour and content mapping.
- BBC Micro, Amstrad CPC, MSX and Atari 8-bit boot banners: not added. Each is a one-screen 'system name, memory, Ready prompt' banner, which restates the existing C64 boot style with a different palette. The BBC Micro's distinctive look (MODE 7) is already covered by the teletext style.
- Apple II 40-column green or amber text: not added. It is the existing green-phosphor terminal style at lower resolution.
- LILO / GRUB / Linux boot log and a bare MS-DOS prompt: not added. Both are scrolling boot text and restate the existing terminal style; the BIOS POST entry is already the closest tolerable neighbour.
- BIOS setup (CMOS) screen: not added as a style. It is a blue text-mode menu that duplicates the commander and SETUP entries and I did not research it.
- QBasic editor as its own style: folded into the Borland blue IDE variant of the commander entry. The QBasic screenshot did not load for checking, so no QBasic-specific details are claimed.
- Atari ST GEM desktop and bombs: not added as a style. The bombs are confirmed (count equals the error; mushroom clouds in TOS 1.0) but are a one-line gag, and I could not source the GEM desktop colours. Usable as a small flourish inside another header.
- PlayStation and Sega start-up screens, and PlayStation memory-card screens: not added. The start-up sequences are animated trademarks with nothing reusable once the logo is removed.
- Cartridge labels and box-art layouts: not added. They are static print designs dominated by trademarked seals and logos, not screens, and belong with a packaging or print family if anywhere.
- LCD calculators and pagers as separate styles: folded in. Calculator digits are the LCD variant of the segment-panel style; a pager's one-line dot display is covered by the Nokia LCD and pinball dot-matrix entries.
- Standalone oscilloscope style: folded into the vector entry as the green XY-trace variant, since the drawing technique is identical.
- Later Windows stop screens (sad face, QR code): excluded from the blue-screen style as too close to current product design.
