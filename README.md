# SmartPing — Live Training Telemetry

A real-time monitoring dashboard for **SmartPing**, an AI-based table tennis
training system. The hardware adaptively launches balls; a YOLOv8 camera
pipeline detects ball positions and the player's hit/miss outcomes, streaming
the results to this UI over WebSockets.

> The physical rig and the WebSocket server are still under development. To
> exercise the dashboard end-to-end, this project ships a **client-side dummy
> simulator** that emits a randomized valid payload every 1.5 seconds.

## Stack

- **React 18** (functional components + hooks)
- **Vite** dev server / bundler
- **Tailwind CSS** (dark, sport-analytics aesthetic)
- **Recharts** for chart visualizations
- Pure SVG for the top-down table render and miss heatmap

## Run

```bash
npm install
npm run dev
```

Open <http://localhost:5173>.

## Project layout

```
src/
  App.jsx                       composes the dashboard
  hooks/useDummyWebSocket.js    setInterval-based payload simulator
  components/
    Header.jsx                  service status + session metrics
    TableVisualization.jsx      top-down table, ball plot, miss heatmap
    Analytics.jsx               zone bar chart + active-throw metrics
    DataLog.jsx                 live data table (most recent at top)
    StatusDot.jsx               reusable connection indicator
```

## Deploying to GitHub Pages (Deploy from a branch)

The workflow at `.github/workflows/deploy.yml` builds the app on every push to
`main` (or the active feature branch) and force-pushes the `dist/` output to
an orphan `gh-pages` branch.

One-time setup in the repo on github.com:

1. Push to a tracked branch — the workflow will create the `gh-pages` branch.
2. **Settings → Pages → Build and deployment**:
   - **Source**: *Deploy from a branch*
   - **Branch**: `gh-pages` · `/ (root)`
3. The site will be live at `https://<owner>.github.io/vibecodedaislop/`.

`vite.config.js` defaults `base` to `/vibecodedaislop/` so assets resolve
correctly under the project-page subpath. If you serve from a custom domain or
a user/organization page (root path), build with:

```bash
BASE_PATH=/ npm run build
```

## Swapping the simulator for a real WebSocket

`useDummyWebSocket.js` exposes the same `{ latest, history, connected }`
shape that a real WS hook would. Replace the body with a `new WebSocket(url)`
that calls `setLatest` / `setHistory` on each `message` event and the rest of
the dashboard keeps working unchanged.
