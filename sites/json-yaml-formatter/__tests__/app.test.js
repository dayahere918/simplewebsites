const { processData, copyOutput } = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <textarea id="raw-input">{"a": 1}</textarea>
        <select id="input-type"><option value="auto">auto</option><option value="xml">xml</option><option value="json">json</option></select>
        <select id="output-type"><option value="min">min</option><option value="yaml">yaml</option></select>
        <code id="formatted-output"></code>
        <div id="error-box" class="hidden"></div>
        <span id="status-label"></span>
    `;
    global.jsyaml = { load: jest.fn().mockReturnValue({ a: 1 }), dump: jest.fn().mockReturnValue('a: 1') };
    global.Prism = { highlightElement: jest.fn() };
    global.navigator.clipboard = { writeText: jest.fn() };
    global.event = { target: { textContent: '' } };
});

describe('JSON Formatter', () => {
    test('processData with JSON minified', () => {
        document.getElementById('input-type').value = 'auto';
        document.getElementById('output-type').value = 'min';
        processData();
        expect(document.getElementById('formatted-output').textContent).toContain('"a":1');
    });

    test('processData with XML', () => {
        document.getElementById('raw-input').value = '<xml></xml>';
        document.getElementById('input-type').value = 'xml';
        document.getElementById('output-type').value = 'min';
        processData();
        expect(document.getElementById('formatted-output').textContent).toContain('<xml>');
    });

    test('processData with YAML', () => {
        document.getElementById('raw-input').value = 'a: 1';
        document.getElementById('input-type').value = 'auto'; // Will trigger jsyaml load fallback out of auto if not { or <
        document.getElementById('output-type').value = 'yaml';
        processData();
        expect(document.getElementById('formatted-output').textContent).toContain('a: 1');
    });
});
