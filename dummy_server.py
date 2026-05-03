"""SmartPing — dummy WebSocket server (lokal)

Dipakai sebagai pengganti pipeline YOLOv8 + launcher hardware
selama hardware masih dirakit (status: minggu 3 / 8).

Fungsi:
  - Membuka WebSocket di ws://localhost:8765
  - Mengirim payload JSON kasaran (sesuai kontrak API antar modul)
    setiap 1.5 detik ke setiap client yang connect.
  - Memungkinkan rekan modul lain (mikrokontroller emulator, MQTT
    bridge, dsb.) ikut subscribe ke stream yang sama, sehingga
    mereka bisa mulai integrasi tanpa menunggu hardware jadi.

Catatan:
  - Dashboard versi minggu 3 (index.html / dashboard.js) saat ini
    masih pakai simulator JS internal supaya tetap jalan langsung
    di GitHub Pages tanpa server. File ini disiapkan untuk uji
    lintas modul di laptop lokal, dan akan jadi titik sambung
    ke WebSocket asli pada minggu 6.

Cara pakai:
  pip install websockets
  python dummy_server.py

Lalu di browser bisa dites dengan DevTools console:
  const ws = new WebSocket("ws://localhost:8765");
  ws.onmessage = e => console.log(JSON.parse(e.data));
"""

import asyncio
import json
import random
from datetime import datetime, timezone

try:
    import websockets
except ImportError as e:
    raise SystemExit(
        "Modul 'websockets' belum ter-install. Jalankan: pip install websockets"
    ) from e


HOST = "0.0.0.0"
PORT = 8765
TICK_SECONDS = 1.5

TABLE_W = 640
TABLE_H = 360


def generate_payload(ball_id: int) -> dict:
    """Bentuk payload mengikuti kontrak API antar modul (lihat README)."""
    x = random.randint(20, TABLE_W - 20)
    y = random.randint(20, TABLE_H - 20)
    zone = "Kiri" if x < TABLE_W / 2 else "Kanan"

    # Bias miss di pinggir, mirip simulator JS-nya.
    edge = (
        min(x, TABLE_W - x) / (TABLE_W / 2)
        + min(y, TABLE_H - y) / (TABLE_H / 2)
    )
    miss_chance = 0.6 - edge * 0.18
    decision = "Miss" if random.random() < miss_chance else "Hit"

    confidence = max(
        0.55,
        min(0.99, random.uniform(0.78, 0.97) - (0.2 if random.random() < 0.08 else 0.0)),
    )

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(timespec="milliseconds"),
        "ball_id": ball_id,
        "position": {"x": x, "y": y},
        "zone": zone,
        "confidence": round(confidence, 2),
        "latency_ms": random.randint(14, 42),
        "model": "YOLOv8n",
        "servo_angle": random.randint(15, 75),
        "hit_miss_decision": decision,
    }


# Set client yang sedang connect (broadcast).
clients: set[websockets.WebSocketServerProtocol] = set()


async def handler(ws):
    clients.add(ws)
    print(f"[+] client connect ({len(clients)} total)")
    try:
        async for _ in ws:
            # Sementara kita abaikan pesan dari client.
            pass
    finally:
        clients.discard(ws)
        print(f"[-] client disconnect ({len(clients)} total)")


async def broadcaster():
    ball_id = 100
    while True:
        ball_id += 1
        payload = generate_payload(ball_id)
        if clients:
            message = json.dumps(payload)
            await asyncio.gather(
                *(c.send(message) for c in list(clients)),
                return_exceptions=True,
            )
            print(
                f"-> #{ball_id:04d}  {payload['zone']:5s}  "
                f"{payload['hit_miss_decision']:4s}  conf={payload['confidence']}"
            )
        await asyncio.sleep(TICK_SECONDS)


async def main():
    print(f"SmartPing dummy WS server -> ws://{HOST}:{PORT}")
    print(f"Tick: {TICK_SECONDS}s. Tekan Ctrl+C untuk berhenti.\n")
    async with websockets.serve(handler, HOST, PORT):
        await broadcaster()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nbye")
