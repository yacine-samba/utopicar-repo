# Motion pro : la grammaire des références, traduite en code (oct. 2026)

Écrit après « c'est du Canva, pas du motion design » (13 oct. 2026). À lire **avant d'animer quoi que ce soit**, avec
`fluidite.md` et `techniques.md`. Sources étudiées image par image dans le navigateur (aucun fichier téléchargé) :
prompt-motion.com (les plus populaires : « Shape morphing through UI states », « Photo print app launch film »,
« UGC ad generator promo », « Bold kinetic type showreel », « Engraving-style Claude ad »), Dribbble Popular › Animation
(« Fintech app », « Sprint. Logo to Motion »). Les articles « tendances 2026 » trouvés sont des blogs d'outils : utiles
comme pistes, pas comme preuves.

## Ce qui fait « Canva » (à ne plus faire)

- Des éléments-gabarits empilés : pastilles, étiquettes, bandeaux qui défilent, anneaux d'onde, halos, secousses.
- Chaque élément entre séparément (pop, fondu) au lieu de **naître du précédent**.
- Des mouvements linéaires ou tous à la même vitesse ; rien ne s'étire, rien ne prolonge.
- Un écran plein de choses ; aucun vide.

Les meilleures références bannissent explicitement : anneaux d'onde de choc, particules, décalage RVB, secousse de
caméra, reflets d'objectif, lueurs néon, sols en grille, fonds qui clignotent, rebonds, fondus enchaînés, flous d'entrée.

## Les 12 principes, en code

| Principe (After Effects) | Ce qu'on voit | Recette |
|---|---|---|
| **Un objet porteur** | Une forme qui devient bouton, cadre, goutte, titre ; jamais de coupe | Un seul élément dont `left/top/width/height/border-radius/couleur` sont des fonctions du temps ; le contenu change à l'intérieur avec un masque |
| **Bords sur deux ressorts** | La forme s'étire : le bord avant part, le bord arrière suit | `L = a + d·spring(t − t0, 'default')`, `R = a + d·spring(t − t0 + 0.06, 'snappy')` ; idem haut/bas |
| **Écraser et étirer** | Balle qui s'aplatit à l'impact, s'allonge en vol | Étirement le long de la vitesse : `v = pos(t) − pos(t − 1/60)`, `rotate(atan2(v))`, `scaleX(1 + k|v|)`, `scaleY(1/(1 + k|v|))` (volume constant) ; à l'impact `bump` : `sx 1,18 / sy 0,72` |
| **Anticipation** | Petit recul avant le geste | 2–4 images de mouvement inverse (−6 à −10 % de l'amplitude) avant le départ |
| **Prolongement, chevauchement** | Les éléments secondaires arrivent un peu après et dépassent | Décalage 0,03–0,07 s par élément ; ressort `default` (léger dépassement) pour le secondaire, `heavy` pour le principal |
| **Lent au départ, lent à l'arrivée** | Jamais linéaire | Arrivées en `eOut` (1 − 2^(−10p)), départs en `eIn`, gestes en `eIO` ; vitesse de pointe courte (0,1–0,3 s) |
| **Arcs** | Rien ne va en ligne droite | Trajet `lerp(a, b, q) − h·sin(πq)` ; h = 15–25 % de la distance |
| **Texte qui sort d'un masque** | Les lettres montent d'une ligne invisible | Mot dans `overflow:hidden`, lettres `translateY(100 % → 0)` en `eOut`, 0,017–0,035 s de décalage par lettre |
| **Chaque mot a sa révélation** | Montée, contour puis remplissage, brouillage qui se décode, écriture | Brouillage : `(floor(p·9) + i·3) % n` sur un jeu de glyphes, la bonne lettre se fige de gauche à droite |
| **Transition par la forme** | Un rond grandit jusqu'à devenir le fond de la scène suivante ; une forme noire inonde puis se contracte | `clip-path: circle(r at x y)` de 0 à 150 %, la couleur du rond = fond de la scène suivante |
| **Liquide** | Une goutte se détache avec un pont | Filtre SVG « goo » : `feGaussianBlur σ 14` + `feColorMatrix … 0 0 0 26 −11` sur un conteneur de formes pleines (jamais de texte dedans) ; la goutte naît **dans** la forme et s'éloigne de 120–140 px |
| **Onde dans une grille** | Une vague traverse une grille de points ou de cases | Retard par case = distance au centre × 0,0015 s ; échelle `1 + 0,6·bump` ; puis grille inclinée `rotateX` en perspective |

## Rythme

- **Hook** : un changement toutes les 0,12–0,3 s pendant la première seconde, puis toutes les 1–2 s.
- **Sur la grille musicale** : chaque geste sur un temps, chaque changement de scène sur un premier temps ; le fond peut
  changer de couleur sur le temps (coupe franche de couleur, pas de fondu).
- **Le vide porte le mouvement** : un seul point chaud à l'écran, beaucoup d'espace autour.
- **Boucle** : la dernière image est la première (position, vitesse et curseur compris).

## Rendu

- Flou de bougé par sous-images sur les gestes rapides : `win(a, b)` dans le film, `MB=8` au rendu.
- Jamais `will-change` sur ce que la caméra agrandit ; jamais d'opacité ou de filtre sur un élément `preserve-3d`
  (mettre l'effet sur son conteneur).
- Mesurer avec `ref-motion.py` : mouvement ≥ 80 %, pause max ≤ 1 s, à-coups ≤ 0,10, flou ≤ 0,55.

## Pistes 2026–2027 (avis, pas mesures)

Typographie cinétique toujours dominante ; textures « faites main » et découpes à plat ; profondeur 2.5D et verre
utilisés avec retenue (vite daté) ; animations en boucle ; création pensée en vertical d'abord ; son calé sur la grille
des temps. La longueur d'avance vient moins d'un effet à la mode que de l'**exécution** : un objet porteur, des courbes
soignées, le son dessiné sur l'image, et la mesure systématique.

## Valeurs de référence (sources officielles)

- **Material Design 3** (m3.material.io, easing et durées, système encore utilisé pour les transitions) :
  emphasized decelerate `cubic-bezier(0.05, 0.7, 0.1, 1)` (entrées), emphasized accelerate `cubic-bezier(0.3, 0, 0.8, 0.15)`
  (sorties), standard `cubic-bezier(0.2, 0, 0, 1)`. Durées : courtes 50–200 ms, moyennes 250–400 ms, longues 450–600 ms
  (une carte qui passe en plein écran : 500 ms, emphasized), très longues 700–1000 ms (mouvements d'ambiance).
- **IBM Carbon** (carbondesignsystem.com) : productif standard `(0.2, 0, 0.38, 0.9)`, expressif standard
  `(0.4, 0.14, 0.3, 1)`, entrée expressive `(0, 0, 0.3, 1)` ; durées 70 / 110 / 150 / 240 / 400 / 700 ms ; plus la
  distance est grande, plus c'est long ; l'expressif est réservé aux moments importants.
- **Ressorts façon Apple** (réponse, amortissement) → raideur `(2π / réponse)²`, amortissement `4π · fraction / réponse`
  (masse 1). Réponse 0,3 s = vif ; fraction 1 = sans dépassement ; < 1 = rebond. Material 3 Expressive (valeurs
  transcrites par la communauté, à revérifier) : spatial standard amortissement 0,9 / raideur 1400–700–300 ;
  spatial expressif 0,6–0,8 / 800–380–200 ; effets (opacité, couleur) 1 / 3800–1600–800.

## Mesures : les 3 premières secondes des références verticales (ref-motion.py, 13 oct. 2026)

| | mouvement | vitesse p50 / p90 | à-coups | pano / zoom / rotation | flou |
|---|---|---|---|---|---|
| tiktok-v1 | 81 % | 4,9 / 43,7 | 0,08 | 53 / 48 / 24 % | 0,22 |
| tiktok-v2 | 82 % | 9,1 / 43,0 | 0,024 | 34 / 66 / 55 % | 0,22 |
| qonto | 93 % | 29,9 / 54,1 | 0,031 | 66 / 82 / 33 % | — |
| HK4 (point orange, 2D) | 78 % | 2,9 / 13,8 | 0,12 | 24 / 26 / 4 % | 0,48 |
| HK5 (caméra 3D, zoom dans le trou) | 86 % | 4,2 / 7,0 | 0,078 | 13 / 40 / 6 % | 0,66 |

Ce que font ces ouvertures : une forme lumineuse en 3D qui tourne, puis un **zoom-éclair à travers un élément**
(le logo, un objet) très flouté, qui débouche sur une **image réelle cinématographique** (mains, téléphone, lumière
chaude) filmée par une caméra qui pousse et tourne sans arrêt. Écart restant chez nous : panoramique et rotation de
caméra trop faibles, flou de bougé insuffisant sur les mouvements de caméra.

## Recettes ajoutées (HK5)

- **Zoom à travers un trou** : l'objet porte un trou découpé par masque
  (`mask-image: radial-gradient(circle at x y, transparent r, #000 r+1)`, jamais un disque peint) ; l'objet grandit
  ×25–30 autour du trou (`transform-origin` = centre du trou) pendant 0,28 s ; la scène suivante, dessous, est
  dévoilée par `clip-path: circle(r·S at x y)`. Raccord sans coupe.
- **Profondeur 2.5D avec une seule photo** : fond = copie floutée et assombrie précalculée (pas de `filter: blur` sur un
  grand calque), voiture détourée nette devant ; le fond glisse 2–3 fois moins vite que la voiture ; la scène entière
  sous `perspective(1500px) rotateY(26° → −14°) rotateX rotateZ` qui dérivent.
- **Contour écrit à la lumière** sur la photo réelle : chemin `*-contour.json` en `stroke-dasharray`, double trait
  (blanc fin dessus, orange épais à 55 % dessous), plume blanche à halo orange qui suit `getPointAtLength`.

## Pièges vus en production

- Un élément créé puis plus jamais animé reste visible : le supprimer.
- Mesurer **le film entier**, pas seulement l'ouverture : les plans où l'on pose une carte deviennent des plans figés.
- Le zoom-éclair est compté comme une « coupe » par `ref-motion.py` : normal (les références en ont 3–13 / 10 s).
- Une caméra 3D qui pousse fait déborder les textes et boutons dans les marges : garder 30–40 px de plus.
