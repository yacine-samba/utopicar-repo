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
