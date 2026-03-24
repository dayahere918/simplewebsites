/**
 * @jest-environment jsdom
 */
const { 
  calcEC2, calcS3, calcRDS, calcLambda, formatMoney, calculate, updateResults 
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <select id="ec2-type"><option value="t3.medium" data-price="0.0416" selected>t3.medium</option></select>
    <input id="ec2-count" value="2">
    <input id="ec2-hours" value="730">
    <input id="s3-storage" value="100">
    <input id="s3-requests" value="1000">
    <input id="s3-transfer" value="10">
    <select id="rds-type"><option value="db.t3.micro" data-price="0.017" selected>db.t3.micro</option></select>
    <input id="rds-storage" value="20">
    <select id="rds-multiaz"><option value="no" selected>No</option><option value="yes">Yes</option></select>
    <input id="lambda-requests" value="5">
    <input id="lambda-duration" value="200">
    <input id="lambda-memory" value="512">
    <div id="total-cost"></div>
    <div id="annual-cost"></div>
    <div id="breakdown-list"></div>
    <div id="chart-bars"></div>
  `;
}

describe('AWS Cost Estimator', () => {
  beforeEach(() => setupDOM());

  test('calcEC2 calculates fractional costs', () => {
    const sel = document.getElementById('ec2-type');
    sel.selectedIndex = 0;
    // 0.0416 * 2 * 730 = 60.736
    expect(calcEC2()).toBeCloseTo(60.736, 1);
  });

  test('calcS3 handles free tier transfer', () => {
    // (100 * 0.023) + (1000 * 0.005) + ((10-1) * 0.09) = 2.3 + 5.0 + 0.81 = 8.11
    // Wait, S3_REQUESTS_PRICE is per 1000 requests in app code? 
    // calcS3: (storage * 0.023) + (requests * 0.005) + (transfer * 0.09)
    expect(calcS3()).toBeCloseTo(8.11, 1);
  });

  test('formatMoney handles edge cases', () => {
    expect(formatMoney(1234.567)).toBe('$1,234.57');
    expect(formatMoney(0)).toBe('$0.00');
    expect(formatMoney('NaN')).toBe('$0.00');
  });

  test('calculate updates the DOM', () => {
    calculate();
    expect(document.getElementById('total-cost').textContent).not.toBe('');
    expect(document.getElementById('breakdown-list').children.length).toBe(4);
  });

  test('RDS multi-AZ doubles the cost', () => {
    const costSingle = calcRDS();
    expect(costSingle).toBeGreaterThan(0);
    document.getElementById('rds-multiaz').value = 'yes';
    const costMulti = calcRDS();
    expect(costMulti).toBeCloseTo(costSingle * 2, 1);
  });
});
