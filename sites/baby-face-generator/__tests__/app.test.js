/**
 * @jest-environment jsdom
 */
const { 
  TRAITS, generateTraits, generateBaby, resetAll, downloadResult,
  getState, setParent1, setParent2, loadParent, blendImages,
  extractSkinTone, applyBabyFilter
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div class="upload-slot">
      <div id="drop-zone1" class="drop-zone"></div>
      <input id="parent1-input">
      <canvas id="parent1-canvas" class="hidden"></canvas>
    </div>
    <div class="upload-slot">
      <div id="drop-zone2" class="drop-zone"></div>
      <input id="parent2-input">
      <canvas id="parent2-canvas" class="hidden"></canvas>
    </div>
    
    <button id="generate-btn" disabled>Generate</button>
    <section id="result-section" class="hidden">
      <canvas id="baby-canvas"></canvas>
      <div id="baby-traits"></div>
    </section>
  `;
}

// Mock Canvas Context
const mockCtx = {
  drawImage: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(40000).fill(200) })),
  createImageData: jest.fn(() => ({ data: new Uint8ClampedArray(160000).fill(200) })),
  putImageData: jest.fn(),
  createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
  fillRect: jest.fn(),
  fillStyle: '',
  filter: '',
  globalCompositeOperation: 'source-over',
  canvas: { width: 200, height: 200 }
};
HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCtx);
HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,stub');

// Synchronous Mocks
global.FileReader = class {
  constructor() { this.onload = null; }
  readAsDataURL() { if (this.onload) this.onload({ target: { result: 'data:image/png;base64,stub' } }); }
};
global.Image = class {
  constructor() { this.onload = null; this._src = ''; this.width = 100; this.height = 100; }
  set src(v) { this._src = v; if (this.onload) this.onload(); }
  get src() { return this._src; }
};

describe('Baby Face Generator', () => {
  beforeEach(() => {
    setupDOM();
    resetAll();
    jest.clearAllMocks();
  });

  test('generateTraits returns 5 traits', () => {
    const traits = generateTraits();
    expect(traits.length).toBe(5);
    traits.forEach(t => expect(typeof t).toBe('string'));
  });

  test('TRAITS has all required categories', () => {
    expect(TRAITS.eyes.length).toBeGreaterThan(0);
    expect(TRAITS.nose.length).toBeGreaterThan(0);
    expect(TRAITS.hair.length).toBeGreaterThan(0);
    expect(TRAITS.features.length).toBeGreaterThan(0);
  });

  test('loadParent workflow for parent 1', () => {
    const event = { target: { files: [{ type: 'image/png' }] } };
    loadParent(event, 1);
    expect(getState().parent1Loaded).toBe(true);
    expect(document.getElementById('parent1-canvas').className).not.toContain('hidden');
  });

  test('loadParent workflow for parent 2', () => {
    const event = { target: { files: [{ type: 'image/jpeg' }] } };
    loadParent(event, 2);
    expect(getState().parent2Loaded).toBe(true);
  });

  test('loadParent rejects non-image file', () => {
    const event = { target: { files: [{ type: 'text/plain' }] } };
    loadParent(event, 1);
    expect(getState().parent1Loaded).toBe(false);
  });

  test('loadParent with null event does nothing', () => {
    loadParent(null, 1);
    expect(getState().parent1Loaded).toBe(false);
  });

  test('loadParent with empty files array does nothing', () => {
    const event = { target: { files: [] } };
    loadParent(event, 1);
    expect(getState().parent1Loaded).toBe(false);
  });

  test('generateBaby visibility logic', () => {
    setParent1(true);
    setParent2(true);
    generateBaby();
    expect(document.getElementById('result-section').className).not.toContain('hidden');
    expect(document.getElementById('baby-traits').innerHTML).toContain('trait-chip');
  });

  test('generateBaby requires both parents', () => {
    setParent1(true);
    setParent2(false);
    generateBaby();
    expect(document.getElementById('result-section').className).toContain('hidden');
  });

  test('blendImages execution path', () => {
    const c1 = document.getElementById('parent1-canvas');
    const c2 = document.getElementById('parent2-canvas');
    const out = document.getElementById('baby-canvas');
    blendImages(c1, c2, out);
    expect(mockCtx.putImageData).toHaveBeenCalled();
  });

  test('blendImages handles null inputs gracefully', () => {
    expect(() => blendImages(null, null, null)).not.toThrow();
  });

  test('extractSkinTone returns valid color object', () => {
    const canvas = document.getElementById('parent1-canvas');
    const tone = extractSkinTone(canvas, 200);
    expect(tone).toHaveProperty('r');
    expect(tone).toHaveProperty('g');
    expect(tone).toHaveProperty('b');
    expect(tone.r).toBeGreaterThanOrEqual(0);
    expect(tone.r).toBeLessThanOrEqual(255);
  });

  test('extractSkinTone returns default for null canvas', () => {
    const tone = extractSkinTone(null, 200);
    expect(tone.r).toBe(200);
    expect(tone.g).toBe(170);
    expect(tone.b).toBe(150);
  });

  test('applyBabyFilter does not throw', () => {
    expect(() => applyBabyFilter(mockCtx, 200)).not.toThrow();
  });

  test('applyBabyFilter handles null context', () => {
    expect(() => applyBabyFilter(null, 200)).not.toThrow();
  });

  test('resetAll cleanup', () => {
    setParent1(true);
    setParent2(true);
    document.getElementById('parent1-canvas').classList.remove('hidden');
    document.getElementById('drop-zone1').classList.add('hidden');
    resetAll();
    expect(getState().parent1Loaded).toBe(false);
    expect(getState().parent2Loaded).toBe(false);
    expect(document.getElementById('parent1-canvas').className).toContain('hidden');
    expect(document.getElementById('drop-zone1').className).not.toContain('hidden');
    expect(document.getElementById('result-section').className).toContain('hidden');
  });

  test('downloadResult creates a download link', () => {
    setupDOM();
    downloadResult();
    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalled();
  });

  test('generate button disabled until both parents loaded', () => {
    const btn = document.getElementById('generate-btn');
    expect(btn.disabled).toBe(true);
    const event1 = { target: { files: [{ type: 'image/png' }] } };
    loadParent(event1, 1);
    expect(btn.disabled).toBe(true); // only 1 loaded
    const event2 = { target: { files: [{ type: 'image/png' }] } };
    loadParent(event2, 2);
    expect(btn.disabled).toBe(false); // both loaded
  });
});
