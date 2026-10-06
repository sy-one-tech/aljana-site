/* aljana · scènes du ciel — héros (votre ciel), Maghrib (le premier croissant), « Maintenant, chez vous ».
   Tout est calculé pour le lieu et l'instant avec les moteurs de l'app (engine.js) ; le globe est celui de l'app (earth.js),
   la Lune et le ciel étoilé viennent des cartes de la NASA (moon.js, sky.js). Langue : celle choisie par site.js (html[lang]).
   Lieu : ville déduite par Cloudflare de l'adresse IP (/api/place), sans permission ni stockage ; à défaut, capitale de la langue.
   Paramètres de revue : ?d=2026-10-25&t=20:30 · ?lat=&lon=&city=&tz= · ?cap=1 (capitale de la langue) · ?still=1 (sans animation) */
(function () {
  'use strict'
  var A = window.ALJ, RAD = Math.PI / 180
  var qs = new URLSearchParams(location.search)
  var fontP = document.fonts ? document.fonts.ready : Promise.resolve()
  var CODE = document.documentElement.lang || 'fr', LANG = /^en/.test(CODE) ? 'en' : CODE, RTL = LANG === 'ar' || LANG === 'ur' || LANG === 'fa'
  var AF = { plex: ['IBM Plex Sans Arabic', 'IBM+Plex+Sans+Arabic:wght@400;600'], kufi: ['Noto Kufi Arabic', 'Noto+Kufi+Arabic:wght@400;600'], naskh: ['Noto Naskh Arabic', 'Noto+Naskh+Arabic:wght@400;600'],
    nastaliq: ['Noto Nastaliq Urdu', 'Noto+Nastaliq+Urdu:wght@400;600'], gulzar: ['Gulzar', 'Gulzar'] }
  var LX = window.ALJ_L10N || {}, TL = LX[LANG] || null, RT = {}; Object.keys(LX).forEach(function (k) { RT[k] = LX[k].hero })
  if (LANG === 'ar' || LANG === 'ur') {
    var de = document.documentElement, ak = qs.get('afont') || (LANG === 'ur' ? 'gulzar' : 'kufi'), tk = AF[ak] || AF.kufi, bk = LANG === 'ur' ? AF.naskh : AF.plex /* retenu : arabe = Noto Kufi (titres) + Plex (texte) ; ourdou = Gulzar (titres) + Noto Naskh (texte) */
    de.dataset.afont = ak
    var lk = function (f) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + f[1] + '&display=swap'; document.head.appendChild(l); return new Promise(function (r) { l.onload = r; l.onerror = r }) }
    de.style.setProperty('--display', '"' + tk[0] + '", "Commissioner", sans-serif'); de.style.setProperty('--sans', '"' + bk[0] + '", "Commissioner", sans-serif')
    var smp = RT[LANG].sample || 'السماء'
    fontP = Promise.all([lk(tk), bk === tk ? 0 : lk(bk)]).then(function () { return Promise.all([document.fonts.load('600 60px "' + tk[0] + '"', smp), document.fonts.load('400 60px "' + tk[0] + '"', smp), document.fonts.load('400 18px "' + bk[0] + '"', smp)]) }).catch(function () { })
  }
  var reduced = (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || !!qs.get('still')
  var clamp = function (x, a, b) { return Math.min(b, Math.max(a, x)) }
  var smooth = function (k) { k = clamp(k, 0, 1); return k * k * (3 - 2 * k) }
  var LOC = 'fr-FR', pad = function (n) { return String(n).padStart(2, '0') }
  var T = {
    kick: 'Votre ciel, maintenant · {c}', proof: 'Ciel calculé pour {c} · {d} · vue vers le {dir} · Soleil {s}', above: 'à {n}° au-dessus de l’horizon', below: 'à {n}° sous l’horizon',
    v2k: 'Maghrib {t} · {d}', lensH: 'Vue agrandie ×{n} · phase et orientation réelles', lensM: '<span class="look-l">{look}</span><span class="look-d">Vers {t}, à {a}° au-dessus de l’horizon et {z}° {side} du Soleil couché. Âge {h} h, {p} % éclairé. Vue agrandie ×{n}.</span>', ans: '{d}, avis aljana : {v}.', left: 'à gauche', right: 'à droite', moL: 'La Lune, ce soir', moW: '{t} · à {a}° au-dessus de l’horizon, vers le {d}.', moDown: 'Sous l’horizon à {t} · lever à {r}.', tagH: 'Premier croissant · {t}', tagL: '{a}° au-dessus de l’horizon · âge {h} h · {p} % éclairé', adv: 'Avis aljana : {v}',
    look: { low0: 'Un fin croissant, très bas sur l’horizon, ', low1: 'Un fin croissant, bas sur l’horizon, ', low2: 'Un fin croissant, ', near: 'juste au-dessus du Soleil couché.', bit: 'un peu {s} du Soleil couché.', far: '{s} du Soleil couché.' },
    advTxt: { A: 'visible à l’œil nu', B: 'visible à l’œil nu sous bonnes conditions', C: 'aide optique utile', D: 'visible seulement avec aide optique', E: 'non visible', F: 'non visible' },
    v3k: 'Maintenant, chez vous · {c}', npAt: 'à {t}', moP: 'lever {r} · coucher {s}', qbP: '{dir} · {km} km jusqu’à la Kaaba',
    prec: '<b>{c}</b> · lever du Soleil {when} à {r} · coucher {sw} à {s} · contrôlé face aux éphémérides JPL Horizons de la NASA',
    event: '<b>{e}</b> dans {n} jours · {d}{f}', forecast: ' (date prévisionnelle)',
    salam: 'Assalamou Aleykoum', nextP: 'Prochaine prière', cur: 'Actuelle', last: 'Dernière', at: 'à', sun: 'SOLEIL', moon: 'LUNE', altitude: 'Altitude',
    cresc: 'Prochain croissant', qibla: 'Qibla', sunset: 'Coucher du soleil', sunrise: 'Lever du soleil', tonight: 'Ce soir', inDays: 'Dans {n} jours', tomorrow: 'Demain', observable: 'Observable',
    nav: ['Accueil', 'Prières', 'Ciel', 'Lune', 'Hilal', 'Qibla', 'Éclipses'],
    P: { fajr: 'Fajr', sunrise: 'Lever', zenith: 'Zénith', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha', midnight: 'Minuit', qiyam: 'Qiyam' },
    dir: ['Nord', 'Nord-Est', 'Est', 'Sud-Est', 'Sud', 'Sud-Ouest', 'Ouest', 'Nord-Ouest'], dirL: ['nord', 'nord-est', 'est', 'sud-est', 'sud', 'sud-ouest', 'ouest', 'nord-ouest'],
    phases: ['Nouvelle lune', 'Premier croissant', 'Premier quartier', 'Gibbeuse croissante', 'Pleine lune', 'Gibbeuse décroissante', 'Dernier quartier', 'Dernier croissant'],
    ev: { ramadan: 'Ramadan', fitr: 'L’Aïd al-Fitr', adha: 'L’Aïd al-Adha', muharram: 'Le nouvel an hégirien' },
    planets: { venus: 'Vénus', jupiter: 'Jupiter', mars: 'Mars', saturn: 'Saturne', mercury: 'Mercure' }, today: 'aujourd’hui', tomorrowL: 'demain',
    cielNow: 'Ciel calculé pour {c} · {d}', cielTonight: 'Le ciel de cette nuit à {t}, calculé pour {c}',
    eSolarP: '{p} % du Soleil caché depuis {c}, au maximum à {t}.', eSolarT: 'Éclipse totale depuis {c} : {dur} de totalité, au maximum à {t}.', eSolarA: 'Éclipse annulaire depuis {c}, au maximum à {t}.',
    eBand: 'Totale seulement dans une étroite bande : {r}.', eBandA: 'Annulaire seulement dans une étroite bande : {r}.', eLunarP: 'Éclipse partielle de Lune visible depuis {c}, au maximum à {t}.', eLunarT: 'Éclipse totale de Lune visible depuis {c}, au maximum à {t}.',
    cmp: ['Chaque jour, un verset, un hadith et une duʿāʾ.', 'Le Muṣḥaf, page après page.', 'Al-Kahf, en un geste.'],
    eFilter: 'Vue à travers un filtre solaire, au maximum', eLunarCap: 'La Lune au maximum de l’éclipse', eSafe: 'Ne regardez jamais le Soleil sans filtre adapté.',
  }
  var BASE_T = JSON.parse(JSON.stringify(T))
  if (TL) { Object.keys(TL.T).forEach(function (k) { T[k] = TL.T[k] }); LOC = TL.loc }
  var HJ = TL ? TL.hijri : 'fr', PRTL = RTL
  var fill = function (s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k] != null ? o[k] : '' }) }

  /* ---------- lieu et instants ---------- */
  var browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris'
  var CAP = CODE === 'en-US' ? { lat: 38.9072, lon: -77.0369, city: 'Washington', tz: 'America/New_York' } : TL ? TL.cap : { lat: 48.8566, lon: 2.3522, city: 'Paris', tz: 'Europe/Paris' }
  var place = Object.assign({}, CAP)
  if (qs.get('lat')) place = { lat: +qs.get('lat'), lon: +qs.get('lon'), city: qs.get('city') || '', tz: qs.get('tz') || browserTz }
  var parts = function (d) { var p = A.utcToZonedParts(d, place.tz); return { y: p.year, m: p.month, d: p.day, h: p.hour, mi: p.minute, s: p.second } }
  var offset = 0
  function applySim() { var t = qs.get('t'), d = qs.get('d'); if (!t && !d) { offset = 0; return } var c = parts(new Date()); offset = A.zonedLocalToUtc((d || c.y + '-' + pad(c.m) + '-' + pad(c.d)) + 'T' + (t || pad(c.h) + ':' + pad(c.mi)) + ':00', place.tz).getTime() - Date.now() }
  var now = function () { return new Date(Date.now() + offset) }
  var fmtT = function (d, sec) { return d ? new Intl.DateTimeFormat(LOC, { hour: '2-digit', minute: '2-digit', second: sec ? '2-digit' : undefined, hourCycle: 'h23', timeZone: place.tz }).format(d) : '—' }
  var fmtD = function (d, o) { return new Intl.DateTimeFormat(LOC, Object.assign({ timeZone: place.tz }, o)).format(d) }
  var num = function (n, dg) { return new Intl.NumberFormat(LOC, { maximumFractionDigits: dg || 0, minimumFractionDigits: dg || 0 }).format(n) }
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1) }
  var dayCache = {}
  function times(c) { var k = c.y + '-' + c.m + '-' + c.d; if (!dayCache[k]) dayCache[k] = A.prayerTimes({ y: c.y, m: c.m, d: c.d }, place.lat, place.lon, 'MWL', 1); return dayCache[k] }
  function addDays(c, n) { var d = new Date(Date.UTC(c.y, c.m - 1, c.d + n, 12)); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() } }
  var ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
  function prayerState(at) {
    var c = parts(at), tt = times(c), cur = null, next = null
    for (var i = 0; i < ORDER.length; i++) { var t = tt[ORDER[i]]; if (!t) continue; if (t <= at) cur = { key: ORDER[i], at: t }; else if (!next) next = { key: ORDER[i], at: t } }
    if (!next) next = { key: 'fajr', at: times(addDays(c, 1)).fajr }
    if (!cur) cur = { key: 'isha', at: times(addDays(c, -1)).isha }
    return { cur: cur, next: next, tt: tt, c: c }
  }
  function qibla() { var la1 = place.lat * RAD, lo1 = place.lon * RAD, la2 = 21.4225 * RAD, lo2 = 39.8262 * RAD, dl = lo2 - lo1
    var b = (Math.atan2(Math.sin(dl) * Math.cos(la2), Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dl)) / RAD + 360) % 360
    return { b: b, km: 6371.0088 * Math.acos(clamp(Math.sin(la1) * Math.sin(la2) + Math.cos(la1) * Math.cos(la2) * Math.cos(dl), -1, 1)), dir: T.dir[Math.round(b / 45) % 8] } }
  function phaseName(m) { var k = m.illum, w = m.elong < 180; return T.phases[k < 0.03 ? 0 : k > 0.97 ? 4 : Math.abs(k - 0.5) < 0.04 ? (w ? 2 : 6) : k < 0.5 ? (w ? 1 : 7) : (w ? 3 : 5)] }
  function preciseCross(approx, target) { if (!approx) return null; var lo = approx.getTime() - 180000, hi = approx.getTime() + 180000, up = A.sunAltAz(new Date(hi), place.lat, place.lon).alt > A.sunAltAz(new Date(lo), place.lat, place.lon).alt
    for (var i = 0; i < 30; i++) { var mid = (lo + hi) / 2, a = A.sunAltAz(new Date(mid), place.lat, place.lon).alt; if ((a < target) === up) lo = mid; else hi = mid } return new Date(Math.round(hi / 1000) * 1000) }
  var lstDeg = function (at) { return ((280.16 + 360.9856235 * (A.jdFromDate(at) - 2451545.0) + place.lon) % 360 + 360) % 360 }

  /* ---------- astres : calque 2D (étoiles réelles, planètes) et Lune texturée ---------- */
  var STARS = []
  var starsP = fetch('ciel/stars.json?v=1').then(function (r) { return r.json() }).then(function (s) { STARS = s }).catch(function () { })
  var sprite = (function () { var c = document.createElement('canvas'); c.width = c.height = 64; var x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.12, 'rgba(255,255,255,0.85)'); g.addColorStop(0.3, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return c })()
  var tints = {}
  function tinted(bv) { var k = bv < 0.1 ? 'b' : bv < 0.6 ? 'w' : bv < 1.1 ? 'y' : 'o'; if (tints[k]) return tints[k]; var col = { b: '200,218,255', w: '246,248,255', y: '255,236,204', o: '255,206,158' }[k]
    var c = document.createElement('canvas'); c.width = c.height = 64; var x = c.getContext('2d'); x.drawImage(sprite, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = 'rgb(' + col + ')'; x.fillRect(0, 0, 64, 64); tints[k] = c; return c }
  function drawAstres(cv, at, v, o) {
    var dpr = Math.min(2, window.devicePixelRatio || 1), W = v.W, H = v.H
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr) }
    var x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H)
    var sun = A.sunAltAz(at, place.lat, place.lon), nk = clamp((-sun.alt - 3) / 11, 0, 1); if (nk <= 0) return
    var lim = clamp(2.4 + (-sun.alt - 4) * 0.38, 0, 6.2) - 1.0 * (o.moonLit || 0), tw = o.t || 0 /* magnitude limite à l'œil nu */
    var jd = A.jdFromDate(at), px = function (az) { var d = ((az - v.azC) % 360 + 540) % 360 - 180; return W / 2 + d * v.ppd }
    x.globalCompositeOperation = 'lighter'
    for (var i = 0; i < STARS.length; i++) {
      var s = STARS[i]; var aa = A.altAzFromRaDec(jd, s[0] / 15, s[1], place.lat, place.lon); if (aa.alt < 1) continue
      var X = px(aa.az), Y = v.hzY - aa.alt * v.ppd; if (X < -10 || X > W + 10 || Y < -10 || Y > H) continue
      var airm = 1 / Math.max(0.08, Math.sin((aa.alt + 2) * RAD)), m = s[2] + 0.25 * (airm - 1), vis = smooth((lim + 0.35 - m) / 1.1); if (vis <= 0.01) continue
      var L = Math.pow(10, -0.4 * (m - 1.2)), a = vis * (0.3 + 0.7 * Math.min(1, L * 1.4)) * (o.dim || 1)
      if (tw) a *= 1 + 0.22 * Math.min(1, 0.25 + (airm - 1) * 0.5) * Math.sin(tw * (2.1 + (i % 7) * 0.37) + i) /* scintillation, plus forte près de l'horizon */
      a = clamp(a, 0, 1); var r = (0.75 + 3.4 * Math.sqrt(Math.min(1.6, L))) * (o.scale || 1)
      x.globalAlpha = a; x.drawImage(tinted(s[3]), X - r * 2.2, Y - r * 2.2, r * 4.4, r * 4.4)
    }
    var pl = ['venus', 'jupiter', 'mars', 'saturn', 'mercury']
    for (var j = 0; j < pl.length; j++) { var p = A.planetPos(pl[j], jd); if (p.mag > 1.6) continue; var q = A.altAzFromRaDec(jd, p.ra, p.dec, place.lat, place.lon); if (q.alt < 2) continue
      var X2 = px(q.az), Y2 = v.hzY - q.alt * v.ppd; if (X2 < 0 || X2 > W) continue
      var r2 = 4.2 + 2.2 * Math.max(0, 1 - p.mag); x.globalAlpha = nk; x.drawImage(tinted(0.9), X2 - r2 * 2.6, Y2 - r2 * 2.6, r2 * 5.2, r2 * 5.2)
      if (o.labels) { x.globalCompositeOperation = 'source-over'; x.globalAlpha = 0.78 * nk; x.font = RTL ? '500 13px ' + getComputedStyle(document.documentElement).getPropertyValue('--sans') : '500 12.5px "Commissioner", sans-serif'; x.fillStyle = '#C9D1EA'; x.textAlign = 'center'; x.fillText((RT[LANG] ? RT[LANG].planets : T.planets)[pl[j]], X2, Y2 + 22); x.globalCompositeOperation = 'lighter' } }
    x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'
  }
  function placeMoon(el, at, v, o) {
    var m = A.moonAltAz(at, place.lat, place.lon); if (m.alt < -0.5) { el.style.display = 'none'; return null }
    var d = ((m.az - v.azC) % 360 + 540) % 360 - 180, x = v.W / 2 + d * v.ppd, y = v.hzY - m.alt * v.ppd
    var realPx = 2 * Math.asin(1737.4 / m.distKm) / RAD * v.ppd, px = Math.max(o.minPx || 7, realPx)
    el.style.display = ''; el.style.left = x + 'px'; el.style.top = y + 'px'
    var sun = A.sunAltAz(at, place.lat, place.lon)
    if (o.drawMoon !== false) window.ALJ_MOON.render(el, Math.round(px), A.moonOrientation(at, place.lat, place.lon), { ash: clamp((-sun.alt - 4) / 8, 0, 1), gain: 1.25 })
    return { m: m, x: x, y: y, realPx: realPx }
  }
  /* vue agrandie, identifiée comme telle : même Lune (phase, côté éclairé, inclinaison réels), grossissement calculé */
  function lens(sec, at, c) {
    var L = sec.querySelector('.lens'), cv = L.querySelector('canvas'), cp = sec.querySelector('.lens-cap'), ln = sec.querySelector('.lens-line')
    L.style.width = L.style.height = c.size + 'px'; L.style.left = c.cx + 'px'; L.style.top = c.cy + 'px'; if (c.halo != null) L.style.setProperty('--halo', c.halo)
    var mp = Math.round(c.size * 0.74)
    if (c.drawMoon !== false) window.ALJ_MOON.render(cv, mp, A.moonOrientation(at, place.lat, place.lon), { ash: c.ash, gain: 1.15, bump: 1.4 })
    cp.innerHTML = fill(c.cap, Object.assign({ n: num(Math.round(mp / c.realPx)) }, c.vals || {}))
    cp.style.left = (c.capX != null ? c.capX : c.cx) + 'px'; cp.style.top = (c.capY != null ? c.capY : c.cy + mp / 2 + 18) + 'px'; cp.style.width = c.capW ? c.capW + 'px' : ''; cp.style.whiteSpace = c.capW ? 'normal' : ''
    cp.classList.toggle('side', !!c.side); cp.classList.toggle('look', !!c.look)
    if (!c.from) { ln.style.display = 'none'; return }
    var dx = c.cx - c.from.x, dy = c.cy - c.from.y, dist = Math.hypot(dx, dy), a0 = 14, a1 = dist - mp * 0.5 - 20
    ln.style.display = a1 > a0 ? '' : 'none'; ln.style.left = (c.from.x + dx / dist * a0) + 'px'; ln.style.top = (c.from.y + dy / dist * a0) + 'px'; ln.style.width = Math.max(0, a1 - a0) + 'px'; ln.style.transform = 'translateY(-0.5px) rotate(' + Math.atan2(dy, dx) + 'rad)'
  }

  /* ---------- scène ---------- */
  function Scene(sec) { this.sec = sec; this.sky = new window.ALJ_SKY(sec.querySelector('canvas.sky'), 0.5); this.ov = sec.querySelector('canvas.ov'); this.moon = sec.querySelector('canvas.moon')
    var sc = sec.querySelector('canvas.stars'); if (sc && window.ALJ_STARS) try { this.stars = new window.ALJ_STARS(sc, '/textures/nasa/'); var me = this; this.stars.onupgrade = function () { if (me.redraw) me.redraw() } } catch (e) { console.warn('étoiles', e) } }
  Scene.prototype.draw = function (at, frame, o) {
    var W = this.sec.clientWidth, H = frame.H || this.sec.clientHeight, sun = A.sunAltAz(at, place.lat, place.lon), mo = A.moonAltAz(at, place.lat, place.lon)
    var v = { W: W, H: this.sec.clientHeight, ppd: W / frame.fov, hzY: frame.hz * H, azC: 0 }
    v.azC = (frame.aim != null ? frame.aim - (frame.ax - 0.5) * W / v.ppd : sun.az) + (o.drift || 0)
    this.v = v
    o.moonLit = mo.alt > 0 ? mo.illum * smooth(mo.alt / 15) : 0; o.t = reduced ? 0 : performance.now() / 1000
    var nasa = this.stars && this.stars.ready
    this.sky.render({ W: W, H: v.H, azC: v.azC, ppd: v.ppd, hzY: v.hzY, sunAlt: sun.alt, sunAz: sun.az, lat: place.lat, lst: lstDeg(at), moonLit: o.moonLit, milky: nasa ? 0 : o.milky, seed: o.seed, time: o.t })
    if (nasa) this.stars.render({ W: W, H: v.H, azC: v.azC, ppd: v.ppd, hzY: v.hzY, lat: place.lat, lst: lstDeg(at), sunAlt: sun.alt, moonLit: o.moonLit, seed: o.seed })
    drawAstres(this.ov, at, v, o)
    v.moon = this.moon ? placeMoon(this.moon, at, v, o) : null
    return v
  }

  /* ---------- téléphone : l'Accueil de l'app (mêmes blocs, même globe) ---------- */
  var IC = {
    menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    locate: '<line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/>',
    house: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>', moonstar: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
    sunrise: '<path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
    nav: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    sunset: '<path d="M12 10V2"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m16 6-4 4-4-4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
  }
  var ic = function (k, col) { return '<svg viewBox="0 0 24 24" fill="none" stroke="' + (col || 'currentColor') + '" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + IC[k] + '</svg>' }
  /* Soleil de l'app (SunOrb) : cœur surexposé, bloom, voile, aigrettes inégales, teinte selon l'altitude */
  var SPIKES = [[4, 2.7, 0.14, 0.5], [93, 2.15, 0.12, 0.42], [49, 1.5, 0.10, 0.26], [138, 1.35, 0.09, 0.22], [23, 1.05, 0.07, 0.16], [116, 0.95, 0.07, 0.14]]
  var lerpHex = function (a, b, t) { var p = function (h, i) { return parseInt(h.slice(i, i + 2), 16) }; var c = function (i) { return Math.round(p(a, i) + (p(b, i) - p(a, i)) * t) }; return 'rgb(' + c(1) + ',' + c(3) + ',' + c(5) + ')' }
  var uid = 0
  function sunOrb(intensity, warmth) {
    var id = 'so' + (++uid), Wc = function (a, b) { return lerpHex(a, b, warmth) }, cx = 50, cy = 50, r = 22
    return '<svg viewBox="0 0 100 100"><defs>' +
      '<radialGradient id="' + id + 'c"><stop offset="0%" stop-color="' + Wc('#FFFFFF', '#F3E2A2') + '"/><stop offset="26%" stop-color="' + Wc('#FFFEF9', '#F0D992') + '"/><stop offset="52%" stop-color="' + Wc('#FFF4CE', '#E8C56D') + '" stop-opacity="0.92"/><stop offset="78%" stop-color="' + Wc('#FFE7A2', '#DFB455') + '" stop-opacity="0.38"/><stop offset="100%" stop-color="' + Wc('#FFDE8C', '#D6A33D') + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + 'b"><stop offset="0%" stop-color="' + Wc('#FFF6DA', '#F3E2A2') + '" stop-opacity="0.5"/><stop offset="42%" stop-color="' + Wc('#FFE9AE', '#E8C56D') + '" stop-opacity="0.2"/><stop offset="100%" stop-color="' + Wc('#FFDD92', '#D6A33D') + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + 'a"><stop offset="0%" stop-color="' + Wc('#FFD98F', '#E8C56D') + '" stop-opacity="0.13"/><stop offset="55%" stop-color="' + Wc('#FFCF7E', '#D6A33D') + '" stop-opacity="0.05"/><stop offset="100%" stop-color="' + Wc('#FFC870', '#D6A33D') + '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + id + 's" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="' + Wc('#FFF6D6', '#FFCE96') + '" stop-opacity="0"/><stop offset="18%" stop-color="' + Wc('#FFF9E4', '#FFDCAE') + '" stop-opacity="0.45"/><stop offset="50%" stop-color="' + Wc('#FFFDF4', '#FFEACC') + '" stop-opacity="1"/><stop offset="82%" stop-color="' + Wc('#FFF9E4', '#FFDCAE') + '" stop-opacity="0.45"/><stop offset="100%" stop-color="' + Wc('#FFF6D6', '#FFCE96') + '" stop-opacity="0"/></linearGradient>' +
      '<filter id="' + id + 'f" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="' + (r * 0.055) + '"/></filter></defs><g opacity="' + intensity + '">' +
      '<circle cx="50" cy="50" r="' + (r * 3.1) + '" fill="url(#' + id + 'a)"/><g filter="url(#' + id + 'f)">' + SPIKES.map(function (s) { return '<rect x="' + (cx - r * s[1]) + '" y="' + (cy - r * s[2]) + '" width="' + (2 * r * s[1]) + '" height="' + (2 * r * s[2]) + '" rx="' + (r * s[2]) + '" fill="url(#' + id + 's)" opacity="' + s[3] + '" transform="rotate(' + s[0] + ' 50 50)"/>' }).join('') + '</g>' +
      '<circle cx="50" cy="50" r="' + (r * 1.95) + '" fill="url(#' + id + 'b)"/><circle cx="50" cy="50" r="' + (r * 1.3) + '" fill="url(#' + id + 'c)"/></g></svg>'
  }
  function buildPhone(el, opts) {
    el.innerHTML = '<i class="ph-btn a"></i><i class="ph-btn b"></i><i class="ph-btn c"></i><i class="ph-btn d"></i><div class="ph-s"><div class="ph-island"></div><div class="ph-st"><span class="st-t tab"></span><span>●●● ⌁</span></div><div class="ph-in">' +
      '<div class="ph-top"><span class="ph-ic">' + ic('menu') + '<i class="dot"></i></span><span class="ph-ic h">' + ic('heart') + '</span><img class="ph-logo" src="/assets/brand/aljana-logo-v4.webp" alt=""><span style="width:2.6em"></span><span class="ph-ic">' + ic('locate') + '</span></div>' +
      '<div class="ph-title">' + T.salam + '</div><div class="ph-ctx"><span class="city"></span><span>⌄</span><span class="ph-live tab"></span></div><div class="ph-date"></div>' +
      '<div class="ph-next"><div class="k"><b>' + T.nextP + '</b><span class="cur"></span></div><div class="v"><span class="n"></span><span class="c tab"></span><span class="a"></span></div><div class="ph-bar"><i></i></div></div>' +
      '<div class="ph-hero"><div class="ph-sun"></div><div class="ph-globe"><canvas></canvas></div><canvas class="ph-moonthumb"></canvas>' +
      '<div class="ph-corner l"><small>☀ ' + T.sun + '</small><b class="sv"></b><span class="sd"></span></div><div class="ph-corner r"><small>' + T.moon + ' ☾</small><b class="mv"></b><span class="md"></span></div></div>' +
      '<svg class="ph-arc" viewBox="0 0 320 112"></svg>' +
      '<div class="ph-today"><div>' + ic('moonstar', '#2EC4B6') + '<small>' + T.cresc + '</small><b class="t1"></b><span class="t1s"></span></div><div>' + ic('nav', '#3FC77A') + '<small>' + T.qibla + '</small><b class="t2"></b><span class="t2s"></span></div><div>' + ic('sunset', '#E2B659') + '<small class="t3k"></small><b class="t3"></b></div></div></div>' +
      '<div class="ph-nav">' + [['house', 0], ['clock', 1], ['sparkles', 2], ['moon', 3], ['moonstar', 4], ['nav', 5], ['sun', 6]].map(function (n) { return '<span>' + ic(n[0]) + T.nav[n[1]] + '</span>' }).join('') + '</div></div>'
    var q = function (s) { return el.querySelector(s) }
    var ph = { el: el, opts: opts, q: q, arcKey: '' }
    var cont = q('.ph-globe'), cv = cont.querySelector('canvas')
    try { if (window.ALJ_EARTH) { ph.earth = new window.ALJ_EARTH.EarthScene({ canvas: cv, container: cont, reducedMotion: reduced, getNow: function () { return ph.at || now() } }); ph.earth.setObserver(place.lat, place.lon) } } catch (e) { console.warn('globe', e) }
    return ph
  }
  var DG = LANG === 'ar' ? '٠١٢٣٤٥٦٧٨٩' : LANG === 'fa' ? '۰۱۲۳۴۵۶۷۸۹' : null, dg = function (x) { return DG ? String(x).replace(/\d/g, function (d) { return DG[+d] }) : String(x) }
  function fmtCd(ms) { var s = Math.max(0, Math.floor(ms / 1000)); return dg(pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60)) }
  function updatePhone(ph, at) {
    ph.at = at; var q = ph.q, st = prayerState(at), sun = A.sunAltAz(at, place.lat, place.lon), mo = A.moonAltAz(at, place.lat, place.lon), qb = qibla()
    q('.st-t').textContent = fmtT(at); q('.city').textContent = place.city; q('.ph-live').textContent = (T.live || 'LIVE') + ' ' + fmtT(at, true)
    q('.ph-date').textContent = cap(fmtD(at, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })) + ' · ' + A.fmtHijri(A.hijriCivil({ y: st.c.y, m: st.c.m, d: st.c.d }, place.tz), HJ)
    q('.cur').innerHTML = T.cur + ' : <b>' + T.P[st.cur.key] + '</b>'
    q('.v .n').textContent = T.P[st.next.key]; q('.v .c').textContent = fmtCd(st.next.at - at); q('.v .a').textContent = T.atT ? fill(T.atT, { t: fmtT(st.next.at) }) : T.at + ' ' + fmtT(st.next.at)
    q('.ph-bar i').style.width = (100 * clamp((at - st.cur.at) / (st.next.at - st.cur.at), 0, 1)).toFixed(1) + '%'
    var sv = smooth((sun.alt + 0.833) / 2.833), sw = Math.pow(clamp((45 - sun.alt) / 45.833, 0, 1), 1.35)
    q('.ph-sun').innerHTML = sv > 0 ? sunOrb(sv, sw) : ''
    var mt = q('.ph-moonthumb'); if (mo.alt >= 0) { mt.style.display = ''; var gpx = q('.ph-globe').clientWidth || 160; window.ALJ_MOON.render(mt, Math.round(gpx * 0.19), A.moonOrientation(at, place.lat, place.lon), { gain: 1.05 }) } else mt.style.display = 'none'
    q('.sv').textContent = (sun.alt < 0 ? '−' : '') + num(Math.abs(sun.alt), 1) + '°'; q('.sd').textContent = T.altitude + ' - ' + (T.dirAb ? T.dirAb[Math.round(sun.az / 45) % 8] : T.dir[Math.round(sun.az / 45) % 8].split('-').map(function (w) { return w[0] }).join(''))
    q('.mv').textContent = num(Math.round(mo.illum * 100)) + ' %'; q('.md').textContent = phaseName(mo)
    var cAt = ph.crescAt || at, nc = ph.cresc && ph.crescFor === st.c.d ? ph.cresc : (ph.crescFor = st.c.d, ph.cresc = A.nextCrescentDay(cAt, place, place.tz))
    if (nc) { var same = parts(nc.date).d === st.c.d && parts(nc.date).m === st.c.m, days = Math.round((nc.date - at) / 86400000); q('.t1').textContent = same ? T.tonight : fmtD(nc.date, { day: 'numeric', month: 'short' }); q('.t1s').textContent = same ? T.observable : days <= 1 ? T.tomorrow : fill(T.inDays, { n: num(days) }) }
    q('.t2').textContent = num(qb.b, 1) + '°'; q('.t2s').textContent = qb.dir
    var up = sun.alt >= -0.833; q('.t3k').textContent = up ? T.sunset : T.sunrise; q('.t3').textContent = fmtT(up ? st.tt.sunset : (at < st.tt.sunrise ? st.tt.sunrise : times(addDays(st.c, 1)).sunrise))
    phoneArc(ph, st, at)
  }
  /* frise de l'app (DayArc compacte), sans le Zénith */
  function phoneArc(ph, st, at) { appDayArc(ph.q('.ph-arc'), at, { W: 320, compact: true, rtl: PRTL, font: 'inherit' }) }
  /* le même téléphone dans une autre langue (bloc Langues) : textes, chiffres, calendrier et sens de lecture de cette langue */
  var AR_DG = '٠١٢٣٤٥٦٧٨٩', FA_DG = '۰۱۲۳۴۵۶۷۸۹'
  function withLang(code, fn) {
    var sv = { T: JSON.parse(JSON.stringify(T)), LOC: LOC, HJ: HJ, DG: DG, PRTL: PRTL }, L = code === 'fr' ? null : LX[code]
    var setT = function (o) { Object.keys(T).forEach(function (k) { delete T[k] }); Object.assign(T, o) }
    setT(Object.assign(JSON.parse(JSON.stringify(BASE_T)), L ? JSON.parse(JSON.stringify(L.T)) : {}))
    LOC = L ? L.loc : 'fr-FR'; HJ = L ? L.hijri : 'fr'; DG = code === 'ar' ? AR_DG : code === 'fa' ? FA_DG : null; PRTL = code === 'ar' || code === 'ur' || code === 'fa'
    try { return fn() } finally { setT(sv.T); LOC = sv.LOC; HJ = sv.HJ; DG = sv.DG; PRTL = sv.PRTL }
  }

  /* ---------- frise de la journée : portage fidèle de DayArc (App.jsx), sans le Zénith ----------
     Même géométrie (hauteurs, amplitudes, marges), même dégradé selon l'altitude du Soleil, mêmes lueurs aux passages
     de l'horizon, même silhouette d'horizon, mêmes icônes et libellés alternés, même Soleil vivant (SunOrb) ou point de nuit.
     Seule différence voulue : le Zénith est retiré (décision 2026-10-04, à reporter aussi dans l'app). */
  var AC = { text: '#EAF0FF', green: '#29E0B3', blue: '#2A8CFF', dawn: '#5B87D6', nightDeep: '#173766', nightSoft: '#93AECB' }
  var hexMix = function (a, b, k) { var p = function (h) { return h[0] === '#' ? [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)] : h.match(/[0-9]+/g).slice(0, 3).map(Number) }; var A2 = p(a), B2 = p(b), t = Math.min(1, Math.max(0, k)); return 'rgb(' + A2.map(function (v, i) { return Math.round(v + (B2[i] - v) * t) }).join(',') + ')' }
  var sunPhysColor = function (alt) { var a = Math.max(0, alt); return a <= 35 ? hexMix('#D6A33D', '#E8C56D', a / 35) : hexMix('#E8C56D', '#F3E2A2', Math.min(1, (a - 35) / 35)) }
  var altColor = function (alt) { if (alt >= 0) return sunPhysColor(alt); if (alt >= -12) return hexMix(AC.blue, '#D6A33D', (alt + 12) / 12); return hexMix(AC.nightDeep, AC.blue, (alt + 24) / 12) }
  var TL8 = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha', 'midnight', 'qiyam']
  var TLCOL = { fajr: AC.dawn, sunrise: '#D6A33D', dhuhr: AC.green, asr: AC.green, maghrib: '#D6A33D', isha: hexMix(AC.nightDeep, AC.nightSoft, 0.3), midnight: AC.nightDeep, qiyam: AC.nightSoft }
  var TLICO = { fajr: 'sunrise', sunrise: 'sunrise', dhuhr: 'sun', asr: 'sunrise', maghrib: 'sunset', isha: 'moon', midnight: 'sparkles', qiyam: 'sunrise' }
  var skylineD = function (w, h) { return 'M0 ' + h + ' L0 ' + (h - 14) + ' L18 ' + (h - 14) + ' L22 ' + (h - 22) + ' L30 ' + (h - 22) + ' L32 ' + (h - 14) + ' L58 ' + (h - 14) + ' L70 ' + (h - 18) + ' L86 ' + (h - 18) + ' L92 ' + (h - 12) + ' L118 ' + (h - 12) + ' L126 ' + (h - 20) + ' L146 ' + (h - 20) + ' L152 ' + (h - 30) + ' L158 ' + (h - 44) + ' L162 ' + (h - 56) + ' L164 ' + (h - 58) + ' L166 ' + (h - 56) + ' L170 ' + (h - 44) + ' L176 ' + (h - 30) + ' L182 ' + (h - 20) + ' L204 ' + (h - 20) + ' L210 ' + (h - 14) + ' L228 ' + (h - 14) + ' L236 ' + (h - 26) + ' Q244 ' + (h - 38) + ' 252 ' + (h - 26) + ' L258 ' + (h - 14) + ' L284 ' + (h - 14) + ' L290 ' + (h - 20) + ' L306 ' + (h - 20) + ' L312 ' + (h - 12) + ' L' + w + ' ' + (h - 12) + ' L' + w + ' ' + h + ' Z' }
  var arcUid = 0
  /* o : { W, compact, rtl, font } */
  function appDayArc(svg, at, o) {
    var st = prayerState(at), tt = st.tt, W = o.W, compact = o.compact, rtl = !!o.rtl, gid = 'aa' + (++arcUid)
    var items = TL8.map(function (k) { return tt[k] ? { key: k, time: tt[k] } : null }); if (!items[0] || !items[7]) { svg.innerHTML = ''; return st }
    var H = compact ? 162 : 246, yH = compact ? 58 : 120, ampUp = compact ? 46 : 104, ampDown = compact ? 9 : 16, padX = compact ? 24 : 44
    var t0 = items[0].time.getTime(), t1 = items[7].time.getTime()
    var X = function (ms) { var f = (ms - t0) / (t1 - t0); return padX + (rtl ? 1 - f : f) * (W - 2 * padX) }
    var alt = function (ms) { return A.sunAltAz(new Date(ms), place.lat, place.lon).alt }
    var step = Math.max(5 * 60000, Math.round((t1 - t0) / 110)), samples = []
    for (var ms = t0; ms < t1; ms += step) samples.push({ ms: ms, alt: alt(ms) })
    samples.push({ ms: t1, alt: alt(t1) })
    var altMax = Math.max.apply(null, [1].concat(samples.map(function (s) { return s.alt }))), altMin = Math.min.apply(null, [-1].concat(samples.map(function (s) { return s.alt })))
    var Y = function (a) { return a >= 0 ? yH - (a / altMax) * ampUp : yH + (a / altMin) * ampDown }
    var P = function (m) { return { x: X(m), y: Y(alt(m)) } }
    var pts = samples.map(function (s) { return X(s.ms).toFixed(1) + ',' + Y(s.alt).toFixed(1) }).join(' ')
    var stops = samples.filter(function (_, i) { return i % 3 === 0 || i === samples.length - 1 }).map(function (s) { return { off: ((X(s.ms) / W) * 100).toFixed(1), c: altColor(s.alt) } })
    if (rtl) stops.reverse()
    var crossings = []; samples.forEach(function (smp, i) { if (i > 0) { var p = samples[i - 1]; if ((p.alt >= 0) !== (smp.alt >= 0)) crossings.push(X(p.ms + (p.alt / (p.alt - smp.alt)) * (smp.ms - p.ms))) } })
    var nowMs = at.getTime(), marker = nowMs >= t0 ? P(Math.min(nowMs, t1)) : null, markerAlt = marker ? alt(Math.min(nowMs, t1)) : -90, markerDay = markerAlt >= -0.833
    var mk = Math.min(1, Math.max(0, (markerAlt + 0.833) / 2.833)), markerVis = mk * mk * (3 - 2 * mk), markerWarmth = Math.pow(Math.min(1, Math.max(0, (45 - markerAlt) / 45.833)), 1.35)
    var minLX = compact ? 26 : 40, fsName = compact ? 9.5 : 12, fsTime = compact ? 10.5 : 13, ico = compact ? 11 : 14, sk = compact ? 16 : 22
    var rowY = function (r) { return yH + (compact ? 28 : 34) + r * (compact ? 36 : 44) }
    var nextKey = st.next.key, F = o.font || 'inherit'
    var h = '<defs><linearGradient id="' + gid + '" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="' + W + '" y2="0">' + stops.map(function (s) { return '<stop offset="' + s.off + '%" stop-color="' + s.c + '"/>' }).join('') + '</linearGradient>' +
      '<linearGradient id="' + gid + '-dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,150,60,0.22)"/><stop offset="100%" stop-color="rgba(255,150,60,0)"/></linearGradient>' +
      '<radialGradient id="' + gid + '-horizon" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(255,170,80,0.55)"/><stop offset="55%" stop-color="rgba(255,120,60,0.16)"/><stop offset="100%" stop-color="rgba(255,120,60,0)"/></radialGradient>' +
      '<clipPath id="' + gid + '-below"><rect x="0" y="' + (yH - sk - 8) + '" width="' + W + '" height="' + (2 * sk + 10) + '"/></clipPath>' +
      '<filter id="' + gid + '-blur" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="' + (compact ? 2.2 : 3) + '"/></filter>' +
      '<filter id="' + gid + '-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="' + (compact ? 4 : 6) + '"/></filter></defs>'
    h += '<rect x="0" y="' + yH + '" width="' + W + '" height="' + (sk + 6) + '" fill="url(#' + gid + '-dusk)"/>'
    h += crossings.map(function (cx) { return '<ellipse cx="' + cx + '" cy="' + yH + '" rx="' + (W * 0.2) + '" ry="' + (sk + 8) + '" fill="url(#' + gid + '-horizon)" clip-path="url(#' + gid + '-below)"/>' }).join('')
    h += '<svg x="0" y="' + (yH - sk + 2) + '" width="' + W + '" height="' + sk + '" viewBox="0 0 340 60" preserveAspectRatio="none"><path d="' + skylineD(340, 60) + '" fill="#03070F" opacity="0.98"/></svg>'
    h += '<line x1="0" y1="' + (yH + 0.5) + '" x2="' + W + '" y2="' + (yH + 0.5) + '" stroke="rgba(190,200,240,0.22)" stroke-width="1"/>'
    h += '<polyline points="' + pts + '" fill="none" stroke="url(#' + gid + ')" stroke-width="' + (compact ? 6 : 8) + '" opacity="0.28" stroke-linecap="round" filter="url(#' + gid + '-blur)"/>'
    h += '<polyline points="' + pts + '" fill="none" stroke="url(#' + gid + ')" stroke-width="' + (compact ? 1.8 : 2.2) + '" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>'
    items.forEach(function (it, i) {
      if (!it) return
      var p = P(it.time.getTime()), isNext = nextKey === it.key, past = it.time < at && !isNext, lx = Math.min(W - minLX, Math.max(minLX, p.x)), y0 = rowY(i % 2)
      var col = isNext ? AC.green : TLCOL[it.key], txt = isNext ? AC.green : past ? 'rgba(234,240,255,0.62)' : AC.text
      h += '<g opacity="' + (past && !isNext ? 0.8 : 1) + '"><line x1="' + p.x + '" y1="' + p.y + '" x2="' + lx + '" y2="' + (y0 - 2) + '" stroke="' + col + '" stroke-width="1" stroke-dasharray="1.5 3" opacity="0.38"/>' +
        '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + (compact ? 7 : 9) + '" fill="' + col + '" opacity="0.28" filter="url(#' + gid + '-glow)"/>' +
        '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + (isNext ? (compact ? 4.2 : 5.2) : (compact ? 3 : 3.8)) + '" fill="' + col + '"/>' +
        (isNext ? '<circle class="arc-pulse" cx="' + p.x + '" cy="' + p.y + '" r="' + (compact ? 8 : 10) + '" fill="none" stroke="' + AC.green + '" stroke-width="1.2"/>' : '') +
        '<svg x="' + (lx - ico / 2) + '" y="' + y0 + '" width="' + ico + '" height="' + ico + '" viewBox="0 0 24 24" overflow="visible" fill="none" stroke="' + col + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + IC[TLICO[it.key]] + '</svg>' +
        '<text x="' + lx + '" y="' + (y0 + ico + fsName + 1) + '" text-anchor="middle" font-size="' + fsName + '" font-weight="' + (isNext ? 700 : 600) + '" fill="' + txt + '" font-family=\'' + F + '\'>' + T.P[it.key] + '</text>' +
        '<text x="' + lx + '" y="' + (y0 + ico + fsName + fsTime + 3) + '" text-anchor="middle" font-size="' + fsTime + '" font-weight="700" fill="' + (isNext ? AC.green : txt) + '" font-family=\'' + F + '\' style="font-variant-numeric: tabular-nums">' + fmtT(it.time) + '</text></g>'
    })
    if (marker) {
      if (markerDay && markerVis > 0) { var r = compact ? 8 : 11, sz = 100 * r / 22; h += '<svg x="' + (marker.x - sz / 2) + '" y="' + (marker.y - sz / 2) + '" width="' + sz + '" height="' + sz + '" overflow="visible">' + sunOrb(markerVis, markerWarmth).replace(/^<svg viewBox="0 0 100 100">/, '<svg viewBox="0 0 100 100" width="' + sz + '" height="' + sz + '">') + '</svg>' }
      else h += '<g><circle cx="' + marker.x + '" cy="' + marker.y + '" r="' + (compact ? 13 : 18) + '" fill="rgba(150,168,205,0.28)" filter="url(#' + gid + '-glow)"/><circle cx="' + marker.x + '" cy="' + marker.y + '" r="' + (compact ? 4.2 : 5.5) + '" fill="#dfe4f7"/></g>'
    }
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = h
    return st
  }

  /* ---------- vue 3 : la journée, la Lune, la Qibla ---------- */
  function dayArcBig(at) {
    var M = mobile(), st = appDayArc(document.getElementById('dayarc'), at, { W: M ? 358 : 1000, compact: M, rtl: RTL, font: RTL ? 'inherit' : '"Hanken Grotesk", sans-serif' })
    /* la lumière de la scène suit l'heure : fond de la séquence teinté par le ciel du moment */
    var Pn = window.ALJ_SKY.palette(A.sunAltAz(at, place.lat, place.lon).alt); LIGHT[0] = [Pn[0], Pn[2] + '66']; stageLight()
    return st
  }
  function renderV3(at) {
    var st = dayArcBig(at)
    document.getElementById('np-n').textContent = T.P[st.next.key]; document.getElementById('np-c').textContent = fmtCd(st.next.at - at); document.getElementById('np-a').textContent = fill(T.npAt, { t: fmtT(st.next.at) })
    var sunUp = A.sunAltAz(at, place.lat, place.lon).alt >= -0.833, srToday = st.tt.sunrise > at, sr = srToday ? st.tt.sunrise : times(addDays(st.c, 1)).sunrise, ssToday = st.tt.sunset > at, ss = ssToday ? st.tt.sunset : st.tt.sunset
    document.getElementById('prec').innerHTML = fill(T.prec, { c: place.city, when: srToday ? T.today : T.tomorrowL, r: fmtT(preciseCross(sr, -0.833)), sw: T.today, s: fmtT(preciseCross(ss, -0.833)) })
    var mo = A.moonAltAz(at, place.lat, place.lon), rs = moonEvents(at)
    document.getElementById('mo-n').textContent = T.moN ? fill(T.moN, { ph: phaseName(mo), p: num(Math.round(mo.illum * 100)) }) : phaseName(mo) + ' · ' + num(Math.round(mo.illum * 100)) + ' % éclairée'
    var dirM = T.dirL[Math.round(mo.az / 45) % 8]
    document.getElementById('mo-w').textContent = mo.alt > 0 ? fill(T.moW, { t: fmtT(at), a: num(Math.round(mo.alt)), d: dirM }) : fill(T.moDown, { t: fmtT(at), r: rs.rise ? fmtT(rs.rise.time) : '—' })
    var qb = qibla(); document.getElementById('qb-b').textContent = num(qb.b, 1) + '°'; document.getElementById('qb-p').textContent = fill(T.qbP, { dir: qb.dir, km: num(Math.round(qb.km)) })
    var e = nextEvent(at); if (e) document.getElementById('event').innerHTML = fill(T.event, { e: T.ev[e.key], n: num(e.days), d: fmtD(new Date(Date.UTC(e.c.y, e.c.m - 1, e.c.d, 12)), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }), f: e.f ? T.forecast : '' })
  }
  function moonEvents(at) { /* lever précédent et coucher suivant si la Lune est levée, sinon lever et coucher suivants (balayage 36 h) */
    var t0 = at.getTime(), up = A.moonAltAz(at, place.lat, place.lon).alt + 0.125 > 0, rise = null, set = null, prev = up
    for (var m = 5; m <= 36 * 60 && (!rise || !set); m += 5) { var a = A.moonAltAz(new Date(t0 + (up ? -m : m) * 60000), place.lat, place.lon).alt + 0.125 > 0; if (up && !rise && prev && !a) rise = { time: new Date(t0 - (m - 2.5) * 60000) }; prev = a; if (up && rise) break }
    prev = up; for (var k = 5; k <= 36 * 60; k += 5) { var b = A.moonAltAz(new Date(t0 + k * 60000), place.lat, place.lon).alt + 0.125 > 0; if (!up && !rise && !prev && b) rise = { time: new Date(t0 + (k - 2.5) * 60000) }; if (prev && !b && (up || rise)) { set = { time: new Date(t0 + (k - 2.5) * 60000) }; break } prev = b }
    return { rise: rise, set: set } }
  var EVENTS = [{ key: 'ramadan', m: 9, d: 1, f: true }, { key: 'fitr', m: 10, d: 1, f: true }, { key: 'adha', m: 12, d: 10, f: true }, { key: 'muharram', m: 1, d: 1, f: false }]
  function nextEvent(at) { var c0 = parts(at); for (var i = 0; i <= 400; i++) { var c = A.civilAdd({ y: c0.y, m: c0.m, d: c0.d }, i), h = A.hijriCivil(c, place.tz); for (var j = 0; j < EVENTS.length; j++) if (EVENTS[j].m === h.m && EVENTS[j].d === h.d) return { key: EVENTS[j].key, f: EVENTS[j].f, days: i, c: c } } return null }

  /* ---------- orchestration ---------- */
  var mobile = function () { return window.innerWidth < 900 }
  var s1, s2, ph1, ph2, qGlobe, cres = null, drift = 0
  function heroFrame(at) {
    var mo = A.moonAltAz(at, place.lat, place.lon), M = mobile(), aim = mo.alt > 0 ? mo.az : null
    if (M) { var fov = 62, ppd = window.innerWidth / fov, H = 860, hz = aim != null ? clamp((150 + mo.alt * ppd) / H, 0.26, 0.6) : 0.47; return { fov: fov, hz: hz, H: H, aim: aim, ax: 0.2 } }
    return { fov: 132, hz: 0.82, aim: aim, ax: 0.47 }
  }
  function maghribFrame() { var M = mobile(); return M ? { fov: 34, hz: 0.66, H: 1250, aim: cres ? cres.ev.az : null, ax: 0.5 } : { fov: 50, hz: 0.72, aim: cres ? cres.ev.az : null, ax: RTL ? 0.4 : 0.6 } } /* en arabe et en ourdou, le texte est à droite : le cadre se décale pour que le croissant passe à gauche */
  function drawHero(at, full) {
    var M = mobile(), v = s1.draw(at, heroFrame(at), { labels: !M, minPx: 7, seed: 1.7, drift: drift, drawMoon: full })
    if (v.moon) { var mo = v.moon.m, W = v.W, H = v.H
      lens(s1.sec, at, M ? { cx: W * 0.64, cy: 178, size: 200, from: { x: v.moon.x, y: v.moon.y }, realPx: v.moon.realPx, ash: 0.35, cap: RT[LANG] ? RT[LANG].lens : T.lensH, drawMoon: full, capW: 220, capX: W * 0.64, capY: 178 + 80 }
        : { cx: W * (RTL ? 0.465 : 0.535), cy: H * 0.26, size: 250, from: { x: v.moon.x, y: v.moon.y }, realPx: v.moon.realPx, ash: 0.35, cap: RT[LANG] ? RT[LANG].lens : T.lensH, drawMoon: full, side: true, capX: W * (RTL ? 0.465 : 0.535) + (RTL ? 112 : -112), capY: H * 0.26 - 20 }) }
    return v
  }
  function render() {
    var at = now(), M = mobile(), v1 = drawHero(at, true)
    updatePhone(ph1, at)
    if (RT[LANG]) { var R = RT[LANG]; document.querySelector('[data-t="h1a"]').textContent = R.h1a; document.querySelector('[data-t="h1b"]').textContent = R.h1b; document.querySelector('.lead .d-only').textContent = fill(R.lead, { c: place.city }); document.querySelector('.lead .m-only').textContent = R.leadM
      document.querySelector('.more').textContent = R.more }
    else document.querySelector('.here').textContent = (/^[aeiouyhàâéèêîôûAEIOUYHÉÈÎ]/.test(place.city) ? 'd’' : 'de ') + place.city
    var sun = A.sunAltAz(at, place.lat, place.lon)
    if (RT[LANG]) document.getElementById('proof1').textContent = fill(RT[LANG].proof, { c: place.city, d: new Intl.DateTimeFormat(LOC, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: place.tz }).format(at), n: new Intl.NumberFormat(LOC, { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(Math.abs(sun.alt)) })
    else document.getElementById('proof1').textContent = fill(T.proof, { c: place.city, d: fmtD(at, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + fmtT(at, true), dir: T.dirL[Math.round((((v1.azC % 360) + 360) % 360) / 45) % 8], s: fill(sun.alt >= 0 ? T.above : T.below, { n: num(Math.abs(sun.alt), 1) }) })
    renderV3(at)
    if (ph3) withLang(OL, function () { updatePhone(ph3, at) })
    if (s4 && reduced) drawCiel()
  }
  function drawMaghrib(full) {
    if (!cres) return
    if (!s2) return
    var at = cres.ev.best, M = mobile(), v = s2.draw(at, maghribFrame(), { labels: false, minPx: 9, seed: 4.2, milky: 0, drift: drift, drawMoon: full })
    if (!v.moon) return
    var W = v.W, H = v.H, side = cres.ev.az < cres.ev.sunAz ? T.left : T.right
    var e = cres.ev, look = (e.altTopo < 4 ? T.look.low0 : e.altTopo < 8 ? T.look.low1 : T.look.low2) + fill(e.daz < 12 ? T.look.near : e.daz < 35 ? T.look.bit : T.look.far, { s: side })
    var vals = { look: look, t: fmtT(at), a: num(e.altTopo, 1), z: num(Math.round(e.daz)), side: side, h: num(Math.round(e.ageH)), p: num(Math.round(e.illum * 100)) }
    lens(s2.sec, at, M ? { cx: W * 0.5, cy: 560, size: 260, halo: 0.13, from: { x: v.moon.x, y: v.moon.y }, realPx: v.moon.realPx, ash: 0, cap: T.lensM, vals: vals, look: true, capX: W / 2, capY: v.hzY + 34, drawMoon: full }
      : { cx: W * (RTL ? 0.235 : 0.765), cy: H * 0.36, size: 340, halo: 0.13, from: { x: v.moon.x, y: v.moon.y }, realPx: v.moon.realPx, ash: 0, cap: T.lensM, vals: vals, look: true, side: true, capW: 330, capX: RTL ? W * 0.235 + 140 : W * 0.765 - 140, capY: H * 0.36 - 50, drawMoon: full })
  }
  function renderMaghrib() {
    if (!cres) return
    drawMaghrib(true)
    if (!s2 || !ph2) return
    var at = cres.ev.best; ph2.crescAt = new Date(cres.ev.sunset.getTime() - 60000); updatePhone(ph2, at)
    document.getElementById('v2ans').textContent = fill(T.ans, { d: cap(fmtD(at, { weekday: 'long', day: 'numeric', month: 'long' })), v: T.advTxt[cres.ev.aljanaAdvisory] })
    document.getElementById('tag2').style.display = 'none'; document.getElementById('tagline').style.display = 'none'
  }
  function renderBigMoon(at) { var M = mobile(); window.ALJ_MOON.render(document.getElementById('bigmoon'), M ? Math.min(380, window.innerWidth - 16) : 700, A.moonOrientation(at, place.lat, place.lon), { gain: 1.12, opaque: false, bump: 1.8 }) }
  /* vue 3 : chaque élément devient le centre de la scène à son tour */
  var actIdx = -1, LIGHT = [['#04081F', '#13224A66'], ['#020510', '#0A133099'], ['#030817', '#1A3570aa']]
  function stageLight() { var st = document.querySelector('.stage3'), L = LIGHT[mobile() ? 0 : Math.max(0, actIdx)] || LIGHT[0]; st.style.setProperty('--top', L[0]); st.style.setProperty('--glow', L[1]) }
  /* réglages de présentation appliqués de l'extérieur à la scène de l'app (aucun fichier du moteur modifié) :
     exposition et lumière d'appoint relevées, halo large autour de la route, route révélée de la ville vers la Kaaba */
  var qt = { k: 1, t0: 0, ex0: 0, fill0: 0 }
  function qTubes() { var ov = qGlobe && qGlobe.qiblaOverlay; if (!ov) return []; return ov.group.children.filter(function (o) { return o.geometry && o.geometry.type === 'TubeGeometry' }) }
  function qTune() {
    var tubes = qTubes().filter(function (o) { return !o.userData.aljHalo }); if (tubes.length < 2) return false
    var R = qGlobe.renderer, fill = qGlobe.lights.group.children.filter(function (o) { return o.isHemisphereLight })[0]
    if (!qt.ex0) { qt.ex0 = R.toneMappingExposure; qt.fill0 = fill ? fill.intensity : 0.4 }
    var ov = qGlobe.qiblaOverlay, old = ov.group.children.filter(function (o) { return o.userData.aljHalo }); old.forEach(function (o) { ov.group.remove(o); o.geometry.dispose() })
    var g = tubes[0].geometry, glow = tubes.reduce(function (m, o) { return o.geometry.parameters.radius > m.geometry.parameters.radius ? o : m })
    tubes.forEach(function (o) { if (o !== glow) o.material.opacity = 0.8 })
    ;[[0.016, 0.03], [0.022, 0.024], [0.03, 0.017], [0.04, 0.011], [0.054, 0.007]].forEach(function (h) { var m = new tubes[0].constructor(new g.constructor(g.parameters.path, 128, h[0], 10, false), glow.material.clone()); m.material.opacity = h[1]; m.renderOrder = 1; m.userData.aljHalo = true; ov.group.add(m) }) /* halo doux : trois gaines de plus en plus larges et faibles */
    glow.material.opacity = 0.12
    qt.t0 = performance.now(); qt.k = reduced ? 1 : 0; qApply(); return true
  }
  function qApply() { /* k : 0 → 1, la lumière monte et la route s'allonge depuis la ville */
    var k = qt.k, e = smooth(k), R = qGlobe.renderer, fill = qGlobe.lights.group.children.filter(function (o) { return o.isHemisphereLight })[0]
    R.toneMappingExposure = qt.ex0 * (1.12 + 0.30 * smooth(k * 1.6)); if (fill) fill.intensity = qt.fill0 * (1.4 + 0.9 * smooth(k * 1.6))
    qTubes().forEach(function (o) { var n = o.geometry.index ? o.geometry.index.count : 0; o.geometry.setDrawRange(0, Math.floor(n * e / 6) * 6) })
  }
  function qStart() { if (!qGlobe) return; qGlobe.setObserver(place.lat, place.lon); var tries = 0; (function tryTune() { if (qTune() || ++tries > 60) return; setTimeout(tryTune, 200) })() }
  function seqScroll() {
    var seq = document.getElementById('seq'), acts = document.querySelectorAll('#v3 .act'), rails = document.querySelectorAll('.rail3 i')
    if (mobile()) { acts.forEach(function (a) { a.classList.add('on') }); if (actIdx !== 9) { actIdx = 9; qStart() } return }
    var r = seq.getBoundingClientRect(), span = seq.offsetHeight - window.innerHeight, p = clamp(-r.top / span, 0, 1), i = p < 0.34 ? 0 : p < 0.67 ? 1 : 2
    if (i === actIdx) return
    actIdx = i; acts.forEach(function (a, k) { a.classList.toggle('on', k === i) }); stageLight()
    if (i === 2) qStart() /* la lumière naît de la ville et rejoint la Kaaba */
  }
  /* mouvement naturel : léger glissement du ciel, lumière qui suit l'heure réelle */
  var lastT = 0
  function loop(ts) {
    drift = Math.sin(ts / 38000) * 0.6
    if (qt.k < 1 && qt.t0) { qt.k = Math.min(1, (performance.now() - qt.t0) / 4200); qApply() }
    if (ts - lastT > 120) { lastT = ts
      if (s1.sec.getBoundingClientRect().bottom > 0) drawHero(now(), false)
      var r2 = s2 ? s2.sec.getBoundingClientRect() : { bottom: -1 }; if (r2.bottom > 0 && r2.top < window.innerHeight) drawMaghrib(false)
      if (s4) { var r4 = s4.sec.getBoundingClientRect(); if (r4.bottom > 0 && r4.top < window.innerHeight) drawCiel() } }
    requestAnimationFrame(loop)
  }
  /* ---------- bas de page : le ciel de cette nuit ---------- */
  var s4 = null, ph3 = null, OL = RTL ? 'fr' : 'ar'
  function cielTime(at) {
    if (A.sunAltAz(at, place.lat, place.lon).alt < -15) return { at: at, now: true }
    for (var m = 10; m <= 1440; m += 10) { var t = new Date(at.getTime() + m * 60000); if (A.sunAltAz(t, place.lat, place.lon).alt < -18) return { at: new Date(t.getTime() + 45 * 60000), now: false } }
    return { at: at, now: true }
  }
  function cielFrame(at) {
    var jd = A.jdFromDate(at), aim = place.lat >= 0 ? 180 : 0, best = 9
    ;['venus', 'jupiter', 'mars', 'saturn'].forEach(function (k) { var p = A.planetPos(k, jd); if (p.mag > 1.2 || p.mag >= best) return; var q = A.altAzFromRaDec(jd, p.ra, p.dec, place.lat, place.lon); if (q.alt > 12) { best = p.mag; aim = q.az } })
    return mobile() ? { fov: 74, hz: 0.47, H: 760, aim: aim, ax: 0.5 } : { fov: 118, hz: 0.88, aim: aim, ax: RTL ? 0.47 : 0.53 }
  }
  function drawCiel() {
    if (!s4) return
    var c = cielTime(now()); s4.draw(c.at, cielFrame(c.at), { labels: true, minPx: 7, seed: 2.6, drift: drift })
    document.getElementById('proof4').textContent = c.now ? fill(T.cielNow, { c: place.city, d: fmtD(c.at, { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + fmtT(c.at) }) : fill(T.cielTonight, { c: place.city, t: fmtT(c.at) })
  }
  /* ---------- bas de page : la prochaine éclipse visible d'ici (moteur d'éclipses de l'app) ---------- */
  var ECL = null
  function nextEclipse(at) {
    var E = window.ALJ_ECL; if (!E) return null
    for (var i = 0; i < E.ECLIPSES.length; i++) { var ev = E.ECLIPSES[i]; if (ev.max < at.getTime()) continue
      if (ev.kind === 'solar') { var r = E.localSolarCirc(ev, place.lat, place.lon); if (r.visible && r.obscMax >= 0.02) return { ev: ev, solar: r } }
      else if (ev.type !== 'penumbral') { var lc = E.lunarCirc(ev), l = E.localLunarCirc(lc, place.lat, place.lon); if (l.visible) return { ev: ev, lunar: lc } } }
    return null
  }
  function drawSolar(cv, S, info, total) {
    var dpr = Math.min(2, window.devicePixelRatio || 1), N = Math.round(S * dpr); cv.width = N; cv.height = N; cv.style.width = S + 'px'; cv.style.height = S + 'px'
    var x = cv.getContext('2d'), c = N / 2, R = N * 0.34, k = R / 0.267
    var g = x.createRadialGradient(c, c, R * 0.95, c, c, N * 0.49); g.addColorStop(0, 'rgba(255,220,170,0.16)'); g.addColorStop(1, 'rgba(255,220,170,0)'); x.fillStyle = g; x.fillRect(0, 0, N, N)
    /* disque : assombrissement centre-bord I(μ) = 0,4 + 0,6 μ, teinte d'un filtre solaire photographique */
    var d = x.createRadialGradient(c, c, 0, c, c, R)
    ;[0, 0.3, 0.5, 0.7, 0.82, 0.9, 0.96, 1].forEach(function (f) { var mu = Math.sqrt(Math.max(0, 1 - f * f)), b = 0.4 + 0.6 * mu; d.addColorStop(f, 'rgb(' + Math.round(255 * Math.min(1, b + 0.16)) + ',' + Math.round(244 * Math.min(1, b + 0.04)) + ',' + Math.round(222 * Math.pow(b, 1.4)) + ')') })
    x.save(); x.beginPath(); x.arc(c, c, R, 0, 2 * Math.PI); x.clip(); x.fillStyle = d; x.fillRect(0, 0, N, N)
    var rnd = function (i) { var t = Math.sin(i * 127.1) * 43758.5453; return t - Math.floor(t) }
    for (var i = 0; i < 2600; i++) { var a = rnd(i) * 2 * Math.PI, rr = Math.sqrt(rnd(i + 7)) * R; x.fillStyle = rnd(i + 3) > 0.5 ? 'rgba(255,255,255,0.022)' : 'rgba(140,80,20,0.022)'; x.beginPath(); x.arc(c + Math.cos(a) * rr, c + Math.sin(a) * rr, N * 0.0028, 0, 2 * Math.PI); x.fill() }
    x.restore()
    if (total) { var co = x.createRadialGradient(c, c, R, c, c, R * 2.4); co.addColorStop(0, 'rgba(235,240,255,0.85)'); co.addColorStop(0.25, 'rgba(220,228,255,0.25)'); co.addColorStop(1, 'rgba(220,228,255,0)'); x.globalCompositeOperation = 'destination-over'; x.fillStyle = co; x.fillRect(0, 0, N, N); x.globalCompositeOperation = 'source-over' }
    /* la Lune, à sa vraie place devant le Soleil (haut = zénith, droite = ouest/est du ciel local) */
    x.save(); if (!total) { x.beginPath(); x.arc(c, c, R + 1, 0, 2 * Math.PI); x.clip() } /* à travers le filtre, la Lune n'est visible que devant le Soleil */
    x.fillStyle = '#060B18'; x.beginPath(); x.arc(c + info.mx * k, c - info.my * k, info.rmDeg * k, 0, 2 * Math.PI); x.fill(); x.restore()
  }
  function drawLunar(cv, S, lc, at) {
    var dpr = Math.min(2, window.devicePixelRatio || 1), N = Math.round(S * dpr); cv.width = N; cv.height = N; cv.style.width = S + 'px'; cv.style.height = S + 'px'
    var mc = document.createElement('canvas'), D = Math.round(S * 0.72)
    window.ALJ_MOON.render(mc, D, A.moonOrientation(at, place.lat, place.lon), { gain: 1.1, opaque: true })
    var x = cv.getContext('2d'), c = N / 2, R = mc.width / 2, g = lc.geo
    var sc = document.createElement('canvas'); sc.width = mc.width; sc.height = mc.height; var y = sc.getContext('2d'); y.drawImage(mc, 0, 0)
    var k = R / g.rm, sx = R - g.x * k, sy = R + g.y * k
    y.globalCompositeOperation = 'source-atop'
    var pg = y.createRadialGradient(sx, sy, g.rU * k, sx, sy, g.rP * k); pg.addColorStop(0, 'rgba(0,0,0,0.35)'); pg.addColorStop(1, 'rgba(0,0,0,0)'); y.fillStyle = pg; y.fillRect(0, 0, sc.width, sc.height)
    var ug = y.createRadialGradient(sx, sy, 0, sx, sy, g.rU * k * 1.02); ug.addColorStop(0, 'rgba(70,18,6,0.9)'); ug.addColorStop(0.94, 'rgba(110,32,12,0.82)'); ug.addColorStop(1, 'rgba(110,32,12,0)'); y.fillStyle = ug; y.fillRect(0, 0, sc.width, sc.height)
    x.drawImage(sc, c - sc.width / 2, c - sc.height / 2)
  }
  function renderEclipse() {
    var sec = document.getElementById('v5'); if (!sec) return
    if (!ECL) { sec.hidden = true; return }
    var ev = ECL.ev, M = mobile(), S = M ? 320 : 520, cv = document.getElementById('eclCv'), base = LANG === 'fr' || LANG === 'en' || LANG === 'ar' ? LANG : null
    var dset = function (id, v) { document.getElementById(id).textContent = v || '' }
    if (ECL.solar) { var r = ECL.solar, p = r.peakInfo, tot = r.central && p.total
      drawSolar(cv, S, p, tot)
      dset('eclDate', cap(fmtD(r.peak, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })))
      var dur = r.c2 && r.c3 ? Math.round((r.c3 - r.c2) / 1000) + 30 : 0, durTxt = Math.floor(dur / 60) + ' min ' + pad(dur % 60) + ' s'
      dset('eclWhat', r.central ? fill(tot ? T.eSolarT : T.eSolarA, { c: place.city, t: fmtT(r.peak), dur: dg(durTxt) }) : fill(T.eSolarP, { p: num(Math.round(r.obscMax * 100)), c: place.city, t: fmtT(r.peak) }))
      dset('eclBand', !r.central && ev.type !== 'partial' && base && ev.regions && ev.regions[base] ? fill(ev.type === 'total' ? T.eBand : T.eBandA, { r: ev.regions[base] }) : '')
      dset('eclSafe', T.eSafe); dset('eclCap', T.eFilter + ' · ' + fmtT(r.peak))
    } else { var lc = ECL.lunar
      drawLunar(cv, S, lc, lc.max)
      dset('eclDate', cap(fmtD(lc.max, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })))
      dset('eclWhat', fill(ev.type === 'total' ? T.eLunarT : T.eLunarP, { c: place.city, t: fmtT(lc.max) })); dset('eclBand', ''); dset('eclSafe', ''); dset('eclCap', T.eLunarCap + ' · ' + fmtT(lc.max)) }
  }
  /* ---------- textes du bas tirés des traductions du site (i18n.js) ---------- */
  function basTexts() {
    var t = window.I18N && (window.I18N[CODE] || window.I18N.fr); if (!t) return
    document.querySelectorAll('[data-u]').forEach(function (e) { var u = t.u[+e.dataset.u]; if (u) e.textContent = e.tagName === 'H2' ? u[0] : u[1] })
    var n = document.getElementById('u7names'); if (n && t.sn) n.textContent = t.sn.join(' · ')
  }
  function lazyBas() {
    var on = function (el, fn) { if (!el) return; if (!window.IntersectionObserver) return fn(); var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); fn() } }, { rootMargin: '900px 0px' }); io.observe(el) }
    on(document.getElementById('v4'), function () { s4 = new Scene(document.getElementById('v4')); (s4.stars ? s4.stars.loaded : Promise.resolve()).then(drawCiel) })
    on(document.getElementById('ph3'), function () { var el = document.getElementById('ph3'); el.dir = OL === 'fr' ? 'ltr' : 'rtl'; el.lang = OL
      var go = function () { withLang(OL, function () { ph3 = buildPhone(el, {}); updatePhone(ph3, now()) }) }
      if (OL === 'ar' && LANG !== 'ar') { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap'; document.head.appendChild(l); l.onload = go; l.onerror = go } else go() })
  }
  /* ---------- Compagnon : le jour, le livre, le geste (vraies captures de l'app) ---------- */
  var cmpIdx = -1
  function cmpSet(i) {
    var st = document.querySelector('.cmpx-stage'); if (!st || i === cmpIdx) return
    cmpIdx = i; st.dataset.k = i
    document.querySelectorAll('.cmpx-l').forEach(function (e) { e.classList.toggle('on', +e.dataset.c === i) })
    document.querySelectorAll('.cmpx-step').forEach(function (e) { e.classList.toggle('on', +e.dataset.c === i) })
    var v = document.getElementById('cmpVid'); if (!v) return
    if (i === 2 && !reduced) { try { v.currentTime = 0; var pr = v.play(); if (pr && pr.catch) pr.catch(function () { }) } catch (e) { } }
  }
  function cmpScroll() {
    var seq = document.getElementById('cmpSeq'); if (!seq) return
    if (mobile()) { document.querySelectorAll('.cmpx-step').forEach(function (e) { e.classList.add('on') }); return }
    var r = seq.getBoundingClientRect(), span = seq.offsetHeight - window.innerHeight, p = clamp(-r.top / span, 0, 1)
    cmpSet(p < 0.34 ? 0 : p < 0.67 ? 1 : 2)
  }
  function cmpInit() {
    /* captures de l'app dans la langue de la page (assets/compagnon/<langue>/) */
    var CL = ['fr', 'en-US', 'en-GB', 'ar', 'es', 'de', 'tr', 'id', 'ur', 'fa', 'ru', 'zh', 'hi'].indexOf(CODE) >= 0 ? CODE : 'fr'
    document.querySelectorAll('#compagnon img.cmpx-l, #cmpVid, #cmpVid source').forEach(function (e) { ['src', 'poster'].forEach(function (k) { var v = e.getAttribute('data-' + k); if (v) e.setAttribute(k, v.replace('/compagnon/fr/', '/compagnon/' + CL + '/')) }) })
    var t = T.cmp; if (t) for (var i = 0; i < 3; i++) { var e = document.getElementById('cmpS' + i); if (e) e.textContent = t[i] }
    var v = document.getElementById('cmpVid'), ph = document.getElementById('cmpPh'); if (!v) return
    if (window.IntersectionObserver) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { o.disconnect(); v.preload = 'auto'; try { v.load() } catch (e) { } } }, { rootMargin: '1200px 0px' }).observe(v)
    /* mobile : les trois écrans se suivent dans le même téléphone, au fil du défilement de la scène */
    if (mobile() && window.IntersectionObserver && ph) {
      var k = 0, tm = null, go = function () { cmpSet(k); if (k < 2) tm = setTimeout(function () { k++; go() }, 3400) }
      new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { o.disconnect(); if (reduced) cmpSet(2); else go() } }, { threshold: 0.6 }).observe(ph)
    } else if (mobile()) cmpSet(2)
    window.addEventListener('scroll', cmpScroll, { passive: true }); cmpScroll()
  }
  var hd = document.querySelector('header'), hdS = function () { if (hd) hd.classList.toggle('solid', window.scrollY > 40) }
  window.addEventListener('scroll', hdS, { passive: true }); hdS()
  new MutationObserver(function () { var c = document.documentElement.lang; if (!c || c === CODE) return
    try { sessionStorage.setItem('aljana.scroll', String(window.scrollY)) } catch (e) { /* stockage indisponible */ }
    var u = new URL(location.href); if (u.searchParams.has('lang')) u.searchParams.set('lang', c); location.replace(u.toString()) }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] })
  function start() {
    applySim()
    if (TL) { Object.keys(TL.html).forEach(function (k) { var e = k === 'credit' ? document.querySelector('.credit') : document.querySelector('[data-t="' + k + '"]'); if (e) e.textContent = TL.html[k] }) }
    /* seul le héros est construit tout de suite ; les autres scènes 3D le sont après, une à une (compilation des shaders, textures) */
    s1 = new Scene(document.getElementById('v1')); ph1 = buildPhone(document.getElementById('ph1'), {})
    cres = A.nextCrescentDay(now(), place, place.tz)
    basTexts(); try { ECL = nextEclipse(now()) } catch (e) { console.warn('éclipses', e) }
    Promise.all([starsP, window.ALJ_MOON.ready(), fontP, s1.stars ? s1.stars.loaded : 0]).then(function () { s1.redraw = function () { drawHero(now(), true) }; render(); document.documentElement.dataset.hero = '1' /* le héros est prêt : l'écran de lancement peut s'effacer */
      /* le reste se calcule ensuite, une scène à la fois, pour laisser respirer la page */
      var steps = [function () { s2 = new Scene(document.getElementById('v2')) }, function () { ph2 = buildPhone(document.getElementById('ph2'), {}) }, renderMaghrib, function () { renderBigMoon(now()) }, renderEclipse, function () { try { var qc = document.getElementById('qglobe'); qGlobe = new window.ALJ_EARTH.EarthScene({ canvas: qc.querySelector('canvas'), container: qc, reducedMotion: reduced, qibla: true, getNow: now }); qGlobe.setObserver(place.lat, place.lon) } catch (e) { console.warn('qibla', e) } }, lazyBas, cmpInit, seqScroll], k = 0
      var next = function next() { if (k < steps.length) { try { steps[k++]() } catch (e) { console.warn(e) } setTimeout(next, 30); return } document.documentElement.dataset.ready = '1'
      try { var y = sessionStorage.getItem('aljana.scroll'); if (y) { sessionStorage.removeItem('aljana.scroll'); window.scrollTo(0, +y) } } catch (e) { /* stockage indisponible */ } }
      /* pendant l'écran de lancement, rien de lourd : le fondu reste fluide ; la suite démarre quand il a disparu */
      var sp = document.getElementById('splash'); if (sp && !document.documentElement.classList.contains('nosplash')) { var go = function () { if (go.done) return; go.done = true; next() }; window.addEventListener('aljana:splashgone', go); setTimeout(go, 9500) } else next() })
    window.addEventListener('scroll', seqScroll, { passive: true })
    var phs = document.querySelectorAll('.ph'); if (reduced || !window.IntersectionObserver) phs.forEach(function (e) { e.classList.add('lit') })
    else { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('lit'); io.unobserve(e.target) } }) }, { threshold: 0.2 }); phs.forEach(function (e) { io.observe(e) }) }
    if (!qs.get('still')) { setInterval(render, 1000); requestAnimationFrame(loop) }
    window.addEventListener('resize', function () { actIdx = -1; render(); renderMaghrib(); renderBigMoon(now()); renderEclipse(); drawCiel(); seqScroll() })
  }
  /* lieu par Cloudflare (ville, sans permission) puis démarrage */
  if (qs.get('lat') || qs.get('cap')) start()
  else fetch('/api/place', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null }).then(function (j) { if (j && j.lat != null && (j.city || j.region)) place = { lat: j.lat, lon: j.lon, city: j.city || j.region, tz: j.tz || browserTz }; start() }).catch(start)
})()
