# CacheBack project website

Website: <https://agentcacheback.github.io/>

Paper and library: <https://github.com/agentcacheback/cacheback>

GitHub Pages serves the root of `main`. This is a static website with no build
step or backend. `.nojekyll` disables Jekyll processing.

Run the existing website checks before publishing, using Node 22 or newer:

```sh
node --check website/assets/app.js
node website/check.mjs
python3 -m http.server 4174 --bind 127.0.0.1
```

The page shows the paper’s Figure 2 beside a short TL;DR, both benchmark plot
groups, recorded demos, and an always-visible citation.

The homepage is `index.html`; its styles, scripts and paper figures are in
`website/assets/`. The main coding video is in `demo/coding/`. The booking
replay reads `demo/trace-w4.json`. Preserve the original video and recorded
measurements; the checks verify displayed results against those recordings.

Code links point to CacheBack. The canonical URL and social preview use the
organization website address.
