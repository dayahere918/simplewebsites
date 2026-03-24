/**
 * Picker Wheel — Core Application Logic
 * Random selection wheel with canvas animation
 */

const COLORS = [
  '#6c5ce7', '#a29bfe', '#00cec9', '#55efc4', '#fd79a8',
  '#e17055', '#fdcb6e', '#00b894', '#0984e3', '#e84393',
  '#d63031', '#74b9ff', '#ffeaa7', '#fab1a0', '#81ecec'
];

const PRESETS = {
  yesno: ['Yes', 'No'],
  numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  colors: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink'],
  food: ['Pizza', 'Sushi', 'Tacos', 'Burgers', 'Pasta', 'Salad', 'Ramen']
};

let items = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
let currentRotation = 0;
let isSpinning = false;

/**
 * Get canvas and context
 * @returns {{canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D}|null}
 */
function getCanvas() {
  if (typeof document === 'undefined') return null;
  const canvas = document.getElementById('wheel-canvas');
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  return { canvas, ctx };
}

/**
 * Draw the wheel on the canvas
 * @param {string[]} itemList - Items to display on the wheel
 * @param {number} rotation - Current rotation in radians
 */
function drawWheel(itemList, rotation) {
  const result = getCanvas();
  if (!result) return;

  const { canvas, ctx } = result;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 10;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation || 0);

  if (!itemList || itemList.length === 0) {
    // Draw empty wheel
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#888';
    ctx.font = '16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Add items to spin!', 0, 0);
    ctx.restore();
    return;
  }

  const sliceAngle = (Math.PI * 2) / itemList.length;

  itemList.forEach((item, i) => {
    const startAngle = i * sliceAngle;
    const endAngle = startAngle + sliceAngle;

    // Draw slice
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();

    // Draw border
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw text
    ctx.save();
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';

    const fontSize = Math.min(16, Math.max(10, 200 / itemList.length));
    ctx.font = `600 ${fontSize}px Inter, sans-serif`;

    const maxTextWidth = radius * 0.65;
    let displayText = item;
    while (ctx.measureText(displayText).width > maxTextWidth && displayText.length > 3) {
      displayText = displayText.slice(0, -1);
    }
    if (displayText !== item) displayText += '…';

    ctx.fillText(displayText, radius - 20, fontSize / 3);
    ctx.restore();
  });

  // Center circle
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0f';
  ctx.fill();
  ctx.strokeStyle = '#6c5ce7';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
}

/**
 * Update the wheel with items from the textarea
 */
function updateWheel() {
  if (typeof document === 'undefined') return;
  const textarea = document.getElementById('items-input');
  if (!textarea) return;

  const text = textarea.value.trim();
  if (text) {
    items = text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
  }

  if (items.length === 0) {
    items = ['Option 1', 'Option 2'];
  }

  currentRotation = 0;
  drawWheel(items, currentRotation);
}

/**
 * Clear all items
 */
function clearItems() {
  if (typeof document === 'undefined') return;
  const textarea = document.getElementById('items-input');
  if (textarea) textarea.value = '';
  items = [];
  currentRotation = 0;
  drawWheel(items, currentRotation);
}

/**
 * Load a preset list
 * @param {string} presetName
 */
function loadPreset(presetName) {
  if (typeof document === 'undefined') return;
  const presetItems = PRESETS[presetName];
  if (!presetItems) return;

  const textarea = document.getElementById('items-input');
  if (textarea) textarea.value = presetItems.join('\n');
  items = [...presetItems];
  currentRotation = 0;
  drawWheel(items, currentRotation);
}

/**
 * Calculate the winning item based on final rotation
 * @param {number} rotation - Final rotation in radians
 * @param {string[]} itemList
 * @returns {string}
 */
function getWinningItem(rotation, itemList) {
  if (!itemList || itemList.length === 0) return '';

  const sliceAngle = (Math.PI * 2) / itemList.length;
  // Pointer is at top (3π/2 or -π/2). Normalize rotation.
  const normalizedRotation = ((Math.PI * 2) - (rotation % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
  // Offset: pointer is at top, which is -90 degrees, i.e., 3π/2
  const pointerAngle = (normalizedRotation + Math.PI / 2) % (Math.PI * 2);
  const winIndex = Math.floor(pointerAngle / sliceAngle) % itemList.length;

  return itemList[winIndex];
}

/**
 * Easing function for spin animation
 * @param {number} t - Progress 0–1
 * @returns {number}
 */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Spin the wheel with animation
 */
function spinWheel() {
  if (isSpinning || !items || items.length === 0) return;
  isSpinning = true;

  const canvas = typeof document !== 'undefined' ? document.getElementById('wheel-canvas') : null;
  const spinBtn = typeof document !== 'undefined' ? document.getElementById('spin-btn') : null;

  if (canvas) canvas.classList.add('spinning');
  if (spinBtn) spinBtn.disabled = true;

  const spinAmount = Math.PI * 2 * (5 + Math.random() * 5); // 5–10 full rotations
  const startRotation = currentRotation;
  const targetRotation = startRotation + spinAmount;
  const duration = 4000 + Math.random() * 2000; // 4–6 seconds
  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);

    currentRotation = startRotation + spinAmount * easedProgress;
    drawWheel(items, currentRotation);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      if (canvas) canvas.classList.remove('spinning');
      if (spinBtn) spinBtn.disabled = false;
      currentRotation = targetRotation;

      const winner = getWinningItem(currentRotation, items);
      showResult(winner);
    }
  }

  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(animate);
  }
}

/**
 * Show the result modal
 * @param {string} winner
 */
function showResult(winner) {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('result-modal');
  const resultText = document.getElementById('result-text');
  if (modal) modal.classList.remove('hidden');
  if (resultText) resultText.textContent = winner;
}

/**
 * Close the result modal
 */
function closeModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('result-modal');
  if (modal) modal.classList.add('hidden');
}

// Initialize on page load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('items-input');
    if (textarea) textarea.value = items.join('\n');
    drawWheel(items, 0);

    // Close modal on overlay click
    const modal = document.getElementById('result-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    COLORS, PRESETS, drawWheel, updateWheel, clearItems,
    loadPreset, getWinningItem, easeOutCubic, spinWheel,
    showResult, closeModal,
    getItems: () => items,
    setItems: (newItems) => { items = newItems; },
    getIsSpinning: () => isSpinning,
    setIsSpinning: (val) => { isSpinning = val; },
    getCurrentRotation: () => currentRotation,
    setCurrentRotation: (val) => { currentRotation = val; }
  };
}
