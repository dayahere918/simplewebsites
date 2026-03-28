/**
 * Comprehensive tests for pet-breed-identifier
 * Tests human detection guard, breed scoring, and UI pipeline
 */
const {
  setPetType, getImageHash, identifyBreed, isHumanImage, isNonPetImage,
  showNoPetDetected, handleUpload, analyzeImage, loadAIModel, resetAnalysis,
  finalizeResults, renderBreedBars, renderBreedInfo, HUMAN_KEYWORDS, NON_PET_KEYWORDS,
  getPetType, setPetTypeVal
} = require('../app');

const DOM_HTML = `
  <button id="btn-dog" class="pet-btn btn-primary active"></button>
  <button id="btn-cat" class="pet-btn btn-secondary"></button>
  <canvas id="pet-canvas"></canvas>
  <div id="upload-area"></div>
  <div id="results" class="hidden"></div>
  <span id="breed-badge"></span>
  <span id="confidence-text"></span>
  <div id="breed-bars"></div>
  <div id="breed-info"></div>
  <ul id="care-tips"></ul>
  <input id="file-input" type="file" />
`;

beforeEach(() => {
  document.body.innerHTML = DOM_HTML;
  setPetTypeVal('dog');

  global.window.mobilenet = {
    load: jest.fn().mockResolvedValue({
      classify: jest.fn().mockResolvedValue([{ className: 'golden retriever', probability: 0.95 }])
    })
  };

  const canvas = document.getElementById('pet-canvas');
  canvas.getContext = jest.fn().mockReturnValue({
    drawImage: jest.fn(),
    getImageData: jest.fn().mockReturnValue({ data: new Uint8ClampedArray(400) })
  });

  global.FileReader = class {
    readAsDataURL() { this.onload({ target: { result: 'data:image/png' } }); }
  };
  global.Image = class {
    constructor() { this.width = 100; this.height = 100; setTimeout(() => this.onload(), 0); }
  };
});

// ── HUMAN_KEYWORDS constant ───────────────────────────────

describe('HUMAN_KEYWORDS / NON_PET_KEYWORDS constants', () => {
  test('HUMAN_KEYWORDS is non-empty array', () => {
    expect(Array.isArray(HUMAN_KEYWORDS)).toBe(true);
    expect(HUMAN_KEYWORDS.length).toBeGreaterThan(5);
    expect(HUMAN_KEYWORDS).toContain('person');
    expect(HUMAN_KEYWORDS).toContain('man');
    expect(HUMAN_KEYWORDS).toContain('woman');
  });

  test('NON_PET_KEYWORDS is non-empty array', () => {
    expect(Array.isArray(NON_PET_KEYWORDS)).toBe(true);
    expect(NON_PET_KEYWORDS.length).toBeGreaterThan(5);
    expect(NON_PET_KEYWORDS).toContain('car');
    expect(NON_PET_KEYWORDS).toContain('building');
  });
});

// ── isHumanImage ─────────────────────────────────────────

describe('isHumanImage()', () => {
  test('returns true for person prediction', () => {
    expect(isHumanImage([{ className: 'person', probability: 0.9 }])).toBe(true);
  });

  test('returns true for man prediction', () => {
    expect(isHumanImage([{ className: 'man in suit', probability: 0.85 }])).toBe(true);
  });

  test('returns true for woman prediction', () => {
    expect(isHumanImage([{ className: 'woman running', probability: 0.7 }])).toBe(true);
  });

  test('returns false for dog prediction', () => {
    expect(isHumanImage([{ className: 'golden retriever', probability: 0.9 }])).toBe(false);
  });

  test('returns false for empty predictions', () => {
    expect(isHumanImage([])).toBe(false);
  });

  test('returns false for null predictions', () => {
    expect(isHumanImage(null)).toBe(false);
  });

  test('only checks top 3 predictions', () => {
    // Person is prediction #4 — should not trigger
    const preds = [
      { className: 'golden retriever', probability: 0.5 },
      { className: 'beagle', probability: 0.3 },
      { className: 'poodle', probability: 0.15 },
      { className: 'person', probability: 0.05 }
    ];
    expect(isHumanImage(preds)).toBe(false);
  });

  test('returns true when human keyword is in top 3', () => {
    const preds = [
      { className: 'jersey', probability: 0.5 },
      { className: 'suit', probability: 0.3 },
      { className: 'shirt', probability: 0.15 },
    ];
    expect(isHumanImage(preds)).toBe(true);
  });
});

// ── isNonPetImage ────────────────────────────────────────

describe('isNonPetImage()', () => {
  test('returns true for high-confidence car prediction', () => {
    expect(isNonPetImage([{ className: 'car', probability: 0.8 }])).toBe(true);
  });

  test('returns false for low-confidence non-pet prediction', () => {
    expect(isNonPetImage([{ className: 'car', probability: 0.3 }])).toBe(false);
  });

  test('returns false for pet predictions', () => {
    expect(isNonPetImage([{ className: 'golden retriever', probability: 0.9 }])).toBe(false);
  });

  test('returns false for empty/null predictions', () => {
    expect(isNonPetImage([])).toBe(false);
    expect(isNonPetImage(null)).toBe(false);
  });
});

// ── showNoPetDetected ────────────────────────────────────

describe('showNoPetDetected()', () => {
  test('shows no-pet badge and hides upload-area', () => {
    showNoPetDetected('Human detected');
    expect(document.getElementById('breed-badge').textContent).toContain('No Pet Detected');
    expect(document.getElementById('confidence-text').textContent).toBe('Human detected');
    expect(document.getElementById('results').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('upload-area').classList.contains('hidden')).toBe(true);
  });

  test('uses default message if reason not provided', () => {
    showNoPetDetected();
    expect(document.getElementById('confidence-text').textContent).toContain('dog or cat');
  });

  test('clears breed bars', () => {
    document.getElementById('breed-bars').innerHTML = '<div>existing content</div>';
    showNoPetDetected('test');
    expect(document.getElementById('breed-bars').innerHTML).not.toBe('<div>existing content</div>');
  });
});

// ── loadAIModel ──────────────────────────────────────────

describe('loadAIModel()', () => {
  test('calls mobilenet.load when available', async () => {
    await loadAIModel();
    expect(global.window.mobilenet.load).toHaveBeenCalled();
  });

  test('handles missing mobilenet gracefully', async () => {
    global.window.mobilenet = null;
    await expect(loadAIModel()).resolves.not.toThrow();
  });
});

// ── setPetType ───────────────────────────────────────────

describe('setPetType()', () => {
  test('sets cat type and updates button classes', () => {
    setPetType('cat');
    expect(getPetType()).toBe('cat');
    expect(document.getElementById('btn-cat').classList.contains('active')).toBe(true);
    expect(document.getElementById('btn-dog').classList.contains('active')).toBe(false);
  });

  test('sets dog type correctly', () => {
    setPetType('dog');
    expect(getPetType()).toBe('dog');
    expect(document.getElementById('btn-dog').classList.contains('active')).toBe(true);
  });
});

// ── getImageHash ─────────────────────────────────────────

describe('getImageHash()', () => {
  test('returns a number from canvas', () => {
    const hash = getImageHash(document.getElementById('pet-canvas'));
    expect(typeof hash).toBe('number');
  });

  test('returns Date.now-like value for null canvas', () => {
    const hash = getImageHash(null);
    expect(typeof hash).toBe('number');
  });
});

// ── identifyBreed ─────────────────────────────────────────

describe('identifyBreed()', () => {
  test('scores golden retriever high for matching prediction', () => {
    setPetTypeVal('dog');
    const scores = identifyBreed([{ className: 'golden retriever', probability: 0.9 }], 100);
    expect(scores['Golden Retriever']).toBeGreaterThan(50);
  });

  test('returns 100% total when summed', () => {
    const scores = identifyBreed([{ className: 'beagle', probability: 0.8 }], 42);
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });

  test('works without predictions (fallback)', () => {
    const scores = identifyBreed(null, 123);
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });

  test('cat mode: boosts Bengal for tabby cat prediction', () => {
    setPetTypeVal('cat');
    const scores = identifyBreed([{ className: 'tabby cat', probability: 0.8 }], 100);
    expect(scores['Bengal']).toBeGreaterThan(10);
    setPetTypeVal('dog');
  });

  test('handles empty predictions array', () => {
    const scores = identifyBreed([], 99);
    expect(typeof scores).toBe('object');
    expect(Object.keys(scores).length).toBeGreaterThan(0);
  });
});

// ── handleUpload ─────────────────────────────────────────

describe('handleUpload()', () => {
  test('reads image file and triggers analyzeImage', (done) => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    handleUpload({ target: { files: [file] } });
    setTimeout(() => {
      expect(document.getElementById('results').classList.contains('hidden')).toBe(false);
      done();
    }, 900);
  });

  test('ignores non-image files', () => {
    const file = new File([''], 'doc.pdf', { type: 'application/pdf' });
    handleUpload({ target: { files: [file] } });
    expect(document.getElementById('results').classList.contains('hidden')).toBe(true);
  });

  test('handles null event gracefully', () => {
    expect(() => handleUpload(null)).not.toThrow();
  });
});

// ── resetAnalysis ────────────────────────────────────────

describe('resetAnalysis()', () => {
  test('shows upload area and hides results', () => {
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('upload-area').classList.add('hidden');
    resetAnalysis();
    expect(document.getElementById('upload-area').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('results').classList.contains('hidden')).toBe(true);
  });
});

// ── finalizeResults ──────────────────────────────────────

describe('finalizeResults()', () => {
  test('displays top breed badge and confidence', () => {
    finalizeResults({ 'Beagle': 75, 'Poodle': 25 });
    expect(document.getElementById('breed-badge').textContent).toBe('Beagle');
    expect(document.getElementById('confidence-text').textContent).toBe('75% confidence');
  });
});

// ── renderBreedBars ──────────────────────────────────────

describe('renderBreedBars()', () => {
  test('renders correct number of bars', () => {
    renderBreedBars({ 'Beagle': 60, 'Corgi': 40 }, 'Beagle');
    expect(document.getElementById('breed-bars').children.length).toBe(2);
  });

  test('marks top breed with "top" class', () => {
    renderBreedBars({ 'Beagle': 60, 'Poodle': 40 }, 'Beagle');
    const bars = document.querySelectorAll('.bar-fill');
    const topBars = Array.from(bars).filter(b => b.classList.contains('top'));
    expect(topBars.length).toBe(1);
  });
});
