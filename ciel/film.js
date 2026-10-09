/* aljana · scène « Le film » (bloc des sept univers) et lien du héros.
   Film vertical 42 s, muet, en trois versions : fr, ar, et en pour toutes les autres langues.
   Rien n'est téléchargé avant que le visiteur approche de la scène ; lecture automatique (muette)
   quand la vidéo est bien à l'écran, pause quand elle en sort. Animations réduites : pas de
   lecture automatique, l'image d'aperçu et le bouton lecture suffisent.
   Textes : traductions de travail, à faire relire par des locuteurs natifs. */
(function () {
  var sec = document.getElementById('univers'), v = document.getElementById('filmV')
  if (!sec || !v) return
  var code = (document.documentElement.lang || 'fr').toLowerCase(), two = code.slice(0, 2)
  var FL = two === 'fr' ? 'fr' : two === 'ar' ? 'ar' : 'en', VER = '1'
  var S = {
    fr: ['Voir le film · 42 s', 'Film · 42 s · sans son', 'Lire le film', 'Mettre en pause', 'Revoir le film', 'Film de présentation d’aljana, 42 secondes, sans son'],
    en: ['Watch the film · 42 s', 'Film · 42 s · no sound', 'Play the film', 'Pause', 'Watch again', 'aljana introduction film, 42 seconds, no sound'],
    ar: ['شاهد الفيلم (٤٢ ثانية)', 'فيلم، ٤٢ ثانية، بلا صوت', 'تشغيل الفيلم', 'إيقاف مؤقت', 'إعادة المشاهدة', 'فيلم تعريفي بـ aljana، ٤٢ ثانية، بلا صوت'],
    es: ['Ver el vídeo · 42 s', 'Vídeo · 42 s · sin sonido · en inglés', 'Reproducir el vídeo', 'Pausa', 'Volver a verlo', 'Vídeo de presentación de aljana, 42 segundos, sin sonido, en inglés'],
    de: ['Film ansehen · 42 s', 'Film · 42 s · ohne Ton · auf Englisch', 'Film abspielen', 'Pause', 'Noch einmal ansehen', 'Vorstellungsfilm von aljana, 42 Sekunden, ohne Ton, auf Englisch'],
    tr: ['Filmi izleyin · 42 sn', 'Film · 42 sn · sessiz · İngilizce', 'Filmi oynat', 'Duraklat', 'Yeniden izle', 'aljana tanıtım filmi, 42 saniye, sessiz, İngilizce'],
    id: ['Tonton filmnya · 42 dtk', 'Film · 42 dtk · tanpa suara · bahasa Inggris', 'Putar film', 'Jeda', 'Tonton lagi', 'Film perkenalan aljana, 42 detik, tanpa suara, dalam bahasa Inggris'],
    ur: ['فلم دیکھیں · 42 سیکنڈ', 'فلم · 42 سیکنڈ · بغیر آواز · انگریزی میں', 'فلم چلائیں', 'روکیں', 'دوبارہ دیکھیں', 'aljana کی تعارفی فلم، 42 سیکنڈ، بغیر آواز، انگریزی میں'],
    fa: ['تماشای فیلم (۴۲ ثانیه)', 'فیلم، ۴۲ ثانیه، بی‌صدا، به انگلیسی', 'پخش فیلم', 'توقف', 'تماشای دوباره', 'فیلم معرفی aljana، ۴۲ ثانیه، بی‌صدا، به انگلیسی'],
    ru: ['Смотреть фильм · 42 с', 'Фильм · 42 с · без звука · на английском', 'Воспроизвести фильм', 'Пауза', 'Посмотреть снова', 'Фильм о приложении aljana, 42 секунды, без звука, на английском'],
    zh: ['观看短片 · 42 秒', '短片 · 42 秒 · 无声 · 英文', '播放短片', '暂停', '重新观看', 'aljana 介绍短片，42 秒，无声，英文'],
    hi: ['फ़िल्म देखें · 42 सेकंड', 'फ़िल्म · 42 सेकंड · बिना आवाज़ · अंग्रेज़ी में', 'फ़िल्म चलाएँ', 'रोकें', 'फिर से देखें', 'aljana की परिचय फ़िल्म, 42 सेकंड, बिना आवाज़, अंग्रेज़ी में']
  }
  var T = S[two] || S.en
  var btn = document.getElementById('filmBtn'), bar = sec.querySelector('.film-bar i'), meta = document.getElementById('filmMeta'), link = document.getElementById('filmLink')
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
