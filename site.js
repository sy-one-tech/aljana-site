/* Site aljana : langue (détection, mémoire, bascule sans perdre la position), captures synchronisées, boutons selon l'appareil. */
(function () {
  /* APP_URL pointe sur la bêta pour le moment ; à basculer vers https://aljana.app ou le lien de store définitif à la publication. */
  const APP_URL = "https://beta.aljana.app";
  const CONTACT = "contact@aljana.app";

  var LANGS = window.LANGS, I18N = window.I18N, KEY = "aljana.site.lang";
  var FONTS = { ru: "Manrope:wght@400..700", ar: "Noto+Sans+Arabic:wght@400..700", fa: "Vazirmatn:wght@400..700", ur: "Noto+Naskh+Arabic:wght@400..700", hi: "Noto+Sans+Devanagari:wght@400..700", zh: "Noto+Sans+SC:wght@400..700" };
  var SHOTS = ["prieres", "ciel", "lune", "hilal", "qibla", "eclipses"];
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var ua = navigator.userAgent || "", device = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? "ios" : /Android/.test(ua) ? "and" : "open";
  var has = function (c) { return LANGS.some(function (l) { return l.code === c; }); };

  /* Anglais : une langue, deux variantes régionales. Un « en » sans région, ou d'une région non britannique, donne en-US. */
  var UK_STYLE = /^en-(GB|IE|AU|NZ|ZA|IN|SG|MT|HK)$/i;
  function resolve(tag) {
    tag = String(tag || ""); if (has(tag)) return tag;
    if (/^en/i.test(tag)) return UK_STYLE.test(tag) ? "en-GB" : "en-US";
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
    if (!FONTS[code] || $("link[data-font='" + code + "']")) return;
    var l = document.createElement("link"); l.rel = "stylesheet"; l.dataset.font = code; l.href = "https://fonts.googleapis.com/css2?family=" + FONTS[code] + "&display=swap"; document.head.appendChild(l);
  }
  function digits(code, n) {
    var loc = code === "ar" ? "ar-u-nu-arab" : code === "fa" ? "fa-u-nu-arabext" : "en";
    return new Intl.NumberFormat(loc, { minimumIntegerDigits: 2, useGrouping: false }).format(n);
  }
  function label(code, i) { return digits(code, i + 1) + " " + I18N[code].sn[i].toLocaleUpperCase(code); }
  function setShot(img, url) {
    if (img.getAttribute("src") === url) return;
    if (img.complete && img.naturalWidth) { var n = new Image(); n.onload = function () { img.src = url; }; n.src = url; } /* pas de trou pendant la bascule */
    else img.src = url;
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
      var a = document.createElement("article"); a.className = "uni rv" + (i % 2 ? " flip" : "");
      a.innerHTML = '<div class="shot"><div class="crop"><div class="phone"><img data-shot="' + name + '" data-sn="' + (i + 1) + '" alt="" loading="lazy" width="880" height="1912"></div></div></div>' +
        '<div class="txt"><span class="num" data-num="' + (i + 1) + '"></span><h3></h3><p></p><ul><li></li><li></li></ul></div>';
      un.appendChild(a);
    });
    for (var i = 0; i < 4; i++) { var d = document.createElement("div"); d.innerHTML = "<dt></dt><dd></dd>"; ck.appendChild(d); }
    for (var k = 0; k < 3; k++) { var e = document.createElement("div"); e.innerHTML = "<dt></dt><dd></dd>"; $("#cmpList").appendChild(e); }
  }

  function apply(code, keepScroll) {
    var t = I18N[code], L = LANGS.filter(function (l) { return l.code === code; })[0];
    /* ancre de défilement : la section en haut de l'écran doit y rester après le changement de textes */
    var anchor = null, top0 = 0;
    if (keepScroll) { anchor = $$("main > *, .uni").filter(function (el) { return el.getBoundingClientRect().bottom > 80; })[0]; if (anchor) top0 = anchor.getBoundingClientRect().top; }
    loadFont(code);
    var h = document.documentElement; h.lang = code; h.dir = L.rtl ? "rtl" : "ltr";
    document.title = t.title; meta('meta[name="description"]', t.desc);
    meta('meta[property="og:title"]', t.title); meta('meta[property="og:description"]', t.desc); meta('meta[name="twitter:title"]', t.title); meta('meta[name="twitter:description"]', t.desc);
    $$("[data-i]").forEach(function (el) { var v = t[el.dataset.i]; if (v != null) el.textContent = v; });
    $$("[data-cta]").forEach(function (el) { el.textContent = t[device]; });
    $$("[data-app]").forEach(function (el) { el.setAttribute("href", APP_URL); });
    $$("[data-num]").forEach(function (el) { el.textContent = label(code, +el.dataset.num); });
    $$("[data-p]").forEach(function (el) { var p = t[el.dataset.p]; $("b", el).innerHTML = p[0] + "<small>" + p[1] + "</small>"; $("strong", el).textContent = p[2]; $("span", el).textContent = p[3]; });
    $$("#unis .uni").forEach(function (a, i) { var u = t.u[i]; $("h3", a).textContent = u[0]; $("p", a).textContent = u[1]; var li = $$("li", a); li[0].textContent = u[2]; li[1].textContent = u[3]; });
    $$("#cmpList div").forEach(function (d, i) { $("dt", d).textContent = t.cf[i][0]; $("dd", d).textContent = t.cf[i][1]; });
    /* Compagnon : trois écrans dans la langue du site. Index du Mushaf et hadith sont identiques en anglais US et UK (aucune donnée régionale) ; le tasbih affiche la Qibla de la ville, donc une capture par variante. */
    $$("img[data-cmp]").forEach(function (img, i) { var k = img.dataset.cmp, v = k !== "tasbih" && code === "en-US" ? "en-GB" : code; img.alt = "aljana, " + t.cf[k === "mushaf" ? 0 : k === "hadith" ? 1 : 2][0]; setShot(img, "assets/companion/" + v + "/" + (k === "mushaf" ? "mushaf-index" : k) + ".webp"); });
    $$("#checks div").forEach(function (d, i) { $("dt", d).textContent = t.pr[i][0]; $("dd", d).textContent = t.pr[i][1]; });
    /* captures dans la langue du site ; la section Langues montre une autre écriture que celle en cours */
    var other = code === "ar" ? "fr" : "ar";
    $$("img[data-shot]").forEach(function (img) { var lc = img.hasAttribute("data-other") ? other : code; img.alt = "aljana, " + I18N[lc].sn[+img.dataset.sn]; setShot(img, "assets/screens/" + lc + "/" + img.dataset.shot + ".webp"); });
    $("#langFlag").textContent = L.flag; $("#langName").textContent = L.name; $("#langBtn").setAttribute("aria-label", t.pick + " (" + L.name + ")");
    $$(".lang-opt").forEach(function (b) { b.setAttribute("aria-current", b.dataset.lang === code ? "true" : "false"); });
    var c = $("[data-contact]"); if (c && CONTACT) c.setAttribute("href", "mailto:" + CONTACT);
    if (anchor) { var d = anchor.getBoundingClientRect().top - top0; if (d) { h.style.scrollBehavior = "auto"; window.scrollBy(0, d); h.style.scrollBehavior = ""; } }
    try { localStorage.setItem(KEY, code); } catch (e) { /* stockage indisponible */ }
  }

  function menu(open) { $("#langMenu").classList.toggle("open", open); $("#langBtn").setAttribute("aria-expanded", open ? "true" : "false"); }

  build();
  apply(firstLang(), false);
  $("#langBtn").addEventListener("click", function (e) { e.stopPropagation(); menu(!$("#langMenu").classList.contains("open")); });
  document.addEventListener("click", function (e) { var b = e.target.closest(".lang-opt"); if (b) { apply(b.dataset.lang, true); menu(false); return; } if (!e.target.closest(".lang-menu")) menu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { menu(false); $("#langBtn").focus(); } });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    $$(".rv").forEach(function (el) { io.observe(el); });
  } else $$(".rv").forEach(function (el) { el.classList.add("in"); });
})();
