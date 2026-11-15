// Step 3 (runs in the browser, from build.html): materials and painted textures.
// Skin tinted medium brown with a trimmed beard and moustache painted from a 3D density field,
// the suit turned into a white dobok with a black V collar, black hair swept up.
import { ctex, imgData, rasterUV } from './tex.js';
const THREE = window.THREE;
const P='data/proxies/';
const sstep=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
export const SKIN=[0.76,0.6,0.48];
export function beardDensity(x,y,z){
  const ax=Math.abs(x);
  if(y>0.76||y<0.6) return 0;
  // in front of the ear
  const back=sstep(0.035,0.06,z);
  // moustache: upper lip skin
  const must=(1-sstep(0.02,0.036,ax))*sstep(0.688,0.693,y)*(1-sstep(0.705,0.709,y))*sstep(0.12,0.135,z);
  // drooping corners
  const corner=sstep(0.014,0.02,ax)*(1-sstep(0.034,0.042,ax))*sstep(0.664,0.674,y)*(1-sstep(0.694,0.702,y));
  // chin & jaw: below the lower lip, fading out under the chin onto the neck
  const top= 0.682 + Math.max(0,ax-0.028)*0.5 + Math.max(0,ax-0.052)*1.2; // cheek line rises toward sideburns
  const lowFront = 0.638 - Math.max(0,ax-0.02)*0.25;
  const under = sstep(lowFront, lowFront+0.012, y);
  const neckZ = sstep(0.07,0.095,z) + (1-sstep(0.0,0.03,0.66-y))*0; // fade on the throat
  let jaw=(1-sstep(top-0.009,top+0.006,y))*under*back;
  jaw*= (y<0.645? Math.max(neckZ*0.9, sstep(0.63,0.645,y)):1);
  // lighter on the cheeks, dense on chin and jawline
  const cheek = sstep(0.03,0.05,ax)*sstep(0.66,0.69,y);
  jaw*= 1-0.38*cheek;
  return Math.min(1,Math.max(must*1.1,corner*1.0,jaw*0.95));
}
export async function textures(inter){
  const out={};
  const W=1024;
  const s=await imgData('data/skins/young_asian_male/textures/young_lightskinned_male_diffuse3.png',W);
  const d=s.d.data;
  for(let i=0;i<d.length;i+=4){ const l=(d[i]+d[i+1]+d[i+2])/3; const k=0.5; d[i]=(d[i]*(1-k)+l*k)*SKIN[0]; d[i+1]=(d[i+1]*(1-k)+l*k)*SKIN[1]; d[i+2]=(d[i+2]*(1-k)+l*k)*SKIN[2]; }
  // paint the trimmed beard + moustache in UV space from a 3D density field
  const body=inter.meshes.find(m=>m.name==='body'); const pos=body.position;
  const dens=new Float32Array(W*W); const rough=new Float32Array(W*W);
  rasterUV(body,W,W,(px,py,l,[a,b,c])=>{
    const x=l[0]*pos[a*3]+l[1]*pos[b*3]+l[2]*pos[c*3], y=l[0]*pos[a*3+1]+l[1]*pos[b*3+1]+l[2]*pos[c*3+1], z=l[0]*pos[a*3+2]+l[1]*pos[b*3+2]+l[2]*pos[c*3+2];
    dens[py*W+px]=Math.max(dens[py*W+px],beardDensity(x,y,z));
  });
  for(let i=0;i<W*W;i++){ const dd=dens[i]; if(!dd) continue; const j=i*4;
    const red=d[j]/(d[j+1]+1); const lip=sstep(1.72,1.9,red); // keep lips clear
    const n=0.6+0.55*rnd(); const a=Math.min(1,dd*n*dd)*(1-lip)*0.95;
    d[j]=d[j]*(1-a)+26*a; d[j+1]=d[j+1]*(1-a)+19*a; d[j+2]=d[j+2]*(1-a)+16*a; rough[i]=Math.max(rough[i],a); }
  // darken scalp under the hair so gaps between strands read as hair, not skin
  const hm=inter.meshes.find(m=>m.name==='hair'), hp=hm.position;
  const hv=[]; for(let i=0;i<hp.length;i+=3) hv.push([hp[i],hp[i+1],hp[i+2]]);
  const scalpV=new Float32Array(pos.length/3);
  for(let i=0;i<pos.length/3;i++){ const x=pos[i*3],y=pos[i*3+1],z=pos[i*3+2]; if(y<0.7) continue; let best=1; for(const q of hv){ const dx=q[0]-x,dy=q[1]-y,dz=q[2]-z; const dd=dx*dx+dy*dy+dz*dz; if(dd<best) best=dd; } scalpV[i]=1-sstep(0.002,0.006,Math.sqrt(best)); }
  rasterUV(body,W,W,(px,py,l,[a,b,c])=>{ const v=l[0]*scalpV[a]+l[1]*scalpV[b]+l[2]*scalpV[c]; if(v<=0) return; const j=(py*W+px)*4; const t=Math.min(1,v)*0.9; d[j]=d[j]*(1-t)+16*t; d[j+1]=d[j+1]*(1-t)+13*t; d[j+2]=d[j+2]*(1-t)+12*t; rough[py*W+px]=Math.max(rough[py*W+px],t); });
  s.x.putImageData(s.d,0,0);
  window.skinCanvas=s.c;
  const RW=512, rc=document.createElement('canvas'); rc.width=rc.height=RW; const rx=rc.getContext('2d'); const rd=rx.createImageData(RW,RW);
  for(let y=0;y<RW;y++) for(let x=0;x<RW;x++){ const r=Math.max(rough[(y*2)*W+x*2],rough[(y*2+1)*W+x*2+1]); const v=Math.round((0.52+0.43*r)*255); const j=(y*RW+x)*4; rd.data[j]=0; rd.data[j+1]=v; rd.data[j+2]=0; rd.data[j+3]=255; }
  rx.putImageData(rd,0,0);
  const skinTex=ctex(s.c); skinTex.userData.mimeType='image/jpeg';
  out.body=new THREE.MeshStandardMaterial({map:skinTex,roughnessMap:ctex(rc,false),roughness:1,metalness:0});
  const su=await imgData(P+'clothes/male_elegantsuit01/textures/male_elegantsuit01_diffuse.png',1024);
  { const d=su.d.data; for(let i=0;i<d.length;i+=4){ const l=(d[i]+d[i+1]+d[i+2])/3; const v=Math.min(255, 218+ (l-45)*0.8); d[i]=v; d[i+1]=v; d[i+2]=v*0.985; d[i+3]=255; } }
  paintCollar(inter.meshes.find(m=>m.name==='suit'), su.d.data, 1024);
  su.x.putImageData(su.d,0,0);
  out.suit=new THREE.MeshPhysicalMaterial({map:ctex(su.c),alphaTest:0.5,roughness:0.82,sheen:0.3,sheenRoughness:0.8,sheenColor:new THREE.Color(0x999999),side:THREE.DoubleSide});
  for(const [k,f] of [['hair','short01']]){
  const h=await imgData(P+'hair/'+f+'/textures/'+f+'_diffuse.png');
  { const d=h.d.data; for(let i=0;i<d.length;i+=4){ const l=(d[i]+d[i+1]+d[i+2])/3; const v=8+l*0.18; d[i]=v; d[i+1]=v*0.92; d[i+2]=v*0.88; } h.x.putImageData(h.d,0,0); }
  out[k]=new THREE.MeshPhysicalMaterial({map:ctex(h.c),alphaTest:0.45,roughness:0.5,side:THREE.DoubleSide,sheen:0.4,sheenColor:new THREE.Color(0x555555)});
  }
  const b=await imgData(P+'eyebrows/eyebrow001/textures/eyebrow001.png');
  out.brows=new THREE.MeshStandardMaterial({map:ctex(b.c),alphaTest:0.3,roughness:0.8,color:0x222222});
  const l=await imgData(P+'eyelashes/Eyelashes01/textures/eyelashes01.png');
  out.lashes=new THREE.MeshStandardMaterial({map:ctex(l.c),alphaTest:0.3,roughness:0.8,color:0x111111,side:THREE.DoubleSide});
  const e=await imgData(P+'eyes/HighPolyEyes/textures/brown_eye.png');
  { const d=e.d.data; for(let i=0;i<d.length;i+=4){ const r=d[i],g=d[i+1],b=d[i+2]; const sat=r-(g+b)/2; if(sat>25){ const l=(r+g+b)/3; d[i]=l*0.62; d[i+1]=l*0.42; d[i+2]=l*0.28; } } e.x.putImageData(e.d,0,0); }
  const eyeTex=ctex(e.c); eyeTex.userData.mimeType='image/jpeg';
  out.eyes=new THREE.MeshPhysicalMaterial({map:eyeTex,roughness:0.25});
  out.belt=new THREE.MeshPhysicalMaterial({color:0x121212,roughness:0.78,sheen:0.5,sheenRoughness:0.7,sheenColor:new THREE.Color(0x444444)});
  return out;
}

export function hairMove(x,y,z){
  const c=[0,0.745,0.03]; const sc=1+0.05*sstep(0.78,0.88,y)+0.015;
  let X=c[0]+(x-c[0])*(1+0.03), Y=c[1]+(y-c[1])*sc, Z=c[2]+(z-c[2])*sc;
  Y+=0.008*sstep(0.04,0.11,z)*sstep(0.8,0.85,y);
  return [X,Y,Z];
}
export function editGeo(m,g){
  if(m.name==='hair'){ const p=g.attributes.position; for(let i=0;i<p.count;i++){ const q=hairMove(p.getX(i),p.getY(i),p.getZ(i)); p.setXYZ(i,q[0],q[1],q[2]); } }
  if(m.name==='eyes'){ const uv=m.uv, idx=m.index, keep=[]; for(let t=0;t<idx.length;t+=3){ const c=[idx[t],idx[t+1],idx[t+2]].every(i=>uv[i*2]>0.8&&uv[i*2+1]<0.2); if(!c) keep.push(idx[t],idx[t+1],idx[t+2]); } g.setIndex(keep); }
}

export function suitParts(m){
  const P=m.position, UV=m.uv, I=m.index;
  const key=new Map(), wid=new Int32Array(P.length/3); const W=[];
  for(let i=0;i<P.length/3;i++){ const k=P[i*3].toFixed(5)+','+P[i*3+1].toFixed(5)+','+P[i*3+2].toFixed(5); let w=key.get(k); if(w===undefined){w=W.length;key.set(k,w);W.push([P[i*3],P[i*3+1],P[i*3+2]]);} wid[i]=w; }
  const inShirt=(i)=>{const u=UV[i*2], y=1-UV[i*2+1]; return u>0.3&&u<0.5&&y<0.47&&(y<0.12||u<0.42)};
  const shirtT=new Uint8Array(I.length/3);
  for(let t=0;t<I.length;t+=3) shirtT[t/3]=(inShirt(I[t])&&inShirt(I[t+1])&&inShirt(I[t+2]))?1:0;
  const ec=new Map();
  for(let t=0;t<I.length;t+=3){ if(shirtT[t/3]) continue; const w=[wid[I[t]],wid[I[t+1]],wid[I[t+2]]]; for(const [a,b] of [[w[0],w[1]],[w[1],w[2]],[w[2],w[0]]]){ const k=Math.min(a,b)+'_'+Math.max(a,b); ec.set(k,(ec.get(k)||0)+1);} }
  const lapel=[]; const seen=new Set();
  for(const [k,c] of ec){ if(c!==1) continue; for(const v of k.split('_').map(Number)){ if(seen.has(v)) continue; seen.add(v); const p=W[v]; if(p[1]>0.3&&(Math.abs(p[0])<0.13||p[1]>0.58)&&p[2]>-0.06) lapel.push(p); } }
  return {shirtT, lapel};
}
export function paintCollar(m,d,S){
  const {shirtT,lapel}=suitParts(m); const P=m.position;
  rasterUV(m,S,S,(px,py,l,[a,b,c])=>{
    const x=l[0]*P[a*3]+l[1]*P[b*3]+l[2]*P[c*3], y=l[0]*P[a*3+1]+l[1]*P[b*3+1]+l[2]*P[c*3+1], z=l[0]*P[a*3+2]+l[1]*P[b*3+2]+l[2]*P[c*3+2];
    let best=1; for(const q of lapel){ const dx=q[0]-x,dy=q[1]-y,dz=q[2]-z; const dd=dx*dx+dy*dy+dz*dz; if(dd<best) best=dd; }
    const dist=Math.sqrt(best);
    // shirt texels: upper part becomes the black neck band, the rest stays white
    const u=px/S, v=py/S; const shirt=u>0.3&&u<0.5&&v<0.47&&(v<0.12||u<0.42);
    let k=0;
    if(shirt){ k = 0; if(y-0.9*x>0.472){ d[(py*S+px)*4+3]=0; } }
    else k = 1-sstep(0.028,0.032,dist);
    if(k>0){ const j=(py*S+px)*4; const g=d[j]/255; const val=18+22*g*g; d[j]=d[j]*(1-k)+val*k; d[j+1]=d[j+1]*(1-k)+val*k; d[j+2]=d[j+2]*(1-k)+val*1.05*k; }
  });
}
