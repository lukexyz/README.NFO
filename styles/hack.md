# Hacker, phreak and zine culture

<sub>Generated from <code>styles.json</code> by <code>tools/build-styles.mjs</code>. 18 styles, researched 2026-09-30. Checked by a second reviewer, who made 44 corrections. [Back to the catalogue](README.md) · [Full index](INDEX.md)</sub>

## Reviewer's summary

Checked against sources, the family holds up and splits into five schools. (1) Plain-text publishing: BBS and internet text zines (Phrack, cDc, LOD/H TJ, 40Hex), the IETF/Unix document formats (RFC, man page) and the PGP clearsigned message. Identity comes from a repeated header grammar, a contents list and a closing line in 72-79 columns of 7-bit ASCII. (2) Tool output: security-tool banners and scan reports, the fetch card, and the full-screen monitor (htop meters with a tmux status line). These read as "a program just ran". (3) Character-cell worlds and social screens: roguelike maps, MUD transcripts, mIRC channel windows, PC diskmag readers and CTF challenge boards. (4) Spectacle screens: DOS virus payloads, the WarGames big board, digital rain, the Sneakers decrypt reveal and the 3D file-system city. These are animated SVG and carry the most impact. (5) Phreak hardware: the tone pad with dual-tone scope traces, which is the one honest way in this family to evoke sound without audio.

All twelve original styles survive, with corrections. Six were added because the brief named them and the research had left them as footnotes or skipped them: PGP clearsigned block, TUI monitor (split out of the fetch card), MUD session, decrypt reveal, phreak tone pad and CTF board. That makes eighteen, more than the six to ten suggested. If trimming, keep the big board and file-system city (wow 5), then roguelike, virus payload, mIRC window, digital rain and decrypt reveal (wow 4), plus one text format (the Phrack-lineage header is the most recognisable). The weakest are RFC/man, PGP block, fetch card and MUD (wow 2).

Text specimens were read directly and measured: Phrack 1, 49, 53-58, 69 and 72; cDc \#200; LOD/H TJ 1; 40Hex 1; RFC 1149, 2223, 7322 and 9110; Metasploit banner code and logo files; and the htop, tmux, neofetch, Vim, tbaMUD and CTFd sources. IRC art was inspected structurally through the GitLab mirror of the ircart archive. Film and GUI styles still rest on written descriptions, not on viewing footage; where a source gives process but not appearance (WarGames hues, fsn hues, diskmag palettes, mIRC default colours) the caveats say so.

Techniques that apply across the family:  
- Text styles go in a `<pre>` block with `<a>` tags when rows should link; keep to 72-76 columns of 7-bit ASCII.  
- In SVG no font can be loaded, so pin the cell grid with `textLength` per row or per-glyph x positions, and draw blocks, swatches, walls and meters as `<rect>`, not block glyphs.  
- Every animated style should carry a `prefers-reduced-motion` rule that holds the final frame.  
- An `<img>` SVG is not clickable, so real navigation must be repeated as markdown below the header.

## Styles

| ID | Style | Medium | Build | Impact |
| --- | --- | --- | --- | --- |
| [hack-01](#hack-01) | Text-zine issue header (Phrack lineage: header bars, hex contents, EOF line) | Text | Easy | 3/5 |
| [hack-02](#hack-02) | BBS t-file with framed masthead and directory footer (cDc lineage) | Text | Easy | 3/5 |
| [hack-03](#hack-03) | Standards plain text: RFC first page and Unix man page | Text | Easy | 2/5 |
| [hack-04](#hack-04) | PGP clearsigned message block (cypherpunk list post) | Text | Easy | 2/5 |
| [hack-05](#hack-05) | Security-tool console: rotating banner, bracketed stats block and scan-report table | Text | Easy | 3/5 |
| [hack-06](#hack-06) | Fetch card: ASCII logo left, key-value system info right, palette blocks | Text + SVG | Easy | 2/5 |
| [hack-07](#hack-07) | Full-screen TUI monitor: bracketed bar meters, process table, function-key bar, tmux status line | Animated SVG | Easy | 3/5 |
| [hack-08](#hack-08) | Roguelike dungeon screen (Rogue / NetHack terminal layout) | Text + SVG | Easy | 4/5 |
| [hack-09](#hack-09) | MUD session transcript (login banner, room block, exits line, HP prompt) | Text | Easy | 2/5 |
| [hack-10](#hack-10) | DOS virus payload screen (falling letters, crawling sprite) | Animated SVG | Medium | 4/5 |
| [hack-11](#hack-11) | mIRC channel window with colour-code block art and netsplit | Animated SVG | Medium | 4/5 |
| [hack-12](#hack-12) | PC diskmag reader (three-band screen, two-column articles, charts, tune player) | Animated SVG | Medium | 3/5 |
| [hack-13](#hack-13) | War-room big board: vector world map, tracks and counters | Animated SVG | Medium | 5/5 |
| [hack-14](#hack-14) | Digital rain banner (light falling through fixed glyph columns, resolving into the title) | Animated SVG | Medium | 4/5 |
| [hack-15](#hack-15) | Decrypt reveal: a scrambled text block that resolves into plaintext | Animated SVG | Medium | 4/5 |
| [hack-16](#hack-16) | 3D file-system landscape (pedestals and wires, or the glass-tower data city) | Animated SVG | Medium | 5/5 |
| [hack-17](#hack-17) | Phreak tone pad: 4x4 keypad matrix with dual-tone scope traces | Animated SVG | Easy | 3/5 |
| [hack-18](#hack-18) | CTF challenge board and scoreboard (category tiles, top-ten score graph, rank table) | Animated SVG | Easy | 3/5 |

---

<a name="hack-01"></a>

## hack-01 · Text-zine issue header (Phrack lineage: header bars, hex contents, EOF line)

**Text** · build: **Easy** · impact: **3/5** · 1985 to present. Phrack issue 1 was released 17 Nov 1985 on the Metal Shop BBS; 72 issues to 2025. Conventions below were read from issues 1 (1985), 49 (8 Nov 1996), 53-55 (1998-99), 56 (1 May 2000), 57 (11 Aug 2001), 58, 69 (6 May 2016) and 72 (2025), plus LOD/H Technical Journal 1 (1 Jan 1987) and 40Hex 1.

Hacker text zines are bundles of numbered plain-text files, each opening with the same centred masthead and a 'file N of M' line so any single file identifies the whole issue. The modern form (hex numbering from issue 56, bracketed header bars from issue 57) has been stable for 25 years, so a security person recognises it from the first three lines.

**What it looks like**

- Centred masthead line: the magazine name between double equals signs; two lines below, a centred line giving volume, issue and 'file N of M'. Issues 1-50 spell the numbers as words; from issue 56 all three are hex (0x0f, 0x45, \#0x01 of 0x10)
- A stack of eight full-width bars, 75 columns: each opens pipe-equals and closes equals-pipe, filled with hyphens; text bars carry =\[ text \]= centred in the hyphen run. Issue 69 order: blank bar, title, blank, author, contact address, blank, date, blank
- Section headings flush left as two hyphens, an open square bracket, a space and the title, never closed. The ancestor in issues 53-55 is a '---\[' line carrying magazine, volume, issue, date and 'article NN of NN', with longer hyphen runs for other heading levels
- Contents, 2016 form: two-space indent, hex index (0x01...), title, dot leader to a fixed column, author name; a blank line between rows; long titles wrap with the leader on the second line
- Contents, 1996 form: three fixed columns (number and title, 'by author', size in K at the right edge) under a centred heading with a hyphen rule
- 1996 ornaments: a '.oO title Oo.' bubble line, then a letter-spaced issue name and the date between two 20-underscore rules; a credits block with role labels right-aligned to a colon column, real and joke roles mixed
- Issue 1 opens with a 5-row sponsor-BBS logo drawn in slashes, underscores and pipes, a phone number and baud-rate line under it, then a 'Presents....' line; an article-level variant (issue 49 file 14) boxes the title between two rows of capital X
- The file ends with an ASCII-armoured PGP public key block and a final bar whose \[ EOF \] tag sits at the left end of the hyphen run; longest line in issue 69 is 75 columns

**Palette.** None. Monochrome; inherits the code-block colours in both GitHub themes.

**Lettering.** Monospace, 7-bit ASCII only: = - \| \[ \] . \_ &lt; &gt; and letters. The 2016 wordmark is a FIGlet-style outline logo in underscores, pipes, slashes and parentheses, 6 rows tall, with the issue number as a second 6-row block. Sister zines vary the header: LOD/H TJ puts 'File \#N of M' and a 'Volume, Issue, Released: date' line flush left and centres the title over a hyphen underline; 40Hex uses a running header with the magazine name at the left, a 5-digit page counter at column 73, and an index with 3-digit numbers and dot leaders.

**Motion.** static

**As a README header.** Entirely text, in a &lt;pre&gt; block of at most 75 columns. Above the fold: masthead line with the project name in the double-equals slot; a centred 'Volume 0xMM, Issue 0xNN, File \#0x01 of 0xNN' line mapped to major version, minor version and number of README sections; the bar stack carrying tagline, author, URL and release date; an optional 6-row outline wordmark; then a '--\[ Table of contents' section with hex-numbered README sections, dot leaders and a right-hand column (owner, size or status), each row an &lt;a&gt; link to a heading anchor. The README's last line is the EOF bar. Department names map naturally onto README sections (introduction, news/changelog, loopback/FAQ, greets).

**How to build it.** Pure string padding: centre the bracketed text and fill with hyphens to a fixed width of 75. 7-bit ASCII means no font-fallback alignment problems on any platform. Use &lt;pre&gt; rather than a fenced block so contents rows can be links; escape &lt; &gt; &amp; as entities. 75 columns scrolls horizontally on phones; a 64-column variant of the same grammar avoids that.

**Do not copy / caveats.** Do not use the Phrack name, its masthead wording, 'phile' as if this were an issue of that magazine, or its FIGlet logo. The bar grammar, hex numbering, dot-leader contents and EOF line are conventions freely imitated by other zines. Do not paste a PGP key block unless it is the owner's real key. Strong recognition among security people, little impact for anyone else. The article content of these zines is often illegal how-to material: borrow the layout only.

**References**

- [Phrack 69 file 1 (2016): header bars, hex numbering, '--\[' sections, dot-leader contents, contact block, PGP block, EOF bar; max line 75](<https://archives.phrack.org/issues/69/1.txt>)
- [Phrack 49 file 1 (1996): bubble ornament, letter-spaced issue name, three-column contents with sizes in K, joke credits list, PGP 2.6.2 key block](<https://archives.phrack.org/issues/49/1.txt>)
- [Phrack 1 file 1 (1985): sponsor-BBS logo, centred masthead, 'Phile 1 of 8', plain numbered contents](<https://archives.phrack.org/issues/1/1.txt>)
- [Phrack 49 file 14: article header with title between two rows of X](<https://archives.phrack.org/issues/49/14.txt>)
- [Phrack 56 file 2 (2000): first hex volume/issue line, no bars yet](<https://archives.phrack.org/issues/56/2.txt>)
- [Phrack 57 file 3 (2001): earliest issue found with the pipe-equals header bars](<https://archives.phrack.org/issues/57/3.txt>)
- [Phrack 72 file 1 (2025): the same masthead and bar stack still in use](<https://archives.phrack.org/issues/72/1.txt>)
- [LOD/H Technical Journal 1 (1987): flush-left file and volume lines, centred underlined title](<http://www.textfiles.com/magazines/LOD/lod-1>)
- [40Hex 1: running header with page counter, dot-leader index](<http://www.textfiles.com/magazines/40HEX/40hex001>)
- [Wikipedia: Phrack history, founders, recurring sections (Prophile, Linenoise, Loopback, Phrack World News, International Scenes)](<https://en.wikipedia.org/wiki/Phrack>)

---

<a name="hack-02"></a>

## hack-02 · BBS t-file with framed masthead and directory footer (cDc lineage)

**Text** · build: **Easy** · impact: **3/5** · 1984 through the 1990s, BBS text-file groups. Specimen read: cDc file \#200, dated 18 Dec 1992 in its own footer. The group was founded in 1984 in Lubbock, Texas.

A t-file is a single numbered text file released by a named group, wrapped in the same masthead and footer every time so the file advertises the group wherever it is mirrored. The header is a wide ASCII frame holding the group emblem; the footer is a boxed directory of affiliated boards with phone numbers beside a small mascot. It is the house style of the most self-mythologising group of the BBS era.

**What it looks like**

- A rectangular double frame about 70 columns wide: underscores for horizontals, pipes for verticals, an inner frame one cell inside the outer one; the top edge is broken in the middle third
- A large emblem inside the frame built from diagonal strokes (slash, backslash, underscore, pipe, angle bracket), about 14 rows tall, rising through the gap in the top edge
- One lower-case word letter-spaced with three spaces between letters, centred along the inside bottom of the frame
- Under the frame: a '...presents...' line indented 2 columns; a deliberately over-long hyphen-chained title on two lines indented 7 columns; the author line pushed to the right
- A centred imprint line between triple chevrons with a 7-dot leader running to the year, and under it the group name in capitals with the initials between hyphens at both ends
- A ruler separator: a row of alternating short underscore runs, then a pipe-to-pipe line of underscores with words embedded in it
- Body paragraphs indented 5 spaces, hard-wrapped at 79 columns; full-width single-underscore rules between scenes
- Footer box, 78 columns by 8 rows: a 9-column mascot cell with rounded slash corners on the left; to the right two 33-column directory columns of name, dot leader, number, separated by pipes; a row of equals signs; then a copyright line ending in date and '\#NNN', and a slogan line

**Palette.** None. Monochrome code-block text.

**Lettering.** Monospace 7-bit ASCII; logo strokes from \_ \| / \\ &lt; &gt;. Titles use leetspeak touches (zero for O, doubled letters, stray capitals); files are numbered '\#NNN'. A sibling convention is the all-capitals BBS bulletin with a pager hint at the top (a slash-drawn funnel holding 'space to end / ctrl-S pause' style instructions under a 39-hyphen rule), seen in an OSUNY file attributed to 1982/83.

**Motion.** static

**As a README header.** Entirely text. Above the fold (about 20 rows by 74 columns): the double frame with the project's own emblem or initials drawn in slash strokes, a letter-spaced descriptor word along the bottom edge, then the 'presents' line, the project title, a right-aligned 'by owner' and the centred imprint line with the year. The footer box goes at the very end of the README and turns the board directory into a two-column link directory (Docs....../wiki, Issues..../issues, Releases../releases) using &lt;a&gt; tags inside &lt;pre&gt;, closing with a copyright line carrying the release date and '\#version'.

**How to build it.** All 7-bit ASCII at 78 columns or less. The generator stamps title, author, year and directory rows into fixed templates; dot leaders are computed padding. The only real work is an original emblem: either a small library of slash-stroke glyph initials or a user-supplied block. Backslashes and angle brackets need HTML escaping inside &lt;pre&gt;.

**Do not copy / caveats.** Do not copy the cow-skull mascot, the 'cDc' or 'Cult of the Dead Cow' names, their slogans or their emblem; a framed masthead plus a directory footer is generic t-file practice. Much t-file content of the era was offensive or dangerous how-to material: borrow the layout only. 'Invented the e-zine' is the group's own claim, and the coining of 'elite' is a credit relayed by Wikipedia. Wide emblem art reads poorly on phones. The Apple II 40-column convention is lore I could not confirm from a specimen.

**References**

- [cDc file \#200 (1992): masthead frame, imprint lines, ruler, footer box with board directory (raw page read, max line 79)](<https://www.cultdeadcow.com/cDc_files/cDc-0200.html>)
- [Wikipedia: Cult of the Dead Cow, founding and the text-file series](<https://en.wikipedia.org/wiki/Cult_of_the_Dead_Cow>)
- [Wikipedia: Leet, substitutions and suffixes used in titles and handles](<https://en.wikipedia.org/wiki/Leet>)
- [OSUNY BBS bulletin: all-capitals variant with pager-hint header (layout only)](<http://www.textfiles.com/phreak/bluebox.txt>)
- [textfiles.com phreak directory: filename, size and one-line description listing convention](<http://www.textfiles.com/phreak/>)

---

<a name="hack-03"></a>

## hack-03 · Standards plain text: RFC first page and Unix man page

**Text** · build: **Easy** · impact: **2/5** · RFC series from 1969; the 72-column, 58-line paginated text format is set out in RFC 2223 (1997), and newer RFCs such as RFC 9110 (2022) are unpaginated. Man pages from 1971 Unix onward. Both are still produced.

The two canonical plain-text document layouts of internet and Unix culture. An RFC is recognisable from its two-column first-page header and 3-space indented sections; a man page from its NAME(1) title line and upper-case headings. Both are a long-running vehicle for deadpan jokes (RFC 1149 of 1 April 1990 is the classic), which is the register a README header wants.

**What it looks like**

- RFC header block, 72 columns: left column flush left (stream or working group, 'Request for Comments: N', then Obsoletes / Updates / Category / ISSN lines), right column flush right (author initial and surname, organisation, month and year), rows paired line by line
- Title centred, preceded by two blank lines and followed by one
- Flush-left headings with no underline (Abstract, Status of This Memo, Copyright Notice, Table of Contents); body text indented exactly 3 spaces
- Contents nested by decimal section number with extra indent per level; paginated RFCs add dot leaders to right-aligned page numbers
- Paginated RFCs close each 58-line page with a footer of surname at left, category centred, \[Page N\] at right, and open the next with a running header of RFC number, short title and date
- Man page title line: NAME(section) at left, manual name centred, NAME(section) repeated at right; last line: source and version at left, date centred, NAME(section) at right
- Man page body: upper-case headings flush left (NAME, SYNOPSIS, DESCRIPTION, OPTIONS, EXIT STATUS, FILES, EXAMPLES, SEE ALSO, BUGS), text indented 7 spaces, each option on its own line with its description indented a further 7 beneath
- SYNOPSIS syntax: square brackets for optional parts, vertical bars between choices, ellipses for repetition, upper-case placeholders

**Palette.** None. Monochrome.

**Lettering.** Monospace 7-bit ASCII. No art at all: hierarchy comes only from indentation, capitalisation and blank lines. Requirement keywords in capitals (MUST, SHOULD, MAY) and bracketed citation tags are the RFC's only emphasis.

**Motion.** static

**As a README header.** Entirely text, 72 columns. RFC form above the fold: left header column with an invented series name, 'Request for Comments: &lt;version&gt;', 'Category: Informational', 'Obsoletes: &lt;previous version&gt;'; right column owner, organisation and date; centred project title; Abstract (the one-paragraph pitch); Status of This Memo (build and stability); Table of Contents linking to README sections. Man form: 'PROJECT(1)   Project Manual   PROJECT(1)', then NAME with the one-line description, SYNOPSIS with the install or run command, DESCRIPTION, and a footer line carrying version and release date. The man form fits CLI tools; the RFC form fits libraries, protocols and data sets.

**How to build it.** Two-column header is left-pad/right-pad to 72 columns; centring is arithmetic. No special characters. Links work in a &lt;pre&gt; block. The bold and underline of real man pages are lost, but &lt;b&gt; is allowed inside &lt;pre&gt; on GitHub and can restore bold headings and option names. The indent pattern alone carries recognition.

**Do not copy / caveats.** Do not pass it off as a real RFC: avoid a real-looking RFC number, the IETF/IAB/Network Working Group stream names, the real ISSN and the IETF Trust copyright boilerplate; use an invented series name. The layouts are functional and freely reusable. Dry by design: high recognition among developers, no visual punch, so it suits projects that want deadpan rather than spectacle.

**References**

- [RFC 7322, RFC Style Guide: first-page header, centred title rule, required sections](<https://www.rfc-editor.org/rfc/rfc7322.txt>)
- [RFC 2223, Instructions to RFC Authors: 58 lines per page, 72 characters per line](<https://www.rfc-editor.org/rfc/rfc2223.txt>)
- [RFC 7994: plain-text requirements for the newer format (72-character lines, pagination optional)](<https://www.rfc-editor.org/rfc/rfc7994.txt>)
- [RFC 1149 (1 April 1990): classic paginated layout with page footers, used for a joke; max line 72](<https://www.rfc-editor.org/rfc/rfc1149.txt>)
- [RFC 9110 (2022): modern unpaginated header with Obsoletes/Updates lines and nested contents](<https://www.rfc-editor.org/rfc/rfc9110.txt>)
- [man-pages(7): section order, title-line fields, SYNOPSIS conventions](<https://man7.org/linux/man-pages/man7/man-pages.7.html>)
- [ls(1) rendered: title line, 7-space indent, option layout, footer line](<https://man7.org/linux/man-pages/man1/ls.1.html>)

---

<a name="hack-04"></a>

## hack-04 · PGP clearsigned message block (cypherpunk list post)

**Text** · build: **Easy** · impact: **2/5** · PGP 1.0 in 1991 (Philip Zimmermann); the cypherpunks mailing list from 1992; the armor and cleartext-signature framing is specified in RFC 4880. Seen throughout 1990s mailing lists, Usenet, zine footers and security advisories.

A plain-text message wrapped in dashed BEGIN/END delimiter lines with a block of base64 beneath it. It is the visual signature of cypherpunk and security-list culture, and it is one of the few retro text frames that can be real: the block can be a genuine signature that verifies.

**What it looks like**

- Opening delimiter line: five hyphens, the words BEGIN PGP SIGNED MESSAGE in capitals, five hyphens
- One or more 'Hash: &lt;algorithm&gt;' header lines, then exactly one blank line before the text
- Body in plain text; any body line that begins with a hyphen gains a 'hyphen space' prefix (dash-escaping), a small tell that the text really was signed
- Signature block: a BEGIN PGP SIGNATURE delimiter, optional 'Version:' and 'Comment:' header lines, a blank line, then a solid rectangle of base64 (64 characters per line in the Phrack specimens, 76 maximum by the spec)
- A last short base64 line, then a checksum line of an equals sign followed by four characters, then the END delimiter
- 1990s flavour: a 'Version: 2.6.2' line inside the block (seen in the 1996 Phrack key block); the manifesto-style close of name, e-mail address and date on three separate lines
- Public-key variant used as a zine footer: the same frame with BEGIN PGP PUBLIC KEY BLOCK and a much taller base64 rectangle

**Palette.** None. Monochrome.

**Lettering.** Monospace 7-bit ASCII. The only ornament is the five-hyphen delimiter pair; the base64 rectangle reads as dense grey texture against ragged prose above it.

**Motion.** static

**As a README header.** Entirely text. The header is a clearsigned message: inside it, project name, version, release date, a three-line description and the checksums of the release artifacts; beneath it the signature block. Generate it at release time with the maintainer's real key so that it verifies, which makes the header useful as well as decorative. It combines well with the zine or RFC styles as a wrapper or footer.

**How to build it.** Run the signing tool at build time and paste the output into a fenced code block (not &lt;pre&gt;), so no HTML entity escaping alters the bytes; keep the body free of trailing whitespace. Lines are at most 76 columns. Without a key the style should not be offered, or should render only the delimiter-and-text frame with no base64.

**Do not copy / caveats.** Never fabricate a signature or key block: a fake one misleads readers into trusting it, and copying someone else's block is worse. Only ever show the owner's real key or a real signature over the real text. Verification from a rendered page is fragile, so link to the raw file. Visually modest. The delimiter format is an open standard and free to use.

**References**

- [RFC 4880: armor header lines, Version/Comment/Hash keys, 76-character limit, CRC-24 line, cleartext signature framework and dash-escaping](<https://www.rfc-editor.org/rfc/rfc4880.txt>)
- [Phrack 49 file 1 (1996): a PGP 2.6.2 public key block as a zine footer](<https://archives.phrack.org/issues/49/1.txt>)
- [Phrack 69 file 1 (2016): key block followed by the EOF bar](<https://archives.phrack.org/issues/69/1.txt>)
- [A Cypherpunk's Manifesto, Eric Hughes, 9 March 1993: register and the name / address / date close](<https://www.activism.net/cypherpunk/manifesto.html>)
- [Wikipedia: Cypherpunk, mailing list founded 1992, PGP history](<https://en.wikipedia.org/wiki/Cypherpunk>)

---

<a name="hack-05"></a>

## hack-05 · Security-tool console: rotating banner, bracketed stats block and scan-report table

**Text** · build: **Easy** · impact: **3/5** · 1997 to present. Nmap was first published in Phrack 51 on 1 Sep 1997. Metasploit was created in 2003 in Perl and rewritten in Ruby by 2007. Both still ship this output.

Security tools greet the user with an ASCII banner chosen at random at start-up, then a bracketed block of module counts, and print reports as aligned plain-text tables. The Metasploit repository holds 41 banner files including a cowsay-style cow, a fake login dialog, film parodies, Halloween and April Fools sets chosen by date, and sets unlocked by environment variables. Nmap's report table and its joke leetspeak output mode are equally recognisable.

**What it looks like**

- A banner picked at random per run from a folder of text files, so the tool shows a different picture each time; files with a Halloween extension load on 31 October and a pony set on 1 April
- Banner genres: a speech-bubble animal (bubble of underscores and hyphens with angle-bracket ends, a two-backslash tail); a FIGlet wordmark; a shield silhouette filled almost entirely with one capital letter; a fake boxed logon dialog 80 columns wide with bracketed input fields and a bracketed OK button; film and game parodies
- A fixed stats block under the banner: a first line indented 7 spaces that opens =\[ with name and version, then lines opening '+ -- --=\[' listing counts, every closing bracket padded into one column
- Scan report lines: 'scan report for &lt;host&gt;', 'Host is up (latency)', 'Not shown: N closed ports'
- A left-aligned table headed PORT STATE SERVICE VERSION, ports written as number/protocol, columns separated by runs of spaces only
- Script results hanging under a table row in a gutter of pipe characters, the last line marked pipe-underscore
- A closing 'done' line with host counts and elapsed seconds
- Joke mode: the whole report rewritten in leetspeak with random capitals and digit or symbol swaps (3 for E, 0 for O, \$ for S, z for s)

**Palette.** Terminal default with sparse accents: the banner files carry inline tokens for red, blue, white and bold on a few words only. In a README code block it is monochrome.

**Lettering.** Monospace ASCII. Banner art ranges from line-drawn (slashes, underscores, backticks, commas, semicolons) to solid fills made by repeating one capital letter. The stats block relies on bracket alignment, not art.

**Motion.** static

**As a README header.** Entirely text. Above the fold: an original project banner (keep several in the repo and let the generator pick one per release, echoing the random-banner habit), then the stats block with the project's own counts in the aligned-bracket lines (for the factory project: items, recipes, buildings, phases), then a prompt line. Below it a 'scan report' of the project itself: the port table becomes SECTION / STATE / WHAT / VERSION, each row links to a README section, selected rows carry pipe-gutter detail lines, and a closing 'done' line carries build time.

**How to build it.** Plain ASCII, 80 columns or less. The aligned closing brackets are fixed-width padding (pad each line to the longest plus one). Rotation per release is a build-step choice, not runtime. Links inside the table need &lt;pre&gt; with &lt;a&gt;.

**Do not copy / caveats.** Do not copy Metasploit's banner art or use the Metasploit or Nmap names and exact report wording; write your own tool name and labels. Never show real host names or IP addresses: a README that looks like a scan of someone's machine is misleading and in poor taste. The technique (random banner, bracketed counts, port-style table, pipe gutter) is generic. Leetspeak mode is hard to read and should be at most an easter egg.

**References**

- [Metasploit banner.rb: random selection, date-based Halloween and April Fools sets, environment-variable overrides](<https://raw.githubusercontent.com/rapid7/metasploit-framework/master/lib/msf/ui/banner.rb>)
- [Metasploit data/logos listing: 41 banner files](<https://api.github.com/repos/rapid7/metasploit-framework/contents/data/logos>)
- [Banner file: cowsay-style cow](<https://raw.githubusercontent.com/rapid7/metasploit-framework/master/data/logos/cowsay.txt>)
- [Banner file: fake boxed logon dialog with colour tokens](<https://raw.githubusercontent.com/rapid7/metasploit-framework/master/data/logos/3kom-superhack.txt>)
- [Banner file: shield filled with a repeated capital letter](<https://raw.githubusercontent.com/rapid7/metasploit-framework/master/data/logos/metasploit-shield.txt>)
- [Metasploit core.rb: the padded '=\[' and '+ -- --=\[' stats lines](<https://raw.githubusercontent.com/rapid7/metasploit-framework/master/lib/msf/ui/console/command_dispatcher/core.rb>)
- [Nmap reference guide: the representative scan and its report layout](<https://nmap.org/book/man.html>)
- [Nmap book: the script-kiddie (-oS) joke output format](<https://nmap.org/book/output-formats-script-kiddie.html>)
- [Phrack 51 file 11 (1 Sep 1997): the article that introduced Nmap](<https://archives.phrack.org/issues/51/11.txt>)
- [Wikipedia: cowsay (Tony Monroe, 1999, Perl), eye modes, pairing with fortune](<https://en.wikipedia.org/wiki/Cowsay>)
- [Wikipedia: Metasploit dates](<https://en.wikipedia.org/wiki/Metasploit>)

---

<a name="hack-06"></a>

## hack-06 · Fetch card: ASCII logo left, key-value system info right, palette blocks

**Text + SVG** · build: **Easy** · impact: **2/5** · screenFetch 2010; neofetch first released 31 Dec 2015, repository archived 26 April 2024; successors such as fastfetch continue. Descends from login banners, motd files and boot-menu ASCII mascots.

The screenshot format of Unix desktop customisation culture: a command prints the distribution logo as ASCII art beside a list of system facts, ending with a strip of colour swatches. The neofetch README states that its purpose is to be used in screenshots. It is the most widely recognised present-day descendant of the login banner.

**What it looks like**

- A shell prompt with the command typed, then the card
- Left block: an ASCII logo roughly 18-20 rows by 35-40 columns, in one to three colours
- Right block, top: a user@host title, and under it an underline of hyphens exactly as long as the title
- Right block, body: one 'Key: value' per line in the fixed default order OS, Host, Kernel, Uptime, Packages, Shell, Resolution, DE, WM, WM Theme, Theme, Icons, Terminal, Terminal Font, CPU, GPU, Memory; keys in the logo's accent colour, colon as separator
- A blank line, then two rows of eight colour swatches (terminal colours 0-7 and 8-15), each swatch three cells wide and one row high
- Boot-menu ancestor: a mascot drawn in ASCII beside a numbered menu (the BSD daemon in the FreeBSD 5.x start-up menu)

**Palette.** The terminal's 16 ANSI colours: logo and keys in one accent hue, values in the default foreground, swatch strip showing all 16. Monochrome if delivered as a code block.

**Lettering.** Monospace. Logo art typically uses dense letter fills (o, s, y, h, d, m, N, M as a tone ramp) or slash-and-backtick outlines. Keys are title case followed by a colon and one space.

**Motion.** Static as text. As SVG: the command is typed at the prompt, the card rows appear top to bottom, the cursor blinks on the next prompt.

**As a README header.** Above the fold: a prompt line with an invented '&lt;project&gt;fetch' command, the project's own ASCII logo on the left, and on the right 'owner@repo', the hyphen underline and Key: value rows for Version, Language, License, Build, Tests, Size and Last commit, then the swatch strip. As a code block it is monochrome and the swatches become shaded block characters; as an SVG it keeps colour and can add the typed-command reveal. Values should be regenerated by CI so the card stays true.

**How to build it.** Text version: two column blocks joined line by line at a fixed offset. SVG version: one &lt;text&gt; per row with textLength set so the cell grid is independent of the viewer's font; swatches as &lt;rect&gt;, not block glyphs; typing effect via a clip rectangle whose width animates with steps(n).

**Do not copy / caveats.** Do not use distribution or vendor logos (trademarks and other people's art) and do not reuse the BSD daemon (copyright Marshall Kirk McKusick; commercial reproduction needs permission); draw a logo for the project. This layout is already a common README trope, so novelty is low. Stats go stale unless generated automatically.

**References**

- [neofetch repository: stated purpose, archived status](<https://github.com/dylanaraps/neofetch>)
- [neofetch script: default info order, hyphen underline, colon separator, colour blocks 0-15 at width 3](<https://raw.githubusercontent.com/dylanaraps/neofetch/master/neofetch>)
- [Wikipedia: Neofetch, first release date, fields, predecessor and successors](<https://en.wikipedia.org/wiki/Neofetch>)
- [Wikipedia: BSD Daemon, the ASCII version in the FreeBSD 5.x start-up menu and its copyright status](<https://en.wikipedia.org/wiki/BSD_Daemon>)

---

<a name="hack-07"></a>

## hack-07 · Full-screen TUI monitor: bracketed bar meters, process table, function-key bar, tmux status line

**Animated SVG** · build: **Easy** · impact: **3/5** · htop by Hisham Muhammad, first released May 2004, maintained by a team since 2020; tmux status line; the Vim start screen as a sibling. All current.

The screen every Unix user leaves running in a corner: rows of bracketed bar meters at the top, a sortable table below, a strip of function-key labels along the bottom, and under that the terminal multiplexer's status line. It is the closest thing this family has to a VU-meter display, and unlike the fetch card it is expected to move.

**What it looks like**

- Header, left column: one row per CPU core numbered from 0, each a bar meter of square brackets holding a run of pipe characters with a percentage right-aligned inside the closing bracket; then a Mem bar and a Swp bar with used/total text in the same position
- Bar fill characters come from the fixed set \| \# \* @ \$ % &amp; . so different load classes show as different glyphs in one bar
- Header, right column: three text meters for Tasks, Load average and Uptime
- A table header row in inverse video with columns PID, USER, PRI, NI, VIRT, RES, SHR, S, CPU%, MEM%, TIME+, Command; the selected row is a full-width highlight bar
- Optional tree view: the Command column gains branch lines drawn in box-drawing or ASCII characters
- Bottom row: ten function-key cells, each 'F&lt;n&gt;' followed by a label padded to six characters: Help, Setup, Search, Filter, Tree, SortBy, Nice -, Nice +, Kill, Quit
- Below it, the tmux status line: by default black on green, session name in square brackets at the left, then the window list as index:name with an asterisk on the current window and a hyphen on the previous one, and at the right a quoted title followed by time and date
- Sibling: the Vim start screen, an empty buffer with a column of tildes down the left edge and a centred block of name, version, author credit, licence line, a charity appeal and four 'type :command' hints

**Palette.** Black background with the 8 basic ANSI colours. The tmux default of a green bar with black text is confirmed from its source. htop's default scheme (commonly green header bar, cyan key labels, blue, green, red and yellow segments inside bars) is from general knowledge, not verified in this pass. Choose your own 5-colour set.

**Lettering.** Monospace, 80 or 120 columns. Numbers right-aligned in fixed-width columns; labels are short capitalised abbreviations. No art: the brackets and pipes are the picture.

**Motion.** Meter fills grow and shrink in whole-cell steps every second or two; percentages change with them; the highlight bar moves down a row now and then; the clock at the right of the status line ticks; one table row swaps place with its neighbour as it re-sorts.

**As a README header.** Above the fold: an SVG of a terminal, 100 columns by about 22 rows. The meters are re-labelled with project measures (for the factory project, one bar each for items, recipes, buildings and phases, filled to the share of the data set covered; or test coverage, docs coverage, build health). The table lists the project's modules or top-level directories with size, language and last-change columns, and the Command column holds each module's one-line purpose. The function-key row spells the README sections (F1 Install, F2 Usage and so on). The status line carries \[project\], a window list of branches or versions, and the release date. A text-only fallback is the same screen frozen in a code block.

**How to build it.** Every meter is a &lt;rect&gt; clipped to the bracket interior and animated with scaleX in steps equal to the cell count, so it jumps cell by cell like the real thing; percentages are stacked &lt;text&gt; frames toggled by opacity keyframes with steps(1). Rows use textLength to pin the grid. The clock is an odometer strip of digits translated in steps under a clipPath. Under 40 KB. Keep four to six meters moving on different periods (prime-number seconds) so the loop does not look mechanical.

**Do not copy / caveats.** Do not use the htop, tmux or Vim names or Vim's intro wording; bar meters, a key bar and a status line are generic TUI furniture. Fake 'live' numbers must not be passed off as real telemetry: label meters as project facts. htop's default colours are unverified here. Function-key labels in an image are not clickable, so repeat the links in markdown.

**References**

- [htop repository: purpose, author and dates](<https://github.com/htop-dev/htop>)
- [htop Meter.c: bar meter characters and the four meter modes (bar, text, graph, LED)](<https://raw.githubusercontent.com/htop-dev/htop/main/Meter.c>)
- [htop MainPanel.c: the ten function-bar labels](<https://raw.githubusercontent.com/htop-dev/htop/main/MainPanel.c>)
- [htop Settings.c: default header layout (CPUs, Memory, Swap left; Tasks, LoadAverage, Uptime right)](<https://raw.githubusercontent.com/htop-dev/htop/main/Settings.c>)
- [htop(1): function keys and column names](<https://man7.org/linux/man-pages/man1/htop.1.html>)
- [tmux options-table.c: default status-left, status-right and status-style](<https://raw.githubusercontent.com/tmux/tmux/master/options-table.c>)
- [tmux(1): the status line section](<https://man7.org/linux/man-pages/man1/tmux.1.html>)
- [Vim version.c: the lines of the intro screen](<https://raw.githubusercontent.com/vim/vim/master/src/version.c>)
- [Wikipedia: htop](<https://en.wikipedia.org/wiki/Htop>)

---

<a name="hack-08"></a>

## hack-08 · Roguelike dungeon screen (Rogue / NetHack terminal layout)

**Text + SVG** · build: **Easy** · impact: **4/5** · Rogue about 1980 on Unix (Michael Toy, Glenn Wichman, later Ken Arnold, built on Arnold's curses library); Hack 1982; NetHack first released 28 July 1987 and still maintained. Related text-mode looks: ZZT (Tim Sweeney, 1991, CP437 and 16 colours) and classic Dwarf Fortress (80x25 CP437 grid, 16 colours).

A game drawn entirely with letters and punctuation on an 80-column terminal: rooms, corridors, the player as an at-sign, monsters as letters and a terse status line. It named a whole genre and is one of the few text layouts a non-programmer may also recognise.

**What it looks like**

- A single message line at the top of the screen narrating the last event (NetHack terminal interface)
- Rooms as rectangles: hyphens for top and bottom walls, pipes for side walls, floor filled with full stops
- Doors set into the walls: a plus sign for a closed door, a hyphen or pipe for an open one, a full stop for an empty doorway; hash-mark corridors wandering between rooms
- The player as @. In Rogue the monsters are the 26 capital letters; NetHack adds lower-case letters, with a pet 'd' or 'f' beside the player
- Items as punctuation: \$ gold, ) weapon, \[ armour, ? scroll, ! potion, = ring, / wand, ( tool, % food, \* gem, + spellbook
- Features: &lt; stairs up, &gt; stairs down, { fountain, \_ altar
- Two status lines at the bottom. First: name and rank, then St: Dx: Co: In: Wi: Ch: and alignment. Second: Dlvl: \$: HP:current(max) Pw:current(max) AC: Xp: T: and status words
- Mostly empty black screen: only explored rooms are drawn, so the map floats in space. The CP437 variants add a smiley-face player glyph, box-drawing walls and coloured cell backgrounds (ZZT's player is a white smiley on navy blue, on a 60x25 board)

**Palette.** Classic: single terminal foreground on black. Colour mode: the 16 ANSI colours on black; letters coloured by creature type. Dwarf Fortress classic uses 8 base colours plus bright versions, as foreground and background.

**Lettering.** Monospace, 80x24. Pure 7-bit ASCII in the classic look; CP437 line-drawing and symbol glyphs in the DOS-era variants. Status lines use short capitalised labels with colons and no space before values.

**Motion.** Static as text. As SVG: the @ moves one cell at a time along a corridor into the next room, the message line changes as it arrives, one monster letter shuffles, the turn counter ticks.

**As a README header.** Above the fold: a message line carrying the tagline; a map about 72 columns by 16 rows in which each room is a part of the project, with item glyphs as room contents and a legend beneath mapping glyph to README section; and the two status lines re-labelled with project stats (for the factory project: depth as phase, gold as items, hit points as recipes out of buildings, turn counter as the build number). The text version goes in a code block; an SVG version adds colour and the walking @. Real navigation links sit directly under the header as markdown.

**How to build it.** Text version needs only ASCII; a small room-and-corridor layout routine (rooms on a 3x2 grid, L-shaped hash corridors between door cells) generates a different map per project from a seed. SVG: one &lt;text&gt; per row with textLength, or per-character x lists; the walking @ is one element with a translate animation using steps() so it jumps cell by cell, covering the floor dot beneath with a background rect; message swaps are opacity keyframes. Well under 50 KB.

**Do not copy / caveats.** Do not copy actual game levels, in-game message text or the game names; the glyph vocabulary and status-line idea are genre conventions shared by dozens of games. An ASCII map is opaque to screen readers, so give the image alt text and keep a normal link list beneath. Eighty columns overflow on phones; design for 72 if text-only. Rogue's own message and status placement was not confirmed from the sources opened (the layout above is NetHack's). ZZT's 20-column sidebar is inferred from the 60-column board width, not read from a primary page.

**References**

- [NetHack wiki: the two status lines and their field order](<https://nethackwiki.com/wiki/Status_line>)
- [NetHack wiki: default symbols for walls, doors, floor, corridors, stairs, fountain, altar](<https://nethackwiki.com/wiki/Dungeon_feature>)
- [NetHack wiki: item classes and their symbols](<https://nethackwiki.com/wiki/Item>)
- [Wikipedia: Rogue, its symbols, the curses library, the genre name](<https://en.wikipedia.org/wiki/Rogue_(video_game)>)
- [Wikipedia: NetHack lineage, DevTeam, interface](<https://en.wikipedia.org/wiki/NetHack>)
- [Dwarf Fortress wiki: 80x25 grid, 256-tile CP437 sheets](<https://dwarffortresswiki.org/index.php/Tileset_repository>)
- [Dwarf Fortress wiki: the 16-colour scheme](<https://dwarffortresswiki.org/index.php/Color>)
- [Wikipedia: ZZT, text-mode graphics and the smiley player](<https://en.wikipedia.org/wiki/ZZT>)
- [ZZT wiki: boards are a 60 by 25 grid](<https://wiki.zzt.org/wiki/Board>)

---

<a name="hack-09"></a>

## hack-09 · MUD session transcript (login banner, room block, exits line, HP prompt)

**Text** · build: **Easy** · impact: **2/5** · MUD1 at Essex from 1978 (Roy Trubshaw, then Richard Bartle); AberMUD 1987, TinyMUD and LPMud 1989, DikuMUD 1990-91 (University of Copenhagen); CircleMUD and tbaMUD descend from Diku and are still distributed.

A multi-user text world reached over telnet: the server prints a title banner, asks for a name, then describes rooms in prose while the player types short commands at a prompt showing hit points, mana and moves. It is the prose counterpart of the roguelike map and the ancestor of online role-playing games.

**What it looks like**

- Greeting screen: the game title in capitals letter-spaced by two spaces and centred, a letter-spaced year under it, two centred credit lines naming the code it derives from, then a name question flush left with the cursor waiting after it
- Login dialogue lines: a 'did I get that right' confirmation offering Y/N, a password request, and a '\*\*\* PRESS RETURN:' pause after the message of the day
- Room block: a short room title on its own line, a wrapped prose paragraph of three to six lines, then one line per object or character present
- Exits shown either as one compact bracketed line (open bracket, the word Exits, a colon, single-letter directions, close bracket; cyan in the tbaMUD source) or as an 'Obvious exits:' list with one direction per line
- The prompt: three numbers tagged H, M and V (hit points, mana, moves) followed by a greater-than sign, with the typed command after it
- Commands are one or two lower-case words (a direction or its initial, look, take &lt;thing&gt;); the transcript alternates prompt-and-command with response blocks separated by blank lines

**Palette.** Monochrome as text. ANSI-colour clients tint room titles, exits and prompt differently; only the cyan exits line was confirmed from source.

**Lettering.** Monospace, 80 columns, 7-bit ASCII, hard-wrapped prose. No art beyond the letter-spaced title; many MUDs add an ASCII logo to the greeting, but that varies per game.

**Motion.** static

**As a README header.** Entirely text. Above the fold: the greeting (letter-spaced project name, version as the 'year' line, a credits line), a name prompt answered with 'visitor', then the first room: title is the project name, the prose paragraph is the pitch, the object lines are key files ('A sturdy Makefile lies here.'), and the exits line lists README sections as directions, each an &lt;a&gt; link. The closing prompt shows three project numbers in the H / M / V slots. Later README sections can open with their own room block.

**How to build it.** Plain ASCII in &lt;pre&gt;, 72 columns; the generator needs only text wrapping and a template. Links in the exits line work inside &lt;pre&gt;.

**Do not copy / caveats.** Do not copy a specific MUD's greeting art, room text or name, and write your own prompts; the room / exits / prompt grammar is common to a whole family of servers. Reads as a wall of prose if the room description runs long: keep it to four lines. Low visual impact; charm depends on the writing.

**References**

- [tbaMUD greeting file: letter-spaced title, credits, name question](<https://raw.githubusercontent.com/tbamud/tbamud/master/lib/text/greetings>)
- [tbaMUD interpreter.c: login dialogue lines](<https://raw.githubusercontent.com/tbamud/tbamud/master/src/interpreter.c>)
- [tbaMUD comm.c: the H / M / V prompt construction](<https://raw.githubusercontent.com/tbamud/tbamud/master/src/comm.c>)
- [tbaMUD act.informative.c: bracketed exits line and 'Obvious exits' list](<https://raw.githubusercontent.com/tbamud/tbamud/master/src/act.informative.c>)
- [Wikipedia: Multi-user dungeon, history, room/objects/exits description, typed commands, codebase families](<https://en.wikipedia.org/wiki/Multi-user_dungeon>)
- [Wikipedia: DikuMUD, authors, dates, derivatives](<https://en.wikipedia.org/wiki/DikuMUD>)

---

<a name="hack-10"></a>

## hack-10 · DOS virus payload screen (falling letters, crawling sprite)

**Animated SVG** · build: **Medium** · impact: **4/5** · 1987 to about 1997, MS-DOS. Preserved in the Malware Museum on the Internet Archive (collection created 5 Feb 2016 by Jason Scott's account, credited in the press to Mikko Hypponen; 87 items; destructive routines removed).

Some DOS viruses announced themselves with a visual prank: the text on screen falling into a heap, a small vehicle driving across the screen, tiles of colour, or a full-screen graphics effect. They are remembered as tiny uninvited demos, and a museum exhibition has since shown them as graphic design. Only the visuals are of interest here.

**What it looks like**

- The starting point is an ordinary 80x25 DOS text screen: light grey on black, a prompt and a directory listing
- Cascade (first isolated 1987): characters drop out of their lines and pile into a heap along the bottom of the screen
- Ambulance (June 1990): a small text-mode ambulance drives across the screen (the sources do not say which row)
- Walker: a small walking figure crosses the screen
- Kuku: multi-coloured tiles slowly fill the screen while one word blinks
- Full-screen graphics payloads: a swirl of rainbow colour (LSD), a red-and-black 3D landscape of hills (Mars G, by Spanska), a blinking heart (Zhu), a beach scene with a sailboat (Marine), a crude Mandelbrot fractal (Tequila)
- Slogan payloads: a blocky pixel drawing with one line of upper-case text under it (Coffeeshop's leaf and slogan, 1992)
- Blocky, teletext-like look from text-mode cells and low-resolution VGA

**Palette.** DOS 16-colour text palette: light grey (\#AAAAAA) on black for the host screen; payloads in the bright attributes (red, yellow, cyan, magenta, white), and saturated VGA ramps for the graphics effects.

**Lettering.** IBM PC ROM text font, code page 437, 80x25 cells. No custom lettering: the point is that the machine's own text misbehaves.

**Motion.** Letter-fall: individual glyphs leave their row and descend row by row at a steady rate, staggered over many seconds, stacking on the bottom line. Sprite crawl: a small character-cell sprite moves horizontally in cell steps. Both are slow enough to read the screen first.

**As a README header.** Above the fold: an animated SVG of a DOS screen showing a prompt, a directory listing of the project's real files, and a block-letter project title. After a few seconds the ordinary characters begin to drop and heap up along the bottom row while the title letters stay put, so the fall works as a reveal; the screen then clears and the loop restarts. Alternative: the screen stays intact and a small original sprite carrying the version number crawls along one row. The README body is normal markdown, with a static text listing as fallback.

**How to build it.** Each falling character is its own &lt;text&gt; at an explicit cell position with a CSS keyframe translateY of N rows, steps(N) timing and a per-glyph animation-delay chosen at generation time; landing rows are precomputed per column so the heap stacks correctly. 150-300 falling glyphs stay under roughly 60 KB if they share three or four keyframe definitions by fall distance. One long shared duration with a hold at the end gives a clean loop. A reduced-motion rule should show the intact screen.

**Do not copy / caveats.** Visuals only: no code, no real virus names in the header, and no 'you are infected' wording that could alarm a visitor or make the repository look compromised; the header must read clearly as decoration. Do not copy specific sprites or messages (Hyperallergic reports the Walker figure comes from the game Bad Street Brawler). Avoid rapid colour-flash variants for photosensitivity reasons. The per-virus visuals rest on Wikipedia and press write-ups, not on viewing the emulations. The Ambulance row, the Walker direction and the Crash payload (shown only as an image in the press piece) are unconfirmed.

**References**

- [Wikipedia: Cascade virus, the falling-text payload](<https://en.wikipedia.org/wiki/Cascade_(computer_virus)>)
- [Wikipedia: Ambulance virus, the moving ambulance](<https://en.wikipedia.org/wiki/Ambulance_(computer_virus)>)
- [F-Secure description of Ambulance (moving ambulance, no position given)](<https://f-secure.com/v-descs/ambulanc.shtml>)
- [Internet Archive: The Malware Museum collection metadata (description, creation date)](<https://archive.org/metadata/malwaremuseum>)
- [Hyperallergic: LSD, Zhu, Walker, Marine, Techno and the teletext comparison](<https://hyperallergic.com/274139/a-museum-for-the-blocky-graphics-of-early-computer-viruses/>)
- [AIGA Eye on Design: LSD, Mars G, Coffeeshop and the Het Nieuwe Instituut exhibition framing](<https://eyeondesign.aiga.org/the-alluring-beauty-of-the-computer-virus/>)
- [Kaspersky blog: Cascade, Kuku, Tequila and other payload descriptions](<https://www.kaspersky.com/blog/8-all-time-scariest-looking-viruses/3049/>)

---

<a name="hack-11"></a>

## hack-11 · mIRC channel window with colour-code block art and netsplit

**Animated SVG** · build: **Medium** · impact: **4/5** · 1995 to the mid-2000s. mIRC was first released on 28 February 1995 by Khaled Mardam-Bey; IRC dates from August 1988. Wikipedia gives 6 million simultaneous users in 2001 and 10 million in 2004-05, with a steep decline after.

The Windows IRC client window in which a generation lived: a scrolling channel log, a nick list down the right side, the topic in the title bar, and bots pasting multi-line pictures made of coloured character cells. The text-art scene moved from BBSes to IRC between 1994 and 1997 by ACiD's own account, and the 0-15 colour codes are still called mIRC colours in the IRC documentation.

**What it looks like**

- A Windows 9x style window: title bar carrying channel name, user count, modes and topic; grey bevelled frame; a one-line input box at the bottom
- A narrow nick list on the right: operators prefixed @ at the top, voiced users prefixed +, then everyone else
- Chat lines as a nick in angle brackets followed by the message, optionally led by a bracketed timestamp
- Event lines beginning with an asterisk (joins, parts, quits, mode and topic changes), visually distinct from chat
- Netsplit: a sudden run of quit lines each showing two server names in parentheses, followed later by a matching run of joins
- Classic colour art: 13-35 consecutive lines, 37-54 cells wide, each line made almost wholly of spaces (or one repeated glyph) carrying foreground,background colour-code pairs, so every cell is a pixel; pasted by a bot one line at a time
- Line-art variant: ordinary ASCII strokes (\# : \_ \| = \\) with only a foreground colour per run
- Later IRC art uses Unicode block and shade glyphs and the extended 16-98 colour range, including whole ANSI packs converted to 80 columns

**Palette.** The 16 colours as published by mirc.com: 0 white 255,255,255; 1 black 0,0,0; 2 blue 0,0,127; 3 green 0,147,0; 4 light red 255,0,0; 5 brown 127,0,0; 6 purple 156,0,156; 7 orange 252,127,0; 8 yellow 255,255,0; 9 light green 0,252,0; 10 cyan 0,147,147; 11 light cyan 0,255,255; 12 light blue 0,0,252; 13 pink 255,0,255; 14 grey 127,127,127; 15 light grey 210,210,210. Window chrome: system grey with a dark blue title bar. A white text pane is the commonly remembered default but was not confirmed from a source.

**Lettering.** A fixed-pitch bitmap system font in the text pane, which is what makes cell art line up; nicks in angle brackets; channel names with a leading hash. Formatting toggles (bold, underline, reverse) apply per run.

**Motion.** Lines scroll in from the bottom one at a time. A bot pastes a colour picture line by line with a short pause between lines. A netsplit burst of quits, then rejoin. The topic in the title bar changes.

**As a README header.** Above the fold: an SVG of the client window. Title bar: '\#project \[N\] \[+nt\]: tagline'. In the log a bot pastes the project logo as colour-cell art, line by line; then a topic line; then a user types a trigger such as '!install' and the bot answers with the install command. The nick list shows project roles (maintainers with @, contributors with +). A brief netsplit gag can close the loop. Below the image, normal markdown; a plain log excerpt in a code block is the text fallback.

**How to build it.** Window chrome is a handful of rects with light and dark edge lines. Cell art is a grid of &lt;rect&gt; in the 16 colours, run-length merged per row, so it does not depend on fonts; a 50x20 logo is a few hundred rects. Log lines are &lt;text&gt; rows revealed by opacity keyframes with steps(1) while the log group translates up one row height per new line in steps; a clipPath hides overflow. Explicit x for the nick column. About 40-80 KB.

**Do not copy / caveats.** Do not use the mIRC name or icon or any Microsoft logo; draw generic window chrome. Do not use real people's nicknames without consent; use roles. mIRC's default event-line wording and default pane colours were not confirmed against a primary source, so compose your own. The public IRC art archives contain a great deal of offensive material: they are a structural reference only, and nothing should be copied from them. Keep chat text at readable contrast.

**References**

- [mIRC colour codes: the 16 indices with names and RGB values, the foreground,background syntax](<https://www.mirc.com/colors.html>)
- [Modern IRC docs: formatting control characters, the 0-15 table, extended 16-98 colours](<https://modern.ircdocs.horse/formatting.html>)
- [ircart archive (GitLab mirror): primary IRC art files, inspected for line counts, widths and colour-code structure](<https://gitlab.com/ircart/ircart>)
- [Wikipedia: Netsplit, the quit lines with two server names](<https://en.wikipedia.org/wiki/Netsplit>)
- [Wikipedia: mIRC, author, release date, scripting](<https://en.wikipedia.org/wiki/MIRC>)
- [Wikipedia: IRC, origin, @ and + prefixes, usage figures](<https://en.wikipedia.org/wiki/Internet_Relay_Chat>)
- [ACiD artpacks introduction (1997-99): the art scene's move to the internet and the IRC channels artists used](<https://archive.scene.org/mirrors/artpacks/www/html/intro.html>)

---

<a name="hack-12"></a>

## hack-12 · PC diskmag reader (three-band screen, two-column articles, charts, tune player)

**Animated SVG** · build: **Medium** · impact: **3/5** · 1992 to the 2010s on PC. Imphobia: 12 issues, February 1992 to July 1996, MS-DOS. Hugi: from May 1996, 38 main issues to June 2014 (a 2026 anniversary special is listed on Demozoo), Windows executable from September 1998, Panorama engine by Chris Dragan from issue 18 (December 1999). Earlier roots on C64 and Amiga (Sex'n'Crime, R.A.W.).

A diskmag is a magazine shipped as a program: custom interface, painted graphics, background music, and menus of articles, charts and party reports. It is the demoscene's journalism, and its reader interface is a genre of its own, distinct from both the text zine and the BBS. Every issue shipped with several tracker modules, which gives a natural place for a visual 'now playing' element.

**What it looks like**

- Screen split into three horizontal bands: the magazine logo across the top, the reading area in the centre, a strip of background artwork along the bottom (the Imphobia interface from issue 6, at 640x480 in what the historian calls probably 16 colours)
- Article text in two columns of 38 characters each, paged sideways with the cursor keys by a smooth horizontal scroll
- A main menu of categories (editorial, charts, articles, adverts, party invitations) leading to an article-selection menu
- Charts pages: ranked lists voted by readers, in categories such as demo groups, coders, musicians, graphicians, demos and intros
- A box at the bottom of the viewer showing the author, article title and a small country flag (Imphobia issue 5)
- A built-in module player with three or four tunes per issue
- Mouse pointer plus keyboard navigation
- Panorama-engine layout (Showtime 18, 2008): a row of utility buttons across the top (print, music, search, help), a two-column article menu in the centre, section buttons along the bottom (charts, gallery, menu, quit), over full-screen painted background art

**Palette.** Hand-pixelled VGA: a dark background, a painted and dithered logo, light body text with a few accent colours for headings and highlighted words (Imphobia's viewer had coloured text in issue 5 and used it sparingly again from issue 9). Exact palettes vary per issue and were not verified from screenshots; choose an original 16-colour ramp.

**Lettering.** Custom bitmap fonts drawn for the mag (the first Imphobia font was called hardly readable and was replaced in issue 4); a pixel-painted logo in demoscene lettering; fixed column widths. A Hugi reviewer criticised fixed-width Courier in articles as looking strange, so a proportional or custom pixel face is the authentic choice.

**Motion.** Mostly still pages. In a README: a slow alternation between the menu page and one article page with a sideways slide, a small animated level meter beside the tune name, and a blinking page indicator.

**As a README header.** Above the fold: a 4:3 SVG. Top band: the project wordmark as a pixel logo with an issue number (the version). Centre band: left column is the menu of README sections, right column is either the editorial blurb or a 'charts' list of the project's top facts. Bottom band: a strip of original pixel art plus a status line with a tune name, an animated level meter and 'page 1/N'. Regions of an &lt;img&gt; SVG cannot be clicked, so the real table of contents is repeated as markdown under the image.

**How to build it.** Layout is rects and text; the cost is artwork. The pixel logo can be generated from a built-in bitmap font with a vertical dithered gradient and a one-pixel outline, emitted as merged &lt;rect&gt; runs with shape-rendering crispEdges; the bottom strip can be a generated dithered skyline or a small embedded PNG data URI (a 640-wide 16-colour strip is a few KB). Body text as &lt;symbol&gt; pixel glyphs, or a generic sans-serif. Page alternation is two groups moved with translateX; the level meter is four rects animated with scaleY and steps().

**Do not copy / caveats.** Do not copy the logos, graphics or names of Imphobia, Hugi, Showtime or any other mag; the three-band layout, two-column text, charts and tune player are generic. Descriptions come from written histories and reviews, not from viewing screenshots, so colours are stated only as far as those texts go. No sound is possible, so the player is purely a visual cue. Impact depends heavily on the quality of the pixel art; with weak art this reads as a plain dark panel.

**References**

- [Hugi 13: History of Imphobia by Adok, issue-by-issue interface description](<https://hugi.scene.org/online/hugi13/dmimphb1.htm>)
- [Pouet: Imphobia \#1 (February 1992, MS-DOS) with comments on the interface](<https://www.pouet.net/prod.php?which=8872>)
- [Demozoo: Hugi group page, issue list and platforms](<https://demozoo.org/groups/13716/>)
- [Wikipedia: Hugi, editor, engine, resolution and music format changes](<https://en.wikipedia.org/wiki/Hugi>)
- [Hugi 36 review of Showtime \#18: Panorama engine, three-area screen, utility buttons, two-column menu, chart categories, font criticism](<https://www.hugi.scene.org/online/hugi36/hugi%2036%20-%20international%20diskmags%20adok%20showtime.htm>)
- [Rhizome (Markku Reunanen, 2010): Diskmags, underground journalism of the demoscene](<https://old.rhizome.org/editorial/2010/may/20/diskmags-underground-journalism-of-the-demoscene>)
- [Wikipedia: Disk magazine, definition and named mags](<https://en.wikipedia.org/wiki/Disk_magazine>)

---

<a name="hack-13"></a>

## hack-13 · War-room big board: vector world map, tracks and counters

**Animated SVG** · build: **Medium** · impact: **5/5** · 1983, the film WarGames (director John Badham); its ancestor is the back-lit big board of Dr. Strangelove (1964).

The wall of giant map displays in a fictional command centre, showing coastlines as thin vector lines with tracks arcing across them. The graphics were made by Colin Cantwell on four Hewlett-Packard 9845C desktop computers driving a monochrome vector display, filmed frame by frame through colour filters (about half a million frames) and projected from behind onto 12 screens during shooting. It is the best-known 'big screen in a dark room' image in hacker cinema.

**What it looks like**

- Thin-stroke vector coastlines on black: world, polar, North America and regional maps
- Twelve screens on one wall in the film; a README needs three side by side, each showing a different projection or region
- Tracks drawn as arcs growing from an origin to a destination, with a blip where they land
- Large numeric counters that climb quickly
- Lettering drawn with single strokes like the map itself, all capitals, wide spacing
- Each element in one flat saturated colour with a soft glow, a consequence of filming a monochrome vector display through colour filters
- A separate monochrome monitor showing an upper-case typed dialogue with the machine
- A vector noughts-and-crosses grid that plays itself to a draw over and over (from the film's ending)

**Palette.** Black background with pure saturated line colours and a soft glow. The sources describe the colour-filter process but not which hue was used for which element, so exact colours are unconfirmed. Working values (mine): coastlines \#3FA9FF, tracks \#FF4040, text and counters \#FFFFFF, secondary \#FFD23F.

**Lettering.** Single-stroke vector capitals with wide spacing, no filled shapes; numerals in the same stroke style. Hershey-style stroke fonts reproduce this construction.

**Motion.** Coastlines draw on stroke by stroke; arcs sweep from origin to destination; a blip pulses at the end of each arc; counters tick up; the screen blanks and the cycle restarts.

**As a README header.** Above the fold: a wide SVG of three adjacent screens. Centre: a world map in thin strokes with arcs running from one origin to several destinations, re-themed as deployments, downloads or supply routes. Left and right: a regional map and a stats panel with stroke-font counters (for the factory project: items, recipes, buildings, phases). The project name sits in stroke capitals in a caption strip. Everything else is markdown below.

**How to build it.** Coastlines from public-domain Natural Earth 110m data decimated to a few thousand points (about 20-30 KB of path data). Draw-on and arc sweeps use pathLength=1 with stroke-dasharray and an animated stroke-dashoffset; blips are circles with scale and opacity keyframes; glow is one feGaussianBlur merged under the sharp strokes, applied to a group (keep the filter region small for performance); counters are vertical digit strips moved in steps() under a clipPath. Stroke lettering is polylines from a public-domain stroke font, so no font dependency. About 60-90 KB.

**Do not copy / caveats.** Do not use the film's names, insignia, alert-level signage or dialogue. Taste risk: the source imagery is nuclear war, so theme the arcs as something benign and avoid casualty-style counters. Exact colours are unconfirmed. Sources disagree on production details: HP 1345A (Wikipedia) versus 1347A generator with 1336A display (hp9845.net); seven versus ten months; 16 mm projection (Wikipedia) versus a 35 mm camera (hp9845.net). The generic technique, vector maps with animated arcs, is free to use.

**References**

- [Wikipedia: WarGames, production of the display screens (HP 9845C, vector display, colour filters, rear projection)](<https://en.wikipedia.org/wiki/WarGames>)
- [hp9845.net: the WarGames screen art, map types, colour separation, 12 screens, four computers, half a million frames](<https://www.hp9845.net/9845/software/screenart/wargames/>)
- [CIO: the technology of WarGames (12 wall displays, half a million frames, 10 months)](<https://www.cio.com/article/3404461/the-technology-of-wargames.html>)
- [GlobalSecurity: the big board in Dr. Strangelove and WarGames](<https://www.globalsecurity.org/wmd/systems/big-board.htm>)
- [Wikipedia: Colin Cantwell, his graphics for the film and the 1984 BAFTA nomination](<https://en.wikipedia.org/wiki/Colin_Cantwell>)

---

<a name="hack-14"></a>

## hack-14 · Digital rain banner (light falling through fixed glyph columns, resolving into the title)

**Animated SVG** · build: **Medium** · impact: **4/5** · 1999, the film The Matrix, glyphs designed by Simon Whiteley; precursors named by Wikipedia are the Ghost in the Shell (1995) credits and the 1990 Hungarian film Meteo; imitated since in screensavers and the terminal program cmatrix (Chris Allegretta).

Columns of green glyphs appearing to stream down a black screen, each column led by a bright character and trailing off into darkness. It is the single most recognised 'hacker screen' image in popular culture. Unlike the existing phosphor-terminal style it has no prompt, no frame and no readable text: it is pure texture that occasionally condenses into a word.

**What it looks like**

- A fixed grid of glyphs on black; the glyphs do not move, and the 'raindrops' are waves of illumination travelling down each column
- Each column independent in speed, length and start time
- Glyph set: mirror-image half-width katakana mixed with Latin letters and numerals
- A bright, nearly white leading glyph at the bottom of each wave, the tail fading from bright green to dark green to nothing
- Individual glyphs change to a different character now and then while lit
- Dense coverage: neighbouring columns overlap in time so the whole field shimmers
- README-specific: the rain thinning in the centre to leave the title legible in locked bright glyphs

**Palette.** Black background; phosphor green fading to very dark green; white-green heads. Working values (mine, not from a source): head \#D8FFD8, body \#33FF66, tail \#0B3D17.

**Lettering.** A custom face of mirrored half-width kana, digits and a few Latin letters. For a README use an original glyph set: about 40 freshly drawn angular symbols, or half-width katakana (Unicode FF66-FF9D) and digits flipped horizontally and converted to paths.

**Motion.** Continuous downward sweep of brightness in every column at different speeds, occasional glyph swaps, and a periodic moment when the centre columns lock into the project name before dissolving again.

**As a README header.** Above the fold: a wide, short banner (about 1200x300). Rain across the full width; in the centre, columns stop on fixed bright glyphs that spell the project name while the rain continues behind at lower brightness; a one-line tagline fades in beneath. No frame and no prompt, to keep it distinct from the existing CRT terminal style. Body text is markdown below.

**How to build it.** Keep glyphs static and animate light by occlusion, which avoids animated masks (unreliable in some browsers): draw each column once in bright green, then lay over it a column-wide black &lt;rect&gt; filled with a vertical gradient that has a transparent window (clear at the head, fading to opaque black behind it), and translate that rect downward on an infinite linear loop with its own duration and delay. 50 columns means 50 animated rects. The white head is a second small rect or glyph riding the same transform. Glyph swaps: a second glyph layer toggled with steps(1) opacity. Convert about 40 glyphs to &lt;symbol&gt; paths (roughly 15 KB) because katakana coverage depends on the viewer's fonts. Title lock is a separate layer with an opacity keyframe. Reduced-motion rule freezes the field with the title lit.

**Do not copy / caveats.** Do not use the film's title, logo or actual typeface; build your own glyph set. The effect has been imitated openly for 25 years. The designer's 'sushi recipes' origin story is reported by Wikipedia as debunked. Cliche risk is high, and green on black overlaps with the existing terminal style, so it needs the title-lock idea or a different hue (amber, ice blue) to earn its place. Constant motion at the top of a page can be tiring; slow it well below film speed.

**References**

- [Wikipedia: Matrix digital rain, designer, glyph composition, precursors, the debunked origin story, later imitations](<https://en.wikipedia.org/wiki/Matrix_digital_rain>)
- [Rezmason/matrix README: analysis showing the glyphs sit in a fixed grid and only the illumination moves](<https://github.com/Rezmason/matrix>)
- [cmatrix repository: the terminal imitation and its options](<https://github.com/abishekvashok/cmatrix>)
- [Metasploit banner that parodies the film's opening terminal text, showing the reference in tool culture](<https://raw.githubusercontent.com/rapid7/metasploit-framework/master/data/logos/wake-up-neo.txt>)

---

<a name="hack-15"></a>

## hack-15 · Decrypt reveal: a scrambled text block that resolves into plaintext

**Animated SVG** · build: **Medium** · impact: **4/5** · 1992, the film Sneakers (director Phil Alden Robinson); recreated as the open-source terminal tool no-more-secrets and endlessly borrowed by later film and game interfaces.

A screen of unreadable characters that turns, cell by cell in random order, into the real text. The film uses it as the moment a codebreaking device works, and it has become shorthand for 'decryption in progress'. It is a transition, so it can sit on top of any other text style in this family.

**What it looks like**

- The whole text block first appears fully scrambled: every non-space cell shows a random symbol, but word shapes and line lengths already match the final text
- A pause (in the recreation, until a key is pressed), then the reveal begins
- Cells resolve independently and in random order: each flickers through a few more random glyphs, then snaps to its true character
- Revealed characters take the highlight colour; unrevealed ones stay in the dim base colour, so the message surfaces as scattered bright letters that fill in
- Spaces may be masked too, so the block starts as a solid rectangle of noise
- The final frame is an ordinary, fully readable screen that holds

**Palette.** Dark background; scrambled cells in a dim grey-blue, revealed text in a bright accent. The recreation's default reveal colour is blue. Working values (mine): background \#0A0E14, scramble \#4A5568, reveal \#6CB6FF.

**Lettering.** Monospace cells. The scramble alphabet is punctuation, digits and box or accented characters; keeping it to 7-bit punctuation and digits avoids font-fallback width problems.

**Motion.** About one second of full scramble, then a 3-4 second reveal with per-cell random delays, then a long hold on the readable text before the loop restarts (or no loop at all).

**As a README header.** Above the fold: an SVG panel holding the project's title block (name, tagline, three facts, install command), which arrives scrambled and decrypts into place, then holds for at least 20 seconds. It can wrap any of the text styles above (zine header, RFC page, tool console) as their entrance animation. The same text is repeated as real markdown or a code block beneath, because text inside an image cannot be selected or read by screen readers.

**How to build it.** Two stacked layers per cell: a scramble glyph and the true glyph, each a &lt;tspan&gt; or &lt;text&gt; at explicit x. A shared pair of keyframes (scramble: opacity 1 to 0; truth: 0 to 1, both steps(1)) with a per-cell animation-delay assigned at build time gives the random order. For flicker, give the scramble layer two or three alternating glyph frames. A 72x8 block is about 600 cells, 1,200-1,800 small elements, roughly 60-90 KB; group cells into 12-16 delay buckets and emit one &lt;text&gt; per bucket per row with x lists to halve that. Set animation-iteration-count to 1 with fill-mode forwards so the page settles.

**Do not copy / caveats.** Do not quote the film or use its title or prop names. The scramble-to-plaintext effect itself is generic. It must end on a stable readable frame: a looping scramble at the top of a page is hostile to readers. Provide the reduced-motion rule that shows the final text immediately. Wikipedia's article on the film does not describe the screen effect; the description rests on the recreation project's account.

**References**

- [no-more-secrets: open-source recreation of the effect, its options and the companion 'sneakers' demo](<https://github.com/bartobri/no-more-secrets>)
- [Wikipedia: Sneakers (1992), the codebreaker device and the anagram plot point](<https://en.wikipedia.org/wiki/Sneakers_(1992_film)>)

---

<a name="hack-16"></a>

## hack-16 · 3D file-system landscape (pedestals and wires, or the glass-tower data city)

**Animated SVG** · build: **Medium** · impact: **5/5** · Early 1990s. SGI's experimental fsn for IRIX 4.0.1 and later, seen in Jurassic Park (1993); the 'City of Text' in Hackers (1995, director Iain Softley); fsv, an open-source clone by Daniel Richard G., version 0.9 in September 1999.

A file system drawn as a place you fly through. In SGI's fsn, directories are pedestals joined by wires and files are boxes standing on them; in Hackers, data is a city of identical glass towers covered in file names. Both are remembered as the moment cinema decided what 'inside the computer' looks like, and the first was a real program.

**What it looks like**

- fsn: each directory is a pedestal on a ground plane, its height proportional to the total size of the files inside
- fsn: each file is a box standing on its directory's pedestal; box height shows file size and box colour shows file age
- fsn: directories are connected by wires along which the viewpoint travels
- Hackers: a grid of identical rectangular towers of blue-tinted glass, every visible face carrying a list of white text (file and directory names)
- Hackers: the towers are transparent, so the reversed text on the far faces shows through and clutters the view
- Hackers: a ground plane like a printed circuit board with purple traces, white pulses running along the traces and between towers
- Hackers: highlight bars moving up and down the text lists on some faces, and towers turning red when under attack
- A flying, banking camera in both

**Palette.** Hackers: translucent blue towers, white text, purple ground traces, red for alerts, on black. fsn: box colour encodes file age; the actual hues are not given in the sources opened. Working values (mine): glass \#2A6FDB at 35% opacity, traces \#8A4FFF, text \#FFFFFF, alert \#FF3B30.

**Lettering.** Small white lists of names running down tower faces (Hackers); short directory and file labels (fsn). Text is texture more than reading matter.

**Motion.** White pulses travel along the wires or traces; highlight bars scan up and down the lists on some faces; a very slow drift of the viewpoint; an occasional face flashes to the alert colour and back.

**As a README header.** Above the fold: an SVG generated from the repository's real tree. Each top-level directory is a pedestal or tower; files are boxes sized by byte count and coloured by age of last commit; wires join parent to child; the root pedestal carries the project name in large flat lettering; a small legend explains height and colour. Pulses run along the wires and a highlight bar scans the largest tower. Below the image: a normal markdown directory guide. This is the one style in the family where the picture is also real information about the repo.

**How to build it.** Project the scene at build time with a fixed isometric projection; each box is three polygons (top and two sides) in three shades, emitted back to front by grid row so no depth sorting is needed at view time. Tower text is ordinary &lt;text&gt; with a skew matrix to sit on a face, at partial opacity for the glass look. Pulses are short dashes moved with an animated stroke-dashoffset along the wire paths; scanning bars are rects translated in steps(). A slow drift is a CSS translate and scale on the scene group. No true fly-through is possible without scripts. Cap at about 300 boxes (aggregate small files into one 'other' box per directory) to stay under 250 KB.

**Do not copy / caveats.** Do not use the SGI, IRIX or fsn names, film stills or film dialogue; the landscape and tower-city visualisations are generic techniques (fsv is an independent clone). fsn's colours are unconfirmed. Skewed small text will not be legible; treat it as texture and keep key labels flat and large. Large repositories need aggregation or the image becomes noise. It reveals repository structure and file ages, which is fine for public repos but should be a deliberate choice.

**References**

- [Archived SGI page for fsn: pedestals, file boxes, colour for age, wires, the film mention, prototype status](<https://archive.irixnet.org/siliconsurf/free/cool_sw_01.html>)
- [Wikipedia: File System Visualizer (fsv), the fsn clone, its MapV and TreeV modes, the film appearance](<https://en.wikipedia.org/wiki/File_System_Visualizer>)
- [Sci-fi Interfaces: Hackers (1995), detailed description of the City of Text and its animation](<https://scifiinterfaces.com/?p=23957>)
- [Wikipedia: Hackers (film), the director's choice of models, motion control and rotoscoping over CGI](<https://en.wikipedia.org/wiki/Hackers_(film)>)

---

<a name="hack-17"></a>

## hack-17 · Phreak tone pad: 4x4 keypad matrix with dual-tone scope traces

**Animated SVG** · build: **Easy** · impact: **3/5** · Touch-Tone dialling introduced 18 November 1963 (Bell System). Blue boxes from the 1960s to the early 1980s, made famous by Ron Rosenbaum's Esquire article of October 1971; obsolete once signalling moved out of band. The magazine 2600 (from January 1984) takes its name from the 2600 Hz tone.

Phone phreaking was the hacker culture of sound: the network was controlled by audible tones, and a hand-built box with a keypad could play them. The keypad's frequency grid is a published standard and a handsome diagram in its own right. In a medium with no audio it is the most honest way this family can show sound: two sine waves summing on a scope each time a key lights.

**What it looks like**

- A 4x4 keypad: rows 1 2 3 A, 4 5 6 B, 7 8 9 C, \* 0 \# D
- Row labels down the left edge, 697, 770, 852 and 941 Hz; column labels across the top, 1209, 1336, 1477 and 1633 Hz
- When a key is pressed, its whole row and whole column light, meeting at the key: the dual-tone idea made visible
- A small oscilloscope panel beside the pad: two thin sine traces of different pitch and, under them, their sum as a beating waveform
- A one-line digit readout that fills left to right as keys fire, like a dialled number
- Hardware framing: a small hand-held box with 13 pushbuttons and a speaker grille (Wikipedia's description of a typical blue box), one button set apart for the 2600 Hz tone
- Text-file companion: an all-capitals BBS bulletin with a pager-hint header and a box-plan style title

**Palette.** Working values (mine): box body in the blue that gave the device its name (\#2B5FB3) or black panel; keys off-white \#E8E4D8 with dark legends; lit row and column amber \#FFB000; scope traces phosphor green \#39FF88 on \#06140C.

**Lettering.** Keypad legends in a plain bold sans-serif or pixel capitals; frequency labels and readout in monospace digits; bulletin text in upper-case monospace.

**Motion.** Keys fire in sequence, about two per second: row and column bars flash, the key cap depresses by a pixel, the two sine traces switch frequency, the summed trace changes its beat pattern, and one more digit appears in the readout. After the sequence the readout clears and the loop restarts.

**As a README header.** Above the fold: an SVG with the keypad at the left, the scope panel at the right and the project name on a label strip across the box. The key sequence 'dials' the version number or a short numeric motto, and the readout shows it. Under the image, the README proper; an optional all-capitals bulletin header in a code block (title, 'FROM THE &lt;PROJECT&gt; FILES', date) gives a text-only fallback.

**How to build it.** Sixteen key rects plus eight row and column bars, each lit by opacity keyframes with steps(1) on a shared timeline. Scope traces: precompute one polyline per distinct tone pair used in the sequence (at most 10-16) and cross-switch them with opacity keyframes; the sum trace is computed at build time from the two real frequencies, so it is accurate. Readout digits appear via per-digit opacity delays. Under 40 KB.

**Do not copy / caveats.** Depict the pad and the published frequency table only: no box construction details, no signalling sequences for seizing trunks, and no framing as a working device. The original box-plan files are toll-fraud instructions: borrow their layout, never their content. Do not use telephone-company logos or the Touch-Tone name as branding, or the 2600 magazine name or masthead. The DTMF table is an open standard (ITU-T Q.23). Niche recognition outside telecom and hacker-history readers.

**References**

- [Wikipedia: DTMF signalling, the frequency matrix, keys A-D, Touch-Tone dates](<https://en.wikipedia.org/wiki/DTMF_signaling>)
- [Wikipedia: Blue box, the 2600 Hz tone, MF frequencies, the 1971 Esquire article, typical hardware, obsolescence](<https://en.wikipedia.org/wiki/Blue_box>)
- [Wikipedia: 2600: The Hacker Quarterly, founding and origin of the name](<https://en.wikipedia.org/wiki/2600:_The_Hacker_Quarterly>)
- [OSUNY BBS bulletin: the all-capitals text-file format with pager-hint header (layout only)](<http://www.textfiles.com/phreak/bluebox.txt>)
- [textfiles.com phreak directory: how such files were named and described](<http://www.textfiles.com/phreak/>)

---

<a name="hack-18"></a>

## hack-18 · CTF challenge board and scoreboard (category tiles, top-ten score graph, rank table)

**Animated SVG** · build: **Easy** · impact: **3/5** · The first major security CTF ran at DEF CON in 1996. Jeopardy-style boards became the common format in the 2000s-2010s. CTFd is the widely used open-source platform whose default layout is described here.

A capture-the-flag contest shows its state on two screens: a board of challenges grouped by category with a point value on each tile, and a scoreboard with a line graph of the leading teams' scores over time above a ranked table. Anyone who has played recognises the pair at once, and both are plain data displays that a project can fill with its own facts.

**What it looks like**

- Challenge board: a category heading (for example Web, Crypto, Forensics, Binary, Reversing) followed by a row of equal-sized dark tiles
- Each tile shows a challenge name and a point value; harder challenges carry more points
- Solved tiles switch to a distinct solved state (the CTFd template adds a solved class to the button), so the board fills in over the contest
- Scoreboard top: a line graph of score against time comparing the top 10 teams, one coloured line each, with lines that only ever rise, in steps
- Scoreboard bottom: a table with three columns, Place, Team (or User) and Score, rows in rank order
- Ties resolved by who reached the score first
- A freeze: near the end the public scoreboard stops updating while play continues
- Attack-defence variant: a grid of teams against services, each cell a status light, with separate attack and defence point columns

**Palette.** Theme-dependent; the stock CTFd theme uses dark tile buttons on a light or dark Bootstrap page, and its solved colour was not verified. Working values (mine): page \#0D1117, tiles \#21262D with \#C9D1D9 text, solved \#2EA043, graph lines from a 10-colour categorical set, freeze banner \#D29922.

**Lettering.** Plain UI sans-serif for tile names and table; tabular numerals for scores; category headings as medium-weight headers. No ASCII art: this is the one web-native layout in the family.

**Motion.** Tiles flip to the solved state one at a time; each solve makes one graph line step up and the table re-rank (two rows swap); a 'scoreboard frozen' banner appears near the end; then the loop resets.

**As a README header.** Above the fold: an SVG in two halves. Left: the board, where categories are the project's areas (Install, Usage, API, Internals, Contributing) and each tile is a feature or roadmap item with a point value for its size; shipped items show as solved, so the board doubles as a roadmap. Right: the score graph re-themed as a real time series from the repo (commits, tests passing, or data-set coverage per release, one line per module) above a three-column table of the top modules or contributors by role. For the factory project the tiles could be the five phases with their item counts. Real links follow in markdown.

**How to build it.** Tiles are rounded rects with two text lines; solved state is a second rect faded in by opacity keyframes with staggered delays. Graph lines are step polylines drawn on with pathLength=1 and stroke-dashoffset. Table re-ranking is two rows exchanging translateY in one keyframe. No fonts are critical: generic sans-serif with text-anchor for alignment. Under 40 KB. A static version with no animation loses little.

**Do not copy / caveats.** Do not use the CTFd name or logo, DEF CON or CTFtime branding, or real team names and scores; the board-plus-graph layout is generic. Do not present invented rankings of real people: use modules, releases or roles. It looks like an ordinary web dashboard, so the retro flavour is weak compared with the rest of the family. The stock theme's colours were not verified. If it shows a roadmap, keep it generated from real data or it goes stale.

**References**

- [CTFd repository: feature list (scoreboard with tie resolution, score freezing, score graphs comparing the top 10 teams)](<https://github.com/CTFd/CTFd>)
- [CTFd core theme, challenges template: category headers and challenge buttons with a solved class](<https://raw.githubusercontent.com/CTFd/CTFd/master/CTFd/themes/core/templates/challenges.html>)
- [CTFd core theme, scoreboard template: score graph above a Place / Team / Score table](<https://raw.githubusercontent.com/CTFd/CTFd/master/CTFd/themes/core/templates/scoreboard.html>)
- [CTFd docs: scoring overview, tie-breaking and freeze](<https://docs.ctfd.io/docs/scoring/overview>)
- [CTFtime: definitions of Jeopardy and attack-defence formats](<https://ctftime.org/ctf-wtf/>)
- [Wikipedia: Capture the flag (cybersecurity), formats, categories, DEF CON 1996](<https://en.wikipedia.org/wiki/Capture_the_flag_(cybersecurity)>)

---

## Considered and left out

- Alien (1979) Nostromo computer screen: not developed. The on-screen face is identified by Typeset in the Future as an optically stretched version of the commercial typeface City Light, which cannot be embedded; the look leans on franchise marks; screen colours are unconfirmed; and as text on a CRT it sits too close to the existing phosphor-terminal style. Source: typesetinthefuture.com/2014/12/01/alien/.
- Fallout RobCo terminal and its hex-dump password screen: not developed. No reachable source documents the layout (fallout.fandom.com returns 402, the BreezeWiki mirror blocks fetchers, fallout.wiki's Terminal and Hacking pages give mechanics only, and one specific game page is a 404). It is green phosphor text, which restates existing style 5, and the header strings are trademarked game text.
- Zero Wing intro behind the 'all your base' meme: not a layout. Its appeal is quoting the translated lines and showing Toaplan and Sega artwork, neither of which may be copied.
- 2600: The Hacker Quarterly as a style: it is a print magazine, and the only source opened gives no cover or page conventions to draw from. Its subject matter is covered by the phreak tone-pad style.
- Mr. Robot title card: only the episode-title convention is sourced (season 1 titles are written as file names with video-container extensions, season 2 with encryption-related extensions, season 4 as HTTP 4xx status lines; en.wikipedia.org/wiki/List\_of\_Mr.\_Robot\_episodes). The logo and title-card design are not described in any source opened. Too thin for a style; the file-name convention can be used as a heading treatment inside any text style.
- Leetspeak as a standalone style: it is a spelling treatment, not a layout. It appears inside the t-file style (titles) and the tool-console style (the joke output mode).
- The fetch card's 'sibling screens' entry (htop, tmux, Vim in one bullet): removed from the fetch card and rebuilt as the separate TUI monitor style, because the layouts and the motion are different.
- No original style was dropped as a duplicate of the six existing ones. Digital rain comes closest (green on black) and is kept only with the title-lock treatment and no prompt or frame.
