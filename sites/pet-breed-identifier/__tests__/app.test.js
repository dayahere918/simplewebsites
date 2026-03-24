/**
 * @jest-environment jsdom
 */
const { 
  DOG_BREEDS, CAT_BREEDS, setPetType, getImageHash, identifyBreed, 
  renderBreedBars, renderBreedInfo, resetAnalysis, handleUpload, analyzeImage,
  getPetType, setPetTypeVal
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="upload-area"></div>
    <div id="results" class="hidden"></div>
    <input type="file" id="file-input">
    <canvas id="pet-canvas" width="100" height="100"></canvas>
    <div id="breed-badge"></div>
    <div id="confidence-text"></div>
    <div id="breed-bars"></div>
    <div id="breed-info"></div>
    <ul id="care-tips"></ul>
    <button id="btn-dog" class="pet-btn"></button>
    <button id="btn-cat" class="pet-btn"></button>
  `;
}

describe('Pet Breed Identifier', () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
    setPetTypeVal('dog');
  });

  describe('Core Mechanics', () => {
    test('setPetType updates state and UI', () => {
      setPetType('cat');
      expect(getPetType()).toBe('cat');
      expect(document.getElementById('btn-cat').classList.contains('active')).toBeTruthy();

      document.body.innerHTML = '';
      expect(() => setPetType('dog')).not.toThrow();
    });

    test('getImageHash handles nulls', () => {
      expect(getImageHash(null)).toBeGreaterThanOrEqual(0);
      const canvas = document.getElementById('pet-canvas');
      expect(getImageHash(canvas)).toBeGreaterThanOrEqual(0);
    });

    test('getImageHash counts pixels', () => {
      const mockCanvas = {
        width: 10, height: 10,
        getContext: () => ({
          getImageData: () => ({
            data: new Uint8ClampedArray(400).fill(100)
          })
        })
      };
      expect(getImageHash(mockCanvas)).toBeGreaterThan(0);
    });

    test('identifyBreed normalizes scores for dogs', () => {
      setPetTypeVal('dog');
      const scores = identifyBreed(123456);
      
      const sum = Object.values(scores).reduce((a, b) => a + b, 0);
      expect(sum).toBe(100);
      expect(scores[DOG_BREEDS[0].name]).toBeDefined();
    });

    test('identifyBreed normalizes scores for cats', () => {
      setPetTypeVal('cat');
      const scores = identifyBreed(123456);
      
      const sum = Object.values(scores).reduce((a, b) => a + b, 0);
      expect(sum).toBe(100);
      expect(scores[CAT_BREEDS[0].name]).toBeDefined();
    });
  });

  describe('DOM & UI', () => {
    test('handleUpload gracefully ignores bad inputs', () => {
      expect(() => handleUpload(null)).not.toThrow();
      expect(() => handleUpload({ target: { files: [{ type: 'application/pdf' }] } })).not.toThrow();
    });

    test('renderBreedBars creates bar tracks', () => {
      renderBreedBars({ 'Golden Retriever': 60, 'Poodle': 40 }, 'Golden Retriever');
      const html = document.getElementById('breed-bars').innerHTML;
      expect(html).toContain('Golden Retriever');
      expect(html).toContain('Poodle');
      
      document.body.innerHTML = '';
      expect(() => renderBreedBars({}, '')).not.toThrow();
    });

    test('renderBreedInfo populates details list', () => {
      setPetTypeVal('dog');
      renderBreedInfo('Golden Retriever');
      
      expect(document.getElementById('breed-info').innerHTML).toContain('Scotland');
      expect(document.getElementById('care-tips').innerHTML).toContain('swim');
      
      // Unknown
      renderBreedInfo('Unknown');
      
      document.body.innerHTML = '';
      expect(() => renderBreedInfo('Golden Retriever')).not.toThrow();
    });

    test('resetAnalysis resets states', () => {
      document.getElementById('upload-area').classList.add('hidden');
      document.getElementById('results').classList.remove('hidden');
      
      resetAnalysis();
      
      expect(document.getElementById('upload-area').classList.contains('hidden')).toBeFalsy();
      expect(document.getElementById('results').classList.contains('hidden')).toBeTruthy();
      
      document.body.innerHTML = '';
      expect(() => resetAnalysis()).not.toThrow();
    });
  });
});
