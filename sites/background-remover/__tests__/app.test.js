const { handleUpload, resetApp } = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <div id="upload-area"></div>
        <div id="processing-status" class="hidden"></div>
        <div id="result-ui" class="hidden">
            <img id="result-img" />
            <a id="download-link"></a>
        </div>
    `;
    global.imglyRemoveBackground = jest.fn().mockResolvedValue(new Blob([''], { type: 'image/png' }));
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:test');
    
    // Improved Image Mock for async onload
    global.Image = class {
        constructor() {
            this.onload = null;
            this.src = '';
        }
        set src(v) {
            this._src = v;
            if (v) setTimeout(() => { if (this.onload) this.onload(); }, 10);
        }
    };
});

describe('Background Remover Exhaustive', () => {
    test('handleUpload complete success path', async () => {
        const file = new File([''], 'test.png', { type: 'image/png' });
        handleUpload({ target: { files: [file] } });
        
        await new Promise(r => setTimeout(r, 50));
        expect(document.getElementById('result-ui').classList.contains('hidden')).toBe(false);
    });

    test('handleUpload handles error', async () => {
        global.imglyRemoveBackground.mockRejectedValue(new Error('Fail'));
        const file = new File([''], 'test.png', { type: 'image/png' });
        handleUpload({ target: { files: [file] } });
        
        await new Promise(r => setTimeout(r, 50));
        expect(document.getElementById('processing-status').textContent).toContain('Error');
    });
});
