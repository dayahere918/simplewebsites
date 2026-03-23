/**
 * Build Script
 * Copies shared assets into each site's dist/ folder, generates sitemap.xml and robots.txt.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITES_DIR = path.join(ROOT, 'sites');
const SHARED_DIR = path.join(ROOT, 'shared');
const BASE_URL = process.env.BASE_URL || 'https://example.com';

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

  console.log(`✅ Built: ${siteName}`);
}

function buildAll() {
  const sites = getAllSites();
  if (sites.length === 0) {
    console.log('No sites found in sites/ directory.');
    return;
  }
  console.log(`Building ${sites.length} sites...`);
  sites.forEach(buildSite);
  console.log(`\n🎉 All ${sites.length} sites built successfully!`);
}

// Run if called directly
if (require.main === module) {
  buildAll();
}

module.exports = { buildSite, buildAll, getAllSites, copyFileSync, copyDir };
