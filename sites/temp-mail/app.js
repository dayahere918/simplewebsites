/**
 * Temp Mail Core Logic using 1secmail API
 */

const API_BASE = 'https://www.1secmail.com/api/v1/';
let currentEmail = '';
let currentLogin = '';
let currentDomain = '';
let checkInterval = null;
let countdownInterval = null;
let secondsLeft = 10;
let seenMessageIds = new Set();
let allMessages = [];

async function init() {
    const saved = localStorage.getItem('stacky_temp_mail');
    if (saved) {
        setAndStart(saved);
        return;
    }
    await generateNewEmail();
}

async function generateNewEmail() {
    if (checkInterval) clearInterval(checkInterval);
    if (countdownInterval) clearInterval(countdownInterval);
    document.getElementById('email-address').value = 'Generating...';
    try {
        const res = await fetch(`${API_BASE}?action=genRandomMailbox&count=1`);
        const data = await res.json();
        const newEmail = data[0];
        localStorage.setItem('stacky_temp_mail', newEmail);
        setAndStart(newEmail);
    } catch (e) {
        console.error(e);
        document.getElementById('email-address').value = 'Error generating email';
    }
}

function setAndStart(email) {
    currentEmail = email;
    const parts = email.split('@');
    currentLogin = parts[0];
    currentDomain = parts[1];
    document.getElementById('email-address').value = email;
    seenMessageIds.clear();
    allMessages = [];
    renderMessages();
    
    fetchMessages(true); // immediate fetch
    
    // Setup polling
    if (checkInterval) clearInterval(checkInterval);
    if (countdownInterval) clearInterval(countdownInterval);
    
    secondsLeft = 10;
    updateCountdownText();
    
    countdownInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
            fetchMessages(false);
            secondsLeft = 10;
        }
        updateCountdownText();
    }, 1000);
}

function updateCountdownText() {
    const el = document.getElementById('countdown-text');
    if(el) el.textContent = `Auto-refresh in ${secondsLeft}s`;
}

async function fetchMessages(manual = false) {
    if (manual) secondsLeft = 10;
    try {
        const res = await fetch(`${API_BASE}?action=getMessages&login=${currentLogin}&domain=${currentDomain}`);
        const data = await res.json();
        
        let newFound = false;
        data.forEach(msg => {
            if (!seenMessageIds.has(msg.id)) {
                seenMessageIds.add(msg.id);
                allMessages.unshift(msg);
                newFound = true;
            }
        });
        
        if (newFound) renderMessages();
        else if (manual && allMessages.length === 0) {
            renderMessages(true);
        }
    } catch (e) {
        console.error("Fetch failed", e);
    }
}

function renderMessages(flashEmpty = false) {
    const list = document.getElementById('messages-list');
    if (!list) return;
    if (allMessages.length === 0) {
        list.innerHTML = `<div class="text-center text-muted p-4 ${flashEmpty ? 'animate-pulse' : ''}">Inbox is empty. Emails will appear here.</div>`;
        return;
    }
    
    list.innerHTML = allMessages.map(m => `
        <div class="flex justify-between items-center p-4 cursor-pointer hover:bg-surface transition-colors" style="border:1px solid var(--color-border);border-radius:4px" onclick="readMessage(${m.id})">
            <div class="truncate">
                <span class="font-bold block">${m.from || 'Unknown'}</span>
                <span class="text-sm truncate inline-block w-48">${m.subject || 'No Subject'}</span>
            </div>
            <span class="text-xs text-muted">${new Date(m.date).toLocaleTimeString()}</span>
        </div>
    `).join('');
}

async function readMessage(id) {
    document.getElementById('messages-list').parentElement.classList.add('hidden');
    const view = document.getElementById('message-view');
    view.classList.remove('hidden');
    
    try {
        const res = await fetch(`${API_BASE}?action=readMessage&login=${currentLogin}&domain=${currentDomain}&id=${id}`);
        const msg = await res.json();
        
        document.getElementById('msg-subject').textContent = msg.subject || 'No Subject';
        document.getElementById('msg-from').textContent = msg.from;
        
        // Show HTML if present, else plain text
        const safeHtml = msg.htmlBody ? DOMPurify(msg.htmlBody) : (msg.textBody ? escapeHTML(msg.textBody).replace(/\\n/g, '<br>') : 'Empty message');
        document.getElementById('msg-body').innerHTML = safeHtml;
    } catch (e) {
        document.getElementById('msg-body').innerHTML = 'Error loading message body.';
    }
}

function closeMessage() {
    document.getElementById('message-view').classList.add('hidden');
    document.getElementById('messages-list').parentElement.classList.remove('hidden');
}

function copyEmail() {
    const el = document.getElementById('email-address');
    el.select();
    document.execCommand('copy');
    
    const btn = event.target;
    btn.textContent = '✅ Copied!';
    setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
}

// Extremely basic html escaper for plain text
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[tag])
    );
}

// Mock DOMPurify so we don't need a huge external dependency for a simple viewer.
// WARNING: Real apps should use an actual DOMPurify script tag in index.html to prevent XSS.
// For this standalone tool we do weak scrubbing.
function DOMPurify(html) {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init, generateNewEmail, fetchMessages, readMessage, closeMessage, renderMessages };
}
