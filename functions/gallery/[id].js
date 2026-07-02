import {
  SITE_URL, seriesJsonLd, rewriteHead, loadShellAndData, htmlResponse,
} from '../_lib.js';

export async function onRequestGet(context) {
  const { html, data } = await loadShellAndData(context);
  const id = context.params.id;
  const ser = (data.series || []).find(s => s.id === id);
  if (!ser) return htmlResponse(html);

  const photos = (data.photos || []).filter(p => (p.tags && p.tags.series) === id);

  return htmlResponse(rewriteHead(html, {
    title: `${ser.title} — Film Photography Series | Quiet Frames Studio`,
    description: ser.description || `${ser.title} — a film photography series by Michael J McConnell.`,
    url: `${SITE_URL}/gallery/${ser.id}`,
    image: ser.cover ? `${SITE_URL}/${ser.cover}` : `${SITE_URL}/images/lomo-purple-series/lomo-purple-series-004.jpg`,
    jsonLd: seriesJsonLd(ser, photos),
  }));
}
