/* Site aljana : langue (détection, mémoire, bascule sans perdre la position), captures synchronisées et chargées à l'approche,
   boutons selon l'appareil, décompte des trois chiffres, orbites du Ciel, ronde des trois écrans du Compagnon. */
(function () {
  /* APP_URL pointe sur la bêta pour le moment ; à basculer vers https://aljana.app ou le lien de store définitif à la publication. */
  const APP_URL = "https://beta.aljana.app";
  const CONTACT = "contact@aljana.app";

  var LANGS = window.LANGS, I18N = window.I18N, KEY = "aljana.site.lang";
  var FONTS = { ru: "Manrope:wght@400..700", ar: "IBM+Plex+Sans+Arabic:wght@400;500;600;700", fa: "Vazirmatn:wght@400..700", ur: "Noto+Naskh+Arabic:wght@400..700", hi: "Noto+Sans+Devanagari:wght@400..700", zh: "Noto+Sans+SC:wght@400..700" };
  var SHOTS = ["prieres", "ciel", "lune", "hilal", "qibla", "eclipses"];
  var CMP = { mushaf: 0, hadith: 1, tasbih: 2 }; /* rang dans I18N[..].cf */
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var ua = navigator.userAgent || "", device = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? "ios" : /Android/.test(ua) ? "and" : "open";
  var has = function (c) { return LANGS.some(function (l) { return l.code === c; }); };
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* Anglais : une langue, deux variantes régionales. Un « en » sans région, ou d'une région non britannique, donne en-US. */
  var UK_STYLE = /^en-(GB|IE|AU|NZ|ZA|IN|SG|MT|HK)$/i;
  function resolve(tag) {
    tag = String(tag || ""); if (has(tag)) return tag;
    if (/^en/i.test(tag)) return UK_STYLE.test(tag) ? "en-GB" : "en-US";
    var c = tag.slice(0, 2).toLowerCase(); return has(c) ? c : null;
  }
  function firstLang() {
    var q = resolve(new URLSearchParams(location.search).get("lang")); if (q) return q;
    try { var s = resolve(localStorage.getItem(KEY)); if (s) return s; } catch (e) { /* stockage indisponible */ }
    var nav = navigator.languages || [navigator.language || "fr"];
    for (var i = 0; i < nav.length; i++) { var r = resolve(nav[i]); if (r) return r; }
    return "en-US";
  }
  function loadFont(code) {
    var spec = FONTS[code], l = $("#aljana-lang-font");
    if (!spec) { if (l) l.remove(); return; }
    var href = "https://fonts.googleapis.com/css2?family=" + spec + "&display=swap";
    if (!l) {
      l = document.createElement("link");
      l.id = "aljana-lang-font";
      l.rel = "stylesheet";
      document.head.appendChild(l);
    }
    if (l.getAttribute("href") !== href) l.setAttribute("href", href);
    l.dataset.font = code;
  }
  function numLocale(code) { return code === "ar" ? "ar-u-nu-arab" : code === "fa" ? "fa-u-nu-arabext" : "en"; }
  function digits(code, n) { return new Intl.NumberFormat(numLocale(code), { minimumIntegerDigits: 2, useGrouping: false }).format(n); }
  function label(code, i) { return digits(code, i + 1) + " " + I18N[code].sn[i]; }
  var shotIO = null;
  function nearViewport(img) {
    var r = img.getBoundingClientRect(), h = window.innerHeight || document.documentElement.clientHeight || 800;
    return r.bottom > -Math.round(h * 0.25) && r.top < Math.round(h * 1.5);
  }
  function loadShot(img) {
    var url = img.dataset.pendingSrc;
    if (!url || img.getAttribute("src") === url) return;
    img.src = url;
  }
  function setShot(img, url, eager) {
    if (img.getAttribute("src") === url) {
      img.dataset.pendingSrc = url;
      if (shotIO) shotIO.unobserve(img);
      return;
    }
    if (img.dataset.pendingSrc === url) return;
    img.dataset.pendingSrc = url;
    img.decoding = "async";
    img.loading = eager ? "eager" : "lazy";
    if (eager || nearViewport(img)) {
      if (shotIO) shotIO.unobserve(img);
      loadShot(img);
    } else if (shotIO) shotIO.observe(img);
    else loadShot(img);
  }
  function initShotObserver() {
    if (!hasIO) return;
    shotIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        shotIO.unobserve(entry.target);
        loadShot(entry.target);
      });
    }, { rootMargin: "500px 0px 500px 0px" });
  }
  function meta(sel, v) { var m = $(sel); if (m) m.setAttribute("content", v); }

  function build() {
    var lm = $("#langMenu"), ch = $("#chips"), un = $("#unis"), ck = $("#checks");
    LANGS.forEach(function (l) {
      [lm, ch].forEach(function (host) {
        var b = document.createElement("button"); b.type = "button"; b.className = "lang-opt"; b.dataset.lang = l.code; b.lang = l.code; b.dir = l.rtl ? "rtl" : "ltr";
        b.innerHTML = '<span class="flag" aria-hidden="true">' + l.flag + "</span><span>" + l.name + "</span>"; host.appendChild(b);
      });
    });
    SHOTS.forEach(function (name, i) {
      var s = document.createElement("section"); s.className = "uni" + (name === "ciel" ? " sky" : "") + (i % 2 ? "" : " flip"); s.id = "u-" + name;
      s.innerHTML = (name === "ciel" ? '<div class="orbits" aria-hidden="true"><div class="orbit" style="--D:820px;--T:150s;--A:250deg"><b></b></div><div class="orbit o2" style="--D:1240px;--T:260s;--A:290deg"><b></b></div></div>' : "") +
        '<div class="wrap"><div class="txt rv"><span class="lbl" data-num="' + (i + 1) + '"></span><h3></h3><p></p><ul><li></li><li></li></ul></div>' +
        '<div class="frame rv rv2"><div class="phone"><img data-shot="' + name + '" data-sn="' + (i + 1) + '" alt="" loading="lazy" decoding="async" width="880" height="1912"></div></div></div>';
      un.appendChild(s);
    });
    for (var i = 0; i < 4; i++) { var d = document.createElement("div"); d.innerHTML = "<dt></dt><dd></dd>"; ck.appendChild(d); }
  }

  /* les trois chiffres : valeur finale écrite telle que la langue la donne ; le décompte ne joue qu'une fois */
  var DUR = { a: 900, b: 1100, c: 1000 }, curCode = "fr";
  function statKind(s) { return s.classList.contains("a") ? "a" : s.classList.contains("b") ? "b" : "c"; }
  function statValue(s) { $(".v", s).textContent = I18N[curCode][s.dataset.p][0]; }
  function runStat(s) {
    if (s.classList.contains("counted")) return; s.classList.add("counted");
    var raw = I18N[curCode][s.dataset.p][0], target = parseInt(raw, 10), v = $(".v", s);
    if (reduced || !(target > 0)) { statValue(s); return; }
    var t0 = null, fmt = new Intl.NumberFormat(/^\d+$/.test(raw) ? "en" : numLocale(curCode), { useGrouping: false });
    requestAnimationFrame(function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / DUR[statKind(s)]);
      if (p < 1) { v.textContent = fmt.format(Math.round((1 - Math.pow(1 - p, 3)) * target)); requestAnimationFrame(step); } else statValue(s); });
  }

  function apply(code, keepScroll) {
    var t = I18N[code], L = LANGS.filter(function (l) { return l.code === code; })[0];
    curCode = code;
    /* ancre de défilement : la section en haut de l'écran doit y rester après le changement de textes */
    var anchor = null, top0 = 0;
    if (keepScroll) { var best = 1e9; $$("main > :not(#unis), .uni").forEach(function (el) { var r = el.getBoundingClientRect(), d = Math.abs(r.top - 80); if (r.bottom > 80 && r.top < innerHeight && d < best) { best = d; anchor = el; } }); if (anchor) top0 = anchor.getBoundingClientRect().top; }
    loadFont(code);
    var h = document.documentElement; h.lang = code; h.dir = L.rtl ? "rtl" : "ltr";
    document.title = t.title; meta('meta[name="description"]', t.desc);
    meta('meta[property="og:title"]', t.title); meta('meta[property="og:description"]', t.desc); meta('meta[name="twitter:title"]', t.title); meta('meta[name="twitter:description"]', t.desc);
    $$("[data-i]").forEach(function (el) { var v = t[el.dataset.i]; el.textContent = v != null ? v : el.dataset.i === "statsLead" ? "" : el.textContent; });
    $$("[data-cta]").forEach(function (el) { el.textContent = t[device]; });
    $$("[data-app]").forEach(function (el) { el.setAttribute("href", APP_URL); });
    $$("[data-num]").forEach(function (el) { el.textContent = label(code, +el.dataset.num); });
    /* chiffres : valeur, unité, puis la légende. Bureau : intitulé + détail. Mobile, sous 20 et 12 : le détail seul (ou sa version courte). */
    $$(".stat[data-p]").forEach(function (s) { var k = s.dataset.p, p = t[k];
      $("small", s).textContent = " " + p[1]; if (s.classList.contains("counted")) statValue(s);
      var d = $(".cap-d", s); d.textContent = ""; if (t[k + "c"]) d.textContent = t[k + "c"]; else { var b = document.createElement("b"); b.textContent = p[2]; d.appendChild(b); d.appendChild(document.createTextNode(p[3])); }
      $(".cap-m", s).textContent = t[k + "m"] || p[3]; });
    $$("#unis .uni").forEach(function (a, i) { var u = t.u[i]; $("h3", a).textContent = u[0]; $("p", a).textContent = u[1]; var li = $$("li", a); li[0].textContent = u[2]; li[1].textContent = u[3]; });
    /* Compagnon : trois écrans dans la langue du site. Index du Mushaf et hadith sont identiques en anglais US et UK (aucune donnée régionale) ; le tasbih affiche la Qibla de la ville, donc une capture par variante. */
    $$("img[data-cmp]").forEach(function (img) { var k = img.dataset.cmp, v = k !== "tasbih" && code === "en-US" ? "en-GB" : code; img.alt = "aljana, " + t.cf[CMP[k]][0]; setShot(img, "assets/companion/" + v + "/" + (k === "mushaf" ? "mushaf-index" : k) + ".webp", false); });
    $$(".cmp2-names span").forEach(function (s) { s.textContent = t.cf[CMP[s.dataset.k]][0]; });
    $$("#checks div").forEach(function (d, i) { $("dt", d).textContent = t.pr[i][0]; $("dd", d).textContent = t.pr[i][1]; });
    /* captures dans la langue du site ; la section Langues montre une autre écriture que celle en cours */
    var other = code === "ar" ? "fr" : "ar";
    $$("img[data-shot]").forEach(function (img) { var lc = img.hasAttribute("data-other") ? other : code; img.alt = "aljana, " + I18N[lc].sn[+img.dataset.sn]; setShot(img, "assets/screens/" + lc + "/" + img.dataset.shot + ".webp", !!img.closest(".hero")); });
    $("#langFlag").textContent = L.flag; $("#langName").textContent = L.name; $("#langBtn").setAttribute("aria-label", t.pick + " (" + L.name + ")");
    $$(".lang-opt").forEach(function (b) { b.setAttribute("aria-current", b.dataset.lang === code ? "true" : "false"); });
    var c = $("[data-contact]"); if (c && CONTACT) c.setAttribute("href", "mailto:" + CONTACT);
    if (NOW) NOW.render();
    /* recalage tout de suite, puis une fois la police de la nouvelle écriture arrivée, tant que le lecteur n'a pas défilé lui-même */
    if (anchor) { var lastY = null, fix = function () { if (lastY !== null && Math.abs(window.scrollY - lastY) > 2) return; var dy = anchor.getBoundingClientRect().top - top0; if (dy) { h.style.scrollBehavior = "auto"; window.scrollBy(0, dy); h.style.scrollBehavior = ""; } lastY = window.scrollY; };
      fix(); if (document.fonts && document.fonts.ready) { setTimeout(function () { document.fonts.ready.then(fix); }, 60); setTimeout(fix, 700); } }
    try { localStorage.setItem(KEY, code); } catch (e) { /* stockage indisponible */ }
  }

  /* « Maintenant, chez vous » : trois valeurs calculées par live.js (moteurs de l'app). La position n'est jamais demandée d'office :
     on ne la lit que si le visiteur l'a déjà accordée, ou s'il touche « Utiliser ma position ». Elle reste dans son navigateur,
     arrondie au centième de degré. Sans position : date hégirienne à la place de la prière, et l'action discrète à la place du ciel. */
  var NOW = (function () {
    var LIVE = window.ALJANA_LIVE, grid = $("#nowGrid"); if (!LIVE || !grid) { var sec = $("#maintenant"); if (sec) sec.hidden = true; return { render: function () {} }; }
    var PKEY = "aljana.site.pos", pos = null, geo = "geolocation" in navigator, denied = false, last = {}, tz;
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (e) { tz = "UTC"; }
    try { var s = JSON.parse(localStorage.getItem(PKEY) || "null"); if (s && isFinite(s.lat) && isFinite(s.lon)) pos = s; } catch (e) { /* stockage indisponible */ }
    function nu(code) { return code === "ar" ? "arab" : code === "fa" ? "arabext" : "latn"; }
    function loc(n, code) { var set = code === "ar" ? "٠١٢٣٤٥٦٧٨٩" : code === "fa" ? "۰۱۲۳۴۵۶۷۸۹" : null; return set ? String(n).replace(/\d/g, function (d) { return set[+d]; }) : String(n); }
    function plural(code, n) { try { return new Intl.PluralRules(code).select(n); } catch (e) { return n === 1 ? "one" : "other"; } }
    function form(forms, code, n) { return (n === 0 && forms.zero) || forms[plural(code, n)] || forms.other || forms.one; }
    /* écrit un gabarit « {p} dans {t} » dans el : {t} et {n} deviennent la valeur mise en avant, le reste du texte simple */
    function fill(el, tpl, vals, key) {
      var sig = tpl + "|" + JSON.stringify(vals); if (last[key] === sig) return; var flip = last[key] != null && vals._flip !== false; last[key] = sig;
      el.textContent = ""; tpl.split(/(\{[a-z]\})/).forEach(function (part) { var m = /^\{([a-z])\}$/.exec(part);
        if (!m) { if (part) el.appendChild(document.createTextNode(part)); return; }
        var k = m[1]; if (k === "t" || k === "n") { var b = document.createElement("b"); b.textContent = vals[k]; if (k === "t") b.className = "t"; else if (flip && !reduced) b.className = "fl"; el.appendChild(b); } else el.appendChild(document.createTextNode(vals[k])); });
    }
    function hms(ms) { var s = Math.max(0, Math.round(ms / 1000)), p = function (x) { return (x < 10 ? "0" : "") + x; }; return p(Math.floor(s / 3600)) + ":" + p(Math.floor(s / 60) % 60) + ":" + p(s % 60); }
    function part(id) { var r = $(id); return { root: r, l: $(".lbl", r), v: $(".now-v", r), s: $(".now-s", r) }; }
    var A = part("#nowA"), B = part("#nowB"), C = part("#nowC"), btn = $("#nowLoc");

    function render() {
      var code = curCode, t = I18N[code], now = new Date(), lang2 = code.slice(0, 2), tag = (/^en/.test(code) ? code : lang2) + "-u-ca-gregory-nu-" + nu(lang2); /* l'anglais garde sa région : 8 February 2027 au Royaume-Uni, February 8, 2027 aux États-Unis */
      /* 1. prochaine prière, sinon date hégirienne */
      var np = pos ? LIVE.nextPrayer(pos.lat, pos.lon, now) : null;
      if (np) { A.l.textContent = t.npL; fill(A.v, t.npT, { p: t.pn[["fajr", "dhuhr", "asr", "maghrib", "isha"].indexOf(np.key)], t: loc(hms(np.at - now), lang2), _flip: false }, "a");
        A.s.textContent = new Intl.DateTimeFormat(tag, { hour: "2-digit", minute: "2-digit" }).format(np.at); $("#nowM").textContent = t.mw; }
      else { A.l.textContent = t.hjL; var hj = LIVE.hijriToday(now, tz, code); if (lang2 === "ur") hj = hj.replace(/[۰-۹]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); }); /* ourdou : chiffres latins, comme le reste du site */ fill(A.v, "{e}", { e: hj }, "a"); A.s.textContent = ""; $("#nowM").textContent = ""; }
      /* 2. astres majeurs levés, sinon l'action « Utiliser ma position » (masquée si le navigateur la refuse) */
      B.l.textContent = t.skL;
      if (pos) { var n = LIVE.skyCount(pos.lat, pos.lon, now).n; B.v.hidden = false; btn.hidden = true; fill(B.v, form(t.sk, lang2, n), { n: loc(n, lang2) }, "b"); B.s.textContent = ""; B.root.hidden = false; }
      else if (geo && !denied) { B.v.hidden = true; btn.hidden = false; btn.textContent = t.loc; B.s.textContent = t.locS; B.root.hidden = false; }
      else B.root.hidden = true;
      /* 3. prochain repère hégirien */
      var ev = LIVE.nextEvent(now, tz);
      if (ev) { var i = ["ramadan", "fitr", "adha", "muharram"].indexOf(ev.key); C.l.textContent = t.evL; C.root.hidden = false;
        if (ev.days === 0) fill(C.v, t.evT, { e: t.en0[i] }, "c"); else fill(C.v, form(t.ev, lang2, ev.days), { n: loc(ev.days, lang2), e: t.en[i] }, "c");
        var d = new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(ev.civil.y, ev.civil.m - 1, ev.civil.d, 12)));
        C.s.textContent = ev.forecast ? d + " (" + t.fc + ")" : d; } else C.root.hidden = true;
      grid.dataset.n = [A, B, C].filter(function (x) { return !x.root.hidden; }).length;
    }
    function setPos(p) { pos = { lat: Math.round(p.coords.latitude * 100) / 100, lon: Math.round(p.coords.longitude * 100) / 100 }; try { localStorage.setItem(PKEY, JSON.stringify(pos)); } catch (e) { /* stockage indisponible */ } render(); }
    function ask() { navigator.geolocation.getCurrentPosition(setPos, function (err) { if (err && err.code === 1) denied = true; render(); }, { maximumAge: 3600000, timeout: 15000 }); }
    btn.addEventListener("click", ask);
    /* position déjà accordée à ce site : lecture silencieuse, aucune fenêtre ne s'ouvre */
    if (!pos && geo && navigator.permissions && navigator.permissions.query) navigator.permissions.query({ name: "geolocation" }).then(function (st) { if (st.state === "granted") ask(); else if (st.state === "denied") { denied = true; render(); } }).catch(function () { /* non pris en charge */ });
    /* une seconde de battement, seulement quand le bloc est à l'écran et l'onglet visible */
    var seen = !hasIO, timer = null;
    function play() { var on = seen && !document.hidden; if (on && !timer) { render(); timer = setInterval(render, 1000); } else if (!on && timer) { clearInterval(timer); timer = null; } }
    if (hasIO) new IntersectionObserver(function (es) { es.forEach(function (x) { seen = x.isIntersecting; play(); }); }, { rootMargin: "200px 0px" }).observe(grid);
    document.addEventListener("visibilitychange", play); play();
    return { render: render };
  })();
  function menu(open) { $("#langMenu").classList.toggle("open", open); $("#langBtn").setAttribute("aria-expanded", open ? "true" : "false"); }

  build();
  initShotObserver();
  apply(firstLang(), false);
  $("#langBtn").addEventListener("click", function (e) { e.stopPropagation(); menu(!$("#langMenu").classList.contains("open")); });
  document.addEventListener("click", function (e) { var b = e.target.closest(".lang-opt"); if (b) { apply(b.dataset.lang, true); menu(false); return; } if (!e.target.closest(".lang-menu")) menu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { menu(false); $("#langBtn").focus(); } });

  if (hasIO) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    $$(".rv").forEach(function (el) { io.observe(el); });
    /* les orbites ne tournent que lorsque le Ciel est à l'écran */
    var sky = $(".uni.sky"); if (sky) new IntersectionObserver(function (es) { es.forEach(function (x) { x.target.classList.toggle("run", x.isIntersecting && !reduced); }); }).observe(sky);
    var sio = new IntersectionObserver(function (es) { es.forEach(function (x) { if (!x.isIntersecting) return; sio.unobserve(x.target);
      setTimeout(function () { runStat(x.target); }, x.target.classList.contains("c") ? 240 : x.target.classList.contains("b") ? 120 : 0); }); }, { threshold: 0.45 });
    $$(".stat").forEach(function (s) { sio.observe(s); });
  } else { $$(".rv").forEach(function (el) { el.classList.add("in"); }); $$(".stat").forEach(runStat); }

  /* Compagnon : Hadith → Mushaf → Tasbih en boucle. L'écran suivant vient devant, celui de devant recule,
     le troisième s'efface puis reparaît de l'autre côté. Tourne seulement quand la section est visible ; figé si mouvement réduit. */
  (function () {
    var stage = $("#cmpStage"); if (!stage) return;
    var ORDER = ["hadith", "mushaf", "tasbih"], cur = 1, timer = null, seen = false;
    function el(k) { return $('.phone[data-k="' + k + '"]', stage); }
    function names() { $$(".cmp2-names span").forEach(function (s) { s.classList.toggle("on", s.dataset.k === ORDER[cur]); }); }
    function step() {
      var front = el(ORDER[cur]), next = el(ORDER[(cur + 1) % 3]), prev = el(ORDER[(cur + 2) % 3]);
      cur = (cur + 1) % 3; names();
      next.dataset.slot = "front"; front.dataset.slot = "prev";
      prev.classList.add("behind");
      setTimeout(function () { prev.classList.add("jump"); prev.dataset.slot = "next"; void prev.offsetWidth; prev.classList.remove("jump"); prev.classList.remove("behind"); }, 320);
    }
    function play(on) { if (on && !timer && !reduced && !document.hidden) timer = setInterval(step, 4500); else if (!on && timer) { clearInterval(timer); timer = null; } }
    if (hasIO) new IntersectionObserver(function (es) { es.forEach(function (x) { seen = x.isIntersecting; play(seen); }); }, { threshold: 0.25 }).observe(stage); else { seen = true; play(true); }
    document.addEventListener("visibilitychange", function () { play(seen && !document.hidden); });
  })();
})();
