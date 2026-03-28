/**
 * Comprehensive tests for temp-mail
 * Tests: provider fallback, fetchMessages, renderMessages,
 *        setAndStart, copyEmail, escapeHTML, sanitizeHtml
 */
const {
  generateNewEmail, fetchMessages, renderMessages, readMessage, closeMessage,
  setAndStart, copyEmail, escapeHTML, sanitizeHtml, getState, fetchWithTimeout,
  init
} = require('../app');

const DOM_HTML = `
  <input id="email-address" type="text" />
  <button id="copy-email-btn">📋 Copy</button>
  <span id="provider-badge"></span>
  <div id="inbox-list"></div>
  <div id="loading-spinner" class="hidden"></div>
  <span id="status-text"></span>
  <div id="message-view" class="hidden"></div>
  <div id="msg-body"></div>
  <h3 id="msg-subject"></h3>
  <span id="msg-from"></span>
`;

beforeEach(() => {
  document.body.innerHTML = DOM_HTML;
  global.localStorage = {
    getItem: jest.fn().mockReturnValue(null),
    setItem: jest.fn(),
    removeItem: jest.fn()
  };
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
  global.navigator.clipboard = { writeText: jest.fn().mockResolvedValue(undefined) };
  global.setInterval = jest.fn().mockReturnValue(12345);
  global.clearInterval = jest.fn();
});

// ── escapeHTML ────────────────────────────────────────────

describe('escapeHTML()', () => {
  test('escapes < and >', () => {
    expect(escapeHTML('<b>bold</b>')).toBe('&lt;b&gt;bold&lt;/b&gt;');
  });

  test('escapes &', () => {
    expect(escapeHTML('a & b')).toBe('a &amp; b');
  });

  test('escapes double quotes', () => {
    expect(escapeHTML('"hello"')).toBe('&quot;hello&quot;');
  });

  test('returns empty string for non-string', () => {
    expect(escapeHTML(null)).toBe('');
    expect(escapeHTML(undefined)).toBe('');
  });
});

// ── sanitizeHtml ──────────────────────────────────────────

describe('sanitizeHtml()', () => {
  test('removes script tags', () => {
    const result = sanitizeHtml('<p>Hello</p><script>alert(1)</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('<p>Hello</p>');
  });

  test('removes iframe tags', () => {
    const result = sanitizeHtml('<p>Test</p><iframe src="evil.com"></iframe>');
    expect(result).not.toContain('<iframe');
    expect(result).toContain('<p>Test</p>');
  });

  test('preserves safe HTML', () => {
    const result = sanitizeHtml('<p class="msg"><strong>Hello</strong></p>');
    expect(result).toContain('<p class="msg"><strong>Hello</strong></p>');
  });
});

// ── setAndStart ───────────────────────────────────────────

describe('setAndStart()', () => {
  test('sets email address display', () => {
    setAndStart('hello@1secmail.com');
    expect(document.getElementById('email-address').value).toBe('hello@1secmail.com');
  });

  test('splits email into login and domain', () => {
    setAndStart('myuser@mailtemp.com');
    const state = getState();
    expect(state.currentEmail).toBe('myuser@mailtemp.com');
  });

  test('clears all seen message IDs', () => {
    setAndStart('fresh@test.com');
    const state = getState();
    expect(state.seenMessageIds.size).toBe(0);
  });

  test('ignores invalid email without @', () => {
    expect(() => setAndStart('invalidemail')).not.toThrow();
  });
});

// ── renderMessages ────────────────────────────────────────

describe('renderMessages()', () => {
  test('shows empty state when no messages', () => {
    renderMessages([]);
    const list = document.getElementById('inbox-list');
    expect(list.innerHTML).toContain('waiting for mail');
  });

  test('renders message cards for messages', () => {
    renderMessages([
      { id: 1, from: 'sender@test.com', subject: 'Hello World', date: '2024-01-01' }
    ]);
    const list = document.getElementById('inbox-list');
    expect(list.innerHTML).toContain('sender@test.com');
    expect(list.innerHTML).toContain('Hello World');
  });

  test('escapes HTML in from/subject', () => {
    renderMessages([
      { id: 2, from: '<script>xss</script>', subject: 'test', date: '' }
    ]);
    expect(document.getElementById('inbox-list').innerHTML).not.toContain('<script>xss');
  });

  test('uses allMessages if no argument', () => {
    // Call without argument — should not throw
    expect(() => renderMessages()).not.toThrow();
  });
});

// ── closeMessage ──────────────────────────────────────────

describe('closeMessage()', () => {
  test('hides message view', () => {
    document.getElementById('message-view').classList.remove('hidden');
    closeMessage();
    expect(document.getElementById('message-view').classList.contains('hidden')).toBe(true);
  });
});

// ── copyEmail ─────────────────────────────────────────────

describe('copyEmail()', () => {
  test('copies current email to clipboard', async () => {
    setAndStart('mymail@test.com');
    copyEmail();
    await new Promise(r => setTimeout(r, 10));
    expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith('mymail@test.com');
  });
});

// ── generateNewEmail ─────────────────────────────────────

describe('generateNewEmail()', () => {
  test('uses proxy endpoint first', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ['proxy@1secmail.com']
    });
    await generateNewEmail();
    expect(document.getElementById('email-address').value).toBe('proxy@1secmail.com');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/mail'),
      expect.anything()
    );
  });

  test('falls back to direct API when proxy fails', async () => {
    let callCount = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // Proxy fails
        return Promise.reject(new Error('Proxy unavailable'));
      }
      // Direct API succeeds
      return Promise.resolve({
        ok: true,
        json: async () => ['direct@1secmail.com']
      });
    });
    await generateNewEmail();
    expect(document.getElementById('email-address').value).toBe('direct@1secmail.com');
    expect(document.getElementById('provider-badge').textContent).toContain('1secMail');
  });

  test('generates client-side email when all APIs fail', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    await generateNewEmail();
    const email = document.getElementById('email-address').value;
    expect(email).toContain('@');
    // Should be a valid-looking email
    expect(email.split('@').length).toBe(2);
  });
});

// ── fetchMessages ────────────────────────────────────────

describe('fetchMessages()', () => {
  test('fetches messages and populates allMessages', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: '1', from: 'a@b.com', subject: 'Test', date: '2024-01-01' }]
    });

    setAndStart('user@1secmail.com');
    await fetchMessages();

    expect(getState().allMessages.length).toBe(1);
    expect(document.getElementById('inbox-list').innerHTML).toContain('a@b.com');
  });

  test('does not add duplicate messages', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: '1', from: 'a@b.com', subject: 'Test', date: '2024-01-01' }]
    });

    setAndStart('user@1secmail.com');
    await fetchMessages();
    await fetchMessages();
    expect(getState().allMessages.length).toBe(1);
  });

  test('handles errors and increments retry count', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    setAndStart('user@1secmail.com');
    await fetchMessages();
    expect(document.getElementById('status-text').textContent).toContain('Retry');
  });
});

// ── readMessage ──────────────────────────────────────────

describe('readMessage()', () => {
  test('displays message content in DOM', async () => {
    setAndStart('user@1secmail.com');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '123',
        subject: 'Welcome',
        from: 'admin@test.com',
        htmlBody: '<b>Hello</b>'
      })
    });

    await readMessage('123');

    expect(document.getElementById('message-view').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('msg-subject').textContent).toBe('Welcome');
    expect(document.getElementById('msg-from').textContent).toBe('admin@test.com');
    expect(document.getElementById('msg-body').innerHTML).toContain('<b>Hello</b>');
  });

  test('uses textBody if htmlBody is missing', async () => {
    setAndStart('user@1secmail.com');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        subject: 'Text Only',
        from: 'sender@x.com',
        textBody: 'Plain text content'
      })
    });

    await readMessage('456');
    expect(document.getElementById('msg-body').innerHTML).toContain('Plain text content');
  });
});

// ── init ─────────────────────────────────────────────────

describe('init()', () => {
  test('uses saved email if present', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(
      k => k === 'stacky_temp_mail' ? 'saved@1secmail.com' : null
    );
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
    await init();
    expect(document.getElementById('email-address').value).toBe('saved@1secmail.com');
  });

  test('generates new email if no saved email', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ['new@1secmail.com']
    });
    await init();
    expect(document.getElementById('email-address').value).toBe('new@1secmail.com');
  });
});
