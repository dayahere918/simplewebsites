/**
 * @jest-environment jsdom
 */
const { 
  PRESETS_DATA, calculateEMI, calculateTotalPayment, calculateTotalInterest,
  generateAmortization, formatCurrency, loadPreset, calculate,
  updateDisplay, updatePieChart, renderAmortization, calculateMonthlyPayment
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <select id="preset-select">
      <option value="home">Home</option>
      <option value="car">Car</option>
    </select>
    <input id="principal" value="100000">
    <input id="rate" value="5">
    <input id="term" value="10">
    <span id="emi"></span>
    <span id="total-interest"></span>
    <span id="total-payment"></span>
    <div id="pie-visual"></div>
    <span id="pie-principal"></span>
    <span id="pie-interest"></span>
    <table>
      <tbody id="amort-body"></tbody>
    </table>
  `;
}

describe('Loan Visualizer', () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
  });

  describe('Core Math', () => {
    test('calculateEMI computes correct value', () => {
      // 100k, 5%, 10yr = 1060.66
      expect(calculateEMI(100000, 5, 10)).toBe(1060.66);
      expect(calculateEMI(0, 5, 10)).toBe(0); // 0 or negative
      expect(calculateEMI(100000, 0, 10)).toBeCloseTo(833.33); // 0% interest
      expect(calculateEMI(null, 5, 10)).toBe(0);
    });

    test('calculateTotalPayment & Interest', () => {
      const emi = 1060.66;
      const total = calculateTotalPayment(emi, 10);
      expect(total).toBe(127279.2);
      expect(calculateTotalInterest(total, 100000)).toBe(27279.2);
      
      expect(calculateTotalPayment(null, null)).toBe(0);
      expect(calculateTotalInterest(null, null)).toBe(0);
    });

    test('generateAmortization creates schedule array', () => {
      const schedule = generateAmortization(10000, 5, 1);
      expect(schedule.length).toBe(1);
      expect(schedule[0].year).toBe(1);
      expect(schedule[0].balance).toBeCloseTo(0, 0);

      expect(generateAmortization(0, 5, 1)).toEqual([]);
    });

    test('formatCurrency handles values correctly', () => {
      expect(formatCurrency(1234.5)).toBe('$1,235');
      expect(formatCurrency(null)).toBe('$0');
      expect(formatCurrency(NaN)).toBe('$0');
    });

    test('calculateMonthlyPayment uses simple fallback logic', () => {
      expect(calculateMonthlyPayment(100000, 5, 120)).toBeCloseTo(1060.66);
    });
  });

  describe('DOM & Interactivity', () => {
    test('loadPreset updates inputs and calculates', () => {
      loadPreset('home');
      expect(document.getElementById('principal').value).toBe(PRESETS_DATA.home.principal.toString());
      
      document.body.innerHTML = '';
      expect(() => loadPreset('home')).not.toThrow();
      expect(() => loadPreset('invalid')).not.toThrow();
    });

    test('calculate drives UI updates', () => {
      calculate();
      expect(document.getElementById('emi').textContent).not.toBe('');
      expect(document.getElementById('amort-body').innerHTML).toContain('<td>1</td>');
      
      document.body.innerHTML = '';
      expect(() => calculate()).not.toThrow();
    });

    test('updatePieChart safely ignores bad values or missing DOM', () => {
      document.body.innerHTML = '';
      expect(() => updatePieChart(0, 0)).not.toThrow();
      
      setupDOM();
      expect(() => updatePieChart(0, 0)).not.toThrow();
      updatePieChart(100000, 20000);
      expect(document.getElementById('pie-principal').textContent).toBe('$100,000');
    });

    test('updateDisplay safely handles missing DOM', () => {
      document.body.innerHTML = '';
      expect(() => updateDisplay({ emi: 100, totalInterest: 100, totalPayment: 100 })).not.toThrow();
    });

    test('renderAmortization safely handles missing DOM', () => {
      document.body.innerHTML = '';
      expect(() => renderAmortization([{ year: 1, principalPaid: 100, interestPaid: 100, balance: 0 }])).not.toThrow();
    });
  });
});
