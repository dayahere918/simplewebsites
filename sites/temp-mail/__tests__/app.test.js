const { init, generateNewEmail, fetchMessages, readMessage, closeMessage, renderMessages } = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <input id="email-address" />
        <div id="email-display"></div>
        <div id="inbox-list"></div>
        <div id="message-view" class="hidden">
            <span id="msg-from"></span>
            <span id="msg-subject"></span>
            <span id="msg-date"></span>
            <div id="msg-body"></div>
        </div>
        <span id="status-text"></span>
        <div id="loading-spinner" class="hidden"></div>
    `;
    global.fetch = jest.fn((url) => {
        if (url.includes('genRandomMailbox')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(['test@1secmail.com']) });
        }
        if (url.includes('getMessages')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 1, from: 'f', subject: 's', date: 'd' }]) });
        }
        if (url.includes('readMessage')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ body: 'Hi', textBody: 'Hi' }) });
        }
        return Promise.resolve({ ok: false });
    });
    localStorage.clear();
    global.alert = jest.fn();
});

describe('Temp Mail Corrected', () => {
    test('init handles empty storage and API failure', async () => {
        fetch.mockResolvedValueOnce({ ok: false });
        await init();
        expect(document.getElementById('email-address').value).toContain('Error');
    });

    test('fetchMessages handles API error', async () => {
        localStorage.setItem('stacky_temp_mail', 't@1.com');
        await init();
        fetch.mockResolvedValueOnce({ ok: false });
        await fetchMessages();
        expect(document.getElementById('status-text').textContent).toContain('Offline');
    });

    test('readMessage handles body parsing', async () => {
       localStorage.setItem('stacky_temp_mail', 't@1.com');
       await init();
       await readMessage(1);
       expect(document.getElementById('msg-body').textContent).toBe('Hi');
       
       closeMessage();
       expect(document.getElementById('message-view').classList.contains('hidden')).toBe(true);
    });

    test('renderMessages handles empty inbox', () => {
        document.getElementById('inbox-list').innerHTML = '';
        renderMessages([]);
        expect(document.getElementById('inbox-list').innerHTML).toContain('Empty');
    });
});
