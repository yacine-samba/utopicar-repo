# MO6 « Ce qui se voit, ce qui se cache » : déroulé seconde par seconde (étape 2)

Brief : `brief-mo6.md` (validé le 7 octobre 2026). 30,0 s, 1080×1920, 60 i/s, en boucle.

Grille provisoire : **120 BPM**, un temps toutes les 0,5 s, une mesure toutes les 2 s (15 mesures). Je la recale sur
la musique ; chaque prix tombe sur un temps, chaque bascule sur un premier temps de mesure.

## Les chiffres et leurs sources

Ordres de grandeur pour une petite citadine (Clio, 208, Polo, C3), pièces et main-d'œuvre en garage indépendant. À
l'écran : « Exemple · ordres de grandeur, petite citadine ».

| Poste | Montant retenu | D'où vient le chiffre |
|---|---|---|
| Phares jaunis | **20 €** | kit de rénovation d'optiques vendu 15 à 40 €, 23,99 € en promotion chez Norauto en octobre 2026 ([Dealabs](https://www.dealabs.com/bons-plans/kit-de-renovation-protech-doptiques-de-phares-3409076)) |
| Rayure superficielle | **30 €** | kits efface-rayures entre 8 et 25 €, rénovateur plus complet vers 50 € ([Touslesprix](https://www.touslesprix.com/achat,kit-efface-rayures-auto.html), [Ornikar](https://www.ornikar.com/code/cours/mecanique-vehicule/entretien/effacer-rayure-voiture)). Valable pour une rayure qui n'a pas traversé le vernis. |
| Intérieur sale | **50 €** | hypothèse : produits textiles et plastiques, microfibres, location d'un injecteur-extracteur pour une journée |
| **Remise en état visible** | **100 €** | |
| Écart de prix gagné | **+ 600 €** | exemple : la même voiture, propre, s'annonce environ 600 € plus cher. Chiffre de bon sens, pas une statistique : mention « Exemple ». |
| Distribution (courroie + pompe à eau) | **600 €** | 400 à 800 € en garage ([AD](https://www.ad.fr/guides/guide-conseil/distribution/combien-coute-une-courroie-de-distribution-prix-et-infos)) ; 445 à 826 € sur une Clio 4 selon le moteur ([Carter-Cash](https://www.carter-cash.com/blog/quel-est-le-prix-pour-changer-la-courroie-de-distribution-sur-une-clio-4/), [iDGARAGES](https://www.idgarages.com/fr-fr/vehicules/renault/renault-clio-iv-courroie-kit-de-distribution)) |
| Embrayage | **700 €** | 450 à 700 € sur Clio, 208, C3 ; jusqu'à 1 000 € et plus avec volant moteur ([Carter-Cash](https://www.carter-cash.com/blog/?p=53735), [Goodmecano](https://www.goodmecano.com/reparation-automobile-par-marque/citroen/c3/remplacement-kit-embrayage-et-volant-moteur-31)) |
| Joint de culasse | **1 200 €** | 1 000 à 1 500 € sur une citadine, 5 à 6 h de main-d'œuvre, plus si la culasse doit être surfacée ([Goodmecano](https://www.goodmecano.com/blog/articles/remplacement-joint-de-culasse)) |

**Les trois tests de visite**

| Test | Ce qu'on dit | Source et limite |
|---|---|---|
| Distribution | « Demande la facture. » | Le changement se fait selon un intervalle de kilomètres et d'années fixé par le constructeur. Certains moteurs ont une chaîne et pas de courroie (c'est le cas de beaucoup de Polo 1.2 de cette génération) : la radiographie montre donc une voiture générique, pas la Polo, et la voix dit « la distribution » sans nommer de modèle. |
| Embrayage | « En quatrième, plein gaz : les tours montent, pas la vitesse ? Il patine. » | Test décrit vers 50 km/h en 4e ou 5e ([Goodmecano](https://www.goodmecano.com/blog/articles/comment-tester-un-embrayage), [Piecesetpneus](https://blog.piecesetpneus.com/?p=171273)). À faire pendant l'essai, sur route dégagée. |
| Joint de culasse | « Mousse blanche sous le bouchon d'huile ? Méfiance. » | Signe classique d'eau dans l'huile. Des petits trajets par temps froid peuvent aussi en laisser : la voix dit « méfiance », jamais « culasse morte ». |

Si tu as tes propres chiffres (vraies factures, vrais écarts de prix), ils remplacent ce tableau.

## La voix (enregistrée le 7 octobre 2026)

Simon (`mvhJVdVoTWVUtL4keT7W`), eleven_v3, 2 prises (1 344 crédits). Prise A retenue : 44,9 s brute, prononciation
vérifiée par une seconde transcription (faster-whisper medium). Mise en place par `scripts/vo-mo6.py` :
- chaque réplique découpée sur le signal, accélérée de 12 % (atempo 1,12, timbre conservé) ;
- « Eux fuient. Toi, tu achètes. » retirée (première coupe prévue) ;
- répliques reposées avec des silences de 0,08 à 0,75 s ; la voix finit à 28,9 s, 1,1 s avant la boucle.

Sorties : `audio/vo-mo6/vo-placed.wav`, `vo-timing.json` (répliques et mots, temps du film). Le film est recalé dessus
(objet `K` de `film-mo6/film.js`).

```
 0,10  Cette voiture a fait fuir tout le monde.
 2,50  Cent euros plus tard, elle vaut six cents de plus.
 5,14  Phares jaunis : vingt euros.
 6,84  Rayure : trente.
 8,19  Intérieur : cinquante.
10,31  Ce qui coûte vraiment ne se voit pas.
12,54  La distribution : six cents.  14,11  Demande la facture.
15,32  Embrayage : sept cents.  16,62  En quatrième, plein gaz : les tours montent, pas la vitesse ?  20,62  Il patine.
21,48  Joint de culasse : mille deux cents.  23,41  Mousse blanche sous le bouchon d'huile ?  25,15  Méfiance.
26,07  Et la voiture parfaite ?  27,41  Personne n'a regardé sous le bouchon.
```

Ouverture B (même corps, à générer si on la teste) : « Une rayure : trente euros. Une distribution : six cents. Une
seule des deux se voit. »

## Les plans réels (Mixkit, licence gratuite)

| Plan | Mixkit | Usage |
|---|---|---|
| Polisseuse sur une aile noire, près du phare | 47830 | rayure et phares, vignette de verre |
| Injecteur-extracteur sur moquette | 36522 | intérieur |
| Siège en cuir nettoyé à la microfibre | 47832 | intérieur, variante |
| Compteur et compte-tours, moteur qui monte | 24815 | fond de la scène embrayage |
| Compte-tours en gros plan | 12054 | variante embrayage |
| Mains dans un compartiment moteur, vase d'expansion | 4716 | fond de la scène culasse |

Aucun visage (les plans avec visage ont été écartés). Les vidéos restent hors du dépôt (`assets/stock/`), comme pour
MO5. Images clés dans `film-mo6/frames/`.

## La voiture qui fait fuir

`scripts/polo-dirty-mo6.py` fabrique trois calques posés sur ta Polo détourée (`assets/photos-mo6/`) :
- `crasse.png` : carrosserie ternie, poussière, coulures sous les vitres ;
- `phares.png` : voile jaune sur les deux optiques ;
- `rayure.png` : rayure claire sur la portière avant.

Chaque calque s'efface séparément sous le trait de lumière.

## Le déroulé

Caméra : une seule prise, jamais immobile. Fond #08070a → #1d1512, sol en grille, grain. Une seule couleur d'accent,
l'orange.

| t (s) | Image | Caméra | Texte à l'écran | Voix | Son |
|---|---|---|---|---|---|
| 0,0 | **Image 0 déjà composée** : la Polo terne, phares jaunes, rayure. Le trait de lumière vertical est déjà sur l'aile avant. | avance lente, rotation de 9° | | « Cette voiture a fait fuir tout le monde. » (0,1-2,0) | musique dès l'image 0 |
| 0,5 | Le trait balaie la voiture de gauche à droite ; à son passage, trois points s'allument : phare, portière, pare-brise. | | | | trois « tic » de verre sur les temps |
| 1,0 | Trois étiquettes de verre sortent des points, reliées par un fil de lumière : « Phares jaunis », « Rayure », « Intérieur sale ». | léger recul | Phares jaunis · Rayure · Intérieur sale | | |
| 2,0 | « 100 € » s'écrit en haut, à la lumière ; la flèche se trace ; « + 600 € » s'écrit en Fraunces. | | 100 € → + 600 € | « Cent euros plus tard, elle vaut six cents de plus. » (2,1-4,0) | montée, puis impact sur « six cents » |
| 4,0 | La caméra plonge vers le phare gauche. Le chiffre 100 € remonte et devient un compteur « Remise en état : 0 € ». | travelling avant rapide, flou de bougé | | « Phares jaunis : vingt euros. » (4,1-5,4) | souffle de passage |
| 4,6 | Le trait de lumière passe sur l'optique : le voile jaune s'efface, le phare redevient clair. Vignette du plan 47830. « 20 € » s'écrit. | | 20 € | | polisseuse (Mixkit) |
| 5,5 | Travelling latéral vers la portière. Gros plan dans un cadre de verre. | travelling latéral | | « Rayure : trente. » (5,6-6,3) | |
| 6,0 | Le trait passe : la rayure disparaît. « 30 € » s'écrit au trait. Compteur : 50 €. | | 30 € | | crissement léger, puis brillance |
| 7,0 | La caméra traverse le pare-brise : plan 36522 (injecteur sur la moquette) dans une carte de verre. « 50 € » s'écrit. Compteur : 100 €. | traversée de la vitre | 50 € | « Intérieur : cinquante. » (7,0-7,9) | aspiration |
| 8,0 | Recul : la Polo entière, propre et brillante. La crasse part en poussière lumineuse. Au-dessus, l'écart « + 600 € » roule. | grand recul, orbite | + 600 € | « Eux fuient. Toi, tu achètes. » (8,2-9,6) | accord plein, premier temps |
| 10,0 | La caméra tourne autour de la voiture. Un trait vertical la traverse : derrière lui, elle devient radiographie (contour, roues, moteur en lignes de lumière). | orbite de 20° | Ce qui coûte / *ne se voit pas.* | « Ce qui coûte vraiment ne se voit pas. » (10,2-12,2) | la musique se creuse, basse seule |
| 12,0 | Radiographie complète. La caméra plonge vers le moteur. | plongée | | | |
| 12,5 | La courroie s'allume en orange. Étiquette « Distribution · 600 € ». | | Distribution 600 € | « La distribution : six cents. » (12,6-14,0) | impact grave |
| 14,0 | Une facture de verre glisse : date, kilométrage, deux coches qui s'écrivent. | légère dérive | Demande la facture | « Demande la facture. » (14,1-15,0) | papier, deux tics |
| 15,5 | Le trait glisse vers l'embrayage, qui s'allume. | travelling latéral | Embrayage 700 € | « Embrayage : sept cents. » (15,6-16,8) | impact grave |
| 16,8 | Fondu dans le tableau de bord (plan 24815). Deux cadrans de verre au premier plan : l'aiguille des tours monte vers 6 000, la vitesse reste à 50. | caméra fixe, vibration légère | En 4e à 50, plein gaz. | « En quatrième, plein gaz : les tours montent, pas la vitesse ? » (16,9-19,5) | moteur qui monte en régime, sans accélérer |
| 19,6 | « Il patine. » s'écrit en Fraunces. | | *Il patine.* | « Il patine. » (19,6-20,4) | coupure nette du moteur |
| 20,5 | Retour dans la radiographie : la culasse s'allume. | plongée vers le haut du moteur | Joint de culasse 1 200 € | « Joint de culasse : mille deux cents. » (20,6-22,4) | impact grave, le plus fort |
| 22,5 | Plan 4716 (compartiment moteur) en fond. Gros plan dessiné sur le bouchon d'huile : il se dévisse, la mousse blanche apparaît en dessous. | zoom lent | | « Mousse blanche sous le bouchon d'huile ? » (22,5-24,4) | bouchon qui se dévisse |
| 24,5 | « Méfiance. » s'écrit. | | *Méfiance.* | « Méfiance. » (24,5-25,2) | silence d'un demi-temps |
| 25,5 | Grand recul : une Polo brillante, « Comme neuve · ♥ 38 personnes intéressées ». | recul, orbite lente | Comme neuve | « Et la voiture parfaite ? » (25,6-26,6) | la musique revient, plus claire |
| 26,7 | Une loupe de verre s'ouvre sur le capot : le dessous du bouchon, mousse blanche, lueur rouge. | | Personne n'a regardé / *sous le bouchon.* | « Personne n'a regardé sous le bouchon. » (26,7-28,6) | battement grave sous la loupe |
| 28,6 | La loupe se referme, le trait de lumière balaie la voiture de droite à gauche : elle redevient terne, phares jaunes, rayure. | retour à la position de l'image 0 | | | souffle inversé |
| 30,0 | Image 0. | | | (enchaîne sur « Cette voiture a fait fuir tout le monde ») | boucle |

## Images tests

`film-mo6/tests.html`, rendues dans `renders/review/mo6-test-1.png` à `mo6-test-5.png`, planche `mo6-planche.jpg` :
1. t = 1,8 s : la voiture qui fait fuir, ses trois étiquettes, « 100 € → + 600 € ».
2. t = 6,0 s : la rayure effacée à moitié sous le trait, « 30 € » en train de s'écrire, compteur à 50 €.
3. t = 11,6 s : la bascule en radiographie, « Ce qui coûte / ne se voit pas », distribution allumée.
4. t = 19,6 s : les deux cadrans, les tours montent et pas la vitesse, « Il patine ».
5. t = 26,7 s : la voiture « comme neuve » et la loupe sur le bouchon d'huile.
