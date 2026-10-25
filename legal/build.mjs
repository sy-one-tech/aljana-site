// Pages légales du site (privacy.html, terms.html) dans les 12 langues du site.
// Sources : legal/src/<page>.<lang>.html (un article par langue, identifiants en {L}).
// Le français fait foi ; chaque autre version porte une note qui le dit.
// Régénérer après toute modification d'un texte : node legal/build.mjs
import fs from 'node:fs'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const LANGS = [
  ['fr', 'Français'], ['en', 'English'], ['ar', 'العربية'], ['es', 'Español'], ['de', 'Deutsch'], ['tr', 'Türkçe'],
  ['id', 'Indonesia'], ['ur', 'اردو'], ['fa', 'فارسی'], ['ru', 'Русский'], ['zh', '中文'], ['hi', 'हिन्दी']
]
const RTL = ['ar', 'ur', 'fa']

/* textes de l'interface (titres de document et d'onglet, descriptions, en-tête, pied) */
const UI = {
  fr: { skip: 'Aller au contenu', home: 'Accueil d’aljana', back: 'Retour à aljana', lang: 'Langue', privacy: 'Politique de confidentialité', terms: 'Conditions d’utilisation', tPrivacy: 'aljana : politique de confidentialité', tTerms: 'aljana : conditions d’utilisation', dPrivacy: 'Ce qu’aljana fait de vos données : pas de compte, pas de publicité ni de traceur, des calculs faits sur votre appareil.', dTerms: 'Les conditions d’utilisation d’aljana et de son offre Premium : abonnements, Pass, renouvellement, résiliation et remboursement.' },
  en: { skip: 'Skip to content', home: 'aljana home page', back: 'Back to aljana', lang: 'Language', privacy: 'Privacy policy', terms: 'Terms of use', tPrivacy: 'aljana: Privacy Policy', tTerms: 'aljana: Terms of Use', dPrivacy: 'What aljana does with your data: no account, no ads or trackers, calculations made on your device.', dTerms: 'The terms of use of aljana and its Premium offer: subscriptions, pass, renewal, cancellation and refunds.' },
  ar: { skip: 'انتقل إلى المحتوى', home: 'الصفحة الرئيسية لـ aljana', back: 'العودة إلى aljana', lang: 'اللغة', privacy: 'سياسة الخصوصية', terms: 'شروط الاستخدام', tPrivacy: 'aljana: سياسة الخصوصية', tTerms: 'aljana: شروط الاستخدام', dPrivacy: 'ما يفعله aljana ببياناتك: لا حساب، ولا إعلانات ولا أدوات تتبّع، والحسابات تجري على جهازك.', dTerms: 'شروط استخدام aljana وعرض Premium: الاشتراكات، واشتراك الشهر الواحد، والتجديد، والإلغاء، والاسترداد.' },
  es: { skip: 'Ir al contenido', home: 'Página de inicio de aljana', back: 'Volver a aljana', lang: 'Idioma', privacy: 'Política de privacidad', terms: 'Condiciones de uso', tPrivacy: 'aljana: política de privacidad', tTerms: 'aljana: condiciones de uso', dPrivacy: 'Lo que aljana hace con sus datos: sin cuenta, sin publicidad ni rastreadores, cálculos realizados en su dispositivo.', dTerms: 'Las condiciones de uso de aljana y de su oferta Premium: suscripciones, pase, renovación, cancelación y reembolso.' },
  de: { skip: 'Zum Inhalt springen', home: 'Startseite von aljana', back: 'Zurück zu aljana', lang: 'Sprache', privacy: 'Datenschutzerklärung', terms: 'Nutzungsbedingungen', tPrivacy: 'aljana: Datenschutzerklärung', tTerms: 'aljana: Nutzungsbedingungen', dPrivacy: 'Was aljana mit Ihren Daten macht: kein Konto, keine Werbung und keine Tracker, Berechnungen direkt auf Ihrem Gerät.', dTerms: 'Die Nutzungsbedingungen von aljana und seinem Premium-Angebot: Abos, Pass, Verlängerung, Kündigung und Erstattung.' },
  tr: { skip: 'İçeriğe geç', home: 'aljana ana sayfası', back: 'aljana’ya dön', lang: 'Dil', privacy: 'Gizlilik politikası', terms: 'Kullanım koşulları', tPrivacy: 'aljana: gizlilik politikası', tTerms: 'aljana: kullanım koşulları', dPrivacy: 'aljana verilerinizle ne yapar: hesap yok, reklam ve izleyici yok, hesaplamalar cihazınızda yapılır.', dTerms: 'aljana ve Premium teklifinin kullanım koşulları: abonelikler, geçiş, yenileme, iptal ve iade.' },
  id: { skip: 'Langsung ke konten', home: 'Beranda aljana', back: 'Kembali ke aljana', lang: 'Bahasa', privacy: 'Kebijakan privasi', terms: 'Ketentuan penggunaan', tPrivacy: 'aljana: kebijakan privasi', tTerms: 'aljana: ketentuan penggunaan', dPrivacy: 'Apa yang dilakukan aljana dengan data Anda: tanpa akun, tanpa iklan dan pelacak, perhitungan dilakukan di perangkat Anda.', dTerms: 'Ketentuan penggunaan aljana dan penawaran Premium-nya: langganan, pass, perpanjangan, pembatalan, dan pengembalian dana.' },
  ur: { skip: 'مواد پر جائیں', home: 'aljana کا صفحۂ اول', back: 'aljana پر واپس', lang: 'زبان', privacy: 'رازداری کی پالیسی', terms: 'شرائطِ استعمال', tPrivacy: 'aljana: رازداری کی پالیسی', tTerms: 'aljana: شرائطِ استعمال', dPrivacy: 'aljana آپ کے ڈیٹا کے ساتھ کیا کرتا ہے: نہ اکاؤنٹ، نہ اشتہار نہ ٹریکر، حسابات آپ کے آلے پر ہوتے ہیں۔', dTerms: 'aljana اور اس کی Premium پیشکش کی شرائطِ استعمال: سبسکرپشنز، پاس، تجدید، منسوخی اور رقم کی واپسی۔' },
  fa: { skip: 'رفتن به محتوا', home: 'صفحهٔ اصلی aljana', back: 'بازگشت به aljana', lang: 'زبان', privacy: 'سیاست حریم خصوصی', terms: 'شرایط استفاده', tPrivacy: 'aljana: سیاست حریم خصوصی', tTerms: 'aljana: شرایط استفاده', dPrivacy: 'aljana با داده‌های شما چه می‌کند: بدون حساب کاربری، بدون تبلیغات و ردیاب، محاسبات روی دستگاه شما.', dTerms: 'شرایط استفاده از aljana و پیشنهاد Premium آن: اشتراک‌ها، پاس، تمدید، لغو و بازپرداخت.' },
  ru: { skip: 'Перейти к содержанию', home: 'Главная страница aljana', back: 'Вернуться на aljana', lang: 'Язык', privacy: 'Политика конфиденциальности', terms: 'Условия использования', tPrivacy: 'aljana: политика конфиденциальности', tTerms: 'aljana: условия использования', dPrivacy: 'Что aljana делает с вашими данными: без учётной записи, без рекламы и трекеров, расчёты на вашем устройстве.', dTerms: 'Условия использования aljana и предложения Premium: подписки, пропуск, продление, отмена и возврат средств.' },
  zh: { skip: '跳到正文', home: 'aljana 首页', back: '返回 aljana', lang: '语言', privacy: '隐私政策', terms: '使用条款', tPrivacy: 'aljana：隐私政策', tTerms: 'aljana：使用条款', dPrivacy: 'aljana 如何处理您的数据：无需账户，没有广告和跟踪器，计算在您的设备上完成。', dTerms: 'aljana 及其 Premium 方案的使用条款：订阅、通行证、续订、取消和退款。' },
  hi: { skip: 'सामग्री पर जाएँ', home: 'aljana का मुखपृष्ठ', back: 'aljana पर वापस जाएँ', lang: 'भाषा', privacy: 'गोपनीयता नीति', terms: 'उपयोग की शर्तें', tPrivacy: 'aljana: गोपनीयता नीति', tTerms: 'aljana: उपयोग की शर्तें', dPrivacy: 'aljana आपके डेटा के साथ क्या करता है: न खाता, न विज्ञापन, न ट्रैकर, गणनाएँ आपके डिवाइस पर होती हैं।', dTerms: 'aljana और उसके Premium ऑफ़र की उपयोग की शर्तें: सदस्यताएँ, पास, नवीनीकरण, रद्दीकरण और धनवापसी।' }
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function page (kind) {
  const isP = kind === 'privacy', other = isP ? 'terms' : 'privacy'
  const fr = UI.fr, codes = LANGS.map((l) => l[0])
  const titles = Object.fromEntries(codes.map((c) => [c, UI[c][isP ? 'tPrivacy' : 'tTerms']]))
  const ui = Object.fromEntries(codes.map((c) => [c, { title: titles[c], description: UI[c][isP ? 'dPrivacy' : 'dTerms'], skip: UI[c].skip, home: UI[c].home, back: UI[c].back, lang: UI[c].lang, other: UI[c][other] }]))
  const articles = codes.map((c) => {
    const body = fs.readFileSync(`${ROOT}legal/src/${kind}.${c}.html`, 'utf8').split(String.fromCharCode(13)).join('').replace(/\{L\}/g, c).replace(/\s+$/, '')
    const titleId = (isP ? 'pp-title-' : 'tos-title-') + c
    return `    <article class="pp-doc" id="doc-${c}" lang="${c}" dir="${RTL.includes(c) ? 'rtl' : 'ltr'}" data-lang="${c}" aria-labelledby="${titleId}">\n${body}\n    </article>`
  }).join('\n\n')
  const hide = codes.map((c) => `html[data-pp-lang="${c}"] .pp-doc:not([data-lang="${c}"])`).join(',\n    ')
  const options = LANGS.map(([c, n]) => `<option value="${c}" lang="${c}"${c === 'fr' ? ' selected' : ''}>${n}</option>`).join('')
  const og = isP ? 'https://aljana.app/assets/og/privacy.jpg?v=2' : 'https://aljana.app/assets/og/fr.jpg?v=3'
  return `<!doctype html>
<html lang="fr" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(titles.fr)}</title>
  <meta name="description" content="${esc(ui.fr.description)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://aljana.app/${kind}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="aljana" />
  <meta property="og:url" content="https://aljana.app/${kind}" />
  <meta property="og:title" content="${esc(titles.fr)}" />
  <meta property="og:description" content="${esc(ui.fr.description)}" />
  <meta property="og:image" content="${og}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${og}" />
  <meta name="theme-color" content="#060B18" />
  <!-- Page générée par legal/build.mjs à partir de legal/src : modifier les sources, puis régénérer. -->
  <script>
    /* langue dès le premier rendu, mêmes règles que le site : ?lang=, sinon langue déjà choisie sur le site,
       sinon langue du navigateur, sinon anglais. Une ancienne ancre (#en, #fr…) est encore comprise. */
    (function () {
      var C = ${JSON.stringify(codes)}, T = ${JSON.stringify(titles)}
      var norm = function (t) { t = String(t || '').toLowerCase(); if (/^en/.test(t)) return 'en'; t = t.slice(0, 2); return C.indexOf(t) >= 0 ? t : null }
      var l = norm(new URLSearchParams(location.search).get('lang')) || (C.indexOf(location.hash.slice(1)) >= 0 ? location.hash.slice(1) : null)
      if (!l) { try { l = norm(localStorage.getItem('aljana.site.lang')) } catch (e) { /* stockage indisponible */ } }
      if (!l) { var n = navigator.languages || [navigator.language]; for (var i = 0; i < n.length && !l; i++) l = norm(n[i]) }
      l = l || 'en'
      var h = document.documentElement
      h.lang = l; h.dir = /^(ar|ur|fa)$/.test(l) ? 'rtl' : 'ltr'; h.setAttribute('data-pp-lang', l); document.title = T[l]
    })()
  </script>
  <link rel="icon" href="/assets/icon-192.png" type="image/png" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Commissioner:wght@400..700&display=swap" rel="stylesheet">
  <style>
    /* mêmes jetons et mêmes polices que la page d'accueil du site (index.html) */
    :root {
      --bg: #060B18; --band: #0A1326; --ink: #EEF1FA; --soft: #C9D1EA; --dim: #93A0C2;
      --gold: #E2B659; --gold-soft: #F3DFAE; --line: rgba(160,172,205,0.14);
      --sans: "Commissioner", system-ui, -apple-system, "Segoe UI", sans-serif;
      --header-h: 68px;
    }
    html[lang="ar"] { --sans: "IBM Plex Sans Arabic", system-ui, sans-serif; }
    html[lang="fa"] { --sans: "Vazirmatn", "Noto Sans Arabic", Tahoma, sans-serif; }
    html[lang="ur"] { --sans: "Noto Naskh Arabic", "Noto Sans Arabic", Tahoma, sans-serif; }
    html[lang="hi"] { --sans: "Noto Sans Devanagari", "Nirmala UI", sans-serif; }
    html[lang="zh"] { --sans: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif; }
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; }
    html { scroll-padding-top: var(--header-h); -webkit-text-size-adjust: 100%; }
    body { background: var(--bg); color: var(--soft); font-family: var(--sans); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
    h1, h2, h3 { color: var(--ink); margin: 0; font-weight: 600; }
    p { margin: 0; }
    .skip-link { position: absolute; inset-inline-start: -999px; top: 0; }
    .skip-link:focus { inset-inline-start: 8px; top: 8px; background: var(--band); color: var(--ink); padding: 8px 12px; border-radius: 6px; z-index: 200; }
    .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

    /* une seule langue affichée (sans JavaScript : toutes, l'une sous l'autre) */
    ${hide} { display: none; }

    /* en-tête : logo et choix de la langue */
    .pp-header { position: sticky; top: 0; z-index: 40; background: rgba(6,11,24,0.94); border-bottom: 1px solid var(--line); }
    .pp-header__inner { max-width: 960px; margin: 0 auto; min-height: var(--header-h); display: flex; align-items: center; justify-content: space-between; gap: 12px 16px; padding: 10px clamp(16px, 4vw, 32px); }
    .brand { display: flex; align-items: center; border-radius: 6px; }
    .brand img { height: 32px; width: auto; display: block; }
    .pp-lang select {
      appearance: none; -webkit-appearance: none; min-height: 42px; padding: 0 40px 0 16px; border-radius: 999px;
      border: 1px solid rgba(226,182,89,0.45); background-color: rgba(238,241,250,0.04); color: var(--ink);
      font: 600 15px/1 "Commissioner", system-ui, sans-serif; cursor: pointer;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5l5 5 5-5' fill='none' stroke='%23F3DFAE' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 16px center;
    }
    html[dir="rtl"] .pp-lang select { padding: 0 16px 0 40px; background-position: left 16px center; }
    .pp-lang select option { background: var(--band); color: var(--ink); }

    /* contenu : colonne de lecture */
    .pp { outline: none; }
    .pp-doc { max-width: 820px; margin: 0 auto; padding: clamp(44px, 7vw, 96px) clamp(20px, 5vw, 40px) clamp(56px, 8vw, 96px); font-size: clamp(16.5px, 1.1vw + 12px, 18px); line-height: 1.75; overflow-wrap: break-word; }
    .pp-doc + .pp-doc { border-top: 1px solid var(--line); }
    html[lang="ar"] .pp-doc, html[lang="fa"] .pp-doc, html[lang="ur"] .pp-doc { line-height: 1.9; }
    html[lang="ur"] .pp-doc { line-height: 2.05; }
    .pp-doc__head { margin-bottom: clamp(36px, 6vw, 56px); padding-bottom: clamp(24px, 4vw, 36px); border-bottom: 1px solid var(--line); }
    .pp-doc h1 { font-size: clamp(32px, 5vw, 48px); line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 14px; }
    html[dir="rtl"] .pp-doc h1, html[lang="hi"] .pp-doc h1, html[lang="zh"] .pp-doc h1 { letter-spacing: 0; line-height: 1.35; }
    .pp-updated { color: var(--gold-soft); font-size: 0.9em; margin-bottom: 14px; }
    .pp-note { color: var(--dim); font-size: 0.88em; line-height: 1.6; margin-bottom: 20px; }
    .pp-intro { font-size: 1.06em; color: var(--ink); }
    .pp-doc section { margin-bottom: clamp(36px, 5vw, 52px); scroll-margin-top: calc(var(--header-h) + 24px); }
    .pp-doc h2 { font-size: clamp(22px, 2.6vw, 27px); line-height: 1.3; margin-bottom: 16px; }
    .pp-doc h3 { font-size: clamp(17.5px, 1.8vw, 19.5px); line-height: 1.4; margin: 26px 0 8px; color: var(--gold-soft); }
    .pp-doc p { margin-bottom: 16px; }
    .pp-doc ul { margin: 0 0 18px; padding-inline-start: 1.4em; }
    .pp-doc li { margin-bottom: 8px; }
    .pp-doc li::marker { color: var(--gold); }
    .pp-doc strong { color: var(--ink); font-weight: 600; }
    .pp-doc a { color: var(--ink); text-decoration: underline; text-decoration-color: var(--gold); text-underline-offset: 3px; }
    .pp-doc a:hover { color: var(--gold-soft); }
    .pp-contact { font-style: normal; line-height: 1.9; margin-top: 8px; padding: 20px 24px; border: 1px solid var(--line); background: rgba(238,241,250,0.03); border-radius: 12px; }
    .pp-contact strong { color: var(--ink); }

    /* pied : l'autre page légale et le retour au site */
    .pp-footer { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 24px; padding: 32px 20px 56px; border-top: 1px solid var(--line); }
    .pp-footer a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 6px; color: var(--ink); font-size: 16px; text-decoration: underline; text-decoration-color: var(--gold); text-underline-offset: 4px; }
    .pp-footer a:hover { color: var(--gold-soft); }

    .pp-header a:focus-visible, .pp-lang select:focus-visible, .pp-doc a:focus-visible, .pp-footer a:focus-visible, .skip-link:focus-visible { outline: 2px solid var(--gold-soft); outline-offset: 3px; }

    @media (max-width: 420px) {
      .brand img { height: 27px; }
      .pp-contact { padding: 16px; }
    }
    @media print {
      .pp-header, .pp-footer, .skip-link { display: none; }
      body { background: #fff; }
      .pp-doc, .pp-doc h1, .pp-doc h2, .pp-doc h3, .pp-intro, .pp-updated, .pp-note, .pp-doc a, .pp-doc strong { color: #000; }
    }
  </style>
</head>
<body data-page="legal">

  <a class="skip-link" href="#main" data-l10n="skip">${fr.skip}</a>

  <header class="pp-header">
    <div class="pp-header__inner">
      <a href="/" class="brand" data-home data-l10n-label="home" aria-label="${esc(fr.home)}">
        <img src="/assets/brand/aljana-logo-v4.webp" alt="aljana" width="102" height="34" />
      </a>
      <label class="pp-lang"><span class="visually-hidden" data-l10n="lang">${fr.lang}</span><select id="ppLang">${options}</select></label>
    </div>
  </header>

  <main id="main" class="pp" tabindex="-1">

${articles}

  </main>

  <footer class="pp-footer">
    <a href="/${other}" data-l10n="other">${esc(ui.fr.other)}</a>
    <a href="/" data-home data-l10n="back">${fr.back}</a>
  </footer>

  <script>
    (function () {
    /* bascule de langue sans rechargement ; le choix est gardé comme sur le reste du site (aljana.site.lang) */
    var UI = ${JSON.stringify(ui)}
    var FONTS = { ar: 'IBM+Plex+Sans+Arabic:wght@400;500;600;700', fa: 'Vazirmatn:wght@400..700', ur: 'Noto+Naskh+Arabic:wght@400..700', hi: 'Noto+Sans+Devanagari:wght@400..700', zh: 'Noto+Sans+SC:wght@400..700' }
    var root = document.documentElement, sel = document.getElementById('ppLang')
    var setMeta = function (s, v) { var e = document.querySelector(s); if (e) e.setAttribute('content', v) }
    function font (l) { if (!FONTS[l] || document.getElementById('font-' + l)) return; var k = document.createElement('link'); k.id = 'font-' + l; k.rel = 'stylesheet'; k.href = 'https://fonts.googleapis.com/css2?family=' + FONTS[l] + '&display=swap'; document.head.appendChild(k) }
    function apply (l) {
      var t = UI[l]
      root.lang = l; root.dir = /^(ar|ur|fa)$/.test(l) ? 'rtl' : 'ltr'; root.setAttribute('data-pp-lang', l); font(l)
      document.title = t.title
      setMeta('meta[name="description"]', t.description); setMeta('meta[property="og:title"]', t.title); setMeta('meta[property="og:description"]', t.description)
      document.querySelectorAll('[data-lang]').forEach(function (el) { el.hidden = el.getAttribute('data-lang') !== l })
      document.querySelectorAll('[data-l10n]').forEach(function (el) { el.textContent = t[el.getAttribute('data-l10n')] })
      document.querySelectorAll('[data-l10n-label]').forEach(function (el) { el.setAttribute('aria-label', t[el.getAttribute('data-l10n-label')]) })
      /* liens vers le site et l'autre page légale : dans la même langue */
      document.querySelectorAll('a[href^="/"]').forEach(function (a) { var p = a.getAttribute('href').split('?')[0].split('#')[0]; if (p === '/' || p === '/privacy' || p === '/terms') a.setAttribute('href', p + '?lang=' + l) })
      sel.value = l
    }
    apply(root.getAttribute('data-pp-lang') || 'en')
    sel.addEventListener('change', function () {
      var l = sel.value; apply(l)
      try { var s = localStorage.getItem('aljana.site.lang') || ''; localStorage.setItem('aljana.site.lang', l === 'en' ? (/^en/.test(s) ? s : 'en-US') : l) } catch (e) { /* stockage indisponible */ }
      history.replaceState(null, '', location.pathname + '?lang=' + l)
      window.scrollTo(0, 0)
    })
    })()
  </script>
</body>
</html>
`
}

for (const kind of ['privacy', 'terms']) {
  const html = page(kind)
  fs.writeFileSync(`${ROOT}${kind}.html`, html)
  console.log(kind + '.html', (html.length / 1024).toFixed(0) + ' Ko')
}
