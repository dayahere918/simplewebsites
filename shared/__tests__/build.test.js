const fs = require('fs');
const path = require('path');
const { formatSiteName, generateNavBar, processHtml } = require('../build.js');

describe('Build Pipeline', () => {
    test('formatSiteName converts dashes to Title Case', () => {
        expect(formatSiteName('fancy-test-site')).toBe('Fancy Test Site');
        expect(formatSiteName('tool')).toBe('Tool');
    });

    test('generateNavBar includes site name and theme toggle', () => {
        const nav = generateNavBar('test-app');
        expect(nav).toContain('Test App');
        expect(nav).toContain('localStorage.setItem');
    });

    test('processHtml injects JSON-LD, PWA manifest, and Open Graph tags', () => {
        const rawHtml = `<!DOCTYPE html><html><head><title>Test</title></head><body><p>Hello</p></body></html>`;
        
        const processed = processHtml(rawHtml, 'test-app');
        
        // PWA Manifest
        expect(processed).toContain('<link rel="manifest" href="manifest.json">');
        // Service Worker
        expect(processed).toContain('serviceWorker.register');
        // Open Graph
        expect(processed).toContain('<meta property="og:image"');
        expect(processed).toContain('test-app/og-image.jpg');
        // Schema.org
        expect(processed).toContain('application/ld+json');
        expect(processed).toContain('Test App');
        expect(processed).toContain('WebApplication');
    });

    test('processHtml does not duplicate injected tags if already present', () => {
        const rawHtml = `<!DOCTYPE html><html><head>
        <link rel="manifest" href="manifest.json">
        <meta property="og:image" content="custom">
        <script type="application/ld+json">{}</script>
        </head><body><script>serviceWorker.register</script></body></html>`;
        
        const processed = processHtml(rawHtml, 'test-app');
        
        // Should not inject the defaults since they exist
        expect(processed.match(/manifest\.json/g).length).toBe(1);
        expect(processed.match(/application\/ld\+json/g).length).toBe(1);
        expect(processed).not.toContain('test-app/og-image.jpg'); // Did not overwrite custom
    });
});
