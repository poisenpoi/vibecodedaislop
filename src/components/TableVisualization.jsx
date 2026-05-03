import { useMemo, useState } from 'react'

const VIEW_W = 640
const VIEW_H = 360
const HEAT_COLS = 16
const HEAT_ROWS = 9

function buildHeatmap(misses) {
  const grid = Array.from({ length: HEAT_ROWS }, () => new Array(HEAT_COLS).fill(0))
  let max = 0
  for (const m of misses) {
    const cx = Math.min(HEAT_COLS - 1, Math.floor((m.position.x / VIEW_W) * HEAT_COLS))
    const cy = Math.min(HEAT_ROWS - 1, Math.floor((m.position.y / VIEW_H) * HEAT_ROWS))
    grid[cy][cx] += 1
    if (grid[cy][cx] > max) max = grid[cy][cx]
  }
  return { grid, max }
}

function heatColor(value, max) {
  if (max === 0 || value === 0) return 'transparent'
  const t = value / max
  // Cyan (low) → Amber (mid) → Rose (high)
  if (t < 0.5) {
    const k = t / 0.5
    const r = Math.round(34 + (245 - 34) * k)
    const g = Math.round(211 + (158 - 211) * k)
    const b = Math.round(238 + (11 - 238) * k)
    return `rgba(${r}, ${g}, ${b}, ${0.25 + 0.45 * t})`
  }
  const k = (t - 0.5) / 0.5
  const r = Math.round(245 + (244 - 245) * k)
  const g = Math.round(158 + (63 - 158) * k)
  const b = Math.round(11 + (94 - 11) * k)
  return `rgba(${r}, ${g}, ${b}, ${0.45 + 0.45 * t})`
}

export default function TableVisualization({ history, latest }) {
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [showTrails, setShowTrails] = useState(true)

  const misses = useMemo(() => history.filter((h) => h.hit_miss_decision === 'Miss'), [history])
  const heat = useMemo(() => buildHeatmap(misses), [misses])

  const recent = history.slice(0, 12)
  const cellW = VIEW_W / HEAT_COLS
  const cellH = VIEW_H / HEAT_ROWS

  return (
    <section className="panel flex h-full flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <span className="panel-title">Table View · Top-Down</span>
          <span className="pill">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
            {history.length} samples
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTrails((v) => !v)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition ${
              showTrails
                ? 'bg-accent-cyan/15 text-accent-cyan ring-1 ring-accent-cyan/40'
                : 'bg-white/5 text-slate-400 hover:text-slate-200'
            }`}
          >
            Trails
          </button>
          <button
            onClick={() => setShowHeatmap((v) => !v)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition ${
              showHeatmap
                ? 'bg-accent-rose/15 text-accent-rose ring-1 ring-accent-rose/40'
                : 'bg-white/5 text-slate-400 hover:text-slate-200'
            }`}
          >
            Miss Heatmap
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#0a3a2e] via-[#0a4736] to-[#06241c] shadow-inner">
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </pattern>
              <linearGradient id="kiriGlow" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="rgba(34,211,238,0.20)" />
                <stop offset="100%" stopColor="rgba(34,211,238,0)" />
              </linearGradient>
              <linearGradient id="kananGlow" x1="1" x2="0" y1="0" y2="0">
                <stop offset="0%" stopColor="rgba(182,255,59,0.20)" />
                <stop offset="100%" stopColor="rgba(182,255,59,0)" />
              </linearGradient>
            </defs>

            {/* Table playing surface */}
            <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#grid)" />

            {/* Side glows */}
            <rect x="0" y="0" width={VIEW_W / 2} height={VIEW_H} fill="url(#kiriGlow)" />
            <rect x={VIEW_W / 2} y="0" width={VIEW_W / 2} height={VIEW_H} fill="url(#kananGlow)" />

            {/* Outer table border */}
            <rect
              x="6"
              y="6"
              width={VIEW_W - 12}
              height={VIEW_H - 12}
              fill="none"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="2"
              rx="4"
            />

            {/* Center net */}
            <line
              x1={VIEW_W / 2}
              y1="0"
              x2={VIEW_W / 2}
              y2={VIEW_H}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="3"
              strokeDasharray="6 4"
            />

            {/* Center horizontal service line */}
            <line
              x1="6"
              y1={VIEW_H / 2}
              x2={VIEW_W - 6}
              y2={VIEW_H / 2}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />

            {/* Heatmap overlay */}
            {showHeatmap &&
              heat.grid.map((row, ry) =>
                row.map((v, rx) => (
                  <rect
                    key={`${rx}-${ry}`}
                    x={rx * cellW}
                    y={ry * cellH}
                    width={cellW}
                    height={cellH}
                    fill={heatColor(v, heat.max)}
                  />
                )),
              )}

            {/* Trails (older balls fade out) */}
            {showTrails &&
              recent.slice(1).map((p, idx) => {
                const opacity = 1 - (idx + 1) / recent.length
                const fill = p.hit_miss_decision === 'Hit' ? '#b6ff3b' : '#f43f5e'
                return (
                  <circle
                    key={p.ball_id}
                    cx={p.position.x}
                    cy={p.position.y}
                    r={4}
                    fill={fill}
                    opacity={opacity * 0.6}
                  />
                )
              })}

            {/* Latest ball position with halo */}
            {latest && (
              <g>
                <circle
                  cx={latest.position.x}
                  cy={latest.position.y}
                  r="14"
                  fill="none"
                  stroke={latest.hit_miss_decision === 'Hit' ? '#b6ff3b' : '#f43f5e'}
                  strokeWidth="1.5"
                  opacity="0.6"
                >
                  <animate attributeName="r" from="6" to="20" dur="1.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.7" to="0" dur="1.4s" repeatCount="indefinite" />
                </circle>
                <circle
                  cx={latest.position.x}
                  cy={latest.position.y}
                  r="6"
                  fill={latest.hit_miss_decision === 'Hit' ? '#b6ff3b' : '#f43f5e'}
                  stroke="#fff"
                  strokeWidth="1.5"
                />
              </g>
            )}
          </svg>

          {/* Zone labels */}
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-between px-5 font-mono text-[11px] uppercase tracking-[0.25em] text-white/70">
            <span className="rounded bg-black/30 px-2 py-0.5 backdrop-blur-sm">◀ Kiri</span>
            <span className="rounded bg-black/30 px-2 py-0.5 backdrop-blur-sm">Kanan ▶</span>
          </div>
          {latest && (
            <div className="pointer-events-none absolute bottom-3 right-4 rounded-md border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[10px] text-slate-200 backdrop-blur-sm">
              x:{latest.position.x.toString().padStart(3, '0')} · y:{latest.position.y.toString().padStart(3, '0')}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-lime" /> Hit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-rose" /> Miss
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-6 rounded bg-gradient-to-r from-accent-cyan via-accent-amber to-accent-rose" />
              Miss density
            </span>
          </div>
          <span className="font-mono text-slate-500">
            {misses.length} miss · {history.length - misses.length} hit
          </span>
        </div>
      </div>
    </section>
  )
}
