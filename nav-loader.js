/* Chargeur stable de la barre Pépites, inclus par les 5 blogs à URL fixe (sans ?v).
   Pour publier un nouveau nav.js : changer V ici seulement (aucun commit dans les blogs).
   Pages sert ce fichier avec max-age=600 : le changement arrive en 10 min au plus. */
(function () {
  var V = 8;
  if (document.getElementById("pepites-nav-js")) return;
  var s = document.createElement("script");
  s.id = "pepites-nav-js";
  s.src = "https://olanlive.github.io/pepites/nav.js?v=" + V;
  s.async = true;
  (document.head || document.documentElement).appendChild(s);
})();
