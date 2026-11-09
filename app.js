/* Fare Gaz v3 — commande de bouteilles de gaz à domicile (démonstration).
   Nouveautés v3 : mode simple pour les matahiapo (une question par écran),
   écran de confirmation, point GPS réutilisé, erreurs sous les champs,
   en-tête compact, bouton Commander fixe avec le total.
   Les données sont gardées dans le navigateur (localStorage).
   Pour une vraie mise en service, remplacer « Store » par une base partagée (ex. Supabase). */
(() => {
  "use strict";
  const CFG = window.FARE_GAZ_CONFIG;
  const TXT = window.FARE_GAZ_TEXTES;

  // ================================================================ Stockage
  const CLES = {
    commandes: "faregaz.commandes", rappels: "faregaz.rappels", reglages: "faregaz.reglages",
    client: "faregaz.client", mes: "faregaz.mesCommandes", prefs: "faregaz.preferences"
  };
  const lire = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage plein ou bloqué */ } };

  const Store = {
    commandes: () => lire(CLES.commandes, []),
    enregistrer(l) { ecrire(CLES.commandes, l); },
    ajouter(c) { const l = Store.commandes(); l.push(c); Store.enregistrer(l); },
    modifier(id, ch) { const l = Store.commandes(); const c = l.find(x => x.id === id); if (c) { Object.assign(c, ch); Store.enregistrer(l); } return c; },
    rappels: () => lire(CLES.rappels, []),
    ajouterRappel(r) { const l = Store.rappels(); l.push(r); ecrire(CLES.rappels, l); },
    modifierRappel(id, ch) { const l = Store.rappels(); const r = l.find(x => x.id === id); if (r) { Object.assign(r, ch); ecrire(CLES.rappels, l); } }
  };

  let reglages = Object.assign({ fraisLivraison: CFG.fraisLivraison, fraisBranchement: CFG.fraisBranchement, prix: {} }, lire(CLES.reglages, {}));
  const bouteilles = () => CFG.bouteilles.map(b => { const r = reglages.prix[b.id] || {}; return { ...b, prix: r.prix ?? b.prix, consigne: r.consigne ?? b.consigne }; });

  // ================================================================ Outils
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const fmt = n => new Intl.NumberFormat("fr-FR").format(Math.round(n || 0)) + " F";
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const heure = t => new Date(t).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const estAujourdhui = t => t && new Date(t).toDateString() === new Date().toDateString();
  const nouvelId = p => p + "-" + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).slice(2, 4).toUpperCase();
  const chiffres = s => String(s || "").replace(/\D/g, "");
  const telValide = s => { const d = chiffres(s); return d.length === 8 || (d.length === 11 && d.startsWith("689")); };
  const carteDispo = typeof window.L !== "undefined";

  let toastTimer;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("visible");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("visible"), 3200);
  }

  // ---------- Erreurs affichées sous le champ (restent jusqu'à correction)
  function erreur(idMsg, cle, cible) {
    const p = $(idMsg); p.textContent = t(cle); p.hidden = false;
    if (cible) { cible.classList.add("erreur"); cible.closest(".champ")?.classList.add("erreur"); }
    return p;
  }
  function effacerErreur(idMsg, cible) {
    const p = $(idMsg); if (p) p.hidden = true;
    if (cible) { cible.classList.remove("erreur"); cible.closest(".champ")?.classList.remove("erreur"); }
  }
  [["#nom", "#err-nom"], ["#tel", "#err-tel"], ["#ref-prise", "#err-prise"], ["#monnaie", "#err-monnaie"], ["#adresse-texte", "#err-point"],
   ["#s-nom", "#s-err-3"], ["#s-tel", "#s-err-3"], ["#s-adresse", "#s-err-2"], ["#rappel-nom", "#err-rappel"], ["#rappel-tel", "#err-rappel"]]
    .forEach(([c, m]) => $(c).addEventListener("input", () => effacerErreur(m, $(c))));

  // ---------- Fenêtre de confirmation en gros caractères (remplace confirm())
  function confirmer({ titre, corps, oui, non }) {
    return new Promise(resolve => {
      const d = $("#dlg-confirmer");
      $("#conf-titre").textContent = titre;
      $("#conf-corps").innerHTML = corps;
      $("#conf-oui").innerHTML = oui;
      $("#conf-non").innerHTML = non;
      const fin = v => { d.close(); $("#conf-oui").onclick = $("#conf-non").onclick = null; resolve(v); };
      $("#conf-oui").onclick = () => fin(true);
      $("#conf-non").onclick = () => fin(false);
      d.oncancel = e => { e.preventDefault(); fin(false); };
      d.showModal();
    });
  }

  // ================================================================ Langues
  const prefs = Object.assign({ langue: CFG.langueDefaut || "fr", facile: false }, lire(CLES.prefs, {}));
  function t(cle) { const e = TXT[cle]; if (!e) return cle; return prefs.langue === "ty" ? (e.ty || e.fr) : e.fr; }
  function th(cle) {
    const e = TXT[cle]; if (!e) return esc(cle);
    if (prefs.langue === "both" && e.ty && e.ty !== e.fr) return `${esc(e.ty)}<span class="fr-sous" lang="fr">${esc(e.fr)}</span>`;
    return esc(t(cle));
  }
  function tOption(cle) { const e = TXT[cle]; if (!e) return cle; return prefs.langue === "both" && e.ty && e.ty !== e.fr ? `${e.ty} — ${e.fr}` : t(cle); }

  function appliquerLangue() {
    document.documentElement.lang = prefs.langue === "ty" ? "ty" : "fr";
    $$("[data-t]").forEach(el => { if (el.tagName === "OPTION") el.textContent = tOption(el.dataset.t); else el.innerHTML = th(el.dataset.t); });
    $("#repere").placeholder = t("reperePh");
    afficherMessagePoint();
    $$(".langues button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.langue === prefs.langue)));
    $("#bandeau-ty").hidden = prefs.langue === "fr";
    rendreTout();
  }
  $$(".langues button").forEach(b => b.addEventListener("click", () => { prefs.langue = b.dataset.langue; ecrire(CLES.prefs, prefs); appliquerLangue(); }));

  // ================================================================ En-tête compact : panneau Affichage
  $("#btn-affichage").addEventListener("click", () => {
    const p = $("#panneau-affichage"); p.hidden = !p.hidden;
    $("#btn-affichage").setAttribute("aria-expanded", String(!p.hidden));
  });

  // ================================================================ Mode simple (matahiapo)
  function appliquerFacile() {
    document.body.classList.toggle("facile", prefs.facile);
    $("#btn-facile").setAttribute("aria-pressed", String(prefs.facile));
    const surCommande = $("#v-commander").classList.contains("active") || $("#v-simple").classList.contains("active");
    if (surCommande) afficherVue("v-commander");
  }
  $("#btn-facile").addEventListener("click", () => {
    prefs.facile = !prefs.facile; ecrire(CLES.prefs, prefs);
    $("#panneau-affichage").hidden = true; $("#btn-affichage").setAttribute("aria-expanded", "false");
    if (prefs.facile) etape = 1;
    appliquerFacile();
    toast(prefs.facile ? "Mode simple : une question par écran." : "Mode normal.");
  });

  // ================================================================ Lecture à voix haute
  function lireAVoixHaute(texte) {
    if (!("speechSynthesis" in window)) { toast("La lecture à voix haute n'est pas disponible sur ce téléphone."); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texte); u.lang = "fr-FR"; u.rate = 0.9;   // pas de voix tahitienne sur les téléphones
    speechSynthesis.speak(u);
  }
  $("#btn-ecouter").addEventListener("click", () => {
    $("#panneau-affichage").hidden = true; $("#btn-affichage").setAttribute("aria-expanded", "false");
    if ("speechSynthesis" in window && speechSynthesis.speaking) { speechSynthesis.cancel(); return; }
    const vue = $(".vue.active");
    const morceaux = Array.from(vue.querySelectorAll("h2, .aide, .s-texte, .accueil-texte p, .commande, #recap, .s-recap, .msg-erreur"))
      .filter(el => el.offsetParent !== null)
      .map(el => (el.querySelector(".fr-sous") ? el.querySelector(".fr-sous").textContent : el.textContent).trim()).filter(Boolean);
    lireAVoixHaute(morceaux.join(". "));
  });

  // ================================================================ Navigation
  const cartes = {};
  function afficherVue(id) {
    const reelle = id === "v-commander" && prefs.facile ? "v-simple" : id;
    $$(".vue").forEach(v => v.classList.toggle("active", v.id === reelle));
    $$(".onglets button").forEach(b => {
      const actif = b.dataset.vue === id;
      b.classList.toggle("actif", actif);
      if (actif) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    $("#barre-commande").hidden = reelle !== "v-commander";
    window.scrollTo(0, 0);
    if (reelle === "v-simple") rendreEtape();
    if (id === "v-suivi") rendreSuivi();
    if (id === "v-livreur" && sessionStorage.getItem("faregaz.livreur")) ouvrirLivreur();
    if (id === "v-gestion" && sessionStorage.getItem("faregaz.gestion")) ouvrirGestion();
    setTimeout(() => Object.values(cartes).forEach(m => m.invalidateSize()), 80);
  }
  $$(".onglets button").forEach(b => b.addEventListener("click", () => afficherVue(b.dataset.vue)));

  // ================================================================ État de la commande (partagé entre les deux modes)
  const panier = {};
  let point = null;
  const client = lire(CLES.client, {});

  const icoBouteille = `<svg class="ico" viewBox="0 0 40 52" aria-hidden="true"><rect x="13" y="2" width="14" height="6" rx="2" fill="#5d6d72"/><rect x="10" y="7" width="20" height="6" rx="3" fill="#7a8a8f"/><rect x="5" y="12" width="30" height="38" rx="9" fill="#0e7c86"/><path d="M20 22c-5 6-7 10-7 14a7 7 0 0 0 14 0c0-4-2-8-7-14z" fill="#f28c28"/><path d="M20 31c-2 2.5-3 4-3 5.5a3 3 0 0 0 6 0c0-1.5-1-3-3-5.5z" fill="#ffd166"/></svg>`;

  function calcul({ echange, branchement, solidaire }) {
    solidaire = CFG.tarifSolidaire.actif && solidaire;
    const lignes = []; let gaz = 0, consigne = 0, nb = 0;
    bouteilles().forEach(b => {
      const q = panier[b.id] || 0; if (!q) return;
      nb += q; gaz += q * b.prix; if (!echange) consigne += q * b.consigne;
      lignes.push({ id: b.id, nom: b.nom, q, prix: b.prix, consigne: echange ? 0 : b.consigne });
    });
    const fraisOfferts = solidaire && CFG.tarifSolidaire.livraisonOfferte;
    const branchementOffert = solidaire && CFG.tarifSolidaire.branchementOffert;
    const frais = nb && !fraisOfferts ? reglages.fraisLivraison : 0;
    const fraisBr = nb && branchement && !branchementOffert ? reglages.fraisBranchement : 0;
    return { lignes, nb, gaz, consigne, frais, fraisBr, branchement, solidaire, fraisOfferts, branchementOffert, echange, total: gaz + consigne + frais + fraisBr };
  }
  const optionsNormal = () => ({ echange: $("#echange").checked, branchement: $("#branchement").checked, solidaire: $("#solidaire").checked });
  const optionsSimple = () => ({ echange: $("#s-echange").checked, branchement: $("#s-branchement").checked, solidaire: $("#s-solidaire").checked });

  function tableauPrix(c) {
    return `<table class="lignes">
      ${c.lignes.map(l => `<tr><td>${l.q} × ${esc(l.nom)}</td><td>${fmt(l.q * l.prix)}</td></tr>`).join("")}
      ${c.consigne ? `<tr><td>${esc(t("consigne"))}</td><td>${fmt(c.consigne)}</td></tr>` : ""}
      <tr><td>${esc(t("livraison"))}</td><td>${c.fraisOfferts ? esc(t("offert")) : fmt(c.frais)}</td></tr>
      ${c.branchement ? `<tr><td>${esc(t("branchement"))}</td><td>${c.branchementOffert ? esc(t("offert")) : fmt(c.fraisBr)}</td></tr>` : ""}
      <tr class="total"><td>${esc(t("total"))}</td><td>${fmt(c.total)}</td></tr></table>`;
  }

  // ================================================================ MODE NORMAL
  function rendreBouteilles() {
    $("#liste-bouteilles").innerHTML = bouteilles().map(b => {
      const q = panier[b.id] || 0;
      return `<div class="bouteille ${q ? "choisie" : ""}">${icoBouteille}
        <div class="infos"><b>${esc(b.nom)}</b><small>${esc(b.detail)}</small><div class="prix">${fmt(b.prix)}</div></div>
        <div class="qte">
          <button type="button" data-moins="${b.id}" aria-label="Retirer une ${esc(b.nom)}">−</button>
          <span aria-live="polite" aria-label="Quantité ${esc(b.nom)}">${q}</span>
          <button type="button" data-plus="${b.id}" aria-label="Ajouter une ${esc(b.nom)}">+</button>
        </div></div>`;
    }).join("");
  }
  $("#liste-bouteilles").addEventListener("click", e => {
    const bt = e.target.closest("button"); if (!bt) return;
    if (bt.dataset.plus) panier[bt.dataset.plus] = Math.min((panier[bt.dataset.plus] || 0) + 1, 6);
    if (bt.dataset.moins) panier[bt.dataset.moins] = Math.max((panier[bt.dataset.moins] || 0) - 1, 0);
    effacerErreur("#err-bouteille", $("#liste-bouteilles"));
    rendreBouteilles(); rendreRecap();
  });

  function rendreRecap() {
    const c = calcul(optionsNormal());
    $("#aide-consigne").innerHTML = c.echange ? th("aideEchange") : th("aideConsigne");
    $("#prix-branchement").textContent = c.solidaire && CFG.tarifSolidaire.branchementOffert ? `(${t("offert")})` : `(+ ${fmt(reglages.fraisBranchement)})`;
    $("#recap").innerHTML = c.nb ? tableauPrix(c) : `<p class="vide">${th("choisirBouteille")}</p>`;
    $("#barre-total").textContent = fmt(c.total);
  }
  ["#echange", "#branchement", "#solidaire"].forEach(s => $(s).addEventListener("change", rendreRecap));
  $("#bloc-solidaire").hidden = $("#s-bloc-solidaire").hidden = !CFG.tarifSolidaire.actif;

  // ---------- Cartes (avec secours si la bibliothèque de carte ne charge pas)
  function tuiles(map) {
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; contributeurs OpenStreetMap" }).addTo(map);
  }
  const epingles = {};
  function creerCarte(cle, idElement, zoom) {
    if (!carteDispo || cartes[cle]) return cartes[cle];
    const m = L.map(idElement).setView(point ? [point.lat, point.lng] : CFG.centreCarte, point ? 16 : (zoom || CFG.zoomCarte));
    tuiles(m); cartes[cle] = m;
    m.on("click", e => placerPoint(e.latlng.lat, e.latlng.lng));
    if (point) majEpingles();
    return m;
  }
  function majEpingles() {
    Object.entries(cartes).forEach(([cle, m]) => {
      if (cle === "livreur" || !point) return;
      if (!epingles[cle]) {
        epingles[cle] = L.marker([point.lat, point.lng], { draggable: true, title: "Lieu de livraison", keyboard: true }).addTo(m);
        epingles[cle].on("dragend", () => { const p = epingles[cle].getLatLng(); placerPoint(p.lat, p.lng); });
      } else epingles[cle].setLatLng([point.lat, point.lng]);
    });
  }
  let messagePoint = null;   // null = texte d'aide par défaut
  function afficherMessagePoint() {
    const txt = messagePoint || t("aideCarte");
    $("#info-point").textContent = txt; $("#s-info-point").textContent = txt;
  }
  function placerPoint(lat, lng, precision, message) {
    point = { lat: +lat.toFixed(6), lng: +lng.toFixed(6), precision: precision ? Math.round(precision) : null };
    majEpingles();
    messagePoint = message || (`📍 Point placé` + (point.precision ? ` (précision ± ${point.precision} m)` : "") + ". Tu peux déplacer l'épingle.");
    afficherMessagePoint();
    effacerErreur("#err-point", $("#carte-client")); effacerErreur("#s-err-2", $("#carte-simple"));
  }
  function localiser(bouton, cleCarte) {
    if (!navigator.geolocation) { toast("La géolocalisation n'est pas disponible sur ce téléphone."); return; }
    const lib = bouton.innerHTML; bouton.textContent = "⏳ …";
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude, accuracy } = pos.coords;
      placerPoint(latitude, longitude, accuracy);
      cartes[cleCarte]?.setView([latitude, longitude], 17);
      bouton.innerHTML = lib;
    }, () => { bouton.innerHTML = lib; toast("Position introuvable : touche la carte pour placer l'épingle."); },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  }
  if (carteDispo) creerCarte("client", "carte-client");
  else { $("#bloc-carte").hidden = true; $("#bloc-sans-carte").hidden = false; }
  $("#btn-gps").addEventListener("click", () => localiser($("#btn-gps"), "client"));

  // ---------- Paiement (mode normal)
  const paiementChoisi = () => document.querySelector("input[name=paiement]:checked").value;
  function majPaiement() { const p = paiementChoisi(); $("#bloc-monnaie").hidden = p !== "especes"; $("#bloc-prise").hidden = p !== "prise"; }
  $$("input[name=paiement]").forEach(r => r.addEventListener("change", majPaiement));

  // ---------- Client mémorisé : nom, téléphone, repère, accès… et maintenant le point GPS
  $("#nom").value = $("#s-nom").value = client.nom || "";
  $("#tel").value = $("#s-tel").value = client.tel || "";
  $("#repere").value = client.repere || "";
  if (client.acces) $("#acces").value = client.acces;
  if (client.point && carteDispo) {
    placerPoint(client.point.lat, client.point.lng, null, t("memeEndroit"));
    cartes.client?.setView([client.point.lat, client.point.lng], 16);
  }

  function mesCommandes() { const mes = lire(CLES.mes, []); return Store.commandes().filter(c => mes.includes(c.id)).sort((a, b) => b.creeLe - a.creeLe); }
  function majRecommande() {
    const d = mesCommandes().find(c => c.statut !== "annulee");
    $("#btn-recommande").hidden = !d;
    $("#accueil").classList.toggle("compact", !!d);
    return d;
  }

  const LIB_PAIEMENT = () => ({ especes: "💵 " + t("especes"), carte: "💳 " + t("carte"), prise: "🤝 " + t("priseEnCharge") });
  function corpsConfirmation(c, d) {
    const lieu = d.point ? (d.repere ? `📍 ${esc(d.repere)}` : "📍 Point GPS sur la carte") : `🏠 ${esc(d.adresseTexte)}`;
    return `<table class="conf-lignes">
      <tr><td>${esc(t("etape1"))}</td><td>${c.lignes.map(l => `${l.q} × ${esc(l.nom)}`).join("<br>")}<br><small>${c.echange ? esc(t("echange")) : esc(t("aideConsigne"))}</small></td></tr>
      <tr><td>${esc(t("livrerA"))}</td><td>${lieu}</td></tr>
      ${c.branchement ? `<tr><td>🔧</td><td>${esc(t("branchement"))}</td></tr>` : ""}
      ${c.solidaire ? `<tr><td>💛</td><td>${esc(t("aideSolidaireCourt"))}</td></tr>` : ""}
      <tr><td>${esc(t("paiement"))}</td><td>${LIB_PAIEMENT()[d.paiement]}</td></tr>
      <tr class="total"><td>${esc(t("total"))}</td><td>${fmt(c.total)}</td></tr></table>`;
  }

  function creerCommande(d, c) {
    const base = {
      id: nouvelId("FG"), creeLe: Date.now(), statut: "recue",
      nom: d.nom, tel: d.tel, repere: d.repere || "", acces: d.acces || "facile", point: d.point, adresseTexte: d.adresseTexte || "",
      creneau: d.creneau || "asap", paiement: d.paiement, monnaie: d.monnaie || null, refPrise: d.refPrise || "",
      echange: c.echange, branchement: c.branchement, solidaire: c.solidaire,
      lignes: c.lignes, frais: c.frais, fraisBr: c.fraisBr, consigne: c.consigne, total: c.total, langue: prefs.langue
    };
    Store.ajouter(base);
    const mes = lire(CLES.mes, []); mes.push(base.id); ecrire(CLES.mes, mes);
    Object.assign(client, { nom: base.nom, tel: base.tel, repere: base.repere, acces: base.acces, point: base.point, adresseTexte: base.adresseTexte });
    ecrire(CLES.client, client);
    Object.keys(panier).forEach(k => delete panier[k]);
    $("#monnaie").value = ""; $("#ref-prise").value = "";
    etape = 1;
    rendreBouteilles(); rendreRecap(); majRecommande(); majBandeau();
    toast(t("merci"));
    afficherVue("v-suivi");
  }

  // Valide le formulaire normal : erreurs sous chaque champ, on descend jusqu'à la première
  $("#btn-commander").addEventListener("click", async () => {
    const opt = optionsNormal(); const c = calcul(opt);
    const d = {
      nom: $("#nom").value.trim(), tel: $("#tel").value.trim(), repere: $("#repere").value.trim(), acces: $("#acces").value,
      point: carteDispo ? point : null, adresseTexte: carteDispo ? "" : $("#adresse-texte").value.trim(),
      creneau: $("#creneau").value, paiement: paiementChoisi(),
      monnaie: paiementChoisi() === "especes" ? (+$("#monnaie").value || null) : null,
      refPrise: paiementChoisi() === "prise" ? $("#ref-prise").value.trim() : ""
    };
    const erreurs = [];
    if (!c.nb) erreurs.push(erreur("#err-bouteille", "errBouteille", $("#liste-bouteilles")));
    if (carteDispo && !d.point) erreurs.push(erreur("#err-point", "errPoint", $("#carte-client")));
    if (!carteDispo && d.adresseTexte.length < 5) erreurs.push(erreur("#err-point", "errAdresse", $("#adresse-texte")));
    if (!d.nom) erreurs.push(erreur("#err-nom", "errNom", $("#nom")));
    if (!telValide(d.tel)) erreurs.push(erreur("#err-tel", "errTel", $("#tel")));
    if (d.paiement === "prise" && !d.refPrise) erreurs.push(erreur("#err-prise", "errPrise", $("#ref-prise")));
    if (d.monnaie && d.monnaie < c.total) { erreurs.push(erreur("#err-monnaie", "errMonnaie", $("#monnaie"))); $("#monnaie").closest("details").open = true; }
    if (erreurs.length) { erreurs[0].scrollIntoView({ behavior: "smooth", block: "center" }); return; }

    const ok = await confirmer({ titre: t("sVerifie"), corps: corpsConfirmation(c, d), oui: "✔ " + esc(t("sOuiCommande")), non: esc(t("confNon")) });
    if (ok) creerCommande(d, c);
  });

  // Commander comme la dernière fois
  $("#btn-recommande").addEventListener("click", async () => {
    const der = majRecommande(); if (!der) return;
    Object.keys(panier).forEach(k => delete panier[k]);
    der.lignes.forEach(l => { panier[l.id] = l.q; });
    const c = calcul({ echange: der.echange, branchement: der.branchement, solidaire: der.solidaire });
    const d = { ...der, monnaie: null };
    const ok = await confirmer({ titre: t("sVerifie"), corps: corpsConfirmation(c, d), oui: "✔ " + esc(t("sOuiCommande")), non: esc(t("confNon")) });
    if (ok) creerCommande(d, c); else { Object.keys(panier).forEach(k => delete panier[k]); rendreBouteilles(); rendreRecap(); }
  });

  // ================================================================ MODE SIMPLE : 4 écrans
  let etape = 1;
  let paiementSimple = "especes";
  const NB_ETAPES = 4;

  function rendreSimpleBouteilles() {
    const choix = Object.keys(panier).find(k => panier[k] > 0);
    $("#s-bouteilles").innerHTML = bouteilles().map(b => {
      const sel = b.id === choix;
      return `<button type="button" class="s-bouteille" data-choix="${b.id}" aria-pressed="${sel}">${icoBouteille}
        <span><b>${esc(b.nom)}</b><span class="prix">${fmt(b.prix)}</span></span>${sel ? `<span class="coche" aria-hidden="true">✔</span>` : ""}</button>
        ${sel ? `<div class="s-qte"><button type="button" data-s-moins="${b.id}" aria-label="Une de moins">−</button><b aria-live="polite">${panier[b.id]}</b><button type="button" data-s-plus="${b.id}" aria-label="Une de plus">+</button></div>` : ""}`;
    }).join("");
  }
  $("#s-bouteilles").addEventListener("click", e => {
    const bt = e.target.closest("button"); if (!bt) return;
    if (bt.dataset.choix) { const q = panier[bt.dataset.choix] || 1; Object.keys(panier).forEach(k => delete panier[k]); panier[bt.dataset.choix] = q; }
    if (bt.dataset.sPlus) panier[bt.dataset.sPlus] = Math.min((panier[bt.dataset.sPlus] || 0) + 1, 6);
    if (bt.dataset.sMoins) panier[bt.dataset.sMoins] = Math.max((panier[bt.dataset.sMoins] || 0) - 1, 1);
    effacerErreur("#s-err-1");
    rendreSimpleBouteilles(); rendreBouteilles(); rendreRecap();
  });
  $("#s-appel").addEventListener("click", () => ouvrirAide("commande"));

  let choixMemeEndroit = null;   // null = pas encore répondu
  function rendreEtape() {
    $$(".s-etape").forEach(el => { el.hidden = Number(el.dataset.etape) !== etape; });
    $("#s-progres").textContent = `${t("sEtape")} ${etape} ${t("sSur")} ${NB_ETAPES}`;
    $("#s-barre-rempli").style.width = (etape / NB_ETAPES * 100) + "%";
    $("#s-retour").style.visibility = etape === 1 ? "hidden" : "visible";
    // À la dernière étape, le gros bouton du bas devient « Oui, je commande »
    $("#s-suivant").innerHTML = etape === NB_ETAPES ? `<span aria-hidden="true">✔</span> ${th("sOuiCommande")}` : `${th("sSuivant")} <span aria-hidden="true">▶</span>`;
    if (etape === 1) rendreSimpleBouteilles();
    if (etape === 2) {
      const memeDispo = !!(client.point && carteDispo) && choixMemeEndroit !== false;
      $("#s-meme").hidden = !memeDispo;
      $("#s-nouveau").hidden = memeDispo;
      $("#s-repere-precedent").textContent = client.repere ? "📍 " + client.repere : "📍 Point GPS enregistré";
      if (!memeDispo) {
        if (carteDispo) { creerCarte("simple", "carte-simple", 15); setTimeout(() => cartes.simple?.invalidateSize(), 80); }
        else { $("#s-gps").hidden = true; $("#carte-simple").hidden = true; $("#s-bloc-adresse").hidden = false; }
      }
    }
    if (etape === 4) {
      const c = calcul(optionsSimple());
      const d = { point: carteDispo ? point : null, repere: client.repere, adresseTexte: $("#s-adresse").value.trim(), paiement: paiementSimple };
      $("#s-recap").innerHTML = corpsConfirmation(c, d);
    }
    window.scrollTo(0, 0);
  }
  $("#s-meme-oui").addEventListener("click", () => { choixMemeEndroit = true; placerPoint(client.point.lat, client.point.lng, null, t("memeEndroit")); etape = 3; rendreEtape(); });
  $("#s-meme-non").addEventListener("click", () => { choixMemeEndroit = false; rendreEtape(); });
  $("#s-gps").addEventListener("click", () => localiser($("#s-gps"), "simple"));

  function validerEtape() {
    if (etape === 1 && !Object.values(panier).some(q => q > 0)) { erreur("#s-err-1", "errBouteilleSimple"); return false; }
    if (etape === 2) {
      if (carteDispo && !point) { erreur("#s-err-2", "errPoint", $("#carte-simple")); return false; }
      if (!carteDispo && $("#s-adresse").value.trim().length < 5) { erreur("#s-err-2", "errAdresse", $("#s-adresse")); return false; }
    }
    if (etape === 3) {
      if (!$("#s-nom").value.trim()) { erreur("#s-err-3", "errNom", $("#s-nom")); return false; }
      if (!telValide($("#s-tel").value)) { erreur("#s-err-3", "errTel", $("#s-tel")); return false; }
    }
    return true;
  }
  $("#s-suivant").addEventListener("click", () => {
    if (etape === NB_ETAPES) { $("#s-commander").click(); return; }
    if (!validerEtape()) { $(".s-etape:not([hidden]) .msg-erreur:not([hidden])")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (etape === 2 && client.point && choixMemeEndroit === null && !point) choixMemeEndroit = true;
    etape = Math.min(NB_ETAPES, etape + 1); rendreEtape();
  });
  $("#s-retour").addEventListener("click", () => {
    etape = Math.max(1, etape - 1);
    if (etape === 2) choixMemeEndroit = null;
    rendreEtape();
  });
  $$(".s-choix").forEach(b => b.addEventListener("click", () => {
    paiementSimple = b.dataset.paie;
    $$(".s-choix").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    rendreEtape();
  }));
  $("#s-commander").addEventListener("click", () => {
    const c = calcul(optionsSimple());
    const d = {
      nom: $("#s-nom").value.trim(), tel: $("#s-tel").value.trim(), repere: client.repere || "", acces: client.acces || "facile",
      point: carteDispo ? point : null, adresseTexte: carteDispo ? "" : $("#s-adresse").value.trim(),
      creneau: "asap", paiement: paiementSimple
    };
    creerCommande(d, c);   // l'écran 4 sert déjà de confirmation
  });

  // ================================================================ AIDE / HOTLINE
  $("#num-hotline").textContent = CFG.hotline.numero;
  $("#lien-hotline").href = "tel:" + chiffres(CFG.hotline.numero);
  $("#horaires-hotline").textContent = CFG.hotline.horaires;
  function ouvrirAide(motif) {
    $("#rappel-nom").value = $("#nom").value || $("#s-nom").value || client.nom || "";
    $("#rappel-tel").value = $("#tel").value || $("#s-tel").value || client.tel || "";
    if (motif) $("#rappel-motif").value = motif;
    effacerErreur("#err-rappel");
    $("#dlg-aide").showModal();
  }
  $("#btn-aide").addEventListener("click", () => ouvrirAide());
  $("#btn-rappel").addEventListener("click", () => ouvrirAide("commande"));
  $("#aide-fermer").addEventListener("click", () => $("#dlg-aide").close());
  $("#aide-envoyer").addEventListener("click", () => {
    const nom = $("#rappel-nom").value.trim(), tel = $("#rappel-tel").value.trim();
    if (!nom) return erreur("#err-rappel", "errNom", $("#rappel-nom"));
    if (!telValide(tel)) return erreur("#err-rappel", "errTel", $("#rappel-tel"));
    Store.ajouterRappel({ id: nouvelId("RP"), creeLe: Date.now(), nom, tel, motif: $("#rappel-motif").value, fait: false });
    $("#dlg-aide").close();
    toast(t("rappelEnvoye"));
  });

  // ================================================================ SUIVI + bandeau « commande en cours »
  const STATUTS = ["recue", "enroute", "livree", "annulee"];
  const libStatut = s => STATUTS.includes(s) ? t(s) : s;
  const resumeLignes = c => c.lignes.map(l => `${l.q} × ${esc(l.nom)}`).join(", ");
  const PAIEMENT = { especes: "💵 Espèces", carte: "💳 Carte", prise: "🤝 Prise en charge" };
  const ACCES = { facile: "Accès facile", escaliers: "Escaliers", pente: "Chemin en pente", servitude: "Servitude étroite" };

  function suiviVaa(statut) {
    const i = ["recue", "enroute", "livree"].indexOf(statut);
    const x = [30, 160, 268][Math.max(i, 0)];
    return `<svg class="va-a" viewBox="0 0 320 64" role="img" aria-label="Étape : ${esc(libStatut(statut))}">
      <path d="M0 46 Q20 40 40 46 T80 46 T120 46 T160 46 T200 46 T240 46 T280 46 T320 46 V64 H0Z" fill="#bfe9ec"/>
      <line x1="30" y1="40" x2="268" y2="40" stroke="#9fc9cc" stroke-width="2" stroke-dasharray="4 5"/>
      <g transform="translate(286 14)"><path d="M0 14 L14 2 L28 14Z" fill="#a8693a"/><rect x="4" y="14" width="20" height="13" fill="#e9d2a6"/><rect x="11" y="19" width="6" height="8" fill="#8a5530"/></g>
      <g transform="translate(${x - 26} 22)">
        <path d="M0 16 Q26 26 52 16 L48 22 Q26 30 4 22Z" fill="#0e7c86"/>
        <line x1="10" y1="9" x2="10" y2="18" stroke="#5d4a3a" stroke-width="2"/><line x1="40" y1="9" x2="40" y2="18" stroke="#5d4a3a" stroke-width="2"/>
        <path d="M6 9 H44" stroke="#5d4a3a" stroke-width="2"/><rect x="18" y="2" width="16" height="11" rx="2" fill="#f28c28"/>
        <path d="M22 6 c-1 2 -2 3 -2 4 a2 2 0 0 0 4 0 c0-1 -1-2 -2-4z" fill="#ffd166"/>
      </g></svg>
      <div class="va-a-libelles">${["recue", "enroute", "livree"].map((s, k) => `<span class="${k <= i ? "fait" : ""}">${esc(t(s))}</span>`).join("")}</div>`;
  }
  function majBandeau() {
    const c = mesCommandes().find(x => x.statut === "recue" || x.statut === "enroute");
    const b = $("#bandeau-commande");
    b.hidden = !c;
    if (c) b.textContent = (c.statut === "enroute" ? "🚚 " + t("bandeauEnCours") : "✔ " + t("bandeauRecue")) + " · " + c.id + " ›";
  }
  $("#bandeau-commande").addEventListener("click", () => afficherVue("v-suivi"));

  function rendreSuivi() {
    const liste = mesCommandes();
    majBandeau();
    if (!liste.length) { $("#mes-commandes").innerHTML = `<p class="vide">${th("aucuneCommande")}</p>`; return; }
    $("#mes-commandes").innerHTML = liste.map(c => `
      <div class="commande">
        <div class="haut"><b>${esc(c.id)}</b><span class="badge ${esc(c.statut)}">${esc(libStatut(c.statut))}</span></div>
        <div class="date">${heure(c.creeLe)}</div>
        ${c.statut !== "annulee" ? suiviVaa(c.statut) : ""}
        <p>${resumeLignes(c)}${c.echange ? " (échange)" : " (avec consigne)"}</p>
        ${c.branchement ? `<p><span class="badge opt">🔧 Branchement</span></p>` : ""}
        <p><b>${fmt(c.total)}</b> · ${PAIEMENT[c.paiement] || ""}</p>
        ${c.statut === "enroute" ? `<p class="date">🚚 ${esc(t("vehiculeTxt"))}</p>` : ""}
        ${c.statut === "recue" ? `<button type="button" class="btn danger petit" data-annuler="${esc(c.id)}">${esc(t("annuler"))}</button>` : ""}
      </div>`).join("");
  }
  $("#mes-commandes").addEventListener("click", async e => {
    const id = e.target.closest("[data-annuler]")?.dataset.annuler; if (!id) return;
    const ok = await confirmer({ titre: t("annuler") + " ?", corps: `<p>${esc(id)}</p>`, oui: esc(t("annuler")), non: esc(t("confNon")) });
    if (ok) { Store.modifier(id, { statut: "annulee" }); rendreSuivi(); majRecommande(); toast("Commande annulée."); }
  });

  // ================================================================ LIVREUR
  let filtre = "actives", carteLivreur = null, coucheLivreur = null;
  $("#login-livreur").addEventListener("submit", e => {
    e.preventDefault();
    if ($("#pin-livreur").value === CFG.pinLivreur) { sessionStorage.setItem("faregaz.livreur", "1"); ouvrirLivreur(); } else toast("Code incorrect.");
  });
  function ouvrirLivreur() {
    $("#login-livreur").hidden = true; $("#zone-livreur").hidden = false;
    if (carteDispo && !carteLivreur) {
      carteLivreur = L.map("carte-livreur").setView(CFG.centreCarte, 12);
      cartes.livreur = carteLivreur; tuiles(carteLivreur);
      coucheLivreur = L.layerGroup().addTo(carteLivreur);
    }
    if (!carteDispo) $("#carte-livreur").hidden = true;
    setTimeout(() => carteLivreur && carteLivreur.invalidateSize(), 60);
    rendreLivreur(true);
  }
  $$(".filtre").forEach(b => b.addEventListener("click", () => { filtre = b.dataset.filtre; $$(".filtre").forEach(x => x.classList.toggle("actif", x === b)); rendreLivreur(true); }));
  const couleurStatut = s => ({ recue: "#d98a00", enroute: CFG.couleur, livree: "#2e8b57" }[s] || "#888");

  function rendreLivreur(cadrer) {
    if ($("#zone-livreur").hidden) return;
    const liste = Store.commandes()
      .filter(c => filtre === "actives" ? (c.statut === "recue" || c.statut === "enroute") : (c.statut === "livree" && estAujourdhui(c.livreeLe)))
      .sort((a, b) => filtre === "actives" ? ((b.solidaire ? 1 : 0) - (a.solidaire ? 1 : 0) || a.creeLe - b.creeLe) : b.livreeLe - a.livreeLe);
    if (coucheLivreur) {
      coucheLivreur.clearLayers(); const pts = [];
      liste.forEach((c, i) => {
        if (!c.point) return;
        const m = L.circleMarker([c.point.lat, c.point.lng], { radius: 12, color: "#fff", weight: 2, fillColor: couleurStatut(c.statut), fillOpacity: 1 })
          .bindPopup(`<b>${esc(c.id)}</b><br>${esc(c.nom)}<br>${resumeLignes(c)}${c.repere ? "<br><i>" + esc(c.repere) + "</i>" : ""}`);
        m.bindTooltip(String(i + 1), { permanent: true, direction: "center", className: "num-carte" });
        coucheLivreur.addLayer(m); pts.push([c.point.lat, c.point.lng]);
      });
      if (cadrer && pts.length) carteLivreur.fitBounds(pts, { padding: [30, 30], maxZoom: 16 });
    }
    if (!liste.length) { $("#liste-livreur").innerHTML = `<p class="vide">${filtre === "actives" ? "Aucune livraison en attente." : "Aucune livraison terminée aujourd'hui."}</p>`; return; }
    $("#liste-livreur").innerHTML = liste.map((c, i) => {
      const dest = c.point ? `${c.point.lat},${c.point.lng}` : encodeURIComponent((c.adresseTexte || "") + " Tahiti");
      const rendu = c.monnaie ? c.monnaie - c.total : 0;
      return `<div class="commande">
        <div class="haut"><b>${i + 1}. ${esc(c.id)}</b><span class="badge ${esc(c.statut)}">${esc(t(c.statut))}</span></div>
        <div class="date">${heure(c.creeLe)} · ${esc(tOption({ asap: "crAsap", matin: "crMatin", midi: "crMidi", "apres-midi": "crApresMidi" }[c.creneau] || "crAsap"))}</div>
        <p>${c.solidaire ? `<span class="badge opt">💛 Solidaire · prioritaire</span>` : ""}${c.branchement ? `<span class="badge opt">🔧 Branchement</span>` : ""}${c.acces && c.acces !== "facile" ? `<span class="badge opt">⚠ ${esc(ACCES[c.acces])}</span>` : ""}</p>
        <p><b>${esc(c.nom)}</b> · ${esc(c.tel)}</p>
        <p>${resumeLignes(c)} — ${c.echange ? "échange de bouteille vide" : "pas de bouteille vide (consigne)"}</p>
        ${c.adresseTexte ? `<p>🏠 ${esc(c.adresseTexte)}</p>` : ""}
        ${c.repere ? `<p>📌 ${esc(c.repere)}</p>` : ""}
        <p><b>${fmt(c.total)}</b> · ${PAIEMENT[c.paiement] || ""}${c.refPrise ? ` n° ${esc(c.refPrise)}` : ""}${rendu > 0 ? ` · paie avec ${fmt(c.monnaie)} → rendre ${fmt(rendu)}` : ""}</p>
        ${c.statut !== "livree" ? `<div class="boutons">
          <a class="btn secondaire petit" href="https://www.google.com/maps/dir/?api=1&destination=${dest}" target="_blank" rel="noopener">🧭 Itinéraire</a>
          <a class="btn secondaire petit" href="tel:${esc(chiffres(c.tel))}">📞 Appeler</a>
          ${c.statut === "recue" ? `<button type="button" class="btn principal petit" data-partir="${esc(c.id)}">🚚 Je pars</button>` : ""}
          <button type="button" class="btn principal petit" data-livrer="${esc(c.id)}">✔ Livrée</button>
        </div>` : `<p class="date">Livrée ${heure(c.livreeLe)}</p>`}
      </div>`;
    }).join("");
  }
  let enCours = null;
  $("#liste-livreur").addEventListener("click", e => {
    const bt = e.target.closest("button"); if (!bt) return;
    if (bt.dataset.partir) { Store.modifier(bt.dataset.partir, { statut: "enroute", partiLe: Date.now() }); rendreLivreur(); toast("Le client voit que tu es en route."); }
    if (bt.dataset.livrer) {
      const c = Store.commandes().find(x => x.id === bt.dataset.livrer); if (!c) return;
      enCours = c.id;
      $("#dlg-resume").innerHTML = `<b>${esc(c.id)}</b> — ${esc(c.nom)}<br>${resumeLignes(c)}<br>À encaisser : <b>${fmt(c.total)}</b>`;
      $("#dlg-paye-txt").textContent = { carte: "Paiement par carte accepté", prise: `Bon / prise en charge vérifié (n° ${c.refPrise || "?"})` }[c.paiement] || `Espèces encaissées (${fmt(c.total)})`;
      ["#dlg-paye", "#dlg-vide", "#dlg-branche"].forEach(s => { $(s).checked = false; });
      $("#dlg-vide-bloc").hidden = !c.echange; $("#dlg-branche-bloc").hidden = !c.branchement; $("#dlg-erreur").hidden = true;
      $("#dlg-livraison").showModal();
    }
  });
  $("#dlg-annuler").addEventListener("click", () => { enCours = null; $("#dlg-livraison").close(); });
  $("#dlg-paye").addEventListener("change", () => { if ($("#dlg-paye").checked) $("#dlg-erreur").hidden = true; });
  $("#dlg-ok").addEventListener("click", () => {
    if (!enCours) return;
    if (!$("#dlg-paye").checked) { $("#dlg-erreur").hidden = false; return; }
    const c = Store.commandes().find(x => x.id === enCours);
    if (c && c.echange && !$("#dlg-vide").checked && !confirm("La bouteille vide n'a pas été récupérée. Valider quand même ?")) return;
    Store.modifier(enCours, { statut: "livree", livreeLe: Date.now(), videRecuperee: $("#dlg-vide").checked, branchee: $("#dlg-branche").checked });
    enCours = null; $("#dlg-livraison").close(); rendreLivreur();
    toast("Livraison enregistrée. Māuruuru !");
  });

  // ================================================================ GESTION
  $("#login-gestion").addEventListener("submit", e => {
    e.preventDefault();
    if ($("#pin-gestion").value === CFG.pinGestion) { sessionStorage.setItem("faregaz.gestion", "1"); ouvrirGestion(); } else toast("Code incorrect.");
  });
  function ouvrirGestion() { $("#login-gestion").hidden = true; $("#zone-gestion").hidden = false; rendreStats(); rendreRappels(); rendrePrix(); }
  function rendreStats() {
    if ($("#zone-gestion").hidden) return;
    const jour = Store.commandes().filter(c => estAujourdhui(c.creeLe) && c.statut !== "annulee");
    const livrees = jour.filter(c => c.statut === "livree");
    const s = (l, f) => l.reduce((a, c) => a + f(c), 0);
    const stats = [
      ["Commandes", jour.length], ["En attente", jour.filter(c => c.statut !== "livree").length],
      ["Livrées", livrees.length], ["Bouteilles livrées", s(livrees, c => c.lignes.reduce((a, l) => a + l.q, 0))],
      ["Encaissé", fmt(s(livrees.filter(c => c.paiement !== "prise"), c => c.total))], ["Prises en charge", fmt(s(livrees.filter(c => c.paiement === "prise"), c => c.total))],
      ["Branchements", jour.filter(c => c.branchement).length], ["Tarifs solidaires", jour.filter(c => c.solidaire).length],
      ["Espèces", fmt(s(livrees.filter(c => c.paiement === "especes"), c => c.total))], ["Carte", fmt(s(livrees.filter(c => c.paiement === "carte"), c => c.total))],
      ["Rappels à faire", Store.rappels().filter(r => !r.fait).length], ["En reo tahiti", jour.filter(c => c.langue && c.langue !== "fr").length]
    ];
    $("#stats").innerHTML = stats.map(([n, v]) => `<div class="stat"><b>${v}</b><small>${n}</small></div>`).join("");
  }
  const MOTIFS = { commande: "Commander", probleme: "Problème de livraison", question: "Question" };
  function rendreRappels() {
    const l = Store.rappels().sort((a, b) => (a.fait - b.fait) || b.creeLe - a.creeLe);
    $("#liste-rappels").innerHTML = l.length ? l.map(r => `
      <div class="rappel">
        <div><b>${esc(r.nom)}</b> · ${esc(r.tel)}<br><small>${esc(MOTIFS[r.motif] || r.motif)} · ${heure(r.creeLe)}</small></div>
        ${r.fait ? `<span class="badge livree">Rappelé</span>` : `<div class="boutons"><a class="btn secondaire petit" href="tel:${esc(chiffres(r.tel))}">📞</a><button type="button" class="btn principal petit" data-rappele="${esc(r.id)}">Fait</button></div>`}
      </div>`).join("") : `<p class="vide">Aucune demande de rappel.</p>`;
  }
  $("#liste-rappels").addEventListener("click", e => {
    const id = e.target.closest("[data-rappele]")?.dataset.rappele;
    if (id) { Store.modifierRappel(id, { fait: true, faitLe: Date.now() }); rendreRappels(); rendreStats(); }
  });
  function rendrePrix() {
    $("#form-prix").innerHTML = bouteilles().map(b => `
      <div class="ligne-prix"><div class="titre">${esc(b.nom)}</div>
        <label class="champ">Prix (F)<input type="number" min="0" step="50" data-prix="${b.id}" value="${b.prix}"></label>
        <label class="champ">Consigne (F)<input type="number" min="0" step="50" data-consigne="${b.id}" value="${b.consigne}"></label></div>`).join("") + `
      <label class="champ">Coût de livraison par commande (F)<input type="number" min="0" step="50" id="frais" value="${reglages.fraisLivraison}"></label>
      <label class="champ">Option branchement (F)<input type="number" min="0" step="50" id="frais-br" value="${reglages.fraisBranchement}"></label>
      <div class="boutons"><button type="submit" class="btn principal">Enregistrer</button></div>`;
  }
  $("#form-prix").addEventListener("submit", e => {
    e.preventDefault();
    const prix = {};
    CFG.bouteilles.forEach(b => { prix[b.id] = { prix: Math.max(0, +document.querySelector(`[data-prix="${b.id}"]`).value || 0), consigne: Math.max(0, +document.querySelector(`[data-consigne="${b.id}"]`).value || 0) }; });
    reglages = { fraisLivraison: Math.max(0, +$("#frais").value || 0), fraisBranchement: Math.max(0, +$("#frais-br").value || 0), prix };
    ecrire(CLES.reglages, reglages); rendreBouteilles(); rendreRecap(); toast("Prix enregistrés.");
  });
  $("#btn-csv").addEventListener("click", () => {
    const l = Store.commandes(); if (!l.length) return toast("Aucune commande à exporter.");
    const cols = ["id", "date", "statut", "nom", "tel", "bouteilles", "echange", "branchement", "solidaire", "paiement", "ref_prise_en_charge", "livraison", "consigne", "total", "latitude", "longitude", "adresse", "repere", "acces", "creneau", "langue"];
    const cell = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lignes = l.map(c => [c.id, new Date(c.creeLe).toISOString(), c.statut, c.nom, c.tel, c.lignes.map(x => `${x.q} x ${x.nom}`).join(" + "),
      c.echange ? "oui" : "non", c.branchement ? "oui" : "non", c.solidaire ? "oui" : "non", c.paiement, c.refPrise, c.frais, c.consigne, c.total,
      c.point?.lat, c.point?.lng, c.adresseTexte, c.repere, c.acces, c.creneau, c.langue].map(cell).join(";"));
    const blob = new Blob(["﻿" + cols.join(";") + "\n" + lignes.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `commandes-fare-gaz-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $("#btn-demo").addEventListener("click", () => {
    const ex = [
      ["Mama Teura", "87 12 34 56", -17.5409, -149.5353, "Maison verte après le virage", "pente", "especes", true, true],
      ["Hinano", "89 22 33 44", -17.5523, -149.5551, "Résidence, bâtiment B", "escaliers", "carte", false, false],
      ["Moana", "87 45 67 89", -17.5291, -149.5290, "Portail blanc", "facile", "especes", false, false],
      ["Papa Tama", "89 98 76 54", -17.5612, -149.5982, "Derrière l'église", "servitude", "prise", true, true],
      ["Vaiana", "87 11 22 33", -17.5468, -149.5466, "En face du terrain de foot", "facile", "carte", false, true]
    ];
    const b = bouteilles();
    ex.forEach(([nom, tel, lat, lng, repere, acces, paiement, solidaire, branchement], i) => {
      const bt = b[i % b.length]; const frais = solidaire ? 0 : reglages.fraisLivraison; const fraisBr = branchement && !solidaire ? reglages.fraisBranchement : 0;
      Store.ajouter({ id: nouvelId("EX"), creeLe: Date.now() - (5 - i) * 600000, statut: i === 4 ? "enroute" : "recue", nom, tel, repere, acces,
        point: { lat, lng, precision: null }, adresseTexte: "", creneau: ["asap", "matin", "midi", "apres-midi"][i % 4], paiement,
        monnaie: paiement === "especes" && i === 0 ? 5000 : null, refPrise: paiement === "prise" ? "BON-2026-0142" : "",
        echange: true, branchement, solidaire, langue: i === 3 ? "ty" : "fr",
        lignes: [{ id: bt.id, nom: bt.nom, q: 1, prix: bt.prix, consigne: 0 }], frais, fraisBr, consigne: 0, total: bt.prix + frais + fraisBr });
    });
    Store.ajouterRappel({ id: nouvelId("RP"), creeLe: Date.now() - 900000, nom: "Mama Rose", tel: "87 33 44 55", motif: "commande", fait: false });
    rendreStats(); rendreRappels(); toast("Commandes et rappel d'exemple ajoutés.");
  });
  $("#btn-effacer").addEventListener("click", () => {
    if (!confirm("Effacer toutes les commandes, les rappels et les prix enregistrés ?")) return;
    Store.enregistrer([]); ecrire(CLES.rappels, []); ecrire(CLES.mes, []); localStorage.removeItem(CLES.reglages);
    reglages = { fraisLivraison: CFG.fraisLivraison, fraisBranchement: CFG.fraisBranchement, prix: {} };
    rendreTout(); rendrePrix(); majRecommande(); toast("Données effacées.");
  });

  // ================================================================ Rafraîchissement
  function rendreTout() {
    rendreBouteilles(); rendreRecap(); rendreSuivi(); rendreLivreur(); rendreStats(); majBandeau();
    if ($("#v-simple").classList.contains("active")) rendreEtape();
    if (!$("#zone-gestion").hidden) rendreRappels();
  }
  window.addEventListener("storage", e => { if ([CLES.commandes, CLES.rappels].includes(e.key)) { rendreTout(); majRecommande(); } });

  // ================================================================ Démarrage
  $("#nom-app").textContent = CFG.nom;
  $("#mention-demo").textContent = CFG.mentionDemo;
  document.documentElement.style.setProperty("--c", CFG.couleur);
  majPaiement();
  appliquerLangue();
  majRecommande();
  appliquerFacile();
  afficherVue("v-commander");

  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
