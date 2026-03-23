/**
 * Sleep Calculator — Core Logic
 * Based on 90-minute sleep cycles
 */

const CYCLE_DURATION = 90; // minutes
const FALL_ASLEEP_TIME = 14; // average minutes to fall asleep
const MAX_CYCLES = 6;
const MIN_CYCLES = 3;

let currentMode = 'wake'; // 'wake' or 'sleep'

/**
 * Parse time string (HH:MM) into hours and minutes
 * @param {string} timeStr
 * @returns {{hours: number, minutes: number}|null}
 */
function parseTime(timeStr) {
  if (typeof timeStr !== 'string') return null;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return { hours, minutes };
}

/**
 * Format hours and minutes to time string
 * @param {number} hours
 * @param {number} minutes
 * @returns {string}
 */
function formatTime(hours, minutes) {
  const h = ((hours % 24) + 24) % 24;
  const m = ((minutes % 60) + 60) % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Calculate bedtimes given a wake-up time
 * @param {string} wakeTime - HH:MM format
 * @returns {Array<{time: string, cycles: number, duration: string, recommended: boolean}>}
 */
function calculateBedtimes(wakeTime) {
  const parsed = parseTime(wakeTime);
  if (!parsed) return [];

  const results = [];
  for (let cycles = MAX_CYCLES; cycles >= MIN_CYCLES; cycles--) {
    const totalMinutes = cycles * CYCLE_DURATION + FALL_ASLEEP_TIME;
    const wakeMinutes = parsed.hours * 60 + parsed.minutes;
    let bedMinutes = wakeMinutes - totalMinutes;
    if (bedMinutes < 0) bedMinutes += 24 * 60;

    const bedHours = Math.floor(bedMinutes / 60);
    const bedMins = bedMinutes % 60;

    const durationHours = Math.floor((cycles * CYCLE_DURATION) / 60);
    const durationMins = (cycles * CYCLE_DURATION) % 60;

    results.push({
      time: formatTime(bedHours, bedMins),
      cycles: cycles,
      duration: `${durationHours}h ${durationMins}m sleep`,
      recommended: cycles === 5 || cycles === 6,
      rawMinutes: bedMinutes
    });
  }

  return results;
}

/**
 * Calculate wake-up times given a sleep time
 * @param {string} sleepTime - HH:MM format
 * @returns {Array<{time: string, cycles: number, duration: string, recommended: boolean}>}
 */
function calculateWakeTimes(sleepTime) {
  const parsed = parseTime(sleepTime);
  if (!parsed) return [];

  const results = [];
  for (let cycles = MIN_CYCLES; cycles <= MAX_CYCLES; cycles++) {
    const totalMinutes = cycles * CYCLE_DURATION + FALL_ASLEEP_TIME;
    const sleepMinutes = parsed.hours * 60 + parsed.minutes;
    let wakeMinutes = (sleepMinutes + totalMinutes) % (24 * 60);

    const wakeHours = Math.floor(wakeMinutes / 60);
    const wakeMins = wakeMinutes % 60;

    const durationHours = Math.floor((cycles * CYCLE_DURATION) / 60);
    const durationMins = (cycles * CYCLE_DURATION) % 60;

    results.push({
      time: formatTime(wakeHours, wakeMins),
      cycles: cycles,
      duration: `${durationHours}h ${durationMins}m sleep`,
      recommended: cycles === 5 || cycles === 6,
      rawMinutes: wakeMinutes
    });
  }

  return results;
}

/**
 * Set the calculator mode
 * @param {'wake'|'sleep'} mode
 */
function setMode(mode) {
  currentMode = mode;
  if (typeof document === 'undefined') return;

  const wakeBtn = document.getElementById('mode-wake');
  const sleepBtn = document.getElementById('mode-sleep');
  const label = document.getElementById('time-label');
  const title = document.getElementById('results-title');

  if (mode === 'wake') {
    if (wakeBtn) { wakeBtn.classList.add('active'); wakeBtn.classList.remove('btn-secondary'); wakeBtn.classList.add('btn-primary'); }
    if (sleepBtn) { sleepBtn.classList.remove('active'); sleepBtn.classList.add('btn-secondary'); sleepBtn.classList.remove('btn-primary'); }
    if (label) label.textContent = 'What time do you need to wake up?';
    if (title) title.textContent = 'Recommended Bedtimes';
  } else {
    if (sleepBtn) { sleepBtn.classList.add('active'); sleepBtn.classList.remove('btn-secondary'); sleepBtn.classList.add('btn-primary'); }
    if (wakeBtn) { wakeBtn.classList.remove('active'); wakeBtn.classList.add('btn-secondary'); wakeBtn.classList.remove('btn-primary'); }
    if (label) label.textContent = 'What time do you want to go to sleep?';
    if (title) title.textContent = 'Recommended Wake Times';
  }

  calculateSleep();
}

/**
 * Main calculation function
 */
function calculateSleep() {
  if (typeof document === 'undefined') return;
  const timeInput = document.getElementById('time-input');
  if (!timeInput) return;

  const results = currentMode === 'wake'
    ? calculateBedtimes(timeInput.value)
    : calculateWakeTimes(timeInput.value);

  renderResults(results);
}

/**
 * Render results to the grid
 * @param {Array} results
 */
function renderResults(results) {
  if (typeof document === 'undefined') return;
  const grid = document.getElementById('cycles-grid');
  if (!grid) return;

  grid.innerHTML = results.map(r =>
    `<div class="card cycle-card ${r.recommended ? 'recommended' : ''}">
      <div class="time">${r.time}</div>
      <div class="cycles">${r.cycles} cycles</div>
      <div class="duration">${r.duration}</div>
      ${r.recommended ? '<div class="badge">Recommended</div>' : ''}
    </div>`
  ).join('');
}

// Initialize
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', calculateSleep);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CYCLE_DURATION, FALL_ASLEEP_TIME, MAX_CYCLES, MIN_CYCLES,
    parseTime, formatTime, calculateBedtimes, calculateWakeTimes,
    setMode, calculateSleep, renderResults,
    getCurrentMode: () => currentMode,
    setCurrentMode: (m) => { currentMode = m; }
  };
}
