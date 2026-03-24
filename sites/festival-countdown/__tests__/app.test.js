/**
 * @jest-environment jsdom
 */

function setupDOM() {
  document.body.innerHTML = `
    <select id="festival-select"><option value="">--</option></select>
    <div id="festival-name"></div>
    <div id="festival-date"></div>
    <div id="days">00</div>
    <div id="hours">00</div>
    <div id="minutes">00</div>
    <div id="seconds">00</div>
    <div id="festivals-grid"></div>
  `;
}

describe('Festival Countdown', () => {
  let app;
  beforeEach(() => {
    jest.resetModules();
    app = require('../app');
    setupDOM();
    app.setSelectedFestival(null);
    app.setCountdownInterval(null);
    jest.useFakeTimers();
    app.renderSelector();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('UI Flow', () => {
    test('selectFestival updates state', () => {
      const select = document.getElementById('festival-select');
      select.value = '0'; 
      app.selectFestival();
      
      const selected = app.getSelectedFestival();
      expect(selected).not.toBeNull();
      expect(selected.name).toBe('Diwali');
    });

    test('updateCountdownDisplay updates DOM', () => {
      app.setSelectedFestival(app.FESTIVALS[0]);
      app.updateCountdownDisplay();
      expect(document.getElementById('festival-name').textContent).toContain('Diwali');
    });
  });
});
