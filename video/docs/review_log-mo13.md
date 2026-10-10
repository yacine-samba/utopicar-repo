# MO13 « Avec 1 500 € » : journal de critique du film

Film : `film-mo13/index.html` + `film-mo13/film.js`, sur `lib/kit47.js` (lecture seule) et `film-mo13/kit-mo13.js`.
Minutage lu dans `audio/vo-mo13/vo-timing.json` : **provisoire** (aucune prise de Simon, ElevenLabs bloqué), piste voix
muette. Grille : `video/CLAUDE.md` § Contrôle qualité et `.claude/skills/motion-studio/references/qa-delivery.md`.
8 = publiable sans gêne.

## Round 1 (9 octobre 2026, critique seule : le film n'a pas été modifié)

**Matériel regardé**
- Planches toutes les 0,1 s refaites : `renders/review/mo13-planche-0.1s-0-10.jpg`, `-10-20.jpg`, `-20-31.3.jpg`
  (313 images, regardées par tranches de 2 s). Aucune erreur `PAGEERR` ni `CONSOLE` (planches, téléphone, images fixes).
- Test téléphone à 360 px : `renders/phone-mo13.png` (0 · 3,6 · 4,4 · 6,4 · 9,2 · 10,75 · 13,7 · 16,0 · 18,15 · 22,0 ·
  23,9 · 28,9 s).
- Images pleine définition : `renders/stills-mo13/`, ouverture A (0 · 2,0 · 3,0 · 4,4 · 5,0 · 6,4 · 9,0 · 9,3 · 10,75 ·
  11,7 · 12,9 · 13,7 · 14,65 · 15,6 · 16,1 · 17,5 · 18,15 · 19,0 · 19,7 · 20,6 · 21,6 · 22,5 · 23,9 · 24,6 · 25,2 · 26,4 ·
  27,6 · 28,9 · 30,0 · 30,6 · 31,0 · 31,233 s) et ouverture B (`HOOK=B`, fichiers à la milliseconde près : 0,001 ·
  1,501 · 2,501 · 3,401 · 4,201 · 30,501 · 30,84 s).
- Les 8 vidéos des notifications (`film-mo13/seq/`, 5 images chacune) : aucun visage (« cles » coupe sous le menton),
  aucune plaque ; « pneu » montre, flou à l'arrière-plan des deux premières images, une forme d'emblème sur une
  voiture blanche (à vérifier en grand).
- Son : `audio/mix-mo13.wav` et `audio/stems-mo13/` mesurés (ebur128, true peak, spectre, RMS par passage), mix
  réencodé en AAC 256 k dans le scratchpad pour le true peak après encodage ; `docs/mix_report-mo13.txt`. **Rien n'a
  été écouté.** Pas de MP4 à ce round (consigne) : `qa_video.py` n'a pas tourné, ses contrôles sont refaits à la main
  sur les images et le WAV (ci-dessous).

**Notes**

| Hook | Lisibilité 360 | Zones sûres | Mouvement | Variété / rythme | Marque | Voix (provisoire) | Son | Recette 47 / envie |
|---|---|---|---|---|---|---|---|---|
| 7 | 7 | 8 | 7 | 8 | 8 | 8 | 7 | 8 |

Pas livrable en l'état (hook, lisibilité, mouvement, son < 8).

**Mesures**
- Zones sûres sur les 32 images pleine définition de l'ouverture A et les 4 de B (méthode de `qa_video.py` : gradient
  > 60 à mi-définition, fenêtre de 80 px, seuil 0,035) : aucun texte au repos dans une zone interdite. Touchés
  seulement par des cartes en mouvement : le tampon « toi aussi » à son échelle d'arrivée (9,0 s, x ≤ 976), le
  virement 2 qui entre (14,65 s), le ticket 3 qui entre (16,1 s). Sur les 313 images des planches : 25 images
  touchées, toutes des notifications, bulles ou messages qui entrent par la droite ou sortent par la gauche. Contenu net
  de y = 264 à 1 460 en récit ; l'étiquette de 4,4 s descend à y = 1 488 (bord du papier, chiffres au-dessus) ; le recul
  de 20,6 s montre les marches jusqu'à y = 1 546 (décor, sans texte).
- Cadrage des voitures (pixels clairs ou saturés entre y = 950 et 1 400) : 206 de **x = 28** à 801 (6,4 s), Mégane de
  84 à 859 (13,7 s), Fiesta de 265 à **1 020** (15,6 s) et de 193 à 989 (18,15 s). Le brief demande « texte et voitures
  … colonne 140 → 940 ».
- `qa_video.py` refait à la main, sans MP4 : première image écart-type 45,2 (pleine) ; aucune image vide ; aucun plan
  figé de plus de 0,9 s (planches ramenées à 4 i/s) ; −14,3 LUFS intégrés, true peak −3,8 dBTP sur le WAV et **−3,9 dBTP
  après AAC 256 k** ; 2 premières secondes −15,1 LUFS contre −14,3 ; 33,4 % de l'énergie sous 150 Hz, 23,4 % entre 1 et
  5 kHz. **Aucun FAIL mesurable.** WARN attendu sur le MP4 : zones, pour les cartes qui entrent et sortent (pas des
  textes au repos).
- Boucle : écart moyen 0,37 sur 255 entre l'image 0 et 31,233 s.
- Voix provisoire : 13 répliques posées aux ancres du brief, 71 mots écrits, 17,8 s de parole, **2,27 mots par seconde
  de film** (MO5 : 2,53 ; MO9 : 2,36), 3,99 mots par seconde de parole ; écarts de 0,30 à 2,77 s, aucun chevauchement ;
  dernière réplique finie à 31,02 s, film de 31,25 s. Mais les durées sont celles d'un Simon plus rapide que le vrai :
  17,8 s contre 21,5 s de créneaux dans le brief et 18,8 à 20,9 s estimés ; Simon posé faisait 3,1 mots par seconde de
  parole sur MO9.
- Son (mesuré, pas écouté) : arrêt de bande à 0 image du « 3 100 € » (21,547 s), musique muette de 21,76 à 24,11 s ;
  limiteur jusqu'à **−12,8 dB** (21,58 s) et −12,4 dB (28,02 s), **23,5 %** du film à plus de 3 dB de réduction ; à la
  jointure de boucle, **292 ms** entre le dernier temps (31,00 s) et le premier (0,047 s) au lieu de 500.

**Ce qui marche** : l'image 0 est composée et lisible sur les deux ouvertures (A : « Il te manque 8 500 € ? » ;
B : « 1 500 € ↓ 3 100 € », la mention dès 0 s). Le compteur COMPTE roule juste à chaque coup (1 500 → 300 → 260 → 108 →
50 → 1 950 → 400 → 50 → 2 500 → 500 → 150 → 3 100) et se lit à 360 px. Les étiquettes barrées (1 400 → 1 200 ✓ prix max,
1 800 → 1 550, 2 300 → 2 000), le montant qui file du compteur vers l'étiquette, le gag « Essence · elle était sur la
réserve » et son tampon « toi aussi », lisibles à 360 px. La tentation fonctionne : lumière froide, l'annonce à
1 600 € qui bute sur 150 €, le tampon « une à la fois », puis la pile de « Toujours dispo ? ». Le recul de 20,6 à
21,4 s montre enfin l'escalier entier, ses trois arêtes écrites. Le rembobinage (24,6 à 25,3 s) repasse chaque état du
compte en silhouettes : clair et rapide. La carte se remplit sur les temps, la quatrième marche s'allume au-dessus
(« Ta 4e »), « prix max 2 500 € » claque, carte immobile de 28,5 à 30,35 s. Une seule couleur d'accent, aucun logo,
aucune plaque, aucun visage, aucun site d'annonces nommé.

### Les 3 problèmes les plus graves

**1. La chute ne se lit pas : « 10 000. » reste à l'écran un tiers de seconde.** `T.att2 = M('dixmille') - 0.1`
(23,44 s) et `writeWord(att2, t, T.att2, 0.05, 22, attK)` : le dernier glyphe commence à 23,74 s, son remplissage
(`ts + 0.16`, `P.rise`) n'est complet que vers 24,2 s, et `attK = 1 - sm(REW[0] - 0.05, REW[0] + 0.2, t)` l'efface
dès 24,06 s (`REW[0]` = 24,105 s). Sur les planches : « 10 000. » en contour creux de 23,7 à 23,9 s, plein de 24,0 à
24,15 s, parti à 24,3 s. À 23,9 s (`stills-mo13/t23.900.png`, `phone-mo13.png`), l'ellipse de la marche 2 et son
inscription « 1 550 → 2 450 ✓ » se voient au travers des lettres. C'est la phrase qu'on envoie au pote (ingrédient 6).
Corrections (`film-mo13/film.js`, sans toucher au son : `REW` ne bouge pas) :
- ligne 59 : `T.att2 = M('davoir') - 0.05` (≈ 23,15 s) ; ligne 615 : pas d'écriture 0,05 → 0,03 :
  `K.writeWord(att2, t, T.att2, 0.03, 22, attK)` ;
- ligne 614 : `const attK = 1 - sm(REW[0] + 0.2, REW[0] + 0.4, t);` (le « 3 100 € » géant tient jusqu'à ≈ 24,5 s,
  `st` ne repasse sous `T.big` qu'à 24,53 s) → « 10 000. » plein de ≈ 23,55 à 24,3 s, soit 0,75 s, au lieu de 0,15 s ;
- sous la chute, éteindre le décor derrière le mot : ligne 369, `dimK = big * (0.9 + 0.08 * sm(T.att - 0.1, T.att + 0.4, st))`,
  et ligne 399, inscription des arêtes multipliée par `(1 - big)` :
  `K.writeWord(s.w, tt, te + 0.42, 0.03, 12, safe * (1 - big))`.
- Vérifier : `CUT=mo13 node scripts/at.mjs 23.3,23.6,23.9,24.2,24.4,24.6 renders/review/mo13-at.jpg` ; « 10 000. »
  plein et net, rien au travers, sur au moins 0,7 s.

**2. Le hook : la 206 flotte et rien de neuf entre 0,9 et 2,85 s ; la contradiction arrive après 3 s.** Sur l'image 0
(`t00.000.png`), la 206 est posée au milieu de l'image, au-dessus des lumières de la rue, sans sol ni ombre : elle se
lit comme un autocollant, pas comme « la petite rouge d'en face » garée. De 0,9 à 2,85 s, les planches sont presque
identiques : la lumière sur « 1 500 » et la mise au point (copie floue → nette, à l'échelle 0,8) ne se voient pas à
360 px. L'étiquette « À VENDRE · 1 400 € » n'arrive qu'à 3,9 s et son prix à 4,3 s : l'écart (1 400 < 1 500) se ferme
après la mesure des 3 s. Corrections (`film-mo13/film.js`, voix et texte du hook inchangés) :
- poser la 206 sur la rue : dans `bgA` (ligne 91), un trottoir sombre sous la ligne des roues,
  `el('div', 'abs', bgA, 'left:0;top:1380px;width:1080px;height:540px;background:linear-gradient(rgba(8,7,10,0),rgba(8,7,10,.85) 28%)')`,
  et, tant que la 206 est dans la rue, une ombre de contact visible : ligne 429, ombres de la 206 à 1 au lieu de 0,55
  avant `T.out`, plus une ellipse `0.8 * w` × 46 px `rgba(0,0,0,.9)` sous les roues (dans `mkCar`, réservée à `k === 0`) ;
  si le cadre de `rueCv` le permet, remonter la vidéo (`top:-107px` → la bordure du trottoir d'en face à y ≈ 1 404) ;
- rendre l'étiquette visible sur la mise au point, le prix sur la voix : `T.tag = T.focus + 0.15` (≈ 3,0 s, papier
  et « À VENDRE » seuls) et un nouveau `T.prix = M('b1400') - 0.05` (≈ 4,13 s) pour la plume qui écrit « 1 400 € »
  (lignes 454-457 : `T.tag + 0.12` → `T.prix`, `T.tag + 0.1 / 0.7 / 0.9` → `T.prix …`) ; `T.mention` reste sur le
  prix ;
- rendre visible le temps de 1,65 s (« Tu en as mille cinq cents ») : pulsation de « 1 500 » 0,14 → 0,3 (ligne 522) et,
  pendant ce temps, « 10 000 − » baissé à 0,35 d'opacité (ligne 488).
- Vérifier : `CUT=mo13 node scripts/at.mjs 0,1.0,1.9,2.6,3.0,3.4,4.3 renders/review/mo13-at.jpg`, puis l'image 0 en
  vignette de 200 px et à 360 px : la 206 touche un sol, une nouveauté visible toutes les 0,8 s au plus avant 3 s ; même
  contrôle sur B (`HOOK=B CUT=mo13 node scripts/render.mjs --at 0.001,1.501,3.001`).

**3. Les voitures sortent de la colonne : la 206 touche le bord gauche, la Fiesta passe sous les boutons.** La caméra
du monde vise x = 540 jusqu'au recul (`camS`, ligne 303), alors que les marches s'écartent de 432 à 756 et que chaque
voiture est posée 90 px à droite du centre de sa marche (`pose`, ligne 110). Résultat mesuré : la 206 de x = 28 à 801
pendant 6 s (6,4 s : le pare-chocs est coupé par le bord de l'image), la Fiesta de 265 à 1 020 pendant 5 s (15,6 à
20,4 s), son arrière sous la colonne des boutons TikTok. Le brief demande les voitures dans la colonne 140 → 940.
Correction (`film-mo13/film.js`, ligne 303) : la caméra suit la marche en cours, centrée sur la voiture et son
étiquette (centres mesurés : 415, 471, 642) :
`x: track(st, [[0, 540], [T.out, 415, { f: 0.7, z: 1 }], [T.rise1, 471, CAMR], [T.rise2, 642, CAMR], [T.pull, OV.x, CAMP]]) + noise(11, tA * 0.3) * 5`.
La translation reste horizontale et verticale pure, sans rotation ; le montant qui file et les arêtes suivent par
`W2S`. Vérifier : `CUT=mo13 node scripts/at.mjs 6.4,11.7,13.7,15.6,18.15,20.6 renders/review/mo13-at.jpg` et la
mesure des voitures (pixels clairs ou saturés entre x = 100 et 980).

### Les autres
- **Raccord du calcul vers le compteur (4,8 à 5,2 s)** : cinq calques superposés à 5,0 s (`t05.000.png`) : « 10 000 − »
  et « Il te manque » qui s'effacent, « 1 500 » qui monte, les palettes « MARCHE 1 » et la mention qui entrent par-dessus.
  `showA = 1 - sm(T.out, T.out + 0.18, t)` (au lieu de 0,3), `T.flap1 = T.out + 0.3`, mention masquée de `T.out` à
  `T.out + 0.4`.
- **Repli de boucle (30,4 à 30,9 s)** : fondu enchaîné de la carte, de l'escalier et de l'image 0 (`t30.600.png` :
  triple exposition), interdit par `video/CLAUDE.md`. Finir la sortie de la carte (`ldK`, `cOut`) et de l'escalier avant
  que la rue et le calcul reviennent (`back` et `street` à partir de `LOOP + 0.55 * FO`), la carte sortant par le haut
  en mouvement, pas en fondu.
- **« 3 100 € » géant (21,3 à 21,5 s)** : le compteur et le grand chiffre se superposent une image (21,4 s : « 3100 € »
  et « 3 100 € » l'un sur l'autre). Couper le compteur à la frame où `big9` entre (échelle 0,85 au départ).
- **Les arêtes « achat → revente ✓ » ne se lisent jamais dans le récit** : écrites à `te + 0.42` pendant que la caméra
  monte, effacées avant y = 1 474 ; au recul et sous la chute, ≈ 7 px de haut à 360 px. Écrire à `te + 0.1` (pas 0,02)
  et grossir le mot de 40 à 56 px, ou les laisser en décor sans texte.
- **Carte** : à 360 px, la règle « réserve = budget ÷ 5, arrondie à la centaine » (28 px) et les « frais 250 ✓ »
  (26 px) font 9 px : passer à 34 et 30 px (la carte a la place sous chaque ligne). Le reflet diagonal (`.sheen`)
  traverse les lignes de 25,4 à 26,6 s : opacité 0,2 → 0,08 sur la carte. Une tache verte sous la carte (28,9 s, fond
  « calc » en `sepia(.55)`) : ajouter `saturate(.3)`. Le bord de la plaque va jusqu'à x ≈ 970 (textes ≤ 922) : largeur
  860 → 820.
- **Mention** « Exemple · prix moyens constatés » absente de 25,1 à 26,3 s (entre la fin de la mention du HUD et celle
  de la carte) ; le brief la veut de 4,0 à 30,5 s.
- **Marches 2 et 3 serrées** : de 14,49 à 16,1 s, virement 2, départ de la Mégane, montée, arrivée de la Fiesta, prix
  barré, achat et ticket ; le sommet « 2 500 » n'est seul à l'écran que de 15,2 à 15,75 s. Voulu par le brief (marches
  de plus en plus courtes) ; si la vraie prise allonge ce passage, décaler `T.arr3` de 0,25 s.
- **Annonce de la tentation** : la silhouette de voiture, gris foncé sur fond foncé, ne se voit pas (17,0 à 18,4 s) :
  silhouette plus claire (`#8a7f86`) avec liseré.
- **Vidéos** : « cles » sur fond blanc détonne dans la charte (10,6 s, 20,1 s) ; « pneu » à vérifier en grand pour
  l'emblème flou de l'arrière-plan.
- **Voix (provisoire)** : refaire le `vo-timing.json` provisoire sur les créneaux du brief (21,5 s, `scripts/vo-mo13.py
  --provisoire --debit …`) pour tester le film dans le cas lent : les gestes attachés aux fins de répliques (`T.out`,
  `T.big`, `REW`, lignes de la carte) bougeront avec la vraie prise.
- **Son** : réduire de 6 dB avant le limiteur les accents du « 3 100 € » (21,55 s) et du « prix max » (27,94 s)
  dans `scripts/audio-mo13.py`, pour un limiteur ≤ 6 dB ; jointure de boucle à 292 ms au lieu de 500 : film de
  31,45 s (repli de 1,1 s) ou départ de la musique décalé pour que le premier temps tombe 0,5 s après le dernier.

**FAIL de `qa_video.py`** : aucun mesurable sans MP4 (première image, loudness, true peak après AAC, images vides et
plans figés contrôlés à la main). À relancer sur le premier rendu.

### Corrections du round 1 (9 octobre 2026, après la critique)

Fichiers touchés : `film-mo13/film.js`, `film-mo13/kit-mo13.js` (inscription des marches), `scripts/vo-mo13.py`
(fin du film), `audio/vo-mo13/vo-timing.json` et ses pistes muettes (relancé en `--provisoire`, mêmes réglages : seule
la durée change), `timeline-mo13.json` (durée), `film-mo13/events.json` (relancé), `scripts/audio-mo13.py` puis
`audio/mix-mo13.wav`, `audio/stems-mo13/`, `docs/mix_report-mo13.txt` (relancés), `docs/timeline-mo13.md` (durée).
Aucun appel ElevenLabs. Rien de partagé n'a été modifié (`lib/kit47.js`, `film-mo9/`, `film-mo10/`,
`scripts/render.mjs` et les autres outils).

Vérifié sur des images rendues et regardées : `renders/review/mo13-at.jpg` (ouverture 0 → 5,2 s, puis chute
23,3 → 24,6 s), `mo13-at2.jpg` (24 instants, du raccord de 4,8 s au repli de 31,43 s), `renders/phone-mo13.png`
(18 instants à 360 px), `renders/stills-mo13/` (A : 0 · 3,4 · 5,0 · 6,4 · 10,6 · 11,7 · 13,7 · 15,6 · 18,15 · 20,1 ·
20,6 · 21,25 · 21,3 · 23,9 · 28,9 · 30,6 · 31,433 s ; B : 0,001 · 1,501 · 3,001 · 30,501 · 30,84 s) et les planches
toutes les 0,1 s refaites (`mo13-planche-0.1s-0-10.jpg`, `-10-20.jpg`, `-20-31.5.jpg`). Aucune erreur `PAGEERR`.

**Les 3 problèmes les plus graves : corrigés.**
1. **La chute se lit.** `T.att2 = M('davoir') − 0,05` (23,15 s), écriture au pas de 0,03 s ; effacement
   `attK = 1 − sm(REW[0] + 0,2, REW[0] + 0,4)` (24,31 → 24,51 s, pendant que le « 3 100 € » géant tient encore) ;
   voile de l'escalier `0,9 + 0,08` au lieu de `0,78 + 0,12` ; inscriptions des marches éteintes sous la chute
   (`× (1 − big)`). Sur `mo13-at.jpg` : « 10 000. » plein et net à 23,6 · 23,9 · 24,2 s, en train de partir à 24,4 s,
   remplacé par le rembobinage à 24,6 s : **plein de ≈ 23,55 à 24,35 s (0,8 s, contre 0,15 s)**, plus rien au travers
   (ni l'ellipse de la marche 2 ni « 1 550 → 2 450 ✓ »). `REW` et le son n'ont pas bougé.
2. **Le hook.** (a) La 206 est posée : vidéo de la rue agrandie (× 1,9) et remontée, ses lumières passent derrière la
   voiture au lieu de dessous ; trottoir sombre sous la ligne des roues (dégradé dès y = 1 380) ; ombres de la 206 à 1
   dès l'image 0, ombre de contact `0,8 w × 46 px` sous les roues, reflet faible (0,06) sur le trottoir. (b) L'étiquette
   arrive avec la mise au point, vierge (`T.tag = T.focus + 0,15` = 3,00 s, « À VENDRE » seul) ; la plume y écrit
   « 1 400 € » sur la voix (`T.prix0 = M('b1400') − 0,05` = 4,13 s). (c) Une nouveauté visible toutes les 0,9 à 1,1 s
   avant 3 s : 0,1 s « 10 000 » s'allume, **1,0 s la plume repasse le « ? » sur « revente ? »** (`T.q` 0,2 →
   `M('revente') − 0,05`, ajout de ce round), 1,9 s « 1 500 » s'allume et bat (pulsation 0,14 → 0,3) pendant que
   « 10 000 − » descend à 0,35, 2,85 s mise au point, 3,0 s contour et étiquette. Image 0 regardée à 200 et 360 px :
   la 206 touche un sol. Même fond sur l'ouverture B (`t00.001.png`). Contrôle `art-du-hook` (texte et voix inchangés) :
   Temps, Sens et Miroir ouverts à l'image 0 ; l'écart s'ouvre à l'image à 3,0 s (étiquette vierge : sujet clair,
   réponse ouverte) et se ferme sur la voix à 4,13 s.
3. **Les voitures restent dans la colonne.** La caméra suit la marche en cours (`camS`, x : 540 → 370 à `T.out`, 468 à
   `T.rise1`, 591 à `T.rise2`, puis `OV.x` au recul). Les visées 415 / 471 / 642 proposées, essayées d'abord,
   laissaient la Fiesta de x = 95 à 870 (18,15 s) et la 206 décentrée (150 → 840) : elles ont été remesurées sur les
   images. Mesuré, voiture posée : **206 de 194 à 888** (6,4 s), **Mégane de 160 à 910** (13,7 s), **Fiesta de 146 à
   936** (18,15 s) ; 206 de 190 à 890 à 11,7 s ; Fiesta qui freine à 15,6 s (caméra encore en route) de 210 à 974,
   sous la limite de 980. Le montant qui file et les arêtes suivent (W2S).

**Les autres points : corrigés.**
- **Raccord 4,8 → 5,2 s** : `showA` sur 0,18 s, `T.flap1 = T.out + 0,3`, mention écartée de `T.out` à `T.out + 0,6`
  (elle descend de 14 px et revient). À 5,0 s (`mo13-at2.jpg`) : « 1 500 » qui monte, les cases du compteur, la 206
  sur sa marche, rien d'autre.
- **Repli de boucle sans fondu enchaîné.** Film de **31,25 → 31,45 s**, boucle inchangée (30,35 s), repli de 1,1 s
  (`vo-mo13.py` : `TAIL` 0,2 → 0,4, `FOLD` 0,9 → 1,1). Le repli en deux temps (`CLR = LOOP + 0,5 × FO`, B : 0,4) : la
  carte file par le haut (ressort f = 2,6, hors de l'image en 0,2 s), l'escalier descend et s'éteint, le fond chaud
  aussi ; tout est parti à 30,9 s. Ensuite seulement la rue, le calcul et la 206 reviennent en avançant (30,86 →
  31,39 s). Planche : 30,45 s carte qui sort, 30,6 s escalier seul, 30,75 s escalier qui s'éteint, 30,9 s fond sombre et
  lueur, 31,05 → 31,43 s l'image 0 qui revient ; plus de triple exposition. Même schéma sur B (30,501 s : carte qui sort
  par le haut, escalier seul).
- **Boucle mesurée** : écart moyen **0,31 / 255** entre l'image 0 et 31,433 s (round 1 : 0,37), 99e centile 5 ; B :
  0,00 entre 0,001 et 30,84 s. Musique : **492 ms** entre le dernier temps de la reprise (31,00 s) et le premier temps
  du début (0,047 s), au lieu de 292 (`mix_report-mo13.txt`, ligne « boucle »).
- **« 3 100 € » géant** : coupe franche, le compteur disparaît à l'image où `big9` entre (`bigOn`, plus de fondu
  commun) ; 21,26 s : « 3 100 € » seul en haut, plus de compteur.
- **Inscriptions des arêtes** : écrites à `te + 0,1` au pas de 0,02 s, 56 px au lieu de 40 (`kit-mo13.js`,
  `STEP_LAB_FS`, ligne de base 74) ; lisibles à 20,6 s (« 2 000 → 2 950 ✓ ») et au recul de 21,23 s (les trois), à
  360 px.
- **Carte** : 820 px de large centrée sur 540 (bord ≈ 955 avec la perspective, textes ≤ 906) ; règle de la réserve
  34 px, « frais … ✓ » 30 px ; reflet à 40 % (0,08) ; fond « calc » `saturate(.3)` après le sépia (plus de tache
  verte) ; « 2 500 € » à 102 px et rangée élargie de 8 px pour garder ≈ 60 px entre « prix max » et le montant.
  Contrôlé à 28,9 s en pleine définition.
- **Mention** : celle du HUD reste jusqu'à `REW[1] + 0,3` (25,7 s), celle de la carte monte dès `T.card + 0,1`
  (25,5 s) : plus de trou de 25,1 à 26,3 s ; présente de 4,0 à ≈ 30,4 s.
- **Annonce de la tentation** : silhouette `#8a7f86 → #5d535b` avec liseré clair, visible à 17,5 et 18,15 s.
- **Vidéos** : « cles » multipliée par un brun chaud `#9a8070` à chaque image (fond beige au lieu de blanc, 10,6 et
  20,1 s). « pneu » regardée en grand (images 1, 30, 80, 135) : la forme floue de l'arrière-plan est un rétroviseur noir
  d'une voiture blanche, sans emblème ni texte. Rien à changer.
- **Son** (`scripts/audio-mo13.py`, relancé) : accents du « 3 100 € » et du « prix max » à −6 dB avant le limiteur ;
  ils ne sont plus dans les réductions les plus fortes (round 1 : −12,8 dB à 21,58 s et −12,4 dB à 28,02 s). Le bruit
  d'écriture de l'étiquette suit le prix (`prix0`) ; les six tics des palettes MARCHE 1 passent en priorité 2 (à
  `T.out + 0,3`, ils tombaient tous sous la règle de collision). Mix : −14,3 LUFS, true peak −3,8 dBTP avant AAC et
  −3,9 après AAC 256 k ; 2 premières secondes −15,0 LUFS ; arrêt de bande toujours à 0 image du « 3 100 € » (21,547 s) ;
  lignes de la carte sur les temps (+0 ms).
- **Contrôles de `qa_video.py` refaits à la main sur les images** (pas de MP4, consigne) : première image écart-type
  46,3 (A) et 48,0 (B) ; zones sûres (méthode du script, 21 images pleine définition) : aucun texte au repos dans une
  zone interdite, seul le virement 3 qui entre par la droite (20,1 s) ; image la plus sombre du repli (30,9 s) :
  lueur et calcul qui revient, pas une image vide.

**Planches refaites** (313 images, regardées par rangées) : rien de cassé ailleurs. Restent visibles, inchangés : la
carte vide de 25,4 à 25,9 s (elle se pose avant que « budget − réserve = prix max » s'écrive), le croisement du
virement 2 et de la Mégane qui part (15,0 s), une image sombre avec sa lueur à 30,9 s au creux du repli.

**Ce qui reste**
- **Carte vide 0,5 s** (25,4 → 25,9 s) : la faire entrer avec sa première ligne déjà en train de s'écrire
  (`hd1` à `T.card + 0,05`), à voir au round 2.
- **Limiteur** : il réduit encore jusqu'à −11,1 dB (20,91 s), −10,4 dB (0,06 s), −9,9 dB (6,70 s), −9,7 dB (16,79 s),
  et 23,4 % du film passe à plus de 3 dB. Ce ne sont plus les accents : les crêtes de 0,06 et 20,91 s sont des coups de
  la musique elle-même (−1,0 et −2,9 dBFS sur la piste), celles de 6,70 et 16,79 s des bruitages (débit assurance,
  annonce et sa vibration). À traiter en rééquilibrant le mix (musique −2 dB avant le compresseur, ou limiteur à
  deux étages), pas en baissant un son.
- **Le cas lent de la voix** (testé, pas retenu) : posée à 3,6 mots dits par seconde (≈ 21,4 s de parole, les
  créneaux du brief), la voix allonge le film à 32,05 s ; avec les deux coupes du brief, 31,25 s
  (`VO_DIR=… scripts/vo-mo13.py --provisoire --unite mots --debit 3.6 --pause-int 0 --coupes 2`, essai rendu dans le
  scratchpad sur 24 instants, sans erreur). Le film suit les mots, mais l'ouverture s'étire : « 1 400 » tombe à ≈ 5,9 s
  au lieu de 4,2 s, la contradiction se ferme bien après les 3 s, et les trois frais se serrent (« Assurance, carte
  grise, essence » en 1,1 s, débits à 0,3 s d'écart ; à 10,0 s, bulle, palettes et compteur se chevauchent). Les coupes
  du brief ne touchent pas l'ouverture : si la vraie prise est lente, couper dans h1 à h3 (ou ×1,2 sur l'ouverture
  seule) plutôt qu'après. Avec `TAIL` = 0,4 s, une prise lente atteint le plafond de 31,5 s 0,2 s plus tôt ; la
  jointure de boucle de la musique est à refaire sur la vraie prise (ligne « boucle » du rapport).
- **Marches 2 et 3 serrées** (14,49 → 16,1 s) : inchangé, voulu par le brief ; à 15,0 s, le virement 2 qui entre dans
  le compteur et la Mégane qui part par la gauche se croisent encore. Si la vraie prise allonge ce passage, décaler
  `T.arr3` de 0,25 s.
- **Écart de la contradiction** : l'image ne devance pas la voix (chaque geste suit son mot) ; avec le minutage
  provisoire, le prix s'écrit à 4,13 s. L'étiquette vierge à 3,0 s porte la question ; à juger sur la vraie prise.
- `qa_video.py` sur le premier MP4 (aucun rendu `--all` à ce round).

## Round 2 (9 octobre 2026, critique seule : le film n'a pas été modifié)

**Matériel regardé** (film dans l'état des corrections du round 1 : `film.js` de 17 h 54, aucun fichier d'entrée
plus récent)
- Planches toutes les 0,1 s refaites : `renders/review/mo13-planche-0.1s-0-10.jpg`, `-10-20.jpg`, `-20-31.45.jpg`
  (315 images, regardées par tranches de 1 à 2 s). Aucune erreur `PAGEERR` (planches, images fixes, téléphone).
- Test téléphone à 360 px : `renders/phone-mo13.png` (0 · 3,6 · 4,4 · 6,4 · 9,6 · 10,75 · 13,7 · 16,3 · 18,15 · 19,0 ·
  24,0 · 28,9 s).
- Images pleine définition, `renders/stills-mo13/` : ouverture A (0 · 1,0 · 2,2 · 3,1 · 3,6 · 4,4 · 4,9 · 5,05 · 5,6 ·
  6,4 · 8,9 · 9,6 · 10,75 · 12,2 · 13,1 · 13,7 · 14,0 · 14,75 · 14,9 · 15,9 · 16,3 · 18,15 · 19,0 · 19,6 · 20,3 · 21,3 ·
  22,0 · 23,9 · 25,6 · 28,9 · 30,85 · 31,433 s) ; ouverture B (`HOOK=B`, fichiers à la milliseconde : 0,002 · 1,502 ·
  3,002 · 4,202 · 30,602 s).
- Les 7 vidéos des notifications en grand (images 1, 20, 40 de `film-mo13/seq/`) : aucun visage (« cles » coupe sous
  le menton), aucune plaque ; sur la pompe, « 95 », « 98 », « Premium Diesel » sont des carburants, pas une marque ;
  « pneu » : rétroviseur flou.
- Son : `audio/mix-mo13.wav` remesuré (ebur128, AAC 256 k réencodé dans le scratchpad, spectre, RMS par passage) et
  `docs/mix_report-mo13.txt`. **Rien n'a été écouté.** Pas de MP4 (consigne) : contrôles de `qa_video.py` refaits à
  la main.
- Hook passé au mode diagnostic d'`art-du-hook` (texte et voix inchangés, l'image seule).

**Notes**

| Hook | Lisibilité 360 | Zones sûres | Mouvement | Variété / rythme | Marque | Voix (provisoire) | Son | Recette 47 / envie |
|---|---|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 7 | 8 | 8 | 8 | 7 | 8 |

Pas livrable en l'état (hook, mouvement, son < 8). Round 1 → 2 : lisibilité 7 → 8 ; le reste inchangé.

**Mesures**
- Zones sûres (méthode de `qa_video.py` sur les 37 images pleine définition) : aucun texte au repos dans une zone
  interdite. Touchés seulement par des cartes en mouvement : virement 2 qui entre (14,75 s, droite), bulle 2 qui sort
  (14,9 s, gauche), messages qui sortent (19,6 s), bulle 3 et virement 3 (20,3 s). Contenu net de y = 264 à 1 486 en
  récit (le bas du papier de l'étiquette, 3,6 à 4,4 s ; chiffres au-dessus de 1 480).
- Voitures (pixels saturés et clairs, y = 950 à 1 420) : 206 de 198 à 881 (6,4 s), Fiesta de 151 à 918 (18,15 s), de
  174 à 896 (20,6 s). Seule sortie : la Fiesta qui freine à 15,6 s, de 218 à **978** (feu arrière et roue dans la bande
  des boutons, ≈ 0,25 s, voiture seule). Corrigé du round 1, tenu.
- « 3 100 € » géant : encre de x = 178 à 904 à 22,0 s (726 px, ≤ 760). « 10 000. » plein de 23,5 à 24,4 s (planche),
  rien au travers : corrigé du round 1, tenu.
- Première image : écart-type 46,3 (A), 48,0 (B). Image la plus sombre : 30,85 s (écart-type 14,2, creux du repli).
  Boucle : écart moyen **0,31 / 255** entre l'image 0 et 31,433 s (99e centile 5).
- Plans figés (planches à 0,1 s) : aucune suite de plus de 0,6 s hors de la pause voulue (21,55 → 22,35 s) ; 23,8 →
  24,1 s presque immobile (0,3 s, « 10 000. » plein).
- Voix provisoire (`vo-timing.json`) : les 13 répliques partent exactement aux ancres du brief et finissent 0,1 à
  0,65 s plus tôt (17,8 s de parole contre 21,5 s de créneaux) ; 71 mots écrits, **2,26 mots par seconde de film**,
  3,99 par seconde de parole ; écart minimal 0,30 s, aucun chevauchement ; dernière réplique finie à 31,02 s, film de
  31,45 s. Cohérent avec le brief : note 8 (consigne). Rappel : la vraie prise de Simon (≈ 3,1 mots dits par seconde
  sur MO9) sera plus lente que ce minutage.
- Son (mesuré, pas écouté) : −14,3 LUFS, −3,8 dBTP sur le WAV, **−3,9 dBTP après AAC 256 k**, LRA 3,9 LU ; 32,8 % de
  l'énergie sous 150 Hz, 24,3 % entre 1 et 5 kHz ; 2 premières secondes −13,7 dBFS RMS contre −14,5 sur le reste ;
  pause 21,8 → 22,35 s à −28,3 dBFS RMS. Limiteur (rapport) : −11,1 dB à 20,91 s, **−10,4 dB à 0,06 s** (le premier
  temps du hook), 23,4 % du film à plus de 3 dB ; mesuré ici : **36,8 % des blocs de 10 ms ont leur crête à moins de
  0,5 dB du plafond** (−5 dBFS). Gain de normalisation +15,1 dB (la voix est muette, la musique porte seule les
  −14 LUFS). Le repli du calcul (4,80 s) tombe 249 ms avant le temps (5,047 s).

**Ce qui marche** : les trois corrections du round 1 tiennent sur les planches et en pleine définition : la chute se
lit (0,9 s pleine, plus rien au travers), les voitures restent dans la colonne, la 206 de l'image 0 a une ombre et
ne flotte plus au-dessus des lumières. Le repli de boucle est propre (carte qui file par le haut, escalier qui
descend, puis l'image 0), sans triple exposition. À 360 px, tout le récit se lit : compteur, palettes, étiquettes
barrées, virements, tickets (petits, lus au deuxième passage), « toi aussi », « une à la fois », « Toujours dispo ? »,
le « 3 100 € », la chute et la carte (règle de la réserve et « frais … ✓ » compris). Les trois inscriptions des marches
se lisent au recul (21,0 → 21,3 s). Ouverture B : « 1 500 € ↓ 3 100 € » et la mention dès l'image 0, lisible en
vignette. Une seule couleur d'accent, aucun logo, aucune plaque, aucun visage, aucun site d'annonces nommé.

### Les 3 problèmes les plus graves

**1. Hook : l'étiquette arrive vierge et cache « la petite rouge » ; la contradiction ne se lit qu'à 4,4 s.**
Diagnostic `art-du-hook` (image seule) : Temps ✅ (« Il te manque 8 500 € ? » à l'image 0), Sens ✅, Miroir ✅ ;
**Écart ❌ à l'image avant 3 s** : rien ne montre que la voiture d'en face coûte moins que ses 1 500 € avant
4,13 s (début de l'écriture de « 1 400 € »), prix complet vers 4,45 s. De 3,0 à 4,13 s, un papier blanc vierge de
≈ 330 px couvre l'avant de la 206 (phare, aile, roue) pendant que la voix dit « la petite rouge d'en face »
(`t03.100.png`, `t03.600.png`, `phone-mo13.png` à 3,6 s) : 1,1 s de rectangle vide au centre de l'écran. De 0 à
2,9 s, à 360 px, seules la lumière sur « 10 000 », la plume sur le « ? » (1,0 s) et « 1 500 » qui s'allume (1,9 s)
bougent, en petit. La 206, photo de jour par temps couvert, reste un détourage collé sur une rue de nuit (pas de
lumière orange sur sa carrosserie).
Correction (`film-mo13/film.js`, branche `if (!HB)` des temps, lignes 33-41 ; texte et voix inchangés, B intact) :
l'image devance la voix d'un temps, la voix confirme.
- `T.focus = M('b1500') + 0.15` (≈ 2,28 s, au lieu de `M('petite') - 0.2`) ; `T.tag = T.focus + 0.15` (≈ 2,43 s,
  inchangé en formule) ; `T.prix0 = T.tag + 0.12` (≈ 2,55 s, au lieu de `M('b1400') - 0.05`) : avec le ressort
  `{ f: 1.5, z: 1 }`, « 1 400 € » est écrit à 90 % vers 2,95 s, juste après « Tu en as mille cinq cents » : 1 400 sous
  1 500 se lit dans les 3 s, et l'étiquette n'est jamais vierge plus de 0,12 s.
- `T.mention = T.prix0 + 0.1` (la mention arrive avec le premier prix de l'exemple, au lieu de `M('demande') + 0.14`).
- Garder `T.contour = M('rouge') - 0.35` et `T.trem = M('b1400') + 0.1` (« 8 500 € ? » tremble sur « mille quatre ») ;
  ajouter sur « mille quatre » un rappel du prix : pulsation de l'étiquette, dans la boucle des voitures pour `i === 0`,
  `g.tag.style.transform = … scale(${f3(0.85 + 0.15 * tagIn + 0.06 * Math.exp(-6 * Math.max(0, stc - T.trem)) * (stc > T.trem ? 1 : 0))})`.
- Lumière de la rue sur la 206 (optionnel, même passe) : une copie de `im206` étalonnée au chargement (canvas,
  `multiply` `#b89a8a` à 0,35, puis reflet orange en `screen` sur le haut de la carrosserie), affichée à la place de
  `c.im` tant que `stc < T.out`, comme la copie floue `blurI` ; aucun `filter` CSS sur la voiture.
- Puis `CUT=mo13 node scripts/events.mjs` et `python3 scripts/audio-mo13.py` (le bruit d'écriture suit `prix0`, le
  souffle de mise au point suit `focus`).
- Vérifier : `CUT=mo13 node scripts/at.mjs 2.2,2.5,2.8,3.0,3.6,4.3 renders/review/mo13-at.jpg` (étiquette jamais
  vierge plus de 0,12 s, « 1 400 € » lisible à 3,0 s) et l'image 0 à 200 px ; B inchangé (`HOOK=B … --at 0.002,3.002`).

**2. La carte arrive vide (25,4 → 25,9 s) et la mention s'affiche deux fois.** Après le rembobinage, la plaque de verre
de 820 × 846 px entre à `T.card` (25,405 s) et reste vide jusqu'au premier glyphe de « budget − réserve = » à
`T.card + 0.15` (≈ 25,56 s), titre complet vers 25,9 s : sur `t25.600.png` et les planches 25,5 → 25,7 s, un grand
rectangle de verre et son reflet, rien d'autre, sur « calcul à chaque vente », au moment de la valeur à enregistrer.
Sur la même image, « Exemple · prix moyens constatés » est écrit deux fois (celle du HUD à y ≈ 478, celle de la carte en
bas) de 25,5 à 25,7 s. Correction (`film-mo13/film.js`, bloc « le calcul refait : la carte ») :
- `K.writeWord(hd1, t, T.card + 0.02, 0.02, 16)` ; `K.writeWord(hd2, t, T.card + 0.38, 0.04, 16)` ;
  `sub` : `S(t, T.card + 0.5, P.rise)` ; `rules[0]` : `T.card + 0.42` au lieu de `T.card + 0.6`. Les lignes de calcul
  (`T.l1` = 26,0 s, sur le temps) ne bougent pas.
- Mention unique : `mOut = t < LOOP ? sm(REW[1] - 0.05, REW[1] + 0.05, t) : …` (celle du HUD part quand la carte
  entre) et `dM` à `S(t, T.card + 0.05, P.rise)`.
- Vérifier : `CUT=mo13 node scripts/at.mjs 25.45,25.6,25.75,25.9,26.1 renders/review/mo13-at.jpg` : du texte sur la
  carte dès 25,45 s, une seule mention à chaque image.

**3. Son : la musique est écrasée par le limiteur, jusque sur le premier temps du hook.** Sans voix, la normalisation
pousse musique et bruitages de +15,1 dB jusqu'à −14 LUFS : 36,8 % des blocs de 10 ms touchent le plafond (−5 dBFS),
−10,4 dB de réduction à 0,06 s (le coup d'ouverture, entendu dès l'image 0), −11,1 dB à 20,91 s (la montée vers
« 3 100 »), 23,4 % du film à plus de 3 dB. Les crêtes viennent de la piste elle-même (−1,0 et −2,9 dBFS à 0,06 et
20,91 s) et de deux bruitages (débit assurance 6,70 s, annonce et sa vibration 16,79 s) : un limiteur seul qui
travaille à 10 dB pompe (relâche de 80 ms). Avec la vraie voix le gain baissera, mais pas le facteur de crête de la
musique. Correction (`scripts/audio-mo13.py`, « somme, compression douce, loudness ») :
- compresser la musique seule avant la somme : `mus_st = comp(mus_st, thr=-22, ratio=2.5)` (déplacer `def comp` au-
  dessus de `mus_st = np.stack(...)`), puis `mix = vo_st + mus_st + fx` ;
- débit assurance (`note_debit` de la marche 1, `k == 0`) et vibration de l'annonce (`put(buzz(0.25) * db(-17), E_['ann'], 0.3)`)
  à −3 dB ;
- plafond du limiteur −5 → −4,2 dBFS dans la boucle de normalisation (la correction finale à −3,5 dBTP reste) ;
- cible, lue dans `docs/mix_report-mo13.txt` : réduction maximale ≤ 6 dB, moins de 10 % du film à plus de 3 dB,
  −14 ± 0,3 LUFS, ≤ −3,5 dBTP après AAC ; arrêt de bande toujours à 0 image du « 3 100 € » ; écouter les 2 premières
  secondes et 20,5 → 21,6 s.

### Les autres
- **Construction du compteur (4,85 → 5,25 s)** : les cases se dessinent trait par trait (`P.draw`, `T.hud = T.out + 0.05`)
  pendant que « 1 500 » vole encore : à 4,9 s un trait seul en haut à gauche (le bord de la 1re case, x ≈ 272, y = 300),
  à 5,05 s des équerres beiges à gauche de « 1500 » (`t04.900.png`, `t05.050.png`). `T.hud = T.out + 0.22` : les
  cases se tracent quand les chiffres arrivent.
- **Le tampon « toi aussi » tombe avant le creux** : il claque à `T.toi` (8,95 s) quand le compteur affiche encore
  108 €, et le compteur n'atteint 50 € que vers 9,45 s. La blague (« elle était sur la réserve · toi aussi ») vise les
  50 € : `S(st, T.toi + 0.45, P.stamp)` et le même décalage dans `window.EVENTS.tampons` (le rouleau reste à `T.toi`).
- **Les virements traversent les palettes** en montant dans le compteur (11,0 · 14,9 · 20,4 s) : « Virement reçu
  +2 450,00 € » imprimé sur « SEMAINE 7 » pendant ≈ 0,15 s (`t14.900.png`). Faire disparaître la carte plus tôt dans sa
  montée : `set(v.w, … * (1 - sm(0.15, 0.4, lb)))` au lieu de `sm(0.35, 0.8, lb)`.
- **Montants qui filent** : « − 1 200 € » passe sur « MARCHE 1 » (5,6 s), « − 1 550 € » sur la mention (13,1 s) ;
  départ du montant sous les palettes (`sy0` 372 → 640) ou montant masqué tant qu'il croise y = 450 → 630.
- **Marche 2** : l'inscription « 1 550 → 2 450 ✓ » s'écrit (`T.edge2 + 0.1`) pendant que la caméra monte
  (`T.rise2 = T.vir2 + 0.29`) : jamais lue dans le récit, seulement au recul. Accepté (les trois se lisent à 21,0 s).
- **La Fiesta qui freine** sort jusqu'à x = 978 à 15,6 s : visée `T.rise2` de la caméra 591 → 600 si on veut l'éviter.
- **Le repli de boucle** passe par une image presque noire (30,8 → 30,95 s, écart-type 14) avec les fantômes des
  inscriptions (« Ta 4e », « 1 550 → 2 450 ») : avancer d'un dixième le retour de la rue (`back` à `CLR - 0.1`).
- **Le grand moment hors temps** : le repli du calcul (4,80 s) tombe 249 ms avant le temps 5,047 s (`video/CLAUDE.md` :
  grands moments sur les temps). Dépend de la vraie prise (`T.out = ME('b1400') + 0.3`) : à recaler sur elle.
- **Gag à 360 px** : « Essence · elle était sur la réserve » fait ≈ 10 px de haut (titre de notification à 34 px) ;
  lisible, juste. Si on veut qu'il se lise au premier passage : titre sur deux lignes à 40 px pour la seule carte du
  gag (« Essence » / « elle était sur la réserve »).
- **Le compteur passe par « 1 500 € »** à 15,9 s en roulant de 2 500 à 500 (une image où les quatre rouleaux sont
  alignés) ; à surveiller sur le MP4, rien à faire si ça ne se voit pas à 60 i/s.

**FAIL de `qa_video.py`** : aucun mesurable sans MP4 (première image, images vides, plans figés, loudness, true peak
après AAC, son des 2 premières secondes et équilibre téléphone contrôlés à la main : tous dans les seuils). WARN
attendu sur le MP4 : zones sûres pour les cartes qui entrent et sortent (14,75 · 14,9 · 19,6 · 20,3 s), pas des
textes au repos.

### Corrections du round 2 (9 octobre 2026, après la critique)

Fichiers touchés : `film-mo13/film.js`, `film-mo13/kit-mo13.js` (compteur et palettes), `scripts/audio-mo13.py`, puis
`film-mo13/events.json` (relancé, seuls `focus`, `tag`, `prix0`, `mention`, `hud` et `tampons` bougent),
`audio/mix-mo13.wav`, `audio/stems-mo13/`, `docs/mix_report-mo13.txt` (relancés). Minutage provisoire et
`vo-mo13.py` inchangés, aucun appel ElevenLabs, rien de partagé modifié (`lib/kit47.js`, `film-mo9/`, `film-mo10/`,
outils de `scripts/`).

Vérifié sur des images rendues et regardées : `renders/review/mo13-at.jpg` (0 · 2,2 · 2,5 · 2,8 · 3,0 · 3,6 · 4,3 ·
4,9 · 5,05 · 5,3 s), `mo13-at2.jpg` (carte, tampon, virements, montants, repli), `mo13-at3.jpg` (virements après le
changement de calque, 10,75 → 11,0 · 14,7 → 14,85 · 20,25 · 20,3 s), `mo13-repli.jpg` (30,7 → 30,95 s, pleine
définition), `renders/phone-mo13.png` (17 instants à 360 px), `renders/stills-mo13/` (A, flou de bougé MB = 4 : 0 ·
2,2 · 2,5 · 2,8 · 3,0 · 3,6 · 4,3 · 4,9 · 5,05 · 5,3 · 9,5 · 10,9 · 11,0 · 14,85 · 25,45 → 26,1 · 30,5 → 30,95 ·
31,433 s ; B : 0,002 · 3,002 · 4,952 · 5,302 · 5,502 s) et les trois planches à 0,1 s refaites (`mo13-planche-0.1s-0-10.jpg`,
`-10-20.jpg`, `-20-31.45.jpg` ; la dernière tirée avant le changement de calque des virements, vérifié à part).
Aucune erreur `PAGEERR`.

**Les 3 problèmes les plus graves : corrigés.**
1. **Hook : l'image devance la voix d'un temps.** `T.focus = M('b1500') + 0,15` (2,28 s), `T.tag = T.focus + 0,15`
   (2,43 s), `T.prix0 = T.tag + 0,12` (2,55 s), `T.mention = T.prix0 + 0,1` (2,65 s) ; `T.contour` (3,02 s) et
   `T.trem` (4,28 s) gardés. Sur « mille quatre », l'étiquette bat (+6 %, montée en 0,05 s, retombée en exp(−6 t))
   pendant que « 8 500 € ? » tremble. Planche : étiquette vierge à 2,5 s seulement (0,12 s), « 14 » à 2,7 s,
   « 1 400 » à 2,8 s, **« 1 400 € » complet à 2,9 s** ; à 360 px, « 1 400 € » se lit à 3,0 s (`phone-mo13.png`).
   La 206 de la rue est étalonnée « soir » au chargement (pixel par pixel, alpha du détourage intact : multiplication
   par `#b89a8a` à 35 %, reflet orange des lampadaires en « screen » de 22 % en haut à 0 aux trois quarts), copie nette
   et copie floue ; elle reprend sa couleur de jour en montant sur le verre (`T.out + 0,05 → + 0,5`, copie de jour
   posée sur la copie « soir »). Aucun `filter` CSS. L'effet est discret (plus chaude, moins crue), pas une
   relumière. Diagnostic `art-du-hook` (image seule, texte et voix inchangés) : Temps, Sens et Miroir ouverts à
   l'image 0 ; **l'écart se ferme à l'image vers 2,95 s** (« 1 400 € » écrit sous les 1 500 qui viennent de
   s'allumer), la voix le confirme à 4,18 s ; la boucle « et ensuite ? » reste ouverte (l'escalier). Image 0 :
   écart-type 45,8 (46,3 avant). B intact (`HB` non touché) : « 1 500 € ↓ 3 100 € » et la mention à 0,002 s,
   écart-type 47,9.
2. **La carte entre écrite, une seule mention.** `hd1` à `T.card + 0,02` au pas de 0,02 s, `hd2` à `T.card + 0,38`,
   `sub` à `T.card + 0,5`, `rules[0]` à `T.card + 0,42` ; `T.l1` (26,0 s, sur le temps) inchangé. Mention du HUD
   éteinte de `REW[1] − 0,05` à `REW[1] + 0,05`, celle de la carte monte à `T.card + 0,05` : relais sans doublon.
   Images : 25,45 s carte en mouvement, encore vide (0,045 s après `T.card`) ; 25,6 s « budget − » se trace ;
   25,75 s « budget − réserve = » ; 25,9 s « … = pri » ; 26,1 s titre et règle de la réserve complets. Une mention
   à chaque image (celle de la carte, en bas).
3. **Son : la musique n'est plus écrasée par le limiteur.** `scripts/audio-mo13.py`, « somme, compression douce,
   loudness » :
   - la compression prescrite (`comp(mus_st, thr=−22, ratio=2,5)` avant la somme) seule ne suffisait pas
     (−8,7 dB max, 14,3 % du film à plus de 3 dB, −14,6 LUFS) : moyennée sur 10 ms, elle laissait passer les coups de
     la batterie (+4,5 dB au-dessus du plafond après le gain). Ajouté : un second étage à détecteur de crête sur la
     musique seule (seuil −20, 4:1, attaque 3 ms, relâche 150 ms) ;
   - les deux détecteurs de la musique lisent le signal divisé par la courbe d'élan : sans cela, la chute retombait
     au niveau du calcul (RMS −17,3 contre −17,1). Avec : marche 1 → chute +3,9 dB (4,6 avant), chute 0,6 dB au-dessus
     du calcul (1,2 avant) ;
   - même étage, rapide, sur le bus des bruitages (seuil −17, 3:1, 1/80 ms) : le pop des bulles, les débits et les
     virements (rôles ui et chime) arrivaient à +4 dB après le gain et faisaient réduire le limiteur de 8 à 9 dB ;
   - débit assurance et vibration de l'annonce à −3 dB (prescrits) ; moteur de la Fiesta qui part à −3 dB (son pic,
     20,9 s, tombait sur le coup de la musique à la chute, la plus forte crête restante, −6,7 dB) ;
   - limiteur de la boucle de normalisation à −4,2 **dBTP** (détecteur de crête vraie, suréchantillonné 4×) : avec
     −4,2 dBFS en échantillons, les crêtes inter-échantillons imposaient après la boucle une correction de 0,7 dB qui
     ramenait le mix à −14,7 LUFS. La correction finale à −3,5 dBTP reste, en sécurité ;
   - la mesure de l'arrêt de bande applique à la référence sans arrêt le même gain de compression (sinon elle
     indiquait −30 images).
   Mesuré (`mix_report-mo13.txt`) : **réduction max −5,7 dB** (28,01 s ; −11,1 avant), **8,7 % du film à plus de
   3 dB** (23,4 %), 9,8 % des blocs de 10 ms à moins de 0,5 dB du plafond (36,8 %) ; **−14,1 LUFS, −4,0 dBTP après
   AAC 256 k** ; arrêt de bande à **0 image** du « 3 100 € » ; lignes de la carte sur les temps (+0 ms) ; 30 % de
   l'énergie sous 150 Hz (32 %). Limiteur sur 0–2 s : −2,4 dB au plus (−10,4 avant), sur 20,5–21,6 s : −5,5 dB.
   Le premier coup du hook est désormais rasé par l'étage de crête de la musique (−8,9 dB à 0,07 s, attaque 3 ms)
   au lieu du limiteur commun : 0–0,1 s −17,6 dBFS RMS (−17,7 avant), 2 premières secondes −15,4 LUFS contre −14,0
   sur le reste (−15,0 / −14,2 avant). **Rien n'a été écouté** : 0–2 s et 20,5–21,6 s restent à écouter.

**Les autres points**
- **Construction du compteur : corrigé.** `T.hud = T.out + 0,22` ; les chiffres ne dépendent plus du verre
  (`kit-mo13.js`, `paintPlateCounter` : `digit` et `euro` facultatifs, verre par défaut) : ils prennent le relais de
  « 1 500 » qui vole (`swap`), le verre se forme derrière. Au round 2, à 5,3 s, « 15 » plein et « 00 » pâles :
  maintenant « 1500 » plein dans ses cases. La construction ne se défait plus au rembobinage (temps du récit borné à
  `T.hud + 1,2`). À 4,9 s plus rien en haut à gauche ; à 5,05 s le premier trait commence quand « 1 500 » arrive.
  En passant : la plaque vide des palettes (pastille à 8 % sous « 1 500 », 4,8 → 5,1 s) ne s'allume plus.
- **Tampon « toi aussi » : corrigé.** `T.toiS = T.toi + 0,45` (9,40 s) pour le tampon, `window.EVENTS.tampons` et le
  flou de bougé ; le rouleau reste à `T.toi`, le son suit `tampons[0]`. Planche : rien à 8,95 et 9,3 s (108 puis
  62 €), le tampon claque à 9,4–9,5 s quand le compteur touche 50 €. Contrepartie : il reste ≈ 0,35 s immobile
  (9,45 → 9,8 s) avant que la carte du gag parte à gauche, contre ≈ 0,7 s.
- **Virements qui montent : corrigé autrement que prescrit.** `sm(0,15 ; 0,4)` laissait « +1 900,00 € » à 25 % sur
  « SEMAINE 3 » à 11,0 s : au repos, la carte n'est qu'à 24 px sous la plaque des palettes et la touche dès
  `lb ≈ 0,06`. Dès qu'il monte, le virement passe dans un calque sous le HUD (`LV`), avec la bulle de l'acheteur qui
  sort au même moment (elle reste dessous, comme avant) : il glisse sous le verre dépoli des palettes, flouté, et
  s'éteint en chemin (`sm(0,1 ; 0,35, lb)`). Le calque se déduit de `lb` à chaque image (aucun état). Vérifié à
  10,75 → 11,0, 14,7 → 14,85 et 20,25 → 20,3 s : plus aucun texte net sur les lettres.
- **Montants qui filent : corrigé.** Départ à y = 680 sous la plaque des palettes (prescrit 640 : à 640, le montant
  touchait encore le bord bas de « MARCHE 1 » à 5,5 s, sur l'ouverture B). 5,55 · 13,1 · 15,75 s : sous les palettes,
  loin de la mention.
- **Repli de boucle : corrigé.** La rue revient à `CLX = CLR − 0,09 × FO` (30,80 s ; B : 30,505 s), en ease-out
  (départ franc, pente nulle à `DUR − 0,06` : l'image 0 revient exacte) ; les inscriptions de l'escalier s'éteignent
  en premier (30,41 → 30,68 s). Un premier essai (escalier éteint lui aussi à `CLX`) creusait le noir : 30,75 s à un
  écart-type de 3,2, une image vide pour `qa_video.py` ; l'escalier reste donc jusqu'à `CLR`. Mesuré en pleine
  définition : 30,7 s 12,6 · 30,75 s 8,8 · 30,8 s 9,5 · 30,85 s 17,7 · 30,9 s 24,5 · 30,95 s 28,5 (round 2 : 14,2 au
  plus bas, avec les fantômes). Plus de fantômes. **Boucle : écart moyen 0,31 / 255** entre l'image 0 et 31,433 s,
  99e centile 5 (inchangé).
- **La Fiesta qui freine (x = 978 à 15,6 s) : pas fait.** Viser 600 au lieu de 591 ne la ramène qu'à ≈ 969 (toujours
  dans la bande des 140 px) et pousse la Fiesta posée à x ≈ 137. C'est une voiture qui entre par la droite, sans
  texte, pendant ≈ 0,25 s.
- **Gag sur deux lignes : pas fait.** La carte de notification fait 184 px de haut : un titre de deux lignes à 40 px
  ne tient pas sans la refaire. Lisible à 360 px tel quel.
- **Repli du calcul sur le temps (4,80 s, −249 ms) : à faire sur la vraie prise** (`T.out = ME('b1400') + 0,3`).
- **Compteur aligné sur « 1 500 € » à 15,9 s** : visible sur la planche (une image) ; à juger sur le MP4.

**Ce qui reste**
- Écouter 0–2 s et 20,5–21,6 s (le premier coup rasé de 8,9 dB par l'étage de crête de la musique, la chute) ; si
  l'attaque manque, monter le seuil de l'étage de crête (`MUS_THR=-19 python3 scripts/audio-mo13.py`) et accepter un peu plus de
  limiteur.
- Avec la vraie voix, le gain de normalisation baissera : refaire le rapport (le ducking s'activera) et vérifier que
  les deux étages ne compriment pas pour rien.
- Recaler sur la vraie prise : `T.out` sur le temps, et la place du tampon (≈ 0,35 s de lecture).
- `qa_video.py` sur le premier MP4 (aucun rendu `--all` à ce round). WARN attendus sur les zones sûres pour les
  cartes qui sortent à gauche (10,9 · 14,85 s) et la Fiesta qui entre (15,6 s), pas des textes au repos.

## Round 3 (10 octobre 2026, critique seule : le film n'a pas été modifié)

**Matériel regardé** (film dans l'état des corrections du round 2 : `film.js` de 19 h 37, `mix-mo13.wav` de 19 h 14)
- Montage 540p avec le son, `renders/draft-mo13-9x16.mp4` (10 octobre, 00 h 58, plus récent que `film.js`, le mix et
  `vo-timing.json`) : 31,45 s, 1 887 images, H.264 yuv420p 60 i/s, AAC 48 kHz. Réutilisé, pas refait.
- `qa_video.py` sur ce MP4 (`--intentional 21.5-22.4`) : `renders/qa-mo13/draft-mo13-9x16-qa.md` et `-safe.png`.
- Planches toutes les 0,1 s refaites : `renders/review/mo13-planche-0.1s-0-10.jpg`, `-10-20.jpg`, `-20-31.45.jpg`
  (315 images, regardées par tranches de 2 s), plus une planche à 0,1 s tirée du MP4 encodé et des bandes à 30 et
  60 i/s autour de chaque arrivée de carte, des tampons, de la butée, du « 3 100 € », de « prix max » et du raccord
  25,25 → 25,55 s.
- Test téléphone à 360 px : `renders/phone-mo13.png` (0 · 2,95 · 6,4 · 9,6 · 10,8 · 13,7 · 16,3 · 18,1 · 19,1 ·
  21,15 · 23,9 · 28,9 s).
- Images pleine définition, `renders/stills-mo13/` : A (0 · 2,95 · 5,15 · 5,2 · 8,6 · 11,5 · 12,0 · 14,0 · 15,6 ·
  16,75 · 17,0 · 18,05 · 21,2 · 22,0 · 23,9 · 25,5 · 26,1 · 27,6 · 28,9 · 30,75 · 31,433 s) ; B (`HOOK=B` : 0,001 ·
  1,501 · 3,001 · 4,201 s). Aucune erreur `PAGEERR` ni `CONSOLE`.
- Son : attaques mesurées dans `audio/stems-mo13/bruitages.wav` (crêtes par 10 ms) et comparées image par image au
  geste dans le MP4. **Rien n'a été écouté.**
- Hook passé au mode diagnostic d'`art-du-hook` (image seule, texte et voix inchangés).

**Notes**

| Hook | Lisibilité 360 | Zones sûres | Mouvement | Variété / rythme | Marque | Voix (provisoire) | Son | Recette 47 / envie |
|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 8 | 8 | 8 | 7 | 8 |

Pas livrable en l'état (mouvement et son < 8). Round 2 → 3 : hook 7 → 8 ; le reste inchangé.

**Mesures**
- `qa_video.py` : **aucun FAIL**. Première image écart-type 45,7 ; aucune image vide ; aucun plan figé de plus de
  0,9 s ; −14,1 LUFS, −4,0 dBTP sur le MP4 ; 2 premières secondes −15,3 LUFS contre −14,3 ; 15 % de l'énergie sous
  150 Hz, 33,3 % entre 1 et 5 kHz. Un WARN, zones sûres : sur la planche, seulement des objets en mouvement (Mégane
  et Fiesta qui entrent par la droite, cartes, bulles et messages qui entrent ou sortent, silhouettes du rembobinage)
  et le décor de l'escalier dans la bande du bas, sans texte. Aucun texte au repos dans le rouge.
- Voitures (pleine définition) : Fiesta qui freine à 15,6 s de x = 218 à **981** (limite 980, 0,25 s, sans texte),
  posée à 18,05 s de 150 à 920 ; la 206 qui part à 12,0 s touche le bord gauche (mouvement de sortie).
- Boucle sur le MP4 : 1,05 / 255 d'écart entre 31,433 s et l'image 0, approche progressive. Image la plus sombre
  du repli : 30,75 s (écart-type 8,6), pas une image vide.
- Voix provisoire : 13 répliques, 71 mots écrits (77 dits, nombres en lettres), écarts de 0,30 à 2,77 s, aucun
  chevauchement, dernière réplique finie à 31,02 s pour un film de 31,45 s (0,53 s avant la reprise de « Dix
  mille »). Cohérent avec le brief : note 8 (consigne).
- **Synchro des cartes** : une carte de notification part de x = 1 300 (`150 + 1150 × (1 − a)`,
  `a = S(st, t0, P.card)`, f = 2,2, z = 0,78). Elle entre dans le cadre à t0 + 0,055 s, est à mi-course à + 0,108 s et
  se pose (85 %) à + 0,19 s. Sur le MP4 : débit 1 bord visible à 6,773, posé à 6,87 ; virement 1 à 10,60 et 10,70 ;
  ticket 2 à 13,42 et 13,52 ; virement 2 à 14,57 et 14,67 ; ticket 3 à 15,96 et 16,06 ; virement 3 à 20,08 et 20,18 s.
  Le souffle d'arrivée culmine à t0 − 0,03 s, quand la carte n'existe pas encore ; la note (débit, −4 dBFS de crête à
  6,70 s) et le carillon (virement, 10,54 s) sonnent à t0 : **≈ 11 images avant la pose**.
- Autres synchros (crête du son → geste) : tampon « toi aussi » 9,39 s, posé à + 1-2 images ; tampon « une à la
  fois » 18,00 s, idem ; butée de l'annonce 17,50 s, cellule allumée à + 1 image ; arrêt de bande 21,54 s sur le
  « 3 100 € » (0 image) ; « prix max 2 500 € » 27,92 s, visible à + 1 image et lisible à + 3.
- Hook (diagnostic `art-du-hook`, image seule) : Temps ✅ (« Il te manque 8 500 € ? » et la 206 à l'image 0), Sens ✅,
  Miroir ✅ (« tu », son calcul), Écart ✅ et fermé à l'image à 2,9 s (« 1 400 € » sous les 1 500). Ouverture B :
  « 1 500 € ↓ 3 100 € » et la mention dès 0,001 s, mise au point à 3,0 s, étiquette à 4,2 s.

**Ce qui marche** : le hook tient ses 3 s sur A et sur B. À 360 px, tout le récit se lit : compteur, palettes,
étiquettes barrées, gag et « toi aussi », virements, annonce et « une à la fois », « Toujours dispo ? »,
inscriptions des marches au recul, chute, carte (« frais … ✓ » petits mais lus). La chute est pleine de 23,5 à
24,35 s, rien au travers. Le rembobinage repasse chaque état du compte. La carte se remplit sur les temps et reste
immobile de 28,3 à 30,35 s. Le repli de boucle n'a plus de triple exposition. Une seule couleur d'accent, aucun logo,
plaques vierges, aucun visage, aucun site nommé.

### Les 3 problèmes les plus graves

**1. Son : les neuf arrivées de cartes sonnent ≈ 0,19 s avant que la carte se pose.** C'est la colonne vertébrale
de la montée : trois débits dont le gag, trois virements, deux tickets et l'annonce. Les bruitages sont posés sur
`events.json` (t0 = départ de la carte, hors cadre), pas sur le geste vu. Correction, `scripts/audio-mo13.py` :
- en tête des sons : `ARR, MID = 0.19, 0.10` (85 % et 50 % de `P.card` ; commentaire : la carte part de x = 1 300) ;
- `note_debit` (l. 249-250) : souffle `cue(x + MID, 1490, 'whoosh', …, peak=True)`, note `cue(x + ARR, 2354, 'ui', …)` ;
- `virement` (l. 255-257) : souffle `x + MID`, carillon `x + ARR`, note `x + ARR + 0.02` ;
- gag (l. 287-288) : souffle `E_['gag'] + MID`, pompe `E_['gag'] + ARR` ;
- tickets (l. 304-305) : les deux sons à `x + ARR` ;
- annonce (l. 309) : `bulle(E_['ann'] + ARR - 0.03, …)` (le pop tombe à la pose) ;
- le tic « le compte roule » des débits (`x + 0.25`) tomberait à 0,06 s de la note et serait retiré par la règle de
  collision : décaler le roulement et son tic ensemble. Dans `film-mo13/film.js` l. 245, passer `T.d1 + 0.25`,
  `T.d2 + 0.25` à `+ 0.32` et `T.tk2 + 0.12`, `T.tk3 + 0.12` à `+ 0.3` (aujourd'hui, l'argent du ticket quitte le
  compte avant que le ticket arrive) ; dans `audio-mo13.py`, `cue(x + 0.32, 1054, 'tick', …)`.
  Effet de bord : le son « prix payé écrit ✓ (2) » (13,34 s), retiré aujourd'hui par collision avec le ticket 2,
  revient ; « prix payé ✓ (3) » (16,05 s) part à son tour (ticket 3 posé à 16,07 s), ce qui est acceptable.
- Puis `CUT=mo13 node scripts/events.mjs`, `python3 scripts/audio-mo13.py`. Vérifier, à 60 i/s sur le MP4, que la
  crête de chaque note tombe à ± 1 image de la pose : 6,89 · 7,85 · 8,64 · 10,71 · 13,53 · 14,68 · 16,07 · 16,94 ·
  20,19 s.

**2. Le raccord du rembobinage vers la carte est un fondu enchaîné à trois couches (25,33 → 25,50 s).** Le compteur
« 1 500 € », « MARCHE 1 » (`hudOn`, l. 608 : `1 − sm(REW[1] − 0.3, REW[1] + 0.1)`), la silhouette de la 206 et son
« 1 400 € » (`gone`, l. 473 : `1 − sm(REW[1] − 0.3, REW[1] + 0.2)`) ne sortent que par l'opacité. Pendant ce
temps, les marches s'allument en montant et la carte entre à `T.card = REW[1]`. De 25,383 à 25,45 s, on les voit
toutes à 30-50 %, l'une sur l'autre (bande à 30 i/s, planche à 25,4 s). C'est le défaut corrigé au repli de boucle
au round 1, et `video/CLAUDE.md` l'interdit (« crossfades entre scènes », « une simple opacité ne doit jamais être
l'unique animation de sortie »). Correction, `film-mo13/film.js` :
- `const hx = t >= REW[1] - 0.2 && t < LOOP ? S(t, REW[1] - 0.2, { f: 2.6, z: 1 }) : 0;` (le compte a fini de
  rouler jusqu'à 1 500 vers 25,2 s) ;
- HUD : `hudOn = … * (1 − sm(0.35, 0.85, hx))` à la place du `sm` actuel, et `translateY(${f3(-220 * hx)}px)`
  ajouté à `LH.style.transform` (le compteur file par le haut, comme la carte au repli) ;
- voitures : `gone = 1 − sm(0.35, 0.85, hx)`, et la silhouette descend avec la marche 1 (`y + 260 * hx`) ;
- carte : `T.card = REW[1] + 0.06`, quand le HUD est sorti (`hx` ≈ 0,88). `T.l1` (26,0 s) ne bouge pas.
- Vérifier : `CUT=mo13 node scripts/at.mjs 25.2,25.3,25.35,25.4,25.45,25.5,25.6 renders/review/mo13-at.jpg` : au
  plus deux calques à chaque image, et aucun texte à moitié transparent qui reste en place.

**3. Deux relais laissent du texte sur du texte : « 1 500 » en double (5,16 → 5,30 s) et les débits sur « MARCHE 1 »
et le compteur (8,55 → 8,70 s).**
- Le « 1 500 » qui monte (l. 588 : `S(t, T.out, { f: 1.25, z: 1 })`) n'a fait que 77 % de sa course quand le relais
  commence (`swap = sm(T.out + 0.36, T.out + 0.5)`), et 90 % à la fin. Les chiffres du compteur apparaissent ≈ 90 px à
  gauche du « 1 500 » qui vole (`t05.200.png`, MP4 à 5,183 et 5,25 s). Correction : `{ f: 2.0, z: 1 }` (97,7 % à
  + 0,45 s, 98,9 % à + 0,52 s) et `swap = sm(T.out + 0.45, T.out + 0.52, t)` : moins de 5 px d'écart pendant le
  relais, fini à 5,32 s, avant que le compte roule (5,50 s).
- Les deux débits qui montent dans le compteur (l. 641-650 : `away = S(st, T.gag − 0.08, P.push)`, opacité
  `1 − sm(0.25, 0.7, up)`, calque `LN` au-dessus du HUD) s'impriment sur « MARCHE 1 », la mention et « 108 € » :
  « Carte grise · 4 CV · − 152,00 € » et « − 40,00 € » à 8,6 s (`t08.600.png`). Correction : le traitement des
  virements au round 2. Dans la boucle `D.forEach`, ajouter
  `{ const tgt = up > 0.002 ? LV : LN; if (d.w.parentNode !== tgt) tgt.insertBefore(d.w, tgt === LN ? tk[0].w : null); }`,
  avec l'opacité `(1 − sm(0.1, 0.35, up))`.
- Vérifier : `CUT=mo13 node scripts/at.mjs 5.1,5.15,5.2,5.25,5.3,8.5,8.55,8.6,8.65,8.7 renders/review/mo13-at.jpg`.

### Les autres
- **Hook, 3,0 → 4,8 s** : l'image est figée 1,8 s. Le contour est posé à 3,02 s, et le tremblement de « 8 500 € ? »
  (4,28 s) ne se voit pas à 360 px. Pendant ce temps, la voix dit « La petite rouge d'en face demande mille quatre »,
  que l'image a déjà montré à 2,9 s. Correction, sans toucher au texte ni à la voix :
  - une poussée de caméra lente sur la rue et la 206, de `T.contour` à `T.out` (échelle 1,00 → 1,05, ressort
    `{ f: 0.5, z: 1 }`) ; le brief prévoyait 1,00 → 1,04 à la mise au point ;
  - battement de l'étiquette sur « mille quatre » : + 6 % → + 10 % ;
  - tremblement de « 8 500 € ? » : ± 6 → ± 14 px.
- **Ticket 2 sur la bulle de SEMAINE 7 (14,0 → 14,13 s)** : le ticket qui sort à gauche (`S(st, T.sem7 − 0.1, P.push)`)
  passe sur « 2 450 et je la prends. » qui monte. Faire partir le ticket à `T.sem7 − 0.25`.
- **Mention** « Exemple · prix moyens constatés » : 24 px à 55 % d'opacité (l. 255), illisible à 360 px (MO9 :
  26 px). Passer à 28 px et 0,7. La mention de la carte (22 px à 0,5, l. 322) suit.
- **Carte** : verre presque vide de 25,45 à 25,6 s (« bu » à 25,5 s), titre complet à 26,1 s. Acceptable ; garder
  `hd1` à `T.card + 0.02` si `T.card` bouge (point 2).
- **« prix max 2 500 € »** : le son attaque 2 à 3 images avant que les chiffres se lisent :
  `cue(E_['claque'] + 0.03, 2909, …)` et sa note à `+ 0.05`.
- **Compteur aligné sur « 1 500 € » à 15,9 s** (le chiffre des milliers passe par 1 entre 2 500 et 500) : une image
  de la planche, quelques images à 60 i/s. Laissé.
- **Fiesta qui freine** à x = 981 (15,6 s) : laissé (voiture seule en mouvement, sans texte).
- **Son** : écouter 0–2 s, la montée de 6,6 à 16,5 s (après la correction 1) et 20,5–21,6 s ; refaire le rapport de
  mix sur la vraie voix (ducking).

**FAIL de `qa_video.py`** : aucun. WARN zones sûres : seulement des objets en mouvement et le décor de l'escalier,
aucun texte au repos dans le rouge.

### Corrections du round 3 (10 octobre 2026, après la critique)

Fichiers touchés : `film-mo13/film.js`, `scripts/audio-mo13.py`, puis `film-mo13/events.json` (relancé : seuls `card`,
25,405 → 25,465 s, et `rouleaux` bougent), `audio/mix-mo13.wav`, `audio/stems-mo13/`, `docs/mix_report-mo13.txt`
(relancés). Minutage provisoire et `vo-mo13.py` inchangés, aucun appel ElevenLabs, rien de partagé modifié
(`lib/kit47.js`, `film-mo9/`, `film-mo10/`, outils de `scripts/`).

Vérifié sur des images rendues et regardées : `renders/review/mo13-at.jpg` (raccord, 25,15 → 25,7 s, 12 images),
`mo13-at2.jpg` (5,1 → 5,35 et 8,4 → 8,7 s), `mo13-at3.jpg` (hook 3,0 → 4,75 s, débits 8,47 · 8,5 s, ticket 2
13,6 → 14,1 s), `renders/phone-mo13.png` (16 instants à 360 px, mentions comprises), `renders/stills-mo13/` en pleine
définition (A : 0 · 8,5 · 14,0 · 25,35 · 25,45 · 31,433 s ; B : 0,002 · 3,002 · 4,502 · 30,833 s). Aucune erreur
`PAGEERR` ni `CONSOLE`.

**Les 3 problèmes les plus graves : corrigés.**
1. **Son des neuf cartes, posé sur le geste vu.** Dans `audio-mo13.py`, `ARR, MID = 0.19, 0.10` (85 % et 50 % de
   `P.card`) : souffle à mi-course, note, carillon, pompe, papier et pop de l'annonce à la pose, note du virement à
   `ARR + 0,02`. Le souffle « la carte se pose » de la méthode passe aussi à `card + MID`, et la vibration de l'annonce
   part quand la carte entre dans le cadre (`ann + 0,055`). Dans `film.js`, le compte descend à `d + 0,32` et
   `tk + 0,3` (il descendait avant que le ticket arrive), et le tic « le compte roule » suit (`x + 0,32`).
   Mesuré sur `audio/stems-mo13/bruitages.wav` contre la pose calculée par le ressort du film (85 %) :
   | carte | pose | montée la plus raide | 1re crête |
   |---|---|---|---|
   | débit 1 | 6,891 | 0,0 image | +0,1 |
   | débit 2 | 7,849 | 0,0 | +0,1 |
   | gag | 8,637 | 0,0 | +0,1 |
   | virement 1 | 10,710 | 0,0 | +1,4 (carillon) |
   | ticket 2 | 13,530 | 0,0 | +0,1 |
   | virement 2 | 14,680 | 0,0 | +1,4 |
   | ticket 3 | 16,069 | −0,1 | +0,1 |
   | annonce | 16,941 | (vibration) | +0,1 (pop) |
   | virement 3 | 20,191 | 0,0 | +1,5 |
   Les carillons attaquent sur la pose et culminent 23 ms plus tard (1,4 image) : c'est leur timbre de cloche.
   Effets de bord, vérifiés dans le rapport : « prix payé écrit ✓ (2) » revient, « prix payé ✓ (3) » part (prévu) ;
   les souffles d'arrivée des virements 2 et 3 et « palettes SEMAINE 9 » ne sont plus retirés (9 sons retirés au lieu
   de 12). Écart à la prescription : le tic « le compte remonte » (virements 1 et 2) et « le compte roule 150 → 3 100 »
   passent en nappe (`bed=True`, hors règle de collision). Les virements 2 et 3 se posent 0,06 s avant que le compte
   roule : sans cela, la règle de collision retirait ces deux tics, dont celui qui mène à la chute.
   Papier des tickets à −2 dB (le limiteur réduisait de 6,0 dB à 16,07 s, les deux sons du ticket tombant ensemble).
2. **Raccord rembobinage → carte, sans fondu enchaîné.** `hx = S(t, REW[1] − 0,2, { f: 2,6, z: 1 })` : le HUD
   (compteur, palettes) file par le haut (`translateY(−220 hx)`, opacité `1 − sm(0,35 ; 0,85, hx)`), la mention du
   haut part avec lui, la silhouette de la 206 et son « 1 400 € » s'enfoncent dans la marche 1 (`y + 260 hx`, px du
   monde) ; `T.card = REW[1] + 0,06` ; `hd1` reste à `T.card + 0,02`, la mention de la carte monte dès `T.card` (au lieu
   de `+ 0,05`). Images : 25,25 s HUD et silhouette nets, en mouvement ; 25,35 s HUD à ≈ 40 % parti vers le haut,
   silhouette à ≈ 45 % qui descend dans le verre (aucun des deux en place) ; 25,40 → 25,45 s l'escalier seul ;
   25,50 s la carte entre, seule ; 25,6 s « budge » ; 25,7 s « budget − r ». La carte ne croise plus le HUD.
3. **Relais.** (a) `mvp` à `{ f: 2,0, z: 1 }` et `swap = sm(T.out + 0,45 ; T.out + 0,52)` : à 5,2 et 5,25 s, un seul
   « 1 500 », posé dans ses cases (planche `mo13-at2.jpg`). (b) Les deux débits qui montent passent dans le calque `LV`
   sous le HUD, comme les virements (le calque se déduit de `up` à chaque image ; au retour, ils reprennent leur place
   sous la carte du gag). En plus de la prescription : la carte du dessous (assurance) s'éteint d'abord
   (`sm(0 ; 0,1, up)`), car avec l'opacité prescrite `sm(0,1 ; 0,35)` son « − 40,00 € » se lisait à travers
   « − 152,00 € » à 8,5 s. Images : 8,47 s une seule carte qui monte ; 8,5 s « − 152,00 € » glisse sous la plaque
   « MARCHE 1 », dont les lettres restent nettes ; 8,55 s plus rien de lisible.

**Les autres points**
- **Hook, 3,0 → 4,8 s : corrigé.** Poussée lente de la caméra du monde et de la rue de `T.contour` à `T.out` (+ 5 %,
  ressort `{ f: 0,5, z: 1 }`, en plus du 1,00 → 1,04 de la mise au point) : la 206 passe de 251 à 261 px de large entre
  3,0 et 4,75 s (images à 0,4). Battement de l'étiquette + 10 %, tremblement de « 8 500 € ? » à ± 14 px au premier
  battement (amplitude 17). Image 0 et ouverture B inchangées à l'image 0.
- **Ticket 2 : corrigé.** Départ à `T.sem7 − 0,25`, extinction `sm(0,15 ; 0,45)` (tickets 2 et 3) : à 14,0 s le ticket
  pâle sort au-dessus de la bulle, sans passer sur « 2 450 et je la prends. » ; à 14,05 s la bulle est seule.
- **Mentions : corrigé.** 28 px à 70 % en haut (`top` 476) et sur la carte (`top` 802). Lisibles à 360 px
  (`phone-mo13.png`, 2,95 · 6,4 · 26,1 · 28,9 s ; B à 0,002 s).
- **« prix max 2 500 € » : corrigé.** Coup à `claque + 0,03`, note à `+ 0,05`.
- **Carte vide de 25,5 à 25,6 s** : décalée de 0,06 s avec `T.card`, comme prévu (acceptable au round 3).
- **Compteur aligné sur « 1 500 € » vers 15,9 s, Fiesta à x = 981 à 15,6 s** : laissés.
- **Boucle** : le début et la fin n'ont pas été touchés ; mesurée quand même en pleine définition. A : écart moyen
  0,31 / 255 entre l'image 0 et 31,433 s, 99e centile 5 ; B : 0,31 / 255 entre 0,002 et 30,833 s. Image 0 :
  écart-type 45,8.

**Mix** (`mix_report-mo13.txt`) : −14,1 LUFS, −4,0 dBTP après AAC 256 k ; 8,2 % du film à plus de 3 dB de limiteur,
9,7 % des blocs au plafond ; arrêt de bande à 0 image ; lignes de la carte sur les temps. Réduction max **−6,4 dB à
14,93 s** (cible ≤ 6) : le carillon du virement 2, posé avec la carte, culmine sur un coup de la musique. Baisser le
carillon de 1,5 dB ou le moteur de la Mégane de 2 dB ne la change que de 0,1 dB (les deux essais ont été retirés) ; la
vraie voix fera baisser le gain de normalisation (+15,1 dB aujourd'hui) et cette réduction avec lui.

**Ce qui reste**
- Le montage `renders/draft-mo13-9x16.mp4` (10 octobre, 00 h 58) est antérieur à ces corrections : à refaire, puis
  `qa_video.py` et la synchro des neuf cartes à 60 i/s sur le MP4 (ici mesurée sur la piste des bruitages). Pas fait
  ici : la machine faisait tourner deux montages des autres épisodes (≈ 5 s par image).
- Les trois planches à 0,1 s datent d'avant ces corrections. Les tranches touchées (3,0 → 4,8 · 5,1 → 5,35 · 8,4 → 8,7
  · 13,6 → 14,1 · 25,15 → 25,7 s) ont été regardées sur les planches `mo13-at*.jpg`.
- Rien n'a été écouté : 0–2 s, la montée de 6,6 à 16,5 s (sons sur la pose des cartes, tics en nappe) et
  20,5–21,6 s. Refaire le rapport de mix sur la vraie voix (ducking, limiteur à 14,93 s).
- La mention manque ≈ 0,2 s au raccord (de 25,38 s, celle du haut sortie, à ≈ 25,58 s, celle de la carte lisible).
- Recaler sur la vraie prise : `T.out` sur le temps, la place du tampon « toi aussi ».

## Round 4 (10 octobre 2026, critique seule : le film n'a pas été modifié)

**Matériel regardé** (film dans l'état des corrections du round 3 : `film.js` de 01 h 56, `events.json` de 02 h 01,
`mix-mo13.wav` de 01 h 52 ; le souffle de la carte du mix tombe bien à `card + 0,10` = 25,56 s, le mix suit donc
`card` = 25,465 s)
- Montage 540p avec le son, `renders/draft-mo13-9x16.mp4` : celui de 02 h 59 était incomplet (21,05 s). Refait avec
  `CUT=mo13 node scripts/render.mjs --draft`, mais arrêté à la limite d'une heure des commandes en arrière-plan à
  l'image 1 800 (la machine portait trois montages, jusqu'à 3,5 s par image). Complété : les images 1 800 → 1 886
  (30,0 → 31,433 s) rendues en pleine définition (`--range 30,31.43`), réduites à 540 × 960 et accolées aux 1 800
  premières, puis le mix posé (AAC 256 k). Résultat : 31,45 s, 1 887 images à 60 i/s. Écart à la soudure : 0,81 / 255
  (0,18 à 0,48 entre les images voisines, carte immobile).
- `qa_video.py` sur ce MP4 (`--intentional 21.5-22.4`) : `renders/qa-mo13/draft-mo13-9x16-qa.md` et `-safe.png`.
- Planches toutes les 0,1 s refaites : `renders/review/mo13-planche-0.1s-0-10.jpg`, `-10-20.jpg`, `-20-31.45.jpg`
  (315 images, regardées par tranches de 2 s), plus deux planches à 4 i/s tirées du MP4.
- Bandes à 60 i/s sur le MP4 : débit 1, virements 1 et 3, gag et « toi aussi », compteur de 15,6 à 16,0 s, butée et
  « une à la fois », montée de l'annonce, pile « Toujours dispo ? » et bulle 3, arrêt « 3 100 € », « prix max 2 500 € ».
- Test téléphone à 360 px : `renders/phone-mo13.png` (0 · 2,95 · 5,3 · 6,6 · 9,6 · 10,75 · 13,7 · 16,2 · 18,1 · 20,6 ·
  23,9 · 28,9 s).
- Images pleine définition, `renders/stills-mo13/` : A (0 · 2,0 · 2,95 · 4,3 · 5,25 · 6,6 · 8,55 · 9,6 · 11,5 · 14,0 ·
  15,6 · 16,3 · 17,3 · 18,05 · 19,2 · 19,45 · 20,6 · 21,2 · 22,6 · 24,6 · 25,35 · 25,55 · 26,6 · 28,9 · 30,5 s) ;
  B (`HOOK=B` : 0,001 · 1,501 · 3,001 · 4,201 · 30,501 · 30,834 s) ; repli de boucle image par image (`range-mo13/`).
  Aucune erreur `PAGEERR` ni `CONSOLE`.
- Son : attaques mesurées sur `audio/stems-mo13/bruitages.wav` et sur la piste du MP4 (enveloppe à 2 ms), comparées à
  la pose calculée des cartes (`t0 + 0,19`) et aux images. **Rien n'a été écouté.**
- Hook passé au mode diagnostic d'`art-du-hook` (image seule, texte et voix inchangés).

**Notes**

| Hook | Lisibilité 360 | Zones sûres | Mouvement | Variété / rythme | Marque | Voix (provisoire) | Son | Recette 47 / envie |
|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 |

Toutes les notes à 8, aucun FAIL : la grille est atteinte **sur le minutage provisoire**. Round 3 → 4 : mouvement 7 → 8
(raccord de la carte et relais corrigés, vérifiés) et son 7 → 8 (bruitages posés sur le geste vu). La livraison attend
la prise de Simon : recaler, refaire le mix (ducking) et un dernier contrôle.

**Mesures**
- `qa_video.py` : **aucun FAIL**. Première image écart-type 45,6 ; aucune image vide ; aucun plan figé de plus de
  0,9 s ; −14,1 LUFS et −4,0 dBTP sur le MP4 ; 2 premières secondes −15,3 LUFS contre −14,3 ; 14 % de l'énergie sous
  150 Hz, 33,5 % entre 1 et 5 kHz. Un WARN, zones sûres (droite : 8,50 → 20,25 s par endroits ; gauche : 9,75 →
  24,75 s) : sur la planche et sur les 25 images pleine définition, seulement des cartes, bulles, messages et voitures
  qui entrent ou sortent, le bord des marches de verre (x 940 → 1 050, y 1 276 → 1 366) et le bas du papier de
  l'étiquette (y 1 480 → 1 502 de 2,95 à 4,3 s, sans texte). Aucun texte au repos dans le rouge.
- **Synchro des cartes** (attaque la plus raide, à ± 0,2 image de la pose sur la piste des bruitages comme sur le MP4) :
  débit 1 6,888 s (pose 6,890) · débit 2 7,846 (7,848) · gag 8,634 (8,637) · virement 1 10,706 (10,709) · ticket 2
  13,526 (13,529) · virement 2 14,676 (14,679) · ticket 3 16,066 (16,069) · annonce 16,928 (16,940, vibration) ·
  virement 3 20,186 (20,190). Vu sur le MP4 à 60 i/s : le débit 1 entre à 6,767 s et se pose à 6,883-6,900 s, le
  virement 1 se pose à 10,700-10,717 s. Autres : « toi aussi » posé à 9,42 s, son à 9,394 (+ 2,5 images de crête) ;
  butée à 17,488 s, cellule allumée à 17,517 ; « une à la fois » posé à 18,017-18,033, son à 18,006 ; arrêt de bande
  21,566 s, « 3 100 € » à sa taille à 21,55 ; « prix max 2 500 € » lisible à 27,967, coup à 28,000.
- Boucle : A, dernière image (31,433 s) identique à l'image 0 (écart 0,00 / 255 ; 0,35 à 31,417 s) ; B, 30,834 s
  identique à 0,001 s. Repli : écart-type de l'image le plus bas à 30,75 s (8,8), puis 30,8 (9,6) ; pas d'image vide.
- Voix provisoire : 13 répliques, 71 mots écrits, écarts de 0,30 à 2,77 s, aucun chevauchement, dernière réplique
  finie à 31,02 s pour un film de 31,45 s. Parole 17,8 s (4,0 mots par seconde de parole, 2,3 sur la durée du film).
  Écart au brief : 71 mots pour ≈ 65 (journal § 6), compensé par le film de 31,45 s. Cohérent : note 8 (consigne).
- Hook (diagnostic `art-du-hook`, image seule) : Temps ✅ (« Il te manque 8 500 € ? » et la 206 dès l'image 0), Sens ✅,
  Miroir ✅, Écart ✅, fermé à l'image à 2,9 s (« 1 400 € » écrit sous les 1 500). De 0 à 2,28 s, à 360 px : « 10 000 »
  s'allume (0,2 → 0,7 s), la plume repasse le « ? » (1,0 → 1,6 s), « 1 500 » bat (1,9 → 2,4 s). Ouverture B :
  « 1 500 € ↓ 3 100 € » et la mention dès 0,001 s, mise au point à 3,0 s, étiquette à 4,2 s.

**Ce qui marche** : le hook tient sur A et sur B. Le récit se suit sans le son : compteur, prix barrés et payés,
« réserve », trois débits puis deux tickets de plus en plus courts, trois virements, trois voitures qui montent, la
tentation qui bute, la chute (« 3 100 € », « Tu attendais d'avoir 10 000. ») pleine de 23,5 à 24,35 s, le rembobinage
qui repasse chaque état du compte, la carte remplie sur les temps et immobile 2 s. Le raccord du rembobinage n'est plus
un fondu enchaîné (25,35 s : HUD qui file, silhouette qui s'enfonce ; 25,40-25,45 s : l'escalier seul). Un seul
« 1 500 » à 5,2 s ; les débits passent sous « MARCHE 1 » à 8,5 s. Une seule couleur d'accent, aucun logo, plaques
vierges, aucun visage, aucun site nommé.

### Les 3 problèmes les plus graves

**1. « 1 200 → 1 900 ✓ » ne se lit jamais, et « 1 550 → 2 450 ✓ » seulement au recul.** Les inscriptions des
arêtes sont la mémoire de l'escalier (brief : « l'arête de la marche quittée garde achat → revente ✓ »), donc de la
variable testée. Mesuré à 11,5 s (pleine définition) : les glyphes de « 1 200 → 1 900 ✓ » vont de y = 1 436 à 1 474,
au-dessus de la bande interdite, mais à ≈ 15 % de contraste (crêtes 100 / 255 sur un fond à 85). La règle
`const safe = 1 - sm(1440, 1474, iy);` (`film-mo13/film.js` l. 476) éteint le texte dès que sa **ligne de base**
dépasse 1 440 ; celle de la marche 1 est à ≈ 1 474 quand la caméra est posée (11,1 → 11,8 s). Au recul (20,5 → 21,2 s),
la marche 1 est sous 1 480 : son inscription reste cachée, et elle ne revient qu'à 21,3 s, assombrie sous le « 3 100 € ».
« 1 550 → 2 450 ✓ » s'écrit à 14,71 s quand la caméra monte à 14,78 s : il ne se lit qu'au recul, comme « 2 000 →
2 950 ✓ ». Correction :
- `film-mo13/film.js` l. 476 : `const safe = 1 - sm(1476, 1500, iy);` (l'inscription est pleine tant que sa ligne de
  base est au-dessus de 1 476, chiffres et ✓ au-dessus de 1 480 ; elle s'éteint pendant la montée) ;
- vérifier : `CUT=mo13 node scripts/at.mjs 11.2,11.4,11.6,11.75,11.9,14.75,20.6 renders/review/mo13-at.jpg`, puis
  `--phone` à 11,6 s : « 1 200 → 1 900 ✓ » lisible à 360 px de 11,3 à 11,75 s, et aucun glyphe au repos sous y = 1 480
  (seuil de luminance sur l'image pleine définition).

**2. La pile « Toujours dispo ? » s'imprime sur elle-même, puis sur la bulle « 2 950 et je la prends. »
(18,9 → 19,55 s).** Dans `film.js` l. 715-721, un message recouvert garde son texte à `1 − 0,2 k` d'opacité (0,8 · 0,6
· 0,4 · 0,2) et les plus anciens ne sont décalés que de 18 px (`dy = 92 min(k, 1) + 18 max(0, k − 1)`) : à 19,2 s,
deux « Toujours dispo ? » à 40 % et 20 % se lisent l'un sur l'autre (`t19.200.png`). La sortie
`go = S(st, T.bub3 − 0,2 + 0,05 (4 − i), P.push)` ne démarre qu'à 19,30 s pour le dernier et 19,50 s pour le premier,
quand la bulle 3 arrive (`T.bub3` = 19,50 s) : de 19,40 à 19,55 s, trois fantômes à 30-60 % passent sur
« Acheteur · message » et sur « … et je la prends. » (MP4, images 1 164 → 1 173 ; `t19.450.png`). Le commentaire de
la l. 285 voulait que les anciens « ne montrent que leur bord ». Correction :
- l. 75 : `T.msg = [0, 1, 2, 3, 4].map((i) => T.annOut + 0.3 + i * 0.12)` (dernier message à 19,09 s, SEMAINE 12 à
  19,19 s) ;
- l. 717 : `go = S(st, T.bub3 − 0.25 + 0.02 * (4 − i), { f: 1.6, z: 1 })` (la pile part de 19,25 à 19,33 s) ;
- l. 719 : opacité `… * (1 − sm(0.15, 0.4, go))` (partie vers 19,37 s, avant la bulle) ;
- après `set(m, …)` : ``m.style.color = `rgba(246,239,231,${f3(1 - sm(1.05, 1.5, k))})`;`` (un message recouvert ne
  montre plus que son bord de verre) ;
- puis `CUT=mo13 node scripts/events.mjs` et `python3 scripts/audio-mo13.py` (les notes des messages suivent `msg`) ;
  vérifier `at.mjs 19.0,19.1,19.2,19.3,19.4,19.5,19.55` : jamais deux « Toujours dispo ? » l'un sur l'autre, et la
  bulle 3 seule dès 19,45 s.

**3. La tentation est serrée (17,4 → 18,45 s) : l'annonce touche la mention et le tampon cache le « ? » et le « € ».**
L'annonce monte à `lerp(NY, 474, up)` + 40 au choc (`film.js` l. 708) : son bord haut se pose à y ≈ 514, la mention
« Exemple · prix moyens constatés » occupe 484 → 511, et « Annonce · maintenant » est 6 px dessous (`t18.050.png`,
`phone-mo13.png` à 18,1 s : les deux lignes se touchent). Le tampon « une à la fois » (`left:470px;top:64px`, l. 284)
couvre de 18,0 à 18,45 s le « ? » de « Une affaire ? » et le « € » de « 1 600 € » : le défaut corrigé au round 2 sur
« toi aussi » (`left:522px;top:100px`). Correction :
- l. 708 : `lerp(NY, 500, up)` (bord haut à ≈ 540 après le choc, 30 px sous la mention ; l'annonce couvre toujours les
  palettes, qu'elle découvre à SEMAINE 11) ;
- l. 284 : `une` à `left:500px;top:100px` ; contrôler que son bord droit reste sous x = 940 avec l'échelle 0,88 de
  l'annonce ;
- vérifier `at.mjs 17.5,17.8,18.05,18.3` et `--phone` 18,1 : mention, « Une affaire ? » et « 1 600 € » entiers.

### Les autres
- **Compteur qui roule** : chaque chiffre roule seul, et des valeurs fausses se lisent un instant : « 1 500 € » de
  15,85 à 15,92 s pendant 2 500 → 500 (MP4, images 951 → 954 pleines, 950 → 957 en partie ; planche à 15,9 s),
  « 197 € » à 9,1 s pendant 108 → 50. Une image ou deux à 0,1 s ; laissé aux rounds 2 et 3. Correction possible, dans
  `K.rollKeys2` (`kit-mo13.js`) : un chiffre de tête qui devient vide sort par le haut au lieu de passer par « 1 ».
- **Repli de boucle (30,55 → 31,1 s)** : la carte file, l'escalier descend et s'éteint (écart-type 8,8 à 30,75 s), puis
  l'image 0 revient avec une avance de caméra (z 160 → 0) et l'opacité. Pas de fondu enchaîné, pas d'image vide, mais
  0,3 s presque noire juste avant la reprise : un signal de fin. À essayer : `back` qui part à `CLR − 0,15 FO`.
- **Carte vide** de 25,45 à 25,7 s (verre entré, « bu » écrit) : acceptable, comme au round 3.
- **Mention** absente de ≈ 25,38 à 25,58 s (raccord) : connu.
- **Fiesta qui freine** à x ≈ 981 à 15,6 s : laissé (voiture seule en mouvement).
- **Hook** : de 3,0 à 4,8 s, l'image ne change que par la poussée lente et le battement de l'étiquette (+10 %) ; le
  tremblement de « 8 500 € ? » (4,28 s) se voit à peine à 360 px. Suffisant (note 8).
- **Son** : réduction du limiteur −6,4 dB à 14,93 s (cible ≤ 6), étage de crête de la musique −8,9 dB sur le premier
  coup (0,07 s) ; saut de 6 dB à la reprise de la boucle (−23,8 → −17,6 dBFS). Tout se rejoue avec la vraie voix.

**FAIL de `qa_video.py`** : aucun.

**Ce qui reste**
- La prise de Simon (ElevenLabs bloqué), puis : recalage (`T.out` sur le temps, tampon « toi aussi »), mix avec ducking,
  montage refait d'un seul tenant et contrôle sur le MP4.
- Rien n'a été écouté : 0–2 s, la montée de 6,6 à 16,5 s, 20,5–21,6 s, la boucle.
