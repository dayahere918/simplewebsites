/**
 * @jest-environment jsdom
 */
const { 
  THEMES, getThemeData, generateGradient, generateBoard, quickGenerate, renderBoard 
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <input id="theme-input">
    <div id="board-container" class="hidden">
      <div id="board-grid"></div>
      <div id="palette-row"></div>
      <div id="font-suggestions"></div>
      <div id="keyword-tags"></div>
    </div>
  `;
}

// Mock Navigator Clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined)
  }
});

describe('Mood Board Generator', () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
  });

  describe('Logic', () => {
    test('getThemeData handles preset and random', () => {
      expect(getThemeData('forest nature').name).toBe('forest nature');
      const random = getThemeData('wacky zany');
      expect(random.colors.length).toBe(6);
      expect(random.keywords).toContain('creative');
    });

    test('generateGradient works', () => {
      const g = generateGradient(['#000', '#fff'], 0);
      expect(g).toContain('linear-gradient');
    });
  });

  describe('UI & Actions', () => {
    test('generateBoard updates DOM', () => {
      const input = document.getElementById('theme-input');
      input.value = 'tropical paradise';
      generateBoard();
      expect(document.getElementById('board-container').className).not.toContain('hidden');
      expect(document.getElementById('board-grid').innerHTML).toContain('board-tile');
    });

    test('quickGenerate sets value and renders', () => {
      quickGenerate('space galaxy');
      expect(document.getElementById('theme-input').value).toBe('space galaxy');
      expect(document.getElementById('board-container').className).not.toContain('hidden');
    });

    test('renderBoard handles internal palettes correctly', () => {
      const theme = getThemeData('vintage retro');
      renderBoard(theme);
      expect(document.getElementById('palette-row').innerHTML).toContain('palette-color');
    });
  });
});
