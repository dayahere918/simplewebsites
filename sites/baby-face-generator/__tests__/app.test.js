/**
 * @jest-environment jsdom
 */
const { 
  TRAITS, generateTraits, generateBaby, resetAll, 
  getState, setParent1, setParent2, loadParent, blendImages 
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
  getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(40000).fill(255) })),
  createImageData: jest.fn(() => ({ data: new Uint8ClampedArray(40000).fill(255) })),
  putImageData: jest.fn(),
  filter: ''
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

  test('generateTraits logic', () => {
    expect(generateTraits().length).toBe(5);
  });

  test('loadParent workflow', () => {
    const event = { target: { files: [{ type: 'image/png' }] } };
    loadParent(event, 1);
    expect(getState().parent1Loaded).toBe(true);
    expect(document.getElementById('parent1-canvas').className).not.toContain('hidden');
  });

  test('generateBaby visibility logic', () => {
    setParent1(true);
    setParent2(true);
    // Prepare canvases
    const c1 = document.getElementById('parent1-canvas');
    const c2 = document.getElementById('parent2-canvas');
    const baby = document.getElementById('baby-canvas');
    
    generateBaby();
    expect(document.getElementById('result-section').className).not.toContain('hidden');
    expect(document.getElementById('baby-traits').innerHTML).toContain('trait-chip');
  });

  test('blendImages execution path', () => {
    const c1 = document.getElementById('parent1-canvas');
    const c2 = document.getElementById('parent2-canvas');
    const out = document.getElementById('baby-canvas');
    blendImages(c1, c2, out);
    expect(mockCtx.putImageData).toHaveBeenCalled();
  });

  test('resetAll cleanup', () => {
    setParent1(true);
    setParent2(true);
    
    // Set some elements to 'hidden' to test if reset un-hides them
    document.getElementById('parent1-canvas').classList.remove('hidden');
    document.getElementById('drop-zone1').classList.add('hidden');
    
    resetAll();
    
    expect(getState().parent1Loaded).toBe(false);
    expect(getState().parent2Loaded).toBe(false);
    
    // Canvases should be hidden again
    expect(document.getElementById('parent1-canvas').className).toContain('hidden');
    
    // Drop zones should be un-hidden
    expect(document.getElementById('drop-zone1').className).not.toContain('hidden');
    expect(document.getElementById('drop-zone2').className).not.toContain('hidden');
    
    // Result section should be hidden
    expect(document.getElementById('result-section').className).toContain('hidden');
  });
});
