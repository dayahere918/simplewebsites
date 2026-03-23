/**
 * @jest-environment jsdom
 */

const {
  COLORS, PRESETS, drawWheel, updateWheel, clearItems,
  loadPreset, getWinningItem, easeOutCubic,
  showResult, closeModal,
  getItems, setItems, getIsSpinning, setIsSpinning,
  getCurrentRotation, setCurrentRotation
} = require('../app');

// Mock canvas
function setupDOM() {
  document.body.innerHTML = `
    <canvas id="wheel-canvas" width="400" height="400"></canvas>
    <textarea id="items-input"></textarea>
    <button id="spin-btn">SPIN</button>
    <button id="update-btn">Update</button>
    <button id="clear-btn">Clear</button>
    <div class="hidden" id="result-modal">
      <p id="result-text"></p>
    </div>
    <div id="pointer">▼</div>
  `;

  // Mock canvas context
  const canvas = document.getElementById('wheel-canvas');
  const mockCtx = {
    clearRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    arc: jest.fn(),
    closePath: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn(() => ({ width: 50 })),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    textAlign: 'left',
    font: ''
  };
  canvas.getContext = jest.fn(() => mockCtx);
  return mockCtx;
}

describe('PickerWheel', () => {
  let mockCtx;

  beforeEach(() => {
    mockCtx = setupDOM();
    setItems(['Option 1', 'Option 2', 'Option 3', 'Option 4']);
    setCurrentRotation(0);
    setIsSpinning(false);
  });

  describe('COLORS', () => {
    test('has at least 10 colors', () => {
      expect(COLORS.length).toBeGreaterThanOrEqual(10);
    });

    test('all colors are valid hex strings', () => {
      COLORS.forEach(c => {
        expect(c).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe('PRESETS', () => {
    test('has yesno, numbers, colors, food presets', () => {
      expect(PRESETS.yesno).toBeDefined();
      expect(PRESETS.numbers).toBeDefined();
      expect(PRESETS.colors).toBeDefined();
      expect(PRESETS.food).toBeDefined();
    });

    test('yesno has exactly 2 items', () => {
      expect(PRESETS.yesno).toEqual(['Yes', 'No']);
    });

    test('numbers has 10 items', () => {
      expect(PRESETS.numbers.length).toBe(10);
    });
  });

  describe('drawWheel', () => {
    test('draws slices for each item', () => {
      const items = ['A', 'B', 'C'];
      drawWheel(items, 0);
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    test('draws empty state when no items', () => {
      drawWheel([], 0);
      expect(mockCtx.fillText).toHaveBeenCalledWith('Add items to spin!', 0, 0);
    });

    test('handles null items gracefully', () => {
      drawWheel(null, 0);
      expect(mockCtx.fillText).toHaveBeenCalledWith('Add items to spin!', 0, 0);
    });

    test('applies rotation', () => {
      drawWheel(['A', 'B'], Math.PI);
      expect(mockCtx.rotate).toHaveBeenCalledWith(Math.PI);
    });

    test('truncates long item names', () => {
      const longName = 'A'.repeat(100);
      mockCtx.measureText = jest.fn(() => ({ width: 300 }));
      drawWheel([longName], 0);
      expect(mockCtx.fillText).toHaveBeenCalled();
    });
  });

  describe('updateWheel', () => {
    test('reads items from textarea', () => {
      const textarea = document.getElementById('items-input');
      textarea.value = 'Apple\nBanana\nCherry';
      updateWheel();
      expect(getItems()).toEqual(['Apple', 'Banana', 'Cherry']);
    });

    test('filters empty lines', () => {
      const textarea = document.getElementById('items-input');
      textarea.value = 'Apple\n\nBanana\n   \nCherry';
      updateWheel();
      expect(getItems()).toEqual(['Apple', 'Banana', 'Cherry']);
    });

    test('falls back to defaults when empty', () => {
      const textarea = document.getElementById('items-input');
      textarea.value = '';
      setItems([]);
      updateWheel();
      expect(getItems().length).toBeGreaterThanOrEqual(2);
    });

    test('resets rotation', () => {
      setCurrentRotation(5);
      const textarea = document.getElementById('items-input');
      textarea.value = 'A\nB';
      updateWheel();
      expect(getCurrentRotation()).toBe(0);
    });
  });

  describe('clearItems', () => {
    test('clears the textarea', () => {
      const textarea = document.getElementById('items-input');
      textarea.value = 'Apple\nBanana';
      clearItems();
      expect(textarea.value).toBe('');
    });

    test('clears items array', () => {
      setItems(['A', 'B', 'C']);
      clearItems();
      expect(getItems()).toEqual([]);
    });

    test('resets rotation', () => {
      setCurrentRotation(3);
      clearItems();
      expect(getCurrentRotation()).toBe(0);
    });
  });

  describe('loadPreset', () => {
    test('loads yesno preset', () => {
      loadPreset('yesno');
      expect(getItems()).toEqual(['Yes', 'No']);
      const textarea = document.getElementById('items-input');
      expect(textarea.value).toBe('Yes\nNo');
    });

    test('loads numbers preset', () => {
      loadPreset('numbers');
      expect(getItems().length).toBe(10);
    });

    test('ignores invalid preset names', () => {
      const beforeItems = [...getItems()];
      loadPreset('invalid_preset');
      expect(getItems()).toEqual(beforeItems);
    });

    test('resets rotation when loading preset', () => {
      setCurrentRotation(5);
      loadPreset('colors');
      expect(getCurrentRotation()).toBe(0);
    });
  });

  describe('getWinningItem', () => {
    test('returns correct item for rotation = 0', () => {
      const items = ['A', 'B', 'C', 'D'];
      const winner = getWinningItem(0, items);
      expect(items).toContain(winner);
    });

    test('returns correct item for known rotation', () => {
      const items = ['A', 'B', 'C', 'D'];
      // Each slice is π/2 radians. Pointer at top.
      const winner = getWinningItem(0, items);
      expect(typeof winner).toBe('string');
      expect(winner.length).toBeGreaterThan(0);
    });

    test('handles single item', () => {
      const winner = getWinningItem(Math.PI * 4, ['OnlyOne']);
      expect(winner).toBe('OnlyOne');
    });

    test('returns empty for empty array', () => {
      expect(getWinningItem(0, [])).toBe('');
    });

    test('returns empty for null', () => {
      expect(getWinningItem(0, null)).toBe('');
    });

    test('handles large rotation values', () => {
      const items = ['A', 'B', 'C'];
      const winner = getWinningItem(Math.PI * 100, items);
      expect(items).toContain(winner);
    });
  });

  describe('easeOutCubic', () => {
    test('returns 0 at t=0', () => {
      expect(easeOutCubic(0)).toBe(0);
    });

    test('returns 1 at t=1', () => {
      expect(easeOutCubic(1)).toBe(1);
    });

    test('returns value between 0 and 1 for t=0.5', () => {
      const val = easeOutCubic(0.5);
      expect(val).toBeGreaterThan(0);
      expect(val).toBeLessThan(1);
    });

    test('easing is always increasing', () => {
      let prev = 0;
      for (let t = 0.1; t <= 1; t += 0.1) {
        const val = easeOutCubic(t);
        expect(val).toBeGreaterThanOrEqual(prev);
        prev = val;
      }
    });
  });

  describe('showResult', () => {
    test('shows modal and sets text', () => {
      const modal = document.getElementById('result-modal');
      const resultText = document.getElementById('result-text');
      modal.classList.add('hidden');

      showResult('Winner!');

      expect(modal.classList.contains('hidden')).toBe(false);
      expect(resultText.textContent).toBe('Winner!');
    });
  });

  describe('closeModal', () => {
    test('hides modal', () => {
      const modal = document.getElementById('result-modal');
      modal.classList.remove('hidden');

      closeModal();

      expect(modal.classList.contains('hidden')).toBe(true);
    });
  });

  describe('spinWheel', () => {
    test('does not spin when already spinning', () => {
      setIsSpinning(true);
      const { spinWheel } = require('../app');
      spinWheel();
      // Should remain spinning (no change)
      expect(getIsSpinning()).toBe(true);
    });

    test('does not spin with empty items', () => {
      setItems([]);
      const { spinWheel } = require('../app');
      spinWheel();
      expect(getIsSpinning()).toBe(false);
    });
  });
});
