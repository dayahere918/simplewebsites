/**
 * @jest-environment jsdom
 */
const { 
  FESTIVALS, getNextOccurrence, calculateTimeRemaining, padZero,
  formatDate, getDaysUntil, sortByNearest, selectFestival,
  startCountdown, updateCountdownDisplay, updateTimerValue,
  renderSelector, renderGrid, getSelectedFestival, setSelectedFestival,
  getCountdownInterval, setCountdownInterval
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <select id="festival-select">
      <option value="0">Diwali</option>
      <option value="1">Holi</option>
      <option value="-1">Invalid</option>
    </select>
    <div id="festival-name"></div>
    <div id="festival-date"></div>
    <div id="days"></div>
    <div id="hours"></div>
    <div id="minutes"></div>
    <div id="seconds"></div>
    <div id="festivals-grid"></div>
  `;
}

describe('Festival Countdown', () => {
  beforeEach(() => {
    setupDOM();
    jest.useFakeTimers();
    jest.clearAllMocks();
    setSelectedFestival(null);
    if (getCountdownInterval()) clearInterval(getCountdownInterval());
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Dates and Times', () => {
    test('getNextOccurrence finds correct dates', () => {
      const now = new Date(2023, 5, 15); // June 15, 2023
      
      // Future date in same year
      const future = getNextOccurrence(12, 25, now);
      expect(future.getFullYear()).toBe(2023);
      expect(future.getMonth()).toBe(11); // December (0-indexed)
      
      // Past date -> next year
      const past = getNextOccurrence(1, 1, now);
      expect(past.getFullYear()).toBe(2024);
    });

    test('calculateTimeRemaining returns correct stats', () => {
      const now = new Date('2023-01-01T00:00:00Z');
      const target = new Date('2023-01-02T01:30:15Z'); // 1 day, 1 hour, 30 min, 15 sec
      const remaining = calculateTimeRemaining(target, now);
      
      expect(remaining.days).toBe(1);
      expect(remaining.hours).toBe(1);
      expect(remaining.minutes).toBe(30);
      expect(remaining.seconds).toBe(15);
      expect(remaining.total).toBeGreaterThan(0);
      
      // Past target
      expect(calculateTimeRemaining(now, target).total).toBe(0);
    });

    test('padZero formats numbers', () => {
      expect(padZero(5)).toBe('05');
      expect(padZero(15)).toBe('15');
    });

    test('formatDate creates locale string', () => {
      const d = new Date('2023-12-25T00:00:00Z');
      expect(formatDate(d)).toContain('2023');
    });

    test('sortByNearest orders correctly', () => {
      const now = new Date(2023, 5, 15);
      const sorted = sortByNearest([{ month: 7, day: 4 }, { month: 12, day: 25 }], now);
      expect(sorted[0].month).toBe(7); // July comes before Dec from June
    });
  });

  describe('DOM & UI', () => {
    test('selectFestival updates selected state and triggers countdown', () => {
      selectFestival();
      expect(getSelectedFestival()).toBe(FESTIVALS[0]);
      
      document.getElementById('festival-select').value = '-1';
      selectFestival(); // No effect for bad index
      
      document.body.innerHTML = '';
      expect(() => selectFestival()).not.toThrow();
    });

    test('startCountdown sets interval', () => {
      setSelectedFestival(FESTIVALS[0]);
      startCountdown();
      expect(getCountdownInterval()).not.toBeNull();
      
      // Clear again
      startCountdown(); 
    });

    test('updateCountdownDisplay updates DOM elements', () => {
      setSelectedFestival(FESTIVALS[0]);
      updateCountdownDisplay();
      expect(document.getElementById('festival-name').textContent).toContain(FESTIVALS[0].name);
      
      document.body.innerHTML = '';
      expect(() => updateCountdownDisplay()).not.toThrow();
    });

    test('updateTimerValue uses flip animation class', () => {
      const el = document.getElementById('days');
      updateTimerValue(el, '10');
      expect(el.textContent).toBe('10');
      expect(el.classList.contains('flip')).toBeTruthy();
      
      // Jump timer for timeout
      jest.advanceTimersByTime(300);
      expect(el.classList.contains('flip')).toBeFalsy();
    });

    test('render tools generate HTML strings', () => {
      renderSelector();
      expect(document.getElementById('festival-select').innerHTML).toContain('Diwali');
      
      renderGrid();
      expect(document.getElementById('festivals-grid').innerHTML).toContain('card festival-card');
      
      document.body.innerHTML = '';
      expect(() => renderSelector()).not.toThrow();
      expect(() => renderGrid()).not.toThrow();
    });
  });
});
