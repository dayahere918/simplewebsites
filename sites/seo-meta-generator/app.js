/**
 * SEO Meta Generator Core Logic
 */

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[tag])
    );
}

function updateCounters(id, max) {
    const el = document.getElementById('m-' + id);
    const countEl = document.getElementById(id + '-count');
    if (!el || !countEl) return;
    
    const len = el.value.length;
    countEl.textContent = `${len}/${max}`;
    countEl.className = len > max ? 'text-red-500 text-xs float-right' : 'text-muted text-xs float-right';
}

function generateTags() {
    updateCounters('title', 60);
    updateCounters('desc', 155);

    const title = document.getElementById('m-title').value.trim() || 'Your Page Title';
    const desc = document.getElementById('m-desc').value.trim() || 'Your page description goes here.';
    const url = document.getElementById('m-url').value.trim() || 'https://example.com';
    const img = document.getElementById('m-img').value.trim();
    const key = document.getElementById('m-key').value.trim();
    const author = document.getElementById('m-author').value.trim();

    const cleanUrl = url.replace(/^https?:\/\//, '').split('/')[0];

    // Update Preview
    document.getElementById('prev-title').textContent = title;
    document.getElementById('prev-desc').textContent = desc;
    document.getElementById('prev-url').textContent = cleanUrl;
    
    const prevImg = document.getElementById('prev-img');
    if (img) {
        prevImg.src = img;
        prevImg.classList.remove('hidden');
        prevImg.previousElementSibling.classList.add('hidden');
    } else {
        prevImg.classList.add('hidden');
        prevImg.previousElementSibling.classList.remove('hidden');
    }

    // Generate Code
    let tags = `<!-- Primary Meta Tags -->
<title>${escapeHTML(title)}</title>
<meta name="title" content="${escapeHTML(title)}">
<meta name="description" content="${escapeHTML(desc)}">`;

    if (key) tags += `\n<meta name="keywords" content="${escapeHTML(key)}">`;
    if (author) tags += `\n<meta name="author" content="${escapeHTML(author)}">`;

    tags += `

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${escapeHTML(url)}">
<meta property="og:title" content="${escapeHTML(title)}">
<meta property="og:description" content="${escapeHTML(desc)}">`;
    if (img) tags += `\n<meta property="og:image" content="${escapeHTML(img)}">`;

    tags += `

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${escapeHTML(url)}">
<meta property="twitter:title" content="${escapeHTML(title)}">
<meta property="twitter:description" content="${escapeHTML(desc)}">`;
    if (img) tags += `\n<meta property="twitter:image" content="${escapeHTML(img)}">`;

    const codeEl = document.getElementById('code-output');
    codeEl.textContent = tags;
    
    if (window.Prism) Prism.highlightElement(codeEl);
}

function copyCSS() {
    const text = document.getElementById('code-output').textContent;
    if (!text) return;
    navigator.clipboard.writeText(text);
    const btn = event.target;
    btn.textContent = '✅ Copied!';
    setTimeout(() => { btn.textContent = '📋 Copy All'; }, 2000);
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', generateTags);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateTags, copyCSS };
}
