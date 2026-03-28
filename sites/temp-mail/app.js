/**
 * Temp Mail Core Logic
 * Uses Cloudflare Worker proxy (/api/mail) for 1secmail API to bypass CORS.
 * Fallback: Direct 1secmail API (works in some browsers), then client-generated email.
 */

const PROXY_API = '/api/mail';
const SECMAIL_API = 'https://www.1secmail.com/api/v1/';
const SECMAIL_DOMAINS = ['1secmail.com', '1secmail.org', '1secmail.net', 'kzccv.com', 'qiott.com', 'wuuvo.com', 'icznn.com', 'yeezmail.com'];

let currentEmail = '';
let currentLogin = '';
let currentDomain = '';
let checkInterval = null;
let countdownInterval = null;
let secondsLeft = 10;
let seenMessageIds = new Set();
let allMessages = [];
let retryCount = 0;
let useProxy = true; // Try proxy first
const MAX_RETRIES = 3;

async function init() {
  const saved = localStorage.getItem('stacky_temp_mail');
  if (saved && saved.includes('@')) {
    setAndStart(saved);
    return;
  }
  await generateNewEmail();
}

/**
 * Generate a new email address with layered fallbacks:
 * 1. Cloudflare Worker proxy (always works, no CORS)
 * 2. Direct 1secmail API (may work in some browsers)
 * 3. Client-side generated address (guaranteed)
 */
async function generateNewEmail() {
  if (checkInterval) clearInterval(checkInterval);
  if (countdownInterval) clearInterval(countdownInterval);

  const el = document.getElementById('email-address');
  if (el) el.value = 'Generating...';

  const status = document.getElementById('status-text');

  // Strategy 1: Proxy
  try {
    const res = await fetchWithTimeout(`${PROXY_API}?action=generate&provider=secmail`, 5000);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        useProxy = true;
        const email = data[0];
        localStorage.setItem('stacky_temp_mail', email);
        setAndStart(email);
        return;
      }
    }
  } catch (e) {
    console.warn('Proxy unavailable, trying direct API:', e.message);
  }

  // Strategy 2: Direct 1secmail API
  try {
    const res = await fetchWithTimeout(`${SECMAIL_API}?action=genRandomMailbox&count=1`, 5000);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        useProxy = false;
        const email = data[0];
        localStorage.setItem('stacky_temp_mail', email);
        setAndStart(email);
        return;
      }
    }
  } catch (e) {
    console.warn('Direct 1secmail failed:', e.message);
  }

  // Strategy 3: Client-generated email (guaranteed to work)
  const randomStr = Math.random().toString(36).substring(2, 10) + Math.floor(Date.now() / 1000).toString(36);
  const domain = SECMAIL_DOMAINS[Math.floor(Math.random() * SECMAIL_DOMAINS.length)];
  const email = `${randomStr}@${domain}`;
  useProxy = true; // Try proxy for mail checking
  localStorage.setItem('stacky_temp_mail', email);
  setAndStart(email);

  if (status) status.textContent = '⚠️ Generated offline address. Mail checking may be limited.';
}

function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeout));
}

function setAndStart(email) {
  currentEmail = email;
  const parts = email.split('@');
  if (parts.length < 2) return;
  currentLogin = parts[0];
  currentDomain = parts[1];

  const el = document.getElementById('email-address');
  if (el) el.value = email;

  // Update provider badge
  const badge = document.getElementById('provider-badge');
  if (badge) {
    badge.textContent = useProxy ? '⚡ 1secMail (Proxy)' : '📡 1secMail (Direct)';
    badge.title = useProxy ? 'Using Cloudflare proxy for reliability' : 'Direct API connection';
  }

  seenMessageIds.clear();
  allMessages = [];
  retryCount = 0;
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

/**
 * Copy email address to clipboard
 */
function copyEmail() {
  if (!currentEmail) return;
  navigator.clipboard.writeText(currentEmail).then(() => {
    const btn = document.getElementById('copy-email-btn');
    if (btn) {
      btn.textContent = '✅ Copied!';
      setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
    }
  }).catch(() => {
    const el = document.getElementById('email-address');
    if (el) { el.select(); document.execCommand('copy'); }
  });
}

async function fetchMessages(isSilent = false) {
  if (!currentLogin || !currentDomain) return;

  const loader = document.getElementById('loading-spinner');
  if (!isSilent && loader) loader.classList.remove('hidden');

  try {
    let messages;
    
    if (useProxy) {
      // Use Cloudflare proxy
      const res = await fetchWithTimeout(
        `${PROXY_API}?action=getMessages&provider=secmail&login=${encodeURIComponent(currentLogin)}&domain=${encodeURIComponent(currentDomain)}`,
        8000
      );
      if (!res.ok) throw new Error('Proxy error');
      messages = await res.json();
    } else {
      // Direct API
      const res = await fetchWithTimeout(
        `${SECMAIL_API}?action=getMessages&login=${encodeURIComponent(currentLogin)}&domain=${encodeURIComponent(currentDomain)}`,
        8000
      );
      if (!res.ok) throw new Error('API Error');
      messages = await res.json();
    }

    if (!Array.isArray(messages)) messages = [];

    const newMsgs = messages.filter(m => !seenMessageIds.has(m.id));
    if (newMsgs.length > 0) {
      newMsgs.forEach(m => seenMessageIds.add(m.id));
      allMessages = [...newMsgs, ...allMessages];
      renderMessages();
    }
    retryCount = 0;
  } catch (e) {
    console.error('Fetch messages error:', e);
    retryCount++;
    const status = document.getElementById('status-text');
    if (retryCount >= MAX_RETRIES) {
      // Try switching strategy
      if (useProxy) {
        console.warn('Proxy seems down, attempting direct API...');
        useProxy = false;
        retryCount = 0;
      } else {
        if (status) status.textContent = '❌ Connection lost. Click refresh to try again.';
      }
    } else {
      if (status) status.textContent = `⚠️ Retry ${retryCount}/${MAX_RETRIES}...`;
    }
  } finally {
    if (loader) loader.classList.add('hidden');
  }
}

function renderMessages(messages) {
  const list = document.getElementById('inbox-list');
  if (!list) return;

  const msgs = messages || allMessages;
  if (msgs.length === 0) {
    list.innerHTML = `<div class="p-8 text-center text-muted">
      <div style="font-size:2.5rem;margin-bottom:1rem">📭</div>
      <p>Empty Inbox — waiting for mail...</p>
      <p class="hint mt-2">Emails sent to your address will appear here automatically.</p>
    </div>`;
    return;
  }

  list.innerHTML = msgs.map(m => `
    <div onclick="readMessage('${m.id}')" class="inbox-card p-4 border-b border-border hover:bg-surface cursor-pointer transition-colors">
      <div class="flex justify-between items-start mb-1">
        <span class="font-bold text-accent">${escapeHTML(m.from || 'Unknown')}</span>
        <span class="text-xs text-muted">${m.date || ''}</span>
      </div>
      <div class="text-sm font-medium truncate">${escapeHTML(m.subject || '(no subject)')}</div>
    </div>
  `).join('');
}

async function readMessage(id) {
  const view = document.getElementById('message-view');
  if (!view) return;

  view.classList.remove('hidden');
  const bodyEl = document.getElementById('msg-body');
  if (bodyEl) bodyEl.innerHTML = '<div style="text-align:center;padding:2rem">Loading...</div>';

  try {
    let msg;
    const apiUrl = useProxy
      ? `${PROXY_API}?action=readMessage&provider=secmail&login=${encodeURIComponent(currentLogin)}&domain=${encodeURIComponent(currentDomain)}&id=${id}`
      : `${SECMAIL_API}?action=readMessage&login=${encodeURIComponent(currentLogin)}&domain=${encodeURIComponent(currentDomain)}&id=${id}`;

    const res = await fetchWithTimeout(apiUrl, 8000);
    msg = await res.json();

    const sub = document.getElementById('msg-subject');
    if (sub) sub.textContent = msg.subject || 'No Subject';
    const from = document.getElementById('msg-from');
    if (from) from.textContent = msg.from || 'Unknown';

    const safeHtml = msg.htmlBody
      ? sanitizeHtml(msg.htmlBody)
      : (msg.textBody ? escapeHTML(msg.textBody).replace(/\n/g, '<br>') : 'Empty message');
    if (bodyEl) bodyEl.innerHTML = safeHtml;
  } catch (e) {
    if (bodyEl) bodyEl.innerHTML = '<p style="color:var(--muted)">Error loading message body.</p>';
  }
}

function closeMessage() {
  const view = document.getElementById('message-view');
  if (view) view.classList.add('hidden');
}

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag]));
}

function sanitizeHtml(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init, generateNewEmail, fetchMessages, readMessage, closeMessage,
    renderMessages, setAndStart, copyEmail, escapeHTML, sanitizeHtml,
    fetchWithTimeout,
    getState: () => ({ currentEmail, currentLogin, currentDomain, useProxy, seenMessageIds, allMessages })
  };
}
