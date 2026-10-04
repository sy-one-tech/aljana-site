/* ================================================================
   Cloudflare Pages Function — /api/place (site aljana, prototype)
   Lieu du visiteur déduit par Cloudflare de son adresse IP (request.cf),
   au niveau de la ville. Aucune permission, aucun service tiers, rien
   n'est stocké : la réponse est privée et jamais mise en cache.
   Champs absents (IP non résolue, VPN) → null : le site retombe sur le
   fuseau horaire, jamais sur une ville codée en dur.
   ================================================================ */
export const onRequestGet = ({ request }) => {
  const cf = request.cf || {}
  const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null }
  const body = {
    city: cf.city || null,
    cc: cf.country || null,
    region: cf.region || null,
    lat: num(cf.latitude),
    lon: num(cf.longitude),
    tz: cf.timezone || null,
  }
  return new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'private, no-store',
    },
  })
}
