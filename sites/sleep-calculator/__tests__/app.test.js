/**
 * @jest-environment jsdom
 */
const {
  CYCLE_DURATION, FALL_ASLEEP_TIME, MAX_CYCLES, MIN_CYCLES,
  parseTime, formatTime, calculateBedtimes, calculateWakeTimes,
  setMode, calculateSleep, renderResults,
  getCurrentMode, setCurrentMode
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <button id="mode-wake" class="btn btn-primary mode-btn active">Wake</button>
    <button id="mode-sleep" class="btn btn-secondary mode-btn">Sleep</button>
    <label id="time-label">What time do you need to wake up?</label>
    <input type="time" id="time-input" value="07:00">
    <h3 id="results-title">Recommended Bedtimes</h3>
    <div id="cycles-grid"></div>
  `;
}

describe('SleepCalculator', () => {
  beforeEach(() => {
    setupDOM();
    setCurrentMode('wake');
  });

  describe('constants', () => {
    test('cycle duration is 90 minutes', () => expect(CYCLE_DURATION).toBe(90));
    test('fall asleep time is 14 minutes', () => expect(FALL_ASLEEP_TIME).toBe(14));
    test('max cycles is 6', () => expect(MAX_CYCLES).toBe(6));
    test('min cycles is 3', () => expect(MIN_CYCLES).toBe(3));
  });

  describe('parseTime', () => {
    test('parses valid time', () => {
      expect(parseTime('07:30')).toEqual({ hours: 7, minutes: 30 });
    });

    test('parses midnight', () => {
      expect(parseTime('00:00')).toEqual({ hours: 0, minutes: 0 });
    });

    test('parses 23:59', () => {
      expect(parseTime('23:59')).toEqual({ hours: 23, minutes: 59 });
    });

    test('returns null for invalid format', () => {
      expect(parseTime('abc')).toBeNull();
      expect(parseTime('25:00')).toBeNull();
      expect(parseTime('12:60')).toBeNull();
    });

    test('returns null for non-string', () => {
      expect(parseTime(null)).toBeNull();
      expect(parseTime(undefined)).toBeNull();
    });
  });

  describe('formatTime', () => {
    test('formats AM time', () => {
      expect(formatTime(7, 30)).toBe('7:30 AM');
    });

    test('formats PM time', () => {
      expect(formatTime(15, 0)).toBe('3:00 PM');
    });

    test('formats midnight as 12:00 AM', () => {
      expect(formatTime(0, 0)).toBe('12:00 AM');
    });

    test('formats noon as 12:00 PM', () => {
      expect(formatTime(12, 0)).toBe('12:00 PM');
    });

    test('handles negative hours (wrap around)', () => {
      const result = formatTime(-1, 0);
      expect(result).toBe('11:00 PM');
    });

    test('pads minutes', () => {
      expect(formatTime(7, 5)).toBe('7:05 AM');
    });
  });

  describe('calculateBedtimes', () => {
    test('returns results for valid wake time', () => {
      const results = calculateBedtimes('07:00');
      expect(results.length).toBe(MAX_CYCLES - MIN_CYCLES + 1);
    });

    test('each result has required fields', () => {
      const results = calculateBedtimes('07:00');
      results.forEach(r => {
        expect(r).toHaveProperty('time');
        expect(r).toHaveProperty('cycles');
        expect(r).toHaveProperty('duration');
        expect(r).toHaveProperty('recommended');
        expect(typeof r.recommended).toBe('boolean');
      });
    });

    test('6 cycles is recommended', () => {
      const results = calculateBedtimes('07:00');
      const sixCycle = results.find(r => r.cycles === 6);
      expect(sixCycle.recommended).toBe(true);
    });

    test('returns empty for invalid time', () => {
      expect(calculateBedtimes('invalid')).toEqual([]);
    });

    test('handles midnight wake time', () => {
      const results = calculateBedtimes('00:00');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('calculateWakeTimes', () => {
    test('returns results for valid sleep time', () => {
      const results = calculateWakeTimes('23:00');
      expect(results.length).toBe(MAX_CYCLES - MIN_CYCLES + 1);
    });

    test('cycles are in ascending order', () => {
      const results = calculateWakeTimes('22:00');
      for (let i = 1; i < results.length; i++) {
        expect(results[i].cycles).toBeGreaterThan(results[i - 1].cycles);
      }
    });

    test('returns empty for invalid time', () => {
      expect(calculateWakeTimes('invalid')).toEqual([]);
    });

    test('results wrap around midnight', () => {
      const results = calculateWakeTimes('23:00');
      expect(results.length).toBeGreaterThan(0);
      // At least some results should be AM (next day)
      const hasAM = results.some(r => r.time.includes('AM'));
      expect(hasAM).toBe(true);
    });
  });

  describe('setMode', () => {
    test('sets wake mode', () => {
      setMode('wake');
      expect(getCurrentMode()).toBe('wake');
      expect(document.getElementById('time-label').textContent).toContain('wake up');
    });

    test('sets sleep mode', () => {
      setMode('sleep');
      expect(getCurrentMode()).toBe('sleep');
      expect(document.getElementById('time-label').textContent).toContain('go to sleep');
    });
  });

  describe('calculateSleep', () => {
    test('renders results to grid in wake mode', () => {
      setCurrentMode('wake');
      calculateSleep();
      const grid = document.getElementById('cycles-grid');
      expect(grid.children.length).toBeGreaterThan(0);
    });

    test('renders results to grid in sleep mode', () => {
      setCurrentMode('sleep');
      calculateSleep();
      const grid = document.getElementById('cycles-grid');
      expect(grid.children.length).toBeGreaterThan(0);
    });
  });

  describe('renderResults', () => {
    test('renders cycle cards', () => {
      const results = [
        { time: '10:00 PM', cycles: 6, duration: '9h 0m sleep', recommended: true }
      ];
      renderResults(results);
      const grid = document.getElementById('cycles-grid');
      expect(grid.innerHTML).toContain('10:00 PM');
      expect(grid.innerHTML).toContain('6 cycles');
      expect(grid.innerHTML).toContain('Recommended');
    });

    test('renders empty for empty array', () => {
      renderResults([]);
      const grid = document.getElementById('cycles-grid');
      expect(grid.innerHTML).toBe('');
    });
  });
});
