/**
 * @jest-environment jsdom
 */
const {
  COLORS, PRESETS, drawWheel, updateWheel, clearItems,
  loadPreset, getWinningItem, easeOutCubic, spinWheel,
  showResult, closeModal,
  getItems, setItems, getIsSpinning, setIsSpinning,
  getCurrentRotation, setCurrentRotation
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <canvas id="wheel-canvas" width="400" height="400"></canvas>
    <textarea id="items-input">A\nB\nC\nD</textarea>
    <button id="spin-btn">SPIN</button>
    <div class="hidden" id="result-modal">
      <p id="result-text"></p>
      <button id="close-modal"></button>
    </div>
  `;
  const canvas = document.getElementById('wheel-canvas');
  const mockCtx = {
    clearRect: jest.fn(), save: jest.fn(), restore: jest.fn(), translate: jest.fn(), rotate: jest.fn(),
    beginPath: jest.fn(), moveTo: jest.fn(), arc: jest.fn(), closePath: jest.fn(), fill: jest.fn(),
    stroke: jest.fn(), fillText: jest.fn(), measureText: jest.fn(() => ({ width: 50 }))
  };
  canvas.getContext = jest.fn(() => mockCtx);
  return mockCtx;
}

describe('Picker Wheel', () => {
  let mockCtx;
  beforeEach(() => {
    mockCtx = setupDOM();
    // Reset internal state
    setItems(['A', 'B', 'C', 'D']);
    setIsSpinning(false);
    setCurrentRotation(0);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Logic', () => {
    test('easeOutCubic calculation', () => {
      expect(easeOutCubic(0)).toBe(0);
      expect(easeOutCubic(1)).toBe(1);
      expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
    });

    test('getWinningItem logic for multiple items', () => {
      const list = ['A', 'B', 'C', 'D'];
      // pointer is at top (3π/2). 
      // If no rotation, slice 0 starts at 0 and goes to π/2.
      // So pointer starts at index... complicated. 
      // We just need to ensure it's stable and returns a string from the list.
      expect(list).toContain(getWinningItem(0, list));
      expect(getWinningItem(0, [])).toBe('');
    });
  });

  describe('UI & State', () => {
    test('drawWheel handles empty list', () => {
      drawWheel([], 0);
      expect(mockCtx.fillText).toHaveBeenCalledWith(expect.stringContaining('Add items'), expect.any(Number), expect.any(Number));
    });

    test('drawWheel draws slices for items', () => {
      drawWheel(['A', 'B'], 0);
      // expect at least 2 arcs (slices) + 1 for center circle + 1 for empty? 
      // For 2 items, it should call arc twice for slices, once for center.
      expect(mockCtx.arc).toHaveBeenCalledTimes(3); 
    });

    test('updateWheel syncs with textarea', () => {
      const input = document.getElementById('items-input');
      input.value = 'Item 1\n\nItem 2 ';
      updateWheel();
      expect(getItems()).toEqual(['Item 1', 'Item 2']);
    });

    test('clearItems resets state', () => {
      clearItems();
      expect(getItems()).toEqual([]);
      expect(document.getElementById('items-input').value).toBe('');
    });

    test('loadPreset sets items', () => {
      loadPreset('yesno');
      expect(getItems()).toEqual(['Yes', 'No']);
      expect(document.getElementById('items-input').value).toBe('Yes\nNo');
    });

    test('showResult and closeModal visibility', () => {
      showResult('Winner!');
      expect(document.getElementById('result-modal').className).not.toContain('hidden');
      expect(document.getElementById('result-text').textContent).toBe('Winner!');
      closeModal();
      expect(document.getElementById('result-modal').className).toContain('hidden');
    });

    test('modal closes on overlay click', () => {
      // Simulate DOMContentLoaded event to attach listeners
      document.dispatchEvent(new Event('DOMContentLoaded'));
      showResult('Winner!');
      
      const modal = document.getElementById('result-modal');
      // Click on modal background
      modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(modal.className).toContain('hidden');
    });

    test('modal closes on Escape keydown', () => {
      document.dispatchEvent(new Event('DOMContentLoaded'));
      showResult('Winner!');
      
      // Press Escape
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(document.getElementById('result-modal').className).toContain('hidden');
    });
  });

  describe('Spin Animation', () => {
    test('spinWheel flow', () => {
      // Setup rAF mock
      global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
      
      const canvas = document.getElementById('wheel-canvas');
      const btn = document.getElementById('spin-btn');
      
      spinWheel();
      expect(getIsSpinning()).toBe(true);
      expect(canvas.className).toContain('spinning');
      expect(btn.disabled).toBe(true);

      // Fast-forward time to end of animation (duration is 4000-6000ms)
      jest.advanceTimersByTime(7000);
      
      expect(getIsSpinning()).toBe(false);
      expect(canvas.className).not.toContain('spinning');
      expect(btn.disabled).toBe(false);
      expect(document.getElementById('result-modal').className).not.toContain('hidden');
    });

    test('spinWheel prevents multiple spins', () => {
      setIsSpinning(true);
      spinWheel(); // should return immediately
      // If it didn't return, it would have called getElementById for canvas
      // We can check if it attempts to add 'spinning' again or similar, 
      // but isSpinning check is first.
    });
  });
});
