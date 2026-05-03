function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-GB', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0')
}

function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100)
  const color = value > 0.85 ? 'bg-accent-lime' : value > 0.7 ? 'bg-accent-amber' : 'bg-accent-rose'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/5">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[11px] tabular-nums text-slate-300">{pct}%</span>
    </div>
  )
}

function LatencyChip({ ms }) {
  const tone = ms < 25 ? 'text-accent-lime' : ms < 35 ? 'text-accent-amber' : 'text-accent-rose'
  return <span className={`font-mono text-[11px] tabular-nums ${tone}`}>{ms} ms</span>
}

export default function DataLog({ history }) {
  const rows = history.slice(0, 18)

  return (
    <section className="panel flex h-full flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <span className="panel-title">Live Data Log · WebSocket Stream</span>
          <span className="pill">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-lime" />
            STREAMING
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-500">showing {rows.length} of {history.length}</span>
      </div>

      <div className="scrollbar-thin flex-1 overflow-auto">
        <table className="w-full border-separate border-spacing-0 text-left text-[12px]">
          <thead className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur">
            <tr className="text-[10px] uppercase tracking-widest text-slate-500">
              <th className="border-b border-white/5 px-4 py-2 font-semibold">Timestamp</th>
              <th className="border-b border-white/5 px-3 py-2 font-semibold">Ball ID</th>
              <th className="border-b border-white/5 px-3 py-2 font-semibold">X / Y</th>
              <th className="border-b border-white/5 px-3 py-2 font-semibold">Zone</th>
              <th className="border-b border-white/5 px-3 py-2 font-semibold">Decision</th>
              <th className="border-b border-white/5 px-3 py-2 font-semibold">Confidence</th>
              <th className="border-b border-white/5 px-4 py-2 text-right font-semibold">Latency</th>
            </tr>
          </thead>
          <tbody className="font-mono text-slate-300">
            {rows.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-10 text-center text-slate-500">
                  Waiting for stream…
                </td>
              </tr>
            )}
            {rows.map((r, i) => {
              const isHit = r.hit_miss_decision === 'Hit'
              return (
                <tr
                  key={r.ball_id}
                  className={`group transition ${
                    i === 0 ? 'bg-accent-cyan/[0.06]' : 'hover:bg-white/[0.025]'
                  }`}
                >
                  <td className="border-b border-white/5 px-4 py-2 text-slate-400">
                    <div className="flex items-center gap-2">
                      {i === 0 && (
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-cyan" />
                      )}
                      <span className="tabular-nums">{formatTime(r.timestamp)}</span>
                    </div>
                  </td>
                  <td className="border-b border-white/5 px-3 py-2 text-slate-200 tabular-nums">
                    #{String(r.ball_id).padStart(4, '0')}
                  </td>
                  <td className="border-b border-white/5 px-3 py-2 tabular-nums text-slate-400">
                    {String(r.position.x).padStart(3, '0')}, {String(r.position.y).padStart(3, '0')}
                  </td>
                  <td className="border-b border-white/5 px-3 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        r.zone === 'Kiri'
                          ? 'bg-accent-cyan/15 text-accent-cyan'
                          : 'bg-accent-lime/15 text-accent-lime'
                      }`}
                    >
                      {r.zone}
                    </span>
                  </td>
                  <td className="border-b border-white/5 px-3 py-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isHit
                          ? 'bg-accent-lime/15 text-accent-lime'
                          : 'bg-accent-rose/15 text-accent-rose'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isHit ? 'bg-accent-lime' : 'bg-accent-rose'}`} />
                      {r.hit_miss_decision}
                    </span>
                  </td>
                  <td className="border-b border-white/5 px-3 py-2">
                    <ConfidenceBar value={r.confidence} />
                  </td>
                  <td className="border-b border-white/5 px-4 py-2 text-right">
                    <LatencyChip ms={r.latency_ms} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
