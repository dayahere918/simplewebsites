/**
 * Typing Speed Race — Core Logic
 */
const TEXTS = [
  "The quick brown fox jumps over the lazy dog near the riverbank while the sun sets behind the distant mountains casting golden rays across the valley.",
  "Programming is the art of telling another human being what one wants the computer to do in a language that both can understand clearly and efficiently.",
  "Innovation distinguishes between a leader and a follower. Stay hungry, stay foolish. The people who are crazy enough to think they can change the world are the ones who do.",
  "Technology is best when it brings people together. The advance of technology is based on making it fit in so that you don't really notice it becoming part of everyday life.",
  "Success is not final, failure is not fatal. It is the courage to continue that counts. The only way to do great work is to love what you do every single day without exception.",
  "Artificial intelligence is the new electricity. Just as electricity transformed almost everything one hundred years ago, today I actually have a hard time thinking of an industry that AI will not transform.",
  "The best time to plant a tree was twenty years ago. The second best time is now. Every moment is a fresh beginning and a chance to start building something extraordinary and meaningful.",
  "A user interface is like a joke. If you have to explain it then it is not that good. Design is not just what it looks like and feels like. Design is how it works in real life."
];

let currentText = '';
let duration = 60;
let startTime = null;
let timerInterval = null;
let isRunning = false;
let isFinished = false;
let totalCharsTyped = 0;
let correctChars = 0;
let errorCount = 0;

function getRandomText() { return TEXTS[Math.floor(Math.random() * TEXTS.length)]; }

function calculateWPM(chars, seconds) {
  if (seconds <= 0) return 0;
  return Math.round((chars / 5) / (seconds / 60));
}

function calculateAccuracy(correct, total) {
  if (total <= 0) return 100;
  return Math.round((correct / total) * 100);
}

function setDuration(secs) {
  duration = secs;
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
  try {
    if (typeof event !== 'undefined' && event && event.target) {
      event.target.classList.add('active');
    }
  } catch (e) {}
  restartRace();
}

function startRace() {
  if (isRunning || isFinished) return;
  isRunning = true;
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 100);
}

function updateTimer() {
  if (typeof document === 'undefined') return;
  const elapsed = (Date.now() - startTime) / 1000;
  const remaining = Math.max(0, duration - elapsed);
  const timerEl = document.getElementById('timer');
  if (timerEl) timerEl.textContent = Math.ceil(remaining);
  const seconds = Math.min(elapsed, duration);
  const wpmEl = document.getElementById('wpm');
  if (wpmEl) wpmEl.textContent = calculateWPM(correctChars, seconds);
  if (remaining <= 0) finishRace();
}

function handleTyping() {
  if (!isRunning || isFinished || typeof document === 'undefined') return;
  const input = document.getElementById('typing-input');
  if (!input) return;
  const typed = input.value;
  totalCharsTyped = typed.length;
  correctChars = 0; errorCount = 0;
  for (let i = 0; i < typed.length; i++) {
    if (i < currentText.length && typed[i] === currentText[i]) correctChars++;
    else errorCount++;
  }
  const accEl = document.getElementById('accuracy');
  if (accEl) accEl.textContent = calculateAccuracy(correctChars, totalCharsTyped);
  const errEl = document.getElementById('errors');
  if (errEl) errEl.textContent = errorCount;
  const progress = Math.min(100, (typed.length / currentText.length) * 100);
  const progressFill = document.getElementById('progress-fill');
  if (progressFill) progressFill.style.width = progress + '%';
  renderText(typed);
  if (typed.length >= currentText.length) finishRace();
}

function renderText(typed) {
  if (typeof document === 'undefined') return;
  const display = document.getElementById('text-display');
  if (!display) return;
  let html = '';
  for (let i = 0; i < currentText.length; i++) {
    const ch = currentText[i] === ' ' ? '&nbsp;' : currentText[i];
    if (i < typed.length) {
      html += typed[i] === currentText[i]
        ? `<span class="correct">${ch}</span>`
        : `<span class="incorrect">${ch}</span>`;
    } else if (i === typed.length) {
      html += `<span class="current">${ch}</span>`;
    } else {
      html += `<span class="pending">${ch}</span>`;
    }
  }
  display.innerHTML = html;
}

function finishRace() {
  isRunning = false; isFinished = true;
  clearInterval(timerInterval);
  if (typeof document === 'undefined') return;
  const input = document.getElementById('typing-input');
  if (input) input.disabled = true;
  const elapsed = Math.min((Date.now() - startTime) / 1000, duration);
  const finalWPM = calculateWPM(correctChars, elapsed);
  const finalAcc = calculateAccuracy(correctChars, totalCharsTyped);
  const wpmEl = document.getElementById('wpm');
  if (wpmEl) wpmEl.textContent = finalWPM;
  saveScore(finalWPM, finalAcc);
  // Show overlay
  const area = document.querySelector('.typing-area');
  if (area) {
    const overlay = document.createElement('div');
    overlay.className = 'finished-overlay animate-fadeIn';
    overlay.innerHTML = `<div class="final-wpm">${finalWPM} WPM</div><p style="color:var(--color-text-secondary);margin-top:8px">${finalAcc}% accuracy · ${errorCount} errors</p>`;
    area.appendChild(overlay);
  }
}

function restartRace() {
  isRunning = false; isFinished = false;
  clearInterval(timerInterval);
  startTime = null; totalCharsTyped = 0; correctChars = 0; errorCount = 0;
  currentText = getRandomText();
  if (typeof document === 'undefined') return;
  const wEl = document.getElementById('wpm'); if (wEl) wEl.textContent = '0';
  const aEl = document.getElementById('accuracy'); if (aEl) aEl.textContent = '100';
  const tEl = document.getElementById('timer'); if (tEl) tEl.textContent = duration;
  const eEl = document.getElementById('errors'); if (eEl) eEl.textContent = '0';
  const input = document.getElementById('typing-input');
  if (input) { input.value = ''; input.disabled = false; }
  const progressFill = document.getElementById('progress-fill');
  if (progressFill) progressFill.style.width = '0%';
  const overlay = document.querySelector('.finished-overlay');
  if (overlay) overlay.remove();
  renderText('');
  renderLeaderboard();
}

function saveScore(wpm, accuracy) {
  try {
    const scores = JSON.parse(localStorage.getItem('typingScores') || '[]');
    scores.push({ wpm, accuracy, date: new Date().toLocaleDateString(), duration });
    scores.sort((a, b) => b.wpm - a.wpm);
    localStorage.setItem('typingScores', JSON.stringify(scores.slice(0, 10)));
    renderLeaderboard();
  } catch(e) {}
}

function renderLeaderboard() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('leaderboard');
  if (!el) return;
  try {
    const scores = JSON.parse(localStorage.getItem('typingScores') || '[]');
    if (scores.length === 0) { el.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;padding:16px;">No scores yet. Start typing!</p>'; return; }
    el.innerHTML = scores.map((s, i) =>
      `<div class="score-row"><span class="rank">#${i+1}</span><span class="wpm">${s.wpm} WPM</span><span>${s.accuracy}%</span><span class="date">${s.date}</span></div>`
    ).join('');
  } catch(e) { el.innerHTML = ''; }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => { currentText = getRandomText(); renderText(''); renderLeaderboard(); });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TEXTS, getRandomText, calculateWPM, calculateAccuracy, setDuration, startRace, handleTyping, renderText, finishRace, restartRace, renderLeaderboard,
    getState: () => ({ currentText, duration, isRunning, isFinished, totalCharsTyped, correctChars, errorCount }),
    setCurrentText: t => { currentText = t; }, setIsRunning: v => { isRunning = v; }, setIsFinished: v => { isFinished = v; } };
}
