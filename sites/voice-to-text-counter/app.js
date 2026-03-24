/**
 * Voice to Text Counter — Core Logic
 * Uses Web Speech API for transcription
 */
const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'so', 'well', 'right', 'okay', 'er', 'ah', 'hmm', 'kind of', 'sort of', 'I mean'];
let recognition = null, isRecording = false, transcript = '', startTime = null, timerInterval = null;

function countWords(text) { if (!text || typeof text !== 'string') return 0; return text.trim().split(/\s+/).filter(w => w.length > 0).length; }

function countFillers(text) {
  if (!text) return {};
  const lower = text.toLowerCase();
  const counts = {};
  FILLER_WORDS.forEach(f => {
    const regex = new RegExp('\\b' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length > 0) counts[f] = matches.length;
  });
  return counts;
}

function totalFillers(fillerCounts) { return Object.values(fillerCounts).reduce((a, b) => a + b, 0); }

function calculateWPM(wordCount, seconds) { if (seconds <= 0) return 0; return Math.round(wordCount / (seconds / 60)); }

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function highlightFillers(text) {
  if (!text) return '';
  let result = text;
  FILLER_WORDS.sort((a, b) => b.length - a.length).forEach(f => {
    const regex = new RegExp('\\b(' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')\\b', 'gi');
    result = result.replace(regex, '<span class="filler">$1</span>');
  });
  return result;
}

function toggleRecording() {
  if (isRecording) stopRecording();
  else startRecording();
}

function startRecording() {
  if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert('Speech recognition is not supported in this browser. Try Chrome.'); return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';
  recognition.onresult = (e) => {
    let final = '', interim = '';
    for (let i = 0; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
      else interim += e.results[i][0].transcript;
    }
    transcript = final + interim;
    updateDisplay();
  };
  recognition.onerror = () => stopRecording();
  recognition.onend = () => { if (isRecording) recognition.start(); };
  recognition.start();
  isRecording = true; startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
  if (typeof document !== 'undefined') {
    const btn = document.getElementById('record-btn');
    const dot = document.getElementById('rec-dot');
    if (btn) btn.innerHTML = '<span class="rec-dot active" id="rec-dot"></span> Stop Recording';
    if (dot) dot.classList.add('active');
  }
}

function stopRecording() {
  isRecording = false;
  if (recognition) recognition.stop();
  clearInterval(timerInterval);
  if (typeof document !== 'undefined') {
    const btn = document.getElementById('record-btn');
    if (btn) btn.innerHTML = '<span class="rec-dot" id="rec-dot"></span> Start Recording';
  }
}

function updateTimer() {
  if (!startTime || typeof document === 'undefined') return;
  const elapsed = (Date.now() - startTime) / 1000;
  const el = document.getElementById('duration');
  if (el) el.textContent = formatDuration(elapsed);
}

function updateDisplay() {
  if (typeof document === 'undefined') return;
  const words = countWords(transcript);
  const fillers = countFillers(transcript);
  const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
  const el = id => document.getElementById(id);
  if (el('word-count')) el('word-count').textContent = words;
  if (el('filler-count')) el('filler-count').textContent = totalFillers(fillers);
  if (el('wpm-rate')) el('wpm-rate').textContent = calculateWPM(words, elapsed);
  if (el('transcript')) el('transcript').innerHTML = highlightFillers(transcript) || 'Press "Start Recording" and begin speaking...';
  renderFillerGrid(fillers);
}

function renderFillerGrid(fillers) {
  if (typeof document === 'undefined') return;
  const grid = document.getElementById('filler-grid');
  if (!grid) return;
  const entries = Object.entries(fillers).sort((a, b) => b[1] - a[1]);
  grid.innerHTML = entries.length === 0 ? '<p style="color:var(--color-text-muted)">No fillers detected yet</p>'
    : entries.map(([word, count]) => `<div class="filler-chip"><span class="word">"${word}"</span><span class="count">${count}</span></div>`).join('');
}

function clearTranscript() {
  transcript = ''; startTime = null;
  if (typeof document === 'undefined') return;
  ['word-count','filler-count','wpm-rate'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = '0'; });
  const d = document.getElementById('duration'); if (d) d.textContent = '0:00';
  const t = document.getElementById('transcript'); if (t) t.innerHTML = 'Press "Start Recording" and begin speaking...';
  const g = document.getElementById('filler-grid'); if (g) g.innerHTML = '';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    FILLER_WORDS, countWords, countFillers, totalFillers, calculateWPM, formatDuration, 
    highlightFillers, clearTranscript, renderFillerGrid, updateTimer, updateDisplay,
    toggleRecording, startRecording, stopRecording,
    getTranscript: () => transcript, 
    setTranscript: t => { transcript = t; },
    getIsRecording: () => isRecording,
    resetState: () => { transcript = ''; isRecording = false; startTime = null; if (timerInterval) clearInterval(timerInterval); }
  };
}
