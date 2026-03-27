const { handleUpload, setQuality, executeCompression } = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <div id="upload-area"></div>
        <div id="compress-ui" class="hidden"></div>
        <div id="result-ui" class="hidden"></div>
        <button id="btn-hq"></button>
        <button id="btn-mq"></button>
        <button id="btn-lq"></button>
        <span id="processing-status"></span>
        <button id="do-compress-btn"></button>
        <span id="saved-space"></span>
    `;
    global.FFmpeg = jest.fn();
    window.FFmpeg = {
        FFmpeg: class {
            constructor() {
                this.on = jest.fn();
                this.load = jest.fn().mockResolvedValue(true);
                this.writeFile = jest.fn().mockResolvedValue(true);
                this.exec = jest.fn().mockResolvedValue(true);
                this.readFile = jest.fn().mockResolvedValue(new Uint8Array(50));
            }
        }
    };
    window.FFmpegUtil = { fetchFile: jest.fn().mockResolvedValue(new Uint8Array(100)) };
});

describe('Video Compressor', () => {
    test('handleUpload triggers ui change', () => {
        handleUpload({ target: { files: [{ name: 'test.mp4', type: 'video/mp4', size: 100000 }] } });
        expect(document.getElementById('compress-ui').classList.contains('hidden')).toBe(false);
    });

    test('setQuality executes without throwing', () => {
        setQuality('high');
    });

    test('executeCompression runs ffmpeg chain', async () => {
        handleUpload({ target: { files: [{ name: 'test.mp4', type: 'video/mp4', size: 100000 }] } });
        await executeCompression();
        expect(document.getElementById('result-ui').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('saved-space').textContent).toContain('Saved');
    });
});
