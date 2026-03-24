/**
 * @jest-environment jsdom
 */
const { 
  SHAPES, RECOMMENDATIONS, generateAnalysis, getImageHash, getTopShape, 
  renderBars, renderRecommendations, resetAnalysis, handleUpload, analyzeImage
} = require('../app');

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
  });

  describe('Core Analysis Logic', () => {
    test('generateAnalysis produces normalized scores', () => {
      const hash = 1234567;
      const scores = generateAnalysis(hash);
      
      // All shapes present
      SHAPES.forEach(shape => expect(scores[shape]).toBeDefined());
      
      // Sum is exactly 100
      const sum = Object.values(scores).reduce((a, b) => a + b, 0);
      expect(sum).toBe(100);
    });

    test('getImageHash computes integer hash', () => {
      const canvas = document.getElementById('face-canvas');
      const hash = getImageHash(canvas);
      expect(typeof hash).toBe('number');
      expect(hash).toBeGreaterThanOrEqual(0);
      
      expect(typeof getImageHash(null)).toBe('number');
    });

    test('getImageHash covers pixel loop', () => {
      const mockCanvas = {
        width: 10, height: 10,
        getContext: () => ({
          getImageData: () => ({
            data: new Uint8ClampedArray(400).fill(128)
          })
        })
      };
      const hash = getImageHash(mockCanvas);
      expect(hash).toBeGreaterThan(0);
    });

    test('getTopShape identifies highest score', () => {
      const scores = { Oval: 10, Round: 80, Square: 10 };
      expect(getTopShape(scores)).toBe('Round');
    });
  });

  describe('DOM & Interactivity', () => {
    test('handleUpload gracefully ignores invalid files', () => {
      expect(() => handleUpload(null)).not.toThrow();
      expect(() => handleUpload({ target: { files: [{ type: 'text/html' }] } })).not.toThrow();
    });

    test('renderBars creates visual tracks', () => {
      renderBars({ Oval: 60, Round: 40 }, 'Oval');
      const html = document.getElementById('shape-bars').innerHTML;
      expect(html).toContain('Oval');
      expect(html).toContain('top'); // The top shape gets the top class
      
      document.body.innerHTML = '';
      expect(() => renderBars({ Oval: 60 }, 'Oval')).not.toThrow();
    });

    test('renderRecommendations generates cards mapped to shape', () => {
      renderRecommendations('Round');
      const hair = document.getElementById('hairstyle-recs').innerHTML;
      expect(hair).toContain(RECOMMENDATIONS.Round.hairstyles[0]);
      
      // Fallback
      renderRecommendations('UnknownShape');
      expect(document.getElementById('hairstyle-recs').innerHTML).toContain(RECOMMENDATIONS.Oval.hairstyles[0]);

      document.body.innerHTML = '';
      expect(() => renderRecommendations('Round')).not.toThrow();
    });

    test('resetAnalysis clears UI state', () => {
      document.getElementById('upload-area').classList.add('hidden');
      document.getElementById('results').classList.remove('hidden');
      document.getElementById('file-input').value = '';
      
      resetAnalysis();
      
      expect(document.getElementById('upload-area').classList.contains('hidden')).toBeFalsy();
      expect(document.getElementById('results').classList.contains('hidden')).toBeTruthy();
      
      document.body.innerHTML = '';
      expect(() => resetAnalysis()).not.toThrow();
    });
  });
});
