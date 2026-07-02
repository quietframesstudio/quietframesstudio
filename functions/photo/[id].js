import {
  SITE_URL, photoDescription, photoJsonLd, rewriteHead, loadShellAndData, htmlResponse,
} from '../_lib.js';

export async function onRequestGet(context) {
  const { html, data } = await loadShellAndData(context);
  const id = context.params.id;
  const photo = (data.photos || []).find(p => p.id === id);
  if (!photo) return htmlResponse(html);

  const ser = (data.series || []).find(s => s.id === (photo.tags || {}).series);
  const printSizes = (data.settings || {}).printSizes || [];

  return htmlResponse(rewriteHead(html, {
    title: `${photo.title} — Limited Edition Film Print | Quiet Frames Studio`,
    description: photoDescription(photo),
    url: `${SITE_URL}/photo/${photo.id}`,
    image: `${SITE_URL}/${photo.file}`,
    jsonLd: photoJsonLd(photo, ser, printSizes),
  }));
}
