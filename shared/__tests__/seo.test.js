const { 
  generateMetaTags, generateJsonLd, generateFAQSchema, generateBreadcrumbSchema, 
  generateSitemap, generateRobotsTxt, escapeHtml, escapeXml 
} = require('../seo.js');

describe('SEO Module', () => {
  describe('generateMetaTags', () => {
    it('throws error if title is missing', () => {
      expect(() => generateMetaTags({})).toThrow('SEO config must include at least a title');
    });

    it('generates basic tags', () => {
      const config = {
        title: 'Test Title',
        description: 'Desc',
        keywords: 'k1, k2',
        url: 'https://ex.com',
        image: 'img.png',
        siteName: 'Site'
      };
      const tags = generateMetaTags(config);
      expect(tags).toContain('<meta property="og:title" content="Test Title">');
      expect(tags).toContain('<meta name="description" content="Desc">');
      expect(tags).toContain('<link rel="canonical" href="https://ex.com">');
      expect(tags).toContain('<meta property="og:image" content="img.png">');
    });

    it('escapes HTML', () => {
      const tags = generateMetaTags({ title: 'Test <&>' });
      expect(tags).toContain('<meta property="og:title" content="Test &lt;&amp;&gt;">');
    });
  });

  describe('generateJsonLd', () => {
    it('generates standard script tag', () => {
      const json = generateJsonLd({ title: 'Test', description: 'desc', url: 'url' });
      expect(json).toContain('application/ld+json');
      expect(json).toContain('"name":"Test"');
      expect(json).toContain('"url":"url"');
    });
    it('throws if title missing', () => {
      expect(() => generateJsonLd(null)).toThrow();
    });
  });

  describe('generateFAQSchema', () => {
    it('generates FAQ JSON-LD', () => {
      const faqs = [{ question: 'Q', answer: 'A' }];
      const json = generateFAQSchema(faqs);
      expect(json).toContain('FAQPage');
      expect(json).toContain('acceptedAnswer');
    });
    it('returns empty string for invalid faqs', () => {
      expect(generateFAQSchema(null)).toBe('');
      expect(generateFAQSchema([])).toBe('');
    });
  });

  describe('generateBreadcrumbSchema', () => {
    it('generates BreadcrumbList', () => {
      const items = [{ name: 'Home', url: '/' }];
      const json = generateBreadcrumbSchema(items);
      expect(json).toContain('BreadcrumbList');
      expect(json).toContain('"name":"Home"');
    });
    it('returns empty for invalid items', () => {
      expect(generateBreadcrumbSchema(null)).toBe('');
    });
  });

  describe('generateSitemap', () => {
    it('generates valid XML', () => {
      const pages = [{ url: 'https://ex.com', priority: '1.0' }];
      const xml = generateSitemap(pages);
      expect(xml).toContain('<urlset');
      expect(xml).toContain('<loc>https://ex.com</loc>');
      expect(xml).toContain('<priority>1.0</priority>');
    });
    it('has fallback for empty pages', () => {
      expect(generateSitemap([])).toContain('<urlset');
      expect(generateSitemap(null)).toContain('<urlset');
    });
  });

  describe('generateRobotsTxt', () => {
    it('points to sitemap', () => {
      const robots = generateRobotsTxt('https://ex.com/sitemap.xml');
      expect(robots).toContain('Sitemap: https://ex.com/sitemap.xml');
      expect(generateRobotsTxt()).toContain('Sitemap: /sitemap.xml');
    });
  });

  describe('escapeHtml', () => {
    it('escapes special characters', () => {
      expect(escapeHtml('<div id="x" class=\'y\'>&</div>')).toBe('&lt;div id=&quot;x&quot; class=&#039;y&#039;&gt;&amp;&lt;/div&gt;');
    });
    it('handles non-strings safely', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(123)).toBe('');
    });
  });

  describe('escapeXml', () => {
    it('escapes special characters for XML', () => {
      expect(escapeXml('<div id="x" class=\'y\'>&</div>')).toBe('&lt;div id=&quot;x&quot; class=&apos;y&apos;&gt;&amp;&lt;/div&gt;');
    });
    it('handles non-strings safely', () => {
      expect(escapeXml(null)).toBe('');
    });
  });
});
