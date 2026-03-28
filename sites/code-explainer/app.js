/**
 * Code Explainer Core Logic using Groq API (Client-side BYOK)
 * Enhanced: language auto-detection, better error messages, pure logic
 */

let groqApiKey = '';

// --- Pure Logic ---

/**
 * Detect programming language from code snippet
 * @param {string} code
 * @returns {string} detected language label
 */
function detectLanguage(code) {
    const patterns = [
        { lang: 'Python', test: /^(def |import |from |class |if __name__)/m },
        { lang: 'JavaScript', test: /(const |let |var |function |=>|console\.log)/m },
        { lang: 'TypeScript', test: /(: string|: number|: boolean|interface |type |<T>)/m },
        { lang: 'Java', test: /(public class|System\.out\.println|@Override|import java\.)/m },
        { lang: 'Go', test: /(func |package |import |:=|fmt\.Println)/m },
        { lang: 'Rust', test: /(fn |let mut |use std::|impl |println!)/m },
        { lang: 'SQL', test: /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\b/i },
        { lang: 'HTML', test: /(<html|<div|<span|<body|<!DOCTYPE)/i },
        { lang: 'CSS', test: /(\{[\s\S]*?:[\s\S]*?\}|@media|\.[\w-]+\s*\{)/m },
        { lang: 'Shell', test: /(\$\(|echo |export |&& |sudo )/ },
    ];

    for (const { lang, test } of patterns) {
        if (test.test(code)) return lang;
    }
    return 'Unknown';
}

/**
 * Build system prompt based on action
 * @param {string} action - 'explain' | target language
 * @param {string} detectedLang - auto-detected language
 * @returns {string}
 */
function buildSystemPrompt(action, detectedLang = '') {
    const base = 'You are a senior software engineer. Be concise and clear. Use markdown formatting.';
    if (action === 'explain') {
        return `${base} The user will provide ${detectedLang || 'code'}. Explain: (1) what it does, (2) time/space complexity if relevant, (3) potential bugs or improvements. Format as markdown sections.`;
    }
    return `${base} Convert the following code into ${action.toUpperCase()}. Return ONLY the converted code enclosed in triple backticks. Preserve all logic exactly.`;
}

/**
 * Escape HTML for safe rendering
 */
function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#39;')
        .replace(/"/g, '&quot;');
}

/**
 * Remove script tags from HTML (basic XSS protection)
 */
function sanitize(html) {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/**
 * Convert basic markdown to HTML
 */
function markdownToHtml(text) {
    return sanitize(escapeHTML(text))
        .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^### (.*)/gm, '<h3>$1</h3>')
        .replace(/^## (.*)/gm, '<h2>$1</h2>')
        .replace(/^# (.*)/gm, '<h1>$1</h1>')
        .replace(/\n\n/g, '<br><br>');
}

// --- DOM Functions ---

function checkApiKey() {
    if (typeof localStorage === 'undefined') return;
    const key = localStorage.getItem('stacky_groq_key');
    const banner = document.getElementById('api-key-banner');
    if (key) {
        groqApiKey = key;
        if (banner) banner.classList.add('hidden');
    } else {
        if (banner) banner.classList.remove('hidden');
    }
}

function saveApiKey() {
    const input = document.getElementById('api-key-input');
    const value = input ? input.value.trim() : '';
    if (!value) return;
    localStorage.setItem('stacky_groq_key', value);
    groqApiKey = value;
    const banner = document.getElementById('api-key-banner');
    if (banner) banner.classList.add('hidden');
}

function clearApiKey() {
    localStorage.removeItem('stacky_groq_key');
    groqApiKey = '';
    checkApiKey();
}

async function executeAI() {
    if (!groqApiKey) {
        alert('Please save your Groq API key first.');
        return;
    }

    const codeEl = document.getElementById('code-input');
    const code = codeEl ? codeEl.value.trim() : '';
    if (!code) return;

    const actionEl = document.getElementById('action-select');
    const action = actionEl ? actionEl.value : 'explain';
    const detectedLang = detectLanguage(code);

    // Update detected language badge
    const langBadge = document.getElementById('detected-lang');
    if (langBadge) langBadge.textContent = detectedLang;

    const resultView = document.getElementById('result-view');
    const loading = document.getElementById('ai-loading');
    const result = document.getElementById('ai-result');
    const title = document.getElementById('result-title');
    const actionBtn = document.getElementById('do-action-btn');

    if (resultView) resultView.classList.remove('hidden');
    if (loading) loading.classList.remove('hidden');
    if (result) result.classList.add('hidden');
    if (title) title.textContent = action === 'explain' ? `Explaining ${detectedLang}` : `Converting to ${action.toUpperCase()}`;
    if (actionBtn) actionBtn.disabled = true;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: [
                    { role: 'system', content: buildSystemPrompt(action, detectedLang) },
                    { role: 'user', content: `\`\`\`\n${code}\n\`\`\`` }
                ],
                temperature: 0.1,
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                clearApiKey();
                throw new Error('Invalid API Key. Please update your Groq API key.');
            }
            throw new Error(`API Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const output = data.choices?.[0]?.message?.content || 'No response received.';

        if (result) {
            result.innerHTML = markdownToHtml(output);
            result.classList.remove('hidden');
        }
        if (loading) loading.classList.add('hidden');

        if (typeof window !== 'undefined' && window.Prism) {
            window.Prism.highlightAllUnder(result);
        }

    } catch (e) {
        console.error('AI Error:', e);
        if (loading) loading.classList.add('hidden');
        if (result) {
            result.innerHTML = `<p class="error-msg">❌ ${escapeHTML(e.message)}</p>`;
            result.classList.remove('hidden');
        }
    } finally {
        if (actionBtn) actionBtn.disabled = false;
    }
}

function copyResult() {
    const el = document.getElementById('ai-result');
    const text = el ? el.textContent : '';
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {});
    const btn = document.getElementById('copy-result-btn');
    if (btn) {
        btn.textContent = '✅ Copied!';
        setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
    }
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', checkApiKey);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { detectLanguage, buildSystemPrompt, escapeHTML, sanitize, markdownToHtml, saveApiKey, executeAI, copyResult, checkApiKey, clearApiKey, setApiKey: (k) => { groqApiKey = k; } };
}
