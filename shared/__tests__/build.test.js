const fs = require('fs');
const path = require('path');
const { formatSiteName, generateNavBar, processHtml } = require('../build.js');

describe('Build Script', () => {
  describe('formatSiteName', () => {
    it('formats hyphenated names correctly', () => {
      expect(formatSiteName('picker-wheel')).toBe('Picker Wheel');
      expect(formatSiteName('voice-to-text-counter')).toBe('Voice To Text Counter');
    });
  });

  describe('generateNavBar', () => {
    it('creates navigation bar with formatted site name', () => {
      const nav = generateNavBar('test-site');
      expect(nav).toContain('<nav class="site-nav"');
      expect(nav).toContain('← All Tools');
      expect(nav).toContain('<span class="nav-title">Test Site</span>');
    });
  });

  describe('processHtml', () => {
    const defaultHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Test</title>
</head>
<body>
    <div id="app"></div>
</body>
</html>`;

    afterEach(() => {
      delete process.env.ADSENSE_PUB_ID;
      delete process.env.CONTACT_EMAIL;
    });

    it('injects preconnect hints and nav bar', () => {
      const result = processHtml(defaultHtml, 'test-site');
      expect(result).toContain('rel="preconnect" href="https://fonts.googleapis.com"');
      expect(result).toContain('<nav class="site-nav"');
      expect(result).toContain('Test Site');
    });

    it('injects contact email into footer if provided', () => {
      process.env.CONTACT_EMAIL = 'test@example.com';
      const htmlWithFooter = defaultHtml.replace('</body>', '<footer></footer></body>');
      
      const result = processHtml(htmlWithFooter, 'app');
      expect(result).toContain('mailto:test@example.com');
      expect(result).toContain('📧 Contact Us');
    });

    it('replaces placeholder AdSense IDs if configured', () => {
      process.env.ADSENSE_PUB_ID = 'ca-pub-12345';
      const htmlWithAds = defaultHtml.replace('</body>', '<ins data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"></ins></body>');
      
      const result = processHtml(htmlWithAds, 'app');
      expect(result).toContain('ca-pub-12345');
      expect(result).not.toContain('ca-pub-XXXXXXXXXXXXXXXX');
    });
    
    it('does not duplicate preconnect hints', () => {
      const htmlWithPreconnect = defaultHtml.replace('<head>', '<head>\n<link rel="preconnect" href="existing">');
      const result = processHtml(htmlWithPreconnect, 'test-site');
      
      // Should not inject standard preconnect if 'preconnect' is already in HTML
      expect(result).not.toContain('fonts.googleapis.com');
    });
  });
});
