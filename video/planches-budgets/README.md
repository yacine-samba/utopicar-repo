# Planches · 5 concepts achat-revente par budget

Statut : **planches à valider**. Rien n'est tourné, rien n'est rendu en vidéo. Chaque planche est une image 9:16 par
découpage, avec la voix, le mouvement, la preuve et les éléments à fournir.

## Ce qu'il y a ici

- `planche-1-dictionnaire.html` … `planche-5-compteur.html` : une planche complète par concept (diagnostic, trois
  accroches, art du hook, découpage 9:16, script, contrôle qualité, variante, à fournir, sources).
- `../renders/planches-budgets/planche-N-*.png` : rendu de chaque planche (Chromium, 1440 px de large).
- `../scripts/planches-budgets.py` : source unique. Pour régénérer : `python3 video/scripts/planches-budgets.py`.

## Les 5 concepts

| # | Concept | Budget | Voiture | Accroche (image 0) | Point de vigilance |
|---|---|---|---|---|---|
| 1 | Le dictionnaire du vendeur | 2 000 € | Citroën C1 2007–2009, ≈ 150 000 km | « Juste un voyant, rien de grave. » Jusqu'à 1 500 € | Fourchettes de l'outil : toujours « jusqu'à » |
| 2 | Quinze minutes (l'alerte) | 5 000 € | Dacia Sandero 2014, 110 000 km | Scénario fictif étiqueté | Délai non mesuré : risque de surpromesse élevé. **À décider** |
| 3 | Deux 208, un mot | 5 000 € | Peugeot 208 I 2014 | « Deux 208 de 2014 à 5 000 euros. Un mot les sépare. » | Rappel 110 et 130 ch, périmètre à recouper |
| 4 | Choisis ta voiture | 20 000 € | Kia Niro hybride 2019 contre Mercedes Classe A 2018–2020 | « Même prix : 20 000 euros. Laquelle est sous sa cote ? » | Classe A non ajustée ; aucune donnée de fiabilité |
| 5 | Le compteur qui recule | 10 000 € | Dacia Duster 2016, 110 000 km | Exemple fictif : 110 000 ≠ 168 000 | Chiffre UFC-Que Choisir à recouper |

Durées estimées à 3,1 mots/s (Simon × 1,2) : concept 1 ≈ 29 s, 2 ≈ 23 s (à allonger ou à laisser respirer),
3 ≈ 27 s, 4 ≈ 30 s, 5 ≈ 28 s. À vérifier à voix haute avant tout enregistrement.

## Ce qui était faux dans les planches du 11 octobre

Les planches précédentes (`video/scripts/planche-concepts.py`, `video/docs/concepts_motion_oct2026.md`) ne peuvent pas
être reprises telles quelles :

- « Cette Mégane 3 à 1 500 € est restée en ligne 15 minutes » était présentée comme un vécu (« ton vécu »). Désormais :
  scénario fictif étiqueté « EXEMPLE FICTIF » sur chaque plan, prix de l'exemple signalé.
- « Mercedes à 19 990 €, Yaris à 8 990 € : une des deux te fait perdre 2 700 € » : chiffres sans source. Remplacés par
  les médianes de la base et la formule de `bilan.ts`.
- « Courroie dans l'huile » appliqué à tous les PureTech. Le rappel vise les 110 et 130 ch fabriqués de mars 2013 à
  avril 2017 ; le 82 ch n'y figure pas (sources secondaires, à recouper).
- « Jusqu'à 3 450 € » présenté comme un prix courant : c'est la somme des maxima, dite comme cas extrême.
- Photo Pexels d'une 208 mise en miroir : ni la bonne génération ni le bon moteur. Désormais, photos exactes à fournir.
- Un CTA placé dans la bande basse (sous y = 1 480 px) : interdit par `video/CLAUDE.md`.
- Le script de planches ne tournait pas ici (polices Windows, images `renders/maquette-concepts/f*.png` absentes).
  Le générateur est refait : Chromium headless, aucun chemin Windows.
- Les hooks n'avaient ni trois accroches, ni verrous testés, ni risque de surpromesse écrit. Désormais, c'est dans
  chaque planche.

## Recherches (16 oct. 2026)

- **Fiabilité par modèle** : pas de baromètre français trouvé. Les classements disponibles viennent de sites de vente
  (indicatifs). La Yaris III et la Corolla hybride y ressortent comme robustes. Non utilisé dans les planches : aucune
  source fiable par modèle pour les modèles retenus.
- **Délai de vente** : 25,5 jours entre particuliers contre 62,5 pour un professionnel (Actu-Automobile, 2022). Un site
  commercial annonce 18 jours en 2026, sans méthode. Chiffre ancien : utilisé seulement en variante du concept 2.
- **HistoVec** : service gratuit de l'État ; les relevés des contrôles techniques y sont affichés (intégrés vers 2021,
  selon L'argus). Limites : contrôles en France métropolitaine seulement ; c'est le propriétaire qui génère le rapport,
  l'acheteur le demande.
- **PureTech 1.2** : rappel constructeur de 2020 (110 et 130 ch, fabriqués de mars 2013 à avril 2017, Peugeot, Citroën,
  DS) ; second rappel fin 2022 (versions turbo) ; troisième génération à chaîne (2023). Vérification fiable : le numéro
  de châssis, chez un concessionnaire.
- **Fraude au compteur** : 1 voiture d'occasion sur 10 (9,6 %, UFC-Que Choisir), repris du brief du 12 octobre. Non
  revérifié aujourd'hui : à recouper avant tournage.

## Chiffres de la base (prix affichés, lecture du 16 oct. 2026)

| Véhicule | Cohorte | Annonces | Médiane | Méthode |
|---|---|---|---|---|
| Citroën C1 | 2007–2009, 130 000–170 000 km | 113 | 2 920 € | médiane brute |
| Citroën C1 | 2010, 110 000 km, essence | 429 | 3 599 € (p25 3 089) | `cote_marche`, ajustée |
| Dacia Sandero | 2014, 110 000 km, essence | 171 | 6 407 € (p25 5 379) | `cote_marche`, ajustée |
| Peugeot 208 | 2014, 110 000 km, essence | 411 | 5 386 € (p25 4 480) | `cote_marche`, ajustée |
| Dacia Duster | 2016, 110 000 km, essence | 326 | 8 481 € (p25 7 671, p75 9 568) | `cote_marche`, ajustée |
| Kia Niro | 2019, 60 000 km, hybride | 169 | 17 562 € (p25 16 578) | `cote_marche`, ajustée |
| Mercedes Classe A | 2018–2020, 45 000–75 000 km | 402 | 23 490 € (p25 21 490) | médiane brute, non ajustée |
| Peugeot 3008 | 2019, 60 000 km, diesel | 742 | 17 298 € | `cote_marche`, ajustée (variante du concept 4) |

Méthode de revente (`web/src/lib/analyse/bilan.ts`) : revente normale = médiane × 0,96, arrondie aux 50 €. Les frais, la
carte grise et les travaux ne sont pas dans les chiffres des planches.

## Produit : deux points à traiter avant tout tournage

1. `web/src/lib/analyse/fiabilite.ts` classe toutes les 1.0 et 1.2 PureTech « à éviter », quelle que soit la puissance.
   Le rappel, lui, vise les 110 et 130 ch fabriqués de 2013 à 2017. Il faut corriger la règle avant de montrer l'outil
   sur une 208 de 82 ch.
2. La colonne `ch` de `marche_annonces` ne donne aucun résultat pour les 208 essence de 2013 à 2016 : impossible,
   avec la base actuelle, de comparer les prix du 82 et du 110 ch.

## Décisions attendues

- **Concept 2** : le garder avec un scénario étiqueté, le remplacer par la variante sourcée, ou l'abandonner. Si la
  promesse « dès qu'elle apparaît » reste, il faut mesurer le délai de notification de l'alerte.
- **Budgets** : 2 000 €, 5 000 € (deux concepts), 10 000 €, 20 000 €. Confirmer ou changer.
- **Photos exactes** à fournir : liste dans la section « À fournir » de chaque planche. Pas de photo « proche ».
- **Voix** : aucune voix n'est générée. Les durées sont des estimations.
