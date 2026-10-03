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

---

# Version 4 — film produit 30 s, d'après la grammaire de la référence 2

Demande : « faire pareil » avec la référence 2 (film de présentation d'un logiciel), en 30 s. Analyse dans
`docs/saas_style_guide.md`, plans dans `docs/saas_shotlist.md`. Seule la grammaire est reprise (fond clair, accent
saturé en aplats et volets, mosaïque, mot-symbole tracé puis extrudé, survols 3D de l'interface, cartes épaisses,
téléphone, titres à mot d'accent) ; contenu, textes, formes et musique sont originaux, la référence reste hors du dépôt.

## V4 round 1
| Critère | Note | Constat |
|---|---|---|
| Hook | 7 | Lueur puis mosaïque réussies, mais le volet ne faisait pas la transition : coupe sèche vers un écran presque vide (2,2–2,7 s). |
| Lisibilité à 360 px | 8 | Bouton, cartes, téléphone, KPI et titres lisibles. |
| Mouvement | 7 | Tracé du mot-symbole trop fin et lent (2,8–3,9 s mesurés quasi figés) ; fin figée 29,2–29,9 s (lueur cachée sous le fond blanc). |
| Composition | 8 | Corrigée avant ce rendu : mot-symbole, cartes et téléphone recadrés. |
| Profondeur | 8 | Plans inclinés, flou de profondeur, cartes épaisses et ombres portées. |
| Synchro | 8 | 108,0 BPM mesurés, chaque idée sur un downbeat, 23 effets alignés. |
| Polish | 7 | Encoche du téléphone en rectangle noir, lue comme une censure. |
| Marque / fidélité à la référence | 8 / 8 | Jaune UTOPICAR à la place de l'accent de la référence, vraies captures, contours réels d'Archivo. |

## V4 round 2 — version livrée
Corrigé : volet jaune qui couvre tout le cadre avant de dévoiler le tracé, tracé plus épais et plus rapide,
lueur jaune derrière le logo et avancée lente en fin, encoche en pastille.
| Critère | Note | Constat |
|---|---|---|
| Hook | 8 | Lueur (0,8 s), mosaïque et carré du logo (1,6 s), volet plein cadre, tracé net dès 2,6 s. |
| Lisibilité à 360 px | 8 | « Analyser le dossier », −1 200 €, 7 500 €, 1 450 € sous la cote, 14 820 €, titres, CTA. |
| Mouvement | 8 | Seul passage calme : 3,17–3,87 s, contour tracé qui attend son remplissage sur le temps fort (3,89 s), assumé. |
| Composition | 8 | Rien d'essentiel coupé ; textes dans la zone sûre. |
| Profondeur | 8 | Inchangée. |
| Synchro | 8 | Inchangée ; mix −14,0 LUFS, true peak −1,3 dBTP. |
| Polish | 8 | 1080×1920, 30 i/s, 30,0 s, 8,4 Mo. |
| Marque / fidélité | 8 / 8 | Inchangées. |

Point à connaître : au survol de la page « Analyser », le champ vide affiche le texte d'exemple réel de l'app
(« https://www.leboncoin.fr/ad/voitures/… »), petit et flou. C'est la vraie interface, mais il nomme une plateforme tierce.
Limite : audio vérifié par mesure, pas écouté.

# V5 — explicatif 60 s (grammaire de la référence 3)

Logo fourni par l'utilisateur en cours de production (image dans la conversation) : retracé en vecteur
(`assets/brand/logo.svg`), accent du film passé du jaune du site à l'orange du logo `#FF5A1F`.

## V5 round 1
| Critère | Note | Constat |
|---|---|---|
| Hook | 7 | Chips d'UI qui flottent et phrase en deux graisses dès 0,2 s, mais texte 74 px trop petit sur téléphone. |
| Lisibilité à 360 px | 7 | Chiffres géants, titres de chapitre et CTA nets ; phrases du problème petites. |
| Mouvement | 6 | Plans figés mesurés : 12,1–13,7 s (pastille), 39,7–43,7 s (Sans / Avec), récap 44,7–49,8 s, fin 57,3–60 s. Sortie de Sans / Avec en simple fondu (interdit). |
| Variété | 8 | Chips, flash, chapitres, rapport, recherche, parc, KPI, chiffres, Sans / Avec, récap, explosion, fin. |
| Marque | 8 | Logo au flash (8 s), au centre (9,5–14 s), dans « Avec », pastille de fin. |
| Synchro | 8 | 120,0 BPM mesurés, 41 repères sur la grille, logo sur un downbeat (52 s), CTA sur un beat (54 s). |

## V5 round 2
Corrigé : phrases du problème à 88 px ; poussée lente et flottement sur la pastille et la phrase (10–14 s) ;
Sans / Avec : poussée continue, « ? » qui oscille, cartes qui remontent, sortie en mouvement (plus de fondu seul) ;
récap : frappe immédiate et poussée lente ; fin : cartes qui dérivent plus, le curseur clique « GARAGE » à 57 s.

# V6 — « conversation » 60 s (grammaire de la référence 4)

## V6 round 1
| Critère | Note | Constat |
|---|---|---|
| Hook | 6 | À 0,2 s, petite tuile seule ; barre de recherche et texte petits sur téléphone. |
| Lisibilité à 360 px | 7 | Phrases de l'aplat très lisibles ; légendes des panneaux (50 px) petites. |
| Mouvement | 6 | Figés : anneau-minuteur 5,4–7,2 s, logo 9,9–11,3 s, panneaux (35,3–36,6 s, 39,7–40,9 s), fin 57,6–59,3 s ; 25,7–26,2 s cadre vide après la fenêtre. |
| Variété | 9 | Recherche, aplat, minuteur, logo, anneau, tableau, essaim, fenêtre 3D, macro, 4 panneaux, icônes, pause, message, kaléidoscope. |
| Marque | 8 | Logo dans la barre (0 s), pop (9,4 s), macro (28 s), centre de l'anneau (43 s), fin. Tuile invisible sur l'aplat avant correction (même couleur) : fond passé à `#2B1D16` + liseré clair. |
| Synchro | 8 | 128,0 BPM mesurés, 46 repères sur la grille, silence net sur la pause noire, logo sur un downbeat (52,5 s). |

## V6 round 2
Corrigé : la tuile s'ouvre en grand (×2) puis devient une barre de 930 px, texte 48 px sans toucher la loupe ;
poussée lente sur la phrase du minuteur ; logo : poussée + deux ondes orange sur les temps ; panneaux : poussée
continue, légendes 64 px ; fenêtre qui sort juste avant la coupe ; fin : poussée plus nette, second clic sur le
bouton (57,19 s, sur le temps), logo de fin réduit pour rester hors de la marge droite.

## V5 round 2 (rendu) → round 3
| Critère | Note | Constat |
|---|---|---|
| Hook | 8 | Phrases 88 px lisibles à 360 px dès 0,9 s, chips d'UI nettes autour. |
| Lisibilité à 360 px | 8 | Chiffres géants, titres, rapport, CTA. |
| Mouvement | 8 | Figés restants : 7,1–7,8 s (phrase finie), 8,7–9,5 s (flash), 24,8–25,5 s (formulaire avant le clic). |
| Variété | 8 | Inchangée. |
| Marque | 8 | Mais le mot-symbole du flash touchait la marge droite (x ≈ 1060). |
| Synchro | 8 | Inchangée. |
Corrigé pour le round 3 : logo du flash réduit (80 px, dans la zone sûre) et poussée lente ; poussée sur les phrases et
le formulaire ; les textes sont coupés net au changement de plan (ils finissaient de sortir sur l'aplat orange).

## V6 round 2 (rendu) → round 3
| Critère | Note | Constat |
|---|---|---|
| Hook | 7 | La tuile s'ouvre en grand, mais « UTOPICAR en 60 secondes » reste petit à 360 px. |
| Lisibilité à 360 px | 8 | Légendes 64 px, phrases de l'aplat, chiffres. |
| Mouvement | 7 | Figés : 22,0–22,6 s et 24,1–25,1 s (fenêtre posée) ; pause noire et « Mais » voulus. |
| Variété | 9 | Inchangée. |
| Marque | 8 | Logo lisible sur l'aplat (liseré). |
| Synchro | 8 | 47 repères sur la grille. |
Corrigé pour le round 3 : recherche raccourcie « UTOPICAR en 60 s » en 62 px ; la fenêtre avance, grossit et respire
en continu une fois à plat.

## V5 round 3 — version livrée
| Critère | Note | Constat |
|---|---|---|
| Hook | 8 | Chips d'UI + « Des annonces partout… » 88 px dès 0,5 s. |
| Lisibilité à 360 px | 8 | Toutes les phrases, chiffres géants, CTA ; UI lue grâce au curseur et aux surligneurs. |
| Mouvement | 8 | Seuls passages calmes : logo sur l'aplat (8,5–9,5 s, poussée lente), « Tu revends. » (48,5–49,8 s), dernière seconde. |
| Variété | 8 | Une idée nouvelle toutes les 2 s (grille de 2 s). |
| Marque | 8 | Logo fourni, orange du logo, dans la zone sûre. |
| Synchro | 8 | 120,0 BPM mesurés, 42 repères sur la grille, logo sur le downbeat de 52 s. |

## V6 round 3 — version livrée
| Critère | Note | Constat |
|---|---|---|
| Hook | 8 | La tuile logo s'ouvre en barre, « UTOPICAR en 60 s » en 62 px, clic loupe à 2,8 s, coupe sur « Bon. ». |
| Lisibilité à 360 px | 8 | Phrases de l'aplat, légendes 64 px, chiffres, bouton final. |
| Mouvement | 8 | Passages calmes voulus seulement : « Mais » avant « c'est pas tout. », pause noire (curseur qui clignote), frappe du message. |
| Variété | 9 | 16 plans différents en 60 s. |
| Marque | 8 | Logo au début, au pop, en macro, au centre des icônes, à la fin. |
| Synchro | 8 | 128,0 BPM mesurés, 47 repères sur la grille, silence net sur la pause noire. |

Contrôle son sur le MP4 livré (et plus seulement sur le WAV) : l'encodage AAC ajoutait jusqu'à 2 dB sur les crêtes
(v5 : +0,9 dBTP). Mix refait avec un plafond de travail à −3,5 dBTP (`MIX_CEIL`), audio remuxé sans réencoder l'image :
v5 −14,0 LUFS / −1,5 dBTP, v6 −14,0 LUFS / −3,0 dBTP. Limite : audio vérifié par mesure, pas écouté.
La v4 (`9x16-saas.mp4`) mesurait −0,6 dBTP après AAC : même correction, audio remuxé → −14,0 LUFS / −2,2 dBTP. v2 et v3 : −1,1 dBTP, dans la cible.

## V7 « Ah ouais » 28 s, sans voix (A et B)
Mesures `qa_video.py` sur les MP4 finaux : −14,0 LUFS ; true peak −3,0 dBTP (A) / −2,5 dBTP (B) ; image 0 pleine ;
aucune image vide ; aucun plan figé ; 35 % d'énergie sous 150 Hz (v5 : 88 %) ; son des 2 premières s à ~2 LU du reste.
Seul WARN restant : zones sûres pendant les entrées/sorties en mouvement (≤ 0,25 s), aucun texte posé hors zone.
- Round 1 : « − 1 200 € » débordait (mesure de largeur fausse : espaces non comptés) → mesure de l'étendue réelle des
  lettres ; chrono collé au libellé → zone de texte descendue ; annonce Clio trop haute → fenêtre qui défile ;
  true peak +0,5 dBTP après AAC (clic du bouton sur un kick) → clic adouci ; 80 % d'énergie sous 150 Hz → kick
  plus haut, passe-haut 75 Hz musique / 90 Hz bruitages.
- Round 2 : aplat orange vide à 22,0 s → texte déjà entré à la coupe ; carton final figé → poussée + second clic ;
  logo de fin hors zone gauche → pastille réduite.
- Round 3 : lignes de frais illisibles à 360 px → agrandies avec marge intérieure ; phrase finale figée → poussée.
Notes : hook 8, clarté 8, lisibilité 360 px 8, zones sûres 8, mouvement 8, rythme 8, marque 8, son 8 (mesuré, non
écouté), conformité 9.

## V8 explainer 58 s, sans voix (voix de Simon bloquée par ElevenLabs)
Mesures `qa_video.py` sur le MP4 final : 58,17 s, −14,0 LUFS, true peak −1,7 dBTP, image 0 pleine, aucune image vide,
aucun plan figé, 33 % d'énergie sous 150 Hz ; seul WARN : zones sûres pendant les entrées/sorties en mouvement.
- Round 1 (images fixes) : éléments en attente visibles en bas du cadre → cachés avant leur entrée ; lignes de frais et
  panneaux du tableau hors zone basse → réduits/replacés ; cartes qui masquaient « C'est fini. » → passées derrière.
- Round 2 (aperçu 540p) : plans figés pendant la voix, image vide à une coupe → poussée de caméra par chapitre,
  en-têtes déjà visibles à la coupe ; version sans voix → légende courte par étape.
- Round 3 (rendu 1080p) : chapitres qui restaient 1,5 s sur le seul titre → premier élément avancé ; carton final
  4,7 s → 3,5 s.
Notes : hook 8, clarté 8, lisibilité 8, zones sûres 8, mouvement 8, rythme 8, marque 8, son 8 (mesuré, non écouté),
conformité 9.

## V9 explainer 60 s, voix de Simon + sound design réel
Voix : Simon (eleven_v3), prise A sur 2 (transcription plus propre), 69 s resserrée à 57,8 s (32 silences ramenés à
0,28 s, atempo 1,10), 40 repères du film posés sur ses mots. Bruitages réels ElevenLabs : clic, Ctrl+V, whoosh,
carte qui glisse, notification, scratch ; synthèse pour les impacts sous les chiffres et le logo.
Review de la version sans voix → corrections : lignes du parc et puce de recherche trop petites (agrandies, 2 lignes),
dossiers qui se chevauchaient (espacés), titre de l'annonce coupé (fiche entière), cartes des douleurs dans la zone
TikTok basse (remontées), « Regarde bien. » → « Écoute bien. ».
Rendu 1 : image vide à 35,75 s et dernière seconde figée → « 1 450 € » entre avant la sortie de la fiche, fin animée
(poussée, second clic sur GARAGE). Rendu 2 : −14,0 LUFS, −3,2 dBTP, aucune image vide, aucun plan figé, 24 % d'énergie
sous 150 Hz ; seul WARN : zones sûres pendant les entrées/sorties en mouvement.

## 3 pubs TikTok 10–15 s (voix Simon)
Mesures `qa_video.py` sur les MP4 finaux : ads1 12,2 s / ads2 12,5 s / ads3 14,1 s ; −14,0 LUFS ; true peak −3,4 à
−3,6 dBTP ; image 0 pleine ; aucune image vide ; aucun plan figé ; 21–28 % d'énergie sous 150 Hz. Seul WARN : zones
sûres pendant les entrées/sorties en mouvement (≤ 0,25 s).
- Round 1 (images fixes) : fiche de l'ads2 coupée en haut (« l'annonce ») → recadrée sur le prix ; « 14 820 € » en
  double dans la zone basse (ads3) → retiré, la vraie carte KPI suffit.
- Round 2 (rendus) : image vide avant « En 2 secondes » (ads1) et à la coupe du carton final → relais anticipés, carton
  visible dès sa première image ; « Commente GARAGE » hors marge gauche pendant la poussée → 84 px, poussée réduite.
- Round 3 : chevauchement « frais compris » / « En 2 secondes » (ads1) → relais décalé.

## Remakes de la vidéo validée : MO1 (réf. 1, typo marine) et MO2 (réf. 2, verre bleu), avec et sans voix
Même récit, mêmes repères sur la voix de Simon, même musique ; bruitages propres à chaque style (`cues-mo.mjs`).
- Round 1 (rendu MO1) : « Commente GARAGE » hors marge gauche, cartes « dossiers » trop larges, plan logo figé 1,3 s
  → CTA réduit, cartes resserrées, la goutte orange tourne autour du logo.
- Round 2 (rendu MO2) : mot « UTOPICAR » au-dessus de la bulle décalé à droite et hors zone (texte plus large que sa
  boîte) → mis à la largeur puis centré ; étiquettes en orbite hors marges → orbite resserrée.
- Round 3 (retour utilisateur sur téléphone : « marges trop serrées, logo juste posé, on dirait que c'est décalé ») :
  captures collées au bord de leur carte (frais, « Il vous reste », note, texte de l'annonce, « sous la cote ») →
  chaque capture posée dans une coque blanche avec marge intérieure, recadrages refaits sur les sources, surlignage
  « − 1 200 € » recalé ; logo = carré sombre non carré avec liseré → vraie icône d'app iOS (superellipse, dégradé,
  liseré de lumière, ombre portée), mot-symbole proportionné ; tout était centré sur x = 500 (centre de la zone sûre)
  et paraissait décalé à gauche sur un téléphone → centre visuel 540, largeur utile 800 px (140 → 940) pour rester
  hors des boutons TikTok ; cartes des frais qui recouvraient « Données de démonstration » → remontées.
- Icône invisible au premier essai (même SVG inséré deux fois : dégradé référencé dans un élément masqué) →
  identifiants uniques par insertion.
Versions sans voix : même film, « Écoute. » → « Regarde. » (1,5–2,9 s rendus à part puis incrustés), mix sans voix.
- Round 4 (rendus finaux) : carton final « figé » 1 s selon `qa_video.py` → le CTA bat trois fois et, sur MO1, la goutte
  orange tourne autour du logo et du CTA ; CTA aligné sur les carrousels : « Commente GARAGE et reçois ton accès. ».
- Incrustation : le filtre ffmpeg `overlay` avec décalage de temps laissait passer l'ancienne image en encodage
  complet (vérifié image par image) → nouveau `scripts/splice.py` (découpe à l'image près + concat, contrôle du nombre
  d'images) ; écart moyen entre l'image livrée et l'image rendue ≈ 1,3 (bruit d'encodage).
Mesures `qa_video.py` sur les 4 MP4 finaux : 10 contrôles OK sur 10 (zones sûres, image 0, aucune image vide, aucun plan
figé, −14,0 LUFS, true peak −3,1 à −1,6 dBTP, son dès les 2 premières secondes, 24–33 % d'énergie sous 150 Hz).
Son mesuré, pas écouté.

## MO1 v2 (`film-mo1b/`) : voix de Simon plus naturelle, éléments graphiques animés, curseur actif
Retours : plus de mouvement et de graphiques dans la vidéo, une voix moins « IA » (pauses, vraies phrases, mimiques,
personnalité) et un curseur de MO2 « sans vie ». Détail dans `brief-mo1b.md`.
- Round 1 (planche contact 1 image / 2 s) : « Regarde. » plus large que le chrono (dépassait à droite) → les deux mots
  tiennent dans l'anneau ; « =SOMME(B2:B9) » recouvert par « #REF! » → colonnes du tableur recalées ; calendrier
  « jours en stock » hors zone droite → réduit et rentré ; au CTA, la goutte passait devant le logo → elle tourne
  derrière.
- Round 2 (`qa_video.py`) : compteur « + 300 € » collé en haut de l'écran pendant 0,3 s (échelle calculée à NaN avant
  le premier ticket de frais) → corrigé ; tampon NO GO, réglette de prix et « cote 7 850 € » dans la zone des boutons
  TikTok → rentrés ; la goutte recouvrait « 6 k€ » → réglette remontée.
- Round 3 (rendus finaux) : restent en WARN le curseur qui entre par la droite et le tampon NO GO pendant son impact
  (< 0,25 s, échelle 2,2) ; l'image « vide » à 16,5 s est la fleur orange plein écran de la transition, voulue.
Plages corrigées rendues à part puis incrustées avec `scripts/splice.py` (1 879 images contrôlées).
Mesures : −14,0 LUFS sur les deux ; true peak −2,8 dBTP (voix) et −3,3 dBTP (sans voix) ; son dès les 2 premières
secondes ; aucun plan figé. Son mesuré, pas écouté.

## Recentrage sur l'axe de l'écran (retour utilisateur : « tout est décalé à gauche, c'est bâclé »)
Mesure du centre de l'encre de chaque bloc sur les images rendues (`center.py`, bande par bande) :
- carrousels (150 images), pubs 1-3 et explainer60 : tout était centré sur x = 500 (centre de la zone sûre 60 → 940),
  soit 40 px à gauche de l'axe de l'écran ; MO1, MO2 et MO1 v2 : cartons centrés à ± 3 px, mais dans MO1 v2 les fiches
  du parc étaient posées à x = 470 pour laisser place au calendrier.
- Corrections : carrousels sur une colonne symétrique 140 → 940 (captures ≤ 790 px, garde-fou de largeur) ; pubs et
  explainer60 : tout le contenu (hors fonds) recentré d'un bloc (+ 40 px, × 0,909 autour de x = 500 : 60 → 140,
  940 → 940) ; MO1 v2 : parc centré, calendrier sous les fiches.
- Après : écart médian des blocs larges − 0,5 px (carrousels), + 1 à + 2 px (pubs), − 1 px (explainer60), + 1 px (MO1 v2).
  Les écarts restants sont voulus (texte aligné à gauche dans les captures, curseur, tampons inclinés, entrées en cours).
Règle ajoutée à `video/CLAUDE.md` et au skill motion-studio : centrer sur x = 540, jamais sur le centre de la zone sûre.

## MO3 (`film-mo3/`) : plus d'humain, gros hooks, d'après la référence 5
Brief et script : `brief-mo3.md`. Grammaire mesurée image par image : `docs/ref5_style_guide.md`
(`scripts/ref-frames.py`, 4 246 images lues, planches à 0,1 s). Voix : Simon (eleven_v3), 2 prises par bloc,
choisies sur transcription (prise du corps B écartée : une phrase manquante) ; silences resserrés et régions de parole
mesurées sur l'énergie (`vo-mo3.py`) car whisper glisse jusqu'à 1 s aux pauses.
- Round 1 (images clés) : titre de l'annonce sur deux lignes, compteur collé à la mention démo, « Je sais ce qu'il me
  reste » coupé au mauvais endroit, éclat de traits sur « 7 500 € » → corrigés ; « − 1 200 € » (B) plus large que
  l'écran → ajusté à la colonne de 800 px.
- Round 2 (images clés des ouvertures) : image 0 presque vide en A et C, image vide au raccord de B (le chiffre sortait
  avant l'arrivée des frais) → l'ouverture chevauche la pluie de frais ; lignes de vitesse qui barraient le chiffre →
  deux bandes au-dessus et au-dessous.
- Round 3 (notre rendu repassé dans `ref-frames.py`) : une scène toutes les 2,07 s (réf. 2,14 s), mais ouverture A
  figée 3,2 s (réf. : une nouveauté toutes les 0,8 s) et deux images presque vides (9,0 s et 11,8 s) → la caméra suit
  l'hésitation de Simon, cercle rouge tracé sur « − 1 200 € » pendant « Les frais. », raccords qui se chevauchent ;
  traversée de « parfaite. » qui grisait l'écran → les lettres s'effacent avant.
- Round 4 (`qa_video.py`) : avec la poussée de caméra, « Volkswagen Golf VII » et « Le prix » entraient dans la zone
  des boutons TikTok (x 963) → carte réduite, poussée adoucie, mesuré : contenu entre x 200 et 909. Plage 0–4,8 s
  rendue à part et incrustée (`splice.py`, FPS=60).
Restent en WARN (transitoires, < 0,5 s) : le logo flou pendant la plongée, le curseur qui entre, l'éclat de traits
autour de « 7 500 € ». Mesures sur les MP4 : −14,4 LUFS, true peak −4,0 dBTP, son dès l'image 0, aucune image vide,
aucun plan figé. Son mesuré, pas écouté.
- Round 5 (ouvertures B et C, `qa_video.py`) : en B, « − 1 200 € » glissait depuis la droite et débordait de la colonne
  pendant 0,5 s (l'image vignette) → centré dès l'image 0, il vit en place (flou, échelle) ; mesuré x 177–926 sur
  toute l'ouverture. Plage 0–4,4 s incrustée. Le WARN restant à 0–0,5 s vient des lignes de vitesse (décor).
  C : aucun problème trouvé ; mêmes WARN transitoires que A.
