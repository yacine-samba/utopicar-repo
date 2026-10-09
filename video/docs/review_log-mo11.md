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

## Critique, round 2 (9 octobre 2026, relecture extérieure, film non modifié)

Jugé sur `film.js` de 13:48 (minutage provisoire, piste de voix muette, mix de 12:32), sans montage MP4 (consigne du
round). Regardé image par image :

- planches 0,1 s refaites : `renders/review/mo11-planche-0.1s-0-10.jpg`, `-10-20.jpg`, `-20-30.1.jpg` (301 images,
  aucune erreur `PAGEERR`), lues par tranches de 2 s ;
- test téléphone sur 12 instants : `renders/phone-mo11.png` (0 · 3,4 · 4,5 · 6,2 · 8,15 · 9,0 · 10,15 · 13,6 · 16,4 ·
  19,8 · 23,9 · 26,9 s) ;
- 38 images pleine définition : `renders/stills-mo11/t*.png` (0 → 30,05 s) ;
- preuves : `renders/review/mo11-r2-coups.jpg` (les cinq coups en close-up, en pleine définition et à 360 px) et
  `renders/review/mo11-r2-renversement.jpg` (21,4 → 24,4 s à 360 px, axe x = 540 tracé).

### Notes

| Hook | Lisibilité 360 px | Zones sûres | Mouvement | Variété / rythme | Marque | Voix (provisoire) | Son | Recette 47 / envie |
|---|---|---|---|---|---|---|---|---|
| 8 | 7 | 8 | 8 | 8 | 8 | 8 | 8 | 8 |

Corrections du round 1 vérifiées sur l'image :

- La rayure se lit : trait blanc d'environ 130 × 10 px à 10,2 s, soit 43 × 3 px à 360 px.
- Les enjoliveurs passent du brun fendu au gris argent, aussi nets que les phares.
- L'embout se lit comme une tête d'aspirateur avec son flexible annelé.
- « C'est donné. » reste entier de 4,2 à 4,8 s.
- Le compteur affiche 2 993 € à 8,1 s, sous le repère, et le repère se lit à 360 px (centré à x = 540).
- « 3 330 € » reste entier au-dessus de la bulle (16,3 et 17,2 s).
- « 2 000 → » se réécrit sur le voile sombre (28,4 s).
- Les coins du viseur restent dans la colonne (x ≈ 150 → 932 à 14,6 s).
- Son : 30 % de l'énergie sous 150 Hz (méthode de `qa_video.py` appliquée au WAV), −14,1 LUFS, −3,8 dBTP.
- Boucle : écart de 0,003 / 255 entre 30,05 s et l'image 0.

Le reste tient aussi :

- Centres d'encre mesurés : calcul x = 542, « telle quelle ? » 546, « C'est donné. » 544, « + 400 € » 542,
  « Ton samedi » 546 et « le mieux payé. » 539.
- La lumière de 16:30 se lit comme une lumière, pas comme un filtre.
- La chaîne ne coupe jamais.
- Registre de l'envie : aucun CTA, aucun logo, aucune plaque lisible, aucun visage.

**Voix (8)** : le minutage provisoire est cohérent avec le brief.

- Débit : 64 mots écrits en 30,1 s, soit 2,1 mots/s. C'est la cible du brief (≈ 65 mots pour 29,6 s) et la leçon du
  journal après le « trop rapide » de MO9. MO5 était à 2,5.
- Chevauchements : aucune réplique ne chevauche. Écart minimal : 0,15 s sur la virgule de l'ouverture ; entre deux
  phrases, 0,25 s au moins.
- Fin : la dernière réplique finit à 29,74 s, avant la fin du film (30,1 s).
- Réserve inchangée : 5,96 syllabes/s estimées, contre 5,6 dans le brief.

**Son (8)**, mesuré, pas écouté :

- Attaque dès 0 s (momentané −14,9 LUFS à 0,5 s).
- Un seul son principal à la fois (84 bruitages placés, 6 retirés pour collision).
- « + 400 € » tombe sur le premier temps de la mesure (17,283 s).
- Le silence de 18,7 à 20,4 s n'est pas un défaut : il attend « Ton samedi le mieux payé. ».

### Les trois problèmes les plus graves

1. **Les sièges, le seul coup que la voix nomme parmi les plus faibles, ne se lisent toujours pas à 360 px** (preuve :
   `mo11-r2-coups.jpg`, 8,2 s).
   - En pleine définition, les auréoles se voient : luminance 146 contre 99 pour le voile voisin. Mais elles sont
     beiges et peu saturées (156, 145, 128), alors que les phares jouent sur la couleur (222, 189, 124 contre un
     optique clair).
   - Elles flottent dans le pare-brise sans aucune forme de siège. On lit des taches sur la vitre, pas des sièges
     tachés.
   - À 360 px, ce sont trois plaques claires d'environ 25 px. La vitre latérale jaune, à droite, attire l'œil avant
     elles.
   - C'est la variable testée, et la voix dit « Les sièges. » sur ce plan.

   Corrections :
   - `scripts/dirty-mo11.py`, § 3b, couleur des taches : remplacer `c_s` (#b49c7a) par un fond saturé #c49a5c
     (`[0.769, 0.604, 0.361]`).
   - Liseré : composer `ring_m` à part en #5c4128 à 90 % et passer sa largeur de 6 à 10 (l. 218). C'est la marque
     d'eau séchée d'une vraie auréole sur du tissu.
   - Voile : l'éclaircir sur les taches avec `a = a * (1 - 0.6 * stain)` avant la composition (l. 224).
   - `film-mo11/film.js`, `COUPS.sieges` : passer `s` de 1,9 à 2,4 et `P` à [1150, 230].
   - Contrôle : `CUT=mo11 node scripts/at.mjs 7.2,8.2 renders/review/mo11-sieges.jpg`, puis réduire à 360 px. Chaque
     tache doit mesurer au moins 30 px avec son liseré visible, et la moitié sale doit se distinguer de la moitié
     propre aussi nettement que les phares.

2. **Le renversement se lit sur une voiture immobile, sans voix, et la règle des 15 % ne touche jamais la voiture**
   (preuve : `mo11-r2-renversement.jpg`).
   - Mouvement : l'orbite ajoutée au round 1 existe, mais le bord gauche de la voiture ne dérive que de 48 px en
     2,8 s (21,5 → 24,3 s). L'écart entre images à 0,1 s reste à 1,1-3,7 / 255 (médiane 1,6), et vient surtout des
     lignes de texte qui entrent.
   - Voix : elle se tait 2,26 s (22,49 → 24,75 s) pendant qu'on lit les trois règles.
   - Pare-chocs : la ligne 3, « Pare-chocs · 600 € ✗ », parle d'un défaut qu'on ne voit nulle part. Le bouclier de
     cette Clio est intact pendant tout le film. Or c'est la seule ligne qui applique la règle des 15 % à l'exemple.
   - Centrage : de 21,3 à 22,1 s, « Avant la photo 1 » est seul et centré à x = 380, et non à 540. Le `span`
     invisible de « Pas tout. » prend sa place dans la ligne. Même défaut 0,24 s sur « L'ongle glisse ? » (x = 328 à
     26,0 s) et sur « Soleil bas, » (12,6 s).

   Corrections :
   - `dirty-mo11.py` : ajouter une éraflure vectorielle sur le coin avant gauche du bouclier (polygone à relever sur
     la photo, vers x 60-300, y 820-1000), en `clio3-parechocs.svg`. Elle reste visible tout le film, photo 1 comprise.
     C'est honnête : on la vend en l'état.
   - Tracé : à `T.l[2] − 0.1`, la plume trace l'éraflure à la lumière (mêmes traits que `cLine` et `cGlow`,
     `P.pen`, 0,45 s), et le ✗ de `T.x` se répète sur le bouclier.
   - Caméra : dans `FKs`, entre `T.card + 0.1` et `T.dive2`, ajouter une clé
     `[T.l[2], { ...aim([400, 900], 1.25, 1250), rx: 3, ry: 6 }, { f: 0.5, z: 1 }]`. La voiture glisse vers le
     bouclier (150 px ou plus) au lieu de rester posée.
   - Voix, tant qu'elle n'est pas générée : ajouter « Le pare-chocs, tu le laisses. » (5 mots, vers 23,3-24,4 s) et
     couper « Quatre jours. » (deuxième coupe prévue par le brief : les palettes affichent J+4). Cela fait 67 mots, et
     le silence tombe à 0,8 s.
   - Centrage : décaler `cT1` de `+(cT2.offsetWidth + 14 × kT) / 2 × (1 − tt2)`. Même chose pour `vd1` avec `vI2`, et
     pour `sb1` avec `s2`.

3. **Le gag du hook : la bande ressemble à un film blanc collé, et « LAVE-MOI » ne se lit pas à 360 px.**
   - La bande : le reflet monte à 237 de luminance, alors que la peinture lavée est à 180 (6,25 s). À 4,3 s, la
     bande finit sur un bord vertical droit de 190 px : l'attaque arrondie de `bandPoly` n'a que 16 px de rayon. À
     360 px (3,4 et 4,5 s), on voit une feuille blanche rectangulaire sur la portière plutôt que du vernis propre.
   - « LAVE-MOI » : lettres d'environ 45 px de haut avec un trait de 6 px, à l'image 0. À 360 px, cela donne 15 px et
     2 px, gris foncé sur poussière beige. Le brief compte pourtant sur ce mot pour le verrou « Sens » à 200 px.

   Corrections :
   - `film.js`, l. 465 : reflet de `.85` à `.5`, et de `.2` à `.12`.
   - `film.js`, l. 466 : éclaircie de `.24 → .5` à `.10 → .22`. La bande prend la luminance de la peinture lavée,
     plus un reflet.
   - `film.js`, l. 135 : rayon de l'attaque de `16 * Math.sin(…)` à `70 * Math.sin(…)`, avec cinq points
     (`[0.2, 0.4, 0.6, 0.8, 0.95]`).
   - `dirty-mo11.py`, l. 168-169 : trait du doigt de 11 à 18 px, bouts de 5,5 à 9.
   - `dirty-mo11.py`, `LAVE_QUAD` (l. 75) : agrandir de 1,25 autour de son centre, soit
     `[(1375, 509), (1625, 461), (1625, 571), (1377, 646)]`.
   - `dirty-mo11.py`, l. 172 : peinture révélée de `rgb * 0.97` à `np.clip(rgb * 1.12 + 0.03, 0, 1)`.
   - Contrôle : `mo11-image0.jpg` réduite à 200 px, où l'on doit lire « LAVE ».

### Les autres problèmes

- **Le gag « une frite » n'est pas seul.** Il reste au repos de 9,0 à 9,72 s, pendant que la ligne de l'odeur traverse
  les vitres et que le compteur roule. Sept mots à lire en 0,7 s, en orange #ff8a4c sur un verre clair (la carrosserie
  grise passe à travers). C'est pourtant ce qu'on envoie. Corrections :
  - retarder la sortie, l. 654 : `gOut2 = S(st, TD[3] + 0.25, P.push)` ;
  - assombrir le verre de la carte : fond `rgba(14,11,12,.55)` sous `.glass`.
- **Débits hors de la grille.** Les notes des débits tombent à 6,676 · 7,600 · 8,523 · 9,770 · 10,520 · 11,270 s. La
  grille du mix a ses temps à x,283 et x,783 (mesure 13 à −0,717 s). Lavage et phares sont décalés de 0,107 et
  0,067 s par rapport à la croche la plus proche, et les intervalles (0,92 · 0,92 · 1,25 · 0,75 · 0,75 s) ne battent
  pas « un par temps ». Correction, après le recalage sur la vraie prise : arrondir `TD` (l. 51) à la croche,
  `G0 + 0.25 * Math.round((c.t0 + 0.72 − G0) / 0.25)` avec `G0 = 0.283`.
- **Verdict tenu sans mouvement de 26,6 à 27,8 s** (écart 0,9-1,3 / 255), et la voix se tait de 27,26 à 28,4 s : la
  poussée sur l'aile ne se voit pas. Faire passer le scintillement du polish sur les pilules et démarrer le retour de
  caméra (`LOOP`) 0,3 s plus tôt.
- **Repli du calcul, 4,9 → 5,3 s.** On voit des cellules de verre vides sous un « 2900 » fantôme, et « 2 000 » qui
  s'efface en double. C'est une image de transition (0,4 s), mais c'est la fin du hook.
- **Recul de 12,0 à 12,2 s** : le toit de la voiture passe sous le compteur et sous le repère.
- **Petits textes à 360 px** :
  - la ligne « Pare-chocs · 600 € » de la carte repliée (verdict) fait environ 10 px ;
  - la mention « Exemple · prix moyens constatés » (24 px à 55 %) fait 8 px. C'est la taille de la série (MO9 :
    26 px) ; elle se lit en arrêt sur image.
- **Ouverture B** : toujours pas construite (à faire avec la prise).
- **Hook, 0 → 2,7 s** : seuls la plume et une poussée lente bougent (écart 1,0-2,5 / 255). C'est acceptable, rien de
  nouveau ici.
- **Le flexible traverse le flanc** sur une image de planche (3,0 s), comme au round 1.

### `qa_video.py`

Pas lancé : il n'y a pas de MP4 à ce round. **Aucun FAIL** n'est relevé par les mesures de substitution :

- Zones : le détecteur de zones de `qa_video.py`, appliqué aux 38 images pleine définition, ne trouve aucun texte au
  repos dans les bandes interdites.
- WARN attendus, non bloquants :
  - la voiture et son contour dans les bandes latérales (0 → 4,75 s ; 12,4 → 14,6 s ; 20,7 s ; 29,5 → 30,1 s) ;
  - le flexible de l'embout dans la bande droite, de 3,0 à 3,7 s (densité 0,19-0,20) ;
  - les entrées de cartes déjà listées au round 1.
- Plans figés : aucun de plus de 0,9 s sur les planches. Seule la pause voulue, 18,0 → 18,7 s, est à passer en
  `--intentional 18-18.7`. Le passage 18,7 → 20,4 s (écriture lente de « Ton samedi le mieux payé. ») reste à
  vérifier sur le MP4.
- Son, sur le WAV : −14,1 LUFS intégrés, −3,8 dBTP, 30 % de l'énergie sous 150 Hz et 25,5 % entre 1 et 5 kHz. Le true
  peak après AAC reste à mesurer sur le MP4.
- Première image pleine, boucle à 0,003 / 255.

### Corrections du round 2 (9 octobre 2026)

Vérifiées sur des images rendues par `scripts/at.mjs` en pleine définition, puis réduites à 360 et 200 px : planches
`renders/review/mo11-r2fix-at.jpg` à `-at6.jpg`, preuves `renders/review/mo11-r2fix-preuves.jpg` (sièges à 8,2 s,
pare-chocs à 24,3 s, image 0 à 200 px, relais du calcul à 5,25 et 5,35 s, tracé à 23,6 s), image 0
`renders/review/mo11-image0.jpg`. Environ 120 images rendues, aucune erreur `PAGEERR` ni console. Aucun appel
ElevenLabs, `lib/kit47.js` et les fichiers de MO9 et MO10 intacts.

**1. Sièges.**
- `dirty-mo11.py` § 3b : fond des taches #c49a5c, liseré composé à part en #5c4128 à 90 % et large de 10 px, voile
  du pare-brise éclairci devant les taches. Deux réglages de plus que la consigne, après mesure : le voile tombe de
  75 % (et non 60 %) sur les taches, et le fond des taches est tracé à 235 avec une opacité de 0,95 (au lieu de 200
  et 0,85). Avec la consigne seule, la tache ne montait qu'à R − B = 54 à 360 px.
- `film.js`, `COUPS.sieges` : s 2,4, P [1150, 230].
- Mesuré : le cœur des taches vaut (180, 147, 98), contre (111, 112, 106) pour le pare-brise voisin. R − B = 82 (98
  pour les phares, 28 avant ce round). À 360 px et à 8,2 s, les taches font 27 à 52 px avec leur liseré ; la moitié lavée
  montre le siège sans tache.

**2. Renversement.**
- Voix (`vo-mo11.py`, `brief-mo11.md`, `docs/timeline-mo11.md`) : « Le pare-chocs, tu le laisses. » entre à
  23,30-24,81 s, « Quatre jours. » sort du texte avant la génération (les palettes affichent J+4). On passe à 67 mots
  écrits et 510 caractères. Le film dure 30,15 s, la boucle part à 27,83 s. Le silence du renversement tombe à
  0,81 s (22,49 → 23,30). La bulle et le 2e message se calent sur « Quatre cents » (− 1,0 s et − 1,25 s) et gardent
  leurs instants (15,90 et 15,65 s). Sous-titres refaits (`scripts/srt-mo11.py`, 15 cartons).
- `dirty-mo11.py` : nouveau calque `clio3-parechocs.png`, la lèvre basse du coin avant gauche frottée sur une bordure
  (x 30 → 280) : vernis abrasé, stries, plastique noir à nu au coin, bord de vernis éclaté. C'est un raster et non un
  SVG : le premier essai vectoriel se lisait comme un éclair collé qui débordait de la silhouette. Le calque passe
  au-dessus de la poussière et entre dans la photo 1 (on la vend en l'état).
- `film.js` : à `T.pc` = `T.l[2]` − 0,1 s (23,41 s), la plume entoure l'éraflure (traits de `cLine` et `cGlow`,
  `P.pen`). Le ✗ se répète sur le bouclier en même temps que celui de la carte, sur « tu le laisses » (`T.x` =
  24,23 s). Le tracé s'éteint à la plongée sur l'aile.
- Caméra : la clé part à `T.l[1]` (23,01 s), vise [360, 920] à × 1,3, rx 3, ry 6, f 0,7. La clé proposée (à `T.l[2]`,
  f 0,5) bougeait la voiture après le tracé : au rendu, l'avant ne glissait que de 50 px pendant que la plume
  dessinait. Écart entre images à 0,2 s, de 22,4 à 24,8 s : 3,1 · 2,1 · 2,4 · 8,5 · 9,7 · 10,2 · 7,4 · 5,1 · 2,9 · 2,0 ·
  1,4 · 1,0 / 255. L'avant de la voiture se déplace d'environ 250 px.
- Centrage : `cT1`, `vd1` et `sb1` se décalent de la moitié de la largeur de leur 2e moitié, marge réelle comprise
  (14, 12, 12 px), tant que celle-ci n'est pas entrée. Vu centrés : « Avant la photo 1 » à 21,4 s, « L'ongle glisse ? »
  à 26,4 s, « Soleil bas, » à 12,65 s.

**3. Gag du hook.**
- `film.js` : reflet de la bande .85 → .5 et .2 → .12, éclaircie .10 → .22. L'attaque fait 70 px, en cinq points ; la
  partie droite finit 30 px avant l'embout, pour que le bout arrondi reste sous la tête tant qu'elle avance. À 3,4 et
  4,3 s, la bande se lit comme du vernis lavé, avec un bout arrondi.
- « LAVE-MOI » : quadrilatère × 1,25, trait de 18 px, bouts de 9. **Écart à la consigne** : la peinture éclaircie
  (× 1,12 + 0,03) donnait 0,41 de luminance dans les lettres, contre 0,37 à 0,58 pour la poussière pâle du haut de la
  portière, et le mot disparaissait à 360 px. Les lettres gardent donc la peinture sombre (× 0,86, environ 0,29), et
  le doigt écrit dans une plaque de poussière épaisse et claire (environ 0,64), tirée à part pour ne pas changer les
  autres calques. Sur l'image 0 réduite à 200 px, on lit « LAVE-MOI ».

**Les autres points.**
- Gag « une frite » : fond `rgba(14,11,12,.55)` sous le verre, sortie à `TD[3]` + 0,25 s. La sortie sur `P.push`
  laissait la carte sur la rayure à 10,2 s : elle descend donc de 80 px quand la caméra arrive sur l'aile, puis sort
  vers la gauche sur un ressort vif. Lisible et seule de 9,0 à 9,8 s, partie à 10,2 s.
- Débits sur la croche : `TD = T.big + 0,25 × round((t0 + 0,72 − T.big) / 0,25)`. La grille vient de « + 400 € »
  (17,283 s) au lieu d'être recopiée, et suivra la prise. Débits à 6,783 · 7,533 · 8,533 · 9,783 · 10,533 · 11,283 s.
  `audio-mo11.py` : le ponçage des phares part 0,1 s plus tard, sinon le débit du lavage (6,783 s) le faisait retirer
  pour collision.
- Verdict : orbite plus large (ry 4,5 → 8, visée [1272, 628] à × 2,85, soit 1,58 pixel d'écran par pixel de photo),
  lustre qui passe sur la pilule « Polish », retour de caméra 0,45 s avant la boucle. Écart entre images à 0,1 s,
  de 26,5 à 27,9 s : 3,4 · 3,8 · 3,2 · 2,4 · 1,9 · 1,6 · 1,2 · 1,2 · 1,1 · 1,1 · 2,4 · 3,2 · 3,9 · 8,6 / 255 (avant :
  0,9 à 1,3 pendant 1,2 s).
- Repli du calcul : au passage de relais, le ressort du repli n'était qu'à 0,875. Il atteint 1 en 0,44 s, la cible
  des chiffres remonte de 9,5 px (écart mesuré : 9,6 px), le relais dure 0,06 s, les cellules se tracent à + 0,2 s
  (plus de verre vide), et « 2 000 » sort en 0,27 s. À 5,25 s, les chiffres en vol tombent à 1 px près sur ceux du
  compteur (5,35 s).
- Recul de 12,0 s : clé de caméra y 985 → 940, s 1,0 → 0,97 ; pendant le recul, le voile du haut suit l'échelle dès
  1,0.
- Mention à 26 px, la taille de MO9 et MO10.
- `timeline-mo11.json` : durée 30,1 → 30,15 s, celle que lit `scripts/render.mjs`.
- `scripts/events.mjs` et `audio-mo11.py` relancés : −14,2 LUFS, −3,8 dBTP, 84 bruitages placés et 7 retirés pour
  collision. Selon la méthode de `qa_video.py`, 30 % de l'énergie sous 150 Hz et 25,4 % entre 1 et 5 kHz. L'arrêt de
  bande tombe à 0 ms de « + 400 € », la reprise à −3 ms.
- Boucle : 0,013 / 255 entre 30,133 s et l'image 0 (moyenne sur les JPEG pleine définition, maximum 16 sur quelques
  pixels).
- Calques : `clio3-phares.png`, `clio3-vitres.png`, `clio3-rayure.svg` et les deux SVG d'enjoliveurs sont identiques
  octet pour octet à ceux d'avant ce round (tirages à part pour tout ce qui est nouveau).

### Ce qui reste après le round 2

- Ouverture B : à construire avec la prise de Simon.
- Pendant le verdict, la ligne « Pare-chocs · 600 € » de la carte repliée fait environ 10 px à 360 px.
- De 27,1 à 27,5 s, le verdict reste à 1,1-1,2 / 255 entre deux images (0,4 s).
- Relais du calcul : le « 9 » bouge de quelques pixels sur l'image du relais (5,3 s).
- Vers 11,95 s, le toit passe encore 0,1 s sous les palettes, sous le voile.
- À 9,9-10,05 s, le bas de la carte « une frite » touche le bas de la ligne de la rayure. L'éraflure reste visible.
- Le flexible de l'embout traverse le flanc (3,0 s) ; le hook de 0 à 2,7 s ne bouge pas plus qu'avant (jugé
  acceptable).
- Les planches à 0,1 s ne sont pas refaites à ce round (machine partagée) : contrôles faits sur environ 120 images
  ciblées. À faire sur le MP4 : `qa_video.py`, true peak après AAC, plans figés.
- Voix : le texte à générer change (510 caractères). Toujours une seule génération, quand l'utilisateur aura débloqué
  ElevenLabs.

## Critique, round 3 (9 octobre 2026, relecture extérieure, film non modifié)

Jugé sur `film.js` de 18:03 (minutage provisoire, piste de voix muette, mix de 17:59), après les corrections du
round 2. Regardé image par image :

- planches 0,1 s refaites : `renders/review/mo11-planche-0.1s-0-10.jpg`, `-10-20.jpg`, `-20-30.2.jpg` (302 images, aucune
  erreur `PAGEERR`), lues par tranches de 2 s ;
- test téléphone sur 12 instants : `renders/phone-mo11.png` (0 · 3,4 · 4,5 · 6,15 · 8,2 · 9,3 · 10,15 · 13,6 · 16 ·
  17,8 · 23,9 · 26,9 s) ;
- 36 images pleine définition : `renders/stills-mo11/t*.png` (0 → 30,13 s) ;
- montage 540p avec le son : `renders/draft-mo11-9x16.mp4`, mesuré par `qa_video.py` (`renders/qa-mo11/`) ;
- preuves : `renders/review/mo11-r3-tuile.jpg` (21,5 → 22,2 s), `mo11-r3-vente.jpg` (14,8 → 16,8 s),
  `mo11-r3-chute.jpg` (19,5 → 20,5 s).

### Notes

| Hook | Lisibilité 360 px | Zones sûres | Mouvement | Variété / rythme | Marque | Voix (provisoire) | Son | Recette 47 / envie |
|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 8 | 8 | 8 | 8 | 8 |

Corrections du round 2 vérifiées sur l'image :

- Sièges : à 8,2 s, les auréoles se voient à 360 px (plaques ocre de 30 à 50 px avec leur liseré), la moitié lavée
  montre le pare-brise net et le siège derrière. La lisibilité passe à 8.
- Renversement : l'éraflure du bouclier se voit dès l'image 0 et dans la photo 1. La plume l'entoure (23,4 → 23,9 s)
  et le ✗ s'y répète sur « tu le laisses » (24,3 s). La voiture glisse vers le bouclier de 23,0 à 24,0 s (écart
  entre images de 5,0 à 7,2 sur la planche, contre 1,1 à 2,6 de 21,4 à 22,9 s).
- Centrage : « Avant la photo 1 » seul à 21,4 s, « L'ongle glisse ? » à 26,3 s et « Soleil bas, » à 13,0 s sont sur
  x = 540.
- Hook : la bande laissée par l'embout se lit comme du vernis lavé à 3,4 et 4,3 s. « LAVE-MOI » se lit à 360 px et sur
  l'image 0 réduite à 200 px.
- Carte « une frite » : seule et lisible de 9,0 à 9,8 s, elle descend et sort à gauche sans couvrir la rayure (partie
  à 10,2 s).
- Verdict : le lustre passe sur « Polish · 15 € », « Carrossier · 300 € » se barre à 27,1 s, et la caméra repart à
  27,4 s.
- Boucle : 30,1 s contre l'image 0, 0,47 / 255 sur les JPEG de 270 px (le bruit du JPEG compris).

**Voix (8)**, minutage provisoire cohérent avec le brief :

- Débit : 67 mots écrits en 30,15 s, soit 2,2 mots/s. Si on compte « 2 000 » et « 2 900 » tels qu'on les dit, on
  arrive à environ 2,4 mots/s (MO5 : 2,5). Parole : 17,6 s, soit 3,8 mots/s pendant qu'il parle.
- Chevauchements : aucun. Écart minimal : 0,15 s sur la virgule de l'ouverture. Entre deux phrases : 0,25 à 0,30 s.
- Fin : « Quinze euros de polish. » finit à 27,43 s, avant le départ de la boucle (27,83 s). « La prochaine fois que
  tu te dis… » finit à 29,77 s, avant la fin du film (30,15 s).

**Son (8)**, mesuré, pas écouté :

- Mix encodé en AAC 256 k, 48 kHz, avec les réglages de `render.mjs` : −14,2 LUFS, −3,8 dBTP, 30 % de l'énergie sous
  150 Hz et 25,4 % entre 1 et 5 kHz.
- Chaque bruitage de `docs/mix_report-mo11.txt` a été comparé à son geste sur la planche : jet sur la ligne du lavage
  (5,96 s), ponçage des phares (6,98), aspiration humide (7,80), quatre pièces sur la carte « trouvé » (8,83 → 9,04),
  souffle de l'odeur (9,18), polish (9,93), clac de l'enjoliveur (10,75), déclic (14,52), palettes, messages,
  « + 400 € » sur le premier temps (17,283), rembobinage (20,40), « Pas tout. » (22,12), ongle (25,32), barre du
  carrossier (27,06). Tous tombent sur leur geste, sauf un (voir « Les autres problèmes »).

### Les trois problèmes les plus graves

1. **Une tuile de la voiture est dessinée hors de sa place de 21,7 à 22,1 s**, pendant la carte « Avant la photo 1 »
   (preuve : `mo11-r3-tuile.jpg`).
   - Sur cinq images de suite de la planche, un bloc d'environ 35 × 50 px (soit environ 140 × 200 px en pleine
     définition) apparaît sous le bouclier, puis sur son coin gauche, puis de nouveau sous le bouclier.
   - Une recherche du bloc dans l'image de 21,5 s le retrouve : c'est l'aile avant avec la rayure blanche et le haut du
     passage de roue.
   - Le défaut est nouveau : il n'existe pas sur la planche de 17:15 (`mo11-planche-0.1s-20-30.1.jpg`, film d'avant les
     corrections du round 2).
   - C'est la même famille que la tuile du hook corrigée au round 1 : en rendu séquentiel, sous la caméra 3D, le
     compositeur logiciel recopie une tuile ailleurs. Au round 2, la pile des calques de `C.body` a changé : un calque
     `<img>` plein cadre, `parechocs`, toujours visible, s'est ajouté. C'est le suspect principal.

   Corrections :
   - L'éraflure ne change jamais pendant le film, donc elle n'a pas besoin d'un calque à elle. Dans
     `scripts/dirty-mo11.py`, composer `clio3-parechocs.png` dans `assets/photos-mo11/car-clio3.png` (la base, d'où
     sortent aussi `C.gold` et la photo 1) et dans `clio3-poussiere.png` (pour qu'elle reste au-dessus de la poussière
     à l'image 0, comme aujourd'hui).
   - `film-mo11/film.js` : retirer `['parechocs', A + 'clio3-parechocs.png']` de la liste `layers` de `E.car(...)`, et
     retirer `c.drawImage(C.L.parechocs, x, y, w, h)` du bloc `photo`.
   - Contrôle : `CUT=mo11 node scripts/sheet.mjs 21 23`, puis `CUT=mo11 node scripts/render.mjs --range 21.6,22.2`
     (rendu séquentiel pleine définition, le chemin du rendu final). Aucune tuile ne doit apparaître de 21,6 à 22,2 s.
     L'image 0 doit rester identique, à 0,1 / 255 près.
   - Si la tuile reste, faire la même chose avec la rayure : la tirer en PNG à pleine résolution dans `dirty-mo11.py`
     au lieu du SVG servi en Blob. Un SVG dans un `<img>`, sous une perspective, est rastérisé de nouveau à chaque
     échelle.

2. **Pendant chaque coup, la notification affichée est celle du coup d'avant.** Le prix n'est jamais à côté de son
   avant / après, alors que c'est la variable testée.
   - Le débit tombe quand la ligne a fini (`TD` ≈ `t0` + 0,72 s, arrondi à la croche), et la carte met encore 0,2 à
     0,3 s à se poser. Mais la caméra part vers le coup suivant entre `t0` + 0,37 et `t0` + 0,87 s (clé `t0 − 0,38` du
     coup suivant). Chaque carte arrive donc sur l'image du coup d'après.
   - Ce qu'on voit, images à l'appui : à 7,15 s, les phares sont coupés en deux sous « Lavage · − 8 € » ; à 8,2 s, les
     sièges sous « Phares · − 25 € » (alors que la voix dit « Les sièges. ») ; à 9,3 s, les vitres sous « Sièges ·
     − 30 € » ; à 10,15 s, la rayure sous « Odeur · − 15 € » ; à 10,9 s, les enjoliveurs sous « Rayure · − 15 € ».
   - Pour un spectateur sans le son, les trois coups que la voix nomme reçoivent leur prix quand le mot finit, sur
     l'image suivante.

   Corrections :
   - `film-mo11/film.js`, `TD` : faire tomber le débit pendant l'arrêt de la ligne, sur le temps qui suit :
     `TD = COUPS.map((c) => T.big + 0.25 * Math.ceil((c.t0 + 0.32 - T.big) / 0.25))`.
   - Cela donne 6,283 · 7,283 · 8,283 · 9,533 · 10,283 · 11,033 s. Chaque carte tombe dans l'arrêt de son coup (6,16-6,46 ·
     7,08-7,38 · 8,00-8,30 · 9,25-9,55 · 10,00-10,30 · 10,75-11,05), sur un temps de la grille, au moins 0,28 s
     après le bruitage d'outil du coup (pas de collision dans `audio-mo11.py`). « Les sièges. » (8,13 s), « L'odeur. »
     (9,25 s) et « Les enjoliveurs. » (10,92 s) ont leur carte pendant le mot.
   - `TI`, `T.leaveN` et `T.pose` suivent seuls. Le compteur se pose 0,25 s plus tôt (11,98 s).
   - Relancer `CUT=mo11 node scripts/events.mjs` puis `python3 scripts/audio-mo11.py`. Le scintillement de la rayure
     (10,30 s, p3) sera retiré par la note du débit (10,283 s, p1). C'est accepté.
   - Contrôle : `CUT=mo11 node scripts/at.mjs 6.4,7.35,8.3,9.55,10.3,11.05 renders/review/mo11-coups-prix.jpg`. Sur
     chaque image, la carte doit porter le nom du coup coupé en deux.

3. **La vente se joue sans voix et finit sur un plan immobile.** De 14,80 à 16,90 s, la voix se tait 2,1 s : c'est son
   plus long silence avant la pause. De 16,2 à 16,7 s, rien ne bouge (preuve : `mo11-r3-vente.jpg`).
   - Sur la planche, l'écart entre images est de 1,3 à 2,1 / 255. C'est le plus bas du récit en dehors de la pause
     voulue : les coups sont entre 4 et 25, le soleil entre 3 et 9.
   - « Quatre jours. » est sorti du texte au round 2. Depuis, J+4, les deux messages et l'offre passent sans un mot, au
     moment où MO5 disait « Il négocie. Tu acceptes. ».
   - Le compteur reste à 3 330 € pendant que l'acheteur écrit « 3 300 et je la prends. ». Il se fond ensuite dans
     « + 400 € », sans avoir montré le prix de vente. Le calcul 3 300 − 2 900 ne se fait que si on a lu la bulle.

   Corrections :
   - `film-mo11/film.js`, `price(st)` : ajouter un septième terme,
     `- 30 * Math.min(1, spring(st - (T.bubble + 0.3), { f: 1.3, z: 1 }) / 0.985)`. Le compteur roule de 3 330 à
     3 300 sur l'offre (16,2 → 16,7 s), puis c'est ce 3 300 qui se fond dans « + 400 € ».
   - Ajouter `T.bubble + 0.3` aux impulsions de `glowH` (`imp`). Le rembobinage repasse par 3 330 sans autre
     changement, parce que `price` lit le temps du récit.
   - `scripts/audio-mo11.py` : une impulsion (1054, p3) à `bubble` + 0,3 s. Pas de son « le compteur se pose » : à
     `bubble` + 0,75 s, il tomberait sur le virement (16,66 s, p2).
   - `brief-mo11.md`, tableau du compteur : « 16,2 → 16,8 s : 3 300 €, l'offre acceptée ».
   - Voix : le texte n'est pas généré, on peut encore le changer. Si la prise laisse de la marge sous 31,5 s, remettre
     « Quatre jours. » (2 mots, coupé au round 2). Sinon, l'image seule suffit.
   - Contrôle : écart entre images à 0,1 s, de 16,2 à 16,7 s, au-dessus de 3 / 255 sur la planche.

### Les autres problèmes

- **Les auréoles des sièges sont posées sur la vitre.** Au round 2, le voile du pare-brise a été éclairci de 75 % sur
  les taches. Elles passent donc devant la vitre poussiéreuse, au lieu d'être vues à travers. À l'image 0, ces trois
  plaques ocre sont l'élément le plus saturé après « telle quelle ? ». À 23,9 s, elles dépassent du bord droit de la
  carte. Correction dans `dirty-mo11.py` § 3b : éclaircissement du voile de 0,75 à 0,5 ; sous les taches, un dossier
  de siège en tissu sombre (#2e2a27 à 55 %, rectangle arrondi derrière la vitre passager), pour qu'elles se posent sur
  du tissu. Garder R − B ≥ 60 à 360 px.
- **Le bout gauche de la bande du hook est un bord droit.** De 3,0 à 6,4 s, la bande commence par un bord vertical
  net à x = 1 150 (`BAND.x0`). À 6,15 s, sur la moitié encore sale du lavage, elle se lit comme un rectangle collé.
  Correction : dans `bandPoly`, quand `xs` vaut `BAND.x0`, arrondir aussi la queue (miroir de l'attaque : cinq points
  sur un demi-cercle de 70 px à gauche de `xs`). Quand la ligne du lavage passe, `xs` suit la ligne et le bord droit
  est la ligne elle-même.
- **Bruitage en retard sur le tracé du pare-chocs.** « La plume entoure l'éraflure » sonne à 23,66 s, 0,25 s après
  le début du tracé (`T.pc` = 23,41 s) : l'ornement de la règle 3 (23,51 s, p2) le bloque. Correction dans
  `audio-mo11.py` : le tracé à `pc` − 0,02 s en p2 ; l'ornement de la règle 3 passe en p3 ou sort (la règle entre
  0,1 s après le tracé).
- **La chute ne bouge que par ses lettres.** « Ton samedi le mieux payé. » est entière de 20,0 à 20,4 s (0,4 s, autant
  que « Même pas un plein. » dans MO5). Mais de 18,7 à 20,3 s, c'est le passage le plus immobile en dehors de la pause
  voulue : 0,6 à 1,0 / 255 sur la planche. Correction : poussée de `big4` de 0,05 à 0,12, `L4` qui monte de 24 px avec
  `push`, et pas de `writeW` de 0,04 à 0,03 pour `pay2`.
- **La fente de « C'est donné. » coupe le bas de « 2 000 »** à 3,7 s : ses rectangles vont de y = 430 à 630, et la
  ligne de base des chiffres est à 452. Correction : rectangles à y −110 et −100, hauteurs 160 et 140.
- **Passages de 0,1 à 0,2 s** : à 12,6-12,7 s, « Soleil bas, » entre sur le toit ; à 29,5 s, le contour du toit
  traverse « telle quelle ? » pendant le retour de caméra.
- **Hook, 0 → 2,6 s** : seules la plume et une poussée lente bougent (1,0 à 2,6 / 255 sur la planche). Inchangé,
  accepté au round 2.
- **À 360 px**, pendant le verdict, les lignes de la carte repliée font environ 9 px (26,9 s). Les pilules font
  13 px et se lisent.
- **Ouverture B** : pas construite (à faire avec la prise de Simon).

### `qa_video.py`

**Aucun FAIL.**

Mesuré d'abord sur un montage de substitution, sans Chromium : les 302 images des planches (10 i/s) agrandies en
540 × 960, avec le mix encodé comme dans `render.mjs` (AAC 256 k, 48 kHz).

- Première image pleine (écart-type 55,6). Aucune image vide.
- Aucun plan figé de plus de 0,9 s (pause voulue passée en `--intentional 18-18.7`).
- −14,2 LUFS et −3,8 dBTP après AAC. Son des 2 premières secondes : −15,7 LUFS momentané contre −14,3 sur le reste.
- Équilibre téléphone : 30 % de l'énergie sous 150 Hz, 25,4 % entre 1 et 5 kHz.
- Zones : WARN seulement, tranchés sur la planche des zones. Ce sont la voiture et son contour dans les bandes
  latérales (0 → 5,75 s, 12,0 → 15,0 s, 28,5 → 30,0 s), le flexible de l'embout (3,0 → 3,7 s), et les cartes qui
  entrent ou sortent par les côtés (notifications, messages, bulle à 16,0 s, virement à 16,9 s, carte « une frite » à
  10,15 s). Aucun texte au repos dans une bande interdite. Le détecteur de zones, appliqué aux 36 images pleine
  définition, donne le même résultat.
