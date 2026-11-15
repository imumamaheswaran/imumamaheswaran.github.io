// Step 4: build the avatar in headless Chromium and write the GLB.
// Usage: node export.cjs <out.glb>  (with the work dir served on :8811, see README.md)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();
p.on('console',m=>{if(['error','warning'].includes(m.type()))console.log(m.type(),m.text().slice(0,300))});p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('http://localhost:8811/build.html');await p.waitForFunction(()=>window.ready);
const b64=await p.evaluate(async()=>{
  const look=await import('./look.js');
  const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js');
  const av=await window.main({textures:look.textures, skip:[], editGeo:look.editGeo});
  for(const m of Object.values(av.meshes)){ m.material.name=m.name; }
  const glb=await new GLTFExporter().parseAsync(av.group,{binary:true,maxTextureSize:1024});
  const u8=new Uint8Array(glb);let s='';for(let i=0;i<u8.length;i+=0x8000) s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s);
});
fs.writeFileSync(process.argv[2],Buffer.from(b64,'base64'));console.log('bytes',fs.statSync(process.argv[2]).size);
await b.close();})();
