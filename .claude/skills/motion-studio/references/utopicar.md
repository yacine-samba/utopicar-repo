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
- Logo : tuile sombre `#1A1310`, voiture blanche `#F4F1EC`, flèche orange `#FF5A1F`. Fichiers officiels dans
  `video/assets/brand/official/` (logo horizontal fond clair ou sombre, logo en ligne, icône, symbole) : toujours
  partir de ceux-là. L'ancien `video/assets/brand/logo.svg` est un retracé, à ne plus utiliser.
  Sur fond sombre, la tuile disparaît : lui donner un liseré clair (`0 0 0 3px rgba(255,255,255,.16)`) ou la poser sur
  un fond clair.
- **La marque s'écrit toujours « utopicar », en minuscules** (règle de l'utilisateur, 14 oct. 2026) : titres, mots-chocs,
  étiquettes, libellés d'interface recopiés (« Fiche utopicar », « Voir mes alertes sur utopicar »), mentions. Seul le logo
  officiel s'affiche tel quel.
- **Charte actuelle de l'app et du site** (`web/src/app/globals.css`, oct. 2026) :
  - polices : Clash Display (titres, chiffres), Satoshi (texte), Instrument Serif (accents) ;
  - espace connecté sombre : fond `#0b0a09` → `#17100b`, encre `#f4f1ec` ;
  - orange `#ff5a1f` / `#ff8a4c` / `#ffb38a`, gain `#3ecb7f`, attention `#ffc53d`, perte `#ff7a7a` ;
  - courbe `--ease-doux` : `cubic-bezier(.2, .8, .2, 1)`.

  Ce sont les jetons de tous les films de présentation (`film-presentev*`). Leur usage en vidéo est fixé par la DA
  immersive (`da-immersive.md`).
- **Ancienne charte** (premières pubs produit, `video/film/` et `video/film-launch/`, et leurs captures) : Archivo seule (mot-symbole « UTOPICAR » en
  Archivo 800, largeur 125 %), fond clair `#F2F4F7`, encre `#0C0F14`, boutons jaunes `#FFC928`. Elle ne sert plus
  que pour relire ces anciens films. Sur une capture de l'ancien site, le jaune reste celui des vrais boutons : ne pas
  le repeindre.
- Accent des films : l'orange du logo `#FF5A1F` (texte dessus `#1A1310` ou `#160904`).
- CTA historique : « Commente GARAGE pour recevoir l'accès. » — pas de handle, pas d'URL à l'écran (outil privé).
- CTA actuel des vidéos TikTok (oct. 2026) : « Trois analyses offertes avec le code TIKTOK », carton orange + logo +
  pastille « Code TIKTOK · lien en bio ». Le code n'existe qu'une fois la branche `claude/code-tiktok` déployée
  (migration `20261011120000_codes_offerts.sql`) : le vérifier avant toute publication. Aucun essai « 3 jours
  offerts » n'existe : vérifier `offres.ts` avant tout CTA d'offre.

## Chiffres d'une annonce réelle (vidéos « l'analyse sort tout »)
- Source : `marche_annonces` (Supabase, lecture seule) et `public.cote_marche(marque, modele, annee, km, energie)`.
  La base couvre surtout Renault, Volkswagen, Opel, BMW, Audi ; Yaris, Jazz, 207, C3 manquent (collecte locale
  nécessaire, jamais d'Apify).
- Formule de l'outil (`web/src/lib/analyse/bilan.ts`) : revente en 1 à 2 mois = médiane × 0,96 (arrondi 50) ; frais =
  carte grise (CV × 68,95 €, ÷ 2 après 10 ans, + 13,76 €) + 150 € de frais fixes + travaux probables ; prix max =
  revente − frais − 750 €, arrondi aux 50 € inférieurs ; offre = prix max × 0,94 ; objectif = milieu des deux.
- Sans la vraie analyse, les travaux probables manquent : mention « Exemple calculé avec l'outil, hors travaux ».
- Modèles « fiables » et points à vérifier : listes `FIABLES` et `EVITER_GLOBAL` de `fiabilite.ts` (la vidéo dit ce
  que l'analyse dira). Signaux d'arnaque : `vigilance.ts` (compteur lu sur photo, vendeur à l'étranger, acompte,
  livraison, paiement par coupon).
- Vérifier chaque fait dans l'annonce elle-même (boîte, énergie, puissance) avant de l'écrire à l'écran.
- Cotes détaillées réservées aux abonnés : on montre le résultat d'une analyse d'annonce, jamais un tableau de cotes.

## Ce qui a marché avec ce public (v2 → v6)
- Chiffre qui tranche en grand (7 500 €, − 1 200 €, 1 450 € sous la cote) avec surligneur.
- Curseur qui manipule la vraie UI ; pastille flottante « 1 450 € sous la cote ».
- Ton direct, tutoiement : « Et ta marge ? Au pif. », « Tu as 60 secondes ? ».
- Retour de l'utilisateur sur la v1 : « ça va trop vite, beaucoup d'info » → une idée par plan, 2–4 s par idée.

## Captures du site pour les vidéos (oct. 2026)

- Pages du site exportées dans `video/assets/master60/ui/` (accueil animé, rapport, tableau, offres). Pour une vidéo, on
  copie la page d'accueil animée et on remplace seulement l'objet d'exemple (titre, prix, infos, verdict, phrase,
  lignes chiffrées) par les chiffres de la vraie annonce, calcul prudent de l'outil.
- Retirer avant capture : l'en-tête « Fiche Utopicar · en 2 secondes, sans compte », toute mention « exemple ».
- Capture HD (3×) : `techniques.md` § 20.
- Appel à l'action vidéo : mot-clé **ANALYSE** en commentaire (DM avec lien + code) et « 3 analyses offertes · code
  TIKTOK » écrit. **Le code doit être en ligne avant publication** (branche `claude/code-tiktok` non fusionnée en oct.
  2026).
