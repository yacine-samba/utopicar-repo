# MO8 « Les 5 moteurs » : déroulé seconde par seconde (étape 2)

Brief : `brief-mo8.md` (validé le 7 octobre 2026), DA validée le même jour (`film-mo8/da.html`, planche
`renders/review/mo8-da-planche.jpg`). 30,0 s, 1080×1920, 60 i/s, en boucle.

Grille : **120 BPM**, un temps toutes les 0,5 s, une mesure toutes les 2 s (15 mesures). Chaque numéro dure deux
mesures (4 s) et sa palette tombe sur le premier temps. Je recale tout sur la voix à l'étape 4.

## Les sources (vérifiées le 7 octobre 2026)

| N° | Moteur | Distribution | Le défaut retenu | Coût affiché | Sources |
|---|---|---|---|---|---|
| 5 | BMW 116i · 1.6 N13 (avec PSA) · 2011-2015 | **chaîne** | la chaîne s'allonge, cliquetis à froid ; cassée, elle emporte le moteur | **jusqu'à 5 000 €** (chaîne à temps : 500 à 1 200 €) | [AutoCopilot](https://autocopilot.fr/modeles/bmw-serie-1-f20), [ma-bmw.com](https://ma-bmw.com/forum/viewtopic.php?p=958620) |
| 4 | Golf 6 · 1.4 TSI 122 / 160 ch (EA111) · 2008-2012 | **chaîne** (la courroie n'arrive qu'avec l'EA211, sur la Golf 7) | tendeur et chaîne qui s'allongent (60 000 à 100 000 km) ; pistons fragiles sur le 160 ch | **jusqu'à 7 000 €** (chaîne seule : 1 500 à 2 500 €) | [AutoCopilot EA111](https://autocopilot.fr/motorisations/1-4-tsi-ea111), [Fiches-auto](https://www.fiches-auto.fr/avis-volkswagen/avis-unique-264-70473-volkswagen-scirocco-14-tsi-160-ch.php) |
| 3 | Ford 1.0 EcoBoost · Fiesta, Focus · 2011-2018 | **courroie dans l'huile** | durites de refroidissement qui fissurent (surtout 2011-2013), surchauffe, joint de culasse | **jusqu'à 7 000 €** (moteur, témoignages) ; Presse-Citron relève 10 936 € | [Fiches-auto](https://www.fiches-auto.fr/articles-auto/fiabilite-moteurs-essence/s-2306-fiabilite-du-10-ecoboost.php), [Presse-Citron](https://www.presse-citron.net/10-936-euros-reparations-moteur-ecoboost-ford-nouveau-scandale-casse-puretech/), [L'argus (forum, rappel)](https://www.largus.fr/forum-auto/discussion-sur-l-automobile/rappel-ford-focus-1-0-ecoboost-risque-de-surchauffe/314429.html) |
| 2 | Clio 4 · Captur · Mégane 3 · 1.2 TCe 115/120 (H5Ft) · moteurs produits du 1er octobre 2012 au 20 juillet 2016 | **chaîne** (tendeur hydraulique : sans huile, il lâche aussi) | consommation d'huile, parfois plus d'un litre aux 1 000 km ; soupapes abîmées, casse | **jusqu'à 10 000 €** | [UFC-Que Choisir](https://www.quechoisir.org/actualite-moteur-1-2-renault-400-000-voitures-en-danger-n67215/), [Fiches-auto](https://www.fiches-auto.fr/articles-auto/enquete-fiabilite/s-2187-problemes-en-serie-sur-les-moteurs-12-tce-renault.php) |
| 1 | 208 · 2008 · 308 · 1.2 PureTech (EB2) · 2013 - ≈ 2022 | **courroie dans l'huile** | la courroie se désagrège, ses débris bouchent la crépine de la pompe à huile | courroie changée : **≈ 500 €** ; sinon, le moteur | [L'argus](https://www.largus.fr/actualite-automobile/moteur-1-2-puretech-quels-sont-les-vrais-problemes-10653953.html), [Mecazen](https://mecazen.fr/carnet-entretien-auto/peugeot/208-2/probleme-de-courroie-distribution), [GoodMecano](https://www.goodmecano.com/reparation-automobile-par-marque/peugeot/208/remplacement-kit-distribution-et-pompe-a-eau-28) |

**La chute (le six).** La facture est un exemple, cohérent avec les prix relevés :

- kit courroie et pompe à eau : 322 € ;
- main-d'œuvre : 190 €, soit environ 3 h ;
- total : 512 €.

Pour comparer, Mecazen relève 363 à 625 € pour la courroie, et GoodMecano 180 à 450 € de main-d'œuvre pour 3 à 5 h. L'écran porte la mention « Exemple » sur la facture.

Bon à savoir, hors voix : depuis le 18 mars 2024, Stellantis prend en charge les casses de courroie du 1.2 PureTech
jusqu'à 10 ans ou 175 000 km, si le plan d'entretien a été respecté
([caroom](https://www.caroom.fr/blog/stellantis-propose-une-extension-de-garantie-pour-le-problematique-moteur-1-2-puretech-25285.html),
[L'argus](https://www.largus.fr/actualite-automobile/moteur-1-2-puretech-stellantis-lancera-bientot-une-plate-forme-d-indemnisation-30037499.html)).
Ça renforce la chute : une 208 avec ses factures d'entretien est couverte, et tout le monde la fuit quand même. Je ne
le mets pas dans la voix, les conditions exactes ne sont pas publiées.

Mention à l'écran sur chaque numéro : « Coûts : ordres de grandeur relevés · presse spécialisée et propriétaires ».

## Les photos des voitures

Vraies photos des versions exactes, Wikimedia Commons ; auteurs et licences dans `assets/photos-mo8/CREDITS.tsv`.
`scripts/photos-mo8.py` :

- efface les logos et remplace les plaques par des plaques vierges ;
- retourne la Clio et la 208 pour que les cinq regardent à gauche ;
- détoure les voitures (BiRefNet) ;
- étalonne les photos dans la charte.

| N° | Photo | Licence |
|---|---|---|
| 5 | BMW 116i (F20) avant restylage | CC0 |
| 4 | VW Golf VI 1.4 TSI 160 ch | CC BY 3.0, Thomas doerfer : **crédit dans la légende** |
| 3 | Ford Fiesta VII restylée 1.0 EcoBoost | CC BY-SA 3.0 de, M 93 : **crédit dans la légende** |
| 2 | Renault Clio IV | domaine public |
| 1 | Peugeot 208 (première génération), 2014 | domaine public |

Légende du post : « Photos : Thomas doerfer, M 93 / Wikimedia Commons ».

## La voix (enregistrée le 7 octobre 2026, corrigée le 8)

Simon (`mvhJVdVoTWVUtL4keT7W`), eleven_v3. **Prise B retenue par l'utilisateur** (2 prises, 1 054 crédits). Le 8
octobre, règle de l'utilisateur : la cylindrée se dit en litres (« un litre quatre TSI », « un litre deux TCe »,
« un litre deux PureTech »). Les répliques n° 4, n° 2 et n° 1 ont été régénérées seules (2 variantes, 450 crédits) ;
la variante C (`fixC.mp3`) les remplace dans la prise B. Transcription du montage : « 1.4 litre TSI », « 1 litre de
TCE », « 1 litre de PureTech » (whisper écrit « de » pour « deux »). La transcription entend toujours « deux cents
vites » pour « deux cent huit » dans la prise B, gardée telle quelle.

`scripts/vo-mo8.py takeB.mp3 --retenue` :
- répliques définies par leurs mots (faster-whisper small), chacune prise dans sa source, posée à son ancre ;
- découpe aux pauses de plus de 0,3 s ;
- accélération 1,20 (liste) et 1,25 (chute), pauses internes ramenées à 0,12 s, timbre conservé ;
- repères donnés par réplique et rang du mot, début de mot borné au son ;
- la voix finit à 28,5 s.

Le film lit `audio/vo-mo8/vo-timing.json`. La palette tombe sur le numéro, la voiture se range sur son nom,
l'étiquette sort sur le défaut et le tampon tombe sur « Toi ». `scripts/audio-mo8.py` relit les mêmes repères.

```
 0,10  Cinq voitures à ne jamais acheter en achat-revente.
 2,95  Enfin… pas la voiture. Le moteur.
 5,17  Cinq. BMW 116i : la chaîne s'allonge.
 8,70  Quatre. Golf 6, 1.4 TSI : chaîne et pistons.
12,75  Trois. Le 1.0 EcoBoost : il chauffe.
15,80  Deux. Clio 4, 1.2 TCe : il boit son huile.
19,40  Et numéro un : le 1.2 PureTech. Sa courroie baigne dans l'huile.
23,53  Le six ?
24,16  La même 208, courroie changée : cinq cents euros.
26,76  Tout le monde la fuit.
27,52  Toi, tu l'achètes.
```

## La grammaire d'un numéro (4 s, deux mesures)

Les cinq numéros suivent le même schéma ; seuls la pièce et le geste changent. Temps relatifs au début du numéro :

| t | Ce qui se passe |
|---|---|
| +0,0 | La palette tombe sur le chiffre (premier temps). La voiture détourée glisse de la droite au centre ; son reflet glisse sur le sol. |
| +0,6 | Le trait de lumière balaie le capot de la voiture. Derrière lui, la carrosserie devient transparente et la pièce s'allume dans le compartiment moteur. |
| +1,0 | La voiture descend, rétrécit et se range dans le bandeau du bas (nom, moteur, années). La pièce monte et grandit au centre, posée sur le sol. |
| +1,5 | Le défaut se joue (voir le déroulé). La pastille de verre sort de la pièce, reliée par le fil de lumière. |
| +2,0 | Le coût roule au compteur, premier temps de la deuxième mesure ; la mention s'écrit dessous. |
| +3,4 | Sortie : la pièce redescend dans le sol, le bandeau glisse vers la gauche, le chiffre suivant se prépare sur la palette. |

La caméra ne coupe jamais : elle dérive lentement de gauche à droite sur tout le film (la même focale partout), et
chaque nouvelle pièce entre dans le champ par la droite, là où la précédente sort.

## Le déroulé

| t (s) | Image | Texte à l'écran | Voix | Son |
|---|---|---|---|---|
| 0,0 | **Image 0 déjà composée** : « 5 voitures à fuir » en haut, les cinq bandeaux (phares des cinq voitures) numérotés 5 → 1. | 5 voitures à fuir | « Cinq voitures à ne jamais acheter en achat-revente. » | musique dès l'image 0, pulsation grave |
| 0,5 | Les bandeaux entrent un par un, de 5 à 1, sur chaque temps ; les phares s'allument en passant sous le trait de lumière. | | | un « tic » de phare par bandeau |
| 2,0 | Le titre devient « Pas la voiture. » et « voiture » se barre d'un trait orange ; « Le *moteur.* » s'écrit dessous en Fraunces, à la lumière. Sous chaque bandeau, un point orange s'allume à l'endroit du moteur. | Pas la ~~voiture~~. Le *moteur*. | « Enfin… pas la voiture. Le moteur. » | trait qui raye, accord sur « moteur » |
| 3,6 | Les bandeaux se replient vers le haut ; le n° 5 reste et s'ouvre. | | | souffle |
| 4,0 | **N° 5** · palette 5. La BMW 116i blanche entre. | N° 5 | « Cinq. BMW 116i : la chaîne s'allonge. » | coup de palette, impact grave |
| 5,0 | La chaîne et ses deux pignons montent au centre. Le brin gauche se détend, bat, claque contre le patin. | la chaîne *s'allonge* | | cliquetis de chaîne, claquement sec |
| 6,0 | Compteur : 0 → 5 000 €. | jusqu'à 5 000 € | | rouleau du compteur |
| 8,0 | **N° 4** · palette 4. La Golf VI grise entre. | N° 4 | « Quatre. Golf 6, 1.4 TSI : chaîne et pistons. » | coup de palette |
| 9,0 | La chaîne passe et laisse place au piston : une fissure lumineuse court sur la tête, entre les segments. | piston *fissuré* | | craquement métallique |
| 10,0 | Compteur : 0 → 7 000 €. | jusqu'à 7 000 € | | |
| 12,0 | **N° 3** · palette 3. La Fiesta bleue entre. | N° 3 | « Trois. Le 1.0 EcoBoost : il chauffe. » | coup de palette |
| 13,0 | La durite nervurée et le vrai cadran de température : l'aiguille monte dans le rouge, une goutte orange perle au collier et tombe. | il *chauffe* | | sifflement de vapeur, goutte |
| 14,0 | Compteur : 0 → 7 000 €. | jusqu'à 7 000 € | | |
| 16,0 | **N° 2** · palette 2. La Clio IV noire entre. | N° 2 | « Deux. Clio 4, 1.2 TCe : il boit son huile. » | coup de palette |
| 17,0 | La jauge d'huile sort du moteur, en diagonale : le film d'huile est sous le MIN, une goutte tombe. | il boit *son huile* | | glissement de la jauge, goutte |
| 18,0 | Compteur : 0 → 10 000 €, le plus haut. | jusqu'à 10 000 € | | le compteur accélère |
| 20,0 | **N° 1** · palette 1, plus lente (elle hésite d'un temps). La 208 grise entre. | N° 1 | « Et numéro un : le 1.2 PureTech. Sa courroie baigne dans l'huile. » | silence d'un temps, puis impact le plus fort |
| 21,0 | Le bac d'huile en coupe : la courroie crantée tourne, des dents manquent ; les morceaux filent vers la crépine qui se bouche. | la courroie *s'effrite* · crépine *bouchée* | | frottement de courroie, bulles |
| 22,5 | Le coût s'écrit : « courroie ≈ 500 € ». La musique se tend (filtre qui s'ouvre). | courroie ≈ 500 € | | montée |
| 24,0 | **Chute** · la palette passe à **6**. Arrêt net de la musique. | N° 6 | « Le six ? » | arrêt de bande |
| 24,5 | La même 208, entière, posée sur le sol avec son reflet. La facture de verre se pose sous elle : kit, main-d'œuvre, « Courroie changée · 512 € ». | Facture · Exemple | « La même 208, courroie changée : cinq cents euros. » | papier, deux coches |
| 26,8 | Les quatre autres voitures entrent sur les côtés et s'écartent d'elle, floues. | | « Tout le monde la fuit. » | souffle de passage |
| 27,8 | Le tampon orange « *affaire* » s'imprime sur la facture. La musique repart. | *affaire* | « Toi, tu l'achètes. » | coup de tampon sur le premier temps, drop |
| 28,6 | La 208 recule et se range dans un bandeau ; les quatre autres reviennent en bandeaux au-dessus d'elle : on retrouve l'image 0. | 5 voitures à fuir | | souffle inversé |
| 30,0 | Image 0. | | (enchaîne sur « Cinq voitures… ») | boucle |

## Le son

`scripts/audio-mo8.py` → `audio/mix-mo8.wav` (pistes dans `audio/stems-mo8/`, hors git), rapport `docs/mix_report-mo8.txt`.
- Musique *Controlled Drop* à 120 BPM :
  - mesure 13 sur le hook ;
  - mesures 2 à 9 sur la liste, filtre qui s'ouvre à chaque numéro (1,0 → 7,5 kHz) et niveau qui monte ;
  - arrêt de bande sur « Le six ? » ;
  - nappe grave sous la facture ;
  - souffle inversé, puis drop (mesure 55) sur « Toi, tu l'achètes ».
- Bruitages Mixkit (`audio/bank/mo8`) :

| Moment | Son |
|---|---|
| palette | clic mécanique 1131 |
| entrée et rangement | souffles 1490 et 1492 |
| impact de chaque numéro | 2909 |
| compteur | tics 1054 |
| n° 5 | verrou d'engrenage 2858 et 2857 |
| n° 4 | verre contre métal 2183 et marteau 833 |
| n° 3 | gaz qui s'échappe 849 et goutte 3179 |
| n° 2 | raclement métallique 2799 et goutte 1317 |
| n° 1 | mécanique 3117 et bulles 3000 |
| facture | papier 1530 |
| tampon | coup sec 2182 et basse 2299 |

## Images tests

`film-mo8/da.html?s=<n>`, rendues par `scripts/stills.mjs` dans `renders/review/mo8-da-<n>.png` :

1. t ≈ 2,6 s : hook, cinq bandeaux, « Pas la voiture. Le moteur. » (`mo8-da-1.png`).
2. t ≈ 5,6 s : n° 5, chaîne et pignons, BMW 116i, 5 000 € (`mo8-da-2.png`).
3. t ≈ 9,5 s : n° 4, piston fissuré, Golf 6 1.4 TSI, 7 000 € (`mo8-da-7.png`).
4. t ≈ 13,5 s : n° 3, cadran de température et durite qui fuit, 1.0 EcoBoost, 7 000 € (`mo8-da-3.png`).
5. t ≈ 17,5 s : n° 2, jauge d'huile sous le MIN, Clio 4 1.2 TCe, 10 000 € (`mo8-da-8.png`).
6. t ≈ 21,5 s : n° 1, courroie dans l'huile et crépine bouchée, 1.2 PureTech, ≈ 500 € (`mo8-da-4.png`).
7. t ≈ 27,9 s : la chute, la 208, la facture, « affaire » (`mo8-da-5.png`).

Planche : `renders/review/mo8-timeline-planche.jpg` (les sept images dans l'ordre du film).
