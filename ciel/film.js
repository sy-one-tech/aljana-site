/* aljana : bloc « Sept univers », deux vidéos verticales côte à côte, et lien du héros.
   Spot avec voix (fr 36 s, ar 40 s, wolof 45 s au choix sur la page fr) et film de 42 s (fr, ar, en pour les autres langues).
   Le spot anglais n'existe pas encore : son emplacement reste masqué dans les autres langues tant que SPOT.en est vide.
   Rien n'est téléchargé avant que le visiteur approche du bloc ; lecture automatique son coupé (comme l'exigent les navigateurs)
   quand une vidéo est bien à l'écran, pause quand elle en sort, aucune lecture automatique si les animations sont réduites.
   Ordinateur et tablette (vidéos côte à côte) : seul le spot démarre seul ; le film attend son bouton ou la fin du spot.
   Téléphone (vidéos l'une sous l'autre) : chacune démarre quand elle est à l'écran. Une seule vidéo avec le son à la fois. Le spot finit sur sa propre carte avec les badges des stores : rien n'est ajouté par-dessus.
   Textes : traductions de travail, à faire relire par des locuteurs natifs. */
(function () {
  var sec = document.getElementById('univers')
  if (!sec) return
  var code = (document.documentElement.lang || 'fr').toLowerCase(), two = code.slice(0, 2)
  var FL = two === 'fr' ? 'fr' : two === 'ar' ? 'ar' : 'en'
  /* spots disponibles : langue de la voix → [durée en secondes, version des fichiers] ; en : à ajouter quand le spot anglais sera prêt */
  var SPOT = { fr: [36, '1'], ar: [40, '1'], wo: [45, '1'] }
  var SPOT_FOR = { fr: ['fr', 'wo'], ar: ['ar'], en: SPOT.en ? ['en'] : [] }[FL]
  var FILM_V = '2', FILM_S = 42
  /* chiffres de la page : arabes orientaux en ar, persans en fa, latins ailleurs (ourdou compris, règle du site) */
  function num (n) { var d = two === 'ar' ? '٠١٢٣٤٥٦٧٨٩' : two === 'fa' ? '۰۱۲۳۴۵۶۷۸۹' : null; return d ? String(n).replace(/\d/g, function (c) { return d[c] }) : String(n) }
  /* [lien du héros, légende du film, légende du spot, lire, pause, revoir, activer le son, couper le son, légende du spot en wolof] */
  var S = {
    fr: ['Voir le film ({n} s)', 'Film de {n} secondes', 'Spot de {n} secondes', 'Lire', 'Mettre en pause', 'Revoir', 'Activer le son', 'Couper le son', 'Spot de {n} secondes, en wolof'],
    en: ['Watch the film ({n} s)', '{n}-second film', '{n}-second spot', 'Play', 'Pause', 'Watch again', 'Turn sound on', 'Turn sound off'],
    ar: ['شاهد الفيلم ({n} ثانية)', 'فيلم مدته {n} ثانية', 'إعلان مدته {n} ثانية', 'تشغيل', 'إيقاف مؤقت', 'إعادة المشاهدة', 'تشغيل الصوت', 'كتم الصوت'],
    es: ['Ver el vídeo ({n} s)', 'Vídeo de {n} segundos, en inglés', 'Anuncio de {n} segundos, en inglés', 'Reproducir', 'Pausa', 'Volver a verlo', 'Activar el sonido', 'Silenciar'],
    de: ['Film ansehen ({n} s)', 'Film von {n} Sekunden, auf Englisch', 'Spot von {n} Sekunden, auf Englisch', 'Abspielen', 'Pause', 'Noch einmal ansehen', 'Ton einschalten', 'Ton ausschalten'],
    tr: ['Filmi izleyin ({n} sn)', '{n} saniyelik film, İngilizce', '{n} saniyelik tanıtım, İngilizce', 'Oynat', 'Duraklat', 'Yeniden izle', 'Sesi aç', 'Sesi kapat'],
    id: ['Tonton filmnya ({n} dtk)', 'Film {n} detik, dalam bahasa Inggris', 'Iklan {n} detik, dalam bahasa Inggris', 'Putar', 'Jeda', 'Tonton lagi', 'Nyalakan suara', 'Matikan suara'],
    ur: ['فلم دیکھیں ({n} سیکنڈ)', '{n} سیکنڈ کی فلم، انگریزی میں', '{n} سیکنڈ کا اشتہار، انگریزی میں', 'چلائیں', 'روکیں', 'دوبارہ دیکھیں', 'آواز چلائیں', 'آواز بند کریں'],
    fa: ['تماشای فیلم ({n} ثانیه)', 'فیلم {n} ثانیه‌ای، به انگلیسی', 'آگهی {n} ثانیه‌ای، به انگلیسی', 'پخش', 'توقف', 'تماشای دوباره', 'روشن کردن صدا', 'بستن صدا'],
    ru: ['Смотреть фильм ({n} с)', 'Фильм на {n} секунды, на английском', 'Ролик на {n} секунд, на английском', 'Воспроизвести', 'Пауза', 'Посмотреть снова', 'Включить звук', 'Выключить звук'],
    zh: ['观看短片（{n} 秒）', '{n} 秒短片，英文', '{n} 秒广告，英文', '播放', '暂停', '重新观看', '打开声音', '关闭声音'],
    hi: ['फ़िल्म देखें ({n} सेकंड)', '{n} सेकंड की फ़िल्म, अंग्रेज़ी में', '{n} सेकंड का विज्ञापन, अंग्रेज़ी में', 'चलाएँ', 'रोकें', 'फिर से देखें', 'आवाज़ चालू करें', 'आवाज़ बंद करें']
  }
  var T = S[two] || S.en
  function fill (t, n) { return t.replace('{n}', num(n)) }
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches
  var small = Math.min(screen.width, innerWidth) < 700 || (navigator.connection && navigator.connection.saveData)
  var players = [], wide = window.matchMedia ? matchMedia('(min-width: 641px)') : { matches: true }

  /* un lecteur par figure ; src() rend [affiche, vidéo] selon la taille d'écran */
  function Player (fig, src, label) {
    var v = fig.querySelector('video'), snd = fig.querySelector('.film-snd'), btn = fig.querySelector('.film-play'), bar = fig.querySelector('.film-bar i')
    var cap = fig.querySelector('figcaption'), sndL = snd.querySelector('.snd-l')
    var p = { v: v, loaded: false, inView: false, userPaused: false, wantPlay: false, auto: function () { return true } }
    function state () { var s = v.ended ? 'replay' : v.paused ? 'play' : 'pause'; btn.dataset.s = s; btn.setAttribute('aria-label', s === 'replay' ? T[5] : s === 'play' ? T[3] : T[4]) }
    function sound () { var on = !v.muted; snd.dataset.s = on ? 'on' : 'off'; sndL.textContent = T[6]; snd.setAttribute('aria-label', on ? T[7] : T[6]); snd.setAttribute('aria-pressed', on ? 'true' : 'false') }
    p.load = function () { if (p.loaded) return; p.loaded = true; var f = src(); v.poster = f[0]; v.src = f[1]; v.preload = 'auto' }
    p.play = function () { p.load(); if (v.ended) v.currentTime = 0; var r = v.play(); if (r && r.catch) r.catch(state) }
    /* changement de source (voix du spot) : même lecteur, on repart du début avec le même réglage du son */
    p.swap = function (s2, l2) { src = s2; v.pause(); p.loaded = false; p.load(); p.setLabel(l2); p.userPaused = false; p.play() }
    p.setLabel = function (l) { cap.textContent = l; v.setAttribute('aria-label', 'aljana, ' + l) }
    var raf = 0
    function tick () { if (v.duration) bar.style.transform = 'scaleX(' + (v.currentTime / v.duration) + ')'; raf = v.paused ? 0 : requestAnimationFrame(tick) }
    snd.addEventListener('click', function () {
      v.muted = !v.muted
      /* une seule vidéo avec le son : activer celui-ci coupe les autres */
      if (!v.muted) { players.forEach(function (o) { if (o !== p) o.v.muted = true }); p.userPaused = false; if (v.paused || v.ended) p.play() }
    })
    btn.addEventListener('click', function () { if (v.paused || v.ended) { p.userPaused = false; p.play() } else { p.userPaused = true; v.pause() } })
    v.addEventListener('click', function () { btn.click() })
    ;['play', 'pause', 'ended'].forEach(function (e) { v.addEventListener(e, state) })
    v.addEventListener('volumechange', sound)
    v.addEventListener('play', function () { if (!raf) raf = requestAnimationFrame(tick) })
    v.addEventListener('seeked', tick)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { if (es[0].isIntersecting) p.load() }, { rootMargin: '900px 0px' }).observe(v)
      new IntersectionObserver(function (es) {
        var r = es[0].intersectionRatio; p.inView = r >= 0.55
        if (p.inView && !p.userPaused && !v.ended && (p.wantPlay || (!reduced && p.auto()))) { p.wantPlay = false; p.play() } else if (r < 0.2 && !v.paused) v.pause()
      }, { threshold: [0, 0.2, 0.55, 0.8] }).observe(v)
    } else p.load()
    p.setLabel(label); state(); sound()
    players.push(p)
    return p
  }

  function filmSrc () { var b = 'assets/film/' + FL + '/'; return [b + 'poster.webp?v=' + FILM_V, b + (small ? 'film-540.mp4' : 'film-720.mp4') + '?v=' + FILM_V] }
  function spotSrc (l) { return function () { var b = 'assets/spot/' + l + '/'; return [b + 'poster.webp?v=' + SPOT[l][1], b + (small ? 'spot-540.mp4' : 'spot-720.mp4') + '?v=' + SPOT[l][1]] } }
  function spotLabel (l) { return fill(l === 'wo' ? T[8] : T[2], SPOT[l][0]) }

  var spotFig = sec.querySelector('.vid[data-kind="spot"]'), filmFig = sec.querySelector('.vid[data-kind="film"]')
  /* le spot passe en premier (il porte la voix) : il est déjà avant le film dans la page */
  if (spotFig && SPOT_FOR.length) {
    spotFig.hidden = false
    var spot = Player(spotFig, spotSrc(SPOT_FOR[0]), spotLabel(SPOT_FOR[0]))
    var vc = spotFig.querySelector('.voice')
    if (vc && SPOT_FOR.length > 1) {
      vc.hidden = false; vc.setAttribute('aria-label', 'Langue de la voix')
      vc.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-v]'); if (!b || b.getAttribute('aria-pressed') === 'true') return
        vc.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false') })
        spot.swap(spotSrc(b.dataset.v), spotLabel(b.dataset.v))
      })
    }
  }
  var film = filmFig && Player(filmFig, filmSrc, fill(T[1], FILM_S))
  /* côte à côte : le spot seul en lecture automatique, puis le film prend le relais (avec le son si le spot l'avait) */
  if (spot && film) {
    film.auto = function () { return !wide.matches }
    spot.v.addEventListener('ended', function () {
      if (!wide.matches || !film.inView || film.userPaused || !film.v.paused) return
      if (!spot.v.muted) { spot.v.muted = true; film.v.muted = false }
      film.play()
    })
  }

  var link = document.getElementById('filmLink')
  if (link && film) {
    link.textContent = fill(T[0], FILM_S)
    link.addEventListener('click', function () { film.userPaused = false; film.wantPlay = true; film.load(); if (film.inView) film.play() })
  }
  document.addEventListener('visibilitychange', function () {
    players.forEach(function (p) { if (document.hidden) { if (!p.v.paused) p.v.pause() } else if (p.inView && p.loaded && !p.userPaused && !p.v.ended && !reduced && (p.auto() || p.v.currentTime > 0)) p.play() })
  })
})()
