const { generateFAQSchema, generateBreadcrumbSchema, generateJsonLd, generateSitemap, generateRobotsTxt } = require('../seo.js');

describe('SEO Module (Advanced)', () => {
  describe('generateJsonLd', () => {
    it('generates WebApplication schema by default', () => {
      const script = generateJsonLd({ title: 'Test', description: 'desc', url: 'https://test.com' });
      expect(script).toContain('@type":"WebApplication"');
      expect(script).toContain('"name":"Test"');
      expect(script).toContain('"description":"desc"');
    });

    it('throws error if title is missing', () => {
      expect(() => generateJsonLd({})).toThrow('SEO config must include at least a title');
    });
  });

  describe('generateFAQSchema', () => {
    it('returns empty string for invalid input', () => {
      expect(generateFAQSchema()).toBe('');
      expect(generateFAQSchema([])).toBe('');
    });

    it('generates FAQPage schema', () => {
      const script = generateFAQSchema([{ question: 'Q1', answer: 'A1' }]);
      expect(script).toContain('@type":"FAQPage"');
      expect(script).toContain('"name":"Q1"');
      expect(script).toContain('"text":"A1"');
    });
  });

  describe('generateBreadcrumbSchema', () => {
    it('returns empty string for invalid input', () => {
      expect(generateBreadcrumbSchema()).toBe('');
      expect(generateBreadcrumbSchema([])).toBe('');
    });

    it('generates BreadcrumbList schema', () => {
      const script = generateBreadcrumbSchema([{ name: 'Home', url: 'https://test.com' }]);
      expect(script).toContain('@type":"BreadcrumbList"');
      expect(script).toContain('"name":"Home"');
      expect(script).toContain('"item":"https://test.com"');
    });
  });

  describe('generateSitemap', () => {
    it('returns empty urlset for empty pages', () => {
      const xml = generateSitemap([]);
      expect(xml).toContain('<urlset');
      expect(xml).not.toContain('<url>');
    });

    it('generates urls with loc, lastmod, and priority', () => {
      const xml = generateSitemap([{ url: 'https://test.com', priority: '1.0' }]);
      expect(xml).toContain('<loc>https://test.com</loc>');
      expect(xml).toContain('<priority>1.0</priority>');
    });
  });

  describe('generateRobotsTxt', () => {
    it('generates valid robots.txt', () => {
      const txt = generateRobotsTxt('https://test.com/sitemap.xml');
      expect(txt).toContain('User-agent: *');
      expect(txt).toContain('Allow: /');
      expect(txt).toContain('Sitemap: https://test.com/sitemap.xml');
    });
    
    it('uses default sitemap path if not provided', () => {
      const txt = generateRobotsTxt();
      expect(txt).toContain('Sitemap: /sitemap.xml');
    });
  });
});
