import { buildBelt } from './belt.mjs';
// Step 2: turn the morphed MakeHuman mesh, its skeleton and the chosen proxies (hair, clothes, eyes...)
// into one compact JSON (metres, triangles, skin weights, a 163-bone skeleton) for build.html.
// Usage: node prep.mjs <data dir> <morphed.json> <out inter.json>
import fs from 'node:fs';
const D = process.argv[2].replace(/\/?$/, '/');
const S = 0.1; // decimetres -> metres
const base = JSON.parse(fs.readFileSync(D + 'models/human_full_size.json'));
const morphed = JSON.parse(fs.readFileSync(process.argv[3]));
const OUT = process.argv[4];
const V = morphed; // flat xyz, decimetres
const nV = V.length / 3;

function parseFaces(faces, nUvLayers = 1) {
  const out = []; let i = 0;
  while (i < faces.length) {
    const t = faces[i++]; const quad = t & 1, n = quad ? 4 : 3;
    const vs = faces.slice(i, i + n); i += n;
    let mat = 0; if (t & 2) mat = faces[i++];
    if (t & 4) i += nUvLayers;
    let uvs = null; if (t & 8) { uvs = faces.slice(i, i + n); i += n * nUvLayers; }
    if (t & 16) i++;
    if (t & 32) i += n;
    if (t & 64) i++;
    if (t & 128) i += n;
    out.push({ vs, mat, uvs });
  }
  return out;
}

// --- skeleton ---------------------------------------------------------------
const nodes = base.bones; // 326 pseudo nodes: X____head / X
const real = []; const realIdx = {};
nodes.forEach((b) => { if (b.name.endsWith('____head')) { const nm = b.name.replace('____head', ''); realIdx[nm] = real.length; real.push({ name: nm, parentNode: b.parent }); } });
const jp = base.metadata.joint_pos_idxs;
const jointPos = (key) => { const ids = jp[key]; let x = 0, y = 0, z = 0; for (const id of ids) { x += V[id*3]; y += V[id*3+1]; z += V[id*3+2]; } return [x/ids.length*S, y/ids.length*S, z/ids.length*S]; };
for (const b of real) {
  b.parent = b.parentNode < 0 ? -1 : realIdx[nodes[b.parentNode].name.replace('____head', '')];
  b.head = jointPos(b.name + '____head');
  b.tail = jointPos(b.name + '____tail');
  delete b.parentNode;
}
const nodeToReal = nodes.map((b) => realIdx[b.name.replace('____head', '')] ?? realIdx[b.name]);

// --- mesh builder -------------------------------------------------------------
function build(name, src, pos, keepFace, matName) {
  const faces = parseFaces(src.faces);
  const uvs = src.uvs[0];
  const map = new Map(); const P = [], UV = [], SI = [], SW = [], IDX = [];
  const ipv = src.influencesPerVertex || 4;
  const vert = (v, uv) => {
    const key = v * 100000 + uv; let k = map.get(key);
    if (k === undefined) {
      k = P.length / 3; map.set(key, k);
      P.push(+(pos[v*3]*S).toFixed(5), +(pos[v*3+1]*S).toFixed(5), +(pos[v*3+2]*S).toFixed(5));
      UV.push(+uvs[uv*2].toFixed(5), +(uvs[uv*2+1]).toFixed(5));
      const si = [], sw = [];
      for (let j = 0; j < ipv; j++) { si.push(nodeToReal[src.skinIndices[v*ipv+j]] ?? 0); sw.push(src.skinWeights[v*ipv+j]); }
      while (si.length < 4) { si.push(0); sw.push(0); }
      // merge duplicate bone refs, normalise
      const acc = {}; si.forEach((b, j) => { acc[b] = (acc[b] || 0) + sw[j]; });
      const e = Object.entries(acc).sort((a, b) => b[1] - a[1]).slice(0, 4); const tot = e.reduce((s, x) => s + x[1], 0) || 1;
      for (let j = 0; j < 4; j++) { SI.push(e[j] ? +e[j][0] : 0); SW.push(e[j] ? +(e[j][1] / tot).toFixed(4) : 0); }
      vertOrig.push(v);
    }
    return k;
  };
  const vertOrig = [];
  for (const f of faces) {
    if (keepFace && !keepFace(f)) continue;
    const ks = f.vs.map((v, j) => vert(v, f.uvs[j]));
    IDX.push(ks[0], ks[1], ks[2]); if (ks.length === 4) IDX.push(ks[0], ks[2], ks[3]);
  }
  return { name, material: matName, position: P, uv: UV, skinIndex: SI, skinWeight: SW, index: IDX, orig: vertOrig };
}

function fitProxy(p) {
  const m = p.metadata; const n = m.ref_vIdxs.length; const out = new Float64Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = m.ref_vIdxs[i], w = m.weights[i], o = m.offsets[i];
    for (let a = 0; a < 3; a++) out[i*3+a] = o[a] + w[0]*V[r[0]*3+a] + w[1]*V[r[1]*3+a] + w[2]*V[r[2]*3+a];
  }
  return out;
}

const PROXIES = {
  suit: 'clothes/male_elegantsuit01/male_elegantsuit01.json',
  hair: 'hair/short01/short01.json',
  brows: 'eyebrows/eyebrow001/eyebrow001.json',
  lashes: 'eyelashes/Eyelashes01/Eyelashes01.json',
  eyes: 'eyes/HighPolyEyes/HighPolyEyes.json',
};
const meshes = [];
const del = new Uint8Array(nV);
// ankle height: below this we keep the body's feet (barefoot dobok)
const ankleY = Math.max(real[realIdx['foot.L']].head[1], real[realIdx['foot.R']].head[1]) / S + 0.25;
const proxyData = {};
for (const [k, path] of Object.entries(PROXIES)) {
  const p = JSON.parse(fs.readFileSync(D + 'proxies/' + path));
  proxyData[k] = p;
  const dv = p.metadata.deleteVerts;
  if (dv && !k.startsWith('hair')) dv.forEach((d, i) => { if (d && !(k === 'suit' && V[i*3+1] < ankleY)) del[i] = 1; });
}
// Dobok V-neck: drop the suit's shirt + tie and show the chest skin underneath
const suitP = proxyData.suit; const suitUV = suitP.uvs[0];
const isShirtFace = (f) => f.uvs.every((u) => { const U = suitUV[u*2], Y = 1 - suitUV[u*2+1]; return U > 0.3 && U < 0.5 && Y < 0.47 && (Y < 0.12 || U < 0.42); });
const keepBody = new Uint8Array(nV);
for (const f of parseFaces(suitP.faces)) if (isShirtFace(f)) for (const v of f.vs) for (const r of suitP.metadata.ref_vIdxs[v]) keepBody[r] = 1;
// cuffs are also "shirt" pieces: only open up the chest/neck
for (let i = 0; i < nV; i++) if (keepBody[i] && (V[i*3+1] * S < 0.2 || Math.abs(V[i*3] * S) > 0.2)) keepBody[i] = 0;
for (let i = 0; i < nV; i++) { const x = V[i*3]*S, y = V[i*3+1]*S, z = V[i*3+2]*S; if (z > 0.0 && y > 0.36 + 0.9 * (x + 0.08) && y < 0.66 && Math.abs(x) < 0.03 + (y - 0.27) * 0.33) keepBody[i] = 1; }
for (let i = 0; i < nV; i++) if (keepBody[i]) del[i] = 0;
const bodyMat = base.materials.findIndex((m) => m.DbgName === 'body');
meshes.push(build('body', base, V, (f) => f.mat === bodyMat && f.vs.filter((v) => del[v]).length < 3, 'skin'));
for (const [k, p] of Object.entries(proxyData)) {
  const pos = fitProxy(p);
  meshes.push(build(k, p, pos, k === 'suit' ? (f) => !isShirtFace(f) || (Math.abs(pos[f.vs[0]*3]*S) > 0.2) || f.vs.every((v) => pos[v*3+1]*S < 0.58 && pos[v*3+2]*S > 0.02) : null, k));
}
meshes.push(buildBelt(meshes.find((m) => m.name === 'suit')));
for (const m of meshes) console.log(m.name, 'verts', m.position.length / 3, 'tris', m.index.length / 3);
fs.writeFileSync(OUT, JSON.stringify({ bones: real, meshes, ankleY: ankleY * S }));
