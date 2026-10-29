---
name: "montage-viral"
description: "Monter une vidéo à partir d'un enregistrement fourni (Loom, visio, interview, podcast, face caméra, témoignage client) : une version longue YouTube et des extraits TikTok / Reels / Shorts, en choisissant d'abord le TYPE de montage (témoignage, interview/podcast, face caméra solo, ou vidéo courte UTOPICAR) et le STYLE (viral façon @yass.views, ou sobre). Coupes calées sur la voix (aucun mot mangé), interface cachée, cadrage qui suit la tête, sous-titres mot à mot, intercalaires, cartes, bruitages, rendu HyperFrames, contrôle et livraison ; pour utopicar, le style v4 (la flèche, le trait, la couleur pleine, une pastille, sous-titres mesurés, logo sonore, mix mesuré) et les séries de vidéos de 10 s pour Reels et Shorts tirées d'un tournage. Utilise ce skill dès que l'utilisateur veut monter, découper, clipper ou habiller une vidéo qu'il fournit (« monte cette vidéo », « fais-en des clips », « un YouTube et des TikTok », « en mode témoignage », « style yass », « refais le montage »), même s'il ne dit pas « montage »."
---

# Montage

Transforme un enregistrement existant en vidéos publiables. Le moteur (scripts Python + HyperFrames) a servi au
montage Henritokane (1 YouTube de 7 min 39 + 5 TikTok, oct. 2026) : il se copie dans chaque projet, seuls
`projet.py` et les découpages changent.

## Étape 0 — Choisir le type de montage (toujours en premier)

Sauf si l'utilisateur l'a déjà dit, pose ces 4 questions en un seul AskUserQuestion :

1. **Type** (references/types.md) :
   - *Témoignage* : une marque publie, un client parle d'elle.
   - *Interview / podcast* : questions-réponses, deux voix ou plus.
   - *Face caméra solo* : une personne parle (conseil, avis, histoire).
   - *Vidéo courte UTOPICAR* (voix off + B-roll) : ce n'est pas ce skill, passe à `montage-style-viral` (dépôt
     utopicar-repo).
2. **Style** (references/styles.md) :
   - *Viral @yass.views* : intercalaires bleu/blanc, serif italique, chiffres rouges, bruitages.
   - *Sobre* : coupes et sous-titres propres, rien d'autre.
   - *utopicar v4* (vidéos utopicar face caméra, par défaut pour elles) : la flèche du logo, le trait, la couleur
     pleine, une pastille, l'orange adouci, sous-titres mesurés, logo sonore et mix mesuré (« Style v4 » plus bas).
3. **Formats** : YouTube long + clips TikTok / clips seulement / YouTube seulement.
4. **Musique** : sans (voix + bruitages, par défaut) / avec un lit sous la voix (fichier fourni).

Déduis ensuite **qui publie** (titre du fichier, qui présente et conclut, à qui il parle) et annonce-le : tout texte
écrit à l'écran parle avec la voix de ce compte. C'est l'erreur qui a fait refaire Henritokane (« la vidéo est celle
d'Henritokane, pas du mec »).

## Étape 1 — Créer le projet et préparer la source (references/preparation.md)

```bash
python ~/.claude/skills/montage/scripts/init_projet.py "<dossier>/montage" "<source.mp4>" --nom <slug>
cd "<dossier>/montage"
python work/voix.py            # voix16k (transcription), voix_propre (le son des plans)
python work/analyse_cadre.py   # zone caméra proposée + mouvements de caméra → projet.ZONE, projet.SCENES
python work/transcrire.py      # en arrière-plan : work/words.json (Whisper large-v3)
python work/suivi.py --image 30  # image quadrillée → boîte de départ de chaque sujet → projet.SUIVI
python work/suivi.py           # suivi de la tête
python work/plans.py v_M v_C h_W h_C h_M   # plans recadrés, suivis, étalonnés (ceux des formats choisis)
```

Remplis `scripts/projet.py` au fil de l'eau (zone, scènes, suivi, hauteurs, noms propres, titres, noms de fichiers,
TYPE, STYLE, MUSIQUE). Vérifie la zone sur une image : l'interface (Loom, visio) ne doit jamais paraître.

## Étape 2 — Le fond avant la forme

1. Lis la transcription en entier (avec les temps). Repère qui parle quand.
2. Brief (`BRIEF.md`) : idée finale, public, enjeu, question principale, renversement fondé sur les faits dits ;
   les cinq listes (faits avec minutage, interprétations, hypothèses, exemples fictifs, [À FOURNIR]). Rien d'inventé :
   chiffres et phrases viennent de la source. Dans utopicar-repo, la grille `.claude/skills/motion-studio/references/scenario.md`
   s'applique.
3. Choisis les moments selon la recette du type (references/types.md) : 5 extraits de 25 à 50 s au plus, et le
   plan de la version longue (ouverture à froid, chapitres).
4. Chaque accroche s'écrit avec le skill `art-du-hook` (≥ 10 candidates sur 4 familles, 3 tests, note /20), avec la
   voix du compte qui publie.

## Étape 3 — Écrire les découpages (references/decoupage.md)

- `scripts/decoupage.py` : les extraits (plans, corrections, mots forts, accroche, cartes, coupes de sous-titres).
- `scripts/decoupage_yt.py` : la version longue (ouverture, corps en chapitres, corrections, mots forts, cartes).
- Les temps sont des **débuts de mots** de `work/words.json`, sinon le script plante.

## Étape 4 — Générer et vérifier

```bash
python scripts/gen.py clip-1 clip-2 …     # tiktok-N/
python scripts/gen_yt.py                  # youtube/
python work/diag_coupes.py                # niveau de la voix à chaque coupe
```

- Chaque coupe au-dessus de −30 dB se vérifie (references/coupes.md) : `python work/profil.py a b`, au besoin
  `python work/retranscrire.py a b`, puis `entree_src` / `sortie_src` dans le découpage. L'utilisateur a refusé des
  coupes qui mangeaient les fins de mots : on ne rend pas avant.
- `npx hyperframes check --json` dans chaque dossier : 0 erreur.
- Snapshots (`npx hyperframes snapshot --at …`) : l'accroche à 0,3 / 1,5 / 3 s (lisible, jamais sur le visage),
  chaque carte, la fin. Regarde-les vraiment (references/controle-livraison.md).

## Étape 5 — Rendre, contrôler, livrer (references/controle-livraison.md)

```bash
bash scripts/rendre.sh tiktok-1 … youtube   # rendu + −14 LUFS + planche → livraison/
```

Puis `qa_video.py` (format vertical / desktop), versions téléphone (< 30 Mo pour l'envoi à distance), `REVIEW.md`
(livrables, choix, mesures, ce qui n'a pas été écouté, [À FOURNIR]), Drive si demandé, envoi des fichiers.
Commence par une épreuve d'un clip quand le style ou le type est nouveau, puis déroule le reste.

## Style v4 utopicar : habillage, son, vidéos de 10 s

Le langage (règles, valeurs, contrôles) est décrit dans le dépôt utopicar, motion-studio
`references/langage-v4.md`. Ici, la marche à suivre avec le moteur :

```bash
# (après les étapes 1 à 3 : plans, mots, découpage v3 de base dans scripts/decoupage.py)
cp moteur/scripts/{v4.py,gen4.py,detour_propre.py,mesure_texte.js} scripts/   # habillage v4
cp moteur/work/{mix4.py,mix.py,poser_mix.py,mixkit_sfx.py} work/              # son v4
python work/mixkit_sfx.py prendre assets/audio/banque 2852 2582 2849 1564 1540 2854 1484 1538 1492 2909 \
       2380 386 1458 2930 1558 1560 1131 817 1566 1554                          # sons réels (licence Mixkit)
# accroche derrière la tête (plan large) : détourer puis nettoyer le masque
npx hyperframes remove-background work/detour-src.mp4 -o assets/plans/detour-clip-2.webm --device cpu
python scripts/detour_propre.py assets/plans/detour-clip-2.webm
python scripts/gen4.py clip-1 clip-2          # découpage : scripts/decoupage4.py (modèle : decoupage4.exemple.py)
npx hyperframes check tiktok-1 --json          # 0 erreur (faux positifs connus : langage-v4.md § 6)
python work/mix4.py clip-1 clip-2             # mix v4 → work/<clip>-mix4.wav, rapport work/<clip>-mix4.txt
bash scripts/rendre.sh tiktok-1 tiktok-2
python work/poser_mix.py clip-1 tiktok-1/renders/tiktok-1.mp4 livraison/<nom>.mp4 4   # synchro vérifiée
```

Le découpage v4 (`decoupage4.py`) reprend les plans de `decoupage.py` et décrit l'habillage : `accroche` (contexte,
gros texte, promesse, mot orange, y, tailles, `fin_src`, `derriere`, `ordre`), `pastille` (y, items
`(temps, chiffre | "x" | glyphe, nom)`, `fin_src`), `couleurs` (`(segment ou temps du mot, mot, "orange" | "noir",
sens)`), `annees`, `brolls`, `y_st` (1070 : colonne large ; 1130 : sous le menton d'un plan plus serré), `accents`.

**Vidéos de 10 s** tirées d'un ou plusieurs tournages : `courts/serie.py` (une fiche par vidéo : projet source, plans,
accroche, pastille ou couleur pleine, illustrations, `fin: False`) et `courts/court.py generer|rendre` (un
sous-processus par vidéo, chemin d'import du projet source d'abord), `courts/verifier.py` (check de chaque projet),
`courts/captures.py` (planches de revue). Ces quatre fichiers sont des modèles : adapter les chemins (`S`, `M4`) au
dossier de travail. Règles de la série (une idée par vidéo, aucun appel à l'engagement, boucle) : `langage-v4.md` § 7.

## Les pièges déjà payés (détail : references/pieges.md)

- Le témoin n'est pas le héros : le compte qui publie parle à l'écran, avec sa voix.
- Accroche « haut » seulement si la tête est basse dans le cadre ; sinon « bas » (elle remplace les sous-titres).
- Whisper étire des mots, fond deux phrases répétées en une, place mal les débuts : l'énergie fait foi.
- Deux plans consécutifs séparés par un vrai silence : coupe normale (le moteur le fait, vérifie quand même).
- Un mot fort ne doit pas déborder sur un chapitre ni sur une carte ; une carte ne couvre pas le visage de celui
  qui parle (forcer `cote`).
- Rien d'inventé à l'écran : prénoms seuls si l'orthographe du nom manque, aucun handle inventé.
