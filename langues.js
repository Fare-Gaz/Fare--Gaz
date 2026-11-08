// =============================================================
//  Fare Gaz — textes de l'application en français et en reo tahiti
//
//  ⚠ Le reo tahiti ci-dessous est une TRADUCTION PROVISOIRE.
//  Elle doit être relue et corrigée par un locuteur confirmé
//  (référence : dictionnaire du Fare Vānaʻa – Académie tahitienne)
//  avant toute mise en service.
//
//  Quand une clé n'a pas de traduction "ty", l'app affiche le français.
//  Écriture : ʻeta = ʻ (U+02BB) ; tārava = ā ē ī ō ū
// =============================================================
window.FARE_GAZ_TEXTES = {
  // En-tête et navigation
  slogan:          { fr: "Ton gaz livré jusqu'au fare", ty: "Tō ʻoe gaz, e hōpoihia i tō ʻoe fare" },
  iaorana:         { fr: "ʻIa ora na !", ty: "ʻIa ora na !" },
  bienvenue:       { fr: "Commande ta bouteille de gaz : on te l'apporte à la maison.", ty: "A tītau i tō ʻoe mōhina gaz : e hōpoi mātou i tō ʻoe fare." },
  tabCommander:    { fr: "Commander", ty: "Tītau" },
  tabSuivi:        { fr: "Mes commandes", ty: "Tāʻu mau tītauraʻa" },
  tabLivreur:      { fr: "Livreur", ty: "Taʻata hōpoi" },
  tabGestion:      { fr: "Gestion", ty: "Faʻaterehaʻa" },
  btnFacile:       { fr: "Mode facile", ty: "Mea ʻohie" },
  btnEcouter:      { fr: "Écouter", ty: "Faʻaroʻo" },
  btnAide:         { fr: "Aide", ty: "Tauturu" },
  bandeauTy:       { fr: "Reo tahiti : traduction provisoire, à faire relire par un locuteur." },

  // Accès rapide (mode facile)
  btnRappel:       { fr: "Rappelez-moi pour commander", ty: "A niuniu mai iāʻu" },
  btnRecommande:   { fr: "Commander comme la dernière fois", ty: "Tītau mai te taime hopeʻa" },
  aideRappel:      { fr: "Laisse ton nom et ton numéro : on t'appelle et on passe la commande pour toi." },

  // Étape 1
  etape1:          { fr: "Ta bouteille", ty: "Tō ʻoe mōhina" },
  echange:         { fr: "J'ai une bouteille vide à échanger", ty: "E mōhina pau tāʻu e taui" },
  aideEchange:     { fr: "Le livreur repart avec ta bouteille vide.", ty: "E rave te taʻata hōpoi i tō ʻoe mōhina pau." },
  aideConsigne:    { fr: "Sans bouteille vide, la consigne de la bouteille est ajoutée." },

  // Étape 2
  etape2:          { fr: "Lieu de livraison", ty: "Te vāhi hōpoiraʻa" },
  btnGps:          { fr: "Me localiser", ty: "ʻImi i tōʻu vāhi" },
  aideCarte:       { fr: "Touche la carte pour placer l'épingle, puis déplace-la si besoin.", ty: "A tuʻu i te tāpaʻo i niʻa i te hōhoʻa fenua." },
  sansCarte:       { fr: "La carte ne s'affiche pas. Décris ton adresse ci-dessous : commune, quartier, repères." },
  adresseTexte:    { fr: "Adresse (commune, quartier, chemin)" },
  repere:          { fr: "Repère pour le livreur", ty: "Tāpaʻo nō te taʻata hōpoi" },
  reperePh:        { fr: "Ex. : portail bleu, servitude après le magasin" },
  acces:           { fr: "Accès à la maison", ty: "Te ʻēʻa i te fare" },
  accesFacile:     { fr: "Facile, au bord de la route" },
  accesEscaliers:  { fr: "Escaliers" },
  accesPente:      { fr: "Chemin en pente" },
  accesServitude:  { fr: "Servitude étroite" },

  // Étape 3
  etape3:          { fr: "Tes coordonnées", ty: "Tō ʻoe iʻoa e tō ʻoe niuniu" },
  nom:             { fr: "Nom", ty: "Iʻoa" },
  tel:             { fr: "Téléphone", ty: "Niuniu" },

  // Étape 4
  etape4:          { fr: "Options et paiement", ty: "Te mau hinaʻaro e te aufauraʻa" },
  creneau:         { fr: "Quand ?", ty: "Afea ?" },
  crAsap:          { fr: "Dès que possible", ty: "Ia vitiviti" },
  crMatin:         { fr: "Matin (7 h – 11 h)", ty: "Poipoi (7 h – 11 h)" },
  crMidi:          { fr: "Midi (11 h – 14 h)", ty: "Avatea (11 h – 14 h)" },
  crApresMidi:     { fr: "Après-midi (14 h – 17 h)", ty: "Ahiahi (14 h – 17 h)" },
  branchement:     { fr: "Branchement de la bouteille", ty: "E tāmau te taʻata hōpoi i te mōhina" },
  aideBranchement: { fr: "Le livreur porte la bouteille jusqu'à la cuisine, la raccorde et vérifie qu'il n'y a pas de fuite." },
  solidaire:       { fr: "Matahiapo (60 ans et +) ou personne en situation de handicap" },
  aideSolidaire:   { fr: "Tarif solidaire : livraison et branchement offerts, livraison prioritaire. Un justificatif peut être demandé." },
  paiement:        { fr: "Paiement à la livraison", ty: "Aufau i te taeraʻa mai" },
  especes:         { fr: "Espèces", ty: "Moni" },
  carte:           { fr: "Carte bancaire" },
  priseEnCharge:   { fr: "Prise en charge / bon d'aide" },
  refPrise:        { fr: "Numéro du bon ou de la prise en charge" },
  aidePrise:       { fr: "Le gazier vérifie la prise en charge avant la livraison." },
  monnaie:         { fr: "Je paierai avec (pour préparer la monnaie)" },

  // Récapitulatif
  recap:           { fr: "Récapitulatif", ty: "Te tāʻatoʻaraʻa" },
  choisirBouteille:{ fr: "Choisis au moins une bouteille." },
  livraison:       { fr: "Livraison", ty: "Hōpoiraʻa" },
  consigne:        { fr: "Consigne" },
  offert:          { fr: "offert", ty: "ʻaita e aufau" },
  total:           { fr: "Total", ty: "Tāʻatoʻa" },
  btnCommander:    { fr: "Commander", ty: "Tītau" },

  // Suivi
  aucuneCommande:  { fr: "Aucune commande pour l'instant.", ty: "ʻAita ā e tītauraʻa." },
  recue:           { fr: "Reçue", ty: "Ua fāriʻihia" },
  enroute:         { fr: "En route", ty: "Tei te porōmu" },
  livree:          { fr: "Livrée", ty: "Ua tae" },
  annulee:         { fr: "Annulée", ty: "Ua faʻaorehia" },
  annuler:         { fr: "Annuler la commande", ty: "Faʻaore" },
  vehiculeTxt:     { fr: "Livraison en utilitaire de taille moyenne" },
  merci:           { fr: "Māuruuru ! Commande envoyée.", ty: "Māuruuru ! Ua tonohia." },

  // Aide / hotline
  aideTitre:       { fr: "Besoin d'aide ?", ty: "Tauturu ?" },
  aideTexte:       { fr: "Notre équipe t'écoute : elle répond à tes questions et peut passer la commande pour toi." },
  btnAppeler:      { fr: "Appeler", ty: "Niuniu" },
  btnEtreRappele:  { fr: "Être rappelé", ty: "A niuniu mai" },
  motif:           { fr: "C'est pour…" },
  motifCommande:   { fr: "Commander une bouteille" },
  motifProbleme:   { fr: "Un problème avec une livraison" },
  motifQuestion:   { fr: "Une question" },
  rappelEnvoye:    { fr: "C'est noté : on te rappelle très vite. Māuruuru !" },
  fermer:          { fr: "Fermer", ty: "ʻŌpani" }
};
