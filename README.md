# umamaheswaran.com

My blog, built with [Astro](https://astro.build) and hosted free on GitHub Pages.
Every push to `main` rebuilds and publishes the site (see `.github/workflows/deploy.yml`).

## Run it locally

Needs Node 22.23 or newer (Node 24 recommended).

```sh
npm install
npm run dev      # http://localhost:4321, live reload
npm run build    # production build into dist/
```

## Write a new post

1. Create a folder named `YYYY-MM-DD-your-post-slug` in `src/content/blog/`.
2. Add an `index.md` inside it:

   ```md
   ---
   title: "My new post"
   description: "One or two sentences shown in lists and search results."
   pubDate: 2026-11-20
   categories: ["Software Development"]
   heroImage: "./cover.jpg"   # optional, put the image in the same folder
   draft: true                # optional, hides the post outside `npm run dev`
   ---

   Write in Markdown here. Images: ![alt text](./diagram.png)
   ```

3. Commit and push. The post appears at `/YYYY/MM/DD/your-post-slug/`.

## Where things are

| What | Where |
|---|---|
| Posts | `src/content/blog/` |
| Site name, description, social links | `src/consts.ts` |
| Colours and typography | `src/styles/global.css` |
| About page | `src/pages/about-me.astro` |
| Comments archived from WordPress | `src/data/comments.json` |
| WordPress importer (already run) | `scripts/import-wordpress.mjs` |
