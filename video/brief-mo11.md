# Brief : MO11 « Deux voitures » (série recette 47, épisode 3)

Il a 5 000 € et fait le calcul de ceux qui veulent aller vite : 500 sur une voiture, 1 000 sur deux. Le film suit ses
deux voitures sous un compteur qui divise la marge par les jours : la rouge part en 13 jours, la bleue reste 52 jours
dans la rue, et les deux ensemble rapportent 1 € par jour, moins qu'un ticket de bus. Il repart avec le calcul du pro
(marge ÷ jours), ce qui double avec une deuxième voiture et ce que coûte chaque semaine d'attente.

Écrit avec les skills recette-47, motion-studio et « L'art du hook ». Textes passés à Stop Slop. Montants sourcés dans
`docs/timeline-mo11.md` (consultés le 8 octobre 2026). Production « tout en auto » à la demande de l'utilisateur
(8 octobre 2026) : les « OK » des étapes sont accordés d'avance.

```
Produit / URL : aucun, rien à vendre       Objectif : arrêt net, revisionnage, enregistrement et partage spontanés
Plateforme : TikTok, puis Reels et Shorts  Public : débutants qui veulent se lancer dans l'achat-revente auto
Promesse : divise ta marge par les jours ; une voiture qui part en 13 jours rapporte plus que deux qui attendent.
CTA : aucun, ni dit ni écrit                Type / durée : motion design narratif, 29,6 s, en boucle
Voix : Simon (ElevenLabs), ton MO5          Musique : Controlled Drop, passages de MO5, 120 BPM
Ouvertures : A = « ton calendrier » (publiée) / B = « 52 € en 52 jours » (variante D, même corps, en réserve)
Format : 9:16, 1080×1920, 60 i/s           Données : exemple chiffré, sourcé, mention « Exemple · prix moyens constatés »
Voitures : « la rouge » = Renault Twingo II 1.2 60 de 2009, 3 portes, photo Wikimedia Commons « 2009 Renault Twingo
           Freeway 1.1.jpg », Vauxford, CC BY-SA 4.0 ; « la bleue » = Citroën C3 I phase 1 (2002-2005), 5 portes,
           photo « Citroën C3 front.jpg », M 93, domaine public. Détourées, sans plaque ni logo (repli : Toyota Yaris II)
Interdits : produit, logos de marques et de plateformes, plaques, visages, CTA, morale, « enregistre », chiffre non sourcé
```

## Hypothèse (recette v1)

- **On garde** : huit des neuf ingrédients de la recette v1, sans retouche. Ouverture « son calcul en deux chiffres
  ronds + un contradicteur du quotidien », vraies voitures couvertes d'étiquettes de prix, accumulation en
  notifications de débit avec un gag, attente qui coûte, chute en deux phrases courtes puis chiffre final et phrase en
  Fraunces, renversement appliqué au même exemple avec un verdict, boucle, rien à vendre. Même voix, mêmes passages de
  musique, même durée (29,6 s), même charte, même créneau de publication que MO5.
- **On change** : l'ingrédient 2, le chiffre héros. Le compteur à rouleaux « MARGE » devient **« MARGE / JOUR »** : la
  marge prévue qui reste, divisée par les jours écoulés depuis l'achat, avec la division écrite en petit dessous
  (« 355 € ÷ 13 jours », le nombre de jours sur des palettes). Il part de 1 000 € au jour 1 et finit à 1 €. Le journal
  (expérience É3) veut savoir si un autre compteur peut porter l'histoire. Ce qu'il change dans le film : pendant
  l'attente, le compteur baisse chaque jour, débit ou pas (de 355 € à la fin du jour 1 à 4 € au jour 52, avec trois
  débits seulement). L'attente a son propre mouvement, que le compteur de MO5 ne montrait pas.
- **Changements imposés**, notés dans le journal, sans compter comme variable : les voitures (une Twingo II rouge et
  une C3 I bleue de Wikimedia Commons au lieu de la Polo), au nombre de deux parce que le sujet l'exige.
- **On saura si** : visionnages complets (%) et enregistrements pour 1 000 vues, comparés à MO5 et à la médiane de la
  série (MO9, MO10). Hypothèse **confirmée** si les deux atteignent MO5 ou dépassent la médiane de la série ;
  **infirmée** si les deux restent plus de 20 % sous la médiane (le compteur par jour se lit mal ou se retient moins) ;
  entre les deux, sans signal. À lire aussi : la courbe de rétention entre 12 et 16 s (l'attente, où le compteur agit
  seul) et les commentaires qui demandent « pourquoi par jour ? » (le compteur se comprend mal). Les visionnages
  complets et les enregistrements de MO5 se relèvent avant la publication (journal, § 3).
- **Fabrication : rendu plus court.** Avant : MO6, même technique de verre, environ 2 h en 4 parties à MB = 4 (6 à 15 s
  par image) ; MO5, durée non notée. Le verre dépoli (`backdrop-filter: blur(26px) saturate(1.5)`) ne reste actif que
  sur les éléments visibles. Une fonction `glass(e)`, appelée à chaque image, le coupe quand l'élément est sous 0,02
  d'opacité (au lieu du seul `visibility: hidden` sous 0,002), quand sa boîte sort du cadre 1080 × 1920 après la
  caméra, quand il est recouvert (dans la pile de notifications, seules les trois du dessus gardent le verre, les
  autres prennent un aplat sombre avec le même reflet), et sous le voile noir de la chute (18,1 → 20,9 s). Elle expose
  `window.glassCount`. Mesures, avant et après : nombre maximal de verres actifs par image (passe de contrôle à
  10 i/s) ; minutes de rendu pour 29,6 s à MB = 4, PARTS = 4, relevées dans le journal de `render.mjs` (cible : 60 min
  au plus, la moitié de MO6) ; écart moyen inférieur à 1 sur 255 entre 12 images rendues avec et sans la règle, pour
  que rien ne se voie. Acquis de MO9 gardé : aucune étiquette de prix sous y = 1480.

## Les 5 contrôles du sujet

Repartis de la ligne « Deux voitures » de `sujets.md` : croyance « une voiture 500 €, deux voitures 1 000 € » ; vérité
« la deuxième immobilise l'argent et double les frais » ; méthode « compter la marge par jour, une voiture à la fois
tant qu'on ne vend pas vite » ; chute « moins de bénéfice à deux qu'avec une seule ».

1. **Envie** ✅ : il découvre qu'il peut démarrer avec moins (une voiture, 3 000 €) et gagner plus vite : la rouge seule
   fait 13 € par jour, les deux ensemble 1 €. Il sort avec une règle qui fait tourner son argent.
2. **Valeur** ✅ : trois éléments à retrouver le jour J. Le calcul marge ÷ jours, appliqué à deux annonces. Ce qui double
   avec une deuxième voiture (une carte grise à 152 € en Île-de-France pour chacune, une assurance pour chacune). Ce
   que coûte l'attente : un mois d'assurance de plus, 35 € d'amende après 7 jours garée au même endroit, un contrôle
   technique à refaire quand le PV dépasse 6 mois (78 €), et l'acheteur qui négocie sur l'âge de l'annonce.
3. **Rien de proposé** ✅ : ni fiche, ni appel, ni morale. La carte du pro reste à l'écran le temps d'être lue, sans
   invitation à l'enregistrer.
4. **Chute** ✅ : « Bénéfice, un euro par jour. Moins qu'un ticket de bus. » surprend et renvoie au gag ; « La prochaine
   fois que tu te dis… » enchaîne sur « Tu gagnes 500 sur une voiture… ».
5. **Le sujet tient dans un calcul** ✅ : 500 × 2 = 1 000.

## La grille de transposition

| Temps (durée MO5) | Rôle | MO5 | MO11 « Deux voitures » |
|---|---|---|---|
| Ouverture (0 → 4,2 s) | son calcul, puis un objet du quotidien qui le contredit | « Tu l'achètes 3 500, tu la revends 5 000. » / « Ton compte en banque n'est pas d'accord. » | « Tu gagnes 500 sur une voiture, 1 000 sur deux. » (0,08-2,2) / « Ton calendrier n'est pas d'accord. » (2,55-3,9). À 2,1 s, le calendrier à palettes défile jusqu'à « JOUR 52 » et percute le calcul. |
| Image 0 | le calcul écrit, avec un « ? » | « 5 000 − 3 500 = 1 500 € ? » | « 500 × 2 = 1 000 € ? » ; derrière, flou, un calendrier à palettes lumineux sur « JOUR 1 » |
| Chiffre héros | ce qui roule en haut de l'écran pendant tout le récit | MARGE 1 500 € | **MARGE / JOUR 1 000 €** (y = 300), la division en petit dessous, les jours sur palettes ; 1 000 → 355 avec les débits, 355 → 4 avec les jours, 4 → 1 à la vente |
| Héros visible | ce qui se couvre de ses frais | la Polo, étiquettes de prix | « la rouge » (Twingo II) et « la bleue » (C3 I), Wikimedia Commons ; chaque débit « × 2 » se dédouble en deux étiquettes, une par voiture, toutes au-dessus de y = 1480 |
| Jour 1 (4,2 → 5,9 s) | le moment où il se croit gagnant | « Jour 1, tu l'achètes. » | « Jour 1, tu achètes les deux. » Les deux voitures arrivent l'une après l'autre ; le compteur affiche 1 000 € par jour |
| Accumulation (5,9 → 12,0 s) | 6 à 9 coups chiffrés, un par temps, sous une forme familière | 9 notifications de débit, chacune avec sa vidéo | 6 notifications de débit (6,0 · 6,8 · 7,3 · 7,81 · 8,5 · 11,65), chacune avec sa vidéo ; trois portent « × 2 » ; à 9,45 s, une seule voiture s'allume au déverrouillage |
| Gag | un coup vrai, petit et drôle | « Kebab · après la 4e visite · − 12 € » | « Ticket de bus · aller chercher l'autre · − 2,05 € » : il a deux voitures et prend le bus |
| Attente (12,0 → 15,6 s) | le temps vide qui coûte encore | J+1 → J+23, « Et là, personne n'appelle. » | JOUR 2 → JOUR 52 ; « La rouge part en 13 jours. La bleue reste dans la rue. » ; la rouge sort du cadre ; assurance, amende pour stationnement abusif, contrôle technique de plus de 6 mois ; « Zéro débit. *Ta marge baisse.* » |
| Chute (15,6 → 20,9 s) | deux phrases courtes, le chiffre final, la phrase concrète | « Il négocie. Tu acceptes. Bénéfice, 47 euros. Même pas un plein. » | « Il voit la date. Tu cèdes. Bénéfice, un euro par jour. Moins qu'un ticket de bus. » |
| Renversement (20,9 → 27,4 s) | ce que font ceux qui gagnent, appliqué au même exemple, avec un verdict | « Ceux qui gagnent font le calcul à l'envers. » 4 500 − 950 − 800 = 2 750 ; « À 3 500, tu passes ton tour. » | « Ceux qui gagnent comptent la marge par jour. » La rouge seule : 169 € ÷ 13 jours = 13 € ; les deux : 52 € ÷ 52 jours = 1 € ; « Annonce · la bleue · 2 000 € » barrée, « La bleue, tu passes ton tour. » |
| Boucle (27,4 → 29,6 s) | une demi-phrase qui ramène à l'ouverture | « La prochaine fois que tu te dis… » | « La prochaine fois que tu te dis… » ; derrière le calcul de l'image 0, les palettes floues reviennent à « JOUR 1 » |
| Ce qu'on enregistre | la valeur | la liste des frais, la formule du prix max | la carte « marge ÷ jours » avec ses deux lignes, la liste de ce que coûte l'attente |
| Ce qu'on envoie | le détail qu'on montre à un pote | « Même pas un plein », le kebab | « Un euro par jour, moins qu'un ticket de bus », le bus pris avec deux voitures au parking |
| Ce qu'on commente | ce que chacun voudra ajouter | ses propres frais oubliés | sa voiture qui a dormi le plus longtemps, combien de jours la dernière a mis à partir, qui a déjà acheté deux voitures d'un coup |

## Le hook (skill « L'art du hook »)

**Analyse** : douleur visée, il veut aller plus vite que les autres et faire travailler toutes ses économies · croyance,
« 500 sur une voiture, 1 000 sur deux » · vérité, la deuxième double les frais fixes et bloque l'argent ; divisée par
les jours d'attente, la marge des deux passe sous celle d'une seule.

| | Levier | Voix | Texte à l'écran | Image 0 |
|---|---|---|---|---|
| A | Croyance → vérité (mécanique MO5) | « Tu gagnes 500 sur une voiture, 1 000 sur deux. Ton calendrier n'est pas d'accord. » | 500 × 2 = 1 000 € ? | Le calcul en Clash géant ; derrière, flou, un calendrier à palettes lumineux sur « JOUR 1 ». À 2,1 s, les palettes avancent, défilent jusqu'à « JOUR 52 » et percutent le calcul, qui tremble. |
| B | Coût caché, résultat d'abord | « Deux voitures, 1 000 € de marge prévue. Un euro par jour à l'arrivée. » | 1 000 € prévus. 1 € par jour. | Le compteur « MARGE / JOUR » part de 1 000 et roule jusqu'à 1 pendant que les palettes défilent derrière. |
| C | Erreur intelligente | « Les débutants pressés achètent la deuxième voiture avant d'avoir vendu la première. Elle leur coûte la marge des deux. » | La deuxième, trop tôt | Deux trousseaux de clés tombent sur une table sombre ; le second fait sauter le premier. |
| D | Démonstration, écart implicite | « Tes deux premières voitures t'ont rapporté 52 euros en 52 jours. » | 52 € en 52 jours | Les palettes « JOUR 52 » à gauche, une notification « + 52 € » à droite, les deux voitures floues derrière. |

**Recommandation** : A en ouverture publiée, parce que l'épisode ne teste que le chiffre héros et qu'A garde la
mécanique de MO5 ; D fabriquée en ouverture B (même corps, raccord à 4,2 s) et gardée en réserve : publier deux
ouvertures ajouterait une variable.

**Les 4 verrous de A** :
- Temps ✅ : « 500 » est le troisième mot, « voiture » (le sujet) arrive dans la phrase 1, « 1 000 » avant sa fin.
- Sens ✅ : deux phrases courtes, voix active, deux chiffres ronds. « Tu gagnes 500 sur une voiture » est la tournure
  du débutant lui-même. Test d'isolement : le calcul écrit (« 500 × 2 = 1 000 € ? ») lève le doute sur « sur une » ;
  le calendrier est un objet de sa poche.
- Miroir ✅ : c'est son plan à lui, en « tu », l'étape à laquelle pense tout débutant dont la première voiture est
  partie.
- Écart ✅ : il croit doubler sa marge en doublant les voitures ; son calendrier n'est pas d'accord, sans dire
  pourquoi. La question « qu'est-ce que les jours viennent faire dans ma marge ? » s'ouvre, et seul le compteur par
  jour la referme. Au deuxième passage, « JOUR 52 » prend son sens.

**Relances du corps** : « Jour 1. » à 4,25 s · le ticket de bus qui tombe seul, en silence, à 11,65 s · « La rouge
part en 13 jours. » à 12,35 s, la rouge sort du cadre · le compteur qui baisse chaque jour sans aucun débit, de 12,0 à
15,5 s · « un euro par jour » à 18,55 s · « Ceux qui gagnent comptent la marge par jour. » à 21,0 s.

## L'histoire en 7 temps

| Temps | De → à (s) | Voix | Ce qu'on voit | Émotion |
|---|---|---|---|---|
| Ouverture | 0 → 4,2 | « Tu gagnes 500 sur une voiture, 1 000 sur deux. Ton calendrier n'est pas d'accord. » | le calcul géant ; le calendrier à palettes défile jusqu'à « JOUR 52 » et le percute | reconnaissance, sourire |
| Jour 1 | 4,2 → 5,9 | « Jour 1, tu achètes les deux. » | la rouge puis la bleue arrivent et freinent ; « MARGE / JOUR 1 000 € » | élan |
| Accumulation | 5,9 → 12,0 | « Deux cartes grises, deux assurances, une vidange, des pneus. Et tu n'en conduis qu'une à la fois. » | 5 débits, les « × 2 » se dédoublent en étiquettes sur les deux voitures ; une seule voiture s'allume ; le ticket de bus tombe seul | peur qui monte, rire |
| Attente | 12,0 → 15,6 | « La rouge part en 13 jours. La bleue reste dans la rue. » | nuit, palettes JOUR 2 → JOUR 52, la rouge s'en va ; la bleue se couvre d'étiquettes ; le compteur baisse chaque jour | peur |
| Chute | 15,6 → 20,9 | « Il voit la date. Tu cèdes. Bénéfice, un euro par jour. Moins qu'un ticket de bus. » | « 1 € » plein écran, « par jour », silence ; le ticket de bus revient à côté | humour noir |
| Renversement | 20,9 → 27,4 | « Ceux qui gagnent comptent la marge par jour. La rouge seule, 13 euros par jour. La bleue, tu passes ton tour. » | rembobinage au jour 1 ; la carte « marge ÷ jours » ; l'annonce de la bleue barrée, la bleue recule hors du cadre | soulagement, valeur |
| Boucle | 27,4 → 29,6 | « La prochaine fois que tu te dis… » | retour à l'image 0 | relance |

## Les chiffres

Sources, liens et hypothèses : `docs/timeline-mo11.md` (consultés le 8 octobre 2026). Deux voitures achetées le même
jour en Île-de-France avec 5 000 € d'économies, toutes deux de 4 CV et de plus de 10 ans. La rouge : Twingo II 1.2 60
de 2009, achetée 3 000 €, revente visée 3 500 €. La bleue : C3 I 1.1i de 2004, achetée 2 000 €, revente visée
2 500 €. Marge prévue : 1 000 €.

| Moment | Jour | Coup (notification) | Montant | Voiture | Compteur « MARGE / JOUR » |
|---|---|---|---|---|---|
| | 1 | départ, 1 000 € ÷ 1 jour | | | 1 000 |
| Accumulation | 1 | Cartes grises × 2 | 304 € | les deux | 696 |
| | 1 | Assurances × 2 · 1 mois | 80 € | les deux | 616 |
| | 1 | Vidange | 119 € | la rouge | 497 |
| | 1 | 2 pneus | 100 € | la bleue | 397 |
| | 1 | Nettoyage × 2 | 40 € | les deux | 357 |
| | 1 | **Ticket de bus · aller chercher l'autre** (gag) | 2,05 € | | 355 |
| Attente | 2 → 13 | aucun débit, les jours passent | | | 177 → 27 |
| | 13 | Virement reçu · la rouge, + 3 500 € (prix demandé) | | la rouge | 27 |
| | 31 | Assurance · la bleue · 2e mois | 40 € | la bleue | 10 |
| | 38 | Amende · stationnement abusif | 35 € | la bleue | 7 |
| | 47 | Contrôle technique · plus de 6 mois | 78 € | la bleue | 4 |
| Chute | 52 | Message « Sept semaines en ligne ? 2 350, aujourd'hui. », virement + 2 350 € (150 de moins que prévu) | − 150 € | la bleue | **1** |

Total des frais : 798,05 €. 1 000 − 798,05 − 150 = 51,95 € en 52 jours, soit **1 € par jour** (0,999).
Par voiture : la rouge rapporte 169 €, la bleue perd 115 €.

**Le calcul du pro, sur le même exemple** : marge ÷ jours où l'argent reste bloqué. La rouge seule : 169 € ÷ 13 jours =
**13 € par jour** (sans bus, sans amende, 2 000 € restés sur le compte). Les deux : 52 € ÷ 52 jours = **1 € par jour**.
Verdict : « Annonce · la bleue · 2 000 € » barrée, « La bleue, tu passes ton tour. » À deux, il gagne moins (52 €)
qu'avec la rouge seule (169 €), en quatre fois plus de jours.

Mention à l'écran de 4,0 à 27,4 s : « Exemple · prix moyens constatés ».

## Seconde par seconde

Minutage cible, calé sur les repères de MO5 (`anatomie-mo5.md` § 2) ; l'étape 4 le recale sur la prise retenue
(`audio/vo-mo11/vo-timing.json`). Caméras A (calcul), B (le long des palettes et de la division), C (les voitures et la
pile), F (orbite sur la carte du pro), comme MO5. Zones sûres : aucun texte au-dessus de y = 220, sous y = 1480, à
droite de x = 940 ; centre x = 540.

**Mise en place** : compteur « MARGE / JOUR » à y = 300 ; dessous, la division en Satoshi gris (y ≈ 380,
« 1 000 € ÷ 1 jour »), dont le nombre de jours est un petit calendrier à palettes, le même que celui de l'image 0 ;
« Exemple · prix moyens constatés » à y ≈ 425. Pile de notifications dans la colonne x 160 → 900, y 470 → 980. La rouge
au premier plan à droite (≈ 640 px de large, roues à y ≈ 1460), la bleue en retrait à gauche (≈ 520 px, roues à
y ≈ 1350, légèrement floue), toutes deux tournées vers la gauche ; « la rouge » et « la bleue » écrits en petit,
Satoshi gris, au-dessus des toits. Étiquettes de papier sur la moitié haute de chaque carrosserie (y 1040 → 1420).

| t (s) | Image | Voix | Son |
|---|---|---|---|
| 0,0 | Image 0 déjà composée : « 500 × 2 » en Clash géant, « = 1 000 € ? » dessous. Derrière, flou, un calendrier à palettes de verre éclairé en orange sur « JOUR 1 ». Le trait de lumière écrit « 1 000 € », puis le « ? » en Fraunces orange (1,3). | « Tu gagnes 500 sur une voiture, » (0,08) « 1 000 sur deux. » (1,6) | musique dès l'image 0 (mesure 13) |
| 2,1 | Les palettes sortent du flou, avancent et défilent en rafale jusqu'à « JOUR 52 » ; elles percutent « 1 000 € », qui tremble. | « Ton calendrier n'est pas d'accord. » (2,55-3,9) | rafale de palettes, choc |
| 4,0 | Le calcul s'efface vers le haut ; « 1 000 € » devient le compteur à rouleaux « MARGE / JOUR » (y = 300). Les palettes rapetissent, reviennent à « 1 » et se rangent dans la division : « 1 000 € ÷ 1 jour ». « Exemple · prix moyens constatés » dessous. | « Jour 1, » (4,25) « tu achètes les deux. » (4,95) | palettes, deux cliquetis de clés |
| 4,85 | La rouge entre par la droite et freine au premier plan ; la bleue suit (5,15) et se range en retrait à gauche. Les deux contours se tracent à la lumière (5,6-6,4). | | deux moteurs légers |
| 6,0 → 8,5 | Cinq débits, un par geste de la voix : 6,0 Cartes grises × 2 − 304 · 6,8 Assurances × 2 − 80 · 7,3 Vidange · la rouge − 119 · 7,81 2 pneus · la bleue − 100 · 8,5 Nettoyage × 2 − 40. Chaque notification joue sa vidéo (signature, formulaire sur un téléphone, moteur, pneu, éponge) et s'empile. Les « × 2 » se dédoublent en deux étiquettes de papier qui partent chacune sur une voiture (152 et 152, 40 et 40, 20 et 20) ; les autres collent une seule étiquette. Le compteur roule : 696 → 616 → 497 → 397 → 357. | « Deux cartes grises, » (6,05) « deux assurances, une vidange, des pneus. » (6,8-8,7) | un choc de débit par temps, papier qui se colle (deux papiers pour les « × 2 ») |
| 9,45 | Un trousseau dans une main ; la caméra glisse entre les deux voitures. Les phares de la rouge clignotent au déverrouillage, la bleue reste éteinte (10,3). | « Et tu n'en conduis qu'une à la fois. » (9,4-10,9) | bip de déverrouillage, un seul |
| 11,65 | « Ticket de bus · aller chercher l'autre · − 2,05 € » arrive seule, plus tard, plus petite, de travers, avec sa vidéo de portes de bus qui s'ouvrent. Compteur 355. | (silence de la voix) | portes de bus pneumatiques, le choc un cran plus aigu : le gag |
| 12,0 | La nuit tombe (voile bleu, rue de nuit floutée derrière). Caméra B : les palettes de la division grossissent et défilent, JOUR 2, 3, 5… ; à chaque jour, le compteur roule sans débit : 177 → 118 → 71 → 44. Sous les palettes : « Zéro débit. *Ta marge baisse.* » | | basse coupée, son sous 1 400 Hz de 12,4 à 15,5, palettes, tic-tac |
| 12,5 | JOUR 13 : « Virement reçu · + 3 500,00 € » ; la rouge démarre et sort du cadre par la gauche, ses étiquettes avec elle. La bleue avance au centre. Compteur 27. | « La rouge part en 13 jours. » (12,35-13,6) | moteur qui s'éloigne, tintement du virement |
| 13,1 · 14,0 · 14,8 | Débits sous le calendrier, chacun colle son étiquette sur la bleue : JOUR 31 Assurance · la bleue − 40 (compteur 10) · JOUR 38 Amende · stationnement abusif − 35, un papier orange glisse sous l'essuie-glace (7) · JOUR 47 Contrôle technique · plus de 6 mois − 78, la vidéo du pont élévateur (4). | « La bleue reste dans la rue. » (13,9-14,9) | débits, papier sous l'essuie-glace, coup de tampon |
| 15,5 | Les palettes s'arrêtent sur JOUR 52. Compteur 4, division « 202 € ÷ 52 jours ». | | |
| 15,7 | Le téléphone vibre ; bulle de verre : « Sept semaines en ligne ? 2 350, *aujourd'hui.* » | « Il voit la date. » (16,0) « Tu cèdes. » (16,85) | vibration, la basse revient |
| 17,3 | Notification « Virement reçu · + 2 350,00 € » (montant en orange clair). | « Bénéfice, » (17,55) | |
| 18,1 → 18,9 | Le compteur roule 4 → 1 et se fond dans un « 1 € » géant, en relief (≈ 430 px), « par jour » dessous en Clash ; la division devient « 52 € ÷ 52 jours ». Tout le reste s'assombrit. | « un euro par jour. » (18,55-19,3) | arrêt de bande à 18,65, silence |
| 19,9 | « *Moins qu'un ticket de bus.* » s'écrit à la lumière sous le « 1 € ». À 20,3, la petite notification du ticket de bus (− 2,05 €) glisse à côté, à droite (x ≤ 940). | « Moins qu'un ticket de bus. » (19,9-20,8) | |
| 20,9 → 22,3 | Rembobinage : lignes de balayage, le récit repart à l'envers jusqu'au jour 1. Les palettes redescendent de 52 à 1, les étiquettes de la bleue se décollent une à une, la rouge revient à reculons à sa place, le compteur remonte de 1 à 1 000. | « Ceux qui gagnent comptent la marge par jour. » (21,0-22,7) | souffle inversé, la musique repart sur le temps à 22,0 |
| 22,3 | Fond chaud, les deux voitures floues derrière une carte de verre. Le titre « Marge ÷ jours » s'écrit à la lumière. Ligne 1 (23,0) : « La rouge *seule* · 169 € ÷ 13 jours = 13 € par jour », le « 13 € » (Clash) éclate en orange (24,1). Ligne 2 (24,6), en gris : « Les deux · 52 € ÷ 52 jours = 1 € par jour ». Texte dans la colonne 160 → 920, chaque ligne sur deux rangs si besoin. | « La rouge seule, » (23,2) « 13 euros par jour. » (24,0-24,9) | les chiffres claquent |
| 25,5 | « Annonce · la bleue · 2 000 € » glisse sous la carte et se barre d'un trait orange (26,0) ; derrière, la bleue recule et sort du cadre ; la rouge reste. « La bleue, tu *passes ton tour.* » | « La bleue, » (25,6) « tu passes ton tour. » (26,4-27,1) | marche arrière légère |
| 27,45 | Retour : la carte s'efface en glissant, le calcul de l'image 0 revient dans le même cadre ; derrière, les palettes floues retournent à « JOUR 1 ». | « La prochaine fois que tu te dis… » (27,9-29,5) | mesure 55, la musique boucle sur la mesure |
| 29,6 | = image 0 | → « Tu gagnes 500… » | |

Contrôles prévus : boucle mesurée (écart moyen image finale / image 0 < 1), une seule pause (sur « 1 € »), aucun plan
figé de plus de 0,9 s, rien dans les zones interdites, `qa_video.py` sans FAIL ni avertissement texte, `glassCount` et
minutes de rendu relevés.

## La voix

Simon, ton MO5. 21 répliques, 94 mots écrits (« 1 000 » compte pour deux). Les nombres de MO11 sont courts : la lecture
fait 132 syllabes, autant que MO5, soit environ 21,7 s de parole estimées sur le débit de MO5. La prise chronométrée
tranche. Le texte envoyé à ElevenLabs (nombres en lettres, balises eleven_v3) est dans `docs/timeline-mo11.md`, avec
l'ouverture B.

| # | t (s) | Réplique (écran, sous-titres) | Texte ElevenLabs |
|---|---|---|---|
| 1 | 0,08 | Tu gagnes 500 sur une voiture, | [deadpan] Tu gagnes cinq cents sur une voiture, |
| 2 | 1,6 | 1 000 sur deux. | mille sur deux. |
| 3 | 2,55 | Ton calendrier n'est pas d'accord. | [short pause] Ton calendrier n'est pas d'accord. |
| 4 | 4,25 | Jour 1, | [pause] Jour un, |
| 5 | 4,95 | tu achètes les deux. | tu achètes les deux. |
| 6 | 6,05 | Deux cartes grises, | [pause] Deux cartes grises, |
| 7 | 6,8 | deux assurances, une vidange, des pneus. | deux assurances, une vidange, des pneus. |
| 8 | 9,4 | Et tu n'en conduis qu'une à la fois. | [short pause] Et tu n'en conduis qu'une à la fois. |
| 9 | 12,35 | La rouge part en 13 jours. | [pause] La rouge part en treize jours. |
| 10 | 13,9 | La bleue reste dans la rue. | [short pause] La bleue reste dans la rue. |
| 11 | 16,0 | Il voit la date. | [pause] Il voit la date. |
| 12 | 16,85 | Tu cèdes. | [short pause] Tu cèdes. |
| 13 | 17,55 | Bénéfice, | [short pause] Bénéfice, |
| 14 | 18,55 | un euro par jour. | [short pause] un euro par jour. |
| 15 | 19,9 | Moins qu'un ticket de bus. | [pause] Moins qu'un ticket de bus. |
| 16 | 21,0 | Ceux qui gagnent comptent la marge par jour. | [pause] Ceux qui gagnent comptent la marge par jour. |
| 17 | 23,2 | La rouge seule, | [short pause] La rouge seule, |
| 18 | 24,0 | 13 euros par jour. | treize euros par jour. |
| 19 | 25,6 | La bleue, | [short pause] La bleue, |
| 20 | 26,4 | tu passes ton tour. | tu passes ton tour. |
| 21 | 27,9 | La prochaine fois que tu te dis… | [pause] La prochaine fois que tu te dis… |

**Textes à l'écran** (6 mots au plus par élément, ils ne recopient pas la voix) : « 500 × 2 = 1 000 € ? » · « JOUR 52 »
et les palettes · « MARGE / JOUR » · la division (« 1 000 € ÷ 1 jour » … « 52 € ÷ 52 jours ») · « Exemple · prix
moyens constatés » · « la rouge », « la bleue » · les neuf notifications (titre · montant) · « Zéro débit. Ta marge
baisse. » · « Sept semaines en ligne ? 2 350, aujourd'hui. » · « Virement reçu · + 3 500,00 € » et « + 2 350,00 € » ·
« 1 € » « par jour » · « Moins qu'un ticket de bus. » · « Marge ÷ jours » et ses deux lignes · « Annonce · la bleue ·
2 000 € » · « La bleue, tu passes ton tour. »

**Passe Stop Slop** : aucun adverbe, aucune tournure « ce n'est pas X, c'est Y », pas de tiret long, voix active. « Tu
prends les deux » devenu « tu achètes les deux » (le geste exact) ; « Il a vu la date de l'annonce » raccourci en
« Il voit la date » (la bulle dit le reste) ; « Moins que ton ticket de bus » ramené à cinq mots, « Moins qu'un ticket
de bus » ; l'attente dit « Zéro débit. Ta marge baisse. » au lieu de répéter la voix ; les voitures s'appellent « la
rouge » et « la bleue », ce qu'on voit, jamais leur marque. La personnification « Ton calendrier n'est pas d'accord »
reste : c'est la blague. Note : directivité 9, rythme 8, confiance 9, naturel 8, densité 9, soit 43/50.

## Le son

- **Voix** : Simon (`eleven_v3`, `mvhJVdVoTWVUtL4keT7W`), deux prises, la plus proche du ton de MO5 retenue sur
  mesures (débit, pauses, « cinq cents » et « un euro » nets), accélérée de 10 % si besoin, chaque réplique ramenée au
  même niveau.
- **Musique** : Controlled Drop recalée à 120 BPM, mêmes passages que MO5 : mesure 13 de 0 à 18,65 s ; basse retirée
  et son sous 1 400 Hz de 12,4 à 15,5 s ; arrêt de bande en 0,22 s sur « un euro » ; silence ; 0,9 s du passage
  suivant à l'envers jusqu'au temps de 22,0 s ; mesure 55 jusqu'à la fin, fondu de boucle.
- **Bruitages Mixkit** (banque `audio/bank/mo11/`) : rafale de palettes, choc, deux cliquetis de clés, deux moteurs
  légers, choc de débit, papier collé (doublé pour les « × 2 ») et décollé, bip de déverrouillage, portes de bus
  pneumatiques, tic-tac, moteur qui s'éloigne, tintement de virement, papier sous l'essuie-glace, tampon, vibration,
  rouleaux, arrêt de bande, souffle inversé, plume, marche arrière légère. Un son principal à la fois (un son moins
  important à moins de 0,12 s est retiré).
- **Mix** façon `scripts/audio-mo5.py` : nivellement par réplique, ducking par bande, −14 LUFS, plafond −3,5 dBTP
  mesuré sur le MP4, contrôle téléphone (énergie sous 150 Hz).

## L'image

- **Charte MO5** : fond #08070a → #17100b, orange #ff5a1f / #ff8a4c / #ffb38a, encre #f6efe7, gris #a59a90 ; Clash
  Display pour les chiffres, Satoshi pour l'interface, Fraunces italique en dégradé orange pour le mot porteur (« Ta
  marge baisse. », « aujourd'hui. », « Moins qu'un ticket de bus. », « seule », « passes ton tour. »).
- **Le compteur** : rouleaux de MO5 (colonnes −60..19, zéros de tête en `k^3`), libellé « MARGE / JOUR ». La division
  dessous garde le même calendrier à palettes que l'image 0 : le calendrier du hook devient le diviseur du compteur.
  Arrondi à l'euro, il roule à chaque débit et à chaque jour.
- **Les voitures** : photos Wikimedia Commons retouchées par `scripts/photos-mo11.py` (logos et plaques effacés,
  plaques vierges, détourage BiRefNet, étalonnage dans la charte, habitacles assombris), contour vectoriel tracé à la
  lumière, ombre et reflet au sol, étiquettes au-dessus de y = 1480 (tableau `TAGS` par voiture). Aucun nom de marque
  à l'écran ni dans la voix.
- **Les documents** : notifications, bulle, carte du pro et annonce barrée en verre dépoli de la charte. L'annonce est
  une carte de verre avec un titre et un prix, jamais l'interface d'un site.
- **Mouvement** : film en code déterministe (`window.seek(t)`), springs fermés de `lib/motion.js`, `track()` sur chaque
  axe de caméra, `story(t)` pour le rembobinage (récit 18,6 → 4,9 s entre 20,9 et 22,3 s du film), flou de bougé
  (`window.shutter` / `window.samples`, MB = 4 au rendu), bruit déterministe. Verre limité par `glass(e)` (Hypothèse,
  Fabrication).
- **Vidéos réelles** : Mixkit en séquences JPG à 30 i/s peintes sur canvas, liste à compléter dans
  `docs/timeline-mo11.md` (« Les plans réels »).

## Ce qu'on enregistre, ce qu'on envoie, ce qu'on commente

On ne demande rien à l'écran.
- **Revoir** : la dernière phrase enchaîne sur la première ; « JOUR 52 » de l'ouverture prend son sens au deuxième
  passage ; les étiquettes dédoublées et la division qui change chaque jour vont trop vite pour tout lire.
- **Enregistrer** : la carte « marge ÷ jours » (la rouge seule, 13 € par jour ; les deux, 1 €) et la liste de ce que
  coûte l'attente (assurance, amende après 7 jours au même endroit, contrôle technique à refaire après 6 mois,
  négociation sur l'âge de l'annonce).
- **Envoyer** : « Un euro par jour, moins qu'un ticket de bus », et le bus pris avec deux voitures au parking, au pote
  qui veut acheter la deuxième.
- **Commenter** : sa voiture qui a dormi le plus longtemps, combien de jours la dernière a mis à partir, qui a déjà
  acheté deux voitures d'un coup.

## Publication

- Ouverture A, même créneau que MO5 (jour et heure à noter dans le journal avant publication).
- Légende proposée, sans CTA : « Achat-revente voiture : deux d'un coup avec 5 000 €, 52 € de bénéfice en 52 jours. »
  Ligne suivante : « Photos : Vauxford / Wikimedia Commons (CC BY-SA 4.0) ; M 93 / Wikimedia Commons (domaine
  public) ».
- Hashtags (`docs/hashtags_test.md`, débutants, jeu A) : #achatrevente #achatreventevoiture #voitureoccasion
  #entrepreneur.
- Couverture `poster-mo11.png` : l'image 0, lisible en vignette ; SRT fourni à part.
- Journal : noter le changement imposé (deux voitures Wikimedia, la rouge et la bleue) et l'amélioration de
  fabrication (verres actifs et minutes de rendu, avant → après).

## Production : les 5 étapes

| Étape | Ce que je livre | Contrôle |
|---|---|---|
| 1. Brief | ce document et `docs/timeline-mo11.md` (chiffres sourcés, voix) | OK accordé d'avance |
| 2. Timeline et images tests | plans Mixkit choisis sur planche, `assets/photos-mo11/CREDITS.tsv`, 3 images tests (image 0 avec les palettes qui percutent, pluie de débits avec étiquettes dédoublées sur les deux voitures, carte « marge ÷ jours ») | lignes de zone sûre tracées sur chaque image |
| 3. Maquettage 0,1 s | `film-mo11/film.js` repris de `film-mo5/film.js` (objet `K`, `TAGS` par voiture, compteur « MARGE / JOUR » et division à palettes, `glass(e)`), planches 0,1 s, boucle mesurée | planches regardées, `glassCount` maximal relevé |
| 4. Voix | deux prises de Simon (environ 1 400 crédits), transcription mot à mot, `vo-timing.json`, film recalé | « cinq cents » et « un euro » bien dits, aucune balise prononcée |
| 5. Animation, son, livraison | `scripts/audio-mo11.py` repris de `audio-mo5.py`, rendu parallèle chronométré, 2 MP4 (A, B), couverture, SRT | `qa_video.py` sans FAIL ni avertissement texte, −14 LUFS, ≤ −3,5 dBTP mesuré sur le MP4, minutes de rendu notées |

Journal de fabrication à remplir après le rendu : verres actifs par image et minutes de rendu, avant (MO6 : ≈ 2 h)
→ après (MO11).

## Ce qu'il me faut

Rien de bloquant : production « tout en auto ».
1. Avant de publier : les chiffres de MO5 dans TikTok Studio (visionnages complets, enregistrements, part encore là à
   3 s), et ceux de MO9 et MO10 s'ils sont publiés. Sans eux, l'hypothèse ne se tranche que sur les vues.
2. En option : si tu as déjà acheté deux voitures en même temps, tes vrais chiffres et tes vrais délais remplaceraient
   l'exemple.
