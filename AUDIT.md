# Audit de l'application Fare Gaz

Audit de la version 1 (7 novembre 2026) et corrections apportées dans la version 2 (8 novembre 2026).
Méthode : relecture du code, test de tous les écrans dans un navigateur de téléphone simulé
(Chromium, écran de 390 × 844), validation HTML (html-validate), test sans connexion à la bibliothèque de carte.

## Résumé

| Domaine | Version 1 | Version 2 |
| --- | --- | --- |
| Fonctionnement | Tout le parcours marche (commande → livraison → statistiques) | Idem, plus options et ligne d'aide |
| Robustesse | L'app entière plantait si la carte (Leaflet) ne se chargeait pas | Solution de secours : adresse écrite à la main |
| Accessibilité | Boutons parfois trop petits, pas de mode simplifié | Mode facile, zones à toucher de 48 à 60 px, lecture à voix haute |
| Langue | Français seulement | Français, reo tahiti, ou les deux (traduction provisoire à faire relire) |
| Sécurité des données | Correcte pour une démo, à renforcer pour un vrai service | Inchangé : voir « À faire avant la mise en service » |

## Problèmes trouvés et corrigés

| # | Problème (v1) | Gravité | Correction (v2) |
| --- | --- | --- | --- |
| 1 | Si la bibliothèque de carte ne se charge pas (réseau faible, site indisponible), une erreur bloquait toute l'app | Haute | L'app détecte l'absence de carte et propose un champ « Adresse » ; le livreur reçoit l'adresse écrite et un lien d'itinéraire |
| 2 | Téléphone accepté dès 6 chiffres | Moyenne | Vérification d'un numéro polynésien à 8 chiffres (avec ou sans 689) |
| 3 | Boutons + / − de 38 px, sous le minimum conseillé de 44 px | Moyenne | 48 px, et 60 px en mode facile |
| 4 | La fenêtre « Livrée » se fermait même si le paiement n'était pas coché | Moyenne | Elle reste ouverte et affiche un message tant que le paiement n'est pas confirmé |
| 5 | Billet indiqué pour la monnaie inférieur au total accepté | Faible | Message d'erreur |
| 6 | Boutons HTML sans type, attribut crossorigin mal écrit (12 erreurs de validation) | Faible | Corrigé |
| 7 | Icônes emoji lues par les lecteurs d'écran | Faible | Masquées pour les lecteurs d'écran (aria-hidden), onglet actif annoncé |
| 8 | Pas de lien « Aller au contenu », contour de focus peu visible | Faible | Ajoutés |
| 9 | Identifiants de commande pouvant se répéter si deux commandes partent la même milliseconde | Faible | Suffixe aléatoire ajouté |
| 10 | Animations non désactivables | Faible | Respect du réglage « réduire les animations » du téléphone |

## Nouveautés de la version 2

- **Reo tahiti** : boutons FR / TY / FR + TY ; textes rangés dans `langues.js` pour la relecture.
- **Mode facile** : textes et boutons plus grands, champs facultatifs masqués, onglets du personnel cachés.
- **Rappelez-moi pour commander** et **Commander comme la dernière fois** dès l'accueil.
- **Lecture à voix haute** de l'écran (en français : les téléphones n'ont pas de voix tahitienne).
- **Option branchement** : le livreur porte la bouteille jusqu'à la cuisine, la raccorde et vérifie l'absence de fuite.
- **Tarif solidaire** (matahiapo de 60 ans et plus, personnes en situation de handicap) : livraison et branchement offerts, livraison prioritaire.
- **Prise en charge / bon d'aide** comme moyen de paiement, avec numéro à vérifier par le gazier.
- **Accès à la maison** (escaliers, pente, servitude) signalé au livreur.
- **Ligne d'aide** : bouton d'appel et demande de rappel, suivie dans l'espace Gestion.
- **Thème polynésien** : illustration du fenua, bordure inspirée du tīfaifai, suivi de commande en vaʻa.
- **Véhicule** : livraison prévue en utilitaire de taille moyenne.

## À faire avant la mise en service

1. **Base de données partagée** (par exemple Supabase) : aujourd'hui, les commandes restent dans le téléphone qui les passe.
2. **Vrais comptes** pour les livreurs et les gestionnaires : les codes 1234 / 0000 sont visibles dans `config.js`.
3. **Relecture du reo tahiti** par un locuteur confirmé (référence : Fare Vānaʻa – Académie tahitienne).
4. **Fond de carte** : les tuiles d'OpenStreetMap conviennent à une démo ; pour un vrai service, passer par un fournisseur de tuiles qui accepte un usage commercial.
5. **Données personnelles** : page d'information, durée de conservation, possibilité d'effacement. Le tarif solidaire ne demande aucun détail de santé : une simple case.
6. **Dépôt GitHub** : garder la démo publique, mais mettre la version du partenaire dans un dépôt privé.
7. **Tests sur de vrais téléphones** Android d'entrée de gamme, et avec des personnes âgées.
