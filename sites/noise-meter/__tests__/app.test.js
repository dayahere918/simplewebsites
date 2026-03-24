/**
 * @jest-environment jsdom
 */
const { 
  dbFromFloat, getLevel, getLevelLabel, getAverage, 
  updateDisplay, resetReadings, toggleMeter 
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="db-circle"></div>
    <div id="db-value"></div>
    <div id="db-label"></div>
    <div id="meter-fill"></div>
    <div id="current-db"></div>
    <div id="avg-db"></div>
    <div id="peak-db"></div>
    <div id="min-db"></div>
    <button id="start-btn"></button>
  `;
}

// Global Mocks for Audio
const mockAnalyser = { 
  fftSize: 2048, 
  smoothingTimeConstant: 0.8,
  getFloatTimeDomainData: jest.fn(data => { data.fill(0); })
};
window.AudioContext = jest.fn().mockImplementation(() => ({
  createMediaStreamSource: jest.fn().mockReturnValue({ connect: jest.fn() }),
  createAnalyser: jest.fn().mockReturnValue(mockAnalyser),
  close: jest.fn()
}));
window.webkitAudioContext = window.AudioContext;

navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({ getTracks: () => [{ stop: jest.fn() }] })
};

describe('Noise Meter', () => {
  beforeEach(() => {
    setupDOM();
  });

  describe('Logic', () => {
    test('dbFromFloat calculation', () => {
      expect(dbFromFloat(0)).toBe(0);
      expect(dbFromFloat(1)).toBe(90);
    });
  });

  describe('UI States', () => {
    test('updateDisplay updates DOM', () => {
      updateDisplay(50);
      expect(document.getElementById('db-value').textContent).toBe('50');
    });

    test('resetReadings clears values', () => {
      document.getElementById('db-value').textContent = '99';
      resetReadings();
      expect(document.getElementById('db-value').textContent).toBe('--');
    });
  });
});
