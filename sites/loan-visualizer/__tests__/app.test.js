/**
 * @jest-environment jsdom
 */

function setupDOM() {
  document.body.innerHTML = `
    <input id="principal" value="0">
    <input id="rate" value="0">
    <input id="term" value="0">
    <div id="emi"></div>
    <div id="total-payment"></div>
    <div id="total-interest"></div>
    <div id="amort-body"></div>
    <div id="pie-visual"></div>
  `;
}

describe('Loan Visualizer', () => {
  let app;
  beforeEach(() => {
    jest.resetModules();
    setupDOM();
    app = require('../app');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('UI', () => {
    test('calculate() updates DOM with results', () => {
      // Explicitly set properties
      document.getElementById('principal').value = '300000';
      document.getElementById('rate').value = '5';
      document.getElementById('term').value = '30';
      
      app.calculate();
      
      const emi = document.getElementById('emi');
      expect(emi.textContent).toContain('1,610');
    });
  });
});
