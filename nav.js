/* Barre de navigation commune aux blogs Pépites.
   Pour ajouter un blog : ajouter une ligne dans BLOGS. */
(function () {
  "use strict";
  var HOME = "https://olanlive.github.io/pepites/";
  var BLOGS = [
    { name: "3D & VFX",      url: "https://olanlive.github.io/revue-oss-3d/",      color: "#6cb6ff" },
    { name: "Audio & Vidéo", url: "https://olanlive.github.io/revue-audio-video/", color: "#5fd38d" },
    { name: "Outils IT",     url: "https://olanlive.github.io/revue-outils-it/",   color: "#ffb347" },
    { name: "Animation",     url: "https://olanlive.github.io/revue-animation/",   color: "#ffd60a" }
  ];
  var KEY = "pepites-seen";
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function currentBlog() {
    for (var i = 0; i < BLOGS.length; i++) if (location.href.indexOf(BLOGS[i].url) === 0) return BLOGS[i];
    return null;
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
  window.PepitesNav = { BLOGS: BLOGS, checkNew: checkNew };
  function init() {
    if (document.getElementById("pepites-nav")) return;
    if (location.href.indexOf(HOME) === 0) return; /* la PWA a ses propres boutons */
    var here = location.href;
    var css = document.createElement("style");
    css.textContent =
      "#pepites-nav{background:#0f1419;border-bottom:1px solid #2d3a4f;font:600 14px/1.2 system-ui,-apple-system,sans-serif}" +
      "#pepites-nav ul{display:flex;gap:6px;margin:0 auto;padding:6px 8px;list-style:none;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;max-width:1100px}" +
      "#pepites-nav ul::-webkit-scrollbar{display:none}" +
      "#pepites-nav li{flex:none;margin:0;padding:0}" +
      "#pepites-nav a,#pepites-nav span{position:relative;display:inline-flex;align-items:center;min-height:36px;padding:0 12px;border-radius:999px;text-decoration:none;white-space:nowrap;color:#0f1419;border:2px solid transparent}" +
      "#pepites-nav a{opacity:.82}#pepites-nav a:hover,#pepites-nav a:focus-visible{opacity:1}" +
      "#pepites-nav a:focus-visible{outline:2px solid #fff;outline-offset:2px}" +
      "#pepites-nav span[aria-current]{border-color:#fff;box-shadow:0 0 0 2px #0f1419 inset}" +
      "#pepites-nav .pn-new{position:absolute;top:50%;right:4px;width:8px;height:8px;margin:0;padding:0;min-height:0;border:0;border-radius:50%;background:#ff3b4e;box-shadow:none;transform:translateY(-50%);pointer-events:none}" +
      "#pepites-nav .pn-home{background:#1a2332;color:#e6edf3;opacity:1}";
    document.head.appendChild(css);
    var nav = document.createElement("nav");
    nav.id = "pepites-nav";
    nav.setAttribute("aria-label", "Blogs Pépites");
    var ul = document.createElement("ul");
    var li = document.createElement("li"), home = document.createElement("a");
    home.href = HOME; home.className = "pn-home"; home.textContent = "💎";
    home.setAttribute("aria-label", "Page Pépites"); home.title = "Pépites";
    li.appendChild(home); ul.appendChild(li);
    BLOGS.forEach(function (b) {
      var li = document.createElement("li");
      var cur = here.indexOf(b.url) === 0;
      var el = document.createElement(cur ? "span" : "a");
      if (cur) el.setAttribute("aria-current", "page"); else el.href = b.url;
      el.textContent = b.name;
      el.setAttribute("data-blog", b.url);
      el.style.background = b.color;
      li.appendChild(el); ul.appendChild(li);
    });
    nav.appendChild(ul);
    var slot = document.getElementById("pepites-nav-slot");
    if (slot) slot.appendChild(nav); else document.body.insertBefore(nav, document.body.firstChild);
    checkNew(function (b) {
      var el = ul.querySelector('[data-blog="' + b.url + '"]');
      if (!el || el.querySelector(".pn-new")) return;
      var dot = document.createElement("span");
      dot.className = "pn-new"; dot.setAttribute("role", "img"); dot.setAttribute("aria-label", "nouveau"); dot.title = "Nouveau";
      el.appendChild(dot);
    });
    var c = ul.querySelector("[aria-current]");
    if (c && c.scrollIntoView) ul.scrollLeft = c.offsetLeft - 8;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
