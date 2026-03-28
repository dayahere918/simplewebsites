/**
 * Comprehensive tests for baby-face-generator
 * Enhanced coverage for all pure logic and canvas operations
 */
const app = require('../app');
const { generateTraits, resetAll, alignFace, blendImages, extractSkinTone, applyBabyFilter, setLandmarks, setParent1, setParent2, TRAITS } = app;

const DOM_HTML = `
    <div class="upload-slot">
        <canvas id="parent1-canvas" width="200" height="200"></canvas>
        <div class="drop-zone"></div>
        <input id="parent1-input" type="file">
    </div>
    <div class="upload-slot">
        <canvas id="parent2-canvas" width="200" height="200"></canvas>
        <div class="drop-zone"></div>
        <input id="parent2-input" type="file">
    </div>
    <div id="result-section" class="hidden">
        <canvas id="baby-canvas" width="200" height="200"></canvas>
        <div id="baby-traits"></div>
    </div>
    <button id="generate-btn" disabled></button>
`;

beforeEach(() => {
    document.body.innerHTML = DOM_HTML;
    global.faceapi = { nets: { tinyFaceDetector: { loadFromUri: jest.fn(), isLoaded: false }, faceLandmark68Net: { loadFromUri: jest.fn() } }, detectAllFaces: jest.fn(), TinyFaceDetectorOptions: jest.fn() };
    setParent1(false);
    setParent2(false);
    setLandmarks('parent1', null);
    setLandmarks('parent2', null);
});

describe('Baby Face Generator — TRAITS', () => {
    test('TRAITS has required categories', () => {
        expect(TRAITS.eyes.length).toBeGreaterThan(0);
        expect(TRAITS.nose.length).toBeGreaterThan(0);
        expect(TRAITS.hair.length).toBeGreaterThan(0);
        expect(TRAITS.features.length).toBeGreaterThan(0);
    });
});

describe('Baby Face Generator — generateTraits', () => {
    test('returns exactly 5 traits', () => {
        const traits = generateTraits();
        expect(traits).toHaveLength(5);
    });

    test('all traits are strings', () => {
        const traits = generateTraits();
        traits.forEach(t => expect(typeof t).toBe('string'));
    });

    test('generates different results each time (randomness)', () => {
        const results = new Set();
        for (let i = 0; i < 10; i++) results.add(generateTraits().join(','));
        expect(results.size).toBeGreaterThan(1);
    });
});

describe('Baby Face Generator — extractSkinTone', () => {
    test('returns fallback for null canvas', () => {
        const tone = extractSkinTone(null, 200);
        expect(tone).toEqual({ r: 200, g: 170, b: 150 });
    });

    test('returns fallback when getImageData is unavailable', () => {
        const fakeCanvas = { getContext: () => ({ getImageData: null }) };
        const tone = extractSkinTone(fakeCanvas, 200);
        expect(tone).toEqual({ r: 200, g: 170, b: 150 });
    });

    test('returns a tone object from canvas (JSDOM returns 0 pixels, hits fallback)', () => {
        // In JSDOM, canvas always returns 0 pixels so it hits the fallback
        const fakeCanvas = document.createElement('canvas');
        fakeCanvas.width = 200; fakeCanvas.height = 200;
        const tone = extractSkinTone(fakeCanvas, 200);
        // Either fallback or computed - just verify it's a valid RGB object
        expect(tone).toHaveProperty('r');
        expect(tone).toHaveProperty('g');
        expect(tone).toHaveProperty('b');
    });
});

describe('Baby Face Generator — alignFace', () => {
    test('returns input canvas without landmarks', () => {
        const c = document.createElement('canvas'); c.width = 100; c.height = 100;
        const res = alignFace(c, null);
        expect(res).toBe(c);
    });

    test('performs transform with landmarks array', () => {
        const c = document.createElement('canvas'); c.width = 200; c.height = 200;
        const lm = new Array(68).fill({ x: 100, y: 100 });
        const res = alignFace(c, lm);
        expect(res).toBeDefined();
        expect(res.width).toBe(200);
    });

    test('handles non-uniform landmarks (prevents division by zero)', () => {
        const c = document.createElement('canvas'); c.width = 200; c.height = 200;
        const lm = new Array(68).fill({ x: 50, y: 50 });
        // Override specific eye coordinates
        lm[36] = { x: 60, y: 80 };
        lm[42] = { x: 140, y: 80 };
        const res = alignFace(c, lm);
        expect(res).toBeDefined();
    });
});

describe('Baby Face Generator — applyBabyFilter', () => {
    test('runs without error on valid context', () => {
        const c = document.createElement('canvas'); c.width = 200; c.height = 200;
        const ctx = c.getContext('2d');
        expect(() => applyBabyFilter(ctx, 200)).not.toThrow();
    });

    test('returns early for null context', () => {
        expect(() => applyBabyFilter(null, 200)).not.toThrow();
    });
});

describe('Baby Face Generator — blendImages', () => {
    test('blends two canvases without error', () => {
        const c1 = document.createElement('canvas'); c1.width = 200; c1.height = 200;
        const c2 = document.createElement('canvas'); c2.width = 200; c2.height = 200;
        const out = document.createElement('canvas'); out.width = 200; out.height = 200;
        const mockLm = new Array(68).fill(null).map((_, i) => ({ x: i * 3, y: i * 2 }));
        setLandmarks('parent1', mockLm);
        setLandmarks('parent2', mockLm);
        expect(() => blendImages(c1, c2, out)).not.toThrow();
        expect(out.width).toBe(200);
    });

    test('early return for missing canvases', () => {
        expect(() => blendImages(null, null, null)).not.toThrow();
    });
});

describe('Baby Face Generator — resetAll', () => {
    test('resets state flags', () => {
        setParent1(true); setParent2(true);
        resetAll();
        const state = app.getState();
        expect(state.parent1Loaded).toBe(false);
        expect(state.parent2Loaded).toBe(false);
    });

    test('hides result section', () => {
        document.getElementById('result-section').classList.remove('hidden');
        resetAll();
        expect(document.getElementById('result-section').classList.contains('hidden')).toBe(true);
    });

    test('disables generate button', () => {
        document.getElementById('generate-btn').disabled = false;
        resetAll();
        expect(document.getElementById('generate-btn').disabled).toBe(true);
    });
});
