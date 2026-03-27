const { generateTags, copyCSS } = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <input id="m-title" value="My Site" />
        <textarea id="m-desc">My Description</textarea>
        <input id="m-url" value="https://mysite.com" />
        <input id="m-img" value="img.png" />
        <input id="m-key" value="seo, test" />
        <input id="m-author" value="Author" />
        <div id="m-title-count"></div>
        <div id="title-count"></div>
        <div id="m-desc-count"></div>
        <div id="desc-count"></div>
        <div id="prev-title"></div>
        <div id="prev-desc"></div>
        <div id="prev-url"></div>
        <div id="code-output"></div>
        <div class="prev-img-wrap"><div class="img-placeholder"></div><img id="prev-img" class="hidden" /></div>
    `;
    global.Prism = { highlightElement: jest.fn() };
    global.navigator.clipboard = { writeText: jest.fn() };
});

describe('SEO Meta Generator', () => {
    test('generateTags updates preview and code', () => {
        generateTags();
        expect(document.getElementById('prev-title').textContent).toBe('My Site');
        expect(document.getElementById('code-output').textContent).toContain('og:image');
    });

    test('generateTags handles empty optional fields', () => {
        document.getElementById('m-img').value = '';
        document.getElementById('m-key').value = '';
        generateTags();
        expect(document.getElementById('code-output').textContent).not.toContain('og:image');
    });

    test('copyCSS interaction', () => {
        document.getElementById('code-output').textContent = 'test';
        const btn = { textContent: '' };
        global.event = { target: btn };
        copyCSS();
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test');
    });
});
