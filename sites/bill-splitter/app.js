/**
 * Bill Splitter — Core Logic
 */

let customItems = [];

/**
 * Calculate tip amount
 * @param {number} amount - Bill subtotal
 * @param {number} tipPercent - Tip percentage
 * @returns {number}
 */
function calculateTip(amount, tipPercent) {
  if (typeof amount !== 'number' || typeof tipPercent !== 'number') return 0;
  if (amount < 0 || tipPercent < 0) return 0;
  return Math.round(amount * tipPercent) / 100;
}

/**
 * Calculate total with tip
 * @param {number} amount
 * @param {number} tipPercent
 * @returns {number}
 */
function calculateTotal(amount, tipPercent) {
  return amount + calculateTip(amount, tipPercent);
}

/**
 * Calculate per-person share
 * @param {number} total
 * @param {number} numPeople
 * @returns {number}
 */
function calculatePerPerson(total, numPeople) {
  if (typeof numPeople !== 'number' || numPeople < 1) return total;
  return Math.round((total / numPeople) * 100) / 100;
}

/**
 * Format currency
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  return '$' + (Math.round(Math.abs(amount) * 100) / 100).toFixed(2);
}

/**
 * Sum all custom items
 * @param {Array} items
 * @returns {number}
 */
function sumItems(items) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + (item.price || 0), 0);
}

/**
 * Add a custom item
 */
function addItem() {
  if (typeof document === 'undefined') return;
  const nameInput = document.getElementById('item-name');
  const priceInput = document.getElementById('item-price');
  if (!nameInput || !priceInput) return;

  const name = nameInput.value.trim();
  const price = parseFloat(priceInput.value);

  if (!name || isNaN(price) || price < 0) return;

  customItems.push({ name, price, id: Date.now() });
  nameInput.value = '';
  priceInput.value = '';
  renderItems();
  calculate();
}

/**
 * Remove a custom item by ID
 * @param {number} id
 */
function removeItem(id) {
  customItems = customItems.filter(item => item.id !== id);
  renderItems();
  calculate();
}

/**
 * Render custom items list
 */
function renderItems() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('items-list');
  if (!container) return;

  container.innerHTML = customItems.map(item =>
    `<div class="item-row">
      <span class="item-name">${escapeHtml(item.name)}</span>
      <span class="item-price">${formatCurrency(item.price)}</span>
      <button class="remove-btn" onclick="removeItem(${item.id})">✕</button>
    </div>`
  ).join('');
}

/**
 * Main calculate function — reads inputs and updates display
 */
function calculate() {
  if (typeof document === 'undefined') return;

  const billInput = document.getElementById('bill-amount');
  const peopleInput = document.getElementById('num-people');
  const tipInput = document.getElementById('tip-percent');

  const billAmount = parseFloat(billInput ? billInput.value : 0) || 0;
  const numPeople = parseInt(peopleInput ? peopleInput.value : 2, 10) || 1;
  const tipPercent = parseFloat(tipInput ? tipInput.value : 15) || 0;

  const itemsTotal = sumItems(customItems);
  const subtotal = billAmount + itemsTotal;
  const tipAmount = calculateTip(subtotal, tipPercent);
  const total = subtotal + tipAmount;
  const perPerson = calculatePerPerson(total, numPeople);

  updateDisplay({ subtotal, tipAmount, total, perPerson });
}

/**
 * Update the results display
 * @param {{subtotal: number, tipAmount: number, total: number, perPerson: number}} results
 */
function updateDisplay(results) {
  if (typeof document === 'undefined') return;

  const els = {
    subtotal: document.getElementById('subtotal'),
    tipAmount: document.getElementById('tip-amount'),
    totalAmount: document.getElementById('total-amount'),
    perPerson: document.getElementById('per-person')
  };

  if (els.subtotal) els.subtotal.textContent = formatCurrency(results.subtotal);
  if (els.tipAmount) els.tipAmount.textContent = formatCurrency(results.tipAmount);
  if (els.totalAmount) els.totalAmount.textContent = formatCurrency(results.total);
  if (els.perPerson) els.perPerson.textContent = formatCurrency(results.perPerson);
}

/**
 * Set tip percentage
 * @param {number} percent
 */
function setTip(percent) {
  if (typeof document === 'undefined') return;
  const tipInput = document.getElementById('tip-percent');
  if (tipInput) tipInput.value = percent;

  // Update active state on buttons
  document.querySelectorAll('.tip-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.textContent) === percent);
  });

  calculate();
}

/**
 * Share results via Web Share API or copy to clipboard
 */
function shareResults() {
  if (typeof document === 'undefined') return;

  const perPerson = document.getElementById('per-person');
  const total = document.getElementById('total-amount');
  const text = `Bill Split: ${total ? total.textContent : '$0.00'} total, ${perPerson ? perPerson.textContent : '$0.00'} per person. Split with Bill Splitter!`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({ title: 'Bill Splitter', text });
  } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
}

/**
 * Reset all fields
 */
function resetAll() {
  if (typeof document === 'undefined') return;
  const billInput = document.getElementById('bill-amount');
  const peopleInput = document.getElementById('num-people');
  const tipInput = document.getElementById('tip-percent');

  if (billInput) billInput.value = '';
  if (peopleInput) peopleInput.value = '2';
  if (tipInput) tipInput.value = '15';

  customItems = [];
  renderItems();
  calculate();
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateTip, calculateTotal, calculatePerPerson, formatCurrency,
    sumItems, addItem, removeItem, renderItems, calculate,
    updateDisplay, setTip, shareResults, resetAll, escapeHtml,
    getCustomItems: () => customItems,
    setCustomItems: (items) => { customItems = items; }
  };
}
