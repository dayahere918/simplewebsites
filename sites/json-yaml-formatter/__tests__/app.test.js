/**
 * Comprehensive tests for json-yaml-formatter
 * Tests sanitizeYamlInput, parseInput, formatOutput, generateDiff, escapeHtml
 */
const {
  parseInput, formatOutput, generateDiff, escapeHtml,
  sanitizeYamlInput, toggleDiffView, runDiff
} = require('../app');

// Mock jsyaml
const mockYamlLib = {
  load: jest.fn((str) => {
    // Simple mock: parse key: value pairs
    if (str.includes('invalid_yaml_!!!')) throw new Error('YAML parse error');
    const result = {};
    str.split('\n').forEach(line => {
      const m = line.match(/^(\w+):\s*(.+)$/);
      if (m) result[m[1]] = m[2].replace(/^["']|["']$/g, '');
    });
    return result;
  }),
  dump: jest.fn((obj) => Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join('\n')),
};

const DOM_HTML = `
  <textarea id="raw-input"></textarea>
  <select id="input-type"><option value="auto">Auto-Detect</option><option value="json">JSON</option><option value="yaml">YAML</option></select>
  <select id="output-type"><option value="json">JSON</option><option value="yaml">YAML</option></select>
  <code id="formatted-output"></code>
  <div id="error-box" class="hidden"></div>
  <div id="notice-box" class="hidden"></div>
  <span id="status-label"></span>
  <div id="diff-panel" class="hidden"></div>
  <textarea id="diff-input-a"></textarea>
  <textarea id="diff-input-b"></textarea>
  <div id="diff-result"></div>
`;

beforeEach(() => {
  document.body.innerHTML = DOM_HTML;
  global.jsyaml = mockYamlLib;
  jest.clearAllMocks();
});

// ── sanitizeYamlInput ────────────────────────────────────

describe('sanitizeYamlInput()', () => {
  test('replaces leading tabs with 2-space indent', () => {
    const input = 'service:\n\tname: web\n\tport: 80';
    const { sanitized, hadTabs } = sanitizeYamlInput(input);
    expect(hadTabs).toBe(true);
    expect(sanitized).not.toContain('\t');
    expect(sanitized).toContain('  name: web');
  });

  test('returns hadTabs: false and hadMissingSpaces: false for clean input', () => {
    const input = 'service:\n  name: web\n  port: 80';
    const { sanitized, hadTabs, hadMissingSpaces } = sanitizeYamlInput(input);
    expect(hadTabs).toBe(false);
    expect(hadMissingSpaces).toBe(false);
    expect(sanitized).toBe(input);
  });

  test('handles multiple levels of tabs', () => {
    const input = 'a:\n\tb:\n\t\tc: val';
    const { sanitized } = sanitizeYamlInput(input);
    expect(sanitized).toBe('a:\n  b:\n    c: val');
  });

  test('returns empty string for empty input', () => {
    const { sanitized, hadTabs } = sanitizeYamlInput('');
    expect(sanitized).toBe('');
    expect(hadTabs).toBe(false);
  });

  test('handles non-string input gracefully', () => {
    const { sanitized, hadTabs } = sanitizeYamlInput(null);
    expect(sanitized).toBe('');
    expect(hadTabs).toBe(false);
  });

  test('only replaces LEADING tabs, not mid-line tabs', () => {
    const input = 'key: value\t\n\tnested: val';
    const { sanitized } = sanitizeYamlInput(input);
    expect(sanitized).toContain('key: value\t'); // mid-line tab preserved
    expect(sanitized).toContain('  nested: val'); // leading tab converted
  });

  test('adds missing space after colon', () => {
    const input = 'port:80\nenv:production';
    const { sanitized, hadMissingSpaces } = sanitizeYamlInput(input);
    expect(hadMissingSpaces).toBe(true);
    expect(sanitized).toBe('port: 80\nenv: production');
  });

  test('does not add space after colon in URLs or mid-string', () => {
    const input = 'url: http://example.com/api:v1';
    const { sanitized, hadMissingSpaces } = sanitizeYamlInput(input);
    expect(hadMissingSpaces).toBe(false); // No missing spaces in this input
    expect(sanitized).toBe('url: http://example.com/api:v1');
  });

  test('fixes mixed tabs and spaces indentation', () => {
    const input = 'a:\n \tb: 1';
    const { sanitized, hadTabs } = sanitizeYamlInput(input);
    expect(hadTabs).toBe(true);
    expect(sanitized).toBe('a:\n   b: 1'); // 1 space + 1 tab(->2 spaces) = 3 spaces
  });
});

// ── parseInput — JSON ────────────────────────────────────

describe('parseInput() — JSON', () => {
  test('parses valid JSON', () => {
    const { parsed, detectedType, error } = parseInput('{"key":"val"}', 'json', mockYamlLib);
    expect(parsed).toEqual({ key: 'val' });
    expect(detectedType).toBe('json');
    expect(error).toBeNull();
  });

  test('returns error for invalid JSON', () => {
    const { error } = parseInput('{bad json}', 'json', mockYamlLib);
    expect(error).not.toBeNull();
  });

  test('auto-detects JSON by { prefix', () => {
    const { detectedType } = parseInput('{"a":1}', 'auto', mockYamlLib);
    expect(detectedType).toBe('json');
  });

  test('auto-detects JSON by [ prefix', () => {
    const { detectedType, parsed } = parseInput('[1,2,3]', 'auto', mockYamlLib);
    expect(detectedType).toBe('json');
    expect(parsed).toEqual([1, 2, 3]);
  });
});

// ── parseInput — YAML ────────────────────────────────────

describe('parseInput() — YAML', () => {
  test('parses valid YAML', () => {
    const { parsed, detectedType, error } = parseInput('key: value', 'yaml', mockYamlLib);
    expect(mockYamlLib.load).toHaveBeenCalled();
    expect(detectedType).toBe('yaml');
    expect(error).toBeNull();
  });

  test('auto-sanitizes tab-indented YAML', () => {
    const tabYaml = 'service:\n\tname: web';
    const { error, notice } = parseInput(tabYaml, 'yaml', mockYamlLib);
    expect(error).toBeNull();
    expect(notice).toContain('Tabs');
  });

  test('auto-detects YAML for non-JSON, non-XML input', () => {
    const { detectedType } = parseInput('key: value\nother: stuff', 'auto', mockYamlLib);
    expect(detectedType).toBe('yaml');
  });

  test('returns parse error for malformed YAML', () => {
    const { error } = parseInput('invalid_yaml_!!!', 'yaml', mockYamlLib);
    expect(error).not.toBeNull();
  });

  test('no notice for clean YAML input', () => {
    const { notice } = parseInput('key: value', 'yaml', mockYamlLib);
    expect(notice).toBeNull();
  });
});

// ── parseInput — XML ─────────────────────────────────────

describe('parseInput() — XML', () => {
  test('detects XML by < prefix in auto mode', () => {
    global.DOMParser = class {
      parseFromString(s, t) {
        return { querySelector: () => null };
      }
    };
    const { detectedType } = parseInput('<root><a>1</a></root>', 'auto', mockYamlLib);
    expect(detectedType).toBe('xml');
  });
});

// ── formatOutput ─────────────────────────────────────────

describe('formatOutput()', () => {
  test('formats parsed JSON to pretty JSON string', () => {
    const { outStr, langClass } = formatOutput({ a: 1 }, 'json', 'json', '', mockYamlLib);
    expect(outStr).toBe(JSON.stringify({ a: 1 }, null, 2));
    expect(langClass).toBe('language-json');
  });

  test('formats parsed to YAML using yamlLib.dump', () => {
    const { outStr, langClass } = formatOutput({ a: 1 }, 'json', 'yaml', '', mockYamlLib);
    expect(mockYamlLib.dump).toHaveBeenCalled();
    expect(langClass).toBe('language-yaml');
  });

  test('minifies JSON', () => {
    const { outStr, langClass } = formatOutput({ a: 1, b: 2 }, 'json', 'min', '', mockYamlLib);
    expect(outStr).toBe('{"a":1,"b":2}');
    expect(langClass).toBe('language-json');
  });
});

// ── generateDiff ─────────────────────────────────────────

describe('generateDiff()', () => {
  test('marks equal lines as diff-same', () => {
    const html = generateDiff('hello', 'hello');
    expect(html).toContain('diff-same');
    expect(html).toContain('hello');
  });

  test('marks removed lines as diff-removed', () => {
    const html = generateDiff('old line', '');
    expect(html).toContain('diff-removed');
    expect(html).toContain('old line');
  });

  test('marks added lines as diff-added', () => {
    const html = generateDiff('', 'new line');
    expect(html).toContain('diff-added');
    expect(html).toContain('new line');
  });

  test('handles multiline diffs', () => {
    const html = generateDiff('a\nb\nc', 'a\nx\nc');
    expect(html).toContain('diff-removed'); // b → x
    expect(html).toContain('diff-added');
  });

  test('handles identical empty strings (one same-line div)', () => {
    const result = generateDiff('', '');
    expect(result).toContain('diff-same');
  });
});

// ── escapeHtml ───────────────────────────────────────────

describe('escapeHtml()', () => {
  test('escapes &, <, >, "', () => {
    const result = escapeHtml('<div class="test">&</div>');
    expect(result).toBe('&lt;div class=&quot;test&quot;&gt;&amp;&lt;/div&gt;');
  });

  test('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  test('handles non-string input via String()', () => {
    expect(escapeHtml(42)).toBe('42');
  });
});

// ── toggleDiffView / runDiff ─────────────────────────────

describe('toggleDiffView() and runDiff()', () => {
  test('toggleDiffView toggles hidden class', () => {
    toggleDiffView();
    expect(document.getElementById('diff-panel').classList.contains('hidden')).toBe(false);
    toggleDiffView();
    expect(document.getElementById('diff-panel').classList.contains('hidden')).toBe(true);
  });

  test('runDiff updates diff-result innerHTML', () => {
    document.getElementById('diff-input-a').value = 'line1';
    document.getElementById('diff-input-b').value = 'line2';
    runDiff();
    expect(document.getElementById('diff-result').innerHTML).toContain('diff-');
  });
});

// ── processData Integration ──────────────────────────────

const { processData } = require('../app');

describe('processData()', () => {
  beforeEach(() => {
    document.getElementById('raw-input').value = '';
    document.getElementById('formatted-output').innerHTML = '';
    document.getElementById('error-box').classList.add('hidden');
    document.getElementById('notice-box').classList.add('hidden');
    jest.clearAllMocks();
  });

  test('processes valid JSON input successfully', () => {
    document.getElementById('raw-input').value = '{"test": 123}';
    document.getElementById('input-type').value = 'json';
    document.getElementById('output-type').value = 'json';
    
    processData();
    
    expect(document.getElementById('formatted-output').innerHTML).toContain('123');
    expect(document.getElementById('error-box').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('status-label').textContent).toContain('JSON');
  });

  test('displays notice box when tabs are auto-converted in YAML', () => {
    document.getElementById('raw-input').value = 'key:\n\tvalue: 123';
    document.getElementById('input-type').value = 'yaml';
    
    processData();
    
    expect(document.getElementById('notice-box').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('notice-box').innerHTML).toContain('Tabs');
  });

  test('displays error box on invalid input', () => {
    document.getElementById('raw-input').value = '{bad json}';
    document.getElementById('input-type').value = 'json';
    
    processData();
    
    expect(document.getElementById('error-box').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('formatted-output').innerHTML).toBe('');
  });
});
