# DA immersive : la direction artistique des films utopicar (présentation v8 → v10)

C'est la DA de la présentation utopicar, construite version après version sur les retours de l'utilisateur :
- sur la v7 : « retire les cadres des interfaces, faut que ça soit beaucoup plus immersif » ;
- sur la v8 : « pour les transitions d'écran, j'aime qu'une grosse couleur prenne l'écran, puis les textes arrivent
  en animation » ;
- sur la v9 : « remplace la 208 par notre Polo en 3D », puis « utopicar sur la plaque » ;
- sur le script v10 : « ok fait la vidéo » (voix refaite, film rendu).

**Code de référence :** `video/film-presentev10/film.js` et `polo3d.js`. Film rendu :
`video/renders/9x16-presentev10.mp4`.

**Quand la proposer.** C'est la direction recommandée pour tout film produit utopicar : présentation, explainer, démo,
pub. On la propose en premier à la porte 3, avec ses images (`renders/stills-presentev10`, `renders/apercu-presentev10`).
On ne cherche une seconde direction que si l'utilisateur veut changer. Les vidéos d'attention gardent leur DA
(`codes-attention.md`).

L'historique et les pièges de chaque procédé sont dans `techniques.md` § 22 à 28. Ce fichier-ci donne la DA telle
qu'elle est, avec ses valeurs, pour la refaire sans relire sept sections.

## 1. Les cinq idées

1. **Le film est l'interface, sans cadre.** Les pièces de l'app (libellé, valeur, barre, anneau, lien collé)
   flottent seules, en grand, dans un espace sombre. Aucune carte, aucun fond, aucune bordure, aucune ombre de boîte.
2. **La voix s'écrit.** Un grand sous-titre en haut tape chaque mot quand Simon le dit. Une lueur parcourt la ligne au
   rythme de la voix.
3. **Une grosse couleur change d'écran.** Une couleur pleine part d'un objet ou d'un bord, couvre tout l'écran, tient
   un instant, puis s'ouvre sur la scène suivante.
4. **La caméra ne s'arrête jamais.** Il y a une vraie perspective CSS 3D. Les pièces sont posées à des profondeurs
   différentes ; la caméra pousse, file et tourne, et le fond bouge avec elle.
5. **Tout se construit dans l'ordre où l'œil lit.** Les lettres montent d'un masque, les filets se tracent, les
   barres se remplissent, les coches se dessinent.

## 2. Jetons

Ce sont ceux de l'app (`web/src/app/globals.css`), sur fond sombre.

| Rôle | Valeur |
|---|---|
| Fond | `#0b0a09` |
| Encre | `#f4f1ec` (secondaire : 60 % d'opacité ; filets : 16 %) |
| Accent | `#ff5a1f` (boutons, pastille, couleur pleine), `#ff8a4c` (mots clés) |
| Gain | `#3ecb7f` |
| Perte, limite | `#ff6b6b` (texte), dégradé `#ff5d5d` → `#d02a2a` (bande PLAFOND) |
| Nuit | `#a9b8ff` (texte), `#1f2a7c` (couleur pleine) |
| Encre sur une couleur pleine | `#160904` ; blanc sur le bleu nuit |

**Polices** (une display, une UI, une serif pour la signature) :
- **Clash Display** 600 : sous-titres, valeurs géantes, titres de verdict ;
- **Satoshi** 400 à 900 : libellés, phrases d'interface, lien collé, pastilles ;
- **Instrument Serif** italique : seulement « Revends mieux. » à la fin.

Milliers et unités : espace insécable U+00A0. L'espace fine U+202F n'existe ni dans Clash ni dans Satoshi.

**Couleur des mots dans les sous-titres** (une couleur = un sens, jamais décorative) :

| Code | Couleur | Sens | Exemples |
|---|---|---|---|
| `w` | `#f4f1ec` | texte courant | « Cette », « à la revente » |
| `k` | `#ff8a4c` | le sujet, le mot clé | « Polo », « 8 990 € ? », « marge », « travaux », « prix d'offre » |
| `r` | `#ff6b6b` | perte, limite | « perds », « plafond », « dépasser » |
| `g` | `#3ecb7f` | gain, bonne nouvelle | « bonne affaire », « 5 750 € », « vraie marge » |
| `b` | `#a9b8ff` | la nuit | « dors » |

**Fond vivant :**
- Trois taches de 1 700 px en dégradé radial dérivent lentement (sinus de 0,29 à 0,55 rad/s, ±15 % d'échelle).
- Leur palette dit l'humeur de la scène. Elle change sous la couleur pleine, en 0,35 s :

  | Code | Humeur | Taches (RGBA) |
  |---|---|---|
  | `o` | orange, neutre | (255,90,31,.5), (190,40,20,.42), (255,160,90,.22) |
  | `r` | rouge, perte | (235,45,45,.55), (150,15,30,.5), (255,90,31,.25) |
  | `v` | vert, gain | (40,200,120,.42), (10,100,70,.45), (180,230,120,.18) |
  | `n` | nuit | (70,90,240,.5), (120,60,220,.38), (20,30,110,.6) |
  | `a` | aube | (255,130,80,.48), (230,70,120,.36), (255,200,120,.22) |

- Une trame de points (1,4 px, encre à 7 %, pas de 34 px) monte de 22 px/s et suit la caméra (parallaxe 0,2 en x,
  0,14 en y). Elle se floute avec le filé : c'est l'espace qui bouge, pas seulement les objets.

## 3. Mise en page 9:16

- Tout est centré sur x = 540, dans la colonne 140 → 940. Rien d'important au-dessus de 220 ni sous 1 480.
- **Sous-titre du haut :**
  - première ligne posée à y = 236 ;
  - taille de 100 à 150 px : 150 pour deux ou trois mots forts, 100 pour trois lignes ;
  - interligne 1,04, interlettrage −0,03 em ;
  - largeur maximale 740 px, car la lueur grossit les lettres de 6 %.
- **Blocs d'interface :**
  - dessinés dans 760 px (160 → 920), car la poussée de caméra les agrandit de 4 à 6 % ;
  - alignés à droite sur 900 à 905.
- **Valeurs géantes** en Clash 600, de 130 à 300 px (prix de l'accroche : 300 px), interlettrage −0,035 à −0,05 em.
  Chaque taille est mesurée à la création et réduite pour tenir dans 730 à 796 px de large.
- **Libellés et phrases d'interface** en Satoshi, de 34 à 50 px.
- Une nouveauté visuelle toutes les 1 à 2 s dans l'accroche, puis toutes les 2 à 4 s.

## 4. Les sous-titres de la voix

Fonction `ph(lignes, { y, size, out })` (`phrase()` dans le code). Chaque mot est accroché à son mot de la voix
(`vo.words.json`) : `[texte, numéro du mot, couleur]`.

**Entrée, lettre par lettre :**
- La première lettre tape 70 ms avant le mot dit. Les suivantes viennent toutes les `min(33 ms, 0,26 s / lettres)` :
  un mot entier s'écrit en 0,26 s au plus.
- Chaque lettre arrive petite et basse, puis se pose en 0,2 s (eOut3) :
  - elle monte de 22 % de la taille ;
  - elle se redresse de −60° (`rotateX`) ;
  - elle grandit de 35 % à 100 % (spring snappy) ;
  - elle passe d'un flou de 6 px à net, et devient opaque en 0,06 s.
- La ligne se recentre sur x = 540 à mesure qu'elle s'écrit.

**La lueur de la voix :**
- Une tête parcourt la ligne : du début du mot au moment où Simon le commence, jusqu'à sa fin au moment où il le
  finit (0,12 s au moins par mot).
- Devant la tête, la lueur tombe vite (gaussienne de 0,5 × taille). Derrière, elle traîne (exponentielle de
  2,2 × taille).
- Une lettre allumée passe à 90 % vers le blanc chaud (255, 246, 236) et grossit de 6 %. Elle prend trois ombres
  portées, dont un halo de sa couleur (orange pour les mots blancs).
- Un halo elliptique de 2,8 × 1,7 tailles suit la tête.
- Tout s'éteint en 0,45 s après le dernier mot.
- La lueur est réservée aux mots que dit la voix : sous-titres, et titre de verdict lu à voix haute
  (`allumeLigne`). Jamais sur un bouton, un champ ni une valeur au repos.

**Sortie** (0,2 s, accélérée) : la ligne bascule vers le haut (+70°), monte de 60 px, se floute (10 px) et s'éteint.

**Un seul sous-titre du haut à la fois.** Chacun sort 0,26 s avant que le suivant tape sa première lettre. La règle
est appliquée automatiquement à la fin du film, sur tous les sous-titres dont y ≤ 260.

**Sur une couleur pleine,** les mots en couleur passent à l'encre `#160904` (au blanc sur le bleu nuit), lettre par
lettre, là où passe le bord (`VOILE_A`). Les mots blancs restent blancs.

**Le texte à l'écran n'est pas le mot à mot de la voix.** Il en garde les mots qui portent, en 3 à 6 mots par écran.
Une somme dite en plusieurs mots (« cinq mille sept cent cinquante euros ») s'écrit en une seule unité : `mot(a, b)`.

## 5. L'interface sans cadre

- **`bloc(S)`** pose chaque pièce une à une dans le monde, chacune à sa profondeur : libellé +110, phrase +50,
  valeur 0, barre −60.
  - La pièce est reculée et rapetissée de `k = persp / (persp − z)` : caméra au repos, la mise en page tombe pile.
  - En mouvement, les plans glissent les uns sur les autres.
  - Pas de conteneur commun : une opacité ou un filtre sur un parent `preserve-3d` aplatit ses enfants.
- **Ce qui remplace les cadres :** des filets fins qui se tracent, menés par une tête claire (`filet`, `trait`).
- **Ce qui reste plein, parce que ce sont des commandes :** le bouton orange (avec son reflet qui passe),
  l'interrupteur, l'étiquette Benef Pro, l'icône de l'app, la pastille « lien en bio ».
- **Les valeurs montent lettre par lettre** d'un masque (`monte`, `valeur` : 30 à 45 ms d'écart, 0,5 s, eOut3).
  - Aucun compteur à rouleaux : au flou de bougé, il empile des chiffres fantômes.
  - Un contenu qui change par à-coups (heure, chiffre) est figé sur l'image entière (`fq`), identique dans toutes les
    sous-images.
- **Les barres** se remplissent avec une tête lumineuse (`remplit`). **Les pastilles** jaillissent (spring snappy,
  depuis 55 %).
- **L'appui sur un bouton :**
  - le bouton s'écrase (−6 %) et s'éclaire (+20 %) ;
  - l'onde part de sous le texte, coupée par le bord de la pastille ;
  - jamais de doigt ni de rond posé dessus.
- **Un lien collé tient sur une ligne :** domaine en gras, chemin plus discret, taille calculée pour la colonne.
  - Trop long de face ? Gros plan de biais : `rotateY` +32°, la fin du lien fuit vers la droite.
  - Jamais un panoramique qui le suit.

## 6. Caméra et espace

- **Une scène par idée** : `scene(persp)`, perspective de 1 100 à 1 300 px. La caméra (`camera(S, { cx, cy, cz,
  rx, ry, rz })`) pivote autour du point visé.
- **Tenue.** Pendant que la voix parle, la caméra pousse lentement (+70 px en z) et dérive (rotations de 2 à 4°,
  sinus lents). Elle revient pendant la transition suivante.
- **Filé d'une pièce à l'autre.**
  - Les blocs sont posés à 1 000 px, juste hors champ.
  - Pendant le filé : flou SVG sur l'axe du mouvement, écart-type égal à la moitié du chemin parcouru en une image ;
    rotation de 9° dans le sens du mouvement ; petit recul.
- **Impact** (verdict, PLAFOND) : secousse brève de 6 à 8 px et 1,2°.
- **Arrivée d'une scène** : la caméra arrive de −260 à −280 px en z et se pose en 0,9 s environ (`doux`).
- **Sortie d'une scène sans couleur pleine** (`recul`, 0,6 s, `lisse`) :
  - la scène recule (−8 %), se floute (26 px), s'assombrit (−60 %) et s'éteint ;
  - la scène qui arrive passe devant.
  - Aucun texte ne file vers la caméra.
- **Mise au point.** Pour poser un texte sur un décor chargé (la meilleure annonce sur le mur d'annonces) : le décor
  est flouté (11 px) et assombri (62 %), avec une ombre ronde au bord fondu derrière le texte.

## 7. Les changements d'écran par grosse couleur

Détail et code : `techniques.md` § 26.

**Le minutage** (`RT(t0, couvre, tient, ouvre)`) :
- Chaque transition se place dans une pause de la voix ; elle peut partir sur la fin du dernier mot. Si la pause
  manque, on l'ajoute au montage de la voix (`coupes.json`, en disant ce que fait l'image pendant le blanc).
- La couleur couvre l'écran en 0,22 à 0,32 s (`bez(.55, .05, .2, 1)` : elle part vite et se pose).
- Elle tient de 0,04 à 0,32 s.
- Elle s'ouvre en 0,24 à 0,33 s (eOut3).
- Les textes de la scène suivante arrivent tout de suite derrière.

**Le départ** : d'un objet de la scène qui sort (−2 490 €, le trait sous l'annonce, l'icône de la marge, la
pastille), ou d'un bord. On varie le départ ; on garde des couleurs qui portent le sens.

**Les couleurs pleines :**

| Couleur | Valeur | Sens |
|---|---|---|
| orange | `#ff5a1f` | neutre, la marque |
| rouge | `#d92d34` | perte |
| vert | `#139a57` | gain |
| bleu nuit | `#1f2a7c` | la nuit ; son trou est fondu sur 320 px pour se fondre dans le ciel |
| corail | `#ff6f4f` | l'aube |

**Ses règles :**
- Le bord est flou en proportion de sa vitesse : la moitié du chemin d'une image, entre 1,5 et 140 px.
- La couleur passe au-dessus des scènes, sous les sous-titres et sous la tuile du logo.
- Pas de couleur pleine sous un mot de la même couleur.
- La palette du fond change sous la couleur pleine, jamais à l'écran.

## 8. Un objet héros en vraie 3D

Voir `techniques.md` § 27.
- La voiture est rendue par Three.js dans un canevas transparent, posé dans la scène CSS comme une photo.
- `pose(t)` repeint chaque image ; le flou de bougé fonctionne tel quel.
- Elle tourne lentement sur elle-même (17° pendant l'accroche) : les reflets et les roues bougent, c'est ce qui fait
  la 3D.
- Les matières sont refaites pièce par pièce, et le modèle colle à l'annonce (version, couleur). « utopicar » est
  sur la plaque, avec le logotype officiel.
- Ombre de contact douce, sur une texture carrée qui s'éteint avant ses bords.

## 9. Courbes

| Nom | Définition | Usage |
|---|---|---|
| `doux` | `cubic-bezier(.2, .8, .2, 1)`, l'`--ease-doux` de l'app | caméra, arrivées de scène |
| `vif` | `bez(.55, .05, .2, 1)` | couleur pleine qui couvre |
| `eOut3` | `1 − (1 − p)³` | lettres, valeurs, filets, ouverture de la couleur (départ franc, aucune traînée au flou) |
| `eIO` | expo in-out | reflet du bouton, changements de palette, cercle de la boucle |
| `lisse` | smoothstep | recul d'une scène, sortie du logo |
| springs `snappy` | `lib/motion.js` | pastilles, échelle des lettres, flèche du logo |

Pas de rebond visible sur la typographie. Une opacité seule n'est jamais l'animation entière.

## 10. Flou de bougé

- Rendu `MB=8`. Le film déclare `window.shutter(t)` et `window.samples(t)` :
  - pendant une couleur pleine, un filé ou un défilement (fenêtres `win(a, b)`) : obturateur ouvert sur toute l'image
    (1) et 8 sous-images ;
  - le reste du temps : 0,5 et 4 sous-images.
- Un texte à lire ne doit pas bouger de plus de 15 px par image.

## 11. Son

Détail : `sound-design.md` et `techniques.md` § 28.
- **Chaque geste a son son, posé par le film lui-même** (`cue(t, type, gain)`, exporté dans `window.cues`) :
  - couleur pleine : whoosh au départ, impact quand elle couvre, pop à l'ouverture ;
  - cartes et valeurs qui s'écrivent : key, tick ;
  - verdict : impact ; bonne nouvelle : ding ; limite : thud ;
  - message envoyé : sent ; la nuit tombe : une cloche lointaine, très basse, et la musique filtrée.
- **Musique** montée mesure par mesure sur sa grille mesurée, avec la chute sur le pivot du film.
- **Voix** à 8,5 dB au moins au-dessus de la musique, sur chaque phrase.
- **Master** : −14 LUFS, −3,5 dBTP avant l'AAC.

## 12. Fin et boucle

- **Logo officiel** (SVG, version fond sombre) : la tuile se pose sur l'orange, la voiture se dessine, la flèche
  file depuis l'arrière de la voiture (spring snappy). Les lettres de « utopicar » montent de sous la ligne de base,
  à 55 ms d'écart.
- **Signature :**
  - « Achète juste. » en Clash 600, 124 px, blanc ;
  - « Revends mieux. » en Instrument Serif italique, 140 px, orange ;
  - les deux s'écrivent avec la voix.
- **Pastille « lien en bio »** :
  - fond `#f4f1ec`, texte `#1c1612` en Satoshi 700, 40 px, 96 px de haut ;
  - elle s'écrit au moment où Simon le dit, 55 ms par lettre, et s'élargit de 21 px par lettre ;
  - un curseur clignote toutes les 0,4 s.
- **Boucle :**
  - la fin dérive vers le haut (22 px) et s'efface ;
  - dans les 0,6 dernières secondes, un cercle part de l'icône du logo et s'ouvre (eIO) sur l'image 0, sur son
    propre fond, sous-titre compris ;
  - la dernière image retombe exactement sur la première.

## 13. Interdits de cette DA

Chacun vient d'une erreur réellement corrigée.

- Un cadre, une carte, une boîte ou une ombre autour d'une pièce d'interface (v7).
- Un doigt ou un rond posé sur le texte d'un bouton (v8).
- Un lien coupé sur plusieurs lignes, ou suivi par un panoramique illisible (v9).
- Un texte posé sur un autre texte, à aucune image. Contrôle : `chevauchements.mjs` puis `chevauchements.py`, avant
  toute planche et tout rendu, jamais pendant un rendu.
- Deux sous-titres du haut à l'écran en même temps.
- Un compteur à rouleaux (chiffres fantômes au flou de bougé).
- Un texte qui file vers la caméra, un fondu enchaîné entre scènes, une opacité seule.
- Un mot de couleur illisible sur une couleur pleine (« perds » rose sur orange, v9).
- Un texte qui sort de la colonne pendant un mouvement : un chiffre plus large (« 8 990 € » à la place de
  « 7 190 € ») sortait de l'écran à l'image 0. On mesure les boîtes de chaque texte à chaque image, pas seulement au
  repos.
- Une arête droite sous la voiture : texture d'ombre non carrée (v10, repérée par l'utilisateur).
- Une lueur sur un élément d'interface qui n'est pas dit par la voix.
- Emoji, « exemple », source à l'écran, logo Leboncoin ou La Centrale (le domaine dans le lien collé reste du texte).

## 14. Faire un nouveau film dans cette DA

1. Copier `video/film-presentev10/` vers `video/film-<projet>/` et créer `timeline-<projet>.json` (fps 30, taille,
   durée, image du poster).
2. **Garder telle quelle la boîte à outils du début du fichier :**
   - courbes ;
   - `put`, `scene`, `camera`, `proj`, `versMonde` ;
   - `bloc` ;
   - `lettres`, `monte`, `valeur`, `filet`, `trait`, `remplit`, `jaillit`, `reflet` ;
   - `filtre`, `fx`, `recul` ;
   - fond, `phrase`, `ph`.

   **Garder aussi la fin du fichier :**
   - couleurs pleines (`RIDEAUX`, `voile`, `VOILE_A`) ;
   - palettes du fond (`PALK`) ;
   - règle des sous-titres du haut, empilement ;
   - `seek`, `shutter`, `samples`, `cues`.
3. Brancher la voix (`vo.words.json`, `w(i)`). Écrire un `ph()` par phrase, avec la couleur des mots selon leur
   sens.
4. Une scène par idée. Les pièces d'interface viennent du vrai produit (vraies données démo, vrais libellés) et sont
   posées par `bloc`. On se demande à chaque fois : quel objet porte le regard d'une scène à l'autre ?
5. Placer une couleur pleine (`RT`) dans chaque pause de la voix qui change d'écran. Choisir sa couleur par le sens
   et son départ par l'objet qui sort.
6. Poser un `cue()` sur chaque geste et un `win()` autour de chaque mouvement rapide.
7. **Contrôles :**
   - détecteurs de chevauchements ;
   - planches toutes les 0,1 s ;
   - boîtes de chaque texte dans la colonne à chaque image ;
   - rendu `MB=8 PARTS=3` ;
   - `qa_video.py` ;
   - planche de la vidéo encodée et coutures des morceaux.
