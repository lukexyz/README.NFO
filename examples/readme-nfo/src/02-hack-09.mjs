import { writeHeader } from './lib.mjs';

const markdown = `<pre>
                  R  E  A  D  M  E  .  N  F  O
                            2  0  2  6

                     A world of retro headers
                    Built from text and vectors

By what name shall we know you? visitor
Welcome, visitor. Your adventure begins with a blank README.

*** PRESS RETURN: &lt;enter&gt;

README.NFO — The Hall of First Impressions
You stand beneath an arch made of glowing text. Thirteen doors
lead to 152 different styles: terminals, trackers, arcades and
stranger places. Every header is yours to copy and customise.
A small brass plaque beside the door reads: MIT.

A catalogue of styles rests on a wooden lectern.
A gallery of finished headers hangs along the north wall.
A toolkit waits in an open chest.

[ Exits: <a href="../../styles/INDEX.md">north: catalogue</a>  <a href="../README.md">east: galleries</a>  <a href="../../LICENSE">west: licence</a> ]

152H 13M 20V &gt; look
You see twenty possible beginnings. Choose the one that feels like you.

152H 13M 20V &gt; _
</pre>`;
writeHeader(2, { markdown, summary: 'A plain-text MUD login and a room full of reusable headers. The exits are real links.' });
