# Trackers and chiptune visuals

<sub>Generated from <code>styles.json</code> by <code>tools/build-styles.mjs</code>. 11 styles, researched 2026-09-30. Checked by a second reviewer, who made 28 corrections. [Back to the catalogue](README.md) · [Full index](INDEX.md)</sub>

## Reviewer's summary

Sound cannot play in a README, so this family is what module and chip music looks like on screen. After checking every reference (images were opened and looked at; three of the researcher's sampled palettes were re-measured by pixel count and matched exactly), the family holds up as eleven styles in four schools. (1) Sample trackers: the Amiga line (Ultimate Soundtracker Dec 1987, NoiseTracker 1989, ProTracker 1990/91 onward) with embossed grey panels over four black pattern windows; FastTracker II (Nov 1994) as a dense 640x400 DOS GUI; Scream Tracker 3 / Impulse Tracker / AdLib Tracker II as 80-column text-mode screens in gold, tan and navy. (2) Chip-specific trackers whose column headers are the hardware voices: LSDj on the Game Boy (160x144; PU1/PU2/WAV/NOI), GoatTracker for the three SID voices, and FamiTracker / DefleMask / Furnace with colour-coded fields. (3) Players rather than editors: Open Cubic Player's text-mode status header plus character-cell spectrum analyser, and the Winamp 2 stack. (4) YouTube-era visualisers: one oscilloscope per channel, and piano-roll / falling-note views up to black MIDI. A purely textual eleventh style, the module sample list used as a message board, was split out of the ProTracker entry because it is the only one that is native plain text. Shared grammar: a numbered row grid (NOT always hex: ProTracker, Scream Tracker 3, Impulse Tracker, GoatTracker, DefleMask and Furnace show decimal rows; FastTracker II, FamiTracker, LSDj and Cubic Player's pattern view show hex), one column per channel, a fixed highlighted play row the pattern scrolls under, and an instrument or sample list. That maps onto a repo as song title = repo name, channels = modules, sample list = dependencies or credits. One build constraint was verified directly: GitHub serves repo files from raw.githubusercontent.com with the header "Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox", so inline style blocks (and therefore CSS keyframes) are permitted but embedded data: fonts cannot be relied on and embedded data: images should be tested before use. Every pixel-font style here must therefore draw its glyphs as SVG paths (define once in defs, place with use, roughly 30-40 bytes per placed character) or accept the viewer's monospace font with textLength. None of the styles needs sound, scripts or external resources. Overlaps with the existing six to keep in mind: the Amiga cracktro style already has a tracker pattern strip, and the keygen dialog already has a spectrum analyser; the entries below say how each differs.

## Styles

| ID | Style | Medium | Build | Impact |
| --- | --- | --- | --- | --- |
| [trk-01](#trk-01) | Amiga 4-channel tracker (ProTracker 2.3D editor screen) | Animated SVG | Medium | 5/5 |
| [trk-02](#trk-02) | Module sample list as message board (text-only) | Text | Easy | 3/5 |
| [trk-03](#trk-03) | FastTracker II (dense DOS GUI tracker with scope grid) | Animated SVG | Medium | 4/5 |
| [trk-04](#trk-04) | DOS text-mode trackers (Scream Tracker 3 gold, Impulse Tracker tan, AdLib Tracker II navy) | Text + SVG | Easy | 4/5 |
| [trk-05](#trk-05) | LSDj phrase screen (Game Boy tracker), with the nanoloop grid as its minimalist opposite | Animated SVG | Easy | 4/5 |
| [trk-06](#trk-06) | SID tracker in plain text mode (GoatTracker three-voice screen) | Text | Easy | 3/5 |
| [trk-07](#trk-07) | Multi-chip tracker (FamiTracker / DefleMask / Furnace) | Animated SVG | Medium | 3/5 |
| [trk-08](#trk-08) | Open Cubic Player (DOS module player with text-mode spectrum analyser) | Text + SVG | Easy | 4/5 |
| [trk-09](#trk-09) | Oscilloscope view (one scope per channel) | Animated SVG | Easy | 4/5 |
| [trk-10](#trk-10) | Piano roll and falling notes (up to black MIDI) | Animated SVG | Medium | 3/5 |
| [trk-11](#trk-11) | Winamp 2 classic stack (player, equaliser, playlist) | Animated SVG | Medium | 4/5 |

---

<a name="trk-01"></a>

## trk-01 · Amiga 4-channel tracker (ProTracker 2.3D editor screen)

**Animated SVG** · build: **Medium** · impact: **5/5** · 1987-1993, Commodore Amiga. Ultimate Soundtracker (Karsten Obarski, December 1987), NoiseTracker (Mahoney and Kaktus, 1989; its screen reads 'Northstar - Silents 1989'), ProTracker (Lars Hamre, Anders Hamre, Sven Vahsen, Rune Johnsrud; first release 1990 per its own Wikipedia page, 1991 per the Ultimate Soundtracker page). The 2.3D screen carries the line 'Noxious January 1993'.

The editor nearly every Amiga demo, cracktro and game tune was written in: a grey embossed panel of numeric fields and buttons above four black pattern windows, one per hardware channel. It is the ancestor of every later tracker and the picture most people have in mind for 'a MOD tracker'. Distinct from the existing Amiga cracktro style, which only borrows a pattern strip: this is the whole workbench.

**What it looks like**

- Native 320x255 screen shown at 2x (640x510). Top-left stack of nine right-aligned labels, each followed by a 4-digit field and a pair of up/down arrow buttons: POS, PATTERN, LENGTH, FINETUNE, SAMPLE, VOLUME, LENGTH, REPEAT, REPLEN (sample length shows hex such as 1E00)
- A 3-column button grid to the right in wide embossed capitals: PLAY, STOP, PATTERN, CLEAR, EDIT, EDIT OP., RECORD, DISK OP., POS ED., SAMPLER, with a narrow column of 1-4 and A keys at the far right
- A strip titled QUADRASCOPE over four small black windows numbered 1-4, each holding one thin yellow waveform trace
- Two full-width text strips, SONGNAME: and SAMPLENAME:, the value padded to fixed length with underscores, a small LOAD button at the right end
- A status strip: current pattern number in a box, tempo 125 with tiny arrows, STATUS: ALL RIGHT, and TUNE / TIMING readouts at the right
- Four black pattern windows of packed 8-character cells (note letter, sharp or dash, octave, 2-digit sample, 3-digit effect, e.g. a cell shaped like F-201903), decimal row numbers 00-63 in a fifth narrow window at the far left, all in saturated blue on black
- A fixed light-grey edit row across the middle with black digits, the row number enlarged in a bevelled box, and a one-cell red outline cursor
- One fat vertical VU bar per channel standing on the edit row, green at the base shading to yellow (redder only near full height); a chunky yellow arrow mouse pointer

**Palette.** Re-measured from the pt2-clone screenshot by pixel count: panel grey \#888888, bevel highlight \#BBBBBB, bevel shadow \#555555, windows \#000000, pattern text blue \#3344FF, scope and pointer yellow \#FFDD00. The edit row is a light-grey band (\#BBBBBB) with black digits, not white. Ultimate Soundtracker v1.21 variant (researcher-sampled, consistent with the image): tan \#997755 panels, \#AA8866 highlight, dark brown \#553311 shadow, teal-blue pattern digits \#006699. NoiseTracker v1.1 is the same layout in mid-grey with blue digits.

**Lettering.** All-caps 8x8 bitmap face with very wide letterforms, drawn light grey with a one-pixel dark drop shadow so labels look embossed into the panel. Pattern digits are a taller, heavier numeric face. Ultimate Soundtracker labels its four channels in a thin rounded mixed-case face (Melody, Accompany, Bass, Percussions), uses +/- buttons instead of arrows, and spells the field LENGHT. NoiseTracker and Soundtracker put a logo plate (lumpy chiselled capitals; shadowed slab capitals) where ProTracker later put the scopes, and NoiseTracker has VOICE1-4: ON toggles.

**Motion.** Pattern rows step upward one row at a time under the fixed edit row; VU bars jump on each note and decay; the four scope traces wobble; POS and PATTERN counters tick at the end of a pattern; the pointer sits idle. All stepped, no easing.

**As a README header.** One animated SVG at 640x510. SONGNAME carries the repo name padded with underscores; SAMPLENAME carries the tagline. The numeric fields carry real counts (LENGTH = releases, SAMPLE = dependencies, PATTERN = major version). The four channels are the project's four main modules; pattern cells are invented note data, with module names shown in a one-line label strip above the windows rather than forced into 8-character cells. Put the prose and links as ordinary Markdown below the image; pair it with the sample-list style (next entry) if a text block is wanted.

**How to build it.** All rectangles and short text. The cost is the font: define an original 8x8 glyph set as path symbols in defs and place with use. Roughly 60 panel labels, 4 x 15 visible rows x 8 characters plus row numbers = about 600 glyphs, and a looping 32-row pattern is about 1,100, so 40-60 KB total. Row stepping: a g inside a clipPath-ed parent, animated with transform: translateY and steps(n), with the first screenful of rows duplicated at the end so the loop is seamless. VU bars: keep a fixed green-to-yellow linearGradient bar and animate a black cover rect over it (scaleY on the gradient bar itself would squash the colours). Scope traces: a periodic polyline wider than its clip window, translated one period in a linear loop. Embossing is two offset copies of each glyph (dark then light), which doubles label glyph count only. Add @media (prefers-reduced-motion: reduce) inside the SVG style to pause everything.

**Do not copy / caveats.** Do not copy the ProTracker, NoiseTracker or Soundtracker logos or wordmarks, the author and group credit lines, or the song and sample names visible in the screenshots (they belong to a real, well-known module). Build an original 8x8 face rather than tracing the Amiga font bitmaps. The layout, bevel style, note notation and grid are generic and reusable. Accessibility: authentic \#3344FF on black is about 3.4:1, below the 4.5:1 threshold for small text, so carry meaning in the grey-band row, the yellow and the alt text. Unconfirmed: whether the first ProTracker release was 1990 or 1991 (the two Wikipedia pages disagree); which header fields are decimal versus hex beyond what the screenshot shows. Do not make this and the cracktro's pattern strip both defaults.

**References**

- [pt2-clone screenshot (642x549 with window chrome): the ProTracker 2.3D pattern screen with quadrascope, VU bars, 'Noxious January 1993' line](<https://16-bits.org/pt2-clone-1.png>)
- [pt2-clone repository by 8bitbubsy: states it aims to be a highly accurate clone of ProTracker 2.3D; real and fake VU meters](<https://github.com/8bitbubsy/pt2-clone>)
- [The Ultimate Soundtracker v1.21 screenshot: tan panels, Melody/Accompany/Bass/Percussions, LENGHT, '1987 by Karsten Obarski'](<https://upload.wikimedia.org/wikipedia/commons/7/70/The_Ultimate_Soundtracker_v1.21_by_Karsten_Obarski_1987_01.png>)
- [NoiseTracker v1.1 screenshot: grey variant, VOICE1-4: ON, logo plate, DISK STATUS: ALL RIGHT (the Commons file name misspells Kaktus as 'Kartus')](<https://upload.wikimedia.org/wikipedia/commons/f/ff/Noisetracker_v1.1_by_Mahoney_and_Kartus_1989_01.png>)
- [Wikipedia: ProTracker (authors, 'Release: 1990', MOD format, the 2.3D clone project)](<https://en.wikipedia.org/wiki/ProTracker>)
- [Wikipedia: Ultimate Soundtracker (Obarski, December 1987; NoiseTracker 1989 by Mahoney and Kaktus; ProTracker given as 1991)](<https://en.wikipedia.org/wiki/Ultimate_Soundtracker>)
- [Wikipedia: Music tracker (channel labels Melody, Accompany, Bass, Percussions; chronology)](<https://en.wikipedia.org/wiki/Music_tracker>)

---

<a name="trk-02"></a>

## trk-02 · Module sample list as message board (text-only)

**Text** · build: **Easy** · impact: **3/5** · 1987 onward, Amiga MOD and later XM modules; the convention was reinforced by the IntuiTracker player and is still surfaced by The Mod Archive's 'View Internal Text(s)' link

A MOD file has a 20-character title and 31 sample slots with 22-character names, and composers routinely used the names as a notice board: credits, greetings, contact details, even block-letter pictures. Players showed this text to the listener, so the sample list became the module's own tiny NFO. It is the one tracker artefact that was always plain monospace text.

**What it looks like**

- A title line of at most 20 characters, often lower-case with underscores or dots
- 31 numbered lines, each a 2-digit index followed by exactly 22 characters, so the block is a narrow column about 26 characters wide
- A mix of three line types: real sample names (short lower-case words, sometimes with an st-01: style disk prefix), message lines (centred phrases, dashes and asterisks as rules), and empty slots
- Message lines prefixed with \# in modules written for the IntuiTracker player, which displayed \# lines to the listener
- Centred text padded by hand with spaces, because every slot is fixed width
- In XM modules the same habit moves to the instrument list: a 'composed by' notice in the instrument names, and sometimes big block-pixel lettering built from block characters across several sample-name lines
- A closing greetings or contact line in the last few slots

**Palette.** Monochrome by nature. In ProTracker the names appear as embossed grey capitals in the SAMPLENAME strip; in FastTracker II as light text on black with the selected line inverted; on The Mod Archive as plain page text. In a README it is simply the code-block colour.

**Lettering.** Fixed-width, 22 characters per line, 7-bit ASCII in MOD (ProTracker shows capitals only). Decoration is limited to punctuation rules (-, =, \*, \#, ., \_) and, in XM, block characters. Two-digit slot numbers at the left act as a ruler. A made-up example of the texture: '07 \#  greets to all  \#' followed by '08 bassdrum.2'.

**Motion.** static

**As a README header.** A single &lt;pre&gt; block, above the fold, about 26-60 columns wide: line 1 is the repo name as the song title, then 31 numbered slots. Real dependencies or modules sit in some slots as if they were samples; the rest spell out the tagline, install command, licence and greetings in the hand-centred style. Links work inside &lt;pre&gt;, so dependency names and the docs pointer can be real anchors. Two lists side by side (instruments = features, samples = dependencies) fill 80 columns. It also works as the caption block under the ProTracker or FastTracker SVG.

**How to build it.** Pure ASCII, no box-drawing required, well under 80 columns, renders identically on web and mobile. The generator only has to pad or truncate each entry to 22 characters and centre message lines. If block-pixel lettering is wanted, use the full block and half blocks (U+2588, U+2580, U+2584), which are in GitHub's code fonts; keep it to 22 columns so it still reads as a sample list.

**Do not copy / caveats.** Do not reuse any real module's title, sample names, composer credits or messages: invent the content. The slot structure, the numbering and the \# convention are format facts and free to use. Screen readers will read 31 numbered lines one by one, so keep the essential facts (name, one-line description, install) in ordinary Markdown as well. Unconfirmed: I did not open the internal-text view of a specific module (only the page that links to it), so the description of typical message content rests on the spec's wording and the one XM screenshot.

**References**

- [MOD format specification: 20-byte song name, 31 samples with 22-byte names, 64 rows x 4 channels, and the note that sample names are often used for author messages, with \# lines shown by the IntuiTracker player](<https://eblong.com/zarf/blorb/mod-spec.txt>)
- [The Mod Archive module page with the 'View Internal Text(s)' link, showing the tradition is still exposed to listeners](<https://modarchive.org/index.php?request=view_by_moduleid&query=57925>)
- [ft2-clone screenshot in which the instrument list holds a centred 'composed by' notice and the sample list holds block-pixel lettering (look at the technique, do not copy the content)](<https://16-bits.org/ft2-clone-3.png>)
- [FastTracker II v2.06 screenshot: numbered instrument list 01-08 with st-01: prefixed names](<https://upload.wikimedia.org/wikipedia/commons/1/1f/Fasttracker_II_v2.06_04.png>)

---

<a name="trk-03"></a>

## trk-03 · FastTracker II (dense DOS GUI tracker with scope grid)

**Animated SVG** · build: **Medium** · impact: **4/5** · November 1994 to 1997/98, MS-DOS, by Fredrik 'Mr. H' Huss and Magnus 'Vogue' Hogdahl of the demogroup Triton (Wikipedia: last stable 2.08 in August 1997, 2.09 beta leaked 1998; Demozoo lists 2.09 in August 1998). Continued by 8bitbubsy's ft2-clone and by MilkyTracker, which says it attempts to recreate FT2's replay and user experience.

The tracker that carried the mid-1990s PC demoscene and introduced the XM format (up to 32 channels). It took ProTracker's arrangement and turned it into a mouse-driven 640x400 screen crammed with small bevelled buttons, a grid of numbered scopes and an instrument list. Tracker chiptunes in this lineage were commonly reused in keygens because the files are tiny.

**What it looks like**

- The whole 640x400 screen divided into panels by single-pixel pale cyan frame lines on a teal-grey ground
- Top-left: a song position list of paired 2-digit hex values in a black box with Ins. / Del. buttons, then Songlen. and Repstart counters
- A logo plate: a heavy, upright, blocky mixed-case wordmark in white with a dark shadow over a two-tone checker band, with a tiny credit plate at its right; beneath it BPM, Spd., Add., Ptn., Ln. counters with pairs of tiny arrow buttons and Expd. / Srnk. buttons
- A status strip reading free memory and a Time counter (Avail ...k, Time 00:00:44)
- Two columns of narrow grey bevelled text buttons: About, Nibbles, Zap, Extend, Transps., I.E.Ext., S.E.Ext., Adv. Edit, Add/Sub and Play sng., Play ptn., Stop, Rec. sng., Rec. ptn., Disk op., Instr. Ed., Smp. Ed., Config, Help
- A grid of small scope cells, numbered in the top-left corner from 0 (8 cells in two rows of four, or up to 24-32 in narrower rows), black with a thin pale-yellow trace and a tiny REC tag
- Right side: an instrument list numbered 01-08 with the selected line inverted, a column of range buttons (01-08, 09-10, 11-18 ... 39-40), a shorter sample list numbered 00-04 with a scrollbar, and a Swap Bank button
- Lower half: the pattern editor, hex row numbers on both edges, 8 channel columns headed by their number, cells as note, instrument, volume, effect with empty fields drawn as rows of tiny dots, and a full-width highlighted band for the current row

**Palette.** Two real schemes, researcher-sampled and consistent with the screenshots. Default v2.06: black \#000000, desktop and panels teal-grey \#497582, button face grey \#9E9E9E, dark frame \#18282C, frame lines pale cyan \#8ADBF3, pattern text pale yellow \#FFFF82, white \#FFFFFF. Blue scheme (the English Wikipedia screenshot): panels \#285586, buttons \#9696B6, lines and text \#9ED3FF, accents \#4996EB, shadows \#102034, pattern text white.

**Lettering.** A proportional bitmap UI face with rounded bold lower-case letters for buttons and labels (abbreviations end in a full stop: Spd., Ptn., Smp. Ed.), plus a separate compact fixed-width pattern face in which notes read like E-4 or D\#5 and empty fields are low dots. The wordmark is upright and blocky, not italic. Hex for row numbers, order positions and instrument ranges.

**Motion.** Every scope cell draws a live waveform; the pattern scrolls under the fixed centre row; the position list highlight and the Time counter advance. The About and Nibbles buttons (Nibbles is a built-in snake game) suggest an easter-egg frame.

**As a README header.** One animated SVG at 640x400. The logo plate holds an original project wordmark over the checker band; the instrument list is the feature or dependency list (01-08, selected line inverted); scope cells are numbered and captioned with module names; the counters carry real numbers (Ptn. = version, Songlen. = releases); the pattern shows 8 channels of invented notes. Because an SVG in &lt;img&gt; is not clickable, repeat the two button columns as a row of real text links under the image.

**How to build it.** Flat rects, 1px lines and text; the difficulty is density, not size. Two bitmap faces must be drawn as path glyphs (a proportional UI face and a fixed pattern face). About 8 channels x 16 visible rows x 10 drawn characters plus UI labels is 1,500-2,000 glyph placements, roughly 60-80 KB; halve it by showing 4 channels or by drawing the dotted empty fields with a single pattern fill per column instead of glyphs. Use shape-rendering: crispEdges and snap everything to the 640x400 pixel grid, because GitHub scales the image to about 1.3x on desktop and to roughly half size on a phone, where the labels become illegible. Scopes: one periodic polyline per cell translated under a clipPath, with co-prime loop lengths (1.7s, 2.3s, 3.1s) so the grid never visibly repeats.

**Do not copy / caveats.** Do not reproduce the Fasttracker wordmark, the Triton credit plate, or the module, instrument and composer names visible in the screenshots. The panel arrangement, scope grid, button vocabulary and two-tone palette idea are generic. Legibility on phones is the main risk: ship a simplified crop (logo, scopes, 4 channels) or accept that the header is decorative there and keep the key facts in Markdown. Unconfirmed: the start year of ft2-clone (not stated on the repo page); any claim that keygen tunes were predominantly written in FT2 (Wikipedia only says tracker chiptunes were commonly used in keygens).

**References**

- [Wikipedia: FastTracker 2 (authors, November 1994, 2.08 August 1997, layout description, Nibbles, XM, 32 channels)](<https://en.wikipedia.org/wiki/FastTracker_2>)
- [Fasttracker II v2.06 screenshot: default teal and yellow palette, 8 scopes numbered 0-7, st-01: instrument names](<https://upload.wikimedia.org/wikipedia/commons/1/1f/Fasttracker_II_v2.06_04.png>)
- [FastTracker 2 screenshot in the blue palette with 24 scope cells](<https://upload.wikimedia.org/wikipedia/en/4/4b/FastTracker_2_screenshot.png>)
- [Demozoo: Fasttracker 2, Triton, November 1994, credits (Vogue, Mr. H; later kb and 8bitbubsy)](<https://demozoo.org/productions/99958/>)
- [ft2-clone by 8bitbubsy: 'aims to be a highly accurate clone of the classic Fasttracker II software for MS-DOS'](<https://github.com/8bitbubsy/ft2-clone>)
- [ft2-clone screenshot with 28 scope cells and the instrument list used as a notice board](<https://16-bits.org/ft2-clone-3.png>)
- [MilkyTracker: 'attempts to recreate the module replay and user experience of the popular DOS program Fasttracker II'](<https://milkytracker.org/about/>)

---

<a name="trk-04"></a>

## trk-04 · DOS text-mode trackers (Scream Tracker 3 gold, Impulse Tracker tan, AdLib Tracker II navy)

**Text + SVG** · build: **Easy** · impact: **4/5** · 1993-1999, MS-DOS text mode. Scream Tracker 3 by Psi (Sami Tammilehto) of Future Crew (screen reads 'Copyright (C) 1993,1994'; last version 3.21 in 1994). Impulse Tracker by Jeffrey Lim (begun over Christmas 1994 as 'the version of ST3 that I wanted', first release 1995, v2.14 patch 5 on 8 April 1999; 80x50 characters on 640x400). AdLib Tracker II by subz3ro for OPL3 FM. Schism Tracker is the open-source reimplementation of Impulse Tracker.

The keyboard-driven PC trackers that ran in character mode yet looked like bevelled control panels, because they redefined font glyphs on the fly (Impulse Tracker even drew a pixel-accurate mouse pointer and its envelope graphs that way). Scream Tracker 3 set the layout, Impulse Tracker refined it and became the best-loved DOS tracker, and AdLib Tracker II applied the idea to FM synthesis in deep blue. People remember the colour as much as the program: Zoe Blade writes that its 'gold and green matrix' is etched in her memory.

**What it looks like**

- A solid full-screen panel colour (olive gold, tan or navy) with program name, version and copyright centred on the top line
- Right-aligned field labels with values in black inset boxes: Song Name, File Name, Order, Pattern, Row on the left; Instrument, Speed/Tempo, Octave on the right. In Scream Tracker 3 the black insets have stepped, notched outlines rather than plain rectangles
- Key hints inside the header as dot-leader pairs: F1...Help, ESC..Main Menu, F9.....Load, F5/F8..Play / Stop (Impulse); ESC ..... Main Menu, F10 ..... Quick-Help, CTRL-L .. Load Module (Scream), plus FreeMem / FreeEMS readouts at the right
- A status line: Playing, Order: 4/41, Pattern: 2, Row: 21/64, 13 Channels, and a Time counter
- A centred section title with its hotkey, such as Pattern Editor (F2) or Info Page (F5), on a thin rule
- Black inset windows with a lighter edge on top and left, darker on bottom and right; channel header tabs above each column (Channel 01 ... in Impulse; 01: L1, 02: R1, 03: L2 in Scream Tracker, naming left and right outputs)
- Pattern cells as note, instrument, volume, effect with dots for empty fields, decimal row numbers (3 digits in Impulse), every fourth row tinted a shade lighter
- Impulse Info Page: one horizontal volume bar per channel built from fine vertical ticks, a sample-name list beside it, a column of small square dots for stereo position, and a compact many-channel note strip below. AdLib Tracker II: a STATUS box and a PATTERN ORDER matrix of hex pairs above a PATTERN EDiTOR with LiNE columns at both edges

**Palette.** Impulse Tracker (re-measured by pixel count): panel tan \#B69679, windows black \#000000, dark edge \#34302C, brown bevels \#59413C and \#7D5945, pattern text green \#459A49, highlights cream \#EBEBCB, field values yellow \#FFFF55. Scream Tracker 3 (researcher-sampled, consistent with the image): panel olive gold \#A69255, pattern text grey \#9A9692, labels pale yellow \#FFDF86, header values green \#00B200, shadows \#514528 and \#302C28. AdLib Tracker II (researcher-sampled): navy \#142879, frames and text pale blue \#A2CBDF, accents \#0079A2, \#51A2CB, \#3C658E, bright cyan \#8EF3F3.

**Lettering.** VGA text-mode cells with a custom font, thin and slightly condensed; Impulse runs 80x50 (8x8 cells) on 640x400. Labels are mixed case with right alignment against the value box. AdLib Tracker II writes labels with a deliberate lower-case i (PATTERN EDiTOR, LiNE) and builds its title from slash and box characters around the letters; its frames are bright heavy lines with titles breaking the top edge.

**Motion.** Pattern rows scroll under a tinted current-row bar; the Row and Time counters tick; Info Page volume bars extend and retract per channel and the pan dots slide left and right. The text-only variant is static.

**As a README header.** A static or lightly animated SVG of an 80x25 character screen (80x50 is authentic for Impulse but too small to read at README width). Header fields: Song Name = repo name, File Name = package name, Order = version, Instrument = language or runtime; the dot-leader key hints become the real commands (the Help hint names the docs, the Load hint shows the install command). Body: the Info Page, with volume bars = module sizes or coverage, the sample list = dependencies, pan dots decorative. A pure-text twin in a &lt;pre&gt; keeps the right-aligned label layout, the dot leaders and the status line using box-drawing frames, but loses the panel colour that defines the style, so treat the text version as a fallback.

**How to build it.** A character grid is the easiest thing to build in SVG: one background rect, a handful of black inset rects with two 1px edge lines each, and one &lt;text&gt; per row with xml:space="preserve", font-family set to a monospace stack and textLength forcing each row to the grid width so any fallback font lands on the columns. Built that way an 80x25 screen is 10-20 KB. If the custom thin font matters, path glyphs via use cost 30-40 bytes per character, so budget about 50 KB for 80x25 and 120-160 KB for a full 80x50 screen. Tick-built volume bars are a pattern fill (2px on, 1px off) on a rect whose width is animated with scaleX and transform-origin: left; pattern scroll is translateY with steps() inside a clipPath. The &lt;pre&gt; variant needs only light box-drawing characters and full stops and fits 80 columns.

**Do not copy / caveats.** Do not copy the program names, version and copyright lines, AdLib Tracker II's constructed title, or any song, file, instrument or sample names from the screenshots. The label-and-inset-field layout, dot-leader key hints and the palettes as general colour ideas are reusable. Contrast: green \#459A49 on black passes; small brown-on-tan text does not, so keep labels near-black on the tan. Unconfirmed and therefore removed or hedged: a 'cream brush-script wordmark' in Impulse Tracker's start-up box (not visible in any reference opened); double-line frames in AdLib Tracker II (the screenshot shows heavy bright frames but the line style cannot be resolved); AdLib Tracker II's first release year (the site only documents 2007 onward).

**References**

- [Impulse Tracker v2.14 Pattern Editor (F2) screenshot](<https://upload.wikimedia.org/wikipedia/commons/3/37/Impulse_Tracker_v2.14_04.png>)
- [Impulse Tracker Info Page (F5): tick-built volume bars, sample list, pan dots](<https://upload.wikimedia.org/wikipedia/commons/c/c5/Impulse_Tracker_screenshot.png>)
- [Wikipedia: Impulse Tracker (Jeffrey Lim, first version 1995, v2.14 patch 5 on 8 April 1999, GUI heavily influenced by Scream Tracker 3, BSD source release 25 December 2014)](<https://en.wikipedia.org/wiki/Impulse_Tracker>)
- [Jeffrey Lim, '20 years of Impulse Tracker' (primary account: started Christmas 1994 as his own ST3; the comments, including his own reply, discuss the pixel-accurate mouse pointer and character-generation code in text mode)](<https://roartindon.blogspot.com/2014/02/20-years-of-impulse-tracker.html>)
- [Scream Tracker 3.21 screenshot: gold panel, notched black insets, channel tabs 01: L1 / 02: R1](<https://upload.wikimedia.org/wikipedia/en/5/53/Screamtracker_321.png>)
- [Wikipedia: Scream Tracker (Psi / Sami Tammilehto, Future Crew, 3.21 in 1994, S3M, PCM plus FM channels)](<https://en.wikipedia.org/wiki/Scream_Tracker>)
- [AdLib Tracker II pattern editor screenshot (navy, STATUS box, PATTERN ORDER, LiNE columns)](<https://adlibtracker.net/images/at2_01.png>)
- [AdLib Tracker II site: 'subz3ro's finest FM-tracker', v2.3.38 on 2007-06-10, open-sourced 2010, Windows version 2013](<https://adlibtracker.net/>)
- [Schism Tracker: 'a free and open-source reimplementation of Impulse Tracker'](<https://schismtracker.org/>)
- [Zoe Blade's notebook: display 80x50 character / 640x400 pixel VGA, and her own 'gold and green matrix' sentence](<https://notebook.zoeblade.com/Impulse_Tracker.html>)

---

<a name="trk-05"></a>

## trk-05 · LSDj phrase screen (Game Boy tracker), with the nanoloop grid as its minimalist opposite

**Animated SVG** · build: **Easy** · impact: **4/5** · 2000 onward, Nintendo Game Boy: Little Sound Dj by Johan Kotlinski (project dated to 2000 by the Battle of the Bits lyceum; still updated per its changelog). nanoloop by Oliver Wittchow: a study project at the University of Fine Arts Hamburg, first performed publicly in early 1998, cartridges sold in Germany from late 1999 and worldwide from 2000.

The program that made the Game Boy the standard instrument of the 2000s chiptune scene. It squeezes a whole tracker into 160x144 pixels by splitting it into screens (Song, Chain, Phrase, Instrument, Table and more) arranged on a small map. For many people this grid of three-letter codes is what 'chiptune' looks like; nanoloop answers it with almost nothing on screen but a 4x4 grid of squares.

**What it looks like**

- A 160x144 screen of 8x8 tiles: 20 characters wide, 18 rows tall, drawn at integer scale
- Screen title and hex index at top-left (PHRASE 00, SONG, WAVE 00), current channel name at top-right (WAV, PU1)
- Sixteen rows numbered 0-F down the left edge in white digits on a pale pink band
- Song screen: four columns headed PU1, PU2, WAV, NOI holding 2-digit hex chain numbers, double dashes where empty
- Phrase screen: tiny column headers NOTE, INSTR, CMD; notes as C-3 style or, in drum-kit mode, two 3-letter drum names side by side; instruments as I00; commands as a letter plus two hex digits or ---; alternate columns banded in pale cyan
- Right-hand status column: tempo with a note glyph (such as 128), the four mute letters 1 2 W N stacked vertically, a tiny squiggle waveform
- Bottom-right screen map: a cross of single letters (S C P I T in a row with G above and another letter below) with the current screen's letter highlighted
- A solid red-pink block cursor with white text inside, and a small black triangle at the left marking the play row

**Palette.** Official phrase screenshot (a Game Boy Color palette, researcher-sampled and consistent with the image): field white \#FFFFFF, column bands pale cyan \#D9FBFD, text black \#000000, row-number band pale pink \#F8C8FA, cursor red-pink \#F4788E. The Song screen photographed on a Game Boy Advance is white text on royal blue with orange row numbers and an orange map. LSDj palettes are user-selectable, so no single scheme is canonical; four greys or four greens give the original-hardware feel. nanoloop on an original Game Boy: dark olive squares on the pea-green LCD.

**Lettering.** One heavy 8x8 upper-case bitmap face for everything, hex digits throughout, with column headers in a much smaller face about 5 pixels tall. No lower case. nanoloop's later versions use a thin lower-case pixel face and single letters in grid cells.

**Motion.** The play-row triangle steps down the 16 rows and wraps; the cursor block blinks; optionally the map highlight moves and the grid swaps to another screen. All stepped, no easing, to keep the LCD feel.

**As a README header.** One SVG with two or three 160x144 screens side by side at 3x (each 480x432) or one at 4x (640x576): SONG (the four columns renamed to the project's four modules, rows = releases), PHRASE (NOTE = command, INSTR = module id, CMD = flag) and a PROJECT-style screen (name, version, tempo = build time). The corner screen map becomes a miniature table of contents whose letters are the README sections; the real section links go in text under the image. The nanoloop variant is the opposite extreme: a bare 4x4 grid with a few lit cells and one line of type for the project name.

**How to build it.** Only 360 tiles per screen. Define an original 8x8 glyph set as paths once and place with use: three screens are about 700 placements, 25-35 KB. Use shape-rendering: crispEdges and integer scale so pixels stay square. Animation is three small steps() keyframe sets (cursor blink via opacity, play-row marker via translateY with steps(16), map highlight). An LCD look is cheap: a 1px grid from an SVG pattern at low opacity, or a slight green tint.

**Do not copy / caveats.** Do not draw a Game Boy shell, the Nintendo or Game Boy wordmarks, the LSDj name or its font bitmaps: build an original 8x8 face and an original screen title. The 16-row hex grid, the channel abbreviations as hardware terms and the screen-map idea are reusable. Pale pastel bands are low contrast, so keep text pure black on them. Unconfirmed: LSDj's exact first-release date (2000 comes from the lyceum, not the official site; there is no English Wikipedia article for it); whether nanoloop was begun in 1997 (the author's page documents the 1998 performance only); the CDM article itself does not describe the 4x4 grid, which is confirmed from the two images instead.

**References**

- [Official Little Sound Dj site (describes it as a Game Boy music sequencer; hosts the two screenshots)](<https://www.littlesounddj.com/lsd/index.php>)
- [Official phrase-screen screenshot at native 160x144](<https://www.littlesounddj.com/lsd/shots/phrase.png>)
- [Photograph of the LSDj Song screen (PU1 PU2 WAV NOI, tempo, mute letters, screen map) on a Game Boy Advance](<https://upload.wikimedia.org/wikipedia/commons/9/9e/Gameboytracker.JPG>)
- [Battle of the Bits lyceum: LSDj (Johan Kotlinski, begun 2000, song / chain / phrase / instrument views, four channels)](<https://battleofthebits.com/lyceum/View/lsdj%20(format)>)
- [nanoloop history from its author: Hamburg study project, first performance early 1998, cartridges from late 1999](<https://nanoloop.com/about.html>)
- [nanoloop one running on an original Game Boy: the 4x4 grid of squares on the green LCD](<https://nanoloop.com/one/nanoloopone1.jpg>)
- [CDM on nanoloop: 'minimal elements onscreen' versus LSDj's '90s-style tracker interface'](<https://cdm.link/nanoloop-dedicated-devices/>)
- [nanoloop mobile-version screen: grey field, white squares, 4x4 note grid, thin lower-case pixel lettering](<https://cdm.link/app/uploads/2011/04/nanoloopscreen.jpg>)

---

<a name="trk-06"></a>

## trk-06 · SID tracker in plain text mode (GoatTracker three-voice screen)

**Text** · build: **Easy** · impact: **3/5** · 2000s to present, cross-platform tools for Commodore 64 music. GoatTracker and GoatTracker 2: CSDb credits the releases to Covert Bitops (2.x releases listed through 2021), SourceForge lists maintainers loorni and jauernig, latest 2.77, GPLv2, reSID emulation by Dag Lem. Native C64 editor for contrast: SID-Wizard by Hermit (v1.0 RC released 7 July 2012 at Arok 2012).

How C64 music is written today: a plain black character screen with one pattern column per SID voice and a block of instrument numbers (ADSR, pulse width, filter) beside it. It is a distinct sub-variant of the existing C64 style because it shows the composer's workbench rather than the boot, loader and title screen. It is also the tracker that is already almost pure text.

**What it looks like**

- One solid blue title bar across the top: program name, version and build note at left, F12 = HELP at right
- Three pattern columns headed CHN1 PATT00, CHN2 PATT01, CHN3 PATT02; each row is a 2-digit decimal row number plus an 8-character cell (3-character note, 2-digit instrument, 3 hex digits of command)
- Rests drawn as ---, a second marker drawn as ===, so an empty pattern looks like ruled paper
- Every fourth row number (00, 04, 08, 12, 16) in bright green to mark the beat; the cursor cell inverted grey
- Right side top: CHN ORDERLIST (SUBTUNE 00, POS 00) with three numbered rows of hex pattern numbers each ending in RST00
- Right side middle: INSTRUMENT NUM. 01 plus a name, then a label-value list (Attack/Decay, Sustain/Release, Pulse Width, Pulse Speed, Pulse Limit Min, Pulse Limit Max, Filter To Use) with a small wavetable column beside it; the active label in green
- FILTER NUM. block (Filt Control, Filt Type/Time, Filt Freq/Spd, Filt Next Step) and a NAME: line with the tune title in green
- Bottom status: OCTAVE 2, STOPPED, JAM MODE in green, a 00:00 timer, and CHN1 CHN2 CHN3 position readouts as 000/00

**Palette.** Plain 16-colour VGA as seen in the v1.4b screenshot (researcher-sampled): black \#000000 background, grey \#AAAAAA body text, white \#FFFFFF headings, bright green \#55FF55 for beat rows and the active field, blue \#0000AA title bar. SID-Wizard on a real C64 looks different: grey-on-black C64 characters, a lilac-blue menu box, and blue raster stripes in the side borders.

**Lettering.** Standard VGA ROM text font, upper and lower case, no custom glyphs, hex for everything except row numbers. In a README this is simply the page's monospace font, which is why the style translates so directly.

**Motion.** static

**As a README header.** Pure text in a &lt;pre&gt;, 80 columns, about 25 lines. Title line with the repo name at left and a HELP pointer to the docs at right; three columns named after the project's three main parts with rows listing features as if they were notes; the INSTRUMENT block becomes a key-value card (Language, Licence, Version, Build, Tests); ORDERLIST becomes the install steps in order; NAME: holds the tagline. Links work inside &lt;pre&gt;, so the orderlist entries and the HELP hint can be real anchors.

**How to build it.** Plain ASCII in fixed columns; the original is nearly monochrome so little is lost. The blue title bar cannot be inverted in plain text: use a framed line or a row of full blocks (U+2588) either side of the title. Beat-row emphasis becomes a marker character beside every fourth row number. Pad every line to exactly 80 characters so the right-hand blocks align. An optional SVG twin (one &lt;text&gt; per row in system monospace with textLength, green rows via fill) is under 10 KB and restores the two colours.

**Do not copy / caveats.** Do not use the GoatTracker or SID-Wizard names or version strings as the title, and do not copy the instrument or tune names from the screenshot. The three-column layout and the parameter labels are descriptive terms for SID hardware and are reusable. Unconfirmed: the individual author's name and the first-release year of GoatTracker (the pages opened credit the group and the maintainers only; there is no English Wikipedia article); the exact meaning of the === marker (seen in the screenshot, not checked against the manual). An earlier claim that SID-Wizard was 'still updated in 2026' could not be confirmed: SourceForge shows v1.7 last updated January 2021. Screen readers read a &lt;pre&gt; grid line by line as noise, so add a one-sentence plain description beside it.

**References**

- [GoatTracker v1.4b screenshot: three channel columns, orderlist, instrument and filter blocks](<https://upload.wikimedia.org/wikipedia/commons/a/a8/GoatTracker_shot.png>)
- [GoatTracker 2 on SourceForge: cross-platform C64 music editor, reSID by Dag Lem, GPLv2, maintainers jauernig and loorni, v2.77](<https://sourceforge.net/projects/goattracker2/>)
- [Covert Bitops tools page: GoatTracker 1.x and 2 described (63 instruments, step-programming tables)](<https://cadaver.github.io/tools.html>)
- [CSDb release list for GoatTracker (2.x releases credited to Covert Bitops)](<https://csdb.dk/search/?seinsel=releases&search=goattracker>)
- [CSDb: SID-Wizard v1.0 RC by Hermit, 7 July 2012, with screenshot](<https://csdb.dk/release/?id=109698>)
- [DeepSID by Chordian (Jens-Christian Huus): online HVSC player with piano, scope, graph and register views of the three voices](<https://deepsid.chordian.net/>)

---

<a name="trk-07"></a>

## trk-07 · Multi-chip tracker (FamiTracker / DefleMask / Furnace)

**Animated SVG** · build: **Medium** · impact: **3/5** · Mid-2000s to present, Windows and cross-platform. FamiTracker for the NES 2A03 and expansion chips (by jsr; last version 0.4.6; official site dead as of May 2023; forks 0CC-FamiTracker and Dn-FamiTracker). DefleMask by Leonardo Demartino (Genesis, Master System, Game Boy, PC Engine, NES, C64, arcade, Neo Geo, MSX2). Furnace by tildearrow and contributors (2021-, over 200 chip presets, loads DefleMask modules).

The modern chiptune workstation: a black pattern grid where each column is a named hardware voice and each field type has its own colour. It is the screen behind most current NES, Genesis and arcade-chip music. It differs from the classic trackers by putting the chip's own channel names in the column headers and by surrounding the grid with live scopes.

**What it looks like**

- Channel header strip naming hardware voices: Pulse 1, Pulse 2, Triangle, Noise, DPCM (plus expansion voices such as Namco 1, Namco 2) in FamiTracker, each with a thin segmented level meter under the name; FM1-FM6 plus SN1-SN4 in DefleMask as green tabs; amber tabs in Furnace
- Black pattern grid with row numbers at left (hex in FamiTracker, decimal in the DefleMask and Furnace screenshots); notes as C-3 with the dash, empty fields as faint dashes or dots
- Colour-coded fields inside each cell: in FamiTracker note and instrument green, volume digit blue, effect codes pink; on highlighted beat rows the text turns yellow
- A full-width play row: dark red in FamiTracker, grey-blue in Furnace, with lighter tint bands every 4 and 16 rows
- A frame or order matrix at top-left: rows of 2-digit pattern numbers, one column per channel, current row highlighted (green on black in FamiTracker, orange cells in DefleMask, blue in Furnace)
- An instrument list at top-right with numbered names and a small chip-type icon per line
- A rounded-rectangle master oscilloscope at top centre (DefleMask, Furnace) and a column or grid of per-channel mini scopes at the right, each captioned with the channel name
- DefleMask adds a piano keyboard strip along the bottom of the pattern area with the sounding keys lit; Furnace adds a tall yellow-green stereo level meter at the far right

**Palette.** Described from the screenshots, not pixel-sampled. FamiTracker: grey Windows chrome around a black grid, green notes, blue volume, pink effects, yellow beat rows, dark red play row, green-on-black frame list. DefleMask: charcoal panels, orange order matrix, white notes with blue instrument digits, green scope traces and green channel tabs. Furnace: near-black navy, white notes, teal and green digits, purple, yellow and blue effect codes, amber header tabs, pale blue master scope, yellow-green meter.

**Lettering.** A small monospace or bitmap face for the grid; ordinary sans-serif for surrounding chrome. Upper-case hex digits. Furnace's menus and labels are deliberately all lower case.

**Motion.** Pattern scrolls under the fixed play row; header meters flick per note; mini scopes draw per-channel waveforms (square waves for pulse channels, a stepped triangle, hash for noise, smooth complex curves for FM), so the wave shapes themselves identify the chip; DefleMask's keyboard keys light.

**As a README header.** One animated SVG in a wide format (about 830x300): a header strip of five channels renamed to the project's modules, each keeping a waveform icon and a level meter; a black grid of 12-16 visible rows; a mini order matrix at left as the version history; a right-hand column of five mini scopes. The colour coding carries meaning (green = feature name, blue = module id, pink = flag). The repo name sits where the song title goes, above the instrument list.

**How to build it.** Skip the OS window chrome and build only header, grid, order matrix and scopes. Multi-coloured cells are several tspan runs per row in system monospace with textLength (small), or path glyphs if a pixel face is wanted (about 800 placements, 30 KB). Mini scopes are the cheapest convincing animation available: a square-wave path, a stepped-triangle path and a noise path, each translated one period in a linear loop under a clipPath. Header meters are scaleX keyframes with transform-origin: left.

**Do not copy / caveats.** Do not use the FamiTracker, DefleMask or Furnace names, logos or icons, nor Nintendo, Sega or chip-vendor marks; name channels by waveform (Pulse, Triangle, Noise, FM). Do not reuse the song, arranger and instrument names visible in the screenshots. Without its colours and scopes this reads as 'ordinary modern software', so it is the least scene-flavoured tracker here. A dark red play row behind green text is a colour-blindness risk: make the play row lighter, not just redder. Unconfirmed: FamiTracker's author's full name and first-release date (a search summary gave Jonathan Liss and 2 December 2005, but no page I could open states it; famitracker.com is dead and there is no English Wikipedia article); the handle 'Delek' for DefleMask's author.

**References**

- [FamiTracker screenshot: Pulse 1 / Pulse 2 / Triangle / Noise / DPCM / Namco channels, frame list, instrument list](<https://upload.wikimedia.org/wikipedia/commons/4/49/Famitracker_Screenshoot_1.png>)
- [Battle of the Bits lyceum: FamiTracker (free Windows tracker for the 2A03, interface based on MadTracker 2, last version 0.4.6, site dead as of May 2023, forks)](<https://battleofthebits.com/lyceum/View/FamiTracker>)
- [0CC-FamiTracker repository: 'Extension of jsr's FamiTracker'](<https://github.com/HertzDevil/0CC-FamiTracker>)
- [Furnace repository: multi-system chiptune tracker compatible with DefleMask modules; per-channel oscilloscope](<https://github.com/tildearrow/furnace>)
- [Furnace screenshot: orders matrix, master scope, amber channel tabs, per-channel scopes, level meter](<https://raw.githubusercontent.com/tildearrow/furnace/master/papers/screenshot3.png>)
- [DefleMask official site: creator Leonardo Demartino, supported systems](<https://www.deflemask.com/>)
- [DefleMask screenshot: orange order matrix, FM1-FM6 and SN1-SN4, scope grid, piano strip](<https://deflemask.com/assets/uploads/2022/11/01-1024x556.png>)

---

<a name="trk-08"></a>

## trk-08 · Open Cubic Player (DOS module player with text-mode spectrum analyser)

**Text + SVG** · build: **Easy** · impact: **4/5** · 1994 to early 2000s, MS-DOS then Linux and Windows. Cubic Player / Open Cubic Player: the title bar reads '(c) 1994-1999 Niklas Beisert et al.'; version 0.9 was released at The Party 1994; the DOS version was discontinued in 2006. Reviewed as OpenCP v2.5.1a in Hugi 14 (December 1998). Graphical contemporary: Inertia Player v1.22 (Inertia, 1995).

The listener's side of the module scene: a player, not an editor. It packs a three-line status header, a channel list, a character-cell spectrum analyser and a read-only pattern view into one 80x25 text screen, with oscilloscope and spectrogram modes a keypress away. Differs from the existing keygen-dialog analyser by being a full text-mode console with a status vocabulary of its own.

**What it looks like**

- A solid teal title bar, one text row high: program name and version at left, copyright years and author at right, in black
- Three status lines of label: value pairs, labels blue and values white: vol as a row of eight small blocks, srnd, pan and bal as l...m...r sliders drawn with dots and a marker, spd and ptch percentages, then row, ord, tempo, bpm, gvol, amp, filter
- A module line: the word module, an 8.3 file name, the song title, and time: at the far right
- A thin dashed rule with the screen mode (80x25) and the channel digits 01234 centred on it
- peak power level: a bracketed row of dots with blue blocks growing outward from the centre for left and right
- Channel lines, two per row: channel number and colon, instrument number, note, volume, an effect named in words (porta) with a small glyph, and a dotted bar with a few lit blocks
- A spectrum analyser under a one-line blue caption (step, max frequency, stereo): two stacked bands of character-cell columns, each bar green at the base with a blue then cyan tip, most bars only one cell high and a few tall spikes at the left
- A pattern view at the bottom under a caption line: a header row (row, global, 1, 2, 3, 4), hex row numbers, columns separated by thin vertical bars, empty fields as dots, and the current row as a solid mid-grey band with an arrow marker

**Palette.** Researcher-sampled from the official main-screen shot and consistent with it: black \#000000, title bar teal \#00A9A9, labels blue \#0000A9 and bright blue \#0000FC, values near-white \#E2E2E2, analyser green \#00A942 with cyan \#00A9FC tips, current-row band grey \#535353. The graphical spectrogram mode runs black through indigo and red to yellow, with a green-to-yellow-to-red bar spectrum beneath it.

**Lettering.** 80x25 VGA text mode in the standard ROM font, labels in lower case with a colon, hex for rows and orders. Inertia Player, by contrast, is a 640x480 graphics screen: a custom angular techno wordmark over an indigo embossed stone texture with two thin cyan scope lines running the full width.

**Motion.** Spectrum bars jump and fall at different rates; peak-power blocks breathe outward from the centre; row, order and time counters advance; the pattern view scrolls under the grey band. The text-only version is static.

**As a README header.** Works in both media. Text-only: an 80-column &lt;pre&gt; with a title line, the three status lines rewritten as project facts (vol = coverage as eight blocks, spd = build time, ord = version, amp = stars), a module line of the form 'module NAME.EXT  tagline', and a spectrum analyser built from the eight block-height characters whose bars are labelled underneath with module names (bar height = lines of code or test count). SVG version: the same screen in colour with the bars animated and the pattern view scrolling. The channel list maps to modules, with the effect-name slot used for a status word.

**How to build it.** Text version: the lower-block characters U+2581 to U+2588 give eight bar heights per cell and are present in GitHub's code fonts; one row is safest, two stacked rows give 16 levels. SVG version: one &lt;text&gt; per row in system monospace with textLength (the ROM-font look is not essential here), a teal rect for the title bar, and about 40 rects for the bars animated with scaleY keyframes (transform-box: fill-box; transform-origin: bottom) at staggered durations; draw each bar as two rects (green body, cyan cap) so the tip colour survives scaling. Under 25 KB. The spectrogram mode is not worth attempting: it needs either a bitmap or thousands of rects.

**Do not copy / caveats.** Do not use the opencp / Cubic Player name, the copyright line, the module title in its screenshots, or the photograph used as a scope background. The status vocabulary (vol, pan, bal, spd, ord, bpm) is generic. Blue \#0000A9 labels on black are unreadable at README size: lift them to a lighter blue. Block characters can differ slightly in width from letters in some mobile fonts, so check alignment on GitHub web and mobile before relying on labelled columns. Unconfirmed: any personal handle for the author (removed); which 'cubic team' members did what.

**References**

- [Official Open Cubic Player screenshots page (file selector, main screen, oscilloscopes, graphical spectrum analyser)](<https://www.cubic.org/player/screenshot.html>)
- [Main screen image: status header, channels, text spectrum analyser, pattern view](<https://www.cubic.org/player/main.png>)
- [Graphical spectrum analyser image: spectrogram in indigo, red and yellow above a bar spectrum](<https://www.cubic.org/player/graphic.png>)
- [OCP documentation: graphical spectrum analyser (frequency on y, time on x, intensity as colour) and key bindings](<https://cubic.org/player/doc/node30.htm>)
- [Open Cubic Player project page: 'At The Party 1994 the first version of OCP (0.9) was released'; DOS version discontinued 2006](<https://www.cubic.org/player/>)
- [Hugi 14 review of OpenCP v2.5.1a by Fractal/GP: text UI, graphical spectrum analyser, notedots, oscilloscopes, phasegraphs](<https://hugi.scene.org/online/hugi14/muocp.htm>)
- [Demozoo: Inertia Player V1.22 (1995, Inertia; credits) for the graphical-player contrast](<https://demozoo.org/productions/186658/>)
- [Inertia Player screenshot: indigo embossed texture, angular wordmark, cyan scope lines](<https://media.demozoo.org/screens/o/6b/f4/566c.162312.png>)

---

<a name="trk-09"></a>

## trk-09 · Oscilloscope view (one scope per channel)

**Animated SVG** · build: **Easy** · impact: **4/5** · 2010s to present, YouTube chiptune and game-music uploads, rendered with tools such as SidWiz, SidWizPlus (Maxim, 2018-) and corrscope (links to the nyanpasu64 channel); FamiStudio has its own oscilloscope video export. 1990s ancestors: ProTracker's four-window quadrascope and FastTracker II's numbered scope grid.

The standard way to show chip music on video: split the tune into its hardware channels and give each a labelled oscilloscope cell, so you watch the pulse waves, triangles and noise that make up the sound. It works because chip waveforms are simple enough to be legible as single lines. It is the closest thing the chiptune world has to a house visual, and the only style in this family with no text grid at all.

**What it looks like**

- A black 16:9 frame divided into equal cells, one per channel, either a single vertical stack or a grid (3 for SID, 4 for Game Boy, 5 for NES, 9 or 10 for Genesis)
- One thin bright waveform line per cell, 2px at 720p, triggered so that a steady note appears to stand still
- Recognisable wave shapes: hard-edged pulse waves whose duty cycle changes, a stepped triangle, dense hash for noise, smooth complex curves for FM
- A small channel label in the top-left corner of each cell
- Thin pale-blue grid lines between cells, a dim grey horizontal midline through each, and optionally a dim vertical centre line
- Either all-white lines or one distinct saturated hue per channel
- Optionally a darkened still image behind the scopes and a single title line for the track

**Palette.** corrscope's defaults as shown in its own settings panel: background \#000000, line \#FFFFFF at 2.00 px, grid \#55AAFF at 1 px, midline \#404040. Common variant: one saturated colour per channel on black (DefleMask and Furnace use green and pale-blue traces).

**Lettering.** Small plain sans-serif labels, white, top-left of each cell (corrscope's default is Bitstream Vera Sans at size 20 on a 1280x720 frame). Nothing else is written on screen, which is why a single large project title reads strongly against it.

**Motion.** Each line redraws continuously; on a note change the shape snaps to a new period and amplitude; pulse widths sweep; noise cells flicker; silent channels collapse to a flat midline. Motion is constant but contained inside each cell.

**As a README header.** One animated SVG banner, about 830x240: the project name in large plain type across the top or centre, and beneath or behind it a row or grid of 4 to 8 scope cells, each labelled with a real module name (parser, runtime, cli, docs). Give each module a waveform personality: square for the core, triangle for a quiet utility, noise for tests, a smooth FM curve for the API. Everything else in the README stays ordinary text. It also degrades well on phones because there is no small text.

**How to build it.** The ideal SVG subject. Each cell is a polyline or path drawn at least one period wider than its clipPath and moved with a linear infinite translateX equal to exactly one period, which loops seamlessly. A second, slower keyframe set (scaleY for amplitude, or opacity-swapped alternate paths for duty-cycle changes) breaks the regularity. Noise: a jagged path several cell-widths long stepped with steps() so it flickers rather than slides. Six cells are under 10 KB. vector-effect: non-scaling-stroke keeps the line weight constant under scaleY. System sans-serif labels are fine here, so no glyph work is needed. Include @media (prefers-reduced-motion: reduce) to freeze the traces.

**Do not copy / caveats.** The format is free to use; the things to avoid are the usual backdrop (a game's title screen or box art), console and chip-vendor logos, and tool names on the image. Label channels with your own module names. Unconfirmed: who wrote the original SidWiz and when (the SidWizPlus README and licence name only Maxim, 2018, and say 'originally based on SidWiz'; an earlier attribution to a named individual could not be verified and was removed); when the format first appeared, so '2010s' is approximate; corrscope's author is inferred from the repo's link to the nyanpasu64 channel. Constant motion at the top of a page is tiring: keep amplitude modest, avoid flashing fills, and ship the reduced-motion rule.

**References**

- [corrscope repository: renders oscilloscope views of chiptune WAV files with correlation-based triggering](<https://github.com/corrscope/corrscope>)
- [corrscope screenshot: default colours in the Appearance panel and a 4-channel vertical preview](<https://raw.githubusercontent.com/corrscope/corrscope/refs/heads/master/docs/images/corrscope-screenshot.png>)
- [SidWizPlus: generates 'oscilloscope view' videos from multi-track audio; grid, channel labels, background image, line width, fill; 'originally based on SidWiz'](<https://github.com/maxim-zhao/SidWizPlus>)
- [FamiStudio site (release notes mention its oscilloscope video export)](<https://famistudio.org/>)
- [DefleMask screenshot: a labelled grid of per-channel scopes beside the pattern (FM and PSG wave shapes)](<https://deflemask.com/assets/uploads/2022/11/01-1024x556.png>)
- [ProTracker 2.3D quadrascope, the four-cell ancestor](<https://16-bits.org/pt2-clone-1.png>)

---

<a name="trk-10"></a>

## trk-10 · Piano roll and falling notes (up to black MIDI)

**Animated SVG** · build: **Medium** · impact: **3/5** · 1985 onward: Stephen Malinowski's Music Animation Machine (experiments from 1974, first software version 1985), Synthesia by Nicholas Piegdon (October 2006, originally 'Piano Hero'), black MIDI (first on Nico Nico Douga in 2009, reaching YouTube in February 2011), and piano-roll chip editors such as FamiStudio for the NES.

The other way to draw music: pitch on one axis, time on the other, every note a coloured bar. In the falling-note form bars drop onto a keyboard; in the editor form they scroll sideways past a keyboard at the left. Black MIDI pushes it to absurdity, with so many notes that, as Wikipedia puts it, the page looks nearly entirely black.

**What it looks like**

- A piano keyboard strip along one edge (bottom for falling notes, left for an editor roll): pale grey-white keys with shorter dark keys
- Flat rectangular note bars whose length is duration and whose position is pitch, with a slightly lighter leading edge
- One saturated colour per track or channel (cyan, orange, green in the FamiStudio banner)
- A now-line where bars meet the keyboard, and keys that light in the bar's colour as they are struck
- Faint beat and bar grid lines on a dark charcoal background, with alternating slightly lighter columns per beat
- Editor variant: a strip of coloured pattern blocks above the roll, one row per channel (magenta, cyan, yellow, green), a bar-number ruler (12.1, 12.2 ...), a header reading the channel being edited, and tiny note names inside bars (C5, A4)
- Black MIDI variant: dense walls, diagonal sweeps and pictures made of thousands of notes, with the note count boasted in the title or a running counter

**Palette.** Dark charcoal background with saturated track colours; the FamiStudio banner shows cyan, orange, green, magenta and yellow on near-black with a pale grey keyboard. Black MIDI videos cycle through the rainbow by track. Described from the images, not pixel-sampled.

**Lettering.** Minimal: small sans-serif note names inside bars, a plain header naming the channel, a bar ruler in small digits, and in black MIDI a counter. The bars are the typography: block letters can be spelled out of notes.

**Motion.** Bars fall or scroll at constant speed; keys flash on contact; in black MIDI a counter races upward. A README version loops a 6 to 10 second phrase.

**As a README header.** One animated SVG banner: keyboard along the bottom, bars falling in 4 or 5 track colours, each colour keyed to a module in a small legend. What makes it a header rather than decoration is arranging the notes so that, as they fall, they spell the project name in block letters (a black-MIDI picture in miniature), with a static corner counter showing a real number such as commits or tests. To keep it chiptune rather than generic, restrict it to 3-5 monophonic lanes named after chip voices. Section links go in text below.

**How to build it.** Each note is one rect; put all notes in one g and animate the group's translateY linearly in a loop under a clipPath, so there is a single animation however many notes there are (duplicate the first screenful at the end for a seamless wrap). Key flashes need per-key opacity keyframes timed to the loop, so limit them to about a dozen keys. A legible piece needs 100-400 rects (10-30 KB). True black-MIDI density is out of reach: tens of thousands of rects would exceed 250 KB and stall rendering, so fake density with a few large blocks or a pattern fill. A counter that counts up is possible only as a stepped digit strip (a column of digits translated with steps() inside a clip), which is fiddly; a static number is wiser.

**Do not copy / caveats.** Do not transcribe a real copyrighted tune into the roll (a recognisable melody is still the composer's work) and do not use the Synthesia name or UI chrome; invent the note pattern. The piano-roll form itself is old and free. This is the least specifically scene-flavoured style in the family and the weakest fit for the owner's request unless constrained to chip channels as described. Fast dense motion and a racing counter can be uncomfortable: keep fall speed slow and include a reduced-motion rule. Unconfirmed: the phrase 'bar-graph score' for Malinowski's display is not in the Wikipedia article (it says coloured shapes taken from MIDI data); I did not open a black MIDI video, so that variant is described from the article's text.

**References**

- [Wikipedia: Black MIDI (2009 origin on Nico Nico Douga, YouTube from February 2011, visualisers used including Synthesia and Piano From Above, note counts)](<https://en.wikipedia.org/wiki/Black_MIDI>)
- [Wikipedia: Synthesia (Nicholas Piegdon, October 2006, originally Piano Hero)](<https://en.wikipedia.org/wiki/Synthesia_(video_game)>)
- [Wikipedia: Stephen Malinowski (experiments from 1974, Music Animation Machine software 1985, coloured shapes from MIDI data)](<https://en.wikipedia.org/wiki/Stephen_Malinowski>)
- [FamiStudio: NES music editor with a piano roll](<https://famistudio.org/>)
- [FamiStudio banner image: roll, note labels, keyboard at left, coloured pattern strips above](<https://famistudio.org/banner.png>)

---

<a name="trk-11"></a>

## trk-11 · Winamp 2 classic stack (player, equaliser, playlist)

**Animated SVG** · build: **Medium** · impact: **4/5** · 1997-2002, Windows: Winamp by Justin Frankel and Dmitry Boldyrev (Nullsoft); WinAMP 0.20a released 21 April 1997, spectrum analyser added in 1.006, Winamp 2.0 released 8 September 1998. Preserved by Webamp (Jordan Eldredge's browser reimplementation of Winamp 2) and the Winamp Skin Museum; over 100,000 skins archived with the Internet Archive.

> Also researched as [vap-13](vap.md#vap-13).

The desktop player of the MP3 era: three small dark windows snapped into a column. Its skin format spawned a vast body of user designs, now browsable in the Winamp Skin Museum. It is a cousin of the existing keygen-dialog style but a different object: a listening device with a ticker, equaliser and playlist rather than a generator with a serial field.

**What it looks like**

- Three stacked windows, each 275x116 pixels at 1x (the reference image is 275x348 for the stack)
- Thin title bars with the window name centred in tiny bold capitals between two pairs of pale gold horizontal pinstripes, tiny square window buttons at the right
- Main window left: a black display with large green LED-style time digits, a small play-state glyph, and beneath them a spectrum analyser of about 19 narrow bars, red-orange at the tips shading down through yellow to green, with peak caps
- Main window right: a one-line scrolling track-title ticker in green, then small inset boxes for kbps and kHz and mono / stereo indicators with the active one lit green
- Two short sliders (volume with an orange track, balance with a green track), EQ and PL toggle buttons, then a long seek bar with a gold thumb
- A row of five bevelled silver transport buttons (previous, play, pause, stop, next) plus eject, then SHUFFLE and repeat toggles with tiny indicator lamps
- Equaliser window: ON / AUTO buttons at left, PRESETS at right, a small response-curve display, a PREAMP slider and ten band sliders labelled 60, 170, 310, 600, 1K, 3K, 6K, 12K, 14K, 16K, with +20db / +0db / -20db marks and yellow slider tracks
- Playlist window: numbered green track names with right-aligned durations on black, the selected row on a solid blue bar, a vertical scrollbar, and a bottom row of small buttons (+FILE, -FILE, SEL ALL, FILE INF, LOAD LIST) beside a mini time readout

**Palette.** Re-measured from the Winamp 2 stack screenshot by pixel count: displays black \#000000; chrome in a family of dark slate violets \#181829, \#212139, \#292942, \#31314A, \#313152, \#39395A; playlist selection blue \#0000BC. Display text and analyser base bright green, analyser tips orange-red, equaliser tracks yellow, pinstripes pale gold (seen, not sampled). User skins recolour everything.

**Lettering.** A tiny all-caps bitmap face about 5x6 pixels for the ticker, labels and playlist; LED-style digits for the time; bold small capitals for title bars. Bitrate and sample-rate digits use the same pixel face inside inset boxes.

**Motion.** The title ticker scrolls right to left and wraps; analyser bars bounce with falling peak caps; the time counts up; the seek thumb creeps; the playlist highlight steps to the next row at the end of the loop.

**As a README header.** One animated SVG at 2x (550x696 for the full column) or, for a shorter header, the three windows side by side at 825x116 drawn at 1x and displayed at full README width. The ticker scrolls 'repo-name - tagline \*\*\* version \*\*\*'; the kbps and kHz boxes hold two real numbers; the ten equaliser sliders are ten labelled project metrics or language percentages; the playlist is the table of contents with durations replaced by reading time or file counts. Repeat the playlist as a real linked list in text underneath, because the image cannot be clicked.

**How to build it.** The chrome is small bevels and pinstripes: draw with 1px rects at shape-rendering: crispEdges and an SVG pattern for the pinstripes. The 5x6 pixel face must be path glyphs (about 300 placements for ticker, labels and four playlist rows). Ticker: a group wider than its clipPath moved with a linear translateX loop, the text duplicated once for a seamless wrap. Analyser: 19 fixed gradient bars, each revealed by an animated black cover rect (so the green-to-red mapping stays fixed), plus a 1px cap rect on a delayed, slower keyframe. Time digits: a vertical strip of 0-9 per position translated with steps(10) inside a clip. About 30-60 KB. Do not embed real skin bitmaps as data: images, both for rights reasons and because GitHub's raw-file content security policy does not whitelist them.

**Do not copy / caveats.** Winamp's name, lightning-bolt logo, llama and default skin artwork are its owner's trademarks and copyrighted assets: build an original skin in the same three-window format and give it another name. Museum skins belong to their authors and often contain third-party brands and photos; treat them as a gallery of ideas only. The three-window stack, LED timer, ticker and ten-band equaliser are generic player conventions. Overlaps with the existing keygen dialog (dark skinned window plus analyser), so lead with the playlist and equaliser. Tiny pixel text is unreadable on phones. Unconfirmed: the Skin Museum's launch year (the pages opened only show the archive being discussed in December 2020); any claim about which module formats Winamp played natively or by plug-in (removed).

**References**

- [Winamp 2 main, equaliser and playlist windows (the 275x348 stack)](<https://upload.wikimedia.org/wikipedia/en/b/bc/Winamp2.PNG>)
- [Wikipedia: Winamp (21 April 1997 first release, authors, Winamp 2.0 on 8 September 1998, green LED time, skins, skin format reuse)](<https://en.wikipedia.org/wiki/Winamp>)
- [Winamp Skin Museum: a scrolling wall of classic skins](<https://skins.webamp.org/>)
- [Webamp: 'Winamp 2 in your browser'](<https://webamp.org/>)
- [Jordan Eldredge on preserving over 100k Winamp skins with the Internet Archive](<https://jordaneldredge.com/ia-skins/>)

---

## Considered and left out

- None of the researcher's ten styles was dropped; all ten survive with corrections, and one was added by splitting out the sample-list message board.
- OctaMED (Teijo Kinnunen; MED 1989, OctaMED 1991; two software-mixed channels per hardware channel): not made a style. No screenshot could be opened, so there is nothing to draw from, and it would be a variant of the Amiga tracker entry.
- DeliTracker, XMPlay: not made styles. DeliTracker has no reachable visual source (its Wikipedia URL is 404). XMPlay is confirmed only in text (un4seen.com: 1998, skinnable, MOD pattern display) and would duplicate the Winamp entry.
- AY / ZX Spectrum tracker (Vortex Tracker II): not made a style. The repository page confirms only 'music tracker for AY/YM chips' and has no screenshots; the multi-chip tracker entry covers the chip-named-columns idea.
- Renoise and OpenMPT / ModPlug: deliberately left out (the brief asked for Renoise 'for contrast'). Both read as ordinary modern desktop software rather than scene artefacts; screenshots exist on Wikipedia's Music tracker page if wanted later.
- Keygen music 'music by ...' on-screen credit as a style: not made. Wikipedia's Keygen article confirms only that keygens often play tracker chiptunes and show a group logo; no source describes a standard credit format, and the look itself is the existing keygen-dialog style. Treat a credit line as an optional detail there.
- VU meters / LED ladders as a standalone style: not made. They are components of the ProTracker, Cubic Player and Winamp entries and no source treats them as a separate look.
- nanoloop and Inertia Player as standalone styles: folded in as contrasts (nanoloop under the Game Boy entry, Inertia Player under Cubic Player). Each is confirmed from one or two images, which is too thin for a full style, and nanoloop's bare 4x4 grid has almost no room to carry project content.
- AHX: not included; no source could be opened for it.
