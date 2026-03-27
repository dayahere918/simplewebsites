const { init, generateNewEmail, fetchMessages } = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <input id="email-address" />
        <span id="countdown-text"></span>
        <div id="messages-list"></div>
        <div id="message-view"></div>
        <span id="msg-subject"></span>
        <span id="msg-from"></span>
        <div id="msg-body"></div>
    `;
    global.fetch = jest.fn((url) => {
        if (url.includes('genRandomMailbox')) {
            return Promise.resolve({ json: () => Promise.resolve(['test@1secmail.com']) });
        } else if (url.includes('getMessages')) {
            return Promise.resolve({ json: () => Promise.resolve([{ id: 1, from: 'a', subject: 'b', date: new Date().toISOString() }]) });
        } else {
            return Promise.resolve({ json: () => Promise.resolve({ id: 1, htmlBody: '<p>Hi</p>' }) });
        }
    });
    localStorage.clear();
});

describe('Temp Mail Generator', () => {
    test('init calls generateNewEmail if none stored', async () => {
        await init();
        expect(global.fetch).toHaveBeenCalled();
        expect(document.getElementById('email-address').value).toBe('test@1secmail.com');
    });

    test('generateNewEmail triggers reset and polling loop', async () => {
        await generateNewEmail();
        expect(document.getElementById('email-address').value).toBe('test@1secmail.com');
    });

    test('fetchMessages queries the inbox actively', async () => {
        localStorage.setItem('stacky_temp_mail', 'existing@1secmail.com');
        await init();
        await fetchMessages(true);
        expect(global.fetch).toHaveBeenCalledTimes(2); // One in init, one here
    });

    test('readMessage parses email body', async () => {
        const { readMessage, closeMessage, renderMessages } = require('../app');
        localStorage.setItem('stacky_temp_mail', 'existing@1secmail.com');
        await init();
        await readMessage(1);
        expect(document.getElementById('msg-body').innerHTML).toContain('Hi');
        
        closeMessage();
        expect(document.getElementById('message-view').classList.contains('hidden')).toBe(true);
        
        // ensure renderMessages doesn't throw
        renderMessages(true);
    });
});
