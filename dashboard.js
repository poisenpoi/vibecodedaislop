/* SmartPing dashboard — Minggu 3/8 (prototype kasaran)
 *
 * Sumber data: simulator dummy lokal (setInterval).
 * Nanti di Minggu 6 diganti WebSocket asli ke modul YOLOv8.
 *
 * Bentuk payload mengikuti API kontrak (lihat dummy_server.py):
 * {
 *   timestamp, ball_id, position:{x,y}, zone, confidence,
 *   latency_ms, model, servo_angle, hit_miss_decision
 * }
 */

// ---------- konfigurasi ----------
const TICK_MS = 1500;
const TABLE_W = 640;
const TABLE_H = 360;
const MAX_LOG_ROWS = 15;

// ---------- state global (simple, belum pakai framework) ----------
const state = {
  ballId: 123,
  history: [],          // semua payload
  zoneStats: {
    Kiri:  { hit: 0, miss: 0 },
    Kanan: { hit: 0, miss: 0 },
  },
  fps: 58,
  sessionStart: Date.now(),
  wsConnected: false,
};

// ---------- utilitas ----------
function rand(min, max) { return Math.random() * (max - min) + min; }

function pad(n, w) { return String(n).padStart(w, '0'); }

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  return `${pad(Math.floor(s/3600),2)}:${pad(Math.floor((s%3600)/60),2)}:${pad(s%60,2)}`;
}

function formatTime(iso) {
  const d = new Date(iso);
  return `${pad(d.getHours(),2)}:${pad(d.getMinutes(),2)}:${pad(d.getSeconds(),2)}.${pad(d.getMilliseconds(),3)}`;
}

// ---------- generator dummy payload ----------
// Bias: makin ke pinggir meja, makin tinggi peluang miss.
function generatePayload() {
  state.ballId += 1;

  const x = Math.round(rand(20, TABLE_W - 20));
  const y = Math.round(rand(20, TABLE_H - 20));
  const zone = x < TABLE_W / 2 ? 'Kiri' : 'Kanan';

  const edge = Math.min(x, TABLE_W - x) / (TABLE_W / 2)
             + Math.min(y, TABLE_H - y) / (TABLE_H / 2);
  const missChance = 0.6 - edge * 0.18;
  const decision = Math.random() < missChance ? 'Miss' : 'Hit';

  const conf = Math.max(0.55, Math.min(0.99, rand(0.78, 0.97) - (Math.random() < 0.08 ? 0.2 : 0)));

  return {
    timestamp: new Date().toISOString(),
    ball_id: state.ballId,
    position: { x, y },
    zone,
    confidence: Number(conf.toFixed(2)),
    latency_ms: Math.round(rand(14, 42)),
    model: 'YOLOv8n',
    servo_angle: Math.round(rand(15, 75)),
    hit_miss_decision: decision,
  };
}

// ---------- status modul ----------
// Sebagian sengaja offline / pending — hardware belum siap (catatan minggu 3).
const services = [
  { key: 'dashboard', label: 'Dashboard',        state: 'online'  },
  { key: 'ws',        label: 'WebSocket Server', state: 'pending' }, // pakai simulator JS
  { key: 'camera',    label: 'Camera + YOLOv8',  state: 'pending' }, // dummy
  { key: 'launcher',  label: 'Hardware Launcher',state: 'offline' }, // belum dirakit
  { key: 'mqtt',      label: 'MQTT Broker',      state: 'offline' }, // belum di-setup
];

function renderStatus() {
  const ul = document.getElementById('status-list');
  ul.innerHTML = '';
  for (const s of services) {
    const li = document.createElement('li');
    const tag = s.state === 'online'  ? 'live'
              : s.state === 'pending' ? 'dummy'
              : 'offline';
    li.innerHTML = `
      <span class="status-dot ${s.state}"></span>
      <span>${s.label}</span>
      <span class="status-tag">${tag}</span>
    `;
    ul.appendChild(li);
  }
}

// ---------- handler tiap payload ----------
function onPayload(p) {
  state.history.unshift(p);
  if (state.history.length > 200) state.history.pop();

  // update statistik zona
  const z = state.zoneStats[p.zone];
  if (p.hit_miss_decision === 'Hit') z.hit += 1; else z.miss += 1;

  updateBall(p);
  updateMetrics(p);
  updateZoneStats();
  updateActiveThrow(p);
  prependLogRow(p);
}

// ---------- DOM updaters ----------
function updateBall(p) {
  const ball = document.getElementById('ball');
  ball.setAttribute('cx', p.position.x);
  ball.setAttribute('cy', p.position.y);
  ball.setAttribute('fill', p.hit_miss_decision === 'Hit' ? '#22c55e' : '#ef4444');
}

function updateMetrics(p) {
  document.getElementById('metric-total').textContent = state.history.length;

  const window = state.history.slice(0, 30);
  const avg = window.reduce((a, h) => a + h.confidence, 0) / window.length;
  document.getElementById('metric-conf').textContent = `${(avg * 100).toFixed(1)}%`;

  document.getElementById('metric-fps').textContent = state.fps.toFixed(0);

  document.getElementById('metric-time').textContent =
    formatDuration(Date.now() - state.sessionStart);
}

function updateZoneStats() {
  const total = state.history.length || 1;
  for (const zone of ['Kiri', 'Kanan']) {
    const z = state.zoneStats[zone];
    const hitPct  = (z.hit  / total) * 100;
    const missPct = (z.miss / total) * 100;
    document.getElementById(`bar-${zone.toLowerCase()}-hit`).style.width  = `${hitPct}%`;
    document.getElementById(`bar-${zone.toLowerCase()}-miss`).style.width = `${missPct}%`;
    document.getElementById(`num-${zone.toLowerCase()}`).textContent = `${z.hit}/${z.miss}`;
  }
}

function updateActiveThrow(p) {
  document.getElementById('active-id').textContent = `#${pad(p.ball_id, 4)}`;
  document.getElementById('active-servo').textContent = `${p.servo_angle}°`;
  document.getElementById('active-conf').textContent = `${(p.confidence * 100).toFixed(0)}%`;
  const dec = document.getElementById('active-decision');
  dec.textContent = p.hit_miss_decision;
  dec.className = 'decision ' + (p.hit_miss_decision === 'Hit' ? 'hit' : 'miss');
}

function prependLogRow(p) {
  const tbody = document.getElementById('log-body');
  // hapus baris "menunggu data..."
  const empty = tbody.querySelector('tr.empty');
  if (empty) empty.remove();

  const tr = document.createElement('tr');
  tr.className = 'new';
  const isHit = p.hit_miss_decision === 'Hit';
  tr.innerHTML = `
    <td>${formatTime(p.timestamp)}</td>
    <td>#${pad(p.ball_id, 4)}</td>
    <td>${pad(p.position.x, 3)}</td>
    <td>${pad(p.position.y, 3)}</td>
    <td><span class="tag tag-${p.zone.toLowerCase()}">${p.zone}</span></td>
    <td><span class="tag tag-${isHit ? 'hit' : 'miss'}">${p.hit_miss_decision}</span></td>
    <td>${(p.confidence * 100).toFixed(0)}%</td>
    <td>${p.latency_ms} ms</td>
  `;
  tbody.prepend(tr);

  // hapus highlight setelah sebentar
  setTimeout(() => tr.classList.remove('new'), 600);

  // batasi jumlah baris yang ditampilkan
  while (tbody.children.length > MAX_LOG_ROWS) {
    tbody.removeChild(tbody.lastChild);
  }
}

// ---------- timer durasi (jalan terpisah agar update tiap detik) ----------
function startDurationTimer() {
  setInterval(() => {
    document.getElementById('metric-time').textContent =
      formatDuration(Date.now() - state.sessionStart);
  }, 1000);
}

// ---------- simulator FPS (drift kecil) ----------
function startFpsDrift() {
  setInterval(() => {
    state.fps = Math.max(45, Math.min(62, state.fps + (Math.random() - 0.5) * 4));
  }, 1200);
}

// ---------- init ----------
function init() {
  renderStatus();
  startDurationTimer();
  startFpsDrift();

  // Tick simulator (nanti diganti WebSocket).
  setInterval(() => onPayload(generatePayload()), TICK_MS);

  // Status WS "pending" -> "online" setelah 1 detik (handshake palsu).
  setTimeout(() => {
    services.find(s => s.key === 'ws').state = 'online';
    services.find(s => s.key === 'camera').state = 'online';
    renderStatus();
  }, 1000);
}

init();
