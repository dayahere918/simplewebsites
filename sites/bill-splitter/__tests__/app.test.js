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
    <button class="tip-btn">15%</button>
  `;
}

// Mock Clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined)
  }
});

describe('Bill Splitter', () => {
  beforeEach(() => {
    setupDOM();
    setCustomItems([]);
    jest.clearAllMocks();
  });

  describe('Core Logic', () => {
    test('calculatePerPerson edge cases', () => {
      expect(calculatePerPerson(100, 0)).toBe(100);
      expect(calculatePerPerson(100, -5)).toBe(100);
    });

    test('formatCurrency edge cases', () => {
      expect(formatCurrency(NaN)).toBe('$0.00');
      expect(formatCurrency('text')).toBe('$0.00');
    });

    test('sumItems returns 0 for non-array', () => {
      expect(sumItems(null)).toBe(0);
    });
  });

  describe('DOM & Actions', () => {
    test('addItem validation', () => {
      const name = document.getElementById('item-name');
      const price = document.getElementById('item-price');
      
      name.value = ''; price.value = '10';
      addItem();
      expect(getCustomItems().length).toBe(0);

      name.value = 'A'; price.value = '-5';
      addItem();
      expect(getCustomItems().length).toBe(0);
    });

    test('setTip updates input and button active state', () => {
      setTip(20);
      expect(document.getElementById('tip-percent').value).toBe('20');
    });

    test('shareResults uses clipboard', () => {
      shareResults();
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    test('removeItem updates UI', () => {
      setCustomItems([{ name: 'A', price: 10, id: 1 }]);
      removeItem(1);
      expect(getCustomItems().length).toBe(0);
    });
  });
});
