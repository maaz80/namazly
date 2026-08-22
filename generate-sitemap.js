import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://namazly.in';

// List of static pages
const staticPages = [
  { path: '/', title: 'Qaza Namaz Calculator and Manager' },
  { path: '/calendar', title: 'Islamic Calendar' },
  { path: '/timings', title: 'Today Namaz Timing & Prayer Timings' },
  { path: '/hadith', title: 'Daily Hadith' },
  { path: '/reviews', title: 'User Reviews' },
  { path: '/guide', title: 'Step-by-Step Guide' },
  { path: '/about', title: 'About Us' },
  { path: '/contact', title: 'Contact Us' },
  { path: '/faq', title: 'Frequently Asked Questions' },
  { path: '/privacy-policy', title: 'Privacy Policy' },
  { path: '/disclaimer', title: 'Disclaimer' },
  { path: '/masail', title: 'Islamic Masail & Answers' },
  { path: '/zakat-calculator', title: 'Zakat Calculator' },
  { path: '/tasbih', title: 'Digital Tasbih counter' },
  { path: '/qibla', title: 'Qibla Finder' },
  { path: '/nearby-mosques', title: 'Nearby Mosque Finder' }
];

// Helper function to format timestamp matching strictly W3C ISO 8601 spec: YYYY-MM-DDTHH:mm:ss+05:30 (with 2-digit offset hour)
function getTimestampWithOffset() {
  const date = new Date();
  const pad = (num) => String(num).padStart(2, '0');
  
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  
  const dateTimePart = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  
  const offsetMinutes = date.getTimezoneOffset();
  const absOffsetMinutes = Math.abs(offsetMinutes);
  const offsetHours = pad(Math.floor(absOffsetMinutes / 60)); // Must be 2-digit padded for search engine validation
  const offsetMins = pad(absOffsetMinutes % 60);
  const sign = offsetMinutes <= 0 ? '+' : '-';
  
  const offsetStr = `${sign}${offsetHours}:${offsetMins}`;
  return `${dateTimePart}${offsetStr}`;
}

const currentTimestamp = getTimestampWithOffset();

// Load masail from public/masail.json
const masailJsonPath = path.join(__dirname, 'public', 'masail.json');
let MASAIL_DATA = [];
try {
  if (fs.existsSync(masailJsonPath)) {
    MASAIL_DATA = JSON.parse(fs.readFileSync(masailJsonPath, 'utf8'));
  }
} catch (err) {
  console.error('Error loading masail.json for sitemap:', err);
}

// 1. Generate sitemap.xml with ONLY <loc> and <lastmod> (with clean pretty printed newlines)
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// Add static pages
staticPages.forEach(page => {
  sitemapXml += `  <url>\n    <loc>${BASE_URL}${page.path === '/' ? '/' : page.path}</loc>\n    <lastmod>${currentTimestamp}</lastmod>\n  </url>\n`;
});

// Add dynamic masail pages
MASAIL_DATA.forEach(masla => {
  sitemapXml += `  <url>\n    <loc>${BASE_URL}/masail/${masla.slug}</loc>\n    <lastmod>${currentTimestamp}</lastmod>\n  </url>\n`;
});

sitemapXml += `</urlset>\n`;

const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
console.log(`✅ Sitemap successfully generated at: ${sitemapPath}`);


// 2. Generate urllist.txt (One URL per line)
let urlListText = "";
staticPages.forEach(page => {
  urlListText += `${BASE_URL}${page.path === '/' ? '/' : page.path}\n`;
});
MASAIL_DATA.forEach(masla => {
  urlListText += `${BASE_URL}/masail/${masla.slug}\n`;
});

const urlListPath = path.join(__dirname, 'public', 'urllist.txt');
fs.writeFileSync(urlListPath, urlListText, 'utf8');
console.log(`✅ URL List successfully generated at: ${urlListPath}`);


// 3. Generate ror.xml
let rorXml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:ror="http://rorweb.com/0.1/">\n  <channel>\n    <title>Namazly Sitemap</title>\n    <link>${BASE_URL}/</link>\n    <description>ROR XML sitemap feed for Namazly website resources</description>\n`;

staticPages.forEach((page, index) => {
  rorXml += `    <item>\n      <link>${BASE_URL}${page.path === '/' ? '/' : page.path}</link>\n      <title>${page.title} | Namazly</title>\n      <ror:sortOrder>${index + 1}</ror:sortOrder>\n      <ror:resourceOf>sitemap</ror:resourceOf>\n    </item>\n`;
});

MASAIL_DATA.forEach((masla, index) => {
  const cleanTitle = masla.question.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  rorXml += `    <item>\n      <link>${BASE_URL}/masail/${masla.slug}</link>\n      <title>${cleanTitle} | Namazly</title>\n      <ror:sortOrder>${staticPages.length + index + 1}</ror:sortOrder>\n      <ror:resourceOf>sitemap</ror:resourceOf>\n    </item>\n`;
});

rorXml += `  </channel>\n</rss>\n`;

const rorPath = path.join(__dirname, 'public', 'ror.xml');
fs.writeFileSync(rorPath, rorXml, 'utf8');
console.log(`✅ ROR Sitemap successfully generated at: ${rorPath}`);

console.log(`🎉 All SEO map files successfully compiled! Total URLs: ${staticPages.length + MASAIL_DATA.length}`);
