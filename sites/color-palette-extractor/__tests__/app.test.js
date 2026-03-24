/**
 * @jest-environment jsdom
 */
const { 
  rgbToHex, colorDistance, kMeansClustering, extractColors, renderPalette, copyColor, exportPalette, resetUpload, 
  handleFile, loadImage, NUM_COLORS, MAX_ITERATIONS,
  getExtractedColors, setExtractedColors
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="upload-area"></div>
    <div id="preview-section" class="hidden"></div>
    <canvas id="image-canvas"></canvas>
    <div id="palette-grid"></div>
    <input type="file" id="file-input">
  `;
}

Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) }
});

describe('Color Palette Extractor', () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
    setExtractedColors([]);
  });

  describe('Core Math', () => {
    test('rgbToHex converts properly', () => {
      expect(rgbToHex(255, 0, 128)).toBe('#ff0080');
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
    });

    test('colorDistance computes euclidean distance', () => {
      expect(colorDistance([0, 0, 0], [0, 0, 0])).toBe(0);
      expect(colorDistance([0, 0, 0], [255, 0, 0])).toBe(255);
    });

    test('kMeansClustering handles empty inputs', () => {
      expect(kMeansClustering([], 8, 20)).toEqual([]);
      expect(kMeansClustering(null, 8, 20)).toEqual([]);
    });

    test('kMeansClustering converges correctly', () => {
      // Small predictable set
      const pixels = [[255,0,0], [254,0,0], [0,255,0], [0,254,0]];
      const clusters = kMeansClustering(pixels, 2, 10);
      expect(clusters.length).toBe(2);
    });
  });

  describe('Canvas & Extraction', () => {
    test('extractColors handles null canvas/context', () => {
      expect(extractColors(null)).toEqual([]);
      
      const badCanvas = { getContext: () => null };
      expect(extractColors(badCanvas)).toEqual([]);
    });

    test('extractColors covers pixel processing', () => {
      const mockCanvas = {
        width: 10, height: 10,
        getContext: () => ({
          getImageData: () => ({
            data: new Uint8ClampedArray(400).fill(255) // 10x10x4
          })
        })
      };
      const colors = extractColors(mockCanvas);
      expect(colors.length).toBeGreaterThan(0);
    });
  });

  describe('DOM & UI', () => {
    test('handleFile ignores invalid files', () => {
      expect(() => handleFile(null)).not.toThrow();
      expect(() => handleFile({ target: { files: [{ type: 'text/html' }] } })).not.toThrow();
    });

    test('loadImage safely exits if no document', () => {
      const originalDoc = global.document;
      global.document = undefined;
      expect(() => loadImage('src')).not.toThrow();
      global.document = originalDoc;
    });

    test('renderPalette parses colors to DOM', () => {
      renderPalette([[255, 0, 0], [0, 255, 0]]);
      expect(document.getElementById('palette-grid').innerHTML).toContain('#ff0000');
      
      document.body.innerHTML = '';
      expect(() => renderPalette([[255, 0, 0]])).not.toThrow();
    });

    test('copyColor and exportPalette use clipboard', () => {
      copyColor('#ff0000');
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('#ff0000');

      setExtractedColors([[255, 0, 0]]);
      exportPalette();
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('--color-1: #ff0000'));
    });

    test('resetUpload clears display', () => {
      resetUpload();
      expect(document.getElementById('upload-area').classList.contains('hidden')).toBeFalsy();
      expect(document.getElementById('preview-section').classList.contains('hidden')).toBeTruthy();
      
      document.body.innerHTML = '';
      expect(() => resetUpload()).not.toThrow();
    });
  });
});
