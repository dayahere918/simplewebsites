const { processData } = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <textarea id="raw-input"></textarea>
        <select id="input-type">
            <option value="auto">Auto</option>
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
            <option value="xml">XML</option>
        </select>
        <select id="output-type">
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
            <option value="xml">XML</option>
            <option value="min">Minify</option>
        </select>
        <div id="error-box" class="hidden"></div>
        <span id="status-label"></span>
        <code id="formatted-output"></code>
    `;
    global.jsyaml = { 
        load: jest.fn().mockReturnValue({ a: 1 }), 
        dump: jest.fn().mockReturnValue('a: 1') 
    };
    global.Prism = { highlightElement: jest.fn() };
});

describe('JSON YAML Formatter Final', () => {
    test('processData formats correctly', () => {
        const input = document.getElementById('raw-input');
        const iType = document.getElementById('input-type');
        const oType = document.getElementById('output-type');
        const out = document.getElementById('formatted-output');

        input.value = '{"test":true}';
        iType.value = 'json';
        oType.value = 'json';
        
        processData();
        expect(out.textContent).toContain('test');
        
        oType.value = 'min';
        processData();
        expect(out.textContent).toBe('{"test":true}');
    });

    test('processData XML auto-detect', () => {
        document.getElementById('raw-input').value = '<root></root>';
        document.getElementById('input-type').value = 'auto';
        processData();
        expect(document.getElementById('status-label').textContent).toContain('XML');
    });
});
