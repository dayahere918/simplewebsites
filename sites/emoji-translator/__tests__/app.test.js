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

describe('EmojiTranslator', () => {
  beforeEach(() => setupDOM());

  describe('EMOJI_MAP', () => {
    test('has at least 50 entries', () => {
      expect(Object.keys(EMOJI_MAP).length).toBeGreaterThanOrEqual(50);
    });

    test('maps common words', () => {
      expect(EMOJI_MAP.happy).toBe('😊');
      expect(EMOJI_MAP.pizza).toBe('🍕');
      expect(EMOJI_MAP.dog).toBe('🐕');
      expect(EMOJI_MAP.love).toBe('❤️');
    });
  });

  describe('wordToEmoji', () => {
    test('converts known word', () => {
      expect(wordToEmoji('happy')).toBe('😊');
    });

    test('is case-insensitive', () => {
      expect(wordToEmoji('HAPPY')).toBe('😊');
      expect(wordToEmoji('Happy')).toBe('😊');
    });

    test('returns original word for unknown', () => {
      expect(wordToEmoji('xylophone')).toBe('xylophone');
    });

    test('keeps punctuation words as-is', () => {
      expect(wordToEmoji('...')).toBe('...');
    });

    test('strips punctuation when matching', () => {
      expect(wordToEmoji('happy!')).toBe('😊');
    });

    test('returns empty for empty string', () => {
      expect(wordToEmoji('')).toBe('');
    });

    test('returns empty for non-string', () => {
      expect(wordToEmoji(null)).toBe('');
      expect(wordToEmoji(undefined)).toBe('');
    });
  });

  describe('translateText', () => {
    test('translates a sentence', () => {
      const result = translateText('I love pizza');
      expect(result).toContain('❤️');
      expect(result).toContain('🍕');
    });

    test('handles mixed known and unknown', () => {
      const result = translateText('happy xylophone');
      expect(result).toContain('😊');
      expect(result).toContain('xylophone');
    });

    test('returns empty for empty string', () => {
      expect(translateText('')).toBe('');
    });

    test('returns empty for non-string', () => {
      expect(translateText(null)).toBe('');
    });

    test('filters out empty mapped words', () => {
      // 'the' and 'a' map to empty strings
      const result = translateText('the a');
      expect(result.trim()).toBe('');
    });

    test('handles multiple spaces', () => {
      const result = translateText('happy   sad');
      expect(result).toContain('😊');
      expect(result).toContain('😢');
    });
  });

  describe('countChars', () => {
    test('counts characters', () => {
      expect(countChars('hello')).toBe(5);
    });

    test('counts empty string', () => {
      expect(countChars('')).toBe(0);
    });

    test('returns 0 for non-string', () => {
      expect(countChars(null)).toBe(0);
    });

    test('counts spaces', () => {
      expect(countChars('a b')).toBe(3);
    });
  });

  describe('countWords', () => {
    test('counts words', () => {
      expect(countWords('hello world')).toBe(2);
    });

    test('returns 0 for empty', () => {
      expect(countWords('')).toBe(0);
    });

    test('returns 0 for non-string', () => {
      expect(countWords(null)).toBe(0);
    });

    test('handles multiple spaces', () => {
      expect(countWords('a   b   c')).toBe(3);
    });

    test('handles whitespace only', () => {
      expect(countWords('   ')).toBe(0);
    });
  });

  describe('translate', () => {
    test('updates output from input', () => {
      const input = document.getElementById('text-input');
      input.value = 'I love coffee';
      translate();
      const output = document.getElementById('emoji-output');
      expect(output.textContent).toContain('❤️');
      expect(output.textContent).toContain('☕');
    });

    test('shows placeholder when empty', () => {
      const input = document.getElementById('text-input');
      input.value = '';
      translate();
      const output = document.getElementById('emoji-output');
      expect(output.textContent).toContain('Start typing');
    });

    test('updates character count', () => {
      const input = document.getElementById('text-input');
      input.value = 'hello';
      translate();
      const charCount = document.getElementById('char-count');
      expect(charCount.textContent).toContain('5 characters');
    });
  });

  describe('clearAll', () => {
    test('clears input and output', () => {
      const input = document.getElementById('text-input');
      const output = document.getElementById('emoji-output');
      input.value = 'test';
      output.textContent = 'test';
      clearAll();
      expect(input.value).toBe('');
      expect(output.textContent).toContain('Start typing');
    });
  });

  describe('copyOutput', () => {
    test('does not error when clipboard unavailable', () => {
      expect(() => copyOutput()).not.toThrow();
    });
  });
});
