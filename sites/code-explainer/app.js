/**
 * Code Explainer Core Logic using Groq API (Client-side BYOK)
 */

let groqApiKey = '';

function checkApiKey() {
    const key = localStorage.getItem('stacky_groq_key');
    if (key) {
        groqApiKey = key;
        document.getElementById('api-key-banner').classList.add('hidden');
    } else {
        document.getElementById('api-key-banner').classList.remove('hidden');
    }
}

function saveApiKey() {
    const input = document.getElementById('api-key-input').value.trim();
    if (input) {
        localStorage.setItem('stacky_groq_key', input);
        groqApiKey = input;
        document.getElementById('api-key-banner').classList.add('hidden');
    }
}

async function executeAI() {
    if (!groqApiKey) {
        alert("Please set your API key first (Refresh page if you don't see the banner).");
        return;
    }
    
    const code = document.getElementById('code-input').value.trim();
    if (!code) return;
    
    const action = document.getElementById('action-select').value;
    
    document.getElementById('result-view').classList.remove('hidden');
    document.getElementById('ai-loading').classList.remove('hidden');
    document.getElementById('ai-result').classList.add('hidden');
    document.getElementById('result-title').textContent = action === 'explain' ? 'Explanation' : 'Conversion Result';
    document.getElementById('do-action-btn').disabled = true;

    let systemPrompt = "You are a senior technical developer. Be concise. Format your response clearly using markdown.";
    if (action === 'explain') {
        systemPrompt += " Explain what the provided code snippet does, its complexity, and any potential bugs. Speak directly to the developer.";
    } else {
        systemPrompt += ` Convert the provided code exactly into ${action.toUpperCase()}. Return ONLY the completely converted code block, no chat, no pleasantries, enclosed in triple backticks. Preserve logic perfectly.`;
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${groqApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-8b-8192", // Fast and free tier friendly
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Here is the code:\n\n\`\`\`\n${code}\n\`\`\`` }
                ],
                temperature: 0.1,
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('stacky_groq_key');
                groqApiKey = '';
                checkApiKey();
                throw new Error("Invalid API Key");
            }
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const output = data.choices[0].message.content;
        
        // Basic Markdown render for the result
        const formatted = DOMPurify(escapeHTML(output))
            .replace(/```([\s\S]*?)```/g, '<pre><code class="language-auto">$1</code></pre>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            
        document.getElementById('ai-result').innerHTML = formatted;
        document.getElementById('ai-loading').classList.add('hidden');
        document.getElementById('ai-result').classList.remove('hidden');
        
        // Retrigger Prism highlighing
        if (window.Prism) Prism.highlightAllUnder(document.getElementById('ai-result'));

    } catch (e) {
        console.error(e);
        document.getElementById('ai-loading').classList.add('hidden');
        document.getElementById('ai-result').classList.remove('hidden');
        document.getElementById('ai-result').innerHTML = `<p class="text-red-500">Error: ${e.message}</p>`;
    } finally {
        document.getElementById('do-action-btn').disabled = false;
    }
}

function copyResult() {
    const text = document.getElementById('ai-result').innerText;
    navigator.clipboard.writeText(text);
    event.target.textContent = '✅ Copied!';
    setTimeout(() => { event.target.textContent = '📋 Copy'; }, 2000);
}

// Minimal escaper
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[tag])
    );
}

function DOMPurify(html) {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', checkApiKey);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { saveApiKey, executeAI, copyResult, checkApiKey };
}
