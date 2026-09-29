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

---

# Version 2 — minimaliste (retour : « ça va trop vite, trop d'infos »)

Changement de direction : 3 idées au lieu de 7, un titre et un seul extrait du site par plan de 4 s,
une carte qui se transforme d'un extrait à l'autre puis en logo, musique calme (pas de clap ni de double-croches),
16 effets au lieu de 27. Tableau de bord retiré.

## V2 round 1
Extraits trop petits dans leur carte (plan 3), carte trop haute avec un grand vide dessous, double ligne du ticket
visible sous la pastille NO GO, 2,9 s sans rien de nouveau au plan 2.

## V2 round 2
Corrigé : annonce agrandie ×3,4, carte recentrée, extrait du total recadré, soulignement jaune sur le chiffre clé
de chaque plan (3 s, 6 s, 10,5 s), avancée lente et continue de chaque extrait. Nouveau défaut : le soulignement
du « 7 500 € » couvrait toute la largeur du bloc (rectangle de la boîte au lieu du texte).

## V2 round 3
Corrigé : rectangles mesurés sur le texte réel ; plan 2 réduit à « Ne dépassez pas / 7 500 € » (sans la phrase
d'explication) agrandi ×4,6, carte à la couleur réelle du bloc (#F5F6F8). Mesure du mouvement moyen par plan :
0,62 / 0,53 / 0,92 / 1,17, aucune frame identique à la précédente : calme mais jamais figé.
Grille mesurée à 120,0 BPM sur 25 kicks, 16 repères alignés ; mix −14,0 LUFS, true peak −1,3 dBTP.

---

# Version 3 — lancement, d'après la grammaire de la référence 1

Demande : s'inspirer de la référence 1 (film de lancement produit) pour le son, le design, l'animation des lettres
et le tempo. Analyse dans `docs/launch_style_guide.md` ; seule la grammaire est reprise (monochrome, 3D mate,
profondeur de champ, halo, grain, texte fin oblique mot à mot, flash blanc vers le logo, sound design sans beat).
Contenu, formes, textes et sons sont originaux ; la référence et ses images restent hors du dépôt.

## V3 round 1
| Critère | Note | Constat |
|---|---|---|
| Hook | 6 | Intro gris moyen au lieu de noir ; « Voici » peu lisible derrière l'anneau trop lumineux. |
| Lisibilité | 7 | Plans 3 et 4 lisibles, carte Clio petite et pâle. |
| Mouvement | 7 | Sphères qui s'écartent trop vite (pic mesuré à 9,3 s). |
| Composition | 6 | L'anneau barre le mot-symbole UTOPICAR de 1,75 à 3,25 s. |
| Profondeur | 8 | Flou d'avant-plan, halo, grain présents. |
| Synchro | 6 | Impact du logo hors downbeat (1,5 s). |
| Polish | 6 | Bloom qui brûlait les panneaux (corrigé avant ce rendu), noirs relevés. |
| Marque / fidélité à la référence | 8 / 6 | Fin claire au jaune unique ; intro encore loin du noir profond de la référence. |

## V3 round 2
Corrigé : fond noir et halo discret, anneau fin dans le tiers supérieur, logo sur le downbeat de 2 s
(downbeats lus sur les accents de la pulsation), accord final à 12 s, CTA à 13 s, sphères plus fines et lentes.
Reste : des sphères passent devant la carte Clio (9,25–10,25 s) ; ligne « 1 450 € sous la cote » petite.
Notes : hook 8, lisibilité 7, mouvement 8, composition 7, profondeur 8, synchro 8, polish 8, marque 8, fidélité 8.

## V3 round 3 — version livrée
Corrigé : sphères du premier plan toujours hors de la carte, avancée finale de la caméra sur la ligne clé,
captures étalonnées (niveaux de gris, contraste +40 %) pour un texte dense sur les panneaux.
| Critère | Note | Constat |
|---|---|---|
| Hook | 8 | Noir, anneau lumineux, « Voici » net à 0,75 s, impact et logo à 2 s. |
| Lisibilité à 360 px | 8 | −1 200 €, 7 500 €, 6 400 € / cote 7 850 € nets ; phrases à 70 px. |
| Mouvement | 8 | Caméra toujours en mouvement lent, mots qui sortent du flou, aucun plan figé. |
| Composition | 8 | Rien ne masque les extraits, textes dans la zone sûre. |
| Profondeur | 8 | Trois plans de netteté, halo, grain, vignettage. |
| Synchro | 8 | 120,0 BPM mesurés, logo et accord final sur des downbeats, notes cristallines sur chaque mot. |
| Polish | 8 | 1080×1920, 24 i/s, 15,0 s, −14,0 LUFS, true peak −1,1 dBTP. |
| Marque | 8 | Vrais extraits, Archivo, le jaune UTOPICAR seule couleur du film. |
| Fidélité à la référence | 8 | Même grammaire (palette, lumière, typo, entrée des mots, flash, sound design) sans en reprendre le contenu. |

Limite : l'audio a été vérifié par mesure, pas écouté ; une écoute au casque reste à faire.
