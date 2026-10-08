# MO9 « 974 € » : déroulé seconde par seconde (étape 2)

Brief : `brief-mo9.md` (validé le 8 octobre 2026, ouverture A). 29,6 s, 1080×1920, 60 i/s, en boucle.
Images tests : `renders/review/mo9-tests-planche.jpg` (5 images clés), `mo9-tests-360.jpg` (test à 360 px de large),
page source `film-mo9/tests.html` (`node scripts/stills.mjs film-mo9/tests.html 1,2,3,4,5 renders/review/mo9-test`).

Grille provisoire : **120 BPM**, un temps toutes les 0,5 s, une mesure toutes les 2 s, comme MO5 (Controlled Drop recalé
à 120 BPM). Les débits tombent sur les temps, les grands moments sur les premiers temps de mesure. Le minutage se recale
mot à mot sur la voix à l'étape 4.

## La voiture

Une **Dacia Sandero II** blanche (2012-2020) : la voiture type du débutant en achat-revente, absente de MO8.

| Choix | Photo | Auteur, licence | Statut |
|---|---|---|---|
| **a (retenue pour les tests)** | [2013 Dacia Sandero II front](https://commons.wikimedia.org/wiki/File:2013_Dacia_Sandero_II_front.JPG) | Corvettec6r, **CC0** (aucun crédit obligatoire) | détourée : `assets/photos-mo9/sandero-a.png` |
| b | [Sandero TCe 90 Lauréate (II), Münster 2013](https://commons.wikimedia.org/wiki/File:Dacia_Sandero_TCe_90_eco%C2%B2_Laur%C3%A9ate_(II)_%E2%80%93_Frontansicht,_21._April_2013,_M%C3%BCnster.jpg), bleue | M 93, CC BY-SA 3.0 de (crédit dans la légende du post) | original seulement |
| c | [2014 Dacia Sandero Access 1.1](https://commons.wikimedia.org/wiki/File:2014_Dacia_Sandero_Access_1.1_Front.jpg), boucliers noirs | Vauxford, CC BY-SA 4.0 (crédit dans la légende du post) | original seulement |

`scripts/photos-mo9.py` efface le logo de la calandre, l'affichette vue à travers le pare-brise et la plaque, retourne
la photo (la voiture regarde à gauche : elle entre par la droite, comme la Polo de MO5), détoure (BiRefNet) et étalonne.
`scripts/sandero-dirty-mo9.py` fabrique les calques « à l'achat » posés dessus : `terne.png` (vernis sans éclat,
poussière, coulures), `phares.png` (voile jaune), `rayure.png` (aile avant). Le trait de lumière les efface un par un.
Originaux et crédits : `assets/photos-mo9/src/`, `assets/photos-mo9/CREDITS.tsv`.

## Le scénario chiffré

À l'écran pendant tout le récit : « Exemple · prix moyens constatés ».

**Jour 0, avant d'acheter.** Une Sandero II essence de 2014, 125 000 km, annoncée 3 400 €.

| Annonces d'à côté (même moteur, même boîte, même année) | Kilométrage |
|---|---|
| 4 590 € | 131 000 km |
| 4 650 € | 124 000 km |
| **4 700 €** (prix du milieu) | 128 000 km |
| 4 750 € | 119 000 km |
| 4 900 € | 112 000 km |

Ordres de grandeur cohérents avec des annonces relevées le 8 octobre 2026 : 4 500 à 5 500 € pour une Sandero II 1.2
75 ch de 2014 vers 110 000 à 120 000 km ([Leparking](https://www.leparking.fr/voiture-occasion/dacia-sandero-1.2.html),
[AutoScout24](https://www.autoscout24.fr/offres/dacia-sandero-1-2-16v-75ch-essence-bleu-cat_ma16360mo19129-fce65018-cfa6-46dd-a848-24a7901ac7c5)).
Prix demandés, pas prix de vente : c'est pour ça que la revente visée se place juste sous le milieu. Aucune annonce
réelle n'est reproduite, aucun site n'est nommé à l'écran.

Revente visée **4 650 €** − frais prévus **750 €** − marge voulue **1 000 €** = **prix max 2 900 €**.

La méthode des annonces comparables (même modèle, même moteur et même finition, kilométrage et année proches,
annonces récentes et proches) : [Ornikar](https://www.ornikar.com/permis/autour-voiture/achat/occasion/argus).

**La visite.** Pneus lisses, phares jaunis, rayure sur l'aile avant : chiffrés devant le vendeur. Il propose 2 900 €, le
vendeur accepte. Marge prévue : 4 650 − 2 900 − 750 = **1 000 €**.

**Les frais, tous prévus** (le budget de 750 € arrondit le total au-dessus) :

| Frais | Montant | D'où vient le chiffre |
|---|---|---|
| Carte grise | 186 € | 5 CV × 34,475 € (cheval fiscal Île-de-France 2026, abattement de 50 % après 10 ans, [eplaque](https://www.eplaque.fr/carte-grise/prix-cheval-fiscal.html)) + 13,76 € de redevances ([Ornikar](https://www.ornikar.com/permis/autour-voiture/immatriculation/carte-grise/prix)), comme MO5 ; puissance fiscale de la version à vérifier (une Sandero II 1.2 75 ch est donnée à 5 CV par le calcul CO₂ + puissance) |
| Contrôle technique | 78 € | prix moyen 2026 ([Groupama](https://www.groupama.fr/assurance-auto/conseils/prix-controle-technique/), 5 janvier 2026), comme MO5 |
| Vidange | 110 € | petit moteur essence, 80 à 140 € ([Euromotor](https://euromotor.fr/blog/prix-vidange-voiture-2026-ou-moins-cher/)), comme MO5 |
| 2 pneus | 160 € | 185/65 R15, la taille d'origine de la Sandero II comme de la citadine de MO5 : vers 63 € le pneu d'entrée de gamme, pose vers 10 € ([Mecazen](https://mecazen.fr/pneus/185-65-r15), [Carter-Cash](https://www.carter-cash.com/pneus/185-65-r15)) |
| Phares (kit de rénovation) | 20 € | kits 15 à 40 €, 23,99 € en promotion en octobre 2026 ([Dealabs](https://www.dealabs.com/bons-plans/kit-de-renovation-protech-doptiques-de-phares-3409076)), comme MO6 |
| Rayure (kit efface-rayures) | 30 € | kits 8 à 25 €, rénovateur complet vers 50 € ([Touslesprix](https://www.touslesprix.com/achat,kit-efface-rayures-auto.html), [Ornikar](https://www.ornikar.com/code/cours/mecanique-vehicule/entretien/effacer-rayure-voiture)) ; rayure qui n'a pas traversé le vernis, comme MO6 |
| Intérieur | 50 € | hypothèse : produits, microfibres, injecteur-extracteur loué une journée (MO6) |
| Essence · 2 visites | 40 € | hypothèse (MO5) |
| Assurance · 1 mois | 40 € | hypothèse (MO5) |
| **Kebab · pour fêter** | 12 € | le gag, rappel de MO5 |
| **Total** | **726 €** | 24 € sous les 750 prévus |

**La vente.** Annonce à 4 650 €, photos en plein jour. J+6 : « 4 600 et je la prends. » Il accepte.
Marge réelle : 4 600 − 2 900 − 726 = **974 €**. Le compteur passe de 1 000 à 974 : − 50 € de négociation, + 24 € de frais
non dépensés.

Ce que la vidéo ne dit pas, parce qu'on ne le sait pas : qu'un vendeur accepte toujours 2 900 €, qu'une voiture se vend
toujours en six jours. C'est un exemple, annoncé comme tel.

## La voix (provisoire, 83 mots écrits)

```
Tu l'achètes 2 900, tu la revends 4 600.
Cette fois, ton compte en banque est d'accord.
Jour 0, tu comptes.
Les annonces d'à côté : 4 650. Tes frais : 750.
Ton prix max : 2 900.
Pneus lisses, phares jaunis, rayure. Il accepte.
Carte grise, contrôle, pneus : prévu.
Et là, ça sonne.
Six jours. Il négocie. Tu acceptes.
Bénéfice : 974 euros.
Même le kebab était prévu.
Tout s'est joué au jour 0.
La prochaine fois que tu te dis…
```

À resserrer à l'étape 4 : la parole doit tenir en 22 s environ. Coupes prévues dans l'ordre : « Tes frais : 750 »
(reste à l'écran), puis « Six jours » (reste en palettes).

## Le déroulé

Caméra : une seule prise, jamais immobile (caméras de MO5 : A sur le calcul, B le long des palettes, C qui suit la
voiture et la pile, F en orbite sur la carte finale). Fond #08070a → #1d1520, grain, vignettage. L'orange reste la
seule couleur d'accent. MO5 glissait vers la nuit ; MO9 va vers le jour.

| t (s) | Image | Caméra | Texte à l'écran | Voix | Son |
|---|---|---|---|---|---|
| 0,0 | Image 0 déjà composée : « 2 900 » en Clash géant, écrit à la lumière ; la flèche et « 4 600 » se tracent dessous (0,3-1,4). Pièces floues au fond (Mixkit 22168). | avance lente vers le calcul | 2 900 ↓ 4 600 | « Tu l'achètes 2 900, » (0,1) « tu la revends 4 600. » (1,4) | musique dès l'image 0 |
| 2,1 | La notification « Virement reçu · + 4 600,00 € » arrive par la droite, comme le débit de MO5, mais se pose sous le calcul au lieu de le percuter. | léger recul | | « Cette fois, ton compte en banque est d'accord. » (2,5-4,0) | notification qui se pose (pas de choc) |
| 2,8 | Le « ✓ » se trace à la lumière sous « 4 600 ». « Cette fois, *d'accord.* » s'écrit sous la notification. | | ✓ · Cette fois, d'accord. | | tracé, scintillement |
| 4,0 | Le calcul se replie vers le haut. Palettes « JOUR 0 ». | traversée vers la grille | JOUR 0 | « Jour 0, tu comptes. » (4,3-5,2) | palettes |
| 4,8 → 5,8 | Cinq annonces d'à côté s'allument, une par demi-temps, dans la colonne 140 → 940 ; la médiane (4 700) se cerne de lumière (6,0). | recul lent | les cinq prix | « Les annonces d'à côté : 4 650. » (5,3-6,8) | une note par carte, qui monte |
| 6,4 → 8,2 | La carte de la formule entre devant la grille : revente visée 4 650 (6,5) · − frais prévus 750 (6,9) · − marge voulue 1 000 (7,3) · trait de total tracé (7,7) · « *prix max* 2 900 € » (8,0), éclair. | orbite lente qui descend le long de la carte | la formule | « Tes frais : 750. » (6,9-7,8) « Ton prix max : 2 900. » (8,0-9,0) | les chiffres claquent sur les temps |
| 9,0 | La formule s'en va vers le haut. La Sandero, terne, entre par la droite et freine dans sa carte d'annonce « 3 400 € » ; son contour se trace à la lumière. | la caméra accompagne la voiture | 3 400 € | | moteur léger, freinage |
| 9,6 → 10,4 | Trois défauts s'allument sur la carrosserie, une pastille de verre chacun : pneus lisses, phare jauni, rayure. | rapprochement | Pneus lisses · Phares jaunis · Rayure | « Pneus lisses, phares jaunis, rayure. » (9,4-11,0) | trois pointes de lumière |
| 10,8 | « 3 400 » se barre d'un trait orange, « 2 900 » s'écrit. Le compteur « MARGE 1 000 € » se construit en haut, la jauge « Frais prévus · 0 / 750 » apparaît dessous. La mention « Exemple · prix moyens constatés » entre. | recul | 2 900 € · MARGE 1 000 € | « Il accepte. » (11,2-11,8) | rouleaux qui s'enclenchent |
| 11,9 → 14,9 | Sept débits tombent dans la profondeur, un par demi-temps : carte grise (11,9), contrôle technique (12,4), vidange (12,9), 2 pneus (13,4), phares (13,9), rayure (14,4), intérieur (14,9). Chacun joue sa vidéo, reçoit le tampon « prévu ✓ » et remplit la jauge (jusqu'à 634 / 750). Le compteur ne bouge pas. Sur « phares », « rayure » et « intérieur », le trait de lumière passe sur la voiture et efface le calque correspondant. | la caméra recule pour voir la pile, puis glisse le long de la voiture | prévu ✓ | « Carte grise, contrôle, pneus : prévu. » (12,0-14,2) | un débit par temps, sur une note qui **monte** ; polisseuse, aspiration |
| 15,2 | La voiture brille. Plein jour (le fond s'éclaircit et se réchauffe). Palettes J+1 → J+6, qui accélèrent. | travelling latéral | J+1 → J+6 | « Et là, ça sonne. » (15,6-16,5) | la musique garde sa basse et monte |
| 15,6 → 17,4 | Le téléphone vibre sans arrêt ; les messages s'empilent en verre : « Toujours dispo ? » × 12, « Je peux passer samedi ? ». Essence et assurance tombent, tamponnées (jauge 714 / 750). | | Toujours dispo ? | | vibrations, notes de message |
| 17,5 | Bulle : « 4 600 et je la prends. » | zoom à travers l'écran du téléphone | | « Six jours. Il négocie. Tu acceptes. » (17,4-19,0) | |
| 18,8 | Notification « Virement reçu · + 4 600,00 € ». Le compteur roule de 1 000 à 974 (19,0-19,6) et se fond dans un « 974 € » géant ; tout le reste s'éteint. | recul : le 974 remplit l'écran | **974 €** | « Bénéfice : 974 euros. » (19,3-20,6) | rouleaux, puis la musique retient son souffle |
| 20,6 | La notification « Kebab · pour fêter · − 12,00 € » arrive, petite, et reçoit son tampon « prévu ✓ ». Pause. | immobile 0,4 s, la seule pause | prévu ✓ | (silence) | tampon, seul |
| 21,0 | « *Même le kebab était prévu.* » s'écrit à la lumière sous le 974. | | Même le kebab était prévu. | « Même le kebab était prévu. » (21,0-22,2) | la musique repart |
| 22,3 | Rembobinage jusqu'au jour 0 : les tampons se décollent, la voiture redevient terne, le compteur redescend, les palettes repartent à JOUR 0. | la caméra recule le long de toute la scène | | | bande qui rembobine, souffle inversé |
| 23,4 | Fond chaud (vidéo floutée de calculs, Mixkit 49219). « Tout s'est joué *au jour 0.* » | avance lente | Tout s'est joué au jour 0. | « Tout s'est joué au jour 0. » (23,4-24,6) | la musique repart sur le premier temps |
| 24,6 · 25,4 · 26,2 | Trois cartes de verre, une par temps fort : « 1 · Le prix de revente · les annonces d'à côté · 4 650 € » · « 2 · Le prix max · revente − frais − marge · 2 900 € » · « 3 · À la visite · chaque défaut chiffré · 3 400 → 2 900 € ». | orbite F | les trois décisions | | une note par carte, qui monte |
| 27,45 | Les cartes se replient, « 2 900 ↓ 4 600 » revient dans le cadre de l'image 0. | même cadre qu'à 0,0 | 2 900 ↓ 4 600 | « La prochaine fois que tu te dis… » (27,9-29,5) | la musique boucle sur la mesure |
| 29,6 | = image 0 | | | → « Tu l'achètes 2 900… » | |

## Règles tenues (vérifiées sur les images tests)

- Zones sûres : rien d'important au-dessus de y = 220, sous y = 1480, à gauche de x = 60, à droite de x = 940 ; tout ce
  qui est centré l'est sur x = 540. La grille d'annonces tient dans la colonne 140 → 940 ; « 974 € » aussi (350 px).
- La voiture reste au-dessus de y = 1480 quand du texte l'accompagne ; dans la chute, elle n'est qu'un décor flou.
- Lisible à 360 px de large (`mo9-tests-360.jpg`) : chiffres, notifications, tampons, les trois décisions. Les
  kilométrages des cartes sont petits : ils ne portent pas le sens, les prix si.
- Notifications : appli bancaire inventée, sans nom de banque. Annonces : cartes de notre charte, jamais l'interface
  d'un site. Aucune plateforme ni marque nommée à l'écran (la calandre et la plaque sont effacées).
- Une seule pause (0,4 s, sur le tampon du kebab), quelque chose de nouveau toutes les 0,5 à 2 s.

## Les plans réels

Mixkit, licence « Mixkit Stock Video Free License » (usage commercial libre, sans crédit obligatoire), comme MO5 et MO6.
Vidéos hors dépôt (`assets/stock/`), retéléchargeables (`motion-studio/scripts/mixkit.py get`).

| Mixkit | Ce qu'on y voit | Où |
|---|---|---|
| 22168 | pièces dans le noir, reflets | fond de l'ouverture |
| 34140 | main qui tend des clés | virement de l'ouverture, vente |
| 241 | mains qui signent un papier | carte grise |
| 13260 | voiture sur un pont élévateur | contrôle technique |
| 4716 | mains dans un moteur | vidange |
| 45755 | main gantée sur un pneu | pneus |
| 47830 | polisseuse près d'un phare | phares, rayure (MO6) |
| 36522 | injecteur-extracteur sur une moquette | intérieur (MO6) |
| 31961 | main sur une pompe à essence | essence |
| 42136 | main sur un téléphone | messages de l'attente |
| 49219 | calculs au crayon, calculette | fond des trois décisions |

À chercher à l'étape 3 : un téléphone posé en plein jour (l'attente de MO9 se passe le jour, celle de MO5 la nuit).

## Ce qui reste à faire à l'étape 3

- Le gabarit `film-47` : le code de MO5 en modules réutilisables (écriture à la lumière, compteur, notifications,
  palettes, voiture et étiquettes, rembobinage, boucle), vérifié en rendant MO5 avec lui ; MO9 construit dessus, avec
  ses modules nouveaux (tampon, jauge, grille d'annonces, avant / après).
- Les séquences Mixkit retéléchargées et extraites (elles ne sont pas dans le dépôt).
- Le film complet animé, minutage provisoire, puis les planches toutes les 0,1 s.
