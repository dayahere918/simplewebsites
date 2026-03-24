/**
 * @jest-environment jsdom
 */
const {
  EMOJI_MAP, wordToEmoji, translateText, countChars, countWords,
  translate, copyOutput, clearAll
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <textarea id="text-input"></textarea>
    <div id="emoji-output"></div>
    <div id="char-count">0 characters</div>
  `;
}

describe('Emoji Translator', () => {
  beforeEach(() => setupDOM());

  describe('EMOJI_MAP', () => {
    test('contains a large number of entries', () => {
      expect(Object.keys(EMOJI_MAP).length).toBeGreaterThan(100);
    });

    test('maps specific key words correctly', () => {
      expect(EMOJI_MAP.happy).toBe('😊');
      expect(EMOJI_MAP.pizza).toBe('🍕');
      expect(EMOJI_MAP.i).toBe('👤');
    });
  });

  describe('wordToEmoji', () => {
    test('translates single words correctly', () => {
      expect(wordToEmoji('lucky')).toBe('lucky'); // unknown
      expect(wordToEmoji('happy')).toBe('😊');
    });

    test('is case-insensitive', () => {
      expect(wordToEmoji('HAPPY')).toBe('😊');
    });

    test('handles punctuation', () => {
      expect(wordToEmoji('happy!')).toBe('😊');
    });
  });

  describe('translateText', () => {
    test('translates full sentences', () => {
      const result = translateText('i love pizza');
      expect(result).toBe('👤 ❤️ 🍕');
    });

    test('handles unknown words', () => {
      const result = translateText('i love unknownword');
      expect(result).toBe('👤 ❤️ unknownword');
    });

    test('returns empty for invalid input', () => {
      expect(translateText('')).toBe('');
      expect(translateText(null)).toBe('');
    });
  });

  describe('Counters', () => {
    test('countChars counts correctly', () => {
      expect(countChars('abc')).toBe(3);
    });

    test('countWords handles spaces', () => {
      expect(countWords('a b  c ')).toBe(3);
      expect(countWords('')).toBe(0);
    });
  });

  describe('DOM Interactions', () => {
    test('translate() updates display', () => {
      document.getElementById('text-input').value = 'happy';
      translate();
      expect(document.getElementById('emoji-output').textContent).toBe('😊');
    });

    test('clearAll() resets everything', () => {
      document.getElementById('text-input').value = 'test';
      clearAll();
      expect(document.getElementById('text-input').value).toBe('');
    });
  });
});
