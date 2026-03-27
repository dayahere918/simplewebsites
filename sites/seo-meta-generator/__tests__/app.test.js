const { generateTags } = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <input id="m-title" value="Test Title" />
        <span id="title-count"></span>
        <textarea id="m-desc">Test Desc</textarea>
        <span id="desc-count"></span>
        <input id="m-url" value="https://test.com" />
        <input id="m-img" value="" />
        <input id="m-key" value="" />
        <input id="m-author" value="" />
        <h3 id="prev-title"></h3>
        <p id="prev-desc"></p>
        <p id="prev-url"></p>
        <img id="prev-img" />
        <span></span>
        <code id="code-output"></code>
    `;
});

describe('SEO Meta Generator', () => {
    test('generateTags dynamically creates meta tags and updates preview', () => {
        generateTags();
        const code = document.getElementById('code-output').textContent;
        expect(code).toContain('<title>Test Title</title>');
        expect(code).toContain('content="Test Desc"');
        expect(code).toContain('og:url" content="https://test.com"');
        
        expect(document.getElementById('prev-title').textContent).toBe('Test Title');
    });
});
