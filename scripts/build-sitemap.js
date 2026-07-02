#!/usr/bin/env node
// Regenerates sitemap.xml from gallery-data.json.
// Run after adding photos: node scripts/build-sitemap.js

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://quietframesstudio.com';

const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'gallery-data.json'), 'utf8'));
const today = new Date().toISOString().slice(0, 10);
const lastmod = (data._meta && data._meta.updated) || today;

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

const urls = [];

function add(loc, priority, image) {
  urls.push({ loc, priority, image });
}

add(`${SITE}/`, '1.0');
add(`${SITE}/work`, '0.9');
add(`${SITE}/collect`, '0.9');
add(`${SITE}/about`, '0.7');

for (const s of data.series || []) {
  const hasPhotos = (data.photos || []).some(p => (p.tags && p.tags.series) === s.id);
  if (!hasPhotos && !s.cover) continue;
  add(`${SITE}/gallery/${s.id}`, '0.8', s.cover ? {
    loc: `${SITE}/${s.cover}`,
    title: s.title,
  } : null);
}

for (const p of data.photos || []) {
  add(`${SITE}/photo/${p.id}`, '0.6', {
    loc: `${SITE}/${p.file}`,
    title: p.title,
  });
}

const body = urls.map(u => {
  const img = u.image ? `
    <image:image>
      <image:loc>${esc(u.image.loc)}</image:loc>
      <image:title>${esc(u.image.title)}</image:title>
    </image:image>` : '';
  return `  <url>
    <loc>${esc(u.loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${u.priority}</priority>${img}
  </url>`;
}).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log(`sitemap.xml written: ${urls.length} URLs`);
