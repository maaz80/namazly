import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MASAIL_DATA } from './src/utils/masailData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://namazly.in';

// List of static pages
const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/calendar', priority: '0.8', changefreq: 'monthly' },
  { path: '/timings', priority: '0.8', changefreq: 'daily' },
  { path: '/hadith', priority: '0.8', changefreq: 'daily' },
  { path: '/reviews', priority: '0.8', changefreq: 'daily' },
  { path: '/guide', priority: '0.7', changefreq: 'monthly' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.5', changefreq: 'monthly' },
  { path: '/faq', priority: '0.7', changefreq: 'weekly' },
  { path: '/privacy-policy', priority: '0.4', changefreq: 'monthly' },
  { path: '/disclaimer', priority: '0.4', changefreq: 'monthly' },
  { path: '/masail', priority: '0.9', changefreq: 'daily' },
  { path: '/zakat-calculator', priority: '0.8', changefreq: 'weekly' },
  { path: '/tasbih', priority: '0.8', changefreq: 'weekly' },
  { path: '/halal-checker', priority: '0.8', changefreq: 'weekly' },
  { path: '/qibla', priority: '0.8', changefreq: 'weekly' },
  { path: '/nearby-mosques', priority: '0.8', changefreq: 'weekly' }
];

const today = new Date().toISOString().split('T')[0];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

// Add static pages
staticPages.forEach(page => {
  xml += `  <url>
    <loc>${BASE_URL}${page.path === '/' ? '/' : page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
});

// Add dynamic masail pages from MASAIL_DATA
MASAIL_DATA.forEach(masla => {
  xml += `  <url>
    <loc>${BASE_URL}/masail/${masla.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
});

xml += `</urlset>\n`;

const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
fs.writeFileSync(sitemapPath, xml, 'utf8');
console.log(`✅ Sitemap successfully generated at: ${sitemapPath}`);
console.log(`   Total URLs: ${staticPages.length + MASAIL_DATA.length}`);
