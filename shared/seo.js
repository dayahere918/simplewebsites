/**
 * SEO Utility Module
 * Injects meta tags, Open Graph, Twitter Cards, JSON-LD schema.org markup,
 * FAQ schema, and breadcrumb schema.
 */

/**
 * @typedef {Object} SEOConfig
 * @property {string} title - Page title
 * @property {string} description - Meta description
 * @property {string} keywords - Comma-separated keywords
 * @property {string} url - Canonical URL
 * @property {string} image - OG image URL
 * @property {string} type - Schema.org type (e.g., 'WebApplication')
 * @property {string} siteName - Site name
 */

/**
 * Generate meta tag HTML string
 * @param {SEOConfig} config
 * @returns {string} HTML meta tags
 */
function generateMetaTags(config) {
  if (!config || !config.title) {
    throw new Error('SEO config must include at least a title');
  }

  const tags = [];

  if (config.title) {
    tags.push(`<title>${escapeHtml(config.title)}</title>`);
  }

  // Basic meta
  if (config.description) {
    tags.push(`<meta name="description" content="${escapeHtml(config.description)}">`);
  }
  if (config.keywords) {
    tags.push(`<meta name="keywords" content="${escapeHtml(config.keywords)}">`);
  }
  tags.push('<meta name="robots" content="index, follow">');
  if (config.url) {
    tags.push(`<link rel="canonical" href="${escapeHtml(config.url)}">`);
  }

  // Open Graph
  tags.push(`<meta property="og:title" content="${escapeHtml(config.title)}">`);
  if (config.description) {
    tags.push(`<meta property="og:description" content="${escapeHtml(config.description)}">`);
  }
  tags.push(`<meta property="og:type" content="website">`);
  if (config.url) {
    tags.push(`<meta property="og:url" content="${escapeHtml(config.url)}">`);
  }
  if (config.image) {
    tags.push(`<meta property="og:image" content="${escapeHtml(config.image)}">`);
  }
  if (config.siteName) {
    tags.push(`<meta property="og:site_name" content="${escapeHtml(config.siteName)}">`);
  }

  // Twitter Card
  tags.push('<meta name="twitter:card" content="summary_large_image">');
  tags.push(`<meta name="twitter:title" content="${escapeHtml(config.title)}">`);
  if (config.description) {
    tags.push(`<meta name="twitter:description" content="${escapeHtml(config.description)}">`);
  }
  if (config.image) {
    tags.push(`<meta name="twitter:image" content="${escapeHtml(config.image)}">`);
  }

  return tags.join('\n    ');
}

/**
 * Generate JSON-LD schema.org markup
 * @param {SEOConfig} config
 * @returns {string} Script tag with JSON-LD
 */
function generateJsonLd(config) {
  if (!config || !config.title) {
    throw new Error('SEO config must include at least a title');
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': config.type || 'WebApplication',
    name: config.title,
    description: config.description || '',
    url: config.url || '',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  };

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

/**
 * Generate FAQ schema (JSON-LD)
 * @param {Array<{question: string, answer: string}>} faqs
 * @returns {string} Script tag with FAQ JSON-LD
 */
function generateFAQSchema(faqs) {
  if (!Array.isArray(faqs) || faqs.length === 0) return '';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

/**
 * Generate Breadcrumb schema (JSON-LD)
 * @param {Array<{name: string, url: string}>} items - Breadcrumb items in order
 * @returns {string} Script tag with BreadcrumbList JSON-LD
 */
function generateBreadcrumbSchema(items) {
  if (!Array.isArray(items) || items.length === 0) return '';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

/**
 * Generate sitemap.xml content
 * @param {Array<{url: string, lastmod?: string, priority?: string}>} pages
 * @returns {string} XML content
 */
function generateSitemap(pages) {
  if (!Array.isArray(pages) || pages.length === 0) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
  }

  const urls = pages.map(page => {
    const lastmod = page.lastmod || new Date().toISOString().split('T')[0];
    const priority = page.priority || '0.8';
    return `  <url>\n    <loc>${escapeXml(page.url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

/**
 * Generate robots.txt content
 * @param {string} sitemapUrl
 * @returns {string}
 */
function generateRobotsTxt(sitemapUrl) {
  return `User-agent: *
Allow: /

Sitemap: ${sitemapUrl || '/sitemap.xml'}`;
}

/**
 * Escape HTML special characters
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escape XML special characters
 * @param {string} str
 * @returns {string}
 */
function escapeXml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateMetaTags, generateJsonLd, generateFAQSchema, generateBreadcrumbSchema, generateSitemap, generateRobotsTxt, escapeHtml, escapeXml };
}
