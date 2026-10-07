/* ================================================================
   Cloudflare Pages Function — aperçus de partage par langue
   Les plateformes de partage (WhatsApp, iMessage, X, LinkedIn…) lisent
   seulement les balises du HTML envoyé : elles n'exécutent pas site.js,
   qui choisit la langue dans le navigateur. Pour un lien « /?lang=ar »,
   on réécrit donc, avant l'envoi, le titre, la description, l'image et
   la langue des balises de partage. Rien n'est stocké ; la page vue par
   le visiteur est la même, site.js continue de gérer la langue.
   ================================================================ */
import OG from './og-i18n.js'

const ORIGIN = 'https://aljana.app'
const resolve = (raw) => {
  const t = String(raw || '')
  if (OG[t]) return t
  if (/^en/i.test(t)) return /^en-(GB|IE|AU|NZ|ZA|IN|SG|MT|HK)$/i.test(t) ? 'en-GB' : 'en-US'
  const c = t.slice(0, 2).toLowerCase()
  return OG[c] ? c : null
}
const setContent = (v) => ({ element (el) { el.setAttribute('content', v) } })

export const onRequest = async (ctx) => {
  const url = new URL(ctx.request.url)
  const res = await ctx.next()
  if (url.pathname !== '/' && url.pathname !== '/index.html') return res
  const code = resolve(url.searchParams.get('lang'))
  if (!code || code === 'fr') return res
  if (!(res.headers.get('content-type') || '').includes('text/html')) return res
  const m = OG[code], img = `${ORIGIN}/assets/og/${code}.jpg?v=1`, page = `${ORIGIN}/?lang=${code}`
  const out = new HTMLRewriter()
    .on('html', { element (el) { el.setAttribute('lang', code); el.setAttribute('dir', m.rtl ? 'rtl' : 'ltr') } })
    .on('title', { element (el) { el.setInnerContent(m.title) } })
    .on('meta[name="description"]', setContent(m.desc))
    .on('meta[property="og:title"]', setContent(m.title))
    .on('meta[property="og:description"]', setContent(m.desc))
    .on('meta[property="og:image"]', setContent(img))
    .on('meta[property="og:url"]', setContent(page))
    .on('meta[property="og:locale"]', setContent(m.locale))
    .on('meta[name="twitter:title"]', setContent(m.title))
    .on('meta[name="twitter:description"]', setContent(m.desc))
    .on('meta[name="twitter:image"]', setContent(img))
    .transform(res)
  const h = new Headers(out.headers); h.set('vary', 'accept-encoding')
  return new Response(out.body, { status: out.status, headers: h })
}
