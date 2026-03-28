/**
 * Comprehensive tests for code-explainer
 * Tests detectLanguage, buildSystemPrompt, markdownToHtml, executeWithFallback, GROQ_MODELS
 */
const {
  detectLanguage, buildSystemPrompt, escapeHTML, sanitize, markdownToHtml,
  checkApiKey, saveApiKey, clearApiKey, copyResult, executeWithFallback,
  GROQ_MODELS, setApiKey, tryGroqModel
} = require('../app');

const DOM_HTML = `
  <div id="api-key-banner" class="hidden"></div>
  <input id="api-key-input" type="text" value="gsk_test_key_123" />
  <textarea id="code-input"></textarea>
  <select id="action-select"><option value="explain">Explain Code</option><option value="python">Python</option></select>
  <div id="result-view" class="hidden"></div>
  <div id="ai-loading" class="hidden"></div>
  <div id="ai-result" class="hidden"></div>
  <div id="result-title"></div>
  <div id="detected-lang"></div>
  <button id="do-action-btn"></button>
  <button id="copy-result-btn">📋 Copy</button>
  <div id="ai-status-msg"></div>
`;

beforeEach(() => {
  document.body.innerHTML = DOM_HTML;
  setApiKey('gsk_test_key_123');
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
  };
  global.fetch = jest.fn();
});

// ── GROQ_MODELS ──────────────────────────────────────────

describe('GROQ_MODELS constant', () => {
  test('is non-empty array', () => {
    expect(Array.isArray(GROQ_MODELS)).toBe(true);
    expect(GROQ_MODELS.length).toBeGreaterThanOrEqual(2);
  });

  test('does NOT contain deprecated llama3-8b-8192', () => {
    expect(GROQ_MODELS).not.toContain('llama3-8b-8192');
  });

  test('contains llama3-70b-8192 as primary model', () => {
    expect(GROQ_MODELS[0]).toBe('llama3-70b-8192');
  });

  test('contains at least one fallback model', () => {
    expect(GROQ_MODELS.length).toBeGreaterThanOrEqual(2);
  });
});

// ── detectLanguage ───────────────────────────────────────

describe('detectLanguage()', () => {
  test('detects JavaScript', () => {
    expect(detectLanguage('const x = require("path");')).toBe('JavaScript');
  });

  test('detects JavaScript with arrow function', () => {
    expect(detectLanguage('const fn = () => console.log("hello");')).toBe('JavaScript');
  });

  test('detects TypeScript by type annotation', () => {
    expect(detectLanguage('const x: string = "hello"; interface Foo {}')).toBe('TypeScript');
  });

  test('detects Python by def keyword', () => {
    expect(detectLanguage('def hello():\n  print("hi")')).toBe('Python');
  });

  test('detects Python by import', () => {
    expect(detectLanguage('import os\nfrom pathlib import Path')).toBe('Python');
  });

  test('detects Java by System.out.println', () => {
    expect(detectLanguage('public class Main { System.out.println("hi"); }')).toBe('Java');
  });

  test('detects Go by func keyword', () => {
    expect(detectLanguage('func main() { fmt.Println("hi") }')).toBe('Go');
  });

  test('detects Rust by fn keyword', () => {
    expect(detectLanguage('fn main() { println!("hi"); }')).toBe('Rust');
  });

  test('detects SQL by SELECT keyword', () => {
    expect(detectLanguage('SELECT * FROM users WHERE id = 1')).toBe('SQL');
  });

  test('detects HTML', () => {
    expect(detectLanguage('<html><body><div>test</div></body></html>')).toBe('HTML');
  });

  test('detects Shell by echo keyword', () => {
    expect(detectLanguage('echo "hello" && sudo apt install')).toBe('Shell');
  });

  test('returns Unknown for unrecognized code', () => {
    expect(detectLanguage('xyz abc 123 @@@')).toBe('Unknown');
  });
});

// ── buildSystemPrompt ─────────────────────────────────────

describe('buildSystemPrompt()', () => {
  test('returns explain prompt with language for explain action', () => {
    const prompt = buildSystemPrompt('explain', 'JavaScript');
    expect(prompt).toContain('JavaScript');
    expect(prompt).toContain('Explain');
    expect(prompt).toContain('markdown');
  });

  test('returns convert prompt for non-explain action', () => {
    const prompt = buildSystemPrompt('python', 'JavaScript');
    expect(prompt).toContain('PYTHON');
    expect(prompt).toContain('triple backticks');
  });

  test('works without detectedLang', () => {
    const prompt = buildSystemPrompt('explain');
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(20);
  });

  test('explain prompt mentions complexity', () => {
    const prompt = buildSystemPrompt('explain', 'Python');
    expect(prompt).toContain('complexity');
  });
});

// ── escapeHTML ───────────────────────────────────────────

describe('escapeHTML()', () => {
  test('escapes all HTML special chars', () => {
    const r = escapeHTML('<script>alert("xss")</script>');
    expect(r).not.toContain('<script>');
    expect(r).toContain('&lt;script&gt;');
  });

  test('returns empty string for non-string input', () => {
    expect(escapeHTML(null)).toBe('');
    expect(escapeHTML(undefined)).toBe('');
  });

  test('escapes single quotes', () => {
    expect(escapeHTML("it's")).toContain('&#39;');
  });
});

// ── sanitize ─────────────────────────────────────────────

describe('sanitize()', () => {
  test('removes script tags', () => {
    const result = sanitize('<p>Hello</p><script>alert(1)</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('<p>Hello</p>');
  });

  test('preserves non-script HTML', () => {
    const result = sanitize('<p class="test">Hello</p>');
    expect(result).toContain('<p class="test">Hello</p>');
  });
});

// ── markdownToHtml ───────────────────────────────────────

describe('markdownToHtml()', () => {
  test('converts code blocks', () => {
    const html = markdownToHtml('```\nconst x = 1;\n```');
    expect(html).toContain('<pre><code>');
    expect(html).toContain('</code></pre>');
  });

  test('converts inline code', () => {
    const html = markdownToHtml('use `console.log` for output');
    expect(html).toContain('<code>console.log</code>');
  });

  test('converts bold', () => {
    const html = markdownToHtml('**important**');
    expect(html).toContain('<strong>important</strong>');
  });

  test('converts h2 headers', () => {
    const html = markdownToHtml('## Overview');
    expect(html).toContain('<h2>Overview</h2>');
  });

  test('converts h3 headers', () => {
    const html = markdownToHtml('### Detail');
    expect(html).toContain('<h3>Detail</h3>');
  });

  test('sanitizes script tags in output', () => {
    const html = markdownToHtml('<script>bad()</script>');
    expect(html).not.toContain('<script>');
  });
});

// ── executeWithFallback ───────────────────────────────────

describe('executeWithFallback()', () => {
  test('uses first model on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Explanation here' } }] })
    });

    const { result, model } = await executeWithFallback('System prompt', 'const x = 1;');
    expect(result).toBe('Explanation here');
    expect(model).toBe(GROQ_MODELS[0]);
  });

  test('falls back to second model on 400 error', async () => {
    let callCount = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: async () => ({ error: { message: 'Model deprecated' } }),
          statusText: 'Bad Request'
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Fallback result' } }] })
      });
    });

    const { result, model } = await executeWithFallback('System prompt', 'code');
    expect(result).toBe('Fallback result');
    expect(model).toBe(GROQ_MODELS[1]);
  });

  test('throws immediately on 401 auth error without trying fallback', async () => {
    let callCount = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Invalid API Key' } }),
        statusText: 'Unauthorized'
      });
    });

    await expect(executeWithFallback('prompt', 'code')).rejects.toThrow();
    expect(callCount).toBe(1); // only tried once
  });

  test('tries all models before throwing', async () => {
    let callCount = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: false,
        status: 503,
        json: async () => ({ error: { message: 'Service unavailable' } }),
        statusText: 'Service Unavailable'
      });
    });

    await expect(executeWithFallback('prompt', 'code')).rejects.toThrow();
    expect(callCount).toBe(GROQ_MODELS.length);
  });
});

// ── API Key management ────────────────────────────────────

describe('API Key management', () => {
  beforeEach(() => {
    // Use real jsdom localStorage
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  test('checkApiKey hides banner when key exists', () => {
    window.localStorage.setItem('stacky_groq_key', 'gsk_test_123');
    checkApiKey();
    expect(document.getElementById('api-key-banner').classList.contains('hidden')).toBe(true);
  });

  test('checkApiKey shows banner when no key', () => {
    window.localStorage.removeItem('stacky_groq_key');
    checkApiKey();
    expect(document.getElementById('api-key-banner').classList.contains('hidden')).toBe(false);
  });

  test('saveApiKey stores key and hides banner', () => {
    saveApiKey();
    expect(window.localStorage.getItem('stacky_groq_key')).toBe('gsk_test_key_123');
  });

  test('clearApiKey removes key', () => {
    window.localStorage.setItem('stacky_groq_key', 'test');
    clearApiKey();
    expect(window.localStorage.getItem('stacky_groq_key')).toBeNull();
  });
});
