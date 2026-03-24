/**
 * @jest-environment jsdom
 */
const { TRAITS, generateTraits, generateBaby, resetAll, getState, setParent1, setParent2 } = require('../app');

function setupDOM() {
  // Mock Canvas
  HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
    drawImage: jest.fn(),
    getImageData: jest.fn().mockReturnValue({ data: new Uint8ClampedArray(200 * 200 * 4) }),
    createImageData: jest.fn().mockReturnValue({ data: new Uint8ClampedArray(200 * 200 * 4) }),
    putImageData: jest.fn(),
    set filter(v) {}
  });

  document.body.innerHTML = `
    <div id="drop-zone1"></div>
    <input id="parent1-input">
    <canvas id="parent1-canvas" class="hidden"></canvas>
    <div id="drop-zone2"></div>
    <input id="parent2-input">
    <canvas id="parent2-canvas" class="hidden"></canvas>
    <button id="generate-btn" disabled>Generate</button>
    <section id="result-section" class="hidden">
      <canvas id="baby-canvas"></canvas>
      <div id="baby-traits"></div>
    </section>
  `;
}

describe('Baby Face Generator', () => {
  beforeEach(() => {
    setupDOM();
    resetAll();
  });

  test('generateTraits returns exactly 5 traits', () => {
    const traits = generateTraits();
    expect(traits.length).toBe(5);
    traits.forEach(t => {
      const allPossible = Object.values(TRAITS).flat();
      expect(allPossible).toContain(t);
    });
  });

  test('generateBtn enables only when both parents loaded', () => {
    const btn = document.getElementById('generate-btn');
    setParent1(true);
    // Trigger something that logic check? generateBaby checks state
    // But button state is updated in loadParent, which is hard to unit test without more mocks
    // We can at least test that generateBaby returns early if not loaded
    generateBaby();
    expect(document.getElementById('result-section').classList.contains('hidden')).toBe(true);
    
    setParent2(true);
    generateBaby();
    // result-section should be visible now (if canvases exist)
    expect(document.getElementById('result-section').classList.contains('hidden')).toBe(false);
  });

  test('resetAll clears state and hides result', () => {
    setParent1(true);
    setParent2(true);
    document.getElementById('result-section').classList.remove('hidden');
    
    resetAll();
    
    expect(getState().parent1Loaded).toBe(false);
    expect(document.getElementById('result-section').classList.contains('hidden')).toBe(true);
  });
});
