/**
 * @jest-environment jsdom
 */
const { 
  getRandomText, calculateWPM, calculateAccuracy, 
  handleTyping, renderText, finishRace, restartRace,
  setDuration, getState, setCurrentText, setIsRunning
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="timer">0</div>
    <div id="wpm">0</div>
    <div id="accuracy">100</div>
    <div id="errors">0</div>
    <div id="text-display"></div>
    <input id="typing-input" type="text">
    <div id="progress-fill" style="width: 0%"></div>
    <div class="typing-area"></div>
    <div id="leaderboard"></div>
    <button class="time-btn" data-time="30">30s</button>
  `;
}

describe('Typing Speed Race', () => {
  beforeEach(() => {
    setupDOM();
    jest.useFakeTimers();
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Core Mechanics', () => {
    test('calculateWPM logic', () => {
      expect(calculateWPM(100, 60)).toBe(20); 
    });

    test('setDuration updates state', () => {
      setDuration(30);
      expect(getState().duration).toBe(30);
    });
  });

  describe('Game Loop', () => {
    test('handleTyping calculates accurately', () => {
      setCurrentText('abc');
      setIsRunning(true);
      const input = document.getElementById('typing-input');
      input.value = 'abd'; // 1 correct, 1 incorrect, total 3 (incomplete)
      handleTyping();
      expect(document.getElementById('errors').textContent).toBe('1');
    });

    test('restartRace resets UI', () => {
      document.getElementById('wpm').textContent = '50';
      restartRace();
      expect(document.getElementById('wpm').textContent).toBe('0');
    });
  });
});
