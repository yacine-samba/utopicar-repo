# Journal de critique — UTOPICAR, pub TikTok 15 s (9:16)

Chaque round est noté sur le MP4 réellement rendu (`renders/9x16.mp4`), à partir de :
contact sheet à 2 img/s, bande de 12 frames autour du mouvement le plus rapide (mesuré par
différence entre frames), frames réduites à 360 px de large, jonction de boucle
(`python3 scripts/review.py rN`). Les images sont dans `renders/review/`.
Barème sur 10. Livraison seulement si tous les critères sont ≥ 8.

## Round 1 — premier rendu complet

| Critère | Note | Constat |
|---|---|---|
| Hook (0–2 s) | 7 | « Cette Golf à 9 500 € ? » lisible dès la frame 0, mais le « −1 200 € » n'apparaît dans l'UI qu'à 4 s : le titre annonce un chiffre que l'écran ne prouve pas encore. |
| Lisibilité à 360 px | 6 | Titres très lisibles ; l'écran de l'app (660 px) laisse l'UI illisible au téléphone, 400 px vides en bas. |
| Mouvement | 7 | Springs propres, compteurs calés ; la poussée vers le rapport fonctionne. |
| Composition | 6 | Ticket vide de 1,0 à 2,4 s (lignes masquées) ; zoom à 1,5 s qui coupe le logo de la barre ; zoom à 6,4 s qui coupe le total. |
| Profondeur | 6 | Un seul plan : titres + écran. Le verre de la barre et du dock est le seul relief. |
| Synchro sonore | 8 | 25 repères sur la grille mesurée (écart max 3 ms), logo sur le downbeat 12 s. |
| Polish technique | 6 | Morph du logo par un disque jaune qui grossit (tache) ; icône voiture minuscule (mauvais ratio : 36/64 au lieu de 19/32). |
| Fidélité de la marque | 8 | Vraie UI, vraie police Archivo, jaune #FFC928 seul accent, vrai logo. |

**Trois problèmes corrigés ensuite**
1. Rapport vide et preuve tardive → les lignes entrent dès l'ouverture avec le vrai décalage de l'app (`lgIn`, 0,06 s), le total compte jusqu'à −1 200 € à 1,4–2,0 s et la caméra s'y pose ; de 2,5 à 4,0 s un indicateur jaune parcourt les lignes sur les beats.
2. Morph du logo → le fond de l'écran vire au jaune pendant la contraction, icône à la vraie proportion (19/32), mot-symbole décalé à 12,5 s pour ne plus chevaucher le carré.
3. Cadrages → écran agrandi à 900 × 1309 px, zooms recalés pour que les montants alignés à droite restent à gauche de x = 940 (colonne des boutons TikTok).

## Round 2

| Critère | Note | Constat |
|---|---|---|
| Hook (0–2 s) | 8 | Le titre « Tu perds 1 200 € » et le total rouge de l'app arrivent ensemble à 1,7 s. |
| Lisibilité à 360 px | 8 | Montants clés (−1 200 €, 7 500 €, 1 450 € sous la cote, KPI) lisibles après zoom. |
| Mouvement | 7 | Plan quasi figé de 2,93 à 3,83 s (mesuré) : seul un indicateur de 4 px bouge. |
| Composition | 8 | Plus de ticket vide, plus de coupe sur les montants clés. |
| Profondeur | 7 | Toujours plat entre titres et écran. |
| Synchro sonore | 8 | Inchangée, whoosh du mot-symbole déplacé à 12,5 s avec l'image. |
| Polish technique | 8 | Morph du logo propre, icône nette, carton final en légère poussée continue (plus de frame figée). |
| Fidélité de la marque | 8 | Inchangée. |

**Trois problèmes corrigés ensuite**
1. Plan figé 2,9–3,8 s → la caméra suit l'indicateur ligne par ligne sur chaque beat.
2. Indicateur peu visible → surlignage jaune de la ligne active (multiply, sans glow) qui s'étire d'une ligne à l'autre avec `indicator()`.
3. Profondeur → parallaxe : les titres montent légèrement quand la caméra zoome dans l'écran.

## Round 3

| Critère | Note | Constat |
|---|---|---|
| Hook (0–2 s) | 8 | Inchangé : question à 0 s, verdict NO GO à 1,2 s, −1 200 € compté dans l'app à 1,4–2,0 s. |
| Lisibilité à 360 px | 8 | Surlignage de la ligne active lisible au téléphone (3,6 s), total surligné à 4,6 s. |
| Mouvement | 8 | Plus aucun plan figé (mesure : 0 plan de plus de 0,6 s sans mouvement). La caméra avance d'une ligne par beat. |
| Composition | 8 | Montants clés entiers dans tous les zooms. |
| Profondeur | 7 | Parallaxe des titres trop discrète (~14 px) ; fond noir totalement plat. |
| Synchro sonore | 8 | Pop sur chaque pas de l'indicateur, hit quand il se pose sur le total (4 s). |
| Polish technique | 8 | Rien de cassé sur la bande de 12 frames ni sur la jonction de boucle. |
| Fidélité de la marque | 8 | Inchangée. |

**Corrigé ensuite** : profondeur. Parallaxe des titres doublée, l'écran avance de 3,5 % pendant les zooms caméra,
éclairage très doux derrière l'écran (radial, jamais derrière les titres, aucun glow sur l'UI).

## Round 4 — version livrée

| Critère | Note | Constat |
|---|---|---|
| Hook (0–2 s) | 8 | Question chiffrée dès la frame 0, preuve dans l'app avant 2 s. |
| Lisibilité à 360 px | 8 | Titres ≥ 104 px ; montants clés zoomés à ≥ 40 px de haut dans le cadre 1080. |
| Mouvement | 8 | Springs fermés partout, aucun rebond sur le texte, aucun plan figé. |
| Composition | 8 | Titres dans la zone 176–430 px, écran hors de la colonne des boutons pour tout montant clé, CTA au-dessus de 1 450 px. |
| Profondeur | 8 | Trois plans lisibles : titres (parallaxe), écran (avance pendant les zooms, verre réel de la barre et du dock), fond éclairé. |
| Synchro sonore | 8 | Grille mesurée à 119,97 BPM (écart max 3,1 ms), 25 repères sur les beats, logo sur le downbeat 12 s, CTA sur le beat 13 s. |
| Polish technique | 8 | H.264 yuv420p CRF 16, 1080×1920, 30 i/s, 15,00 s ; mix −14,0 LUFS, true peak −1,2 dBTP (ffmpeg ebur128). |
| Fidélité de la marque | 8 | Vraie UI d'UTOPICAR en mode démo, chiffres calculés par l'outil, Archivo, jaune #FFC928, logo réel. |

Limite de ce contrôle : l'audio n'a pas été écouté par une oreille humaine. Il a été vérifié par mesure
(spectrogramme et forme d'onde alignés sur les repères dans `renders/audio-check.png`, loudness, true peak,
aucun échantillon écrêté). Une écoute au casque et sur haut-parleur de téléphone reste à faire avant diffusion.

## Passage de contrôle après le round 4 (storyboard)

En tirant le storyboard du MP4, les KPI affichaient encore « 23 791 € » et « 14 810 € » à 11,4 s : la queue
asymptotique du spring `heavy` laissait de gros montants faux pendant près d'une seconde. Corrigé : les compteurs
atteignent la valeur exacte dès 99 % de progression. Vérifié sur le rendu final à 2,2 s (−1 200 €), 11,4 s et
11,9 s (4 · 23 800 € · 14 820 € · 1 647 € · 23 j · 6 600 €). Notes du round 4 inchangées ; images dans
`renders/review/r5-*`.
