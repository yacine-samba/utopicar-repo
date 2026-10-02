# Direction artistique, formats et construction (phases 3 et 5)

## 1. Étudier une référence (grammaire seulement)

1. Récupérer le fichier : `yt-dlp` pour les liens publics dans `video/refs/<ref>/` (ignoré par git). Lien privé ou
   exigeant une connexion (Vimeo privé, compte X) : demander à l'utilisateur de déposer le fichier (et ses sous-titres
   s'il les a). Ne jamais contourner l'accès.
2. **Analyse image par image** (outil par défaut) :
   `python3 scripts/ref-frames.py refs/<ref>/<video>.mp4 --step 0.1` (langue de la voix détectée ; copie dans
   `scripts/` du skill).
   Chaque image est lue à sa cadence native (1/60 s pour du 60 i/s) : coupes à l'image près, **scènes enchaînées sans
   coupe** (flou, zoom, traversée), nature de chaque
   transition (franche, flash, glissée, transition sur N images), mouvement de caméra par plan (px/s), couleur
   dominante ; planches toutes les 0,1 s (une ligne = 1 s, ✂ aux coupes) ; bande −4…+4 images autour de chaque coupe ;
   voix mot à mot (faster-whisper) avec hauteur (Hz, plage en demi-tons), énergie, débit et pauses par phrase ;
   bruitages (onsets percussifs classés whoosh / grave / aigu / médium, sur la voix ou dans les trous) ; tempo,
   loudness. Sorties : `refs/<ref>/analysis/{report,shots,audio}.md`, `frames.csv`, `words.json`, `sheets/`, `cuts/`.
   `analyze-ref.py` (0,5 s) ne sert plus qu'au survol rapide d'une référence longue.
3. **Regarder réellement** : toutes les planches 0,1 s, chaque bande de coupe, puis les images clés en pleine
   définition. Les chiffres disent *où* regarder ; seule la lecture des images dit *ce qui se passe* (un « mouvement »
   peut être un zoom, un masque, un texte qui défile). Comparer la transcription aux sous-titres fournis.
4. Écrire le **style guide** en deux tableaux mesurés :
   - « ce que fait la référence » : ouverture 0–3 s (image 0, premier mot, premier son), durée moyenne et médiane des
     plans, transitions et leurs durées en images, caméra, typo et animation des lettres, éléments graphiques, palette,
     voix (débit, hauteur, pauses, ton, rires et réactions), bruitages par type et leur position par rapport aux mots,
     musique (tempo, place sous la voix) ;
   - « adaptation au produit » : la même grammaire avec nos images, nos mots, nos sons.
   Rien de la référence n'entre dans le film : ni logo, ni texte (même une tournure : « À nous de changer ça » a été
   réécrit en « Il est temps de compter juste »), ni image, ni son, ni gag repris tel quel.

### Sans référence : proposer un motion original « full smooth »

Quand l'utilisateur n'a pas de référence, ne pas copier une tendance : proposer **deux directions originales** sous
forme de planche (3 images clés chacune, rendues) et laisser choisir. Socle commun d'un film fluide :
- une caméra continue (le cadre ne saute jamais sans raison : dérive lente, poussée, raccords dans le mouvement —
  un élément du plan A devient le support du plan B) ;
- des springs fermés partout, aucune entrée linéaire, aucune opacité seule ;
- 2–4 s par idée, une nouveauté visuelle toutes les 1–2 s dans le hook ;
- une couleur d'accent, une police display, un fond qui vit (grain léger, dégradé lent, formes qui respirent) ;
- le son dessine le mouvement : un whoosh par grand déplacement, un impact par chiffre, un clic par action.
Le dire clairement : « direction originale, pas d'après une référence ».

## 2. Style guide, shotlist, storyboard

- Style guide : accent unique justifié, fonds, typo (une police display + une UI, ou une seule comme Archivo),
  tailles par format, curseur, transitions, son, zones sûres.
- Shotlist minutée **sur la voix** (horodatages Scribe) et la grille musicale : chaque idée commence sur un temps fort,
  une nouveauté toutes les 2–4 s, jamais deux plans identiques d'affilée (la v5 répétait 3 × « chapitre → démo →
  chiffre »).
- Storyboard **rendu** : une image clé par plan (`render.mjs --phone t1,t2,…`) dans les 3 formats, montré à 360 px de
  large. C'est la porte 3.

## 3. Formats et zones sûres

| Format | Taille | Usage | Zone interdite aux textes / logos / CTA |
|---|---|---|---|
| Vertical 9:16 | 1080×1920 | TikTok, Reels, Shorts, Stories | haut 220, bas 440, gauche 60, droite 140 px (union TikTok/Reels ; boutons à droite, légende en bas) |
| Square 1:1 | 1080×1080 | Feed Meta, LinkedIn | 60 px partout |
| Desktop 16:9 | 1920×1080 | YouTube, site, LinkedIn, présentation | titre 5 % (96 × 54 px), bas 108 px (barre de lecture, sous-titres) |
| Feed 4:5 (option) | 1080×1350 | Feed Meta | 60 px partout, bas 120 |

**Centrer sur l'axe de l'écran, jamais sur le centre de la zone sûre.** En 9:16, la zone sûre (60 → 940) a son centre à
x = 500 : y centrer les éléments les décale de 40 px vers la gauche, ce qui se voit tout de suite sur un téléphone (retour
utilisateur : « tout est décalé à gauche, c'est bâclé »). Règle : centre x = 540 et colonne symétrique 140 → 940
(800 px utiles) pour tout ce qui est centré (textes, cartes, logo, CTA). Mesurer le centre de l'encre de chaque bloc
(écart toléré ± 4 px) sur les images réellement rendues.

**Recomposer, ne pas recadrer.** Un 9:16 recadré en 16:9 perd tout. Le film lit `?fmt=` et place chaque élément avec
des repères propres au format :
```js
const FMT = new URLSearchParams(location.search).get('fmt') || 'vertical';
const SZ = { vertical: [1080, 1920], square: [1080, 1080], desktop: [1920, 1080] }[FMT];
const SAFE = { vertical: { t: 220, b: 440, l: 60, r: 140 }, square: { t: 60, b: 60, l: 60, r: 60 }, desktop: { t: 54, b: 108, l: 96, r: 96 } }[FMT];
const U = Math.min(SZ[0], SZ[1]) / 1080;          // unité typographique : 88 px → 88 * U
// zone utile : x ∈ [SAFE.l, W − SAFE.r], y ∈ [SAFE.t, H − SAFE.b] ; centre optique ≈ 45 % de la hauteur utile
```
- Vertical : empilement (titre au-dessus, UI au centre, CTA sous l'UI).
- Square : UI plus petite, titre et chiffre côte à côte ou superposés serrés.
- Desktop : deux colonnes (texte à gauche, UI à droite), chiffres géants à gauche, curseur plus petit.
- Tailles de texte mesurées **sur le texte lui-même** (range / span inline), jamais sur un bloc pleine largeur —
  c'est le bug `fit()` qui a laissé « 14 820 € » et le CTA sous les boutons TikTok.

## 4. Architecture du film (contrat de rendu)

- `window.seek(t)` peint la frame `t` : aucune transition CSS, `setTimeout`, `requestAnimationFrame`, ni état conservé
  entre frames ; bruit seedé (`Motion.noise`), jamais `Math.random()`. Pas de `will-change`, `translate3d`, `translateZ(0)`.
- `timeline-<projet>.json` : durée, fps, BPM, repères (`marks`), `cues` (effets sonores, `beat: true` pour ceux
  vérifiés par `sync.mjs`), textes par langue et par ouverture, `reviewKeys`, `poster`.
- Paramètres `?fmt=&lang=&hook=` : l'ouverture B remplace les plans 0–3 s puis rejoint le même corps.
- Réutiliser `video/lib/motion.js` (springs fermés `snappy` / `default` / `heavy`, `track`, `indicator`, `swapAlpha`)
  et `video/lib/kit.js` (curseur, texte lettre à lettre, surligneur, cartes détourées, `place`).
- Rendu : `CUT=<projet> FMT=<vertical|square|desktop> VLANG=<fr|en> HOOK=<A|B> node video/scripts/render.mjs --all`
  → `renders/<9x16|1x1|16x9>-<projet>-<hook>-<lang>.mp4` ; audio pris dans `audio/mix-<projet>-<lang>.wav`.
  Modes de contrôle : `--at`, `--range`, `--sheet`, `--strip`, `--phone`, `--draft` (540p).
- WebGL (Three.js) possible via SwiftShader (`--use-angle=swiftshader`), mais ≈ 3× plus lent : DOM/CSS + perspective
  CSS suffisent pour la plupart des plans.

## 5. Règles d'animation (le studio)

- Springs : `snappy` boutons et indicateurs, `default` cartes et conteneurs, `heavy` gros textes et logos, `playful`
  seulement pour une mascotte. Pas de rebond visible sur la typographie. `track()` pour toute valeur à plusieurs cibles.
- Une opacité seule n'est jamais une entrée ni une sortie : elle accompagne un déplacement, une échelle, un tracé.
- Interdits : titre centré sur un dégradé, tout en fondu, étiquettes dans les coins, glow sur l'UI, particules
  génériques, fondus enchaînés, spins / glitches / light leaks sans raison, temps mort.
- Chaque plan démarre **avec** un élément visible à la frame de coupe (la v5 avait une grille vide à chaque coupe).
- Un texte sort **avant** la coupe (ou est coupé net à la coupe) — sinon il fantôme sur le plan suivant (vu sur le flash
  orange de la v5).
- Une démo est crédible pas à pas : on remplit le champ, puis on clique ; on montre la ligne qui compte en gros plutôt
  que la carte entière illisible à 360 px ; le curseur guide l'œil vers le chiffre, un surligneur le confirme.
- Logo et CTA : jamais de même couleur que leur fond (tuile sombre sur fond sombre = invisible) ; un seul élément
  d'accent sur le carton final.
- Pas de flash de luminosité plein cadre répété ni de grands aplats blancs flous qui clignotent (explosion v5).

## 6. Vraie interface

- Charger la vraie page (Playwright), polices servies localement (sinon Chromium remplace la police), données démo,
  horloge figée ; capturer des calques (élément + marge), masquer les éléments fixes (barre, dock) pendant la capture,
  capturer le verre en PNG transparent et recréer `backdrop-filter` dans le film.
- Détourer les cartes (retirer la marge de page grise, rayons réels) ; placer via un conteneur qui a la taille de son
  contenu (un conteneur de taille nulle décentre tout — bug v5).
- Masquer toute mention de plateforme tierce (placeholder « leboncoin » du champ lien).
