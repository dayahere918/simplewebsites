/**
 * @jest-environment jsdom
 */
const { 
  rgbToHex, colorDistance, kMeansClustering, extractColors, 
  renderPalette, resetUpload, handleFile, loadImage, 
  copyColor, exportPalette, NUM_COLORS, getExtractedColors, setExtractedColors
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <canvas id="image-canvas" width="100" height="100"></canvas>
    <div id="palette-grid"></div>
    <div id="upload-area"></div>
    <div id="preview-section" class="hidden"></div>
    <input id="file-input" type="file">
    <div id="drop-zone"></div>
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

// Mock Navigator Clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined)
  }
});

describe('Color Palette Extractor', () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
  });

  describe('Utilities & Logic', () => {
    test('extractColors from canvas', () => {
      const canvas = document.getElementById('image-canvas');
      canvas.getContext = jest.fn(() => ({
        getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(100).fill(255) }))
      }));
      expect(extractColors(canvas).length).toBeGreaterThan(0);
    });
  });

  describe('UI & Event Handlers', () => {
    test('renderPalette updates grid', () => {
      renderPalette([[255, 0, 0]]);
      expect(document.getElementById('palette-grid').innerHTML).toContain('#ff0000');
    });

    test('loadImage logic path', () => {
      const canvas = document.getElementById('image-canvas');
      canvas.getContext = jest.fn(() => ({
        drawImage: jest.fn(),
        getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(100).fill(255) }))
      }));
      
      loadImage('data:image/png;base64,stub');
      expect(document.getElementById('preview-section').className).not.toContain('hidden');
    });

    test('resetUpload clears state', () => {
      resetUpload();
      expect(document.getElementById('upload-area').className).not.toContain('hidden');
    });
  });
});
