/**
 * AWS Cost Estimator — Core Logic
 */
const S3_PRICE_PER_GB = 0.023;
const S3_REQUESTS_PRICE = 0.005; // per 1000 requests
const S3_TRANSFER_PRICE = 0.09; // per GB after first 1GB free
const RDS_STORAGE_PRICE = 0.115; // per GB/month
const LAMBDA_REQUEST_PRICE = 0.20; // per million
const LAMBDA_COMPUTE_PRICE = 0.0000166667; // per GB-second

function getSelectedPrice(selectId) {
  if (typeof document === 'undefined') return 0;
  const sel = document.getElementById(selectId);
  if (!sel) return 0;
  const opt = sel.options[sel.selectedIndex];
  return parseFloat(opt?.dataset?.price || 0);
}

function getVal(id, fallback) {
  if (typeof document === 'undefined') return fallback || 0;
  const el = document.getElementById(id);
  return parseFloat(el?.value) || fallback || 0;
}

function calcEC2() {
  const pricePerHour = getSelectedPrice('ec2-type');
  const count = getVal('ec2-count', 0);
  const hours = getVal('ec2-hours', 730);
  return pricePerHour * count * hours;
}

function calcS3() {
  const storage = getVal('s3-storage', 0);
  const requests = getVal('s3-requests', 0);
  const transfer = Math.max(0, getVal('s3-transfer', 0) - 1); // first GB free
  return (storage * S3_PRICE_PER_GB) + (requests * S3_REQUESTS_PRICE) + (transfer * S3_TRANSFER_PRICE);
}

function calcRDS() {
  const pricePerHour = getSelectedPrice('rds-type');
  const storage = getVal('rds-storage', 0);
  const multiAZ = typeof document !== 'undefined' ? (document.getElementById('rds-multiaz')?.value === 'yes') : false;
  const instanceCost = pricePerHour * 730;
  const storageCost = storage * RDS_STORAGE_PRICE;
  const multiplier = multiAZ ? 2 : 1;
  return (instanceCost + storageCost) * multiplier;
}

function calcLambda() {
  const requests = getVal('lambda-requests', 0); // millions
  const duration = getVal('lambda-duration', 0); // ms
  const memory = getVal('lambda-memory', 256); // MB
  const requestCost = requests * LAMBDA_REQUEST_PRICE;
  const gbSeconds = (requests * 1e6) * (duration / 1000) * (memory / 1024);
  const computeCost = gbSeconds * LAMBDA_COMPUTE_PRICE;
  return Math.max(0, requestCost + computeCost);
}

function formatMoney(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
  const costs = {
    'EC2': calcEC2(),
    'S3': calcS3(),
    'RDS': calcRDS(),
    'Lambda': calcLambda()
  };
  const total = Object.values(costs).reduce((a, b) => a + b, 0);
  updateResults(costs, total);
}

function updateResults(costs, total) {
  if (typeof document === 'undefined') return;
  const totalEl = document.getElementById('total-cost');
  const annualEl = document.getElementById('annual-cost');
  const listEl = document.getElementById('breakdown-list');
  const chartEl = document.getElementById('chart-bars');

  if (totalEl) totalEl.textContent = formatMoney(total);
  if (annualEl) annualEl.textContent = formatMoney(total * 12) + '/year';

  const colors = { EC2: '#6c5ce7', S3: '#00cec9', RDS: '#fdcb6e', Lambda: '#e17055' };
  const icons = { EC2: '🖥️', S3: '📦', RDS: '🗄️', Lambda: '⚡' };
  const maxCost = Math.max(...Object.values(costs), 1);

  if (listEl) {
    listEl.innerHTML = Object.entries(costs).map(([name, cost]) =>
      `<div class="row"><span class="service-name">${icons[name]} ${name}</span><span class="service-cost">${formatMoney(cost)}</span></div>`
    ).join('');
  }

  if (chartEl) {
    chartEl.innerHTML = Object.entries(costs).map(([name, cost]) =>
      `<div class="bar-row">
        <span class="bar-label">${name}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(cost/maxCost*100).toFixed(1)}%;background:${colors[name]}"></div></div>
        <span class="bar-value">${formatMoney(cost)}</span>
      </div>`
    ).join('');
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', calculate);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { S3_PRICE_PER_GB, S3_REQUESTS_PRICE, S3_TRANSFER_PRICE, RDS_STORAGE_PRICE, LAMBDA_REQUEST_PRICE, LAMBDA_COMPUTE_PRICE,
    calcEC2, calcS3, calcRDS, calcLambda, formatMoney, calculate, updateResults, getVal, getSelectedPrice };
}
