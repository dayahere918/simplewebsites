/**
 * @jest-environment jsdom
 */
const { 
  dbFromFloat, getLevel, getLevelLabel, getAverage, 
  updateDisplay, resetReadings, toggleMeter, updateMeter, stopMeter,
  setReadings, setPeak, setMin, setIsRunning, setAnalyser
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
    <div id="mic-error" class="hidden"></div>
  `;
}

// Global Mocks for Audio
const mockAnalyser = { 
  fftSize: 2048, 
  smoothingTimeConstant: 0.8,
  getFloatTimeDomainData: jest.fn(data => { data.fill(0.1); }) // simulate some sound
};
const mockMicrophone = { connect: jest.fn(), disconnect: jest.fn() };
const mockAudioContext = {
  createMediaStreamSource: jest.fn().mockReturnValue(mockMicrophone),
  createAnalyser: jest.fn().mockReturnValue(mockAnalyser),
  close: jest.fn()
};
global.AudioContext = jest.fn().mockImplementation(() => mockAudioContext);
global.webkitAudioContext = global.AudioContext;
global.alert = jest.fn();

navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({ getTracks: () => [{ stop: jest.fn() }] })
};

describe('Noise Meter', () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
  });

  describe('Logic', () => {
    test('dbFromFloat calculation', () => {
      expect(dbFromFloat(0)).toBe(0);
      expect(dbFromFloat(1)).toBe(90);
      expect(dbFromFloat(-1)).toBe(0);
    });

    test('getLevel categories', () => {
      expect(getLevel(20)).toBe('safe');
      expect(getLevel(40)).toBe('moderate');
      expect(getLevel(70)).toBe('loud');
      expect(getLevel(90)).toBe('danger');
    });

    test('getLevelLabel texts', () => {
      expect(getLevelLabel(20)).toContain('Quiet');
      expect(getLevelLabel(90)).toContain('Very Loud');
    });

    test('getAverage sums correctly', () => {
      expect(getAverage([10, 20, 30])).toBe(20);
      expect(getAverage([])).toBe(0);
    });
  });

  describe('UI & Lifecycle', () => {
    test('updateDisplay updates all metrics', () => {
      setReadings([40, 50, 60]);
      setPeak(70);
      setMin(30);
      updateDisplay(55);
      expect(document.getElementById('db-value').textContent).toBe('55');
      expect(document.getElementById('peak-db').textContent).toBe('70 dB');
    });

    test('resetReadings clears state', () => {
      resetReadings();
      expect(document.getElementById('db-value').textContent).toBe('--');
    });

    test('toggleMeter starts/stops', async () => {
      // Start
      await toggleMeter();
      expect(global.AudioContext).toHaveBeenCalled();
      
      // Stop
      await toggleMeter();
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    test('toggleMeter handles denied permissions', async () => {
      navigator.mediaDevices.getUserMedia.mockRejectedValue(new Error('Denied'));
      global.alert = jest.fn();
      await toggleMeter();
    });

    test('updateMeter frame loop', () => {
      setIsRunning(true);
      setAnalyser(mockAnalyser);
      global.requestAnimationFrame = jest.fn();
      updateMeter();
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });
  });
});
