import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const COLORS = {
  Kiri: '#22d3ee',
  Kanan: '#b6ff3b',
}

function ConfidenceMeter({ value = 0 }) {
  const pct = Math.max(0, Math.min(1, value))
  const stroke = pct > 0.85 ? '#b6ff3b' : pct > 0.7 ? '#f59e0b' : '#f43f5e'
  const r = 36
  const c = 2 * Math.PI * r
  return (
    <div className="relative flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - c * pct}
          transform="rotate(-90 48 48)"
          style={{ transition: 'stroke-dashoffset 600ms ease-out, stroke 300ms ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-xl font-bold tabular-nums text-slate-50">
          {(pct * 100).toFixed(0)}
          <span className="text-xs text-slate-400">%</span>
        </span>
        <span className="text-[9px] uppercase tracking-widest text-slate-500">conf.</span>
      </div>
    </div>
  )
}

function ServoDial({ angle = 0 }) {
  const a = Math.max(0, Math.min(90, angle))
  // Map 0–90 → -45° to 45°
  const rotation = -45 + a
  return (
    <div className="relative flex h-24 items-end justify-center">
      <svg viewBox="0 0 120 70" className="h-full w-full">
        <defs>
          <linearGradient id="dial" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#b6ff3b" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
        <path d="M10 60 A 50 50 0 0 1 110 60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" />
        <path d="M10 60 A 50 50 0 0 1 110 60" fill="none" stroke="url(#dial)" strokeWidth="8" strokeLinecap="round" strokeDasharray="158 200" />
        <g transform={`rotate(${rotation} 60 60)`} style={{ transition: 'transform 500ms ease-out' }}>
          <line x1="60" y1="60" x2="60" y2="18" stroke="#f5f5f5" strokeWidth="3" strokeLinecap="round" />
          <circle cx="60" cy="60" r="5" fill="#f5f5f5" />
        </g>
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="font-mono text-xl font-bold tabular-nums text-slate-50">
          {a.toFixed(0)}
          <span className="text-xs text-slate-400">°</span>
        </span>
        <span className="text-[9px] uppercase tracking-widest text-slate-500">servo</span>
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-white/10 bg-ink-900/95 px-3 py-2 font-mono text-xs text-slate-200 shadow-xl">
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function Analytics({ history, latest }) {
  const stats = useMemo(() => {
    const init = {
      Kiri: { hits: 0, misses: 0 },
      Kanan: { hits: 0, misses: 0 },
    }
    for (const h of history) {
      const bucket = init[h.zone]
      if (!bucket) continue
      if (h.hit_miss_decision === 'Hit') bucket.hits += 1
      else bucket.misses += 1
    }
    return init
  }, [history])

  const data = [
    { zone: 'Kiri', Hit: stats.Kiri.hits, Miss: stats.Kiri.misses },
    { zone: 'Kanan', Hit: stats.Kanan.hits, Miss: stats.Kanan.misses },
  ]

  const decision = latest?.hit_miss_decision
  const decisionTone =
    decision === 'Hit'
      ? 'border-accent-lime/40 bg-accent-lime/10 text-accent-lime shadow-glow'
      : decision === 'Miss'
      ? 'border-accent-rose/40 bg-accent-rose/10 text-accent-rose shadow-glow-rose'
      : 'border-white/10 bg-white/5 text-slate-400'

  return (
    <section className="panel flex h-full flex-col">
      <div className="panel-header">
        <span className="panel-title">Analytics · Zone Distribution</span>
        <div className="flex items-center gap-2">
          <span className="pill">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
            Kiri {stats.Kiri.hits + stats.Kiri.misses}
          </span>
          <span className="pill">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-lime" />
            Kanan {stats.Kanan.hits + stats.Kanan.misses}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="h-48 w-full">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <XAxis
                dataKey="zone"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: 6 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="Hit" stackId="a" fill="#b6ff3b" radius={[0, 0, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[data[i].zone]} fillOpacity={0.95} />
                ))}
              </Bar>
              <Bar dataKey="Miss" stackId="a" fill="#f43f5e" radius={[6, 6, 0, 0]} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/5 bg-ink-900/60 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="stat-label">Kiri (Left)</span>
              <span className="font-mono text-[10px] text-accent-cyan">
                {stats.Kiri.hits + stats.Kiri.misses === 0
                  ? '—'
                  : `${Math.round((stats.Kiri.hits / Math.max(1, stats.Kiri.hits + stats.Kiri.misses)) * 100)}% hit`}
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-2xl font-bold text-accent-lime">{stats.Kiri.hits}</span>
              <span className="font-mono text-sm text-accent-rose">/ {stats.Kiri.misses}</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500">hit / miss</span>
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-ink-900/60 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="stat-label">Kanan (Right)</span>
              <span className="font-mono text-[10px] text-accent-lime">
                {stats.Kanan.hits + stats.Kanan.misses === 0
                  ? '—'
                  : `${Math.round((stats.Kanan.hits / Math.max(1, stats.Kanan.hits + stats.Kanan.misses)) * 100)}% hit`}
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-2xl font-bold text-accent-lime">{stats.Kanan.hits}</span>
              <span className="font-mono text-sm text-accent-rose">/ {stats.Kanan.misses}</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500">hit / miss</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-ink-900/60 p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="panel-title">Active Throw</span>
            <span className="font-mono text-[10px] text-slate-500">
              {latest ? `#${String(latest.ball_id).padStart(4, '0')}` : '—'}
            </span>
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <div className="flex flex-col items-center">
              <ServoDial angle={latest?.servo_angle ?? 0} />
            </div>
            <div className="flex flex-col items-center">
              <ConfidenceMeter value={latest?.confidence ?? 0} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="stat-label">ML Decision</span>
              <div
                className={`flex w-full items-center justify-center rounded-lg border px-3 py-3 font-mono text-sm font-bold uppercase tracking-widest transition ${decisionTone}`}
              >
                {decision ?? 'Idle'}
              </div>
              <span className="font-mono text-[10px] text-slate-500">
                {latest ? `${latest.zone} · ${latest.model}` : 'awaiting frame'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
