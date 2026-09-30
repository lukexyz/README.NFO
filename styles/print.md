# Physical media and print ephemera

<sub>Generated from <code>styles.json</code> by <code>tools/build-styles.mjs</code>. 5 styles, researched 2026-09-30. Added in a gap-filling pass: checked by its own researcher only, not by a second reviewer. [Back to the catalogue](README.md) · [Full index](INDEX.md)</sub>

## Reviewer's summary

This family is the objects the scene traded and kept rather than the screens it watched. It splits into three schools: magnetic media as objects (the hand-labelled floppy and its photocopied sleeve, the cassette with a J-card and turning reels), machine print (magazine type-in listings, tractor-feed printouts, banner pages and the punched card that gave us 80 columns), and scene paperwork (tick-box swap letters, party pre-invitations with reply coupons, hand-drawn votesheets). The media objects are drawn things and need SVG, with handwriting as paths; the listings and forms are already monospace text and work in a plain code block. The cassette is the one that answers two of the owner's asks at once, because both vaporwave and chiptune netlabels still release on tape, and one chiptune label sells a tape of cracktro, keygen and installer tunes. Everything here was checked against scans or photographs I opened (Got Papers?, archive.org magazine scans, Wikimedia Commons, Bandcamp label pages), not written from memory.

## Styles

| ID | Style | Medium | Build | Impact |
| --- | --- | --- | --- | --- |
| [print-01](#print-01) | Swapper's floppy: hand-labelled 3.5-inch disk, fanned as 'disk 1 of N' | Static SVG | Medium | 4/5 |
| [print-02](#print-02) | Netlabel cassette: J-card with obi strip, and a shell whose reels turn | Animated SVG | Easy | 5/5 |
| [print-03](#print-03) | Magazine type-in listing: BASIC, DATA blocks and a checksum column | Text | Easy | 3/5 |
| [print-04](#print-04) | Tractor-feed printout: green-bar paper, banner page in giant letters, punched-card strip | Text + SVG | Easy | 4/5 |
| [print-05](#print-05) | Scene paperwork: tick-box swap letter, party pre-invitation with reply coupon, hand-drawn votesheet | Text + SVG | Easy | 4/5 |

---

<a name="print-01"></a>

## print-01 · Swapper's floppy: hand-labelled 3.5-inch disk, fanned as 'disk 1 of N'

**Static SVG** · build: **Medium** · impact: **4/5** · 1986-1996, C64 and Amiga mail-swapping scene in Europe (5.25-inch on the C64, 3.5-inch on the Amiga); the 3.5-inch shell itself dates from Sony's 1981 design, standardised in 1983

Before any cracktro ran, a release arrived as a disk in an envelope, and the first thing a swapper saw was the label. Got Papers? shows a German Amiga swapper's disks, which it describes as "full of stickers and scribbles", and C64 disks that came in photocopied, hand-drawn paper sleeves called disk covers. In 1987 a Zurich C64 group even ran a postal competition for the best painted, sprayed or stickered disk.

**What it looks like**

- 3.5-inch shell, 90 x 94 mm (slightly taller than wide), in saturated mid-blue or black, with a brushed-metal shutter at the bottom centre holding one rectangular window, a small moulded arrow near one lower corner and a square write-protect hole in a corner
- A white label covering roughly the upper half of the face, almost full width, slightly yellowed and scuffed at the edges
- Label type A (seen on a blue disk): a dot-matrix printed file list in two columns, every entry starting with a dash, under an underlined italic title line ending in a number and a colon
- Label type B (seen on a black disk): a plain label with a hand-drawn logo in tall capitals made of two or three parallel pen strokes, a double underline, one handwritten word saying what is on the disk and a disk number inside a hand-drawn circle
- Label type C: a group's pre-printed sticker in two or three flat spot colours, with later contents scribbled over it in pencil
- 5.25-inch variant: black square jacket, large hub hole with a reinforcing ring, a small index hole beside it, an oblong head slot below, a write-protect notch in one side edge, a small label in the top-left corner, and a white paper sleeve with a note in blue felt-tip that includes the disk number
- Painted-disk variant (1987 competition entries): the whole jacket painted in diagonal two-colour stripes with stencilled letters
- Disk cover: a photocopied A4 sheet carrying two stacked square panels to fold round a 5.25-inch disk, a graffiti-style logo and issue number on one, a cross-hatched pen-and-ink illustration on the other, and a handwritten 'spread by handle/group' line in the margin

**Palette.** Disk blue (about \#1F5FA8) or matt black shell; brushed aluminium shutter in light-to-mid grey with fine horizontal lines; off-white label (\#F3EFE2); blue ballpoint, black marker, grey pencil and red felt-tip for writing; pure black on white for the photocopied sleeve.

**Lettering.** Three hands on one object: marker capitals built from parallel strokes (an inline or outline logo), quick ballpoint handwriting for the contents line, and 9-pin dot-matrix text for printed file lists. No typeset fonts at all on the swapper version. A publisher's printed label would add ruled lines and a small type block, but I did not examine a manufacturer's label specification.

**Motion.** Mostly static. Light options: the disks fan out from a stack once on load; the shutter slides aside and back; the handwritten title draws itself with a stroke-dashoffset animation; the circled disk number steps 1, 2, 3 as each disk comes to the front.

**As a README header.** Above the fold: one wide SVG showing a fan of N overlapping 3.5-inch disks. The front disk's label carries the project name as a hand-lettered multi-stroke logo, a one-line handwritten tagline and a circled '1'; each disk behind it shows only its label edge with a section name (Install, Usage, Data, Credits). Further down the README, a small single-disk SVG ('disk 2 of 5') heads each section. A dot-matrix file-list label is the natural place for real numbers (items, recipes, buildings). The README body and links stay as ordinary Markdown text; nothing here needs a code block, though the two-column dashed file list also works as plain text.

**How to build it.** The shell is a handful of rounded rectangles, the shutter a linearGradient plus a thin-line pattern, and label ageing one feTurbulence filter (a few hundred bytes, no bitmap). The cost is handwriting: no web fonts, so every handwritten word must be a path. Budget about 400-800 bytes per word as single-stroke paths, or build a 60-glyph single-stroke alphabet as symbols (8-12 KB) and reuse it. A five-disk header with one drawn logo and a dozen handwritten words lands around 20-40 KB. Dot-matrix label text can be real SVG text in a monospace stack with a dot-pattern mask. Optional draw-on animation is pure CSS stroke-dashoffset.

**Do not copy / caveats.** Do not copy any scanned label, sticker, logo or disk-cover drawing, and do not put a disk manufacturer's name, density code or logo on the shell; invent the lettering. Group and handle names in the references are credits, not material to reuse. The object, its proportions and the label conventions (title, contents, circled disk number, 'spread by' note) are free to reuse. Unconfirmed: exact label dimensions for 5.25-inch disks and the ruled-line layout of manufacturer labels (I found no manufacturer or museum specification; the 70 mm square figure comes from a label maker). Handwriting is hard to read at small sizes, so the project name must also appear as real text and in the image alt text. The light label reads well on both GitHub themes because the shell frames it.

**References**

- [Got Papers? post on a German Amiga swapper's disk collection (36 disk scans, late 1980s to early 1990s)](<https://gotpapers.scene.org/?p=2135>)
- [Scan: blue 3.5-inch disk with a dot-matrix two-column file-list label](<https://gotpapers.scene.org/wp-content/uploads/2017/07/thorion-disk07.jpg>)
- [Scan: black 3.5-inch disk with a hand-drawn multi-stroke logo, a contents word and a circled number](<https://gotpapers.scene.org/wp-content/uploads/2017/07/thorion-disk23.jpg>)
- [Scan: blue disk with a printed three-colour group sticker overwritten in pencil](<https://gotpapers.scene.org/wp-content/uploads/2017/07/thorion-disk15.jpg>)
- [Got Papers? post on the Swiss Cracking Association's 1987 disk design competition (painted, sprayed, dyed or stickered disks, entries sent by post)](<https://gotpapers.scene.org/?p=3323>)
- [Scan: 1987 5.25-inch swap disk in its white sleeve, small label top-left, striped gold group logo](<https://gotpapers.scene.org/wp-content/uploads/2019/11/swiss_cracking_association_disk_1987.jpg>)
- [Scan: painted 5.25-inch competition entry with a felt-tip note and disk number on the sleeve](<https://gotpapers.scene.org/wp-content/uploads/2019/11/sca_disk_competition_entry_by_trp_1_1987_p1.jpg>)
- [Got Papers? post listing 50 C64 disk covers, mostly early-to-mid 1990s, each credited to its artist](<https://gotpapers.scene.org/?p=3302>)
- [Scan: a 1995 photocopied disk cover sheet with two stacked panels and a 'spread by' note](<https://gotpapers.scene.org/wp-content/uploads/2019/10/antidote_4_disk_cover_by_condic_1995.jpg>)
- [World of Jani's C64 disk cover collection: notes most are photocopies worn by the post, addresses removed for privacy](<http://blog.worldofjani.com/?p=2420>)
- [Wikipedia, History of the floppy disk: 3.5-inch shell 90.0 x 94.0 mm, rigid case with sliding metal cover, 1981 and 1983 dates](<https://en.wikipedia.org/wiki/History_of_the_floppy_disk>)
- [Wikipedia, Floppy disk: write-protect notch on 5.25-inch, two corner holes on 3.5-inch, hub and head-opening details](<https://en.wikipedia.org/wiki/Floppy_disk>)
- [A label maker's 2-3/4 inch square label, described as suitable for diskettes (second source for label size, not a disk manufacturer's spec)](<https://www.avery.com/products/labels/5196>)

---

<a name="print-02"></a>

## print-02 · Netlabel cassette: J-card with obi strip, and a shell whose reels turn

**Animated SVG** · build: **Easy** · impact: **5/5** · J-card and Compact Cassette from the 1970s-90s; home-dubbed cassette culture from the mid-1970s (peak 1978-84); revived since the 2000s and now the standard physical format of vaporwave and chiptune labels on Bandcamp (2010s-2026)

A J-card is the folded card inside a cassette case, named for its shape seen from the side: a front panel, a narrow spine and a flap behind the tape. Cassette culture made it a do-it-yourself object (Wikipedia describes photocopied J-cards and tapes traded by post), and today's netlabels have kept the format. It answers 'where is the chiptune one, where is the vaporwave' with no sound needed: a track list with running times and two reels turning says 'now playing'.

**What it looks like**

- Unfolded J-card about 4 by 4 1/8 inches: front panel 2 9/16 in wide, spine 1/2 in, track-list flap 1 1/16 in, all 4 in tall
- Shell 4 by 2.5 inches (1.6:1) with two toothed hubs behind a central window, write-protect tabs on the top edge, five screws and a paper or printed label naming side A
- Blank-tape inlay (seen on a Commons photograph): single-colour ink on cream card, an A marker and a B marker each with a down arrow, a small empty box labelled for noise reduction, another for equaliser setting, and ruled lines split into two columns by a centre rule
- Vaporwave tape (seen on a 2026 anniversary cassette): a vertical obi strip over the left third of the front, white with thin double rules, large bold vertical Japanese text, a smaller vertical line in red, the title in extended sans capitals, a price in yen, catalogue number, label name and year, over a blurred blue-to-orange photographic front
- Chiptune tape (seen on a 2026 compilation of cracktro, keygen and installer tunes): dark upper two-thirds with a pixel-stair shape in grey blocks cut by blue horizontal scan bars, off-white lower third with the artist in heavy black extended sans and the title in blue, and a spine with a small boxed catalogue code at the foot
- Coloured shells named as editions: smoked grey, neon orange, crystal clear, royal purple, chrome mirror, plain black or white
- Clear plastic case shown at three-quarter view or flat beside its spine, with shrink-wrap highlights
- Track titles typed as DOS commands, block-character strings or fullwidth text, with running times right-aligned

**Palette.** Vaporwave tape: navy, white, signal red, gold spine lettering, a blue-to-orange soft gradient. Chiptune tape: charcoal, off-white, one process blue, mid-greys. Blank inlay: cream card with a single green (or red, or blue) ink. Shell: translucent smoke grey or one saturated colour, dark brown tape, white hubs.

**Lettering.** Heavy extended grotesque capitals for artist and title, set vertically on the spine; a small monospace or condensed sans for the track list and catalogue number; on the obi, large vertical CJK characters. On a home-dubbed tape, ballpoint handwriting on ruled lines. No fonts can be loaded, so display lettering is paths and the track list is system monospace.

**Motion.** Both hubs rotate continuously (the take-up side slightly faster), the tape pack on one side grows while the other shrinks over a long loop, a three-digit counter rolls, and one line of the track list is highlighted in turn as 'now playing'. Optional: a level meter of two bars, a side A to side B flip every minute.

**As a README header.** Above the fold: a wide SVG with the cassette shell on the left (reels turning, project name on the shell label, 'SIDE A') and the J-card laid open on the right. The spine becomes a thin vertical strip with the project name and a catalogue number that is really the version. The flap is the table of contents: side A and side B track lists where each track is a README section and the 'running time' is a real number (line count, item count, read time). An obi strip down the left edge of the front panel can hold the one-line pitch. Text-only fallback in a code block: a two-column SIDE A / SIDE B track list with dot leaders and times, plus tick boxes for the blank-tape fields. Section links go in ordinary Markdown under the image, or inside the pre block.

**How to build it.** Reels are two groups with animateTransform rotate (or a CSS keyframe with transform-origin at each hub); the shrinking and growing tape packs are two circles with animated radius. The shell is rectangles, a window clip-path and five small circles. The J-card is flat panels and system-monospace text. Roughly 10-25 KB with no texture, 30 KB with a feTurbulence paper grain and a shrink-wrap highlight gradient. Display lettering in an extended sans must be converted to paths (about 150-300 bytes per letter). Vertical CJK on the obi depends on the viewer's installed fonts unless outlined, so either outline a short phrase or keep the obi in Latin text set vertically.

**Do not copy / caveats.** No tape-brand names or logos, no noise-reduction trademark symbol (write 'NR' with a tick box), no real label names, catalogue prefixes or artist names; all of those are references only. The object, the J-card proportions, the side A/B track list, coloured shells and the obi strip as a device are free to reuse. If Japanese text is used it must be real, correct and meaningful, not decorative filler. Wikipedia's obi article lists books, LPs, CDs and games but not cassettes; its use on tapes is what I saw on a current vaporwave release, not a documented history. I did not find a written source on how the vaporwave cassette look developed; the description is from two label pages and two package photographs. Continuous rotation is gentle, but honour prefers-reduced-motion by stopping the reels.

**References**

- [Wikipedia, J-card: origin of the name, panel names and the dimensions of front, spine and flap; blank cards with ruled lines](<https://en.wikipedia.org/wiki/J-card>)
- [Wikipedia, Cassette tape: shell 4 x 2.5 x 0.5 in, write-protect tabs, tape-type notches, C60/C90, use for home computer data](<https://en.wikipedia.org/wiki/Cassette_tape>)
- [Wikimedia Commons photograph of a blank C90 inlay card: side markers, noise-reduction and equaliser boxes, two-column ruled lines](<https://commons.wikimedia.org/wiki/File:TDK_D-C90_cassette_case_showing_blank_inlay_card_IMG_6780-mod_(13845605953).jpg>)
- [Wikipedia, Cassette culture: home taping from the mid-1970s, photocopied J-cards, postal distribution, revival since 2000](<https://en.wikipedia.org/wiki/Cassette_culture>)
- [My Pet Flamingo (vaporwave, future funk and barber beats label) merch list: cassettes, box sets, a tape sold 'with obi strip'](<https://mypetflamingo.bandcamp.com/merch>)
- [Vaporwave cassette page: pearlescent J-card, obi strip, edition of 500, 22-track list with times](<https://mypetflamingo.bandcamp.com/album/news-at-11-10th-anniversary-edition>)
- [Package photograph of that cassette (obi strip layout described above)](<https://f4.bcbits.com/img/0047302871_10.jpg>)
- [Data Airlines, chiptune and retro-gaming label founded 2007, inspired by demo and crack scenes; dozens of cassette editions with catalogue numbers](<https://dataairlines.bandcamp.com/merch>)
- [Dubmood, Lost Floppies Vol 3: compilation of cracktro, keygen and installer chiptunes (one track is a Razor 1911 installer edit), sold as a smoked-grey cassette and in a sleeve die-cut like a 5.25-inch floppy](<https://dubmood.bandcamp.com/album/lost-floppies-vol-3-data127>)
- [Package photograph of that cassette with its spine](<https://f4.bcbits.com/img/0046558774_10.jpg>)
- [Goto80, Files In Space: a C60 cassette that also carries a data track loadable on a Commodore 64](<https://goto8o.bandcamp.com/album/files-in-space-data036>)
- [Wikipedia, Obi (publishing): what an obi strip is and what is printed on it (title, track list, price, catalogue number)](<https://en.wikipedia.org/wiki/Obi_(publishing)>)
- [Wikipedia, Commodore Datasette: about 50 bytes per second, turbo loaders, tape counter on later units](<https://en.wikipedia.org/wiki/Commodore_Datasette>)

---

<a name="print-03"></a>

## print-03 · Magazine type-in listing: BASIC, DATA blocks and a checksum column

**Text** · build: **Easy** · impact: **3/5** · Late 1970s to early 1990s, home computer magazines (Compute!, Compute!'s Gazette, ANALOG, Ahoy!, Antic, Softalk, Run and others); the checksum aids date from October and December 1983

Magazines printed whole programs for readers to type in: BASIC, with machine code carried as numbers in DATA statements. Because one wrong digit crashed the program, Compute! Publications added a checksum beside every line (The Automatic Proofreader, written by Charles Brannon, October 1983) and a separate entry program for pure machine code (MLX, December 1983). Anyone who owned an 8-bit computer remembers the columns of numbers and the evening spent typing them.

**What it looks like**

- Two narrow columns of listing per page in a small monospaced face, line numbers flush left, each BASIC line wrapped at 40 characters with the continuation hanging under it (seen on page 103 of the July 1985 Gazette)
- A right-aligned checksum on every line in the form of a colon, the word rem and a number up to 255, forming a ragged column of its own down the right side
- DATA lines of six comma-separated values each, line numbers stepping by six to match addresses
- Special keys spelled out in braces: a clear-screen token, a reverse-video token, counted tokens for repeated spaces or cursor moves
- Machine-code pages (seen on page 99): an address, a space and a colon, then six three-digit zero-padded decimal bytes and a seventh checksum number, separated by commas, the address rising by six each line
- A 'Program 1:' style heading above each listing and a page footer with the magazine name, month and page number
- From February 1986 the numeric checksum gave way to two letters; from June 1985 (Apple II) and December 1985 (C64) machine-code lines became eight hexadecimal bytes

**Palette.** Black ink on warm off-white magazine stock, slightly yellowed. As plain text it is monochrome. For an SVG page add grey pencil ticks or a yellow highlighter stripe marking how far the typist has got.

**Lettering.** A monospaced listing face reproduced from printer output, all capitals for BASIC keywords with lower-case 'rem' checksums, numerals with slashed or plain zeros; headings in the magazine's serif. In a README it is whatever monospace the code block uses. Made-up example (checksums invented, not computed): 10 PRINT"{CLR}{3 DOWN}{RVS} README.NFO {OFF}"     :rem 142 20 FOR I=0 TO 5:READ A:POKE 49152+I,A:NEXT     :rem 87 30 DATA 169,0,141,32,208,96                    :rem 201 and a machine-code line in the 1983-85 shape: 49152 :169,000,141,032,208,096,230

**Motion.** static

**As a README header.** Pure text in a code block, at most 80 columns. The listing is the header: line 10 prints the project name with brace tokens, REM lines carry the tagline and author, a short DATA block holds the project's real numbers, and GOTO or GOSUB lines name README sections and can be links inside a pre block. The checksum column runs down the right edge. A few lines of machine-code entry underneath work as a decorative footer. Optional SVG upgrade: the same text set as a two-column magazine page with a footer line and pencil ticks.

**How to build it.** Nothing to render: ASCII only, no box or block characters, so it survives every font and screen reader. Keep BASIC lines to 40 characters plus the checksum so the column aligns within 80. A nice touch is to make the checksums real by implementing a published one-byte checksum, so a reader could verify a line; I did not confirm the exact algorithm, so treat that as extra work. The SVG page variant is about 6-12 KB of text elements plus one paper-grain filter.

**Do not copy / caveats.** Do not copy any real listing, and do not use a magazine's name, masthead, page furniture or the names of its checksum utilities; describe them generically as a checksum column and a machine-code entry block. Brace notation, line numbers, DATA blocks and per-line checksums are conventions and free to reuse. Invented checksums should be labelled as decorative or else computed properly. Long runs of numbers are noise for screen readers, so keep the DATA block to a few lines. Note for accuracy: the automatic summary of the OCR text invented a hexadecimal example line; the scan itself shows decimal lines in July 1985, which is what I describe.

**References**

- [Wikipedia, Type-in program: era, magazines, BASIC with machine code in DATA statements, key mnemonics, checksum tools](<https://en.wikipedia.org/wiki/Type-in_program>)
- [Wikipedia, The Automatic Proofreader: Charles Brannon, October 1983, numeric checksum then two letters from February 1986, ran to December 1993](<https://en.wikipedia.org/wiki/The_Automatic_Proofreader>)
- [Wikipedia, MLX: December 1983, six decimal bytes plus a checksum per line; 8-byte hexadecimal format from 1985](<https://en.wikipedia.org/wiki/MLX_(machine_language_entry_software)>)
- [archive.org scan, Compute!'s Gazette July 1985, page 103: two-column BASIC listing with DATA lines, brace tokens and the rem checksum column](<https://archive.org/download/1985-07-computegazette/page/n104_w900.jpg>)
- [Same issue, page 99: two columns of machine-code entry lines, address then six decimal bytes and a checksum](<https://archive.org/download/1985-07-computegazette/page/n100_w900.jpg>)
- [OCR text of the same issue, including its how-to-type-in page (braces for special keys, underline for shifted keys)](<https://archive.org/stream/1985-07-computegazette/Compute_Gazette_Issue_25_1985_Jul_djvu.txt>)

---

<a name="print-04"></a>

## print-04 · Tractor-feed printout: green-bar paper, banner page in giant letters, punched-card strip

**Text + SVG** · build: **Easy** · impact: **4/5** · Punched card 1928 onward; line printers and job banner pages 1950s-80s; home dot-matrix printers and sign-and-banner software from 1984 to the early 1990s

Continuous paper with sprocket holes down both edges is the paper of computing: mainframe listings on green-striped sheets, a banner page in huge letters in front of every job so operators could separate them, and at home a birthday banner printed sideways across several sheets. The Print Shop (Broderbund, 1984; designed by David Balsam, programmed by Martin Kahn) had a banner mode that printed letters and graphics along continuous paper to any length, with a choice of eight fonts in solid or outline and a graphic before, after or on both sides of the message. The punched card is the ancestor: 80 columns by 12 rows on a 7 3/8 by 3 1/4 inch card, which is where the 80-column line itself comes from.

**What it looks like**

- Strips of round sprocket holes down both long edges: holes 5/32 inch across, 1/2 inch apart, with a fine perforation between the strip and the sheet and across every page fold
- Green-bar stock: alternating white and pale green horizontal bands across the full width, sheets 15 by 11 inches (or 9.5 by 11 for home printers)
- Line-printer text: up to 132 columns, 6 lines per inch, 66 lines per page, capitals, with slight vertical wobble between neighbouring characters on drum printers
- Banner page: the job or user name in letters built from one repeated character, a line of identifying fields (title, user, time), the same page printed twice, and heavy lines across the fold so jobs can be found from the edge of the stack
- Home banner: one line of giant block or outline letters running sideways across three or more joined sheets, the perforations visible between them, one small picture at one or both ends
- Dot-matrix texture: characters made of visible round dots from a 9-pin head, faint horizontal banding, ink fading across the page as the ribbon wears; near-letter-quality mode overlaps dots in a second pass
- Punched-card strip: a cream card with one cut corner, a row of printed characters along the top edge, rectangular holes in 80 columns, the last eight columns (73-80) holding a sequence number

**Palette.** White and pale green (\#DDEFD8) bars, grey-black ribbon ink that fades to mid-grey, off-white sprocket strips with dark holes. Home banners on coloured fan-fold: canary, pink, sky blue. Punched card: manila cream with black print and a single colour stripe along the top edge.

**Lettering.** Giant letters assembled from a single character (hash signs, asterisks or the letter itself), at most about ten per line on a banner page; 5x7 or 9-pin dot-matrix capitals for body text; solid or outline fat display letters for the home banner. Made-up banner-page lines: \*\*\*\* START \*\*\*\* JOB 0042 \*\*\*\* USER LUKE \*\*\*\* README.NFO \*\*\*\* \#\#\#\#\#  \#\#\#\#\#   \#\#\#   \#\#\#\#  \#   \# \#\#\#\#\# \*\*\*\* START \*\*\*\* JOB 0042 \*\*\*\* USER LUKE \*\*\*\* README.NFO \*\*\*\*

**Motion.** Paper feeds upward one line at a time in stepped moves while a print head sweeps left and right and each new line appears behind it; sprocket holes scroll with the paper. For the banner, the sheets slide sideways out of the printer. Static works too.

**As a README header.** Two forms. Text-only: a job banner page in a code block, with a field line at top and bottom (job number, user, file name, date) and the project name in giant hash-sign letters between them, up to ten letters per row at 80 columns. SVG: a wide sheet of green-bar paper with sprocket strips left and right, the project name as the banner page and the first lines of the README 'printing' beneath in dot-matrix capitals; or the home banner, three sheets joined edge to edge with outline letters and one original pictogram at each end. A punched-card strip with the project name along its top edge makes a slim divider between sections.

**How to build it.** Everything repeats, so patterns do the work: one pattern for the sprocket holes, one for the green bars, one dashed line for perforations. Dot-matrix lettering is block letters seen through a mask made of a dot pattern, so no per-dot elements are needed. Ribbon fade is a horizontal opacity gradient; line wobble is a one-pixel offset on alternate text runs. The feed animation is a stepped translate on the paper group plus a clip-path that uncovers one line per step. About 8-20 KB. The punched card is 80 by 12 possible rectangles; draw only the punched ones (roughly 100-200 rects, 4-8 KB). The text-only banner page has no technical risk at all.

**Do not copy / caveats.** Do not copy The Print Shop's clip art, borders or font designs, and do not name the program or any printer brand in the artwork; draw original letters and one original pictogram. No computer-maker's name or form number on the punched card. Tractor paper, green bars, banner pages, single-character giant letters and the 80-column card are generic and free to reuse. The catalogue already has a FIGlet entry: keep this distinct by always showing the page furniture (field lines, fold rules, sprocket strips), not just big letters. Pale paper is a bright slab on GitHub's dark theme, so give the sheet a margin and consider a dimmer stock colour under prefers-color-scheme: dark. Not confirmed from a scan: I read the banner-mode description in the manual's OCR text but did not view a photograph of a printed banner.

**References**

- [Wikipedia, Continuous stationery: names, sheet sizes, hole diameter and pitch, green-bar stock, bursters, rise and decline](<https://en.wikipedia.org/wiki/Continuous_stationery>)
- [Wikipedia, Line printer: 132 columns, 6 lines per inch, 66 lines per page, green-bar forms, drum-printer misalignment](<https://en.wikipedia.org/wiki/Line_printer>)
- [Wikipedia, Banner page: job separator sheets, what they carry, printed twice, lines over the fold](<https://en.wikipedia.org/wiki/Banner_page>)
- [Wikipedia, banner (Unix): large letters made of hash signs for separator pages, ten-character limit, the BSD version by Mary Ann Horton that prints along the paper](<https://en.wikipedia.org/wiki/Banner_(Unix)>)
- [Wikipedia, The Print Shop: 1984, credits, signs, cards, banners and letterheads on dot-matrix printers, over 800,000 sold by 1987](<https://en.wikipedia.org/wiki/The_Print_Shop>)
- [archive.org OCR of the 1989 Apple II Print Shop manual: banner mode prints horizontally on continuous paper to any length, eight fonts, solid or outline, graphic before or after](<https://archive.org/stream/apple2_broderbund_print_shop_manual_1989/apple2_broderbund_print_shop_manual_1989_djvu.txt>)
- [Wikipedia, Dot matrix printing: 9-pin and 24-pin heads, draft and near-letter-quality modes, ribbon behaviour](<https://en.wikipedia.org/wiki/Dot_matrix_printing>)
- [Wikipedia, Punched card: 7 3/8 x 3 1/4 in, 80 columns, 12 rows from 1930, rectangular holes, corner cut, columns 73-80 for sequence numbers](<https://en.wikipedia.org/wiki/Punched_card>)
- [Wikipedia, Characters per line: 80 columns from the punched card through terminals to the PC text mode; 132 from line printers](<https://en.wikipedia.org/wiki/Characters_per_line>)

---

<a name="print-05"></a>

## print-05 · Scene paperwork: tick-box swap letter, party pre-invitation with reply coupon, hand-drawn votesheet

**Text + SVG** · build: **Easy** · impact: **4/5** · 1986-1996, European C64 and Amiga scene, exchanged by post and handed out at copy parties and demoparties; preserved by Got Papers? (a research project with scene.org and Demozoo, endorsed by the University of Zurich) and Scene Letters

Swappers kept dozens of postal contacts going at once, so the paperwork became standardised: a short note with every disk, and sometimes a pre-printed form where the sender only ticked boxes. Parties were announced on photocopied sheets with a coupon to post back, and competitions were judged on paper votesheets. One archive alone holds 269 letters from 127 people in 16 countries sent to a single German C64 swapper. It is the scene's office stationery, and it is mostly plain monospaced text.

**What it looks like**

- Tick-box form letter (Belgian Amiga group, November 1990): group logo across the top, a place-and-date line, a 'hi ... of ...' line with two dotted blanks, then two columns of small square boxes under headings for what the sender is thanking you for, what they would like sent, how your last sending rated (from cool down to damaged), where they hope to meet you, and a long list of stock messages
- Stock messages on that form include asking for the stamps and the envelope to be sent back, asking you not to write the group's name on the envelope, to check disks for viruses, to use better envelopes and to greet them; then a 'this sending contains N disks' section, a PO box to write back to, and a sign-off line; boxes ticked in red pen
- Short notes (1990): a few lines in blue ballpoint on a small card with the handle and group in block capitals, a return postal code, the date and a line saying legal material only; or four dot-matrix lines with a handwritten date, a signed handle/group and a postscript
- Party pre-invitation (France, 1992): stacked ruled boxes on one sheet; a title in wide striped capitals; the organising groups named between asterisks; a list of dash-bulleted fields aligned on colons (place, date, expected attendance, contests, duration); a 'write to' box with three address blocks side by side; a tear-off coupon with dotted lines for handle, group and address
- The same sheet carries a 'spread by handle of group' line in red felt-tip along the top and the spreader's own small sticker in the corner
- Copy-party invitation (Denmark, 1987): one page of dot-matrix text, an italic title line, fully justified paragraphs with stretched word spaces, and a list of handles with phone numbers
- Votesheet (Poland, 1996): a hand-drawn bubble-letter party logo in marker, margins filled with spirals and stars, and a grid of twelve competition boxes in four columns, each with a hand-lettered heading and numbered ranks, the gutters between boxes cross-hatched

**Palette.** Photocopier black on white with blown-out contrast, grey speckle and the occasional toner streak; red pen for ticks and 'spread by' notes; blue ballpoint for handwriting; pale fold creases. As plain text it is monochrome.

**Lettering.** Dot-matrix or typewriter monospace for the forms and letters, all capitals on the tick-box form; hand-drawn marker logos and bubble letters for headings; ballpoint handwriting for the filled-in parts. Made-up tick-box lines in the same manner: THANX FOR...            PLEASE SEND IF POSSIBLE... \[x\] THE STAR            \[x\] A BUG REPORT \[ \] THE FORK            \[ \] YOUR PULL REQUEST

**Motion.** Static as text. As SVG: red ticks draw themselves into the boxes one after another, a 'spread by' note writes itself across the top, the sheet sits rotated a degree or two. Nothing needs to loop.

**As a README header.** Best as plain text in a code block. The header is a form letter to the reader: a small ASCII logo, a 'hi ... of ...' line, then two columns of tick boxes that state real project facts (what is included, what is wanted from contributors, current status), a 'this sending contains' line with the project's numbers, and a 'write back to' block that points to the issues page. Links work inside the pre block. A party-invitation variant uses the dash-and-colon field list for install facts and a dotted coupon for 'how to contribute'. A votesheet variant turns a feature matrix into a grid of boxes with ranks. An SVG overlay can add the photocopy look and red ticks, with the text kept underneath as real Markdown.

**How to build it.** The text version is ASCII with square brackets for boxes, so it is safe at any width up to 80 columns and reads sensibly in a screen reader. The SVG photocopy look needs no bitmap: system monospace text, a feComponentTransfer step to crush greys to black and white, an feTurbulence speckle, one pale diagonal streak, two fold-crease lines and a one-to-two degree rotate. Red ticks are short paths animated with stroke-dashoffset. About 8-15 KB; a hand-drawn marker logo as paths adds 3-8 KB. A fully hand-drawn votesheet is the expensive variant (30 KB or more of paths) and is better approximated with ruled boxes and one drawn heading.

**Do not copy / caveats.** These scans contain real handles, postal codes, addresses and phone numbers; the archives themselves black some of them out. Do not reproduce any of them, and do not invent realistic personal addresses: the 'write back to' block should be a project URL. Do not copy group names, logos or the wording of a specific form; the form-letter idea, tick boxes, dotted blanks, colon-aligned field lists, reply coupons and ranked vote boxes are generic and free to reuse. Do not trace the votesheet or flyer artwork. Unconfirmed: I confirmed the request to return stamps only as a tick-box on one 1990 form, and found no written history of the practice (no Wikipedia article on swappers exists at the URL I tried, and the Demoscene article has one sentence); stories about reusing stamps are left out. GitHub's own task-list checkboxes do not render inside a code block, so the boxes are typed characters.

**References**

- [Got Papers? swapletters tag: collections of letters 1986-1998, including 269 letters from 127 people in 16 countries to one swapper](<https://gotpapers.scene.org/?tag=swapletters>)
- [Got Papers? post: 21 letters of 1990-92 sent to a German Amiga pack editor and swapper](<https://gotpapers.scene.org/?p=3986>)
- [Scan: pre-printed tick-box swap letter, 20 November 1990 (the form described above)](<https://gotpapers.scene.org/wp-content/uploads/2021/07/sarcophaser_to_jugger_19901120_p1.jpg>)
- [Scan: short ballpoint swap note, 17 October 1990](<https://gotpapers.scene.org/wp-content/uploads/2021/07/mr._lee_to_jugger_19901017.jpg>)
- [Scan: dot-matrix swap letter with handwritten date and signature, 21 October 1990](<https://gotpapers.scene.org/wp-content/uploads/2021/07/slider_to_jugger_19901021.jpg>)
- [Got Papers? post '32 Years of Computer Parties': invitations, flyers and votesheets 1987-2019](<https://gotpapers.scene.org/?p=3885>)
- [Scan: 1992 party pre-invitation with address blocks, reply coupon and a 'spread by' note](<https://archive.scene.org/pub/resources/gotpapers/parties/beach_party_1992_invitation.jpg>)
- [scene.org record and scan: invitation to the Danish Gold copy party, 24-26 July 1987, Odense (A4, dot-matrix text)](<https://files.scene.org/view/resources/gotpapers/parties/danish_gold_copy_party_1987_invitation.jpg>)
- [scene.org record and preview: Gravity 1996 votesheet (Opole, Poland), credited to Sharp/Anadune, A4 paper](<https://files.scene.org/view/resources/gotpapers/parties/gravity_1996_votesheet.jpg>)
- [Got Papers? votesheets tag: party and diskmag votesheets, vote disks and vote keys, 1990s-2009](<https://gotpapers.scene.org/?tag=votesheets>)
- [Got Papers? About page: aims, partners, 300 DPI scanning](<https://gotpapers.scene.org/?page_id=4>)
- [Scene Letters: archive of letters written while mail swapping (second source for the practice)](<http://www.sceneletters.com/>)
- [Wikipedia, Demoscene: defines the swapper as the member who spreads productions by mail](<https://en.wikipedia.org/wiki/Demoscene>)

---

## Research notes

- Count: the brief asked for 6-9 styles but the closing instruction said 2 to 5, so I returned 5 and merged: disk sleeve and photocopied disk cover are inside the floppy style; punched card, line-printer banner page and the home dot-matrix banner are one printout style; swap letter, party flyer and votesheet are one paperwork style. Any of these can be split back out if more entries are wanted.
- Not delivered: the big-box back cover and the magazine cover-disk or cover-tape card. MobyGames returned HTTP 403 to the fetcher and showed a bot-verification page in the browser, which I did not try to get past, so I saw no cover scans. What I did collect from Wikipedia: big boxes were about 20 x 15 x 5 cm in the late 1980s to early 1990s, shrank around 2000 when the IEMA standardised on DVD-case size, and back covers mixed screenshots with pre-rendered scenes; covermounts were taped or glued to the magazine in a clear sleeve, first tapes then floppies, with full games from the mid-1980s (https://en.wikipedia.org/wiki/Video\_game\_packaging, https://en.wikipedia.org/wiki/Covermount). That is enough for orientation but not for a layout description.
- The WebSearch budget for this session was already exhausted (200 of 200), so all research was by direct fetch of known or guessed URLs and by following links inside pages. Several guesses failed: en.wikipedia.org/wiki/Swapper\_(demoscene) is a 404, a Bandcamp Daily URL was a 404, and a Commons category for J-cards does not exist.
- Image-based claims were checked by opening the scans in the browser pane and looking at them, not from text summaries. That covers the three 3.5-inch disk labels, the two 5.25-inch disks, one disk cover, the three swap letters, the two party invitations, the votesheet, the two cassette package photographs, the blank inlay card and the two magazine listing pages.
- One correction to watch for: the fetcher's text summary of the July 1985 Gazette invented a hexadecimal machine-code example line. The page scan shows six three-digit decimal bytes plus a checksum per line, which matches Wikipedia's dating of the hexadecimal format to later in 1985. The style entry follows the scan.
- Floppy label dimensions are only partly sourced. The 3.5-inch shell size (90.0 x 94.0 mm) is from Wikipedia; the 70 mm square label is from a label maker's product page, not a disk manufacturer or museum. I found no source for 5.25-inch label sizes or for the ruled-line layout of manufacturer labels.
- Useful link to the owner's 'Razor' and 'chiptune' asks: Data Airlines' current cassette 'Lost Floppies Vol 3' (Bandcamp lists the release date as 7 August 2026) is a compilation of cracktro, keygen and installer chiptunes, with one track titled as a Razor 1911 installer edit and cover art credited as ASCII by Goto80. It is a reference only; none of its names or artwork should be used.
- Useful link to an existing catalogue entry: the vaporwave cassette I examined has eleven tracks named after The Weather Channel, which ties the cassette style to the existing Signalwave entry.
- While probing for a second punched-card source, the fetcher automatically saved one PDF from columbia.edu into the session's tool-results folder (C:\\Users\\luked\\.claude\\projects\\D--python-README-NFO\\ceb24e23-4d50-4a3b-af92-9f302ce95521\\tool-results\\webfetch-1790763960816-846cgf.pdf). I did not use it and nothing was written to the project directory.
- On Bandcamp I dismissed the cookie banner with the necessary-only option. No forms were submitted and nothing was downloaded deliberately.
