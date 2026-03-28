/**
 * Comprehensive tests for code-explainer
 * Tests pure logic and DOM interactions with mocked fetch
 */
const {
    detectLanguage, buildSystemPrompt, escapeHTML, sanitize, markdownToHtml,
    saveApiKey, checkApiKey, clearApiKey, executeAI, copyResult, setApiKey
} = require('../app');

const DOM_HTML = `
    <div id="api-key-banner" class="hidden"></div>
    <input id="api-key-input" value="">
    <textarea id="code-input"></textarea>
    <select id="action-select">
        <option value="explain">Explain</option>
        <option value="python">Python</option>
    </select>
    <div id="result-view" class="hidden"></div>
    <div id="ai-loading" class="hidden"></div>
    <div id="ai-result" class="hidden"></div>
    <span id="result-title"></span>
    <span id="detected-lang"></span>
    <button id="do-action-btn"></button>
    <button id="copy-result-btn">Copy</button>
`;

const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (k) => store[k] !== undefined ? store[k] : null,
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear: () => { store = {}; }
    };
})();

beforeEach(() => {
    document.body.innerHTML = DOM_HTML;
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true });
    localStorageMock.clear();
    global.fetch = jest.fn();
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: jest.fn().mockResolvedValue(undefined) },
        configurable: true
    });
    setApiKey('');
});

describe('Code Explainer — detectLanguage', () => {
    test('detects JavaScript', () => {
        expect(detectLanguage('const x = 5; console.log(x);')).toBe('JavaScript');
    });

    test('detects Python', () => {
        expect(detectLanguage('def hello():\n    pass')).toBe('Python');
    });

    test('detects Java', () => {
        expect(detectLanguage('public class Main { System.out.println("hi"); }')).toBe('Java');
    });

    test('detects TypeScript', () => {
        // interface keyword is unique to TypeScript
        expect(detectLanguage('interface User { name: string; age: number; }')).toBe('TypeScript');
    });

    test('detects Go', () => {
        expect(detectLanguage('func main() { fmt.Println("hi") }')).toBe('Go');
    });

    test('detects Rust', () => {
        expect(detectLanguage('fn main() { println!("hi") }')).toBe('Rust');
    });

    test('detects SQL', () => {
        expect(detectLanguage('SELECT * FROM users WHERE id = 1')).toBe('SQL');
    });

    test('detects HTML', () => {
        expect(detectLanguage('<div class="hello"></div>')).toBe('HTML');
    });

    test('returns Unknown for unrecognized code', () => {
        expect(detectLanguage('xyzzy frobble blarg')).toBe('Unknown');
    });
});

describe('Code Explainer — buildSystemPrompt', () => {
    test('builds explain prompt with language', () => {
        const p = buildSystemPrompt('explain', 'Python');
        expect(p).toContain('Python');
        expect(p).toContain('Explain');
    });

    test('builds conversion prompt', () => {
        const p = buildSystemPrompt('python', 'JavaScript');
        expect(p).toContain('PYTHON');
        expect(p).toContain('converted code');
    });
});

describe('Code Explainer — escapeHTML', () => {
    test('escapes special chars', () => {
        const result = escapeHTML('<script>&"\'</script>');
        expect(result).toContain('&lt;');
        expect(result).toContain('&amp;');
        expect(result).toContain('&quot;');
    });

    test('returns empty string for null/undefined', () => {
        expect(escapeHTML(null)).toBe('');
        expect(escapeHTML(undefined)).toBe('');
    });
});

describe('Code Explainer — sanitize', () => {
    test('removes script tags', () => {
        const result = sanitize('<script>alert(1)</script>safe text');
        expect(result).not.toContain('<script>');
        expect(result).toContain('safe text');
    });

    test('leaves regular HTML intact', () => {
        expect(sanitize('<p>Hello</p>')).toContain('<p>');
    });
});

describe('Code Explainer — markdownToHtml', () => {
    test('converts code blocks', () => {
        const html = markdownToHtml('```\nconsole.log(1)\n```');
        expect(html).toContain('<pre>');
        expect(html).toContain('<code>');
    });

    test('converts bold text', () => {
        expect(markdownToHtml('**bold**')).toContain('<strong>');
    });

    test('converts headings', () => {
        expect(markdownToHtml('## Title')).toContain('<h2>');
        expect(markdownToHtml('# Main')).toContain('<h1>');
    });

    test('converts inline code', () => {
        expect(markdownToHtml('use `x` here')).toContain('<code>');
    });
});

describe('Code Explainer — localStorage functions', () => {
    test('checkApiKey hides banner when key in localStorage', () => {
        localStorageMock.setItem('stacky_groq_key', 'gsk_test');
        document.getElementById('api-key-banner').classList.remove('hidden');
        checkApiKey();
        expect(document.getElementById('api-key-banner').classList.contains('hidden')).toBe(true);
    });

    test('checkApiKey shows banner when no key', () => {
        localStorageMock.clear();
        document.getElementById('api-key-banner').classList.add('hidden');
        checkApiKey();
        expect(document.getElementById('api-key-banner').classList.contains('hidden')).toBe(false);
    });

    test('saveApiKey stores valid key', () => {
        document.getElementById('api-key-input').value = 'gsk_mykey';
        saveApiKey();
        expect(localStorageMock.getItem('stacky_groq_key')).toBe('gsk_mykey');
    });

    test('saveApiKey skips empty input', () => {
        document.getElementById('api-key-input').value = '   ';
        saveApiKey();
        expect(localStorageMock.getItem('stacky_groq_key')).toBeNull();
    });

    test('clearApiKey removes key from storage', () => {
        localStorageMock.setItem('stacky_groq_key', 'gsk_test');
        clearApiKey();
        expect(localStorageMock.getItem('stacky_groq_key')).toBeNull();
    });
});

describe('Code Explainer — executeAI', () => {
    test('shows alert without API key', async () => {
        global.alert = jest.fn();
        setApiKey('');
        document.getElementById('code-input').value = 'const x = 5;';
        await executeAI();
        expect(global.alert).toHaveBeenCalled();
    });

    test('returns early without code', async () => {
        setApiKey('gsk_test');
        document.getElementById('code-input').value = '';
        await executeAI();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test('success path shows result', async () => {
        setApiKey('gsk_test');
        document.getElementById('code-input').value = 'const x = 5;';
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({
                choices: [{ message: { content: '## Explanation\nThis is x = 5.' } }]
            })
        });
        await executeAI();
        expect(document.getElementById('ai-result').classList.contains('hidden')).toBe(false);
    });

    test('handles 401 error and clears key', async () => {
        setApiKey('bad_key');
        document.getElementById('code-input').value = 'code';
        global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401, statusText: 'Unauthorized' });
        await executeAI();
        expect(document.getElementById('ai-result').innerHTML).toContain('Invalid API Key');
    });

    test('handles generic API error', async () => {
        setApiKey('gsk_test');
        document.getElementById('code-input').value = 'code';
        global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'Internal Error' });
        await executeAI();
        expect(document.getElementById('ai-result').innerHTML).toContain('Error');
    });

    test('handles network failure', async () => {
        setApiKey('gsk_test');
        document.getElementById('code-input').value = 'code';
        global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'));
        await executeAI();
        expect(document.getElementById('ai-result').innerHTML).toContain('Network Error');
    });
});

describe('Code Explainer — copyResult', () => {
    test('copies result to clipboard', async () => {
        const result = document.getElementById('ai-result');
        result.textContent = 'explanation text';
        copyResult();
        // allow any internal microtasks to settle
        await new Promise(r => setTimeout(r, 0));
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('explanation text');
    });

    test('does nothing if result is empty', () => {
        document.getElementById('ai-result').textContent = '';
        copyResult();
        expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    });
});
