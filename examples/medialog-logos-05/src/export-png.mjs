// Raster exports of the SVGs, with the same external-image rendering used by a README.
// Run from a checkout with Playwright + Chromium installed. No fonts, network or image service.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const draw=JSON.parse(fs.readFileSync(path.join(dir,'draw.json')));
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:812,height:296},deviceScaleFactor:1});
 await page.goto(pathToFileURL(path.join(dir,'gallery.html')).href);
 for(const scheme of ['light','dark']){
  await page.emulateMedia({colorScheme:scheme});
  for(const p of draw.options){
   const src=pathToFileURL(path.join(dir,'assets',p.slug+'.svg')).href;
   await page.setContent(`<html style="color-scheme:${scheme};background:transparent"><body style="margin:0;background:transparent"><img src="${src}" width="812" height="296" alt="MediaLog"></body></html>`);
   await page.locator('img').evaluate(i=>i.decode());
   await page.locator('img').screenshot({path:path.join(dir,'assets',p.slug+'-'+scheme+'.png'),omitBackground:true});
  }
 }
}finally{await browser.close();}
console.log('Exported twenty transparent PNGs at 812 × 296 (light / dark).');
