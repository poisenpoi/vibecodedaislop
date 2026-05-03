# SmartPing — Dashboard Monitoring (Prototype)

Dashboard monitoring real-time untuk **SmartPing**, sistem latihan tenis meja
adaptif berbasis CV (YOLOv8) + launcher hardware.

> **Status: Minggu 3 / 8 — prototype kasaran.**
> Mockup awal dashboard sudah jalan di browser dengan dummy data lokal.
> Heatmap, chart real, dan sambungan WebSocket asli ke modul YOLOv8 / MQTT
> menyusul di minggu berikutnya.

## Yang sudah ada di minggu 3

- Layout dashboard kasaran (header, status modul, metrik, viz meja, log).
- Visualisasi meja top-down sederhana via SVG, posisi bola di-update tiap tick.
- Statistik zona Kiri / Kanan pakai bar HTML kasar (belum Chart.js).
- Tabel log data real-time, baris terbaru di atas, dengan highlight singkat.
- **Dummy data simulator** di-browser (`dashboard.js`) — supaya halaman
  langsung jalan di GitHub Pages tanpa server.
- **Dummy server lokal Python** (`dummy_server.py`) — buat uji integrasi
  dengan rekan modul lain (mikrokontroller emulator, MQTT bridge, dst.)
  selama hardware launcher belum selesai dirakit.

## Roadmap

- M1–2 — Riset, desain JSON API antar modul, mockup awal.
- **M3 — Prototype dashboard HTML/CSS/JS dengan dummy data ← sekarang.**
- M4 — Integrasi Chart.js (donut zona, line latency).
- M5 — Heatmap miss + jejak bola + animasi servo.
- M6 — Sambung WebSocket riil dari modul CV (YOLOv8) + MQTT.
- M7 — Test ujung-ke-ujung dengan launcher hardware.
- M8 — UX polish, dark mode, demo, dokumentasi.

## Menjalankan dashboard secara lokal

Tidak ada build step — file statis biasa.

```bash
# pakai server statis bawaan Python:
python -m http.server 5500
# lalu buka http://localhost:5500
```

Atau buka `index.html` langsung dengan ekstensi *Live Server* di VS Code.

## Menjalankan dummy server (opsional, untuk uji lintas modul)

```bash
pip install websockets
python dummy_server.py
# server WS dummy: ws://localhost:8765
```

Server ini broadcast payload JSON setiap 1.5 detik ke semua client WebSocket
yang connect — bisa dipakai bareng oleh dashboard, emulator mikrokontroller,
atau MQTT bridge buat integrasi paralel sebelum hardware siap.

## Kontrak JSON antar modul (kasaran v0.3)

Payload yang dikirim modul CV YOLOv8 → dashboard / MQTT / mikrokontroller:

```json
{
  "timestamp": "2026-05-03T10:23:45.123Z",
  "ball_id": 124,
  "position": { "x": 320, "y": 180 },
  "zone": "Kiri",
  "confidence": 0.92,
  "latency_ms": 24,
  "model": "YOLOv8n",
  "servo_angle": 45,
  "hit_miss_decision": "Miss"
}
```

`zone` ∈ {`Kiri`, `Kanan`}; `hit_miss_decision` ∈ {`Hit`, `Miss`}.
Final field set masih bisa berubah sebelum minggu 6.

## Deploy ke GitHub Pages (Deploy from a branch)

Tidak ada build — file statis biasa, bisa langsung dilayani Pages dari root branch.

1. **Settings → Pages → Build and deployment**
   - **Source**: *Deploy from a branch*
   - **Branch**: `claude/smartping-monitoring-dashboard-2SMmb` (atau `main`) · folder `/ (root)`
2. Tunggu beberapa menit, situs muncul di
   `https://<owner>.github.io/vibecodedaislop/`.

## Struktur file

```
index.html          markup dashboard
style.css           styling kasaran
dashboard.js        simulator dummy + DOM updater
dummy_server.py     dummy WebSocket server lokal (Python)
```
