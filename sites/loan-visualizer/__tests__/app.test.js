/**
 * @jest-environment jsdom
 */
const {
  PRESETS_DATA, calculateEMI, calculateTotalPayment, calculateTotalInterest,
  generateAmortization, formatCurrency, loadPreset, calculate,
  updateDisplay, updatePieChart, renderAmortization
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <input id="principal" value="250000">
    <input id="rate" value="6.5">
    <input id="term" value="30">
    <div id="emi">$0</div>
    <div id="total-interest">$0</div>
    <div id="total-payment">$0</div>
    <div id="pie-visual"></div>
    <span id="pie-principal">$0</span>
    <span id="pie-interest">$0</span>
    <table><tbody id="amort-body"></tbody></table>
  `;
}

describe('LoanVisualizer', () => {
  beforeEach(() => setupDOM());

  describe('PRESETS_DATA', () => {
    test('has home, car, personal, student presets', () => {
      expect(PRESETS_DATA.home).toBeDefined();
      expect(PRESETS_DATA.car).toBeDefined();
      expect(PRESETS_DATA.personal).toBeDefined();
      expect(PRESETS_DATA.student).toBeDefined();
    });

    test('each preset has principal, rate, term', () => {
      Object.values(PRESETS_DATA).forEach(p => {
        expect(p).toHaveProperty('principal');
        expect(p).toHaveProperty('rate');
        expect(p).toHaveProperty('term');
      });
    });
  });

  describe('calculateEMI', () => {
    test('calculates correct EMI for known values', () => {
      // $250k, 6.5%, 30 years → ~$1580
      const emi = calculateEMI(250000, 6.5, 30);
      expect(emi).toBeGreaterThan(1570);
      expect(emi).toBeLessThan(1590);
    });

    test('returns 0 for zero principal', () => {
      expect(calculateEMI(0, 5, 10)).toBe(0);
    });

    test('returns 0 for zero term', () => {
      expect(calculateEMI(100000, 5, 0)).toBe(0);
    });

    test('returns 0 for non-number inputs', () => {
      expect(calculateEMI('abc', 5, 10)).toBe(0);
    });

    test('handles zero interest rate', () => {
      const emi = calculateEMI(12000, 0, 1);
      expect(emi).toBe(1000); // 12000 / 12
    });

    test('handles high interest rate', () => {
      const emi = calculateEMI(10000, 24, 1);
      expect(emi).toBeGreaterThan(900);
    });

    test('handles negative principal', () => {
      expect(calculateEMI(-100000, 5, 10)).toBe(0);
    });
  });

  describe('calculateTotalPayment', () => {
    test('multiplies EMI by months', () => {
      expect(calculateTotalPayment(1000, 30)).toBe(360000);
    });

    test('returns 0 for non-numbers', () => {
      expect(calculateTotalPayment('abc', 30)).toBe(0);
    });
  });

  describe('calculateTotalInterest', () => {
    test('subtracts principal from total', () => {
      expect(calculateTotalInterest(360000, 250000)).toBe(110000);
    });

    test('returns 0 for non-numbers', () => {
      expect(calculateTotalInterest('abc', 250000)).toBe(0);
    });
  });

  describe('generateAmortization', () => {
    test('generates schedule for valid inputs', () => {
      const schedule = generateAmortization(100000, 5, 10);
      expect(schedule.length).toBe(10);
    });

    test('each row has required fields', () => {
      const schedule = generateAmortization(100000, 5, 5);
      schedule.forEach(row => {
        expect(row).toHaveProperty('year');
        expect(row).toHaveProperty('principalPaid');
        expect(row).toHaveProperty('interestPaid');
        expect(row).toHaveProperty('balance');
      });
    });

    test('balance decreases over time', () => {
      const schedule = generateAmortization(100000, 5, 10);
      for (let i = 1; i < schedule.length; i++) {
        expect(schedule[i].balance).toBeLessThanOrEqual(schedule[i - 1].balance);
      }
    });

    test('final balance is 0 or near 0', () => {
      const schedule = generateAmortization(100000, 5, 10);
      expect(schedule[schedule.length - 1].balance).toBeLessThan(1);
    });

    test('returns empty for invalid inputs', () => {
      expect(generateAmortization(0, 5, 10)).toEqual([]);
      expect(generateAmortization(100000, 5, 0)).toEqual([]);
    });
  });

  describe('formatCurrency', () => {
    test('formats with dollar sign', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
    });

    test('formats large numbers', () => {
      expect(formatCurrency(250000)).toBe('$250,000');
    });

    test('returns $0 for NaN', () => {
      expect(formatCurrency(NaN)).toBe('$0');
    });

    test('returns $0 for non-number', () => {
      expect(formatCurrency('abc')).toBe('$0');
    });
  });

  describe('loadPreset', () => {
    test('loads home preset values', () => {
      loadPreset('home');
      expect(document.getElementById('principal').value).toBe('250000');
      expect(document.getElementById('rate').value).toBe('6.5');
      expect(document.getElementById('term').value).toBe('30');
    });

    test('loads car preset', () => {
      loadPreset('car');
      expect(document.getElementById('principal').value).toBe('35000');
    });

    test('does nothing for invalid preset', () => {
      const before = document.getElementById('principal').value;
      loadPreset('invalid');
      expect(document.getElementById('principal').value).toBe(before);
    });
  });

  describe('calculate', () => {
    test('updates all display elements', () => {
      document.getElementById('principal').value = '100000';
      document.getElementById('rate').value = '5';
      document.getElementById('term').value = '10';
      calculate();

      expect(document.getElementById('emi').textContent).not.toBe('$0');
      expect(document.getElementById('total-interest').textContent).not.toBe('$0');
      expect(document.getElementById('total-payment').textContent).not.toBe('$0');
    });
  });

  describe('renderAmortization', () => {
    test('renders table rows', () => {
      const schedule = [
        { year: 1, principalPaid: 5000, interestPaid: 4000, balance: 95000 },
        { year: 2, principalPaid: 5200, interestPaid: 3800, balance: 89800 }
      ];
      renderAmortization(schedule);
      const body = document.getElementById('amort-body');
      expect(body.children.length).toBe(2);
    });
  });

  describe('updatePieChart', () => {
    test('updates pie gradient', () => {
      updatePieChart(200000, 100000);
      const pie = document.getElementById('pie-visual');
      expect(pie.style.background).toContain('conic-gradient');
    });

    test('updates legend text', () => {
      updatePieChart(200000, 100000);
      expect(document.getElementById('pie-principal').textContent).toBe('$200,000');
      expect(document.getElementById('pie-interest').textContent).toBe('$100,000');
    });
  });
});
