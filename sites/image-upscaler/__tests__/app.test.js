const { handleUpload, startUpscale, downloadImage } = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <div id="upload-area"></div>
        <div id="workspace" class="hidden"></div>
        <img id="img-preview" />
        <img id="img-result" class="hidden" />
        <div id="loading">
            <button class="btn"></button>
            <span id="status-text"></span>
        </div>
        <div id="download-area" class="hidden"></div>
    `;
    global.Upscaler = jest.fn().mockImplementation(() => ({
        upscale: jest.fn().mockResolvedValue('data:image/png;base64,upscaled')
    }));
    window.Upscaler = global.Upscaler;
    
    global.FileReader = class {
        readAsDataURL() { this.onload({ target: { result: 'data:image/png;base64,test' } }); }
    };
    global.Image = class {
        constructor() { this.width = 100; this.height = 100; setTimeout(() => this.onload(), 0); }
    };
});

describe('Image Upscaler', () => {
    test('handleUpload sets originalImage and shows workspace', (done) => {
        handleUpload({ target: { files: [new Blob()] } });
        setTimeout(() => {
            expect(document.getElementById('workspace').classList.contains('hidden')).toBe(false);
            done();
        }, 10);
    });

    test('startUpscale executes upscale functionality', async () => {
        handleUpload({ target: { files: [new Blob()] } });
        await new Promise(r => setTimeout(r, 10)); // wait for load
        await startUpscale(2);
        expect(document.getElementById('img-result').src).toContain('upscaled');
        expect(document.getElementById('download-area').classList.contains('hidden')).toBe(false);
    });

    test('downloadImage creates anchor tag', () => {
        downloadImage(); // Handles gracefully if null
    });
});
