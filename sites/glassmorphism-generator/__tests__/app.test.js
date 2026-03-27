const { hexToRgb, updateGlass, copyCSS, updateColor } = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <input id="blur" value="10" />
        <input id="opa" value="0.2" />
        <input id="out" value="0.3" />
        <input id="glass-color" value="#ffffff" />
        <span id="val-blur"></span>
        <span id="val-opa"></span>
        <span id="val-out"></span>
        <div id="glass-box"></div>
        <code id="css-output"></code>
        <button id="copy-btn">Copy</button>
    `;
    global.navigator.clipboard = { writeText: jest.fn() };
    global.event = { target: document.getElementById('copy-btn') };
});

describe('Glassmorphism Generator', () => {
    test('hexToRgb parses correctly', () => {
        expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    test('updateGlass applies styles', () => {
        updateGlass();
        expect(document.getElementById('glass-box').style.backdropFilter).toContain('blur(10px)');
    });

    test('copyCSS copies active styles', () => {
        document.getElementById('css-output').textContent = 'test css';
        copyCSS();
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test css');
    });
});
