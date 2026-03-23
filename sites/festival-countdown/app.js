/**
 * Festival Countdown — Core Logic
 */

const FESTIVALS = [
  { name: 'Diwali', emoji: '🪔', month: 10, day: 20, description: 'Festival of Lights' },
  { name: 'Holi', emoji: '🎨', month: 3, day: 14, description: 'Festival of Colors' },
  { name: 'Christmas', emoji: '🎄', month: 12, day: 25, description: 'Christmas Day' },
  { name: 'New Year', emoji: '🎆', month: 1, day: 1, description: "New Year's Day" },
  { name: 'Eid al-Fitr', emoji: '🌙', month: 3, day: 30, description: 'End of Ramadan' },
  { name: 'Halloween', emoji: '🎃', month: 10, day: 31, description: 'Spooky Night' },
  { name: 'Valentine\'s Day', emoji: '💕', month: 2, day: 14, description: 'Day of Love' },
  { name: 'Easter', emoji: '🐣', month: 4, day: 20, description: 'Easter Sunday' },
  { name: 'Thanksgiving', emoji: '🦃', month: 11, day: 27, description: 'Day of Thanks' },
  { name: 'Independence Day', emoji: '🇺🇸', month: 7, day: 4, description: 'July 4th' },
  { name: 'Chinese New Year', emoji: '🐉', month: 1, day: 29, description: 'Lunar New Year' },
  { name: 'Navratri', emoji: '🙏', month: 10, day: 2, description: 'Nine Nights Festival' }
];

let selectedFestival = null;
let countdownInterval = null;

/**
 * Get the next occurrence of a festival date
 * @param {number} month - 1-based month
 * @param {number} day
 * @param {Date} [now]
 * @returns {Date}
 */
function getNextOccurrence(month, day, now) {
  const today = now || new Date();
  const year = today.getFullYear();
  let festivalDate = new Date(year, month - 1, day);

  if (festivalDate <= today) {
    festivalDate = new Date(year + 1, month - 1, day);
  }

  return festivalDate;
}

/**
 * Calculate time remaining until a target date
 * @param {Date} targetDate
 * @param {Date} [now]
 * @returns {{days: number, hours: number, minutes: number, seconds: number, total: number}}
 */
function calculateTimeRemaining(targetDate, now) {
  const currentTime = now || new Date();
  const total = targetDate.getTime() - currentTime.getTime();

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, total };
}

/**
 * Format a number with leading zero
 * @param {number} num
 * @returns {string}
 */
function padZero(num) {
  return String(num).padStart(2, '0');
}

/**
 * Format a date for display
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Calculate days until a festival from now
 * @param {Object} festival
 * @param {Date} [now]
 * @returns {number}
 */
function getDaysUntil(festival, now) {
  const target = getNextOccurrence(festival.month, festival.day, now);
  const today = now || new Date();
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Sort festivals by nearest date
 * @param {Array} festivals
 * @param {Date} [now]
 * @returns {Array}
 */
function sortByNearest(festivals, now) {
  return [...festivals].sort((a, b) => getDaysUntil(a, now) - getDaysUntil(b, now));
}

/**
 * Select a festival by index
 */
function selectFestival() {
  if (typeof document === 'undefined') return;
  const select = document.getElementById('festival-select');
  if (!select) return;

  const index = parseInt(select.value, 10);
  if (isNaN(index) || index < 0 || index >= FESTIVALS.length) return;

  selectedFestival = FESTIVALS[index];
  startCountdown();
}

/**
 * Start the countdown timer for the selected festival
 */
function startCountdown() {
  if (countdownInterval) clearInterval(countdownInterval);
  if (!selectedFestival) return;

  updateCountdownDisplay();
  countdownInterval = setInterval(updateCountdownDisplay, 1000);
}

/**
 * Update the countdown display
 */
function updateCountdownDisplay() {
  if (typeof document === 'undefined' || !selectedFestival) return;

  const targetDate = getNextOccurrence(selectedFestival.month, selectedFestival.day);
  const remaining = calculateTimeRemaining(targetDate);

  const nameEl = document.getElementById('festival-name');
  const dateEl = document.getElementById('festival-date');
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (nameEl) nameEl.textContent = `${selectedFestival.emoji} ${selectedFestival.name}`;
  if (dateEl) dateEl.textContent = formatDate(targetDate);

  if (daysEl) updateTimerValue(daysEl, padZero(remaining.days));
  if (hoursEl) updateTimerValue(hoursEl, padZero(remaining.hours));
  if (minutesEl) updateTimerValue(minutesEl, padZero(remaining.minutes));
  if (secondsEl) updateTimerValue(secondsEl, padZero(remaining.seconds));
}

/**
 * Update a timer value element with flip animation
 */
function updateTimerValue(element, value) {
  if (element.textContent !== value) {
    element.textContent = value;
    element.classList.add('flip');
    setTimeout(() => element.classList.remove('flip'), 300);
  }
}

/**
 * Render the festival selector dropdown
 */
function renderSelector() {
  if (typeof document === 'undefined') return;
  const select = document.getElementById('festival-select');
  if (!select) return;

  FESTIVALS.forEach((festival, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${festival.emoji} ${festival.name}`;
    select.appendChild(option);
  });
}

/**
 * Render festival grid cards
 */
function renderGrid() {
  if (typeof document === 'undefined') return;
  const grid = document.getElementById('festivals-grid');
  if (!grid) return;

  const sorted = sortByNearest(FESTIVALS);

  grid.innerHTML = sorted.map((festival, i) => {
    const originalIndex = FESTIVALS.indexOf(festival);
    const daysLeft = getDaysUntil(festival);
    return `<div class="card festival-card" onclick="document.getElementById('festival-select').value=${originalIndex}; selectFestival();">
      <div class="emoji">${festival.emoji}</div>
      <div class="name">${festival.name}</div>
      <div class="date">${festival.description}</div>
      <div class="days-left">${daysLeft} days away</div>
    </div>`;
  }).join('');
}

// Initialize
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    renderSelector();
    renderGrid();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FESTIVALS, getNextOccurrence, calculateTimeRemaining, padZero,
    formatDate, getDaysUntil, sortByNearest, selectFestival,
    startCountdown, updateCountdownDisplay, updateTimerValue,
    renderSelector, renderGrid,
    getSelectedFestival: () => selectedFestival,
    setSelectedFestival: (f) => { selectedFestival = f; },
    getCountdownInterval: () => countdownInterval,
    setCountdownInterval: (i) => { countdownInterval = i; }
  };
}
