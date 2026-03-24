/**
 * @jest-environment jsdom
 */
const { 
  rgbToHex, colorDistance, kMeansClustering, extractColors, 
  renderPalette, resetUpload, NUM_COLORS 
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <canvas id="image-canvas" width="100" height="100"></canvas>
    <div id="palette-grid"></div>
    <div id="upload-area"></div>
    <div id="preview-section" class="hidden"></div>
    <input id="file-input" type="file">
  `;
}

describe('Color Palette Extractor', () => {
  beforeEach(() => {
    setupDOM();
  });

  describe('Utility Functions', () => {
    test('rgbToHex converts colors correctly', () => {
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
    });

    test('colorDistance calculates Euclidean distance', () => {
      const c1 = [0, 0, 0], c2 = [3, 4, 0];
      expect(colorDistance(c1, c2)).toBe(5);
    });
  });

  describe('Clustering Logic', () => {
    test('kMeansClustering returns k colors', () => {
      const pixels = [[255,0,0], [255,10,10], [0,255,0], [0,240,0]];
      const result = kMeansClustering(pixels, 2, 5);
      expect(result.length).toBe(2);
    });

    test('kMeansClustering handles empty input', () => {
      expect(kMeansClustering([], 2, 5)).toEqual([]);
    });

    test('extractColors gets data from canvas', () => {
      const canvas = document.getElementById('image-canvas');
      const mockCtx = {
        getImageData: jest.fn(() => ({
          data: new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255])
        }))
      };
      canvas.getContext = jest.fn(() => mockCtx);
      canvas.width = 1; canvas.height = 2;
      
      const result = extractColors(canvas);
      expect(result.length).toBeGreaterThan(0);
      expect(mockCtx.getImageData).toHaveBeenCalled();
    });
  });

  describe('UI Interactions', () => {
    test('renderPalette updates DOM with swatches', () => {
      const colors = [[255, 0, 0], [0, 255, 0]];
      renderPalette(colors);
      const grid = document.getElementById('palette-grid');
      expect(grid.innerHTML).toContain('rgb(255, 0, 0)');
      expect(grid.innerHTML).toContain('#ff0000');
    });

    test('resetUpload clears UI state', () => {
      const uploadArea = document.getElementById('upload-area');
      uploadArea.classList.add('hidden');
      resetUpload();
      expect(uploadArea.classList.contains('hidden')).toBe(false);
    });
  });
});
