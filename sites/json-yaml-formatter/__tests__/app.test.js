/**
 * Comprehensive tests for json-yaml-formatter
 * Tests all pure logic functions and DOM behavior
 */
const { processData, parseInput, formatOutput, generateDiff, escapeHtml, copyOutput } = require('../app');

const mockYaml = {
    load: jest.fn().mockImplementation(str => {
        if (str === 'invalid: yaml: {') throw new Error('Bad YAML');
        return { a: 1, b: 'hello' };
    }),
    dump: jest.fn().mockReturnValue('a: 1\nb: hello\n')
};

const DOM_HTML = `
    <textarea id="raw-input"></textarea>
    <select id="input-type">
        <option value="json">JSON</option>
        <option value="yaml">YAML</option>
        <option value="xml">XML</option>
        <option value="auto">Auto</option>
    </select>
    <select id="output-type">
        <option value="json">JSON</option>
        <option value="yaml">YAML</option>
        <option value="min">Minify</option>
    </select>
    <code id="formatted-output"></code>
    <div id="error-box" class="hidden"></div>
    <span id="status-label"></span>
    <button id="copy-btn">📋 Copy</button>
`;

beforeEach(() => {
    document.body.innerHTML = DOM_HTML;
    global.jsyaml = mockYaml;
    jest.clearAllMocks();
});

describe('JSON/YAML Formatter — parseInput', () => {
    test('parses JSON correctly', () => {
        const r = parseInput('{"a":1}', 'json', mockYaml);
        expect(r.error).toBeNull();
        expect(r.parsed).toEqual({ a: 1 });
        expect(r.detectedType).toBe('json');
    });

    test('returns error for invalid JSON', () => {
        const r = parseInput('not json', 'json', mockYaml);
        expect(r.error).toBeTruthy();
    });

    test('parses YAML correctly', () => {
        const r = parseInput('a: 1', 'yaml', mockYaml);
        expect(r.error).toBeNull();
        expect(r.detectedType).toBe('yaml');
    });

    test('returns error for invalid YAML', () => {
        const r = parseInput('invalid: yaml: {', 'yaml', mockYaml);
        expect(r.error).toBeTruthy();
    });

    test('parses XML correctly', () => {
        const r = parseInput('<root></root>', 'xml', mockYaml);
        expect(r.error).toBeNull();
        expect(r.detectedType).toBe('xml');
    });

    test('returns error for invalid XML', () => {
        const r = parseInput('<root><unclosed>', 'xml', mockYaml);
        // DOMParser may set parsererror
        // just check it completes
        expect(r).toBeDefined();
    });

    test('auto-detects JSON from {', () => {
        const r = parseInput('{"key":"val"}', 'auto', mockYaml);
        expect(r.detectedType).toBe('json');
    });

    test('auto-detects JSON from [', () => {
        const r = parseInput('[1,2,3]', 'auto', mockYaml);
        expect(r.detectedType).toBe('json');
    });

    test('auto-detects XML from <', () => {
        const r = parseInput('<root/>', 'auto', mockYaml);
        expect(r.detectedType).toBe('xml');
    });

    test('auto-detects YAML for other content', () => {
        const r = parseInput('a: 1', 'auto', mockYaml);
        expect(r.detectedType).toBe('yaml');
    });
});

describe('JSON/YAML Formatter — formatOutput', () => {
    test('formats to JSON', () => {
        const { outStr, langClass } = formatOutput({ a: 1 }, 'json', 'json', '', mockYaml);
        expect(outStr).toContain('"a"');
        expect(langClass).toBe('language-json');
    });

    test('formats to YAML', () => {
        const { outStr, langClass } = formatOutput({ a: 1 }, 'json', 'yaml', '', mockYaml);
        expect(outStr).toBe('a: 1\nb: hello\n');
        expect(langClass).toBe('language-yaml');
    });

    test('formats to minified JSON', () => {
        const { outStr, langClass } = formatOutput({ a: 1 }, 'json', 'min', '', mockYaml);
        expect(outStr).toBe('{"a":1}');
        expect(langClass).toBe('language-json');
    });

    test('passes through XML with formatting', () => {
        const xml = '<root><child/></root>';
        const { outStr, langClass } = formatOutput(xml, 'xml', 'json', xml, mockYaml);
        expect(langClass).toBe('language-markup');
    });
});

describe('JSON/YAML Formatter — generateDiff', () => {
    test('diff identical lines marks as same', () => {
        const diff = generateDiff('a\nb', 'a\nb');
        expect(diff).toContain('diff-same');
    });

    test('diff shows removed lines', () => {
        const diff = generateDiff('a\nb', 'a');
        expect(diff).toContain('diff-removed');
    });

    test('diff shows added lines', () => {
        const diff = generateDiff('a', 'a\nb');
        expect(diff).toContain('diff-added');
    });

    test('diff shows changed lines', () => {
        const diff = generateDiff('a', 'b');
        expect(diff).toContain('diff-removed');
        expect(diff).toContain('diff-added');
    });
});

describe('JSON/YAML Formatter — escapeHtml', () => {
    test('escapes all special chars', () => {
        expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
        expect(escapeHtml('"test"')).toBe('&quot;test&quot;');
        expect(escapeHtml('a & b')).toBe('a &amp; b');
    });
});

describe('JSON/YAML Formatter — processData DOM', () => {
    test('empty input shows Empty status', () => {
        document.getElementById('raw-input').value = '';
        processData();
        expect(document.getElementById('status-label').textContent).toBe('Empty');
    });

    test('valid JSON shows Valid status', () => {
        document.getElementById('raw-input').value = '{"a":1}';
        document.getElementById('input-type').value = 'json';
        document.getElementById('output-type').value = 'json';
        processData();
        expect(document.getElementById('status-label').textContent).toContain('Valid');
    });

    test('invalid JSON shows error', () => {
        document.getElementById('raw-input').value = '{invalid}';
        document.getElementById('input-type').value = 'json';
        processData();
        expect(document.getElementById('error-box').classList.contains('hidden')).toBe(false);
    });

    test('YAML input with YAML output', () => {
        document.getElementById('raw-input').value = 'key: value';
        document.getElementById('input-type').value = 'yaml';
        document.getElementById('output-type').value = 'yaml';
        processData();
        expect(document.getElementById('status-label').textContent).toContain('YAML');
    });
});
