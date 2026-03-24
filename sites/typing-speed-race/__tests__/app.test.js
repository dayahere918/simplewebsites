/**
 * @jest-environment jsdom
 */
const { 
  TEXTS, getRandomText, calculateWPM, calculateAccuracy, setDuration, startRace, 
  handleTyping, renderText, finishRace, restartRace, renderLeaderboard,
  getState, setCurrentText, setIsRunning, setIsFinished
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div class="typing-area"></div>
    <div id="timer">60</div>
    <div id="wpm">0</div>
    <div id="accuracy">100</div>
    <div id="errors">0</div>
    <input id="typing-input">
    <div id="progress-fill"></div>
    <div id="text-display"></div>
    <div id="leaderboard"></div>
    <button class="time-btn" onclick="setDuration(30)"></button>
  `;
}

// Mock localStorage
const mockStorage = {
  getItem: jest.fn().mockReturnValue('[]'),
  setItem: jest.fn()
};
Object.defineProperty(global, 'localStorage', { value: mockStorage });

describe('Typing Speed Race', () => {
  beforeEach(() => {
    setupDOM();
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockStorage.getItem.mockReturnValue('[]');
    setDuration(60);
    restartRace();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Math and Logic', () => {
    test('getRandomText gets a genuine string', () => {
      expect(TEXTS).toContain(getRandomText());
    });

    test('calculateWPM computes normally', () => {
      expect(calculateWPM(0, 0)).toBe(0);
      expect(calculateWPM(25, 60)).toBe(5); // 5 words in 1 min
    });

    test('calculateAccuracy computes percentage', () => {
      expect(calculateAccuracy(45, 50)).toBe(90);
      expect(calculateAccuracy(0, 0)).toBe(100);
    });
  });

  describe('Interactive Race Flow', () => {
    test('setDuration updates state and clears DOM active', () => {
      setDuration(45);
      expect(getState().duration).toBe(45);
      
      document.body.innerHTML = '';
      expect(() => setDuration(30)).not.toThrow();
    });

    test('Race starts, updates timer, handles typing, finishes correctly', () => {
      const input = document.getElementById('typing-input');
      const sampleText = 'The dog';
      setCurrentText(sampleText);
      
      startRace();
      expect(getState().isRunning).toBeTruthy();
      
      // Re-starting does nothing
      startRace();
      
      // Update timer visually
      jest.advanceTimersByTime(1000); // 1 second
      expect(document.getElementById('timer').textContent).toBe('59'); 
      
      // Type correctly
      input.value = 'The d';
      handleTyping();
      expect(document.getElementById('accuracy').textContent).toBe('100');
      
      // Type incorrectly
      input.value = 'The z';
      handleTyping();
      expect(document.getElementById('errors').textContent).toBe('1');
      
      // Type fully
      input.value = sampleText;
      handleTyping();
      expect(getState().isFinished).toBeTruthy();
      
      // Input disabled
      expect(input.disabled).toBeTruthy();
      // Scores saved
      expect(mockStorage.setItem).toHaveBeenCalled();
    });
    
    test('handleTyping ignores input in invalid states', () => {
      setIsRunning(false);
      handleTyping(); // No-op
      
      setIsRunning(true);
      document.body.innerHTML = ''; // Missing input
      expect(() => handleTyping()).not.toThrow();
    });

    test('renderText highlights active text', () => {
      setCurrentText('abc');
      renderText('a');
      const display = document.getElementById('text-display');
      expect(display.innerHTML).toContain('class="correct"');
      expect(display.innerHTML).toContain('class="current"');
      
      document.body.innerHTML = '';
      expect(() => renderText('a')).not.toThrow();
    });

    test('finishRace missing DOM', () => {
      document.body.innerHTML = '';
      expect(() => finishRace()).not.toThrow();
    });

    test('Timer expiry ends race', () => {
      startRace();
      jest.advanceTimersByTime(61000); // Over 60 seconds
      expect(getState().isFinished).toBeTruthy(); // Called finishRace
    });
  });

  describe('Leaderboard', () => {
    test('renderLeaderboard uses localStorage', () => {
      mockStorage.getItem.mockReturnValue(JSON.stringify([{ wpm: 120, accuracy: 95, date: 'today' }]));
      
      renderLeaderboard();
      const el = document.getElementById('leaderboard');
      expect(el.innerHTML).toContain('120 WPM');
      
      document.body.innerHTML = '';
      expect(() => renderLeaderboard()).not.toThrow();
    });
    
    test('renderLeaderboard handles exceptions gracefully', () => {
      mockStorage.getItem.mockReturnValue('INVALID JSON');
      expect(() => renderLeaderboard()).not.toThrow();
      expect(document.getElementById('leaderboard').innerHTML).toBe('');
    });
  });
});
