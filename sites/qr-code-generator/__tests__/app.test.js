const { debounceGenerate, handleLogoUpload, clearLogo, generateQR, downloadQR } = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <input id="qr-data" value="test" />
        <input id="qr-dark" value="#000000" />
        <input id="qr-light" value="#ffffff" />
        <canvas id="qr-canvas"></canvas>
        <button id="remove-logo" class="hidden"></button>
        <input id="logo-input" type="file" />
        <button id="download-btn"></button>
    `;
    global.QRCode = { toCanvas: jest.fn().mockResolvedValue(true) };
    
    const canvas = document.getElementById('qr-canvas');
    canvas.getContext = jest.fn().mockReturnValue({
        fillStyle: '',
        beginPath: jest.fn(),
        roundRect: jest.fn(),
        fill: jest.fn(),
        drawImage: jest.fn()
    });
    canvas.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,test');
    
    global.FileReader = class {
        readAsDataURL() { this.onload({ target: { result: 'data:image/png' } }); }
    };
    global.Image = class {
        constructor() { setTimeout(() => this.onload(), 0); }
    };
});

describe('QR Code Generator', () => {
    test('generateQR compiles input securely via node-qrcode', async () => {
        await generateQR();
        expect(global.QRCode.toCanvas).toHaveBeenCalled();
    });

    test('handleLogoUpload embeds image and regenerates', (done) => {
        const file = new File([''], 'test.png', { type: 'image/png' });
        handleLogoUpload({ target: { files: [file] } });
        setTimeout(() => {
            expect(document.getElementById('remove-logo').classList.contains('hidden')).toBe(false);
            done();
        }, 10);
    });

    test('clearLogo clears and regenerates', () => {
        clearLogo();
        expect(document.getElementById('logo-input').value).toBe('');
    });

    test('downloadQR safely downloads canvas content', () => {
        downloadQR();
    });
});
