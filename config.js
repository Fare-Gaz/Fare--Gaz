// =============================================================
//  Fare Gaz — réglages de l'application
//  Modifie ce fichier pour adapter l'app à un partenaire gazier.
//  Les prix et le numéro d'aide ci-dessous sont des EXEMPLES.
// =============================================================
window.FARE_GAZ_CONFIG = {
  nom: "Fare Gaz",
  couleur: "#0e7c86",          // bleu lagon
  mentionDemo: "Démonstration — application non affiliée à un fournisseur de gaz. Prix d'exemple.",

  // Langue au démarrage : "fr", "ty" (reo tahiti) ou "both" (les deux)
  langueDefaut: "fr",

  // Coût de livraison par commande (en francs XPF)
  fraisLivraison: 500,
  // Option : le livreur porte la bouteille jusqu'à la cuisine et la branche
  fraisBranchement: 500,

  // Tarif solidaire : pour les matahiapo (60 ans et +) et les personnes
  // en situation de handicap. Le livreur peut demander un justificatif.
  tarifSolidaire: {
    actif: true,
    livraisonOfferte: true,
    branchementOffert: true
  },

  // Ligne d'aide (hotline) — numéro fictif à remplacer
  hotline: {
    numero: "40 00 00 00",
    horaires: "Du lundi au samedi, de 6 h à 18 h"
  },

  // Véhicule de livraison
  vehicule: "Utilitaire de taille moyenne",

  // Bouteilles proposées. prix = prix du gaz (échange d'une bouteille vide),
  // consigne = ajoutée si le client n'a pas de bouteille vide à rendre.
  bouteilles: [
    { id: "acier-13",     nom: "Propane 13 kg",   detail: "Bouteille acier",               prix: 3600, consigne: 6000 },
    { id: "composite-10", nom: "Composite 10 kg", detail: "Bouteille légère, translucide", prix: 3000, consigne: 7500 },
    { id: "acier-6",      nom: "Propane 6 kg",    detail: "Petite bouteille acier",        prix: 1900, consigne: 4500 }
  ],

  // Codes d'accès de la démo (à remplacer par de vrais comptes avant la mise en service)
  pinLivreur: "1234",
  pinGestion: "0000",

  // Centre de la carte au démarrage : Papeete
  centreCarte: [-17.5350, -149.5690],
  zoomCarte: 13
};
