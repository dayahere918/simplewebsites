/**
 * @jest-environment jsdom
 */
const { 
  SHAPES, RECOMMENDATIONS, generateAnalysis, getImageHash, getTopShape, 
  renderBars, renderRecommendations, resetAnalysis, handleUpload, analyzeImage
} = require('../app');

// Mock Canvas for JSDOM
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
    drawImage: jest.fn(),
    getImageData: jest.fn().mockReturnValue({
      data: new Uint8ClampedArray(100).fill(0)
    }),
    putImageData: jest.fn(),
    clearRect: jest.fn()
  });
}

function setupDOM() {
  document.body.innerHTML = `
    <div id="upload-area"></div>
    <div id="results" class="hidden"></div>
    <input type="file" id="file-input">
    <canvas id="face-canvas" width="100" height="100"></canvas>
    <div id="shape-badge"></div>
    <div id="confidence"></div>
    <div id="shape-bars"></div>
    <div id="hairstyle-recs"></div>
    <div id="accessory-recs"></div>
  `;
}

describe('Face Shape Detector', () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
    // Mock Image
    global.Image = class {
      constructor() { this.onload = null; this.width = 100; this.height = 100; }
      set src(s) { if (this.onload) setTimeout(() => this.onload(), 0); }
    };
  });

  describe('DOM & Interactivity', () => {
    test('resetAnalysis clears UI state', () => {
      document.getElementById('upload-area').classList.add('hidden');
      document.getElementById('results').classList.remove('hidden');
      resetAnalysis();
      expect(document.getElementById('upload-area').classList.contains('hidden')).toBeFalsy();
      expect(document.getElementById('results').classList.contains('hidden')).toBeTruthy();
    });

    test('analyzeImage performs full flow', (done) => {
      analyzeImage('data:image/png;base64,mock');
      setTimeout(() => {
        expect(document.getElementById('results').classList.contains('hidden')).toBeFalsy();
        done();
      }, 10);
    });

    test('handleUpload triggers file reading', (done) => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      const mockReader = { readAsDataURL: jest.fn(), onload: null };
      global.FileReader = jest.fn(() => mockReader);
      handleUpload({ target: { files: [file] } });
      
      // Trigger onload
      mockReader.onload({ target: { result: 'data:image/png;base64,mock' } });
      
      setTimeout(() => {
        expect(document.getElementById('results').classList.contains('hidden')).toBeFalsy();
        done();
      }, 10);
    });
  });
});
