# ANSI art, BBS and text-mode

<sub>Generated from <code>styles.json</code> by <code>tools/build-styles.mjs</code>. 12 styles, researched 2026-09-30. Checked by a second reviewer, who made 29 corrections. [Back to the catalogue](README.md) · [Full index](INDEX.md)</sub>

## Reviewer's summary

Checked against the sources, this family holds up as three worlds, with several corrections and three additions. (1) The PC ANSI artscene: ACiD (founded 1 September 1990), iCE (1991, first monthly pack August 1992), later Fire, Dark, CIA, Fuel, and the revival groups (Blocktronics, Mistigris - 'since 1994', Legacy Krew, Impure, Lazarus, still releasing in 2020-2026). It is 80-column CP437 art in 16 colours, and its recognisable manners are lettering (hand-built gradient logos gathered into collies, plus the ready-made TheDraw font system), figure drawing (the toon manner, which 16colo.rs ties mainly to Toon Goon of iCE, and the comic-book/graffiti scroller that the Blocktronics 'ACiD Trip' pushed to 3,266 lines in 2013) and motion (ansimation, clocked only by modem speed). (2) The BBS as a look: post-login data screens and file listings, door games with their bracketed-hotkey grammar, and RIPscrip, the EGA 640x350 vector protocol with bevelled buttons and dithered fills (NAPLPS/Telidon is its older videotex cousin). (3) Non-PC character worlds defined by grid and glyph set: teletext (40x25, 2x3 mosaics, eight pure colours, attribute codes that cost a cell), Minitel/viewdata (the same grid seen in eight grey levels, with numbered menus and function-key legends), PETSCII (40x25, ROM glyphs only, one colour per cell), text-mode demos (effects quantised to an 80x50 cell grid), and the modern terminal habit of plotting with Braille dots. For GitHub the practical split is: anything that depends on colour or on solid stacked blocks must be an SVG built from rectangles (one path per colour, shade characters as small pattern fills, no reliance on fonts); only layouts made from box-drawing lines, plain ASCII and Braille survive as monochrome text in a pre block, because GitHub's tall code line-height opens gaps between rows of full blocks. Twelve styles are returned: nine from the original research (corrected), one merged away, and three added to cover parts of the brief the research left in its notes (TheDraw fonts, Minitel/viewdata, Braille-dot terminal graphics). Web search was unavailable for this check (budget exhausted), so verification was done by opening every cited URL directly, viewing the key images in a browser, and a handful of Brave searches for the new material.

## Styles

| ID | Style | Medium | Build | Impact |
| --- | --- | --- | --- | --- |
| [ansi-01](#ansi-01) | ANSI logo colly (gradient block-letter logos between cut lines) | Text + SVG | Medium | 4/5 |
| [ansi-02](#ansi-02) | TheDraw font banner (outline and block typefaces) | Text | Easy | 3/5 |
| [ansi-03](#ansi-03) | Illustrated ANSI: toon mascot and comic-book / graffiti scroller | Animated SVG | Hard | 5/5 |
| [ansi-04](#ansi-04) | ANSImation: the modem-speed draw-in | Animated SVG | Medium | 4/5 |
| [ansi-05](#ansi-05) | BBS data screens: stats header, last callers, file-area table | Text + SVG | Easy | 3/5 |
| [ansi-06](#ansi-06) | Door game screen (narrated location, bracketed hotkeys, command prompt) | Text + SVG | Easy | 4/5 |
| [ansi-07](#ansi-07) | RIPscrip vector BBS screen (with NAPLPS/Telidon as its videotex cousin) | Animated SVG | Medium | 4/5 |
| [ansi-08](#ansi-08) | Teletext page (Ceefax-style index with mosaic graphics) | Animated SVG | Medium | 5/5 |
| [ansi-09](#ansi-09) | Minitel / viewdata service page (numbered menu, function-key legend) | Animated SVG | Medium | 4/5 |
| [ansi-10](#ansi-10) | PETSCII plain picture and directory art | Static SVG | Medium | 3/5 |
| [ansi-11](#ansi-11) | Text-mode demo effect (plasma in character cells) | Animated SVG | Medium | 4/5 |
| [ansi-12](#ansi-12) | Braille-dot terminal graphics (modern TUI dashboard) | Text | Medium | 3/5 |

---

<a name="ansi-01"></a>

## ansi-01 · ANSI logo colly (gradient block-letter logos between cut lines)

**Text + SVG** · build: **Medium** · impact: **4/5** · 1993-1999 peak on PC BBSes; ACiD issued numbered 'logoclusters' in its Acquisition packs (number 10 is dated September 1995). Still produced: Legacy Krew (file dated December 2020, pack filed under 2021), Impure pack 80 (August 2021), Lazarus pack 21 (April 2026).

A colly is one tall ANSI file stacking many BBS or group logos, separated by cut lines so each sysop can snip out theirs. It is the lettering school of the ANSI scene, where the letterforms are the whole picture; 16colo.rs tags 606 files 'logo colly' and 3,291 'logo'. The logocluster viewed is 80 columns by 382 rows and credits six artists.

**What it looks like**

- Custom letterforms 8-14 rows tall filling most of the 80 columns, built from full blocks with half blocks for half-cell edges; every letter is drawn individually, so no two repeated letters are identical
- Vertical gradient through each letter made with the dark/medium/light shade characters between two or three palette neighbours (viewed: white to light grey to dark grey; dark grey to green; yellow to green to blue with white feet)
- One small accent hue inside the counters (thin cyan slivers inside an otherwise grey logo)
- Separator: a full-width row of dashes with a short bracketed 'cut' tag near each end, tag in bright blue, dashes in dim grey
- Dim grey lowercase tagline under the logo with runs of dots between phrases; a phone number stacked at the right and repeated about six times, fading from white through grey to dark grey
- A short artist signature (2-6 characters, initials plus group) in dim text above or beside the first letter
- 2021 outline variant (threaz, Impure pack 80, set in an Amiga font): hollow letters drawn with slashes, underscores and pipes, coloured row by row in a two-hue gradient (yellow-green-cyan, magenta-cyan, yellow-red), sitting on a hatched blue slab with dotted rules left and right
- Roster variant: the same logo reused as a group member list, with handles grouped under section headings (founder, senior staff, artists, coders, couriers, boards in the August 1995 ACiD listing, 80x119)

**Palette.** The 16-colour PC text palette on black. Each logo uses 2-3 hues plus their bright/dark partner; the greys (dark grey, light grey, white) act as chrome. Background is almost always black.

**Lettering.** No font file: hand-built block letters, often interlocked and hard to read. Small print is the 8x16 IBM VGA ROM font in lowercase with mixed 'eLiTe' capitals. SAUCE metadata on the modern examples names the font (IBM VGA, or Amiga mOsOul for the threaz piece).

**Motion.** Static originally. In SVG the shade ramp can step slowly down the letters (palette-cycling the three or four ramp classes), or the stack can scroll through a 25-row window as an artpack viewer would.

**As a README header.** Above the fold: the project name as one 80-column gradient block logo in an SVG (for colour and gap-free blocks), a dim one-line tagline, the repo URL repeated and fading at the right, then a cut line. Further down each README section (INSTALL, USAGE, CREDITS) can open with a smaller logo between cut lines; those can be monochrome pre text using the shade ramp. Contributors can be set as a roster under the logo.

**How to build it.** Generate letters from your own small block alphabet scaled up, then assign a ramp step per row. In the SVG emit one path per colour made of rectangle sub-paths (merge runs along each row), and render the three shade characters as three small dot-lattice pattern fills at 25/50/75 percent over the background colour, with crisp edges; an 80x14 logo is a few KB. The pre fallback uses only the full block, half blocks and the three shades, which are in the basic Windows/Mac monospace fonts, but it is monochrome and GitHub's code line-height leaves thin horizontal gaps between block rows, so the SVG must carry the hero logo. Machine-scaled letters will look more regular than real hand-drawn scene logos.

**Do not copy / caveats.** Do not copy any existing logo, board or group name, phone number or artist signature. The ramp technique, cut-line layout and fading repeat are free to reuse. Shade characters render differently in every font in pre blocks. Wildstyle illegibility hurts accessibility, so keep the plain project name in text nearby. Not re-viewed in this check: the letter-spaced headings and slash-separated handles the original research described in the 1995 member listing, and the per-letter gradient on the Lazarus roster; only their titles, sizes, dates and section names were confirmed.

**References**

- [ACiD logocluster \#10 (09/95), six credited artists, 80x382 - viewed: grey gradient logo with cyan slivers, fading phone numbers, bracketed cut lines](<https://16colo.rs/pack/acdu0995/ALC0995.ANS>)
- ['Logo colly' by Smooth, Legacy Krew pack lgcy-003, 80x122, IBM VGA, SAUCE date 18 December 2020](<https://16colo.rs/pack/lgcy-003/5m-logocolly.ans>)
- ['bbs logos' by threaz, Impure pack 80, 4 August 2021, 80x85, Amiga mOsOul font - viewed: coloured outline lettering on hatched slabs](<https://16colo.rs/pack/impure80/tr-bbslogos.ans>)
- [16colo.rs tag index: logo 3,291; logo colly 606; font 1,244; memberlist 2,577; infofile 2,757](<https://16colo.rs/tags>)
- [ACiD 'August 1995 Member/Board Listing', 80x119, section headings from Founder to Member Boards](<https://16colo.rs/pack/acdu0995/ACID0895.ANS>)
- [LAZ21 member list by krl and warpus, Lazarus, 29 April 2026, 80x144 - a roster laid out on a tall illustration](<https://16colo.rs/pack/laz21/LAZ21MEM.ans>)

---

<a name="ansi-02"></a>

## ansi-02 · TheDraw font banner (outline and block typefaces)

**Text** · build: **Easy** · impact: **3/5** · TheDraw by Ian E. Davis (TheSoft Programming Services), first released 5 January 1986, last public version 4.63 in October 1993. Fonts for it were drawn by scene artists through the 1990s; the tdfiglet project bundles 1,198 known .TDF fonts, and 16colo.rs tags about 1,200 files 'font' (peak 1998-2002).

TheDraw, the standard DOS ANSI editor, had a font manager: you typed a word and it stamped large letters from a .TDF font. It is the ready-made cousin of the hand-drawn logo, and the source of thousands of BBS headers whose letters are all cut from the same typeface. The format has three font types: Outline, Block and Color.

**What it looks like**

- A real typeface: every repeated letter is identical and sits on one baseline, unlike hand-drawn scene logos
- Glyphs up to 12 rows tall and up to 30 columns wide, proportional widths, with a per-font letter-spacing setting (format limits from the reverse-engineered specification)
- Outline type: hollow letters traced with box-drawing line characters, right-angle corners, no fill - reads as wireframe capitals
- Block type: solid letters from full and half blocks and shade characters in a single colour chosen by the user
- Color type: each cell carries its own colour; the example viewed is bright cyan slab letters with lighter shade-character top faces and dark-grey rectangular counters, giving a bevelled look
- One word per banner line, left-aligned or centred in 80 columns; long names break into two stacked banners
- 94 printable characters at most per font; many scene fonts define capitals and digits only

**Palette.** Outline and Block fonts are monochrome by design (any one of the 16 colours on black). Color fonts typically use 2-4 palette entries: a bright hue, its dark partner and a grey.

**Lettering.** The .TDF font itself: fixed maximum 12 rows, glyph data stored row by row. For a README this means a self-drawn alphabet of 26 capitals plus digits at 5-7 rows tall so a 12-16 letter name fits in 80 columns.

**Motion.** Static. Optional in SVG: letters stamp in one at a time, left to right, as they did when typed in the editor.

**As a README header.** A text-only header: the project name set in an outline font made of box-drawing lines inside a pre block, a one-line tagline under it, then a rule. Because it is a font, any project name can be generated automatically. A block-font or colour-font version goes in an SVG when colour or solid fills are wanted.

**How to build it.** Draw your own outline alphabet as strings of box-drawing characters (single-line or double-line sets, which are in the default monospace fonts on Windows, macOS and Linux) and concatenate glyphs with a spacing column. Hollow letters suffer far less from GitHub's code line-height than stacked full blocks, though vertical strokes can still show hairline breaks in some fonts. Keep the banner at 78 columns or fewer; break long names into two lines. The colour variant reuses the SVG cell pipeline from the logo colly.

**Do not copy / caveats.** Do not ship scene .TDF files: they were drawn by many artists, carry embedded names and have no clear licence; draw your own alphabet. 'TheDraw' is someone else's product name, so describe the style, do not brand with it. The glyph limits come from a reverse-engineered specification, not from official documentation. I did not view an Outline-type font rendered, only the specification's description of it and one Color-type screenshot.

**References**

- [TheDraw: author, dates, font manager, 100-row limit, 50-line animation limit](<https://en.wikipedia.org/wiki/TheDraw>)
- [Roy/SAC: reverse-engineered .TDF specification - three font types, 12-row and 30-column glyph limits, 94 characters, 34 fonts per file](<https://roysac.com/blog/2014/04/thedraw-fonts-file-tdf-specifications/>)
- [Roy/SAC TheDraw fonts collection and usage guide](<https://roysac.com/thedrawfonts-tdf.html>)
- [tdfiglet: a figlet for TDF fonts, 1,198 fonts bundled; screenshot viewed (cyan colour font)](<https://github.com/tat3r/tdfiglet>)
- [16colo.rs 'font' tag: about 1,200 files, mostly .ANS, a few .TDF, peak 1998-2002](<https://16colo.rs/tags/content/font>)

---

<a name="ansi-03"></a>

## ansi-03 · Illustrated ANSI: toon mascot and comic-book / graffiti scroller

**Animated SVG** · build: **Hard** · impact: **5/5** · Toon manner 1993-1996 (16colo.rs 'toon' tag: 58 files, 37 by Toon Goon, 35 in iCE packs, most from 1994-1995). Comic-book figure work from 1992 onward, after Image Comics launched (about 70 Spawn pieces in 1994 alone, per Break Into Chat). Revived from 2008 by Blocktronics, whose 2013 'ACiD Trip' collaboration ran to 3,266 lines and took first place at Demosplash.

The figure-drawing schools of the ANSI scene. Public-domain artists of the late 1980s drew flat, cartoony pictures in solid blocks on a single screen; underground artists added shade-character blending and stretched pieces far beyond 25 rows so they scroll. People remember it because a modem painted these pictures line by line as the advert for a board.

**What it looks like**

- 80 columns wide and much taller than 25 rows (the 1995 toon piece viewed is 80x153); the figure is tightly cropped and runs off the side edges
- Toon manner: 1-2 cell black outline cut with half blocks, flat saturated fills, shade characters only where two neighbouring colours meet, large plain white areas for eyes and gloves
- Flat single-colour backdrop in a bright hue (royal blue, purple or red in the pieces viewed); bright backgrounds need the iCE-colours mode, which trades blink for 16 background colours
- A header band on black above the picture: the group or 'studio' title in white block letters with grey shading, or the artist's monogram logo
- A small boxed credit plaque inside the picture (artist, group, the word 'production' on three lines, blue box with a drop shadow) plus a short signature
- Comic manner (described in the sources, the long Blocktronics pieces not re-viewed here): heavy black contour, three-step shade-character modelling on every surface, small white highlights
- Wildstyle title lettering: interlocked letters with shards and drips over a drop shadow (the 80x55 'evoke 2013' piece; its colours were not re-viewed)

**Palette.** 16 foreground colours; 8 backgrounds normally, 16 with the iCE-colours flag set in the SAUCE record. Skin from brown, red, light red and yellow; metal from dark grey, light grey, white; the whole thing on black or one flat bright colour.

**Lettering.** Block-letter headline in white with grey shading, or wildstyle lettering; any body text is the IBM VGA 8x16 font. The SAUCE record carries title (35 characters), author (20), group (20), date and the flags.

**Motion.** Static art experienced as a vertical scroll. In SVG, translate a tall piece upward through a 25-row window at constant speed and loop, pausing on the title.

**As a README header.** Above the fold: one SVG showing an 80x25 to 80x40 cell window with an original project mascot in the toon manner on a flat bright ground, a block-letter title band and a credit plaque. Optionally the SVG scrolls slowly through 100 or more rows (mascot, then feature panels as comic frames) and loops. All real information stays as text below.

**How to build it.** Rendering is simple: cells become rectangle sub-paths, one path per colour, shade characters as dot patterns; roughly 80x120 cells stays well under 250 KB with run merging, and the scroll is a single translate animation on a group inside a clipped viewport. The blocker is authorship: the picture has to be drawn by a person in an ANSI editor (PabloDraw or Moebius) and converted; it cannot be generated. The toon manner (outline plus flat fills) is the tractable one to commission or draw.

**Do not copy / caveats.** Most surviving toon and comic ANSIs depict licensed cartoon and comic characters; do not rip those or redraw anyone's ANSI. Use an original mascot. Avoid the gore and explicit imagery common in the genre. The 'first' claims in this area rest on single secondary sources. The original research credited Toon Goon to a Break Into Chat article that does not mention him; the artist and the toon tag are confirmed on 16colo.rs instead. An 'abstract' manner exists (114 tagged files, mostly Mistigris 2016-2019) but is too thin to specify.

**References**

- ['Confusion ?' by Gangstar, ACiD, 1 September 1995, 80x153 - viewed: white block title on black, flat blue ground, boxed credit plaque](<https://16colo.rs/pack/acdu0995/GAS-CFS2.ANS>)
- [16colo.rs 'toon' tag - viewed: thick outlines, flat fills, bright flat backgrounds, monogram headers](<https://16colo.rs/tags/content/toon>)
- [Toon Goon artist page: 328 files, 250 in iCE, peak 1994-1997](<https://16colo.rs/artist/toon%20goon>)
- ['evoke 2013' by avenging angel, Blocktronics, 80x55, IBM VGA](<https://16colo.rs/pack/blocktronics_acid_trip/avg-EVOKE2013.ANS>)
- [Blocktronics ACiD Trip pack (2013), 98 files](<https://16colo.rs/pack/blocktronics_acid_trip/>)
- [Break Into Chat, ANSI art and webcomics part 2: public-domain flat style versus underground shading; Jed's toony animations; Image Comics and Spawn](<https://breakintochat.com/blog/2025/12/28/ansi-art-and-webcomics-bbses-and-the-artscene/>)
- [Break Into Chat part 3: Eerie's 300-row ANSI comics (Imperial pack, August 1994) and TheDraw's 100-row limit](<https://breakintochat.com/blog/2025/12/31/ansi-art-and-webcomics-part-3-eerie-and-inspector-dangerfuck/>)
- [ACiD Productions: founding, ACiD Trip at 3,266 lines, Demosplash first place](<https://en.wikipedia.org/wiki/ACiD_Productions>)
- [iCE Advertisements: founded 1991, first monthly pack August 1992](<https://en.wikipedia.org/wiki/ICE_Advertisements>)
- [SAUCE specification: 128-byte record, iCE-colour, letter-spacing and aspect flags](<https://www.acid.org/info/sauce/sauce.htm>)

---

<a name="ansi-04"></a>

## ansi-04 · ANSImation: the modem-speed draw-in

**Animated SVG** · build: **Medium** · impact: **4/5** · 1990-1996 peak: 16colo.rs tags 614 files as ansimation, 387 of them .ANS, with 164 from 1992 and 162 from 1993; ACiD accounts for 172, led by Jed (45), RaD Man (38), Shadow Demon (19) and Tempus Thales (17). Revived occasionally since (Kirkman's animated info file for a 2017 Blocktronics pack).

An .ANS file whose cursor-positioning escape codes redraw parts of the screen so that, fed through a slow modem, it plays as a cartoon; there is no timing in the file, the line speed is the clock. Even static ANSIs were first seen as a top-to-bottom paint-in, which is the motion people remember.

**What it looks like**

- The screen fills left to right, top to bottom, one character at a time behind a solid cursor block
- A single-screen stage addressed by cursor position (TheDraw's animation mode is limited to 50 lines)
- Sprites move by erase-and-redraw at cursor-addressed positions, with slight flicker
- Flat, toony block figures and large block lettering rather than fine shading, because thin animated shapes need contrast
- Speed is part of the look: the 16colo.rs player offers 2400, 9600, 14400, 28800, 38400, 57600 and 115200 baud, and the same file plays as slapstick or as a blur
- Black background; bright yellow, white and cyan foreground shapes

**Palette.** 16-colour ANSI on black, leaning on the bright half of the palette.

**Lettering.** IBM VGA 8x16 for text; titles in block letters several rows high.

**Motion.** Row-by-row character reveal with a leading cursor: 2400 baud is about 240 characters a second, so a bare 80x25 screen takes a little over 8 seconds and longer with colour codes. Then a 2-4 frame sprite loop and a blinking cursor parked at the end.

**As a README header.** One SVG above the fold: the header (logo, version line, three facts) paints in at modem speed once and then holds, while a small sprite keeps looping (a conveyor, a spinner, a walking figure). The same content is repeated as static pre text underneath for anyone who sees only the first frame.

**How to build it.** Draw the finished screen as colour paths, then hide each row under a background-coloured cover rectangle that slides right in 80 discrete steps (CSS transform with a steps(80) timing function, animation-delay equal to the row index times the row duration, fill-mode forwards). A one-cell light rectangle on the same timing is the cursor. Sprite frames are groups toggled by opacity keyframes with steps. Add a prefers-reduced-motion rule that removes the covers so the finished screen shows. Twenty-five transforms is cheap and works in every browser that animates SVG in img.

**Do not copy / caveats.** Do not recreate film title crawls or other trademarked sequences, as the 2017 example does deliberately, and do not reuse cartoon characters as the 1992 classics did. The draw-in technique is free. Keep blinking under three flashes a second. The first frame is an empty black screen, so a static text fallback is required. The original research's mention of a Mistigris animated FILE\_ID could not be confirmed and was removed.

**References**

- [Roy/SAC: what ANSI animation is - cursor codes, no timing, modem-speed dependency, TheDraw, Tracer and Jed, 'The Bog' (1992)](<https://roysac.com/blog/2008/01/what-is-ansi-animation-or-ansimation/>)
- [Blocktronics Detention Block AA-23 animated info file by Kirkman (2017), with the baud-rate player](<https://16colo.rs/pack/blocktronics_detention_block_aa-23/__BLOCKTRONICS_Detention_Block_AA-23_Animated_NFO_File.ans>)
- [16colo.rs ansimation tag: artists, groups and year counts](<https://16colo.rs/tags/content/ansimation>)
- [Break Into Chat: 'Bart and the Feds' by Jed and Slash, early 1992, and Jed's toony animation style](<https://breakintochat.com/blog/2025/12/28/ansi-art-and-webcomics-bbses-and-the-artscene/>)
- [TheDraw: animation mode and its 50-line limit](<https://en.wikipedia.org/wiki/TheDraw>)
- [Break Into Chat: the Atari cousin - ATASCII cursor-control animations and 'Atari Toons' (ANTIC, August 1985)](<https://breakintochat.com/blog/2014/05/07/atascii-animations/>)

---

<a name="ansi-05"></a>

## ansi-05 · BBS data screens: stats header, last callers, file-area table

**Text + SVG** · build: **Easy** · impact: **3/5** · 1990-1997 on PCBoard (Clark Development, 1983-1997), Renegade, Telegard, WWIV and Wildcat boards; alive on Mystic, Synchronet and ENiGMA boards today (the menu set viewed is dated April 2020). The artpack info-file table it borrows from ran monthly from 1992 (ACiD's Acquisition, iCE's packs).

After login a board walked you through data screens: who called last, a wall of user one-liners, system stats, then message and file areas with FILE\_ID.DIZ descriptions. Sysops commissioned matching header art for each and artists released them as menu sets (16colo.rs files 692 of these under the 'matrix' tag). This is a sub-variant of the existing ANSI BBS style: the tables after login, not the login or main menu. The artpack info file and its file table have been merged in here.

**What it looks like**

- Header strip: board logo at left in gradient block letters (yellow to green to cyan to white in the set viewed), and at right a stats block of label-colon-value pairs (system time, system date; megabytes up and down, upload/download ratio)
- Screen title in eLiTe mixed capitals, right-aligned above a ragged frame made of grey shade characters
- Hotkeys as one- to three-character inverse-video cells in a contrasting colour (green, orange, red, cyan), each followed by the command word in lowercase and a run of dot leaders
- A letter-spaced placeholder line for rumours or one-liners, then a prompt line in cyan with chevrons, at the foot of every screen
- A themed spot illustration at the right edge overlapping the frame (white skulls in the set viewed)
- File table in the artpack manner: columns for number, FILENAME.EXT, size, date, data-type codes and description, ruled with box-drawing lines, with a totals footer (file count, bytes, compression)
- File descriptions in the FILE\_ID.DIZ shape: at most 45 columns by 10 lines in the original convention; artpacks now recommend a 44x22 card
- Info-file masthead (viewed): group name in plain grey block letters between two full-width thin rules, a justified paragraph inside a single-line box, and a one-line boxed release stamp with pack name and date

**Palette.** Cyan, green and white text on black with yellow highlights and one magenta or red accent; frames in dark and light grey; the info-file masthead is greys only.

**Lettering.** IBM VGA 8x16; lowercase commands, eLiTe capitalisation in titles; 8.3 upper-case filenames prefixed with artist initials. On the boards themselves colour came from each package's own codes (PCBoard at-X codes, Renegade and Celerity pipe codes, WWIV heart codes).

**Motion.** Static. Optional in SVG: an inverse lightbar stepping down the rows, a progress bar filling, a blinking prompt cursor.

**As a README header.** Above the fold: a header strip with the project logo and a stats block (version, licence, last release date, written at build time). Below it 'last callers' becomes the latest releases or contributors, the one-liners wall holds user quotes, and the file area lists modules or downloads with 45-column descriptions and a totals footer. All of that works as pre text with links on filenames; an SVG header strip supplies the colour and the inverse hotkey cells.

**How to build it.** It is tables and label-value pairs in 80 columns with box-drawing rules and dot leaders, which GitHub renders reliably in a pre block, and links work on the filenames. Inverse-video cells and the lightbar exist only in the SVG. Numbers cannot be live: generate them in a release script or a GitHub Action and rewrite the README.

**Do not copy / caveats.** Do not reuse real board names, phone numbers or sysop handles, or ACiD's masthead wording. Ratio and leech vocabulary carries warez connotations; keep it playful and accurate. Stale stats look worse than none, so only show values you regenerate. As a pure-text layout this sits close to the existing scene-NFO style; its distinct part is the stats strip and the ruled tables. The ACiDView/ACiD View viewer interface was not viewed and is not specified here.

**References**

- [XiBALBA colly by MaDDoG, Legacy Krew, April 2020, 80x107 - viewed: stats blocks, inverse hotkey cells, rumour and prompt lines, skull illustration](<https://16colo.rs/pack/lgcy-002/md-xibalba.ans>)
- [16colo.rs 'matrix' tag: in practice whole menu sets, 1995-2002 and later](<https://16colo.rs/tags/content/matrix>)
- [ACiD Acquisition info file, 1 September 1995 - viewed: block-letter masthead, boxed blurb, boxed release stamp, ruled file table](<https://16colo.rs/pack/acdu0995/ACDU0995.NFO>)
- [Bryan Ashby: FILE\_ID.DIZ (10 lines of 45 characters, PCBDescribe by Michael Leavitt at Clark Development), DESC.SDI, FILES.BBS](<https://l33t.codes/2020/12/10/Retro-standards-part-1-file-descriptors/>)
- [FILE\_ID.DIZ FAQ: 45x10, and warez groups using high-ASCII logos in it from 1993](<https://roysac.com/file_iddesc.html>)
- [16colo.rs forum: 44x22 recommended for artpack FILE\_ID files](<https://forum.16colo.rs/t/artpack-file-id-diz-file-id-ans/101>)
- [Mystic BBS screenshots: configuration editor, message reader, area list](<https://mysticbbs.com/screenshots.html>)
- [Ben Garrett's bbs module: colour-code syntaxes for PCBoard, Wildcat, WWIV, Renegade, Celerity, Telegard](<https://github.com/bengarrett/bbs/blob/main/README.md>)
- [PCBoard: 1983 to 1997, the de facto standard on PC warez boards](<https://en.wikipedia.org/wiki/PCBoard>)
- [SAUCE specification, for the one-line caption (title, author, group, date)](<https://www.acid.org/info/sauce/sauce.htm>)

---

<a name="ansi-06"></a>

## ansi-06 · Door game screen (narrated location, bracketed hotkeys, command prompt)

**Text + SVG** · build: **Easy** · impact: **4/5** · 1989-1997. Legend of the Red Dragon by Seth Robinson (Wikipedia dates it to 1989; Break Into Chat says it began on the Amiga and the earliest surviving PC version is 1.7 of 24 May 1992; sold to Metropolis Gameport in 1998). TradeWars 2002 by Gary Martin (version 1.00 June 1991, after his 1986 TradeWars 2001 port of Chris Sherrick's 1984 Trade Wars; version 3 in 1997).

Door games were external programs a BBS handed the caller to, played in daily turns through plain text with ANSI colour. The two best-remembered ones fixed a grammar - a titled location, a paragraph of narration, choices marked by a bracketed hotkey letter, a status-bearing prompt - that anyone who dialled a board recognises instantly.

**What it looks like**

- Fantasy manner (viewed): bold white game title, a dash, then the location name in green on one line; under it a full-width rule of alternating hyphen and equals signs in dark blue
- A green paragraph of second-person narration, five lines or so, ending in an ellipsis
- Choices written with the hotkey letter in round brackets inside the word, the default answer in square brackets, highlighted in yellow inside a magenta prompt line (viewed on the space-trader landing screen)
- Space-trader manner: label-colon-value lines for the current sector, a warps line listing neighbouring sector numbers with unexplored ones in round brackets, and a command prompt carrying time left and the current sector number in square brackets plus a help hint
- Port report as a five-column table under a dashed header: item, buying or selling, amount trading, percent of maximum, amount on board
- Title screen (viewed): white stencil block logo with grey undersides in two stacked words, the year numerals in red, a single-dot starfield, a blue shade-character planet limb in the top-right corner, a grey station silhouette, thin blue horizontal speed lines, a magenta bracketed pause prompt bottom-left
- Story screens (viewed): green narration wrapped beside two small ANSI vignettes, each inside a thin blue single-line box, with an orange status line and a magenta prompt below

**Palette.** Fantasy: green on black with white, magenta and dark blue. Space: green and cyan text, yellow emphasis, orange/brown status lines, magenta prompts, blue box frames, greys for ships and stations.

**Lettering.** IBM VGA 8x16; bracketed hotkeys; aligned label : value pairs; narration in sentence case, prompts terse.

**Motion.** Static text. In SVG: a command types itself at the prompt, the screen clears and redraws the next location or sector, the cursor blinks.

**As a README header.** Above the fold: a location title line (project name, dash, a place name), the dashed rule, one narrated paragraph as the pitch, then the README sections as choices with bracketed hotkeys - each a link - and a prompt line at the bottom. That works in a pre block. An SVG variant adds the colour coding and a title vignette with starfield and stencil logo. The space-trader layout suits data-heavy projects: sector as module, warps as related modules, the port report as a stats table.

**How to build it.** Plain ASCII under 80 columns with links inside pre for the choices. Colour needs the SVG; there the text can be ordinary SVG text in a generic monospace stack, because no block art depends on exact glyph shapes (set an explicit character advance with textLength so columns hold), or pixel-font paths for fidelity. The title vignette reuses the cell-rectangle pipeline.

**Do not copy / caveats.** Do not use either game's name, characters, place names, monsters or prose, and avoid the Star Trek borrowings of the space game. The location / bracketed choices / prompt grammar is generic and free. Monochrome pre loses the colour coding that makes it instantly readable. The lower half of the fantasy game's menu (the two-column option list and the prompt line) was not visible in the capture that loaded, so its exact layout is unconfirmed; sources also disagree on its first platform (Amiga versus MS-DOS) and on when the space game's rights changed hands (1998 versus 2000).

**References**

- [Break Into Chat wiki: Legend of the Red Dragon - history, title screens, a gameplay capture of the inn (only its top half loaded)](<https://breakintochat.com/wiki/Legend_of_the_Red_Dragon>)
- [Break Into Chat wiki: TradeWars 2002 - title screen and planet-landing screen viewed](<https://breakintochat.com/wiki/TradeWars_2002>)
- [Aaron Reed, 50 Years of Text Games: 1991 Trade Wars 2002 - sector display, prompt format, port table, daily turns](<https://if50.substack.com/p/1991-trade-wars-2002>)
- [TradeWars 2002 version 2 manual: sector display, port classes 1-8, menus](<https://bearstrong.net/tekst97/data/spill/twinstr/>)
- [Trade Wars lineage: Sherrick 1984, Martin 1986 and 1991, Pritchett](<https://en.wikipedia.org/wiki/Trade_Wars>)
- [Legend of the Red Dragon: 1989, daily turns, locations, 1998 sale](<https://en.wikipedia.org/wiki/Legend_of_the_Red_Dragon>)
- [Break Into Chat (June 2026): sysops swapping the lettering on door-game title art (Solar Realms Elite)](<https://breakintochat.com/blog/2026/06/14/the-mystery-of-the-solar-realms-elite-title-screen/>)

---

<a name="ansi-07"></a>

## ansi-07 · RIPscrip vector BBS screen (with NAPLPS/Telidon as its videotex cousin)

**Animated SVG** · build: **Medium** · impact: **4/5** · RIPscrip by Jeff Reeder, Jim Bergman and Mark Hayton at TeleGrafix Communications, Huntington Beach: introduced 1992 (Wikipedia) or 1993 (Break Into Chat), version 1.5x built on Borland's BGI, version 2.0 in 1995, version 3.0 never finished; the company was still selling a RIP telnet client in 1997. 16colo.rs holds 2,508 .RIP files, peaking 1994-1998 (654 in 1995). The cousin: Telidon, launched publicly 15 August 1978 in Canada, standardised as NAPLPS in 1983.

A protocol that sent drawing commands as text so a BBS could show 640x350 EGA vector pictures with clickable buttons instead of ANSI. It is remembered as the road not taken: art groups drew for it, door games shipped RIP menus, then the web arrived. Videotex art on Telidon used the same idea a decade earlier and also draws itself object by object.

**What it looks like**

- 640x350 EGA canvas with non-square pixels and 16 fixed colours
- Flat flood fills plus 8x8 fill patterns - checker and hatch dithers that mix two palette colours into in-between tones (blue-on-black rings, brown-on-yellow wood)
- Thick black outlines around hand-plotted polygons, with texture such as wood grain drawn as black line strokes
- Stroke fonts scaled large with visibly straight segments: a gothic blackletter for titles, a triplex serif and a plain sans for labels
- Menu as a centred list on a parchment scroll or panel in the middle of an illustrated scene (nine text choices under a gothic heading in the door-game inn menu viewed)
- Bevelled grey 3D button with a label at the lower right of title screens
- Concentric dithered rings behind a central figure; display lettering filled in yellow-to-orange bands with a black outline
- The picture visibly draws itself, primitive by primitive, in command order

**Palette.** EGA 16: black, blue, green, cyan, red, magenta, brown, light grey, dark grey and the eight bright versions. The screens viewed lean on blue and black grounds, bright red, yellow/orange lettering, and dithered in-betweens; one ACiD piece is almost entirely greys with dark-red hatched lettering.

**Lettering.** BGI stroke fonts (gothic, triplex, small, sans) plus an 8x8 bitmap default font; headline letters often hand-plotted polygons.

**Motion.** Draw-in: outlines trace themselves, flood fills pop in one region at a time, text strokes write on, buttons appear last; a button can depress and release on a slow loop.

**As a README header.** One SVG above the fold: a small scene in flat EGA colours with concentric dithered rings behind the project name in banded stroke lettering, a parchment panel listing three or four sections, and a bevelled button. Buttons inside an image are not clickable, so the same links follow immediately as text.

**How to build it.** RIP is a vector command list, so SVG maps one-to-one: polygons and lines with crisp edges, 8x8 pattern fills for the dithers, stroke-dashoffset animation for outlines tracing themselves, stepped opacity with staggered delays for fills popping in. Use a 640x350 viewBox displayed slightly stretched vertically to mimic EGA pixels, and size it so patterns land on whole device pixels where possible. Stroke fonts must be your own single-line letter paths. A generated version without a drawn illustration (rings, lettering, panel, button) is achievable; a full scene needs an artist.

**Do not copy / caveats.** Fewer people recognise RIP than ANSI, so it needs a caption or it reads as clip art. Do not copy TeleGrafix icons, BGI font data or any game's RIP screens; flat fills, dithers, bevels and stroke lettering are free. Dither patterns moire at non-integer scales. Sources disagree on the launch year (1992 or 1993). I did not study individual Telidon artworks closely; treat the videotex cousin as a lead, not a specification.

**References**

- [Break Into Chat wiki: RIP - three screens viewed (a board logon screen, the RIP inn menu of a door game, a piece by Malebolgia of ACiD)](<https://breakintochat.com/wiki/Remote_imaging_protocol>)
- [Remote Imaging Protocol: authors, BGI basis, EGA 640x350, buttons and mouse regions, versions](<https://en.wikipedia.org/wiki/Remote_Imaging_Protocol>)
- [Ernie Smith, Tedium (July 2020): RIPscrip and NAPLPS on BBSes, and why TeleGrafix lost to the web](<https://tedium.co/2020/07/21/bbs-graphics-history-ripscrip-naplps/>)
- [16colo.rs ripscrip tag: 2,508 .RIP files, year counts, top groups (Outworld Arts, CIA)](<https://16colo.rs/tags/content/ripscrip>)
- ['ACiD' RIP by ansichrist in the ACiD 100 pack - a late piece, dated 31 December 2003](<https://16colo.rs/pack/acid-100/NS-ACID.RIP>)
- [ACiD applications list: Tombstone Artist 2.0, a RIPscrip paint program with buttons and mouse regions (1996)](<https://www.acid.org/apps/apps.html>)
- [NAPLPS: Telidon origins, 1978 launch, 1983 standard, picture description instructions](<https://en.wikipedia.org/wiki/NAPLPS>)
- [Remember Tomorrow: A Telidon Story (InterAccess, 2025-2030) - restored 1980s Telidon artworks that load line by line, layer by layer](<https://remembertomorrow.ca/en-ca/telidon-art>)

---

<a name="ansi-08"></a>

## ansi-08 · Teletext page (Ceefax-style index with mosaic graphics)

**Animated SVG** · build: **Medium** · impact: **5/5** · Broadcast in the UK from 23 September 1974 to 23 October 2012 (Ceefax), with ORACLE 1978-1992 and Teletext Ltd 1993-2010, and still carried in the Netherlands, Germany, Italy and elsewhere. An art scene since 2012: the International Teletext Art Festival by the Helsinki collective FixC (third edition Berlin, August 2014), Block Party in the UK (third edition Wigan, October 2018), the Museum of Teletext Art. On 16colo.rs about 3,430 files are tagged teletext, 1,786 of them by Horsenburger, nearly all in Mistigris packs from 2016-2021.

> Also researched as [mach-06](mach.md#mach-06).

Pages of text and block pictures hidden in the TV signal, called up by three-digit number. The look is fixed by the decoder chip: a 40-column grid, eight pure colours, a rounded dot-matrix font and pictures built from six blocks per cell. Instantly recognisable to anyone who grew up with a European television.

**What it looks like**

- 40 columns by 25 rows (a header row plus 24); on the SAA5050 chip each cell is 12x20 pixels, 480x500 overall
- Header row: page number, service name, date and a running clock, in different colours
- Mosaic graphics: each cell is a 2-wide by 3-high block pattern (top and bottom blocks 6x6 pixels, middle blocks 6x8), contiguous or 'separated' with 2-pixel gaps, giving 80x75 chunky pixels
- Eight colours only - black, red, green, yellow, blue, magenta, cyan, white - fully saturated, no shades
- A colour change occupies a character cell, so coloured words are preceded by a blank and pictures show notches where colours switch
- A large wordmark drawn in mosaics on a solid colour banner; headlines in double height
- Index lines with dot leaders and right-aligned three-digit page numbers (100-899) in a contrasting colour
- Bottom row of four short link words coloured red, green, yellow and cyan (Fastext)

**Palette.** Exactly the eight RGB primaries and secondaries: \#000000, \#FF0000, \#00FF00, \#FFFF00, \#0000FF, \#FF00FF, \#00FFFF, \#FFFFFF. Level 2.5 (after 1994) added a larger palette, but the classic look is these eight.

**Lettering.** The SAA5050 font: a 5x9 dot matrix smoothed along diagonals to 10x18, upper and lower case; double-height rows for headlines.

**Motion.** The clock ticks; the header page counter rolls while a page is being found; one word flashes about once a second; a sub-page carousel flips every several seconds; concealed text reveals.

**As a README header.** One SVG page above the fold: header row with a page number, the project name, a date and a ticking clock; the project wordmark in mosaics on a blue banner; five or six index lines (features or sections) with dot leaders and page numbers; a four-colour link row naming the main sections. The page numbers are echoed as a text list of anchors below, since the image cannot hold links.

**How to build it.** Mosaics are up to six rectangles per cell, emitted as one path per colour, so a full page is a few KB. The font has to be embedded as paths from a self-drawn 5x9 matrix (blocky is acceptable; diagonal smoothing is a refinement). The clock is a vertical strip of digit glyphs stepped with a steps() keyframe per digit position; it starts from a fixed time on load, not real time. The flash is one opacity keyframe. A static version is easy. A text-only fallback should not use sextant characters (Unicode 13, poor font coverage); half blocks suffer from GitHub's line gaps, so treat the SVG as the only real form.

**Do not copy / caveats.** No broadcaster names, logos or page furniture copied from a real service, and no mock news that could be mistaken for real headlines. Blue text on black fails contrast; keep blue for backgrounds. Limit flashing to one slow element. Nostalgia is strongest in the UK and continental Europe. The teletext files on 16colo.rs are image renders, not teletext data.

**References**

- [Mullard SAA5050: grid, cell size, font smoothing, mosaic block sizes](<https://en.wikipedia.org/wiki/Mullard_SAA5050>)
- [Teletext character set: mosaics, attribute control codes, Unicode sextants](<https://en.wikipedia.org/wiki/Teletext_character_set>)
- [Teletext: page numbering 100-899, Fastext coloured keys, Level 2.5, services still on air](<https://en.wikipedia.org/wiki/Teletext>)
- [Ceefax: 1974-2012, 24 rows by 40 columns, page ranges by subject](<https://en.wikipedia.org/wiki/Ceefax>)
- [Block Party 2018 (Wigan): Horsenburger, Dan Farrimond, Carl Attrill, Raquel Meyers, Alistair Cree, Peter Kwan](<https://teletextarchaeologist.org/2018/08/block-party-2018-bloktoberfest/>)
- [Claire Voon, Hyperallergic (August 2014): the International Teletext Art Festival, FixC, the eight-colour and control-character constraints](<https://hyperallergic.com/the-retro-aesthetics-of-teletext-art>)
- [16colo.rs teletext tag: counts by artist, year and format (PNG and JPG renders)](<https://16colo.rs/tags/content/teletext>)
- [Horsenburger, 'Christmas Street Scene', Mistigris pack of December 2025](<https://16colo.rs/pack/mist1225/HORSENBURGER-CHRISTMAS_STREET_SCENE.PNG>)
- [Museum of Teletext Art: works from 1979 (NRK) onward; YLE and ORF projects](<https://teletextart.com/>)

---

<a name="ansi-09"></a>

## ansi-09 · Minitel / viewdata service page (numbered menu, function-key legend)

**Animated SVG** · build: **Medium** · impact: **4/5** · France's Teletel network and Minitel terminal: trials from 1980, national service 1982 to 30 June 2012, about nine million terminals at the 1990s peak, services reached by short codes (3611 directory, 3614, 3615 kiosk). British cousin: Prestel, 1979-1994. A small revival scene exists around the MiEdit browser editor and emulator (FOSDEM talk, 2020).

Interactive videotex over the phone line: the same 40-column mosaic grid as teletext, but on a small monochrome terminal and built around forms and menus rather than broadcast pages. People remember the beige terminal, the slow top-down paint and the dedicated function keys named on every page.

**What it looks like**

- 40 columns by 25 rows; row 0 is a status row that is empty except for one inverse-video letter at the far right showing the line state (F or C in the emulator pages viewed)
- On the standard terminal the eight videotex colours appear as eight grey levels; colour sets show them as the teletext primaries
- A full-width title band at the top: centred capitals on a solid band (a yellow band with dark text on a library service page; a red band with a double-height white title on the editor's demo page)
- Numbered menu: each choice begins with its digit in a single inverse-video cell, then a plain label, one choice per double-spaced line
- An input line that ends in a dot placeholder where the digit is typed, with a block cursor
- Function-key legend: the key name in capitals in an inverse-video box followed by the action in lower case; the keys are Envoi, Retour, Repetition, Guide, Annulation, Sommaire, Correction, Suite and Connexion/Fin
- Mosaic pictures in 2x3 blocks per cell (80x72 for the page area) with flat areas and stair-stepped curves (a penguin on a blue sky in the demo viewed)
- The page paints top to bottom at 1200 bit/s, about 120 characters a second, so pictures arrive in strips over several seconds

**Palette.** Eight grey levels from black to white on the monochrome terminal (the mapping follows the luminance of the eight colours); on colour sets black, red, green, yellow, blue, magenta, cyan, white.

**Lettering.** The terminal's own dot-matrix font in a 40-column grid, with accented lowercase; titles in capitals at double height or double size. Viewdata pages such as Prestel put provider name, page number and price on the top line and keep the bottom line for system messages.

**Motion.** Top-down paint at about 120 characters a second; the status letter switching from F to C; a blinking block cursor at the input dot; optional blinking words.

**As a README header.** One SVG above the fold in greys: the status row, a title band with the project name at double height, a numbered menu of four or five README sections with inverse digits, an input line with a dot and a blinking cursor, and a legend line naming a key and its action in English. The page paints top-down once, then holds. The numbered sections are repeated as real links in text below.

**How to build it.** Same pipeline as the teletext page: cells as rectangle paths, a self-drawn dot-matrix font as paths, mosaics as six rectangles per cell, all in eight greys. The paint-in is one background-coloured cover rectangle per row sliding away with a steps() transform and staggered delays, fill-mode forwards. Greyscale makes contrast easy to control in both GitHub themes. A static version is straightforward.

**Do not copy / caveats.** Do not use operator or service names, the terminal's product name as branding, service codes, or real page designs; the grid, grey levels, numbered menu and key-legend conventions are free. Recognition is strong in France and weak elsewhere, where it reads as grey teletext. Not confirmed from a source: the exact grey-level order and the font's cell size in pixels. Keep the French key names out of an English README unless the joke is intended.

**References**

- [MiEdit, a Minitel page editor and emulator - home page and penguin demo viewed (status row, banner, mosaic picture, 1200 bps paint)](<https://minitel.cquest.org/>)
- [MiEdit source (Zigazou), with emulator notes on speed and colour versus greyscale](<https://github.com/Zigazou/miedit>)
- [Xtel emulator showing a real service page: yellow title band, inverse-digit menu, dot input, inverse ENVOI legend, the nine function keys](<https://commons.wikimedia.org/wiki/File:Xtel_gnulinux.jpg>)
- [Minitel (French Wikipedia): 25 lines by 40 columns, eight grey levels, 2x3 mosaics, function keys, 3611/3614/3615](<https://fr.wikipedia.org/wiki/Minitel>)
- [Minitel (English Wikipedia): 1982 to 30 June 2012, terminal counts, kiosk billing, 1200/75 line](<https://en.wikipedia.org/wiki/Minitel>)
- [Prestel: 1979-1994, 24 lines of 40 characters, top-line and bottom-line conventions, numbered choices](<https://en.wikipedia.org/wiki/Prestel>)
- [Frederic Bisson, 'Reviving Minitel', FOSDEM 2020](<https://archive.fosdem.org/2020/schedule/event/retro_reviving_minitel/>)

---

<a name="ansi-10"></a>

## ansi-10 · PETSCII plain picture and directory art

**Static SVG** · build: **Medium** · impact: **3/5** · Character set from the 1977 Commodore PET, on the C64 from 1982; a distinct art practice with new editors and competitions from 2013 (Plain PETSCII Graphics Competition on CSDb, October 2013; a 2017 edition drew 60 entries). 407 PETSCII-tagged files on 16colo.rs, peaking in 2019-2022, led by littlebitspace (111), otium (53) and snake petsken (36). Directory-art tools are still being released on CSDb in 2022-2026.

> Same style as [c64-03](c64.md#c64-03), researched twice. Kept here for the extra detail.

Pictures made only from the characters in the Commodore ROM, which include a rich set of graphic symbols printed on the keycaps. The constraint (no custom pixels at all) is the point, and the results have a woven, mosaic look unlike PC ANSI. This is a sub-variant of the existing C64 style: a still picture of ROM glyphs rather than a boot, loader or title sequence.

**What it looks like**

- 40x25 cells of 8x8 pixels (320x200) inside a coloured border; one foreground colour per cell and a single background colour for the whole screen
- 128 glyphs to choose from, each also available in reverse video: half and quarter blocks, diagonal triangles, thin lines at several offsets within the cell, rounded corners, circles, card suits, a checkerboard
- Glyphs cannot be flipped or rotated, so diagonals and curves exist only in certain orientations and compositions lean to suit them
- Either the upper-case/graphics set or the lower/upper-case set on a screen, never both
- Many pieces are nearly monochrome: white or one hue on black, with tone built from the checker glyph
- Logos drawn as monoline rounded lettering from the corner and line glyphs, several cells per letter
- Directory art: a disk listing whose filename column is filled with graphic glyphs so the rows form a picture, framed by block counts at the left and file types at the right

**Palette.** The 16 C64 colours: black, white, red, cyan, purple, green, blue, yellow, orange, brown, light red, dark grey, mid grey, light green, light blue, light grey. Pieces usually use 2-5 of them.

**Lettering.** The C64 character ROM. Custom alphabets are assembled from graphic glyphs, several cells per letter.

**Motion.** Static. Optional: cell colours cycling, a blinking cursor, or the picture being typed in row by row.

**As a README header.** One SVG, 320x200 plus border: an emblem and the project name in monoline PETSCII lettering, two or three colours on black or on the default blues. The directory-art variant turns the README's contents into a disk listing (a reverse-video title line, rows of block count, quoted name and type, a 'blocks free' footer) and can be approximated in a pre block with ordinary characters.

**How to build it.** Define each glyph once as an 8x8 symbol and place it with use elements carrying a fill colour, or emit one path per colour; 1,000 cells come to a few tens of KB. The geometric glyphs are simple to redraw yourself. Monoline lettering and framed listings can be generated; a good figurative PETSCII picture has to be composed by hand. Text-only PETSCII is not practical on GitHub because the Unicode legacy-computing characters lack font coverage.

**Do not copy / caveats.** Do not embed a dump of the Commodore character ROM or use Commodore names and logos; redraw the shapes. Do not copy any artist's piece. A weak PETSCII picture just looks like low-resolution pixel art, and to most viewers this overlaps the existing C64 style, so it earns its place only with strong composition. I did not view a directory-art piece itself, only the CSDb listings that confirm the practice and its tools.

**References**

- [Linus Akesson: three PETSCII pieces (2017), with the rules stated - 40x25, 128 characters, reverse per cell, 16 colours, one background](<https://www.linusakesson.net/art/three-petscii-pieces/index.php>)
- [Polyducks, 'What is textmode?' (archived): PETSCII limits including no rotation or flipping, one font case, and editors (Marq's PETSCII editor, Petmate)](<https://gwern.net/doc/www/polyducks.co.uk/bab8f711837e69e3478b758de5134d97656f220c.html>)
- [Reunanen, Heikkinen and Carlsson: PETSCII - A Character Set and a Creative Platform (Replay, 2018)](<https://czasopisma.uni.lodz.pl/Replay/article/view/5930>)
- [Anders Carlsson: Beyond Encoding (WiderScreen, 2017) - 'text mosaic', PETSCII after 2013](<https://widerscreen.fi/numerot/2017-1-2/beyond-encoding-a-critical-look-at-the-terminology-of-text-graphics/>)
- [16colo.rs PETSCII tag: counts by artist, year and format](<https://16colo.rs/tags/content/petscii>)
- [CSDb: 'Pillars and Wheels' by King Durin of Avatar, an entry in the Plain PETSCII Graphics Competition 2013](<https://csdb.dk/release/?id=123369>)
- [CSDb search for dir art: DART directory art importer (Genesis Project, 2022-2025), 'Unfinished DirArt' by Logiker (2021)](<https://csdb.dk/search/?seinsel=releases&search=dirart&all=1>)

---

<a name="ansi-11"></a>

## ansi-11 · Text-mode demo effect (plasma in character cells)

**Animated SVG** · build: **Medium** · impact: **4/5** · Text Mode Demo Contest: ten editions under tAAt (organiser Sol, Jari Komppa) in 1996-1998 and 2002-2007, about 90 demos; continued by Northern Dragons up to TMDC20 (November-December 2017). AAlib by Jan Hubicka, 1997, written for the BB demo.

Demos that run real-time effects in the plain text screen - standard character set, 16 colours, no font or palette tricks - or in a terminal using only ASCII brightness ramps. The charm is seeing plasma, tunnels and 3D objects forced through the character grid.

**What it looks like**

- The whole screen is a moving effect quantised to cells: plasma, tunnel, rotating solids, fractal zooms, particle bursts
- Grid of 80x50 cells (the contest judged entries in 80x50, with 80x25 also allowed), so cells are close to square
- Coloured manner: shade characters with foreground/background pairs to fake in-between colours, giving visible banding and crawling dither
- Monochrome manner: each cell shows the ASCII glyph whose shape best matches the pixels under it (one winning demo rendered at 160x100 and glyph-matched down), like a moving newspaper halftone
- Hard cell grid always visible; diagonal edges stair-step
- Block-letter titles and scrolling credits held solid over the effect

**Palette.** The 16 text colours on black, or grey levels only for the ASCII manner. Plasmas typically run blue to cyan to white or red to yellow through the shade steps.

**Lettering.** IBM VGA text font or the terminal's own font; logos as plain block letters or produced by glyph matching.

**Motion.** Continuous: colour bands sweep through the cells as interfering waves; text scrolls along the bottom row.

**As a README header.** One SVG above the fold: an 80x25 or 80x50 plasma in character cells with the project name in solid block letters in front and a one-line scroller of credits along the bottom. Everything informative stays in text below; this is pure spectacle.

**How to build it.** No scripts, so use palette cycling: precompute each cell's plasma phase, quantise to about 32 classes, emit one path per class, and give every class the same CSS keyframes stepping through a 16-entry colour ramp with a different negative animation-delay. That is about 32 animated elements and a few KB of CSS; 4,000 cells fits comfortably. Use solid stepped colours per cell (optionally with a static shade-texture overlay) rather than trying to animate pattern fills, whose animation support varies. Only effects that reduce to a fixed phase map are possible: plasma and colour-cycled tunnels yes, rotating solids no. The scroller is one translated text path group.

**Do not copy / caveats.** Constant motion at the top of documentation is tiring: loop slowly, keep a solid plate behind the name, and add a prefers-reduced-motion rule that freezes it. Do not copy scenes or logos from specific demos. Colour cycling over a static phase map is less rich than a true plasma, and it overlaps in spirit with plasma effects in cracktro-style headers; the visible cell grid and shade stepping are what make it this style.

**References**

- [Adok, Hugi 34: Text Mode Demo Compo retrospective - pure text mode, 16 colours, no custom fonts, about 90 demos, libcaca](<https://www.hugi.scene.org/online/hugi34/hugi%2034%20-%20demoscene%20reports%20adok%20text%20mode%20demo%20compo%20-%20retrospective.htm>)
- [TMDC site: Northern Dragons took over after TMDC10; TMDC20 ran in late 2017](<https://tmdc.scene.org/>)
- [TMDC rules: 80x25 or 80x50, judged in 80x50, no font or palette changes](<https://tmdc.scene.org/rules.html>)
- [Sol: Litterae Finis breakdown - 160x100 rendering, glyph matching, list of effects](<https://solhsa.com/litterae/index.html>)
- [TMDC X results: 'clockwerck' by Northern Dragons vs xplsv first of four](<https://sunsite2.icm.edu.pl/packages/scene.org/demos/compos/tmdcx/tmdcxres.txt>)
- [AAlib (Jan Hubicka, 1997, from the BB demo project)](<https://en.wikipedia.org/wiki/AAlib>)

---

<a name="ansi-12"></a>

## ansi-12 · Braille-dot terminal graphics (modern TUI dashboard)

**Text** · build: **Medium** · impact: **3/5** · Braille Patterns block in Unicode since version 3.0 (1999); used for terminal plotting since drawille by Adam Tauber (2014) and its many ports; standard in current system monitors such as btop; Chafa by Hans Petter Jansson (2018) converts images to half blocks and other symbol sets; sextants arrived in Unicode 13 (2020).

The present-day descendant of mosaic graphics: each character cell is treated as a 2x4 dot matrix (Braille) or as two stacked pixels (half block), so a terminal can plot curves and pictures. It is the look of today's command-line dashboards, and it is the one 'pixel' technique in this family that survives as plain text on GitHub.

**What it looks like**

- Each cell holds 2x4 dots, so 80 columns by 12 rows is a 160x48 dot canvas; all 256 dot patterns are available
- Stippled line work: curves, wireframes and sine plots look dotted and slightly airy, and filled areas read as halftone rather than solid
- Area graphs made of Braille columns rising from a baseline, newest sample at the right
- Panels framed in light box-drawing lines with rounded corners, the panel title set into the top border
- Horizontal meters of small block segments with a label at the left and a percentage at the right
- Half-block manner: the upper-half block with separate foreground and background colours gives two pixels per cell; it needs colour, so it only exists in the SVG form
- Tools offer fallbacks by font coverage: Braille for the highest resolution, block characters at half of it, and a three-symbol mode for plain consoles

**Palette.** Monochrome in a pre block (it takes the reader's GitHub theme colours). In real terminals graphs are tinted along their height with a gradient, commonly green through yellow to red.

**Lettering.** The terminal's monospace font; lowercase labels, right-aligned numbers, thin box-drawing frames.

**Motion.** Static as text. An SVG version can scroll the graph leftward in whole-cell steps.

**As a README header.** A text-only header in a pre block: the project wordmark or emblem rasterised into Braille dots (about 60-78 columns by 6-10 rows), and under it a framed panel row with two or three small Braille graphs or block meters showing real project numbers written at build time (release sizes, test counts, commit activity). Plain ASCII labels sit on their own lines, not mixed into the Braille rows.

**How to build it.** Rasterise the artwork to a 2x4 dot grid and map each cell to U+2800 plus its dot bits. Build every picture row entirely from Braille characters, using the blank pattern U+2800 instead of spaces, so that rows stay aligned with each other even when the glyphs come from a fallback font with a different width; never mix ASCII into those rows. Dots tolerate GitHub's tall line-height far better than half blocks, which show horizontal stripes. Use square box corners if rounded ones prove missing in a target font. Test on Windows and in the mobile app, where fallback fonts differ.

**Do not copy / caveats.** Screen readers announce Braille cells as Braille text, which is gibberish here: keep the project name and any numbers as ordinary text next to the art. Alignment depends on fonts you do not control. Do not copy a specific tool's layout, theme or name; the dot-plotting technique is free. It is modern rather than nostalgic, so it widens the set in a different direction from the BBS styles. The font-coverage advice is from general knowledge of system fonts and was not tested on GitHub in this check.

**References**

- [Braille Patterns: U+2800 to U+28FF, 256 patterns, 2x4 cell, used in terminals to draw several pixels per character](<https://en.wikipedia.org/wiki/Braille_Patterns>)
- [drawille by Adam Tauber (2014): Braille-dot canvas, turtle, rotating cube and sine examples, ports to many languages](<https://github.com/asciimoo/drawille>)
- [btop: graph symbol choices (braille, block, tty), rounded-corner boxes, gradient meters](<https://github.com/aristocratos/btop>)
- [Chafa by Hans Petter Jansson: image-to-terminal conversion with half blocks and other symbol ranges](<https://hpjansson.org/chafa/>)
- [Block Elements: the 32 half, eighth, quadrant and shade characters and their font coverage](<https://en.wikipedia.org/wiki/Block_Elements>)
- [Symbols for Legacy Computing (Unicode 13, 2020): sextants and other 8-bit-era glyphs](<https://en.wikipedia.org/wiki/Symbols_for_Legacy_Computing>)

---

## Considered and left out

- Artpack info file and member list (as a standalone style): as a pure-text header it restates the existing scene-release NFO style (block logo, boxed blurb, lists). Its distinct parts were kept and merged: the roster into the logo colly style, and the ruled file table, FILE\_ID.DIZ card sizes, boxed release stamp and SAUCE caption into the BBS data screens style.
- ATASCII (Atari 8-bit) screens and 'break' animations: specifications confirmed (128 characters plus inverse video, 40x24, one hue at two luminances, cursor-control characters; 'Atari Toons' in ANTIC, August 1985), but as a README header it is a plainer cousin of the existing C64 look, and its animation idea is already covered by the ansimation style. Kept only as a reference inside that style.
- ZX Spectrum UDG / attribute-grid art: specifications confirmed (2x2 block graphics in 16 combinations, 21 user-defined graphics), but the cited source gives no art tradition to describe, and a Spectrum header would duplicate the existing 8-bit boot-and-loader style rather than add a text-mode manner. Better handled, if at all, by the 8-bit micro family.
- Abstract ANSI: only 114 tagged files on 16colo.rs, mostly Mistigris 2016-2019, with no consistent visual rules I could confirm; mentioned in the illustrated ANSI caveats instead.
- ACiDView / ACiD View viewer screen: the DOS viewer's existence and features are confirmed (version 4.36 of April 1998: ANSI, BIN, GIF, JPG, RIP, XBIN, slide show, modem emulation), but I could not view its interface (the Defacto2 page returned 403), and a viewer is a window around other art rather than a header style. The useful idea, scrolling a tall piece through a 25-row window, is in the illustrated ANSI style.
- Telidon / NAPLPS as a standalone style: folded into the RIPscrip style as its videotex cousin, because the SVG technique and the object-by-object draw-in are the same and I did not study the artworks closely enough to specify a separate look.
- Login matrix: this is the existing ANSI BBS login style; the 16colo.rs 'matrix' tag is cited only for the menu sets that go beyond it.
- Shift\_JIS art: needs a proportional Japanese font (Carlsson notes its variable-width fonts), so it cannot hold alignment in a GitHub pre block; not possible as text and pointless as an SVG imitation.
- XBin custom-font textmode pieces: not verified by the original research or in this check; left out.
