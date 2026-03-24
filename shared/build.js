/**
 * Build Script
 * Copies shared assets into each site's dist/ folder, generates sitemap.xml and robots.txt.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITES_DIR = path.join(ROOT, 'sites');
const SHARED_DIR = path.join(ROOT, 'shared');
const BASE_URL = process.env.BASE_URL || 'https://stacky.pages.dev';
const GLOBAL_DIST = path.join(ROOT, 'dist');

function getAllSites() {
  if (!fs.existsSync(SITES_DIR)) return [];
  return fs.readdirSync(SITES_DIR).filter(f =>
    fs.statSync(path.join(SITES_DIR, f)).isDirectory()
  );
}

function copyFileSync(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function buildSite(siteName) {
  const siteDir = path.join(SITES_DIR, siteName);
  const distDir = path.join(siteDir, 'dist');

  // Create dist folder
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Copy site files (exclude __tests__, node_modules, dist)
  const entries = fs.readdirSync(siteDir, { withFileTypes: true });
  for (const entry of entries) {
    if (['__tests__', 'node_modules', 'dist', 'package.json', 'jest.config.js'].includes(entry.name)) continue;
    const srcPath = path.join(siteDir, entry.name);
    const destPath = path.join(distDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }

  // Copy shared styles
  copyFileSync(path.join(SHARED_DIR, 'styles.css'), path.join(distDir, 'shared-styles.css'));

  // Generate robots.txt
  const siteUrl = `${BASE_URL}/${siteName}`;
  const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml`;
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt);

  // Generate sitemap.xml
  const today = new Date().toISOString().split('T')[0];
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`;
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml);

  // Copy to global dist
  const globalSiteDir = path.join(GLOBAL_DIST, siteName);
  copyDir(distDir, globalSiteDir);

  console.log(`✅ Built: ${siteName}`);
}

function buildAll() {
  const sites = getAllSites();
  if (sites.length === 0) {
    console.log('No sites found in sites/ directory.');
    return;
  }
  
  // Clean/Create global dist
  if (fs.existsSync(GLOBAL_DIST)) {
    fs.rmSync(GLOBAL_DIST, { recursive: true, force: true });
  }
  fs.mkdirSync(GLOBAL_DIST, { recursive: true });

  console.log(`Building ${sites.length} sites into ${GLOBAL_DIST}...`);
  
  // Copy shared assets to global dist root
  copyFileSync(path.join(SHARED_DIR, 'styles.css'), path.join(GLOBAL_DIST, 'shared-styles.css'));
  copyFileSync(path.join(SHARED_DIR, 'theme-toggle.js'), path.join(GLOBAL_DIST, 'shared-theme-toggle.js'));

  // Copy monetization & legal assets if they exist
  ['ads.txt', 'privacy.html', 'terms.html'].forEach(file => {
    const src = path.join(SHARED_DIR, file);
    if (fs.existsSync(src)) {
      copyFileSync(src, path.join(GLOBAL_DIST, file));
    }
  });

  sites.forEach(buildSite);

  // Generate a simple Index/Hub page for stacky.pages.dev root
  const siteLinks = sites.map(s => `<li><a href="${s}/">${s.replace(/-/g, ' ').toUpperCase()}</a></li>`).join('\n');
  const hubHtml = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head><meta charset="UTF-8"><title>Stacky — Simple Tool Collection</title>
<link rel="stylesheet" href="shared-styles.css">
<style>
  .hub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: var(--space-4); margin-top: var(--space-8); }
  .hub-card { padding: var(--space-6); text-align: center; border: 1px solid var(--color-border); border-radius: var(--radius-lg); transition: all 0.3s ease; text-decoration: none; color: inherit; }
  .hub-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-glow); transform: translateY(-4px); }
</style>
</head>
<body>
  <div class="container">
    <section class="hero"><h1>📚 <span class="text-gradient">Stacky</span></h1><p>21+ Premium small tools. Open source, fast, and free.</p></section>
    <div class="hub-grid">
      ${sites.map(s => `<a href="${s}/" class="hub-card"><h4>${s.replace(/-/g, ' ').toUpperCase()}</h4></a>`).join('')}
    </div>
  </div>
  <script src="shared-theme-toggle.js"></script>
</body>
</html>`;
  fs.writeFileSync(path.join(GLOBAL_DIST, 'index.html'), hubHtml);

  console.log(`\n🎉 All ${sites.length} sites built successfully into global dist!`);
}

// Run if called directly
if (require.main === module) {
  buildAll();
}

module.exports = { buildSite, buildAll, getAllSites, copyFileSync, copyDir };
