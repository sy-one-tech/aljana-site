/* aljana · scène « Le film » (bloc des sept univers) et lien du héros.
   Film vertical 42 s, avec son, en trois versions : fr, ar, et en pour toutes les autres langues.
   Rien n'est téléchargé avant que le visiteur approche de la scène ; lecture automatique (son coupé, comme l'exigent
   les navigateurs) quand la vidéo est bien à l'écran ; un bouton rend le son, pause quand elle en sort. Animations réduites : pas de
   lecture automatique, l'image d'aperçu et le bouton lecture suffisent.
   Textes : traductions de travail, à faire relire par des locuteurs natifs. */
(function () {
  var sec = document.getElementById('univers'), v = document.getElementById('filmV')
  if (!sec || !v) return
  var code = (document.documentElement.lang || 'fr').toLowerCase(), two = code.slice(0, 2)
  var FL = two === 'fr' ? 'fr' : two === 'ar' ? 'ar' : 'en', VER = '2'
  /* [lien, mention, lire, pause, revoir, description, activer le son, couper le son] */
  var S = {
    fr: ['Voir le film (42 s)', 'Film de 42 secondes', 'Lire le film', 'Mettre en pause', 'Revoir le film', 'Film de présentation d’aljana, 42 secondes', 'Activer le son', 'Couper le son'],
    en: ['Watch the film (42 s)', '42-second film', 'Play the film', 'Pause', 'Watch again', 'aljana introduction film, 42 seconds', 'Turn sound on', 'Turn sound off'],
    ar: ['شاهد الفيلم (٤٢ ثانية)', 'فيلم مدته ٤٢ ثانية', 'تشغيل الفيلم', 'إيقاف مؤقت', 'إعادة المشاهدة', 'فيلم تعريفي بـ aljana، مدته ٤٢ ثانية', 'تشغيل الصوت', 'كتم الصوت'],
    es: ['Ver el vídeo (42 s)', 'Vídeo de 42 segundos, en inglés', 'Reproducir el vídeo', 'Pausa', 'Volver a verlo', 'Vídeo de presentación de aljana, 42 segundos, en inglés', 'Activar el sonido', 'Silenciar'],
    de: ['Film ansehen (42 s)', 'Film von 42 Sekunden, auf Englisch', 'Film abspielen', 'Pause', 'Noch einmal ansehen', 'Vorstellungsfilm von aljana, 42 Sekunden, auf Englisch', 'Ton einschalten', 'Ton ausschalten'],
    tr: ['Filmi izleyin (42 sn)', '42 saniyelik film, İngilizce', 'Filmi oynat', 'Duraklat', 'Yeniden izle', 'aljana tanıtım filmi, 42 saniye, İngilizce', 'Sesi aç', 'Sesi kapat'],
    id: ['Tonton filmnya (42 dtk)', 'Film 42 detik, dalam bahasa Inggris', 'Putar film', 'Jeda', 'Tonton lagi', 'Film perkenalan aljana, 42 detik, dalam bahasa Inggris', 'Nyalakan suara', 'Matikan suara'],
    ur: ['فلم دیکھیں (42 سیکنڈ)', '42 سیکنڈ کی فلم، انگریزی میں', 'فلم چلائیں', 'روکیں', 'دوبارہ دیکھیں', 'aljana کی تعارفی فلم، 42 سیکنڈ، انگریزی میں', 'آواز چلائیں', 'آواز بند کریں'],
    fa: ['تماشای فیلم (۴۲ ثانیه)', 'فیلم ۴۲ ثانیه‌ای، به انگلیسی', 'پخش فیلم', 'توقف', 'تماشای دوباره', 'فیلم معرفی aljana، ۴۲ ثانیه، به انگلیسی', 'روشن کردن صدا', 'بستن صدا'],
    ru: ['Смотреть фильм (42 с)', 'Фильм на 42 секунды, на английском', 'Воспроизвести фильм', 'Пауза', 'Посмотреть снова', 'Фильм о приложении aljana, 42 секунды, на английском', 'Включить звук', 'Выключить звук'],
    zh: ['观看短片（42 秒）', '42 秒短片，英文', '播放短片', '暂停', '重新观看', 'aljana 介绍短片，42 秒，英文', '打开声音', '关闭声音'],
    hi: ['फ़िल्म देखें (42 सेकंड)', '42 सेकंड की फ़िल्म, अंग्रेज़ी में', 'फ़िल्म चलाएँ', 'रोकें', 'फिर से देखें', 'aljana की परिचय फ़िल्म, 42 सेकंड, अंग्रेज़ी में', 'आवाज़ चालू करें', 'आवाज़ बंद करें']
  }
  var T = S[two] || S.en
  var snd = document.getElementById('filmSnd'), btn = document.getElementById('filmBtn'), bar = sec.querySelector('.film-bar i'), meta = document.getElementById('filmMeta'), link = document.getElementById('filmLink')
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches
  var small = Math.min(screen.width, innerWidth) < 700 || (navigator.connection && navigator.connection.saveData)
  var base = 'assets/film/' + FL + '/'
  var loaded = false, inView = false, userPaused = false, wantPlay = false

  if (meta) meta.textContent = T[1]
  if (link) link.textContent = T[0]
  v.setAttribute('aria-label', T[5])

  function load () { if (loaded) return; loaded = true; v.poster = base + 'poster.webp?v=' + VER; v.src = base + (small ? 'film-540.mp4' : 'film-720.mp4') + '?v=' + VER; v.preload = 'auto' }
  function state () {
    var s = v.ended ? 'replay' : v.paused ? 'play' : 'pause'
    btn.dataset.s = s; btn.setAttribute('aria-label', s === 'replay' ? T[4] : s === 'play' ? T[2] : T[3])
  }
  /* son : coupé au départ ; le bouton le rend (et relance la lecture si besoin) */
  function sound () { var on = !v.muted; snd.dataset.s = on ? 'on' : 'off'; snd.setAttribute('aria-label', on ? T[7] : T[6]); snd.setAttribute('aria-pressed', on ? 'true' : 'false') }
  if (snd) { snd.addEventListener('click', function () { v.muted = !v.muted; if (!v.muted) { userPaused = false; if (v.paused || v.ended) play() } sound() }); v.addEventListener('volumechange', sound); sound() }
  function play () { load(); if (v.ended) v.currentTime = 0; var p = v.play(); if (p && p.catch) p.catch(function () { state() }) }
  btn.addEventListener('click', function () { if (v.paused || v.ended) { userPaused = false; play() } else { userPaused = true; v.pause() } })
  v.addEventListener('click', function () { btn.click() })
  ;['play', 'pause', 'ended'].forEach(function (e) { v.addEventListener(e, state) })
  /* barre de progression : lissée par requestAnimationFrame pendant la lecture */
  var raf = 0
  function tick () { if (v.duration) bar.style.transform = 'scaleX(' + (v.currentTime / v.duration) + ')'; raf = v.paused ? 0 : requestAnimationFrame(tick) }
  v.addEventListener('play', function () { if (!raf) raf = requestAnimationFrame(tick) })
  v.addEventListener('seeked', tick)

  if (link) link.addEventListener('click', function () { userPaused = false; wantPlay = true; load(); if (inView) play() })

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) load() }, { rootMargin: '900px 0px' }).observe(v)
    new IntersectionObserver(function (es) {
      var r = es[0].intersectionRatio; inView = r >= 0.55
      if (inView && !userPaused && !v.ended && (wantPlay || !reduced)) { wantPlay = false; play() } else if (r < 0.2 && !v.paused) v.pause()
    }, { threshold: [0, 0.2, 0.55, 0.8] }).observe(v)
  } else load()
  document.addEventListener('visibilitychange', function () { if (document.hidden) { if (!v.paused) v.pause() } else if (inView && loaded && !userPaused && !v.ended && !reduced) play() })
  state()
})()
