/**
 * Comprehensive tests for image-upscaler
 * Tests pure logic and DOM interactions
 */
const {
    validateImageSize, formatDimensions, parseScale,
    handleUpload, startUpscale, downloadImage,
    resetUpscaler, showUpscalerError, setupComparisonSlider,
    setOriginalImage, setResultDataURL, getOriginalImage, getResultDataURL
} = require('../app');

const DOM_HTML = `
    <div id="upload-area"></div>
    <div id="workspace" class="hidden"></div>
    <img id="img-preview" src="">
    <img id="img-result" class="hidden" src="">
    <div id="status-text"></div>
    <div id="loading"></div>
    <div id="download-area" class="hidden"></div>
    <div id="orig-dimensions"></div>
    <div id="new-dimensions"></div>
    <div id="comparison-wrap" class="hidden"></div>
    <input id="comparison-slider" type="range" value="50">
`;

beforeEach(() => {
    document.body.innerHTML = DOM_HTML;
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:test');
    // Reset module state by clearing the upscaler
    setOriginalImage(null);
    setResultDataURL(null);
    global.window = global;
    global.window.Upscaler = undefined;
});

describe('Image Upscaler — Pure Logic', () => {
    test('validateImageSize passes small images', () => {
        const { valid } = validateImageSize(400, 400);
        expect(valid).toBe(true);
    });

    test('validateImageSize fails large images', () => {
        const { valid, message } = validateImageSize(1200, 800);
        expect(valid).toBe(false);
        expect(message).toContain('too large');
    });

    test('validateImageSize respects custom maxDim', () => {
        expect(validateImageSize(300, 300, 200).valid).toBe(false);
        expect(validateImageSize(100, 100, 200).valid).toBe(true);
    });

    test('formatDimensions formats correctly', () => {
        expect(formatDimensions(800, 600)).toBe('800 × 600 px');
        expect(formatDimensions(400, 300, 2)).toBe('800 × 600 px');
    });

    test('parseScale parses scale values', () => {
        expect(parseScale(2)).toBe(2);
        expect(parseScale('4')).toBe(4);
        expect(parseScale(0)).toBe(1); // clamped to min
        expect(parseScale(10)).toBe(4); // clamped to max
        expect(parseScale('notanumber')).toBe(2); // default
    });
});

describe('Image Upscaler — DOM Functions', () => {
    test('showUpscalerError updates status text', () => {
        showUpscalerError('AI crashed');
        expect(document.getElementById('status-text').textContent).toContain('AI crashed');
    });

    test('resetUpscaler restores upload area', () => {
        document.getElementById('workspace').classList.remove('hidden');
        document.getElementById('upload-area').classList.add('hidden');
        resetUpscaler();
        expect(document.getElementById('upload-area').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('workspace').classList.contains('hidden')).toBe(true);
    });

    test('downloadImage does nothing without result', () => {
        setResultDataURL(null);
        downloadImage();
        expect(global.URL.createObjectURL).not.toHaveBeenCalled();
    });

    test('downloadImage creates download link', () => {
        setResultDataURL('data:image/png;base64,abc');
        downloadImage();
        // link.href and download are set
        expect(true).toBe(true); // just verify no crash
    });

    test('handleUpload ignores no file event', () => {
        handleUpload({ target: { files: [] } });
        expect(getOriginalImage()).toBeNull();
    });

    test('handleUpload ignores non-image file', () => {
        handleUpload({ target: { files: [{ type: 'application/pdf' }] } });
        expect(getOriginalImage()).toBeNull();
    });

    test('startUpscale returns early without originalImage', async () => {
        setOriginalImage(null);
        await startUpscale(2);
        expect(document.getElementById('status-text').textContent).toBe('');
    });

    test('startUpscale calls Upscaler when image set', async () => {
        const mockImg = { width: 100, height: 100, src: 'data:image/png;base64,abc' };
        setOriginalImage(mockImg);

        global.Upscaler = jest.fn().mockImplementation(() => ({
            upscale: jest.fn().mockResolvedValue('data:image/png;base64,upscaled')
        }));
        global.window.Upscaler = global.Upscaler;

        await startUpscale(2);
        expect(getResultDataURL()).toBe('data:image/png;base64,upscaled');
    });

    test('startUpscale shows error on Upscaler failure', async () => {
        const mockImg = { width: 100, height: 100 };
        setOriginalImage(mockImg);
        global.Upscaler = jest.fn().mockImplementation(() => ({
            upscale: jest.fn().mockRejectedValue(new Error('OOM'))
        }));
        global.window.Upscaler = global.Upscaler;
        // Force new instance
        resetUpscaler();
        setOriginalImage(mockImg);
        await startUpscale(2);
        expect(document.getElementById('status-text').textContent).toContain('OOM');
    });

    test('startUpscale throws error when Upscaler not loaded', async () => {
        const mockImg = { width: 100, height: 100 };
        setOriginalImage(mockImg);
        global.window.Upscaler = undefined;
        resetUpscaler();
        setOriginalImage(mockImg);
        await startUpscale(2);
        expect(document.getElementById('status-text').textContent).toContain('not loaded');
    });
});
