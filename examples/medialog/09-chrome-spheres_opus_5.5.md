<p align="center">
  <img src="assets/09-chrome-spheres_opus_5.5.svg" width="100%" alt="A demoscene-style banner for MediaLog: chrome spheres over a checkerboard. At sunset, MEDIALOG floats in the sky as a thick italic steel-blue chrome logo beside a chrome open book with a play triangle on one page and a pen on the other. Small type above it says A MEDIA DIARY YOU SHARE. Under it a line reads EVERYTHING YOU'VE, then a turning hexagonal chrome drum, then ON ONE TIMELINE; the drum shows WATCHED, READ, PLAYED or LISTENED TO, each face in a kind's colour. Below, a navy and pale grey checker floor runs away from the viewer into the haze, and six mirror balls ride a carousel over it, bouncing in a wave: red for films, blue for shows, amber for books, green for games, teal for albums, violet for podcasts. Whichever sphere is at the front, the drum shows its verb. Far off in the haze on the left, one pale, blurred sphere drifts back and forth over a label that says SOMETIME IN 2015-2019. The sky runs a one-minute day through the kind colours: a plum, violet, magenta, red and amber sunset, a starry navy night with coloured light under the spheres, a teal and green dawn, a blue day. A slow scroller at the horizon gives the pitch and a few made-up feed posts.">
</p>

<p align="center">
  <b>MediaLog</b>: everything you've watched, read, played, listened to, on one timeline.<br>
  <sub>six kinds on the carousel &middot; one drum that turns to whichever verb is at the front &middot; one sphere lost in the haze</sub>
</p>

A media diary you share. Log a film, a book, a show, a game, an album or a podcast: when, and how it was. Then see what the people you know have been into.

- **Each kind has its colour.** Movies are red, TV shows and anime blue, books amber, comics and manga magenta, games green, podcasts violet, music teal, videos plum. Six of them ride the carousel. The sunset borrows the rest.
- **A log, five years at a time.** Blocks of five years (2025-2029, 2015-2019), then years, then entries: a day if you know it (12 Sep), a month if you half know it (Feb).
- **Sometime in** holds what you can only place roughly. Up there it is the haze on the horizon: the floor runs away from you, and everything ends up in it eventually.
- **How it was:** a heart for loved, a thumbs-up for liked, or a verdict of your own ("So slow, so good"), plus a note if you insist.
- **The people you know:** a feed of what your friends logged, threads about a title, and what got talked about this month.

<sub>In development. Nothing to install yet. Signing in is email and password, or carry on with Google or GitHub.</sub>

<details>
<summary><b>THE CAROUSEL</b>: six spheres, six kinds, one drum trying to keep up</summary>

```text
── THE CAROUSEL, FROM ABOVE ─────────────────────────────────────────────

              .    .    .   ~ the haze ~   .    .    .
                 (o)  sometime in 2015-2019, give or take a tile

                                 GAME
                               ( green )

                   BOOK                       ALBUM
                 ( amber )                   ( teal )

                   SHOW                       PODCAST
                  ( blue )                   ( violet )

                                 FILM
                                ( red )
                                   ^
                     you, the drum, and the logo

  The ring turns once every 30 seconds: film, show, book, game, album,
  podcast, film. Each time a new sphere reaches the front, the drum
  under the logo turns one face:

      film  ->  WATCHED             game     ->  PLAYED
      show  ->  WATCHED             album    ->  LISTENED TO
      book  ->  READ                podcast  ->  LISTENED TO

  Two kinds share WATCHED and two share LISTENED TO, so the drum turns
  six times a lap and changes its mind four times. It is still the most
  decisive thing in the banner.
```

</details>

<details>
<summary><b>LOGGED</b>: a sample log, five years at a time</summary>

```text
── 2025-2029 ─────────────────────────────────────────────────────────────

   2026
   ● The Quiet Kettle ...................................... ♥     12 Sep
     Film, Imelda Strand
     It never boils. I could not look away.

   ● Very Small Houses ..................................... ♥        Feb
     TV show, S2 E1-10
     Watched the one with the shed twice. The shed is fine.

   2025
   ● Greatest Holds .................................... liked      3 Nov
     Album, Ensemble Please Hold
     Your call is important to them. So is track four.

   ● Forklift Romance .................. "So slow, so good" :)
     Game, Damp Rock Games

── 2015-2019 ─────────────────────────────────────────────────────────────

   Sometime in 2015-2019
   ● War and Peace ..................................... liked
     Book, Leo Tolstoy, ebook
     Finished it in here somewhere. Would like that to count.

   ● A Fortnight of Mild Peril ............................. ♥
     Film
     Definitely saw it. Possibly on a plane. It is the sphere in the
     haze, and it is not coming any closer.
```

</details>

<details>
<summary><b>GREETZ</b>: the people you know, and what they have been into</summary>

```text
── FEED · FRIENDS & ME · RECENTLY LOGGED ─────────────────────────────────

  Logged yesterday

  Otis         The Quiet Kettle      Film, Imelda Strand        2026   ♥
               "It never boils. I could not look away."      Read more

  Ffion        Forklift Romance      Game, Damp Rock Games      2025
               "So slow, so good" :)

  Auntie Bev   Is It Soup?           Podcast, S1 E1-40     2020-2024   ♥
               "Episode 12 settled nothing."

  Wendell      War and Peace         Book, Leo Tolstoy     2015-2019
               "Would like this to count."

── YOUR THREADS ───────────────────── ── TALKED ABOUT THIS MONTH ─────────
  ● Is It Soup?             3 new       Very Small Houses
                                        4 people · 9 posts
                                        Auntie Bev: "the shed, though"
```

</details>

<details>
<summary><b>HOW IT RUNS</b>: one SVG, no video, and the known issues</summary>

```text
── HOW THE FLOOR RUNS AWAY ───────────────────────────────────────────────
  No GIF, no video, no JavaScript: one SVG file and CSS keyframes.
  A checkerboard is rows XOR columns. When the camera backs away in a
  straight line the column edges never move on screen: they are wedges
  fanning out of the vanishing point, so they are two fixed clip paths.
  The rows are 32 rectangles on one shared keyframe track, played
  backwards, each starting a little after the last. Everything you ever
  logged recedes at half a tile a second. Memory works the same way.

── HOW THE CAROUSEL STAYS IN ORDER ───────────────────────────────────────
  An SVG paints in a fixed order and a carousel does not. So every sphere
  is painted twice, once behind and once in front, and each copy only
  shows on its own half of the ring. The generator then runs five and a
  half minutes of orbit and bounce to prove that two spheres on the same
  half never touch.

── HOW THE DRUM KNOWS ────────────────────────────────────────────────────
  It does not know. It is a hexagonal prism on the same 30-second clock
  as the carousel, one face per sphere, turned a sixth of the way each
  time a sphere arrives. Each face is squashed by cos(a) and lifted by
  sin(a). The verbs were not consulted.

── KNOWN ISSUES ──────────────────────────────────────────────────────────
  * The scroller is slow. A diary is not a race. Closed: by design.
  * One sphere cannot be placed. It wanders about in the haze and was
    definitely there sometime in 2015-2019. Closed: cannot reproduce
    exactly, can reproduce roughly.
  * Comics, manga, anime and videos have no sphere. There were six seats.
    They are in the sky instead. Open.
  * The floor never arrives. Closed: it is the past.

── SMALL PRINT ───────────────────────────────────────────────────────────
  Chrome spheres over a checkerboard is the demoscene's oldest in-joke
  for "a demo". This one is drawn from scratch for MediaLog: the logo,
  the spheres, the drum and the type are all geometry from one generator
  script. Every title, creator and friend above is made up, apart from
  War and Peace, which Tolstoy made up.

              ═════  log it while you still know when  ═════
```

</details>
