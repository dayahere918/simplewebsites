/**
 * Comprehensive tests for video-compressor
 * Tests all pure logic functions and DOM interactions
 */
const {
    qualityToCRF, formatSize, calcSavings, isVideoFile,
    handleUpload, setVideoFile, setQuality, downloadVideo,
    resetCompressor, showError, resetFFmpeg, getFFmpeg,
    getVideoFile, getQuality, getOutputBlob, setOutputBlob
} = require('../app');

const DOM_HTML = `
    <div id="upload-area"></div>
    <div id="compress-ui" class="hidden"></div>
    <div id="result-ui" class="hidden"></div>
    <div id="processing-status" class="hidden"></div>
    <div id="progress-wrap" class="hidden"></div>
    <div id="progress-bar" style="width:0%"></div>
    <div id="file-info"></div>
    <div id="saved-space"></div>
    <button id="do-compress-btn"></button>
    <button id="btn-hq" class="btn btn-secondary"></button>
    <button id="btn-mq" class="btn btn-primary active"></button>
    <button id="btn-lq" class="btn btn-secondary"></button>
`;

beforeEach(() => {
    document.body.innerHTML = DOM_HTML;
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:test');
    resetFFmpeg();
});

describe('Video Compressor — Pure Logic', () => {
    test('qualityToCRF maps correctly', () => {
        expect(qualityToCRF('high')).toBe('23');
        expect(qualityToCRF('medium')).toBe('28');
        expect(qualityToCRF('low')).toBe('34');
        expect(qualityToCRF('other')).toBe('28'); // default
    });

    test('formatSize handles all sizes', () => {
        expect(formatSize(0)).toBe('0 B');
        expect(formatSize(500)).toBe('500 B');
        expect(formatSize(1500)).toBe('1.5 KB');
        expect(formatSize(2 * 1024 * 1024)).toBe('2.00 MB');
    });

    test('calcSavings calculates correctly', () => {
        expect(calcSavings(1000, 500)).toBe(50);
        expect(calcSavings(1000, 1000)).toBe(0);
        expect(calcSavings(0, 500)).toBe(0);
        expect(calcSavings(1000, 100)).toBe(90);
    });

    test('isVideoFile validates correctly', () => {
        expect(isVideoFile({ type: 'video/mp4' })).toBe(true);
        expect(isVideoFile({ type: 'video/webm' })).toBe(true);
        expect(isVideoFile({ type: 'image/png' })).toBe(false);
        expect(isVideoFile(null)).toBe(false);
        expect(isVideoFile(undefined)).toBe(false);
    });
});

describe('Video Compressor — DOM Interactions', () => {
    test('setVideoFile shows compress UI and hides upload', () => {
        const mockFile = { name: 'test.mp4', size: 1024 * 1024, type: 'video/mp4' };
        // Mock initFFmpeg as it requires network
        global.window.FFmpeg = null;
        setVideoFile(mockFile);
        expect(document.getElementById('compress-ui').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('upload-area').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('file-info').textContent).toContain('test.mp4');
    });

    test('handleUpload ignores non-video files', () => {
        const mockFile = { type: 'image/png', name: 'img.png' };
        handleUpload({ target: { files: [mockFile] } });
        expect(document.getElementById('compress-ui').classList.contains('hidden')).toBe(true);
    });

    test('handleUpload ignores null event files', () => {
        handleUpload({ target: { files: [] } });
        expect(document.getElementById('compress-ui').classList.contains('hidden')).toBe(true);
    });

    test('setQuality updates button states', () => {
        setQuality('high');
        expect(document.getElementById('btn-hq').classList.contains('active')).toBe(true);
        expect(document.getElementById('btn-mq').classList.contains('active')).toBe(false);
        setQuality('low');
        expect(document.getElementById('btn-lq').classList.contains('active')).toBe(true);
    });

    test('showError updates status text', () => {
        showError('Something went wrong');
        const status = document.getElementById('processing-status');
        expect(status.textContent).toContain('Something went wrong');
        expect(status.classList.contains('hidden')).toBe(false);
    });

    test('downloadVideo does nothing without blob', () => {
        downloadVideo();
        expect(global.URL.createObjectURL).not.toHaveBeenCalled();
    });

    test('downloadVideo creates link with blob', () => {
        const mockBlob = new Blob(['data'], { type: 'video/mp4' });
        setOutputBlob(mockBlob);
        downloadVideo();
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    });

    test('resetCompressor hides compress UI and shows upload', () => {
        document.getElementById('compress-ui').classList.remove('hidden');
        document.getElementById('result-ui').classList.remove('hidden');
        resetCompressor();
        expect(document.getElementById('upload-area').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('compress-ui').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('result-ui').classList.contains('hidden')).toBe(true);
    });

    test('executeCompression returns early without videoFile', async () => {
        const { executeCompression } = require('../app');
        // videoFile is null, should return without error
        await expect(executeCompression()).resolves.toBeUndefined();
    });

    test('getQuality returns current quality', () => {
        setQuality('high');
        expect(getQuality()).toBe('high');
    });

    test('FFmpeg state is manageable', () => {
        resetFFmpeg();
        expect(getFFmpeg()).toBeNull();
    });
});
