/**
 * @jest-environment jsdom
 */
const { 
  EMOJI_MAP, wordToEmoji, translateText, countChars, countWords,
  runTranslation, copyOutput, clearAll
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <textarea id="text-input"></textarea>
    <div id="emoji-output"></div>
    <div id="char-count"></div>
  `;
}

Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) }
});

describe('Emoji Translator', () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
  });

  describe('Core Translation', () => {
    test('wordToEmoji translates known words', () => {
      expect(wordToEmoji('happy')).toBe('😊');
      expect(wordToEmoji('Pizza!')).toBe('🍕'); 
      expect(wordToEmoji('unknown_word')).toBe('unknown_word');
      expect(wordToEmoji(null)).toBe('');
      expect(wordToEmoji('...')).toBe('...'); // punctuation
    });

    test('translateText handles sentences', () => {
      expect(translateText('I love pizza')).toBe('👤 ❤️ 🍕');
      expect(translateText('The dog runs fast')).toBe('🐕 runs ⚡'); // "the" is mapped to '', "runs" has no match
      expect(translateText('')).toBe('');
      expect(translateText(null)).toBe('');
    });

    test('counting functions', () => {
      expect(countChars('hello')).toBe(5);
      expect(countChars(null)).toBe(0);

      expect(countWords('hello world')).toBe(2);
      expect(countWords('   ')).toBe(0);
      expect(countWords(null)).toBe(0);
    });
  });

  describe('DOM Interactions', () => {
    test('runTranslation updates UI', () => {
      document.getElementById('text-input').value = 'hot coffee';
      runTranslation();
      
      expect(document.getElementById('emoji-output').textContent).toBe('🔥 ☕');
      expect(document.getElementById('char-count').textContent).toContain('10 characters');
      expect(document.getElementById('char-count').textContent).toContain('2 words');
      
      // Empty input
      document.getElementById('text-input').value = ' ';
      runTranslation();
      expect(document.getElementById('emoji-output').textContent).toContain('Start typing');

      // Missing DOM
      document.body.innerHTML = '';
      expect(() => runTranslation()).not.toThrow();
    });

    test('copyOutput uses clipboard', () => {
      document.getElementById('emoji-output').textContent = '🔥 ☕';
      copyOutput();
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('🔥 ☕');

      document.body.innerHTML = '';
      expect(() => copyOutput()).not.toThrow();
    });

    test('clearAll resets UI', () => {
      document.getElementById('text-input').value = 'test';
      document.getElementById('emoji-output').textContent = 'test';
      
      clearAll();
      
      expect(document.getElementById('text-input').value).toBe('');
      expect(document.getElementById('emoji-output').textContent).toContain('Start typing');
      expect(document.getElementById('char-count').textContent).toContain('0 characters');

      document.body.innerHTML = '';
      expect(() => clearAll()).not.toThrow();
    });
  });
});
