/**
 * @jest-environment jsdom
 */
const { 
  DOG_BREEDS, CAT_BREEDS, setPetType, getImageHash, identifyBreed, analyzeImageFeatures,
  renderBreedBars, renderBreedInfo, resetAnalysis, handleUpload, analyzeImage,
  identifyFromImage, finalizeResults, getPetType, setPetTypeVal
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
      <button class="pet-btn btn-primary active" id="btn-dog"></button>
      <button class="pet-btn btn-secondary" id="btn-cat"></button>
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
        getImageData: jest.fn().mockReturnValue({ data: new Uint8ClampedArray(400).fill(128) })
    });
  });

  test('DOG_BREEDS has 8 breeds', () => {
    expect(DOG_BREEDS.length).toBe(8);
    DOG_BREEDS.forEach(b => {
      expect(b).toHaveProperty('name');
      expect(b).toHaveProperty('care');
      expect(b.care.length).toBeGreaterThan(0);
    });
  });

  test('CAT_BREEDS has 8 breeds', () => {
    expect(CAT_BREEDS.length).toBe(8);
  });

  test('setPetType toggles correctly', () => {
    setPetType('cat');
    expect(getPetType()).toBe('cat');
    expect(document.getElementById('btn-cat').classList.contains('active')).toBeTruthy();
    expect(document.getElementById('btn-dog').classList.contains('active')).toBeFalsy();
  });

  test('setPetType to dog', () => {
    setPetType('cat');
    setPetType('dog');
    expect(getPetType()).toBe('dog');
    expect(document.getElementById('btn-dog').classList.contains('active')).toBeTruthy();
  });

  test('getImageHash returns a number', () => {
    const canvas = document.getElementById('pet-canvas');
    const hash = getImageHash(canvas);
    expect(typeof hash).toBe('number');
    expect(hash).toBeGreaterThanOrEqual(0);
  });

  test('getImageHash returns timestamp for null canvas', () => {
    const hash = getImageHash(null);
    expect(typeof hash).toBe('number');
  });

  test('identifyBreed returns scores totaling 100', () => {
    const features = { brightness: 128, warmth: 0, contrast: 50 };
    const scores = identifyBreed(12345, features);
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
    expect(Object.keys(scores).length).toBe(8);
  });

  test('identifyBreed for cats', () => {
    setPetTypeVal('cat');
    const features = { brightness: 128, warmth: 0, contrast: 50 };
    const scores = identifyBreed(54321, features);
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
    expect(Object.keys(scores).length).toBe(8);
  });

  test('identifyBreed favors cool+high-contrast breeds for cool images', () => {
    setPetTypeVal('dog');
    const features = { brightness: 170, warmth: -30, contrast: 180 };
    const scores = identifyBreed(99999, features);
    // Siberian Husky has cool warmth + high contrast — should score well
    expect(scores['Siberian Husky']).toBeGreaterThan(scores['Beagle']);
  });

  test('identifyBreed favors warm breeds for warm images', () => {
    setPetTypeVal('dog');
    const features = { brightness: 180, warmth: 40, contrast: 40 };
    const scores = identifyBreed(11111, features);
    // Golden Retriever has high brightness + warm + low contrast
    expect(scores['Golden Retriever']).toBeGreaterThan(scores['Siberian Husky']);
  });

  test('analyzeImageFeatures returns valid object', () => {
    const canvas = document.getElementById('pet-canvas');
    const features = analyzeImageFeatures(canvas);
    expect(features).toHaveProperty('brightness');
    expect(features).toHaveProperty('warmth');
    expect(features).toHaveProperty('contrast');
    expect(typeof features.brightness).toBe('number');
  });

  test('analyzeImageFeatures returns defaults for null canvas', () => {
    const features = analyzeImageFeatures(null);
    expect(features.brightness).toBe(128);
    expect(features.warmth).toBe(0);
    expect(features.contrast).toBe(50);
  });

  test('identifyFromImage calls finalizeResults', () => {
    const canvas = document.getElementById('pet-canvas');
    identifyFromImage(canvas);
    // Should populate breed badge
    expect(document.getElementById('breed-badge').textContent).not.toBe('');
    expect(document.getElementById('breed-bars').innerHTML).toContain('bar-item');
  });

  test('finalizeResults populates DOM correctly', () => {
    const scores = { 'Golden Retriever': 40, 'Labrador Retriever': 30, 'Beagle': 15, 'Corgi': 15 };
    finalizeResults(scores);
    expect(document.getElementById('breed-badge').textContent).toBe('Golden Retriever');
    expect(document.getElementById('confidence-text').textContent).toBe('40% confidence');
  });

  test('renderBreedBars generates correct HTML', () => {
    const scores = { 'Golden Retriever': 60, 'Beagle': 40 };
    renderBreedBars(scores, 'Golden Retriever');
    const bars = document.getElementById('breed-bars');
    expect(bars.innerHTML).toContain('Golden Retriever');
    expect(bars.innerHTML).toContain('60%');
    expect(bars.innerHTML).toContain('top');
  });

  test('renderBreedInfo displays breed details', () => {
    renderBreedInfo('Golden Retriever');
    const info = document.getElementById('breed-info');
    expect(info.innerHTML).toContain('Large');
    expect(info.innerHTML).toContain('Scotland');
    const tips = document.getElementById('care-tips');
    expect(tips.innerHTML).toContain('Regular brushing');
  });

  test('renderBreedInfo with unknown breed does nothing', () => {
    renderBreedInfo('Unknown Breed');
    const info = document.getElementById('breed-info');
    expect(info.innerHTML).toBe('');
  });

  test('resetAnalysis functionality', () => {
    document.getElementById('upload-area').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');
    resetAnalysis();
    expect(document.getElementById('upload-area').classList.contains('hidden')).toBeFalsy();
    expect(document.getElementById('results').classList.contains('hidden')).toBeTruthy();
  });

  test('analyzeImage performs full flow', (done) => {
    analyzeImage('data:image/png;base64,mock');
    setTimeout(() => {
      try {
        expect(document.getElementById('results').classList.contains('hidden')).toBeFalsy();
        expect(document.getElementById('breed-badge').textContent).not.toBe('');
        done();
      } catch (e) { done(e); }
    }, 1000);
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
    }, 1000);
  });

  test('handleUpload ignores non-image files', () => {
    const file = new File([''], 'test.txt', { type: 'text/plain' });
    handleUpload({ target: { files: [file] } });
    // results should stay hidden
    expect(document.getElementById('results').classList.contains('hidden')).toBeTruthy();
  });

  test('handleUpload handles null event', () => {
    expect(() => handleUpload(null)).not.toThrow();
  });
});
