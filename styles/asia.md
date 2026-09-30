# Japan and East Asia

<sub>Generated from <code>styles.json</code> by <code>tools/build-styles.mjs</code>. 7 styles, researched 2026-09-30. Added in a gap-filling pass: checked by its own researcher only, not by a second reviewer. [Back to the catalogue](README.md) · [Full index](INDEX.md)</sub>

## Reviewer's summary

This family has four schools that share one technical fact: their character cell is not the Western one. Japanese AA (2channel, from 1997-2000) is drawn for a proportional font, MS PGothic at 16 px, so it is line art positioned to the pixel by mixing spaces of different widths, and it cannot survive a monospace block. Taiwanese telnet BBS culture (PTT, founded 1995 and still live) is the opposite: a strict 80-column terminal in which every Chinese character takes two cells, with a colour-coded push/boo comment column and Big5 block art. The Japanese home-computer screens (PC-88/98, MSX) are high-resolution 640x400 text-and-picture layouts built around a kanji ROM, which is where the visual-novel look comes from. The music side is unusually text-friendly: MML is chip music written as plain text, and FM-synth players on the X68000 and PC-98 drew every channel as a miniature piano keyboard. Two of the seven styles are genuinely text-only (MML, kaomoji); the rest need SVG, mostly because CJK glyph widths cannot be controlled on GitHub.

## Styles

| ID | Style | Medium | Build | Impact |
| --- | --- | --- | --- | --- |
| [asia-01](#asia-01) | FM-synth status display: one piano keyboard per channel, level bars and spectrum (MMDSP / FMDSP lineage) | Animated SVG | Medium | 5/5 |
| [asia-02](#asia-02) | PC-98 adventure / visual-novel screen: dithered 16-colour picture, command menu, kanji message window | Animated SVG | Medium | 5/5 |
| [asia-03](#asia-03) | PTT telnet board: board list, push/boo comment column and double-width Big5 block art | Text + SVG | Easy | 4/5 |
| [asia-04](#asia-04) | Shift\_JIS AA: proportional-font line art inside an anonymous forum post | Static SVG | Medium | 4/5 |
| [asia-05](#asia-05) | MML listing: the project name as a tune in plain text | Text | Easy | 3/5 |
| [asia-06](#asia-06) | Japanese 8/16-bit BASIC power-on: memory count, file-buffer question, function-key bar (PC-88/98), and the MSX blue screen | Text + SVG | Easy | 3/5 |
| [asia-07](#asia-07) | Kaomoji and one-line AA: the font-proof subset | Text | Easy | 2/5 |

---

<a name="asia-01"></a>

## asia-01 · FM-synth status display: one piano keyboard per channel, level bars and spectrum (MMDSP / FMDSP lineage)

**Animated SVG** · build: **Medium** · impact: **5/5** · Sharp X68000, 1991-94 (the MMDSP screenshot credits version 0.30 beta, 1991-94, Miahmie and Gao); the same layout on NEC PC-98 for FMP and PMD music files; modern re-creations 98fmplayer and MDPlayer

On the X68000, MDX music files for the MXDRV driver circulated widely on dial-up networks, and Japanese Wikipedia notes that many players were written to show the performance visually, naming MMDSP and MDXS. MMDSP's own README describes it as a real-time display and file selector for six music drivers, known for its spectrum analyser. It is the Japanese counterpart of the Western tracker screen: there is no pattern grid at all, every sound-chip channel is shown as a keyboard with the sounding key lit.

**What it looks like**

- Left half: one horizontal strip per channel (eight 'OPM TRACK' strips on X68000; FM, SSG and ADPCM strips on PC-98), each a single line of numeric readouts above a miniature full-range piano keyboard
- The key currently sounding is a solid lime-green block on otherwise grey-white keys; nothing else on the screen is green
- Right half: a control panel with boxed transport words joined by dashed rules, the driver name, and clock / elapsed / timer / loop counters in slanted seven-segment-style digits
- Spectrum analyser of about 32 segmented bars with peak-hold ticks, over a frequency axis labelled in Hz (28 to 3.5k on MMDSP, 250 to 4K on the FMDSP re-creation) and a row of mode buttons
- Per-channel level bars built from thin horizontal slices, a row of round pan dials beneath them, then rows of three-digit program and key-code numbers
- Bottom third: a 'now playing' title line and a file selector listing file name plus song title, the titles in large kanji-ROM type with wide letter spacing; a footer strip of toggle words (auto, shuffle, repeat, intro)
- Whole screen in one lavender-blue on black with hairline rules and tiny all-caps pixel labels ending in a small corner tick

**Palette.** Sampled from the screenshots: black \#000000 ground; lavender \#8787ff (MMDSP) or \#aa99ff with violet \#8844dd and plum \#553366 (98fmplayer); key white \#c2c2ca / \#ccccbb; dark navy fills \#18183b and \#101032; single accent lime \#77ff22 for the lit key.

**Lettering.** Tiny uppercase pixel capitals about 5-6 px high for every label; a wide extended outline wordmark for the program name; slanted segment-style numerals for counters; song titles in the 16-dot kanji ROM gothic, often typed in full-width Latin with spaces between letters.

**Motion.** Lit keys jump along each keyboard in steps; level bars snap up and decay; spectrum bars bounce while their peak ticks fall slowly; counters tick; pan dials flip left/right. All of it is stepped, not eased.

**As a README header.** One wide SVG above the fold. Each 'track' strip becomes a part of the project (modules, languages, CI jobs), with its readout line carrying real numbers (files, tests, coverage). The control panel holds the project name as the wordmark and version / build counters in segment digits. The 'now playing' line is the tagline; the selector list at the bottom is the table of contents. Links cannot live inside an img, so repeat the selector as a plain Markdown list directly under the image.

**How to build it.** One octave of keys as an SVG pattern tiled across each strip; the lit key is a small rect moved with a steps() keyframe on transform. Bars are rects animated with stepped scaleY, given prime-number durations so eight to thirty bars never visibly repeat; peak ticks are a second slower animation. Segment digits and the tiny label font are best drawn as paths (a 5x5 pixel alphabet is a few hundred bytes). Estimated 60-120 KB, not measured. Kanji titles are optional; if used, convert to paths from a free 16-dot bitmap font, since no font can be loaded.

**Do not copy / caveats.** Do not copy the MMDSP or FMDSP names, wordmarks or the panel pixel-for-pixel, and do not reuse the real song titles and composer credits visible in the screenshots. I could not confirm who wrote the original PC-98 FMDSP; I only saw the 98fmplayer re-creation that carries that title. Labels at 5-6 px become unreadable when GitHub scales the image down on mobile, so keep real information in larger type. Many bars flashing at once is a motion-sensitivity risk: keep rates low and add a prefers-reduced-motion rule. It overlaps in spirit with the catalogue's Open Cubic Player and FastTracker entries; the distinct part is the keyboard-per-channel layout and the FM chip vocabulary.

**References**

- [MMDSP source repository by Gao, with README and a full screenshot of the X68000 display](<https://github.com/gaolay/MMDSP>)
- [98fmplayer by myon98: PC-98 FM driver emulation (PMD, FMP) whose window reproduces the FMDSP status display; screenshots in the README](<https://github.com/myon98/98fmplayer>)
- [MDPlayer by kuma4649: plays VGM, MDX, PMD, FMP and many more while drawing a keyboard display per emulated chip](<https://github.com/kuma4649/MDPlayer>)
- [Japanese Wikipedia, X68000: MXDRV, MDX files on PC-communication networks, and visual players MMDSP and MDXS](<https://ja.wikipedia.org/wiki/X68000>)
- [English Wikipedia, X68000: YM2151 FM chip plus MSM6258 ADPCM, Human68k](<https://en.wikipedia.org/wiki/X68000>)

---

<a name="asia-02"></a>

## asia-02 · PC-98 adventure / visual-novel screen: dithered 16-colour picture, command menu, kanji message window

**Animated SVG** · build: **Medium** · impact: **5/5** · NEC PC-9801, launched October 1982; 16 colours from a 4096 palette from the VM model (July 1985); adventure and visual-novel heyday late 1980s to mid 1990s, over by about 1996

The PC-98 held over 60% of the Japanese market by 1991. It had 640x400 graphics and a separate kanji text layer but no hardware sprites, so, as the Hardcore Gaming 101 history explains, developers made adventure games out of still pictures and text, which turned into visual novels. That article calls the results "some of the best pixel art in video game history" (Hardcore Gaming 101), and it is the look people now label 'PC-98 aesthetic'.

**What it looks like**

- 640x400 canvas, which is exactly 80x25 cells of 8x16 (half-width) or 40 columns of 16x16 kanji
- At most 16 colours on screen, each from a 12-bit palette, so every colour is a three-digit hex value (\#199, \#f76, \#879 style)
- Dithering used to fake extra shades and gradients: regular checker and ordered mesh fills inside flat areas (confirmed only in general terms, see caveats)
- Picture shown in a framed panel, not full screen: static character art over a background, anime-style with hard one-pixel outlines
- A command or choice menu (look, talk, move style verbs, or branching choices) as a short vertical list
- A message window occupying only part of the screen (the 'ADV' format), white kanji gothic text on a dark panel, advancing on a key press
- A second, independent 8-colour text layer that can sit on top of the graphics (visible in the N88-BASIC(86) screenshot on Commons, where a listing overlays the picture)
- On a 4:3 monitor the 640x400 frame gives pixels slightly taller than wide (5:6, derived arithmetically)

**Palette.** Any 16 colours of 4096. The Commons N88-BASIC(86) demo screenshot shows the range: teal \#119999, salmon \#ff7766, dusty violet \#887799, pink \#ee99aa, brick \#cc6666, green \#00bb22, deep red \#bb0000, plus white and black. The text layer is limited to the 8 pure digital colours.

**Lettering.** ROM bitmap gothic: 8x16 half-width Latin and katakana, 16x16 full-width kana and kanji, strictly on the 80x25 grid; thin single-pixel strokes; Latin zero drawn with a slash.

**Motion.** Mostly static. The natural motion is the message text appearing one character at a time with a blinking 'continue' marker at the end of the line; optionally the menu cursor stepping down the list.

**As a README header.** A 640x400 (or cropped 640x240) SVG. The picture panel holds an original dithered scene with the project name as a pixel title; the command menu lists the README sections (Install, Usage, Docs, License); the message window types out the one-paragraph description. Everything readable is repeated as normal Markdown below, since the text inside the image is not selectable or linkable.

**How to build it.** Dither fills are 2x2 and 4x4 SVG patterns of two palette colours; set shape-rendering to crispEdges and keep the viewBox at 640x400. Text typing is a clip rectangle per line widened with a steps() keyframe, one step per character. Latin text can be a pixel font drawn as paths. Kanji cannot rely on a loaded font: either omit them, or convert a handful of glyphs from a free 16-dot bitmap font (the Shinonome family behind Mona Font is stated to be public domain) into rect paths, roughly 150-300 bytes per glyph. The expensive part is the illustration: a landscape or object scene is medium, a convincing character portrait is hard.

**Do not copy / caveats.** Do not imitate any particular game's characters, window frames or studio logos; the titles my sources name (Policenauts, YU-NO, Dokyusei, the early Touhou games) are references only. A large share of the PC-98 library is adult software, so keep the header plainly safe for work. NEC and PC-98 are trademarks. Unconfirmed: the specific dither conventions (checker versus mesh, where they were used) come from general knowledge, my sources only confirm that dithering was used; the 5:6 pixel shape is my arithmetic from 640x400 on a 4:3 tube; the claim that vaporwave borrows this look comes from the brief, not from a source I opened.

**References**

- [English Wikipedia, PC-98: two uPD7220 controllers (text and graphics), 640x400, 16 of 4096 colours, no sprites, rise of dating sims and visual novels, 60% market share](<https://en.wikipedia.org/wiki/PC-98>)
- [Hardcore Gaming 101 / Retro Gamer 67, 'Retro Japanese Computers: Gaming's Final Frontier', hardware page (kanji ROM, dual display controllers)](<http://www.hardcoregaming101.net/JPNcomputers/Japanesecomputers.htm>)
- [Same article, software page: still-image adventures becoming visual novels; remarks on dithering and pixel art](<http://www.hardcoregaming101.net/JPNcomputers/Japanesecomputers2.htm>)
- [Japanese Wikipedia, PC-9800 series: kanji ROM, text VRAM overlaid on graphics VRAM, 16 of 4096 colours from the VM](<https://ja.wikipedia.org/wiki/PC-9800シリーズ>)
- [Wikimedia Commons screenshot: 8-colour text layer over 16-colour graphics in N88-BASIC(86)](<https://commons.wikimedia.org/wiki/File:N88-BASIC(86)_color_text_with_graphics.png>)
- [English Wikipedia, Visual novel: ADV versus NVL text-box formats, static character images over background art, menu choices](<https://en.wikipedia.org/wiki/Visual_novel>)
- [English Wikipedia, Adventure game: Japanese command-menu adventures from 1983, PC-9801 resolution and its effect on game design](<https://en.wikipedia.org/wiki/Adventure_game>)

---

<a name="asia-03"></a>

## asia-03 · PTT telnet board: board list, push/boo comment column and double-width Big5 block art

**Text + SVG** · build: **Easy** · impact: **4/5** · Taiwan, PTT founded 14 September 1995 by Yi-Chin Tu at National Taiwan University; push/boo comments added 25 May 2002; text animation viewer (pmore) 2005 and 2007; still running today over SSH and WebSocket

PTT is a text-terminal bulletin board with more than 1.5 million registered users and over 20,000 boards, descended from Pirate BBS through Eagles, Phoenix and MapleBBS. Its screens are a living BBS dialect: a reverse-video column header, colour-coded popularity numbers, and under each article a column of one-line comments each opening with a push, boo or arrow mark. The source code is public, so every colour and column below is read from the code, not guessed.

**What it looks like**

- 80-column terminal where each Chinese character fills two cells, so a row holds 40 of them; headings are justified by inserting spaces between characters
- Top: title bar, then a line of bracketed key hints, then a reverse-video bar of column names (number, board, class, description, popularity, moderators)
- Board rows: seven-digit right-aligned number, 12-cell ASCII board name, a two-character class tag in a colour hashed from its name, a bullseye mark and description, a popularity cell, moderator IDs
- Popularity cell: plain number to 10, bright yellow to 50, bright red to 99, white HOT from 100, then the 'explode' character with an exclamation mark, recoloured at 1000 / 2000 / 5000 / 10000 / 30000 / 60000 / 100000 users
- Article rows: number, a status letter, a two-cell push score (bright green 1-9, bright yellow 10-99, bright red 'explode' at the cap, dark grey X1..XX for net boos), date, author, a square / R: / forward mark, title
- Comment column: mark (push in bright white, boo and arrow in bright red), user ID in yellow, a colon and the comment padded to a fixed width in dark yellow, then date and time right-aligned; about 45 half-width characters per comment
- Bottom status bar made of coloured segments: blue on cyan for the date, bright yellow on magenta for a notice, black on white with red numerals for users online, a red (h) help hint
- Welcome and goodbye screens drawn with Big5 block characters: eighth-height and eighth-width bars and four corner triangles, each a double-width cell with its own foreground and background colour; main menu entries are an English word followed by a Chinese label in lenticular brackets

**Palette.** The 16 ANSI colours on black, used semantically: bright yellow (1;33) and dark yellow (33) for IDs and comment text, bright red (1;31) for boos and hot counts, bright green (1;32) for low scores, dark grey (1;30) for negative scores, reverse video for header bars, cyan / magenta / white background segments in the status bar.

**Lettering.** Terminal bitmap type: half-width Latin at one cell, Traditional Chinese at two. Lenticular brackets around menu names, a bullseye before board descriptions, a hollow square before article titles. Users' own art uses block and triangle characters, not letters.

**Motion.** Static by default. Two authentic motions: comments arriving one line at a time while the score in the list climbs from green to yellow to the red cap; or a frame-flip 'BBS movie', where the viewer documentation sets a minimum frame time of 0.1 s and a default of 1 s.

**As a README header.** An 80x24 terminal drawn in SVG. The board list becomes the project's components ('boards') with popularity standing in for stars or downloads and the hot/explode ladder used honestly. Under it, a short comment column written by the project itself (release notes or FAQ one-liners in push/arrow form). A text-only fallback is possible if the rows use ASCII only, for example (my own made-up lines): 推 alice: builds first time on Windows            10/01 12:34 推 bob: header renders in dark mode too           10/01 12:36 These stay aligned in any font only if every line has the same number of wide characters before the aligned column; mixing the CJK marks with the narrow arrow breaks it.

**How to build it.** Place text by cell in SVG: one text run per colour span at x = column times cell width, with textLength set so a fallback font cannot change the width; backgrounds are rects. Only a handful of distinct Chinese glyphs are needed (the three marks, the 'explode' character, a few column titles), so converting those to paths costs a few kilobytes and removes all dependence on system fonts. In a GitHub pre block the grid fails: I measured Consolas at 0.55 em per cell, it has box-drawing and half blocks but lacks Chinese, the corner triangles and the eighth-width bars, which fall back to a 1 em font, so double-width cells come out about 1.8 cells wide.

**Do not copy / caveats.** Do not copy the PTT name or logo, real board names, real user IDs or real comments: those are identifiable people's posts. The block art in the repository's sample screens and on the live site is someone's work; describe and re-create the technique, do not trace it. The code is GPL v2: borrow the layout, not the files. Unconfirmed: the 'two-colour character' trick (an escape code between the two bytes of a Big5 character) is widely mentioned but I could not open a source for it, and I did not confirm which terminal clients people used. PTT is a major political forum in Taiwan, so a boo column aimed at real people or parties would read badly. Any Chinese text should be checked by a Traditional Chinese reader.

**References**

- [English Wikipedia, PTT Bulletin Board System: founding, user and board counts, push/boo system date, MapleBBS origin](<https://en.wikipedia.org/wiki/PTT_Bulletin_Board_System>)
- [Chinese Wikipedia, PTT: comment length limit, animation board and pmore history, closure of unencrypted telnet in April 2022](<https://zh.wikipedia.org/wiki/批踢踢>)
- [pttbbs source, comments.c: exact format and colours of a push / boo / arrow line](<https://raw.githubusercontent.com/ptt/pttbbs/master/mbbsd/comments.c>)
- [pttbbs source, bbs.c: article-list row layout and push-score colour thresholds](<https://raw.githubusercontent.com/ptt/pttbbs/master/mbbsd/bbs.c>)
- [pttbbs source, board.c: board-list header, row layout and popularity colour ladder](<https://raw.githubusercontent.com/ptt/pttbbs/master/mbbsd/board.c>)
- [pttbbs docs, pfterm: the double-byte-aware ANSI terminal layer](<https://raw.githubusercontent.com/ptt/pttbbs/master/docs/pfterm.txt>)
- [pttbbs docs, pmore movie manual: frame markers and timing for text animation](<https://raw.githubusercontent.com/ptt/pttbbs/master/docs/pmore_movie.txt>)
- [pttbbs sample logout screen (Big5 block art; inspected for its character vocabulary only)](<https://raw.githubusercontent.com/ptt/pttbbs/master/sample/etc/Logout>)
- [PTT web front end, hot boards page: board name, user count, class tag, description](<https://www.ptt.cc/bbs/hotboards.html>)
- [Unicode UAX 11, East Asian Width: wide, fullwidth and ambiguous-width characters](<https://www.unicode.org/reports/tr11/>)

---

<a name="asia-04"></a>

## asia-04 · Shift\_JIS AA: proportional-font line art inside an anonymous forum post

**Static SVG** · build: **Medium** · impact: **4/5** · Japan: Ayashii World 1997, 2channel from 1999, peak in the 2000s; drawn against MS PGothic 12 pt as shown by Internet Explorer 5

What the West calls Shift\_JIS art is simply 'AA' in Japan. Unlike Western ASCII art it is designed for a proportional font, which gives artists pixel-level control of position by mixing characters and spaces of different widths, and a huge stroke vocabulary from kana, kanji, Greek, Cyrillic and mathematical symbols. It grew into mascots, multi-thousand-panel story threads and traced illustrations, and it appeared in mainstream television (Densha Otoko).

**What it looks like**

- Designed for MS PGothic at 16 px with an 18 px line pitch; every character has its own width
- Strokes come from full-width punctuation (slashes, overline, underscore, vertical bar), the logical-and sign for peaks and ears, the subset sign for paws, Greek omega and Cyrillic De for mouths
- Half-width katakana and the small voicing marks used as short hatch strokes; commas, apostrophes and backticks as dots at different heights
- Sub-character positioning by combining spaces: in the font on this machine a half-width space is about 5 px, a full-width space about 11 px, a period about 3 px, a kanji 16 px
- Two drafting taboos: never start a line with a half-width space and never put two in a row, because browsers collapse them
- Tone instead of colour: a screen-tone ramp from sparse colons and semicolons up to dense many-stroke kanji for black
- Three size classes named after 2channel boards: mascots with a one-line face and a body of about 5 lines; 'guideline' figures with a 5-line face and 10 or more lines of body; traced illustrations of 20 to 50 lines
- Seen inside a numbered post with a header line (post number, Name, date, ID); never any colour, bold or font-size markup

**Palette.** Monochrome: black glyphs on the board's pale background. No colour by convention; shading is done with character density.

**Lettering.** MS PGothic 12 pt is the reference. Width-compatible free substitutes: Mona Font (built from the Shinonome bitmap font, 12/14/16 pt, last release 2.90 of 9 September 2003, declared public domain on its project page), IPA Mona and Textar.

**Motion.** static

**As a README header.** SVG only. Above the fold: a fake post (header line with number, name, date and ID in the forum's manner) containing either the project name built as large letters out of characters, or a speech balloon around the title. A balloon in this technique looks like this (my own, and it will only line up in the intended font): ／￣￣￣￣￣￣￣￣＼ ＜　 README.NFO 　　 ＞ ＼＿＿＿＿＿＿＿＿／ There is no honest text-only form of multi-line AA on GitHub; use the kaomoji style for that.

**How to build it.** It breaks in a pre block for three reasons I verified. GitHub forces its monospace stack and strips inline styles, so the font cannot be chosen. On Windows that stack resolves to Consolas, which has Greek and Cyrillic at 0.55 em but no kana or full-width forms, so those fall back to a system font at 1 em, and half-width kana fall back at 0.5 em: three cell widths on one line. And the source relies on proportional advances (3, 5, 8, 11 and 16 px in the same line), which no monospace font has. The workable route: lay the text out offline with a PGothic-width-compatible free font at 16 px / 18 px, emit each distinct glyph once as a symbol and place instances with use, and ship the SVG. About 100 distinct glyphs and 1,000-2,000 instances; my estimate is 40-90 KB, not measured. Rendering from the font's 16 px bitmap strike as pixel rects gives the authentic crisp look. Relying on system fallback fonts is not acceptable here: a one-pixel width difference visibly shears the drawing.

**Do not copy / caveats.** Do not use Mona, Giko, Yaruo, the Yukkuri heads or any other existing AA character, and do not paste art from boards: anonymous does not mean free, and the characters have owners in the community's eyes. MS PGothic is proprietary, so outline a free width-compatible font instead and check the IPA licence terms before using IPA Mona or Textar outlines. Microsoft has changed some PGothic glyphs over time and Meiryo has different widths, so old pieces may not match today's font exactly. Black paths disappear on GitHub's dark theme unless the SVG carries its own background or a prefers-color-scheme rule. Paths are invisible to screen readers: write real alt text. Drawing original AA is a craft with its own editors; budget time for it.

**References**

- [English Wikipedia, Shift\_JIS art: definition, MS PGothic dependence, Mona Font, gallery dates](<https://en.wikipedia.org/wiki/Shift_JIS_art>)
- [Japanese Wikipedia, ASCII art: 16 px / 18 px standard, spacing taboos, tone ramp, the three board-named classes, font substitutes](<https://ja.wikipedia.org/wiki/アスキーアート>)
- [Mona Font project page (English): purpose, Shinonome base, versions](<https://monafont.sourceforge.net/index-e.html>)
- [Japanese Wikipedia, Mona Font: made so 2channel AA displays on X11; development stopped, IPA Mona continues](<https://ja.wikipedia.org/wiki/モナーフォント>)
- [Textar font mirror: a web font for AA display under the IPA font licence](<https://yamacraft.github.io/textar-font/>)
- [Wikimedia Commons sample of a small piece shown inside a forum post header](<https://commons.wikimedia.org/wiki/File:Sjisart.png>)
- [GitHub Primer typography variables: the monospace font stack used for code and pre blocks](<https://raw.githubusercontent.com/primer/css/main/src/support/variables/typography.scss>)
- [github/markup README: inline styles, classes and ids are stripped from README HTML](<https://github.com/github/markup>)

---

<a name="asia-05"></a>

## asia-05 · MML listing: the project name as a tune in plain text

**Text** · build: **Easy** · impact: **3/5** · Term in print by May 1982 (BYTE on the OKI if-800); NEC calls its PLAY channel strings MML in a 1986 manual; PMD 4.8 manual dated 4 April 1997 by M. Kajihara (KAJA); mck for the NES released 2001

Music Macro Language is chip music written as text: letters for notes, digits for lengths, single-letter commands for octave, tempo, volume and instrument. It began inside BASIC PLAY statements on Japanese 8-bit machines and became the input format for dedicated drivers such as PMD on the PC-98 and, later, mck on the Famicom, whose release revived it among chiptune musicians. It is the one chiptune artefact that is natively a code block.

**What it looks like**

- A header block of hash-prefixed lines for title, composer, arranger and memo (mixed case in PMD, upper case in mck, which also has a line for the person who typed in the data)
- One channel per line: a capital letter in column 0, then a space or tab, then the music. PMD on PC-98 uses A-F for FM, G-I for SSG, J for PCM, K and R for rhythm; mck uses A and B for pulse, C triangle, D noise, E DPCM
- Several letters run together send one line to several channels at once
- Dense lowercase runs of c d e f g a b with r for rests, plus and minus for accidentals, digits and dots for lengths
- Short commands sprinkled through: o4 for octave, angle brackets to step an octave, l8 default length, t for tempo, v for volume, at-sign plus number for instrument, ampersand ties, square-bracket loops with a repeat count, a lone L for the song's loop point
- An FM voice definition: an at-sign line with number, algorithm and feedback, followed by four rows of about ten right-aligned integers, usually under a semicolon comment naming the columns (AR DR SR RR SL TL KS ML DT AMS)
- mck envelope macros: an at-sign name, an equals sign and a brace list of numbers with a vertical bar marking the loop-back point
- Comments after semicolons; in PMD, backtick-delimited blocks, and any Japanese text is simply ignored by the compiler, so annotations sit between the notes

**Palette.** None: monochrome monospace text. GitHub has no MML highlighting, so it renders as a plain block.

**Lettering.** Plain ASCII in the README's monospace font; columns aligned with tabs or spaces; no box or block characters at all.

**Motion.** static

**As a README header.** A fenced code block (or a pre block if links are wanted) as the very first thing in the README. The header lines carry the project name, author and licence; two or three channel lines play a short original motif; a small voice table adds texture. A made-up example in PMD style: \#Title    README.NFO theme A  @1 v12 o4 l8 t140  c e g &gt; c &lt; g e  c4 r4 G  v10 o3 l4          c   g   c   g The file can be real: compiled with an MML compiler it would produce an actual tune the repository could ship.

**How to build it.** Pure 7-bit ASCII, under 80 columns, no alignment across wide characters, so it renders identically everywhere. Only the letters a to g and r are notes, so a name cannot be spelled as a melody in general: put the name in the title line and comments, or pick a motif from the letters the name does contain. Say which dialect it is, because commands differ (the direction of the octave arrows is reversible in both PMD and mck).

**Do not copy / caveats.** Write an original tune: melodies are protected, so do not transcribe game or pop music, and do not lift FM voice numbers from commercial soundtracks (invent the patch numbers). PMD, mck and ppmck are tools to credit, not names to wear. Readers who have never seen MML will take it for noise, so one comment line saying what it is helps. Already in the catalogue: tracker screens and the module sample list; this differs by being source code, not a player or editor screen.

**References**

- [English Wikipedia, Music Macro Language: origin of the term, machines, common commands, mck](<https://en.wikipedia.org/wiki/Music_Macro_Language>)
- [PMD MML command manual, English translation by Blaze and Pigu of M. Kajihara's PMDMML.MAN: channel letters, header commands, FM voice format, comments, loops](<https://pigu-a.github.io/pmddocs/pmdmml.htm>)
- [ppmck repository (fork of the mck compiler family) with the original documentation](<https://github.com/munshkr/ppmck>)
- [mckc documentation by Manbow-J: header lines, envelope macros, track letters, 192-count whole note](<https://raw.githubusercontent.com/munshkr/ppmck/master/doc/mckc.txt>)
- [mck driver documentation (Famicom/NES sound driver, 2003 version)](<https://raw.githubusercontent.com/munshkr/ppmck/master/doc/mck.txt>)
- [Japanese Wikipedia, Music Macro Language: command list and the tempo-drift workarounds](<https://ja.wikipedia.org/wiki/Music_Macro_Language>)

---

<a name="asia-06"></a>

## asia-06 · Japanese 8/16-bit BASIC power-on: memory count, file-buffer question, function-key bar (PC-88/98), and the MSX blue screen

**Text + SVG** · build: **Easy** · impact: **3/5** · NEC PC-8801 (1981, N88-BASIC), PC-9801 (1982, N88-BASIC(86)), MSX (1983, MSX BASIC 1.0)

The screens Japanese owners saw with no disk in the drive. A PC-98 runs its self-test, prints a memory figure followed by OK, and, finding nothing to boot, drops into ROM BASIC, which opens by asking how many file buffers to reserve; a specialist PC-98 site has a whole page explaining that question because so many people met it by accident. MSX machines show a brief system sign-on and then a solid blue BASIC screen. Both keep a row of function-key words along the bottom edge.

**What it looks like**

- PC-98 self-test line: a memory figure that ends in 'KB OK', printed before anything else
- The BASIC opening on PC-88/98: the file-buffer question (range 0 to 15) on the first line, then maker and version, a copyright line, a bytes-free count, 'Ok' and a solid block cursor
- Thin white single-stroke text on black, 80 columns by 25 rows
- Bottom row: function-key words in reverse-video boxes with gaps between them, five on the PC-88 (load, auto, go to, list, run), ten on the PC-98 (adding save, key, print, edit, cont), some followed by a tiny carriage-return glyph
- On the PC-98 the text floats over whatever is on the graphics layer; on PC-88 200-line graphics every other scanline is blank, so solid colours look striped
- A PC-9821 shows a single Japanese sentence asking for a system disk instead of BASIC
- MSX: a centred system-and-version sign-on for about three seconds, then a flat blue screen with white text: version, copyright, bytes free, Ok, cursor
- MSX bottom row: the words color, auto, goto, list, run in plain white, not boxed; text is 40 columns with wide letter spacing

**Palette.** PC-88/98: black \#000000 and white \#ffffff, with the eight digital RGB colours available for text. MSX: blue sampled as \#2020ff with white \#ffffff (the default set by the ROM's own colour command: white on dark blue with a blue border).

**Lettering.** NEC ROM font: 8x16 cell, thin strokes, slashed zero, tall narrow capitals. MSX: a chunky 6x8 cell font with generous spacing. Both strictly on the character grid.

**Motion.** The memory figure counts up to its total; the banner lines appear in order; the cursor blinks; optionally one command is typed and answered with 'Ok'.

**As a README header.** A short banner. The count-up becomes a project number (files, tests, lines) ending in OK; the opening question is rewritten in the project's own words; the banner lines are name, version and licence; the function-key bar is the navigation (Install, Usage, Docs, License, Run). The PC-88/98 form is pure ASCII, so it also works as a pre block with the bar as the last line; the MSX form needs SVG for the blue field.

**How to build it.** SVG: a black or blue rect, text as a small pixel font drawn in paths, inverse boxes as white rects with black text, a stepped opacity blink for the cursor, and a counter made from a vertical strip of numbers moved with steps(). No CJK glyphs are needed for the BASIC screens. Text-only: five to eight lines in a code block, all 7-bit.

**Do not copy / caveats.** Write your own banner wording: do not reproduce the NEC, Microsoft or MSX names, version strings or copyright lines. Not confirmed and therefore left out: the X68000 start-up screen (I found no emulator or museum page describing it) and the PC-98 start-up beep, which could not be used anyway. The exact wording of the PC-98 memory line on different models is only confirmed as a figure followed by KB OK. Close relatives already in the catalogue are the C64 boot, the BIOS POST screen and the Amiga Kickstart screens; the distinct parts here are the file-buffer question, the function-key bar and the MSX blue field.

**References**

- [radioc PC-98 reference: what the file-buffer question is, the self-test memory message, boot order, PC-9801 versus PC-9821 behaviour](<https://radioc.web.fc2.com/column/pc98bas/howmanyfiles.htm>)
- [Wikimedia Commons screenshot of the N88-BASIC start-up screen with function-key bar](<https://commons.wikimedia.org/wiki/File:88SRBASIC.png>)
- [Wikimedia Commons screenshot of N88-BASIC(86) with the ten-key bar over graphics](<https://commons.wikimedia.org/wiki/File:N88-BASIC(86)_color_text_with_graphics.png>)
- [Japanese Wikipedia, N88-BASIC: ROM, disk and DOS versions on PC-88 and PC-98](<https://ja.wikipedia.org/wiki/N88-BASIC>)
- [The MSX Red Book (ROM commentary): power-up sequence, sign-on position and delay, banner strings, default function-key strings](<https://github.com/gseidler/The-MSX-Red-Book>)
- [Wikimedia Commons screenshot of the MSX BASIC start-up screen](<https://commons.wikimedia.org/wiki/File:Msxbasic.png>)
- [English Wikipedia, MSX BASIC: invoked from ROM at start-up, versions, screen modes](<https://en.wikipedia.org/wiki/MSX_BASIC>)

---

<a name="asia-07"></a>

## asia-07 · Kaomoji and one-line AA: the font-proof subset

**Text** · build: **Easy** · impact: **2/5** · Japan from 20 June 1986 (the upright smiling face posted on ASCII-NET by Yasushi Wakabayashi); 2channel one-liners from 1999; Korean and Chinese variants in the 2000s

Upright faces built from brackets and symbols, read without tilting the head, with the eyes doing the work. On 2channel they grew arms, props and sound words and became one-line banners. Because nothing has to line up with the row above or below, they are the only part of Japanese AA that survives any font.

**What it looks like**

- A face between parentheses: two eye characters and a mouth in the middle, emphasis on the eyes
- Arms and hands outside the brackets: raised, bowing with the letter m on each side, or waving with half-width katakana
- Mixed scripts in one face: Latin punctuation, Greek omega, Cyrillic De, the for-all sign, katakana, full-width forms
- A sound or action word in half-width katakana trailing the face
- The celebration banner: a face in the middle of a long rule of heavy box-drawing dashes ending in exclamation marks, which works as a header line by itself
- A turning-head strip: the same face repeated along one line with features shifting, so the line reads as animation
- Posture figures made of three or four characters (the kneeling 'orz' family and its full-width version)
- Regional forms: Korean faces built from jamo (crying eyes from the vowel letters), Chinese use of a rare character as a dismayed face combined with 'rz'

**Palette.** None; plain text in the page colour.

**Lettering.** Whatever font the page uses. Characters come from many Unicode blocks, so each glyph may be drawn by a different fallback font; that is part of the look.

**Motion.** static

**As a README header.** A single centred line above the first heading, as plain text or in a one-line pre block: the project name between two arms-up faces on a heavy rule. A made-up example: ━━━━ (ﾉ^\_^)ﾉ  README.NFO  ヽ(^\_^ヽ) ━━━━ It can also serve as a section divider further down the page.

**How to build it.** Safe because it is one line: widths may vary by font but nothing depends on vertical alignment. I checked coverage in Consolas, the font a GitHub pre block uses on Windows: brackets, Greek omega, Cyrillic De, the degree sign and box-drawing are present; the for-all sign, half-width kana, full-width forms and katakana are missing and fall back to a system font, which works but changes spacing. Keep to characters from ASCII, Greek, Cyrillic and box-drawing for the most predictable result.

**Do not copy / caveats.** Avoid faces that are a mascot's identity (Mona's face in particular) and the over-used Western-internet memes (shrug, table flip, Lenny). Faces using combining marks or South Asian letters for eyes render badly or as empty boxes on some systems. Some faces have two opposite readings in Japan (the arms-up cheer is also used for 'it is all over'). Screen readers read every symbol aloud, so keep it to one line. On its own it is slight; it works best as the text fallback for the AA style.

**References**

- [English Wikipedia, Kaomoji: origin, upright reading, structure, growth on 2channel](<https://en.wikipedia.org/wiki/Kaomoji>)
- [Japanese Wikipedia, Kaomoji: date and place of the first upright face, double meanings of some faces](<https://ja.wikipedia.org/wiki/顔文字>)
- [English Wikipedia, Emoticon: 2channel, Korean jamo and Chinese ideographic sections](<https://en.wikipedia.org/wiki/Emoticon>)
- [Japanese Wikipedia, ASCII art: the emoticon table by mood, including the long-dash banner and the turning-head strip](<https://ja.wikipedia.org/wiki/アスキーアート>)

---

## Research notes

- Count: the brief asks for 6-8 styles, the closing line for 2-5. I returned 7, ordered strongest first; if a cap of 5 applies, keep the first five (FM status display, PC-98 screen, PTT, Shift\_JIS AA, MML) and drop the boot screens and kaomoji.
- No web search was possible: the session's search budget was already spent, so everything came from direct fetches of known URLs, links followed from fetched pages, raw Wikipedia wikitext, raw GitHub files, and GitHub's repository lookup API (used to find MMDSP, 98fmplayer, ppmck and MDPlayer).
- The fetch summariser invented details when my prompt named them: it 'confirmed' two-colour characters, PCMan/PieTTY and Big5 on the Chinese PTT article, and misattributed the AA size classes. I re-read the raw wikitext; none of those were there. Everything in the styles is from raw text, source code or screenshots I viewed; the two-colour character trick is marked unconfirmed.
- First-hand measurements made on this machine with fontTools: MS PGothic advances at 16 px (half-width space 4.9 px, full-width space 10.6 px, period 3.25 px, slash 8 px, katakana no 11.3 px, kanji 16 px); Consolas cell 0.55 em, with box-drawing, half block, Greek and Cyrillic present and kana, full-width forms, Chinese, corner triangles and eighth-width bars absent; Yu Gothic fallback widths 1.0 em (full-width) and 0.5 em (half-width kana). Menlo and Liberation Mono were not available to measure.
- GitHub facts verified at source: the monospace stack is ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono (primer/css), and README HTML has inline styles, classes and ids stripped (github/markup README). This is why proportional AA and double-width grids cannot be fixed with markup.
- CJK in SVG, general answer: fonts cannot be loaded, so either convert the few glyphs needed to paths from a free font, or use system fallback with textLength on every run so the width is fixed. Paths are required for Shift\_JIS AA; fallback plus textLength is acceptable for short labels in the PTT and PC-98 styles. The Mona Font page states the font and its Shinonome base are public domain; IPA Mona and Textar are under the IPA font licence, whose terms I did not read.
- Unreachable or unusable: msx.org (403), aesthetics.fandom.com (403), en.touhouwiki.net (418), text-mode.tumblr.com (403), aahub.org and fonts.aahub.org (script-only pages), nullsleep.com mck guide (404), zh.wikipedia article on two-colour characters (404). Japanese Wikipedia has no articles for MXDRV, PMD, FMP, MMDSP or FMDSP. pc98.org is a disk-image download site behind an adult-content gate, so I did not use it.
- PC-98 pixel art: I found no specialist write-up of dither conventions that I could open. The Hardcore Gaming 101 / Retro Gamer article confirms dithering and the still-image origin of visual novels; pattern specifics and the 5:6 pixel shape are marked as unconfirmed or derived. A dedicated source on PC-98 art technique is still worth finding.
- Optional item 8 (Korean and Chinese BBS) did not reach style quality. Leads only: Korean Wikipedia has PC tongsin and the Iyagi terminal emulator (made by the Hanulso club at Kyungpook National University, last version 8.5 in 2001); English Wikipedia has SMTH BBS at Tsinghua. Neither gave screen-level detail. The jmplayer repository points at 1990s Korean AdLib karaoke formats with syllable-highlighted lyrics, which could become a Korean music-screen style with more research.
- X68000 start-up screen: not confirmed from any emulator or museum page, so it is excluded from the boot-screen style.
- The pttbbs repository is active (its terminal doc shows an update dated 29 September 2026) and its sample screens are Big5-encoded; they decode cleanly with Python's big5hkscs codec if anyone wants to study the block-art vocabulary further.
- Screenshots and source files I inspected are in C:\\Users\\luked\\AppData\\Local\\Temp\\claude\\D--python-README-NFO\\ceb24e23-4d50-4a3b-af92-9f302ce95521\\scratchpad (mmdsp.png, fmdsp\_gtk.png, v\_88basic.png, v\_n8886.png, v\_msx.png, v\_sjis.png, pmdmml.txt, and the ptt folder). No files were written to the project directory.
- Sizes quoted for the SVG routes (40-90 KB for AA as paths, 60-120 KB for the FM display) are estimates; nothing was built or measured.
