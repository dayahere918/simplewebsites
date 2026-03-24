/**
 * @jest-environment jsdom
 */
const { 
  generateAnalysis, getImageHash, getTopShape, 
  renderBars, renderRecommendations, resetAnalysis, 
  SHAPES 
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <canvas id="face-canvas" width="100" height="100"></canvas>
    <div id="results" class="hidden"></div>
    <div id="shape-badge"></div>
    <div id="confidence"></div>
    <div id="shape-bars"></div>
    <div id="hairstyle-recs"></div>
    <div id="accessory-recs"></div>
    <div id="upload-area"></div>
    <input id="file-input" type="file">
  `;
}

describe('Face Shape Detector', () => {
  beforeEach(() => {
    setupDOM();
  });

  test('generateAnalysis produces 100% total coverage', () => {
    const result = generateAnalysis(12345);
    const sum = Object.values(result).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
    expect(Object.keys(result).length).toBe(SHAPES.length);
  });

  test('getTopShape identifies highest score', () => {
    const scores = { 'Oval': 40, 'Round': 60 };
    expect(getTopShape(scores)).toBe('Round');
  });

  test('getImageHash returns consistent number', () => {
    const canvas = document.getElementById('face-canvas');
    const mockCtx = {
      getImageData: jest.fn(() => ({
        data: new Uint8ClampedArray([255, 255, 255, 255])
      }))
    };
    canvas.getContext = jest.fn(() => mockCtx);
    const hash = getImageHash(canvas);
    expect(typeof hash).toBe('number');
  });

  test('renderBars updates DOM', () => {
    const scores = { 'Oval': 50, 'Round': 50 };
    renderBars(scores, 'Oval');
    const bars = document.getElementById('shape-bars');
    expect(bars.innerHTML).toContain('Oval');
    expect(bars.innerHTML).toContain('50%');
  });

  test('renderRecommendations shows data', () => {
    renderRecommendations('Oval');
    expect(document.getElementById('hairstyle-recs').children.length).toBeGreaterThan(0);
    expect(document.getElementById('accessory-recs').children.length).toBeGreaterThan(0);
  });

  test('resetAnalysis clears UI', () => {
    const res = document.getElementById('results');
    res.classList.remove('hidden');
    resetAnalysis();
    expect(res.classList.contains('hidden')).toBe(true);
  });
});
