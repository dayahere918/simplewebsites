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

describe('Mood Board Generator', () => {
  beforeEach(() => setupDOM());

  test('getThemeData returns preset for exact match', () => {
    const data = getThemeData('cyberpunk neon');
    expect(data.name).toBe('cyberpunk neon');
    expect(data.colors).toEqual(THEMES['cyberpunk neon'].colors);
  });

  test('getThemeData generates random theme for unknown input', () => {
    const data = getThemeData('wacky zany');
    expect(data.colors.length).toBe(6);
    expect(data.keywords).toContain('creative');
  });

  test('generateGradient creates valid CSS', () => {
    const css = generateGradient(['#ff0000', '#00ff00'], 0);
    expect(css).toContain('linear-gradient');
    expect(css).toContain('#ff0000');
  });

  test('renderBoard populates all sections', () => {
    const theme = getThemeData('minimalist zen');
    renderBoard(theme);
    expect(document.getElementById('board-grid').children.length).toBe(8);
    expect(document.getElementById('palette-row').children.length).toBe(theme.colors.length);
    expect(document.getElementById('keyword-tags').children.length).toBe(theme.keywords.length);
    expect(document.getElementById('board-container').classList.contains('hidden')).toBe(false);
  });
});
