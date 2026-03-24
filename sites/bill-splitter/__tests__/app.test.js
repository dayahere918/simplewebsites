/**
 * @jest-environment jsdom
 */
const { 
  calculateTip, calculateTotal, calculatePerPerson, formatCurrency,
  sumItems, addItem, removeItem, renderItems, calculate,
  updateDisplay, setTip, resetAll, escapeHtml,
  getCustomItems, setCustomItems 
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <input id="bill-amount" value="100">
    <input id="num-people" value="4">
    <input id="tip-percent" value="15">
    <span id="subtotal"></span>
    <span id="tip-amount"></span>
    <span id="total-amount"></span>
    <span id="per-person"></span>
    <div id="items-list"></div>
    <input id="item-name">
    <input id="item-price">
  `;
}

describe('Bill Splitter', () => {
  beforeEach(() => {
    setupDOM();
    setCustomItems([]);
  });

  describe('Core Logic', () => {
    test('calculateTip handles standard and edge cases', () => {
      expect(calculateTip(100, 15)).toBe(15);
      expect(calculateTip(100, 0)).toBe(0);
      expect(calculateTip(-100, 15)).toBe(0);
      expect(calculateTip(100, -1)).toBe(0);
    });

    test('calculateTotal sums subtotal and tip', () => {
      expect(calculateTotal(100, 15)).toBe(115);
    });

    test('calculatePerPerson handles division and rounding', () => {
      expect(calculatePerPerson(100, 4)).toBe(25);
      expect(calculatePerPerson(100, 3)).toBe(33.33);
      expect(calculatePerPerson(100, 0)).toBe(100);
    });

    test('formatCurrency utility', () => {
      expect(formatCurrency(10.5)).toBe('$10.50');
      expect(formatCurrency(NaN)).toBe('$0.00');
      expect(formatCurrency('abc')).toBe('$0.00');
    });

    test('sumItems totalizes array', () => {
      expect(sumItems([{ price: 10 }, { price: 20 }])).toBe(30);
      expect(sumItems(null)).toBe(0);
    });
  });

  describe('DOM Interactions', () => {
    test('addItem updates state and clearing inputs', () => {
      document.getElementById('item-name').value = 'Pizza';
      document.getElementById('item-price').value = '20';
      addItem();
      expect(getCustomItems().length).toBe(1);
      expect(document.getElementById('item-name').value).toBe('');
      expect(document.getElementById('items-list').innerHTML).toContain('Pizza');
    });

    test('removeItem updates list', () => {
      const id = Date.now();
      setCustomItems([{ name: 'A', price: 10, id }]);
      removeItem(id);
      expect(getCustomItems().length).toBe(0);
    });

    test('calculate updates all fields', () => {
      calculate();
      expect(document.getElementById('subtotal').textContent).toBe('$100.00');
      expect(document.getElementById('total-amount').textContent).toBe('$115.00');
    });

    test('resetAll clears everything', () => {
      setCustomItems([{ name: 'X', price: 10, id: 1 }]);
      resetAll();
      expect(getCustomItems().length).toBe(0);
      expect(document.getElementById('bill-amount').value).toBe('');
    });
  });
});

