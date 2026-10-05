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
  var big = window.innerWidth >= 900, CW = big ? 4096 : 2048, HW = big ? 2048 : 1024
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
  function render(canvas, px, state, opts) {
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
  window.ALJ_MOON = { render: render, ready: function () { return loading } }
})()
