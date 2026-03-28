/**
 * Temp Mail Core Logic
 * Primary: 1secmail API | Fallback: guerrillamail API
 * Recommended approach: Show email prominently with copy button,
 * try 1secmail first (free, disposable), guerrillamail as fallback.
 * Both provide working inbox APIs — users can read mail directly in-app.
 */

const SECMAIL_API = 'https://www.1secmail.com/api/v1/';
const GUERRILLA_API = 'https://api.guerrillamail.com/ajax.php';

let currentEmail = '';
let currentLogin = '';
let currentDomain = '';
let activeProvider = 'secmail'; // 'secmail' | 'guerrilla'
let guerrillaSidToken = '';
let checkInterval = null;
let countdownInterval = null;
let secondsLeft = 10;
let seenMessageIds = new Set();
let allMessages = [];
let retryCount = 0;
const MAX_RETRIES = 3;

async function init() {
  const saved = localStorage.getItem('stacky_temp_mail');
  const provider = localStorage.getItem('stacky_temp_mail_provider') || 'secmail';
  activeProvider = provider;
  if (saved) {
    setAndStart(saved);
    return;
  }
  await generateNewEmail();
}

/**
 * Generate a new email address with automatic provider fallback
 * Tries 1secmail first, falls back to guerrillamail on error
 */
async function generateNewEmail() {
  if (checkInterval) clearInterval(checkInterval);
  if (countdownInterval) clearInterval(countdownInterval);

  const el = document.getElementById('email-address');
  if (el) el.value = 'Generating...';

  // Try 1secmail first
  try {
    const email = await generateSecMailAddress();
    activeProvider = 'secmail';
    localStorage.setItem('stacky_temp_mail_provider', 'secmail');
    localStorage.setItem('stacky_temp_mail', email);
    setAndStart(email);
    return;
  } catch (e) {
    console.warn('1secmail failed, switching to guerrillamail:', e.message);
  }

  // Fallback to guerrillamail
  try {
    const email = await generateGuerrillaMailAddress();
    activeProvider = 'guerrilla';
    localStorage.setItem('stacky_temp_mail_provider', 'guerrilla');
    localStorage.setItem('stacky_temp_mail', email);
    setAndStart(email);
  } catch (e) {
    console.error('All mail providers failed:', e);
    if (el) el.value = 'Error — Please refresh to try again';
    const status = document.getElementById('status-text');
    if (status) status.textContent = '❌ Unable to generate email. Check your connection.';
  }
}

/**
 * Generate address via 1secmail API
 */
async function generateSecMailAddress() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${SECMAIL_API}?action=genRandomMailbox&count=1`, {
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || !data[0]) throw new Error('Invalid response');
    return data[0];
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Generate address via guerrillamail API
 */
async function generateGuerrillaMailAddress() {
  const res = await fetch(`${GUERRILLA_API}?f=get_email_address`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.email_addr) throw new Error('No email returned from guerrillamail');
  guerrillaSidToken = data.sid_token || '';
  return data.email_addr;
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
    badge.textContent = activeProvider === 'guerrilla' ? '📡 GuerrillaMail' : '⚡ 1secMail';
    badge.title = activeProvider === 'guerrilla'
      ? 'Using GuerrillaMail (1secmail unavailable)'
      : 'Using 1secMail';
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
    // Fallback for environments without clipboard API
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
    if (activeProvider === 'guerrilla') {
      messages = await fetchGuerrillaMessages();
    } else {
      messages = await fetchSecMailMessages();
    }

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
      if (status) status.textContent = '❌ Connection lost. Click refresh to try again.';
    } else {
      if (status) status.textContent = `⚠️ Retry ${retryCount}/${MAX_RETRIES}...`;
    }
  } finally {
    if (loader) loader.classList.add('hidden');
  }
}

async function fetchSecMailMessages() {
  const res = await fetch(`${SECMAIL_API}?action=getMessages&login=${currentLogin}&domain=${currentDomain}`);
  if (!res.ok) throw new Error('API Error');
  return res.json();
}

async function fetchGuerrillaMessages() {
  const url = `${GUERRILLA_API}?f=check_email&seq=0${guerrillaSidToken ? `&sid_token=${encodeURIComponent(guerrillaSidToken)}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Guerrilla API error');
  const data = await res.json();
  if (!data.list) return [];
  // Normalize guerrillamail format to match secmail format
  return data.list.map(m => ({
    id: m.mail_id,
    from: m.mail_from,
    subject: m.mail_subject,
    date: new Date(m.mail_timestamp * 1000).toLocaleString()
  }));
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
    if (activeProvider === 'guerrilla') {
      const res = await fetch(`${GUERRILLA_API}?f=fetch_email&email_id=${id}${guerrillaSidToken ? `&sid_token=${encodeURIComponent(guerrillaSidToken)}` : ''}`);
      msg = await res.json();
      msg.htmlBody = msg.mail_body;
      msg.subject = msg.mail_subject;
      msg.from = msg.mail_from;
    } else {
      const res = await fetch(`${SECMAIL_API}?action=readMessage&login=${currentLogin}&domain=${currentDomain}&id=${id}`);
      msg = await res.json();
    }

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
  // Remove script/iframe tags only, preserve formatting
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init, generateNewEmail, generateSecMailAddress, generateGuerrillaMailAddress,
    fetchMessages, fetchSecMailMessages, fetchGuerrillaMessages,
    readMessage, closeMessage, renderMessages, setAndStart, copyEmail, escapeHTML, sanitizeHtml,
    getState: () => ({ currentEmail, currentLogin, currentDomain, activeProvider, seenMessageIds, allMessages })
  };
}
