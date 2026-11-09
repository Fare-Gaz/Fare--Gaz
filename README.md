# Fare Gaz — Livraison de bouteilles de gaz à domicile, pour tous

Application web (installable sur téléphone) pour commander une bouteille de gaz et se la faire livrer
à domicile à Tahiti : point GPS exact, branchement de la bouteille, paiement à la livraison,
en français et en reo tahiti, avec un mode facile pour les personnes âgées.

> **Démonstration** — application non affiliée à un fournisseur de gaz.
> Les prix et le numéro de la ligne d'aide sont des exemples à remplacer.
> Le reo tahiti est une traduction provisoire, à faire relire par un locuteur.

## Ce que fait l'app

| Espace | Fonctions |
| --- | --- |
| 🛒 **Commander** | Choix des bouteilles, échange ou consigne, point GPS ou adresse écrite, repère et accès (escaliers, pente…), créneau, option **branchement**, **tarif solidaire** (matahiapo, handicap), paiement en espèces, par carte ou **prise en charge / bon d'aide** |
| 📦 **Mes commandes** | Suivi en vaʻa (Reçue → En route → Livrée), annulation, « Commander comme la dernière fois » |
| 🚚 **Livreur** (code `1234`) | Carte des livraisons, priorité aux tarifs solidaires, itinéraire, appel, confirmation du paiement, de la bouteille vide et du branchement |
| 📊 **Gestion** (code `0000`) | Chiffres du jour, demandes de rappel de la ligne d'aide, prix et options, export CSV, données d'exemple |
| En haut | **Affichage** (langue FR / reo tahiti / les deux, **mode simple matahiapo**, lecture à voix haute) et **Aide** (appel ou demande de rappel) |
| 👵🏽 **Mode simple** | Pour les matahiapo : une question par écran (bouteille → lieu → coordonnées → vérification), gros boutons Suivant / Retour, « au même endroit que la dernière fois ? » |

## Mettre l'app en ligne avec GitHub Pages

1. Ouvre ton dépôt `fare-gaz` sur GitHub (ou crée-le).
2. **Add file → Upload files**, puis glisse **tout le contenu** du dossier, y compris le dossier `icons`
   et le fichier `.nojekyll`. Les fichiers déjà présents sont remplacés.
3. **Commit changes**.
4. Si ce n'est pas déjà fait : **Settings → Pages → Deploy from a branch**, branche `main`, dossier `/ (root)`, **Save**.
5. Après une ou deux minutes : `https://<ton-compte>.github.io/fare-gaz/`.
6. Sur Android : Chrome → menu ⋮ → **Ajouter à l'écran d'accueil**.

Si l'ancienne version reste affichée sur le téléphone, ferme l'app et rouvre-la (la nouvelle version remplace l'ancienne au rechargement).

## Adapter l'app à un partenaire

- **`config.js`** : nom, couleur, langue de départ, prix, consignes, coût de livraison et de branchement,
  tarif solidaire, numéro et horaires de la ligne d'aide, véhicule, codes d'accès, centre de la carte.
- **`langues.js`** : tous les textes en français et en reo tahiti. Un traducteur peut tout relire ici sans toucher au code.

## Démontrer l'app en rendez-vous

1. **Gestion** → `0000` → **Ajouter des commandes d'exemple**.
2. **Livreur** → `1234` : livraisons sur la carte, avec badges « Solidaire », « Branchement », « Chemin en pente ».
3. **Commander** : passe une commande avec « Me localiser » (écran de vérification avant l'envoi), puis **Affichage → Mode simple** et **Les deux** langues.
4. **Aide** : demande un rappel, puis montre-le dans **Gestion**.

## Fichiers

```
index.html     page de l'application
style.css      apparence (thème polynésien, mode facile)
app.js         fonctionnement
config.js      réglages (marque, prix, options, ligne d'aide, codes)
langues.js     textes en français et en reo tahiti
manifest.json  installation sur téléphone
sw.js          ouverture rapide et hors connexion
icons/         icônes
.nojekyll      pour GitHub Pages
AUDIT.md       audits (technique v2, design et facilité d'utilisation v3)
README.md      ce fichier
```

## Limites

Les commandes sont gardées **dans le navigateur de l'appareil** : c'est une démonstration.
Pour un vrai service, il faut une base de données partagée (par exemple Supabase), de vrais comptes
pour le personnel et la relecture du reo tahiti. Détails dans `AUDIT.md`.

Carte : © contributeurs [OpenStreetMap](https://www.openstreetmap.org/copyright), bibliothèque [Leaflet](https://leafletjs.com).
