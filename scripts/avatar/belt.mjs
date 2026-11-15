// Builds a black belt (band + knot + two hanging tails) wrapped around the jacket, skinned by copying
// the weights of the nearest jacket vertex.
export function buildBelt(suit) {
  const P = suit.position, n = P.length / 3;
  const Y = 0.13, HW = 0.022, TH = 0.006;
  const cx = 0, cz = 0.03;
  const N = 72, rad = new Float64Array(N).fill(0);
  for (let i = 0; i < n; i++) {
    const y = P[i*3+1]; if (y < Y - 0.035 || y > Y + 0.035) continue;
    const x = P[i*3] - cx, z = P[i*3+2] - cz; if (Math.abs(P[i*3]) > 0.3) continue;
    const a = Math.atan2(x, z); const b = ((Math.round(a / (2*Math.PI) * N) % N) + N) % N;
    rad[b] = Math.max(rad[b], Math.hypot(x, z));
  }
  // fill gaps + smooth
  for (let k = 0; k < 3; k++) for (let b = 0; b < N; b++) if (!rad[b]) rad[b] = Math.max(rad[(b+1)%N], rad[(b+N-1)%N]);
  let r = Array.from(rad);
  for (let it = 0; it < 4; it++) r = r.map((v, b) => Math.max(v, (r[(b+1)%N] + r[(b+N-1)%N] + v) / 3));
  const out = { position: [], uv: [], index: [], skinIndex: [], skinWeight: [] };
  const nearest = (x, y, z) => { let best = 1e9, bi = 0; for (let i = 0; i < n; i++) { const dx = P[i*3]-x, dy = P[i*3+1]-y, dz = P[i*3+2]-z; const d = dx*dx+dy*dy+dz*dz; if (d < best) { best = d; bi = i; } } return bi; };
  const vert = (x, y, z, u, v, skinFrom) => {
    const k = out.position.length / 3; out.position.push(x, y, z); out.uv.push(u, v);
    const s = skinFrom ?? nearest(x, y, z);
    for (let j = 0; j < 4; j++) { out.skinIndex.push(suit.skinIndex[s*4+j]); out.skinWeight.push(suit.skinWeight[s*4+j]); }
    return k;
  };
  const quad = (a, b, c, d) => out.index.push(a, b, c, a, c, d);
  // band: ring of 4 verts per segment (outer top/bottom, inner bottom/top)
  const ring = [];
  for (let b = 0; b <= N; b++) {
    const a = b / N * 2 * Math.PI; const rr = r[b % N] + 0.004; const sx = Math.sin(a), sz = Math.cos(a);
    const yy = Y + 0.004 * Math.sin(a * 2); // slight tilt so it does not look machine-made
    const xo = cx + sx * (rr + TH), zo = cz + sz * (rr + TH), xi = cx + sx * rr, zi = cz + sz * rr;
    const s = nearest(xi, yy, zi);
    ring.push([vert(xo, yy + HW, zo, b / N, 0, s), vert(xo, yy - HW, zo, b / N, 0.25, s), vert(xi, yy - HW, zi, b / N, 0.5, s), vert(xi, yy + HW, zi, b / N, 0.75, s)]);
  }
  for (let b = 0; b < N; b++) { const A = ring[b], B = ring[b+1]; for (let j = 0; j < 4; j++) quad(A[j], A[(j+1)%4], B[(j+1)%4], B[j]); }
  // knot: a rounded box on the front, plus two tails
  const front = r[0] + 0.004 + TH;
  const box = (x0, y0, z0, w, h, dpt, rot = 0, skin) => {
    const c = []; for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      let x = sx * w / 2, y = sy * h / 2; const z = sz * dpt / 2;
      const xr = x * Math.cos(rot) - y * Math.sin(rot), yr = x * Math.sin(rot) + y * Math.cos(rot);
      c.push(vert(x0 + xr, y0 + yr, z0 + z, (sx + 1) / 4, (sy + 1) / 4, skin));
    }
    const f = [[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]];
    for (const q of f) quad(c[q[0]], c[q[1]], c[q[2]], c[q[3]]);
  };
  const ks = nearest(0, Y, cz + front);
  box(0, Y, cz + front + 0.008, 0.05, 0.05, 0.018, 0.12, ks);
  // tails: slightly splayed strips hanging from the knot
  for (const side of [-1, 1]) {
    const segs = 6, len = 0.24;
    let prev = null;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs; const y = Y - 0.02 - t * len; const x = side * (0.012 + t * 0.035); const z = cz + front + 0.012 + 0.01 * Math.sin(t * 3) + (side > 0 ? 0.004 : 0);
      const rot = side * 0.18;
      const w = 0.021, th = 0.0045;
      const pts = [[-w, th], [w, th], [w, -th], [-w, -th]].map(([a, b]) => vert(x + a * Math.cos(rot), y + a * Math.sin(rot), z + b, t, (a > 0 ? 0.5 : 0) + (b > 0 ? 0.25 : 0), ks));
      if (prev) for (let j = 0; j < 4; j++) quad(prev[j], pts[j], pts[(j+1)%4], prev[(j+1)%4]);
      else quad(pts[0], pts[1], pts[2], pts[3]);
      prev = pts;
    }
    quad(prev[3], prev[2], prev[1], prev[0]);
  }
  return { name: 'belt', material: 'belt', ...out };
}
