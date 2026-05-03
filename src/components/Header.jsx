import { useEffect, useState } from 'react'
import StatusDot from './StatusDot.jsx'

const SERVICES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'ws', label: 'WebSocket' },
  { key: 'camera', label: 'Camera + YOLOv8' },
  { key: 'launcher', label: 'Hardware Launcher' },
  { key: 'mqtt', label: 'MQTT Broker' },
]

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const s = String(totalSeconds % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export default function Header({ wsConnected, totalBalls, avgConfidence, fps, sessionStart }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // Camera + launcher come online ~1s after the WS handshake; MQTT ~2s.
  const elapsed = now - sessionStart
  const services = {
    dashboard: true,
    ws: wsConnected,
    camera: wsConnected && elapsed > 1000,
    launcher: wsConnected && elapsed > 1500,
    mqtt: wsConnected && elapsed > 2200,
  }

  const metrics = [
    {
      label: 'Balls Launched',
      value: totalBalls,
      hint: 'session total',
      accent: 'text-accent-lime',
    },
    {
      label: 'YOLOv8 Avg. Confidence',
      value: avgConfidence != null ? `${(avgConfidence * 100).toFixed(1)}%` : '—',
      hint: 'rolling',
      accent: 'text-accent-cyan',
    },
    {
      label: 'Camera FPS',
      value: fps != null ? fps.toFixed(0) : '—',
      hint: 'YOLOv8n',
      accent: 'text-accent-violet',
    },
    {
      label: 'Session Duration',
      value: formatDuration(elapsed),
      hint: 'live',
      accent: 'text-slate-100',
    },
  ]

  return (
    <header className="panel">
      <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-lime/20 to-accent-cyan/20 ring-1 ring-white/10">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent-lime" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M3.6 9h16.8M3.6 15h16.8M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-50">SmartPing</h1>
              <span className="pill border-accent-lime/30 bg-accent-lime/10 text-accent-lime">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-lime animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Adaptive Training Telemetry · YOLOv8 + Servo Launcher
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {SERVICES.map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <StatusDot online={services[s.key]} />
              <span className="text-xs font-medium text-slate-300">{s.label}</span>
              <span
                className={`font-mono text-[10px] uppercase ${
                  services[s.key] ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {services[s.key] ? 'online' : 'offline'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-white/5 bg-white/5 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-ink-800/80 px-5 py-4">
            <div className="flex items-baseline justify-between">
              <span className="stat-label">{m.label}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-600">{m.hint}</span>
            </div>
            <div className={`mt-1 ${m.accent} stat-value`}>{m.value}</div>
          </div>
        ))}
      </div>
    </header>
  )
}
