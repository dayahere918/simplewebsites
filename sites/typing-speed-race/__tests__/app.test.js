/**
 * @jest-environment jsdom
 */
const { 
  getRandomText, calculateWPM, calculateAccuracy, 
  handleTyping, renderText, finishRace, restartRace 
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
  `;
}

describe('Typing Speed Race', () => {
  beforeEach(() => {
    setupDOM();
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('calculateWPM logic', () => {
    expect(calculateWPM(100, 60)).toBe(20); 
    expect(calculateWPM(0, 30)).toBe(0);
  });

  test('handleTyping updates all metrics', () => {
    const { setCurrentText, setIsRunning } = require('../app');
    setCurrentText('The quick brown fox');
    setIsRunning(true);
    
    const input = document.getElementById('typing-input');
    input.value = 'The quick';
    handleTyping();
    
    expect(document.getElementById('accuracy').textContent).toBe('100');
    expect(document.getElementById('errors').textContent).toBe('0');
    
    input.value = 'The qwick'; // 1 error
    handleTyping();
    expect(document.getElementById('errors').textContent).toBe('1');
    expect(document.getElementById('accuracy').textContent).toBe('89'); // 8/9
  });

  test('finishRace triggers overlay and score saving', () => {
    const { setCurrentText, setIsRunning, finishRace } = require('../app');
    setCurrentText('abc');
    setIsRunning(true);
    
    const input = document.getElementById('typing-input');
    input.value = 'abc';
    finishRace();
    
    expect(input.disabled).toBe(true);
    expect(document.querySelector('.finished-overlay')).not.toBeNull();
    const scores = JSON.parse(localStorage.getItem('typingScores'));
    expect(scores.length).toBe(1);
  });

  test('restartRace resets everything', () => {
    restartRace();
    expect(document.getElementById('wpm').textContent).toBe('0');
    expect(document.getElementById('typing-input').value).toBe('');
    expect(document.getElementById('progress-fill').style.width).toBe('0%');
  });
});
