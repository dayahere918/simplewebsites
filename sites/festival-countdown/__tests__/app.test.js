/**
 * @jest-environment jsdom
 */
const {
  FESTIVALS, getNextOccurrence, calculateTimeRemaining, padZero,
  formatDate, getDaysUntil, sortByNearest, updateTimerValue,
  renderSelector, renderGrid, startCountdown, updateCountdownDisplay,
  getSelectedFestival, setSelectedFestival, setCountdownInterval
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <select id="festival-select"><option value="">--</option></select>
    <div id="festival-name"></div>
    <div id="festival-date"></div>
    <div id="days">00</div>
    <div id="hours">00</div>
    <div id="minutes">00</div>
    <div id="seconds">00</div>
    <div id="festivals-grid"></div>
  `;
}

describe('FestivalCountdown', () => {
  beforeEach(() => {
    setupDOM();
    setSelectedFestival(null);
    setCountdownInterval(null);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('FESTIVALS', () => {
    test('has at least 10 festivals', () => {
      expect(FESTIVALS.length).toBeGreaterThanOrEqual(10);
    });

    test('each festival has required fields', () => {
      FESTIVALS.forEach(f => {
        expect(f).toHaveProperty('name');
        expect(f).toHaveProperty('emoji');
        expect(f).toHaveProperty('month');
        expect(f).toHaveProperty('day');
        expect(f.month).toBeGreaterThanOrEqual(1);
        expect(f.month).toBeLessThanOrEqual(12);
        expect(f.day).toBeGreaterThanOrEqual(1);
        expect(f.day).toBeLessThanOrEqual(31);
      });
    });
  });

  describe('getNextOccurrence', () => {
    test('returns future date when festival has not passed this year', () => {
      const now = new Date(2026, 0, 1); // Jan 1, 2026
      const result = getNextOccurrence(12, 25, now); // Christmas
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(11);
      expect(result.getDate()).toBe(25);
    });

    test('returns next year when festival has passed', () => {
      const now = new Date(2026, 11, 26); // Dec 26, 2026
      const result = getNextOccurrence(12, 25, now); // Christmas passed
      expect(result.getFullYear()).toBe(2027);
    });

    test('returns next year when today is the festival', () => {
      const now = new Date(2026, 11, 25, 12, 0, 0); // Christmas day noon
      const result = getNextOccurrence(12, 25, now);
      expect(result.getFullYear()).toBe(2027);
    });
  });

  describe('calculateTimeRemaining', () => {
    test('calculates correct days, hours, minutes, seconds', () => {
      const now = new Date(2026, 0, 1, 0, 0, 0);
      const target = new Date(2026, 0, 2, 3, 30, 15);
      const result = calculateTimeRemaining(target, now);
      expect(result.days).toBe(1);
      expect(result.hours).toBe(3);
      expect(result.minutes).toBe(30);
      expect(result.seconds).toBe(15);
      expect(result.total).toBeGreaterThan(0);
    });

    test('returns zeros when target is in the past', () => {
      const now = new Date(2026, 5, 1);
      const target = new Date(2026, 0, 1);
      const result = calculateTimeRemaining(target, now);
      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
      expect(result.total).toBe(0);
    });

    test('returns zeros when target equals now', () => {
      const now = new Date(2026, 5, 1);
      const result = calculateTimeRemaining(now, now);
      expect(result.total).toBe(0);
    });
  });

  describe('padZero', () => {
    test('pads single digit', () => {
      expect(padZero(5)).toBe('05');
    });

    test('does not pad double digit', () => {
      expect(padZero(15)).toBe('15');
    });

    test('pads zero', () => {
      expect(padZero(0)).toBe('00');
    });

    test('handles 3-digit number', () => {
      expect(padZero(100)).toBe('100');
    });
  });

  describe('formatDate', () => {
    test('returns a formatted string', () => {
      const date = new Date(2026, 11, 25);
      const result = formatDate(date);
      expect(result).toContain('2026');
      expect(result).toContain('December');
      expect(result).toContain('25');
    });
  });

  describe('getDaysUntil', () => {
    test('returns positive number for future festival', () => {
      const now = new Date(2026, 0, 1);
      const days = getDaysUntil({ month: 12, day: 25 }, now);
      expect(days).toBeGreaterThan(0);
    });

    test('returns next year count for past festival', () => {
      const now = new Date(2026, 11, 26);
      const days = getDaysUntil({ month: 12, day: 25 }, now);
      expect(days).toBeGreaterThan(300);
    });
  });

  describe('sortByNearest', () => {
    test('sorts festivals so nearest is first', () => {
      const now = new Date(2026, 0, 1);
      const sorted = sortByNearest(FESTIVALS, now);
      const firstDays = getDaysUntil(sorted[0], now);
      const lastDays = getDaysUntil(sorted[sorted.length - 1], now);
      expect(firstDays).toBeLessThanOrEqual(lastDays);
    });

    test('does not mutate original array', () => {
      const original = [...FESTIVALS];
      sortByNearest(FESTIVALS);
      expect(FESTIVALS).toEqual(original);
    });
  });

  describe('updateTimerValue', () => {
    test('updates text and adds flip class', () => {
      const el = document.getElementById('days');
      updateTimerValue(el, '42');
      expect(el.textContent).toBe('42');
      expect(el.classList.contains('flip')).toBe(true);
    });

    test('does not add flip class if value unchanged', () => {
      const el = document.getElementById('days');
      el.textContent = '42';
      updateTimerValue(el, '42');
      expect(el.classList.contains('flip')).toBe(false);
    });
  });

  describe('renderSelector', () => {
    test('adds options for each festival', () => {
      renderSelector();
      const select = document.getElementById('festival-select');
      // +1 for the default option
      expect(select.children.length).toBe(FESTIVALS.length + 1);
    });
  });

  describe('renderGrid', () => {
    test('renders festival cards', () => {
      renderGrid();
      const grid = document.getElementById('festivals-grid');
      expect(grid.children.length).toBe(FESTIVALS.length);
    });
  });

  describe('updateCountdownDisplay', () => {
    test('updates display when festival is selected', () => {
      setSelectedFestival(FESTIVALS[0]);
      updateCountdownDisplay();
      const nameEl = document.getElementById('festival-name');
      expect(nameEl.textContent).toContain(FESTIVALS[0].name);
    });

    test('does nothing when no festival selected', () => {
      setSelectedFestival(null);
      updateCountdownDisplay();
      const nameEl = document.getElementById('festival-name');
      expect(nameEl.textContent).toBe('');
    });
  });
});
