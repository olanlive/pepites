/* Barre de navigation commune aux blogs Pépites.
   Pour ajouter un blog : ajouter une ligne dans BLOGS. */
(function () {
  "use strict";
  var HOME = "https://olanlive.github.io/pepites/";
  var BLOGS = [
    { name: "3D & VFX",      name_en: "3D & VFX",      url: "https://olanlive.github.io/revue-oss-3d/",      color: "#6cb6ff" },
    { name: "Animation",     name_en: "Animation",     url: "https://olanlive.github.io/revue-animation/",   color: "#ffd60a" },
    { name: "Audio & Vidéo", name_en: "Audio & Video", url: "https://olanlive.github.io/revue-audio-video/", color: "#5fd38d" },
    { name: "Typo",          name_en: "Typo",          url: "https://olanlive.github.io/revue-typographie/", color: "#c084fc" },
    { name: "Outils IT",     name_en: "IT Tools",      url: "https://olanlive.github.io/revue-outils-it/",   color: "#ffb347" }
  ];
  var KEY = "pepites-seen";
  var LANG_KEY = "pepites-lang";
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function loadLang() {
    try { return localStorage.getItem(LANG_KEY) === "en" ? "en" : "fr"; } catch (e) { return "fr"; }
  }
  function saveLang(v) { try { localStorage.setItem(LANG_KEY, v); } catch (e) {} }
  function pageLang() {
    var l = (document.documentElement.lang || "fr").toLowerCase();
    return l.indexOf("en") === 0 ? "en" : "fr";
  }
  function currentBlog() {
    for (var i = 0; i < BLOGS.length; i++) if (location.href.indexOf(BLOGS[i].url) === 0) return BLOGS[i];
    return null;
  }
  function stripEn(rest) {
    if (rest === "en") return "";
    if (rest.indexOf("en/") === 0) return rest.slice(3);
    if (rest.indexOf("en?") === 0 || rest.indexOf("en#") === 0) return rest.slice(2);
    return rest;
  }
  /* Appelle cb(blog) pour chaque blog avec une pépite plus récente que la dernière vue.
     Le blog courant est marqué comme vu. Toute erreur est ignorée. */
  function checkNew(cb) {
    if (!window.fetch) return;
    var cur = currentBlog();
    BLOGS.forEach(function (b) {
      fetch(b.url + "latest.json", { cache: "no-cache" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d || !d.date) return;
          var seen = load();
          if (b === cur || !seen[b.url]) { seen[b.url] = d.date; save(seen); return; }
          if (d.date > seen[b.url]) cb(b, d);
        })
        .catch(function () {});
    });
  }
  window.PepitesNav = { BLOGS: BLOGS, checkNew: checkNew, loadLang: loadLang };
  function init() {
    if (document.getElementById("pepites-nav")) return;
    if (location.href.indexOf(HOME) === 0) return; /* la PWA a ses propres boutons */
    var here = location.href;
    var lang = pageLang();
    var chosen = loadLang();
    var css = document.createElement("style");
    css.textContent =
      "#pepites-nav{background:#0f1419;border-bottom:1px solid #2d3a4f;font:600 clamp(14px, 2vw, 16px)/1.2 system-ui,-apple-system,sans-serif}" +
      "#pepites-nav ul{display:flex;gap:6px;margin:0 auto;padding:6px 8px;list-style:none;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;max-width:1100px}" +
      "#pepites-nav ul::-webkit-scrollbar{display:none}" +
      /* 💎 et FR/EN hors de la zone qui défile : seule la liste des blogs (li.pn-scroll > ul) défile. */
      "#pepites-nav>ul{overflow:visible}" +
      "#pepites-nav li.pn-scroll{flex:0 1 auto;min-width:0;display:flex}" +
      "#pepites-nav li.pn-scroll>ul{flex:1 1 auto;min-width:0;max-width:none;margin:-6px;padding:6px}" +
      "#pepites-nav li{flex:none;margin:0;padding:0}" +
      "#pepites-nav a,#pepites-nav span,#pepites-nav button.pn-lang{position:relative;display:inline-flex;align-items:center;min-height:2.4em;padding:0 .85em;border-radius:999px;text-decoration:none;white-space:nowrap;color:#0f1419;border:2px solid transparent}" +
      "#pepites-nav a{opacity:.82}#pepites-nav a:hover,#pepites-nav a:focus-visible{opacity:1}" +
      "#pepites-nav a:focus-visible,#pepites-nav button.pn-lang:focus-visible{outline:2px solid #fff;outline-offset:2px}" +
      "#pepites-nav span[aria-current]{border-color:#fff;box-shadow:0 0 0 2px #0f1419 inset}" +
      "#pepites-nav .pn-new{position:absolute;top:-.2em;right:2px;display:block;box-sizing:border-box;width:.8em;height:.8em;min-width:0;min-height:0;margin:0;padding:0;border:0;border-radius:50%;background:#ff2a3c;box-shadow:0 0 0 2px #fff;transform:none;pointer-events:none}" +
      "#pepites-nav .pn-home{background:#1a2332;color:#e6edf3;opacity:1}" +
      "#pepites-nav button.pn-lang{background:#1a2332;color:#e6edf3;opacity:1;font:inherit;font-weight:600;cursor:pointer;-webkit-appearance:none;appearance:none}";
    document.head.appendChild(css);
    var nav = document.createElement("nav");
    nav.id = "pepites-nav";
    nav.setAttribute("aria-label", lang === "en" ? "Gems blogs" : "Blogs Pépites");
    var ul = document.createElement("ul");
    var li = document.createElement("li"), home = document.createElement("a");
    home.href = HOME; home.className = "pn-home"; home.textContent = "💎";
    home.setAttribute("aria-label", lang === "en" ? "Gems page" : "Page Pépites");
    home.title = lang === "en" ? "Gems" : "Pépites";
    li.appendChild(home); ul.appendChild(li);
    var liScroll = document.createElement("li"), track = document.createElement("ul");
    liScroll.className = "pn-scroll"; liScroll.appendChild(track); ul.appendChild(liScroll);
    BLOGS.forEach(function (b) {
      var li = document.createElement("li");
      var cur = here.indexOf(b.url) === 0;
      var el = document.createElement(cur ? "span" : "a");
      if (cur) el.setAttribute("aria-current", "page");
      else el.href = b.url + (chosen === "en" ? "en/" : "");
      el.textContent = lang === "en" ? b.name_en : b.name;
      el.setAttribute("data-blog", b.url);
      el.style.background = b.color;
      li.appendChild(el); track.appendChild(li);
    });
    var liLang = document.createElement("li");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pn-lang";
    btn.textContent = lang === "en" ? "FR" : "EN";
    btn.setAttribute("aria-label", lang === "en" ? "Français" : "English");
    btn.addEventListener("click", function () {
      var next = lang === "en" ? "fr" : "en";
      saveLang(next);
      var cur = currentBlog();
      if (!cur) return;
      var rest = stripEn(location.href.slice(cur.url.length));
      location.href = cur.url + (next === "en" ? "en/" : "") + rest;
    });
    liLang.appendChild(btn); ul.appendChild(liLang);
    nav.appendChild(ul);
    var slot = document.getElementById("pepites-nav-slot");
    if (slot) slot.appendChild(nav); else document.body.insertBefore(nav, document.body.firstChild);
    checkNew(function (b) {
      var el = ul.querySelector('[data-blog="' + b.url + '"]');
      if (!el || el.querySelector(".pn-new")) return;
      var dot = document.createElement("span");
      dot.className = "pn-new"; dot.setAttribute("role", "img");
      dot.setAttribute("aria-label", lang === "en" ? "new" : "nouveau");
      dot.title = lang === "en" ? "New" : "Nouveau";
      el.appendChild(dot);
    });
    var c = track.querySelector("[aria-current]");
    if (c) track.scrollLeft += c.getBoundingClientRect().left - track.getBoundingClientRect().left - 6;
    if (currentBlog()) initTop(lang, nav);
  }
  /* Flèche « retour en haut » : uniquement sur les 5 blogs (pas la PWA, pas olanlive.github.io). */
  function initTop(lang, nav) {
    if (document.getElementById("pepites-top")) return;
    var css = document.createElement("style");
    css.textContent =
      "html #pepites-top{position:fixed;right:calc(14px + env(safe-area-inset-right,0px));bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:9999;box-sizing:border-box;width:44px;height:44px;min-width:44px;min-height:44px;margin:0;padding:0;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#1a2332;color:#e6edf3;border:1px solid #2d3a4f;box-shadow:none;font:inherit;line-height:1;cursor:pointer;-webkit-appearance:none;appearance:none;opacity:0;visibility:hidden;transition:opacity .2s,visibility .2s}" +
      "html #pepites-top.on{opacity:1;visibility:visible}" +
      "html #pepites-top:focus-visible{outline:2px solid #fff;outline-offset:2px}" +
      "html #pepites-top-space{display:block;height:calc(72px + env(safe-area-inset-bottom,0px));margin:0;padding:0}" +
      "html #pepites-top svg{width:20px;height:20px;display:block}" +
      "@media (prefers-reduced-motion:reduce){html #pepites-top{transition:none}}";
    document.head.appendChild(css);
    var b = document.createElement("button");
    b.type = "button"; b.id = "pepites-top";
    b.setAttribute("aria-label", lang === "en" ? "Back to top" : "Retour en haut");
    b.title = lang === "en" ? "Back to top" : "Retour en haut";
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var sp = document.createElement("div");
    sp.id = "pepites-top-space"; sp.setAttribute("aria-hidden", "true"); /* place libre sous le pied de page pour ne rien masquer */
    document.body.appendChild(sp); document.body.appendChild(b);
    var ticking = false;
    function update() { ticking = false; b.classList.toggle("on", (window.scrollY || window.pageYOffset) > window.innerHeight * 0.9); }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
    b.addEventListener("click", function () {
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, left: window.scrollX, behavior: reduce ? "instant" : "smooth" });
      if (nav) { if (!nav.hasAttribute("tabindex")) nav.setAttribute("tabindex", "-1"); try { nav.focus({ preventScroll: true }); } catch (e) { nav.focus(); } }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
