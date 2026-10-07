# Boîte à techniques (MO1 → MO6)

Chaque technique ici a servi dans un film livré ou validé. Code de référence : `video/film-mo5/film.js` (MO5 « 47 € »)
et `video/film-mo6/film.js` (MO6 « Ce qui se voit, ce qui se cache »). On copie la recette, on change le contenu.
Les règles de fond restent dans `fluidite.md` (mouvement permanent), `motion-craft.md` (contrat de rendu) et
`codes-attention.md` (vidéos sans produit).

## Sommaire

1. Squelette d'un film
2. Caméra
3. Écrire à la lumière
4. Choses qui se construisent
5. Verre, lueur, profondeur
6. Photo réelle dans le film
7. Révélations et raccords
8. Étiquettes reliées aux objets
9. Vidéos réelles
10. Boucle parfaite
11. Rendu et contrôle
12. Voix
13. Son
14. Pièges de code rencontrés

---

## 1. Squelette d'un film

- **Un objet de minutage `K`** en tête de fichier : chaque geste lit `K.xxx`. Après la voix, on ne recale que `K`
  (MO6). Les écarts entre gestes s'écrivent `K.foo + 0.3`, jamais en dur ailleurs.
- **Helpers** (copier depuis MO6) :
  - `S(t, t0, preset)` : spring lancé à `t0` ;
  - `sm(a, b, t)` : smoothstep, pour les fondus d'accompagnement ;
  - `eo(a, b, t)` : sortie cubique, pour une arrivée qui doit **finir exactement** (boucle) ;
  - `fade(t, a, b, c, d)` : entrée puis sortie ;
  - `set(el, o)` : opacité **et** `visibility:hidden` sous 0,002. Un élément en verre invisible sort du calcul :
    gain de rendu majeur avec `backdrop-filter`.
- **Presets de springs maison** (en plus de `snappy/default/heavy`) : `pen {f:1.05,z:1}` (trait qui avance), `draw
  {f:1.35,z:1}` (contour d'une lettre), `rise {f:1.9,z:1}` (remplissage qui monte), `card {f:2.2,z:0.78}` (carte qui
  arrive avec un soupçon de dépassement), `pop {f:2,z:0.72}` (pastille), `roll {f:1.7,z:0.95}` (rouleau de compteur),
  `cam {f:0.85,z:1}` (travelling), `camS {f:0.6,z:1}` (grand recul), `soft {f:0.32,z:1}` (dérive lente).
- **Temps du récit ≠ temps du film** (MO5) : `story(t)` avance, puis rembobine (ease cubique in/out) jusqu'à un état
  passé. Tout ce qui appartient au récit lit `st = story(t)` ; les titres lisent `t`.
- **Couches** : fond → monde (caméra) → voile → textes → étiquettes → compteur → cartes → overlays (loupe, cadrans)
  → mention → éclair → grain → vignette. Une couche par rôle, empilées dans cet ordre.

## 2. Caméra

**Point focal (MO6)**. Le monde est un `div` 1080×1920, `transform-origin:0 0`. La caméra amène un point du monde
`(x, y)` au point focal de l'écran `(540, FY)` :

```js
const camTf = (c) => `translate(540px,${FY}px) perspective(1700px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) scale(${c.s}) translate(${-c.x}px,${-c.y}px)`;
```

- Chaque axe (`x, y, s, rx, ry`) est un `track(t, KEYS.axe)` : un changement de cible = un spring.
  On vise des **points nommés** de l'objet (`PT.phare`, `PT.rayure`…).
- **Placer le sujet sous le texte** : pour qu'un point apparaisse à l'écran en `Y` avec un zoom `s`, viser
  `y = point.y − (Y − FY) / s`. Le haut de l'écran reste libre pour les titres (MO6 : prix illisibles quand la voiture
  zoomée remplissait le haut).
- **Bruit de caméra** (`noise`) ajouté sur `rx, ry, x, y`, avec une rampe d'entrée `sm(0, 1.2, t)` et un retour exact
  à la pose de l'image 0 en fin de film (voir § 10).
- **Caméra par couche (MO5)**, quand les éléments vivent dans des plans séparés :
  `perspective(1700px) translateZ(z) rotateX rotateY translate3d(-x,-y,zCouche)`. La profondeur de champ se fait par
  `blur()` proportionnel à la distance au plan net, **sur les petits calques seulement** (le flou d'un grand calque
  coûte jusqu'à 2 s par image).
- **Plongée à travers un objet** pour changer de scène : la caméra zoome dans un élément (pare-brise, disque, bouchon)
  au lieu de couper.
- **Voile haut d'écran** quand la caméra est près de l'objet : `linear-gradient(#08070a .92 → 0 à 46 %)`, opacité
  indexée sur le zoom (`sm(1.35, 1.9, c.s)`). Les titres restent lisibles sur une carrosserie.

## 3. Écrire à la lumière

**Lettre par lettre (`word` + `writeWord`, MO5/MO6)**. Chaque glyphe est un `<text>` SVG en double :
- un contour (`stroke-dasharray = 7 × taille`) qui se trace avec `draw` ;
- un remplissage qui monte de 20–26 px avec `rise`, 0,16 s après.

Le contour s'efface à 85 % quand le remplissage arrive. Pas de 0,035 à 0,06 s par lettre. Les espaces valent
`0,24 × taille`, et la largeur des lettres se mesure dans un canvas avec la même police (`measureText`).
- **Mot porteur en Fraunces italique** : remplissage `url(#qg)` (dégradé orange), contour `#ffb38a`, filtre `gl`
  (flou + fusion) pour la lueur.
- **Plume** : un point blanc avec un halo orange flou suit l'extrémité du trait (barre de calcul, flèche, contour).
- **Fente de lumière** (MO5 « 1 500 € ? ») : une barre verticale qui balaie ; chaque glyphe se révèle quand la fente
  le dépasse (on précalcule l'instant de passage par glyphe).
- **Traits utiles** : barre de soustraction, flèche (`stroke-dashoffset` 200 → 0), rature d'un prix (courbe), coches
  d'une facture (`M8 23 L18 33 L37 11`, 60 → 0).
- **Prix aspiré par le compteur** (MO6) : une fois écrit, le prix monte et rétrécit vers le compteur (spring), s'efface
  à 55–95 % du trajet ; le compteur roule au même moment.

## 4. Choses qui se construisent

- **Compteur à rouleaux** :
  - une colonne de chiffres par position ;
  - l'index est **déroulé** (5 → 10 pour rouler vers l'avant), d'où une colonne de 0 à 19 ;
  - MO5 roulait vers le bas sur 13 débits : colonne de −60 à 19, sinon la case finit vide ;
  - les cases apparaissent quand le nombre gagne un chiffre (largeur interpolée) ;
  - opacité du chiffre en `k³`, sinon on voit un zéro de tête fantôme ;
  - léger décalage entre positions (0,035 s) pour l'effet mécanique.
- **Palettes (split-flap)** : chaque case tourne (`rotateX` 92° → 0) en affichant des lettres au hasard
  **déterministe** (`(floor(p×9) + i×3) % n`) avant la bonne. Le calendrier qui accélère (J+1 → J+23) suit une puissance
  1,6 du temps.
- **Étiquettes qui tombent** : arc (`− 260 × sin(πp)`), rotation de −20° vers l'angle final, échelle 1,3 → 1.
- **Pile de notifications** : chaque nouvelle carte pousse les précédentes vers le fond (`translateZ`, `rotateX`,
  luminosité et flou qui augmentent avec la profondeur).
- **Cadrans** (MO6) : SVG, graduations sur 135° → 405°, aiguille + traînée d'arc orange de la valeur de départ à la
  valeur courante. L'aiguille vibre (`noise`) et la carte tremble légèrement pendant l'effort.
- **Contour lumineux d'un objet** : le chemin du contour (`cutout.py`) tracé en `stroke-dasharray` avec une plume ;
  version floue orange dessous, version nette claire dessus.

## 5. Verre, lueur, profondeur

- **Verre** : fond en dégradé blanc 20 → 5 → 8 %, `backdrop-filter: blur(26px) saturate(1.5)`, bord 1,5 px blanc
  22 %, ombre intérieure claire en haut, sombre en bas, ombre portée large ; reflet en biais (`.sheen`).
- **Lueurs** : taches radiales en `mix-blend-mode:screen` (`radial-gradient(closest-side, rgba(255,100,40,.4),
  transparent)`), cône de lumière conique en haut, sol en grille perspective (`rotateX(72deg)`) masqué en ellipse.
- **Lueur sur l'interface** : interdite par défaut (`video/CLAUDE.md`), acceptée par l'utilisateur pour les vidéos
  d'attention (codes-attention).
- **Grain** : bruit SVG `feTurbulence` en overlay à 8–9 %, déplacé chaque 1/24 s. **Vignette** radiale.
- **Éclairs** : pulse exponentiel (`a × exp(−k(t − t0))`) d'un halo radial en `screen` sur les moments forts (impact,
  bascule, révélation). Jamais répété en rafale.

## 6. Photo réelle dans le film

- **Détourage** : `scripts/cutout.py` (BiRefNet, décontamination des bords, silhouette lissée, contour vectoriel).
  isnet donnait des bords « dégueulasses ». Le liseré de lumière tracé sur le contour cache le reste.
- **Reflet et ombre** : copie retournée (`scaleY(-1)`), opacité 0,14–0,2, flou 3–4 px, masque en dégradé ; ombre
  elliptique sombre sous les roues.
- **Version abîmée par calques** (MO6, `video/scripts/polo-dirty-mo6.py`) : trois PNG alignés sur le détourage
  (crasse, voile des phares, rayure) générés avec un bruit à graine fixe. Chaque calque s'efface séparément.
  Leçon : des gouttes en cercles avaient l'air de bulles de dessin animé ; poussière fine + coulures sous les vitres
  passent pour vraies.
- **Nettoyage par bande de lumière** : chaque calque sale reçoit un masque `linear-gradient(90deg, transparent X%,
  #000 X+4%)` ; une bande lumineuse (dégradé 100° clair au centre, orange sur les bords) suit `X`, masquée par la
  silhouette elle-même (`-webkit-mask-image:url(détourage.png)`) et en `screen`.
- **Brillance retrouvée** : contraste + 12 %, liseré `drop-shadow` clair 2 px + halo orange 28 px.
- **Deuxième voiture avec la même photo** : miroir horizontal **et** plaque recouverte d'un polygone vierge (le miroir
  rend le texte de la plaque à l'envers).
- **Arrivée d'une voiture** : `translateX` sur spring critique + légère plongée (`rotate`) au freinage + traînées
  lumineuses dont la longueur suit la vitesse.

## 7. Révélations et raccords

- **Radiographie** (MO6) : une fente verticale traverse l'objet. Derrière elle, la photo est masquée et un dessin au
  trait apparaît (contour, vitres, roues, organes en lignes de lumière), avec deux masques complémentaires
  (`#000 → transparent` et l'inverse) à la même position.
- **Organe chaud** : le même chemin en double, orange épais et flou (`xh`), opacité qui pulse légèrement.
- **Raccord par la forme** (aucune coupe visible) :
  - le disque d'embrayage grandit et devient le compte-tours ;
  - le bouchon d'huile grandit et devient une loupe ;
  - la loupe rétrécit et va se poser à côté de la voiture suivante.

  Recette : position de départ lue sur le repère à l'écran (`getBoundingClientRect` du repère dans le monde), échelle
  0,06–0,12 → 1, le monde derrière se floute et s'assombrit (`blur 14px, brightness .45`) et une vidéo plein écran
  floutée prend le fond.
- **Rembobinage** (MO5) : le temps du récit repart en arrière, lignes de balayage horizontales en `screen`, flou de
  bougé ouvert.
- **Dévissage** : rotation −200° sur spring, puis le couvercle grossit (+35 %) et s'efface ; dessous, les éléments
  (mousse) apparaissent un par un avec `pop`.

## 8. Étiquettes reliées aux objets

- **Repères** (`.pin`) placés dans le repère de l'objet : ils suivent caméra, zoom et rotation.
- **Pastille de verre** à l'écran (fixe, lisible) reliée au repère par un fil SVG recalculé à chaque image avec
  `getBoundingClientRect` (déterministe : la mise en page ne dépend que de `t`). Le fil part du bord de la pastille le
  plus proche et se trace vers le repère (`pen`).
- **Le fil doit être une courbe** (`Q` avec un décalage de 30–40 px) : un trait parfaitement vertical a une boîte de
  largeur nulle et **un filtre SVG ne le dessine pas** (MO6 : fils invisibles).
- Allumer les repères quand la bande de lumière passe dessus (`lit(x)` selon la position du balayage).

## 9. Vidéos réelles

- **Trouver** : `scripts/mixkit.py search … --sheet planche.jpg` puis choisir **à l'image** (3 images par clip). Écarter
  les visages.
- **Préparer** : `mixkit.py seq` → JPG 30 i/s, 720 px, dans `film-<projet>/seq/<nom>/` (hors git).
- **Lire** : `drawSeq(canvas, nom, t)` peint l'image `floor(t × 30)` en « cover ». En boucle ping-pong (aller-retour)
  pour un plan d'ambiance, ou `once` (bloquée sur la dernière image) pour un geste qui ne doit pas revenir en arrière
  (compte-tours qui monte).
- **Charger en séquence avec relance** : un `decode()` en parallèle sur des centaines d'images échoue (« The source
  image cannot be decoded »).
- Les plans réels passent dans une **carte de verre** (vignette) ou en **fond plein écran flouté** (`blur 18px,
  brightness .32`) derrière un élément dessiné ; jamais bruts en plein cadre, sinon la DA se casse.

## 10. Boucle parfaite

- L'image 0 est déjà composée (sujet visible, trait de lumière posé) et la dernière image la rejoint.
- **Tout ce qui varie doit revenir exactement** :
  - caméra mélangée vers la pose de l'image 0 (`lerp(c, C0, sm(28.9, 29.95, t))`) ;
  - bruit de caméra éteint aux deux bords ;
  - fond animé périodique (`sin(2πt / DUR)`) au lieu d'un bruit ;
  - grain indexé modulo le nombre d'images.
- **Arrivée exacte** : utiliser `eo()` (sortie cubique) pour le dernier mouvement, pas un spring qui n'atteint jamais
  sa cible.
- **Réinitialiser hors champ** : l'état « sale » revient quand l'objet est sorti de l'écran (MO6 : dès 26,2 s), pas
  devant le spectateur.
- **Mesure** : écart moyen entre l'image 0 et la dernière image (`renders/stills`, numpy), à garder sous 1 sur 255
  (MO5 : 0,57 ; MO6 : 0,21).
- Côté voix : la dernière phrase enchaîne sur la première ; côté son : fondu de boucle.

## 11. Rendu et contrôle

- **Images fixes** : `CUT=<projet> node video/scripts/render.mjs --at 0,4.9,…` → `renders/stills/`.
- **Planches toutes les 0,1 s** : `CUT=<projet> node video/scripts/sheet.mjs 0 10` (une planche de 100 images par
  tranche de 10 s, plusieurs tranches en parallèle). C'est l'étape 3 « maquettage » des vidéos d'attention.
- **Film** : `CUT=<projet> MB=4 PARTS=4 PART=<i> node video/scripts/render.mjs --all` en parallèle, puis
  `--assemble`, qui mélange `audio/mix-<projet>.wav`.
  - Le film déclare `window.shutter(t)` et `window.samples(t)` : 4 sous-images seulement sur les fenêtres rapides
    (liste `WIN`), 1 ailleurs.
  - Rendu de 3 à 6 s par image sinon.
- **Vitesse** : verre dépoli en rendu logiciel = lent (≈ 10 s par image à 4 rendus parallèles sur MO6). `visibility:
  hidden` sur tout ce qui est invisible, pas de flou sur les grands calques, cartes en verre seulement là où elles se
  voient.
- **Contrôles** : `qa_video.py` (zones sûres, loudness, true peak, son à 0 s, téléphone), boucle mesurée, planche
  regardée **vraiment**, test 360 px.

## 12. Voix

- **eleven_v3** avec balises de jeu (`[deadpan]`, `[serious]`, `[whispers]`, `[short pause]`, `[pause]`), voix Simon
  `mvhJVdVoTWVUtL4keT7W`. Nombres écrits en lettres (« mille deux cents ») pour la prononciation.
- **2 prises**, `estimate_only` d'abord (≈ 670 crédits par prise de 30 s).
- **Minutage mot à mot en local** : faster-whisper `small`, `int8`, `word_timestamps=True`, langue `fr`.
- **Accélérer si besoin** : `atempo=1.1` (ffmpeg) garde le timbre ; au-delà, ça s'entend.
- **Poser chaque réplique** à son temps sur la timeline (`vo-placed.wav`) et caler `K` sur les mots
  (`vo-timing.json`) : chaque geste tombe sur le mot qui le nomme.
- **Accès bloqué** : ElevenLabs a coupé l'offre gratuite pour « activité inhabituelle » (proxy de l'environnement) :
  - le dire tout de suite, ne pas relancer ;
  - solutions : abonnement côté utilisateur, ou voix enregistrée par l'utilisateur (on garde le minutage whisper).

## 13. Son

Méthode complète : `sound-design.md`. Recettes de `video/scripts/audio-mo5.py` :
- **Voix** :
  - chaque réplique ramenée au même niveau (± 6 dB max) ;
  - présence 2–5 kHz légèrement remontée.
- **Musique** :
  - morceau de l'utilisateur étiré à 120 BPM ;
  - **arrêt de bande** (ralenti en 0,22 s) sur la chute ;
  - **souffle inversé** (0,9 s à l'envers) qui monte jusqu'au premier temps de la reprise ;
  - automation qui retire basse et aigus pendant l'attente.
- **Ducking par bandes sous la voix** : présence −10 dB, global −8 dB.
- **Liste d'événements (cues)** avec rôle, priorité, panoramique ; un son moins prioritaire à moins de 0,12 s d'un
  autre est retiré.
- **Familles musicales** : chaque débit une note plus grave, le gag une note plus haute.
- **Sons fabriqués** :
  - moteur à régime variable (`varrate`, +3 demi-tons, passe-haut 150 Hz, panoramique droite → centre) ;
  - vibration de téléphone synthétisée ;
  - tic-tac qui accélère.
- **Cohésion** : réverbération courte commune (fftconvolve).
- **Master** :
  - compression douce 1,8:1 ;
  - limiteur à anticipation (4 ms, plafond −4 dBFS avant normalisation) ;
  - −14 LUFS ;
  - musique −9 dB sous 150 Hz, passe-haut 45 Hz pour le téléphone (51 % → 48 % d'énergie sous 150 Hz, contrôle OK).
- **Contrôle mesuré** : écart voix/musique par réplique (minimum ≥ 4 dB, médiane ≈ 10 dB), rapport dans
  `docs/mix_report-<projet>.txt`.

## 14. Pièges de code rencontrés

| Symptôme | Cause | Correction |
|---|---|---|
| `Identifier 'x' has already been declared`, film blanc | deux `const` du même nom dans `paint()` | noms distincts (`spd`, `gn`) ; lire `PAGEERR` dans la sortie de `render.mjs` |
| Fil d'étiquette invisible | filtre SVG sur un trait de largeur nulle | courbe `Q` décalée |
| Compteur vide après plusieurs tours | colonne de chiffres trop courte | colonne −60…19 |
| Zéro de tête fantôme | opacité linéaire de la case | opacité en `k³` |
| Écart de boucle 2,9 | bruit de caméra, fond et grain non périodiques | rampe de bruit, `sin(2πt/DUR)`, grain modulo |
| `pkill -f motif` tue sa propre commande (code 144) | le motif apparaît dans la ligne de commande du shell | lancer `pkill` dans un appel séparé |
| Rendus parallèles qui s'écrasent | même dossier temporaire | un dossier par tranche (`_sheet<début>`) |
| Une part de rendu valide supprimée par erreur après un redémarrage du conteneur | nettoyage trop large | vérifier ce que contient un dossier avant de le vider ; le dire si ça arrive |
| Commande d'attente coupée à 2 h | limite des tâches de fond | moniteur avec condition, état revérifié à la main |
| Moniteur qui n'en finit pas | `pgrep -f motif` trouve la commande d'attente elle-même | attendre un fichier, ou `pgrep -f '[r]ender.mjs'` |
