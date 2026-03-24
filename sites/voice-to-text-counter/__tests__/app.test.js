/**
 * @jest-environment jsdom
 */
const { 
  countWords, countFillers, totalFillers, 
  calculateWPM, highlightFillers, clearTranscript,
  formatDuration, updateTimer, updateDisplay,
  toggleRecording, startRecording, stopRecording,
  setTranscript, getIsRecording, resetState
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="word-count">0</div>
    <div id="filler-count">0</div>
    <div id="wpm-rate">0</div>
    <div id="duration">0:00</div>
    <div id="transcript"></div>
    <div id="filler-grid"></div>
    <div id="speech-error" class="hidden"></div>
    <button id="record-btn"><span id="rec-dot"></span> Start Recording</button>
  `;
}

// Full SpeechRecognition Mock
let lastRecognitionInstance = null;
class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = 'en-US';
    this.onresult = null;
    this.onend = null;
    this.onerror = null;
    lastRecognitionInstance = this;
  }
  start() {}
  stop() { if (this.onend) this.onend(); }
}
global.SpeechRecognition = MockSpeechRecognition;
global.webkitSpeechRecognition = MockSpeechRecognition;
global.alert = jest.fn();

describe('Voice to Text Counter', () => {
  beforeEach(() => {
    setupDOM();
    resetState();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Logic Helpers', () => {
    test('countWords', () => {
      expect(countWords('hello world')).toBe(2);
      expect(countWords('  hello   world  ')).toBe(2);
      expect(countWords('')).toBe(0);
      expect(countWords(null)).toBe(0);
    });

    test('countFillers', () => {
      const result = countFillers('um like like basically');
      expect(result.um).toBe(1);
      expect(result.like).toBe(2);
      expect(result['basically']).toBe(1);
      expect(countFillers('')).toEqual({});
    });

    test('totalFillers', () => {
      expect(totalFillers({ um: 1, like: 2 })).toBe(3);
    });

    test('calculateWPM', () => {
      expect(calculateWPM(100, 60)).toBe(100);
      expect(calculateWPM(50, 30)).toBe(100);
      expect(calculateWPM(10, 0)).toBe(0);
    });

    test('formatDuration', () => {
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(5)).toBe('0:05');
    });
  });

  describe('UI & State', () => {
    test('highlightFillers', () => {
      expect(highlightFillers('hello um')).toContain('<span class="filler">um</span>');
      expect(highlightFillers('')).toBe('');
    });

    test('clearTranscript resets everything', () => {
      setTranscript('hello');
      clearTranscript();
      expect(document.getElementById('word-count').textContent).toBe('0');
      expect(document.getElementById('transcript').textContent).toContain('Press "Start Recording"');
    });

    test('updateTimer updates DOM', () => {
      // Need to startRecording to set startTime
      startRecording();
      jest.advanceTimersByTime(2000);
      updateTimer();
      expect(document.getElementById('duration').textContent).toBe('0:02');
      stopRecording();
    });

    test('updateDisplay updates all metrics', () => {
      setTranscript('um like hello world');
      updateDisplay();
      expect(document.getElementById('word-count').textContent).toBe('4');
      expect(document.getElementById('filler-count').textContent).toBe('2');
    });

    test('toggleRecording flips state', () => {
      expect(getIsRecording()).toBe(false);
      toggleRecording();
      expect(getIsRecording()).toBe(true);
      toggleRecording();
      expect(getIsRecording()).toBe(false);
    });

    test('SpeechRecognition events', () => {
      startRecording();
      expect(lastRecognitionInstance).not.toBeNull();
      
      // Mock result event
      const mockEvent = {
        results: [
          { isFinal: true, 0: { transcript: 'hello' } },
          { isFinal: false, 0: { transcript: ' world' } }
        ]
      };
      lastRecognitionInstance.onresult(mockEvent);
      expect(document.getElementById('word-count').textContent).toBe('2');
      
      // Mock error
      lastRecognitionInstance.onerror();
      expect(getIsRecording()).toBe(false);
      
      // Mock end
      startRecording();
      lastRecognitionInstance.onend(); // Should restart if isRecording is true
    });

    test('browser support failure', () => {
      const originalSR = window.SpeechRecognition;
      const originalWSR = window.webkitSpeechRecognition;
      delete window.SpeechRecognition;
      delete window.webkitSpeechRecognition;
      
      setupDOM();
      startRecording();
      expect(document.getElementById('speech-error').textContent).toContain('not supported');
      
      window.SpeechRecognition = originalSR;
      window.webkitSpeechRecognition = originalWSR;
    });
  });
});
