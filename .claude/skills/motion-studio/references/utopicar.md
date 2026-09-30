# Pack de marque — UTOPICAR Garage

## Le produit en une phrase
Avant d'acheter une voiture pour la revendre, **UTOPICAR te dit ce qu'il te restera, frais déduits, et le prix à ne
pas dépasser.** C'est un outil de pro dans ta poche pour l'achat-revente automobile.

## Public
Acheteurs-revendeurs (particuliers qui font de l'achat-revente, petits marchands VO), actifs sur TikTok.
Douleurs : annonces partout, calculs à la main, marge « au pif », achat trop cher, stock qui dort.
Sensation recherchée : rapide, précis, le chiffre tranche.

## Modules réels (vues de l'app, données démo)
| Module | Ce qu'on montre | Preuve chiffrée (calculée par l'outil sur la base démo) |
|---|---|---|
| Analyser une annonce | Note /100, verdict GO / NO GO, « Il vous reste », « Ne dépassez pas » | Golf VII : 38/100, NO GO, − 1 200 €, plafond 7 500 €, offre conseillée 7 050 € |
| Rapports | Liste des dossiers, comparaison | Clio IV : GO, 92/100, + 1 932 € |
| Recherche en direct | Recherche suivie, nouvelles annonces comparées à la cote | Clio IV diesel : cote 7 850 €, prix réel 1 450 € sous la cote, « Vraie affaire » |
| Tri rapide | Lot d'annonces classées (nécessite l'IA : pas capturable en démo) | — |
| Parc | Véhicules par statut (plaques, achat, vente, marge, jours) | 14 véhicules |
| Tableau de bord | KPI, meilleures affaires, pipeline, marge par véhicule | 4 en stock · 23 800 € immobilisés · 14 820 € de marge réalisée · 1 647 € de marge moyenne · 23 j de rotation · 6 600 € en attente |

**Ces chiffres sont des données de démonstration.** Dans une pub, affiche « Données de démonstration » (petit, lisible,
hors zones interdites) ou remplace-les par de vrais chiffres vérifiés et autorisés.

## Interface réelle
- Fichier : `video/assets/site/utopicar-live.html`, chargé dans Chromium par `video/scripts/ui.mjs` avec `window.claude`
  mocké sur la base démo (`video/scripts/demo-data.mjs`), horloge figée au 29/09/2026 18:00.
- Captures : `capture.mjs` → `assets/ui/` (pages, lignes du rapport, cartes live, KPI, docks en verre transparent) ;
  `capture2.mjs` → `assets/ui2/` (cartes détourées : dossiers, ticket, formulaire de recherche, lignes du parc, KPI,
  panneaux du tableau de bord, icônes de navigation réelles `dock-icons.json`). Densité 3, viewport 390 px CSS.
- Les cartes capturées ont une marge de page grise : les détourer (retirer la marge, rayons réels : cartes 22 px,
  KPI 18 px, `--r-lg` 22 px).
- Le champ « Lien de l'annonce » affiche un exemple réel contenant « leboncoin » et la page Tri rapide nomme
  Leboncoin : **masquer ou ne pas cadrer** (aucune plateforme tierce à l'écran).

## Charte
- Logo : fourni par l'utilisateur (tuile sombre `#1A1310`, voiture blanche `#F4F1EC`, flèche orange `#FF5A1F`).
  Actuellement `video/assets/brand/logo.svg` est **un retracé** d'une image : demander le fichier source.
  Sur fond sombre, la tuile disparaît : lui donner un liseré clair (`0 0 0 3px rgba(255,255,255,.16)`) ou la poser sur
  un fond clair.
- Mot-symbole : « UTOPICAR », Archivo 800, largeur 125 %, interlettrage +0,02 em.
- Police : Archivo (unique, display et UI), servie localement (`assets/site/Archivo-latin.woff2`, italique, TTF 800/125).
- Couleurs du site : encre `#0C0F14`, fond `#F2F4F7`, papier `#FFFFFF`, jaune `#FFC928` (boutons), gain `#0A8F55` /
  `#E4F6EC`, perte `#D93A3A`, plaque `#2447D6` / `#EAEFFF`, attente `#B26A00` / `#FFF2DA`.
- Accent film depuis la v5 : l'orange du logo `#FF5A1F` (texte dessus `#1A1310`). Le jaune reste celui des vrais
  boutons capturés — ne pas le repeindre.
- CTA historique : « Commente GARAGE pour recevoir l'accès. » — pas de handle, pas d'URL à l'écran (outil privé).

## Ce qui a marché avec ce public (v2 → v6)
- Chiffre qui tranche en grand (7 500 €, − 1 200 €, 1 450 € sous la cote) avec surligneur.
- Curseur qui manipule la vraie UI ; pastille flottante « 1 450 € sous la cote ».
- Ton direct, tutoiement : « Et ta marge ? Au pif. », « Tu as 60 secondes ? ».
- Retour de l'utilisateur sur la v1 : « ça va trop vite, beaucoup d'info » → une idée par plan, 2–4 s par idée.
