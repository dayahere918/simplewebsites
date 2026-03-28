/**
 * Comprehensive tests for temp-mail
 */
const { init, generateNewEmail, fetchMessages, readMessage, closeMessage, renderMessages } = require('../app');

const DOM_HTML = `
    <input id="email-address" value="">
    <div id="status-text"></div>
    <div id="loading-spinner" class="hidden"></div>
    <div id="inbox-list"></div>
    <div id="message-view" class="hidden">
        <div id="msg-subject"></div>
        <div id="msg-from"></div>
        <div id="msg-body"></div>
    </div>
`;

let localStore = {};
const localStorageMock = {
    getItem: jest.fn(k => localStore[k] || null),
    setItem: jest.fn((k, v) => { localStore[k] = v; }),
    removeItem: jest.fn(k => { delete localStore[k]; }),
    clear: jest.fn(() => { localStore = {}; })
};

beforeEach(() => {
    document.body.innerHTML = DOM_HTML;
    global.fetch = jest.fn();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true });
    localStore = {};
});

describe('Temp Mail — Core Logic', () => {
    test('generateNewEmail fetches and sets email', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(['test@1secmail.com'])
        });
        await generateNewEmail();
        expect(document.getElementById('email-address').value).toBe('test@1secmail.com');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('stacky_temp_mail', 'test@1secmail.com');
    });

    test('init loads saved email', async () => {
        localStore['stacky_temp_mail'] = 'saved@1secmail.com';
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue([])
        });
        await init();
        expect(document.getElementById('email-address').value).toBe('saved@1secmail.com');
    });

    test('fetchMessages updates list', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue([
                { id: 123, from: 'sender', subject: 'hi', date: 'now' }
            ])
        });
        localStore['stacky_temp_mail'] = 'test@1secmail.com';
        await init();
        await fetchMessages();
        expect(document.getElementById('inbox-list').innerHTML).toContain('sender');
    });

    test('readMessage loads content', async () => {
        localStore['stacky_temp_mail'] = 'test@1secmail.com';
        await init();
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({
                subject: 'Sub', from: 'F', textBody: 'Hello'
            })
        });
        await readMessage(123);
        expect(document.getElementById('message-view').classList.contains('hidden')).toBe(false);
    });

    test('closeMessage hides modal', () => {
        document.getElementById('message-view').classList.remove('hidden');
        closeMessage();
        expect(document.getElementById('message-view').classList.contains('hidden')).toBe(true);
    });

    test('renderMessages handles empty inbox', () => {
        renderMessages([]);
        expect(document.getElementById('inbox-list').textContent).toContain('Empty Inbox');
    });
});
