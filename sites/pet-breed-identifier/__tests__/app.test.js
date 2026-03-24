/**
 * @jest-environment jsdom
 */
const { 
  DOG_BREEDS, CAT_BREEDS, setPetType, identifyBreed, 
  getImageHash, renderBreedBars, renderBreedInfo, 
  resetAnalysis, handleUpload, analyzeImage
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <canvas id="pet-canvas" width="100" height="100"></canvas>
    <div id="results" class="hidden"></div>
    <div id="breed-badge"></div>
    <div id="confidence-text"></div>
    <div id="breed-bars"></div>
    <div id="breed-info"></div>
    <div id="care-tips"></div>
    <div id="upload-area"></div>
    <button id="btn-dog" class="pet-btn"></button>
    <button id="btn-cat" class="pet-btn"></button>
    <input id="file-input" type="file">
  `;
}

// Mock FileReader (Synchronous)
class MockFileReader {
  constructor() { this.onload = null; }
  readAsDataURL(file) {
    if (this.onload) this.onload({ target: { result: 'data:image/png;base64,stub' } });
  }
}
global.FileReader = MockFileReader;

// Mock Image (Synchronous)
class MockImage {
  constructor() {
    this.onload = null;
    this._src = '';
    this.width = 100;
    this.height = 100;
  }
  set src(val) {
    this._src = val;
    if (this.onload) this.onload();
  }
  get src() { return this._src; }
}
global.Image = MockImage;

describe('Pet Breed Identifier', () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
  });

  describe('Logic', () => {
    test('setPetType changes mode and UI', () => {
      setPetType('cat');
      expect(document.getElementById('btn-cat').className).toContain('active');
    });

    test('getImageHash returns a number', () => {
      const canvas = document.getElementById('pet-canvas');
      canvas.getContext('2d').getImageData = jest.fn(() => ({
        data: new Uint8ClampedArray(100).fill(255)
      }));
      expect(typeof getImageHash(canvas)).toBe('number');
    });
  });

  describe('UI & Event Handlers', () => {
    test('handleUpload and analyzeImage logic path', () => {
      // Mocking getContext as well just in case JSDOM stubs are weird
      const canvas = document.getElementById('pet-canvas');
      canvas.getContext = jest.fn(() => ({
        drawImage: jest.fn(),
        getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(100).fill(255) }))
      }));

      analyzeImage('data:image/png;base64,stub');
      expect(document.getElementById('results').className).not.toContain('hidden');
    });

    test('renderBreedBars and renderBreedInfo', () => {
      renderBreedBars({ 'Persian': 100 }, 'Persian');
      renderBreedInfo('Persian');
      expect(document.getElementById('breed-info').innerHTML).toContain('Iran');
    });

    test('resetAnalysis', () => {
      resetAnalysis();
      expect(document.getElementById('upload-area').className).not.toContain('hidden');
    });
  });
});
