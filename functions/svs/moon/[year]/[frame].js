/* ================================================================
   Cloudflare Pages Function — /svs/moon/<année>/<n>.jpg
   Image horaire de la Lune du NASA Scientific Visualization Studio
   (« Moon Phase and Libration », 730 × 730), servie depuis le site et
   mise en cache un an : la page lit ses pixels (même origine) et ne
   dépend pas du serveur de la NASA à chaque visite. Rien d'autre n'est
   relayé : seules les années publiées et les numéros d'image valides.
   ================================================================ */
const SVS = { 2026: 'https://svs.gsfc.nasa.gov/vis/a000000/a005500/a005587/frames/730x730_1x1_30p/moon.' }

export const onRequestGet = async ({ params, request, waitUntil }) => {
  const year = String(params.year || ''), m = /^(\d{1,4})\.jpg$/.exec(String(params.frame || ''))
  const n = m ? Number(m[1]) : 0, max = (Number(year) % 4 === 0 ? 366 : 365) * 24
  if (!SVS[year] || n < 1 || n > max) return new Response('Not found', { status: 404 })
  const cache = caches.default, key = new Request(new URL(request.url).origin + `/svs/moon/${year}/${n}.jpg`)
  const hit = await cache.match(key); if (hit) return hit
  const up = await fetch(SVS[year] + n + '.jpg', { cf: { cacheTtl: 31536000, cacheEverything: true } })
  if (!up.ok || !(up.headers.get('content-type') || '').startsWith('image/')) return new Response('Upstream error', { status: 502 })
  const res = new Response(up.body, { headers: { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=31536000, immutable', 'access-control-allow-origin': '*' } })
  waitUntil(cache.put(key, res.clone()))
  return res
}
