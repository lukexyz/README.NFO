// Fixed forty-style draw, embedded so isolated rebuilds need only numbered Markdown.
const OPTIONS=[
  {
    "slug": "01-vap-12",
    "id": "vap-12",
    "name": "Geocities homepage / web 1.0",
    "family": "vap"
  },
  {
    "slug": "02-idle-02",
    "id": "idle-02",
    "name": "Minter light synth (Psychedelia): mirrored trails of expanding pattern seeds",
    "family": "idle"
  },
  {
    "slug": "03-nfo-02",
    "id": "nfo-02",
    "name": "PC NFO: shaded block logo with fades and debris (SAC school)",
    "family": "nfo"
  },
  {
    "slug": "04-nfo-10",
    "id": "nfo-10",
    "name": "Usenet line art and the signed picture (jgs school)",
    "family": "nfo"
  },
  {
    "slug": "05-asia-03",
    "id": "asia-03",
    "name": "PTT telnet board: board list, push/boo comment column and double-width Big5 block art",
    "family": "asia"
  },
  {
    "slug": "06-xfer-09",
    "id": "xfer-09",
    "name": "FXP client: two site panes, a queue and a raw log",
    "family": "xfer"
  },
  {
    "slug": "07-c64-04",
    "id": "c64-04",
    "name": "C64 disk directory art (dir art)",
    "family": "c64"
  },
  {
    "slug": "08-vap-04",
    "id": "vap-04",
    "name": "Signalwave: the Weather Channel local-forecast screen",
    "family": "vap"
  },
  {
    "slug": "09-pc-12",
    "id": "pc-12",
    "name": "Neon cube field: the rez-era Razor look",
    "family": "pc"
  },
  {
    "slug": "10-print-03",
    "id": "print-03",
    "name": "Magazine type-in listing: BASIC, DATA blocks and a checksum column",
    "family": "print"
  },
  {
    "slug": "11-vap-11",
    "id": "vap-11",
    "name": "Classic Mac OS: 1-bit System 6/7 desktop",
    "family": "vap"
  },
  {
    "slug": "12-mach-07",
    "id": "mach-07",
    "name": "Game Boy DMG boot: logo drop on a four-shade green LCD",
    "family": "mach"
  },
  {
    "slug": "13-demo-08",
    "id": "demo-08",
    "name": "ZX Spectrum / Pentagon demo screen: effects in the attribute grid",
    "family": "demo"
  },
  {
    "slug": "14-idle-07",
    "id": "idle-07",
    "name": "3D Maze: brick corridor walk with overlay map",
    "family": "idle"
  },
  {
    "slug": "15-demo-10",
    "id": "demo-10",
    "name": "Amstrad CPC demo screen: Mode 0 fat pixels, three-level RGB, full overscan",
    "family": "demo"
  },
  {
    "slug": "16-mach-09",
    "id": "mach-09",
    "name": "8-bit console title screen (NES / Famicom era)",
    "family": "mach"
  },
  {
    "slug": "17-ansi-04",
    "id": "ansi-04",
    "name": "ANSImation: the modem-speed draw-in",
    "family": "ansi"
  },
  {
    "slug": "18-hack-10",
    "id": "hack-10",
    "name": "DOS virus payload screen (falling letters, crawling sprite)",
    "family": "hack"
  },
  {
    "slug": "19-mach-15",
    "id": "mach-15",
    "name": "SNES Mode 7: rotating textured ground plane",
    "family": "mach"
  },
  {
    "slug": "20-nfo-03",
    "id": "nfo-03",
    "name": "Poster NFO: full-canvas shaded illustration with the text set inside it",
    "family": "nfo"
  },
  {
    "slug": "21-pc-11",
    "id": "pc-11",
    "name": "BIOS setup hijack: the firmware screen that starts misbehaving",
    "family": "pc"
  },
  {
    "slug": "22-trk-03",
    "id": "trk-03",
    "name": "FastTracker II (dense DOS GUI tracker with scope grid)",
    "family": "trk"
  },
  {
    "slug": "23-hack-18",
    "id": "hack-18",
    "name": "CTF challenge board and scoreboard (category tiles, top-ten score graph, rank table)",
    "family": "hack"
  },
  {
    "slug": "24-vap-17",
    "id": "vap-17",
    "name": "Memphis: squiggles, confetti and laminate",
    "family": "vap"
  },
  {
    "slug": "25-hack-03",
    "id": "hack-03",
    "name": "Standards plain text: RFC first page and Unix man page",
    "family": "hack"
  },
  {
    "slug": "26-demo-09",
    "id": "demo-09",
    "name": "Atari 8-bit demo screen: 16-shade GTIA ramps recoloured by display-list interrupts",
    "family": "demo"
  },
  {
    "slug": "27-asia-06",
    "id": "asia-06",
    "name": "Japanese 8/16-bit BASIC power-on: memory count, file-buffer question, function-key bar (PC-88/98), and the MSX blue screen",
    "family": "asia"
  },
  {
    "slug": "28-c64-08",
    "id": "c64-08",
    "name": "Bobs and dot objects: a sphere chain on a Lissajous path, a rotating dot cube",
    "family": "c64"
  },
  {
    "slug": "29-print-05",
    "id": "print-05",
    "name": "Scene paperwork: tick-box swap letter, party pre-invitation with reply coupon, hand-drawn votesheet",
    "family": "print"
  },
  {
    "slug": "30-hack-11",
    "id": "hack-11",
    "name": "mIRC channel window with colour-code block art and netsplit",
    "family": "hack"
  },
  {
    "slug": "31-demo-02",
    "id": "demo-02",
    "name": "PC demo READ.ME: paged info file with index, member table and cut-here form",
    "family": "demo"
  },
  {
    "slug": "32-mach-12",
    "id": "mach-12",
    "name": "VFD and segment-display front panel (hi-fi, VCR, calculator)",
    "family": "mach"
  },
  {
    "slug": "33-c64-14",
    "id": "c64-14",
    "name": "Chip-music jukebox: track list with times, embossed panel, 'hit a key' legend",
    "family": "c64"
  },
  {
    "slug": "34-asia-05",
    "id": "asia-05",
    "name": "MML listing: the project name as a tune in plain text",
    "family": "asia"
  },
  {
    "slug": "35-hack-15",
    "id": "hack-15",
    "name": "Decrypt reveal: a scrambled text block that resolves into plaintext",
    "family": "hack"
  },
  {
    "slug": "36-nfo-04",
    "id": "nfo-04",
    "name": "7-bit outline NFO with dot-leader fields",
    "family": "nfo"
  },
  {
    "slug": "37-nfo-07",
    "id": "nfo-07",
    "name": "Amiga colly era: full-width Latin-1 logos and page layout",
    "family": "nfo"
  },
  {
    "slug": "38-xfer-10",
    "id": "xfer-10",
    "name": "SFV file and check result (with an NFO viewer frame)",
    "family": "xfer"
  },
  {
    "slug": "39-pc-09",
    "id": "pc-09",
    "name": "Pencil on paper: the cracktro that draws itself",
    "family": "pc"
  },
  {
    "slug": "40-vap-09",
    "id": "vap-09",
    "name": "Windows XP Luna: blue title bars and the green hill",
    "family": "vap"
  }
];

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DIR=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const esc=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const cat=pick=>'../../styles/'+pick.family+'.md#'+pick.id;
const picks=OPTIONS.map(pick=>{
  const markdown=fs.readFileSync(path.join(DIR,pick.slug+'.md'),'utf8');
  const header=markdown.replace(/^<!--[\s\S]*?-->\s*/,'').replace(/^> \*\*Candidate[^\n]*\n?/gm,'').replace(/^\[Generator\][^\n]*\n?/gm,'').trim();
  const image=header.match(/<img[^>]+src="([^"]+)"/)?.[1];
  const text=header.match(/\x60\x60\x60text\n([\s\S]*?)\n\x60\x60\x60/)?.[1];
  const summary=markdown.match(/^> \*\*Candidate[^\n]* · (.+)$/m)?.[1]||pick.name;
  return {...pick,number:pick.slug.slice(0,2),header,image,text,summary,formats:[...(image?['svg']:[]),...(text?['text']:[])]};
});
const intro='# Heretic — 40 random samples\n\nForty original compositions for [p-e-w/heretic](https://github.com/p-e-w/heretic), using a fixed random draw from 153 distinct catalogue briefs. These are individually authored examples, not recoloured CLI templates. [Saved draw](draw.json) · [Verified project facts](project.json) · [Interactive gallery](gallery.html) · [Visual QA](qa.json).\n\n'+
  '[01–10](page-1.md) · [11–20](page-2.md) · [21–30](page-3.md) · [31–40](page-4.md). Filter by Text / ASCII or SVG and save favourite numbers in the gallery. Copy each numbered Markdown header and its assets; paths are relative to that header. The included [MIT notice](LICENSE.README-NFO.txt) covers this artwork; Heretic itself is AGPL-3.0.\n\n'+
  'Rebuild every sample with <code>node examples/heretic/src/build.mjs</code>; rebuild only the index with <code>node examples/heretic/src/build-gallery.mjs</code>. Each candidate has its own generator and recorded artistic choices under <code>src/</code>. Small artwork detail is decorative at mobile widths; the project pitch is also real Markdown.\n\n';
fs.writeFileSync(path.join(DIR,'README.md'),intro+'| # | Sample | Format | Preview |\n| --- | --- | --- | --- |\n'+picks.map(p=>'| '+p.number+' | ['+p.name+']('+p.slug+'.md) | '+p.formats.join(' + ').toUpperCase()+' | '+(p.image?'<a href="'+p.slug+'.md"><img src="'+p.image+'" width="240" alt="'+esc(p.summary)+'"></a>':'[Copyable text]('+p.slug+'.txt)')+' |').join('\n')+'\n\n[Other examples](../README.md) · [Style catalogue](../../styles/INDEX.md)\n');
for(let page=0;page<4;page++) {
 const nav='[All 40](README.md) · [Gallery](gallery.html)'+(page?' · [← Previous](page-'+page+'.md)':'')+(page<3?' · [Next →](page-'+(page+2)+'.md)':'');
 fs.writeFileSync(path.join(DIR,'page-'+(page+1)+'.md'),'# Heretic samples '+String(page*10+1).padStart(2,'0')+'–'+(page*10+10)+'\n\n'+nav+'\n\n'+picks.slice(page*10,page*10+10).map(p=>'## '+p.number+' · '+p.name+'\n\n['+p.id+']('+cat(p)+') · [Generator](src/'+p.slug+'.mjs) · [Copy this header]('+p.slug+'.md)\n\n'+p.header+'\n').join('\n---\n\n')+'\n'+nav+'\n');
}
const cards=picks.map(p=>'<article class="card" data-formats="'+p.formats.join(' ')+'" id="candidate-'+p.number+'"><header><label><input type="checkbox" value="'+p.number+'" aria-label="Choose candidate '+p.number+'"><b>'+p.number+'</b> '+esc(p.name)+'</label><span>'+p.formats.join(' + ').toUpperCase()+'</span></header><div class="art">'+(p.image?'<img src="'+p.image+'" alt="'+esc(p.summary)+'" loading="lazy">':'<pre>'+esc(p.text)+'</pre>')+'</div><p>'+esc(p.summary)+'</p><p class="pitch">Fully automatic censorship removal for language models</p><footer><a href="'+p.slug+'.md">Markdown</a>'+p.formats.map(f=>'<a href="'+(f==='svg'?p.image:p.slug+'.txt')+'" download>'+f.toUpperCase()+'</a>').join('')+'<a href="src/'+p.slug+'.mjs">Generator</a><a href="'+cat(p)+'">'+p.id+'</a></footer><details><summary>Copy header</summary><textarea readonly aria-label="Header Markdown '+p.number+'">'+esc(p.header)+'</textarea><button class="copy-header" type="button">Copy Markdown</button></details></article>').join('\n');
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Heretic — 40 random README headers</title><style>'+ 
':root{color-scheme:dark;--bg:#0a1017;--card:#15202c;--text:#e7eef4;--muted:#9cb0bf;--line:#354a5c;--accent:#99e6c1}html[data-theme=light]{color-scheme:light;--bg:#f0f3f4;--card:#fff;--text:#162838;--muted:#526778;--line:#bdcbd5;--accent:#146745}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.5 system-ui,sans-serif}main{max-width:1400px;margin:auto;padding:30px}h1{font-size:clamp(32px,5vw,60px);margin:8px 0}a{color:var(--accent)}.intro p{max-width:820px;color:var(--muted)}button,input,textarea{font:inherit}button{padding:8px 12px;border:1px solid var(--line);border-radius:6px;color:var(--text);background:var(--card);cursor:pointer}button[aria-pressed=true]{border-color:var(--accent);color:var(--accent)}nav{display:flex;gap:10px;flex-wrap:wrap;margin:16px 0}.selection{position:sticky;top:0;z-index:2;background:var(--bg);padding:12px 0;display:flex;gap:9px;flex-wrap:wrap;border-block:1px solid var(--line)}.selection input{min-width:100px;flex:1;background:var(--card);color:var(--text);border:1px solid var(--line);padding:8px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin-top:24px}.card{min-width:0;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}.card[hidden]{display:none}.card.chosen{outline:2px solid var(--accent)}.card header{padding:16px;display:flex;gap:12px;justify-content:space-between;font-size:14px}.card label{cursor:pointer}.card input{accent-color:var(--accent)}.card b{font:700 20px monospace;color:var(--accent);margin:0 8px}.card header span{font:11px monospace;white-space:nowrap;color:var(--muted)}.art{background:#070c11;color:#e3edf5}.art img{display:block;width:100%;height:auto}.art pre{margin:0;overflow:auto;padding:22px;font:12px/1.4 Consolas,monospace}.card p{margin:15px 17px;color:var(--muted);font-size:14px}.card .pitch{color:var(--text)}footer{display:flex;flex-wrap:wrap;gap:14px;padding:0 17px 18px;font-size:13px}details{padding:0 17px 17px}summary{cursor:pointer}textarea{display:block;width:100%;height:170px;margin:12px 0;background:var(--bg);color:var(--text);border:1px solid var(--line);padding:10px;font:13px monospace}.closing{color:var(--muted);font-size:13px;margin-top:30px}@media(max-width:850px){main{padding:18px}.grid{grid-template-columns:1fr}.card header{flex-wrap:wrap}.art pre{font-size:11px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}'+
'</style></head><body><main><header class="intro"><div>README.NFO / HERETIC</div><h1>Forty different directions.</h1><p>Forty saved random style choices, individually composed for Heretic. Browse images and copyable text, then save your favourite numbers.</p><nav><a href="README.md">Markdown index</a><a href="draw.json">Saved draw</a><a href="project.json">Project facts</a><a href="qa.json">Visual QA</a></nav></header><nav aria-label="Header format"><button data-format="all" aria-pressed="true">All 40</button><button data-format="text" aria-pressed="false">Text / ASCII ('+picks.filter(p=>p.formats.includes('text')).length+')</button><button data-format="svg" aria-pressed="false">SVG ('+picks.filter(p=>p.formats.includes('svg')).length+')</button></nav><section class="selection" aria-label="Favourite headers"><b id="count">0 selected</b><input id="selected" readonly aria-label="Selected candidate numbers"><button id="copy" type="button">Copy favourites</button><button id="clear" type="button">Clear</button><button id="theme" type="button">Light / dark</button></section><p id="status" role="status"></p><section class="grid">'+cards+'</section><p class="closing">The fixed draw uses 40 of 153 distinct briefs. No styles were substituted. Small image details are decorative; project descriptions also appear as normal Markdown. <a href="LICENSE.README-NFO.txt">MIT artwork licence</a> · <a href="../README.md">Other examples</a></p></main><script>'+
'const boxes=[...document.querySelectorAll("input[type=checkbox]")],key="heretic-header-favourites-40";let saved=[];try{saved=JSON.parse(localStorage.getItem(key)||"[]")}catch{};boxes.forEach(b=>b.checked=Array.isArray(saved)&&saved.includes(b.value));function update(){const n=boxes.filter(b=>b.checked).map(b=>b.value);document.getElementById("selected").value=n.join(", ");document.getElementById("count").textContent=n.length+" selected";boxes.forEach(b=>b.closest("article").classList.toggle("chosen",b.checked));try{localStorage.setItem(key,JSON.stringify(n))}catch{}}boxes.forEach(b=>b.addEventListener("change",update));update();document.querySelectorAll("[data-format]").forEach(button=>button.addEventListener("click",()=>{const f=button.dataset.format;document.querySelectorAll(".card").forEach(c=>c.hidden=f!=="all"&&!c.dataset.formats.split(" ").includes(f));document.querySelectorAll("[data-format]").forEach(b=>b.setAttribute("aria-pressed",String(b===button)))}));async function copy(area,message){area.focus();area.select();try{await navigator.clipboard.writeText(area.value);document.getElementById("status").textContent=message}catch{document.getElementById("status").textContent="Selected. Press Ctrl/Cmd+C to copy."}}document.getElementById("copy").onclick=()=>copy(document.getElementById("selected"),"Favourite numbers copied.");document.getElementById("clear").onclick=()=>{boxes.forEach(b=>b.checked=false);update()};document.getElementById("theme").onclick=()=>document.documentElement.dataset.theme=document.documentElement.dataset.theme==="light"?"dark":"light";document.querySelectorAll(".copy-header").forEach(b=>b.onclick=()=>copy(b.previousElementSibling,"Header Markdown copied."));'+
'</script></body></html>\n';
fs.writeFileSync(path.join(DIR,'gallery.html'),html);
console.log('Built Heretic gallery, Markdown index and four full-header pages.');
