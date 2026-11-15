# Uma's 3D avatar (`public/models/uma.glb`)

How the rigged model used by the hero and the kick buddy was made, so it can be rebuilt or tweaked.
Nothing here runs as part of the site build.

## Inputs

- `makehuman-data-v1@0.0.2` (npm): the MakeHuman 1.1 base mesh, targets, skeleton, skins and proxies as JSON.
- `makehuman-js@0.1.3` (npm): only used at build time, to evaluate MakeHuman's modifiers (`dist/makehuman.js`).
- `three` from this repo's `node_modules`, and Playwright's Chromium.

See `public/models/CREDITS.md` for licences.

## Steps

Make a work directory and serve it on port 8811:

```sh
W=/tmp/avatar && mkdir -p $W && cd $W
npm pack makehuman-data-v1@0.0.2 makehuman-js@0.1.3
tar xzf makehuman-data-v1-0.0.2.tgz && mv package mhdata
tar xzf makehuman-js-0.1.3.tgz && mv package mhjs
ln -s mhdata/public/data data
cp mhjs/dist/makehuman.js .
ln -s <repo>/node_modules/three three
for f in build.html morph.html look.js tex.js; do ln -s <repo>/scripts/avatar/$f; done
python3 -m http.server 8811 &
```

Then:

```sh
S=<repo>/scripts/avatar
node $S/morph.cjs $S/mods.json morphed.json   # 1. body shape from MakeHuman modifiers
node $S/prep.mjs data morphed.json inter.json  # 2. mesh, skeleton, proxies, belt -> one JSON
node $S/export.cjs <repo>/public/models/uma.glb # 3+4. textures, materials, GLB export
```

## What each part does

- `mods.json`: MakeHuman modifiers. Male, early thirties, stocky (weight 0.8), a South Indian mix of the
  ethnic sliders, a round full face, full cheeks, a broad nose and full lips.
- `prep.mjs`: fits the proxies (short01 hair, eyebrow001, Eyelashes01, HighPolyEyes, male_elegantsuit01)
  to the morphed body, hides the body under the clothes but keeps bare feet and an open V at the chest,
  drops the suit's shirt collar and tie, and builds the skeleton (163 bones, rest rotations all identity,
  metres, +y up, facing +z).
- `belt.mjs`: a black belt wrapped round the jacket at the waist, with a knot and two tails.
- `look.js` + `tex.js`: tints the skin medium brown, paints the trimmed beard and moustache and a dark
  scalp under the hair, turns the suit into a white dobok with a black V collar and a crossed inner flap,
  colours the hair black and lifts it into a swept-up shape, and darkens the irises to brown.
- `build.html`: assembles the skinned meshes; `export.cjs` writes the GLB with three's GLTFExporter.
