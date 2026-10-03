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

The page opens with the full paper title. Each figure has a reading guide; benchmark setups include diagrams of the parallel fan-in and sequential chain. The booking guide distinguishes selected source positions from generated text messages.

The TL;DR appears in the hero above the resource buttons. The page shows the paper’s Figure 2, both benchmark plot
groups, an open booking replay, and an always-visible citation. The booking replay
comes before Figure 2; the coding video follows the results. Copy icons briefly confirm success before fading back.

The homepage is `index.html`; its styles, scripts and paper figures are in
`website/assets/`. The main coding video is in `demo/coding/`. The booking
replay reads `demo/trace-w4.json`. Preserve the original video and recorded
measurements; the checks verify displayed results against those recordings.

Code links point to CacheBack. The canonical URL and social preview use the
organization website address. `social-preview.jpg` is the homepage/results
image used for link previews; the coding video keeps its own poster and preloads so playback can start promptly.

Figure 2 is a scalable SVG redrawn from the paper asset, with the four legend entries below the diagram.

Figure 2 now embeds the supplied animation in `demo/communication.html`, with a single play/pause button on the figure. The section expands to fit the entire animation and caption, without an inner scrollbar. Frame height follows the stage’s layout height, including caption changes during playback. It uses only local assets and works with the same static deployment on GitHub Pages or Hugging Face Spaces.

Benchmark plot labels use compression factors (4×, 16×); legends distinguish these from fixed position budgets and text sender sizes.
