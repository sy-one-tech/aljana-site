/* aljana · prototype v4.2 — Lune texturée.
   Mêmes textures que l'app (public/textures/moon : couleur NASA SVS CGI Moon Kit, relief LOLA) et même
   géométrie que MoonScene.applyState : phase par la fraction éclairée, côté éclairé par limbAngleDeg,
   nord lunaire par northAngleDeg, libration optique. Rendu pixel par pixel (sphère, relief, lumière
   rasante au terminateur, lumière cendrée sur les fins croissants), sans WebGL. */
(function () {
  'use strict'
  var RAD = Math.PI / 180
  var tex = { color: null, height: null, ready: false, wait: [] }
  function loadImg(src) { return new Promise(function (ok, ko) { var i = new Image(); i.decoding = 'async'; i.onload = function () { ok(i) }; i.onerror = ko; i.src = src }) }
  function pixels(img, w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; var x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, w, h); return { w: w, h: h, d: x.getImageData(0, 0, w, h).data } }
  /* V4.2 : CGI Moon Kit de la NASA en définition supérieure (LRO 8k réduit à 4096, relief LOLA 16 px/° réduit à 2048), comme la maquette du film */
  var CW = 2048, HW = 1024 /* 2048 texels de large : plus d'un texel par pixel même pour la grande Lune de 700 px, et quatre fois moins de calcul au démarrage */
  var loading = Promise.all([loadImg('/textures/nasa/moon-color-' + CW + '.jpg?v=1'), loadImg('/textures/nasa/moon-height-' + HW + '.png?v=1')]).then(function (r) {
    tex.color = pixels(r[0], CW, CW / 2); tex.height = pixels(r[1], HW, HW / 2); tex.ready = true
  })
  function sample(t, u, v, ch) { /* bilinéaire, u enroulé, v borné */
    var x = u * t.w - 0.5, y = Math.min(t.h - 1.001, Math.max(0, v * t.h - 0.5)), x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0
    var xa = ((x0 % t.w) + t.w) % t.w, xb = (xa + 1) % t.w, ya = y0, yb = Math.min(t.h - 1, y0 + 1), d = t.d
    var i00 = (ya * t.w + xa) * 4 + ch, i10 = (ya * t.w + xb) * 4 + ch, i01 = (yb * t.w + xa) * 4 + ch, i11 = (yb * t.w + xb) * 4 + ch
    return (d[i00] * (1 - fx) + d[i10] * fx) * (1 - fy) + (d[i01] * (1 - fx) + d[i11] * fx) * fy
  }
  /* state : { illum, limbAngleDeg, northAngleDeg, librationLonDeg, librationLatDeg } (ephemeris.moonOrientation) */
  function renderSelf(canvas, px, state, opts) {
    opts = opts || {}
    if (!tex.ready) { loading.then(function () { render(canvas, px, state, opts) }); return false }
    var dpr = Math.min(2, window.devicePixelRatio || 1), N0 = Math.max(8, Math.round(px * dpr)), ss = N0 < 64 ? Math.ceil(96 / N0) : 1, N = N0 * ss
    canvas.width = N0; canvas.height = N0; canvas.style.width = px + 'px'; canvas.style.height = px + 'px'
    /* petite Lune (taille réelle dans le ciel) : calcul suréchantillonné puis réduit, pour un fin croissant net */
    var tgt = ss > 1 ? document.createElement('canvas') : canvas; if (ss > 1) { tgt.width = N; tgt.height = N }
    var ctx = tgt.getContext('2d'), img = ctx.createImageData(N, N), out = img.data
    var pa = Math.acos(Math.max(-1, Math.min(1, 2 * state.illum - 1))), limb = state.limbAngleDeg * RAD
    var Sx = Math.cos(limb) * Math.sin(pa), Sy = -Math.sin(limb) * Math.sin(pa), Sz = Math.cos(pa)
    /* rotations inverses de MoonScene : spin (z, −nord), latitude (x), base (y, −π/2 − lon) */
    var c = -state.northAngleDeg * RAD, b = (state.librationLatDeg || 0) * RAD, a = -Math.PI / 2 - (state.librationLonDeg || 0) * RAD
    var cc = Math.cos(-c), sc = Math.sin(-c), cb = Math.cos(-b), sb = Math.sin(-b), ca = Math.cos(-a), sa = Math.sin(-a)
    var thin = Math.max(0, 1 - state.illum / 0.35), es = 0.045 * Math.pow(thin, 1.6) + (opts.earthshine || 0)
    var H = new Float32Array(N * N), A = new Float32Array(N * N * 3), M = new Uint8Array(N * N), R = N / 2, gain = (opts.gain || 1.12) * (1 + 1.6 * Math.pow(Math.max(0, 1 - state.illum / 0.5), 2))
    for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
      var x = (i + 0.5 - R) / R, y = (R - j - 0.5) / R, rr = x * x + y * y
      if (rr > 1.0) continue
      var z = Math.sqrt(1 - rr), k = j * N + i
      var X = x * cc - y * sc, Y = x * sc + y * cc, Z = z           /* défaire le spin */
      var Y2 = Y * cb - Z * sb, Z2 = Y * sb + Z * cb; Y = Y2; Z = Z2 /* défaire la latitude */
      var X2 = X * ca + Z * sa, Z3 = -X * sa + Z * ca; X = X2; Z = Z3 /* défaire la base */
      var th = Math.acos(Math.max(-1, Math.min(1, Y))), ph = Math.atan2(Z, -X); if (ph < 0) ph += 2 * Math.PI
      var u = ph / (2 * Math.PI), v = th / Math.PI
      H[k] = sample(tex.height, u, v, 0) / 255
      A[k * 3] = sample(tex.color, u, v, 0) / 255; A[k * 3 + 1] = sample(tex.color, u, v, 1) / 255; A[k * 3 + 2] = sample(tex.color, u, v, 2) / 255
      M[k] = 1
    }
    var bump = (opts.bump == null ? 1.6 : opts.bump) * N / 260
    for (var j2 = 0; j2 < N; j2++) for (var i2 = 0; i2 < N; i2++) {
      var k2 = j2 * N + i2; if (!M[k2]) continue
      var x2 = (i2 + 0.5 - R) / R, y2 = (R - j2 - 0.5) / R, rr2 = x2 * x2 + y2 * y2, z2 = Math.sqrt(Math.max(0, 1 - rr2))
      var hl = M[k2 - 1] ? H[k2 - 1] : H[k2], hr = M[k2 + 1] ? H[k2 + 1] : H[k2], hu = j2 > 0 && M[k2 - N] ? H[k2 - N] : H[k2], hd = j2 < N - 1 && M[k2 + N] ? H[k2 + N] : H[k2]
      var nx = x2 - (hr - hl) * bump, ny = y2 + (hd - hu) * bump, nz = z2, nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl
      var mu0 = nx * Sx + ny * Sy + nz * Sz, mu0g = x2 * Sx + y2 * Sy + z2 * Sz, mu = Math.max(0.02, z2)
      /* près du terminateur, le relief n'agit qu'à moitié : la ligne reste irrégulière (cratères) sans dents de scie */
      var tb = Math.min(1, Math.max(0, mu0g / 0.3)); mu0 = mu0g + (mu0 - mu0g) * (0.4 + 0.6 * tb)
      var lit = mu0 > 0 ? (0.62 * 2 * mu0 / (mu0 + mu) + 0.38 * mu0) : 0  /* Lommel-Seeliger + Lambert : pleine lune peu assombrie au bord */
      lit *= Math.min(1, Math.max(0, (mu0g + 0.025) / 0.09))               /* passage jour-nuit progressif ; le relief ne déborde pas dans la nuit lunaire */
      var e = mu0g < 0.08 ? es * (0.55 + 0.45 * mu) : 0
      var o = k2 * 4
      for (var ch = 0; ch < 3; ch++) {
        var al = Math.pow(A[k2 * 3 + ch], 2.2), tint = ch === 2 ? 1.08 : ch === 0 ? 0.94 : 1
        var lin = al * (lit * gain) + al * e * tint
        out[o + ch] = Math.min(255, Math.round(255 * Math.pow(lin, 1 / 2.2)))
      }
      var edge = Math.min(1, (1 - Math.sqrt(rr2)) * R * 1.4), lum = Math.max(out[o], out[o + 1], out[o + 2]) / 255
      var dayK = Math.min(1, Math.max(0, (mu0g + 0.025) / 0.09)) /* opacité selon la géométrie : les ombres des cratères restent sombres, sans trous de ciel */
      var deep = Math.min(1, Math.max(0, (mu0g - 0.04) / 0.14)) /* loin du terminateur : opaque (ombres de cratères sombres) ; près : fondu selon la lumière, sans liseré noir */
      var op = opts.opaque ? 1 : Math.max(dayK * Math.max(deep, Math.min(1, lum * 4)), Math.min(1, lum * 3.2) * (opts.ash == null ? 1 : opts.ash))
      out[o + 3] = Math.round(255 * Math.max(0, edge) * op)
    }
    ctx.putImageData(img, 0, 0)
    if (ss > 1) { var c2 = canvas.getContext('2d'); c2.clearRect(0, 0, N0, N0); c2.imageSmoothingQuality = 'high'; c2.drawImage(tgt, 0, 0, N0, N0) }
    return true
  }
  /* ---------- Lune agrandie : image NASA SVS de l'heure ----------
     NASA Scientific Visualization Studio, « Moon Phase and Libration » (une image par heure et par an, calculée à partir
     des mesures de LRO, avec la lumière cendrée). Servie par le site (/svs/moon/<année>/<n>.jpg, mise en cache), puis :
     tournée pour que le côté éclairé pointe vers le vrai Soleil du visiteur, rougie et adoucie près de l'horizon
     (masse d'air), lumière cendrée effacée tant que le crépuscule est clair. Année non publiée : rendu maison. */
  var SVS_YEARS = { 2026: 1 }
  var frames = {}
  function svsFrame (at) {
    var y = at.getUTCFullYear(); if (!SVS_YEARS[y]) return null
    var n = Math.round((at.getTime() - Date.UTC(y, 0, 1)) / 3600000) + 1, max = (y % 4 === 0 ? 366 : 365) * 24
    return n >= 1 && n <= max ? { y: y, n: n } : null
  }
  function loadFrame (f) {
    var key = f.y + '/' + f.n
    if (!frames[key]) frames[key] = loadImg('/svs/moon/' + key + '.jpg').then(function (img) {
      /* disque (centre, rayon) et direction du côté éclairé, mesurés sur l'image */
      var W = img.naturalWidth, Hh = img.naturalHeight, c = document.createElement('canvas'); c.width = W; c.height = Hh
      var x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0); var d = x.getImageData(0, 0, W, Hh).data
      var x0 = W, x1 = 0, y0 = Hh, y1 = 0, mx = 0
      for (var j = 0; j < Hh; j++) for (var i = 0; i < W; i++) { var o = (j * W + i) * 4, v = Math.max(d[o], d[o + 1], d[o + 2]); if (v > mx) mx = v; if (v > 7) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (j < y0) y0 = j; if (j > y1) y1 = j } }
      var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, r = Math.max(x1 - x0, y1 - y0) / 2, sx = 0, sy = 0, sw = 0, thr = mx * 0.45
      for (var j2 = 0; j2 < Hh; j2 += 2) for (var i2 = 0; i2 < W; i2 += 2) { var o2 = (j2 * W + i2) * 4, v2 = (d[o2] + d[o2 + 1] + d[o2 + 2]) / 3; if (v2 > thr) { sx += (i2 - cx) * v2; sy += (j2 - cy) * v2; sw += v2 } }
      return { img: img, cx: cx, cy: cy, r: r, theta: sw ? Math.atan2(sy, sx) : 0 }
    }).catch(function () { frames[key] = null; return null })
    return frames[key]
  }
  function renderNASA (canvas, px, state, opts, fr) {
    var dpr = Math.min(2, window.devicePixelRatio || 1), N = Math.max(8, Math.round(px * dpr))
    canvas.width = N; canvas.height = N; canvas.style.width = px + 'px'; canvas.style.height = px + 'px'
    var ctx = canvas.getContext('2d'), s = (N / 2) / fr.r
    /* masse d'air (Kasten et Young) : près de l'horizon, la Lune jaunit, s'assombrit et tremble légèrement */
    var alt = opts.alt, X = alt == null ? 1 : 1 / (Math.sin(Math.max(0.5, alt) * RAD) + 0.50572 * Math.pow(Math.max(0.5, alt) + 6.07995, -1.6364))
    var k = [0.10, 0.17, 0.29], T = k.map(function (kk) { return Math.pow(10, -0.4 * kk * (X - 1) * 0.24) }), tm = Math.max(T[0], 1e-3)
    var tint = [1, T[1] / tm, T[2] / tm]
    ctx.save(); ctx.clearRect(0, 0, N, N)
    var seeing = Math.min(0.55, Math.max(0, (X - 3) * 0.035)) * dpr
    if (seeing > 0.05) ctx.filter = 'blur(' + seeing.toFixed(2) + 'px)'
    ctx.translate(N / 2, N / 2); ctx.rotate(state.limbAngleDeg * RAD - fr.theta); ctx.scale(s, s); ctx.drawImage(fr.img, -fr.cx, -fr.cy)
    ctx.restore()
    /* lumière cendrée : invisible dans un crépuscule clair, de plus en plus nette quand la nuit tombe */
    var es = (opts.sunAlt == null ? 0.75 : Math.min(1, Math.max(0.04, (-opts.sunAlt - 6) / 10))) * Math.min(1, Math.max(0, 1 - state.illum / 0.4)) /* lumière cendrée : seulement sur les croissants */, thinK = Math.max(0, 1 - state.illum / 0.3), gain = 0.88 + 0.5 * thinK /* lumière de la NASA telle quelle ; seul un fin croissant, noyé dans le crépuscule, est rehaussé */
    var img = ctx.getImageData(0, 0, N, N), d = img.data, R = N / 2
    for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
      var o = (j * N + i) * 4, dx = (i + 0.5 - R) / R, dy = (j + 0.5 - R) / R, rr = dx * dx + dy * dy
      if (rr > 1) { d[o + 3] = 0; continue }
      var v = Math.max(d[o], d[o + 1], d[o + 2]) / 255, w = es + (1 - es) * Math.min(1, Math.max(0, (v - 0.10) / 0.22))
      /* lumière ajoutée au ciel : la partie sombre reste transparente, comme dans la réalité (alpha = intensité, couleur dé-prémultipliée) */
      var cr = Math.max(0, d[o] - 5) * w * tint[0] * gain, cg = Math.max(0, d[o + 1] - 5) * w * tint[1] * gain, cb = Math.max(0, d[o + 2] - 5) * w * tint[2] * gain /* point noir : le fond de l'image NASA ne voile pas le ciel */
      var a = Math.min(1, Math.max(cr, cg, cb) / 255 * (1 + 0.15 * thinK)), edge = Math.min(1, (1 - Math.sqrt(rr)) * R * 1.2)
      if (a < 0.004) { d[o + 3] = 0; continue }
      d[o] = Math.min(255, Math.round(cr / a)); d[o + 1] = Math.min(255, Math.round(cg / a)); d[o + 2] = Math.min(255, Math.round(cb / a)); d[o + 3] = Math.round(255 * a * edge)
    }
    ctx.putImageData(img, 0, 0)
    /* halo atmosphérique discret autour du croissant */
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.16; ctx.filter = 'blur(' + Math.max(2, N * 0.012).toFixed(1) + 'px)'; ctx.drawImage(canvas, 0, 0); ctx.restore()
    return true
  }
  /* opts.nasa + opts.at : image NASA de l'heure si l'année est publiée (rendu maison en attendant le chargement) */
  function render (canvas, px, state, opts) {
    opts = opts || {}
    var f = opts.nasa && opts.at ? svsFrame(opts.at) : null
    if (!f) return renderSelf(canvas, px, state, opts)
    var key = f.y + '/' + f.n, p = loadFrame(f)
    canvas.dataset.moonKey = key
    p && p.then(function (fr) { if (canvas.dataset.moonKey !== key) return; if (fr) renderNASA(canvas, px, state, opts, fr); else renderSelf(canvas, px, state, opts) })
    if (!canvas.dataset.nasaShown) renderSelf(canvas, px, state, opts)
    p && p.then(function (fr) { if (fr) canvas.dataset.nasaShown = '1' })
    return true
  }
  window.ALJ_MOON = { render: render, ready: function () { return loading } }
})()
