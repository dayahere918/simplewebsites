const { handleUpload, downloadImage, resetApp } = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <div id="upload-area"></div>
        <div id="results" class="hidden"></div>
        <div id="processing-status"></div>
        <canvas id="bg-canvas"></canvas>
        <input id="file-input" type="file" />
        <button id="download-btn" disabled></button>
    `;
    global.URL = { createObjectURL: jest.fn().mockReturnValue('blobUrl'), revokeObjectURL: jest.fn() };
    global.imglyRemoveBackground = jest.fn().mockResolvedValue(new Blob(['test'], { type: 'image/png' }));
    
    // Mock canvas context
    const canvas = document.getElementById('bg-canvas');
    canvas.getContext = jest.fn().mockReturnValue({
        clearRect: jest.fn(),
        drawImage: jest.fn()
    });
    
    global.Image = class {
        constructor() { this.width = 100; this.height = 100; setTimeout(() => this.onload(), 0); }
    };
});

describe('Background Remover', () => {
    test('handleUpload processes image using imgly', async () => {
        const file = new File([''], 'test.png', { type: 'image/png' });
        await handleUpload({ target: { files: [file] } });
        expect(global.imglyRemoveBackground).toHaveBeenCalled();
        expect(document.getElementById('results').classList.contains('hidden')).toBe(false);
    });

    test('downloadImage triggers download if blob exists', async () => {
        const file = new File([''], 'test.png', { type: 'image/png' });
        await handleUpload({ target: { files: [file] } });
        // After handle, currentBlob is set.
        downloadImage();
    });

    test('resetApp clears UI', () => {
        resetApp();
        expect(document.getElementById('upload-area').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('results').classList.contains('hidden')).toBe(true);
    });
});
