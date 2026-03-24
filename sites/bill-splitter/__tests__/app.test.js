/**
 * @jest-environment jsdom
 */
const { 
  calculateTip, calculateTotal, calculatePerPerson, formatCurrency,
  sumItems, addItem, removeItem, renderItems, calculate,
  updateDisplay, setTip, resetAll, escapeHtml, shareResults,
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
    <button class="tip-btn">15</button>
  `;
}

// Mock Clipboard and Share
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined)
  },
  share: jest.fn().mockResolvedValue(undefined)
});

describe('Bill Splitter', () => {
  beforeEach(() => {
    setupDOM();
    setCustomItems([]);
    jest.clearAllMocks();
  });

  describe('Core Math Logic', () => {
    test('calculateTip handles invalid inputs', () => {
      expect(calculateTip(null, 15)).toBe(0);
      expect(calculateTip(100, -5)).toBe(0);
      expect(calculateTip(-100, 15)).toBe(0);
      expect(calculateTip('100', 15)).toBe(0);
      expect(calculateTip(100, 15)).toBe(15);
    });

    test('calculateTotal calculates correctly', () => {
      expect(calculateTotal(100, 15)).toBe(115);
    });

    test('calculatePerPerson handles invalid inputs', () => {
      expect(calculatePerPerson(100, 0)).toBe(100);
      expect(calculatePerPerson(100, null)).toBe(100);
      expect(calculatePerPerson(120, 3)).toBe(40);
    });

    test('formatCurrency edge cases', () => {
      expect(formatCurrency(NaN)).toBe('$0.00');
      expect(formatCurrency('text')).toBe('$0.00');
      expect(formatCurrency(-50)).toBe('$50.00');
      expect(formatCurrency(50.555)).toBe('$50.56');
    });

    test('sumItems returns 0 for non-array', () => {
      expect(sumItems(null)).toBe(0);
      expect(sumItems([{ price: 10 }, { name: 'No Price' }])).toBe(10);
    });
    
    test('escapeHtml handles strings correctly', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    });
  });

  describe('DOM & Actions', () => {
    test('addItem correctly adds valid items', () => {
      const name = document.getElementById('item-name');
      const price = document.getElementById('item-price');
      
      // Invalid
      name.value = ''; price.value = '10'; addItem();
      expect(getCustomItems().length).toBe(0);

      // Invalid negative
      name.value = 'A'; price.value = '-5'; addItem();
      expect(getCustomItems().length).toBe(0);
      
      // Valid
      name.value = 'Burger'; price.value = '15.50'; addItem();
      expect(getCustomItems().length).toBe(1);
      
      // Missing DOM
      document.body.innerHTML = '';
      expect(() => addItem()).not.toThrow();
    });

    test('removeItem and renderItems update UI', () => {
      setCustomItems([{ name: 'A', price: 10, id: 1 }]);
      removeItem(1);
      expect(getCustomItems().length).toBe(0);
      
      document.body.innerHTML = '';
      expect(() => renderItems()).not.toThrow();
    });
    
    test('calculate updates display with values', () => {
      setCustomItems([{ name: 'Drinks', price: 20, id: 1 }]);
      calculate();
      expect(document.getElementById('subtotal').textContent).toBe('$120.00'); // 100 + 20
      expect(document.getElementById('total-amount').textContent).toBe('$138.00'); // 120 + 15% tip
      
      document.body.innerHTML = '';
      expect(() => calculate()).not.toThrow();
    });
    
    test('updateDisplay handles missing DOM elements', () => {
      document.body.innerHTML = '';
      expect(() => updateDisplay({ subtotal: 1, tipAmount: 1, total: 1, perPerson: 1 })).not.toThrow();
    });

    test('setTip updates input and button active state', () => {
      setTip(20);
      expect(document.getElementById('tip-percent').value).toBe('20');
      
      document.body.innerHTML = '';
      expect(() => setTip(15)).not.toThrow();
    });

    test('shareResults uses share API or clipboard', () => {
      shareResults();
      expect(navigator.share).toHaveBeenCalled();
      
      delete navigator.share;
      shareResults();
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      
      document.body.innerHTML = '';
      expect(() => shareResults()).not.toThrow();
    });
    
    test('resetAll clears all fields', () => {
      setCustomItems([{ name: 'A', price: 10, id: 1 }]);
      resetAll();
      expect(getCustomItems().length).toBe(0);
      expect(document.getElementById('bill-amount').value).toBe('');
      
      document.body.innerHTML = '';
      expect(() => resetAll()).not.toThrow();
    });
  });
});
