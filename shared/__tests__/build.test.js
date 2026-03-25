const path = require('path');

// We test the pure functions from build.js without mocking fs
const { formatSiteName, generateNavBar, processHtml } = require('../build');

describe('Build Script - Pure Functions', () => {
  test('formatSiteName converts hyphenated names', () => {
    expect(formatSiteName('picker-wheel')).toBe('Picker Wheel');
    expect(formatSiteName('baby-face-generator')).toBe('Baby Face Generator');
    expect(formatSiteName('noise')).toBe('Noise');
  });

  test('generateNavBar produces valid HTML', () => {
    const nav = generateNavBar('picker-wheel');
    expect(nav).toContain('Picker Wheel');
    expect(nav).toContain('← All Tools');
    expect(nav).toContain('site-nav');
  });

  test('processHtml injects preconnect hints', () => {
    const html = '<html><head><title>Test</title></head><body><div>Content</div></body></html>';
    const result = processHtml(html, 'test-site');
    expect(result).toContain('preconnect');
    expect(result).toContain('fonts.googleapis.com');
  });

  test('processHtml injects nav bar after body', () => {
    const html = '<html><head></head><body><div>Hello</div></body></html>';
    const result = processHtml(html, 'my-app');
    expect(result).toContain('site-nav');
    expect(result).toContain('My App');
  });

  test('processHtml skips preconnect if already present', () => {
    const html = '<html><head><link rel="preconnect" href="https://fonts.googleapis.com"></head><body></body></html>';
    const result = processHtml(html, 'test');
    // Should not inject additional preconnect block since one exists
    const count = (result.match(/fonts\.googleapis\.com/g) || []).length;
    expect(count).toBe(1);
  });

  test('processHtml replaces AdSense placeholder when env is set', () => {
    const origEnv = process.env.ADSENSE_PUB_ID;
    process.env.ADSENSE_PUB_ID = 'ca-pub-1234567890';
    const html = '<html><head></head><body><ins data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"></ins></body></html>';
    const result = processHtml(html, 'test');
    expect(result).toContain('ca-pub-1234567890');
    process.env.ADSENSE_PUB_ID = origEnv || '';
  });

  test('processHtml injects contact email in footer when env is set', () => {
    const origEnv = process.env.CONTACT_EMAIL;
    process.env.CONTACT_EMAIL = 'test@example.com';
    const html = '<html><head></head><body><footer><p>Footer</p></footer></body></html>';
    const result = processHtml(html, 'test');
    expect(result).toContain('test@example.com');
    expect(result).toContain('mailto:');
    process.env.CONTACT_EMAIL = origEnv || '';
  });

  test('processHtml does not inject contact email when footer is absent', () => {
    const origEnv = process.env.CONTACT_EMAIL;
    process.env.CONTACT_EMAIL = 'test@example.com';
    const html = '<html><head></head><body><div>No footer here</div></body></html>';
    const result = processHtml(html, 'test');
    expect(result).not.toContain('mailto:');
    process.env.CONTACT_EMAIL = origEnv || '';
  });

  test('processHtml does not inject contact email when env is empty', () => {
    const origEnv = process.env.CONTACT_EMAIL;
    process.env.CONTACT_EMAIL = '';
    const html = '<html><head></head><body><footer><p>Footer</p></footer></body></html>';
    const result = processHtml(html, 'test');
    expect(result).not.toContain('mailto:');
    process.env.CONTACT_EMAIL = origEnv || '';
  });

  test('processHtml handles body with attributes', () => {
    const html = '<html><head></head><body class="dark" data-theme="dark"><div>Hello</div></body></html>';
    const result = processHtml(html, 'test');
    expect(result).toContain('site-nav');
    expect(result).toContain('data-theme="dark"');
  });

  test('formatSiteName handles empty string', () => {
    expect(formatSiteName('')).toBe('');
  });

  test('generateNavBar for complex name', () => {
    const nav = generateNavBar('resume-ats-checker');
    expect(nav).toContain('Resume Ats Checker');
  });
});

// Filesystem tests that exercise copyFileSync, copyDir, getAllSites
const fs = require('fs');
const os = require('os');
const { copyFileSync: buildCopyFile, copyDir, getAllSites } = require('../build');

describe('Build Script - Filesystem Functions', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'build-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('copyFileSync creates parent dirs and copies', () => {
    const src = path.join(tmpDir, 'src.txt');
    fs.writeFileSync(src, 'hello');
    const dest = path.join(tmpDir, 'sub', 'deep', 'dest.txt');
    buildCopyFile(src, dest);
    expect(fs.readFileSync(dest, 'utf-8')).toBe('hello');
  });

  test('copyDir recursively copies directory structure', () => {
    const srcDir = path.join(tmpDir, 'srcdir');
    fs.mkdirSync(srcDir);
    fs.writeFileSync(path.join(srcDir, 'a.txt'), 'aaa');
    const nested = path.join(srcDir, 'sub');
    fs.mkdirSync(nested);
    fs.writeFileSync(path.join(nested, 'b.txt'), 'bbb');

    const destDir = path.join(tmpDir, 'destdir');
    copyDir(srcDir, destDir);

    expect(fs.readFileSync(path.join(destDir, 'a.txt'), 'utf-8')).toBe('aaa');
    expect(fs.readFileSync(path.join(destDir, 'sub', 'b.txt'), 'utf-8')).toBe('bbb');
  });

  test('getAllSites returns array of site directories', () => {
    const sites = getAllSites();
    expect(Array.isArray(sites)).toBe(true);
    expect(sites.length).toBeGreaterThan(0);
  });

  test('processHtml no AdSense replacement when env not set', () => {
    const origEnv = process.env.ADSENSE_PUB_ID;
    process.env.ADSENSE_PUB_ID = '';
    const html = '<html><head></head><body><ins data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"></ins></body></html>';
    const result = processHtml(html, 'test');
    expect(result).toContain('ca-pub-XXXXXXXXXXXXXXXX');
    process.env.ADSENSE_PUB_ID = origEnv || '';
  });
});
