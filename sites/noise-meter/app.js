/**
 * Noise Meter — Core Logic
 * Uses Web Audio API to measure sound levels
 */
let audioContext = null, analyser = null, microphone = null, animFrame = null;
let isRunning = false, readings = [], peakDb = 0, minDb = 999;

function dbFromFloat(value) {
  if (value <= 0) return 0;
  const db = 20 * Math.log10(value);
  return Math.max(0, Math.min(120, db + 90)); // Normalize: silence ~0dB, loud ~120dB
}

function getLevel(db) {
  if (db < 30) return 'safe';
  if (db < 60) return 'moderate';
  if (db < 85) return 'loud';
  return 'danger';
}

function getLevelLabel(db) {
  if (db < 30) return '🤫 Quiet';
  if (db < 60) return '🗣️ Moderate';
  if (db < 85) return '🔊 Loud';
  return '⚠️ Very Loud — Hearing Risk!';
}

function getAverage(arr) {
  if (!arr || arr.length === 0) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

async function toggleMeter() {
  if (isRunning) { stopMeter(); return; }
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    microphone = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    microphone.connect(analyser);
    isRunning = true;
    const btn = document.getElementById('start-btn');
    if (btn) { btn.textContent = '⏹️ Stop'; btn.classList.remove('btn-accent'); btn.classList.add('btn-primary'); }
    updateMeter();
  } catch (e) {
    if (typeof document !== 'undefined') {
      const errEl = document.getElementById('mic-error');
      if (errEl) {
        errEl.textContent = '⚠️ Microphone access is required. Please allow microphone permissions.';
        errEl.classList.remove('hidden');
      }
    }
  }
}

function updateMeter() {
  if (!isRunning || !analyser) return;
  const data = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(data);
  let sum = 0;
  for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
  const rms = Math.sqrt(sum / data.length);
  const db = Math.round(dbFromFloat(rms));
  readings.push(db);
  if (readings.length > 500) readings.shift();
  if (db > peakDb) peakDb = db;
  if (db < minDb && db > 0) minDb = db;
  updateDisplay(db);
  animFrame = requestAnimationFrame(updateMeter);
}

function updateDisplay(db) {
  if (typeof document === 'undefined') return;
  const level = getLevel(db);
  const circle = document.getElementById('db-circle');
  const value = document.getElementById('db-value');
  const label = document.getElementById('db-label');
  const fill = document.getElementById('meter-fill');
  const curEl = document.getElementById('current-db');
  const avgEl = document.getElementById('avg-db');
  const peakEl = document.getElementById('peak-db');
  const minEl = document.getElementById('min-db');

  if (value) value.textContent = db;
  if (label) label.textContent = getLevelLabel(db);
  if (circle) { circle.className = 'db-circle ' + level; }
  if (fill) fill.style.width = Math.min(100, (db / 120) * 100) + '%';
  if (curEl) curEl.textContent = db + ' dB';
  if (avgEl) avgEl.textContent = getAverage(readings) + ' dB';
  if (peakEl) peakEl.textContent = peakDb + ' dB';
  if (minEl) minEl.textContent = (minDb < 999 ? minDb : '--') + ' dB';
}

function stopMeter() {
  isRunning = false;
  if (animFrame) cancelAnimationFrame(animFrame);
  if (microphone) microphone.disconnect();
  if (audioContext) audioContext.close();
  const btn = document.getElementById('start-btn');
  if (btn) { btn.textContent = '🎙️ Start Measuring'; btn.classList.add('btn-accent'); btn.classList.remove('btn-primary'); }
}

function resetReadings() {
  readings = []; peakDb = 0; minDb = 999;
  if (typeof document === 'undefined') return;
  ['current-db','avg-db','peak-db','min-db'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '-- dB'; });
  const circle = document.getElementById('db-circle');
  if (circle) circle.className = 'db-circle';
  const value = document.getElementById('db-value');
  if (value) value.textContent = '--';
  const label = document.getElementById('db-label');
  if (label) label.textContent = 'Press Start to begin';
  const fill = document.getElementById('meter-fill');
  if (fill) fill.style.width = '0%';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    dbFromFloat, getLevel, getLevelLabel, getAverage, updateDisplay, resetReadings, toggleMeter, updateMeter, stopMeter,
    getState: () => ({ isRunning, readings, peakDb, minDb }), 
    setReadings: r => { readings = r; }, 
    setPeak: p => { peakDb = p; }, 
    setMin: m => { minDb = m; },
    setIsRunning: r => { isRunning = r; },
    setAnalyser: a => { analyser = a; }
  };
}
