/**
 * Comprehensive tests for glassmorphism-generator
 * Tests pure logic and DOM interactions
 */
const { hexToRgb, buildGlassCSS, getBackgroundForPreset, updateGlass, changeBg, copyCSS, applyPreset } = require('../app');

const DOM_HTML = `
    <div id="preview-area" style="background: linear-gradient(45deg, #ff00cc, #333399)"></div>
    <div id="glass-box" style="backdrop-filter: blur(16px)"></div>
    <input id="blur" type="range" value="16">
    <input id="opa" type="range" value="0.25">
    <input id="out" type="range" value="0.3">
    <input id="glass-color" type="color" value="#ffffff">
    <input id="radius" type="range" value="16">
    <code id="css-output"></code>
    <span id="val-blur"></span><span id="val-opa"></span>
    <span id="val-out"></span><span id="val-radius"></span>
    <button id="copy-btn">📋 Copy CSS</button>
    <button id="bg-gradient" class="bg-btn"></button>
    <button id="bg-purple" class="bg-btn"></button>
    <button id="bg-sunset" class="bg-btn"></button>
    <button id="bg-ocean" class="bg-btn"></button>
    <button id="bg-forest" class="bg-btn"></button>
    <button id="bg-rose" class="bg-btn"></button>
`;

beforeEach(() => {
    document.body.innerHTML = DOM_HTML;
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: jest.fn().mockResolvedValue(undefined) },
        configurable: true
    });
});

describe('Glassmorphism Generator — hexToRgb', () => {
    test('converts hex to rgb correctly', () => {
        expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
        expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
        expect(hexToRgb('#ff6b6b')).toEqual({ r: 255, g: 107, b: 107 });
    });

    test('falls back to white for invalid hex', () => {
        expect(hexToRgb('notahex')).toEqual({ r: 255, g: 255, b: 255 });
        expect(hexToRgb('')).toEqual({ r: 255, g: 255, b: 255 });
    });

    test('handles hex without #', () => {
        expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });
});

describe('Glassmorphism Generator — buildGlassCSS', () => {
    test('generates valid CSS', () => {
        const css = buildGlassCSS({ blur: 16, opacity: 0.25, borderOpacity: 0.3, colorHex: '#ffffff', borderRadius: 16 });
        expect(css).toContain('backdrop-filter: blur(16px)');
        expect(css).toContain('rgba(255, 255, 255, 0.25)');
        expect(css).toContain('border-radius: 16px');
        expect(css).toContain('box-shadow');
    });

    test('shadow can be disabled', () => {
        const css = buildGlassCSS({ blur: 10, opacity: 0.2, borderOpacity: 0.3, colorHex: '#000000', shadow: false });
        expect(css).not.toContain('box-shadow');
    });
});

describe('Glassmorphism Generator — getBackgroundForPreset', () => {
    test('all presets return valid gradients', () => {
        ['purple', 'sunset', 'ocean', 'forest', 'rose', 'gradient'].forEach(p => {
            const bg = getBackgroundForPreset(p);
            expect(bg).toContain('linear-gradient');
        });
    });

    test('unknown preset returns default gradient', () => {
        const bg = getBackgroundForPreset('unknown');
        expect(bg).toContain('linear-gradient');
    });
});

describe('Glassmorphism Generator — DOM Functions', () => {
    test('updateGlass updates values and box style', () => {
        updateGlass();
        const box = document.getElementById('glass-box');
        expect(box.style.backdropFilter).toContain('blur');
        expect(document.getElementById('val-blur').textContent).toBe('16px');
    });

    test('changeBg sets gradient background', () => {
        changeBg('gradient');
        // Check that the active button is highlighted (JSDOM does support classList)
        expect(document.getElementById('bg-gradient').classList.contains('active')).toBe(true);
    });

    test('changeBg sets purple gradient', () => {
        changeBg('purple');
        expect(document.getElementById('bg-purple').classList.contains('active')).toBe(true);
    });

    test('changeBg highlights active button and deactivates others', () => {
        changeBg('gradient');
        changeBg('sunset');
        expect(document.getElementById('bg-sunset').classList.contains('active')).toBe(true);
        expect(document.getElementById('bg-gradient').classList.contains('active')).toBe(false);
    });

    test('changeBg sets ocean background', () => {
        changeBg('ocean');
        expect(document.getElementById('bg-ocean').classList.contains('active')).toBe(true);
    });

    test('applyPreset applies frosted glass values', () => {
        applyPreset('frosted');
        expect(document.getElementById('blur').value).toBe('16');
    });

    test('applyPreset applies dark values', () => {
        applyPreset('dark');
        expect(document.getElementById('glass-color').value).toBe('#000000');
    });

    test('applyPreset ignores unknown preset', () => {
        const prev = document.getElementById('blur').value;
        applyPreset('nonexistent');
        expect(document.getElementById('blur').value).toBe(prev);
    });

    test('copyCSS copies text to clipboard', () => {
        document.getElementById('css-output').textContent = '.glass { color: red; }';
        copyCSS();
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('.glass { color: red; }');
    });

    test('copyCSS does nothing when empty', () => {
        document.getElementById('css-output').textContent = '';
        copyCSS();
        expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    });
});
