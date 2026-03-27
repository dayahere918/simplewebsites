const {
    setPetType,
    getImageHash,
    identifyBreed,
    handleUpload,
    analyzeImage,
    loadAIModel,
    resetAnalysis
} = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <button id="btn-dog" class="pet-btn"></button>
        <button id="btn-cat" class="pet-btn"></button>
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

describe('Pet Breed Identifier', () => {
    test('loadAIModel resolves correctly', async () => {
        await loadAIModel();
        expect(global.window.mobilenet.load).toHaveBeenCalled();
    });

    test('setPetType triggers UI change', () => {
        setPetType('cat');
        expect(document.getElementById('btn-cat').classList.contains('active')).toBe(true);
    });

    test('getImageHash returns number', () => {
        const hash = getImageHash(document.getElementById('pet-canvas'));
        expect(typeof hash).toBe('number');
    });

    test('identifyBreed processes mobilenet predictions', () => {
        const scores = identifyBreed([{ className: 'golden retriever', probability: 0.9 }], 100);
        expect(scores['Golden Retriever']).toBeGreaterThan(50);
    });

    test('identifyBreed falls back gracefully', () => {
        setPetType('cat');
        const scores = identifyBreed([{ className: 'tiger cat', probability: 0.8 }], 100);
        expect(scores['Bengal']).toBeGreaterThan(10);
    });

    test('handleUpload and analyzeImage trigger the visualization pipeline', (done) => {
        const file = new File([''], 'test.png', { type: 'image/png' });
        handleUpload({ target: { files: [file] } });
        setTimeout(() => {
            // Because analyzeImage delays identifyFromImage by 800ms
            expect(document.getElementById('results').classList.contains('hidden')).toBe(false);
            done();
        }, 900);
    });

    test('resetAnalysis clears UI', () => {
        resetAnalysis();
        expect(document.getElementById('upload-area').classList.contains('hidden')).toBe(false);
    });
});
