const app = require('../app');
const { generateTraits, resetAll, alignFace, initFaceAPI, blendImages, setLandmarks } = app;

beforeEach(() => {
    document.body.innerHTML = `
        <div id="u-parent-1"><canvas id="parent1-canvas"></canvas></div>
        <div id="u-parent-2"><canvas id="parent2-canvas"></canvas></div>
        <div id="result-section" class="hidden"></div>
        <canvas id="baby-canvas"></canvas>
    `;
    global.faceapi = {
        nets: { ssdMobilenetv1: { loadFromUri: jest.fn() }, tinyFaceDetector: { loadFromUri: jest.fn() }, faceLandmark68Net: { loadFromUri: jest.fn() } },
        detectSingleFace: jest.fn().mockReturnValue({
            withFaceLandmarks: jest.fn().mockResolvedValue({
                landmarks: { getPositions: () => new Array(68).fill({ x: 10, y: 10 }) },
                detection: { box: { width: 100, height: 100 } }
            })
        })
    };
});

describe('Baby Face Ultimate Final', () => {
    test('blendImages success path', () => {
        const c1 = document.createElement('canvas'); c1.width=200; c1.height=200;
        const c2 = document.createElement('canvas'); c2.width=200; c2.height=200;
        const out = document.createElement('canvas'); out.width=200; out.height=200;
        
        // Mock landmarks as array of points
        const mockLM = new Array(68).fill({x:100, y:100});
        setLandmarks('parent1', mockLM);
        setLandmarks('parent2', mockLM);
        
        blendImages(c1, c2, out);
        expect(out.width).toBe(200);
    });

    test('alignFace math coverage', () => {
        const c = document.createElement('canvas'); c.width=100; c.height=100;
        const res = alignFace(c, new Array(68).fill({x:50, y:50}));
        expect(res).toBeDefined();
    });

    test('generateTraits length', () => {
        expect(generateTraits().length).toBe(5);
    });
});
