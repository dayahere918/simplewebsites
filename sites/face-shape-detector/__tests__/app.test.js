/**
 * @jest-environment jsdom
 */
const { 
  SHAPES, RECOMMENDATIONS, generateAnalysis, getImageHash, 
  getTopShape, renderBars, renderRecommendations, resetAnalysis,
  handleUpload, analyzeImage
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <canvas id="face-canvas" width="100" height="100"></canvas>
    <div id="upload-area"></div>
    <div id="results" class="hidden"></div>
    <div id="shape-badge"></div>
    <div id="confidence"></div>
    <div id="shape-bars"></div>
    <div id="hairstyle-recs"></div>
    <div id="accessory-recs"></div>
    <input id="file-input" type="file">
  `;
}

// Mock Canvas Context
const mockCtx = {
  drawImage: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(40000).fill(128) })),
};
HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCtx);

// Synchronous Mocks
global.FileReader = class {
  constructor() { this.onload = null; }
  readAsDataURL() { if (this.onload) this.onload({ target: { result: 'data:image/png;base64,stub' } }); }
};
global.Image = class {
  constructor() { this.onload = null; this._src = ''; this.width = 100; this.height = 100; }
  set src(v) { this._src = v; if (this.onload) this.onload(); }
  get src() { return this._src; }
};

describe('Face Shape Detector', () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
  });

  describe('Logic', () => {
    test('generateAnalysis normalizes to 100%', () => {
      const scores = generateAnalysis(12345);
      const sum = Object.values(scores).reduce((a, b) => a + b, 0);
      expect(sum).toBe(100);
    });

    test('getImageHash returns abs number', () => {
      const canvas = document.getElementById('face-canvas');
      expect(typeof getImageHash(canvas)).toBe('number');
      expect(getImageHash(null)).toBeDefined();
    });

    test('getTopShape handles standard input', () => {
      const scores = { Round: 90, Oval: 10 };
      expect(getTopShape(scores)).toBe('Round');
    });
  });

  describe('UI & Lifecycle', () => {
    test('renderRecommendations populates cards', () => {
      renderRecommendations('Square');
      expect(document.getElementById('hairstyle-recs').innerHTML).toContain('rec-card');
      expect(document.getElementById('accessory-recs').innerHTML).toContain('Round glasses');
    });

    test('resetAnalysis visibility', () => {
      document.getElementById('results').classList.remove('hidden');
      resetAnalysis();
      expect(document.getElementById('results').className).toContain('hidden');
    });

    test('handleUpload and analyzeImage flow', () => {
      const event = { target: { files: [{ type: 'image/png' }] } };
      handleUpload(event);
      // Synchronous flow should have updated DOM
      expect(document.getElementById('results').className).not.toContain('hidden');
      expect(document.getElementById('shape-badge').textContent).toContain('Shape');
    });
  });
});
