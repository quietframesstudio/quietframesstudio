// Shared helpers for edge-rendered SEO meta on photo/series pages.
// These functions rewrite the SPA shell's head so crawlers and link-preview
// scrapers (which don't run JS) see page-specific titles, images, and schema.

export const SITE_URL = 'https://quietframesstudio.com';

const FILM_LABELS = {
  'hp5': 'Ilford HP5 Plus',
  'fp4': 'Ilford FP4 Plus',
  'sfx': 'Ilford SFX Infrared',
  'pan-f': 'Ilford Pan F Plus 50',
  'portra-400': 'Kodak Portra 400',
  'portra-800': 'Kodak Portra 800',
  'kodacolor-200': 'Kodacolor 200',
  'ektar-100': 'Kodak Ektar 100',
  'provia-100f': 'Fuji Provia 100F',
  'cinestill-800t': 'Cinestill 800T',
  'lomo-purple': 'Lomography Purple',
  'velvia-50': 'Fuji Velvia 50',
};
const FORMAT_LABELS = {
  '35mm': '35mm',
  '6x7': 'Pentax 6×7 Medium Format',
  '6x9': 'Fuji GW690II (6×9)',
  '4x5': '4×5 Large Format',
};

export function photoDescription(p) {
  const tags = p.tags || {};
  const bits = [];
  if (FILM_LABELS[tags.film]) bits.push('Shot on ' + FILM_LABELS[tags.film]);
  if (FORMAT_LABELS[tags.format]) bits.push(FORMAT_LABELS[tags.format]);
  if ((tags.location || []).length) bits.push(tags.location.map(l => l.replace(/-/g, ' ')).join(', '));
  const detail = bits.length ? ` ${bits.join(' · ')}.` : '';
  return `${p.title} — fine art film photograph by Michael J McConnell.${detail} Limited edition archival print available.`;
}

export function photoJsonLd(p, ser, printSizes) {
  const url = `${SITE_URL}/photo/${p.id}`;
  return {
    '@context': 'https://schema.org',
    '@type': ['VisualArtwork', 'Product'],
    '@id': url,
    name: p.title,
    url,
    image: `${SITE_URL}/${p.file}`,
    description: photoDescription(p),
    creator: { '@id': `${SITE_URL}/#photographer` },
    brand: { '@type': 'Brand', name: 'Quiet Frames Studio' },
    artMedium: 'Archival pigment print on Hahnemühle Photo Rag 308gsm',
    artform: 'Film photography',
    dateCreated: p.date || undefined,
    isPartOf: ser ? { '@type': 'CreativeWorkSeries', name: ser.title, url: `${SITE_URL}/gallery/${ser.id}` } : undefined,
    offers: (printSizes || []).map(ps => ({
      '@type': 'Offer',
      name: `${p.title} — ${ps.label} limited edition print`,
      price: String(ps.price),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url,
      seller: { '@id': `${SITE_URL}/#photographer` }
    }))
  };
}

export function seriesJsonLd(s, photos) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/gallery/${s.id}`,
    name: `${s.title} — Quiet Frames Studio`,
    url: `${SITE_URL}/gallery/${s.id}`,
    description: s.description || undefined,
    creator: { '@id': `${SITE_URL}/#photographer` },
    hasPart: (photos || []).slice(0, 30).map(p => ({
      '@type': 'VisualArtwork',
      name: p.title,
      url: `${SITE_URL}/photo/${p.id}`,
      image: `${SITE_URL}/${p.file}`
    }))
  };
}

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export function rewriteHead(html, { title, description, url, image, jsonLd }) {
  const t = escAttr(title);
  const d = escAttr(description);
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${t}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${escAttr(url)}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${escAttr(image)}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${t}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${escAttr(image)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(" id="canonical-link">)/, `$1${escAttr(url)}$2`)
    .replace(
      /<script type="application\/ld\+json" id="route-jsonld">null<\/script>/,
      `<script type="application/ld+json" id="route-jsonld">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`
    );
}

export async function loadShellAndData(context) {
  const origin = new URL(context.request.url).origin;
  const [shellRes, dataRes] = await Promise.all([
    context.env.ASSETS.fetch(new URL('/index.html', origin)),
    context.env.ASSETS.fetch(new URL('/gallery-data.json', origin)),
  ]);
  const html = await shellRes.text();
  const data = await dataRes.json();
  return { html, data };
}

export function htmlResponse(html) {
  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300, must-revalidate',
    },
  });
}
