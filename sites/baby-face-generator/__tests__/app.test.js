const { generateBaby, extractSkinTone, applyBabyFilter, blendImages } = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <canvas id="parent1-canvas"></canvas>
        <canvas id="parent2-canvas"></canvas>
        <canvas id="baby-canvas"></canvas>
        <div id="baby-traits"></div>
        <div id="result-section" class="hidden"></div>
        <button id="generate-btn" disabled></button>
    `;

    const mockContext = {
        drawImage: jest.fn(),
        fillRect: jest.fn(),
        getImageData: jest.fn().mockReturnValue({ data: new Uint8ClampedArray(200*200*4) }),
        createImageData: jest.fn().mockReturnValue({ data: new Uint8ClampedArray(200*200*4) }),
        putImageData: jest.fn(),
        createRadialGradient: jest.fn().mockReturnValue({ addColorStop: jest.fn() }),
        translate: jest.fn(),
        rotate: jest.fn(),
        scale: jest.fn(),
        clearRect: jest.fn()
    };
    
    document.querySelectorAll('canvas').forEach(c => {
        c.getContext = jest.fn().mockReturnValue({...mockContext, canvas: c});
    });

    const origCreate = document.createElement.bind(document);
    document.createElement = (tag) => {
        const el = origCreate(tag);
        if (tag === 'canvas') {
            el.getContext = jest.fn().mockReturnValue({...mockContext, canvas: el});
        }
        return el;
    };

    global.faceapi = {
        nets: { tinyFaceDetector: { isLoaded: true } },
        detectAllFaces: jest.fn().mockResolvedValue([{ landmarks: { positions: Array(68).fill({x:10, y:10}) } }])
    };
});

describe('Baby Face Generator', () => {
    test('extractSkinTone handles valid canvas context', () => {
        const c1 = document.getElementById('parent1-canvas');
        const tone = extractSkinTone(c1, 200);
        expect(tone).toHaveProperty('r');
        expect(tone).toHaveProperty('g');
        expect(tone).toHaveProperty('b');
    });

    test('applyBabyFilter applies correct composite operations', () => {
        const c1 = document.getElementById('parent1-canvas');
        const ctx = c1.getContext('2d');
        applyBabyFilter(ctx, 200);
        expect(ctx.globalCompositeOperation).toBe('source-over');
    });

    test('generateBaby execution integrates all subcomponents', () => {
        const { setParent1, setParent2 } = require('../app');
        setParent1(true);
        setParent2(true);
        
        generateBaby();
        
        expect(document.getElementById('result-section').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('baby-traits').innerHTML.length).toBeGreaterThan(0);
    });
});
