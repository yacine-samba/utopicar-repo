# MO12 « La pochette » : journal de critique du film

Film : `film-mo12/index.html` + `film-mo12/film.js`, sur `lib/kit47.js` (lecture seule), `lib/kit47-pochette.js` et
`film-mo12/clock.js`. Minutage lu dans `audio/vo-mo12/vo-timing.json` : **provisoire** (aucune prise de Simon,
ElevenLabs bloqué), piste voix muette. Grille : `video/CLAUDE.md` § Contrôle qualité et
`.claude/skills/motion-studio/references/qa-delivery.md`. 8 = publiable sans gêne.

## Round 1 (9 octobre 2026, critique seule : le film n'a pas été modifié)

**Matériel regardé**
- Planches toutes les 0,1 s refaites : `renders/review/mo12-planche-0.1s-0-10.jpg`, `-10-20.jpg`, `-20-31.05.jpg`
  (311 images, regardées par secondes, 10 images à la fois en 270 × 480). Identiques aux planches de 8 h (écart moyen
  0,14 à 0,21 sur 255, bruit JPEG) : aucune source du film n'a changé depuis.
- Test téléphone à 360 px : `renders/phone-mo12.png` (0 · 2,75 · 3,6 · 4,3 · 8,4 · 9,3 · 12,4 · 16,3 · 20,4 · 25,5 ·
  26,8 · 28,9 s).
- Images pleine définition : `renders/stills-mo12/` (2,75 · 3,6 · 4,3 · 5,6 · 8,4 · 9,4 · 13,0 · 15,0 · 16,3 · 17,4 ·
  22,0 · 25,5 · 26,8 · 28,9 · 29,3 · 29,75 s, plus 0 et 31,033 pour la boucle).
- Son : `audio/mix-mo12.wav` et `audio/stems-mo12/` mesurés (RMS toutes les 0,1 s et 0,05 s), `docs/mix_report-mo12.txt`.
  **Rien n'a été écouté.**
- Aucune erreur `PAGEERR` ni `CONSOLE` sur les trois planches, le test téléphone et les images fixes.

**Notes**

| Hook | Lisibilité 360 | Zones sûres | Mouvement | Variété / rythme | Marque | Voix (provisoire) | Son | Recette 47 / envie |
|---|---|---|---|---|---|---|---|---|
| 6 | 7 | 9 | 7 | 6 | 8 | 8 | 7 | 7 |

Pas livrable en l'état (hook, variété < 8).

**Mesures**
- Zones sûres sur les 18 images pleine définition (méthode de `qa_video.py` : gradient > 60 à mi-définition, fenêtre
  de 80 px, seuil 0,035) : **aucune** zone interdite touchée. Contenu net de x = 94 à 954 et de y = 244 à 1 464 ; la
  mention (y ≈ 1 464) est le contenu le plus bas, au-dessus de 1 480. Sur les 311 images des planches (quart de
  définition) : seuls le contour de la C3 (2,9 à 3,1 s, à gauche, voiture en mouvement) et le bord droit de la pochette
  du mardi (x ≈ 940 à 948, de 20 à 29,4 s) frôlent une marge ; ni texte, ni logo.
- `qa_video.py` sur un **montage témoin** (pas un rendu : les 311 images des planches agrandies en 540 × 960 à
  10 i/s, avec `audio/mix-mo12.wav`, AAC 256 k ; scratchpad, hors dépôt) : **aucun FAIL**. Un WARN de zone à droite
  (1,50 à 2,75 s et 5,00 à 5,50 s) : c'est le contour de la C3, pas un texte. −14,2 LUFS, −3,7 dBTP sur le MP4 encodé,
  2 premières secondes à −13,5 LUFS contre −14,7 sur le reste, 31 % de l'énergie sous 150 Hz, 25 % entre 1 et 5 kHz,
  première image pleine (écart-type 45,8), aucune image vide, aucun plan figé de plus de 0,9 s. Les zones de ce
  témoin ne valent pas une mesure du rendu final : à refaire sur le MP4.
- Boucle : écart moyen 0,095 sur 255 entre l'image 0 et 31,033 s.
- Voix provisoire : 72 mots écrits, 20,15 s de parole, 2,32 mots par seconde de film (MO5 : 2,53 ; MO9 : 2,36),
  3,57 mots par seconde de parole ; écarts entre répliques de 0,30 à 2,81 s (0,30 à 0,45 s dans un même temps),
  aucun chevauchement ; dernière réplique finie à 30,83 s, film de 31,05 s. « vendue » finit à 3,49 s (le brief la
  plaçait à 3,15 s) : le sens de la phrase 2 ne se ferme à l'oreille qu'après la mesure à 3 s.
- Son (mesuré, pas écouté) : arrêt de bande sur « 20 min » à 0 image, musique muette de 17,95 à 20,65 s, reprise
  mesure 55 à 22,002 s ; mais la piste bruitages monte à −12 dBFS de 18,15 à 18,25 s (son « 20 min », rôle accent,
  0,8 s) sous « Vingt minutes », dans le silence de la chute ; limiteur jusqu'à −11 dB (17,76 s), 19,4 % du film à
  plus de 3 dB de réduction ; l'attente descend à −27 / −39 dBFS (10,6 à 12,0 s).

**Ce qui marche** : l'image 0 est composée et propre (horloge 11:00, bulle « Je suis devant. », tasse, C3 détourée et
son étiquette, mention), la boucle est exacte, l'horloge à rouleaux roule vers l'avant et sert de chiffre héros du début
à la fin, le retour court (4,8 à 5,1 s) et le grand rembobinage (20,7 à 21,9 s) se lisent, « 20 min » et la tasse
tracée font une vraie chute, la liste du mardi est complète et lisible de 25,7 à 28,9 s, « refait le 6 oct. · 78 € »
sous le contrôle d'achat barré donne le verdict chiffré. Aucun logo, aucune plaque, aucun visage (vidéos des clés, du
volant, du téléphone, du stylo et du pont vérifiées), aucun site d'annonces nommé.

### Les 3 problèmes les plus graves

**1. Le hook se vide entre 2,8 et 4,8 s, au moment de la mesure à 3 s.** Le tampon VENDUE frappe à 2,58 s et la C3
part à 2,81 s : il reste lisible 0,23 s à l'arrêt, et à 360 px c'est un mot orange de 10 px posé en travers de
« 2 700 € », dont les chiffres restent visibles dessous (`stills-mo12/t02.750.png`). De 3,3 à 3,9 s, le centre de
l'image est vide (le flou orangé seul, `t03.600.png`) ; la bulle du beau-frère arrive à 3,89 s, petite, à droite,
au-dessus du vide (`t04.300.png`). Ni le Sens (« vendue » finit à 3,49 s) ni l'Écart (« 20 min ? Impossible. ») ne
sont à l'image avant 3 s. Corrections (`film-mo12/film.js` et `index.html`, sans toucher au texte du hook) :
- `T.go` (ligne 28) : `M('vingt') + 0.55` → `M('vendue') + 0.05` (≈ 3,23 s) : la C3 garde VENDUE à l'arrêt pendant
  0,65 s et part sur « vendue » ; elle a quitté l'image à 3,8 s, quand la bulle arrive.
- Tampon (`index.html`, `.etiq .stamp`, ligne 76) : `font-size` 58 → 92 px, `background` .55 → .92 (cache le prix au
  lieu de s'y superposer), tampon plus large que l'étiquette (il déborde : c'est un tampon, pas un texte imprimé).
  Cible : lettres de 14 px au moins à 360 px.
- Bulle du beau-frère (lignes 391 à 394) : posée à la place libérée par la voiture, centrée sur 540 :
  `transform-origin: 50% 50%` (ligne 199) et `translate(${540 - bfW / 2 + 380 * (1 - bfa)}px, 900px) … scale(1.35)`
  (`clipX` sur les bords mis à l'échelle ; ≈ 470 px de large → 635 px, de 222 à 858), arrivée de travers par la
  droite comme aujourd'hui. Texte à 54 et 62 px (18 et 21 px à
  360). Vérifier `at.mjs 2.6,3.0,3.4,3.8,4.2` : VENDUE lisible à 3,0 s, jamais de centre vide.

**2. Collisions et textes superposés pendant les papiers (7,9 à 9,7 s, puis 13,5, 16,3 et 25,0 s).** La case 1
(`PY[0] = 630`, ligne 186) touche le bas de la bulle de l'acheteur (528 → 632) et la tasse (soucoupe jusqu'à
y ≈ 650) : à 8,4 s, « Pas de gage ? » est mordu par la carte « Contrôle » et la soucoupe se pose sur sa vignette
(`t08.400.png`) ; à 9,3 s, « La carte grise ? » passe sous « Cession ». Une carte qui sort de la pochette monte
derrière les autres (`zIndex` 1 tant que `a < 0.97`, ligne 341) et son texte se lit à travers leur verre : « Carte
grise · à barrer » sous « Contrôle » à 9,4 s, « Déclaration de cession · 0,00 € » sur « Situation adm. » à 13,5 s.
Au rangement, « Vendu le 10/10/2026 · 11 h 16 » reste à 15 % sous le bandeau « Carte grise » (16,3 s). Corrections :
- La tasse sort à la première carte : ligne 395, `cOut = S(st, T.c[0] - 0.15, P.push)` et, ligne 396,
  `k: pres * (1 - sm(T.c[0] - 0.1, T.c[0] + 0.15, st))` (au lieu de `T.phone`).
- `PY = [652, 838, 1024, 1216, 1312, 1332]` : 20 px d'air sous la bulle ; la case 3 finit à 1 194, au-dessus de la
  pochette (1 200).
- Texte d'une carte qui sort de la pochette : après `KP.paintDoc` (ligne 338), si `s.from === 'p'`, multiplier
  l'opacité de `s.d.name.e` et `s.d.value.e` par `sm(0.75, 0.97, a)` (le texte entre une fois la carte sortie, règle du
  conteneur). Même chose au mardi pour la carte qui se pose sur les bandeaux (lignes 407 à 413).
- Ligne 367 : `1 - 0.85 * clamp(…)` → `1 - clamp(…)` (« Vendu le… » disparaît au rangement).

**3. Le gag n'arrive pas seul (15,7 à 17,0 s).** « Site qui imite l'officiel · − 49,90 € » entre comme une carte de
plus, à l'échelle 0,9, au sommet d'une pile de quatre cartes et d'un bandeau qui restent pleins (`t16.300.png`,
`phone-mo12.png`) : titre à 12 px et « ton beau-frère » à 10 px à 360, même poids visuel que « Code de cession ». C'est
le moment qu'on envoie (« Ton beau-frère l'a payée. ») et le brief le veut « seul, de travers ». Corrections
(lignes 330 à 356) :
- Un `gagF = sm(T.gag + 0.1, T.gag + 0.3, st) * (1 - sm(T.cles - 0.1, T.cles + 0.1, st))`, appliqué comme `focus` :
  les autres cartes à `on × (1 − 0.65 gagF)` et `sc × (1 − 0.04 gagF)`.
- Le gag à `scale(1.12)` au lieu de `.9`, centré sur 540 (origine au centre : `translate(${150 + jx}px, 700px)` ;
  la notification visible, 702 px, passe à 786 px, de 147 à 933, dans la colonne), toujours à −4° et tremblant ;
  `ton beau-frère` en 40 px orange (ligne 179). Cible : titre ≥ 15 px à 360.

### Les autres problèmes

4. **La chute ne tient pas : « encore chaud. » n'est complet qu'un instant.** La dernière lettre se remplit vers
   20,75 s (`T.chaud = 19,95`, 0,04 s par lettre) et la sortie part à 20,61 s (`REW[0] − 0,08`). Corrections :
   `T.chaud: M('encore') - 0.25`, `writeWord(wChaud, t, T.chaud, 0.025)` (ligne 476) et `REW[0] = ME('chaud') + 0.3`
   (ligne 50) : mot complet et immobile 0,5 s, rembobinage encore de 1,1 s.
5. **L'attente (10,0 à 12,0 s) se voit à peine** : une pile figée, un anneau de 110 px dans le coin de la carte et le
   chiffre des minutes qui hésite. `focus` à 0,75 au lieu de 0,5 (ligne 331), anneau `scale(1.6)` (ligne 359), poussée
   de caméra `z` + 40 sur `T.wait` (ligne 94).
6. **Quatre passages presque figés en plus de l'attente** : 0,4 à 2,1 s (horloge à 11:00, seuls la vibration, le
   reflet et la pulsation bougent), 13,8 à 15,2 s (seul « 0,00 € » s'allume, à peine visible), 16,0 à 17,0 s (le gag),
   30,1 à 31,05 s. Le « 0,00 € » : `lit` à 1 et un petit rebond d'échelle (1,12 → 1) sur `T.zero`. Les 11 s du milieu
   (6,5 à 17,5 s) répètent la même forme neuf fois (carte de verre, pile qui descend) : le gag (problème 3) et les
   clés sont les deux endroits où casser la forme.
7. **Le retour à l'image 0 est un fondu enchaîné** (29,6 à 29,9 s, `t29.750.png`) : la liste et la pochette, à
   demi transparentes, par-dessus la C3, « Situation adm. » sur le pare-brise, la palette « 1 » sur l'anneau « 6 mois ».
   Ligne 399 : sortie du mardi en `LOOP + 0.04 → LOOP + 0.2` au lieu de `+ 0.42` ; ligne 282 : la C3 revient après,
   `1 - eo(LOOP + 0.2, LOOP + 1.1, t)`.
8. **Le rabat se ferme sur la ligne du verdict** (29,1 à 29,5 s) : PRÊTE cache « Contrôle · 78 € » pendant « tu le
   refais ». Rabat du mardi moins haut (`flapH` 110 → 70, ligne 228) ou fermeture à `ME('refais') + 0.05`.
9. **Petits textes à 360 px** : « 1re REVENTE · SAMEDI » (30 px gris, 10 px à 360 : c'est le Miroir de l'image 0),
   « Acheteur » et « Beau-frère » (24 px), « 2 ans pour rouler » et « < 6 mois à sa carte grise » (36 px, la phrase à
   garder), « bon jusqu'au 9 sept. » (32 px), « le 6 oct. · 78 € » (40 px), « sur ton compte » (26 px). Proposé :
   `.lab` 40 px et encre à 85 %, `.bub .n` 30 px, `.xl` 44 px (gris à 85 %), `achSub` 38 px, `achW2` 48 px ; « sur ton
   compte » à 32 px ou retiré.
10. **La seconde sortie de la C3 (17,15 s) ne se voit pas** : elle passe derrière la pile, floue, au bord gauche.
    Avec le `gagF` du problème 3 prolongé jusqu'à `T.big`, la pile s'efface et la voiture qui part redevient lisible.
11. **Les clés (17,0 à 17,8 s)** : un rectangle blanc pur dans un film sombre, un homme en costume (le vendeur, c'est
    « tu »). `drawCrop(clesCv, …, 1.15)` → zoom 1.7 sur la main et `filter: brightness(.82)` sur la vignette.
12. **Bord droit de la pochette du mardi à x ≈ 940 à 948** avec la dérive de caméra : `POM.w` 800 → 780 (150 → 930).
13. **Son** : le son « 20 min » (`audio-mo12.py`, ligne 263, 2909, rôle accent, `dur=0.8`) couvre « Vingt minutes »
    à −12 dBFS : `dur=0.35`, `fade=0.2`. Rôle accent (−4 dBFS de crête) à −7 pour soulager le limiteur (−11 dB).
    À remesurer avec la vraie voix (ducking, voix 7 dB au-dessus des bruitages).

### FAIL de `qa_video.py`

Aucun, sur le montage témoin (pas de MP4 rendu à ce round). Un WARN de zone droite (contour de la C3, pas de
texte). Les mesures à refaire sur le vrai rendu : zones, plans figés, true peak après AAC avec la voix.

### Ce qui n'a pas été vérifié

Le son n'a pas été écouté. Le hook B n'a pas d'image propre à juger (même film). La voix est estimée : si la prise de
Simon est plus lente (MO10 : 4,1 syllabes par seconde), les passages serrés seront « vendue » → départ de la C3,
« encore chaud. » → rembobinage, et la liste du mardi.

### Corrections appliquées après la critique du round 1 (9 octobre 2026)

Fichiers modifiés : `film-mo12/film.js`, `film-mo12/index.html`, `scripts/audio-mo12.py`. Régénérés :
`film-mo12/events.json` (`CUT=mo12 node scripts/events.mjs` : `go` 2,81 → 3,23, `bf` 3,887 → 3,667, `chaud` 19,948 →
19,778, `rew` 20,686 → 20,836), `audio/mix-mo12.wav`, `audio/stems-mo12/`, `docs/mix_report-mo12.txt`. Les repères de
la voix n'ont pas bougé : `vo-mo12.py` n'a pas été relancé. Aucun appel ElevenLabs.

**Vérifié sur des images regardées** : `renders/review/mo12-at.jpg` (dernier lot : 0,8 · 1,6 · 2,3 · 24,9 · 25,0 ·
25,05 · 29,0 · 29,3 · 29,55 · 29,7 · 30,0 · 30,6 s ; les lots précédents couvraient 2,6 → 4,6 s, 3,5 → 3,9 s toutes
les 0,1 s, 8,2 → 11,5 s, 13,5 → 20,6 s et 16,3 → 30,2 s), deux relevés toutes les 0,5 s sur tout le film
(`renders/review/mo12-at-survey-a.jpg`, 0 → 15 s, et `-b.jpg`, 15,5 → 30,5 s), le test téléphone refait
(`renders/phone-mo12.png`, 15 instants) et 20 images pleine définition dans `renders/stills-mo12/`. Les planches à
0,1 s n'ont **pas** été refaites (environ 20 minutes chacune sur la machine partagée) : celles du dossier datent d'avant
les corrections.

**Les 3 problèmes graves**
1. *Hook.* `T.go = M('vendue') + 0.05` (3,23 s au lieu de 2,81) : VENDUE reste à l'arrêt 0,65 s (2,58 → 3,23 s), la C3
   part sur « vendue » et a quitté l'image à 3,78 s. Le tampon `.etiq .stamp` passe à 92 px (au lieu de 58), avec un fond
   à .92 qui cache « 2 700 € » ; il déborde de l'étiquette, et ses lettres font environ 15 px de haut à 360
   (`phone-mo12.png` à 2,75 s). La bulle du beau-frère est centrée sur 540, à y = 900, à l'échelle 1,35 (de 230 à
   850 px), texte à 54 et 62 px. **Écart à la critique** : avec `T.bf = M('beaufrere') − 0.12`, l'image de 3,8 s
   restait vide. La bulle part donc à `M('beaufrere') − 0.28` (3,67 s) : elle entre par la droite pendant que la C3
   sort à gauche, et le centre n'est jamais vide de 3,5 à 3,9 s (une image toutes les 0,1 s).
2. *Collisions.* La tasse sort à la première carte (`T.c[0] − 0.15`). `PY = [652, 838, 1024, 1216, 1312, 1332]`. Le
   nom et la valeur d'une carte qui sort de la pochette sont multipliés par `sm(0.75, 0.97, a)`. Au mardi, le texte de
   la carte qui se replie en bandeau en tombant sort au début du repli et revient à la fin (règle du conteneur qui se
   transforme). « Vendu le… » s'efface en entier au rangement. Vérifié à 8,2 · 8,4 · 9,0 · 9,3 · 9,45 · 13,5 · 24,9 ·
   25,0 · 25,05 s : la bulle n'est plus mordue, la soucoupe ne touche plus la vignette, aucun texte ne se lit à travers
   le verre d'une autre carte. Il reste l'anneau (« 6 », « 15 ») d'une carte qui sort, visible une fraction de seconde
   au bord de la pochette (7,9 · 8,5 s) : c'est le tracé de l'anneau, pas un texte.
3. *Gag.* De `T.gag + 0.1` jusqu'à « 20 min », la pile passe en retrait (opacité × (1 − 0,72 F), échelle
   × (1 − 0,04 F)) ; le gag reste plein, puis passe lui aussi en retrait quand les clés arrivent. **Écart à la
   critique** : pas de `scale(1.12)`. La notification fait 780 px de large, pas 702 : à 1,12 elle irait de 103 à 977 px,
   hors de la colonne. Le gag est refait à 760 × 212 px (au lieu de 780 × 184 à l'échelle 0,9), il grandit de 0,92 à 1
   à l'arrivée, reste de travers (−4°) et tremble, posé 20 px au-dessus de la case 1 pour laisser la carte du dessous à
   découvert. Titre à 46 px (15,3 px à 360), « ton beau-frère » à 40 px en orange, montant à 64 px. Contenu net mesuré
   de 156 à 924 px à 16,3 et 16,9 s.

**Les autres points**
4. *Chute* : `T.chaud = M('encore') − 0.25`, 0,025 s par lettre, `REW[0] = ME('chaud') + 0.3` (20,84 s). « encore
   chaud. » est complet et immobile environ 0,4 s (de 20,45 à 20,84 s, vu à 20,1 et 20,6 s) ; le rembobinage dure 1,11 s.
5. *Attente* : retrait à 0,75 ; anneau du virement à 1,6 (176 px, centré dans la partie droite de la carte, de 560 à
   736 px) ; poussée de caméra `z` 80 → 120 sur `T.wait`, retour à 75 sur « Virement reçu ».
6. *« 0,00 € »* : allumé à 1 au lieu de 0,85, appui d'échelle 1,12 → 1 sur « 0 », avec un ressort amorti (z = 1) :
   aucun dépassement, comme le veut la règle « pas de rebond sur la typographie ».
7. *Boucle* : le mardi sort de `LOOP + 0.04` à `LOOP + 0.2` (en montant et en rapetissant), puis la C3 revient
   (`LOOP + 0.2` → `LOOP + 1.1`). À 29,6 s, il reste une liste à environ 20 % qui monte sur la C3 floue du fond (elle est
   là pendant tout le mardi) ; à 29,75 s, la liste est partie. Boucle mesurée : écart moyen 0,095 sur 255 entre
   `t00.000` et `t31.033`, inchangé.
8. *Rabat du mardi* : `flapH` 72 et premier bandeau à y = 686 (au lieu de 656). PRÊTE se pose au-dessus de
   « Contrôle · 78 € » (29,3 s). « Pochette : 78 € » descend de 30 px et reste dans la pochette.
9. *Petits textes* : libellé à 40 px, encre à 85 % (de 229 à 868 px) ; « Acheteur » et « Beau-frère » à 30 px ; lignes
   du contrôle à 44 px ; « refait le 6 oct. · 78 € » à 48 px. « bon jusqu'au 9 sept. » (32 px) devient « jusqu'au
   9 sept. » à 38 px en gras : à 38 px, la phrase entière dépassait la carte (325 px pour 286 de place). « sur ton
   compte » est retiré.
10. *Seconde sortie de la C3* : on la voit derrière la pile en retrait (17,1 · 17,3 · 17,5 s), toujours floue (c'est le
    décor).
11. *Clés* : zoom 1,7 sur la main et les clés (cadrage 0,4 / 0,5), `brightness(.82)` : plus de costume ni de grand
    rectangle blanc (17,3 et 17,4 s).
12. *Pochette du mardi* : x = 150, largeur 780 (de 150 à 930).
13. *Son* : le son « 20 min » est coupé à 0,35 s avec un fondu de 0,2 s. La piste bruitages tombe à −28 dBFS de crête de
    18,1 à 18,3 s (−12 avant). Rôle accent −4 → −7 dBFS. Mix : −14,2 LUFS, −3,7 dBTP. Le limiteur réduit encore jusqu'à
    −10,6 dB (12,19 s, la basse qui revient après la notification) et −9,4 dB à 17,76 s (−11 avant) ; 19,4 % du film
    dépasse toujours 3 dB de réduction. La cause : sans voix, la normalisation monte tout de 14,9 dB. À remesurer avec
    la vraie voix.
14. *En plus* : la caméra de l'ouverture glisse de 24 px au lieu de 14 (`x`, à partir de 0,02 s ; l'image 0 ne change
    pas). Avec VENDUE à l'arrêt jusqu'à 3,23 s, le contour de la C3 poussée par la caméra touchait la marge droite à
    2,9 s (densité 0,036 pour un seuil de 0,035). Après correction : 0,025 au plus de 1,0 à 3,2 s.

**Mesures après corrections**
- Zones sûres (méthode de `qa_video.py`) sur 20 images pleine définition (0 · 2,9 · 3,0 · 3,3 · 3,5 · 3,9 · 4,3 · 8,4 ·
  9,4 · 11,0 · 13,5 · 16,0 · 16,3 · 16,9 · 17,4 · 25,0 · 29,3 · 29,75 · 30,2 · 31,033 s), plus 1,0 → 3,2 s après le
  point 14 : aucune zone interdite touchée. Contenu net de x = 82 à 944 et de y = 244 à 1 462 (au-delà de 940 : le
  contour lumineux de la C3, sous le seuil).
- Aucune erreur `PAGEERR` ni `CONSOLE` (relevés, test téléphone, images fixes, `events.mjs`).

**Ce qui reste**
- Passages presque figés : 0,4 à 2,1 s (la caméra pousse, la bulle vibre et pulse, le reflet passe) et 30,1 à 31,05 s
  (retour à l'image 0). Rien n'a été ajouté.
- Répétition de forme de 6,5 à 15,5 s (carte de verre, pile qui descend) : le gag seul et la bande des clés cassent
  maintenant la forme à 15,7 et 17,0 s, le reste n'a pas changé.
- Au mardi, chaque carte perd son texte environ 0,2 s pendant qu'elle se replie (voulu, mais une image tirée à ce
  moment montre un bandeau vide : 23,0 · 23,5 · 24,0 s).
- Son : réduction du limiteur à remesurer avec la vraie voix ; rien n'a été écouté.
- Notes : pas réévaluées. Les planches à 0,1 s et le prochain round de critique les refont.

## Round 2 (9 octobre 2026, critique seule : le film n'a pas été modifié)

Film jugé : `film-mo12/film.js` de 12 h 44 (corrections du round 1 et dérive de caméra de l'ouverture), `index.html`
de 12 h 16, `events.json` de 12 h 25 (ses temps correspondent aux formules du `film.js` actuel), mix de 12 h 26.

**Matériel regardé**
- Planches toutes les 0,1 s refaites après les corrections : `renders/review/mo12-planche-0.1s-0-10.jpg`, `-10-20.jpg`,
  `-20-31.05.jpg` (311 images, regardées par tranches de 2 à 4 s).
- Test téléphone à 360 px refait : `renders/phone-mo12.png` (0 · 3,0 · 3,8 · 8,4 · 9,3 · 11,2 · 14,2 · 16,3 · 18,4 ·
  20,6 · 25,5 · 28,9 s).
- 41 images pleine définition dans `renders/stills-mo12/` (0 · 2,6 · 3,0 · 3,4 · 3,8 · 4,6 · 5,4 · 6,8 · 7,6 · 8,4 · 8,9 ·
  9,3 · 10,4 · 11,6 · 12,4 · 12,9 · 13,6 · 14,2 · 15,2 · 15,8 · 16,3 · 17,0 · 17,3 · 17,6 · 18,4 · 19,4 · 20,3 · 20,7 ·
  21,4 · 22,3 · 23,2 · 23,6 · 24,4 · 25,5 · 26,6 · 27,6 · 28,3 · 28,9 · 29,6 · 30,2 · 31,033 s).
- Son : `audio/mix-mo12.wav` et `audio/stems-mo12/` mesurés (RMS par seconde, attaque des bruitages aux gestes),
  `docs/mix_report-mo12.txt`. **Rien n'a été écouté.**
- Aucune erreur `PAGEERR` ni `CONSOLE` (images fixes, test téléphone, trois planches).

**Notes**

| Hook | Lisibilité 360 | Zones sûres | Mouvement | Variété / rythme | Marque | Voix (provisoire) | Son | Recette 47 / envie |
|---|---|---|---|---|---|---|---|---|
| 8 (6) | 7 (7) | 9 (9) | 7 (7) | 7 (6) | 8 (8) | 8 (8) | 7 (7) | 7 (7) |

Entre parenthèses : round 1. Pas livrable en l'état (lisibilité, mouvement, variété, son, recette < 8).

**Mesures**
- Zones sûres (méthode de `qa_video.py`) sur les 41 images pleine définition : une seule marge touchée, la gauche à
  3,4 s (densité 0,097) : c'est la C3 qui sort par la gauche avec son tampon, en mouvement. À 21,4 s, la pochette de la
  scène descend jusqu'à y = 1 504 pendant le rembobinage, sous le seuil (0,005). Contenu net de x = 82 à 944 et de
  y = 244 à 1 462 hors de ces deux instants ; la mention (y ≈ 1 462) reste le contenu le plus bas.
- Image 0 : écart-type 46,9. Boucle : écart moyen 0,095 sur 255 entre l'image 0 et 31,033 s.
- Plans presque figés (écart moyen < 0,6 sur 255 d'une image de planche à la suivante) : un seul, 18,4 → 19,4 s, la pause
  voulue sous « 20 min ».
- Horloge : cases centrées sur 541 px ; centre de l'encre à 550 px à 11:00, 545 px à 11:17 (les « 1 » sont étroits).
  Le critère du brief (encre à 540 ± 4) n'est pas tenu, mais l'écart fait 2 à 3 px à 360 : invisible.
- Voix provisoire : 72 mots écrits, 20,15 s de parole, 2,32 mots par seconde de film (MO5 : 2,53 ; MO9 : 2,36), écarts de
  0,30 à 0,45 s dans un même temps, aucun chevauchement, dernière réplique finie à 30,83 s pour un film de 31,05 s.
- Son : −14,2 LUFS, −3,7 dBTP avant AAC (rapport). Attaques des bruitages aux gestes : tampon VENDUE −1 ms, départ de
  la C3 +5 ms, carte 1 −2 ms, « 20 min » +40 ms. Limiteur toujours à −10,6 dB à 12,19 s, 19,4 % du film à plus de 3 dB
  de réduction (gain de normalisation +14,9 dB sans voix).

**Ce qui a progressé** : le hook tient la mesure à 3 s (11:20 et VENDUE à l'arrêt de 2,6 à 3,25 s, lisible à 360 px ;
la bulle du beau-frère entre pendant que la C3 sort, plus de centre vide) ; le gag est seul, de travers, lisible
(15 px à 360) ; la tasse ne touche plus les cartes ; « encore chaud. » reste complet 0,5 s (20,3 → 20,8 s) ; l'attente
se voit (retrait, anneau, poussée de caméra) ; la liste du mardi est complète, sans rien devant, de 25,7 à 29,4 s.

### Les 3 problèmes les plus graves

**1. La bulle pose la question suivante au moment où la carte répond à la précédente (7,8 à 9,7 s).** Une question
s'affiche à `T.q[i] + 0.06` et reste jusqu'à `T.q[i + 1] − 0.05` (`T.q[i] + 0.40`) ; sa carte part à
`T.c[i] = T.q[i] + 0.22` et son texte n'est plein qu'à `T.c[i] + 0.255` (`T.q[i] + 0.475`, ressort `P.card` et
`sm(0.75, 0.97, a)`), donc après la question suivante. Sur les 19 images de planche de 7,9 à 9,7 s, aucune ne montre une
question au-dessus de sa réponse : « Pas de gage ? » sur « Contrôle · 6 oct. » (8,4 s), « La cession ? » sur
« Situation adm. » (8,9 s), « La carte grise ? » sur « Cession » (9,3 s), aussi sur `phone-mo12.png`. C'est la scène de
l'aisance (chaque question a sa réponse dans la main) ; au revisionnage, elle se lit de travers. Corrections :
- `film-mo12/film.js`, lignes 48-49 : `T.q = [0, 1, 2, 3].map((i) => T.rabat + 0.42 + 0.45 * i)` et
  `T.c = T.q.map((x) => x - 0.1)`. La carte part 0,1 s avant sa question : texte plein à `T.q[i] + 0.155`, question pleine
  à `T.q[i] + 0.16`, la paire reste juste jusqu'à `T.q[i] + 0.40` (0,24 s sur 0,45), et aucune paire fausse n'est jamais
  pleine. `T.c[3]` passe de 9,315 à 9,115 s, avant le virement (9,569).
- `scripts/audio-mo12.py`, ligne 241 : la coche de la question (priorité 2) tomberait à 0,1 s de la note de la carte
  (priorité 1) et serait retirée par la règle des 0,12 s ; la retirer franchement (une note par paire, celle de la
  carte), puis `CUT=mo12 node scripts/events.mjs` et `python3 scripts/audio-mo12.py`.
- Vérifier : `CUT=mo12 node scripts/at.mjs 7.9,8.1,8.3,8.4,8.6,8.8,8.9,9.1,9.3,9.4 renders/review/mo12-at-qr.jpg`.

**2. Les rangements dans la pochette font passer du texte à travers du texte, et le liseré barre « + 2 700,00 € »
(9,4 · 9,7 · 13,6 · 15,3 · 15,8 · 17,1 s).** Deux causes dans la boucle `SD.forEach` de `paint()` : (a) une carte qui
devient bandeau (`k` de 2 à 3) garde son nom et sa valeur pendant tout le repli et traverse le liseré orange de la
pochette (calque `LPf`, au-dessus des cartes) : à 15,8 s, le trait coupe « + 2 700,00 € » comme une rature, le contraire
du sens ; à 13,6 et 15,3 s, « Cession × 2 » et ses signatures, puis « Vendu le 10/10/2026 · 11 h 16 », passent en
travers. (b) Le bandeau qui sort (`k` de 4 à 5) glisse de 1 312 à 1 332 en s'effaçant linéairement
(`1 − clamp(k − 4, 0, 1)`) pendant que le suivant arrive sur lui : « Situation adm. » sur « Contrôle » (9,7 et 13,6 s),
« Carte grise » sur « Cession » (15,8 s). C'est la règle du conteneur qui se transforme (`video/CLAUDE.md`), appliquée
au mardi au round 1 mais pas à la scène. Corrections (`film-mo12/film.js`) :
- après la ligne 352 : `const fold = sm(2.02, 2.2, k) * (1 - sm(2.8, 2.98, k)); if (fold > 0.001) for (const e of
  [s.d.name.e, s.d.value.e, s.d.name2 && s.d.name2.e, s.d.value2 && s.d.value2.e]) if (e) e.style.opacity =
  f3(+e.style.opacity * (1 - fold));` (le texte sort au début du repli et revient en bandeau, comme au mardi) ;
- ligne 342 : `(1 - clamp(k - 4, 0, 1))` → `(1 - sm(4.0, 4.3, k))`, et ligne 191 : `PY[5]` 1 332 → 1 380 (le bandeau
  sortant s'enfonce derrière la face de la pochette avant que le suivant le recouvre) ;
- vérifier `CUT=mo12 node scripts/at.mjs 9.4,9.5,9.7,13.55,13.65,15.3,15.75,15.85,17.1 renders/review/mo12-at-rangement.jpg`.

**3. Le verdict n'a pas le temps d'être lu, et le mardi sort en fondu sur la C3 (28,5 à 29,7 s).** « refait le 6 oct. ·
78 € » s'écrit de 28,47 à 29,17 s (`T.refait = M('tu') − 0.05`, 0,03 s par lettre), le rabat se ferme à 28,95 s, PRÊTE
frappe à 29,18 s, et tout le mardi s'efface de 29,49 à 29,65 s (`mK`, ligne 417) pendant que la C3 revient dès 29,65 s
(ligne 288) : le verdict chiffré n'est complet que 0,3 s, en même temps que le tampon, puis la liste passe à demi
transparente sur la C3 floue (planche 29,6 s, `t29.600.png`), ce qui reste un fondu enchaîné. C'est l'ingrédient 7
(« le verdict sur la même voiture »), ce qu'on enregistre avec la liste. Corrections (`film-mo12/film.js`) :
- ligne 41 : `refait: ME('mois') + 0.1` (28,17 s, juste après « sept mois : ») ; ligne 449 :
  `writeWord(achW2, t, T.refait + 0.22, 0.018, 18)` : la ligne est complète vers 28,7 s ;
- ligne 417 : `(1 - sm(LOOP + 0.22, LOOP + 0.36, t))` au lieu de `LOOP + 0.04 → + 0.2` (le mardi monte et rapetisse
  d'abord, `mOut`, puis disparaît) ; ligne 288 : `1 - eo(LOOP + 0.36, LOOP + 1.15, t)` ; ligne 286 :
  `pIn = eo(LOOP + 0.45, DUR - 0.08, t)`. Verdict complet environ 1 s, PRÊTE 0,5 s, et la C3 revient sur un fond vide.
- Vérifier `at.mjs 28.7,29.0,29.3,29.6,29.7,29.9,30.4` et l'écart de boucle (image 0 contre 31,033 s).

### Les autres problèmes

4. **Le gag n'est seul et plein que 0,9 s** (15,95 → 16,88 s) : les clés le font passer à 28 % (ligne 341,
   `dimF` du gag) alors que le brief le veut lisible jusqu'à l'extinction. Ligne 341 : `s.gag ? 0 : pileF` ; les clés,
   une image sans texte, entrent au-dessus de lui. Le gag reste plein jusqu'à « 20 min » (environ 1,7 s).
5. **La pile se rallume juste avant l'extinction** (17,65 → 17,8 s) : `pileF` (ligne 339) se termine à `T.big ± 0.1`
   alors que les calques ne s'éteignent qu'avec `big0` ; à 17,7 s, gag, code et bandeaux reviennent à pleine lumière
   pendant 0,15 s. Retirer le facteur `(1 - sm(T.big - 0.1, T.big + 0.1, st))` de `pileF` (et de la `dimF` du gag
   si le point 4 n'est pas appliqué).
6. **« MAR 6 OCT » est illisible à 360 px** (lettres d'environ 28 px, 9 px à 360, de 22,6 à 29,5 s), alors que c'est le
   repère du renversement et que « 1re REVENTE · SAMEDI » est passé à 40 px. Ligne 476 : `scale(1 - 0.5 * fShrink)` et
   `translateY(-111 * fShrink)` (lettres de 42 px, 14 px à 360 ; bas des palettes à y ≈ 305, au-dessus de la carte du
   contrôle d'achat à 340).
7. **« jusqu'au 9 sept. » se lit comme la fin de validité du contrôle** (27,2 → 29,5 s), juste au-dessus de « 2 ans pour
   rouler » : c'est la limite pour vendre. Ligne 250 : « vendre ≤ 9 sept. » ou « vente : 9 sept. » (même largeur).
8. **Descendantes de « < 6 mois à sa carte grise » sur le bord du bandeau** (25,8 → 29,5 s) : ligne 424,
   `grow = 52 * g2 + 52 * g6`, et ligne 437, `146` au lieu de `140`.
9. **Unités des anneaux à 20 px** (« j », « mois » : 7 px à 360) : « 15 » seul ne dit pas « 15 jours ».
   `film-mo12/index.html`, ligne 53, `.kp-unit` à 26 px (`top: 66px`).
10. **Les clés restent un rectangle clair avec la manche sombre** (17,1 → 17,8 s), plus lumineux que tout le film.
    Ligne 369 : `drawCrop(clesCv, IMG.cles, st - s.t + 0.4, 0.62, 0.55, 2.3)` (cadré sur les clés) et ligne 187 :
    `filter: brightness(.68) saturate(.85)`.
11. **Ouverture : 1,9 s sans élément nouveau** (0,36 → 2,22 s : poussée de caméra, reflet, onde de la bulle à 1,46 s,
    petite à 360), puis la bulle du beau-frère immobile de 3,9 à 4,8 s. Avec la boucle, l'image 0 reste presque
    inchangée de 30,3 s à 2,22 s du passage suivant. La voix portera ces passages ; à vérifier avec la vraie prise. Piste :
    sur « sonne », onde `1 + 0.5 * rp` (ligne 407, au lieu de 0,22) et pulsation `1 + 0.1 * pulse` (ligne 397) ; sur « croit pas », un
    tremblement de la bulle comme celui du gag.
12. **La bulle dit encore « Je suis devant. » de 5,5 à 7,8 s** pendant « Il demande les papiers » : la première question
    pourrait arriver avec la pochette (point 1 : `T.q[0]` à 7,87 s, sans gain réel) ; à garder en tête si la vraie prise
    allonge ce passage.
13. **Rembobinage** (21,3 → 21,5 s) : la pochette de la scène redescend derrière la mention jusqu'à y = 1 504. Conteneur,
    0,2 s, sans texte : acceptable.
14. **Son** : le limiteur réduit toujours jusqu'à −10,6 dB (12,19 s, retour de la basse) ; avec la vraie voix, le gain de
    normalisation baissera. Si la réduction reste au-dessus de 6 dB, baisser la musique de 3 dB pendant 0,4 s au retour
    de la basse (`audio-mo12.py`) plutôt que de laisser le limiteur pomper.

### FAIL de `qa_video.py`

Pas de MP4 à ce round (consigne) : pas de passage de `qa_video.py`. Sur les images fixes, avec sa méthode, aucun texte
dans une zone interdite (seule la C3 en mouvement touche la marge gauche à 3,4 s : un WARN attendu sur le rendu, pas un
FAIL), première image pleine, aucun plan figé hors de la pause voulue. Loudness et true peak : à mesurer sur le MP4.

### Ce qui n'a pas été vérifié

Le son n'a pas été écouté. Les attaques des bruitages sont mesurées sur 14 gestes seulement. La voix est estimée : la
prise de Simon décidera si le verdict (problème 3) et la question/réponse (problème 1) tiennent leur place.

### Corrections appliquées après la critique du round 2 (9 octobre 2026)

Fichiers modifiés : `film-mo12/film.js`, `film-mo12/index.html`, `scripts/audio-mo12.py`, `brief-mo12.md` (critère de
l'horloge, ligne du contrôle d'achat), `docs/timeline-mo12.md` (tic des questions retiré). Régénérés :
`film-mo12/events.json` (`q` 7,745 → 7,865 · 8,315 · 8,765 · 9,215 ; `c` 7,965 → 7,765 · 8,215 · 8,665 · 9,115 ;
`refait` 28,468 → 28,168 ; nouveau repère `croit` 4,411 ; `eclair` reste à 28,768), `audio/mix-mo12.wav`,
`audio/stems-mo12/`, `docs/mix_report-mo12.txt`, `renders/phone-mo12.png`. Les repères de la voix n'ont pas bougé :
`vo-mo12.py` n'a pas été relancé. Aucun appel ElevenLabs.

**Vérifié sur des images regardées** : `renders/review/mo12-r2-q.jpg` (16 instants de 7,75 à 9,6 s),
`mo12-r2-b.jpg` (25 instants : replis, gag, clés, mardi, verdict, boucle), `mo12-r2-c.jpg` (ouverture, clés, liste, à
l'échelle 0,5), recadrages à la définition native, 17 images pleine définition dans `renders/stills-mo12/` et le test
téléphone refait (`renders/phone-mo12.png`, 15 instants à 360 px). Les planches à 0,1 s n'ont pas été refaites.

**Les 3 problèmes graves**
1. *Question et réponse.* `T.q = T.rabat + 0.42 + 0.45 i`, `T.c = T.q − 0.1`. Chaque question est posée sur sa carte :
   « Le contrôle ? » sur « Contrôle · 6 oct. » (8,05 · 8,15 s), « Pas de gage ? » sur « Situation adm. » (8,5 · 8,6 s),
   « La cession ? » sur « Cession × 2 » (8,9 · 9,0 · 9,1 s), « La carte grise ? » sur « Carte grise · à barrer » (9,4 ·
   9,5 · 9,6 s), pareil à 360 px. Entre deux questions, la bulle reste vide 0,1 s pendant qu'elle change de largeur
   (7,9 · 9,25 s) : c'est la règle du conteneur qui se transforme. Le tic des questions est retiré du son ; l'horloge
   avance avec les cartes, donc 0,2 s plus tôt.
2. *Rangement dans la pochette.* Pendant le repli (k de 2 à 3), nom et valeur sortent au début et reviennent une fois
   le bandeau posé, `name2` et `value2` du virement compris. **En plus de la critique** : le chiffre et l'unité de
   l'anneau, les deux signatures et les tampons « signé » de la cession suivent le même repli, et « Vendu le… » et la
   signature de la carte grise sortent au début du repli (avant : un fondu linéaire sur tout le repli). Bandeau
   sortant : `1 − sm(4.0, 4.3, k)`, `PY[5] = 1380`. Vérifié à 9,25 · 13,55 · 13,65 · 15,3 · 15,75 · 15,85 s : aucun
   texte ne passe sous le liseré, « + 2 700,00 € » se replie sans texte, et le bandeau qui sort se trouve sous le
   suivant, pas derrière lui (15,75 s : « Cession » à environ 40 % sous « Carte grise », parti à 15,85 s).
3. *Verdict et sortie du mardi.* `refait = ME('mois') + 0.1` (28,17 s), `achW2` à 0,018 s par lettre : la ligne
   « refait le 6 oct. · 78 € » est complète vers 28,75 s, lisible avec PRÊTE (29,3 s) et jusqu'au départ (29,6 s), soit
   environ 0,9 s. L'éclair reste sur « refais » (`M('tu') + 0.25`, 28,77 s, inchangé). `mK` sort de `LOOP + 0.22` à
   `+ 0.36`, `mIn` de `LOOP + 0.36` à `+ 1.15`, `pIn` à partir de `LOOP + 0.45`. **En plus de la critique** : l'horloge
   (`cfIn`, `LOOP + 0.3` au lieu de `+ 0.2`) et le libellé (`LOOP + 0.38` au lieu de `+ 0.3`) reviennent 0,1 s plus tard.
   Sans ce décalage, une case « 1 » de l'horloge basculait sur la carte du contrôle d'achat à 29,75 s. Vérifié à 29,65 ·
   29,7 · 29,75 · 29,8 · 29,9 · 30,05 s : la liste monte et rapetisse sur le fond du mardi (la C3 floue à 28 %, la même
   que pendant toute la scène), l'horloge bascule à 29,8 s sur un fond vide, et la C3 revient ensuite.
   Boucle : écart moyen 0,095 sur 255 entre `t00.000` et `t31.033`, inchangé.

**Les autres points**
4. et 5. *Gag et pile* : le gag ne passe plus en retrait (`dimF = 0`) ; `pileF` garde la pile en retrait jusqu'à
   l'extinction. À 16,4 · 17,1 · 17,4 · 17,7 s, le gag est plein et la pile reste sombre. Le gag reprend l'échelle 0,92
   et sa place à l'arrivée des clés, sans recouvrir la carte des clés.
6. *« MAR 6 OCT »* : `scale(1 − 0.5 f)`, `translateY(−111 f)`. Lisible à 360 px (23,5 · 26,5 · 29,3 s), au-dessus de
   la carte du contrôle d'achat.
7. *« vendre ≤ 9 sept. »* remplace « jusqu'au 9 sept. » (lisible à 360 px, 28,8 s).
8. *Descendantes* : `grow = 52 g2 + 52 g6`, ligne à 146 ; le trait du total suit (`yTot` avec 104), 20 px sous le
   dernier bandeau. « Pochette : 78 € » reste dans la pochette (bas du texte vers y = 1 392, pochette à 1 410).
9. *Unités des anneaux* : 26 px, `top: 66px`.
10. *Clés* : `brightness(.68) saturate(.85)`. **Écart à la critique** : le cadrage proposé (0,62 / 0,55, zoom 2,3)
    montrait la manche et l'anneau au bord gauche, parce que les clés sont à 0,51 de la largeur du plan. Cadrage retenu :
    0,5 / 0,45, zoom 2,2 : l'anneau et les têtes de clés au centre, les doigts à gauche, la veste sombre à droite
    (simulé sur l'image source, vu à 17,4 s à 360 px).
11. *Ouverture* : onde `1 + 0.5 rp`, pulsation `1 + 0.1 pulse` (vus à 1,5 · 1,6 · 1,75 s) ; sur « croit pas » (4,41 s),
    la bulle du beau-frère tremble 0,32 s (rotation et décalage au bruit à graine fixe, temps du film : rien ne rejoue
    pendant le retour court), avec une vibration à −18 dB dans le son.
15. *Horloge* : le critère du brief porte désormais sur le centre des cases (540 ± 4 px).

**Mesures après corrections**
- Zones sûres (méthode de `qa_video.py`) sur 11 images pleine définition (0 · 8,1 · 9,4 · 13,6 · 15,8 · 17,4 · 28,9 ·
  29,6 · 29,75 · 30,2 · 31,033 s) : aucune marge touchée (densité au plus 0,011 à droite, le contour de la C3). Contenu
  net de x = 146 à 940 et de y = 244 à 1 462.
- Son : −14,2 LUFS, −3,7 dBTP ; 64 bruitages placés (68 avant : les 4 tics des questions), un retiré pour collision
  (comme avant). Le limiteur réduit toujours jusqu'à −10,6 dB à 12,19 s et 19,6 % du film dépasse 3 dB : sans voix, la
  normalisation monte tout de 14,9 dB.
- Aucune erreur `PAGEERR` ni `CONSOLE` (`at.mjs`, `render.mjs --at` et `--phone`, `events.mjs`).

**Ce qui reste**
- 12. La bulle dit « Je suis devant. » de 5,5 à 7,8 s pendant « Il demande les papiers » : à revoir avec la vraie prise.
- 13. Rembobinage : la pochette de la scène passe derrière la mention 0,2 s, sans texte. Laissé tel quel.
- 14. Son : la baisse de 3 dB de la musique au retour de la basse (12,19 s) attend la vraie voix, qui fera baisser le
  gain de normalisation. Rien n'a été écouté.
- Au mardi, chaque carte perd son texte environ 0,2 s pendant son repli (23,5 s : bandeau vide), comme au round 1.
- Entre deux questions, la bulle reste vide 0,1 s (7,9 · 9,25 s).
- Pendant 0,14 s (29,6 → 29,8 s), la liste du mardi rapetisse sur la C3 floue du fond, que la scène gardait déjà à 28 %.
- Planches à 0,1 s et notes : pas refaites ; le round 3 de critique les refait.
