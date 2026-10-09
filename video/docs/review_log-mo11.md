# MO11 « La préparation » : journal de relecture du film (étape 3, maquettage)

Film : `film-mo11/index.html` + `film-mo11/film.js`, sur `lib/kit47.js` (lecture seule) et `lib/kit47-etats.js`
(nouveau). Minutage lu dans `audio/vo-mo11/vo-timing.json` (**provisoire**, aucune prise de Simon : ElevenLabs bloqué).
Contrôles faits avec les outils partagés (`scripts/at.mjs`, `scripts/sheet.mjs`, `scripts/events.mjs`) et
`ref-motion.py`. Machine chargée (3 épisodes en parallèle, charge 5 à 10 sur 4 cœurs) : 5 à 20 s par image.

## Tour 1 : sondes à 0,4 (42 instants), 9 octobre 2026

Ce qui marche dès le premier rendu : image 0 composée (calcul, « telle quelle ? », Clio sale, « LAVE-MOI », contour
entier), l'embout qui aspire la bande du flanc, « 2 ?00 » et « C'est donné. » réécrit par la fente, le calcul qui se
replie dans le compteur, les six coups en ligne de partage (arrêt à mi-course sur le mot), le compteur qui roule sans
se poser, la carte « trouvé », le soleil bas, le viseur dont les coins vont se poser sur l'écran du téléphone, la photo
peinte dans cet écran (homographie, paume devant), J+4, l'offre, le virement, « + 400 € », le rembobinage jusqu'à
13:10, la carte, l'ongle, le verdict, le retour exact à l'image 0.

| Problème vu | Correction |
|---|---|
| Les SVG (rayure, enjoliveurs) ne chargeaient pas sous `at.mjs` : son serveur ne connaît pas `image/svg+xml` (5 min perdues sur un `waitForFunction`) | SVG lus par `fetch` puis servis en Blob ; outils partagés inchangés |
| « PRIXAFFICHÉ » : l'espace du libellé s'effondre (lettres en `inline-block`) | espace insécable |
| La pile de débits ne sortait pas : la dernière notification restait sous la ligne des 1 480 px pendant l'attente | sortie plus rapide (ressort 1,7 Hz) et plus longue, avec fondu à mi-course |
| Le libellé « PRIX AFFICHÉ » se perdait sur le ciel orangé de l'attente | le décor du soir s'assombrit en haut (dégradé 92 % → 12 % sur les 40 % du haut) |
| Le verdict blanc se lisait mal sur la carrosserie grise zoomée | voile sombre en bas pendant le verdict |
| L'ongle se lisait comme une étiquette | bout de doigt tracé à la lumière, l'ongle devant, la plume à sa pointe |
| La bande aspirée était un parallélogramme net, « autocollant » | bords qui ondulent (bruit à graine fixe), attaque arrondie derrière l'embout |
| Ombre portée invisible (couchée derrière la voiture, cachée par la carrosserie) | quatre essais sur image fixe : ombre couchée sous la voiture et tirée vers l'arrière droit, qui s'allonge et tourne avec l'heure |
| Coût de rendu | palettes en verre teinté sans flou d'arrière-plan (14 tuiles), reflet de sol retiré (presque invisible, doublait la peinture de la voiture) |

## Tour 2 : planches toutes les 0,1 s (`renders/review/mo11-planche-0.1s-0-10.jpg`, `-10-20.jpg`, `-20-30.1.jpg`)

Regardées image par image, par tranches de 2 s. Aucune erreur `PAGEERR`. Lecture d'ensemble : la chaîne ne coupe
jamais (calcul → compteur → six avant / après → lumière → viseur → téléphone → offre → « + 400 € » → rembobinage →
carte → ongle → verdict → image 0). Le compteur roule sans se poser de 7,0 à 12,2 s ; on lit les centaines passer
9 → 0 → 1 → 2 → 3 ; l'horloge des palettes avance à chaque coup (13:10, 13:40, 14:20, 14:35, 15:00, 15:20).

| Problème vu (instant) | Correction |
|---|---|
| 0 → 0,45 s : rien de neuf avant la plume (elle partait sur « 2 000 », à 0,48 s) | la plume part sur « achètes » (0,15 s) |
| 4,0 → 4,6 s : le « ? » de « 2 ?00 » ne restait qu'un instant, « C'est donné. » à peine 0,2 s avant le repli | rouleau plus vif (1,9 Hz), repli sur « Samedi » − 0,02 s au lieu de − 0,16 s |
| 5,3 → 5,9 s : plan presque figé entre le compteur et le lavage | la caméra glisse et pivote vers la voiture avant le lavage (nouvelle clé de caméra) |
| 18,0 → 20,4 s : sous « + 400 € », l'offre et le virement restaient lisibles en fantôme derrière « Ton samedi le mieux payé. » | les cartes du récit s'éteignent sous la chute (elles reviennent au rembobinage) |
| 21,2 → 22,5 s : la carte « Avant la photo 1 » restait vide 1,2 s | la carte s'ouvre ligne par ligne (150 → 470 px), le texte entre une fois le conteneur ouvert |
| 27,0 → 27,8 s : verdict tenu sans mouvement de caméra | poussée lente sur l'aile pendant le verdict |
| 21,3 → 24,4 s : carte presque immobile | dérive lente (bruit à graine fixe, ± 10 px, ± 2°), déjà dans cette planche : à peine visible à 270 px, gardée |

Vu et gardé : le « 2 000 » qui se réécrit à 28,3 s sur la carrosserie encore zoomée (la caméra recule en même temps) ;
la pause de 18,0 à 18,7 s (la seule du film, poussée lente sur le chiffre).

## Tour 3 : contrôles mesurés et dernières corrections

- Zones sûres mesurées sur le DOM (boîte à l'écran de chaque texte visible toutes les 0,1 s) : rien au repos hors
  zone. Corrigé : la mention remontée de 12 px et sortie vers le haut, la carte de la méthode qui se replie sur
  place au lieu de monter dans la bande des 220 px, la pile de débits qui s'éteint en 0,2 s et ne descend plus que
  de 380 px. Reste : trois images de sortie de la pile sous 50 % d'opacité (11,98 → 12,03 s).
- Boucle : 0,016 / 255. Accumulation : 93 % d'images en mouvement, aucun plan figé, couches 0,62 (objectif 0,66 non
  tenu, noté). Détails dans `docs/timeline-mo11.md`, « Le film ».
- `renders/review/mo11-at.jpg` refait sur la dernière version (0 · 3,3 · 4,4 · 6,3 · 8,15 · 9,0 · 11,0 · 13,6 ·
  14,9 · 18,9 · 23,6 · 26,8 s).

- **Police des mots écrits à la lumière** : « telle quelle ? », « C'est donné. » et « Ton samedi le mieux payé. »
  sortaient dans une police de secours. `Kit47.word()` lit la famille au troisième mot de la chaîne de police : avec
  `'italic 500 92px Fraunces'`, le SVG recevait la famille « 92px Fraunces ». Corrigé dans le film en passant
  `'500 92px Fraunces'` avec `italic: true` (le kit ne bouge pas). Les planches 0,1 s datent d'avant cette
  correction et d'avant les corrections du tour 3 ; `mo11-at.jpg` et `mo11-image0.jpg` sont à jour. Le même appel
  existe dans `film-mo9/film.js` (« Même le kebab / était prévu. ») et `film-mo10/film.js` (« Moins qu'avec / une
  seule. », le « ? ») : signalé, pas modifié (autre session).

## À faire quand la prise de Simon existera

`python3 scripts/vo-mo11.py takeA.mp3 --retenue`, puis `CUT=mo11 node scripts/events.mjs` : le film relit
`vo-timing.json` et `events.json` suit. Revoir sur planche les passages serrés si la prise est plus lente :
« donné » → repli sur « Samedi » (0,6 s en provisoire), « heures » → lavage, « L'odeur » → rayure → « Les
enjoliveurs » (0,75 s par coup), et la pause 18,0 → 18,7 s.

## Critique, round 1 (9 octobre 2026, relecture extérieure, film non modifié)

Jugé sur la version de `film.js` de 08:21 (minutage provisoire, piste de voix muette), sans montage MP4 (consigne du
round). Regardé image par image :

- planches 0,1 s refaites : `renders/review/mo11-planche-0.1s-0-10.jpg`, `-10-20.jpg`, `-20-30.1.jpg` (301 images,
  aucune erreur `PAGEERR`) ;
- test téléphone sur 12 instants : `renders/phone-mo11.png` (0 · 3,3 · 4,4 · 6,15 · 9,1 · 11,6 · 13,6 · 15,5 ·
  18,3 · 19,8 · 23,9 · 26,9 s) ;
- 27 images pleine définition : `renders/stills-mo11/t*.png` (0 → 29,5 s) ;
- preuves : `renders/review/mo11-r1-coups.jpg` (trois coups, en pleine définition et à 360 px, à côté des phares) et
  `renders/review/mo11-r1-compteur.jpg` (retenue du compteur à 8,1 s).

### Notes

| Hook | Lisibilité 360 px | Zones sûres | Mouvement | Variété / rythme | Marque | Voix (provisoire) | Son | Recette 47 / envie |
|---|---|---|---|---|---|---|---|---|
| 7 | 7 | 8 | 7 | 8 | 8 | 8 | 7 | 7 |

Ce qui tient déjà : l'image 0 est pleine et se lit à 360 px (« 2 000 → 2 900 » centré à x = 541, « telle quelle ? »
à 546, la Clio sale, le contour). La chaîne ne coupe jamais, du calcul jusqu'à l'image 0. Le compteur monte sans se
poser et se pose sur 3 330 € à 12,4 s. Les phares (7,15 s) et le lavage (6,15 s) font de vrais avant / après. Le
soleil bas se lit comme une lumière, pas comme un filtre (teinte médiane du ciel 36°, l'orange de la charte est à
16-21°). La chute « + 400 € » est centrée (x = 542) avec la seule pause. Le rembobinage (20,4 → 21,1 s) repasse par
l'annonce, le viseur et les débits jusqu'à 13:10. La boucle revient sur l'image 0. L'histoire reste dans le registre
de l'envie : chaque débit fait monter un prix, aucune attente sans appel, aucune mauvaise vente, et le spectateur
garde la photo 1, la règle des 15 % et le test de l'ongle. Aucun CTA, aucun logo, aucune plaque, aucun visage.

**Voix (8)** : le minutage provisoire tient le brief. 64 mots écrits en 30,1 s, soit 2,1 mots par seconde de film
(MO5 : 2,5). 16,6 s de parole, aucune réplique ne chevauche la suivante (écart minimal 0,15 s, sur la virgule de
l'ouverture), et la dernière réplique finit à 29,74 s, avant la fin du film. Réserve : `vo-timing.json` estime le
débit à 5,96 syllabes par seconde, alors que le brief compte sur 5,6. « L'ongle glisse sur la rayure ? » tient en
1,01 s (6,9 syllabes par seconde) et ne laisse que 0,49 s avant « Quinze euros » : c'est la première réplique à
revoir sur la vraie prise.

### Les trois problèmes les plus graves

1. **Trois avant / après sur six ne se lisent pas à 360 px, alors que c'est la variable testée** (preuve :
   `mo11-r1-coups.jpg`).
   - **Sièges (8,0 → 8,4 s)** : la ligne efface un voile de pare-brise. On comprend « vitres nettoyées » pendant que
     la voix dit « Les sièges », et aucun siège n'est montré sale ni propre. Dans la veille, la niche fait ses vues
     avec des intérieurs sales (bubbleauto81).
   - **Rayure (10,0 → 10,4 s)** : le trait principal fait 4 px de large à l'écran (1,4 px à 360 px) et son halo est
     à 22 % : à la taille du téléphone, on ne voit rien.
   - **Enjoliveurs (10,7 → 11,1 s)** : une fois la voiture lavée, l'enjoliveur « avant » est gris terne, presque
     comme le neuf. Seule la fissure les distingue, et elle ne se voit qu'en pleine définition.

   Corrections :
   - Dans `scripts/dirty-mo11.py`, l. 274-276, passer la largeur des rayures de 2,2 / 1,15 / 0,7 à 5,0 / 2,6 / 1,6.
     L. 271, passer le halo de `.22` à `.40` et l'ombre de `.18` à `.35`.
   - Dans `hub_texture`, l. 302, remplacer `0.05 + col * 0.66` par `0.03 + col * 0.45`. L. 304, passer le voile de
     `[1.05, 0.93, 0.78]` à `[1.10, 0.85, 0.60]`. L. 307, passer la poussière du bord de `0.50 *` à `0.85 *`.
   - Sièges : peindre dans `clio3-pare-brise.png` (§ 3 du script) deux ou trois auréoles claires (#b49c7a, 50 %, bord
     flou de 6 px) sur le dossier passager visible derrière la vitre (photo x 1 060-1 230, y 160-290), et ramener le
     voile à 40 % pour qu'on les voie. Dans `film.js`, poser l'arrêt de la ligne sur l'auréole : `COUPS.sieges.xm`
     de 934 à 1 140, `P: [1140, 225]`.
   - Contrôle : `CUT=mo11 node scripts/at.mjs 8.15,10.15,10.9 renders/review/mo11-coups.jpg 1`, puis réduire à
     360 px. Chaque moitié « avant » doit se distinguer de la moitié « après » aussi nettement que les phares à 7,15 s.

2. **Le gag visuel du hook ne se lit pas.** L'embout (`film.js`, l. 131-134, `scale` l. 458 : `lerp(0.6, 1, …)`)
   mesure environ 22 × 92 px à l'écran, soit 7 × 30 px à 360 px. C'est un rectangle au trait, pas un aspirateur. La
   bande qu'il laisse sur l'aile ressemble à un ruban gris, et sur la portière elle devient une bande sombre. De son
   côté, « C'est donné. » n'est entier qu'environ 0,3 s (de 4,45 à 4,75 s, le repli part à 4,64 s) : la réécriture part de
   `T.donne + 0.05/0.08` (l. 497 et 504) et balaie le mot en 0,36 s.

   Corrections :
   - Passer l'échelle de l'embout à `lerp(1.3, 2.0, …)`. Dessiner une vraie tête de suceur : un trapèze large de
     120 × 40 px de photo, perpendiculaire au flexible, avec une rangée de poils, et faire sortir le flexible du
     cadre en haut à droite.
   - Faire passer les grains de poussière de `r: 2.6 + 4.2 * h(3)` (l. 129) à `5 + 7 * h(3)`.
   - Monter la luminance de la bande nette pour qu'elle se lise comme du vernis propre, et non comme un ruban.
   - Faire démarrer la réécriture et la fente (l. 497, 504, 539, 541) sur un nouveau repère
     `T.rew = M('trouve') - 0.05` (≈ 3,64 s), en laissant le rouleau « 2 ?00 » sur `T.donne`. Retarder le repli :
     `T.fold = M('samedi') + 0.13`. « C'est donné. » restera entier environ 0,6 s.

3. **Le renversement est presque figé de 21,4 à 24,4 s.** La carte et la voiture assombrie ne bougent presque pas :
   l'écart moyen entre images à 0,1 s reste entre 0,4 et 1,5 sur 255, contre 10 à 20 pendant les coups. La voix se
   tait aussi 2,26 s (de 22,49 à 24,75 s) pendant qu'on lit les trois règles. Le brief demande ici « F en orbite
   légère sur la carte finale », mais `FKs` (l. 173-176) n'a aucune clé entre `REW[0] + 0.05` et `T.dive2`. La
   caméra se pose vers 21,5 s, et la dérive de ± 10 px et ± 2° de `cardW` (l. 684) ne se voit pas. C'est le moment du
   film où l'on risque le plus de perdre le spectateur.

   Corrections :
   - Ajouter dans `FKs` la clé `[T.card + 0.1, { x: 548, y: 905, s: 0.98, rx: 3.5, ry: 5 }, { f: 0.22, z: 1 }]` :
     une orbite lente de −3° à +5° et une poussée de 0,90 à 0,98 pendant les trois lignes.
   - Faire suivre à `cardW` un `rotateY` de sens opposé (−0,5 × l'orbite) pour la parallaxe.
   - Donner à chaque ligne de la carte un petit déplacement de caméra vers elle (8 à 12 px) à son entrée.

### Les autres problèmes

- **Son (7)**, mesuré sur `audio/mix-mo11.wav`, pas écouté. On a −14,1 LUFS et −4,1 dBTP avant AAC, et le son
  attaque dès 0 s. Mais **65 % de l'énergie est sous 150 Hz**, ce qui déclenchera le WARN téléphone de `qa_video.py`
  (MO9 : 42 % ; MO12 : 38 %). La musique seule en a 80 % ; la source brute, 81 %. La cause est l. 319 de
  `scripts/audio-mo11.py` : `mus - bp(mus, None, 150)` soustrait un Butterworth causal, et son déphasage annule la
  coupe. Mesuré : −2,2 dB à 50 Hz, −1,0 dB à 60 Hz et **+3,3 dB à 150 Hz**, au lieu de −9 dB. MO12 avait déjà
  relevé ce défaut. Corrections :
  - copier `lr4()` et `shelf()` de `scripts/audio-mo12.py` (l. 146-156) ;
  - remplacer la l. 319 par `mus = shelf(mus, 150, g_lo=db(-9))`. Mesuré sur la source : la musique passe de 81 % à
    44 % sous 150 Hz ;
  - la bande de présence l. 178-179 (`mus - pres * …`) a le même défaut et ne creusera pas les −10 dB quand la voix
    arrivera. La découper avec `shelf` à 1 500 Hz et à 6 000 Hz.
- **Lisibilité à 360 px** :
  - Le repère « Propre, chez un pro · 3 490 € » (`film.js` l. 259 : 28 px à 58 %) fait 9 px sur le téléphone. C'est
    pourtant le plafond qui rend la hausse crédible : le passer à 36 px et 82 %.
  - « l'heure avant le coucher » (l. 269 : 30 px à 60 %), la règle à garder, passe à 38 px et 85 %. Descendre
    « Soleil bas, dans ton dos. » de 676 à 690 px.
  - Pendant le verdict, la carte repliée tombe à environ 10 px à 360 px : remplacer `1 - 0.22 * cmp` par
    `1 - 0.12 * cmp` (l. 684).
- **Retenue du compteur** (`mo11-r1-compteur.jpg`) : à 8,1 s, on lit « 3 993 € », au-dessus du repère à 3 490 €. Le
  millier tourne sur les 30 dernières unités (`sm(970, 1000, …)`, l. 555), alors que les centaines ne tournent que sur
  les 10 dernières. Passer le millier à `sm(990, 1000, v % 1000)`.
- **Vente (16,0 → 17,3 s)** : la bulle « 3 300 et je la prends. » cache la moitié de « 3 330 € » sur l'annonce, et
  on perd la comparaison entre les deux prix. Faire monter l'annonce d'environ 70 px quand la bulle entre (`ANN.top`).
- **Boucle (28,4 → 28,9 s)** : « 2 000 → » se réécrit en blanc sur le pare-brise gris clair de la voiture encore
  zoomée, et le texte est peu contrasté. Démarrer la réécriture une fois la caméra revenue sous un grossissement de
  1,3, ou poser un voile sombre en haut pendant ce passage.
- **Viseur (13,9 → 14,7 s)** : les coins vont de x = 22 à x = 1 058 et entrent dans les bandes de gauche et de
  droite, sous les boutons. Ce n'est pas du texte, mais il faut le ramener à la colonne 140 → 940.
- **Ouverture B** (« La revendre sale t'économise un après-midi… ») : elle n'est pas construite dans le film
  (`?hook=B` sans effet), alors que le brief la prévoit en test. À faire quand la prise existera.
- **Planche à 0,25 de définition, 3,3 s** : des morceaux du contour sortent de la voiture et la bordure avant gauche
  manque. L'image pleine définition au même instant est propre, donc c'est un artefact de la petite définition. À
  revérifier sur le brouillon (`--draft`, définition 0,5).
- **Ouverture, 1,7 → 2,7 s** : seul le point de plume bouge (écart 0,56 à 0,91 / 255). C'est acceptable (MO9 avait
  1,2 s sur sa flèche), mais c'est la seconde la plus calme du hook.

### `qa_video.py`

Pas lancé : il n'y a pas de MP4 à ce round. **Aucun FAIL relevé** par les mesures de substitution :

- le détecteur de zones de `qa_video.py`, appliqué aux 27 images pleine définition et aux 301 images des planches,
  ne trouve **aucun texte au repos** dans les bandes interdites ;
- on peut s'attendre aux WARN suivants sur le MP4, à trancher comme non bloquants :
  - la voiture et son contour dans les bandes latérales (0 → 5,1 s ; 12,0 → 14,8 s, avec les coins du viseur) ;
  - les entrées de cartes, en 0,2 à 0,3 s : notifications à 6,6, 6,8, 9,9 et 11,4 s ; messages à 15,4 et 15,8 s ;
    bulle et virement à 15,9 et 16,9 s ; rembobinage de 20,7 à 21,1 s ;
  - la carrosserie dans la bande du bas pendant la boucle (28,4 → 28,6 s) ;
  - l'équilibre téléphone (65 % sous 150 Hz).
- Côté son : −14,1 LUFS intégrés et −4,1 dBTP sur le WAV ; le true peak après AAC reste à mesurer sur le MP4.
- Images vides et plans figés de plus de 0,9 s : aucun sur les planches. Le passage le plus calme est
  21,6 → 24,3 s (problème 3).

### Corrections du round 1 (9 octobre 2026)

Fichiers touchés : `film-mo11/film.js`, `scripts/dirty-mo11.py` (relancé : seuls `clio3-pare-brise.png`,
`clio3-rayure.svg` et `clio3-enjoliveurs.svg` changent, les autres calques sortent identiques à l'octet près),
`scripts/vo-mo11.py` (repère `trouve` ajouté ; `--provisoire` relancé, aucun autre temps ne bouge),
`scripts/audio-mo11.py` (relancé), `film-mo11/events.json` (`CUT=mo11 node scripts/events.mjs` : seuls `fold`,
`sam` et le nouveau `rw` changent). `lib/kit47.js`, `lib/kit47-etats.js` et les outils partagés sont inchangés.
Aucun appel ElevenLabs.

Preuves regardées : `renders/review/mo11-r1fix-coups.jpg` (phares en référence, sièges, rayure, enjoliveurs, en
½ définition et à 360 px), `renders/review/mo11-r1fix-embout.jpg` (3,0 · 3,3 · 3,6 s),
`renders/review/mo11-r1fix-at.jpg` (23 instants, pleine définition, de 3,0 à 29,0 s), les trois planches 0,1 s
refaites (`mo11-planche-0.1s-0-10.jpg` tirée en dernier, sur la version finale), et des rendus séquentiels pleine
définition avec les drapeaux de `render.mjs` (2,9 → 3,8 s, 5,85 → 6,6 s, 21,0 → 22,5 s, à 60 i/s).

**1. Les avant / après (variable testée)**

- Rayure : largeurs 5,0 / 2,6 / 1,6, halo à 40 %, ombre à 35 % (valeurs de la critique). À 10,15 s, la moitié
  « avant » montre des traits blancs nets à droite de la ligne, lisibles à 360 px.
- Enjoliveurs : `0.03 + col * 0.45`, voile `[1.10, 0.85, 0.60]`, poussière du bord à `0.85`. À 10,9 s, la moitié
  « avant » est brun sombre et la moitié « après » gris argent, aussi tranchées que les phares à 7,15 s.
- Sièges : le voile du pare-brise descend vers 40 % (`0.30 + 0.14 × bruit + 0.20 × essuyage`, plafond 0,70) et le script peint
  trois auréoles #b49c7a (bord flou de 6 px) sur le dossier passager, avec une graine à part (311) pour ne pas
  décaler les autres calques. Deux écarts avec la critique. D'abord, la poignée de la ligne (y 204-254) cachait
  l'auréole placée au centre : deux auréoles passent au-dessus et au-dessous de la poignée (centres 1 150 × 164 et
  1 134 × 298), coupées en deux par l'arrêt à x = 1 140, et une troisième reste entière du côté sale (1 215 × 236).
  Ensuite, à 50 %, les taches disparaissaient sur la planche à 270 px : elles passent à ≈ 65 % au cœur et 85 % sur
  le bord, avec des demi-axes de 40 à 56 px. `COUPS.sieges` : `xm` 1 140, `P` [1 140, 225]. À 8,15 s, on voit des
  taches beiges à droite de la ligne et un dossier propre à gauche : on ne lit plus « vitres nettoyées ».

**2. Le gag du hook**

- L'embout devient une tête de suceur tracée à la lumière : un trapèze de 40 × 120, quinze poils sur le grand côté,
  une fente d'aspiration, un col, puis un flexible annelé qui sort du cadre à droite, sous le calcul. Mon premier
  tracé montait à la verticale et traversait « 2 900 » : je l'ai couché vers la droite. Échelle `lerp(1.3, 2.0, …)`. La bande
  passe de 74 à 96 px de demi-largeur pour couvrir la tête.
- Grains de poussière : `r = 5 + 7 × h(3)`.
- Bande nette : le masque suit la silhouette de la voiture et non plus ses zones claires. Sur la portière, la bande
  se lisait comme un ruban sombre parce que le masque l'éteignait sur la peinture grise. Elle reçoit maintenant
  un éclaircissement de 24 à 50 % et un reflet perpendiculaire le long de son bord haut. À 3,3 et 3,6 s, elle se lit
  comme une bande propre et brillante dans la poussière.
- **Défaut de rendu trouvé en vérifiant, corrigé** : en rendu séquentiel pleine définition (`render.mjs --range
  2.9,3.8`), une tuile du bas de la voiture (bouclier, boue, roue arrière) se dessinait sur le capot une image sur
  deux, de 3,13 à 3,58 s. Le tirage image par image (`at.mjs`) ne le montrait pas. Cause, isolée par
  substitution : le trou `evenodd` découpé dans le calque de poussière (`E.clip(…, hole)`). Sans le trou, plus de
  tuile. La bande propre est maintenant une copie de la voiture propre, découpée par un polygone simple et posée
  juste au-dessus de la poussière (`bandBase`). Les calques phares, rayure et suivants restent au-dessus d'elle.
  Mesuré de nouveau sur 2,9 → 3,8 s et 5,85 → 6,6 s (le lavage traverse la bande) : aucune tuile, même rendu
  qu'avant à l'œil.
- Texte : nouveau repère `trouve` dans `vo-mo11.py` (MARKS) ; `T.rw = M('trouve') − 0,05` (3,64 s) pilote la fente et
  la réécriture, le rouleau « 2 ?00 » reste sur `T.donne`. `T.fold = M('samedi') + 0,13` (4,79 s). Les palettes
  suivent (`T.sam = M('samedi') + 0,17`), sinon « SAMEDI » serait arrivé sur « C'est donné. » encore en place.
  « C'est donné. » est entier d'environ 4,2 à 4,8 s (images à 4,3 et 4,7 s). Le bruitage de la fente suit `rw`.

**3. Le renversement (21,4 → 24,4 s)**

- Clé ajoutée dans `FKs` : `[T.card + 0.1, { x: 548, y: 905, s: 0.98, rx: 3.5, ry: 5 }, { f: 0.22, z: 1 }]`.
- `cardW` tourne en sens inverse de l'orbite (`rotateY` = −0,5 × (ry − 1), éteint pendant la plongée) ; à chaque
  règle, la carte monte de 12 px et la voiture de 6 px (`lineNudge`, ressort 1,4 Hz), puis le décalage se résorbe
  pendant la plongée.
- Mesuré (planche à 0,25, écart moyen entre images à 0,1 s) : de 1,0 à 3,7 / 255, médiane 1,7, contre 0,4 à 1,5
  avant. Le passage reste plus calme que les coups (10 à 20), parce que c'est un temps de lecture, mais il n'y a
  plus de plan posé.

**Les autres points**

- Son : `lr4()` et `shelf()` copiés de `audio-mo12.py`. Coupe téléphone : `shelf(mus, 150, g_lo=db(-9))`. Bande de
  présence : `shelf` à 1 500 et à 6 000 Hz. Mix : **36 % de l'énergie sous 150 Hz** (contre 65 %), musique seule à
  48 %, −14,2 LUFS, −3,8 dBTP avant AAC, son dès 0 s. Tant que la voix est muette, la bande de présence n'agit pas.
- Lisibilité : le repère « Propre, chez un pro · 3 490 € » passe à 36 px et 82 % (montant à 96 %) et remonte de 4 px
  pour laisser l'air au-dessus des palettes. « l'heure avant le coucher » passe à 38 px et 85 %, « Soleil bas » à
  690 px, la carte du verdict à `1 − 0.12 × cmp`. Vu à 7,15, 12,9, 14,6 et 26,9 s.
- Compteur : millier sur `sm(990, 1000, …)`. À 8,1 s, on lit « 2 993 € ».
- Vente : écart avec la critique. Monter l'annonce de 70 px l'aurait posée sur « J+4 », juste au-dessus. L'annonce se
  resserre donc vers son bord haut, qui ne bouge pas : son prix « 3 330 € » remonte de 55 px quand l'offre arrive,
  puis de 33 px au virement. À 16,3 et 17,2 s, « 3 330 € » est entier au-dessus de la bulle « 3 300 et je la prends. ».
- Boucle : le voile du haut suit seulement le grossissement de la caméra (il ne s'éteint plus à la boucle). À 28,6 s,
  « 2 000 → » s'écrit sur fond sombre ; à 29,0 s, « 2 000 → 2 900 » reste lisible pendant que la voiture revient.
- Viseur : les coins restent dans la colonne 140 → 940 (au départ comme à l'arrivée sur la voiture). Vu à 14,6 s.
- Boucle mesurée (définition 0,25) : image 0 contre fin (30,0999 s) **0,11 / 255** ; image 0 peinte après la fin
  contre la fin, 0,03. Trouvé en mesurant : un outil caché par `visibility` comptait encore dans le débord du SVG de
  la voiture. Le flexible fait 1 400 px de photo, et sa position changeait la rastérisation de la voiture entre la
  fin et l'image 0 (0,65 / 255). Les outils cachés passent par `display: none`, et le calque de la rayure n'est plus
  découpé avant son coup.

### Ce qui reste après le round 1

- Ouverture B (« La revendre sale t'économise un après-midi… ») : toujours pas construite. Elle demande sa propre
  image (la Clio propre « Vendue 3 300 € », la poussière qui revient) ; à faire avec la prise de Simon.
- Voix : le minutage reste provisoire (5,96 syllabes par seconde estimées). « L'ongle glisse sur la rayure ? » est la
  première réplique à revoir sur la vraie prise.
- Ouverture, 1,7 → 2,7 s : seul le point de plume bouge (non traité, jugé acceptable par la critique).
- Sièges : même renforcé, c'est l'avant / après le moins saturé des quatre (beige sur un dossier sombre, derrière la
  vitre, contre le jaune des phares). Si le prochain round le juge encore faible, rapprocher la caméra (`s` 1,9 → 2,2).
- Rayure : à 360 px, la moitié « avant » reste un trait blanc court (≈ 50 px de long). On la voit, moins que les
  phares ou les enjoliveurs : une rayure de clé reste fine.
- Définition réduite (planches à 0,25, sonde à 0,5) : Chromium y dessine parfois des tuiles périmées pendant que la
  caméra bouge. La planche 0-10 en montre à 3,2 et 3,6 s (un bout de flexible en double), la planche 20-30.1 de
  21,7 à 21,8 s, la sonde à 0,5 de 21,6 à 21,9 s. Les rendus séquentiels pleine définition de 2,9 à 3,8 s (55 images,
  regardées une à une) et de 21,0 à 22,5 s (91 images, mesurées) n'en montrent aucune. À surveiller sur le
  brouillon `--draft` et sur le MP4 final : la critique avait vu le même défaut à 3,3 s sur la planche à 0,25.
- Le flexible de l'embout traverse le flanc de la voiture pendant 0,1 s, au moment où il apparaît (3,0 s).
- `qa_video.py` : toujours pas lancé (pas de MP4 à ce round). Les WARN attendus sont ceux de la critique, moins
  l'équilibre téléphone ; les coins du viseur ne sont plus dans les bandes latérales.
