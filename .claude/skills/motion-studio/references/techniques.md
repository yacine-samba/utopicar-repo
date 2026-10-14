# Boîte à techniques (MO1 → MO6, master60)

Chaque technique ici a servi dans un film livré ou validé. Code de référence : `video/film-mo5/film.js` (MO5 « 47 € »),
`video/film-mo6/film.js` (MO6 « Ce qui se voit, ce qui se cache ») et `video/film-master60w/film.js` (master60, pub
« wow » de 60 s en 16:9 et 9:16, ouvertures A et B). On copie la recette, on change le contenu.
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
15. Écrans pleins et sous-titres géants (master60)
16. Un seul film pour 16:9 et 9:16

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
- **Musique et bruitages générés par ElevenLabs, posés par les repères du film** (master60,
  `video/scripts/audio-master60w.py`) : choisir la prise par mesure (`scripts/music-pick.py`), la monter mesure par
  mesure sur la grille de la voix, poser chaque bruitage à l'instant publié par le film. Méthode : `sound-design.md` § 9.

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
| Creux du o, du p et du a remplis dans le logo animé | sous-chemins d'une lettre répartis dans des `path` séparés : le remplissage ne voit plus les trous | un seul `path` par lettre (attributs `d` concaténés) |
| « 50 » : le 0 rogné | `overflow:hidden` sur une colonne de chiffres plus étroite que le glyphe | `clip-path: inset(0 -.35em)` : coupe en haut et en bas seulement |
| Bouton « Analyser » passé sous le texte | `pose()` remettait `display` à vide et effaçait le `display:flex` posé à la création | mémoriser le `display` d'origine (`el._d`) |
| `Wt('!')` renvoyait le mot d'avant | la ponctuation se normalise en chaîne vide, préfixe de tout mot | chercher après le mot d'avant (`après + 0,1`) |
| Titres desktop posés à x = 96 vus à x ≈ 70 | poussée de caméra de 3 % depuis le centre | colonne décalée de 32 px en 16:9, titres réduits jusqu'à x = 910 en 9:16 |
| Aplat vide de 0,2 à 0,4 s à deux coupes | carte lancée 0,1 s après la coupe ; coupe posée sur un mot qui n'amène rien | entrée à `a − 0,03` ; couper sur le mot qui amène l'élément |

## 15. Écrans pleins et sous-titres géants (master60)

Un écran plein par idée (blanc, noir, orange ; rouge seulement pour le verdict « Non. »), la réplique de la voix
écrite en géant, mot par mot sur sa syllabe, la vraie interface en carte inclinée, un curseur qui joue la démo. 25 scènes
en 55 s, quelque chose de neuf sur chaque temps. Rendu 1080p de 60 s : ≈ 4 min en 3 parts, sans sur-échantillonnage.

- **Scènes** : `scene(a, b, fond, entrée, poussée)`. Entrées :
  - `cut` ;
  - `slab` : volet diagonal, `clip-path: polygon` ;
  - `circle` : cercle qui s'ouvre depuis le curseur ou le centre.

  Un `whoosh` est publié à chaque volet ou cercle. La caméra de la scène cumule trois mouvements :
  - poussée lente (`1 + poussée × progression`) ;
  - secousse amortie sur les impacts (`noise × e^(−10 Δt) × amplitude`) ;
  - micro-pulsation sur chaque temps (`pulse(t)` : 1 sur les premiers temps de mesure, 0,55 sur les autres, 0 pendant
    les silences voulus).

  Si le montage musical décale les mesures, `pulse` suit la même phase (master60 : un temps de plus avant « Hop ! »).
- **Texte cinétique (`KT` + `ktP`)** : chaque mot dans un masque (`overflow:hidden`), chaque lettre animée.
  - Entrées :
    - `rise` : la lettre monte hors du masque, 0,42 s, 0,017 s par lettre ;
    - `slam` : échelle 2,2 → 1 en 0,22 s ;
    - `drop` : elle tombe d'en haut ;
    - `type` : frappe lettre à lettre ;
    - `blur` : elle arrive floue.
  - Sorties :
    - `up` : par le masque ;
    - `fall` : chaque lettre tombe avec sa rotation ;
    - fondu.
  - `acc` : le mot « sonne » (+ 7 %, bump) quand la voix le dit.
  - `fx(i, j, t)` : geste propre à un mot (« hum… » qui ondule, « Pfff… » qui s'affaisse).

  La phrase suivante n'entre qu'une fois la précédente sortie.
- **Instants des mots** : `Wt(mot, après)` cherche le mot normalisé (sans accents ni ponctuation) dans
  `vo-timing.json`. Deux mots au même départ sont écartés de 0,11 s.
- **Flou de bougé directionnel par élément** :
  - `pose(el, t, P)` calcule la pose à `t` et à `t − 1/120` ;
  - un `feGaussianBlur` SVG reçoit l'écart-type (|Δx|, |Δy|) × 120 × 0,0065 (l'obturateur) ;
  - l'échelle ajoute un flou rond ;
  - même calcul pour les lettres (vitesse verticale dans le masque) et les rouleaux de chiffres.

  Il remplace `MB=8` (8 captures par image) quand le film est fait de textes et de cartes : une seule capture par image.
- **Interpolation exponentielle** (`eOut = 1 − 2^(−10p)`, `eIn`, `eIO`) pour les arrivées. Les bosses (clic,
  accent) passent par des springs fermés (`bump`).
- **Curseur qui joue la démo** : trajet par clés `[t, x, y]` en `eIO` ; un clic = appui de −16 % et une onde.
  - Il traîne une pastille « 🔗 Lien de l'annonce » jusqu'au champ.
  - L'URL se tape à 0,012 s par lettre.
  - Le bouton « Analyser » se resserre en rond et devient un spinner.
- **Compteurs à rouleaux** : colonnes en `clip-path: inset(0 −.35em)`, départ décalé de 0,07 s par colonne, rouleau
  caché jusqu'à son premier mouvement.
- **Logo animé depuis le vrai SVG** :
  - la tuile tourne et grandit ;
  - la voiture entre en glissant (avec flou), puis le trait ;
  - les lettres du mot-symbole montent une à une.

  Découpe du mot-symbole : sous-chemins regroupés par recouvrement horizontal, puis **fusionnés en un seul `path` par
  lettre**. La voiture reste dans son carré (`clipPath` aux rayons du logo).
- **Ouverture « marchand »** :
  - mur d'annonces en perspective, qui avance d'un cran à chaque temps (somme d'`eOut` sur les 8 temps de l'ouverture) ;
  - 12 pastilles « ✓ Message envoyé » au quart de temps ;
  - un compteur qui monte jusqu'à 50.
- **Le film publie ses repères sonores** : `cue(t, type, gain)` à chaque geste (impact, whoosh, clic, pop, rouleau,
  arrêt de bande, aspiration, « ding », message envoyé…).
  - Chaîne : `window.cues` → `video/scripts/cues-master60w.mjs` → `audio/cues-<projet>-<A|B>.json` → mix.
  - Un geste déplacé emporte son son. Après chaque retouche du film : réexporter, puis `git diff` sur les repères.

## 16. Un seul film pour 16:9 et 9:16

- **Un helper par valeur** : `V = fmt === 'vertical'`, `W`, `H`, `h = (a, b) => (V ? b : a)`. Chaque position
  s'écrit `h(valeur 16:9, valeur 9:16)`, et le 16:9 garde ses chiffres exacts.
- **Vertical** :
  - titres dans la colonne 140 → 940, sous les 220 px du haut ;
  - interface en bas, au-dessus des 440 px réservés ;
  - cartes qui arrivent de la droite (x 1700 → 540) ;
  - étapes empilées le long d'une ligne verticale (`scaleY`) ;
  - réplique trop longue coupée en deux `KT`, son minutage réparti (« Tu peux / la payer… »).
- **Titre réduit à la colonne** : `KT(…, fitW)` mesure la boîte rendue et réduit la taille jusqu'à
  `x + largeur ≤ 910`, et non 940. Avec une poussée de caméra de 3 %, le bord finit au plus à 921, hors des boutons
  TikTok. Les rouleaux suivent la même règle.
- **Géométrie par format** : `transform-origin` au centre du format, volet diagonal calculé sur `W` et `H`, cercles
  centrés en `W/2, H/2`, logo à 760 px de large en 9:16.
- **CTA de chaque format** : en 9:16, ce que dit la voix (« lien en bio ») ; en 16:9, l'URL.
- **Ne rien casser dans le format déjà livré** :
  - avant la première retouche, rendre 25 à 30 images fixes du format livré ;
  - après, les rendre de nouveau et les comparer au pixel (master60 : 29/29 identiques).
- **Même son pour les deux formats** : les repères ne dépendent que du temps. `render.mjs` prend le même
  `audio/mix-<projet>-<A|B>.wav`.

## 17. Collage autocollant et scanner (débuts BO, semaines d'oct.)

Grammaire relevée sur Behance (collage MINI JCW, FinData), dans la DA UTOPICAR : peu de texte, chaque chiffre porté
par un objet.

- **Deux calques alignés par voiture** : `scripts/sticker-plan.py <noms>` (copie dans le skill ; à lancer depuis `video/`, après `cutout.py`) écrit
  `<nom>-sticker.png` (voiture + liseré blanc de 18 px) et `<nom>-line.png` (plan au trait : arêtes Canny dans la
  silhouette + contour de 6 px). Même toile, même marge : ils se superposent au pixel.
- **Ombre en trame** : un `div` en `radial-gradient` de points, masqué par le PNG de l'autocollant
  (`mask: url(sticker.png) 0 0/100% 100%`), décalé de 20 px × 28 px. Le masque CSS exige un serveur HTTP (le rendu
  en a un).
- **Scanner** : une barre orange lumineuse traverse la voiture ; la photo est coupée par
  `clip-path: inset(0 0 0 f%)` et le plan au trait par `inset(0 (100−f)% 0 0)`, `f` suivant la barre. Les repères
  (pastille, trait, étiquette) apparaissent quand la barre les franchit, au plus tôt sur leur mot.
- **Étiquette de prix** : carton sur une ficelle qui pend du haut du cadre, balancement amorti, retournement en
  `rotateY` (recto achat, verso revente), trait rouge en `scaleX` pour barrer un prix.
- **Étoile de bénéfice** : polygone à 28 branches avec liseré blanc, compteur à rouleaux à l'intérieur ; elle claque
  (× 2,2 → 1), roule jusqu'au mot, puis se colle en petit en haut à gauche pour rester visible.
- **Pastille sombre** derrière tout texte posé sur un fond coloré (le disque orange mange un chiffre orange).
- **Photos** : une vraie photo Pexels par voiture, cohérente avec l'annonce (génération, pas de GTI pour un 1.2),
  logos et plaques floutés (`scripts/blur-boxes.py`) puis contrôlés sur un recadrage zoomé. Une voiture coupée ou
  floutée au mauvais endroit se reconstruit par symétrie depuis sa moitié propre.

## 18. Production en série calée sur la voix (14 vidéos d'un coup)

- **Un moteur, une config** : `semaine(c)` lit une config par vidéo (voitures, étiquettes, étoiles, barre, carte,
  tampons, textes, compteur, ticket, bulles, mention démo). Chaque instant est un mot de la voix :
  `TA(['coll'])`, `TA(['utopicar'])`, `TA(['trois', '3'])`. Mot-clé numérique de 1 ou 2 chiffres : égalité stricte
  (« 3 » ne doit pas trouver « 3 100 »).
- **Voix** : une prise par vidéo, toutes lancées d'un coup, un seul `creative_get_flow_run_status` (gros résultat
  JSON, lu avec Python), téléchargement immédiat. `vo-c7-pose.py` resserre les silences et accélère × 1,1. Si Whisper
  saute un passage (liste de chiffres), retranscrire le passage seul avec VAD et recoller les mots.
- **Musique calée sur les mots** : `build-c7.py` calcule pour chaque vidéo l'arrêt de bande (0,5 s avant « tu
  colles »), le drop (le clic sur « Utopicar »), le coup final (le chiffre ou le verdict) et la durée (dernier mot +
  carton).
- **Contrôle avant le rendu final** : 4 à 5 images fixes par vidéo (0,1 s, arrêt, drop, coup final, fin) sur une
  seule planche, avec la ligne y = 1 480 tracée. Toute la série se corrige d'un coup avant les 30 minutes de rendu.
- **Fabrication** : `video/scripts/semaines.sh [ids]` enchaîne repères, mixage, rendu avec flou de bougé et
  `qa_video.py`. En tâche de fond, suivi par un moniteur sur le journal. Pour l'arrêter, tuer le PID du script, jamais
  tous les `node.exe`.

## 19. Format court 15–20 s piloté par la voix (modèle générique)

- **Squelette en 4 scènes**, chacune déclenchée par un mot de la voix : hook (contexte + titre + objet) → objet plein
  cadre (étapes chiffrées) → action réelle dans le produit → carton de fin. Scènes optionnelles insérables (une liste
  qui tombe, une « année 2 », une comparaison) : chaque scène = `[mot de départ, mot de fin]`, rien d'autre.
- **Une config par vidéo** : titre (2 lignes + couleurs), objet (détourage, photo, cadrage), plaque (nom, détails),
  `pops` (mot → texte, couleur), `rows` (mot → « A → B » ou texte), `pills` (mot → valeur, étiquette, couleur),
  tampon de verdict, dossier de captures d'interface. Les fenêtres d'affichage se déduisent du mot suivant.
- **Mots-chocs** : taille de police calculée sur la longueur du texte (`min(104, 1500 / nb de caractères)`) pour ne
  jamais déborder ; pastille large calculée pareil. Sortie vers le haut, jamais par fondu seul.
- **Vraie interface animée** : copier la page réelle, remplacer seulement l'objet de données du cas, retirer les
  libellés de démo, capturer 4–5 s à 30 i/s en CDP `captureScreenshot` avec `clip` à l'échelle 2, rééchantillonner en
  séquence JPG, la dessiner sur un canvas dans un téléphone en perspective. Le numéro d'image suit le clic (`k = 28 +
  (t − tClic) × 30–45`) : le chargement et le résultat tombent sur la voix.
- **Durée tenue par la voix** : budget ≈ 45–55 mots pour 15–20 s ; si la prise dépasse, resserrer les silences (0,14 s)
  et accélérer jusqu'à × 1,2 plutôt que de couper une scène ; vérifier la durée finale (`ffprobe`) avant d'envoyer.
- **Prise de voix** : nombres et sigles écrits comme on les dit ; une prise par vidéo, toutes lancées d'un coup ;
  relire la transcription mot à mot (« 2 0150 », « 1 .2 litre » signalent un passage à écouter).
- **Zones sûres dès la config** : mots-chocs du hook à y ≤ 1 390, rien d'important sous 1 480 ; un objet détouré large
  peut déborder à droite, un texte jamais.

## 20. Site source en HD dans une carte qui suit le contenu

- **Capture** : `scripts/ui-seq-hd.mjs <dossier> <page.html> <sortie> 400 860 4.6` (Playwright, CDP `captureScreenshot`,
  `deviceScaleFactor 3`, tout le viewport mobile) → images 1200×2580 avec leurs instants (`times.json`), puis
  rééchantillonnage à 30 i/s (`u000…u134.jpg`).
- **Libellés inutiles** retirés dans la page avant capture (remplacement de chaîne dans le HTML exporté du site).
- **Bornes du contenu** : `scripts/ui-bounds.py <dossier>` → `bounds.json` (première/dernière ligne non noire par image).
- **Dans le film** : un `<canvas>` dans une carte ; à chaque image, on ne dessine que la bande utile
  (`drawImage(im, x0, top, w, h, 0, 0, w, h)`), et la carte prend cette hauteur → elle grandit d'elle-même
  (champ → analyse → fiche). Bornes **lissées** sur ±5 images ; les images vides du site (transitions) sont **sautées**
  (liste des images valides) ; marge basse forcée pour ne pas couper la dernière ligne.
- **Curseur** : le clic tombe sur l'image où le site clique (ici l'image 28) ; arrivée 0,07 s avant.
- **Surlignage** : boîte mesurée au pixel sur la capture (couleur de fond de la ligne) puis convertie dans le repère de
  la carte.

## 21. Un film entier sur un seul objet porteur (ETT)

- **Chaque scène naît de la précédente** : l'élément final d'une scène est la forme de départ de la suivante (prix →
  carte de fiche : bords sur ressorts décalés depuis le rectangle du prix ; fiche → case C0 du mur ; pépite → carte
  « Ton annonce » ; carte → point orange de l'image 0).
- **Calé sur la voix** : tous les instants viennent des mots (`TA`) ; les gestes qui ont besoin de temps (zoom, roulement,
  goutte) prennent `max(minimum visuel, mot)` pour ne jamais se télescoper.
- **Rien ne s'arrête** : poussée de caméra sur tout le film (`S(…, 0.05)`), flottement 3D des cartes posées
  (`rotateY ±12°, rotateX ±6°, translate ±25 px`), obturateur ouvert (`win`) sur les mouvements de caméra.
- **Mur de 400** : cases qui apparaissent en onde depuis la case d'origine (retard = distance × 0,03 s), bascule 3D,
  onde de couleur, tri en bandes (positions interpolées vers l'ordre trié), pépite ×2,6 avec liseré blanc.
- **Boucle** : la dernière image reproduit la première (même point orange, même place, étiquette de contexte présente).

## 22. Le film EST l'interface : composants de l'app recodés (présentation v4)

Demande de l'utilisateur (oct. 2026), après une version « vraie app dans un téléphone » : « on ne montre pas
l'interface, on est dans l'interface, comme dans les références ». Grammaire 1600.agency (Juicebox, lemlist) :
l'écran entier est l'app, chaque élément est recodé et s'anime de A à Z, la caméra passe d'un écran à l'autre sans
coupe. Code de référence : `video/film-presentev4/film.js`.

- **Fidèle, pas imaginé.** Les textes et chiffres viennent des pages de l'app figées sur la base démo
  (`scripts/app-demo/figer.mjs`, puis `innerText`). Les couleurs, rayons, ombres et polices viennent de sa feuille de
  style (`--color-*`, `.carte`, `.btn-o`), et les courbes aussi : `--ease-doux` cubic-bezier(.2,.8,.2,1),
  `--ease-ressort` (.34,1.56,.64,1), images clés `remplit`, `surligne`, `ping`, `anneau`. Le film bouge comme l'app.
- **Échelle.** Une carte de 364 px dans l'app en fait 800 dans le film (×2,2), dans la colonne 140 → 940. Valeurs
  en Clash 86–100 px, libellés en Satoshi 37 px, textes secondaires 29 px au moins.
- **Chaque élément devient le suivant.** L'annonce se retourne en « Ça rapporte ? », puis plonge dans le champ où on
  la colle. Le bouton se replie en chrono « 60 s », qui se remplit en une minute. Les cartes de note se rangent en
  pile, qui devient le verdict. Un balayage à gauche mène au rapport de la Clio, puis aux prix et à la ligne PLAFOND.
  Une liste file puis s'arrête net sur la meilleure annonce, qui mène à la recherche enregistrée et à son
  interrupteur. Viennent ensuite la nuit (horloge géante), les messages à leur heure, l'annonce sous la cote, la
  notification et l'e-mail en tiroir. Les étapes du parc mènent à « Vendues », qui s'ouvre en marge du mois, puis au
  logo tapé.
- **Pile qui grandit** (`pile()`) : le groupe reste centré. La caméra est serrée sur le premier élément (×1,15 au
  plus, pour ne pas sortir de la zone sûre) et recule à mesure que les suivants arrivent, sur des ressorts.
- **Paroles en typographie.** Chaque mot arrive flou (9 px), monte de 34 px et se pose net 0,09 s avant d'être dit.
  La phrase part (flou, ease-in de 0,12 s) avant que la suivante n'apparaisse. Mots clés en couleur ; phrases chocs
  en géant, de 118 à 170 px. Taille ajustée pour tenir sur deux lignes au plus.
- **Espaces insécables** dans tout texte recodé (`nb()`), pour ne jamais lire « 7 / 650 € » ni « (+30 / %) ».
- **Rien ne s'arrête.** Poussée de caméra sur les plans qui tiennent (accroche, parc), flottement des cartes posées
  (±6 px, ±0,4°), deux-points de l'horloge qui clignotent.
- **Mesures** :

  | | Brouillon | Film livré (MB=8) | Films 1600 |
  |---|---|---|---|
  | Images en mouvement | 52 % | 53 % | 57–77 % |
  | Plan figé le plus long | 3,87 s | 2,9 s | 3,0–3,5 s |
  | Coupes | 0 | 0 | |
  | Durée médiane d'un geste | 0,37 s | | |
  | Gestes en ressort | 58 % | | 51–71 % |
  | Vitesse p50 / p90 | 7,2 / 30 %/s | 6,1 / 28 %/s | 6–9 / 18–49 %/s |
  | À-coups | | 0,25 | 0,06–0,14 |

  Les à-coups restent au-dessus des références : compteurs, arrêt net de la liste, secousse sur « À éviter ».
  Piste pour le prochain film : des arrêts sur ressort plutôt que des arrêts francs.
