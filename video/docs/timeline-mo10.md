# MO10 « Deux voitures » : déroulé, sources et fabrication

Brief : `brief-mo10.md` (8 octobre 2026). 32,6 s, 1080×1920, 60 i/s, en boucle (retour à l'image 0 à partir de
30,3 s). Le film suit la voix mot à mot (`audio/vo-mo10/vo-timing.json`).

## Les chiffres et leurs sources (vérifiés le 8 octobre 2026)

Montants arrondis, mention « Exemple · prix moyens constatés » à l'écran pendant tout le récit et sur la carte finale.

| Frais | Twingo | 207 | D'où vient le chiffre |
|---|---|---|---|
| Carte grise | 152 € (4 CV) | 186 € (5 CV) | cheval fiscal Île-de-France 2026 (34,475 €, abattement de 50 % après 10 ans, [eplaque](https://www.eplaque.fr/carte-grise/prix-cheval-fiscal.html)) + 13,76 € de redevances ([Ornikar](https://www.ornikar.com/permis/autour-voiture/immatriculation/carte-grise/prix)) ; méthode de MO5 et MO9 |
| Contrôle technique | 78 € | 78 € | prix moyen 2026 ([Groupama](https://www.groupama.fr/assurance-auto/conseils/prix-controle-technique/)) |
| Contre-visite | — | 25 € | fourchette 10 à 45 € (même source) |
| Assurance, par mois | 40 € | 40 € × 2 | hypothèse de MO5, dans la fourchette des comparateurs 2026 pour le tiers : 35,57 € ([JeChange](https://www.jechange.fr/assurance/auto/prix)), 36,85 € ([Selectra](https://selectra.info/assurance/guides/auto/prix)), environ 53 € ([LeComparateurAssurance](https://www.lecomparateurassurance.com/assurance-auto/comparatif/prix)) |
| Vidange | 110 € | 110 € | petit moteur essence, 80 à 140 € ([Euromotor](https://euromotor.fr/blog/prix-vidange-voiture-2026-ou-moins-cher/)) |
| 2 pneus posés | 160 € | — | ([Mecazen](https://mecazen.fr/pneus/185-65-r15), [Carter-Cash](https://www.carter-cash.com/pneus/185-65-r15)) |
| Plaquettes avant | — | 140 € | ([Goodmecano](https://www.goodmecano.com/reparation-automobile-par-marque/peugeot/208/remplacement-jeu-plaquettes-de-frein-avant-39)) |
| Nettoyage | 20 € | 20 € | fait soi-même (MO5) |
| Essence, visites | — | 40 € | hypothèse de MO5 |
| Batterie à plat | — | 110 € | hypothèse de MO5 (batterie de citadine) |
| Annonce remontée × 3 | — | 96 € | hypothèse de MO5 (32 € l'option) |
| **Amende, stationnement abusif** | — | **35 €** | plus de 7 jours au même endroit de la voie publique : article R417-12 du Code de la route, contravention de 2e classe, 35 €, fourrière possible ([Legipermis](https://www.legipermis.com/infractions/stationnement-abusif-amende.html), [Ornikar](https://www.ornikar.com/permis/conseils-conduite/stationnement/types/abusif), [Digischool](https://www.digischool.fr/articles/auto/arret-et-stationnement/stationnement-abusif-7-jours-amende-fourriere/)) ; une commune peut fixer une durée plus courte |
| **Total** | **560 €** | **920 €** | |

- Achat : 3 000 € chacune. Revente visée : 4 000 € chacune (calcul du débutant : 2 × 1 000 €).
- Twingo vendue au jour 8, au prix affiché : 4 000 − 3 000 − 560 = **440 €**, soit **55 € par jour**.
- 207 : prix baissé à 3 800 € (jour 18) et 3 700 € (jour 30) ; offre acceptée au jour 40 : 3 600 €.
  3 600 − 3 000 − 920 = **− 320 €**.
- Les deux : 440 − 320 = **120 €** en 40 jours, soit **3 € par jour**.

Les délais de vente, les baisses et l'offre sont l'exemple, pas une moyenne. Rien n'est promis : la mention le dit.

Le compteur « MARGE » (temps du récit) : 2 000 → 1 662 (cartes grises) → 1 506 (contrôles) → 1 426 (assurances) →
1 206 (vidanges) → 1 046 (pneus) → 906 (plaquettes) → 881 (contre-visite) → 841 (nettoyage) ; attente : 809 → 699 →
499 (baisse) → 459 → 424 (amende) → 324 (baisse) → 284 → 252 → 220 ; offre : **120**.

## Les voitures

Photos libres de Wikimedia Commons, **CC0** (aucun crédit obligatoire), traitées par `scripts/photos-mo10.py` : logo
et plaque effacés (un monogramme vu à travers le pare-brise aussi), retournées vers la gauche, détourées (BiRefNet),
bords décontaminés, étalonnées dans la charte, contour vectoriel pour le trait de lumière (`film-mo10/cars-contour.js`).
Aucun modèle n'est nommé à l'écran ni dans la voix.

| Rôle | Photo | Auteur |
|---|---|---|
| la première, vendue en 8 jours | [Renault Twingo 122150.jpg](https://commons.wikimedia.org/wiki/File:Renault_Twingo_122150.jpg) (Twingo II bleue, phase 2) | Trop86 |
| la deuxième, qui reste | [20240602 Peugeot 207.jpg](https://commons.wikimedia.org/wiki/File:20240602_Peugeot_207.jpg) (207 blanche, de profil) | Abraham |

La berline garée derrière la 207 sur la photo d'origine est retirée du masque (zone `erase`).

## Les plans réels

Mixkit, licence « Mixkit Stock Video Free License » (usage commercial libre, sans crédit obligatoire). Vidéos hors dépôt
(`assets/stock/mo10/`), séquences dans `film-mo10/seq/` (hors dépôt), refaites par :

```
python3 ../.claude/skills/motion-studio/scripts/mixkit.py get 241 13260 4716 45755 47585 31961 42136 33324 34140 49219 38501 22916 --out assets/stock/mo10
python3 ../.claude/skills/motion-studio/scripts/mixkit.py seq assets/stock/mo10/mixkit-<id>.mp4 film-mo10/seq/<nom> --start <s> --dur 4
```

| Nom | Mixkit | Début | Ce qu'on y voit | Où |
|---|---|---|---|---|
| signe | 241 | 1,0 | mains qui signent | cartes grises |
| assur | 241 | 6,0 | mains qui signent (autre passage) | assurances |
| ct, ct2 | 13260 | 1,0 / 6,0 | voiture sur un pont élévateur | contrôles, contre-visite |
| moteur, moteur2 | 4716 | 1,0 / 8,0 | mains dans un moteur | vidanges, plaquettes |
| pneu | 45755 | 1,0 | main gantée sur un pneu | pneus |
| eponge | 47585 | 1,0 | éponge sur une carrosserie | nettoyage |
| essence | 31961 | 1,0 | main sur une pompe | essence |
| phone | 42136 | 1,0 | main sur un téléphone | annonce remontée |
| capot | 33324 | 2,0 | capot ouvert au bord de la route | batterie |
| garee | 22916 | 1,0 | rétroviseur d'une voiture garée, ombres d'arbres | amende |
| cles | 34140 | 1,0 | main qui tend des clés | ventes |
| jours | 38501 | 2,0 | des jours rayés sur un calendrier | fond de l'attente, flou |
| calc | 49219 | 1,0 | calculs au crayon | fond de la carte finale, flou |

## La voix (étape 4)

Simon (`mvhJVdVoTWVUtL4keT7W`), eleven_v3, **une seule génération** (generations_count = 1, 580 crédits, estimation
faite avant), ouverture B dite à la fin de la même prise. Prise brute : 40,8 s (`audio/vo-mo10/takeA.mp3`).

```
Tu en achètes deux, mille de marge chacune : deux mille. [deadpan] Ton voisin, lui, compte les jours.
Jour un. Deux cartes grises, deux contrôles, deux assurances.
La première part en huit jours.
La deuxième… [sighs] reste.
Il négocie. Tu acceptes. Bénéfice : [short pause] cent vingt euros. [deadpan] Moins qu'avec une seule.
Ceux qui gagnent comptent en jours.
Ta première : cinquante-cinq euros par jour. Les deux ensemble : trois.
La deuxième, tu l'achètes au jour huit.
La prochaine fois que tu te dis…
[pause]
Ta deuxième voiture va manger la marge de la première.
```

- **Mots horodatés** par faster-whisper *medium* (`scripts/words-mo10.py`) : il relit le texte exact. Bornes recalées
  sur l'enveloppe (mesure à 20 ms) : « Bénéfice » (medium le plaçait 0,8 s trop tard), le soupir (16,16-16,72 s),
  « reste », « Ta », le début de l'ouverture B.
- **Pose** (`scripts/vo-mo10.py`) : × 1,2 partout (pas plus : MO9 à × 1,25 jugé « trop rapide »), 0,2 à 0,45 s entre
  les phrases, 2,4 s de silence pour l'attente, 0,6 s sur « 120 € ». « Jour un. » est dans la prise mais pas dans le
  film : la parole tient en 24,2 s (MO9 : 23,8 s) et le film en 32,6 s. Contrôle : la pose retranscrite par *medium*
  redonne tous les mots.
- Ouverture B posée à part (`vo-placed-B.wav`) : la phrase B à 0,10 s à la place des deux premières répliques.

```
 0,10  Tu en achètes deux, mille de marge chacune : deux mille.
 3,36  Ton voisin, lui, compte les jours.
 5,82  Deux cartes grises, deux contrôles, deux assurances.
 9,97  La première part en huit jours.
11,85  La deuxième… (soupir) reste.
16,34  Il négocie. Tu acceptes.
18,34  Bénéfice : 120 euros.
20,74  Moins qu'avec une seule.
22,58  Ceux qui gagnent comptent en jours.
24,40  Ta première : 55 euros par jour.
26,60  Les deux ensemble : 3.
28,18  La deuxième, tu l'achètes au jour 8.
30,75  La prochaine fois que tu te dis…
```

## Le déroulé (temps du film, calés sur les mots)

| t (s) | Image | Voix |
|---|---|---|
| 0,0 | **Image 0** : « 2 × 1 000 € » en Clash ; en bas, les deux voitures, contours tracés à la lumière (Twingo devant, 207 derrière). | « Tu en achètes deux, » |
| 0,6 · 1,4 | La lumière passe sur « 2 × » sur « deux », puis sur « 1 000 € » sur « mille ». | « mille de marge chacune : » |
| 2,7 | « = 2 000 € » s'écrit à la lumière, puis le « ? » en Fraunces. | « deux mille. » |
| 3,6 → 5,2 | Sur « voisin », la plume trace des bâtons de prisonnier sous le calcul, cinq par cinq, de plus en plus vite (15). « Ton voisin *compte les jours.* » | « Ton voisin, lui, compte les jours. » |
| 5,4 | Le calcul se replie vers le haut ; palettes « JOUR 1 » ; le compteur « MARGE 2 000 € » se construit. | |
| 6,0 · 7,1 · 7,9 | Débits « Cartes grises − 338 € », « Contrôles techniques − 156 € », « Assurances − 80 € » : tampon « × 2 », un point s'allume sur chaque voiture. | « Deux cartes grises, deux contrôles, deux assurances. » |
| 8,4 → 9,7 | Pluie : vidanges (× 2), 2 pneus (Twingo), plaquettes et contre-visite (207), nettoyage (× 2). Le compteur passe sous 1 000 (906), puis 841. | |
| 10,1 → 10,9 | JOUR 1 → JOUR 8 ; les premiers bâtons apparaissent sur les vitres de la 207. La Twingo démarre et sort par la gauche. « Virement reçu + 4 000 € », tampon « vendue ✓ ». | « La première part en huit jours. » |
| 11,8 | La 207 seule vient au centre et grandit. « Annonce · 4 000 € ». La nuit tombe, le calendrier qu'on raye passe flou derrière. | « La deuxième… » |
| 12 → 16 | JOUR 9 → JOUR 40, de plus en plus vite ; un bâton par jour sur les vitres (40) ; la poussière monte. Débits : annonce remontée (j. 12), batterie (j. 15), essence (j. 19), assurance (j. 31), annonce (j. 34, 37). Baisses : 4 000 → 3 800 (j. 18), → 3 700 (j. 30). Le gag seul (j. 26) : « Stationnement abusif · Amende − 35 € », tampon « le voisin a compté ». | (soupir) « reste. » puis silence |
| 16,3 | Bulle : « 3 600 € et je la prends *ce soir.* » | « Il négocie. » |
| 17,4 | « D'accord. » | « Tu acceptes. » |
| 18,1 | « Virement reçu + 3 600 € » ; le compteur roule de 220 à 120. | « Bénéfice : » |
| 19,3 | « BÉNÉFICE · LES DEUX 120 € » plein cadre, tout le reste s'éteint (la seule pause). | « cent vingt euros. » |
| 20,8 | « *Moins qu'avec une seule.* » s'écrit à la lumière. | « Moins qu'avec une seule. » |
| 21,8 → 22,5 | Rembobinage : la Twingo revient, bâtons et poussière s'effacent, les débits remontent, le compteur remonte. | |
| 22,6 | Fond chaud (calculs flous). « Ceux qui gagnent / *comptent en jours.* » | « Ceux qui gagnent comptent en jours. » |
| 24,3 → 27,6 | Carte « MARGE ÷ JOURS » : « Ta première · 440 € ÷ 8 jours » → compteur **55 € / jour** ; « Les deux ensemble · 120 € ÷ 40 jours » → **3 € / jour**. | « Ta première : 55 euros par jour. Les deux ensemble : 3. » |
| 28,2 | « La deuxième, tu l'achètes *au jour 8.* » | « La deuxième, tu l'achètes au jour 8. » |
| 30,3 → 32,6 | La carte s'efface ; le calcul et les deux voitures reviennent dans le cadre exact de l'image 0. | « La prochaine fois que tu te dis… » |

Zones sûres : rien de lisible au-dessus de y = 246 ; compteur 272-494, palettes 584-700, débits 800-984, annonce
1009-1081, voitures jusqu'à y = 1461 (au-dessus de 1480, avertissement de MO5 corrigé) ; carte finale 500-1034,
verdict 1170-1330, mention 1404.

## Publication (proposition)

- Ouverture publiée : A. Même créneau que MO5 (jour et heure à noter dans le journal de la recette).
- Légende, sans appel à l'action : « Deux voitures d'un coup pour aller plus vite en achat-revente : le calcul que
  personne ne fait. Exemple chiffré, prix moyens constatés. »
- Hashtags (jeu A débutants de `docs/hashtags_test.md`) : #achatrevente #achatreventevoiture #voitureoccasion #entrepreneur
- Couverture : `renders/poster-mo10.png` (5,25 s : le calcul complet, les bâtons du voisin, les deux voitures).
- Sous-titres : `renders/9x16-mo10.srt`.

## Contrôle et livraison (8 octobre 2026)

Rendu : `CUT=mo10 MB=4 PARTS=4 PART=<i> node scripts/render.mjs --all` (4 parties en parallèle, flou de bougé sur les
gestes rapides), environ 47 min par passe sur 4 cœurs, puis `--assemble`.

| Round | Ce qui a été corrigé | Mesures |
|---|---|---|
| maquette (planches 0,1 s) | ouverture trop immobile de 0 à 2,7 s → « +1 000 € » sur chaque voiture, qui montent se fondre dans le total ; carte « par jour » trop tardive → elle arrive sur « comptent en jours » ; retour de boucle en fondu → la carte part vers le haut, le calcul et les voitures reviennent ; tampon du gag sur le montant, poussière en voile uniforme, débits qui se chevauchaient | — |
| 1 (MP4) | — | aucun FAIL ; −14,4 LUFS, −4,0 dBTP ; WARN zones sûres : « ? » de l'ouverture et « MARGE » dans les bandes TikTok |
| 2 | calcul ramené à 700 px de large, compteur rapproché du plan, 207 entre x = 60 et 940, légende du voisin plus grande | aucun FAIL ; WARN seulement sur des cartes en mouvement |
| 3 (MP4 livré, retour de l'utilisateur) | **chiffres « par jour » coupés** : fenêtres de 84 × 150 px pour des chiffres de 150 px → fenêtres à la taille du chiffre (96 × 170 px, 132 px), roulement chiffre par chiffre qui s'arrête pile, « € / jour » sur la ligne du chiffre ; **espace des milliers invisible** dans Clash (« 1000 », « 4000,00 », « 3800 ») → espaces élargies partout ; « € » de l'annonce coupé ; tampon du gag qui recouvrait « −35,00 € » ; 0,7 s d'écran presque vide après le rembobinage → la carte arrive dès la fin du rembobinage, titre plus grand | voir ci-dessous |

Mesures du film livré (`renders/qa/9x16-mo10-qa.md`, `scripts/review.py mo10-r2`) :
- H.264 yuv420p 1080 × 1920, 60 i/s, 32,60 s ; AAC 48 kHz.
- −14,4 LUFS intégrés, true peak −4,0 dBTP mesuré sur le MP4 ; son dès l'image 0 (−12,9 LUFS sur les 2 premières
  secondes) ; 43 % de l'énergie sous 150 Hz (téléphone OK). Voix au-dessus de la musique de 7 à 15 dB par réplique.
- Première image pleine, aucune image vide, aucun plan figé de plus de 0,9 s (deux de plus de 0,6 s : la pause voulue
  sur « 120 € » et la fin « tu te dis… », caméra lente).
- Boucle : écart moyen image finale / image 0 = **0,42** sur 255 (MO5 0,57 ; MO8 0,74).
- Zones sûres : WARN restant sur des cartes **en mouvement** (débits qui entrent par la droite à 6,0, 8,8 et 15,8 s,
  virement qui sort par la gauche à 12,0 s, carte finale qui sort par le haut à 30,3 s) ; aucun texte arrêté dans une
  zone interdite (vérifié sur `9x16-mo10-safe.png`).
- Lecture à 360 px : `renders/review/mo10-r2-phone.png` ; couverture lisible à 200 px de large.

Notes (sur 10) : hook 8, lisibilité 8, mouvement 8, variété 8, marque 8, synchro son 8. Le son a été mesuré et calé
sur les mots ; il n'a pas été écouté par un humain.

Fichiers : `renders/9x16-mo10.mp4` (film), `renders/9x16-mo10-apercu.mp4` (aperçu léger 540 × 960),
`renders/poster-mo10.png`, `renders/9x16-mo10.srt`, `audio/vo-mo10/ecoute-mix.mp3`, `audio/vo-mo10/ecoute-voix-seule.mp3`.
Pistes séparées (hors dépôt, refaites par `scripts/audio-mo10.py`) : `audio/stems-mo10/`.
