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
    <span id="subtotal">$0.00</span>
    <span id="tip-amount">$0.00</span>
    <span id="total-amount">$0.00</span>
    <span id="per-person">$0.00</span>
    <div id="items-list"></div>
    <input id="item-name" value="">
    <input id="item-price" value="">
    <button class="tip-btn">10</button>
    <button class="tip-btn">15</button>
    <button class="tip-btn">20</button>
  `;
}

describe('BillSplitter', () => {
  beforeEach(() => {
    setupDOM();
    setCustomItems([]);
  });

  describe('calculateTip', () => {
    test('calculates 15% tip on $100', () => {
      expect(calculateTip(100, 15)).toBe(15);
    });

    test('calculates 20% tip on $50', () => {
      expect(calculateTip(50, 20)).toBe(10);
    });

    test('returns 0 for 0% tip', () => {
      expect(calculateTip(100, 0)).toBe(0);
    });

    test('returns 0 for negative amount', () => {
      expect(calculateTip(-100, 15)).toBe(0);
    });

    test('returns 0 for non-number inputs', () => {
      expect(calculateTip('abc', 15)).toBe(0);
      expect(calculateTip(100, 'abc')).toBe(0);
    });

    test('handles decimal percentages', () => {
      expect(calculateTip(100, 12.5)).toBe(12.5);
    });
  });

  describe('calculateTotal', () => {
    test('adds tip to amount', () => {
      expect(calculateTotal(100, 15)).toBe(115);
    });

    test('handles 0% tip', () => {
      expect(calculateTotal(100, 0)).toBe(100);
    });
  });

  describe('calculatePerPerson', () => {
    test('splits evenly', () => {
      expect(calculatePerPerson(100, 4)).toBe(25);
    });

    test('rounds to 2 decimals', () => {
      expect(calculatePerPerson(100, 3)).toBe(33.33);
    });

    test('returns total for 1 person', () => {
      expect(calculatePerPerson(100, 1)).toBe(100);
    });

    test('returns total for invalid people count', () => {
      expect(calculatePerPerson(100, 0)).toBe(100);
      expect(calculatePerPerson(100, -1)).toBe(100);
    });

    test('handles non-number people', () => {
      expect(calculatePerPerson(100, 'abc')).toBe(100);
    });
  });

  describe('formatCurrency', () => {
    test('formats whole number', () => {
      expect(formatCurrency(25)).toBe('$25.00');
    });

    test('formats decimal', () => {
      expect(formatCurrency(33.33)).toBe('$33.33');
    });

    test('formats zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    test('formats NaN as $0.00', () => {
      expect(formatCurrency(NaN)).toBe('$0.00');
    });

    test('handles non-number', () => {
      expect(formatCurrency('abc')).toBe('$0.00');
    });
  });

  describe('sumItems', () => {
    test('sums item prices', () => {
      const items = [{ price: 10 }, { price: 20 }, { price: 5 }];
      expect(sumItems(items)).toBe(35);
    });

    test('returns 0 for empty array', () => {
      expect(sumItems([])).toBe(0);
    });

    test('returns 0 for non-array', () => {
      expect(sumItems(null)).toBe(0);
    });

    test('handles items without price', () => {
      expect(sumItems([{ name: 'test' }])).toBe(0);
    });
  });

  describe('addItem', () => {
    test('adds item from inputs', () => {
      document.getElementById('item-name').value = 'Pizza';
      document.getElementById('item-price').value = '12.50';
      addItem();
      expect(getCustomItems().length).toBe(1);
      expect(getCustomItems()[0].name).toBe('Pizza');
      expect(getCustomItems()[0].price).toBe(12.50);
    });

    test('does not add with empty name', () => {
      document.getElementById('item-name').value = '';
      document.getElementById('item-price').value = '10';
      addItem();
      expect(getCustomItems().length).toBe(0);
    });

    test('does not add with invalid price', () => {
      document.getElementById('item-name').value = 'Test';
      document.getElementById('item-price').value = 'abc';
      addItem();
      expect(getCustomItems().length).toBe(0);
    });

    test('clears inputs after adding', () => {
      document.getElementById('item-name').value = 'Pizza';
      document.getElementById('item-price').value = '12';
      addItem();
      expect(document.getElementById('item-name').value).toBe('');
      expect(document.getElementById('item-price').value).toBe('');
    });
  });

  describe('removeItem', () => {
    test('removes item by id', () => {
      setCustomItems([{ name: 'A', price: 10, id: 1 }, { name: 'B', price: 20, id: 2 }]);
      removeItem(1);
      expect(getCustomItems().length).toBe(1);
      expect(getCustomItems()[0].name).toBe('B');
    });
  });

  describe('renderItems', () => {
    test('renders items to DOM', () => {
      setCustomItems([{ name: 'Pizza', price: 10, id: 1 }]);
      renderItems();
      const container = document.getElementById('items-list');
      expect(container.innerHTML).toContain('Pizza');
      expect(container.innerHTML).toContain('$10.00');
    });
  });

  describe('calculate', () => {
    test('calculates and updates display', () => {
      document.getElementById('bill-amount').value = '100';
      document.getElementById('num-people').value = '4';
      document.getElementById('tip-percent').value = '20';
      calculate();
      expect(document.getElementById('subtotal').textContent).toBe('$100.00');
      expect(document.getElementById('tip-amount').textContent).toBe('$20.00');
      expect(document.getElementById('total-amount').textContent).toBe('$120.00');
      expect(document.getElementById('per-person').textContent).toBe('$30.00');
    });

    test('includes custom items in subtotal', () => {
      document.getElementById('bill-amount').value = '50';
      document.getElementById('tip-percent').value = '0';
      document.getElementById('num-people').value = '2';
      setCustomItems([{ name: 'Extra', price: 10, id: 1 }]);
      calculate();
      expect(document.getElementById('subtotal').textContent).toBe('$60.00');
    });
  });

  describe('setTip', () => {
    test('updates tip input', () => {
      setTip(20);
      expect(document.getElementById('tip-percent').value).toBe('20');
    });
  });

  describe('resetAll', () => {
    test('resets all inputs and items', () => {
      document.getElementById('bill-amount').value = '200';
      setCustomItems([{ name: 'X', price: 5, id: 1 }]);
      resetAll();
      expect(document.getElementById('bill-amount').value).toBe('');
      expect(document.getElementById('num-people').value).toBe('2');
      expect(document.getElementById('tip-percent').value).toBe('15');
      expect(getCustomItems().length).toBe(0);
    });
  });

  describe('escapeHtml', () => {
    test('escapes HTML characters', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    });

    test('handles non-string', () => {
      expect(escapeHtml(null)).toBe('');
    });
  });
});
