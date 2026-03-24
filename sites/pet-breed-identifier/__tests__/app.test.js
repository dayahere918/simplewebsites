/**
 * @jest-environment jsdom
 */
const { 
  getPetType, setPetTypeVal, handleUpload, analyzeImage, resetAnalysis 
} = require('../app');

describe('Pet Breed Identifier', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="upload-area"></div>
      <div id="results" class="hidden"></div>
      <input type="file" id="file-input">
      <canvas id="pet-canvas"></canvas>
      <div id="breed-badge"></div>
      <div id="confidence-text"></div>
      <div id="breed-bars"></div>
      <div id="breed-info"></div>
      <div id="care-tips"></div>
    `;
    jest.clearAllMocks();
    setPetTypeVal('dog');
    
    // Mock Image
    global.Image = class {
      constructor() { this.onload = null; this.width = 100; this.height = 100; }
      set src(s) { if (this.onload) setTimeout(() => this.onload(), 0); }
    };
    // Mock Canvas context
    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
        drawImage: jest.fn(),
        getImageData: jest.fn().mockReturnValue({ data: new Uint8ClampedArray(400).fill(0) })
    });
  });

  test('analyzeImage performs full flow', (done) => {
    analyzeImage('data:image/png;base64,mock');
    setTimeout(() => {
      try {
        expect(document.getElementById('results').classList.contains('hidden')).toBeFalsy();
        done();
      } catch (e) { done(e); }
    }, 50);
  });

  test('handleUpload triggers file reading', (done) => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    const mockReader = { readAsDataURL: jest.fn(), onload: null };
    global.FileReader = jest.fn(() => mockReader);
    handleUpload({ target: { files: [file] } });
    mockReader.onload({ target: { result: 'data:image/png;base64,mock' } });
    setTimeout(() => {
      try {
        expect(document.getElementById('results').classList.contains('hidden')).toBeFalsy();
        done();
      } catch (e) { done(e); }
    }, 50);
  });
});
