import { useEffect, useRef, useState } from 'react'

const TABLE_WIDTH = 640
const TABLE_HEIGHT = 360
const MODELS = ['YOLOv8n', 'YOLOv8s']

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function generatePayload(prevId) {
  const x = Math.round(randomBetween(20, TABLE_WIDTH - 20))
  const y = Math.round(randomBetween(20, TABLE_HEIGHT - 20))
  const zone = x < TABLE_WIDTH / 2 ? 'Kiri' : 'Kanan'

  // Confidence trends higher for cleaner detections, with occasional dips.
  const confidence = Math.min(
    0.99,
    Math.max(0.55, randomBetween(0.78, 0.97) - (Math.random() < 0.08 ? 0.2 : 0)),
  )

  // Misses are more likely near the edges; biases for realistic feel.
  const edgeFactor =
    Math.min(x, TABLE_WIDTH - x) / (TABLE_WIDTH / 2) +
    Math.min(y, TABLE_HEIGHT - y) / (TABLE_HEIGHT / 2)
  const missChance = 0.62 - edgeFactor * 0.18
  const decision = Math.random() < missChance ? 'Miss' : 'Hit'

  return {
    timestamp: new Date().toISOString(),
    ball_id: prevId + 1,
    position: { x, y },
    zone,
    confidence: Number(confidence.toFixed(2)),
    latency_ms: Math.round(randomBetween(14, 42)),
    model: MODELS[Math.random() < 0.85 ? 0 : 1],
    servo_angle: Math.round(randomBetween(15, 75)),
    hit_miss_decision: decision,
  }
}

export function useDummyWebSocket(intervalMs = 1500) {
  const [latest, setLatest] = useState(null)
  const [history, setHistory] = useState([])
  const [connected, setConnected] = useState(false)
  const ballIdRef = useRef(123)

  useEffect(() => {
    // Simulate the connection handshake.
    const handshake = setTimeout(() => setConnected(true), 600)

    const tick = setInterval(() => {
      const payload = generatePayload(ballIdRef.current)
      ballIdRef.current = payload.ball_id
      setLatest(payload)
      setHistory((prev) => {
        const next = [payload, ...prev]
        return next.length > 200 ? next.slice(0, 200) : next
      })
    }, intervalMs)

    return () => {
      clearTimeout(handshake)
      clearInterval(tick)
    }
  }, [intervalMs])

  return { latest, history, connected, tableWidth: TABLE_WIDTH, tableHeight: TABLE_HEIGHT }
}
