import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function browserCommand(file, platform = process.platform) {
  const url=pathToFileURL(file).href;
  if(platform==='win32') return { command:'powershell.exe', args:['-NoProfile','-NonInteractive','-Command','Start-Process -FilePath $env:README_NFO_GALLERY_URL'],
    options:{env:{...process.env,README_NFO_GALLERY_URL:url},windowsHide:true,stdio:'ignore',shell:false} };
  return {command:platform==='darwin'?'open':'xdg-open',args:[url],options:{stdio:'ignore',shell:false}};
}

export async function openGallery(file,{platform=process.platform,spawnProcess=spawn}={}) {
  if(platform==='linux'&&!process.env.DISPLAY&&!process.env.WAYLAND_DISPLAY)return false;
  const {command,args,options}=browserCommand(file,platform);
  return new Promise(resolve=>{
    let child;
    try { child=spawnProcess(command,args,options); } catch { resolve(false); return; }
    const timer=setTimeout(()=>{child.kill();resolve(false);},5000);
    const done=success=>{clearTimeout(timer);resolve(success);};
    child.once('error',()=>done(false));
    child.once('close',code=>done(code===0));
  });
}
