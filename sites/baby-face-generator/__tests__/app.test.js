/**
 * Comprehensive tests for baby-face-generator
 * Tests: isLandmarkAvailable, extractSkinTone, applyBabyFilter (non-destructive),
 *        applyWarmVignette, alignFace, blendImages, generateTraits
 */
const {
  TRAITS, blendImages, generateTraits, generateBaby, downloadResult, resetAll,
  extractSkinTone, applyBabyFilter, applyWarmVignette, alignFace, isLandmarkAvailable,
  getState, setParent1, setParent2, setLandmarks, getDrawImageParams, updateParentState
} = require('../app');

const DOM_HTML = `
  <button id="generate-btn" disabled></button>
  <button id="btn-parent1" class="pet-btn"></button>
  <input id="parent1-input" type="file" />
  <input id="parent2-input" type="file" />
  <canvas id="parent1-canvas" class="hidden"></canvas>
  <canvas id="parent2-canvas" class="hidden"></canvas>
  <canvas id="baby-canvas"></canvas>
  <div id="result-section" class="hidden"></div>
  <div id="baby-traits"></div>
`;

// Canvas mock factory
function makeMockCanvas(w = 200, h = 200, pixelVal = 128) {
  const pixelData = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < pixelData.length; i += 4) {
    pixelData[i] = pixelVal; pixelData[i+1] = pixelVal; pixelData[i+2] = pixelVal; pixelData[i+3] = 255;
  }

  const imageData = { data: pixelData, width: w, height: h };
  const outImageData = { data: new Uint8ClampedArray(w * h * 4), width: w, height: h };

  const ctx = {
    drawImage: jest.fn(),
    getImageData: jest.fn().mockReturnValue(imageData),
    putImageData: jest.fn(),
    fillRect: jest.fn(),
    fillStyle: '',
    filter: 'none',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    createImageData: jest.fn().mockReturnValue(outImageData),
    createRadialGradient: jest.fn().mockReturnValue({ addColorStop: jest.fn() }),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
  };

  const canvas = {
    width: w,
    height: h,
    getContext: jest.fn().mockReturnValue(ctx),
    classList: { remove: jest.fn(), add: jest.fn(), contains: jest.fn() },
    closest: jest.fn().mockReturnValue(null),
    parentElement: null
  };
  ctx.canvas = canvas;

  return { canvas, ctx, imageData };
}

beforeEach(() => {
  document.body.innerHTML = DOM_HTML;

  // Mock canvas elements
  ['parent1-canvas', 'parent2-canvas', 'baby-canvas'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const { ctx } = makeMockCanvas();
      el.getContext = jest.fn().mockReturnValue(ctx);
    }
  });

  // Mock document.createElement for temp canvases
  const origCreate = document.createElement.bind(document);
  jest.spyOn(document, 'createElement').mockImplementation((tag) => {
    if (tag === 'canvas') {
      const { canvas } = makeMockCanvas();
      return canvas;
    }
    if (tag === 'a') {
      return { href: '', download: '', click: jest.fn() };
    }
    return origCreate(tag);
  });

  setParent1(false);
  setParent2(false);
  setLandmarks('parent1', null);
  setLandmarks('parent2', null);
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ── TRAITS constant ────────────────────────────────────────

describe('TRAITS constant', () => {
  test('contains eyes, nose, hair, features arrays', () => {
    expect(Array.isArray(TRAITS.eyes)).toBe(true);
    expect(Array.isArray(TRAITS.nose)).toBe(true);
    expect(Array.isArray(TRAITS.hair)).toBe(true);
    expect(Array.isArray(TRAITS.features)).toBe(true);
  });

  test('all trait arrays are non-empty', () => {
    Object.values(TRAITS).forEach(arr => expect(arr.length).toBeGreaterThan(0));
  });
});

// ── isLandmarkAvailable ────────────────────────────────────

describe('isLandmarkAvailable()', () => {
  test('returns false when no landmarks set', () => {
    expect(isLandmarkAvailable('parent1')).toBe(false);
  });

  test('returns true when landmarks are set', () => {
    const mockLandmarks = Array(68).fill({ x: 100, y: 100 });
    setLandmarks('parent1', mockLandmarks);
    expect(isLandmarkAvailable('parent1')).toBe(true);
  });

  test('returns false for empty array', () => {
    setLandmarks('parent1', []);
    expect(isLandmarkAvailable('parent1')).toBe(false);
  });
});

// ── getDrawImageParams ─────────────────────────────────────

describe('getDrawImageParams()', () => {
  test('returns centered params for portrait image', () => {
    const params = getDrawImageParams(100, 200, 200);
    expect(typeof params.dx).toBe('number');
    expect(typeof params.dy).toBe('number');
    expect(typeof params.dw).toBe('number');
    expect(typeof params.dh).toBe('number');
  });

  test('fills target size for square image', () => {
    const params = getDrawImageParams(100, 100, 200);
    expect(params.dw).toBe(200);
    expect(params.dh).toBe(200);
  });
});

// ── extractSkinTone ────────────────────────────────────────

describe('extractSkinTone()', () => {
  test('returns valid RGB object', () => {
    const { canvas } = makeMockCanvas(200, 200, 180);
    const tone = extractSkinTone(canvas, 200);
    expect(typeof tone.r).toBe('number');
    expect(typeof tone.g).toBe('number');
    expect(typeof tone.b).toBe('number');
    expect(tone.r).toBeGreaterThanOrEqual(0);
    expect(tone.r).toBeLessThanOrEqual(255);
  });

  test('returns default for null canvas', () => {
    const tone = extractSkinTone(null, 200);
    expect(tone).toEqual({ r: 200, g: 170, b: 150 });
  });

  test('returns default when getImageData is missing', () => {
    const canvas = { getContext: () => ({}) };
    const tone = extractSkinTone(canvas, 200);
    expect(tone).toEqual({ r: 200, g: 170, b: 150 });
  });
});

// ── applyWarmVignette ──────────────────────────────────────

describe('applyWarmVignette() — non-destructive', () => {
  test('does not throw', () => {
    const { ctx } = makeMockCanvas();
    expect(() => applyWarmVignette(ctx, 200)).not.toThrow();
  });

  test('does not use destination-in composite (destructive)', () => {
    const { ctx } = makeMockCanvas();
    const usedOps = [];
    Object.defineProperty(ctx, 'globalCompositeOperation', {
      set: (val) => { usedOps.push(val); },
      get: () => 'source-over'
    });
    applyWarmVignette(ctx, 200);
    expect(usedOps).not.toContain('destination-in'); // CRITICAL: must not destroy pixels
  });

  test('resets globalAlpha to 1.0 after call', () => {
    const { ctx } = makeMockCanvas();
    let lastAlpha;
    Object.defineProperty(ctx, 'globalAlpha', {
      set: (val) => { lastAlpha = val; },
      get: () => lastAlpha || 1
    });
    applyWarmVignette(ctx, 200);
    expect(lastAlpha).toBe(1.0);
  });

  test('handles null ctx gracefully', () => {
    expect(() => applyWarmVignette(null, 200)).not.toThrow();
  });
});

// ── applyBabyFilter ────────────────────────────────────────

describe('applyBabyFilter() — non-destructive', () => {
  test('does not throw when canvas has proper context', () => {
    const { ctx } = makeMockCanvas();
    expect(() => applyBabyFilter(ctx, 200)).not.toThrow();
  });

  test('does not call putImageData (pixel destruction path)', () => {
    const { ctx } = makeMockCanvas();
    expect(ctx.putImageData).not.toHaveBeenCalled();
    applyBabyFilter(ctx, 200);
    expect(ctx.putImageData).not.toHaveBeenCalled(); // non-destructive — just draws
  });
});

// ── alignFace ──────────────────────────────────────────────

describe('alignFace()', () => {
  test('returns original canvas when landmarks is null', () => {
    const { canvas } = makeMockCanvas();
    const result = alignFace(canvas, null);
    expect(result).toBe(canvas);
  });

  test('returns aligned canvas when landmarks provided', () => {
    const { canvas } = makeMockCanvas();
    const landmarks = Array(68).fill({ x: 100, y: 100 });
    // Give eyes different positions for meaningful angle
    for (let i = 36; i < 42; i++) landmarks[i] = { x: 80, y: 90 };
    for (let i = 42; i < 48; i++) landmarks[i] = { x: 120, y: 90 };
    const result = alignFace(canvas, landmarks);
    expect(result).not.toBeNull();
    expect(result.width).toBe(200);
  });
});

// ── generateTraits ─────────────────────────────────────────

describe('generateTraits()', () => {
  test('returns exactly 5 traits', () => {
    const traits = generateTraits();
    expect(traits.length).toBe(5);
  });

  test('each trait is a non-empty string', () => {
    const traits = generateTraits();
    traits.forEach(t => {
      expect(typeof t).toBe('string');
      expect(t.length).toBeGreaterThan(0);
    });
  });

  test('traits come from TRAITS constant values', () => {
    const allPossible = [
      ...TRAITS.eyes, ...TRAITS.nose, ...TRAITS.hair, ...TRAITS.features
    ];
    const traits = generateTraits();
    traits.forEach(t => expect(allPossible).toContain(t));
  });
});

// ── blendImages ────────────────────────────────────────────

describe('blendImages()', () => {
  test('completes without throwing', () => {
    const { canvas: c1 } = makeMockCanvas();
    const { canvas: c2 } = makeMockCanvas();
    const { canvas: out } = makeMockCanvas();
    expect(() => blendImages(c1, c2, out)).not.toThrow();
  });

  test('calls putImageData to set blended pixels', () => {
    const { canvas: c1 } = makeMockCanvas();
    const { canvas: c2 } = makeMockCanvas();
    const { canvas: out, ctx } = makeMockCanvas();
    blendImages(c1, c2, out);
    expect(ctx.putImageData).toHaveBeenCalledTimes(1);
  });

  test('handles null canvases gracefully', () => {
    expect(() => blendImages(null, null, null)).not.toThrow();
  });

  test('output is fully opaque (alpha=255) for all pixels', () => {
    const { canvas: c1 } = makeMockCanvas(10, 10, 200);
    const { canvas: c2 } = makeMockCanvas(10, 10, 100);
    const { canvas: out, ctx } = makeMockCanvas(10, 10);

    let capturedData = null;
    ctx.putImageData = jest.fn().mockImplementation((data) => { capturedData = data; });
    ctx.createImageData = jest.fn().mockReturnValue({
      data: new Uint8ClampedArray(10 * 10 * 4),
      width: 10, height: 10
    });

    blendImages(c1, c2, out);

    if (capturedData) {
      for (let i = 3; i < capturedData.data.length; i += 4) {
        expect(capturedData.data[i]).toBe(255); // alpha must be fully opaque
      }
    }
  });
});

// ── updateParentState ──────────────────────────────────────

describe('updateParentState()', () => {
  test('enables generate button when both parents loaded', () => {
    setParent1(true); setParent2(true);
    updateParentState(1, true);
    expect(document.getElementById('generate-btn').disabled).toBe(false);
  });

  test('keeps generate button disabled when only one parent', () => {
    setParent1(true);
    updateParentState(1, true);
    expect(document.getElementById('generate-btn').disabled).toBe(true);
  });
});

// ── resetAll ──────────────────────────────────────────────

describe('resetAll()', () => {
  test('resets parent flags', () => {
    setParent1(true); setParent2(true);
    resetAll();
    const state = getState();
    expect(state.parent1Loaded).toBe(false);
    expect(state.parent2Loaded).toBe(false);
  });

  test('hides result-section', () => {
    document.getElementById('result-section').classList.remove('hidden');
    resetAll();
    expect(document.getElementById('result-section').classList.contains('hidden')).toBe(true);
  });
});
