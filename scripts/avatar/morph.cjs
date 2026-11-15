// Step 1: apply the MakeHuman modifiers in mods.json and write the morphed base-mesh vertices.
// Usage: node morph.cjs mods.json morphed.json  (with the work dir served on :8811, see README.md)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const mods=JSON.parse(fs.readFileSync(process.argv[2]));const b=await chromium.launch();const p=await b.newPage();
p.on('console',m=>{if(m.type()==='error')console.log('ERR',m.text().slice(0,200))});
await p.goto('http://localhost:8811/morph.html');await p.waitForFunction(()=>window.ready);
const r=await p.evaluate(m=>window.morph(m),mods);
console.log('missing',r.missing,'active',r.nActive);fs.writeFileSync(process.argv[3],JSON.stringify(r.verts));await b.close();})();
