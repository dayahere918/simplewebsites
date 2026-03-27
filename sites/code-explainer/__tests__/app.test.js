const { checkApiKey, executeAI, saveApiKey, copyResult } = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <div id="api-key-banner"></div>
        <input id="api-key-input" value="123" />
        <textarea id="code-input">console.log('test')</textarea>
        <select id="action-select"><option value="explain">explain</option></select>
        <div id="ai-result" class="hidden"></div>
        <div id="ai-loading" class="hidden"></div>
        <div id="result-view" class="hidden"></div>
        <h3 id="result-title"></h3>
        <button id="do-action-btn"></button>
    `;
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'test explanation' } }] })
    });
    // mock DOMPurify
    global.DOMPurify = jest.fn(m => m);
    global.navigator.clipboard = { writeText: jest.fn() };
    global.event = { target: { textContent: '' } };
});

describe('Code Explainer', () => {
    test('checkApiKey hides banner if key exists', () => {
        localStorage.setItem('stacky_groq_key', '123');
        checkApiKey();
        expect(document.getElementById('api-key-banner').classList.contains('hidden')).toBe(true);
    });

    test('saveApiKey saves key', () => {
        saveApiKey();
        expect(localStorage.getItem('stacky_groq_key')).toBe('123');
    });

    test('executeAI fetches from Groq API', async () => {
        localStorage.setItem('stacky_groq_key', '123');
        checkApiKey();
        await executeAI();
        expect(global.fetch).toHaveBeenCalled();
        expect(document.getElementById('ai-result').innerHTML).toContain('test explanation');
    });

    test('copyResult copies to clipboard', () => {
        document.getElementById('ai-result').innerText = 'test';
        copyResult();
        expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith('test');
    });
});
