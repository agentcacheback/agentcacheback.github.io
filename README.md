# CacheBack project website

Published website: <https://agentcacheback.github.io/>

Paper and library: <https://github.com/agentcacheback/cacheback>

GitHub Pages serves the root of `main`. This is a static website with no build
step or backend. `.nojekyll` disables Jekyll processing.

Run the existing website checks before publishing, using Node 22 or newer:

```sh
node --check website/assets/app.js
node website/check.mjs
python3 -m http.server 4177 --bind 127.0.0.1
```

The page opens with the full paper title. Each figure has a reading guide; benchmark setups include diagrams of the parallel fan-in and sequential chain. The booking guide distinguishes selected source positions from generated text messages.

The TL;DR appears in the hero above the resource buttons. The page shows the paper’s Figure 2, both benchmark plot
groups, an open booking replay, and an always-visible citation. The order is hero (TLDR, links, chart), method animation, coding video, full results, then interactive document Q&A. The booking replay frames the recorded chain as multi-hop Q&A over supplied unstructured documents. This recording does not perform live document search. Copy icons briefly confirm success before fading back.

The homepage is `index.html`; its styles, scripts and paper figures are in
`website/assets/`. The main coding video is in `demo/coding/`. The booking
replay reads `demo/trace-w4.json`. Preserve the original video and recorded
measurements; the checks verify displayed results against those recordings.

Code links point to CacheBack. The canonical URL and social preview use the
organization website address. `social-preview.jpg` is the homepage/results
image used for link previews; the coding video keeps its own poster and preloads so playback can start promptly.

The website uses `demo/coding/cacheback-coding-4k.mp4` and its matching poster,
rendered from the separate CacheBack-focused video variant. The original MP4
and poster remain here for comparison. The new version removes the project
panel and chat navigation, uses a code icon, and shows CacheBack in primary
teal in the model selector. Recorded outputs and measurements are unchanged.

Figure 2 is a scalable SVG redrawn from the paper asset, with the four legend entries below the diagram.

The method animation renders directly in the page with a single play/pause button. Its SVG and caption take their natural height, so there is no inner frame or scrolling viewport. `demo/communication.html` remains a standalone view; both views share `demo/communication.js` and `demo/communication.css`. It uses only local assets and works with the same static deployment on GitHub Pages or Hugging Face Spaces.

The final animation caption distinguishes source token IDs from continuous latent vectors. The receiver prefills both to build its own state; the caption does not imply that latent steps require transferring KV entries.

Benchmark plot labels use compression factors (4×, 16×); legends distinguish these from fixed position budgets and text sender sizes.

Chart values sit before their own bars, column dividers are separated, and the 16× operating point is described directly. Original recordings and measurements are unchanged. Serve this directory on port 4177 to review locally.
Accuracy gains sit beside right-end brackets spanning each accuracy bar pair.
The measured bar widths and shared scales are unchanged.

The replay shows the full original documents, in recorded order. Position strips and handoff indicators appear above the documents. Teal highlights and position strips use the recording's selection masks; animated packets illustrate state handoffs while the text channel generates its actual messages. Selection and streaming motion is illustrative, with each channel paced by its measured completion times. Documents and generated messages remain individually scrollable; the outer frame grows with its contents. The layout, styles, and playback are in `demo/index.html`, `demo/replay.css`, and `demo/replay.js`. Source text, selections, model outputs, and timings are unchanged.

The scenario guide introduces question answering over a partitioned document collection and distinguishes text messages from selected internal state and latent thoughts. The recorded miniature has three source-document agents and a fourth answering agent; its `latent_steps` is zero, so the guide identifies this replay specifically as selected-state handoffs. It does not claim four source contexts or live retrieval over a large corpus.

The guide also identifies the visible document inputs and explains that Agents
2 and 3 receive the previous handoff with their new document, while Agent 4
answers from the final handoff alone. The text row contains generated messages.

The hero 🤗 HF button links directly to the paper’s Daily Papers page.
