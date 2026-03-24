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

// Mock Clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined)
  }
});

describe('Emoji Translator', () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
  });

  describe('Logic', () => {
    test('wordToEmoji translates words and keeps punctuation', () => {
      expect(wordToEmoji('happy')).toBe('😊');
      expect(wordToEmoji('unknown!!!')).toBe('unknown!!!');
    });

    test('translateText handles complex sentences', () => {
      const res = translateText('i like pizza and coffee');
      expect(res).toBe('👤 👍 🍕 ➕ ☕');
    });
  });

  describe('UI', () => {
    test('translate() updates output and counts', () => {
      const input = document.getElementById('text-input');
      input.value = 'hello';
      translate();
      expect(document.getElementById('emoji-output').textContent).toBe('👋');
      expect(document.getElementById('char-count').textContent).toContain('5 characters');
    });

    test('copyOutput uses clipboard', () => {
      document.getElementById('emoji-output').textContent = '🍎';
      copyOutput();
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('🍎');
    });

    test('clearAll resets fields', () => {
      document.getElementById('text-input').value = 'abc';
      clearAll();
      expect(document.getElementById('text-input').value).toBe('');
    });
  });
});
