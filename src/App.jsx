import { useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import TableVisualization from './components/TableVisualization.jsx'
import Analytics from './components/Analytics.jsx'
import DataLog from './components/DataLog.jsx'
import { useDummyWebSocket } from './hooks/useDummyWebSocket.js'

export default function App() {
  const { latest, history, connected } = useDummyWebSocket(1500)

  // Hold session start so the duration timer is stable across renders.
  const sessionStart = useRef(Date.now()).current

  // Camera FPS oscillates around a healthy YOLOv8n value.
  const [fps, setFps] = useState(58)
  useEffect(() => {
    const id = setInterval(() => {
      setFps((prev) => {
        const drift = (Math.random() - 0.5) * 4
        return Math.max(45, Math.min(62, prev + drift))
      })
    }, 1200)
    return () => clearInterval(id)
  }, [])

  const avgConfidence = useMemo(() => {
    if (!history.length) return null
    const window = history.slice(0, 30)
    const sum = window.reduce((acc, h) => acc + h.confidence, 0)
    return sum / window.length
  }, [history])

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 p-4 lg:p-6">
      <Header
        wsConnected={connected}
        totalBalls={history.length}
        avgConfidence={avgConfidence}
        fps={fps}
        sessionStart={sessionStart}
      />

      <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TableVisualization history={history} latest={latest} />
        </div>
        <div className="xl:col-span-1">
          <Analytics history={history} latest={latest} />
        </div>
      </div>

      <div className="min-h-[320px]">
        <DataLog history={history} />
      </div>

      <footer className="flex items-center justify-between px-1 pb-2 text-[10px] uppercase tracking-widest text-slate-600">
        <span>SmartPing Telemetry · v0.1</span>
        <span className="font-mono">
          ws://smartping.local:8765 · simulated stream @ 1.5s
        </span>
      </footer>
    </div>
  )
}
