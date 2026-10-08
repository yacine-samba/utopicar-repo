# MO9 « 974 € » : déroulé seconde par seconde (étape 2)

Brief : `brief-mo9.md` (validé le 8 octobre 2026, ouverture A). 29,6 s, 1080×1920, 60 i/s, en boucle.
Images tests : `renders/review/mo9-tests-planche.jpg` (5 images clés), `mo9-tests-360.jpg` (test à 360 px de large),
page source `film-mo9/tests.html` (`node scripts/stills.mjs film-mo9/tests.html 1,2,3,4,5 renders/review/mo9-test`).

Grille provisoire : **120 BPM**, un temps toutes les 0,5 s, une mesure toutes les 2 s, comme MO5 (Controlled Drop recalé
à 120 BPM). Les débits tombent sur les temps, les grands moments sur les premiers temps de mesure. Le minutage se recale
mot à mot sur la voix à l'étape 4.

## La voiture

Une **Renault Clio IV noire de 2013**, version 1.2 16V 75 ch (choix de l'utilisateur le 8 octobre 2026, après les
images tests faites avec une Sandero II). Ce moteur est atmosphérique, sans turbo, à courroie sèche
([AutoCopilot](https://autocopilot.fr/modeles/renault-clio-4)) : ce n'est pas le 1.2 TCe que MO8 classe parmi les
moteurs à fuir, et la photo n'est pas celle de MO8.

| Photo | Auteur, licence | Fichiers |
|---|---|---|
| [2013 Renault Clio in Diamond Black, front right](https://commons.wikimedia.org/wiki/File:2013_Renault_Clio_in_Diamond_Black,_front_right,_06-08-2025.jpg) | Cutlass, **CC0** (aucun crédit obligatoire) | `assets/photos-mo9/clio-a.png`, calques `clio-a-terne.png`, `clio-a-phares.png`, `clio-a-rayure.png` |
| [2013 Dacia Sandero II front](https://commons.wikimedia.org/wiki/File:2013_Dacia_Sandero_II_front.JPG) (images tests de l'étape 2, remplacée) | Corvettec6r, CC0 | `assets/photos-mo9/sandero-a*.png` |

`scripts/photos-mo9.py clio-a` efface le logo de la calandre et la plaque, retourne la photo (la voiture regarde à
gauche : elle entre par la droite, comme la Polo de MO5), détoure (BiRefNet) et étalonne (voiture noire remontée,
comme la Clio de MO8). `scripts/dirty-mo9.py clio-a` fabrique les calques « à l'achat » : vernis sans éclat,
poussière et coulures, voile jaune sur les optiques, rayure sur l'aile avant. Le trait de lumière les efface un par
un. Originaux et crédits : `assets/photos-mo9/src/` (hors dépôt), `assets/photos-mo9/CREDITS.tsv`.

## Le scénario chiffré

À l'écran pendant tout le récit : « Exemple · prix moyens constatés ».

**Jour 0, avant d'acheter.** Une Clio IV 1.2 16V 75 ch de 2013, 158 000 km, annoncée 4 400 €.

| Annonces d'à côté (même moteur, même boîte, même année) | Kilométrage |
|---|---|
| 5 490 € | 162 000 km |
| 5 590 € | 155 000 km |
| **5 700 €** (prix du milieu) | 158 000 km |
| 5 750 € | 150 000 km |
| 5 900 € | 146 000 km |

Ordres de grandeur cohérents avec ce qu'on a relevé le 8 octobre 2026 : une Clio IV 1.2 16V 75 de 2015 à 158 000 km
proposée 5 500 € par un professionnel, et 6 500 à 8 500 € pour cette version de 2013-2015 selon un guide qui croise
les cotes et les annonces ([AutoCopilot](https://autocopilot.fr/modeles/renault-clio-4)), à kilométrage plus bas.
Prix demandés, pas prix de vente : c'est pour ça que la revente visée se place juste sous le milieu. Aucune annonce
réelle n'est reproduite, aucun site n'est nommé à l'écran.

Revente visée **5 650 €** − frais prévus **750 €** − marge voulue **1 000 €** = **prix max 3 900 €**.

La méthode des annonces comparables (même modèle, même moteur et même finition, kilométrage et année proches,
annonces récentes et proches) : [Ornikar](https://www.ornikar.com/permis/autour-voiture/achat/occasion/argus).

**La visite.** Pneus lisses, phares jaunis, rayure sur l'aile avant : chiffrés devant le vendeur. Il propose 3 900 €, le
vendeur accepte. Marge prévue : 5 650 − 3 900 − 750 = **1 000 €**.

**Les frais, tous prévus** (le budget de 750 € arrondit le total au-dessus) :

| Frais | Montant | D'où vient le chiffre |
|---|---|---|
| Carte grise | 152 € | 4 CV × 34,475 € (cheval fiscal Île-de-France 2026, abattement de 50 % après 10 ans, [eplaque](https://www.eplaque.fr/carte-grise/prix-cheval-fiscal.html)) + 13,76 € de redevances ([Ornikar](https://www.ornikar.com/permis/autour-voiture/immatriculation/carte-grise/prix)), méthode de MO5 ; 4 CV pour la Clio IV 1.2 16V 75 par le calcul CO₂ + puissance, à vérifier sur le certificat de la voiture |
| Contrôle technique | 78 € | prix moyen 2026 ([Groupama](https://www.groupama.fr/assurance-auto/conseils/prix-controle-technique/), 5 janvier 2026), comme MO5 |
| Vidange | 110 € | petit moteur essence, 80 à 140 € ([Euromotor](https://euromotor.fr/blog/prix-vidange-voiture-2026-ou-moins-cher/)), comme MO5 |
| 2 pneus | 160 € | 185/65 R15, monte courante de la Clio IV 1.2 75 comme de la citadine de MO5 (à vérifier sur la voiture) : vers 63 € le pneu d'entrée de gamme, pose vers 10 € ([Mecazen](https://mecazen.fr/pneus/185-65-r15), [Carter-Cash](https://www.carter-cash.com/pneus/185-65-r15)) |
| Phares (kit de rénovation) | 20 € | kits 15 à 40 €, 23,99 € en promotion en octobre 2026 ([Dealabs](https://www.dealabs.com/bons-plans/kit-de-renovation-protech-doptiques-de-phares-3409076)), comme MO6 |
| Rayure (kit efface-rayures) | 30 € | kits 8 à 25 €, rénovateur complet vers 50 € ([Touslesprix](https://www.touslesprix.com/achat,kit-efface-rayures-auto.html), [Ornikar](https://www.ornikar.com/code/cours/mecanique-vehicule/entretien/effacer-rayure-voiture)) ; rayure qui n'a pas traversé le vernis, comme MO6 |
| Intérieur | 50 € | hypothèse : produits, microfibres, injecteur-extracteur loué une journée (MO6) |
| Annonce · option de visibilité | 34 € | hypothèse (MO5 : 32 €) |
| Essence · 2 visites | 40 € | hypothèse (MO5) |
| Assurance · 1 mois | 40 € | hypothèse (MO5) |
| **Kebab · pour fêter** | 12 € | le gag, rappel de MO5 |
| **Total** | **726 €** | 24 € sous les 750 prévus |

**La vente.** Annonce à 5 650 €, photos en plein jour. J+6 : « 5 600 et je la prends. » Il accepte.
Marge réelle : 5 600 − 3 900 − 726 = **974 €**. Le compteur passe de 1 000 à 974 : − 50 € de négociation, + 24 € de frais
non dépensés.

Ce que la vidéo ne dit pas, parce qu'on ne le sait pas : qu'un vendeur accepte toujours 3 900 €, qu'une voiture se vend
toujours en six jours. C'est un exemple, annoncé comme tel.

## La voix (provisoire, 83 mots écrits)

```
Tu l'achètes 3 900, tu la revends 5 600.
Cette fois, ton compte en banque est d'accord.
Jour 0, tu comptes.
Les annonces d'à côté : 5 650. Tes frais : 750.
Ton prix max : 3 900.
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
| 0,0 | Image 0 déjà composée : « 3 900 » en Clash géant, écrit à la lumière ; la flèche et « 5 600 » se tracent dessous (0,3-1,4). Pièces floues au fond (Mixkit 22168). | avance lente vers le calcul | 3 900 ↓ 5 600 | « Tu l'achètes 3 900, » (0,1) « tu la revends 5 600. » (1,4) | musique dès l'image 0 |
| 2,1 | La notification « Virement reçu · + 5 600,00 € » arrive par la droite, comme le débit de MO5, mais se pose sous le calcul au lieu de le percuter. | léger recul | | « Cette fois, ton compte en banque est d'accord. » (2,5-4,0) | notification qui se pose (pas de choc) |
| 2,8 | Le « ✓ » se trace à la lumière sous « 5 600 ». « Cette fois, *d'accord.* » s'écrit sous la notification. | | ✓ · Cette fois, d'accord. | | tracé, scintillement |
| 4,0 | Le calcul se replie vers le haut. Palettes « JOUR 0 ». | traversée vers la grille | JOUR 0 | « Jour 0, tu comptes. » (4,3-5,2) | palettes |
| 4,8 → 5,8 | Cinq annonces d'à côté s'allument, une par demi-temps, dans la colonne 140 → 940 ; la médiane (5 700) se cerne de lumière (6,0). | recul lent | les cinq prix | « Les annonces d'à côté : 5 650. » (5,3-6,8) | une note par carte, qui monte |
| 6,4 → 8,2 | La carte de la formule entre devant la grille : revente visée 5 650 (6,5) · − frais prévus 750 (6,9) · − marge voulue 1 000 (7,3) · trait de total tracé (7,7) · « *prix max* 3 900 € » (8,0), éclair. | orbite lente qui descend le long de la carte | la formule | « Tes frais : 750. » (6,9-7,8) « Ton prix max : 3 900. » (8,0-9,0) | les chiffres claquent sur les temps |
| 9,0 | La formule s'en va vers le haut. La Clio, terne, entre par la droite et freine dans sa carte d'annonce « 4 400 € » ; son contour se trace à la lumière. | la caméra accompagne la voiture | 4 400 € | | moteur léger, freinage |
| 9,6 → 10,4 | Trois défauts s'allument sur la carrosserie, une pastille de verre chacun : pneus lisses, phare jauni, rayure. | rapprochement | Pneus lisses · Phares jaunis · Rayure | « Pneus lisses, phares jaunis, rayure. » (9,4-11,0) | trois pointes de lumière |
| 10,8 | « 4 400 » se barre d'un trait orange, « 3 900 » s'écrit. Le compteur « MARGE 1 000 € » se construit en haut, la jauge « Frais prévus · 0 / 750 » apparaît dessous. La mention « Exemple · prix moyens constatés » entre. | recul | 3 900 € · MARGE 1 000 € | « Il accepte. » (11,2-11,8) | rouleaux qui s'enclenchent |
| 11,9 → 14,9 | Sept débits tombent dans la profondeur, un par demi-temps : carte grise (11,9), contrôle technique (12,4), vidange (12,9), 2 pneus (13,4), phares (13,9), rayure (14,4), intérieur (14,9). Chacun joue sa vidéo, reçoit le tampon « prévu ✓ » et remplit la jauge (jusqu'à 600 / 750). Le compteur ne bouge pas. Sur « phares », « rayure » et « intérieur », le trait de lumière passe sur la voiture et efface le calque correspondant. | la caméra recule pour voir la pile, puis glisse le long de la voiture | prévu ✓ | « Carte grise, contrôle, pneus : prévu. » (12,0-14,2) | un débit par temps, sur une note qui **monte** ; polisseuse, aspiration |
| 15,2 | La voiture brille. Plein jour (le fond s'éclaircit et se réchauffe). Palettes J+1 → J+6, qui accélèrent. | travelling latéral | J+1 → J+6 | « Et là, ça sonne. » (15,6-16,5) | la musique garde sa basse et monte |
| 15,6 → 17,4 | Le téléphone vibre sans arrêt ; les messages s'empilent en verre : « Toujours dispo ? » × 12, « Je peux passer samedi ? ». Option de l'annonce, essence et assurance tombent, tamponnées (jauge 714 / 750). | | Toujours dispo ? | | vibrations, notes de message |
| 17,5 | Bulle : « 5 600 et je la prends. » | zoom à travers l'écran du téléphone | | « Six jours. Il négocie. Tu acceptes. » (17,4-19,0) | |
| 18,8 | Notification « Virement reçu · + 5 600,00 € ». Le compteur roule de 1 000 à 974 (19,0-19,6) et se fond dans un « 974 € » géant ; tout le reste s'éteint. | recul : le 974 remplit l'écran | **974 €** | « Bénéfice : 974 euros. » (19,3-20,6) | rouleaux, puis la musique retient son souffle |
| 20,6 | La notification « Kebab · pour fêter · − 12,00 € » arrive, petite, et reçoit son tampon « prévu ✓ ». Pause. | immobile 0,4 s, la seule pause | prévu ✓ | (silence) | tampon, seul |
| 21,0 | « *Même le kebab était prévu.* » s'écrit à la lumière sous le 974. | | Même le kebab était prévu. | « Même le kebab était prévu. » (21,0-22,2) | la musique repart |
| 22,3 | Rembobinage jusqu'au jour 0 : les tampons se décollent, la voiture redevient terne, le compteur redescend, les palettes repartent à JOUR 0. | la caméra recule le long de toute la scène | | | bande qui rembobine, souffle inversé |
| 23,4 | Fond chaud (vidéo floutée de calculs, Mixkit 49219). « Tout s'est joué *au jour 0.* » | avance lente | Tout s'est joué au jour 0. | « Tout s'est joué au jour 0. » (23,4-24,6) | la musique repart sur le premier temps |
| 24,6 · 25,4 · 26,2 | Trois cartes de verre, une par temps fort : « 1 · Le prix de revente · les annonces d'à côté · 5 650 € » · « 2 · Le prix max · revente − frais − marge · 3 900 € » · « 3 · À la visite · chaque défaut chiffré · 4 400 → 3 900 € ». | orbite F | les trois décisions | | une note par carte, qui monte |
| 27,45 | Les cartes se replient, « 3 900 ↓ 5 600 » revient dans le cadre de l'image 0. | même cadre qu'à 0,0 | 3 900 ↓ 5 600 | « La prochaine fois que tu te dis… » (27,9-29,5) | la musique boucle sur la mesure |
| 29,6 | = image 0 | | | → « Tu l'achètes 3 900… » | |

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

## Étape 3 : le maquettage (fait le 8 octobre 2026)

- Film animé complet : `film-mo9/index.html` + `film-mo9/film.js` (`window.seek(t)`, minutage provisoire de ce
  document), planches toutes les 0,1 s : `renders/review/mo9-planche-0.1s-0-10.jpg`, `-10-20.jpg`, `-20-29.6.jpg`
  (`CUT=mo9 node scripts/sheet.mjs 0 10`). Instants choisis : `CUT=mo9 node scripts/at.mjs 0,9.8,19.9 renders/review/mo9-at.jpg`.
- Construit sur `lib/kit47.js` : les modules de MO5 rendus réutilisables (écriture à la lumière, compteur à rouleaux,
  notifications, palettes, séquences vidéo, tampon). MO5 garde son propre code : le kit n'a pas encore été vérifié en
  rendant MO5 avec lui.
- Séquences Mixkit : `film-mo9/seq/` (hors dépôt), refaites par
  `python3 ../.claude/skills/motion-studio/scripts/mixkit.py get 241 13260 4716 45755 47830 36522 31961 42136 34140 49219 --out assets/stock/mo9`
  puis `mixkit.py seq assets/stock/mo9/mixkit-<id>.mp4 film-mo9/seq/<nom> --start 1.0 --dur 4` (noms : signe, ct,
  moteur, pneu, phares, interieur, essence, phone, cles, calc).
- Corrigé en relisant les planches : l'image 0 montre « 3 900 ↓ » et « 5 600 » s'écrit sur la voix ; les annonces
  arrivent pendant que le calcul s'en va, la voiture pendant que la formule s'en va (plus d'écran vide) ; la pile de
  messages est rangée, avec un compteur « Messages · 12 » ; les trois décisions arrivent dès 24,0 s ; la boucle avance
  jusqu'au cadre exact de l'image 0.
- Reste pour l'étape 5 : le rendu final avec flou de bougé, la mesure de fluidité (`ref-motion.py`) et de la boucle.

## Étape 4 : la voix (faite et validée le 8 octobre 2026)

Texte final (74 mots) dit par Simon (`mvhJVdVoTWVUtL4keT7W`, eleven_v3), une prise à la demande de l'utilisateur.
Premier envoi refusé par ElevenLabs (quota : 232 crédits restants pour 526 demandés), rien de généré, pas de nouvel
essai ; l'utilisateur a rechargé, puis une seule génération (526 crédits) : `audio/vo-mo9/takeA.mp3`, 35,5 s brute.

```
Tu l'achètes trois mille neuf cents, tu la revends cinq mille six cents. Cette fois, ton compte en banque est d'accord.
Jour zéro, tu comptes. Les annonces d'à côté : cinq mille six cent cinquante. Ton prix max : trois mille neuf cents.
Pneus lisses, phares jaunis, rayure. Il accepte. Carte grise, contrôle, pneus : prévu. Et là… ça sonne. Il négocie.
Tu acceptes. Bénéfice : [short pause] neuf cent soixante-quatorze euros. [chuckles] Même le kebab était prévu.
Tout s'est joué au jour zéro. La prochaine fois que tu te dis…
```

- **Prononciation vérifiée par transcription** : faster-whisper *small* (mots horodatés, `words.json`) écrit
  « banquets », « Pneulis », « fargenis » ; le modèle *medium* relit le texte exact (« ton compte en banque est
  d'accord », « Pneus lisses, phares jaunis, rayures », « Ha, même le kebab était prévu »). Il relit aussi le texte
  exact sur le mix avec la musique : la voix passe au-dessus.
- **Le rire** : *small* l'avale dans « Même » (28,74-30,38 s). Recalé sur l'enveloppe : rire 29,34-30,0 s, phrase
  dès 30,02 s. Il est gardé, posé 0,25 s après le tampon du kebab : c'est la réaction au tampon.
- **Pose** (`scripts/vo-mo9.py`) : à × 1,15 partout, la parole d'avant le rembobinage occupe 21,7 s pour une
  place de 22,6 s : plus de respiration entre les répliques. Première pose : récit × 1,25, film de 30,0 s.
  **Retour de l'utilisateur (8 oct.) : « trop rapide ».** Pose retenue : ouverture × 1,15, récit × 1,2, chute et fin
  × 1,15, 0,2 à 0,4 s entre les phrases, pauses internes ramenées à 0,10-0,30 s. Parole posée : 23,8 s. Le film passe
  à **31,4 s** (boucle à 29,24 s) ; sa durée se calcule depuis la voix (`vo-timing.json` : `dur`, `loop`).
- **Le film suit la voix** : `film-mo9/film.js` lit `audio/vo-mo9/vo-timing.json` (comme MO8). Temps retenus :

| Événement | t (s) | Sur le mot |
|---|---|---|
| « 5 600 » s'écrit | 1,59 | « tu la revends » |
| le virement se pose | 2,45 | fin de « 5 600 » |
| « Cette fois, » · ✓ · « d'accord. » | 2,69 · 3,49 · 4,14 | « Cette fois » · « ton compte en banque » · « d'accord » |
| le calcul se replie, palettes JOUR 0 | 4,56 · 4,66 | « Jour 0 » (4,86) |
| annonces · cercle sur la médiane · lignes de la formule | 5,11 · 6,82 · 7,22 | « tu comptes » · « côté » · « 5 650 » |
| « prix max 3 900 € », éclair | 9,17 | « 3 900 » |
| la Clio entre | 9,60 | fin de « 3 900 » |
| pastilles pneus · phares · rayure | 10,37 · 11,21 · 12,12 | chaque défaut |
| « 4 400 » barré, compteur MARGE | 12,80 | « Il accepte » |
| débits : carte grise, contrôle, 2 pneus, puis vidange, phares, rayure, intérieur | 13,67 · 14,42 · 15,12 · 15,48 · 15,80 · 16,12 · 16,44 | les trois premiers sur leur mot, les quatre autres en pluie qui accélère |
| le jour, J+1 → J+6, 12 messages (un toutes les 0,075 s) | 17,04 → 17,86 | « ça sonne » |
| l'offre · le virement | 18,00 · 19,55 | « Il négocie » · après « Tu acceptes » |
| **974 €** | 20,71 | « 974 » (sur un temps) |
| kebab · tampon · rire | 22,20 · 22,45 · 22,70 | juste après « euros » ; silence |
| « Même le kebab / était prévu. » s'écrit | 23,40 · 23,97 | sur les mots |
| rembobinage | 24,81 → 25,61 | 0,3 s après « prévu » |
| « Tout s'est joué *au jour 0.* » · trois décisions | 25,69 · 26,33 / 26,93 / 27,53 | « Tout » · « jour 0 » |
| boucle | 29,24 → 31,40 | « La prochaine fois que tu te dis… » (29,69) |

- **Musique** (`scripts/audio-mo9.py`) : Controlled Drop recalé à 120 BPM, grille calée pour que « 974 » tombe sur un
  temps : mesure 13 dès l'image 0, montée quand ça sonne, arrêt net à
  l'arrivée du kebab (21,94 s), silence sous le tampon, le rire et la chute, bande qui rembobine, remontée à l'envers,
  mesure 55 repartie de son premier temps sur « Tout s'est joué » (25,74 s). Tous ces temps sont lus dans
  `vo-timing.json`. Mix voix + musique : −14,4 LUFS, −3,5 dBTP. Bruitages : étape 5.
- Écoute : `audio/vo-mo9/ecoute-voix-musique.mp3`, `audio/vo-mo9/ecoute-voix-seule.mp3` ; brouillon vidéo avec le son
  `renders/draft-mo9-9x16.mp4` (540 × 960, hors dépôt) ; instants choisis `renders/review/mo9-voix-at.jpg`.
- Corrigé en relisant les instants : la pile de débits passait sur le compteur en partant (16,2 s) ; elle s'efface
  maintenant avant de l'atteindre.

## Étape 5 : animation, son, contrôle, livraison (8 octobre 2026)

- **Bruitages** (`scripts/audio-mo9.py`) : 76 sons des banques MO5 et MO6 (Mixkit), repérés sur l'image : le film
  écrit ses temps dans `film-mo9/events.json` (`window.EVENTS`, `scripts/events.mjs`). Une note par annonce et par
  débit, qui monte ; le kebab joue la note la plus haute, puis le tampon seul dans le silence ; moteur de la Clio et
  vibration du téléphone fabriqués comme dans MO5 ; bruitages −7 dB sous la voix. Voix au moins 7,7 dB au-dessus des
  bruitages et 8,1 dB au-dessus de la musique (médiane 10 dB). Version sans musique : `audio/vo-mo9/ecoute-sans-musique.mp3`.
- **Rendu final** : `CUT=mo9 MB=4 PARTS=4 PART=0..3 node scripts/render.mjs --all`, puis `--assemble` : ≈ 40 min en
  4 morceaux parallèles (MO6 : ≈ 2 h). Trois rendus, corrigés entre chaque sur les mesures (`docs/review_log.md`).
- **Contrôle** : `qa_video.py` sans FAIL, −14,3 LUFS, −3,6 dBTP, boucle 0,22/255, notes toutes ≥ 8.
- **Livré** : `renders/9x16-mo9.mp4` (1080 × 1920, 60 i/s, 31,4 s, 16,8 Mo), `renders/poster-mo9.png` (4,46 s),
  `renders/9x16-mo9.srt` (14 cartons), `renders/qa/9x16-mo9-qa.md` et `-safe.png`, pistes `audio/stems-mo9/` (hors dépôt,
  refaites par `audio-mo9.py`).
