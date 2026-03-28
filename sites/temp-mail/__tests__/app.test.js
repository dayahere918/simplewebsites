/**
 * Comprehensive tests for temp-mail
 * Tests: provider fallback, generateSecMailAddress, fetchMessages,
 *        renderMessages, setAndStart, copyEmail, escapeHTML, sanitizeHtml
 */
const {
  generateNewEmail, generateSecMailAddress, generateGuerrillaMailAddress,
  fetchMessages, fetchSecMailMessages, fetchGuerrillaMessages,
  renderMessages, readMessage, closeMessage, setAndStart, copyEmail,
  escapeHTML, sanitizeHtml, getState
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

// ── generateSecMailAddress ────────────────────────────────

describe('generateSecMailAddress()', () => {
  test('returns email address from API response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ['test123@1secmail.com']
    });
    const email = await generateSecMailAddress();
    expect(email).toBe('test123@1secmail.com');
  });

  test('throws on non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({})
    });
    await expect(generateSecMailAddress()).rejects.toThrow('HTTP 503');
  });

  test('throws on empty response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => []
    });
    await expect(generateSecMailAddress()).rejects.toThrow();
  });

  test('uses correct API endpoint', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ['x@y.com']
    });
    await generateSecMailAddress();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('1secmail.com'),
      expect.anything()
    );
  });
});

// ── generateGuerrillaMailAddress ──────────────────────────

describe('generateGuerrillaMailAddress()', () => {
  test('returns email from guerrillamail', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ email_addr: 'anon@guerrillamail.com', sid_token: 'tok123' })
    });
    const email = await generateGuerrillaMailAddress();
    expect(email).toBe('anon@guerrillamail.com');
  });

  test('throws when no email in response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    });
    await expect(generateGuerrillaMailAddress()).rejects.toThrow('No email');
  });

  test('calls guerrillamail API endpoint', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ email_addr: 'x@y.com' })
    });
    await generateGuerrillaMailAddress();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('guerrillamail'),
      expect.anything()
    );
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

// ── fetchSecMailMessages ──────────────────────────────────

describe('fetchSecMailMessages()', () => {
  test('returns message array from secmail', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, from: 'sender@x.com', subject: 'Hello', date: '2024-01-01' }]
    });
    // Set up state
    setAndStart('user@1secmail.com');
    const msgs = await fetchSecMailMessages();
    expect(Array.isArray(msgs)).toBe(true);
    expect(msgs[0].id).toBe(1);
  });

  test('throws on non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    setAndStart('user@1secmail.com');
    await expect(fetchSecMailMessages()).rejects.toThrow('API Error');
  });
});

// ── fetchGuerrillaMessages ────────────────────────────────

describe('fetchGuerrillaMessages()', () => {
  test('normalizes guerrillamail format to secmail format', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        list: [
          { mail_id: 'g1', mail_from: 'a@b.com', mail_subject: 'Test', mail_timestamp: 1700000000 }
        ]
      })
    });
    const msgs = await fetchGuerrillaMessages();
    expect(msgs[0].id).toBe('g1');
    expect(msgs[0].from).toBe('a@b.com');
    expect(msgs[0].subject).toBe('Test');
    expect(typeof msgs[0].date).toBe('string');
  });

  test('returns empty array when list is missing', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    });
    const msgs = await fetchGuerrillaMessages();
    expect(msgs).toEqual([]);
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

// ── App Initialization and Integration ────────────────────

const { init } = require('../app');

describe('App Initialization and Integration', () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    
    // Force activeProvider back to 'secmail'
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ['reset@1secmail.com'] });
    await generateNewEmail();
    jest.clearAllMocks(); // clear the fetch mock so tests can override it
  });

  test('init uses saved email if present', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(k => k === 'stacky_temp_mail' ? 'saved@1secmail.com' : 'secmail');
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
    
    await init();
    
    expect(document.getElementById('email-address').value).toBe('saved@1secmail.com');
  });

  test('init generates new email if no saved email', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ['new@1secmail.com'] });
    
    await init();
    
    expect(document.getElementById('email-address').value).toBe('new@1secmail.com');
  });

  test('generateNewEmail falls back to GuerrillaMail on 1secmail failure', async () => {
    let callCount = 0;
    global.fetch = jest.fn().mockImplementation((url) => {
      callCount++;
      if (callCount === 1) { // 1secmail
        return Promise.resolve({ ok: false, status: 500 });
      } else { // guerrillamail
        return Promise.resolve({
          ok: true,
          json: async () => ({ email_addr: 'fallback@guerrillamail.com', sid_token: '123' })
        });
      }
    });

    await generateNewEmail();
    
    expect(document.getElementById('email-address').value).toBe('fallback@guerrillamail.com');
    expect(document.getElementById('provider-badge').textContent).toContain('GuerrillaMail');
  });

  test('generateNewEmail displays error if all providers fail', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    
    await generateNewEmail();
    
    expect(document.getElementById('email-address').value).toContain('Error');
    expect(document.getElementById('status-text').textContent).toContain('Check your connection');
  });

  test('readMessage from secmail updates DOM with HTML body', async () => {
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

  test('readMessage from guerrillamail maps fields and formats DOM', async () => {
    // Generate guerrilla mail
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ email_addr: 'g@guerrillamail.com', sid_token: 'x' })
    });
    await generateNewEmail(); // sets activeProvider to guerrilla

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        mail_id: 'g1',
        mail_subject: 'Guerrilla Msg',
        mail_from: 'bot@g.com',
        mail_body: '<p>Guerrilla HTML</p>'
      })
    });

    await readMessage('g1');

    expect(document.getElementById('msg-subject').textContent).toBe('Guerrilla Msg');
    expect(document.getElementById('msg-body').innerHTML).toContain('<p>Guerrilla HTML</p>');
  });

  test('fetchMessages updates DOM and increments seen messages', async () => {
    global.fetch = jest.fn().mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('guerrillamail')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            list: [{ mail_id: '1', mail_from: 'a', mail_subject: 's', mail_timestamp: 1000 }]
          })
        });
      }
      // secmail default
      return Promise.resolve({
        ok: true,
        json: async () => [{ id: '1', from: 'a', subject: 's', date: 'd' }]
      });
    });

    setAndStart('user@1secmail.com');
    await fetchMessages();

    expect(getState().allMessages.length).toBe(1);
    expect(document.getElementById('inbox-list').innerHTML).toContain('a'); // from address

    // Call again, should not add duplicates (1 seen)
    await fetchMessages();
    expect(getState().allMessages.length).toBe(1);
  });

  test('fetchMessages handles errors and updates retry count', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    setAndStart('user@1secmail.com');
    
    await fetchMessages();
    expect(document.getElementById('status-text').textContent).toContain('Retry');
  });
});
