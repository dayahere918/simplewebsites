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
    const el = document.getElementById('email-address');
    if (el) el.value = 'Generating...';
    try {
        const res = await fetch(`${API_BASE}?action=genRandomMailbox&count=1`);
        const data = await res.json();
        const newEmail = data[0];
        localStorage.setItem('stacky_temp_mail', newEmail);
        setAndStart(newEmail);
    } catch (e) {
        console.error(e);
        const el = document.getElementById('email-address');
        if (el) el.value = 'Error generating email';
    }
}

function setAndStart(email) {
    currentEmail = email;
    const parts = email.split('@');
    if (parts.length < 2) return;
    currentLogin = parts[0];
    currentDomain = parts[1];
    
    const el = document.getElementById('email-address');
    if (el) el.value = email;
    
    seenMessageIds.clear();
    allMessages = [];
    renderMessages();
    
    fetchMessages(true);
    
    if (checkInterval) clearInterval(checkInterval);
    if (countdownInterval) clearInterval(countdownInterval);
    
    secondsLeft = 10;
    updateCountdownText();
    
    countdownInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
            secondsLeft = 10;
            fetchMessages();
        }
        updateCountdownText();
    }, 1000);
}

function updateCountdownText() {
    const status = document.getElementById('status-text');
    if (status) status.textContent = `Auto-refresh in ${secondsLeft}s...`;
}

async function fetchMessages(isSilent = false) {
    if (!currentLogin || !currentDomain) return;
    
    const loader = document.getElementById('loading-spinner');
    if (!isSilent && loader) loader.classList.remove('hidden');
    
    try {
        const res = await fetch(`${API_BASE}?action=getMessages&login=${currentLogin}&domain=${currentDomain}`);
        if (!res.ok) throw new Error('API Error');
        const messages = await res.json();
        
        const newMsgs = messages.filter(m => !seenMessageIds.has(m.id));
        if (newMsgs.length > 0) {
            newMsgs.forEach(m => seenMessageIds.add(m.id));
            allMessages = [...newMsgs, ...allMessages];
            renderMessages();
        }
    } catch (e) {
        console.error(e);
        const status = document.getElementById('status-text');
        if (status) status.textContent = '❌ Offline - Check connection';
    } finally {
        if (loader) loader.classList.add('hidden');
    }
}

function renderMessages(messages) {
    const list = document.getElementById('inbox-list');
    if (!list) return;
    
    const msgs = messages || allMessages;
    if (msgs.length === 0) {
        list.innerHTML = `<div class="p-8 text-center text-muted">Empty Inbox - Waiting for mail...</div>`;
        return;
    }
    
    list.innerHTML = msgs.map(m => `
        <div onclick="readMessage(${m.id})" class="inbox-card p-4 border-b border-border hover:bg-surface cursor-pointer transition-colors">
            <div class="flex justify-between items-start mb-1">
                <span class="font-bold text-accent">${escapeHTML(m.from)}</span>
                <span class="text-xs text-muted">${m.date}</span>
            </div>
            <div class="text-sm font-medium truncate">${escapeHTML(m.subject)}</div>
        </div>
    `).join('');
}

async function readMessage(id) {
    const view = document.getElementById('message-view');
    if (!view) return;
    
    view.classList.remove('hidden');
    const bodyEl = document.getElementById('msg-body');
    if (bodyEl) bodyEl.innerHTML = 'Loading...';
    
    try {
        const res = await fetch(`${API_BASE}?action=readMessage&login=${currentLogin}&domain=${currentDomain}&id=${id}`);
        const msg = await res.json();
        
        const sub = document.getElementById('msg-subject');
        if (sub) sub.textContent = msg.subject || 'No Subject';
        const from = document.getElementById('msg-from');
        if (from) from.textContent = msg.from;
        
        const safeHtml = msg.htmlBody ? DOMPurify(msg.htmlBody) : (msg.textBody ? escapeHTML(msg.textBody).replace(/\n/g, '<br>') : 'Empty message');
        if (bodyEl) bodyEl.innerHTML = safeHtml;
    } catch (e) {
        if (bodyEl) bodyEl.innerHTML = 'Error loading message body.';
    }
}

function closeMessage() {
    const view = document.getElementById('message-view');
    if (view) view.classList.add('hidden');
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[tag]));
}

function DOMPurify(html) {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init, generateNewEmail, fetchMessages, readMessage, closeMessage, renderMessages };
}
