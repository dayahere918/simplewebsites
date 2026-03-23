/**
 * Loan Visualizer — Core Logic
 * EMI calculation with amortization schedule
 */

const PRESETS_DATA = {
  home: { principal: 250000, rate: 6.5, term: 30 },
  car: { principal: 35000, rate: 5.5, term: 5 },
  personal: { principal: 15000, rate: 10.0, term: 3 },
  student: { principal: 40000, rate: 4.5, term: 10 }
};

/**
 * Calculate monthly EMI
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (%)
 * @param {number} years - Loan term in years
 * @returns {number} Monthly EMI
 */
function calculateEMI(principal, annualRate, years) {
  if (typeof principal !== 'number' || typeof annualRate !== 'number' || typeof years !== 'number') return 0;
  if (principal <= 0 || years <= 0) return 0;
  if (annualRate === 0) return principal / (years * 12);

  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / (Math.pow(1 + monthlyRate, numPayments) - 1);

  return Math.round(emi * 100) / 100;
}

/**
 * Calculate total payment
 * @param {number} emi - Monthly EMI
 * @param {number} years - Loan term in years
 * @returns {number}
 */
function calculateTotalPayment(emi, years) {
  if (typeof emi !== 'number' || typeof years !== 'number') return 0;
  return Math.round(emi * years * 12 * 100) / 100;
}

/**
 * Calculate total interest
 * @param {number} totalPayment
 * @param {number} principal
 * @returns {number}
 */
function calculateTotalInterest(totalPayment, principal) {
  if (typeof totalPayment !== 'number' || typeof principal !== 'number') return 0;
  return Math.round((totalPayment - principal) * 100) / 100;
}

/**
 * Generate yearly amortization schedule
 * @param {number} principal
 * @param {number} annualRate - Annual interest rate (%)
 * @param {number} years
 * @returns {Array<{year: number, principalPaid: number, interestPaid: number, balance: number}>}
 */
function generateAmortization(principal, annualRate, years) {
  if (principal <= 0 || years <= 0) return [];

  const monthlyRate = annualRate / 100 / 12;
  const emi = calculateEMI(principal, annualRate, years);
  const schedule = [];
  let balance = principal;

  for (let year = 1; year <= years; year++) {
    let yearPrincipal = 0;
    let yearInterest = 0;

    for (let month = 0; month < 12; month++) {
      if (balance <= 0) break;
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(emi - interestPayment, balance);
      yearInterest += interestPayment;
      yearPrincipal += principalPayment;
      balance -= principalPayment;
    }

    schedule.push({
      year,
      principalPaid: Math.round(yearPrincipal * 100) / 100,
      interestPaid: Math.round(yearInterest * 100) / 100,
      balance: Math.max(0, Math.round(balance * 100) / 100)
    });
  }

  return schedule;
}

/**
 * Format currency for display
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0';
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/**
 * Load a preset
 * @param {string} presetName
 */
function loadPreset(presetName) {
  const preset = PRESETS_DATA[presetName];
  if (!preset) return;
  if (typeof document === 'undefined') return;

  const principalInput = document.getElementById('principal');
  const rateInput = document.getElementById('rate');
  const termInput = document.getElementById('term');

  if (principalInput) principalInput.value = preset.principal;
  if (rateInput) rateInput.value = preset.rate;
  if (termInput) termInput.value = preset.term;

  calculate();
}

/**
 * Main calculate and render function
 */
function calculate() {
  if (typeof document === 'undefined') return;

  const principal = parseFloat(document.getElementById('principal')?.value) || 0;
  const rate = parseFloat(document.getElementById('rate')?.value) || 0;
  const term = parseInt(document.getElementById('term')?.value) || 0;

  const emi = calculateEMI(principal, rate, term);
  const totalPayment = calculateTotalPayment(emi, term);
  const totalInterest = calculateTotalInterest(totalPayment, principal);
  const schedule = generateAmortization(principal, rate, term);

  updateDisplay({ emi, totalPayment, totalInterest, principal });
  updatePieChart(principal, totalInterest);
  renderAmortization(schedule);
}

/**
 * Update summary stats
 */
function updateDisplay(results) {
  if (typeof document === 'undefined') return;
  const emiEl = document.getElementById('emi');
  const interestEl = document.getElementById('total-interest');
  const paymentEl = document.getElementById('total-payment');

  if (emiEl) emiEl.textContent = formatCurrency(results.emi);
  if (interestEl) interestEl.textContent = formatCurrency(results.totalInterest);
  if (paymentEl) paymentEl.textContent = formatCurrency(results.totalPayment);
}

/**
 * Update the CSS pie chart
 */
function updatePieChart(principal, totalInterest) {
  if (typeof document === 'undefined') return;
  const total = principal + totalInterest;
  if (total <= 0) return;

  const principalPct = (principal / total) * 100;
  const pieEl = document.getElementById('pie-visual');
  const piePrincipal = document.getElementById('pie-principal');
  const pieInterest = document.getElementById('pie-interest');

  if (pieEl) {
    pieEl.style.background = `conic-gradient(var(--color-primary) 0% ${principalPct}%, var(--color-error) ${principalPct}% 100%)`;
  }
  if (piePrincipal) piePrincipal.textContent = formatCurrency(principal);
  if (pieInterest) pieInterest.textContent = formatCurrency(totalInterest);
}

/**
 * Render amortization table
 */
function renderAmortization(schedule) {
  if (typeof document === 'undefined') return;
  const body = document.getElementById('amort-body');
  if (!body) return;

  body.innerHTML = schedule.map(row =>
    `<tr>
      <td>${row.year}</td>
      <td>${formatCurrency(row.principalPaid)}</td>
      <td>${formatCurrency(row.interestPaid)}</td>
      <td>${formatCurrency(row.balance)}</td>
    </tr>`
  ).join('');
}

// Initialize
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', calculate);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PRESETS_DATA, calculateEMI, calculateTotalPayment, calculateTotalInterest,
    generateAmortization, formatCurrency, loadPreset, calculate,
    updateDisplay, updatePieChart, renderAmortization
  };
}
