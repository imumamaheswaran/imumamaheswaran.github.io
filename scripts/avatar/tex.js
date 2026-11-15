const THREE = window.THREE;
const loadImg=(u)=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error(u));i.src=u;});
const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
export function ctex(c,srgb=true){const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.flipY=true;t.anisotropy=4;return t}
export async function imgData(url,size){const im=await loadImg(url);const c=cv(size||im.width,size||im.height);const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(im,0,0,c.width,c.height);return {c,x,d:x.getImageData(0,0,c.width,c.height)}}
// rasterise mesh triangles in UV space, calling fn(px, py, bary, triIndex)
export function rasterUV(m, W, H, fn){
  const uv=m.uv, idx=m.index;
  for(let t=0;t<idx.length;t+=3){
    const a=idx[t],b=idx[t+1],c=idx[t+2];
    const ax=uv[a*2]*W, ay=(1-uv[a*2+1])*H, bx=uv[b*2]*W, by=(1-uv[b*2+1])*H, cx=uv[c*2]*W, cy=(1-uv[c*2+1])*H;
    const minx=Math.max(0,Math.floor(Math.min(ax,bx,cx))-1), maxx=Math.min(W-1,Math.ceil(Math.max(ax,bx,cx))+1);
    const miny=Math.max(0,Math.floor(Math.min(ay,by,cy))-1), maxy=Math.min(H-1,Math.ceil(Math.max(ay,by,cy))+1);
    const den=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy); if(Math.abs(den)<1e-9) continue;
    for(let y=miny;y<=maxy;y++) for(let x=minx;x<=maxx;x++){
      const px=x+0.5, py=y+0.5;
      const l1=((by-cy)*(px-cx)+(cx-bx)*(py-cy))/den, l2=((cy-ay)*(px-cx)+(ax-cx)*(py-cy))/den, l3=1-l1-l2;
      const e=-0.02*Math.max(1, 3/Math.sqrt(Math.abs(den)));
      if(l1<e||l2<e||l3<e) continue;
      fn(x,y,[l1,l2,l3],[a,b,c]);
    }
  }
}
