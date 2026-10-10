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

## Round 3 (9 octobre 2026, critique seule : le film n'a pas été modifié)

Film jugé : `film-mo12/film.js` de 14 h 06, `index.html` de 13 h 50, `lib/kit47-pochette.js` de 7 h 28, `events.json` de
14 h 04, mix de 14 h 04 (corrections du round 2). Depuis, seuls des documents ont changé (`find -newer film.js`).

**Matériel regardé**
- Planches toutes les 0,1 s : `renders/review/mo12-planche-0.1s-0-10.jpg`, `-10-20.jpg`, `-20-31.05.jpg`. Elles ont été
  tirées de 14 h 26 à 14 h 58, après la dernière modification du film, et montrent bien le film jugé : écart moyen de
  1,7 à 2,8 sur 255 avec les images fixes refaites au même instant, de 6,8 à 10,3 avec l'instant voisin. Les 311 images
  regardées seconde par seconde (10 images de 270 × 480), puis recadrées sur la liste du mardi (24,0 · 25,0 · 25,1 ·
  26,3 · 26,4 s) et sur le rembobinage (20,8 · 20,9 · 21,0 s).
- Test téléphone refait : `renders/phone-mo12.png` (0 · 2,9 · 4,2 · 8,9 · 9,5 · 11,5 · 14,6 · 16,4 · 20,5 · 25,5 ·
  26,9 · 28,9 s).
- 17 images pleine définition refaites dans `renders/stills-mo12/` (0 · 2,9 · 7,1 · 8,4 · 13,7 · 15,9 · 17,3 · 20,9 ·
  22,0 · 24,0 · 25,0 · 25,1 · 26,3 · 28,9 · 29,65 · 29,8 · 31,033 s).
- Montage 540p avec le son : `renders/draft-mo12-9x16.mp4`, refait (fini le 10 octobre à 2 h 50, après `film.js`, le
  mix et `vo-timing.json`), 31,05 s, 1 863 images à 60 i/s, AAC 48 kHz. `qa_video.py` passé le 10 octobre à 12 h 18
  (`renders/qa-mo12/`) ; planche des zones sûres regardée ; voir « FAIL de `qa_video.py` » plus bas.
- Son : `audio/mix-mo12.wav` et `audio/stems-mo12/` mesurés (réduction du limiteur toutes les 50 ms, attaque de chaque
  bruitage), `docs/mix_report-mo12.txt`. **Rien n'a été écouté.**
- Aucune erreur `PAGEERR` ni `CONSOLE` (`render.mjs --phone` et `--at`).

**Notes**

| Hook | Lisibilité 360 | Zones sûres | Mouvement | Variété / rythme | Marque | Voix (provisoire) | Son | Recette 47 / envie |
|---|---|---|---|---|---|---|---|---|
| 8 (8) | 7 (7) | 9 (9) | 7 (7) | 7 (7) | 8 (8) | 8 (8) | 7 (7) | 8 (7) |

Entre parenthèses : round 2. Pas livrable en l'état (lisibilité, mouvement, variété, son < 8).

**Mesures**
- Boucle : écart moyen 0,095 sur 255 entre `t00.000` et `t31.033` (inchangé).
- Plans calmes (écart moyen d'une image de planche à la suivante) : sous 0,6, seulement la pause voulue (18,4 → 19,4 s)
  et 30,9 → 31,0 s ; sous 1,0, en plus 14,4 → 15,1 s (la pile de la déclaration) et 27,8 → 28,4 s (le verdict qui
  s'écrit). L'ouverture bouge (caméra, reflet), mais rien de neuf n'entre avant les rouleaux de 2,22 s.
- Tailles à 360 px (police × échelle ÷ 3) : nom d'un bandeau 13,3 px, valeur 15,4 px ; **chiffre de l'anneau d'un
  bandeau 9,5 px, unité 5,4 px** ; chiffre de l'anneau d'une carte 15,3 px, unité 8,7 px ; lignes du contrôle 14,7 px ;
  « vendre ≤ 9 sept. » 12,7 px ; « Vendu le 10/10/2026 · 11 h 16 » 11,3 px ; « Acheteur », « Beau-frère » et la
  pastille « Essai » 10 px ; la mention 8,7 px.
- Voix provisoire : 72 mots écrits, 20,15 s de parole, 2,32 mots par seconde de film (MO5 : 2,53 ; MO9 : 2,36),
  3,57 mots par seconde de parole ; 0,30 s entre les phrases d'un même temps (0,45 s avant la phrase de boucle), aucun
  chevauchement ; dernière réplique finie à 30,83 s pour un film de 31,05 s. Cohérent avec le brief.
- Son, avant encodage : −14,2 LUFS, −3,7 dBTP (rapport). Chaque bruitage isolé attaque sur son repère (0 à 7 ms :
  sonnette, tampon VENDUE, bulle, cartes 1 à 4, tapotements, déclaration, « 0,00 € », code, cloche du gag, « 20 min »,
  tasse, « encore chaud. », bande, « Pochette : 78 € », « < 6 mois », contrôle d'achat barré) ; les repères suivent les
  gestes vus sur les planches. Limiteur : réduction de plus de 3 dB sur 22 % du film et de plus de 6 dB sur 17 coups
  (les quatre notes des cartes à 7,75 · 8,2 · 8,65 · 9,1 s, 12,0 → 12,55 s, 17,4 → 17,85 s, 29,1 s) : sans voix, la
  normalisation monte tout de 14,9 dB et chaque bruitage creuse la musique de 6 à 9 dB.

**Ce qui a progressé** : chaque question est posée sur sa carte (8,0 à 9,6 s, aussi à 360 px) ; les rangements dans la
pochette ne font plus passer de texte sous le liseré ; le gag reste seul et plein jusqu'à « 20 min » ; « MAR 6 OCT »
se lit à 360 px ; « vendre ≤ 9 sept. » ne se confond plus avec la fin de validité ; le verdict « refait le 6 oct. ·
78 € » reste complet environ 0,8 s, avec PRÊTE ; le mardi sort en montant et en rapetissant, et la C3 revient sur un
fond vide (29,65 · 29,8 s). La liste complète est propre de 26,4 à 29,4 s.

### Les 3 problèmes les plus graves

**1. Les durées de la pochette ne se lisent pas sur la liste à garder (22,9 → 29,5 s).** Le brief promet « les cinq
pièces de la pochette, leur durée de validité » et veut des bandeaux « lisibles (nom, badge, valeur) ». Dans un
bandeau, l'anneau passe à l'échelle 0,62 (`lib/kit47-pochette.js`, `paintDoc`, `const s = lerp(1, 0.62, b)`) : chiffre
à 9,5 px et unité à 5,4 px à 360. Sur `phone-mo12.png` (25,5 et 26,9 s), on devine « 15 » et « 1 », jamais « j » ni
« mois » : quatre durées sur cinq (situation administrative, cession, déclaration : 15 jours ; carte grise : 1 mois)
manquent sur l'image qu'on enregistre. Seul le contrôle a sa règle en toutes lettres. Correction : dans un bandeau,
l'anneau cède la place à sa durée écrite.
- `lib/kit47-pochette.js` (module propre à MO12, aucun autre film ne le charge) : dans `doc()`, si `o.dur`, créer
  `D.dur = el('div', 'kp-dur', D.root)` avec le texte ; dans `paintDoc()`, `const dB = D.dur ? sm(0.85, 1, b) : 0`,
  opacité de `D.badge.r` multipliée par `1 − dB`, `set(D.dur, dB)` et `translate(22px, ${(o.hb − 38) / 2}px)` (le texte
  entre une fois le bandeau formé), et `x0 = lerp(168, D.dur ? 184 : 104, b)` quand le bandeau a une durée.
- `film-mo12/index.html` : `.kp-dur{position:absolute;left:0;top:0;font:700 38px Clash;line-height:38px;color:#ffb38a;white-space:nowrap}`
  (12,7 px à 360).
- `film-mo12/film.js`, `MD` : `dur: '6 mois' | '15 j' | '15 j' | '1 mois' | '15 j'`, et les lignes `xl2`, `xl6` à
  `translate(184px, …)` au lieu de 104. Place mesurée sur le test téléphone : « Déclaration · ANTS » fait 356 px et
  finirait à 540 pour « 0 € » à 637 ; « Carte grise » finirait à 381 pour « à barrer » à 511 (à vérifier avec
  `KP.textW`).
- Vérifier : `CUT=mo12 node scripts/render.mjs --phone 24.0,25.5,26.9,28.9` : cinq durées lisibles à 360 px.

**2. La règle du contrôle arrive dans le désordre (24,0 → 26,4 s).** C'est la phrase à garder (« deux ans pour rouler,
six mois pour vendre ») et chaque ligne entre par-dessus la liste. À 25,0 s (`t25.000.png`), « 2 ans pour rouler » est
à moitié allumé sur « Situation adm. », pendant que le bandeau de la déclaration, qui tombe à travers la liste, cache
« Cession » ; à 25,1 s, « Déclaration · ANTS » a retrouvé son texte et se pose sur « Carte grise », 50 px au-dessus de
sa place ; à 26,3 s, « < 6 mois à sa carte grise » est à moitié allumé sur le haut de « Situation adm. ». Trois causes
dans `film-mo12/film.js`, section M :
- `set(xl2, g2)` et `set(xl6, g6)` : la ligne s'allume avec le ressort qui agrandit le bandeau, et son cadre
  (`94 + 10(1 − g)` à `+ 44`) déborde sur le bandeau suivant (`102 + 52 g`) tant que `g < 0,9`. → `set(xl2, sm(0.88,
  1, g2))`, `set(xl6, sm(0.88, 1, g6))` (le texte entre une fois la place faite, règle du conteneur qui se transforme).
- `T.l2 = M('deuxans') − 0.05` (24,895 s) tombe pendant la chute de la cinquième carte (`T.m[4] + 0.36` = 24,86 s). →
  après la définition de `T.m` : `T.l2 = Math.max(T.l2, T.m[4] + 0.36 + 0.3)` (25,16 s, la liste grandit une fois la
  dernière carte posée), puis `CUT=mo12 node scripts/events.mjs` et `python3 scripts/audio-mo12.py` (la note
  « 2 ans pour rouler » suit).
- `const dk = 1 - sm(0.02, 0.22, dr) * (1 - sm(0.72, 0.95, dr))` : le texte d'une carte qui tombe revient à 72 % de sa
  chute. → `sm(0.9, 1, dr)`.
- Vérifier : `CUT=mo12 node scripts/at.mjs 24.9,25.0,25.1,25.2,25.3,26.2,26.3,26.4 renders/review/mo12-r3-regle.jpg 0.5` :
  aucun texte sur un autre.

**3. Le rembobinage commence par un fondu enchaîné (20,79 → 21,04 s).** Le brief veut « “20 min” redevient 11:20 » ;
le film fond « 20 min », la tasse et « encore chaud. » pendant que la pile des cartes revient en fondu : à 20,9 s
(planche), « 20 min », « encore chaud. », le gag, « Code de cession » et les bandeaux sont superposés à demi. Cause :
`big0 = sm(T.big, T.big + 0.25, st) * (1 - sm(REW[0] - 0.05, REW[0] + 0.2, t))` éteint le chiffre en 0,25 s de film
alors que le temps du récit `st` ne recule presque pas (`io` cubique : 0,08 s de récit pendant les 0,1 premières
secondes), et les calques de la scène reviennent avec `1 − sm(0.2, 1, big0)`. C'est la seule transition du film qui
reste un fondu enchaîné (`video/CLAUDE.md`, direction interdite), au début de l'ingrédient 7. Correction
(`film-mo12/film.js`, `paint`) : un retour du chiffre en deux temps, comme l'aller.
- `const back = S(t, REW[0] - 0.04, { f: 2.4, z: 1 })` ;
- `big20` : `s20 × (1 − back)` dans sa transformation (il rapetisse à 0,457 et remonte en (686, 386), la case des
  minutes), `minS` suit ; `set(L20, sm(T.big, T.big + 0.25, st) * (1 - sm(0.8, 1, back)))` ;
- horloge : `mg` et `hg` multipliés par `1 − sm(0.7, 1, back)` (les cases « 11: » et « 20 » reviennent quand le 20
  s'y pose) ;
- `big0 = sm(T.big, T.big + 0.25, st) * (1 - sm(0.55, 0.9, back))` : le voile et la pile ne reviennent qu'une fois le 20
  rentré ; la tasse garde sa sortie actuelle (elle monte et rapetisse).
- Vérifier : `CUT=mo12 node scripts/at.mjs 20.8,20.86,20.92,20.98,21.04,21.1 renders/review/mo12-r3-rew.jpg 0.5` :
  jamais deux scènes superposées, le 20 se pose dans l'horloge.

### Les autres problèmes

4. **Son (mesuré, pas écouté)** : 17 coups à plus de 6 dB de réduction du limiteur, 22 % du film à plus de 3 dB ; la
   musique se creuse sous chaque note de carte. Tant que la voix est provisoire, `scripts/audio-mo12.py` peut plafonner
   le gain de normalisation (par exemple + 8 dB quand `VT['provisional']`) ou baisser les rôles `ui`, `chime` et
   `accent` de 4 dB ; cible : réduction ≤ 3 dB sur 95 % du film. Au retour de la basse (12,19 s), musique − 3 dB
   pendant 0,4 s (round 2, point 14). À remesurer avec la vraie voix.
5. **Transitoires de texte dans la scène** : à 8,4 s (`t08.400.png`), « Situation adm. » se lit au-dessus de la carte
   « Contrôle » pendant que sa carte monte derrière (le texte entre à `sm(0.75, 0.97, a)` : `sm(0.9, 1, a)`) ; à 13,7 s
   (`t13.700.png`), « 0,00 € » est coupé à mi-hauteur par la carte du virement. Une ou deux images chacune.
6. **Au mardi, une carte qui tombe cache la liste** (24,0 s : « Cession », vide, sur « Contrôle » et « Situation
   adm. ») : acceptable pendant le remplissage, à garder bref.
7. **L'éclair** (28,8 → 29,1 s) : un zigzag de 26 px entre la carte du contrôle d'achat et la liste ; à 360 px, une
   marque perdue (`phone-mo12.png`, 28,9 s). Le retirer, ou un trait qui va vraiment de « refait » au bandeau
   « Contrôle ».
8. **Ouverture** : rien de neuf n'entre de 0 à 2,22 s (le reflet, la vibration de 0,1 s, l'onde de « sonne » à 1,46 s),
   et l'image 0 revient immobile de 30,2 à 31,05 s. La voix portera ce passage ; à revoir avec la vraie prise, et à
   comparer à MO5, où « 1 500 € » puis « ? » s'écrivent dès l'image 0.
9. **La bulle dit « Je suis devant. » de 5,5 à 7,8 s** pendant « Il demande les papiers » (round 2, point 12) : inchangé.
10. **Variété** : de 7,8 à 17,0 s, la même forme (carte de verre, pile qui descend) revient neuf fois ; le gag et la
    bande des clés la cassent. Entre 13,8 et 14,85 s, seule la caméra bouge.
11. **Pendant « Contrôle : »** (24,16 s), l'image montre la carte « Carte grise » qui entre : une pulsation de l'anneau
    ou du liseré du bandeau « Contrôle » sur `M('controle')` ramènerait l'œil en haut de la liste.

### FAIL de `qa_video.py`

**Aucun FAIL.** `python3 ../.claude/skills/motion-studio/scripts/qa_video.py renders/draft-mo12-9x16.mp4 --out
renders/qa-mo12 --intentional 18.3-19.45` (la seule pause, sous « 20 min ») :

| Niveau | Contrôle | Détail |
|---|---|---|
| WARN | Zones sûres | marge gauche de 3,25 à 3,50 s |
| OK | Codec vidéo / audio | H.264 yuv420p 540 × 960 60 i/s, 31,05 s ; AAC 48 kHz |
| OK | Première image | écart-type 46,1 |
| OK | Images vides / plans figés > 0,9 s | aucun (aussi sans `--intentional` : la lueur et la vapeur bougent pendant la pause) |
| OK | Loudness (MP4) | −14,2 LUFS |
| OK | True peak (MP4 encodé) | −3,8 dBTP |
| OK | 2 premières secondes | −13,4 LUFS momentané contre −14,8 sur le reste |
| OK | Haut-parleur de téléphone | 26 % de l'énergie sous 150 Hz, 26,7 % entre 1 et 5 kHz |

Le WARN : regardé sur `renders/qa-mo12/draft-mo12-9x16-safe.png` et sur trois images du MP4 (3,25 · 3,35 · 3,45 s,
recadrées sur le bord gauche). C'est la C3 qui sort par la gauche, son contour et son tampon VENDUE en mouvement (le
« V » passe la marge de 60 px à 3,45 s, 0,25 s, pendant la sortie). Aucun texte posé dans une zone interdite : pas un
FAIL. La planche des zones sûres montre le reste du film dans la colonne (horloge, bulle, cartes, gag, liste, mention).

**Synchro des bruitages, mesurée sur le MP4** : le son du MP4 est calé sur `audio/mix-mo12.wav` (décalage 0 ms par
corrélation). Sur la piste des bruitages, niveau toutes les 10 ms autour de chaque repère : le son monte sur son repère
(à 20 ms près) pour la vibration (0,10), la sonnette (1,46), le tampon VENDUE (2,58), le tremblement de « croit pas »
(4,41), la pochette (7,01), les cartes 1 à 4 (7,77 · 8,22 · 8,67 · 9,12), les tapotements (9,57), la notification
(12,0), la carte grise barrée (12,75), la déclaration (13,48), « 0,00 € » (14,85), le code (15,20), le gag (15,73), les
clés (16,98), « 20 min » (17,72), la tasse (19,35), « 2 ans pour rouler » (24,90), « < 6 mois » (26,19), le contrôle
d'achat barré (27,90) et PRÊTE (29,18). Sur l'image (écart d'une image à la suivante, 90 × 160), pour les gestes nets,
le pic de mouvement suit le son de 0 à 0,14 s : tampon VENDUE + 20 ms, cartes 1 à 4 + 85 à + 135 ms (le ressort va
le plus vite après son départ), déclaration + 53 ms, code + 55 ms, « 20 min » + 63 ms, PRÊTE − 9 ms. Aucun bruitage en
avance sur son geste. Ailleurs (bulle du beau-frère, signatures, rabat), le pic de la fenêtre vient d'un autre
mouvement (la C3 qui sort, la caméra) : vérifié sur les planches, le geste tombe sur son son. Le moteur de 3,23 s
monte en 0,2 s avec la voiture ; les rouleaux de 2,22 s sortent de 7 à 9 dB dans les aigus (2,5 à 9 kHz), sous la fin
de la sonnette : discrets, à écouter avec la voix.

### Ce qui n'a pas été vérifié

Le son n'a pas été écouté. La voix est estimée : la vraie prise de Simon décidera de l'ouverture (0 → 2,2 s), de la
bulle pendant « Il demande les papiers » et du limiteur. Le hook B n'a pas d'image propre à juger (même film). Le
montage 540p n'a pas été regardé en lecture continue : ses images ont été comparées aux planches (zones sûres,
3,25 à 3,45 s).

### Corrections appliquées après la critique du round 3 (10 octobre 2026)

Fichiers modifiés : `film-mo12/film.js`, `film-mo12/index.html` (classe `.kp-dur`), `lib/kit47-pochette.js` (durée écrite
dans le bandeau, remise à zéro de `lit`), `scripts/audio-mo12.py`, `brief-mo12.md` et `docs/timeline-mo12.md`
(bandeaux, bulle « Les papiers ? », fin de l'éclair). Régénérés : `film-mo12/events.json` (nouveaux repères `ask`
5,639 et `ctl` 24,116 ; `l2` 24,895 → 25,16 ; `l6` 26,192 → 26,022), `audio/mix-mo12.wav`, `audio/stems-mo12/`,
`docs/mix_report-mo12.txt`, `renders/phone-mo12.png`, six images pleine définition dans `renders/stills-mo12/` (0 ·
13,75 · 20,98 · 25,5 · 28,9 · 31,033 s). Les repères de la voix n'ont pas bougé : `vo-mo12.py` n'a pas été relancé.
Aucun appel ElevenLabs. `lib/kit47.js`, `film-mo9/`, `film-mo10/` et leurs scripts n'ont pas été touchés.

**Vérifié sur des images regardées** : `renders/review/mo12-r3-fix-a.jpg` (rembobinage et liste, 24 instants),
`mo12-r3-fix-b.jpg` et `mo12-r3-fix-c.jpg` (rembobinage, bulle, cartes qui sortent de la pochette, verdict), les deux
planches demandées par la critique, `mo12-r3-regle.jpg` (24,9 → 26,4 s) et `mo12-r3-rew.jpg` (20,8 → 21,1 s), des
recadrages à la définition native, et le test téléphone refait (`renders/phone-mo12.png`, 15 instants à 360 px : 0 ·
2,9 · 5,9 · 8,45 · 13,75 · 16,4 · 20,9 · 21,04 · 24,0 · 24,16 · 25,5 · 26,9 · 28,9 · 29,3 · 31,033 s). Les planches à
0,1 s n'ont pas été refaites.

**Les 3 problèmes graves**
1. *Les durées de la pochette.* Dans un bandeau, l'anneau cède la place à sa durée écrite : `doc()` crée `D.dur` quand la
   spécification a `dur` (Clash 700 38 px, orange clair, 12,7 px à 360) ; `paintDoc()` la fait entrer entre `b = 0,85` et
   `1` (glissement de 16 px et échelle 0,86 → 1, pas seulement l'opacité) pendant que l'anneau rapetisse de 30 % et
   sort. Les noms partent de x = 184 (`durX`), les deux lignes du contrôle aussi. `MD` : `6 mois`, `15 j`, `15 j`,
   `1 mois`, `15 j`. Sur `phone-mo12.png` (25,5 · 26,9 · 28,9 · 29,3 s), les cinq durées se lisent, unité comprise ;
   « Déclaration · ANTS » finit loin de « 0 € », « Carte grise » loin de « à barrer ». Les cartes de la scène (7,8 →
   17 s) gardent leur anneau, lisible en grand ; leurs bandeaux, dans la pochette de la scène, gardent l'anneau réduit
   (ils passent : la liste à garder est celle du mardi).
2. *La règle du contrôle.* `T.l2 = max(M('deuxans') − 0,05, T.m[4] + 0,66)` = 25,16 s : la liste grandit une fois la
   cinquième carte posée. Les deux lignes entrent quand le bandeau a fait la place (`sm(0.85, 1, g)`, montée de 14 px).
   Le texte d'une carte qui tombe revient à `sm(0.9, 1, dr)`, à moins de 35 px de sa place. **En plus de la critique** :
   comme la ligne entre 0,2 s après le début de l'agrandissement, `T.l6` passe à `M('sixmois') − 0,22` (26,02 s) pour que
   « < 6 mois à sa carte grise » se pose sur « six mois » (26,24 s), et les deux notes claires suivent le texte
   (`l2 + 0,2` = 25,36 s, `l6 + 0,2` = 26,22 s). La note « carte 5 rangée », que la note de « 2 ans » faisait retirer
   pour collision, revient. Vérifié sur `mo12-r3-regle.jpg` : 24,9 (la déclaration au-dessus de la liste), 25,0 (la
   carte qui tombe, sans texte, passe sur « Cession » : 0,1 s), 25,1 (elle finit sa chute, son texte à demi allumé sur
   sa propre ligne, sous « Carte grise »), 25,2 (liste propre), 25,3 (le bandeau grandit, sans texte), 26,2 (« 2 ans
   pour rouler » seul, le bandeau grandit encore), 26,3 et 26,4 (les deux lignes). Aucun texte sur un autre.
3. *Le rembobinage.* Le « 20 » revient en deux temps, comme à l'aller. `back` : ressort critique `{ f: 3.4, z: 1 }` lancé
   à `REW[0] − 0,06` (20,776 s), ramené à 1 à 96 % : il se pose à 21,011 s (`BKL`, calculé une fois). Le chiffre
   rapetisse vers la case des minutes (`s20 × (1 − back)`), « min » sort en premier ; son calque reprend peu à peu la
   caméra de l'horloge et perd son lent zoom, pour se poser dans la case ; le centre visé passe de 686 à 698 (milieu des
   deux cases des minutes, 630 et 766), ce qui vaut aussi pour l'aller. Le chiffre sort entre `back` 0,97 et 1, les
   cases reviennent entre 0,96 et 1. Le voile ne se lève qu'après la pose, de 21,011 à 21,171 s (temps du film) :
   pendant le rembobinage, `on20` et `st20` figent les facteurs pris sur le temps du récit, qui coupaient tout vers
   20,97 s quand ce temps repasse sous « 20 min ». La tasse garde sa sortie. Vérifié sur `mo12-r3-rew.jpg`,
   `fix-b` et `fix-c` : de 20,80 à 20,92 s, le 20 monte et rapetisse seul, la tasse et « encore chaud. » sortent vers
   le haut ; à 20,98 s, il se pose dans l'horloge (deux images de recouvrement avec les cases : le « 20 » géant est plus
   serré que les deux cases, environ 30 px d'écart par chiffre) ; à 21,04 s, « 11:19 » seul sur le voile ; à 21,10 s, la
   scène réapparaît sous l'horloge (11:18) et se rembobine. Aucune image ne superpose deux scènes. L'horloge ne
   montre « 20 » que deux images avant de redescendre (le temps du récit repasse 11:20 à 21,03 s).

**Les autres points**
4. *Son* (sans voix, comme le dit la critique). Rôles `accent`, `ui` et `chime` baissés de 4 dB ; étages de crête copiés
   de `audio-mo13.py` : sur la musique, compresseur doux (−28 dBFS avant normalisation, 2,5:1, moyenné sur 10 ms) puis
   détecteur de crête (−22 dBFS, 4:1, attaque 3 ms, relâche 150 ms), qui lisent la musique sans sa courbe d'élan ; sur
   les bruitages, détecteur de crête (−24 dBFS, 3:1, 1 ms / 80 ms). Les trois ne jouent que tant que la voix est muette.
   Musique − 3 dB pendant 0,4 s au retour de la basse (12,20 s). Résultat : réduction du limiteur au plus 5,7 dB
   (3,51 s), **2,8 % du film à plus de 3 dB** (19,6 % au mix précédent, 22 % mesuré par la critique), **aucun coup à
   plus de 6 dB** (17 mesurés par la critique) ; les étages prennent 1,2 dB à la musique en médiane, 5,1 dB au 95e centile, 8,8 dB au plus aux
   bruitages. Mix à −14,1 LUFS, −4,1 dBTP avant AAC. Les contrastes du mix tiennent : premier temps (0,19 → 0,29 s)
   + 2,1 dB au-dessus des 0,15 premières secondes (+ 2,7 sans les étages), retour de la basse + 6,2 dB (+ 6,5). Deux
   effets de bord : le rapport donne « premier temps à 0,002 s » (la mesure prend le premier échantillon au-dessus de
   la moitié de la crête des 0,5 premières secondes ; l'étage aplatit le coup de 0,2 s, la grille n'a pas bougé), et
   l'attente se creuse un peu moins (grave − 9,4 dB et niveau − 5,9 dB, contre − 11,0 et − 7,0). Une ligne du rapport
   donne maintenant le travail des étages et le nombre de coups à plus de 6 dB. Rien n'a été écouté.
5. *Textes transitoires de la scène.* Le texte d'une carte qui sort de la pochette entre à `sm(0.95, 1, a)` et la carte
   passe au premier plan à `a ≥ 0,95` (avant : texte dès 0,75, premier plan à 0,97). Vérifié : à 8,40 s, la carte
   « Situation adm. » monte derrière « Contrôle » sans texte ; à 8,45 s, elle passe devant et son texte entre ; à
   13,70 s, la déclaration est encore derrière le virement, sans texte (« 0,00 € » n'est plus coupé) ; à 13,75 s, elle
   est pleine. Le texte de la carte est plein vers `T.q + 0,18 s`, la question à `T.q + 0,16 s`.
7. *L'éclair* est retiré. Sur « refais » (`T.eclair` = 28,77 s), le bandeau « Contrôle » pulse (échelle 1,03, « 6 mois »
   1,2) et son « 78 € » s'allume en orange jusqu'au départ du mardi : il désigne le contrôle refait. Le son garde son
   repère. Vu à 28,8 · 28,9 · 29,1 · 29,3 s, et à 360 px (28,9 · 29,3 s).
9. *La bulle* dit « Les papiers ? » de 5,64 s (`M('demande') − 0,05`) à 7,87 s, avec le même changement de largeur que
   les autres questions. Vue à 5,9 · 6,5 · 7,3 s et à 360 px (5,9 s). Au rembobinage, elle repasse à « Je suis devant. »
   avant la fin (temps du récit 5,2 s) : l'image 0 ne change pas.
11. *« Contrôle : »* : le bandeau du contrôle pulse 0,36 s à partir de 24,116 s (`T.ctl`), « 6 mois » grossit. Vu à
    24,16 s (planche et 360 px).
- **Correction du contrat de rendu, en plus de la critique** : `paintDoc` ne rendait pas la couleur d'origine quand `lit`
  revenait à 0 ; la couleur dépendait de la dernière image peinte (au rembobinage, « 0,00 € » restait orange). Elle est
  maintenant remise à zéro : l'image ne dépend que de t.

**Mesures après corrections**
- Boucle : écart moyen 0,095 sur 255 entre `t00.000` et `t31.033` (inchangé : le début et la fin n'ont pas bougé).
- Aucune erreur `PAGEERR` ni `CONSOLE` (`at.mjs`, `render.mjs --at` et `--phone`, `events.mjs`).
- Montage 540p : **pas refait en entier.** Le rendu `--draft` lancé à 12 h 52 tournait à 6 s par image (trois Chromium
  se partageaient les 4 cœurs) et s'est arrêté à la limite d'une heure, à 9,78 s ; `ffmpeg -y` avait déjà effacé le
  montage du round 2. Le morceau est rangé dans `renders/review/mo12-r3-draft-partiel-0-9.8s.mp4` : `qa_video.py`
  (`renders/review/qa-mo12-r3-partiel/`) n'y trouve aucun FAIL (−14,2 LUFS et −4,1 dBTP sur ces 9,8 s, le même WARN de
  marge gauche : la C3 qui sort, de 3,25 à 3,50 s). `renders/draft-mo12-9x16.mp4` n'existe plus.

**Ce qui reste**
- 6. Au mardi, la carte qui tombe passe sur la liste (24,0 s : un bandeau vide sur « Contrôle » et « Situation adm. »,
  0,1 à 0,15 s) et chaque carte reste sans texte environ 0,2 s pendant son repli. Inchangé, comme la critique l'admet.
- 8. Ouverture : rien de neuf n'entre de 0 à 2,22 s, et l'image 0 revient immobile de 30,2 à 31,05 s. À revoir avec la
  vraie prise de Simon.
- 10. Variété : de 7,8 à 17 s, la même forme revient neuf fois ; de 13,8 à 14,85 s, seule la caméra bouge. Pas touché.
- 12. Les rouleaux de 2,22 s : pas touchés. La sonnette (rôle `chime`) est 4 dB plus bas sans voix, donc les rouleaux
  ressortent d'autant ; pas remesuré dans les aigus, pas écouté.
- Au rembobinage, deux images de recouvrement entre le « 20 » géant et les cases de l'horloge (20,98 s), comme à l'aller.
- Son : tout le réglage (rôles, étages de crête) ne vaut que sans voix ; à remesurer et à écouter avec la vraie prise.
- Planches à 0,1 s et notes : pas refaites.
- Montage 540p du film entier et `qa_video.py` dessus : à refaire (environ 3 h de rendu à la charge actuelle).

## Passe finale (voix réelle, 10 octobre 2026)

| hook | lisibilite | zones_sures | mouvement | variete | marque | voix | son | recette |
|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 9 | 7 | 7 | 8 | 8 | 6 | 8 |

Planches regardées : `renders/review/mo12-final-at.jpg` (14 instants, avant les corrections), `mo12-final-b` à `-f.jpg`,
`renders/phone-mo12.png` (10 instants à 360 px). Aucune erreur `PAGEERR` ni `CONSOLE`. Boucle : écart moyen 0,17 sur 255
entre 0 et 30,79 s.

**Corrections** (`film-mo12/film.js`, plus une ligne de `film-mo12/index.html`)
- *Hook décalé par la vraie voix* : VENDUE frappait à 2,42 s, avant « vendu » (2,72 s), et la C3 repartait 0,35 s plus tard.
  `stamp = M('vendue') − 0,08` (2,64 s), `go = ME('vendue') + 0,05` (3,10 s) : VENDUE reste à l'arrêt de 2,64 à 3,10 s.
  La bulle du beau-frère attend que la C3 ait presque quitté l'image (`bf` = 3,48 s, posée sur « beau-frère »).
- *Mardi* : la 5e carte n'était posée qu'à 25,0 s, « 2 ans pour rouler » entrait vers 25,45 s (« deux ans » : 24,78 s).
  `T.m = mardi + 0,22 + 0,5 i` (la première carte entre sur « Mardi ») : la liste grandit à 25,06 s, la ligne se lit à
  25,25 s. Toujours une carte par temps : un essai à 0,45 s faisait retirer quatre « rangée » par la règle de collision.
- *Lisibilité à 360 px* : bulle de l'acheteur à l'échelle 1,22 (« Je suis devant. » et les questions à 16 px, « Acheteur »
  à 12 px), `BUB.x` 215 et tasse à x = 745 pour garder le groupe centré (219 → 845) ; mention en 32 px et opacité 0,72
  (10,7 px) ; unité des anneaux en 28 px, opacité 0,92 (`.kp-unit`).
- *Textes coupés par le masque de x = 920* (« en cour » à 9,7 s, « Situation adr » à 22,95 s, « Impossib » à 3,6 s) :
  le texte d'une carte ou d'une bulle qui entre par la droite n'apparaît qu'une fois sorti du masque, en glissant avec elle.
- Régénérés : `film-mo12/events.json`, `audio/mix-mo12.wav`, `docs/mix_report-mo12.txt` (65 bruitages, aucun retiré,
  cartes du mardi sur les temps).

**Ce qui reste**
- Son (pas modifié, pas écouté) : −14,8 LUFS, −4,0 dBTP avant AAC ; normalisation + 11,2 dB, limiteur à plus de 3 dB sur
  36 % du film et 85 coups à plus de 6 dB, comme dans le mix livré avec la voix. Les étages de crête de `audio-mo12.py`
  ont été réglés sans voix : à reprendre (et à écouter) avant la livraison.
- « 2 ans pour rouler » arrive 0,45 s après « deux ans » ; au mardi, la carte qui tombe passe encore 0,1 s sur la liste.
- Variété (7,8 → 17 s) et ouverture (rien de neuf avant les rouleaux de 2,06 s) : inchangées.
- Montage 1080p, `qa_video.py` et planches à 0,1 s : pas refaits.
